const test = require('node:test');
const assert = require('node:assert/strict');
const { loadPage } = require('./helpers.js');

const SELECTORS = [
  '.panel', '.panel-info', '.panel-heading', '.panel-title a', '.panel-body', '.well',
  '.list-group-item', '.table-hover', '.dropdown-menu', '.modal-content', '.nav-tabs',
  '.label', '.badge', '.breadcrumb', '.pagination', '.help-block',
  '.alert-success', '.alert-danger', '.alert-info', 'pre', 'code', 'blockquote', 'details',
  '.btn-info', '.text-primary', '.text-info', 'input[type="email"]', '.table > tbody > tr > th', 'code a',
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

test('the chart credit stays visible and the chart is spaced from the dropzone', async () => {
  const text = await css();
  assert.ok(!/\.highcharts-credits[^}]*display:\s*none/.test(text));
  assert.ok(/#highchart[^}]*margin-bottom:\s*12px/.test(text));
});

test('date columns are narrow because the timestamp wraps in two lines', async () => {
  const text = await css();
  assert.ok(/\[data-sfx-col="added"\],[^{]*\[data-sfx-col="last"\]\s*\{[^}]*width:\s*104px/.test(text));
});

test('toolbar inputs are readable: no spinner overlap, normal weight, chip gaps', async () => {
  const text = await css();
  assert.ok(/input\[type="number"\][^}]*width:\s*104px/.test(text));
  assert.ok(text.includes('::-webkit-inner-spin-button') && text.includes('-moz-appearance: textfield'));
  assert.ok(/\.sfx-search input\[type="search"\][^}]*font-weight:\s*400/.test(text));
  assert.ok(/\.sfx-chip\s*\{[^}]*display:\s*inline-flex[^}]*gap:\s*6px/.test(text));
});

test('the condensed-table padding rule leaves the file list alone', async () => {
  const text = await css();
  assert.ok(/\.table-condensed:not\(\.sfx-table\)\s*>\s*tbody\s*>\s*tr\s*>\s*td/.test(text));
  assert.ok(!/\.table-condensed\s*>\s*tbody\s*>\s*tr\s*>\s*td\s*\{[^}]*padding: 10px 12px/.test(text.replace(/\.table-condensed:not\(\.sfx-table\)[^{]*\{[^}]*\}/g, '')));
});

test('narrow windows drop columns progressively and let chips shrink', async () => {
  const text = await css();
  const media = (px) => new RegExp(`@media \\(max-width: ${px}px\\) \\{([\\s\\S]*?)\\n\\}`).exec(text)[1];
  assert.ok(media(1199).includes('data-sfx-col="hearts"'));
  assert.ok(media(991).includes('data-sfx-col="last"') && media(991).includes('data-sfx-col="type"'));
  assert.ok(media(767).includes('data-sfx-col="added"') && /min-width:\s*440px/.test(media(767)));
  assert.ok(/\.sfx-creator[^}]*flex:\s*0 1 auto[^}]*max-width/.test(text));
});
