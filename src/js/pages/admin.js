/* ============================================================
   ADMIN DASHBOARD PAGE
   ============================================================ */

import * as api from '../api.js';
import { showToast } from '../toast.js';
import { renderNavbar } from '../components/navbar.js';
import { openModal, closeModal, confirmModal } from '../components/modal.js';
import { pageLoader, buttonLoading } from '../components/loader.js';

let usersData = [];
let searchQuery = '';

export function renderAdmin(container) {
  container.innerHTML = `
    <div class="dashboard-layout">
      <div class="dashboard-content">
        <div class="dashboard-header">
          <h1>Admin Dashboard</h1>
          <p>Manage users, create staff accounts, and monitor system stats.</p>
        </div>

        <div id="stats-section">${pageLoader('Loading stats...')}</div>
        <div id="users-section" style="margin-top: var(--space-8);">${pageLoader('Loading users...')}</div>
      </div>
    </div>
  `;

  renderNavbar(container);
  loadStats();
  loadUsers();
}

/* Also used for the #/admin/users route */
export { renderAdmin as renderAdminUsers };

/* ── Stats Section ── */
async function loadStats() {
  const section = document.getElementById('stats-section');
  try {
    const result = await api.getStats();
    const stats = result.data;
    
    // Fetch real orders from database for revenue calculation
    const ordersRes = await api.getOrders();
    const orders = ordersRes.data;
    const revenue = orders.reduce((sum, o) => sum + o.total, 0);

    section.innerHTML = `
      <div class="stats-grid anim-stagger">
        ${statCard('Total Users', stats.totalUsers ?? 0, 'purple', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>')}
        ${statCard('Staff Accounts', stats.totalStaff ?? 0, 'teal', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>')}
        ${statCard('Total Orders', orders.length, 'blue', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>')}
        ${statCard('Total Revenue', '$' + revenue.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2}), 'warm', '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>')}
      </div>
    `;
  } catch (err) {
    section.innerHTML = `<div class="auth-alert error" style="max-width:600px">${err.message}</div>`;
  }
}

function statCard(label, value, color, icon) {
  return `
    <div class="card card-sm stat-card anim-fade-in-up">
      <div class="stat-icon ${color}">${icon}</div>
      <div class="stat-info">
        <h3>${value}</h3>
        <p>${label}</p>
      </div>
    </div>
  `;
}

/* ── Users Section ── */
async function loadUsers() {
  const section = document.getElementById('users-section');
  try {
    const result = await api.getUsers();
    usersData = result.data || [];
    renderUsersSection(section);
  } catch (err) {
    section.innerHTML = `<div class="auth-alert error" style="max-width:600px">${err.message}</div>`;
  }
}

function renderUsersSection(section) {
  const filtered = filterUsers(usersData, searchQuery);

  section.innerHTML = `
    <div class="section-header">
      <h2>All Users (${usersData.length})</h2>
      <div class="section-actions">
        <div class="search-wrapper">
          <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input class="form-input" type="text" id="user-search" placeholder="Search users..." value="${searchQuery}" />
        </div>
        <button class="btn btn-primary btn-sm" id="create-staff-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Create Staff
        </button>
      </div>
    </div>

    ${filtered.length === 0
      ? `<div class="card empty-state">
           <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
           <p>${searchQuery ? 'No users match your search.' : 'No users found.'}</p>
         </div>`
      : `<div class="table-container anim-fade-in-up">
           <table class="table">
             <thead>
               <tr>
                 <th>ID</th>
                 <th>Username</th>
                 <th>Email</th>
                 <th>Full Name</th>
                 <th>Role</th>
                 <th>Status</th>
                 <th>Created</th>
                 <th>Actions</th>
               </tr>
             </thead>
             <tbody>
               ${filtered.map(user => userRow(user)).join('')}
             </tbody>
           </table>
         </div>`
    }
  `;

  // Search listener
  const searchInput = document.getElementById('user-search');
  searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderUsersSection(section);
    // Re-focus and set cursor position
    const newInput = document.getElementById('user-search');
    newInput.focus();
    newInput.setSelectionRange(searchQuery.length, searchQuery.length);
  });

  // Create Staff button
  document.getElementById('create-staff-btn').addEventListener('click', openCreateStaffModal);

  // Row action buttons
  section.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;
      const userId = parseInt(btn.dataset.userId);
      const user = usersData.find(u => u.id === userId);
      if (!user) return;

      if (action === 'delete') handleDelete(user);
      else if (action === 'toggle-status') handleToggleStatus(user);
      else if (action === 'change-role') handleChangeRole(user, btn);
    });
  });
}

