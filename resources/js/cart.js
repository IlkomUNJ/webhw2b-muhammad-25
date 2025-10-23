
const productData = {
    '1': { price: 32900, title: 'X15 TWS Wireless Bluetooth Headset', subtitle: 'X15 — Narvik', image: 'https://via.placeholder.com/80/222/fff?text=Img', oldPrice: 67800 },
    '2': { price: 32900, title: 'KY X55 Earphone Suara Stereo', subtitle: 'Ungu — KY FAST', image: 'https://via.placeholder.com/80/445/fff?text=Img' }
};

const formatRp = (num) => {
    if (num === 0) return 'Rp0';
    if (!num && num !== 0) return '-';
    return 'Rp' + new Intl.NumberFormat('id-ID').format(num);
};

function parsePriceValue(v) {
    if (typeof v === 'number' && Number.isFinite(v)) return Math.round(v);
    if (!v && v !== 0) return 0;
    const s = String(v);
    const digits = s.replace(/[^0-9]/g, '');
    return digits ? Number(digits) : 0;
}

function escapeHtml(s) {
    if (s === undefined || s === null) return '';
    return String(s)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
}

function getCurrentUser() {
    try {
        const raw = localStorage.getItem('user');
        if (!raw) return null;
        return JSON.parse(raw);
    } catch (e) {
        console.warn('getCurrentUser parse error', e);
        return null;
    }
}

function _readAllCarts() {
    try {
        const raw = localStorage.getItem('carts');
        return raw ? JSON.parse(raw) : [];
    } catch (e) {
        console.warn('parse carts error', e);
        return [];
    }
}

function _writeAllCarts(carts) {
    try {
        localStorage.setItem('carts', JSON.stringify(carts));
    } catch (e) {
        console.error('write carts error', e);
    }
}

function getCartForCurrentUser() {
    const user = getCurrentUser();
    if (!user || !user.email) return [];
    const namabuyer = user.email;
    return _readAllCarts().filter(it => it.namabuyer === namabuyer);
}

function updateCartQty(idproduct, qty) {
    const user = getCurrentUser();
    if (!user || !user.email) return false;
    const namabuyer = user.email;
    const all = _readAllCarts();
    let changed = false;
    for (let it of all) {
        if (it.namabuyer === namabuyer && String(it.idproduct) === String(idproduct)) {
            const newQ = Math.max(1, Math.round(Number(qty) || 1));
            if (it.qty !== newQ) {
                it.qty = newQ;
                changed = true;
            }
        }
    }
    if (changed) _writeAllCarts(all);
    return changed;
}

function removeFromCartLocalStorage(idproduct) {
    const user = getCurrentUser();
    if (!user || !user.email) return { ok: false, removedCount: 0, reason: 'no_user' };
    const namabuyer = user.email;
    const all = _readAllCarts();
    const filtered = all.filter(it => !(it.namabuyer === namabuyer && String(it.idproduct) === String(idproduct)));
    const removed = all.length - filtered.length;
    if (removed > 0) _writeAllCarts(filtered);
    return { ok: removed > 0, removedCount: removed };
}


function syncSelectAllState() {
    const all = Array.from(document.querySelectorAll('.item-checkbox'));
    const allChecked = all.length > 0 && all.every(i => i.checked);
    const selectAllEl = document.getElementById('selectAll');
    if (selectAllEl) selectAllEl.checked = allChecked;
}

function calculateTotal() {
    const checkboxes = document.querySelectorAll('.item-checkbox');
    let total = 0;
    checkboxes.forEach(cb => {
        if (cb.checked) {
            const id = cb.dataset.id;
            const qtyInput = document.querySelector('.qty-input[data-id="'+id+'"]');
            const qty = Math.max(1, Number(qtyInput?.value || 1));
            const priceAttr = cb.closest('.glass')?.dataset.price;
            const price = parsePriceValue(priceAttr);
            total += price * qty;
        }
    });
    const el = document.getElementById('totalText');
    if (el) el.textContent = total ? formatRp(total) : '-';
}

function changeQty(id, delta) {
    const input = document.querySelector('.qty-input[data-id="'+id+'"]');
    if (!input) return;
    let v = Number(input.value || 1) + delta;
    if (v < 1) v = 1;
    input.value = v;
    updateCartQty(id, v);
    calculateTotal();
}

function removeItem(id) {
    const res = removeFromCartLocalStorage(id);
    if (!res.ok) {
        console.warn('removeItem: tidak berhasil hapus dari localStorage', res);
    }
    const cb = document.querySelector('.item-checkbox[data-id="'+id+'"]');
    const card = cb?.closest('.glass') || document.querySelector('.glass[data-id="'+id+'"]');
    if (card) card.remove();
    updateCount();
    syncSelectAllState();
    calculateTotal();
}

function updateCount() {
    const remaining = document.querySelectorAll('.item-checkbox').length;
    const el = document.getElementById('countItems');
    if (el) el.textContent = `(${remaining})`;
}

