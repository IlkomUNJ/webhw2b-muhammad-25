// ---------- DATA PRODUK ----------
const products = [
    { id: 'p1', name: "Modern Wooden Chair", price: "Rp 450.000", image: "/resources/elemen/Modern Wooden Chair.jpg", rating: "4,6", reviews: 110, link: "/detail/p1" },
    { id: 'p2', name: "Minimalist Study Desk", price: "Rp 850.000", image: "/resources/elemen/Minimalist Study Desk.jpg", rating: "4,8", reviews: 95, link: "/detail/p2" },
    { id: 'p3', name: "Classic Wardrobe", price: "Rp 1.250.000", image: "/resources/elemen/Classic Wardrobe.jpg", rating: "4,7", reviews: 75, link: "/detail/p3" },
    { id: 'p4', name: "Comfort Sofa 3-Seater", price: "Rp 2.350.000", image: "/resources/elemen/Comfort Sofa 3-Seater.jpg", rating: "4,9", reviews: 180, link: "/detail/p4" },
    { id: 'p5', name: "Round Coffee Table", price: "Rp 570.000", image: "/resources/elemen/Round Coffee Table.jpg", rating: "4,4", reviews: 64, link: "/detail/p5" },
    { id: 'p6', name: "Bed Frame with Storage", price: "Rp 1.890.000", image: "/resources/elemen/Bed Frame with Storage.jpg", rating: "4,8", reviews: 143, link: "/detail/p6" }
];

const container = document.getElementById('productContainer');

function updateCartBadge() {
    const user = getCurrentUser();
    const badge = document.getElementById('cartCount');
    if (!badge) return; 
    if (!user || !user.email) {
        badge.textContent = '0';
        return;
    }
    const carts = getCartForCurrentUser();
    badge.textContent = carts.length || '0';
}

updateCartBadge();

window.updateCartBadge = updateCartBadge;


function parseRating(r) {
  if (r === undefined || r === null) return 0;
  if (typeof r === 'number') return Math.max(0, Math.min(5, r));
  const v = parseFloat(String(r).trim().replace(',', '.'));
  return isNaN(v) ? 0 : Math.max(0, Math.min(5, v));
}

const STAR_FULL = `<svg class="w-4 h-4 text-[#ffd54a]" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.955a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.449a1 1 0 00-.364 1.118l1.286 3.955c.3.921-.755 1.688-1.54 1.118l-3.37-2.449a1 1 0 00-1.176 0l-3.37 2.449c-.784.57-1.84-.197-1.54-1.118l1.286-3.955a1 1 0 00-.364-1.118L2.063 9.382c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.955z"/></svg>`;
const STAR_EMPTY = `<svg class="w-4 h-4 text-gray-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.955a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.449a1 1 0 00-.364 1.118l1.286 3.955c.3.921-.755 1.688-1.54 1.118l-3.37-2.449a1 1 0 00-1.176 0l-3.37 2.449c-.784.57-1.84-.197-1.54-1.118l1.286-3.955a1 1 0 00-.364-1.118L2.063 9.382c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.286-3.955z"/></svg>`;

function renderbintang(rating) {
  const val = parseRating(rating);
  const rounded = Math.max(0, Math.min(5, Math.round(val)));
  let html = '';
  for (let i = 0; i < rounded; i++) html += STAR_FULL;
  for (let i = 0; i < 5 - rounded; i++) html += STAR_EMPTY;
  return html;
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
  } catch (err) {
    console.error('Gagal parse user dari localStorage', err);
    return null;
  }
}

function _readAllCarts() {
  try {
    const raw = localStorage.getItem('carts');
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Gagal parse carts dari localStorage', err);
    return [];
  }
}

function _writeAllCarts(carts) {
  try {
    localStorage.setItem('carts', JSON.stringify(carts));
  } catch (err) {
    console.error('Gagal menyimpan carts ke localStorage', err);
  }
}

