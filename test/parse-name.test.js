const test = require('node:test');
const assert = require('node:assert/strict');
const L = require('../simfileshare-enhancer.user.js');

const sorted = (list) => [...list].sort();

test('bracket creator tags are matched and removed from the title', () => {
  const r = L.parseName('[Apricot Rush] Zaatar Manakeesh.package');
  assert.equal(r.creator.id, 'apricot-rush');
  assert.equal(r.tag, null);
  assert.equal(r.title, 'Zaatar Manakeesh');
});

test('underscore prefixes become a creator and camel case is split', () => {
  const r = L.parseName('LBB_GC_Appetiser_GarlicBaguette.package');
  assert.equal(r.creator.id, 'littlbowbub');
  assert.equal(r.title, 'GC Appetiser Garlic Baguette');
});

test('OPTIONAL tokens become flags', () => {
  const r = L.parseName('adeepindigo_gameplaymods_HealthcareRedux_OPTIONAL_MedicationReminder.package');
  assert.deepEqual(r.flags, ['optional']);
  assert.equal(r.title, 'gameplaymods Healthcare Redux Medication Reminder');
});

test('load order marker, NEEDED token and parenthesized requirement are read', () => {
  const r = L.parseName('!adeepindigo_SchoolMods_SharedTuning_HSY_NEEDED (REQUIRED IF PACK OWNED).package');
  assert.equal(r.loadOrder, true);
  assert.equal(r.creator.id, 'adeepindigo');
  assert.deepEqual(sorted(r.flags), ['needed', 'required if pack owned']);
  assert.deepEqual(r.packs, []);
  assert.equal(r.title, 'School Mods Shared Tuning HSY');
});

test('-MOD- and versions are removed from the title', () => {
  const r = L.parseName('SAC_Zombie Apocalypse  -MOD- v2.3.1.package');
  assert.equal(r.creator.id, 'sacrificial');
  assert.equal(r.version, '2.3.1');
  assert.equal(r.title, 'Zombie Apocalypse');
  assert.equal(L.parseName('Lumpinou_RPO_Collection_M15_Romances&Friendships_v2.986.package').version, '2.986');
  assert.equal(L.parseName('Lumpinou_RPO_Collection_M15_Romances&Friendships_v2.986.package').title,
    'RPO Collection M15 Romances&Friendships');
  assert.equal(L.parseName('thepancake1-MoreTraitsInCAS-v2d-1.121.package').version, null);
});

test('names that carry the mod name keep it in the title', () => {
  const b = L.parseName('Basemental Wine Maker (Optional).package');
  assert.equal(b.creator.id, 'basemental');
  assert.deepEqual(b.flags, ['optional']);
  assert.equal(b.title, 'Basemental Wine Maker');
  assert.equal(L.parseName('UI_Cheats_Extension_Scripts.ts4script').title, 'UI Cheats Extension Scripts');
});

test('modules of a known creator keep only the module as title', () => {
  const r = L.parseName('mc_woohoo.ts4script');
  assert.equal(r.creator.id, 'mccc');
  assert.equal(r.title, 'woohoo');
});

test('unknown names never get a creator', () => {
  for (const [file, title] of [['Yogurt.package', 'Yogurt'], ['1.package', '1'], ['Foo_Bar.package', 'Foo Bar'], ['Resource.cfg', 'Resource']]) {
    const r = L.parseName(file);
    assert.equal(r.creator, null, file);
    assert.equal(r.tag, null, file);
    assert.equal(r.title, title, file);
    assert.equal(r.loadOrder, false, file);
  }
});

test('an unknown bracket tag is kept as written, not as a creator', () => {
  const r = L.parseName('[Peridot] Shorter University - 8 Credits.package');
  assert.equal(r.creator, null);
  assert.equal(r.tag, 'Peridot');
  assert.equal(r.title, 'Shorter University - 8 Credits');
});

test('pack codes are reported as written', () => {
  assert.deepEqual(L.parseName('Foo_EP01_GP01_SP26_GTW.package').packs, ['EP01', 'GP01', 'SP26', 'GTW']);
  assert.deepEqual(L.parseName('Foo_HSY.package').packs, []);
  assert.deepEqual(L.parseName('Foo_EP1.package').packs, []);
});

test('titles are never empty', () => {
  assert.equal(L.parseName('.package').title, '.package');
  assert.equal(L.parseName('[Kijiko].package').title, '[Kijiko].package');
  const long = `${'A'.repeat(300)}.package`;
  assert.equal(L.parseName(long).title, 'A'.repeat(300));
  assert.ok(L.parseName('!!!.package').title.length > 0);
});

test('typeOf maps extensions to a label and icon', () => {
  assert.deepEqual(L.typeOf('package'), { id: 'package', label: 'Package', icon: 'package' });
  assert.deepEqual(L.typeOf('ts4script'), { id: 'script', label: 'Script', icon: 'script' });
  assert.deepEqual(L.typeOf('log'), { id: 'log', label: 'Log', icon: 'log' });
  assert.deepEqual(L.typeOf('cfg'), { id: 'config', label: 'Config', icon: 'config' });
  assert.deepEqual(L.typeOf('html'), { id: 'other', label: 'Other', icon: 'file' });
  assert.deepEqual(L.typeOf('(none)'), { id: 'other', label: 'Other', icon: 'file' });
});

test('a bare uppercase V1 is a style variant, not a version', () => {
  const r = L.parseName('[AxA]-ChandlerSweater_V1.package');
  assert.equal(r.version, null);
  assert.equal(r.title, 'Chandler Sweater V1');
  assert.equal(L.parseName('Mod_v2.package').version, '2');
  assert.equal(L.parseName('Mod_V2.6.3.2.package').version, '2.6.3.2');
});

test('z-prefixed words are not mistaken for load order markers', () => {
  assert.equal(L.parseName('Zzzap_Sleep.package').title, 'Zzzap Sleep');
  assert.equal(L.parseName('zzzap_Sleep.package').loadOrder, false);
  assert.equal(L.parseName('ZZTop_Guitar.package').title, 'ZZ Top Guitar');
  assert.equal(L.parseName('zzzMod_Core.package').loadOrder, true);
  assert.equal(L.parseName('ZZ_Lumpinou_x.package').loadOrder, true);
});
