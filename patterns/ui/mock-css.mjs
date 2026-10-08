/**
 * The component classes a mock composes, named after the shared UI component each
 * stands in for. Every mock renders inside its own iframe with this sheet, so a
 * width preset is a real viewport and media queries apply.
 */
export const MOCK_CSS = /* css */ `
* { box-sizing: border-box; }
html { scroll-behavior: smooth; scrollbar-gutter: stable; }
body {
  margin: 0;
  background: var(--background);
  color: var(--foreground);
  font-family: var(--font-sans);
  font-size: 14px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}
h1, h2, h3, h4 { margin: 0; font-weight: 600; letter-spacing: -0.01em; }
p { margin: 0; }
a { color: inherit; }
button { font: inherit; color: inherit; }
:focus-visible { outline: 2px solid var(--ring); outline-offset: 2px; border-radius: 3px; }
::selection { background: var(--muted); }

html { scrollbar-gutter: auto; scroll-behavior: auto; }
body { background: var(--background); }
.mock-canvas { padding: 20px; max-width: 1180px; margin: 0 auto; position: relative; }
body.fit-full .mock-canvas { max-width: none; }
/* ---- the mock vocabulary ----
   Named after the shared UI component each stands in for. A mock composes these
   and nothing else, which is the same rule a route file lives under. */

/* The sidebar inside a mock is narrower than the real one. It has to signal the
   frame, not be readable, and every pixel it takes comes out of the table the
   mock is actually about. */
.shell { display: grid; grid-template-columns: 128px minmax(0, 1fr); min-height: 100%; }
.shell > nav {
  background: var(--sidebar); border-right: 1px solid var(--sidebar-border);
  padding: 10px 8px; display: flex; flex-direction: column; gap: 1px;
}
.shell > nav .brand { padding: 4px 6px 10px; font-size: 12.5px; }
.shell > nav a {
  display: flex; align-items: center; gap: 7px; text-decoration: none;
  padding: 5px 7px; border-radius: 6px; font-size: 12.5px; color: var(--sidebar-foreground);
}
.shell > nav a:hover { background: var(--sidebar-accent); }
.shell > nav a[aria-current="page"] { background: var(--sidebar-accent); font-weight: 600; }
.shell > nav a .chev { margin-left: auto; opacity: 0.5; font-size: 10px; }
.shell > nav a.sub { padding-left: 20px; color: var(--muted-foreground); }
.shell > nav a.sub[aria-current="page"] { color: var(--foreground); }
.shell > nav .grow { flex: 1; }
.shell > nav .who {
  display: flex; align-items: center; gap: 7px; padding: 7px 6px 2px;
  border-top: 1px solid var(--sidebar-border); margin-top: 8px; font-size: 11.5px;
}
.shell > .main { min-width: 0; display: flex; flex-direction: column; }
.shell > .main > .bar {
  display: flex; align-items: center; gap: 10px;
  padding: 8px 14px; border-bottom: 1px solid var(--border);
  font-size: 12.5px; font-weight: 600;
}
.shell > .main > .bar .icons { margin-left: auto; display: flex; gap: 10px; color: var(--muted-foreground); font-size: 12px; }
.shell > .main > .page { padding: 16px; }

/* A breadcrumb trail. */
.trail { display: flex; align-items: center; gap: 6px; font-size: 11.5px; color: var(--muted-foreground); margin-bottom: 7px; flex-wrap: wrap; }
.trail a { text-decoration: none; }
.trail a:hover { text-decoration: underline; }
.trail .sep { opacity: 0.55; }

/* A page heading with its actions. The floorplan's header. */
.phead { display: flex; align-items: flex-start; gap: 14px; margin-bottom: 14px; flex-wrap: wrap; }
.phead h1 { font-size: 20px; line-height: 1.25; }
.phead .desc { color: var(--muted-foreground); font-size: 12.5px; margin-top: 3px; max-width: 66ch; }
.phead .acts { margin-left: auto; display: flex; gap: 7px; align-items: center; flex-wrap: wrap; }
.phead .acts.below { margin-left: 0; width: 100%; }

/* A Section: the only box in the dashboard. */
.section { border: 1px solid var(--border); border-radius: var(--radius); background: var(--card); }
.section > h3 {
  font-size: 13px; padding: 11px 14px 0; display: flex; align-items: center; gap: 8px;
}
.section > h3 .acts { margin-left: auto; display: flex; gap: 6px; align-items: center; }
.section > .sdesc { padding: 2px 14px 0; color: var(--muted-foreground); font-size: 12px; max-width: 78ch; }
.section > .body { padding: 12px 14px; }
/* A flush body always holds a table. A table wider than its box scrolls rather
   than being clipped, because a clipped column is a column nobody can read. */
.section > .body.flush { padding: 0; overflow-x: auto; }
.section > .foot {
  padding: 10px 14px; border-top: 1px solid var(--border);
  display: flex; gap: 8px; align-items: center;
}
.section > .foot .right { margin-left: auto; display: flex; gap: 8px; }
.section.split > .cols { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); }
.section > .cols { display: grid; gap: 0; }

/* Buttons. */
.btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  height: 32px; padding: 0 12px; border-radius: var(--radius-sm);
  border: 1px solid var(--border); background: var(--background); color: var(--foreground);
  font-size: 12.5px; font-weight: 500; cursor: pointer; white-space: nowrap; text-decoration: none;
}
.btn:hover { background: var(--muted); }
.btn.primary { background: var(--primary); color: var(--primary-foreground); border-color: var(--primary); }
.btn.primary:hover { opacity: 0.9; }
.btn.danger { background: var(--destructive); color: var(--destructive-foreground); border-color: var(--destructive); }
.btn.ghost { border-color: transparent; background: transparent; }
.btn.ghost:hover { background: var(--muted); }
.btn.subtle-danger {
  border-color: transparent; background: var(--destructive-surface); color: var(--destructive-surface-foreground);
}
.btn.sm { height: 26px; padding: 0 9px; font-size: 11.5px; }
.btn.xs { height: 22px; padding: 0 7px; font-size: 11px; }
.btn.icon { width: 32px; padding: 0; }
.btn.icon.sm { width: 26px; }
.btn.block { width: 100%; }
.btn[disabled], .btn[aria-disabled="true"] { opacity: 0.45; cursor: not-allowed; }
.btn.danger[disabled] { opacity: 0.55; }
.btn:focus-visible { outline: 2px solid var(--ring); outline-offset: 1px; }
.btnrow { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
.btnrow.end { justify-content: flex-end; }
.btnrow.between { justify-content: space-between; }

/* A button that is unavailable with its reason in visible text. */
.explained { display: flex; flex-direction: column; gap: 3px; align-items: flex-start; }
.explained .why { font-size: 11.5px; color: var(--muted-foreground); max-width: 40ch; }

/* A button split into its first action and a menu. */
.btn-split { display: inline-flex; border-radius: var(--radius-sm); overflow: hidden; border: 1px solid var(--border); }
.btn-split > button {
  height: 32px; border: 0; background: var(--background); cursor: pointer; font-size: 12.5px;
  padding: 0 11px; display: inline-flex; align-items: center; gap: 6px;
}
.btn-split > button + button { border-left: 1px solid var(--border); padding: 0 8px; color: var(--muted-foreground); }
.btn-split > button:hover { background: var(--muted); }
.btn-split.primary { border-color: var(--primary); }
.btn-split.primary > button:first-child { background: var(--primary); color: var(--primary-foreground); }
.btn-split.primary > button + button { background: var(--primary); color: var(--primary-foreground); }

/* Data table. */
.dt { width: 100%; border-collapse: collapse; font-size: 12.5px; }
.dt th {
  text-align: left; font-weight: 500; color: var(--muted-foreground);
  font-size: 11.5px; padding: 8px 10px; border-bottom: 1px solid var(--border);
  white-space: nowrap; background: var(--card);
}
.dt th.sortable { cursor: pointer; }
.dt th.sortable:hover { color: var(--foreground); }
.dt th .dir { opacity: 0.6; margin-left: 3px; font-size: 9px; }
.dt th.num, .dt td.num { text-align: right; font-variant-numeric: tabular-nums; }
.dt td { padding: 8px 10px; border-bottom: 1px solid var(--border); vertical-align: top; }
.dt tbody tr:last-child td { border-bottom: 0; }
.dt tbody tr:hover { background: var(--muted); }
.dt tbody tr.is-sel { background: var(--muted); }
.dt .sticky-head th { position: sticky; top: 0; z-index: 2; }
.dt .dense td, .dt .dense th { padding-top: 5px; padding-bottom: 5px; }
.dt .roomy td, .dt .roomy th { padding-top: 13px; padding-bottom: 13px; }
.dt .check { width: 34px; }
.dt caption { caption-side: top; text-align: left; padding: 10px 10px 0; font-size: 12.5px; font-weight: 600; }

/* Two lines in one cell: the thing, then a quieter line. */
.lines b { font-weight: 500; display: block; }
.lines small { display: block; color: var(--muted-foreground); font-size: 11.5px; }

/* A code a person reads aloud. */
.code {
  font-family: var(--font-mono); font-size: 12px; font-weight: 500;
  text-decoration: underline; text-underline-offset: 2px;
}
.copyable { display: inline-flex; align-items: center; gap: 5px; }
.copyable button {
  border: 0; background: transparent; cursor: pointer; color: var(--muted-foreground);
  padding: 0; font-size: 11px; line-height: 1;
}
.copyable button:hover { color: var(--foreground); }

/* Status: the word is the signal, the tone repeats it. */
.badge {
  display: inline-flex; align-items: center; gap: 5px;
  height: 21px; padding: 0 8px; border-radius: 999px;
  font-size: 11px; font-weight: 500; white-space: nowrap;
  border: 1px solid var(--border); background: var(--muted); color: var(--muted-foreground);
}
.badge.positive { background: var(--positive-surface); color: var(--positive-surface-foreground); border-color: transparent; }
.badge.caution { background: var(--caution-surface); color: var(--caution-surface-foreground); border-color: transparent; }
.badge.destructive { background: var(--destructive-surface); color: var(--destructive-surface-foreground); border-color: transparent; }
.badge.info { background: var(--info-surface); color: var(--info-surface-foreground); border-color: transparent; }
.badge .dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; flex: none; }
.badge.outline { background: transparent; }
.badge.sq { border-radius: 4px; }

.pill {
  display: inline-flex; align-items: center; gap: 5px; height: 22px; padding: 0 9px;
  border-radius: 999px; border: 1px dashed var(--input); font-size: 11.5px; color: var(--muted-foreground);
}
.pill button { border: 0; background: transparent; cursor: pointer; padding: 0; font-size: 12px; line-height: 1; color: inherit; }

/* Facts: labelled values as a description list. */
.facts { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px 20px; margin: 0; }
.facts.stacked { grid-template-columns: 1fr; gap: 9px; container-type: inline-size; }
.facts > div { min-width: 0; }
.facts dt { font-size: 11.5px; color: var(--muted-foreground); margin-bottom: 1px; }
.facts dd { margin: 0; font-size: 13px; overflow-wrap: anywhere; }
.facts.stacked > div { display: grid; grid-template-columns: minmax(90px, 150px) minmax(0, 1fr); gap: 12px; align-items: baseline; }
/* Too narrow for a label column: the label sits above its value. */
@container (max-width: 300px) { .facts.stacked > div { grid-template-columns: minmax(0, 1fr); gap: 1px; } }
.facts.stacked dt { margin: 0; }
.facts.row { grid-template-columns: auto minmax(0, 1fr); gap: 6px 14px; }

/* A label and its figure on one row. */
.split { display: flex; align-items: baseline; gap: 12px; }
.split .fig { margin-left: auto; font-variant-numeric: tabular-nums; white-space: nowrap; }
.split .sub { display: block; color: var(--muted-foreground); font-size: 11.5px; }

/* Stat tile. */
.tiles { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px; }
.tile { border: 1px solid var(--border); border-radius: var(--radius); background: var(--card); padding: 13px 15px; }
.tile .lab { font-size: 12px; color: var(--muted-foreground); }
.tile .fig { font-size: 27px; font-weight: 600; letter-spacing: -0.02em; margin: 3px 0 2px; line-height: 1.1; }
.tile .fig.sm { font-size: 20px; }
.tile .sub { font-size: 11.5px; color: var(--muted-foreground); }
.tile .delta { font-size: 11.5px; font-weight: 500; display: inline-flex; align-items: center; gap: 3px; }
.tile .delta.up { color: var(--positive-surface-foreground); }
.tile .delta.down { color: var(--destructive-surface-foreground); }

/* Toolbar above a table. */
.toolbar { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; margin-bottom: 10px; }
.toolbar .right { margin-left: auto; display: flex; gap: 8px; align-items: center; }

.search { position: relative; display: flex; align-items: center; }
.search input {
  height: 32px; padding: 0 10px 0 30px; width: 240px;
  border: 1px solid var(--input); border-radius: var(--radius-sm);
  background: var(--background); color: var(--foreground); font-size: 12.5px;
}
.search .ico { position: absolute; left: 9px; color: var(--muted-foreground); font-size: 12px; }

.fsel {
  height: 32px; padding: 0 26px 0 9px; font-size: 12.5px;
  border: 1px solid var(--input); border-radius: var(--radius-sm);
  background: var(--background) no-repeat right 8px center; color: var(--foreground);
  appearance: none;
  background-image: linear-gradient(45deg, transparent 50%, var(--muted-foreground) 50%), linear-gradient(135deg, var(--muted-foreground) 50%, transparent 50%);
  background-size: 5px 5px, 5px 5px; background-position: right 12px center, right 7px center;
}

.segmented {
  display: inline-flex; padding: 2px; gap: 2px;
  background: var(--muted); border-radius: var(--radius-sm);
}
.segmented button {
  height: 26px; padding: 0 10px; border: 0; border-radius: calc(var(--radius-sm) - 2px);
  background: transparent; font-size: 12px; cursor: pointer; color: var(--muted-foreground);
  display: inline-flex; align-items: center; gap: 5px;
}
.segmented button[aria-pressed="true"] { background: var(--background); color: var(--foreground); font-weight: 500; box-shadow: 0 1px 2px var(--scroll-shade); }

/* Pagination. */
.pager { display: flex; align-items: center; gap: 10px; padding: 9px 12px; font-size: 12px; color: var(--muted-foreground); }
.pager .right { margin-left: auto; display: flex; align-items: center; gap: 6px; }
.pager .nums { display: flex; gap: 3px; }
.pager .nums button {
  min-width: 26px; height: 26px; border: 1px solid transparent; background: transparent;
  border-radius: var(--radius-sm); cursor: pointer; font-size: 12px; color: var(--foreground);
}
.pager .nums button[aria-current="page"] { background: var(--muted); font-weight: 600; }
.pager .nums button:hover { background: var(--muted); }

/* Feedback: a status is a fact, an alert is a command result. */
.alert {
  display: flex; gap: 10px; align-items: flex-start;
  padding: 10px 12px; border-radius: var(--radius-sm);
  font-size: 12.5px; border: 1px solid var(--border);
}
.alert .ico { flex: none; font-size: 13px; line-height: 1.35; }
.alert .txt { min-width: 0; }
.alert .txt b { display: block; font-weight: 600; }
.alert .txt small { display: block; color: inherit; opacity: 0.85; font-size: 11.5px; margin-top: 1px; }
.alert .tail { margin-left: auto; display: flex; gap: 6px; align-items: center; flex: none; }
.alert.positive { background: var(--positive-surface); color: var(--positive-surface-foreground); border-color: transparent; }
.alert.caution { background: var(--caution-surface); color: var(--caution-surface-foreground); border-color: transparent; }
.alert.destructive { background: var(--destructive-surface); color: var(--destructive-surface-foreground); border-color: transparent; }
.alert.info { background: var(--info-surface); color: var(--info-surface-foreground); border-color: transparent; }
.alert.plain { background: var(--muted); color: var(--foreground); }
.alert.solid-pos { background: var(--positive); color: var(--background); border-color: transparent; }
.alert.solid-neg { background: var(--destructive); color: var(--destructive-foreground); border-color: transparent; }
.alert .linkish { text-decoration: underline; text-underline-offset: 2px; }

.note { font-size: 12.5px; color: var(--muted-foreground); max-width: 80ch; }
.note.tight { font-size: 11.5px; }

/* A toast at the edge of the screen. */
.toast {
  display: flex; align-items: flex-start; gap: 9px;
  background: var(--popover); color: var(--popover-foreground);
  border: 1px solid var(--border); border-radius: var(--radius);
  box-shadow: 0 8px 24px var(--scroll-shade); padding: 10px 12px; font-size: 12.5px;
  min-width: 240px;
}
.toast .tail { margin-left: auto; display: flex; gap: 8px; align-items: center; }
.toast .undo { font-weight: 600; text-decoration: underline; text-underline-offset: 2px; }

/* Empty, loading and error states. */
.empty { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 30px 20px; text-align: center; }
.empty .ico { font-size: 19px; color: var(--muted-foreground); }
.empty b { font-size: 13px; font-weight: 600; }
.empty p { font-size: 12px; color: var(--muted-foreground); max-width: 46ch; }
.empty .btnrow { margin-top: 6px; }
.empty.side { align-items: flex-start; text-align: left; padding: 18px 0; }

.skel { background: var(--muted); border-radius: 4px; height: 10px; }
.skel.title { height: 18px; width: 42%; }
.skel.line { margin-bottom: 7px; }
.skel.row { height: 34px; margin-bottom: 6px; border-radius: var(--radius-sm); }

.spinner {
  width: 14px; height: 14px; border-radius: 50%; flex: none;
  border: 2px solid var(--input); border-top-color: var(--foreground);
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.loading-row { display: flex; align-items: center; gap: 8px; font-size: 12.5px; color: var(--muted-foreground); }

.progress { height: 6px; border-radius: 999px; background: var(--muted); overflow: hidden; }
.progress > i { display: block; height: 100%; background: var(--foreground); }
.progress.thin { height: 3px; }

/* Forms. */
.form { display: flex; flex-direction: column; gap: 14px; }
.form.narrow { max-width: 440px; }
.form.mid { max-width: 560px; }
.field { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.field > label, .field > .lab { font-size: 12.5px; font-weight: 500; display: flex; align-items: baseline; gap: 6px; }
.field > label .opt { font-weight: 400; color: var(--muted-foreground); font-size: 11.5px; }
.field > label .req { color: var(--destructive); font-weight: 700; }
.field .help { font-size: 11.5px; color: var(--muted-foreground); }
.field .err { font-size: 11.5px; color: var(--destructive-surface-foreground); display: flex; gap: 5px; align-items: baseline; }
.field .err::before { content: "!"; font-weight: 700; }

.inp, .sel, .ta {
  width: 100%; height: 32px; padding: 0 9px; font-size: 12.5px;
  border: 1px solid var(--input); border-radius: var(--radius-sm);
  background: var(--background); color: var(--foreground);
}
.inp::placeholder, .ta::placeholder { color: var(--muted-foreground); opacity: 0.75; }
.inp.money { text-align: right; font-variant-numeric: tabular-nums; }
.inp.money-wrap { position: relative; display: flex; align-items: center; }
.inp.money-wrap .cur {
  position: absolute; right: 9px; font-size: 12px; color: var(--muted-foreground); pointer-events: none;
}
.inp.money-wrap.has-cur { padding-right: 26px; }
.inp.num { text-align: right; font-variant-numeric: tabular-nums; }
.inp.err { border-color: var(--destructive); }
.inp.ok { border-color: var(--positive); }
.inp:disabled, .inp[readonly], .sel:disabled, .ta:disabled {
  background: var(--muted); color: var(--muted-foreground); cursor: not-allowed;
}
.inp[readonly] { border-style: dashed; }
.ta { height: auto; min-height: 74px; padding: 7px 9px; resize: vertical; line-height: 1.5; }
.sel { padding-right: 26px; appearance: none;
  background-image: linear-gradient(45deg, transparent 50%, var(--muted-foreground) 50%), linear-gradient(135deg, var(--muted-foreground) 50%, transparent 50%);
  background-size: 5px 5px, 5px 5px; background-position: right 12px center, right 7px center; background-repeat: no-repeat;
}
.sel.bad { color: var(--muted-foreground); }
.inp-wrap { position: relative; display: flex; align-items: center; }
.inp-wrap .suffix {
  position: absolute; right: 9px; font-size: 11.5px; color: var(--muted-foreground); pointer-events: none;
}
.inp-wrap .suffix.left { right: auto; left: 9px; }
.inp-wrap.has-suffix { padding-right: 42px; }

.check { display: flex; gap: 8px; align-items: flex-start; font-size: 12.5px; cursor: pointer; }
.check input { margin: 2px 0 0; width: 14px; height: 14px; accent-color: var(--foreground); flex: none; }
.check .cd { display: block; color: var(--muted-foreground); font-size: 11.5px; }

.radio-list { display: flex; flex-direction: column; gap: 9px; }
.radio-list label { display: flex; gap: 8px; align-items: flex-start; font-size: 12.5px; cursor: pointer; }
.radio-list input { margin: 2px 0 0; accent-color: var(--foreground); flex: none; }

.switch-row { display: flex; align-items: flex-start; gap: 10px; }
.switch-row .txt { min-width: 0; }
.switch-row .txt b { font-weight: 500; display: block; }
.switch-row .txt small { display: block; color: var(--muted-foreground); font-size: 11.5px; }
.switch {
  width: 34px; height: 20px; border-radius: 999px; background: var(--input);
  border: 0; position: relative; flex: none; cursor: pointer; margin-top: 1px;
}
.switch::after {
  content: ""; position: absolute; top: 2px; left: 2px; width: 16px; height: 16px;
  border-radius: 50%; background: var(--background); transition: transform 0.12s;
}
.switch[aria-checked="true"] { background: var(--foreground); }
.switch[aria-checked="true"]::after { transform: translateX(14px); background: var(--background); }

.chips { display: flex; flex-wrap: wrap; gap: 6px; }
.chip {
  display: inline-flex; align-items: center; gap: 5px; height: 26px; padding: 0 8px;
  border-radius: var(--radius-sm); border: 1px solid var(--input);
  background: var(--background); font-size: 12px;
}
.chip .x { border: 0; background: transparent; cursor: pointer; color: var(--muted-foreground); padding: 0; line-height: 1; }

/* A FormSection: the title and line on the left, the fields on the right. */
.fsect { display: grid; grid-template-columns: 176px minmax(0, 1fr); gap: 12px 24px; padding: 4px 0; }
.fsect > .ft h4 { font-size: 12.5px; font-weight: 600; margin-bottom: 2px; }
.fsect > .ft p { font-size: 11.5px; color: var(--muted-foreground); }
.fsect > .ff { display: flex; flex-direction: column; gap: 14px; min-width: 0; }
.fsect.stacked > .ft { margin-bottom: 10px; }

/* The error summary, GOV.UK style. */
.esum { border: 2px solid var(--destructive); border-radius: var(--radius-sm); padding: 12px 14px; }
.esum h4 { font-size: 13px; color: var(--destructive); margin-bottom: 6px; }
.esum ul { margin: 0; padding-left: 18px; font-size: 12.5px; }
.esum a { color: var(--destructive); }

/* Tabs. */
.tabs { display: flex; gap: 2px; border-bottom: 1px solid var(--border); margin-bottom: 14px; overflow-x: auto; }
.tabs button {
  border: 0; background: transparent; cursor: pointer; font-size: 12.5px;
  padding: 8px 11px; color: var(--muted-foreground); white-space: nowrap;
  border-bottom: 2px solid transparent; margin-bottom: -1px;
}
.tabs button:hover { color: var(--foreground); }
.tabs button[aria-selected="true"] { color: var(--foreground); font-weight: 600; border-bottom-color: var(--foreground); }
.tabs button .n { font-size: 11px; color: var(--muted-foreground); margin-left: 4px; }

/* A record list: rows of several lines with their own commands. */
.rlist { display: flex; flex-direction: column; }
.rrow {
  display: flex; align-items: center; gap: 12px;
  padding: 10px 14px; border-bottom: 1px solid var(--border);
}
.rrow:last-child { border-bottom: 0; }
.rrow.is-sel { background: var(--muted); }
.rrow:hover { background: var(--muted); }
.rrow .txt { min-width: 0; flex: 1; }
.rrow .txt b { font-weight: 500; display: block; }
.rrow .txt small { display: block; color: var(--muted-foreground); font-size: 11.5px; }
.rrow .fig { text-align: right; font-variant-numeric: tabular-nums; font-size: 12.5px; white-space: nowrap; }
.rrow .fig small { display: block; color: var(--muted-foreground); font-size: 11px; }
.rrow .acts { display: flex; gap: 6px; align-items: center; flex: none; }
.rrow .lead { flex: none; width: 8px; height: 8px; border-radius: 50%; background: var(--positive); }
.rrow .lead.caution { background: var(--caution); }
.rrow .lead.destructive { background: var(--destructive); }
.rrow .lead.neutral { background: var(--input); }
.rrow .lead.info { background: var(--info); }

/* An action list: things to deal with. */
.alist { display: flex; flex-direction: column; }
.arow { display: flex; align-items: center; gap: 11px; padding: 10px 0; border-bottom: 1px solid var(--border); }
.arow:last-child { border-bottom: 0; }
.arow .why { flex: none; width: 22px; height: 22px; border-radius: 50%; background: var(--muted); display: grid; place-items: center; font-size: 11px; }
.arow .txt { min-width: 0; flex: 1; }
.arow .txt b { font-weight: 500; display: block; }
.arow .txt small { display: block; color: var(--muted-foreground); font-size: 11.5px; }
.arow .go { flex: none; }

/* A timeline of what happened to one record. */
.tl { display: flex; flex-direction: column; }
.tlrow { display: grid; grid-template-columns: 16px minmax(0, 1fr); gap: 10px; }
.tlrow .rail { display: flex; flex-direction: column; align-items: center; }
.tlrow .node { width: 8px; height: 8px; border-radius: 50%; background: var(--input); margin-top: 4px; flex: none; }
.tlrow .node.positive { background: var(--positive); }
.tlrow .node.caution { background: var(--caution); }
.tlrow .node.destructive { background: var(--destructive); }
.tlrow .thread { width: 1px; flex: 1; background: var(--border); margin: 3px 0; min-height: 10px; }
.tlrow:last-child .thread { display: none; }
.tlrow .tx { padding-bottom: 12px; min-width: 0; }
.tlrow .tx b { font-weight: 500; display: block; font-size: 12.5px; }
.tlrow .tx small { display: block; color: var(--muted-foreground); font-size: 11.5px; }

/* A stepper. */
.steps { display: flex; align-items: center; gap: 0; font-size: 12px; }
.step { display: flex; align-items: center; gap: 7px; color: var(--muted-foreground); }
.step .n {
  width: 21px; height: 21px; border-radius: 50%; display: grid; place-items: center;
  border: 1px solid var(--input); font-size: 11px; font-weight: 600; flex: none;
}
.step.done .n { background: var(--foreground); color: var(--background); border-color: var(--foreground); }
.step.now { color: var(--foreground); font-weight: 600; }
.step.now .n { border-color: var(--foreground); box-shadow: 0 0 0 3px var(--muted); }
.step-sep { width: 34px; height: 1px; background: var(--border); margin: 0 9px; }

/* Statement: money that adds up top to bottom. */
.stmt { display: flex; flex-direction: column; }
.stmt .grp { padding: 11px 0 4px; }
.stmt .grp > .glab { font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--muted-foreground); margin-bottom: 5px; }
.stmt .line { display: flex; align-items: baseline; gap: 12px; padding: 4px 0; font-size: 12.5px; }
.stmt .line .sub { display: block; color: var(--muted-foreground); font-size: 11px; }
.stmt .line .fig { margin-left: auto; font-variant-numeric: tabular-nums; white-space: nowrap; }
.stmt .sub-total { display: flex; align-items: baseline; gap: 12px; padding: 6px 0; font-weight: 600; font-size: 12.5px; border-top: 1px solid var(--border); margin-top: 4px; }
.stmt .sub-total .fig { margin-left: auto; font-variant-numeric: tabular-nums; }
.stmt .grand { display: flex; align-items: baseline; gap: 12px; padding: 11px 0 0; font-weight: 700; font-size: 14px; border-top: 2px solid var(--foreground); margin-top: 6px; }
.stmt .grand .fig { margin-left: auto; font-variant-numeric: tabular-nums; }

/* Plan cards. */
.plans { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; }
.plan {
  border: 1px solid var(--border); border-radius: var(--radius); padding: 12px;
  display: flex; flex-direction: column; gap: 3px; background: var(--card); position: relative;
}
.plan[aria-pressed="true"], .plan.current { border-color: var(--foreground); box-shadow: 0 0 0 1px var(--foreground); }
.plan .nm { font-weight: 600; font-size: 13px; }
.plan .pc { font-size: 19px; font-weight: 600; margin: 2px 0; }
.plan .pc small { font-size: 11.5px; font-weight: 400; color: var(--muted-foreground); }
.plan .ds { font-size: 11.5px; color: var(--muted-foreground); }
.plan .tagline {
  position: absolute; top: -8px; left: 11px; font-size: 10px; font-weight: 700;
  text-transform: uppercase; letter-spacing: 0.05em; background: var(--foreground); color: var(--background);
  padding: 1px 6px; border-radius: 4px;
}

/* A file drop zone. */
.drop {
  border: 1px dashed var(--input); border-radius: var(--radius);
  padding: 16px; display: flex; align-items: center; gap: 11px;
  background: var(--card); text-align: left; width: 100%; cursor: pointer;
}
.drop:hover { background: var(--muted); }
.drop.over { border-color: var(--foreground); background: var(--muted); }
.drop .ico { width: 34px; height: 34px; border-radius: var(--radius-sm); background: var(--muted); display: grid; place-items: center; flex: none; font-size: 14px; }
.drop b { font-weight: 500; display: block; font-size: 12.5px; }
.drop small { color: var(--muted-foreground); font-size: 11.5px; }
.filerow { display: flex; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid var(--border); font-size: 12.5px; }
.filerow:last-child { border-bottom: 0; }
.filerow .thumb { width: 34px; height: 34px; border-radius: var(--radius-sm); background: var(--muted); flex: none; display: grid; place-items: center; font-size: 12px; }

/* A preview pane beside a form. */
.preview { border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; background: var(--card); }
.preview .pv-bar { padding: 9px 12px; border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 8px; }
.preview .pv-bar b { font-size: 12.5px; }
.preview .pv-bar .toggle { margin-left: auto; display: flex; }
.preview .pv-cover { aspect-ratio: 16 / 7; background: var(--muted); display: grid; place-items: center; color: var(--muted-foreground); font-size: 12px; }
.preview .pv-body { padding: 14px; display: flex; flex-direction: column; gap: 7px; align-items: flex-start; }
.preview .pv-logo { display: flex; align-items: center; gap: 8px; }
.preview .pv-logo .sq { width: 30px; height: 30px; border-radius: 6px; background: var(--muted); display: grid; place-items: center; font-size: 10px; }
.preview .pv-body h4 { font-size: 15px; }
.preview .pv-body p { font-size: 12px; color: var(--muted-foreground); }
.preview .pv-foot { padding: 9px 14px; border-top: 1px solid var(--border); font-size: 10.5px; color: var(--muted-foreground); }

/* A dialog drawn inside the stage, with its scrim. */
.scrim { position: absolute; inset: 0; z-index: 20; background: var(--scroll-shade); display: grid; place-items: center; padding: 16px; }
.dialog {
  background: var(--popover); color: var(--popover-foreground);
  border: 1px solid var(--border); border-radius: var(--radius);
  box-shadow: 0 16px 40px var(--scroll-shade);
  width: 100%; max-width: 420px; display: flex; flex-direction: column; max-height: 100%;
}
.dialog.sm { max-width: 340px; }
.dialog.lg { max-width: 560px; }
.dialog > header { padding: 13px 15px 0; display: flex; align-items: flex-start; gap: 10px; }
.dialog > header h3 { font-size: 14px; }
.dialog > header p { font-size: 12px; color: var(--muted-foreground); margin-top: 3px; }
.dialog > .dbody { padding: 12px 15px; font-size: 12.5px; }
.dialog > footer {
  padding: 11px 15px; border-top: 1px solid var(--border);
  display: flex; gap: 8px; align-items: center; justify-content: flex-end;
}
.dialog > footer .left { margin-right: auto; }
.drawer {
  background: var(--popover); border: 1px solid var(--border); border-radius: var(--radius);
  box-shadow: 0 16px 40px var(--scroll-shade); display: flex; flex-direction: column;
  width: 100%; max-width: 420px; height: 100%; margin-left: auto;
}
.drawer > header { padding: 13px 15px 10px; border-bottom: 1px solid var(--border); }
.drawer > .dbody { padding: 13px 15px; overflow: auto; flex: 1; }
.drawer > footer { padding: 11px 15px; border-top: 1px solid var(--border); display: flex; gap: 8px; justify-content: flex-end; }
.pop {
  background: var(--popover); border: 1px solid var(--border); border-radius: var(--radius);
  box-shadow: 0 8px 22px var(--scroll-shade); padding: 5px; font-size: 12.5px; min-width: 170px;
}
.pop .item { display: flex; align-items: center; gap: 8px; padding: 6px 8px; border-radius: 5px; cursor: pointer; }
.pop .item:hover { background: var(--muted); }
.pop .item.danger { color: var(--destructive); }
.pop .item[aria-checked="true"]::after { content: "\\2713"; margin-left: auto; }
.pop .sep { height: 1px; background: var(--border); margin: 4px 0; }
.pop .cap { font-size: 10.5px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--muted-foreground); padding: 5px 8px 3px; }

/* Menus, tooltips, and small floating things. */
.menu {
  background: var(--popover); border: 1px solid var(--border); border-radius: var(--radius);
  box-shadow: 0 8px 22px var(--scroll-shade); padding: 5px; font-size: 12.5px; min-width: 180px;
}
.menu .mi { display: flex; align-items: center; gap: 8px; padding: 6px 8px; border-radius: 5px; cursor: pointer; white-space: nowrap; }
.menu .mi:hover { background: var(--muted); }
.menu .mi.danger { color: var(--destructive); }
.menu .mi[disabled] { opacity: 0.45; cursor: not-allowed; }
.menu .sep { height: 1px; background: var(--border); margin: 4px 0; }
.menu .mi .sc { margin-left: auto; font-size: 10.5px; color: var(--muted-foreground); }
.tip {
  background: var(--foreground); color: var(--background); font-size: 11.5px;
  padding: 5px 8px; border-radius: 5px; max-width: 240px; box-shadow: 0 4px 12px var(--scroll-shade);
}
.tip kbd {
  font-family: var(--font-mono); font-size: 10.5px; border: 1px solid currentColor;
  border-radius: 3px; padding: 0 3px; opacity: 0.8;
}

.hint { border-left: 2px solid var(--input); padding: 2px 0 2px 9px; font-size: 11.5px; color: var(--muted-foreground); }
.callout {
  border-radius: var(--radius-sm); padding: 9px 11px; font-size: 12px;
  background: var(--info-surface); color: var(--info-surface-foreground);
}
.callout.caution { background: var(--caution-surface); color: var(--caution-surface-foreground); }
.callout.positive { background: var(--positive-surface); color: var(--positive-surface-foreground); }
.callout.destructive { background: var(--destructive-surface); color: var(--destructive-surface-foreground); }

/* A canvas edge, for mocks that are about the frame rather than the content. */
.canvas {
  position: absolute; top: 8px; right: 8px; z-index: 5;
  font-size: 9.5px; letter-spacing: 0.05em; text-transform: uppercase;
  color: var(--muted-foreground); border: 1px dashed var(--border);
  border-radius: 4px; padding: 1px 5px; background: var(--background);
}
.canvas.bl { top: auto; bottom: 8px; }

/* Utility bits used by the registry chrome and the mocks alike. */
.muted { color: var(--muted-foreground); }
.tnum { font-variant-numeric: tabular-nums; }
.mono { font-family: var(--font-mono); }
.nowrap { white-space: nowrap; }
.stack { display: flex; flex-direction: column; gap: 12px; }
.stack.sm { gap: 8px; }
.stack.lg { gap: 16px; }
.inline { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.inline.top { align-items: flex-start; }
.grow { flex: 1; min-width: 0; }
.sep-v { width: 1px; align-self: stretch; background: var(--border); }
.hr { height: 1px; background: var(--border); border: 0; margin: 0; }
.wrap { display: flex; flex-wrap: wrap; gap: 8px 14px; }
.w-full { width: 100%; }

/* A page that hosts an overlay (toast, drawer, scrim) is as tall as a laptop
   screen, so the overlay sits at the screen edge rather than over the rows. */
.page[style*="position:relative"], .page[style*="position: relative"] { min-height: 560px; }

/* An amount is one unit: it never breaks between the currency and the figure. */
.dt td.num, .dt th.num, .rrow .fig, .statement .fig, .line .fig, .grand .fig, .sub-total .fig { white-space: nowrap; }

/* A mock that declares its own canvas width keeps it at every preset. */
body.w-phone .mock-canvas, body.w-narrow .mock-canvas, body.w-tablet .mock-canvas { max-width: none; }
body.w-wide .mock-canvas { max-width: none; }

/* Real responsive behaviour. The registry renders each mock in an iframe at
   the chosen width, so these rules apply exactly as they would in the app. */
/* shadcn sidebar: off-canvas below the md breakpoint, a menu button in the bar. */
@media (max-width: 767px) {
  .shell { grid-template-columns: minmax(0, 1fr); }
  .shell > nav { display: none; }
  .shell > .main > .bar::before { content: "\\2630"; font-weight: 400; margin-right: 2px; }
  /* A mock that draws its own menu glyph shows it once. */
  .shell > .main > .bar:has(> .nv-glyph)::before { content: none; }
}
@media (max-width: 640px) {
  .mock-canvas { padding: 10px; }
  .shell > .main > .page { padding: 12px; }
  .phead h1 { font-size: 18px; }
  .phead .acts { margin-left: 0; width: 100%; }
  .mock-canvas [style*="grid-template-columns"]:not(.keep-cols):not([style*="repeat(7"]):not([style*="repeat(5"]):not([style*="repeat(4"]) { grid-template-columns: minmax(0, 1fr) !important; }
  .section.split > .cols { grid-template-columns: minmax(0, 1fr); }
  .section > .body:has(> .dt) { overflow-x: auto; }
  /* A data table scrolls sideways at its own width rather than crushing every
     column until codes break mid-string. */
  .section > .body > .dt:has(tr > :nth-child(4)) { min-width: 600px; }
  /* A shadow at whichever edge still has content, so a table that scrolls
     reads as one that continues rather than one that is cut off. */
  .section > .body:has(> .dt tr > :nth-child(4)) {
    background:
      linear-gradient(to right, var(--card) 30%, transparent) left / 32px 100% no-repeat local,
      linear-gradient(to left, var(--card) 30%, transparent) right / 32px 100% no-repeat local,
      radial-gradient(farthest-side at 0 50%, var(--scroll-shade), transparent) left / 12px 100% no-repeat scroll,
      radial-gradient(farthest-side at 100% 50%, var(--scroll-shade), transparent) right / 12px 100% no-repeat scroll;
  }
  .dt td .code, .dt td .mono, .dt td code { white-space: nowrap; }
  /* A floating menu or popover placed with a desktop offset stays on the screen. */
  .mock-canvas [style*="position:absolute"][style*="right:"]:has(> .menu, > .pop) { right: 8px !important; left: auto !important; max-width: calc(100% - 16px); }
  /* A form section puts its title above its fields. */
  .fsect { grid-template-columns: minmax(0, 1fr); gap: 8px; }
  /* A table outside a Section scrolls inside itself rather than widening the page. */
  .dt:not(.body > .dt):not(.pf .dt) { display: block; max-width: 100%; overflow-x: auto; }
  /* A record row keeps its title on the full width and puts the state, the
     figure and the actions on a second line, as a phone list does. */
  .rrow { flex-wrap: wrap; row-gap: 6px; }
  .rrow .txt { flex: 1 1 calc(100% - 24px); }
  .rrow .fig { margin-left: auto; text-align: right; }
  .arow { flex-wrap: wrap; row-gap: 6px; }
  .arow .txt { flex: 1 1 calc(100% - 40px); }
  .arow .go { margin-left: 33px; }
  /* A dialog never grows past the stage, and a long figure in a split line
     wraps under its own alignment rather than pushing the dialog wider. */
  .scrim > .dialog { min-width: 0; }
  .split .fig { white-space: normal; text-align: right; min-width: 0; max-width: 60%; }
}
`;
