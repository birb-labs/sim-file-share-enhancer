const test = require('node:test');
const assert = require('node:assert/strict');
const L = require('../simfileshare-enhancer.user.js');
const { loadPage } = require('./helpers.js');

const bar = (t) => t.doc.querySelector('#sfx-actionbar');

test('formatLinks builds one site download URL per id', () => {
  assert.equal(
    L.formatLinks(['1', '22']),
    'http://www.simfileshare.net/download/1/\nhttp://www.simfileshare.net/download/22/'
  );
  assert.equal(L.formatLinks([]), '');
});

test('the bar is hidden with nothing selected and shows the count otherwise', async () => {
  const t = await loadPage();
  assert.equal(bar(t).hidden, true);
  t.boxes()[0].click();
  t.boxes()[1].click();
  assert.equal(bar(t).hidden, false);
  assert.equal(bar(t).querySelector('.sfx-selected-count').textContent, '2 selected');
  t.doc.querySelector('#sfx-clear-selection').click();
  assert.equal(t.checked(), 0);
  assert.equal(bar(t).hidden, true);
});

test('native bulk buttons move into the bar and stay wired to the original form', async () => {
  const t = await loadPage();
  const form = t.doc.querySelector('form[action="/accounts/processmultiple/"]');
  for (const name of ['addfilestofolders', 'deletefiles']) {
    const button = bar(t).querySelector(`input[name="${name}"]`);
    assert.ok(button, name);
    assert.equal(button.form, form, name);
  }
  assert.equal(form.querySelector('input[name="deletefiles"]'), null);
  t.boxes()[0].click();
  t.boxes()[2].click();
  const values = new t.win.FormData(form).getAll('selectedfiles');
  assert.equal(values.length, 2);
});

test('copy links sends only the selected ids to the clipboard', async () => {
  const t = await loadPage();
  let copied = null;
  Object.defineProperty(t.win.navigator, 'clipboard', {
    configurable: true,
    value: { writeText: (text) => ((copied = text), Promise.resolve()) },
  });
  t.boxes()[0].click();
  t.boxes()[2].click();
  t.doc.querySelector('#sfx-copy-links').click();
  const ids = [t.boxes()[0].value, t.boxes()[2].value];
  assert.equal(copied, L.formatLinks(ids));
});

function watchSubmits(t) {
  const form = t.doc.querySelector('form[action="/accounts/processmultiple/"]');
  const submits = [];
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    submits.push(e.submitter ? e.submitter.name : null);
  });
  return submits;
}

test('delete asks for confirmation with the count and cancel blocks the submit', async () => {
  const t = await loadPage();
  const submits = watchSubmits(t);
  const asked = [];
  t.win.confirm = (message) => (asked.push(message), false);
  t.boxes()[0].click();
  t.boxes()[1].click();
  bar(t).querySelector('input[name="deletefiles"]').click();
  assert.equal(asked.length, 1);
  assert.ok(asked[0].includes('2 files'), asked[0]);
  assert.deepEqual(submits, []);
});

test('delete proceeds once confirmed and add to folders never asks', async () => {
  const t = await loadPage();
  const submits = watchSubmits(t);
  let asked = 0;
  t.win.confirm = () => (asked++, true);
  t.boxes()[0].click();
  bar(t).querySelector('input[name="addfilestofolders"]').click();
  assert.equal(asked, 0);
  bar(t).querySelector('input[name="deletefiles"]').click();
  assert.equal(asked, 1);
  assert.deepEqual(submits, ['addfilestofolders', 'deletefiles']);
});

test('the singular confirmation reads naturally', async () => {
  const t = await loadPage();
  const asked = [];
  t.win.confirm = (message) => (asked.push(message), false);
  t.boxes()[0].click();
  bar(t).querySelector('input[name="deletefiles"]').click();
  assert.ok(asked[0].includes('1 file?'), asked[0]);
});

test('the delete confirmation lists the selected names and caps the list', async () => {
  const t = await loadPage();
  const asked = [];
  t.win.confirm = (message) => (asked.push(message), false);
  t.boxes()[0].click();
  t.boxes()[1].click();
  const names = [0, 1].map((i) => t.row(i).querySelector('.sfx-filename').textContent);
  bar(t).querySelector('input[name="deletefiles"]').click();
  names.forEach((n) => assert.ok(asked[0].includes(n), n));
  t.header().click();
  bar(t).querySelector('input[name="deletefiles"]').click();
  assert.ok(asked[1].includes('and 28 more'), asked[1]);
  assert.ok(asked[1].includes('Delete 33 files?'), asked[1]);
});

test('the copy button keeps its icon and shows a confirmation label', async () => {
  const t = await loadPage();
  Object.defineProperty(t.win.navigator, 'clipboard', {
    configurable: true,
    value: { writeText: () => Promise.resolve() },
  });
  t.boxes()[0].click();
  t.boxes()[1].click();
  const button = t.doc.querySelector('#sfx-copy-links');
  button.click();
  await new Promise((resolve) => setTimeout(resolve, 10));
  assert.ok(button.querySelector('svg'));
  assert.equal(button.textContent.trim(), 'Copied 2');
});
