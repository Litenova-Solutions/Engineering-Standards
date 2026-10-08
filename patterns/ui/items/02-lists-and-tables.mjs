/**
 * Lists and tables: every decision a table has to make, apart from the frame.
 *
 * The default orders page is a five-column table with a search box, no sorting,
 * no selection and no row actions. Placed is a secondary column, so it leaves
 * below 768 pixels. Ordinary states (Paid, Completed) are muted words and only
 * the others take a badge. The pager reads the range and two chevrons.
 *
 * Every table in this file is drawn by `table()`, which does what a shared data
 * table does at a narrow width: secondary columns hide, the first column
 * stays in place and the rest scroll under it.
 */

import {
  COMPANY,
  DELIVERY,
  MONEY,
  ORDER,
  PEOPLE,
  STATES,
  alert,
  badge,
  badgeRaw,
  dialog,
  drawer,
  emptyState,
  field,
  input,
  notice,
  ordersTable,
  pager,
  phead,
  progress,
  recordRow,
  section,
  segmented,
  select,
  shell,
  split,
  tabs,
  toast,
  toolbar,
  trail,
} from "../parts.mjs";

/** One order row's figures, reused by several variants. */
const ROW = (no, delivery, customer, email, when, state, tone, paid) =>
  [no, delivery, { customer, email }, when, state, tone, paid];

const ORDERS = [
  ROW("7K4Q2M", DELIVERY.name, ORDER.customer, ORDER.email, "8 Oct 09:32", "Paid", "positive", MONEY.order),
  ROW("STT855", DELIVERY.name, "Tom Becker", "tom@becker-bouw.example", "8 Oct 09:30", "Paid", "positive", "EUR 50.00"),
  ROW("PP0K9B", "Counter sale, no delivery", "Maria Garcia", "maria@garcia-interiors.example", "8 Oct 09:27", "Completed", "neutral", "EUR 25.00"),
  ROW("G6OPH8", "Counter sale, no delivery", "Tom Becker", "tom@becker-bouw.example", "8 Oct 09:27", "Completed", "neutral", "EUR 25.00"),
  ROW("V7VZNX", "Becker spring refill", "Elin Lindqvist", "elin@lindqvist.example", "8 Oct 06:23", "Paid", "positive", MONEY.lamp),
  ROW("8M3DWR", "Becker spring refill", "Ade Okafor", "ade@okafor.example", "8 Oct 06:22", "Awaiting payment", "caution", MONEY.lamp),
  ROW("3H3C68", DELIVERY.name, "Elin Lindqvist", "elin@lindqvist.example", "7 Oct 22:14", "Refunded", "neutral", "EUR 50.00"),
  ROW("YB281K", "Lindqvist studio courier", "Ade Okafor", "ade@okafor.example", "7 Oct 19:02", "Disputed", "destructive", MONEY.refund),
];

/** The default state cell: ordinary states are muted words, the rest take a badge. */
const stateCell = (r) => (r[4] === "Paid" || r[4] === "Completed" ? `<span class="muted">${r[4]}</span>` : badgeRaw(r[4], r[5]));

/**
 * A table with whatever columns a variant needs, over ORDERS.
 *
 * A column is `{ label, key?, cls?, sort?, render?, p2?, w? }`. The `when`
 * column is secondary, so it leaves below 768 pixels, as a shared data table
 * hides its own secondary columns. The first column stays in
 * place while the rest scroll under it.
 */
function table(cols, { rows = 6, dense = false, checkbox = false, selected = [], sticky = true } = {}) {
  const th = (c) => {
    const sec = c.key === "when" && c.p2 !== false ? " lt-p2" : c.p2 ? " lt-p2" : "";
    return `<th scope="col" class="${c.cls ?? ""}${c.sort ? " sortable" : ""}${sec}"${c.w ? ` style="width:${c.w}"` : ""}>${c.label}${c.sort ? '<span class="dir">▾</span>' : ""}</th>`;
  };

  const body = ORDERS.slice(0, rows)
    .map((r) => {
      const [no, delivery, who, when, state, tone, paid] = r;
      const [d, m, t] = when.split(" ");
      const values = {
        order: `<span class="lines"><span class="code">${no}</span><small>${delivery}</small></span>`,
        customer: `<span class="lines"><b>${who.customer}</b><small>${who.email}</small></span>`,
        name: `<b>${who.customer}</b>`,
        when: `<span class="nowrap">${d} ${m}<br><small class="muted">${t}</small></span>`,
        state: badgeRaw(state, tone, "outline"),
        plain: state,
        paid: paid,
        acts: '<button class="btn sm">Open</button>',
      };
      const tds = cols
        .map((c) => {
          const sec = c.key === "when" && c.p2 !== false ? " lt-p2" : c.p2 ? " lt-p2" : "";
          return `<td class="${c.cls ?? ""}${sec}">${values[c.key] ?? c.render?.(r) ?? ""}</td>`;
        })
        .join("");
      return `<tr class="${selected.includes(no) ? "sel" : ""}">${
        checkbox ? `<td class="check"><input type="checkbox" ${selected.includes(no) ? "checked" : ""} aria-label="Select order ${no}"></td>` : ""
      }${tds}</tr>`;
    })
    .join("");

  const head = `<thead><tr>${
    checkbox ? '<th class="check"><input type="checkbox" aria-label="Select all orders"></th>' : ""
  }${cols.map(th).join("")}</tr></thead>`;

  return `<table class="dt lt-t${dense ? " dense" : ""}${sticky ? " lt-stuck" : ""}${checkbox ? " lt-has-check" : ""}">${head}<tbody>${body}</tbody></table>`;
}

/** A native select with a filter's options. */
const fsel = (value, options = []) =>
  `<select class="fsel">${[value, ...options.filter((o) => o !== value)].map((o, i) => `<option${i === 0 ? " selected" : ""}>${o}</option>`).join("")}</select>`;

/** A popover anchored under a control, drawn open. */
const popAt = (style, inner) => `<div class="pop lt-pop" style="${style}">${inner}</div>`;

/** The highlighted part of a search match. */
const hit = (s) => `<mark class="lt-mark">${s}</mark>`;

/**
 * The same orders as a list of two-line rows, shown instead of the table below
 * 640 pixels. Polaris renders its condensed rows this way.
 */
function phoneRows(list) {
  return `<div class="lt-cards">${list
    .map((r) => {
      const [no, delivery, who, when, _state, _tone, paid] = r;
      return `<a href="#" class="lt-crow"><span class="t"><span class="code" style="text-decoration:none">${no}</span> <span class="muted" style="font-weight:400">· ${delivery}</span></span><span class="r">${paid}</span><span class="s">${who.customer} · ${when}</span><span class="r" style="font-size:11.5px">${stateCell(r)}</span></a>`;
    })
    .join("")}</div>`;
}

/** A list page inside the console shell. */
function ordersPage(inner, { title = "Orders", desc = "Every paid order, newest first.", crumb = ["Home", "Orders"] } = {}) {
  return shell(title, `<div class="page lt-page">${phead(title, desc, "", { crumb: trail(...crumb) })}${inner}</div>`, title);
}

const CSS = /* css */ `
/* The toolbar's search box takes the row on a phone rather than a fixed 240 px. */
.lt-page .toolbar .search { flex: 1 1 220px; max-width: 320px; }
.lt-page .toolbar .search input { width: 100%; }
@media (max-width: 640px) { .lt-page .toolbar .search { max-width: none; flex-basis: 100%; } }

/* A table keeps its cells aligned and scrolls sideways inside its box. */
.lt-t td { vertical-align: middle; }
.lt-t th { vertical-align: middle; }
.lt-t.dense td { padding-top: 5px; padding-bottom: 5px; }
.lt-t tbody tr:hover > td, .lt-t tbody tr.is-sel > td { background: var(--muted); }
.lt-t a.code { color: inherit; }
.lt-t th:first-child, .lt-t td:first-child { padding-left: 14px; }
.lt-t th:last-child, .lt-t td:last-child { padding-right: 14px; }
.lt-t .check { width: 34px; padding-right: 0; }
.lt-t .check input { accent-color: var(--foreground); margin: 0; vertical-align: middle; }
.lt-t td.act { width: 1%; text-align: right; }
.lt-t td.act .btnrow { flex-wrap: nowrap; justify-content: flex-end; gap: 6px; }

/* The first column (and the checkbox before it) stays put while the rest scroll. */
.lt-stuck tr > :first-child { position: sticky; left: 0; z-index: 1; background: var(--card); }
.lt-stuck.lt-has-check tr > :nth-child(2) { position: sticky; left: 34px; z-index: 1; background: var(--card); }
.lt-stuck tbody tr:hover > :first-child, .lt-stuck tbody tr.is-sel > :first-child,
.lt-stuck.lt-has-check tbody tr:hover > :nth-child(2), .lt-stuck.lt-has-check tbody tr.is-sel > :nth-child(2) { background: var(--muted); }
@media (max-width: 767px) {
  .lt-stuck:not(.lt-has-check) tr > :first-child,
  .lt-stuck.lt-has-check tr > :nth-child(2) { box-shadow: inset -1px 0 0 var(--border), 6px 0 8px -6px var(--scroll-shade); }
}

/* Secondary columns hide below the medium breakpoint, as a shared data table does. */
@media (max-width: 767px) { .lt-t .lt-p2 { display: none; } }

/* Row heights by Carbon's scale. */
.lt-t.lt-h24 td { height: 24px; padding-top: 0; padding-bottom: 0; font-size: 12px; }
.lt-t.lt-h24 .badge { height: 18px; font-size: 10.5px; }
.lt-t.lt-h32 td { height: 32px; padding-top: 0; padding-bottom: 0; }
.lt-t.lt-h40 td { height: 40px; padding-top: 0; padding-bottom: 0; }
.lt-t.lt-h48 td { height: 48px; padding-top: 4px; padding-bottom: 4px; }
.lt-t.lt-h64 td { height: 64px; }
.lt-t.lt-zebra tbody tr:nth-child(even) > td { background: var(--muted); }

/* Helpers that show or hide one breakpoint's control. */
.lt-narrow { display: none !important; }
@media (max-width: 640px) { .lt-narrow { display: revert !important; } .lt-wide { display: none !important; } }

/* A table that becomes a list of rows on a phone. */
.lt-cards { display: none; }
@media (max-width: 640px) {
  .lt-swap .lt-scroll { display: none; }
  .lt-swap table.lt-t { display: none; }
  .lt-swap .lt-cards { display: block; }
}
.lt-crow { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 2px 12px; padding: 11px 14px; border-bottom: 1px solid var(--border); font-size: 12.5px; text-decoration: none; color: inherit; }
.lt-crow:last-child { border-bottom: 0; }
.lt-crow .t { font-weight: 500; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.lt-crow .s { color: var(--muted-foreground); font-size: 11.5px; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.lt-crow .r { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; }

/* A stacked row: every cell as a label and its value. */
.lt-stack-row { padding: 12px 14px; border-bottom: 1px solid var(--border); }
.lt-stack-row:last-child { border-bottom: 0; }
.lt-stack-row dl { display: grid; grid-template-columns: 76px minmax(0, 1fr); gap: 4px 12px; margin: 0; font-size: 12.5px; }
.lt-stack-row dt { color: var(--muted-foreground); font-size: 11.5px; }
.lt-stack-row dd { margin: 0; min-width: 0; overflow-wrap: anywhere; }

/* A filter panel beside the table, stacked above it on a narrow screen. */
.lt-filtergrid { display: grid; grid-template-columns: 170px minmax(0, 1fr); gap: 16px; align-items: start; }
@media (max-width: 820px) { .lt-filtergrid { grid-template-columns: minmax(0, 1fr); } }

/* A column chooser beside the table, stacked under it on a narrow screen. */
.lt-colgrid { display: grid; grid-template-columns: minmax(0, 1fr) 165px; gap: 12px; align-items: start; }
@media (max-width: 820px) { .lt-colgrid { grid-template-columns: minmax(0, 1fr); } }

/* Popovers and menus drawn open over the page. */
.lt-anchor { position: relative; }
.lt-pop { position: absolute; z-index: 6; }
.lt-pop .item { white-space: nowrap; }
.lt-pop .item .n { margin-left: auto; color: var(--muted-foreground); font-size: 11px; font-variant-numeric: tabular-nums; padding-left: 14px; }
.lt-pop .item input { accent-color: var(--foreground); margin: 0; }
.lt-corner { position: absolute; right: 16px; bottom: 16px; z-index: 6; max-width: calc(100% - 32px); }

/* A faceted filter button: dashed until something is chosen. */
.lt-facet { display: inline-flex; align-items: center; gap: 6px; height: 32px; padding: 0 10px; border: 1px dashed var(--input); border-radius: var(--radius-sm); background: var(--background); font-size: 12.5px; color: var(--foreground); cursor: pointer; white-space: nowrap; }
.lt-facet.on { border-style: solid; }
.lt-facet .sep { width: 1px; height: 14px; background: var(--border); }
.lt-facet .badge { height: 19px; border-radius: 4px; padding: 0 6px; }
.lt-facet .plus { color: var(--muted-foreground); }

/* A filter condition chip, Linear's shape. */
.lt-cond { display: inline-flex; align-items: stretch; height: 28px; border: 1px solid var(--border); border-radius: var(--radius-sm); font-size: 12px; overflow: hidden; background: var(--background); }
.lt-cond > span { display: inline-flex; align-items: center; padding: 0 8px; white-space: nowrap; }
.lt-cond > span + span { border-left: 1px solid var(--border); }
.lt-cond .k { color: var(--muted-foreground); }
.lt-cond .op { color: var(--muted-foreground); }
.lt-cond .v { font-weight: 500; }
.lt-cond .x { color: var(--muted-foreground); cursor: pointer; }

/* The bulk band, edge to edge above the rows. */
.lt-band { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; padding: 8px 14px; border-bottom: 1px solid var(--border); background: var(--muted); font-size: 12.5px; }
.lt-band .acts { margin-left: auto; display: flex; gap: 6px; flex-wrap: wrap; }
.lt-float { position: absolute; left: 50%; bottom: 18px; transform: translateX(-50%); z-index: 6; display: flex; align-items: center; gap: 10px; padding: 7px 8px 7px 14px; border-radius: 10px; background: var(--popover); color: var(--popover-foreground); border: 1px solid var(--border); box-shadow: 0 10px 30px var(--scroll-shade); font-size: 12.5px; white-space: nowrap; max-width: calc(100% - 24px); }
.lt-float .acts { display: flex; gap: 6px; }
@media (max-width: 640px) { .lt-float { left: 12px; right: 12px; transform: none; flex-wrap: wrap; white-space: normal; } .lt-float .acts { margin-left: auto; } }

/* Sortable headers. */
.lt-sortbtn { display: inline-flex; align-items: center; gap: 4px; margin: -4px -6px; padding: 4px 6px; border: 0; border-radius: 5px; background: transparent; color: inherit; font: inherit; cursor: pointer; }
.lt-sortbtn:hover { background: var(--muted); color: var(--foreground); }
.lt-sortbtn.on { color: var(--foreground); }
.lt-arrow { font-size: 11px; margin-left: 2px; color: var(--foreground); }
.lt-arrow.faint { color: var(--muted-foreground); opacity: 0.7; }

/* A search match. */
.lt-mark { background: var(--caution-surface); color: var(--caution-surface-foreground); border-radius: 2px; padding: 0 1px; }

/* Group and expansion rows. */
.lt-t tr.lt-group > td { background: var(--muted); font-size: 12px; font-weight: 600; height: 34px; }
.lt-t tr.lt-group .muted { font-weight: 400; }
.lt-t tr.lt-group .tot { float: right; font-variant-numeric: tabular-nums; }
.lt-t tr.lt-child > td:first-child { padding-left: 34px; }
.lt-t tr.lt-detail > td { white-space: normal; background: var(--background); padding: 12px 14px 14px 44px; }
.lt-t tr.lt-detail:hover > td { background: var(--background); }
.lt-tog { display: inline-grid; place-items: center; width: 20px; height: 20px; border-radius: 4px; border: 0; background: transparent; color: var(--muted-foreground); cursor: pointer; font-size: 10px; margin-right: 4px; vertical-align: middle; }
.lt-tog:hover { background: var(--muted); }
.lt-ilines { display: grid; grid-template-columns: minmax(0, 1fr) auto auto; gap: 4px 18px; font-size: 12px; max-width: 520px; }
.lt-ilines .num { text-align: right; font-variant-numeric: tabular-nums; }
.lt-ilines .h { color: var(--muted-foreground); font-size: 11px; }

/* Column chrome: resize handles and pinned edges. */
.lt-t th.lt-rs { position: relative; }
.lt-t th.lt-rs::after { content: ""; position: absolute; right: 0; top: 7px; bottom: 7px; width: 1px; background: var(--border); }
.lt-t th.lt-rs.drag::after { width: 3px; right: -1px; top: 0; bottom: 0; background: var(--ring); }
.lt-pin-end tr > :last-child { position: sticky; right: 0; z-index: 1; background: var(--card); box-shadow: inset 1px 0 0 var(--border), -6px 0 8px -6px var(--scroll-shade); }
.lt-pin-end tbody tr:hover > :last-child { background: var(--muted); }
.lt-t .lt-trunc { display: inline-block; max-width: 150px; overflow: hidden; text-overflow: ellipsis; vertical-align: bottom; }

/* Deliveries as cards and as a date-led list. */
.lt-cards-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 12px; }
.lt-ecard { border: 1px solid var(--border); border-radius: var(--radius); background: var(--card); overflow: hidden; display: flex; flex-direction: column; }
.lt-ecard .cover { aspect-ratio: 16 / 7; background: var(--muted); display: grid; place-items: center; color: var(--muted-foreground); font-size: 11px; }
.lt-ecard .bd { padding: 12px 14px; display: flex; flex-direction: column; gap: 6px; }
.lt-ecard .nm { font-weight: 600; font-size: 13px; }
.lt-ecard .meta { color: var(--muted-foreground); font-size: 11.5px; }
.lt-sold { display: inline-flex; flex-direction: column; gap: 4px; min-width: 110px; font-size: 12px; }
.lt-datebox { width: 44px; flex: none; text-align: center; border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 4px 0; line-height: 1.15; }
.lt-datebox b { display: block; font-size: 16px; }
.lt-datebox small { display: block; font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--muted-foreground); }
.lt-erow { display: flex; align-items: center; gap: 14px; padding: 12px 14px; border-bottom: 1px solid var(--border); }
.lt-erow:last-child { border-bottom: 0; }
.lt-erow .txt { flex: 1; min-width: 0; }
.lt-erow .txt b { display: block; font-weight: 500; }
.lt-erow .txt small { display: block; color: var(--muted-foreground); font-size: 11.5px; }
@media (max-width: 640px) { .lt-erow { flex-wrap: wrap; } .lt-erow .lt-sold { flex-basis: 100%; padding-left: 58px; } }
.lt-mhead { padding: 14px 2px 6px; font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--muted-foreground); font-weight: 600; }
.lt-cal { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); border-top: 1px solid var(--border); border-left: 1px solid var(--border); font-size: 11px; }
.lt-cal > div { border-right: 1px solid var(--border); border-bottom: 1px solid var(--border); min-height: 64px; padding: 4px 5px; min-width: 0; }
.lt-cal .dow { min-height: 0; color: var(--muted-foreground); font-weight: 500; text-align: center; padding: 5px 0; }
.lt-cal .out { color: var(--muted-foreground); opacity: 0.5; }
.lt-cal .ev { display: block; margin-top: 3px; padding: 2px 4px; border-radius: 3px; background: var(--info-surface); color: var(--info-surface-foreground); font-size: 10.5px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.lt-cal .ev.pos { background: var(--positive-surface); color: var(--positive-surface-foreground); }

/* Money with its second line. */
.lt-money2 { display: inline-flex; flex-direction: column; align-items: flex-end; line-height: 1.35; }
.lt-money2 small { color: var(--muted-foreground); font-size: 11px; }
`;

const METHOD = { "7K4Q2M": "Bank transfer", STT855: "Card", PP0K9B: "Bank transfer", G6OPH8: "Direct debit", V7VZNX: "Bank transfer", "8M3DWR": "Bank transfer", "3H3C68": "Direct debit", YB281K: "Card" };
const CHANNEL = { "7K4Q2M": "Online", STT855: "Online", PP0K9B: "Online", G6OPH8: "Online", V7VZNX: "Online", "8M3DWR": "Counter", "3H3C68": "Online", YB281K: "Online" };

