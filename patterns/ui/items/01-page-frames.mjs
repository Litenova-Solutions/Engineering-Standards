/**
 * Page frames: the shapes a page can take, and several arrangements of each.
 *
 * A back office composes a fixed set of page shapes. The variants below
 * hold the frame constant and change only how the content sits inside it, so a
 * choice is about arrangement rather than about which component is used.
 */

import {
  COMPANY,
  DELIVERY,
  MONEY,
  ORDER,
  PEOPLE,
  PRODUCT,
  REFUSALS,
  actionRow,
  alert,
  badgeRaw,
  callout,
  copyValue,
  drawer,
  dropZone,
  emptyState,
  facts,
  field,
  facts as dl,
  formSection,
  input,
  ordersTable,
  pager,
  phead,
  progress,
  recordRow,
  refusal,
  section,
  segmented,
  shell as pfShell,
  skeleton,
  split,
  statement,
  tabs,
  tile,
  tiles,
  timelineEntry,
  toast,
  toolbar,
  trail,
} from "../parts.mjs";

/**
 * The page shell, with any editor preview accent normalized. An accent painted
 * as a literal style reads in neither theme reliably. The theme primary does.
 */
function shell(title, page, active, opts) {
  const html = pfShell(title, page, active, opts);
  return html.replaceAll(/ style="background:#[0-9A-Fa-f]{3,8}"/g, "");
}

/** A setup step: a done, current or open marker, its words, and its command. */
function step(title, line, state = "", action = "") {
  return `<div class="pf-step${state ? ` ${state}` : ""}">
  <span class="pf-dot" aria-hidden="true">${state === "done" ? "✓" : ""}</span>
  <span class="txt"><b>${title}</b><small>${line}</small></span>
  ${action ? `<span class="go">${action}</span>` : ""}
</div>`;
}

/** The same shell without the sidebar, for a mock drawn at one fixed width. */
function bare(title, page, active) {
  return shell(title, page, active).replace('<div class="shell">', '<div class="shell pf-nonav">');
}

/** The outcome header: one icon in its tone, one statement, one line. */
function outcomeHead(tone, icon, title, line) {
  return `<div class="pf-hero"><span class="pf-ico ${tone}" aria-hidden="true">${icon}</span><h1>${title}</h1><p>${line}</p></div>`;
}

/** Page-frame CSS. Every class starts with pf-, or is scoped under .pf. */
const PF_CSS = /* css */ `
.page.pf { display: flex; flex-direction: column; gap: 16px; min-width: 0; }
.page.pf > .trail { margin-bottom: -10px; }
.page.pf > .phead { margin-bottom: 0; }
.page.pf > .toolbar { margin-bottom: -4px; }
.page.pf > .tabs { margin-bottom: -4px; }
.page.pf > .pager { padding: 0 2px; margin-top: -6px; }
.page.pf.pf-narrow { width: 100%; max-width: 680px; margin-inline: auto; }
.page.pf.pf-outcome { width: 100%; max-width: 580px; margin: 24px auto 0; }
.pf-stack { display: flex; flex-direction: column; gap: 16px; min-width: 0; }
.pf-split { display: grid; grid-template-columns: minmax(0, 1fr) 300px; gap: 16px; align-items: start; }
.pf-split.even { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); }
.pf-split.preview { grid-template-columns: minmax(0, 1fr) minmax(320px, 0.9fr); }
.pf-sticky { position: sticky; top: 16px; }
.pf-cols { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px 16px; }
.pf-foot { display: flex; gap: 8px; justify-content: flex-end; align-items: center; flex-wrap: wrap; border-top: 1px solid var(--border); padding-top: 14px; }
.pf-foot .left { margin-right: auto; }
.pf .section { container-type: inline-size; }
@container (max-width: 380px) {
  .facts.stacked > div { grid-template-columns: minmax(0, 1fr); gap: 1px; }
}
.pf-steps { display: flex; flex-direction: column; }
.pf-step { display: flex; align-items: flex-start; gap: 12px; padding: 12px 0; border-bottom: 1px solid var(--border); }
.pf-step:first-child { padding-top: 2px; }
.pf-step:last-child { border-bottom: 0; padding-bottom: 2px; }
.pf-step .txt { flex: 1; min-width: 0; }
.pf-step .txt b { display: block; font-weight: 500; font-size: 13px; }
.pf-step .txt small { display: block; color: var(--muted-foreground); font-size: 12px; margin-top: 1px; }
.pf-step.done .txt b { color: var(--muted-foreground); text-decoration: line-through; text-decoration-color: var(--border); }
.pf-step .go { flex: none; }
.pf-dot { width: 20px; height: 20px; border-radius: 50%; border: 1.5px dashed var(--input); flex: none; display: grid; place-items: center; font-size: 11px; margin-top: 1px; }
.pf-step.done .pf-dot { background: var(--foreground); color: var(--background); border: 0; }
.pf-step.now .pf-dot { border: 1.5px solid var(--foreground); box-shadow: 0 0 0 3px var(--muted); }
.pf-hero { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 8px; padding: 4px 0 8px; }
.pf-hero h1 { font-size: 19px; line-height: 1.3; max-width: 30ch; }
.pf-hero p { font-size: 12.5px; color: var(--muted-foreground); max-width: 52ch; }
.pf-ico { width: 40px; height: 40px; border-radius: 50%; display: grid; place-items: center; font-size: 16px; font-weight: 600; background: var(--muted); color: var(--foreground); }
.pf-ico.positive { background: var(--positive-surface); color: var(--positive-surface-foreground); }
.pf-ico.destructive { background: var(--destructive-surface); color: var(--destructive-surface-foreground); }
.pf-ico.caution { background: var(--caution-surface); color: var(--caution-surface-foreground); }
.pf-subnav { display: flex; flex-direction: column; gap: 2px; font-size: 12.5px; }
.pf-subnav .cap { font-size: 11px; color: var(--muted-foreground); padding: 10px 8px 4px; font-weight: 500; }
.pf-subnav .cap:first-child { padding-top: 0; }
.pf-subnav a { display: block; padding: 6px 8px; border-radius: var(--radius-sm); text-decoration: none; color: var(--muted-foreground); white-space: nowrap; }
.pf-subnav a:hover { background: var(--muted); color: var(--foreground); }
.pf-subnav a[aria-current="page"] { background: var(--muted); color: var(--foreground); font-weight: 600; }
.pf-withnav { display: grid; grid-template-columns: 176px minmax(0, 1fr); gap: 28px; align-items: start; }
.pf-toast { position: absolute; right: 36px; bottom: 36px; z-index: 4; }
.pf-bar { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; padding: 10px 14px; border: 1px solid var(--border); border-radius: var(--radius); background: var(--popover); box-shadow: 0 8px 24px var(--scroll-shade); font-size: 12.5px; }
.pf-bar .right { margin-left: auto; display: flex; gap: 6px; flex-wrap: wrap; }
.pf-bar.float { position: sticky; bottom: 12px; align-self: center; width: min(560px, 100%); }
.pf-kpis { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); border: 1px solid var(--border); border-radius: var(--radius); background: var(--card); }
.pf-kpis > div { padding: 12px 14px; border-left: 1px solid var(--border); min-width: 0; }
.pf-kpis > div:first-child { border-left: 0; }
.pf-kpis .lab { font-size: 11.5px; color: var(--muted-foreground); }
.pf-kpis .fig { font-size: 20px; font-weight: 600; letter-spacing: -0.02em; font-variant-numeric: tabular-nums; margin-top: 2px; }
.pf-kpis .sub { font-size: 11.5px; color: var(--muted-foreground); }
.pf-meter { display: flex; flex-direction: column; gap: 5px; }
.pf-meter .row { display: flex; justify-content: space-between; gap: 10px; font-size: 12px; }
.pf-meter .row span:last-child { font-variant-numeric: tabular-nums; color: var(--muted-foreground); }
.pf-cal { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); border-top: 1px solid var(--border); border-left: 1px solid var(--border); }
.pf-cal > div { min-height: 84px; border-right: 1px solid var(--border); border-bottom: 1px solid var(--border); padding: 5px 6px; font-size: 11px; min-width: 0; }
.pf-cal > .dow { min-height: 0; padding: 6px; color: var(--muted-foreground); font-weight: 500; background: var(--muted); }
.pf-cal > .out { color: var(--muted-foreground); background: var(--background); opacity: 0.6; }
.pf-cal > .today .d { background: var(--foreground); color: var(--background); border-radius: 999px; padding: 0 6px; }
.pf-cal .d { display: inline-block; font-variant-numeric: tabular-nums; margin-bottom: 3px; }
.pf-cal .ev { display: block; border-radius: 4px; padding: 2px 5px; margin-top: 2px; font-size: 10.5px; line-height: 1.35; background: var(--muted); border-left: 2px solid var(--foreground); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.pf-cal .ev.positive { border-left-color: var(--positive); }
.pf-cal .ev.info { border-left-color: var(--info); }
.pf-cal .ev.caution { border-left-color: var(--caution); }
.pf-date { flex: none; width: 46px; text-align: center; border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 4px 0; line-height: 1.15; background: var(--card); }
.pf-date small { display: block; font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--muted-foreground); }
.pf-date b { display: block; font-size: 16px; font-variant-numeric: tabular-nums; }
.pf-agenda { display: flex; flex-direction: column; }
.pf-agenda .day { display: flex; gap: 14px; align-items: flex-start; padding: 12px 14px; border-bottom: 1px solid var(--border); }
.pf-agenda .day:last-child { border-bottom: 0; }
.pf-agenda .day .rlist { flex: 1; min-width: 0; }
.pf-agenda .day .rrow { padding: 0; border: 0; }
.pf-agenda .day .rrow:hover { background: transparent; }
.pf-lane { display: grid; grid-template-columns: 130px minmax(0, 1fr); border-bottom: 1px solid var(--border); min-height: 46px; }
.pf-lane:last-child { border-bottom: 0; }
.pf-lane > .nm { padding: 10px 14px; font-size: 12px; font-weight: 500; border-right: 1px solid var(--border); }
.pf-lane > .tr { position: relative; background-image: linear-gradient(to right, var(--border) 1px, transparent 1px); background-size: calc(100% / 7) 100%; }
.pf-lane .blk { position: absolute; top: 8px; bottom: 8px; border-radius: 5px; background: var(--muted); border-left: 3px solid var(--foreground); padding: 3px 7px; font-size: 11px; overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
.pf-lane .blk.positive { border-left-color: var(--positive); }
.pf-lane .blk.info { border-left-color: var(--info); }
.pf-lane.head > .tr { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); background: none; }
.pf-lane.head > .tr span { font-size: 11px; color: var(--muted-foreground); padding: 8px 6px; border-left: 1px solid var(--border); }
.pf-big { font-size: 56px; font-weight: 600; letter-spacing: -0.03em; line-height: 1; font-variant-numeric: tabular-nums; }
.pf-docks { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px; }
.pf-live { display: inline-flex; align-items: center; gap: 6px; font-size: 11.5px; color: var(--positive-surface-foreground); font-weight: 500; }
.pf-live::before { content: ""; width: 7px; height: 7px; border-radius: 50%; background: var(--positive); box-shadow: 0 0 0 3px var(--positive-surface); }
.pf-wall { background: var(--background); border: 1px solid var(--border); border-radius: var(--radius); padding: 22px; display: flex; flex-direction: column; gap: 18px; }
.pf-err { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 8px; padding: 40px 16px; }
.pf-err .code { font-family: var(--font-mono); font-size: 12px; color: var(--muted-foreground); text-decoration: none; }
.pf-err h1 { font-size: 20px; }
.pf-err p { font-size: 12.5px; color: var(--muted-foreground); max-width: 52ch; }
.pf-err .btnrow { margin-top: 8px; justify-content: center; }
.pf-full { min-height: 560px; display: grid; place-items: center; background: var(--background); padding: 24px 16px; }
.pf-topbar { display: flex; align-items: center; gap: 10px; padding: 10px 16px; border-bottom: 1px solid var(--border); background: var(--background); font-size: 12.5px; }
.pf-topbar .right { margin-left: auto; display: flex; gap: 8px; align-items: center; }
.pf-topbar.dirty { background: var(--foreground); color: var(--background); border-color: var(--foreground); }
.pf-topbar.dirty .btn { border-color: var(--background); background: transparent; color: var(--background); }
.pf-topbar.dirty .btn.pf-inv { background: var(--background); color: var(--foreground); }
.pf-focus { border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; background: var(--background); }
.pf-focus > .body { padding: 28px 16px 36px; }
.pf-focus > .body > .inner { max-width: 600px; margin: 0 auto; display: flex; flex-direction: column; gap: 16px; }
.pf-nav-arrows { display: inline-flex; gap: 4px; }
.pf-only-phone { display: none; }
.pf-scroll-x { overflow-x: auto; }

/* Between a phone and a laptop: an aside stacks under the main column. */
@media (max-width: 1023px) {
  .pf-split, .pf-split.even, .pf-split.preview { grid-template-columns: minmax(0, 1fr); }
  .pf-sticky { position: static; }
  .pf-kpis { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .pf-kpis > div:nth-child(3) { border-left: 0; }
  .pf-kpis > div:nth-child(n+3) { border-top: 1px solid var(--border); }
}
@media (max-width: 767px) {
  .pf-withnav { grid-template-columns: minmax(0, 1fr); gap: 12px; }
  .pf-withnav > .pf-subnav { flex-direction: row; overflow-x: auto; border-bottom: 1px solid var(--border); padding-bottom: 8px; }
  .pf-withnav > .pf-subnav .cap { display: none; }
  .shell.pf-nonav { grid-template-columns: minmax(0, 1fr); }
}
.shell.pf-nonav { grid-template-columns: minmax(0, 1fr); }
.shell.pf-nonav > nav { display: none; }
.shell.pf-nonav > .main > .bar::before { content: "\\2630"; font-weight: 400; margin-right: 2px; }

/* A phone: rows wrap, tables become record lists, actions stack. */
@media (max-width: 640px) {
  .page.pf { gap: 12px; }
  .page.pf.pf-outcome { margin-top: 8px; }
  .pf-cols { grid-template-columns: minmax(0, 1fr); }
  .pf .fsect { grid-template-columns: minmax(0, 1fr); gap: 8px; }
  .pf .tiles { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
  .pf .tile { padding: 10px 12px; }
  .pf .tile .fig { font-size: 20px; }
  .pf .search, .pf .search input { width: 100%; }
  .pf .toolbar .search { flex: 1 1 100%; }
  .pf .toolbar .right { margin-left: 0; }
  .pf .rrow:has(> span > .badge), .pf .rrow:has(> .fig) { flex-wrap: wrap; row-gap: 6px; }
  .pf .rrow:has(> span > .badge) > .txt, .pf .rrow:has(> .fig) > .txt { flex: 1 1 calc(100% - 24px); }
  .pf .rrow .acts { margin-left: auto; }
  .pf .dt:not(.pf-keep), .pf .dt:not(.pf-keep) > tbody { display: block; min-width: 0; }
  .pf .dt:not(.pf-keep) > thead { display: none; }
  .pf .dt:not(.pf-keep) > tbody > tr { display: flex; height: auto; min-height: max-content; flex-wrap: wrap; align-items: flex-start; gap: 4px 12px; padding: 10px 14px; border-bottom: 1px solid var(--border); }
  .pf .dt:not(.pf-keep) > tbody > tr:last-child { border-bottom: 0; }
  .pf .dt:not(.pf-keep) > tbody > tr > td { display: block; padding: 0; border: 0; }
  .pf .dt:not(.pf-keep) > tbody > tr > td.num { margin-left: auto; text-align: right; }
  .pf .dt:not(.pf-keep) > tbody > tr > td.check { width: auto; }
  .pf .dt:not(.pf-keep) > tbody > tr > td[colspan] { flex: 1 1 100%; margin: 0 -14px -10px; }
  .pf-actions { flex-direction: column-reverse; align-items: stretch; }
  .pf-actions .btn { width: 100%; }
  .pf-actions .left { margin-right: 0; }
  .pf-foot.pf-actions { justify-content: stretch; }
  .pf-toast { left: 18px; right: 18px; bottom: 18px; }
  .pf-toast .toast { min-width: 0; }
  .pf-lane { grid-template-columns: 84px minmax(0, 1fr); }
  .pf-big { font-size: 40px; }
  .pf-only-desk { display: none; }
  .pf-only-phone { display: block; }
  .pf-focus > .body { padding: 16px 12px 24px; }
}
@media all {
.pf-confirm { background: var(--positive-surface); color: var(--positive-surface-foreground); border-radius: var(--radius); padding: 24px 18px; text-align: center; display: flex; flex-direction: column; gap: 6px; align-items: center; }
.pf-confirm .ref { font-family: var(--font-mono); font-size: 16px; font-weight: 600; letter-spacing: 0.01em; }
.pf-bigq { font-size: 22px; font-weight: 600; letter-spacing: -0.01em; line-height: 1.3; }
.pf-floatwrap { position: relative; }
.pf-floatpanel { position: absolute; top: 16px; left: 16px; width: 300px; max-width: calc(100% - 32px); z-index: 2; }
.pf-play { display: grid; grid-template-columns: minmax(0, 1fr) 260px; gap: 16px; align-items: start; }
@media (max-width: 640px) {
  .pf-floatpanel { position: static; width: auto; max-width: none; margin-bottom: 12px; }
  .pf-play { grid-template-columns: minmax(0, 1fr); }
  .pf-bigq { font-size: 19px; }
}
}
`;

/** A page with one period, one statement and the breakdowns. */
function statementSection(period) {
  return section(
    "",
    statement(
      [
        {
          label: "Income",
          lines: [
            { what: "Product sales", sub: "2 warehouses, 1,204 orders", amount: "EUR 54,180.00" },
            { what: "Shipping fees", sub: "1,204 orders", amount: "EUR 6,020.00" },
          ],
          totalLabel: "Total income",
          total: "EUR 60,200.00",
        },
        {
          label: "Costs",
          lines: [
            { what: "The provider fee", sub: "1.9% plus EUR 0.25", amount: "EUR -1,143.80" },
            { what: "Refunds", sub: "31 orders", amount: "EUR -1,550.00" },
          ],
          totalLabel: "Total costs",
          total: "EUR -2,693.80",
        },
      ],
      { label: `Net for ${COMPANY.name}, ${period}`, amount: "EUR 57,506.20" },
    ),
    { flush: false },
  );
}

