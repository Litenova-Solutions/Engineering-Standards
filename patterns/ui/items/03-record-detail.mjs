/**
 * Record detail: what a record page states, and how it divides what it holds.
 *
 * An order record carries a summary section, at most three sections and an
 * aside for history. What varies is the header, the history, and what happens
 * when a record's facets outgrow three sections.
 */

import {
  COMPANY,
  DELIVERY,
  MONEY,
  ORDER,
  PEOPLE,
  PRODUCT,
  REFUSALS,
  badgeRaw,
  copyValue,
  dropZone,
  emptyState,
  facts,
  menu,
  pager,
  phead,
  progress,
  recordRow,
  section,
  segmented,
  shell,
  split,
  statement,
  tabs,
  tile,
  tiles,
  timelineEntry,
  toast,
  toolbar,
  trail,
  twoCol,
} from "../parts.mjs";

const CSS_RECORD_DETAIL = /* css */ `
.rd-page { min-width: 0; }
.rd-grid { display: grid; grid-template-columns: minmax(0, 1fr) 260px; gap: 16px; align-items: start; }
.rd-grid.rd-wide-side { grid-template-columns: minmax(0, 1fr) 300px; }
.rd-sticky { position: sticky; top: 12px; }
@media (max-width: 900px) {
  .rd-grid, .rd-grid.rd-wide-side { grid-template-columns: minmax(0, 1fr); }
  .rd-sticky { position: static; }
}
.rd-anchor { position: relative; display: inline-flex; }
.rd-pop { position: absolute; right: 0; top: calc(100% + 6px); z-index: 30; width: 232px; }
.rd-pop .menu { width: 100%; }
@media (max-width: 640px) { .rd-pop { right: auto; left: 0; width: 200px; } }
.rd-room { height: 150px; }
.rd-withheld { display: inline-flex; align-items: center; gap: 6px; color: var(--muted-foreground); font-size: 12.5px; }
.rd-withheld::before { content: "◌"; }
.rd-notes { display: flex; flex-direction: column; }
.rd-note { display: grid; grid-template-columns: 28px minmax(0, 1fr); gap: 10px; padding: 12px 0; border-bottom: 1px solid var(--border); }
.rd-note:last-child { border-bottom: 0; padding-bottom: 2px; }
.rd-note:first-child { padding-top: 2px; }
.rd-avatar { width: 28px; height: 28px; border-radius: 50%; background: var(--muted); display: grid; place-items: center; font-size: 10px; font-weight: 600; flex: none; }
.rd-note-head { display: flex; align-items: baseline; gap: 8px; flex-wrap: wrap; }
.rd-note-head b { font-size: 12.5px; font-weight: 600; }
.rd-note-head time { font-size: 11.5px; color: var(--muted-foreground); }
.rd-note p { font-size: 12.5px; margin: 3px 0 0; max-width: 72ch; }
.rd-note-foot { display: flex; gap: 12px; margin-top: 6px; }
.rd-note-foot button { border: 0; background: none; cursor: pointer; color: var(--muted-foreground); padding: 0; font-size: 11.5px; }
.rd-note-foot button:hover { color: var(--foreground); text-decoration: underline; }
.rd-scope { display: inline-flex; align-items: center; height: 20px; padding: 0 7px; border-radius: 999px; font-size: 10.5px; font-weight: 600; background: var(--muted); color: var(--muted-foreground); }
.rd-scope.rd-customer { background: var(--info-surface); color: var(--info-surface-foreground); }
.rd-composer { display: flex; flex-direction: column; gap: 8px; padding: 12px; border: 1px solid var(--border); border-radius: var(--radius-sm); background: var(--background); }
.rd-files { display: flex; flex-direction: column; }
.rd-file { display: flex; align-items: center; gap: 10px; padding: 9px 0; border-bottom: 1px solid var(--border); font-size: 12.5px; min-width: 0; }
.rd-file:last-child { border-bottom: 0; }
.rd-thumb { width: 34px; height: 34px; border-radius: var(--radius-sm); background: var(--muted); flex: none; display: grid; place-items: center; font-size: 10px; color: var(--muted-foreground); font-weight: 700; }
.rd-thumb.rd-img { background: var(--info-surface); color: var(--info-surface-foreground); font-size: 14px; }
.rd-file .rd-meta { min-width: 0; flex: 1; }
.rd-file .rd-meta b { font-weight: 500; display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.rd-file .rd-meta small { display: block; color: var(--muted-foreground); font-size: 11.5px; }
.rd-file .rd-size { font-variant-numeric: tabular-nums; color: var(--muted-foreground); font-size: 12px; white-space: nowrap; }
.rd-kv { margin: 0; display: flex; flex-direction: column; }
.rd-kv > div { display: grid; grid-template-columns: 168px minmax(0, 1fr) auto; gap: 12px; align-items: center; padding: 8px 0; border-bottom: 1px solid var(--border); }
.rd-kv > div:last-child { border-bottom: 0; }
.rd-kv dt { font-size: 12px; color: var(--muted-foreground); }
.rd-kv dd { margin: 0; font-size: 12.5px; min-width: 0; overflow-wrap: anywhere; }
.rd-kv .rd-trunc { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; display: block; }
@media (max-width: 640px) {
  .rd-kv > div { grid-template-columns: minmax(0, 1fr) auto; }
  .rd-kv dt { grid-column: 1 / -1; }
}
.rd-prevnext { display: flex; align-items: center; gap: 2px; }
.rd-prevnext .rd-pos { font-size: 11.5px; color: var(--muted-foreground); padding: 0 8px; white-space: nowrap; font-variant-numeric: tabular-nums; }
.rd-stickybar { position: sticky; bottom: 0; display: flex; gap: 8px; padding: 10px 0 2px; background: var(--background); border-top: 1px solid var(--border); margin-top: 14px; }
.rd-stickybar .btn { flex: 1; }
.rd-pay { display: flex; align-items: center; gap: 10px; padding: 9px 0; border-bottom: 1px solid var(--border); font-size: 12.5px; }
.rd-pay:last-child { border-bottom: 0; }
.rd-pay .rd-what { min-width: 0; flex: 1; }
.rd-pay .rd-what small { display: block; color: var(--muted-foreground); font-size: 11.5px; }
.rd-pay .rd-amt { font-variant-numeric: tabular-nums; white-space: nowrap; text-align: right; }
.rd-compare { display: grid; grid-template-columns: 1fr 1fr; gap: 0; border: 1px solid var(--border); border-radius: var(--radius-sm); overflow: hidden; font-size: 12.5px; }
.rd-compare > div { padding: 10px 12px; min-width: 0; }
.rd-compare > div + div { border-left: 1px solid var(--border); }
.rd-compare .rd-changed { background: var(--caution-surface); color: var(--caution-surface-foreground); border-radius: 4px; padding: 1px 5px; }
.rd-side-nav { display: flex; flex-direction: column; gap: 1px; }
.rd-side-nav button { display: flex; align-items: center; gap: 8px; border: 0; background: transparent; cursor: pointer; text-align: left; padding: 7px 9px; border-radius: 6px; font-size: 12.5px; color: var(--muted-foreground); }
.rd-side-nav button:hover { background: var(--muted); color: var(--foreground); }
.rd-side-nav button[aria-current="page"] { background: var(--muted); color: var(--foreground); font-weight: 600; }
.rd-side-nav button .rd-n { margin-left: auto; font-size: 11px; }
.rd-feed { display: flex; flex-direction: column; }
.rd-feed-note { border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 10px 12px; font-size: 12.5px; margin: 4px 0 12px 26px; background: var(--card); }
.rd-feed-note p { margin: 0 0 4px; }
.rd-feed-note small { color: var(--muted-foreground); font-size: 11.5px; }
`;

/** Maria Garcia's order as it adds up: two lamps with their delivery fee, and a cable tray. */
const BOUGHT = `<div class="stmt"><div class="line"><span>Oak desk lamp<span class="sub">2 × ${MONEY.lamp}</span></span><span class="fig">${MONEY.lineTotal}</span></div><div class="line"><span>Delivery fee<span class="sub">2 × ${MONEY.shipping}, set by ${COMPANY.name}</span></span><span class="fig">EUR 10.00</span></div><div class="line"><span>Cable tray<span class="sub">Collect at the counter</span></span><span class="fig">EUR 25.00</span></div><div class="grand"><span>Paid</span><span class="fig">${MONEY.order}</span></div></div>`;

const TIMELINE = [
  { title: "Counter 1 lost its connection", when: "14 Mar 2026, 10:10 to 10:40", who: COMPANY.name, tone: "caution" },
  { title: "Collected at the pickup counter", when: "14 Mar 2026, 10:41", who: PEOPLE.warehouse.name, tone: "positive" },
  { title: "Label scanned at counter 1", when: "14 Mar 2026, 10:41", who: PEOPLE.warehouse.name, tone: "neutral" },
  { title: "Two counters scanned this label", when: "14 Mar 2026, 10:40 and 10:41", who: "Chris Novak, Alex Morgan", tone: "caution" },
  { title: "Label printed", when: "9 Jan 2026, 10:04", who: COMPANY.name, tone: "neutral" },
];

/** One staff note on a record, with its writer, time and scope. */
function rdNote(name, initials, when, text, { scope = "Internal", customer = false, foot = true } = {}) {
  return `<div class="rd-note"><span class="rd-avatar" aria-hidden="true">${initials}</span><div><div class="rd-note-head"><b>${name}</b><time>${when}</time><span class="rd-scope${customer ? " rd-customer" : ""}">${scope}</span></div><p>${text}</p>${foot ? `<div class="rd-note-foot"><button>Reply</button><button>Edit</button><button>Resolve</button></div>` : ""}</div></div>`;
}

/** One attached file, with its kind, who added it and its size. */
function rdFile(tag, name, meta, size, { img = false, actions = "" } = {}) {
  return `<div class="rd-file"><span class="rd-thumb${img ? " rd-img" : ""}" aria-hidden="true">${tag}</span><span class="rd-meta"><b>${name}</b><small>${meta}</small></span><span class="rd-size">${size}</span>${actions}</div>`;
}

