import { matchesFilters, compareRows } from './logic.js';
import { isVisibleRow, refreshSelectionState } from './table.js';
import { FILE_TYPES, OTHER_TYPE } from './parse-name.js';
import { icon } from './icons.js';
import { collectHashes, downloadJson } from './hashes.js';

export const TOOLBAR_CSS = `
html[data-sfx-theme] .sfx-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px 14px;
  margin: 12px 0;
  padding: 12px 14px;
  background: var(--sfx-surface);
  border: 1px solid var(--sfx-border);
  border-radius: var(--sfx-radius);
  box-shadow: var(--sfx-shadow);
}
html[data-sfx-theme] .sfx-search { position: relative; display: block; flex: 1 1 260px; min-width: 200px; margin: 0; }
html[data-sfx-theme] .sfx-search .sfx-icon { position: absolute; left: 11px; top: 50%; transform: translateY(-50%); color: var(--sfx-muted); }
html[data-sfx-theme] .sfx-search input[type="search"] { width: 100%; height: 34px; padding: 4px 12px 4px 34px; font-size: 14px; font-weight: 400; }
html[data-sfx-theme] .sfx-toolbar input[type="number"] { width: 104px; height: 34px; padding: 4px 8px; -moz-appearance: textfield; appearance: textfield; }
html[data-sfx-theme] .sfx-toolbar input[type="number"]::-webkit-inner-spin-button,
html[data-sfx-theme] .sfx-toolbar input[type="number"]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
html[data-sfx-theme] .sfx-toolbar select { height: 34px; padding: 4px 8px; }
html[data-sfx-theme] .sfx-group { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; }
html[data-sfx-theme] .sfx-label { color: var(--sfx-muted); font-size: 12px; }
html[data-sfx-theme] .sfx-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border: 1px solid var(--sfx-border);
  border-radius: 999px;
  background: var(--sfx-surface-alt);
  color: var(--sfx-text);
  font-size: 12px;
  cursor: pointer;
}
html[data-sfx-theme] .sfx-chip:hover { border-color: var(--sfx-accent); }
html[data-sfx-theme] .sfx-chip[aria-pressed="true"] { background: var(--sfx-accent); border-color: var(--sfx-accent); color: #fff; }
html[data-sfx-theme] .sfx-chip-count { margin-left: 4px; opacity: 0.7; }
html[data-sfx-theme] .sfx-count { margin-left: auto; color: var(--sfx-muted); font-size: 13px; }
html[data-sfx-theme] .sfx-table > thead > tr > th.sfx-sortable { cursor: pointer; }
`;

export const SINCE_MS = { '24h': 86400000, '7d': 604800000, '30d': 2592000000 };
export const SORT_COLUMNS = {
  file: 'name', type: 'type', creators: 'creator', size: 'bytes', dls: 'downloads', hearts: 'hearts', added: 'added', last: 'lastDownload',
};
export const SORT_FIRST_DIR = {
  name: 'asc', type: 'asc', creator: 'asc', bytes: 'asc', downloads: 'desc', hearts: 'desc', added: 'desc', lastDownload: 'desc',
};

export function megabytesToBytes(value) {
  const n = parseFloat(value);
  return Number.isNaN(n) || n < 0 ? null : Math.round(n * 1024 * 1024);
}

export function h(doc, tag, props, ...children) {
  const node = doc.createElement(tag);
  Object.entries(props || {}).forEach(([k, v]) => node.setAttribute(k, v));
  node.append(...children);
  return node;
}

export function currentFilters(ctx) {
  const ui = ctx.ui;
  return {
    query: ui.search.value,
    types: ctx.activeTypes,
    creator: ui.creator.value || null,
    neverDownloaded: ui.never.getAttribute('aria-pressed') === 'true',
    minBytes: megabytesToBytes(ui.min.value),
    maxBytes: megabytesToBytes(ui.max.value),
    since: SINCE_MS[ui.since.value] ? Date.now() - SINCE_MS[ui.since.value] : null,
  };
}

export function applyFilters(ctx) {
  const filters = currentFilters(ctx);
  let visible = 0;
  ctx.rows.forEach((row) => {
    const show = matchesFilters(row, filters);
    row.tr.hidden = !show;
    if (show) visible++;
    else row.cb.checked = false;
  });
  ctx.ui.count.textContent = `${visible} of ${ctx.rows.length} files`;
  refreshSelectionState(ctx);
}

