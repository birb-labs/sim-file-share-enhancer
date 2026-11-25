import { getSelected, clearSelection } from './table.js';
import { h } from './toolbar.js';
import { icon } from './icons.js';

export const ACTIONBAR_CSS = `
html[data-sfx-theme] .sfx-actionbar {
  position: fixed;
  left: 50%;
  bottom: 18px;
  z-index: 1000;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  max-width: calc(100vw - 24px);
  padding: 10px 14px;
  transform: translateX(-50%);
  background: var(--sfx-surface);
  border: 1px solid var(--sfx-border);
  border-radius: 999px;
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.28);
}
html[data-sfx-theme] .sfx-actionbar[hidden] { display: none !important; }
html[data-sfx-theme] .sfx-actionbar .btn { margin: 0; float: none; }
html[data-sfx-theme] .sfx-selected-count { margin: 0 6px; font-weight: 600; }
`;

export function formatLinks(ids) {
  return ids.map((id) => `http://www.simfileshare.net/download/${id}/`).join('\n');
}

export function copyText(win, doc, text) {
  if (win.navigator.clipboard && win.navigator.clipboard.writeText) {
    return win.navigator.clipboard.writeText(text);
  }
  const area = doc.createElement('textarea');
  area.value = text;
  doc.body.appendChild(area);
  area.select();
  if (doc.execCommand) doc.execCommand('copy');
  area.remove();
  return Promise.resolve();
}

export function buildActionBar(ctx) {
  const { doc, win } = ctx;
  const form = ctx.table.closest('form');
  const add = form && form.querySelector('input[name="addfilestofolders"]');
  const del = form && form.querySelector('input[name="deletefiles"]');
  if (!form) return;
  if (!form.id) form.id = 'sfx-bulk-form';

  const count = h(doc, 'span', { class: 'sfx-selected-count' }, '0 selected');
  const copyLabel = h(doc, 'span', {}, 'Copy links');
  const copy = h(doc, 'button', { type: 'button', id: 'sfx-copy-links', class: 'btn btn-default btn-sm' }, icon(doc, 'copy'), ' ', copyLabel);
  const clear = h(doc, 'button', { type: 'button', id: 'sfx-clear-selection', class: 'btn btn-default btn-sm' }, icon(doc, 'clear'), ' Clear');
  const bar = h(doc, 'div', { id: 'sfx-actionbar', class: 'sfx-actionbar', hidden: '' }, count, copy, clear);
  [add, del].forEach((button) => {
    if (!button) return;
    button.setAttribute('form', form.id);
    button.classList.remove('pull-right');
    button.removeAttribute('style');
    bar.appendChild(button);
  });
  doc.body.appendChild(bar);

  const update = (n) => {
    bar.hidden = n === 0;
    count.textContent = `${n} selected`;
  };
  doc.addEventListener('sfx:selection', (e) => update(e.detail.count));
  update(getSelected(ctx.rows).length);

  clear.addEventListener('click', () => clearSelection(ctx));
  copy.addEventListener('click', () => {
    const ids = getSelected(ctx.rows).map((r) => r.id);
    copyText(win, doc, formatLinks(ids)).then(() => {
      copyLabel.textContent = `Copied ${ids.length}`;
      win.setTimeout(() => {
        copyLabel.textContent = 'Copy links';
      }, 1500);
    });
  });
  if (del) {
    del.addEventListener('click', (e) => {
      const names = getSelected(ctx.rows).map((r) => r.name);
      const n = names.length;
      const listed = names.slice(0, 5).map((name) => `- ${name}`).join('\n');
      const more = n > 5 ? `\nand ${n - 5} more` : '';
      const message = `Delete ${n} file${n === 1 ? '' : 's'}? This cannot be undone.\n\n${listed}${more}`;
      if (!win.confirm(message)) e.preventDefault();
    });
  }
}
