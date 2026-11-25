const test = require('node:test');
const assert = require('node:assert/strict');
const L = require('../simfileshare-enhancer.user.js');
const { loadPage } = require('./helpers.js');

const COLS = ['check', 'file', 'type', 'creators', 'size', 'dls', 'hearts', 'added', 'last', 'actions'];
const rowOf = (t, text) =>
  Array.from(t.doc.querySelectorAll('#filelist tr')).find((r) => r.textContent.includes(text));

function miniPage(names) {
  const rows = names
    .map((n, i) => `<tr><td><input type="checkbox" name="selectedfiles" value="${i + 1}" /></td>
<td><a href="/filedetails/${i + 1}/">${n}</a></td><td><small>1 kB</small></td><td>0</td><td>0</td>
<td><small>Nov. 25, 2026, noon</small></td><td><small></small></td>
<td><a class="btn btn-success btn-sm" title="Copy Link" onclick="copyURL(${i + 1})"><span class="glyphicon glyphicon-link"></span></a>
<a class="btn btn-default btn-sm" href="/download/${i + 1}/">download</a></td></tr>`)
    .join('\n');
  return `<html><body><div class="navbar"><ul class="nav navbar-nav navbar-right"></ul></div>
<form method="post" action="/accounts/processmultiple/"><div class="table-responsive"><table class="table">
<thead><tr><th>&nbsp;</th><th><a href="?sort=filename&dir=asc">Filename <span class="glyphicon glyphicon-sort"></span></a></th><th>Size</th><th><a href="?sort=downloads&dir=asc">DLs</a></th><th><a href="?sort=hearts&dir=asc">H</a></th><th><a href="?sort=dateadded&dir=asc">Date Added <span class="glyphicon glyphicon-sort"></span></a></th><th><a href="?sort=lastdownloaded&dir=asc">Last Download</a></th><th>Actions</th></tr></thead>
<tbody id="filelist">${rows}</tbody></table></div></form></body></html>`;
}

test('a Type column sits after the file column and the checkbox stays first', async () => {
  const t = await loadPage();
  const heads = Array.from(t.doc.querySelectorAll('thead th')).map((th) => th.dataset.sfxCol);
  assert.deepEqual(heads, COLS);
  const rows = t.doc.querySelectorAll('#filelist tr');
  assert.equal(rows.length, 33);
  rows.forEach((r) => {
    assert.deepEqual(Array.from(r.children).map((c) => c.dataset.sfxCol), COLS);
    assert.ok(r.children[0].querySelector('input[name="selectedfiles"]'));
  });
});

test('each file cell shows title, creator and the real filename', async () => {
  const t = await loadPage();
  const first = t.row(0);
  assert.equal(first.querySelector('.sfx-file-title').textContent, 'GC Appetiser Biscuits');
  assert.equal(first.querySelector('.sfx-file-title').getAttribute('href').startsWith('/filedetails/'), true);
  assert.equal(first.querySelector('.sfx-filename').textContent, 'LBB_GC_Appetiser_Biscuits.package');
  assert.equal(first.querySelector('[data-sfx-col="file"] .sfx-creator'), null);
  const chip = first.querySelector('[data-sfx-col="creators"] .sfx-creator');
  assert.equal(chip.textContent, 'Littlbowbub');
  assert.equal(chip.tagName, 'BUTTON');
  const makefile = rowOf(t, 'Makefile');
  assert.equal(makefile.querySelector('.sfx-file-title').textContent, 'Makefile');
  assert.equal(makefile.querySelector('.sfx-creator'), null);
  assert.equal(makefile.querySelector('[data-sfx-col="creators"]').children.length, 0);
});

test('the type cell has an icon and a label', async () => {
  const t = await loadPage();
  assert.equal(t.row(0).querySelector('.sfx-type').textContent.trim(), 'Package');
  assert.ok(t.row(0).querySelector('.sfx-type svg'));
  assert.equal(rowOf(t, 'Makefile').querySelector('.sfx-type').textContent.trim(), 'Other');
  assert.equal(rowOf(t, 'Noon_Test').querySelector('.sfx-type').textContent.trim(), 'Script');
});

