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

module.exports = { gmStub, makeDom, ready, fixture };
