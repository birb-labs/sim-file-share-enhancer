import { THEME_CSS, initTheme, mountThemeToggle, resolveTheme } from './theme.js';
import { TABLE_CSS, enhanceFileTable, collectRows, getSelected, refreshSelectionState, setAllVisible } from './table.js';
import { TOOLBAR_CSS } from './toolbar.js';
import { ACTIONBAR_CSS, formatLinks } from './actionbar.js';
import { PAGEHEAD_CSS, buildPageHead, groupChartButtons } from './pagehead.js';
import { COMPONENTS_CSS } from './components.js';
import { onReady } from './dom.js';
import { ICON_CSS, ICON_NAMES, icon } from './icons.js';
import { LOADING_CSS, showLoading, markReady } from './loading.js';
import { compareRows, extOf, matchesFilters, matchesQuery, parseDate, parseSize, rangeIndices } from './logic.js';
import { CREATORS, PACK_CODES, matchCreator } from './creators.js';
import { parseName, typeOf } from './parse-name.js';

function main(win, doc, gm, opts = {}) {
  const failsafe = win.setTimeout(() => markReady(doc), opts.failsafeMs === undefined ? 3000 : opts.failsafeMs);
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
    theme = initTheme(win, doc, gm);
    showLoading(doc);
  } catch (error) {
    win.console.error('Sim File Share Enhancer: setup failed', error);
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
      win.console.error('Sim File Share Enhancer: enhancement failed', error);
    } finally {
      win.clearTimeout(failsafe);
      markReady(doc);
    }
  });
}

export {
  parseSize, parseDate, extOf, matchesQuery, matchesFilters, compareRows, rangeIndices, buildPageHead, CREATORS, PACK_CODES, matchCreator, parseName, typeOf, ICON_NAMES, icon, resolveTheme, formatLinks, collectRows, getSelected, setAllVisible, refreshSelectionState, enhanceFileTable, main,
};
