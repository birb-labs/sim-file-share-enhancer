
import seed from '../data/creators.json';

export const LINK_TYPES = ['patreon', 'tumblr', 'site', 'itch', 'kofi', 'musthavemods', 'other'];

function hydrate(entry) {
  const links = Array.isArray(entry.links) && entry.links.length > 0
    ? entry.links
    : entry.url ? [{ type: 'site', url: entry.url }] : [];
  return {
    ...entry,
    url: entry.url || (links[0] && links[0].url),
    links,
    patterns: (entry.patterns || []).map((p) => (p instanceof RegExp ? p : new RegExp(p.source, p.flags))),
  };
}

export const CREATORS = seed.map(hydrate);

export function registerCreators(list) {
  if (!Array.isArray(list) || list.length === 0) return;
  CREATORS.splice(0, CREATORS.length, ...list.filter((c) => c && c.id && c.name).map(hydrate));
}

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

export function matchCreators(filename) {
  const base = stripOrderMarkers(filename);
  return CREATORS.filter((c) => c.patterns.some((p) => p.test(base)));
}

export function matchCreator(filename) {
  const hit = matchCreators(filename)[0];
  return hit ? { id: hit.id, name: hit.name, url: hit.url } : null;
}
