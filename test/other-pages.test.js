const test = require('node:test');
const assert = require('node:assert/strict');
const { loadPage } = require('./helpers.js');

const HOME = '<html><head></head><body><div class="navbar"><ul class="nav navbar-nav navbar-right"><li><a>Login</a></li></ul></div><div id="headerwrap"><h1>File hosting</h1></div></body></html>';
const PLAIN_TABLE = `${HOME.replace('</body>', '')}<table class="table"><thead><tr><th>Name</th></tr></thead><tbody><tr><td>one</td></tr></tbody></table></body></html>`;

for (const [label, html] of [['home page', HOME], ['table without selection checkboxes', PLAIN_TABLE]]) {
  test(`${label}: only the theme applies`, async () => {
    const t = await loadPage(html);
    assert.equal(t.doc.documentElement.dataset.sfxTheme, 'light');
    assert.ok(t.doc.querySelector('#sfx-theme-toggle'));
    for (const id of ['#sfx-toolbar', '#sfx-actionbar', '#sfx-select-all']) {
      assert.equal(t.doc.querySelector(id), null, id);
    }
  });
}

test('a page without a navbar still loads without throwing', async () => {
  const t = await loadPage('<html><body><p>hello</p></body></html>');
  assert.equal(t.doc.documentElement.dataset.sfxTheme, 'light');
  assert.equal(t.doc.querySelector('#sfx-theme-toggle'), null);
});

test('narrow windows hide secondary columns so the filename stays readable', async () => {
  const t = await loadPage();
  const css = t.gm.styles.join('\n');
  const wide = /@media \(max-width: 1199px\)[^@]*?nth-child\(5\)[^@]*?display: none/.exec(css);
  const narrow = /@media \(max-width: 991px\)[^@]*?nth-child\(7\)[^@]*?display: none/.exec(css);
  const tiny = /@media \(max-width: 767px\)[^@]*?\.sfx-table-wrap[^@]*?overflow-x: auto/.exec(css);
  assert.ok(wide && narrow && tiny);
});