export function resetFilters(ctx) {
  const ui = ctx.ui;
  ui.search.value = '';
  ui.min.value = '';
  ui.max.value = '';
  ui.since.value = '';
  ui.creator.value = '';
  ui.never.setAttribute('aria-pressed', 'false');
  ctx.activeTypes.clear();
  ui.chips.forEach((chip) => chip.setAttribute('aria-pressed', 'false'));
  applyFilters(ctx);
}

export function buildToolbar(ctx) {
  const doc = ctx.doc;
  const counts = new Map();
  ctx.rows.forEach((r) => counts.set(r.type, (counts.get(r.type) || 0) + 1));
  const typeInfo = (id) => Object.values(FILE_TYPES).concat(OTHER_TYPE).find((t) => t.id === id);
  const chips = Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([id, n]) =>
      h(doc, 'button', { type: 'button', class: 'sfx-chip', 'data-type': id, 'aria-pressed': 'false' },
        icon(doc, typeInfo(id).icon), typeInfo(id).label, h(doc, 'span', { class: 'sfx-chip-count' }, String(n)))
    );
  const creatorCounts = new Map();
  let unknown = 0;
  ctx.rows.forEach((r) => {
    if (r.creators.length === 0) unknown++;
    r.creators.forEach((c) => creatorCounts.set(c.id, { name: c.name, n: ((creatorCounts.get(c.id) || {}).n || 0) + 1 }));
  });
  const creatorSelect = h(doc, 'select', { id: 'sfx-creator-filter', 'aria-label': 'Filter by creator' },
    h(doc, 'option', { value: '' }, 'All creators'),
    ...Array.from(creatorCounts.entries())
      .sort((a, b) => a[1].name.localeCompare(b[1].name, undefined, { sensitivity: 'base' }))
      .map(([id, c]) => h(doc, 'option', { value: id }, `${c.name} (${c.n})`)),
    ...(unknown > 0 ? [h(doc, 'option', { value: '__none' }, `No known creator (${unknown})`)] : []));
  const ui = {
    creator: creatorSelect,
    search: h(doc, 'input', { type: 'search', id: 'sfx-search', placeholder: 'Filter by name (use -word to exclude)' }),
    never: h(doc, 'button', { type: 'button', id: 'sfx-never-dl', class: 'sfx-chip', 'aria-pressed': 'false' }, 'Never downloaded'),
    min: h(doc, 'input', { type: 'number', id: 'sfx-min-size', min: '0', step: 'any', placeholder: 'Min MB' }),
    max: h(doc, 'input', { type: 'number', id: 'sfx-max-size', min: '0', step: 'any', placeholder: 'Max MB' }),
    since: h(doc, 'select', { id: 'sfx-since' },
      h(doc, 'option', { value: '' }, 'Any date'),
      h(doc, 'option', { value: '24h' }, 'Last 24 hours'),
      h(doc, 'option', { value: '7d' }, 'Last 7 days'),
      h(doc, 'option', { value: '30d' }, 'Last 30 days')),
    invert: h(doc, 'button', { type: 'button', id: 'sfx-invert', class: 'btn btn-default btn-sm' }, 'Invert selection'),
    hashes: h(doc, 'button', { type: 'button', id: 'sfx-export-hashes', class: 'btn btn-default btn-sm', title: 'Read the MD5 of each visible file from the server (no download) and save a JSON for the mods database' }, icon(doc, 'download'), ' Export hashes'),
    reset: h(doc, 'button', { type: 'button', id: 'sfx-clear', class: 'btn btn-default btn-sm' }, icon(doc, 'clear'), ' Reset filters'),
    count: h(doc, 'span', { id: 'sfx-visible-count', class: 'sfx-count' }),
    chips,
  };
  ctx.ui = ui;
  const toolbar = h(doc, 'div', { id: 'sfx-toolbar', class: 'sfx-toolbar' },
    h(doc, 'label', { class: 'sfx-search' }, icon(doc, 'search'), ui.search),
    h(doc, 'div', { class: 'sfx-group' }, ...chips, ui.never),
    h(doc, 'div', { class: 'sfx-group' }, h(doc, 'span', { class: 'sfx-label' }, 'Size'), ui.min, ui.max, ui.since),
    h(doc, 'div', { class: 'sfx-group' }, ui.creator),
    h(doc, 'div', { class: 'sfx-group' }, ui.invert, ui.hashes, ui.reset),
    ui.count);
  const anchor = doc.querySelector('.sfx-folders') || ctx.wrap;
  anchor.parentNode.insertBefore(toolbar, anchor);

  toolbar.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.matches('input, select')) e.preventDefault();
  });
  ['input', 'change'].forEach((type) => toolbar.addEventListener(type, (e) => {
    if (e.target.matches('input, select')) applyFilters(ctx);
  }));
  chips.forEach((chip) => chip.addEventListener('click', () => {
    const type = chip.dataset.type;
    const on = !ctx.activeTypes.has(type);
    if (on) ctx.activeTypes.add(type);
    else ctx.activeTypes.delete(type);
    chip.setAttribute('aria-pressed', String(on));
    applyFilters(ctx);
  }));
  ui.never.addEventListener('click', () => {
    ui.never.setAttribute('aria-pressed', String(ui.never.getAttribute('aria-pressed') !== 'true'));
    applyFilters(ctx);
  });
  ui.reset.addEventListener('click', () => resetFilters(ctx));
  ui.hashes.addEventListener('click', async () => {
    if (ui.hashes.disabled) return;
    const selected = ctx.rows.filter((r) => r.cb.checked && isVisibleRow(r));
    const targets = selected.length > 0 ? selected : ctx.rows.filter(isVisibleRow);
    const label = ui.hashes.lastChild;
    ui.hashes.disabled = true;
    const result = await collectHashes(ctx.win, targets, (done, total) => {
      label.textContent = ` ${done}/${total}`;
    });
    downloadJson(ctx.win, doc, result.entries, 'mods-export.json');
    if (result.skipped.length > 0) ctx.win.console.warn(`Sim File Share Enhancer: ${result.skipped.length} files without a usable MD5`, result.skipped);
    label.textContent = ` Export hashes`;
    ui.hashes.disabled = false;
  });
  ui.invert.addEventListener('click', () => {
    ctx.touched = true;
    ctx.rows.forEach((r) => {
      if (isVisibleRow(r)) r.cb.checked = !r.cb.checked;
    });
    refreshSelectionState(ctx);
  });
  applyFilters(ctx);
}

