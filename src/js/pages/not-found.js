/* ============================================================
   NOT FOUND (404) PAGE
   ============================================================ */

export function renderNotFound(container) {
  container.innerHTML = `
    <div class="not-found-page anim-fade-in-up">
      <div class="not-found-code">404</div>
      <h2>Page not found</h2>
      <p>The page you're looking for doesn't exist or has been moved.</p>
      <a href="#/login" class="btn btn-primary">Go to Login</a>
    </div>
  `;
}
