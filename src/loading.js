export const LOADING_CSS = `
html:not([data-sfx-ready]) body { visibility: hidden; }
#sfx-loading {
  position: fixed;
  inset: 0;
  z-index: 2147483647;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  background: var(--sfx-bg, #f4f6f9);
  color: var(--sfx-text, #1f2937);
  font: 14px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  visibility: visible;
}
#sfx-loading svg { width: 44px; height: 44px; animation: sfx-spin 0.9s linear infinite; }
@keyframes sfx-spin { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) {
  #sfx-loading svg { animation: none; }
}
`;

export const LOADING_MARKUP =
  '<svg viewBox="0 0 24 24" fill="none" stroke="#07a4dc" stroke-width="2.4" stroke-linecap="round" aria-hidden="true">' +
  '<circle cx="12" cy="12" r="9" stroke-opacity="0.2"></circle><path d="M21 12a9 9 0 0 0-9-9"></path></svg>' +
  '<span>Loading</span>';

export function showLoading(doc) {
  if (doc.getElementById('sfx-loading')) return;
  const overlay = doc.createElement('div');
  overlay.id = 'sfx-loading';
  overlay.setAttribute('role', 'status');
  overlay.innerHTML = LOADING_MARKUP;
  doc.documentElement.appendChild(overlay);
}

export function markReady(doc) {
  doc.documentElement.setAttribute('data-sfx-ready', 'true');
  const overlay = doc.getElementById('sfx-loading');
  if (overlay) overlay.remove();
}
