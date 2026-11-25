const test = require('node:test');
const assert = require('node:assert/strict');
const { loadPage, fixture } = require('./helpers.js');

function bigPage(n) {
  const html = fixture('my-files.html');
  const start = html.indexOf('<tbody id="filelist">') + '<tbody id="filelist">'.length;
  const end = html.indexOf('</tbody>');
  const pool = ['LBB_GC_Meal_', '[AH00B]HairStyle', 'casteru_ymTop_', '[AxA]-Dress_V', 'Foo_Item_', 'mc_woohoo'];
  const rows = [];
  for (let i = 0; i < n; i++) {
    const name = `${pool[i % pool.length]}${i}${i % 7 === 0 ? '.ts4script' : '.package'}`;
    rows.push(`<tr><td><input type="checkbox" name="selectedfiles" value="${i + 1}" /></td>
<td><a href="/filedetails/${i + 1}/">${name}</a></td><td><small>${(i % 900) + 1} kB</small></td><td>${i % 5}</td><td>0</td>
<td><small>Nov. 25, 2026, 3:${String(i % 60).padStart(2, '0')} a.m.</small></td><td><small>Nov. 25, 2026, 4 a.m.</small></td>
<td><a class="btn btn-success btn-sm" title="Copy Link" onclick="copyURL(${i + 1})"><span class="glyphicon glyphicon-link"></span></a>
<a class="btn btn-default btn-sm" href="/download/${i + 1}/">download</a></td></tr>`);
  }
  return html.slice(0, start) + rows.join('\n') + html.slice(end);
}

const timed = (fn) => {
  const t0 = performance.now();
  fn();
  return performance.now() - t0;
};

test('2106 rows stay responsive for filter, select all and sort', async () => {
  const t = await loadPage(bigPage(2106));
  assert.equal(t.boxes().length, 2106);
  const search = timed(() => t.type(t.doc.querySelector('#sfx-search'), 'lbb'));
  assert.equal(t.visible(), 351);
  const selectAll = timed(() => t.header().click());
  assert.equal(t.checked(), 351);
  const sort = timed(() => t.click(t.doc.querySelector('thead th[data-sfx-col="size"]')));
  assert.equal(t.doc.querySelectorAll('#filelist tr').length, 2106);
  for (const [label, ms] of Object.entries({ search, selectAll, sort })) {
    assert.ok(ms < 3000, `${label} took ${Math.round(ms)} ms`);
  }
});
