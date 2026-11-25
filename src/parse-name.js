import { extOf } from './logic.js';
import { CREATORS, PACK_CODES, stripOrderMarkers, matchCreator } from './creators.js';
import { icon } from './icons.js';

export const FLAG_PHRASES = ['required if pack owned', 'optional', 'required', 'needed'];
export const FLAG_TOKENS = { OPTIONAL: 'optional', NEEDED: 'needed', REQUIRED: 'required' };
export const PACK_TOKEN = /^(?:EP|GP|SP)\d{2}$/i;

export const FILE_TYPES = {
  package: { id: 'package', label: 'Package', icon: 'package' },
  ts4script: { id: 'script', label: 'Script', icon: 'script' },
  log: { id: 'log', label: 'Log', icon: 'log' },
  cfg: { id: 'config', label: 'Config', icon: 'config' },
};
export const OTHER_TYPE = { id: 'other', label: 'Other', icon: 'file' };

export function typeOf(ext) {
  return FILE_TYPES[ext] || OTHER_TYPE;
}

export function parseName(name) {
  const ext = extOf(name);
  const base = ext === '(none)' ? name : name.slice(0, name.lastIndexOf('.'));
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
    return ' ';
  });
  rest = rest.replace(/(^|[_\s])(OPTIONAL|NEEDED|REQUIRED)(?=$|[_\s])/g, (whole, lead, token) => {
    flags.push(FLAG_TOKENS[token]);
    return lead;
  });
  rest = rest.replace(/(^|[\s_])-mod-(?=$|[\s_])/gi, '$1');

  let version = null;
  rest = rest.replace(/(^|[\s_-])([vV])(\d+(?:\.\d+)*)(?=$|[\s_-])/, (whole, lead, letter, number) => {
    if (letter === 'V' && !number.includes('.')) return whole;
    version = number;
    return lead;
  });

  const packs = [];
  rest.split(/[\s_\-()[\].,]+/).forEach((token) => {
    const code = token.toUpperCase();
    if ((PACK_TOKEN.test(token) || PACK_CODES[code] !== undefined) && !packs.includes(code)) packs.push(code);
  });

  const title = rest
    .replace(/_/g, ' ')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .replace(/\s+/g, ' ')
    .replace(/^[\s_-]+|[\s_-]+$/g, '');

  return { creator, tag, title: title || name, version, flags, packs, loadOrder };
}
