export const CHEVRON_MASK = "url(\"data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E\")";

export const COMPONENTS_CSS = `
html[data-sfx-theme] .text-muted, html[data-sfx-theme] small { color: var(--sfx-muted); }
html[data-sfx-theme] .panel {
  background: var(--sfx-surface);
  border: 1px solid var(--sfx-border);
  border-radius: var(--sfx-radius);
  box-shadow: var(--sfx-shadow);
  color: var(--sfx-text);
}
html[data-sfx-theme] .panel-group .panel { margin-bottom: 10px; }
html[data-sfx-theme] .panel-heading,
html[data-sfx-theme] .panel-info > .panel-heading {
  background: var(--sfx-surface-alt);
  border-color: var(--sfx-border);
  border-radius: var(--sfx-radius);
  color: var(--sfx-text);
}
html[data-sfx-theme] .panel-title a {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: var(--sfx-text);
  text-decoration: none;
}
html[data-sfx-theme] .panel-title a::after {
  content: "";
  flex: none;
  width: 18px;
  height: 18px;
  background-color: var(--sfx-muted);
  -webkit-mask: ${CHEVRON_MASK} center / contain no-repeat;
  mask: ${CHEVRON_MASK} center / contain no-repeat;
  transition: transform 0.2s;
}
html[data-sfx-theme] .panel-title a[aria-expanded="true"]::after { transform: rotate(180deg); }
html[data-sfx-theme] .panel-body { border-top: 1px solid var(--sfx-border); color: var(--sfx-text); line-height: 1.6; }
html[data-sfx-theme] .well {
  background: var(--sfx-surface-alt);
  border: 1px solid var(--sfx-border);
  border-radius: var(--sfx-radius);
  box-shadow: none;
  color: var(--sfx-text);
}
html[data-sfx-theme] .list-group-item { background: var(--sfx-surface); border-color: var(--sfx-border); color: var(--sfx-text); }
html[data-sfx-theme] a.list-group-item:hover { background: var(--sfx-hover); }
html[data-sfx-theme] .table-hover > tbody > tr:hover > td { background: var(--sfx-hover); }
html[data-sfx-theme] .dropdown-menu { background: var(--sfx-surface); border: 1px solid var(--sfx-border); box-shadow: var(--sfx-shadow); }
html[data-sfx-theme] .dropdown-menu > li > a { color: var(--sfx-text); }
html[data-sfx-theme] .dropdown-menu > li > a:hover { background: var(--sfx-hover); }
html[data-sfx-theme] .modal-content { background: var(--sfx-surface); border: 1px solid var(--sfx-border); border-radius: var(--sfx-radius); color: var(--sfx-text); }
html[data-sfx-theme] .modal-header, html[data-sfx-theme] .modal-footer { border-color: var(--sfx-border); }
html[data-sfx-theme] .nav-tabs { border-color: var(--sfx-border); }
html[data-sfx-theme] .nav-tabs > li > a { color: var(--sfx-muted); border-radius: 8px 8px 0 0; }
html[data-sfx-theme] .nav-tabs > li.active > a,
html[data-sfx-theme] .nav-tabs > li.active > a:hover { background: var(--sfx-surface); border-color: var(--sfx-border); color: var(--sfx-text); }
html[data-sfx-theme] .label { border-radius: 999px; }
html[data-sfx-theme] .badge { background: var(--sfx-accent); }
html[data-sfx-theme] .breadcrumb { background: var(--sfx-surface-alt); border-radius: var(--sfx-radius); }
html[data-sfx-theme] .pagination > li > a,
html[data-sfx-theme] .pagination > li > span { background: var(--sfx-surface); border-color: var(--sfx-border); color: var(--sfx-text); }
html[data-sfx-theme] .pagination > .active > a { background: var(--sfx-accent); border-color: var(--sfx-accent); color: #fff; }
html[data-sfx-theme] .help-block { color: var(--sfx-muted); }
html[data-sfx-theme] .alert-success { background: color-mix(in srgb, var(--sfx-success) 14%, var(--sfx-surface)); border-color: var(--sfx-success); color: var(--sfx-text); }
html[data-sfx-theme] .alert-danger { background: color-mix(in srgb, var(--sfx-danger) 14%, var(--sfx-surface)); border-color: var(--sfx-danger); color: var(--sfx-text); }
html[data-sfx-theme] .alert-info { background: color-mix(in srgb, var(--sfx-accent) 14%, var(--sfx-surface)); border-color: var(--sfx-accent); color: var(--sfx-text); }
html[data-sfx-theme] .alert-warning { background: color-mix(in srgb, #f0ad4e 16%, var(--sfx-surface)); border-color: #f0ad4e; color: var(--sfx-text); }
html[data-sfx-theme] pre, html[data-sfx-theme] code { background: var(--sfx-surface-alt); border: 1px solid var(--sfx-border); color: var(--sfx-text); }
html[data-sfx-theme] blockquote { border-left: 3px solid var(--sfx-accent); color: var(--sfx-muted); }
html[data-sfx-theme] details { padding: 8px 14px; background: var(--sfx-surface); border: 1px solid var(--sfx-border); border-radius: var(--sfx-radius); }
html[data-sfx-theme] summary { cursor: pointer; color: var(--sfx-text); }
html[data-sfx-theme] label, html[data-sfx-theme] legend { color: var(--sfx-text); }
html[data-sfx-theme] .btn-info { background: var(--sfx-accent); border-color: var(--sfx-accent); color: #fff; }
html[data-sfx-theme] .btn-info:hover { background: var(--sfx-accent-strong); border-color: var(--sfx-accent-strong); }
html[data-sfx-theme] .text-primary, html[data-sfx-theme] .text-info { color: var(--sfx-accent); }
html[data-sfx-theme] .text-success { color: var(--sfx-success); }
html[data-sfx-theme] .text-danger { color: var(--sfx-danger); }
html[data-sfx-theme] input[type="email"],
html[data-sfx-theme] input[type="url"],
html[data-sfx-theme] input[type="tel"] {
  min-width: 260px;
  padding: 6px 12px;
  background: var(--sfx-surface);
  border: 1px solid var(--sfx-border);
  border-radius: 8px;
  color: var(--sfx-text);
}
html[data-sfx-theme] .table > tbody > tr > th { border-color: var(--sfx-border); color: var(--sfx-text); vertical-align: middle; }
html[data-sfx-theme] .table-condensed:not(.sfx-table) > tbody > tr > th,
html[data-sfx-theme] .table-condensed:not(.sfx-table) > tbody > tr > td { padding: 10px 12px; }
html[data-sfx-theme] ol > li > code { display: inline-block; padding: 4px 10px; margin: 3px 0; border-radius: 8px; }
html[data-sfx-theme] code a { color: var(--sfx-accent); text-decoration: none; word-break: break-all; }
html[data-sfx-theme] code a:hover { text-decoration: underline; }
`;
