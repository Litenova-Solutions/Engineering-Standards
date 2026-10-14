/**
 * Navigation and frame: The sidebar, the trail and the header decide whether a reader knows where they are and where they can go.
 *
 * The evidence is consistent on the mechanics and silent on the numbers. Fluent
 * allows two levels of hierarchy; GOV.UK distinguishes `current` from `active`
 * and wants `aria-current` on exactly one item; WCAG 2.4.8 is satisfied by
 * `aria-current`. No cited system gives a cap on top-level groups.
 */

import {
  COMPANY,
  DELIVERY,
  MONEY,
  ORDER,
  PEOPLE,
  PRODUCT,
  STATES,
  actionRow,
  badgeRaw,
  bar,
  callout,
  dialog,
  emptyState,
  facts,
  field,
  input,
  menu,
  ordersTable,
  pager,
  phead,
  recordRow,
  section,
  segmented,
  select,
  shell,
  sidebar,
  split,
  tabs,
  tip,
  toolbar,
  trail,
  twoCol,
} from "../parts.mjs";

/** Glyphs for the seven areas, in sidebar order. */
const NV_AREAS = [
  ["Home", "◫"],
  ["Orders", "▥"],
  ["Customers", "◉"],
  ["Products", "◈"],
  ["Invoices", "▭"],
  ["Reports", "▦"],
  ["Settings", "⚙"],
];

