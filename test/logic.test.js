const test = require('node:test');
const assert = require('node:assert/strict');
const L = require('../simfileshare-enhancer.user.js');

test('parseSize reads Django filesize strings', () => {
  assert.equal(L.parseSize('96 Bytes'), 96);
  assert.equal(L.parseSize('1 Byte'), 1);
  assert.equal(L.parseSize('8.9 kB'), 9114);
  assert.equal(L.parseSize('1.5 MB'), 1572864);
  assert.equal(L.parseSize('1,5 MB'), 1572864);
  assert.equal(L.parseSize(''), null);
  assert.equal(L.parseSize('garbage'), null);
});

test('parseDate reads Django date strings in local time', () => {
  const at = (y, m, d, h, min) => new Date(y, m, d, h, min).getTime();
  assert.equal(L.parseDate('Nov. 25, 2026, 3:42 a.m.'), at(2026, 10, 25, 3, 42));
  assert.equal(L.parseDate('Nov. 25, 2026, noon'), at(2026, 10, 25, 12, 0));
  assert.equal(L.parseDate('Nov. 25, 2026, midnight'), at(2026, 10, 25, 0, 0));
  assert.equal(L.parseDate('Sept. 5, 2026, 1 p.m.'), at(2026, 8, 5, 13, 0));
  assert.equal(L.parseDate('May 3, 2026, 12:05 p.m.'), at(2026, 4, 3, 12, 5));
  assert.equal(L.parseDate('May 3, 2026, 12:05 a.m.'), at(2026, 4, 3, 0, 5));
  assert.equal(L.parseDate('3 a.m. on Nov. 25'), null);
  assert.equal(L.parseDate(''), null);
  assert.equal(L.parseDate('None'), null);
});

test('extOf returns the lowercase last extension or (none)', () => {
  assert.equal(L.extOf('a.package.PACKAGE'), 'package');
  assert.equal(L.extOf('Makefile'), '(none)');
  assert.equal(L.extOf('.hidden'), '(none)');
  assert.equal(L.extOf('trailing.'), '(none)');
});

test('matchesQuery requires every term and honors minus exclusions', () => {
  assert.equal(L.matchesQuery('LBB_Recipe_Drink.package', 'drink lbb'), true);
  assert.equal(L.matchesQuery('LBB_Recipe_Drink.package', 'drink -package'), false);
  assert.equal(L.matchesQuery('LBB_Recipe_Drink.package', 'cake'), false);
  assert.equal(L.matchesQuery('anything', ''), true);
  assert.equal(L.matchesQuery('anything', '   '), true);
  assert.equal(L.matchesQuery('a-b.package', '-'), true);
});

const row = (o) => ({
  name: 'a.package', ext: 'package', bytes: 1000, downloads: 0, hearts: 0,
  added: 1000, lastDownload: null, ...o,
});
const filters = (o) => ({
  query: '', exts: new Set(), neverDownloaded: false,
  minBytes: null, maxBytes: null, since: null, ...o,
});

test('matchesFilters combines extension, downloads, size and date', () => {
  assert.equal(L.matchesFilters(row({}), filters({})), true);
  assert.equal(L.matchesFilters(row({}), filters({ exts: new Set(['log']) })), false);
  assert.equal(L.matchesFilters(row({}), filters({ exts: new Set(['log', 'package']) })), true);
  assert.equal(L.matchesFilters(row({ downloads: 2 }), filters({ neverDownloaded: true })), false);
  assert.equal(L.matchesFilters(row({ downloads: 0 }), filters({ neverDownloaded: true })), true);
  assert.equal(L.matchesFilters(row({ bytes: 500 }), filters({ minBytes: 1000 })), false);
  assert.equal(L.matchesFilters(row({ bytes: 5000 }), filters({ maxBytes: 1000 })), false);
  assert.equal(L.matchesFilters(row({ bytes: 1000 }), filters({ minBytes: 1000, maxBytes: 1000 })), true);
  assert.equal(L.matchesFilters(row({ added: 500 }), filters({ since: 1000 })), false);
  assert.equal(L.matchesFilters(row({ added: null }), filters({ since: 1000 })), false);
  assert.equal(L.matchesFilters(row({ name: 'zzz' }), filters({ query: 'a.pack' })), false);
});

test('compareRows orders by key and keeps null last in both directions', () => {
  const a = row({ name: 'a', bytes: 10, lastDownload: 5 });
  const b = row({ name: 'b', bytes: 20, lastDownload: null });
  assert.ok(L.compareRows(a, b, 'name', 'asc') < 0);
  assert.ok(L.compareRows(a, b, 'name', 'desc') > 0);
  assert.ok(L.compareRows(a, b, 'bytes', 'desc') > 0);
  assert.ok(L.compareRows(a, b, 'lastDownload', 'asc') < 0);
  assert.ok(L.compareRows(a, b, 'lastDownload', 'desc') < 0);
  assert.equal(L.compareRows(a, a, 'bytes', 'asc'), 0);
});

test('compareRows sorts names naturally and ignoring case', () => {
  const a = row({ name: 'file2.package' });
  const b = row({ name: 'File10.package' });
  assert.ok(L.compareRows(a, b, 'name', 'asc') < 0);
});

test('rangeIndices is inclusive and order independent', () => {
  assert.deepEqual(L.rangeIndices(5, 2), [2, 3, 4, 5]);
  assert.deepEqual(L.rangeIndices(2, 5), [2, 3, 4, 5]);
  assert.deepEqual(L.rangeIndices(3, 3), [3]);
});
