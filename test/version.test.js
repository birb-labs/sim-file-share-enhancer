const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('the userscript header and package.json agree on 2.1.0', () => {
  const header = fs.readFileSync(path.join(__dirname, '..', 'simfileshare-enhancer.user.js'), 'utf8');
  const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
  assert.match(header, /@version\s+2\.1\.0\b/);
  assert.equal(pkg.version, '2.1.0');
});
