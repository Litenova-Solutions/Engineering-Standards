/**
 * Feedback and states: the pages in the states they are not in.
 *
 * Carbon makes three empty states distinct rather than one, and holds that an
 * empty state replaces the element it stands for, headers included. The rules
 * behind these options add where all of this can go: a static notice is a
 * status, only a command result is an alert, and a tone never paints a
 * full-width band on a page about other work.
 */

import {
  sidebar,
  COMPANY,
  DELIVERY,
  INVOICE,
  MONEY,
  ORDER,
  PEOPLE,
  PRODUCT,
  REFUSALS,
  badgeRaw,
  callout,
  dialog,
  emptyState,
  facts,
  field,
  formActions,
  input,
  notice,
  pager,
  phead,
  progress,
  recordRow,
  section,
  shell,
  skeleton,
  statement,
  timelineEntry,
  toast,
  toolbar,
  trail,
} from "../parts.mjs";

/**
 * Category CSS. Every class carries the `fs-` prefix so it never meets another
 * category's rules. `.fs-page` stacks a page body on one 14 px rhythm, which the
 * shared `.page` does not do: without it two sections touch.
 */
const FS_CSS = /* css */ `
.fs-page { display: flex; flex-direction: column; gap: 14px; }
.fs-page > :not(.trail) { margin-bottom: 0 !important; }
.fs-page > .trail { margin-bottom: -7px !important; }
.fs-page > .pager { padding: 0 2px; }
.fs-page .dt.dense td, .fs-page .dt.dense th { padding-top: 6px; padding-bottom: 6px; }
.fs-page .section > .body > .rlist { margin: 0 -14px -12px; }
.fs-page .section > .body > .rlist:first-child { margin-top: -12px; }

.fs-bar-extra { margin-left: auto; display: flex; gap: 10px; align-items: center; font-weight: 400; }
.fs-bar-extra + .icons { margin-left: 0 !important; }
.fs-dim { color: var(--muted-foreground); font-size: 11.5px; font-weight: 400; }

/* A banner: one centred sentence across the top of the back office. */
.fs-banner {
  display: flex; align-items: center; justify-content: center; flex-wrap: wrap; gap: 4px 10px;
  padding: 6px 16px; font-size: 12px; font-weight: 500; text-align: center;
}
.fs-banner.info { background: var(--info-surface); color: var(--info-surface-foreground); }
.fs-banner.caution { background: var(--caution-surface); color: var(--caution-surface-foreground); }
.fs-banner.destructive { background: var(--destructive-surface); color: var(--destructive-surface-foreground); }
.fs-banner a, .fs-link { color: inherit; text-decoration: underline; text-underline-offset: 2px; cursor: pointer; }
.fs-banner .btn { height: 22px; padding: 0 8px; font-size: 11px; }

/* An outcome page: one answer, centred, with its next step. */
.fs-outcome { max-width: 460px; margin: 48px auto; display: flex; flex-direction: column; align-items: center; text-align: center; gap: 10px; padding: 0 8px; }
.fs-outcome h1 { font-size: 20px; line-height: 1.3; }
.fs-outcome p { color: var(--muted-foreground); font-size: 13px; max-width: 52ch; }
.fs-outcome .btnrow { justify-content: center; margin-top: 6px; }
.fs-mark {
  width: 40px; height: 40px; border-radius: 50%; display: grid; place-items: center; flex: none;
  background: var(--muted); color: var(--muted-foreground); font-size: 16px; font-weight: 600;
}
.fs-mark.sm { width: 28px; height: 28px; font-size: 12px; }
.fs-mark.info { background: var(--info-surface); color: var(--info-surface-foreground); }
.fs-mark.caution { background: var(--caution-surface); color: var(--caution-surface-foreground); }
.fs-mark.destructive { background: var(--destructive-surface); color: var(--destructive-surface-foreground); }
.fs-mark.positive { background: var(--positive-surface); color: var(--positive-surface-foreground); }
.fs-code404 { font-size: 56px; font-weight: 700; letter-spacing: -0.04em; line-height: 1; color: var(--muted-foreground); font-variant-numeric: tabular-nums; }
.fs-brand { display: inline-flex; align-items: center; gap: 8px; font-weight: 600; font-size: 13px; }
.fs-brand i { width: 22px; height: 22px; border-radius: 6px; background: var(--foreground); color: var(--background); display: grid; place-items: center; font-style: normal; font-size: 11px; }
.fs-card { border: 1px solid var(--border); border-radius: var(--radius); background: var(--card); padding: 22px; width: 100%; text-align: left; display: flex; flex-direction: column; gap: 12px; }

/* Your value against the other person's, one row per field that differs. */
.fs-diff { display: grid; grid-template-columns: 116px minmax(0, 1fr) minmax(0, 1fr); border: 1px solid var(--border); border-radius: var(--radius-sm); font-size: 12.5px; overflow: hidden; }
.fs-diff > div { padding: 8px 10px; border-top: 1px solid var(--border); min-width: 0; }
.fs-diff > div:nth-child(-n+3) { border-top: 0; }
.fs-diff > .h { font-size: 11.5px; color: var(--muted-foreground); font-weight: 500; background: var(--muted); }
.fs-diff > .k { color: var(--muted-foreground); }
.fs-diff small { display: block; color: var(--muted-foreground); font-size: 11px; }
.fs-theirs { border-left: 2px solid var(--info); padding: 6px 10px; background: var(--info-surface); color: var(--info-surface-foreground); border-radius: 0 var(--radius-sm) var(--radius-sm) 0; font-size: 12px; display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.fs-theirs .btn { margin-left: auto; height: 24px; font-size: 11.5px; padding: 0 8px; }

/* Who else is on this record. */
.fs-presence { display: inline-flex; align-items: center; gap: 8px; font-size: 12px; color: var(--muted-foreground); }
.fs-av {
  width: 24px; height: 24px; border-radius: 50%; display: grid; place-items: center; flex: none;
  font-size: 10px; font-weight: 600; background: var(--info-surface); color: var(--info-surface-foreground);
  box-shadow: 0 0 0 2px var(--background);
}

/* An activity tray at the bottom right, like an upload panel. */
.fs-tray {
  position: absolute; right: 32px; bottom: 32px; width: 320px; z-index: 4;
  background: var(--popover); color: var(--popover-foreground);
  border: 1px solid var(--border); border-radius: var(--radius);
  box-shadow: 0 12px 32px var(--scroll-shade); font-size: 12.5px; overflow: hidden;
}
.fs-tray > header { display: flex; align-items: center; gap: 8px; padding: 10px 12px; border-bottom: 1px solid var(--border); font-weight: 600; }
.fs-tray > header .fs-dim { margin-left: auto; }
.fs-tray .fs-job { padding: 10px 12px; display: flex; flex-direction: column; gap: 6px; border-bottom: 1px solid var(--border); }
.fs-tray .fs-job:last-child { border-bottom: 0; }
.fs-job .split b { font-weight: 500; }
.fs-job small { color: var(--muted-foreground); font-size: 11.5px; }

/* The thin bar above a table that is reading again. */
.fs-topbar { height: 2px; background: var(--muted); position: relative; overflow: hidden; border-radius: 2px; }
.fs-topbar > i { position: absolute; top: 0; bottom: 0; left: 22%; width: 34%; background: var(--foreground); border-radius: 2px; }

/* A glossary term with its explanation one tap away. */
.fs-term {
  width: 16px; height: 16px; border-radius: 50%; border: 1px solid var(--input); background: transparent;
  font-size: 10px; line-height: 1; padding: 0; cursor: help; color: var(--muted-foreground); display: inline-grid; place-items: center;
}

/* A setup checklist row. */
.fs-tick { width: 20px; height: 20px; border-radius: 50%; border: 1px solid var(--input); display: grid; place-items: center; font-size: 10px; flex: none; }
.fs-tick.done { background: var(--positive-surface); color: var(--positive-surface-foreground); border-color: transparent; }
.fs-steprow { display: flex; align-items: center; gap: 11px; padding: 10px 14px; border-top: 1px solid var(--border); }
.fs-steprow:first-child { border-top: 0; }
.fs-steprow .txt { flex: 1; min-width: 0; }
.fs-steprow .txt b { display: block; font-weight: 500; font-size: 12.5px; }
.fs-steprow .txt small { display: block; color: var(--muted-foreground); font-size: 11.5px; }
.fs-steprow.done .txt b { color: var(--muted-foreground); text-decoration: line-through; text-decoration-color: var(--input); }

/* A quiet saved line beside the control that saved. */
.fs-saved { font-size: 11.5px; color: var(--muted-foreground); display: inline-flex; align-items: center; gap: 5px; }
.fs-saved::before { content: "\\2713"; color: var(--positive); font-weight: 700; }

/* A main column with a narrow side column. */
.fs-cols { display: grid; grid-template-columns: minmax(0, 1fr) 280px; gap: 14px; align-items: start; }
.fs-cols > * { min-width: 0; }
.fs-tiles { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
.fs-num { font-variant-numeric: tabular-nums; }
.fs-count { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0; border: 1px solid var(--border); border-radius: var(--radius-sm); overflow: hidden; }
.fs-count > div { padding: 9px 12px; border-left: 1px solid var(--border); }
.fs-count > div:first-child { border-left: 0; }
.fs-count b { display: block; font-size: 18px; font-weight: 600; font-variant-numeric: tabular-nums; letter-spacing: -0.01em; }
.fs-count small { color: var(--muted-foreground); font-size: 11.5px; }

/* A retry line with its countdown. Tabular, so the seconds do not jump. */
.fs-retry { display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--muted-foreground); font-variant-numeric: tabular-nums; flex-wrap: wrap; }
/* A reference a reader can quote to support. */
.fs-ref { display: inline-flex; align-items: center; gap: 7px; font-size: 12px; color: var(--muted-foreground); }
/* A dialog whose footer may hold three buttons: it wraps on a phone. */
.dialog.fs-footwrap > footer { flex-wrap: wrap; }

@media (max-width: 900px) {
  .fs-cols { grid-template-columns: minmax(0, 1fr); }
}
@media (max-width: 640px) {
  .fs-tray { left: 10px; right: 10px; bottom: 10px; width: auto; }
  .fs-diff { grid-template-columns: 88px minmax(0, 1fr) minmax(0, 1fr); font-size: 12px; }
  .fs-tiles { grid-template-columns: minmax(0, 1fr); }
  .fs-count b { font-size: 16px; }
  .fs-outcome { margin: 28px auto; }
}
`;

/** The back-office shell with something extra in its top bar, such as a connection state. */
function fsShellBar(title, extra, page, active = "Home") {
  return `<div class="shell">${sidebar(active)}<div class="main"><div class="bar"><span>${title}</span><span class="fs-bar-extra">${extra}</span><span class="icons">◐ ☼</span></div>${page}</div></div>`;
}

/** The back-office shell with a `Banner` across its top, above the bar. */
function fsShellBanner(tone, text, title, page, active = "Home") {
  return `<div class="shell">${sidebar(active)}<div class="main"><div class="fs-banner ${tone}" role="status">${text}</div><div class="bar"><span>${title}</span><span class="icons">◐ ☼</span></div>${page}</div></div>`;
}

/** The orders the background tables in this category draw. */
const FS_ORDERS = [
  [ORDER.number, ORDER.customer, ORDER.email, ORDER.company, ORDER.placed, "Paid", "positive", MONEY.order],
  ["SO-1041", "Tom Becker", "tom@becker-bouw.example", "Becker Bouw", "8 Oct 2026, 09:20", "Paid", "positive", "EUR 310.00"],
  ["SO-1040", "Elin Lindqvist", "elin@lindqvist.example", "Lindqvist Studio", "8 Oct 2026, 08:55", "Awaiting payment", "caution", "EUR 64.50"],
  ["SO-1039", ORDER.customer, ORDER.email, ORDER.company, "7 Oct 2026, 17:12", "Shipped", "positive", MONEY.lamp],
  ["SO-1038", "Ade Okafor", "ade@okafor.example", "Okafor Office", "7 Oct 2026, 15:40", "Refunded", "neutral", "EUR 0.00"],
];

/** An orders table at the usual row shape. */
function fsOrders(rows = 5, { style = "", dense = false } = {}) {
  return `<table class="dt${dense ? " dense" : ""}"${style ? ` style="${style}"` : ""}>
  <thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col">Placed</th><th scope="col">State</th><th scope="col" class="num">Paid</th></tr></thead>
  <tbody>${FS_ORDERS.slice(0, rows)
    .map(
      ([no, who, mail, company, when, st, tone, amt]) =>
        `<tr><td><span class="lines"><span class="code">${no}</span><small>${company}</small></span></td><td><span class="lines"><b>${who}</b><small>${mail}</small></span></td><td class="nowrap">${when}</td><td>${badgeRaw(st, tone, "outline")}</td><td class="num">${amt}</td></tr>`,
    )
    .join("")}</tbody>
</table>`;
}

/** The money section of order SO-1042: three lines, its total, and what is refunded. */
function fsOrderMoney(refunded = "EUR 0.00") {
  return statement(
    [
      {
        label: "Paid",
        lines: [
          { what: "Two Oak desk lamps", amount: MONEY.lineTotal },
          { what: "One wall bracket", amount: "EUR 30.00" },
          { what: "Delivery", amount: MONEY.shipping },
        ],
        totalLabel: "Paid by the customer",
        total: MONEY.order,
      },
    ],
    { label: "Refunded so far", amount: refunded },
  );
}

/** The delivery form the session and conflict mocks are about. */
function fsDeliveryForm({ arrival = "08:00", arrivalNote = "", notes = "Forty pallets for Garcia Interiors, dock A. Arrival between 08:00 and 12:00, unloading by noon.", footer = "", disabled = false } = {}) {
  return `<div class="form">
  ${field("Name", input(DELIVERY.name, { disabled }), { required: true })}
  <div style="display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:12px">
    ${field("Date", input("14/03/2026", { disabled }), { required: true })}
    ${field("Arrival", input(arrival, { disabled, cls: arrivalNote ? "fs-num" : "" }), { required: true })}
  </div>
  ${arrivalNote}
  ${field("Notes", `<textarea class="ta"${disabled ? " disabled" : ""}>${notes}</textarea>`, { help: "The customer reads this on the delivery note." })}
  ${footer || `<div class="btnrow end" style="border-top:1px solid var(--border);padding-top:12px"><button class="btn">Cancel</button><button class="btn primary">Save</button></div>`}
</div>`;
}

/** The delivery edit page, which session and conflict mocks sit on. */
function fsDeliveryEdit(body, { before = "", style = "max-width:640px" } = {}) {
  return `<div class="page fs-page" style="${style}">
  ${trail("Home", "Orders", ORDER.number, "Delivery")}
  <div class="phead"><div><h1>Delivery</h1><p class="desc">${DELIVERY.date} · ${DELIVERY.place}</p></div></div>
  ${before}
  ${section("", body)}
</div>`;
}

