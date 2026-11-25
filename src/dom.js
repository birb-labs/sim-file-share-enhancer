export function onReady(doc, fn) {
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', fn, { once: true });
  else fn();
}
