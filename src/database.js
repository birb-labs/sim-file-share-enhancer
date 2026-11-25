import { CREATORS, registerCreators, matchCreators } from './creators.js';

export const REPO_RAW = 'https://raw.githubusercontent.com/birb-labs/sim-file-share-enhancer/main/data/';
export const CACHE_KEY = 'sfx-db';
export const CACHE_TTL_MS = 6 * 60 * 60 * 1000;

const modsByName = new Map();

export function registerMods(list) {
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

export function lookupMod(name, bytes) {
  const bucket = modsByName.get(String(name).toLowerCase());
  if (!bucket) return null;
  if (bucket.length === 1 || bytes === null) return bucket[0];
  const sized = bucket.filter((m) => Math.abs(m.size - bytes) <= Math.max(1024, m.size * 0.01));
  return sized[0] || bucket[0];
}

export function creatorsForFile(name, bytes) {
  const mod = lookupMod(name, bytes);
  if (mod && Array.isArray(mod.creators) && mod.creators.length > 0) {
    const known = mod.creators.map((id) => CREATORS.find((c) => c.id === id)).filter(Boolean);
    if (known.length > 0) return { mod, creators: known };
  }
  return { mod, creators: matchCreators(name) };
}

export function applyCachedData(gm) {
  let cached;
  try {
    cached = JSON.parse(gm.getValue(CACHE_KEY, 'null'));
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
        method: 'GET',
        url,
        onload: (res) => (res.status >= 200 && res.status < 300 ? resolve(res.responseText) : reject(new Error(String(res.status)))),
        onerror: () => reject(new Error('network')),
        ontimeout: () => reject(new Error('timeout')),
      });
    });
  }
  return win.fetch(url).then((res) => {
    if (!res.ok) throw new Error(String(res.status));
    return res.text();
  });
}

export function refreshData(win, gm, now = Date.now()) {
  let cached = null;
  try {
    cached = JSON.parse(gm.getValue(CACHE_KEY, 'null'));
  } catch {
    cached = null;
  }
  if (cached && now - cached.at < CACHE_TTL_MS) return Promise.resolve(false);
  return Promise.resolve()
    .then(() => Promise.all([
      fetchText(win, gm, `${REPO_RAW}creators.json`),
      fetchText(win, gm, `${REPO_RAW}mods.json`),
    ]))
    .then(([creators, mods]) => {
      gm.setValue(CACHE_KEY, JSON.stringify({ at: now, creators: JSON.parse(creators), mods: JSON.parse(mods) }));
      return true;
    })
    .catch(() => false);
}
