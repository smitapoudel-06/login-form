/* ============================================================
   LOGIN PAGE
   ============================================================ */

import * as api from '../api.js';
import { saveAuth, isLoggedIn, getUserRole } from '../auth.js';
import { showToast } from '../toast.js';
import { buttonLoading } from '../components/loader.js';

export function renderLogin(container) {
  // If already logged in, redirect to dashboard
  if (isLoggedIn()) {
    redirectToDashboard();
    return;
  }

  container.innerHTML = `
    <div class="auth-page">
      <div class="auth-container">
        <div class="card auth-card">
          <div class="auth-header">
            <div class="auth-logo">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <h1>Welcome back</h1>
            <p>Sign in to your account to continue</p>
          </div>

          <div id="login-alert"></div>

          <form class="auth-form" id="login-form" novalidate>
            <div class="form-group">
              <label class="form-label" for="login-email">Email address</label>
              <input
                class="form-input"
                type="email"
                id="login-email"
                name="email"
                placeholder="you@example.com"
                autocomplete="email"
                required
              />
            </div>

            <div class="form-group">
              <label class="form-label" for="login-password">Password</label>
              <div class="password-wrapper">
                <input
                  class="form-input"
                  type="password"
                  id="login-password"
                  name="password"
                  placeholder="Enter your password"
                  autocomplete="current-password"
                  required
                />
                <button type="button" class="password-toggle" id="toggle-password" aria-label="Show password">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                </button>
              </div>
            </div>

            <button type="submit" class="btn btn-primary btn-lg" id="login-submit-btn">
              Sign In
            </button>
          </form>

          <div class="auth-footer">
            <p>Don't have an account? <a href="#/register">Create one</a></p>
          </div>
        </div>
      </div>
    </div>
  `;

  // Password visibility toggle
  const passwordInput = document.getElementById('login-password');
  const toggleBtn = document.getElementById('toggle-password');
  toggleBtn.addEventListener('click', () => {
    const isPassword = passwordInput.type === 'password';
    passwordInput.type = isPassword ? 'text' : 'password';
    toggleBtn.innerHTML = isPassword
      ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></svg>`
      : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>`;
  });

  // Form submission
  const form = document.getElementById('login-form');
  form.addEventListener('submit', handleLogin);
}

async function handleLogin(e) {
  e.preventDefault();

  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const alertEl = document.getElementById('login-alert');
  const submitBtn = document.getElementById('login-submit-btn');
  const originalText = submitBtn.textContent;

  // Clear previous alerts
  alertEl.innerHTML = '';

  // Basic validation
  if (!email || !password) {
    alertEl.innerHTML = `<div class="auth-alert error">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      Please enter your email and password
    </div>`;
    return;
  }

  // Loading state
  submitBtn.disabled = true;
  submitBtn.innerHTML = buttonLoading('Signing in...');

  try {
    const result = await api.login(email, password);

    if (result.success && result.data) {
      saveAuth(result.data);
      showToast('success', `Welcome back, ${result.data.fullName || result.data.username}!`);

      // Small delay to show toast before redirect
      setTimeout(() => redirectToDashboard(), 300);
    } else {
      throw new Error(result.message || 'Login failed');
    }
  } catch (err) {
    alertEl.innerHTML = `<div class="auth-alert error">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
      ${err.message}
    </div>`;
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
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