export const CATEGORY_RECORD_DETAIL = {
  css: CSS_RECORD_DETAIL,
  items: [
    {
      id: "record-header",
      title: "The record header",
      why: "One record, stated at the top. Polaris's rule is precise: <b>always a title, always a breadcrumb when there is a parent, exactly one primary action</b>, with everything else secondary beside it. The order page follows all three; the product page puts a destructive action where the primary should be.",
      verdict:
        "Keep the title, state, breadcrumb and one primary action: it is the Polaris shape and the state beside the title answers the first question on every record. The runner-up is the overflow-menu option, which is the better choice once a record carries four or more commands. Prefer the state-driven primary on records with a clear next step, such as an unpaid order. Never ship the title-less option: it fails the check for exactly one h1 per page.",
      variants: [
        {
          name: "Title, state, breadcrumb, one primary action",
          pick: true,
          reference: "Shopify Polaris",
          rationale:
            "The order header, and the shape Polaris describes. The state badge sits beside the title so the record's state is read before anything else.",
          tradeoff:
            "Two actions of the same weight beside the primary, and the destructive one is in the same visual group as a harmless one unless the tone separates them.",
          html: shell(
            ORDER.number,
            `<div class="page rd-page">
  ${trail("Home", "Orders", ORDER.number)}
  <div class="phead">
    <div><h1>${ORDER.number} ${badgeRaw("Paid", "positive")}</h1><p class="desc">Placed ${ORDER.placed} by ${ORDER.customer} of ${ORDER.company}.</p></div>
    <div class="acts"><button class="btn sm">Resend the confirmation</button><button class="btn sm">Refund</button><button class="btn primary">Message customer</button></div>
  </div>
  ${section("The customer", facts([["Name", ORDER.customer], ["Email", `<span class="copyable">${ORDER.email}<button aria-label="Copy the email">⧉</button></span>`], ["Country", "Netherlands"]]))}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Title and state only, no description",
          rationale:
            "The heading and its state, and nothing between them and the content. The trail already says where the record is, so the description repeats it.",
          tradeoff:
            "A record with a long name or a subtle state loses the one line that says which delivery this order belongs to, which is the most-asked question.",
          html: shell(
            ORDER.number,
            `<div class="page rd-page">
  ${trail("Home", "Orders", ORDER.number)}
  <div class="phead">
    <div><h1>${ORDER.number} ${badgeRaw("Paid", "positive")}</h1></div>
    <div class="acts"><button class="btn sm">Resend the confirmation</button><button class="btn primary">Refund</button></div>
  </div>
  ${section("The order", facts([["Delivery", DELIVERY.name], ["Placed", ORDER.placed], ["Paid", MONEY.order]]))}
</div>`,
            "Orders",
          ),
        },
        {
          name: "State as a badge under the title",
          reference: "Shopify Polaris",
          rationale:
            "The state on its own line under the heading rather than inline with it, which lets a long record name wrap without dragging the badge down with it.",
          tradeoff:
            "Two lines where one would do, and the badge is below the fold on a long title. Polaris puts the state in the title metadata slot, which is the inline arrangement.",
          html: shell(
            ORDER.number,
            `<div class="page rd-page">
  ${trail("Home", "Orders", ORDER.number)}
  <div class="phead">
    <div>
      <h1>${ORDER.number}</h1>
      <div style="margin:5px 0 0">${badgeRaw("Paid", "positive")}</div>
      <p class="desc">Placed ${ORDER.placed} by ${ORDER.customer}.</p>
    </div>
    <div class="acts"><button class="btn primary">Message customer</button></div>
  </div>
  ${section("The order", facts([["Delivery", DELIVERY.name], ["Paid", MONEY.order]]))}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Destructive action in its own place, separated",
          rationale:
            "The product header puts Discontinue immediately beside Pause sales, both in the header. Separating the destructive one into a row menu or a lower group keeps the primary slot for the reversible command.",
          tradeoff:
            "A destructive action behind a menu is three clicks from a misclick, which is the other failure. Tone plus position is the usual answer, and neither is complete alone.",
          html: shell(
            PRODUCT.name,
            `<div class="page rd-page">
  ${trail("Home", "Products", PRODUCT.name)}
  <div class="phead">
    <div><h1>${PRODUCT.name} ${badgeRaw("Active", "positive")}</h1><p class="desc">What this product is, and the SKU its parcels carry.</p></div>
    <div class="acts"><button class="btn">Pause sales</button><span class="rd-anchor"><button class="btn icon" aria-label="More actions" aria-expanded="true">⋯</button><span class="rd-pop">${menu([{ label: "Rename the product", icon: "✎" }, { label: "Duplicate the product", icon: "⧉" }, "-", { label: "Discontinue", danger: true, icon: "✕" }])}</span></span></div>
  </div>
  ${section(
    "Details",
    facts([["Units per parcel", "1"], ["Stock", "412 at the Amsterdam warehouse"], ["Sold", "9,412 in total"], ["Price", MONEY.lamp]]),
  )}
  <div class="rd-room"></div>
</div>`,
            "Products",
          ),
        },
        {
          name: "Facts in the header, commands beside them",
          rationale:
            "The record's own values sit in the header as a definition list, so a reader never scrolls to learn what they are looking at. The commands stack beside it.",
          tradeoff:
            "A tall header pushes the content below the fold on a phone, and a four-fact list competes with the trail for the same vertical space.",
          html: shell(
            ORDER.number,
            `<div class="page rd-page">
  ${trail("Home", "Orders", ORDER.number)}
  <div class="phead" style="align-items:flex-start">
    <div style="min-width:0">
      <h1>${ORDER.number} ${badgeRaw("Paid", "positive")}</h1>
      <p class="desc">${ORDER.customer} · ${DELIVERY.name} · ${ORDER.placed}</p>
      <div style="margin-top:11px;max-width:400px">${facts([["Paid", MONEY.order], ["Parcels", "2, both packed"], ["Method", "Card"], ["Refunds", "None"]])}</div>
    </div>
    <div class="acts" style="flex-direction:column;align-items:stretch;gap:6px">
      <button class="btn primary">Message customer</button><button class="btn">Resend the confirmation</button><button class="btn">Refund</button>
    </div>
  </div>
  ${section("Parcels", `<div class="rlist">${recordRow({ title: "Oak desk lamp", sub: "one per parcel · PC-0C893968A2", state: { label: "Packed", tone: "neutral" }, actions: '<button class="btn sm">Void</button>' })}${recordRow({ title: "Oak desk lamp", sub: "one per parcel · PC-0C893968A3", state: { label: "Packed", tone: "neutral" }, actions: '<button class="btn sm">Void</button>' })}</div>`)}
</div>`,
            "Orders",
          ),
        },
        {
          name: "No title, because the trail is the title",
          rationale:
            "The breadcrumb names the record and the page opens straight into its sections. The largest possible use of the space goes to the content.",
          tradeoff:
            "Fails WCAG 2.4.8 Location in spirit and reads as a bare panel. Every page carries exactly one h1, which automated checks enforce, so this fails that check.",
          html: shell(
            ORDER.number,
            `<div class="page rd-page">
  ${trail("Home", "Orders", ORDER.number)}
  ${section("The customer", facts([["Name", ORDER.customer], ["Email", ORDER.email], ["Placed", ORDER.placed], ["Paid", MONEY.order]]))}
  ${section("Parcels", `<div class="rlist">${recordRow({ title: "Oak desk lamp", sub: "one per parcel", state: { label: "Packed", tone: "neutral" } })}${recordRow({ title: "Oak desk lamp", sub: "one per parcel", state: { label: "Packed", tone: "neutral" } })}</div>`)}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Title, state, and who saved it last",
          rationale:
            "Fewer overwrite conflicts. Support and finance share an order, so the header says who touched it last and when before anyone acts on it. A reader who sees Priya Shah saved at 09:34 asks before saving over her.",
          tradeoff:
            "One more line in the header on every record, and it is only honest if the data tracks the last writer. On records nobody shares it is noise.",
          html: shell(
            ORDER.number,
            `<div class="page rd-page">
  ${trail("Home", "Orders", ORDER.number)}
  <div class="phead">
    <div>
      <h1>${ORDER.number} ${badgeRaw("Paid", "positive")}</h1>
      <p class="desc">Placed ${ORDER.placed} by ${ORDER.customer} of ${ORDER.company}.</p>
      <p class="desc">Last saved by ${PEOPLE.finance.name} at 09:34.</p>
    </div>
    <div class="acts">
      <button class="btn sm">Resend the confirmation</button>
      <button class="btn sm">Refund</button>
      <button class="btn primary">Message customer</button>
    </div>
  </div>
  ${section("The order", facts([["Customer", ORDER.customer], ["Delivery", DELIVERY.name], ["Placed", ORDER.placed], ["Paid", MONEY.order]]))}
</div>`,
            "Orders",
          ),
        },
        {
          name: "One primary, the rest in an overflow menu",
          reference: "Stripe",
          rationale:
            "Stripe draws one primary action on a charge and folds the rest behind an overflow menu, so the header stays one line however many commands a record gains. Resend, refund and export all fit without a second row of buttons.",
          tradeoff:
            "Secondary commands are a click further away, and a reader cannot tell what the menu holds without opening it. The menu also needs its items ordered by frequency, which is a judgment per record.",
          html: shell(
            ORDER.number,
            `<div class="page rd-page">
  ${trail("Home", "Orders", ORDER.number)}
  <div class="phead">
    <div><h1>${ORDER.number} ${badgeRaw("Paid", "positive")}</h1><p class="desc">Placed ${ORDER.placed} by ${ORDER.customer} of ${ORDER.company}.</p></div>
    <div class="acts"><button class="btn primary">Message customer</button><span class="rd-anchor"><button class="btn icon" aria-label="More actions" aria-expanded="true">⋯</button><span class="rd-pop">${menu([{ label: "Resend the confirmation", icon: "✉" }, { label: "Refund to the original payment", icon: "↩" }, { label: "Download the receipt", icon: "⤓" }, "-", { label: "Void the order", danger: true, icon: "✕" }])}</span></span></div>
  </div>
  ${section("The order", facts([["Customer", ORDER.customer], ["Delivery", DELIVERY.name], ["Placed", ORDER.placed], ["Paid", MONEY.order]]))}
  <div class="rd-room"></div>
</div>`,
            "Orders",
          ),
        },
        {
          name: "The primary follows the state",
          reference: "Shopify",
          rationale:
            "Shopify changes the order page's primary action with the order's state, so the next step is always the button. An unpaid order offers Record a payment; a paid one offers Message customer; a disputed one offers Answer the bank.",
          tradeoff:
            "The primary moves meaning between visits, so a reader who learned its place has to read its label every time. Every state needs its own chosen next step, which is a decision per record type.",
          html: shell(
            "SO-1031",
            `<div class="page rd-page">
  ${trail("Home", "Orders", "SO-1031")}
  <div class="phead">
    <div><h1>SO-1031 ${badgeRaw("Awaiting payment", "caution")}</h1><p class="desc">Placed 8 Oct 2026, 09:30 by ${PEOPLE.otherCustomer.name}. EUR 40.45 is still due.</p></div>
    <div class="acts"><button class="btn sm">Message customer</button><button class="btn primary">Record a payment</button></div>
  </div>
  ${section("The order", facts([["Customer", PEOPLE.otherCustomer.name], ["Placed", "8 Oct 2026, 09:30"], ["Due", "EUR 40.45"]]))}
  ${section("What happens next", `<p class="note">The hold on one lamp ends at 10:00. After that the lamp returns to stock and the order reads Expired.</p>`)}
</div>`,
            "Orders",
          ),
        },
      ],
    },
    {
      id: "record-tabs",
      title: "Tabs on a record",
      why: "Records hold at most three sections, and more facets become tabs. The product page carries <b>four</b>: Pricing, Availability, Returns, Details. Carbon and GOV.UK both cap tabs at about six and require the tab state in the URL.",
      verdict:
        "Keep the four tabs with the active one in the URL: four is inside every cited ceiling and the repeat of the label as a panel heading answers GOV.UK. The runner-up is the side-rail option, which is the better choice past five facets or where one facet is a long form. Prefer the counts option only where a facet can be empty and the count saves a wasted click. Never ship the icon tabs: Carbon forbids icons in tab labels and the icons add a second channel for one meaning.",
      compact: {
        option: "A select on a phone, tabs on a wide screen",
        behaviour: "Below the md breakpoint the tab row becomes a select naming the current facet; the panels stay the same.",
      },
      variants: [
        {
          name: "Four tabs with the active one in the URL",
          pick: true,
          reference: "GOV.UK",
          rationale:
            "Four facets in tabs, which is inside the six every cited system allows. GOV.UK also asks for a heading inside each panel repeating the tab label, which the Details tab does.",
          tradeoff:
            "A reader cannot see two facets at once, and GOV.UK says tabs are the wrong choice when comparing across facets is the job.",
          html: shell(
            PRODUCT.name,
            `<div class="page rd-page">
  ${trail("Home", "Products", PRODUCT.name)}
  <div class="phead">
    <div><h1>${PRODUCT.name} ${badgeRaw("Active", "positive")}</h1><p class="desc">What this product is, and the SKU its parcels carry.</p></div>
    <div class="acts"><button class="btn sm">Pause sales</button><button class="btn sm subtle-danger" aria-disabled="true">Discontinue</button></div>
  </div>
  ${tabs(["Pricing", "Availability", "Returns", "Details"], 3)}
  ${section("Details", facts([["SKU", `<span class="code">${PRODUCT.sku}</span>`], ["Warehouse", PRODUCT.warehouse], ["Price", MONEY.lamp]]))}
</div>`,
            "Products",
          ),
        },
        {
          name: "Three tabs, the fourth becomes a page",
          rationale:
            "Hold the ceiling at three facets in tabs and push the fourth to its own route. Every cited system treats six as the ceiling; holding to three is the same discipline applied earlier.",
          tradeoff:
            "One more navigation step for the reader who wants details, and a fourth page in a system that already counts its routes in the hundreds.",
          html: shell(
            PRODUCT.name,
            `<div class="page rd-page">
  ${trail("Home", "Products", PRODUCT.name)}
  <div class="phead">
    <div><h1>${PRODUCT.name} ${badgeRaw("Active", "positive")}</h1><p class="desc">What this product is, and the SKU its parcels carry.</p></div>
    <div class="acts"><button class="btn sm">Pause sales</button></div>
  </div>
  ${tabs(["Pricing", "Availability", "Returns"], 0)}
  ${section("Pricing", `<div class="stmt"><div class="line"><span>Standard price<span class="sub">412 in stock at the Amsterdam warehouse</span></span><span class="fig">${MONEY.lamp}</span></div><div class="line"><span>Delivery fee<span class="sub">Set by Acme Supply, added to each order at checkout</span></span><span class="fig">${MONEY.shipping}</span></div></div>`, { acts: '<button class="btn xs">Change the price</button>' })}
  <div style="margin-top:12px"><a href="#" style="font-size:12px">SKU and what each parcel holds →</a></div>
</div>`,
            "Products",
          ),
        },
        {
          name: "Tabs with counts",
          rationale:
            "Each tab carries the number of things in it, so a reader knows whether a facet is worth opening before opening it. Four tabs where one holds three and another holds none.",
          tradeoff:
            "Counts on tabs are a claim that has to stay true, and a count of 0 invites a click that leads to an empty state.",
          html: shell(
            PRODUCT.name,
            `<div class="page rd-page">
  ${trail("Home", "Products", PRODUCT.name)}
  <div class="phead">
    <div><h1>${PRODUCT.name} ${badgeRaw("Active", "positive")}</h1></div>
    <div class="acts"><button class="btn sm">Pause sales</button></div>
  </div>
  ${tabs(["Pricing", 'Variants<span class="n">3</span>', 'Returns<span class="n">0</span>', "Details"], 0)}
  ${section("Pricing", `<div class="stmt"><div class="line"><span>Standard price<span class="sub">412 in stock at the Amsterdam warehouse</span></span><span class="fig">${MONEY.lamp}</span></div></div>`)}
</div>`,
            "Products",
          ),
        },
        {
          name: "Tabs with icons as well as words",
          rationale:
            "An icon per tab so the row is scannable without reading, with the words still present for anyone who does not recognise the icons.",
          tradeoff:
            "Carbon's tab guidance is explicit that icons are not permitted in tab labels. Two channels for one thing, and a second set of icons to design and maintain.",
          html: shell(
            PRODUCT.name,
            `<div class="page rd-page">
  ${trail("Home", "Products", PRODUCT.name)}
  <div class="phead">
    <div><h1>${PRODUCT.name} ${badgeRaw("Active", "positive")}</h1></div>
    <div class="acts"><button class="btn sm">Pause sales</button></div>
  </div>
  <div class="tabs" role="tablist">
    <button role="tab" aria-selected="true"><span aria-hidden="true">€</span> Pricing</button>
    <button role="tab" aria-selected="false"><span aria-hidden="true">◫</span> Availability</button>
    <button role="tab" aria-selected="false"><span aria-hidden="true">↩</span> Returns</button>
    <button role="tab" aria-selected="false"><span aria-hidden="true">≡</span> Details</button>
  </div>
  ${section("Pricing", `<div class="stmt"><div class="line"><span>Standard price</span><span class="fig">${MONEY.lamp}</span></div></div>`)}
</div>`,
            "Products",
          ),
        },
        {
          name: "Scrollable tabs with a fade at the edge",
          rationale:
            "Where a record genuinely needs six facets, the row scrolls horizontally with a fade at the edge so the reader knows there is more. Useful on a phone, where four tabs wrap.",
          tradeoff:
            "A hidden seventh tab is a hidden feature, and a horizontal scroll on a page hides content from anyone who never swipes.",
          html: shell(
            DELIVERY.name,
            `<div class="page rd-page">
  ${trail("Home", "Orders", DELIVERY.name)}
  <div class="phead">
    <div><h1>${DELIVERY.name} ${badgeRaw("Scheduled", "info")}</h1></div>
    <div class="acts"><button class="btn sm">Reschedule</button></div>
  </div>
  <div style="position:relative">
    <div class="tabs" style="overflow-x:auto;padding-right:26px">
      <button role="tab" aria-selected="true">Overview</button><button role="tab" aria-selected="false">Parcels</button><button role="tab" aria-selected="false">Schedule</button><button role="tab" aria-selected="false">Dispatch</button><button role="tab" aria-selected="false">Money</button><button role="tab" aria-selected="false">Operations</button><button role="tab" aria-selected="false">Orders</button>
    </div>
    <span style="position:absolute;right:0;top:0;bottom:1px;width:22px;background:linear-gradient(to right,transparent,var(--background));pointer-events:none"></span>
  </div>
  ${section("Overview", facts([["Date", DELIVERY.date], ["Place", DELIVERY.place], ["Capacity", DELIVERY.capacity]]))}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Tabs below the summary, not below the header",
          rationale:
            "The summary stays visible above the tab row, so a reader always knows which record they are on and what state it is in, whichever facet is open.",
          tradeoff:
            "The tab row moves down the page, so it is less prominent, and the summary has to be short or the tabs fall below the fold.",
          html: shell(
            ORDER.number,
            `<div class="page rd-page">
  ${trail("Home", "Orders", ORDER.number)}
  <div class="phead">
    <div><h1>${ORDER.number} ${badgeRaw("Paid", "positive")}</h1><p class="desc">${ORDER.customer} · ${DELIVERY.name} · ${ORDER.placed} · ${MONEY.order}</p></div>
    <div class="acts"><button class="btn primary">Message customer</button></div>
  </div>
  ${tabs(['Lines<span class="n">3</span>', "Payment", "History"], 0)}
  ${section("Lines", `<div class="rlist">${recordRow({ title: "Oak desk lamp", sub: "one per parcel · PC-0C893968A2", state: { label: "Packed", tone: "neutral" } })}${recordRow({ title: "Oak desk lamp", sub: "one per parcel · PC-0C893968A3", state: { label: "Packed", tone: "neutral" } })}${recordRow({ title: "Cable tray", sub: "collect at the counter", state: { label: "Ready", tone: "info" } })}</div>`)}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Facets in a side rail instead of tabs",
          reference: "GitHub",
          rationale:
            "GitHub draws repository settings as a side rail of links rather than a tab row, which holds a dozen facets without scrolling and keeps the panel wide enough for a form. The current facet reads as selected in the rail, and each facet keeps its own URL.",
          tradeoff:
            "The rail takes about 200 px from every facet at desktop width, and on a phone it has to become a select or stack above the panel, which is a second arrangement to keep true.",
          html: shell(
            PRODUCT.name,
            `<div class="page rd-page">
  ${trail("Home", "Products", PRODUCT.name)}
  <div class="phead">
    <div><h1>${PRODUCT.name} ${badgeRaw("Active", "positive")}</h1><p class="desc">What this product is, and the SKU its parcels carry.</p></div>
    <div class="acts"><button class="btn sm">Pause sales</button></div>
  </div>
  <div style="display:grid;grid-template-columns:200px minmax(0,1fr);gap:18px;align-items:start">
    <nav class="rd-side-nav" aria-label="Facets of this product">
      <button aria-current="page">Pricing</button>
      <button>Availability</button>
      <button>Returns<span class="rd-n muted">0</span></button>
      <button>Details</button>
      <button>Messages</button>
      <button>Dispatch</button>
    </nav>
    <div class="stack">${section("Pricing", `<div class="stmt"><div class="line"><span>Standard price<span class="sub">412 in stock at the Amsterdam warehouse</span></span><span class="fig">${MONEY.lamp}</span></div><div class="line"><span>Delivery fee<span class="sub">Set by Acme Supply, added to each order at checkout</span></span><span class="fig">${MONEY.shipping}</span></div></div>`, { acts: '<button class="btn xs">Change the price</button>' })}</div>
  </div>
</div>`,
            "Products",
          ),
        },
        {
          name: "A select on a phone, tabs on a wide screen",
          width: "narrow",
          reference: "Shopify Polaris",
          rationale:
            "Polaris collapses its tab row into a select on narrow screens, so four facets fit a 390 px viewport without scrolling or wrapping. The control names the current facet and opens the same panels the tabs open.",
          tradeoff:
            "Two controls for one choice, so the tab state and the select state have to stay in agreement. A reader on a phone also cannot see the other facets without opening the control.",
          html: shell(
            PRODUCT.name,
            `<div class="page rd-page">
  ${trail("Home", "Products", PRODUCT.name)}
  <div class="phead">
    <div><h1>${PRODUCT.name} ${badgeRaw("Active", "positive")}</h1></div>
    <div class="acts"><button class="btn sm">Pause sales</button></div>
  </div>
  <div style="margin-bottom:14px;max-width:280px"><label class="muted" style="font-size:11.5px;display:block;margin-bottom:4px" for="rd-facet">Facet</label><select class="sel" id="rd-facet"><option selected>Pricing</option><option>Availability</option><option>Returns</option><option>Details</option></select></div>
  ${section("Pricing", `<div class="stmt"><div class="line"><span>Standard price<span class="sub">412 in stock at the Amsterdam warehouse</span></span><span class="fig">${MONEY.lamp}</span></div></div>`)}
</div>`,
            "Products",
          ),
        },
      ],
    },
    {
      id: "record-summary",
      title: "The summary",
      why: "The section at the top of a record that answers 'what am I looking at' without scrolling. It states the record's identity: a summary that states <b>supporting</b> information, such as the customer's details, answers the wrong question.",
      verdict:
        "Keep the facts about the record itself: the delivery summary states when, where and how full, which is the identity of the record rather than its support. The runner-up is the copyable-identifiers option, which is the better choice on records a reader quotes elsewhere, such as an order read out on the phone. Prefer the progress-bar summary only for the one figure the company watches daily. Never ship the heading-less value row: values with no section break the rule that a section is the only box.",
      variants: [
        {
          name: "Facts about the record itself",
          pick: true,
          rationale:
            "The summary holds the facts that define this record: its date, its place, its state, what it holds. Everything else is a section below it.",
          tradeoff:
            "Repeats what the header already says, since the header carries the title and state. Saying a thing twice is what the design contract forbids.",
          html: shell(
            DELIVERY.name,
            `<div class="page rd-page">
  ${trail("Home", "Orders", DELIVERY.name)}
  <div class="phead">
    <div><h1>${DELIVERY.name} ${badgeRaw("Scheduled", "info")}</h1><p class="desc">${DELIVERY.date}, ${DELIVERY.window} · ${DELIVERY.place}</p></div>
    <div class="acts"><button class="btn sm">Reschedule</button><button class="btn primary">Add a parcel</button></div>
  </div>
  ${section("The delivery", facts([["When", `${DELIVERY.date}, ${DELIVERY.window}`], ["Where", DELIVERY.place], ["Capacity", DELIVERY.capacity], ["Company", COMPANY.name], ["Loaded", "36 of 40 pallets"]]))}
</div>`,
            "Orders",
          ),
        },
        {
          name: "One line of key values, no heading",
          rationale:
            "A single row of label and value pairs with no Section around it, because a summary is not a block of content, it is a restatement of the heading.",
          tradeoff:
            "Breaks the rule that a Section is the only box, because the values would float on the canvas with nothing holding them together visually.",
          html: shell(
            ORDER.number,
            `<div class="page rd-page">
  ${trail("Home", "Orders", ORDER.number)}
  <div class="phead">
    <div><h1>${ORDER.number} ${badgeRaw("Paid", "positive")}</h1></div>
    <div class="acts"><button class="btn primary">Message customer</button></div>
  </div>
  <div class="wrap" style="padding:0 0 14px;border-bottom:1px solid var(--border);margin-bottom:14px;font-size:12.5px">
    <span><span class="muted">Customer</span> ${ORDER.customer}</span>
    <span><span class="muted">Delivery</span> ${DELIVERY.name}</span>
    <span><span class="muted">Placed</span> ${ORDER.placed}</span>
    <span><span class="muted">Paid</span> <b>${MONEY.order}</b></span>
  </div>
  ${section("Parcels", `<div class="rlist">${recordRow({ title: "Oak desk lamp", sub: "one per parcel", state: { label: "Packed", tone: "neutral" } })}</div>`)}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Money summary as a statement",
          rationale:
            "Where the record is a settlement, the summary is a statement: what came in, what went out, what is left. It adds up top to bottom, which is what the reader came for.",
          tradeoff:
            "Wrong for a record with no money, and a statement is longer than a summary ought to be, so it pushes the sections down.",
          html: shell(
            "September 2026",
            `<div class="page rd-page">
  ${trail("Home", "Reports", "Statements", "September 2026")}
  <div class="phead">
    <div><h1>September 2026</h1><p class="desc">Every euro of the month under the kind it is.</p></div>
    <div class="acts"><button class="btn sm">Download</button></div>
  </div>
  ${section(
    "",
    statement(
      [
        { label: "Income", lines: [{ what: "Product sales", sub: "1,204 orders", amount: "EUR 54,180.00" }, { what: "Delivery fees customers paid", sub: "1,204 orders", amount: "EUR 6,020.00" }], totalLabel: "Total income", total: "EUR 60,200.00" },
        { label: "Costs", lines: [{ what: "The processor's fee", sub: "1.9% plus EUR 0.25", amount: "EUR -1,143.80" }], totalLabel: "Total costs", total: "EUR -1,143.80" },
      ],
      { label: "Net for Acme Supply", amount: "EUR 59,056.20" },
    ),
  )}
</div>`,
            "Reports",
          ),
        },
        {
          name: "Summary with a figure and a sub-line each",
          rationale:
            "Each fact carries a figure and a quieter line under it, as a figure row with a sub-line. A count beside its unit, a money figure beside what it is.",
          tradeoff:
            "A figure and a sub-line per fact needs three columns or a very wide row, and the sub-lines repeat the label's meaning in more words.",
          html: shell(
            DELIVERY.name,
            `<div class="page rd-page">
  ${trail("Home", "Orders", DELIVERY.name)}
  <div class="phead">
    <div><h1>${DELIVERY.name} ${badgeRaw("Scheduled", "info")}</h1></div>
    <div class="acts"><button class="btn primary">Add a parcel</button></div>
  </div>
  ${section("The delivery", `<div class="stack sm">
    ${split(`When<span class="sub">${DELIVERY.date}, ${DELIVERY.window}</span>`, "In 5 days")}
    ${split(`Where<span class="sub">${DELIVERY.place}</span>`, "40 pallets")}
    ${split('Loaded<span class="sub">Across every parcel</span>', "36")}
    ${split('Money so far<span class="sub">Products and delivery fees</span>', "EUR 60,200.00")}
  </div>`)}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Summary with a progress bar for the one number that matters",
          rationale:
            "One number, 'pallets left', carries a bar and a count. Everything else is plain text, because one figure is worth watching and four are not.",
          tradeoff:
            "Choosing which number matters is a judgment the data has to support, and a bar on a capacity figure implies a ratio that stops mattering once loading is over.",
          html: shell(
            DELIVERY.name,
            `<div class="page rd-page">
  ${trail("Home", "Orders", DELIVERY.name)}
  <div class="phead">
    <div><h1>${DELIVERY.name} ${badgeRaw("Scheduled", "info")}</h1><p class="desc">${DELIVERY.date}, ${DELIVERY.window} · ${DELIVERY.place}</p></div>
    <div class="acts"><button class="btn primary">Add a parcel</button></div>
  </div>
  ${section(
    "Load",
    `<div class="stack sm">
      <div class="split"><span><b>36 loaded</b><span class="sub">of 40 pallets</span></span><span class="fig">4 left</span></div>
      ${progress(90)}
      <div class="btnrow" style="margin-top:6px"><button class="btn sm">Raise capacity</button><button class="btn sm">Add a parcel</button></div>
    </div>`,
  )}
  ${section("Details", facts([["When", DELIVERY.date], ["Where", DELIVERY.place], ["Company", COMPANY.name]]))}
</div>`,
            "Orders",
          ),
        },
        {
          name: "No summary, straight to sections",
          rationale:
            "The header already states the record and its state, so the summary is dropped. Every fact appears once, in the section it belongs to.",
          tradeoff:
            "The reader scrolls to learn what the record is. For a long record that is a real cost, and the record-page shape reserves a summary slot for exactly this reason.",
          html: shell(
            ORDER.number,
            `<div class="page rd-page">
  ${trail("Home", "Orders", ORDER.number)}
  <div class="phead">
    <div><h1>${ORDER.number} ${badgeRaw("Paid", "positive")}</h1><p class="desc">${ORDER.customer} · ${DELIVERY.name} · ${ORDER.placed}</p></div>
    <div class="acts"><button class="btn primary">Message customer</button></div>
  </div>
  ${section("The customer", facts([["Name", ORDER.customer], ["Email", ORDER.email], ["Phone", "Not given"], ["Country", "Netherlands"]]))}
  ${section("What was bought", BOUGHT)}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Facts plus copyable identifiers",
          reference: "Stripe",
          rationale:
            "Stripe puts a copy button beside every identifier on a charge, because support reads a reference out on the phone or pastes it into a dispute. The human facts stay plain text; the order number, payment reference and customer email copy with one click.",
          tradeoff:
            "A copy button per row is visual noise on a record nobody quotes, and each button needs its copied confirmation, which is a small behaviour per row.",
          html: shell(
            ORDER.number,
            `<div class="page rd-page">
  ${trail("Home", "Orders", ORDER.number)}
  <div class="phead">
    <div><h1>${ORDER.number} ${badgeRaw("Paid", "positive")}</h1><p class="desc">Placed ${ORDER.placed} by ${ORDER.customer} of ${ORDER.company}.</p></div>
    <div class="acts"><button class="btn primary">Message customer</button></div>
  </div>
  ${section("The order", facts([["Customer", ORDER.customer], ["Delivery", DELIVERY.name], ["Placed", ORDER.placed], ["Paid", MONEY.order], ["Order", copyValue("order number", ORDER.number)], ["Payment", copyValue("payment reference", "SH-88213")], ["Email", copyValue("email", ORDER.email)]]))}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Four tiles instead of a section",
          reference: "Vercel",
          rationale:
            "Vercel opens a project on four stat tiles, because four figures side by side compare at a glance where a fact list reads line by line. Loaded, left, money so far and days to dispatch are the four the company checks each morning.",
          tradeoff:
            "Tiles carry figures, not sentences, so anything that needs a qualifier does not fit. A tile row also answers nothing about who or where, so the facts still need a home below it.",
          html: shell(
            DELIVERY.name,
            `<div class="page rd-page">
  ${trail("Home", "Orders", DELIVERY.name)}
  <div class="phead">
    <div><h1>${DELIVERY.name} ${badgeRaw("Scheduled", "info")}</h1><p class="desc">${DELIVERY.date}, ${DELIVERY.window} · ${DELIVERY.place}</p></div>
    <div class="acts"><button class="btn sm">Reschedule</button><button class="btn primary">Add a parcel</button></div>
  </div>
  <div style="margin-bottom:14px">${tiles(tile("Loaded", "36", "of 40 pallets"), tile("Left", "4", "10% of the load"), tile("Money so far", "EUR 60,200.00", "products and delivery fees"), tile("Days to dispatch", "5", "loading ends 13 Mar, 23:59"))}</div>
  ${section("The delivery", facts([["When", `${DELIVERY.date}, ${DELIVERY.window}`], ["Where", DELIVERY.place], ["Company", COMPANY.name]]))}
</div>`,
            "Orders",
          ),
        },
      ],
    },
    {
      id: "record-aside",
      title: "The aside",
      why: "The record page has an aside slot for <b>what supports the record rather than describing it</b>. The order page puts its history there, which is the right use; the parcel page puts nothing there at all.",
      verdict:
        "Give the pick to history in the aside: history supports the order without describing it, which is exactly what the aside slot is for. The runner-up is the decision panel, which is the better choice on records that wait for someone, such as a dispute with a deadline. Prefer the people-and-labels aside on records a team hands between shifts. Never ship the empty aside state by accident: an order with nothing pending and no history reads as a rendering fault.",
      compact: {
        option: "Aside collapses to a section on narrow screens",
        behaviour: "Below the md breakpoint the aside stacks as sections under the header, with history first.",
      },
      variants: [
        {
          name: "History in the aside, sections in the main column",
          pick: true,
          rationale:
            "History supports the order without describing it, and it reads top to bottom beside the facts. On a wide screen it is a narrow column; below that it stacks under the sections.",
          tradeoff:
            "Below about 1000 pixels the aside stacks under everything, so the history a reader most wants lands after the sections they came to use.",
          html: shell(
            ORDER.number,
            `<div class="page rd-page">
  ${trail("Home", "Orders", ORDER.number)}
  <div class="phead">
    <div><h1>${ORDER.number} ${badgeRaw("Paid", "positive")}</h1><p class="desc">${ORDER.customer} · ${DELIVERY.name} · ${ORDER.placed}</p></div>
    <div class="acts"><button class="btn primary">Message customer</button></div>
  </div>
  <div class="rd-grid">
    <div class="stack">
      ${section("The customer", facts([["Name", ORDER.customer], ["Email", ORDER.email]]))}
      ${section("What was bought", BOUGHT)}
    </div>
    <div class="stack">${section("What happened", `<div class="tl">${TIMELINE.slice(0, 3).map((e, i) => timelineEntry(e.title, e.when, e.who, e.tone, i === 2)).join("")}</div>`)}</div>
  </div>
</div>`,
            "Orders",
          ),
        },
        {
          name: "Aside for what needs a decision",
          rationale:
            "The aside holds the things that need the reader: a pending decision, a clock, a mismatch. History moves into a tab, because a list of past activity is rarely the reason to open a record.",
          tradeoff:
            "The aside becomes a work panel, which changes what the page is. An order with nothing pending has an empty aside, which is its own awkward state.",
          html: shell(
            "SO-1027",
            `<div class="page rd-page">
  ${trail("Home", "Orders", "SO-1027")}
  <div class="phead">
    <div><h1>SO-1027 ${badgeRaw("Refund refused", "caution")}</h1><p class="desc">Tom Becker · ${DELIVERY.name} · 7 Oct 2026, 22:14</p></div>
    <div class="acts"><button class="btn primary">Message customer</button></div>
  </div>
  <div class="rd-grid">
    <div class="stack">
      ${section("The customer", facts([["Name", "Tom Becker"], ["Email", "tom@becker-bouw.example"]]))}
      ${section("Money", `<div class="stmt"><div class="line"><span>Paid by card<span class="sub">7 Oct 2026</span></span><span class="fig">${MONEY.lamp}</span></div><div class="line"><span>Refund asked for<span class="sub">8 Oct 2026, refused by the bank</span></span><span class="fig">${MONEY.lamp}</span></div><div class="grand"><span>Returned so far</span><span class="fig">EUR 0.00</span></div></div>`)}
    </div>
    <div class="stack">
      ${section("Needs a decision", `<div class="stack sm">
        <div class="alert caution"><span class="txt"><b>${REFUSALS.windowClosed.title}</b><small>${REFUSALS.windowClosed.detail}</small></span></div>
        <button class="btn primary sm w-full">Offer credit instead</button>
        <button class="btn sm w-full">Record a payment you made</button>
      </div>`)}
      ${section("History", `<div class="tl">${TIMELINE.slice(0, 2).map((e, i) => timelineEntry(e.title, e.when, e.who, e.tone, i === 1)).join("")}</div>`, { acts: '<button class="btn xs ghost">All 7</button>' })}
    </div>
  </div>
</div>`,
            "Orders",
          ),
        },
        {
          name: "No aside, sections fill the width",
          rationale:
            "The main column takes everything. Sections side by side where there are two that fit.",
          tradeoff:
            "A two-line fact list stretched across 1200 pixels is a very long measure for a name and an email, and the history loses its association with the record.",
          html: shell(
            ORDER.number,
            `<div class="page rd-page">
  ${trail("Home", "Orders", ORDER.number)}
  <div class="phead">
    <div><h1>${ORDER.number} ${badgeRaw("Paid", "positive")}</h1><p class="desc">${ORDER.customer} · ${DELIVERY.name} · ${ORDER.placed}</p></div>
    <div class="acts"><button class="btn primary">Message customer</button></div>
  </div>
  <div class="section"><div class="cols" style="grid-template-columns:1fr 1fr">
    <div style="padding:12px 14px;border-right:1px solid var(--border)">
      <h4 style="font-size:12.5px;margin-bottom:8px">The customer</h4>
      ${facts([["Name", ORDER.customer], ["Email", ORDER.email], ["Country", "Netherlands"]], { stacked: true })}
    </div>
    <div style="padding:12px 14px">
      <h4 style="font-size:12.5px;margin-bottom:8px">The order</h4>
      ${facts([["Delivery", DELIVERY.name], ["Placed", ORDER.placed], ["Paid", MONEY.order]], { stacked: true })}
    </div>
  </div></div>
  ${section("What was bought", BOUGHT)}
  ${section("What happened", `<div class="tl">${TIMELINE.map((e, i) => timelineEntry(e.title, e.when, e.who, e.tone, i === TIMELINE.length - 1)).join("")}</div>`)}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Aside sticky, main column scrolls",
          rationale:
            "The aside stays in place while the sections scroll, so a decision in the aside is always reachable from anywhere on a long record.",
          tradeoff:
            "A sticky aside on a phone is a stacked block that no longer sticks, so the behaviour has two shapes and one of them is untested in practice.",
          html: shell(
            "Dispute D-0182",
            `<div class="page rd-page">
  ${trail("Home", "Invoices", "Disputes", "D-0182")}
  <div class="phead">
    <div><h1>Dispute D-0182 ${badgeRaw("Disputed", "destructive")}</h1><p class="desc">${MONEY.lamp} on order SO-1019. The card issuer opened a case on 2 Oct 2026.</p></div>
    <div class="acts"><button class="btn primary">Answer the bank</button></div>
  </div>
  <div class="rd-grid">
    <div class="stack">
      ${section("What the bank said", `<div class="stack sm"><p style="font-size:12.5px">"Cardholder says the order was cancelled by the merchant and the charge is being disputed. They want the full amount returned."</p><span class="muted" style="font-size:11.5px">Received 2 Oct 2026, 14:22</span></div>`)}
      ${section("Evidence the company holds", `<div class="rlist">${recordRow({ title: "Order placed", sub: "28 Sep 2026, 19:02", actions: "" })}${recordRow({ title: "Paid by card", sub: "28 Sep 2026, 19:03 · reference SH-88213", actions: "" })}${recordRow({ title: "Order shipped", sub: "30 Sep 2026", actions: "" })}</div>`)}
      ${section("What you can answer with", `<div class="stack sm"><label class="check"><input type="radio" name="ans"><span>The order shipped as sold<span class="cd">Evidence: the order, the dispatch scan and the terms Acme Supply set.</span></span></label><label class="check"><input type="radio" name="ans"><span>The customer was refunded and the refund failed<span class="cd">Evidence: a refund was attempted on 7 Oct and refused.</span></span></label><label class="check"><input type="radio" name="ans"><span>Something else<span class="cd">Explain it in the bank's own words.</span></span></label></div>`, { desc: "The answer goes to the bank, not to the customer." })}
    </div>
    <div class="stack rd-sticky">
      ${section("Needs a decision", `<div class="stack sm"><div class="alert destructive"><span class="txt"><b>13 days to answer.</b><small>The bank charges back on 21 Oct if nothing is sent.</small></span></div><button class="btn primary sm w-full">Answer the bank</button></div>`)}
    </div>
  </div>
</div>`,
            "Invoices",
          ),
        },
        {
          name: "Aside for related records",
          rationale:
            "The aside holds what relates to this record but is not part of it: the delivery it ships with, the other lines on it, the messages it has had.",
          tradeoff:
            "Related records are what a reader navigates to, so putting them in the narrowest column makes them the least likely to be found.",
          html: shell(
            ORDER.number,
            `<div class="page rd-page">
  ${trail("Home", "Orders", ORDER.number)}
  <div class="phead">
    <div><h1>${ORDER.number} ${badgeRaw("Paid", "positive")}</h1><p class="desc">${ORDER.customer} · ${DELIVERY.name}</p></div>
    <div class="acts"><button class="btn primary">Message customer</button></div>
  </div>
  <div class="rd-grid">
    <div class="stack">
      ${section("What was bought", BOUGHT)}
      ${section("The customer", facts([["Name", ORDER.customer], ["Email", ORDER.email]]))}
    </div>
    <div class="stack">
      ${section("With this delivery", `<div class="rlist">${recordRow({ title: DELIVERY.name, sub: `${DELIVERY.date} · ${DELIVERY.place}`, actions: '<button class="btn xs">Open</button>' })}${recordRow({ title: "Also bought", sub: "1 more order from this customer", actions: '<button class="btn xs">Open</button>' })}${recordRow({ title: "Messages sent", sub: "2 to this customer", actions: '<button class="btn xs">Open</button>' })}</div>`)}
    </div>
  </div>
</div>`,
            "Orders",
          ),
        },
        {
          name: "Aside collapses to a section on narrow screens",
          rationale:
            "The same content, ordered so the aside's sections come first in the DOM. A reader on a phone reads history before the lines list rather than after it.",
          tradeoff:
            "Two different orders for one record, so a screenshot test holds two arrangements. The DOM order and the visual order disagree, which is also an accessibility question.",
          width: "narrow",
          html: shell(
            ORDER.number,
            `<div class="page rd-page">
  ${trail("Home", "Orders", ORDER.number)}
  <div class="phead">
    <div><h1>${ORDER.number} ${badgeRaw("Paid", "positive")}</h1><p class="desc">${ORDER.customer} · ${DELIVERY.name}</p></div>
    <div class="acts"><button class="btn primary sm">Message customer</button></div>
  </div>
  <div class="stack">
    ${section("What happened", `<div class="tl">${TIMELINE.slice(0, 3).map((e, i) => timelineEntry(e.title, e.when, e.who, e.tone, i === 2)).join("")}</div>`)}
    ${section("The customer", facts([["Name", ORDER.customer], ["Email", ORDER.email]], { stacked: true }))}
    ${section("What was bought", BOUGHT)}
  </div>
</div>`,
            "Orders",
          ),
        },
        {
          name: "People and labels in the aside, history below",
          reference: "Linear",
          rationale:
            "Linear puts assignee, state, labels and dates in the issue sidebar, because a record a team hands between shifts needs its ownership beside its facts. Alex Morgan sees at a glance that this order waits for Priya Shah under the label refund-check, and the history still reads below the handover.",
          tradeoff:
            "Ownership fields need data that tracks them, and on records one person owns end to end they repeat what the team already knows. The aside also grows long once labels, dates and watchers all claim a row.",
          html: shell(
            ORDER.number,
            `<div class="page rd-page">
  ${trail("Home", "Orders", ORDER.number)}
  <div class="phead">
    <div><h1>${ORDER.number} ${badgeRaw("Paid", "positive")}</h1><p class="desc">${ORDER.customer} · ${DELIVERY.name} · ${ORDER.placed}</p></div>
    <div class="acts"><button class="btn primary">Message customer</button></div>
  </div>
  <div class="rd-grid">
    <div class="stack">
      ${section("The customer", facts([["Name", ORDER.customer], ["Email", ORDER.email]]))}
      ${section("What was bought", BOUGHT)}
    </div>
    <div class="stack">
      ${section("Ownership", `<dl class="facts stacked"><div><dt>Waiting for</dt><dd><span class="inline"><span class="rd-avatar">PS</span>${PEOPLE.finance.name}</span></dd></div><div><dt>Labels</dt><dd><span class="chips"><span class="chip">refund-check</span><span class="chip">+ add</span></span></dd></div><div><dt>Follow up</dt><dd>Mon 12 Oct 2026</dd></div></dl>`)}
      ${section("What happened", `<div class="tl">${TIMELINE.slice(1, 4).map((e, i) => timelineEntry(e.title, e.when, e.who, e.tone, i === 2)).join("")}</div>`, { acts: '<button class="btn xs ghost">All 5</button>' })}
    </div>
  </div>
</div>`,
            "Orders",
          ),
        },
        {
          name: "Related records and history share the aside",
          reference: "HubSpot",
          rationale:
            "HubSpot draws associated records and the activity timeline in one right rail, so the aside answers both who this record touches and what happened to it. The delivery, the other order from this customer and the messages sit above a short history with a link to the rest.",
          tradeoff:
            "Two different jobs in one column, so neither gets the width it wants. Related records compete with history for the top of the aside, and the loser sits below the fold on a short viewport.",
          html: shell(
            ORDER.number,
            `<div class="page rd-page">
  ${trail("Home", "Orders", ORDER.number)}
  <div class="phead">
    <div><h1>${ORDER.number} ${badgeRaw("Paid", "positive")}</h1><p class="desc">${ORDER.customer} · ${DELIVERY.name} · ${ORDER.placed}</p></div>
    <div class="acts"><button class="btn primary">Message customer</button></div>
  </div>
  <div class="rd-grid">
    <div class="stack">
      ${section("What was bought", BOUGHT)}
      ${section("The customer", facts([["Name", ORDER.customer], ["Email", ORDER.email], ["Country", "Netherlands"]]))}
    </div>
    <div class="stack">
      ${section("Related", `<div class="rlist">${recordRow({ title: DELIVERY.name, sub: `${DELIVERY.date} · ${DELIVERY.place}`, actions: '<button class="btn xs">Open</button>' })}${recordRow({ title: "SO-1033", sub: "1 more order from this customer", actions: '<button class="btn xs">Open</button>' })}</div>`, { acts: '<button class="btn xs ghost">All 4</button>' })}
      ${section("What happened", `<div class="tl">${TIMELINE.slice(1, 3).map((e, i) => timelineEntry(e.title, e.when, e.who, e.tone, i === 1)).join("")}</div>`, { acts: '<button class="btn xs ghost">All 5</button>' })}
    </div>
  </div>
</div>`,
            "Orders",
          ),
        },
      ],
    },
    {
      id: "record-timeline",
      title: "The record timeline",
      why: "What happened to one record. The evidence is consistent: <b>newest first, always a timestamp, always a byline</b>, because the question the reader has is who did this and when. Sublabels matter more than labels for attribution.",
      verdict:
        "Keep the newest-first timeline with actor and timestamp: it is the shape Maersk and Paste both describe and it answers who and when on every line. The runner-up is the filtered timeline, which is the better choice once a record carries dozens of entries across kinds. Prefer the day-grouped option for dispatch records, where entries cluster on one morning. Never ship the actor-grouped timeline as the main history: it destroys the chronological order a timeline exists to give.",
      variants: [
        {
          name: "Newest first with actor and timestamp",
          pick: true,
          reference: "Maersk, Paste",
          rationale:
            "Newest first, each entry a plain-verb title with a byline and a timestamp, one deep link at most: the shape Maersk and Paste both describe.",
          tradeoff:
            "A long history has to be paginated or collapsed. Maersk collapses descriptions behind a toggle, which this does not.",
          html: shell(
            ORDER.number,
            `<div class="page rd-page" style="max-width:560px">
  ${trail("Home", "Orders", ORDER.number)}
  <div class="phead"><div><h1>${ORDER.number} ${badgeRaw("Paid", "positive")}</h1><p class="desc">${ORDER.customer} · ${DELIVERY.name}</p></div></div>
  ${section(
    "What happened",
    `<div class="tl">
      ${timelineEntry("Paid by card", "8 Oct 2026, 09:34", COMPANY.name, "positive")}
      ${timelineEntry("Labels printed", "8 Oct 2026, 09:34", COMPANY.name)}
      ${timelineEntry("Order placed", "8 Oct 2026, 09:32", ORDER.customer)}
      ${timelineEntry("Hold taken on two lamps", "8 Oct 2026, 09:32", COMPANY.name)}
    </div>`,
  )}
</div>`,
            "Orders",
          ),
        },
        {
          name: "A table instead of a timeline",
          rationale:
            "When the history is the record rather than context, a table is denser and sortable: when, who, what, with an amount column when money moved.",
          tradeoff:
            "Gives up the shape of a sequence for a grid of facts. A reader asking 'what happened in order' has to read down a table, which is slower than a timeline.",
          html: shell(
            ORDER.number,
            `<div class="page rd-page">
  ${trail("Home", "Orders", ORDER.number)}
  <div class="phead"><div><h1>${ORDER.number} ${badgeRaw("Paid", "positive")}</h1><p class="desc">${ORDER.customer}</p></div></div>
  ${section(
    "History",
    `<table class="dt dense">
      <thead><tr><th scope="col">When</th><th scope="col">What</th><th scope="col">Who</th><th scope="col" class="num">Amount</th></tr></thead>
      <tbody>
        <tr><td class="nowrap">8 Oct, 09:34</td><td>Paid by card</td><td>${COMPANY.name}</td><td class="num">${MONEY.order}</td></tr>
        <tr><td class="nowrap">8 Oct, 09:34</td><td>Labels printed</td><td>${COMPANY.name}</td><td class="num">—</td></tr>
        <tr><td class="nowrap">8 Oct, 09:32</td><td>Order placed</td><td>${ORDER.customer}</td><td class="num">${MONEY.order}</td></tr>
        <tr><td class="nowrap">8 Oct, 09:32</td><td>Hold taken on two lamps</td><td>${COMPANY.name}</td><td class="num">—</td></tr>
        <tr><td class="nowrap">1 Oct, 14:02</td><td>Checkout started</td><td>${ORDER.customer}</td><td class="num">—</td></tr>
      </tbody>
    </table>`,
    { flush: true },
  )}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Grouped by day with a date label",
          rationale:
            "Where entries cluster, a date heading above each group saves repeating the date on every line and makes the shape of the day obvious.",
          tradeoff:
            "More markup for the same information, and a reader scanning for one entry has to look under the right date heading.",
          html: shell(
            "Pickup record",
            `<div class="page rd-page" style="max-width:560px">
  ${trail("Home", "Orders", DELIVERY.name, "Dispatch")}
  <div class="phead"><div><h1>Maria Garcia</h1><p class="desc">Collected at the pickup counter at 10:41 on ${DELIVERY.date}.</p></div></div>
  ${section(
    "What happened",
    `<div class="stack">
      <div>
        <div style="font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:var(--muted-foreground);margin-bottom:8px">14 March 2026</div>
        <div class="tl">
          ${timelineEntry("Collected at the pickup counter", "10:41", PEOPLE.warehouse.name, "positive")}
          ${timelineEntry("Label scanned at counter 1", "10:41", PEOPLE.warehouse.name)}
          ${timelineEntry("Two counters scanned this label", "10:40 and 10:41", "Chris Novak, Alex Morgan", "caution", true)}
        </div>
      </div>
      <div>
        <div style="font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:var(--muted-foreground);margin-bottom:8px">9 January 2026</div>
        <div class="tl">
          ${timelineEntry("Label printed", "10:04", COMPANY.name, "neutral", true)}
        </div>
      </div>
    </div>`,
  )}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Collapsed descriptions behind a toggle",
          reference: "Maersk",
          rationale:
            "Maersk's approach: title and byline always, description behind a show-details toggle. Keeps a fifty-entry history to fifty lines.",
          tradeoff:
            "The description is where the evidence lives for a dispute, so hiding it by default hides what a support reader came for.",
          html: shell(
            "Dispute D-0182",
            `<div class="page rd-page" style="max-width:600px">
  ${trail("Home", "Invoices", "Disputes", "D-0182")}
  <div class="phead"><div><h1>Dispute D-0182 ${badgeRaw("Disputed", "destructive")}</h1><p class="desc">${MONEY.lamp} on order SO-1019.</p></div></div>
  ${section(
    "History",
    `<div class="tl">
      ${timelineEntry("Evidence attached", "3 Oct 2026, 11:05", PEOPLE.finance.name)}
      ${timelineEntry("Answer sent to the card issuer", "3 Oct 2026, 11:02", PEOPLE.finance.name)}
      ${timelineEntry("Customer contacted support", "3 Oct 2026, 09:14", PEOPLE.support.name, "caution")}
      ${timelineEntry("Case opened by the card issuer", "2 Oct 2026, 14:22", "The payment processor", "destructive")}
      ${timelineEntry("Order placed and paid by card", "28 Sep 2026, 19:02", "Tom Becker", "neutral", true)}
    </div>`,
  )}
  <div class="btnrow" style="margin-top:10px"><button class="btn sm">Show the detail for each</button></div>
</div>`,
            "Invoices",
          ),
        },
        {
          name: "Grouped by actor, for an audit question",
          rationale:
            "When the question is 'who touched this', the timeline is grouped by person. Each person carries their own list, newest first within it.",
          tradeoff:
            "Destroys chronological order, which is the order a timeline exists to give. A person touching a record five times over a month reads as one entry.",
          html: shell(
            ORDER.number,
            `<div class="page rd-page" style="max-width:560px">
  ${trail("Home", "Orders", ORDER.number)}
  <div class="phead"><div><h1>${ORDER.number}</h1><p class="desc">${ORDER.customer}. Seven things happened to this order.</p></div></div>
  ${section(
    "By person",
    `<div class="stack lg">
      ${[
        [COMPANY.name, [["Paid by card", "8 Oct, 09:34"], ["Labels printed", "8 Oct, 09:34"], ["Order placed", "8 Oct, 09:32"]]],
        [PEOPLE.support.name, [["Resent the confirmation at the customer's request", "8 Oct, 11:20"], ["Noted the delivery delay", "8 Oct, 11:18"]]],
        [ORDER.customer, [["Corrected her email address", "8 Oct, 10:51"]]],
      ]
        .map(
          ([who, rows]) => `<div>
        <div class="inline" style="margin-bottom:7px"><span style="width:22px;height:22px;border-radius:50%;background:var(--muted);display:grid;place-items:center;font-size:10px">${who.split(" ").map((w) => w[0]).join("")}</span><b style="font-size:12.5px">${who}</b><span class="muted" style="font-size:11.5px">${rows.length === 1 ? "1 thing" : `${rows.length} things`}</span></div>
        <div class="stack sm" style="padding-left:29px;border-left:1px solid var(--border)">
          ${rows.map(([what, when]) => `<div class="split" style="font-size:12.5px"><span>${what}</span><span class="fig muted" style="font-size:11.5px">${when}</span></div>`).join("")}
        </div>
      </div>`,
        )
        .join("")}
    </div>`,
  )}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Timeline with a 'what changed' diff on each entry",
          rationale:
            "Each entry names what it changed, so the history answers what the record looks like now as well as how it got here. This is what an audit register carries.",
          tradeoff:
            "A diff needs the before and after, so it has to be reconstructed at read time rather than read from the entry that recorded the change.",
          html: shell(
            ORDER.number,
            `<div class="page rd-page" style="max-width:620px">
  ${trail("Home", "Orders", ORDER.number)}
  <div class="phead"><div><h1>${ORDER.number}</h1><p class="desc">${ORDER.customer}</p></div></div>
  ${section(
    "History",
    `<div class="tl">
      <div class="tlrow"><span class="rail"><span class="node positive"></span><span class="thread"></span></span><span class="tx">
        <b>Payment settled</b><small>8 Oct 2026, 09:34 · ${COMPANY.name}</small>
        <div class="hint" style="margin-top:5px"><span class="mono">state</span> Awaiting payment → Paid<br><span class="mono">paid at</span> (empty) → 8 Oct 2026, 09:34</div>
      </span></div>
      <div class="tlrow"><span class="rail"><span class="node"></span><span class="thread"></span></span><span class="tx">
        <b>Labels printed</b><small>8 Oct 2026, 09:34 · ${COMPANY.name}</small>
        <div class="hint" style="margin-top:5px">Two labels created, codes PC-0C893968A2 and PC-0C893968A3</div>
      </span></div>
      <div class="tlrow"><span class="rail"><span class="node"></span></span><span class="tx">
        <b>Order placed</b><small>8 Oct 2026, 09:32 · ${ORDER.customer}</small>
        <div class="hint" style="margin-top:5px">Two lamps and a cable tray held, ${MONEY.order} due</div>
      </span></div>
    </div>`,
  )}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Filtered by kind and actor",
          reference: "GitHub",
          rationale:
            "GitHub lets a reader filter an issue timeline to comments, commits or references, because a long record mixes kinds and the reader usually wants one. The filters sit above the timeline and the count beside each says what choosing it keeps.",
          tradeoff:
            "A filtered timeline hides entries without saying which, so a reader can miss the one line that mattered. The filter state also needs a reset that is always visible, or the hiding looks like absence.",
          html: shell(
            ORDER.number,
            `<div class="page rd-page" style="max-width:600px">
  ${trail("Home", "Orders", ORDER.number)}
  <div class="phead"><div><h1>${ORDER.number} ${badgeRaw("Paid", "positive")}</h1><p class="desc">${ORDER.customer} · ${DELIVERY.name}</p></div></div>
  ${section(
    "What happened",
    `<div class="stack">
      <div class="inline"><span class="chips"><span class="chip">Payments · 2</span><span class="chip">Parcels · 2</span><span class="chip">Messages · 2</span><span class="chip">Edits · 1</span></span><button class="btn xs ghost">Show all 7</button></div>
      <div class="tl">
        ${timelineEntry("Confirmation resent at the customer's request", "8 Oct 2026, 11:20", PEOPLE.support.name)}
        ${timelineEntry("Customer asked where the confirmation is", "8 Oct 2026, 11:18", PEOPLE.support.name)}
        ${timelineEntry("Paid by card", "8 Oct 2026, 09:34", COMPANY.name, "positive")}
        ${timelineEntry("Labels printed", "8 Oct 2026, 09:34", COMPANY.name)}
        ${timelineEntry("Order placed", "8 Oct 2026, 09:32", ORDER.customer, "neutral", true)}
      </div>
    </div>`,
  )}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Entries and internal notes in one feed",
          reference: "Zendesk",
          rationale:
            "Zendesk draws notes and entries in one order feed, newest last, because support reads what the team said beside what the system did. A note Jordan Lee wrote at 11:18 sits between the resend it explains and the payment it followed.",
          tradeoff:
            "Notes and entries compete for the same line height, so the feed grows long faster than either would alone. A reader who wants only the system's facts has to skip the team's words, and there is no filter on this option.",
          html: shell(
            ORDER.number,
            `<div class="page rd-page" style="max-width:600px">
  ${trail("Home", "Orders", ORDER.number)}
  <div class="phead"><div><h1>${ORDER.number} ${badgeRaw("Paid", "positive")}</h1><p class="desc">${ORDER.customer} · ${DELIVERY.name}</p></div><div class="acts"><button class="btn sm">Add a note</button></div></div>
  ${section(
    "What happened",
    `<div class="rd-feed">
      <div class="tl">
        ${timelineEntry("Confirmation resent at the customer's request", "8 Oct 2026, 11:20", PEOPLE.support.name)}
      </div>
      <div class="rd-feed-note"><p>Maria wrote that the confirmation never arrived. Her address was correct; the mail provider held the message for two hours.</p><small>${PEOPLE.support.name} · 8 Oct 2026, 11:18 · Internal</small></div>
      <div class="tl">
        ${timelineEntry("Email corrected by the customer", "8 Oct 2026, 10:51", ORDER.customer)}
        ${timelineEntry("Paid by card", "8 Oct 2026, 09:34", COMPANY.name, "positive")}
        ${timelineEntry("Order placed", "8 Oct 2026, 09:32", ORDER.customer, "neutral", true)}
      </div>
    </div>`,
  )}
</div>`,
            "Orders",
          ),
        },
      ],
    },
    {
      id: "record-related",
      title: "Records related to this one",
      why: "An order belongs to a delivery, a customer and a channel; a delivery belongs to a warehouse and a schedule. The order record states the delivery in prose in its description rather than <b>linking to it</b>.",
      verdict:
        "Ship the link-with-state list: each relation is a link carrying its own state, so a reader can jump and knows what they will find. The runner-up is the preview-card option, which is the better choice where the parent's facts decide the next step, such as a parcel read against its delivery. Prefer the filtered-list counts on records whose children number in the hundreds. Never ship the bare cross-reference line: it cannot carry the parent's state and it hides in the description.",
      variants: [
        {
          name: "Each relation is a link with its state",
          pick: true,
          rationale:
            "The delivery, the customer and the channel appear as links carrying their own state, so a reader can jump and knows what they will find. Nothing here is prose.",
          tradeoff:
            "Three links is a small nav of its own, and it competes with the record's own commands for the reader's attention.",
          html: shell(
            ORDER.number,
            `<div class="page rd-page">
  ${trail("Home", "Orders", ORDER.number)}
  <div class="phead">
    <div><h1>${ORDER.number} ${badgeRaw("Paid", "positive")}</h1><p class="desc">Placed ${ORDER.placed}.</p></div>
    <div class="acts"><button class="btn primary">Message customer</button></div>
  </div>
  ${section(
    "Belongs to",
    `<div class="rlist">
      ${recordRow({ title: DELIVERY.name, sub: `${DELIVERY.date} · ${DELIVERY.place}`, state: { label: "Scheduled", tone: "info" }, actions: '<button class="btn sm">Open delivery</button>' })}
      ${recordRow({ title: "Standard price", sub: "the price tier on this order", state: { label: "Active", tone: "positive" }, actions: '<button class="btn sm">Open tier</button>' })}
      ${recordRow({ title: "Online store", sub: "the channel it was bought through", state: { label: "Published", tone: "positive" }, actions: '<button class="btn sm">Open channel</button>' })}
      ${recordRow({ title: ORDER.customer, sub: `${ORDER.email} · 1 other order`, actions: '<button class="btn sm">See orders</button>' })}
    </div>`,
  )}
</div>`,
            "Orders",
          ),
        },
        {
          name: "A breadcrumb as the relation chain",
          rationale:
            "The trail itself is the relation chain: delivery, then order. Nothing repeats it, which is the design contract's strongest single rule.",
          tradeoff:
            "The trail cannot carry state, so a reader cannot tell a scheduled delivery from a finished one without opening it.",
          html: shell(
            ORDER.number,
            `<div class="page rd-page">
  ${trail("Home", "Orders", DELIVERY.name, ORDER.number)}
  <div class="phead">
    <div><h1>${ORDER.number} ${badgeRaw("Paid", "positive")}</h1><p class="desc">${ORDER.customer} · ${ORDER.placed} · ${MONEY.order}</p></div>
    <div class="acts"><button class="btn primary">Message customer</button></div>
  </div>
  ${section("The customer", facts([["Name", ORDER.customer], ["Email", ORDER.email]]))}
  ${section("What was bought", BOUGHT)}
</div>`,
            "Orders",
          ),
        },
        {
          name: "A section of other orders on the same delivery",
          rationale:
            "The related record is the other orders, as a short list with the money beside each. Answers 'who else is on this delivery' without leaving.",
          tradeoff:
            "Anywhere between one and two hundred rows, which is a table with a limit rather than a section. The money page already splits it by delivery for this reason.",
          html: shell(
            DELIVERY.name,
            `<div class="page rd-page">
  ${trail("Home", "Orders", DELIVERY.name)}
  <div class="phead">
    <div><h1>${DELIVERY.name} ${badgeRaw("Scheduled", "info")}</h1><p class="desc">${DELIVERY.date}, ${DELIVERY.window} · ${DELIVERY.place}</p></div>
    <div class="acts"><button class="btn primary">Add a parcel</button></div>
  </div>
  ${section("The delivery", facts([["Capacity", DELIVERY.capacity], ["Loaded", "36 of 40 pallets"], ["Company", COMPANY.name]]))}
  ${section(
    "Other orders on this delivery",
    `<div class="rlist">
      ${[
        [ORDER.number, ORDER.customer, "8 Oct, 09:32", MONEY.order],
        ["SO-1031", "Tom Becker", "8 Oct, 09:30", "EUR 40.45"],
        ["SO-1027", "Elin Lindqvist", "7 Oct, 22:14", MONEY.lamp],
        ["SO-1019", "Tom Becker", "7 Oct, 19:02", MONEY.lamp],
      ]
        .map(([no, who, when, amt]) => recordRow({ title: `<span class="code">${no}</span>`, sub: `${who} · ${when}`, fig: amt, actions: '<button class="btn sm">Open</button>' }))
        .join("")}
    </div>`,
    { acts: '<button class="btn xs">All 1,204</button>' },
  )}
</div>`,
            "Orders",
          ),
        },
        {
          name: "A cross-reference line, not a section",
          rationale:
            "One line under the heading naming the parent record as a link. The smallest possible way to say where this record belongs, and nothing more.",
          tradeoff:
            "Invisible to anyone who does not read descriptions, and it cannot carry the parent's state, so the reader has to open it to learn whether it is still live.",
          html: shell(
            ORDER.number,
            `<div class="page rd-page">
  ${trail("Home", "Orders", ORDER.number)}
  <div class="phead">
    <div><h1>${ORDER.number} ${badgeRaw("Paid", "positive")}</h1><p class="desc">Part of <a href="#" style="text-decoration:underline">${DELIVERY.name}</a>, ${DELIVERY.date}.</p></div>
    <div class="acts"><button class="btn primary">Message customer</button></div>
  </div>
  ${section("The customer", facts([["Name", ORDER.customer], ["Email", ORDER.email]]))}
  ${section("What was bought", BOUGHT)}
</div>`,
            "Orders",
          ),
        },
        {
          name: "A count that links to the filtered list",
          rationale:
            "'2 parcels on this order' links to the parcels list filtered to this order, so the relation is navigable in both directions and the count is never stale.",
          tradeoff:
            "A link whose text is a number reads as a figure, not a destination, unless the hover and the visited colour make it clear. WCAG 2.4.4 wants the purpose to be clear from the link text.",
          html: shell(
            ORDER.number,
            `<div class="page rd-page">
  ${trail("Home", "Orders", ORDER.number)}
  <div class="phead">
    <div><h1>${ORDER.number} ${badgeRaw("Paid", "positive")}</h1><p class="desc">${ORDER.customer} · ${DELIVERY.name}</p></div>
    <div class="acts"><button class="btn primary">Message customer</button></div>
  </div>
  ${section(
    "Records on this order",
    `<div class="stack sm">
      <a href="#" class="split" style="text-decoration:none"><span>Parcels</span><span class="fig"><u>2</u> →</span></a>
      <a href="#" class="split" style="text-decoration:none"><span>Payments</span><span class="fig"><u>1</u> →</span></a>
      <a href="#" class="split" style="text-decoration:none"><span>Messages</span><span class="fig"><u>2</u> →</span></a>
      <a href="#" class="split" style="text-decoration:none"><span>Refunds</span><span class="fig muted">None</span></a>
    </div>`,
  )}
</div>`,
            "Orders",
          ),
        },
        {
          name: "The parent as a card above the record's own sections",
          rationale:
            "The parent record opens in a card at the top with its own state and its commands, so a reader acting on the child can act on the parent without navigating.",
          tradeoff:
            "A box inside the page above the sections, which is the nesting the design contract forbids, and it makes the child look secondary when it is the page.",
          html: shell(
            "PC-0C893968A2",
            `<div class="page rd-page">
  ${trail("Home", "Orders", ORDER.number, "PC-0C893968A2")}
  <div class="phead"><div><h1>PC-0C893968A2 ${badgeRaw("Packed", "neutral")}</h1><p class="desc">One parcel on order ${ORDER.number}.</p></div></div>
  ${section(
    "The delivery this parcel ships with",
    `<div class="inline" style="margin-bottom:11px"><span style="width:34px;height:34px;border-radius:var(--radius-sm);background:var(--muted);display:grid;place-items:center">◈</span><div><b style="font-size:13px">${DELIVERY.name}</b><br><span class="muted" style="font-size:11.5px">${DELIVERY.date}, ${DELIVERY.window} · ${DELIVERY.place}</span></div>${badgeRaw("Scheduled", "info")}<button class="btn sm" style="margin-left:auto">Open delivery</button></div>`,
    { desc: "The delivery decides when this parcel leaves." },
  )}
  ${section("This parcel", facts([["Contents", "Oak desk lamp"], ["Quantity", "1"], ["Customer", ORDER.customer], ["Packed", "8 Oct 2026, 09:34"]], { stacked: true }))}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Links with a preview of the parent",
          reference: "Notion",
          rationale:
            "Notion shows a preview of a linked page on hover, because the reader usually wants one fact from the parent rather than the parent itself. The delivery row expands to its date, place and state inline, so a reader checking a parcel learns the dispatch window without navigating.",
          tradeoff:
            "A preview is a second rendering of the parent to keep true, and only one row can be open at a time before the section doubles in height. It also answers nothing about children, which still need the list.",
          html: shell(
            "PC-0C893968A2",
            `<div class="page rd-page">
  ${trail("Home", "Orders", ORDER.number, "PC-0C893968A2")}
  <div class="phead"><div><h1>PC-0C893968A2 ${badgeRaw("Packed", "neutral")}</h1><p class="desc">One parcel on order ${ORDER.number}.</p></div><div class="acts"><button class="btn sm">Void</button></div></div>
  ${section(
    "Belongs to",
    `<div class="rlist">
      ${recordRow({ title: DELIVERY.name, sub: `${DELIVERY.date} · ${DELIVERY.place}`, state: { label: "Scheduled", tone: "info" }, actions: '<button class="btn xs">Open delivery</button>' })}
    </div>
    <div style="margin-top:10px">${facts([["Leaves", `${DELIVERY.date}, ${DELIVERY.window}`], ["Pallets left", "4 of 40"], ["Company", COMPANY.name]])}</div>`,
    { desc: "The preview carries the three facts a warehouse reader asks for. Everything else lives on the delivery." },
  )}
  ${section("This parcel", facts([["Contents", "Oak desk lamp"], ["Quantity", "1"], ["Customer", ORDER.customer], ["Packed", "8 Oct 2026, 09:34"]]))}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Children as an editable table",
          reference: "Airtable",
          rationale:
            "Airtable draws linked records as rows that can be added and removed in place, because the relation itself is the work. The variants of a product gain a row each with their price and stock count, and the section holds the Add control rather than sending the reader elsewhere.",
          tradeoff:
            "Editing inside a section blurs reading and writing: every row needs its own validation and refusal states. It also fits only children with few columns; a wide child still wants its own page.",
          html: shell(
            PRODUCT.name,
            `<div class="page rd-page">
  ${trail("Home", "Products", PRODUCT.name)}
  <div class="phead">
    <div><h1>${PRODUCT.name} ${badgeRaw("Active", "positive")}</h1><p class="desc">What this product is, and the SKU its parcels carry.</p></div>
    <div class="acts"><button class="btn primary">Add a variant</button></div>
  </div>
  ${section(
    "Variants",
    `<table class="dt">
      <thead><tr><th scope="col">Variant</th><th scope="col">State</th><th scope="col" class="num">Price</th><th scope="col" class="num">In stock</th><th scope="col"><span style="display:inline-block;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap">Open</span></th></tr></thead>
      <tbody>
        <tr><td>Standard</td><td>${badgeRaw("Active", "positive")}</td><td class="num">${MONEY.lamp}</td><td class="num">412</td><td class="num"><button class="btn xs">Open</button></td></tr>
        <tr><td>Gift box</td><td>${badgeRaw("Active", "positive")}</td><td class="num">EUR 52.00</td><td class="num">96</td><td class="num"><button class="btn xs">Open</button></td></tr>
        <tr><td>Display model</td><td>${badgeRaw("Paused", "caution")}</td><td class="num">EUR 0.00</td><td class="num">3</td><td class="num"><button class="btn xs">Open</button></td></tr>
      </tbody>
    </table>`,
    { flush: true, desc: "Every variant of this product. The prices are the company's own data." },
  )}
</div>`,
            "Products",
          ),
        },
      ],
    },
    {
      id: "record-permissions",
      title: "A record the reader may not act on",
      why: "A refused state exists, and the guidance says a page a role cannot use shows it <b>with the reason and the grant that helps</b>. The question is whether that is a whole page or a part of one.",
      verdict:
        "Keep the refused commands on a readable record: warehouse staff can read an order and cannot refund it, and each refusal names the grant that would allow it. The runner-up is the ask-for-access option, which is the better choice where access is routinely granted, such as a seasonal worker joining support. Prefer the field-withheld option only where the values themselves are restricted, such as customer personal data under a warehouse role. Never ship the role switcher on production: acting as somebody is a development capability, and the button would be a security hole with a label on it.",
      variants: [
        {
          name: "The commands are refused, the record is not",
          pick: true,
          rationale:
            "Warehouse staff can read an order and cannot refund it. The page shows everything and refuses only the commands, naming the grant that would allow each one. This is an explained action: a disabled button with its reason beside it.",
          tradeoff:
            "A page full of refused commands is a page that looks broken to someone who does not know what their role is.",
          html: shell(
            ORDER.number,
            `<div class="page rd-page">
  ${trail("Home", "Orders", ORDER.number)}
  <div class="phead">
    <div><h1>${ORDER.number} ${badgeRaw("Paid", "positive")}</h1><p class="desc">${ORDER.customer} · ${DELIVERY.name}</p></div>
    <div class="acts">
      <div class="explained" style="align-items:flex-end">
        <button class="btn" aria-disabled="true">Resend the confirmation</button>
        <span class="why">Your role can read orders. Only Support can resend the confirmation.</span>
      </div>
    </div>
  </div>
  ${section(
    "Refunds",
    `<div class="explained">
      <button class="btn subtle-danger" aria-disabled="true">Refund this order</button>
      <span class="why">Refunds move money. The <b>finance</b> role can do this; your role is <b>warehouse-lead</b>.</span>
    </div>`,
    { desc: `${MONEY.order} is paid and none of it has been refunded.` },
  )}
  ${section("The customer", facts([["Name", ORDER.customer], ["Email", ORDER.email]]))}
</div>`,
            "Orders",
          ),
        },
        {
          name: "The whole page is refused",
          rationale:
            "The record itself is out of the reader's reach, not just its commands. A refused state replaces the page body and names the grant.",
          tradeoff:
            "Nothing is shown, so a warehouse lead cannot read a customer's name to answer a question at the counter. That is a real cost on the surface where names matter most.",
          html: shell(
            ORDER.number,
            `<div class="page rd-page">
  ${trail("Home", "Orders", ORDER.number)}
  <div class="phead"><div><h1>${ORDER.number}</h1></div></div>
  ${section(
    "",
    emptyState(
      "You cannot open this order",
      "Your role is warehouse-lead. Orders are readable by Support, Finance and Owners. Ask an owner to change your role, or use the dispatch record for this parcel instead.",
      '<button class="btn">Open the dispatch record instead</button>',
      "⚠",
    ),
  )}
</div>`,
            "Orders",
          ),
        },
        {
          name: "A banner above the page, the record still readable",
          rationale:
            "A page-level notice says what this role may not do on this page, once, and the sections below stay readable. The reader is told rather than blocked.",
          tradeoff:
            "A full-width band on a page about other work breaks the rule that tone marks content, not chrome, so this has to be a neutral notice, not a caution one.",
          html: shell(
            "Invoices",
            `<div class="page rd-page">
  ${trail("Home", "Invoices", "Disputes")}
  <div class="alert info" style="margin-bottom:14px">
    <span class="ico" aria-hidden="true">i</span>
    <span class="txt"><b>You can read disputes, not answer them.</b><small>Answering a bank case moves ${MONEY.lamp} and is the <b>finance</b> role.</small></span>
  </div>
  <div class="phead">
    <div><h1>Dispute D-0182 ${badgeRaw("Disputed", "destructive")}</h1><p class="desc">${MONEY.lamp} on order SO-1019.</p></div>
    <div class="acts"><div class="explained"><button class="btn primary" aria-disabled="true">Answer the bank</button><span class="why">Only Finance can answer.</span></div></div>
  </div>
  ${section("What the bank said", `<p style="font-size:12.5px">"Cardholder says the order was cancelled by the merchant."</p>`)}
</div>`,
            "Invoices",
          ),
        },
        {
          name: "The command is absent, not refused",
          rationale:
            "A command the role does not have is not drawn at all. The guidance is that a tab or link appears only for a viewer who may open its page, extended to buttons.",
          tradeoff:
            "Nothing tells the reader the capability exists elsewhere, so they cannot find out who can do it. On a page of four commands, three of them missing looks like a broken deployment.",
          html: shell(
            ORDER.number,
            `<div class="page rd-page">
  ${trail("Home", "Orders", ORDER.number)}
  <div class="phead">
    <div><h1>${ORDER.number} ${badgeRaw("Paid", "positive")}</h1><p class="desc">${ORDER.customer} · ${DELIVERY.name}</p></div>
    <div class="acts"><button class="btn">Message customer</button></div>
  </div>
  ${section("The customer", facts([["Name", ORDER.customer], ["Email", ORDER.email]]))}
  ${section("What was bought", BOUGHT)}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Personal data withheld field by field",
          rationale:
            "The order stays readable and only the customer's personal data is withheld, each field saying so where the value would be. The server never sends the value, so nothing is merely hidden. The header offers the one step that would change it.",
          tradeoff:
            "Every personal field needs a withheld form, and a reader sees that a value exists without seeing it. A caution alert on top of that repeats what the fields already say.",
          html: shell(
            ORDER.number,
            `<div class="page rd-page">
  ${trail("Home", "Orders", ORDER.number)}
  <div class="phead">
    <div><h1>${ORDER.number} ${badgeRaw("Paid", "positive")}</h1></div>
    <div class="acts"><button class="btn">Ask an owner for access</button></div>
  </div>
  ${section(
    "The customer",
    facts([
      ["Name", '<span class="rd-withheld">Withheld for your role</span>'],
      ["Email", '<span class="rd-withheld">Withheld for your role</span>'],
      ["Country", "Netherlands"],
    ]),
    { desc: "Support, Finance and Owners can read who placed an order. Your role is Warehouse lead." },
  )}
  ${section("What was bought", BOUGHT)}
</div>`,
            "Orders",
          ),
        },
        {
          name: "A role switcher rather than a refusal",
          rationale:
            "The development persona menu already lets a staff member act as somebody else. A record the role cannot use offers the role that can, in one click, for a deployment being demonstrated.",
          tradeoff:
            "Only honest where acting as somebody is a real capability. On a production deployment with one real account it is a security hole with a nice button on it.",
          html: shell(
            ORDER.number,
            `<div class="page rd-page">
  ${trail("Home", "Orders", ORDER.number)}
  <div class="phead">
    <div><h1>${ORDER.number} ${badgeRaw("Paid", "positive")}</h1><p class="desc">${ORDER.customer} · ${DELIVERY.name}</p></div>
    <div class="acts"><button class="btn primary">Open as Finance</button></div>
  </div>
  ${section(
    "",
    `<div class="alert info">
      <span class="txt"><b>You are acting as ${PEOPLE.warehouse.name}, warehouse lead.</b><small>Finance can refund this order and you cannot. Nothing you do here is recorded as Finance.</small></span>
      <span class="tail"><button class="btn sm">Stop acting</button></span>
    </div>`,
  )}
  ${section("The order", facts([["Customer", ORDER.customer], ["Paid", MONEY.order], ["Placed", ORDER.placed]]))}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Ask for access from the refused command",
          reference: "Google Drive",
          rationale:
            "Google Drive turns a refusal into a request: the reader asks, an owner decides, and the decision arrives as a message. A warehouse lead who needs to resend the confirmation asks from the refusal itself instead of finding an owner in a corridor.",
          tradeoff:
            "Every request needs an owner who answers it, and a queue of access requests is a new surface to build and watch. On records where access is never granted it promises a decision that never comes.",
          html: shell(
            ORDER.number,
            `<div class="page rd-page">
  ${trail("Home", "Orders", ORDER.number)}
  <div class="phead">
    <div><h1>${ORDER.number} ${badgeRaw("Paid", "positive")}</h1><p class="desc">${ORDER.customer} · ${DELIVERY.name}</p></div>
    <div class="acts"><button class="btn">Message customer</button></div>
  </div>
  ${section(
    "Refunds",
    `<div class="stack sm">
      <p class="note">${MONEY.order} is paid and none of it has been refunded. Refunds move money, so only the finance role can make one.</p>
      <div class="btnrow"><button class="btn sm">Ask for access</button><span class="muted" style="font-size:11.5px">${PEOPLE.owner.name} decides, usually within a day.</span></div>
    </div>`,
  )}
  ${section("The customer", facts([["Name", ORDER.customer], ["Email", ORDER.email]]))}
</div>`,
            "Orders",
          ),
        },
        {
          name: "A read-only ribbon naming what the role can do",
          reference: "Figma",
          rationale:
            "Figma tells a view-only reader exactly that, in a ribbon above the canvas, and lists what the role can still do. The ribbon here says the warehouse role reads orders and scans parcels, so the reader knows their reach before they reach past it.",
          tradeoff:
            "A ribbon on every page a role cannot fully use is a ribbon on most pages for the narrowest roles. It also states the role's reach in words the data has to keep true per page.",
          html: shell(
            ORDER.number,
            `<div class="page rd-page">
  ${trail("Home", "Orders", ORDER.number)}
  <div class="alert plain" style="margin-bottom:14px"><span class="txt"><b>You are reading as Warehouse lead.</b> You can read orders and scan parcels. Resending the confirmation and refunds belong to other roles.</span><span class="tail"><button class="btn sm">What can I do?</button></span></div>
  <div class="phead">
    <div><h1>${ORDER.number} ${badgeRaw("Paid", "positive")}</h1><p class="desc">${ORDER.customer} · ${DELIVERY.name}</p></div>
    <div class="acts"><button class="btn" aria-disabled="true">Resend the confirmation</button><button class="btn subtle-danger" aria-disabled="true">Refund this order</button></div>
  </div>
  ${section("The customer", facts([["Name", ORDER.customer], ["Email", ORDER.email]]))}
  ${section("What was bought", BOUGHT)}
</div>`,
            "Orders",
          ),
        },
      ],
    },
    {
      id: "record-audit",
      title: "Who changed the record",
      floorplan: "record-page",
      why: "One order or one delivery is touched by several people before the week is over: the customer corrects an email, the manager answers, finance adds a note. When the customer disputes what happened, the company answers from the record itself, naming who did what and when. The audit trail is that answer, read beside the facts it explains rather than in a log elsewhere.",
      verdict:
        "Ship the history tab on the record: it keeps one route, the tab state stays in the URL, and a reader checking a claim opens History without losing the order. The runner-up is the per-field history, which is the better choice where one value is disputed, such as the email the confirmation went to. Prefer the full-page log only for long-lived records whose trail outgrows a tab. Never ship the money-only trail as the audit: the edits that explain the money are missing and there are two histories to keep true.",
      variants: [
        {
          name: "History as a tab on the record",
          pick: true,
          rationale:
            "The audit sits beside Details and Payment as one more facet, so the record keeps one route and the tab state stays in the URL the way record tabs do. A reader checking a claim opens History without losing the order.",
          tradeoff:
            "The trail is hidden until its tab opens, and facts cannot be compared against the trail without switching back and forth.",
          html: shell(
            ORDER.number,
            `<div class="page rd-page">
  ${trail("Home", "Orders", ORDER.number)}
  <div class="phead"><div><h1>${ORDER.number} ${badgeRaw("Paid", "positive")}</h1><p class="desc">Placed ${ORDER.placed} by ${ORDER.customer} of ${ORDER.company}.</p></div><div class="acts"><button class="btn sm">Resend the confirmation</button><button class="btn primary">Message customer</button></div></div>
  ${tabs(["Details", "Parcels", "Payment", "History"], 3)}
  ${section("History", '<div class="tl">' + timelineEntry("Refund note added", "8 Oct 2026, 09:34", PEOPLE.finance.name, "neutral") + timelineEntry("Email corrected", "8 Oct 2026, 09:33", PEOPLE.customer.name, "neutral") + timelineEntry("Order paid by card", ORDER.placed, PEOPLE.customer.name, "positive") + timelineEntry("Order placed", ORDER.placed, PEOPLE.customer.name, "neutral", true) + "</div>", { desc: "Who did what to this order, newest first." })}
</div>`,
            "Orders",
          ),
        },
        {
          name: "History in a side panel beside the summary",
          rationale:
            "Facts and history read side by side, so Alex Morgan sees the email and who corrected it in one glance. Nothing is behind a tab.",
          tradeoff:
            "Each column is half the width, so long entries wrap, and on a narrow screen the panel stacks below the facts it explains.",
          html: shell(
            ORDER.number,
            `<div class="page rd-page">
  ${trail("Home", "Orders", ORDER.number)}
  <div class="phead"><div><h1>${ORDER.number} ${badgeRaw("Paid", "positive")}</h1><p class="desc">${ORDER.customer} bought for ${ORDER.company}.</p></div><div class="acts"><button class="btn primary">Message customer</button></div></div>
  ${twoCol(section("The order", facts([["Customer", ORDER.customer], ["Delivery", DELIVERY.name], ["Placed", ORDER.placed], ["Paid", MONEY.order]])), section("History", '<div class="tl">' + timelineEntry("Refund note added", "8 Oct 2026, 09:34", PEOPLE.finance.name, "neutral") + timelineEntry("Customer message sent", "8 Oct 2026, 09:33", PEOPLE.manager.name, "neutral") + timelineEntry("Order paid by card", ORDER.placed, PEOPLE.customer.name, "positive", true) + "</div>"))}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Full-page audit log with filters",
          rationale:
            "Every change on one scrolling page with actor and kind filters, which suits a long-lived delivery whose trail outgrows a tab. Filters answer whose changes these are without reading them all.",
          tradeoff:
            "The trail leaves the record it explains, so the reader holds the facts in memory, and the filters need data support for actor and kind.",
          html: shell(
            "History",
            `<div class="page rd-page">
  ${trail("Home", "Orders", ORDER.number, "History")}
  ${phead("History of " + ORDER.number, "Every change to this order, newest first.", '<button class="btn sm">Export</button>')}
  ${toolbar({ search: "", filters: ["Everyone", "All changes"], placeholder: "Search changes" })}
  ${section("Changes", '<div class="tl">' + timelineEntry("Refund note added", "8 Oct 2026, 09:34", PEOPLE.finance.name, "neutral") + timelineEntry("Customer message sent", "8 Oct 2026, 09:33", PEOPLE.manager.name, "neutral") + timelineEntry("Email corrected", "8 Oct 2026, 09:33", PEOPLE.customer.name, "neutral") + timelineEntry("Labels printed", "8 Oct 2026, 09:32", "", "neutral") + timelineEntry("Order paid by card", ORDER.placed, PEOPLE.customer.name, "positive") + timelineEntry("Order placed", ORDER.placed, PEOPLE.customer.name, "neutral", true) + "</div>")}
  ${pager(1, 1, 1, 6, 6)}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Last change line with an expander",
          rationale:
            "One line answers the common question, who touched this last, and the expander reveals the rest without a new route. The record stays short.",
          tradeoff:
            "Older changes stay hidden behind a click, and the expander state is not shareable, so two people cannot point at the same open trail.",
          html: shell(
            ORDER.number,
            `<div class="page rd-page">
  ${trail("Home", "Orders", ORDER.number)}
  <div class="phead"><div><h1>${ORDER.number} ${badgeRaw("Paid", "positive")}</h1><p class="desc">Placed ${ORDER.placed} by ${ORDER.customer} of ${ORDER.company}.</p></div><div class="acts"><button class="btn primary">Message customer</button></div></div>
  ${section("The order", facts([["Customer", ORDER.customer], ["Delivery", DELIVERY.name], ["Placed", ORDER.placed], ["Paid", MONEY.order]]))}
  ${section("History", '<div class="tl">' + timelineEntry("Refund note added", "8 Oct 2026, 09:34", PEOPLE.finance.name, "neutral", true) + '</div><div class="btnrow"><button class="btn sm">Show all 4 changes</button></div>')}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Money movements only",
          rationale:
            "Finance sees only the movements of money, each tied to its amount, without the operational edits around them. The lines add up top to bottom.",
          tradeoff:
            "The edits that explain the money are missing, so a corrected email before a resend reads as a gap, and there are two histories to keep true.",
          html: shell(
            ORDER.number,
            `<div class="page rd-page">
  ${trail("Home", "Orders", ORDER.number)}
  <div class="phead"><div><h1>${ORDER.number} ${badgeRaw("Paid", "positive")}</h1><p class="desc">Placed ${ORDER.placed} by ${ORDER.customer} of ${ORDER.company}.</p></div><div class="acts"><button class="btn sm">Refund</button></div></div>
  ${tabs(["Details", "Parcels", "Payment", "History"], 2)}
  ${section("Money", statement([{ label: "Charged", lines: [{ what: "Two lamps", sub: ORDER.placed + ", " + PEOPLE.customer.name, amount: MONEY.lineTotal }, { what: "Delivery fee", sub: "Set by Acme Supply", amount: "EUR 10.00" }, { what: "Cable tray", sub: "Collect at the counter", amount: "EUR 25.00" }], totalLabel: "Charged in total", total: MONEY.order }], { label: "Still with " + COMPANY.name, amount: MONEY.order }), { desc: "Only the movements of money. Nothing has been refunded." })}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Exportable trail for disputes",
          rationale:
            "The trail downloads exactly as it reads, with actor and time on every line, so Priya Shah can attach it to a dispute reply. What the screen states and what the file carries are one thing.",
          tradeoff:
            "The download freezes wording that a later correction invalidates, and the file format becomes a contract the data has to keep stable.",
          html: shell(
            ORDER.number,
            `<div class="page rd-page">
  ${trail("Home", "Orders", ORDER.number)}
  <div class="phead"><div><h1>${ORDER.number} ${badgeRaw("Paid", "positive")}</h1><p class="desc">Placed ${ORDER.placed} by ${ORDER.customer} of ${ORDER.company}.</p></div><div class="acts"><button class="btn sm">Download the trail</button><button class="btn primary">Message customer</button></div></div>
  ${section("The record", facts([["Order", ORDER.number], ["Customer", ORDER.customer], ["Delivery", DELIVERY.name], ["Paid", MONEY.order]]))}
  ${section("Trail", '<div class="tl">' + timelineEntry("Refund note added", "8 Oct 2026, 09:34", PEOPLE.finance.name, "neutral") + timelineEntry("Customer message sent", "8 Oct 2026, 09:33", PEOPLE.manager.name, "neutral") + timelineEntry("Email corrected", "8 Oct 2026, 09:33", PEOPLE.customer.name, "neutral") + timelineEntry("Order paid by card", ORDER.placed, PEOPLE.customer.name, "positive", true) + "</div>", { desc: "Newest first, with the actor on every line. The download carries the same lines.", acts: '<button class="btn xs">Download</button>' })}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Per-field history beside the facts",
          reference: "Google Sheets",
          rationale:
            "Google Sheets shows the edit history of one cell, because a dispute is usually about one value rather than the whole record. Each fact carries its own changed-by line, so the email row says Maria Garcia corrected it at 10:51 without opening a trail.",
          tradeoff:
            "Every fact doubles in height, so a long summary becomes a long read. Fields that never change carry a line saying so, which is honest but heavy.",
          html: shell(
            ORDER.number,
            `<div class="page rd-page">
  ${trail("Home", "Orders", ORDER.number)}
  <div class="phead"><div><h1>${ORDER.number} ${badgeRaw("Paid", "positive")}</h1><p class="desc">Placed ${ORDER.placed} by ${ORDER.customer} of ${ORDER.company}.</p></div><div class="acts"><button class="btn primary">Message customer</button></div></div>
  ${section(
    "The order",
    `<dl class="facts stacked">
      <div><dt>Customer</dt><dd>${ORDER.customer}<br><span class="muted" style="font-size:11.5px">Unchanged since the order was placed</span></dd></div>
      <div><dt>Email</dt><dd>${ORDER.email}<br><span class="muted" style="font-size:11.5px">Corrected by ${ORDER.customer}, 8 Oct 2026, 10:51 · <a href="#">was maria@garcia-interiors.exampl</a></span></dd></div>
      <div><dt>Delivery</dt><dd>${DELIVERY.name}<br><span class="muted" style="font-size:11.5px">Unchanged since the order was placed</span></dd></div>
      <div><dt>Paid</dt><dd>${MONEY.order}<br><span class="muted" style="font-size:11.5px">Settled by card, 8 Oct 2026, 09:34</span></dd></div>
    </dl>`,
    { desc: "What each value was, beside what it is." },
  )}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Two versions side by side",
          reference: "Wikipedia",
          rationale:
            "Wikipedia compares two revisions column to column with the changed lines marked, because a dispute names a moment and asks what changed then. The order as Maria placed it sits beside the order as it reads now, and only the email row is marked.",
          tradeoff:
            "Two columns halve the width each version gets, so long values wrap or clip on a phone. Picking the two moments to compare is also a control of its own, with its own state.",
          html: shell(
            ORDER.number,
            `<div class="page rd-page">
  ${trail("Home", "Orders", ORDER.number)}
  <div class="phead"><div><h1>${ORDER.number} ${badgeRaw("Paid", "positive")}</h1><p class="desc">Placed ${ORDER.placed} by ${ORDER.customer} of ${ORDER.company}.</p></div></div>
  ${section(
    "Placed against now",
    `<div class="inline" style="margin-bottom:10px"><span class="muted" style="font-size:11.5px">8 Oct 2026, 09:32</span><span class="muted" style="font-size:11.5px">against</span><span class="muted" style="font-size:11.5px">now</span><button class="btn xs ghost" style="margin-left:auto">Choose moments</button></div>
    <div class="rd-compare">
      <div><span class="muted" style="font-size:11px">PLACED, 09:32</span><div style="margin-top:6px" class="stack sm"><span>Email<br><span class="rd-changed">maria@garcia-interiors.exampl</span></span><span>Paid<br>EUR 0.00</span><span>Parcels<br>None packed</span></div></div>
      <div><span class="muted" style="font-size:11px">NOW</span><div style="margin-top:6px" class="stack sm"><span>Email<br><span class="rd-changed">${ORDER.email}</span></span><span>Paid<br>${MONEY.order}</span><span>Parcels<br>2 packed, both ready</span></div></div>
    </div>`,
    { desc: "One value changed since the order was placed. The marked rows are the difference." },
  )}
</div>`,
            "Orders",
          ),
        },
      ],
    },
    {
      id: "rd-notes",
      title: "Notes on a record",
      why: "Support and finance think on the record, not beside it: why the confirmation was resent, what the customer was told, what still waits. A note is <b>staff writing with a byline and a time</b>, and the reader must always know whether the customer can see it.",
      verdict:
        "Ship the notes section with the composer on top: it matches how Shopify draws order notes, the newest note reads first, and internal scope is the default that cannot leak. The runner-up is the internal-or-customer composer, which is the better choice on records where staff routinely write to the customer from the same box. Prefer resolved-notes only once note volume makes open ones hard to find. Never ship notes without a scope marker: a reader who cannot tell internal from customer-visible will eventually write the wrong one.",
      variants: [
        {
          name: "A notes section with the composer on top",
          pick: true,
          reference: "Shopify",
          rationale:
            "Shopify draws order notes as a timeline with the composer at the top, newest first. The writer sees what was already said before adding to it, and every note carries its writer and time.",
          tradeoff:
            "The composer takes the top of the section even when nobody writes, and a long note history pushes the record's own sections down the page.",
          html: shell(
            ORDER.number,
            `<div class="page rd-page">
  ${trail("Home", "Orders", ORDER.number)}
  <div class="phead"><div><h1>${ORDER.number} ${badgeRaw("Paid", "positive")}</h1><p class="desc">${ORDER.customer} · ${DELIVERY.name} · ${ORDER.placed}</p></div><div class="acts"><button class="btn primary">Message customer</button></div></div>
  ${section(
    "Notes",
    `<div class="stack">
      <div class="rd-composer"><textarea class="ta" placeholder="Write a note for the team. The customer never sees this."></textarea><div class="btnrow end"><button class="btn sm primary">Add note</button></div></div>
      <div class="rd-notes">
        ${rdNote(PEOPLE.support.name, PEOPLE.support.initials, "8 Oct 2026, 11:18", "Maria wrote that the confirmation never arrived. Her address was correct; the mail provider held the message for two hours. Resent from the order.")}
        ${rdNote(PEOPLE.finance.name, PEOPLE.finance.initials, "8 Oct 2026, 09:41", "Payment SH-88213 settled in full. Nothing outstanding on this order.")}
      </div>
    </div>`,
    { desc: "For the team only. Two notes, newest first." },
  )}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Notes mixed into the timeline",
          reference: "Zendesk",
          rationale:
            "Zendesk draws agent notes inside the order feed, because what the team wrote explains what the system did next. The resend at 11:20 reads directly under the note that caused it.",
          tradeoff:
            "Notes and system entries compete for attention in one feed, so a reader who wants only the facts has to skip the team's words. Long notes also stretch a feed meant for short lines.",
          html: shell(
            ORDER.number,
            `<div class="page rd-page">
  ${trail("Home", "Orders", ORDER.number)}
  <div class="phead"><div><h1>${ORDER.number} ${badgeRaw("Paid", "positive")}</h1><p class="desc">${ORDER.customer} · ${DELIVERY.name}</p></div><div class="acts"><button class="btn sm">Add a note</button></div></div>
  ${section(
    "What happened",
    `<div class="rd-feed">
      <div class="tl">${timelineEntry("Confirmation resent at the customer's request", "8 Oct 2026, 11:20", PEOPLE.support.name)}</div>
      <div class="rd-feed-note"><p>Maria wrote that the confirmation never arrived. Her address was correct; the mail provider held the message for two hours.</p><small>${PEOPLE.support.name} · 8 Oct 2026, 11:18 · Internal</small></div>
      <div class="tl">
        ${timelineEntry("Email corrected by the customer", "8 Oct 2026, 10:51", ORDER.customer)}
        ${timelineEntry("Paid by card", "8 Oct 2026, 09:34", COMPANY.name, "positive", true)}
      </div>
    </div>`,
  )}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Internal or customer-visible, chosen per note",
          reference: "Zendesk",
          rationale:
            "Zendesk splits its composer into internal note and public reply, because staff write both from the same record and the wrong scope is a real failure. The scope toggle sits on the composer and every note keeps its marker.",
          tradeoff:
            "Two scopes double the reading of every note, and a customer-visible note needs the message pipeline behind it rather than a plain save. The toggle is also one more control to misread in a hurry.",
          html: shell(
            ORDER.number,
            `<div class="page rd-page">
  ${trail("Home", "Orders", ORDER.number)}
  <div class="phead"><div><h1>${ORDER.number} ${badgeRaw("Paid", "positive")}</h1><p class="desc">${ORDER.customer} · ${DELIVERY.name}</p></div></div>
  ${section(
    "Notes",
    `<div class="stack">
      <div class="rd-composer">
        <div>${segmented(["Internal note", "Message to the customer"], 0)}</div>
        <textarea class="ta" placeholder="Write for the team."></textarea>
        <div class="btnrow end"><button class="btn sm primary">Add note</button></div>
      </div>
      <div class="rd-notes">
        ${rdNote(PEOPLE.support.name, PEOPLE.support.initials, "8 Oct 2026, 11:25", "Your confirmation is on its way again. It was held by your mail provider for two hours.", { scope: "Customer can see", customer: true })}
        ${rdNote(PEOPLE.support.name, PEOPLE.support.initials, "8 Oct 2026, 11:18", "Address was correct; the mail provider held the message. Resent from the order.")}
      </div>
    </div>`,
  )}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Resolved notes collapse away",
          reference: "Google Docs",
          rationale:
            "Google Docs resolves a comment thread once its question is answered, because an open list grows until nobody reads it. The collection question resolves once the resend lands, leaving only what still waits.",
          tradeoff:
            "Resolving hides the reasoning a later dispute may need, so the resolved list has to stay one click away and stay readable. Somebody also has to do the resolving, which is a habit to build.",
          html: shell(
            ORDER.number,
            `<div class="page rd-page">
  ${trail("Home", "Orders", ORDER.number)}
  <div class="phead"><div><h1>${ORDER.number} ${badgeRaw("Paid", "positive")}</h1><p class="desc">${ORDER.customer} · ${DELIVERY.name}</p></div></div>
  ${section(
    "Notes",
    `<div class="rd-notes">
      ${rdNote(PEOPLE.manager.name, PEOPLE.manager.initials, "8 Oct 2026, 12:02", "Cable tray is reserved. Keep one aside at the counter until closing; Maria collects before 17:30.")}
    </div>
    <div class="btnrow" style="margin-top:10px"><button class="btn sm ghost">1 resolved note</button></div>
    <div class="rd-notes" style="margin-top:4px;opacity:.75">
      ${rdNote(PEOPLE.support.name, PEOPLE.support.initials, "8 Oct 2026, 11:18", "Mail provider held the message for two hours. Resent from the order.", { scope: "Resolved", foot: false })}
    </div>`,
    { acts: '<button class="btn xs">Add a note</button>' },
  )}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Notes in the aside",
          reference: "Linear",
          rationale:
            "Linear keeps comments in the issue's main column and properties in the rail; this option reverses it for records whose facts are the work. Notes sit beside the order so they never push the money down, and the composer stays one line until it opens.",
          tradeoff:
            "A 260 px column is narrow for a paragraph, so notes wrap early and long threads scroll inside a short box. Notes also lose the prominence they need on a support-heavy record.",
          html: shell(
            ORDER.number,
            `<div class="page rd-page">
  ${trail("Home", "Orders", ORDER.number)}
  <div class="phead"><div><h1>${ORDER.number} ${badgeRaw("Paid", "positive")}</h1><p class="desc">${ORDER.customer} · ${DELIVERY.name} · ${ORDER.placed}</p></div><div class="acts"><button class="btn primary">Message customer</button></div></div>
  <div class="rd-grid">
    <div class="stack">
      ${section("The customer", facts([["Name", ORDER.customer], ["Email", ORDER.email]]))}
      ${section("What was bought", BOUGHT)}
    </div>
    <div class="stack">${section("Notes", `<div class="rd-notes">${rdNote(PEOPLE.support.name, PEOPLE.support.initials, "8 Oct, 11:18", "Mail provider held the message. Resent from the order.", { foot: false })}${rdNote(PEOPLE.manager.name, PEOPLE.manager.initials, "8 Oct, 12:02", "Keep a cable tray aside at the counter.", { foot: false })}</div>`, { acts: '<button class="btn xs">Add</button>' })}</div>
  </div>
</div>`,
            "Orders",
          ),
        },
        {
          name: "No notes yet",
          reference: "Notion",
          rationale:
            "Notion draws an empty discussion as an invitation rather than a blank box, because a record nobody has annotated is the common case. The empty state says what notes are for and offers the first one.",
          tradeoff:
            "An empty section takes vertical space on every quiet record to say there is nothing to read. Hiding the section until the first note would save the space but hide the capability.",
          html: shell(
            ORDER.number,
            `<div class="page rd-page">
  ${trail("Home", "Orders", ORDER.number)}
  <div class="phead"><div><h1>${ORDER.number} ${badgeRaw("Paid", "positive")}</h1><p class="desc">${ORDER.customer} · ${DELIVERY.name} · ${ORDER.placed}</p></div><div class="acts"><button class="btn primary">Message customer</button></div></div>
  ${section("The customer", facts([["Name", ORDER.customer], ["Email", ORDER.email]]))}
  ${section("Notes", emptyState("No notes on this order", "Notes are for the team. Write why something was done so the next person who opens this order knows.", '<button class="btn sm">Write the first note</button>', "✎"))}
</div>`,
            "Orders",
          ),
        },
      ],
    },
    {
      id: "rd-attachments",
      title: "Attachments on a record",
      why: "A dispute needs its evidence, a delivery needs its packing list, a product needs its photos. An attachment is <b>a file the company put on the record, with who added it and when</b>, and the reader must know what each file is before opening it.",
      verdict:
        "Ship the file list with a drop zone: each row names the file, its kind, who added it and its size, and the drop zone invites the next one. The runner-up is the evidence-grouped option, which is the better choice on a dispute, where the bank asks for kinds rather than files. Prefer thumbnails only where images dominate, such as product photos. Never ship the drop-zone-only section: a record whose files hide behind an upload control reads as empty.",
      variants: [
        {
          name: "A file list with a drop zone",
          pick: true,
          reference: "Linear",
          rationale:
            "Linear draws issue attachments as rows with a drop zone beneath, because the list answers what is here and the zone answers how to add. Each row carries the file kind, who added it, when, and the size.",
          tradeoff:
            "Rows give every file equal weight, so a ten-file record reads long. Large files also need an upload state per row, which this option does not draw.",
          html: shell(
            "Dispute D-0182",
            `<div class="page rd-page">
  ${trail("Home", "Invoices", "Disputes", "D-0182")}
  <div class="phead"><div><h1>Dispute D-0182 ${badgeRaw("Disputed", "destructive")}</h1><p class="desc">${MONEY.lamp} on order SO-1019. The card issuer opened a case on 2 Oct 2026.</p></div><div class="acts"><button class="btn primary">Answer the bank</button></div></div>
  ${section(
    "Files",
    `<div class="stack">
      <div class="rd-files">
        ${rdFile("PDF", "sale-terms-march-2026.pdf", `Added by ${PEOPLE.finance.name} · 3 Oct 2026, 11:05`, "182 KB", { actions: '<button class="btn xs">Open</button>' })}
        ${rdFile("PDF", "order-SO-1019-receipt.pdf", `Added by ${COMPANY.name} · 28 Sep 2026, 19:03`, "96 KB", { actions: '<button class="btn xs">Open</button>' })}
        ${rdFile("PNG", "dispatch-scan-log-14-mar.png", `Added by ${PEOPLE.warehouse.name} · 3 Oct 2026, 10:12`, "1.4 MB", { img: true, actions: '<button class="btn xs">Open</button>' })}
      </div>
      ${dropZone("Add a file", "PDF, PNG or JPG. At most 10 MB.")}
    </div>`,
    { desc: "What the bank sees if this file set is sent with the answer." },
  )}
</div>`,
            "Invoices",
          ),
        },
        {
          name: "Compact rows for many files",
          reference: "GitHub",
          rationale:
            "GitHub lists release assets as compact rows, because a record with a dozen files has to stay scannable. Name, size and a download action fit one line each; who added it moves to the file's own page.",
          tradeoff:
            "Who and when leave the row, so the reader cannot tell a fresh upload from a stale one without opening it. Compact rows also hide the file kind behind the name alone.",
          html: shell(
            PRODUCT.name,
            `<div class="page rd-page">
  ${trail("Home", "Products", PRODUCT.name)}
  <div class="phead"><div><h1>${PRODUCT.name} ${badgeRaw("Active", "positive")}</h1><p class="desc">Photos and the print file for this product.</p></div></div>
  ${section(
    "Photos",
    `<div class="rd-files">
      ${rdFile("JPG", "lamp-front-1080x1350.jpg", "1080 × 1350", "2.1 MB", { img: true, actions: '<button class="btn xs">Use</button>' })}
      ${rdFile("JPG", "lamp-side-1920x640.jpg", "1920 × 640", "1.8 MB", { img: true, actions: '<button class="btn xs">Use</button>' })}
      ${rdFile("PNG", "lamp-box-1200x300.png", "1200 × 300", "214 KB", { img: true, actions: '<button class="btn xs">Use</button>' })}
      ${rdFile("PDF", "print-catalogue-a2.pdf", "A2, print ready", "8.6 MB", { actions: '<button class="btn xs">Use</button>' })}
    </div>`,
    { acts: '<button class="btn xs">Add a file</button>', desc: "The online store uses the front photo; the print file is for the catalogue." },
  )}
</div>`,
            "Products",
          ),
        },
        {
          name: "Evidence grouped by what it proves",
          reference: "Stripe",
          rationale:
            "Stripe asks for dispute evidence by category, because the bank checks kinds rather than files: the receipt, the terms, the proof of fulfilment. Each group says whether it is filled, so Priya Shah sees what is still missing before she answers.",
          tradeoff:
            "The categories belong to card disputes, so the shape fits nothing else without renaming. A file that proves two things also has to sit in two groups or one group has to stay empty.",
          html: shell(
            "Dispute D-0182",
            `<div class="page rd-page">
  ${trail("Home", "Invoices", "Disputes", "D-0182")}
  <div class="phead"><div><h1>Dispute D-0182 ${badgeRaw("Disputed", "destructive")}</h1><p class="desc">${MONEY.lamp} on order SO-1019.</p></div><div class="acts"><button class="btn primary">Answer the bank</button></div></div>
  ${section(
    "Evidence",
    `<div class="stack">
      ${["Receipt|order-SO-1019-receipt.pdf|Added by Acme Supply · 28 Sep 2026", "Terms|sale-terms-march-2026.pdf|Added by Priya Shah · 3 Oct 2026"].map((g) => { const [lab, file, meta] = g.split("|"); return `<div><div style="font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:var(--muted-foreground);margin-bottom:4px">${lab}</div><div class="rd-files">${rdFile("PDF", file, meta, "120 KB", { actions: '<button class="btn xs">Open</button>' })}</div></div>`; }).join("")}
      <div><div style="font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:var(--muted-foreground);margin-bottom:4px">Proof the customer collected</div>${dropZone("Add proof of collection", "A dispatch scan export or a signed receipt.")}</div>
    </div>`,
    { desc: "Two of three groups are filled. The bank decides on 21 Oct." },
  )}
</div>`,
            "Invoices",
          ),
        },
        {
          name: "The drop zone is the section",
          reference: "Dropbox",
          rationale:
            "Dropbox draws an empty folder as one large drop target, because adding is the only job and the target should be unmissable. The section states what belongs here and takes the file anywhere it lands.",
          tradeoff:
            "Once files exist the large zone wastes the space the list wants, so the shape has to change after the first upload. It also says nothing about what is already there.",
          html: shell(
            "Brass desk lamp",
            `<div class="page rd-page">
  ${trail("Home", "Products", "Brass desk lamp")}
  <div class="phead"><div><h1>Brass desk lamp ${badgeRaw("Active", "positive")}</h1><p class="desc">Brushed brass with a linen shade.</p></div></div>
  ${section("Photos", dropZone("Drop the photos here, or choose a file", "JPG or PNG, 1920 px wide or more. The online store shows it beside the price."), { desc: "This product has no photos yet. The online store shows the category photo until it does." })}
</div>`,
            "Products",
          ),
        },
        {
          name: "Images as thumbnails, documents as rows",
          reference: "Zendesk",
          rationale:
            "Zendesk draws attached images as thumbnails and documents as rows, because a reader checks a photo by looking and a contract by opening. The thumbnails answer at a glance; the rows answer on click.",
          tradeoff:
            "Two shapes in one section, so the section needs a rule for what is an image and what is not. Thumbnails also cost a render per file that rows never pay.",
          html: shell(
            DELIVERY.name,
            `<div class="page rd-page">
  ${trail("Home", "Orders", DELIVERY.name)}
  <div class="phead"><div><h1>${DELIVERY.name} ${badgeRaw("Scheduled", "info")}</h1><p class="desc">${DELIVERY.date}, ${DELIVERY.window} · ${DELIVERY.place}</p></div></div>
  ${section(
    "Files",
    `<div class="stack">
      <div class="inline">${["dock", "load", "seal"].map((n) => `<span style="width:96px"><span style="display:grid;place-items:center;aspect-ratio:4/3;border-radius:var(--radius-sm);background:var(--info-surface);color:var(--info-surface-foreground);font-size:20px">◈</span><small class="muted" style="font-size:11px;display:block;margin-top:4px">${n}.jpg</small></span>`).join("")}</div>
      <div class="rd-files">
        ${rdFile("PDF", "supplier-contract-oak-2026.pdf", `Added by ${PEOPLE.owner.name} · 12 Dec 2025`, "1.1 MB", { actions: '<button class="btn xs">Open</button>' })}
        ${rdFile("PDF", "safety-certificate-lamps.pdf", `Added by ${PEOPLE.manager.name} · 19 Jan 2026`, "640 KB", { actions: '<button class="btn xs">Open</button>' })}
      </div>
    </div>`,
    { acts: '<button class="btn xs">Add a file</button>' },
  )}
</div>`,
            "Orders",
          ),
        },
        {
          name: "No files, and what belongs here",
          reference: "Figma",
          rationale:
            "Figma tells an empty project what to put in it, because an empty box without guidance reads as a fault. The section names the kinds that belong on a dispute and offers the upload in the same breath.",
          tradeoff:
            "Guidance text per record type is content to write and keep true. A generic empty state would fit everywhere and help nowhere, which is the worse trade.",
          html: shell(
            "Dispute D-0182",
            `<div class="page rd-page">
  ${trail("Home", "Invoices", "Disputes", "D-0182")}
  <div class="phead"><div><h1>Dispute D-0182 ${badgeRaw("Disputed", "destructive")}</h1><p class="desc">${MONEY.lamp} on order SO-1019.</p></div><div class="acts"><button class="btn primary">Answer the bank</button></div></div>
  ${section("Evidence", emptyState("No evidence attached", "The bank wants the receipt, the terms the customer agreed to, and proof the order shipped as sold. Attach all three before answering.", '<button class="btn sm">Attach the first file</button>', "▤"))}
</div>`,
            "Invoices",
          ),
        },
      ],
    },
    {
      id: "rd-props",
      title: "A property list with copy",
      why: "Support reads a reference out on the phone and pastes an identifier into a dispute. A property list is <b>labelled values where the identifiers copy with one click</b>, and the reader must know the copy landed.",
      verdict:
        "Ship the always-visible copy button per identifier: it matches how Stripe draws charge details, and support reaches for it without hunting. The runner-up is the in-place confirmation option, which is the better choice once miscopied references cause real mistakes. Prefer hover-only copy nowhere: touch screens have no hover and the button would never appear. Never ship a property list whose long values clip without a way to expand them.",
      compact: {
        option: "Stacked on a phone",
        behaviour: "Below the sm breakpoint each row stacks: the label above its value, the copy button beside the value.",
      },
      variants: [
        {
          name: "Every identifier copies",
          pick: true,
          reference: "Stripe",
          rationale:
            "Stripe puts a copy button beside every identifier on a charge, because support quotes references all day. Order number, payment reference, customer email and parcel codes each copy with one click; human facts stay plain.",
          tradeoff:
            "A button per row is noise on records nobody quotes, and each button needs its copied confirmation to be honest. The list also grows long once every identifier claims a row.",
          html: shell(
            ORDER.number,
            `<div class="page rd-page">
  ${trail("Home", "Orders", ORDER.number)}
  <div class="phead"><div><h1>${ORDER.number} ${badgeRaw("Paid", "positive")}</h1><p class="desc">${ORDER.customer} · ${DELIVERY.name} · ${ORDER.placed}</p></div><div class="acts"><button class="btn primary">Message customer</button></div></div>
  ${section(
    "Identifiers",
    `<dl class="rd-kv">
      <div><dt>Order</dt><dd><span class="code">${ORDER.number}</span></dd><dd><button class="btn xs">Copy</button></dd></div>
      <div><dt>Payment</dt><dd><span class="code">SH-88213</span></dd><dd><button class="btn xs">Copy</button></dd></div>
      <div><dt>Customer email</dt><dd>${ORDER.email}</dd><dd><button class="btn xs">Copy</button></dd></div>
      <div><dt>Parcel 1</dt><dd><span class="code">PC-0C893968A2</span></dd><dd><button class="btn xs">Copy</button></dd></div>
      <div><dt>Parcel 2</dt><dd><span class="code">PC-0C893968A3</span></dd><dd><button class="btn xs">Copy</button></dd></div>
    </dl>`,
    { desc: "What support quotes. The customer reads none of this." },
  )}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Copy appears on hover only",
          reference: "GitHub",
          rationale:
            "GitHub shows the copy button on a file path only on hover, because a quiet row reads better and the control appears where the pointer already is. The list stays a clean two columns until the reader reaches for a value.",
          tradeoff:
            "Touch screens have no hover, so on a phone the button never appears and the pattern fails where warehouse staff work. Keyboard readers also have to tab into a row to find a control they cannot see.",
          html: shell(
            ORDER.number,
            `<div class="page rd-page">
  ${trail("Home", "Orders", ORDER.number)}
  <div class="phead"><div><h1>${ORDER.number} ${badgeRaw("Paid", "positive")}</h1><p class="desc">${ORDER.customer} · ${DELIVERY.name}</p></div></div>
  ${section(
    "Identifiers",
    `<dl class="rd-kv">
      <div><dt>Order</dt><dd><span class="code">${ORDER.number}</span></dd><dd><button class="btn xs">Copy</button></dd></div>
      <div><dt>Payment</dt><dd><span class="code">SH-88213</span></dd><dd></dd></div>
      <div><dt>Customer email</dt><dd>${ORDER.email}</dd><dd></dd></div>
      <div><dt>Parcel 1</dt><dd><span class="code">PC-0C893968A2</span></dd><dd></dd></div>
    </dl>`,
    { desc: "The pointer rests on the order row, so only that row offers Copy." },
  )}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Identifiers grouped in one card",
          reference: "Vercel",
          rationale:
            "Vercel groups a deployment's identifiers in one card apart from its facts, because identifiers are quoted together: the id, the reference and the address leave in one message. One card holds all three with their copy buttons.",
          tradeoff:
            "The identifiers leave the facts they belong to, so the reader jumps between the summary and the card to connect a value with its meaning. A second card is also a second heading for the same record.",
          html: shell(
            ORDER.number,
            `<div class="page rd-page">
  ${trail("Home", "Orders", ORDER.number)}
  <div class="phead"><div><h1>${ORDER.number} ${badgeRaw("Paid", "positive")}</h1><p class="desc">${ORDER.customer} · ${DELIVERY.name} · ${ORDER.placed}</p></div><div class="acts"><button class="btn primary">Message customer</button></div></div>
  ${section("The order", facts([["Customer", ORDER.customer], ["Delivery", DELIVERY.name], ["Placed", ORDER.placed], ["Paid", MONEY.order]]))}
  ${section(
    "Quote these",
    `<div class="stack sm">
      <div class="split"><span class="muted">Order</span><span class="fig">${copyValue("order number", ORDER.number)}</span></div>
      <div class="split"><span class="muted">Payment</span><span class="fig">${copyValue("payment reference", "SH-88213")}</span></div>
      <div class="split"><span class="muted">Email</span><span class="fig">${copyValue("email", ORDER.email)}</span></div>
    </div>`,
    { desc: "Copied as written, with no surrounding prose." },
  )}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Copied confirmation in place",
          reference: "Railway",
          rationale:
            "Railway confirms a copy inside the row that was copied, because a toast at the edge of the screen is easy to miss while reading a reference aloud. The button turns into a check beside the value for two seconds.",
          tradeoff:
            "The row changes shape for two seconds, which shifts the rows below it unless the confirmation holds the button's width. It also confirms only the click, not that the paste landed where it should.",
          html: shell(
            ORDER.number,
            `<div class="page rd-page">
  ${trail("Home", "Orders", ORDER.number)}
  <div class="phead"><div><h1>${ORDER.number} ${badgeRaw("Paid", "positive")}</h1><p class="desc">${ORDER.customer} · ${DELIVERY.name}</p></div></div>
  ${section(
    "Identifiers",
    `<dl class="rd-kv">
      <div><dt>Order</dt><dd><span class="code">${ORDER.number}</span></dd><dd><span style="color:var(--positive-surface-foreground);font-size:12px;white-space:nowrap">✓ Copied</span></dd></div>
      <div><dt>Payment</dt><dd><span class="code">SH-88213</span></dd><dd><button class="btn xs">Copy</button></dd></div>
      <div><dt>Customer email</dt><dd>${ORDER.email}</dd><dd><button class="btn xs">Copy</button></dd></div>
    </dl>`,
  )}
  ${toast("positive", "Order number copied.", { close: false })}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Long values truncate with expand",
          reference: "Sentry",
          rationale:
            "Sentry truncates long identifiers to one line with an expander, because a receipt URL or a full address would otherwise push the copy button off the row. The row stays one line; the full value opens on demand and still copies whole.",
          tradeoff:
            "A truncated value cannot be checked by eye until it expands, so a reader comparing two long codes opens both. The expander is also one more control per long row.",
          html: shell(
            ORDER.number,
            `<div class="page rd-page">
  ${trail("Home", "Orders", ORDER.number)}
  <div class="phead"><div><h1>${ORDER.number} ${badgeRaw("Paid", "positive")}</h1><p class="desc">${ORDER.customer} · ${DELIVERY.name}</p></div></div>
  ${section(
    "Identifiers",
    `<dl class="rd-kv">
      <div><dt>Order</dt><dd><span class="code">${ORDER.number}</span></dd><dd><button class="btn xs">Copy</button></dd></div>
      <div><dt>Receipt URL</dt><dd><span class="rd-trunc">https://acme-supply.example/receipts/SO-1042/9f2c41aa-sh-88213</span></dd><dd><span class="btnrow"><button class="btn xs ghost">Show</button><button class="btn xs">Copy</button></span></dd></div>
      <div><dt>Address</dt><dd><span class="rd-trunc">Canal Street 12, 1011 AB Amsterdam, Netherlands</span></dd><dd><span class="btnrow"><button class="btn xs ghost">Show</button><button class="btn xs">Copy</button></span></dd></div>
    </dl>`,
    { desc: "Copy takes the whole value, not the shortened line." },
  )}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Stacked on a phone",
          width: "phone",
          reference: "Shopify Polaris",
          rationale:
            "Polaris stacks a description list on narrow screens, because three columns cannot fit 390 px. The label sits above its value and the copy button stays beside the value, so the thumb reaches it without scrolling sideways.",
          tradeoff:
            "A five-row list becomes five blocks, so the section doubles in height on the smallest screen. Labels above values also read slower than labels beside them.",
          html: shell(
            ORDER.number,
            `<div class="page rd-page">
  ${trail("Home", "Orders", ORDER.number)}
  <div class="phead"><div><h1>${ORDER.number} ${badgeRaw("Paid", "positive")}</h1></div></div>
  ${section(
    "Identifiers",
    `<dl class="rd-kv">
      <div><dt>Order</dt><dd><span class="code">${ORDER.number}</span></dd><dd><button class="btn xs">Copy</button></dd></div>
      <div><dt>Payment</dt><dd><span class="code">SH-88213</span></dd><dd><button class="btn xs">Copy</button></dd></div>
      <div><dt>Customer email</dt><dd>${ORDER.email}</dd><dd><button class="btn xs">Copy</button></dd></div>
    </dl>`,
  )}
</div>`,
            "Orders",
          ),
        },
      ],
    },
    {
      id: "rd-phone-header",
      title: "The record header on a phone",
      why: "Warehouse staff read records on a phone at the dock, 390 px wide, one hand free. The header must state <b>which record, what state, and the one step that matters</b> without scrolling sideways or hiding the title.",
      verdict:
        "Ship the stacked title with a full-width primary and the rest in a menu: it keeps the desktop order, title then actions, and the primary stays reachable by thumb. The runner-up is the sticky foot bar, which is the better choice on records where the step is taken mid-scroll, such as scanning at the dock. Prefer the scrolling action row only where every action is equally likely. Never ship actions that need sideways scrolling to be discovered: a hidden Refund at the dock is a queue that stops moving.",
      compact: {
        option: "Stacked title, full-width primary, the rest in a menu",
        behaviour: "This item is the compact behaviour: title and state first, a full-width primary under them, rarer commands in a menu.",
      },
      variants: [
        {
          name: "Stacked title, full-width primary, the rest in a menu",
          width: "phone",
          pick: true,
          reference: "shadcn",
          rationale:
            "shadcn dashboard pages stack the header actions under the title below the sm breakpoint, with the primary first and full width. The title and state read first; the thumb finds one large button; rarer commands wait behind the menu.",
          tradeoff:
            "The header grows tall on the smallest screen, so the content starts lower. Secondary commands also hide behind a tap that a hurried reader may not try.",
          html: shell(
            ORDER.number,
            `<div class="page rd-page">
  ${trail("Home", "Orders", ORDER.number)}
  <div class="phead">
    <div><h1>${ORDER.number} ${badgeRaw("Paid", "positive")}</h1><p class="desc">${ORDER.customer} · ${DELIVERY.name}</p></div>
    <div class="acts"><button class="btn primary w-full">Message customer</button><span class="btnrow" style="width:100%"><button class="btn sm" style="flex:1">Resend the confirmation</button><button class="btn sm" style="flex:1">Refund</button></span></div>
  </div>
  ${section("The customer", facts([["Name", ORDER.customer], ["Email", ORDER.email]], { stacked: true }))}
</div>`,
            "Orders",
          ),
        },
        {
          name: "A sticky action bar at the foot",
          width: "phone",
          reference: "Shopify",
          rationale:
            "Shopify pins the order actions to the foot of a phone screen, because the thumb is already there and the step stays reachable mid-scroll. Message and Resend stay pinned while the facts scroll above them.",
          tradeoff:
            "The bar covers content at the foot of every scroll position, so the last section needs padding it would not otherwise need. It also pins two actions that may not be the two this record needs.",
          html: shell(
            ORDER.number,
            `<div class="page rd-page">
  ${trail("Home", "Orders", ORDER.number)}
  <div class="phead"><div><h1>${ORDER.number} ${badgeRaw("Paid", "positive")}</h1><p class="desc">${ORDER.customer} · ${DELIVERY.name}</p></div></div>
  ${section("The customer", facts([["Name", ORDER.customer], ["Email", ORDER.email]], { stacked: true }))}
  ${section("What was bought", BOUGHT)}
  <div class="rd-stickybar"><button class="btn sm">Resend the confirmation</button><button class="btn sm primary">Message customer</button></div>
</div>`,
            "Orders",
          ),
        },
        {
          name: "Back chevron and state in the bar",
          width: "phone",
          reference: "iOS",
          rationale:
            "iOS puts the way back in the navigation bar, because a phone reader arrives from a list and returns to it. The bar carries the chevron and the order number; the page opens straight into the state and the summary.",
          tradeoff:
            "The bar is shared chrome, so a record-specific bar is a second bar to keep true. The breadcrumb also leaves the page, which breaks the trail contract every other page keeps.",
          html: shell(
            ORDER.number,
            `<div class="page rd-page">
  <div class="inline" style="margin-bottom:10px"><button class="btn sm icon" aria-label="Back to orders">‹</button><b style="font-size:13px">Orders</b><span style="margin-left:auto">${badgeRaw("Paid", "positive")}</span></div>
  <div class="phead"><div><h1>${ORDER.number}</h1><p class="desc">${ORDER.customer} · ${DELIVERY.name} · ${ORDER.placed}</p></div><div class="acts"><button class="btn primary w-full">Message customer</button></div></div>
  ${section("What was bought", BOUGHT)}
</div>`,
            "Orders",
          ),
        },
        {
          name: "The description folds behind the title",
          width: "phone",
          reference: "GitHub",
          rationale:
            "GitHub mobile folds long issue context behind the title, because the title and state are the wayfinding and the rest is detail. One tap opens customer, delivery and placed; until then the header is two lines.",
          tradeoff:
            "The delivery name hides behind a tap on exactly the record type where which-delivery is the most-asked question. A folded header also looks unfinished to a reader who never unfolds it.",
          html: shell(
            ORDER.number,
            `<div class="page rd-page">
  ${trail("Home", "Orders", ORDER.number)}
  <div class="phead"><div><h1>${ORDER.number} ${badgeRaw("Paid", "positive")}</h1><button class="btn xs ghost">Show customer and delivery ▾</button></div><div class="acts"><button class="btn primary w-full">Message customer</button></div></div>
  ${section("The customer", facts([["Name", ORDER.customer], ["Email", ORDER.email]], { stacked: true }))}
</div>`,
            "Orders",
          ),
        },
        {
          name: "One scrolling row of actions",
          width: "phone",
          reference: "Material Design",
          rationale:
            "Material design scrolls a row of action chips under the title, because every action stays visible as a word rather than hiding in a menu. Message, Resend, Refund and Export all fit one swipeable row.",
          tradeoff:
            "A sideways scroll inside a vertical page hides anything past the edge until swiped. Equal chips also give the destructive action the same weight as a harmless one.",
          html: shell(
            ORDER.number,
            `<div class="page rd-page">
  ${trail("Home", "Orders", ORDER.number)}
  <div class="phead"><div><h1>${ORDER.number} ${badgeRaw("Paid", "positive")}</h1><p class="desc">${ORDER.customer} · ${DELIVERY.name}</p></div></div>
  <div style="display:flex;gap:8px;overflow-x:auto;padding-bottom:10px;margin-bottom:6px"><button class="btn sm primary" style="flex:none">Message customer</button><button class="btn sm" style="flex:none">Resend the confirmation</button><button class="btn sm" style="flex:none">Refund</button><button class="btn sm" style="flex:none">Export</button></div>
  ${section("The customer", facts([["Name", ORDER.customer], ["Email", ORDER.email]], { stacked: true }))}
</div>`,
            "Orders",
          ),
        },
        {
          name: "No actions in the header at all",
          width: "phone",
          reference: "GOV.UK",
          rationale:
            "GOV.UK keeps small screens to one purpose per page, so commands live in the sections they belong to rather than crowding the header. The header states the record; Resend sits with the parcels and Refund sits with the money.",
          tradeoff:
            "The most-used command is a scroll away instead of a tap away, and a reader who learned the desktop header finds nothing where the buttons were. Every section also needs its own command row.",
          html: shell(
            ORDER.number,
            `<div class="page rd-page">
  ${trail("Home", "Orders", ORDER.number)}
  <div class="phead"><div><h1>${ORDER.number} ${badgeRaw("Paid", "positive")}</h1><p class="desc">${ORDER.customer} · ${DELIVERY.name} · ${ORDER.placed}</p></div></div>
  ${section("Parcels", `<div class="rlist">${recordRow({ title: "Oak desk lamp", sub: "one per parcel · PC-0C893968A2", state: { label: "Packed", tone: "neutral" } })}${recordRow({ title: "Oak desk lamp", sub: "one per parcel · PC-0C893968A3", state: { label: "Packed", tone: "neutral" } })}</div>`, { acts: '<button class="btn xs">Resend the confirmation</button>' })}
  ${section("Money", `<div class="stmt"><div class="line"><span>Paid by card<span class="sub">${ORDER.placed}</span></span><span class="fig">${MONEY.order}</span></div><div class="grand"><span>Refunded</span><span class="fig">EUR 0.00</span></div></div>`, { acts: '<button class="btn xs">Refund</button>' })}
</div>`,
            "Orders",
          ),
        },
      ],
    },
    {
      id: "rd-prevnext",
      title: "Moving between records",
      why: "Support works a queue, not a record: the next order in the list, the next dispute waiting for an answer. Moving on must be <b>one step that keeps the list order</b>, so the reader never returns to the list just to open its neighbour.",
      verdict:
        "Ship the chevrons beside the breadcrumb: they match how Gmail moves between messages, they keep the list order, and they cost almost no space. The runner-up is the jump-by-search option, which is the better choice once the reader knows the next record's number rather than its neighbour. Prefer the list drawer on triage queues where the reader skims many records. Never ship movement without a position: chevrons that never say 4 of 268 leave the reader lost in the queue.",
      variants: [
        {
          name: "Chevrons beside the breadcrumb",
          pick: true,
          reference: "Gmail",
          rationale:
            "Gmail puts newer and older arrows above a message, because triage is neighbour to neighbour and the list order is the queue. The position reads between the chevrons, so the reader knows where they are.",
          tradeoff:
            "Chevrons move one step at a time, so jumping ten records ahead is ten clicks. They also need the list order behind them, which fails when the record was opened from a search.",
          html: shell(
            ORDER.number,
            `<div class="page rd-page">
  <div class="inline" style="margin-bottom:7px;flex-wrap:nowrap"><span class="grow">${trail("Home", "Orders", ORDER.number)}</span><span class="rd-prevnext"><button class="btn sm icon" aria-label="Previous order">‹</button><span class="rd-pos">4 of 268</span><button class="btn sm icon" aria-label="Next order">›</button></span></div>
  <div class="phead"><div><h1>${ORDER.number} ${badgeRaw("Paid", "positive")}</h1><p class="desc">${ORDER.customer} · ${DELIVERY.name} · ${ORDER.placed}</p></div><div class="acts"><button class="btn primary">Message customer</button></div></div>
  ${section("The customer", facts([["Name", ORDER.customer], ["Email", ORDER.email]]))}
  ${section("What was bought", BOUGHT)}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Chevrons in the header with keyboard hints",
          reference: "Gmail",
          rationale:
            "Gmail teaches j and k beside its arrows, because a triage reader moves faster without the pointer. The header holds previous and next with their keys, and the position reads beside them.",
          tradeoff:
            "Keyboard hints help nobody on a phone, where warehouse staff do this work. The header also gains two buttons that compete with the record's own commands.",
          html: shell(
            ORDER.number,
            `<div class="page rd-page">
  ${trail("Home", "Orders", ORDER.number)}
  <div class="phead">
    <div><h1>${ORDER.number} ${badgeRaw("Paid", "positive")}</h1><p class="desc">${ORDER.customer} · ${DELIVERY.name} · ${ORDER.placed}</p></div>
    <div class="acts"><span class="rd-prevnext"><button class="btn sm icon" aria-label="Previous order (j)">‹</button><span class="rd-pos">4 of 268</span><button class="btn sm icon" aria-label="Next order (k)">›</button></span><button class="btn primary">Message customer</button></div>
  </div>
  ${section("What was bought", BOUGHT)}
  <p class="note tight" style="margin-top:10px">Press j for the previous order, k for the next. The list order decides what previous means.</p>
</div>`,
            "Orders",
          ),
        },
        {
          name: "Back to the list, then in again",
          reference: "Shopify Polaris",
          rationale:
            "Polaris moves between products through the list, because the list holds the search and the filters that define the queue. The record carries one way back; the next record opens from the list with its context intact.",
          tradeoff:
            "Two steps per record instead of one, and the list has to hold its scroll and filters across the round trip or the reader loses their place. Triage of fifty orders becomes a hundred navigations.",
          html: shell(
            ORDER.number,
            `<div class="page rd-page">
  <div class="inline" style="margin-bottom:7px"><a href="#" style="font-size:12px;text-decoration:none">‹ Back to orders</a><span class="muted" style="font-size:11.5px">Paid · newest first</span></div>
  <div class="phead"><div><h1>${ORDER.number} ${badgeRaw("Paid", "positive")}</h1><p class="desc">${ORDER.customer} · ${DELIVERY.name} · ${ORDER.placed}</p></div><div class="acts"><button class="btn primary">Message customer</button></div></div>
  ${section("The customer", facts([["Name", ORDER.customer], ["Email", ORDER.email]]))}
  ${section("What was bought", BOUGHT)}
</div>`,
            "Orders",
          ),
        },
        {
          name: "A list drawer beside the record",
          reference: "Intercom",
          rationale:
            "Intercom draws the queue beside the conversation, because triage reads the list and the record together. The drawer lists the queue's orders with their state and money; the record reads to its right.",
          tradeoff:
            "The drawer takes a third of the width at desktop and the whole width on a phone, where it has to become a sheet. It also duplicates the orders list page, so two lists of orders have to stay true.",
          html: shell(
            ORDER.number,
            `<div class="page rd-page">
  ${trail("Home", "Orders", ORDER.number)}
  <div style="display:grid;grid-template-columns:250px minmax(0,1fr);gap:16px;align-items:start">
    <div class="stack">
      ${section("Queue", `<div class="rlist">${recordRow({ title: "SO-1031", sub: `${PEOPLE.otherCustomer.name} · EUR 40.45`, state: { label: "Awaiting", tone: "caution" } })}${recordRow({ title: ORDER.number, sub: `${ORDER.customer} · ${MONEY.order}`, state: { label: "Paid", tone: "positive" } })}${recordRow({ title: "SO-1033", sub: `${ORDER.customer} · EUR 45.00`, state: { label: "Paid", tone: "positive" } })}${recordRow({ title: "SO-1029", sub: `${ORDER.customer} · EUR 45.00`, state: { label: "Paid", tone: "positive" } })}</div>`, { desc: "Paid and awaiting, newest first. 4 of 268." })}
    </div>
    <div class="stack">
      <div class="phead"><div><h1>${ORDER.number} ${badgeRaw("Paid", "positive")}</h1><p class="desc">${ORDER.customer} · ${DELIVERY.name}</p></div><div class="acts"><button class="btn primary sm">Message customer</button></div></div>
      ${section("What was bought", BOUGHT)}
    </div>
  </div>
</div>`,
            "Orders",
          ),
        },
        {
          name: "Jump to a record by searching",
          reference: "Linear",
          rationale:
            "Linear jumps to any issue from its command menu, because a reader who knows the number should not walk the queue to reach it. The order number, customer name or email lands on the record in one step.",
          tradeoff:
            "Search answers only the record the reader already knows, so it never helps triage an unknown queue. It also needs the menu everywhere, which is a frame behaviour rather than a record pattern.",
          html: shell(
            ORDER.number,
            `<div class="page rd-page">
  ${trail("Home", "Orders", ORDER.number)}
  <div class="phead"><div><h1>${ORDER.number} ${badgeRaw("Paid", "positive")}</h1><p class="desc">${ORDER.customer} · ${DELIVERY.name} · ${ORDER.placed}</p></div><div class="acts"><button class="btn sm">⌕ Jump to an order…</button><button class="btn primary">Message customer</button></div></div>
  ${section("What was bought", BOUGHT)}
  <div class="pop" style="max-width:360px;margin-top:12px"><div class="cap">Orders matching “SO-10”</div><div class="item"><span class="code">SO-1031</span><span class="muted">${PEOPLE.otherCustomer.name} · EUR 40.45 · Awaiting</span></div><div class="item"><span class="code">SO-1042</span><span class="muted">${ORDER.customer} · ${MONEY.order} · Paid</span></div></div>
</div>`,
            "Orders",
          ),
        },
        {
          name: "No movement: each record opens from the list",
          rationale:
            "Some consoles deliberately offer no neighbour step, because the list is the queue and the record is the work. The reader finishes an order, closes it, and the list shows what is next. Nothing on the record can carry a stale position.",
          tradeoff:
            "Every record costs a full round trip through the list, which is slow triage and loses the reader's scroll each time. It is honest but it is the slowest honest option.",
          html: shell(
            ORDER.number,
            `<div class="page rd-page">
  ${trail("Home", "Orders", ORDER.number)}
  <div class="phead"><div><h1>${ORDER.number} ${badgeRaw("Paid", "positive")}</h1><p class="desc">${ORDER.customer} · ${DELIVERY.name} · ${ORDER.placed}</p></div><div class="acts"><button class="btn">Close</button><button class="btn primary">Message customer</button></div></div>
  ${section("The customer", facts([["Name", ORDER.customer], ["Email", ORDER.email]]))}
  ${section("What was bought", BOUGHT)}
</div>`,
            "Orders",
          ),
        },
      ],
    },
    {
      id: "rd-order-detail",
      title: "The order record, whole",
      why: "The order is the record support opens most: Maria Garcia's <b>SO-1042, EUR 125.00 for two lamps, a delivery fee and a cable tray</b>. It must state its lines, its payments and its refunds in one reading, with the money adding up and every refund drawn against the payment it reverses.",
      verdict:
        "Ship the record-page shape with summary, three sections and history in the aside: it keeps customer, lines and money each in their own section. The runner-up is the money-first layout, which is the better choice for finance readers reconciling payments against refunds. Prefer the tabbed layout only once an order's facets outgrow three sections. Never ship the phone layout as the desktop page: stacked sections at 1440 px waste two thirds of the width.",
      compact: {
        option: "The order on a phone",
        behaviour: "On a phone the order stacks in the order the questions are asked at the counter: state and customer first, then parcels, then money.",
      },
      variants: [
        {
          name: "Summary, three sections, history in the aside",
          pick: true,
          rationale:
            "A summary of the order with the customer, the lines and the money beside a history aside. Each facet of SO-1042 has one home and the money adds up top to bottom in its own section.",
          tradeoff:
            "Three sections is a ceiling, so the fourth facet waits for a tab or a second page. The aside also stacks below everything under 900 px, which buries the history on a phone.",
          html: shell(
            ORDER.number,
            `<div class="page rd-page">
  ${trail("Home", "Orders", ORDER.number)}
  <div class="phead"><div><h1>${ORDER.number} ${badgeRaw("Paid", "positive")}</h1><p class="desc">Placed ${ORDER.placed} by ${ORDER.customer} of ${ORDER.company}.</p></div><div class="acts"><button class="btn sm">Resend the confirmation</button><button class="btn sm">Refund</button><button class="btn primary">Message customer</button></div></div>
  <div class="rd-grid">
    <div class="stack">
      ${section("The customer", facts([["Name", ORDER.customer], ["Email", ORDER.email], ["Country", "Netherlands"]]))}
      ${section("Lines", `<div class="rlist">${recordRow({ title: "Oak desk lamp", sub: "one per parcel · PC-0C893968A2", state: { label: "Packed", tone: "neutral" }, fig: MONEY.lamp })}${recordRow({ title: "Oak desk lamp", sub: "one per parcel · PC-0C893968A3", state: { label: "Packed", tone: "neutral" }, fig: MONEY.lamp })}${recordRow({ title: "Cable tray", sub: "collect at the counter", state: { label: "Ready", tone: "info" }, fig: "EUR 25.00" })}</div>`)}
      ${section("Money", `<div class="rd-pay"><span class="rd-what">Paid by card<small>${ORDER.placed} · reference SH-88213</small></span>${badgeRaw("Settled", "positive")}<span class="rd-amt">${MONEY.order}</span></div><div class="rd-pay"><span class="rd-what">Refunded<small>None</small></span><span class="rd-amt muted">EUR 0.00</span></div>`)}
    </div>
    <div class="stack">${section("What happened", `<div class="tl">${timelineEntry("Paid by card", "8 Oct 2026, 09:34", COMPANY.name, "positive")}${timelineEntry("Labels printed", "8 Oct 2026, 09:34", COMPANY.name)}${timelineEntry("Order placed", "8 Oct 2026, 09:32", ORDER.customer, "neutral", true)}</div>`)}</div>
  </div>
</div>`,
            "Orders",
          ),
        },
        {
          name: "One facet per tab",
          reference: "Shopify",
          rationale:
            "Shopify draws an order as tabs for timeline, lines and payments, because an order with messages, notes and refunds outgrows three sections. The customer summary stays above the tabs so the record is always identified.",
          tradeoff:
            "Lines and payments can no longer be read together, so checking a refund against its line means switching tabs. The tab state also has to live in the URL to stay shareable.",
          html: shell(
            ORDER.number,
            `<div class="page rd-page">
  ${trail("Home", "Orders", ORDER.number)}
  <div class="phead"><div><h1>${ORDER.number} ${badgeRaw("Paid", "positive")}</h1><p class="desc">${ORDER.customer} · ${DELIVERY.name} · ${ORDER.placed} · ${MONEY.order}</p></div><div class="acts"><button class="btn primary">Message customer</button></div></div>
  ${tabs(['Lines<span class="n">3</span>', "Payment", 'Notes<span class="n">2</span>', "History"], 0)}
  ${section("Lines", `<div class="rlist">${recordRow({ title: "Oak desk lamp", sub: "one per parcel · PC-0C893968A2", state: { label: "Packed", tone: "neutral" }, fig: MONEY.lamp })}${recordRow({ title: "Oak desk lamp", sub: "one per parcel · PC-0C893968A3", state: { label: "Packed", tone: "neutral" }, fig: MONEY.lamp })}${recordRow({ title: "Cable tray", sub: "collect at the counter", state: { label: "Ready", tone: "info" }, fig: "EUR 25.00" })}</div>`)}
</div>`,
            "Orders",
          ),
        },
        {
          name: "One long page, everything in order",
          reference: "Stripe",
          rationale:
            "Stripe draws a charge as one scrolling page, because support reads top to bottom and prints the page for the file. Customer, lines, payments, refunds and history follow in the order the questions are asked.",
          tradeoff:
            "A long page buries the later sections, so refunds sit below the fold on every order. There is also no shortcut to one facet: the reader scrolls past everything above it.",
          html: shell(
            ORDER.number,
            `<div class="page rd-page" style="max-width:640px">
  ${trail("Home", "Orders", ORDER.number)}
  <div class="phead"><div><h1>${ORDER.number} ${badgeRaw("Paid", "positive")}</h1><p class="desc">Placed ${ORDER.placed} by ${ORDER.customer} of ${ORDER.company}.</p></div><div class="acts"><button class="btn primary">Message customer</button></div></div>
  <div class="stack">
    ${section("The customer", facts([["Name", ORDER.customer], ["Email", ORDER.email], ["Country", "Netherlands"]]))}
    ${section("What was bought", BOUGHT)}
    ${section("Payments", `<div class="rd-pay"><span class="rd-what">Card, reference SH-88213<small>${ORDER.placed}</small></span>${badgeRaw("Settled", "positive")}<span class="rd-amt">${MONEY.order}</span></div>`)}
    ${section("Refunds", `<p class="note">Nothing has been refunded. A refund goes back against the card payment above.</p><div class="btnrow" style="margin-top:8px"><button class="btn sm">Refund to that payment</button></div>`)}
    ${section("What happened", `<div class="tl">${timelineEntry("Paid by card", "8 Oct 2026, 09:34", COMPANY.name, "positive")}${timelineEntry("Order placed", "8 Oct 2026, 09:32", ORDER.customer, "neutral", true)}</div>`)}
  </div>
</div>`,
            "Orders",
          ),
        },
        {
          name: "Money first",
          reference: "Xero",
          rationale:
            "Xero opens an invoice on its money, because finance asks what moved before asking who moved it. Payments and refunds sit directly under the header with the statement adding up, and the customer and lines follow below.",
          tradeoff:
            "Support reads the customer first, so money-first puts their answer second on every call. The money section also repeats the lines it totals, which is the same figure stated twice.",
          html: shell(
            ORDER.number,
            `<div class="page rd-page">
  ${trail("Home", "Orders", ORDER.number)}
  <div class="phead"><div><h1>${ORDER.number} ${badgeRaw("Paid", "positive")}</h1><p class="desc">${ORDER.customer} · ${DELIVERY.name} · ${ORDER.placed}</p></div><div class="acts"><button class="btn sm">Refund</button><button class="btn primary">Message customer</button></div></div>
  ${section("Money", statement([{ label: "Charged", lines: [{ what: "Two lamps", sub: `${MONEY.lamp} each`, amount: MONEY.lineTotal }, { what: "Delivery fee", sub: "Set by Acme Supply", amount: "EUR 10.00" }, { what: "Cable tray", sub: "Collect at the counter", amount: "EUR 25.00" }], totalLabel: "Charged in total", total: MONEY.order }, { label: "Refunded", lines: [], totalLabel: "Refunded in total", total: "EUR 0.00" }], { label: `Still with ${COMPANY.name}`, amount: MONEY.order }), { desc: `Paid by card on ${ORDER.placed}, reference SH-88213. Nothing has been refunded.` })}
  ${section("The customer", facts([["Name", ORDER.customer], ["Email", ORDER.email]]))}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Customer first",
          reference: "Zendesk",
          rationale:
            "Zendesk opens a case on the requester, because support answers a person rather than a record. The customer card leads with name, contact and order history, and the lines and money read as that customer's story below it.",
          tradeoff:
            "The record's own identity waits behind the customer's, so an order-first reader scrolls past a card they did not open. Customer history on the order also duplicates the customer page.",
          html: shell(
            ORDER.number,
            `<div class="page rd-page">
  ${trail("Home", "Orders", ORDER.number)}
  <div class="phead"><div><h1>${ORDER.number} ${badgeRaw("Paid", "positive")}</h1><p class="desc">${DELIVERY.name} · ${ORDER.placed} · ${MONEY.order}</p></div><div class="acts"><button class="btn primary">Message customer</button></div></div>
  ${section("The customer", `<div class="stack sm"><div class="inline"><span class="rd-avatar">MG</span><div><b style="font-size:13px">${ORDER.customer}</b><br><span class="muted" style="font-size:11.5px">${ORDER.email} · Netherlands</span></div><button class="btn sm" style="margin-left:auto">All orders by Maria</button></div><p class="note tight">2 orders with Acme Supply, both paid, none refunded. First order 12 Sep 2026.</p></div>`)}
  ${section("What was bought", BOUGHT)}
  ${section("Payments", `<div class="rd-pay"><span class="rd-what">Card, reference SH-88213<small>${ORDER.placed}</small></span>${badgeRaw("Settled", "positive")}<span class="rd-amt">${MONEY.order}</span></div>`)}
</div>`,
            "Orders",
          ),
        },
        {
          name: "The order on a phone",
          width: "phone",
          reference: "Shopify",
          rationale:
            "Shopify stacks an order on mobile in the order the questions are asked at the counter: state and customer first, then parcels, then money. One column, full-width primary, nothing beside anything else.",
          tradeoff:
            "Stacking puts the money last, so a refund at the counter is a long scroll away. The history also drops to the foot, where nobody on a phone reads it.",
          html: shell(
            ORDER.number,
            `<div class="page rd-page">
  ${trail("Home", "Orders", ORDER.number)}
  <div class="phead"><div><h1>${ORDER.number} ${badgeRaw("Paid", "positive")}</h1><p class="desc">${ORDER.customer} · ${DELIVERY.name}</p></div><div class="acts"><button class="btn primary w-full">Message customer</button></div></div>
  <div class="stack">
    ${section("Parcels", `<div class="rlist">${recordRow({ title: "PC-0C893968A2", sub: "Oak desk lamp · one per parcel", state: { label: "Packed", tone: "neutral" } })}${recordRow({ title: "PC-0C893968A3", sub: "Oak desk lamp · one per parcel", state: { label: "Packed", tone: "neutral" } })}</div>`, { acts: '<button class="btn xs">Resend</button>' })}
    ${section("Money", `<div class="stmt"><div class="line"><span>Paid by card<span class="sub">${ORDER.placed}</span></span><span class="fig">${MONEY.order}</span></div><div class="grand"><span>Refunded</span><span class="fig">EUR 0.00</span></div></div>`)}
  </div>
</div>`,
            "Orders",
          ),
        },
      ],
    },
  ],
};
