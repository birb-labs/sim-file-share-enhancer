import { matchCreators } from './creators.js';
import { typeOf } from './parse-name.js';

const MD5 = /^[0-9a-f]{32}$/i;

export function parseHead(headers) {
  const tag = (headers.get('etag') || '').replace(/^W\//, '').replace(/"/g, '');
  const size = parseInt(headers.get('content-length'), 10);
  return {
    md5: MD5.test(tag) ? tag.toLowerCase() : null,
    etag: tag && !MD5.test(tag) ? tag : null,
    size: Number.isNaN(size) ? null : size,
  };
}

export function buildEntry(row, head) {
  const entry = {
    md5: head.md5,
    name: row.name,
    size: head.size,
    creators: matchCreators(row.name).map((c) => c.id),
    category: null,
    tags: [],
    image: null,
    type: typeOf(row.ext).id,
  };
  if (!head.md5) entry.etag = head.etag;
  return entry;
}

export async function collectHashes(win, rows, onProgress, concurrency = 4) {
  const entries = [];
  const skipped = [];
  let next = 0;
  let done = 0;
  async function worker() {
    while (next < rows.length) {
      const row = rows[next++];
      try {
        const res = await win.fetch(`/download/${row.id}/`, { method: 'HEAD', credentials: 'same-origin' });
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

export function downloadJson(win, doc, data, filename) {
  const url = win.URL.createObjectURL(new win.Blob([JSON.stringify(data, null, 2) + '\n'], { type: 'application/json' }));
  const a = doc.createElement('a');
  a.href = url;
  a.download = filename;
  doc.body.appendChild(a);
  a.click();
  a.remove();
  win.setTimeout(() => win.URL.revokeObjectURL(url), 1000);
}
