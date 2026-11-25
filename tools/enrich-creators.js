const fs = require('node:fs');
const path = require('node:path');

const FILE = path.join(__dirname, '..', 'data', 'creators.json');
const UA = 'Mozilla/5.0 (compatible; sfx-data-tool)';
const BLOB = /https:\/\/[a-z0-9]+\.public\.blob\.vercel-storage\.com\/mods\/[^"'\s<>\\]+\.(?:jpg|jpeg|png|webp)/i;

function classify(url) {
  let u;
  try { u = new URL(url); } catch { return null; }
  const host = u.hostname.replace(/^www\./, '');
  const parts = u.pathname.split('/').filter(Boolean);
  if (host === 'patreon.com') {
    const handle = parts[0] === 'cw' ? parts[1] : parts[0];
    if (!handle || ['posts', 'c', 'user', 'home', 'join'].includes(handle) || parts.length > (parts[0] === 'cw' ? 2 : 1)) return null;
    return { type: 'patreon', url: `https://www.patreon.com/${parts[0] === 'cw' ? 'cw/' : ''}${handle}` };
  }
  if (host.endsWith('.tumblr.com') && host !== 'www.tumblr.com' && !/^(assets|static|\d+)\./.test(host)) {
    return { type: 'tumblr', url: `https://${host}/` };
  }
  if (host === 'ko-fi.com' && parts.length === 1) return { type: 'kofi', url: `https://ko-fi.com/${parts[0]}` };
  if (host.endsWith('.itch.io') && parts.length === 0) return { type: 'itch', url: `https://${host}` };
  return null;
}

async function page(url) {
  const res = await fetch(url, { headers: { 'user-agent': UA }, redirect: 'follow' });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.text();
}

function relatedLinks(html, creator) {
  const handles = new Set(creator.links.map((l) => l.url.toLowerCase()));
  const found = new Map();
  for (const raw of html.match(/https?:\/\/[^"'\s<>\\]+/g) || []) {
    const hit = classify(raw);
    if (hit && !found.has(hit.url.toLowerCase())) found.set(hit.url.toLowerCase(), hit);
  }
  const slug = creator.id.replace(/[^a-z0-9]/g, '');
  return Array.from(found.values()).filter((l) => {
    if (handles.has(l.url.toLowerCase())) return false;
    return l.url.toLowerCase().replace(/[^a-z0-9]/g, '').includes(slug) || slug.includes(l.url.split(/[/.]/).filter(Boolean).pop().toLowerCase());
  });
}

async function main() {
  const write = process.argv.includes('--write');
  const creators = JSON.parse(fs.readFileSync(FILE, 'utf8'));
  for (const c of creators) {
    const src = [c.source, ...c.links.map((l) => l.url)].find((u) => /musthavemods\.com\/(creator|mods)\//.test(u));
    if (!src) continue;
    try {
      const html = await page(src);
      const add = relatedLinks(html, c);
      add.forEach((l) => c.links.push(l));
      const img = BLOB.exec(html);
      if (img && !c.image) c.image = img[0];
      console.log(`${c.id}: +${add.length} links${img ? ', image' : ''}`, add.map((l) => `${l.type}:${l.url}`).join(' '));
    } catch (error) {
      console.log(`${c.id}: ${error.message}`);
    }
  }
  if (write) fs.writeFileSync(FILE, JSON.stringify(creators, null, 2) + '\n');
}

main();
