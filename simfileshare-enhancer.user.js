// ==UserScript==
// @name         Sim File Share Enhancer
// @namespace    https://simfileshare.net/
// @version      2.0.0
// @description  Modern theme, filters, sorting and safe bulk selection for Sim File Share.
// @author       p4tit0
// @match        https://simfileshare.net/*
// @match        https://www.simfileshare.net/*
// @run-at       document-start
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// ==/UserScript==

'use strict';

const SIZE_UNITS = { byte: 0, bytes: 0, kb: 1, mb: 2, gb: 3, tb: 4, pb: 5 };
const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

function parseSize(text) {
  const m = /^\s*([\d.,]+)\s*([a-z]+)\s*$/i.exec(text || '');
  if (!m) return null;
  const power = SIZE_UNITS[m[2].toLowerCase()];
  const value = parseFloat(m[1].replace(',', '.'));
  if (power === undefined || Number.isNaN(value)) return null;
  return Math.round(value * Math.pow(1024, power));
}

function parseDate(text) {
  const m = /^\s*([A-Za-z]+)\.?\s+(\d{1,2}),\s+(\d{4}),\s+(.+?)\s*$/.exec(text || '');
  if (!m) return null;
  const month = MONTHS.indexOf(m[1].slice(0, 3).toLowerCase());
  if (month < 0) return null;
  let hour;
  let minute = 0;
  const clock = m[4].toLowerCase();
  if (clock === 'noon') hour = 12;
  else if (clock === 'midnight') hour = 0;
  else {
    const t = /^(\d{1,2})(?::(\d{2}))?\s*([ap])\.?m\.?$/.exec(clock);
    if (!t) return null;
    hour = parseInt(t[1], 10) % 12 + (t[3] === 'p' ? 12 : 0);
    minute = t[2] ? parseInt(t[2], 10) : 0;
  }
  return new Date(parseInt(m[3], 10), month, parseInt(m[2], 10), hour, minute).getTime();
}

function extOf(name) {
  const i = name.lastIndexOf('.');
  if (i <= 0 || i === name.length - 1) return '(none)';
  return name.slice(i + 1).toLowerCase();
}

function matchesQuery(name, query) {
  const haystack = name.toLowerCase();
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((term) =>
      term.length > 1 && term[0] === '-' ? !haystack.includes(term.slice(1)) : haystack.includes(term)
    );
}

function matchesFilters(row, f) {
  if (!matchesQuery(row.name, f.query)) return false;
  if (f.exts.size > 0 && !f.exts.has(row.ext)) return false;
  if (f.neverDownloaded && row.downloads !== 0) return false;
  if (f.minBytes !== null && (row.bytes === null || row.bytes < f.minBytes)) return false;
  if (f.maxBytes !== null && (row.bytes === null || row.bytes > f.maxBytes)) return false;
  if (f.since !== null && (row.added === null || row.added < f.since)) return false;
  return true;
}

function compareRows(a, b, key, dir) {
  const x = a[key];
  const y = b[key];
  if (x === null && y === null) return 0;
  if (x === null) return 1;
  if (y === null) return -1;
  const result =
    key === 'name'
      ? x.localeCompare(y, undefined, { numeric: true, sensitivity: 'base' })
      : x - y;
  return dir === 'desc' ? -result : result;
}

function rangeIndices(a, b) {
  const lo = Math.min(a, b);
  const hi = Math.max(a, b);
  const out = [];
  for (let i = lo; i <= hi; i++) out.push(i);
  return out;
}

const THEME_KEY = 'sfx-theme';
const THEME_ORDER = ['system', 'light', 'dark'];
const THEME_LABELS = { system: 'Auto', light: 'Light', dark: 'Dark' };