function setupListeners() {
    const selectAllEl = document.getElementById('selectAll');
    if (selectAllEl) {
        const newSelectAll = selectAllEl.cloneNode(true);
        selectAllEl.parentNode.replaceChild(newSelectAll, selectAllEl);
        newSelectAll.addEventListener('change', function() {
            const checked = this.checked;
            document.querySelectorAll('.item-checkbox').forEach(cb => cb.checked = checked);
            calculateTotal();
        });
    }

    document.querySelectorAll('.item-checkbox').forEach(cb => {
        const nb = cb.cloneNode(true);
        cb.parentNode.replaceChild(nb, cb);
        nb.addEventListener('change', () => {
            syncSelectAllState();
            calculateTotal();
        });
    });

    document.querySelectorAll('.qty-input').forEach(inp => {
        const nip = inp.cloneNode(true);
        inp.parentNode.replaceChild(nip, inp);
        nip.addEventListener('input', () => {
            if (nip.value === '' || Number(nip.value) < 1) nip.value = 1;
            const id = nip.dataset.id;
            updateCartQty(id, Number(nip.value));
            calculateTotal();
        });
    });
}

function renderItems() {
    const container = document.getElementById('itemsContainer');
    if (!container) {
        console.warn('Container #itemsContainer tidak ditemukan di DOM.');
        return;
    }
    container.innerHTML = '';

    const carts = getCartForCurrentUser();
    if (!carts.length) {
        container.innerHTML = '<div class="glass"><div>Tidak ada item di keranjang. Tambahkan produk dulu.</div></div>';
        updateCount();
        const totalEl = document.getElementById('totalText');
        if (totalEl) totalEl.textContent = '-';
        setupListeners();
        return;
    }

    carts.forEach(item => {
        const id = String(item.idproduct);
        const snapshot = item.snapshot || {};
        const p = productData[id] || productData[id.replace(/^p/i, '')] || {
            price: snapshot?.price ? parsePriceValue(snapshot.price) : (snapshot?.priceRaw ? parsePriceValue(snapshot.priceRaw) : 0),
            title: snapshot.name || ('Product ' + id),
            subtitle: snapshot.subtitle || '',
            image: snapshot.image || 'https://via.placeholder.com/80/333/fff?text=NoImg',
            oldPrice: snapshot.oldPrice || 0
        };
        const qty = Number(item.qty || 1);

        const card = `
        <div class="shadow-[0_0_8px_#c5e943] glass rounded-lg p-4 flex gap-4 items-start" data-id="${escapeHtml(id)}" data-price="${parsePriceValue(p.price)}">
          <div class="flex-shrink-0 mt-1">
            <input class="item-checkbox w-5 h-5 accent-brand-green" type="checkbox" data-id="${escapeHtml(id)}">
          </div>

          <div class="w-16 h-16 rounded-md bg-white/5 flex items-center justify-center overflow-hidden">
            <img src="${escapeHtml(p.image)}" alt="produk" class="object-cover w-full h-full">
          </div>

          <div class="flex-1">
            <div class="flex items-start justify-between gap-3">
              <div>
                <div class="text-sm font-semibold text-white">${escapeHtml(p.title)}</div>
                <div class="text-xs text-gray-400 mt-1">${escapeHtml(p.subtitle || '')}</div>
              </div>

              <div class="text-right">
                <div class="text-white text-brand-green font-semibold">${formatRp(parsePriceValue(p.price))}</div>
                ${p.oldPrice ? `<div class="text-xs text-gray-400 line-through">${formatRp(parsePriceValue(p.oldPrice))}</div>` : ''}
              </div>
            </div>

            <div class="mt-3 flex items-center justify-between">
              <div class="flex items-center gap-3 text-gray-300">
                <button title="Hapus" class="text-white p-1 hover:bg-white/5 rounded" onclick="removeItem('${escapeHtml(id)}')">
                  <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.6" d="M19 7L5 7M10 11v6M14 11v6M6 7l1 12a2 2 0 002 2h6a2 2 0 002-2l1-12"/>
                  </svg>
                </button>
              </div>

              <div class="flex items-center gap-2">
                <button class="text-white px-3 py-1 rounded-full bg-white/5 hover:bg-white/6" onclick="changeQty('${escapeHtml(id)}', -1)">−</button>
                <input type="number" min="1" value="${qty}" class="text-white w-12 bg-transparent text-center text-sm outline-none qty-input" data-id="${escapeHtml(id)}" />
                <button class= " text-white px-3 py-1 rounded-full bg-white/5 hover:bg-white/6" onclick="changeQty('${escapeHtml(id)}', +1)">+</button>
              </div>
            </div>
          </div>
        </div>
        `;
        container.insertAdjacentHTML('beforeend', card);
    });

    setupListeners();

    updateCount();
    syncSelectAllState();
    calculateTotal();
}

const buyBtn = document.getElementById('buyBtn');
if (buyBtn) {
    buyBtn.addEventListener('click', () => {
        const totalText = document.getElementById('totalText').textContent;
        if (!totalText || totalText === '-') {
            alert('Pilih barang terlebih dahulu.');
            return;
        }
        alert('Checkout: ' + totalText);
    });
}

window.changeQty = changeQty;
window.removeItem = removeItem;
window.formatRp = formatRp;
window.renderItems = renderItems;
window.getCartForCurrentUser = getCartForCurrentUser;

renderItems();