/** Lucide-style stroke icons for the seven areas, at mock size. */
function nvSvg(inner) {
  return `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;
}
const NV_ICONS = [
  ["Home", '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/>'],
  ["Orders", '<path d="M5 3h14v18l-2.3-1.5L14.5 21l-2.5-1.5L9.5 21l-2.2-1.5L5 21z"/><path d="M9 8h6"/>'],
  ["Customers", '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><circle cx="17" cy="9" r="2.5"/><path d="M16.5 14.5a5.5 5.5 0 0 1 5 5.5"/>'],
  ["Products", '<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9z"/><path d="M12 12l8-4.5M12 12v9M12 12L4 7.5"/>'],
  ["Invoices", '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>'],
  ["Reports", '<path d="M4 20h16M7 16v-5M12 16V7M17 16v-8"/>'],
  ["Settings", '<path d="M5 7h14M5 17h14"/><circle cx="10" cy="7" r="2.2"/><circle cx="15" cy="17" r="2.2"/>'],
];

/** An icon rail frame: the collapsed sidebar beside the page. */
function nvRail(title, page, active = "Home") {
  return `<div class="shell nv-rail"><nav>${NV_AREAS.map(([nm, ico]) => `<a href="#" aria-label="${nm}"${nm === active ? ' aria-current="page"' : ""}><span style="opacity:${nm === active ? 1 : 0.55}">${ico}</span></a>`).join("")}<span class="grow"></span><a href="#" aria-label="Help">?</a><div class="who"><span style="width:22px;height:22px;border-radius:50%;background:var(--muted);display:grid;place-items:center;font-size:10px">${PEOPLE.manager.initials}</span></div></nav><div class="main">${bar(title)}${page}</div></div>`;
}

/** The sidebar entries as an off-canvas sheet, the phone behaviour. */
function nvSheet(active = "Home", subs = []) {
  const rows = NV_AREAS.map(([nm, ico]) => `<a href="#"${nm === active ? ' aria-current="page"' : ""}><span style="width:12px;display:inline-block;text-align:center;opacity:.55">${ico}</span>${nm}</a>${nm === active && subs.length ? subs.map(([s, on]) => `<a href="#" class="sub"${on ? ' aria-current="page"' : ""}>${s}</a>`).join("") : ""}`).join("");
  return `<div class="scrim" style="place-items:stretch;justify-items:start;padding:0"><nav class="nv-sheet" aria-label="Menu"><div class="nv-sheethead"><span style="font-size:12.5px;font-weight:600">${COMPANY.name}</span><button class="btn xs ghost" style="margin-left:auto" aria-label="Close menu">✕</button></div>${rows}<span class="grow" style="flex:1"></span><a href="#">Help</a><div style="display:flex;align-items:center;gap:7px;padding:7px 6px 2px;border-top:1px solid var(--sidebar-border);margin-top:8px;font-size:11.5px"><span style="width:22px;height:22px;border-radius:50%;background:var(--muted);display:grid;place-items:center;font-size:10px">${PEOPLE.manager.initials}</span><span>${PEOPLE.manager.name}<br><span style="color:var(--muted-foreground);font-size:10.5px">${PEOPLE.manager.role}</span></span></div></nav></div>`;
}

/** A bottom tab bar for a phone: five destinations, one current. */
function nvBottomNav(active = "Home") {
  const tabs = [
    ["Home", "◫", 0],
    ["Orders", "▥", 2],
    ["Customers", "◉", 0],
    ["Invoices", "▭", 0],
    ["More", "⋯", 0],
  ];
  return `<nav class="nv-bottom" aria-label="Primary">${tabs.map(([nm, ico, n]) => `<a href="#"${nm === active ? ' aria-current="page"' : ""}><span class="nv-glyph">${ico}</span>${nm}${n ? `<span class="nv-unread">${n}</span>` : ""}</a>`).join("")}</nav>`;
}

/** A header bell with an unread count. */
function nvBell(n) {
  return `<span class="nv-bell"><button class="btn sm icon" aria-label="Notifications, ${n} unread">◉</button><span class="nv-unread">${n}</span></span>`;
}

const NV_CSS = /* css */ `
.shell.nv-rail { grid-template-columns: 52px minmax(0, 1fr); }
.shell.nv-rail > nav { padding: 10px 6px; align-items: stretch; }
.shell.nv-rail > nav a { justify-content: center; padding: 7px 0; }
.shell.nv-rail > nav .who { justify-content: center; }
.nv-sheet { width: 272px; max-width: 84vw; height: 100%; background: var(--sidebar); color: var(--sidebar-foreground); border-right: 1px solid var(--sidebar-border); padding: 10px 8px; display: flex; flex-direction: column; gap: 1px; overflow: auto; }
.nv-sheet a { display: flex; align-items: center; gap: 7px; text-decoration: none; padding: 6px 7px; border-radius: 6px; font-size: 12.5px; color: var(--sidebar-foreground); }
.nv-sheet a:hover { background: var(--sidebar-accent); }
.nv-sheet a[aria-current="page"] { background: var(--sidebar-accent); font-weight: 600; }
.nv-sheet a.sub { padding-left: 26px; color: var(--muted-foreground); }
.nv-sheethead { display: flex; align-items: center; gap: 8px; padding: 2px 6px 10px; }
.nv-cap { font-size: 10.5px; text-transform: uppercase; letter-spacing: .06em; opacity: .6; padding: 8px 7px 3px; }
.nv-bottom { position: sticky; bottom: 0; display: grid; grid-template-columns: repeat(5, minmax(0, 1fr)); background: var(--card); border-top: 1px solid var(--border); z-index: 5; margin: 14px -16px -16px; }
.nv-bottom a { display: flex; flex-direction: column; align-items: center; gap: 3px; padding: 8px 0 12px; font-size: 10.5px; color: var(--muted-foreground); text-decoration: none; position: relative; }
.nv-bottom a[aria-current="page"] { color: var(--foreground); font-weight: 600; }
.nv-bottom .nv-glyph { font-size: 15px; line-height: 1; }
.nv-unread { position: absolute; top: 4px; margin-left: 22px; min-width: 16px; height: 16px; padding: 0 4px; border-radius: 999px; background: var(--destructive); color: var(--destructive-foreground); font-size: 9.5px; font-weight: 700; display: grid; place-items: center; }
.nv-bell { position: relative; display: inline-flex; }
.nv-bell .nv-unread { top: -5px; margin-left: 16px; }
.nv-wsswitch { display: flex; align-items: center; gap: 8px; width: 100%; text-align: left; background: transparent; border: 1px solid var(--sidebar-border); border-radius: 8px; padding: 7px 9px; cursor: pointer; margin-bottom: 8px; font-size: 12.5px; font-weight: 600; }
.nv-wsswitch:hover { background: var(--sidebar-accent); }
.nv-vtabs { display: flex; flex-direction: column; gap: 1px; }
.nv-vtabs a { display: flex; align-items: center; gap: 8px; padding: 6px 9px; border-radius: 6px; font-size: 12.5px; text-decoration: none; color: var(--muted-foreground); }
.nv-vtabs a:hover { background: var(--muted); }
.nv-vtabs a[aria-current="page"] { background: var(--muted); color: var(--foreground); font-weight: 600; }
.nv-hsheet { position: absolute; left: 0; right: 0; bottom: 0; background: var(--popover); border-top: 1px solid var(--border); border-radius: 12px 12px 0 0; box-shadow: 0 -12px 32px var(--scroll-shade); padding: 8px 14px 16px; max-height: 80%; overflow: auto; }
.nv-grab { width: 36px; height: 4px; border-radius: 999px; background: var(--input); margin: 0 auto 10px; }
.nv-panel { background: var(--popover); border: 1px solid var(--border); border-radius: var(--radius); box-shadow: 0 8px 22px var(--scroll-shade); }
.nv-bar { flex-wrap: wrap; row-gap: 6px; }
@media (max-width: 640px) { .nv-bottom { margin: 14px -12px -12px; } }
`;

export const CATEGORY_NAVIGATION = {
  css: NV_CSS,
  items: [
    {
      id: "nav-sidebar",
      title: "The sidebar",
      why: "A back-office console holds <b>seven top-level areas and thirty routes under Settings alone</b>. Fluent allows two levels and calls a group an accordion rather than a link; GOV.UK wants <code>current</code> and <code>active</code> distinguished.",
      verdict:
        "Keep the grouped areas with expandable sub-items: seven areas with two levels is what Fluent allows, and the expandable group is the shape sidebar components ship. The counts beside groups are the runner-up for areas that hold a queue, such as refunds, but a count beside every area reports status the reader did not ask for. Never ship the flat list of every page: over a hundred entries is an index, not a map, and it belongs in the command palette.",
      compact: {
        option: "The sidebar as an off-canvas sheet on a phone",
        behaviour: "Below the md breakpoint the sidebar becomes an off-canvas sheet: the same entries slide in over a scrim and dismiss with a close control.",
      },
      variants: [
        {
          name: "Grouped areas with expandable sub-items",
          pick: true,
          rationale:
            "Seven areas, each expandable, with the current item marked and the sub-item indented under its area. The account sits at the foot.",
          tradeoff:
            "Thirty settings routes in one group means a group longer than the screen, and Settings is open on every settings page so it never collapses.",
          html: shell(
            "Products",
            `<div class="page">
    ${phead("Products", "93 in the catalogue.", '<button class="btn primary">New product</button>', { crumb: trail("Home", "Products") })}
    ${toolbar({ search: "", placeholder: "Search products", views: [{ label: "Active 81", on: true }, { label: "Draft 9" }, { label: "All 93" }] })}
    ${section(
      "",
      `<div class="rlist">
        ${[
          [PRODUCT.name, `${PRODUCT.sku} · 412 in stock`, "Active", "positive", MONEY.lamp],
          ["Linen armchair", "CHR-LIN-02 · 88 in stock", "Active", "positive", MONEY.lineTotal],
          ["Oak bookshelf", "SHF-OAK-03 · 12 in stock", "Active", "positive", MONEY.order],
          ["Brass floor lamp", "LMP-BRS-04 · not priced yet", "Draft", "neutral", "—"],
        ]
          .map(
            ([nm, when, st, tone, sold]) => `<div class="rrow">
          <span class="txt"><b>${nm}</b><small>${when}</small></span>
          ${badgeRaw(st, tone, "outline")}
          <span class="fig">${sold}</span>
          <span class="acts"><button class="btn sm">Open</button> <button class="btn sm icon" aria-label="More actions for ${nm}">⋯</button></span>
        </div>`,
          )
          .join("")}
      </div>`,
    )}
  </div>`,
            "Products",
          ),
        },
        {
          name: "Two levels, with the group showing a live count",
          rationale:
            "The groups carry the number a reader would otherwise have to go and get: 10 under Refunds, 3 team invitations, 5 disputes. The count is the group's whole job.",
          tradeoff:
            "A count beside every area is a claim on every read, and an area whose count is zero is an area that looks finished rather than empty.",
          html: `<div class="shell">
  ${sidebar("Orders", false).replace("</nav>", `
    <a href="#" aria-current="page"><span style="width:12px;display:inline-block;opacity:.55"></span>Orders</a>
    <a href="#" class="sub" style="padding-left:20px">Orders</a>
    <a href="#" class="sub" style="padding-left:20px">Awaiting payment<span class="n" style="margin-left:auto;font-size:11px">31</span></a>
    <a href="#" class="sub" style="padding-left:20px">Refunds<span class="n" style="margin-left:auto;font-size:11px">10</span></a>
    <a href="#" class="sub" style="padding-left:20px">Exceptions<span class="n" style="margin-left:auto;font-size:11px">2</span></a>
  </nav>`)}
  <div class="main">
    ${bar("Orders")}
    <div class="page">
      ${phead("Refunds", "10 open. The oldest is 214 days.", '<button class="btn sm">Export</button>', { crumb: trail("Home", "Orders", "Refunds") })}
      ${toolbar({ search: "", placeholder: "Search refunds", filters: ["Any window"] })}
      ${section(
        "",
        `<div class="rlist">
          ${[
            ["SO-1031", "Tom Becker", "214 days ago", "No route", "destructive", MONEY.refund],
            ["SO-1029", "Elin Lindqvist", "181 days ago", "No route", "destructive", MONEY.refund],
            ["SO-1040", "Ade Okafor", "5 days ago", "Closing", "caution", MONEY.refund],
            ["SO-1033", "Tom Becker", "163 days ago", "Open", "neutral", MONEY.refund],
            ["SO-1042", ORDER.customer, "6 days ago", "Open", "neutral", MONEY.order],
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
    </div>
  </div>
</div>`,
        },
        {
          name: "A flat list with a search box",
          rationale:
            "Thirty settings routes plus six areas is a tree. A flat list of every page with a search box collapses the tree into one index, and the reader types what they want.",
          tradeoff:
            "Thirty settings routes is the reason a tree exists at all. A flat list of over a hundred entries is a wall, and the sidebar stops being a map.",
          html: `<div class="shell">
  <nav>
    <span class="brand" style="padding:4px 6px 10px;font-size:12.5px">${COMPANY.name}</span>
    <span class="search" style="padding:0 4px 8px"><span class="ico" style="left:11px">⌕</span><input style="width:100%;height:28px;padding-left:26px;font-size:12px;border:1px solid var(--input);border-radius:var(--radius-sm);background:var(--sidebar)" placeholder="Jump to"></span>
    <a href="#" aria-current="page"><span style="width:12px;display:inline-block;opacity:.55"></span>Home</a>
    <a href="#"><span style="width:12px;display:inline-block;opacity:.55"></span>Orders</a>
    <a href="#"><span style="width:12px;display:inline-block;opacity:.55"></span>Customers</a>
    <a href="#"><span style="width:12px;display:inline-block;opacity:.55"></span>Products</a>
    <a href="#"><span style="width:12px;display:inline-block;opacity:.55"></span>Invoices</a>
    <a href="#"><span style="width:12px;display:inline-block;opacity:.55"></span>Reports</a>
    <a href="#"><span style="width:12px;display:inline-block;opacity:.55"></span>Settings</a>
    <span class="grow"></span>
    <a href="#">Help</a>
  </nav>
  <div class="main">
    ${bar("Settings")}
    <div class="page">
      ${phead("Settings", "33 areas. Search them or scroll.", "", { crumb: trail("Home", "Settings") })}
      ${toolbar({ search: "warehouse", placeholder: "Search settings", right: '<span class="muted" style="font-size:11.5px">2 match</span>' })}
      ${section(
        "",
        `<div class="rlist">
          ${recordRow({ title: "Dispatch plan", sub: "Settings · Warehouses · Bays and carriers" })}
          ${recordRow({ title: "Warehouse staff", sub: "Settings · Team · The people who run dispatch" })}
        </div>`,
        { flush: false, desc: "Settings · Warehouses" },
      )}
      ${section(
        "",
        `<div class="rlist">
          ${[
            ["General", "Name, address, contact, time zone"],
            ["Locations", "Warehouses you hold stock at"],
            ["Warehouses", "3 warehouses with a dispatch plan"],
            ["Payments", "The account money is paid into"],
            ["Policies", "Terms and refund policy"],
            ["Team", "5 people, 2 invitations out"],
            ["Roles", "4 custom roles"],
            ["Data imports", "What was imported and what came of it"],
            ["Developers", "Origins, webhooks, API keys"],
          ]
            .map(([nm, sub]) => recordRow({ title: nm, sub, actions: '<button class="btn sm">Open</button>' }))
            .join("")}
        </div>`,
        { desc: "Everything else" },
      )}
    </div>
  </div>
</div>`,
        },
        {
          name: "A command palette for the whole product",
          rationale:
            "The sidebar holds the seven areas and a palette holds everything else. Cmd-K is the shape most consoles now use for a large route count.",
          tradeoff:
            "It only works if the reader knows a key exists, so it cannot be the only way to anything: WCAG 2.1.1 requires every function to be available from the keyboard, and a hidden palette is a discoverability problem rather than an accessibility one.",
          html: shell(
            "Command palette",
            `<div class="page" style="position:relative">
  ${phead("Orders", "268 orders.", '<button class="btn sm">⌘ K</button>', { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order number, name or email" })}
  ${section(
    "",
    `<table class="dt dense">
      <thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col">State</th><th scope="col" class="num">Paid</th></tr></thead>
      <tbody>
        ${[
          ["SO-1042", ORDER.customer, "Paid", "positive", MONEY.order],
          ["SO-1041", "Tom Becker", "Paid", "positive", "EUR 310.00"],
          ["SO-1040", "Elin Lindqvist", "Shipped", "neutral", MONEY.lamp],
        ]
          .map(([no, who, st, tone, amt]) => `<tr><td><span class="code">${no}</span></td><td>${who}</td><td>${badgeRaw(st, tone, "outline")}</td><td class="num">${amt}</td></tr>`)
          .join("")}
      </tbody>
    </table>`,
    { flush: true },
  )}
  <div class="scrim" style="align-items:flex-start;padding-top:80px">
    <div class="dialog lg" role="dialog" aria-modal="true" aria-label="Jump to" style="max-width:460px">
      <div class="dbody" style="padding:0">
        <div class="search" style="padding:11px 13px;border-bottom:1px solid var(--border)"><span class="ico" style="left:24px">⌕</span><input class="inp w-full" style="padding-left:26px;border:0" value="refund" placeholder="Search pages, orders, products"></div>
        <div class="pop" style="box-shadow:none;border:0;border-radius:0;padding:5px">
          <div class="cap">Go to</div>
          <div class="item" style="background:var(--muted)">Refunds<span style="margin-left:auto;font-size:11px;color:var(--muted-foreground)">Orders</span></div>
          <div class="item">Late payments<span style="margin-left:auto;font-size:11px;color:var(--muted-foreground)">Orders</span></div>
          <div class="sep"></div>
          <div class="cap">Orders</div>
          <div class="item"><span class="code">SO-1042</span><span style="margin-left:auto;font-size:11px;color:var(--muted-foreground)">${ORDER.customer}</span></div>
          <div class="item"><span class="code">SO-1031</span><span style="margin-left:auto;font-size:11px;color:var(--muted-foreground)">Tom Becker</span></div>
        </div>
      </div>
      <footer style="justify-content:flex-start;gap:14px;border-top:1px solid var(--border)">
        <span style="font-size:11px;color:var(--muted-foreground)"><kbd style="border:1px solid var(--border);border-radius:3px;padding:0 4px">↑↓</kbd> move</span>
        <span style="font-size:11px;color:var(--muted-foreground)"><kbd style="border:1px solid var(--border);border-radius:3px;padding:0 4px">↵</kbd> open</span>
        <span style="font-size:11px;color:var(--muted-foreground)"><kbd style="border:1px solid var(--border);border-radius:3px;padding:0 4px">esc</kbd> close</span>
      </footer>
    </div>
  </div>
</div>`,
            "Orders",
          ),
        },
        {
          name: "The sidebar as a page, opened over the content",
          rationale:
            "At 390 pixels there is no beside, so the navigation is a page of its own with a Back. Every entry is visible at once rather than behind a hamburger.",
          tradeoff:
            "One more navigation level on the surface where a warehouse lead is holding a phone on the warehouse floor, which is the worst possible time for an extra tap.",
          width: "phone",
          html: shell(
            "Menu",
            `<div class="page">
  <div class="btnrow between" style="margin-bottom:12px">
    <button class="btn sm ghost">Close</button>
    <span style="font-size:12.5px;font-weight:600">${COMPANY.name}</span>
  </div>
  <div class="stack sm">
    ${[
      ["Home", "What needs you today"],
      ["Orders", "268 orders, 2 needing attention"],
      ["Customers", "1,204 customers who ordered"],
      ["Products", "93 products, 412 lamps"],
      ["Invoices", "September closed, October open"],
      ["Reports", "Sales, stock and refunds"],
      ["Settings", "30 areas"],
    ]
      .map(([nm, sub]) => `<a href="#" style="display:flex;flex-direction:column;gap:1px;padding:9px 8px;border-bottom:1px solid var(--border);text-decoration:none">
        <b style="font-size:13px;font-weight:600">${nm}</b>
        <span style="font-size:11.5px;color:var(--muted-foreground)">${sub}</span>
      </a>`)
      .join("")}
  </div>
  <div class="btnrow" style="margin-top:14px"><button class="btn sm">Help</button><button class="btn sm">Signed in as ${PEOPLE.warehouse.name}</button></div>
</div>`,
            "Home",
          ),
        },
        {
          name: "The sidebar as an accordion with only one open",
          rationale:
            "One group open at a time keeps the sidebar short regardless of how many routes each group holds. Seven areas become seven lines plus two.",
          tradeoff:
            "Fluent's guidance is the opposite: the indicator must stay visible on a collapsed parent when a child is current, so a reader has to look at a closed group to see where they are.",
          html: `<div class="shell">
  <nav>
    <span class="brand" style="padding:4px 6px 10px;font-size:12.5px">${COMPANY.name}</span>
    <a href="#"><span style="width:12px;display:inline-block;opacity:.55"></span>Home</a>
    <a href="#" aria-expanded="true"><span style="width:12px;display:inline-block;opacity:.55"></span>Products<span class="chev">⌄</span></a>
    <a href="#" class="sub" aria-current="page" style="padding-left:20px">Products</a>
    <a href="#" class="sub" style="padding-left:20px">Variants</a>
    <a href="#" aria-expanded="false"><span style="width:12px;display:inline-block;opacity:.55"></span>Orders<span class="chev">›</span></a>
    <a href="#"><span style="width:12px;display:inline-block;opacity:.55"></span>Customers<span class="chev">›</span></a>
    <a href="#"><span style="width:12px;display:inline-block;opacity:.55"></span>Invoices<span class="chev">›</span></a>
    <a href="#"><span style="width:12px;display:inline-block;opacity:.55"></span>Reports<span class="chev">›</span></a>
    <a href="#"><span style="width:12px;display:inline-block;opacity:.55"></span>Settings<span class="chev">›</span></a>
    <span class="grow"></span>
    <a href="#">Help</a>
  </nav>
  <div class="main">
    ${bar("Products")}
    <div class="page">
      ${phead("Products", "93 in the catalogue.", '<button class="btn primary sm">New product</button>', { crumb: trail("Home", "Products") })}
      ${section(
        "",
        `<div class="rlist">
          ${recordRow({ title: PRODUCT.name, sub: `${PRODUCT.sku} · 412 in stock`, state: { label: "Active", tone: "positive" }, fig: MONEY.lamp })}
          ${recordRow({ title: "Brass floor lamp", sub: "LMP-BRS-04 · not priced yet", state: { label: "Draft", tone: "neutral" }, fig: "—" })}
        </div>`,
      )}
    </div>
  </div>
</div>`,
        },
        {
          name: "Recent pages pinned above the areas",
          rationale:
            "The three most recent pages sit above the seven areas, so resuming work is one click instead of re-walking the tree. None of the other variants remembers where the reader was: clearer navigation by recency rather than by structure.",
          tradeoff:
            "Recents are per person, so a shared screen shows another person's trail. A recent that was archived or renamed also needs a rule for what its row says.",
          html: `<div class="shell">
  <nav>
    <span class="brand" style="padding:4px 6px 10px;font-size:12.5px">${COMPANY.name}</span>
    <span class="muted" style="padding:0 6px 4px;font-size:11px">Recent</span>
    <a href="#"><span style="width:12px;display:inline-block;opacity:.55"></span>${ORDER.number} · ${ORDER.customer}</a>
    <a href="#"><span style="width:12px;display:inline-block;opacity:.55"></span>${DELIVERY.name}</a>
    <a href="#"><span style="width:12px;display:inline-block;opacity:.55"></span>September statement</a>
    <span class="grow" style="min-height:6px"></span>
    <a href="#"><span style="width:12px;display:inline-block;opacity:.55"></span>Home</a>
    <a href="#"><span style="width:12px;display:inline-block;opacity:.55"></span>Products<span class="chev">›</span></a>
    <a href="#" aria-current="page"><span style="width:12px;display:inline-block;opacity:.55"></span>Orders</a>
    <a href="#" class="sub">Orders</a>
    <a href="#" class="sub">Returns</a>
    <a href="#"><span style="width:12px;display:inline-block;opacity:.55"></span>Invoices<span class="chev">›</span></a>
    <span class="grow"></span>
    <a href="#">Help</a>
  </nav>
  <div class="main">
    ${bar("Orders")}
    <div class="page">
      ${phead("Orders", "268 orders from 142 customers.", "", { crumb: trail("Home", "Orders") })}
      ${toolbar({ search: "", placeholder: "Order number, name or email" })}
      ${section("", ordersTable({ rows: 4 }), { flush: true })}
      ${pager(1, 11)}
    </div>
  </div>
</div>`,
        },
        {
          name: "Collapsed to an icon rail on a narrow screen",
          width: "tablet",
          rationale:
            "Linear collapses its sidebar to an icon rail rather than hiding it, so the seven areas stay one click away on a narrow laptop. The rail keeps the current item marked and the account visible as an avatar.",
          tradeoff:
            "Labels are gone, so a new reader has to hover all seven glyphs to learn them. Counts beside groups have nowhere to go either.",
          reference: "Linear",
          html: nvRail(
            "Orders",
            `<div class="page">${phead("Orders", "268 orders from 142 customers, newest first.", "", { crumb: trail("Home", "Orders") })}${toolbar({ search: "", placeholder: "Order number, name or email", filters: ["Any state"] })}${section("", `<table class="dt dense"><thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col">State</th><th scope="col" class="num">Paid</th></tr></thead><tbody>${[["SO-1042", ORDER.customer, "Paid", "positive", MONEY.order], ["SO-1041", "Tom Becker", "Paid", "positive", "EUR 310.00"]].map(([no, who, st, tone, amt]) => `<tr><td><span class="code">${no}</span></td><td>${who}</td><td>${badgeRaw(st, tone, "outline")}</td><td class="num">${amt}</td></tr>`).join("")}</tbody></table>`, { flush: true })}${pager(1, 11)}</div>`,
            "Orders",
          ),
        },
        {
          name: "The sidebar as an off-canvas sheet on a phone",
          width: "phone",
          rationale:
            "The sidebar turns into a sheet below the md breakpoint: the same entries slide in over a scrim and dismiss with a close control. Nothing about the tree changes between desktop and phone.",
          tradeoff:
            "The sheet covers the page it came from, so comparing the navigation with the content means opening and closing it. A warehouse lead looking up one order costs one extra tap.",
          reference: "shadcn",
          html: `<div class="shell" style="grid-template-columns:minmax(0,1fr)"><div class="main"><div class="bar"><span class="nv-glyph" style="font-weight:400">☰</span><span>Orders</span><span class="icons"><span style="opacity:.7">?</span><span style="opacity:.7">☼</span></span></div><div class="page">${phead("Orders", "268 orders.", "")}${toolbar({ search: "", placeholder: "Order number, name or email" })}${section("", `<div class="rlist">${recordRow({ title: "SO-1042 · " + ORDER.customer, sub: "8 Oct 2026, 09:32 · Garcia Interiors", state: { label: "Paid", tone: "positive" }, fig: MONEY.order })}${recordRow({ title: "SO-1041 · Tom Becker", sub: "8 Oct 2026, 09:20 · Becker Bouw", state: { label: "Paid", tone: "positive" }, fig: "EUR 310.00" })}</div>`)}</div></div></div>${nvSheet("Orders", [["Orders", true], ["Returns", false], ["Exceptions", false]])}`,
        },
      ],
    },
    {
      id: "nav-breadcrumb",
      title: "The breadcrumb",
      why: "Fluent's rules are that a breadcrumb never wraps, may scroll horizontally, and that <code>aria-current</code> goes on the last item. The trail runs four levels deep on a product variant and sometimes shows <b>Dutch strings in an English frame</b>.",
      verdict:
        "Keep the parent chain with the last item marked current: it is the only place a record states its place in the tree. The left-truncating trail with an overflow menu is the runner-up for four-level chains on narrow screens, since it keeps the current page visible where sideways scrolling hides it. Never ship no trail at all: on a phone the sidebar is closed, so the trail is the only statement of where a record sits.",
      compact: {
        option: "Back to the parent on a phone",
        behaviour: "On a phone the trail collapses to a single back link to the parent, above the heading.",
      },
      variants: [
        {
          name: "The trail as the parent chain",
          pick: true,
          rationale:
            "Every level is a link except the last, which carries the current item. It is the only place the record's place in the tree is stated.",
          tradeoff:
            "Four levels on a price tier, and Fluent's no-wrap rule pushes the last item off a phone unless the trail scrolls.",
          html: shell(
            "Standard",
            `<div class="page" style="max-width:600px">
  ${trail("Home", "Products", PRODUCT.name, "Standard")}
  <div class="phead">
    <div><h1>Standard ${badgeRaw("Active", "positive")}</h1><p class="desc">What this price tier is, and the discount rule its lines carry.</p></div>
    <div class="acts"><button class="btn sm">Pause sales</button></div>
  </div>
  ${section("Details", facts([["Units per line", "1"], ["Stock", "Whole product"], ["Sold", "9,412 of 10,000"]]))}
</div>`,
            "Products",
          ),
        },
        {
          name: "A trail that truncates from the left",
          rationale:
            "Fluent truncates after 80 characters with a tooltip and collapses the overflow into a menu starting from the second item, so a long product name never pushes the current page off.",
          tradeoff:
            "A menu in the trail is a third kind of menu on a page that already has row menus and header menus, and the reader has to open it to see where they are.",
          reference: "Fluent",
          html: shell(
            "Price tier",
            `<div class="page" style="max-width:600px">
  <nav class="trail">
    <a href="#">Home</a><span class="sep">›</span>
    <span style="position:relative">
      <button class="btn xs ghost" aria-label="Two levels above" style="height:18px;padding:0 5px">⋯</button>
    </span><span class="sep">›</span>
    <a href="#" title="Oak desk lamp, natural oil finish with brass fittings">Oak desk lamp, natural oil finish with brass fittings</a><span class="sep">›</span>
    <span aria-current="page" style="color:var(--foreground);font-weight:500">Standard</span>
  </nav>
  <div class="phead">
    <div><h1>Standard ${badgeRaw("Active", "positive")}</h1><p class="desc">What this price tier is, and the discount rule its lines carry.</p></div>
    <div class="acts"><button class="btn sm">Pause sales</button></div>
  </div>
  ${section("Details", facts([["Units per line", "1"], ["Sold", "9,412 of 10,000"]]))}
</div>`,
            "Products",
          ),
        },
        {
          name: "No trail, because the sidebar already says it",
          rationale:
            "The expanded sidebar entry is the trail. One navigation element instead of two, and the heading starts at the top of the page.",
          tradeoff:
            "Fails WCAG 2.4.8 in the practical sense on a phone where the sidebar is closed, and there is no evidence of where a record sits in the tree. GOV.UK's own rule is that the trail appears when a parent page exists.",
          html: shell(
            "Products",
            `<div class="page">
  ${phead("Products", "93 in the catalogue.", '<button class="btn primary sm">New product</button>')}
  ${section(
    "",
    `<div class="rlist">
      ${[
        [PRODUCT.name, `${PRODUCT.sku} · 412 in stock`, "Active", "positive", MONEY.lamp],
        ["Brass floor lamp", "LMP-BRS-04 · not priced yet", "Draft", "neutral", "—"],
      ]
        .map(([nm, when, st, tone, sold]) => `<div class="rrow">
        <span class="txt"><b>${nm}</b><small>${when}</small></span>
        ${badgeRaw(st, tone, "outline")}
        <span class="fig">${sold}</span>
        <span class="acts"><button class="btn sm">Open</button></span>
      </div>`)
        .join("")}
    </div>`,
  )}
</div>`,
            "Products",
          ),
        },
        {
          name: "A trail with the state on the parent link",
          rationale:
            "The trail carries the parent's state, so a reader knows whether the product they are inside is still live before they read anything else. The trail becomes informative rather than structural.",
          tradeoff:
            "Fluent truncates a trail item at 80 characters, and a product name plus a state badge plus an ellipsis is three things in eighty characters. The breadcrumb stops being a navigation control.",
          html: shell(
            "Price tier",
            `<div class="page" style="max-width:600px">
  ${trail("Home", "Products", PRODUCT.name, "Standard")}
  <div class="phead">
    <div><h1>Standard ${badgeRaw("Active", "positive")}</h1><p class="desc">In stock · 412 ready to ship. 1,204 orders.</p></div>
    <div class="acts"><button class="btn sm">Pause sales</button></div>
  </div>
  ${section("Details", facts([["Units per line", "1"], ["Sold", "9,412 of 10,000 stocked"]]))}
</div>`,
            "Products",
          ),
        },
        {
          name: "A trail with the area's other pages beside it",
          rationale:
            "The trail, then the sibling pages of this area as tabs. The reader can move sideways without going back to the sidebar.",
          tradeoff:
            "Two navigation mechanisms for the same tree: sibling pages of one area already have their own navigation, and this adds a second beside it.",
          html: shell(
            "Product",
            `<div class="page">
  ${trail("Home", "Products", PRODUCT.name)}
  <div class="phead">
    <div><h1>${PRODUCT.name} ${badgeRaw("Active", "positive")}</h1><p class="desc">${PRODUCT.sku} · 412 in stock.</p></div>
    <div class="acts"><button class="btn sm">Pause sales</button></div>
  </div>
  ${tabs(["Details", "Variants", "Pricing", "Stock", "Money", "Operations", "Orders", "Questions"], 2)}
  ${section("Pricing", `<table class="dt"><thead><tr><th scope="col">Tier</th><th scope="col" class="num">Sold</th><th scope="col" class="num">Price</th></tr></thead><tbody><tr><td><b>Standard</b></td><td class="num">1,182 of 2,000</td><td class="num">${MONEY.lamp}</td></tr></tbody></table>`, { flush: true })}
</div>`,
            "Products",
          ),
        },
        {
          name: "A trail that scrolls sideways rather than truncating",
          rationale:
            "Fluent allows a breadcrumb to scroll horizontally rather than wrap, so every level stays readable and the current item is reached by scrolling rather than by being cut off.",
          tradeoff:
            "The current item is off screen on arrival, which is the opposite of what a breadcrumb is for, and a horizontal scroll inside a page is easy to miss.",
          reference: "Fluent",
          html: shell(
            "Price tier",
            `<div class="page" style="max-width:600px">
  <div style="overflow-x:auto;scrollbar-width:thin">
    <nav class="trail" style="width:max-content;padding-bottom:3px">
      <a href="#">Home</a><span class="sep">›</span>
      <a href="#">Products</a><span class="sep">›</span>
      <a href="#">Oak desk lamp, natural oil finish with brass fittings</a><span class="sep">›</span>
      <a href="#">Standard, list price</a><span class="sep">›</span>
      <span aria-current="page" style="color:var(--foreground);font-weight:500">Pricing</span>
    </nav>
  </div>
  <div class="phead">
    <div><h1>Pricing</h1><p class="desc">Standard, list price. ${DELIVERY.name}.</p></div>
  </div>
  ${section("Pricing", `<div class="stmt"><div class="line"><span>Standard<span class="sub">9,412 sold of 10,000</span></span><span class="fig">${MONEY.lamp}</span></div></div>`)}
</div>`,
            "Products",
          ),
        },
        {
          name: "Back to the parent on a phone",
          width: "phone",
          rationale:
            "GitHub collapses its trail to a single back link on narrow screens: the parent name with a chevron, above the heading. One line replaces four levels and the heading keeps its place.",
          tradeoff:
            "Grandparents are unreachable from the record, so a reader three levels deep walks up one level at a time. The full chain remains only on desktop.",
          reference: "GitHub",
          html: `<div class="shell" style="grid-template-columns:minmax(0,1fr)"><div class="main"><div class="bar"><span class="nv-glyph" style="font-weight:400">☰</span><span>Standard</span><span class="icons"><span style="opacity:.7">☼</span></span></div><div class="page"><a href="#" style="display:inline-flex;align-items:center;gap:4px;font-size:12px;color:var(--muted-foreground);text-decoration:none;margin-bottom:6px">‹ ${PRODUCT.name}</a><div class="phead"><div><h1>Standard ${badgeRaw("Active", "positive")}</h1><p class="desc">What this price tier is, and the discount rule its lines carry.</p></div><div class="acts"><button class="btn sm">Pause sales</button></div></div>${section("Details", facts([["Units per line", "1"], ["Sold", "9,412 of 10,000"]]))}</div></div></div>`,
        },
        {
          name: "The current title as a sibling menu",
          rationale:
            "Notion turns the current page title into a menu of its siblings: opening it lists the other price tiers beside Standard. Moving sideways costs one click instead of up and back down.",
          tradeoff:
            "A heading that opens a menu is a heading that does not behave like one, and the menu repeats the sidebar section the reader just left. It is justified only where siblings are visited together.",
          reference: "Notion",
          html: shell(
            "Standard",
            `<div class="page" style="max-width:600px">${trail("Home", "Products", PRODUCT.name, "Standard")}<div class="phead"><div><h1><button class="btn ghost" style="font-size:20px;font-weight:600;padding:0 6px;height:auto">Standard ▾</button> ${badgeRaw("Active", "positive")}</h1><p class="desc">What this price tier is, and the discount rule its lines carry.</p></div><div class="acts"><button class="btn sm">Pause sales</button></div></div><div style="position:relative"><div style="position:absolute;z-index:5;top:0;left:0">${menu([{ label: "Standard" }, { label: "Economy" }, { label: "Bundle" }, "-", { label: "Add a price tier" }], { width: "240px" })}</div>${section("Details", facts([["Units per line", "1"], ["Sold", "9,412 of 10,000"]]))}</div></div>`,
            "Products",
          ),
        },
      ],
    },
    {
      id: "nav-header",
      title: "The header bar",
      why: "The bar carries the page title, a sidebar toggle, a help control and the theme. It does not carry <b>the company name, who is acting, or where they are</b> beyond the page title.",
      verdict:
        "Keep the bar with the company name and the acting person added: a support conversation needs both facts before anything else, and the sidebar toggle is what opens the phone sheet. The deployment identity band is the runner-up for sandbox deployments only, where naming the deployment on every page avoids confusion with production. Never ship no bar at all: burying the theme and language in the sidebar foot turns a visible control into three taps.",
      variants: [
        {
          name: "The bar with the company name",
          pick: true,
          rationale:
            "The page title on the left, then the things that are true everywhere: which company, who is acting, help and theme. The sidebar toggle stays because a phone needs it.",
          tradeoff:
            "Four things in a bar above the content on every page, and a brand mark that repeats what the sidebar already says.",
          html: `<div class="shell">
  ${sidebar("Orders", false)}
  <div class="main">
    <div class="bar">
      <span style="opacity:.5;margin-right:2px">◫</span>
      <span>${COMPANY.name}</span>
      <span class="icons">
        <span style="font-weight:400;font-size:11.5px;color:var(--muted-foreground)">Acting as ${PEOPLE.manager.name}</span>
        <span style="opacity:.7">?</span>
        <span style="opacity:.7">◐</span>
        <span style="opacity:.7">☼</span>
      </span>
    </div>
    <div class="page">
      ${phead("Orders", "268 orders from 142 customers, newest first.", "", { crumb: trail("Home", "Orders") })}
      ${toolbar({ search: "", placeholder: "Order number, name or email", filters: ["Any state"] })}
      ${section(
        "",
        `<table class="dt dense"><thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col">State</th><th scope="col" class="num">Paid</th></tr></thead><tbody>
          ${[
            ["SO-1042", ORDER.customer, "Paid", "positive", MONEY.order],
            ["SO-1041", "Tom Becker", "Paid", "positive", "EUR 310.00"],
            ["SO-1040", "Elin Lindqvist", "Shipped", "neutral", MONEY.lamp],
          ].map(([no, who, st, tone, amt]) => `<tr><td><span class="code">${no}</span></td><td>${who}</td><td>${badgeRaw(st, tone, "outline")}</td><td class="num">${amt}</td></tr>`).join("")}
        </tbody></table>`,
        { flush: true },
      )}
    </div>
  </div>
</div>`,
        },
        {
          name: "The bar as the breadcrumb, replacing the trail",
          rationale:
            "The chain moves into the bar, where the page title already is. One place states where the reader is rather than two.",
          tradeoff:
            "The bar is present on every page including the list pages where there is no chain, so the bar has two different shapes. Fluent treats the breadcrumb as a page-level element below the header.",
          html: `<div class="shell">
  ${sidebar("Products", false)}
  <div class="main">
    <div class="bar">
      <span style="opacity:.5;margin-right:2px">◫</span>
      <span style="opacity:.5;font-weight:400;font-size:12px">Products</span>
      <span style="opacity:.5">›</span>
      <span style="opacity:.5;font-weight:400;font-size:12px">${PRODUCT.name}</span>
      <span style="opacity:.5">›</span>
      <span>Standard</span>
      <span class="icons"><span style="opacity:.7">?</span><span style="opacity:.7">◐</span><span style="opacity:.7">☼</span></span>
    </div>
    <div class="page">
      ${phead(`Standard ${badgeRaw("Active", "positive")}`, "What this price tier is, and the discount rule its lines carry.", '<button class="btn sm">Pause sales</button>')}
      ${section("Details", facts([["Units per line", "1"], ["Sold", "9,412 of 10,000"]]))}
    </div>
  </div>
</div>`,
        },
        {
          name: "A bar that carries nothing but the frame",
          rationale:
            "The bar holds only the sidebar toggle and the theme. Everything else is in the sidebar or the page, so the bar never competes with the content.",
          tradeoff:
            "The reader loses the company name and who they are acting as, which are the two facts a support conversation needs before anything else.",
          html: `<div class="shell">
  ${sidebar("Orders", false)}
  <div class="main">
    <div class="bar"><span class="icons" style="margin-left:auto"><span style="opacity:.7">◐</span><span style="opacity:.7">☼</span></span></div>
    <div class="page">
      ${phead("Orders", "268 orders from 142 customers, newest first.", "", { crumb: trail("Home", "Orders") })}
      ${toolbar({ search: "", placeholder: "Order number, name or email" })}
      ${section(
        "",
        `<table class="dt dense"><thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col">State</th><th scope="col" class="num">Paid</th></tr></thead><tbody>
          ${[
            ["SO-1042", ORDER.customer, "Paid", "positive", MONEY.order],
            ["SO-1041", "Tom Becker", "Paid", "positive", "EUR 310.00"],
          ].map(([no, who, st, tone, amt]) => `<tr><td><span class="code">${no}</span></td><td>${who}</td><td>${badgeRaw(st, tone, "outline")}</td><td class="num">${amt}</td></tr>`).join("")}
        </tbody></table>`,
        { flush: true },
      )}
    </div>
  </div>
</div>`,
        },
        {
          name: "The bar with a persona switcher, which is the same as being somebody else",
          rationale:
            "The foot switcher, moved into the bar and made explicit. Acting as somebody changes what the session can do, so it belongs where a reader looks for who they are.",
          tradeoff:
            "On a production deployment with one real account there is nothing to switch to, and a switcher that always lists one person is a control that cannot do anything.",
          html: `<div class="shell">
  ${sidebar("Orders", false).replace(/<div class="who">[\s\S]*?<\/div>\s*<\/nav>/, "</nav>")}
  <div class="main">
    <div class="bar">
      <span>Orders</span>
      <span class="icons">
        <span class="inline" style="gap:6px">
          <span style="width:20px;height:20px;border-radius:50%;background:var(--muted);display:grid;place-items:center;font-size:9px">${PEOPLE.manager.initials}</span>
          <span style="font-weight:400;font-size:12px">${PEOPLE.manager.name}</span>
          <span style="opacity:.6">▾</span>
        </span>
        <span style="opacity:.7">?</span><span style="opacity:.7">◐</span><span style="opacity:.7">☼</span>
      </span>
    </div>
    <div class="page">
      ${phead("Orders", "268 orders.", "", { crumb: trail("Home", "Orders") })}
      ${toolbar({ search: "", placeholder: "Order number, name or email" })}
      <div style="position:relative">
        ${section(
          "",
          `<table class="dt dense"><thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col">State</th><th scope="col" class="num">Paid</th></tr></thead><tbody>
            ${[
              ["SO-1042", ORDER.customer, "Paid", "positive", MONEY.order],
              ["SO-1041", "Tom Becker", "Paid", "positive", "EUR 310.00"],
            ].map(([no, who, st, tone, amt]) => `<tr><td><span class="code">${no}</span></td><td>${who}</td><td>${badgeRaw(st, tone, "outline")}</td><td class="num">${amt}</td></tr>`).join("")}
          </tbody></table>`,
          { flush: true },
        )}
        <div style="position:absolute;right:80px;top:26px">
          <div class="menu" style="width:230px">
            <div class="cap">Act as</div>
            ${[
              [PEOPLE.owner.name, "Owner · runs Acme Supply", true],
              [PEOPLE.manager.name, "Operations manager · orders and dispatch", false],
              [PEOPLE.finance.name, "Finance · refunds and disputes", false],
              [PEOPLE.warehouse.name, "Warehouse lead · runs dispatch", false],
            ]
              .map(([nm, role, on]) => `<div class="mi" aria-checked="${on}" style="${on ? "background:var(--muted)" : ""}"><span><b style="font-weight:500">${nm}</b><br><span style="font-size:11px;color:var(--muted-foreground)">${role}</span></span></div>`)
              .join("")}
            <div class="sep"></div>
            <div class="mi">Sign in as somebody else</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>`,
        },
        {
          name: "The bar with the deployment identity",
          rationale:
            "Where a deployment is a sandbox, the bar says so on every page. Naming the deployment is the one job of an identity band.",
          tradeoff:
            "A deployment identity in the bar competes with the page title for the same horizontal space, and a reader who has seen it fifty times stops seeing it.",
          html: `<div class="shell">
  ${sidebar("Orders", false)}
  <div class="main">
    <div class="bar">
      <span>Orders</span>
      <span class="icons">
        <span class="badge info">Sandbox</span>
        <span style="opacity:.7">?</span><span style="opacity:.7">◐</span><span style="opacity:.7">☼</span>
      </span>
    </div>
    <div class="page">
      ${phead("Orders", "Nothing here is charged and nothing reaches a bank.", "", { crumb: trail("Home", "Orders") })}
      ${toolbar({ search: "", placeholder: "Order number, name or email" })}
      ${section(
        "",
        `<table class="dt dense"><thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col">State</th><th scope="col" class="num">Paid</th></tr></thead><tbody>
          ${[
            ["SO-1042", ORDER.customer, "Paid", "positive", MONEY.order],
            ["SO-1041", "Tom Becker", "Paid", "positive", "EUR 310.00"],
          ].map(([no, who, st, tone, amt]) => `<tr><td><span class="code">${no}</span></td><td>${who}</td><td>${badgeRaw(st, tone, "outline")}</td><td class="num">${amt}</td></tr>`).join("")}
        </tbody></table>`,
        { flush: true },
      )}
    </div>
  </div>
</div>`,
        },
        {
          name: "No bar at all, with the theme and language in the sidebar foot",
          rationale:
            "The controls that change nothing about the data live with the account they belong to. The top of the page is then entirely the page's own.",
          tradeoff:
            "Three global controls become three taps on every visit, and removing the header landmark is a structural change rather than a preference.",
          html: `<div class="shell">
  ${sidebar("Orders", false).replace(
    /<div class="who">[\s\S]*?<\/div>/,
    `<div class="who" style="flex-direction:column;align-items:stretch;gap:6px">
      <span class="inline" style="gap:7px"><span style="width:22px;height:22px;border-radius:50%;background:var(--muted);display:grid;place-items:center;font-size:10px">${PEOPLE.manager.initials}</span><span>${PEOPLE.manager.name}<br><span style="color:var(--muted-foreground);font-size:10.5px">${PEOPLE.manager.role}</span></span></span>
      <span class="btnrow" style="gap:5px"><button class="btn xs" style="flex:1">English</button><button class="btn xs" style="flex:1">Light</button><button class="btn xs" style="flex:1">Help</button></span>
    </div>`,
  )}
  <div class="main">
    <div class="page" style="padding-top:16px">
      ${phead("Orders", "268 orders from 142 customers, newest first.", "", { crumb: trail("Home", "Orders") })}
      ${toolbar({ search: "", placeholder: "Order number, name or email", filters: ["Any state"] })}
      ${section(
        "",
        `<table class="dt dense"><thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col">State</th><th scope="col" class="num">Paid</th></tr></thead><tbody>
          ${[
            ["SO-1042", ORDER.customer, "Paid", "positive", MONEY.order],
            ["SO-1041", "Tom Becker", "Paid", "positive", "EUR 310.00"],
            ["SO-1040", "Elin Lindqvist", "Shipped", "neutral", MONEY.lamp],
          ].map(([no, who, st, tone, amt]) => `<tr><td><span class="code">${no}</span></td><td>${who}</td><td>${badgeRaw(st, tone, "outline")}</td><td class="num">${amt}</td></tr>`).join("")}
        </tbody></table>`,
        { flush: true },
      )}
    </div>
  </div>
</div>`,
        },
        {
          name: "Search, inbox and account in the bar",
          rationale:
            "GitHub keeps one global bar: a search trigger that opens the palette, a bell with the unread count, and the account avatar. Everything true on every page sits in one row and the page starts below it.",
          tradeoff:
            "Three global controls compete with the page title for the same row, and on a phone the bar keeps only the menu glyph and the bell. The account moves to the sheet.",
          reference: "GitHub",
          html: `<div class="shell">${sidebar("Orders", false)}<div class="main"><div class="bar nv-bar"><span>Orders</span><span class="icons"><button class="btn sm" style="height:26px;font-weight:400;color:var(--muted-foreground)">⌕ Search <span style="font-size:10.5px;border:1px solid var(--border);border-radius:4px;padding:0 4px">⌘K</span></button>${nvBell(3)}<span style="width:24px;height:24px;border-radius:50%;background:var(--muted);display:grid;place-items:center;font-size:10px">${PEOPLE.manager.initials}</span></span></div><div class="page">${phead("Orders", "268 orders from 142 customers, newest first.", "", { crumb: trail("Home", "Orders") })}${toolbar({ search: "", placeholder: "Order number, name or email", filters: ["Any state"] })}${section("", `<table class="dt dense"><thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col">State</th><th scope="col" class="num">Paid</th></tr></thead><tbody>${[["SO-1042", ORDER.customer, "Paid", "positive", MONEY.order], ["SO-1041", "Tom Becker", "Paid", "positive", "EUR 310.00"], ["SO-1040", "Elin Lindqvist", "Shipped", "neutral", MONEY.lamp]].map(([no, who, st, tone, amt]) => `<tr><td><span class="code">${no}</span></td><td>${who}</td><td>${badgeRaw(st, tone, "outline")}</td><td class="num">${amt}</td></tr>`).join("")}</tbody></table>`, { flush: true })}</div></div></div>`,
        },
        {
          name: "The record name and state in the bar on a record page",
          rationale:
            "Linear keeps the record identifier and state in the header once a record is open, so a reader who scrolled past the heading still knows which record is on screen. The bar names the record; the page carries the detail.",
          tradeoff:
            "The bar then has two shapes, one for lists and one for records, and the record shape repeats the heading word for word. It is worth the height only on long records.",
          reference: "Linear",
          html: `<div class="shell">${sidebar("Orders", false)}<div class="main"><div class="bar"><a href="#" style="font-weight:400;text-decoration:none;color:var(--muted-foreground)">‹ Orders</a><span class="code">SO-1042</span>${badgeRaw("Paid", "positive")}<span class="icons"><span style="opacity:.7">?</span><span style="opacity:.7">☼</span></span></div><div class="page">${phead("SO-1042 " + badgeRaw("Paid", "positive"), ORDER.customer + " · Garcia Interiors · " + ORDER.placed + " · " + MONEY.order, '<button class="btn primary sm">Message customer</button>', { crumb: trail("Home", "Orders", "SO-1042") })}${section("The order at a glance", `<div class="split" style="align-items:baseline"><span>Paid by the customer<span class="sub">This payment method, 8 Oct 2026, 09:34</span></span><span class="fig" style="font-weight:600">${MONEY.order}</span></div>`)}${section("Lines", `<div class="rlist">${recordRow({ title: PRODUCT.name, sub: PRODUCT.sku + " · quantity 2", fig: MONEY.lineTotal })}${recordRow({ title: "Delivery", sub: "Courier · tracked", fig: MONEY.shipping })}</div>`)}</div></div></div>`,
        },
      ],
    },
    {
      id: "nav-tabs",
      title: "Tabs within a page",
      why: "Sibling pages of one area sit in <b>a sub-page navigation; a second tab row uses a subordinate level</b>. Tabs are capped at about six, and the active tab belongs in the URL.",
      verdict:
        "Keep the tab row with the active tab in the URL: a pasted link carries the facet, and the row sits where every tab implementation puts it. Tabs as real links are the runner-up and the most defensible alternative, since middle click and the back button then behave as expected; prefer them where each facet is its own route. Never ship the segmented control for facets: three segments is its ceiling and it cannot carry counts or overflow.",
      variants: [
        {
          name: "The shipped tab row, with the tab in the URL",
          pick: true,
          rationale:
            "The tab row under the header on a price tier, with the active tab as a URL parameter, so a pasted link carries it.",
          tradeoff:
            "A reader cannot compare two facets, and every new backend facet adds a tab. Carbon and GOV.UK both cap tabs at about six for this reason.",
          html: shell(
            "Standard",
            `<div class="page" style="max-width:620px">
  ${trail("Home", "Products", PRODUCT.name, "Standard")}
  <div class="phead">
    <div><h1>Standard ${badgeRaw("Active", "positive")}</h1><p class="desc">What this price tier is, and the discount rule its lines carry.</p></div>
    <div class="acts"><button class="btn sm">Pause sales</button></div>
  </div>
  ${tabs(["Pricing", "Availability", "Returns", "Details"], 3)}
  ${section("Details", facts([["Units per line", "1"], ["Stock", "Whole product"]]))}
</div>`,
            "Products",
          ),
        },
        {
          name: "Tabs carrying counts",
          rationale:
            "Each tab carries how many things are in it, so a reader knows whether a facet is worth opening. Four tabs where one holds 9,412 and another holds 0.",
          tradeoff:
            "A count of 0 invites a click that leads to an empty state, and a count has to be a read per tab rather than a number in a template.",
          html: shell(
            "Product",
            `<div class="page" style="max-width:620px">
  ${trail("Home", "Products", PRODUCT.name)}
  <div class="phead">
    <div><h1>${PRODUCT.name} ${badgeRaw("Active", "positive")}</h1><p class="desc">${PRODUCT.sku} · 412 in stock</p></div>
    <div class="acts"><button class="btn primary sm">Add a variant</button></div>
  </div>
  ${tabs(["Details", "Variants 2", "Price tiers 3", "Returns 0", "Questions 4"], 1)}
  ${section(
    "Variants",
    `<table class="dt"><thead><tr><th scope="col">Variant</th><th scope="col" class="num">Sold</th><th scope="col" class="num">Price</th><th scope="col">State</th></tr></thead><tbody>
      <tr><td><b>Standard</b></td><td class="num">9,412 of 10,000</td><td class="num">${MONEY.lamp}</td><td>${badgeRaw("Active", "positive", "outline")}</td></tr>
      <tr><td><b>Bundle</b></td><td class="num">1,800 of 2,000</td><td class="num">${MONEY.lineTotal}</td><td>${badgeRaw("Active", "positive", "outline")}</td></tr>
    </tbody></table>`,
    { flush: true },
  )}
</div>`,
            "Products",
          ),
        },
        {
          name: "Tabs below the summary, as a sub-page navigation",
          rationale:
            "The summary stays on screen, and the sibling pages of this area become a tab row at a subordinate level beneath it.",
          tradeoff:
            "The tab row is lower on the page and a reader has to scroll to reach it, so on a long record the facets are below the fold.",
          html: shell(
            "Order",
            `<div class="page">
  ${trail("Home", "Orders", ORDER.number)}
  <div class="phead">
    <div><h1>${ORDER.number} ${badgeRaw("Paid", "positive")}</h1><p class="desc">${ORDER.customer} · ${ORDER.company} · ${ORDER.placed} · ${MONEY.order}</p></div>
    <div class="acts"><button class="btn primary sm">Message customer</button></div>
  </div>
  ${section("The order at a glance", `<div class="split" style="align-items:baseline"><span>Paid by the customer<span class="sub">This payment method, 8 Oct 2026, 09:34</span></span><span class="fig" style="font-weight:600">${MONEY.order}</span></div>`, { flush: false })}
  <div class="tabs" role="tablist" style="margin-top:14px"><button role="tab" aria-selected="true">Lines</button><button role="tab" aria-selected="false">Payment</button><button role="tab" aria-selected="false">Refunds</button><button role="tab" aria-selected="false">Messages</button></div>
  ${section(
    "Lines",
    `<div class="rlist">
      ${recordRow({ title: PRODUCT.name, sub: `${PRODUCT.sku} · quantity 2`, state: { label: "Ready", tone: "info" }, actions: '<button class="btn sm">Refund</button>' })}
      ${recordRow({ title: "Linen armchair", sub: "CHR-LIN-02 · quantity 1", state: { label: "Ready", tone: "info" }, actions: '<button class="btn sm">Refund</button>' })}
      ${recordRow({ title: "Delivery", sub: "Courier · tracked", state: { label: "Scheduled", tone: "info" } })}
    </div>`,
  )}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Tabs as links, so a middle click works",
          rationale:
            "The tab labels are real links to sibling routes rather than buttons that swap a panel. Middle click, open in a new tab, and the back button all behave the way a reader expects.",
          tradeoff:
            "GOV.UK's own tabs implementation is exactly this, anchor links with a URL fragment, so this is the most defensible option available rather than an alternative.",
          reference: "GOV.UK",
          html: shell(
            "Product",
            `<div class="page">
  ${trail("Home", "Products", PRODUCT.name)}
  <div class="phead">
    <div><h1>${PRODUCT.name} ${badgeRaw("Active", "positive")}</h1><p class="desc">${PRODUCT.sku} · 412 in stock</p></div>
    <div class="acts"><button class="btn primary sm">Add a variant</button></div>
  </div>
  <div style="border-bottom:1px solid var(--border);margin-bottom:14px">
    <nav class="inline" style="gap:2px;margin:0">
      <a href="#" style="padding:8px 11px;font-size:12.5px;color:var(--muted-foreground);text-decoration:none">Details</a>
      <a href="#" aria-current="page" style="padding:8px 11px;font-size:12.5px;font-weight:600;border-bottom:2px solid var(--foreground);text-decoration:none;margin-bottom:-1px">Pricing</a>
      <a href="#" style="padding:8px 11px;font-size:12.5px;color:var(--muted-foreground);text-decoration:none">Stock</a>
      <a href="#" style="padding:8px 11px;font-size:12.5px;color:var(--muted-foreground);text-decoration:none">Money</a>
      <a href="#" style="padding:8px 11px;font-size:12.5px;color:var(--muted-foreground);text-decoration:none">Operations</a>
    </nav>
  </div>
  ${section("Pricing", `<div class="stmt"><div class="line"><span>Standard<span class="sub">9,412 sold of 10,000</span></span><span class="fig">${MONEY.lamp}</span></div></div>`, { desc: "The content of the current tab, on its own route." })}
</div>`,
            "Products",
          ),
        },
        {
          name: "A segmented control instead of tabs",
          rationale:
            "Where the choice is between two or three views of the same data rather than different pages, a segmented control is the right control. Carbon names the content switcher for exactly this.",
          tradeoff:
            "A segmented control cannot hold a count, cannot overflow, and says nothing about being on a different page. Three segments is its ceiling.",
          reference: "Carbon",
          html: shell(
            "Warehouse",
            `<div class="page" style="max-width:620px">
  ${trail("Home", "Settings", "Warehouses", "Amsterdam warehouse")}
  <div class="phead">
    <div><h1>Amsterdam warehouse ${badgeRaw("Active", "positive")}</h1><p class="desc">40 pallets, general storage.</p></div>
    <div class="acts"><button class="btn primary sm">Add a bay</button></div>
  </div>
  ${segmented(["Bays 4", "Capacity", "Details"], 0)}
  ${section(
    "Bays",
    `<div class="rlist">
      ${recordRow({ title: "Bay A", sub: "4 docks · open from 08:00", state: { label: "Active", tone: "positive" }, actions: '<button class="btn sm">Edit</button>' })}
      ${recordRow({ title: "Bay B", sub: "2 docks · staff only", state: { label: "Active", tone: "positive" }, actions: '<button class="btn sm">Edit</button>' })}
      ${recordRow({ title: "Receiving", sub: "No docks set", state: { label: "Draft", tone: "neutral" }, actions: '<button class="btn sm">Edit</button>' })}
    </div>`,
    { desc: "Where goods come in, and how many docks each has." },
  )}
</div>`,
            "Settings",
          ),
        },
        {
          name: "No tabs, because the facets are a checklist",
          rationale:
            "Where a record has a handful of facets and they all fit, headed sections on one page. GOV.UK names this as the first-class alternative to tabs and it is the right answer for most records.",
          tradeoff:
            "A long page. It stays honest only while the sections stay few, and it is why a record with eight facets carries tabs rather than eight sections.",
          reference: "GOV.UK",
          html: shell(
            "Warehouse",
            `<div class="page" style="max-width:620px">
  ${trail("Home", "Settings", "Warehouses", "Amsterdam warehouse")}
  <div class="phead">
    <div><h1>Amsterdam warehouse ${badgeRaw("Active", "positive")}</h1><p class="desc">40 pallets, general storage.</p></div>
    <div class="acts"><button class="btn primary sm">Add a bay</button></div>
  </div>
  ${section("What it is", facts([["Name", "Amsterdam warehouse"], ["Capacity", "40 pallets"], ["Time zone", "Europe/Amsterdam"], ["Company", COMPANY.name]]))}
  ${section(
    "Bays",
    `<div class="rlist">
      ${recordRow({ title: "Bay A", sub: "4 docks · open from 08:00", state: { label: "Active", tone: "positive" }, actions: '<button class="btn sm">Edit</button>' })}
      ${recordRow({ title: "Bay B", sub: "2 docks · staff only", state: { label: "Active", tone: "positive" }, actions: '<button class="btn sm">Edit</button>' })}
    </div>`,
    { desc: "Where goods come in, and how many docks each has." },
  )}
  ${section("Which deliveries use it", `<div class="rlist">${recordRow({ title: DELIVERY.name, sub: "Sat 14 Mar 2026 · 40 pallets", actions: '<button class="btn sm">Open</button>' })}</div>`, { desc: "1 delivery." })}
</div>`,
            "Settings",
          ),
        },
        {
          name: "Overflow tabs in a More menu",
          rationale:
            "GitHub Primer moves overflowing tabs into a menu rather than scrolling the row, so the first five facets stay visible and the rest sit one click away. Eight delivery sections fit a row built for five.",
          tradeoff:
            "A reader cannot see which facet is current when it sits inside the menu, so the More control has to carry the current label too. The menu also needs the same counts the row would have shown.",
          reference: "GitHub Primer",
          html: shell(
            "Delivery",
            `<div class="page">${trail("Home", "Orders", DELIVERY.name)}<div class="phead"><div><h1>${DELIVERY.name} ${badgeRaw("Scheduled", "info")}</h1><p class="desc">Sat 14 Mar 2026 · Amsterdam warehouse</p></div><div class="acts"><button class="btn primary sm">Add an item</button></div></div><div style="position:relative"><div class="tabs" role="tablist"><button role="tab" aria-selected="false">Details</button><button role="tab" aria-selected="true">Items</button><button role="tab" aria-selected="false">Schedule</button><button role="tab" aria-selected="false">Dispatch</button><button role="tab" aria-selected="false">Money</button><button role="tab" aria-selected="false">More ▾</button></div><div style="position:absolute;right:0;top:36px;z-index:5">${menu([{ label: "Operations" }, { label: "Orders" }, { label: "Notes" }])}</div></div>${section("Items", `<table class="dt"><thead><tr><th scope="col">Item</th><th scope="col" class="num">Units</th><th scope="col" class="num">Price</th><th scope="col">State</th></tr></thead><tbody><tr><td><b>${PRODUCT.name}</b></td><td class="num">200 units</td><td class="num">${MONEY.lamp}</td><td>${badgeRaw("Ready", "info", "outline")}</td></tr><tr><td><b>Linen armchair</b></td><td class="num">40 units</td><td class="num">${MONEY.lineTotal}</td><td>${badgeRaw("Ready", "info", "outline")}</td></tr></tbody></table>`, { flush: true })}</div>`,
            "Orders",
          ),
        },
        {
          name: "Vertical tabs on a settings page",
          rationale:
            "Stripe settings put the sections in a vertical list beside the content, so six sections read as a short index rather than a wide row. The current section stays visible while its fields scroll.",
          tradeoff:
            "The list spends horizontal space on every section page, and on a phone it stacks above the content where it reads as a second heading. It fits settings, not records.",
          reference: "Stripe",
          html: shell(
            "Warehouses",
            `<div class="page">${trail("Home", "Settings", "Warehouses")}${phead("Warehouses", "3 sites with a dispatch plan.", '<button class="btn primary sm">Add a warehouse</button>')}${twoCol(`<nav class="nv-vtabs" aria-label="Settings sections"><a href="#">General</a><a href="#" aria-current="page">Warehouses</a><a href="#">Payments</a><a href="#">Policies</a><a href="#">Team</a><a href="#">Roles</a></nav>`, section("Warehouses", `<div class="rlist">${recordRow({ title: "Amsterdam warehouse", sub: "40 pallets · general storage", state: { label: "Active", tone: "positive" }, actions: '<button class="btn sm">Edit</button>' })}${recordRow({ title: "Rotterdam warehouse", sub: "80 pallets · 2 bays", state: { label: "Active", tone: "positive" }, actions: '<button class="btn sm">Edit</button>' })}${recordRow({ title: "Utrecht warehouse", sub: "20 pallets · no dispatch plan yet", state: { label: "Draft", tone: "neutral" }, actions: '<button class="btn sm">Edit</button>' })}</div>`, { desc: "Where stock is held, and the dispatch plan each carries." }), { ratio: "180px minmax(0,1fr)" })}</div>`,
            "Settings",
          ),
        },
      ],
    },
    {
      id: "nav-icons",
      title: "The icons in the frame",
      why: "Seven area icons, a sidebar toggle, a help mark and the theme. A page never writes a raw interactive element, so <b>every one of these is a component</b> with a name and an accessible label.",
      verdict:
        "Keep an icon beside every label, drawn from one icon set: seven areas need a visual catch, and the icon reinforces the label rather than replacing it. Words-only areas with icon-only actions are the runner-up where icon budget is short, with each action carrying a tooltip and an accessible name. Never ship state-carrying icons in the frame: theme and language as bare glyphs force the reader to hover both to tell them apart.",
      variants: [
        {
          name: "An icon beside every label",
          pick: true,
          rationale:
            "Every area carries an icon and its name, so the icon is reinforcement rather than the only label. It is what makes seven areas easy to read at a glance.",
          tradeoff:
            "Seven icons is seven drawings to keep consistent and to give a name to. Carbon's tab guidance refuses icons in tab labels for the same reason.",
          html: `<div class="shell">
  <nav>
    <span class="brand" style="padding:4px 6px 10px;font-size:12.5px"><span class="brand-mark" style="width:20px;height:20px;font-size:9px;display:inline-grid;vertical-align:middle;margin-right:5px">A</span>${COMPANY.name}</span>
    ${[
      ["Home", "◫", true],
      ["Orders", "▥", false],
      ["Customers", "◉", false],
      ["Products", "◈", false],
      ["Invoices", "▭", false],
      ["Reports", "▦", false],
      ["Settings", "⚙", false],
    ]
      .map(([nm, ico, on]) => `<a href="#"${on ? ' aria-current="page"' : ""}><span style="width:12px;display:inline-block;text-align:center;opacity:.55">${ico}</span>${nm}</a>`)
      .join("")}
    <span class="grow"></span>
    <a href="#"><span style="width:12px;display:inline-block;text-align:center;opacity:.55">?</span>Help</a>
    <div class="who"><span style="width:22px;height:22px;border-radius:50%;background:var(--muted);display:grid;place-items:center;font-size:10px">${PEOPLE.manager.initials}</span><span>${PEOPLE.manager.name}<br><span style="color:var(--muted-foreground);font-size:10.5px">${PEOPLE.manager.role}</span></span></div>
  </nav>
  <div class="main">
    ${bar("Home")}
    <div class="page">
      ${phead("Good afternoon, Alex", "Two things need you today.", '<button class="btn primary sm">New order</button>', { crumb: trail("Home") })}
      ${section(
        "Needs attention",
        `<div class="alist">
          <div class="arow"><span class="why" aria-hidden="true">◷</span><span class="txt"><b>Close out the March stock count</b><small>The count ended. Nothing left to settle.</small></span><span class="go"><button class="btn sm">Close out</button></span></div>
        </div>`,
        { acts: '<span class="badge caution">2 to do</span>' },
      )}
    </div>
  </div>
</div>`,
        },
        {
          name: "Words only, no icons",
          rationale:
            "The labels are the navigation. Nothing to draw, nothing to name, and nothing that fails when a reader cannot distinguish the icons.",
          tradeoff:
            "Seven areas of the same weight in the same style is a wall of text, and the eye has nothing to catch on. This is the shape that needs a bold current item to work.",
          html: `<div class="shell">
  <nav style="padding-left:12px;padding-right:8px">
    <span class="brand" style="padding:4px 6px 10px;font-size:12.5px">${COMPANY.name}</span>
    ${["Home", "Orders", "Customers", "Products", "Invoices", "Reports", "Settings"]
      .map((nm, i) => `<a href="#"${i === 0 ? ' aria-current="page" style="font-weight:600"' : ""}>${nm}</a>`)
      .join("")}
    <span class="grow"></span>
    <a href="#">Help</a>
    <div class="who"><span>${PEOPLE.manager.name}<br><span style="color:var(--muted-foreground);font-size:10.5px">${PEOPLE.manager.role}</span></span></div>
  </nav>
  <div class="main">
    ${bar("Home")}
    <div class="page">
      ${phead("Good afternoon, Alex", "Two things need you today.", '<button class="btn primary sm">New order</button>', { crumb: trail("Home") })}
      ${section(
        "Needs attention",
        `<div class="alist">
          <div class="arow"><span class="why" aria-hidden="true">◷</span><span class="txt"><b>Close out the March stock count</b><small>The count ended. Nothing left to settle.</small></span><span class="go"><button class="btn sm">Close out</button></span></div>
        </div>`,
        { acts: '<span class="badge caution">2 to do</span>' },
      )}
    </div>
  </div>
</div>`,
        },
        {
          name: "Icons with labels, and the label hidden on a phone",
          width: "phone",
          rationale:
            "On a phone the sidebar is a page of words; inside the collapsed frame the icons carry the seven areas and the labels are gone. The same component, two densities.",
          tradeoff:
            "An icon-only sidebar on a phone is seven drawings with no labels, which is the case Carbon refuses in tab labels. It works only if the phone also keeps the labels somewhere.",
          html: `<div class="shell" style="grid-template-columns:44px minmax(0,1fr)">
  <nav style="padding:10px 5px;align-items:center">
    <span class="brand-mark" style="margin:0 auto 10px">A</span>
    ${["◫", "▥", "◉", "◈", "▭", "▦", "⚙"]
      .map((ico, i) => `<a href="#" aria-label="${["Home", "Orders", "Customers", "Products", "Invoices", "Reports", "Settings"][i]}"${i === 0 ? ' aria-current="page"' : ""} style="justify-content:center"><span style="opacity:${i === 0 ? 1 : 0.55}">${ico}</span></a>`)
      .join("")}
    <span class="grow"></span>
    <a href="#" aria-label="Help" style="justify-content:center">?</a>
  </nav>
  <div class="main">
    <div class="bar"><span>${PEOPLE.manager.name}</span><span class="icons"><span style="opacity:.7">☼</span></span></div>
    <div class="page" style="padding:12px">
      ${phead("Good afternoon, Alex", "Two things need you today.")}
      ${section(
        "Needs attention",
        `<div class="alist">
          <div class="arow" style="flex-wrap:wrap"><span class="why" aria-hidden="true">◷</span><span class="txt" style="flex:1 1 100%;margin-bottom:5px"><b>Close out the March stock count</b><small>The count ended.</small></span><button class="btn sm w-full">Close out</button></div>
        </div>`,
        { acts: '<span class="badge caution">2</span>' },
      )}
    </div>
  </div>
</div>`,
        },
        {
          name: "A section of the sidebar with a heading",
          rationale:
            "Seven areas become two or three headed groups: what you sell, what it makes, how it is set up. The grouping is about the job rather than the object.",
          tradeoff:
            "Grouping an area tree by job means a reader has to decide which group an area is in, and grouping by object is the convention everywhere else in the product.",
          html: `<div class="shell">
  <nav>
    <span class="brand" style="padding:4px 6px 10px;font-size:12.5px">${COMPANY.name}</span>
    <div style="font-size:10.5px;text-transform:uppercase;letter-spacing:.06em;color:var(--muted-foreground);padding:8px 7px 3px">Today</div>
    <a href="#" aria-current="page">Home</a>
    <div style="font-size:10.5px;text-transform:uppercase;letter-spacing:.06em;color:var(--muted-foreground);padding:9px 7px 3px">What you sell</div>
    <a href="#">Orders</a><a href="#">Customers</a><a href="#">Products</a>
    <div style="font-size:10.5px;text-transform:uppercase;letter-spacing:.06em;color:var(--muted-foreground);padding:9px 7px 3px">What it makes</div>
    <a href="#">Invoices</a><a href="#">Reports</a>
    <div style="font-size:10.5px;text-transform:uppercase;letter-spacing:.06em;color:var(--muted-foreground);padding:9px 7px 3px">How it is set up</div>
    <a href="#">Settings</a>
    <span class="grow"></span>
    <a href="#">Help</a>
    <div class="who"><span style="width:22px;height:22px;border-radius:50%;background:var(--muted);display:grid;place-items:center;font-size:10px">${PEOPLE.manager.initials}</span><span>${PEOPLE.manager.name}<br><span style="color:var(--muted-foreground);font-size:10.5px">${PEOPLE.manager.role}</span></span></div>
  </nav>
  <div class="main">
    ${bar("Orders")}
    <div class="page">
      ${phead("Orders", "268 orders.", "", { crumb: trail("Home", "Orders") })}
      ${section(
        "",
        `<table class="dt dense"><thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col">State</th><th scope="col" class="num">Paid</th></tr></thead><tbody>
          ${[
            ["SO-1042", ORDER.customer, "Paid", "positive", MONEY.order],
            ["SO-1041", "Tom Becker", "Paid", "positive", "EUR 310.00"],
          ].map(([no, who, st, tone, amt]) => `<tr><td><span class="code">${no}</span></td><td>${who}</td><td>${badgeRaw(st, tone, "outline")}</td><td class="num">${amt}</td></tr>`).join("")}
        </tbody></table>`,
        { flush: true },
      )}
    </div>
  </div>
</div>`,
        },
        {
          name: "Icons only for the actions, words only for the areas",
          rationale:
            "The split the evidence supports: an icon reinforces a labelled area, but an icon alone is never the label for a place. An action with one obvious meaning can be an icon with a tooltip and an accessible name.",
          tradeoff:
            "An action that has to be learned has to be hovered, and Material's rule is one action per notification and no Dismiss, which is the same economy applied to a button.",
          html: `<div class="shell">
  <nav>
    <span class="brand" style="padding:4px 6px 10px;font-size:12.5px">${COMPANY.name}</span>
    ${["Home", "Orders", "Customers", "Products", "Invoices", "Reports", "Settings"]
      .map((nm, i) => `<a href="#"${i === 1 ? ' aria-current="page"' : ""}>${nm}</a>`)
      .join("")}
    <span class="grow"></span>
    <a href="#">Help</a>
    <div class="who"><span>${PEOPLE.manager.name}<br><span style="color:var(--muted-foreground);font-size:10.5px">${PEOPLE.manager.role}</span></span></div>
  </nav>
  <div class="main">
    <div class="bar">
      <span>Orders</span>
      <span class="icons">
        <span style="position:relative"><button class="btn sm icon" aria-label="Search">⌕</button><span class="tip" style="position:absolute;right:0;top:34px;white-space:nowrap">Search orders <kbd>⌘K</kbd></span></span>
        <span style="position:relative"><button class="btn sm icon" aria-label="Export">↓</button><span class="tip" style="position:absolute;right:0;top:34px;white-space:nowrap">Export as CSV</span></span>
        <span style="position:relative"><button class="btn sm icon" aria-label="Theme">☼</button><span class="tip" style="position:absolute;right:0;top:34px;white-space:nowrap">Light or dark</span></span>
      </span>
    </div>
    <div class="page">
      ${phead("Orders", "268 orders from 142 customers, newest first.", "", { crumb: trail("Home", "Orders") })}
      ${toolbar({ search: "", placeholder: "Order number, name or email", filters: ["Any state"] })}
      ${section(
        "",
        `<table class="dt dense">
          <thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col">State</th><th scope="col" class="num">Paid</th><th scope="col" style="width:1%"></th></tr></thead>
          <tbody>
            ${[
              ["SO-1042", ORDER.customer, "Paid", "positive", MONEY.order],
              ["SO-1041", "Tom Becker", "Paid", "positive", "EUR 310.00"],
              ["SO-1040", "Elin Lindqvist", "Shipped", "neutral", MONEY.lamp],
            ]
              .map(
                ([no, who, st, tone, amt]) => `<tr>
              <td><span class="code">${no}</span></td><td>${who}</td><td>${badgeRaw(st, tone, "outline")}</td><td class="num">${amt}</td>
              <td style="width:1%"><span style="position:relative"><button class="btn sm icon" aria-label="More actions for order ${no}">⋯</button></span></td>
            </tr>`,
              )
              .join("")}
          </tbody>
        </table>`,
        { flush: true },
      )}
    </div>
  </div>
</div>`,
        },
        {
          name: "Icons that carry a state as well as a meaning",
          rationale:
            "The theme and the language are icons because they have one obvious meaning and no label worth the width. The company name is not an icon because it has to be read.",
          tradeoff:
            "Theme and language are two icons whose meaning is only conventional, and a reader who has not used one cannot tell them apart without hovering both.",
          html: `<div class="shell">
  ${sidebar("Orders", false)}
  <div class="main">
    <div class="bar">
      <span>Orders</span>
      <span class="icons">
        <span class="inline" style="gap:5px">
          <button class="btn xs" aria-label="Language: English">EN</button>
          <button class="btn xs" aria-label="Theme: light">☼</button>
          <button class="btn xs" aria-label="Help">?</button>
        </span>
      </span>
    </div>
    <div class="page">
      ${phead("Orders", "268 orders.", "", { crumb: trail("Home", "Orders") })}
      ${section(
        "",
        `<table class="dt dense"><thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col">State</th><th scope="col" class="num">Paid</th></tr></thead><tbody>
          ${[
            ["SO-1042", ORDER.customer, "Paid", "positive", MONEY.order],
            ["SO-1041", "Tom Becker", "Paid", "positive", "EUR 310.00"],
          ].map(([no, who, st, tone, amt]) => `<tr><td><span class="code">${no}</span></td><td>${who}</td><td>${badgeRaw(st, tone, "outline")}</td><td class="num">${amt}</td></tr>`).join("")}
        </tbody></table>`,
        { flush: true },
      )}
    </div>
  </div>
</div>`,
        },
        {
          name: "The current item with a left indicator bar",
          rationale:
            "VS Code marks the current view with a border beside the label rather than an icon, so the eye finds it without reading. The bar sits outside the label, which keeps words-only areas easy to read at a glance.",
          tradeoff:
            "A two-pixel bar is easy to miss on a long sidebar, and it says nothing on a phone where the sidebar is closed. The trail still has to carry the current page.",
          reference: "VS Code",
          html: `<div class="shell"><nav><span class="brand" style="padding:4px 6px 10px;font-size:12.5px">${COMPANY.name}</span>${["Home", "Orders", "Customers", "Products", "Invoices", "Reports", "Settings"].map((nm, i) => `<a href="#"${i === 1 ? ' aria-current="page" style="box-shadow:inset 2px 0 0 var(--foreground)"' : ""}>${nm}</a>`).join("")}<span class="grow"></span><a href="#">Help</a><div class="who"><span>${PEOPLE.manager.name}<br><span style="color:var(--muted-foreground);font-size:10.5px">${PEOPLE.manager.role}</span></span></div></nav><div class="main">${bar("Orders")}<div class="page">${phead("Orders", "268 orders from 142 customers, newest first.", "", { crumb: trail("Home", "Orders") })}${section("Needs attention", `<div class="alist">${actionRow("31 refunds need a decision", "The 180-day window closes on 5 of them this week.", "Decide", "⚑")}</div>`, { acts: '<span class="badge caution">1 to do</span>' })}</div></div></div>`,
        },
        {
          name: "Lucide icons at one size, from one set",
          rationale:
            "Icons from the Lucide set at 16 px with a 2 px stroke, so every area icon comes from one set at one size and no two disagree on weight. One set is what keeps seven drawings consistent.",
          tradeoff:
            "Fourteen pixels leaves no room for detail, so each glyph has to read as a silhouette. A new area needs a new drawing that fits the set.",
          reference: "Lucide",
          html: `<div class="shell"><nav><span class="brand" style="padding:4px 6px 10px;font-size:12.5px">${COMPANY.name}</span>${NV_ICONS.map(([nm, paths], i) => `<a href="#"${i === 0 ? ' aria-current="page"' : ""}><span style="display:inline-flex;opacity:${i === 0 ? 1 : 0.6}">${nvSvg(paths)}</span>${nm}</a>`).join("")}<span class="grow"></span><a href="#"><span style="display:inline-flex;opacity:.6">${nvSvg('<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.4 2.3c-.8.3-.9 1-.9 1.7"/><circle cx="12" cy="17" r=".5"/>')}</span>Help</a><div class="who"><span style="width:22px;height:22px;border-radius:50%;background:var(--muted);display:grid;place-items:center;font-size:10px">${PEOPLE.manager.initials}</span><span>${PEOPLE.manager.name}<br><span style="color:var(--muted-foreground);font-size:10.5px">${PEOPLE.manager.role}</span></span></div></nav><div class="main">${bar("Home")}<div class="page">${phead("Good afternoon, Alex", "Two things need you today.", '<button class="btn primary sm">New order</button>', { crumb: trail("Home") })}${section("Needs attention", `<div class="alist">${actionRow("Close out the March stock count", "The count ended. Nothing left to settle.", "Close out", "◷")}</div>`, { acts: '<span class="badge caution">2 to do</span>' })}</div></div></div>`,
        },
      ],
    },
    {
      id: "nav-language",
      title: "Language and theme",
      why: "Two switches that change nothing about the data and are therefore the easiest things to get wrong: an explicit choice is preferred to the account's, which is correct, and <b>a missing translation falls back to the other language</b> on several pages.",
      verdict:
        "Keep both switches in the header, each showing its value: the reader sees what is set without opening anything, and the theme is one tap at the end of a shift. The account menu is the runner-up for language only, since language rarely changes and the menu groups it with the account it belongs to. Never ship no switch at all: one language is a commercial decision about which companies the product serves, not a UI simplification, and the product already serves companies in two languages.",
      variants: [
        {
          name: "Both switches in the header, each showing its value",
          pick: true,
          rationale:
            "Each control carries its current value rather than an icon, so the reader can see what is set without opening it.",
          tradeoff:
            "Two text buttons in a header of text, and a reader who wants to change the language twice a day reads 'EN' as decoration.",
          html: `<div class="shell">
  ${sidebar("Orders", false)}
  <div class="main">
    <div class="bar">
      <span>Orders</span>
      <span class="icons">
        <span class="inline" style="gap:5px">
          <select class="fsel" style="height:26px;font-size:11.5px;width:78px"><option selected>English</option><option>Nederlands</option></select>
          <select class="fsel" style="height:26px;font-size:11.5px;width:78px"><option selected>Light</option><option>Dark</option></select>
        </span>
      </span>
    </div>
    <div class="page">
      ${phead("Orders", "268 orders.", "", { crumb: trail("Home", "Orders") })}
      ${section(
        "",
        `<table class="dt dense"><thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col">State</th><th scope="col" class="num">Paid</th></tr></thead><tbody>
          ${[
            ["SO-1042", ORDER.customer, "Paid", "positive", MONEY.order],
            ["SO-1041", "Tom Becker", "Paid", "positive", "EUR 310.00"],
            ["SO-1040", "Elin Lindqvist", "Shipped", "neutral", MONEY.lamp],
          ].map(([no, who, st, tone, amt]) => `<tr><td><span class="code">${no}</span></td><td>${who}</td><td>${badgeRaw(st, tone, "outline")}</td><td class="num">${amt}</td></tr>`).join("")}
        </tbody></table>`,
        { flush: true },
      )}
    </div>
  </div>
</div>`,
        },
        {
          name: "Both switches in the account menu",
          rationale:
            "Everything about who you are and how the product looks sits in one place, and the header is left for the page title. Account, language, theme and sign-out are one decision.",
          tradeoff:
            "Two taps for a reader who only wants to switch to dark at the end of a shift, and the theme is not something a reader goes to an account menu to find.",
          html: `<div class="shell">
  ${sidebar("Orders", false).replace(/<div class="who">[\s\S]*?<\/div>\s*<\/nav>/, "</nav>")}
  <div class="main">
    <div class="bar">
      <span>Orders</span>
      <span class="icons">
        <span class="inline" style="gap:6px">
          <span style="width:20px;height:20px;border-radius:50%;background:var(--muted);display:grid;place-items:center;font-size:9px">${PEOPLE.manager.initials}</span>
          <span style="opacity:.6">▾</span>
        </span>
      </span>
    </div>
    <div class="page">
      ${phead("Orders", "268 orders.", "", { crumb: trail("Home", "Orders") })}
      ${toolbar({ search: "", placeholder: "Order number, name or email" })}
      <div style="position:relative">
        ${section(
          "",
          `<table class="dt dense"><thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col">State</th><th scope="col" class="num">Paid</th></tr></thead><tbody>
            ${[
              ["SO-1042", ORDER.customer, "Paid", "positive", MONEY.order],
              ["SO-1041", "Tom Becker", "Paid", "positive", "EUR 310.00"],
            ].map(([no, who, st, tone, amt]) => `<tr><td><span class="code">${no}</span></td><td>${who}</td><td>${badgeRaw(st, tone, "outline")}</td><td class="num">${amt}</td></tr>`).join("")}
          </tbody></table>`,
          { flush: true },
        )}
        <div style="position:absolute;right:16px;top:24px">
          <div class="menu" style="width:220px">
            <div class="cap">${PEOPLE.manager.name} · ${COMPANY.name}</div>
            <div class="mi">Your account</div>
            <div class="mi">Sign out</div>
            <div class="sep"></div>
            <div class="cap">Language</div>
            <div class="mi" aria-checked="true">English</div>
            <div class="mi">Nederlands</div>
            <div class="sep"></div>
            <div class="cap">Theme</div>
            <div class="mi" aria-checked="true">Light</div>
            <div class="mi">Dark</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>`,
        },
        {
          name: "The theme following the system, with an override",
          rationale:
            "The theme defaults to the operating system's and the reader overrides it once. The preference is kept, and the switch shows the override rather than the system's value.",
          tradeoff:
            "A reader whose system is dark gets a dark console without asking, which is right, and a company filming a screen for a customer then gets a dark screenshot.",
          html: `<div class="shell">
  ${sidebar("Orders", false)}
  <div class="main">
    <div class="bar">
      <span>Orders</span>
      <span class="icons">
        <span class="badge neutral" style="height:20px;font-size:10.5px">System theme</span>
        <select class="fsel" style="height:26px;font-size:11.5px;width:104px"><option selected>Match my device</option><option>Light</option><option>Dark</option></select>
      </span>
    </div>
    <div class="page">
      ${phead("Orders", "268 orders.", "", { crumb: trail("Home", "Orders") })}
      ${section(
        "",
        `<table class="dt dense"><thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col">State</th><th scope="col" class="num">Paid</th></tr></thead><tbody>
          ${[
            ["SO-1042", ORDER.customer, "Paid", "positive", MONEY.order],
            ["SO-1041", "Tom Becker", "Paid", "positive", "EUR 310.00"],
            ["SO-1040", "Elin Lindqvist", "Shipped", "neutral", MONEY.lamp],
            ["SO-1039", "Ade Okafor", "Paid", "positive", MONEY.lamp],
          ].map(([no, who, st, tone, amt]) => `<tr><td><span class="code">${no}</span></td><td>${who}</td><td>${badgeRaw(st, tone, "outline")}</td><td class="num">${amt}</td></tr>`).join("")}
        </tbody></table>`,
        { flush: true },
      )}
    </div>
  </div>
</div>`,
        },
        {
          name: "A language choice made once, on the account",
          rationale:
            "The account holds the language, so the console has no switch at all. The account page is where a preference that never changes belongs.",
          tradeoff:
            "A company whose colleague changes the account language changes it for everyone. And a reader who cannot find the switch cannot say they do not speak it.",
          html: shell(
            "Account",
            `<div class="page" style="max-width:520px">
  ${trail("Home", "Account")}
  <div class="phead"><div><h1>Your account</h1><p class="desc">${PEOPLE.manager.name} · ${COMPANY.name}</p></div></div>
  ${section(
    "",
    `<div class="form">
      ${field("Email", input("alex@acme-supply.example"), { required: true, help: "Where sign-in and invitation messages go." })}
      ${field("Language", '<select class="sel"><option selected>English</option><option>Nederlands</option></select>', { help: "The language every page is written in. This is your account, so it applies on every device." })}
      <div class="callout">Every page is available in English and Nederlands. A refusal's sentence is translated with the page.</div>
      <div class="btnrow end" style="border-top:1px solid var(--border);padding-top:12px"><button class="btn primary">Save</button></div>
    </div>`,
  )}
</div>`,
            "Settings",
          ),
        },
        {
          name: "The theme in the sidebar foot, with the language",
          rationale:
            "Both live with the account they belong to, at the foot of the frame, and the header keeps only the page title. Fewer things in the header.",
          tradeoff:
            "The foot of a 900-pixel sidebar is a long way from the top of the page, and on a phone the sidebar is a page the reader has to open to reach either control.",
          html: `<div class="shell">
  ${sidebar("Orders", false).replace(
    /<div class="who">[\s\S]*?<\/div>/,
    `<div style="border-top:1px solid var(--sidebar-border);padding:8px 6px 2px;display:flex;flex-direction:column;gap:7px">
      <span class="inline" style="gap:7px"><span style="width:22px;height:22px;border-radius:50%;background:var(--muted);display:grid;place-items:center;font-size:10px">${PEOPLE.manager.initials}</span><span style="font-size:11.5px">${PEOPLE.manager.name}<br><span style="color:var(--muted-foreground);font-size:10.5px">${PEOPLE.manager.role}</span></span></span>
      <span class="btnrow" style="gap:5px"><select class="fsel" style="flex:1;height:26px;font-size:11px"><option selected>English</option><option>Nederlands</option></select><select class="fsel" style="flex:1;height:26px;font-size:11px"><option selected>Light</option><option>Dark</option></select></span>
    </div>`,
  )}
  <div class="main">
    ${bar("Orders")}
    <div class="page">
      ${phead("Orders", "268 orders.", "", { crumb: trail("Home", "Orders") })}
      ${section(
        "",
        `<table class="dt dense"><thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col">State</th><th scope="col" class="num">Paid</th></tr></thead><tbody>
          ${[
            ["SO-1042", ORDER.customer, "Paid", "positive", MONEY.order],
            ["SO-1041", "Tom Becker", "Paid", "positive", "EUR 310.00"],
          ].map(([no, who, st, tone, amt]) => `<tr><td><span class="code">${no}</span></td><td>${who}</td><td>${badgeRaw(st, tone, "outline")}</td><td class="num">${amt}</td></tr>`).join("")}
        </tbody></table>`,
        { flush: true },
      )}
    </div>
  </div>
</div>`,
        },
        {
          name: "No switch at all, because the company is in one country",
          rationale:
            "Dutch only. One language, one currency, one tax regime, and no reader has to choose anything about how the console looks or reads.",
          tradeoff:
            "The product already serves companies in two languages. One language is a real commercial decision, not a UI one.",
          html: `<div class="shell">
  ${sidebar("Orders", false)}
  <div class="main">
    ${bar("Bestellingen")}
    <div class="page">
      ${phead("Bestellingen", "268 bestellingen van 142 klanten, nieuwste eerst.", "", { crumb: trail("Start", "Bestellingen") })}
      ${toolbar({ search: "", placeholder: "Bestelnummer, naam of e-mail", filters: ["Elke staat"] })}
      ${section(
        "",
        `<table class="dt dense"><thead><tr><th scope="col">Bestelling</th><th scope="col">Klant</th><th scope="col">Staat</th><th scope="col" class="num">Betaald</th></tr></thead><tbody>
          ${[
            ["SO-1042", ORDER.customer, "Betaald", "positive", "EUR 125,00"],
            ["SO-1041", "Tom Becker", "Betaald", "positive", "EUR 310,00"],
            ["SO-1040", "Elin Lindqvist", "Verzonden", "neutral", "EUR 45,00"],
          ].map(([no, who, st, tone, amt]) => `<tr><td><span class="code">${no}</span></td><td>${who}</td><td>${badgeRaw(st, tone, "outline")}</td><td class="num">${amt}</td></tr>`).join("")}
        </tbody></table>`,
        { flush: true },
      )}
    </div>
  </div>
</div>`,
        },
        {
          name: "Theme on the device, language on the account",
          rationale:
            "Vercel keeps theme as a device-level choice with the system as the default, while language stays on the account. Each switch lives where its value lives, so neither pretends to be the other.",
          tradeoff:
            "Two placements to learn instead of one, and a reader looking for language in the theme menu finds a pointer rather than the switch. The pointer has to name the account page plainly.",
          reference: "Vercel",
          html: `<div class="shell">${sidebar("Orders", false)}<div class="main"><div class="bar"><span>Orders</span><span class="icons"><button class="btn sm" style="height:26px;font-weight:400">◐ Theme: System ▾</button></span></div><div class="page">${phead("Orders", "268 orders.", "", { crumb: trail("Home", "Orders") })}<div style="position:relative">${section("", `<table class="dt dense"><thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col">State</th><th scope="col" class="num">Paid</th></tr></thead><tbody>${[["SO-1042", ORDER.customer, "Paid", "positive", MONEY.order], ["SO-1041", "Tom Becker", "Paid", "positive", "EUR 310.00"]].map(([no, who, st, tone, amt]) => `<tr><td><span class="code">${no}</span></td><td>${who}</td><td>${badgeRaw(st, tone, "outline")}</td><td class="num">${amt}</td></tr>`).join("")}</tbody></table>`, { flush: true })}<div style="position:absolute;right:8px;top:8px">${menu([{ label: "Match my device", icon: "✓" }, { label: "Light" }, { label: "Dark" }, "-", { label: "Language: English, on your account" }], { width: "250px" })}</div></div></div></div></div>`,
        },
        {
          name: "The browser language offered once",
          rationale:
            "Atlassian offers the browser language once on first sign-in rather than guessing silently: a banner names what was detected and asks. Accepting sets the account language; refusing dismisses the offer for good.",
          tradeoff:
            "A reader who shares a device answers for the next reader too, and the offer has to remember it was refused. One refusal must dismiss it for good.",
          reference: "Atlassian",
          html: shell(
            "Home",
            `<div class="page">${callout("info", `<div class="inline" style="justify-content:space-between"><span>Your browser is set to Nederlands. Switch the console to match it?</span><span class="btnrow"><button class="btn sm">Switch to Nederlands</button><button class="btn sm ghost">Keep English</button></span></div>`)}<div style="height:12px"></div>${phead("Good afternoon, Alex", "Two things need you today.", '<button class="btn primary sm">New order</button>', { crumb: trail("Home") })}${section("Needs attention", `<div class="alist">${actionRow("Close out the March stock count", "The count ended. Nothing left to settle.", "Close out", "◷")}${actionRow("31 refunds need a decision", "The 180-day window closes on 5 of them this week.", "Decide", "⚑")}</div>`, { acts: '<span class="badge caution">2 to do</span>' })}</div>`,
            "Home",
          ),
        },
      ],
    },
    {
      id: "nav-palette",
      title: "The command palette",
      floorplan: "work-page",
      why: "An operations manager working a list often needs one record or one command and then the list again. The palette jumps straight to the order for Garcia Interiors or runs its next step from the keyboard, so the reader never loses the page they were working.",
      verdict:
        "Keep the grouped Cmd+K dialog: pages above records answers both where to go and what to open, and the footer hints teach the keyboard without a help page. Recent items first is the runner-up for warehouse and support work that moves between a few records, but recency is personal state that reads wrong on a shared machine. Never ship command verbs with a preview as the default palette: every verb becomes a second path to a use case with its own permission and refusal wording to keep.",
      compact: {
        option: "The palette as a bottom sheet on a phone",
        behaviour: "On a phone the palette opens as a bottom sheet where the thumb reaches the input, with recent records above the fold.",
      },
      variants: [
        {
          name: "Cmd+K dialog with grouped results",
          pick: true,
          rationale:
            "One dialog over the current page, with pages above records, so a typed query answers both where to go and what to open. The groups keep the list short enough to read while the query is still short.",
          tradeoff:
            "Grouped results compete for the same short list, so a page the reader wants can sit below records they do not.",
          html: shell(
            "Orders",
            `<div class="page">` +
              phead("Orders", "Every paid order, newest first.", "", { crumb: trail("Home", "Orders") }) +
              `</div>` +
              dialog(
                "Jump to",
                input("", { placeholder: "Search pages, orders, products" }) +
                  section("Go to", menu([{ label: "Orders" }, { label: "Products" }])) +
                  section(
                    "Orders",
                    recordRow({ title: ORDER.number, sub: ORDER.customer, state: STATES.paid, fig: MONEY.order }) +
                      recordRow({ title: DELIVERY.name, sub: COMPANY.name, state: STATES.scheduled }),
                  ),
                { desc: COMPANY.name, footer: tip("Move", ["Up", "Down"]) + tip("Open", ["Enter"]) },
              ),
            "Orders",
          ),
        },
        {
          name: "Search scoped to current area",
          rationale:
            "The scope starts on the area the reader is already in, so typing an order number on the orders page searches orders first. Widening to everything is one explicit step.",
          tradeoff:
            "A scoped default hides matches elsewhere, so a reader who mistakes the scope concludes a record is missing.",
          html: shell(
            "Orders",
            `<div class="page">` +
              phead("Orders", "Every paid order, newest first.", "", { crumb: trail("Home", "Orders") }) +
              `</div>` +
              dialog(
                "Jump to",
                segmented(["Orders", "Everything"], 0) +
                  input("", { placeholder: "Search orders" }) +
                  section("Orders", recordRow({ title: ORDER.number, sub: ORDER.customer, state: STATES.paid, fig: MONEY.order })),
                { desc: COMPANY.name, footer: tip("Scope", ["Tab"]) + tip("Open", ["Enter"]) },
              ),
            "Orders",
          ),
        },
        {
          name: "Recent items first",
          rationale:
            "Recent records sit above the groups before anything is typed, so returning to the order just left is one keypress. Recency matches how warehouse and support work moves between a few records.",
          tradeoff:
            "Recency is personal state on a shared machine, so the next person at the keyboard sees what the last person opened.",
          html: shell(
            "Orders",
            `<div class="page">` +
              phead("Orders", "Every paid order, newest first.", "", { crumb: trail("Home", "Orders") }) +
              `</div>` +
              dialog(
                "Jump to",
                input("", { placeholder: "Search pages, orders, products" }) +
                  section(
                    "Recent",
                    recordRow({ title: ORDER.number, sub: ORDER.customer, state: STATES.paid, fig: MONEY.order }) +
                      recordRow({ title: DELIVERY.name, sub: COMPANY.name, state: STATES.scheduled }),
                  ) +
                  section("Go to", menu([{ label: "Orders" }, { label: "Products" }])),
                { desc: COMPANY.name, footer: tip("Open", ["Enter"]) },
              ),
            "Orders",
          ),
        },
        {
          name: "Command verbs with preview",
          rationale:
            "Verbs sit beside the records they act on, with the record preview beside the verb, so acting on the open order never needs a visit to its page first. The preview confirms the right record before the verb runs.",
          tradeoff:
            "Every verb in the palette is a second path to a use case, so each one needs the same permission and refusal wording as its page.",
          html: shell(
            "Orders",
            `<div class="page">` +
              phead("Orders", "Every paid order, newest first.", "", { crumb: trail("Home", "Orders") }) +
              `</div>` +
              dialog(
                "Run a command",
                input("", { placeholder: "Type a command or search" }) +
                  twoCol(
                    menu([{ label: "Open order" }, { label: "Refund order" }]),
                    facts([
                      ["Order", ORDER.number],
                      ["Customer", ORDER.customer],
                      ["Total", MONEY.order],
                    ]),
                  ),
                { desc: COMPANY.name, footer: tip("Run", ["Enter"]) },
              ),
            "Orders",
          ),
        },
        {
          name: "No-results state",
          rationale:
            "An explicit empty state names the scope that was searched, so no match reads as a fact about the query rather than a broken search. The reader can edit the query without leaving the dialog.",
          tradeoff:
            "A named scope in the empty state repeats wording the dialog already shows, so the state reads twice on a narrow dialog.",
          html: shell(
            "Orders",
            `<div class="page">` +
              phead("Orders", "Every paid order, newest first.", "", { crumb: trail("Home", "Orders") }) +
              `</div>` +
              dialog(
                "Jump to",
                input("zzz", { placeholder: "Search pages, orders, products" }) + emptyState("No matches", "Nothing in " + COMPANY.name + " matches.", ""),
                { desc: COMPANY.name, footer: tip("Close", ["Esc"]) },
              ),
            "Orders",
          ),
        },
        {
          name: "Keyboard-only operation with visible hints",
          rationale:
            "Every action shows its key beside the row or in the footer, so the whole palette works without a pointer and says so. Hints stay visible rather than hiding behind a help key.",
          tradeoff:
            "Visible hints take a row of the dialog on every state, so the results list shows one fewer row than it could.",
          html: shell(
            "Orders",
            `<div class="page">` +
              phead("Orders", "Every paid order, newest first.", "", { crumb: trail("Home", "Orders") }) +
              `</div>` +
              dialog(
                "Jump to",
                input("", { placeholder: "Search pages, orders, products" }) + menu([{ label: ORDER.number, shortcut: "Enter" }, { label: DELIVERY.name, shortcut: "Enter" }]),
                { desc: COMPANY.name, footer: tip("Move", ["Up", "Down"]) + tip("Open", ["Enter"]) + tip("Close", ["Esc"]) },
              ),
            "Orders",
          ),
        },
        {
          name: "A verb first, then the record",
          rationale:
            "Raycast asks for the verb before the record, so the palette is a command runner rather than a search box. Typing narrows three hundred commands to one, and the record picker confirms what the verb acts on.",
          tradeoff:
            "Two steps for a jump that search does in one, and every verb becomes a second path to a use case with its own permission and refusal wording to keep.",
          reference: "Raycast",
          html: shell(
            "Orders",
            `<div class="page">` +
              phead("Orders", "Every paid order, newest first.", "", { crumb: trail("Home", "Orders") }) +
              `</div>` +
              dialog(
                "Run a command",
                input("Refund", { placeholder: "Type a command or search" }) +
                  `<div style="height:10px"></div>` +
                  menu([{ label: "Refund order" }, { label: "Message customer" }, { label: "Pause sales" }]) +
                  `<p class="note tight" style="margin-top:10px">Pick the record the verb acts on next.</p>`,
                { desc: COMPANY.name, footer: tip("Run", ["Enter"]) + tip("Back", ["Esc"]) },
              ),
            "Orders",
          ),
        },
        {
          name: "The palette as a bottom sheet on a phone",
          width: "phone",
          rationale:
            "Linear opens the palette as a bottom sheet on a phone, where the thumb reaches the input. The recent records sit above the fold of the sheet, so returning to the order just left is one tap.",
          tradeoff:
            "The sheet covers the list it came from, and a phone keyboard leaves room for three rows at most. It answers jumps, not browsing.",
          reference: "Linear",
          html: `<div class="shell" style="grid-template-columns:minmax(0,1fr)"><div class="main"><div class="bar"><span class="nv-glyph" style="font-weight:400">☰</span><span>Orders</span><span class="icons"><span style="opacity:.7">☼</span></span></div><div class="page">${phead("Orders", "268 orders.", "")}${section("", `<div class="rlist">${recordRow({ title: "SO-1042 · " + ORDER.customer, sub: "8 Oct 2026, 09:32 · Garcia Interiors", state: { label: "Paid", tone: "positive" }, fig: MONEY.order })}</div>`)}</div></div></div><div class="nv-hsheet"><div class="nv-grab"></div>${input("", { placeholder: "Search pages, orders, products" })}<div style="height:10px"></div><div class="rlist">${recordRow({ title: ORDER.number, sub: ORDER.customer, state: STATES.paid, fig: MONEY.order })}${recordRow({ title: DELIVERY.name, sub: COMPANY.name, state: STATES.scheduled })}</div></div>`,
        },
      ],
    },
    {
      id: "nv-account",
      title: "The account menu",
      why: "The frame names <b>who is acting, for which company, with what access</b>. The account sits at the foot of the sidebar with a way to switch identity beside it on a development deployment.",
      verdict:
        "Put the avatar menu in the header: one control holds the account page, the access statement and sign-out, and it matches Linear and Vercel so nobody has to learn it. The sidebar foot is the runner-up, but the foot is far from the top of a long page and out of reach without opening the sheet on a phone. Never ship the bare sign-out link: an account with no page turns language, sessions and closing into support messages.",
      variants: [
        {
          name: "The account in the sidebar foot",
          rationale:
            "The foot names the acting person and role on every page, and opening it switches identity on a development deployment.",
          tradeoff:
            "The foot of a long sidebar is far from the top of the page, and on a phone the whole account hides inside the sheet. The bar says nothing about who is acting.",
          html: shell(
            "Orders",
            `<div class="page">${phead("Orders", "268 orders from 142 customers, newest first.", "", { crumb: trail("Home", "Orders") })}${toolbar({ search: "", placeholder: "Order number, name or email", filters: ["Any state"] })}${section("", `<table class="dt dense"><thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col">State</th><th scope="col" class="num">Paid</th></tr></thead><tbody>${[["SO-1042", ORDER.customer, "Paid", "positive", MONEY.order], ["SO-1041", "Tom Becker", "Paid", "positive", "EUR 310.00"]].map(([no, who, st, tone, amt]) => `<tr><td><span class="code">${no}</span></td><td>${who}</td><td>${badgeRaw(st, tone, "outline")}</td><td class="num">${amt}</td></tr>`).join("")}</tbody></table>`, { flush: true })}</div>`,
            "Orders",
          ),
        },
        {
          name: "An avatar menu in the header",
          pick: true,
          rationale:
            "Linear and Vercel both put the account in the header: one avatar holds the account page, the preferences and sign-out. The acting person is visible on every page without scrolling to the foot.",
          tradeoff:
            "The header gains a control on every page, and the menu repeats the sidebar foot it replaces during the transition. The foot still needs a sign-out for readers who look there first.",
          reference: "Linear",
          html: `<div class="shell">${sidebar("Orders", false)}<div class="main"><div class="bar"><span>Orders</span><span class="icons"><span class="inline" style="gap:6px"><span style="width:22px;height:22px;border-radius:50%;background:var(--muted);display:grid;place-items:center;font-size:10px">${PEOPLE.manager.initials}</span><span style="opacity:.6">▾</span></span></span></div><div class="page">${phead("Orders", "268 orders.", "", { crumb: trail("Home", "Orders") })}<div style="position:relative">${section("", `<table class="dt dense"><thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col">State</th><th scope="col" class="num">Paid</th></tr></thead><tbody>${[["SO-1042", ORDER.customer, "Paid", "positive", MONEY.order], ["SO-1041", "Tom Becker", "Paid", "positive", "EUR 310.00"]].map(([no, who, st, tone, amt]) => `<tr><td><span class="code">${no}</span></td><td>${who}</td><td>${badgeRaw(st, tone, "outline")}</td><td class="num">${amt}</td></tr>`).join("")}</tbody></table>`, { flush: true })}<div style="position:absolute;right:8px;top:8px">${menu([{ label: PEOPLE.manager.name + " · " + PEOPLE.manager.role }, "-", { label: "Your account" }, { label: "Your access" }, "-", { label: "Language: English" }, { label: "Theme: Light" }, "-", { label: "Sign out" }], { width: "250px" })}</div></div></div></div></div>`,
        },
        {
          name: "The account as a page, reached from the menu",
          rationale:
            "The navigation already lists account, email, sign-in and close as pages, so the menu only has to open one of them. Each page does one job and says what changes.",
          tradeoff:
            "Four pages for one account is a tree of its own, and closing an account sits two levels from anywhere. The menu has to name the right page, not just the account.",
          html: shell(
            "Account",
            `<div class="page" style="max-width:600px">${trail("Home", "Account")}${phead("Your account", PEOPLE.manager.name + " · " + COMPANY.name, "")}${section("Details", facts([["Name", PEOPLE.manager.name], ["Email", "alex@acme-supply.example"], ["Company", COMPANY.name], ["Role", PEOPLE.manager.role]]))}<div style="height:12px"></div>${section("Manage", `<div class="rlist">${recordRow({ title: "Email address", sub: "Where sign-in and invitation messages go", actions: '<button class="btn sm">Edit</button>' })}${recordRow({ title: "Sign-in", sub: "Password and active sessions", actions: '<button class="btn sm">Manage</button>' })}${recordRow({ title: "Close account", sub: "Removes access after open work is handed over", actions: '<button class="btn sm">Request</button>' })}</div>`)}</div>`,
            "Home",
          ),
        },
        {
          name: "The menu states what the role can do",
          rationale:
            "A refusal at the moment of clicking is the worst place to learn what a role allows. Stating access in the menu teaches it before the click, in the reader's own words.",
          tradeoff:
            "Access stated in prose drifts from access enforced in code, so the menu has to render from the same permission read the commands check. A second source drifts from the first.",
          html: `<div class="shell">${sidebar("Orders", false)}<div class="main"><div class="bar"><span>Orders</span><span class="icons"><span class="inline" style="gap:6px"><span style="width:22px;height:22px;border-radius:50%;background:var(--muted);display:grid;place-items:center;font-size:10px">${PEOPLE.manager.initials}</span><span style="opacity:.6">▾</span></span></span></div><div class="page">${phead("Orders", "268 orders.", "", { crumb: trail("Home", "Orders") })}<div style="position:relative">${section("", `<table class="dt dense"><thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col">State</th><th scope="col" class="num">Paid</th></tr></thead><tbody><tr><td><span class="code">SO-1042</span></td><td>${ORDER.customer}</td><td>${badgeRaw("Paid", "positive", "outline")}</td><td class="num">${MONEY.order}</td></tr></tbody></table>`, { flush: true })}<div style="position:absolute;right:8px;top:8px"><div class="menu" style="width:250px"><div class="cap">${PEOPLE.manager.name} · ${PEOPLE.manager.role}</div><div class="cap">You can</div><div class="mi"><span aria-hidden="true" style="opacity:.6">✓</span>View and message orders</div><div class="mi"><span aria-hidden="true" style="opacity:.6">✓</span>Book dispatches</div><div class="cap">Only Finance can</div><div class="mi"><span aria-hidden="true" style="opacity:.6">—</span>Issue refunds</div><div class="mi"><span aria-hidden="true" style="opacity:.6">—</span>Answer disputes</div><div class="sep"></div><div class="mi">Sign out</div></div></div></div></div></div></div>`,
        },
        {
          name: "A persona switcher, on development only",
          rationale:
            "Seeded personas exist so a developer can stand where each role stands. Naming the deployment and the persona in the menu keeps a screenshot honest about whose eyes saw it.",
          tradeoff:
            "A switcher that ships to production lets anyone act as anyone, so it must hide behind the development flag with no setting to enable it elsewhere. The menu is the part that reaches production first.",
          html: `<div class="shell">${sidebar("Orders", false)}<div class="main"><div class="bar"><span>Orders</span><span class="icons"><span class="badge info">Sandbox</span><span class="inline" style="gap:6px"><span style="width:22px;height:22px;border-radius:50%;background:var(--muted);display:grid;place-items:center;font-size:10px">${PEOPLE.manager.initials}</span><span style="opacity:.6">▾</span></span></span></div><div class="page">${phead("Orders", "Nothing here is charged and nothing reaches a bank.", "", { crumb: trail("Home", "Orders") })}<div style="position:relative">${section("", `<table class="dt dense"><thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col">State</th><th scope="col" class="num">Paid</th></tr></thead><tbody><tr><td><span class="code">SO-1042</span></td><td>${ORDER.customer}</td><td>${badgeRaw("Paid", "positive", "outline")}</td><td class="num">${MONEY.order}</td></tr></tbody></table>`, { flush: true })}<div style="position:absolute;right:8px;top:8px">${menu([{ label: "Act as · development only" }, "-", { label: PEOPLE.owner.name + " · Owner", icon: "✓" }, { label: PEOPLE.manager.name + " · Operations manager" }, { label: PEOPLE.finance.name + " · Finance" }, { label: PEOPLE.warehouse.name + " · Warehouse lead" }], { width: "260px" })}</div></div></div></div></div>`,
        },
        {
          name: "No menu: a sign-out link in the foot",
          rationale:
            "One account, one company, one link. Nothing to open, nothing to prefer, and sign-out is always visible.",
          tradeoff:
            "An account with no page has nowhere to put language, sessions or closing, so each of those becomes a support message instead. Never ship this where more than one person administers a company.",
          html: `<div class="shell">${sidebar("Orders", false).replace(/<div class="who">[\s\S]*?<\/div>/, `<a href="#">Sign out ${PEOPLE.manager.name}</a>`)}<div class="main">${bar("Orders")}<div class="page">${phead("Orders", "268 orders.", "", { crumb: trail("Home", "Orders") })}${section("", `<table class="dt dense"><thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col">State</th><th scope="col" class="num">Paid</th></tr></thead><tbody><tr><td><span class="code">SO-1042</span></td><td>${ORDER.customer}</td><td>${badgeRaw("Paid", "positive", "outline")}</td><td class="num">${MONEY.order}</td></tr></tbody></table>`, { flush: true })}</div></div></div>`,
        },
      ],
    },
    {
      id: "nv-inbox",
      title: "The notification inbox",
      why: "Refunds, disputes, invitations and warehouse incidents all need somebody <b>who was looking elsewhere</b>. The console lists them under Needs attention on Home and nowhere else.",
      verdict:
        "Put a bell with a dropdown panel in the header: the count is visible on every page and the panel answers what changed without leaving the list being worked. The inbox page is the runner-up for support days with dozens of items, where triage needs filters rather than a dropdown. Never ship no notifications: polling seven areas by hand is how a dispute deadline is missed.",
      compact: {
        option: "The unread first, in a phone sheet",
        behaviour: "On a phone notifications open as a bottom sheet, unread first, where the thumb reaches them.",
      },
      variants: [
        {
          name: "Needs attention on the Home page",
          rationale:
            "One list on the first page after sign-in, ordered by what needs doing now, with each row carrying the step that deals with it.",
          tradeoff:
            "Home is one page among many, so a reader working a list all day never sees it. Anything urgent waits for a visit that may not come.",
          html: shell(
            "Home",
            `<div class="page">${phead("Good afternoon, Alex", "Three things need you today.", '<button class="btn primary sm">New order</button>', { crumb: trail("Home") })}${section("Needs attention", `<div class="alist">${actionRow("A dispute was opened on order SO-1041", "Tom Becker · opened 2 hours ago · answers in 5 days", "Answer", "⚑")}${actionRow("31 refunds need a decision", "The 180-day window closes on 5 of them this week.", "Decide", "◷")}${actionRow("Chris Novak accepted the warehouse lead invitation", "The warehouse team is complete for the March deliveries.", "View team", "✓")}</div>`, { acts: '<span class="badge caution">3 to do</span>' })}</div>`,
            "Home",
          ),
        },
        {
          name: "A bell in the header with a dropdown panel",
          pick: true,
          rationale:
            "GitHub puts the count where the eye already is and the list one click away, without leaving the page being worked. The panel answers what changed; the inbox page behind it answers the rest.",
          tradeoff:
            "Three unread is a glance; thirty is a dropdown that needs its own filters. The panel must stay a summary and hand over to the inbox page past a handful.",
          reference: "GitHub",
          html: `<div class="shell">${sidebar("Orders", false)}<div class="main"><div class="bar"><span>Orders</span><span class="icons">${nvBell(3)}<span style="opacity:.7">☼</span></span></div><div class="page">${phead("Orders", "268 orders.", "", { crumb: trail("Home", "Orders") })}<div style="position:relative">${section("", `<table class="dt dense"><thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col">State</th><th scope="col" class="num">Paid</th></tr></thead><tbody><tr><td><span class="code">SO-1042</span></td><td>${ORDER.customer}</td><td>${badgeRaw("Paid", "positive", "outline")}</td><td class="num">${MONEY.order}</td></tr></tbody></table>`, { flush: true })}<div style="position:absolute;right:8px;top:8px;width:320px;max-width:calc(100% - 16px)"><div class="nv-panel"><div class="inline" style="justify-content:space-between;padding:9px 12px;border-bottom:1px solid var(--border)"><b style="font-size:12.5px">Notifications</b><span style="font-size:11.5px;color:var(--muted-foreground)">Mark all read</span></div><div class="rlist">${recordRow({ title: "A dispute was opened on order SO-1041", sub: "Tom Becker · 2 hours ago", state: { label: "Disputed", tone: "destructive" } })}${recordRow({ title: "The refund window closes Friday on 5 orders", sub: "This payment method refunds only within 180 days", state: { label: "Closing", tone: "caution" } })}${recordRow({ title: "Chris Novak accepted the warehouse lead invitation", sub: "Team · yesterday", state: { label: "Done", tone: "neutral" } })}</div><div style="padding:8px 12px;border-top:1px solid var(--border);font-size:12px">Open inbox</div></div></div></div></div></div></div>`,
        },
        {
          name: "An inbox page with triage",
          rationale:
            "Linear treats notifications as a queue with its own page: filter by unread, act, mark read. A support day with dozens of items needs filters rather than a dropdown.",
          tradeoff:
            "A second queue beside Needs attention splits what needs doing across two pages. One of them has to own the ordering or they disagree.",
          reference: "Linear",
          html: shell(
            "Inbox",
            `<div class="page">${phead("Inbox", "4 unread across refunds, disputes and the team.", "", { crumb: trail("Home", "Inbox") })}${toolbar({ search: null, views: [{ label: "All 12" }, { label: "Unread 4", on: true }], right: '<button class="btn sm">Mark all read</button>' })}${section("", `<div class="rlist">${recordRow({ title: "A dispute was opened on order SO-1041", sub: "Tom Becker · answers in 5 days", state: { label: "Disputed", tone: "destructive" }, fig: "2h ago", actions: '<button class="btn sm">Answer</button>' })}${recordRow({ title: "The refund window closes Friday on 5 orders", sub: "Refunds · this payment method refunds only within 180 days", state: { label: "Closing", tone: "caution" }, fig: "5h ago", actions: '<button class="btn sm">Decide</button>' })}${recordRow({ title: "September closed", sub: "Invoices · EUR 122.85 arrived", state: { label: "Settled", tone: "positive" }, fig: "1d ago" })}${recordRow({ title: "Chris Novak accepted the warehouse lead invitation", sub: "Team · the warehouse team is complete", state: { label: "Done", tone: "neutral" }, fig: "1d ago" })}</div>`)}</div>`,
            "Home",
          ),
        },
        {
          name: "Email for the urgent, Home for the rest",
          rationale:
            "Shopify emails the person who can act and leaves the rest in the product. A dispute opened at midnight reaches Finance without anyone polling a bell.",
          tradeoff:
            "Email is a second inbox with its own read state, so the console has to say what was sent and when. A company that filters mail misses the urgent and the routine together.",
          reference: "Shopify",
          html: shell(
            "Notifications",
            `<div class="page" style="max-width:620px">${trail("Home", "Settings", "Notifications")}${phead("Notifications", "Who the urgent reaches by email. Everything else waits on Home.", "")}${section("Email the person who can act", `<div class="rlist">${recordRow({ title: "Disputes", sub: "Opened, and 2 days before the answer is due", fig: PEOPLE.finance.name, actions: '<button class="btn sm">Edit</button>' })}${recordRow({ title: "Failed settlements", sub: "Money that did not arrive", fig: PEOPLE.finance.name, actions: '<button class="btn sm">Edit</button>' })}${recordRow({ title: "Dispatch delayed", sub: "A delivery that missed its window", fig: PEOPLE.warehouse.name, actions: '<button class="btn sm">Edit</button>' })}${recordRow({ title: "Refund window closing", sub: "7 days before the 180-day window ends", fig: PEOPLE.support.name, actions: '<button class="btn sm">Edit</button>' })}</div>`)}</div>`,
            "Settings",
          ),
        },
        {
          name: "The unread first, in a phone sheet",
          width: "phone",
          rationale:
            "Linear opens notifications as a bottom sheet on a phone, unread first, where the thumb reaches them. A warehouse lead reads three items between dispatches without opening the menu.",
          tradeoff:
            "The sheet covers the list it came from, so acting on an item means opening it full screen. Triage on a phone is read and dismiss, not decide.",
          reference: "Linear",
          html: `<div class="shell" style="grid-template-columns:minmax(0,1fr)"><div class="main"><div class="bar"><span class="nv-glyph" style="font-weight:400">☰</span><span>Orders</span><span class="icons"><span style="opacity:.7">☼</span></span></div><div class="page">${phead("Orders", "268 orders.", "")}${section("", `<div class="rlist">${recordRow({ title: "SO-1042 · " + ORDER.customer, sub: "8 Oct 2026, 09:32 · Garcia Interiors", state: { label: "Paid", tone: "positive" }, fig: MONEY.order })}</div>`)}</div></div></div><div class="nv-hsheet"><div class="nv-grab"></div><div class="inline" style="justify-content:space-between;margin-bottom:8px"><b style="font-size:13px">3 unread</b><span style="font-size:11.5px;color:var(--muted-foreground)">Mark all read</span></div><div class="rlist">${recordRow({ title: "A dispute was opened on order SO-1041", sub: "Tom Becker · 2 hours ago", state: { label: "Disputed", tone: "destructive" } })}${recordRow({ title: "The refund window closes Friday", sub: "5 orders · 180-day window", state: { label: "Closing", tone: "caution" } })}${recordRow({ title: "Chris Novak accepted the invitation", sub: "Team · yesterday", state: { label: "Done", tone: "neutral" } })}</div></div>`,
        },
        {
          name: "No notifications at all",
          rationale:
            "Every area already lists what needs doing, so a reader who walks the areas finds everything. No counts to keep, no panel to build, no email to word.",
          tradeoff:
            "Walking seven areas by hand is how a dispute deadline is missed. Never ship this: it moves the cost of knowing from one bell to every reader, every day.",
          html: shell(
            "Orders",
            `<div class="page">${phead("Orders", "268 orders from 142 customers, newest first.", "", { crumb: trail("Home", "Orders") })}${toolbar({ search: "", placeholder: "Order number, name or email", filters: ["Any state"] })}${section("", `<table class="dt dense"><thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col">State</th><th scope="col" class="num">Paid</th></tr></thead><tbody><tr><td><span class="code">SO-1042</span></td><td>${ORDER.customer}</td><td>${badgeRaw("Paid", "positive", "outline")}</td><td class="num">${MONEY.order}</td></tr></tbody></table>`, { flush: true })}</div>`,
            "Orders",
          ),
        },
      ],
    },
    {
      id: "nv-help",
      title: "Help and support",
      why: "The navigation names <b>a help topic per page</b>, so help can open the guide for the page on screen. The console links a help page from the sidebar.",
      verdict:
        "Open the guide for the current page in a side panel: the navigation already carries a help topic per page, so contextual help is a lookup rather than a search. The help page stays as the index behind the panel. Never ship no help entry: a warehouse lead stuck at the dock with a queue has nowhere else to turn.",
      variants: [
        {
          name: "A help page from the sidebar",
          rationale:
            "One index of guides with search, reached from the sidebar on every page, plus a support row for what no guide answers.",
          tradeoff:
            "An index answers the reader who knows what to ask. A reader stuck on a record has to translate the record into a search query first.",
          html: shell(
            "Help",
            `<div class="page" style="max-width:620px">${phead("Help", "Guides for the stock you hold, and the people who answer the rest.", "", { crumb: trail("Home", "Help") })}${toolbar({ search: "", placeholder: "Search the guides" })}${section("Guides", `<div class="rlist">${recordRow({ title: "Taking orders", sub: "Products, variants, prices and the catalogue", actions: '<button class="btn sm">Open</button>' })}${recordRow({ title: "Refunds and returns", sub: "The 180-day window, credit and out-of-band payments", actions: '<button class="btn sm">Open</button>' })}${recordRow({ title: "Running the warehouse", sub: "Bays, dispatch and offline booking", actions: '<button class="btn sm">Open</button>' })}${recordRow({ title: "Money and invoices", sub: "What arrived, what is held and what failed", actions: '<button class="btn sm">Open</button>' })}</div>`) }<div style="height:12px"></div>${section("Talk to support", `<div class="rlist">${recordRow({ title: "Contact support", sub: "The support team answers on business days", actions: '<button class="btn sm">Write</button>' })}</div>`)}</div>`,
            "Home",
          ),
        },
        {
          name: "A help menu in the sidebar foot",
          rationale:
            "The foot holds search, shortcuts and contact in one menu, so help is one click without leaving the page. The menu is cheaper than a page and closer than the header.",
          tradeoff:
            "A menu that opens upward from the foot fights the sheet on a phone, where the foot is already inside an overlay. Three entries is also all a menu holds before it wants to be a page.",
          html: `<div class="shell">${sidebar("Orders", false)}<div class="main">${bar("Orders")}<div class="page">${phead("Orders", "268 orders.", "", { crumb: trail("Home", "Orders") })}<div style="position:relative">${section("", `<table class="dt dense"><thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col">State</th><th scope="col" class="num">Paid</th></tr></thead><tbody><tr><td><span class="code">SO-1042</span></td><td>${ORDER.customer}</td><td>${badgeRaw("Paid", "positive", "outline")}</td><td class="num">${MONEY.order}</td></tr></tbody></table>`, { flush: true })}<div style="position:absolute;left:8px;bottom:8px">${menu([{ label: "Search the guides", shortcut: "?" }, { label: "Keyboard shortcuts" }, { label: "Contact support" }], { width: "230px" })}</div></div></div></div></div>`,
        },
        {
          name: "Contextual help beside the page it explains",
          pick: true,
          rationale:
            "Stripe opens the guide for the current page in a side panel, so the reader never leaves the record. The navigation already carries a topic per page, so this is a lookup rather than a search.",
          tradeoff:
            "A panel beside the content halves the content width, and on a phone it stacks below the fold it explains. Every page also needs its topic written before the panel has anything to show.",
          reference: "Stripe",
          html: shell(
            "Order",
            `<div class="page">${trail("Home", "Orders", "SO-1042")}${phead("SO-1042 " + badgeRaw("Paid", "positive"), ORDER.customer + " · Garcia Interiors · " + MONEY.order, '<button class="btn primary sm">Refund order</button>')}${twoCol(section("The order at a glance", `<div class="split" style="align-items:baseline"><span>Paid by the customer<span class="sub">This payment method, 8 Oct 2026, 09:34</span></span><span class="fig" style="font-weight:600">${MONEY.order}</span></div>`), section("Refunding this order", `<div class="stack sm"><p class="note">1. Check the payment date: this payment method refunds only within 180 days.</p><p class="note">2. Past the window, offer credit or record an out-of-band payment.</p><p class="note">3. The refund returns against the customer&apos;s own original charge.</p><span class="btnrow"><button class="btn sm">Open the full guide</button></span></div>`, { desc: "Guide · Refunds and returns" }), { ratio: "minmax(0,1fr) 300px" })}</div>`,
            "Orders",
          ),
        },
        {
          name: "Help search inside the command palette",
          rationale:
            "Linear answers help queries where navigation queries already go: one input searches pages, records and guides together. A reader who learned Cmd-K needs no second shortcut.",
          tradeoff:
            "Guides compete with pages and records for the same short list, so a guide the reader wants can sit below records they do not. Help also inherits the palette discoverability problem.",
          reference: "Linear",
          html: shell(
            "Orders",
            `<div class="page">` +
              phead("Orders", "Every paid order, newest first.", "", { crumb: trail("Home", "Orders") }) +
              `</div>` +
              dialog(
                "Jump to",
                input("refund", { placeholder: "Search pages, orders, products" }) +
                  section("Go to", menu([{ label: "Refunds" }, { label: "Late payments" }])) +
                  section(
                    "Guides",
                    recordRow({ title: "Refunding an order", sub: "Guide · Refunds and returns" }) +
                      recordRow({ title: "The 180-day window", sub: "Guide · Refunds and returns" }) +
                      recordRow({ title: "Credit instead of a refund", sub: "Guide · Refunds and returns" }),
                  ),
                { desc: COMPANY.name, footer: tip("Move", ["Up", "Down"]) + tip("Open", ["Enter"]) },
              ),
            "Orders",
          ),
        },
        {
          name: "Contact support as a dialog",
          rationale:
            "A form that asks for the order number up front saves one round trip on every support thread. The subject routes the message before a person reads it.",
          tradeoff:
            "A dialog with four fields is a small page inside a modal frame, and on a phone it wants to be a sheet. It also promises an answer without saying when, so the response line has to be honest.",
          html: shell(
            "Orders",
            `<div class="page">` +
              phead("Orders", "Every paid order, newest first.", "", { crumb: trail("Home", "Orders") }) +
              `</div>` +
              dialog(
                "Contact support",
                `<div class="form">${field("Subject", select("Refunds", ["Refunds", "Dispatch", "Money", "Something else"]), { required: true })}${field("Order number", input("", { placeholder: "SO-1042" }), { optional: true, help: "The order this is about, if there is one." })}${field("What happened", '<textarea class="ta">The refund for order SO-1041 was refused and the window closes Friday.</textarea>', { required: true })}</div>`,
                { desc: COMPANY.name, footer: '<span class="left note tight">The support team answers on business days.</span><button class="btn primary">Send message</button>' },
              ),
            "Orders",
          ),
        },
        {
          name: "No help entry at all",
          rationale:
            "Every page is plain enough to need no guide, and support answers the rest by email. Nothing to write, nothing to translate, nothing to keep.",
          tradeoff:
            "A warehouse lead stuck at the dock with a queue has nowhere to turn inside the product. Never ship this: the guides are also where the refund policy the company answers for is recorded.",
          html: `<div class="shell"><nav><span class="brand" style="padding:4px 6px 10px;font-size:12.5px">${COMPANY.name}</span>${["Home", "Orders", "Customers", "Products", "Invoices", "Reports", "Settings"].map((nm, i) => `<a href="#"${i === 1 ? ' aria-current="page"' : ""}>${nm}</a>`).join("")}<span class="grow"></span><div class="who"><span>${PEOPLE.manager.name}<br><span style="color:var(--muted-foreground);font-size:10.5px">${PEOPLE.manager.role}</span></span></div></nav><div class="main">${bar("Orders")}<div class="page">${phead("Orders", "268 orders.", "", { crumb: trail("Home", "Orders") })}${section("", `<table class="dt dense"><thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col">State</th><th scope="col" class="num">Paid</th></tr></thead><tbody><tr><td><span class="code">SO-1042</span></td><td>${ORDER.customer}</td><td>${badgeRaw("Paid", "positive", "outline")}</td><td class="num">${MONEY.order}</td></tr></tbody></table>`, { flush: true })}</div></div></div>`,
        },
      ],
    },
    {
      id: "nv-workspace-scope",
      title: "The workspace switcher",
      why: "People who run several sites think in sites: <b>one warehouse at a time</b>, switched between often. The console carries a warehouse's sections as tabs on the warehouse page.",
      verdict:
        "Put a workspace switcher at the top of the sidebar: switching from the Amsterdam warehouse to Rotterdam without visiting the list matches how Vercel switches projects. The trail sibling menu is the runner-up on record pages four levels deep, where the sidebar context is far away. Never ship back-to-list as the only path: it costs the most to exactly the companies with the most sites.",
      compact: {
        option: "A workspace picker sheet on a phone",
        behaviour: "On a phone the workspaces list as a bottom sheet with the state beside each name.",
      },
      variants: [
        {
          name: "Warehouse sections as tabs on the warehouse page",
          rationale:
            "Eight sections of one warehouse as a tab row under the heading, with the active section in the URL so a pasted link carries it.",
          tradeoff:
            "Eight tabs overflow a phone and crowd a laptop, and the row says nothing about the other sites. Sections are covered; switching is not.",
          html: shell(
            "Warehouse",
            `<div class="page">${trail("Home", "Settings", "Warehouses", "Amsterdam warehouse")}<div class="phead"><div><h1>Amsterdam warehouse ${badgeRaw("Active", "positive")}</h1><p class="desc">Canal Street 12 · 4 bays</p></div><div class="acts"><button class="btn primary sm">Add stock</button></div></div>${tabs(["Details", "Stock", "Inbound", "Dispatch", "Money", "Operations", "Orders", "Notes"], 1)}${section("Stock", `<table class="dt"><thead><tr><th scope="col">Item</th><th scope="col" class="num">On hand</th><th scope="col" class="num">Price</th><th scope="col">State</th></tr></thead><tbody><tr><td><b>${PRODUCT.name}</b></td><td class="num">412 of 500</td><td class="num">${MONEY.lamp}</td><td>${badgeRaw("Active", "positive", "outline")}</td></tr></tbody></table>`, { flush: true })}</div>`,
            "Settings",
          ),
        },
        {
          name: "A workspace switcher at the top of the sidebar",
          pick: true,
          rationale:
            "Vercel switches projects from the top of the sidebar, above the navigation the switch changes. One control moves the whole console from the Amsterdam warehouse to Rotterdam.",
          tradeoff:
            "The switcher changes what every entry below it means, so the switcher must name the site prominently enough that no one reads the wrong warehouse with confidence.",
          reference: "Vercel",
          html: `<div class="shell"><nav style="position:relative"><button class="nv-wsswitch"><span class="grow" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">Amsterdam warehouse</span><span style="opacity:.6">▾</span></button><div style="position:absolute;left:4px;top:46px;z-index:5"><div class="menu" style="width:252px"><div style="padding:4px"><input class="inp" value="" placeholder="Search warehouses"></div><div class="mi" style="justify-content:space-between"><span><b style="font-weight:500">Amsterdam warehouse</b><br><span style="font-size:11px;color:var(--muted-foreground)">Canal Street 12 · 4 bays</span></span>${badgeRaw("Active", "positive")}</div><div class="mi" style="justify-content:space-between"><span><b style="font-weight:500">Rotterdam warehouse</b><br><span style="font-size:11px;color:var(--muted-foreground)">Wilhelminakade 88 · 6 bays</span></span>${badgeRaw("Scheduled", "info")}</div><div class="mi" style="justify-content:space-between"><span><b style="font-weight:500">Utrecht warehouse</b><br><span style="font-size:11px;color:var(--muted-foreground)">Stationsplein 4 · 2 bays</span></span>${badgeRaw("Active", "positive")}</div></div></div>${NV_AREAS.map(([nm, ico]) => `<a href="#"${nm === "Orders" ? ' aria-current="page"' : ""}><span style="width:12px;display:inline-block;text-align:center;opacity:.55">${ico}</span>${nm}</a>`).join("")}<span class="grow"></span><a href="#">Help</a><div class="who"><span style="width:22px;height:22px;border-radius:50%;background:var(--muted);display:grid;place-items:center;font-size:10px">${PEOPLE.manager.initials}</span><span>${PEOPLE.manager.name}<br><span style="color:var(--muted-foreground);font-size:10.5px">${PEOPLE.manager.role}</span></span></div></nav><div class="main">${bar("Amsterdam warehouse")}<div class="page">${phead("Amsterdam warehouse " + badgeRaw("Active", "positive"), "Canal Street 12 · 4 bays", '<button class="btn primary sm">Add stock</button>', { crumb: trail("Home", "Settings", "Warehouses", "Amsterdam warehouse") })}${section("Stock", `<div class="stmt"><div class="line"><span>${PRODUCT.name}<span class="sub">412 on hand of 500</span></span><span class="fig">${MONEY.lamp}</span></div></div>`)}</div></div></div>`,
        },
        {
          name: "Recent workspaces first in the palette",
          rationale:
            "Linear lists recent records before anything is typed, so returning to the site just left is one keypress. Recency matches how warehouse and support work moves between a few sites.",
          tradeoff:
            "Recency is personal state on a shared machine, so the next person at the keyboard sees what the last person opened. A renamed site also needs a rule for what its row says.",
          reference: "Linear",
          html: shell(
            "Orders",
            `<div class="page">` +
              phead("Orders", "Every paid order, newest first.", "", { crumb: trail("Home", "Orders") }) +
              `</div>` +
              dialog(
                "Jump to",
                input("", { placeholder: "Search pages, orders, products" }) +
                  section(
                    "Recent warehouses",
                    recordRow({ title: "Amsterdam warehouse", sub: "Canal Street 12 · 4 bays", state: STATES.active }) +
                      recordRow({ title: "Rotterdam warehouse", sub: "Wilhelminakade 88 · 6 bays", state: STATES.scheduled }),
                  ) +
                  section("Go to", menu([{ label: "Orders" }, { label: "Products" }])),
                { desc: COMPANY.name, footer: tip("Open", ["Enter"]) },
              ),
            "Orders",
          ),
        },
        {
          name: "The workspace level of the trail as a sibling menu",
          rationale:
            "Notion turns each trail level into a menu of its siblings, so the warehouse level lists the other sites. Switching sits exactly where the current site is named.",
          tradeoff:
            "A trail level that opens a menu is a trail that does not behave like one, and dozens of siblings need a search the trail has no room for. It fits companies with a handful of sites.",
          reference: "Notion",
          html: shell(
            "Stock",
            `<div class="page" style="max-width:600px"><div style="position:relative"><nav class="trail"><a href="#">Home</a><span class="sep">›</span><a href="#">Settings</a><span class="sep">›</span><button class="btn xs ghost" style="height:18px;padding:0 5px">Amsterdam warehouse ▾</button><span class="sep">›</span><span aria-current="page" style="color:var(--foreground);font-weight:500">Stock</span></nav><div style="position:absolute;z-index:5;top:22px;right:0">${menu([{ label: "Amsterdam warehouse", icon: "✓" }, { label: "Rotterdam warehouse" }, { label: "Utrecht warehouse" }], { width: "250px" })}</div></div><div class="phead"><div><h1>Stock</h1><p class="desc">3 product lines · 812 units on hand.</p></div><div class="acts"><button class="btn primary sm">Add stock</button></div></div>${section("Stock", `<table class="dt"><thead><tr><th scope="col">Item</th><th scope="col" class="num">On hand</th><th scope="col" class="num">Price</th></tr></thead><tbody><tr><td><b>${PRODUCT.name}</b></td><td class="num">412 of 500</td><td class="num">${MONEY.lamp}</td></tr></tbody></table>`, { flush: true })}</div>`,
            "Settings",
          ),
        },
        {
          name: "A workspace picker sheet on a phone",
          width: "phone",
          rationale:
            "A bottom sheet lists the sites where the thumb reaches them, with the state beside each name. Switching on a phone costs no more than switching on desktop.",
          tradeoff:
            "Dozens of sites in a sheet need a search row the sheet barely fits, and the sheet covers the site it came from. Recent sites first would shorten most visits.",
          html: `<div class="shell" style="grid-template-columns:minmax(0,1fr)"><div class="main"><div class="bar"><span class="nv-glyph" style="font-weight:400">☰</span><span>Amsterdam warehouse</span><span class="icons"><span style="opacity:.7">☼</span></span></div><div class="page">${phead("Amsterdam warehouse " + badgeRaw("Active", "positive"), "Canal Street 12 · 4 bays", "")}</div></div></div><div class="nv-hsheet"><div class="nv-grab"></div><div class="inline" style="justify-content:space-between;margin-bottom:8px"><b style="font-size:13px">Switch warehouse</b></div><div class="rlist">${recordRow({ title: "Amsterdam warehouse", sub: "Canal Street 12 · 4 bays", state: { label: "Active", tone: "positive" }, actions: '<span style="color:var(--muted-foreground)">✓</span>' })}${recordRow({ title: "Rotterdam warehouse", sub: "Wilhelminakade 88 · 6 bays", state: { label: "Scheduled", tone: "info" } })}${recordRow({ title: "Utrecht warehouse", sub: "Stationsplein 4 · 2 bays", state: { label: "Active", tone: "positive" } })}</div></div>`,
        },
        {
          name: "No switcher: back to the warehouse list",
          rationale:
            "The warehouse list already searches and filters every site, so a second switcher repeats it badly. Back to the list is one click that always works.",
          tradeoff:
            "One click each way on every switch, paid dozens of times a day by anyone running two sites. Never ship this as the only path: it costs the most to exactly the companies with the most sites.",
          html: shell(
            "Warehouse",
            `<div class="page">${trail("Home", "Settings", "Warehouses", "Amsterdam warehouse")}<div class="phead"><div><h1>Amsterdam warehouse ${badgeRaw("Active", "positive")}</h1><p class="desc">Canal Street 12 · 4 bays</p></div><div class="acts"><button class="btn primary sm">Add stock</button></div></div>${tabs(["Details", "Stock", "Inbound", "Dispatch", "Money", "Operations", "Orders", "Notes"], 0)}${section("Details", facts([["Site", "Amsterdam warehouse"], ["Bays", "4"], ["Capacity", "40 pallets"], ["Opens", "08:00"]]))}</div>`,
            "Settings",
          ),
        },
      ],
    },
    {
      id: "nv-phone-nav",
      title: "Phone navigation",
      why: "Below 768 px the sidebar hides and <b>a menu glyph shows in the bar</b>. The question is what the glyph opens, and whether a phone wants a bottom bar instead.",
      verdict:
        "Ship the off-canvas sheet, and answer the bottom-navigation question with no: this is a console opened on a phone a few times a day, not a daily-use app, and a bottom bar uses four slots for areas the reader rarely needs away from the desk. The sheet with recent pages above the areas is the runner-up once recents exist, since resuming work beats re-walking the tree. Never ship the desktop table unchanged on a phone: a warehouse lead pinching across 268 orders is a refusal to design.",
      compact: {
        option: "The sidebar as an off-canvas sheet",
        behaviour: "Below the md breakpoint the sidebar becomes an off-canvas sheet opened from the menu glyph in the bar.",
      },
      variants: [
        {
          name: "The sidebar as an off-canvas sheet",
          pick: true,
          width: "phone",
          rationale:
            "The behaviour below the md breakpoint: the same entries slide in over a scrim and dismiss with a close control. Nothing about the tree changes between desktop and phone.",
          tradeoff:
            "The sheet covers the page it came from, and a warehouse lead looking up one order costs one extra tap. Forty lookups a day makes the tap worth designing away.",
          reference: "shadcn",
          html: `<div class="shell" style="grid-template-columns:minmax(0,1fr)"><div class="main"><div class="bar"><span class="nv-glyph" style="font-weight:400">☰</span><span>Home</span><span class="icons"><span style="opacity:.7">☼</span></span></div><div class="page" style="min-height:520px">${phead("Good afternoon, Alex", "Two things need you today.", "")}${section("Needs attention", `<div class="alist">${actionRow("Close out the March stock count", "The count ended. Nothing left to settle.", "Close out", "◷")}</div>`)}</div></div></div>${nvSheet("Home")}`,
        },
        {
          name: "A bottom tab bar with four destinations and More",
          width: "phone",
          rationale:
            "GitHub mobile keeps five destinations under the thumb: four areas and a More that holds the rest. The reader moves between areas without opening anything.",
          tradeoff:
            "Five slots cannot hold seven areas, so More carries three of them behind a second tap. The bar also fits moving between areas, where the warehouse reader needs one order instead.",
          reference: "GitHub",
          html: `<div class="shell" style="grid-template-columns:minmax(0,1fr)"><div class="main"><div class="bar"><span>Orders</span><span class="icons"><span style="opacity:.7">☼</span></span></div><div class="page">${phead("Orders", "268 orders.", "")}${toolbar({ search: "", placeholder: "Order number, name or email" })}${section("", `<div class="rlist">${recordRow({ title: "SO-1042 · " + ORDER.customer, sub: "8 Oct 2026, 09:32 · Garcia Interiors", state: { label: "Paid", tone: "positive" }, fig: MONEY.order })}${recordRow({ title: "SO-1041 · Tom Becker", sub: "8 Oct 2026, 09:20 · Becker Bouw", state: { label: "Paid", tone: "positive" }, fig: "EUR 310.00" })}</div>`)}${nvBottomNav("Orders")}</div></div></div>`,
        },
        {
          name: "A bottom bar for the areas, a sheet for the rest",
          width: "phone",
          rationale:
            "The bar holds the four areas a phone reader visits; the More tab opens the other three as a sheet. Each pattern does the part it fits: visible destinations below, the full tree on demand.",
          tradeoff:
            "Two navigation patterns on one screen where desktop has one, and Invoices hides behind More on the surface where a refund question arrives. The split has to be watched, not set once.",
          html: `<div class="shell" style="grid-template-columns:minmax(0,1fr)"><div class="main"><div class="bar"><span>Orders</span><span class="icons"><span style="opacity:.7">☼</span></span></div><div class="page" style="min-height:520px">${phead("Orders", "268 orders.", "")}${section("", `<div class="rlist">${recordRow({ title: "SO-1042 · " + ORDER.customer, sub: "8 Oct 2026, 09:32 · Garcia Interiors", state: { label: "Paid", tone: "positive" }, fig: MONEY.order })}</div>`)}${nvBottomNav("More")}</div></div></div><div class="nv-hsheet"><div class="nv-grab"></div><div class="inline" style="justify-content:space-between;margin-bottom:8px"><b style="font-size:13px">More</b></div><div class="rlist">${recordRow({ title: "Products", sub: "93 products" })}${recordRow({ title: "Reports", sub: "Sales, stock and refunds" })}${recordRow({ title: "Settings", sub: "30 areas" })}</div></div>`,
        },
        {
          name: "The sheet with recent pages above the areas",
          width: "phone",
          rationale:
            "Resuming work beats re-walking the tree: three recent pages above the seven areas put the order just left one tap away. The sheet stays one list with two halves.",
          tradeoff:
            "Recents are personal state on a shared device, and a recent that was renamed needs a rule for what its row says. The areas below also start below the fold on a short phone.",
          html: `<div class="shell" style="grid-template-columns:minmax(0,1fr)"><div class="main"><div class="bar"><span class="nv-glyph" style="font-weight:400">☰</span><span>Orders</span><span class="icons"><span style="opacity:.7">☼</span></span></div><div class="page" style="min-height:520px">${phead("Orders", "268 orders.", "")}${section("", `<div class="rlist">${recordRow({ title: "SO-1042 · " + ORDER.customer, sub: "8 Oct 2026, 09:32 · Garcia Interiors", state: { label: "Paid", tone: "positive" }, fig: MONEY.order })}</div>`)}</div></div></div><div class="scrim" style="place-items:stretch;justify-items:start;padding:0"><nav class="nv-sheet" aria-label="Menu"><div class="nv-sheethead"><span style="font-size:12.5px;font-weight:600">${COMPANY.name}</span><button class="btn xs ghost" style="margin-left:auto" aria-label="Close menu">✕</button></div><div class="nv-cap">Recent</div><a href="#">SO-1042 · ${ORDER.customer}</a><a href="#">${DELIVERY.name}</a><a href="#">September statement</a><div class="nv-cap">Areas</div>${NV_AREAS.map(([nm, ico]) => `<a href="#"${nm === "Orders" ? ' aria-current="page"' : ""}><span style="width:12px;display:inline-block;text-align:center;opacity:.55">${ico}</span>${nm}</a>`).join("")}<span style="flex:1"></span><a href="#">Help</a></nav></div>`,
        },
        {
          name: "A segmented control for sibling pages",
          width: "phone",
          rationale:
            "iOS settings switch sibling facets with a segmented control, which fits a phone row where eight tabs cannot. Three facets stay visible without scrolling or menus.",
          tradeoff:
            "Three segments is the ceiling and the control cannot carry counts, so it fits facets, not areas. Eight warehouse sections still need the tabs or the More menu behind this.",
          reference: "iOS",
          html: `<div class="shell" style="grid-template-columns:minmax(0,1fr)"><div class="main"><div class="bar"><span class="nv-glyph" style="font-weight:400">☰</span><span>Amsterdam warehouse</span><span class="icons"><span style="opacity:.7">☼</span></span></div><div class="page"><a href="#" style="display:inline-flex;align-items:center;gap:4px;font-size:12px;color:var(--muted-foreground);text-decoration:none;margin-bottom:6px">‹ Warehouses</a><div class="phead"><div><h1>Amsterdam warehouse ${badgeRaw("Active", "positive")}</h1><p class="desc">Canal Street 12 · 4 bays</p></div></div>${segmented(["Details", "Stock", "Dispatch"], 1)}<div style="height:12px"></div>${section("Stock", `<div class="rlist">${recordRow({ title: PRODUCT.name, sub: "412 of 500 on hand", fig: MONEY.lamp, actions: '<button class="btn sm">Open</button>' })}${recordRow({ title: "Linen armchair", sub: "88 of 100 on hand", fig: MONEY.lineTotal, actions: '<button class="btn sm">Open</button>' })}</div>`)}</div></div></div>`,
        },
        {
          name: "No phone layout: the desktop table unchanged",
          width: "phone",
          rationale:
            "The desktop table renders as drawn and scrolls sideways in its box. Nothing to design, nothing to maintain, and every column survives.",
          tradeoff:
            "A warehouse lead pinches across 268 orders to find one. Never ship this: sideways scrolling on a phone is a refusal to design.",
          html: `<div class="shell" style="grid-template-columns:minmax(0,1fr)"><div class="main"><div class="bar"><span class="nv-glyph" style="font-weight:400">☰</span><span>Orders</span><span class="icons"><span style="opacity:.7">☼</span></span></div><div class="page">${phead("Orders", "268 orders from 142 customers.", "")}${section("", ordersTable({ rows: 4 }), { flush: true })}</div></div></div>`,
        },
      ],
    },
  ],
};
