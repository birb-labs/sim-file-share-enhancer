const test = require('node:test');
const assert = require('node:assert/strict');
const L = require('../simfileshare-enhancer.user.js');
const { loadPage } = require('./helpers.js');

test('creators are a separate column with one chip per creator', async () => {
  const t = await loadPage();
  const first = t.row(0).querySelector('[data-sfx-col="creators"]');
  assert.deepEqual(Array.from(first.querySelectorAll('.sfx-creator')).map((c) => c.dataset.creator), ['littlbowbub']);
});

test('a creator chip opens a popup with Patreon, Tumblr and website options and closes with Escape', async () => {
  const t = await loadPage();
  t.click(t.row(0).querySelector('.sfx-creator'));
  const popup = t.doc.getElementById('sfx-popup');
  assert.ok(popup);
  const kinds = Array.from(popup.querySelectorAll('a')).map((a) => a.dataset.type);
  assert.deepEqual(kinds, ['patreon', 'tumblr', 'musthavemods']);
  popup.querySelectorAll('a').forEach((a) => assert.equal(a.getAttribute('rel'), 'noopener noreferrer'));
  t.doc.dispatchEvent(new t.win.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
  assert.equal(t.doc.getElementById('sfx-popup'), null);
});

test('the popup does not toggle the row selection', async () => {
  const t = await loadPage();
  t.click(t.row(0).querySelector('.sfx-creator'));
  assert.equal(t.checked(), 0);
});

test('the creator filter lists creators with counts and filters rows', async () => {
  const t = await loadPage();
  const select = t.doc.getElementById('sfx-creator-filter');
  const option = Array.from(select.options).find((o) => o.value === 'littlbowbub');
  assert.match(option.textContent, /^Littlbowbub \(\d+\)$/);
  t.type(select, 'littlbowbub', 'change');
  assert.ok(t.visible() > 0 && t.visible() < 33);
  Array.from(t.doc.querySelectorAll('#filelist tr:not([hidden])')).forEach((tr) => {
    assert.ok(tr.querySelector('.sfx-creator[data-creator="littlbowbub"]'));
  });
  t.type(select, '__none', 'change');
  Array.from(t.doc.querySelectorAll('#filelist tr:not([hidden])')).forEach((tr) => {
    assert.equal(tr.querySelector('.sfx-creator'), null);
  });
  t.click(t.doc.getElementById('sfx-clear'));
  assert.equal(select.value, '');
  assert.equal(t.visible(), 33);
});

test('dates are split in two lines and still sort by the real value', async () => {
  const t = await loadPage();
  const cell = t.row(0).querySelector('[data-sfx-col="added"]');
  assert.ok(cell.querySelector('.sfx-date') && cell.querySelector('.sfx-time'));
  assert.equal(cell.title, `${cell.querySelector('.sfx-date').textContent}, ${cell.querySelector('.sfx-time').textContent}`);
  const rows = L.collectRows(t.doc);
  assert.ok(rows.every((r) => r.added === null || typeof r.added === 'number'));
});

test('a creator can have several entries and the filename match returns all of them', () => {
  const saved = L.CREATORS.slice();
  L.registerCreators([
    { id: 'a', name: 'A', patterns: [{ source: '^dup_', flags: 'i' }], links: [{ type: 'site', url: 'https://a.example' }] },
    { id: 'b', name: 'B', patterns: [{ source: '^dup_', flags: 'i' }], links: [] },
  ]);
  assert.deepEqual(L.matchCreators('dup_x.package').map((c) => c.id), ['a', 'b']);
  L.registerCreators(saved);
});

test('the mods database overrides the filename guess', () => {
  L.registerMods([{ md5: 'a'.repeat(32), name: 'Some_Mod.package', size: 100, creators: ['lot51', 'casteru'] }]);
  const found = L.creatorsForFile('some_mod.package', 100);
  assert.deepEqual(found.creators.map((c) => c.id), ['lot51', 'casteru']);
  L.registerMods([]);
  assert.deepEqual(L.creatorsForFile('Some_Mod.package', 100).creators, []);
});

test('only a plain 32 hex ETag counts as an MD5', () => {
  const headers = (etag, len) => new Map([['etag', etag], ['content-length', len]]);
  const get = (m) => ({ get: (k) => m.get(k) });
  assert.deepEqual(L.parseHead(get(headers('"4a758fb6fc6781dd2ce8262de7ecd5a3"', '10'))), { md5: '4a758fb6fc6781dd2ce8262de7ecd5a3', size: 10 });
  assert.equal(L.parseHead(get(headers('"4a758fb6fc6781dd2ce8262de7ecd5a3-3"', '10'))).md5, null);
});

test('cached remote data is applied and a fresh cache skips the network', async () => {
  const gm = { getValue: (k, f) => (k === 'sfx-db' ? JSON.stringify({ at: Date.now(), creators: [], mods: [] }) : f), setValue() {} };
  assert.equal(await L.refreshData({ fetch: () => assert.fail('no request expected') }, gm), false);
  assert.equal(L.applyCachedData(gm), true);
});
