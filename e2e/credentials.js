const fs = require('node:fs');

function readEnvFile(file) {
  if (!file || !fs.existsSync(file)) return {};
  const out = {};
  fs.readFileSync(file, 'utf8')
    .split('\n')
    .forEach((line) => {
      const m = /^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*?)\s*$/.exec(line);
      if (!m || line.trim().startsWith('#')) return;
      out[m[1]] = m[2].replace(/^(["'])(.*)\1$/, '$2');
    });
  return out;
}

function loadCredentials(env = process.env, envFile) {
  const fromFile = readEnvFile(envFile);
  const user = env.SFS_USER || fromFile.SFS_USER;
  const pass = env.SFS_PASS || fromFile.SFS_PASS;
  const missing = [!user && 'SFS_USER', !pass && 'SFS_PASS'].filter(Boolean);
  if (missing.length > 0) {
    throw new Error(`Missing ${missing.join(' and ')} (set in the environment or in .agent_files/.env)`);
  }
  return { user, pass };
}

module.exports = { loadCredentials };
