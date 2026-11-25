const fs = require('node:fs');
const path = require('node:path');
const { firefox } = require('playwright');
const { shouldAbort } = require('./guard.js');
const { loadCredentials, redact } = require('./credentials.js');

const ROOT = path.join(__dirname, '..', '..');
const SCRIPT = fs.readFileSync(path.join(__dirname, '..', 'simfileshare-enhancer.user.js'), 'utf8');
const SHOTS = path.join(ROOT, '.agent_files', 'e2e-shots');
const BASE = 'https://simfileshare.net';

const SHIM = `
window.GM_addStyle = (css) => { const el = document.createElement('style'); el.textContent = css; (document.head || document.documentElement).appendChild(el); return el; };
window.GM_getValue = (key, fallback) => { const v = localStorage.getItem('gm:' + key); return v === null ? fallback : JSON.parse(v); };
window.GM_setValue = (key, value) => localStorage.setItem('gm:' + key, JSON.stringify(value));
`;

const PAGES = [
  { name: 'home', path: '/' },
  { name: 'profile', path: '/accounts/profile/', fileList: true },
  { name: 'folder', path: '/folders/edit/280190/' },
  { name: 'folders', path: '/accounts/folders/' },
  { name: 'editinfo', path: '/accounts/editinfo/', outline: true, blur: 'input[type="email"]' },
  { name: 'invitecodes', path: '/accounts/invitecodes/', outline: true, blur: 'ol code' },
  { name: 'support', path: '/support/' },
  { name: 'faq', path: '/support/faq/', faq: true },
];

const SITE_HOSTS = new Set(['simfileshare.net', 'www.simfileshare.net']);
const thirdParty = { aborted: 0 };
const results = [];
function report(ok, page, label, detail = '') {
  results.push(ok);
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${page}: ${label}${ok || !detail ? '' : ` (${detail})`}`);
}

const OUTLINE = () => {
  const lines = [];
  const walk = (el, depth) => {
    if (depth > 9) return;
    const tag = el.tagName.toLowerCase();
    const id = el.id ? `#${el.id}` : '';
    const cls = el.className && typeof el.className === 'string' ? `.${el.className.trim().split(/\s+/).join('.')}` : '';
    let text = '';
    if (el.children.length === 0 && !['td', 'code', 'pre', 'input', 'textarea', 'script', 'style'].includes(tag)) {
      const raw = (el.textContent || '').trim().replace(/\s+/g, ' ');
      text = /[A-Za-z0-9]{16,}/.test(raw) ? ' "<redacted>"' : raw ? ` "${raw.slice(0, 70)}"` : '';
    }
    const attrs = ['type', 'name', 'href'].map((a) => {
      const v = el.getAttribute(a);
      if (!v) return '';
      return ` ${a}=${/[A-Za-z0-9]{16,}/.test(v) ? '<redacted>' : v.slice(0, 40)}`;
    }).join('');
    lines.push(`${'  '.repeat(depth)}${tag}${id}${cls}${attrs}${text}`);
    Array.from(el.children).forEach((child) => walk(child, depth + 1));
  };
  walk(document.body, 0);
  return lines.join('\n');
};

async function newContext(browser, scheme, blocked) {
  const context = await browser.newContext({ viewport: { width: 1366, height: 900 }, colorScheme: scheme });
  await context.addInitScript(`${SHIM}\n${SCRIPT}`);
  await context.route('**/*', (route) => {
    const request = route.request();
    if (shouldAbort(request.method(), request.url())) {
      const target = new URL(request.url());
      if (SITE_HOSTS.has(target.hostname)) blocked.push(`${request.method()} ${target.pathname}`);
      else thirdParty.aborted++;
      return route.abort();
    }
    return route.continue();
  });
  return context;
}

async function login(context, creds) {
  const page = await context.newPage();
  await page.goto(`${BASE}/accounts/login/`, { waitUntil: 'domcontentloaded' });
  await page.fill('#id_username', creds.user);
  await page.fill('#id_password', creds.pass);
  await Promise.all([
    page.waitForURL('**/accounts/profile/**', { timeout: 30000 }),
    page.click('input[type="submit"]'),
  ]);
  return page;
}

