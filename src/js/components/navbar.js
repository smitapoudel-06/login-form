/* ============================================================
   NAVBAR — Top Navigation Bar Component
   ============================================================ */

import { getUser, getUserInitials, getUserRole, logout } from '../auth.js';

/**
 * Render the navbar into the given container.
 * @param {HTMLElement} container
 */
export function renderNavbar(container) {
  const user = getUser();
  const role = getUserRole();
  const initials = getUserInitials();
  const displayName = user?.fullName || user?.username || user?.email || 'User';

  const navLinks = getNavLinks(role);

  const nav = document.createElement('nav');
  nav.className = 'navbar';
  nav.innerHTML = `
    <div class="navbar-inner">
      <div class="navbar-brand">
        <div class="navbar-brand-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>
        <span>LoginSystem</span>
      </div>

      <div class="navbar-nav" id="navbar-nav">
        ${navLinks}
      </div>

      <div class="navbar-right">
        <div class="navbar-user">
          <div class="navbar-avatar">${initials}</div>
          <div class="navbar-user-info">
            <span class="navbar-user-name">${displayName}</span>
            <span class="navbar-user-role">${role}</span>
          </div>
        </div>
        <button class="btn btn-ghost btn-sm" id="logout-btn" aria-label="Logout">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          <span>Logout</span>
        </button>
      </div>
    </div>
  `;

  container.prepend(nav);

  // Logout handler
  nav.querySelector('#logout-btn').addEventListener('click', () => {
    logout();
  });

  // Highlight active nav link
  highlightActiveLink();
}

function getNavLinks(role) {
  const hash = window.location.hash;

  if (role === 'ADMIN') {
    return `
      <a href="#/admin" class="navbar-link" data-route="#/admin">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
        <span>Dashboard</span>
      </a>
      <a href="#/admin/users" class="navbar-link" data-route="#/admin/users">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        <span>Users</span>
      </a>
    `;
  }

  if (role === 'STAFF') {
    return `
      <a href="#/staff" class="navbar-link" data-route="#/staff">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        <span>Profile</span>
      </a>
    `;
  }

  // CUSTOMER
  return `
    <a href="#/customer" class="navbar-link" data-route="#/customer">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
      <span>Profile</span>
    </a>
  `;
}

function highlightActiveLink() {
  const hash = window.location.hash || '#/';
  document.querySelectorAll('.navbar-link').forEach(link => {
    const route = link.dataset.route;
    if (route && hash.startsWith(route)) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}