export function sortBy(ctx, key) {
  const same = ctx.sort && ctx.sort.key === key;
  const dir = same ? (ctx.sort.dir === 'asc' ? 'desc' : 'asc') : SORT_FIRST_DIR[key];
  ctx.sort = { key, dir };
  ctx.rows = [...ctx.rows].sort((a, b) => compareRows(a, b, key, dir));
  ctx.rows.forEach((r) => ctx.tbody.appendChild(r.tr));
  ctx.table.querySelectorAll('thead th').forEach((th) => {
    if (th.dataset.sfxKey === key) th.setAttribute('aria-sort', dir === 'asc' ? 'ascending' : 'descending');
    else th.removeAttribute('aria-sort');
  });
}

export function setupSorting(ctx) {
  const head = ctx.table.querySelector('thead');
  if (!head) return;
  head.querySelectorAll('th[data-sfx-col]').forEach((th) => {
    const key = SORT_COLUMNS[th.dataset.sfxCol];
    if (!key) return;
    th.dataset.sfxKey = key;
    th.classList.add('sfx-sortable');
    th.querySelectorAll('.glyphicon').forEach((g) => g.remove());
    const target = th.querySelector('a') || th;
    if (th.dataset.sfxCol === 'hearts') {
      th.title = 'Hearts';
      th.setAttribute('aria-label', 'Hearts');
      target.append(icon(ctx.doc, 'heart'));
    }
    target.append(icon(ctx.doc, 'sort'));
  });
  head.addEventListener('click', (e) => {
    const th = e.target.closest('th[data-sfx-key]');
    if (!th) return;
    e.preventDefault();
    sortBy(ctx, th.dataset.sfxKey);
  });
}