async function visit(page, spec, scheme, blocked, shots) {
  const errors = [];
  const onError = (e) => console.log(`info ${spec.name}[${scheme}]: page error from the site, not the script (${String(e.message || e).slice(0, 80)})`);
  const onConsole = (m) => {
    if (m.type() === 'error' && /Sim File Share Enhancer/.test(m.text())) errors.push(m.text());
  };
  page.on('pageerror', onError);
  page.on('console', onConsole);
  const started = Date.now();
  await page.goto(`${BASE}${spec.path}`, { waitUntil: 'domcontentloaded' });
  const label = `${spec.name}[${scheme}]`;
  try {
    await page.waitForFunction(() => document.documentElement.hasAttribute('data-sfx-ready'), null, { timeout: 15000 });
    report(true, label, `ready after ${Date.now() - started} ms`);
  } catch {
    report(false, label, 'page never became ready');
  }
  await page.waitForTimeout(400);
  report(await page.evaluate(() => !document.getElementById('sfx-loading')), label, 'loading overlay removed');
  report(await page.evaluate(() => Boolean(document.documentElement.dataset.sfxTheme)), label, 'theme applied');
  if (spec.blur) await page.addStyleTag({ content: `${spec.blur} { filter: blur(9px) !important; }` });
  await page.screenshot({ path: path.join(shots, `${spec.name}-${scheme}.png`) });
  if (spec.outline && scheme === 'dark') {
    fs.writeFileSync(path.join(shots, `${spec.name}.outline.txt`), await page.evaluate(OUTLINE));
  }
  if (scheme === 'dark') {
    if (spec.fileList) await checkFileList(page, label, blocked);
    if (spec.faq) await checkFaq(page, label);
  }
  page.off('pageerror', onError);
  page.off('console', onConsole);
  report(errors.length === 0, label, 'no script errors', errors.join(' | ').slice(0, 300));
}

async function checkFileList(page, label, blocked) {
  const before = blocked.length;
  const total = await page.evaluate(() => document.querySelectorAll('input[name="selectedfiles"]').length);
  report(total > 0, label, `file list has rows (${total})`);
  report(await page.evaluate(() => Boolean(document.querySelector('#sfx-toolbar'))), label, 'toolbar present');
  report(await page.evaluate(() => Boolean(document.querySelector('th[data-sfx-col="type"]'))), label, 'Type column present');
  report(await page.evaluate(() => document.querySelectorAll('input[name="selectedfiles"]:checked').length === 0), label, 'nothing pre-selected');
  await page.click('#sfx-select-all');
  const all = await page.evaluate(() => ({
    checked: document.querySelectorAll('input[name="selectedfiles"]:checked').length,
    label: document.querySelector('.sfx-selected-count').textContent,
  }));
  report(all.checked === total && all.label === `${total} selected`, label, 'select all checks every visible row', JSON.stringify(all));
  await page.click('#sfx-clear-selection');
  report(await page.evaluate(() => document.querySelectorAll('input[name="selectedfiles"]:checked').length === 0), label, 'clear selection');
  await page.fill('#sfx-search', 'lbb');
  const filtered = await page.evaluate(() => ({
    visible: document.querySelectorAll('tbody tr:not([hidden])').length,
    text: document.querySelector('#sfx-visible-count').textContent,
  }));
  report(/^\d+ of \d+ files$/.test(filtered.text) && filtered.text.startsWith(`${filtered.visible} of`), label, 'filter updates the count', JSON.stringify(filtered));
  await page.fill('#sfx-search', '');
  await page.click('tbody tr:not([hidden]) td[data-sfx-col="type"]');
  let dialog = null;
  page.once('dialog', async (d) => {
    dialog = d.message();
    await d.dismiss();
  });
  await page.click('#sfx-actionbar input[name="deletefiles"]');
  await page.waitForTimeout(300);
  report(Boolean(dialog && dialog.includes('Delete 1 file?')), label, 'Delete asks for confirmation with the count', String(dialog).slice(0, 80));
  report(blocked.length === before, label, 'no write request was attempted', blocked.slice(before).join(','));
}

async function checkFaq(page, label) {
  const color = await page.evaluate(() => getComputedStyle(document.querySelector('.panel-heading')).backgroundColor);
  report(color !== 'rgb(217, 237, 247)', label, 'FAQ heading uses the theme color', color);
  await page.click('.panel-title a');
  await page.waitForTimeout(600);
  report(await page.evaluate(() => Boolean(document.querySelector('.panel-collapse.in .panel-body'))), label, 'FAQ answer expands');
}

let secrets = [];

async function main() {
  const creds = loadCredentials(process.env, path.join(ROOT, '.agent_files', '.env'));
  secrets = [creds.user, creds.pass];
  fs.mkdirSync(SHOTS, { recursive: true });
  const browser = await firefox.launch({ headless: true });
  const blocked = [];
  try {
    for (const scheme of ['dark', 'light']) {
      const context = await newContext(browser, scheme, blocked);
      const page = await login(context, creds);
      report(true, `login[${scheme}]`, 'signed in');
      for (const spec of PAGES) await visit(page, spec, scheme, blocked, SHOTS);
      await context.close();
    }
  } finally {
    await browser.close();
  }
  report(blocked.length === 0, 'guard', 'no write to the site was attempted', blocked.join(','));
  console.log(`info guard: ${thirdParty.aborted} third-party write(s) aborted (analytics beacons)`);
  const failed = results.filter((ok) => !ok).length;
  console.log(`\n${results.length - failed} ok, ${failed} failed`);
  process.exit(failed ? 1 : 0);
}

main().catch((error) => {
  console.error(`e2e aborted: ${redact(error.message, secrets)}`);
  process.exit(2);
});