const THEME_CSS = `
html[data-sfx-theme] {
  --sfx-radius: 10px;
  --sfx-accent: #07a4dc;
  --sfx-accent-strong: #068fc1;
  --sfx-success: #2db463;
  --sfx-danger: #d9534f;
  --sfx-nav-height: 50px;
  color-scheme: light;
}
html[data-sfx-theme="light"] {
  --sfx-bg: #f4f6f9;
  --sfx-surface: #ffffff;
  --sfx-surface-alt: #f8fafc;
  --sfx-text: #1f2937;
  --sfx-muted: #6b7280;
  --sfx-border: #e3e8ef;
  --sfx-hover: #eef8fd;
  --sfx-selected: #dcf1fa;
  --sfx-shadow: 0 1px 3px rgba(15, 23, 42, 0.08);
}
html[data-sfx-theme="dark"] {
  --sfx-bg: #0f1419;
  --sfx-surface: #171d25;
  --sfx-surface-alt: #1c2430;
  --sfx-text: #e5e9ef;
  --sfx-muted: #9aa4b2;
  --sfx-border: #2a3441;
  --sfx-hover: #1d2a37;
  --sfx-selected: #143a4d;
  --sfx-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
  color-scheme: dark;
}
html[data-sfx-theme] body {
  background: var(--sfx-bg);
  color: var(--sfx-text);
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}
html[data-sfx-theme] h1, html[data-sfx-theme] h2, html[data-sfx-theme] h3,
html[data-sfx-theme] h4, html[data-sfx-theme] h5, html[data-sfx-theme] h6 {
  color: var(--sfx-text);
  font-family: inherit;
}
html[data-sfx-theme] a { color: var(--sfx-accent); }
html[data-sfx-theme] a:hover { color: var(--sfx-accent-strong); }
html[data-sfx-theme] hr { border-color: var(--sfx-border); }
html[data-sfx-theme] .navbar-default {
  background: var(--sfx-surface);
  border-color: var(--sfx-border);
  box-shadow: var(--sfx-shadow);
}
html[data-sfx-theme] .navbar-default .navbar-brand,
html[data-sfx-theme] .navbar-default .navbar-nav > li > a { color: var(--sfx-text); }
html[data-sfx-theme] .navbar-default .navbar-nav > li > a:hover { color: var(--sfx-accent); }
html[data-sfx-theme] .btn { border-radius: 8px; font-weight: 500; }
html[data-sfx-theme] .btn-default {
  background: var(--sfx-surface);
  border-color: var(--sfx-border);
  color: var(--sfx-text);
}
html[data-sfx-theme] .btn-default:hover { background: var(--sfx-hover); }
html[data-sfx-theme] .btn-primary { background: var(--sfx-accent); border-color: var(--sfx-accent); color: #fff; }
html[data-sfx-theme] .btn-primary:hover { background: var(--sfx-accent-strong); border-color: var(--sfx-accent-strong); }
html[data-sfx-theme] .btn-success { background: var(--sfx-success); border-color: var(--sfx-success); color: #fff; }
html[data-sfx-theme] .btn-danger { background: var(--sfx-danger); border-color: var(--sfx-danger); color: #fff; }
html[data-sfx-theme] .form-control,
html[data-sfx-theme] input[type="text"],
html[data-sfx-theme] input[type="search"],
html[data-sfx-theme] input[type="number"],
html[data-sfx-theme] input[type="password"],
html[data-sfx-theme] select,
html[data-sfx-theme] textarea {
  background: var(--sfx-surface);
  border: 1px solid var(--sfx-border);
  border-radius: 8px;
  color: var(--sfx-text);
}
html[data-sfx-theme] .alert { border-radius: var(--sfx-radius); }
html[data-sfx-theme] .dropzone {
  background: var(--sfx-surface);
  border: 2px dashed var(--sfx-border);
  border-radius: var(--sfx-radius);
  color: var(--sfx-muted);
}
html[data-sfx-theme] .dropzone:hover { border-color: var(--sfx-accent); }
html[data-sfx-theme] #highchart {
  background: var(--sfx-surface);
  border-radius: var(--sfx-radius);
  box-shadow: var(--sfx-shadow);
}
html[data-sfx-theme] .highcharts-background { fill: var(--sfx-surface); }
html[data-sfx-theme] .highcharts-title,
html[data-sfx-theme] .highcharts-axis-labels text { fill: var(--sfx-muted) !important; }
html[data-sfx-theme] .highchart-btn {
  background: var(--sfx-surface);
  border: 1px solid var(--sfx-border);
  color: var(--sfx-text);
}
html[data-sfx-theme] .highchart-btn.btn-success { background: var(--sfx-accent); border-color: var(--sfx-accent); color: #fff; }
html[data-sfx-theme] #headerwrap { background: linear-gradient(135deg, #07a4dc, #068fc1); }
html[data-sfx-theme] footer, html[data-sfx-theme] footer p { color: var(--sfx-muted); }
html[data-sfx-theme] .table > thead > tr > th,
html[data-sfx-theme] .table > tbody > tr > td {
  border-color: var(--sfx-border);
  color: var(--sfx-text);
}
html[data-sfx-theme] .table { background: var(--sfx-surface); }
html[data-sfx-theme] .table-striped > tbody > tr:nth-of-type(odd) { background: var(--sfx-surface-alt); }
html[data-sfx-theme] .sfx-theme-toggle {
  margin: 11px 0 0 8px;
  padding: 4px 12px;
  border: 1px solid var(--sfx-border);
  border-radius: 999px;
  background: var(--sfx-surface-alt);
  color: var(--sfx-text);
  font-size: 12px;
  cursor: pointer;
}
html[data-sfx-theme] .sfx-theme-toggle:hover { border-color: var(--sfx-accent); }
`;

