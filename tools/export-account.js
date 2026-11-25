const fs = require('node:fs');
const { firefox } = require('playwright');
const { matchCreators, parseHead, typeOf, extOf } = require('../simfileshare-enhancer.user.js');

const BASE = 'https://simfileshare.net';
const out = process.argv[2];
const resume = process.argv[3];
const workers = Number(process.env.SFS_WORKERS || 4);
const user = process.env.SFS_USER;
const pass = process.env.SFS_PASS;

async function headOf(id) {
  for (let attempt = 0; attempt < 4; attempt++) {
    const res = await fetch(`${BASE}/download/${id}/`, { method: 'HEAD', redirect: 'manual', headers: { 'user-agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:130.0) Gecko/20100101 Firefox/130.0' }, signal: AbortSignal.timeout(30000) });
    const head = res.ok ? parseHead(res.headers) : { md5: null, etag: null, size: null };
    if (head.md5 || head.etag) return head;
    await new Promise((resolve) => setTimeout(resolve, 1500 * (attempt + 1)));
  }
  return { md5: null, etag: null, size: null };
}

async function main() {
  if (!out || !user || !pass) throw new Error('usage: SFS_USER=... SFS_PASS=... node tools/export-account.js <output.json>');
  const browser = await firefox.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(`${BASE}/accounts/login/`);
  await page.fill('#id_username', user);
  await page.fill('#id_password', pass);
  await Promise.all([page.waitForURL('**/accounts/profile/**'), page.click('input[type="submit"]')]);
  const done = new Set(resume && fs.existsSync(resume) ? JSON.parse(fs.readFileSync(resume, 'utf8')).map((e) => e.name) : []);
  const listed = await page.$$eval('input[name="selectedfiles"]', (boxes) =>
    boxes.map((box) => {
      const link = box.closest('tr').querySelector('a[href^="/filedetails/"]');
      return { id: box.value, name: link ? link.textContent.trim() : '' };
    }));
  const files = listed.filter((f) => !done.has(f.name));
  console.log(`${listed.length} files listed, ${files.length} to read`);
  await browser.close();

  const entries = resume && fs.existsSync(resume) ? JSON.parse(fs.readFileSync(resume, 'utf8')) : [];
  const skipped = [];
  let next = 0;
  async function worker() {
    while (next < files.length) {
      const file = files[next++];
      try {
        const head = await headOf(file.id);
        if (head.md5 || head.etag) {
          const entry = {
            md5: head.md5, name: file.name, size: head.size, creators: matchCreators(file.name).map((c) => c.id),
            category: null, tags: [], image: null, type: typeOf(extOf(file.name)).id,
          };
          if (!head.md5) entry.etag = head.etag;
          entries.push(entry);
        } else skipped.push(file.name);
      } catch {
        skipped.push(file.name);
      }
      if ((entries.length + skipped.length) % 250 === 0) console.log(`${entries.length + skipped.length}/${files.length}`);
    }
  }
  await Promise.all(Array.from({ length: workers }, worker));
  entries.sort((a, b) => a.name.localeCompare(b.name));
  fs.writeFileSync(out, JSON.stringify(entries, null, 2) + '\n');
  console.log(`${entries.length} entries, ${skipped.length} skipped`);
  fs.writeFileSync(out.replace(/\.json$/, '.skipped.json'), JSON.stringify(skipped, null, 2) + '\n');
}

main().catch((error) => {
  console.error(String(error.message).split('\n')[0]);
  process.exit(1);
});