function filterUsers(users, query) {
  if (!query) return users;
  const q = query.toLowerCase();
  return users.filter(u =>
    (u.username && u.username.toLowerCase().includes(q)) ||
    (u.email && u.email.toLowerCase().includes(q)) ||
    (u.fullName && u.fullName.toLowerCase().includes(q)) ||
    (u.role && u.role.toLowerCase().includes(q))
  );
}

function userRow(user) {
  const roleBadge = `<span class="badge badge-${user.role?.toLowerCase()}">${user.role}</span>`;
  const statusBadge = user.enabled !== false
    ? `<span class="badge badge-active">Active</span>`
    : `<span class="badge badge-inactive">Disabled</span>`;

  const created = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : '—';

  return `
    <tr>
      <td style="color: var(--text-muted); font-size: var(--font-xs);">#${user.id}</td>
      <td style="color: var(--text-primary); font-weight: 500;">${user.username || '—'}</td>
      <td>${user.email}</td>
      <td>${user.fullName || '—'}</td>
      <td>${roleBadge}</td>
      <td>${statusBadge}</td>
      <td style="font-size: var(--font-xs); color: var(--text-muted);">${created}</td>
      <td>
        <div class="actions">
          <select class="form-select" data-action="change-role" data-user-id="${user.id}" style="width: 110px; padding: 4px 28px 4px 8px; font-size: 0.7rem;">
            <option value="ADMIN" ${user.role === 'ADMIN' ? 'selected' : ''}>Admin</option>
            <option value="STAFF" ${user.role === 'STAFF' ? 'selected' : ''}>Staff</option>
            <option value="CUSTOMER" ${user.role === 'CUSTOMER' ? 'selected' : ''}>Customer</option>
          </select>
          <button class="btn btn-ghost btn-icon btn-sm" data-action="toggle-status" data-user-id="${user.id}" title="${user.enabled !== false ? 'Disable user' : 'Enable user'}">
            ${user.enabled !== false
              ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-warning)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="4" y1="12" x2="20" y2="12"/></svg>`
              : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`
            }
          </button>
          <button class="btn btn-ghost btn-icon btn-sm" data-action="delete" data-user-id="${user.id}" title="Delete user">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-error)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </div>
      </td>
    </tr>
  `;
}

/* ── Actions ── */

async function handleChangeRole(user, selectEl) {
  const newRole = selectEl.value;
  if (newRole === user.role) return;

  confirmModal(
    'Change User Role',
    `Change <strong>${user.username || user.email}</strong>'s role from <strong>${user.role}</strong> to <strong>${newRole}</strong>?`,
    async () => {
      try {
        await api.changeUserRole(user.id, newRole);
        showToast('success', `Role changed to ${newRole}`);
        await loadUsers();
        await loadStats();
      } catch (err) {
        showToast('error', err.message);
        await loadUsers();
      }
    },
    'Change Role',
    'btn-primary'
  );
}

async function handleToggleStatus(user) {
  const action = user.enabled !== false ? 'disable' : 'enable';
  confirmModal(
    `${action === 'disable' ? 'Disable' : 'Enable'} User`,
    `Are you sure you want to <strong>${action}</strong> <strong>${user.username || user.email}</strong>?${action === 'disable' ? ' They will not be able to log in.' : ''}`,
    async () => {
      try {
        await api.toggleUserStatus(user.id);
        showToast('success', `User ${action}d successfully`);
        await loadUsers();
      } catch (err) {
        showToast('error', err.message);
      }
    },
    action === 'disable' ? 'Disable' : 'Enable',
    action === 'disable' ? 'btn-danger' : 'btn-success'
  );
}