export const CATEGORY_PAGE_FRAMES = {
  css: PF_CSS,
  items: [
    // ---------------------------------------------------------------- 1
    {
      id: "frame-home",
      title: "The home page",
      floorplan: "work-page",
      verdict: "Work first, tiles second stays the pick: the manager reads the queue and stops, and the figures wait below for the curious. The Linear-style my-work split is the runner-up; prefer it once assignment is a real command and two people share one queue. Never ship the tiles-first order as the default: three stat tiles push the queue below the fold and the page reads as a report instead of a task list.",
      why: "The first page after sign-in has one job: tell the reader <b>what needs doing now</b>, in that order, before any figure. A home page typically holds a greeting, stat tiles, a setup section, a needs-attention list and a coming-up list. The disagreement is how much of that is above the fold, and whether the tiles lead or the work leads.",
      variants: [
        {
          name: "Work first, tiles second",
          pick: true,
          rationale:
            "The page opens on what needs doing, then the figures underneath. A returning manager reads the queue and stops; a curious one scrolls for the numbers.",
          tradeoff:
            "The tiles lose prominence, and a reader who came to check a number has to scroll. Costs one screen of vertical space.",
          html: shell(
            "Home",
            `<div class="page pf">
  ${phead("Good afternoon, Alex", "Two things need you today. Dispatch for the Garcia restock starts Saturday.", '<button class="btn primary">New delivery</button>')}
  ${section(
    "Needs attention",
    `<div class="alist">
      ${actionRow("Close out the Becker restock", "The delivery is complete. Nothing left to settle.", "Close out", "◷")}
      ${actionRow("31 refunds need a decision", "The 180-day window closes on 5 of them this week.", "Decide", "⚑")}
    </div>`,
    { acts: '<span class="badge caution">2 to do</span>' },
  )}
  ${section(
    "Coming up",
    `<div class="rlist">
      ${recordRow({ title: DELIVERY.name, sub: `${DELIVERY.date}, ${DELIVERY.window} · ${DELIVERY.place}`, state: { label: "Active", tone: "positive" }, fig: "32 of 40 pallets", actions: '<button class="btn sm">Open delivery</button>', lead: "positive" })}
      ${recordRow({ title: "Becker Bouw restock", sub: "Sat 21 Mar 2026, 08:00 to 12:00 · Rotterdam warehouse", state: { label: "Scheduled", tone: "info" }, fig: "12 of 40 pallets", actions: '<button class="btn sm">Open delivery</button>' })}
    </div>`,
  )}
  ${section(
    "Where you stand",
    tiles(
      tile("Ordered this month", "9,412", "Orders across every customer"),
      tile("Paid out by the provider", "EUR 57,506", "Next payout on 12 Oct"),
      tile("Active now", "2", "Deliveries with pallets left"),
    ),
    { desc: "The figures, for when the queue is clear." },
  )}
</div>`,
            "Home",
          ),
        },
        {
          name: "Tiles first, work second",
          rationale:
            "Figures give the reader a sense of scale in the first second, and the queue is read as a drill-down from them.",
          tradeoff:
            "Three large tiles push the needs-attention list below the fold, so the page reads as a report rather than a task list.",
          html: shell(
            "Home",
            `<div class="page pf">
  ${phead("Good afternoon, Alex", "What is waiting for you, and the coming deliveries.", '<button class="btn primary">New delivery</button>')}
  ${tiles(
    tile("Ordered", "9,412", "Orders across every customer, all time."),
    tile("Coming up", "2", "Deliveries with a date still ahead."),
    tile("Dispatching now", "0", "No dispatch is running right now."),
  )}
  ${section("Finish your setup", `<div class="alist">${actionRow("Connect a payment account", "Every other step is done. Money cannot be taken until the provider is connected.", "Connect", "◈")}</div>`)}
  ${section("Needs attention", `<div class="alist">${actionRow("Close out the Becker restock", "Nothing left to settle.", "Close out", "◷")}</div>`, { acts: '<span class="badge caution">1 thing to do</span>' })}
  ${section("Coming up", `<div class="rlist">${recordRow({ title: DELIVERY.name, sub: `${DELIVERY.date}, ${DELIVERY.window} · ${DELIVERY.place}`, state: { label: "Active", tone: "positive" }, fig: "32 of 40 pallets", actions: '<button class="btn sm">Open delivery</button>', lead: "positive" })}${recordRow({ title: "Becker Bouw restock", sub: "Sat, 21 Mar 2026, 08:00 to 12:00 · Rotterdam warehouse", state: { label: "Scheduled", tone: "info" }, fig: "12 of 40 pallets", actions: '<button class="btn sm">Open delivery</button>' })}</div>`)}
</div>`,
            "Home",
          ),
        },
        {
          name: "One queue, no tiles",
          rationale:
            "The home page is nothing but the queue, ordered by consequence. Nothing to scroll past, and no figure to misread as the answer.",
          tradeoff:
            "The reader loses orientation entirely. Nothing says how big the day is, how much is coming, or whether anything is broken. The work-page shape calls for two to four tiles below the queue.",
          html: shell(
            "Home",
            `<div class="page pf">
  ${phead("Today", "Two things need you, in the order they cost you most if they wait.", '<button class="btn primary">New delivery</button>')}
  ${section(
    "",
    `<div class="alist">
      ${actionRow("31 refunds need a decision", "5 close their 180-day window this week. The oldest is 214 days old.", "Decide", "⚑")}
      ${actionRow("Close out the Becker restock", "Delivered Sat 3 Oct. Nothing left to settle.", "Close out", "◷")}
      ${actionRow("Becker Bouw restock has no dock plan", "Dispatch starts tomorrow at 08:00. Nothing can leave without one.", "Set the docks up", "◈")}
    </div>`,
    { acts: '<span class="badge caution">3 to do</span>' },
  )}
</div>`,
            "Home",
          ),
        },
        {
          name: "Grouped by area",
          rationale:
            "The page is a set of per-area summaries, each linking into its own list. Home becomes a directory rather than a task list.",
          tradeoff:
            "A returning manager has to open an area before they can work, and nothing surfaces the one thing that is actually late. Better as a settings home than as a landing page.",
          html: shell(
            "Home",
            `<div class="page pf">
  ${phead("Good afternoon, Alex", "Everything Acme Supply runs, and where it needs you.")}
  ${section(
    "",
    `<div class="rlist">
      ${recordRow({ title: "Orders", sub: "268 orders, 2 needing attention", state: { label: "2 to do", tone: "caution" }, actions: '<button class="btn sm">Open</button>' })}
      ${recordRow({ title: "Products", sub: "412 in stock, 3 running low", state: { label: "Active", tone: "positive" }, actions: '<button class="btn sm">Open</button>' })}
      ${recordRow({ title: "Refunds", sub: "10 open, oldest 214 days", state: { label: "10 open", tone: "caution" }, actions: '<button class="btn sm">Open</button>' })}
      ${recordRow({ title: "Invoices", sub: "September settled, October open", state: { label: "Settled", tone: "positive" }, actions: '<button class="btn sm">Open</button>' })}
    </div>`,
  )}
</div>`,
            "Home",
          ),
        },
        {
          name: "Queue with an owner and an age",
          rationale:
            "A triage shape. Each row carries who must act and how long it has waited, so several people can share the queue rather than duplicate the work.",
          tradeoff:
            "An owner and a clock are only honest if assignment is a real command. With no assignment, every row reads Alex and the columns are noise.",
          html: shell(
            "Home",
            `<div class="page pf">
  ${phead("Needs you", "Ordered by how long each has been waiting.", '<button class="btn sm">Filter</button>')}
  ${section(
    "",
    `<table class="dt">
      <thead><tr><th scope="col">What</th><th scope="col">Why</th><th scope="col">Waiting</th><th scope="col">Owner</th><th scope="col"></th></tr></thead>
      <tbody>
        <tr><td><b>Refund SO-1042</b><br><small class="muted">Maria Garcia, ${MONEY.refund}</small></td><td class="muted">Requested 6 days ago</td><td><span class="badge caution">6 days</span></td><td>${PEOPLE.finance.name}</td><td class="num"><button class="btn sm">Deal with</button></td></tr>
        <tr><td><b>Dispute D-0182</b><br><small class="muted">Garcia restock, ${MONEY.lamp}</small></td><td class="muted">Bank opened a case</td><td><span class="badge destructive">11 days</span></td><td>${PEOPLE.support.name}</td><td class="num"><button class="btn sm">Deal with</button></td></tr>
        <tr><td><b>Close out Becker restock</b><br><small class="muted">Becker Bouw</small></td><td class="muted">Delivered Sat 3 Oct</td><td><span class="badge">3 days</span></td><td>${PEOPLE.finance.name}</td><td class="num"><button class="btn sm">Close out</button></td></tr>
      </tbody>
    </table>`,
  )}
</div>`,
            "Home",
          ),
        },
        {
          name: "Guided first run",
          rationale:
            "A new company gets a checklist before the queue exists, because a queue of nothing teaches nothing. The queue takes over once the checklist is done.",
          tradeoff:
            "Two different pages behind one route. The usual answer is a separate setup route plus a setup section, which is the same idea held in two places rather than one.",
          html: shell(
            "Home",
            `<div class="page pf">
  ${phead("Set up Acme Supply", "Three steps between a company and a first sale.")}
  ${section(
    "Before you can take money",
    `<div class="pf-steps">
      ${step("Create a company", "Acme Supply, Amsterdam.", "done")}
      ${step("Connect a payment account", "The provider holds the money for you. You need a business number and a bank account.", "now", '<button class="btn primary sm">Connect</button>')}
      ${step("Publish a storefront", "Your own address, so customers order where you send them.", "", '<button class="btn sm">Set up</button>')}
    </div>`,
    { desc: "Each step is a command of its own, not a form that saves at the end." },
  )}
  ${section("What you can do now", `<div class="alist">${actionRow("Add a product", "It stays a draft until you price it and publish it.", "New product", "◈")}</div>`)}
</div>`,
            "Home",
          ),
        },
        {
          name: "My work first, shared queue second",
          reference: "Linear",
          rationale:
            "Linear's triage shape. What is assigned to Alex sits above what belongs to Acme Supply as a whole, so two people never decide the same refund twice. The shared queue stays visible, which keeps one person's morning from hiding the shared state.",
          tradeoff:
            "Assignment must be a real command with a real owner, or every row reads Alex and the split is decoration. Costs the tiles their place on short screens.",
          html: shell(
            "Home",
            `<div class="page pf">
  ${phead("Good afternoon, Alex", "Yours first, then what belongs to everybody.", '<button class="btn primary">New delivery</button>')}
  ${section(
    "Assigned to you",
    `<div class="alist">
      ${actionRow("Decide the refund on order SO-1042", "Maria Garcia paid EUR 125.00. The window closes in 174 days.", "Decide", "⚑")}
      ${actionRow("Set the price for the Oak desk lamp", "Nothing can sell until the price is set.", "Set pricing", "◈")}
    </div>`,
    { acts: '<span class="badge caution">2 yours</span>' },
  )}
  ${section(
    "The shared queue",
    `<div class="rlist">
      ${recordRow({ title: "Close out the Becker restock", sub: "The delivery is complete. Nothing left to settle.", state: { label: "Unassigned", tone: "neutral" }, actions: '<button class="btn sm">Take it</button>' })}
      ${recordRow({ title: "Dispute D-0182", sub: "Garcia restock · the bank opened a case", state: { label: "Jordan Lee", tone: "info" }, actions: '<button class="btn sm">Open</button>' })}
    </div>`,
    { desc: "Work nobody owns yet, and work somebody else owns." },
  )}
  ${section(
    "Where you stand",
    tiles(
      tile("Ordered this month", "9,412", "Orders across every customer"),
      tile("Paid out by the provider", "EUR 57,506", "Next payout on 12 Oct"),
      tile("Active now", "2", "Deliveries with pallets left"),
    ),
  )}
</div>`,
            "Home",
          ),
        },
        {
          name: "One next action, then the queue",
          rationale:
            "Faster first action. The page names the single thing that costs most if it waits and puts its command at the top, so a busy reader acts in the first second without scanning. Everything else stays queued below in the same shape as the work-first page.",
          tradeoff:
            "Choosing the one next action is a judgment the application has to make and keep true; when it picks wrong, the real urgency sits one section down. Costs one section of vertical space above the queue.",
          html: shell(
            "Home",
            `<div class="page pf">
  ${phead("Good morning, " + PEOPLE.manager.name, "One thing cannot wait. The rest is queued below it.", '<button class="btn primary">New delivery</button>')}
  ${section(
    "Do this first",
    actionRow(
      "Decide the refund on order " + ORDER.number,
      ORDER.customer + " paid " + MONEY.order + ". This payment method refunds only within 180 days of the payment.",
      "Decide now",
      "◷",
    ),
    { desc: "The oldest ask in the queue. Nothing else needs you before this is done." },
  )}
  ${section(
    "Then this",
    '<div class="alist">' +
      actionRow("Set the price for " + PRODUCT.name, "Nothing can sell until the price is set.", "Set pricing", "◈") +
      actionRow("Look at order " + ORDER.number, ORDER.customer + " paid " + MONEY.order + " for " + ORDER.lines + " lines.", "Open order", "◔") +
      "</div>",
  )}
  ${section(
    "Where " + COMPANY.name + " stands",
    tiles(
      tile("Pallets at " + PRODUCT.warehouse, DELIVERY.capacity, DELIVERY.date + ", " + DELIVERY.window),
      tile("Paid on order " + ORDER.number, MONEY.order, ORDER.customer),
      tile(PRODUCT.name, MONEY.lamp, "Plus " + MONEY.shipping + " shipping"),
    ),
    { desc: "The figures, for when the queue is clear." },
  )}
</div>`,
            "Home",
          ),
        },
      ],
    },
    // ---------------------------------------------------------------- 2
    {
      id: "frame-list",
      title: "The list page",
      floorplan: "list-page",
      verdict: "Search plus one state filter stays the pick: two controls answer the two questions readers actually ask, and a bare list only needs the filter added. The GitHub-style dense filter bar is the runner-up; prefer it past a few hundred rows across many customers, where the query must be restated in words. Never ship two tables on one page: a list page holds one table, and a second table is a second route wearing a disguise.",
      why: "Find one record among many. The frame is fixed: header, views, search, filters, one table, pagination. The argument is almost entirely about <b>which controls earn their place</b>, because a search box on its own is not enough across 268 rows.",
      variants: [
        {
          name: "Search and a state filter only",
          pick: true,
          rationale:
            "Two controls for the two questions people actually ask: who is this, and what state is it in. Everything else is a view. This is the smallest honest addition to a bare list.",
          tradeoff:
            "A reader with 268 orders from 40 customers still cannot narrow to one customer. Acceptable while the search box already searches the customer name.",
          html: shell(
            "Orders",
            `<div class="page pf">
  ${phead("Orders", "Every order across your customers, newest first.", "", {
    crumb: trail("Home", "Orders"),
  })}
  ${toolbar({
    search: "",
    placeholder: "Order number, name or email",
    filters: ["Any state", "Paid", "Awaiting payment", "Refunded", "Disputed"],
    right: '<button class="btn sm">Export</button>',
  })}
  ${section("", ordersTable({ sortable: true }), { flush: true, acts: "" })}
  ${pager(1, 11)}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Views instead of filters",
          rationale:
            "A segmented control across the top: All, Paid, Awaiting, Refunded, Disputed. One control instead of five, and the current choice is visible rather than hidden in a dropdown.",
          tradeoff:
            "Five segments plus a search box crowd one toolbar, and segments have no room for a count per state, so the reader cannot see where the work is before choosing.",
          html: shell(
            "Orders",
            `<div class="page pf">
  ${phead("Orders", "Every order across your customers, newest first.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({
    search: "",
    placeholder: "Order number, name or email",
    views: [{ label: "All 268", on: true }, "Paid 214", "Awaiting 31", "Refunded 18", "Disputed 5"],
    active: 0,
  })}
  ${section("", ordersTable({ sortable: true }), { flush: true })}
  ${pager(1, 11)}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Full filter row with chips",
          rationale:
            "Search, customer, state, date range and channel, each as a control that stays visible. The applied set is restated as removable chips underneath, so the reader never guesses what narrowed the table.",
          tradeoff:
            "Four controls and a chip row is a lot of chrome above a table, and the chips duplicate the controls. Worth it once the list genuinely holds mixed records.",
          html: shell(
            "Orders",
            `<div class="page pf">
  ${phead("Orders", "268 orders from 40 customers.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({
    search: "",
    placeholder: "Search orders",
    filters: ["Any customer", "Any state", "Any date", "Any channel"],
    right: '<button class="btn sm">Columns</button>',
  })}
  <div class="inline" style="margin:-4px 0 10px">
    <span class="chip">Paid <button class="x" aria-label="Remove the Paid filter">✕</button></span>
    <span class="chip">Garcia Interiors <button class="x" aria-label="Remove the customer filter">✕</button></span>
    <button class="btn ghost sm">Clear both</button>
  </div>
  ${section("", ordersTable({ sortable: true, rows: 5 }), { flush: true })}
  ${pager(1, 11)}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Saved views, opened from a menu",
          rationale:
            "The states people return to are saved under names: Late payments, Disputed this week, Garcia orders. A dropdown holds them so the toolbar stays empty until asked.",
          tradeoff:
            "Nothing is discoverable on arrival, and every view needs its own storage. Good for power users, poor as a first-run surface.",
          html: shell(
            "Orders",
            `<div class="page pf">
  ${phead("Orders", "268 orders from 40 customers.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({
    search: "",
    placeholder: "Search orders",
    right: '<button class="btn sm">Views ▾</button><button class="btn sm">Filters</button><button class="btn sm">Columns</button>',
  })}
  ${section("", ordersTable({ sortable: true }), { flush: true })}
  ${pager(1, 11)}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Two lists on one page",
          rationale:
            "Orders waiting for something sit above orders that need nothing. Two tables, so the working set is never mixed with the settled set.",
          tradeoff:
            "A list page holds one table, and a second table means a second page or a tab. Following it means two routes and two search states.",
          html: shell(
            "Orders",
            `<div class="page pf">
  ${phead("Orders", "Every order across your customers, newest first.", "", { crumb: trail("Home", "Orders") })}
  ${section(
    "Waiting for something",
    ordersTable({ rows: 2, states: false }),
    { flush: true, desc: "Two orders waiting to be moved.", acts: '<span class="badge caution">2</span>' },
  )}
  ${section("Settled", ordersTable({ rows: 3, states: false }), { flush: true, desc: "214 orders. Nothing is waiting on these." })}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Dense filter bar with a result count",
          reference: "GitHub",
          rationale:
            "GitHub's issue-list shape. One filter bar states the query in words, a count says what matched, and a dense table sits under it. The reader sees what narrowed the list without opening a dropdown.",
          tradeoff:
            "A query syntax has to be learned, and typing a query is slower than pressing a segment for the two states people ask about daily. Best past a few hundred rows, noise below it.",
          html: shell(
            "Orders",
            `<div class="page pf">
  ${phead("Orders", "Every order across your customers, newest first.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "state:paid", placeholder: "Filter by state, customer or product", right: '<button class="btn sm">Export</button>' })}
  <div class="inline" style="margin:-4px 0 10px">
    <span class="chip">state:paid <button class="x" aria-label="Remove the state filter">✕</button></span>
    <span class="muted" style="font-size:12px">214 of 268 orders</span>
    <button class="btn ghost sm">Save this view</button>
  </div>
  ${section("", ordersTable({ sortable: true }), { flush: true })}
  ${pager(1, 9, 1, 25, 214)}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Master and detail on one screen",
          reference: "PatternFly",
          rationale:
            "The table on the left, the record on the right. Selecting a row fills the detail panel, so several orders can be compared in one sitting without losing the list.",
          tradeoff:
            "PatternFly's own guidance reserves this for comparing short lists of the same type, and says the detail pane needs a selected state and a close control. On a 1440 screen the table gets roughly 900 pixels, which is enough for five columns and not eight.",
          html: shell(
            "Orders",
            `<div class="page pf">
  ${phead("Orders", "268 orders. Select one to read it here.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Search orders", filters: ["Any state"] })}
  <div class="pf-split">
  <div class="section"><div class="body flush">
    <table class="dt">
      <thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col">State</th><th scope="col" class="num">Paid</th></tr></thead>
      <tbody>
        <tr class="is-sel"><td><span class="code">SO-1042</span><br><small class="muted">Garcia Interiors</small></td><td>Maria Garcia<br><small class="muted">maria@garcia-interiors.example</small></td><td>${badgeRaw("Paid", "positive", "outline")}</td><td class="num">${MONEY.order}</td></tr>
        <tr><td><span class="code">SO-1041</span><br><small class="muted">Becker Bouw</small></td><td>Tom Becker<br><small class="muted">tom@becker-bouw.example</small></td><td>${badgeRaw("Paid", "positive", "outline")}</td><td class="num">EUR 310.00</td></tr>
        <tr><td><span class="code">SO-1040</span><br><small class="muted">Lindqvist Studio</small></td><td>Elin Lindqvist<br><small class="muted">elin@lindqvist.example</small></td><td>${badgeRaw("Awaiting payment", "caution", "outline")}</td><td class="num">EUR 64.50</td></tr>
        <tr><td><span class="code">SO-1039</span><br><small class="muted">Garcia Interiors</small></td><td>Maria Garcia<br><small class="muted">maria@garcia-interiors.example</small></td><td>${badgeRaw("Shipped", "positive", "outline")}</td><td class="num">${MONEY.lamp}</td></tr>
        <tr><td><span class="code">SO-1038</span><br><small class="muted">Okafor Office</small></td><td>Ade Okafor<br><small class="muted">ade@okafor.example</small></td><td>${badgeRaw("Refunded", "neutral", "outline")}</td><td class="num">EUR 0.00</td></tr>
      </tbody>
    </table>
  </div></div>
  <aside class="section pf-sticky">
    <h3>${ORDER.number} ${badgeRaw("Paid", "positive")}<span class="acts"><button class="btn sm icon ghost" aria-label="Close the detail">✕</button></span></h3>
    <div class="body">
      ${dl([["Customer", `${ORDER.customer}<br><span class="muted">${ORDER.email}</span>`], ["Company", ORDER.company], ["Placed", ORDER.placed], ["Paid", MONEY.order]], { stacked: true })}
      <hr class="hr" style="margin:12px 0">
      <div class="btnrow"><button class="btn sm">Resend the confirmation</button><button class="btn sm">Refund</button></div>
    </div>
  </aside>
  </div>
</div>`,
            "Orders",
          ),
        },
      ],
    },
    // ---------------------------------------------------------------- 3
    {
      id: "frame-queue",
      title: "The queue",
      floorplan: "list-page with bulkActions",
      verdict: "The Gmail-style page banner stays the pick: selecting the page and then explicitly selecting the rest is the clearest answer to the select-all problem, and money deserves the second click. The Zendesk-style play mode is the runner-up; prefer it when each decision needs different information and batch work is rare. Never ship the toolbar-replacing bulk bar: the layout jumps mid-decision and the search box vanishes just when the reader wants to refine it.",
      why: "Process items in batches. The queue is the one list page where <b>selection is the interface</b>, so the whole page has to answer: what does the checkbox select, and what happens to a thousand of them.",
      variants: [
        {
          name: "Select all on the page, banner for the rest",
          pick: true,
          reference: "Gmail",
          rationale:
            "The header checkbox selects the 25 rows on screen. A banner then says <i>All 25 on this page are selected. Select all 31</i>, which makes the larger set an explicit second act rather than an invisible jump.",
          tradeoff:
            "Two clicks to act on everything, and the banner is one more thing on the page. Gmail's shape, and the clearest available answer to the select-all problem.",
          html: shell(
            "Refunds",
            `<div class="page pf">
  ${phead("Refunds", "31 orders waiting for a decision.", "", { crumb: trail("Home", "Orders", "Refunds") })}
  ${toolbar({ search: "", placeholder: "Search by order or customer", filters: ["Any age"], right: '<button class="btn sm">Columns</button>' })}
  <div class="alert info">
    <span class="ico" aria-hidden="true">i</span><span class="txt"><b>All 25 refunds on this page are selected.</b><small>6 more are on the next page.</small></span>
    <span class="tail"><button class="btn sm">Select all 31</button><button class="btn sm ghost">Clear</button></span>
  </div>
  ${section("", `<table class="dt dense">
    <thead><tr><th class="check"><input type="checkbox" checked aria-label="Select all on this page"></th><th scope="col">Order</th><th scope="col">Customer</th><th scope="col">Asked</th><th scope="col" class="num">Amount</th><th scope="col">Window</th></tr></thead>
    <tbody>
      ${[
        ["SO-1042", "Maria Garcia", "6 days ago", MONEY.refund, "174 days left", "info"],
        ["SO-1041", "Tom Becker", "11 days ago", MONEY.refund, "169 days left", "info"],
        ["SO-1039", "Elin Lindqvist", "163 days ago", MONEY.refund, "17 days left", "caution"],
        ["SO-1036", "Ade Okafor", "181 days ago", MONEY.refund, "closed", "destructive"],
        ["SO-1031", "Tom Becker", "214 days ago", MONEY.refund, "closed", "destructive"],
      ]
        .map(
          ([no, who, when, amt, win, tone]) => `<tr class="is-sel">
        <td class="check"><input type="checkbox" checked aria-label="Select order ${no}"></td>
        <td><span class="code">${no}</span><br><small class="muted">Oak desk lamp</small></td>
        <td>${who}</td><td class="muted">${when}</td><td class="num">${amt}</td>
        <td>${badgeRaw(win, tone, "outline")}</td>
      </tr>`,
        )
        .join("")}
    </tbody>
  </table>`, { flush: true })}
  <div class="pf-bar">
    <b>25 of 31 selected</b><span class="muted">EUR 1,155.00 in total</span>
    <span class="right"><button class="btn sm">Offer credit</button><button class="btn sm">Refund part</button><button class="btn sm primary">Refund in full</button></span>
  </div>
</div>`,
            "Orders",
          ),
        },
        {
          name: "A checkbox on every row, no header checkbox",
          rationale:
            "Selection is per order and never global, which is honest for money. The reader acts on five at a time and the page never implies it can act on all of them.",
          tradeoff:
            "The most common bulk job, refunding everything inside the window, becomes 31 clicks. A cap that protects money also removes the batch work the queue exists for.",
          html: shell(
            "Refunds",
            `<div class="page pf">
  ${phead("Refunds", "31 orders waiting for a decision. Choose up to 20 at a time.", "", { crumb: trail("Home", "Orders", "Refunds") })}
  ${section("", `<table class="dt dense">
    <thead><tr><th class="check"></th><th scope="col">Order</th><th scope="col">Customer</th><th scope="col">Asked</th><th scope="col" class="num">Amount</th><th scope="col"></th></tr></thead>
    <tbody>
      ${[
        ["SO-1042", "Maria Garcia", "6 days ago", MONEY.refund],
        ["SO-1041", "Tom Becker", "11 days ago", MONEY.refund],
        ["SO-1039", "Elin Lindqvist", "163 days ago", MONEY.refund],
        ["SO-1036", "Ade Okafor", "181 days ago", MONEY.refund],
      ]
        .map(
          ([no, who, when, amt], i) => `<tr${i === 0 ? ' class="is-sel"' : ""}>
        <td class="check"><input type="checkbox" ${i === 0 ? "checked" : ""} aria-label="Select order ${no}"></td>
        <td><span class="code">${no}</span></td><td>${who}</td><td class="muted">${when}</td><td class="num">${amt}</td>
        <td class="num"><button class="btn xs">Refund</button></td>
      </tr>`,
        )
        .join("")}
    </tbody>
  </table>`, { flush: true })}
  <div class="btnrow end"><button class="btn primary">Refund 1 order</button></div>
</div>`,
            "Orders",
          ),
        },
        {
          name: "Bulk bar that replaces the toolbar",
          rationale:
            "While anything is selected, the toolbar is replaced by a bulk bar. The selection is the only thing the page offers, so the reader cannot act on a stale table.",
          tradeoff:
            "The layout shifts under the reader, and a search box they wanted to refine with disappears mid-decision. Widely used, and widely disliked for the jump.",
          html: shell(
            "Refunds",
            `<div class="page pf">
  ${phead("Refunds", "31 orders waiting for a decision.", "", { crumb: trail("Home", "Orders", "Refunds") })}
  ${toolbar({ search: "", placeholder: "Search by order or customer", filters: ["Any age"] })}
  ${section(
    "",
    `<table class="dt dense">
    <thead><tr><th class="check"><input type="checkbox" checked aria-label="Select all on this page"></th><th scope="col">Order</th><th scope="col">Customer</th><th scope="col" class="num">Amount</th></tr></thead>
    <tbody>
      ${[
        ["SO-1042", "Maria Garcia", MONEY.order],
        ["SO-1041", "Tom Becker", MONEY.refund],
        ["SO-1039", "Elin Lindqvist", MONEY.refund],
      ]
        .map(([no, who, amt]) => `<tr class="is-sel"><td class="check"><input type="checkbox" checked aria-label="Select order ${no}"></td><td><span class="code">${no}</span></td><td>${who}</td><td class="num">${amt}</td></tr>`)
        .join("")}
    </tbody>
  </table>`,
    { flush: true },
  )}
  <div class="section" style="border-color:var(--ring);box-shadow:0 0 0 1px var(--ring)">
    <div class="body">
      <div class="btnrow between">
        <span style="font-size:12.5px"><b>3 selected</b> · EUR 215.00 in total</span>
        <span class="btnrow"><button class="btn sm ghost">Clear</button><button class="btn sm">Refund in full</button><button class="btn primary sm">Refund these 3</button></span>
      </div>
    </div>
  </div>
</div>`,
            "Orders",
          ),
        },
        {
          name: "Every row carries its own command",
          rationale:
            "No selection at all. Each row has the one action that applies to it, with its own confirmation. The queue becomes a list of decisions rather than a list of things.",
          tradeoff:
            "No batch work at all, which is the whole point of a queue. Acceptable when the batch is rare and each decision needs different information.",
          html: shell(
            "Late payments",
            `<div class="page pf">
  ${phead("Late payments", "Orders where the money has not arrived. Each one needs a person.", "", { crumb: trail("Home", "Orders", "Late Payments") })}
  ${section(
    "",
    `<div class="rlist">
      ${recordRow({ title: "SO-1042", sub: `${ORDER.customer} · ${ORDER.company}`, state: { label: "Awaiting payment", tone: "caution" }, fig: MONEY.order, figSub: "authorised 6 days ago", actions: '<button class="btn sm">Send reminder</button><button class="btn sm icon" aria-label="More for order SO-1042">⋯</button>', lead: "caution" })}
      ${recordRow({ title: "SO-1040", sub: "Elin Lindqvist · Lindqvist Studio", state: { label: "Awaiting payment", tone: "caution" }, fig: "EUR 64.50", figSub: "authorised 3 days ago", actions: '<button class="btn sm">Send reminder</button><button class="btn sm icon" aria-label="More for order SO-1040">⋯</button>', lead: "caution" })}
      ${recordRow({ title: "SO-1037", sub: "Tom Becker · Becker Bouw", state: { label: "Failed", tone: "destructive" }, fig: MONEY.refund, figSub: "the bank refused it", actions: '<button class="btn sm">Release the stock</button><button class="btn sm icon" aria-label="More for order SO-1037">⋯</button>', lead: "destructive" })}
    </div>`,
  )}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Grouped by what the row is",
          reference: "Atlassian",
          rationale:
            "The queue is grouped into priority tiers rather than one ordered list: money at risk, refunds closing, everything else. The reader takes the top group and stops if it is empty.",
          tradeoff:
            "Groups need a stated ordering and someone has to decide it. Atlassian's own advice is that several simple queues beat one complex one, which argues for separate routes rather than groups on one page.",
          html: shell(
            "Refunds",
            `<div class="page pf">
  ${phead("Refunds", "31 open. Grouped by what happens if you wait.", "", { crumb: trail("Home", "Orders", "Refunds") })}
  ${section(
    "Window closes this week",
    `<div class="rlist">
      ${recordRow({ title: "SO-1036", sub: "Ade Okafor · Oak desk lamp", state: { label: "3 days left", tone: "caution" }, fig: MONEY.refund, actions: '<button class="btn sm primary">Decide now</button>' })}
      ${recordRow({ title: "SO-1041", sub: "Tom Becker · Oak desk lamp", state: { label: "5 days left", tone: "caution" }, fig: MONEY.refund, actions: '<button class="btn sm primary">Decide now</button>' })}
    </div>`,
    { acts: '<span class="badge caution">2</span>' },
  )}
  ${section(
    "Already outside the window",
    `<div class="rlist">
      ${recordRow({ title: "SO-1031", sub: "Tom Becker · asked 214 days ago", state: { label: "Window closed", tone: "destructive" }, fig: MONEY.refund, actions: '<button class="btn sm">Offer credit</button>', lead: "destructive" })}
    </div>`,
    { desc: "This payment method cannot refund after 180 days. Offer credit, or record a transfer Acme Supply makes itself.", acts: '<span class="badge destructive">5</span>' },
  )}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Play mode, one decision per screen",
          reference: "Zendesk",
          rationale:
            "Zendesk's play mode. The queue becomes one record at a time with Decide and Skip beside it and the next one already named. Each refund gets full attention, and the reader cannot half-read a row.",
          tradeoff:
            "One at a time is slow for thirty identical refunds, and the batch these queues exist for disappears. Prefer it when each decision needs different information, never for uniform work.",
          html: shell(
            "Refunds",
            `<div class="page pf">
  ${phead("Refunds · 4 of 31", "One decision at a time. Skip what needs somebody else.", "", { crumb: trail("Home", "Orders", "Refunds") })}
  ${progress(13)}
  <div class="pf-play">
    ${section(
      "Order SO-1042",
      `<div class="stack">
        ${dl([["Customer", "Maria Garcia · maria@garcia-interiors.example"], ["Company", "Garcia Interiors"], ["Asked", "6 days ago"], ["Amount", "EUR 45.00"], ["Refund window", "174 days left"]], { stacked: true })}
        <div class="btnrow"><button class="btn primary">Refund EUR 45.00</button><button class="btn">Offer credit</button><button class="btn ghost">Skip</button></div>
      </div>`,
      { acts: '<span class="badge info">Open</span>' },
    )}
    ${section(
      "Next",
      `<div class="rlist">
        ${recordRow({ title: "SO-1041", sub: "Tom Becker · EUR 45.00" })}
        ${recordRow({ title: "SO-1039", sub: "Asked 163 days ago · 17 days left", state: { label: "Closing", tone: "caution" } })}
      </div>`,
      { desc: "The two behind this one, soonest window first." },
    )}
  </div>
</div>`,
            "Orders",
          ),
        },
        {
          name: "A table with a clock column",
          reference: "Jira Service Management",
          rationale:
            "The queue sorted by the commitment clock, with three states: fine, closing, closed. This is Jira Service Management's shape, and it makes the ordering self-explanatory.",
          tradeoff:
            "The clock is only meaningful where something expires. A refunds table that holds the deadline but does not show it leaves the window invisible on the page.",
          html: shell(
            "Refunds",
            `<div class="page pf">
  ${phead("Refunds", "Sorted by how long you have left, soonest first.", "", { crumb: trail("Home", "Orders", "Refunds") })}
  ${toolbar({ views: [{ label: "All 31", on: true }, "Closing 5", "Closed 8"], search: null })}
  ${section("", `<table class="dt">
    <thead><tr><th class="check"><input type="checkbox" aria-label="Select all refunds"></th><th scope="col">Order</th><th scope="col">Customer</th><th scope="col" class="num">Amount</th><th scope="col" class="sortable">Time left <span class="dir">▾</span></th><th scope="col">State</th></tr></thead>
    <tbody>
      ${[
        ["SO-1031", "Tom Becker", MONEY.refund, "−34 days", "Closed", "destructive"],
        ["SO-1036", "Ade Okafor", MONEY.refund, "−1 day", "Closed", "destructive"],
        ["SO-1041", "Tom Becker", MONEY.refund, "5 days", "Closing", "caution"],
        ["SO-1039", "Elin Lindqvist", MONEY.refund, "17 days", "Open", "neutral"],
        ["SO-1042", "Maria Garcia", MONEY.refund, "174 days", "Open", "neutral"],
      ]
        .map(
          ([no, who, amt, left, st, tone]) => `<tr>
        <td class="check"><input type="checkbox" aria-label="Select order ${no}"></td>
        <td><span class="code">${no}</span><br><small class="muted">Oak desk lamp</small></td>
        <td>${who}</td><td class="num">${amt}</td>
        <td class="num nowrap">${left}</td><td>${badgeRaw(st, tone, "outline")}</td>
      </tr>`,
        )
        .join("")}
    </tbody>
  </table>`, { flush: true })}
  ${pager(1, 2, 1, 25, 31)}
</div>`,
            "Orders",
          ),
        },
      ],
    },
    // ---------------------------------------------------------------- 4
    {
      id: "frame-record",
      title: "The record page",
      floorplan: "entity-page",
      verdict: "Summary with sections and history in the aside stays the pick: what defines the record runs down the main column while history supports it from the side. The Linear-style properties rail is the runner-up; prefer it when the aside must carry editable values rather than history. Never ship the facts-in-header variant: a dense header pushes every command below the fold on a phone and fights the trail for space.",
      why: "One record, and everything done to it. The frame carries a summary, at most three sections and an aside. The argument is about <b>division</b>: tabs against stacked sections, and what earns the aside.",
      variants: [
        {
          name: "Summary, sections, aside for history",
          pick: true,
          reference: "Shopify",
          rationale:
            "What defines the record runs down the main column in at most three sections. History, which supports but does not define, goes in a narrower aside. This is the proven shape and the one Shopify's details template describes.",
          tradeoff:
            "Below roughly 1000 pixels the aside stacks under the sections, so the history lands after the actions. Acceptable; the order is right either way.",
          html: shell(
            ORDER.number,
            `<div class="page pf">
  ${phead(`${ORDER.number} ${badgeRaw("Paid", "positive")}`, `Placed ${ORDER.placed} by ${ORDER.company}.`, '<button class="btn sm">Resend the confirmation</button><button class="btn sm">Refund</button><button class="btn sm primary">Message the customer</button>', {
    crumb: trail("Home", "Orders", ORDER.number),
  })}
  <div class="pf-split">
    <div class="stack">
      ${section("The customer", dl([["Name", ORDER.customer], ["Email", `<span class="copyable">${ORDER.email}<button aria-label="Copy the customer email">⧉</button></span>`], ["Phone", "Not given"], ["Country", "Netherlands"]]))}
      ${section(
        "What was ordered",
        `<div class="stmt">
          <div class="line"><span>Oak desk lamp, 2 pcs<span class="sub">LMP-OAK-01</span></span><span class="fig">${MONEY.lineTotal}</span></div>
          <div class="line"><span>Shipping<span class="sub">Tracked, 2 to 3 working days</span></span><span class="fig">${MONEY.shipping}</span></div>
          <div class="line"><span>Pallet handling<span class="sub">Stacked and wrapped</span></span><span class="fig">EUR 30.00</span></div>
          <div class="grand"><span>Paid by the customer</span><span class="fig">${MONEY.order}</span></div>
          <div class="line" style="padding-top:8px"><span class="muted">The provider holds the payment for Acme Supply until its next payout.</span></div>
        </div>`,
      )}
    </div>
    <div class="stack">
      ${section(
        "What happened",
        `<div class="tl">
          ${`<div class="tlrow"><span class="rail"><span class="node positive"></span><span class="thread"></span></span><span class="tx"><b>Paid</b><small>8 Oct 2026, 09:34 · Card</small></span></div>`}
          ${`<div class="tlrow"><span class="rail"><span class="node"></span><span class="thread"></span></span><span class="tx"><b>Confirmation sent</b><small>8 Oct 2026, 09:34 · System</small></span></div>`}
          ${`<div class="tlrow"><span class="rail"><span class="node"></span></span><span class="tx"><b>Order placed</b><small>8 Oct 2026, 09:32 · System</small></span></div>`}
        </div>`,
      )}
    </div>
  </div>
</div>`,
            "Orders",
          ),
        },
        {
          name: "Four tabs over the same sections",
          reference: "GOV.UK",
          rationale:
            "When a record has more facets than three sections allow, tabs divide it. The active tab is in the URL, so a link carries it.",
          tradeoff:
            "The reader cannot see two facets at once, and the tab count grows with every new thing the back office adds. Carbon and GOV.UK both cap tabs at about six for this reason.",
          html: shell(
            "Oak desk lamp",
            `<div class="page pf">
  ${phead(`${PRODUCT.name} ${badgeRaw("Active", "positive")}`, "What this product is, and the SKU its lines carry.", '<button class="btn sm">Pause selling</button><button class="btn sm subtle-danger">Close for good</button>', {
    crumb: trail("Home", "Products", PRODUCT.name),
  })}
  ${tabs(["Pricing", "Stock", "Returns", "Details"], 3)}
  ${section(
    "Details",
    `<div class="stack">
      ${dl([["Units per pack", "1"], ["Stock", "412 in Amsterdam"], ["SKU", `<span class="copyable"><span class="code">LMP-OAK-01</span><button aria-label="Copy the SKU">⧉</button></span>`]])}
      <hr class="hr">
      ${`<div class="stack sm"><span class="lab" style="font-size:12.5px;font-weight:500">Name</span>${input("Oak desk lamp", { readonly: false })}${`<span class="help muted" style="font-size:11.5px">Customers see this on the storefront and on their confirmation.</span>`}</div>`}
      ${`<div class="stack sm"><span class="lab" style="font-size:12.5px;font-weight:500">Description <span class="opt muted" style="font-weight:400">(optional)</span></span><textarea class="ta">Solid oak, linen shade, 40 cm tall.</textarea></div>`}
      <div class="btnrow end"><button class="btn primary">Save</button></div>
    </div>`,
  )}
</div>`,
            "Products",
          ),
        },
        {
          name: "One page, headed sections, no tabs",
          reference: "GOV.UK",
          rationale:
            "GOV.UK names this as the alternative to tabs: keep everything on one page separated by headings, and let the reader scan down. No state to lose, nothing to remember.",
          tradeoff:
            "A record with six facets becomes a long page and the reader scrolls past the third one. The three-section ceiling is what keeps this honest.",
          html: shell(
            DELIVERY.name,
            `<div class="page pf">
  ${phead(`${DELIVERY.name} ${badgeRaw("Scheduled", "info")}`, `${DELIVERY.date}, ${DELIVERY.window} · ${DELIVERY.place}`, '<button class="btn sm">Reschedule</button><button class="btn primary sm">Add a line</button>', {
    crumb: trail("Home", "Orders", DELIVERY.name),
  })}
  ${section("When and where", dl([["Date", `${DELIVERY.date}, ${DELIVERY.window}`], ["Warehouse", `${DELIVERY.place}, ${DELIVERY.capacity}`], ["Time zone", "Europe/Amsterdam"]]))}
  ${section("What is on the manifest", `<table class="dt"><thead><tr><th scope="col">Product</th><th scope="col">Pallets</th><th scope="col" class="num">Price</th></tr></thead><tbody><tr><td><b>Oak desk lamp</b><br><small class="muted">LMP-OAK-01</small></td><td>32 of 40</td><td class="num">${MONEY.lamp}</td></tr><tr><td><b>Steel shelf</b><br><small class="muted">SHF-STL-02</small></td><td>Fully loaded</td><td class="num">EUR 60.00</td></tr></tbody></table>`, { flush: true })}
  ${section("Money so far", `<div class="stmt"><div class="line"><span>Product sales</span><span class="fig">EUR 54,180.00</span></div><div class="line"><span>Shipping fees kept by you</span><span class="fig">EUR 6,020.00</span></div><div class="sub-total"><span>To settle on 4 Nov</span><span class="fig">EUR 57,506.20</span></div></div>`)}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Header carries the facts, sections carry the commands",
          rationale:
            "The record's own values sit in the header area as a definition list, and the sections below hold only what can be done. The page separates what the record is from what it can do.",
          tradeoff:
            "A dense header pushes the commands below the fold on a phone, and it competes with the trail for vertical space.",
          html: shell(
            ORDER.number,
            `<div class="page pf">
  ${trail("Home", "Orders", ORDER.number)}
  <div class="phead" style="align-items:flex-start">
    <div style="min-width:0">
      <h1>${ORDER.number} ${badgeRaw("Paid", "positive")}</h1>
      <p class="desc">${ORDER.customer} · ${ORDER.company} · ${ORDER.placed}</p>
      <div style="margin-top:10px;max-width:420px">${dl([["Paid", MONEY.order], ["Lines", "3, all confirmed"], ["Method", "Card"], ["Refunds", "None"]])}</div>
    </div>
    <div class="acts" style="flex-direction:column;align-items:stretch;gap:6px">
      <button class="btn primary">Message the customer</button>
      <button class="btn">Resend the confirmation</button>
      <button class="btn">Refund</button>
      <button class="btn ghost">More ▾</button>
    </div>
  </div>
  ${section("Lines", `<div class="rlist">${recordRow({ title: "Oak desk lamp", sub: "LMP-OAK-01 · one unit", state: { label: "Confirmed", tone: "positive" }, actions: '<button class="btn sm">Cancel</button>' })}${recordRow({ title: "Oak desk lamp", sub: "LMP-OAK-01 · one unit", state: { label: "Confirmed", tone: "positive" }, actions: '<button class="btn sm">Cancel</button>' })}</div>`)}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Timeline as the page, record as the aside",
          rationale:
            "For a record whose main interest is what happened to it, the history is the main column and the record's own values support it from the side.",
          tradeoff:
            "Wrong for most records. An order is mostly its facts; an audit trail or a collection record is mostly its history, and the shape has to follow which.",
          html: shell(
            "Collection",
            `<div class="page pf">
  ${phead("Maria Garcia", `Collected at the pickup counter at 10:41 on ${DELIVERY.date}.`, '<button class="btn sm">Undo this collection</button>', {
    crumb: trail("Home", "Orders", ORDER.number, "Collection"),
  })}
  <div class="pf-split">
    <div class="stack">
      ${section(
        "What happened",
        `<div class="tl">
          ${timelineEntry("Collected at the pickup counter", "10:41", "Chris Novak", "positive")}
          ${timelineEntry("Barcode read at dock 1", "10:41", "Chris Novak")}
          ${timelineEntry("Two staff had this order open", "10:40 · 10:41", "Chris Novak, Jordan Lee", "caution")}
          ${timelineEntry("The connection dropped", "10:10 → 10:40", "System", "caution")}
          ${timelineEntry("Confirmation sent", "8 Oct 2026, 09:34", "System")}
        </div>`,
      )}
    </div>
    <div class="stack">
      ${section("The order", dl([["Product", "Oak desk lamp"], ["Barcode", `<span class="code">PKG-0C893968A2</span>`], ["Order", ORDER.number], ["Name on order", "Maria Garcia"]], { stacked: true }))}
    </div>
  </div>
</div>`,
            "Orders",
          ),
        },
        {
          name: "Editable properties in the rail",
          reference: "Linear",
          rationale:
            "Linear's issue shape. The record reads down the main column while every editable property sits in the right rail, changed where it is shown. No Edit mode and no second page for one value.",
          tradeoff:
            "Every property needs its own save and its own failure state, so five quick edits are five round trips. Wrong where a change must be reviewed whole before anything is written.",
          html: shell(
            ORDER.number,
            `<div class="page pf">
  ${phead(`${ORDER.number} ${badgeRaw("Paid", "positive")}`, `Placed ${ORDER.placed} by ${ORDER.company}.`, '<button class="btn sm">Resend the confirmation</button><button class="btn primary sm">Refund</button>', { crumb: trail("Home", "Orders", ORDER.number) })}
  <div class="pf-split">
    <div class="stack">
      ${section("The customer", dl([["Name", ORDER.customer], ["Email", ORDER.email], ["Country", "Netherlands"]]))}
      ${section("What was ordered", `<div class="stmt"><div class="line"><span>Oak desk lamp, 2 pcs<span class="sub">LMP-OAK-01</span></span><span class="fig">EUR 90.00</span></div><div class="line"><span>Shipping</span><span class="fig">EUR 5.00</span></div><div class="line"><span>Pallet handling</span><span class="fig">EUR 30.00</span></div><div class="grand"><span>Paid by the customer</span><span class="fig">EUR 125.00</span></div></div>`)}
    </div>
    <div class="stack">
      ${section("Properties", `<div class="form">${field("Owner", '<select class="sel"><option>Alex Morgan</option><option selected>Priya Shah</option><option>Jordan Lee</option></select>')}${field("Follow-up", '<select class="sel"><option>No answer needed</option><option selected>Calling back</option></select>')}${field("Customer note", input("Called 8 Oct, no answer"), { optional: true, help: "Only Acme Supply sees this." })}<button class="btn primary sm">Save properties</button></div>`)}
    </div>
  </div>
</div>`,
            "Orders",
          ),
        },
        {
          name: "Record with its own sub-navigation",
          rationale:
            "Where a record genuinely has six or more facets, tabs become a side navigation of links, and the current one is marked. More room for labels, and it survives a phone.",
          tradeoff:
            "Takes horizontal space that a table would rather have, and a reader cannot see what is on the other pages at all.",
          html: shell(
            DELIVERY.name,
            `<div class="page pf">
  ${trail("Home", "Orders", DELIVERY.name, "Schedule")}
  ${phead(`${DELIVERY.name} ${badgeRaw("Scheduled", "info")}`, `${DELIVERY.date}, ${DELIVERY.window} · ${DELIVERY.place}`, '<button class="btn sm">Reschedule</button><button class="btn primary sm">Add a line</button>')}
  <div class="pf-withnav">
  <nav class="pf-subnav" aria-label="Delivery sections">
    <span class="cap">The delivery</span>
    <a href="#">Overview</a><a href="#">Details</a><a href="#">Manifest</a><a href="#" aria-current="page">Schedule</a>
    <span class="cap">The day</span>
    <a href="#">Dispatch</a><a href="#">Packing</a><a href="#">Questions</a>
    <span class="cap">Money</span>
    <a href="#">Orders</a><a href="#">Costs</a>
  </nav>
  <div class="pf-stack">
    ${section("Lines", `<table class="dt"><thead><tr><th scope="col">Product</th><th scope="col">Pallets</th><th scope="col" class="num">Price</th><th scope="col">State</th><th scope="col"></th></tr></thead><tbody><tr><td><b>Oak desk lamp</b></td><td class="tnum">32 of 40</td><td class="num">${MONEY.lamp}</td><td>${badgeRaw("Active", "positive", "outline")}</td><td class="num"><button class="btn xs">Edit</button></td></tr><tr><td><b>Steel shelf</b></td><td class="tnum">40 of 40</td><td class="num">EUR 60.00</td><td>${badgeRaw("Fully loaded", "caution", "outline")}</td><td class="num"><button class="btn xs">Edit</button></td></tr></tbody></table>`, { flush: true, desc: "" })}
  </div>
  </div>
</div>`,
            "Orders",
          ),
        },
      ],
    },
    // ---------------------------------------------------------------- 5
    {
      id: "frame-form",
      title: "The form page",
      floorplan: "form-page",
      verdict: "One section, one column, Cancel beside Save stays the pick: a single command reads as a list of questions with one place to submit and one to leave. The GOV.UK one-question-per-screen flow is the runner-up; prefer it when each answer changes the next question and nothing may be skipped. Never ship the stepper for creating a product: three steps for work that fits one page is one step too many.",
      why: "Take one command's input. New-record pages are often <b>inconsistent</b>: one wraps its fields in a section with a left label column while another draws bare fields with no box and no Cancel. Both are this frame.",
      variants: [
        {
          name: "One section, one column of fields, Cancel beside Save",
          pick: true,
          rationale:
            "One command, one column, one place to submit and one to leave. The section is the only box, and the field labels sit above their controls so the column reads as a list of questions.",
          tradeoff:
            "A long form makes a long page. Grouping into several labelled blocks keeps it scannable, at the cost of a taller page.",
          html: shell(
            "New product",
            `<div class="page pf pf-narrow">
  ${phead("New product", "Start with a name. Everything else can wait.", "", { crumb: trail("Home", "Products", "New product") })}
  ${section(
    "",
    `<div class="form">
      ${field("Name", input(""), { help: "Customers see this on the storefront and on their confirmation.", required: true })}
      ${field("Description", '<textarea class="ta"></textarea>', { help: "You can write it with help on the product's details.", optional: true })}
      ${field("Category", '<select class="sel"><option>Choose a category</option><option>Furniture</option><option>Lighting</option></select>', { required: true })}
      ${field("Price", input("", { placeholder: "45.00" }), { help: "EUR, including VAT.", required: true })}
      ${field("SKU", input("", { placeholder: "LMP-OAK-01" }), { help: "Unique across the catalogue.", required: true })}
      <div class="btnrow end" style="border-top:1px solid var(--border);padding-top:12px">
        <button class="btn">Cancel</button><button class="btn primary">Create product</button>
      </div>
    </div>`,
  )}
</div>`,
            "Products",
          ),
        },
        {
          name: "Form section with the label in the left column",
          rationale:
            "The labelled-block shape. Each block names itself on the left and holds its fields on the right, so several blocks read as a form with structure rather than a column of questions.",
          tradeoff:
            "The left column is about 150 pixels, which wraps the explanatory line to four words per line. The same content stacked would read better.",
          html: shell(
            "New product",
            `<div class="page pf pf-narrow">
  ${phead("New product", "Start with a name.", "", { crumb: trail("Home", "Products", "New product") })}
  ${section(
    "",
    `<div class="stack lg">
      ${formSection("The product", "The name shows on the storefront; the SKU identifies the stock.", field("Name", input(""), { help: "Customers see this on the storefront and on their confirmation." }) + field("SKU", input("", { placeholder: "LMP-OAK-01" }), { optional: true }))}
      ${`<div class="hr"></div>`}
      ${formSection("Pricing", "The price is what the customer pays; the compare-at price must sit above it.", field("Price", input("", { placeholder: "45.00" })) + field("Compare-at price", input("", { placeholder: "59.00" }), { help: "EUR, including VAT.", optional: true }))}
      <div class="btnrow end" style="border-top:1px solid var(--border);padding-top:12px">
        <button class="btn">Cancel</button><button class="btn primary">Create product</button>
      </div>
    </div>`,
  )}
</div>`,
            "Products",
          ),
        },
        {
          name: "Stacked blocks with the title above",
          rationale:
            "The same labelled blocks with the title above its fields rather than beside them. The label gets the full width, so the explanatory line reads at a normal measure.",
          tradeoff:
            "A longer page, and the reader loses the vertical alignment that made scanning between fields easy.",
          html: shell(
            "New product",
            `<div class="page pf pf-narrow">
  ${phead("New product", "Start with a name.", "", { crumb: trail("Home", "Products", "New product") })}
  ${section(
    "",
    `<div class="stack lg">
      ${formSection("The product", "The name shows on the storefront; the SKU identifies the stock.", field("Name", input("")), { stacked: true })}
      ${`<div class="hr"></div>`}
      ${formSection("Pricing", "The price is what the customer pays.", field("Price", input("", { placeholder: "45.00" })) + field("Compare-at price", input("", { placeholder: "59.00" })), { stacked: true })}
      ${`<div class="hr"></div>`}
      ${formSection("Stock", "Which warehouse holds it.", field("Warehouse", '<select class="sel"><option>Choose a warehouse</option><option>Amsterdam warehouse</option></select>'), { stacked: true })}
      <div class="btnrow end" style="border-top:1px solid var(--border);padding-top:12px">
        <button class="btn">Cancel</button><button class="btn primary">Create product</button>
      </div>
    </div>`,
  )}
</div>`,
            "Products",
          ),
        },
        {
          name: "Two columns on a wide screen",
          rationale:
            "Short fields sit side by side: price and compare-at price together, SKU and category together. One Save for the page rather than per block.",
          tradeoff:
            "A long amount or a long name does not fit half a column, so the layout forces some fields to be narrower than others. Two columns suit short fields on wide screens, as the editor page shows.",
          html: shell(
            "New product",
            `<div class="page pf">
  ${phead("New product", "Start with a name. Everything else can wait.", "", { crumb: trail("Home", "Products", "New product") })}
  ${section(
    "",
    `<div class="stack">
      <div class="form" style="display:grid;grid-template-columns:1fr 1fr;gap:14px 16px;max-width:620px">
        ${field("Name", input(""), { help: "Customers see this." })}
        ${field("Category", '<select class="sel"><option>Choose a category</option><option>Furniture</option></select>')}
        ${field("Price", input("", { placeholder: "45.00" }))}
        ${field("SKU", input("", { placeholder: "LMP-OAK-01" }))}
      </div>
      <div class="btnrow end" style="border-top:1px solid var(--border);padding-top:12px">
        <button class="btn">Cancel</button><button class="btn primary">Create product</button>
      </div>
    </div>`,
  )}
</div>`,
            "Products",
          ),
        },
        {
          name: "A stepper above one step's fields",
          reference: "Carbon",
          rationale:
            "A flow with more than three linear steps gets a stepper: The product, Then the price, Then publish. Each step validates before the next one opens.",
          tradeoff:
            "Carbon says a stepper is only for a linear flow of three or more steps, and not at all when the steps can be done in any order. Creating a product does not need three steps, so this is one step too many.",
          html: shell(
            "New product",
            `<div class="page pf pf-narrow">
  ${phead("New product", "Three steps. Two minutes, and you can stop after the first.", "", { crumb: trail("Home", "Products", "New product") })}
  <div class="steps" style="margin-bottom:18px">
    <span class="step now"><span class="n">1</span>The product</span><span class="step-sep"></span>
    <span class="step"><span class="n">2</span>The price</span><span class="step-sep"></span>
    <span class="step"><span class="n">3</span>Publish</span>
  </div>
  ${section(
    "The product",
    `<div class="form">
      ${field("Name", input(""), { required: true })}
      ${field("Category", '<select class="sel"><option>Choose a category</option><option>Furniture</option></select>', { required: true })}
      ${field("SKU", input("", { placeholder: "LMP-OAK-01" }), { required: true })}
      ${field("Price", input("", { placeholder: "45.00" }), { required: true })}
      <div class="btnrow end" style="border-top:1px solid var(--border);padding-top:12px">
        <button class="btn ghost" style="margin-right:auto">Save and close</button>
        <button class="btn">Back</button><button class="btn primary">Continue</button>
      </div>
    </div>`,
  )}
</div>`,
            "Products",
          ),
        },
        {
          name: "One question per screen",
          reference: "GOV.UK",
          rationale:
            "GOV.UK's one-thing-per-page shape. Each answer gets the whole screen, validates before the next opens, and the Back button is the browser's own. Nothing half-filled is lost to a section the reader skipped.",
          tradeoff:
            "Five screens for a form that fits one page feels slow to a returning reader, and the answers cannot be reviewed together until the final check. Reserve it for flows where each answer changes the next question.",
          html: shell(
            "New product",
            `<div class="page pf pf-narrow">
  ${trail("Home", "Products", "New product")}
  ${progress(20)}
  <p class="muted" style="font-size:12px">Step 1 of 5</p>
  <h1 class="pf-bigq">What is the product called?</h1>
  ${section("", `<div class="form">${field("Name", input(""), { help: "Customers see this on the storefront and on their confirmation.", required: true })}<div class="btnrow"><button class="btn primary">Continue</button><button class="btn ghost">Back</button></div></div>`)}
</div>`,
            "Products",
          ),
        },
        {
          name: "Section per action, one Save at the foot",
          rationale:
            "Each block is its own section with its own title and its own commands, and a single sticky foot carries one Save for the whole page. The reader sees the page's total work before committing any of it.",
          tradeoff:
            "One Save means a partial failure loses the lot, and a reader who wants to save the name and leave the price cannot. Two Saves on one screen is the worse version of this problem.",
          html: shell(
            "New product",
            `<div class="page pf pf-narrow">
  ${phead("New product", "Start with a name. Everything else can wait.", "", { crumb: trail("Home", "Products", "New product") })}
  <div class="stack">
    ${section("The product", `<div class="form">${field("Name", input(""), { help: "Customers see this." })}${field("Description", '<textarea class="ta"></textarea>', { optional: true })}</div>`)}
    ${section("Pricing", `<div class="form" style="display:grid;grid-template-columns:1fr 1fr;gap:14px">${field("Price", input("", { placeholder: "45.00" }))}${field("Compare-at price", input("", { placeholder: "59.00" }))}</div>`, { desc: "EUR, including VAT." })}
    ${section("Stock", `<div class="form">${field("Warehouse", '<select class="sel"><option>Choose a warehouse</option><option>Amsterdam warehouse</option></select>')}</div>`)}
    <div class="btnrow end">
      <button class="btn">Cancel</button><button class="btn primary">Create product</button>
    </div>
  </div>
</div>`,
            "Products",
          ),
        },
      ],
    },
    // ---------------------------------------------------------------- 6
    {
      id: "frame-report",
      title: "The report page",
      floorplan: "report-page",
      verdict: "The chevron pair with the period as the heading stays the pick: a reader cannot mistake a chevron for a tab, and the dropdown still allows a jump across months. The Shopify-style cards with sparklines are the runner-up; prefer them mid-month when the question is trend rather than settlement. Never ship the two unlabelled month buttons: nothing said which was previous and which was next, and that was the ambiguity.",
      why: "Read figures over one period. A statements page can put the period in the <code>h1</code> and offer two outline buttons, <b>August 2026</b> and <b>October 2026</b>, either side of it. Nothing says which is previous and which is next.",
      variants: [
        {
          name: "Chevron pair with the period as the heading",
          pick: true,
          rationale:
            "The period is the page heading, with an unambiguous chevron on each side to walk consecutive months and a dropdown to jump. A reader cannot mistake a chevron for a tab.",
          tradeoff:
            "Walking months one at a time is slow when comparing a quarter, which is why the dropdown stays.",
          html: shell(
            "Statements",
            `<div class="page pf">
  ${trail("Home", "Reports", "Statements")}
  <div class="phead">
    <div class="btnrow">
      <button class="btn sm icon" aria-label="Previous month">‹</button>
      <div>
        <h1>September 2026</h1>
        <p class="desc">Every euro of the month under the kind it is.</p>
      </div>
      <button class="btn sm icon" aria-label="Next month">›</button>
    </div>
    <div class="acts">
      <select class="fsel"><option>August 2026</option><option selected>September 2026</option><option>October 2026</option><option>November 2026</option></select>
      <button class="btn sm">Download</button>
    </div>
  </div>
  ${statementSection("September 2026")}
  ${section("By warehouse", `<table class="dt"><thead><tr><th scope="col">Warehouse</th><th scope="col" class="num">Net</th></tr></thead><tbody><tr><td>Amsterdam warehouse</td><td class="num">EUR 49,686.20</td></tr><tr><td>Rotterdam warehouse</td><td class="num">EUR 7,820.00</td></tr></tbody></table>`, { flush: true })}
</div>`,
            "Reports",
          ),
        },
        {
          name: "Period tabs across the top",
          reference: "GOV.UK",
          rationale:
            "Months as a segmented control above the content, with the current one pressed. GOV.UK's tabs example is exactly this for comparison periods.",
          tradeoff:
            "Three or four months fit; a year does not, and Carbon warns tabs are wrong where the reader must compare across groups. Horizontal overflow on a phone.",
          html: shell(
            "Statements",
            `<div class="page pf">
  ${phead("Statements, September 2026", "Every euro of the month under the kind it is.", "", { crumb: trail("Home", "Reports", "Statements") })}
  ${toolbar({ views: ["August 2026", { label: "September 2026", on: true }, "October 2026"], search: null })}
  ${statementSection("September 2026")}
</div>`,
            "Reports",
          ),
        },
        {
          name: "Dropdown with presets beside a typeable range",
          rationale:
            "A range control offering Last 30 days, This month, Last month, Custom, and a pair of typeable date fields. Nothing is hidden behind the calendar.",
          tradeoff:
            "Presets plus a range is two mechanisms on one control, and the preset that was used has to be shown afterwards or the reader loses track of the period.",
          html: shell(
            "Revenue",
            `<div class="page pf">
  ${phead("Revenue", "Every euro that moved, by the day it moved.", "", { crumb: trail("Home", "Reports", "Revenue") })}
  <div class="section">
    <div class="body">
      <div class="stack">
        ${segmented(["Last 7 days", "Last 30 days", "This month", "Custom"], 3)}
        <div style="display:grid;grid-template-columns:minmax(0,180px) minmax(0,180px) auto;gap:10px;align-items:end">
          ${field("From", input("09/09/2026", { cls: "num" }))}
          ${field("To", input("08/10/2026", { cls: "num" }))}
          <button class="btn">Apply</button>
        </div>
      </div>
    </div>
  </div>
  ${section("Daily", `<div class="stack sm"><div class="inline"><span style="font-size:12.5px">Sales per day, 9 Sep to 8 Oct</span><span class="badge" style="margin-left:auto">Peak 26 Sep, EUR 12,400.00</span></div><svg viewBox="0 0 600 90" style="width:100%;height:90px" role="img" aria-label="Sales per day over the period"><polyline points="0,70 40,66 80,72 120,50 160,44 200,30 240,34 280,20 320,26 360,16 400,22 440,58 480,66 520,64 560,68 600,66" fill="none" stroke="var(--foreground)" stroke-width="1.6"/></svg><div class="inline" style="justify-content:space-between;font-size:11px;color:var(--muted-foreground)"><span>9 Sep</span><span>24 Sep</span><span>8 Oct</span></div></div>`)}
</div>`,
            "Reports",
          ),
        },
        {
          name: "The two buttons, labelled",
          rationale:
            "Keep the two-button shape and make it legible: the pair reads <b>Previous · next</b> as one control around the period, which is the smallest change that removes the ambiguity.",
          tradeoff:
            "Still a month at a time, and the labels still compete with the heading for attention. Treats the symptom rather than the shape.",
          html: shell(
            "Statements",
            `<div class="page pf">
  ${trail("Home", "Reports", "Statements")}
  <div class="phead">
    <div>
      <h1>Statements <span class="muted" style="font-size:13px;font-weight:400">September 2026</span></h1>
      <p class="desc">Every euro of the month under the kind it is.</p>
    </div>
    <div class="acts">
      <div class="segmented" role="group" aria-label="Period">
        <button>← August 2026</button><button aria-pressed="true">September 2026</button><button>October 2026 →</button>
      </div>
      <button class="btn sm icon" aria-label="More options">⋯</button>
    </div>
  </div>
  ${statementSection("September 2026")}
</div>`,
            "Reports",
          ),
        },
        {
          name: "Report with the breakdown as tabs",
          rationale:
            "The statement is the report; By warehouse, By channel and By tax rate are tabs beneath it, so the top of the page is always the same shape regardless of which breakdown is chosen.",
          tradeoff:
            "The reader loses the statement when they want a breakdown, and the tabs have to deep-link.",
          html: shell(
            "Revenue",
            `<div class="page pf">
  ${phead("Revenue, September 2026", "Every euro that moved.", "", { crumb: trail("Home", "Reports", "Revenue") })}
  ${section("The month in total", `<div class="stmt"><div class="line"><span>Product sales</span><span class="fig">EUR 54,180.00</span></div><div class="line"><span>Shipping fees</span><span class="fig">EUR 6,020.00</span></div><div class="line"><span>Handling services</span><span class="fig">EUR 3,150.00</span></div><div class="sub-total"><span>Income</span><span class="fig">EUR 63,350.00</span></div><div class="line"><span>The provider fee<span class="sub">1.9% plus EUR 0.25</span></span><span class="fig">EUR -1,203.65</span></div><div class="grand"><span>Net for Acme Supply</span><span class="fig">EUR 62,146.35</span></div></div>`)}
  ${tabs(["By warehouse", "By channel", "By tax rate"], 0)}
  ${section("", `<table class="dt"><thead><tr><th scope="col">Warehouse</th><th scope="col" class="num">Income</th><th scope="col" class="num">Provider fee</th><th scope="col" class="num">Net</th></tr></thead><tbody><tr><td>Amsterdam warehouse</td><td class="num">EUR 54,000.00</td><td class="num">EUR -1,026.00</td><td class="num"><b>EUR 52,974.00</b></td></tr><tr><td>Rotterdam warehouse</td><td class="num">EUR 6,200.00</td><td class="num">EUR -117.80</td><td class="num"><b>EUR 6,082.20</b></td></tr><tr><td>Not tied to a warehouse<br><small class="muted">Services billed on their own</small></td><td class="num">EUR 3,150.00</td><td class="num">EUR -59.85</td><td class="num"><b>EUR 3,090.15</b></td></tr></tbody></table>`, { flush: true })}
</div>`,
            "Reports",
          ),
        },
        {
          name: "Cards with sparklines above the statement",
          reference: "Shopify",
          rationale:
            "Shopify's analytics shape. Three cards with sparklines name the trend before the statement names the total, so a dip is noticed before it is explained. The statement underneath keeps every euro accountable.",
          tradeoff:
            "Sparklines invite trend questions the monthly statement cannot answer, and three cards push the accountable total down. Prefer it mid-month; prefer the plain statement at settlement.",
          html: shell(
            "Revenue",
            `<div class="page pf">
  ${phead("Revenue, September 2026", "The trend first, then every euro under the kind it is.", "", { crumb: trail("Home", "Reports", "Revenue") })}
  ${tiles(
    tile("Product sales", "EUR 54,180", "Up 12% on August", '<svg viewBox="0 0 120 28" style="width:100%;height:28px;margin-top:6px" role="img" aria-label="Product sales rising through September"><polyline points="0,22 20,20 40,21 60,14 80,12 100,8 120,5" fill="none" stroke="var(--foreground)" stroke-width="1.6"/></svg>'),
    tile("Refunds", "EUR 1,550", "31 orders", '<svg viewBox="0 0 120 28" style="width:100%;height:28px;margin-top:6px" role="img" aria-label="Refunds flat through September"><polyline points="0,18 20,17 40,19 60,18 80,17 100,18 120,18" fill="none" stroke="var(--foreground)" stroke-width="1.6"/></svg>'),
    tile("Net for Acme Supply", "EUR 57,506", "After the provider fee", '<svg viewBox="0 0 120 28" style="width:100%;height:28px;margin-top:6px" role="img" aria-label="Net rising through September"><polyline points="0,20 20,19 40,17 60,13 80,12 100,9 120,7" fill="none" stroke="var(--foreground)" stroke-width="1.6"/></svg>'),
  )}
  ${statementSection("September 2026")}
</div>`,
            "Reports",
          ),
        },
        {
          name: "Report as a statement with no separate breakdown",
          rationale:
            "One statement and nothing else, because a statement that adds up top to bottom is the whole report. A monthly settlement page is usually close to this already.",
          tradeoff:
            "Every question beyond the total needs a new page. Fine for a monthly settlement, wrong for a revenue question during the month.",
          html: shell(
            "Statements",
            `<div class="page pf">
  ${phead("Statements", "Every euro of the month under the kind it is.", "", { crumb: trail("Home", "Reports", "Statements") })}
  <div class="btnrow" style="margin-bottom:12px"><button class="btn sm">← August 2026</button><button class="btn sm">October 2026 →</button></div>
  ${section("", `<div class="stmt"><div class="line"><span>Product sales<span class="sub">1,204 orders</span></span><span class="fig">EUR 54,180.00</span></div><div class="line"><span>Shipping fees customers paid<span class="sub">1,204 orders</span></span><span class="fig">EUR 6,020.00</span></div><div class="line"><span>Handling services<span class="sub">126 pallets</span></span><span class="fig">EUR 3,150.00</span></div><div class="sub-total"><span>Total income</span><span class="fig">EUR 63,350.00</span></div><div class="line"><span>The provider fee<span class="sub">1.9% plus EUR 0.25</span></span><span class="fig">EUR -1,203.65</span></div><div class="sub-total"><span>Total costs</span><span class="fig">EUR -1,203.65</span></div><div class="grand"><span>Net for Acme Supply</span><span class="fig">EUR 62,146.35</span></div><div class="line" style="padding-top:10px"><span class="muted">The platform subscription is invoiced separately and never taken from this money.</span></div></div>`)}
  ${section("By warehouse", `<table class="dt"><thead><tr><th scope="col">Warehouse</th><th scope="col" class="num">Net</th></tr></thead><tbody><tr><td>Amsterdam warehouse</td><td class="num">EUR 52,974.00</td></tr><tr><td>Rotterdam warehouse</td><td class="num">EUR 6,082.20</td></tr><tr><td>Not tied to a warehouse</td><td class="num">EUR 3,090.15</td></tr></tbody></table>`, { flush: true })}
</div>`,
            "Reports",
          ),
        },
      ],
    },
    // ---------------------------------------------------------------- 7
    {
      id: "frame-settings",
      title: "The settings home",
      floorplan: "settings-page",
      verdict: "Grouped links stay the pick: each area names what it holds, the page never grows a form, and thirty routes fit in a handful of sections. The Stripe-style left navigation is the runner-up; prefer it once areas gain enough depth to deserve their own tree. Never ship the frequency grouping: readers look for a thing, not for how often they change it.",
      why: "Find one setting among many areas. A settings home can carry a <b>whole tree</b>: thirty routes under <code>/settings</code>, and the home has to carry all of it.",
      variants: [
        {
          name: "Grouped links, one line each",
          pick: true,
          rationale:
            "Each area is a link with a line saying what it holds, grouped into a handful of sections. The reader knows the area before they click and the page never grows a form.",
          tradeoff:
            "Nothing states which areas are incomplete, so a new starter has to open each one. The home page's setup section already does this job.",
          html: shell(
            "Settings",
            `<div class="page pf">
  ${phead("Settings", "What Acme Supply runs on, and who can change it.", "", { crumb: trail("Home", "Settings") })}
  <div class="stack">
    ${section(
      "The company",
      `<div class="rlist">
        ${recordRow({ title: "General", sub: "Name, address, contact details and the time zone the whole back office works in.", actions: '<button class="btn sm">Open</button>' })}
        ${recordRow({ title: "Locations", sub: "2 places Acme Supply holds stock at.", actions: '<button class="btn sm">Open</button>' })}
        ${recordRow({ title: "Warehouses", sub: "2 warehouses with a dock plan.", actions: '<button class="btn sm">Open</button>' })}
        ${recordRow({ title: "Payments", sub: "The connected account the provider pays into.", state: { label: "Connected", tone: "positive" }, actions: '<button class="btn sm">Open</button>' })}
      </div>`,
    )}
    ${section(
      "Selling",
      `<div class="rlist">
        ${recordRow({ title: "Order form templates", sub: "What a customer fills in when they place an order.", actions: '<button class="btn sm">Open</button>' })}
        ${recordRow({ title: "Policies", sub: "The terms and the refund policy customers are shown.", actions: '<button class="btn sm">Open</button>' })}
        ${recordRow({ title: "Email", sub: "The sender name and address on every message.", actions: '<button class="btn sm">Open</button>' })}
      </div>`,
    )}
    ${section(
      "People and access",
      `<div class="rlist">
        ${recordRow({ title: "Team", sub: "5 people, 2 invitations outstanding.", actions: '<button class="btn sm">Open</button>' })}
        ${recordRow({ title: "Roles", sub: "4 custom roles and what each may do.", actions: '<button class="btn sm">Open</button>' })}
        ${recordRow({ title: "Groups", sub: "Warehouse groups a person is invited to at once.", actions: '<button class="btn sm">Open</button>' })}
        ${recordRow({ title: "Data imports", sub: "What was imported and what came of it.", actions: '<button class="btn sm">Open</button>' })}
        ${recordRow({ title: "Developers", sub: "Origins, webhooks and API keys.", actions: '<button class="btn sm">Open</button>' })}
      </div>`,
    )}
  </div>
</div>`,
            "Settings",
          ),
        },
        {
          name: "Cards with an icon and a state",
          rationale:
            "Each area as a card with its icon, its purpose and, where it matters, its state: Payments connected, Payments not connected. The reader sees what is broken without opening anything.",
          tradeoff:
            "Cards are boxes, and the design contract says a section is the only box and never nests. A grid of bordered cards on the settings home is that rule broken by twenty boxes.",
          html: shell(
            "Settings",
            `<div class="page pf">
  ${phead("Settings", "What Acme Supply runs on, and who can change it.", "", { crumb: trail("Home", "Settings") })}
  <div class="tiles" style="grid-template-columns:repeat(auto-fill,minmax(210px,1fr))">
    ${[
      ["General", "Name, address, contact details.", ""],
      ["Locations", "2 places you hold stock at.", ""],
      ["Warehouses", "2 warehouses with a dock plan.", ""],
      ["Payments", "The provider pays into NL91 ABNA 0417 1643.", "Connected"],
      ["Order form templates", "What a customer fills in.", ""],
      ["Policies", "Terms and refund policy.", ""],
      ["Email", "Sender name and address.", ""],
      ["Team", "5 people, 2 invitations out.", ""],
      ["Roles", "4 custom roles.", ""],
      ["Developers", "Origins, webhooks, keys.", ""],
    ]
      .map(
        ([nm, sub, state]) => `<div class="tile"><div class="lab"><b style="color:var(--foreground)">${nm}</b></div><div class="sub" style="margin:5px 0 9px;min-height:32px">${sub}</div>${
          state ? `<span class="badge positive">${state}</span>` : '<span class="muted" style="font-size:11.5px">Open</span>'
        }</div>`,
      )
      .join("")}
  </div>
</div>`,
            "Settings",
          ),
        },
        {
          name: "A list with a search box",
          rationale:
            "One flat list of every setting with a search box over it. Thirty routes become one searchable index, and the reader types what they are looking for.",
          tradeoff:
            "The grouping is lost, so a reader who knows the area has to read it to find the area, and the search has to know every setting name a reader might use.",
          html: shell(
            "Settings",
            `<div class="page pf">
  ${phead("Settings", "Every setting Acme Supply holds. Search by what it is called.", "", { crumb: trail("Home", "Settings") })}
  ${toolbar({ search: "", placeholder: "Search settings", right: '<span class="muted" style="font-size:12px">30 settings</span>' })}
  ${section(
    "",
    `<div class="rlist">
      ${recordRow({ title: "Bank account", sub: "Billing · Payout account", actions: '<button class="btn sm">Open</button>' })}
      ${recordRow({ title: "Shipping fee", sub: "Products · What a customer pays on top", actions: '<button class="btn sm">Open</button>' })}
      ${recordRow({ title: "Stock", sub: "Products · What each warehouse holds", actions: '<button class="btn sm">Open</button>' })}
      ${recordRow({ title: "Dock plan", sub: "Settings · Warehouses · Docks and counters", actions: '<button class="btn sm">Open</button>' })}
      ${recordRow({ title: "Email sender", sub: "Settings · Email", actions: '<button class="btn sm">Open</button>' })}
      ${recordRow({ title: "Refund policy", sub: "Settings · Policies", actions: '<button class="btn sm">Open</button>' })}
      ${recordRow({ title: "Roles", sub: "Settings · What each person may do", actions: '<button class="btn sm">Open</button>' })}
      ${recordRow({ title: "Time zone", sub: "Settings · General · Europe/Amsterdam", actions: '<button class="btn sm">Open</button>' })}
      ${recordRow({ title: "VAT rate", sub: "Settings · Taxes · Standard 21%, Reduced 9%", actions: '<button class="btn sm">Open</button>' })}
      ${recordRow({ title: "Webhooks", sub: "Settings · Developers", actions: '<button class="btn sm">Open</button>' })}
    </div>`,
  )}
</div>`,
            "Settings",
          ),
        },
        {
          name: "Grouped by how often it is changed",
          rationale:
            "A Daily, Monthly and Once section. The page states that a monthly task goes in a menu and a once-only setup belongs in settings, which is the rule the page is applying to itself.",
          tradeoff:
            "The grouping is about frequency rather than about the thing, so a reader looking for 'where is the dock plan' has to remember which bucket it is in.",
          html: shell(
            "Settings",
            `<div class="page pf">
  ${phead("Settings", "Grouped by how often each one is changed.", "", { crumb: trail("Home", "Settings") })}
  <div class="stack">
    ${section("Changed every day or every week", `<div class="rlist">${recordRow({ title: "Dock plan", sub: "Docks and counters for the warehouse.", actions: '<button class="btn sm">Open</button>' })}${recordRow({ title: "Packing guide", sub: "The order a dispatch happens in.", actions: '<button class="btn sm">Open</button>' })}${recordRow({ title: "Incidents", sub: "What happened at the docks and what was done.", actions: '<button class="btn sm">Open</button>' })}</div>`)}
    ${section("Changed every month", `<div class="rlist">${recordRow({ title: "Statements", sub: "What settled and what did not.", actions: '<button class="btn sm">Open</button>' })}${recordRow({ title: "Invoices", sub: "The platform subscription.", actions: '<button class="btn sm">Open</button>' })}${recordRow({ title: "Costs", sub: "What the platform charges and why.", actions: '<button class="btn sm">Open</button>' })}</div>`)}
    ${section("Changed once, or rarely", `<div class="rlist">${recordRow({ title: "Payments", sub: "The connected account the provider pays into.", state: { label: "Connected", tone: "positive" }, actions: '<button class="btn sm">Open</button>' })}${recordRow({ title: "Tax and VAT rates", sub: "Two rates, because goods and services are not the same.", actions: '<button class="btn sm">Open</button>' })}${recordRow({ title: "Team and roles", sub: "Who may do what.", actions: '<button class="btn sm">Open</button>' })}</div>`)}
  </div>
</div>`,
            "Settings",
          ),
        },
        {
          name: "Incomplete areas first, everything else beneath",
          rationale:
            "Anything not yet set sits at the top with the one command that fills it. The rest of the settings follow, so the page is also the setup checklist.",
          tradeoff:
            "The order changes as the reader completes setup, which makes the page feel unstable and makes a link to a settings area unreliable by position.",
          html: shell(
            "Settings",
            `<div class="page pf">
  ${phead("Settings", "Two things are not set up. Everything else is ready.", "", { crumb: trail("Home", "Settings") })}
  ${section(
    "Not set up",
    `<div class="alist">
      ${actionRow("No payment account connected", "Money cannot be taken until one is. Takes about five minutes.", "Connect", "⚠")}
      ${actionRow("No refunds policy published", "Customers are shown a refund policy at checkout. Yours is empty.", "Write one", "◷")}
    </div>`,
  )}
  ${section(
    "Everything else",
    `<div class="rlist">
      ${recordRow({ title: "General", sub: "Name, address, contact details, time zone.", actions: '<button class="btn sm">Open</button>' })}
      ${recordRow({ title: "Warehouses and locations", sub: "2 warehouses, 2 places.", actions: '<button class="btn sm">Open</button>' })}
      ${recordRow({ title: "Team and roles", sub: "5 people, 4 custom roles.", actions: '<button class="btn sm">Open</button>' })}
      ${recordRow({ title: "Email and policies", sub: "Sender details, terms, refund policy.", actions: '<button class="btn sm">Open</button>' })}
      ${recordRow({ title: "Developers and imports", sub: "Origins, webhooks, keys, import history.", actions: '<button class="btn sm">Open</button>' })}
    </div>`,
  )}
</div>`,
            "Settings",
          ),
        },
        {
          name: "Left navigation with the area on the right",
          reference: "Stripe",
          rationale:
            "Stripe's settings shape. The areas live in a left navigation and the chosen area opens beside it, so thirty routes become one tree the reader scans without leaving the page. The current area is always marked.",
          tradeoff:
            "An area's incompleteness is invisible until it is opened, and a phone has no room for the tree, so the navigation must collapse into the same grouped links the pick already draws.",
          html: shell(
            "Settings",
            `<div class="page pf">
  ${trail("Home", "Settings", "General")}
  ${phead("General", "Name, address, contact details and the time zone the whole back office works in.", '<button class="btn primary sm">Save</button>')}
  <div class="pf-withnav">
    <nav class="pf-subnav" aria-label="Settings areas">
      <span class="cap">The company</span>
      <a href="#" aria-current="page">General</a><a href="#">Locations</a><a href="#">Warehouses</a><a href="#">Payments</a>
      <span class="cap">Selling</span>
      <a href="#">Order form templates</a><a href="#">Policies</a><a href="#">Email</a>
      <span class="cap">People</span>
      <a href="#">Team</a><a href="#">Roles</a><a href="#">Developers</a>
    </nav>
    <div class="pf-stack">
      ${section("", `<div class="form">${field("Company name", input("Acme Supply"))}${field("Contact email", input("hello@acme-supply.example"))}${field("Time zone", '<select class="sel"><option selected>Europe/Amsterdam</option><option>Europe/Berlin</option></select>', { help: "Dispatch, payouts and reports all use this zone." })}</div>`)}
    </div>
  </div>
</div>`,
            "Settings",
          ),
        },
        {
          name: "A checklist of what is left, then a plain index",
          rationale:
            "The setup work and the reference work are separated: a checklist with verbs at the top, an index of every area underneath. The checklist disappears when it is done.",
          tradeoff:
            "Two structures on one page, and a reader who only wants the index scrolls past a checklist they have finished.",
          html: shell(
            "Settings",
            `<div class="page pf pf-narrow">
  ${phead("Settings", "Two steps left, then thirty settings.", "", { crumb: trail("Home", "Settings") })}
  ${section(
    "Finish setting up",
    `<div class="stack sm">
      <label class="check"><input type="checkbox" checked disabled><span>Create a company<span class="cd">Acme Supply, Amsterdam</span></span></label>
      <label class="check"><input type="checkbox"><span>Connect a payment account<span class="cd">The provider holds the money and pays into your bank account.</span></span><button class="btn sm" style="margin-left:auto">Connect</button></label>
      <label class="check"><input type="checkbox"><span>Publish a refunds policy<span class="cd">Customers see this before they pay.</span></span><button class="btn sm" style="margin-left:auto">Write one</button></label>
    </div>`,
  )}
  ${section(
    "All settings",
    `<div class="rlist">
      ${recordRow({ title: "General", sub: "Name, address, contact, time zone", actions: '<button class="btn sm">Open</button>' })}
      ${recordRow({ title: "Payments", sub: "The account money is paid into", actions: '<button class="btn sm">Open</button>' })}
      ${recordRow({ title: "Policies", sub: "Terms and refund policy", actions: '<button class="btn sm">Open</button>' })}
      ${recordRow({ title: "Team", sub: "People and what they may do", actions: '<button class="btn sm">Open</button>' })}
    </div>`,
    { acts: '<span class="muted" style="font-size:11.5px">30 in total</span>' },
  )}
</div>`,
            "Settings",
          ),
        },
      ],
    },
    // ---------------------------------------------------------------- 8
    {
      id: "frame-editor",
      title: "The editor page",
      floorplan: "editor-page",
      verdict: "Form left with a live preview right stays the pick: every control writes straight into the preview, so nobody saves to find out what a change looks like. The Webflow-style floating panel is the runner-up; prefer it when the visual dominates, such as a cover image judged at real size. Never ship the preview-above-the-form stack: every edit pushes the preview off screen, which defeats a live preview.",
      why: "Edit what a customer sees, with a live preview beside the form. A storefront editor holds the look in a form and the result in a preview card beside it, and it must carry <b>a Cancel and a dirty state</b>: without them, leaving silently discards work.",
      variants: [
        {
          name: "Form left, live preview right, one Save",
          pick: true,
          rationale:
            "Every control writes straight into the preview, so the reader never saves to find out what a change looks like.",
          tradeoff:
            "The preview needs a phone toggle to be trusted for a storefront, and two thirds of a 1440 screen is a lot of preview for a few fields.",
          html: shell(
            "Storefront",
            `<div class="page pf">
  ${phead("Storefront", "The logo, cover, accent colour and typeface customers see.", "", { crumb: trail("Home", "Products", "Storefront") })}
  ${tabs(["Storefront", "Domains"], 0)}
  <div class="pf-split preview">
    <div class="stack">
      ${section(
        "The look",
        `<div class="form">
          ${dropZone("Drop a logo here or choose a file", "A square image of at most 2 MB. JPEG, PNG or WebP.")}
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
            ${field("Logo description", input(""), { optional: true, help: "What the logo shows, for somebody who cannot see it." })}
            ${field("Typeface", '<select class="sel"><option selected>System</option><option>Inter</option><option>Source Serif</option></select>', { help: "The typeface your storefront renders in." })}
          </div>
          ${field("Accent colour", `<span class="inline"><span style="width:30px;height:30px;border-radius:5px;background:var(--foreground);border:1px solid var(--border);flex:none"></span><span class="copyable"><input class="inp mono" style="width:110px" value="#1F2937"><span class="muted" style="font-size:11.5px">Contrast with white: 14.7:1</span></span></span>`, { help: "A #RRGGBB value. The accent fills buttons, and their text is white." })}
          <label class="check"><input type="checkbox" checked><span>Show the footer note<span class="cd">The line under your storefront that names the company.</span></span></label>
          <div class="btnrow between" style="border-top:1px solid var(--border);padding-top:12px">
            <button class="btn ghost">Cancel</button>
            <button class="btn primary">Save</button>
          </div>
        </div>`,
      )}
    </div>
    <div class="pf-stack pf-sticky">
      ${section(
        "",
        `<div class="preview">
          <div class="pv-cover">Your cover image</div>
          <div class="pv-body">
            <div class="pv-logo"><span class="sq">LOGO</span><span style="font-size:10.5px;color:var(--muted-foreground)">Your logo</span></div>
            <h4>Oak desk lamp</h4>
            <p>Solid oak, linen shade, ready to ship.</p>
            <button class="btn primary sm">Order now</button>
          </div>
          <div class="pv-foot">Acme Supply · Canal Street 12, Amsterdam</div>
        </div>`,
      )}
    </div>
  </div>
</div>`,
            "Products",
          ),
        },
        {
          name: "Preview as a device frame with a width toggle",
          rationale:
            "The preview sits in a phone or desktop frame with an explicit toggle, because a storefront is judged at both widths and the form can hide half of it.",
          tradeoff:
            "The device frame costs horizontal room, so the form column narrows. A toggle means one width is never visible while the other is edited.",
          html: shell(
            "Storefront",
            `<div class="page pf">
  ${phead("Storefront", "The logo, cover, accent colour and typeface customers see.", "", { crumb: trail("Home", "Products", "Storefront") })}
  <div class="pf-split preview">
    <div class="stack">
      ${section(
        "The look",
        `<div class="form">
          ${dropZone("Drop a logo here or choose a file", "A square image of at most 2 MB.")}
          ${field("Accent colour", `<span class="inline"><span style="width:30px;height:30px;border-radius:5px;background:var(--foreground);border:1px solid var(--border);flex:none"></span><input class="inp mono" style="width:110px" value="#1F2937"></span>`, { help: "A #RRGGBB value." })}
          ${field("Typeface", '<select class="sel"><option selected>System</option><option>Inter</option></select>')}
          <div class="btnrow between" style="border-top:1px solid var(--border);padding-top:12px">
            <button class="btn ghost">Cancel</button><button class="btn primary">Save</button>
          </div>
        </div>`,
      )}
    </div>
    <div class="pf-sticky">
      <div class="section">
        <h3>Preview <span class="acts">${segmented(["Phone", "Desktop"], 0)}</span></h3>
        <div class="body" style="display:grid;place-items:center;background:var(--muted)">
          <div class="preview" style="width:190px">
            <div class="pv-cover" style="aspect-ratio:16/9">Your cover image</div>
            <div class="pv-body" style="padding:11px">
              <div class="pv-logo"><span class="sq" style="width:22px;height:22px;font-size:8px">LOGO</span></div>
              <h4 style="font-size:13px">Oak desk lamp</h4>
              <p style="font-size:11px">Solid oak, linen shade.</p>
              <button class="btn primary xs">Order now</button>
            </div>
            <div class="pv-foot">Acme Supply</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>`,
            "Products",
          ),
        },
        {
          name: "Preview above the form, full width",
          rationale:
            "The preview is the point of the page, so it gets the top and the whole width, with the fields under it. Scrolling moves from the result to the inputs and back.",
          tradeoff:
            "Every field edit pushes the preview off the screen, which defeats a live preview. Only works if the preview is sticky or the field count is tiny.",
          html: shell(
            "Storefront",
            `<div class="page pf">
  ${phead("Storefront", "The logo, cover, accent colour and typeface customers see.", "", { crumb: trail("Home", "Products", "Storefront") })}
  ${section(
    "",
    `<div class="preview" style="max-width:420px;margin:0 auto">
      <div class="pv-cover">Your cover image</div>
      <div class="pv-body">
        <div class="pv-logo"><span class="sq">LOGO</span><span style="font-size:10.5px;color:var(--muted-foreground)">Your logo</span></div>
        <h4>Oak desk lamp</h4>
        <p>Solid oak, linen shade, ready to ship.</p>
        <button class="btn primary sm" style="background:#1F2937">Order now</button>
      </div>
      <div class="pv-foot">Acme Supply · Canal Street 12, Amsterdam</div>
    </div>`,
  )}
  ${section(
    "The look",
    `<div class="form" style="display:grid;grid-template-columns:1fr 1fr;gap:14px 16px;max-width:620px">
      ${dropZone("Drop a logo here", "At most 2 MB.")}
      ${dropZone("Drop a cover here", "Across the top.")}
      ${field("Accent colour", `<span class="inline"><span style="width:28px;height:28px;border-radius:5px;background:var(--foreground);border:1px solid var(--border)"></span><input class="inp mono" style="width:110px" value="#1F2937"></span>`)}
      ${field("Typeface", '<select class="sel"><option selected>System</option></select>')}
      <div style="grid-column:1/-1" class="btnrow between"><button class="btn ghost">Cancel</button><button class="btn primary">Save</button></div>
    </div>`,
  )}
</div>`,
            "Products",
          ),
        },
        {
          name: "Preview as a drawer pulled over the form",
          rationale:
            "The form takes the whole page and the preview opens over it as a drawer, so the reader can check the result at either width without losing their place in the form.",
          tradeoff:
            "The preview is out of sight by default, and a drawer over a form is a layered context for something that is meant to be reassuring.",
          html: shell(
            "Storefront",
            `<div class="page pf">
  ${phead("Storefront", "The logo, cover, accent colour and typeface customers see.", '<button class="btn sm">Preview</button>', { crumb: trail("Home", "Products", "Storefront") })}
  ${section(
    "The look",
    `<div class="form" style="max-width:480px">
      ${dropZone("Drop a logo here or choose a file", "A square image of at most 2 MB.")}
      ${field("Accent colour", `<span class="inline"><span style="width:30px;height:30px;border-radius:5px;background:var(--foreground);border:1px solid var(--border)"></span><input class="inp mono" style="width:110px" value="#1F2937"></span>`)}
      ${field("Typeface", '<select class="sel"><option selected>System</option></select>')}
      <label class="check"><input type="checkbox" checked><span>Show the footer note</span></label>
      <div class="btnrow between" style="border-top:1px solid var(--border);padding-top:12px">
        <button class="btn ghost">Cancel</button><button class="btn primary">Save</button>
      </div>
    </div>`,
  )}
  <div class="scrim" style="align-items:stretch;justify-items:end;padding:0">
    <div class="drawer" style="max-width:300px">
      <header><b>Preview</b><p class="muted" style="font-size:11.5px">As a customer sees it.</p></header>
      <div class="dbody">
        <div class="preview">
          <div class="pv-cover">Your cover image</div>
          <div class="pv-body">
            <div class="pv-logo"><span class="sq">LOGO</span></div>
            <h4 style="font-size:13px">Oak desk lamp</h4>
            <p style="font-size:11px">Solid oak, linen shade.</p>
            <button class="btn primary xs">Order now</button>
          </div>
        </div>
      </div>
      <footer><button class="btn sm">Close</button></footer>
    </div>
  </div>
</div>`,
            "Products",
          ),
        },
        {
          name: "Tabs per facet with the preview always on the right",
          rationale:
            "Branding, content and delivery are tabs; the preview does not move. Each tab is a short form, so the two columns never both get long.",
          tradeoff:
            "The preview shows a whole that the reader has only partly set. A tabbed editor grows a third tab here, so this is the next step rather than a change of kind.",
          html: shell(
            "Storefront",
            `<div class="page pf">
  ${phead("Storefront", "The logo, cover, accent colour and typeface customers see.", "", { crumb: trail("Home", "Products", "Storefront") })}
  ${tabs(["Branding", "Content", "Domains"], 0)}
  <div class="pf-split preview">
    ${section(
      "Branding",
      `<div class="form">
        ${dropZone("Drop a logo here or choose a file", "A square image of at most 2 MB.")}
        ${field("Accent colour", `<span class="inline"><span style="width:30px;height:30px;border-radius:5px;background:var(--foreground);border:1px solid var(--border)"></span><input class="inp mono" style="width:110px" value="#1F2937"></span>`, { help: "A #RRGGBB value." })}
        ${field("Typeface", '<select class="sel"><option selected>System</option></select>')}
        <div class="btnrow end" style="border-top:1px solid var(--border);padding-top:12px"><button class="btn primary">Save</button></div>
      </div>`,
    )}
    ${section(
      "",
      `<div class="preview">
        <div class="pv-bar"><b>Preview</b><span class="badge" style="margin-left:auto">Unsaved changes</span></div>
        <div class="pv-cover">Your cover image</div>
        <div class="pv-body">
          <div class="pv-logo"><span class="sq">LOGO</span></div>
          <h4>Oak desk lamp</h4>
          <p>Solid oak, linen shade, ready to ship.</p>
          <button class="btn primary sm" style="background:#1F2937">Order now</button>
        </div>
        <div class="pv-foot">Acme Supply · Canal Street 12, Amsterdam</div>
      </div>`,
    )}
  </div>
</div>`,
            "Products",
          ),
        },
        {
          name: "Floating settings panel over a full-bleed preview",
          reference: "Webflow",
          rationale:
            "Webflow's shape. The preview takes the whole page and the settings float over it as a panel, so a cover image is judged at real size. Closing the panel is the same as stepping back from the work.",
          tradeoff:
            "The panel covers the preview it edits, and dragging it aside is fiddly on a laptop trackpad. Prefer it when the visual dominates, such as a cover; prefer side-by-side for fiddly fields.",
          html: shell(
            "Storefront",
            `<div class="page pf">
  ${phead("Storefront", "The logo, cover, accent colour and typeface customers see.", '<button class="btn sm">Hide panel</button>', { crumb: trail("Home", "Products", "Storefront") })}
  <div class="pf-floatwrap">
    <div class="pf-floatpanel">
      ${section("The look", `<div class="form">${field("Accent colour", `<span class="inline"><span style="width:30px;height:30px;border-radius:5px;background:var(--foreground);border:1px solid var(--border)"></span><input class="inp mono" style="width:110px" value="#1F2937"></span>`)}${field("Typeface", '<select class="sel"><option selected>System</option><option>Inter</option></select>')}<div class="btnrow between"><button class="btn ghost sm">Cancel</button><button class="btn primary sm">Save</button></div></div>`)}
    </div>
    ${section("", `<div class="preview" style="max-width:560px;margin:0 auto"><div class="pv-cover">Your cover image</div><div class="pv-body"><div class="pv-logo"><span class="sq">LOGO</span><span style="font-size:10.5px;color:var(--muted-foreground)">Your logo</span></div><h4>Oak desk lamp</h4><p>Solid oak, linen shade, ready to ship.</p><button class="btn primary sm">Order now</button></div><div class="pv-foot">Acme Supply · Canal Street 12, Amsterdam</div></div>`)}
  </div>
</div>`,
            "Products",
          ),
        },
        {
          name: "Unsaved-changes bar pinned to the foot",
          rationale:
            "An editor with no Cancel silently discards work on leave. A pinned bar naming what is unsaved and offering Save, Discard and Preview solves that without a dialog on every keystroke.",
          tradeoff:
            "A bar across the bottom of the page is a full-width band, which the tone rules reserve for deployment identity. It has to be neutral to stay inside the contract.",
          html: shell(
            "Storefront",
            `<div class="page pf" style="padding-bottom:52px">
  ${phead("Storefront", "The logo, cover, accent colour and typeface customers see.", "", { crumb: trail("Home", "Products", "Storefront") })}
  <div class="pf-split preview">
    ${section(
      "The look",
      `<div class="form">
        ${dropZone("Drop a logo here or choose a file", "A square image of at most 2 MB.")}
        ${field("Accent colour", `<span class="inline"><span style="width:30px;height:30px;border-radius:5px;background:var(--foreground);border:1px solid var(--border)"></span><input class="inp mono" style="width:110px" value="#B45309"></span>`, { help: "Contrast with white is now 5.1:1. Still readable." })}
        <div class="btnrow end" style="border-top:1px solid var(--border);padding-top:12px"><button class="btn primary">Save</button></div>
      </div>`,
    )}
    ${section(
      "",
      `<div class="preview">
        <div class="pv-cover">Your cover image</div>
        <div class="pv-body">
          <div class="pv-logo"><span class="sq">LOGO</span></div>
          <h4>Oak desk lamp</h4>
          <p>Solid oak, linen shade, ready to ship.</p>
          <button class="btn primary sm">Order now</button>
        </div>
        <div class="pv-foot">Acme Supply · Canal Street 12, Amsterdam</div>
      </div>`,
    )}
  </div>
  <div style="position:absolute;left:0;right:0;bottom:0;background:var(--background);border-top:1px solid var(--border);padding:9px 16px">
    <div class="btnrow between">
      <span style="font-size:12.5px"><b>Unsaved changes</b> <span class="muted">· accent colour</span></span>
      <span class="btnrow"><button class="btn sm ghost">Discard</button><button class="btn sm">Preview</button><button class="btn primary sm">Save</button></span>
    </div>
  </div>
</div>`,
            "Products",
          ),
        },
      ],
    },
    // ---------------------------------------------------------------- 9
    {
      id: "frame-outcome",
      title: "The outcome page",
      floorplan: "outcome-page",
      verdict: "One statement with one next step stays the pick: a reader who came to learn whether it worked leaves in one glance. The GOV.UK confirmation band is the runner-up; prefer it when the flow leaves a reference the reader must keep. Never ship the toast-only outcome for anything the reader may need to return to: a moment is not a place.",
      why: "Where a flow ends: an order confirmed, a payment that failed, a link that expired. One state, one statement of what happened, one next step. <b>Flows often end in a toast instead</b>, which is why this frame is worth drawing.",
      variants: [
        {
          name: "One statement, one next step",
          pick: true,
          rationale:
            "What happened in the heading, what it means in one line, and exactly one primary action. A reader who came to find out whether it worked leaves in one glance.",
          tradeoff:
            "Saying nothing about what comes next makes the page a dead end unless the one action is right. Nothing else is offered, so a wrong guess is expensive.",
          html: shell(
            "Refund sent",
            `<div class="page pf pf-outcome">
  <div class="empty" style="padding:0 0 20px">
    <span class="ico" style="width:34px;height:34px;border-radius:50%;background:var(--positive-surface);color:var(--positive-surface-foreground);display:grid;place-items:center;font-size:15px">✓</span>
    <b style="font-size:17px;margin-top:9px">${MONEY.refund} is on its way back to ${ORDER.customer}</b>
    <p style="max-width:52ch">Refunds reach the customer's bank in one to three working days. The lamp on order ${ORDER.number} returns to stock.</p>
  </div>
  ${section(
    "What happened",
    dl(
      [
        ["Order", ORDER.number],
        ["Customer", `${ORDER.customer} · ${ORDER.email}`],
        ["Amount", MONEY.refund],
        ["Refunded by", `${PEOPLE.finance.name}, 8 Oct 2026 at 11:04`],
        ["Method", "Back to the account it came from"],
      ],
      { stacked: true },
    ),
  )}
  <div class="btnrow end" style="margin-top:14px">
    <button class="btn ghost">Back to orders</button><button class="btn">Email the customer</button><button class="btn primary">Open order ${ORDER.number}</button>
  </div>
</div>`,
            "Orders",
          ),
        },
        {
          name: "Outcome with the record it changed",
          rationale:
            "The same statement, then the record underneath so a reader who wants the full picture does not leave the page and lose the outcome.",
          tradeoff:
            "The page stops being an outcome and becomes a record page with an unusual header, which makes the flow's end indistinguishable from its middle.",
          html: shell(
            "Refund sent",
            `<div class="page pf">
  ${phead(`${MONEY.refund} is on its way back to ${ORDER.customer}`, "The lamp on this order returns to stock.", '<button class="btn sm">Email the customer</button>', {
      crumb: trail("Home", "Orders", ORDER.number),
    })}
  ${section("The refund", dl([["Order", ORDER.number], ["Amount", MONEY.refund], ["Sent", "8 Oct 2026, 11:04"], ["By", PEOPLE.finance.name]], { stacked: true }))}
  ${section("The order now", `<div class="stmt"><div class="line"><span>Product and handling</span><span class="fig">${MONEY.order}</span></div><div class="line"><span>Refunded</span><span class="fig">-${MONEY.refund}</span></div><div class="grand"><span>Net</span><span class="fig">EUR 80.00</span></div></div>`)}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Refusal outcome that names the fix",
          rationale:
            "The same frame with the refusal tone, and the primary action is the one that resolves it: not 'Back', but the command that was refused.",
          tradeoff:
            "Every refusal needs a differently-worded fix, and one that does not have one has to fall back to explaining itself.",
          html: shell(
            "Refund refused",
            `<div class="page pf pf-outcome">
  <div class="empty" style="padding:0 0 20px">
    <span class="ico" style="width:34px;height:34px;border-radius:50%;background:var(--destructive-surface);color:var(--destructive-surface-foreground);display:grid;place-items:center;font-size:15px">✕</span>
    <b style="font-size:17px;margin-top:9px">${REFUSALS.windowClosed.title}</b>
    <p style="max-width:52ch">${REFUSALS.windowClosed.detail}</p>
  </div>
  ${section(
    "What you can do",
    `<div class="alist">
      ${actionRow("Offer the customer credit", "A credit against a future order, paid for by Acme Supply.", "Offer credit", "◈")}
      ${actionRow("Arrange a bank transfer", "You send the money yourself. The transfer is recorded as agreed.", "Start a transfer", "⇄")}
    </div>`,
  )}
  <div class="btnrow end" style="margin-top:14px">
    <button class="btn ghost">Back to order ${ORDER.number}</button>
    <button class="btn primary">Offer credit instead</button>
  </div>
</div>`,
            "Orders",
          ),
        },
        {
          name: "Outcome as a confirmation with a reference",
          rationale:
            "For a flow that leaves the back office entirely, such as an invitation, the outcome carries a copyable reference and says where to go next.",
          tradeoff:
            "A reference is an identifier, and the design contract says an identifier on screen must be labelled and copyable rather than bare.",
          html: shell(
            "Invitation sent",
            `<div class="page pf pf-outcome">
  <div class="empty" style="padding:0 0 18px">
    <span class="ico" style="width:34px;height:34px;border-radius:50%;background:var(--positive-surface);color:var(--positive-surface-foreground);display:grid;grid-items:center;display:grid;place-items:center;font-size:15px">✓</span>
    <b style="font-size:17px;margin-top:9px">${PEOPLE.warehouse.name} has been invited as warehouse lead</b>
    <p style="max-width:52ch">They can accept from the message. The invitation runs out on 22 Oct 2026.</p>
  </div>
  ${section(
    "",
    `<div class="stack sm">
      <div class="split"><span>Invitation reference <span class="sub">Use this if they cannot find the message</span></span><span class="fig"><span class="copyable"><span class="code">INV-4F82C1A9</span><button aria-label="Copy the invitation reference">⧉</button></span></span></div>
      <div class="split"><span>Sent to</span><span class="fig">chris@acme-supply.example</span></div>
      <div class="split"><span>Expires</span><span class="fig">22 Oct 2026</span></div>
      <div class="split"><span>Role</span><span class="fig">Warehouse lead</span></div>
    </div>`,
  )}
  <div class="btnrow end" style="margin-top:14px">
    <button class="btn ghost">Back to team</button><button class="btn">Invite somebody else</button><button class="btn primary">Open the team</button>
  </div>
</div>`,
            "Settings",
          ),
        },
        {
          name: "Outcome with a checklist of what is left",
          rationale:
            "Where a command settles one thing and leaves three, the outcome page becomes the place that lists them, so the flow does not end with silent work outstanding.",
          tradeoff:
            "This stops being an outcome page and becomes a work page. The floorplan boundary blurs, and the one-glance property that makes an outcome page good is lost.",
          html: shell(
            "Product published",
            `<div class="page pf pf-narrow">
  <div class="empty" style="padding:0 0 18px">
    <span class="ico" style="width:34px;height:34px;border-radius:50%;background:var(--positive-surface);color:var(--positive-surface-foreground);display:grid;place-items:center;font-size:15px">✓</span>
    <b style="font-size:17px;margin-top:9px">${PRODUCT.name} is published</b>
    <p style="max-width:52ch">The storefront shows it at ${PRODUCT.price} and the ${PRODUCT.stock} in stock are ready to sell.</p>
  </div>
  ${section(
    "Three things this product still needs",
    `<div class="alist">
      ${actionRow("No photos", "Three slots, all empty. Customers see a placeholder.", "Add photos", "◷")}
      ${actionRow("Rotterdam holds no stock", "412 units sit in Amsterdam. Nothing can ship from Rotterdam.", "Move stock", "◈")}
      ${actionRow("No reduced shipping rate", "Orders over EUR 50.00 pay full shipping until a rate is set.", "Set rates", "≡")}
    </div>`,
  )}
  <div class="btnrow end" style="margin-top:14px"><button class="btn primary">Open ${PRODUCT.name}</button></div>
</div>`,
            "Products",
          ),
        },
        {
          name: "Confirmation band with the reference inside",
          reference: "GOV.UK",
          rationale:
            "GOV.UK's confirmation panel. A green band carries the outcome and the reference together, so the one thing to keep is the one thing that stands out. Everything below it is supporting detail.",
          tradeoff:
            "The band works for success and only success; a refusal in the same shape would read as approval. Reserve it for flows that leave a reference behind, never as a generic end screen.",
          html: shell(
            "Refund sent",
            `<div class="page pf pf-outcome">
  <div class="pf-confirm">
    <span style="font-size:12.5px;font-weight:600">Refund sent</span>
    <span><span style="font-size:12px">Order </span><span class="ref">SO-1042</span></span>
    <span style="font-size:12.5px">EUR 45.00 is on its way back to Maria Garcia</span>
  </div>
  ${section("What happened", dl([["Amount", "EUR 45.00"], ["Customer", "Maria Garcia · maria@garcia-interiors.example"], ["Refunded by", "Priya Shah, 8 Oct 2026 at 11:04"], ["Method", "Back to the account it came from"]], { stacked: true }))}
  <div class="btnrow end" style="margin-top:14px"><button class="btn ghost">Back to orders</button><button class="btn primary">Open order SO-1042</button></div>
</div>`,
            "Orders",
          ),
        },
        {
          name: "Outcome as a toast with the record in place",
          reference: "Carbon",
          rationale:
            "No new page at all. The command succeeds, the record updates in place and a toast names what happened. The reader never loses their position.",
          tradeoff:
            "Carbon and Material both warn that a transient message must not be the only route to anything, and an outcome a reader may need to come back to needs to be a place, not a moment.",
          html: shell(
            "Orders",
            `<div class="page pf">
  ${phead("Orders", "Every order across your customers, newest first.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order number, name or email", filters: ["Any state"] })}
  ${section("", ordersTable({ rows: 3 }), { flush: true })}
  ${pager(1, 11)}
  <div style="position:absolute;right:14px;bottom:14px">
    ${toast("positive", `${MONEY.refund} is on its way back to ${ORDER.customer}`)}
  </div>
</div>`,
            "Orders",
          ),
        },
      ],
    },
    // ---------------------------------------------------------------- 10
    {
      id: "pf-live",
      title: "The live operations page",
      floorplan: "live-page",
      why: "Dispatch day is happening: the docks are open, scanners are reading, and the warehouse lead needs the count at a glance. The argument is about <b>what earns the glance</b>: the total, the per-dock split, or only the exceptions.",
      verdict: "The count with docks and exceptions stays the pick: the warehouse lead reads one number, then the per-dock split, then only what needs a person. The exceptions-only wall is the runner-up; prefer it on the wall display once the day is steady and the count is already known. Never ship the timeline as the main view: a list of six hundred dispatches is a log, not a page.",
      variants: [
        {
          name: "The count, the docks, the exceptions",
          pick: true,
          rationale:
            "One number first, then the per-dock split, then only what needs a person. The warehouse lead reads the count in one glance and reaches the exceptions without scrolling past the day's log.",
          tradeoff:
            "Three structures on one page, and the exceptions sit below the docks on a phone. Acceptable; the order reads correctly either way.",
          html: shell(
            "Dispatch",
            `<div class="page pf">
  ${phead(`Garcia restock · dispatch <span class="pf-live">Live</span>`, "Sat 14 Mar 2026 · 08:00 to 12:00 · Amsterdam warehouse.", '<button class="btn sm">End dispatch</button>', { crumb: trail("Home", "Orders", DELIVERY.name, "Dispatch") })}
  ${section("", `<div class="stack"><span style="font-size:12px;color:var(--muted-foreground)">Dispatched</span><span class="pf-big">554 <span class="muted" style="font-size:14px">of 840 parcels</span></span>${progress(66)}</div>`)}
  <div class="pf-docks">
    <div class="tile"><div class="lab">Dock 1 and 2</div><div class="fig">210</div><div class="sub">Parcels · Chris Novak</div></div>
    <div class="tile"><div class="lab">Dock 3</div><div class="fig">168</div><div class="sub">Parcels · 2 scanners</div></div>
    <div class="tile"><div class="lab">Pickup counter</div><div class="fig">130</div><div class="sub">Collection and help · Alex Morgan</div></div>
    <div class="tile"><div class="lab">Back stock</div><div class="fig">46</div><div class="sub">Staff only · Priya Shah</div></div>
  </div>
  ${section("Needs somebody", `<div class="rlist">${recordRow({ title: "One parcel scanned at two docks", sub: "PKG-0C893968A2 · read at 09:40 and 09:41", state: { label: "Check it", tone: "caution" }, actions: '<button class="btn sm">Open</button>', lead: "caution" })}${recordRow({ title: "Dock 3 scanner is offline", sub: "Last sync 10:10 · scans queue on the device", state: { label: "Offline", tone: "destructive" }, actions: '<button class="btn sm">Open</button>', lead: "destructive" })}</div>`, { acts: '<span class="badge caution">2</span>' })}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Per-dock cards with a rate",
          reference: "Datadog",
          rationale:
            "Each dock carries its count, its share of the day and its last-hour rate, the way Datadog draws per-host cards. A slow dock is visible as a number, not as a feeling.",
          tradeoff:
            "Four cards with three figures each is twelve numbers before the exceptions. The warehouse lead gets diagnosis, not a glance.",
          html: shell(
            "Dispatch",
            `<div class="page pf">
  ${phead(`Garcia restock · dispatch <span class="pf-live">Live</span>`, "554 parcels dispatched of 840 scheduled.", '<button class="btn sm">End dispatch</button>', { crumb: trail("Home", "Orders", DELIVERY.name, "Dispatch") })}
  <div class="pf-docks">
    ${[["Dock 1 and 2", "210", 38, "88 in the last hour"], ["Dock 3", "168", 30, "71 in the last hour"], ["Pickup counter", "130", 24, "54 in the last hour"], ["Back stock", "46", 8, "11 in the last hour"]].map(([nm, fig, pct, rate]) => `<div class="tile"><div class="lab">${nm}</div><div class="fig">${fig}</div>${progress(pct, true)}<div class="sub" style="margin-top:6px">${rate}</div></div>`).join("")}
  </div>
  ${section("Needs somebody", `<div class="rlist">${recordRow({ title: "Dock 3 scanner is offline", sub: "Last sync 10:10 · scans queue on the device", state: { label: "Offline", tone: "destructive" }, actions: '<button class="btn sm">Open</button>', lead: "destructive" })}</div>`)}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Dispatches as a timeline",
          reference: "PagerDuty",
          rationale:
            "The day reads newest first: dispatches, double reads and connection drops in one place, the way PagerDuty draws an incident timeline. Nothing is grouped away from the reader.",
          tradeoff:
            "Six hundred dispatches do not fit a timeline, so the page shows the last five and a count of the rest. The count is the page; the timeline is decoration.",
          html: shell(
            "Dispatch",
            `<div class="page pf">
  ${phead(`Garcia restock · dispatch <span class="pf-live">Live</span>`, "554 dispatched. The newest first.", '<button class="btn sm">Pause the feed</button>', { crumb: trail("Home", "Orders", DELIVERY.name, "Dispatch") })}
  ${section("Today", `<div class="tl">${timelineEntry("Maria Garcia collected at the pickup counter", "10:41", "Chris Novak", "positive")}${timelineEntry("One parcel scanned at two docks", "10:40", "Dock 1", "caution")}${timelineEntry("Tom Becker collected at dock 3", "10:39", "Dock 3", "positive")}${timelineEntry("Dock 3 scanner went offline", "10:10", "System", "destructive")}${timelineEntry("Dispatch started", "08:00", "Chris Novak", "neutral", true)}</div>`, { desc: "The last 5 of 559 entries today." })}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Exceptions only, quiet otherwise",
          rationale:
            "The page promises silence: the count in the header, and below it only what needs a person. A warehouse lead who trusts the scanners reads one line and puts the phone away.",
          tradeoff:
            "When nothing needs anybody the page is nearly empty, and an empty page on a wall display reads as broken. It needs the count to prove it is alive.",
          html: shell(
            "Dispatch",
            `<div class="page pf">
  ${phead(`Garcia restock · dispatch <span class="pf-live">Live</span>`, "554 dispatched of 840 scheduled. Nothing needs somebody.", "", { crumb: trail("Home", "Orders", DELIVERY.name, "Dispatch") })}
  ${section("", emptyState("The docks are clear", "554 dispatched across 4 docks. The next exception appears here.", "", "✓"))}
  ${section("Earlier today", `<div class="rlist">${recordRow({ title: "Dock 3 scanner was offline", sub: "10:10 to 10:40 · 41 scans queued, all synced", state: { label: "Resolved", tone: "positive" } })}</div>`, { desc: "Settled, kept for the day's record." })}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Full-screen count for the wall display",
          rationale:
            "A wall display carries one number and the exceptions count beside it. No navigation, no commands, nothing to misread from three metres away.",
          tradeoff:
            "A display is not a workplace: nothing can be opened, decided or closed from it. It answers how many, and every other question needs a phone.",
          fit: "full",
          html: bare(
            "Dispatch",
            `<div class="page pf">
  <div class="pf-full">
    <div class="pf-err">
      <span class="pf-live">Live · Garcia restock</span>
      <span class="pf-big">554</span>
      <p>parcels of 840 dispatched · 1 needs somebody</p>
      <div class="btnrow pf-only-phone"><button class="btn primary">Open the exceptions</button></div>
    </div>
  </div>
</div>`,
            "Orders",
          ),
        },
        {
          name: "Split: dispatches left, incidents right",
          reference: "GitHub",
          rationale:
            "The dispatch story and the incidents story sit side by side, the way GitHub draws a deploy beside its checks. Either column can be read without the other.",
          tradeoff:
            "Below a laptop the columns stack and the incidents land under the dispatch log. The stacking order has to put incidents first on a phone.",
          html: shell(
            "Dispatch",
            `<div class="page pf">
  ${phead(`Garcia restock · dispatch <span class="pf-live">Live</span>`, "554 dispatched of 840 scheduled.", '<button class="btn sm">End dispatch</button>', { crumb: trail("Home", "Orders", DELIVERY.name, "Dispatch") })}
  <div class="pf-split">
    ${section("Dispatches by hour", `<div class="stack sm">${split("08:00 · start", "204")}${split("09:00", "210")}${split("10:00", "128")}${split("11:00 · so far", "12")}</div>`)}
    ${section("Incidents", `<div class="rlist">${recordRow({ title: "One parcel scanned at two docks", sub: "PKG-0C893968A2 · 10:40", state: { label: "Check it", tone: "caution" }, actions: '<button class="btn sm">Open</button>' })}${recordRow({ title: "Dock 3 scanner offline", sub: "10:10 to 10:40 · resolved", state: { label: "Resolved", tone: "positive" } })}</div>`, { acts: '<span class="badge caution">1 open</span>' })}
  </div>
</div>`,
            "Orders",
          ),
        },
      ],
    },
    {
      id: "pf-schedule",
      title: "The calendar or schedule page",
      floorplan: "calendar-page",
      why: "Ninety-three deliveries ahead need a shape that answers when, not what. The argument is density: a grid that shows the month against a list that shows the next delivery.",
      verdict: "The month grid stays the pick: ninety-three deliveries ahead need density, and the grid shows the month the list cannot. The agenda list is the runner-up; prefer it on a phone, where seven columns become unreadable whichever way they are drawn. Never ship the week lanes as the default: two warehouses fit, and the third warehouse breaks the shape.",
      compact: { option: "Agenda grouped by day", behaviour: "Seven columns do not fit a phone; the agenda list is the phone shape, with each day as a date chip beside its deliveries." },
      variants: [
        {
          name: "Month grid with deliveries marked",
          pick: true,
          reference: "Google Calendar",
          rationale:
            "The month at a glance, with each delivery sitting on its date. Google Calendar's shape, and the only one where a clash between two deliveries is visible without opening either.",
          tradeoff:
            "Seven columns squeeze hard on a phone, and a date with three deliveries shows three clipped pills. The agenda is the honest phone shape.",
          html: shell(
            "Schedule",
            `<div class="page pf">
  ${phead("March 2026", "3 deliveries across 2 warehouses.", '<button class="btn sm icon" aria-label="Previous month">‹</button><button class="btn sm icon" aria-label="Next month">›</button>', { crumb: trail("Home", "Orders", "Schedule") })}
  ${section("", `<div class="pf-cal">${["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => `<div class="dow">${d}</div>`).join("")}${Array.from({ length: 31 }, (_, i) => { const day = i + 1; const ev = day === 14 ? `<span class="ev positive">Garcia restock</span>` : day === 21 ? `<span class="ev info">Becker restock</span>` : day === 28 ? `<span class="ev caution">Okafor delivery</span>` : ""; return `<div${day === 14 ? ' class="today"' : ""}><span class="d">${day}</span>${ev}</div>`; }).join("")}${[1, 2, 3, 4].map((d) => `<div class="out"><span class="d">${d}</span></div>`).join("")}</div>`, { flush: true })}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Agenda grouped by day",
          reference: "Apple Calendar",
          rationale:
            "Each day is a date chip with its deliveries beside it, the way Apple Calendar draws the list view. The reader scrolls time itself rather than paging through it.",
          tradeoff:
            "Empty days still take a row or the rhythm breaks, so a quiet month is mostly scrolling. The grid shows the quiet month better.",
          html: shell(
            "Schedule",
            `<div class="page pf">
  ${phead("Schedule", "The next deliveries, soonest first.", '<button class="btn primary sm">New delivery</button>', { crumb: trail("Home", "Orders", "Schedule") })}
  ${section("", `<div class="pf-agenda"><div class="day"><div class="pf-date"><small>Sat</small><b>14</b></div><div class="rlist">${recordRow({ title: "Garcia Interiors restock", sub: "08:00 to 12:00 · Amsterdam warehouse", state: { label: "Active", tone: "positive" }, fig: "32 of 40 pallets", actions: '<button class="btn sm">Open</button>' })}</div></div><div class="day"><div class="pf-date"><small>Sat</small><b>21</b></div><div class="rlist">${recordRow({ title: "Becker Bouw restock", sub: "08:00 to 12:00 · Rotterdam warehouse", state: { label: "Scheduled", tone: "info" }, fig: "12 of 40 pallets", actions: '<button class="btn sm">Open</button>' })}</div></div><div class="day"><div class="pf-date"><small>Sat</small><b>28</b></div><div class="rlist">${recordRow({ title: "Okafor Office delivery", sub: "08:00 to 12:00 · Rotterdam warehouse", state: { label: "Scheduled", tone: "info" }, fig: "4 of 40 pallets", actions: '<button class="btn sm">Open</button>' })}</div></div></div>`)}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Week lanes per warehouse",
          reference: "Float",
          rationale:
            "Each warehouse gets a lane and each delivery a block on its days, the way Float draws allocations. A clash at one warehouse is a visible overlap, not a second page.",
          tradeoff:
            "Two warehouses fit; the third warehouse breaks the shape, and a phone has no room for lanes at all. Only honest for a company with few warehouses.",
          html: shell(
            "Schedule",
            `<div class="page pf">
  ${phead("Week 11 · 9 to 15 Mar", "One lane per warehouse. A block is a delivery.", '<button class="btn sm icon" aria-label="Previous week">‹</button><button class="btn sm icon" aria-label="Next week">›</button>', { crumb: trail("Home", "Orders", "Schedule") })}
  ${section("", `<div class="pf-lane head"><div class="nm"></div><div class="tr"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span></div></div><div class="pf-lane"><div class="nm">Amsterdam warehouse</div><div class="tr"><span class="blk positive" style="left:71%;width:14%">Garcia restock</span></div></div><div class="pf-lane"><div class="nm">Rotterdam warehouse</div><div class="tr"><span class="blk info" style="left:14%;width:14%">Becker restock</span></div></div>`, { flush: true })}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Upcoming list with a state filter",
          rationale:
            "The schedule as a plain list page: search, one state filter, one table. Nothing to learn, and the same toolbar the orders page already teaches.",
          tradeoff:
            "A list answers what, not when: dates read as text and the shape of the month is invisible. Fine for ten deliveries, wrong for ninety-three.",
          html: shell(
            "Schedule",
            `<div class="page pf">
  ${phead("Schedule", "93 deliveries ahead, soonest first.", '<button class="btn primary sm">New delivery</button>', { crumb: trail("Home", "Orders", "Schedule") })}
  ${toolbar({ search: "", placeholder: "Search deliveries", filters: ["Any state"], right: '<button class="btn sm">Export</button>' })}
  ${section("", `<table class="dt"><thead><tr><th scope="col">Delivery</th><th scope="col">Date</th><th scope="col">State</th><th scope="col" class="num">Pallets</th></tr></thead><tbody><tr><td><b>Garcia Interiors restock</b><br><small class="muted">Amsterdam warehouse</small></td><td class="nowrap">Sat 14 Mar 2026</td><td>${badgeRaw("Active", "positive", "outline")}</td><td class="num">32</td></tr><tr><td><b>Becker Bouw restock</b><br><small class="muted">Rotterdam warehouse</small></td><td class="nowrap">Sat 21 Mar 2026</td><td>${badgeRaw("Scheduled", "info", "outline")}</td><td class="num">12</td></tr><tr><td><b>Okafor Office delivery</b><br><small class="muted">Rotterdam warehouse</small></td><td class="nowrap">Sat 28 Mar 2026</td><td>${badgeRaw("Scheduled", "info", "outline")}</td><td class="num">4</td></tr></tbody></table>`, { flush: true })}
  ${pager(1, 4, 1, 25, 93)}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Mini month beside the day",
          reference: "Outlook",
          rationale:
            "Outlook's shape: a small month for orientation, the chosen day in full beside it. The reader never loses the month while reading the delivery.",
          tradeoff:
            "Two structures need two selections that must agree, and on a phone the mini month stacks above the day it orients. Twice the page for one delivery.",
          html: shell(
            "Schedule",
            `<div class="page pf">
  ${phead("Sat 14 Mar 2026", "One delivery, with the month beside it.", '<button class="btn primary sm">New delivery</button>', { crumb: trail("Home", "Orders", "Schedule") })}
  <div class="pf-split">
    ${section("March 2026", `<div class="pf-cal">${["S", "M", "T", "W", "T", "F", "S"].map((d) => `<div class="dow">${d}</div>`).join("")}${Array.from({ length: 31 }, (_, i) => `<div${i + 1 === 14 ? ' class="today"' : ""}><span class="d">${i + 1}</span></div>`).join("")}</div>`, { flush: true })}
    ${section("Garcia Interiors restock", `<div class="stack">${dl([["Window", "08:00 to 12:00"], ["Warehouse", "Amsterdam warehouse"], ["Pallets", "32 of 40"], ["Staff", "Chris Novak and 4 pickers"]], { stacked: true })}<div class="btnrow"><button class="btn primary sm">Open delivery</button><button class="btn sm">Open dispatch</button></div></div>`)}
  </div>
</div>`,
            "Orders",
          ),
        },
        {
          name: "Next 30 days as a week strip",
          reference: "Airbnb",
          rationale:
            "Four weeks as four rows with their deliveries named inside, the way Airbnb draws payout weeks. The reader sees the rhythm of the month without learning a grid.",
          tradeoff:
            "Weeks are not months: a delivery on the 31st falls off the strip, and the strip must restate its own range every time it is read.",
          html: shell(
            "Schedule",
            `<div class="page pf">
  ${phead("Next 30 days", "9 Mar to 7 Apr 2026 · 3 deliveries.", '<button class="btn primary sm">New delivery</button>', { crumb: trail("Home", "Orders", "Schedule") })}
  ${section("", `<div class="stack sm">${split("Week 11 · Garcia restock, Sat 14 Mar", "32 of 40 pallets")}${split("Week 12 · Becker restock, Sat 21 Mar", "12 of 40 pallets")}${split("Week 13 · Okafor delivery, Sat 28 Mar", "4 of 40 pallets")}${split("Week 14 · nothing scheduled", "—")}</div>`)}
</div>`,
            "Orders",
          ),
        },
      ],
    },
    {
      id: "pf-onboarding",
      title: "The onboarding or setup page",
      floorplan: "onboarding-page",
      why: "A new company has an account and nothing else. The argument is how much the page does: a checklist that waits, a wizard that leads, or a single page that states the three steps and gets out of the way.",
      verdict: "The checklist with a progress bar stays the pick: it states the three steps, shows which is done, and waits without leading. The stepper wizard is the runner-up; prefer it when a step cannot be skipped and the next depends on the last. Never ship the single page with a Save per section: three saves for a first run is three chances to leave half set up.",
      variants: [
        {
          name: "Checklist with a progress bar",
          pick: true,
          reference: "Shopify",
          rationale:
            "Three steps with a done, current and open marker, and a bar that says how far along the company is. Shopify's setup shape: the page waits, and each step opens its own command.",
          tradeoff:
            "A checklist can be ignored, and a reader who skips the payment step owns a back office that cannot take money. The home page's setup section has to repeat the warning.",
          html: shell(
            "Set up",
            `<div class="page pf pf-narrow">
  ${phead("Set up Acme Supply", "Three steps between a company and a first sale.", "", { crumb: trail("Home", "Set up") })}
  ${progress(33)}
  ${section(
    "Before you can take money",
    `<div class="pf-steps">
      ${step("Create a company", "Acme Supply, Amsterdam.", "done")}
      ${step("Connect a payment account", "The provider holds the money for you. You need a business number and a bank account.", "now", '<button class="btn primary sm">Connect</button>')}
      ${step("Publish a storefront", "Your own address, so customers order where you send them.", "", '<button class="btn sm">Set up</button>')}
    </div>`,
    { desc: "Each step is a command of its own, not a form that saves at the end." },
  )}
  ${section("What you can do now", `<div class="alist">${actionRow("Add a product", "It stays a draft until you price it and publish it.", "New product", "◈")}</div>`)}
</div>`,
            "Home",
          ),
        },
        {
          name: "Stepper wizard, one step open",
          reference: "Stripe",
          rationale:
            "One step open at a time with a stepper above it, the way Stripe draws onboarding. Each step validates before the next opens, so nothing half-filled is ever left behind.",
          tradeoff:
            "A wizard leads, which means it also blocks: the reader cannot add a product until the wizard is done. Wrong when the steps are independent.",
          html: shell(
            "Set up",
            `<div class="page pf pf-narrow">
  ${phead("Set up Acme Supply", "Step 2 of 3. Two minutes, and you can stop after this one.", "", { crumb: trail("Home", "Set up") })}
  <div class="steps" style="margin-bottom:18px">
    <span class="step done"><span class="n">✓</span>The company</span><span class="step-sep"></span>
    <span class="step now"><span class="n">2</span>Payments</span><span class="step-sep"></span>
    <span class="step"><span class="n">3</span>Storefront</span>
  </div>
  ${section("Connect a payment account", `<div class="form">${field("Business number", input("", { placeholder: "KVK 12345678" }), { help: "The provider asks for this before money can move.", required: true })}${field("Payout account", input("", { placeholder: "NL91 ABNA 0417 1643 00" }), { help: "The provider pays out to this account.", required: true })}<div class="btnrow"><button class="btn primary">Connect the provider</button><button class="btn ghost">Back</button></div></div>`)}
</div>`,
            "Home",
          ),
        },
        {
          name: "Setup beside the guide",
          reference: "Notion",
          rationale:
            "The steps on the left, what each step needs on the right, the way Notion draws setup beside its guide. The reader sees what a step costs before starting it.",
          tradeoff:
            "The guide duplicates the help text inside each step's own command, so two pages must agree about what the provider asks for. The copy drifts.",
          html: shell(
            "Set up",
            `<div class="page pf">
  ${phead("Set up Acme Supply", "Three steps. What each one needs is beside it.", "", { crumb: trail("Home", "Set up") })}
  <div class="pf-split">
    ${section("The steps", `<div class="pf-steps">${step("Create a company", "Acme Supply, Amsterdam.", "done")}${step("Connect a payment account", "About five minutes.", "now", '<button class="btn primary sm">Connect</button>')}${step("Publish a storefront", "About two minutes.", "", '<button class="btn sm">Set up</button>')}</div>`)}
    ${section("What each step needs", `<div class="stack">${dl([["Payments", "A business number and a bank account in the company's name."], ["Storefront", "A logo and a cover image, each at most 2 MB."], ["Products", "Nothing. Adding one is free and stays private until published."]], { stacked: true })}</div>`, { desc: "Have these ready and setup takes ten minutes." })}
  </div>
</div>`,
            "Home",
          ),
        },
        {
          name: "Start from a template",
          rationale:
            "Starting from a template names what the first shipment is before anything else, and the template sets the lines to match. Everything stays editable after the choice.",
          tradeoff:
            "A template is a guess about the shipment, and a wrong guess sets lines nobody reads. Templates must stay visibly editable, never silently applied.",
          html: shell(
            "Set up",
            `<div class="page pf pf-narrow">
  ${phead("What is the first shipment?", "The template sets the lines. Everything stays editable.", "", { crumb: trail("Home", "Set up") })}
  ${section("", `<div class="plans"><div class="plan" aria-pressed="true"><b>Restock</b><small class="muted">Pallet quantities, one warehouse, scheduled.</small></div><div class="plan" aria-pressed="false"><b>Customer order</b><small class="muted">Named customer, tracked shipping.</small></div><div class="plan" aria-pressed="false"><b>Transfer</b><small class="muted">Stock moved between warehouses.</small></div></div><div class="btnrow end" style="margin-top:12px"><button class="btn ghost">Skip</button><button class="btn primary">Continue</button></div>`)}
</div>`,
            "Home",
          ),
        },
        {
          name: "One page, one section per step",
          reference: "WordPress",
          rationale:
            "All three steps open on one page, each with its own Save, the way WordPress draws settings. The reader sees the total work before committing any of it.",
          tradeoff:
            "Three saves for a first run is three chances to leave half set up, and a reader who saves the name and leaves owns a back office that cannot take money.",
          html: shell(
            "Set up",
            `<div class="page pf pf-narrow">
  ${phead("Set up Acme Supply", "Everything on one page. Save each step as you finish it.", "", { crumb: trail("Home", "Set up") })}
  <div class="stack">
    ${section("The company", `<div class="form">${field("Company name", input("Acme Supply"))}</div><div class="btnrow end" style="margin-top:12px"><button class="btn sm">Save</button></div>`, { acts: '<span class="badge positive">Done</span>' })}
    ${section("Payments", `<div class="form">${field("Business number", input("", { placeholder: "KVK 12345678" }))}${field("Payout account", input("", { placeholder: "NL91 ABNA 0417 1643 00" }))}</div><div class="btnrow end" style="margin-top:12px"><button class="btn primary sm">Connect the provider</button></div>`)}
    ${section("Storefront", `<div class="form">${field("Storefront address", input("acme-supply"))}</div><div class="btnrow end" style="margin-top:12px"><button class="btn sm">Publish</button></div>`)}
  </div>
</div>`,
            "Home",
          ),
        },
        {
          name: "Book help instead of reading",
          reference: "Shopify",
          rationale:
            "Setup as a conversation: the page offers a setup call beside the self-serve path, the way Shopify draws onboarding help. A reader who is stuck gets a person, not a longer page.",
          tradeoff:
            "A call is the most expensive control on the page, and it only helps in office hours. The self-serve path must still work alone at midnight.",
          html: shell(
            "Set up",
            `<div class="page pf pf-narrow">
  ${phead("Set up Acme Supply", "Ten minutes alone, or fifteen with the support team.", "", { crumb: trail("Home", "Set up") })}
  ${section("", emptyState("Three steps to a first sale", "Connect a payment account, publish a storefront, add a product. Each step is a command of its own.", '<button class="btn primary">Start with payments</button>', "◈"))}
  ${section("Rather talk it through", `<div class="alist">${actionRow("Book a setup call", "Fifteen minutes with the support team, on a day you choose.", "Book", "◷")}${actionRow("Read the setup guide", "The three steps with what each one needs.", "Read", "≡")}</div>`)}
</div>`,
            "Home",
          ),
        },
      ],
    },
    {
      id: "pf-error",
      title: "The error or not-found page",
      floorplan: "error-page",
      why: "Something is missing, broken or refused. The argument is how much the page owns: a dead end with links back, or a working page that names the fix and offers it.",
      verdict: "The centered not-found with links back stays the pick: it says what happened, says where to go, and does both in one glance. The permission refusal with the fix is the runner-up; prefer it whenever the page knows who can resolve it, because Back is not a fix. Never ship the inline error alone for a missing page: a retry button on a page that will never exist is a promise that cannot be kept.",
      variants: [
        {
          name: "Centered not-found with links back",
          pick: true,
          reference: "GitHub",
          rationale:
            "What happened, where to go, in one glance: the code, one line, and the two places the reader most likely wanted. GitHub's 404 shape, minus the joke.",
          tradeoff:
            "A dead end is still a dead end: the reader loses whatever they were doing. It must at least keep the navigation, so the way back is one click.",
          html: shell(
            "Not found",
            `<div class="page pf">
  <div class="pf-err">
    <span class="code">404 · /products/oak-desk-lamp/dock-plan</span>
    <h1>This page is not here</h1>
    <p>It may have been moved, or the address may be wrong. The product and its orders are untouched.</p>
    <div class="btnrow"><button class="btn primary">Back to home</button><button class="btn">Open orders</button></div>
  </div>
</div>`,
            "Home",
          ),
        },
        {
          name: "Inline error with a retry",
          reference: "Vercel",
          rationale:
            "The page keeps its frame and names what failed inside it, the way Vercel draws a failed deploy beside the project. The reader keeps their place and retries from it.",
          tradeoff:
            "A retry button promises the retry can work. Where the failure is permanent, the button is a lie told twice.",
          html: shell(
            "Orders",
            `<div class="page pf">
  ${phead("Orders", "Every order across your customers, newest first.", "", { crumb: trail("Home", "Orders") })}
  ${alert("destructive", "The orders did not load", "The connection dropped at 11:04. Nothing you did caused this.", '<button class="btn sm">Try again</button>')}
  ${section("", skeleton("rows"))}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Full-page outage with the state named",
          reference: "Stripe",
          rationale:
            "When a provider is down, the page says which one, what still works and what does not. The status-page shape, as Stripe draws it: the failure is named, so the reader stops guessing.",
          tradeoff:
            "A full page for a partial failure hides what still works. Only honest when the failure truly blocks the page.",
          fit: "full",
          html: bare(
            "Status",
            `<div class="page pf">
  <div class="pf-full">
    <div class="pf-err">
      <span class="code">Payment provider · since 11:04</span>
      <h1>Payments cannot be taken right now</h1>
      <p>New payments wait until the connection returns. Placed orders stay valid and dispatch keeps working.</p>
      <div class="btnrow"><button class="btn primary">Try again</button><button class="btn">Read the status</button></div>
    </div>
  </div>
</div>`,
            "Home",
          ),
        },
        {
          name: "Permission refusal with the fix",
          rationale:
            "A refusal worded from its code, with the one command that resolves it beside it. The page knows Jordan cannot refund and knows Sam Rivera can grant it, so it says both.",
          tradeoff:
            "Every refusal needs its own fix, and one without a fix falls back to explaining itself. The fix must be a command, never a longer paragraph.",
          html: shell(
            "Refund",
            `<div class="page pf pf-outcome">
  ${outcomeHead("destructive", "✕", "Your role cannot do this", "Refunds sit with Finance. Nothing was changed.")}
  ${refusal("roleRefused")}
  ${section("What you can do", `<div class="alist">${actionRow("Ask Sam Rivera to grant Finance", "They own Acme Supply and can grant it in one step.", "Ask", "◈")}${actionRow("Read what your role may do", "Support reads, messages and reschedules. Refunds are not among them.", "Open", "≡")}</div>`)}
  <div class="btnrow end" style="margin-top:14px"><button class="btn ghost">Back to order SO-1042</button></div>
</div>`,
            "Orders",
          ),
        },
        {
          name: "Expired invitation with the next step",
          reference: "Slack",
          rationale:
            "An expired link names its expiry and offers the re-invite beside it, the way Slack draws expired invites. The old link stays dead; the fix is one step, not a search.",
          tradeoff:
            "The page must know who the invitation was for after it expired, which means expired invitations are kept, not deleted. Retention with a reason.",
          html: shell(
            "Invitation",
            `<div class="page pf pf-outcome">
  ${outcomeHead("caution", "◷", "This invitation ran out on 22 Oct 2026", "Chris Novak can be invited again. The old link stays dead.")}
  ${section("", `<div class="stack sm"><div class="split"><span>Invitation reference <span class="sub">Use this if they cannot find the message</span></span><span class="fig">${copyValue("invitation reference", "INV-4F82C1A9")}</span></span></div><div class="split"><span>Sent to</span><span class="fig">chris@acme-supply.example</span></div><div class="split"><span>Role</span><span class="fig">Warehouse lead</span></div></div>`)}
  <div class="btnrow end" style="margin-top:14px"><button class="btn ghost">Back to team</button><button class="btn primary">Invite Chris Novak again</button></div>
</div>`,
            "Settings",
          ),
        },
        {
          name: "Warehouse scanner is offline",
          rationale:
            "The offline dock keeps scanning and says so: what is queued, when it last synced, and that nothing is lost. The page reports a state, not a failure.",
          tradeoff:
            "Offline confidence must be earned: the queued count has to be exact, or the first discrepancy teaches the warehouse to distrust the page.",
          html: shell(
            "Dispatch",
            `<div class="page pf">
  ${phead("Dock 3 · offline", "Scanning continues. Everything queues on the device.", '<button class="btn primary sm">Try to reconnect</button>', { crumb: trail("Home", "Orders", DELIVERY.name, "Dispatch") })}
  ${callout("caution", "The connection dropped at 10:10. Scans queue on this device and sync when the connection returns.")}
  ${section("On this device", `<div class="stack">${dl([["Queued scans", "41"], ["Last sync", "10:10"], ["Device", "Dock 3 · Chris Novak"], ["Battery", "78%"]], { stacked: true })}</div>`)}
</div>`,
            "Orders",
          ),
        },
      ],
    },
    {
      id: "frame-drawer",
      title: "The record drawer",
      floorplan: "record-drawer from a dialog action",
      verdict: "The read-only drawer beside the list stays the pick: the list context is the whole reason to use a drawer, so nothing covers it. The inline detail band is the runner-up; prefer it when the record is four facts and the comparison must sit inside the table. Never ship the drawer holding an edit: repeatable work in a narrow overlay gives two nested control sets in one thin column.",
      why: "Read a record without leaving the list. It exists so a reader can compare a row against what the row actually holds. The catch is width: a 420-pixel drawer inside a 1440 screen holds facts and nothing else.",
      compact: { option: "Phone width, drawer becomes a full page", behaviour: "At 390 pixels there is no beside: the drawer takes the whole screen with a Back control that returns to the list at the same scroll position." },
      variants: [
        {
          name: "Drawer beside the list, read-only",
          pick: true,
          rationale:
            "The list stays on screen and the drawer carries the record's facts and its few commands. The list context is the whole reason to use a drawer, so nothing covers it.",
          tradeoff:
            "A phone has no room for two columns, so the drawer becomes a full-screen page. The same route then has two layouts to verify.",
          html: shell(
            "Orders",
            `<div class="page pf" style="position:relative">
  ${phead("Orders", "Every order across your customers, newest first.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order number, name or email", filters: ["Any state"] })}
  <div class="pf-split">
    <div class="stack">
      ${toolbar({ search: null, right: "" })}
      <table class="dt dense">
        <thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col" class="num">Paid</th></tr></thead>
        <tbody>
          <tr class="is-sel"><td><span class="code">SO-1042</span><br><small class="muted">Garcia Interiors</small></td><td>${ORDER.customer}<br><small class="muted">${ORDER.email}</small></td><td class="num">${MONEY.order}</td></tr>
          <tr><td><span class="code">SO-1041</span><br><small class="muted">Becker Bouw</small></td><td>Tom Becker<br><small class="muted">tom@becker-bouw.example</small></td><td class="num">EUR 310.00</td></tr>
          <tr><td><span class="code">SO-1040</span><br><small class="muted">Lindqvist Studio</small></td><td>Elin Lindqvist<br><small class="muted">elin@lindqvist.example</small></td><td class="num">EUR 64.50</td></tr>
          <tr><td><span class="code">SO-1039</span><br><small class="muted">Garcia Interiors</small></td><td>Maria Garcia<br><small class="muted">maria@garcia-interiors.example</small></td><td class="num">${MONEY.lamp}</td></tr>
          <tr><td><span class="code">SO-1038</span><br><small class="muted">Okafor Office</small></td><td>Ade Okafor<br><small class="muted">ade@okafor.example</small></td><td class="num">EUR 0.00</td></tr>
        </tbody>
      </table>
    </div>
    <div class="section pf-sticky">
      <h3>${ORDER.number} ${badgeRaw("Paid", "positive", "sq")}</h3>
      <div class="body">
        ${dl([["Customer", `${ORDER.customer}<br><span class="muted">${ORDER.email}</span>`], ["Placed", ORDER.placed], ["Paid", MONEY.order], ["Lines", "3, all confirmed"]], { stacked: true })}
        <hr class="hr" style="margin:11px 0">
        <div class="btnrow" style="gap:6px"><button class="btn sm">Resend</button><button class="btn sm">Refund</button></div>
        <div style="margin-top:9px"><a href="#" style="font-size:12px">Open the full record</a></div>
      </div>
    </div>
  </div>
</div>`,
            "Orders",
          ),
        },
        {
          name: "Drawer over the list as an overlay",
          reference: "Atlassian",
          rationale:
            "The drawer slides over the table with a scrim, giving the record more width than a column allows while still leaving the list identifiable behind it.",
          tradeoff:
            "Atlassian's panel guidance puts the panel beside the main area and only over it at 1024 and below. Overlaying at 1440 hides the row the reader is comparing against.",
          html: shell(
            "Orders",
            `<div class="page pf" style="position:relative">
  ${phead("Orders", "Every order across your customers, newest first.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order number, name or email", filters: ["Any state"] })}
  <table class="dt dense">
    <thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col" class="num">Paid</th></tr></thead>
    <tbody>
      <tr><td><span class="code">SO-1042</span></td><td>${ORDER.customer}</td><td class="num">${MONEY.order}</td></tr>
      <tr><td><span class="code">SO-1041</span></td><td>Tom Becker</td><td class="num">EUR 310.00</td></tr>
      <tr><td><span class="code">SO-1040</span></td><td>Elin Lindqvist</td><td class="num">EUR 64.50</td></tr>
      <tr><td><span class="code">SO-1039</span></td><td>Maria Garcia</td><td class="num">${MONEY.lamp}</td></tr>
      <tr><td><span class="code">SO-1038</span></td><td>Ade Okafor</td><td class="num">EUR 0.00</td></tr>
    </tbody>
  </table>
  ${drawer(
    `<header><div class="btnrow between"><b>${ORDER.number}</b>${badgeRaw("Paid", "positive", "sq")}</div><p class="muted" style="font-size:11.5px">Placed ${ORDER.placed}</p></header>
     <div class="dbody">
       ${dl([["Customer", `${ORDER.customer}<br><span class="muted">${ORDER.email}</span>`], ["Company", ORDER.company], ["Paid", MONEY.order], ["Method", "Card"], ["Lines", "3, all confirmed"]], { stacked: true })}
     </div>`,
    { footer: '<button class="btn sm">Refund</button><button class="btn primary sm">Open the record</button>' },
  )}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Row expands inline into a detail band",
          reference: "NN/g",
          rationale:
            "The record opens under its own row inside the table. Nothing is overlaid and nothing moves, so the comparison the reader came for is right there.",
          tradeoff:
            "A wide record cannot fit under a row without breaking the column grid, and NN/g reports that users do not clean up after themselves when they open several.",
          html: shell(
            "Orders",
            `<div class="page pf">
  ${phead("Orders", "Every order across your customers, newest first.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order number, name or email", filters: ["Any state"] })}
  <table class="dt">
    <thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col">State</th><th scope="col" class="num">Paid</th></tr></thead>
    <tbody>
      <tr class="is-sel"><td><span class="code">SO-1042</span><br><small class="muted">Garcia Interiors</small></td><td>${ORDER.customer}<br><small class="muted">${ORDER.email}</small></td><td>${badgeRaw("Paid", "positive", "outline")}</td><td class="num">${MONEY.order}</td></tr>
      <tr><td colspan="4" style="padding:0">
        <div style="padding:12px 14px;background:var(--muted);border-bottom:1px solid var(--border)">
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px">
            ${[["Placed", ORDER.placed], ["Method", "Card"], ["Lines", "3, all confirmed"], ["Refunds", "None"]]
              .map(([t, d]) => `<div><div style="font-size:11px;color:var(--muted-foreground)">${t}</div><div style="font-size:12.5px">${d}</div></div>`)
              .join("")}
          </div>
          <div class="btnrow" style="margin-top:11px"><button class="btn xs">Resend the confirmation</button><button class="btn xs">Refund</button><button class="btn xs ghost">Close</button></div>
        </div>
      </td></tr>
      <tr><td><span class="code">SO-1041</span><br><small class="muted">Becker Bouw</small></td><td>Tom Becker<br><small class="muted">tom@becker-bouw.example</small></td><td>${badgeRaw("Paid", "positive", "outline")}</td><td class="num">EUR 310.00</td></tr>
      <tr><td><span class="code">SO-1040</span><br><small class="muted">Lindqvist Studio</small></td><td>Elin Lindqvist<br><small class="muted">elin@lindqvist.example</small></td><td>${badgeRaw("Awaiting payment", "caution", "outline")}</td><td class="num">EUR 64.50</td></tr>
      <tr><td><span class="code">SO-1039</span><br><small class="muted">Garcia Interiors</small></td><td>Maria Garcia<br><small class="muted">maria@garcia-interiors.example</small></td><td>${badgeRaw("Shipped", "positive", "outline")}</td><td class="num">${MONEY.lamp}</td></tr>
    </tbody>
  </table>
  ${pager(1, 11)}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Drawer holding a small edit, list behind it",
          reference: "Carbon",
          rationale:
            "The drawer carries a record and a short edit beside it, which is the one case where editing in place beats leaving the list.",
          tradeoff:
            "Carbon says a modal is not for repeatable work, and this is repeatable work. The screen gets two nested sets of controls and one narrow column.",
          html: shell(
            "Orders",
            `<div class="page pf" style="position:relative;min-height:620px">
  ${phead("Orders", "Every order across your customers, newest first.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order number, name or email", filters: ["Any state"] })}
  <table class="dt dense">
    <thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col" class="num">Paid</th></tr></thead>
    <tbody>
      <tr class="is-sel"><td><span class="code">SO-1042</span></td><td>${ORDER.customer}</td><td class="num">${MONEY.order}</td></tr>
      <tr><td><span class="code">SO-1041</span></td><td>Tom Becker</td><td class="num">EUR 310.00</td></tr>
      <tr><td><span class="code">SO-1040</span></td><td>Elin Lindqvist</td><td class="num">EUR 64.50</td></tr>
      <tr><td><span class="code">SO-1039</span></td><td>Maria Garcia</td><td class="num">${MONEY.lamp}</td></tr>
    </tbody>
  </table>
  ${drawer(
    `<header><b>${ORDER.number}</b><p class="muted" style="font-size:11.5px">Change one thing. Save it on the record, not here.</p></header>
     <div class="dbody">
       <div class="form">
         ${field("Customer note", '<textarea class="ta" placeholder=""></textarea>', { help: "Only Acme Supply sees this.", optional: true })}
         ${field("Internal state", '<select class="sel"><option>No answer needed</option><option>Calling back</option><option>Waiting on the customer</option></select>')}
         <div class="hint">Saving here leaves the customer's order untouched. Nothing they see changes.</div>
       </div>
     </div>`,
    { footer: '<button class="btn sm">Cancel</button><button class="btn primary sm">Save note</button>' },
  )}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Drawer as a preview, closing back to the same row",
          rationale:
            "A narrow drawer that shows only what the row cannot: the lines, the timeline, the last three things. The record link opens the full page for anything more.",
          tradeoff:
            "The reader has to know when the drawer is enough. One more place to judge, and the difference between it and the record page has to be obvious.",
          html: shell(
            "Orders",
            `<div class="page pf" style="position:relative">
  ${phead("Orders", "Every order across your customers, newest first.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order number, name or email", filters: ["Any state"] })}
  <div class="pf-split">
    <div>
      <table class="dt dense">
        <thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col" class="num">Paid</th></tr></thead>
        <tbody>
          <tr class="is-sel"><td><span class="code">SO-1042</span></td><td>${ORDER.customer}</td><td class="num">${MONEY.order}</td></tr>
          <tr><td><span class="code">SO-1041</span></td><td>Tom Becker</td><td class="num">EUR 310.00</td></tr>
          <tr><td><span class="code">SO-1040</span></td><td>Elin Lindqvist</td><td class="num">EUR 64.50</td></tr>
          <tr><td><span class="code">SO-1039</span></td><td>Maria Garcia</td><td class="num">${MONEY.lamp}</td></tr>
        </tbody>
      </table>
    </div>
    <aside class="pf-stack pf-sticky">
      ${section(
        "Lines",
        `<div class="stack sm">
          <div class="split"><span>Oak desk lamp, 2 pcs <span class="sub">LMP-OAK-01</span></span><span class="fig">EUR 90.00</span></div>
          <div class="split"><span>Pallet handling <span class="sub">Stacked and wrapped</span></span><span class="fig">EUR 30.00</span></div>
          <div class="split"><span>Shipping <span class="sub">Tracked</span></span><span class="fig">EUR 5.00</span></div>
        </div>`,
      )}
      ${section("Last three things", `<div class="tl">${timelineEntry("Paid", "9:34", "", "positive")}${timelineEntry("Confirmation sent", "9:34", "")}${timelineEntry("Order placed", "9:32", "")}</div>`)}
    </aside>
  </div>
</div>`,
            "Orders",
          ),
        },
        {
          name: "Drawer with timeline and reply box",
          reference: "Intercom",
          rationale:
            "Intercom's conversation shape. The drawer carries the timeline above and a reply box below, so reading and answering happen in the same place. The list behind stays the queue to return to.",
          tradeoff:
            "A reply box invites a hasty message from a narrow column, and a long timeline pushes the box out of reach. Prefer it for message-first work, never for records whose facts need the width.",
          html: shell(
            "Orders",
            `<div class="page pf" style="position:relative">
  ${phead("Orders", "Every order across your customers, newest first.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order number, name or email", filters: ["Any state"] })}
  <div class="pf-split">
    <div>
      <table class="dt dense">
        <thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col" class="num">Paid</th></tr></thead>
        <tbody>
          <tr class="is-sel"><td><span class="code">SO-1042</span></td><td>Maria Garcia</td><td class="num">EUR 125.00</td></tr>
          <tr><td><span class="code">SO-1041</span></td><td>Tom Becker</td><td class="num">EUR 310.00</td></tr>
          <tr><td><span class="code">SO-1040</span></td><td>Elin Lindqvist</td><td class="num">EUR 64.50</td></tr>
        </tbody>
      </table>
    </div>
    <aside class="pf-stack pf-sticky">
      ${section("Order SO-1042", `<div class="stack"><div class="tl">${timelineEntry("Maria asked where her order is", "8 Oct, 10:12", "Support inbox")}${timelineEntry("Confirmation sent", "8 Oct, 09:34", "System", "positive")}${timelineEntry("Paid", "8 Oct, 09:32", "Maria Garcia", "positive")}</div>${field("Reply to Maria Garcia", '<textarea class="ta">Your order ships tomorrow morning.</textarea>')}<div class="btnrow end"><button class="btn primary sm">Send</button></div></div>`)}
    </aside>
  </div>
</div>`,
            "Orders",
          ),
        },
        {
          name: "Phone width, drawer becomes a full page",
          rationale:
            "At 390 pixels there is no beside, so the drawer takes the whole screen with a Back control that returns to the list at the same scroll position.",
          tradeoff:
            "The list has to be kept alive behind the full-screen view, which is a navigation model rather than a layout. A real Back is the honest version of this.",
          width: "phone",
          html: shell(
            "Order SO-1042",
            `<div class="page pf">
  <div class="btnrow between" style="margin-bottom:10px">
    <button class="btn sm ghost">‹ All orders</button>
    ${badgeRaw("Paid", "positive", "sq")}
  </div>
  <div class="stack">
    ${section("The customer", dl([["Name", ORDER.customer], ["Email", ORDER.email], ["Country", "Netherlands"]], { stacked: true }))}
    ${section(
      "What was ordered",
      `<div class="stmt">
        <div class="line"><span>Oak desk lamp, 2 pcs<span class="sub">LMP-OAK-01</span></span><span class="fig">${MONEY.lineTotal}</span></div>
        <div class="line"><span>Shipping</span><span class="fig">${MONEY.shipping}</span></div>
        <div class="line"><span>Pallet handling</span><span class="fig">EUR 30.00</span></div>
        <div class="grand"><span>Paid</span><span class="fig">${MONEY.order}</span></div>
      </div>`,
    )}
    ${section("Lines", `<div class="rlist">${recordRow({ title: "Oak desk lamp", sub: "LMP-OAK-01", state: { label: "Confirmed", tone: "positive" } })}${recordRow({ title: "Oak desk lamp", sub: "LMP-OAK-01", state: { label: "Confirmed", tone: "positive" } })}</div>`)}
  </div>
  <div class="btnrow" style="margin-top:12px"><button class="btn primary w-full">Refund this order</button></div>
</div>`,
            "Orders",
          ),
        },
      ],
    },
  ],
};
