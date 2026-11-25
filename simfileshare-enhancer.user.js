// ==UserScript==
// @name         Sim File Share Enhancer
// @namespace    https://simfileshare.net/
// @version      2.2.0
// @description  Modern theme, filters, sorting and safe bulk selection for Sim File Share.
// @author       p4tit0
// @match        https://simfileshare.net/*
// @match        https://www.simfileshare.net/*
// @run-at       document-start
// @grant        GM_addStyle
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_xmlhttpRequest
// @connect      raw.githubusercontent.com
// @updateURL    https://raw.githubusercontent.com/birb-labs/sim-file-share-enhancer/main/simfileshare-enhancer.user.js
// @downloadURL  https://raw.githubusercontent.com/birb-labs/sim-file-share-enhancer/main/simfileshare-enhancer.user.js
// ==/UserScript==

'use strict';
var __sfx = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/index.js
  var index_exports = {};
  __export(index_exports, {
    CREATORS: () => CREATORS,
    ICON_NAMES: () => ICON_NAMES,
    PACK_CODES: () => PACK_CODES,
    applyCachedData: () => applyCachedData,
    buildPageHead: () => buildPageHead,
    collectRows: () => collectRows,
    compareRows: () => compareRows,
    creatorsForFile: () => creatorsForFile,
    enhanceFileTable: () => enhanceFileTable,
    extOf: () => extOf,
    formatLinks: () => formatLinks,
    getSelected: () => getSelected,
    icon: () => icon,
    main: () => main,
    matchCreator: () => matchCreator,
    matchCreators: () => matchCreators,
    matchesFilters: () => matchesFilters,
    matchesQuery: () => matchesQuery,
    parseDate: () => parseDate,
    parseHead: () => parseHead,
    parseName: () => parseName,
    parseSize: () => parseSize,
    rangeIndices: () => rangeIndices,
    refreshData: () => refreshData,
    refreshSelectionState: () => refreshSelectionState,
    registerCreators: () => registerCreators,
    registerMods: () => registerMods,
    resolveTheme: () => resolveTheme,
    setAllVisible: () => setAllVisible,
    typeOf: () => typeOf
  });

  // src/theme.js
  var THEME_KEY = "sfx-theme";
  var THEME_ORDER = ["system", "light", "dark"];
  var THEME_LABELS = { system: "Auto", light: "Light", dark: "Dark" };
  var THEME_CSS = `
html[data-sfx-theme] {
  --sfx-radius: 10px;
  --sfx-accent: #07a4dc;
  --sfx-accent-strong: #068fc1;
  --sfx-success: #2db463;
  --sfx-danger: #d9534f;
  --sfx-nav-height: 50px;
  color-scheme: light;
}
html[data-sfx-theme="light"] {
  --sfx-bg: #f4f6f9;
  --sfx-surface: #ffffff;
  --sfx-surface-alt: #f8fafc;
  --sfx-text: #1f2937;
  --sfx-muted: #6b7280;
  --sfx-border: #e3e8ef;
  --sfx-hover: #eef8fd;
  --sfx-selected: #dcf1fa;
  --sfx-shadow: 0 1px 3px rgba(15, 23, 42, 0.08);
}
html[data-sfx-theme="dark"] {
  --sfx-bg: #0f1419;
  --sfx-surface: #171d25;
  --sfx-surface-alt: #1c2430;
  --sfx-text: #e5e9ef;
  --sfx-muted: #9aa4b2;
  --sfx-border: #2a3441;
  --sfx-hover: #1d2a37;
  --sfx-selected: #143a4d;
  --sfx-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
  color-scheme: dark;
}
html[data-sfx-theme] body {
  background: var(--sfx-bg);
  color: var(--sfx-text);
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}
html[data-sfx-theme] h1, html[data-sfx-theme] h2, html[data-sfx-theme] h3,
html[data-sfx-theme] h4, html[data-sfx-theme] h5, html[data-sfx-theme] h6 {
  color: var(--sfx-text);
  font-family: inherit;
}
html[data-sfx-theme] a { color: var(--sfx-accent); }
html[data-sfx-theme] a:hover { color: var(--sfx-accent-strong); }
html[data-sfx-theme] hr { border-color: var(--sfx-border); }
html[data-sfx-theme] .navbar-default {
  background: var(--sfx-surface);
  border-color: var(--sfx-border);
  box-shadow: var(--sfx-shadow);
}
html[data-sfx-theme] .navbar-default .navbar-brand,
html[data-sfx-theme] .navbar-default .navbar-nav > li > a { color: var(--sfx-text); }
html[data-sfx-theme] .navbar-default .navbar-nav > li > a:hover { color: var(--sfx-accent); }
html[data-sfx-theme] .btn { border-radius: 8px; font-weight: 500; }
html[data-sfx-theme] .btn-default {
  background: var(--sfx-surface);
  border-color: var(--sfx-border);
  color: var(--sfx-text);
}
html[data-sfx-theme] .btn-default:hover { background: var(--sfx-hover); }
html[data-sfx-theme] .btn-primary { background: var(--sfx-accent); border-color: var(--sfx-accent); color: #fff; }
html[data-sfx-theme] .btn-primary:hover { background: var(--sfx-accent-strong); border-color: var(--sfx-accent-strong); }
html[data-sfx-theme] .btn-success { background: var(--sfx-success); border-color: var(--sfx-success); color: #fff; }
html[data-sfx-theme] .btn-danger { background: var(--sfx-danger); border-color: var(--sfx-danger); color: #fff; }
html[data-sfx-theme] .form-control,
html[data-sfx-theme] input[type="text"],
html[data-sfx-theme] input[type="search"],
html[data-sfx-theme] input[type="number"],
html[data-sfx-theme] input[type="password"],
html[data-sfx-theme] input[type="email"],
html[data-sfx-theme] select,
html[data-sfx-theme] textarea {
  background: var(--sfx-surface);
  border: 1px solid var(--sfx-border);
  border-radius: 8px;
  color: var(--sfx-text);
}
html[data-sfx-theme] .alert { border-radius: var(--sfx-radius); }
html[data-sfx-theme] .dropzone {
  background: var(--sfx-surface);
  border: 2px dashed var(--sfx-border);
  border-radius: var(--sfx-radius);
  color: var(--sfx-muted);
}
html[data-sfx-theme] .dropzone:hover { border-color: var(--sfx-accent); }
html[data-sfx-theme] #highchart {
  background: var(--sfx-surface);
  border-radius: var(--sfx-radius);
  box-shadow: var(--sfx-shadow);
}
html[data-sfx-theme] .highcharts-background { fill: var(--sfx-surface); }
html[data-sfx-theme] .highcharts-title,
html[data-sfx-theme] .highcharts-axis-labels text { fill: var(--sfx-muted) !important; }
html[data-sfx-theme] .highchart-btn {
  background: var(--sfx-surface);
  border: 1px solid var(--sfx-border);
  color: var(--sfx-text);
}
html[data-sfx-theme] .highchart-btn.btn-success { background: var(--sfx-accent); border-color: var(--sfx-accent); color: #fff; }
html[data-sfx-theme] #headerwrap { background: linear-gradient(135deg, #07a4dc, #068fc1); }
html[data-sfx-theme] footer, html[data-sfx-theme] footer p { color: var(--sfx-muted); }
html[data-sfx-theme] .table > thead > tr > th,
html[data-sfx-theme] .table > tbody > tr > td {
  border-color: var(--sfx-border);
  color: var(--sfx-text);
}
html[data-sfx-theme] .table { background: var(--sfx-surface); }
html[data-sfx-theme] .table-striped > tbody > tr:nth-of-type(odd) { background: var(--sfx-surface-alt); }
html[data-sfx-theme] .sfx-theme-toggle {
  margin: 11px 0 0 8px;
  padding: 4px 12px;
  border: 1px solid var(--sfx-border);
  border-radius: 999px;
  background: var(--sfx-surface-alt);
  color: var(--sfx-text);
  font-size: 12px;
  cursor: pointer;
}
html[data-sfx-theme] .sfx-theme-toggle:hover { border-color: var(--sfx-accent); }
`;
  function resolveTheme(setting, prefersDark) {
    if (setting === "light" || setting === "dark") return setting;
    return prefersDark ? "dark" : "light";
  }
  function initTheme(win, doc, gm) {
    let setting = gm.getValue(THEME_KEY, "system");
    if (!THEME_ORDER.includes(setting)) setting = "system";
    const media = win.matchMedia ? win.matchMedia("(prefers-color-scheme: dark)") : null;
    const apply = () => {
      doc.documentElement.dataset.sfxTheme = resolveTheme(setting, media ? media.matches : false);
    };
    apply();
    if (media) media.addEventListener("change", apply);
    return {
      get setting() {
        return setting;
      },
      cycle() {
        setting = THEME_ORDER[(THEME_ORDER.indexOf(setting) + 1) % THEME_ORDER.length];
        gm.setValue(THEME_KEY, setting);
        apply();
        return setting;
      }
    };
  }
  function mountThemeToggle(doc, theme) {
    const nav = doc.querySelector(".navbar-nav.navbar-right");
    if (!nav || doc.getElementById("sfx-theme-toggle")) return;
    const button = doc.createElement("button");
    button.type = "button";
    button.id = "sfx-theme-toggle";
    button.className = "sfx-theme-toggle";
    const label = () => {
      button.textContent = `Theme: ${THEME_LABELS[theme.setting]}`;
    };
    label();
    button.addEventListener("click", () => {
      theme.cycle();
      label();
    });
    const item = doc.createElement("li");
    item.appendChild(button);
    nav.appendChild(item);
  }

  // src/logic.js
  var FILE_BOX = 'input[type="checkbox"][name="selectedfiles"]';
  var SIZE_UNITS = { byte: 0, bytes: 0, kb: 1, mb: 2, gb: 3, tb: 4, pb: 5 };
  var MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
  function parseSize(text) {
    const m = /^\s*([\d.,]+)\s*([a-z]+)\s*$/i.exec(text || "");
    if (!m) return null;
    const power = SIZE_UNITS[m[2].toLowerCase()];
    const value = parseFloat(m[1].replace(",", "."));
    if (power === void 0 || Number.isNaN(value)) return null;
    return Math.round(value * Math.pow(1024, power));
  }
  function parseDate(text) {
    const m = /^\s*([A-Za-z]+)\.?\s+(\d{1,2}),\s+(\d{4}),\s+(.+?)\s*$/.exec(text || "");
    if (!m) return null;
    const month = MONTHS.indexOf(m[1].slice(0, 3).toLowerCase());
    if (month < 0) return null;
    let hour;
    let minute = 0;
    const clock = m[4].toLowerCase();
    if (clock === "noon") hour = 12;
    else if (clock === "midnight") hour = 0;
    else {
      const t = /^(\d{1,2})(?::(\d{2}))?\s*([ap])\.?m\.?$/.exec(clock);
      if (!t) return null;
      hour = parseInt(t[1], 10) % 12 + (t[3] === "p" ? 12 : 0);
      minute = t[2] ? parseInt(t[2], 10) : 0;
    }
    return new Date(parseInt(m[3], 10), month, parseInt(m[2], 10), hour, minute).getTime();
  }
  function extOf(name) {
    const i = name.lastIndexOf(".");
    if (i <= 0 || i === name.length - 1) return "(none)";
    return name.slice(i + 1).toLowerCase();
  }
  function matchesQuery(name, query) {
    const haystack = name.toLowerCase();
    return query.toLowerCase().split(/\s+/).filter(Boolean).every(
      (term) => term.length > 1 && term[0] === "-" ? !haystack.includes(term.slice(1)) : haystack.includes(term)
    );
  }
  function matchesFilters(row, f) {
    if (!matchesQuery(`${row.name} ${row.creator || ""}`, f.query)) return false;
    if (f.types.size > 0 && !f.types.has(row.type)) return false;
    if (f.creator) {
      const ids = row.creatorIds || [];
      if (f.creator === "__none" ? ids.length > 0 : !ids.includes(f.creator)) return false;
    }
    if (f.neverDownloaded && row.downloads !== 0) return false;
    if (f.minBytes !== null && (row.bytes === null || row.bytes < f.minBytes)) return false;
    if (f.maxBytes !== null && (row.bytes === null || row.bytes > f.maxBytes)) return false;
    if (f.since !== null && (row.added === null || row.added < f.since)) return false;
    return true;
  }
  function compareRows(a, b, key, dir) {
    const x = a[key];
    const y = b[key];
    if (x === null && y === null) return 0;
    if (x === null) return 1;
    if (y === null) return -1;
    const result = typeof x === "string" ? x.localeCompare(y, void 0, { numeric: true, sensitivity: "base" }) : x - y;
    return dir === "desc" ? -result : result;
  }
  function rangeIndices(a, b) {
    const lo = Math.min(a, b);
    const hi = Math.max(a, b);
    const out = [];
    for (let i = lo; i <= hi; i++) out.push(i);
    return out;
  }

  // data/creators.json
  var creators_default = [
    {
      id: "adeepindigo",
      name: "adeepindigo",
      patterns: [
        {
          source: "^adeepindigo[_ ]",
          flags: "i"
        }
      ],
      url: "https://adeepindigomods.itch.io",
      source: "https://adeepindigomods.itch.io/healthcare-redux",
      links: [
        {
          type: "itch",
          url: "https://adeepindigomods.itch.io"
        }
      ]
    },
    {
      id: "lumpinou",
      name: "Lumpinou",
      patterns: [
        {
          source: "^lumpinou_",
          flags: "i"
        }
      ],
      url: "https://lumpinoumods.com",
      source: "https://lumpinoumods.com",
      links: [
        {
          type: "site",
          url: "https://lumpinoumods.com"
        }
      ]
    },
    {
      id: "mccc",
      name: "MC Command Center (Deaderpool)",
      patterns: [
        {
          source: "^mc_(cmd_center|woohoo|tuner|dresser|settings|career|cas|cheats|cleaner|clubs|control|gedcom|lastexception|occult|population|pregnancy)(?=\\.)",
          flags: "i"
        }
      ],
      url: "https://deaderpool-mccc.com",
      source: "https://deaderpool-mccc.com/documentation.html",
      links: [
        {
          type: "site",
          url: "https://deaderpool-mccc.com"
        }
      ]
    },
    {
      id: "wickedwhims",
      name: "TURBODRIVER",
      patterns: [
        {
          source: "^TURBODRIVER_",
          flags: "i"
        }
      ],
      url: "https://turbodriver.itch.io/wickedwhims",
      source: "https://turbodriver.itch.io/wickedwhims",
      links: [
        {
          type: "itch",
          url: "https://turbodriver.itch.io/wickedwhims"
        }
      ]
    },
    {
      id: "lot51",
      name: "Lot 51",
      patterns: [
        {
          source: "^lot51_",
          flags: "i"
        }
      ],
      url: "https://lot51.cc",
      source: "https://lot51.cc/core",
      links: [
        {
          type: "site",
          url: "https://lot51.cc"
        }
      ]
    },
    {
      id: "scumbumbo",
      name: "Scumbumbo",
      keepName: true,
      patterns: [
        {
          source: "^Scumbumbo_",
          flags: "i"
        },
        {
          source: "^XmlInjector_",
          flags: "i"
        }
      ],
      url: "https://scumbumbomods.com",
      source: "https://scumbumbomods.com/xml-injector",
      links: [
        {
          type: "site",
          url: "https://scumbumbomods.com"
        }
      ]
    },
    {
      id: "uicheats",
      name: "UI Cheats Extension (weerbesu)",
      keepName: true,
      patterns: [
        {
          source: "^UI_Cheats_Extension",
          flags: "i"
        }
      ],
      url: "https://direct.modthesims.info/d/558548",
      source: "https://direct.modthesims.info/d/558548",
      links: [
        {
          type: "other",
          url: "https://direct.modthesims.info/d/558548"
        }
      ]
    },
    {
      id: "plumbbuddy",
      name: "PlumbBuddy (CodeBleu)",
      patterns: [
        {
          source: "^PlumbBuddy_",
          flags: "i"
        }
      ],
      url: "https://forums.ea.com/discussions/the-sims-franchise-discussion-en/free-mod-manager-for-all-four-sims-games-early-version-feedback-welcome/13579279",
      source: "https://forums.ea.com/discussions/the-sims-franchise-discussion-en/free-mod-manager-for-all-four-sims-games-early-version-feedback-welcome/13579279",
      links: [
        {
          type: "other",
          url: "https://forums.ea.com/discussions/the-sims-franchise-discussion-en/free-mod-manager-for-all-four-sims-games-early-version-feedback-welcome/13579279"
        }
      ]
    },
    {
      id: "basemental",
      name: "Basemental",
      keepName: true,
      patterns: [
        {
          source: "^Basemental ",
          flags: "i"
        },
        {
          source: "^basementaldrugs",
          flags: "i"
        }
      ],
      url: "https://basementalcc.com",
      source: "https://kotaku.com/modder-makes-6-000-a-month-adding-drugs-to-the-sims-4-1823044123",
      urlSource: "https://segmentnext.com/the-sims-4-basemental-drug-mod",
      links: [
        {
          type: "site",
          url: "https://basementalcc.com"
        }
      ]
    },
    {
      id: "littlbowbub",
      name: "Littlbowbub",
      patterns: [
        {
          source: "^(LBB|Littlbowbub)_",
          flags: "i"
        }
      ],
      url: "https://musthavemods.com/creator/littlbowbub/",
      source: "https://musthavemods.com/creator/littlbowbub/",
      links: [
        {
          type: "musthavemods",
          url: "https://musthavemods.com/creator/littlbowbub/"
        },
        {
          type: "patreon",
          url: "https://www.patreon.com/littlbowbub"
        },
        {
          type: "tumblr",
          url: "https://littlbowbub.tumblr.com/"
        }
      ],
      image: "https://h9zcspxlg2hrrozh.public.blob.vercel-storage.com/mods/fudge-market-stall-1769569282770-0.jpg"
    },
    {
      id: "kijiko",
      name: "Kijiko",
      patterns: [
        {
          source: "^\\[Kijiko\\]",
          flags: "i"
        }
      ],
      url: "https://kijiko-catfood.com",
      source: "https://kijiko-catfood.com/about/",
      links: [
        {
          type: "site",
          url: "https://kijiko-catfood.com"
        }
      ]
    },
    {
      id: "pandasama",
      name: "Pandasama",
      patterns: [
        {
          source: "^pandasama_",
          flags: "i"
        }
      ],
      url: "https://musthavemods.com/creator/pandasamacc/",
      source: "https://musthavemods.com/creator/pandasamacc/",
      links: [
        {
          type: "musthavemods",
          url: "https://musthavemods.com/creator/pandasamacc/"
        }
      ],
      image: "https://h9zcspxlg2hrrozh.public.blob.vercel-storage.com/mods/kids-functional-car-track-1769630363399-0.jpg"
    },
    {
      id: "sacrificial",
      name: "Sacrificial",
      patterns: [
        {
          source: "^SAC_(Zombie Apocalypse|Life Tragedies|ExtremeViolence|Extreme Violence)",
          flags: "i"
        },
        {
          source: "^Sacrificial's Mods",
          flags: "i"
        }
      ],
      url: "https://musthavemods.com/creator/sacrificialmods/",
      source: "https://musthavemods.com/creator/sacrificialmods/",
      links: [
        {
          type: "musthavemods",
          url: "https://musthavemods.com/creator/sacrificialmods/"
        },
        {
          type: "patreon",
          url: "https://www.patreon.com/sacrificialmods"
        }
      ]
    },
    {
      id: "apricot-rush",
      name: "Apricot Rush",
      patterns: [
        {
          source: "^\\[Apricot Rush\\]",
          flags: "i"
        }
      ],
      url: "https://simscommunity.info/2025/12/17/the-sims-4-custom-food-mods/",
      source: "https://simscommunity.info/2025/12/17/the-sims-4-custom-food-mods/",
      links: [
        {
          type: "other",
          url: "https://simscommunity.info/2025/12/17/the-sims-4-custom-food-mods/"
        }
      ]
    },
    {
      id: "ah00b",
      name: "aharris00britney (AH00B)",
      patterns: [
        {
          source: "^\\[AH00B\\]",
          flags: "i"
        }
      ],
      url: "https://musthavemods.com/creator/aharris00britney/",
      source: "https://musthavemods.com/creator/aharris00britney/",
      links: [
        {
          type: "musthavemods",
          url: "https://musthavemods.com/creator/aharris00britney/"
        }
      ],
      image: "https://h9zcspxlg2hrrozh.public.blob.vercel-storage.com/mods/uploads/tumblr-c54b0cb034773fbbf55cbb8bfe0188cd-7bd2199e-540-utUXzfThOMDFzbf9hNmMnejt2fquwn.png"
    },
    {
      id: "axa",
      name: "AxA",
      patterns: [
        {
          source: "^\\[AxA\\]",
          flags: "i"
        }
      ],
      url: "https://musthavemods.com/creator/aharris00britney/",
      source: "https://musthavemods.com/creator/aharris00britney/",
      links: [
        {
          type: "musthavemods",
          url: "https://musthavemods.com/creator/aharris00britney/"
        }
      ],
      image: "https://h9zcspxlg2hrrozh.public.blob.vercel-storage.com/mods/uploads/tumblr-c54b0cb034773fbbf55cbb8bfe0188cd-7bd2199e-540-utUXzfThOMDFzbf9hNmMnejt2fquwn.png"
    },
    {
      id: "luthienrising",
      name: "luthienrising",
      patterns: [
        {
          source: "^luthienrising_",
          flags: "i"
        }
      ],
      url: "https://www.patreon.com/cw/luthienrising",
      source: "https://www.patreon.com/cw/luthienrising",
      links: [
        {
          type: "patreon",
          url: "https://www.patreon.com/cw/luthienrising"
        }
      ]
    },
    {
      id: "casteru",
      name: "casteru",
      patterns: [
        {
          source: "^casteru_",
          flags: "i"
        }
      ],
      url: "https://www.patreon.com/casteru/sitemap",
      source: "https://www.patreon.com/casteru/sitemap",
      links: [
        {
          type: "patreon",
          url: "https://www.patreon.com/casteru/sitemap"
        }
      ]
    },
    {
      id: "simandy",
      name: "simandy",
      patterns: [
        {
          source: "^simandy_",
          flags: "i"
        }
      ],
      url: "https://musthavemods.com/mods/cmim9sb0l0047ox5693ud7tzt/",
      source: "https://musthavemods.com/mods/cmim9sb0l0047ox5693ud7tzt/",
      links: [
        {
          type: "musthavemods",
          url: "https://musthavemods.com/mods/cmim9sb0l0047ox5693ud7tzt/"
        },
        {
          type: "tumblr",
          url: "https://simandy.tumblr.com/"
        }
      ],
      image: "https://h9zcspxlg2hrrozh.public.blob.vercel-storage.com/mods/betty-boop-hairstyle-1769603954563-0.jpg"
    }
  ];

  // src/creators.js
  var LINK_TYPES = ["patreon", "tumblr", "site", "itch", "kofi", "musthavemods", "other"];
  function hydrate(entry) {
    const links = Array.isArray(entry.links) && entry.links.length > 0 ? entry.links : entry.url ? [{ type: "site", url: entry.url }] : [];
    return {
      ...entry,
      url: entry.url || links[0] && links[0].url,
      links,
      patterns: (entry.patterns || []).map((p) => p instanceof RegExp ? p : new RegExp(p.source, p.flags))
    };
  }
  var CREATORS = creators_default.map(hydrate);
  function registerCreators(list) {
    if (!Array.isArray(list) || list.length === 0) return;
    CREATORS.splice(0, CREATORS.length, ...list.filter((c) => c && c.id && c.name).map(hydrate));
  }
  var PACK_CODES = {
    EP01: "Get to Work",
    EP02: "Get Together",
    GP01: "Outdoor Retreat",
    SP01: "Luxury Party Stuff",
    GTW: "Get to Work"
  };
  function stripOrderMarkers(name) {
    return name.replace(/^!+/, "").replace(/^(?:z{2,}|Z{2,})[_\- ]+|^z{2,}(?=[A-Z0-9])/, "");
  }
  function matchCreators(filename) {
    const base = stripOrderMarkers(filename);
    return CREATORS.filter((c) => c.patterns.some((p) => p.test(base)));
  }
  function matchCreator(filename) {
    const hit = matchCreators(filename)[0];
    return hit ? { id: hit.id, name: hit.name, url: hit.url } : null;
  }

  // src/icons.js
  var SVG_NS = "http://www.w3.org/2000/svg";
  var ICON_PATHS = {
    package: '<path d="M21 8l-9-5-9 5v8l9 5 9-5z"/><path d="M3 8l9 5 9-5"/><path d="M12 13v8"/>',
    script: '<polyline points="8 7 3 12 8 17"/><polyline points="16 7 21 12 16 17"/><line x1="14" y1="5" x2="10" y2="19"/>',
    log: '<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="14 3 14 9 20 9"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="14" y2="17"/>',
    config: '<line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="17" x2="20" y2="17"/><circle cx="9" cy="7" r="2"/><circle cx="15" cy="17" r="2"/>',
    file: '<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="14 3 14 9 20 9"/>',
    folder: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
    search: '<circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.5" y2="16.5"/>',
    link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
    download: '<path d="M12 4v11"/><polyline points="7 11 12 16 17 11"/><path d="M5 20h14"/>',
    sort: '<polyline points="8 9 12 5 16 9"/><polyline points="8 15 12 19 16 15"/>',
    copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h9"/>',
    clear: '<line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/>',
    heart: '<path d="M20.8 5.6a5 5 0 0 0-7.1 0L12 7.3l-1.7-1.7a5 5 0 0 0-7.1 7.1l1.7 1.7L12 21l7.1-6.6 1.7-1.7a5 5 0 0 0 0-7.1z"/>'
  };
  var ICON_NAMES = Object.keys(ICON_PATHS);
  var ICON_CSS = `
.sfx-icon {
  width: 1em;
  height: 1em;
  flex: none;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
  vertical-align: -0.125em;
}
`;
  function icon(doc, name) {
    const svg = doc.createElementNS(SVG_NS, "svg");
    svg.setAttribute("class", "sfx-icon");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("aria-hidden", "true");
    svg.innerHTML = ICON_PATHS[name] || ICON_PATHS.file;
    return svg;
  }

  // src/parse-name.js
  var FLAG_PHRASES = ["required if pack owned", "optional", "required", "needed"];
  var FLAG_TOKENS = { OPTIONAL: "optional", NEEDED: "needed", REQUIRED: "required" };
  var PACK_TOKEN = /^(?:EP|GP|SP)\d{2}$/i;
  var FILE_TYPES = {
    package: { id: "package", label: "Package", icon: "package" },
    ts4script: { id: "script", label: "Script", icon: "script" },
    log: { id: "log", label: "Log", icon: "log" },
    cfg: { id: "config", label: "Config", icon: "config" }
  };
  var OTHER_TYPE = { id: "other", label: "Other", icon: "file" };
  function typeOf(ext) {
    return FILE_TYPES[ext] || OTHER_TYPE;
  }
  function parseName(name) {
    const ext = extOf(name);
    const base = ext === "(none)" ? name : name.slice(0, name.lastIndexOf("."));
    let rest = stripOrderMarkers(base);
    const loadOrder = rest !== base;
    const creator = matchCreator(name);
    const definition = creator ? CREATORS.find((c) => c.id === creator.id) : null;
    let tag = null;
    const bracket = /^\[([^\]]+)\][-_ ]*/.exec(rest);
    if (bracket) {
      if (!creator) tag = bracket[1];
      rest = rest.slice(bracket[0].length);
    } else if (creator && !definition.keepName) {
      const prefix = /^[^_ ]+[_ ]/.exec(rest);
      if (prefix) rest = rest.slice(prefix[0].length);
    }
    const flags = [];
    rest = rest.replace(/\(([^)]*)\)/g, (whole, inner) => {
      const phrase = inner.trim().toLowerCase();
      if (!FLAG_PHRASES.includes(phrase)) return whole;
      flags.push(phrase);
      return " ";
    });
    rest = rest.replace(/(^|[_\s])(OPTIONAL|NEEDED|REQUIRED)(?=$|[_\s])/g, (whole, lead, token) => {
      flags.push(FLAG_TOKENS[token]);
      return lead;
    });
    rest = rest.replace(/(^|[\s_])-mod-(?=$|[\s_])/gi, "$1");
    let version = null;
    rest = rest.replace(/(^|[\s_-])([vV])(\d+(?:\.\d+)*)(?=$|[\s_-])/, (whole, lead, letter, number) => {
      if (letter === "V" && !number.includes(".")) return whole;
      version = number;
      return lead;
    });
    const packs = [];
    rest.split(/[\s_\-()[\].,]+/).forEach((token) => {
      const code = token.toUpperCase();
      if ((PACK_TOKEN.test(token) || PACK_CODES[code] !== void 0) && !packs.includes(code)) packs.push(code);
    });
    const title = rest.replace(/_/g, " ").replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2").replace(/\s+/g, " ").replace(/^[\s_-]+|[\s_-]+$/g, "");
    return { creator, tag, title: title || name, version, flags, packs, loadOrder };
  }

  // src/hashes.js
  var MD5 = /^[0-9a-f]{32}$/i;
  function parseHead(headers) {
    const tag = (headers.get("etag") || "").replace(/^W\//, "").replace(/"/g, "");
    const size = parseInt(headers.get("content-length"), 10);
    return {
      md5: MD5.test(tag) ? tag.toLowerCase() : null,
      etag: tag && !MD5.test(tag) ? tag : null,
      size: Number.isNaN(size) ? null : size
    };
  }
  function buildEntry(row, head) {
    const entry = {
      md5: head.md5,
      name: row.name,
      size: head.size,
      creators: matchCreators(row.name).map((c) => c.id),
      category: null,
      tags: [],
      image: null,
      type: typeOf(row.ext).id
    };
    if (!head.md5) entry.etag = head.etag;
    return entry;
  }
  async function collectHashes(win, rows, onProgress, concurrency = 4) {
    const entries = [];
    const skipped = [];
    let next = 0;
    let done = 0;
    async function worker() {
      while (next < rows.length) {
        const row = rows[next++];
        try {
          const res = await win.fetch(`/download/${row.id}/`, { method: "HEAD", credentials: "same-origin" });
          const head = res.ok ? parseHead(res.headers) : { md5: null, etag: null, size: null };
          if (head.md5 || head.etag) entries.push(buildEntry(row, head));
          else skipped.push(row.name);
        } catch {
          skipped.push(row.name);
        }
        onProgress(++done, rows.length);
      }
    }
    await Promise.all(Array.from({ length: Math.min(concurrency, rows.length) }, worker));
    entries.sort((a, b) => a.name.localeCompare(b.name));
    return { entries, skipped };
  }
  function downloadJson(win, doc, data, filename) {
    const url = win.URL.createObjectURL(new win.Blob([JSON.stringify(data, null, 2) + "\n"], { type: "application/json" }));
    const a = doc.createElement("a");
    a.href = url;
    a.download = filename;
    doc.body.appendChild(a);
    a.click();
    a.remove();
    win.setTimeout(() => win.URL.revokeObjectURL(url), 1e3);
  }

  // src/toolbar.js
  var TOOLBAR_CSS = `
html[data-sfx-theme] .sfx-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px 14px;
  margin: 12px 0;
  padding: 12px 14px;
  background: var(--sfx-surface);
  border: 1px solid var(--sfx-border);
  border-radius: var(--sfx-radius);
  box-shadow: var(--sfx-shadow);
}
html[data-sfx-theme] .sfx-search { position: relative; display: block; flex: 1 1 260px; min-width: 200px; margin: 0; }
html[data-sfx-theme] .sfx-search .sfx-icon { position: absolute; left: 11px; top: 50%; transform: translateY(-50%); color: var(--sfx-muted); }
html[data-sfx-theme] .sfx-search input[type="search"] { width: 100%; height: 34px; padding: 4px 12px 4px 34px; font-size: 14px; font-weight: 400; }
html[data-sfx-theme] .sfx-toolbar input[type="number"] { width: 104px; height: 34px; padding: 4px 8px; -moz-appearance: textfield; appearance: textfield; }
html[data-sfx-theme] .sfx-toolbar input[type="number"]::-webkit-inner-spin-button,
html[data-sfx-theme] .sfx-toolbar input[type="number"]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
html[data-sfx-theme] .sfx-toolbar select { height: 34px; padding: 4px 8px; }
html[data-sfx-theme] .sfx-group { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; }
html[data-sfx-theme] .sfx-label { color: var(--sfx-muted); font-size: 12px; }
html[data-sfx-theme] .sfx-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border: 1px solid var(--sfx-border);
  border-radius: 999px;
  background: var(--sfx-surface-alt);
  color: var(--sfx-text);
  font-size: 12px;
  cursor: pointer;
}
html[data-sfx-theme] .sfx-chip:hover { border-color: var(--sfx-accent); }
html[data-sfx-theme] .sfx-chip[aria-pressed="true"] { background: var(--sfx-accent); border-color: var(--sfx-accent); color: #fff; }
html[data-sfx-theme] .sfx-chip-count { margin-left: 4px; opacity: 0.7; }
html[data-sfx-theme] .sfx-count { margin-left: auto; color: var(--sfx-muted); font-size: 13px; }
html[data-sfx-theme] .sfx-table > thead > tr > th.sfx-sortable { cursor: pointer; }
`;
  var SINCE_MS = { "24h": 864e5, "7d": 6048e5, "30d": 2592e6 };
  var SORT_COLUMNS = {
    file: "name",
    type: "type",
    creators: "creator",
    size: "bytes",
    dls: "downloads",
    hearts: "hearts",
    added: "added",
    last: "lastDownload"
  };
  var SORT_FIRST_DIR = {
    name: "asc",
    type: "asc",
    creator: "asc",
    bytes: "asc",
    downloads: "desc",
    hearts: "desc",
    added: "desc",
    lastDownload: "desc"
  };
  function megabytesToBytes(value) {
    const n = parseFloat(value);
    return Number.isNaN(n) || n < 0 ? null : Math.round(n * 1024 * 1024);
  }
  function h(doc, tag, props, ...children) {
    const node = doc.createElement(tag);
    Object.entries(props || {}).forEach(([k, v]) => node.setAttribute(k, v));
    node.append(...children);
    return node;
  }
  function currentFilters(ctx) {
    const ui = ctx.ui;
    return {
      query: ui.search.value,
      types: ctx.activeTypes,
      creator: ui.creator.value || null,
      neverDownloaded: ui.never.getAttribute("aria-pressed") === "true",
      minBytes: megabytesToBytes(ui.min.value),
      maxBytes: megabytesToBytes(ui.max.value),
      since: SINCE_MS[ui.since.value] ? Date.now() - SINCE_MS[ui.since.value] : null
    };
  }
  function applyFilters(ctx) {
    const filters = currentFilters(ctx);
    let visible = 0;
    ctx.rows.forEach((row) => {
      const show = matchesFilters(row, filters);
      row.tr.hidden = !show;
      if (show) visible++;
      else row.cb.checked = false;
    });
    ctx.ui.count.textContent = `${visible} of ${ctx.rows.length} files`;
    refreshSelectionState(ctx);
  }
  function resetFilters(ctx) {
    const ui = ctx.ui;
    ui.search.value = "";
    ui.min.value = "";
    ui.max.value = "";
    ui.since.value = "";
    ui.creator.value = "";
    ui.never.setAttribute("aria-pressed", "false");
    ctx.activeTypes.clear();
    ui.chips.forEach((chip) => chip.setAttribute("aria-pressed", "false"));
    applyFilters(ctx);
  }
  function buildToolbar(ctx) {
    const doc = ctx.doc;
    const counts = /* @__PURE__ */ new Map();
    ctx.rows.forEach((r) => counts.set(r.type, (counts.get(r.type) || 0) + 1));
    const typeInfo = (id) => Object.values(FILE_TYPES).concat(OTHER_TYPE).find((t) => t.id === id);
    const chips = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).map(
      ([id, n]) => h(
        doc,
        "button",
        { type: "button", class: "sfx-chip", "data-type": id, "aria-pressed": "false" },
        icon(doc, typeInfo(id).icon),
        typeInfo(id).label,
        h(doc, "span", { class: "sfx-chip-count" }, String(n))
      )
    );
    const creatorCounts = /* @__PURE__ */ new Map();
    let unknown = 0;
    ctx.rows.forEach((r) => {
      if (r.creators.length === 0) unknown++;
      r.creators.forEach((c) => creatorCounts.set(c.id, { name: c.name, n: ((creatorCounts.get(c.id) || {}).n || 0) + 1 }));
    });
    const creatorSelect = h(
      doc,
      "select",
      { id: "sfx-creator-filter", "aria-label": "Filter by creator" },
      h(doc, "option", { value: "" }, "All creators"),
      ...Array.from(creatorCounts.entries()).sort((a, b) => a[1].name.localeCompare(b[1].name, void 0, { sensitivity: "base" })).map(([id, c]) => h(doc, "option", { value: id }, `${c.name} (${c.n})`)),
      ...unknown > 0 ? [h(doc, "option", { value: "__none" }, `No known creator (${unknown})`)] : []
    );
    const ui = {
      creator: creatorSelect,
      search: h(doc, "input", { type: "search", id: "sfx-search", placeholder: "Filter by name (use -word to exclude)" }),
      never: h(doc, "button", { type: "button", id: "sfx-never-dl", class: "sfx-chip", "aria-pressed": "false" }, "Never downloaded"),
      min: h(doc, "input", { type: "number", id: "sfx-min-size", min: "0", step: "any", placeholder: "Min MB" }),
      max: h(doc, "input", { type: "number", id: "sfx-max-size", min: "0", step: "any", placeholder: "Max MB" }),
      since: h(
        doc,
        "select",
        { id: "sfx-since" },
        h(doc, "option", { value: "" }, "Any date"),
        h(doc, "option", { value: "24h" }, "Last 24 hours"),
        h(doc, "option", { value: "7d" }, "Last 7 days"),
        h(doc, "option", { value: "30d" }, "Last 30 days")
      ),
      invert: h(doc, "button", { type: "button", id: "sfx-invert", class: "btn btn-default btn-sm" }, "Invert selection"),
      hashes: h(doc, "button", { type: "button", id: "sfx-export-hashes", class: "btn btn-default btn-sm", title: "Read the MD5 of each visible file from the server (no download) and save a JSON for the mods database" }, icon(doc, "download"), " Export hashes"),
      reset: h(doc, "button", { type: "button", id: "sfx-clear", class: "btn btn-default btn-sm" }, icon(doc, "clear"), " Reset filters"),
      count: h(doc, "span", { id: "sfx-visible-count", class: "sfx-count" }),
      chips
    };
    ctx.ui = ui;
    const toolbar = h(
      doc,
      "div",
      { id: "sfx-toolbar", class: "sfx-toolbar" },
      h(doc, "label", { class: "sfx-search" }, icon(doc, "search"), ui.search),
      h(doc, "div", { class: "sfx-group" }, ...chips, ui.never),
      h(doc, "div", { class: "sfx-group" }, h(doc, "span", { class: "sfx-label" }, "Size"), ui.min, ui.max, ui.since),
      h(doc, "div", { class: "sfx-group" }, ui.creator),
      h(doc, "div", { class: "sfx-group" }, ui.invert, ui.hashes, ui.reset),
      ui.count
    );
    const anchor = doc.querySelector(".sfx-folders") || ctx.wrap;
    anchor.parentNode.insertBefore(toolbar, anchor);
    toolbar.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && e.target.matches("input, select")) e.preventDefault();
    });
    ["input", "change"].forEach((type) => toolbar.addEventListener(type, (e) => {
      if (e.target.matches("input, select")) applyFilters(ctx);
    }));
    chips.forEach((chip) => chip.addEventListener("click", () => {
      const type = chip.dataset.type;
      const on = !ctx.activeTypes.has(type);
      if (on) ctx.activeTypes.add(type);
      else ctx.activeTypes.delete(type);
      chip.setAttribute("aria-pressed", String(on));
      applyFilters(ctx);
    }));
    ui.never.addEventListener("click", () => {
      ui.never.setAttribute("aria-pressed", String(ui.never.getAttribute("aria-pressed") !== "true"));
      applyFilters(ctx);
    });
    ui.reset.addEventListener("click", () => resetFilters(ctx));
    ui.hashes.addEventListener("click", async () => {
      if (ui.hashes.disabled) return;
      const selected = ctx.rows.filter((r) => r.cb.checked && isVisibleRow(r));
      const targets = selected.length > 0 ? selected : ctx.rows.filter(isVisibleRow);
      const label = ui.hashes.lastChild;
      ui.hashes.disabled = true;
      const result = await collectHashes(ctx.win, targets, (done, total) => {
        label.textContent = ` ${done}/${total}`;
      });
      downloadJson(ctx.win, doc, result.entries, "mods-export.json");
      if (result.skipped.length > 0) ctx.win.console.warn(`Sim File Share Enhancer: ${result.skipped.length} files without a usable MD5`, result.skipped);
      label.textContent = ` Export hashes`;
      ui.hashes.disabled = false;
    });
    ui.invert.addEventListener("click", () => {
      ctx.touched = true;
      ctx.rows.forEach((r) => {
        if (isVisibleRow(r)) r.cb.checked = !r.cb.checked;
      });
      refreshSelectionState(ctx);
    });
    applyFilters(ctx);
  }
  function sortBy(ctx, key) {
    const same = ctx.sort && ctx.sort.key === key;
    const dir = same ? ctx.sort.dir === "asc" ? "desc" : "asc" : SORT_FIRST_DIR[key];
    ctx.sort = { key, dir };
    ctx.rows = [...ctx.rows].sort((a, b) => compareRows(a, b, key, dir));
    ctx.rows.forEach((r) => ctx.tbody.appendChild(r.tr));
    ctx.table.querySelectorAll("thead th").forEach((th) => {
      if (th.dataset.sfxKey === key) th.setAttribute("aria-sort", dir === "asc" ? "ascending" : "descending");
      else th.removeAttribute("aria-sort");
    });
  }
  function setupSorting(ctx) {
    const head = ctx.table.querySelector("thead");
    if (!head) return;
    head.querySelectorAll("th[data-sfx-col]").forEach((th) => {
      const key = SORT_COLUMNS[th.dataset.sfxCol];
      if (!key) return;
      th.dataset.sfxKey = key;
      th.classList.add("sfx-sortable");
      th.querySelectorAll(".glyphicon").forEach((g) => g.remove());
      const target = th.querySelector("a") || th;
      if (th.dataset.sfxCol === "hearts") {
        th.title = "Hearts";
        th.setAttribute("aria-label", "Hearts");
        target.append(icon(ctx.doc, "heart"));
      }
      target.append(icon(ctx.doc, "sort"));
    });
    head.addEventListener("click", (e) => {
      const th = e.target.closest("th[data-sfx-key]");
      if (!th) return;
      e.preventDefault();
      sortBy(ctx, th.dataset.sfxKey);
    });
  }

  // src/actionbar.js
  var ACTIONBAR_CSS = `
html[data-sfx-theme] .sfx-actionbar {
  position: fixed;
  left: 50%;
  bottom: 18px;
  z-index: 1000;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  max-width: calc(100vw - 24px);
  padding: 10px 14px;
  transform: translateX(-50%);
  background: var(--sfx-surface);
  border: 1px solid var(--sfx-border);
  border-radius: 999px;
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.28);
}
html[data-sfx-theme] .sfx-actionbar[hidden] { display: none !important; }
html[data-sfx-theme] .sfx-actionbar .btn { margin: 0; float: none; }
html[data-sfx-theme] .sfx-selected-count { margin: 0 6px; font-weight: 600; }
`;
  function formatLinks(ids) {
    return ids.map((id) => `http://www.simfileshare.net/download/${id}/`).join("\n");
  }
  function copyText(win, doc, text) {
    if (win.navigator.clipboard && win.navigator.clipboard.writeText) {
      return win.navigator.clipboard.writeText(text);
    }
    const area = doc.createElement("textarea");
    area.value = text;
    doc.body.appendChild(area);
    area.select();
    if (doc.execCommand) doc.execCommand("copy");
    area.remove();
    return Promise.resolve();
  }
  function buildActionBar(ctx) {
    const { doc, win } = ctx;
    const form = ctx.table.closest("form");
    const add = form && form.querySelector('input[name="addfilestofolders"]');
    const del = form && form.querySelector('input[name="deletefiles"]');
    if (!form) return;
    if (!form.id) form.id = "sfx-bulk-form";
    const count = h(doc, "span", { class: "sfx-selected-count" }, "0 selected");
    const copyLabel = h(doc, "span", {}, "Copy links");
    const copy = h(doc, "button", { type: "button", id: "sfx-copy-links", class: "btn btn-default btn-sm" }, icon(doc, "copy"), " ", copyLabel);
    const clear = h(doc, "button", { type: "button", id: "sfx-clear-selection", class: "btn btn-default btn-sm" }, icon(doc, "clear"), " Clear");
    const bar = h(doc, "div", { id: "sfx-actionbar", class: "sfx-actionbar", hidden: "" }, count, copy, clear);
    [add, del].forEach((button) => {
      if (!button) return;
      button.setAttribute("form", form.id);
      button.classList.remove("pull-right");
      button.removeAttribute("style");
      bar.appendChild(button);
    });
    doc.body.appendChild(bar);
    const update = (n) => {
      bar.hidden = n === 0;
      count.textContent = `${n} selected`;
    };
    doc.addEventListener("sfx:selection", (e) => update(e.detail.count));
    update(getSelected(ctx.rows).length);
    clear.addEventListener("click", () => clearSelection(ctx));
    copy.addEventListener("click", () => {
      const ids = getSelected(ctx.rows).map((r) => r.id);
      copyText(win, doc, formatLinks(ids)).then(() => {
        copyLabel.textContent = `Copied ${ids.length}`;
        win.setTimeout(() => {
          copyLabel.textContent = "Copy links";
        }, 1500);
      });
    });
    if (del) {
      del.addEventListener("click", (e) => {
        const names = getSelected(ctx.rows).map((r) => r.name);
        const n = names.length;
        const listed = names.slice(0, 5).map((name) => `- ${name}`).join("\n");
        const more = n > 5 ? `
and ${n - 5} more` : "";
        const message = `Delete ${n} file${n === 1 ? "" : "s"}? This cannot be undone.

${listed}${more}`;
        if (!win.confirm(message)) e.preventDefault();
      });
    }
  }

  // src/database.js
  var REPO_RAW = "https://raw.githubusercontent.com/birb-labs/sim-file-share-enhancer/main/data/";
  var CACHE_KEY = "sfx-db";
  var CACHE_TTL_MS = 6 * 60 * 60 * 1e3;
  var modsByName = /* @__PURE__ */ new Map();
  function registerMods(list) {
    modsByName.clear();
    if (!Array.isArray(list)) return;
    list.forEach((mod) => {
      if (!mod || !mod.name) return;
      const key = mod.name.toLowerCase();
      const bucket = modsByName.get(key) || [];
      bucket.push(mod);
      modsByName.set(key, bucket);
    });
  }
  function lookupMod(name, bytes) {
    const bucket = modsByName.get(String(name).toLowerCase());
    if (!bucket) return null;
    if (bucket.length === 1 || bytes === null) return bucket[0];
    const sized = bucket.filter((m) => Math.abs(m.size - bytes) <= Math.max(1024, m.size * 0.01));
    return sized[0] || bucket[0];
  }
  function creatorsForFile(name, bytes) {
    const mod = lookupMod(name, bytes);
    if (mod && Array.isArray(mod.creators) && mod.creators.length > 0) {
      const known = mod.creators.map((id) => CREATORS.find((c) => c.id === id)).filter(Boolean);
      if (known.length > 0) return { mod, creators: known };
    }
    return { mod, creators: matchCreators(name) };
  }
  function applyCachedData(gm) {
    let cached;
    try {
      cached = JSON.parse(gm.getValue(CACHE_KEY, "null"));
    } catch {
      return false;
    }
    if (!cached) return false;
    registerCreators(cached.creators);
    registerMods(cached.mods);
    return true;
  }
  function fetchText(win, gm, url) {
    if (gm.xhr) {
      return new Promise((resolve, reject) => {
        gm.xhr({
          method: "GET",
          url,
          onload: (res) => res.status >= 200 && res.status < 300 ? resolve(res.responseText) : reject(new Error(String(res.status))),
          onerror: () => reject(new Error("network")),
          ontimeout: () => reject(new Error("timeout"))
        });
      });
    }
    return win.fetch(url).then((res) => {
      if (!res.ok) throw new Error(String(res.status));
      return res.text();
    });
  }
  function refreshData(win, gm, now = Date.now()) {
    let cached = null;
    try {
      cached = JSON.parse(gm.getValue(CACHE_KEY, "null"));
    } catch {
      cached = null;
    }
    if (cached && now - cached.at < CACHE_TTL_MS) return Promise.resolve(false);
    return Promise.resolve().then(() => Promise.all([
      fetchText(win, gm, `${REPO_RAW}creators.json`),
      fetchText(win, gm, `${REPO_RAW}mods.json`)
    ])).then(([creators, mods]) => {
      gm.setValue(CACHE_KEY, JSON.stringify({ at: now, creators: JSON.parse(creators), mods: JSON.parse(mods) }));
      return true;
    }).catch(() => false);
  }

  // src/creator-popup.js
  var POPUP_CSS = `
html[data-sfx-theme] .sfx-popup-backdrop {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: rgba(0, 0, 0, 0.5);
}
html[data-sfx-theme] .sfx-popup {
  width: min(420px, 100%);
  max-height: 90vh;
  overflow: auto;
  padding: 18px;
  border: 1px solid var(--sfx-border);
  border-radius: var(--sfx-radius);
  background: var(--sfx-surface);
  color: var(--sfx-text);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.35);
}
html[data-sfx-theme] .sfx-popup-head { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
html[data-sfx-theme] .sfx-popup-head img { width: 56px; height: 56px; border-radius: 10px; object-fit: cover; flex: none; }
html[data-sfx-theme] .sfx-popup-title { flex: 1; min-width: 0; margin: 0; font-size: 18px; font-weight: 600; }
html[data-sfx-theme] .sfx-popup-close { border: 0; background: none; color: var(--sfx-muted); cursor: pointer; font-size: 18px; }
html[data-sfx-theme] .sfx-popup-links { display: flex; flex-direction: column; gap: 8px; margin: 0; padding: 0; list-style: none; }
html[data-sfx-theme] .sfx-popup-links a {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 12px;
  border: 1px solid var(--sfx-border);
  border-radius: 8px;
  color: var(--sfx-text);
  text-decoration: none;
}
html[data-sfx-theme] .sfx-popup-links a:hover { border-color: var(--sfx-accent); color: var(--sfx-accent); }
html[data-sfx-theme] .sfx-popup-kind { flex: none; min-width: 96px; color: var(--sfx-muted); font-size: 12px; text-transform: uppercase; }
html[data-sfx-theme] .sfx-popup-url { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 13px; }
html[data-sfx-theme] .sfx-popup-empty { margin: 0; color: var(--sfx-muted); }
`;
  var LABELS = {
    patreon: "Patreon",
    tumblr: "Tumblr",
    site: "Website",
    itch: "itch.io",
    kofi: "Ko-fi",
    musthavemods: "MustHaveMods",
    other: "Other"
  };
  function sortedLinks(creator) {
    const rank = (type) => {
      const i = LINK_TYPES.indexOf(type);
      return i < 0 ? LINK_TYPES.length : i;
    };
    return [...creator.links || []].sort((a, b) => rank(a.type) - rank(b.type));
  }
  function hostOf(url) {
    try {
      const u = new URL(url);
      return (u.hostname.replace(/^www\./, "") + u.pathname).replace(/\/$/, "");
    } catch {
      return url;
    }
  }
  function openCreatorPopup(doc, creator) {
    closeCreatorPopup(doc);
    const links = sortedLinks(creator);
    const close = h(doc, "button", { type: "button", class: "sfx-popup-close", "aria-label": "Close" }, icon(doc, "clear"));
    const head = h(doc, "div", { class: "sfx-popup-head" });
    if (creator.image) head.append(h(doc, "img", { src: creator.image, alt: "", loading: "lazy", referrerpolicy: "no-referrer" }));
    head.append(h(doc, "h2", { class: "sfx-popup-title", id: "sfx-popup-title" }, creator.name), close);
    const body = links.length > 0 ? h(doc, "ul", { class: "sfx-popup-links" }, ...links.map((link) => h(doc, "li", {}, h(
      doc,
      "a",
      { href: link.url, target: "_blank", rel: "noopener noreferrer", "data-type": link.type },
      h(doc, "span", { class: "sfx-popup-kind" }, link.label || LABELS[link.type] || LABELS.other),
      h(doc, "span", { class: "sfx-popup-url" }, hostOf(link.url)),
      icon(doc, "link")
    )))) : h(doc, "p", { class: "sfx-popup-empty" }, "No official links are known for this creator yet.");
    const dialog = h(doc, "div", { class: "sfx-popup", role: "dialog", "aria-modal": "true", "aria-labelledby": "sfx-popup-title" }, head, body);
    const backdrop = h(doc, "div", { id: "sfx-popup", class: "sfx-popup-backdrop" }, dialog);
    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) closeCreatorPopup(doc);
    });
    close.addEventListener("click", () => closeCreatorPopup(doc));
    doc.addEventListener("keydown", onKey);
    doc.body.appendChild(backdrop);
    close.focus();
    return backdrop;
  }
  function onKey(e) {
    if (e.key === "Escape") closeCreatorPopup(e.target.ownerDocument || e.target);
  }
  function closeCreatorPopup(doc) {
    const open = doc.getElementById("sfx-popup");
    doc.removeEventListener("keydown", onKey);
    if (open) open.remove();
  }

  // src/table.js
  var TABLE_CSS = `
html[data-sfx-theme] .sfx-table-wrap { overflow: visible; border: 0; margin-bottom: 24px; }
html[data-sfx-theme] .sfx-table {
  table-layout: fixed;
  width: 100%;
  margin: 0;
  border-radius: var(--sfx-radius);
  box-shadow: var(--sfx-shadow);
}
html[data-sfx-theme] .sfx-table tr[hidden] { display: none !important; }
html[data-sfx-theme] .sfx-table > thead > tr > th {
  position: sticky;
  top: var(--sfx-nav-height);
  z-index: 5;
  background: var(--sfx-surface-alt);
  border-bottom: 2px solid var(--sfx-border);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  white-space: nowrap;
  vertical-align: middle;
}
html[data-sfx-theme] .sfx-table > thead > tr > th a { color: var(--sfx-muted); text-decoration: none; }
html[data-sfx-theme] .sfx-table > thead > tr > th[aria-sort] a { color: var(--sfx-accent); }
html[data-sfx-theme] .sfx-table > tbody > tr > td {
  padding: 6px 8px;
  vertical-align: middle;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
html[data-sfx-theme] .sfx-table > tbody > tr { cursor: pointer; user-select: none; }
html[data-sfx-theme] .sfx-table > tbody > tr:hover > td { background: var(--sfx-hover); }
html[data-sfx-theme] .sfx-table > tbody > tr.sfx-selected > td { background: var(--sfx-selected); }
html[data-sfx-theme] .sfx-table [data-sfx-col="check"] { width: 40px; text-align: center; }
html[data-sfx-theme] .sfx-table [data-sfx-col="type"] { width: 116px; }
html[data-sfx-theme] .sfx-table [data-sfx-col="size"] { width: 88px; text-align: right; }
html[data-sfx-theme] .sfx-table [data-sfx-col="dls"],
html[data-sfx-theme] .sfx-table [data-sfx-col="hearts"] { width: 56px; text-align: right; }
html[data-sfx-theme] .sfx-table [data-sfx-col="added"],
html[data-sfx-theme] .sfx-table [data-sfx-col="last"] { width: 104px; font-size: 12px; white-space: normal; }
html[data-sfx-theme] .sfx-table [data-sfx-col="actions"] { width: 104px; text-align: right; }
html[data-sfx-theme] .sfx-table input[type="checkbox"] { width: 16px; height: 16px; margin: 0; cursor: pointer; }
html[data-sfx-theme] .sfx-file { display: flex; align-items: center; gap: 10px; min-width: 0; }
html[data-sfx-theme] .sfx-file-icon { flex: none; color: var(--sfx-muted); font-size: 22px; line-height: 1; }
html[data-sfx-theme] .sfx-file-main { flex: 1; min-width: 0; }
html[data-sfx-theme] .sfx-file-line { display: flex; align-items: center; gap: 6px; min-width: 0; }
html[data-sfx-theme] .sfx-file-title {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--sfx-text);
  font-weight: 600;
}
html[data-sfx-theme] .sfx-filename,
html[data-sfx-theme] .sfx-packs {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--sfx-muted);
  font-size: 12px;
}
html[data-sfx-theme] .sfx-creator {
  flex: 0 1 auto;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  cursor: pointer;
}
html[data-sfx-theme] .sfx-table [data-sfx-col="creators"] { width: 150px; white-space: normal; }
html[data-sfx-theme] .sfx-table [data-sfx-col="creators"] .sfx-creator { margin: 1px 4px 1px 0; }
html[data-sfx-theme] .sfx-date, html[data-sfx-theme] .sfx-time { display: block; line-height: 1.3; }
html[data-sfx-theme] .sfx-time { color: var(--sfx-muted); }
html[data-sfx-theme] .sfx-creator,
html[data-sfx-theme] .sfx-tag,
html[data-sfx-theme] .sfx-meta,
html[data-sfx-theme] .sfx-flag {
  flex: none;
  padding: 0 8px;
  border: 1px solid var(--sfx-border);
  border-radius: 999px;
  background: var(--sfx-surface-alt);
  color: var(--sfx-muted);
  font-size: 11px;
  line-height: 18px;
  text-decoration: none;
}
html[data-sfx-theme] .sfx-creator { color: var(--sfx-accent); }
html[data-sfx-theme] .sfx-tag { border-style: dashed; }
html[data-sfx-theme] .sfx-creator:hover { border-color: var(--sfx-accent); }
html[data-sfx-theme] .sfx-type { display: inline-flex; align-items: center; gap: 6px; color: var(--sfx-muted); }
html[data-sfx-theme] .sfx-table td[data-sfx-col="actions"] .btn { padding: 4px 9px; margin-left: 4px; }
html[data-sfx-theme] .sfx-table th .sfx-icon { margin-left: 4px; opacity: 0.55; }
@media (max-width: 1199px) {
  html[data-sfx-theme] .sfx-table [data-sfx-col="hearts"] { display: none; }
}
@media (max-width: 991px) {
  html[data-sfx-theme] .sfx-table [data-sfx-col="last"],
  html[data-sfx-theme] .sfx-table [data-sfx-col="type"] { display: none; }
}
@media (max-width: 767px) {
  html[data-sfx-theme] .sfx-table-wrap { overflow-x: auto; }
  html[data-sfx-theme] .sfx-table [data-sfx-col="added"] { display: none; }
  html[data-sfx-theme] .sfx-table { min-width: 440px; }
}
html[data-sfx-theme] .sfx-folders { display: flex; flex-wrap: wrap; gap: 8px; margin: 12px 0; }
html[data-sfx-theme] .sfx-folder-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border: 1px solid var(--sfx-border);
  border-radius: 999px;
  background: var(--sfx-surface);
  color: var(--sfx-text);
  text-decoration: none;
}
html[data-sfx-theme] .sfx-folder-chip:hover { border-color: var(--sfx-accent); color: var(--sfx-accent); }
html[data-sfx-theme] .sfx-folder-kind { color: var(--sfx-muted); font-size: 11px; text-transform: uppercase; }
`;
  function cellText(td) {
    if (!td) return "";
    return td.dataset.sfxText || td.textContent.trim();
  }
  var ORIGINAL_COLUMNS = ["check", "file", "size", "dls", "hearts", "added", "last", "actions"];
  function cellOf(tr, key) {
    return Array.from(tr.children).find((c) => c.dataset.sfxCol === key);
  }
  function prepareColumns(table) {
    if (table.querySelector('[data-sfx-col="type"]')) return;
    const doc = table.ownerDocument;
    table.querySelectorAll("thead tr, tbody tr").forEach((tr) => {
      const isHead = Boolean(tr.closest("thead"));
      if (!isHead && !tr.querySelector(FILE_BOX)) return;
      ORIGINAL_COLUMNS.forEach((key, i) => {
        if (tr.children[i]) tr.children[i].dataset.sfxCol = key;
      });
      const file = cellOf(tr, "file");
      if (!file) return;
      const type = doc.createElement(isHead ? "th" : "td");
      type.dataset.sfxCol = "type";
      if (isHead) type.textContent = "Type";
      file.after(type);
      const creators = doc.createElement(isHead ? "th" : "td");
      creators.dataset.sfxCol = "creators";
      if (isHead) creators.textContent = "Creators";
      type.after(creators);
    });
  }
  function collectRows(doc) {
    const first = doc.querySelector(FILE_BOX);
    const table = first && first.closest("table");
    if (!table) return [];
    prepareColumns(table);
    return Array.from(table.querySelectorAll("tbody tr")).map((tr) => {
      const cb = tr.querySelector(FILE_BOX);
      if (!cb) return null;
      const fileCell = cellOf(tr, "file");
      const nameEl = fileCell.querySelector(".sfx-filename") || fileCell.querySelector("a") || fileCell;
      const name = nameEl.textContent.trim();
      const ext = extOf(name);
      const info = parseName(name);
      const bytes = parseSize(cellText(cellOf(tr, "size")));
      const found = creatorsForFile(name, bytes);
      const creators = found.creators;
      return {
        tr,
        cb,
        id: cb.value,
        name,
        ext,
        type: typeOf(ext).id,
        title: info.title,
        creator: creators.length > 0 ? creators.map((c) => c.name).join(", ") : null,
        creators,
        creatorIds: creators.map((c) => c.id),
        mod: found.mod,
        info,
        bytes,
        downloads: parseInt(cellText(cellOf(tr, "dls")), 10) || 0,
        hearts: parseInt(cellText(cellOf(tr, "hearts")), 10) || 0,
        added: parseDate(cellText(cellOf(tr, "added"))),
        lastDownload: parseDate(cellText(cellOf(tr, "last")))
      };
    }).filter(Boolean);
  }
  function isVisibleRow(row) {
    return !row.tr.hidden;
  }
  function getSelected(rows) {
    return rows.filter((r) => r.cb.checked);
  }
  function setAllVisible(rows, checked) {
    rows.forEach((r) => {
      if (isVisibleRow(r)) r.cb.checked = checked;
    });
  }
  function refreshSelectionState(ctx) {
    const visible = ctx.rows.filter(isVisibleRow);
    const visibleChecked = visible.filter((r) => r.cb.checked).length;
    ctx.headerCb.checked = visible.length > 0 && visibleChecked === visible.length;
    ctx.headerCb.indeterminate = visibleChecked > 0 && visibleChecked < visible.length;
    ctx.rows.forEach((r) => r.tr.classList.toggle("sfx-selected", r.cb.checked));
    ctx.doc.dispatchEvent(
      new ctx.win.CustomEvent("sfx:selection", { detail: { count: getSelected(ctx.rows).length } })
    );
  }
  function clearSelection(ctx) {
    ctx.rows.forEach((r) => {
      r.cb.checked = false;
    });
    ctx.lastRow = null;
    refreshSelectionState(ctx);
  }
  function clearRestoredSelection(ctx) {
    ctx.rows.forEach((r) => {
      if (r.cb.checked && !r.cb.defaultChecked) r.cb.checked = false;
    });
    ctx.lastRow = null;
    refreshSelectionState(ctx);
  }
  function moveFolderRowsToChips(doc, tbody, wrap) {
    const chips = [];
    Array.from(tbody.querySelectorAll("tr")).forEach((tr) => {
      const link = tr.querySelector("a");
      if (tr.querySelector(FILE_BOX) || !link) return;
      const strong = tr.querySelector("strong");
      const chip = doc.createElement("a");
      chip.className = "sfx-folder-chip";
      chip.setAttribute("href", link.getAttribute("href"));
      const kind = doc.createElement("span");
      kind.className = "sfx-folder-kind";
      kind.textContent = (strong ? strong.textContent : "Folder").replace(/:\s*$/, "");
      chip.append(icon(doc, "folder"), kind, " " + link.textContent.trim());
      chips.push(chip);
      tr.remove();
    });
    if (chips.length === 0) return;
    const bar = doc.createElement("div");
    bar.className = "sfx-folders";
    bar.append(...chips);
    wrap.parentNode.insertBefore(bar, wrap);
  }
  function renderFileRow(doc, row) {
    const info = row.info;
    const fileCell = cellOf(row.tr, "file");
    const type = typeOf(row.ext);
    const link = fileCell.querySelector("a") || h(doc, "a", { href: `/filedetails/${row.id}/` });
    link.className = "sfx-file-title";
    link.textContent = info.title;
    link.title = row.name;
    const line = h(doc, "div", { class: "sfx-file-line" }, link);
    if (info.tag && row.creators.length === 0) {
      line.append(h(doc, "span", { class: "sfx-tag", title: "Tag from the filename, not a verified creator" }, info.tag));
    }
    if (info.version) line.append(h(doc, "span", { class: "sfx-meta" }, `v${info.version}`));
    info.flags.forEach((flag) => line.append(h(doc, "span", { class: "sfx-flag" }, flag)));
    const main2 = h(doc, "div", { class: "sfx-file-main" }, line, h(doc, "span", { class: "sfx-filename" }, row.name));
    if (info.packs.length > 0) {
      const names = info.packs.map((code) => PACK_CODES[code] ? `${PACK_CODES[code]} (${code})` : code);
      main2.append(h(doc, "span", { class: "sfx-packs" }, `May require: ${names.join(", ")}`));
    }
    fileCell.textContent = "";
    fileCell.append(h(doc, "div", { class: "sfx-file" }, h(doc, "span", { class: "sfx-file-icon" }, icon(doc, type.icon)), main2));
    const creatorCell = cellOf(row.tr, "creators");
    row.creators.forEach((creator) => {
      const chip = h(doc, "button", {
        type: "button",
        class: "sfx-creator",
        "data-creator": creator.id,
        title: `Official links: ${creator.name}`
      }, creator.name);
      chip.addEventListener("click", (e) => {
        e.stopPropagation();
        openCreatorPopup(doc, creator);
      });
      creatorCell.append(chip);
    });
    ["added", "last"].forEach((key) => splitDate(doc, cellOf(row.tr, key)));
    cellOf(row.tr, "type").append(h(doc, "span", { class: "sfx-type", "data-type": type.id }, icon(doc, type.icon), type.label));
  }
  function splitDate(doc, td) {
    if (!td) return;
    const text = td.textContent.trim();
    const cut = text.lastIndexOf(",");
    td.title = text;
    td.dataset.sfxText = text;
    if (cut < 0) return;
    td.textContent = "";
    td.append(h(doc, "span", { class: "sfx-date" }, text.slice(0, cut)), h(doc, "span", { class: "sfx-time" }, text.slice(cut + 1).trim()));
  }
  function iconizeActions(doc, tr) {
    const cell = cellOf(tr, "actions");
    if (!cell) return;
    cell.querySelectorAll("a").forEach((a) => {
      const copy = a.querySelector(".glyphicon-link") || (a.getAttribute("onclick") || "").startsWith("copyURL");
      const download = (a.getAttribute("href") || "").startsWith("/download/");
      if (!copy && !download) return;
      a.textContent = "";
      a.append(icon(doc, copy ? "link" : "download"));
      const label = copy ? "Copy link" : "Download";
      a.setAttribute("aria-label", label);
      a.title = label;
    });
  }
  function measureNavbar(doc) {
    const nav = doc.querySelector(".navbar-fixed-top, .navbar");
    const height = nav ? nav.offsetHeight : 0;
    if (height) doc.documentElement.style.setProperty("--sfx-nav-height", `${height}px`);
  }
  function enhanceFileTable(doc, win) {
    const first = doc.querySelector(FILE_BOX);
    const table = first && first.closest("table");
    const tbody = first && first.closest("tbody");
    if (!table || !tbody) return null;
    const wrap = table.closest(".table-responsive") || table;
    table.classList.add("sfx-table");
    wrap.classList.add("sfx-table-wrap");
    moveFolderRowsToChips(doc, tbody, wrap);
    measureNavbar(doc);
    const headerCb = doc.createElement("input");
    headerCb.type = "checkbox";
    headerCb.id = "sfx-select-all";
    headerCb.title = "Select or clear all visible files";
    headerCb.setAttribute("aria-label", "Select or clear all visible files");
    const headerCell = table.querySelector("thead th");
    if (headerCell) {
      headerCell.textContent = "";
      headerCell.appendChild(headerCb);
    }
    const rows = collectRows(doc);
    rows.forEach((row) => {
      renderFileRow(doc, row);
      iconizeActions(doc, row.tr);
    });
    const ctx = {
      doc,
      win,
      table,
      tbody,
      wrap,
      rows,
      headerCb,
      lastRow: null,
      touched: false,
      activeTypes: /* @__PURE__ */ new Set(),
      sort: null,
      ui: null
    };
    headerCb.addEventListener("change", () => {
      ctx.touched = true;
      setAllVisible(ctx.rows, headerCb.checked);
      refreshSelectionState(ctx);
    });
    tbody.addEventListener("click", (e) => {
      const row = ctx.rows.find((r) => r.tr === e.target.closest("tr"));
      if (!row) return;
      const onBox = e.target === row.cb;
      if (!onBox && e.target.closest("a, button, input, label, .btn")) return;
      ctx.touched = true;
      const next = onBox ? row.cb.checked : !row.cb.checked;
      row.cb.checked = next;
      if (e.shiftKey && ctx.lastRow) {
        const visible = ctx.rows.filter(isVisibleRow);
        const from = visible.indexOf(ctx.lastRow);
        const to = visible.indexOf(row);
        if (from >= 0 && to >= 0) rangeIndices(from, to).forEach((i) => visible[i].cb.checked = next);
      }
      ctx.lastRow = row;
      refreshSelectionState(ctx);
    });
    win.addEventListener("load", () => {
      if (!ctx.touched) clearRestoredSelection(ctx);
    });
    win.addEventListener("pageshow", (e) => {
      if (e.persisted || !ctx.touched) clearRestoredSelection(ctx);
    });
    buildToolbar(ctx);
    setupSorting(ctx);
    buildActionBar(ctx);
    clearRestoredSelection(ctx);
    return ctx;
  }

  // src/pagehead.js
  var PAGEHEAD_CSS = `
html[data-sfx-theme] .row[hidden] { display: none !important; }
html[data-sfx-theme] .sfx-pagehead {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px 16px;
  margin: 18px 0 12px;
  padding: 14px 18px;
  background: var(--sfx-surface);
  border: 1px solid var(--sfx-border);
  border-radius: var(--sfx-radius);
  box-shadow: var(--sfx-shadow);
}
html[data-sfx-theme] .sfx-pagehead h3 { flex: 1 1 auto; margin: 0; font-size: 20px; }
html[data-sfx-theme] .sfx-pagehead form { display: flex; gap: 8px; margin: 0; }
html[data-sfx-theme] .sfx-pagehead input[type="text"] { width: 220px; height: 34px; padding: 4px 12px; }
html[data-sfx-theme] .sfx-pagehead .btn { float: none; margin: 0; }
html[data-sfx-theme] .sfx-segmented {
  display: inline-flex;
  margin: 12px 0 0;
  overflow: hidden;
  background: var(--sfx-surface);
  border: 1px solid var(--sfx-border);
  border-radius: 10px;
}
html[data-sfx-theme] .sfx-segmented .highchart-btn {
  margin: 0;
  padding: 6px 14px;
  background: transparent;
  border: 0;
  border-radius: 0;
}
html[data-sfx-theme] .sfx-segmented .highchart-btn + .highchart-btn { border-left: 1px solid var(--sfx-border); }
html[data-sfx-theme] .sfx-segmented .highchart-btn.btn-success { background: var(--sfx-accent); color: #fff; }
html[data-sfx-theme] #highchart { margin-top: 8px; margin-bottom: 12px; padding: 6px 4px 0; }
html[data-sfx-theme] .highcharts-series rect,
html[data-sfx-theme] .highcharts-series .highcharts-point {
  fill: var(--sfx-accent);
  stroke: none;
  rx: 4px;
}
html[data-sfx-theme] .highcharts-series path.highcharts-graph { stroke: var(--sfx-accent); }
html[data-sfx-theme] .highcharts-grid path,
html[data-sfx-theme] .highcharts-grid .highcharts-grid-line { stroke: var(--sfx-border); stroke-width: 1; }
html[data-sfx-theme] .highcharts-axis-line,
html[data-sfx-theme] .highcharts-tick { stroke: var(--sfx-border); }
html[data-sfx-theme] .highcharts-title { font-size: 14px !important; }
`;
  function buildPageHead(doc) {
    const form = doc.querySelector('form[action="/accounts/search/"]');
    const title = doc.querySelector("h3");
    if (!form || !title || doc.querySelector(".sfx-pagehead")) return null;
    const add = doc.querySelector('a[href^="/folders/addsubfolder/"]');
    const rows = [form.closest(".row"), add && add.closest(".row")];
    const head = h(doc, "div", { class: "sfx-pagehead" });
    title.before(head);
    head.append(title, form);
    const input = form.querySelector('input[name="search"]');
    if (input && !input.getAttribute("placeholder")) input.setAttribute("placeholder", "Search all files");
    if (add) {
      add.classList.remove("pull-right");
      head.append(add);
    }
    rows.forEach((row) => {
      if (row && row.children.length === 0) row.hidden = true;
    });
    return head;
  }
  function groupChartButtons(doc) {
    const buttons = Array.from(doc.querySelectorAll(".highchart-btn"));
    if (buttons.length === 0 || buttons[0].parentElement.classList.contains("sfx-segmented")) return;
    const group = h(doc, "div", { class: "sfx-segmented", role: "group" });
    buttons[0].before(group);
    buttons.forEach((b) => group.append(b));
  }

  // src/components.js
  var CHEVRON_MASK = `url("data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`;
  var COMPONENTS_CSS = `
html[data-sfx-theme] .text-muted, html[data-sfx-theme] small { color: var(--sfx-muted); }
html[data-sfx-theme] .panel {
  background: var(--sfx-surface);
  border: 1px solid var(--sfx-border);
  border-radius: var(--sfx-radius);
  box-shadow: var(--sfx-shadow);
  color: var(--sfx-text);
}
html[data-sfx-theme] .panel-group .panel { margin-bottom: 10px; }
html[data-sfx-theme] .panel-heading,
html[data-sfx-theme] .panel-info > .panel-heading {
  background: var(--sfx-surface-alt);
  border-color: var(--sfx-border);
  border-radius: var(--sfx-radius);
  color: var(--sfx-text);
}
html[data-sfx-theme] .panel-title a {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: var(--sfx-text);
  text-decoration: none;
}
html[data-sfx-theme] .panel-title a::after {
  content: "";
  flex: none;
  width: 18px;
  height: 18px;
  background-color: var(--sfx-muted);
  -webkit-mask: ${CHEVRON_MASK} center / contain no-repeat;
  mask: ${CHEVRON_MASK} center / contain no-repeat;
  transition: transform 0.2s;
}
html[data-sfx-theme] .panel-title a[aria-expanded="true"]::after { transform: rotate(180deg); }
html[data-sfx-theme] .panel-body { border-top: 1px solid var(--sfx-border); color: var(--sfx-text); line-height: 1.6; }
html[data-sfx-theme] .well {
  background: var(--sfx-surface-alt);
  border: 1px solid var(--sfx-border);
  border-radius: var(--sfx-radius);
  box-shadow: none;
  color: var(--sfx-text);
}
html[data-sfx-theme] .list-group-item { background: var(--sfx-surface); border-color: var(--sfx-border); color: var(--sfx-text); }
html[data-sfx-theme] a.list-group-item:hover { background: var(--sfx-hover); }
html[data-sfx-theme] .table-hover > tbody > tr:hover > td { background: var(--sfx-hover); }
html[data-sfx-theme] .dropdown-menu { background: var(--sfx-surface); border: 1px solid var(--sfx-border); box-shadow: var(--sfx-shadow); }
html[data-sfx-theme] .dropdown-menu > li > a { color: var(--sfx-text); }
html[data-sfx-theme] .dropdown-menu > li > a:hover { background: var(--sfx-hover); }
html[data-sfx-theme] .modal-content { background: var(--sfx-surface); border: 1px solid var(--sfx-border); border-radius: var(--sfx-radius); color: var(--sfx-text); }
html[data-sfx-theme] .modal-header, html[data-sfx-theme] .modal-footer { border-color: var(--sfx-border); }
html[data-sfx-theme] .nav-tabs { border-color: var(--sfx-border); }
html[data-sfx-theme] .nav-tabs > li > a { color: var(--sfx-muted); border-radius: 8px 8px 0 0; }
html[data-sfx-theme] .nav-tabs > li.active > a,
html[data-sfx-theme] .nav-tabs > li.active > a:hover { background: var(--sfx-surface); border-color: var(--sfx-border); color: var(--sfx-text); }
html[data-sfx-theme] .label { border-radius: 999px; }
html[data-sfx-theme] .badge { background: var(--sfx-accent); }
html[data-sfx-theme] .breadcrumb { background: var(--sfx-surface-alt); border-radius: var(--sfx-radius); }
html[data-sfx-theme] .pagination > li > a,
html[data-sfx-theme] .pagination > li > span { background: var(--sfx-surface); border-color: var(--sfx-border); color: var(--sfx-text); }
html[data-sfx-theme] .pagination > .active > a { background: var(--sfx-accent); border-color: var(--sfx-accent); color: #fff; }
html[data-sfx-theme] .help-block { color: var(--sfx-muted); }
html[data-sfx-theme] .alert-success { background: color-mix(in srgb, var(--sfx-success) 14%, var(--sfx-surface)); border-color: var(--sfx-success); color: var(--sfx-text); }
html[data-sfx-theme] .alert-danger { background: color-mix(in srgb, var(--sfx-danger) 14%, var(--sfx-surface)); border-color: var(--sfx-danger); color: var(--sfx-text); }
html[data-sfx-theme] .alert-info { background: color-mix(in srgb, var(--sfx-accent) 14%, var(--sfx-surface)); border-color: var(--sfx-accent); color: var(--sfx-text); }
html[data-sfx-theme] .alert-warning { background: color-mix(in srgb, #f0ad4e 16%, var(--sfx-surface)); border-color: #f0ad4e; color: var(--sfx-text); }
html[data-sfx-theme] pre, html[data-sfx-theme] code { background: var(--sfx-surface-alt); border: 1px solid var(--sfx-border); color: var(--sfx-text); }
html[data-sfx-theme] blockquote { border-left: 3px solid var(--sfx-accent); color: var(--sfx-muted); }
html[data-sfx-theme] details { padding: 8px 14px; background: var(--sfx-surface); border: 1px solid var(--sfx-border); border-radius: var(--sfx-radius); }
html[data-sfx-theme] summary { cursor: pointer; color: var(--sfx-text); }
html[data-sfx-theme] label, html[data-sfx-theme] legend { color: var(--sfx-text); }
html[data-sfx-theme] .btn-info { background: var(--sfx-accent); border-color: var(--sfx-accent); color: #fff; }
html[data-sfx-theme] .btn-info:hover { background: var(--sfx-accent-strong); border-color: var(--sfx-accent-strong); }
html[data-sfx-theme] .text-primary, html[data-sfx-theme] .text-info { color: var(--sfx-accent); }
html[data-sfx-theme] .text-success { color: var(--sfx-success); }
html[data-sfx-theme] .text-danger { color: var(--sfx-danger); }
html[data-sfx-theme] input[type="email"],
html[data-sfx-theme] input[type="url"],
html[data-sfx-theme] input[type="tel"] {
  min-width: 260px;
  padding: 6px 12px;
  background: var(--sfx-surface);
  border: 1px solid var(--sfx-border);
  border-radius: 8px;
  color: var(--sfx-text);
}
html[data-sfx-theme] .table > tbody > tr > th { border-color: var(--sfx-border); color: var(--sfx-text); vertical-align: middle; }
html[data-sfx-theme] .table-condensed:not(.sfx-table) > tbody > tr > th,
html[data-sfx-theme] .table-condensed:not(.sfx-table) > tbody > tr > td { padding: 10px 12px; }
html[data-sfx-theme] ol > li > code { display: inline-block; padding: 4px 10px; margin: 3px 0; border-radius: 8px; }
html[data-sfx-theme] code a { color: var(--sfx-accent); text-decoration: none; word-break: break-all; }
html[data-sfx-theme] code a:hover { text-decoration: underline; }
`;

  // src/dom.js
  function onReady(doc, fn) {
    if (doc.readyState === "loading") doc.addEventListener("DOMContentLoaded", fn, { once: true });
    else fn();
  }

  // src/loading.js
  var LOADING_CSS = `
html:not([data-sfx-ready]) body { visibility: hidden; }
#sfx-loading {
  position: fixed;
  inset: 0;
  z-index: 2147483647;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14px;
  background: var(--sfx-bg, #f4f6f9);
  color: var(--sfx-text, #1f2937);
  font: 14px system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  visibility: visible;
}
#sfx-loading svg { width: 44px; height: 44px; animation: sfx-spin 0.9s linear infinite; }
@keyframes sfx-spin { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) {
  #sfx-loading svg { animation: none; }
}
`;
  var LOADING_MARKUP = '<svg viewBox="0 0 24 24" fill="none" stroke="#07a4dc" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9" stroke-opacity="0.2"></circle><path d="M21 12a9 9 0 0 0-9-9"></path></svg><span>Loading</span>';
  function showLoading(doc) {
    if (doc.getElementById("sfx-loading")) return;
    const overlay = doc.createElement("div");
    overlay.id = "sfx-loading";
    overlay.setAttribute("role", "status");
    overlay.innerHTML = LOADING_MARKUP;
    doc.documentElement.appendChild(overlay);
  }
  function markReady(doc) {
    doc.documentElement.setAttribute("data-sfx-ready", "true");
    const overlay = doc.getElementById("sfx-loading");
    if (overlay) overlay.remove();
  }

  // src/index.js
  function main(win, doc, gm, opts = {}) {
    const failsafe = win.setTimeout(() => markReady(doc), opts.failsafeMs === void 0 ? 3e4 : opts.failsafeMs);
    let theme;
    try {
      gm.addStyle(THEME_CSS);
      gm.addStyle(TABLE_CSS);
      gm.addStyle(TOOLBAR_CSS);
      gm.addStyle(ACTIONBAR_CSS);
      gm.addStyle(LOADING_CSS);
      gm.addStyle(ICON_CSS);
      gm.addStyle(PAGEHEAD_CSS);
      gm.addStyle(COMPONENTS_CSS);
      gm.addStyle(POPUP_CSS);
      applyCachedData(gm);
      theme = initTheme(win, doc, gm);
      showLoading(doc);
    } catch (error) {
      win.console.error("Sim File Share Enhancer: setup failed", error);
      win.clearTimeout(failsafe);
      markReady(doc);
      return;
    }
    onReady(doc, () => {
      try {
        mountThemeToggle(doc, theme);
        enhanceFileTable(doc, win);
        buildPageHead(doc);
        groupChartButtons(doc);
      } catch (error) {
        win.console.error("Sim File Share Enhancer: enhancement failed", error);
      } finally {
        win.clearTimeout(failsafe);
        markReady(doc);
      }
      refreshData(win, gm);
    });
  }
  return __toCommonJS(index_exports);
})();
if (typeof module !== 'undefined' && module.exports) {
  module.exports = __sfx;
} else {
  __sfx.main(window, document, { addStyle: GM_addStyle, getValue: GM_getValue, setValue: GM_setValue, xhr: GM_xmlhttpRequest });
}
