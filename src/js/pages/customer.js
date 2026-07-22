/* ============================================================
   CUSTOMER STOREFRONT PAGE
   ============================================================ */

import * as api from '../api.js';
import * as store from '../store.js';
import { renderNavbar } from '../components/navbar.js';
import { showToast } from '../toast.js';

let currentProducts = [];

export async function renderCustomer(container) {
  container.innerHTML = `
    <div class="dashboard-layout">
      <div class="dashboard-content" style="max-width: 1400px;">
        <div class="dashboard-header" style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h1>Storefront</h1>
            <p>Browse our latest products and exclusive gear.</p>
          </div>
          <button class="btn btn-primary" id="open-cart-btn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
            Cart (<span id="cart-count">0</span>)
          </button>
        </div>

        <div class="products-grid anim-stagger" id="storefront-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: var(--space-6);">
          <div class="empty-state" style="grid-column: 1/-1;">Loading products...</div>
        </div>
      </div>
    </div>

    <!-- Cart Drawer Modal (hidden by default) -->
    <div id="cart-drawer-overlay" class="drawer-overlay" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.6); z-index:1000;">
      <div id="cart-drawer" class="drawer" style="position:fixed; top:0; right:0; bottom:0; width:400px; background:var(--bg-surface); box-shadow:var(--shadow-lg); padding:var(--space-6); display:flex; flex-direction:column; transform:translateX(100%); transition:transform 0.3s ease;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:var(--space-6);">
          <h2>Your Cart</h2>
          <button class="btn btn-ghost btn-icon" id="close-cart-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div id="cart-items" style="flex:1; overflow-y:auto; display:flex; flex-direction:column; gap:var(--space-4);"></div>
        <div style="margin-top:var(--space-6); border-top:1px solid var(--border-subtle); padding-top:var(--space-4);">
          <div style="display:flex; justify-content:space-between; font-size:var(--font-lg); font-weight:700; margin-bottom:var(--space-4);">
            <span>Total:</span>
            <span id="cart-total">$0.00</span>
          </div>
          <button class="btn btn-primary" id="checkout-btn" style="width:100%; padding:var(--space-4);">Proceed to Checkout</button>
        </div>
      </div>
    </div>
  `;

  renderNavbar(container);
  
  // Drawer handlers
  const overlay = document.getElementById('cart-drawer-overlay');
  const drawer = document.getElementById('cart-drawer');
  
  document.getElementById('open-cart-btn').addEventListener('click', () => {
    overlay.style.display = 'block';
    renderCart();
    // tiny delay for animation
    requestAnimationFrame(() => {
      drawer.style.transform = 'translateX(0)';
    });
  });

  const closeCart = () => {
    drawer.style.transform = 'translateX(100%)';
    setTimeout(() => { overlay.style.display = 'none'; }, 300);
  };

  document.getElementById('close-cart-btn').addEventListener('click', closeCart);
  overlay.addEventListener('click', (e) => { if(e.target === overlay) closeCart(); });

  document.getElementById('checkout-btn').addEventListener('click', async () => {
    await handleCheckout();
    closeCart();
  });

  updateCartCount();
  await loadProducts();
}

async function loadProducts() {
  try {
    const res = await api.getProducts();
    currentProducts = res.data;
    renderProducts();
  } catch(err) {
    document.getElementById('storefront-grid').innerHTML = `<div class="empty-state" style="grid-column: 1/-1; color:var(--color-error);">${err.message}</div>`;
  }
}

