const test = require('node:test');
const assert = require('node:assert/strict');
const L = require('../simfileshare-enhancer.user.js');
const { makeDom } = require('./helpers.js');

const doc = () => makeDom('<html><body></body></html>').window.document;

test('the icon set has the documented names', () => {
  assert.deepEqual(L.ICON_NAMES, [
    'package', 'script', 'log', 'config', 'file', 'folder',
    'search', 'link', 'download', 'sort', 'copy', 'clear',
  ]);
});

test('every icon is an accessible stroke svg with drawable content', () => {
  const d = doc();
  for (const name of L.ICON_NAMES) {
    const svg = L.icon(d, name);
    assert.equal(svg.tagName.toLowerCase(), 'svg', name);
    assert.ok(svg.classList.contains('sfx-icon'), name);
    assert.equal(svg.getAttribute('aria-hidden'), 'true', name);
    assert.equal(svg.getAttribute('viewBox'), '0 0 24 24', name);
    assert.ok(svg.querySelector('path, rect, circle, line, polyline'), name);
    assert.equal(svg.textContent, '', name);
  }
});

test('an unknown name falls back to the file icon', () => {
  const d = doc();
  assert.equal(L.icon(d, 'nope').outerHTML, L.icon(d, 'file').outerHTML);
});

test('icon markup stays plain ASCII so no emoji can sneak in', () => {
  const d = doc();
  for (const name of L.ICON_NAMES) {
    assert.ok(!/[^\x20-\x7e]/.test(L.icon(d, name).outerHTML), name);
  }
});

test('every created icon is a real SVG-namespace element', () => {
  const svg = L.icon(doc(), 'package');
  assert.equal(svg.namespaceURI, 'http://www.w3.org/2000/svg');
  assert.equal(svg.firstElementChild.namespaceURI, 'http://www.w3.org/2000/svg');
});
