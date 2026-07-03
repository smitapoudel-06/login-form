/* ============================================================
   LOADER — Loading Spinner Components
   ============================================================ */

/**
 * Returns HTML for a full-page loader.
 * @param {string} [message='Loading...']
 */
export function pageLoader(message = 'Loading...') {
  return `
    <div class="page-loader anim-fade-in">
      <div class="spinner spinner-lg"></div>
      <p>${message}</p>
    </div>
  `;
}

/**
 * Returns HTML for an inline spinner.
 * @param {'sm'|'md'|'lg'} [size='md']
 */
export function inlineSpinner(size = 'md') {
  const cls = size === 'sm' ? 'spinner spinner-sm' : size === 'lg' ? 'spinner spinner-lg' : 'spinner';
  return `<div class="${cls}"></div>`;
}

/**
 * Returns HTML for a button loading state.
 * @param {string} label
 */
export function buttonLoading(label = 'Loading...') {
  return `<div class="spinner spinner-sm" style="border-top-color: white;"></div> ${label}`;
}
