const STORAGE_KEY = 'cart'; // единый ключ localStorage для корзины


function getCart(){
  try{
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  }catch(e){
    return [];
  }
}
function saveCart(cart){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  updateCartCount(); // обновляем бейдж
  try { window.dispatchEvent(new Event('storage')); } catch(_) {} // мягкая синхронизация
}
function updateCartCount(){
  const n = getCart().reduce((s,i)=> s + (Number(i?.qty)||0), 0); // суммарное qty
  document.querySelectorAll('.cart-badge').forEach(el => {
    el.textContent = n;
    el.setAttribute('aria-live','polite');
  });
}

function migrateCart(){
  try{
    const legacy = JSON.parse(localStorage.getItem('eshop_cart') || 'null');
    if(Array.isArray(legacy) && legacy.length){
      const current = getCart();
      const map = new Map();
      [...current, ...legacy].forEach(it => {
        const key = String(it?.id ?? it?.title ?? Math.random());
        const base = map.get(key) || {
          id: it?.id ?? null,
          title: it?.title ?? '',
          price: Number(it?.price) || 0,
          img: it?.img ?? '',
          qty: 0
        };
        base.qty += Math.max(1, Number(it?.qty) || 1);
        map.set(key, base);
      });
      const merged = Array.from(map.values());
      saveCart(merged);
      localStorage.removeItem('eshop_cart');
    }
  }catch(_) {}
}
function addToCart(product){
  const qty = Math.max(1, Number(product.qty)||1);
  const cart = getCart();
  const idx = cart.findIndex(i=>String(i.id)===String(product.id));
  if(idx>-1){
    cart[idx].qty = (Number(cart[idx].qty)||0) + qty;
  } else {
    cart.push({...product, qty});
  }
  saveCart(cart);
  animateCart();
}
function animateCart(){
  const el = document.getElementById('cartBtn') || document.querySelector('.icon-btn[href="cart.html"], .icon-btn');
  if(!el) return;
  el.classList.remove('bump');      // сброс если класс уже был
  void el.offsetWidth;              // рефлоу для перезапуска анимации
  el.classList.add('bump');         // запускаем анимацию
  setTimeout(()=>el.classList.remove('bump'), 600);
}


document.addEventListener('DOMContentLoaded', () => {
  migrateCart();
  updateCartCount();

  // Load catalog products only on catalog page
  if (document.getElementById('catalogContainer')) {
    loadProductsFromAPI();
  }

  // Render cart only on cart page
  if (document.getElementById('cartContainer')) {
    renderCart();
  }

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('button, a');
    if(!btn) return;

    if(btn.classList.contains('add-to-cart')){
      const card = btn.closest('.product-card');
      if(!card) return;
      addToCart({
        id: card.dataset.id,
        title: card.dataset.title,
        price: Number(card.dataset.price) || 0,
        img: card.dataset.img,
        qty: 1
      });
    }
  });

  const io = new IntersectionObserver((entries, obs)=>{
    entries.forEach(en=>{
      if(en.isIntersecting){
        en.target.classList.add('show');
        obs.unobserve(en.target);
      }
    });
  }, {threshold: 0.12, rootMargin: '50px'});
  document.querySelectorAll('.fade-in').forEach(el => io.observe(el));
});

window.addEventListener('storage', (e) => {
  if(!e || !e.key || e.key === STORAGE_KEY) updateCartCount();
});


function renderCart(){
  const container = document.getElementById('cartContainer');
  if(!container) return;
  const cart = getCart();
  if(cart.length===0){
    container.innerHTML = `<div class="card p-4"><p class="mb-0">Корзина пуста. <a href="catalog.html">Перейти в каталог</a></p></div>`;
    return;
  }

  let html = `<div class="table-responsive"><table class="table align-middle"><thead><tr><th>Товар</th><th>Цена</th><th>Кол-во</th><th>Итого</th><th></th></tr></thead><tbody>`;
  cart.forEach(item=>{
    const total = item.price * item.qty;
    html += `<tr data-id="${item.id}">
      <td>
        <div style="display:flex;gap:12px;align-items:center">
          <img src="${item.img || 'placeholder.png'}" style="width:72px;height:72px;object-fit:cover;border-radius:8px">
          <div>
            <div style="font-weight:700">${item.title}</div>
            <div class="text-muted small">Brand</div>
          </div>
        </div>
      </td>
      <td>₸ ${item.price.toLocaleString()}</td>
      <td><input class="form-control cart-qty" type="number" min="1" value="${item.qty}" style="width:110px"></td>
      <td class="cart-line">₸ ${total.toLocaleString()}</td>
      <td><button class="btn btn-sm btn-outline-danger remove-item">Удалить</button></td>
    </tr>`;
  });
  html += `</tbody></table></div>`;

  // totals
  const subtotal = cart.reduce((s,i)=>s + i.price*i.qty, 0);
  const shipping = subtotal > 50000 ? 0 : 1500;
  const grand = subtotal + shipping;

  html += `<div class="d-flex justify-content-end mt-3"><div style="max-width:420px;width:100%">
    <div class="card p-3">
      <div class="d-flex justify-content-between"><div>Промежуточный итог</div><div>₸ ${subtotal.toLocaleString()}</div></div>
      <div class="d-flex justify-content-between mt-2"><div>Доставка</div><div>₸ ${shipping.toLocaleString()}</div></div>
      <hr>
      <div class="d-flex justify-content-between" style="font-weight:800;font-size:18px"><div>Итого</div><div>₸ ${grand.toLocaleString()}</div></div>
      <button class="btn btn-success w-100 mt-3">Оформить заказ</button>
    </div>
  </div></div>`;

  container.innerHTML = html;

  // attach handlers
  container.querySelectorAll('.cart-qty').forEach(input=>{
    input.addEventListener('change', e=>{
      const tr = e.target.closest('tr');
      const id = tr.dataset.id;
      const qty = Number(e.target.value) || 1;
      const cart = getCart();
      const idx = cart.findIndex(i=>String(i.id)===String(id));
      if(idx>-1){
        cart[idx].qty = qty;
        saveCart(cart);
        renderCart(); // re-render
      }
    });
  });
  container.querySelectorAll('.remove-item').forEach(btn=>{
    btn.addEventListener('click', e=>{
      const tr = e.target.closest('tr');
      const id = tr.dataset.id;
      let cart = getCart();
      cart = cart.filter(i=>String(i.id)!==String(id));
      saveCart(cart);
      renderCart();
    });
  });
}

// ================================
// Загрузка товаров из MongoDB API
// ================================
async function loadProductsFromAPI() {
  try {
    const res = await fetch("/products");
    const products = await res.json();

    const container = document.getElementById("catalogContainer");
    if (!container) return; // не на странице каталога

    container.innerHTML = products.map(p => `
      <div class="product-card fade-in show"
           data-id="${p._id}"
           data-title="${p.name}"
           data-price="${p.price}"
           data-img="${p.imageUrl || ''}"
           data-desc="${p.description || ''}">
        
        <img src="${p.imageUrl || 'placeholder.png'}" alt="${p.name}">
        <h3>${p.name}</h3>
        <p class="text-muted">${p.brand} • ${p.category}</p>
        <p><b>₸ ${Number(p.price).toLocaleString()}</b></p>

        <div class="d-flex gap-2">
          <button class="btn btn-sm btn-primary add-to-cart">
            Add to cart
          </button>
        </div>
      </div>
    `).join("");
  } catch (err) {
    console.error("Failed to load products:", err);
  }
}
