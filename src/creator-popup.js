import { LINK_TYPES } from './creators.js';
import { h } from './toolbar.js';
import { icon } from './icons.js';

export const POPUP_CSS = `
html[data-sfx-theme] .sfx-popup-backdrop {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: rgba(0, 0, 0, 0.5);
}
html[data-sfx-theme] .sfx-popup {
  width: min(420px, 100%);
  max-height: 90vh;
  overflow: auto;
  padding: 18px;
  border: 1px solid var(--sfx-border);
  border-radius: var(--sfx-radius);
  background: var(--sfx-surface);
  color: var(--sfx-text);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.35);
}
html[data-sfx-theme] .sfx-popup-head { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
html[data-sfx-theme] .sfx-popup-head img { width: 56px; height: 56px; border-radius: 10px; object-fit: cover; flex: none; }
html[data-sfx-theme] .sfx-popup-title { flex: 1; min-width: 0; margin: 0; font-size: 18px; font-weight: 600; }
html[data-sfx-theme] .sfx-popup-close { border: 0; background: none; color: var(--sfx-muted); cursor: pointer; font-size: 18px; }
html[data-sfx-theme] .sfx-popup-links { display: flex; flex-direction: column; gap: 8px; margin: 0; padding: 0; list-style: none; }
html[data-sfx-theme] .sfx-popup-links a {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 12px;
  border: 1px solid var(--sfx-border);
  border-radius: 8px;
  color: var(--sfx-text);
  text-decoration: none;
}
html[data-sfx-theme] .sfx-popup-links a:hover { border-color: var(--sfx-accent); color: var(--sfx-accent); }
html[data-sfx-theme] .sfx-popup-kind { flex: none; min-width: 96px; color: var(--sfx-muted); font-size: 12px; text-transform: uppercase; }
html[data-sfx-theme] .sfx-popup-url { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 13px; }
html[data-sfx-theme] .sfx-popup-empty { margin: 0; color: var(--sfx-muted); }
`;

const LABELS = {
  patreon: 'Patreon',
  tumblr: 'Tumblr',
  site: 'Website',
  itch: 'itch.io',
  kofi: 'Ko-fi',
  musthavemods: 'MustHaveMods',
  other: 'Other',
};

export function sortedLinks(creator) {
  const rank = (type) => {
    const i = LINK_TYPES.indexOf(type);
    return i < 0 ? LINK_TYPES.length : i;
  };
  return [...(creator.links || [])].sort((a, b) => rank(a.type) - rank(b.type));
}

function hostOf(url) {
  try {
    const u = new URL(url);
    return (u.hostname.replace(/^www\./, '') + u.pathname).replace(/\/$/, '');
  } catch {
    return url;
  }
}

export function openCreatorPopup(doc, creator) {
  closeCreatorPopup(doc);
  const links = sortedLinks(creator);
  const close = h(doc, 'button', { type: 'button', class: 'sfx-popup-close', 'aria-label': 'Close' }, icon(doc, 'clear'));
  const head = h(doc, 'div', { class: 'sfx-popup-head' });
  if (creator.image) head.append(h(doc, 'img', { src: creator.image, alt: '', loading: 'lazy', referrerpolicy: 'no-referrer' }));
  head.append(h(doc, 'h2', { class: 'sfx-popup-title', id: 'sfx-popup-title' }, creator.name), close);
  const body = links.length > 0
    ? h(doc, 'ul', { class: 'sfx-popup-links' }, ...links.map((link) =>
      h(doc, 'li', {}, h(doc, 'a', { href: link.url, target: '_blank', rel: 'noopener noreferrer', 'data-type': link.type },
        h(doc, 'span', { class: 'sfx-popup-kind' }, link.label || LABELS[link.type] || LABELS.other),
        h(doc, 'span', { class: 'sfx-popup-url' }, hostOf(link.url)),
        icon(doc, 'link')))))
    : h(doc, 'p', { class: 'sfx-popup-empty' }, 'No official links are known for this creator yet.');
  const dialog = h(doc, 'div', { class: 'sfx-popup', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'sfx-popup-title' }, head, body);
  const backdrop = h(doc, 'div', { id: 'sfx-popup', class: 'sfx-popup-backdrop' }, dialog);
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) closeCreatorPopup(doc);
  });
  close.addEventListener('click', () => closeCreatorPopup(doc));
  doc.addEventListener('keydown', onKey);
  doc.body.appendChild(backdrop);
  close.focus();
  return backdrop;
}

function onKey(e) {
  if (e.key === 'Escape') closeCreatorPopup(e.target.ownerDocument || e.target);
}

export function closeCreatorPopup(doc) {
  const open = doc.getElementById('sfx-popup');
  doc.removeEventListener('keydown', onKey);
  if (open) open.remove();
}