function addToCart(productOrId, opts = {}) {
    const { qty = 1, allowDuplicate = false } = opts;
    const user = getCurrentUser();
    if (!user || !user.email) {
        console.warn('Tidak ada user di localStorage. Pastikan user sudah login.');
        return { ok: false, reason: 'no_user' };
    }
    const namabuyer = user.email;

    const idproduct = (typeof productOrId === 'string') ? productOrId : (productOrId && productOrId.id);
    if (!idproduct) {
        console.error('addToCart: id produk tidak valid', productOrId);
        return { ok: false, reason: 'invalid_product' };
    }
    const prodSnapshot = products.find(p => p.id === idproduct) || null;

    const all = _readAllCarts();

    if (!allowDuplicate) {
        const existing = all.find(it => it.idproduct === idproduct && it.namabuyer === namabuyer);
        if (existing) {
        existing.qty = (existing.qty || 1) + qty;
        existing.addedAt = new Date().toISOString();
        if (!existing.snapshot && prodSnapshot) existing.snapshot = { name: prodSnapshot.name, price: prodSnapshot.price, image: prodSnapshot.image };
        _writeAllCarts(all);
        return { ok: true, action: 'updated', item: existing };
        }
    }

    const item = {
        idproduct,
        namabuyer,
        qty,
        addedAt: new Date().toISOString(),
        snapshot: prodSnapshot ? { name: prodSnapshot.name, price: prodSnapshot.price, image: prodSnapshot.image } : undefined
    };
    all.push(item);
    _writeAllCarts(all);
    updateCartBadge();
    return { ok: true, action: 'added', item };
 
}

function getCartForCurrentUser() {
  const user = getCurrentUser();
  if (!user || !user.email) return [];
  const namabuyer = user.email;
  const all = _readAllCarts();
  return all.filter(it => it.namabuyer === namabuyer);
}

function removeFromCart(idproduct, opts = {}) {
  const user = getCurrentUser();
  if (!user || !user.email) return { ok: false, removedCount: 0, reason: 'no_user' };
  const namabuyer = user.email;
  const beforeAll = _readAllCarts();
  const filtered = beforeAll.filter(it => !(it.namabuyer === namabuyer && it.idproduct === idproduct));
  const removedCount = beforeAll.length - filtered.length;
  if (removedCount > 0) _writeAllCarts(filtered);
  return { ok: removedCount > 0, removedCount };
}

function clearCartForCurrentUser() {
  const user = getCurrentUser();
  if (!user || !user.email) return { ok: false, reason: 'no_user' };
  const namabuyer = user.email;
  const all = _readAllCarts();
  const filtered = all.filter(it => it.namabuyer !== namabuyer);
  _writeAllCarts(filtered);
  return { ok: true };
}

function getAllCarts() {
  return _readAllCarts();
}

