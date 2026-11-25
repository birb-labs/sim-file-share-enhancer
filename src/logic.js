export const FILE_BOX = 'input[type="checkbox"][name="selectedfiles"]';
export const SIZE_UNITS = { byte: 0, bytes: 0, kb: 1, mb: 2, gb: 3, tb: 4, pb: 5 };
export const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

export function parseSize(text) {
  const m = /^\s*([\d.,]+)\s*([a-z]+)\s*$/i.exec(text || '');
  if (!m) return null;
  const power = SIZE_UNITS[m[2].toLowerCase()];
  const value = parseFloat(m[1].replace(',', '.'));
  if (power === undefined || Number.isNaN(value)) return null;
  return Math.round(value * Math.pow(1024, power));
}

export function parseDate(text) {
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

export function extOf(name) {
  const i = name.lastIndexOf('.');
  if (i <= 0 || i === name.length - 1) return '(none)';
  return name.slice(i + 1).toLowerCase();
}

export function matchesQuery(name, query) {
  const haystack = name.toLowerCase();
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((term) =>
      term.length > 1 && term[0] === '-' ? !haystack.includes(term.slice(1)) : haystack.includes(term)
    );
}

export function matchesFilters(row, f) {
  if (!matchesQuery(`${row.name} ${row.creator || ''}`, f.query)) return false;
  if (f.types.size > 0 && !f.types.has(row.type)) return false;
  if (f.creator) {
    const ids = row.creatorIds || [];
    if (f.creator === '__none' ? ids.length > 0 : !ids.includes(f.creator)) return false;
  }
  if (f.neverDownloaded && row.downloads !== 0) return false;
  if (f.minBytes !== null && (row.bytes === null || row.bytes < f.minBytes)) return false;
  if (f.maxBytes !== null && (row.bytes === null || row.bytes > f.maxBytes)) return false;
  if (f.since !== null && (row.added === null || row.added < f.since)) return false;
  return true;
}

export function compareRows(a, b, key, dir) {
  const x = a[key];
  const y = b[key];
  if (x === null && y === null) return 0;
  if (x === null) return 1;
  if (y === null) return -1;
  const result =
    typeof x === 'string'
      ? x.localeCompare(y, undefined, { numeric: true, sensitivity: 'base' })
      : x - y;
  return dir === 'desc' ? -result : result;
}

export function rangeIndices(a, b) {
  const lo = Math.min(a, b);
  const hi = Math.max(a, b);
  const out = [];
  for (let i = lo; i <= hi; i++) out.push(i);
  return out;
}
