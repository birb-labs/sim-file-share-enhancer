const test = require('node:test');
const assert = require('node:assert/strict');
const L = require('../simfileshare-enhancer.user.js');
const { gmStub, makeDom, ready, fixture } = require('./helpers.js');

async function load(html = fixture('my-files.html')) {
  const dom = makeDom(html);
  L.main(dom.window, dom.window.document, gmStub());
  await ready(dom);
  const doc = dom.window.document;
  return {
    dom,
    doc,
    win: dom.window,
    boxes: () => Array.from(doc.querySelectorAll('input[name="selectedfiles"]')),
    checked: () => doc.querySelectorAll('input[name="selectedfiles"]:checked').length,
    header: () => doc.querySelector('#sfx-select-all'),
    row: (i) => doc.querySelectorAll('#filelist tr')[i],
    click: (el, init = {}) =>
      el.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true, cancelable: true, ...init })),
  };
}

test('starts with nothing selected and emits a zero count', async () => {
  const counts = [];
  const dom = makeDom(fixture('my-files.html'));
  dom.window.document.addEventListener('sfx:selection', (e) => counts.push(e.detail.count));
  L.main(dom.window, dom.window.document, gmStub());
  await ready(dom);
  assert.equal(dom.window.document.querySelectorAll('input[name="selectedfiles"]:checked').length, 0);
  assert.equal(counts[counts.length - 1], 0);
});

test('header checkbox selects and clears every row', async () => {
  const t = await load();
  assert.equal(t.boxes().length, 33);
  t.header().click();
  assert.equal(t.checked(), 33);
  assert.equal(t.header().checked, true);
  t.header().click();
  assert.equal(t.checked(), 0);
});

test('header checkbox is indeterminate when only some rows are checked', async () => {
  const t = await load();
  t.boxes()[0].click();
  assert.equal(t.header().indeterminate, true);
  assert.equal(t.header().checked, false);
});

test('clicking a row cell toggles its checkbox but links do not', async () => {
  const t = await load();
  const cell = t.row(2).children[2];
  t.click(cell);
  assert.equal(t.boxes()[2].checked, true);
  assert.ok(t.row(2).classList.contains('sfx-selected'));
  t.click(t.row(2).querySelector('a'));
  assert.equal(t.boxes()[2].checked, true);
});

test('shift-click selects the range between two clicks', async () => {
  const t = await load();
  t.click(t.row(3).children[2]);
  t.click(t.row(7).children[2], { shiftKey: true });
  const checkedIdx = t.boxes().map((b, i) => (b.checked ? i : -1)).filter((i) => i >= 0);
  assert.deepEqual(checkedIdx, [3, 4, 5, 6, 7]);
});

test('checkboxes restored by the browser are cleared on load and pageshow', async () => {
  const html = fixture('my-files.html').replace(
    /name="selectedfiles" value="(\d+)" \/>/g,
    'name="selectedfiles" value="$1" checked />'
  );
  const t = await load(html);
  assert.equal(t.checked(), 0);
  t.boxes()[4].checked = true;
  t.boxes()[5].checked = true;
  t.win.dispatchEvent(new t.win.Event('pageshow'));
  assert.equal(t.checked(), 0);
  assert.equal(t.header().checked, false);
});

test('subfolder rows become chips and leave the table body', async () => {
  const t = await load();
  const chips = t.doc.querySelectorAll('.sfx-folders a');
  assert.equal(chips.length, 1);
  assert.ok(chips[0].textContent.includes('Bare Minimum'));
  assert.equal(chips[0].getAttribute('href'), '/folders/edit/280190/');
  const withoutBox = Array.from(t.doc.querySelectorAll('#filelist tr')).filter(
    (r) => !r.querySelector('input[name="selectedfiles"]')
  );
  assert.equal(withoutBox.length, 0);
});

test('the table wrapper no longer clips the sticky header', async () => {
  const t = await load();
  assert.ok(t.doc.querySelector('.table-responsive').classList.contains('sfx-table-wrap'));
  assert.ok(t.doc.querySelector('#filelist').closest('table').classList.contains('sfx-table'));
});

test('file rows get an extension badge except files without one', async () => {
  const t = await load();
  assert.equal(t.row(0).querySelector('.sfx-ext').textContent, 'package');
  const makefile = Array.from(t.doc.querySelectorAll('#filelist tr')).find((r) =>
    r.textContent.includes('Makefile')
  );
  assert.equal(makefile.querySelector('.sfx-ext'), null);
});

test('collectRows parses numeric columns and nulls', async () => {
  const t = await load();
  const rows = L.collectRows(t.doc);
  assert.equal(rows.length, 33);
  const never = rows.find((r) => r.name === 'Never_Downloaded.log');
  assert.equal(never.lastDownload, null);
  assert.equal(never.downloads, 0);
  assert.equal(never.bytes, 2048);
  const noon = rows.find((r) => r.name === 'Noon_Test.ts4script');
  assert.equal(noon.added, new Date(2026, 10, 25, 12, 0).getTime());
  assert.equal(noon.id, '9000002');
});
