export const THEME_KEY = 'sfx-theme';
export const THEME_ORDER = ['system', 'light', 'dark'];
export const THEME_LABELS = { system: 'Auto', light: 'Light', dark: 'Dark' };

export const THEME_CSS = `
html[data-sfx-theme] {
  --sfx-radius: 10px;
  --sfx-accent: #07a4dc;
  --sfx-accent-strong: #068fc1;
  --sfx-success: #2db463;
  --sfx-danger: #d9534f;
  --sfx-nav-height: 50px;
  color-scheme: light;
}
html[data-sfx-theme="light"] {
  --sfx-bg: #f4f6f9;
  --sfx-surface: #ffffff;
  --sfx-surface-alt: #f8fafc;
  --sfx-text: #1f2937;
  --sfx-muted: #6b7280;
  --sfx-border: #e3e8ef;
  --sfx-hover: #eef8fd;
  --sfx-selected: #dcf1fa;
  --sfx-shadow: 0 1px 3px rgba(15, 23, 42, 0.08);
}
html[data-sfx-theme="dark"] {
  --sfx-bg: #0f1419;
  --sfx-surface: #171d25;
  --sfx-surface-alt: #1c2430;
  --sfx-text: #e5e9ef;
  --sfx-muted: #9aa4b2;
  --sfx-border: #2a3441;
  --sfx-hover: #1d2a37;
  --sfx-selected: #143a4d;
  --sfx-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
  color-scheme: dark;
}
html[data-sfx-theme] body {
  background: var(--sfx-bg);
  color: var(--sfx-text);
  font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}
html[data-sfx-theme] h1, html[data-sfx-theme] h2, html[data-sfx-theme] h3,
html[data-sfx-theme] h4, html[data-sfx-theme] h5, html[data-sfx-theme] h6 {
  color: var(--sfx-text);
  font-family: inherit;
}
html[data-sfx-theme] a { color: var(--sfx-accent); }
html[data-sfx-theme] a:hover { color: var(--sfx-accent-strong); }
html[data-sfx-theme] hr { border-color: var(--sfx-border); }
html[data-sfx-theme] .navbar-default {
  background: var(--sfx-surface);
  border-color: var(--sfx-border);
  box-shadow: var(--sfx-shadow);
}
html[data-sfx-theme] .navbar-default .navbar-brand,
html[data-sfx-theme] .navbar-default .navbar-nav > li > a { color: var(--sfx-text); }
html[data-sfx-theme] .navbar-default .navbar-nav > li > a:hover { color: var(--sfx-accent); }
html[data-sfx-theme] .btn { border-radius: 8px; font-weight: 500; }
html[data-sfx-theme] .btn-default {
  background: var(--sfx-surface);
  border-color: var(--sfx-border);
  color: var(--sfx-text);
}
html[data-sfx-theme] .btn-default:hover { background: var(--sfx-hover); }
html[data-sfx-theme] .btn-primary { background: var(--sfx-accent); border-color: var(--sfx-accent); color: #fff; }
html[data-sfx-theme] .btn-primary:hover { background: var(--sfx-accent-strong); border-color: var(--sfx-accent-strong); }
html[data-sfx-theme] .btn-success { background: var(--sfx-success); border-color: var(--sfx-success); color: #fff; }
html[data-sfx-theme] .btn-danger { background: var(--sfx-danger); border-color: var(--sfx-danger); color: #fff; }
html[data-sfx-theme] .form-control,
html[data-sfx-theme] input[type="text"],
html[data-sfx-theme] input[type="search"],
html[data-sfx-theme] input[type="number"],
html[data-sfx-theme] input[type="password"],
html[data-sfx-theme] input[type="email"],
html[data-sfx-theme] select,
html[data-sfx-theme] textarea {
  background: var(--sfx-surface);
  border: 1px solid var(--sfx-border);
  border-radius: 8px;
  color: var(--sfx-text);
}
html[data-sfx-theme] .alert { border-radius: var(--sfx-radius); }
html[data-sfx-theme] .dropzone {
  background: var(--sfx-surface);
  border: 2px dashed var(--sfx-border);
  border-radius: var(--sfx-radius);
  color: var(--sfx-muted);
}
html[data-sfx-theme] .dropzone:hover { border-color: var(--sfx-accent); }
html[data-sfx-theme] #highchart {
  background: var(--sfx-surface);
  border-radius: var(--sfx-radius);
  box-shadow: var(--sfx-shadow);
}
html[data-sfx-theme] .highcharts-background { fill: var(--sfx-surface); }
html[data-sfx-theme] .highcharts-title,
html[data-sfx-theme] .highcharts-axis-labels text { fill: var(--sfx-muted) !important; }
html[data-sfx-theme] .highchart-btn {
  background: var(--sfx-surface);
  border: 1px solid var(--sfx-border);
  color: var(--sfx-text);
}
html[data-sfx-theme] .highchart-btn.btn-success { background: var(--sfx-accent); border-color: var(--sfx-accent); color: #fff; }
html[data-sfx-theme] #headerwrap { background: linear-gradient(135deg, #07a4dc, #068fc1); }
html[data-sfx-theme] footer, html[data-sfx-theme] footer p { color: var(--sfx-muted); }
html[data-sfx-theme] .table > thead > tr > th,
html[data-sfx-theme] .table > tbody > tr > td {
  border-color: var(--sfx-border);
  color: var(--sfx-text);
}
html[data-sfx-theme] .table { background: var(--sfx-surface); }
html[data-sfx-theme] .table-striped > tbody > tr:nth-of-type(odd) { background: var(--sfx-surface-alt); }
html[data-sfx-theme] .sfx-theme-toggle {
  margin: 11px 0 0 8px;
  padding: 4px 12px;
  border: 1px solid var(--sfx-border);
  border-radius: 999px;
  background: var(--sfx-surface-alt);
  color: var(--sfx-text);
  font-size: 12px;
  cursor: pointer;
}
html[data-sfx-theme] .sfx-theme-toggle:hover { border-color: var(--sfx-accent); }
`;

export function resolveTheme(setting, prefersDark) {
  if (setting === 'light' || setting === 'dark') return setting;
  return prefersDark ? 'dark' : 'light';
}

export function initTheme(win, doc, gm) {
  let setting = gm.getValue(THEME_KEY, 'system');
  if (!THEME_ORDER.includes(setting)) setting = 'system';
  const media = win.matchMedia ? win.matchMedia('(prefers-color-scheme: dark)') : null;
  const apply = () => {
    doc.documentElement.dataset.sfxTheme = resolveTheme(setting, media ? media.matches : false);
  };
  apply();
  if (media) media.addEventListener('change', apply);
  return {
    get setting() {
      return setting;
    },
    cycle() {
      setting = THEME_ORDER[(THEME_ORDER.indexOf(setting) + 1) % THEME_ORDER.length];
      gm.setValue(THEME_KEY, setting);
      apply();
      return setting;
    },
  };
}

export function mountThemeToggle(doc, theme) {
  const nav = doc.querySelector('.navbar-nav.navbar-right');
  if (!nav || doc.getElementById('sfx-theme-toggle')) return;
  const button = doc.createElement('button');
  button.type = 'button';
  button.id = 'sfx-theme-toggle';
  button.className = 'sfx-theme-toggle';
  const label = () => {
    button.textContent = `Theme: ${THEME_LABELS[theme.setting]}`;
  };
  label();
  button.addEventListener('click', () => {
    theme.cycle();
    label();
  });
  const item = doc.createElement('li');
  item.appendChild(button);
  nav.appendChild(item);
}
