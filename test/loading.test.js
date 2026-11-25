const test = require('node:test');
const assert = require('node:assert/strict');
const L = require('../simfileshare-enhancer.user.js');
const { gmStub, makeDom, ready } = require('./helpers.js');

const PAGE = '<html><head></head><body><div class="navbar"><ul class="nav navbar-nav navbar-right"></ul></div></body></html>';
const BROKEN_ROW = '<html><body><form><table><thead><tr><th></th></tr></thead><tbody><tr><td><input type="checkbox" name="selectedfiles" value="1" /></td></tr></tbody></table></form></body></html>';

test('the overlay shows at document-start and the page is not ready yet', () => {
  const dom = makeDom(PAGE);
  const doc = dom.window.document;
  assert.equal(doc.readyState, 'loading');
  L.main(dom.window, doc, gmStub());
  assert.ok(doc.querySelector('#sfx-loading'));
  assert.equal(doc.documentElement.hasAttribute('data-sfx-ready'), false);
});

test('after DOMContentLoaded the overlay is gone and the page is ready', async () => {
  const dom = makeDom(PAGE);
  L.main(dom.window, dom.window.document, gmStub());
  await ready(dom);
  const doc = dom.window.document;
  assert.equal(doc.querySelector('#sfx-loading'), null);
  assert.equal(doc.documentElement.dataset.sfxReady, 'true');
});

test('an exception during enhancement still reveals the page and is reported', async () => {
  const dom = makeDom(BROKEN_ROW);
  const reported = [];
  dom.window.console.error = (...args) => reported.push(args);
  L.main(dom.window, dom.window.document, gmStub());
  await ready(dom);
  assert.equal(dom.window.document.documentElement.dataset.sfxReady, 'true');
  assert.equal(dom.window.document.querySelector('#sfx-loading'), null);
  assert.equal(reported.length, 1);
});

test('the failsafe reveals the page even if the document never finishes loading', async () => {
  const dom = makeDom(PAGE);
  const doc = dom.window.document;
  const realAdd = doc.addEventListener.bind(doc);
  doc.addEventListener = (type, fn, options) =>
    type === 'DOMContentLoaded' ? undefined : realAdd(type, fn, options);
  L.main(dom.window, doc, gmStub(), { failsafeMs: 20 });
  assert.ok(doc.querySelector('#sfx-loading'));
  await new Promise((resolve) => setTimeout(resolve, 80));
  assert.equal(doc.documentElement.dataset.sfxReady, 'true');
  assert.equal(doc.querySelector('#sfx-loading'), null);
});

test('the stylesheet hides the body until ready and honors reduced motion', () => {
  const dom = makeDom(PAGE);
  const gm = gmStub();
  L.main(dom.window, dom.window.document, gm);
  const css = gm.styles.join('\n');
  assert.ok(css.includes('html:not([data-sfx-ready]) body'));
  assert.ok(css.includes('prefers-reduced-motion'));
});

test('a failure while setting up styles or theme still reveals the page', () => {
  const dom = makeDom(PAGE);
  const reported = [];
  dom.window.console.error = (...args) => reported.push(args);
  const gm = { addStyle() { throw new Error('boom'); }, getValue: () => 'system', setValue() {} };
  assert.doesNotThrow(() => L.main(dom.window, dom.window.document, gm));
  assert.equal(dom.window.document.documentElement.dataset.sfxReady, 'true');
  assert.equal(dom.window.document.querySelector('#sfx-loading'), null);
  assert.equal(reported.length, 1);
});
