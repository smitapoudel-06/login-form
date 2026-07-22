/* ============================================================
   STAFF INVENTORY & ORDERS PAGE
   ============================================================ */

import * as api from '../api.js';
import { renderNavbar } from '../components/navbar.js';
import { showToast } from '../toast.js';
import { openModal, closeModal, confirmModal } from '../components/modal.js';

let currentProducts = [];

export async function renderStaff(container) {
  container.innerHTML = `
    <div class="dashboard-layout">
      <div class="dashboard-content">
        <div class="dashboard-header" style="display:flex; justify-content:space-between; align-items:center;">
          <div>
            <h1>Inventory & Orders</h1>
            <p>Manage products and fulfill customer orders.</p>
          </div>
          <button class="btn btn-primary" id="add-product-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Add Product
          </button>
        </div>

        <div style="margin-bottom:var(--space-8);">
          <h2>Products</h2>
          <div class="table-container anim-fade-in-up" style="margin-top:var(--space-4);">
            <table class="table" id="products-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody><tr><td colspan="6">Loading...</td></tr></tbody>
            </table>
          </div>
        </div>

        <div>
          <h2>Recent Orders</h2>
          <div class="table-container anim-fade-in-up" style="margin-top:var(--space-4);">
            <table class="table" id="orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody><tr><td colspan="6">Loading...</td></tr></tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  `;

  renderNavbar(container);
  
  document.getElementById('add-product-btn').addEventListener('click', () => openProductModal());

  await loadProducts();
  await loadOrders();
}

async function loadProducts() {
  try {
    const res = await api.getProducts();
    currentProducts = res.data;
    renderProducts();
  } catch(err) {
    showToast('error', 'Failed to load products');
  }
}

function renderProducts() {
  const tbody = document.querySelector('#products-table tbody');
  
  if (currentProducts.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:var(--space-6); color:var(--text-muted);">No products found.</td></tr>`;
    return;
  }

  tbody.innerHTML = currentProducts.map(p => `
    <tr>
      <td>
        <div style="width:40px; height:40px; background:var(--bg-elevated); border-radius:var(--radius-sm); overflow:hidden;">
          ${p.image ? `<img src="${p.image}" style="width:100%; height:100%; object-fit:cover;">` : ''}
        </div>
      </td>
      <td style="font-weight:500; color:var(--text-primary);">${p.name}</td>
      <td><span class="badge" style="background:var(--bg-elevated); border:1px solid var(--border-subtle);">${p.category}</span></td>
      <td>$${p.price.toFixed(2)}</td>
      <td><span style="color:${p.stock > 0 ? 'var(--color-success)' : 'var(--color-error)'}">${p.stock}</span></td>
      <td>
        <div class="actions">
          <button class="btn btn-ghost btn-icon btn-sm edit-btn" data-id="${p.id}"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
          <button class="btn btn-ghost btn-icon btn-sm delete-btn" data-id="${p.id}"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-error)" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
        </div>
      </td>
    </tr>
  `).join('');

  // Event Listeners
  tbody.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const p = currentProducts.find(x => x.id === parseInt(e.currentTarget.dataset.id));
      if(p) openProductModal(p);
    });
  });

  tbody.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = parseInt(e.currentTarget.dataset.id);
      confirmModal('Delete Product', 'Are you sure you want to delete this product?', async () => {
        try {
          await api.deleteProduct(id);
          showToast('success', 'Product deleted');
          await loadProducts();
        } catch(err) {
          showToast('error', err.message);
        }
      });
    });
  });
}

