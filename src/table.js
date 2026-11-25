import { FILE_BOX, parseSize, parseDate, extOf, rangeIndices } from './logic.js';
import { h, buildToolbar, setupSorting } from './toolbar.js';
import { buildActionBar } from './actionbar.js';
import { PACK_CODES } from './creators.js';
import { typeOf, parseName } from './parse-name.js';
import { icon } from './icons.js';

export const TABLE_CSS = `
html[data-sfx-theme] .sfx-table-wrap { overflow: visible; border: 0; margin-bottom: 24px; }
html[data-sfx-theme] .sfx-table {
  table-layout: fixed;
  width: 100%;
  margin: 0;
  border-radius: var(--sfx-radius);
  box-shadow: var(--sfx-shadow);
}
html[data-sfx-theme] .sfx-table tr[hidden] { display: none !important; }
html[data-sfx-theme] .sfx-table > thead > tr > th {
  position: sticky;
  top: var(--sfx-nav-height);
  z-index: 5;
  background: var(--sfx-surface-alt);
  border-bottom: 2px solid var(--sfx-border);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  white-space: nowrap;
  vertical-align: middle;
}
html[data-sfx-theme] .sfx-table > thead > tr > th a { color: var(--sfx-muted); text-decoration: none; }
html[data-sfx-theme] .sfx-table > thead > tr > th[aria-sort] a { color: var(--sfx-accent); }
html[data-sfx-theme] .sfx-table > tbody > tr > td {
  padding: 6px 8px;
  vertical-align: middle;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
html[data-sfx-theme] .sfx-table > tbody > tr { cursor: pointer; user-select: none; }
html[data-sfx-theme] .sfx-table > tbody > tr:hover > td { background: var(--sfx-hover); }
html[data-sfx-theme] .sfx-table > tbody > tr.sfx-selected > td { background: var(--sfx-selected); }
html[data-sfx-theme] .sfx-table [data-sfx-col="check"] { width: 40px; text-align: center; }
html[data-sfx-theme] .sfx-table [data-sfx-col="type"] { width: 116px; }
html[data-sfx-theme] .sfx-table [data-sfx-col="size"] { width: 88px; text-align: right; }
html[data-sfx-theme] .sfx-table [data-sfx-col="dls"],
html[data-sfx-theme] .sfx-table [data-sfx-col="hearts"] { width: 56px; text-align: right; }
html[data-sfx-theme] .sfx-table [data-sfx-col="added"],
html[data-sfx-theme] .sfx-table [data-sfx-col="last"] { width: 176px; font-size: 12px; }
html[data-sfx-theme] .sfx-table [data-sfx-col="actions"] { width: 104px; text-align: right; }
html[data-sfx-theme] .sfx-table input[type="checkbox"] { width: 16px; height: 16px; margin: 0; cursor: pointer; }
html[data-sfx-theme] .sfx-file { display: flex; align-items: center; gap: 10px; min-width: 0; }
html[data-sfx-theme] .sfx-file-icon { flex: none; color: var(--sfx-muted); font-size: 22px; line-height: 1; }
html[data-sfx-theme] .sfx-file-main { flex: 1; min-width: 0; }
html[data-sfx-theme] .sfx-file-line { display: flex; align-items: center; gap: 6px; min-width: 0; }
html[data-sfx-theme] .sfx-file-title {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--sfx-text);
  font-weight: 600;
}
html[data-sfx-theme] .sfx-filename,
html[data-sfx-theme] .sfx-packs {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--sfx-muted);
  font-size: 12px;
}
html[data-sfx-theme] .sfx-creator {
  flex: 0 1 auto;
  max-width: 40%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
html[data-sfx-theme] .sfx-creator,
html[data-sfx-theme] .sfx-tag,
html[data-sfx-theme] .sfx-meta,
html[data-sfx-theme] .sfx-flag {
  flex: none;
  padding: 0 8px;
  border: 1px solid var(--sfx-border);
  border-radius: 999px;
  background: var(--sfx-surface-alt);
  color: var(--sfx-muted);
  font-size: 11px;
  line-height: 18px;
  text-decoration: none;
}
html[data-sfx-theme] .sfx-creator { color: var(--sfx-accent); }
html[data-sfx-theme] .sfx-tag { border-style: dashed; }
html[data-sfx-theme] .sfx-creator:hover { border-color: var(--sfx-accent); }
html[data-sfx-theme] .sfx-type { display: inline-flex; align-items: center; gap: 6px; color: var(--sfx-muted); }
html[data-sfx-theme] .sfx-table td[data-sfx-col="actions"] .btn { padding: 4px 9px; margin-left: 4px; }
html[data-sfx-theme] .sfx-table th .sfx-icon { margin-left: 4px; opacity: 0.55; }
@media (max-width: 1199px) {
  html[data-sfx-theme] .sfx-table [data-sfx-col="hearts"] { display: none; }
}
@media (max-width: 991px) {
  html[data-sfx-theme] .sfx-table [data-sfx-col="last"],
  html[data-sfx-theme] .sfx-table [data-sfx-col="type"] { display: none; }
}
@media (max-width: 767px) {
  html[data-sfx-theme] .sfx-table-wrap { overflow-x: auto; }
  html[data-sfx-theme] .sfx-table [data-sfx-col="added"] { display: none; }
  html[data-sfx-theme] .sfx-table { min-width: 440px; }
}
html[data-sfx-theme] .sfx-folders { display: flex; flex-wrap: wrap; gap: 8px; margin: 12px 0; }
html[data-sfx-theme] .sfx-folder-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border: 1px solid var(--sfx-border);
  border-radius: 999px;
  background: var(--sfx-surface);
  color: var(--sfx-text);
  text-decoration: none;
}
html[data-sfx-theme] .sfx-folder-chip:hover { border-color: var(--sfx-accent); color: var(--sfx-accent); }
html[data-sfx-theme] .sfx-folder-kind { color: var(--sfx-muted); font-size: 11px; text-transform: uppercase; }
`;

