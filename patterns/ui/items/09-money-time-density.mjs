/**
 * Money, time and density: How an amount is written, how a moment is written, and how much fits before the page changes shape.
 *
 * Two rules govern most of this. Money is the company's to choose, and a
 * charge already priced must stay reconstructable. Dates are written in the
 * zone the screen works in, in one form per table. Everything below is about
 * those rules meeting a keyboard and a viewport.
 */

import {
  COMPANY,
  DELIVERY,
  MONEY,
  ORDER,
  PRODUCT,
  alert,
  badgeRaw,
  bar,
  callout,
  facts,
  field,
  input,
  ordersTable,
  phead,
  pager,
  progress,
  recordRow,
  section,
  segmented,
  shell,
  sidebar,
  split,
  statement,
  timelineEntry,
  tile,
  tiles,
  toolbar,
  trail,
} from "../parts.mjs";

/**
 * September 2026 for Acme Supply, as every statement in this category writes it.
 * 1,204 units on 1,148 orders. The payment provider takes EUR 0.29 per payment,
 * and the Business plan usage fee is EUR 0.10 per paid order. Both are taken by
 * the provider at the charge, so neither passes through the software vendor.
 */
const SEPT = {
  units: "1,204 units",
  orders: "1,148 orders",
  sales: "EUR 54,180.00",
  serviceFees: "EUR 6,020.00",
  guides: "EUR 3,150.00",
  income: "EUR 63,350.00",
  refunds: "−EUR 1,550.00",
  providerFee: "−EUR 332.92",
  platformFee: "−EUR 120.40",
  fees: "−EUR 453.32",
  out: "−EUR 2,003.32",
  net: "EUR 61,346.68",
};

/** A true minus, so a negative figure lines up with the positive ones. */
const MINUS = "−";

/**
 * The shell, wrapped so the category's own fixes apply. The wrapper is the scope
 * for every `mt-` rule that repairs a shared rule (see the css below).
 */
function mshell(title, page, active) {
  return `<div class="mt">${shell(title, page, active)}</div>`;
}

/**
 * A column chart drawn as HTML around an inline SVG. The SVG stretches to its
 * box, so the strokes stay thin at every width and the labels stay HTML text at
 * their real size in both themes.
 *
 * @param values One figure per column.
 * @param max The top of the axis.
 * @param ticks Axis values to label, bottom to top.
 * @param xs Labels under the axis, spread evenly.
 * @param ref An optional reference line: { value, label }.
 * @param kind "bars", "line" or "area".
 */
function chart({ values, max, ticks = [], xs = [], ref = null, kind = "bars", height = 168, label = "", fmt = (v) => v, highlight = -1, second = null }) {
  const n = values.length;
  const W = 600;
  const H = 100;
  const y = (v) => H - (v / max) * H;
  let marks = "";
  if (kind === "bars") {
    const slot = W / n;
    const bw = Math.max(2, slot * 0.62);
    marks = values
      .map((v, i) => `<rect x="${(i * slot + (slot - bw) / 2).toFixed(1)}" y="${y(v).toFixed(2)}" width="${bw.toFixed(1)}" height="${(H - y(v)).toFixed(2)}" class="${i === highlight ? "mt-hi" : "mt-bar"}"/>`)
      .join("");
  } else {
    const pts = values.map((v, i) => `${((i / (n - 1)) * W).toFixed(1)},${y(v).toFixed(2)}`).join(" ");
    if (kind === "area") marks += `<polygon points="0,${H} ${pts} ${W},${H}" class="mt-areafill"/>`;
    marks += `<polyline points="${pts}" class="mt-line" vector-effect="non-scaling-stroke"/>`;
    if (second) {
      const p2 = second.map((v, i) => `${((i / (n - 1)) * W).toFixed(1)},${y(v).toFixed(2)}`).join(" ");
      marks += `<polyline points="${p2}" class="mt-line2" vector-effect="non-scaling-stroke"/>`;
    }
  }
  const grid = ticks
    .map((t) => `<span class="mt-grid" style="bottom:${((t / max) * 100).toFixed(2)}%"></span><span class="mt-tick" style="bottom:${((t / max) * 100).toFixed(2)}%">${fmt(t)}</span>`)
    .join("");
  const refLine = ref
    ? `<span class="mt-ref" style="bottom:${((ref.value / max) * 100).toFixed(2)}%"><em>${ref.label}</em></span>`
    : "";
  return `<figure class="mt-chart" style="--h:${height}px">
  <div class="mt-plot">${grid}${refLine}<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="${label}">${marks}</svg></div>
  <div class="mt-x">${xs.map((x) => `<span>${x}</span>`).join("")}</div>
</figure>`;
}

/** A sparkline: one thin line, no axis. */
function spark(values, { cls = "" } = {}) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const pts = values.map((v, i) => `${((i / (values.length - 1)) * 100).toFixed(1)},${(30 - ((v - min) / (max - min || 1)) * 26 - 2).toFixed(1)}`).join(" ");
  return `<svg class="mt-spark ${cls}" viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden="true"><polyline points="${pts}" vector-effect="non-scaling-stroke"/></svg>`;
}

/** One horizontal bar with its label and figure, for parts of a whole. */
function hbar(label, sub, value, of, figure, { tone = "" } = {}) {
  const pct = Math.min(100, (value / of) * 100);
  return `<div class="mt-hbar">
  <div class="mt-hbar-top"><span><b>${label}</b>${sub ? `<small>${sub}</small>` : ""}</span><span class="mt-fig">${figure}</span></div>
  <div class="mt-track"><i class="${tone}" style="width:${pct.toFixed(1)}%"></i></div>
</div>`;
}

/** A KPI tile with an optional comparison line and sparkline. */
function kpi(label, figure, { delta = "", dir = "", note = "", sparkline = "" } = {}) {
  return `<div class="mt-kpi">
  <div class="mt-kpi-lab">${label}</div>
  <div class="mt-kpi-fig">${figure}</div>
  ${delta ? `<div class="mt-delta ${dir}">${delta}</div>` : ""}
  ${note ? `<div class="mt-kpi-note">${note}</div>` : ""}
  ${sparkline}
</div>`;
}

/** Daily unit sales for the Oak desk lamp, the 30 days to 8 October 2026. */
const DAILY = [212, 180, 164, 240, 296, 388, 342, 190, 176, 158, 204, 262, 318, 402, 356, 214, 188, 172, 226, 284, 330, 446, 392, 230, 204, 196, 248, 306, 364, 488];
/** Cumulative sold for the same product, week by week from the season launch. */
const CUMUL = [3120, 4380, 5210, 5840, 6390, 6880, 7310, 7690, 8040, 8360, 8650, 8910, 9140, 9412];
const CUMUL_LAST = [2610, 3720, 4480, 5060, 5570, 6020, 6420, 6780, 7110, 7400, 7680, 7930, 8150, 8370];

const CSS_MONEY_TIME = /* css */ `
/* Repairs, scoped to this category. mock-css writes ".dt .dense td", which
   matches a .dense element inside a table, so class="dt dense" never applies. */
.mt .dt.dense td, .mt .dt.dense th { padding-top: 5px; padding-bottom: 5px; }
.mt .dt.roomy td, .mt .dt.roomy th { padding-top: 13px; padding-bottom: 13px; }
/* The statement composite lets a grand total wrap onto two lines at phone width. */
.mt .stmt .fig, .mt .split .fig { white-space: nowrap; }
.mt .stmt .line > span:first-child, .mt .split > span:first-child { min-width: 0; }
.mt .stmt .line .fig a { text-decoration-color: var(--border); text-underline-offset: 3px; }
.mt .tile .fig { font-variant-numeric: tabular-nums; }
.mt .neg { color: var(--foreground); }
.mt .acc { font-variant-numeric: tabular-nums; }

/* A chart: HTML labels around a stretched SVG. */
.mt-chart { margin: 0; }
.mt-plot { position: relative; height: var(--h); margin-left: 52px; border-bottom: 1px solid var(--border); }
.mt-plot svg { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
.mt-grid { position: absolute; left: 0; right: 0; border-top: 1px dashed var(--border); }
.mt-tick { position: absolute; left: -52px; width: 44px; text-align: right; transform: translateY(50%); font-size: 10.5px; color: var(--muted-foreground); font-variant-numeric: tabular-nums; }
.mt-ref { position: absolute; left: 0; right: 0; border-top: 1.5px solid var(--caution); z-index: 1; }
.mt-ref em { position: absolute; right: 0; bottom: 3px; font-style: normal; font-size: 10.5px; font-weight: 500; color: var(--caution-surface-foreground); background: var(--card); padding: 0 4px; border-radius: 3px; }
.mt-bar { fill: var(--muted-foreground); opacity: 0.55; }
.mt-hi { fill: var(--foreground); }
.mt-line { fill: none; stroke: var(--foreground); stroke-width: 2; stroke-linejoin: round; }
.mt-line2 { fill: none; stroke: var(--muted-foreground); stroke-width: 1.5; stroke-dasharray: 4 3; }
.mt-areafill { fill: var(--foreground); opacity: 0.08; }
.mt-x { display: flex; justify-content: space-between; margin-left: 52px; padding-top: 6px; font-size: 10.5px; color: var(--muted-foreground); font-variant-numeric: tabular-nums; }
.mt-legend { display: flex; gap: 14px; flex-wrap: wrap; font-size: 11.5px; color: var(--muted-foreground); }
.mt-legend span { display: inline-flex; align-items: center; gap: 6px; }
.mt-key { width: 14px; height: 0; border-top: 2px solid var(--foreground); display: inline-block; }
.mt-key.dash { border-top: 1.5px dashed var(--muted-foreground); }
.mt-key.cap { border-top: 1.5px solid var(--caution); }
.mt-key.box { width: 10px; height: 10px; border: 0; border-radius: 2px; background: var(--foreground); }
.mt-key.box.soft { background: var(--muted-foreground); opacity: 0.55; }
.mt-chart-head { display: flex; align-items: flex-end; gap: 12px; flex-wrap: wrap; margin-bottom: 14px; }
.mt-chart-head .mt-big { font-size: 24px; font-weight: 600; letter-spacing: -0.02em; line-height: 1.1; font-variant-numeric: tabular-nums; }
.mt-chart-head .mt-cap { font-size: 12px; color: var(--muted-foreground); }

/* Horizontal bars, for parts of a whole and sell-through. */
.mt-hbars { display: flex; flex-direction: column; gap: 12px; }
.mt-hbar-top { display: flex; align-items: baseline; gap: 12px; font-size: 12.5px; margin-bottom: 5px; }
.mt-hbar-top b { font-weight: 500; }
.mt-hbar-top small { color: var(--muted-foreground); font-size: 11.5px; margin-left: 6px; }
.mt-fig { margin-left: auto; font-variant-numeric: tabular-nums; white-space: nowrap; }
.mt-track { height: 8px; border-radius: 999px; background: var(--muted); overflow: hidden; }
.mt-track i { display: block; height: 100%; border-radius: 999px; background: var(--foreground); }
.mt-track i.caution { background: var(--caution); }
.mt-track i.soft { background: var(--muted-foreground); }
.mt-stack { display: flex; height: 10px; border-radius: 999px; overflow: hidden; gap: 2px; background: var(--card); }
.mt-stack i { display: block; height: 100%; }
.mt-cell-bar { display: flex; align-items: center; gap: 8px; justify-content: flex-end; }
.mt-cell-bar .mt-track { width: 72px; height: 6px; flex: none; }

/* KPI tiles with a comparison. */
.mt-kpis { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 12px; }
.mt-kpi { border: 1px solid var(--border); border-radius: var(--radius); background: var(--card); padding: 14px 16px; display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.mt-kpi-lab { font-size: 12px; color: var(--muted-foreground); }
.mt-kpi-fig { font-size: 24px; font-weight: 600; letter-spacing: -0.02em; line-height: 1.2; font-variant-numeric: tabular-nums; white-space: nowrap; }
.mt-kpi-note { font-size: 11.5px; color: var(--muted-foreground); }
.mt-delta { font-size: 11.5px; font-weight: 500; color: var(--muted-foreground); font-variant-numeric: tabular-nums; }
.mt-delta.up { color: var(--positive-surface-foreground); }
.mt-delta.down { color: var(--destructive-surface-foreground); }
.mt-delta .mt-was { color: var(--muted-foreground); font-weight: 400; }
.mt-spark { width: 100%; height: 30px; margin-top: 8px; }
.mt-spark polyline { fill: none; stroke: var(--foreground); stroke-width: 1.5; }
.mt-spark.soft polyline { stroke: var(--muted-foreground); }
.mt-pill { display: inline-flex; align-items: center; height: 20px; padding: 0 7px; border-radius: 999px; font-size: 11px; font-weight: 500; font-variant-numeric: tabular-nums; }
.mt-pill.up { background: var(--positive-surface); color: var(--positive-surface-foreground); }
.mt-pill.down { background: var(--destructive-surface); color: var(--destructive-surface-foreground); }
.mt-pill.flat { background: var(--muted); color: var(--muted-foreground); }

/* An invoice page, drawn as the document it is. */
.mt-doc { border: 1px solid var(--border); border-radius: var(--radius); background: var(--card); padding: 24px; display: flex; flex-direction: column; gap: 20px; }
.mt-doc-head { display: flex; gap: 16px; flex-wrap: wrap; align-items: flex-start; }
.mt-doc-head .mt-from { font-size: 12px; color: var(--muted-foreground); line-height: 1.55; }
.mt-doc-head .mt-from b { color: var(--foreground); font-size: 13px; }
.mt-doc-head .mt-meta { margin-left: auto; text-align: right; font-size: 12px; line-height: 1.6; }
.mt-doc-title { font-size: 18px; font-weight: 600; }
.mt-doc table { width: 100%; border-collapse: collapse; font-size: 12.5px; }
.mt-doc th { text-align: left; font-weight: 500; color: var(--muted-foreground); font-size: 11.5px; padding: 0 0 8px; border-bottom: 1px solid var(--border); }
.mt-doc td { padding: 9px 0; border-bottom: 1px solid var(--border); vertical-align: top; }
.mt-doc td small { display: block; color: var(--muted-foreground); font-size: 11.5px; }
.mt-doc .r { text-align: right; font-variant-numeric: tabular-nums; white-space: nowrap; padding-left: 14px; }
.mt-totals { margin-left: auto; width: min(100%, 300px); display: flex; flex-direction: column; gap: 5px; font-size: 12.5px; }
.mt-totals > div { display: flex; gap: 12px; }
.mt-totals > div > span:last-child { margin-left: auto; font-variant-numeric: tabular-nums; white-space: nowrap; }
.mt-totals .mt-due { border-top: 2px solid var(--foreground); padding-top: 8px; margin-top: 3px; font-weight: 700; font-size: 14px; }
.mt-collected { border: 1px dashed var(--input); border-radius: var(--radius-sm); padding: 12px 14px; }
.mt-stamp { display: inline-flex; align-items: center; height: 20px; padding: 0 7px; border-radius: 4px; font-size: 10.5px; font-weight: 600; letter-spacing: 0.04em; text-transform: uppercase; border: 1px solid currentColor; }

/* A small label above a group. */
.mt-eyebrow { font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--muted-foreground); margin-bottom: 6px; }
.mt-rate { display: inline-flex; align-items: center; height: 19px; padding: 0 6px; border-radius: 4px; background: var(--muted); color: var(--muted-foreground); font-size: 10.5px; font-weight: 500; font-variant-numeric: tabular-nums; }

/* Orders that are a table at desktop and a list on a phone. */
.mt-resp-list { display: none; }
@media (max-width: 640px) {
  .mt-resp-table { display: none; }
  .mt-resp-list { display: flex; }
  .mt-kpis.mt-two { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; }
  .mt-kpis.mt-two .mt-kpi { padding: 11px 12px; }
  .mt-kpis.mt-two .mt-kpi-fig { font-size: 17px; }
  .mt-doc { padding: 16px; }
  .mt-doc-head .mt-meta { margin-left: 0; text-align: left; }
  .mt-plot, .mt-x { margin-left: 40px; }
  .mt-tick { left: -40px; width: 34px; }
}
/* A sticky first column for a table that scrolls sideways. */
.mt-sticky th:first-child, .mt-sticky td:first-child { position: sticky; left: 0; background: var(--card); z-index: 1; box-shadow: 1px 0 0 var(--border); }
.mt-scrollhint { font-size: 11px; color: var(--muted-foreground); padding: 8px 12px; border-top: 1px solid var(--border); }
/* Click-to-copy, after the click. */
.mt-copied { display: inline-flex; align-items: center; gap: 6px; font-family: var(--font-mono); font-size: 12px; padding: 2px 6px; border-radius: 4px; background: var(--muted); cursor: pointer; }
.mt-copied.done { background: var(--positive-surface); color: var(--positive-surface-foreground); }
.mt-copied .mt-ic { font-family: var(--font-sans); font-size: 10.5px; color: var(--muted-foreground); }
.mt-copied.done .mt-ic { color: inherit; }
/* Money out in red with its minus. The minus carries the meaning. */
.mt-neg { color: var(--destructive-surface-foreground); font-variant-numeric: tabular-nums; white-space: nowrap; }
/* Settlement rows: the date, what the payout holds, the amount, the state. */
.mt-settle { display: flex; flex-direction: column; }
.mt-settle-row { display: flex; align-items: baseline; gap: 12px; padding: 10px 0; border-bottom: 1px solid var(--border); font-size: 12.5px; flex-wrap: wrap; }
.mt-settle-row:last-child { border-bottom: 0; }
.mt-settle-row .mt-when { min-width: 150px; }
.mt-settle-row .mt-what { color: var(--muted-foreground); font-size: 11.5px; flex: 1; min-width: 140px; }
.mt-settle-row .mt-amt { margin-left: auto; font-variant-numeric: tabular-nums; white-space: nowrap; font-weight: 600; }
/* A payout month. Seven columns in the stylesheet, so it stays seven on a phone. */
.mt-cal { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 4px; }
.mt-cal span { aspect-ratio: 1; display: grid; place-items: center; font-size: 11px; border-radius: 6px; color: var(--muted-foreground); font-variant-numeric: tabular-nums; }
.mt-cal span.mt-pay { background: var(--positive-surface); color: var(--positive-surface-foreground); font-weight: 600; }
.mt-cal span.mt-today { outline: 2px solid var(--foreground); outline-offset: -2px; }
.mt-cal-cap { display: flex; gap: 14px; flex-wrap: wrap; font-size: 11.5px; color: var(--muted-foreground); margin-top: 8px; }
/* VAT rows and the big readable numbers for a phone page. */
.mt-vat-row { display: flex; align-items: baseline; gap: 12px; padding: 8px 0; border-bottom: 1px solid var(--border); font-size: 12.5px; flex-wrap: wrap; }
.mt-vat-row:last-child { border-bottom: 0; }
.mt-bignum { font-size: 30px; font-weight: 600; letter-spacing: -0.02em; font-variant-numeric: tabular-nums; line-height: 1.15; }
.mt-numlist { display: flex; flex-direction: column; }
.mt-numlist .split { padding: 9px 0; border-bottom: 1px solid var(--border); }
.mt-numlist .split:last-child { border-bottom: 0; }
/* A donut drawn as strokes, so it follows the theme. */
.mt-donut { display: flex; gap: 18px; align-items: center; flex-wrap: wrap; }
.mt-donut svg { width: 124px; height: 124px; flex: none; }
.mt-donut-legend { display: flex; flex-direction: column; gap: 7px; font-size: 12px; min-width: 0; flex: 1; }
.mt-donut-legend > span { display: flex; gap: 8px; align-items: baseline; }
.mt-swatch { width: 10px; height: 10px; border-radius: 3px; flex: none; align-self: center; }
@media (max-width: 640px) {
  .mt-bignum { font-size: 26px; }
  .mt-settle-row .mt-when { min-width: 0; }
}
.mt-tip { position: absolute; font-size: 11px; background: var(--foreground); color: var(--background); padding: 4px 7px; border-radius: 5px; white-space: nowrap; box-shadow: 0 4px 12px var(--scroll-shade); }
`;

/** An order's figures, used by several items. */
function orderTable(cols, { rows = 6, note = "" } = {}) {
  const data = [
    [ORDER.number, "Garcia Interiors", ORDER.customer, ORDER.email, ORDER.placed, "Paid", "positive", MONEY.order],
    ["SO-1036", "Garcia Interiors", "Tom Becker", "tom@becker-bouw.example", "8 Oct 2026, 09:30", "Paid", "positive", "EUR 40.45"],
    ["SO-1035", "Accessories only", "Elin Lindqvist", "elin@lindqvist.example", "8 Oct 2026, 09:27", "Delivered", "neutral", MONEY.lamp],
    ["SO-1034", "Accessories only", "Elin Lindqvist", "elin@lindqvist.example", "8 Oct 2026, 09:27", "Delivered", "neutral", MONEY.lamp],
    ["SO-1033", "Okafor Office fit-out", "Ade Okafor", "ade@okafor.example", "8 Oct 2026, 06:23", "Paid", "positive", MONEY.lamp],
    ["SO-1032", "Okafor Office fit-out", "Tom Becker", "tom@becker-bouw.example", "8 Oct 2026, 06:22", "Paid", "positive", MONEY.lamp],
  ].slice(0, rows);

  return `<table class="dt">${note ? `<caption>${note}</caption>` : ""}
  <thead><tr>${cols.map((c) => `<th scope="col" class="${c.cls ?? ""}">${c.label}</th>`).join("")}</tr></thead>
  <tbody>${data
    .map(([no, ref, customer, email, when, state, tone, paid]) => {
      const row = {
        no,
        ref,
        customer: `<span class="lines"><b>${customer}</b><small>${email}</small></span>`,
        customerName: customer,
        when,
        state: badgeRaw(state, tone, "outline"),
        paid,
        plain: state,
      };
      return `<tr>${cols.map((c) => `<td class="${c.cls ?? ""}">${c.key === "order" ? `<span class="lines"><span class="code">${no}</span><small>${ref}</small></span>` : row[c.key] ?? ""}</td>`).join("")}</tr>`;
    })
    .join("")}</tbody>
</table>`;
}

