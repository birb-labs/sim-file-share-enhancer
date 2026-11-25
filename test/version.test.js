const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('the userscript header and package.json agree on the version', () => {
  const header = fs.readFileSync(path.join(__dirname, '..', 'simfileshare-enhancer.user.js'), 'utf8');
  const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
  const declared = /@version\s+(\S+)/.exec(header);
  assert.ok(declared);
  assert.equal(declared[1], pkg.version);
});