function renderProducts() {
  container.innerHTML = '';
  products.forEach((product, idx) => {
    const ratingNum = parseRating(product.rating);
    const unique = product.id || `prod-${idx}-${Date.now()}`;
    const link = product.link || '#';
    const reviews = product.reviews || 0;

    const card = document.createElement('div');
    card.className = "rounded-2xl shadow-[0_0_10px_#c5e943]  overflow-hidden border border-[#00ff99]/20 transition-transform transform hover:scale-105";

    const anchor = document.createElement('a');
    anchor.href = link;
    anchor.className = "block bg-[#0d0d0d] hover:shadow-[0_0_20px_rgba(0,255,153,0.12)] focus:outline-none focus:ring-2 focus:ring-[#00ff99]/40";
    anchor.setAttribute('aria-label', `Buka halaman produk ${product.name}`);

    anchor.innerHTML = `
      <div class="relative">
        <img src="${product.image}" alt="${escapeHtml(product.name)}" loading="lazy" class="w-full h-56 object-cover">
        ${product.badge ? `<span class="absolute top-3 left-3 bg-[#00ff99] text-black text-xs px-2 py-1 rounded">${escapeHtml(product.badge)}</span>` : ''}
      </div>

      <div class="p-4">
        <h3 class="text-[#00ff99] font-semibold text-lg leading-snug line-clamp-2">${escapeHtml(product.name)}</h3>

        <div class="mt-3 flex items-center justify-between">
          <div>
            <p class="text-[#00ff99] font-bold text-xl">${escapeHtml(product.price)}</p>
            ${product.originalPrice ? `<p class="text-sm text-gray-400">Harga normal <span class="line-through">${escapeHtml(product.originalPrice)}</span></p>` : ''}
          </div>

          <div class="flex items-center gap-2">
            <div class="flex items-center" aria-hidden="true">
              ${renderbintang(product.rating)}
            </div>
            <span class="text-sm text-gray-400">${ratingNum > 0 ? ratingNum.toFixed(1) : ''}</span>
          </div>
        </div>

        <div class="mt-3 flex items-center justify-between">
          <span class="text-gray-400 text-sm">${escapeHtml(product.store || 'Furnivo Official')}</span>

          <div class="flex items-center w-[50%]">
            <button type="button" class="add-to-cart-btn bg-[#00ff99] w-full text-black px-3 py-2 rounded-lg font-semibold hover:bg-[#00e68a] transition" aria-label="Tambah ke keranjang">add to cart</button>
          </div>
        </div>
      </div>
    `;
    card.appendChild(anchor);
    container.appendChild(card);
    const btn = card.querySelector('button.add-to-cart-btn');
    if (btn) {
      btn.addEventListener('click', (e) => {
        e.preventDefault();   
        e.stopPropagation();  
        const res = addToCart(product);
        if (res.ok) {
          const original = btn.innerHTML;
          btn.innerHTML = 'added ✓';
          btn.disabled = true;
          setTimeout(() => {
            btn.innerHTML = original;
            btn.disabled = false;
          }, 900);
        } else {
          if (res.reason === 'no_user') {
            alert('Silakan login terlebih dahulu untuk menambahkan ke keranjang.');
          } else {
            console.error('Gagal menambahkan ke cart:', res);
          }
        }
      });
    }
  });
}
function addProduct(prod) {
  const normalized = Object.assign({
    id: `p-${Date.now()}`,
    name: 'Unnamed',
    price: 'Rp 0',
    image: '',
    rating: 0,
    reviews: 0,
    store: 'Furnivo Official'
  }, prod);
  products.push(normalized);
  renderProducts();
}


renderProducts();

const searchInput = document.getElementById('searchInput');
if (searchInput) {
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  });
  searchInput.addEventListener('input', () => {
    const keyword = searchInput.value.toLowerCase().trim();

    const filtered = products.filter(p =>
      p.name.toLowerCase().includes(keyword)
    );

    container.innerHTML = '';
    filtered.forEach((product, idx) => {
      const ratingNum = parseRating(product.rating);
      const link = product.link || '#';

      const card = document.createElement('div');
      card.className = "rounded-2xl shadow-[0_0_10px_#c5e943] overflow-hidden border border-[#00ff99]/20 transition-transform transform hover:scale-105";

      const anchor = document.createElement('a');
      anchor.href = link;
      anchor.className = "block bg-[#0d0d0d] hover:shadow-[0_0_20px_rgba(0,255,153,0.12)] focus:outline-none focus:ring-2 focus:ring-[#00ff99]/40";
      anchor.innerHTML = `
        <div class="relative">
          <img src="${product.image}" alt="${escapeHtml(product.name)}" loading="lazy" class="w-full h-56 object-cover">
        </div>
        <div class="p-4">
          <h3 class="text-[#00ff99] font-semibold text-lg leading-snug line-clamp-2">${escapeHtml(product.name)}</h3>
          <p class="text-[#00ff99] font-bold text-xl mt-2">${escapeHtml(product.price)}</p>
        </div>
      `;
      card.appendChild(anchor);
      container.appendChild(card);
    });
  });
}