export const CATEGORY_MONEY_TIME_DENSITY = {
  css: CSS_MONEY_TIME,
  items: [
    {
      id: "money-writing",
      title: "Writing an amount",
      why: "Amounts meet a reader in tables, statements and exports. Two conventions are easy to grow: a table that writes <b>EUR 45.00</b> and a statement that writes <b>&euro;45.00</b>. The question is which one the product keeps, and how it writes a negative and a separator.",
      verdict:
        "Ship the 'code and two decimals, in the reader's language, with a true minus' option: it keeps one convention and settles the two questions a code leaves open, negatives and separators. The runner-up is the code-and-decimals table, which is the same choice without the negative rows drawn. Choose the symbol-with-code-in-header option only if the back office and the customer surface must match exactly. Never ship the no-currency or the mixed-decimals options: one loses the currency in every export, the other breaks the column alignment that tabular figures exist for.",
      variants: [
        {
          name: "Currency code and two decimals, everywhere",
          rationale:
            "One convention in every table. A code is unambiguous, does not depend on the reader's locale, and reads the same in English and Dutch.",
          tradeoff:
            "Wider than a symbol, so a narrow money column holds fewer rows. And a Dutch reader seeing EUR rather than &euro; on every figure pays a small translation cost on every glance.",
          html: mshell(
            "Orders",
            `<div class="page">
  ${phead("Orders", "268 orders from 96 customers.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order number, name or email" })}
  ${section(
    "",
    orderTable(
      [
        { label: "Order", key: "order" },
        { label: "Customer", key: "customer" },
        { label: "Placed", key: "when" },
        { label: "State", key: "state" },
        { label: "Paid", key: "paid", cls: "num" },
      ],
    ),
    { flush: true },
  )}
  ${pager(1, 11)}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Symbol and two decimals, with the currency in the header",
          rationale:
            "The shape most European products use. The header says Paid (EUR) so the symbol is never the only carrier, which WCAG 1.4.1 and the reading of a symbol by assistive tech both require.",
          tradeoff:
            "The symbol is a locale assumption: &euro; is right for this company and wrong for one holding an account in another currency, and there is no way to read the symbol aloud.",
          reference: "WCAG 1.4.1",
          html: mshell(
            "Orders",
            `<div class="page">
  ${phead("Orders", "268 orders from 96 customers.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order number, name or email" })}
  ${section(
    "",
    `<table class="dt">
      <thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col">Placed</th><th scope="col">State</th><th scope="col" class="num">Paid (EUR)</th></tr></thead>
      <tbody>
        ${[
          ["SO-1042", ORDER.customer, "8 Oct 2026, 09:32", "Paid", "positive", MONEY.order],
          ["SO-1036", "Tom Becker", "8 Oct 2026, 09:30", "Paid", "positive", "EUR 40.45"],
          ["SO-1035", "Elin Lindqvist", "8 Oct 2026, 09:27", "Delivered", "neutral", MONEY.lamp],
          ["SO-1033", "Ade Okafor", "8 Oct 2026, 06:23", "Paid", "positive", MONEY.lamp],
        ]
          .map(
            ([no, who, when, st, tone, amt]) => `<tr>
          <td><span class="lines"><span class="code">${no}</span><small>${DELIVERY.name}</small></span></td>
          <td>${who}</td><td class="nowrap">${when}</td><td>${badgeRaw(st, tone, "outline")}</td>
          <td class="num"><span style="font-variant-numeric:tabular-nums">&euro;${amt.replace("EUR ", "")}</span></td>
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
          name: "Code and decimals only where there are cents",
          rationale:
            "Whole euros write as EUR 45 and anything with cents writes as EUR 45.45. A column of whole amounts reads as a column of integers, which is how a reader finds one.",
          tradeoff:
            "The decimal point moves about between rows, which breaks the visual alignment a tabular figure is for. And a column where some rows have decimals and some do not is harder to scan, not easier.",
          html: mshell(
            "Statements",
            `<div class="page">
  ${phead("September 2026", "Every euro of the month under the kind it is.", "", { crumb: trail("Home", "Reports", "Statements", "September 2026") })}
  ${section(
    "",
    statement(
      [
        {
          label: "Income",
          lines: [
            { what: "Lamp sales", sub: "1,204 units", amount: "EUR 54,180" },
            { what: "Service fees customers paid", sub: "1,204 units", amount: "EUR 6,020" },
            { what: "Design guides", sub: "126 guides", amount: "EUR 3,150" },
          ],
          totalLabel: "Total income",
          total: "EUR 63,350",
        },
        {
          label: "Costs",
          lines: [
            { what: "Payment fee", sub: "EUR 0.29 on each payment", amount: "−EUR 332.92" },
            { what: "Platform fee", sub: "Business plan, EUR 0.10 per paid order", amount: "−EUR 120.40" },
          ],
          totalLabel: "Total costs",
          total: "−EUR 453.32",
        },
      ],
      { label: "Net for Acme Supply", amount: "EUR 62,896.68" },
    ),
  )}
</div>`,
            "Reports",
          ),
        },
        {
          name: "Code in the label and a symbol in the cell",
          rationale:
            "The label names the currency in words and the cell carries the symbol. A screen reader hears 'Paid, in euros' and a reader sees the &euro;.",
          tradeoff:
            "Two carriers for one fact. The label grows and the column header stops being a field name.",
          html: mshell(
            "Orders",
            `<div class="page">
  ${phead("Orders", "268 orders from 96 customers.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order number, name or email" })}
  ${section(
    "",
    `<table class="dt">
      <thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col">Placed</th><th scope="col">State</th><th scope="col" class="num">Paid, in euros</th></tr></thead>
      <tbody>
        ${[
          ["SO-1042", ORDER.customer, "8 Oct 2026, 09:32", "Paid", "positive", "125.00"],
          ["SO-1036", "Tom Becker", "8 Oct 2026, 09:30", "Paid", "positive", "40.45"],
          ["SO-1035", "Elin Lindqvist", "8 Oct 2026, 09:27", "Delivered", "neutral", "45.00"],
          ["SO-1033", "Ade Okafor", "8 Oct 2026, 06:23", "Paid", "positive", "45.00"],
        ]
          .map(
            ([no, who, when, st, tone, amt]) => `<tr>
          <td><span class="lines"><span class="code">${no}</span><small>${DELIVERY.name}</small></span></td>
          <td>${who}</td><td class="nowrap">${when}</td><td>${badgeRaw(st, tone, "outline")}</td>
          <td class="num" style="font-variant-numeric:tabular-nums">&euro;&nbsp;${amt}</td>
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
          name: "The customer's currency beside the company's",
          rationale:
            "Where a company sells abroad, the cell carries both: what the customer paid in their own currency and what the company receives. One row, no second table.",
          tradeoff:
            "Two figures per cell is the widest a money cell can get, and the reader has to work out which one answers their question on any given day.",
          html: mshell(
            "Orders",
            `<div class="page">
  ${phead("Orders", "268 orders. 41 were bought in another currency.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order number, name or email", filters: ["Any state", "Any currency"] })}
  ${section(
    "",
    `<table class="dt">
      <thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col">Placed</th><th scope="col">State</th><th scope="col" class="num">Customer paid</th><th scope="col" class="num">You receive</th></tr></thead>
      <tbody>
        ${[
          ["SO-1042", ORDER.customer, "8 Oct 2026, 09:32", "Paid", "positive", "EUR 125.00", "EUR 125.00"],
          ["SO-1027", "Elin Lindqvist", "8 Oct 2026, 09:31", "Paid", "positive", "GBP 42.00", "EUR 48.30"],
          ["SO-1026", "Ade Okafor", "8 Oct 2026, 09:29", "Paid", "positive", "USD 50.00", "EUR 45.60"],
          ["SO-1035", "Elin Lindqvist", "8 Oct 2026, 09:27", "Delivered", "neutral", "EUR 45.00", "EUR 45.00"],
        ]
          .map(
            ([no, who, when, st, tone, paid, got]) => `<tr>
          <td><span class="lines"><span class="code">${no}</span><small>${DELIVERY.name}</small></span></td>
          <td>${who}</td><td class="nowrap">${when}</td><td>${badgeRaw(st, tone, "outline")}</td>
          <td class="num">${paid}</td><td class="num"><b>${got}</b></td>
        </tr>`,
          )
          .join("")}
      </tbody>
    </table>`,
    { flush: true, desc: "The rate is what the payment provider returned at the moment of the charge." },
  )}
  ${pager(1, 7)}
</div>`,
            "Orders",
          ),
        },
        {
          name: "No currency at all, because the account has one",
          rationale:
            "A product with exactly one currency writes no currency at all: 125.00, right-aligned. The account page says the currency once and the interface trusts it.",
          tradeoff:
            "An export, a printed statement or a pasted figure loses its currency, which is the case a support conversation happens in. It also cannot survive the company adding a second currency.",
          html: mshell(
            "Orders",
            `<div class="page">
  ${phead("Orders", "268 orders. Every amount is in euros.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order number, name or email" })}
  ${section(
    "",
    `<table class="dt">
      <thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col">Placed</th><th scope="col">State</th><th scope="col" class="num">Paid</th></tr></thead>
      <tbody>
        ${[
          ["SO-1042", ORDER.customer, "8 Oct 2026, 09:32", "Paid", "positive", "125.00"],
          ["SO-1036", "Tom Becker", "8 Oct 2026, 09:30", "Paid", "positive", "40.45"],
          ["SO-1035", "Elin Lindqvist", "8 Oct 2026, 09:27", "Delivered", "neutral", "45.00"],
          ["SO-1033", "Ade Okafor", "8 Oct 2026, 06:23", "Paid", "positive", "45.00"],
        ]
          .map(
            ([no, who, when, st, tone, amt]) => `<tr>
          <td><span class="lines"><span class="code">${no}</span><small>${DELIVERY.name}</small></span></td>
          <td>${who}</td><td class="nowrap">${when}</td><td>${badgeRaw(st, tone, "outline")}</td>
          <td class="num" style="font-variant-numeric:tabular-nums">${amt}</td>
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
          name: "Code and decimals, with the column totals at the foot",
          rationale:
            "The code-and-decimals convention, plus a page total and an all-match total under the table that both follow the filters. The reader can check the column adds up without exporting it: reconcilable money, which the plain table does not offer.",
          tradeoff:
            "Two totals that disagree by design (this page vs all matches) need labels that survive a glance. The all-match total is also a second read on every filter change.",
          html: mshell(
            "Orders",
            `<div class="page">
  ${phead("Orders", "268 orders from 96 customers.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order number, name or email" })}
  ${section(
    "",
    ordersTable({ rows: 5 }) +
      `<div class="stack sm" style="border-top:1px solid var(--border);padding:10px 12px;gap:4px">
        ${split("Total on this page", "EUR 3,112.50", "25 orders, after the search and filters")}
        ${split("<b>Total of every match</b>", "<b>EUR 33,480.00</b>", "268 orders on 11 pages")}
      </div>`,
    { flush: true },
  )}
  ${pager(1, 11)}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Code and two decimals, in the reader's language, with a true minus",
          pick: true,
          rationale:
            "Stripe's dashboard and Shopify admin both keep one amount format and let the reader's language decide the separators: EUR 1,203.65 on an English page, EUR 1.203,65 on a Dutch one. A refund is written with a true minus before the code, the same width as a digit, so a negative still lines up in a tabular column. This is the code convention with its two open questions answered.",
          tradeoff:
            "Two colleagues on the same account see different separators, so a screenshot in a support case has to be read in its language. The minus is the only signal of money out, so the State column has to say Refunded as well.",
          reference: "Stripe dashboard, Shopify admin",
          html: mshell(
            "Orders",
            `<div class="page">
  ${phead("Orders", "268 orders from 96 customers.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order number, name or email", right: segmented(["English", "Nederlands"], 0) })}
  ${section(
    "",
    `<table class="dt">
      <thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col">Placed</th><th scope="col">State</th><th scope="col" class="num">Amount</th><th scope="col" class="num">Op een Nederlandse pagina</th></tr></thead>
      <tbody>
        ${[
          ["SO-1042", ORDER.customer, "8 Oct 2026, 09:32", "Paid", "positive", "EUR 125.00", "EUR 125,00"],
          ["SO-1036", "Tom Becker", "8 Oct 2026, 09:30", "Paid", "positive", "EUR 40.45", "EUR 40,45"],
          ["SO-1030", "Tom Becker", "8 Oct 2026, 09:12", "Refunded", "neutral", `${MINUS}EUR 50.00`, `${MINUS}EUR 50,00`],
          ["SO-1028", "Tom Becker", "8 Oct 2026, 08:58", "Paid", "positive", "EUR 1,250.00", "EUR 1.250,00"],
          ["SO-1033", "Ade Okafor", "8 Oct 2026, 06:23", "Paid", "positive", MONEY.lamp, "EUR 45,00"],
        ]
          .map(
            ([no, who, when, st, tone, amt, nl]) => `<tr>
          <td><span class="lines"><span class="code">${no}</span><small>${DELIVERY.name}</small></span></td>
          <td>${who}</td><td class="nowrap">${when}</td><td>${badgeRaw(st, tone, "outline")}</td>
          <td class="num nowrap">${amt}</td><td class="num nowrap muted">${nl}</td>
        </tr>`,
          )
          .join("")}
      </tbody>
    </table>`,
    { flush: true, desc: "The last column is only here to show the Dutch page. The product shows one Amount column, in the reader's language." },
  )}
  ${pager(1, 11)}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Money out in red with a true minus",
          rationale:
            "Stripe's dashboard writes a refund in red with its minus, so money out reads at a glance while the minus keeps the meaning for a reader who cannot see the colour. The tone repeats the word rather than replacing it.",
          tradeoff:
            "Red is also the error tone, so a statement full of legitimate refunds reads as a page full of problems. The State column still has to say Refunded, because colour alone never carries the meaning.",
          reference: "Stripe dashboard",
          html: mshell(
            "Orders",
            `<div class="page">
  ${phead("Orders", "268 orders from 96 customers.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order number, name or email" })}
  ${section(
    "",
    `<table class="dt">
      <thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col">Placed</th><th scope="col">State</th><th scope="col" class="num">Amount</th></tr></thead>
      <tbody>
        <tr><td><span class="lines"><span class="code">SO-1042</span><small>${DELIVERY.name}</small></span></td><td>${ORDER.customer}</td><td class="nowrap">8 Oct 2026, 09:32</td><td>${badgeRaw("Paid", "positive", "outline")}</td><td class="num">${MONEY.order}</td></tr>
        <tr><td><span class="lines"><span class="code">SO-1030</span><small>${DELIVERY.name}</small></span></td><td>Tom Becker</td><td class="nowrap">8 Oct 2026, 09:12</td><td>${badgeRaw("Refunded", "neutral", "outline")}</td><td class="num"><span class="mt-neg">${MINUS}EUR 50.00</span></td></tr>
        <tr><td><span class="lines"><span class="code">SO-1036</span><small>${DELIVERY.name}</small></span></td><td>Tom Becker</td><td class="nowrap">8 Oct 2026, 09:30</td><td>${badgeRaw("Paid", "positive", "outline")}</td><td class="num">EUR 40.45</td></tr>
        <tr><td><span class="lines"><span class="code">SO-1029</span><small>${DELIVERY.name}</small></span></td><td>Elin Lindqvist</td><td class="nowrap">14 Mar 2026, 22:41</td><td>${badgeRaw("Refunded", "neutral", "outline")}</td><td class="num"><span class="mt-neg">${MINUS}EUR 45.00</span></td></tr>
      </tbody>
    </table>`,
    { flush: true, desc: "Refunds go back against the customer's own original charge. The minus carries the meaning; the red repeats it." },
  )}
  ${pager(1, 11)}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Money out in parentheses, the accounting way",
          rationale:
            "Xero, QuickBooks and every printed annual account write a negative as (1,550.00). A bookkeeper reading the statement reads it without translation, and a parenthesis is harder to miss than a minus at 12 pixels.",
          tradeoff:
            "A reader who is not an accountant can read (120.40) as a note rather than a negative. It also differs from how the payment provider writes the same refund, so the two screens the company reconciles disagree in form.",
          reference: "Xero, QuickBooks",
          html: mshell(
            "Statements",
            `<div class="page" style="max-width:660px">
  ${phead("September 2026", "Every euro of the month under the kind it is.", "", { crumb: trail("Home", "Reports", "Statements", "September 2026") })}
  ${section(
    "",
    statement(
      [
        {
          label: "Income",
          lines: [
            { what: "Lamp sales", sub: SEPT.units, amount: SEPT.sales },
            { what: "Service fees customers paid", sub: SEPT.units, amount: SEPT.serviceFees },
            { what: "Design guides", sub: "126 guides", amount: SEPT.guides },
          ],
          totalLabel: "Total income",
          total: SEPT.income,
        },
        {
          label: "Refunds and fees",
          lines: [
            { what: "Refunds", sub: "31 units", amount: "EUR (1,550.00)" },
            { what: "Payment fee", sub: "EUR 0.29 on each payment", amount: "EUR (332.92)" },
            { what: "Platform fee", sub: "EUR 0.10 per paid order", amount: "EUR (120.40)" },
          ],
          totalLabel: "Total refunds and fees",
          total: "EUR (2,003.32)",
        },
      ],
      { label: "Net for Acme Supply", amount: SEPT.net },
    ),
  )}
</div>`,
            "Reports",
          ),
        },
      ],
    },
    {
      id: "money-statement",
      title: "A statement that adds up",
      why: "A statement exists for exactly one purpose: <b>money must add up top to bottom</b>. A group per kind, a total per group, and a net at the foot, with a count under each line so a reader can spot a missing line.",
      verdict:
        "Keep the groups, subtotals and grand total, with a count under each line: the count is the only completeness check on the page. The runner-up is the statement that ends in the payouts it became, which is what finance needs when reconciling against the bank, and the better choice for a finance-only page. The links-on-every-line option is worth adding later as a behaviour of the pick rather than a separate layout. Never ship the one-figure option as the statement: it hides how the figure was reached.",
      variants: [
        {
          name: "Groups, subtotals and a grand total",
          pick: true,
          rationale:
            "Each group has its label, its lines and a subtotal, then a rule and the one figure the reader came for. The count under each line is how a reader spots a missing line.",
          tradeoff:
            "The count under each line repeats the same 1,204 twice. A reader who wants to know which orders a line holds has to go to the orders list and filter it by hand.",
          html: mshell(
            "Statements",
            `<div class="page" style="max-width:680px">
  ${trail("Home", "Reports", "Statements", "September 2026")}
  <div class="phead"><div><h1>September 2026</h1><p class="desc">Every euro of the month under the kind it is.</p></div><div class="acts"><button class="btn sm icon" aria-label="August 2026">‹</button><button class="btn sm icon" aria-label="October 2026">›</button><button class="btn sm">Download</button></div></div>
  ${section(
    "",
    statement(
      [
        {
          label: "Income",
          lines: [
            { what: "Lamp sales", sub: SEPT.units, amount: SEPT.sales },
            { what: "Service fees customers paid", sub: SEPT.units, amount: SEPT.serviceFees },
            { what: "Design guides", sub: "126 guides", amount: SEPT.guides },
          ],
          totalLabel: "Total income",
          total: SEPT.income,
        },
        {
          label: "Refunds and fees",
          lines: [
            { what: "Refunds", sub: "31 units, returned to the customers' own payments", amount: SEPT.refunds },
            { what: "Payment fee", sub: `EUR 0.29 on each of ${SEPT.orders}`, amount: SEPT.providerFee },
            { what: "Platform fee", sub: `EUR 0.10 on each of ${SEPT.units}`, amount: SEPT.platformFee },
          ],
          totalLabel: "Total refunds and fees",
          total: SEPT.out,
        },
      ],
      { label: "Net for Acme Supply in September 2026", amount: SEPT.net },
    ),
  )}
</div>`,
            "Reports",
          ),
        },
        {
          name: "A statement where every line links to its records",
          rationale:
            "Every figure is a link to the records behind it, the way Stripe's balance summary opens the transactions behind each line. A statement a reader cannot audit is a statement they have to take on trust.",
          tradeoff:
            "A column of links in a column of numbers is noisy, and each link has to open a real filtered list rather than a constructed address that might not match the figure.",
          reference: "Stripe",
          html: mshell(
            "Statements",
            `<div class="page" style="max-width:680px">
  ${trail("Home", "Reports", "Statements", "September 2026")}
  <div class="phead"><div><h1>September 2026</h1><p class="desc">Every figure opens the records behind it.</p></div></div>
  ${section(
    "",
    `<div class="stmt">
      <div class="grp">
        <div class="glab">Income</div>
        <div class="line"><span>Lamp sales<span class="sub">${SEPT.units}</span></span><span class="fig"><a href="#">${SEPT.sales}</a></span></div>
        <div class="line"><span>Service fees customers paid<span class="sub">${SEPT.units}</span></span><span class="fig"><a href="#">${SEPT.serviceFees}</a></span></div>
        <div class="line"><span>Design guides<span class="sub">126 guides</span></span><span class="fig"><a href="#">${SEPT.guides}</a></span></div>
        <div class="sub-total"><span>Total income</span><span class="fig">${SEPT.income}</span></div>
      </div>
      <div class="grp">
        <div class="glab">Refunds and fees</div>
        <div class="line"><span>Refunds<span class="sub">31 units</span></span><span class="fig"><a href="#">${SEPT.refunds}</a></span></div>
        <div class="line"><span>Payment fee<span class="sub">EUR 0.29 on each payment</span></span><span class="fig"><a href="#">${SEPT.providerFee}</a></span></div>
        <div class="line"><span>Platform fee<span class="sub">EUR 0.10 per paid order</span></span><span class="fig"><a href="#">${SEPT.platformFee}</a></span></div>
        <div class="sub-total"><span>Total refunds and fees</span><span class="fig">${SEPT.out}</span></div>
      </div>
      <div class="grand"><span>Net for Acme Supply</span><span class="fig">${SEPT.net}</span></div>
    </div>`,
  )}
</div>`,
            "Reports",
          ),
        },
        {
          name: "The paid-out month beside the month still running",
          rationale:
            "A month the provider has paid out is a fact about the past, and the running month is a fact about now. The closed month sits beside the running figure, clearly a different moment.",
          tradeoff:
            "Two figures on one page where only one is final, and a reader who takes the wrong one is wrong by whatever has happened since. Every figure needs its date.",
          html: mshell(
            "Statements",
            `<div class="page" style="max-width:680px">
  ${trail("Home", "Reports", "Statements", "September 2026")}
  <div class="phead"><div><h1>September 2026</h1><p class="desc">Closed on 30 September. The provider paid every euro of it out by 5 October.</p></div><div class="acts"><button class="btn sm">Download</button></div></div>
  <div class="stack">
  ${section(
    "September, closed",
    `<div class="stmt">
      <div class="line"><span>Income<span class="sub">${SEPT.units}, 126 guides</span></span><span class="fig">${SEPT.income}</span></div>
      <div class="line"><span>Refunds and fees</span><span class="fig">${SEPT.out}</span></div>
      <div class="grand"><span>Paid out by the provider</span><span class="fig">${SEPT.net}</span></div>
    </div>`,
    { desc: "This figure will not change." },
  )}
  ${section(
    "October so far, as at 8 Oct 2026, 14:22",
    `<div class="stmt">
      <div class="line"><span>Income<span class="sub">418 units</span></span><span class="fig">EUR 20,900.00</span></div>
      <div class="line"><span>Refunds and fees<span class="sub">12 refunds, the payment and platform fees</span></span><span class="fig">${MINUS}EUR 697.22</span></div>
      <div class="grand"><span>Net so far</span><span class="fig">EUR 20,202.78</span></div>
    </div>`,
    { desc: "This one moves with every order and refund." },
  )}
  </div>
</div>`,
            "Reports",
          ),
        },
        {
          name: "A statement with no count on any line",
          rationale:
            "The count under each line is dropped, which is how Shopify's finance summary reads: a label and a figure. The page is shorter and every line is one row.",
          tradeoff:
            "A reader who suspects a missing payment can no longer see whether the system saw any. The count is the only completeness check the page offers.",
          reference: "Shopify",
          html: mshell(
            "Statements",
            `<div class="page" style="max-width:680px">
  ${trail("Home", "Reports", "Statements", "September 2026")}
  <div class="phead"><div><h1>September 2026</h1><p class="desc">Every euro of the month under the kind it is.</p></div></div>
  ${section(
    "",
    statement(
      [
        { label: "Income", lines: [{ what: "Lamp sales", amount: SEPT.sales }, { what: "Service fees customers paid", amount: SEPT.serviceFees }, { what: "Design guides", amount: SEPT.guides }], totalLabel: "Total income", total: SEPT.income },
        { label: "Refunds and fees", lines: [{ what: "Refunds", amount: SEPT.refunds }, { what: "Payment fee", amount: SEPT.providerFee }, { what: "Platform fee", amount: SEPT.platformFee }], totalLabel: "Total refunds and fees", total: SEPT.out },
      ],
      { label: "Net for Acme Supply", amount: SEPT.net },
    ),
  )}
</div>`,
            "Reports",
          ),
        },
        {
          name: "A statement with each fee marked by who set it",
          rationale:
            "The two fee lines say who set them: the provider's price and the vendor's price. The company separates what the month made from what each service took, and the vendor line is visibly the vendor's price rather than a hidden deduction.",
          tradeoff:
            "Two marked lines are a rule a reader has to learn, and the second section repeats the plan, which the billing page already states.",
          html: mshell(
            "Statements",
            `<div class="page" style="max-width:680px">
  ${trail("Home", "Reports", "Statements", "September 2026")}
  <div class="phead"><div><h1>September 2026</h1><p class="desc">Every euro of the month under the kind it is.</p></div></div>
  <div class="stack">
  ${section(
    "",
    `<div class="stmt">
      <div class="grp">
        <div class="glab">Income</div>
        <div class="line"><span>Lamp and guide sales<span class="sub">${SEPT.units}, 126 guides</span></span><span class="fig">EUR 57,330.00</span></div>
        <div class="line"><span>Service fees customers paid<span class="sub">The fee you set. You keep it.</span></span><span class="fig">${SEPT.serviceFees}</span></div>
        <div class="line"><span>Refunds<span class="sub">31 units</span></span><span class="fig">${SEPT.refunds}</span></div>
        <div class="sub-total"><span>Income after refunds</span><span class="fig">EUR 61,800.00</span></div>
      </div>
      <div class="grp">
        <div class="glab">Fees taken at each payment</div>
        <div class="line"><span><span class="inline" style="gap:6px">Payment fee <span class="badge sq">Provider's price</span></span><span class="sub">EUR 0.29 on each payment</span></span><span class="fig">${SEPT.providerFee}</span></div>
        <div class="line"><span><span class="inline" style="gap:6px">Platform fee <span class="badge info sq">Vendor's price</span></span><span class="sub">EUR 0.10 per paid order, on the Business plan</span></span><span class="fig">${SEPT.platformFee}</span></div>
        <div class="sub-total"><span>Total fees</span><span class="fig">${SEPT.fees}</span></div>
      </div>
      <div class="grand"><span>Net for Acme Supply</span><span class="fig">${SEPT.net}</span></div>
    </div>`,
  )}
  ${section("What the vendor charged in September", `<div class="stmt">
      <div class="line"><span>Platform fee<span class="sub">Taken by the provider at each sale, shown above</span></span><span class="fig">EUR 120.40</span></div>
      <div class="line"><span>Business subscription<span class="sub">Charged by mandate, on the September invoice</span></span><span class="fig">EUR 49.00</span></div>
    </div>`, { desc: "Both are the vendor's prices, excluding VAT. The September invoice lists both." })}
  </div>
</div>`,
            "Reports",
          ),
        },
        {
          name: "The whole figure first, the lines under it",
          rationale:
            "One number at the top, the way Stripe's balance page opens, and the lines that make it up underneath. A business answers with one figure and checks it with the rest.",
          tradeoff:
            "The headline figure invites being read alone, and a reader who stops there never sees the open dispute that holds part of it back.",
          reference: "Stripe",
          html: mshell(
            "Statements",
            `<div class="page" style="max-width:680px">
  ${trail("Home", "Reports", "Statements", "October 2026")}
  <div class="phead"><div><h1>October so far</h1><p class="desc">As at 8 Oct 2026, 14:22. September is closed and paid out.</p></div></div>
  ${section(
    "",
    `<div class="stack lg">
      <div><div class="muted" style="font-size:12px">Net for Acme Supply</div><div style="font-size:30px;font-weight:600;letter-spacing:-.02em;font-variant-numeric:tabular-nums">EUR 20,152.78</div></div>
      <div class="hr"></div>
      <div class="stmt">
        <div class="line"><span>Lamp sales<span class="sub">418 units</span></span><span class="fig">EUR 18,810.00</span></div>
        <div class="line"><span>Service fees you keep<span class="sub">EUR 5.00 on 418 units</span></span><span class="fig">EUR 2,090.00</span></div>
        <div class="line"><span>Refunds<span class="sub">12 units</span></span><span class="fig">${MINUS}EUR 540.00</span></div>
        <div class="line"><span>Payment fee<span class="sub">EUR 0.29 on 398 payments</span></span><span class="fig">${MINUS}EUR 115.42</span></div>
        <div class="line"><span>Platform fee<span class="sub">EUR 0.10 per paid order</span></span><span class="fig">${MINUS}EUR 41.80</span></div>
        <div class="line"><span>Held by the provider for a dispute<span class="sub">Order SO-1031, answer due 21 Oct</span></span><span class="fig">${MINUS}EUR 50.00</span></div>
      </div>
      ${callout("caution", "The provider holds EUR 50.00 while the bank decides the dispute on SO-1031. It comes back if the bank rules for the company.")}
    </div>`,
  )}
</div>`,
            "Reports",
          ),
        },
        {
          name: "A statement that ends in the payouts it became",
          rationale:
            "The provider's payout reconciliation report closes the loop: the net of the month, then the payouts sent to the bank, and a difference of zero. Finance ticks each payout against a bank line, which is the job a finance role does with a statement.",
          tradeoff:
            "A payout can carry the last days of one month and the first of the next, so the difference is only zero for a closed month. The page needs a rule for that edge, and saying it adds a line of explanation.",
          reference: "Stripe",
          html: mshell(
            "Statements",
            `<div class="page" style="max-width:680px">
  ${trail("Home", "Reports", "Statements", "September 2026")}
  <div class="phead"><div><h1>September 2026</h1><p class="desc">What the month made, and the payouts sent for it.</p></div><div class="acts"><button class="btn sm">Download</button></div></div>
  ${section(
    "",
    `<div class="stmt">
      <div class="grp">
        <div class="line"><span>Income<span class="sub">${SEPT.units}, 126 guides</span></span><span class="fig">${SEPT.income}</span></div>
        <div class="line"><span>Refunds<span class="sub">31 units</span></span><span class="fig">${SEPT.refunds}</span></div>
        <div class="line"><span>Fees taken at each payment<span class="sub">Provider EUR 332.92, vendor EUR 120.40</span></span><span class="fig">${SEPT.fees}</span></div>
        <div class="sub-total"><span>Net for the month</span><span class="fig">${SEPT.net}</span></div>
      </div>
      <div class="grp">
        <div class="glab">Paid out to NL91 ABNA 0417 1643</div>
        <div class="line"><span>Mon 7 Sep 2026<span class="sub">1 to 6 September</span></span><span class="fig">EUR 11,420.36</span></div>
        <div class="line"><span>Mon 14 Sep 2026<span class="sub">7 to 13 September</span></span><span class="fig">EUR 16,284.10</span></div>
        <div class="line"><span>Mon 21 Sep 2026<span class="sub">14 to 20 September</span></span><span class="fig">EUR 14,906.72</span></div>
        <div class="line"><span>Mon 28 Sep 2026<span class="sub">21 to 27 September</span></span><span class="fig">EUR 12,618.04</span></div>
        <div class="line"><span>Mon 5 Oct 2026<span class="sub">28 to 30 September</span></span><span class="fig">EUR 6,117.46</span></div>
        <div class="sub-total"><span>Total paid out</span><span class="fig">${SEPT.net}</span></div>
      </div>
      <div class="grand"><span class="inline" style="gap:8px">Difference ${badgeRaw("Reconciled", "positive")}</span><span class="fig">EUR 0.00</span></div>
    </div>`,
    { desc: "The provider holds the money and pays it out. The back office reads the payouts and never holds any of it." },
  )}
</div>`,
            "Reports",
          ),
        },
        {
          name: "A statement with last month beside this one",
          rationale:
            "Xero's comparative profit and loss puts this month beside last month with a change column, so finance reads the trend without opening two pages. The change is in money, not percent, because percent of a small August line misleads.",
          tradeoff:
            "Four columns of money need a wide page, so the table scrolls sideways on a phone with the line names pinned. A new company with no last month sees a column of zeros that has to explain itself.",
          reference: "Xero",
          html: mshell(
            "Statements",
            `<div class="page" style="max-width:720px">
  ${phead("September 2026", "Beside August 2026, with the change in money.", '<button class="btn sm">Download</button>', { crumb: trail("Home", "Reports", "Statements", "September 2026") })}
  ${section(
    "",
    `<table class="dt mt-sticky">
      <thead><tr><th scope="col">Line</th><th scope="col" class="num">August 2026</th><th scope="col" class="num">September 2026</th><th scope="col" class="num">Change</th></tr></thead>
      <tbody>
        <tr><td>Lamp sales</td><td class="num">EUR 41,220.00</td><td class="num">${SEPT.sales}</td><td class="num"><span class="mt-pill up">+EUR 12,960.00</span></td></tr>
        <tr><td>Service fees customers paid</td><td class="num">EUR 4,580.00</td><td class="num">${SEPT.serviceFees}</td><td class="num"><span class="mt-pill up">+EUR 1,440.00</span></td></tr>
        <tr><td>Design guides</td><td class="num">EUR 2,540.00</td><td class="num">${SEPT.guides}</td><td class="num"><span class="mt-pill up">+EUR 610.00</span></td></tr>
        <tr><td>Refunds</td><td class="num">${MINUS}EUR 980.00</td><td class="num">${SEPT.refunds}</td><td class="num"><span class="mt-pill down">${MINUS}EUR 570.00</span></td></tr>
        <tr><td>Fees taken at each payment</td><td class="num">${MINUS}EUR 341.10</td><td class="num">${SEPT.fees}</td><td class="num"><span class="mt-pill down">${MINUS}EUR 112.22</span></td></tr>
        <tr><td><b>Net for Acme Supply</b></td><td class="num"><b>EUR 47,018.90</b></td><td class="num"><b>${SEPT.net}</b></td><td class="num"><span class="mt-pill up">+EUR 14,327.78</span></td></tr>
      </tbody>
    </table>`,
    { flush: true, desc: "August held 918 orders; September held 1,148. The change column is September minus August." },
  )}
</div>`,
            "Reports",
          ),
        },
        {
          name: "One column per product line",
          rationale:
            "A sales report answers the next question after the total: which line earned it. The same lines, one column per product line and a total column, so a weak line is visible next to the one that carried the month.",
          tradeoff:
            "Three columns of money do not fit a phone, so the table scrolls sideways there with the line names pinned. The delivery fees split across the product lines, which a reader may not expect.",
          html: mshell(
            "Statements",
            `<div class="page">
  ${phead("September 2026, by product line", "The same statement, one column per product line.", '<button class="btn sm">Download</button>', { crumb: trail("Home", "Reports", "Statements", "September 2026") })}
  ${section(
    "",
    `<table class="dt mt-sticky">
      <thead><tr><th scope="col">Line</th><th scope="col" class="num">Oak desk lamp</th><th scope="col" class="num">Brass desk lamp</th><th scope="col" class="num">Design guides</th><th scope="col" class="num">Total</th></tr></thead>
      <tbody>
        <tr><td class="nowrap">Lamp sales</td><td class="num">EUR 44,955.00</td><td class="num">EUR 9,225.00</td><td class="num muted">EUR 0.00</td><td class="num"><b>${SEPT.sales}</b></td></tr>
        <tr><td class="nowrap">Service fees customers paid</td><td class="num">EUR 4,995.00</td><td class="num">EUR 1,025.00</td><td class="num muted">EUR 0.00</td><td class="num"><b>${SEPT.serviceFees}</b></td></tr>
        <tr><td class="nowrap">Design guides</td><td class="num muted">EUR 0.00</td><td class="num muted">EUR 0.00</td><td class="num">EUR 3,150.00</td><td class="num"><b>${SEPT.guides}</b></td></tr>
        <tr><td class="nowrap">Refunds</td><td class="num">${MINUS}EUR 1,350.00</td><td class="num">${MINUS}EUR 200.00</td><td class="num muted">EUR 0.00</td><td class="num"><b>${SEPT.refunds}</b></td></tr>
        <tr><td class="nowrap">Fees taken at each payment</td><td class="num">${MINUS}EUR 376.36</td><td class="num">${MINUS}EUR 70.00</td><td class="num">${MINUS}EUR 6.96</td><td class="num"><b>${SEPT.fees}</b></td></tr>
        <tr><td><b>Net</b></td><td class="num"><b>EUR 48,223.64</b></td><td class="num"><b>EUR 9,980.00</b></td><td class="num"><b>EUR 3,143.04</b></td><td class="num"><b>${SEPT.net}</b></td></tr>
      </tbody>
    </table>`,
    { flush: true },
  )}
</div>`,
            "Reports",
          ),
        },
      ],
    },
    {
      id: "time-writing",
      title: "Writing a moment",
      why: "Every date is written in the zone the screen works in, in one form per table. An orders table that writes '8 Oct 2026, 09:32' keeps that contract; a messages table writing 'Sent 6 hours ago' and 'For 2 Jan 2030, 10:00' in the same column breaks it.",
      verdict:
        "Keep one form per table with the zone stated once in the header: a column reads as a column. The runner-up is the absolute with a relative under it, which is the better choice on incident and delivery surfaces where recency is the question. Never ship the relative-only list on a page anyone reconciles: nothing on it can be cited.",
      variants: [
        {
          name: "One form per table, with the zone stated once",
          pick: true,
          rationale:
            "Every row is the same shape, with the zone named in the column header, so a column reads as a column.",
          tradeoff:
            "Minutes are noise on a list of 268 orders read a week later, and a reader comparing against a message they received cannot tell which zone the message used.",
          html: mshell(
            "Orders",
            `<div class="page">
  ${phead("Orders", "268 orders from 96 customers.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order number, name or email" })}
  ${section(
    "",
    `<table class="dt">
      <thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col">Placed <span class="muted" style="font-weight:400">Europe/Amsterdam</span></th><th scope="col">State</th><th scope="col" class="num">Paid</th></tr></thead>
      <tbody>
        ${[
          ["SO-1042", ORDER.customer, "8 Oct 2026, 09:32", "Paid", "positive", MONEY.order],
          ["SO-1036", "Tom Becker", "8 Oct 2026, 09:30", "Paid", "positive", "EUR 40.45"],
          ["SO-1035", "Elin Lindqvist", "8 Oct 2026, 09:27", "Delivered", "neutral", MONEY.lamp],
          ["SO-1033", "Ade Okafor", "8 Oct 2026, 06:23", "Paid", "positive", MONEY.lamp],
        ]
          .map(
            ([no, who, when, st, tone, amt]) => `<tr>
          <td><span class="lines"><span class="code">${no}</span><small>${DELIVERY.name}</small></span></td>
          <td>${who}</td><td class="nowrap">${when}</td><td>${badgeRaw(st, tone, "outline")}</td><td class="num">${amt}</td>
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
          name: "Absolute with a relative under it",
          rationale:
            "The moment, and how long ago it was, in one column. A reader hunting an incident wants the relative and a reader reconciling a statement wants the absolute, and both are there.",
          tradeoff:
            "Two lines per row makes every row taller. And a relative time is a claim that goes stale the moment the page is not refreshed.",
          html: mshell(
            "Orders",
            `<div class="page">
  ${phead("Orders", "268 orders from 96 customers.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order number, name or email" })}
  ${section(
    "",
    `<table class="dt">
      <thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col">Placed <span class="muted" style="font-weight:400">Europe/Amsterdam</span></th><th scope="col">State</th><th scope="col" class="num">Paid</th></tr></thead>
      <tbody>
        ${[
          ["SO-1042", ORDER.customer, "8 Oct 2026, 09:32", "12 seconds ago", "Paid", "positive", MONEY.order],
          ["SO-1036", "Tom Becker", "8 Oct 2026, 09:30", "2 minutes ago", "Paid", "positive", "EUR 40.45"],
          ["SO-1035", "Elin Lindqvist", "8 Oct 2026, 09:27", "5 minutes ago", "Delivered", "neutral", MONEY.lamp],
          ["SO-1031", "Ade Okafor", "7 Oct 2026, 19:02", "Yesterday, 19:02", "Disputed", "destructive", MONEY.lamp],
          ["SO-1029", "Elin Lindqvist", "14 Mar 2026, 22:41", "7 months ago", "Refunded", "neutral", MONEY.lamp],
        ]
          .map(
            ([no, who, when, rel, st, tone, amt]) => `<tr>
          <td><span class="lines"><span class="code">${no}</span><small>${DELIVERY.name}</small></span></td>
          <td>${who}</td><td class="nowrap"><span class="lines"><b style="font-weight:400">${when}</b><small>${rel}</small></span></td>
          <td>${badgeRaw(st, tone, "outline")}</td><td class="num">${amt}</td>
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
          name: "Relative only, for a list of things that just happened",
          rationale:
            "Where every row is recent, the relative time is the whole answer. A dispatch log read on the day needs '4 minutes ago' and nothing else.",
          tradeoff:
            "Nothing here is citable. A reader who needs to say 'at 22:41' cannot, and an audit question about a record from March has no answer on the page.",
          html: mshell(
            "Messages",
            `<div class="page">
  ${phead("Messages", "Only the people who said yes to the kind.", '<button class="btn primary sm">Write a message</button>', { crumb: trail("Home", "Customers", "Messages") })}
  ${toolbar({ search: "", placeholder: "Search messages", filters: ["Any kind", "Any state"] })}
  ${section(
    "",
    `<table class="dt dense">
      <thead><tr><th scope="col">Message</th><th scope="col">Kind</th><th scope="col">State</th><th scope="col" class="num">Sent</th><th scope="col" class="num">Not sent</th></tr></thead>
      <tbody>
        ${[
          ["New at Acme Supply: the autumn catalogue", "Product news", "Draft", "neutral", "10 hours ago", "0"],
          ["Autumn catalogue reminder", "Newsletter", "Scheduled", "info", "For 2 Jan 2030, 10:00", "0"],
          ["Lindqvist Studio, thank you", "Newsletter", "Cancelled", "neutral", "6 hours ago", "0"],
          ["Garcia Interiors restock, Friday", "Product news", "Draft", "neutral", "9 hours ago", "0"],
          ["Winter hours", "Product news", "Scheduled", "info", "For 2 Jan 2030, 10:00", "0"],
        ]
          .map(
            ([nm, kind, st, tone, when, none]) => `<tr>
          <td><b>${nm}</b></td><td>${kind}</td><td>${badgeRaw(st, tone, "outline")}</td>
          <td class="num">${when}</td><td class="num muted">${none}</td>
        </tr>`,
          )
          .join("")}
      </tbody>
    </table>`,
    { flush: true },
  )}
</div>`,
            "Customers",
          ),
        },
        {
          name: "A date with no year when the year is obvious",
          rationale:
            "The deliveries list writes 'Fri, 9 Oct 2026, 08:00 to 12:00 · Amsterdam warehouse'. The year is kept because a delivery list crosses years and a reader planning in November is looking at March.",
          tradeoff:
            "The year on every row is noise for a list of deliveries in one year, and it widens a column in a table that already has six.",
          html: mshell(
            "Deliveries",
            `<div class="page">
  ${phead("Deliveries", "This week's deliveries, soonest first.", "", { crumb: trail("Home", "Orders") })}
  ${section(
    "",
    `<div class="rlist">
      ${[
        ["Garcia Interiors restock", "Fri, 9 Oct 2026, 08:00 to 12:00 · Amsterdam warehouse", "Scheduled", "info", "12 of 40 pallets"],
        ["Becker Bouw site delivery", "Tue, 13 Oct 2026, 08:00 to 12:00 · Rotterdam site", "Scheduled", "info", "5 of 60 pallets"],
        ["Lindqvist Studio restock", "Fri, 16 Oct 2026, 08:00 to 12:00 · Amsterdam warehouse", "Scheduled", "info", "7 of 20 pallets"],
        ["Okafor Office fit-out", "Sat, 14 Mar 2026, 08:00 to 12:00 · Amsterdam warehouse", "Active", "positive", "38 of 40 pallets"],
        ["Autumn catalogue launch", "Tue, 3 Nov 2026, 09:00 · Amsterdam warehouse", "Active", "positive", "0 of 100 pallets"],
      ]
        .map(([nm, when, st, tone, sold]) => `<div class="rrow">
        <span class="txt"><b>${nm}</b><small>${when}</small></span>
        ${badgeRaw(st, tone, "outline")}
        <span class="fig">${sold}</span>
        <span class="acts"><button class="btn sm">Open delivery</button></span>
      </div>`)
        .join("")}
    </div>`,
    { desc: "All times are Europe/Amsterdam, which is the company's zone." },
  )}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Grouped by day, so the column is the day",
          rationale:
            "A list of things that happened has a natural shape: the day. The date is a heading rather than a column, which frees the row for what matters.",
          tradeoff:
            "It is no longer sortable as a column and it is no longer a table. Sorting by customer or amount has to move to the toolbar, and a group heading row is another row to read.",
          html: mshell(
            "Timeline",
            `<div class="page">
  ${phead("Everything that happened", "Newest first. Grouped by day, all times Europe/Amsterdam.", "", { crumb: trail("Home", "Orders") })}
  ${section(
    "",
    `<div class="stack">
      <div>
        <div style="font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:var(--muted-foreground);margin-bottom:6px">Today, 8 October 2026</div>
        <div class="rlist" style="border:1px solid var(--border);border-radius:var(--radius);overflow:hidden">
          ${[
            ["SO-1042", `${ORDER.customer} placed an order`, "09:32", MONEY.order],
            ["SO-1036", "Tom Becker placed an order", "09:30", "EUR 40.45"],
            ["SO-1035", "Elin Lindqvist placed an order", "09:27", MONEY.lamp],
            ["SO-1034", "Elin Lindqvist placed an order", "09:27", MONEY.lamp],
          ]
            .map(([no, what, when, amt]) => `<div class="rrow"><span class="txt"><b><span class="code">${no}</span></b><small>${what}</small></span><span class="fig">${when}</span><span class="fig" style="min-width:78px">${amt}</span></div>`)
            .join("")}
        </div>
      </div>
      <div>
        <div style="font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:var(--muted-foreground);margin-bottom:6px">Yesterday, 7 October 2026</div>
        <div class="rlist" style="border:1px solid var(--border);border-radius:var(--radius);overflow:hidden">
          ${[
            ["SO-1031", "Ade Okafor placed an order, now disputed", "19:02", MONEY.lamp],
            ["SO-1029", "Elin Lindqvist placed an order, now refunded", "22:14", MONEY.lamp],
          ]
            .map(([no, what, when, amt]) => `<div class="rrow"><span class="txt"><b><span class="code">${no}</span></b><small>${what}</small></span><span class="fig">${when}</span><span class="fig" style="min-width:78px">${amt}</span></div>`)
            .join("")}
        </div>
      </div>
    </div>`,
  )}
</div>`,
            "Orders",
          ),
        },
        {
          name: "The relative first, the absolute behind it",
          rationale:
            "GitHub writes '3 days ago' in the list and keeps the exact moment one hover away, because a list of recent work is scanned for recency. The absolute stays on the record and in the export, so nothing citable is lost.",
          tradeoff:
            "A relative goes stale the moment the page is not refreshed, and hover does not exist on a phone. The column also sorts by a value the reader cannot see, which needs a note under the table.",
          reference: "GitHub",
          html: mshell(
            "Orders",
            `<div class="page">
  ${phead("Orders", "268 orders from 96 customers.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order number, name or email" })}
  ${section(
    "",
    `<table class="dt">
      <thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col">Placed</th><th scope="col">State</th><th scope="col" class="num">Paid</th></tr></thead>
      <tbody>
        ${[
          ["SO-1042", ORDER.customer, "12 seconds ago", "8 Oct 2026, 09:32", "Paid", "positive", MONEY.order],
          ["SO-1036", "Tom Becker", "2 minutes ago", "8 Oct 2026, 09:30", "Paid", "positive", "EUR 40.45"],
          ["SO-1035", "Elin Lindqvist", "5 minutes ago", "8 Oct 2026, 09:27", "Delivered", "neutral", MONEY.lamp],
          ["SO-1033", "Ade Okafor", "3 hours ago", "8 Oct 2026, 06:23", "Paid", "positive", MONEY.lamp],
        ]
          .map(
            ([no, who, rel, when, st, tone, amt]) => `<tr>
          <td><span class="lines"><span class="code">${no}</span><small>${DELIVERY.name}</small></span></td>
          <td>${who}</td><td class="nowrap" title="${when}, Europe/Amsterdam">${rel}</td><td>${badgeRaw(st, tone, "outline")}</td><td class="num">${amt}</td>
        </tr>`,
          )
          .join("")}
      </tbody>
    </table>`,
    { flush: true, desc: "Sorted by the exact moment, newest first. Every time is Europe/Amsterdam; the record shows it." },
  )}
  ${pager(1, 11)}
</div>`,
            "Orders",
          ),
        },
        {
          name: "The weekday with the date inside seven days",
          rationale:
            "Google Calendar and Linear write 'Tue 13 Oct, 08:00' for anything near and the full date with the year beyond that, because the near future is planned by weekday. The cutoff is stated once under the list, so the two forms read as one rule.",
          tradeoff:
            "Two forms in one column break the one-form rule on purpose, and the cutoff has to be learned. A reader comparing against a message from March still gets the full date, which is the case the rule protects.",
          reference: "Google Calendar, Linear",
          html: mshell(
            "Deliveries",
            `<div class="page">
  ${phead("Deliveries", "The next runs, soonest first.", "", { crumb: trail("Home", "Orders") })}
  ${section(
    "",
    `<div class="rlist">
      ${[
        ["Garcia Interiors restock", "Tomorrow, Fri 9 Oct, 08:00 to 12:00 · Amsterdam warehouse", "Scheduled", "info", "12 of 40 pallets"],
        ["Becker Bouw site delivery", "Tue 13 Oct, 08:00 to 12:00 · Rotterdam site", "Scheduled", "info", "5 of 60 pallets"],
        ["Lindqvist Studio restock", "Fri 16 Oct, 08:00 to 12:00 · Amsterdam warehouse", "Scheduled", "info", "7 of 20 pallets"],
        ["Okafor Office fit-out", "Sat 14 Mar 2026, 08:00 to 12:00 · Amsterdam warehouse", "Active", "positive", "38 of 40 pallets"],
      ]
        .map(([nm, when, st, tone, sold]) => `<div class="rrow">
        <span class="txt"><b>${nm}</b><small>${when}</small></span>
        ${badgeRaw(st, tone, "outline")}
        <span class="fig">${sold}</span>
        <span class="acts"><button class="btn sm">Open delivery</button></span>
      </div>`)
        .join("")}
    </div>`,
    { desc: "Runs within seven days name the weekday. Everything later carries the year. All times are Europe/Amsterdam." },
  )}
</div>`,
            "Orders",
          ),
        },
        {
          name: "A time with the zone on every value",
          rationale:
            "Every moment carries its own zone, because the orders on one page come from warehouses in different zones. A delivery in another zone is a real case, not a hypothetical.",
          tradeoff:
            "A column of repeated offsets is unreadable. The alternative is stating the zone once and accepting that a delivery in another zone reads wrong, which is a worse outcome.",
          html: mshell(
            "Cross-zone",
            `<div class="page">
  ${phead("Orders", "268 orders from 3 warehouses, in 3 time zones.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order number, name or email", filters: ["Any warehouse"] })}
  ${section(
    "",
    `<table class="dt">
      <thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col">Delivery</th><th scope="col">Placed</th><th scope="col" class="num">Paid</th></tr></thead>
      <tbody>
        ${[
          ["SO-1042", ORDER.customer, "Garcia Interiors restock", "8 Oct 2026, 09:32", "CEST", MONEY.order],
          ["SO-1036", "Tom Becker", "Becker Bouw site delivery", "8 Oct 2026, 09:30", "CEST", "EUR 40.45"],
          ["SO-1035", "Elin Lindqvist", "London counter pickup", "8 Oct 2026, 08:28", "BST", "EUR 45.00"],
          ["SO-1034", "Elin Lindqvist", "New York partner handover", "8 Oct 2026, 03:26", "EDT", MONEY.lamp],
        ]
          .map(
            ([no, who, ref, when, zone, amt]) => `<tr>
          <td><span class="code">${no}</span></td><td>${who}</td>
          <td>${ref}</td>
          <td class="nowrap">${when}<br><small class="muted">${zone}</small></td>
          <td class="num">${amt}</td>
        </tr>`,
          )
          .join("")}
      </tbody>
    </table>`,
    { flush: true, desc: "Each delivery is written in its own zone. Your own zone is Europe/Amsterdam." },
  )}
  ${pager(1, 11)}
</div>`,
            "Orders",
          ),
        },
      ],
    },
    {
      id: "time-window",
      title: "Choosing a period",
      why: "A statements page can put the period in the heading and offer two plain buttons either side of it. Nothing says which is previous and which is next, and the period cannot be typed.",
      verdict:
        "Ship the chevrons beside the heading with a month dropdown to jump: walking is one click and jumping does not take twelve of them. The runner-up is the presets with typeable bounds, which is the better choice for charts and exports where the period is not a month. Never ship the period as a filter chip: the period is the report's subject, not a refinement of it.",
      variants: [
        {
          name: "Chevrons either side of the period as the heading",
          pick: true,
          rationale:
            "The period is the heading and an unambiguous chevron on each side walks consecutive months. A chevron cannot be mistaken for a tab.",
          tradeoff:
            "Walking a quarter is four clicks, which is why a dropdown to jump stays beside it.",
          html: mshell(
            "Statements",
            `<div class="page" style="max-width:660px">
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
      <select class="fsel"><option>July 2026</option><option>August 2026</option><option selected>September 2026</option><option>October 2026</option></select>
      <button class="btn sm">Download</button>
    </div>
  </div>
  ${section(
    "",
    statement(
      [
        { label: "Income", lines: [{ what: "Lamp and guide sales", sub: "1,204 units", amount: "EUR 57,330.00" }, { what: "Service fees customers paid", sub: "1,204 units", amount: "EUR 6,020.00" }], totalLabel: "Total income", total: "EUR 63,350.00" },
        { label: "Costs", lines: [{ what: "Payment fee", amount: "−EUR 332.92" }, { what: "Platform fee", amount: "−EUR 120.40" }], totalLabel: "Total costs", total: "−EUR 453.32" },
      ],
      { label: "Net for Acme Supply in September 2026", amount: "EUR 62,896.68" },
    ),
  )}
</div>`,
            "Reports",
          ),
        },
        {
          name: "Period tabs that read as a choice",
          rationale:
            "The months named as tabs so they read as a choice rather than as two buttons. GOV.UK's own tabs example is exactly this for comparison periods.",
          tradeoff:
            "Three or four months fit and a year does not, and Carbon warns tabs are wrong where the reader must compare across groups. The '...' overflow hides the rest of the year.",
          reference: "GOV.UK, Carbon",
          html: mshell(
            "Statements",
            `<div class="page" style="max-width:660px">
  ${trail("Home", "Reports", "Statements")}
  <div class="phead"><div><h1>Statements</h1><p class="desc">Every euro of the month under the kind it is.</p></div><div class="acts"><button class="btn sm">Download</button></div></div>
  ${toolbar({ views: [{ label: "August 2026" }, { label: "September 2026", on: true }, { label: "October 2026" }] })}
  ${section(
    "",
    statement(
      [
        { label: "Income", lines: [{ what: "Lamp and guide sales", sub: "1,204 units", amount: "EUR 57,330.00" }, { what: "Service fees customers paid", sub: "1,204 units", amount: "EUR 6,020.00" }], totalLabel: "Total income", total: "EUR 63,350.00" },
        { label: "Costs", lines: [{ what: "Payment fee", amount: "−EUR 332.92" }, { what: "Platform fee", amount: "−EUR 120.40" }], totalLabel: "Total costs", total: "−EUR 453.32" },
      ],
      { label: "Net for Acme Supply in September 2026", amount: "EUR 62,896.68" },
    ),
    { acts: '<span class="badge">September 2026</span>' },
  )}
</div>`,
            "Reports",
          ),
        },
        {
          name: "A range with presets and typeable bounds",
          rationale:
            "Where the period is not a month, a range control with presets and two typeable dates. Carbon's rule is that there must always be a simple way to type, so nothing is behind the calendar.",
          tradeoff:
            "Presets plus bounds are two mechanisms on one control and the preset that was used has to be shown afterwards or the reader loses track of the period.",
          reference: "Carbon",
          html: mshell(
            "Revenue",
            `<div class="page" style="max-width:660px">
  ${trail("Home", "Reports", "Revenue")}
  <div class="phead"><div><h1>Revenue</h1><p class="desc">Every euro that moved, by the day it moved.</p></div></div>
  ${section(
    "",
    `<div class="stack">
      <div class="inline">
        <button class="btn sm">Last 7 days</button>
        <button class="btn sm primary">Last 30 days</button>
        <button class="btn sm">This month</button>
        <button class="btn sm">Last month</button>
        <button class="btn sm">Custom range</button>
      </div>
      <div class="inline" style="gap:10px;padding-top:11px;border-top:1px solid var(--border)">
        ${field("From", input("09/10/2026", { cls: "num" }))}
        <span class="muted">to</span>
        ${field("To", input("08/11/2026", { cls: "num" }))}
        <button class="btn sm" style="align-self:flex-end">Apply</button>
      </div>
      <div class="hint">Showing 9 October to 8 November 2026, Europe/Amsterdam. All 30 days.</div>
    </div>`,
  )}
  ${section("Daily", `<div class="stack sm">
      <div class="inline"><span style="font-size:12.5px">Sales per day</span><span class="badge" style="margin-left:auto">Peak 13 Oct · EUR 12,400.00</span></div>
      <svg viewBox="0 0 600 84" style="width:100%;height:84px" role="img" aria-label="Sales per day from 9 October to 8 November"><polyline points="0,64 40,60 80,68 120,44 160,38 200,24 240,30 280,14 320,22 360,10 400,18 440,52 480,62 520,58 560,64 600,62" fill="none" stroke="var(--foreground)" stroke-width="1.6"/></svg>
      <div class="inline" style="justify-content:space-between;font-size:11px;color:var(--muted-foreground)"><span>9 Oct</span><span>24 Oct</span><span>8 Nov</span></div>
    </div>`)}
</div>`,
            "Reports",
          ),
        },
        {
          name: "Both, because a report needs a month and a chart needs a range",
          rationale:
            "The statement takes a month with chevrons; the daily chart beside it takes a range with presets. Each control fits its question, which is the argument for two rather than one.",
          tradeoff:
            "Two period controls on one page that can disagree. The reader sets the statement to September and the chart to the last 30 days and sees two different answers to the same question.",
          html: mshell(
            "Statement and chart",
            `<div class="page" style="max-width:700px">
  ${trail("Home", "Reports", "Revenue")}
  <div class="phead">
    <div class="btnrow">
      <button class="btn sm icon" aria-label="Previous month">‹</button>
      <div><h1>September 2026</h1><p class="desc">Every euro of the month under the kind it is.</p></div>
      <button class="btn sm icon" aria-label="Next month">›</button>
    </div>
    <div class="acts"><button class="btn sm">Download</button></div>
  </div>
  ${section(
    "The month",
    `<div class="stmt">
      <div class="grp"><div class="glab">Income</div>
        <div class="line"><span>Lamp and guide sales<span class="sub">1,204 units</span></span><span class="fig">EUR 57,330.00</span></div>
        <div class="line"><span>Service fees customers paid</span><span class="fig">EUR 6,020.00</span></div>
        <div class="sub-total"><span>Total income</span><span class="fig">EUR 63,350.00</span></div>
      </div>
      <div class="grand"><span>Net for Acme Supply</span><span class="fig">EUR 62,896.68</span></div>
    </div>`,
  )}
  ${section(
    "Sales per day",
    `<div class="stack sm">
      <div class="inline">
        <span style="font-size:12.5px">1 to 30 September</span>
        <span style="margin-left:auto" class="btnrow" style="gap:4px"><button class="btn xs">7 days</button><button class="btn xs primary">30 days</button><button class="btn xs">90 days</button></span>
      </div>
      <svg viewBox="0 0 600 76" style="width:100%;height:76px" role="img" aria-label="Sales per day through September 2026"><polyline points="0,58 30,54 60,60 90,40 120,34 150,22 180,26 210,12 240,18 270,8 300,14 330,10 360,20 390,16 420,26 450,30 480,34 510,38 540,42 570,48 600,52" fill="none" stroke="var(--foreground)" stroke-width="1.6"/></svg>
    </div>`,
    { desc: "A different period from the statement above. The two do not have to agree." },
  )}
</div>`,
            "Reports",
          ),
        },
        {
          name: "The period as a filter chip, in the toolbar",
          rationale:
            "The period is one filter among several rather than a page-level control. It sits with the other choices the reader is narrowing by, and can be removed like any of them.",
          tradeoff:
            "The period is the page's subject rather than a refinement of it, so putting it in a row of filters demotes the one thing the report is about.",
          html: mshell(
            "Orders",
            `<div class="page">
  ${phead("Orders", "268 orders.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order number, name or email", filters: ["Any customer", "Any state", "Any channel"] })}
  <div class="inline" style="margin:-2px 0 10px">
    <span class="chip">Placed in September 2026 <button class="x" aria-label="Remove the date filter">✕</button></span>
    <span class="chip">Paid <button class="x" aria-label="Remove the state filter">✕</button></span>
    <button class="btn ghost sm">Clear both</button>
  </div>
  ${section(
    "",
    `<table class="dt">
      <thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col">Placed</th><th scope="col">State</th><th scope="col" class="num">Paid</th></tr></thead>
      <tbody>
        ${[
          ["SO-1042", ORDER.customer, "8 Oct 2026, 09:32", "Paid", "positive", MONEY.order],
          ["SO-1036", "Tom Becker", "8 Oct 2026, 09:30", "Paid", "positive", "EUR 40.45"],
          ["SO-1035", "Elin Lindqvist", "8 Oct 2026, 09:27", "Delivered", "neutral", MONEY.lamp],
        ]
          .map(
            ([no, who, when, st, tone, amt]) => `<tr>
          <td><span class="code">${no}</span></td><td>${who}</td><td class="nowrap">${when}</td>
          <td>${badgeRaw(st, tone, "outline")}</td><td class="num">${amt}</td>
        </tr>`,
          )
          .join("")}
      </tbody>
    </table>`,
    { flush: true, desc: "Orders placed in September 2026 and paid: 1,148." },
  )}
  ${pager(1, 46)}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Preset chips that open a calendar",
          rationale:
            "Stripe's dashboard answers the common ranges with one click and opens a calendar for the rest, so the control stays small until the reader needs precision. The chosen range is written back in words, which is what an export of the wrong range is checked against.",
          tradeoff:
            "The bounds stay hidden until the calendar opens, so a reader cannot see at a glance what Custom covers. Keyboard entry needs the typeable path kept beside the calendar, not inside it.",
          reference: "Stripe",
          html: mshell(
            "Revenue",
            `<div class="page" style="max-width:660px">
  ${trail("Home", "Reports", "Revenue")}
  <div class="phead"><div><h1>Revenue</h1><p class="desc">9 September to 8 October 2026, Europe/Amsterdam. All 30 days.</p></div><div class="acts"><button class="btn sm">Download</button></div></div>
  ${section(
    "",
    `<div class="stack">
      <div class="inline">
        <button class="btn sm">Today</button>
        <button class="btn sm">Last 7 days</button>
        <button class="btn sm primary">Last 30 days</button>
        <button class="btn sm">Month to date</button>
        <button class="btn sm">Custom</button>
      </div>
      <div class="pop" style="max-width:300px">
        <div class="cap">October 2026</div>
        <div class="mt-cal" style="padding:4px 8px 8px"><span></span><span></span><span></span><span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6</span><span>7</span><span class="mt-today">8</span><span>9</span><span>10</span><span>11</span><span>12</span><span>13</span><span>14</span><span>15</span><span>16</span><span>17</span><span>18</span><span>19</span><span>20</span><span>21</span><span>22</span><span>23</span><span>24</span><span>25</span><span>26</span><span>27</span><span>28</span><span>29</span><span>30</span><span>31</span></div>
      </div>
      <div class="hint">The calendar opens from Custom. 8 October is today; the range ends there.</div>
    </div>`,
  )}
</div>`,
            "Reports",
          ),
        },
        {
          name: "Month and year as two selects",
          rationale:
            "Shopify's reports pick the month and the year as two selects beside the heading, so jumping from March to October is two clicks with no calendar. The heading then states the period in words, which is what the download carries.",
          tradeoff:
            "There is no custom range, so a chart that needs 30 rolling days needs another control. Two selects also read as a form rather than navigation, which invites an Apply button the page should not need.",
          reference: "Shopify",
          html: mshell(
            "Statements",
            `<div class="page" style="max-width:660px">
  ${trail("Home", "Reports", "Statements")}
  <div class="phead"><div><h1>September 2026</h1><p class="desc">Every euro of the month under the kind it is.</p></div><div class="acts"><select class="fsel" aria-label="Month"><option>August</option><option selected>September</option><option>October</option></select><select class="fsel" aria-label="Year"><option>2025</option><option selected>2026</option></select><button class="btn sm">Download</button></div></div>
  ${section(
    "",
    statement(
      [
        { label: "Income", lines: [{ what: "Lamp and guide sales", sub: "1,204 units", amount: "EUR 57,330.00" }, { what: "Service fees customers paid", sub: "1,204 units", amount: "EUR 6,020.00" }], totalLabel: "Total income", total: "EUR 63,350.00" },
        { label: "Costs", lines: [{ what: "Payment fee", amount: "−EUR 332.92" }, { what: "Platform fee", amount: "−EUR 120.40" }], totalLabel: "Total costs", total: "−EUR 453.32" },
      ],
      { label: "Net for Acme Supply in September 2026", amount: "EUR 62,896.68" },
    ),
  )}
</div>`,
            "Reports",
          ),
        },
        {
          name: "A date range across the top, typed, as the only control",
          rationale:
            "One control, always visible, always the current range in words. A reader who has just exported a CSV of the wrong range can see at a glance what it covered.",
          tradeoff:
            "A reader who wants last month has to type it. Presets exist because typing two dates is slower than clicking one, and this removes them.",
          html: mshell(
            "Orders",
            `<div class="page">
  ${phead("Orders", "268 orders.", "", { crumb: trail("Home", "Orders") })}
  ${section(
    "The period",
    `<div class="inline" style="gap:10px">
      ${field("From", input("01/09/2026", { cls: "num" }))}
      <span class="muted">to</span>
      ${field("To", input("30/09/2026", { cls: "num" }))}
      <button class="btn sm" style="align-self:flex-end">Apply</button>
      <span class="hint" style="align-self:flex-end;margin-left:8px">1,148 orders. Europe/Amsterdam.</span>
    </div>`,
  )}
  ${section(
    "",
    `<table class="dt">
      <thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col">Placed</th><th scope="col">State</th><th scope="col" class="num">Paid</th></tr></thead>
      <tbody>
        ${[
          ["SO-1042", ORDER.customer, "8 Oct 2026, 09:32", "Paid", "positive", MONEY.order],
          ["SO-1036", "Tom Becker", "8 Oct 2026, 09:30", "Paid", "positive", "EUR 40.45"],
          ["SO-1035", "Elin Lindqvist", "8 Oct 2026, 09:27", "Delivered", "neutral", MONEY.lamp],
        ]
          .map(
            ([no, who, when, st, tone, amt]) => `<tr>
          <td><span class="code">${no}</span></td><td>${who}</td><td class="nowrap">${when}</td>
          <td>${badgeRaw(st, tone, "outline")}</td><td class="num">${amt}</td>
        </tr>`,
          )
          .join("")}
      </tbody>
    </table>`,
    { flush: true },
  )}
  ${pager(1, 46)}
</div>`,
            "Orders",
          ),
        },
      ],
    },
    {
      id: "density-rows",
      title: "How much fits before it breaks",
      why: "A table can run at about <b>47 pixels a row</b> with two lines in three of its columns. At 390 pixels a five-column table must drop a column and truncate names to 'Garcia…', unless the page changes shape.",
      verdict:
        "Keep the table at desktop width with two-line cells and no truncation, and switch to the record list under 640 px: that pair is the honest answer at both widths. The runner-up is the wrap-rather-than-truncate table, which is the better choice where one column holds names of any length. Never ship the shortened figures near a statement: a rounded money figure is not a money figure.",
      compact: {
        option: "At 390 pixels, a record list rather than a table",
        behaviour: "Under 640 pixels the table becomes a record list: one block per order with the customer, the delivery and the amount, newest first. Sorting by column goes with the table; on a phone the reader is looking for one order they were told about.",
      },
      variants: [
        {
          name: "The full width, with nothing truncated",
          pick: true,
          rationale:
            "At 1440 the columns all have room. The delivery is the second line of the order cell and the customer's email is the second line of the customer cell, so nothing needs an ellipsis.",
          tradeoff:
            "Five columns is the ceiling at this width. A seventh column forces a truncation somewhere, and the second line is where it goes.",
          html: mshell(
            "Orders",
            `<div class="page">
  ${phead("Orders", "268 orders from 96 customers.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order number, name or email" })}
  ${section(
    "",
    `<table class="dt">
      <thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col">Placed</th><th scope="col">State</th><th scope="col" class="num">Paid</th></tr></thead>
      <tbody>
        ${[
          ["SO-1042", "Garcia Interiors restock", ORDER.customer, ORDER.email, "8 Oct 2026, 09:32", "Paid", "positive", MONEY.order],
          ["SO-1036", "Garcia Interiors restock", "Tom Becker", "tom@becker-bouw.example", "8 Oct 2026, 09:30", "Paid", "positive", "EUR 40.45"],
          ["SO-1035", "Accessories only, no delivery", "Elin Lindqvist", "elin@lindqvist.example", "8 Oct 2026, 09:27", "Delivered", "neutral", MONEY.lamp],
          ["SO-1033", "Okafor Office fit-out: autumn range", "Ade Okafor", "ade@okafor.example", "8 Oct 2026, 06:23", "Paid", "positive", MONEY.lamp],
        ]
          .map(
            ([no, ref, who, email, when, st, tone, amt]) => `<tr>
          <td><span class="lines"><span class="code">${no}</span><small>${ref}</small></span></td>
          <td><span class="lines"><b>${who}</b><small>${email}</small></span></td>
          <td class="nowrap">${when}</td><td>${badgeRaw(st, tone, "outline")}</td><td class="num">${amt}</td>
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
          name: "At 390 pixels, a record list rather than a table",
          rationale:
            "A phone has no room for columns. One block per order with everything on it.",
          tradeoff:
            "No sorting by column and no comparison across a column. On a phone a reader is looking for one order they were told about, which is the case a list serves.",
          width: "phone",
          html: mshell(
            "Orders",
            `<div class="page">
  ${phead("Orders", "268 orders, newest first.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order or customer", filters: ["Any state"] })}
  ${section(
    "",
    `<div class="rlist">
      ${[
        ["SO-1042", "Garcia Interiors restock", ORDER.customer, ORDER.email, "8 Oct, 09:32", "Paid", "positive", MONEY.order],
        ["SO-1036", "Garcia Interiors restock", "Tom Becker", "tom@becker-bouw.example", "8 Oct, 09:30", "Paid", "positive", "EUR 40.45"],
        ["SO-1035", "Accessories only", "Elin Lindqvist", "elin@lindqvist.example", "8 Oct, 09:27", "Delivered", "neutral", MONEY.lamp],
        ["SO-1033", "Okafor Office fit-out: autumn range", "Ade Okafor", "ade@okafor.example", "8 Oct, 06:23", "Paid", "positive", MONEY.lamp],
      ]
        .map(
          ([no, ref, who, email, when, st, tone, amt]) => `<div class="rrow" style="flex-wrap:wrap;align-items:flex-start">
        <span class="txt" style="flex:1 1 100%"><b><span class="code">${no}</span></b><small>${ref}</small></span>
        <span class="txt" style="flex:1 1 auto;margin-top:5px"><b>${who}</b><small>${email}</small></span>
        <span style="display:flex;flex-direction:column;align-items:flex-end;gap:4px;flex:none">${badgeRaw(st, tone, "outline")}<span class="fig">${amt}</span></span>
        <span class="muted" style="font-size:11px;width:100%;margin-top:3px">${when}, Europe/Amsterdam</span>
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
          name: "At 390 pixels, a table with two columns and no truncation",
          rationale:
            "The table survives by dropping to the two facts a reader needs to identify the row: the order and what it cost. The delivery and the customer are one tap away on the record.",
          tradeoff:
            "A list of 268 rows where every row reads 'SO-1042 125.00' cannot be scanned for a customer. It only works where the reader arrived knowing an order number.",
          width: "phone",
          html: mshell(
            "Orders",
            `<div class="page">
  ${phead("Orders", "268 orders.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order or customer", filters: ["Any state"] })}
  ${section(
    "",
    `<table class="dt dense">
      <thead><tr><th scope="col">Order</th><th scope="col" class="num">Paid</th></tr></thead>
      <tbody>
        ${[
          ["SO-1042", MONEY.order],
          ["SO-1036", "EUR 40.45"],
          ["SO-1035", MONEY.lamp],
          ["SO-1034", MONEY.lamp],
          ["SO-1033", MONEY.lamp],
          ["SO-1032", MONEY.lamp],
        ]
          .map(([no, amt]) => `<tr><td><span class="code">${no}</span></td><td class="num">${amt}</td></tr>`)
          .join("")}
      </tbody>
    </table>`,
    { flush: true },
  )}
  <div style="padding:9px 12px"><span class="muted" style="font-size:11.5px">The customer, delivery and date are on the record. Open one to read it.</span></div>
  ${pager(1, 11)}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Three densities on the same table",
          rationale:
            "Carbon's five heights, reduced to the three that matter here: 24 to scan a queue, 32 to work in, 40 to read two lines. A reader sets it once.",
          tradeoff:
            "Every screenshot test has to hold three versions of every page, and the setting is per user so two colleagues looking at the same screen see different things.",
          reference: "Carbon",
          html: mshell(
            "Orders",
            `<div class="page">
  ${phead("Orders", "268 orders. 40 pixels a row.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({
    search: "",
    placeholder: "Order number, name or email",
    right: '<span class="inline" style="gap:6px"><span class="muted" style="font-size:11.5px">Rows</span>' + segmented(["24", "32", "40"], 2) + "</span>",
  })}
  ${section(
    "",
    `<table class="dt roomy">
      <thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col">Placed</th><th scope="col">State</th><th scope="col" class="num">Paid</th></tr></thead>
      <tbody>
        ${[
          ["SO-1042", ORDER.customer, ORDER.email, "8 Oct 2026, 09:32", "Paid", "positive", MONEY.order],
          ["SO-1036", "Tom Becker", "tom@becker-bouw.example", "8 Oct 2026, 09:30", "Paid", "positive", "EUR 40.45"],
          ["SO-1035", "Elin Lindqvist", "elin@lindqvist.example", "8 Oct 2026, 09:27", "Delivered", "neutral", MONEY.lamp],
        ]
          .map(
            ([no, who, email, when, st, tone, amt]) => `<tr>
          <td><span class="lines"><span class="code">${no}</span><small>${DELIVERY.name}</small></span></td>
          <td><span class="lines"><b>${who}</b><small>${email}</small></span></td>
          <td class="nowrap">${when}</td><td>${badgeRaw(st, tone, "outline")}</td><td class="num">${amt}</td>
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
          name: "Long content that wraps rather than truncates",
          rationale:
            "Nothing gets an ellipsis: a long delivery name wraps onto a third line and the row grows. The cost is uneven row heights, which is the honest cost.",
          tradeoff:
            "Rows of different heights break the horizontal line a reader scans along, and a column of wrapped names is much harder to compare than a column of identical short ones.",
          html: mshell(
            "Orders",
            `<div class="page" style="max-width:620px">
  ${phead("Orders", "268 orders. Long names wrap rather than cut.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order number, name or email" })}
  ${section(
    "",
    `<table class="dt">
      <thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col">Placed</th><th scope="col">State</th><th scope="col" class="num">Paid</th></tr></thead>
      <tbody>
        ${[
          ["SO-1042", "Garcia Interiors restock: autumn range with the full lighting wall", ORDER.customer, "8 Oct 2026, 09:32", "Paid", "positive", MONEY.order],
          ["SO-1036", "Garcia Interiors restock", "Tom Becker", "8 Oct 2026, 09:30", "Paid", "positive", "EUR 40.45"],
          ["SO-1035", "Accessories only, no delivery", "Elin Lindqvist", "8 Oct 2026, 09:27", "Delivered", "neutral", MONEY.lamp],
        ]
          .map(
            ([no, ref, who, when, st, tone, amt]) => `<tr>
          <td style="max-width:170px"><span class="lines"><span class="code">${no}</span><small style="white-space:normal;overflow-wrap:anywhere">${ref}</small></span></td>
          <td>${who}</td><td class="nowrap">${when}</td><td>${badgeRaw(st, tone, "outline")}</td><td class="num">${amt}</td>
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
          name: "A wide table that scrolls with its first column pinned",
          rationale:
            "Linear and Notion pin the name column while the rest scrolls, so a seven-column table stays readable on a narrow screen without dropping anything. The pinned cell keeps the card background, which is what makes the scroll read as under it rather than through it.",
          tradeoff:
            "The pinned column narrows everything else by its own width, and a second pinned column would take more than the screen can spare. The scroll hint under the table is part of the pattern, not decoration.",
          reference: "Linear, Notion",
          html: mshell(
            "Orders",
            `<div class="page">
  ${phead("Orders", "268 orders from 96 customers.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order number, name or email" })}
  ${section(
    "",
    `<table class="dt mt-sticky">
      <thead><tr><th scope="col">Order</th><th scope="col">Delivery</th><th scope="col">Customer</th><th scope="col">Placed</th><th scope="col">State</th><th scope="col">Channel</th><th scope="col" class="num">Paid</th></tr></thead>
      <tbody>
        ${[
          ["SO-1042", DELIVERY.name, ORDER.customer, "8 Oct 2026, 09:32", "Paid", "positive", "Online shop", MONEY.order],
          ["SO-1036", DELIVERY.name, "Tom Becker", "8 Oct 2026, 09:30", "Paid", "positive", "Online shop", "EUR 40.45"],
          ["SO-1035", "Accessories only", "Elin Lindqvist", "8 Oct 2026, 09:27", "Delivered", "neutral", "Counter", MONEY.lamp],
          ["SO-1033", "Okafor Office fit-out", "Ade Okafor", "8 Oct 2026, 06:23", "Paid", "positive", "Phone", MONEY.lamp],
        ]
          .map(
            ([no, ref, who, when, st, tone, ch, amt]) => `<tr>
          <td><span class="code">${no}</span></td><td class="nowrap">${ref}</td><td>${who}</td><td class="nowrap">${when}</td><td>${badgeRaw(st, tone, "outline")}</td><td>${ch}</td><td class="num">${amt}</td>
        </tr>`,
          )
          .join("")}
      </tbody>
    </table><div class="mt-scrollhint">Scroll sideways for the rest. The order stays pinned.</div>`,
    { flush: true },
  )}
  ${pager(1, 11)}
</div>`,
            "Orders",
          ),
        },
        {
          name: "One line per row, tap to open the rest",
          rationale:
            "Shopify's mobile orders list shows one line per order and opens the tapped row in place, so 268 orders fit a phone without dropping a column. The open row carries the customer, the delivery and the state that the list hides.",
          tradeoff:
            "Comparing customers across rows takes a tap per row, and the open row must stay open across a refresh or a support call loses its place. One open row at a time is the rule; two is a list of open rows.",
          reference: "Shopify",
          html: mshell(
            "Orders",
            `<div class="page">
  ${phead("Orders", "268 orders, newest first.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order or customer", filters: ["Any state"] })}
  ${section(
    "",
    `<div class="rlist">
      <div class="rrow"><span class="txt"><b><span class="code">SO-1042</span></b></span><span class="fig">${MONEY.order}</span><span class="acts"><button class="btn sm">Open</button></span></div>
      <div class="rrow" style="background:var(--muted)"><span class="txt"><b><span class="code">SO-1036</span></b><small>Tom Becker · tom@becker-bouw.example</small><small>${DELIVERY.name} · 8 Oct 2026, 09:30 · Paid</small></span><span class="fig">EUR 40.45</span><span class="acts"><button class="btn sm">Close</button></span></div>
      <div class="rrow"><span class="txt"><b><span class="code">SO-1035</span></b></span><span class="fig">${MONEY.lamp}</span><span class="acts"><button class="btn sm">Open</button></span></div>
      <div class="rrow"><span class="txt"><b><span class="code">SO-1033</span></b></span><span class="fig">${MONEY.lamp}</span><span class="acts"><button class="btn sm">Open</button></span></div>
    </div>`,
  )}
  ${pager(1, 11)}
</div>`,
            "Orders",
          ),
          width: "phone",
        },
        {
          name: "A number too large for the column",
          rationale:
            "A figure that does not fit is shortened rather than wrapped or shrunk: 54,180 becomes 54.2k. The column stays the same width at every scale.",
          tradeoff:
            "A rounded money figure is not a money figure, and a reader who needs the exact amount cannot get it from the cell. It has to be a tooltip or a second read, and a shortened figure in a statement is wrong.",
          html: mshell(
            "Orders",
            `<div class="page">
  ${phead("Orders", "268 orders from 96 customers.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order number, name or email" })}
  ${section(
    "",
    `<table class="dt">
      <thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col">Placed</th><th scope="col">State</th><th scope="col" class="num">Paid</th></tr></thead>
      <tbody>
        ${[
          ["SO-1042", ORDER.customer, "8 Oct 2026, 09:32", "Paid", "positive", "EUR 125.00"],
          ["SO-1036", "Tom Becker", "8 Oct 2026, 09:30", "Paid", "positive", "EUR 40.45"],
          ["SO-1035", "Elin Lindqvist", "8 Oct 2026, 09:27", "Delivered", "neutral", "EUR 45.00"],
          ["SO-1031", "Ade Okafor", "7 Oct 2026, 19:02", "Disputed", "destructive", "EUR 1,738.55"],
          ["SO-1025", "Tom Becker", "6 Oct 2026, 11:20", "Paid", "positive", "EUR 1,284,150.00"],
        ]
          .map(
            ([no, who, when, st, tone, amt]) => `<tr>
          <td><span class="code">${no}</span></td><td>${who}</td><td class="nowrap">${when}</td>
          <td>${badgeRaw(st, tone, "outline")}</td>
          <td class="num" title="${amt}">${amt.replace("EUR 1,284,150.00", "EUR 1.28M").replace("EUR 1,738.55", "EUR 1.7k")}</td>
        </tr>`,
          )
          .join("")}
      </tbody>
    </table>`,
    { flush: true, desc: "Large figures are shortened so the column keeps its width. Hover one for the exact amount." },
  )}
  ${pager(1, 11)}
</div>`,
            "Orders",
          ),
        },
      ],
    },
    {
      id: "density-counts",
      title: "Counting things",
      why: "One rule governs this whole category: <b>a number that can be counted from the system is read, never typed</b>. A hand-maintained table will not be updated and a reviewer will trust it anyway.",
      verdict:
        "Keep counts where the reader would otherwise have to go and get them: the sidebar rows that hold work and the tabs above a list. The runner-up is the stat tiles with their measure stated, which is the better choice for the home page where the question is how large the month is. Never ship counts with the report that produces them: a report name is system language on a page where the reader only wants the number.",
      variants: [
        {
          name: "Counts in the sidebar, on the rows that hold work",
          pick: true,
          rationale:
            "'Refunds 10' in the sidebar, '1 thing to do' on the home page. A count appears where a reader would otherwise have to go and get it.",
          tradeoff:
            "Every count is a read on every page load. And a count of 0 beside an area is an area that looks finished rather than unused.",
          html: mshell(
            "Counts in the frame",
            `<div class="shell">
  ${sidebar("Orders", false).replace(
    "</nav>",
    `
    <a href="#" aria-current="true"><span style="width:12px;display:inline-block;opacity:.55"></span>Orders</a>
    <a href="#" class="sub" style="padding-left:20px">Orders</a>
    <a href="#" class="sub" style="padding-left:20px">Late Payments<span class="n" style="margin-left:auto;font-size:11px">31</span></a>
    <a href="#" class="sub" style="padding-left:20px">Refunds<span class="n" style="margin-left:auto;font-size:11px">10</span></a>
    <a href="#" class="sub" style="padding-left:20px">Exceptions<span class="n" style="margin-left:auto;font-size:11px">2</span></a>
  </nav>`,
  )}
  <div class="main">
    ${bar("Orders")}
    <div class="page">
      ${phead("Refunds", "10 open. 2 are outside the refund window.", "", { crumb: trail("Home", "Orders", "Refunds") })}
      ${section(
        "",
        `<div class="rlist">
          ${[
            ["SO-1029", "Elin Lindqvist", "214 days ago", "No route", "destructive", MONEY.refund],
            ["SO-1024", "Ade Okafor", "181 days ago", "No route", "destructive", MONEY.refund],
            ["SO-1023", "Tom Becker", "5 days ago", "Closing", "caution", MONEY.refund],
            ["SO-1022", "Ade Okafor", "163 days ago", "Open", "neutral", MONEY.refund],
            ["SO-1042", ORDER.customer, "6 days ago", "Open", "neutral", MONEY.lineTotal],
          ]
            .map(([no, who, when, st, tone, amt]) => `<div class="rrow">
            <span class="txt"><b><span class="code">${no}</span> · ${who}</b><small>Asked ${when}</small></span>
            ${badgeRaw(st, tone, "outline")}
            <span class="fig">${amt}</span>
            <span class="acts"><button class="btn sm">Deal with it</button></span>
          </div>`)
            .join("")}
        </div>`,
      )}
      ${pager(1, 1, 1, 5, 10)}
    </div>
  </div>
</div>`,
            "Orders",
          ),
        },
        {
          name: "Counts as stat tiles, with the measure they describe",
          rationale:
            "The home page shape: label, figure, one line saying what the figure counts. Carbon says a KPI is a number with a single word description, and 3 to 5 tiles is a defensible row.",
          tradeoff:
            "A tile's figure is a moment and the next read is a different moment, so two colleagues looking at the same page can see different numbers with no explanation.",
          reference: "Carbon",
          html: mshell(
            "Home tiles",
            `<div class="page">
  ${phead("Good afternoon, Alex", "Two things need you today.", '<button class="btn primary sm">New order</button>')}
  ${tiles(
    tile("Sold this month", "9,412", "Units across every product"),
    tile("Money to settle", "EUR 18,270", "Arriving on 4 November"),
    tile("Refunds open", "10", "2 outside the refund window"),
  )}
  ${section(
    "Needs attention",
    `<div class="alist">
      <div class="arow"><span class="why" aria-hidden="true">◷</span><span class="txt"><b>Close out the Okafor Office fit-out</b><small>The delivery is complete. Nothing left to settle.</small></span><span class="go"><button class="btn sm">Close out</button></span></div>
      <div class="arow"><span class="why" aria-hidden="true">⚑</span><span class="txt"><b>10 refunds need a decision</b><small>2 are outside the refund window and cannot be refunded.</small></span><span class="go"><button class="btn sm">Deal with them</button></span></div>
    </div>`,
    { acts: '<span class="badge caution">2 to do</span>' },
  )}
  <div style="height:12px"></div>
  ${tiles(
    tile("Sold this month", "9,412", "Units across every product", '<span class="delta up" style="margin-top:4px">▲ 12% on September</span>'),
    tile("Money to settle", "EUR 18,270", "Arriving on 4 November", '<span class="delta" style="margin-top:4px">▲ EUR 2,110 on September</span>'),
  )}
</div>`,
            "Home",
          ),
        },
        {
          name: "The count on the tab and in the filter, nowhere else",
          rationale:
            "A count appears where a reader is about to choose: on a tab, beside a filter option. Anywhere else it is a number about a number.",
          tradeoff:
            "A reader on a list with no tabs and no filters has nowhere to see the size of the list except the pagination range.",
          html: mshell(
            "Counts on controls",
            `<div class="page">
  ${phead("Orders", "268 orders from 96 customers.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order number, name or email", views: [{ label: "All 268", on: true }, { label: "Needs attention 12" }, { label: "Awaiting money 31" }, { label: "Refunded 18" }] })}
  ${section(
    "",
    `<table class="dt">
      <thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col">Placed</th><th scope="col">State</th><th scope="col" class="num">Paid</th></tr></thead>
      <tbody>
        ${[
          ["SO-1042", ORDER.customer, "8 Oct 2026, 09:32", "Paid", "positive", MONEY.order],
          ["SO-1036", "Tom Becker", "8 Oct 2026, 09:30", "Paid", "positive", "EUR 40.45"],
          ["SO-1035", "Elin Lindqvist", "8 Oct 2026, 09:27", "Delivered", "neutral", MONEY.lamp],
        ]
          .map(
            ([no, who, when, st, tone, amt]) => `<tr>
          <td><span class="code">${no}</span></td><td>${who}</td><td class="nowrap">${when}</td>
          <td>${badgeRaw(st, tone, "outline")}</td><td class="num">${amt}</td>
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
          name: "No count at all, only the work",
          rationale:
            "The home page holds the things that need doing and no figures. A count is a report, and this page is a queue.",
          tradeoff:
            "A first-time reader opening the dashboard learns nothing about the size of what they have signed up for. And Carbon's split is that a queue and a metrics dashboard answer different questions.",
          reference: "Carbon",
          html: mshell(
            "No counts",
            `<div class="page">
  ${phead("Good afternoon, Alex", "Two things need you today.", '<button class="btn primary sm">New order</button>')}
  ${section(
    "Needs attention",
    `<div class="alist">
      <div class="arow"><span class="why" aria-hidden="true">◷</span><span class="txt"><b>Close out the Okafor Office fit-out</b><small>The delivery is complete. Nothing left to settle.</small></span><span class="go"><button class="btn sm">Close out</button></span></div>
      <div class="arow"><span class="why" aria-hidden="true">⚑</span><span class="txt"><b>Refunds need a decision</b><small>Two are outside the refund window and cannot be refunded.</small></span><span class="go"><button class="btn sm">Deal with them</button></span></div>
    </div>`,
  )}
  ${section(
    "Deliveries",
    `<div class="rlist">
      ${recordRow({ title: DELIVERY.name, sub: "Sat 14 Mar 2026, 08:00 to 12:00 · Amsterdam warehouse", state: { label: "Active", tone: "positive" }, fig: "38 pallets", figSub: "of 40", actions: '<button class="btn sm">Open delivery</button>', lead: "positive" })}
      ${recordRow({ title: "Becker Bouw site delivery", sub: "Tue 13 Oct 2026, 08:00 to 12:00 · Rotterdam site", state: { label: "Scheduled", tone: "info" }, actions: '<button class="btn sm">Open delivery</button>' })}
    </div>`,
  )}
</div>`,
            "Home",
          ),
        },
        {
          name: "Counts with the report that produces them",
          rationale:
            "Each figure names the report that reads it, so a reader who wants a number somewhere else can get it. A figure typed into a page is wrong from the next commit; these are read on demand.",
          tradeoff:
            "A report name beside every figure is system language on a page where the reader only wants the number. It belongs in documentation, not in the product, unless the reader can open the report from it.",
          html: mshell(
            "Counted figures",
            `<div class="page" style="max-width:640px">
  ${phead("The census", "Every figure on this page is read by a report.", "", { crumb: trail("Home", "Reports", "Census") })}
  ${section(
    "What this company holds",
    `<div class="stack sm">
      ${[
        ["Deliveries still scheduled", "93", "Delivery schedule"],
        ["Paid orders", "214", "Orders report"],
        ["Units sold", "9,412", "Sales report"],
        ["Refunds open", "10", "Refunds queue"],
        ["Disputes open", "5", "Payments report"],
        ["Team members", "5", "Team settings"],
        ["Messages sent", "1,204", "Message log"],
      ]
        .map(([what, n, cmd]) => `<div class="split" style="align-items:baseline"><span>${what}<span class="sub">${cmd}</span></span><span class="fig">${n}</span></div>`)
        .join("")}
    </div>`,
    { desc: "A figure typed into a page is wrong from the next commit. These are read on demand." },
  )}
</div>`,
            "Reports",
          ),
        },
        {
          name: "Counts that say when they were read",
          rationale:
            "Vercel's analytics write the read time under each figure with a refresh beside it, so two colleagues seeing different numbers have the reason on the page. A count without its moment is a claim; with it, a dated fact.",
          tradeoff:
            "Refresh is another read per tile, and a page of six tiles tempts six reads on every visit. The times also age while the page sits open, so a stale page says so rather than hiding it.",
          reference: "Vercel",
          html: mshell(
            "Home tiles",
            `<div class="page">
  ${phead("Good afternoon, Alex", "Two things need you today.", '<button class="btn primary sm">New order</button>')}
  ${tiles(
    tile("Sold this month", "9,412", "Units across every product", '<div class="muted" style="font-size:11px;margin-top:4px">Read 2 min ago · <a href="#">Refresh</a></div>'),
    tile("Money to settle", "EUR 18,270", "Arriving on 4 November", '<div class="muted" style="font-size:11px;margin-top:4px">Read 2 min ago · <a href="#">Refresh</a></div>'),
    tile("Refunds open", "10", "2 outside the refund window", '<div class="muted" style="font-size:11px;margin-top:4px">Read 2 min ago · <a href="#">Refresh</a></div>'),
  )}
</div>`,
            "Home",
          ),
        },
        {
          name: "Counts as progress against a target",
          rationale:
            "Shopify's goals and GitHub's milestones draw the count against the target it was set with, so 9,412 reads as nearly full rather than merely large. The target is the company's own figure, stated beside the bar.",
          tradeoff:
            "A target that was never set must say so rather than show 0%, and a target met early sits at 100% while the month runs on. Both need words the page would rather not spend.",
          reference: "Shopify, GitHub",
          html: mshell(
            "Home tiles",
            `<div class="page">
  ${phead("Good afternoon, Alex", "Two things need you today.", '<button class="btn primary sm">New order</button>')}
  ${section(
    "Against the targets you set",
    `<div class="stack">
      <div><div class="split"><span>Oak desk lamp sold<span class="sub">Target 10,000 by 14 March 2026</span></span><span class="fig">9,412</span></div>${progress(94)}</div>
      <div><div class="split"><span>September income<span class="sub">Target EUR 60,000.00</span></span><span class="fig">EUR 63,350.00</span></div>${progress(100)}</div>
      <div><div class="split"><span>Refunds decided<span class="sub">No target set. 10 open, 2 outside the refund window.</span></span><span class="fig">10 open</span></div></div>
    </div>`,
  )}
</div>`,
            "Home",
          ),
        },
        {
          name: "A count with its own date, so it stops being a claim",
          rationale:
            "Every figure carries the moment it was true. A number that moves now says when it was last read, which turns an unanchored claim into a dated fact.",
          tradeoff:
            "A date under every figure is a wall of dates. It is a data product rather than a dashboard.",
          html: mshell(
            "Dated figures",
            `<div class="page" style="max-width:640px">
  ${phead("How the last month went", "Every figure as at 8 October 2026, 14:22, Europe/Amsterdam.")}
  ${section(
    "",
    `<div class="stack sm">
      ${[
        ["Units sold", "9,412", "8 Oct 2026, 14:22"],
        ["Orders placed", "1,204", "8 Oct 2026, 14:22"],
        ["Money taken", "EUR 60,200.00", "8 Oct 2026, 14:21"],
        ["Money refunded", "EUR 1,550.00", "8 Oct 2026, 14:18"],
        ["Arriving 4 November", "EUR 18,270.00", "8 Oct 2026, 14:22"],
        ["Units dispatched yesterday", "1,846", "7 Oct 2026, 18:04"],
      ]
        .map(([what, n, when]) => `<div class="split" style="align-items:baseline"><span>${what}</span><span class="fig">${n}<span class="sub">as at ${when}</span></span></div>`)
        .join("")}
    </div>`,
  )}
</div>`,
            "Reports",
          ),
        },
      ],
    },
    {
      id: "mt-sales-over-time",
      title: "Sales over time",
      why: "A dashboard can answer 'how is the season going' with a number. A number says where the product stands; only a line says whether it is speeding up or slowing down.",
      verdict:
        "Ship the daily columns with the total above and the peak labelled: they answer how much and when in one glance. The runner-up is the cumulative line against the previous season, which is the better choice once the product has a season to beat. Never ship the chart without its table: a figure nobody can read exactly is a figure nobody can cite.",
      variants: [
        {
          name: "Daily columns with the total above",
          pick: true,
          rationale:
            "Shopify's sales reports open with the total and draw the days as columns, so the headline and the shape sit together. The peak day is labelled in words, which is what the company quotes in the review.",
          tradeoff:
            "Thirty columns at phone width are a few pixels each, so the shape survives but the single day does not. The table behind the chart carries the exact day, not the chart.",
          reference: "Shopify",
          html: mshell(
            "Sales over time",
            `<div class="page">
  ${phead("Oak desk lamp, sales", "The 30 days to 8 October 2026, Europe/Amsterdam.", '<button class="btn sm">Download</button>', { crumb: trail("Home", "Products", PRODUCT.name, "Sales") })}
  ${section(
    "Units per day",
    `<div class="mt-chart-head"><span class="mt-big">8,176 units</span><span class="mt-cap">30 days · Peak 8 Oct, 488 units</span></div>
    ${chart({ values: DAILY, max: 500, ticks: [0, 250, 500], xs: ["9 Sep", "23 Sep", "8 Oct"], highlight: 29, label: "Daily unit sales, 9 September to 8 October 2026" })}`,
    { desc: "Counts are units sold, before refunds. Refunds are on the statement, not in this chart." },
  )}
</div>`,
            "Products",
          ),
        },
        {
          name: "Cumulative sales against the previous season",
          rationale:
            "Vercel's analytics draw the previous period as a dashed line behind the current one, so the comparison needs no second chart. A sold line above a dashed line is the whole story of a growing season.",
          tradeoff:
            "A first-year product has no previous season, so the page must say that rather than draw one line and call it a comparison. The dashed line also invites reading a gap that is really a calendar shift.",
          reference: "Vercel",
          html: mshell(
            "Sales over time",
            `<div class="page">
  ${phead("Oak desk lamp, sales", "Sold so far, against the previous season.", '<button class="btn sm">Download</button>', { crumb: trail("Home", "Products", PRODUCT.name, "Sales") })}
  ${section(
    "Cumulative units sold",
    `<div class="mt-chart-head"><span class="mt-big">9,412 units</span><span class="mt-cap">1,042 ahead of the previous season</span></div>
    <div class="mt-legend" style="margin-bottom:12px"><span><i class="mt-key"></i>This season</span><span><i class="mt-key dash"></i>Previous season</span></div>
    ${chart({ values: CUMUL, max: 10000, ticks: [0, 5000, 10000], xs: ["Jun", "Jul", "Aug", "Sep"], kind: "line", second: CUMUL_LAST, fmt: (v) => (v === 0 ? "0" : v / 1000 + "k"), label: "Cumulative units sold against the previous season" })}`,
    { desc: "Both lines count the same weeks after the season launch. The previous season launched a week later." },
  )}
</div>`,
            "Products",
          ),
        },
        {
          name: "An area chart with the weekly average beside it",
          rationale:
            "Stripe's revenue chart fills under the line and states the average beside it, so the eye reads momentum and the figure reads pace. The fill makes a slow week visible as a flat stretch, not as a missing column.",
          tradeoff:
            "A fill under a cumulative line is decoration that can read as stock sitting somewhere. The average beside it is the figure that matters, and it has to say which weeks it covers.",
          reference: "Stripe",
          html: mshell(
            "Sales over time",
            `<div class="page">
  ${phead("Oak desk lamp, sales", "Sold so far, week by week from the season launch.", '<button class="btn sm">Download</button>', { crumb: trail("Home", "Products", PRODUCT.name, "Sales") })}
  ${section(
    "Cumulative units sold",
    `<div class="mt-chart-head"><span class="mt-big">9,412 units</span><span class="mt-cap">Average 672 a week over 14 weeks</span></div>
    ${chart({ values: CUMUL, max: 10000, ticks: [0, 5000, 10000], xs: ["Jun", "Jul", "Aug", "Sep"], kind: "area", fmt: (v) => (v === 0 ? "0" : v / 1000 + "k"), label: "Cumulative units sold, week by week" })}`,
    { desc: "The average covers the 14 weeks since the season launched on 13 January 2026." },
  )}
</div>`,
            "Products",
          ),
        },
        {
          name: "Weekly columns with the average marked",
          rationale:
            "Plausible's dashboard marks the average across the bars, so a glance says which weeks pulled their weight. Weekly columns suit a company that plans marketing spend by week, not by day.",
          tradeoff:
            "Weeks split the story the season tells: launch, steady sale and last call. A week that holds two of them averages them away, and the final two-day column is not a week at all.",
          reference: "Plausible",
          html: mshell(
            "Sales over time",
            `<div class="page">
  ${phead("Oak desk lamp, sales", "The 30 days to 8 October 2026, in weeks.", '<button class="btn sm">Download</button>', { crumb: trail("Home", "Products", PRODUCT.name, "Sales") })}
  ${section(
    "Units per week",
    `<div class="mt-chart-head"><span class="mt-big">8,176 units</span><span class="mt-cap">Weekly average 1,831, full weeks only</span></div>
    ${chart({ values: [1822, 1710, 1770, 2022, 852], max: 2200, ticks: [0, 1100, 2200], xs: ["8 Sep", "15 Sep", "22 Sep", "29 Sep", "7 Oct"], ref: { value: 1831, label: "Weekly average" }, fmt: (v) => (v === 0 ? "0" : v / 1000 + "k"), label: "Units sold per week with the weekly average marked" })}`,
    { desc: "The last column holds two days, 7 and 8 October. The average is over the four full weeks." },
  )}
</div>`,
            "Products",
          ),
        },
        {
          name: "The same figures as a table",
          rationale:
            "GOV.UK's data visualisation guidance is that every chart ships with its data table, because a figure nobody can read exactly is a figure nobody can cite. The table is also what a screen reader reads and what the download carries.",
          tradeoff:
            "A table of 30 days is 30 rows, so weeks are the compromise and the compromise hides the peak day. The chart and the table then show different groupings of the same figures.",
          reference: "GOV.UK",
          html: mshell(
            "Sales over time",
            `<div class="page" style="max-width:640px">
  ${phead("Oak desk lamp, sales", "The 30 days to 8 October 2026, by week.", '<button class="btn sm">Download</button>', { crumb: trail("Home", "Products", PRODUCT.name, "Sales") })}
  ${section(
    "",
    `<table class="dt">
      <thead><tr><th scope="col">Week</th><th scope="col" class="num">Units</th><th scope="col" class="num">Income</th></tr></thead>
      <tbody>
        <tr><td>8 to 14 September</td><td class="num">1,822</td><td class="num">EUR 81,990.00</td></tr>
        <tr><td>15 to 21 September</td><td class="num">1,710</td><td class="num">EUR 76,950.00</td></tr>
        <tr><td>22 to 28 September</td><td class="num">1,770</td><td class="num">EUR 79,650.00</td></tr>
        <tr><td>29 September to 5 October</td><td class="num">2,022</td><td class="num">EUR 90,990.00</td></tr>
        <tr><td>7 to 8 October</td><td class="num">852</td><td class="num">EUR 38,340.00</td></tr>
        <tr><td><b>Total</b></td><td class="num"><b>8,176</b></td><td class="num"><b>EUR 367,920.00</b></td></tr>
      </tbody>
    </table>`,
    { flush: true, desc: "Income is units at the company's own prices, before refunds and fees." },
  )}
</div>`,
            "Products",
          ),
        },
        {
          name: "One sparkline per channel",
          rationale:
            "Vercel's usage page puts a sparkline beside each meter, so three channels share one row each and the shape of each is comparable. The figure beside each line carries the exact count the line cannot.",
          tradeoff:
            "Three sparklines share no axis, so a steep line can mean 30 units or 3,000. The figure beside each one is required, which makes the line a hint rather than the answer.",
          reference: "Vercel",
          html: mshell(
            "Sales over time",
            `<div class="page" style="max-width:640px">
  ${phead("Oak desk lamp, sales", "9,412 units across three channels.", '<button class="btn sm">Download</button>', { crumb: trail("Home", "Products", PRODUCT.name, "Sales") })}
  ${section(
    "By channel, last 14 weeks",
    `<div class="rlist">
      <div class="rrow"><span class="txt"><b>Online shop</b><small>Orders placed in the company's own shop</small></span><span style="width:120px;flex:none">${spark(DAILY)}</span><span class="fig">7,340</span></div>
      <div class="rrow"><span class="txt"><b>Counter</b><small>Sold at the trade counter</small></span><span style="width:120px;flex:none">${spark([12, 9, 14, 22, 31, 28, 19, 11, 10, 16, 24, 29, 36, 33])}</span><span class="fig">1,288</span></div>
      <div class="rrow"><span class="txt"><b>Phone</b><small>Taken by the sales desk by phone</small></span><span style="width:120px;flex:none">${spark([4, 6, 5, 9, 12, 18, 15, 7, 8, 11, 14, 19, 24, 31])}</span><span class="fig">784</span></div>
    </div>`,
    { desc: "Each line is scaled to its own channel. Compare the figures, not the slopes." },
  )}
</div>`,
            "Products",
          ),
        },
      ],
    },
    {
      id: "mt-sales-by-type",
      title: "Sales by product variant",
      why: "The autumn range sells three lamp variants and a guide. The company asks which variant carries the season, and the answer is a share, not a total.",
      verdict:
        "Ship the horizontal bars with the figure on each row: every variant reads with its count and its money in one glance. The runner-up is the table with a bar in each row, which is the better choice once variants gain states such as paused or sold out. Never ship the donut alone: an angle nobody can read exactly is decoration, not a figure.",
      variants: [
        {
          name: "Horizontal bars with the figure on each row",
          pick: true,
          rationale:
            "Shopify's product performance lists each variant with its bar and its money, so the ranking and the figures share one row. Every variant carries its price, its count and its income, which is the whole question in one glance.",
          tradeoff:
            "Bars share one scale, so the guide's EUR 3,150.00 is a sliver beside the lamps. A second product line that matters needs its own scale, which this option refuses to give it.",
          reference: "Shopify",
          html: mshell(
            "Sales by variant",
            `<div class="page" style="max-width:640px">
  ${phead("Autumn range, by variant", "9,412 lamps and 126 guides, at the company's own prices.", '<button class="btn sm">Download</button>', { crumb: trail("Home", "Products", "Autumn range", "Sales") })}
  ${section(
    "Lamps",
    `<div class="mt-hbars">
      ${hbar("Oak desk lamp", "EUR 45.00 · 6,204 units", 6204, 9412, "EUR 279,180.00")}
      ${hbar("Oak desk lamp, small", "EUR 35.00 · 2,108 units", 2108, 9412, "EUR 73,780.00")}
      ${hbar("Brass desk lamp", "EUR 95.00 · 1,100 units", 1100, 9412, "EUR 104,500.00")}
    </div>`,
  )}
  ${section("Design guides", `<div class="mt-hbars">${hbar("Lighting design guide", "EUR 25.00 · 126 guides", 126, 126, "EUR 3,150.00", { tone: "soft" })}</div>`, { desc: "Guides are not lamps, so they keep their own scale rather than a sliver of the lamp bars." })}
</div>`,
            "Products",
          ),
        },
        {
          name: "One stacked bar for the whole range",
          rationale:
            "GitHub's language bar compresses a whole repository into one strip with its legend as figures, which is the right shape for a range with three variants and one total. The strip says the mix; the legend says the money.",
          tradeoff:
            "A strip has no axis, so 22% and 24% are the same length to the eye. The legend carries every exact figure, which makes the strip a summary rather than the answer.",
          reference: "GitHub",
          html: mshell(
            "Sales by variant",
            `<div class="page" style="max-width:640px">
  ${phead("Autumn range, by variant", "9,412 lamps at the company's own prices.", '<button class="btn sm">Download</button>', { crumb: trail("Home", "Products", "Autumn range", "Sales") })}
  ${section(
    "The mix",
    `<div class="stack">
      <div class="mt-stack"><i style="width:65.9%;background:var(--foreground)"></i><i style="width:22.4%;background:var(--muted-foreground)"></i><i style="width:11.7%;background:var(--chart-2)"></i></div>
      <div class="mt-legend"><span><i class="mt-key box"></i>Oak desk lamp · 6,204 · EUR 279,180.00</span><span><i class="mt-key box soft"></i>Small lamp · 2,108 · EUR 73,780.00</span><span><i class="mt-key box" style="background:var(--chart-2);border:0"></i>Brass lamp · 1,100 · EUR 104,500.00</span></div>
    </div>`,
    { desc: "Shares are of units sold, not of income. The brass lamp is 11.7% of units and 22.8% of lamp income." },
  )}
</div>`,
            "Products",
          ),
        },
        {
          name: "A table with a bar in each row",
          rationale:
            "Notion's progress column puts a bar inside the table cell, so the figure and its share never separate. The table also has room for the state each variant is in, which bars alone cannot carry.",
          tradeoff:
            "Five columns need a wide page, so the table scrolls sideways on a phone. The bar in a scrolling table is the first thing cut off, which is where the share lives.",
          reference: "Notion",
          html: mshell(
            "Sales by variant",
            `<div class="page">
  ${phead("Autumn range, by variant", "Every variant with its price, its count and its share.", '<button class="btn sm">Download</button>', { crumb: trail("Home", "Products", "Autumn range", "Sales") })}
  ${section(
    "",
    `<table class="dt">
      <thead><tr><th scope="col">Variant</th><th scope="col">State</th><th scope="col" class="num">Price</th><th scope="col" class="num">Sold</th><th scope="col" class="num">Share</th><th scope="col" class="num">Income</th></tr></thead>
      <tbody>
        <tr><td>Oak desk lamp</td><td>${badgeRaw("Active", "positive", "outline")}</td><td class="num">EUR 45.00</td><td class="num">6,204</td><td><span class="mt-cell-bar">65.9%<span class="mt-track"><i style="width:65.9%"></i></span></span></td><td class="num">EUR 279,180.00</td></tr>
        <tr><td>Oak desk lamp, small</td><td>${badgeRaw("Active", "positive", "outline")}</td><td class="num">EUR 35.00</td><td class="num">2,108</td><td><span class="mt-cell-bar">22.4%<span class="mt-track"><i style="width:22.4%"></i></span></span></td><td class="num">EUR 73,780.00</td></tr>
        <tr><td>Brass desk lamp</td><td>${badgeRaw("Paused", "caution", "outline")}</td><td class="num">EUR 95.00</td><td class="num">1,100</td><td><span class="mt-cell-bar">11.7%<span class="mt-track"><i style="width:11.7%"></i></span></span></td><td class="num">EUR 104,500.00</td></tr>
        <tr><td><b>Lamps</b></td><td></td><td class="num"></td><td class="num"><b>9,412</b></td><td></td><td class="num"><b>EUR 457,460.00</b></td></tr>
      </tbody>
    </table>`,
    { flush: true, desc: "The brass lamp is paused while the supplier confirms the finish. Its sold units stand." },
  )}
</div>`,
            "Products",
          ),
        },
        {
          name: "A tile per type with its share",
          rationale:
            "A per-variant summary gives each variant its own tile with sold and share, so three variants read as three facts rather than one ranking. Tiles suit a home page where the by-variant question is asked in passing.",
          tradeoff:
            "Tiles cannot be sorted or compared at a glance the way bars can, and a fourth variant wraps the row. The price each tile needs makes every tile taller than the figure it carries.",
          html: mshell(
            "Sales by variant",
            `<div class="page">
  ${phead("Autumn range, by variant", "Three variants, one season.", '<button class="btn sm">Download</button>', { crumb: trail("Home", "Products", "Autumn range", "Sales") })}
  <div class="mt-kpis">
    ${kpi("Oak desk lamp", "EUR 279,180.00", { note: "EUR 45.00 · 6,204 units · 65.9%" })}
    ${kpi("Small lamp", "EUR 73,780.00", { note: "EUR 35.00 · 2,108 units · 22.4%" })}
    ${kpi("Brass lamp", "EUR 104,500.00", { note: "EUR 95.00 · 1,100 units · 11.7%" })}
  </div>
</div>`,
            "Products",
          ),
        },
        {
          name: "A donut with its legend as figures",
          rationale:
            "Linear's project progress rings the whole and lists each part with its count, so the shape invites the eye and the legend answers. The donut earns its place where the mix is the message and the ranking is settled.",
          tradeoff:
            "An angle nobody can read exactly is decoration, so the legend carries every figure and the donut carries none. A reader who prints in black and white gets three greys and the legend.",
          reference: "Linear",
          html: mshell(
            "Sales by variant",
            `<div class="page" style="max-width:640px">
  ${phead("Autumn range, by variant", "9,412 lamps at the company's own prices.", '<button class="btn sm">Download</button>', { crumb: trail("Home", "Products", "Autumn range", "Sales") })}
  ${section(
    "The mix",
    `<div class="mt-donut">
      <svg viewBox="0 0 124 124" role="img" aria-label="Lamp mix: 65.9 percent oak, 22.4 percent small, 11.7 percent brass">
        <g transform="rotate(-90 62 62)" fill="none" stroke-width="16">
          <circle cx="62" cy="62" r="45" stroke="var(--foreground)" stroke-dasharray="186.4 96.4" stroke-dashoffset="0"></circle>
          <circle cx="62" cy="62" r="45" stroke="var(--muted-foreground)" stroke-dasharray="63.3 219.4" stroke-dashoffset="-186.4"></circle>
          <circle cx="62" cy="62" r="45" stroke="var(--chart-2)" stroke-dasharray="33.1 249.6" stroke-dashoffset="-249.7"></circle>
        </g>
      </svg>
      <div class="mt-donut-legend">
        <span><i class="mt-swatch" style="background:var(--foreground)"></i><b>Oak desk lamp</b><span class="mt-fig">6,204 · EUR 279,180.00</span></span>
        <span><i class="mt-swatch" style="background:var(--muted-foreground)"></i><b>Small lamp</b><span class="mt-fig">2,108 · EUR 73,780.00</span></span>
        <span><i class="mt-swatch" style="background:var(--chart-2)"></i><b>Brass lamp</b><span class="mt-fig">1,100 · EUR 104,500.00</span></span>
      </div>
    </div>`,
    { desc: "Shares are of units sold. The legend is the accessible form of this chart." },
  )}
</div>`,
            "Products",
          ),
        },
        {
          name: "Two types as lines over the last 30 days",
          rationale:
            "Vercel's analytics compare two series as lines over one axis, so the oak lamp and the brass lamp share the weeks and diverge honestly. Lines suit the question of when the brass lamp slowed, which no total answers.",
          tradeoff:
            "Two lines are the most one chart carries before the tones run out, so the small lamp needs its own chart or no line at all. Lines also share one axis, which flatters the brass lamp by drawing it at the oak lamp's scale.",
          reference: "Vercel",
          html: mshell(
            "Sales by variant",
            `<div class="page">
  ${phead("Autumn range, by variant", "Units per week for two variants, last 30 days.", '<button class="btn sm">Download</button>', { crumb: trail("Home", "Products", "Autumn range", "Sales") })}
  ${section(
    "Oak lamp against brass lamp",
    `<div class="mt-legend" style="margin-bottom:12px"><span><i class="mt-key"></i>Oak desk lamp</span><span><i class="mt-key dash"></i>Brass desk lamp</span></div>
    ${chart({ values: [1202, 1129, 1168, 1334, 562], max: 1400, ticks: [0, 700, 1400], xs: ["8 Sep", "15 Sep", "22 Sep", "29 Sep", "7 Oct"], kind: "line", second: [190, 180, 195, 250, 142], fmt: (v) => (v === 0 ? "0" : v / 1000 + "k"), label: "Weekly units for the oak lamp and the brass lamp" })}`,
    { desc: "The last column holds two days. The small lamp is omitted; three lines share no readable tones." },
  )}
</div>`,
            "Products",
          ),
        },
      ],
    },
    {
      id: "mt-sellthrough",
      title: "Sell-through against capacity",
      why: "The autumn run made 10,000 lamps and 9,412 are sold. The distance between the two is the decision to make more variants, move marketing money, or call the run sold out.",
      verdict:
        "Ship the progress bar with sold, held and left in words: one glance says how far the run has sold and what is still movable. The runner-up is the per-variant sell-through table, which is the better choice when one variant is gone and the others are not. Never ship the countdown alone: '468 left' without the run size hides whether the stock is nearly gone or barely touched.",
      variants: [
        {
          name: "A bar with sold, held and left in words",
          pick: true,
          rationale:
            "A commerce app draws sales as a bar against the run with the counts in words, so the glance and the figures agree. Sold, held and left are three different decisions, which is why all three are named.",
          tradeoff:
            "One bar hides which variant is gone, so a sold-out brass lamp behind a half-empty run reads as room to spare. The per-variant rows answer that, not this bar.",
          html: mshell(
            "Sell-through",
            `<div class="page" style="max-width:640px">
  ${phead("Oak desk lamp, sell-through", "The autumn run made 10,000 lamps.", '<button class="btn sm">Open product</button>', { crumb: trail("Home", "Products", PRODUCT.name, "Sales") })}
  ${section(
    "How far the run has sold",
    `<div class="stack">
      <div><div class="split"><span><b>94.1% sold</b><span class="sub">9,412 of 10,000 lamps</span></span><span class="fig">468 left</span></div>${progress(94)}</div>
      ${facts([["Sold", "9,412 lamps"], ["Held", "120 lamps"], ["Left to sell", "468 lamps"]])}
    </div>`,
    { desc: "Held lamps are reserved for open quotes and samples not yet issued." },
  )}
</div>`,
            "Products",
          ),
        },
        {
          name: "The percentage first, the bar under it",
          rationale:
            "Kickstarter's project pages lead with the funded percentage and draw the bar under it, because the percentage is the sentence and the bar is the illustration. A run at 94% reads as nearly gone before a single count is read.",
          tradeoff:
            "A percentage loves round numbers and this one is not round, so 94.1% either shows its decimal or lies by one place in a thousand. The counts under it are required, not optional.",
          reference: "Kickstarter",
          html: mshell(
            "Sell-through",
            `<div class="page" style="max-width:640px">
  ${phead("Oak desk lamp, sell-through", "The autumn run made 10,000 lamps.", '<button class="btn sm">Open product</button>', { crumb: trail("Home", "Products", PRODUCT.name, "Sales") })}
  ${section(
    "",
    `<div class="stack">
      <div><div class="muted" style="font-size:12px">Sold</div><div class="mt-bignum">94.1%</div><div class="muted" style="font-size:12px">9,412 of 10,000 lamps · 468 left</div></div>
      ${progress(94)}
      <div class="hr"></div>
      <div class="split"><span>Held for quotes and samples</span><span class="fig">120</span></div>
    </div>`,
  )}
</div>`,
            "Products",
          ),
        },
        {
          name: "Sell-through per variant",
          rationale:
            "Shopify's inventory by variant draws each variant against its own stock, because one empty variant and two full ones are not the same as a third gone everywhere. Each row states what restocking that variant would take.",
          tradeoff:
            "Three bars share no scale unless the runs are close, and here they are not. The run total has to sit above the rows or the stock reads as three stocks.",
          reference: "Shopify",
          html: mshell(
            "Sell-through",
            `<div class="page" style="max-width:640px">
  ${phead("Oak desk lamp, sell-through", "9,412 of 10,000 lamps sold.", '<button class="btn sm">Open product</button>', { crumb: trail("Home", "Products", PRODUCT.name, "Sales") })}
  ${section(
    "By variant",
    `<div class="mt-hbars">
      ${hbar("Oak desk lamp", "6,204 of 6,500 lamps", 6204, 6500, "95.4%")}
      ${hbar("Oak desk lamp, small", "2,108 of 2,200 lamps", 2108, 2200, "95.8%")}
      ${hbar("Brass desk lamp", "1,100 of 1,300 lamps · Paused", 1100, 1300, "84.6%", { tone: "caution" })}
    </div>`,
    { desc: "The brass lamp is paused while the supplier confirms the finish. Its 200 unsold lamps cannot be bought." },
  )}
</div>`,
            "Products",
          ),
        },
        {
          name: "The cumulative line with the capacity line",
          rationale:
            "Metabase's goal line draws the target across the time series, so the gap between sold and the run is visible at every week, not just today. The line answers when the run sold, which a bar cannot.",
          tradeoff:
            "A run line at 10,000 flattens everything under it, so a slow month reads as flat whether it sold 300 or 600 a week. The weekly figures behind the line carry the pace, not the chart.",
          reference: "Metabase",
          html: mshell(
            "Sell-through",
            `<div class="page">
  ${phead("Oak desk lamp, sell-through", "Sold so far against the run it must fill.", '<button class="btn sm">Open product</button>', { crumb: trail("Home", "Products", PRODUCT.name, "Sales") })}
  ${section(
    "Against the run",
    `<div class="mt-chart-head"><span class="mt-big">9,412 of 10,000</span><span class="mt-cap">588 lamps under the line, 468 of them for sale</span></div>
    <div class="mt-legend" style="margin-bottom:12px"><span><i class="mt-key"></i>Sold</span><span><i class="mt-key cap"></i>Run of 10,000</span></div>
    ${chart({ values: CUMUL, max: 11000, ticks: [0, 5500, 11000], xs: ["Jun", "Jul", "Aug", "Sep"], kind: "area", ref: { value: 10000, label: "Run of 10,000" }, fmt: (v) => (v === 0 ? "0" : v / 1000 + "k"), label: "Cumulative lamps sold against the run of 10,000" })}`,
    { desc: "The line counts sold lamps. Held lamps are not sold, so they sit under the line with the unsold." },
  )}
</div>`,
            "Products",
          ),
        },
        {
          name: "A countdown tile with the caution it earns",
          rationale:
            "Booking.com's scarcity notes state what is left and at what pace it goes, because a count without a pace is not a decision. The tile says the stock sells out in about two days at the current pace, which is the reorder decision.",
          tradeoff:
            "A pace prediction is wrong the moment sales spike or stall, and a wrong countdown teaches the company to ignore the tile. It must state its basis and its date, which this one does and most do not.",
          reference: "Booking.com",
          html: mshell(
            "Sell-through",
            `<div class="page" style="max-width:640px">
  ${phead("Oak desk lamp, sell-through", "As at 8 October 2026, 14:22, Europe/Amsterdam.", '<button class="btn sm">Open product</button>', { crumb: trail("Home", "Products", PRODUCT.name, "Sales") })}
  ${section(
    "",
    `<div class="stack">
      <div><div class="muted" style="font-size:12px">Lamps left to sell</div><div class="mt-bignum">468</div><div class="muted" style="font-size:12px">of 10,000 · 9,412 sold, 120 held</div></div>
      ${callout("caution", "At the last 7 days' pace of 2,036 lamps a week, the remaining 468 go in about 2 days. The oak lamp and the small lamp are above 95% sold.")}
    </div>`,
  )}
</div>`,
            "Products",
          ),
        },
        {
          name: "Capacity, sold, held and left as a table",
          rationale:
            "Shopify's inventory by location is a table because four figures per row need columns, not bars. Every row adds up across, and every column adds down, so finance can check the arithmetic both ways.",
          tradeoff:
            "A table of four money-less counts reads as stocktaking, which is what it is. It answers the audit and bores the glance, so the bar belongs above it on the page that holds both.",
          reference: "Shopify",
          html: mshell(
            "Sell-through",
            `<div class="page" style="max-width:640px">
  ${phead("Oak desk lamp, sell-through", "Every lamp accounted for, by variant.", '<button class="btn sm">Open product</button>', { crumb: trail("Home", "Products", PRODUCT.name, "Sales") })}
  ${section(
    "",
    `<table class="dt">
      <thead><tr><th scope="col">Variant</th><th scope="col" class="num">Run</th><th scope="col" class="num">Sold</th><th scope="col" class="num">Held</th><th scope="col" class="num">Left</th></tr></thead>
      <tbody>
        <tr><td>Oak desk lamp</td><td class="num">6,500</td><td class="num">6,204</td><td class="num">60</td><td class="num">236</td></tr>
        <tr><td>Oak desk lamp, small</td><td class="num">2,200</td><td class="num">2,108</td><td class="num">40</td><td class="num">52</td></tr>
        <tr><td>Brass desk lamp</td><td class="num">1,300</td><td class="num">1,100</td><td class="num">20</td><td class="num">180</td></tr>
        <tr><td><b>Total</b></td><td class="num"><b>10,000</b></td><td class="num"><b>9,412</b></td><td class="num"><b>120</b></td><td class="num"><b>468</b></td></tr>
      </tbody>
    </table>`,
    { flush: true, desc: "The run is the company's own figure per variant. Held lamps are reserved for open quotes and samples not yet issued." },
  )}
</div>`,
            "Products",
          ),
        },
      ],
    },
    {
      id: "mt-kpi-compare",
      title: "A figure against an earlier period",
      why: "A tile that says EUR 63,350.00 answers how much. Only the tile that adds 'against EUR 48,340.00 in August' answers whether the month was good.",
      verdict:
        "Ship the tiles with a delta pill and the previous figure in words: the comparison is visible and the basis is stated. The runner-up is the tiles with sparklines, which is the better choice on the home page where the shape of the month matters more than one earlier figure. Never ship a bare percentage with no basis: 'up 12%' without saying 12% of what is a claim, not a comparison.",
      variants: [
        {
          name: "Tiles with a delta pill and the previous figure",
          pick: true,
          rationale:
            "Stripe's home tiles compare each figure against the previous period with the basis stated under the delta, so the reader never asks 'compared to what'. The pill carries direction and size; the words carry the basis.",
          tradeoff:
            "Three tiles each with a pill, a basis and a note are three small paragraphs, which is heavy for a home page. A fourth KPI wraps the row and the comparison wraps with it.",
          reference: "Stripe",
          html: mshell(
            "September against August",
            `<div class="page">
  ${phead("September 2026", "Against August 2026, same 30 days.", '<button class="btn sm">Download</button>', { crumb: trail("Home", "Reports", "Revenue") })}
  <div class="mt-kpis">
    ${kpi("Income", "EUR 63,350.00", { delta: '<span class="mt-pill up">▲ 31.1%</span> <span class="mt-was">August EUR 48,340.00</span>', dir: "up", note: "1,148 orders" })}
    ${kpi("Units sold", "9,412", { delta: '<span class="mt-pill up">▲ 8.1%</span> <span class="mt-was">August 8,706</span>', dir: "up", note: "Across every product" })}
    ${kpi("Refunds", "EUR 1,550.00", { delta: '<span class="mt-pill down">▲ EUR 570.00</span> <span class="mt-was">August EUR 980.00</span>', dir: "down", note: "31 units, back to the customers' own payments" })}
  </div>
</div>`,
            "Reports",
          ),
        },
        {
          name: "Tiles with sparklines",
          rationale:
            "Vercel's usage tiles pair each meter with its sparkline, so the month reads as a shape rather than as two endpoints. A steady climb and a last-week spike end at the same figure and mean different things.",
          tradeoff:
            "A sparkline shares no axis with its neighbours, so the refund line can look calmer than the income line while rising faster. The delta pill beside each one is still required.",
          reference: "Vercel",
          html: mshell(
            "September against August",
            `<div class="page">
  ${phead("September 2026", "Against August 2026, same 30 days.", '<button class="btn sm">Download</button>', { crumb: trail("Home", "Reports", "Revenue") })}
  <div class="mt-kpis">
    ${kpi("Income", "EUR 63,350.00", { delta: '<span class="mt-pill up">▲ 31.1%</span>', dir: "up", sparkline: spark(DAILY) })}
    ${kpi("Units sold", "9,412", { delta: '<span class="mt-pill up">▲ 8.1%</span>', dir: "up", sparkline: spark(CUMUL) })}
    ${kpi("Refunds", "EUR 1,550.00", { delta: '<span class="mt-pill down">▲ EUR 570.00</span>', dir: "down", sparkline: spark([4, 6, 5, 9, 12, 18, 15, 7, 8, 11, 14, 19, 24, 31], { cls: "soft" }) })}
  </div>
</div>`,
            "Reports",
          ),
        },
        {
          name: "A comparison column on the statement",
          rationale:
            "Xero's comparative profit and loss adds last period as a column with the change in money, so the statement stays the statement and gains the trend. The change is in money because percent of a small August line misleads.",
          tradeoff:
            "Four columns of money need a wide page, so the table scrolls sideways on a phone. The scroll hides September first, which is the column the reader came for.",
          reference: "Xero",
          html: mshell(
            "September against August",
            `<div class="page" style="max-width:720px">
  ${phead("September 2026", "Beside August 2026, with the change in money.", '<button class="btn sm">Download</button>', { crumb: trail("Home", "Reports", "Statements", "September 2026") })}
  ${section(
    "",
    `<table class="dt mt-sticky">
      <thead><tr><th scope="col">Line</th><th scope="col" class="num">August</th><th scope="col" class="num">September</th><th scope="col" class="num">Change</th></tr></thead>
      <tbody>
        <tr><td>Income</td><td class="num">EUR 48,340.00</td><td class="num">${SEPT.income}</td><td class="num"><span class="mt-pill up">+EUR 15,010.00</span></td></tr>
        <tr><td>Refunds</td><td class="num">${MINUS}EUR 980.00</td><td class="num">${SEPT.refunds}</td><td class="num"><span class="mt-pill down">${MINUS}EUR 570.00</span></td></tr>
        <tr><td>Fees taken at each payment</td><td class="num">${MINUS}EUR 341.10</td><td class="num">${SEPT.fees}</td><td class="num"><span class="mt-pill down">${MINUS}EUR 112.22</span></td></tr>
        <tr><td><b>Net for Acme Supply</b></td><td class="num"><b>EUR 47,018.90</b></td><td class="num"><b>${SEPT.net}</b></td><td class="num"><span class="mt-pill up">+EUR 14,327.78</span></td></tr>
      </tbody>
    </table>`,
    { flush: true, desc: "August held 918 orders; September held 1,148. The change column is September minus August." },
  )}
</div>`,
            "Reports",
          ),
        },
        {
          name: "The comparison in the heading",
          rationale:
            "Linear's cycle summary states the comparison in one sentence under the heading, so the page reads as a verdict rather than as a worksheet. The tiles under it stay clean figures with no pills competing for attention.",
          tradeoff:
            "One sentence holds one comparison, so the second KPI either shares the sentence or loses its comparison. A reader who wants the basis still has to find it in the tiles.",
          reference: "Linear",
          html: mshell(
            "September against August",
            `<div class="page">
  ${phead("September 2026", "Income EUR 63,350.00, up 31.1% on August's EUR 48,340.00. Units up 8.1%; refunds up EUR 570.00.", '<button class="btn sm">Download</button>', { crumb: trail("Home", "Reports", "Revenue") })}
  ${tiles(
    tile("Income", "EUR 63,350.00", "1,148 orders"),
    tile("Units sold", "9,412", "Across every product"),
    tile("Refunds", "EUR 1,550.00", "31 units"),
  )}
</div>`,
            "Reports",
          ),
        },
        {
          name: "KPIs as a table with previous and change",
          rationale:
            "Baremetrics' metrics table lists each KPI with its previous value and its change in one row, so six KPIs share one alignment. A table suits finance, where the comparison is audited rather than glanced at.",
          tradeoff:
            "A table of KPIs reads as a report, which is what it is. It has no place on the home page, where three tiles answer faster than six rows.",
          reference: "Baremetrics",
          html: mshell(
            "September against August",
            `<div class="page" style="max-width:680px">
  ${phead("September 2026", "Every headline figure against August 2026.", '<button class="btn sm">Download</button>', { crumb: trail("Home", "Reports", "Revenue") })}
  ${section(
    "",
    `<table class="dt">
      <thead><tr><th scope="col">Figure</th><th scope="col" class="num">August</th><th scope="col" class="num">September</th><th scope="col" class="num">Change</th></tr></thead>
      <tbody>
        <tr><td>Income</td><td class="num">EUR 48,340.00</td><td class="num">EUR 63,350.00</td><td class="num"><span class="mt-pill up">+31.1%</span></td></tr>
        <tr><td>Units sold</td><td class="num">8,706</td><td class="num">9,412</td><td class="num"><span class="mt-pill up">+8.1%</span></td></tr>
        <tr><td>Orders</td><td class="num">918</td><td class="num">1,148</td><td class="num"><span class="mt-pill up">+25.1%</span></td></tr>
        <tr><td>Refunds</td><td class="num">EUR 980.00</td><td class="num">EUR 1,550.00</td><td class="num"><span class="mt-pill down">+EUR 570.00</span></td></tr>
        <tr><td>Net for Acme Supply</td><td class="num">EUR 47,018.90</td><td class="num">${SEPT.net}</td><td class="num"><span class="mt-pill up">+30.5%</span></td></tr>
      </tbody>
    </table>`,
    { flush: true, desc: "Percent where the basis is large, money where it is small. Refunds move against the reader, so the pill is red." },
  )}
</div>`,
            "Reports",
          ),
        },
        {
          name: "No comparison, only the figure with its date",
          rationale:
            "GOV.UK's statistics releases state the period with no comparison until the next release exists, because a comparison without a fair basis misleads. A new company's first month has no August, so the tile says when instead of versus.",
          tradeoff:
            "A figure with no comparison answers how much and never whether it was good. The month this option suits is the first one; every month after it wants the delta back.",
          reference: "GOV.UK",
          html: mshell(
            "September, first month",
            `<div class="page">
  ${phead("September 2026", "The first full month. There is no earlier period to compare against.", '<button class="btn sm">Download</button>', { crumb: trail("Home", "Reports", "Revenue") })}
  <div class="mt-kpis">
    ${kpi("Income", "EUR 63,350.00", { note: "As at 30 September 2026 · 1,148 orders" })}
    ${kpi("Units sold", "9,412", { note: "As at 30 September 2026" })}
    ${kpi("Refunds", "EUR 1,550.00", { note: "As at 30 September 2026 · 31 units" })}
  </div>
</div>`,
            "Reports",
          ),
        },
      ],
    },
    {
      id: "mt-settlement-schedule",
      title: "When the money arrives",
      why: "The payment provider holds the company's money and pays it out on its own days. The company plans wages and supplier runs around those days, so the schedule is a planning surface, not a history.",
      verdict:
        "Ship the list of upcoming payouts with the sales each one holds: the company sees what arrives and when in one place. The runner-up is the past payouts table with bank references, which is the better choice for finance reconciling against the bank. Never ship the single next-payout tile as the page: one arrival without the ones after it cannot plan a month.",
      variants: [
        {
          name: "Upcoming payouts with the sales each one holds",
          pick: true,
          rationale:
            "Stripe's payouts list pairs each payout with its arrival date and the sales it holds, so the company plans around arrivals rather than around sales. Each row states its state, because a payout building up is not a payout sent.",
          tradeoff:
            "A building payout moves with every order, so its amount is stale the moment the page sits open. The page must date each figure, which the list does and a tile cannot.",
          reference: "Stripe",
          html: mshell(
            "Payouts",
            `<div class="page" style="max-width:680px">
  ${phead("Payouts", "What the provider sends to NL91 ABNA 0417 1643, and when.", '<button class="btn sm">Download</button>', { crumb: trail("Home", "Reports", "Payouts") })}
  ${section(
    "On the way and building up",
    `<div class="mt-settle">
      <div class="mt-settle-row"><span class="mt-when"><b>Mon 12 Oct 2026</b></span><span class="mt-what">Sales of 5 to 11 October · 418 orders</span><span class="mt-amt">EUR 8,412.55</span>${badgeRaw("On its way", "info")}</div>
      <div class="mt-settle-row"><span class="mt-when"><b>Mon 19 Oct 2026</b></span><span class="mt-what">Sales of 12 to 18 October · 96 orders so far</span><span class="mt-amt">EUR 3,204.10</span>${badgeRaw("Building up", "neutral")}</div>
      <div class="mt-settle-row"><span class="mt-when"><b>Mon 5 Oct 2026</b></span><span class="mt-what">Sales of 28 to 30 September · 214 orders</span><span class="mt-amt">EUR 6,117.46</span>${badgeRaw("Paid out", "positive")}</div>
    </div>`,
    { desc: "The provider holds the money and pays it out. The back office reads the schedule and never holds any of it." },
  )}
</div>`,
            "Reports",
          ),
        },
        {
          name: "Payouts grouped by week with totals",
          rationale:
            "QuickBooks groups deposits by week with a total per group, because wages and supplier runs are planned by week. The group total is the figure the company carries into the week's planning.",
          tradeoff:
            "A week that holds two payouts, which happens around holidays, gets a total that is really two arrivals. The group then needs its dates restated, which the flat list never needs.",
          reference: "QuickBooks",
          html: mshell(
            "Payouts",
            `<div class="page" style="max-width:680px">
  ${phead("Payouts", "What the provider sends to NL91 ABNA 0417 1643, and when.", '<button class="btn sm">Download</button>', { crumb: trail("Home", "Reports", "Payouts") })}
  <div class="stack">
  ${section(
    "Week of 12 October · EUR 8,412.55",
    `<div class="mt-settle">
      <div class="mt-settle-row"><span class="mt-when"><b>Mon 12 Oct</b></span><span class="mt-what">Sales of 5 to 11 October · 418 orders</span><span class="mt-amt">EUR 8,412.55</span>${badgeRaw("On its way", "info")}</div>
    </div>`,
  )}
  ${section(
    "Week of 5 October · EUR 6,117.46",
    `<div class="mt-settle">
      <div class="mt-settle-row"><span class="mt-when"><b>Mon 5 Oct</b></span><span class="mt-what">Sales of 28 to 30 September · 214 orders</span><span class="mt-amt">EUR 6,117.46</span>${badgeRaw("Paid out", "positive")}</div>
    </div>`,
  )}
  ${section(
    "Week of 28 September · EUR 12,618.04",
    `<div class="mt-settle">
      <div class="mt-settle-row"><span class="mt-when"><b>Mon 28 Sep</b></span><span class="mt-what">Sales of 21 to 27 September · 302 orders</span><span class="mt-amt">EUR 12,618.04</span>${badgeRaw("Paid out", "positive")}</div>
    </div>`,
  )}
  </div>
</div>`,
            "Reports",
          ),
        },
        {
          name: "One payout's journey from sale to bank",
          rationale:
            "Wise's transfer timeline states each step with its time, so a reader waiting on money sees where it stands rather than a single pending state. The last step carries the expected date, which is the planning figure.",
          tradeoff:
            "A journey per payout is one page per payout, so the schedule of the month needs the list as well. Four steps for money that has not moved can also read as reassurance rather than information.",
          reference: "Wise",
          html: mshell(
            "Payout",
            `<div class="page" style="max-width:560px">
  ${trail("Home", "Reports", "Payouts", "12 Oct 2026")}
  <div class="phead"><div><h1>EUR 8,412.55 ${badgeRaw("On its way", "info")}</h1><p class="desc">Sales of 5 to 11 October, 418 orders. Expected Tue 14 October.</p></div></div>
  ${section(
    "Where it stands",
    `<div class="tl">
      ${timelineEntry("418 orders paid by customers", "5 to 11 Oct 2026", "The provider holds the money")}
      ${timelineEntry("The provider created the payout", "Mon 12 Oct 2026, 06:04", "Provider")}
      ${timelineEntry("Sent to NL91 ABNA 0417 1643", "Mon 12 Oct 2026, 09:15", "Provider")}
      ${timelineEntry("Expected on the bank statement", "Tue 14 Oct 2026", "", "neutral", true)}
    </div>`,
    { desc: "Refunds given before Monday are already taken off. Refunds after it wait for the next payout." },
  )}
</div>`,
            "Reports",
          ),
        },
        {
          name: "Past payouts with their bank references",
          rationale:
            "Revolut Business' payout history carries the bank reference on each row, because finance ticks each payout against a bank line. The reference is copyable, which is the whole job of this table.",
          tradeoff:
            "A history answers reconciliation and nothing else: it says what arrived, never what is coming. The upcoming list has to sit above it or the page plans nothing.",
          reference: "Revolut Business",
          html: mshell(
            "Payouts",
            `<div class="page">
  ${phead("Payouts", "What arrived, with the reference each bank line carries.", '<button class="btn sm">Download</button>', { crumb: trail("Home", "Reports", "Payouts") })}
  ${section(
    "",
    `<table class="dt">
      <thead><tr><th scope="col">Paid out</th><th scope="col">Covers</th><th scope="col" class="num">Amount</th><th scope="col">Bank reference</th><th scope="col">State</th></tr></thead>
      <tbody>
        <tr><td class="nowrap">5 Oct 2026</td><td>28 to 30 Sep</td><td class="num">EUR 6,117.46</td><td><span class="copyable"><span class="code">SH-PO-44182</span><button aria-label="Copy the bank reference">⧉</button></span></td><td>${badgeRaw("Paid out", "positive", "outline")}</td></tr>
        <tr><td class="nowrap">28 Sep 2026</td><td>21 to 27 Sep</td><td class="num">EUR 12,618.04</td><td><span class="copyable"><span class="code">SH-PO-44007</span><button aria-label="Copy the bank reference">⧉</button></span></td><td>${badgeRaw("Paid out", "positive", "outline")}</td></tr>
        <tr><td class="nowrap">21 Sep 2026</td><td>14 to 20 Sep</td><td class="num">EUR 14,906.72</td><td><span class="copyable"><span class="code">SH-PO-43831</span><button aria-label="Copy the bank reference">⧉</button></span></td><td>${badgeRaw("Paid out", "positive", "outline")}</td></tr>
        <tr><td class="nowrap">14 Sep 2026</td><td>7 to 13 Sep</td><td class="num">EUR 16,284.10</td><td><span class="copyable"><span class="code">SH-PO-43655</span><button aria-label="Copy the bank reference">⧉</button></span></td><td>${badgeRaw("Paid out", "positive", "outline")}</td></tr>
      </tbody>
    </table>`,
    { flush: true, desc: "September's five payouts total EUR 61,346.68, which is the September statement net." },
  )}
</div>`,
            "Reports",
          ),
        },
        {
          name: "A month with its payout days marked",
          rationale:
            "Google Calendar's month answers 'when' faster than any list, because payout Mondays form a rhythm the eye keeps. The amounts sit under the month, so the calendar plans and the list below it states.",
          tradeoff:
            "A month shows rhythm and hides amounts, so every figure lives below the fold of the calendar. A reader who wants the total scrolls past the pattern to find it.",
          reference: "Google Calendar",
          html: mshell(
            "Payouts",
            `<div class="page" style="max-width:560px">
  ${phead("October 2026", "Payouts land on Mondays.", '<button class="btn sm">Download</button>', { crumb: trail("Home", "Reports", "Payouts") })}
  ${section(
    "",
    `<div class="stack">
      <div class="mt-cal"><span></span><span></span><span></span><span>1</span><span>2</span><span>3</span><span>4</span><span class="mt-pay">5</span><span>6</span><span>7</span><span class="mt-today">8</span><span>9</span><span>10</span><span>11</span><span class="mt-pay">12</span><span>13</span><span>14</span><span>15</span><span>16</span><span>17</span><span>18</span><span class="mt-pay">19</span><span>20</span><span>21</span><span>22</span><span>23</span><span>24</span><span>25</span><span class="mt-pay">26</span><span>27</span><span>28</span><span>29</span><span>30</span><span>31</span><span></span></div>
      <div class="mt-cal-cap"><span>Marked days are payout days.</span><span>8 October is today.</span></div>
      <div class="hr"></div>
      <div class="split"><span>Mon 5 Oct, paid out<span class="sub">Sales of 28 to 30 September</span></span><span class="fig">EUR 6,117.46</span></div>
      <div class="split"><span>Mon 12 Oct, on its way<span class="sub">Sales of 5 to 11 October</span></span><span class="fig">EUR 8,412.55</span></div>
      <div class="split"><span>Mon 19 Oct, building up<span class="sub">Sales of 12 to 18 October, so far</span></span><span class="fig">EUR 3,204.10</span></div>
    </div>`,
  )}
</div>`,
            "Reports",
          ),
        },
        {
          name: "The next payout as a tile, the rest behind a link",
          rationale:
            "Monzo's upcoming payments lead with the next arrival and keep the rest one tap away, which suits a home page where the payout question is asked in passing. The tile states the date, the amount and what it holds.",
          tradeoff:
            "One arrival without the ones after it cannot plan a month, so the tile is a pointer rather than a page. A reader who stops at the tile mistakes the next payout for the position.",
          reference: "Monzo",
          html: mshell(
            "Home",
            `<div class="page">
  ${phead("Good afternoon, Alex", "Two things need you today.", '<button class="btn primary sm">New order</button>')}
  ${section(
    "Next payout",
    `<div class="stack">
      <div><div class="muted" style="font-size:12px">Mon 12 Oct 2026 · Sales of 5 to 11 October, 418 orders</div><div class="mt-bignum">EUR 8,412.55</div></div>
      <div class="btnrow"><button class="btn sm">All payouts</button><button class="btn sm ghost">September statement</button></div>
    </div>`,
    { desc: "The provider holds the money until it pays out. The back office never holds any of it." },
  )}
</div>`,
            "Home",
          ),
        },
      ],
    },
    {
      id: "mt-vendor-invoice",
      title: "The vendor's invoice to the company",
      why: "Billing holds what the company owes its software vendor: the Business subscription and anything metered. The invoice is the one document where the vendor is the seller, so it must read as the vendor's sale, not the company's.",
      verdict:
        "Ship the document-style invoice with the usage behind each line: finance sees what the fee paid for without opening another page. The runner-up is the paid invoice with its mandate reference, which is the better state of the same document once the money has moved. Never ship the invoice without its VAT lines: a business invoice without VAT is not an invoice.",
      variants: [
        {
          name: "The invoice as a document, with the usage behind each line",
          pick: true,
          rationale:
            "Xero's invoice preview is the document the customer receives, with each line carrying the quantity behind it. The company reads what the vendor charged and why in one place, which is the whole point of an invoice.",
          tradeoff:
            "A document is a page of its own, so the invoice list needs the state of each invoice without opening it. The list carries the states; this page carries the lines.",
          reference: "Xero",
          html: mshell(
            "Invoice",
            `<div class="page" style="max-width:680px">
  ${trail("Home", "Invoices", "Invoices", "2026-1841")}
  <div class="phead"><div><h1>Invoice 2026-1841 ${badgeRaw("Unpaid", "caution")}</h1><p class="desc">September 2026 · Due 15 October 2026 · Collected by SEPA mandate.</p></div><div class="acts"><button class="btn sm">Download PDF</button></div></div>
  ${section(
    "",
    `<div class="mt-doc">
      <div class="mt-doc-head">
        <div class="mt-from"><b>Meridian Software B.V.</b><br>Herengracht 420, 1017 BZ Amsterdam<br>VAT NL987654321B01 · KvK 87654321</div>
        <div class="mt-meta"><span class="mt-doc-title">EUR 204.97</span><br><span class="muted">Due 15 October 2026</span><br><span class="muted">To Acme Supply</span></div>
      </div>
      <div style="overflow-x:auto"><table>
        <thead><tr><th scope="col">What</th><th scope="col" class="r">Quantity</th><th scope="col" class="r">Rate</th><th scope="col" class="r">Amount</th></tr></thead>
        <tbody>
          <tr><td>Business subscription, September 2026<small>Acme Supply, Business plan</small></td><td class="r">1 month</td><td class="r">EUR 49.00</td><td class="r">EUR 49.00</td></tr>
          <tr><td>Usage fee<small>1,204 paid orders in September</small></td><td class="r">1,204 orders</td><td class="r">EUR 0.10</td><td class="r">EUR 120.40</td></tr>
        </tbody>
      </table></div>
      <div class="mt-totals">
        <div><span>Subtotal, excluding VAT</span><span>EUR 169.40</span></div>
        <div><span>VAT, 21%</span><span>EUR 35.57</span></div>
        <div class="mt-due"><span>Due</span><span>EUR 204.97</span></div>
      </div>
      <div class="mt-collected"><span class="muted" style="font-size:12px">Collected by SEPA mandate ACM-2024-0117 from NL91 ABNA 0417 1643 on 15 October 2026. The usage fee was taken by the provider at each sale and is listed here for the record.</span></div>
    </div>`,
  )}
</div>`,
            "Invoices",
          ),
        },
        {
          name: "The same invoice as statement lines",
          rationale:
            "Moneybird's invoice view lists the lines the way they were entered, with no document chrome. The statement shape suits a reader who checks figures rather than files documents, and it is the shape the rest of finance already uses.",
          tradeoff:
            "A statement is not an invoice: it carries no seller address, no VAT number and no mandate reference. Finance can check it but cannot file it, so the document has to exist behind it.",
          reference: "Moneybird",
          html: mshell(
            "Invoice",
            `<div class="page" style="max-width:640px">
  ${trail("Home", "Invoices", "Invoices", "2026-1841")}
  <div class="phead"><div><h1>Invoice 2026-1841 ${badgeRaw("Unpaid", "caution")}</h1><p class="desc">September 2026 · Due 15 October 2026.</p></div><div class="acts"><button class="btn sm">Download PDF</button></div></div>
  ${section(
    "",
    statement(
      [
        { label: "What the vendor charged", lines: [{ what: "Business subscription", sub: "September 2026", amount: "EUR 49.00" }, { what: "Usage fee", sub: "1,204 paid orders at EUR 0.10", amount: "EUR 120.40" }], totalLabel: "Subtotal, excluding VAT", total: "EUR 169.40" },
        { label: "Tax", lines: [{ what: "VAT, 21%", amount: "EUR 35.57" }], totalLabel: "Total VAT", total: "EUR 35.57" },
      ],
      { label: "Due 15 October 2026", amount: "EUR 204.97" },
    ),
  )}
</div>`,
            "Invoices",
          ),
        },
        {
          name: "Paid, with the mandate reference and the date",
          rationale:
            "Wise's paid receipts carry the reference and the date above the lines, so a filed invoice answers 'when and how' without being read. The stamp states the state in the document's own language, not the dashboard's.",
          tradeoff:
            "A stamp is final in a way a badge is not, so a payment that later fails leaves a stamped invoice that lies. The state must follow the mandate, not the page the reader printed.",
          reference: "Wise",
          html: mshell(
            "Invoice",
            `<div class="page" style="max-width:680px">
  ${trail("Home", "Invoices", "Invoices", "2026-1702")}
  <div class="phead"><div><h1>Invoice 2026-1702 ${badgeRaw("Paid", "positive")}</h1><p class="desc">August 2026 · Paid 15 August 2026 by SEPA mandate ACM-2024-0117.</p></div><div class="acts"><button class="btn sm">Download PDF</button></div></div>
  ${section(
    "",
    `<div class="mt-doc">
      <div class="mt-doc-head">
        <div class="mt-from"><b>Meridian Software B.V.</b><br>Herengracht 420, 1017 BZ Amsterdam<br>VAT NL987654321B01 · KvK 87654321</div>
        <div class="mt-meta"><span class="mt-doc-title">EUR 190.45</span><br><span class="mt-stamp" style="color:var(--positive-surface-foreground)">Paid</span></div>
      </div>
      <div style="overflow-x:auto"><table>
        <thead><tr><th scope="col">What</th><th scope="col" class="r">Quantity</th><th scope="col" class="r">Rate</th><th scope="col" class="r">Amount</th></tr></thead>
        <tbody>
          <tr><td>Business subscription, August 2026<small>Acme Supply, Business plan</small></td><td class="r">1 month</td><td class="r">EUR 49.00</td><td class="r">EUR 49.00</td></tr>
          <tr><td>Usage fee<small>1,084 paid orders in August</small></td><td class="r">1,084 orders</td><td class="r">EUR 0.10</td><td class="r">EUR 108.40</td></tr>
        </tbody>
      </table></div>
      <div class="mt-totals">
        <div><span>Subtotal, excluding VAT</span><span>EUR 157.40</span></div>
        <div><span>VAT, 21%</span><span>EUR 33.05</span></div>
        <div class="mt-due"><span>Paid 15 August 2026</span><span>EUR 190.45</span></div>
      </div>
    </div>`,
  )}
</div>`,
            "Invoices",
          ),
        },
        {
          name: "Overdue, with what happens next",
          rationale:
            "GitHub's failed-payment notice states what is owed, how to pay it and what happens if it is not paid, in that order. The company owes the vendor money on this page, so the page must say the remedy before it says the consequence.",
          tradeoff:
            "A consequence with a date is a threat with a date, however plainly it is worded. The date must be the real one from the agreement, which the mock states and the product must read from the subscription.",
          reference: "GitHub",
          html: mshell(
            "Invoice",
            `<div class="page" style="max-width:680px">
  ${trail("Home", "Invoices", "Invoices", "2026-1841")}
  <div class="phead"><div><h1>Invoice 2026-1841 ${badgeRaw("Overdue", "destructive")}</h1><p class="desc">September 2026 · EUR 204.97 was due 15 October 2026. 5 days overdue.</p></div><div class="acts"><button class="btn primary sm">Pay EUR 204.97</button></div></div>
  ${alert("destructive", "The SEPA collection failed on 15 October 2026.", "The bank returned 'insufficient funds' for mandate ACM-2024-0117. Pay by bank transfer or fix the mandate and the vendor collects again on 22 October.")}
  ${section(
    "",
    `<div class="stack">
      <div class="split"><span>Due since 15 October 2026</span><span class="fig">EUR 204.97</span></div>
      <div class="split"><span>Pay by bank transfer to<span class="sub">Meridian Software B.V., NL44 ABNA 0123 4567, reference 2026-1841</span></span><span class="fig">EUR 204.97</span></div>
      <div class="split"><span>If unpaid on 29 October 2026<span class="sub">The Business plan pauses. Orders continue; new products cannot be created.</span></span><span class="fig">Plan pauses</span></div>
    </div>`,
  )}
</div>`,
            "Invoices",
          ),
        },
        {
          name: "Every invoice with its state",
          rationale:
            "Stripe's invoices table lists each invoice with its period, its amount and its state, so the list answers 'do I owe anything' before any invoice is opened. The state column is the page; the amounts are the detail.",
          tradeoff:
            "A list of invoices says nothing about what any invoice holds, so a surprising total needs the document. Each row opens the invoice, which must then carry the usage this list omits.",
          reference: "Stripe",
          html: mshell(
            "Invoices",
            `<div class="page">
  ${phead("Invoices", "What Acme Supply owes the vendor, newest first.", "", { crumb: trail("Home", "Invoices", "Invoices") })}
  ${section(
    "",
    `<table class="dt">
      <thead><tr><th scope="col">Invoice</th><th scope="col">Period</th><th scope="col">State</th><th scope="col">Due</th><th scope="col" class="num">Total</th></tr></thead>
      <tbody>
        <tr><td><span class="code">2026-1841</span></td><td>September 2026</td><td>${badgeRaw("Unpaid", "caution", "outline")}</td><td class="nowrap">15 Oct 2026</td><td class="num">EUR 204.97</td></tr>
        <tr><td><span class="code">2026-1702</span></td><td>August 2026</td><td>${badgeRaw("Paid", "positive", "outline")}</td><td class="nowrap">15 Aug 2026</td><td class="num">EUR 190.45</td></tr>
        <tr><td><span class="code">2026-1563</span></td><td>July 2026</td><td>${badgeRaw("Paid", "positive", "outline")}</td><td class="nowrap">15 Jul 2026</td><td class="num">EUR 182.71</td></tr>
      </tbody>
    </table>`,
    { flush: true, desc: "Subscription and usage fee, including VAT. Open an invoice for its lines." },
  )}
</div>`,
            "Invoices",
          ),
        },
        {
          name: "The usage fee line opened to its orders",
          rationale:
            "AWS's bill breaks each line into the usage behind it, because a metered fee without its meter is a figure on trust. The per-product counts add up to the 1,204 orders on the invoice, which is the check finance runs.",
          tradeoff:
            "Usage behind every line doubles the length of every invoice, so the breakdown belongs one step behind the document. A reader who never opens it trusts the line, which is what the invoice asks.",
          reference: "AWS",
          html: mshell(
            "Invoice",
            `<div class="page" style="max-width:640px">
  ${trail("Home", "Invoices", "Invoices", "2026-1841")}
  <div class="phead"><div><h1>Usage fee, September 2026</h1><p class="desc">EUR 120.40 for 1,204 paid orders at EUR 0.10, on invoice 2026-1841.</p></div></div>
  ${section(
    "Orders behind the fee",
    `<table class="dt">
      <thead><tr><th scope="col">Product</th><th scope="col" class="num">Paid orders</th><th scope="col" class="num">Fee</th></tr></thead>
      <tbody>
        <tr><td>Oak desk lamp</td><td class="num">836</td><td class="num">EUR 83.60</td></tr>
        <tr><td>Brass desk lamp</td><td class="num">268</td><td class="num">EUR 26.80</td></tr>
        <tr><td>Lighting design guide</td><td class="num">100</td><td class="num">EUR 10.00</td></tr>
        <tr><td><b>Total</b></td><td class="num"><b>1,204</b></td><td class="num"><b>EUR 120.40</b></td></tr>
      </tbody>
    </table>`,
    { flush: true, desc: "Refunded orders carry no usage fee. The fee was taken by the provider at each sale." },
  )}
</div>`,
            "Invoices",
          ),
        },
      ],
    },
    {
      id: "mt-vat-rates",
      title: "Two VAT rates on one page",
      why: "Books carry 9% and a lamp carries 21%. The customer sees one total; the company's books see two rates, and the page that mixes them is the page the tax return is built from.",
      verdict:
        "Ship the VAT split under the order total with the rate on each line: the customer-facing total stays one figure and the books get both rates. The runner-up is the per-rate report with taxable bases, which is the better choice at quarter end when finance files the return. Never ship prices with no VAT note at all: a lawful price states what the tax is.",
      variants: [
        {
          name: "The VAT split under the order total",
          pick: true,
          rationale:
            "Coolblue's receipts split VAT per rate under the total, so one customer-facing figure opens into the books' two rates. Each line states its base and its tax, which is what the return needs per rate.",
          tradeoff:
            "Three more rows under every total, which is heavy on a receipt for two lamps. The split belongs on the record and the export, not on every row of the orders list.",
          reference: "Coolblue",
          html: mshell(
            "Order",
            `<div class="page" style="max-width:560px">
  ${trail("Home", "Orders", ORDER.number)}
  <div class="phead"><div><h1>${ORDER.number} ${badgeRaw("Paid", "positive")}</h1><p class="desc">${ORDER.customer} · 3 lines · Prices include VAT.</p></div></div>
  ${section(
    "What she paid",
    `<div class="stmt">
      <div class="line"><span>Oak desk lamp<span class="sub">2 at EUR 45.00</span></span><span class="fig">EUR 90.00</span></div>
      <div class="line"><span>Delivery fee<span class="sub">EUR 10.00 on this order</span></span><span class="fig">EUR 10.00</span></div>
      <div class="line"><span>Lighting design guide<span class="sub">Posted with the lamps</span></span><span class="fig">EUR 25.00</span></div>
      <div class="sub-total"><span>Paid by the customer</span><span class="fig">EUR 125.00</span></div>
    </div>`,
  )}
  ${section(
    "VAT in that total",
    `<div class="stack sm">
      <div class="mt-vat-row"><span class="mt-rate">9%</span><span>Books<span class="sub">Base EUR 22.94</span></span><span class="mt-fig">EUR 2.06</span></div>
      <div class="mt-vat-row"><span class="mt-rate">21%</span><span>Lamps and delivery fee<span class="sub">Base EUR 82.64</span></span><span class="mt-fig">EUR 17.36</span></div>
      <div class="mt-vat-row"><span><b>Total VAT</b></span><span class="mt-fig"><b>EUR 19.42</b></span></div>
    </div>`,
    { desc: "The rates come from the company's tax settings. Books are taxed at 9%, lamps and fees at 21%." },
  )}
</div>`,
            "Orders",
          ),
        },
        {
          name: "The rate on each invoice line",
          rationale:
            "Moneybird's invoice lines carry their own rate, so a mixed invoice is right on every line rather than in a summary that must be trusted. The rate badge sits where the eye checks the amount.",
          tradeoff:
            "A rate column narrows every other column on a document that already has four of them. An invoice with one rate repeats the same badge on every line, which says nothing after the first.",
          reference: "Moneybird",
          html: mshell(
            "Invoice",
            `<div class="page" style="max-width:680px">
  ${trail("Home", "Invoices", "Invoices", "2026-1841")}
  <div class="phead"><div><h1>Invoice 2026-1841 ${badgeRaw("Unpaid", "caution")}</h1><p class="desc">September 2026 · Due 15 October 2026.</p></div><div class="acts"><button class="btn sm">Download PDF</button></div></div>
  ${section(
    "",
    `<div class="mt-doc">
      <div class="mt-doc-head">
        <div class="mt-from"><b>Meridian Software B.V.</b><br>Herengracht 420, 1017 BZ Amsterdam<br>VAT NL987654321B01 · KvK 87654321</div>
        <div class="mt-meta"><span class="mt-doc-title">EUR 204.97</span><br><span class="muted">Due 15 October 2026</span></div>
      </div>
      <div style="overflow-x:auto"><table>
        <thead><tr><th scope="col">What</th><th scope="col">VAT</th><th scope="col" class="r">Amount, excl. VAT</th></tr></thead>
        <tbody>
          <tr><td>Business subscription, September 2026<small>1 month at EUR 49.00</small></td><td><span class="mt-rate">21%</span></td><td class="r">EUR 49.00</td></tr>
          <tr><td>Usage fee<small>1,204 orders at EUR 0.10</small></td><td><span class="mt-rate">21%</span></td><td class="r">EUR 120.40</td></tr>
        </tbody>
      </table></div>
      <div class="mt-totals">
        <div><span>Subtotal, excluding VAT</span><span>EUR 169.40</span></div>
        <div><span>VAT, 21%</span><span>EUR 35.57</span></div>
        <div class="mt-due"><span>Due</span><span>EUR 204.97</span></div>
      </div>
    </div>`,
    { desc: "The vendor's sale carries one rate, so both badges agree. The company's own sales mix 9% and 21%." },
  )}
</div>`,
            "Invoices",
          ),
        },
        {
          name: "A per-rate summary on the statement",
          rationale:
            "Xero's tax summary groups collected VAT by rate under the income it came from, so the statement's last group is the return's first draft. Each line states its base, because the return taxes the base, not the gross.",
          tradeoff:
            "VAT on the statement repeats figures the VAT report owns, so two pages state the same tax. The statement's group must match the report to the cent, which is a second read that can disagree.",
          reference: "Xero",
          html: mshell(
            "Statements",
            `<div class="page" style="max-width:640px">
  ${trail("Home", "Reports", "Statements", "September 2026")}
  <div class="phead"><div><h1>September 2026</h1><p class="desc">Every euro of the month under the kind it is.</p></div><div class="acts"><button class="btn sm">Download</button></div></div>
  ${section(
    "",
    statement(
      [
        { label: "Income", lines: [{ what: "Lamp sales", sub: SEPT.units, amount: SEPT.sales }, { what: "Service fees customers paid", sub: SEPT.units, amount: SEPT.serviceFees }, { what: "Design guides", sub: "126 guides", amount: SEPT.guides }], totalLabel: "Total income", total: SEPT.income },
        { label: "VAT in that income", lines: [{ what: "At 21%, on lamps and fees", sub: "Base EUR 49,752.07", amount: "EUR 10,447.93" }, { what: "At 9%, on books", sub: "Base EUR 2,889.91", amount: "EUR 260.09" }], totalLabel: "Total VAT collected", total: "EUR 10,708.02" },
      ],
      { label: "Net for Acme Supply", amount: SEPT.net },
    ),
  )}
</div>`,
            "Reports",
          ),
        },
        {
          name: "Rate badges beside each product",
          rationale:
            "Shopify's product tax settings show the rate beside each product, so the company sees the tax where they set the price. A wrong rate is caught at the price, not at the return.",
          tradeoff:
            "A rate on the product page is a setting shown as a fact, and a reader may not know where to change it. Each badge must open the tax settings, not just state the rate.",
          reference: "Shopify",
          html: mshell(
            "Products",
            `<div class="page" style="max-width:640px">
  ${phead("Products and fees", "Every price includes VAT at the rate beside it.", '<button class="btn sm">Tax settings</button>', { crumb: trail("Home", "Products") })}
  ${section(
    "",
    `<div class="rlist">
      <div class="rrow"><span class="txt"><b>Oak desk lamp</b><small>EUR 45.00, includes VAT</small></span><span class="mt-rate">21%</span><span class="acts"><button class="btn sm">Edit</button></span></div>
      <div class="rrow"><span class="txt"><b>Oak desk lamp, small</b><small>EUR 35.00, includes VAT</small></span><span class="mt-rate">21%</span><span class="acts"><button class="btn sm">Edit</button></span></div>
      <div class="rrow"><span class="txt"><b>Brass desk lamp</b><small>EUR 95.00, includes VAT</small></span><span class="mt-rate">21%</span><span class="acts"><button class="btn sm">Edit</button></span></div>
      <div class="rrow"><span class="txt"><b>Lighting design guide</b><small>EUR 25.00, includes VAT</small></span><span class="mt-rate">9%</span><span class="acts"><button class="btn sm">Edit</button></span></div>
      <div class="rrow"><span class="txt"><b>Delivery fee</b><small>EUR 5.00 per unit, includes VAT</small></span><span class="mt-rate">21%</span><span class="acts"><button class="btn sm">Edit</button></span></div>
    </div>`,
    { desc: "The rates come from the tax settings. A price in the shop always states that it includes VAT." },
  )}
</div>`,
            "Products",
          ),
        },
        {
          name: "A VAT report with taxable bases",
          rationale:
            "Exact's VAT return overview lists each rate with its base and its tax, because the return is filed per rate. The quarter's two lines are the two lines finance copies into the filing.",
          tradeoff:
            "A report per rate says nothing about which products produced it, so a surprising base needs the product sales behind it. The report must open those sales, not just state the base.",
          reference: "Exact",
          html: mshell(
            "VAT report",
            `<div class="page" style="max-width:640px">
  ${phead("Third quarter 2026", "VAT collected, per rate, with the base each rate taxed.", '<button class="btn sm">Download</button>', { crumb: trail("Home", "Reports", "VAT") })}
  ${section(
    "",
    `<table class="dt">
      <thead><tr><th scope="col">Rate</th><th scope="col" class="num">Base</th><th scope="col" class="num">VAT</th><th scope="col" class="num">Gross</th></tr></thead>
      <tbody>
        <tr><td><span class="mt-rate">21%</span> Lamps and fees</td><td class="num">EUR 133,520.66</td><td class="num">EUR 28,039.34</td><td class="num">EUR 161,560.00</td></tr>
        <tr><td><span class="mt-rate">9%</span> Books</td><td class="num">EUR 26,753.21</td><td class="num">EUR 2,407.79</td><td class="num">EUR 29,161.00</td></tr>
        <tr><td><b>Total</b></td><td class="num"><b>EUR 160,273.87</b></td><td class="num"><b>EUR 30,447.13</b></td><td class="num"><b>EUR 190,721.00</b></td></tr>
      </tbody>
    </table>`,
    { flush: true, desc: "The rates come from the company's tax settings. Gross is what customers paid, including VAT." },
  )}
</div>`,
            "Reports",
          ),
        },
        {
          name: "Inclusive prices with a breakdown behind a note",
          rationale:
            "Apple's store shows the inclusive price with the tax behind a note, because the customer reads one figure and the books read two. The note keeps the order page clean while the breakdown stays one step away.",
          tradeoff:
            "A breakdown behind a note is a breakdown a reader may never open, and finance opens it on every order it checks. What the return needs should not hide behind what the customer skims past.",
          reference: "Apple",
          html: mshell(
            "Order",
            `<div class="page" style="max-width:560px">
  ${trail("Home", "Orders", ORDER.number)}
  <div class="phead"><div><h1>${ORDER.number} ${badgeRaw("Paid", "positive")}</h1><p class="desc">${ORDER.customer} · ${DELIVERY.name}</p></div></div>
  ${section(
    "What she paid",
    `<div class="stmt">
      <div class="line"><span>Oak desk lamp<span class="sub">2 lamps, incl. 21% VAT</span></span><span class="fig">EUR 90.00</span></div>
      <div class="line"><span>Delivery fee<span class="sub">Incl. 21% VAT</span></span><span class="fig">EUR 10.00</span></div>
      <div class="line"><span>Lighting design guide<span class="sub">Incl. 9% VAT</span></span><span class="fig">EUR 25.00</span></div>
      <div class="grand"><span>Paid, incl. VAT</span><span class="fig">EUR 125.00</span></div>
    </div>`,
  )}
  ${section(
    "VAT in that total",
    `<div class="stack sm">
      <button class="btn sm ghost" style="justify-content:flex-start">Show the VAT split: EUR 17.36 at 21%, EUR 2.06 at 9%</button>
      <span class="muted" style="font-size:11.5px">The customer sees one total. The books see both rates.</span>
    </div>`,
  )}
</div>`,
            "Orders",
          ),
        },
      ],
    },
    {
      id: "mt-phone-numbers",
      title: "Numbers at phone width",
      why: "Alex Morgan checks the day's dispatch from the warehouse floor on a phone. At 390 pixels a money column, a date column and a state badge do not fit side by side, so the page must choose what the number needs beside it.",
      verdict:
        "Ship the two-column KPI pair with the record list under it: the day's figures stay visible and every order keeps its amount right-aligned. The runner-up is the statement that keeps its alignment at 390, which is the better choice for finance pages where the adding-up is the point. Never ship the desktop table unchanged at 390: a table that scrolls sideways for its money column hides the answer.",
      compact: {
        option: "KPIs in pairs with the orders under them",
        behaviour: "At 390 pixels the figures pair two across with the latest records under them. Tables become record lists with one right-aligned amount per row, statements keep their alignment with short labels, and charts halve their axis labels.",
      },
      variants: [
        {
          name: "KPIs in pairs with the orders under them",
          pick: true,
          width: "phone",
          rationale:
            "Shopify's mobile dashboard pairs its KPIs two across, so four figures fit above the fold of a phone without shrinking to decoration. The orders under them keep one amount each, right-aligned, which is the column the list is about.",
          tradeoff:
            "Two across at 390 pixels is 169 pixels a tile, so a long figure wraps or clips. Figures over ten characters need the single-column list, not the pair.",
          reference: "Shopify",
          html: mshell(
            "Today",
            `<div class="page">
  ${phead("Saturday dispatch", "Today, 08:00 to 18:00 · Amsterdam warehouse.", "")}
  <div class="mt-kpis mt-two">
    ${kpi("Picked", "9,412", { note: "of 10,000" })}
    ${kpi("Left to pick", "468", { note: "120 held" })}
    ${kpi("Income", "EUR 63,350.00", { note: "September" })}
    ${kpi("Refunds open", "10", { note: "2 outside the window" })}
  </div>
  <div style="height:12px"></div>
  ${section(
    "Latest orders",
    `<div class="rlist">
      <div class="rrow"><span class="txt"><b><span class="code">SO-1042</span></b><small>Maria Garcia · 09:32</small></span><span class="fig">EUR 125.00</span></div>
      <div class="rrow"><span class="txt"><b><span class="code">SO-1036</span></b><small>Tom Becker · 09:30</small></span><span class="fig">EUR 40.45</span></div>
      <div class="rrow"><span class="txt"><b><span class="code">SO-1035</span></b><small>Elin Lindqvist · 09:27</small></span><span class="fig">EUR 45.00</span></div>
    </div>`,
  )}
</div>`,
            "Orders",
          ),
        },
        {
          name: "One figure per row",
          width: "phone",
          rationale:
            "Revolut's account lists one figure per row with its label on the left, because a phone column is one number wide. Every amount keeps its code and its decimals, which the paired tiles cannot promise.",
          tradeoff:
            "One row per figure is six rows for six figures, so the page scrolls where the pairs fit. A reader comparing two figures holds one in memory while reading the other.",
          reference: "Revolut",
          html: mshell(
            "Today",
            `<div class="page">
  ${phead("September 2026", "Every headline figure, one per row.", "")}
  ${section(
    "",
    `<div class="mt-numlist">
      ${split("Income", "EUR 63,350.00", "1,148 orders")}
      ${split("Units sold", "9,412", "Across every product")}
      ${split("Refunds", "EUR 1,550.00", "31 units")}
      ${split("Net for Acme Supply", "<b>EUR 61,346.68</b>", "After refunds and fees")}
    </div>`,
  )}
</div>`,
            "Reports",
          ),
        },
        {
          name: "Orders as records with amounts right-aligned",
          width: "phone",
          rationale:
            "ING's mobile activity list keeps one amount per row, right-aligned in tabular figures, so the money column survives without a table. The state sits under the name, where it is read second.",
          tradeoff:
            "No sorting by column and no comparison across a column, because there are no columns. A reader hunting one order they were told about is served; a reader auditing the day is not.",
          reference: "ING",
          html: mshell(
            "Orders",
            `<div class="page">
  ${phead("Orders", "268 orders, newest first.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order or customer" })}
  ${section(
    "",
    `<div class="rlist">
      <div class="rrow"><span class="txt"><b><span class="code">SO-1042</span> · Maria Garcia</b><small>Garcia Interiors restock · 8 Oct, 09:32 · Paid</small></span><span class="fig">EUR 125.00</span></div>
      <div class="rrow"><span class="txt"><b><span class="code">SO-1036</span> · Tom Becker</b><small>Garcia Interiors restock · 8 Oct, 09:30 · Paid</small></span><span class="fig">EUR 40.45</span></div>
      <div class="rrow"><span class="txt"><b><span class="code">SO-1030</span> · Tom Becker</b><small>Garcia Interiors restock · 8 Oct, 09:12 · Refunded</small></span><span class="fig"><span class="mt-neg">${MINUS}EUR 50.00</span></span></div>
      <div class="rrow"><span class="txt"><b><span class="code">SO-1035</span> · Elin Lindqvist</b><small>Accessories only · 8 Oct, 09:27 · Delivered</small></span><span class="fig">EUR 45.00</span></div>
    </div>`,
  )}
  ${pager(1, 11)}
</div>`,
            "Orders",
          ),
        },
        {
          name: "A statement that keeps its alignment",
          width: "phone",
          rationale:
            "Xero's mobile profit and loss keeps the statement shape at phone width, because money that adds up must add up everywhere. Short labels and tabular figures keep the alignment the desktop page has.",
          tradeoff:
            "Labels short enough for 390 pixels lose the counts the desktop lines carry. The statement adds up but no longer says what it adds, which the full labels do.",
          reference: "Xero",
          html: mshell(
            "Statements",
            `<div class="page">
  ${phead("September 2026", "Every euro of the month.", "", { crumb: trail("Home", "Reports") })}
  ${section(
    "",
    statement(
      [
        { label: "Income", lines: [{ what: "Lamps", amount: SEPT.sales }, { what: "Service fees", amount: SEPT.serviceFees }, { what: "Guides", amount: SEPT.guides }], totalLabel: "Income", total: SEPT.income },
        { label: "Out", lines: [{ what: "Refunds", amount: SEPT.refunds }, { what: "Fees", amount: SEPT.fees }], totalLabel: "Out", total: SEPT.out },
      ],
      { label: "Net", amount: SEPT.net },
    ),
  )}
</div>`,
            "Reports",
          ),
        },
        {
          name: "A chart with half its labels",
          width: "phone",
          rationale:
            "Plausible's mobile chart halves its axis labels, because two true labels beat five overlapping ones. The total above the chart carries the figure; the chart carries the shape and nothing else.",
          tradeoff:
            "Two labels cannot place a mid-month spike, so the shape floats between its endpoints. A reader who needs the week of a spike opens the table, which the chart must offer.",
          reference: "Plausible",
          html: mshell(
            "Sales",
            `<div class="page">
  ${phead("Oak desk lamp, sales", "30 days to 8 October 2026.", "", { crumb: trail("Home", "Products") })}
  ${section(
    "Units per day",
    `<div class="mt-chart-head"><span class="mt-big">8,176</span><span class="mt-cap">Peak 8 Oct, 488</span></div>
    ${chart({ values: DAILY, max: 500, ticks: [0, 500], xs: ["9 Sep", "8 Oct"], highlight: 29, label: "Daily unit sales, 9 September to 8 October 2026" })}`,
    { desc: "Two labels at this width. The weekly table carries the exact days." },
  )}
</div>`,
            "Products",
          ),
        },
        {
          name: "The table that becomes a list",
          width: "phone",
          rationale:
            "GitHub's mobile web turns wide tables into stacked lists under 640 pixels, so the same page serves both widths without a second route. The swap follows the viewport, not the device.",
          tradeoff:
            "Two markups for one table is two markups to keep in agreement, and a screen reader meets the hidden one unless it is properly removed. The list must carry every fact the table drops, not just the pretty ones.",
          reference: "GitHub",
          html: mshell(
            "Orders",
            `<div class="page">
  ${phead("Orders", "268 orders, newest first.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order or customer" })}
  ${section(
    "",
    `<div class="mt-resp-table"><table class="dt">
      <thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col">Placed</th><th scope="col">State</th><th scope="col" class="num">Paid</th></tr></thead>
      <tbody>
        <tr><td><span class="code">SO-1042</span></td><td>Maria Garcia</td><td class="nowrap">8 Oct, 09:32</td><td>${badgeRaw("Paid", "positive", "outline")}</td><td class="num">EUR 125.00</td></tr>
        <tr><td><span class="code">SO-1036</span></td><td>Tom Becker</td><td class="nowrap">8 Oct, 09:30</td><td>${badgeRaw("Paid", "positive", "outline")}</td><td class="num">EUR 40.45</td></tr>
        <tr><td><span class="code">SO-1035</span></td><td>Elin Lindqvist</td><td class="nowrap">8 Oct, 09:27</td><td>${badgeRaw("Delivered", "neutral", "outline")}</td><td class="num">EUR 45.00</td></tr>
      </tbody>
    </table></div>
    <div class="mt-resp-list rlist">
      <div class="rrow"><span class="txt"><b><span class="code">SO-1042</span> · Maria Garcia</b><small>8 Oct, 09:32 · Paid</small></span><span class="fig">EUR 125.00</span></div>
      <div class="rrow"><span class="txt"><b><span class="code">SO-1036</span> · Tom Becker</b><small>8 Oct, 09:30 · Paid</small></span><span class="fig">EUR 40.45</span></div>
      <div class="rrow"><span class="txt"><b><span class="code">SO-1035</span> · Elin Lindqvist</b><small>8 Oct, 09:27 · Delivered</small></span><span class="fig">EUR 45.00</span></div>
    </div>`,
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
      id: "density-identifiers",
      title: "Showing an identifier",
      why: "The rule is specific: <b>an identifier shown on screen is labelled and copyable</b>, and a raw code never reaches the screen. A serial page that shows <code>SN-0C893968A2</code> as plain text, or a messages list showing identifiers where a subject should be, both break it.",
      verdict:
        "Ship the labelled, monospaced, copyable code on the record: it is the rule's shape and the one thing a support case needs quoted. The runner-up is the identifier as the record's name, which is the better choice for records with no human name such as a serial number in the warehouse. Never ship the page with no identifier: a record nobody can quote is a record support cannot help with.",
      variants: [
        {
          name: "A code, monospaced, labelled and copyable",
          pick: true,
          rationale:
            "The shared code shape: monospaced, never wrapped, with a copy control. A code a person reads aloud on a support call is a fact, not decoration.",
          tradeoff:
            "A copy control on every row of a list is a control per row. And a code in a monospaced font is visibly different from a name, which is correct and slightly louder than the page around it.",
          html: mshell(
            "Order",
            `<div class="page" style="max-width:560px">
  ${trail("Home", "Orders", ORDER.number)}
  <div class="phead"><div><h1>${ORDER.number} ${badgeRaw("Paid", "positive")}</h1><p class="desc">${ORDER.customer} · ${COMPANY.name}</p></div><div class="acts"><button class="btn primary sm">Message customer</button></div></div>
  ${section(
    "",
    `<div class="stack">
      <div class="split"><span>Order number<span class="sub">Quote it when you call about the order</span></span><span class="fig"><span class="copyable"><span class="code">${ORDER.number}</span><button aria-label="Copy the order number">⧉</button></span></span></div>
      <div class="split"><span>Bank reference<span class="sub">For a support case with the provider</span></span><span class="fig"><span class="copyable"><span class="code">SH-88213</span><button aria-label="Copy the bank reference">⧉</button></span></span></div>
      <div class="split"><span>Serial numbers<span class="sub">2 lamps, neither registered</span></span><span class="fig"><span class="copyable"><span class="code">SN-0C893968A2, SN-0C893968A3</span><button aria-label="Copy both serial numbers">⧉</button></span></span></div>
    </div>`,
  )}
</div>`,
            "Orders",
          ),
        },
        {
          name: "The identifier labelled by what it is, not by its form",
          rationale:
            "The label says Order number rather than Reference, because a reference could be anything. A reader who knows what a thing is can use it; a reader who does not can ask.",
          tradeoff:
            "Some identifiers have no natural name and end up labelled by their kind, which tells a reader nothing about where to use it.",
          html: mshell(
            "Dispute",
            `<div class="page" style="max-width:560px">
  ${trail("Home", "Reports", "Disputes", "D-0182")}
  <div class="phead"><div><h1>Dispute D-0182 ${badgeRaw("Disputed", "destructive")}</h1><p class="desc">${MONEY.lamp} on order SO-1031. Opened 2 Oct 2026 by the provider.</p></div><div class="acts"><button class="btn primary sm">Answer the bank</button></div></div>
  ${section(
    "",
    `<div class="stack">
      <div class="split"><span>Case number<span class="sub">What the provider calls it</span></span><span class="fig"><span class="copyable"><span class="code">D-0182</span><button aria-label="Copy the case number">⧉</button></span></span></div>
      <div class="split"><span>Order it is about</span><span class="fig"><span class="copyable"><span class="code">SO-1031</span><button aria-label="Copy the order number">⧉</button></span></span></div>
      <div class="split"><span>Charge it disputes<span class="sub">The card payment itself</span></span><span class="fig"><span class="copyable"><span class="code">SH-88213</span><button aria-label="Copy the charge reference">⧉</button></span></span></div>
    </div>`,
  )}
</div>`,
            "Reports",
          ),
        },
        {
          name: "The identifier behind a disclosure",
          rationale:
            "A code a reader usually does not need is hidden behind a disclosure. It is there for a support case and out of the way otherwise.",
          tradeoff:
            "A hidden code is a code a reader does not know exists. On the record where a support case is likely, that is the wrong place to hide it.",
          html: mshell(
            "Order",
            `<div class="page" style="max-width:560px">
  ${trail("Home", "Orders", ORDER.number)}
  <div class="phead"><div><h1>${ORDER.number} ${badgeRaw("Paid", "positive")}</h1><p class="desc">${ORDER.customer} · ${DELIVERY.name}</p></div><div class="acts"><button class="btn primary sm">Message customer</button></div></div>
  ${section(
    "The order",
    facts([
      ["Customer", `${ORDER.customer}<br><span class="muted">${ORDER.email}</span>`],
      ["Placed", ORDER.placed],
      ["Paid", MONEY.order],
      ["Lamps", "2, neither registered"],
    ], { stacked: true }),
  )}
  ${section(
    "Details for a support case",
    `<div class="stack sm">
      <button class="btn sm ghost" style="justify-content:flex-start">Show the bank reference and both serial numbers</button>
      <span class="muted" style="font-size:11.5px">Needed only if the provider or the customer asks about this specific payment.</span>
    </div>`,
  )}
</div>`,
            "Orders",
          ),
        },
        {
          name: "No identifier, because the reader knows the record",
          rationale:
            "Nothing technical is shown. A reader who arrived by clicking the record already knows which record it is, and a code is noise to them.",
          tradeoff:
            "It removes the one thing a reader needs to quote in a support conversation. And a reader who arrived by address, which happens, has no way to tell two records apart.",
          html: mshell(
            "Order",
            `<div class="page" style="max-width:560px">
  ${trail("Home", "Orders", "Maria Garcia, 8 October")}
  <div class="phead"><div><h1>Maria Garcia's order ${badgeRaw("Paid", "positive")}</h1><p class="desc">${DELIVERY.name} · 8 October 2026 at 09:32 · ${MONEY.order}</p></div><div class="acts"><button class="btn primary sm">Message her</button></div></div>
  ${section(
    "What she bought",
    `<div class="stmt">
      <div class="line"><span>Oak desk lamp<span class="sub">2 lamps</span></span><span class="fig">${MONEY.lineTotal}</span></div>
      <div class="line"><span>Delivery fee</span><span class="fig">EUR 10.00</span></div>
      <div class="line"><span>Lighting design guide<span class="sub">Posted with the lamps</span></span><span class="fig">EUR 25.00</span></div>
      <div class="grand"><span>Paid by the customer</span><span class="fig">${MONEY.order}</span></div>
    </div>`,
  )}
  ${section("Lamps", `<div class="rlist">
      ${recordRow({ title: "Oak desk lamp", sub: "Covers one lamp. The serial number is in her message.", state: { label: "Not registered", tone: "neutral" } })}
      ${recordRow({ title: "Oak desk lamp", sub: "Covers one lamp. The serial number is in her message.", state: { label: "Not registered", tone: "neutral" } })}
    </div>`, { desc: "Nothing technical on this page." })}
</div>`,
            "Orders",
          ),
        },
        {
          name: "The identifier as the record's name",
          rationale:
            "Where a record has no human name, the identifier is the heading: the code is what the record is called and it is never repeated as a field.",
          tradeoff:
            "A code as a heading is not readable aloud. It is the right shape for a system where the code is all there is and the wrong shape for one where a person named the thing.",
          html: mshell(
            "Serial number",
            `<div class="page" style="max-width:560px">
  ${trail("Home", "Products", PRODUCT.name, "Serials", "SN-0C893968A2")}
  <div class="phead"><div><h1 class="mono" style="font-size:19px">SN-0C893968A2 ${badgeRaw("Not registered", "neutral")}</h1><p class="desc">One Oak desk lamp, sold on order SO-1042.</p></div><div class="acts"><button class="btn sm">Deactivate</button></div></div>
  ${section(
    "",
    facts([
      ["Covers", "One lamp"],
      ["Owner", ORDER.customer],
      ["Order", ORDER.number],
      ["Issued", "8 Oct 2026, 09:34"],
      ["Registered", "Never"],
    ], { stacked: true }),
  )}
  ${section(
    "How it was used",
    `<div class="tl">
      ${timelineEntry("Assigned at packing", "8 Oct 2026, 09:34", "Amsterdam warehouse")}
      ${timelineEntry("Sent in the shipping confirmation", "8 Oct 2026, 09:34", "Amsterdam warehouse", "neutral", true)}
    </div>`,
  )}
</div>`,
            "Products",
          ),
        },
        {
          name: "Click the code to copy it",
          rationale:
            "Vercel copies a deployment address on click and answers 'Copied', so the identifier is its own control with no button beside it. The code stays monospaced and labelled, and the confirmation is the feedback the click needs.",
          tradeoff:
            "There is no visible affordance until hover, so a reader may never try. Keyboard users need the code to be a real button, which it is, with its label read aloud.",
          reference: "Vercel",
          html: mshell(
            "Order",
            `<div class="page" style="max-width:560px">
  ${trail("Home", "Orders", ORDER.number)}
  <div class="phead"><div><h1>${ORDER.number} ${badgeRaw("Paid", "positive")}</h1><p class="desc">${ORDER.customer} · ${DELIVERY.name}. Select a code to copy it.</p></div></div>
  ${section(
    "",
    `<div class="stack">
      <div class="split"><span>Order number</span><span class="fig"><button class="mt-copied" style="border:0">SO-1042 <span class="mt-ic">Copy</span></button></span></div>
      <div class="split"><span>Bank reference</span><span class="fig"><button class="mt-copied done" style="border:0">SH-88213 <span class="mt-ic">Copied</span></button></span></div>
      <div class="split"><span>Serial numbers</span><span class="fig"><button class="mt-copied" style="border:0">SN-0C893968A2 <span class="mt-ic">Copy</span></button></span></div>
    </div>`,
    { desc: "The bank reference was just copied. The confirmation lasts two seconds." },
  )}
</div>`,
            "Orders",
          ),
        },
        {
          name: "A short code on the list, the full one on the record",
          rationale:
            "Stripe's dashboard shortens a charge identifier in the list and shows it whole on the record, because a list is scanned and a record is quoted. Search accepts either form, so the short code is never a dead end.",
          tradeoff:
            "Shortened identifiers can collide on screen, and a reader quoting the short form in a support case forces a second question. The record must show the full reference above the fold, not behind a disclosure.",
          reference: "Stripe",
          html: mshell(
            "Disputes",
            `<div class="page">
  ${phead("Disputes", "5 open. Quote the full reference from the record.", "", { crumb: trail("Home", "Reports", "Disputes") })}
  ${toolbar({ search: "", placeholder: "Case, order or charge" })}
  ${section(
    "",
    `<table class="dt">
      <thead><tr><th scope="col">Case</th><th scope="col">Order</th><th scope="col">Charge</th><th scope="col">Opened</th><th scope="col" class="num">Held</th></tr></thead>
      <tbody>
        <tr><td><span class="code">D-0182</span></td><td><span class="code">SO-1031</span></td><td><span class="code" title="SH-88213-0042-9X">SH-88…</span></td><td class="nowrap">2 Oct 2026</td><td class="num">EUR 50.00</td></tr>
        <tr><td><span class="code">D-0179</span></td><td><span class="code">SO-1036</span></td><td><span class="code" title="SH-88196-0017-2Q">SH-88…</span></td><td class="nowrap">28 Sep 2026</td><td class="num">EUR 40.45</td></tr>
      </tbody>
    </table>`,
    { flush: true, desc: "Two charges shorten to the same four characters. Open the record for the full reference." },
  )}
  ${section("On the record", `<div class="split"><span>Charge it disputes<span class="sub">The card payment itself</span></span><span class="fig"><span class="copyable"><span class="code">SH-88213-0042-9X</span><button aria-label="Copy the charge reference">⧉</button></span></span></div>`)}
</div>`,
            "Reports",
          ),
        },
        {
          name: "No bare identifier anywhere on a list",
          rationale:
            "Where a record has no subject yet, the state says so and the code is behind a copy control. A list shows subjects, never raw codes.",
          tradeoff:
            "A draft with no subject reads as broken, and a subject is a thing the company has to write before the row is useful. That is the cost of not showing an identifier.",
          html: mshell(
            "Messages",
            `<div class="page">
  ${phead("Messages", "Only the people who said yes to the kind.", '<button class="btn primary sm">Write a message</button>', { crumb: trail("Home", "Customers", "Messages") })}
  ${toolbar({ search: "", placeholder: "Search messages", filters: ["Any kind", "Any state"] })}
  ${section(
    "",
    `<table class="dt">
      <thead><tr><th scope="col">Message</th><th scope="col">Kind</th><th scope="col">State</th><th scope="col">Written</th><th scope="col" class="num">Sent</th></tr></thead>
      <tbody>
        ${[
          ["New at Acme Supply: the autumn catalogue", "Product news", "Draft", "neutral", "30 hours ago", "0", ""],
          ["Garcia Interiors restock, Friday", "Product news", "Scheduled", "info", "10 hours ago", "0", ""],
          ["No subject yet", "Newsletter", "Draft", "neutral", "6 hours ago", "0", "b9f0780e"],
          ["Lindqvist Studio, thank you", "Newsletter", "Cancelled", "neutral", "6 hours ago", "0", ""],
          ["No subject yet", "Newsletter", "Scheduled", "info", "For 2 Jan 2030, 10:00", "0", "c15b4b59"],
        ]
          .map(
            ([nm, kind, st, tone, when, sent, ref]) => `<tr>
          <td>${nm === "No subject yet" ? `<span class="muted">No subject yet</span> <span class="copyable"><span class="code" style="font-size:11px">${ref}</span><button aria-label="Copy the draft reference">⧉</button></span>` : `<b>${nm}</b>`}</td>
          <td>${kind}</td><td>${badgeRaw(st, tone, "outline")}</td>
          <td class="nowrap muted">${when}</td><td class="num muted">${sent}</td>
        </tr>`,
          )
          .join("")}
      </tbody>
    </table>`,
    { flush: true, desc: "A column of zeros carries nothing. Sent is here because a reader asks, and it should say why when it is nothing." },
  )}
</div>`,
            "Customers",
          ),
        },
      ],
    },
  ],
};
