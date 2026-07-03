/* ============================================================
   AUTH — Token & User Session Utilities
   ============================================================ */

const TOKEN_KEY = 'login_app_token';
const USER_KEY = 'login_app_user';

/** Save login response data to localStorage */
export function saveAuth(data) {
  localStorage.setItem(TOKEN_KEY, data.token);
  localStorage.setItem(USER_KEY, JSON.stringify(data));
}

/** Get the stored JWT token */
export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

/** Get the stored user object */
export function getUser() {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/** Check if user is currently logged in */
export function isLoggedIn() {
  return !!getToken();
}

/** Get the user's role (ADMIN, STAFF, CUSTOMER) */
export function getUserRole() {
  const user = getUser();
  return user ? user.role : null;
}

/** Get user initials for avatar */
export function getUserInitials() {
  const user = getUser();
  if (!user) return '?';
  if (user.fullName) {
    const parts = user.fullName.trim().split(/\s+/);
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : parts[0][0].toUpperCase();
  }
  if (user.username) return user.username[0].toUpperCase();
  if (user.email) return user.email[0].toUpperCase();
  return '?';
}

/** Clear auth data and redirect to login */
export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  window.location.hash = '#/login';
}
