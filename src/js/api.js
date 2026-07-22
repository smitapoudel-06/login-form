/* ============================================================
   API — Fetch Wrapper for All Backend Endpoints
   ============================================================ */

import { getToken, logout } from './auth.js';

const BASE_URL = 'http://localhost:8080';

/**
 * Core fetch wrapper. Automatically attaches JWT token and handles errors.
 */
async function request(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Handle 401 — session expired or invalid token
  if (response.status === 401) {
    logout();
    throw new Error('Session expired. Please log in again.');
  }

  // Handle 403 — forbidden
  if (response.status === 403) {
    throw new Error('Access denied. You do not have permission.');
  }

  // Parse JSON response
  let data;
  const text = await response.text();
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { success: false, message: text || 'Unknown error' };
  }

  // Handle error responses
  if (!response.ok) {
    throw new Error(data.message || `Request failed (${response.status})`);
  }

  return data;
}

/* ── Auth Endpoints (Public) ── */

export async function login(email, password) {
  return request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function register(email, password, confirmPassword) {
  return request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, confirmPassword }),
  });
}

/* ── Admin Endpoints ── */

export async function getUsers() {
  return request('/api/admin/users');
}

export async function getUserById(id) {
  return request(`/api/admin/users/${id}`);
}

export async function createStaff(staffData) {
  return request('/api/admin/staff', {
    method: 'POST',
    body: JSON.stringify(staffData),
  });
}

export async function changeUserRole(id, role) {
  return request(`/api/admin/users/${id}/role?role=${role}`, {
    method: 'PUT',
  });
}

export async function toggleUserStatus(id) {
  return request(`/api/admin/users/${id}/status`, {
    method: 'PUT',
  });
}

export async function deleteUser(id) {
  return request(`/api/admin/users/${id}`, {
    method: 'DELETE',
  });
}

export async function getStats() {
  return request('/api/admin/stats');
}

/* ── Staff Endpoints ── */

export async function getStaffProfile() {
  return request('/api/staff/profile');
}

/* ── Customer Endpoints ── */

export async function getCustomerProfile() {
  return request('/api/customer/profile');
}

/* ── OmniTrade Endpoints ── */

// Products
export async function getProducts() {
  return request('/api/products');
}

export async function addProduct(product) {
  return request('/api/products', {
    method: 'POST',
    body: JSON.stringify(product),
  });
}

export async function updateProduct(id, product) {
  return request(`/api/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(product),
  });
}

export async function deleteProduct(id) {
  return request(`/api/products/${id}`, {
    method: 'DELETE',
  });
}

// Orders
export async function placeOrder(requestData) {
  return request('/api/orders', {
    method: 'POST',
    body: JSON.stringify(requestData),
  });
}

export async function getOrders() {
  return request('/api/orders');
}

export async function getMyOrders() {
  return request('/api/orders/my-orders');
}

export async function updateOrderStatus(id, status) {
  return request(`/api/orders/${id}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status }),
  });
}