test('the Type header sorts alphabetically and flips', async () => {
  const t = await loadPage();
  const th = t.doc.querySelector('thead th[data-sfx-col="type"]');
  t.click(th);
  assert.equal(t.row(0).querySelector('.sfx-type').textContent.trim(), 'Log');
  assert.equal(th.getAttribute('aria-sort'), 'ascending');
  t.click(th);
  assert.equal(t.row(0).querySelector('.sfx-type').textContent.trim(), 'Script');
});

test('search matches the creator name as well', async () => {
  const t = await loadPage();
  t.type(t.doc.querySelector('#sfx-search'), 'littlbowbub');
  assert.equal(t.visible(), 11);
});

test('actions are icon buttons that keep their links and handlers', async () => {
  const t = await loadPage();
  const cell = t.row(0).querySelector('td[data-sfx-col="actions"]');
  assert.equal(cell.querySelectorAll('svg').length, 2);
  assert.equal(cell.querySelector('.glyphicon'), null);
  const download = cell.querySelector('a[href^="/download/"]');
  assert.ok(download);
  assert.equal(download.getAttribute('aria-label'), 'Download');
  assert.ok(cell.querySelector('a[onclick^="copyURL"]'));
  assert.equal(cell.querySelector('a[onclick^="copyURL"]').getAttribute('aria-label'), 'Copy link');
});

test('sortable headers, copy button and folder chips use svg icons', async () => {
  const t = await loadPage();
  t.doc.querySelectorAll('thead th.sfx-sortable').forEach((th) => {
    assert.ok(th.querySelector('svg'), th.dataset.sfxCol);
    assert.equal(th.querySelector('.glyphicon-sort'), null, th.dataset.sfxCol);
  });
  t.boxes()[0].click();
  assert.ok(t.doc.querySelector('#sfx-copy-links svg'));
  assert.ok(t.doc.querySelector('.sfx-folder-chip svg'));
});

test('versions, flags, tags and pack codes are shown without claiming more', async () => {
  const t = await loadPage(miniPage([
    'SAC_Zombie Apocalypse  -MOD- v2.3.1.package',
    'Basemental Wine Maker (Optional).package',
    'Foo_EP01_SP26_GTW.package',
    '[Peridot] Shorter University.package',
    'Yogurt.package',
  ]));
  const [a, b, c, d, e] = Array.from(t.doc.querySelectorAll('#filelist tr'));
  assert.equal(a.querySelector('.sfx-meta').textContent, 'v2.3.1');
  assert.equal(b.querySelector('.sfx-flag').textContent, 'optional');
  assert.equal(c.querySelector('.sfx-packs').textContent, 'May require: Get to Work (EP01), SP26, Get to Work (GTW)');
  assert.equal(d.querySelector('.sfx-tag').textContent, 'Peridot');
  assert.equal(d.querySelector('.sfx-creator'), null);
  assert.equal(e.querySelector('.sfx-creator'), null);
  assert.equal(e.querySelector('.sfx-packs'), null);
});

test('file names that look like markup stay plain text', async () => {
  const t = await loadPage(miniPage(['&lt;img src=x onerror=alert(1)&gt;.package']));
  const cell = t.row(0).querySelector('td[data-sfx-col="file"]');
  assert.equal(cell.querySelector('img'), null);
  assert.equal(cell.querySelector('.sfx-filename').textContent, '<img src=x onerror=alert(1)>.package');
});

test('rows with an unexpected shape do not break pages that already have columns', async () => {
  const t = await loadPage();
  assert.equal(L.collectRows(t.doc).length, 33);
  assert.equal(L.collectRows(t.doc).length, 33);
  assert.equal(t.doc.querySelectorAll('thead th[data-sfx-col="type"]').length, 1);
});

test('the hearts header keeps a label and an icon next to the sort arrow', async () => {
  const t = await loadPage();
  const th = t.doc.querySelector('thead th[data-sfx-col="hearts"]');
  assert.equal(th.getAttribute('title'), 'Hearts');
  assert.equal(th.querySelectorAll('svg').length, 2);
  assert.equal(th.querySelector('.glyphicon'), null);
});

test('an unknown bracket tag says it comes from the filename', async () => {
  const t = await loadPage(miniPage(['[Peridot] Shorter University.package']));
  assert.equal(t.row(0).querySelector('.sfx-tag').getAttribute('title'), 'Tag from the filename, not a verified creator');
});
