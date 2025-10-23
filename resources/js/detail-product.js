document.querySelectorAll('.thumb').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const src = btn.getAttribute('data-src');
        document.getElementById('mainImage').src = src;
        document.querySelectorAll('.thumb').forEach(t => t.classList.remove('thumb-active'));
        btn.classList.add('thumb-active');
    });
});

const dec = document.getElementById('dec');
const inc = document.getElementById('inc');
const qty = document.getElementById('qty');
dec.addEventListener('click', () => { let v = Math.max(1, parseInt(qty.value||1)-1); qty.value = v; });
inc.addEventListener('click', () => { let v = Math.max(1, parseInt(qty.value||1)+1); qty.value = v; });

document.getElementById('addCart').addEventListener('click', () => {
    alert('Ditambahkan ke keranjang: qty ' + qty.value);
});

document.getElementById('buyNow').addEventListener('click', () => {
    alert('Proceed to buy — qty ' + qty.value);
});