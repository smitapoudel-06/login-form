/* ============================================================
   ROUTER — Hash-Based SPA Router with Role Guards
   ============================================================ */

import { isLoggedIn, getUserRole } from './auth.js';
import { renderLogin } from './pages/login.js';
import { renderRegister } from './pages/register.js';
import { renderAdmin, renderAdminUsers } from './pages/admin.js';
import { renderStaff } from './pages/staff.js';
import { renderCustomer } from './pages/customer.js';
import { renderNotFound } from './pages/not-found.js';

/**
 * Route definitions.
 * - path: hash route pattern
 * - render: function to render the page
 * - requiresAuth: whether authentication is required
 * - roles: allowed roles (empty = any authenticated user)
 * - isPublic: accessible without auth (login/register)
 */
const routes = [
  {
    path: '#/login',
    render: renderLogin,
    isPublic: true,
  },
  {
    path: '#/register',
    render: renderRegister,
    isPublic: true,
  },
  {
    path: '#/admin/users',
    render: renderAdminUsers,
    requiresAuth: true,
    roles: ['ADMIN'],
  },
  {
    path: '#/admin',
    render: renderAdmin,
    requiresAuth: true,
    roles: ['ADMIN'],
  },
  {
    path: '#/staff',
    render: renderStaff,
    requiresAuth: true,
    roles: ['STAFF', 'ADMIN'],
  },
  {
    path: '#/customer',
    render: renderCustomer,
    requiresAuth: true,
    roles: ['CUSTOMER', 'STAFF', 'ADMIN'],
  },
];

/**
 * Initialize the router. Listens for hash changes and renders the correct page.
 */
export function initRouter() {
  window.addEventListener('hashchange', handleRoute);
  handleRoute();
}

function handleRoute() {
  const hash = window.location.hash || '#/';
  const app = document.getElementById('app');

  // Find matching route (longest prefix match)
  const route = routes
    .filter(r => hash === r.path || hash.startsWith(r.path + '/'))
    .sort((a, b) => b.path.length - a.path.length)[0];

  // No match → handle defaults
  if (!route) {
    // If at root, redirect based on auth state
    if (hash === '#/' || hash === '' || hash === '#') {
      if (isLoggedIn()) {
        redirectToDashboard();
      } else {
        window.location.hash = '#/login';
      }
      return;
    }

    // 404
    renderNotFound(app);
    return;
  }

  // Auth guard: redirect to login if not authenticated
  if (route.requiresAuth && !isLoggedIn()) {
    window.location.hash = '#/login';
    return;
  }

  // Role guard: redirect if user doesn't have required role
  if (route.requiresAuth && route.roles && route.roles.length > 0) {
    const role = getUserRole();
    if (!route.roles.includes(role)) {
      // Redirect to user's own dashboard
      redirectToDashboard();
      return;
    }
  }

  // Public pages: redirect to dashboard if already logged in
  if (route.isPublic && isLoggedIn()) {
    redirectToDashboard();
    return;
  }

  // Render the page
  route.render(app);
}

function redirectToDashboard() {
  const role = getUserRole();
  switch (role) {
    case 'ADMIN':    window.location.hash = '#/admin'; break;
    case 'STAFF':    window.location.hash = '#/staff'; break;
    case 'CUSTOMER': window.location.hash = '#/customer'; break;
    default:         window.location.hash = '#/login'; break;
  }
}
