/* ============================================================
   MODAL — Reusable Modal Component
   ============================================================ */

const overlay = () => document.getElementById('modal-overlay');

/**
 * Open a modal with custom content.
 * @param {object} options
 * @param {string} options.title - Modal title
 * @param {string} options.body  - HTML content for the modal body
 * @param {Array<{label: string, className: string, id: string}>} options.actions - Footer buttons
 * @param {function} [options.onMount] - Called after the modal is mounted (for attaching listeners)
 */
export function openModal({ title, body, actions = [], onMount }) {
  const el = overlay();
  if (!el) return;

  el.innerHTML = `
    <div class="modal anim-scale-in">
      <div class="modal-header">
        <h3>${title}</h3>
        <button class="btn btn-ghost btn-icon btn-sm" id="modal-close-btn" aria-label="Close">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <div class="modal-body">
        ${body}
      </div>
      ${actions.length > 0 ? `
        <div class="modal-footer">
          ${actions.map(a => `<button class="btn ${a.className || 'btn-secondary'}" id="${a.id}">${a.label}</button>`).join('')}
        </div>
      ` : ''}
    </div>
  `;

  el.classList.add('active');

  // Close button
  el.querySelector('#modal-close-btn').addEventListener('click', closeModal);

  // Click outside to close
  el.addEventListener('click', (e) => {
    if (e.target === el) closeModal();
  });

  // Escape key to close
  const escHandler = (e) => {
    if (e.key === 'Escape') {
      closeModal();
      document.removeEventListener('keydown', escHandler);
    }
  };
  document.addEventListener('keydown', escHandler);

  // Call onMount callback
  if (onMount) {
    onMount(el.querySelector('.modal'));
  }
}

/** Close the active modal. */
export function closeModal() {
  const el = overlay();
  if (!el) return;
  el.classList.remove('active');
  el.innerHTML = '';
}

/**
 * Show a confirmation modal.
 * @param {string} title
 * @param {string} message
 * @param {function} onConfirm - Called when the user confirms
 * @param {string} confirmLabel - Button label (default "Confirm")
 * @param {string} confirmClass - Button class (default "btn-danger")
 */
export function confirmModal(title, message, onConfirm, confirmLabel = 'Confirm', confirmClass = 'btn-danger') {
  openModal({
    title,
    body: `<p style="color: var(--text-secondary); font-size: var(--font-sm); line-height: 1.6;">${message}</p>`,
    actions: [
      { label: 'Cancel', className: 'btn-secondary', id: 'modal-cancel-btn' },
      { label: confirmLabel, className: confirmClass, id: 'modal-confirm-btn' },
    ],
    onMount: (modal) => {
      modal.querySelector('#modal-cancel-btn').addEventListener('click', closeModal);
      modal.querySelector('#modal-confirm-btn').addEventListener('click', () => {
        closeModal();
        onConfirm();
      });
    },
  });
}
