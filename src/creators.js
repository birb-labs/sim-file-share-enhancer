export const CREATORS = [
  { id: 'adeepindigo', name: 'adeepindigo', url: 'https://adeepindigomods.itch.io',
    source: 'https://adeepindigomods.itch.io/healthcare-redux', patterns: [/^adeepindigo[_ ]/i] },
  { id: 'lumpinou', name: 'Lumpinou', url: 'https://lumpinoumods.com',
    source: 'https://lumpinoumods.com', patterns: [/^lumpinou_/i] },
  { id: 'mccc', name: 'MC Command Center (Deaderpool)', url: 'https://deaderpool-mccc.com',
    source: 'https://deaderpool-mccc.com/documentation.html',
    patterns: [/^mc_(cmd_center|woohoo|tuner|dresser|settings|career|cas|cheats|cleaner|clubs|control|gedcom|lastexception|occult|population|pregnancy)(?=\.)/i] },
  { id: 'wickedwhims', name: 'TURBODRIVER', url: 'https://turbodriver.itch.io/wickedwhims',
    source: 'https://turbodriver.itch.io/wickedwhims', patterns: [/^TURBODRIVER_/i] },
  { id: 'lot51', name: 'Lot 51', url: 'https://lot51.cc',
    source: 'https://lot51.cc/core', patterns: [/^lot51_/i] },
  { id: 'scumbumbo', keepName: true, name: 'Scumbumbo', url: 'https://scumbumbomods.com',
    source: 'https://scumbumbomods.com/xml-injector', patterns: [/^Scumbumbo_/i, /^XmlInjector_/i] },
  { id: 'uicheats', keepName: true, name: 'UI Cheats Extension (weerbesu)', url: 'https://direct.modthesims.info/d/558548',
    source: 'https://direct.modthesims.info/d/558548', patterns: [/^UI_Cheats_Extension/i] },
  { id: 'plumbbuddy', name: 'PlumbBuddy (CodeBleu)',
    url: 'https://forums.ea.com/discussions/the-sims-franchise-discussion-en/free-mod-manager-for-all-four-sims-games-early-version-feedback-welcome/13579279',
    source: 'https://forums.ea.com/discussions/the-sims-franchise-discussion-en/free-mod-manager-for-all-four-sims-games-early-version-feedback-welcome/13579279',
    patterns: [/^PlumbBuddy_/i] },
  { id: 'basemental', keepName: true, name: 'Basemental', url: 'https://basementalcc.com',
    urlSource: 'https://segmentnext.com/the-sims-4-basemental-drug-mod',
    source: 'https://kotaku.com/modder-makes-6-000-a-month-adding-drugs-to-the-sims-4-1823044123',
    patterns: [/^Basemental /i, /^basementaldrugs/i] },
  { id: 'littlbowbub', name: 'Littlbowbub', url: 'https://musthavemods.com/creator/littlbowbub/',
    source: 'https://musthavemods.com/creator/littlbowbub/', patterns: [/^(LBB|Littlbowbub)_/i] },
  { id: 'kijiko', name: 'Kijiko', url: 'https://kijiko-catfood.com',
    source: 'https://kijiko-catfood.com/about/', patterns: [/^\[Kijiko\]/i] },
  { id: 'pandasama', name: 'Pandasama', url: 'https://musthavemods.com/creator/pandasamacc/',
    source: 'https://musthavemods.com/creator/pandasamacc/', patterns: [/^pandasama_/i] },
  { id: 'sacrificial', name: 'Sacrificial', url: 'https://musthavemods.com/creator/sacrificialmods/',
    source: 'https://musthavemods.com/creator/sacrificialmods/',
    patterns: [/^SAC_(Zombie Apocalypse|Life Tragedies|ExtremeViolence|Extreme Violence)/i, /^Sacrificial's Mods/i] },
  { id: 'apricot-rush', name: 'Apricot Rush', url: 'https://simscommunity.info/2025/12/17/the-sims-4-custom-food-mods/',
    source: 'https://simscommunity.info/2025/12/17/the-sims-4-custom-food-mods/', patterns: [/^\[Apricot Rush\]/i] },
  { id: 'ah00b', name: 'aharris00britney (AH00B)', url: 'https://musthavemods.com/creator/aharris00britney/',
    source: 'https://musthavemods.com/creator/aharris00britney/', patterns: [/^\[AH00B\]/i] },
  { id: 'axa', name: 'AxA', url: 'https://musthavemods.com/creator/aharris00britney/',
    source: 'https://musthavemods.com/creator/aharris00britney/', patterns: [/^\[AxA\]/i] },
  { id: 'luthienrising', name: 'luthienrising', url: 'https://www.patreon.com/cw/luthienrising',
    source: 'https://www.patreon.com/cw/luthienrising', patterns: [/^luthienrising_/i] },
  { id: 'casteru', name: 'casteru', url: 'https://www.patreon.com/casteru/sitemap',
    source: 'https://www.patreon.com/casteru/sitemap', patterns: [/^casteru_/i] },
  { id: 'simandy', name: 'simandy', url: 'https://musthavemods.com/mods/cmim9sb0l0047ox5693ud7tzt/',
    source: 'https://musthavemods.com/mods/cmim9sb0l0047ox5693ud7tzt/', patterns: [/^simandy_/i] },
];

export const PACK_CODES = {
  EP01: 'Get to Work',
  EP02: 'Get Together',
  GP01: 'Outdoor Retreat',
  SP01: 'Luxury Party Stuff',
  GTW: 'Get to Work',
};

export function stripOrderMarkers(name) {
  return name.replace(/^!+/, '').replace(/^(?:z{2,}|Z{2,})[_\- ]+|^z{2,}(?=[A-Z0-9])/, '');
}

export function matchCreator(filename) {
  const base = stripOrderMarkers(filename);
  const hit = CREATORS.find((c) => c.patterns.some((p) => p.test(base)));
  return hit ? { id: hit.id, name: hit.name, url: hit.url } : null;
}
