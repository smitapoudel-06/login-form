/* ============================================================
   REGISTER PAGE
   ============================================================ */

import * as api from '../api.js';
import { isLoggedIn } from '../auth.js';
import { showToast } from '../toast.js';
import { buttonLoading } from '../components/loader.js';

export function renderRegister(container) {
  if (isLoggedIn()) {
    window.location.hash = '#/';
    return;
  }

  container.innerHTML = `
    <div class="auth-page">
      <div class="auth-container">
        <div class="card auth-card">
          <div class="auth-header">
            <div class="auth-logo" style="background: var(--gradient-cool);">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>
              </svg>
            </div>
            <h1>Create account</h1>
            <p>Register as a customer to get started</p>
          </div>

          <div id="register-alert"></div>

          <form class="auth-form" id="register-form" novalidate>
            <div class="form-group">
              <label class="form-label" for="reg-email">Email address</label>
              <input
                class="form-input"
                type="email"
                id="reg-email"
                name="email"
                placeholder="you@example.com"
                autocomplete="email"
                required
              />
              <div class="form-error" id="reg-email-error"></div>
            </div>

            <div class="form-group">
              <label class="form-label" for="reg-password">Password</label>
              <div class="password-wrapper">
                <input
                  class="form-input"
                  type="password"
                  id="reg-password"
                  name="password"
                  placeholder="Minimum 6 characters"
                  autocomplete="new-password"
                  required
                />
                <button type="button" class="password-toggle" id="toggle-reg-password" aria-label="Show password">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                </button>
              </div>
              <div class="form-error" id="reg-password-error"></div>
            </div>

            <div class="form-group">
              <label class="form-label" for="reg-confirm-password">Confirm Password</label>
              <div class="password-wrapper">
                <input
                  class="form-input"
                  type="password"
                  id="reg-confirm-password"
                  name="confirmPassword"
                  placeholder="Re-enter your password"
                  autocomplete="new-password"
                  required
                />
                <button type="button" class="password-toggle" id="toggle-reg-confirm" aria-label="Show password">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                </button>
              </div>
              <div class="form-error" id="reg-confirm-error"></div>
            </div>

            <button type="submit" class="btn btn-primary btn-lg" id="register-submit-btn">
              Create Account
            </button>
          </form>

          <div class="auth-footer">
            <p>Already have an account? <a href="#/login">Sign in</a></p>
          </div>
        </div>
      </div>
    </div>
  `;

  // Password toggles
  setupPasswordToggle('reg-password', 'toggle-reg-password');
  setupPasswordToggle('reg-confirm-password', 'toggle-reg-confirm');

  // Form submission
  document.getElementById('register-form').addEventListener('submit', handleRegister);
}

function setupPasswordToggle(inputId, toggleId) {
  const input = document.getElementById(inputId);
  const toggle = document.getElementById(toggleId);
  toggle.addEventListener('click', () => {
    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';
    toggle.innerHTML = isPassword
      ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></svg>`
      : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>`;
  });
}

async function handleRegister(e) {
  e.preventDefault();

  const email = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value;
  const confirmPassword = document.getElementById('reg-confirm-password').value;
  const alertEl = document.getElementById('register-alert');
  const submitBtn = document.getElementById('register-submit-btn');
  const originalText = submitBtn.textContent;

  // Clear errors
  alertEl.innerHTML = '';
  clearFieldErrors();

  // Client-side validation
  let valid = true;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showFieldError('reg-email-error', 'Please enter a valid email address');
    document.getElementById('reg-email').classList.add('error');
    valid = false;
  }

  if (!password || password.length < 6) {
    showFieldError('reg-password-error', 'Password must be at least 6 characters');
    document.getElementById('reg-password').classList.add('error');
    valid = false;
  }

  if (password !== confirmPassword) {
    showFieldError('reg-confirm-error', 'Passwords do not match');
    document.getElementById('reg-confirm-password').classList.add('error');
    valid = false;
  }

  if (!valid) return;

  // Loading state
  submitBtn.disabled = true;
  submitBtn.innerHTML = buttonLoading('Creating account...');

  try {
    const result = await api.register(email, password, confirmPassword);

    if (result.success) {
      showToast('success', 'Registration successful! You can now sign in.');
      setTimeout(() => {
        window.location.hash = '#/login';
      }, 500);
    } else {
      throw new Error(result.message || 'Registration failed');
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

function showFieldError(id, message) {
  const el = document.getElementById(id);
  if (el) {
    el.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> ${message}`;
  }
}

function clearFieldErrors() {
  ['reg-email-error', 'reg-password-error', 'reg-confirm-error'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.innerHTML = '';
  });
  ['reg-email', 'reg-password', 'reg-confirm-password'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.classList.remove('error');
  });
}
