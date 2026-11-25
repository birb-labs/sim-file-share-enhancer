import { h } from './toolbar.js';

export const PAGEHEAD_CSS = `
html[data-sfx-theme] .row[hidden] { display: none !important; }
html[data-sfx-theme] .sfx-pagehead {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px 16px;
  margin: 18px 0 12px;
  padding: 14px 18px;
  background: var(--sfx-surface);
  border: 1px solid var(--sfx-border);
  border-radius: var(--sfx-radius);
  box-shadow: var(--sfx-shadow);
}
html[data-sfx-theme] .sfx-pagehead h3 { flex: 1 1 auto; margin: 0; font-size: 20px; }
html[data-sfx-theme] .sfx-pagehead form { display: flex; gap: 8px; margin: 0; }
html[data-sfx-theme] .sfx-pagehead input[type="text"] { width: 220px; height: 34px; padding: 4px 12px; }
html[data-sfx-theme] .sfx-pagehead .btn { float: none; margin: 0; }
html[data-sfx-theme] .sfx-segmented {
  display: inline-flex;
  margin: 12px 0 0;
  overflow: hidden;
  background: var(--sfx-surface);
  border: 1px solid var(--sfx-border);
  border-radius: 10px;
}
html[data-sfx-theme] .sfx-segmented .highchart-btn {
  margin: 0;
  padding: 6px 14px;
  background: transparent;
  border: 0;
  border-radius: 0;
}
html[data-sfx-theme] .sfx-segmented .highchart-btn + .highchart-btn { border-left: 1px solid var(--sfx-border); }
html[data-sfx-theme] .sfx-segmented .highchart-btn.btn-success { background: var(--sfx-accent); color: #fff; }
html[data-sfx-theme] #highchart { margin-top: 8px; margin-bottom: 12px; padding: 6px 4px 0; }
html[data-sfx-theme] .highcharts-series rect,
html[data-sfx-theme] .highcharts-series .highcharts-point {
  fill: var(--sfx-accent);
  stroke: none;
  rx: 4px;
}
html[data-sfx-theme] .highcharts-series path.highcharts-graph { stroke: var(--sfx-accent); }
html[data-sfx-theme] .highcharts-grid path,
html[data-sfx-theme] .highcharts-grid .highcharts-grid-line { stroke: var(--sfx-border); stroke-width: 1; }
html[data-sfx-theme] .highcharts-axis-line,
html[data-sfx-theme] .highcharts-tick { stroke: var(--sfx-border); }
html[data-sfx-theme] .highcharts-title { font-size: 14px !important; }
`;

export function buildPageHead(doc) {
  const form = doc.querySelector('form[action="/accounts/search/"]');
  const title = doc.querySelector('h3');
  if (!form || !title || doc.querySelector('.sfx-pagehead')) return null;
  const add = doc.querySelector('a[href^="/folders/addsubfolder/"]');
  const rows = [form.closest('.row'), add && add.closest('.row')];
  const head = h(doc, 'div', { class: 'sfx-pagehead' });
  title.before(head);
  head.append(title, form);
  const input = form.querySelector('input[name="search"]');
  if (input && !input.getAttribute('placeholder')) input.setAttribute('placeholder', 'Search all files');
  if (add) {
    add.classList.remove('pull-right');
    head.append(add);
  }
  rows.forEach((row) => {
    if (row && row.children.length === 0) row.hidden = true;
  });
  return head;
}

export function groupChartButtons(doc) {
  const buttons = Array.from(doc.querySelectorAll('.highchart-btn'));
  if (buttons.length === 0 || buttons[0].parentElement.classList.contains('sfx-segmented')) return;
  const group = h(doc, 'div', { class: 'sfx-segmented', role: 'group' });
  buttons[0].before(group);
  buttons.forEach((b) => group.append(b));
}
