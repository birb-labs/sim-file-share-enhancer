const test = require('node:test');
const assert = require('node:assert/strict');
const L = require('../simfileshare-enhancer.user.js');
const { loadPage, makeDom } = require('./helpers.js');

const BULK = 'form[action="/accounts/processmultiple/"]';

test('the page head card holds the title, the native search form and Add sub-folder', async () => {
  const t = await loadPage();
  const head = t.doc.querySelector('.sfx-pagehead');
  assert.ok(head);
  assert.ok(head.querySelector('h3').textContent.includes('Folder:'));
  const search = head.querySelector('form[action="/accounts/search/"]');
  assert.ok(search);
  assert.equal(search.getAttribute('method'), 'post');
  assert.equal(search.querySelector('input[name="csrfmiddlewaretoken"]').value, 'TOKEN');
  assert.ok(search.querySelector('input[name="search"]'));
  assert.ok(head.querySelector('a[href^="/folders/addsubfolder/"]'));
  assert.equal(t.doc.querySelector(`${BULK} a[href^="/folders/addsubfolder/"]`), null);
});

test('rows emptied by the move are hidden so no blank gap remains', async () => {
  const t = await loadPage();
  const row = t.doc.querySelector(`${BULK} .row`);
  assert.equal(row.children.length, 0);
  assert.equal(row.hidden, true);
  assert.equal(t.doc.querySelector('form[action="/accounts/search/"]').closest('.sfx-pagehead') !== null, true);
});

test('chart range buttons share one segmented control and keep their ids', async () => {
  const t = await loadPage();
  const buttons = Array.from(t.doc.querySelectorAll('.highchart-btn'));
  assert.equal(buttons.length, 6);
  const parents = new Set(buttons.map((b) => b.parentElement));
  assert.equal(parents.size, 1);
  assert.ok([...parents][0].classList.contains('sfx-segmented'));
  assert.deepEqual(buttons.map((b) => b.id), ['thisweek', 'thismonth', 'lastmonth', 'last30days', 'last3months', 'last6months']);
});

test('pages without the pieces return null and do not throw', () => {
  const home = makeDom('<html><body><h1>hi</h1></body></html>');
  assert.equal(L.buildPageHead(home.window.document), null);
  const partial = makeDom('<html><body><h3>Folder: x</h3></body></html>');
  assert.equal(L.buildPageHead(partial.window.document), null);
});

test('building the head twice does not duplicate it', async () => {
  const t = await loadPage();
  assert.equal(L.buildPageHead(t.doc), null);
  assert.equal(t.doc.querySelectorAll('.sfx-pagehead').length, 1);
});

test('the chart is restyled with theme variables and the head has no negative margins', async () => {
  const t = await loadPage();
  const css = t.gm.styles.join('\n');
  assert.ok(/\.highcharts-series[^}]*var\(--sfx-accent\)/.test(css));
  assert.ok(/\.highcharts-grid[^}]*var\(--sfx-border\)/.test(css));
  assert.ok(!/\.sfx-pagehead[^{]*\.row[^}]*margin[^}]*-\d/.test(css));
});
