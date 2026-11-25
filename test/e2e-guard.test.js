const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { shouldAbort } = require('../e2e/guard.js');
const { loadCredentials, redact } = require('../e2e/credentials.js');

test('only reads and the site login are allowed through', () => {
  assert.equal(shouldAbort('GET', 'https://simfileshare.net/accounts/profile/'), false);
  assert.equal(shouldAbort('HEAD', 'https://simfileshare.net/filedetails/1/'), false);
  assert.equal(shouldAbort('HEAD', 'https://simfileshare.net/download/1/'), true);
  assert.equal(shouldAbort('OPTIONS', 'https://simfileshare.net/'), false);
  assert.equal(shouldAbort('POST', 'https://simfileshare.net/accounts/login/'), false);
  assert.equal(shouldAbort('POST', 'https://www.simfileshare.net/accounts/login/'), false);
});

test('every other write is aborted', () => {
  assert.equal(shouldAbort('POST', 'https://simfileshare.net/accounts/processmultiple/'), true);
  assert.equal(shouldAbort('POST', 'https://simfileshare.net/accounts/search/'), true);
  assert.equal(shouldAbort('POST', 'https://simfileshare.net/upload/'), true);
  assert.equal(shouldAbort('PUT', 'https://simfileshare.net/x/'), true);
  assert.equal(shouldAbort('PATCH', 'https://simfileshare.net/x/'), true);
  assert.equal(shouldAbort('DELETE', 'https://simfileshare.net/x/'), true);
  assert.equal(shouldAbort('post', 'https://simfileshare.net/folders/delete/1/'), true);
});

test('a login-looking path on another host is not allowed', () => {
  assert.equal(shouldAbort('POST', 'https://example.com/accounts/login/'), true);
  assert.equal(shouldAbort('POST', 'https://simfileshare.net.evil.test/accounts/login/'), true);
});

test('credentials come from the environment first', () => {
  const got = loadCredentials({ SFS_USER: 'u1', SFS_PASS: 'p1' }, '/nonexistent/.env');
  assert.deepEqual(got, { user: 'u1', pass: 'p1' });
});

test('credentials fall back to an env file and strip quotes', () => {
  const file = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'sfx-')), '.env');
  fs.writeFileSync(file, '# comment\nSFS_USER=alice\nSFS_PASS="b c"\n');
  assert.deepEqual(loadCredentials({}, file), { user: 'alice', pass: 'b c' });
});

test('missing credentials name the variables but never print values', () => {
  assert.throws(() => loadCredentials({}, '/nonexistent/.env'), /SFS_USER.*SFS_PASS|SFS_PASS.*SFS_USER/);
  try {
    loadCredentials({ SFS_USER: 'secret-user' }, '/nonexistent/.env');
    assert.fail('should throw');
  } catch (error) {
    assert.ok(error.message.includes('SFS_PASS'));
    assert.ok(!error.message.includes('secret-user'));
  }
});

test('downloads are blocked even as GET because they change the stats', () => {
  assert.equal(shouldAbort('GET', 'https://simfileshare.net/download/123/'), true);
  assert.equal(shouldAbort('GET', 'https://www.simfileshare.net/download/9/?x=1'), true);
  assert.equal(shouldAbort('GET', 'https://simfileshare.net/filedetails/123/'), false);
});

test('redact hides secrets everywhere and keeps only the first line', () => {
  assert.equal(redact('fill("hunter2")\n  - waiting for hunter2', ['hunter2']), 'fill("***")');
  assert.equal(redact('no secret here', ['', undefined]), 'no secret here');
});