async function handleDelete(user) {
  confirmModal(
    'Delete User',
    `Are you sure you want to <strong>permanently delete</strong> <strong>${user.username || user.email}</strong>? This action cannot be undone.`,
    async () => {
      try {
        await api.deleteUser(user.id);
        showToast('success', 'User deleted');
        await loadUsers();
        await loadStats();
      } catch (err) {
        showToast('error', err.message);
      }
    },
    'Delete',
    'btn-danger'
  );
}

/* ── Create Staff Modal ── */
function openCreateStaffModal() {
  openModal({
    title: 'Create Staff Member',
    body: `
      <form id="create-staff-form" class="auth-form" style="gap: var(--space-4);">
        <div class="form-group">
          <label class="form-label" for="staff-username">Username</label>
          <input class="form-input" type="text" id="staff-username" placeholder="e.g. john_doe" required />
        </div>
        <div class="form-group">
          <label class="form-label" for="staff-fullname">Full Name</label>
          <input class="form-input" type="text" id="staff-fullname" placeholder="e.g. John Doe" required />
        </div>
        <div class="form-group">
          <label class="form-label" for="staff-email">Email</label>
          <input class="form-input" type="email" id="staff-email" placeholder="john@example.com" required />
        </div>
        <div class="form-group">
          <label class="form-label" for="staff-password">Password</label>
          <input class="form-input" type="password" id="staff-password" placeholder="Minimum 6 characters" required />
        </div>
        <div class="form-group">
          <label class="form-label" for="staff-confirm">Confirm Password</label>
          <input class="form-input" type="password" id="staff-confirm" placeholder="Re-enter password" required />
        </div>
        <div id="staff-form-error"></div>
      </form>
    `,
    actions: [
      { label: 'Cancel', className: 'btn-secondary', id: 'staff-cancel-btn' },
      { label: 'Create Staff', className: 'btn-primary', id: 'staff-submit-btn' },
    ],
    onMount: (modal) => {
      modal.querySelector('#staff-cancel-btn').addEventListener('click', closeModal);
      modal.querySelector('#staff-submit-btn').addEventListener('click', handleCreateStaff);
      modal.querySelector('#create-staff-form').addEventListener('submit', (e) => {
        e.preventDefault();
        handleCreateStaff();
      });
    },
  });
}

async function handleCreateStaff() {
  const username = document.getElementById('staff-username').value.trim();
  const fullName = document.getElementById('staff-fullname').value.trim();
  const email = document.getElementById('staff-email').value.trim();
  const password = document.getElementById('staff-password').value;
  const confirmPassword = document.getElementById('staff-confirm').value;
  const errorEl = document.getElementById('staff-form-error');
  const submitBtn = document.getElementById('staff-submit-btn');

  errorEl.innerHTML = '';

  // Validation
  if (!username || !email || !password || !confirmPassword) {
    errorEl.innerHTML = `<div class="auth-alert error">All fields are required</div>`;
    return;
  }
  if (password.length < 6) {
    errorEl.innerHTML = `<div class="auth-alert error">Password must be at least 6 characters</div>`;
    return;
  }
  if (password !== confirmPassword) {
    errorEl.innerHTML = `<div class="auth-alert error">Passwords do not match</div>`;
    return;
  }

  submitBtn.disabled = true;
  submitBtn.innerHTML = buttonLoading('Creating...');

  try {
    await api.createStaff({ username, fullName, email, password, confirmPassword });
    closeModal();
    showToast('success', `Staff member "${username}" created successfully`);
    await loadUsers();
    await loadStats();
  } catch (err) {
    errorEl.innerHTML = `<div class="auth-alert error">${err.message}</div>`;
    submitBtn.disabled = false;
    submitBtn.textContent = 'Create Staff';
  }
}
