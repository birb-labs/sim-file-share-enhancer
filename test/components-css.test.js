const test = require('node:test');
const assert = require('node:assert/strict');
const { loadPage } = require('./helpers.js');

const SELECTORS = [
  '.panel', '.panel-info', '.panel-heading', '.panel-title a', '.panel-body', '.well',
  '.list-group-item', '.table-hover', '.dropdown-menu', '.modal-content', '.nav-tabs',
  '.label', '.badge', '.breadcrumb', '.pagination', '.help-block',
  '.alert-success', '.alert-danger', '.alert-info', 'pre', 'code', 'blockquote', 'details',
];

async function css() {
  const t = await loadPage();
  return t.gm.styles.join('\n');
}

test('every documented component has a themed rule', async () => {
  const text = await css();
  for (const selector of SELECTORS) {
    const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    assert.ok(new RegExp(`html\\[data-sfx-theme\\][^{}]*${escaped}[^{}]*\\{`).test(text), selector);
  }
});

function block(text, header) {
  const start = text.indexOf(`${header} {`);
  assert.ok(start >= 0, header);
  return text.slice(start, text.indexOf('}', start));
}

test('every theme variable in use is defined for both themes', async () => {
  const text = await css();
  const used = new Set(Array.from(text.matchAll(/var\((--sfx-[a-z-]+)[,)]/g)).map((m) => m[1]));
  const base = block(text, 'html[data-sfx-theme]');
  const light = block(text, 'html[data-sfx-theme="light"]');
  const dark = block(text, 'html[data-sfx-theme="dark"]');
  for (const name of used) {
    if (name === '--sfx-bg' || name === '--sfx-text') {
      assert.ok(light.includes(`${name}:`) && dark.includes(`${name}:`), name);
      continue;
    }
    const inBase = base.includes(`${name}:`);
    assert.ok(inBase || (light.includes(`${name}:`) && dark.includes(`${name}:`)), name);
  }
});

test('the accordion chevron is an svg mask, never a text character', async () => {
  const text = await css();
  const rule = block(text, 'html[data-sfx-theme] .panel-title a::after');
  assert.ok(rule.includes('mask'));
  assert.ok(rule.includes('data:image/svg+xml'));
  assert.ok(/content:\s*"";/.test(rule));
  assert.ok(text.includes('.panel-title a[aria-expanded="true"]::after'));
});

test('stylesheet text stays plain ASCII', async () => {
  const text = await css();
  assert.ok(!/[^\x09\x0a\x20-\x7e]/.test(text));
});
