const CART_KEY = 'cart';

function getCart() {
  return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartCount();
}

function updateCartCount() {
  const total = getCart().reduce((sum, item) => sum + item.qty, 0);
  document.querySelectorAll('.cart-badge').forEach(badge => {
    badge.textContent = total;
  });
}

function addToCart(product) {
  const cart = getCart();
  const existing = cart.find(p => p.id === product.id);

  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }

  saveCart(cart);
}

function renderCart() {
  const container = document.getElementById('cartContainer');
  if (!container) return;

  const cart = getCart();
  if (!cart.length) {
    container.innerHTML = '<p>Cart is empty</p>';
    return;
  }

  container.innerHTML = cart.map(p => `
    <div class="cart-item">
      <img src="${p.img}" width="60" onerror="this.src='/images/placeholder.png'">
      <span>${p.title}</span>
      <b>₸ ${p.price}</b>
      <small>x${p.qty}</small>
    </div>
  `).join('');
}

/*CATALOG */
let allProducts = [];

async function loadProducts() {
  try {
    const res = await fetch('/products');
    allProducts = await res.json();
    applyFilters();
  } catch (err) {
    const container = document.getElementById('catalogContainer');
    if (container) {
      container.innerHTML = '<p>Failed to load products</p>';
    }
  }
}

function applyFilters() {
  const container = document.getElementById('catalogContainer');
  if (!container) return;

  const category = document.getElementById('categoryFilter')?.value || 'All';
  const min = Number(document.getElementById('priceMin')?.value || 0);
  const max = Number(document.getElementById('priceMax')?.value || Infinity);

  const filtered = allProducts.filter(p =>
    (category === 'All' || p.category === category) &&
    p.price >= min &&
    p.price <= max
  );

  if (!filtered.length) {
    container.innerHTML = '<p>No products found</p>';
    return;
  }

  container.innerHTML = filtered.map(p => `
    <div class="product-card"
         data-id="${p._id}"
         data-title="${p.name}"
         data-price="${p.price}"
         data-img="${p.imageUrl}">
      <img src="${p.imageUrl}" onerror="this.src='/images/placeholder.png'">
      <h3>${p.name}</h3>
      <p>${p.category}</p>
      <b>₸ ${p.price}</b>
      <button class="add-to-cart">Add to cart</button>
    </div>
  `).join('');
}

/* INIT */
document.addEventListener('DOMContentLoaded', () => {
  updateCartCount();

  if (document.getElementById('cartContainer')) {
    renderCart();
  }

  if (document.getElementById('catalogContainer')) {
    loadProducts();

    document.getElementById('categoryFilter')
      ?.addEventListener('change', applyFilters);
    document.getElementById('priceMin')
      ?.addEventListener('input', applyFilters);
    document.getElementById('priceMax')
      ?.addEventListener('input', applyFilters);
  }

  document.addEventListener('click', e => {
    if (!e.target.classList.contains('add-to-cart')) return;

    const card = e.target.closest('.product-card');
    if (!card) return;

    addToCart({
      id: card.dataset.id,
      title: card.dataset.title,
      price: Number(card.dataset.price),
      img: card.dataset.img
    });
  });
});