export function cellText(td) {
  return td ? td.textContent.trim() : '';
}

export const ORIGINAL_COLUMNS = ['check', 'file', 'size', 'dls', 'hearts', 'added', 'last', 'actions'];

export function cellOf(tr, key) {
  return Array.from(tr.children).find((c) => c.dataset.sfxCol === key);
}

export function prepareColumns(table) {
  if (table.querySelector('[data-sfx-col="type"]')) return;
  const doc = table.ownerDocument;
  table.querySelectorAll('thead tr, tbody tr').forEach((tr) => {
    const isHead = Boolean(tr.closest('thead'));
    if (!isHead && !tr.querySelector(FILE_BOX)) return;
    ORIGINAL_COLUMNS.forEach((key, i) => {
      if (tr.children[i]) tr.children[i].dataset.sfxCol = key;
    });
    const file = cellOf(tr, 'file');
    if (!file) return;
    const type = doc.createElement(isHead ? 'th' : 'td');
    type.dataset.sfxCol = 'type';
    if (isHead) type.textContent = 'Type';
    file.after(type);
  });
}

export function collectRows(doc) {
  const first = doc.querySelector(FILE_BOX);
  const table = first && first.closest('table');
  if (!table) return [];
  prepareColumns(table);
  return Array.from(table.querySelectorAll('tbody tr'))
    .map((tr) => {
      const cb = tr.querySelector(FILE_BOX);
      if (!cb) return null;
      const fileCell = cellOf(tr, 'file');
      const nameEl = fileCell.querySelector('.sfx-filename') || fileCell.querySelector('a') || fileCell;
      const name = nameEl.textContent.trim();
      const ext = extOf(name);
      const info = parseName(name);
      return {
        tr,
        cb,
        id: cb.value,
        name,
        ext,
        type: typeOf(ext).id,
        title: info.title,
        creator: info.creator ? info.creator.name : null,
        info,
        bytes: parseSize(cellText(cellOf(tr, 'size'))),
        downloads: parseInt(cellText(cellOf(tr, 'dls')), 10) || 0,
        hearts: parseInt(cellText(cellOf(tr, 'hearts')), 10) || 0,
        added: parseDate(cellText(cellOf(tr, 'added'))),
        lastDownload: parseDate(cellText(cellOf(tr, 'last'))),
      };
    })
    .filter(Boolean);
}