function resolveTheme(setting, prefersDark) {
  if (setting === 'light' || setting === 'dark') return setting;
  return prefersDark ? 'dark' : 'light';
}

function initTheme(win, doc, gm) {
  let setting = gm.getValue(THEME_KEY, 'system');
  if (!THEME_ORDER.includes(setting)) setting = 'system';
  const media = win.matchMedia ? win.matchMedia('(prefers-color-scheme: dark)') : null;
  const apply = () => {
    doc.documentElement.dataset.sfxTheme = resolveTheme(setting, media ? media.matches : false);
  };
  apply();
  if (media) media.addEventListener('change', apply);
  return {
    get setting() {
      return setting;
    },
    cycle() {
      setting = THEME_ORDER[(THEME_ORDER.indexOf(setting) + 1) % THEME_ORDER.length];
      gm.setValue(THEME_KEY, setting);
      apply();
      return setting;
    },
  };
}

function mountThemeToggle(doc, theme) {
  const nav = doc.querySelector('.navbar-nav.navbar-right');
  if (!nav || doc.getElementById('sfx-theme-toggle')) return;
  const button = doc.createElement('button');
  button.type = 'button';
  button.id = 'sfx-theme-toggle';
  button.className = 'sfx-theme-toggle';
  const label = () => {
    button.textContent = `Theme: ${THEME_LABELS[theme.setting]}`;
  };
  label();
  button.addEventListener('click', () => {
    theme.cycle();
    label();
  });
  const item = doc.createElement('li');
  item.appendChild(button);
  nav.appendChild(item);
}

