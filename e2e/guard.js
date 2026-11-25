const SITE_HOSTS = new Set(['simfileshare.net', 'www.simfileshare.net']);
const LOGIN_PATH = '/accounts/login/';

function shouldAbort(method, url) {
  const verb = method.toUpperCase();
  if (verb === 'GET' || verb === 'HEAD' || verb === 'OPTIONS') return false;
  const target = new URL(url);
  return !(verb === 'POST' && SITE_HOSTS.has(target.hostname) && target.pathname === LOGIN_PATH);
}

module.exports = { shouldAbort };