export function isVisibleRow(row) {
  return !row.tr.hidden;
}

export function getSelected(rows) {
  return rows.filter((r) => r.cb.checked);
}

export function setAllVisible(rows, checked) {
  rows.forEach((r) => {
    if (isVisibleRow(r)) r.cb.checked = checked;
  });
}

export function refreshSelectionState(ctx) {
  const visible = ctx.rows.filter(isVisibleRow);
  const visibleChecked = visible.filter((r) => r.cb.checked).length;
  ctx.headerCb.checked = visible.length > 0 && visibleChecked === visible.length;
  ctx.headerCb.indeterminate = visibleChecked > 0 && visibleChecked < visible.length;
  ctx.rows.forEach((r) => r.tr.classList.toggle('sfx-selected', r.cb.checked));
  ctx.doc.dispatchEvent(
    new ctx.win.CustomEvent('sfx:selection', { detail: { count: getSelected(ctx.rows).length } })
  );
}

export function clearSelection(ctx) {
  ctx.rows.forEach((r) => {
    r.cb.checked = false;
  });
  ctx.lastRow = null;
  refreshSelectionState(ctx);
}

export function clearRestoredSelection(ctx) {
  ctx.rows.forEach((r) => {
    if (r.cb.checked && !r.cb.defaultChecked) r.cb.checked = false;
  });
  ctx.lastRow = null;
  refreshSelectionState(ctx);
}

export function moveFolderRowsToChips(doc, tbody, wrap) {
  const chips = [];
  Array.from(tbody.querySelectorAll('tr')).forEach((tr) => {
    const link = tr.querySelector('a');
    if (tr.querySelector(FILE_BOX) || !link) return;
    const strong = tr.querySelector('strong');
    const chip = doc.createElement('a');
    chip.className = 'sfx-folder-chip';
    chip.setAttribute('href', link.getAttribute('href'));
    const kind = doc.createElement('span');
    kind.className = 'sfx-folder-kind';
    kind.textContent = (strong ? strong.textContent : 'Folder').replace(/:\s*$/, '');
    chip.append(icon(doc, 'folder'), kind, ' ' + link.textContent.trim());
    chips.push(chip);
    tr.remove();
  });
  if (chips.length === 0) return;
  const bar = doc.createElement('div');
  bar.className = 'sfx-folders';
  bar.append(...chips);
  wrap.parentNode.insertBefore(bar, wrap);
}

export function renderFileRow(doc, row) {
  const info = row.info;
  const fileCell = cellOf(row.tr, 'file');
  const type = typeOf(row.ext);
  const link = fileCell.querySelector('a') || h(doc, 'a', { href: `/filedetails/${row.id}/` });
  link.className = 'sfx-file-title';
  link.textContent = info.title;
  link.title = row.name;
  const line = h(doc, 'div', { class: 'sfx-file-line' }, link);
  if (info.creator) {
    line.append(h(doc, 'a', {
      class: 'sfx-creator', href: info.creator.url, target: '_blank', rel: 'noopener noreferrer',
      title: `Creator: ${info.creator.name}`,
    }, info.creator.name));
  } else if (info.tag) {
    line.append(h(doc, 'span', { class: 'sfx-tag', title: 'Tag from the filename, not a verified creator' }, info.tag));
  }
  if (info.version) line.append(h(doc, 'span', { class: 'sfx-meta' }, `v${info.version}`));
  info.flags.forEach((flag) => line.append(h(doc, 'span', { class: 'sfx-flag' }, flag)));
  const main = h(doc, 'div', { class: 'sfx-file-main' }, line, h(doc, 'span', { class: 'sfx-filename' }, row.name));
  if (info.packs.length > 0) {
    const names = info.packs.map((code) => (PACK_CODES[code] ? `${PACK_CODES[code]} (${code})` : code));
    main.append(h(doc, 'span', { class: 'sfx-packs' }, `May require: ${names.join(', ')}`));
  }
  fileCell.textContent = '';
  fileCell.append(h(doc, 'div', { class: 'sfx-file' }, h(doc, 'span', { class: 'sfx-file-icon' }, icon(doc, type.icon)), main));
  cellOf(row.tr, 'type').append(h(doc, 'span', { class: 'sfx-type', 'data-type': type.id }, icon(doc, type.icon), type.label));
}