const TABLE_CSS = `
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
html[data-sfx-theme] .sfx-table th:nth-child(1), html[data-sfx-theme] .sfx-table td:nth-child(1) { width: 40px; text-align: center; }
html[data-sfx-theme] .sfx-table th:nth-child(3), html[data-sfx-theme] .sfx-table td:nth-child(3) { width: 88px; text-align: right; }
html[data-sfx-theme] .sfx-table th:nth-child(4), html[data-sfx-theme] .sfx-table td:nth-child(4),
html[data-sfx-theme] .sfx-table th:nth-child(5), html[data-sfx-theme] .sfx-table td:nth-child(5) { width: 56px; text-align: right; }
html[data-sfx-theme] .sfx-table th:nth-child(6), html[data-sfx-theme] .sfx-table td:nth-child(6),
html[data-sfx-theme] .sfx-table th:nth-child(7), html[data-sfx-theme] .sfx-table td:nth-child(7) { width: 156px; }
html[data-sfx-theme] .sfx-table th:nth-child(8), html[data-sfx-theme] .sfx-table td:nth-child(8) { width: 136px; text-align: right; }
html[data-sfx-theme] .sfx-table input[type="checkbox"] { width: 16px; height: 16px; margin: 0; cursor: pointer; }
html[data-sfx-theme] .sfx-ext {
  display: inline-block;
  margin-left: 8px;
  padding: 1px 7px;
  border-radius: 999px;
  background: var(--sfx-surface-alt);
  border: 1px solid var(--sfx-border);
  color: var(--sfx-muted);
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  vertical-align: middle;
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

function cellText(td) {
  return td ? td.textContent.trim() : '';
}

function collectRows(doc) {
  const first = doc.querySelector('input[name="selectedfiles"]');
  if (!first) return [];
  return Array.from(first.closest('table').querySelectorAll('tbody tr'))
    .map((tr) => {
      const cb = tr.querySelector('input[name="selectedfiles"]');
      if (!cb) return null;
      const cells = tr.children;
      const link = cells[1].querySelector('a');
      const name = (link || cells[1]).textContent.trim();
      return {
        tr,
        cb,
        id: cb.value,
        name,
        ext: extOf(name),
        bytes: parseSize(cellText(cells[2])),
        downloads: parseInt(cellText(cells[3]), 10) || 0,
        hearts: parseInt(cellText(cells[4]), 10) || 0,
        added: parseDate(cellText(cells[5])),
        lastDownload: parseDate(cellText(cells[6])),
      };
    })
    .filter(Boolean);
}

function isVisibleRow(row) {
  return !row.tr.hidden;
}

function getSelected(rows) {
  return rows.filter((r) => r.cb.checked);
}

function setAllVisible(rows, checked) {
  rows.forEach((r) => {
    if (isVisibleRow(r)) r.cb.checked = checked;
  });
}

function refreshSelectionState(ctx) {
  const visible = ctx.rows.filter(isVisibleRow);
  const visibleChecked = visible.filter((r) => r.cb.checked).length;
  ctx.headerCb.checked = visible.length > 0 && visibleChecked === visible.length;
  ctx.headerCb.indeterminate = visibleChecked > 0 && visibleChecked < visible.length;
  ctx.rows.forEach((r) => r.tr.classList.toggle('sfx-selected', r.cb.checked));
  ctx.doc.dispatchEvent(
    new ctx.win.CustomEvent('sfx:selection', { detail: { count: getSelected(ctx.rows).length } })
  );
}

function clearSelection(ctx) {
  ctx.rows.forEach((r) => {
    r.cb.checked = false;
  });
  ctx.lastRow = null;
  refreshSelectionState(ctx);
}

function moveFolderRowsToChips(doc, tbody, wrap) {
  const chips = [];
  Array.from(tbody.querySelectorAll('tr')).forEach((tr) => {
    const link = tr.querySelector('a');
    if (tr.querySelector('input[name="selectedfiles"]') || !link) return;
    const strong = tr.querySelector('strong');
    const chip = doc.createElement('a');
    chip.className = 'sfx-folder-chip';
    chip.setAttribute('href', link.getAttribute('href'));
    const kind = doc.createElement('span');
    kind.className = 'sfx-folder-kind';
    kind.textContent = (strong ? strong.textContent : 'Folder').replace(/:\s*$/, '');
    chip.append(kind, ' ' + link.textContent.trim());
    chips.push(chip);
    tr.remove();
  });
  if (chips.length === 0) return;
  const bar = doc.createElement('div');
  bar.className = 'sfx-folders';
  bar.append(...chips);
  wrap.parentNode.insertBefore(bar, wrap);
}

function addExtensionBadge(doc, row) {
  if (row.ext === '(none)') return;
  const link = row.tr.children[1].querySelector('a');
  if (!link) return;
  link.title = row.name;
  const badge = doc.createElement('span');
  badge.className = 'sfx-ext';
  badge.textContent = row.ext;
  link.after(badge);
}

function measureNavbar(doc) {
  const nav = doc.querySelector('.navbar-fixed-top, .navbar');
  const height = nav ? nav.offsetHeight : 0;
  if (height) doc.documentElement.style.setProperty('--sfx-nav-height', `${height}px`);
}

function enhanceFileTable(doc, win) {
  const first = doc.querySelector('input[name="selectedfiles"]');
  if (!first) return null;
  const table = first.closest('table');
  const tbody = first.closest('tbody');
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
  rows.forEach((row) => addExtensionBadge(doc, row));
  const ctx = {
    doc, win, table, tbody, wrap, rows, headerCb,
    lastRow: null, touched: false, activeExts: new Set(), sort: null, ui: null,
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
    if (!ctx.touched) clearSelection(ctx);
  });
  win.addEventListener('pageshow', (e) => {
    if (e.persisted || !ctx.touched) clearSelection(ctx);
  });
  buildToolbar(ctx);
  setupSorting(ctx);
  clearSelection(ctx);
  return ctx;
}

const TOOLBAR_CSS = `
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
html[data-sfx-theme] .sfx-toolbar input[type="search"] { flex: 1 1 260px; min-width: 200px; height: 34px; padding: 4px 12px; }
html[data-sfx-theme] .sfx-toolbar input[type="number"] { width: 84px; height: 34px; padding: 4px 8px; }
html[data-sfx-theme] .sfx-toolbar select { height: 34px; padding: 4px 8px; }
html[data-sfx-theme] .sfx-group { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; }
html[data-sfx-theme] .sfx-label { color: var(--sfx-muted); font-size: 12px; }
html[data-sfx-theme] .sfx-chip {
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

const SINCE_MS = { '24h': 86400000, '7d': 604800000, '30d': 2592000000 };
const SORT_COLUMNS = { 1: 'name', 2: 'bytes', 3: 'downloads', 4: 'hearts', 5: 'added', 6: 'lastDownload' };
const SORT_FIRST_DIR = {
  name: 'asc', bytes: 'asc', downloads: 'desc', hearts: 'desc', added: 'desc', lastDownload: 'desc',
};

function megabytesToBytes(value) {
  const n = parseFloat(value);
  return Number.isNaN(n) || n < 0 ? null : Math.round(n * 1024 * 1024);
}

function h(doc, tag, props, ...children) {
  const node = doc.createElement(tag);
  Object.entries(props || {}).forEach(([k, v]) => node.setAttribute(k, v));
  node.append(...children);
  return node;
}

function currentFilters(ctx) {
  const ui = ctx.ui;
  return {
    query: ui.search.value,
    exts: ctx.activeExts,
    neverDownloaded: ui.never.getAttribute('aria-pressed') === 'true',
    minBytes: megabytesToBytes(ui.min.value),
    maxBytes: megabytesToBytes(ui.max.value),
    since: SINCE_MS[ui.since.value] ? Date.now() - SINCE_MS[ui.since.value] : null,
  };
}

function applyFilters(ctx) {
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

function resetFilters(ctx) {
  const ui = ctx.ui;
  ui.search.value = '';
  ui.min.value = '';
  ui.max.value = '';
  ui.since.value = '';
  ui.never.setAttribute('aria-pressed', 'false');
  ctx.activeExts.clear();
  ui.chips.forEach((chip) => chip.setAttribute('aria-pressed', 'false'));
  applyFilters(ctx);
}

function buildToolbar(ctx) {
  const doc = ctx.doc;
  const counts = new Map();
  ctx.rows.forEach((r) => counts.set(r.ext, (counts.get(r.ext) || 0) + 1));
  const chips = Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([ext, n]) =>
      h(doc, 'button', { type: 'button', class: 'sfx-chip', 'data-ext': ext, 'aria-pressed': 'false' },
        ext, h(doc, 'span', { class: 'sfx-chip-count' }, String(n)))
    );
  const ui = {
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
    reset: h(doc, 'button', { type: 'button', id: 'sfx-clear', class: 'btn btn-default btn-sm' }, 'Reset filters'),
    count: h(doc, 'span', { id: 'sfx-visible-count', class: 'sfx-count' }),
    chips,
  };
  ctx.ui = ui;
  const toolbar = h(doc, 'div', { id: 'sfx-toolbar', class: 'sfx-toolbar' },
    ui.search,
    h(doc, 'div', { class: 'sfx-group' }, ...chips, ui.never),
    h(doc, 'div', { class: 'sfx-group' }, h(doc, 'span', { class: 'sfx-label' }, 'Size'), ui.min, ui.max, ui.since),
    h(doc, 'div', { class: 'sfx-group' }, ui.invert, ui.reset),
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
    const ext = chip.dataset.ext;
    const on = !ctx.activeExts.has(ext);
    if (on) ctx.activeExts.add(ext);
    else ctx.activeExts.delete(ext);
    chip.setAttribute('aria-pressed', String(on));
    applyFilters(ctx);
  }));
  ui.never.addEventListener('click', () => {
    ui.never.setAttribute('aria-pressed', String(ui.never.getAttribute('aria-pressed') !== 'true'));
    applyFilters(ctx);
  });
  ui.reset.addEventListener('click', () => resetFilters(ctx));
  ui.invert.addEventListener('click', () => {
    ctx.touched = true;
    ctx.rows.forEach((r) => {
      if (isVisibleRow(r)) r.cb.checked = !r.cb.checked;
    });
    refreshSelectionState(ctx);
  });
  applyFilters(ctx);
}