export const CATEGORY_LISTS_TABLES = {
  css: CSS,
  items: [
    {
      id: "table-columns",
      title: "Choosing the columns",
      why: "A column is a fact a reader uses to choose a row. The question each time is what the reader <b>sorts or scans by</b>, and the default table answers with order number, customer, placed, state and paid, which covers choosing but not filtering. Placed is a secondary column, so it leaves below 768 pixels.",
      verdict:
        "Keep the default five columns (a): they answer which order, who, when, what state and how much, and the delivery already rides under the order code. The runner-up is the Columns popover (h), worth adding once a sixth fact such as method or channel is asked for by more than one team. Saved views (i) are the right answer later, when finance and the warehouse want different tables. Never ship the question-shaped headers (f): they cost width and read as a form.",
      variants: [
        {
          name: "Five columns, nothing removable",
          pick: true,
          rationale:
            "The default set. Five columns is what fits 1440 without scrolling and covers the four questions: which order, who, when, what state, what money.",
          tradeoff:
            "Nothing can be dropped or added, so a team that wants the delivery as its own column or hides the email has no way to get there.",
          html: shell(
            "Orders",
            `<div class="page lt-page">
  ${phead("Orders", "Every paid order across every delivery, newest first.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order number, name or email" })}
  ${section("", table([{ label: "Order", key: "order", sort: true }, { label: "Customer", key: "customer" }, { label: "Placed", key: "when", sort: true }, { label: "State", key: "state" }, { label: "Paid", key: "paid", cls: "num", sort: true }], { checkbox: true, selected: ["7K4Q2M"] }), { flush: true })}
  ${pager(1, 11)}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Six columns with a column chooser",
          rationale:
            "Add the delivery as its own column and offer a chooser so each back-office user keeps the columns they use. TanStack's <code>columnVisibility</code> is a plain per-user map, so the state is cheap.",
          tradeoff:
            "The chooser is one more control, and a table where everyone sees different columns is harder to talk about in a support reply.",
          reference: "TanStack",
          html: shell(
            "Orders",
            `<div class="page lt-page">
  ${phead("Orders", "Every paid order across every delivery, newest first.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order number, name or email", filters: ["Any state"], right: '<button class="btn sm">Columns</button>' })}
  ${section("", table([{ label: "Order", key: "order", sort: true }, { label: "Delivery", render: (r) => r[1] }, { label: "Customer", key: "customer" }, { label: "Placed", key: "when", sort: true }, { label: "State", key: "state" }, { label: "Paid", key: "paid", cls: "num", sort: true }]), { flush: true })}
  ${pager(1, 11)}
</div>`,
            "Orders",
          ),
        },
        {
          name: "A chooser that shows the current set",
          rationale:
            "The Columns control opens a list of every column with a checkbox, a drag handle and a Reset to default. The reader sees what they are looking at rather than picking from memory.",
          tradeoff:
            "Two panes, so the table is squeezed while the chooser is open. A popover narrow enough to fit beside the button avoids that.",
          html: shell(
            "Orders",
            `<div class="page lt-page">
  ${phead("Orders", "Every paid order across every delivery, newest first.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order number, name or email", right: '<button class="btn sm">Columns</button>' })}
  <div class="lt-colgrid">
    ${section("", table([{ label: "Order", key: "order", sort: true }, { label: "Customer", key: "customer" }, { label: "Placed", key: "when", sort: true }, { label: "State", key: "state" }, { label: "Paid", key: "paid", cls: "num", sort: true }], { rows: 5 }), { flush: true })}
    <aside class="section">
      <h3>Columns <span class="acts"><button class="btn xs ghost">Reset</button></span></h3>
      <div class="body">
        <div class="stack sm">
          ${[
            ["Order", true, true],
            ["Customer", true, false],
            ["Placed", true, false],
            ["State", true, false],
            ["Paid", true, false],
            ["Delivery", false, false],
            ["Lines", false, false],
            ["Method", false, false],
            ["Channel", false, false],
          ]
            .map(
              ([name, on, pinned]) => `<label class="check" style="align-items:center"><input type="checkbox" ${on ? "checked" : ""} ${pinned ? "disabled" : ""}><span>${name}${pinned ? `<span class="cd">Always shown</span>` : ""}</span></label>`,
            )
            .join("")}
        </div>
      </div>
    </aside>
  </div>
  ${pager(1, 11)}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Two lines per row, one column per fact group",
          rationale:
            "Fold delivery into the order cell and customer into one cell, so the table is three columns wide and each row reads as two records of two lines.",
          tradeoff:
            "Sorting by delivery becomes impossible, because delivery is not a column. Carbon wants sorting in the headers, and a folded cell has nowhere to put an arrow.",
          html: shell(
            "Orders",
            `<div class="page lt-page">
  ${phead("Orders", "Every paid order across every delivery, newest first.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order number, name or email" })}
  ${section("", table([{ label: "Order and delivery", key: "order" }, { label: "Customer", key: "customer" }, { label: "State", key: "state" }, { label: "Paid", key: "paid", cls: "num", sort: true }], { checkbox: true }), { flush: true })}
  ${pager(1, 11)}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Columns sized to their content",
          rationale:
            "The money column is narrow and right-aligned, the customer column takes the slack, the date column is fixed. Each column is as wide as its values rather than an even split.",
          tradeoff:
            "A long customer name pushes its column wider on one row and narrower on the rest, because table layout is content-driven. Fixed widths are the only way to stop that.",
          html: shell(
            "Orders",
            `<div class="page lt-page">
  ${phead("Orders", "Every paid order across every delivery, newest first.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order number, name or email" })}
  ${section(
    "",
    `<table class="dt lt-t lt-stuck">
      <colgroup><col style="width:22%"><col style="width:auto"><col style="width:11%"><col style="width:10%"><col style="width:9%"></colgroup>
      <thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col" class="lt-p2">Placed</th><th scope="col">State</th><th scope="col" class="num">Paid</th></tr></thead>
      <tbody>
        ${ORDERS.slice(0, 6)
          .map(([no, delivery, who, when, state, tone, paid]) => {
            const [d, m, t] = when.split(" ");
            return `<tr><td><span class="lines"><span class="code">${no}</span><small>${delivery}</small></span></td><td><span class="lines"><b>${who.customer}</b><small>${who.email}</small></span></td><td class="nowrap lt-p2">${d} ${m}<br><small class="muted">${t}</small></td><td>${badgeRaw(state, tone, "outline")}</td><td class="num">${paid}</td></tr>`;
          })
          .join("")}
      </tbody>
    </table>`,
    { flush: true },
  )}
  ${pager(1, 11)}
</div>`,
            "Orders",
          ),
        },
        {
          name: "One column per question, headers that name the question",
          rationale:
            "Headers become the questions the reader asks: Who, Which delivery, When, State, How much. Each header is sortable, and the reader can name what they are looking at.",
          tradeoff:
            "Longer headers take width from the data, and 'How much was paid' is a question rather than a field name, which breaks the one-word-per-column feel.",
          html: shell(
            "Orders",
            `<div class="page lt-page">
  ${phead("Orders", "Every paid order across every delivery, newest first.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Search orders", filters: ["Any state", "Any delivery"] })}
  ${section(
    "",
    table(
      [
        { label: "Who bought", key: "name", sort: true },
        { label: "For which delivery", render: (r) => r[1], sort: true },
        { label: "When they paid", key: "when", sort: true },
        { label: "What state", key: "state" },
        { label: "How much", key: "paid", cls: "num", sort: true },
      ],
      { rows: 5 },
    ),
    { flush: true },
  )}
  ${pager(1, 11)}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Customer first, order code deferred to the record",
          rationale:
            "Faster support triage. Support starts from who is asking, not from a code, so the customer and the delivery lead and the order code waits on the record where it is needed. The caller is identified in the first two cells.",
          tradeoff:
            "Two orders by one customer for one delivery read as near-identical rows until one is opened, because nothing on the row tells them apart. Costs the scannable identity the default order column gives.",
          html: shell(
            "Orders",
            `<div class="page lt-page">
  ${phead("Orders", "Three orders for " + DELIVERY.name + ", newest first.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Customer name", filters: ["Any state"], right: '<button class="btn sm">Export</button>' })}
  ${section(
    "",
    '<table class="dt lt-t lt-stuck">' +
      '<thead><tr><th scope="col">Customer</th><th scope="col">Delivery</th><th scope="col">State</th>' +
      '<th scope="col" class="num">Paid</th><th scope="col"></th></tr></thead><tbody>' +
      '<tr><td><b>' + ORDER.customer + '</b></td><td>' + DELIVERY.name + '</td><td>' + badge(STATES.paid) + '</td>' +
      '<td class="num">' + MONEY.order + '</td><td class="num"><button class="btn sm">Open</button></td></tr>' +
      '<tr><td><b>' + PEOPLE.otherCustomer.name + '</b></td><td>' + DELIVERY.name + '</td><td>' + badge(STATES.awaiting) + '</td>' +
      '<td class="num">' + MONEY.lamp + '</td><td class="num"><button class="btn sm">Open</button></td></tr>' +
      '<tr><td><b>' + ORDER.customer + '</b></td><td>' + DELIVERY.name + '</td><td>' + badge(STATES.refunded) + '</td>' +
      '<td class="num">' + MONEY.refund + '</td><td class="num"><button class="btn sm">Open</button></td></tr>' +
      '</tbody></table>',
    { flush: true },
  )}
  ${pager(1, 1, 1, 3, 3)}
</div>`,
            "Orders",
          ),
        },
        {
          name: "A Columns popover listing every column",
          rationale:
            "The Columns control opens a popover with every column, a checkbox each and Reset to default. The order column is always shown and says so. This is the shadcn/ui data-table view-options menu, and Linear's Display panel works the same way.",
          tradeoff:
            "The popover covers the table while it is open, and drag-to-reorder inside it is a second feature that most back-office users would never find.",
          reference: "shadcn/ui",
          html: shell(
            "Orders",
            `<div class="page lt-page">
  ${phead("Orders", "Every paid order across every delivery, newest first.", "", { crumb: trail("Home", "Orders") })}
  <div class="lt-anchor">${toolbar({ search: "", placeholder: "Order number, name or email", right: '<button class="btn sm" aria-expanded="true">Columns <span class="muted">▾</span></button>' })}
  ${popAt(
    "right:0;top:38px;width:210px",
    `<div class="cap">Columns</div>${[
      ["Order", true, true],
      ["Customer", true],
      ["Placed", true],
      ["State", true],
      ["Paid", true],
      ["Delivery", false],
      ["Method", false],
      ["Channel", false],
    ]
      .map(([nm, on, fixed]) => `<label class="item"${fixed ? ' style="opacity:.6;cursor:default"' : ""}><input type="checkbox"${on ? " checked" : ""}${fixed ? " disabled" : ""}>${nm}${fixed ? '<span class="n">Always shown</span>' : ""}</label>`)
      .join("")}<div class="sep"></div><div class="item">Reset to default</div>`,
  )}</div>
  ${section("", table([{ label: "Order", key: "order", sort: true }, { label: "Customer", key: "customer" }, { label: "Placed", key: "when", sort: true }, { label: "State", key: "state" }, { label: "Paid", key: "paid", cls: "num", sort: true }], { rows: 5 }), { flush: true })}
  ${pager(1, 11)}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Saved views carry their own columns",
          rationale:
            "HubSpot and Linear tie a column set to a saved view. All orders keeps the default five, Finance swaps in method, paid and refunded, and Dispatch list shows customer, delivery and lines. Each role opens the table it needs, and a support reply can name the view.",
          tradeoff:
            "Views are a feature with its own lifecycle: who may create one, whether they are shared, and what happens when a column is retired. Too much for a first release.",
          reference: "HubSpot",
          html: shell(
            "Orders",
            `<div class="page lt-page">
  ${phead("Orders", "Finance view: what was paid, how, and what went back.", "", { crumb: trail("Home", "Orders") })}
  ${tabs(["All orders", "Finance", "Dispatch list", "+ New view"], 1)}
  ${toolbar({ search: "", placeholder: "Order number, name or email", filters: [fsel("This month", ["Any date"])] })}
  ${section(
    "",
    table(
      [
        { label: "Order", render: (r) => `<span class="code">${r[0]}</span>` },
        { label: "Placed", key: "when" },
        { label: "Method", render: (r) => METHOD[r[0]] },
        { label: "Paid", cls: "num", render: (r) => r[6] },
        { label: "Refunded", cls: "num", render: (r) => (r[4] === "Refunded" ? r[6] : '<span class="muted">–</span>') },
      ],
      { rows: 7 },
    ),
    { flush: true },
  )}
  ${pager(1, 3, 1, 25, 58)}
</div>`,
            "Orders",
          ),
        },
      ],
    },
    {
      id: "table-sorting",
      title: "Sorting",
      why: "The default orders table passes no sorting; it is newest first. Where a table passes <code>sorting</code>, each sortable header is drawn as a ghost button with an up-down arrow, and the sorted one with a solid up or down arrow. The sort lives in the URL, so a link carries it.",
      verdict:
        "The pick is (g), every sortable header carries an arrow: it states that headers sort on touch screens too. The runner-up is (h), headers on a desktop with a Sort control on the phone list, which becomes necessary the moment the table turns into rows below 640 pixels. Never ship (d), multi-column sort: no back-office question needs two keys.",
      compact: {
        option: "Headers on a desktop, a sort control on a phone",
        behaviour: "Below 640 pixels the table becomes two-line rows and the headers leave with it, so a Sort control carries the same sort from the toolbar.",
      },
      variants: [
        {
          name: "Arrow on the sorted column only",
          rationale:
            "One arrow, on the column the table is sorted by, showing which way. Every other header is plain text that becomes a button on hover.",
          tradeoff:
            "Nothing tells a reader that the other headers sort at all until they hover, which is invisible on a touch screen.",
          html: shell(
            "Orders",
            `<div class="page lt-page">
  ${phead("Orders", "Sorted by newest first.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order number, name or email" })}
  ${section(
    "",
    `<table class="dt lt-t lt-stuck">
      <thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col" class="sortable lt-p2">Placed <span class="dir">↓</span></th><th scope="col" class="sortable">State</th><th scope="col" class="sortable num">Paid</th></tr></thead>
      <tbody>
        ${ORDERS.slice(0, 5)
          .map(([no, delivery, who, when, state, tone, paid]) => `<tr><td><span class="lines"><span class="code">${no}</span><small>${delivery}</small></span></td><td><span class="lines"><b>${who.customer}</b><small>${who.email}</small></span></td><td class="nowrap lt-p2">${when}</td><td>${badgeRaw(state, tone, "outline")}</td><td class="num">${paid}</td></tr>`)
          .join("")}
      </tbody>
    </table>`,
    { flush: true, acts: '<span class="badge">Newest first</span>' },
  )}
  ${pager(1, 11)}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Sort as a control above the table",
          rationale:
            "The sort is one named control rather than six header affordances: Sort: newest first. Works on a touch screen and states itself in words.",
          tradeoff:
            "The reader has to find the control to change the order, and Carbon's own guidance is that sorting belongs in the headers.",
          html: shell(
            "Orders",
            `<div class="page lt-page">
  ${phead("Orders", "Every paid order across every delivery.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order number, name or email", filters: ["Any state"], right: '<select class="fsel"><option selected>Newest first</option><option>Oldest first</option><option>Highest paid</option><option>Lowest paid</option></select>' })}
  ${section("", table([{ label: "Order", key: "order" }, { label: "Customer", key: "customer" }, { label: "Placed", key: "when" }, { label: "State", key: "state" }, { label: "Paid", key: "paid", cls: "num" }], { rows: 5 }), { flush: true })}
  ${pager(1, 11)}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Arrows on hover plus a reset",
          rationale:
            "Unsortable headers carry a faint arrow on hover; the sorted one is dark. A Reset sort control appears only while a sort is applied, so the default state stays clean.",
          tradeoff:
            "The reset is a control that only sometimes exists, which is its own inconsistency. It is also invisible until a sort has been applied.",
          html: shell(
            "Orders",
            `<div class="page lt-page">
  ${phead("Orders", "Every paid order across every delivery.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order number, name or email", right: '<button class="btn sm">Reset sort</button>' })}
  ${section(
    "",
    `<table class="dt lt-t lt-stuck">
      <thead><tr><th scope="col" class="sortable">Order <span class="dir" style="opacity:.3">↕</span></th><th scope="col" class="sortable">Customer <span class="dir" style="opacity:.3">↕</span></th><th scope="col" class="sortable lt-p2">Placed <span class="dir">↓</span></th><th scope="col" class="sortable">State <span class="dir" style="opacity:.3">↕</span></th><th scope="col" class="sortable num">Paid <span class="dir" style="opacity:.3">↕</span></th></tr></thead>
      <tbody>
        ${ORDERS.slice(0, 5)
          .map(([no, delivery, who, when, state, tone, paid]) => `<tr><td><span class="lines"><span class="code">${no}</span><small>${delivery}</small></span></td><td><span class="lines"><b>${who.customer}</b><small>${who.email}</small></span></td><td class="nowrap lt-p2">${when}</td><td>${badgeRaw(state, tone, "outline")}</td><td class="num">${paid}</td></tr>`)
          .join("")}
      </tbody>
    </table>`,
    { flush: true },
  )}
  ${pager(1, 11)}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Multi-column sort, shown as a stack",
          rationale:
            "When a reader sorts by delivery and then by date, the table says so in words rather than relying on two arrows. Useful once a table genuinely needs a secondary key.",
          tradeoff:
            "Almost no reader needs two keys, and the control is a menu of menus. Carbon treats sorting as one column at a time.",
          html: shell(
            "Orders",
            `<div class="page lt-page">
  ${phead("Orders", "Every paid order across every delivery.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({
    search: "",
    placeholder: "Order number, name or email",
    right: '<button class="btn sm">Sort: 2 <span class="muted">▾</span></button>',
  })}
  ${section(
    "",
    `<table class="dt lt-t lt-stuck">
      <thead><tr><th scope="col">Order <span class="dir" style="font-size:10px">1 ↑</span></th><th scope="col">Delivery</th><th scope="col">Customer</th><th scope="col" class="lt-p2">Placed <span class="dir" style="font-size:10px">2 ↓</span></th><th scope="col" class="num">Paid</th></tr></thead>
      <tbody>
        ${[
          ["7K4Q2M", DELIVERY.name, "Maria Garcia", "8 Oct 09:32", MONEY.order],
          ["STT855", DELIVERY.name, "Tom Becker", "8 Oct 09:30", "EUR 50.00"],
          ["V7VZNX", "Becker spring refill", "Elin Lindqvist", "8 Oct 06:23", MONEY.lamp],
          ["8M3DWR", "Becker spring refill", "Ade Okafor", "8 Oct 06:22", MONEY.lamp],
          ["3H3C68", "Counter sale, no delivery", "Elin Lindqvist", "7 Oct 22:14", "EUR 50.00"],
        ]
          .map(([no, dl, who, when, paid]) => `<tr><td><span class="code">${no}</span></td><td>${dl}</td><td>${who}</td><td class="nowrap lt-p2">${when}</td><td class="num">${paid}</td></tr>`)
          .join("")}
      </tbody>
    </table>`,
    { flush: true, desc: "Sorted by delivery, then by date inside each delivery." },
  )}
  ${pager(1, 11)}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Sorting stated in the page description",
          rationale:
            "The order is stated once, in words, under the heading, and the headers stay plain. A reader who wants a different order clicks a header.",
          tradeoff:
            "The statement goes stale the moment a reader sorts by clicking, so the page contradicts itself unless the description updates too.",
          html: shell(
            "Orders",
            `<div class="page lt-page">
  ${phead("Orders", "Every paid order across every delivery, newest first. Click a heading to sort it.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order number, name or email" })}
  ${section("", table([{ label: "Order", key: "order" }, { label: "Customer", key: "customer" }, { label: "Placed", key: "when" }, { label: "State", key: "state" }, { label: "Paid", key: "paid", cls: "num" }], { rows: 5 }), { flush: true })}
  ${pager(1, 11)}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Sort only the column that has choices",
          rationale:
            "Only two headers are buttons: money and date. Order and state sort alphabetically, which almost nobody wants, so they are not buttons at all.",
          tradeoff:
            "Selective sorting breaks the expectation that every header is a control, and it hides a capability rather than offering it.",
          html: shell(
            "Orders",
            `<div class="page lt-page">
  ${phead("Orders", "Every paid order across every delivery.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order number, name or email" })}
  ${section(
    "",
    `<table class="dt lt-t lt-stuck">
      <thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col" class="sortable lt-p2">Placed <span class="dir">↓</span></th><th scope="col">State</th><th scope="col" class="sortable num">Paid <span class="dir" style="opacity:.3">↕</span></th></tr></thead>
      <tbody>
        ${ORDERS.slice(0, 5)
          .map(([no, delivery, who, when, state, tone, paid]) => `<tr><td><span class="lines"><span class="code">${no}</span><small>${delivery}</small></span></td><td><span class="lines"><b>${who.customer}</b><small>${who.email}</small></span></td><td class="nowrap lt-p2">${when}</td><td>${badgeRaw(state, tone, "outline")}</td><td class="num">${paid}</td></tr>`)
          .join("")}
      </tbody>
    </table>`,
    { flush: true, acts: '<span class="muted" style="font-size:11.5px">Only date and money sort</span>' },
  )}
  ${pager(1, 11)}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Every sortable header carries an arrow",
          pick: true,
          rationale:
            "Each sortable header is a ghost button with a faint up-down arrow, and the sorted one has a solid arrow. The shadcn/ui and TanStack table examples do the same, and so does Stripe.",
          tradeoff:
            "Five arrows is more ink in the header row, and a header that does not sort (Customer) looks inert beside its neighbours.",
          reference: "shadcn/ui",
          html: shell(
            "Orders",
            `<div class="page lt-page">
  ${phead("Orders", "Every paid order across every delivery.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order number, name or email" })}
  ${section(
    "",
    `<table class="dt lt-t lt-stuck">
      <thead><tr><th scope="col"><button class="lt-sortbtn">Order <span class="lt-arrow faint">↕</span></button></th><th scope="col">Customer</th><th scope="col" class="lt-p2"><button class="lt-sortbtn on" aria-sort="descending">Placed <span class="lt-arrow">↓</span></button></th><th scope="col"><button class="lt-sortbtn">State <span class="lt-arrow faint">↕</span></button></th><th scope="col" class="num"><button class="lt-sortbtn">Paid <span class="lt-arrow faint">↕</span></button></th></tr></thead>
      <tbody>
        ${ORDERS.slice(0, 6)
          .map(([no, delivery, who, when, state, tone, paid]) => `<tr><td><span class="lines"><span class="code">${no}</span><small>${delivery}</small></span></td><td><span class="lines"><b>${who.customer}</b><small>${who.email}</small></span></td><td class="nowrap lt-p2">${when}</td><td>${stateCell([no, delivery, who, when, state, tone, paid])}</td><td class="num">${paid}</td></tr>`)
          .join("")}
      </tbody>
    </table>`,
    { flush: true },
  )}
  ${pager(1, 11)}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Headers on a desktop, a sort control on a phone",
          rationale:
            "Stripe's dashboard sorts from the headers on a wide screen and its mobile list carries a Sort control instead, because a list of rows has no headers to click. The same URL parameter drives both.",
          tradeoff:
            "Two controls for one state, and only worth building once the table actually becomes a list on a phone.",
          reference: "Stripe",
          html: shell(
            "Orders",
            `<div class="page lt-page">
  ${phead("Orders", "Every paid order across every delivery.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order number, name or email", right: `<span class="lt-narrow">${fsel("Newest first", ["Oldest first", "Highest paid"])}</span>` })}
  <div class="lt-swap">${section(
    "",
    `<table class="dt lt-t lt-stuck">
      <thead><tr><th scope="col"><button class="lt-sortbtn">Order <span class="lt-arrow faint">↕</span></button></th><th scope="col">Customer</th><th scope="col" class="lt-p2"><button class="lt-sortbtn on">Placed <span class="lt-arrow">↓</span></button></th><th scope="col">State</th><th scope="col" class="num"><button class="lt-sortbtn">Paid <span class="lt-arrow faint">↕</span></button></th></tr></thead>
      <tbody>
        ${ORDERS.slice(0, 6)
          .map(([no, delivery, who, when, state, tone, paid]) => `<tr><td><span class="lines"><span class="code">${no}</span><small>${delivery}</small></span></td><td><span class="lines"><b>${who.customer}</b><small>${who.email}</small></span></td><td class="nowrap lt-p2">${when}</td><td>${stateCell([no, delivery, who, when, state, tone, paid])}</td><td class="num">${paid}</td></tr>`)
          .join("")}
      </tbody>
    </table>${phoneRows(ORDERS.slice(0, 6))}`,
    { flush: true },
  )}</div>
  ${pager(1, 11)}
</div>`,
            "Orders",
          ),
        },
      ],
    },
    {
      id: "table-filters",
      title: "Filters",
      why: "The default orders page has a search box and nothing else. Carbon's rule is that <b>a closed filter control shows how many are applied and can clear them without reopening</b>, and that several filter categories never go inside one dropdown.",
      verdict:
        "The pick is (a), one visible control per category: a reader sees what can be filtered without opening anything, and each category keeps its own control. The runner-up is (h), faceted buttons with counts, once a category holds more than a few values and the reader needs to see the split before choosing. Never ship (e), every category inside one dropdown: it hides the applied state and contradicts the rule this item states.",
      variants: [
        {
          name: "One filter per category, visible",
          pick: true,
          rationale:
            "Delivery, state, date and channel each get their own control in one row. No menu holds more than one category, so a reader can see what is available without opening anything.",
          tradeoff:
            "Four controls plus a search box is a wide toolbar. Below about 700 pixels they have to wrap or collapse, which is where the complexity moves.",
          html: shell(
            "Orders",
            `<div class="page lt-page">
  ${phead("Orders", "268 orders across 40 deliveries.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Search orders", filters: ["Any delivery", "Any state", "Any date", "Any channel"] })}
  ${section("", table([{ label: "Order", key: "order" }, { label: "Customer", key: "customer" }, { label: "Placed", key: "when" }, { label: "State", key: "state" }, { label: "Paid", key: "paid", cls: "num" }], { rows: 5 }), { flush: true })}
  ${pager(1, 11)}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Applied filters restated as chips",
          rationale:
            "The controls stay, and the row underneath restates what is applied with a remove control each. The chip row is the honest answer to 'what am I looking at', which the toolbar alone is not.",
          tradeoff:
            "The chips restate the controls, saying one thing twice on one page.",
          html: shell(
            "Orders",
            `<div class="page lt-page">
  ${phead("Orders", "12 orders match.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Search orders", filters: [DELIVERY.name, "Any state", "This month", "Any channel"], right: '<button class="btn sm ghost">Clear all</button>' })}
  <div class="inline" style="margin:-2px 0 10px">
    <span class="chip">${DELIVERY.name} <button class="x" aria-label="Remove the delivery filter">✕</button></span>
    <span class="chip">This month <button class="x" aria-label="Remove the date filter">✕</button></span>
  </div>
  ${section("", table([{ label: "Order", key: "order" }, { label: "Customer", key: "customer" }, { label: "Placed", key: "when" }, { label: "State", key: "state" }, { label: "Paid", key: "paid", cls: "num" }], { rows: 4 }), { flush: true })}
  ${pager(1, 1, 1, 12, 12)}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Filters with an applied count on the control",
          rationale:
            "Each closed control carries a count badge, so the reader knows a filter is narrowing the table without opening anything. Carbon asks for exactly this minimum indicator.",
          tradeoff:
            "A count of one on a select is a badge that reads as decoration unless the reader knows what it means. It is only clear beside a label.",
          html: shell(
            "Orders",
            `<div class="page lt-page">
  ${phead("Orders", "268 orders across 40 deliveries.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({
    search: "",
    placeholder: "Search orders",
    filters: [
      `<span class="inline" style="gap:5px"><select class="fsel"><option selected>${DELIVERY.name}</option><option>Any delivery</option></select><span class="badge info">1</span></span>`,
      '<span class="inline" style="gap:5px"><select class="fsel"><option selected>Paid</option><option>Any state</option></select><span class="badge info">1</span></span>',
      '<span class="inline" style="gap:5px"><select class="fsel"><option selected>Any date</option><option>This month</option></select><span class="badge">0</span></span>',
    ],
    right: '<button class="btn sm ghost">Clear 2</button>',
  })}
  ${section("", table([{ label: "Order", key: "order" }, { label: "Customer", key: "customer" }, { label: "Placed", key: "when" }, { label: "State", key: "state" }, { label: "Paid", key: "paid", cls: "num" }], { rows: 5 }), { flush: true })}
  ${pager(1, 2)}
</div>`,
            "Orders",
          ),
        },
        {
          name: "A filter panel beside the table",
          rationale:
            "Filters in a panel down the left side, with every category open at once and nothing hidden. Carbon prefers this when there are more than three categories.",
          tradeoff:
            "A permanent panel takes about 190 pixels from the table on every page, and most visits apply no filter at all. The panel is a cost paid by everyone for the benefit of a few.",
          reference: "Carbon",
          html: shell(
            "Orders",
            `<div class="page lt-page">
  ${phead("Orders", "268 orders across 40 deliveries.", "", { crumb: trail("Home", "Orders") })}
  <div class="lt-filtergrid">
    <aside class="stack sm">
      ${section(
        "Filter",
        `<div class="stack sm">
          ${field("Search", input("", { placeholder: "Orders" }))}
          ${field("Delivery", `<select class="sel"><option selected>Any delivery</option><option>${DELIVERY.name}</option></select>`)}
          ${field("State", '<select class="sel"><option selected>Any state</option><option>Paid</option><option>Awaiting payment</option></select>')}
          ${field("Channel", '<select class="sel"><option selected>Any channel</option><option>Online</option><option>Counter</option></select>')}
          <label class="check"><input type="checkbox"><span>Only refunds<span class="cd">Includes part refunds</span></span></label>
          <div class="btnrow"><button class="btn primary sm">Apply</button><button class="btn sm ghost">Clear</button></div>
        </div>`,
      )}
    </aside>
    <div style="min-width:0">
      ${section("", table([{ label: "Order", key: "order" }, { label: "Customer", key: "customer" }, { label: "Placed", key: "when" }, { label: "State", key: "state" }, { label: "Paid", key: "paid", cls: "num" }], { rows: 6 }), { flush: true })}
      ${pager(1, 11)}
    </div>
  </div>
</div>`,
            "Orders",
          ),
        },
        {
          name: "Filters in one dropdown",
          rationale:
            "One Filters button holding every category, with the count on the button. Keeps the toolbar to two controls and leaves the table full width.",
          tradeoff:
            "Carbon states that multiple filter categories should never be put inside a menu. A reader cannot see that a date filter exists without opening it, and closing it hides the applied state again.",
          html: shell(
            "Orders",
            `<div class="page lt-page">
  ${phead("Orders", "268 orders across 40 deliveries.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Search orders", right: '<button class="btn sm">Filters <span class="badge info" style="height:16px;padding:0 5px">2</span> <span class="muted">▾</span></button>' })}
  ${section("", table([{ label: "Order", key: "order" }, { label: "Customer", key: "customer" }, { label: "Placed", key: "when" }, { label: "State", key: "state" }, { label: "Paid", key: "paid", cls: "num" }], { rows: 5 }), { flush: true })}
  ${pager(1, 11)}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Views as tabs, filters as controls",
          rationale:
            "The tabs carry the question the reader arrived with: All, Needs attention, Awaiting money. The filters below refine whichever tab is open.",
          tradeoff:
            "Two mechanisms over one table, and the reader has to work out whether to click a tab or a filter. HubSpot makes views do both jobs instead.",
          html: shell(
            "Orders",
            `<div class="page lt-page">
  ${phead("Orders", "Every paid order across every delivery, newest first.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Search orders", views: [{ label: "All 268", on: true }, { label: "Needs attention 12" }, { label: "Awaiting money 31" }, { label: "Refunded 18" }] })}
  <div style="margin-bottom:10px">${toolbar({ search: null, filters: ["Any delivery", "Any state", "Any date"], right: "" })}</div>
  ${section("", table([{ label: "Order", key: "order" }, { label: "Customer", key: "customer" }, { label: "Placed", key: "when" }, { label: "State", key: "state" }, { label: "Paid", key: "paid", cls: "num" }], { rows: 5 }), { flush: true })}
  ${pager(1, 11)}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Every option carries its count before it is applied",
          rationale:
            "Each filter option shows how many rows it matches given the other filters as set, so the reader sees a zero before choosing it rather than landing on an empty table. Fewer dead-end filterings instead of a better empty state afterwards.",
          tradeoff:
            "Each count is a read against the other filters, so opening one select costs several queries. Counts also go stale the moment another user acts, and a stale zero is worse than none.",
          html: shell(
            "Orders",
            `<div class="page lt-page">
  ${phead("Orders", "58 of 268 orders match.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({
    search: "",
    placeholder: "Search orders",
    filters: [
      '<select class="fsel"><option>' + DELIVERY.name + ' (41)</option><option>Any delivery (268)</option></select>',
      '<select class="fsel"><option>Any state (268)</option><option>Paid (231)</option><option>Awaiting payment (31)</option></select>',
      '<select class="fsel"><option>This month (58)</option><option>Any date (268)</option></select>',
    ],
    right: '<button class="btn sm ghost">Clear all</button>',
  })}
  ${notice("info", "Each count answers the other filters as set. Paid (231) is 231 paid orders this month.")}
  ${section("", ordersTable({ rows: 5 }), { flush: true })}
  ${pager(1, 3, 1, 25, 58)}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Faceted filter buttons with counts",
          rationale:
            "The shadcn/ui tasks example draws each category as a button that opens a checklist with a count per value. The reader sees the split before choosing, and several values in one category combine without one select per value.",
          tradeoff:
            "Counts per value are a read per category, and the popover covers the table while it is open. Worth it only where a category holds more than a few values.",
          reference: "shadcn/ui",
          html: shell(
            "Orders",
            `<div class="page lt-page">
  ${phead("Orders", "58 of 268 orders match.", "", { crumb: trail("Home", "Orders") })}
  <div class="lt-anchor">${toolbar({
    search: "",
    placeholder: "Search orders",
    filters: [
      '<button class="lt-facet on">State <span class="sep"></span><span class="badge">Paid</span><span class="badge">Awaiting payment</span></button>',
      `<button class="lt-facet on" aria-expanded="true">Delivery <span class="sep"></span><span class="badge">${DELIVERY.name}</span><span class="plus">+</span></button>`,
      '<button class="lt-facet">Channel <span class="plus">+</span></button>',
    ],
    right: '<button class="btn sm ghost">Clear 3</button>',
  })}
  ${popAt(
    "left:clamp(8px,30%,320px);top:38px;width:240px",
    `<div class="cap">Delivery</div>${[[DELIVERY.name, 41, true], ["Becker spring refill", 12, false], ["Lindqvist studio courier", 5, false], ["Counter sale", 0, false]]
      .map(([nm, n, on]) => `<label class="item"><input type="checkbox"${on ? " checked" : ""}>${nm}<span class="n">${n}</span></label>`)
      .join("")}<div class="sep"></div><div class="item">Clear this filter</div>`,
  )}</div>
  ${section("", table([{ label: "Order", key: "order" }, { label: "Customer", key: "customer" }, { label: "Placed", key: "when" }, { label: "State", key: "state" }, { label: "Paid", key: "paid", cls: "num" }], { rows: 5 }), { flush: true })}
  ${pager(1, 3, 1, 25, 58)}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Filter conditions as removable chips",
          rationale:
            "Linear states each condition as a chip with its field, its operator and its value, and the chip removes itself. A compound filter reads as a sentence, and clearing one condition never touches the others.",
          tradeoff:
            "Chips wrap to several rows on a narrow screen, and building a condition needs a field menu, an operator menu and a value menu in sequence.",
          reference: "Linear",
          html: shell(
            "Orders",
            `<div class="page lt-page">
  ${phead("Orders", "12 orders match two conditions.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Search orders", right: '<button class="btn sm ghost">Clear all</button>' })}
  <div class="chips" style="margin:-2px 0 10px">
    <span class="lt-cond"><span class="k">State</span><span class="op">is</span><span class="v">Paid</span><span class="x" role="button" aria-label="Remove the state condition">✕</span></span>
    <span class="lt-cond"><span class="k">Delivery</span><span class="op">is</span><span class="v">${DELIVERY.name}</span><span class="x" role="button" aria-label="Remove the delivery condition">✕</span></span>
    <button class="btn sm ghost">+ Add condition</button>
  </div>
  ${section("", table([{ label: "Order", key: "order" }, { label: "Customer", key: "customer" }, { label: "Placed", key: "when" }, { label: "State", key: "state" }, { label: "Paid", key: "paid", cls: "num" }], { rows: 5 }), { flush: true })}
  ${pager(1, 1, 1, 12, 12)}
</div>`,
            "Orders",
          ),
        },
      ],
    },
    {
      id: "table-density",
      title: "Row density",
      why: "Carbon defines <b>five row heights</b>, 24, 32, 40, 48 and 64 pixels, and requires the header, the toolbar and the pagination bar to match the row size. The default table runs at roughly 47 pixels per row, between md and lg.",
      verdict:
        "The pick is (a), 40 pixels: two lines fit, the row scans, and it matches the default size. The runner-up is (c), 32 pixels, for a working queue where every row is read once and acted on. Never ship (d), a density control the reader sets: most readers set it once, and a screenshot suite then holds three versions of every page. The phone answer is (f), a record list, covered in full by the phone-list item.",
      compact: {
        option: "A record list instead of a table",
        behaviour: "Below 640 pixels the table becomes two-line record rows with the amount right; sorting and comparison down a column move to the desktop.",
      },
      variants: [
        {
          name: "40 pixels, the default",
          pick: true,
          rationale:
            "Carbon's md default. Two lines of text fit and the row scans.",
          tradeoff:
            "Twenty-five rows is 1000 pixels, so a 268-row table is eleven screens. Fine for browsing, slow for counting.",
          reference: "Carbon",
          html: shell(
            "Orders",
            `<div class="page lt-page">
  ${phead("Orders", "Every paid order across every delivery, newest first.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order number, name or email" })}
  ${section("", table([{ label: "Order", key: "order" }, { label: "Customer", key: "customer" }, { label: "Placed", key: "when" }, { label: "State", key: "state" }, { label: "Paid", key: "paid", cls: "num" }], { rows: 7, dense: false }), { flush: true })}
  ${pager(1, 11)}
</div>`,
            "Orders",
          ),
        },
        {
          name: "24 pixels, scannable",
          rationale:
            "Carbon's xs. One line per row, so the eye can travel straight down a column. The right choice for a queue a back-office user works through rather than reads.",
          tradeoff:
            "One line means the delivery name and the customer's email have nowhere to go. Both have to be dropped or opened from the row.",
          reference: "Carbon",
          html: shell(
            "Refunds",
            `<div class="page lt-page">
  ${phead("Refunds", "31 orders to decide. Sorted by how long you have left.", "", { crumb: trail("Home", "Orders", "Refunds") })}
  ${toolbar({ search: "", placeholder: "Search refunds", filters: ["Any window"] })}
  ${section(
    "",
    `<table class="dt lt-t lt-stuck dense lt-h24">
      <thead><tr><th scope="col" class="sortable">Order <span class="dir">▴</span></th><th scope="col" class="sortable">Customer</th><th scope="col">State</th><th scope="col" class="num">Amount</th><th scope="col" class="sortable num">Time left</th></tr></thead>
      <tbody>
        ${[
          ["3H3C68", "Elin Lindqvist", "Window closed", "destructive", "EUR 50.00", "Closed 34 days ago"],
          ["H3HAYK", "Tom Becker", "Window closed", "destructive", MONEY.lamp, "Closed yesterday"],
          ["8M3DWR", "Ade Okafor", "Closing soon", "caution", MONEY.lamp, "5 days left"],
          ["XGH536", "Maria Garcia", "Open", "neutral", MONEY.lamp, "17 days left"],
          ["V7VZNX", "Elin Lindqvist", "Open", "neutral", MONEY.lamp, "163 days left"],
          ["7K4Q2M", "Maria Garcia", "Open", "neutral", MONEY.order, "174 days left"],
          ["STT855", "Tom Becker", "Open", "neutral", "EUR 50.00", "174 days left"],
        ]
          .map(
            ([no, who, st, tone, amt, left]) =>
              `<tr><td><span class="code">${no}</span></td><td>${who}</td><td>${badgeRaw(st, tone, "outline")}</td><td class="num">${amt}</td><td class="num">${left}</td></tr>`,
          )
          .join("")}
      </tbody>
    </table>`,
    { flush: true },
  )}
  ${pager(1, 2)}
</div>`,
            "Orders",
          ),
        },
        {
          name: "32 pixels, a working table",
          rationale:
            "Carbon's sm. Enough for a badge and one line, which covers a working table where every row gets an action.",
          tradeoff:
            "A two-line cell such as order number over delivery name does not fit, so the delivery has to become a column or drop.",
          reference: "Carbon",
          html: shell(
            "Deliveries",
            `<div class="page lt-page">
  ${phead("Deliveries", "Four deliveries, three with a date still ahead.", "", { crumb: trail("Home", "Deliveries") })}
  ${toolbar({ search: "", placeholder: "Search deliveries", views: [{ label: "Scheduled 3", on: true }, { label: "Past 1" }, { label: "All 4" }] })}
  ${section(
    "",
    `<table class="dt lt-t lt-stuck dense lt-h32">
      <thead><tr><th scope="col" class="sortable">Delivery <span class="dir">▴</span></th><th scope="col" class="sortable">Date</th><th scope="col">State</th><th scope="col" class="num">Loaded</th><th scope="col" class="num">Capacity</th><th scope="col"></th></tr></thead>
      <tbody>
        ${[
          ["Becker spring refill", "9 Oct 2026", "Scheduled", "info", "32", "40 pallets"],
          ["Lindqvist studio courier", "17 Oct 2026", "Scheduled", "info", "32", "60 pallets"],
          ["Okafor office setup", "12 Dec 2026", "Draft", "neutral", "0", "120 pallets"],
          [DELIVERY.name, "14 Mar 2026", "Delivered", "positive", "376", "400 pallets"],
        ]
          .map(
            ([nm, when, st, tone, loaded, cap]) =>
              `<tr><td><b>${nm}</b></td><td class="nowrap">${when}</td><td>${badgeRaw(st, tone, "outline")}</td><td class="num">${loaded}</td><td class="num">${cap}</td><td class="num"><button class="btn xs">Open</button></td></tr>`,
          )
          .join("")}
      </tbody>
    </table>`,
    { flush: true },
  )}
  ${pager(1, 1, 1, 4, 4)}
</div>`,
            "Orders",
          ),
        },
        {
          name: "A density control the reader sets",
          rationale:
            "Three densities offered as a small segmented control in the toolbar, persisted per user. Carbon treats density as a token, not a free choice, so three steps is the honest number.",
          tradeoff:
            "A third toolbar control for something most readers set once and never think about. And a screenshot test then has to hold three versions of every page.",
          reference: "Carbon",
          html: shell(
            "Orders",
            `<div class="page lt-page">
  ${phead("Orders", "Every paid order across every delivery, newest first.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({
    search: "",
    placeholder: "Order number, name or email",
    right: '<span class="inline" style="gap:6px"><span class="muted" style="font-size:11.5px">Rows</span>' + segmented(["S", "M", "L"], 1) + "</span>",
  })}
  ${section("", table([{ label: "Order", key: "order" }, { label: "Customer", key: "customer" }, { label: "Placed", key: "when" }, { label: "State", key: "state" }, { label: "Paid", key: "paid", cls: "num" }], { rows: 8, dense: true }), { flush: true })}
  ${pager(1, 11)}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Dense rows with a zebra pass",
          rationale:
            "At 24 pixels the eye loses its place across a wide row, so Carbon's zebra modifier returns. Every second row takes the muted surface.",
          tradeoff:
            "Zebra on a two-line row is noisy, because the bands cut through the cell content rather than sitting behind it. It works at one line and not at two.",
          reference: "Carbon",
          html: shell(
            "Refunds",
            `<div class="page lt-page">
  ${phead("Refunds", "31 orders to decide.", "", { crumb: trail("Home", "Orders", "Refunds") })}
  ${toolbar({ search: "", placeholder: "Search refunds", filters: ["Any window"] })}
  ${section(
    "",
    `<table class="dt lt-t lt-stuck dense lt-h24 lt-zebra">
      <thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col">State</th><th scope="col" class="num">Amount</th><th scope="col" class="num">Time left</th></tr></thead>
      <tbody>
        ${[
          ["3H3C68", "Elin Lindqvist", "Window closed", "destructive", "EUR 50.00", "Closed 34 days ago"],
          ["H3HAYK", "Tom Becker", "Window closed", "destructive", MONEY.lamp, "Closed yesterday"],
          ["8M3DWR", "Ade Okafor", "Closing soon", "caution", MONEY.lamp, "5 days left"],
          ["XGH536", "Maria Garcia", "Open", "neutral", MONEY.lamp, "17 days left"],
          ["V7VZNX", "Elin Lindqvist", "Open", "neutral", MONEY.lamp, "163 days left"],
          ["7K4Q2M", "Maria Garcia", "Open", "neutral", MONEY.order, "174 days left"],
        ]
          .map(
            ([no, who, st, tone, amt, left]) =>
              `<tr><td><span class="code">${no}</span></td><td>${who}</td><td>${badgeRaw(st, tone, "outline")}</td><td class="num">${amt}</td><td class="num">${left}</td></tr>`,
          )
          .join("")}
      </tbody>
    </table>`,
    { flush: true },
  )}
  ${pager(1, 2)}
</div>`,
            "Orders",
          ),
        },
        {
          name: "A record list instead of a table",
          rationale:
            "One card-width block per record with two lines and its own commands on the right. It is what the phone layout wants.",
          tradeoff:
            "No columns, so no sorting and no comparison across a column. It trades every table capability for reading one record well.",
          html: shell(
            "Orders",
            `<div class="page lt-page" style="max-width:620px">
  ${phead("Orders", "Every paid order across every delivery, newest first.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Search orders", filters: ["Any state"] })}
  ${section(
    "",
    `<div class="rlist">
      ${[
        ["7K4Q2M", DELIVERY.name, "Maria Garcia", "maria@garcia-interiors.example", "Paid", "positive", MONEY.order],
        ["STT855", DELIVERY.name, "Tom Becker", "tom@becker-bouw.example", "Paid", "positive", "EUR 50.00"],
        ["PP0K9B", "Counter sale", "Maria Garcia", "maria@garcia-interiors.example", "Completed", "neutral", "EUR 25.00"],
        ["V7VZNX", "Becker spring refill", "Elin Lindqvist", "elin@lindqvist.example", "Paid", "positive", MONEY.lamp],
        ["YB281K", "Lindqvist studio courier", "Ade Okafor", "ade@okafor.example", "Disputed", "destructive", MONEY.refund],
      ]
        .map(
          ([no, dl, who, email, st, tone, amt]) => `<div class="rrow">
        <span class="txt"><b><span class="code">${no}</span> · ${dl}</b><small>${who} · ${email}</small></span>
        ${badgeRaw(st, tone, "outline")}
        <span class="fig">${amt}</span>
        <span class="acts"><button class="btn sm">Open</button></span>
      </div>`,
        )
        .join("")}
    </div>`,
  )}
  ${pager(1, 11)}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Comfortable 48 px rows for a delivery list",
          rationale:
            "Shopify Polaris draws its product lists at a comfortable height with a second line under the name, because deliveries are read one by one rather than scanned down a column. The load bar answers the only question the row exists for.",
          tradeoff:
            "Eight rows need a scroll where the compact table shows fourteen. Wrong for any queue a back-office user works through in order.",
          reference: "Shopify Polaris",
          html: shell(
            "Deliveries",
            `<div class="page lt-page">
  ${phead("Deliveries", "Four deliveries, three with a date still ahead.", "", { crumb: trail("Home", "Deliveries") })}
  ${toolbar({ search: "", placeholder: "Search deliveries", views: [{ label: "Scheduled 3", on: true }, { label: "Past 1" }, { label: "All 4" }] })}
  ${section(
    "",
    `<table class="dt lt-t lt-stuck lt-h48">
      <thead><tr><th scope="col">Delivery</th><th scope="col">State</th><th scope="col">Loaded</th><th scope="col"></th></tr></thead>
      <tbody>
        ${[
          ["Becker spring refill", "Fri 9 Oct 2026 · Rotterdam depot", "Scheduled", "info", 80, "32 of 40 pallets"],
          ["Lindqvist studio courier", "Sat 17 Oct 2026 · Utrecht depot", "Scheduled", "info", 53, "32 of 60 pallets"],
          ["Okafor office setup", "Sat 12 Dec 2026 · Amsterdam warehouse", "Draft", "neutral", 0, "0 of 120 pallets"],
          [DELIVERY.name, "Sat 14 Mar 2026 · Amsterdam warehouse", "Delivered", "positive", 94, "376 of 400 pallets"],
        ]
          .map(
            ([nm, meta, st, tone, pct, loaded]) =>
              `<tr><td><span class="lines"><b>${nm}</b><small>${meta}</small></span></td><td>${badgeRaw(st, tone, "outline")}</td><td><span class="lt-sold"><span class="tnum">${loaded}</span>${progress(pct, true)}</span></td><td class="num"><button class="btn sm">Open</button></td></tr>`,
          )
          .join("")}
      </tbody>
    </table>`,
    { flush: true },
  )}
  ${pager(1, 1, 1, 4, 4)}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Compact rows with a header that stays",
          rationale:
            "Linear's lists keep the header pinned while hundreds of compact rows scroll under it, so the column names survive the scroll. The right shape for a queue that is worked top to bottom without paging.",
          tradeoff:
            "A pinned header only pays off on a long list; on five rows it is chrome with no job. It also needs a fixed list height, which fights the page scroll.",
          reference: "Linear",
          html: shell(
            "Refunds",
            `<div class="page lt-page">
  ${phead("Refunds", "31 orders to decide. Sorted by how long you have left.", "", { crumb: trail("Home", "Orders", "Refunds") })}
  ${toolbar({ search: "", placeholder: "Search refunds", filters: ["Any window"] })}
  ${section(
    "",
    `<div style="max-height:264px;overflow:auto"><table class="dt lt-t lt-h32">
      <thead class="sticky-head"><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col">State</th><th scope="col" class="num">Amount</th><th scope="col" class="num">Time left</th></tr></thead>
      <tbody>
        ${[
          ["3H3C68", "Elin Lindqvist", "Window closed", "destructive", "EUR 50.00", "Closed 34 days ago"],
          ["H3HAYK", "Tom Becker", "Window closed", "destructive", MONEY.lamp, "Closed yesterday"],
          ["8M3DWR", "Ade Okafor", "Closing soon", "caution", MONEY.lamp, "5 days left"],
          ["XGH536", "Maria Garcia", "Open", "neutral", MONEY.lamp, "17 days left"],
          ["V7VZNX", "Elin Lindqvist", "Open", "neutral", MONEY.lamp, "163 days left"],
          ["7K4Q2M", "Maria Garcia", "Open", "neutral", MONEY.order, "174 days left"],
          ["STT855", "Tom Becker", "Open", "neutral", "EUR 50.00", "174 days left"],
          ["PP0K9B", "Maria Garcia", "Open", "neutral", "EUR 25.00", "174 days left"],
        ]
          .map(
            ([no, who, st, tone, amt, left]) =>
              `<tr><td><span class="code">${no}</span></td><td>${who}</td><td>${badgeRaw(st, tone, "outline")}</td><td class="num">${amt}</td><td class="num">${left}</td></tr>`,
          )
          .join("")}
      </tbody>
    </table></div>`,
    { flush: true, desc: "The header stays while the queue scrolls." },
  )}
  ${pager(1, 2)}
</div>`,
            "Orders",
          ),
        },
      ],
    },
    {
      id: "table-bulk-bar",
      title: "The bulk action bar",
      why: "What appears once rows are selected. Shopify puts common bulk actions in a bar above the selected range; Material allows <b>one action per snackbar</b> and Carbon keeps an action-bearing toast on screen until it is dismissed.",
      verdict:
        "The pick is (a), a bar above the table naming the count and the money: on a refunds page the total is the thing a reader checks before acting. The runner-up is (g), a floating pill, for reversible bulk work such as resending confirmations or tagging, where the bar must not push the table down. Never ship (c), the bar at the foot: on a long table the action sits off screen while the checkboxes that enabled it do not.",
      variants: [
        {
          name: "A bar above the table naming the count",
          pick: true,
          rationale:
            "The bar states how many are selected and what that total is worth, then offers the commands. The count is the thing a reader checks before acting on money.",
          tradeoff:
            "The toolbar is still visible above the bar, so two rows of controls stack. Either the toolbar goes or the page gets taller.",
          html: shell(
            "Refunds",
            `<div class="page lt-page">
  ${phead("Refunds", "31 orders to decide.", "", { crumb: trail("Home", "Orders", "Refunds") })}
  ${toolbar({ search: "", placeholder: "Search refunds", filters: ["Any window"] })}
  <div class="section" style="margin-bottom:10px;border-color:var(--ring)">
    <div class="body">
      <div class="btnrow between">
        <span style="font-size:12.5px"><b>3 selected</b> <span class="muted">· EUR 200.00 of order money</span></span>
        <span class="btnrow"><button class="btn sm ghost">Clear</button><button class="btn sm">Refund in full</button><button class="btn sm">Refund part</button><button class="btn sm primary">Refund these 3</button><button class="btn sm icon" aria-label="More bulk actions">⋯</button></span>
      </div>
    </div>
  </div>
  ${section("", table([{ label: "Order", key: "order" }, { label: "Customer", key: "customer" }, { label: "State", key: "state" }, { label: "Paid", key: "paid", cls: "num" }], { rows: 5, checkbox: true, selected: ["7K4Q2M", "STT855", "PP0K9B"] }), { flush: true })}
</div>`,
            "Orders",
          ),
        },
        {
          name: "The bar replaces the toolbar",
          rationale:
            "While a selection exists the toolbar is replaced by the bulk bar. One set of controls at a time, and the page cannot be read as offering search while it is offering actions.",
          tradeoff:
            "The layout shifts under the reader mid-decision, and the search box they wanted to refine with is gone exactly when they are about to act.",
          html: shell(
            "Refunds",
            `<div class="page lt-page">
  ${phead("Refunds", "31 orders to decide.", "", { crumb: trail("Home", "Orders", "Refunds") })}
  ${section(
    "",
    `<div class="body" style="border-bottom:1px solid var(--border);display:flex;align-items:center;gap:8px;flex-wrap:wrap">
      <button class="btn sm ghost">✕ Clear</button>
      <span style="font-size:12.5px"><b>3 selected</b> <span class="muted">· EUR 200.00</span></span>
      <span style="margin-left:auto" class="btnrow"><button class="btn sm">Refund part</button><button class="btn primary sm">Refund these 3</button><button class="btn sm icon" aria-label="More bulk actions">⋯</button></span>
    </div>`,
    { flush: true },
  )}
  ${section("", table([{ label: "Order", key: "order" }, { label: "Customer", key: "customer" }, { label: "State", key: "state" }, { label: "Paid", key: "paid", cls: "num" }], { rows: 5, checkbox: true, selected: ["7K4Q2M", "STT855", "PP0K9B"] }), { flush: true })}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Bar at the foot, above the pagination",
          rationale:
            "The bar sits where the reader's eye already goes after ticking boxes, above the row count. The selection controls stay next to the count they describe.",
          tradeoff:
            "On a long table the foot is off screen while the checkboxes are not, so the reader has to scroll to find the action they just enabled.",
          html: shell(
            "Refunds",
            `<div class="page lt-page">
  ${phead("Refunds", "31 orders to decide.", "", { crumb: trail("Home", "Orders", "Refunds") })}
  ${toolbar({ search: "", placeholder: "Search refunds", filters: ["Any window"] })}
  ${section("", table([{ label: "Order", key: "order" }, { label: "Customer", key: "customer" }, { label: "State", key: "state" }, { label: "Paid", key: "paid", cls: "num" }], { rows: 5, checkbox: true, selected: ["7K4Q2M", "STT855"] }), { flush: true })}
  <div class="btnrow between" style="padding:10px 2px;border-top:1px solid var(--border)">
    <span style="font-size:12px"><b>2 selected</b> <span class="muted">· EUR 175.00</span></span>
    <span class="btnrow"><button class="btn sm ghost">Clear</button><button class="btn sm">Refund part</button><button class="btn primary sm">Refund these 2</button></span>
  </div>
  ${pager(1, 2)}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Bar with the escalation, and money named",
          rationale:
            "The bar carries both numbers: 25 on this page, 1,204 matching. It also names the money, because a refund bulk action on the wrong scope is the expensive mistake this page invites.",
          tradeoff:
            "A long bar with two numbers and three buttons. It only fits above about 900 pixels, so the phone needs its own version of the same warning.",
          html: shell(
            "Refunds",
            `<div class="page lt-page">
  ${phead("Refunds", "31 orders to decide.", "", { crumb: trail("Home", "Orders", "Refunds") })}
  ${toolbar({ search: "", placeholder: "Search refunds", filters: ["Any window"] })}
  <div class="alert info" style="margin-bottom:8px">
    <span class="txt"><b>All 25 on this page are selected.</b><small>1,204 refunds match this filter in total.</small></span>
    <span class="tail"><button class="btn sm">Select all 1,204</button></span>
  </div>
  <div class="section" style="margin-bottom:10px;border-color:var(--ring)">
    <div class="body">
      <div class="btnrow between">
        <span style="font-size:12.5px"><b>25 selected</b> <span class="muted">· EUR 1,125.00 of order money on this page</span></span>
        <span class="btnrow"><button class="btn sm ghost">Clear</button><button class="btn sm">Refund part</button><button class="btn primary sm">Refund these 25</button><button class="btn sm icon" aria-label="More bulk actions">⋯</button></span>
      </div>
    </div>
  </div>
  ${section("", table([{ label: "Order", key: "order" }, { label: "Customer", key: "customer" }, { label: "State", key: "state" }, { label: "Paid", key: "paid", cls: "num" }], { rows: 5, checkbox: true, selected: ["7K4Q2M", "STT855", "PP0K9B"] }), { flush: true })}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Bar with a confirm before it commits",
          rationale:
            "The bar's primary button opens a dialog naming the count and the money, because a bulk refund is exactly the action NN/g says to interrupt when it is rare and irreversible.",
          tradeoff:
            "Two steps for a batch the reader has just spent a minute selecting. Acceptable on money, wrong for anything reversible such as a bulk tag.",
          reference: "NN/g",
          html: shell(
            "Refunds",
            `<div class="page lt-page" style="position:relative">
  ${phead("Refunds", "31 orders to decide.", "", { crumb: trail("Home", "Orders", "Refunds") })}
  ${toolbar({ search: "", placeholder: "Search refunds", filters: ["Any window"] })}
  <div class="section" style="margin-bottom:10px;border-color:var(--ring)">
    <div class="body">
      <div class="btnrow between">
        <span style="font-size:12.5px"><b>3 selected</b> <span class="muted">· EUR 200.00</span></span>
        <span class="btnrow"><button class="btn sm ghost">Clear</button><button class="btn sm">Refund part</button><button class="btn primary sm">Refund these 3</button></span>
      </div>
    </div>
  </div>
  ${section("", table([{ label: "Order", key: "order" }, { label: "Customer", key: "customer" }, { label: "State", key: "state" }, { label: "Paid", key: "paid", cls: "num" }], { rows: 5, checkbox: true, selected: ["7K4Q2M", "STT855", "PP0K9B"] }), { flush: true })}
  <div class="scrim">
    <div class="dialog" role="alertdialog" aria-modal="true">
      <header><div><h3>Refund 3 orders in full?</h3><p>EUR 200.00 goes back to 3 customers.</p></div></header>
      <div class="dbody">
        <div class="stmt">
          <div class="line"><span>Maria Garcia<small class="muted" style="margin-left:6px">7K4Q2M</small></span><span class="fig">${MONEY.order}</span></div>
          <div class="line"><span>Tom Becker<small class="muted" style="margin-left:6px">STT855</small></span><span class="fig">EUR 50.00</span></div>
          <div class="line"><span>Maria Garcia<small class="muted" style="margin-left:6px">PP0K9B</small></span><span class="fig">EUR 25.00</span></div>
          <div class="sub-total"><span>Total going back</span><span class="fig">EUR 200.00</span></div>
        </div>
        <div class="callout caution" style="margin-top:11px">One of these orders is already 214 days old. The bank will not take that one back.</div>
      </div>
      <footer><button class="btn">Cancel</button><button class="btn danger">Refund 3 orders</button></footer>
    </div>
  </div>
</div>`,
            "Orders",
          ),
        },
        {
          name: "Bar with the action inline and an undo after",
          rationale:
            "The bulk action runs with no confirmation and the bar becomes an undo toast. Carbon keeps an action-bearing toast until it is dismissed rather than letting a timer take the undo away.",
          tradeoff:
            "On money this is the option the evidence argues against: NN/g reports reflex clicking when confirmations are routine, and a refund is not the place to train that reflex.",
          html: shell(
            "Orders",
            `<div class="page lt-page">
  ${phead("Orders", "Every paid order across every delivery, newest first.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order number, name or email", filters: ["Any state"] })}
  ${section("", table([{ label: "Order", key: "order" }, { label: "Customer", key: "customer" }, { label: "Placed", key: "when" }, { label: "State", key: "state" }, { label: "Paid", key: "paid", cls: "num" }], { rows: 5 }), { flush: true })}
  ${pager(1, 11)}
  <div style="position:absolute;right:14px;bottom:14px">
    <div class="toast">
      <span aria-hidden="true" style="color:var(--positive-surface-foreground)">✓</span>
      <span>Confirmations resent to 3 customers.</span>
      <span class="tail"><span class="undo">Undo</span><span style="color:var(--muted-foreground);cursor:pointer">✕</span></span>
    </div>
  </div>
</div>`,
            "Orders",
          ),
        },
        {
          name: "A floating pill with the count and one menu",
          rationale:
            "Notion and Linear float the selection bar over the content instead of pushing the table down: the count, the one or two common commands, and a menu for the rest. The table never shifts when the first box is ticked.",
          tradeoff:
            "The pill covers the bottom rows while it is up, and money wants its total stated, which a pill has no room for. Keep it for reversible work.",
          reference: "Notion",
          html: shell(
            "Orders",
            `<div class="page lt-page" style="position:relative">
  ${phead("Orders", "Every paid order across every delivery, newest first.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order number, name or email", filters: ["Any state"] })}
  ${section("", table([{ label: "Order", key: "order" }, { label: "Customer", key: "customer" }, { label: "Placed", key: "when" }, { label: "State", key: "state" }, { label: "Paid", key: "paid", cls: "num" }], { rows: 6, checkbox: true, selected: ["7K4Q2M", "STT855", "PP0K9B"] }), { flush: true })}
  ${pager(1, 11)}
  <div class="lt-float"><span><b>3 selected</b></span><span class="acts"><button class="btn sm">Resend confirmation</button><button class="btn sm">Add tag</button><button class="btn sm icon" aria-label="More bulk actions">⋯</button></span></div>
</div>`,
            "Orders",
          ),
        },
        {
          name: "Bulk actions behind one dropdown",
          rationale:
            "Stripe's dashboard keeps the bulk bar to a count and one Actions menu, drawn open here. Every command is named in one place, the bar stays narrow, and adding a fifth command costs no width.",
          tradeoff:
            "Two clicks to the common command instead of one, and nothing on the bar says that resending is what most back-office users reach for.",
          reference: "Stripe",
          html: shell(
            "Orders",
            `<div class="page lt-page">
  ${phead("Orders", "Every paid order across every delivery, newest first.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order number, name or email", filters: ["Any state"] })}
  <div class="lt-anchor">${section("", `<div class="lt-band"><span><b>3 selected</b></span><span class="acts"><button class="btn sm ghost">Clear</button><button class="btn sm" aria-expanded="true">Actions <span class="muted">▾</span></button></span></div>`, { flush: true })}
  ${popAt("right:12px;top:44px;width:200px", '<div class="item">Resend confirmation</div><div class="item">Add tag</div><div class="item">Export selected</div><div class="sep"></div><div class="item danger">Void 3 orders</div>')}</div>
  ${section("", table([{ label: "Order", key: "order" }, { label: "Customer", key: "customer" }, { label: "Placed", key: "when" }, { label: "State", key: "state" }, { label: "Paid", key: "paid", cls: "num" }], { rows: 5, checkbox: true, selected: ["7K4Q2M", "STT855", "PP0K9B"] }), { flush: true })}
  ${pager(1, 11)}
</div>`,
            "Orders",
          ),
        },
      ],
    },
    {
      id: "table-pagination",
      title: "Pagination",
      why: "The default page ends with <code>1 – 25 of 268</code> on the left and <code>Page 1 of 11</code> with two chevrons on the right. The count and the page number say the same thing twice, and the reader cannot jump to a page.",
      verdict:
        "The pick is (a), the count with numbered pages: the reader can jump, and the range still says where they are. The runner-up is (g), Stripe's compact pager, where width is tight and nobody jumps further than one page at a time. Never ship (d), the jump field: typing a page number then Enter is slower than clicking for almost every reader.",
      compact: {
        option: "A compact pager: range plus two chevrons",
        behaviour: "Below 640 pixels the numbered pages leave and the pager keeps the range with two chevrons.",
      },
      variants: [
        {
          name: "Count left, numbered pages right",
          pick: true,
          rationale:
            "The default shape with numbered pages added and the redundant 'Page 1 of 11' removed. The reader can jump, and the count still says where they are.",
          tradeoff:
            "Seven page numbers plus two chevrons is a wide control, and it has to collapse on a phone. The count and the numbers still overlap slightly.",
          html: shell(
            "Orders",
            `<div class="page lt-page">
  ${phead("Orders", "Every paid order across every delivery, newest first.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order number, name or email" })}
  ${section("", table([{ label: "Order", key: "order" }, { label: "Customer", key: "customer" }, { label: "Placed", key: "when" }, { label: "State", key: "state" }, { label: "Paid", key: "paid", cls: "num" }], { rows: 5 }), { flush: true })}
  ${pager(1, 11)}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Count, page size and chevrons",
          rationale:
            "Carbon's three parts: items per page, the current range and total, and the current page. The page size is the control most tables leave out and back-office users most want on a long list.",
          tradeoff:
            "Three controls in one bar. On a phone it becomes a row of three stacked lines, which pushes the table off screen.",
          reference: "Carbon",
          html: shell(
            "Orders",
            `<div class="page lt-page">
  ${phead("Orders", "Every paid order across every delivery, newest first.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order number, name or email" })}
  ${section("", table([{ label: "Order", key: "order" }, { label: "Customer", key: "customer" }, { label: "Placed", key: "when" }, { label: "State", key: "state" }, { label: "Paid", key: "paid", cls: "num" }], { rows: 5 }), { flush: true })}
  <div class="pager">
    <span>1 – 25 of 268</span>
    <span class="right">
      <select class="fsel" style="height:26px;font-size:11.5px"><option selected>25 per page</option><option>50 per page</option><option>100 per page</option></select>
      <button class="btn sm icon" aria-label="Previous page" disabled>‹</button>
      <span>Page 1 of 11</span>
      <button class="btn sm icon" aria-label="Next page">›</button>
    </span>
  </div>
</div>`,
            "Orders",
          ),
        },
        {
          name: "First, previous, numbers, next, last",
          rationale:
            "Five controls plus a window of numbers, so a reader on page 7 of 11 can reach either end in one click without scrolling the number strip.",
          tradeoff:
            "The widest pagination control there is, and the numbers still have to window or overflow. On a 268-row list it saves at most four clicks.",
          html: shell(
            "Orders",
            `<div class="page lt-page">
  ${phead("Orders", "Every paid order across every delivery, newest first.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order number, name or email" })}
  ${section("", table([{ label: "Order", key: "order" }, { label: "Customer", key: "customer" }, { label: "Placed", key: "when" }, { label: "State", key: "state" }, { label: "Paid", key: "paid", cls: "num" }], { rows: 5 }), { flush: true })}
  <div class="pager">
    <span>101 – 125 of 268</span>
    <span class="right">
      <span class="nums">
        <button aria-label="First page">«</button><button aria-label="Previous page">‹</button>
        <button>4</button><button>5</button><button aria-current="page">6</button><button>7</button><button>8</button>
        <button aria-label="Next page">›</button><button aria-label="Last page">»</button>
      </span>
    </span>
  </div>
</div>`,
            "Orders",
          ),
        },
        {
          name: "Count, chevrons, and jump to a page",
          rationale:
            "Two chevrons and a small jump field. Fewest controls, and a reader who knows the page number types it rather than clicking eight times.",
          tradeoff:
            "The jump field is a fourth thing to learn, and typing 11 then Enter is slower than clicking for most readers.",
          html: shell(
            "Orders",
            `<div class="page lt-page">
  ${phead("Orders", "Every paid order across every delivery, newest first.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order number, name or email" })}
  ${section("", table([{ label: "Order", key: "order" }, { label: "Customer", key: "customer" }, { label: "Placed", key: "when" }, { label: "State", key: "state" }, { label: "Paid", key: "paid", cls: "num" }], { rows: 5 }), { flush: true })}
  <div class="pager">
    <span>1 – 25 of 268</span>
    <span class="right">
      <span class="inline" style="gap:5px">Page <input class="inp" style="width:42px;text-align:center" value="1"> of 11</span>
      <button class="btn sm icon" aria-label="Previous page" disabled>‹</button>
      <button class="btn sm icon" aria-label="Next page">›</button>
    </span>
  </div>
</div>`,
            "Orders",
          ),
        },
        {
          name: "Load more as a button at the foot",
          rationale:
            "GOV.UK warns that infinite scroll breaks keyboard users, so loading is a button a reader presses. The count stays visible, so the total is never a surprise.",
          tradeoff:
            "A link to a specific page 9 is no longer available, which is the main reason Carbon and GOV.UK both land on pagination for admin lists.",
          reference: "GOV.UK",
          html: shell(
            "Orders",
            `<div class="page lt-page">
  ${phead("Orders", "Every paid order across every delivery, newest first.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order number, name or email" })}
  ${section("", table([{ label: "Order", key: "order" }, { label: "Customer", key: "customer" }, { label: "Placed", key: "when" }, { label: "State", key: "state" }, { label: "Paid", key: "paid", cls: "num" }], { rows: 6 }), { flush: true })}
  <div class="pager" style="justify-content:center">
    <button class="btn">Load 25 more</button>
    <span class="muted">25 of 268 shown</span>
  </div>
</div>`,
            "Orders",
          ),
        },
        {
          name: "No pagination, because the list is short",
          rationale:
            "Under about fifty records the whole list fits and pagination only adds a control that cannot do anything useful.",
          tradeoff:
            "It cannot be a rule for the whole back office: orders reach thousands and deliveries reach hundreds, so the list page has to decide per query.",
          html: shell(
            "Refunds",
            `<div class="page lt-page">
  ${phead("Refunds", "10 open. All of them are shown.", "", { crumb: trail("Home", "Orders", "Refunds") })}
  ${toolbar({ search: "", placeholder: "Search refunds" })}
  ${section("", table([{ label: "Order", key: "order" }, { label: "Customer", key: "customer" }, { label: "Asked", key: "when" }, { label: "State", key: "state" }, { label: "Paid", key: "paid", cls: "num" }], { rows: 8 }), { flush: true })}
  <div class="pager"><span>All 10 shown</span></div>
</div>`,
            "Orders",
          ),
        },
        {
          name: "A compact pager: range plus two chevrons",
          rationale:
            "Stripe's dashboard pager is the range and two chevrons, nothing else. It fits a phone without collapsing, and on a 268-row list most readers move one page at a time anyway.",
          tradeoff:
            "No jumping: reaching page 9 costs eight clicks. Only right where the reader rarely leaves the first pages.",
          reference: "Stripe",
          html: shell(
            "Orders",
            `<div class="page lt-page">
  ${phead("Orders", "Every paid order across every delivery, newest first.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order number, name or email" })}
  ${section("", table([{ label: "Order", key: "order" }, { label: "Customer", key: "customer" }, { label: "Placed", key: "when" }, { label: "State", key: "state" }, { label: "Paid", key: "paid", cls: "num" }], { rows: 5 }), { flush: true })}
  <div class="pager">
    <span>1 – 25 of 268</span>
    <span class="right">
      <button class="btn sm icon" aria-label="Previous page" disabled>‹</button>
      <button class="btn sm icon" aria-label="Next page">›</button>
    </span>
  </div>
</div>`,
            "Orders",
          ),
        },
        {
          name: "No pager at all while everything fits",
          rationale:
            "GitHub draws no pagination on a list that fits one page: no range, no chevrons, no control that cannot do anything. The table ends and the page ends with it.",
          tradeoff:
            "Nothing states the total, so a reader cannot tell 10 rows from a filter that hid the rest. Only right where the heading already names the count.",
          reference: "GitHub",
          html: shell(
            "Refunds",
            `<div class="page lt-page">
  ${phead("Refunds", "10 open orders, all shown below.", "", { crumb: trail("Home", "Orders", "Refunds") })}
  ${toolbar({ search: "", placeholder: "Search refunds" })}
  ${section("", table([{ label: "Order", key: "order" }, { label: "Customer", key: "customer" }, { label: "Asked", key: "when" }, { label: "State", key: "state" }, { label: "Paid", key: "paid", cls: "num" }], { rows: 8 }), { flush: true })}
</div>`,
            "Orders",
          ),
        },
      ],
    },
    {
      id: "table-row-actions",
      title: "Row actions",
      why: "NN/g's rule is that a row carries <b>one or two inline actions</b>, and more than that means either crowding or hiding behind hover, which is undiscoverable and inaccessible on touch. The default orders table has no row actions at all.",
      verdict:
        "The pick is (a), one inline command with the rest in the row menu: the common job is one click away and the row stays narrow. The runner-up is (h), a side preview, where acting needs the record's context, such as the lines before a resend. Never ship (e), hover-revealed actions: it fails on touch, and keeping a second focusable render of every row doubles the table for no gain.",
      variants: [
        {
          name: "One inline action, the rest in a row menu",
          pick: true,
          rationale:
            "The first row command is drawn inline and everything else sits behind the row's overflow menu. It matches Polaris's instruction to put a row's other commands in its menu.",
          tradeoff:
            "The second command is invisible, and the overflow is a 32-pixel target that has to be found in every row.",
          reference: "Shopify Polaris",
          html: shell(
            "Orders",
            `<div class="page lt-page">
  ${phead("Orders", "Every paid order across every delivery, newest first.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order number, name or email" })}
  ${section(
    "",
    `<table class="dt lt-t lt-stuck lt-pin-end">
      <thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col" class="lt-p2">Placed</th><th scope="col">State</th><th scope="col" class="num">Paid</th><th scope="col" style="width:1%"></th></tr></thead>
      <tbody>
        ${ORDERS.slice(0, 5)
          .map(
            ([no, delivery, who, when, state, tone, paid]) => `<tr>
          <td><span class="lines"><span class="code">${no}</span><small>${delivery}</small></span></td>
          <td><span class="lines"><b>${who.customer}</b><small>${who.email}</small></span></td>
          <td class="nowrap lt-p2">${when}</td><td>${badgeRaw(state, tone, "outline")}</td><td class="num">${paid}</td>
          <td style="width:1%;white-space:nowrap"><button class="btn sm">Resend</button> <button class="btn sm icon" aria-label="More actions for order ${no}">⋯</button></td>
        </tr>`,
          )
          .join("")}
      </tbody>
    </table>`,
    { flush: true },
  )}
  ${pager(1, 11)}
</div>`,
            "Orders",
          ),
        },
        {
          name: "The row is the only action",
          rationale:
            "No commands on the row at all: clicking the order number opens the record, and every command lives there. The table is for finding, the record is for acting.",
          tradeoff:
            "A bulk job becomes one row at a time, so this shape fits finding, not acting.",
          html: shell(
            "Orders",
            `<div class="page lt-page">
  ${phead("Orders", "Every paid order across every delivery, newest first. Click an order to open it.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order number, name or email" })}
  ${section("", table([{ label: "Order", key: "order" }, { label: "Customer", key: "customer" }, { label: "Placed", key: "when" }, { label: "State", key: "state" }, { label: "Paid", key: "paid", cls: "num" }], { rows: 6 }), { flush: true })}
  ${pager(1, 11)}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Two inline actions, no menu",
          rationale:
            "Two commands is NN/g's ceiling for inline placement. Anything beyond two becomes crowded, so this shape only works where a row genuinely has two.",
          tradeoff:
            "Two buttons plus a checkbox plus five columns is a wide row. At 24 pixels of density the buttons stop fitting and the row grows.",
          reference: "NN/g",
          html: shell(
            "Refunds",
            `<div class="page lt-page">
  ${phead("Refunds", "31 orders to decide. Each row carries the two commands that apply to it.", "", { crumb: trail("Home", "Orders", "Refunds") })}
  ${toolbar({ search: "", placeholder: "Search refunds", filters: ["Any window"] })}
  ${section(
    "",
    `<table class="dt lt-t lt-stuck dense lt-pin-end">
      <thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col">State</th><th scope="col" class="num">Amount</th><th scope="col" class="num">Time left</th><th scope="col" style="width:1%"></th></tr></thead>
      <tbody>
        ${[
          ["3H3C68", "Elin Lindqvist", "Window closed", "destructive", "EUR 50.00", "Closed 34 days ago"],
          ["H3HAYK", "Tom Becker", "Window closed", "destructive", MONEY.lamp, "Closed yesterday"],
          ["8M3DWR", "Ade Okafor", "Closing soon", "caution", MONEY.lamp, "5 days left"],
          ["7K4Q2M", "Maria Garcia", "Open", "neutral", MONEY.order, "174 days left"],
          ["STT855", "Tom Becker", "Open", "neutral", "EUR 50.00", "174 days left"],
        ]
          .map(
            ([no, who, st, tone, amt, left]) => `<tr>
          <td><span class="code">${no}</span></td><td>${who}</td><td>${badgeRaw(st, tone, "outline")}</td>
          <td class="num">${amt}</td><td class="num">${left}</td>
          <td style="width:1%;white-space:nowrap"><button class="btn xs">Refund</button> <button class="btn xs">Offer credit</button></td>
        </tr>`,
          )
          .join("")}
      </tbody>
    </table>`,
    { flush: true },
  )}
  ${pager(1, 2)}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Row menu only",
          rationale:
            "Every command sits behind the overflow. The row stays one link plus one dot, which keeps the table narrow enough for a phone.",
          tradeoff:
            "Nothing on the row says what can be done, so the reader has to open a menu to learn that anything can be done at all.",
          html: shell(
            "Orders",
            `<div class="page lt-page">
  ${phead("Orders", "Every paid order across every delivery, newest first.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order number, name or email" })}
  ${section(
    "",
    `<table class="dt lt-t lt-stuck dense lt-pin-end">
      <thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col" class="lt-p2">Placed</th><th scope="col">State</th><th scope="col" class="num">Paid</th><th scope="col" style="width:1%"></th></tr></thead>
      <tbody>
        ${ORDERS.slice(0, 6)
          .map(
            ([no, delivery, who, when, state, tone, paid]) => `<tr>
          <td><span class="lines"><span class="code">${no}</span><small>${delivery}</small></span></td>
          <td><span class="lines"><b>${who.customer}</b><small>${who.email}</small></span></td>
          <td class="nowrap lt-p2">${when}</td><td>${badgeRaw(state, tone, "outline")}</td><td class="num">${paid}</td>
          <td style="width:1%"><button class="btn sm icon" aria-label="Actions for order ${no}">⋯</button></td>
        </tr>`,
          )
          .join("")}
      </tbody>
    </table>`,
    { flush: true },
  )}
  ${pager(1, 11)}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Hover reveals the action, always focusable",
          rationale:
            "The row's action appears on hover so a quiet table stays quiet, and it stays in the tab order so a keyboard reader reaches it. This is the accessibility repair on the hover-only pattern.",
          tradeoff:
            "It still fails on touch, where there is no hover, and the two fixes together mean two renders of every row. Polaris and NN/g both warn about hover-only affordances.",
          html: shell(
            "Orders",
            `<div class="page lt-page">
  ${phead("Orders", "Every paid order across every delivery, newest first.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order number, name or email" })}
  ${section(
    "",
    `<table class="dt lt-t lt-stuck dense">
      <thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col" class="lt-p2">Placed</th><th scope="col">State</th><th scope="col" class="num">Paid</th><th scope="col" style="width:1%"></th></tr></thead>
      <tbody>
        ${ORDERS.slice(0, 6)
          .map(
            ([no, delivery, who, when, state, tone, paid], i) => `<tr>
          <td><span class="lines"><span class="code">${no}</span><small>${delivery}</small></span></td>
          <td><span class="lines"><b>${who.customer}</b><small>${who.email}</small></span></td>
          <td class="nowrap lt-p2">${when}</td><td>${badgeRaw(state, tone, "outline")}</td><td class="num">${paid}</td>
          <td style="width:1%;opacity:${i === 0 ? 1 : 0.15}">
            <button class="btn sm icon" tabindex="0" aria-label="Actions for order ${no}" onfocus="this.parentElement.style.opacity=1">⋯</button>
          </td>
        </tr>`,
          )
          .join("")}
      </tbody>
    </table>`,
    { flush: true },
  )}
  ${pager(1, 11)}
</div>`,
            "Orders",
          ),
        },
        {
          name: "One destructive command in the row, guarded",
          rationale:
            "The row's second command is a removal, so it is drawn in the destructive tone and marked as the last item in the row menu rather than sitting inline next to a harmless one.",
          tradeoff:
            "A red word in every row is visual noise on a page where the reader is scanning for states, and Carbon warns that a tone with no action required should be plain text.",
          html: shell(
            "Deliveries",
            `<div class="page lt-page">
  ${phead("Deliveries", "Four deliveries, three with a date still ahead.", "", { crumb: trail("Home", "Deliveries") })}
  ${toolbar({ search: "", placeholder: "Search deliveries", views: [{ label: "Scheduled 3", on: true }, { label: "Past 1" }, { label: "All 4" }] })}
  ${section(
    "",
    `<table class="dt lt-t lt-stuck dense lt-pin-end">
      <thead><tr><th scope="col">Delivery</th><th scope="col">Date</th><th scope="col">State</th><th scope="col" class="num">Loaded</th><th scope="col" style="width:1%"></th></tr></thead>
      <tbody>
        ${[
          ["Becker spring refill", "9 Oct 2026", "Scheduled", "info", "32 of 40 pallets"],
          ["Lindqvist studio courier", "17 Oct 2026", "Scheduled", "info", "32 of 60 pallets"],
          ["Okafor office setup", "12 Dec 2026", "Draft", "neutral", "0 of 120 pallets"],
          [DELIVERY.name, "14 Mar 2026", "Delivered", "positive", "376 of 400 pallets"],
        ]
          .map(
            ([nm, when, st, tone, loaded]) => `<tr>
          <td><b>${nm}</b></td><td class="nowrap">${when}</td><td>${badgeRaw(st, tone, "outline")}</td><td class="num">${loaded}</td>
          <td style="width:1%;white-space:nowrap"><button class="btn xs">Open</button> <button class="btn xs icon" aria-label="More actions for ${nm}">⋯</button></td>
        </tr>`,
          )
          .join("")}
      </tbody>
    </table>`,
    { flush: true },
  )}
  ${pager(1, 1, 1, 4, 4)}
</div>`,
            "Orders",
          ),
        },
        {
          name: "The row menu drawn open",
          rationale:
            "The shadcn/ui dropdown menu on the row, drawn open: the harmless commands first, then a separator, then the destructive one last. The reader sees every command the row holds without guessing what the dots hide.",
          tradeoff:
            "An open menu covers the rows under it, so it only proves the menu's contents, not the table's reading. The menu must also flip sides near the table edge.",
          reference: "shadcn/ui",
          html: shell(
            "Orders",
            `<div class="page lt-page">
  ${phead("Orders", "Every paid order across every delivery, newest first.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order number, name or email" })}
  <div class="lt-anchor">${section(
    "",
    `<table class="dt lt-t lt-stuck dense lt-pin-end">
      <thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col" class="lt-p2">Placed</th><th scope="col">State</th><th scope="col" class="num">Paid</th><th scope="col" style="width:1%"></th></tr></thead>
      <tbody>
        ${ORDERS.slice(0, 5)
          .map(
            ([no, delivery, who, when, state, tone, paid], i) => `<tr>
          <td><span class="lines"><span class="code">${no}</span><small>${delivery}</small></span></td>
          <td><span class="lines"><b>${who.customer}</b><small>${who.email}</small></span></td>
          <td class="nowrap lt-p2">${when}</td><td>${badgeRaw(state, tone, "outline")}</td><td class="num">${paid}</td>
          <td style="width:1%;white-space:nowrap"><button class="btn sm">Resend</button> <button class="btn sm icon" aria-label="More actions for order ${no}"${i === 0 ? ' aria-expanded="true"' : ""}>⋯</button></td>
        </tr>`,
          )
          .join("")}
      </tbody>
    </table>`,
    { flush: true },
  )}
  ${popAt("right:12px;top:64px;width:210px", '<div class="cap">Order 7K4Q2M</div><div class="item">Open the order</div><div class="item">Resend confirmation</div><div class="item">Copy the order link</div><div class="sep"></div><div class="item danger">Void the order</div>')}</div>
  ${pager(1, 11)}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Open in a side preview, act from there",
          rationale:
            "Shopify and Stripe open a row in a side panel that carries the record's facts and its commands together. Resending Maria Garcia's confirmation happens beside the order lines, so the reader checks what is sent before sending it.",
          tradeoff:
            "A panel over the list hides the rows it came from, and on a phone it is a full screen, which makes it a page by another name.",
          reference: "Shopify",
          html: shell(
            "Orders",
            `<div class="page lt-page">
  ${phead("Orders", "Every paid order across every delivery, newest first.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order number, name or email" })}
  ${section("", table([{ label: "Order", key: "order" }, { label: "Customer", key: "customer" }, { label: "Placed", key: "when" }, { label: "State", key: "state" }, { label: "Paid", key: "paid", cls: "num" }], { rows: 5 }), { flush: true })}
  ${pager(1, 11)}
</div>
${drawer(
  `<div class="dbody"><h3 style="font-size:14px;margin-bottom:2px">Order 7K4Q2M</h3><p class="note tight" style="margin-bottom:12px">Maria Garcia · ${DELIVERY.name}</p>${split("2 Oak desk lamps", MONEY.lineTotal)}${split("1 desk chair", "EUR 35.00")}${split("Shipping", "EUR 0.00")}<div class="btnrow" style="margin-top:14px"><button class="btn sm primary">Resend confirmation</button><button class="btn sm">Copy the order link</button></div></div>`,
  { footer: '<button class="btn sm subtle-danger">Void the order</button>' },
)}`,
            "Orders",
          ),
        },
      ],
    },
    {
      id: "table-states",
      title: "The table's own states",
      why: "Carbon makes three empty states distinct: <b>no data yet</b>, <b>no results for a search</b> and <b>an error in place of the content</b>. It also says an empty state replaces the table entirely, headers included, so a screen reader does not read six empty headers first.",
      verdict:
        "The pick is (a) for the never-had-data case, paired with (b) for no-results and (c) for loading: three sentences for three different facts, each replacing the table it stands for. The runner-up is (h), a slow read that names what it is doing, for the nights the list takes seconds rather than milliseconds. Never ship a bare spinner over the table body instead of (c): rows that shift when the data lands move the row the reader already chose.",
      variants: [
        {
          name: "No data yet, table replaced",
          pick: true,
          rationale:
            "Nothing has ever existed, so the table and its headers are gone and one positive sentence offers the command that creates the first record.",
          tradeoff:
            "The reader cannot see what a row will look like, so the columns are undiscoverable until there is data.",
          html: shell(
            "Deliveries",
            `<div class="page lt-page">
  ${phead("Deliveries", "Six deliveries a week, from a 40-pallet restock to a single parcel.", '<button class="btn primary">New delivery</button>', {
    crumb: trail("Home", "Deliveries"),
  })}
  ${section("", emptyState("No deliveries yet", "A delivery holds the date, the warehouse, the load and what is on it.", '<button class="btn primary">New delivery</button>', "◈"))}
</div>`,
            "Orders",
          ),
        },
        {
          name: "No results for a search, filters named",
          rationale:
            "Something exists but nothing matches, so the copy names the term and the filters and offers to clear them. A different sentence from the no-data case, because a different thing happened.",
          tradeoff:
            "Two empty states means two pieces of copy per list page, both of which have to stay true as filters change.",
          html: shell(
            "Orders",
            `<div class="page lt-page">
  ${phead("Orders", "No orders match this search.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "maria becker", placeholder: "Order number, name or email", filters: [DELIVERY.name, "Paid"] })}
  ${section(
    "",
    emptyState(
      "Nothing matches 'maria becker'",
      `268 orders exist, but none match this term with ${DELIVERY.name} and Paid applied.`,
      '<button class="btn">Clear the search</button><button class="btn ghost">Clear the filters too</button>',
      "⌕",
    ),
  )}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Loading as skeletons at the real row height",
          rationale:
            "Skeleton rows shaped like real rows at the real height, so nothing shifts when the data lands. Carbon asks for skeletons rather than a spinner over the body.",
          tradeoff:
            "Carbon also requires the header, the toolbar and the pagination to match the row size, which means a skeleton page has to get all four heights right or it jitters.",
          reference: "Carbon",
          html: shell(
            "Orders",
            `<div class="page lt-page">
  ${phead("Orders", "Every paid order across every delivery, newest first.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order number, name or email" })}
  ${section(
    "",
    `<table class="dt lt-t">
      <thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col" class="lt-p2">Placed</th><th scope="col">State</th><th scope="col" class="num">Paid</th></tr></thead>
      <tbody>
        ${Array.from(
          { length: 6 },
          () => `<tr>
          <td><div class="skel" style="width:56px"></div><div class="skel" style="width:88%;margin-top:5px"></div></td>
          <td><div class="skel" style="width:74px"></div><div class="skel" style="width:82%;margin-top:5px"></div></td>
          <td class="lt-p2"><div class="skel" style="width:64px"></div></td>
          <td><div class="skel" style="width:44px;height:19px;border-radius:999px"></div></td>
          <td class="num"><div class="skel" style="width:48px;margin-left:auto"></div></td>
        </tr>`,
        ).join("")}
      </tbody>
    </table>`,
    { flush: true },
  )}
  <div class="pager"><span class="skel" style="width:96px;display:inline-block"></span></div>
</div>`,
            "Orders",
          ),
        },
        {
          name: "A failed read keeps the chrome",
          rationale:
            "The table rendered before, so a refresh failed. Keeping the headers and showing the error in place tells the reader the data they can see is stale rather than current.",
          tradeoff:
            "Old rows under an error can be acted on by mistake, which is the opposite of what the message wants to prevent.",
          html: shell(
            "Orders",
            `<div class="page lt-page">
  ${phead("Orders", "Every paid order across every delivery, newest first.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order number, name or email" })}
  ${section(
    "",
    `<div style="padding:12px 14px 0">${""}
      <div class="alert destructive" role="alert">
        <span class="ico" aria-hidden="true">✕</span>
        <span class="txt"><b>These orders could not be refreshed.</b><small>What you see is from 2 minutes ago. The API did not answer.</small></span>
        <span class="tail"><button class="btn sm">Try again</button></span>
      </div>
    </div>
    <table class="dt lt-t" style="opacity:.55">
      <thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col" class="lt-p2">Placed</th><th scope="col">State</th><th scope="col" class="num">Paid</th></tr></thead>
      <tbody>
        ${ORDERS.slice(0, 4)
          .map(([no, delivery, who, when, state, tone, paid]) => `<tr><td><span class="lines"><span class="code">${no}</span><small>${delivery}</small></span></td><td><span class="lines"><b>${who.customer}</b><small>${who.email}</small></span></td><td class="nowrap lt-p2">${when}</td><td>${badgeRaw(state, tone, "outline")}</td><td class="num">${paid}</td></tr>`)
          .join("")}
      </tbody>
    </table>`,
    { flush: true },
  )}
  ${pager(1, 11)}
</div>`,
            "Orders",
          ),
        },
        {
          name: "A failed first read drops the table",
          rationale:
            "Nothing ever loaded, so there is no table to keep. Carbon's rule is that the empty state replaces the element it stands for, headers and footer included.",
          tradeoff:
            "The reader loses the column names, so a retry that succeeds looks like a different page rather than the page they were on.",
          reference: "Carbon",
          html: shell(
            "Orders",
            `<div class="page lt-page">
  ${phead("Orders", "Every paid order across every delivery, newest first.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order number, name or email" })}
  ${section(
    "",
    emptyState(
      "Orders could not be loaded",
      "The API did not answer. Nothing has been lost; the orders are still there.",
      '<button class="btn primary">Try again</button>',
      "⚠",
    ),
  )}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Refreshing in place, with the last read stated",
          rationale:
            "A queue reads itself on a timer. A quiet control says how often and when it last did, and offers to stop it.",
          tradeoff:
            "A timer on a page holding money means the reader may act on a value that changes a second later. A statement of when it last read is the mitigation, not a fix.",
          html: shell(
            "Orders",
            `<div class="page lt-page">
  ${phead("Orders", "Every paid order across every delivery, newest first.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order number, name or email", right: '<span class="inline" style="gap:6px;font-size:11.5px;color:var(--muted-foreground)">Read 12 s ago <button class="btn xs">Stop</button></span>' })}
  ${section("", table([{ label: "Order", key: "order" }, { label: "Customer", key: "customer" }, { label: "Placed", key: "when" }, { label: "State", key: "state" }, { label: "Paid", key: "paid", cls: "num" }], { rows: 5 }), { flush: true })}
  ${pager(1, 11)}
</div>`,
            "Orders",
          ),
        },
        {
          name: "No results with recent searches",
          rationale:
            "Linear's search keeps the recent searches under a no-result state, so a mistyped term costs one click to repair instead of retyping. The recent terms are the reader's own, which makes them the most likely next query.",
          tradeoff:
            "Recent searches are stored state with their own lifecycle and their own privacy question. They also go stale as deliveries complete.",
          reference: "Linear",
          html: shell(
            "Orders",
            `<div class="page lt-page">
  ${phead("Orders", "No orders match this search.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "maria becker", placeholder: "Order number, name or email", filters: [DELIVERY.name, "Paid"] })}
  ${section(
    "",
    emptyState(
      "Nothing matches 'maria becker'",
      `268 orders exist, but none match this term with ${DELIVERY.name} and Paid applied.`,
      '<div class="chips"><button class="chip">maria garcia</button><button class="chip">7K4Q2M</button><button class="chip">tom@becker-bouw.example</button></div><button class="btn">Clear the search</button>',
      "⌕",
    ),
  )}
</div>`,
            "Orders",
          ),
        },
        {
          name: "A slow read that says what it is doing",
          rationale:
            "Vercel and PlanetScale name a slow read while it runs: what is loading, how long it has taken, and a way to stop waiting. A reader who knows the list holds 268 orders waits; a reader watching a blank box leaves.",
          tradeoff:
            "A progress note needs the total before the rows arrive, which is a second read. It also teaches the reader that some lists are slow, which invites the question why.",
          reference: "Vercel",
          html: shell(
            "Orders",
            `<div class="page lt-page">
  ${phead("Orders", "Every paid order across every delivery, newest first.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order number, name or email" })}
  ${section(
    "",
    `<table class="dt lt-t">
      <thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col" class="lt-p2">Placed</th><th scope="col">State</th><th scope="col" class="num">Paid</th></tr></thead>
      <tbody>
        ${Array.from(
          { length: 4 },
          () => `<tr>
          <td><div class="skel" style="width:56px"></div><div class="skel" style="width:88%;margin-top:5px"></div></td>
          <td><div class="skel" style="width:74px"></div><div class="skel" style="width:82%;margin-top:5px"></div></td>
          <td class="lt-p2"><div class="skel" style="width:64px"></div></td>
          <td><div class="skel" style="width:44px;height:19px;border-radius:999px"></div></td>
          <td class="num"><div class="skel" style="width:48px;margin-left:auto"></div></td>
        </tr>`,
        ).join("")}
      </tbody>
    </table>`,
    { flush: true, desc: "Reading 268 orders… 6 s so far." },
  )}
  <div class="pager"><span>Reading…</span><span class="right"><button class="btn sm ghost">Stop</button></span></div>
</div>`,
            "Orders",
          ),
        },
      ],
    },
    {
      id: "table-status",
      title: "Status in a column",
      why: "The messages list uses badges with tone. The default orders table renders <b>bare words</b> for the ordinary states and a badge only for the rest: Paid and Completed are muted text, everything else takes a badge. It shows two adjacent words, Paid and Completed, whose difference the page does not explain.",
      verdict:
        "The pick is (c), tone only on the states that block: Disputed and Awaiting payment take a badge because somebody has to act, and Paid and Completed stay plain words. It is also what the default table does. The runner-up is (g), the reason on a second line, for the disputes queue where the word alone never answers why. Never ship (f), the progress marks: four blocks per row on a 268-row list, for a lifecycle that branches.",
      variants: [
        {
          name: "A badge for every state",
          rationale:
            "Every state is a badge mapping a code to a word and a tone. The word is the signal; the tone repeats it.",
          tradeoff:
            "Carbon warns that more than five or six status indicators overwhelm the eye, and that a status needing no action should be plain text. A badge on all twenty-five rows is exactly that.",
          html: shell(
            "Orders",
            `<div class="page lt-page">
  ${phead("Orders", "Every paid order across every delivery, newest first.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order number, name or email" })}
  ${section("", table([{ label: "Order", key: "order" }, { label: "Customer", key: "customer" }, { label: "Placed", key: "when" }, { label: "State", key: "state" }, { label: "Paid", key: "paid", cls: "num" }], { rows: 7 }), { flush: true })}
  ${pager(1, 11)}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Plain text, and the label says which state",
          rationale:
            "Plain words with no tone, because none of these states needs a decision. The header says State and the column holds one word, which keeps the interface quiet.",
          tradeoff:
            "A reader scanning for a problem has to read every word. With 268 rows that is slow, which is the case for badges.",
          html: shell(
            "Orders",
            `<div class="page lt-page">
  ${phead("Orders", "Every paid order across every delivery, newest first.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order number, name or email" })}
  ${section("", table([{ label: "Order", key: "order" }, { label: "Customer", key: "customer" }, { label: "Placed", key: "when" }, { label: "State", key: "plain" }, { label: "Paid", key: "paid", cls: "num" }], { rows: 7 }), { flush: true })}
  ${pager(1, 11)}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Tone only on the states that block",
          pick: true,
          rationale:
            "States that need a decision get a tone; the rest are plain words. This satisfies the 'no action required, use plain text' rule and keeps the table readable. It is what the default orders table draws.",
          tradeoff:
            "The reader has to learn which states are toned, and a new state added later has to be classified before it is used.",
          html: shell(
            "Orders",
            `<div class="page lt-page">
  ${phead("Orders", "Every paid order across every delivery, newest first.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order number, name or email" })}
  ${section(
    "",
    table(
      [
        { label: "Order", key: "order" },
        { label: "Customer", key: "customer" },
        { label: "Placed", key: "when" },
        {
          label: "State",
          render: (r) => (r[5] === "destructive" || r[5] === "caution" ? badgeRaw(r[4], r[5]) : `<span class="muted">${r[4]}</span>`),
        },
        { label: "Paid", key: "paid", cls: "num" },
      ],
      { rows: 7 },
    ),
    { flush: true, desc: "Disputed and Awaiting payment are toned because somebody has to act. Paid is not, because nothing is waiting." },
  )}
  ${pager(1, 11)}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Two states side by side, both named",
          rationale:
            "The default table's actual problem fixed rather than hidden: payment state and order state are separate columns, so Paid and Completed stop looking like two names for one thing.",
          tradeoff:
            "A seventh column on a table that already carries five, for a distinction most readers do not need until something is wrong.",
          html: shell(
            "Orders",
            `<div class="page lt-page">
  ${phead("Orders", "Every paid order across every delivery, newest first.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order number, name or email", filters: ["Any payment", "Any order"] })}
  ${section(
    "",
    table(
      [
        { label: "Order", key: "order" },
        { label: "Customer", key: "customer" },
        { label: "Placed", key: "when" },
        { label: "Payment", key: "plain" },
        { label: "Order state", render: (r) => (r[4] === "Paid" ? "Open" : r[4]) },
        { label: "Paid", key: "paid", cls: "num" },
      ],
      { rows: 6 },
    ),
    { flush: true },
  )}
  ${pager(1, 11)}
</div>`,
            "Orders",
          ),
        },
        {
          name: "A dot beside the word",
          rationale:
            "The word carries the meaning and a small dot carries the tone, so the column stays quiet and a scan still finds the one row that needs a decision.",
          tradeoff:
            "A dot beside a word is a third channel after word and badge, and it adds an element that has to be explained once. It is also below 3:1 against the row background unless the token is chosen for it.",
          html: shell(
            "Orders",
            `<div class="page lt-page">
  ${phead("Orders", "Every paid order across every delivery, newest first.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order number, name or email" })}
  ${section(
    "",
    table(
      [
        { label: "Order", key: "order" },
        { label: "Customer", key: "customer" },
        { label: "Placed", key: "when" },
        {
          label: "State",
          render: (r) => {
            const tone = r[5] === "destructive" ? "var(--destructive)" : r[5] === "positive" ? "var(--positive)" : "var(--input)";
            return `<span class="inline" style="gap:6px"><span style="width:7px;height:7px;border-radius:50%;background:${tone};flex:none"></span>${r[4]}</span>`;
          },
        },
        { label: "Paid", key: "paid", cls: "num" },
      ],
      { rows: 7 },
    ),
    { flush: true },
  )}
  ${pager(1, 11)}
</div>`,
            "Orders",
          ),
        },
        {
          name: "The state as a progress of three steps",
          rationale:
            "Where an order moves through a sequence, the column carries the sequence rather than the current step: placed, paid, packed, shipped. The reader sees both where it is and what is left.",
          tradeoff:
            "Four marks per row is heavy on a 268-row list, and it only works because the order lifecycle genuinely is linear. A state with branches cannot use it.",
          html: shell(
            "Orders",
            `<div class="page lt-page">
  ${phead("Orders", "Every paid order across every delivery, newest first.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order number, name or email" })}
  ${section(
    "",
    table(
      [
        { label: "Order", key: "order" },
        { label: "Customer", key: "customer" },
        {
          label: "Progress",
          render: (r) => {
            const done = r[4] === "Paid" ? 3 : 1;
            const bad = r[5] === "destructive";
            return `<span class="inline" style="gap:3px">${[0, 1, 2, 3]
              .map((i) => `<span style="width:15px;height:4px;border-radius:2px;background:${bad && i === 1 ? "var(--destructive)" : i < done ? "var(--foreground)" : "var(--input)"}"></span>`)
              .join("")}</span>`;
          },
        },
        { label: "Paid", key: "paid", cls: "num" },
      ],
      { rows: 7 },
    ),
    { flush: true, desc: "Placed, paid, packed, shipped." },
  )}
  ${pager(1, 11)}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Status with the reason on a second line",
          rationale:
            "Stripe's payments list pairs the state with its reason: Disputed with why the bank asked, Awaiting payment with how old the wait is. The word says what, the line says why, and the reader never opens a row to learn the reason.",
          tradeoff:
            "Two lines doubles the row height for every row, including the paid ones whose reason is nothing. Only right on a queue where most rows need a decision.",
          reference: "Stripe",
          html: shell(
            "Orders",
            `<div class="page lt-page">
  ${phead("Orders", "Every paid order across every delivery, newest first.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order number, name or email", filters: ["Needs attention"] })}
  ${section(
    "",
    table(
      [
        { label: "Order", key: "order" },
        { label: "Customer", key: "customer" },
        {
          label: "State",
          render: (r) => {
            const why = { "8M3DWR": "Bank transfer, 2 days old", YB281K: "The bank asked for evidence", "3H3C68": "Went back on 6 Oct 2026" }[r[0]];
            return `<span class="lines">${r[5] === "destructive" || r[5] === "caution" ? badgeRaw(r[4], r[5]) : `<span class="muted">${r[4]}</span>`}${why ? `<small>${why}</small>` : ""}</span>`;
          },
        },
        { label: "Paid", key: "paid", cls: "num" },
      ],
      { rows: 7 },
    ),
    { flush: true },
  )}
  ${pager(1, 11)}
</div>`,
            "Orders",
          ),
        },
        {
          name: "A stale wait takes a stronger tone",
          rationale:
            "Zendesk and Intercom colour a waiting state by its age: an awaiting payment that is two hours old is neutral, at two days it turns caution. The tone answers how urgent the wait is, not just that there is one.",
          tradeoff:
            "The tone now depends on the clock, so the same row reads differently in the morning and the evening. A support reply that says 'the yellow one' goes stale within hours.",
          reference: "Zendesk",
          html: shell(
            "Orders",
            `<div class="page lt-page">
  ${phead("Orders", "Six orders still waiting on money.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order number, name or email", filters: ["Awaiting payment"] })}
  ${section(
    "",
    `<table class="dt lt-t lt-stuck">
      <thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col">State</th><th scope="col" class="num">Paid</th></tr></thead>
      <tbody>
        ${[
          ["KX41QZ", "Ade Okafor", "Awaiting payment", "neutral", "2 hours old", MONEY.lamp],
          ["8M3DWR", "Ade Okafor", "Awaiting payment", "caution", "2 days old", MONEY.lamp],
          ["QW90LM", "Tom Becker", "Awaiting payment", "caution", "6 days old", "EUR 50.00"],
          ["YB281K", "Ade Okafor", "Disputed", "destructive", "Unanswered for 5 days", MONEY.refund],
          ["ZP33RT", "Elin Lindqvist", "Disputed", "destructive", "Unanswered for 12 days", "EUR 50.00"],
        ]
          .map(
            ([no, who, st, tone, age, paid]) =>
              `<tr><td><span class="code">${no}</span></td><td>${who}</td><td><span class="lines">${tone === "neutral" ? `<span class="muted">${st}</span>` : badgeRaw(st, tone)}<small>${age}</small></span></td><td class="num">${paid}</td></tr>`,
          )
          .join("")}
      </tbody>
    </table>`,
    { flush: true, desc: "The tone follows the age of the wait." },
  )}
  ${pager(1, 1, 1, 6, 6)}
</div>`,
            "Orders",
          ),
        },
      ],
    },
    {
      id: "table-money-column",
      title: "The money column",
      why: "Amounts are right-aligned and tabular in the default table. The open question is what the cell says beyond the number: the currency is implicit, and a <b>EUR 0.00</b> row sits beside real amounts with nothing saying why.",
      verdict:
        "The pick is (a), the number only: the header names the currency and repeating EUR on every row is noise. The runner-up is (h), the refunded part under the charged amount, on any queue where refunds are the work rather than the exception. Never ship (e), money as a share of the total: a derived percentage column answers a question no orders list is asked.",
      variants: [
        {
          name: "Number only, right-aligned",
          pick: true,
          rationale:
            "The default shape. A column headed Paid is unambiguous about the currency, so repeating EUR on every row is noise.",
          tradeoff:
            "EUR 0.00 reads as an error rather than as a fact. Two of the eight default rows are zero, and neither says why.",
          html: shell(
            "Orders",
            `<div class="page lt-page">
  ${phead("Orders", "Every paid order across every delivery, newest first.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order number, name or email" })}
  ${section("", table([{ label: "Order", key: "order" }, { label: "Customer", key: "customer" }, { label: "Placed", key: "when" }, { label: "State", key: "state" }, { label: "Paid", key: "paid", cls: "num" }], { rows: 7 }), { flush: true })}
  ${pager(1, 11)}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Symbol and value, one column",
          rationale:
            "The symbol sits in the cell rather than the word EUR, which is shorter and still unambiguous in a Dutch-language back office. The column header names it: Paid, EUR.",
          tradeoff:
            "A symbol alone fails WCAG 2.2 SC 1.4.1 if it is the only distinction, and a screen reader does not always read a symbol prefix. The currency belongs in the label as well.",
          html: shell(
            "Orders",
            `<div class="page lt-page">
  ${phead("Orders", "Every paid order across every delivery, newest first.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order number, name or email" })}
  ${section(
    "",
    table(
      [
        { label: "Order", key: "order" },
        { label: "Customer", key: "customer" },
        { label: "Placed", key: "when" },
        { label: "State", key: "state" },
        {
          label: "Paid (EUR)",
          cls: "num",
          render: (r) => `<span style="font-variant-numeric:tabular-nums">&euro;${r[6].replace("EUR ", "")}</span>`,
        },
      ],
      { rows: 7 },
    ),
    { flush: true },
  )}
  ${pager(1, 11)}
</div>`,
            "Orders",
          ),
        },
        {
          name: "A zero amount says why",
          rationale:
            "EUR 0.00 is a real state, not an error, so the cell names it: Fully refunded. A bare zero reads as missing data, and the word says it is a fact.",
          tradeoff:
            "A word in a numeric column breaks the alignment. It has to be short enough not to push the column wide.",
          html: shell(
            "Orders",
            `<div class="page lt-page">
  ${phead("Orders", "Every paid order across every delivery, newest first.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order number, name or email", filters: ["Any state"] })}
  ${section(
    "",
    table(
      [
        { label: "Order", key: "order" },
        { label: "Customer", key: "customer" },
        { label: "Placed", key: "when" },
        { label: "State", key: "state" },
        {
          label: "Paid",
          cls: "num",
          render: (r) => (r[6] === "EUR 0.00" ? '<span class="muted" style="font-size:11.5px">Nothing, refunded</span>' : r[6]),
        },
      ],
      { rows: 7 },
    ),
    { flush: true },
  )}
  ${pager(1, 11)}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Two money columns: charged and refunded",
          rationale:
            "Where refunds are common, the net matters more than the gross. A second column turns a negative into a fact rather than something the reader has to reconstruct.",
          tradeoff:
            "Two money columns on a five-column table is a lot of numbers, and most rows are identical in both, so the reader scans two equal columns to learn nothing.",
          html: shell(
            "Orders",
            `<div class="page lt-page">
  ${phead("Orders", "Every paid order across every delivery, newest first.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order number, name or email", filters: ["Any state"] })}
  ${section(
    "",
    table(
      [
        { label: "Order", key: "order" },
        { label: "Customer", key: "customer" },
        { label: "Placed", key: "when" },
        { label: "State", key: "state" },
        { label: "Charged", cls: "num", render: (r) => r[6] },
        { label: "Refunded", cls: "num", render: (r) => (r[4] === "Refunded" ? r[6] : '<span class="muted">—</span>') },
      ],
      { rows: 7 },
    ),
    { flush: true, desc: "Refunded is the total that went back to the customer." },
  )}
  ${pager(1, 11)}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Money as a share of the total",
          rationale:
            "For a table read to answer 'what did this delivery take', the amount column is joined by a share. The reader gets proportion without a second table.",
          tradeoff:
            "A share is derived from the total, so it goes stale the moment the filter changes. One column of derived percentages is a small exception, not a pattern.",
          html: shell(
            "Orders",
            `<div class="page lt-page">
  ${phead("Orders", `${DELIVERY.name}, 1,204 orders.`, "", { crumb: trail("Home", "Deliveries", DELIVERY.name, "Orders") })}
  ${toolbar({ search: "", placeholder: "Search orders", filters: ["Any state"] })}
  ${section(
    "",
    table(
      [
        { label: "Order", key: "order" },
        { label: "Customer", key: "customer" },
        { label: "Placed", key: "when" },
        { label: "State", key: "state" },
        { label: "Paid", key: "paid", cls: "num" },
        { label: "Share", cls: "num", render: (r) => `${(Number(r[6].replace(/[^0-9.]/g, "")) / 125 * 100).toFixed(1)}%` },
      ],
      { rows: 6 },
    ),
    { flush: true, desc: "Of the EUR 125.00 Maria Garcia's order was." },
  )}
  ${pager(1, 49)}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Amounts grouped by day",
          rationale:
            "Rather than a derived percentage, the table is grouped by day with a subtotal per group, so the reader sees the shape of the money without a chart.",
          tradeoff:
            "Grouping removes the flat row order and makes the table a different component, so pagination and select-all both get harder to reason about.",
          html: shell(
            "Orders",
            `<div class="page lt-page">
  ${phead("Orders", "Newest first, grouped by day.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order number, name or email", filters: ["Any state"] })}
  ${section(
    "",
    `<table class="dt lt-t lt-stuck">
      <thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col">State</th><th scope="col" class="num">Paid</th></tr></thead>
      <tbody>
        <tr class="lt-group"><td colspan="4">Today, 8 Oct 2026 <span class="tot">EUR 270.00</span></td></tr>
        ${[
          ["7K4Q2M", "Maria Garcia", "Paid", "positive", MONEY.order],
          ["STT855", "Tom Becker", "Paid", "positive", "EUR 50.00"],
          ["PP0K9B", "Maria Garcia", "Completed", "neutral", "EUR 25.00"],
        ]
          .map(([no, who, st, tone, paid]) => `<tr><td><span class="code">${no}</span><br><small class="muted">${DELIVERY.name}</small></td><td>${who}</td><td>${badgeRaw(st, tone, "outline")}</td><td class="num">${paid}</td></tr>`)
          .join("")}
        <tr class="lt-group"><td colspan="4">Yesterday, 7 Oct 2026 <span class="tot">EUR 95.00</span></td></tr>
        ${[
          ["3H3C68", "Elin Lindqvist", "Refunded", "neutral", "EUR 50.00"],
          ["YB281K", "Ade Okafor", "Disputed", "destructive", MONEY.refund],
        ]
          .map(([no, who, st, tone, paid]) => `<tr><td><span class="code">${no}</span><br><small class="muted">${DELIVERY.name}</small></td><td>${who}</td><td>${badgeRaw(st, tone, "outline")}</td><td class="num">${paid}</td></tr>`)
          .join("")}
      </tbody>
    </table>`,
    { flush: true },
  )}
  ${pager(1, 11)}
</div>`,
            "Orders",
          ),
        },
        {
          name: "A totals footer under the money",
          rationale:
            "Shopify's reports end the money column with a totals row: what the page holds and, where a filter narrows it, what the filter holds. Finance reads the answer without exporting the list to add it up.",
          tradeoff:
            "A page total invites reading it as the whole answer when the filter holds eleven pages. The footer has to say which total it is or it misleads.",
          reference: "Shopify",
          html: shell(
            "Orders",
            `<div class="page lt-page">
  ${phead("Orders", `${DELIVERY.name}, 1,204 orders.`, "", { crumb: trail("Home", "Deliveries", DELIVERY.name, "Orders") })}
  ${toolbar({ search: "", placeholder: "Search orders", filters: ["Any state"] })}
  ${section(
    "",
    `<table class="dt lt-t lt-stuck">
      <thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col" class="lt-p2">Placed</th><th scope="col">State</th><th scope="col" class="num">Paid</th></tr></thead>
      <tbody>
        ${ORDERS.slice(0, 5)
          .map(([no, delivery, who, when, state, tone, paid]) => `<tr><td><span class="lines"><span class="code">${no}</span><small>${delivery}</small></span></td><td><span class="lines"><b>${who.customer}</b><small>${who.email}</small></span></td><td class="nowrap lt-p2">${when}</td><td>${badgeRaw(state, tone, "outline")}</td><td class="num">${paid}</td></tr>`)
          .join("")}
      </tbody>
      <tfoot><tr><td colspan="4" style="font-weight:600">Total on this page</td><td class="num" style="font-weight:600">EUR 270.00</td></tr></tfoot>
    </table>`,
    { flush: true, desc: "The total covers the 25 orders on this page, not the 1,204 in the filter." },
  )}
  ${pager(1, 49)}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Refunded shown under the charged amount",
          rationale:
            "Stripe's invoice lines keep one money column and put what went back on its second line: the charged amount, then what returned to the customer. One column stays scannable and the refund is still on the row.",
          tradeoff:
            "Two lines doubles the row height, and a part refund needs a third fact, the net, which has nowhere to go in this cell.",
          reference: "Stripe",
          html: shell(
            "Orders",
            `<div class="page lt-page">
  ${phead("Orders", "Every paid order across every delivery, newest first.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order number, name or email", filters: ["Any state"] })}
  ${section(
    "",
    table(
      [
        { label: "Order", key: "order" },
        { label: "Customer", key: "customer" },
        { label: "Placed", key: "when" },
        { label: "State", key: "state" },
        {
          label: "Paid",
          cls: "num",
          render: (r) => (r[4] === "Refunded" ? `<span class="lt-money2">${r[6]}<small>${r[6]} back to the customer</small></span>` : r[6]),
        },
      ],
      { rows: 7 },
    ),
    { flush: true },
  )}
  ${pager(1, 11)}
</div>`,
            "Orders",
          ),
        },
      ],
    },
    {
      id: "table-export",
      title: "Exporting the list",
      floorplan: "list-page",
      why: "A back-office user downloads the list when the work continues in another tool, prints it when the work happens where a screen cannot be trusted, and schedules it when the same question is asked every week. Download is for the accountant reconciling the Garcia Interiors restock in a spreadsheet, print is for the pickup counter holding a pickup sheet when the network drops, and a scheduled email is for finance wanting the Monday figures without opening the back office. The three differ only in when the reader needs the rows: once now, once on paper, or again and again without asking.",
      verdict:
        "The pick is (a), one Export button that downloads the filtered rows as CSV: the accountant's job costs one click and no decisions. The runner-up is (g), a background export, past a few thousand rows where a download would time out. Never ship (f) as the only export: copying the visible page silently drops every row past the pager.",
      variants: [
        {
          name: "One Export button that downloads CSV",
          pick: true,
          rationale:
            "The default behavior. One button in the toolbar downloads exactly the rows in the current filter as CSV, so the accountant gets the Garcia Interiors restock orders with one click and no decisions.",
          tradeoff:
            "No choice of columns or format, so a reader who wants only order number and paid, or an Excel file, has to trim or convert it elsewhere.",
          html: shell(
            "Orders",
            `<div class="page lt-page">
  ${phead("Orders", "Every paid order for the Garcia Interiors restock, newest first.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order number, name or email", right: '<button class="btn sm">Export CSV</button>' })}
  ${section("", ordersTable({ rows: 5 }), { flush: true })}
  ${pager(1, 11)}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Export dialog with columns and format",
          rationale:
            "The Export button opens a dialog where the reader picks the format and the columns before anything downloads. The reader states what leaves the back office rather than trimming a fixed file afterwards.",
          tradeoff:
            "Two steps instead of one, and the dialog has to remember or reset its choices on the next visit, which the single button never has to decide.",
          html: shell(
            "Orders",
            `<div class="page lt-page">
  ${phead("Orders", "Every paid order for the Garcia Interiors restock, newest first.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order number, name or email", right: '<button class="btn sm">Export</button>' })}
  ${section("", ordersTable({ rows: 5 }), { flush: true })}
  ${pager(1, 11)}
</div>
${dialog(
  "Export orders",
  `<div style="display:grid;gap:12px">
    ${field("Format", select("CSV", ["CSV", "Excel", "PDF"]))}
    <div>
      <div style="font-size:12px;margin-bottom:6px">Columns</div>
      <div style="display:grid;gap:6px">
        <label class="check"><input type="checkbox" checked><span>Order</span></label>
        <label class="check"><input type="checkbox" checked><span>Customer</span></label>
        <label class="check"><input type="checkbox" checked><span>Placed</span></label>
        <label class="check"><input type="checkbox" checked><span>State</span></label>
        <label class="check"><input type="checkbox" checked><span>Paid</span></label>
      </div>
    </div>
  </div>`,
  { desc: "Exports the 268 orders in the current filter.", footer: '<button class="btn sm ghost">Cancel</button><button class="btn sm">Export</button>' },
)}`,
            "Orders",
          ),
        },
        {
          name: "Scheduled email export",
          rationale:
            "The team sets a rhythm once and finance receives the orders without opening the back office. A Monday 07:00 email answers the weekly question before anyone asks it.",
          tradeoff:
            "A schedule is invisible state: nobody sees it on the orders page, so a stale recipient keeps receiving figures until someone remembers the schedule exists.",
          html: shell(
            "Orders",
            `<div class="page lt-page">
  ${phead("Scheduled exports", "Acme Supply receives its orders by email, on a rhythm it sets once.", '<button class="btn sm">New schedule</button>', { crumb: trail("Home", "Orders", "Scheduled exports") })}
  ${section(
    "Monday figures",
    `<div style="display:grid;gap:12px">
      ${field("Every", select("Monday 07:00", ["Monday 07:00", "Daily 07:00", "First of the month"]))}
      ${field("Send to", input(COMPANY.email))}
      ${field("Scope", select(DELIVERY.name, [DELIVERY.name, "All deliveries"]))}
    </div>
    ${notice("info", "The next export runs Monday at 07:00 and covers the orders placed since the last one.")}`,
    { desc: "One schedule per recipient, each with its own rhythm and scope." },
  )}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Print stylesheet with a Print button",
          rationale:
            "The Print button opens the browser print path and the print stylesheet keeps only the rows: order, customer, placed, state and paid. The pickup counter gets a pickup sheet that works when the network does not.",
          tradeoff:
            "Paper freezes the list at print time, so an order paid after printing is missing and nothing on the sheet says how old it is except the printed date.",
          html: shell(
            "Orders",
            `<div class="page lt-page">
  ${phead("Orders", "Every paid order for the Garcia Interiors restock, newest first.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order number, name or email", right: '<button class="btn sm">Print</button>' })}
  ${notice("info", "Printing hides the sidebar and the toolbar and keeps the order rows across as many pages as they need.")}
  ${section("", ordersTable({ rows: 6 }), { flush: true })}
  ${pager(1, 11)}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Per-row receipt download",
          rationale:
            "Each row carries its own receipt, so answering one customer means downloading one file rather than exporting the whole list and cutting it down. Order 7K4Q2M for Maria Garcia downloads as its own EUR 125.00 receipt.",
          tradeoff:
            "A button on every row narrows the table and invites downloading receipts one by one for a job that wants the whole list, which is slower than one export.",
          html: shell(
            "Orders",
            `<div class="page lt-page">
  ${phead("Orders", "Every paid order for the Garcia Interiors restock, newest first.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order number, name or email" })}
  ${section(
    "Receipts",
    recordRow({ title: "7K4Q2M", sub: "Maria Garcia, " + DELIVERY.name, state: { label: "Paid", tone: "positive" }, fig: MONEY.order, figSub: "2 lamps and a chair", actions: '<button class="btn sm">Receipt</button>' }),
    { desc: "One file per order, for answering one customer." },
  )}
  ${pager(1, 11)}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Copy the list to the clipboard",
          rationale:
            "One button copies the visible rows as tab-separated values, which paste straight into a spreadsheet. Nothing downloads, so there is no file to find, rename or delete afterwards.",
          tradeoff:
            "Only the visible page is copied, so pasting 25 rows when the filter holds 268 silently drops the rest unless the reader notices the pager.",
          html: shell(
            "Orders",
            `<div class="page lt-page">
  ${phead("Orders", "Every paid order for the Garcia Interiors restock, newest first.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order number, name or email", right: '<button class="btn sm">Copy visible rows</button>' })}
  ${section("", ordersTable({ rows: 5 }), { flush: true })}
  ${pager(1, 11)}
  ${toast("positive", "25 visible orders copied as tab-separated values.")}
</div>`,
            "Orders",
          ),
        },
        {
          name: "A large export that runs in the background",
          rationale:
            "Shopify's bulk operations prepare a large export while the reader keeps working, then email a download link. Past a few thousand rows a direct download times out, and a progress note beats a failed one.",
          tradeoff:
            "The file arrives later, so the reader cannot reconcile against it right away. The export also needs its own failure state when the job dies overnight.",
          reference: "Shopify",
          html: shell(
            "Orders",
            `<div class="page lt-page">
  ${phead("Orders", "Every paid order for the Garcia Interiors restock, newest first.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order number, name or email", right: '<button class="btn sm" disabled>Exporting…</button>' })}
  ${alert("info", "Preparing 9,412 orders as CSV.", "We will email " + COMPANY.email + " when the file is ready. The list below keeps working.")}
  <div style="margin:10px 0">${progress(34)}</div>
  ${section("", ordersTable({ rows: 5 }), { flush: true })}
  ${pager(1, 11)}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Export history with repeat download",
          rationale:
            "Stripe's dashboard keeps every export in a list with its rows, its date and who asked for it, and each one downloads again. The Monday figures are re-downloaded rather than re-built, and finance can see what left the back office.",
          tradeoff:
            "Stored files with customer data need their own retention and access rule. A history nobody prunes becomes a second database of personal data.",
          reference: "Stripe",
          html: shell(
            "Orders",
            `<div class="page lt-page">
  ${phead("Export history", "Every file that left the orders list, newest first.", '<button class="btn sm">New export</button>', { crumb: trail("Home", "Orders", "Export history") })}
  ${section(
    "",
    `<table class="dt lt-t lt-stuck">
      <thead><tr><th scope="col">File</th><th scope="col">Rows</th><th scope="col" class="lt-p2">Asked</th><th scope="col" class="lt-p2">By</th><th scope="col"></th></tr></thead>
      <tbody>
        <tr><td><span class="lines"><b>garcia-restock-orders-oct.csv</b><small>CSV · Orders</small></span></td><td class="num">268</td><td class="nowrap lt-p2">8 Oct 09:41</td><td class="lt-p2">Priya Shah</td><td class="num"><button class="btn sm">Download</button></td></tr>
        <tr><td><span class="lines"><b>garcia-restock-orders-sep.xlsx</b><small>Excel · Orders</small></span></td><td class="num">1,204</td><td class="nowrap lt-p2">1 Oct 08:02</td><td class="lt-p2">Priya Shah</td><td class="num"><button class="btn sm">Download</button></td></tr>
        <tr><td><span class="lines"><b>becker-refill-pickup.pdf</b><small>PDF · Pickup sheet</small></span></td><td class="num">812</td><td class="nowrap lt-p2">9 Oct 06:15</td><td class="lt-p2">Chris Novak</td><td class="num"><button class="btn sm">Download</button></td></tr>
      </tbody>
    </table>`,
    { flush: true, desc: "Files stay for 30 days, then they are removed." },
  )}
</div>`,
            "Orders",
          ),
        },
      ],
    },
    {
      id: "lt-search-highlight",
      title: "Searching with highlighted matches",
      why: "The default search box filters the table and says nothing about <b>why a row matched</b>. A term that matches the email but not the name leaves the reader guessing, and a term with forty matches gives no way to move between them.",
      verdict:
        "The pick is (a), matches highlighted in the cells: the reader sees why each row matched without opening it. The runner-up is (b), a scope control, once readers search across deliveries and need to say which one. Never ship (c), a match column, on its own: it spends a column stating what the highlight already shows.",
      variants: [
        {
          name: "Matches highlighted in the cells",
          pick: true,
          rationale:
            "GitHub's code search marks the matched text where it sits. The term stays visible in the box and every match glows in its cell, so the reader trusts the filter.",
          tradeoff:
            "Highlighting needs the match offsets from the server, not just the rows. A client-side guess highlights the wrong occurrence on long text.",
          reference: "GitHub",
          html: ordersPage(
            `${toolbar({ search: "maria", placeholder: "Order number, name or email" })}${section(
              "",
              `<table class="dt lt-t lt-stuck">
                <thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col" class="lt-p2">Placed</th><th scope="col">State</th><th scope="col" class="num">Paid</th></tr></thead>
                <tbody>
                  <tr><td><span class="lines"><span class="code">7K4Q2M</span><small>${DELIVERY.name}</small></span></td><td><span class="lines"><b>${hit("Maria")} Garcia</b><small>${hit("maria")}@garcia-interiors.example</small></span></td><td class="nowrap lt-p2">8 Oct 09:32</td><td><span class="muted">Paid</span></td><td class="num">${MONEY.order}</td></tr>
                  <tr><td><span class="lines"><span class="code">PP0K9B</span><small>Counter sale, no delivery</small></span></td><td><span class="lines"><b>${hit("Maria")} Garcia</b><small>${hit("maria")}@garcia-interiors.example</small></span></td><td class="nowrap lt-p2">8 Oct 09:27</td><td><span class="muted">Completed</span></td><td class="num">EUR 25.00</td></tr>
                </tbody>
              </table>`,
              { flush: true, desc: "2 of 268 orders match." },
            )}${pager(1, 1, 1, 2, 2)}`,
            { desc: "2 of 268 orders match 'maria'." },
          ),
        },
        {
          name: "Scoped search: this delivery or all deliveries",
          rationale:
            "Shopify scopes a search to the current view or the whole store from one control beside the box. A reader inside the Garcia Interiors restock searches it first and widens only when nothing matches.",
          tradeoff:
            "A scope is invisible once set: a reader who narrowed to one delivery last week searches it again today and wonders where the rest went.",
          reference: "Shopify",
          html: ordersPage(
            `${toolbar({ search: "maria", placeholder: "Order number, name or email", filters: [fsel(DELIVERY.name, ["All deliveries"])] })}${section(
              "",
              `<table class="dt lt-t lt-stuck">
                <thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col">State</th><th scope="col" class="num">Paid</th></tr></thead>
                <tbody>
                  <tr><td><span class="code">7K4Q2M</span></td><td><b>${hit("Maria")} Garcia</b></td><td><span class="muted">Paid</span></td><td class="num">${MONEY.order}</td></tr>
                </tbody>
              </table>`,
              { flush: true, desc: `1 match in ${DELIVERY.name}. 1 more in all deliveries.` },
            )}`,
            { desc: `Searching ${DELIVERY.name} for 'maria'.` },
          ),
        },
        {
          name: "A match column naming where it matched",
          rationale:
            "GitHub's issue search says which field matched when the term sits somewhere the row does not show. The column answers 'why is this row here' for matches in notes or metadata.",
          tradeoff:
            "A column spent stating what a highlight already shows, on every row, for every search. It only earns its width where rows match on hidden fields.",
          reference: "GitHub",
          html: ordersPage(
            `${toolbar({ search: "restock", placeholder: "Order number, name or email" })}${section(
              "",
              `<table class="dt lt-t lt-stuck">
                <thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col">Matched</th><th scope="col" class="num">Paid</th></tr></thead>
                <tbody>
                  <tr><td><span class="code">7K4Q2M</span></td><td>Maria Garcia</td><td><span class="muted">Delivery: Garcia Interiors ${hit("restock")}</span></td><td class="num">${MONEY.order}</td></tr>
                  <tr><td><span class="code">STT855</span></td><td>Tom Becker</td><td><span class="muted">Delivery: Garcia Interiors ${hit("restock")}</span></td><td class="num">EUR 50.00</td></tr>
                  <tr><td><span class="code">3H3C68</span></td><td>Elin Lindqvist</td><td><span class="muted">Delivery: Garcia Interiors ${hit("restock")}</span></td><td class="num">EUR 50.00</td></tr>
                </tbody>
              </table>`,
              { flush: true },
            )}${pager(1, 1, 1, 3, 3)}`,
            { desc: "3 of 268 orders match 'restock'." },
          ),
        },
        {
          name: "First match focused for the keyboard",
          rationale:
            "Linear focuses the first result as the reader types, so Enter opens it without a click. Support answering a caller moves from term to record without touching the mouse.",
          tradeoff:
            "A focused row looks selected, and Enter opening it surprises a reader who meant to refine the term. The hint has to teach the key or it misfires.",
          reference: "Linear",
          html: ordersPage(
            `${toolbar({ search: "maria", placeholder: "Order number, name or email" })}${section(
              "",
              `<table class="dt lt-t lt-stuck">
                <thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col">State</th><th scope="col" class="num">Paid</th></tr></thead>
                <tbody>
                  <tr class="is-sel"><td><span class="code">7K4Q2M</span></td><td><b>${hit("Maria")} Garcia</b></td><td><span class="muted">Paid</span></td><td class="num">${MONEY.order}</td></tr>
                  <tr><td><span class="code">PP0K9B</span></td><td><b>${hit("Maria")} Garcia</b></td><td><span class="muted">Completed</span></td><td class="num">EUR 25.00</td></tr>
                </tbody>
              </table>`,
              { flush: true, desc: "Enter opens the first match. Up and down move between them." },
            )}`,
            { desc: "2 of 268 orders match 'maria'." },
          ),
        },
        {
          name: "Recent searches under the box",
          rationale:
            "Vercel and Linear offer the reader's own recent terms under an empty search box. A term searched twice a day costs one click instead of fourteen keystrokes.",
          tradeoff:
            "Recent terms are stored per user with their own privacy question, and a term from a finished delivery lingers until it is cleared.",
          reference: "Vercel",
          html: ordersPage(
            `<div class="lt-anchor">${toolbar({ search: "", placeholder: "Order number, name or email" })}
            ${popAt("left:0;top:38px;width:250px", '<div class="cap">Recent searches</div><div class="item">maria garcia</div><div class="item">7K4Q2M</div><div class="item">disputed</div><div class="sep"></div><div class="item">Clear recent searches</div>')}</div>${section(
              "",
              table(
                [
                  { label: "Order", key: "order" },
                  { label: "Customer", key: "customer" },
                  { label: "Placed", key: "when" },
                  { label: "State", key: "state" },
                  { label: "Paid", key: "paid", cls: "num" },
                ],
                { rows: 5 },
              ),
              { flush: true },
            )}${pager(1, 11)}`,
          ),
        },
        {
          name: "A searching indicator while the server answers",
          rationale:
            "Stripe's dashboard says when a search is still running rather than showing yesterday's rows as if they matched. The reader waits instead of acting on a stale list.",
          tradeoff:
            "A visible search state needs debouncing and cancelling, or every keystroke queues a request and the indicator flickers.",
          reference: "Stripe",
          html: ordersPage(
            `${toolbar({ search: "maria garcia restock", placeholder: "Order number, name or email" })}${section(
              "",
              `<table class="dt lt-t lt-stuck">
                <thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col">State</th><th scope="col" class="num">Paid</th></tr></thead>
                <tbody>
                  <tr><td colspan="4"><span class="loading-row"><span class="spinner" role="status"></span>Searching 268 orders…</span></td></tr>
                </tbody>
              </table>`,
              { flush: true },
            )}`,
            { desc: "Searching for 'maria garcia restock'." },
          ),
        },
      ],
    },
    {
      id: "lt-grouped-rows",
      title: "Grouped rows",
      why: "Some questions are asked per group, not per row: what did today take, what does each delivery hold. A flat table answers them only after an export, while a <b>group header with its own subtotal</b> answers them on the page.",
      verdict:
        "The pick is (a), grouped by day with subtotals: it answers what today took without a chart and without leaving the list. The runner-up is (b), grouped by delivery with collapse toggles, once the team holds enough deliveries that one day's rows stop fitting. Never ship (f), two group levels: month-then-day nesting turns the list into a tree that paging cannot cross.",
      variants: [
        {
          name: "Grouped by day with subtotals",
          pick: true,
          rationale:
            "Bank statements and Stripe payouts group money by day with a subtotal per group. The reader sees the shape of the takings and still opens any row.",
          tradeoff:
            "Grouping removes the flat row order, so pagination and select-all both get harder to reason about across group edges.",
          reference: "Stripe",
          html: ordersPage(
            `${toolbar({ search: "", placeholder: "Order number, name or email", filters: ["Any state"] })}${section(
              "",
              `<table class="dt lt-t lt-stuck">
                <thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col">State</th><th scope="col" class="num">Paid</th></tr></thead>
                <tbody>
                  <tr class="lt-group"><td colspan="4">Today, 8 Oct 2026 <span class="muted">· 4 orders</span><span class="tot">EUR 270.00</span></td></tr>
                  <tr><td><span class="code">7K4Q2M</span></td><td>Maria Garcia</td><td><span class="muted">Paid</span></td><td class="num">${MONEY.order}</td></tr>
                  <tr><td><span class="code">STT855</span></td><td>Tom Becker</td><td><span class="muted">Paid</span></td><td class="num">EUR 50.00</td></tr>
                  <tr><td><span class="code">PP0K9B</span></td><td>Maria Garcia</td><td><span class="muted">Completed</span></td><td class="num">EUR 25.00</td></tr>
                  <tr><td><span class="code">V7VZNX</span></td><td>Elin Lindqvist</td><td><span class="muted">Paid</span></td><td class="num">${MONEY.lamp}</td></tr>
                  <tr class="lt-group"><td colspan="4">Yesterday, 7 Oct 2026 <span class="muted">· 2 orders</span><span class="tot">EUR 95.00</span></td></tr>
                  <tr><td><span class="code">3H3C68</span></td><td>Elin Lindqvist</td><td><span class="muted">Refunded</span></td><td class="num">EUR 50.00</td></tr>
                  <tr><td><span class="code">YB281K</span></td><td>Ade Okafor</td><td>${badgeRaw("Disputed", "destructive")}</td><td class="num">${MONEY.refund}</td></tr>
                </tbody>
              </table>`,
              { flush: true },
            )}${pager(1, 11)}`,
            { desc: "Newest first, grouped by day." },
          ),
        },
        {
          name: "Grouped by delivery with collapse toggles",
          rationale:
            "Linear's group-by puts a toggle on each group header, so a reader following one delivery collapses the rest. The header carries the count and the subtotal even while collapsed.",
          tradeoff:
            "Collapsed groups hide rows from find-in-page and from a reader who forgot they collapsed anything. The toggle state needs to survive a reload or it annoys.",
          reference: "Linear",
          html: ordersPage(
            `${toolbar({ search: "", placeholder: "Order number, name or email", right: '<button class="btn sm">Group: Delivery <span class="muted">▾</span></button>' })}${section(
              "",
              `<table class="dt lt-t lt-stuck">
                <thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col">State</th><th scope="col" class="num">Paid</th></tr></thead>
                <tbody>
                  <tr class="lt-group"><td colspan="4"><button class="lt-tog" aria-label="Collapse Garcia Interiors restock">▾</button>${DELIVERY.name} <span class="muted">· 3 orders</span><span class="tot">EUR 225.00</span></td></tr>
                  <tr class="lt-child"><td><span class="code">7K4Q2M</span></td><td>Maria Garcia</td><td><span class="muted">Paid</span></td><td class="num">${MONEY.order}</td></tr>
                  <tr class="lt-child"><td><span class="code">STT855</span></td><td>Tom Becker</td><td><span class="muted">Paid</span></td><td class="num">EUR 50.00</td></tr>
                  <tr class="lt-group"><td colspan="4"><button class="lt-tog" aria-label="Expand Becker spring refill">▸</button>Becker spring refill <span class="muted">· 2 orders</span><span class="tot">EUR 90.00</span></td></tr>
                  <tr class="lt-group"><td colspan="4"><button class="lt-tog" aria-label="Expand Lindqvist studio courier">▸</button>Lindqvist studio courier <span class="muted">· 1 order</span><span class="tot">EUR 45.00</span></td></tr>
                </tbody>
              </table>`,
              { flush: true },
            )}${pager(1, 11)}`,
            { desc: "Grouped by delivery. Becker spring refill and Lindqvist studio courier are collapsed." },
          ),
        },
        {
          name: "Grouped by state",
          rationale:
            "Linear groups issues by status so the blocked ones read as one block. Here the disputed and awaiting rows sit together at the top, which is the triage order support wants.",
          tradeoff:
            "States change under the reader: paying an order moves it to another group, which reads as the row vanishing. The list has to say where it went.",
          reference: "Linear",
          html: ordersPage(
            `${toolbar({ search: "", placeholder: "Order number, name or email", right: '<button class="btn sm">Group: State <span class="muted">▾</span></button>' })}${section(
              "",
              `<table class="dt lt-t lt-stuck">
                <thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col" class="lt-p2">Placed</th><th scope="col" class="num">Paid</th></tr></thead>
                <tbody>
                  <tr class="lt-group"><td colspan="4">${badgeRaw("Disputed", "destructive")} <span class="muted">· 1 order</span><span class="tot">EUR 45.00</span></td></tr>
                  <tr><td><span class="code">YB281K</span></td><td>Ade Okafor</td><td class="nowrap lt-p2">7 Oct 19:02</td><td class="num">${MONEY.refund}</td></tr>
                  <tr class="lt-group"><td colspan="4">${badgeRaw("Awaiting payment", "caution")} <span class="muted">· 1 order</span><span class="tot">EUR 45.00</span></td></tr>
                  <tr><td><span class="code">8M3DWR</span></td><td>Ade Okafor</td><td class="nowrap lt-p2">8 Oct 06:22</td><td class="num">${MONEY.lamp}</td></tr>
                  <tr class="lt-group"><td colspan="4"><span class="muted">Paid</span> <span class="muted">· 3 orders</span><span class="tot">EUR 220.00</span></td></tr>
                  <tr><td><span class="code">7K4Q2M</span></td><td>Maria Garcia</td><td class="nowrap lt-p2">8 Oct 09:32</td><td class="num">${MONEY.order}</td></tr>
                  <tr><td><span class="code">STT855</span></td><td>Tom Becker</td><td class="nowrap lt-p2">8 Oct 09:30</td><td class="num">EUR 50.00</td></tr>
                  <tr><td><span class="code">V7VZNX</span></td><td>Elin Lindqvist</td><td class="nowrap lt-p2">8 Oct 06:23</td><td class="num">${MONEY.lamp}</td></tr>
                </tbody>
              </table>`,
              { flush: true },
            )}${pager(1, 11)}`,
            { desc: "Grouped by state, disputed first." },
          ),
        },
        {
          name: "No grouping: a group column that sorts",
          rationale:
            "Carbon keeps the table flat and lets the reader sort by the would-be group field instead. Nothing hides, paging stays simple, and the eye groups adjacent equal values on its own.",
          tradeoff:
            "No subtotals: the reader who wants today's takings sorts by date and adds the rows up by hand. Sorting is not grouping, it only looks like it.",
          reference: "Carbon",
          html: ordersPage(
            `${toolbar({ search: "", placeholder: "Order number, name or email" })}${section(
              "",
              `<table class="dt lt-t lt-stuck">
                <thead><tr><th scope="col">Order</th><th scope="col"><button class="lt-sortbtn on">Delivery <span class="lt-arrow">↑</span></button></th><th scope="col">Customer</th><th scope="col">State</th><th scope="col" class="num">Paid</th></tr></thead>
                <tbody>
                  <tr><td><span class="code">PP0K9B</span></td><td>Counter sale, no delivery</td><td>Maria Garcia</td><td><span class="muted">Completed</span></td><td class="num">EUR 25.00</td></tr>
                  <tr><td><span class="code">V7VZNX</span></td><td>Becker spring refill</td><td>Elin Lindqvist</td><td><span class="muted">Paid</span></td><td class="num">${MONEY.lamp}</td></tr>
                  <tr><td><span class="code">8M3DWR</span></td><td>Becker spring refill</td><td>Ade Okafor</td><td>${badgeRaw("Awaiting payment", "caution")}</td><td class="num">${MONEY.lamp}</td></tr>
                  <tr><td><span class="code">YB281K</span></td><td>Lindqvist studio courier</td><td>Ade Okafor</td><td>${badgeRaw("Disputed", "destructive")}</td><td class="num">${MONEY.refund}</td></tr>
                  <tr><td><span class="code">7K4Q2M</span></td><td>${DELIVERY.name}</td><td>Maria Garcia</td><td><span class="muted">Paid</span></td><td class="num">${MONEY.order}</td></tr>
                </tbody>
              </table>`,
              { flush: true },
            )}${pager(1, 11)}`,
            { desc: "Sorted by delivery, newest first inside each delivery." },
          ),
        },
        {
          name: "Group headers that select the group",
          rationale:
            "Outlook and Gmail let a reader tick a whole conversation from its header. Here one checkbox refunds the day's orders together, which is the batch the team actually runs.",
          tradeoff:
            "Selecting a group selects rows the reader may not have seen, including a disputed one that should never be batch-refunded. The confirm has to name them all.",
          reference: "Outlook",
          html: shell(
            "Refunds",
            `<div class="page lt-page">
  ${phead("Refunds", "31 orders to decide, grouped by day.", "", { crumb: trail("Home", "Orders", "Refunds") })}
  ${toolbar({ search: "", placeholder: "Search refunds", filters: ["Any window"] })}
  ${section(
    "",
    `<table class="dt lt-t lt-stuck lt-has-check">
      <thead><tr><th class="check"><input type="checkbox" aria-label="Select all orders"></th><th scope="col">Order</th><th scope="col">Customer</th><th scope="col">State</th><th scope="col" class="num">Paid</th></tr></thead>
      <tbody>
        <tr class="lt-group"><td class="check"><input type="checkbox" checked aria-label="Select today, 8 Oct 2026"></td><td colspan="4">Today, 8 Oct 2026 <span class="muted">· 2 selected</span><span class="tot">EUR 175.00</span></td></tr>
        <tr class="is-sel"><td class="check"><input type="checkbox" checked aria-label="Select order 7K4Q2M"></td><td><span class="code">7K4Q2M</span></td><td>Maria Garcia</td><td><span class="muted">Paid</span></td><td class="num">${MONEY.order}</td></tr>
        <tr class="is-sel"><td class="check"><input type="checkbox" checked aria-label="Select order STT855"></td><td><span class="code">STT855</span></td><td>Tom Becker</td><td><span class="muted">Paid</span></td><td class="num">EUR 50.00</td></tr>
        <tr class="lt-group"><td class="check"><input type="checkbox" aria-label="Select yesterday, 7 Oct 2026"></td><td colspan="4">Yesterday, 7 Oct 2026 <span class="muted">· 2 orders</span><span class="tot">EUR 95.00</span></td></tr>
        <tr><td class="check"><input type="checkbox" aria-label="Select order 3H3C68"></td><td><span class="code">3H3C68</span></td><td>Elin Lindqvist</td><td><span class="muted">Refunded</span></td><td class="num">EUR 50.00</td></tr>
        <tr><td class="check"><input type="checkbox" aria-label="Select order YB281K"></td><td><span class="code">YB281K</span></td><td>Ade Okafor</td><td>${badgeRaw("Disputed", "destructive")}</td><td class="num">${MONEY.refund}</td></tr>
      </tbody>
    </table>`,
    { flush: true },
  )}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Two levels: month, then day",
          rationale:
            "Xero and bank statements nest day groups inside month groups for a year of rows. October holds its days, and the year reads as twelve subtotals before any row is shown.",
          tradeoff:
            "Two levels of headers for 268 rows is mostly chrome: the month header, the day header, then one row. Nesting pays off past thousands of rows, not hundreds.",
          reference: "Xero",
          html: ordersPage(
            `${toolbar({ search: "", placeholder: "Order number, name or email", filters: ["Any state"] })}${section(
              "",
              `<table class="dt lt-t lt-stuck">
                <thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col">State</th><th scope="col" class="num">Paid</th></tr></thead>
                <tbody>
                  <tr class="lt-group"><td colspan="4">October 2026 <span class="muted">· 231 orders</span><span class="tot">EUR 10,395.00</span></td></tr>
                  <tr class="lt-group"><td colspan="4"><span style="padding-left:18px">Today, 8 Oct 2026</span> <span class="muted">· 4 orders</span><span class="tot">EUR 270.00</span></td></tr>
                  <tr class="lt-child"><td><span class="code">7K4Q2M</span></td><td>Maria Garcia</td><td><span class="muted">Paid</span></td><td class="num">${MONEY.order}</td></tr>
                  <tr class="lt-child"><td><span class="code">STT855</span></td><td>Tom Becker</td><td><span class="muted">Paid</span></td><td class="num">EUR 50.00</td></tr>
                  <tr class="lt-group"><td colspan="4">September 2026 <span class="muted">· 37 orders</span><span class="tot">EUR 1,665.00</span></td></tr>
                </tbody>
              </table>`,
              { flush: true },
            )}${pager(1, 11)}`,
            { desc: "Grouped by month, then by day." },
          ),
        },
      ],
    },
    {
      id: "lt-row-expansion",
      title: "Inline row expansion",
      why: "Some rows hold a second level: an order holds its lines, its units, its history. Opening the record for each one costs a page load per row, while an <b>expansion row under the row itself</b> answers the question where it was asked.",
      verdict:
        "The pick is (a), expansion to the order lines: it answers what the customer bought, which is the question asked from the list. The runner-up is (c), units with pickup state, on the pickup list where handover is the work. Never ship (e), expand-all: twenty expanded rows is a page nobody can scan, and the control exists to punish curiosity.",
      variants: [
        {
          name: "Expand to the order lines",
          pick: true,
          rationale:
            "Stripe's invoice list expands a row to its lines: what was bought, at what price, adding to the row total. Support answers 'what did I pay for' without leaving the list.",
          tradeoff:
            "The detail row breaks the column rhythm, and sorting reorders parents while children follow, which confuses a reader who sorted by money.",
          reference: "Stripe",
          html: ordersPage(
            `${toolbar({ search: "", placeholder: "Order number, name or email" })}${section(
              "",
              `<table class="dt lt-t lt-stuck">
                <thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col">State</th><th scope="col" class="num">Paid</th></tr></thead>
                <tbody>
                  <tr><td><button class="lt-tog" aria-label="Collapse order 7K4Q2M">▾</button><span class="code">7K4Q2M</span></td><td>Maria Garcia</td><td><span class="muted">Paid</span></td><td class="num">${MONEY.order}</td></tr>
                  <tr class="lt-detail"><td colspan="4"><div class="lt-ilines"><span class="h">Line</span><span class="h num">Qty</span><span class="h num">Amount</span><span>Oak desk lamp</span><span class="num">2</span><span class="num">${MONEY.lineTotal}</span><span>Desk chair</span><span class="num">1</span><span class="num">EUR 35.00</span></div></td></tr>
                  <tr><td><button class="lt-tog" aria-label="Expand order STT855">▸</button><span class="code">STT855</span></td><td>Tom Becker</td><td><span class="muted">Paid</span></td><td class="num">EUR 50.00</td></tr>
                  <tr><td><button class="lt-tog" aria-label="Expand order PP0K9B">▸</button><span class="code">PP0K9B</span></td><td>Maria Garcia</td><td><span class="muted">Completed</span></td><td class="num">EUR 25.00</td></tr>
                </tbody>
              </table>`,
              { flush: true },
            )}${pager(1, 11)}`,
          ),
        },
        {
          name: "Expand to the order timeline",
          rationale:
            "Zendesk expands a record to its history: placed, paid, confirmation sent. The history sits under the row it belongs to, newest last, so the reader sees what happened in order.",
          tradeoff:
            "History grows without bound: a disputed order's expansion is a page of its own. It needs trimming to the last few entries with a link to the rest.",
          reference: "Zendesk",
          html: ordersPage(
            `${toolbar({ search: "", placeholder: "Order number, name or email" })}${section(
              "",
              `<table class="dt lt-t lt-stuck">
                <thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col">State</th><th scope="col" class="num">Paid</th></tr></thead>
                <tbody>
                  <tr><td><button class="lt-tog" aria-label="Collapse order 7K4Q2M">▾</button><span class="code">7K4Q2M</span></td><td>Maria Garcia</td><td><span class="muted">Paid</span></td><td class="num">${MONEY.order}</td></tr>
                  <tr class="lt-detail"><td colspan="4"><div class="tl"><div class="tlrow"><span class="rail"><span class="node positive"></span><span class="thread"></span></span><span class="tx"><b>Placed</b><small>8 Oct 2026, 09:32 · Online</small></span></div><div class="tlrow"><span class="rail"><span class="node positive"></span><span class="thread"></span></span><span class="tx"><b>Paid by bank transfer</b><small>8 Oct 2026, 09:33</small></span></div><div class="tlrow"><span class="rail"><span class="node"></span></span><span class="tx"><b>Confirmation sent</b><small>8 Oct 2026, 09:33 · maria@garcia-interiors.example</small></span></div></div></td></tr>
                  <tr><td><button class="lt-tog" aria-label="Expand order STT855">▸</button><span class="code">STT855</span></td><td>Tom Becker</td><td><span class="muted">Paid</span></td><td class="num">EUR 50.00</td></tr>
                </tbody>
              </table>`,
              { flush: true },
            )}${pager(1, 11)}`,
          ),
        },
        {
          name: "Expand to units and pickup state",
          rationale:
            "A pickup list expands an order to its units with what is collected and where. The warehouse lead works the list at the counter instead of opening forty records.",
          tradeoff:
            "Pickup state changes by the second at busy times, so an expanded row goes stale while it is open. It needs the same refresh the pickup screen has.",
          html: shell(
            "Pickup list",
            `<div class="page lt-page">
  ${phead("Pickup list", `${DELIVERY.name}, today. What is collected and what is not.`, "", { crumb: trail("Home", "Deliveries", DELIVERY.name, "Pickup list") })}
  ${toolbar({ search: "", placeholder: "Customer name or order number" })}
  ${section(
    "",
    `<table class="dt lt-t lt-stuck">
      <thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col">Collected</th></tr></thead>
      <tbody>
        <tr><td><button class="lt-tog" aria-label="Collapse order V7VZNX">▾</button><span class="code">V7VZNX</span></td><td>Elin Lindqvist</td><td>1 of 2</td></tr>
        <tr class="lt-detail"><td colspan="3"><div class="lt-ilines"><span class="h">Unit</span><span class="h">Counter</span><span class="h num">Collected</span><span>Oak desk lamp, A-1041</span><span>Counter 1</span><span class="num">09:41</span><span>Oak desk lamp, A-1042</span><span>–</span><span class="num"><span class="muted">Not yet</span></span></div></td></tr>
        <tr><td><button class="lt-tog" aria-label="Expand order 8M3DWR">▸</button><span class="code">8M3DWR</span></td><td>Ade Okafor</td><td>0 of 1</td></tr>
      </tbody>
    </table>`,
    { flush: true },
  )}
  ${pager(1, 34)}
</div>`,
            "Orders",
          ),
        },
        {
          name: "One row open at a time",
          rationale:
            "Carbon's accordion rule applied to the table: opening a row closes the last one. The list never grows past one detail, so the reader cannot lose their place in it.",
          tradeoff:
            "Comparing two orders means opening, memorizing, closing and opening. The rule trades comparison for tidiness.",
          reference: "Carbon",
          html: ordersPage(
            `${toolbar({ search: "", placeholder: "Order number, name or email" })}${section(
              "",
              `<table class="dt lt-t lt-stuck">
                <thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col">State</th><th scope="col" class="num">Paid</th></tr></thead>
                <tbody>
                  <tr><td><button class="lt-tog" aria-label="Expand order 7K4Q2M">▸</button><span class="code">7K4Q2M</span></td><td>Maria Garcia</td><td><span class="muted">Paid</span></td><td class="num">${MONEY.order}</td></tr>
                  <tr><td><button class="lt-tog" aria-label="Collapse order STT855">▾</button><span class="code">STT855</span></td><td>Tom Becker</td><td><span class="muted">Paid</span></td><td class="num">EUR 50.00</td></tr>
                  <tr class="lt-detail"><td colspan="4"><div class="lt-ilines"><span class="h">Line</span><span class="h num">Qty</span><span class="h num">Amount</span><span>Oak desk lamp</span><span class="num">1</span><span class="num">${MONEY.lamp}</span><span>Shipping</span><span class="num">1</span><span class="num">${MONEY.shipping}</span></div></td></tr>
                  <tr><td><button class="lt-tog" aria-label="Expand order PP0K9B">▸</button><span class="code">PP0K9B</span></td><td>Maria Garcia</td><td><span class="muted">Completed</span></td><td class="num">EUR 25.00</td></tr>
                </tbody>
              </table>`,
              { flush: true, desc: "Opening a row closes the one that is open." },
            )}${pager(1, 11)}`,
          ),
        },
        {
          name: "An expand-all control above the table",
          rationale:
            "GOV.UK's accordion pairs every toggle with a Show all control, so a reader checking every order's lines presses once instead of twenty-five times.",
          tradeoff:
            "Twenty expanded rows is a page nobody can scan, and each detail needs its own data, so Show all fires twenty-five reads at once.",
          reference: "GOV.UK",
          html: ordersPage(
            `${toolbar({ search: "", placeholder: "Order number, name or email", right: '<button class="btn sm ghost">Collapse all</button>' })}${section(
              "",
              `<table class="dt lt-t lt-stuck">
                <thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col" class="num">Paid</th></tr></thead>
                <tbody>
                  <tr><td><button class="lt-tog" aria-label="Collapse order 7K4Q2M">▾</button><span class="code">7K4Q2M</span></td><td>Maria Garcia</td><td class="num">${MONEY.order}</td></tr>
                  <tr class="lt-detail"><td colspan="3"><div class="lt-ilines"><span>2 Oak desk lamps</span><span class="num">2</span><span class="num">${MONEY.lineTotal}</span><span>Desk chair</span><span class="num">1</span><span class="num">EUR 35.00</span></div></td></tr>
                  <tr><td><button class="lt-tog" aria-label="Collapse order STT855">▾</button><span class="code">STT855</span></td><td>Tom Becker</td><td class="num">EUR 50.00</td></tr>
                  <tr class="lt-detail"><td colspan="3"><div class="lt-ilines"><span>Oak desk lamp</span><span class="num">1</span><span class="num">${MONEY.lamp}</span><span>Shipping</span><span class="num">1</span><span class="num">${MONEY.shipping}</span></div></td></tr>
                </tbody>
              </table>`,
              { flush: true },
            )}${pager(1, 11)}`,
          ),
        },
        {
          name: "No expansion: the row opens the record",
          rationale:
            "The order number is a link and everything lives on the record page. One pattern for detail everywhere, and the list stays a list.",
          tradeoff:
            "Every question costs a page load and a back button. Checking three orders means six page loads where expansion needs none.",
          html: ordersPage(
            `${toolbar({ search: "", placeholder: "Order number, name or email" })}${section(
              "",
              `<table class="dt lt-t lt-stuck">
                <thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col">State</th><th scope="col" class="num">Paid</th><th scope="col"></th></tr></thead>
                <tbody>
                  <tr><td><a href="#" class="code">7K4Q2M</a></td><td>Maria Garcia</td><td><span class="muted">Paid</span></td><td class="num">${MONEY.order}</td><td class="num"><button class="btn sm">Open</button></td></tr>
                  <tr><td><a href="#" class="code">STT855</a></td><td>Tom Becker</td><td><span class="muted">Paid</span></td><td class="num">EUR 50.00</td><td class="num"><button class="btn sm">Open</button></td></tr>
                  <tr><td><a href="#" class="code">PP0K9B</a></td><td>Maria Garcia</td><td><span class="muted">Completed</span></td><td class="num">EUR 25.00</td><td class="num"><button class="btn sm">Open</button></td></tr>
                </tbody>
              </table>`,
              { flush: true, desc: "The order number opens the record. Nothing expands in place." },
            )}${pager(1, 11)}`,
          ),
        },
      ],
    },
    {
      id: "lt-pinned-columns",
      title: "Pinned and resizing columns",
      why: "A wide table scrolls, and a scrolling table loses its bearings: the order code leaves just when the money arrives. <b>Pinning the identity column</b> keeps the row named, and resizing lets the reader spend width where their own data needs it.",
      verdict:
        "The pick is (a), the order column pinned while the rest scroll: the row stays named at any scroll position, and it costs no control. The runner-up is (b), the actions pinned too, once rows carry inline commands that must stay reachable. Never ship (c), draggable widths, in a first release: per-user widths are stored state that support cannot see and screenshots cannot hold.",
      variants: [
        {
          name: "The order column pinned while the rest scroll",
          pick: true,
          rationale:
            "Shopify's orders index pins the order column and lets the other seven scroll under it. Nothing is folded, so every fact keeps its own scannable column.",
          tradeoff:
            "On a phone the reader sees the order code and one other column at a time. Pinning keeps the bearings, not the overview.",
          reference: "Shopify",
          html: ordersPage(
            `${toolbar({ search: "", placeholder: "Order number, name or email" })}${section(
              "",
              table(
                [
                  { label: "Order", render: (r) => `<span class="code">${r[0]}</span>` },
                  { label: "Delivery", render: (r) => r[1] },
                  { label: "Placed", key: "when", p2: false },
                  { label: "Customer", render: (r) => r[2].customer },
                  { label: "Channel", render: (r) => CHANNEL[r[0]] },
                  { label: "State", render: (r) => stateCell(r) },
                  { label: "Method", render: (r) => METHOD[r[0]] },
                  { label: "Paid", cls: "num", render: (r) => r[6] },
                ],
                { rows: 6 },
              ),
              { flush: true, desc: "The order column stays while the rest scroll under it." },
            )}${pager(1, 11)}`,
          ),
        },
        {
          name: "First and last pinned, actions always visible",
          rationale:
            "Airtable pins the record name on the left and the row commands on the right, so both survive any scroll position. Acting never requires scrolling back.",
          tradeoff:
            "Two pinned columns on a phone leave no room for the middle at all. The pattern needs a wide screen to earn its keep.",
          reference: "Airtable",
          html: ordersPage(
            `${toolbar({ search: "", placeholder: "Order number, name or email" })}${section(
              "",
              `<table class="dt lt-t lt-stuck lt-pin-end">
                <thead><tr><th scope="col">Order</th><th scope="col">Delivery</th><th scope="col">Customer</th><th scope="col">Channel</th><th scope="col">State</th><th scope="col" class="num">Paid</th><th scope="col" style="width:1%"></th></tr></thead>
                <tbody>
                  ${ORDERS.slice(0, 5)
                    .map((r) => `<tr><td><span class="code">${r[0]}</span></td><td>${r[1]}</td><td>${r[2].customer}</td><td>${CHANNEL[r[0]]}</td><td>${stateCell(r)}</td><td class="num">${r[6]}</td><td style="white-space:nowrap"><button class="btn sm">Resend</button></td></tr>`)
                    .join("")}
                </tbody>
              </table>`,
              { flush: true, desc: "Order stays left, Resend stays right." },
            )}${pager(1, 11)}`,
          ),
        },
        {
          name: "Draggable widths with resize handles",
          rationale:
            "Airtable and Retool put a handle on every header edge: drag it and the column follows. A reader with long delivery names spends width there instead of on the order code.",
          tradeoff:
            "Widths are per-user stored state that support cannot see, screenshots cannot hold, and a new column resets. A wide table of eight resizable columns is also eight ways to break the layout.",
          reference: "Airtable",
          html: ordersPage(
            `${toolbar({ search: "", placeholder: "Order number, name or email" })}${section(
              "",
              `<table class="dt lt-t lt-stuck">
                <thead><tr><th scope="col" class="lt-rs">Order</th><th scope="col" class="lt-rs drag">Customer</th><th scope="col" class="lt-rs lt-p2">Placed</th><th scope="col" class="lt-rs">State</th><th scope="col" class="num lt-rs">Paid</th></tr></thead>
                <tbody>
                  ${ORDERS.slice(0, 5)
                    .map(([no, delivery, who, when, state, tone, paid]) => `<tr><td><span class="lines"><span class="code">${no}</span><small>${delivery}</small></span></td><td><span class="lines"><b>${who.customer}</b><small>${who.email}</small></span></td><td class="nowrap lt-p2">${when}</td><td>${badgeRaw(state, tone, "outline")}</td><td class="num">${paid}</td></tr>`)
                    .join("")}
                </tbody>
              </table>`,
              { flush: true, desc: "Drag a header edge to resize. Double-click it to fit the content." },
            )}${pager(1, 11)}`,
          ),
        },
        {
          name: "Pin any column from its header menu",
          rationale:
            "Notion lets any column pin left from its header menu, drawn open here on Customer. The reader decides what their bearings are instead of the back office deciding for them.",
          tradeoff:
            "Pinning plus hiding plus sorting in one menu is three features wearing one trigger. Most readers find none of them.",
          reference: "Notion",
          html: ordersPage(
            `<div class="lt-anchor">${toolbar({ search: "", placeholder: "Order number, name or email" })}
            ${popAt("left:clamp(8px,24%,260px);top:38px;width:190px", '<div class="cap">Customer</div><div class="item">Sort ascending</div><div class="item">Sort descending</div><div class="sep"></div><div class="item">Pin to the left</div><div class="item">Hide column</div>')}</div>${section(
              "",
              `<table class="dt lt-t lt-stuck">
                <thead><tr><th scope="col">Order</th><th scope="col"><button class="lt-sortbtn on" aria-expanded="true">Customer</button></th><th scope="col" class="lt-p2">Placed</th><th scope="col">State</th><th scope="col" class="num">Paid</th></tr></thead>
                <tbody>
                  ${ORDERS.slice(0, 5)
                    .map(([no, delivery, who, when, state, tone, paid]) => `<tr><td><span class="lines"><span class="code">${no}</span><small>${delivery}</small></span></td><td><span class="lines"><b>${who.customer}</b><small>${who.email}</small></span></td><td class="nowrap lt-p2">${when}</td><td>${badgeRaw(state, tone, "outline")}</td><td class="num">${paid}</td></tr>`)
                    .join("")}
                </tbody>
              </table>`,
              { flush: true },
            )}${pager(1, 11)}`,
          ),
        },
        {
          name: "No pinning: the table scrolls as one",
          rationale:
            "Carbon's default: the table scrolls as one piece and every column leaves together. No sticky edges, no shadows, no special cases in the CSS.",
          tradeoff:
            "Halfway across, the money column arrives and the order code is gone. The reader scrolls back to check which row the amount belongs to.",
          reference: "Carbon",
          html: ordersPage(
            `${toolbar({ search: "", placeholder: "Order number, name or email" })}${section(
              "",
              table(
                [
                  { label: "Order", render: (r) => `<span class="code">${r[0]}</span>` },
                  { label: "Delivery", render: (r) => r[1] },
                  { label: "Customer", render: (r) => r[2].customer },
                  { label: "Channel", render: (r) => CHANNEL[r[0]] },
                  { label: "State", render: (r) => stateCell(r) },
                  { label: "Method", render: (r) => METHOD[r[0]] },
                  { label: "Paid", cls: "num", render: (r) => r[6] },
                ],
                { rows: 6, sticky: false },
              ),
              { flush: true, desc: "Every column scrolls together. Nothing stays." },
            )}${pager(1, 11)}`,
          ),
        },
        {
          name: "Double-click a header edge to fit content",
          rationale:
            "Google Sheets fits a column to its widest value on a double-click of the header edge. No dragging, no stored widths: the table answers the data it holds right now.",
          tradeoff:
            "Nobody discovers a double-click on a header edge without being told, and fitting to content reintroduces the page-2 shift that fixed widths prevent.",
          reference: "Google Sheets",
          html: ordersPage(
            `${toolbar({ search: "", placeholder: "Order number, name or email" })}${section(
              "",
              `<table class="dt lt-t lt-stuck">
                <thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col" class="lt-p2">Placed</th><th scope="col">State</th><th scope="col" class="num">Paid</th></tr></thead>
                <tbody>
                  <tr><td><span class="code">7K4Q2M</span></td><td><span class="lt-trunc">Maria Garcia · maria@garcia-interiors.example</span></td><td class="nowrap lt-p2">8 Oct 09:32</td><td><span class="muted">Paid</span></td><td class="num">${MONEY.order}</td></tr>
                  <tr><td><span class="code">STT855</span></td><td><span class="lt-trunc">Tom Becker · tom@becker-bouw.example</span></td><td class="nowrap lt-p2">8 Oct 09:30</td><td><span class="muted">Paid</span></td><td class="num">EUR 50.00</td></tr>
                  <tr><td><span class="code">V7VZNX</span></td><td><span class="lt-trunc">Elin Lindqvist · elin@lindqvist.example</span></td><td class="nowrap lt-p2">8 Oct 06:23</td><td><span class="muted">Paid</span></td><td class="num">${MONEY.lamp}</td></tr>
                </tbody>
              </table>`,
              { flush: true, desc: "The customer column is fitted to 150 pixels. Double-click its header edge to fit the longest value instead." },
            )}${pager(1, 11)}`,
          ),
        },
      ],
    },
    {
      id: "lt-delivery-grid",
      title: "Deliveries as a grid",
      why: "Deliveries are few and dated: the company runs a handful a week and asks how each one is doing. A table answers with rows of numbers, while a <b>card answers with the run itself</b>: its date, its warehouse, and how full it is.",
      verdict:
        "The pick is (a), delivery cards with a load bar: four deliveries read better as four cards than as four rows, and the bar answers the only question the list exists for. The runner-up is (c), a date-led list, once the year holds dozens of runs and cards stop fitting. Never ship (d), the month calendar: it answers when, which the deliveries list is never asked.",
      variants: [
        {
          name: "Delivery cards with a load bar",
          pick: true,
          rationale:
            "Each delivery is a card with its date, its warehouse and how full it is. Four deliveries a week read as four runs, not as four rows of a table.",
          tradeoff:
            "Cards stop scanning past a dozen deliveries: no column to sort, no state to scan down. The pattern fits a handful, not a hundred.",
          html: shell(
            "Deliveries",
            `<div class="page lt-page">
  ${phead("Deliveries", "Four deliveries, three with a date still ahead.", '<button class="btn primary sm">New delivery</button>', { crumb: trail("Home", "Deliveries") })}
  ${toolbar({ search: "", placeholder: "Search deliveries", views: [{ label: "Scheduled 3", on: true }, { label: "Past 1" }, { label: "All 4" }] })}
  <div class="lt-cards-grid">
    ${[
      ["Becker spring refill", "Fri 9 Oct 2026 · Rotterdam depot", "Scheduled", "info", 80, "32 of 40 pallets"],
      ["Lindqvist studio courier", "Sat 17 Oct 2026 · Utrecht depot", "Scheduled", "info", 53, "32 of 60 pallets"],
      ["Okafor office setup", "Sat 12 Dec 2026 · Amsterdam warehouse", "Draft", "neutral", 0, "Not scheduled yet"],
      [DELIVERY.name, "Sat 14 Mar 2026 · Amsterdam warehouse", "Delivered", "positive", 94, "376 of 400 pallets"],
    ]
      .map(
        ([nm, meta, st, tone, pct, loaded]) =>
          `<div class="lt-ecard"><div class="cover">Route map</div><div class="bd"><span class="nm">${nm}</span><span class="meta">${meta}</span>${badgeRaw(st, tone, "outline")}<span class="lt-sold"><span class="meta">${loaded}</span>${progress(pct, true)}</span><span><button class="btn sm">Open</button></span></div></div>`,
      )
      .join("")}
  </div>
</div>`,
            "Orders",
          ),
        },
        {
          name: "A table with a load progress column",
          rationale:
            "Shopify's product list keeps the table and adds an inventory bar per row. The deliveries stay sortable and comparable, and the bar still answers how full each one is.",
          tradeoff:
            "A bar in a table row is a chart without an axis: 80 percent of 40 pallets and 53 percent of 60 pallets read as two bars of different lengths for different totals.",
          reference: "Shopify",
          html: shell(
            "Deliveries",
            `<div class="page lt-page">
  ${phead("Deliveries", "Four deliveries, three with a date still ahead.", '<button class="btn primary sm">New delivery</button>', { crumb: trail("Home", "Deliveries") })}
  ${toolbar({ search: "", placeholder: "Search deliveries", views: [{ label: "Scheduled 3", on: true }, { label: "Past 1" }, { label: "All 4" }] })}
  ${section(
    "",
    `<table class="dt lt-t lt-stuck">
      <thead><tr><th scope="col">Delivery</th><th scope="col">Date</th><th scope="col">State</th><th scope="col">Loaded</th><th scope="col"></th></tr></thead>
      <tbody>
        ${[
          ["Becker spring refill", "9 Oct 2026", "Scheduled", "info", 80, "32 of 40 pallets"],
          ["Lindqvist studio courier", "17 Oct 2026", "Scheduled", "info", 53, "32 of 60 pallets"],
          ["Okafor office setup", "12 Dec 2026", "Draft", "neutral", 0, "0 of 120 pallets"],
          [DELIVERY.name, "14 Mar 2026", "Delivered", "positive", 94, "376 of 400 pallets"],
        ]
          .map(
            ([nm, when, st, tone, pct, loaded]) =>
              `<tr><td><b>${nm}</b></td><td class="nowrap">${when}</td><td>${badgeRaw(st, tone, "outline")}</td><td><span class="lt-sold"><span class="tnum">${loaded}</span>${progress(pct, true)}</span></td><td class="num"><button class="btn sm">Open</button></td></tr>`,
          )
          .join("")}
      </tbody>
    </table>`,
    { flush: true },
  )}
</div>`,
            "Orders",
          ),
        },
        {
          name: "A date-led list with month dividers",
          rationale:
            "Google Calendar's schedule view leads with the date and groups by month. A planner reads October, then December, then March, each run under its own day.",
          tradeoff:
            "Dates lead and states follow, so finding the one draft means reading every month. The view answers when, not what needs work.",
          reference: "Google Calendar",
          html: shell(
            "Deliveries",
            `<div class="page lt-page">
  ${phead("Deliveries", "Four deliveries, three with a date still ahead.", '<button class="btn primary sm">New delivery</button>', { crumb: trail("Home", "Deliveries") })}
  ${toolbar({ search: "", placeholder: "Search deliveries" })}
  <div class="lt-mhead">October 2026</div>
  ${section(
    "",
    `<div class="lt-erow"><span class="lt-datebox"><small>Oct</small><b>9</b></span><span class="txt"><b>Becker spring refill</b><small>Rotterdam depot · 08:00</small></span>${badgeRaw("Scheduled", "info", "outline")}<span class="lt-sold"><span class="meta">32 of 40 pallets</span>${progress(80, true)}</span></div>
    <div class="lt-erow"><span class="lt-datebox"><small>Oct</small><b>17</b></span><span class="txt"><b>Lindqvist studio courier</b><small>Utrecht depot · 09:00</small></span>${badgeRaw("Scheduled", "info", "outline")}<span class="lt-sold"><span class="meta">32 of 60 pallets</span>${progress(53, true)}</span></div>`,
  )}
  <div class="lt-mhead">December 2026</div>
  ${section(
    "",
    `<div class="lt-erow"><span class="lt-datebox"><small>Dec</small><b>12</b></span><span class="txt"><b>Okafor office setup</b><small>Amsterdam warehouse · 08:00</small></span>${badgeRaw("Draft", "neutral", "outline")}<span class="lt-sold"><span class="meta">Not scheduled yet</span>${progress(0, true)}</span></div>`,
  )}
</div>`,
            "Orders",
          ),
        },
        {
          name: "A month calendar with delivery chips",
          rationale:
            "Google Calendar draws the month as a grid and each delivery as a chip on its day. Clashes show as two chips on one square, which no list makes visible.",
          tradeoff:
            "Four deliveries on thirty squares is mostly empty grid, and nothing on a chip says how full the run is. The calendar answers scheduling, not loading.",
          reference: "Google Calendar",
          html: shell(
            "Deliveries",
            `<div class="page lt-page">
  ${phead("Deliveries", "October 2026. Two runs scheduled.", '<button class="btn primary sm">New delivery</button>', { crumb: trail("Home", "Deliveries") })}
  ${toolbar({ search: null, filters: [], right: '<span class="btnrow"><button class="btn sm icon" aria-label="Previous month">‹</button><span style="font-size:12.5px;font-weight:600">October 2026</span><button class="btn sm icon" aria-label="Next month">›</button></span>' })}
  ${section(
    "",
    `<div class="lt-cal">
      ${["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => `<div class="dow">${d}</div>`).join("")}
      ${[28, 29, 30].map((d) => `<div class="out">${d}</div>`).join("")}
      ${[1, 2, 3, 4, 5, 6, 7, 8].map((d) => `<div class="${d === 8 ? "today" : ""}">${d}</div>`).join("")}
      <div>9<span class="ev pos">Becker spring refill</span></div>
      ${[10, 11, 12, 13, 14, 15, 16].map((d) => `<div>${d}</div>`).join("")}
      <div>17<span class="ev pos">Lindqvist studio courier</span></div>
      ${[18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31].map((d) => `<div>${d}</div>`).join("")}
      <div class="out">1</div>
    </div>`,
  )}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Compact rows with a status word",
          rationale:
            "Linear's project list is one quiet row per project: name, owner, status, date. A team holding forty runs scans states down one column instead of opening forty cards.",
          tradeoff:
            "Quiet rows hide the load: nothing says how full a run is until it is opened. The list answers state, not loading.",
          reference: "Linear",
          html: shell(
            "Deliveries",
            `<div class="page lt-page">
  ${phead("Deliveries", "Four deliveries, three with a date still ahead.", '<button class="btn primary sm">New delivery</button>', { crumb: trail("Home", "Deliveries") })}
  ${toolbar({ search: "", placeholder: "Search deliveries", views: [{ label: "Scheduled 3", on: true }, { label: "Past 1" }, { label: "All 4" }] })}
  ${section(
    "",
    `<table class="dt lt-t lt-stuck dense lt-h32">
      <thead><tr><th scope="col">Delivery</th><th scope="col">Owner</th><th scope="col">State</th><th scope="col">Date</th></tr></thead>
      <tbody>
        <tr><td><b>Becker spring refill</b></td><td>Alex Morgan</td><td><span class="muted">Scheduled</span></td><td class="nowrap">9 Oct 2026</td></tr>
        <tr><td><b>Lindqvist studio courier</b></td><td>Alex Morgan</td><td><span class="muted">Scheduled</span></td><td class="nowrap">17 Oct 2026</td></tr>
        <tr><td><b>Okafor office setup</b></td><td>Chris Novak</td><td><span class="muted">Draft</span></td><td class="nowrap">12 Dec 2026</td></tr>
        <tr><td><b>${DELIVERY.name}</b></td><td>Alex Morgan</td><td><span class="muted">Delivered</span></td><td class="nowrap">14 Mar 2026</td></tr>
      </tbody>
    </table>`,
    { flush: true },
  )}
</div>`,
            "Orders",
          ),
        },
        {
          name: "A table/grid toggle the reader sets",
          rationale:
            "Notion lets the reader switch a view between table and board without leaving the page. Finance keeps the table, the warehouse lead keeps the cards, and both read the same deliveries.",
          tradeoff:
            "Two views of one list is two layouts to build, two to test, and a toggle whose state must survive reloads and shared links.",
          reference: "Notion",
          html: shell(
            "Deliveries",
            `<div class="page lt-page">
  ${phead("Deliveries", "Four deliveries, three with a date still ahead.", '<button class="btn primary sm">New delivery</button>', { crumb: trail("Home", "Deliveries") })}
  ${toolbar({ search: "", placeholder: "Search deliveries", views: [{ label: "Scheduled 3", on: true }, { label: "Past 1" }, { label: "All 4" }], right: segmented(["Table", "Grid"], 1) })}
  <div class="lt-cards-grid">
    ${[
      ["Becker spring refill", "Fri 9 Oct 2026 · Rotterdam depot", "Scheduled", "info", 80, "32 of 40 pallets"],
      ["Lindqvist studio courier", "Sat 17 Oct 2026 · Utrecht depot", "Scheduled", "info", 53, "32 of 60 pallets"],
    ]
      .map(
        ([nm, meta, st, tone, pct, loaded]) =>
          `<div class="lt-ecard"><div class="cover">Route map</div><div class="bd"><span class="nm">${nm}</span><span class="meta">${meta}</span>${badgeRaw(st, tone, "outline")}<span class="lt-sold"><span class="meta">${loaded}</span>${progress(pct, true)}</span><span><button class="btn sm">Open</button></span></div></div>`,
      )
      .join("")}
  </div>
</div>`,
            "Orders",
          ),
        },
      ],
    },
    {
      id: "lt-phone-list",
      title: "The list on a phone",
      why: "At 390 pixels the five-column table cannot survive: the columns either crush or scroll. Every option here answers the same question, what the orders list becomes on a phone, and each one keeps a <b>different capability</b>: reading, sorting, acting, or comparing.",
      verdict:
        "The pick is (a), two-line rows with money right: it reads well at 390 pixels, keeps the order code, the customer and the amount, and pairs with a Sort control where sorting matters. The runner-up is (c), a scroll container with a sticky first column, for the rare phone task that needs every column. Never ship (f), search hiding the list: a list that starts empty teaches the reader there is nothing to see.",
      compact: {
        option: "Two-line rows with money right",
        behaviour: "Below 640 pixels the table becomes two-line rows with the amount right; sorting moves to a Sort control.",
      },
      variants: [
        {
          name: "Two-line rows with money right",
          pick: true,
          width: "phone",
          rationale:
            "Stripe's mobile list and Polaris condensed rows read as order over customer on the left, money over state on the right. Everything fits 390 pixels with nothing scrolling sideways.",
          tradeoff:
            "No headers, so no sorting and no comparison down a column. Sorting moves to a control, and comparing moves to the desktop.",
          reference: "Stripe",
          html: ordersPage(
            `${toolbar({ search: "", placeholder: "Order number, name or email", filters: ["Any state"] })}<div class="lt-swap">${section(
              "",
              table(
                [
                  { label: "Order", key: "order" },
                  { label: "Customer", key: "customer" },
                  { label: "Placed", key: "when" },
                  { label: "State", key: "state" },
                  { label: "Paid", key: "paid", cls: "num" },
                ],
                { rows: 6 },
              ) + phoneRows(ORDERS.slice(0, 6)),
              { flush: true },
            )}</div>${pager(1, 11)}`,
            { desc: "Below 640 pixels the table becomes rows. Widen the screen to see it change back." },
          ),
        },
        {
          name: "Stacked records with labelled cells",
          width: "phone",
          rationale:
            "GOV.UK's responsive tables stack each row into labelled values on a narrow screen. Nothing is dropped and nothing needs discovering: every fact keeps its name.",
          tradeoff:
            "One order fills the screen, so six orders is six screens of scrolling. Thorough, and too long to scan.",
          reference: "GOV.UK",
          html: ordersPage(
            `${toolbar({ search: "", placeholder: "Order number, name or email" })}${section(
              "",
              `<div class="lt-stack-row"><dl><dt>Order</dt><dd><span class="code">7K4Q2M</span></dd><dt>Delivery</dt><dd>${DELIVERY.name}</dd><dt>Customer</dt><dd>Maria Garcia</dd><dt>Placed</dt><dd>8 Oct 2026, 09:32</dd><dt>State</dt><dd><span class="muted">Paid</span></dd><dt>Paid</dt><dd>${MONEY.order}</dd></dl></div>
              <div class="lt-stack-row"><dl><dt>Order</dt><dd><span class="code">STT855</span></dd><dt>Delivery</dt><dd>${DELIVERY.name}</dd><dt>Customer</dt><dd>Tom Becker</dd><dt>Placed</dt><dd>8 Oct 2026, 09:30</dd><dt>State</dt><dd><span class="muted">Paid</span></dd><dt>Paid</dt><dd>EUR 50.00</dd></dl></div>`,
            )}${pager(1, 134)}`,
            { desc: "Every cell keeps its label. 268 orders, two shown." },
          ),
        },
        {
          name: "A scroll container with a sticky first column",
          width: "phone",
          rationale:
            "Shopify's mobile tables keep every column and scroll sideways under a pinned first column. Nothing is redesigned for the phone: the table is the table, with its bearings kept.",
          tradeoff:
            "Sideways scrolling hides four of five columns at any moment, and comparing two columns means scrolling between them. The phone shows a window, not the list.",
          reference: "Shopify",
          html: ordersPage(
            `${toolbar({ search: "", placeholder: "Order number, name or email" })}${section(
              "",
              table(
                [
                  { label: "Order", key: "order" },
                  { label: "Customer", key: "customer" },
                  { label: "Placed", key: "when", p2: false },
                  { label: "State", key: "state" },
                  { label: "Paid", key: "paid", cls: "num" },
                ],
                { rows: 6 },
              ),
              { flush: true, desc: "Scroll sideways. The order column stays." },
            )}${pager(1, 11)}`,
          ),
        },
        {
          name: "Priority columns only",
          width: "phone",
          rationale:
            "Financial tables keep customer, state and money on a narrow screen and drop the rest. Three columns fit 390 pixels without scrolling, and opening the row recovers the dropped facts.",
          tradeoff:
            "The order code, the placed time and the delivery all leave. Support identifying a caller by code finds the one column they need is gone.",
          html: ordersPage(
            `${toolbar({ search: "", placeholder: "Order number, name or email" })}${section(
              "",
              `<table class="dt lt-t lt-stuck">
                <thead><tr><th scope="col">Customer</th><th scope="col">State</th><th scope="col" class="num">Paid</th></tr></thead>
                <tbody>
                  ${ORDERS.slice(0, 6)
                    .map((r) => `<tr><td><span class="lines"><b>${r[2].customer}</b><small>${r[1]}</small></span></td><td>${stateCell(r)}</td><td class="num">${r[6]}</td></tr>`)
                    .join("")}
                </tbody>
              </table>`,
              { flush: true, desc: "Order, placed and email return on the record." },
            )}${pager(1, 11)}`,
          ),
        },
        {
          name: "A card per order with its actions",
          width: "phone",
          rationale:
            "Mobile order apps draw each order as a card with its own Resend button. The phone is for acting on one order, not for comparing twenty, so each card carries its command.",
          tradeoff:
            "Cards are tall: three orders fill the screen where rows fit six. A queue worked top to bottom becomes twice the scrolling.",
          html: ordersPage(
            `${toolbar({ search: "", placeholder: "Order number, name or email" })}<div class="lt-cards-grid">
              ${ORDERS.slice(0, 4)
                .map(
                  (r) =>
                    `<div class="lt-ecard"><div class="bd"><span class="nm"><span class="code">${r[0]}</span> · ${r[6]}</span><span class="meta">${r[2].customer} · ${r[1]}</span><span>${r[5] === "destructive" || r[5] === "caution" ? badgeRaw(r[4], r[5], "outline") : `<span class="muted">${r[4]}</span>`}</span><span class="btnrow"><button class="btn sm">Open</button><button class="btn sm">Resend</button></span></div></div>`,
                )
                .join("")}
            </div>${pager(1, 67)}`,
            { desc: "268 orders, one card each." },
          ),
        },
        {
          name: "Search and chips above one-line rows",
          width: "phone",
          rationale:
            "Gmail's mobile list leads with search and a chip row, then one line per message. Finding beats browsing on a phone, so the list spends its width on the query, not the columns.",
          tradeoff:
            "One line per order holds the customer or the code, never both with the money. The row identifies just enough to be opened, nothing more.",
          reference: "Gmail",
          html: ordersPage(
            `${toolbar({ search: "", placeholder: "Search orders" })}<div class="chips" style="margin:-2px 0 10px"><button class="chip">Needs attention</button><button class="chip">Paid</button><button class="chip">This week</button></div>${section(
              "",
              `<div class="lt-cards" style="display:block">${ORDERS.slice(0, 6)
                .map((r) => `<a href="#" class="lt-crow"><span class="t">${r[2].customer}</span><span class="r">${r[6]}</span><span class="s"><span class="code" style="text-decoration:none">${r[0]}</span> · ${r[1]}</span><span class="r" style="font-size:11.5px">${stateCell(r)}</span></a>`)
                .join("")}</div>`,
            )}${pager(1, 11)}`,
          ),
        },
      ],
    },
  ],
};