export function iconizeActions(doc, tr) {
  const cell = cellOf(tr, 'actions');
  if (!cell) return;
  cell.querySelectorAll('a').forEach((a) => {
    const copy = a.querySelector('.glyphicon-link') || (a.getAttribute('onclick') || '').startsWith('copyURL');
    const download = (a.getAttribute('href') || '').startsWith('/download/');
    if (!copy && !download) return;
    a.textContent = '';
    a.append(icon(doc, copy ? 'link' : 'download'));
    const label = copy ? 'Copy link' : 'Download';
    a.setAttribute('aria-label', label);
    a.title = label;
  });
}

export function measureNavbar(doc) {
  const nav = doc.querySelector('.navbar-fixed-top, .navbar');
  const height = nav ? nav.offsetHeight : 0;
  if (height) doc.documentElement.style.setProperty('--sfx-nav-height', `${height}px`);
}

export function enhanceFileTable(doc, win) {
  const first = doc.querySelector(FILE_BOX);
  const table = first && first.closest('table');
  const tbody = first && first.closest('tbody');
  if (!table || !tbody) return null;
  const wrap = table.closest('.table-responsive') || table;
  table.classList.add('sfx-table');
  wrap.classList.add('sfx-table-wrap');
  moveFolderRowsToChips(doc, tbody, wrap);
  measureNavbar(doc);

  const headerCb = doc.createElement('input');
  headerCb.type = 'checkbox';
  headerCb.id = 'sfx-select-all';
  headerCb.title = 'Select or clear all visible files';
  headerCb.setAttribute('aria-label', 'Select or clear all visible files');
  const headerCell = table.querySelector('thead th');
  if (headerCell) {
    headerCell.textContent = '';
    headerCell.appendChild(headerCb);
  }

  const rows = collectRows(doc);
  rows.forEach((row) => {
    renderFileRow(doc, row);
    iconizeActions(doc, row.tr);
  });
  const ctx = {
    doc, win, table, tbody, wrap, rows, headerCb,
    lastRow: null, touched: false, activeTypes: new Set(), sort: null, ui: null,
  };

  headerCb.addEventListener('change', () => {
    ctx.touched = true;
    setAllVisible(ctx.rows, headerCb.checked);
    refreshSelectionState(ctx);
  });

  tbody.addEventListener('click', (e) => {
    const row = ctx.rows.find((r) => r.tr === e.target.closest('tr'));
    if (!row) return;
    const onBox = e.target === row.cb;
    if (!onBox && e.target.closest('a, button, input, label, .btn')) return;
    ctx.touched = true;
    const next = onBox ? row.cb.checked : !row.cb.checked;
    row.cb.checked = next;
    if (e.shiftKey && ctx.lastRow) {
      const visible = ctx.rows.filter(isVisibleRow);
      const from = visible.indexOf(ctx.lastRow);
      const to = visible.indexOf(row);
      if (from >= 0 && to >= 0) rangeIndices(from, to).forEach((i) => (visible[i].cb.checked = next));
    }
    ctx.lastRow = row;
    refreshSelectionState(ctx);
  });

  win.addEventListener('load', () => {
    if (!ctx.touched) clearRestoredSelection(ctx);
  });
  win.addEventListener('pageshow', (e) => {
    if (e.persisted || !ctx.touched) clearRestoredSelection(ctx);
  });
  buildToolbar(ctx);
  setupSorting(ctx);
  buildActionBar(ctx);
  clearRestoredSelection(ctx);
  return ctx;
}