function renderProducts() {
  const grid = document.getElementById('storefront-grid');

  if (currentProducts.length === 0) {
    grid.innerHTML = `<div class="empty-state" style="grid-column: 1/-1;">No products available right now.</div>`;
    return;
  }

  grid.innerHTML = currentProducts.map(p => `
    <div class="card card-sm anim-fade-in-up" style="display:flex; flex-direction:column; padding:0; overflow:hidden;">
      <div style="height:200px; background:var(--bg-elevated); overflow:hidden;">
        ${p.image ? `<img src="${p.image}" style="width:100%; height:100%; object-fit:cover;" alt="${p.name}">` : ''}
      </div>
      <div style="padding:var(--space-4); display:flex; flex-direction:column; flex:1;">
        <div style="font-size:var(--font-xs); color:var(--accent-secondary); margin-bottom:var(--space-1); text-transform:uppercase; letter-spacing:0.05em;">${p.category}</div>
        <h3 style="font-size:var(--font-md); margin-bottom:var(--space-2); line-height:1.3;">${p.name}</h3>
        <div style="font-size:var(--font-lg); font-weight:700; color:var(--text-primary); margin-bottom:var(--space-4);">$${p.price.toFixed(2)}</div>
        <div style="margin-top:auto; display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:var(--font-xs); color:${p.stock > 0 ? 'var(--text-muted)' : 'var(--color-error)'}">${p.stock > 0 ? `${p.stock} in stock` : 'Out of stock'}</span>
          <button class="btn btn-primary btn-sm add-to-cart-btn" data-id="${p.id}" ${p.stock === 0 ? 'disabled' : ''}>
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  `).join('');

  grid.querySelectorAll('.add-to-cart-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = parseInt(e.target.dataset.id);
      const product = currentProducts.find(p => p.id === id);
      try {
        store.addToCart(product);
        updateCartCount();
        showToast('success', 'Added to cart');
      } catch(err) {
        showToast('error', err.message);
      }
    });
  });
}

function updateCartCount() {
  const cart = store.getCart();
  const count = cart.reduce((acc, item) => acc + item.quantity, 0);
  const el = document.getElementById('cart-count');
  if(el) el.textContent = count;
}

function renderCart() {
  const cart = store.getCart();
  const container = document.getElementById('cart-items');
  const totalEl = document.getElementById('cart-total');
  const checkoutBtn = document.getElementById('checkout-btn');

  if (cart.length === 0) {
    container.innerHTML = `<div class="empty-state"><p>Your cart is empty.</p></div>`;
    totalEl.textContent = '$0.00';
    checkoutBtn.disabled = true;
    return;
  }

  checkoutBtn.disabled = false;
  let total = 0;

  container.innerHTML = cart.map(item => {
    total += item.price * item.quantity;
    return `
      <div style="display:flex; gap:var(--space-3); border-bottom:1px solid var(--border-subtle); padding-bottom:var(--space-3);">
        <div style="width:60px; height:60px; background:var(--bg-elevated); border-radius:var(--radius-sm); overflow:hidden;">
          ${item.image ? `<img src="${item.image}" style="width:100%; height:100%; object-fit:cover;">` : ''}
        </div>
        <div style="flex:1;">
          <div style="font-size:var(--font-sm); font-weight:600; line-height:1.2; margin-bottom:2px;">${item.name}</div>
          <div style="font-size:var(--font-xs); color:var(--text-secondary);">$${item.price.toFixed(2)} x ${item.quantity}</div>
        </div>
        <button class="btn btn-ghost btn-icon btn-sm remove-cart-btn" data-id="${item.productId}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-error)" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
    `;
  }).join('');

  totalEl.textContent = `$${total.toFixed(2)}`;

  container.querySelectorAll('.remove-cart-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = parseInt(e.currentTarget.dataset.id);
      store.removeFromCart(id);
      renderCart();
      updateCartCount();
    });
  });
}

async function handleCheckout() {
  try {
    const cart = store.getCart();
    if(cart.length === 0) return;

    const requestData = {
      address: '123 Fake Street, CA', // Hardcoded for demo
      items: cart.map(item => ({
        productId: item.productId,
        quantity: item.quantity
      }))
    };

    const res = await api.placeOrder(requestData);
    
    store.clearCart();
    showToast('success', `Order placed successfully! ID: ${res.data.id}`);
    updateCartCount();
    await loadProducts(); // Refresh stock
  } catch (err) {
    showToast('error', err.message);
  }
}