function openProductModal(product = null) {
  const isEdit = !!product;
  openModal({
    title: isEdit ? 'Edit Product' : 'Add New Product',
    body: `
      <form id="product-form" class="auth-form" style="gap: var(--space-4);">
        <div class="form-group">
          <label class="form-label">Name</label>
          <input class="form-input" id="p-name" value="${product?.name || ''}" required>
        </div>
        <div style="display:flex; gap:var(--space-4);">
          <div class="form-group" style="flex:1;">
            <label class="form-label">Price ($)</label>
            <input class="form-input" type="number" step="0.01" id="p-price" value="${product?.price || ''}" required>
          </div>
          <div class="form-group" style="flex:1;">
            <label class="form-label">Stock</label>
            <input class="form-input" type="number" id="p-stock" value="${product?.stock || '0'}" required>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Category</label>
          <input class="form-input" id="p-category" value="${product?.category || ''}" required>
        </div>
        <div class="form-group">
          <label class="form-label">Image URL</label>
          <input class="form-input" id="p-image" value="${product?.image || ''}">
        </div>
      </form>
    `,
    actions: [
      { label: 'Cancel', className: 'btn-secondary', id: 'cancel-p-btn' },
      { label: isEdit ? 'Save Changes' : 'Create Product', className: 'btn-primary', id: 'save-p-btn' }
    ],
    onMount: (modal) => {
      modal.querySelector('#cancel-p-btn').addEventListener('click', closeModal);
      modal.querySelector('#save-p-btn').addEventListener('click', async () => {
        if(!document.getElementById('product-form').reportValidity()) return;
        
        const data = {
          name: document.getElementById('p-name').value,
          price: parseFloat(document.getElementById('p-price').value),
          stock: parseInt(document.getElementById('p-stock').value),
          category: document.getElementById('p-category').value,
          image: document.getElementById('p-image').value,
        };

        try {
          if(isEdit) {
            await api.updateProduct(product.id, data);
            showToast('success', 'Product updated');
          } else {
            await api.addProduct(data);
            showToast('success', 'Product added');
          }
          closeModal();
          await loadProducts();
        } catch(err) {
          showToast('error', err.message);
        }
      });
    }
  });
}

async function loadOrders() {
  try {
    const res = await api.getOrders();
    const orders = res.data.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
    renderOrders(orders);
  } catch(err) {
    showToast('error', 'Failed to load orders');
  }
}

function renderOrders(orders) {
  const tbody = document.querySelector('#orders-table tbody');

  if (orders.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:var(--space-6); color:var(--text-muted);">No orders yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = orders.map(o => {
    let statusBadge = '';
    if(o.status === 'Pending') statusBadge = `<span class="badge badge-warning" style="background:rgba(255,217,61,0.15); color:var(--color-warning); border:1px solid rgba(255,217,61,0.3);">Pending</span>`;
    if(o.status === 'Shipped') statusBadge = `<span class="badge badge-info" style="background:rgba(108,159,255,0.15); color:var(--color-info); border:1px solid rgba(108,159,255,0.3);">Shipped</span>`;
    if(o.status === 'Delivered') statusBadge = `<span class="badge badge-success">Delivered</span>`;

    return `
      <tr>
        <td style="font-family:monospace; color:var(--text-muted);">ORD-${o.id}</td>
        <td>${o.customerName}</td>
        <td style="font-weight:600;">$${o.total.toFixed(2)}</td>
        <td>${statusBadge}</td>
        <td style="font-size:var(--font-xs);">${new Date(o.createdAt).toLocaleDateString()}</td>
        <td>
          <select class="form-select status-select" data-id="${o.id}" style="width:120px; font-size:0.7rem; padding:4px 24px 4px 8px;">
            <option value="Pending" ${o.status === 'Pending' ? 'selected' : ''}>Pending</option>
            <option value="Shipped" ${o.status === 'Shipped' ? 'selected' : ''}>Shipped</option>
            <option value="Delivered" ${o.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
          </select>
        </td>
      </tr>
    `;
  }).join('');

  tbody.querySelectorAll('.status-select').forEach(sel => {
    sel.addEventListener('change', async (e) => {
      const id = e.target.dataset.id;
      const status = e.target.value;
      try {
        await api.updateOrderStatus(id, status);
        showToast('success', `Order ${id} marked as ${status}`);
        await loadOrders();
      } catch(err) {
        showToast('error', err.message);
      }
    });
  });
}