export const CATEGORY_FEEDBACK_STATES = {
  css: FS_CSS,
  items: [
    {
      id: "state-empty-first",
      title: "Nothing has ever existed",
      why: "Carbon's first empty state: first use, nothing yet. The title should be <b>a positive statement</b>, the body says the next action, and one primary button fills the space. A setup section uses exactly this.",
      verdict:
        "The pick stays on A: one positive title, one line about what a product is for, and one button. It is the simplest shape and the only option that asks nothing of a reader who has nothing yet. Runner-up is the setup guide on Home, which suits a company whose first order needs five steps across five pages rather than one. Never ship the table with a dashed sample row: it teaches the columns by showing a record that does not exist, and a reader who tries to open it meets a dead end.",
      variants: [
        {
          name: "Positive title, one action",
          pick: true,
          rationale:
            "One positive title, one line saying what a product is for, and one button that creates the first one.",
          tradeoff:
            "The reader cannot see what a row will look like, so every column is undiscoverable until there is data. Carbon accepts this.",
          reference: "Carbon",
          html: shell(
            "Products",
            `<div class="page fs-page">
  ${phead("Products", "Six kinds of stock, from a 12-unit gift box to the Oak desk lamp.", '<button class="btn primary">New product</button>', { crumb: trail("Home", "Products") })}
  ${section("", emptyState("No products yet", "A product holds a name, a SKU, a price and what is in stock.", '<button class="btn primary">New product</button>', "◈"))}
</div>`,
            "Products",
          ),
        },
        {
          name: "The empty state beside the thing it fills",
          rationale:
            "The list holds nothing, and beside it the page says what the first product needs to be sellable. The empty state is a checklist rather than a sentence.",
          tradeoff:
            "A list page whose job is finding becomes a setup page while empty, and a reader with no products has no reason to want a list at all.",
          html: shell(
            "Products",
            `<div class="page fs-page">
  ${phead("Products", "Nothing here yet.", '<button class="btn primary">New product</button>', { crumb: trail("Home", "Products") })}
  <div style="display:grid;grid-template-columns:minmax(0,1fr) 230px;gap:14px;align-items:start">
    ${section("", emptyState("No products yet", "A product holds a name, a SKU, a price and stock.", '<button class="btn primary">New product</button>', "◈"))}
    <aside class="section">
      <h3>What a first product needs</h3>
      <div class="body">
        <div class="stack sm">
          ${[
            ["A name", "Customers see it in the store"],
            ["A SKU and a price", "Nothing sells without them"],
            ["One unit, priced", `At ${MONEY.lamp}, or the price you choose`],
            ["A store where it is listed", "Your store, or the counter"],
          ]
            .map(
              ([k, sub], i) => `<div class="switch-row"><span style="width:16px;height:16px;border-radius:50%;border:1px solid var(--input);flex:none"></span><span class="txt"><b>${i + 1}. ${k}</b><small>${sub}</small></span></div>`,
            )
            .join("")}
        </div>
      </div>
    </aside>
  </div>
</div>`,
            "Products",
          ),
        },
        {
          name: "Empty with the first record's shape shown",
          rationale:
            "The table's headers and a single dashed row showing what a row will contain, so the columns are known before there is data.",
          tradeoff:
            "Carbon says an empty state should replace the table, headers included, because a screen reader otherwise reads six empty headers before the message. This deliberately breaks that.",
          reference: "Carbon",
          html: shell(
            "Orders",
            `<div class="page fs-page">
  ${phead("Orders", "268 orders, newest first.", '<button class="btn sm">Export</button>', { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order number, name or email", filters: ["Any state"] })}
  ${section(
    "",
    `<table class="dt">
      <thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col">Placed</th><th scope="col">State</th><th scope="col" class="num">Paid</th></tr></thead>
      <tbody>
        <tr><td colspan="5" style="padding:0">
          <div class="empty" style="padding:22px 16px">
            <span class="ico" aria-hidden="true">◍</span>
            <b>No orders yet</b>
            <p>An order is made by a customer, not by you. Once the store has a product listed, the first one appears here.</p>
            <div class="btnrow"><button class="btn primary">List a product</button></div>
          </div>
        </td></tr>
        <tr style="opacity:.4">
          <td><span class="code">SO-1042</span><br><small class="muted">Garcia Interiors</small></td>
          <td><span class="lines"><b>Maria Garcia</b><small>maria@garcia-interiors.example</small></span></td>
          <td class="nowrap">8 Oct 2026, 09:32</td><td>${badgeRaw("Paid", "positive", "outline")}</td><td class="num">${MONEY.order}</td>
        </tr>
      </tbody>
    </table>`,
    { flush: true },
  )}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Empty inside a section, beside the sections that do have things",
          rationale:
            "One section of a page is empty while its neighbours are not. The empty state is scoped to its section and takes no page-level action.",
          tradeoff:
            "A section with an empty state is taller than a section with three rows, which breaks the rhythm of a page of sections. It also invites a per-section action bar.",
          html: shell(
            "Invoices",
            `<div class="page fs-page">
  ${phead("Invoices", "September 2026 · every euro of the month under the kind it is.", "", { crumb: trail("Home", "Invoices") })}
  ${section("Disputes", emptyState("No open disputes", "Nothing is being challenged by a bank this month.", "", "✓"), { desc: "5 the month before." })}
  ${section("Unmatched payments", emptyState("Nothing unmatched", "Every euro the bank sent matched an order.", "", "✓"), { desc: "1 the month before." })}
  ${section("Questions", emptyState("No customer questions", "Nobody has asked about an order this month.", "", "✓"))}
</div>`,
            "Invoices",
          ),
        },
        {
          name: "Empty with a reason and a way to fix it",
          rationale:
            "The page is empty for a reason the reader cannot guess: the month has not closed. The empty state names the reason and the date it changes, and shows the figures that do exist.",
          tradeoff:
            "A page whose empty state depends on why it is empty needs a read that answers why, which is a second thing the API has to be able to say.",
          html: shell(
            "Statements",
            `<div class="page fs-page">
  ${phead("Statements", "Nothing has settled yet.", "", { crumb: trail("Home", "Invoices", "Statements") })}
  ${section(
    "",
    emptyState(
      "Nothing to show for October",
      "The month has not ended. The first settlement covers 4 to 31 October and lands on 4 November.",
      '<button class="btn">See what settled in September</button>',
      "◷",
    ),
  )}
  ${section("Why October is empty", `<div class="stack sm" style="font-size:12.5px">
      <div class="split"><span>Orders placed in October<span class="sub">Across every customer</span></span><span class="fig">1,284</span></div>
      <div class="split"><span>First settlement covers<span class="sub">Everything up to 31 October</span></span><span class="fig">4 Nov</span></div>
      <div class="split"><span>Amount expected<span class="sub">Order money plus the delivery fees you keep</span></span><span class="fig">EUR 62,180.00</span></div>
    </div>`, { desc: "Figures so far. They become the October statement when the month closes." })}
</div>`,
            "Invoices",
          ),
        },
        {
          name: "Empty because a permission hides everything",
          rationale:
            "The list is not empty, it is withheld. Carbon's third empty state is permissions, and this one names the grant rather than saying nothing is there.",
          tradeoff:
            "It confirms that records exist, which some deployments would rather not do. Naming the grant makes the record count a secret the page reveals.",
          reference: "Carbon",
          html: shell(
            "Invoices",
            `<div class="page fs-page">
  ${phead("Disputes", "5 open. The nearest closes in 19 days.", "", { crumb: trail("Home", "Invoices", "Disputes") })}
  ${section(
    "",
    emptyState(
      "Disputes are not visible to your role",
      `You are ${PEOPLE.warehouse.name}, warehouse lead. Disputes are readable by Support, Finance and Owners, because a dispute concerns money.`,
      '<button class="btn">Ask an owner for the role</button>',
      "⚠",
    ),
  )}
</div>`,
            "Invoices",
          ),
        },
        {
          name: "A sample the reader can open, keep, or remove",
          rationale:
            "Real sample rows instead of an empty illustration, fenced with a Sample state and a notice. The reader learns the page by using it rather than by reading about it: faster first value than any of the six.",
          tradeoff:
            "Samples must be fenced out of every export, total, and customer surface, and a sample left in place at go-live ships fake data as the company's own.",
          html: shell(
            "Products",
            `<div class="page fs-page">
  ${phead("Products", "One sample below, so the page reads as it will.", '<button class="btn primary">New product</button>', { crumb: trail("Home", "Products") })}
  ${notice("info", PRODUCT.name + " is a sample. Open it, change it, or remove it before listing it.")}
  ${toolbar({ search: "", placeholder: "Search products" })}
  ${section(
    "",
    recordRow({ title: PRODUCT.name, sub: `SKU ${PRODUCT.sku} · ${PRODUCT.price}`, state: { label: "Sample", tone: "info" }, fig: "412 in stock", actions: '<button class="btn sm">Open</button>' }) +
      recordRow({ title: "Gift box, standard", sub: "A template, copied from the sample", state: { label: "Sample", tone: "info" }, actions: '<button class="btn sm">Open</button>' }),
    { desc: "Samples are never sold and never appear in exports." },
  )}
  ${formActions('<button class="btn subtle-danger">Remove the samples</button>')}
</div>`,
            "Products",
          ),
        },
        {
          name: "One primary action and two quieter ways to start",
          rationale:
            "Shopify Polaris's EmptyState: one primary action, one secondary, and a link to learn more. The reader can start blank, copy the shape of a standard gift box, or read what a product needs first.",
          tradeoff:
            "Three ways in is one decision more than one way in. A template only helps if the templates are good, so this needs at least one template that is worth copying.",
          reference: "Shopify Polaris",
          html: shell(
            "Products",
            `<div class="page fs-page">
  ${phead("Products", "Every product Acme Supply sells, newest first.", "", { crumb: trail("Home", "Products") })}
  ${section(
    "",
    `<div class="empty" style="padding:40px 20px">
      <span class="fs-mark" aria-hidden="true">◈</span>
      <b style="font-size:14px;margin-top:4px">Create your first product</b>
      <p>A product holds a name, a SKU, a price and stock. Nothing is sold until you list it.</p>
      <div class="btnrow" style="justify-content:center"><button class="btn primary">New product</button><button class="btn">Start from a template</button></div>
      <span class="fs-link" style="font-size:11.5px;color:var(--muted-foreground);margin-top:2px">What a product needs before it can sell</span>
    </div>`,
  )}
</div>`,
            "Products",
          ),
        },
        {
          name: "A setup guide on Home, plain empty states elsewhere",
          rationale:
            "Shopify's and Stripe's onboarding: the steps to a first order live once, on Home, with progress, and each list page keeps a plain one-line empty state. Setup is a journey across pages, so it gets one place rather than seven.",
          tradeoff:
            "The guide has to know what is done, which is a read across several modules. It also needs a way to be dismissed, or it stays on Home after the company has shipped 10,000 orders.",
          reference: "Shopify, Stripe",
          html: shell(
            "Home",
            `<div class="page fs-page">
  ${phead("Good morning, Alex", "Acme Supply · nothing listed yet.", "", { crumb: trail("Home") })}
  ${section(
    "Get ready to sell",
    `<div style="margin:0 -14px -12px">
      ${[
        ["Add your company details", "Name, address and VAT number for your invoices", true, ""],
        ["Connect your payment account", "Order money goes straight to Acme Supply", true, ""],
        ["Add a product", "A name, a SKU and its price", false, '<button class="btn sm primary">New product</button>'],
        ["Set the stock", "How many units can be ordered", false, '<button class="btn sm" disabled>Set the stock</button>'],
        ["List it for sale", "In your store or at the counter", false, '<button class="btn sm" disabled>List it</button>'],
      ]
        .map(
          ([t, sub, done, act]) =>
            `<div class="fs-steprow${done ? " done" : ""}"><span class="fs-tick${done ? " done" : ""}" aria-hidden="true">${done ? "✓" : ""}</span><span class="txt"><b>${t}</b><small>${sub}</small></span>${act}</div>`,
        )
        .join("")}
    </div>`,
    { desc: "2 of 5 done.", acts: '<span style="width:120px">' + progress(40, true) + "</span>" },
  )}
</div>`,
          ),
        },
      ],
    },
    {
      id: "state-empty-filtered",
      title: "Nothing matches what was asked for",
      why: "Carbon's second empty state, and the one most products get wrong: <b>no results for a search is not the same as nothing yet</b>, and the copy must not be the same.",
      verdict:
        "The pick stays on A: copy that names the term, the count that proves the data exists, and two ways out. It answers both questions a reader has, what failed and what to change. Runner-up is the table that keeps its headers with the message as its only row, which suits a reader who filters a table all day and wants the columns to stay put. Never ship the empty state with no actions: a search that names its term always has one thing to offer, which is clearing it.",
      variants: [
        {
          name: "Different copy, and it names the term",
          pick: true,
          rationale:
            "The title quotes the term that found nothing, the line says how many records exist so the reader knows the search failed rather than the data, and two actions separate clearing the search from clearing the filters.",
          tradeoff:
            "Two actions, and Carbon says an empty state should offer one primary action. The secondary one is a ghost link, which is the compromise.",
          reference: "Carbon",
          html: shell(
            "Orders",
            `<div class="page fs-page">
  ${phead("Orders", "No orders match this search.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "maria ruiz", placeholder: "Order number, name or email", filters: ["Garcia Interiors", "Paid"] })}
  ${section(
    "",
    emptyState(
      "Nothing matches 'maria ruiz'",
      "268 orders exist. None match this term with Garcia Interiors and Paid applied.",
      '<button class="btn">Clear the search</button> <button class="btn ghost">Clear the filters too</button>',
      "⌕",
    ),
  )}
</div>`,
            "Orders",
          ),
        },
        {
          name: "The controls stay editable above the empty state",
          rationale:
            "The search box and the filters keep their values so the reader can adjust rather than start again. The empty state sits below them, not instead of them.",
          tradeoff:
            "An empty state with live controls above it is taller than one alone, and the reader has to know which control to change.",
          html: shell(
            "Orders",
            `<div class="page fs-page">
  ${phead("Orders", "Nothing matches.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "garcia interiors paid", placeholder: "Search orders", filters: ["Garcia Interiors", "Paid", "This month"], right: '<button class="btn sm ghost">Clear all</button>' })}
  <div class="inline" style="margin-bottom:10px">
    <span class="chip">garcia interiors paid <button class="x" aria-label="Remove the search">✕</button></span>
    <span class="chip">Garcia Interiors <button class="x" aria-label="Remove the customer filter">✕</button></span>
    <span class="chip">Paid <button class="x" aria-label="Remove the state filter">✕</button></span>
    <span class="chip">This month <button class="x" aria-label="Remove the date filter">✕</button></span>
  </div>
  ${section(
    "",
    emptyState(
      "No orders match these four",
      "268 exist. Try one thing at a time: clear the search first, since it is the narrowest.",
      '<button class="btn">Clear the search only</button>',
      "⌕",
    ),
  )}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Suggesting what does match",
          rationale:
            "The empty state offers the nearest thing the reader probably meant: a similar customer name, or the same order without the filters. A search that helps is a search that proposes.",
          tradeoff:
            "Every suggestion is a read the API has to be able to answer, and a wrong suggestion is worse than none because it sends the reader further away.",
          html: shell(
            "Orders",
            `<div class="page fs-page">
  ${phead("Orders", "Nothing matches 'maria ruiz'.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "maria ruiz", placeholder: "Search orders", filters: ["Any customer", "Any state"] })}
  ${section(
    "",
    `<div class="stack">
      <div class="empty" style="padding:22px 16px 12px">
        <span class="ico" aria-hidden="true">⌕</span>
        <b>No customer called Maria Ruiz</b>
        <p>Two records come close. Neither is called Maria Ruiz.</p>
      </div>
      <div class="rlist">
        <div class="rrow"><span class="txt"><b>Maria Garcia</b><small>maria@garcia-interiors.example · 4 orders, ${MONEY.order}</small></span><span class="acts"><button class="btn sm">See her orders</button></span></div>
        <div class="rrow"><span class="txt"><b>Chris Novak</b><small>Your warehouse lead, not a customer. Staff are under Settings, Team.</small></span><span class="acts"><button class="btn sm ghost">Open the team</button></span></div>
      </div>
    </div>`,
    { flush: false },
  )}
</div>`,
            "Orders",
          ),
        },
        {
          name: "A filters panel instead of an empty state",
          rationale:
            "When a filter has narrowed the list to nothing, the panel itself becomes the message. The reader sees which of their own choices did it.",
          tradeoff:
            "The list is gone, so the reader cannot see how many records the unfiltered list holds unless the panel says so.",
          html: shell(
            "Refunds",
            `<div class="page fs-page">
  ${phead("Refunds", "Nothing matches.", "", { crumb: trail("Home", "Orders", "Refunds") })}
  <div style="display:grid;grid-template-columns:170px minmax(0,1fr);gap:16px;align-items:start">
    <aside class="section" style="border-color:var(--ring);box-shadow:0 0 0 1px var(--ring)">
      <h3>Filter <span class="acts"><button class="btn xs ghost">Clear</button></span></h3>
      <div class="body">
        <div class="stack sm">
          ${field("Search", input("cosmo", { cls: "err" }), { error: "Nothing is called Cosmo here" })}
          ${field("Window", '<select class="sel"><option>Any window</option><option selected>Open now</option></select>')}
          ${field("Channel", '<select class="sel"><option>Any channel</option><option selected>Counter</option></select>')}
          <div class="callout destructive" style="margin-top:4px">0 of 31 refunds match. The window and the channel are the narrowest.</div>
        </div>
      </div>
    </aside>
    <div>
      ${emptyState("Nothing matches", "31 refunds exist. The counter has none, and none are open.", '<button class="btn">Clear the channel</button>', "⌕")}
    </div>
  </div>
</div>`,
            "Orders",
          ),
        },
        {
          name: "The same empty state with no actions at all",
          rationale:
            "Where nothing can be done about it, the state says so and stops. An empty search with no results and nothing to adjust is a fact, not a failure.",
          tradeoff:
            "Carbon says an empty state should offer the verb that fills it. A page that violates that is telling the reader they are stuck, which may be the truth.",
          reference: "Carbon",
          html: shell(
            "Disputes",
            `<div class="page fs-page">
  ${phead("Disputes", "Nothing in 2026.", "", { crumb: trail("Home", "Invoices", "Disputes") })}
  ${toolbar({ search: null, views: [{ label: "2026 · 0", on: true }, "2025 · 14", "2024 · 3"] })}
  ${section("", emptyState("No disputes in 2026", "The year has 3 months left. Fourteen were opened in 2025.", "", "✓"))}
</div>`,
            "Invoices",
          ),
        },
        {
          name: "An empty state that carries the count it should have",
          rationale:
            "Where a filter is the only thing between the reader and the records, the empty state names the filter and the number behind it. The reader can go back one step.",
          tradeoff:
            "The count is a second read, and it is a number on a page that was about to show none. Two numbers where one would do.",
          html: shell(
            "Orders",
            `<div class="page fs-page">
  ${phead("Orders", "No orders in March 2024.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Search orders", views: ["2026 · 268", "2025 · 1,204", { label: "2024 · 0", on: true }] })}
  ${section(
    "",
    emptyState(
      "Nothing was sold in March 2024",
      "2024 holds 0 orders across all 12 months. 2025 holds 1,204.",
      '<button class="btn">Look at 2025</button>',
      "◷",
    ),
  )}
</div>`,
            "Orders",
          ),
        },
        {
          name: "One line in place of the rows, with one link that clears everything",
          rationale:
            "GitHub's issue list: 'No results matched your search', and a single link that clears the query, the filters and the sort together. The toolbar keeps its values, so a reader who wants to change one thing still can.",
          tradeoff:
            "It does not say how many records exist without the filters, so the reader cannot tell a narrow search from an empty list. Adding the count is the only change it needs.",
          reference: "GitHub",
          html: shell(
            "Orders",
            `<div class="page fs-page">
  ${phead("Orders", "268 orders, newest first.", '<button class="btn">Export</button>', { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "maria ruiz", placeholder: "Order number, name or email", filters: ['<select class="fsel"><option>Garcia Interiors</option></select>', '<select class="fsel"><option>Paid</option></select>'] })}
  ${section(
    "",
    `<div class="empty" style="padding:44px 20px">
      <span class="ico" aria-hidden="true">⌕</span>
      <b>No orders match this search</b>
      <p>Searching for 'maria ruiz' in Garcia Interiors, Paid. 268 orders exist without these.</p>
      <span class="fs-link" style="font-size:12px;margin-top:4px">Clear the search and the filters</span>
    </div>`,
  )}
</div>`,
            "Orders",
          ),
        },
        {
          name: "The table header stays, with the message as its only row",
          rationale:
            "Stripe's payments list keeps the column headers when a filter finds nothing, because the filters name columns and the reader is still reading the same table. The message sits in one full-width row.",
          tradeoff:
            "Carbon replaces the table for a first-use empty state, and this differs from it on purpose. It is right for a filter result and wrong for first use, so the two states need two components.",
          reference: "Stripe",
          html: shell(
            "Orders",
            `<div class="page fs-page">
  ${phead("Orders", "268 orders, newest first.", '<button class="btn">Export</button>', { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order number, name or email", filters: ['<select class="fsel"><option>Refunded</option></select>', '<select class="fsel"><option>Counter</option></select>'], right: '<button class="btn sm ghost">Clear filters</button>' })}
  ${section(
    "",
    `<table class="dt">
      <thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col">Placed</th><th scope="col">State</th><th scope="col" class="num">Paid</th></tr></thead>
      <tbody><tr><td colspan="5" style="padding:36px 16px;text-align:center">
        <b style="font-weight:600;font-size:13px">No refunded counter orders</b>
        <p class="muted" style="font-size:12px;margin-top:3px">31 orders were refunded, all of them placed in the store.</p>
      </td></tr></tbody>
    </table>`,
    { flush: true },
  )}
</div>`,
            "Orders",
          ),
        },
      ],
    },
    {
      id: "state-loading",
      title: "Loading",
      why: "Carbon is explicit: <b>use skeleton states instead of spinners</b> where extra load time is expected. The narrower rule beside it: a spinner sits in the control that waits, and a skeleton is for the page's first read.",
      verdict:
        "The pick stays on A: skeletons at the real row height, so nothing moves when the data lands. It is the simplest shape and the only option that survives a slow first read on a phone. Runner-up is the thin bar over the old rows, which suits a re-read where the reader keeps their place, such as changing a filter. Never ship nothing at all: any read slower than a blink reads as a page that failed, and every read needs a loading state.",
      variants: [
        {
          name: "Skeletons at the real row height",
          pick: true,
          rationale:
            "Carbon's answer, and the page-frames shape. Each skeleton row is shaped like the row it will become, so nothing moves when the data lands.",
          tradeoff:
            "Carbon also requires the header, toolbar and pagination to match the row size, so a skeleton page has to get four heights right or the page jumps.",
          reference: "Carbon",
          html: shell(
            "Orders",
            `<div class="page fs-page">
  ${phead("Orders", "Every order, newest first.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order number, name or email" })}
  ${section(
    "",
    `<table class="dt">
      <thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col">Placed</th><th scope="col">State</th><th scope="col" class="num">Paid</th></tr></thead>
      <tbody>
        ${Array.from(
          { length: 7 },
          () => `<tr>
          <td><div class="skel" style="width:56px"></div><div class="skel" style="width:82%;margin-top:5px"></div></td>
          <td><div class="skel" style="width:72px"></div><div class="skel" style="width:88%;margin-top:5px"></div></td>
          <td><div class="skel" style="width:66px"></div></td>
          <td><div class="skel" style="width:42px;height:19px;border-radius:999px"></div></td>
          <td class="num"><div class="skel" style="width:46px;margin-left:auto"></div></td>
        </tr>`,
        ).join("")}
      </tbody>
    </table>`,
    { flush: true },
  )}
  <div class="pager"><span class="skel" style="width:92px;display:inline-block"></span><span class="right"><div class="skel" style="width:130px;height:26px"></div></span></div>
</div>`,
            "Orders",
          ),
        },
        {
          name: "A spinner in the control that is waiting",
          rationale:
            "A control-level rule: a search that is running shows a spinner inside the search field, not over the page. The table stays as it was.",
          tradeoff:
            "On the first load of a page there is no control to put it in, which is exactly why Carbon asks for a skeleton there and a spinner for a re-read.",
          reference: "Carbon",
          html: shell(
            "Orders",
            `<div class="page fs-page">
  ${phead("Orders", "268 orders. Searching.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "maria", placeholder: "Search orders", filters: ["Any state"], right: '<span class="inline" style="gap:6px;font-size:11.5px;color:var(--muted-foreground)"><span class="spinner" style="width:11px;height:11px;border-width:1.5px"></span>Searching</span>' })}
  ${section(
    "",
    `<table class="dt" style="opacity:.5">
      <thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col">Placed</th><th scope="col">State</th><th scope="col" class="num">Paid</th></tr></thead>
      <tbody>
        ${[
          ["SO-1042", ORDER.customer, "8 Oct 09:32", "Paid", "positive", MONEY.order],
          ["SO-1041", "Tom Becker", "8 Oct 09:20", "Paid", "positive", "EUR 310.00"],
          ["SO-1039", ORDER.customer, "7 Oct 17:12", "Shipped", "positive", MONEY.lamp],
        ]
          .map(([no, who, when, st, tone, amt]) => `<tr><td><span class="code">${no}</span></td><td>${who}</td><td class="nowrap">${when}</td><td>${badgeRaw(st, tone, "outline")}</td><td class="num">${amt}</td></tr>`)
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
          name: "A spinner in the submit button while it sends",
          rationale:
            "A submit is disabled only while it sends. The spinner lives in the button, so the reader's eye is already there and nothing else on the page changes.",
          tradeoff:
            "A button whose label is replaced by a spinner loses its width, so the layout shifts unless the button holds its size. It also says nothing about how long it will be.",
          html: shell(
            "New product",
            `<div class="page fs-page" style="max-width:520px">
  ${trail("Home", "Products", "New product")}
  <div class="phead"><div><h1>New product</h1><p class="desc">Start with a name.</p></div></div>
  ${section(
    "",
    `<div class="form">
      ${field("Name", input("Oak desk lamp"), { required: true })}
      ${field("Warehouse", '<select class="sel"><option selected>Amsterdam warehouse</option></select>', { required: true })}
      ${field("Available from", input("09/10/2026", { cls: "nowrap" }), { required: true })}
      <div class="btnrow end" style="border-top:1px solid var(--border);padding-top:12px">
        <button class="btn">Cancel</button>
        <button class="btn primary" disabled style="min-width:132px"><span class="spinner" style="width:12px;height:12px;border-width:2px;border-color:color-mix(in oklab, var(--primary-foreground) 35%, transparent);border-top-color:var(--primary-foreground)"></span>Creating</button>
      </div>
    </div>`,
  )}
</div>`,
            "Products",
          ),
        },
        {
          name: "Progress for work that takes a while",
          rationale:
            "Where the read is genuinely slow, a bar with a percentage and what is happening. This is the case Carbon's skeleton does not cover, because it is not a read.",
          tradeoff:
            "A percentage is a claim. If the server cannot estimate the remaining work, the bar is theatre, and a bar that stalls at 40% is worse than a spinner.",
          reference: "Carbon",
          html: shell(
            "September close",
            `<div class="page fs-page">
  ${phead("September 2026", "Matching 1,204 orders against the bank file.", "", { crumb: trail("Home", "Invoices", "Statements", "September 2026") })}
  ${section(
    "",
    `<div class="stack sm">
      <div class="split" style="align-items:baseline"><span><b>Reading the bank file</b><span class="sub">842 of 1,204 payments matched</span></span><span class="fig">70%</span></div>
      ${progress(70)}
      <div class="inline" style="justify-content:space-between;font-size:11.5px;color:var(--muted-foreground)"><span>Started 14:22</span><span>About 20 seconds left</span></div>
    </div>`,
  )}
  ${section("What is matched so far", `<div class="stmt">
      <div class="line"><span>Matched<span class="sub">One bank payment, one order</span></span><span class="fig">842</span></div>
      <div class="line"><span>Unmatched<span class="sub">In the file, not in the back office</span></span><span class="fig">11</span></div>
      <div class="line"><span>In the back office, not in the file<span class="sub">Still to be checked</span></span><span class="fig">351</span></div>
    </div>`, { desc: "Shown while it runs. Nothing here is final." })}
</div>`,
            "Invoices",
          ),
        },
        {
          name: "A dimmed page with the spinner centred",
          rationale:
            "A scrim over the whole page with a spinner and a sentence. Unambiguous, and the page underneath is deliberately not readable.",
          tradeoff:
            "A scrim over the page is neither a shared component nor a page slot, and it hides the page a reader may want to scroll.",
          html: shell(
            "Orders",
            `<div class="page fs-page" style="position:relative">
  ${phead("Orders", "Every order, newest first.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order number, name or email" })}
  ${section("", `<table class="dt"><thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col" class="num">Paid</th></tr></thead><tbody><tr><td><span class="code">SO-1042</span></td><td>${ORDER.customer}</td><td class="num">${MONEY.order}</td></tr></tbody></table>`, { flush: true })}
  <div class="scrim">
    <div class="stack sm" style="align-items:center;gap:9px">
      <span class="spinner" style="width:20px;height:20px;border-width:2.5px"></span>
      <span style="font-size:12.5px">Reading 1,204 orders</span>
      <span style="font-size:11.5px;color:var(--muted-foreground)">This takes a moment on a deployment this size.</span>
    </div>
  </div>
</div>`,
            "Orders",
          ),
        },
        {
          name: "Nothing at all, briefly",
          rationale:
            "No placeholder. The page renders as it will, and the content appears when it does. Correct only where the load is under about 200 milliseconds.",
          tradeoff:
            "Anything slower reads as a page that failed. Every read needs a loading state, so this is the shape the rule refuses.",
          html: shell(
            "Orders",
            `<div class="page fs-page">
  ${phead("Orders", "Every order, newest first.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order number, name or email" })}
  ${section(
    "",
    `<table class="dt">
      <thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col">Placed</th><th scope="col">State</th><th scope="col" class="num">Paid</th></tr></thead>
      <tbody>
        ${[
          ["SO-1042", "Maria Garcia", "maria@garcia-interiors.example", "Garcia Interiors", "8 Oct 09:32", "Paid", "positive", MONEY.order],
          ["SO-1041", "Tom Becker", "tom@becker-bouw.example", "Becker Bouw", "8 Oct 09:20", "Paid", "positive", "EUR 310.00"],
          ["SO-1040", "Elin Lindqvist", "elin@lindqvist.example", "Lindqvist Studio", "8 Oct 08:55", "Awaiting payment", "caution", "EUR 64.50"],
          ["SO-1039", "Maria Garcia", "maria@garcia-interiors.example", "Garcia Interiors", "7 Oct 17:12", "Shipped", "positive", MONEY.lamp],
          ["SO-1038", "Ade Okafor", "ade@okafor.example", "Okafor Office", "7 Oct 15:40", "Refunded", "neutral", "EUR 0.00"],
        ]
          .map(([no, who, mail, company, when, st, tone, amt]) => `<tr><td><span class="lines"><span class="code">${no}</span><small>${company}</small></span></td><td><span class="lines"><b>${who}</b><small>${mail}</small></span></td><td class="nowrap">${when}</td><td>${badgeRaw(st, tone, "outline")}</td><td class="num">${amt}</td></tr>`)
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
          name: "The last rows stay, a thin bar says a new read is running",
          rationale:
            "Linear and Vercel keep what was on screen and show a thin bar while the next read runs. A reader changing a filter keeps their place, and nothing jumps when the rows arrive.",
          tradeoff:
            "The rows on screen are briefly the old answer. A reader who acts on a row during that second acts on the old answer, so commands on a list that is reading must wait or say so.",
          reference: "Linear, Vercel",
          html: shell(
            "Orders",
            `<div class="page fs-page">
  ${phead("Orders", "268 orders, newest first.", '<button class="btn">Export</button>', { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order number, name or email", filters: ['<select class="fsel"><option>Paid</option></select>'], right: '<span class="fs-dim" role="status">Reading</span>' })}
  <section class="section" aria-busy="true">
    <div class="fs-topbar" aria-hidden="true"><i></i></div>
    <div class="body flush">${fsOrders(5)}</div>
  </section>
  ${pager(1, 11)}
</div>`,
            "Orders",
          ),
        },
        {
          name: "A skeleton that admits a slow read after a few seconds",
          rationale:
            "Polaris and Material both time loading states: nothing for the first few hundred milliseconds, a skeleton after that, and words once the wait is long. After five seconds this one says what it is reading and offers to stop.",
          tradeoff:
            "Three timed states per page is more to build and to test, and the five-second line only helps if the read can really be cancelled.",
          reference: "Shopify Polaris, Material",
          html: shell(
            "Orders",
            `<div class="page fs-page">
  ${phead("Orders", "Every order, newest first.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order number, name or email" })}
  ${section(
    "",
    `<div class="loading-row" role="status" style="padding:11px 14px;border-bottom:1px solid var(--border)"><span class="spinner"></span>Still reading 1,204 orders for September. This is taking longer than usual.<span class="fs-link" style="margin-left:auto;color:var(--foreground)">Stop</span></div>
    <div style="padding:12px 14px">${skeleton("rows")}</div>`,
    { flush: true },
  )}
</div>`,
            "Orders",
          ),
        },
      ],
    },
    {
      id: "state-refused",
      title: "A command the API refused",
      why: "A refusal alert words a refusal <b>by its code</b>, from a dictionary keyed on the code. WCAG 3.3.1 requires the error to be identified in text and 3.3.3 requires it to say how to fix it.",
      verdict:
        "The pick stays on A: the refusal with the dictionary sentence, the code behind Why, and the two things that can be done instead. It meets WCAG 3.3.1 and 3.3.3 in one place. Runner-up is the refusal inside the dialog that sent it, which suits a dialog flow where closing it would lose the amount the reader typed. Never ship the refusal only on the record timeline: a reader who sent the command from anywhere else never comes back to find out why it did not happen.",
      variants: [
        {
          name: "The refusal sentence, its code and a way to fix it",
          pick: true,
          rationale:
            "One refusal shape: a title saying what is wrong, the detail saying why, and a Why link where the application can explain the refusal. The refusal sentence comes from the dictionary, not the component.",
          tradeoff:
            "Three pieces per refusal code in two languages, and every new command that can be refused adds a code. The dictionary is the second copy of the domain rules.",
          html: shell(
            "Refund refused",
            `<div class="page fs-page" style="max-width:600px">
  ${trail("Home", "Orders", ORDER.number)}
  <div class="phead"><div><h1>${ORDER.number} ${badgeRaw("Paid", "positive")}</h1><p class="desc">${ORDER.customer} · ${ORDER.company}</p></div><div class="acts"><button class="btn subtle-danger">Refund</button></div></div>
  ${`<div class="alert destructive" role="alert" data-slot="problem-alert" data-code="${REFUSALS.windowClosed.code}" style="margin-bottom:14px">
    <span class="ico" aria-hidden="true">✕</span>
    <span class="txt"><b>${REFUSALS.windowClosed.title}</b><small>${REFUSALS.windowClosed.detail}</small></span>
    <span class="tail"><span class="linkish" style="font-size:11.5px">Why?</span></span>
  </div>`}
  ${section("What can be done instead", `<div class="alist">
    <div class="arow"><span class="why" aria-hidden="true">◈</span><span class="txt"><b>Offer the customer credit</b><small>A credit against a future order, paid for by Acme Supply.</small></span><span class="go"><button class="btn sm primary">Offer credit</button></span></div>
    <div class="arow"><span class="why" aria-hidden="true">⇄</span><span class="txt"><b>Record a bank transfer</b><small>You send the money yourself. The system records that it was agreed.</small></span><span class="go"><button class="btn sm">Start a transfer</button></span></div>
  </div>`, { desc: "The refund window is the payment method's, not the company's. These two routes do not use it." })}
</div>`,
            "Orders",
          ),
        },
        {
          name: "The refusal beside the button that caused it",
          rationale:
            "The same refusal, placed under the control that sent it. On a page with one form, the reader is already looking there and the connection is obvious.",
          tradeoff:
            "On a page with several forms, a refusal above the form and one under a button are two placements for one kind of message, and the reader has to know which is which.",
          html: shell(
            "Order lines",
            `<div class="page fs-page" style="max-width:600px">
  ${trail("Home", "Orders", ORDER.number)}
  <div class="phead"><div><h1>Order lines</h1><p class="desc">${ORDER.number} · ${ORDER.customer} · ${ORDER.company}</p></div></div>
  ${section(
    "",
    `<div class="form">
      ${field("Oak desk lamps", input("20", { cls: "num err" }), { error: "That is more lamps than the warehouse holds. The Amsterdam warehouse holds 12.", required: true })}
      ${`<div class="alert destructive" role="alert" data-slot="problem-alert" data-code="${REFUSALS.stockExceeded.code}">
        <span class="ico" aria-hidden="true">✕</span>
        <span class="txt"><b>${REFUSALS.stockExceeded.title}</b><small>${REFUSALS.stockExceeded.detail}</small></span>
      </div>`}
      <div class="btnrow end" style="border-top:1px solid var(--border);padding-top:12px"><button class="btn">Cancel</button><button class="btn primary">Save the lines</button></div>
    </div>`,
  )}
</div>`,
            "Orders",
          ),
        },
        {
          name: "The refusal with a code, for support",
          rationale:
            "The refusal plus the code and a copy control, for the reader who needs to quote it. This is what a support conversation needs and what a normal reader does not.",
          tradeoff:
            "A code on screen breaks the usual rule: do not show a raw code. Shown deliberately, it has to be labelled and copyable rather than bare.",
          html: shell(
            "Refund refused",
            `<div class="page fs-page" style="max-width:600px">
  ${trail("Home", "Orders", ORDER.number)}
  ${`<div class="alert destructive" role="alert" style="margin-bottom:14px" data-slot="problem-alert" data-code="${REFUSALS.windowClosed.code}">
    <span class="ico" aria-hidden="true">✕</span>
    <span class="txt"><b>${REFUSALS.windowClosed.title}</b><small>${REFUSALS.windowClosed.detail}</small></span>
  </div>`}
  ${section(
    "Details, if you need to report this",
    `<div class="stack sm">
      <div class="split"><span>Reference<span class="sub">Use this in a message to support</span></span><span class="fig"><span class="copyable"><span class="code">RF-SO-1042-181</span><button aria-label="Copy the reference">⧉</button></span></span></div>
      <div class="split"><span>When it was refused<span class="sub">By the payment provider</span></span><span class="fig">8 Oct 2026, 11:04</span></div>
      <div class="split"><span>Code<span class="sub">The refusal, named exactly</span></span><span class="fig"><span class="copyable"><span class="code">${REFUSALS.windowClosed.code}</span><button aria-label="Copy the code">⧉</button></span></span></div>
    </div>`,
    { desc: "Acme Supply sees this. The system records it against the order." },
  )}
</div>`,
            "Orders",
          ),
        },
        {
          name: "A refusal that changed nothing, stated plainly",
          rationale:
            "Not every refusal is a problem. Some commands are refused because nothing needed doing, and saying so is more honest than an error tone.",
          tradeoff:
            "The reader cannot tell a no-op from a failure unless the tone differs, and the tone is the only signal. A refusal that was correct should not be red.",
          html: shell(
            "List the product",
            `<div class="page fs-page" style="max-width:560px">
  ${trail("Home", "Products", PRODUCT.name, "Availability")}
  <div class="phead"><div><h1>List the product</h1><p class="desc">Oak desk lamp is already listed since 13 Jan 2026, 10:00.</p></div></div>
  ${section(
    "",
    `<div class="alert plain"><span class="txt"><b>Nothing to do.</b><small>This listing went out on 13 Jan 2026 at 10:00, as scheduled. There is nothing left to list.</small></span><span class="tail"><button class="btn sm">See the listing</button></span></div>`,
  )}
</div>`,
            "Products",
          ),
        },
        {
          name: "A refusal with nothing lost, said first",
          rationale:
            "The refusal leads with what is intact, then what is wrong. NN/g's rule is that a message must not need reading twice; naming the damage first is the difference between a refusal and a dead end.",
          tradeoff:
            "The sentence order matters and has to be right per code, which is why the dictionary is the right place for it and a component is not.",
          reference: "NN/g",
          html: shell(
            "Two of three",
            `<div class="page fs-page">
  ${phead("Orders", "268 orders. 3 selected.", "", { crumb: trail("Home", "Orders") })}
  ${`<div class="alert destructive" role="alert" style="margin-bottom:12px" data-slot="problem-alert" data-code="messaging/message.opted-out">
    <span class="ico" aria-hidden="true">✕</span>
    <span class="txt"><b>1 invoice was resent. 2 were not.</b><small>Maria Garcia and Elin Lindqvist opted out of messages. Nothing was lost, and nothing was sent to either of them.</small></span>
    <span class="tail"><span class="linkish" style="font-size:11.5px">Why?</span></span>
  </div>`}
  ${toolbar({ search: "", placeholder: "Order number, name or email" })}
  ${section(
    "",
    `<table class="dt dense">
      <thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col">Result</th><th scope="col" class="num">Paid</th></tr></thead>
      <tbody>
        ${[
          ["SO-1042", ORDER.customer, "Sent", "positive", MONEY.order],
          ["SO-1040", "Elin Lindqvist", "Not sent", "destructive", "EUR 64.50"],
          ["SO-1039", ORDER.customer, "Not sent", "destructive", MONEY.lamp],
        ]
          .map(([no, who, res, tone, amt]) => `<tr><td><span class="code">${no}</span></td><td>${who}</td><td>${badgeRaw(res, tone, "outline")}</td><td class="num">${amt}</td></tr>`)
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
          name: "The refusal on the record it happened to, not a banner",
          rationale:
            "One command on one record refused. It goes into the record's own timeline, where the reader goes looking for what happened, rather than at the top of a page they are passing through.",
          tradeoff:
            "Invisible. A reader who sent the command from somewhere else will not come back to this page to find out why it did not happen.",
          html: shell(
            "Order",
            `<div class="page fs-page" style="max-width:600px">
  ${trail("Home", "Orders", ORDER.number)}
  <div class="phead"><div><h1>${ORDER.number} ${badgeRaw("Refunded", "neutral")}</h1><p class="desc">${ORDER.customer} · ${ORDER.company}</p></div><div class="acts"><button class="btn primary">Message customer</button></div></div>
  ${section("The money", `<div class="stmt">
      <div class="line"><span>Paid by the customer</span><span class="fig">${MONEY.order}</span></div>
      <div class="line"><span>Refunded<span class="sub">8 Oct 2026, 11:04</span></span><span class="fig">-${MONEY.refund}</span></div>
      <div class="sub-total"><span>Still to settle</span><span class="fig">EUR 80.00</span></div>
    </div>`)}
  ${section(
    "What happened",
    `<div class="tl">
      ${timelineEntry("A second refund was refused", "8 Oct 2026, 11:06", "the system", "destructive")}
      ${timelineEntry(`Refund sent, ${MONEY.refund}`, "8 Oct 2026, 11:04", PEOPLE.finance.name, "positive")}
      ${timelineEntry("Order placed", "8 Oct 2026, 09:32", ORDER.customer, "neutral", true)}
    </div>`,
    { desc: "The refusal reads in the record because that is where a reader looks for what happened." },
  )}
</div>`,
            "Orders",
          ),
        },
        {
          name: "The refusal inside the dialog that sent it",
          rationale:
            "Stripe's refund dialog keeps a refusal inside the dialog, above the amount, and leaves the dialog open so the reader can change what was refused. Focus moves to the message, and the alternative is one button away.",
          tradeoff:
            "The dialog grows by the height of the message, and a long refusal pushes the buttons down. On a phone the dialog may need to scroll.",
          reference: "Stripe",
          html: shell(
            "Order",
            `<div class="page fs-page" style="min-height:560px">
  ${phead(`${ORDER.number} ${badgeRaw("Paid", "positive")}`, `${ORDER.customer} · ${ORDER.company}`, '<button class="btn subtle-danger">Refund</button>', { crumb: trail("Home", "Orders", ORDER.number) })}
  ${section("The money", fsOrderMoney())}
  ${dialog(
    `Refund ${ORDER.number}`,
    `<div class="stack sm">
      <div class="alert destructive" role="alert"><span class="ico" aria-hidden="true">✕</span><span class="txt"><b>${REFUSALS.windowClosed.title}</b><small>${REFUSALS.windowClosed.detail}</small></span></div>
      ${field("Amount", '<span class="inp-wrap"><input class="inp money" value="100.00" disabled></span>', { help: "Back on the customer's own payment." })}
      <div class="note tight">Acme Supply can offer ${ORDER.customer} credit instead, paid from its own account.</div>
    </div>`,
    { footer: '<button class="btn">Close</button><button class="btn primary">Offer credit instead</button>' },
  )}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Refused before it is sent: the button explains",
          rationale:
            "GitHub's merge box disables Merge and says which check blocks it. Where the page already knows the refund window has closed, it says so beside the button, and the refusal never has to happen.",
          tradeoff:
            "Only works for refusals the page can predict from what it already read. The API still refuses, so the dictionary sentence and the button sentence must say the same thing.",
          reference: "GitHub",
          html: shell(
            "Order",
            `<div class="page fs-page" style="max-width:640px">
  ${phead(`${ORDER.number} ${badgeRaw("Paid", "positive")}`, `${ORDER.customer} · ${ORDER.company} · paid 214 days ago`, "", { crumb: trail("Home", "Orders", ORDER.number) })}
  ${section(
    "Refunds",
    `<div class="stack">
      <div class="explained"><button class="btn subtle-danger" aria-disabled="true">Refund to the original payment</button><span class="why">This payment method takes a refund only within 180 days of the payment. This one is 214 days old.</span></div>
      <div class="hr"></div>
      <div class="split"><span><b style="font-weight:500">Offer credit</b><span class="sub">Acme Supply pays it from its own account.</span></span><button class="btn sm primary">Offer credit</button></div>
      <div class="split"><span><b style="font-weight:500">Record a bank transfer</b><span class="sub">You send the money yourself. The system records it.</span></span><button class="btn sm">Record a transfer</button></div>
    </div>`,
    { desc: "Paid EUR 125.00 on 8 Mar 2026. Nothing refunded." },
  )}
</div>`,
            "Orders",
          ),
        },
      ],
    },
    {
      id: "state-success",
      title: "A command that worked",
      why: "The catalog rule is precise: <b>a success message follows only a command that succeeded</b>, and a command that changes money, access or stock <b>leaves evidence on the page it ran from</b>.",
      verdict:
        "The pick stays on A: evidence on the page, with the state, the money, and the timeline all saying what changed. A toast alone is never evidence for money, access, or stock. Runner-up is the toast with Undo, which suits a reversible change such as hiding a product from the store. Never ship no message at all: it fails WCAG 4.1.3, because a screen reader user gets no signal that the command worked.",
      variants: [
        {
          name: "Evidence on the page, not only a toast",
          pick: true,
          rationale:
            "The record changes and the page says what changed: the state becomes Refunded, the money section shows the reversal, and the timeline gains an entry. That is evidence a toast cannot be.",
          tradeoff:
            "The reader has to find the evidence. A toast is faster and leaves nothing once it goes, so a toast alone is not evidence.",
          html: shell(
            "Order refunded",
            `<div class="page fs-page">
  ${phead(`${ORDER.number} ${badgeRaw("Refunded", "neutral")}`, `Fully refunded 8 Oct 2026, 11:04, by ${PEOPLE.finance.name}.`, '<button class="btn primary">Message customer</button>', { crumb: trail("Home", "Orders", ORDER.number) })}
  ${section(
    "The money",
    `<div class="stmt">
      <div class="line"><span>Paid by the customer<span class="sub">8 Oct 2026, 09:34</span></span><span class="fig">${MONEY.order}</span></div>
      <div class="line"><span>Refunded in full<span class="sub">8 Oct 2026, 11:04, to the same account</span></span><span class="fig">-${MONEY.order}</span></div>
      <div class="sub-total"><span>Kept by Acme Supply</span><span class="fig">EUR 0.00</span></div>
    </div>`,
  )}
  ${section(
    "What happened",
    `<div class="tl">
      ${timelineEntry(`Refunded, ${MONEY.order}`, "8 Oct 2026, 11:04", PEOPLE.finance.name, "positive")}
      ${timelineEntry("Customer told", "8 Oct 2026, 11:04", "the system")}
      ${timelineEntry("Returned stock booked back in", "8 Oct 2026, 11:04", "the system")}
      ${timelineEntry("Order placed", "8 Oct 2026, 09:32", ORDER.customer, "neutral", true)}
    </div>`,
  )}
</div>`,
            "Orders",
          ),
        },
        {
          name: "A toast, for a change with no evidence to leave",
          rationale:
            "Where the command changed nothing visible, a toast is the whole answer. Copying a reference is the clearest case: the value was already on screen.",
          tradeoff:
            "Material allows one action and no Dismiss, and Android warns the timer can take the action away. It is fine for a message with no action.",
          reference: "Material, Android",
          html: shell(
            "Order",
            `<div class="page fs-page" style="max-width:480px">
  ${trail("Home", "Orders", ORDER.number)}
  <div class="phead"><div><h1>${ORDER.number}</h1></div></div>
  ${section(
    "",
    `<div class="stack">
      <div class="split"><span>Order number<span class="sub">Read it aloud at the pickup counter</span></span><span class="fig"><span class="copyable"><span class="code">${ORDER.number}</span><button aria-label="Copy the order number">⧉</button></span></span></div>
      <div class="split"><span>Bank reference<span class="sub">For a support case</span></span><span class="fig"><span class="copyable"><span class="code">SH-88213</span><button aria-label="Copy the bank reference">⧉</button></span></span></div>
    </div>`,
  )}
  <div style="position:absolute;right:16px;bottom:16px">${toast("positive", "Bank reference copied.")}</div>
</div>`,
            "Orders",
          ),
        },
        {
          name: "A success notice that persists, for a change in progress",
          rationale:
            "Where the command succeeded and the effect is still arriving, the notice says so and stays until it does. A toast that goes would leave the reader unsure.",
          tradeoff:
            "A success message that waits is a status, not an alert, so it must not take a tone. And a notice that persists has to resolve into something else.",
          html: shell(
            "Product listed",
            `<div class="page fs-page">
  ${phead(`${PRODUCT.name} ${badgeRaw("Active", "positive")}`, "Listed 8 Oct 2026, 14:22. The store shows it now.", '<button class="btn sm">Edit</button>', { crumb: trail("Home", "Products", PRODUCT.name) })}
  ${`<div class="alert plain" style="margin-bottom:14px"><span class="txt"><b>Reaching customers now.</b><small>The store picked this up at 14:22. The 412 units in stock are listed and the dispatch plan is unchanged.</small></span><span class="tail"><button class="btn sm">Check the store</button></span></div>`}
  ${section("What is listed", `<div class="rlist">${recordRow({ title: "Oak desk lamp", sub: `${MONEY.lamp} · 412 in stock`, state: { label: "Active", tone: "positive" } })}</div>`)}
</div>`,
            "Products",
          ),
        },
        {
          name: "A success with a count, when a batch partly worked",
          rationale:
            "A bulk command's success says what succeeded and what did not, in the same breath. '3 of 5 sent' is more useful than 'Sent'.",
          tradeoff:
            "A count that is not expected raises a question the message then has to answer, so a partial success needs its own copy per command.",
          html: shell(
            "Bulk resend",
            `<div class="page fs-page">
  ${phead("Orders", "3 of 5 invoices resent.", "", { crumb: trail("Home", "Orders") })}
  ${`<div class="alert caution" role="status" style="margin-bottom:12px"><span class="ico" aria-hidden="true">!</span><span class="txt"><b>2 were not sent.</b><small>Those customers opted out of messages already. Nothing was sent to them and nothing was lost.</small></span><span class="tail"><button class="btn sm">Show the 2</button></span></div>`}
  ${section(
    "",
    `<table class="dt dense">
      <thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col">Result</th></tr></thead>
      <tbody>
        ${[
          ["SO-1042", ORDER.customer, "Sent", "positive"],
          ["SO-1041", "Tom Becker", "Sent", "positive"],
          ["SO-1039", ORDER.customer, "Sent", "positive"],
          ["SO-1040", "Elin Lindqvist", "Not sent, opted out", "destructive"],
          ["SO-1037", "Tom Becker", "Not sent, opted out", "destructive"],
        ]
          .map(([no, who, res, tone]) => `<tr><td><span class="code">${no}</span></td><td>${who}</td><td>${badgeRaw(res, tone, "outline")}</td></tr>`)
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
          name: "No message, because the record says it",
          rationale:
            "The lightest answer: the command runs and the thing it changed is visibly different. Nothing announces anything, so there is nothing to read twice.",
          tradeoff:
            "Fails WCAG 4.1.3 unless the change is exposed as a status. A screen reader user gets no signal that the command worked.",
          reference: "WCAG",
          html: shell(
            "Pause ordering",
            `<div class="page fs-page">
  ${trail("Home", "Products", PRODUCT.name)}
  <div class="phead">
    <div><h1>Oak desk lamp ${badgeRaw("Paused", "caution")}</h1><p class="desc">Paused 8 Oct 2026, 14:22. Nothing can be ordered at this price.</p></div>
    <div class="acts"><button class="btn primary">List it again</button></div>
  </div>
  ${section("The product", facts([["Ordered", "412 of 500"], ["Price", MONEY.lamp], ["State", "Paused"], ["Paused", "8 Oct 2026, 14:22, by Alex Morgan"]]))}
</div>`,
            "Products",
          ),
        },
        {
          name: "A success and a next step, where the flow is not finished",
          rationale:
            "Where a command succeeded and the work is not done, the success names what is left rather than pretending it is finished. The listed product that still has no dispatch plan is the case.",
          tradeoff:
            "It sits between a success and a checklist, so it needs its own place. The outcome page is the shape that already claims this.",
          html: shell(
            "Product listed",
            `<div class="page fs-page" style="max-width:600px">
  ${trail("Home", "Products", PRODUCT.name, "List")}
  <div class="phead"><div><h1>${PRODUCT.name} is listed</h1><p class="desc">Listed 8 Oct 2026, 14:22. The store shows it now.</p></div></div>
  ${section(
    "Two things this product still needs",
    `<div class="alist">
      <div class="arow"><span class="why" aria-hidden="true">◷</span><span class="txt"><b>No dispatch plan</b><small>Nothing can ship until there is a warehouse and one carrier.</small></span><span class="go"><button class="btn sm primary">Set dispatch up</button></span></div>
      <div class="arow"><span class="why" aria-hidden="true">◈</span><span class="txt"><b>Warehouse not told</b><small>${PEOPLE.warehouse.name} has no pick list for this week.</small></span><span class="go"><button class="btn sm">Send the pick list</button></span></div>
    </div>`,
    { desc: "Listed does not mean ready. Nothing can ship without a dispatch plan." },
  )}
  <div class="btnrow end" style="margin-top:14px"><button class="btn primary">Open ${PRODUCT.name}</button></div>
</div>`,
            "Products",
          ),
        },
        {
          name: "A toast with Undo, for a change that can be taken back",
          rationale:
            "Gmail and Linear confirm a reversible change with a toast that carries Undo. The list already shows the change; the toast adds the one thing the page cannot, a way back for a few seconds.",
          tradeoff:
            "Never for money, access or stock, which cannot be taken back quietly. Undo also needs the command to be truly reversible on the server, not hidden on the client.",
          reference: "Gmail, Linear",
          html: shell(
            "Products",
            `<div class="page fs-page" style="min-height:420px">
  ${phead("Products", "Oak desk lamp and the gift box.", '<button class="btn primary">New product</button>', { crumb: trail("Home", "Products") })}
  ${section(
    "",
    `<div class="rlist">
      ${recordRow({ title: "Oak desk lamp", sub: `${MONEY.lamp} · 412 in stock`, state: { label: "Active", tone: "positive" } })}
      ${recordRow({ title: "Gift box, standard", sub: "EUR 30.00 · 120 in stock", state: { label: "Hidden from the store", tone: "neutral" } })}
    </div>`,
  )}
  <div style="position:absolute;right:32px;bottom:32px;max-width:calc(100% - 64px)">${toast("positive", "Gift box, standard is hidden from the store.", { undo: true })}</div>
</div>`,
            "Products",
          ),
        },
        {
          name: "Saved, said quietly beside the button",
          rationale:
            "Stripe's settings and Notion's pages say 'Saved' beside the control, with the time, and nothing else moves. A settings form is the case: the values on screen are already the evidence.",
          tradeoff:
            "Easy to miss, and a screen reader hears it only if it is a live status. It suits settings and not a command that changes money.",
          reference: "Stripe, Notion",
          html: shell(
            "Company",
            `<div class="page fs-page" style="max-width:640px">
  ${phead("Company", "What customers and your invoices show.", "", { crumb: trail("Home", "Settings", "Company") })}
  ${section(
    "",
    `<div class="form">
      ${field("Name", input(COMPANY.name), { required: true })}
      ${field("Email for customers", input(COMPANY.email), { help: "Shown on every invoice and receipt." })}
      ${field("Phone", input(COMPANY.phone), { optional: true })}
      <div class="btnrow end" style="border-top:1px solid var(--border);padding-top:12px"><span class="fs-saved" role="status">Saved at 14:22</span><button class="btn primary" disabled>Save</button></div>
    </div>`,
  )}
</div>`,
            "Settings",
          ),
        },
      ],
    },
    {
      id: "state-alert",
      title: "A fact somebody has to read before acting",
      why: "The content rule: <b>a static notice is a status; only a command result is an alert</b>. A tone may paint the object in that state and never a full-width band on a page about other work.",
      verdict:
        "The pick stays on A: one neutral sentence above the page, with no tone and no band. It says why the page is what it is and stays out of the work. Runner-up is the fact beside the record in its side column, which suits an order page where the refund window changes what the reader does next. Never ship a full-width toned band for a fact about one record: the rule refuses it, and a banner stays for facts that hold on every page, such as Sandbox.",
      variants: [
        {
          name: "A neutral notice above the page",
          pick: true,
          rationale:
            "One neutral sentence about this page, above the sections: not a band and not a tone. It says why the page is what it is.",
          tradeoff:
            "It sits above the sections, so it is the first thing and the last thing read. A long notice pushes the work down on every visit.",
          html: shell(
            "Product",
            `<div class="page fs-page">
  ${trail("Home", "Products", PRODUCT.name)}
  <div class="phead">
    <div><h1>${PRODUCT.name} ${badgeRaw("Active", "positive")}</h1><p class="desc">SKU ${PRODUCT.sku} · ${PRODUCT.warehouse}</p></div>
    <div class="acts"><button class="btn sm">Pause ordering</button><button class="btn primary">Add a price tier</button></div>
  </div>
  <div class="alert plain"><span class="txt"><b>Stock is nearly gone.</b><small>588 units left of 10,000. At the pace of the last seven days, the rest sells in about four days.</small></span></div>
  ${section("Stock", `<div class="stack sm"><div class="split"><span><b>9,412 ordered</b><span class="sub">of 10,000 units</span></span><span class="fig">588 left</span></div>${progress(94)}</div>`)}
</div>`,
            "Products",
          ),
        },
        {
          name: "The notice inside the section it is about",
          rationale:
            "A fact about one section goes in that section, not at the top of the page. The reader only meets it where it changes what they do.",
          tradeoff:
            "The reader has to open the section to learn something that may change whether they should be in the section at all.",
          html: shell(
            "Refunds",
            `<div class="page fs-page">
  ${phead("Refunds", "31 orders to decide.", "", { crumb: trail("Home", "Orders", "Refunds") })}
  ${section(
    "Outside the refund window",
    `${`<div class="alert destructive" style="margin-bottom:11px"><span class="ico" aria-hidden="true">✕</span><span class="txt"><b>12 of these cannot be refunded.</b><small>This payment method takes a refund only within 180 days of the payment. The oldest is 214 days old.</small></span></div>`}
    <div class="rlist">
      ${recordRow({ title: "SO-1040", sub: "Elin Lindqvist · asked 214 days ago", state: { label: "No route", tone: "destructive" }, fig: MONEY.refund, actions: '<button class="btn sm">Offer credit</button>', lead: "destructive" })}
      ${recordRow({ title: "SO-1038", sub: "Ade Okafor · asked 181 days ago", state: { label: "No route", tone: "destructive" }, fig: MONEY.refund, actions: '<button class="btn sm">Offer credit</button>', lead: "destructive" })}
    </div>`,
    { acts: '<span class="badge destructive">12</span>' },
  )}
  ${section(
    "Inside the window",
    `<div class="rlist">
      ${recordRow({ title: "SO-1041", sub: "Tom Becker · asked 5 days ago", state: { label: "Open", tone: "neutral" }, fig: MONEY.refund, actions: '<button class="btn sm">Refund</button>' })}
      ${recordRow({ title: "SO-1042", sub: `${ORDER.customer} · asked 6 days ago`, state: { label: "Open", tone: "neutral" }, fig: MONEY.refund, actions: '<button class="btn sm">Refund</button>' })}
    </div>`,
    { desc: "These 19 the bank will take.", acts: '<span class="badge">19</span>' },
  )}
</div>`,
            "Orders",
          ),
        },
        {
          name: "A callout inside a form, about what the form will do",
          rationale:
            "A callout inside the field group, in words, before the command runs. This is the position-neutral form of the same rule and it is the one that keeps a tone off a page.",
          tradeoff:
            "A callout inside a form is a paragraph among fields, and it is the least visible of the alert shapes. It is also the one a reader reads before committing rather than after.",
          html: shell(
            "Delivery fee",
            `<div class="page fs-page" style="max-width:560px">
  ${trail("Home", "Settings", "Delivery fee")}
  <div class="phead"><div><h1>Delivery fee</h1><p class="desc">What the customer pays on top of the order. You keep all of it.</p></div></div>
  ${section(
    "",
    `<div class="form">
      ${field("Per order, in euros", `<span class="inp-wrap" style="position:relative;display:flex;align-items:center"><span aria-hidden="true" style="position:absolute;left:9px;font-size:12.5px;color:var(--muted-foreground)">&euro;</span><input class="inp money" style="padding-left:24px" value="6.00" inputmode="decimal"></span>`, { required: true })}
      ${callout("caution", `At EUR 6.00, about 1,204 customers a month, this brings in roughly EUR 7,224 a month. It is your price, set here, and it is charged on top of the order at checkout.`)}
      <div class="hr"></div>
      <label class="check"><input type="checkbox"><span>Waive the fee for members<span class="cd">Last month that would have been EUR 310 across 62 orders.</span></span></label>
      <div class="btnrow end" style="border-top:1px solid var(--border);padding-top:12px"><button class="btn">Cancel</button><button class="btn primary">Save</button></div>
    </div>`,
  )}
</div>`,
            "Settings",
          ),
        },
        {
          name: "A hint under the field, with no tone at all",
          rationale:
            "Some facts are not worth interrupting for. A hint under the field says the same thing in a quieter register, and the reader reads it because it is where they are looking.",
          tradeoff:
            "A hint has no visual weight, so it is the first thing a reader skips. It works for a definition and not for a consequence.",
          html: shell(
            "Pricing",
            `<div class="page fs-page" style="max-width:560px">
  ${trail("Home", "Products", PRODUCT.name, "Pricing")}
  <div class="phead"><div><h1>Pricing</h1><p class="desc">What each unit costs, and what the customer pays on top.</p></div></div>
  ${section(
    "",
    `<div class="form">
      ${field("Standard price, in euros", `<span class="inp-wrap" style="position:relative;display:flex;align-items:center"><span aria-hidden="true" style="position:absolute;left:9px;font-size:12.5px;color:var(--muted-foreground)">&euro;</span><input class="inp money" style="padding-left:24px" value="45.00" inputmode="decimal"></span>`, { help: "45,00 or 45.00. Up to two decimal places.", required: true })}
      ${field("Delivery fee customers pay, in euros", `<span class="inp-wrap" style="position:relative;display:flex;align-items:center"><span aria-hidden="true" style="position:absolute;left:9px;font-size:12.5px;color:var(--muted-foreground)">&euro;</span><input class="inp money" style="padding-left:24px" value="5.00" inputmode="decimal"></span>`, { optional: true, help: "Added at checkout, not taken from your order money. You keep it." })}
      <div class="hint">A price already charged is kept, not changed. Only the units still listed can be priced differently.</div>
      <div class="btnrow end" style="border-top:1px solid var(--border);padding-top:12px"><button class="btn primary">Save</button></div>
    </div>`,
  )}
</div>`,
            "Products",
          ),
        },
        {
          name: "A tool tip on the word that carries the fact",
          rationale:
            "A term hint beside a heading or a table note, where the term is the product's and the glossary entry explains it. Nothing is interrupted.",
          tradeoff:
            "Only for a term that is genuinely the product's and genuinely unclear. On any other word it is noise, and every term needs a glossary entry to keep in step.",
          html: shell(
            "Plan",
            `<div class="page fs-page" style="max-width:600px">
  ${trail("Home", "Settings", "Plan")}
  <div class="phead"><div><h1>What the plan costs</h1><p class="desc">Every charge on an account, and what it is for.</p></div></div>
  ${section(
    "",
    `<div class="stmt">
      <div class="line"><span>Business plan<span class="sub">September 2026</span></span><span class="fig">${MONEY.subscription}</span></div>
      <div class="line">
        <span style="display:inline-flex;align-items:center;gap:6px">Per-order fee<button class="fs-term" aria-describedby="fs-term-tip">?</button></span>
        <span class="fig">EUR 301.00</span>
      </div>
      <div class="sub-total"><span>Invoiced to Acme Supply for September</span><span class="fig">EUR 350.00</span></div>
    </div>
    <div class="tip" id="fs-term-tip" role="tooltip" style="margin:8px 0 0 auto;max-width:300px">A per-order fee is what the plan charges Acme Supply for each order placed: EUR 0.25 on 1,204 orders. Customers never pay it.</div>`,
  )}
</div>`,
            "Settings",
          ),
        },
        {
          name: "The fact as the heading, instead of an alert",
          rationale:
            "Where the fact is what the page is for, it is the heading and description rather than an alert. No second thing to read, and the page title says the same thing.",
          tradeoff:
            "The heading cannot carry a tone, so severity has nowhere to go. And the description is one line, which is not much room for a consequence.",
          html: shell(
            "Cancel the delivery",
            `<div class="page fs-page" style="max-width:600px">
  ${trail("Home", "Orders", "Garcia Interiors restock", "Cancel")}
  <div class="phead"><div><h1>Cancel Garcia Interiors restock?</h1><p class="desc">Sat 14 Mar, 08:00 to 12:00 · Amsterdam warehouse. 1,204 units are booked on it.</p></div></div>
  ${section(
    "",
    `<div class="stack sm" style="font-size:12.5px">
      <div><b>EUR 54,180.00</b> will be refunded, on the payment each customer used.</div>
      <div>Every customer gets a message saying the delivery is off and their money is coming back.</div>
      <div>Two people on the dispatch plan are told to stand down.</div>
      <div>The delivery keeps its record. It can be read in June and it says what happened.</div>
    </div>`,
    { desc: "This cannot be undone. There is no way to bring a delivery back once it is cancelled." },
  )}
  <div class="btnrow end" style="margin-top:16px"><button class="btn">Go back and keep it</button><button class="btn danger">Yes, cancel it</button></div>
</div>`,
            "Orders",
          ),
        },
        {
          name: "The shipped Banner, for a fact about the whole console",
          rationale:
            "A banner in GitHub's and Stripe's test-mode shape: one centred sentence across the top of every page, for a fact that holds on all of them. Sandbox is the case it exists for, in the info tone.",
          tradeoff:
            "A band is the loudest place on the screen. Used for a fact about one product it breaks the rule above, so it needs a short list of what may go there.",
          reference: "GitHub, Stripe",
          html: fsShellBanner(
            "info",
            "Sandbox, nothing is charged",
            "Products",
            `<div class="page fs-page">
  ${phead("Products", "Every product Acme Supply sells, newest first.", '<button class="btn primary">New product</button>', { crumb: trail("Home", "Products") })}
  ${section(
    "",
    `<div class="rlist">
      ${recordRow({ title: PRODUCT.name, sub: `SKU ${PRODUCT.sku} · ${PRODUCT.price}`, state: { label: "Active", tone: "positive" }, fig: "412", figSub: "in stock" })}
      ${recordRow({ title: "Gift box, standard", sub: "SKU GBX-STD-02 · EUR 30.00", state: { label: "Active", tone: "positive" }, fig: "120", figSub: "in stock" })}
    </div>`,
  )}
</div>`,
            "Products",
          ),
        },
        {
          name: "The fact beside the record, in its side column",
          rationale:
            "Stripe's payment page puts risk and dispute facts in a right-hand column beside the payment, and GitHub does the same for a pull request. The fact is next to the record it is about, and the main column stays for the work.",
          tradeoff:
            "A side column drops below the record on a phone, so the fact is read last there. It needs a heading that says why it is there.",
          reference: "Stripe, GitHub",
          html: shell(
            "Order",
            `<div class="page fs-page">
  ${phead(`${ORDER.number} ${badgeRaw("Paid", "positive")}`, `${ORDER.customer} · ${ORDER.company}`, '<button class="btn">Resend the invoice</button><button class="btn subtle-danger">Refund</button>', { crumb: trail("Home", "Orders", ORDER.number) })}
  <div class="fs-cols">
    ${section("The money", fsOrderMoney())}
    ${section(
      "Before you refund",
      `<div class="stack sm" style="font-size:12.5px">
        <div class="callout caution">The refund window closes on 6 Apr 2027, 180 days after the payment.</div>
        <div class="muted" style="font-size:11.5px">After that, Acme Supply can still offer credit or record a bank transfer.</div>
      </div>`,
    )}
  </div>
</div>`,
            "Orders",
          ),
        },
      ],
    },
    {
      id: "state-not-permitted",
      title: "The reader may not do this",
      why: "A page its role cannot use shows it <b>with the reason and the grant that helps</b>. A back office with several roles meets this state on most pages, so it needs one shape.",
      verdict:
        "The pick stays on A: the explained action, with each refused command naming the role that can do it and the record staying readable. At the pickup counter, reading the record is the point. Runner-up is the read-only section with values as text, which suits a settings page where a form that fails on Save would be worse. Never ship the whole page refused for a warehouse lead: hiding a customer name they need to answer a question at the counter costs more than the secrecy is worth.",
      variants: [
        {
          name: "The commands are refused, each with its grant named",
          pick: true,
          rationale:
            "The explained action: the button is refused and the reason is visible text beside it, naming the role that can. The record stays readable, which at the counter is the point.",
          tradeoff:
            "A page of refused commands looks broken to somebody who does not know their role. The role's name in the reason is what makes it legible.",
          html: shell(
            "Order",
            `<div class="page fs-page">
  ${trail("Home", "Orders", ORDER.number)}
  <div class="phead">
    <div><h1>${ORDER.number} ${badgeRaw("Paid", "positive")}</h1><p class="desc">${ORDER.customer} · ${ORDER.company}</p></div>
    <div class="acts">
      <div class="explained" style="align-items:flex-end">
        <button class="btn" aria-disabled="true">Message the customer</button>
        <span class="why">You are ${PEOPLE.warehouse.name}, warehouse lead. Support and Owners can message a customer.</span>
      </div>
    </div>
  </div>
  ${section(
    "Refunds",
    `<div class="explained">
      <button class="btn subtle-danger" aria-disabled="true">Refund this order</button>
      <span class="why">A refund moves ${MONEY.order}, so only Finance and Owners can issue one.</span>
    </div>`,
    { desc: "Paid in full on 8 Oct 2026. Nothing refunded." },
  )}
  ${section("The customer", facts([["Name", ORDER.customer], ["Email", ORDER.email], ["Country", "Netherlands"]]))}
</div>`,
            "Orders",
          ),
        },
        {
          name: "The page itself is refused",
          rationale:
            "The whole page is out of reach. A not-permitted state replaces the body with the reason and the grant, and nothing of the record is shown.",
          tradeoff:
            "Nothing at all is shown, so a warehouse lead cannot read a customer name to answer a question at the counter. That is a real cost on the surface where names matter.",
          html: shell(
            "Invoices",
            `<div class="page fs-page">
  ${trail("Home", "Invoices", "Statements")}
  ${section(
    "",
    emptyState(
      "Statements are not visible to your role",
      `You are ${PEOPLE.warehouse.name}, warehouse lead. Settlements concern money, so they are readable by Finance and Owners.`,
      '<button class="btn">Open the warehouse records instead</button>',
      "⚠",
    ),
  )}
</div>`,
            "Invoices",
          ),
        },
        {
          name: "The tab is absent, so the reader never sees the gap",
          rationale:
            "A tab, sidebar entry or link appears only for a viewer who may open its page. Invoices, Reports and the money pages are simply not in a warehouse lead's sidebar.",
          tradeoff:
            "The reader cannot find out the capability exists. On a surface where someone is guessing at what the product can do, that is a real cost.",
          html: shell(
            "Warehouse lead sidebar",
            `<div class="page fs-page" style="display:grid;grid-template-columns:176px minmax(0,1fr);gap:16px;align-items:start">
  <nav class="stack sm" style="font-size:12.5px">
    <a href="#" style="text-decoration:none;color:var(--foreground)">Today</a>
    <a href="#" style="text-decoration:none;color:var(--foreground)">Pick lists</a>
    <a href="#" aria-current="page" style="text-decoration:none;font-weight:600;background:var(--muted);border-radius:5px;padding:4px 7px;margin:0 -7px">Dispatch records</a>
    <a href="#" style="text-decoration:none;color:var(--foreground)">My shifts</a>
    <hr class="hr" style="margin:8px 0">
    <span style="font-size:11px;color:var(--muted-foreground);padding-left:7px">You cannot see</span>
    <span style="font-size:11.5px;color:var(--muted-foreground);padding-left:7px">Invoices, Reports and the money on any order. Ask an owner if you need it.</span>
  </nav>
  <div>
    <div class="phead"><div><h1>Dispatch records</h1><p class="desc">What the warehouse has dispatched today, newest first.</p></div></div>
    ${section(
      "",
      `<div class="rlist">
        ${[
          ["SO-1042", "Picked, dock A", "09:41", PEOPLE.warehouse.name],
          ["SO-1041", "Picked, dock A", "09:38", PEOPLE.warehouse.name],
          ["SO-1040", "Packed, dock B", "09:35", PEOPLE.warehouse.name],
          ["Refused, no slip", "Collection without a slip", "09:41", PEOPLE.warehouse.name],
        ]
          .map(([who, what, when, by]) => recordRow({ title: who, sub: `${what} · ${by}`, fig: when }))
          .join("")}
      </div>`,
      { flush: false },
    )}
  </div>
</div>`,
            "Orders",
          ),
        },
        {
          name: "A banner naming what this role cannot do, once",
          rationale:
            "One neutral band on the area says what the role may not do there, rather than a refused button beside every command. Stated once, in words, at the top.",
          tradeoff:
            "It repeats on every page of the area, and the reader's eye skips it after the first. A tone may not paint a full-width band on a page about other work.",
          html: shell(
            "Invoices",
            `<div class="page fs-page">
  ${`<div class="alert plain" style="margin:-16px -16px 16px;border-radius:0;border-left:0;border-right:0;border-top:0"><span class="txt"><b>Read-only for ${PEOPLE.support.name}, support.</b><small>You can read disputes and statements. Answering a bank case, refunding an order and issuing a credit need the Finance role.</small></span></div>`}
  ${phead("Disputes", "5 open. The nearest closes in 19 days.", "", { crumb: trail("Home", "Invoices", "Disputes") })}
  ${section(
    "",
    `<table class="dt">
      <thead><tr><th scope="col">Case</th><th scope="col">Order</th><th scope="col" class="num">Amount</th><th scope="col">Closes</th><th scope="col" style="width:1%"></th></tr></thead>
      <tbody>
        ${[
          ["D-0182", "SO-1037", MONEY.lamp, "19 days"],
          ["D-0179", "SO-1038", MONEY.lamp, "12 days"],
          ["D-0171", "SO-1040", "EUR 64.50", "31 days"],
        ]
          .map(([c, o, amt, left]) => `<tr><td><span class="code">${c}</span></td><td><span class="code">${o}</span></td><td class="num">${amt}</td><td>${left}</td><td class="num"><div class="explained" style="align-items:flex-end"><button class="btn sm" aria-disabled="true">Answer</button></div></td></tr>`)
          .join("")}
      </tbody>
    </table>`,
    { flush: true },
  )}
</div>`,
            "Invoices",
          ),
        },
        {
          name: "The names are hidden, the figures are not",
          rationale:
            "Where the record itself is sensitive but its shape is not, the customer is withheld and the money is shown. A finance reader gets the reconciliation without the personal data.",
          tradeoff:
            "A screen reader reads whatever is in the DOM, so anything hidden this way has to actually be absent rather than blurred. Blur alone is not a boundary.",
          html: shell(
            "Statements",
            `<div class="page fs-page" style="max-width:600px">
  ${trail("Home", "Invoices", "Statements", "September 2026")}
  <div class="phead"><div><h1>September 2026</h1><p class="desc">Every euro of the month under the kind it is.</p></div></div>
  ${`<div class="alert plain" style="margin-bottom:14px"><span class="txt"><b>Customer names are hidden for your role.</b><small>You can see the reconciliation and every amount. Support, Finance and Owners can see who paid.</small></span></div>`}
  ${section(
    "",
    `<div class="stmt">
      <div class="line"><span>Order sales<span class="sub">1,204 orders</span></span><span class="fig">EUR 54,180.00</span></div>
      <div class="line"><span>Delivery fees customers paid<span class="sub">1,204 orders</span></span><span class="fig">EUR 6,020.00</span></div>
      <div class="line"><span>Accessories<span class="sub">126 units</span></span><span class="fig">EUR 3,150.00</span></div>
      <div class="sub-total"><span>Total income</span><span class="fig">EUR 63,350.00</span></div>
      <div class="line"><span>The processor's fee<span class="sub">On 1,204 payments, charged by the processor</span></span><span class="fig">EUR -1,203.65</span></div>
      <div class="sub-total"><span>Total costs</span><span class="fig">EUR -1,203.65</span></div>
      <div class="grand"><span>Net for Acme Supply</span><span class="fig">EUR 62,146.35</span></div>
    </div>`,
  )}
</div>`,
            "Invoices",
          ),
        },
        {
          name: "The role is named in the refusal, and the way to change it",
          rationale:
            "The refusal says which role the reader has, which role would be needed, and offers the command that asks for it. Everything a reader can be told without a support call.",
          tradeoff:
            "A request that reaches an owner is a message somebody reads, and a busy owner ignores it. It should not be the only route, so the page has to stay useful read-only.",
          html: shell(
            "Refunds",
            `<div class="page fs-page">
  ${trail("Home", "Orders", "Refunds")}
  <div class="phead">
    <div><h1>Refunds ${badgeRaw("Read only", "neutral")}</h1><p class="desc">31 orders to decide. You are ${PEOPLE.warehouse.name}, warehouse lead.</p></div>
    <div class="acts"><button class="btn sm">Ask an owner for the finance role</button></div>
  </div>
  ${section(
    "",
    `<div class="rlist">
      ${[
        ["SO-1040", "Elin Lindqvist", "214 days ago", "No route", "destructive", MONEY.refund],
        ["SO-1038", "Ade Okafor", "181 days ago", "No route", "destructive", MONEY.refund],
        ["SO-1041", "Tom Becker", "5 days ago", "Open", "neutral", MONEY.refund],
        ["SO-1042", ORDER.customer, "6 days ago", "Open", "neutral", MONEY.refund],
      ]
        .map(([no, who, when, st, tone, amt]) => `<div class="rrow">
        <span class="txt"><b><span class="code">${no}</span> · ${who}</b><small>Asked ${when}</small></span>
        ${badgeRaw(st, tone, "outline")}
        <span class="fig">${amt}</span>
        <span class="acts"><div class="explained"><button class="btn sm subtle-danger" aria-disabled="true">Refund</button><span class="why">Finance only</span></div></span>
      </div>`)
        .join("")}
    </div>`,
    { desc: "The Finance role on Acme Supply would let you refund. Sam Rivera, the owner, can grant it." },
  )}
</div>`,
            "Orders",
          ),
        },
        {
          name: "The page refused, with a request sent to a named person",
          rationale:
            "Google Drive's 'You need access' page: the reader asks for access in place, with a short message, and the request goes to a named person rather than to 'an administrator'.",
          tradeoff:
            "A request is a message an owner must answer, so it needs a place in the owner's queue. Without that it is a button that leads nowhere.",
          reference: "Google Drive",
          html: shell(
            "Statements",
            `<div class="page fs-page">
  ${trail("Home", "Invoices", "Statements")}
  <div class="fs-outcome" style="margin:24px auto">
    <span class="fs-mark" aria-hidden="true">⚿</span>
    <h1>You need the Finance role for statements</h1>
    <p>You are ${PEOPLE.warehouse.name}, warehouse lead. Statements show money, so Finance and Owners can open them.</p>
    <div class="fs-card">
      ${field("Ask Sam Rivera, the owner", '<textarea class="ta" style="min-height:64px">I need to check the September statement for the warehouse float.</textarea>', { optional: true })}
      <div class="btnrow end"><button class="btn primary">Send the request</button></div>
    </div>
  </div>
</div>`,
            "Invoices",
          ),
        },
        {
          name: "A read-only section: values as text, one line saying why",
          rationale:
            "Stripe's settings for a role that may read but not change them: the fields become plain values, and one line at the top of the section names the role that can edit. Nothing looks like a form that fails on Save.",
          tradeoff:
            "The page looks different for different roles, so a support call about it has to start with which role the caller has.",
          reference: "Stripe",
          html: shell(
            "Delivery fee",
            `<div class="page fs-page" style="max-width:640px">
  ${phead("Delivery fee", "What the customer pays on top of the order. Acme Supply keeps all of it.", "", { crumb: trail("Home", "Settings", "Delivery fee") })}
  ${section(
    "",
    `<div class="stack">
      <div class="note tight" style="display:flex;gap:8px;align-items:center"><span aria-hidden="true">⚿</span>Only Finance and Owners can change the delivery fee. You are ${PEOPLE.manager.name}, operations manager.</div>
      ${facts([["Per order", MONEY.shipping], ["Charged on", "Store orders"], ["Last changed", "2 Sep 2026, by Priya Shah"]], { stacked: true })}
    </div>`,
  )}
</div>`,
            "Settings",
          ),
        },
      ],
    },
    {
      id: "state-offline",
      title: "The connection is gone",
      why: "The warehouse desk has to work without a connection, which means the back office's counterpart is a <b>stale</b> page. Nothing here shows how fresh its data is, so these options decide what a stale page says.",
      verdict:
        "The pick stays on A: one band saying what is stale, when it was read, and what still works. A stale page the reader can read beats a page that refuses to show anything. Runner-up is the problem state for a failed read, which suits a page that has nothing to show because the read itself failed. Never ship a queued refund as a quiet default: a refund nobody has confirmed is a liability, and the page must say plainly that the money has not moved.",
      variants: [
        {
          name: "A banner saying what is stale and what still works",
          pick: true,
          rationale:
            "A neutral band naming when the page last read and which commands are refused while it is offline. The reader can still read, and knows it.",
          tradeoff:
            "Every page needs a last-read time and a notion of which commands are safe offline. Commands that change money almost never are.",
          html: shell(
            "Orders",
            `<div class="page fs-page">
  ${`<div class="alert plain" style="margin:-16px -16px 16px;border-radius:0;border-left:0;border-right:0;border-top:0"><span class="txt"><b>No connection to the server.</b><small>What you see was read 4 minutes ago. You can read and export. Nothing you do here will reach the server.</small></span><span class="tail"><button class="btn sm">Try again</button></span></div>`}
  ${phead("Orders", "268 orders. Read 4 minutes ago.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order number, name or email", right: '<button class="btn sm">Export</button>' })}
  ${section(
    "",
    `<table class="dt" style="opacity:.72">
      <thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col">Placed</th><th scope="col">State</th><th scope="col" class="num">Paid</th><th scope="col" style="width:1%"></th></tr></thead>
      <tbody>
        ${[
          ["SO-1042", ORDER.customer, "8 Oct 09:32", "Paid", "positive", MONEY.order],
          ["SO-1041", "Tom Becker", "8 Oct 09:20", "Paid", "positive", "EUR 310.00"],
          ["SO-1039", ORDER.customer, "7 Oct 17:12", "Shipped", "positive", MONEY.lamp],
        ]
          .map(([no, who, when, st, tone, amt]) => `<tr><td><span class="code">${no}</span></td><td>${who}</td><td class="nowrap">${when}</td><td>${badgeRaw(st, tone, "outline")}</td><td class="num">${amt}</td><td class="num"><div class="explained"><button class="btn xs" aria-disabled="true">Open</button></div></td></tr>`)
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
          name: "Read-only, with every command refused and why",
          rationale:
            "Every command refused with the same reason in words. Unambiguous, and a page of refusals that all say the same thing is noisy.",
          tradeoff:
            "A reader on a train sees a page they cannot use. It is honest and it is still frustrating, and the frustration is not information the page can carry.",
          html: shell(
            "Order",
            `<div class="page fs-page" style="max-width:600px">
  ${trail("Home", "Orders", ORDER.number)}
  ${`<div class="alert destructive" style="margin-bottom:14px"><span class="ico" aria-hidden="true">✕</span><span class="txt"><b>Nothing here will reach the server.</b><small>The connection dropped 4 minutes ago. Refunding, resending and messaging all need the server.</small></span><span class="tail"><button class="btn sm">Try again</button></span></div>`}
  <div class="phead">
    <div><h1>${ORDER.number} ${badgeRaw("Paid", "positive")}</h1><p class="desc">${ORDER.customer} · ${ORDER.company}</p></div>
    <div class="acts"><div class="explained" style="align-items:flex-end"><button class="btn primary" aria-disabled="true">Message customer</button><span class="why">Needs the connection back.</span></div></div>
  </div>
  ${section("The customer", facts([["Name", ORDER.customer], ["Email", ORDER.email], ["Paid", MONEY.order]]))}
</div>`,
            "Orders",
          ),
        },
        {
          name: "A queued command, so the reader does not lose the work",
          rationale:
            "A command the reader wants is held and shown as pending, with what it will do when the connection returns and a way to drop it. Nothing is lost, and nothing is claimed to have happened.",
          tradeoff:
            "A queued refund is a refund nobody has confirmed, and a queue of them is a liability. The page has to say plainly that the money has not moved.",
          html: shell(
            "Queued",
            `<div class="page fs-page" style="max-width:600px">
  ${trail("Home", "Orders", ORDER.number)}
  <div class="phead">
    <div><h1>${ORDER.number} ${badgeRaw("Paid", "positive")}</h1><p class="desc">${ORDER.customer} · ${ORDER.company}</p></div>
  </div>
  ${`<div class="alert plain" style="margin-bottom:14px"><span class="txt"><b>No connection. Two commands are waiting.</b><small>They have not happened. Nothing has reached the server, no money has moved, and the customer has not been told.</small></span><span class="tail"><button class="btn sm">Try again</button></span></div>`}
  ${section(
    "Waiting to be sent",
    `<div class="rlist">
      ${recordRow({ title: `Refund ${MONEY.refund}`, sub: "Wanted at 11:02. The customer will be told when it goes.", fig: "Waiting", figSub: "not sent", actions: '<button class="btn sm subtle-danger">Drop it</button>' })}
      ${recordRow({ title: "Resend the invoice", sub: "Wanted at 11:04", fig: "Waiting", figSub: "not sent", actions: '<button class="btn sm subtle-danger">Drop it</button>' })}
    </div>`,
    { desc: "Held in this browser only. Clearing it loses them." },
  )}
  ${section("What is already true", `<div class="stmt">
      <div class="line"><span>Paid by the customer</span><span class="fig">${MONEY.order}</span></div>
      <div class="line"><span>Refunded</span><span class="fig">Nothing yet</span></div>
    </div>`, { desc: "The money has not moved. The order is exactly as it was at 09:34." })}
</div>`,
            "Orders",
          ),
        },
        {
          name: "A connection control in the header, always present",
          rationale:
            "The connection is a fact about the session rather than about a page, so it lives in the header and holds on every page. A refresh control already exists for the queue's version of this.",
          tradeoff:
            "A second status in a header that already carries the theme and the language. And a header-level indicator is easy to learn and then ignore.",
          html: fsShellBar(
            "Orders",
            `<span class="badge caution"><span class="dot"></span>Offline</span><span class="fs-dim">Read 4 min ago</span>`,
            `<div class="page fs-page">
      ${phead("Orders", "268 orders. Read 4 minutes ago.", "", { crumb: trail("Home", "Orders") })}
      ${section(
        "",
        `<table class="dt"><thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col">State</th><th scope="col" class="num">Paid</th></tr></thead><tbody>
          ${[
            ["SO-1042", ORDER.customer, "Paid", "positive", MONEY.order],
            ["SO-1041", "Tom Becker", "Paid", "positive", "EUR 310.00"],
            ["SO-1038", "Ade Okafor", "Paid", "positive", MONEY.lamp],
          ].map(([no, who, st, tone, amt]) => `<tr><td><span class="code">${no}</span></td><td>${who}</td><td>${badgeRaw(st, tone, "outline")}</td><td class="num">${amt}</td></tr>`).join("")}
        </tbody></table>`,
        { flush: true },
      )}
    </div>`,
            "Orders",
          ),
        },
        {
          name: "Nothing shown, because a stale page is a dangerous one",
          rationale:
            "Where the reader is about to act on money, a stale page is refused outright. The page says so and offers one thing: try again.",
          tradeoff:
            "A reader who needs to answer a question at the counter gets nothing. The printed pick list exists precisely because the counter cannot refuse, which is why the two surfaces answer this differently.",
          html: shell(
            "Stale",
            `<div class="page fs-page">
  ${trail("Home", "Orders", ORDER.number)}
  <div class="phead"><div><h1>${ORDER.number}</h1></div></div>
  ${section(
    "",
    emptyState(
      "This page cannot be shown",
      "It was read 11 minutes ago and the connection has been down since. Acting on an amount that old could move the wrong money, so the back office will not show it.",
      '<button class="btn primary">Try again</button>',
      "⚠",
    ),
  )}
</div>`,
            "Orders",
          ),
        },
        {
          name: "The staleness stated on the values themselves",
          rationale:
            "Each figure that could have moved carries when it was last true, so a reader comparing two rows sees which is fresher rather than assuming both are current.",
          tradeoff:
            "A timestamp on every money cell makes a table unreadable. It works on a page with two or three figures and not on a list.",
          html: shell(
            "Money",
            `<div class="page fs-page" style="max-width:600px">
  ${trail("Home", "Invoices", "Statements", "September 2026")}
  <div class="phead"><div><h1>September 2026</h1><p class="desc">Every euro of the month under the kind it is.</p></div></div>
  ${`<div class="alert plain" style="margin-bottom:14px"><span class="txt"><b>Read 11 minutes ago.</b><small>Each figure says when it was last true. A refund issued since then is not in these numbers.</small></span></div>`}
  ${section(
    "",
    `<div class="stmt">
      <div class="line"><span>Order sales<span class="sub">true at 14:22</span></span><span class="fig">EUR 54,180.00</span></div>
      <div class="line"><span>Delivery fees customers paid<span class="sub">true at 14:22</span></span><span class="fig">EUR 6,020.00</span></div>
      <div class="line"><span>Refunds<span class="sub">true at 14:18</span></span><span class="fig">EUR -1,550.00</span></div>
      <div class="line"><span>The processor's fee<span class="sub">true at 14:22</span></span><span class="fig">EUR -1,143.80</span></div>
      <div class="sub-total"><span>Refunds and costs<span class="sub">true at 14:18</span></span><span class="fig">EUR -2,693.80</span></div>
      <div class="grand"><span>Net for Acme Supply<span class="sub">the three figures are not all from the same moment</span></span><span class="fig">EUR 57,506.20</span></div>
    </div>`,
  )}
</div>`,
            "Invoices",
          ),
        },
        {
          name: "The read fails in place: the server could not be reached",
          rationale:
            "The problem state for status 0: where a read fails because nothing answered, the section says the server could not be reached and offers Try again. Nothing claims to be current, because nothing is shown.",
          tradeoff:
            "It only appears when a read is tried. A page that loaded before the connection dropped looks normal until the reader does something.",
          html: shell(
            "Orders",
            `<div class="page fs-page">
  ${phead("Orders", "Every order, newest first.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order number, name or email" })}
  ${section(
    "",
    `<div class="empty" role="alert" style="padding:40px 20px">
      <span class="fs-mark" aria-hidden="true">⌁</span>
      <b>The server could not be reached</b>
      <p>Check the connection and try again.</p>
      <div class="btnrow"><button class="btn">Try again</button></div>
    </div>`,
  )}
</div>`,
            "Orders",
          ),
        },
        {
          name: "A small bar that retries by itself and says when",
          rationale:
            "Gmail's 'Not connected. Trying again in 8s. Try now': the page stays readable, one quiet line says it is retrying and when, and the reader can retry at once.",
          tradeoff:
            "A countdown is movement on a page the reader is trying to read. It must stop once it gives up, and it must not count down forever on a laptop that has gone to sleep.",
          reference: "Gmail",
          html: shell(
            "Orders",
            `<div class="page fs-page">
  <div class="alert caution" role="status"><span class="ico" aria-hidden="true">!</span><span class="txt"><b>Not connected. Trying again in 8 seconds.</b><small>What you see was read at 14:18. Nothing you do reaches the server until it reconnects.</small></span><span class="tail"><button class="btn sm">Try now</button></span></div>
  ${phead("Orders", "268 orders, newest first.", "", { crumb: trail("Home", "Orders") })}
  ${section("", fsOrders(4), { flush: true })}
</div>`,
            "Orders",
          ),
        },
      ],
    },
    {
      id: "fs-session-expired",
      title: "The sign-in ran out",
      why: "A session ends while the reader is working. Sign-in runs on the application's own origin, and a refused or ended session lands on <code>/signed-out</code>. The reader's unsent work is what this state must not lose.",
      verdict:
        "The pick is B: a dialog over the work, which stays where it is. It is the only option that keeps unsent work on screen and names the one thing to do. Runner-up is D, the warning before it ends, which suits a reader who is still at their desk and should never meet the expired state. Never ship F, the toast alone: the message leaves in seconds and the typed work leaves with it.",
      variants: [
        {
          name: "Signed out, on its own page",
          rationale:
            "A refused or ended session lands on /signed-out, worded by one sentence: 'Your sign-in has expired. Sign in again.' No back-office frame, because there is no session to show it to.",
          tradeoff:
            "The reader leaves their work to sign in again. Whether anything typed survives depends on the browser keeping the page, which is exactly what the other options make explicit.",
          html: `<div class="page fs-page">
  <div class="fs-outcome">
    <span class="fs-brand"><i>A</i>Acme Supply</span>
    <span class="fs-mark" aria-hidden="true">◐</span>
    <h1>You are signed out</h1>
    <p>Your sign-in has expired. Sign in again.</p>
    <div class="btnrow"><button class="btn primary">Sign in again</button></div>
    <p style="font-size:11.5px">Acme Supply · Alex Morgan, operations manager</p>
  </div>
</div>`,
        },
        {
          name: "A dialog over the work, which stays where it is",
          pick: true,
          rationale:
            "Stripe's dashboard re-authentication and Linear's session dialog: the work stays on screen behind a dialog, signing in again returns to it, and nothing typed is lost.",
          tradeoff:
            "A dialog over a form the reader cannot touch until they sign in. On a phone it fills the screen, which is acceptable because there is exactly one thing to do.",
          reference: "Stripe, Linear",
          html: shell(
            "Delivery",
            `${fsDeliveryEdit(fsDeliveryForm({ disabled: true }))}${dialog("Your sign-in has expired", `<div class="note">Sign in again. What you typed stays on this page.</div>`, { footer: '<button class="btn">Sign out</button><button class="btn primary">Sign in again</button>' })}`,
            "Orders",
          ),
        },
        {
          name: "The form says so where Save was",
          rationale:
            "Notion keeps an unsent change in place and says what blocks it beside the control. The Save button becomes the way back, so the reader's eye is already where the answer is.",
          tradeoff:
            "Only the form knows. A reader on a list page, with no Save button, meets the expiry somewhere else, so this needs a page-level sibling.",
          reference: "Notion",
          html: shell(
            "Delivery",
            `${fsDeliveryEdit(fsDeliveryForm({ footer: '<div class="btnrow end" style="border-top:1px solid var(--border);padding-top:12px"><span class="fs-dim" role="status">Not saved yet</span><button class="btn primary">Sign in again to save</button></div>' }), { before: '<div class="alert plain"><span class="txt"><b>Your sign-in has expired.</b><small>Everything you typed is still here. Sign in again and save.</small></span></div>' })}`,
            "Orders",
          ),
        },
        {
          name: "Warned before it ends",
          rationale:
            "Dutch banks and DigiD warn before a session ends, with one button to stay. The reader who is still there never meets the expired state at all.",
          tradeoff:
            "A countdown on a page the reader is trying to use. It must only appear when the reader is idle enough to need it and active enough to answer it.",
          reference: "DigiD",
          html: shell(
            "Orders",
            `<div class="page fs-page" style="min-height:420px">
  ${phead("Orders", "268 orders, newest first.", '<button class="btn">Export</button>', { crumb: trail("Home", "Orders") })}
  ${section("", fsOrders(4), { flush: true })}
  <div style="position:absolute;right:32px;bottom:32px;width:380px;max-width:calc(100% - 64px)"><div class="alert caution" role="status"><span class="ico" aria-hidden="true">!</span><span class="txt"><b>Your sign-in ends in 5 minutes.</b><small>Stay to keep working.</small></span><span class="tail"><button class="btn sm primary">Stay signed in</button></span></div></div>
</div>`,
            "Orders",
          ),
        },
        {
          name: "Refused as a command, worded by its code",
          rationale:
            "The refused-command answer applied to a session: the save is refused with the session sentence, in the same alert shape as every other refusal. One component, one dictionary, no special case.",
          tradeoff:
            "The reader learns it only when they save. An expiry discovered at Save is later than one discovered at reading, and the typed work waits longer.",
          html: shell(
            "Delivery",
            `${fsDeliveryEdit(fsDeliveryForm(), { before: '<div class="alert destructive" role="alert" data-slot="problem-alert" data-code="identity/session.expired"><span class="ico" aria-hidden="true">✕</span><span class="txt"><b>Your sign-in has expired</b><small>Sign in again.</small></span><span class="tail"><button class="btn sm primary">Sign in again</button></span></div>' })}`,
            "Orders",
          ),
        },
        {
          name: "A toast, and the typed work goes with it",
          rationale:
            "What happens with no design: the save fails, a toast says the session expired, and the toast goes in seconds. Drawn here to be refused on purpose.",
          tradeoff:
            "The message leaves and the typed notes leave with it. A reader who looked away loses work they cannot reconstruct.",
          html: shell(
            "Delivery",
            `${fsDeliveryEdit(fsDeliveryForm({ disabled: true }))}<div style="position:absolute;right:32px;bottom:32px;max-width:calc(100% - 64px)">${toast("destructive", "Your sign-in has expired. What you typed is not saved.")}</div>`,
            "Orders",
          ),
        },
      ],
    },
    {
      id: "fs-save-conflict",
      title: "Somebody else saved first",
      why: "Two people edit one record. The API refuses the second save with <code>concurrency/record.changed-elsewhere</code>, worded as 'Someone else changed this'. The reader's unsent edits are still on the page.",
      verdict:
        "The pick is A: the refusal above Save, with her value under the field. It refuses in the dictionary's words and fixes exactly what collided, without a dialog and without losing a keystroke. Runner-up is B, the field-by-field choice, which suits a record where both people changed several fields and each choice differs. Never ship F, read-only until reload: it deletes Alex's notes to resolve an arrival time.",
      variants: [
        {
          name: "The refusal above Save, with her value under the field",
          pick: true,
          rationale:
            "Linear's conflict handling: the save is refused in words, the other person's value appears under the field it beats, and each field offers one button to take hers. The reader fixes exactly what collided.",
          tradeoff:
            "Works field by field. Where both people rewrote the same long notes, one button per field is not enough and the dialog in C takes over.",
          reference: "Linear",
          html: shell(
            "Delivery",
            `${fsDeliveryEdit(fsDeliveryForm({ arrival: "07:00", arrivalNote: `<div class="fs-theirs">Priya Shah saved 08:00 at 09:34.<button class="btn">Use hers</button></div>` }), { before: `<div class="alert destructive" role="alert" data-slot="problem-alert" data-code="${REFUSALS.staleVersion.code}"><span class="ico" aria-hidden="true">✕</span><span class="txt"><b>${REFUSALS.staleVersion.title}</b><small>${REFUSALS.staleVersion.detail}</small></span></div>` })}`,
            "Orders",
          ),
        },
        {
          name: "Field by field: keep mine or use hers",
          rationale:
            "Contentful and Airtable resolve a conflict per field: each row shows both values and takes one. Nothing is reloaded wholesale, so nothing Alex typed is lost.",
          tradeoff:
            "A row per field is a second form to build and to read. Past three fields it is longer than the form it argues about.",
          reference: "Contentful, Airtable",
          html: shell(
            "Delivery",
            `<div class="page fs-page" style="max-width:640px">
  ${trail("Home", "Orders", ORDER.number, "Delivery")}
  <div class="phead"><div><h1>Two fields differ</h1><p class="desc">Priya Shah saved at 09:34. Choose one value per row, then save.</p></div></div>
  ${section(
    "",
    `<div class="stack">
      <div class="fs-diff">
        <div class="h"></div><div class="h">Yours, not saved</div><div class="h">Priya Shah's, saved 09:34</div>
        <div class="k">Arrival</div><div><b class="fs-num">07:00</b><br><button class="btn sm" style="margin-top:6px">Keep mine</button></div><div><b class="fs-num">08:00</b><br><button class="btn sm" style="margin-top:6px">Use hers</button></div>
        <div class="k">Notes</div><div>Arrival at 07:00, unloading by 11:00.<br><button class="btn sm" style="margin-top:6px">Keep mine</button></div><div>Arrival at 08:00, unloading by noon.<br><button class="btn sm" style="margin-top:6px">Use hers</button></div>
      </div>
      <div class="btnrow end" style="border-top:1px solid var(--border);padding-top:12px"><button class="btn">Back to the form</button><button class="btn primary">Save the choices</button></div>
    </div>`,
  )}
</div>`,
            "Orders",
          ),
        },
        {
          name: "A dialog with three ways out",
          rationale:
            "Dropbox and Office ask on a conflict: keep mine, take theirs, or look at both. Three buttons, no field surgery, and the dialog says whose version is whose.",
          tradeoff:
            "Whole-record choice. Alex's arrival time and his notes travel together, so he cannot keep one and take the other.",
          reference: "Dropbox, Office",
          html: shell(
            "Delivery",
            `${fsDeliveryEdit(fsDeliveryForm({ arrival: "07:00", disabled: true }))}${dialog("Someone else changed this", `<div class="stack sm"><div class="note">Priya Shah saved this delivery at 09:34, after you opened it. Your edits are still on this page.</div>${facts([["She changed", "Arrival, notes"], ["You changed", "Arrival, notes"]], { stacked: true })}</div>`, { footer: '<button class="btn">Use hers</button><button class="btn">Save mine anyway</button><button class="btn primary">Compare the two</button>', size: "fs-footwrap" })}`,
            "Orders",
          ),
        },
        {
          name: "Presence first, so the conflict never happens",
          rationale:
            "Figma and Google Docs show who else is on the record before anyone saves. Alex sees Priya's avatar on the arrival field and waits or talks, and the refusal never has to happen.",
          tradeoff:
            "Presence is a live subscription per open record, and it only helps readers who look. The API still refuses, so this is early warning, not handling.",
          reference: "Figma, Google Docs",
          html: shell(
            "Delivery",
            `${fsDeliveryEdit(fsDeliveryForm({ arrival: "07:00", arrivalNote: `<div class="fs-theirs">Priya Shah is editing arrival now.</div>` }), { before: '<div class="fs-presence"><span class="fs-av">PS</span>Priya Shah is editing this delivery too.</div>' })}`,
            "Orders",
          ),
        },
        {
          name: "Merged where you did not overlap",
          rationale:
            "Git merges what does not overlap and asks only about the rest. The dock Priya Shah fixed at 09:34 lands in Alex's form silently; only the arrival time needs a choice.",
          tradeoff:
            "Silent changes to a form the reader is editing. If Priya's dock fix surprises Alex at Save, the merge reads as tampering.",
          reference: "Git",
          html: shell(
            "Delivery",
            `${fsDeliveryEdit(fsDeliveryForm({ arrival: "07:00", arrivalNote: `<div class="fs-theirs">Priya Shah saved 08:00 at 09:34.<button class="btn">Use hers</button></div>` }), { before: '<div class="alert plain"><span class="txt"><b>One change of hers is already in this form.</b><small>Priya Shah fixed the dock at 09:34 and you had not touched it, so it is saved into your draft. Arrival still differs.</small></span></div>' })}`,
            "Orders",
          ),
        },
        {
          name: "Read-only until reload",
          rationale:
            "The banking answer: the form locks, one button reloads Priya's version, and Alex's edits are dropped. Drawn to be refused: nothing on this form is worth deleting notes over.",
          tradeoff:
            "Alex's notes are gone. A lock that deletes work teaches the reader to type notes somewhere else first.",
          html: shell(
            "Delivery",
            `${fsDeliveryEdit(fsDeliveryForm({ disabled: true }), { before: '<div class="alert destructive" role="alert"><span class="ico" aria-hidden="true">✕</span><span class="txt"><b>Someone else changed this</b><small>Priya Shah saved this delivery at 09:34. Reload her version to continue.</small></span><span class="tail"><button class="btn sm primary">Reload her version</button></span></div>' })}`,
            "Orders",
          ),
        },
      ],
    },
    {
      id: "fs-background-job",
      title: "Work that runs without you",
      why: "An import or a bulk refund runs longer than a page. The reader starts it and does other work. The job must be visible while it runs and answerable when it is done.",
      verdict:
        "The pick is A: an activity tray, like an upload panel. It stays visible on every page, it never holds the reader, and it answers progress without being asked. Runner-up is E, the job page with the failures listed, which suits a bulk refund where 2 of 31 need a person and the rest do not. Never ship F, the dialog that holds the reader: minutes of a blocked page are the cost this pattern exists to remove.",
      variants: [
        {
          name: "An activity tray, like an upload panel",
          pick: true,
          rationale:
            "Vercel, Linear, and Figma run uploads in a tray at the corner: progress while it runs, a line when it is done, and the page behind stays usable.",
          tradeoff:
            "A corner tray holds two jobs well and five badly. Past that it needs the jobs section in B, and the tray becomes its summary.",
          reference: "Vercel, Linear, Figma",
          html: shell(
            "Orders",
            `<div class="page fs-page" style="min-height:440px">
  ${phead("Orders", "268 orders, newest first.", '<button class="btn">Export</button>', { crumb: trail("Home", "Orders") })}
  ${section("", fsOrders(4), { flush: true })}
  <div class="fs-tray" role="status">
    <header>Background work<span class="fs-dim">1 running, 1 waiting</span></header>
    <div class="fs-job"><div class="split"><span><b>Customer list import</b></span><span class="fig">70%</span></div>${progress(70)}<small>595 of 850 records · started 14:22 by Alex Morgan</small></div>
    <div class="fs-job"><div class="split"><span><b>September export</b></span><span class="fig">Waiting</span></div><small>1,204 orders · starts when the import finishes</small></div>
  </div>
</div>`,
            "Orders",
          ),
        },
        {
          name: "A jobs section on the page that started it",
          rationale:
            "Shopify's bulk operations and Stripe's dashboard keep jobs on the page that started them, each with its state and a way to stop it. The reader who started the import finds it where they stood.",
          tradeoff:
            "The jobs live on one page. A reader who started an export and moved to refunds has to go back to find it.",
          reference: "Shopify, Stripe",
          html: shell(
            "Customer list",
            `<div class="page fs-page">
  ${phead("Customer list", "850 records expected.", '<button class="btn primary">Import records</button>', { crumb: trail("Home", "Customers", "Customer list") })}
  ${section(
    "Imports",
    `<div class="stack">
      <div class="split"><span><b>customer-list.csv</b><span class="sub">Started 14:22 by Alex Morgan · 595 of 850 records</span></span><span class="fig">70%</span></div>
      ${progress(70)}
      <div class="split"><span><b>september-orders.csv</b><span class="sub">Waiting · starts when the import finishes</span></span><button class="btn sm">Stop</button></div>
    </div>`,
    { desc: "An import adds records. It never removes or changes the ones already here." },
  )}
</div>`,
            "Customers",
          ),
        },
        {
          name: "Told when it is done, not while it runs",
          rationale:
            "GitHub Actions tells the reader when a run finishes; while it runs there is nothing to decide. A toast plus a timeline entry answers the only two questions: did it work, and where is the evidence.",
          tradeoff:
            "Silence while it runs. A reader who waits for 850 records with no progress bar waits less patiently than one who watches 70%.",
          reference: "GitHub Actions",
          html: shell(
            "Customer list",
            `<div class="page fs-page" style="min-height:440px">
  ${phead("Customer list", "850 records, imported 14:31.", "", { crumb: trail("Home", "Customers", "Customer list") })}
  ${section(
    "",
    `<div class="rlist">
      ${recordRow({ title: "Maria Garcia", sub: "maria@garcia-interiors.example · Garcia Interiors", state: { label: "Imported", tone: "positive" } })}
      ${recordRow({ title: "Tom Becker", sub: "tom@becker-bouw.example · Becker Bouw", state: { label: "Imported", tone: "positive" } })}
    </div>`,
    { desc: "848 more below. The import finished at 14:31." },
  )}
  ${section("What happened", `<div class="tl">${timelineEntry("850 records imported", "8 Oct 2026, 14:31", "Alex Morgan", "positive")}${timelineEntry("Import started", "8 Oct 2026, 14:22", "Alex Morgan", "neutral", true)}</div>`)}
  <div style="position:absolute;right:32px;bottom:32px;max-width:calc(100% - 64px)">${toast("positive", "850 records are on the customer list.")}</div>
</div>`,
            "Customers",
          ),
        },
        {
          name: "Progress on the rows it changes",
          rationale:
            "Mailchimp and Intercom show a bulk send on the rows it touches: each row gains its result as the job reaches it. The reader watches 31 refunds land one by one.",
          tradeoff:
            "Thirty-one rows updating under the reader's eye. It needs the reader to stay on the page, which is exactly what background work should not need.",
          reference: "Mailchimp, Intercom",
          html: shell(
            "Refunds",
            `<div class="page fs-page">
  ${phead("Refunds", "Refunding 31 orders · 12 of 31 done · about 2 minutes left.", "", { crumb: trail("Home", "Orders", "Refunds") })}
  <section class="section" aria-busy="true">
    <div class="fs-topbar" aria-hidden="true"><i></i></div>
    <div class="body flush"><table class="dt dense">
      <thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col">Result</th><th scope="col" class="num">Refunded</th></tr></thead>
      <tbody>
        ${[
          ["SO-1042", ORDER.customer, "Sent", "positive", MONEY.order],
          ["SO-1041", "Tom Becker", "Sent", "positive", "EUR 310.00"],
          ["SO-1040", "Elin Lindqvist", "Sending", "info", "EUR 64.50"],
          ["SO-1038", "Ade Okafor", "Waiting", "neutral", MONEY.refund],
        ]
          .map(([no, who, res, tone, amt]) => `<tr><td><span class="code">${no}</span></td><td>${who}</td><td>${badgeRaw(res, tone, "outline")}</td><td class="num">${amt}</td></tr>`)
          .join("")}
      </tbody>
    </table></div>
  </section>
</div>`,
            "Orders",
          ),
        },
        {
          name: "A job page with the failures listed",
          rationale:
            "Stripe's bulk runs and Shopify's imports end on a page that lists what failed and why, each with its retry. The 29 that worked need no attention; the 2 that did not get all of it.",
          tradeoff:
            "A page per job is a place readers bookmark and support must explain. It earns its keep only for jobs that can partly fail.",
          reference: "Stripe, Shopify",
          html: shell(
            "Bulk refund",
            `<div class="page fs-page">
  ${phead("Bulk refund · 29 of 31 sent", "Finished 8 Oct 2026, 11:04. Each refund went back on the customer's own payment.", "", { crumb: trail("Home", "Orders", "Refunds") })}
  ${`<div class="alert caution" role="status" style="margin-bottom:12px"><span class="ico" aria-hidden="true">!</span><span class="txt"><b>2 were not sent.</b><small>Their payments are past 180 days, so this payment method takes no refund. Acme Supply can still offer credit.</small></span></div>`}
  ${section(
    "The 2 that need you",
    `<div class="rlist">
      ${recordRow({ title: "SO-1040 · Elin Lindqvist", sub: "Paid 214 days ago · past the window", state: { label: "Not sent", tone: "destructive" }, fig: MONEY.refund, actions: '<button class="btn sm primary">Offer credit</button>', lead: "destructive" })}
      ${recordRow({ title: "SO-1038 · Ade Okafor", sub: "Paid 181 days ago · past the window", state: { label: "Not sent", tone: "destructive" }, fig: MONEY.refund, actions: '<button class="btn sm primary">Offer credit</button>', lead: "destructive" })}
    </div>`,
  )}
</div>`,
            "Orders",
          ),
        },
        {
          name: "A dialog that holds the reader until it is done",
          rationale:
            "The old desktop answer: a progress dialog with nothing behind it clickable. Drawn to be refused: 850 records take minutes, and minutes of a held reader are the cost this whole item exists to remove.",
          tradeoff:
            "The reader cannot do other work while the job runs. Stop is the only choice, and it wastes the minutes already spent.",
          html: shell(
            "Customer list",
            `<div class="page fs-page" style="min-height:440px">
  ${phead("Customer list", "Importing.", "", { crumb: trail("Home", "Customers", "Customer list") })}
  ${section("", `<div class="rlist">${recordRow({ title: "Maria Garcia", sub: "maria@garcia-interiors.example · Garcia Interiors", state: { label: "Imported", tone: "positive" } })}${recordRow({ title: "Tom Becker", sub: "tom@becker-bouw.example · Becker Bouw", state: { label: "Imported", tone: "positive" } })}</div>`)}
  ${dialog("Importing 850 records", `<div class="stack sm"><div class="split"><span><b>595 of 850 records</b><span class="sub">About 1 minute left. The page behind is waiting too.</span></span><span class="fig">70%</span></div>${progress(70)}</div>`, { footer: '<button class="btn subtle-danger">Stop the import</button>' })}
</div>`,
            "Customers",
          ),
        },
      ],
    },
    {
      id: "fs-not-found",
      title: "This record does not exist",
      why: "A link names a record that is gone, mistyped, or at another company. A problem state words it as 'Not found'. The reader needs a way back, not a code.",
      verdict:
        "The pick is B: not found, with the way back. It names the record, covers the three ways a record goes missing, and offers the list and the search. Runner-up is A, the record state, which suits a section whose read failed rather than a page whose record is gone. Never ship F bare: a code means nothing to a reader, and a dead end with a number on it is still a dead end.",
      variants: [
        {
          name: "The shipped record state",
          rationale:
            "The problem state for a missing record: 'Not found' and the line that covers gone, mistyped, and another company's. It offers no retry, because the read answered correctly. Nothing claims the record exists.",
          tradeoff:
            "No retry and no way back: the record is not there, so there is nothing to retry. The way back in B is what the reader actually needs.",
          html: shell(
            "Order",
            `<div class="page fs-page">
  ${phead("Order", "Every order, newest first.", "", { crumb: trail("Home", "Orders") })}
  ${section(
    "",
    `<div class="empty" role="alert" style="padding:40px 20px">
      <span class="fs-mark" aria-hidden="true">⌕</span>
      <b>Not found</b>
      <p>This record does not exist, or it belongs to another company.</p>
    </div>`,
  )}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Not found, with the way back",
          pick: true,
          rationale:
            "Stripe's dashboard and Linear name the missing record, say what may have happened, and offer the list and the search. The reader typed one character wrong; the fix is one look away.",
          tradeoff:
            "The suggestions are guesses. Where the record belongs to another company, no suggestion helps, and the copy must say so rather than keep guessing.",
          reference: "Stripe, Linear",
          html: shell(
            "Order",
            `<div class="page fs-page">
  ${trail("Home", "Orders", "SO-1099")}
  <div class="fs-outcome" style="margin:24px auto">
    <span class="fs-mark" aria-hidden="true">⌕</span>
    <h1>Order SO-1099 does not exist</h1>
    <p>It may be typed wrong, removed, or at another company. Nothing was charged and nothing changed.</p>
    <div class="btnrow"><button class="btn primary">Back to Orders</button><button class="btn">Search orders</button></div>
  </div>
</div>`,
            "Orders",
          ),
        },
        {
          name: "The section says so, the page stays",
          rationale:
            "GitHub shows a missing comment inside an intact thread. The order exists; one line on it does not. Only the lines section says so.",
          tradeoff:
            "Only for a child that is missing from a parent that exists. Where the whole record is gone, a surviving page is a lie.",
          reference: "GitHub",
          html: shell(
            "Order",
            `<div class="page fs-page">
  ${phead(`${ORDER.number} ${badgeRaw("Paid", "positive")}`, `${ORDER.customer} · ${ORDER.company}`, "", { crumb: trail("Home", "Orders", ORDER.number) })}
  ${section("The money", fsOrderMoney())}
  ${section("Lines", emptyState("Line DL-9918 is not on this order", "This order holds 3 lines. The code may be typed wrong.", '<button class="btn sm">See the 3 lines</button>', "⌕"))}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Gone, and when",
          rationale:
            "Linear and Notion name who removed a page and when, because 'does not exist' for something the reader saw yesterday reads as a fault. The audit trail already knows; the page says it.",
          tradeoff:
            "It confirms the record existed, which leaks across companies if the reader should not know. For another company's record this must fall back to B.",
          reference: "Linear, Notion",
          html: shell(
            "Products",
            `<div class="page fs-page">
  ${trail("Home", "Products", "Gift box, standard")}
  <div class="fs-outcome" style="margin:24px auto">
    <span class="fs-mark" aria-hidden="true">◷</span>
    <h1>Gift box, standard was removed</h1>
    <p>Sam Rivera removed it on 2 Sep 2026, before anything was ordered. Its record stays in the audit trail.</p>
    <div class="btnrow"><button class="btn primary">Back to Products</button></div>
  </div>
</div>`,
            "Products",
          ),
        },
        {
          name: "Search from the dead end",
          rationale:
            "GitHub's 404 offers search where the reader stands. The reader who mistyped an order number searches without going back to the list first.",
          tradeoff:
            "A search box on an error page is a second search to keep in step with the list's. It earns its keep only where mistyped codes are common, which pickup codes are.",
          reference: "GitHub",
          html: shell(
            "Order",
            `<div class="page fs-page">
  ${trail("Home", "Orders", "SO-1099")}
  <div class="fs-outcome" style="margin:24px auto">
    <span class="fs-mark" aria-hidden="true">⌕</span>
    <h1>Order SO-1099 does not exist</h1>
    <p>Two orders come close. Neither is called SO-1099.</p>
    <div class="fs-card">
      ${toolbar({ search: "SO-1099", placeholder: "Order number, name or email" })}
      <div class="rlist">
        <div class="rrow"><span class="txt"><b>SO-1042 · Maria Garcia</b><small>maria@garcia-interiors.example · ${MONEY.order}</small></span><span class="acts"><button class="btn sm">Open</button></span></div>
        <div class="rrow"><span class="txt"><b>SO-1040 · Elin Lindqvist</b><small>elin@lindqvist.example · EUR 64.50</small></span><span class="acts"><button class="btn sm">Open</button></span></div>
      </div>
    </div>
  </div>
</div>`,
            "Orders",
          ),
        },
        {
          name: "The big code",
          rationale:
            "Vercel and Next.js draw a bare 404. It is honest about the status and silent about everything a reader needs: what is missing, why, and where to go.",
          tradeoff:
            "A code means nothing to a reader. Left bare it is a dead end with a number on it.",
          reference: "Vercel, Next.js",
          html: shell(
            "Not found",
            `<div class="page fs-page">
  <div class="fs-outcome">
    <span class="fs-code404" aria-hidden="true">404</span>
    <h1>This page does not exist</h1>
    <p>It may be typed wrong, removed, or at another company.</p>
    <div class="btnrow"><button class="btn primary">Back to Home</button></div>
  </div>
</div>`,
            "Home",
          ),
        },
      ],
    },
    {
      id: "fs-server-error",
      title: "Something went wrong on our side",
      why: "The server fails a read or a command. A problem state words it as 'That did not go through', with a reference the reader can quote. The reader must know what did not happen.",
      verdict:
        "The pick is A: the failure with its reference. It words the failure once, says what did not move, and gives support something to read back. Runner-up is B, the outcome page, which suits a failed command where the money sentence deserves a page of its own. Never ship F: figures the server could not confirm are misinformation, and a quiet line does not make them honest.",
      variants: [
        {
          name: "The shipped failure with its reference",
          pick: true,
          rationale:
            "The problem state for a failed command: the title, the caller-safe detail, Try again, and a reference the reader can quote to support. The money sentence is the point: what did not move.",
          tradeoff:
            "A reference is only useful if support can read it back. Without that lookup it is a number that comforts nobody.",
          html: shell(
            "Order",
            `<div class="page fs-page">
  ${phead(`${ORDER.number} ${badgeRaw("Paid", "positive")}`, `${ORDER.customer} · ${ORDER.company}`, "", { crumb: trail("Home", "Orders", ORDER.number) })}
  ${section(
    "",
    `<div class="empty" role="alert" style="padding:40px 20px">
      <span class="fs-mark destructive" aria-hidden="true">✕</span>
      <b>That did not go through</b>
      <p>The refund could not be sent. The money has not moved and the customer has not been told.</p>
      <span class="fs-ref">Reference <span class="copyable"><span class="code">RF-SO-1042-181</span><button aria-label="Copy the reference">⧉</button></span></span>
      <div class="btnrow"><button class="btn">Try again</button></div>
    </div>`,
  )}
</div>`,
            "Orders",
          ),
        },
        {
          name: "An outcome page that says what did not happen",
          rationale:
            "Stripe's dashboard failure page leads with what did not happen, because after a failed refund that is the reader's first question. The money sentence comes before the retry.",
          tradeoff:
            "A page per failure is heavier than a state in place. It suits a failed command and not a failed read, where A stays.",
          reference: "Stripe",
          html: shell(
            "Order",
            `<div class="page fs-page">
  ${trail("Home", "Orders", ORDER.number)}
  <div class="fs-outcome" style="margin:24px auto">
    <span class="fs-mark destructive" aria-hidden="true">✕</span>
    <h1>The refund was not sent</h1>
    <p>The money has not moved and Maria Garcia has not been told. Nothing changed on order SO-1042.</p>
    <span class="fs-ref">Reference <span class="copyable"><span class="code">RF-SO-1042-181</span><button aria-label="Copy the reference">⧉</button></span></span>
    <div class="btnrow"><button class="btn primary">Try again</button><button class="btn">Back to the order</button></div>
  </div>
</div>`,
            "Orders",
          ),
        },
        {
          name: "Tried again by itself, and says when",
          rationale:
            "Gmail retries a failed send and says when, with Try now for the impatient. A failure that clears on its own should not need a reader to clear it.",
          tradeoff:
            "Retrying a refund doubles it unless the command is idempotent. This suits reads and sends, and must never retry money blindly.",
          reference: "Gmail",
          html: shell(
            "Order",
            `<div class="page fs-page">
  <div class="alert caution" role="status"><span class="ico" aria-hidden="true">!</span><span class="txt"><b>The invoice was not resent. Trying again in 8 seconds.</b><small>Nothing was sent twice. The order itself is unchanged.</small></span><span class="tail"><button class="btn sm">Try now</button></span></div>
  ${phead(`${ORDER.number} ${badgeRaw("Paid", "positive")}`, `${ORDER.customer} · ${ORDER.company}`, "", { crumb: trail("Home", "Orders", ORDER.number) })}
  ${section("Documents", `<div class="rlist">${recordRow({ title: `Invoice ${INVOICE.number}`, sub: ORDER.email, state: { label: "Paid", tone: "positive" }, actions: '<button class="btn sm">Resend</button>' })}</div>`)}
</div>`,
            "Orders",
          ),
        },
        {
          name: "A toast for a background command that failed",
          rationale:
            "Gmail's failed send and Linear's failed sync: the reader moved on, so the failure comes to them as a toast with its retry. The page behind is whatever they do now.",
          tradeoff:
            "A toast goes. A failed refund must also land in the record's timeline, or the evidence leaves with the message.",
          reference: "Gmail, Linear",
          html: shell(
            "Orders",
            `<div class="page fs-page" style="min-height:420px">
  ${phead("Orders", "268 orders, newest first.", '<button class="btn">Export</button>', { crumb: trail("Home", "Orders") })}
  ${section("", fsOrders(4), { flush: true })}
  <div style="position:absolute;right:32px;bottom:32px;max-width:calc(100% - 64px)"><div class="toast"><span aria-hidden="true" style="color:var(--destructive-surface-foreground)">✕</span><span>The invoice for SO-1042 was not resent.</span><span class="tail"><span class="undo">Retry</span><span style="color:var(--muted-foreground);cursor:pointer">✕</span></span></div></div>
</div>`,
            "Orders",
          ),
        },
        {
          name: "The section fails, the page stays",
          rationale:
            "React error boundaries and Vercel's per-section recovery: the money section fails into its retry while the customer section stays readable. One failed read does not take the page.",
          tradeoff:
            "Two sections can fail two different ways on one page. Past one failure the page is a list of retries, and B takes over.",
          reference: "React, Vercel",
          html: shell(
            "Order",
            `<div class="page fs-page">
  ${phead(`${ORDER.number} ${badgeRaw("Paid", "positive")}`, `${ORDER.customer} · ${ORDER.company}`, "", { crumb: trail("Home", "Orders", ORDER.number) })}
  ${section("The money", `<div class="empty" role="alert" style="padding:32px 16px"><span class="fs-mark destructive" aria-hidden="true">✕</span><b>That did not go through</b><p>The money could not be read. The customer below was read normally.</p><div class="btnrow"><button class="btn">Try again</button></div></div>`)}
  ${section("The customer", facts([["Name", ORDER.customer], ["Email", ORDER.email], ["Country", "Netherlands"]]))}
</div>`,
            "Orders",
          ),
        },
        {
          name: "The old data with a quiet line",
          rationale:
            "What happens when a failed re-read is swallowed: the old figures stay with a quiet line. Drawn to be refused: a refund total that may be wrong is worse than none.",
          tradeoff:
            "The reader acts on figures the server could not confirm. For money this is not a degradation, it is misinformation.",
          html: shell(
            "Order",
            `<div class="page fs-page">
  ${phead(`${ORDER.number} ${badgeRaw("Paid", "positive")}`, `${ORDER.customer} · ${ORDER.company}`, "", { crumb: trail("Home", "Orders", ORDER.number) })}
  ${section("The money", `${fsOrderMoney()}<div class="note tight" style="margin-top:10px">These figures may be out of date. The last read failed at 14:22. <span class="fs-link">Try again</span></div>`)}
</div>`,
            "Orders",
          ),
        },
      ],
    },
    {
      id: "fs-maintenance",
      title: "The back office is down for a short while",
      why: "A planned window stops the back office. The warehouse keeps its printed pick lists, but the dispatch desk checks every parcel against the system, so dispatch waits too. The reader needs the window, what still works, and when to come back.",
      verdict:
        "The pick is A: told ahead of time, on every page. A window nobody meets by surprise is a window the warehouse can plan around, and the printed pick lists are the plan. Runner-up is B, the maintenance page itself, which is what every page becomes while the window runs. Never ship F alone: a Thursday message tells, and only the back office reminds on Sunday at 02:00.",
      variants: [
        {
          name: "Told ahead of time, on every page",
          pick: true,
          rationale:
            "Stripe's status banner and Linear's scheduled maintenance: one sentence on every page from days before, with the window and what still works. Nobody meets maintenance by surprise.",
          tradeoff:
            "A band on every page for days is days of noise for a 30-minute window. It must appear late enough to matter and early enough to plan the warehouse around.",
          reference: "Stripe, Linear",
          html: fsShellBanner(
            "info",
            "The back office is unavailable Sun 15 Mar, 02:00 to 02:30. The warehouse keeps its printed pick lists.",
            "Home",
            `<div class="page fs-page">
  ${phead("Good morning, Alex", "Acme Supply · 40 pallets leave dock A at 08:00.", "", { crumb: trail("Home") })}
  ${section(
    "What still works during the window",
    `<div class="stack">
      <div class="split"><span><b>Printed pick lists</b><span class="sub">Print them before 02:00.</span></span><span class="fig">Valid all night</span></div>
      <div class="split"><span><b>Dispatch desk</b><span class="sub">It checks every parcel against the system.</span></span><span class="fig">Waits until 02:30</span></div>
      <div class="split"><span><b>Store</b><span class="sub">Customers read that ordering continues at 02:30.</span></span><span class="fig">Paused</span></div>
    </div>`,
  )}
</div>`,
            "Home",
          ),
        },
        {
          name: "The maintenance page itself",
          rationale:
            "GitHub and Vercel draw the window as a page: what is happening, when it ends, and what still works. During the window this is every page.",
          tradeoff:
            "Nothing can be read behind it, including the pick lists. Anything the warehouse needs must be printed before 02:00.",
          reference: "GitHub, Vercel",
          html: `<div class="page fs-page">
  <div class="fs-outcome">
    <span class="fs-brand"><i>A</i>Acme Supply</span>
    <span class="fs-mark" aria-hidden="true">◷</span>
    <h1>The back office is down for maintenance</h1>
    <p>Back by 02:30. The warehouse keeps its printed pick lists. Dispatch waits until the system is back.</p>
    <div class="fs-retry" role="status">Started 02:00 · 18 minutes left</div>
    <div class="btnrow"><button class="btn primary">Check again</button></div>
  </div>
</div>`,
        },
        {
          name: "Read-only while it lasts",
          rationale:
            "Shopify and Notion degrade to reading when writing is unsafe. Orders can be read for the counter; nothing that changes money is offered.",
          tradeoff:
            "Read-only needs every command to know it is refused and why. A page that forgets one offers a refund that fails at 02:15.",
          reference: "Shopify, Notion",
          html: shell(
            "Orders",
            `<div class="page fs-page">
  <div class="alert plain"><span class="txt"><b>The back office is in maintenance until 02:30.</b><small>You can read. Nothing you do here reaches the server.</small></span></div>
  ${phead("Orders", "268 orders. Read 2 minutes ago.", "", { crumb: trail("Home", "Orders") })}
  ${section("", fsOrders(4), { flush: true })}
  ${section("Refunds", `<div class="explained"><button class="btn subtle-danger" aria-disabled="true">Refund an order</button><span class="why">Maintenance ends at 02:30. Refunds wait until then.</span></div>`)}
</div>`,
            "Orders",
          ),
        },
        {
          name: "A countdown with what still works",
          rationale:
            "Cloudflare's waiting room counts down with the facts beside it. The reader watches one number fall instead of wondering whether to keep waiting.",
          tradeoff:
            "A countdown that passes 02:30 with the system still down breaks trust faster than no countdown. It must switch to words the moment the window does.",
          reference: "Cloudflare",
          html: `<div class="page fs-page">
  <div class="fs-outcome">
    <span class="fs-brand"><i>A</i>Acme Supply</span>
    <span class="fs-mark" aria-hidden="true">◷</span>
    <h1>Back soon</h1>
    <p>The back office is down for maintenance until 02:30.</p>
    <div class="fs-card">
      <div class="fs-count" role="status">
        <div><b>42 min</b><small>Back in</small></div>
        <div><b>Valid</b><small>Printed pick lists</small></div>
        <div><b>Waiting</b><small>Dispatch</small></div>
      </div>
      <div class="btnrow end"><button class="btn primary">Check again</button></div>
    </div>
  </div>
</div>`,
        },
        {
          name: "The window as a calendar fact on Home",
          rationale:
            "Incident.io and Linear put a planned window on Home days ahead, next to the work it touches. The dispatch plan for the day carries the note, not a banner.",
          tradeoff:
            "Home is one page. A reader who lives in Orders never sees it, which is why this pairs with A and never replaces it.",
          reference: "Incident.io, Linear",
          html: shell(
            "Home",
            `<div class="page fs-page">
  ${phead("Good morning, Alex", "Acme Supply · two days that need you.", "", { crumb: trail("Home") })}
  ${section(
    "This week",
    `<div class="stack">
      <div class="split"><span><b>Garcia Interiors restock</b><span class="sub">Sat 14 Mar · 08:00 to 12:00 · Amsterdam warehouse</span></span><button class="btn sm">Open the dispatch plan</button></div>
      <div class="split"><span><b>Maintenance, Sun 02:00 to 02:30</b><span class="sub">Print the pick lists before you leave on Saturday.</span></span><button class="btn sm">What still works</button></div>
    </div>`,
  )}
</div>`,
            "Home",
          ),
        },
        {
          name: "A message beforehand, nothing on screen",
          rationale:
            "What happens when maintenance is announced by message only: owners get the mail on Thursday and the warehouse meets the window on Sunday. Drawn to be refused as the only signal.",
          tradeoff:
            "Nobody reads a Thursday message on Sunday at 02:00. A message tells; only the back office can remind.",
          html: shell(
            "Messages",
            `<div class="page fs-page">
  ${phead("Messages to owners", "What the system sent, and what the back office showed that night.", "", { crumb: trail("Home", "Settings", "Messages") })}
  ${section(
    "",
    `<div class="rlist">${recordRow({ title: "The back office is unavailable Sun 15 Mar, 02:00 to 02:30", sub: "Sent Thu 12 Mar to Sam Rivera and Alex Morgan", state: { label: "Sent", tone: "neutral" } })}</div>`,
  )}
  ${section("On the back office that night", emptyState("Nothing", "No banner, no page, no countdown. The warehouse finds out at 02:00.", "", "◷"))}
</div>`,
            "Settings",
          ),
        },
      ],
    },
    {
      id: "fs-rate-limited",
      title: "Too many tries",
      why: "The reader hits a limit: too many exports, too many sign-in tries, too many sends. The API answers 429 with when to try again. The reader needs the wait, not a lecture.",
      verdict:
        "The pick is A: the button waits, and says how long. It turns the limit into a 40-second wait with its reason attached, which is all a reader who hit 12 exports needs. Runner-up is D, the limit stated before it hits, which suits a reader planning a month of exports rather than one too many. Never ship F: a wait the reader cannot name reads as a page that broke, and reloading restarts it.",
      variants: [
        {
          name: "The button waits, and says how long",
          pick: true,
          rationale:
            "GitHub and Stripe answer 429 with Retry-After, and the button counts it down. The reader waits 40 seconds knowing why, instead of clicking a button that keeps refusing.",
          tradeoff:
            "A countdown on a button is a timer the page must keep honestly. If the reader reloads, the count must survive or start over truthfully.",
          reference: "GitHub, Stripe",
          html: shell(
            "Orders",
            `<div class="page fs-page">
  ${phead("Orders", "268 orders, newest first.", '<button class="btn" disabled>Export (40 s)</button>', { crumb: trail("Home", "Orders") })}
  <div class="fs-retry" role="status">12 exports in the last hour. The limit is 12 an hour. Try again in 40 seconds.</div>
  ${section("", fsOrders(4), { flush: true })}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Sign-in tries, counted down",
          rationale:
            "DigiD and Dutch banks count sign-in tries down and name the wait at zero. The reader who mistyped twice knows exactly where they stand.",
          tradeoff:
            "Counting tries tells an attacker the same thing. The wait at zero must be real, and the count must not leak whether the account exists.",
          reference: "DigiD",
          html: `<div class="page fs-page">
  <div class="fs-outcome">
    <span class="fs-brand"><i>A</i>Acme Supply</span>
    <span class="fs-mark caution" aria-hidden="true">!</span>
    <h1>Sign in</h1>
    <p>Acme Supply · Alex Morgan, operations manager</p>
    <div class="fs-card">
      ${field("Email", input("alex@acme-supply.example"), { required: true })}
      <div class="note tight">3 tries left. After that this sign-in waits 10 minutes.</div>
      <div class="btnrow end"><button class="btn primary">Continue</button></div>
    </div>
  </div>
</div>`,
        },
        {
          name: "Queued behind the others",
          rationale:
            "Cloudflare's waiting room queues rather than refuses: the export is 3rd in line with its wait stated. The reader's work is held, not lost.",
          tradeoff:
            "A queue is a promise of order. If an export jumps it, or the wait restarts, the queue reads as a trick.",
          reference: "Cloudflare",
          html: shell(
            "Orders",
            `<div class="page fs-page">
  ${phead("Orders", "268 orders, newest first.", "", { crumb: trail("Home", "Orders") })}
  ${section(
    "Exports",
    `<div class="rlist">${recordRow({ title: "september-orders.csv", sub: "3rd in line · about 6 minutes", fig: "Queued", actions: '<button class="btn sm">Leave the queue</button>' })}</div>`,
    { desc: "Your export runs when the 2 ahead of it finish. Leaving the queue cancels it." },
  )}
  ${section("", fsOrders(3), { flush: true })}
</div>`,
            "Orders",
          ),
        },
        {
          name: "The limit stated before it hits",
          rationale:
            "Stripe's API dashboard and Linear's limits page show usage against the ceiling before anything refuses. The reader who sees 9 of 12 plans the last 3.",
          tradeoff:
            "Usage figures are a read of their own, and a stale one refuses a reader it told there was room. The figure and the enforcement must agree.",
          reference: "Stripe, Linear",
          html: shell(
            "Orders",
            `<div class="page fs-page">
  ${phead("Orders", "268 orders, newest first.", '<button class="btn">Export</button>', { crumb: trail("Home", "Orders") })}
  ${section(
    "Exports",
    `<div class="stack">
      <div class="split"><span><b>9 of 12 used this hour</b><span class="sub">Your plan allows 12 an hour.</span></span><span class="fig">3 left</span></div>
      ${progress(75)}
      <div class="note tight">The 13th export waits for the next hour.</div>
    </div>`,
  )}
  ${section("", fsOrders(3), { flush: true })}
</div>`,
            "Orders",
          ),
        },
        {
          name: "The 429 page",
          rationale:
            "Cloudflare answers a hard stop with a page: too many tries, when to come back, and a reference. No retry button, because retrying is what caused this.",
          tradeoff:
            "A page with nothing to do but wait. It suits a stop measured in minutes and insults one measured in seconds, which A handles.",
          reference: "Cloudflare",
          html: shell(
            "Orders",
            `<div class="page fs-page">
  ${trail("Home", "Orders")}
  <div class="fs-outcome" style="margin:24px auto">
    <span class="fs-mark caution" aria-hidden="true">!</span>
    <h1>Too many tries</h1>
    <p>Try again in 10 minutes. Nothing was sent twice and nothing is lost.</p>
    <span class="fs-ref">Reference <span class="copyable"><span class="code">RL-SO-1042-03</span><button aria-label="Copy the reference">⧉</button></span></span>
    <div class="btnrow"><button class="btn primary">Back to Orders</button></div>
  </div>
</div>`,
            "Orders",
          ),
        },
        {
          name: "A spinner that never says why",
          rationale:
            "What happens when the 429 is swallowed into a loading state: the search spins with no message. Drawn to be refused: a wait the reader cannot name reads as a page that broke.",
          tradeoff:
            "Indistinguishable from a hang. Every second past the first is a second the reader spends deciding whether to reload, which restarts the wait.",
          html: shell(
            "Orders",
            `<div class="page fs-page">
  ${phead("Orders", "268 orders. Searching.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "maria", placeholder: "Search orders", filters: ["Any state"], right: '<span class="inline" style="gap:6px;font-size:11.5px;color:var(--muted-foreground)"><span class="spinner" style="width:11px;height:11px;border-width:1.5px"></span>Searching</span>' })}
  ${section(
    "",
    `<table class="dt" style="opacity:.5">
      <thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col">Placed</th><th scope="col">State</th><th scope="col" class="num">Paid</th></tr></thead>
      <tbody>
        ${[
          ["SO-1042", ORDER.customer, "8 Oct 09:32", "Paid", "positive", MONEY.order],
          ["SO-1041", "Tom Becker", "8 Oct 09:20", "Paid", "positive", "EUR 310.00"],
          ["SO-1039", ORDER.customer, "7 Oct 17:12", "Shipped", "positive", MONEY.lamp],
        ]
          .map(([no, who, when, st, tone, amt]) => `<tr><td><span class="code">${no}</span></td><td>${who}</td><td class="nowrap">${when}</td><td>${badgeRaw(st, tone, "outline")}</td><td class="num">${amt}</td></tr>`)
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
      ],
    },
  ],
};
