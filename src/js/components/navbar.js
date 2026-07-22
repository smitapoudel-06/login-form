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
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>
          </svg>
        </div>
        <span>OmniTrade</span>
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
        <span>Overview</span>
      </a>
      <a href="#/admin/users" class="navbar-link" data-route="#/admin/users">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        <span>Staff Management</span>
      </a>
    `;
  }

  if (role === 'STAFF') {
    return `
      <a href="#/staff" class="navbar-link" data-route="#/staff">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2Z"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
        <span>Inventory & Orders</span>
      </a>
    `;
  }

  // CUSTOMER
  return `
    <a href="#/customer" class="navbar-link" data-route="#/customer">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
      <span>Storefront</span>
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
