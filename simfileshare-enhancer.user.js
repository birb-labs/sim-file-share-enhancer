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

function main() {}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    parseSize, parseDate, extOf, matchesQuery, matchesFilters, compareRows, rangeIndices, main,
  };
} else {
  main(window, document, { addStyle: GM_addStyle, getValue: GM_getValue, setValue: GM_setValue });
}
