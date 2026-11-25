const test = require('node:test');
const assert = require('node:assert/strict');
const L = require('../simfileshare-enhancer.user.js');

test('every creator entry is well formed', () => {
  const ids = new Set();
  for (const c of L.CREATORS) {
    assert.ok(c.id && !ids.has(c.id), c.id);
    ids.add(c.id);
    assert.ok(c.name, c.id);
    assert.ok(c.url.startsWith('https://'), `${c.id} url`);
    assert.ok(c.source.startsWith('https://'), `${c.id} source`);
    assert.ok(c.patterns.length > 0 && c.patterns.every((p) => p instanceof RegExp), c.id);
  }
});

const KNOWN = [
  ['adeepindigo', 'adeepindigo_objects_bandaids.package'],
  ['lumpinou', 'Lumpinou_RPO_Collection_M15_Romances&Friendships_v2.986.package'],
  ['mccc', 'mc_woohoo.ts4script'],
  ['mccc', 'mc_settings.cfg'],
  ['mccc', 'mc_cmd_center.package'],
  ['wickedwhims', 'TURBODRIVER_WickedWhims_Tuning.package'],
  ['lot51', 'lot51_core.ts4script'],
  ['scumbumbo', 'XmlInjector_Script_v4.2.ts4script'],
  ['scumbumbo', 'Scumbumbo_PackingCrates_BMFix.package'],
  ['uicheats', 'UI_Cheats_Extension_Scripts.ts4script'],
  ['plumbbuddy', 'PlumbBuddy_Integration.ts4script'],
  ['basemental', 'Basemental Drugs.package'],
  ['basemental', 'basementaldrugs.ts4script'],
  ['littlbowbub', 'LBB_GC_Appetiser_Biscuits.package'],
  ['littlbowbub', 'Littlbowbub_GranniesCookbook_04-11-2026.package'],
  ['kijiko', '[Kijiko]eyelash_IU_SD.package'],
  ['pandasama', 'Pandasama_toddler_xylophone.package'],
  ['sacrificial', 'SAC_Zombie Apocalypse -MOD- v2.3.1 Scripts.ts4script'],
  ['sacrificial', "Sacrificial's Mods Base Piemenu.package"],
  ['apricot-rush', '[Apricot Rush] Zaatar Manakeesh.package'],
  ['ah00b', '[AH00B]ZaraHair.package'],
  ['axa', '[AxA]-ChandlerSweater_V1.package'],
  ['luthienrising', 'luthienrising_all_beds_same_energy_TODDLERS.package'],
  ['casteru', 'casteru_yuGlasses_Eunwoo Square Glasses.package'],
  ['simandy', 'SIMANDY_Torrada_Bodyblush.package'],
];

for (const [id, file] of KNOWN) {
  test(`matchCreator maps ${file} to ${id}`, () => {
    const match = L.matchCreator(file);
    assert.ok(match, file);
    assert.equal(match.id, id);
    assert.ok(match.name && match.url.startsWith('https://'));
  });
}

test('case variants of one creator map to the same entry', () => {
  for (const f of ['Pandasama_x.package', 'PandaSama_x.package', 'pandasama_x.package']) {
    assert.equal(L.matchCreator(f).id, 'pandasama', f);
  }
});

test('load order markers do not hide the creator', () => {
  assert.equal(L.matchCreator('!adeepindigo_SchoolMods_SharedTuning.package').id, 'adeepindigo');
  assert.equal(L.matchCreator('zzz_Lumpinou_x.package').id, 'lumpinou');
  assert.equal(L.matchCreator('ZZ-lot51_x.package').id, 'lot51');
});

test('unconfirmed or generic prefixes never produce a creator', () => {
  for (const f of [
    'mcdonalds_x.package', 'Apple_Pie.package', 'Foo_Bar.package', 'Yogurt.package', '1.package',
    'woosteru_yuShoes_Mosch Boots.package', 'ATS4_object_health_vitamins_toddlers.package',
    '[ADA]-PurgatoryDress.package', '[missmarymax] snorlax mug.package', 'sej_FOMO_BG_x.package',
    'SAC_Deadly Toddlers -Mod- v2.4.1.package', 'mc_unknownmodule.package', 'Resource.cfg',
  ]) {
    assert.equal(L.matchCreator(f), null, f);
  }
});

test('pack codes only contain confirmed names', () => {
  assert.equal(L.PACK_CODES.EP01, 'Get to Work');
  assert.equal(L.PACK_CODES.EP02, 'Get Together');
  assert.equal(L.PACK_CODES.GP01, 'Outdoor Retreat');
  assert.equal(L.PACK_CODES.SP01, 'Luxury Party Stuff');
  assert.equal(L.PACK_CODES.GTW, 'Get to Work');
  assert.equal(L.PACK_CODES.HSY, undefined);
});
