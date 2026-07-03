/* ============================================================
   STAFF PROFILE PAGE
   ============================================================ */

import * as api from '../api.js';
import { getUserInitials } from '../auth.js';
import { renderNavbar } from '../components/navbar.js';
import { pageLoader } from '../components/loader.js';

export function renderStaff(container) {
  container.innerHTML = `
    <div class="dashboard-layout">
      <div class="dashboard-content">
        <div class="dashboard-header">
          <h1>Staff Profile</h1>
          <p>View your staff account details.</p>
        </div>
        <div id="profile-content" class="profile-page">${pageLoader('Loading profile...')}</div>
      </div>
    </div>
  `;

  renderNavbar(container);
  loadProfile();
}

async function loadProfile() {
  const content = document.getElementById('profile-content');
  try {
    const result = await api.getStaffProfile();
    const user = result.data;
    const initials = getUserInitials();

    const created = user.createdAt
      ? new Date(user.createdAt).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
      : '—';

    content.innerHTML = `
      <div class="card profile-card anim-fade-in-up">
        <div class="profile-avatar">${initials}</div>
        <h2 class="profile-name">${user.fullName || user.username || '—'}</h2>
        <p class="profile-email">${user.email}</p>
        <span class="badge badge-staff" style="margin: 0 auto var(--space-6);">STAFF</span>

        <div class="profile-details">
          <div class="profile-row">
            <span class="profile-row-label">User ID</span>
            <span class="profile-row-value">#${user.id}</span>
          </div>
          <div class="profile-row">
            <span class="profile-row-label">Username</span>
            <span class="profile-row-value">${user.username || '—'}</span>
          </div>
          <div class="profile-row">
            <span class="profile-row-label">Email</span>
            <span class="profile-row-value">${user.email}</span>
          </div>
          <div class="profile-row">
            <span class="profile-row-label">Full Name</span>
            <span class="profile-row-value">${user.fullName || '—'}</span>
          </div>
          <div class="profile-row">
            <span class="profile-row-label">Role</span>
            <span class="profile-row-value"><span class="badge badge-staff">STAFF</span></span>
          </div>
          <div class="profile-row">
            <span class="profile-row-label">Status</span>
            <span class="profile-row-value"><span class="badge badge-active">Active</span></span>
          </div>
          <div class="profile-row">
            <span class="profile-row-label">Member Since</span>
            <span class="profile-row-value">${created}</span>
          </div>
        </div>
      </div>
    `;
  } catch (err) {
    content.innerHTML = `
      <div class="card" style="max-width:480px; text-align:center; padding: var(--space-8);">
        <div class="auth-alert error">${err.message}</div>
      </div>
    `;
  }
}
