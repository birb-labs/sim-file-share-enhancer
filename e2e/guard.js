const SITE_HOSTS = new Set(['simfileshare.net', 'www.simfileshare.net']);
const LOGIN_PATH = '/accounts/login/';

function shouldAbort(method, url) {
  const verb = method.toUpperCase();
  const target = new URL(url);
  if (SITE_HOSTS.has(target.hostname) && target.pathname.startsWith('/download/')) return true;
  if (verb === 'GET' || verb === 'HEAD' || verb === 'OPTIONS') return false;
  return !(verb === 'POST' && SITE_HOSTS.has(target.hostname) && target.pathname === LOGIN_PATH);
}

module.exports = { shouldAbort };
