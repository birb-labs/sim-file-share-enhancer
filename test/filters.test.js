const test = require('node:test');
const assert = require('node:assert/strict');
const { loadPage } = require('./helpers.js');

const firstName = (t) => t.row(0).children[1].textContent;

test('search filters by name and updates the visible count', async () => {
  const t = await loadPage();
  t.type(t.doc.querySelector('#sfx-search'), 'appetiser');
  assert.equal(t.visible(), 11);
  assert.equal(t.doc.querySelector('#sfx-visible-count').textContent, '11 of 33 files');
  t.type(t.doc.querySelector('#sfx-search'), 'appetiser -garlic');
  assert.equal(t.visible(), 10);
});

test('extension chips filter with OR and show their counts', async () => {
  const t = await loadPage();
  const chip = (ext) => t.doc.querySelector(`.sfx-chip[data-type="${ext}"]`);
  assert.ok(chip('package').textContent.includes('29'));
  assert.ok(chip('script').textContent.includes('2'));
  chip('package').click();
  assert.equal(t.visible(), 29);
  chip('log').click();
  assert.equal(t.visible(), 30);
  assert.equal(chip('log').getAttribute('aria-pressed'), 'true');
});

test('never downloaded hides rows that have downloads', async () => {
  const t = await loadPage();
  t.doc.querySelector('#sfx-never-dl').click();
  assert.equal(t.visible(), 31);
});

test('size and date filters narrow the list', async (ctx) => {
  const t = await loadPage();
  t.type(t.doc.querySelector('#sfx-min-size'), '100');
  assert.equal(t.visible(), 2);
  t.type(t.doc.querySelector('#sfx-min-size'), '');
  assert.equal(t.visible(), 33);
  ctx.mock.timers.enable({ apis: ['Date'], now: new Date(2026, 10, 25, 12, 30).getTime() });
  t.type(t.doc.querySelector('#sfx-since'), '24h', 'change');
  assert.equal(t.visible(), 31);
});

test('a checked row that gets filtered out is unchecked', async () => {
  const t = await loadPage();
  const counts = [];
  t.doc.addEventListener('sfx:selection', (e) => counts.push(e.detail.count));
  t.header().click();
  assert.equal(t.checked(), 33);
  t.type(t.doc.querySelector('#sfx-search'), 'garlic');
  assert.equal(t.checked(), 1);
  assert.equal(counts[counts.length - 1], 1);
  t.doc.querySelector('#sfx-clear').click();
  assert.equal(t.visible(), 33);
  assert.equal(t.checked(), 1);
});

test('select all with an active filter checks only visible rows', async () => {
  const t = await loadPage();
  t.type(t.doc.querySelector('#sfx-search'), 'appetiser');
  t.header().click();
  assert.equal(t.checked(), 11);
  t.doc.querySelector('#sfx-clear').click();
  assert.equal(t.checked(), 11);
  assert.equal(t.header().indeterminate, true);
});

test('invert flips visible rows and never selects hidden ones', async () => {
  const t = await loadPage();
  t.type(t.doc.querySelector('#sfx-search'), 'appetiser');
  t.click(t.row(0).children[2]);
  t.doc.querySelector('#sfx-invert').click();
  assert.equal(t.checked(), 10);
  assert.equal(t.boxes()[0].checked, false);
  assert.equal(t.boxes().filter((b) => b.checked && b.closest('tr').hidden).length, 0);
});

test('reset restores every row, the inputs and the chips', async () => {
  const t = await loadPage();
  t.type(t.doc.querySelector('#sfx-search'), 'appetiser');
  t.doc.querySelector('.sfx-chip[data-type="package"]').click();
  t.doc.querySelector('#sfx-never-dl').click();
  t.doc.querySelector('#sfx-clear').click();
  assert.equal(t.visible(), 33);
  assert.equal(t.doc.querySelector('#sfx-search').value, '');
  assert.equal(t.doc.querySelector('.sfx-chip[data-type="package"]').getAttribute('aria-pressed'), 'false');
  assert.equal(t.doc.querySelector('#sfx-never-dl').getAttribute('aria-pressed'), 'false');
});

test('sorting by size works both ways and marks aria-sort', async () => {
  const t = await loadPage();
  const th = t.doc.querySelector('thead th[data-sfx-col="size"]');
  t.click(th);
  assert.ok(firstName(t).includes('Makefile'));
  assert.equal(th.getAttribute('aria-sort'), 'ascending');
  t.click(th);
  assert.ok(firstName(t).includes('TURBODRIVER_WickedWhims_Tuning'));
  assert.equal(th.getAttribute('aria-sort'), 'descending');
});

test('sorting by last download keeps the empty value last and blocks navigation', async () => {
  const t = await loadPage();
  const link = t.doc.querySelector('thead th[data-sfx-col="last"] a');
  const event = new t.win.MouseEvent('click', { bubbles: true, cancelable: true });
  link.dispatchEvent(event);
  assert.equal(event.defaultPrevented, true);
  const rows = t.doc.querySelectorAll('#filelist tr');
  assert.ok(rows[rows.length - 1].textContent.includes('Never_Downloaded'));
  t.click(link);
  const flipped = t.doc.querySelectorAll('#filelist tr');
  assert.ok(flipped[flipped.length - 1].textContent.includes('Never_Downloaded'));
});

test('sorting keeps checked rows checked and selection state consistent', async () => {
  const t = await loadPage();
  t.click(t.row(0).children[2]);
  t.click(t.doc.querySelector('thead th[data-sfx-col="size"]'));
  assert.equal(t.checked(), 1);
  assert.equal(t.doc.querySelectorAll('#filelist tr.sfx-selected').length, 1);
});

test('Enter inside the toolbar never submits the native form', async () => {
  const t = await loadPage();
  for (const id of ['#sfx-search', '#sfx-min-size', '#sfx-max-size']) {
    const e = new t.win.KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });
    t.doc.querySelector(id).dispatchEvent(e);
    assert.equal(e.defaultPrevented, true, id);
  }
});
