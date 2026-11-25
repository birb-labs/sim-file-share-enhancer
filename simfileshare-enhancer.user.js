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

function onReady(doc, fn) {
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', fn, { once: true });
  else fn();
}

function main(win, doc, gm) {
  gm.addStyle(THEME_CSS);
  const theme = initTheme(win, doc, gm);
  onReady(doc, () => {
    mountThemeToggle(doc, theme);
  });
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    parseSize, parseDate, extOf, matchesQuery, matchesFilters, compareRows, rangeIndices,
    resolveTheme, main,
  };
} else {
  main(window, document, { addStyle: GM_addStyle, getValue: GM_getValue, setValue: GM_setValue });
}