function sortBy(ctx, key) {
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

function setupSorting(ctx) {
  const head = ctx.table.querySelector('thead');
  if (!head) return;
  const ths = head.querySelectorAll('th');
  Object.entries(SORT_COLUMNS).forEach(([index, key]) => {
    const th = ths[index];
    if (!th) return;
    th.dataset.sfxKey = key;
    th.classList.add('sfx-sortable');
  });
  head.addEventListener('click', (e) => {
    const th = e.target.closest('th[data-sfx-key]');
    if (!th) return;
    e.preventDefault();
    sortBy(ctx, th.dataset.sfxKey);
  });
}

function onReady(doc, fn) {
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', fn, { once: true });
  else fn();
}

function main(win, doc, gm) {
  gm.addStyle(THEME_CSS);
  gm.addStyle(TABLE_CSS);
  gm.addStyle(TOOLBAR_CSS);
  const theme = initTheme(win, doc, gm);
  onReady(doc, () => {
    mountThemeToggle(doc, theme);
    enhanceFileTable(doc, win);
  });
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    parseSize, parseDate, extOf, matchesQuery, matchesFilters, compareRows, rangeIndices,
    resolveTheme, collectRows, getSelected, setAllVisible, refreshSelectionState, enhanceFileTable, main,
  };
} else {
  main(window, document, { addStyle: GM_addStyle, getValue: GM_getValue, setValue: GM_setValue });
}
