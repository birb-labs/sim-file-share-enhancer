const { JSDOM } = require('jsdom');
const fs = require('node:fs');
const path = require('node:path');

function gmStub(initial = {}) {
  const store = new Map(Object.entries(initial));
  const styles = [];
  return {
    store,
    styles,
    addStyle: (css) => styles.push(css),
    getValue: (key, fallback) => (store.has(key) ? store.get(key) : fallback),
    setValue: (key, value) => store.set(key, value),
  };
}

function makeDom(html, { prefersDark = false } = {}) {
  const dom = new JSDOM(html, { url: 'https://simfileshare.net/', pretendToBeVisual: true });
  dom.window.matchMedia = (query) => ({
    matches: query.includes('dark') ? prefersDark : false,
    addEventListener() {},
    removeEventListener() {},
  });
  return dom;
}

function ready(dom) {
  const doc = dom.window.document;
  if (doc.readyState !== 'loading') return Promise.resolve();
  return new Promise((resolve) => doc.addEventListener('DOMContentLoaded', resolve));
}

function fixture(name) {
  return fs.readFileSync(path.join(__dirname, 'fixtures', name), 'utf8');
}

async function loadPage(html = fixture('my-files.html'), options) {
  const L = require('../simfileshare-enhancer.user.js');
  const dom = makeDom(html, options);
  const gm = gmStub();
  L.main(dom.window, dom.window.document, gm);
  await ready(dom);
  const doc = dom.window.document;
  return {
    dom,
    doc,
    win: dom.window,
    gm,
    boxes: () => Array.from(doc.querySelectorAll('input[name="selectedfiles"]')),
    checked: () => doc.querySelectorAll('input[name="selectedfiles"]:checked').length,
    visible: () => doc.querySelectorAll('#filelist tr:not([hidden])').length,
    header: () => doc.querySelector('#sfx-select-all'),
    row: (i) => doc.querySelectorAll('#filelist tr')[i],
    click: (el, init = {}) =>
      el.dispatchEvent(new dom.window.MouseEvent('click', { bubbles: true, cancelable: true, ...init })),
    type: (el, value, eventName = 'input') => {
      el.value = value;
      el.dispatchEvent(new dom.window.Event(eventName, { bubbles: true }));
    },
  };
}

module.exports = { gmStub, makeDom, ready, fixture, loadPage };
