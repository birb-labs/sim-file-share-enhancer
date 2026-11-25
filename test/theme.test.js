const test = require('node:test');
const assert = require('node:assert/strict');
const L = require('../simfileshare-enhancer.user.js');
const { gmStub, makeDom, ready } = require('./helpers.js');

const PAGE = '<html><head></head><body><div class="navbar"><ul class="nav navbar-nav navbar-right"><li><a>Welcome</a></li></ul></div></body></html>';

test('resolveTheme follows the system only in system mode', () => {
  assert.equal(L.resolveTheme('system', true), 'dark');
  assert.equal(L.resolveTheme('system', false), 'light');
  assert.equal(L.resolveTheme('light', true), 'light');
  assert.equal(L.resolveTheme('dark', false), 'dark');
});

test('main applies the stored theme before DOMContentLoaded', () => {
  const dom = makeDom(PAGE);
  const doc = dom.window.document;
  assert.equal(doc.readyState, 'loading');
  const gm = gmStub({ 'sfx-theme': 'dark' });
  L.main(dom.window, doc, gm);
  assert.equal(doc.documentElement.dataset.sfxTheme, 'dark');
  assert.ok(gm.styles.length > 0);
});

test('system mode uses prefers-color-scheme', () => {
  const dom = makeDom(PAGE, { prefersDark: true });
  L.main(dom.window, dom.window.document, gmStub());
  assert.equal(dom.window.document.documentElement.dataset.sfxTheme, 'dark');
});

test('toggle cycles system, light, dark, system and persists each choice', async () => {
  const dom = makeDom(PAGE);
  const gm = gmStub();
  L.main(dom.window, dom.window.document, gm);
  await ready(dom);
  const button = dom.window.document.querySelector('#sfx-theme-toggle');
  assert.ok(button);
  const seen = [];
  for (let i = 0; i < 3; i++) {
    button.click();
    seen.push(gm.store.get('sfx-theme'));
  }
  assert.deepEqual(seen, ['light', 'dark', 'system']);
  assert.equal(dom.window.document.documentElement.dataset.sfxTheme, 'light');
});

test('toggle is mounted once even if main runs its ready hook twice', async () => {
  const dom = makeDom(PAGE);
  L.main(dom.window, dom.window.document, gmStub());
  await ready(dom);
  assert.equal(dom.window.document.querySelectorAll('#sfx-theme-toggle').length, 1);
});
