/**
 * Create, edit and remove: Creation, change and removal each carry their own risk, and each has its own ways to be entered and confirmed.
 */

import {
  COMPANY,
  DELIVERY,
  MONEY,
  ORDER,
  PEOPLE,
  PRODUCT,
  STATES,
  alert,
  badge,
  badgeRaw,
  callout,
  copyValue,
  dialog,
  drawer,
  dropZone,
  emptyState,
  explained,
  facts,
  field,
  formActions,
  formSection,
  input,
  menu,
  notice,
  phead,
  progress,
  recordRow,
  section,
  segmented,
  select,
  shell,
  split,
  statement,
  tabs,
  timelineEntry,
  toast,
  toolbar,
  trail,
  twoCol,
} from "../parts.mjs";

/** A euro money input with the sign inside the control. */
function ceEuro(value, { readonly = false, placeholder = "" } = {}) {
  return `<span class="inp-wrap" style="position:relative;display:flex;align-items:center"><span aria-hidden="true" style="position:absolute;left:9px;font-size:12.5px;color:var(--muted-foreground)">€</span><input class="inp money" style="padding-left:24px" value="${value}" placeholder="${placeholder}" inputmode="decimal"${readonly ? " readonly" : ""}></span>`;
}

/** A submit row: secondary actions left, the commit right. */
function ceFoot(left, right) {
  return `<div class="ce-foot">${left ? `<span class="left">${left}</span>` : ""}<span class="right">${right}</span></div>`;
}

/** A dialog footer that stacks its buttons full width. Nothing scrolls sideways. */
function ceVFoot(...buttons) {
  return `<div class="ce-vfoot">${buttons.join("")}</div>`;
}

/** A row in a hand-ordered list: grip, text, position, actions. */
function ceOrderRow({ title, sub = "", pos = "", actions = "", drag = false }) {
  return `<div class="rrow ce-order${drag ? " drag" : ""}"><span class="ce-grip" aria-hidden="true">⠿</span><span class="txt"><b>${title}</b>${sub ? `<small>${sub}</small>` : ""}</span>${pos ? `<span class="ce-pos">${pos}</span>` : ""}${actions ? `<span class="acts">${actions}</span>` : ""}</div>`;
}

/** A person chip: initials, name, role. */
function cePerson(name, role, initials) {
  return `<span class="ce-person"><span class="avatar">${initials}</span><span><b>${name}</b><small>${role}</small></span></span>`;
}

/** A before and after pair for a scheduled or dated change. */
function ceBeforeAfter(before, after) {
  return `<div class="ce-ba"><div><div class="ce-ba-cap">Now</div><div class="ce-ba-body">${before}</div></div><div class="ce-ba-arrow" aria-hidden="true">→</div><div><div class="ce-ba-cap">After</div><div class="ce-ba-body">${after}</div></div></div>`;
}

/** One included part in a duplicate-what checklist. */
function ceCarry(label, note, checked = true) {
  return `<label class="ce-check-row"><input type="checkbox"${checked ? " checked" : ""}><span>${label}<span class="cd">${note}</span></span></label>`;
}

/** A primary button split into its action and a menu of starting points. */
function ceSplit(primary, menuLabel) {
  return `<span class="btn-split primary"><button>${primary}</button><button aria-label="${menuLabel}">▾</button></span>`;
}

/** Create, edit and remove CSS. Every class starts with ce-, or is scoped under .ce-page. */
const CE_CSS = /* css */ `
.ce-page { display: flex; flex-direction: column; gap: 14px; min-width: 0; }
.ce-page > .trail { margin-bottom: -8px; }
.ce-page > .phead { margin-bottom: 0; }
.ce-narrow { width: 100%; max-width: 600px; }
.ce-mid { width: 100%; max-width: 680px; }
.ce-foot { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; border-top: 1px solid var(--border); padding-top: 12px; }
.ce-foot .left { margin-right: auto; display: flex; gap: 8px; flex-wrap: wrap; }
.ce-foot .right { display: flex; gap: 8px; flex-wrap: wrap; margin-left: auto; }
.ce-vfoot { display: flex; flex-direction: column; gap: 8px; width: 100%; }
.ce-vfoot .btn { width: 100%; }
.ce-cols2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.ce-grip { color: var(--muted-foreground); cursor: grab; flex: none; font-size: 13px; letter-spacing: 1px; }
.ce-order.drag { background: var(--muted); box-shadow: inset 3px 0 0 var(--ring); }
.ce-pos { flex: none; font-size: 11.5px; color: var(--muted-foreground); font-variant-numeric: tabular-nums; border: 1px solid var(--border); border-radius: 999px; padding: 1px 8px; }
.ce-drop { height: 2px; background: var(--ring); border-radius: 2px; margin: 2px 14px; }
.ce-person { display: inline-flex; align-items: center; gap: 8px; min-width: 0; }
.ce-person .avatar { width: 26px; height: 26px; border-radius: 50%; background: var(--muted); display: grid; place-items: center; font-size: 10px; font-weight: 600; flex: none; }
.ce-person b { display: block; font-weight: 500; font-size: 12.5px; }
.ce-person small { display: block; color: var(--muted-foreground); font-size: 11.5px; }
.ce-ba { display: grid; grid-template-columns: 1fr 28px 1fr; gap: 8px; align-items: stretch; }
.ce-ba-arrow { display: grid; place-items: center; color: var(--muted-foreground); }
.ce-ba-cap { font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--muted-foreground); margin-bottom: 4px; }
.ce-ba-body { border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 10px 12px; font-size: 12.5px; background: var(--background); }
.ce-toast-spot { position: absolute; right: 24px; bottom: 24px; z-index: 4; max-width: min(380px, calc(100% - 48px)); }
.ce-check-row { display: flex; gap: 10px; align-items: flex-start; padding: 10px 0; border-bottom: 1px solid var(--border); font-size: 12.5px; cursor: pointer; }
.ce-check-row:last-child { border-bottom: 0; }
.ce-check-row input { margin-top: 2px; accent-color: var(--foreground); flex: none; }
.ce-check-row .cd { display: block; color: var(--muted-foreground); font-size: 11.5px; }
.ce-page .dialog > footer { flex-wrap: wrap; }
.ce-page .rrow .txt b { overflow-wrap: anywhere; }
.ce-hero { display: flex; gap: 12px; align-items: flex-start; }
.ce-hero .ce-ico { width: 34px; height: 34px; border-radius: 50%; display: grid; place-items: center; font-size: 14px; flex: none; background: var(--muted); }
.ce-hero .ce-ico.positive { background: var(--positive-surface); color: var(--positive-surface-foreground); }
.ce-hero .ce-ico.caution { background: var(--caution-surface); color: var(--caution-surface-foreground); }
.ce-hero .ce-ico.destructive { background: var(--destructive-surface); color: var(--destructive-surface-foreground); }
.ce-hero b { display: block; font-size: 13.5px; }
.ce-hero small { display: block; color: var(--muted-foreground); font-size: 12px; margin-top: 2px; }
.ce-palette { border: 1px solid var(--border); border-radius: var(--radius); background: var(--popover); box-shadow: 0 16px 40px var(--scroll-shade); overflow: hidden; max-width: 560px; margin: 24px auto; }
.ce-palette input { width: 100%; border: 0; border-bottom: 1px solid var(--border); background: transparent; color: var(--foreground); padding: 12px 14px; font-size: 13.5px; }
.ce-palette .ce-prow { display: flex; gap: 10px; align-items: center; padding: 9px 14px; font-size: 12.5px; }
.ce-palette .ce-prow.sel { background: var(--muted); }
.ce-palette .ce-prow .k { margin-left: auto; color: var(--muted-foreground); font-size: 11px; flex: none; }
.ce-sched { display: flex; flex-direction: column; }
.ce-sched-row { display: flex; gap: 12px; align-items: flex-start; padding: 11px 0; border-bottom: 1px solid var(--border); }
.ce-sched-row:last-child { border-bottom: 0; }
.ce-date { flex: none; width: 52px; text-align: center; border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 5px 0; line-height: 1.2; background: var(--card); }
.ce-date small { display: block; font-size: 9.5px; text-transform: uppercase; letter-spacing: 0.05em; color: var(--muted-foreground); }
.ce-date b { display: block; font-size: 15px; font-variant-numeric: tabular-nums; }
.ce-menu-spot { position: relative; }
.ce-menu-spot .menu { position: absolute; right: 0; top: calc(100% + 6px); z-index: 4; }
@media (max-width: 640px) {
  .ce-cols2 { grid-template-columns: minmax(0, 1fr); }
  .ce-ba { grid-template-columns: minmax(0, 1fr); }
  .ce-ba-arrow { transform: rotate(90deg); justify-self: center; }
  .ce-toast-spot { right: 12px; left: 12px; bottom: 12px; max-width: none; }
  .ce-foot .btn { flex: 1 1 auto; }
}
`;

export const CATEGORY_CREATE_EDIT_REMOVE = {
  css: CE_CSS,
  items: [
    {
      id: "create-shape",
      title: "Creating one record",
      why: "The rule is explicit: <b>a create stays a dialog or a page, never a drawer</b>. One to four inputs is a dialog; more is a page. The open question is what a create looks like before the reader has entered anything.",
      verdict:
        "The dialog stays the pick for one to four inputs: it keeps the list behind it and commits with one verb. The full page is the runner-up and the right one past four inputs or with sections. The inline table row is the one to refuse, because a form inside a table breaks the layout rules and hides validation. Of the further options, the split button earns its place on the deliveries list, where three starting points already exist.",
      variants: [
        {
          name: "A dialog for two or three inputs",
          pick: true,
          rationale:
            "A dialog with three inputs, one verb on the commit button, Cancel beside it. This is where most creates belong and where they usually end up.",
          tradeoff:
            "A create that grows past four inputs has to leave the dialog, and the reader's typed values have to come with it or be lost.",
          html: shell(
            "Add a plan entry",
            `<div class="page" style="position:relative">
  ${phead(DELIVERY.name, "Delivery plan · 6 entries.", '<button class="btn sm">Add to the plan</button>', { crumb: trail("Home", "Orders", ORDER.number, "Delivery", "Plan") })}
  ${section("Delivery plan", `<div class="rlist">
      ${[
        ["Loading bay booked", "08:00", PEOPLE.warehouse.name],
        [`${PEOPLE.warehouse.name} on dispatch`, "07:30", PEOPLE.warehouse.name],
        ["Stock check", "06:30", ""],
        ["Labels printed", "07:00", ""],
        [`${PEOPLE.support.name} on customer messages`, "08:00", ""],
        ["Bay handover", "12:00", ""],
      ]
        .map(([what, when, who]) => recordRow({ title: what, sub: who ? `${who} · set 2 Oct` : "", fig: when, actions: '<button class="btn sm icon" aria-label="More actions">⋯</button>' }))
        .join("")}
    </div>`, { desc: "Entries are sorted by their start time.", acts: '<button class="btn xs">Newest first ▾</button>' })}
  <div class="scrim">
    ${dialog(
      "Add to the delivery plan",
      `<div class="stack">
        ${field("What", input("", { placeholder: "Stock check" }), { required: true })}
        ${field("When", input("06:30", { cls: "nowrap" }), { help: "A time on ${DELIVERY.date}, in Europe/Amsterdam.", required: true })}
        ${field("Who", input(""), { optional: true, help: "A person or a company. Only ${COMPANY.name} sees this." })}
      </div>`,
      { footer: '<button class="btn">Cancel</button><button class="btn primary">Add it</button>' },
    )}
  </div>
</div>`,
            "Orders",
          ),
        },
        {
          name: "A full page for the ones that grow",
          rationale:
            "The form pages with sections, steps or more than four inputs. A page gives the fields room and gives the result a link.",
          tradeoff:
            "Leaving the list to create one record, and coming back to the list afterwards, is two navigations for every single creation. It only pays when the form is long.",
          html: shell(
            "New delivery",
            `<div class="page" style="max-width:560px">
  ${trail("Home", "Orders", "New delivery")}
  <div class="phead"><div><h1>New delivery</h1><p class="desc">Start with a name. Everything else can wait.</p></div></div>
  ${section(
    "",
    `<div class="stack lg">
      ${formSection("The delivery", "What it carries and who it is for.", field("Name", input(""), { required: true }) + field("Description", '<textarea class="ta"></textarea>', { optional: true }), { stacked: true })}
      ${`<div class="hr"></div>`}
      ${formSection("When", "The van runs from loading to departure.", field("Loading starts", input("", { placeholder: "dd/mm/yyyy --:--" }), { required: true }) + field("Departs", input("", { placeholder: "dd/mm/yyyy --:--" }), { required: true }), { stacked: true })}
      ${`<div class="hr"></div>`}
      ${formSection("Where", "Where the goods leave from.", field("Warehouse", '<select class="sel"><option>Choose a warehouse</option><option>Amsterdam warehouse</option></select>', { required: true }), { stacked: true })}
      <div class="btnrow end" style="border-top:1px solid var(--border);padding-top:12px"><button class="btn">Cancel</button><button class="btn primary">Create delivery</button></div>
    </div>`,
  )}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Create from a template, chosen before the form",
          rationale:
            "One shape offers 'A blank delivery' or 'A template' at the top of the form. Choosing first means the form below already knows what it is for.",
          tradeoff:
            "A control inside a form that is not part of the form. Once a template is chosen the toggle is meaningless but stays visible, because nothing knows the create is already under way.",
          html: shell(
            "New delivery",
            `<div class="page" style="max-width:560px">
  ${trail("Home", "Orders", "New delivery")}
  <div class="phead"><div><h1>New delivery</h1><p class="desc">Start from last time, or from nothing.</p></div></div>
  ${section(
    "",
    `<div class="stack lg">
      <div class="stack sm">
        <div class="lab" style="font-size:12.5px;font-weight:500">Start from</div>
        ${segmented(["A blank delivery", "A template"], 1)}
        <div class="hint">A template carries a customer, a warehouse and a delivery plan. The new delivery copies the template as it stands, not its past shipments.</div>
      </div>
      <hr class="hr">
      <div class="form">
        ${field("Template", '<select class="sel"><option selected>Restock, standard</option><option>Restock, express</option></select>', { required: true })}
        ${field("Name", input("Garcia Interiors restock"), { help: "Customers see this on the storefront and on their paperwork.", required: true })}
        ${field("When", input("09/10/2026", { cls: "nowrap" }), { required: true })}
      </div>
      <div class="btnrow end" style="border-top:1px solid var(--border);padding-top:12px"><button class="btn">Cancel</button><button class="btn primary">Create delivery</button></div>
    </div>`,
  )}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Create from a copy of an existing record",
          rationale:
            "Duplicate a delivery that worked, then change what is different. The copy carries products and a plan and starts as a draft with nothing committed.",
          tradeoff:
            "A duplicate of a shipped delivery is nearly meaningless: the orders and the money all belong to the original. It only works for a template-like record with no history.",
          html: shell(
            "Deliveries",
            `<div class="page">
  ${phead("Deliveries", "93 scheduled.", '<button class="btn sm">New delivery</button>', { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Search deliveries", views: ["Scheduled 93", "Past 148", "All 241"], active: 0 })}
  ${section(
    "",
    `<div class="rlist">
      ${[
        ["Garcia Interiors restock", "9 Oct 2026", "Scheduled", "info", "1 of 40 pallets"],
        ["Becker Bouw restock", "16 Oct 2026", "Scheduled", "info", "7 of 40 pallets"],
        ["Lindqvist Studio restock", "Sat 14 Mar 2026", "Draft", "neutral", "0 of 40 pallets"],
        ["Okafor Office restock", "3 Nov 2026", "Active", "positive", "0 of 40 pallets"],
      ]
        .map(
          ([nm, when, st, tone, sold], i) => `<div class="rrow">
        <span class="txt"><b>${nm}</b><small>${when} · ${i === 3 ? "Rotterdam warehouse" : DELIVERY.place}</small></span>
        ${badgeRaw(st, tone)}
        <span class="fig">${sold}</span>
        <span class="acts"><button class="btn sm">Open</button> <button class="btn sm icon" aria-label="More actions for ${nm}">⋯</button></span>
      </div>`,
        )
        .join("")}
    </div>`,
  )}
  <div style="position:absolute;right:58px;bottom:70px;max-width:calc(100% - 70px)">
    ${menu([{ label: "Open" }, { label: "Duplicate this delivery" }, { label: "Copy the plan to another" }, "-", { label: "Delete this delivery", danger: true, disabled: true }], { width: "215px" })}
  </div>
</div>`,
            "Orders",
          ),
        },
        {
          name: "Create inline in the table, as an empty first row",
          rationale:
            "The table grows a form row at the top. Nothing opens, nothing closes, and the reader sees what they are adding in the context of what is already there.",
          tradeoff:
            "Carbon says a modal is for tasks that are not repeated, and this is the most repeated create in the back office. It also puts a form inside a table, which the layout rules do not cover.",
          html: shell(
            "Refunds queue",
            `<div class="page">
  ${phead("Refunds", "31 orders to decide. None of these are a refund yet.", '<button class="btn primary sm">Start a refund</button>', { crumb: trail("Home", "Orders", "Refunds") })}
  ${toolbar({ search: "", placeholder: "Search refunds", filters: ["Any window"] })}
  ${section(
    "",
    `<table class="dt">
      <thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col">Asked</th><th scope="col" class="num">Amount</th><th scope="col" style="width:1%"></th></tr></thead>
      <tbody>
        <tr style="background:var(--card);box-shadow:inset 3px 0 0 var(--ring)">
          <td colspan="5" style="padding:0">
            <div style="padding:11px 12px">
              <div class="form" style="display:grid;grid-template-columns:120px 1fr 130px auto;gap:10px;align-items:end">
                <div class="field"><label>Order</label><input class="inp mono" placeholder="SO-1042" style="text-transform:uppercase"></div>
                <div class="field"><label>Route</label><select class="sel"><option>Bank refund</option><option selected>Credit for a future order</option><option>Bank transfer, recorded</option></select></div>
                <div class="field"><label>Amount</label><span class="inp-wrap has-suffix" style="position:relative;display:flex;align-items:center"><input class="inp money" value="45.00" inputmode="decimal"><span class="suffix" style="position:absolute;right:9px;font-size:11.5px;color:var(--muted-foreground)">EUR</span></span></div>
                <div class="btnrow"><button class="btn xs">Cancel</button><button class="btn primary xs">Add</button></div>
              </div>
            </div>
          </td>
        </tr>
        ${[
          ["SO-1041", "Elin Lindqvist", "214 days ago", MONEY.refund],
          ["SO-1040", "Ade Okafor", "181 days ago", MONEY.refund],
          ["SO-1039", "Tom Becker", "163 days ago", MONEY.refund],
        ]
          .map(([no, who, when, amt]) => `<tr><td><span class="code">${no}</span></td><td>${who}</td><td class="muted">${when}</td><td class="num">${amt}</td><td class="num"><button class="btn xs">Deal with it</button></td></tr>`)
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
          name: "Create many at once from a file",
          rationale:
            "A bulk create: a file, a check of what it made, and a report. This is the shape for a season of products or a list of customers, where one dialog per record would be absurd.",
          tradeoff:
            "An import writes across many records at once. A partial failure has to be reportable and undoable while nothing is charged.",
          html: shell(
            "Import products",
            `<div class="page" style="max-width:620px">
  ${trail("Home", "Settings", "Data imports", "New")}
  <div class="phead"><div><h1>Import products</h1><p class="desc">Bring in a list you already hold. Nothing is published until you check what it made.</p></div></div>
  ${section(
    "",
    `<div class="stack">
      <div class="stack sm">
        <div style="font-size:12.5px;font-weight:500">Your file needs four columns</div>
        <div class="hint">sku, name, price, stock. Extra columns are ignored.</div>
        <div style="font-size:12px"><a href="#" style="text-decoration:underline">Download a template</a></div>
        ${dropZone("Drop a CSV here or choose a file", "Up to 5 MB, 2,000 rows. UTF-8, comma separated.")}
      </div>
      <hr class="hr">
      <div class="stack sm">
        <div style="font-size:12.5px;font-weight:500">What will happen</div>
        <div class="hint">One product per row, as a draft. No customer is charged and no message is sent. Everything can be undone while nothing has sold.</div>
      </div>
      <div class="btnrow end"><button class="btn">Cancel</button><button class="btn primary">Check the file</button></div>
    </div>`,
  )}
</div>`,
            "Settings",
          ),
        },
        {
          name: "One question per step, kept as a draft",
          rationale:
            "A long create split into one question per step with a progress bar and an already-answered recap. Nothing is lost between steps because every answer saves a draft.",
          tradeoff:
            "Steps hide the whole form, so a reader who knows every answer types slower than on one page. Drafts also need a list, an expiry, and a rule for who can see them.",
          html: shell(
            "New delivery, step 2 of 3",
            `<div class="page" style="max-width:520px">
  ${trail("Home", "Orders", "New delivery")}
  ${phead("New delivery", "Step 2 of 3. Every answer is kept as a draft.")}
  ${progress(67)}
  ${section(
    "When is it",
    field("Loading starts", input("14/03/2026 06:30"), { required: true, help: DELIVERY.place + ", in Europe/Amsterdam." }) +
      field("Departs", input("", { placeholder: "14/03/2026 12:00" }), { required: true, help: "The van leaves before the window closes." }),
    { desc: "The delivery runs from loading to departure." },
  )}
  ${section("Already answered", split("Name", DELIVERY.name) + split("Warehouse", DELIVERY.place) + split("Requested by", `${ORDER.customer}, ${ORDER.company}`))}
  ${notice("info", "This draft was started 6 minutes ago. It stays a draft until step 3 is done.")}
  ${formActions('<button class="btn">Back</button>', '<button class="btn primary">Continue</button>')}
</div>`,
            "Orders",
          ),
        },
        {
          name: "A split button that names the starting point",
          rationale:
            "The way Shopify Polaris draws a split button: the main face creates a blank delivery, the chevron names the other ways to start. Three starting points already exist on this list, and this is the control that holds them without a toggle inside the form.",
          tradeoff:
            "The chevron hides the template and the duplicate from anyone who never opens it. A first-time user still lands on the blank form and never learns the faster start exists.",
          reference: "Shopify Polaris",
          html: shell(
            "Deliveries",
            `<div class="page ce-page">
  ${phead("Deliveries", "93 scheduled.", ceSplit("New delivery", "More ways to create a delivery"), { crumb: trail("Home", "Orders") })}
  <div class="ce-menu-spot" style="margin-top:-8px">${menu([{ label: "Blank delivery" }, { label: "From a template" }, { label: "Duplicate Garcia Interiors restock" }, "-", { label: "Import deliveries from a file" }], { width: "264px" })}</div>
  ${toolbar({ search: "", placeholder: "Search deliveries", views: ["Scheduled 93", "Past 148", "All 241"], active: 0 })}
  ${section(
    "",
    `<div class="rlist">
      ${[
        ["Garcia Interiors restock", "9 Oct 2026", "Scheduled", "info", "1 of 40 pallets"],
        ["Becker Bouw restock", "16 Oct 2026", "Scheduled", "info", "7 of 40 pallets"],
        [DELIVERY.name, DELIVERY.date, "Draft", "neutral", "0 of 40 pallets"],
      ]
        .map(
          ([nm, when, st, tone, sold]) => `<div class="rrow">
        <span class="txt"><b>${nm}</b><small>${when} · ${DELIVERY.place}</small></span>
        ${badgeRaw(st, tone, "outline")}
        <span class="fig">${sold}</span>
        <span class="acts"><button class="btn sm">Open</button></span>
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
          name: "A command menu create, from anywhere",
          rationale:
            "The way Linear opens creation: one shortcut, one input, and the record type is chosen by typing. A manager who lives in the back office creates without travelling to the list first.",
          tradeoff:
            "Invisible until learned, and it only starts the create: the form still opens afterwards. It needs the shortcut taught on the page, or nobody finds it.",
          reference: "Linear",
          html: shell(
            "Deliveries",
            `<div class="page ce-page" style="position:relative;min-height:420px">
  ${phead("Deliveries", "93 scheduled.", '<button class="btn sm">New delivery</button>', { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Search deliveries", views: ["Scheduled 93", "Past 148", "All 241"], active: 0 })}
  ${section("", `<div class="rlist">${recordRow({ title: "Garcia Interiors restock", sub: "9 Oct 2026 · Amsterdam warehouse", state: { label: "Scheduled", tone: "info" }, fig: "1 of 40 pallets" })}${recordRow({ title: DELIVERY.name, sub: `${DELIVERY.date} · ${DELIVERY.place}`, state: { label: "Draft", tone: "neutral" }, fig: "0 of 40 pallets" })}</div>`)}
  <div class="scrim" style="align-items:start">
    <div class="ce-palette" role="dialog" aria-modal="true" aria-label="Create something">
      <input value="Create delivery" aria-label="What to create">
      <div class="ce-prow sel"><span aria-hidden="true">＋</span><span><b>Create delivery</b> <span class="muted">Garcia Interiors restock</span></span><span class="k">Return</span></div>
      <div class="ce-prow"><span aria-hidden="true">＋</span><span>Create product <span class="muted">in the catalogue</span></span><span class="k">↓ then Return</span></div>
      <div class="ce-prow"><span aria-hidden="true">＋</span><span>Create discount <span class="muted">for ${DELIVERY.name}</span></span><span class="k"></span></div>
      <div class="ce-prow"><span aria-hidden="true">＋</span><span>Create plan entry <span class="muted">for ${DELIVERY.name}</span></span><span class="k"></span></div>
    </div>
  </div>
</div>`,
            "Orders",
          ),
        },
      ],
    },
    {
      id: "edit-shape",
      title: "Changing a record that already exists",
      why: "A record page with two sections can carry <b>one Save per section</b>. A reader who edits the first and saves the second believes they saved both.",
      verdict:
        "One Save per page is the pick: a reader who changed three things saves once, and the dirty banner says what is pending. The impact statement is the runner-up for any change that breaks something, where the page must say what before the commit. The inline list-row edit is the one to refuse on this wide table. Autosave earns its place only for free text where two people cannot collide; the version history in the after-the-fact item is its required companion.",
      variants: [
        {
          name: "One Save per page",
          pick: true,
          rationale:
            "The whole page is one form and one Save. A reader who has changed three things saves once, and nothing on the page disagrees about what is pending.",
          tradeoff:
            "A partial failure loses the lot, and a reader who wants to save the name and leave the dates cannot. The page has to say what changed while it is dirty.",
          html: shell(
            "Oak desk lamp",
            `<div class="page" style="max-width:560px">
  ${trail("Home", "Products", "Desk lamps", PRODUCT.name)}
  <div class="phead">
    <div><h1>${PRODUCT.name} ${badgeRaw("On sale", "positive")}</h1><p class="desc">What this product is, and the labelling rule its units carry.</p></div>
    <div class="acts"><button class="btn sm">Pause sales</button></div>
  </div>
  ${`<div class="alert info" style="margin-bottom:12px"><span class="ico" aria-hidden="true">i</span><span class="txt"><b>Two changes not saved.</b><small>The name and the labelling rule. The warehouse still shows the old ones.</small></span></div>`}
  ${section(
    "",
    `<div class="form">
      ${field("Name", input(PRODUCT.name), { help: "Customers see this on the storefront and on the packing slip.", required: true })}
      ${field("Description", '<textarea class="ta">Solid oak desk lamp with a linen shade.</textarea>', { optional: true })}
      <div class="hr"></div>
      <div>
        <div style="font-size:12.5px;font-weight:500;margin-bottom:7px">How is each unit labelled?</div>
        <div class="radio-list">
          <label><input type="radio" name="n"><span><b>No label</b><span class="cd">Units are identical and need no mark.</span></span></label>
          <label><input type="radio" name="n" checked><span><b>Batch label</b><span class="cd">The batch code is on the unit.</span></span></label>
          <label><input type="radio" name="n"><span><b>Serial per unit</b><span class="cd">Each unit carries its own serial before dispatch.</span></span></label>
        </div>
      </div>
      <div class="btnrow between" style="border-top:1px solid var(--border);padding-top:12px">
        <button class="btn ghost">Discard both</button><button class="btn primary">Save 2 changes</button>
      </div>
    </div>`,
  )}
</div>`,
            "Products",
          ),
        },
        {
          name: "One Save per section, and each says what it saves",
          rationale:
            "Each section's button repeats its own verb: Save the name, Save the labelling. Nothing is ambiguous about what a click will commit.",
          tradeoff:
            "Still two commits on one screen. It works only because each button names what it commits, which is two things a reader can forget to do.",
          html: shell(
            "Oak desk lamp",
            `<div class="page" style="max-width:560px">
  ${trail("Home", "Products", "Desk lamps", PRODUCT.name)}
  <div class="phead">
    <div><h1>${PRODUCT.name} ${badgeRaw("On sale", "positive")}</h1></div>
    <div class="acts"><button class="btn sm">Pause sales</button></div>
  </div>
  ${section(
    "The name",
    `<div class="form">
      ${field("Name", input(PRODUCT.name), { required: true })}
      ${field("Description", '<textarea class="ta">Solid oak desk lamp with a linen shade.</textarea>', { optional: true })}
      <div class="btnrow end" style="border-top:1px solid var(--border);padding-top:12px"><button class="btn primary">Save the name</button></div>
    </div>`,
    { desc: "What customers read on the storefront and on the packing slip.", acts: '<span class="badge caution">Not saved</span>' },
  )}
  ${section(
    "Unit labelling",
    `<div class="stack sm">
      <div class="radio-list">
        <label><input type="radio" name="n" checked><span><b>No label</b><span class="cd">Units are identical and need no mark.</span></span></label>
        <label><input type="radio" name="n"><span><b>Batch label</b><span class="cd">The batch code is on the unit.</span></span></label>
        <label><input type="radio" name="n"><span><b>Serial per unit</b><span class="cd">Each unit carries its own serial before dispatch.</span></span></label>
      </div>
      <div class="btnrow end" style="border-top:1px solid var(--border);padding-top:12px"><button class="btn primary">Save the labelling</button></div>
    </div>`,
    { desc: "For a labelled unit the warehouse is asked for the mark before dispatch." },
  )}
</div>`,
            "Products",
          ),
        },
        {
          name: "Editing in place in the list row",
          rationale:
            "One cell becomes an input, the row looks different while it does, and Save and Cancel sit in the row. NN/g's rule: the row must visibly change or people edit by accident.",
          tradeoff:
            "It works only on a narrow table. This table has five columns, which is past the width NN/g means by narrow.",
          reference: "NN/g",
          html: shell(
            "Deliveries",
            `<div class="page">
  ${phead("Deliveries", "93 scheduled.", '<button class="btn primary sm">New delivery</button>', { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Search deliveries", views: ["Scheduled 93", "Past 148", "All 241"], active: 0 })}
  ${section(
    "",
    `<table class="dt dense">
      <thead><tr><th scope="col">Delivery</th><th scope="col">Date</th><th scope="col">State</th><th scope="col" class="num">Committed</th><th scope="col" style="width:1%"></th></tr></thead>
      <tbody>
        <tr style="background:var(--card);box-shadow:inset 3px 0 0 var(--ring)">
          <td><input class="inp" value="Garcia Interiors restock" aria-label="Delivery name"></td>
          <td><input class="inp" style="width:104px" value="09/10/2026" aria-label="Delivery date"></td>
          <td>${badgeRaw("Scheduled", "info", "outline")}</td>
          <td class="num">1 of 40 pallets</td>
          <td class="num" style="white-space:nowrap"><button class="btn xs">Save</button> <button class="btn xs ghost">Cancel</button></td>
        </tr>
        ${[
          ["Becker Bouw restock", "16 Oct 2026", "Scheduled", "info", "7 of 40 pallets"],
          ["Lindqvist Studio restock", "14 Mar 2026", "Draft", "neutral", "0 of 40 pallets"],
          ["Okafor Office restock", "3 Nov 2026", "Active", "positive", "0 of 40 pallets"],
        ]
          .map(([nm, when, st, tone, sold]) => `<tr><td><b>${nm}</b></td><td class="nowrap">${when}</td><td>${badgeRaw(st, tone, "outline")}</td><td class="num">${sold}</td><td class="num"><button class="btn xs">Edit</button></td></tr>`)
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
          name: "Editing with the impact stated before the save",
          rationale:
            "Where a change breaks something, the page says what before the reader commits: who is affected, what stops working, what cannot be changed back.",
          tradeoff:
            "It needs a read that answers the hypothetical, which is not a command and not the record as it stands.",
          html: shell(
            "Stock",
            `<div class="page" style="max-width:620px">
  ${trail("Home", "Products", PRODUCT.name, "Stock")}
  <div class="phead"><div><h1>Raise the stock target</h1><p class="desc">Amsterdam warehouse holds 500 ${PRODUCT.name}s. 412 are committed.</p></div></div>
  ${section(
    "",
    `<div class="form">
      ${field("Units in stock", input("600", { cls: "num" }), { help: "The warehouse holds 500. Going above that needs more shelf space booked first.", required: true })}
      <div class="callout destructive">
        <b>Two things happen when you save this.</b>
        <div style="margin-top:5px">188 more units go on sale at ${MONEY.lamp}.</div>
        <div>Listed on the storefront within a minute. There is no way to take them back once sold.</div>
      </div>
      <div class="hr"></div>
      <div class="stack sm">
        <div style="font-size:12.5px;font-weight:500">Nothing here changes</div>
        <div class="hint">The 412 units already committed, the 96 orders, and every price. A unit already bought stays at the price it was bought for.</div>
      </div>
      <div class="btnrow end" style="border-top:1px solid var(--border);padding-top:12px"><button class="btn">Cancel</button><button class="btn danger">Raise it and put 188 on sale</button></div>
    </div>`,
  )}
</div>`,
            "Products",
          ),
        },
        {
          name: "Editing in a dialog, for two fields",
          rationale:
            "Two fields do not need a page. A dialog holds them, the list stays behind, and the reader sees the change in context as soon as it lands.",
          tradeoff:
            "Carbon says a modal is not for repeatable work. Renaming a product happens a dozen times a season, which is repeatable enough to matter.",
          html: shell(
            "Deliveries",
            `<div class="page" style="position:relative">
  ${phead("Deliveries", "93 scheduled.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Search deliveries", views: ["Scheduled 93", "Past 148", "All 241"], active: 0 })}
  ${section(
    "",
    `<div class="rlist">
      ${[
        ["Garcia Interiors restock", "9 Oct 2026", "Scheduled", "info"],
        ["Becker Bouw restock", "16 Oct 2026", "Scheduled", "info"],
        ["Lindqvist Studio restock", "14 Mar 2026", "Draft", "neutral"],
      ]
        .map(([nm, when, st, tone], i) => `<div class="rrow${i === 0 ? " sel" : ""}">
        <span class="txt"><b>${nm}</b><small>${when} · ${DELIVERY.place}</small></span>
        ${badgeRaw(st, tone, "outline")}
        <span class="acts"><button class="btn sm">Rename</button> <button class="btn sm icon" aria-label="More actions for ${nm}">⋯</button></span>
      </div>`)
        .join("")}
    </div>`,
  )}
  <div class="scrim">
    ${dialog(
      "Rename this delivery",
      `<div class="stack">
        ${field("Name", input("Garcia Interiors restock"), { help: "Customers see this. 96 orders already carry the old name on their paperwork, which does not change.", required: true })}
      </div>`,
      { footer: '<button class="btn">Cancel</button><button class="btn primary">Rename it</button>' },
    )}
  </div>
</div>`,
            "Orders",
          ),
        },
        {
          name: "Editing blocked, with the reason and the way out",
          rationale:
            "A change that the record's own state forbids. The field is read-only, the reason is stated on the field, and the command that would unblock it is named.",
          tradeoff:
            "The reader has to leave to unblock and come back, and whatever they typed is only kept if the page holds it. Read-only plus a link is the compromise.",
          html: shell(
            "Pricing",
            `<div class="page" style="max-width:560px">
  ${trail("Home", "Products", PRODUCT.name, "Pricing")}
  <div class="phead"><div><h1>Pricing</h1><p class="desc">${PRODUCT.name} went on sale 12 Jan 2026. ${MONEY.lamp} is the price the 412 sold units carry.</p></div></div>
  ${section(
    "",
    `<div class="form">
      <div class="field">
        <label>Standard, in euros <span class="req" aria-hidden="true">*</span></label>
        <span class="inp-wrap" style="position:relative;display:flex;align-items:center"><span aria-hidden="true" style="position:absolute;left:9px;font-size:12.5px;color:var(--muted-foreground)">&euro;</span><input class="inp money" style="padding-left:24px" value="45.00" readonly inputmode="decimal"></span>
        <span class="help">The price the customers who already bought were charged. It cannot change.</span>
        <div class="explained" style="margin-top:4px">
          <button class="btn sm" aria-disabled="true">Change the price everyone paid</button>
          <span class="why">412 units carry ${MONEY.lamp}. A charge already priced has to stay reconstructable, so it is kept rather than changed. <a href="#" style="text-decoration:underline">Price the remaining stock instead</a>.</span>
        </div>
      </div>
      ${field("Price for the stock still on sale, in euros", `<span class="inp-wrap" style="position:relative;display:flex;align-items:center"><span aria-hidden="true" style="position:absolute;left:9px;font-size:12.5px;color:var(--muted-foreground)">&euro;</span><input class="inp money" style="padding-left:24px" value="50.00" inputmode="decimal"></span>`, { help: "The 88 units that are still for sale.", required: true })}
      <div class="btnrow end" style="border-top:1px solid var(--border);padding-top:12px"><button class="btn primary">Save the new price</button></div>
    </div>`,
  )}
</div>`,
            "Products",
          ),
        },
        {
          name: "Autosave, with the saved state always visible",
          rationale:
            "The way Notion saves: there is no Save button, every keystroke lands, and the header always says when. A description edited over an afternoon cannot be lost to a closed tab.",
          tradeoff:
            "Two people typing at once overwrite each other without noticing, and every keystroke is an audit entry unless the trail groups them. It fits free text, not prices or counts.",
          reference: "Notion",
          html: shell(
            "Oak desk lamp",
            `<div class="page ce-page ce-narrow">
  ${trail("Home", "Products", "Desk lamps", PRODUCT.name)}
  <div class="phead">
    <div><h1>${PRODUCT.name} ${badgeRaw("On sale", "positive")}</h1><p class="desc">What this product is, and the labelling rule its units carry.</p></div>
    <div class="acts"><span class="muted" style="font-size:12px">Saved 14:22</span><button class="btn sm">History</button></div>
  </div>
  ${notice("info", "Every change saves as you type. The warehouse reads the saved version within a minute.")}
  ${section(
    "",
    `<div class="form">
      ${field("Name", input(PRODUCT.name), { help: "Customers see this on the storefront and on the packing slip.", required: true })}
      ${field("Description", '<textarea class="ta">Solid oak desk lamp with a linen shade.</textarea>', { optional: true })}
      <div class="hr"></div>
      <div>
        <div style="font-size:12.5px;font-weight:500;margin-bottom:7px">How is each unit labelled?</div>
        <div class="radio-list">
          <label><input type="radio" name="n"><span><b>No label</b><span class="cd">Units are identical and need no mark.</span></span></label>
          <label><input type="radio" name="n" checked><span><b>Batch label</b><span class="cd">The batch code is on the unit.</span></span></label>
          <label><input type="radio" name="n"><span><b>Serial per unit</b><span class="cd">Each unit carries its own serial before dispatch.</span></span></label>
        </div>
      </div>
    </div>`,
  )}
</div>`,
            "Products",
          ),
        },
        {
          name: "Edit in a side panel, the list still visible",
          rationale:
            "The way HubSpot edits a record: the list stays on screen and the form opens beside it. Renaming twelve deliveries in a row means twelve saves without twelve page loads.",
          tradeoff:
            "It breaks the rule that a form is a dialog or a page, never a drawer, so create and edit would disagree about where a form lives. The panel is also too narrow for sections or steps.",
          reference: "HubSpot",
          html: shell(
            "Deliveries",
            `<div class="page ce-page" style="position:relative">
  ${phead("Deliveries", "93 scheduled.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Search deliveries", views: ["Scheduled 93", "Past 148", "All 241"], active: 0 })}
  ${section(
    "",
    `<div class="rlist">
      ${[
        ["Garcia Interiors restock", "9 Oct 2026", "Scheduled", "info"],
        ["Becker Bouw restock", "16 Oct 2026", "Scheduled", "info"],
        [DELIVERY.name, DELIVERY.date, "Draft", "neutral"],
      ]
        .map(
          ([nm, when, st, tone], i) => `<div class="rrow${i === 0 ? " sel" : ""}">
        <span class="txt"><b>${nm}</b><small>${when} · ${DELIVERY.place}</small></span>
        ${badgeRaw(st, tone, "outline")}
        <span class="acts"><button class="btn sm">Rename</button></span>
      </div>`,
        )
        .join("")}
    </div>`,
  )}
  ${drawer(
    `<header><div><h3>Rename this delivery</h3><p>Garcia Interiors restock · 9 Oct 2026</p></div></header><div class="dbody"><div class="form">${field("Name", input("Garcia Interiors restock"), { help: "Customers see this. Orders already placed keep the old name on their paperwork.", required: true })}${field("Loading starts", input("09/10/2026 06:30"), { required: true })}</div></div>`,
    { footer: '<button class="btn">Cancel</button><button class="btn primary">Save</button>' },
  )}
</div>`,
            "Orders",
          ),
        },
      ],
    },
    {
      id: "remove-shape",
      title: "Removing something",
      why: "The evidence points one way: <b>prefer archive over delete</b>. Shopify says product deletion is irreversible and suggests archiving instead; Google Drive's trash empties after 30 days; GitHub's repository deletion is recoverable for 90 days. No cited system publishes a pattern for deletion blocked by dependent records.",
      verdict:
        "Archive stays the pick: it is reversible, it keeps the audit trail, and the Archived view is the way back. The thirty-day trash is the runner-up where delete is the verb the reader reaches for, because it keeps the reversibility without keeping two hiding verbs. Never ship a bare delete for anything with history; the delete dialog is only for records that must go, and it must say what is kept. The Undo toast earns its place for small reversible removes such as a plan entry.",
      variants: [
        {
          name: "Archive, with what archiving means",
          pick: true,
          rationale:
            "Archive is the default removal. The dialog says what stops being visible and what is kept, and the record keeps its place with a state that says it is archived.",
          tradeoff:
            "The reader now has two ways to hide something, archive and delete, and a list that shows both needs a view or a filter separating them.",
          html: shell(
            "Deliveries",
            `<div class="page">
  ${phead("Deliveries", "93 scheduled, 4 archived.", '<button class="btn sm">New delivery</button>', { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Search deliveries", views: ["Scheduled 93", "Past 148", "Archived 4", "All 245"], active: 0 })}
  ${section(
    "",
    `<div class="rlist">
      ${[
        ["Garcia Interiors restock", "9 Oct 2026", "Scheduled", "info"],
        ["Lindqvist Studio restock", "14 Mar 2026", "Draft", "neutral"],
        ["Okafor Office restock", "28 Feb 2026", "Archived", "neutral"],
      ]
        .map(
          ([nm, when, st, tone]) => `<div class="rrow">
        <span class="txt"><b style="${st === "Archived" ? "color:var(--muted-foreground)" : ""}">${nm}</b><small>${when} · ${DELIVERY.place}</small></span>
        ${badgeRaw(st, tone, st === "Archived" ? "" : "outline")}
        <span class="acts">${st === "Archived" ? '<button class="btn sm">Restore</button>' : '<button class="btn sm">Open</button> <button class="btn sm icon" aria-label="More actions for ' + nm + '">⋯</button>'}</span>
      </div>`,
        )
        .join("")}
    </div>`,
  )}
  <div style="position:absolute;right:220px;bottom:80px">
    ${menu([{ label: "Open" }, { label: "Duplicate this delivery" }, "-", { label: "Archive this delivery", danger: true }], { width: "200px" })}
  </div>
</div>`,
            "Orders",
          ),
        },
        {
          name: "Delete, where nothing may be archived",
          rationale:
            "Some records must go rather than be hidden. The dialog says the record is gone for good, and it names what is kept because a record of the decision outlives the record.",
          tradeoff:
            "Everything the company holds has to stay reconstructable for an audit, which means 'delete' removes the operational record and keeps the evidence. Two different things under one verb.",
          html: shell(
            "Incident",
            `<div class="page" style="position:relative">
  ${phead("Incident INC-0207", "14 Mar 2026 · loading bay.", '<button class="btn subtle-danger">Delete</button>', { crumb: trail("Home", "Orders", DELIVERY.name, "Incidents", "INC-0207") })}
  ${section(
    "What was recorded",
    `<div class="stack sm">
      <div class="split"><span>Who</span><span class="fig" style="white-space:normal;text-align:right;max-width:65%">A driver, no name given</span></div>
      <div class="split"><span>When</span><span class="fig" style="white-space:normal;text-align:right;max-width:65%">14 Mar 2026, 08:41</span></div>
      <div class="split"><span>What</span><span class="fig" style="white-space:normal;text-align:right;max-width:65%">Presented another customer's pickup slip</span></div>
      <div class="split"><span>Who decided</span><span class="fig" style="white-space:normal;text-align:right;max-width:65%">${PEOPLE.warehouse.name}</span></div>
      <div class="split"><span>Why</span><span class="fig" style="white-space:normal;text-align:right;max-width:65%">The original could not be produced, so nothing was handed over</span></div>
    </div>`,
  )}
  <div class="scrim">
    ${dialog(
      "Delete this incident?",
      `<div style="font-size:12.5px">The incident record is removed. ${PEOPLE.warehouse.name}'s decision and the time it was taken are kept, because the dispatch log has to hold them.</div>
      <div class="callout destructive" style="margin-top:11px">This cannot be undone. Nothing about the decision is lost.</div>`,
      { footer: '<button class="btn">Keep it</button><button class="btn danger">Delete the record</button>' },
    )}
  </div>
</div>`,
            "Orders",
          ),
        },
        {
          name: "Removal blocked, naming what blocks it",
          rationale:
            "The command cannot run because something depends on the record. The dialog names the dependency and the command that deals with it, rather than refusing with a bare code.",
          tradeoff:
            "No cited design system publishes this pattern, so it is an inference from the two cases that exist: Cloudscape's prerequisite-disabled button and the product page's explained refusal.",
          html: shell(
            "Delivery",
            `<div class="page" style="position:relative">
  ${phead("Okafor Office restock", "3 Nov 2026 · Rotterdam warehouse. 1,204 orders.", '<button class="btn subtle-danger">Archive</button>', { crumb: trail("Home", "Orders", "Okafor Office restock") })}
  <div class="scrim">
    ${dialog(
      "This delivery cannot be archived yet",
      `<div style="font-size:12.5px">Two product lines are still open. Open lines are promised to customers, so this delivery has to close before it can be archived.</div>
      <div class="alist" style="margin-top:11px">
        <div class="arow"><span class="why" aria-hidden="true">◈</span><span class="txt"><b>${PRODUCT.name}</b><small>412 of 500 committed. Open.</small></span><span class="go"><button class="btn sm">Close the line</button></span></div>
        <div class="arow"><span class="why" aria-hidden="true">◈</span><span class="txt"><b>Pine bookshelf</b><small>0 committed. Open.</small></span><span class="go"><button class="btn sm">Close the line</button></span></div>
      </div>`,
      { footer: '<button class="btn primary">Close both lines first</button>' },
    )}
  </div>
</div>`,
            "Orders",
          ),
        },
        {
          name: "Reversal rather than removal, for money",
          rationale:
            "A refund does not remove an order, it reverses it and leaves the record. The customer is shown the order before and after, so the reversal is visible as a fact rather than an absence.",
          tradeoff:
            "The record grows rather than shrinks, and a list of orders has to be able to show an order that has been fully reversed without it looking empty.",
          html: shell(
            "Order",
            `<div class="page">
  ${phead(`${ORDER.number} ${badgeRaw("Refunded", "neutral")}`, `Fully refunded 8 Oct 2026, 11:04, by ${PEOPLE.finance.name}.`, '<button class="btn sm">Message customer</button>', { crumb: trail("Home", "Orders", ORDER.number) })}
  ${section(
    "The money, before and after",
    `<div class="stmt">
      <div class="line"><span>Paid by the customer<span class="sub">8 Oct 2026, 09:34 · bank transfer</span></span><span class="fig">${MONEY.order}</span></div>
      <div class="line"><span>Refunded in full<span class="sub">8 Oct 2026, 11:04 · bank transfer, to the same account</span></span><span class="fig">-${MONEY.order}</span></div>
      <div class="sub-total"><span>Still to refund</span><span class="fig">EUR 0.00</span></div>
      <div class="line" style="padding-top:6px"><span class="muted">The delivery fee came back to ${COMPANY.name} and is being settled on 4 November.</span></div>
    </div>`,
  )}
  ${section("What was ordered", `<div class="rlist">${recordRow({ title: `${PRODUCT.name}, 2 units`, sub: "Returned at 11:04 and back in stock", state: { label: "Returned", tone: "neutral" } })}${recordRow({ title: "Pine bookshelf", sub: "Collected at the counter", state: { label: "Returned", tone: "neutral" } })}</div>`)}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Void, where the record must stay but stop counting",
          rationale:
            "A code that was issued and is being withdrawn. The code stops working, the code stays on the order, and the record says why.",
          tradeoff:
            "Void and refund are different verbs for different effects and a reader has to know which is which. Voiding a code that was already used is refused outright, because the order log holds that.",
          html: shell(
            "Order codes",
            `<div class="page">
  ${phead(ORDER.number, "2 codes, both unused.", '<button class="btn sm subtle-danger">Void a code</button>', { crumb: trail("Home", "Orders", ORDER.number, "Codes") })}
  ${section(
    "Discount codes",
    `<div class="rlist">
      ${recordRow({ title: "EUR 10.00 off", sub: "VC-0C893968A2 · one use per customer", state: { label: "Not used", tone: "neutral" }, actions: '<button class="btn sm">Void it</button>' })}
      ${recordRow({ title: "EUR 10.00 off", sub: "VC-0C893968A3 · one use per customer", state: { label: "Not used", tone: "neutral" }, actions: '<button class="btn sm">Void it</button>' })}
    </div>`,
    { desc: "Voiding replaces a code. The code stops working and the customer is sent a new one." },
  )}
  <div class="scrim">
    ${dialog(
      "Void this code",
      `<div class="stack">
        <div class="alert caution"><span class="ico" aria-hidden="true">!</span><span class="txt"><b>VC-0C893968A2 stops working at once.</b><small>${ORDER.customer} has to be sent a replacement, or they hold a code that no longer works and nobody has told them.</small></span></div>
        <label class="check"><input type="checkbox" checked><span>Send ${ORDER.customer} the replacement now<span class="cd">Otherwise they hold a code that no longer works and nobody has told them.</span></span></label>
        <label class="check"><input type="checkbox" checked><span>Keep the reason on the record<span class="cd">Support reads this in June. It is not shown to the customer.</span></span></label>
      </div>`,
      { footer: '<button class="btn">Cancel</button><button class="btn danger">Void and replace</button>' },
    )}
  </div>
</div>`,
            "Orders",
          ),
        },
        {
          name: "Suspend, for something that must keep running",
          rationale:
            "Pause rather than remove: the record keeps every property, it stops accepting what it accepts, and the page says what is still possible while it is paused.",
          tradeoff:
            "A pause is invisible to a customer unless something tells them, so 'what happens to somebody who tries to order while this is paused' has to be answered by the same page.",
          html: shell(
            "Storefront",
            `<div class="page">
  ${phead("Storefront", "Your own address. Paused since 2 Oct 2026, 14:22.", '<button class="btn primary">Take it off pause</button>', { crumb: trail("Home", "Products", "Storefront") })}
  ${`<div class="alert caution" style="margin-bottom:14px"><span class="ico" aria-hidden="true">!</span><span class="txt"><b>Nothing can be bought here.</b><small>Orders already placed still ship. A customer who knows this address sees a message rather than the products.</small></span><span class="tail"><button class="btn sm">See the message customers get</button></span></div>`}
  ${section("What is still true", facts([["Address", "shop.acme-supply.example"], ["Products listed", "48 on sale"], ["Orders placed", "1,204, all unchanged"], ["Customers", "1,204"], ["Units committed", "412, all still shipping"]]))}
  ${section("What a customer sees", `<div class="preview"><div class="pv-body"><h4>${COMPANY.name}</h4><p>This shop is not taking orders at the moment. Orders already placed still ship.</p><span style="font-size:11.5px;color:var(--muted-foreground)">You can still reach your orders in your account.</span></div></div>`)}
</div>`,
            "Products",
          ),
        },
        {
          name: "Trash with thirty days to change your mind",
          rationale:
            "The way Google Drive removes: delete moves the record to a trash that empties itself after thirty days. The verb stays delete, which is what the reader reaches for, and the reversibility stays too.",
          tradeoff:
            "There is still a day when the record goes for good, and the trash needs its own view, its own emptying rule, and an answer for records with placed orders. Those cannot sit in a trash the same way.",
          reference: "Google Drive",
          html: shell(
            "Deliveries",
            `<div class="page ce-page">
  ${phead("Deliveries", "93 scheduled, 3 in the trash.", '<button class="btn sm subtle-danger">Empty the trash</button>', { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Search deliveries", views: ["Scheduled 93", "Past 148", "Trash 3", "All 244"], active: 2 })}
  ${notice("info", "The trash empties itself after 30 days. Placed orders are never in it: their record stays either way.")}
  ${section(
    "",
    `<div class="rlist">
      ${[
        ["Okafor Office restock", "28 Feb 2026", "Deletes 7 Nov 2026"],
        ["Becker Bouw trial", "13 Oct 2026", "Deletes 21 Oct 2026"],
        ["Lindqvist Studio samples", "27 Oct 2026", "Deletes 12 Oct 2026"],
      ]
        .map(
          ([nm, when, gone]) => `<div class="rrow">
        <span class="txt"><b style="color:var(--muted-foreground)">${nm}</b><small>${when} · ${DELIVERY.place}</small></span>
        <span class="fig"><small>${gone}</small></span>
        <span class="acts"><button class="btn sm">Restore</button><button class="btn sm subtle-danger">Delete now</button></span>
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
          name: "No confirmation, one Undo in a toast",
          rationale:
            "The way Gmail removes mail: the command applies at once and the toast carries the way back for eight seconds. Removing a plan entry is too small for a dialog and exactly the size of an Undo.",
          tradeoff:
            "It only fits what is cheap to reverse. Money, orders and anything the audit trail must hold still need the dialog that says what happens, because an Undo that expires is not a record.",
          reference: "Gmail",
          html: shell(
            "Delivery plan",
            `<div class="page ce-page" style="position:relative;min-height:380px">
  ${phead(DELIVERY.name, "Delivery plan · 5 entries.", '<button class="btn sm">Add to the plan</button>', { crumb: trail("Home", "Orders", ORDER.number, "Delivery", "Plan") })}
  ${section("Delivery plan", `<div class="rlist">
      ${[
        ["Loading bay booked", "08:00", PEOPLE.warehouse.name],
        [`${PEOPLE.warehouse.name} on dispatch`, "07:30", PEOPLE.warehouse.name],
        ["Stock check", "06:30", ""],
        ["Labels printed", "07:00", ""],
        ["Bay handover", "12:00", ""],
      ]
        .map(([what, when, who]) => recordRow({ title: what, sub: who ? `${who} · set 2 Oct` : "", fig: when, actions: '<button class="btn sm icon" aria-label="More actions">⋯</button>' }))
        .join("")}
    </div>`, { desc: "Entries are sorted by their start time." })}
  <div class="ce-toast-spot">${toast("info", `${PEOPLE.support.name} on customer messages was removed.`, { undo: true })}</div>
</div>`,
            "Orders",
          ),
        },
      ],
    },
    {
      id: "remove-bulk",
      title: "Removing several at once",
      why: "A bulk removal is the case where a confirmation stops being a speed bump and starts being a safety net, because the count itself is the risk.",
      verdict:
        "The dialog naming the count and the money stays the pick up to about twenty-five rows: the two figures are what the reader must check. The background job is the runner-up past that, where a dialog cannot carry the list and a report must land afterwards. Never ship the typed count for an ordinary bulk remove; it trains copy and paste, and it belongs only to the irreversible import undo. The dry-run plan earns its place where rows can refuse, because it shows the refusals before anything runs.",
      variants: [
        {
          name: "A dialog naming the count and the money",
          pick: true,
          rationale:
            "A bulk refund confirmation, which lists the records and totals the money before the commit button. The count and the amount are the two things a reader must check.",
          tradeoff:
            "Twenty-five rows in a dialog is a scroll inside a dialog. Past about five, the total carries the meaning and the list is a detail the reader cannot afford to read.",
          html: shell(
            "Refunds",
            `<div class="page" style="position:relative">
  ${phead("Refunds", "31 orders. 3 selected.", "", { crumb: trail("Home", "Orders", "Refunds") })}
  ${toolbar({ search: "", placeholder: "Search refunds", filters: ["Any window"] })}
  <div class="section" style="margin-bottom:10px;border-color:var(--ring)">
    <div class="body"><div class="btnrow between">
      <span style="font-size:12.5px"><b>3 selected</b> <span class="muted">· EUR 175.45</span></span>
      <span class="btnrow"><button class="btn sm ghost">Clear</button><button class="btn primary sm">Refund these 3</button></span>
    </div></div>
  </div>
  ${section("", `<table class="dt dense">
    <thead><tr><th class="check"><input type="checkbox" checked aria-label="Select all"></th><th scope="col">Order</th><th scope="col">Customer</th><th scope="col" class="num">Amount</th></tr></thead>
    <tbody>
      ${[
        ["SO-1042", ORDER.customer, MONEY.lineTotal],
        ["SO-1041", "Tom Becker", "EUR 40.45"],
        ["SO-1040", "Elin Lindqvist", MONEY.lamp],
        ["SO-1039", "Tom Becker", MONEY.lamp],
      ].map(([no, who, amt], i) => `<tr${i < 2 ? ' class="sel"' : ""}><td class="check"><input type="checkbox" ${i < 2 ? "checked" : ""} aria-label="Select ${no}"></td><td><span class="code">${no}</span></td><td>${who}</td><td class="num">${amt}</td></tr>`).join("")}
    </tbody>
  </table>`, { flush: true })}
  <div class="scrim">
    ${dialog(
      "Refund 3 orders in full?",
      `<div class="stmt">
        <div class="line"><span>${ORDER.customer}<span class="sub">SO-1042</span></span><span class="fig">${MONEY.lineTotal}</span></div>
        <div class="line"><span>Tom Becker<span class="sub">SO-1041</span></span><span class="fig">EUR 40.45</span></div>
        <div class="line"><span>Elin Lindqvist<span class="sub">SO-1040</span></span><span class="fig">${MONEY.lamp}</span></div>
        <div class="sub-total"><span>Total going back</span><span class="fig">EUR 175.45</span></div>
      </div>`,
      { footer: '<button class="btn">Cancel</button><button class="btn danger">Refund 3 orders</button>' },
    )}
  </div>
</div>`,
            "Orders",
          ),
        },
        {
          name: "A dialog that names the scope it is about to use",
          rationale:
            "Where the selection could be page-scoped or filter-scoped, the dialog says which. Gmail's banner exists for exactly this and Shopify documents the same escalation.",
          tradeoff:
            "Two sentences of scope in a dialog about money, and the reader has to check the number as well as the amount. Both are worth checking, and the dialog carries both.",
          reference: "Gmail",
          html: shell(
            "Refunds",
            `<div class="page" style="position:relative">
  ${phead("Refunds", "31 orders. 25 on this page are selected.", "", { crumb: trail("Home", "Orders", "Refunds") })}
  ${`<div class="alert info" style="margin-bottom:8px"><span class="txt"><b>All 25 on this page are selected.</b><small>1,204 refunds match this filter in total.</small></span><span class="tail"><button class="btn sm">Select all 1,204</button></span></div>`}
  ${section("", `<table class="dt dense">
    <thead><tr><th class="check"><input type="checkbox" checked aria-label="Select all"></th><th scope="col">Order</th><th scope="col">Customer</th><th scope="col" class="num">Amount</th></tr></thead>
    <tbody>
      ${[
        ["SO-1042", ORDER.customer, MONEY.lineTotal],
        ["SO-1041", "Tom Becker", "EUR 40.45"],
        ["SO-1040", "Elin Lindqvist", MONEY.lamp],
        ["SO-1039", "Tom Becker", MONEY.lamp],
      ].map(([no, who, amt]) => `<tr class="is-sel"><td class="check"><input type="checkbox" checked aria-label="Select ${no}"></td><td><span class="code">${no}</span></td><td>${who}</td><td class="num">${amt}</td></tr>`).join("")}
    </tbody>
  </table>`, { flush: true })}
  <div class="scrim">
    ${dialog(
      "Refund the 25 on this page?",
      `<div style="font-size:12.5px"><b>Only these 25</b>, out of the 1,204 refunds that match this filter. The other 1,179 are not touched.</div>
      <div class="stmt" style="margin-top:11px">
        <div class="line"><span>Order money going back</span><span class="fig">EUR 1,204.50</span></div>
        <div class="line"><span>Of which the bank may refuse</span><span class="fig">EUR 225.00</span></div>
        <div class="sub-total"><span>Taken off the ${COMPANY.name} balance</span><span class="fig">EUR 1,204.50</span></div>
      </div>
      <div class="callout caution" style="margin-top:11px">6 of the 25 are older than 180 days. This payment method will not take those back.</div>`,
      { footer: ceVFoot('<button class="btn danger">Refund these 25</button>', '<button class="btn">Cancel</button>', '<button class="btn ghost">Select all 1,204 instead</button>') },
    )}
  </div>
</div>`,
            "Orders",
          ),
        },
        {
          name: "Bulk removal as a bulk archive, then a dialog for the record",
          rationale:
            "Archive is cheap and reversible, so a bulk archive needs only a count. The dialog appears once per record type rather than once per selection.",
          tradeoff:
            "Archiving 200 deliveries hides 200 deliveries, and the reader has no way back except an Archived view. The safety net is the view, not the dialog.",
          html: shell(
            "Deliveries",
            `<div class="page" style="position:relative">
  ${phead("Deliveries", "241 in all. 4 selected.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Search deliveries", views: ["Scheduled 93", "Past 148", "Archived 4", "All 245"], active: 2 })}
  <div class="section" style="margin-bottom:10px;border-color:var(--ring)">
    <div class="body"><div class="btnrow between">
      <span style="font-size:12.5px"><b>4 selected</b> <span class="muted">· all completed, none scheduled</span></span>
      <span class="btnrow"><button class="btn sm ghost">Clear</button><button class="btn sm">Restore</button><button class="btn primary sm">Archive these 4</button></span>
    </div></div>
  </div>
  ${section("", `<div class="rlist">
    ${[
      ["Okafor Office restock", "3 Nov 2026, completed"],
      ["Lindqvist Studio samples", "27 Oct 2026, completed"],
      ["Becker Bouw trial", "13 Oct 2026, completed"],
      ["Okafor Office samples", "28 Feb 2026, completed"],
    ].map(([nm, when], i) => `<div class="rrow"${i < 2 ? ' style="background:var(--muted)"' : ""}>
      <span class="check"><input type="checkbox" ${i < 2 ? "checked" : ""} aria-label="Select ${nm}"></span>
      <span class="txt"><b>${nm}</b><small>${when}</small></span>
      <span class="acts"><button class="btn sm">Open</button></span>
    </div>`).join("")}
  </div>`, { flush: true })}
</div>`,
            "Orders",
          ),
        },
        {
          name: "A partial bulk refusal: some rows will not do it",
          rationale:
            "When some of the selection cannot take the command, the dialog says which and why before anything runs, and offers to do the rest.",
          tradeoff:
            "A partial result has to be reportable afterwards as well, so the reader ends up reading the same information twice. Better to refuse the whole batch and let them narrow it.",
          html: shell(
            "Refunds",
            `<div class="page" style="position:relative">
  ${phead("Refunds", "31 orders. 3 selected.", "", { crumb: trail("Home", "Orders", "Refunds") })}
  ${toolbar({ search: "", placeholder: "Search refunds" })}
  ${section("", `<table class="dt dense">
    <thead><tr><th class="check"><input type="checkbox" aria-label="Select all"></th><th scope="col">Order</th><th scope="col">Customer</th><th scope="col" class="num">Amount</th></tr></thead>
    <tbody>
      ${[
        ["SO-1042", ORDER.customer, MONEY.lineTotal],
        ["SO-1040", "Elin Lindqvist", MONEY.lamp],
        ["SO-1038", "Ade Okafor", MONEY.lamp],
      ].map(([no, who, amt]) => `<tr class="is-sel"><td class="check"><input type="checkbox" checked aria-label="Select ${no}"></td><td><span class="code">${no}</span></td><td>${who}</td><td class="num">${amt}</td></tr>`).join("")}
    </tbody>
  </table>`, { flush: true })}
  <div class="scrim">
    ${dialog(
      "Refund 1 of the 3?",
      `<div style="font-size:12.5px">Two of these are outside the refund window of this payment method, so the bank will refuse them.</div>
      <div class="stack sm" style="margin-top:11px">
        <div class="alert positive"><span class="txt"><b>SO-1042 · ${MONEY.lineTotal}</b><small>${ORDER.customer}, 6 days old. The bank will take this one.</small></span></div>
        <div class="alert destructive"><span class="txt"><b>SO-1040 · ${MONEY.lamp}</b><small>Elin Lindqvist, 181 days old. Outside the window.</small></span></div>
        <div class="alert destructive"><span class="txt"><b>SO-1038 · ${MONEY.lamp}</b><small>Ade Okafor, 214 days old. Outside the window.</small></span></div>
      </div>
      <div class="callout" style="margin-top:11px">For the two outside the window, offer credit or record a bank transfer instead.</div>`,
      { footer: ceVFoot('<button class="btn danger">Refund the one that works</button>', '<button class="btn">Cancel</button>', '<button class="btn ghost">Offer credit to all 3 instead</button>') },
    )}
  </div>
</div>`,
            "Orders",
          ),
        },
        {
          name: "A typed confirmation for a bulk removal",
          rationale:
            "Where a bulk removal is genuinely dangerous, type the count. The number is the thing being confirmed, not the name of one record.",
          tradeoff:
            "Typing 200 trains copy and paste, which is the reflex the pattern exists to break. Cloudscape's own restriction is to the most dangerous object, and this is many objects.",
          html: shell(
            "Data imports",
            `<div class="page" style="position:relative">
  ${phead("Data imports", "4 imports. 1 holds 1,988 orders.", '<button class="btn subtle-danger">Undo this import</button>', { crumb: trail("Home", "Settings", "Data imports", "IMP-4F82C1A9") })}
  ${section("What was imported", `<div class="stmt">
      <div class="line"><span>Orders created</span><span class="fig">1,988</span></div>
      <div class="line"><span>Order lines created</span><span class="fig">2,361</span></div>
      <div class="line"><span>Amount charged to anybody</span><span class="fig">EUR 0.00</span></div>
    </div>`, { desc: "Finished 8 Oct 2026, 14:22. Nothing has been charged." })}
  <div class="scrim">
    ${dialog(
      "Undo this import?",
      `<div style="font-size:12.5px">This removes 1,988 orders and 2,361 order lines. The dispatch on ${DELIVERY.date} would no longer release anything from this file.</div>
      <div class="field" style="margin-top:12px">
        <label>Type <span class="mono">1,988</span> to confirm</label>
        <input class="inp mono" style="width:120px" placeholder="0" aria-describedby="u-h">
        <span class="help" id="u-h">The number of orders it would remove.</span>
      </div>`,
      { footer: '<button class="btn">Keep the import</button><button class="btn danger" disabled>Undo the import</button>' },
    )}
  </div>
</div>`,
            "Settings",
          ),
        },
        {
          name: "A bulk removal that is a cancellation, with consequences per row",
          rationale:
            "Cancelling a plan of deliveries is one command with several effects, and the dialog lists them per row rather than as a total. What the reader needs is not the sum but which deliveries have customers.",
          tradeoff:
            "A dialog that varies per row is a table in a dialog, which is a page. Past a handful of rows, the consequence list belongs on a page of its own.",
          html: shell(
            "Plan",
            `<div class="page" style="position:relative">
  ${phead("March restock plan", "Four deliveries, 214 units committed between them.", '<button class="btn subtle-danger">Cancel the plan</button>', { crumb: trail("Home", "Orders", "Plans", "March restock plan") })}
  ${section(
    "The four deliveries",
    `<table class="dt dense">
      <thead><tr><th scope="col">Delivery</th><th scope="col">Date</th><th scope="col" class="num">Committed</th><th scope="col" class="num">Delivered</th></tr></thead>
      <tbody>
        ${[
          ["Delivery 8", "27 Oct 2026", "86", "86"],
          ["Delivery 9", "3 Nov 2026", "71", "0"],
          ["Delivery 10", "10 Nov 2026", "57", "0"],
          ["Delivery 11", "17 Nov 2026", "0", "0"],
        ].map(([s, d, sold, adm]) => `<tr><td><b>${s}</b></td><td class="nowrap">${d}</td><td class="num">${sold}</td><td class="num">${adm}</td></tr>`).join("")}
      </tbody>
    </table>`,
    { flush: true },
  )}
  <div class="scrim">
    ${dialog(
      "Cancel the March restock plan?",
      `<div class="stack sm" style="font-size:12.5px">
        <div><b>86 units were delivered</b> on delivery 8 on 27 Oct. That delivery cannot be called back.</div>
        <div><b>128 units</b> on deliveries 9 and 10 would be refunded, EUR 5,760.00 in total, on the payment each customer used.</div>
        <div>Delivery 11 has no units and is simply removed.</div>
        <div>The plan keeps its record. You can read it in June and it says what happened.</div>
      </div>
      <div class="callout destructive" style="margin-top:11px">The 86 delivered units are with the customers. Nothing in the back office can undo that.</div>`,
      { footer: '<button class="btn">Keep the plan</button><button class="btn danger">Cancel the plan</button>' },
    )}
  </div>
</div>`,
            "Orders",
          ),
        },
        {
          name: "A background job with a report, for the large ones",
          rationale:
            "The way Shopify runs bulk operations: past a size no dialog can carry, the selection runs as a job and a report lands afterwards. Refunding 1,204 orders cannot be checked on screen, so it is checked in the report instead.",
          tradeoff:
            "The reader walks away and comes back, so the job needs progress, a cancel, and a report that names every row it refused. A job that fails halfway also needs a rule for what already ran.",
          reference: "Shopify",
          html: shell(
            "Bulk jobs",
            `<div class="page ce-page">
  ${phead("Bulk jobs", "One running. Reports land here and stay.", '<button class="btn sm">New bulk refund</button>', { crumb: trail("Home", "Orders", "Bulk jobs") })}
  ${section(
    "Running now",
    `<div class="stack">
      <div>
        <div class="inline" style="justify-content:space-between"><span style="font-size:12.5px;font-weight:500">Refund 1,204 orders in full</span>${badgeRaw("Running", "info")}</div>
        <div class="hint" style="margin:4px 0 8px">Started 8 Oct 2026, 14:22 by ${PEOPLE.finance.name}. 746 of 1,204 done.</div>
        ${progress(62)}
        <div class="btnrow" style="margin-top:8px"><button class="btn sm">Cancel the rest</button></div>
      </div>
    </div>`,
  )}
  ${section(
    "Finished",
    `<div class="rlist">
      ${recordRow({ title: "Archive 200 completed deliveries", sub: `Finished 8 Oct 2026, 11:04 · started by ${PEOPLE.manager.name}`, state: { label: "200 archived", tone: "positive" }, actions: '<button class="btn sm">Read the report</button>' })}
      ${recordRow({ title: "Refund 86 order lines", sub: "Finished 7 Oct 2026, 16:40 · 2 refused, outside the payment window", state: { label: "84 refunded", tone: "caution" }, actions: '<button class="btn sm">Read the report</button>' })}
    </div>`,
  )}
</div>`,
            "Orders",
          ),
        },
        {
          name: "A dry run first, the way a migration previews",
          rationale:
            "The way Terraform plans before it applies: a page that says what each row will do, so the refusals are read before anything runs rather than after. Three rows fit; three hundred still fit, because it is a page.",
          tradeoff:
            "The plan can go stale between reading and applying: a payment can settle, a window can close. The apply step must recheck every row and say which answer changed.",
          reference: "Terraform",
          html: shell(
            "Plan",
            `<div class="page ce-page ce-mid">
  ${phead("Plan: refund 3 orders", "Nothing has run. This is what would happen.", "", { crumb: trail("Home", "Orders", "Refunds", "Plan") })}
  ${section(
    "",
    `<table class="dt">
      <thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col" class="num">Amount</th><th scope="col">What would happen</th></tr></thead>
      <tbody>
        <tr><td><span class="code">${ORDER.number}</span></td><td>${ORDER.customer}</td><td class="num">${MONEY.lineTotal}</td><td>${badgeRaw("Will refund", "positive", "outline")}</td></tr>
        <tr><td><span class="code">SO-1040</span></td><td>Elin Lindqvist</td><td class="num">${MONEY.lamp}</td><td>${badgeRaw("Will refuse", "destructive", "outline")} <span class="muted" style="font-size:11.5px">181 days old</span></td></tr>
        <tr><td><span class="code">SO-1038</span></td><td>Ade Okafor</td><td class="num">${MONEY.lamp}</td><td>${badgeRaw("Will refuse", "destructive", "outline")} <span class="muted" style="font-size:11.5px">214 days old</span></td></tr>
      </tbody>
    </table>`,
    { flush: true },
  )}
  ${callout("caution", "Two orders are outside the refund window of this payment method. Offer credit or record a bank transfer for those two instead.")}
  ${section("Totals", statement([{ label: "Refunds", lines: [{ what: "1 order, on the original payment", amount: MONEY.lineTotal }], totalLabel: "Taken off the company balance", total: MONEY.lineTotal }], { label: "Not in this plan", amount: "EUR 90.00" }))}
  ${ceFoot('<button class="btn ghost">Back to the selection</button>', '<button class="btn">Discard the plan</button><button class="btn danger">Apply to the 1 that works</button>')}
</div>`,
            "Orders",
          ),
        },
      ],
    },
    {
      id: "create-then-fill",
      title: "Creating a record and then filling it in",
      why: "One answer is a setup section on the home page and a getting-started page. The alternative is to require everything at creation.",
      verdict:
        "Create with a name and fill the rest later stays the pick: the record exists as a draft and every later addition is its own audited command. The home-page setup guide is the runner-up and the required companion, because a draft nobody is prompted to finish is a dead record. Never ship everything-required-before-the-record-exists, which blocks pencilling in a date, or nothing-until-publish, which loses the work with the browser. The point-of-use nudge earns its place beside the checklist for readers who skip guides.",
      variants: [
        {
          name: "Create with a name, fill the rest later",
          pick: true,
          rationale:
            "The name is the only required field, and the record exists as a draft. Every later addition is its own command, each audited, each reconstructable.",
          tradeoff:
            "A draft delivery is nearly useless on its own, and if nothing ever prompts the reader to finish it, it sits unfinished on a list. The setup section is the counterweight.",
          html: shell(
            "Delivery created",
            `<div class="page">
  ${phead(DELIVERY.name, "Draft. Nothing about it is scheduled yet.", '<button class="btn primary">Finish it</button>', { crumb: trail("Home", "Orders", DELIVERY.name) })}
  ${`<div class="alert info" style="margin-bottom:14px"><span class="ico" aria-hidden="true">i</span><span class="txt"><b>A draft cannot take money.</b><small>It needs a date, a warehouse, at least one priced product and a channel before a customer can order anything.</small></span></div>`}
  ${section(
    "Four things this delivery still needs",
    `<div class="alist">
      <div class="arow"><span class="why" aria-hidden="true">✓</span><span class="txt"><b>Name</b><small>${DELIVERY.name}. Set on 8 Oct 2026.</small></span></div>
      <div class="arow"><span class="why" aria-hidden="true">◷</span><span class="txt"><b>When and where</b><small>No date, no warehouse. Nothing can be scheduled without them.</small></span><span class="go"><button class="btn sm primary">Set the date and warehouse</button></span></div>
      <div class="arow"><span class="why" aria-hidden="true">◈</span><span class="txt"><b>A product, priced</b><small>Nothing to order yet.</small></span><span class="go"><button class="btn sm">Add a product</button></span></div>
      <div class="arow"><span class="why" aria-hidden="true">▣</span><span class="txt"><b>A channel on sale</b><small>The storefront is published but lists nothing.</small></span><span class="go"><button class="btn sm">Put something on sale</button></span></div>
    </div>`,
  )}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Everything required before the record exists",
          rationale:
            "The record is not created until it is whole: name, date, warehouse, one product, one channel. Nothing half-made is ever in a list.",
          tradeoff:
            "A five-part form before anything exists, and a reader who only wants to pencil in a date has to do all of it.",
          html: shell(
            "New delivery",
            `<div class="page" style="max-width:600px">
  ${trail("Home", "Orders", "New delivery")}
  <div class="phead"><div><h1>New delivery</h1><p class="desc">Five things. A delivery cannot exist without them.</p></div></div>
  ${section(
    "",
    `<div class="stack lg">
      ${formSection("The delivery", "What it is called and what it carries.", field("Name", input(""), { required: true }) + field("Description", '<textarea class="ta"></textarea>', { optional: true }), { stacked: true })}
      ${`<div class="hr"></div>`}
      ${formSection("When and where", "The date, the hours and the warehouse.", field("Loading starts", input("", { placeholder: "dd/mm/yyyy --:--" }), { required: true }) + field("Departs", input("", { placeholder: "dd/mm/yyyy --:--" }), { required: true }) + field("Warehouse", '<select class="sel"><option>Choose a warehouse</option><option>Amsterdam warehouse</option></select>', { required: true }), { stacked: true })}
      ${`<div class="hr"></div>`}
      ${formSection("What is on sale", "At least one product, priced.", field("Product name", input("Oak desk lamp"), { required: true }) + field("Price, in euros", `<span class="inp-wrap" style="position:relative;display:flex;align-items:center"><span aria-hidden="true" style="position:absolute;left:9px;font-size:12.5px;color:var(--muted-foreground)">&euro;</span><input class="inp money" style="padding-left:24px" placeholder="45.00" inputmode="decimal"></span>`, { required: true }), { stacked: true })}
      ${`<div class="hr"></div>`}
      ${formSection("Where it sells", "One channel, on sale or scheduled.", field("Channel", '<select class="sel"><option selected>Storefront</option><option>Phone orders</option></select>', { required: true }) + field("When it goes on sale", input("", { placeholder: "dd/mm/yyyy --:--" }), { required: true }), { stacked: true })}
      <div class="btnrow end" style="border-top:1px solid var(--border);padding-top:12px"><button class="btn">Cancel</button><button class="btn primary">Create the delivery</button></div>
    </div>`,
  )}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Create from a series, where the series holds the parts",
          rationale:
            "The plan carries the warehouse, the delivery plan and the products, and each delivery is created already holding them. One create, many records, no repetition.",
          tradeoff:
            "A delivery created from a plan can be edited away from it, and then the two disagree. The plan has to state which fields are shared and what diverging means.",
          html: shell(
            "New delivery",
            `<div class="page" style="max-width:560px">
  ${trail("Home", "Orders", "Plans", "March restock plan", "New delivery")}
  <div class="phead"><div><h1>New delivery</h1><p class="desc">The March restock plan runs four deliveries. This is the fifth.</p></div></div>
  ${section(
    "What this delivery takes from the plan",
    `<div class="stack">
      ${[
        ["Warehouse", `${DELIVERY.place}`, "Shared. Changing it changes every delivery."],
        ["Products", "Oak desk lamp, Pine bookshelf", "Shared. Prices follow the plan."],
        ["Delivery plan", "6 entries", "Shared, copied into this delivery."],
        ["Team", `${PEOPLE.warehouse.name}, ${PEOPLE.support.name}`, "Not shared. Assign them again for this date."],
      ]
        .map(([k, v, note]) => `<div class="split" style="align-items:baseline"><span>${k}<span class="sub">${note}</span></span><span class="fig">${v}</span></div>`)
        .join("")}
    </div>`,
    { desc: "The plan holds what every delivery has in common, so a change to it reaches all of them." },
  )}
  ${section(
    "What this delivery sets",
    `<div class="form">
      ${field("Date", input("24/11/2026", { cls: "nowrap" }), { help: "Tuesdays, like every other delivery.", required: true })}
      ${field("Loading starts", input("06:30", { cls: "nowrap" }), { required: true })}
      <div class="btnrow end" style="border-top:1px solid var(--border);padding-top:12px"><button class="btn">Cancel</button><button class="btn primary">Create the delivery</button></div>
    </div>`,
  )}
</div>`,
            "Orders",
          ),
        },
        {
          name: "A checklist that closes itself",
          rationale:
            "After creation, the page is a checklist and each item is a command. Finishing the last item removes the checklist rather than leaving a ticked list.",
          tradeoff:
            "A checklist on every draft is a page of work before anything is usable, and it is one more place that has to know which commands are already done.",
          html: shell(
            "Delivery draft",
            `<div class="page" style="max-width:560px">
  ${trail("Home", "Orders", DELIVERY.name)}
  <div class="phead"><div><h1>${DELIVERY.name} ${badgeRaw("Draft", "neutral")}</h1><p class="desc">14 Mar 2026, loading 06:30 · ${DELIVERY.place}</p></div><div class="acts"><button class="btn primary">Publish</button></div></div>
  ${section(
    "Before this can sell",
    `<div class="stack sm">
      <label class="check"><input type="checkbox" checked disabled><span>Name and description<span class="cd">${DELIVERY.name}. Set 8 Oct.</span></span></label>
      <label class="check"><input type="checkbox" checked disabled><span>Date, hours and warehouse<span class="cd">14 Mar 2026 · ${DELIVERY.place}</span></span></label>
      <label class="check"><input type="checkbox" checked disabled><span>A product, priced<span class="cd">${PRODUCT.name} at ${MONEY.lamp}, 500 units</span></span></label>
      <label class="check"><input type="checkbox"><span>List it on the storefront<span class="cd">Nothing is on sale until it is listed.</span></span><button class="btn sm primary" style="margin-left:auto">List it</button></label>
      <label class="check"><input type="checkbox"><span>Write the dispatch plan<span class="cd">At least one dock and one bay, or nothing can leave.</span></span><button class="btn sm" style="margin-left:auto">Set it up</button></label>
      <label class="check"><input type="checkbox"><span>Assign the team<span class="cd">${PEOPLE.warehouse.name} and ${PEOPLE.support.name} have no assignment for this date.</span></span><button class="btn sm" style="margin-left:auto">Assign them</button></label>
    </div>`,
  )}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Create inside a wizard that ends at publish",
          rationale:
            "One flow from nothing to on sale: the delivery, its products, its channel and the publish step. The reader never lands on a draft they have to finish by hand.",
          tradeoff:
            "Carbon says simplify before you wizard, and a stepper is only for a linear flow of three or more steps. Going on sale really is linear, so this is the case a stepper exists for.",
          reference: "Carbon",
          html: shell(
            "New delivery",
            `<div class="page" style="max-width:560px">
  ${trail("Home", "Orders", "New delivery")}
  <div class="phead"><div><h1>New delivery</h1><p class="desc">Four steps. You can stop after the first and finish later.</p></div></div>
  <div class="steps" style="margin-bottom:18px">
    <span class="step done"><span class="n">✓</span>The delivery</span><span class="step-sep"></span>
    <span class="step now"><span class="n">2</span>The products</span><span class="step-sep"></span>
    <span class="step"><span class="n">3</span>Where it sells</span><span class="step-sep"></span>
    <span class="step"><span class="n">4</span>Publish</span>
  </div>
  ${section(
    "The products",
    `<div class="stack">
      <div class="stack sm">
        <div class="inline" style="justify-content:space-between"><span style="font-size:12.5px;font-weight:500">${PRODUCT.name}</span>${badgeRaw("Priced", "positive", "outline")}</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
          ${field("Price, in euros", `<span class="inp-wrap" style="position:relative;display:flex;align-items:center"><span aria-hidden="true" style="position:absolute;left:9px;font-size:12.5px;color:var(--muted-foreground)">&euro;</span><input class="inp money" style="padding-left:24px" value="45.00" inputmode="decimal"></span>`)}
          ${field("Units", input("500", { cls: "num" }))}
        </div>
      </div>
      <hr class="hr">
      <button class="btn sm">Add a second product</button>
      <div class="btnrow between" style="border-top:1px solid var(--border);padding-top:12px">
        <button class="btn ghost">Save and close</button><button class="btn">Back</button><button class="btn primary">Continue</button>
      </div>
    </div>`,
  )}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Nothing created until the reader says publish",
          rationale:
            "The form holds everything in the browser and nothing is written until the last click. One command, one audit entry, one record per creation.",
          tradeoff:
            "Losing the browser loses the work, and a five-step form held in memory is a lot to lose. The record's state during the form does not exist, so nothing else can read it.",
          html: shell(
            "Publish",
            `<div class="page" style="max-width:600px">
  ${trail("Home", "Orders", "New delivery", "Publish")}
  <div class="phead"><div><h1>Publish ${DELIVERY.name}</h1><p class="desc">Nothing has been saved yet. This is the last step.</p></div></div>
  ${section(
    "What will exist when you publish",
    `<div class="stmt">
      <div class="grp"><div class="glab">The delivery</div>
        <div class="line"><span>${DELIVERY.name}<span class="sub">A scheduled restock for an existing customer.</span></span><span class="fig">14 Mar 2026</span></div>
        <div class="line"><span>${DELIVERY.place}</span><span class="fig">40 pallets</span></div>
      </div>
      <div class="grp"><div class="glab">The products</div>
        <div class="line"><span>${PRODUCT.name}</span><span class="fig">${MONEY.lamp}</span></div>
        <div class="sub-total"><span>One product</span><span class="fig">500</span></div>
      </div>
    </div>`,
    { desc: "One command. One record in the audit trail." },
  )}
  ${section("Where it will sell", `<div class="rlist">${recordRow({ title: "Storefront", sub: "shop.acme-supply.example · published", state: { label: "Live", tone: "positive" }, actions: '<button class="btn sm">Change</button>' })}</div>`)}
  <div class="btnrow end" style="margin-top:14px"><button class="btn">Back to the form</button><button class="btn primary">Publish it</button></div>
</div>`,
            "Orders",
          ),
        },
        {
          name: "A setup guide on the home page, with progress",
          rationale:
            "The way Stripe onboards: the home page carries the setup as a guide with a progress bar, not as one more list. A reader who finished three of five sees two left every time they sign in.",
          tradeoff:
            "It sits at the top of the home page until it is done, and a guide nobody dismisses becomes a banner nobody reads. It needs a dismiss that stays dismissed per company, not per person.",
          reference: "Stripe",
          html: shell(
            "Home",
            `<div class="page ce-page">
  ${phead(`Good afternoon, ${PEOPLE.owner.name.split(" ")[0]}`, `Two things need you today. ${DELIVERY.name} is scheduled.`, '<button class="btn primary">New delivery</button>')}
  ${section(
    "Finish the setup",
    `<div class="stack sm">
      <div>
        <div class="inline" style="justify-content:space-between;margin-bottom:6px"><span style="font-size:12.5px">3 of 5 done</span><button class="btn xs ghost">Dismiss</button></div>
        ${progress(60)}
      </div>
      <div class="alist">
        <div class="arow"><span class="why" aria-hidden="true">✓</span><span class="txt"><b>Connect the bank payouts</b><small>Connected 2 Oct by ${PEOPLE.owner.name}.</small></span></div>
        <div class="arow"><span class="why" aria-hidden="true">✓</span><span class="txt"><b>Publish the storefront</b><small>shop.acme-supply.example, live since 2 Oct.</small></span></div>
        <div class="arow"><span class="why" aria-hidden="true">✓</span><span class="txt"><b>Write the dispatch plan</b><small>One dock and one bay for ${DELIVERY.name}.</small></span></div>
        <div class="arow"><span class="why" aria-hidden="true">◷</span><span class="txt"><b>Set the returns policy</b><small>Customers see this before they pay. It is still the default text.</small></span><span class="go"><button class="btn sm primary">Set it</button></span></div>
        <div class="arow"><span class="why" aria-hidden="true">◷</span><span class="txt"><b>Assign the team</b><small>${PEOPLE.warehouse.name} and ${PEOPLE.support.name} have no assignment for 14 Mar.</small></span><span class="go"><button class="btn sm">Assign them</button></span></div>
      </div>
    </div>`,
    { desc: "The five things every company does once. Nothing here touches money until the bank is connected." },
  )}
</div>`,
            "Home",
          ),
        },
        {
          name: "Nudges at the point of use, not a checklist",
          rationale:
            "The way Webflow gates publish: no checklist page, just the missing piece named where it is missing. The publish button says what it needs, and the section that needs it says so too.",
          tradeoff:
            "Five missing pieces mean five separate discoveries, and nothing tells the reader how much is left. It fits one gap, not a new company with five.",
          reference: "Webflow",
          html: shell(
            "Garcia Interiors restock",
            `<div class="page ce-page">
  ${phead(`${DELIVERY.name} ${badge(STATES.draft)}`, `${DELIVERY.date}, loading 06:30 · ${DELIVERY.place}.`, '<button class="btn primary" disabled>Publish</button>', { crumb: trail("Home", "Orders", DELIVERY.name) })}
  ${explained("Publish", "Two things are missing: a priced product and a channel on sale.")}
  ${section(
    "Products",
    `<div class="stack">
      ${emptyState("No product yet", "A customer cannot order what has no price. Add one to list this delivery.", '<button class="btn sm primary">Add a product</button>')}
    </div>`,
  )}
  ${section("Storefront", `<div class="stack sm"><div class="hint">Nothing is listed for ${DELIVERY.name}, so the storefront shows the delivery as coming soon. It goes on sale when the first product is listed.</div></div>`)}
</div>`,
            "Orders",
          ),
        },
      ],
    },
    {
      id: "edit-after-the-fact",
      title: "Changing something that has already happened",
      why: "A record of what is true now cannot always be edited. <b>A charge already priced must stay reconstructable</b>, which makes several edits structurally different rather than merely harder.",
      verdict:
        "Keeping the old value beside the new stays the pick: an order placed last month must still resolve to the delivery it was placed for. The dated correction is the runner-up where a fact was entered wrong, and the reversal is the only shape for money. Never ship a silent overwrite of anything priced or shipped; where no honest edit exists, the refusal with the newer way named is the option. The version history earns its place for names and text, and two-person approval for corrections to money.",
      variants: [
        {
          name: "The old value stays on the record beside the new",
          pick: true,
          rationale:
            "A rename shows what it was and when. The record never loses the earlier name, because an order placed last month must still resolve to the delivery it was placed for.",
          tradeoff:
            "Every edit grows the record, and a reader looking for 'what is this called' has to skip past what it used to be called.",
          html: shell(
            "Delivery renamed",
            `<div class="page">
  ${phead(DELIVERY.name, "Sat 14 Mar 2026 · Amsterdam warehouse. 1,204 orders.", '<button class="btn sm">Rename</button>', { crumb: trail("Home", "Orders", DELIVERY.name) })}
  ${section(
    "The name over time",
    `<div class="tl">
      ${timelineEntry("Garcia Interiors restock", "8 Oct 2026, 14:22", PEOPLE.manager.name)}
      ${timelineEntry("Garcia Interiors March order", "12 Jan 2026, 09:04", PEOPLE.manager.name)}
      ${timelineEntry("Garcia Q1 restock", "1 Nov 2025, 11:20", PEOPLE.owner.name, "neutral", true)}
    </div>`,
    { desc: "Orders already placed carry the name they were placed under. All three resolve to this delivery." },
  )}
</div>`,
            "Orders",
          ),
        },
        {
          name: "The edit is refused, with the newer way named",
          rationale:
            "Some edits cannot happen at all after the fact. The command is not disabled silently: it says what cannot change, and names the command that achieves what the reader was trying to do.",
          tradeoff:
            "A reader who wants a price change on a sold unit is told no and given a different thing. That is the honest answer, but it is also the most likely source of support cases.",
          html: shell(
            "Pricing refused",
            `<div class="page" style="max-width:560px">
  ${trail("Home", "Products", PRODUCT.name, "Pricing")}
  <div class="phead"><div><h1>Pricing</h1><p class="desc">${PRODUCT.name} went on sale 12 Jan 2026.</p></div></div>
  ${`<div class="alert destructive" style="margin-bottom:14px" role="alert" data-slot="problem-alert" data-code="products/price.changed-after-sale"><span class="ico" aria-hidden="true">✕</span><span class="txt"><b>That price has already been charged.</b><small>412 units were sold at ${MONEY.lamp}. Changing it would make the company's own records disagree with the customer's.</small></span><span class="tail"><span class="linkish" style="font-size:11.5px">Why?</span></span></div>`}
  ${section(
    "",
    `<div class="form">
      ${field("Standard, in euros", `<span class="inp-wrap" style="position:relative;display:flex;align-items:center"><span aria-hidden="true" style="position:absolute;left:9px;font-size:12.5px;color:var(--muted-foreground)">&euro;</span><input class="inp money" style="padding-left:24px" value="45.00" readonly inputmode="decimal"></span>`, { help: "The price 412 customers were charged. It is kept, not changed.", required: true })}
      ${field("Price for the 88 units still on sale, in euros", `<span class="inp-wrap" style="position:relative;display:flex;align-items:center"><span aria-hidden="true" style="position:absolute;left:9px;font-size:12.5px;color:var(--muted-foreground)">&euro;</span><input class="inp money" style="padding-left:24px" value="50.00" inputmode="decimal"></span>`, { help: "A different price for the rest is allowed. A customer who finds out can ask for the difference back.", required: true })}
      <div class="btnrow end" style="border-top:1px solid var(--border);padding-top:12px"><button class="btn primary">Save the new price</button></div>
    </div>`,
  )}
</div>`,
            "Products",
          ),
        },
        {
          name: "A correction, dated and attributed",
          rationale:
            "Where a figure was entered wrong and the correction is a statement about the past, the record carries the correction as its own dated fact rather than overwriting the wrong one.",
          tradeoff:
            "Two figures for the same thing is confusing on any page that shows only one of them, so every read has to choose which to show and the choice is a rule rather than a display decision.",
          html: shell(
            "Incident",
            `<div class="page" style="max-width:620px">
  ${trail("Home", "Orders", DELIVERY.name, "Incidents", "INC-0207")}
  <div class="phead"><div><h1>Incident INC-0207 ${badgeRaw("Closed", "neutral")}</h1><p class="desc">14 Mar 2026 · loading bay. Recorded 14 Mar, corrected 2 Oct.</p></div></div>
  ${section(
    "What happened",
    `<div class="stack sm">
      <div class="stack sm"><div class="lab" style="font-size:12.5px;font-weight:500">Who</div><span style="font-size:12.5px">A driver, no name given</span></div>
      <div class="stack sm"><div class="lab" style="font-size:12.5px;font-weight:500">What</div><span style="font-size:12.5px">Presented another customer's pickup slip</span></div>
      <div class="stack sm"><div class="lab" style="font-size:12.5px;font-weight:500">Who decided</div><span style="font-size:12.5px">${PEOPLE.warehouse.name}</span></div>
      <div class="stack sm">
        <div class="lab" style="font-size:12.5px;font-weight:500">Why</div>
        <span style="font-size:12.5px">The original slip could not be produced</span>
        <div class="hint">Corrected 2 Oct 2026 by ${PEOPLE.finance.name}. It said 'nothing handed over' until then, which was wrong: the goods were handed over at 08:41 and the dispatch log holds it.</div>
      </div>
    </div>`,
  )}
  ${section("The corrections", `<div class="tl">
      ${timelineEntry("Why corrected from 'nothing handed over' to 'handed over at 08:41'", "2 Oct 2026, 09:12", PEOPLE.finance.name, "caution")}
      ${timelineEntry("Incident closed", "14 Mar 2026, 09:04", PEOPLE.warehouse.name, "neutral", true)}
    </div>`, { desc: "The wrong version is kept. It says it was wrong and when." })}
</div>`,
            "Orders",
          ),
        },
        {
          name: "A change with a window, before it takes effect",
          rationale:
            "A scheduled change: what it will be, when it takes effect, and how to stop it before then. The record shows both the current value and the one coming.",
          tradeoff:
            "Two values on one record is a rule every read has to honour, and 'what is this worth' has a date attached that a reader has to notice.",
          html: shell(
            "Delivery fee",
            `<div class="page" style="max-width:560px">
  ${trail("Home", "Products", "Delivery fee")}
  <div class="phead"><div><h1>Delivery fee</h1><p class="desc">What the customer pays on top of the order. You keep all of it.</p></div></div>
  ${section(
    "",
    `<div class="stack lg">
      <div class="split" style="align-items:baseline"><span>Now<span class="sub">Since 1 Oct 2026</span></span><span class="fig">EUR 5.00</span></div>
      <div class="split" style="align-items:baseline"><span>From 1 November 2026<span class="sub">Scheduled. Applies to orders placed after that.</span></span><span class="fig">EUR 6.00</span></div>
      ${field("Change the scheduled fee, in euros", `<span class="inp-wrap" style="position:relative;display:flex;align-items:center"><span aria-hidden="true" style="position:absolute;left:9px;font-size:12.5px;color:var(--muted-foreground)">&euro;</span><input class="inp money" style="padding-left:24px" value="6.00" inputmode="decimal"></span>`, { help: "Takes effect on 1 November 2026. The 1,204 orders already placed keep EUR 5.00.", required: true })}
      <div class="callout">At EUR 6.00 an order, about 1,204 orders, the fee brings in roughly EUR 7,224. It is the company's own price.</div>
      <div class="btnrow end" style="border-top:1px solid var(--border);padding-top:12px"><button class="btn">Cancel</button><button class="btn primary">Schedule the change</button></div>
    </div>`,
  )}
</div>`,
            "Products",
          ),
        },
        {
          name: "A change that only reaches what has not shipped",
          rationale:
            "The edit page says which population the change reaches, and which it cannot. Editing a delivery plan changes this delivery; editing the warehouse does not.",
          tradeoff:
            "It needs a read that counts the affected population, and that count is a fact the API has to be able to answer rather than a number typed into the copy.",
          html: shell(
            "Delivery plan",
            `<div class="page" style="max-width:560px">
  ${trail("Home", "Orders", ORDER.number, "Delivery", "Plan")}
  <div class="phead"><div><h1>Delivery plan</h1><p class="desc">6 entries, sorted by start time.</p></div><div class="acts"><button class="btn sm">Add to the plan</button></div></div>
  ${section(
    "",
    `<div class="rlist">
      ${[
        ["Stock check", "06:30", "Changed 8 Oct, 14:22"],
        ["Labels printed", "07:00", "Set 2 Oct"],
        [`${PEOPLE.warehouse.name} on dispatch`, "07:30", "Set 2 Oct"],
        ["Loading bay booked", "08:00", "Set 1 Oct"],
        [`${PEOPLE.support.name} on customer messages`, "08:00", "Set 1 Oct"],
        ["Bay handover", "12:00", "Set 1 Oct"],
      ]
        .map(([what, when, note]) => recordRow({ title: what, sub: note, fig: when, actions: '<button class="btn sm icon" aria-label="More actions">⋯</button>' }))
        .join("")}
    </div>`,
    { desc: "This is this delivery only. Changing the plan does not change any delivery already dispatched." },
  )}
</div>`,
            "Orders",
          ),
        },
        {
          name: "A reverse, keeping both figures and the reason",
          rationale:
            "A charge that turns out to be wrong is reversed with a reason, and both figures stay on the record. This is the shape every financial correction takes.",
          tradeoff:
            "The record holds two values for one thing, and every statement has to decide which one to print. That decision is a rule, not a display preference.",
          html: shell(
            "Mismatches",
            `<div class="page" style="max-width:620px">
  ${phead("Mismatch M-0091", `Order ${ORDER.number}, ${MONEY.lamp} recorded twice.`, '<button class="btn sm subtle-danger">Reverse the second</button>', { crumb: trail("Home", "Invoices", "Mismatches", "M-0091") })}
  ${section(
    "What the two records say",
    `<div class="stmt">
      <div class="line"><span>Recorded by the storefront<span class="sub">8 Oct 2026, 09:34 · bank transfer · reference SH-88213</span></span><span class="fig">${MONEY.lamp}</span></div>
      <div class="line"><span>Recorded by the bank file<span class="sub">8 Oct 2026, 09:34 · the same payment, imported twice</span></span><span class="fig">${MONEY.lamp}</span></div>
      <div class="sub-total"><span>Counted so far</span><span class="fig">EUR 90.00</span></div>
      <div class="line"><span>After the reversal<span class="sub">The second record is marked reversed, not removed.</span></span><span class="fig">${MONEY.lamp}</span></div>
    </div>`,
  )}
  ${section("Why", `<div class="stack sm">
      ${field("Reason", '<textarea class="ta" style="min-height:70px">The bank file imported the same payment twice. The storefront record is correct.</textarea>', { required: true })}
      <label class="check"><input type="checkbox" checked><span>Tell ${ORDER.customer}<span class="cd">Nothing changes for them. Their account was charged once and their order is right.</span></span></label>
      <div class="btnrow end" style="border-top:1px solid var(--border);padding-top:12px"><button class="btn">Cancel</button><button class="btn danger">Reverse the second record</button></div>
    </div>`)}
</div>`,
            "Invoices",
          ),
        },
        {
          name: "A version history with restore",
          rationale:
            "The way Notion keeps versions: every save is a version with a who and a when, and restoring writes a new version rather than rewriting the old. A name changed in October can be read in June as what it was then.",
          tradeoff:
            "Versions multiply: a description edited fifty times has fifty rows, and only the last few matter. The list needs grouping by day, or it hides the one version anyone wants.",
          reference: "Notion",
          html: shell(
            "Versions",
            `<div class="page ce-page ce-mid">
  ${phead(DELIVERY.name, "Sat 14 Mar 2026 · Amsterdam warehouse. 1,204 orders.", "", { crumb: trail("Home", "Orders", DELIVERY.name, "Versions") })}
  ${notice("info", "Restoring writes a new version. Nothing here is rewritten, and orders keep the name they were placed under.")}
  ${section(
    "Versions",
    `<div class="rlist">
      ${recordRow({ title: "Garcia Interiors restock", sub: `Version 12 · 8 Oct 2026, 14:22 by ${PEOPLE.manager.name}`, state: { label: "Current", tone: "positive" } })}
      ${recordRow({ title: "Garcia Interiors March order", sub: `Version 11 · 12 Jan 2026, 09:04 by ${PEOPLE.manager.name}`, actions: '<button class="btn sm">Restore</button>' })}
      ${recordRow({ title: "Garcia Q1 restock", sub: `Version 10 · 1 Nov 2025, 11:20 by ${PEOPLE.owner.name}`, actions: '<button class="btn sm">Restore</button>' })}
    </div>`,
    { desc: "All three names resolve to this delivery." },
  )}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Two people for a change to the past",
          rationale:
            "The way GitHub guards a protected branch: a change to what is settled needs a second person. A correction to money that one person could type alone is the case this exists for.",
          tradeoff:
            "Every correction waits on someone else, and a team of one cannot use it at all. It fits corrections to money and the dispatch log, not names and text.",
          reference: "GitHub",
          html: shell(
            "Correction",
            `<div class="page ce-page ce-narrow">
  ${phead("Correction CR-0031", `Mismatch M-0091 · order ${ORDER.number}. Waiting on one approval.`, "", { crumb: trail("Home", "Invoices", "Mismatches", "M-0091", "CR-0031") })}
  ${section("What was asked", `<div class="stack sm">
      ${facts([["Asked by", `${PEOPLE.finance.name} · 8 Oct 2026, 09:12`], ["Change", `Reverse the second ${MONEY.lamp} record`], ["Reason", "The bank file imported the same payment twice."]], { stacked: true })}
    </div>`)}
  ${callout("caution", `${PEOPLE.finance.name} asked for this correction, so ${PEOPLE.finance.name} cannot approve it. One owner or finance approval is required.`)}
  ${section("Decide", `<div class="stack sm">
      ${field("Note for the record", '<textarea class="ta" style="min-height:56px"></textarea>', { optional: true })}
      ${ceFoot("", '<button class="btn">Refuse</button><button class="btn primary">Approve and reverse</button>')}
    </div>`)}
</div>`,
            "Invoices",
          ),
        },
      ],
    },
    {
      id: "ce-duplicate",
      title: "Duplicating a record",
      why: "A duplicate is a create that starts from something. <b>The copy carries the setup and never the history</b>: prices and a delivery plan travel, orders and money stay with the original.",
      verdict:
        "The dialog that says what the copy carries is the pick: a duplicate that silently drops the prices is worse than no duplicate. The carry checklist is the runner-up where the parts vary per company. Never ship one-click duplication for a delivery; it earns its place for discount codes and plan entries, which carry no customers. An order is never duplicated, because it is one customer's payment.",
      variants: [
        {
          name: "A dialog that says what the copy carries",
          pick: true,
          rationale:
            "The way Shopify duplicates a product: the dialog names what the copy carries before it exists. The copy starts as a draft, so nothing about it is on sale until the reader says so.",
          tradeoff:
            "A long carried list makes a long dialog, and most of it is read once. Past about six parts the checklist option carries the meaning better.",
          reference: "Shopify",
          html: shell(
            "Duplicate delivery",
            `<div class="page ce-page" style="position:relative">
  ${phead("Deliveries", "93 scheduled.", '<button class="btn sm">New delivery</button>', { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Search deliveries", views: ["Scheduled 93", "Past 148", "All 241"], active: 0 })}
  ${section("", `<div class="rlist">${recordRow({ title: DELIVERY.name, sub: `${DELIVERY.date} · ${DELIVERY.place}`, state: { label: "Draft", tone: "neutral" }, fig: "0 of 40 pallets", actions: '<button class="btn sm">Open</button>' })}</div>`)}
  <div class="scrim">
    ${dialog(
      `Duplicate ${DELIVERY.name}`,
      `<div class="stack">
        ${field("Name of the copy", input(`${DELIVERY.name} (copy)`), { help: "Customers never see this until the copy is published.", required: true })}
        <div class="stack sm">
          <div style="font-size:12.5px;font-weight:500">The copy carries</div>
          ${split("Delivery plan", "6 entries")}
          ${split("Products and prices", `Oak desk lamp, Pine bookshelf · ${MONEY.lamp} and EUR 120.00`)}
          ${split("Dispatch plan", "1 dock, 2 bays")}
        </div>
        <div class="hint">Orders, committed units and money stay with the original. The copy starts as a draft with nothing committed.</div>
      </div>`,
      { footer: '<button class="btn">Cancel</button><button class="btn primary">Duplicate it</button>' },
    )}
  </div>
</div>`,
            "Orders",
          ),
        },
        {
          name: "One click from the row menu, then a toast",
          rationale:
            "The way Mailchimp duplicates a campaign: one menu item, no questions, and the copy lands as a draft with a toast confirming it. A discount code carries no customers, so there is nothing to check first.",
          tradeoff:
            "No moment to rename or to choose what travels. It fits records with no customers and no money; a delivery duplicated this way would surprise everyone in June.",
          reference: "Mailchimp",
          html: shell(
            "Discount codes",
            `<div class="page ce-page" style="position:relative;min-height:380px">
  ${phead("Discount codes", "4 codes. All of them reduce the product, never the fee.", '<button class="btn sm">New discount code</button>', { crumb: trail("Home", "Products", "Discounts", "Codes") })}
  ${section(
    "",
    `<table class="dt">
      <thead><tr><th scope="col">Code</th><th scope="col">Reduction</th><th scope="col" class="num">Used</th><th scope="col" style="width:1%"></th></tr></thead>
      <tbody>
        <tr><td><span class="code">WELCOME10</span></td><td>EUR 10.00 off</td><td class="num">41 of 200</td><td class="num"><button class="btn xs icon" aria-label="More actions">⋯</button></td></tr>
        <tr class="is-sel"><td><span class="code">WELCOME10 copy</span></td><td>EUR 10.00 off</td><td class="num">0 of 200</td><td class="num"><button class="btn xs icon" aria-label="More actions">⋯</button></td></tr>
        <tr><td><span class="code">CREW</span></td><td>100% off</td><td class="num">12 of 60</td><td class="num"><button class="btn xs icon" aria-label="More actions">⋯</button></td></tr>
      </tbody>
    </table>`,
    { flush: true },
  )}
  <div class="ce-toast-spot">${toast("info", "WELCOME10 copy was created as a draft.", { undo: false })}</div>
</div>`,
            "Products",
          ),
        },
        {
          name: "Copy of, renamed where it lands",
          rationale:
            "The way Figma duplicates a layer: the copy appears beside the original as Copy of, already selected for rename. Duplicating a price tier is renaming plus a price check, and both happen in the list.",
          tradeoff:
            "The copy exists before it is named, so a list can fill with Copy of Standard rows that nobody renamed. It needs the draft state to say the copy is not on sale yet.",
          reference: "Figma",
          html: shell(
            "Price tiers",
            `<div class="page ce-page">
  ${phead("Price tiers", "2 tiers. 412 sold between them.", '<button class="btn sm">New price tier</button>', { crumb: trail("Home", "Products", PRODUCT.name, "Tiers") })}
  ${section(
    "",
    `<div class="rlist">
      <div class="rrow is-sel"><span class="txt"><b><input class="inp" value="Copy of Standard" aria-label="Name of the copy" style="max-width:220px"></b><small>${MONEY.lamp} · 0 sold · draft, not on sale</small></span><span class="acts"><button class="btn sm primary">Keep the name</button></span></div>
      ${recordRow({ title: "Standard", sub: `${MONEY.lamp} · 412 sold`, state: { label: "On sale", tone: "positive" }, actions: '<button class="btn sm">Open</button>' })}
      ${recordRow({ title: "Large", sub: "EUR 60.00 · 0 sold", state: { label: "On sale", tone: "positive" }, actions: '<button class="btn sm">Open</button>' })}
    </div>`,
    { desc: "The copy carries the price and the labelling rule. Nothing sold travels with it." },
  )}
</div>`,
            "Products",
          ),
        },
        {
          name: "Choose what the copy carries",
          rationale:
            "The way Notion duplicates a page with its subpages offered as toggles: every part is a checkbox with its size beside it. A reader who wants the prices but not the team says so here.",
          tradeoff:
            "Six checkboxes for a routine duplicate is five too many on the tenth use. It fits the first duplicate of a season, not the weekly one.",
          reference: "Notion",
          html: shell(
            "Duplicate delivery",
            `<div class="page ce-page ce-narrow">
  ${phead(`Duplicate ${DELIVERY.name}`, "Tick what the copy carries. The rest stays behind.", "", { crumb: trail("Home", "Orders", DELIVERY.name, "Duplicate") })}
  ${section(
    "What travels",
    `<div class="stack sm">
      ${field("Name of the copy", input(`${DELIVERY.name} (copy)`), { required: true })}
      <div>
        ${ceCarry("Delivery plan", "6 entries, sorted by start time.")}
        ${ceCarry("Products and prices", "Oak desk lamp and Pine bookshelf, both priced.")}
        ${ceCarry("Dispatch plan", "1 dock, 2 bays.")}
        ${ceCarry("Team assignments", `${PEOPLE.warehouse.name} and ${PEOPLE.support.name} would be assigned again.`, false)}
      </div>
      <div class="hint">Orders, committed units and money never travel. The copy starts as a draft.</div>
      ${ceFoot("", '<button class="btn">Cancel</button><button class="btn primary">Duplicate it</button>')}
    </div>`,
  )}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Duplication refused where there is nothing to carry",
          rationale:
            "The way Stripe treats a paid invoice as a fact: it can be credited, never copied. An order is one customer payment for one set of products, so duplicating it would invent a payment that never happened.",
          tradeoff:
            "The reader who wants a second order like this one must build it by hand. The manual order is the way out, and this page must name it or the refusal leaves the reader with nowhere to go.",
          reference: "Stripe",
          html: shell(
            "Order",
            `<div class="page ce-page ce-narrow">
  ${phead(ORDER.number, `${ORDER.customer} · ${MONEY.order} · paid ${ORDER.placed}.`, "", { crumb: trail("Home", "Orders", ORDER.number) })}
  ${alert("destructive", "An order cannot be duplicated", `${ORDER.number} is the payment ${ORDER.customer} made: ${MONEY.order} on 8 Oct 2026. A copy would claim a payment that never happened.`)}
  ${section(
    "What to do instead",
    `<div class="stack sm">
      <div class="hint">To sell the same products to someone else, create a manual order. It carries its own number and its own payment.</div>
      ${ceFoot("", '<button class="btn primary">Create a manual order</button>')}
    </div>`,
  )}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Duplicate a session inside its series",
          rationale:
            "The series holds what every delivery shares, so the duplicate only asks for the date. The shared parts are named, not chosen, because the series owns them.",
          tradeoff:
            "Anything the delivery changed away from the series raises the question of which version travels. The page must say the series version wins, or the copy silently keeps the divergence.",
          html: shell(
            "Duplicate delivery",
            `<div class="page ce-page ce-narrow">
  ${phead("Duplicate delivery 9", "March restock plan · Tue 3 Nov 2026. The copy joins the same series.", "", { crumb: trail("Home", "Orders", "Plans", "March restock plan", "Delivery 9", "Duplicate") })}
  ${section(
    "The copy takes from the series",
    `<div class="stack sm">
      ${split(DELIVERY.place, "Shared")}
      ${split("Oak desk lamp, Pine bookshelf", `Shared · ${MONEY.lamp}`)}
      ${split("Delivery plan", "Shared · 6 entries")}
      ${field("Date of the copy", input("24/11/2026"), { help: "Tuesdays, like every other delivery.", required: true })}
      <div class="hint">Delivery 9 diverged its loading slot to 19:30. The copy takes the series 20:00, not the divergence.</div>
      ${ceFoot("", '<button class="btn">Cancel</button><button class="btn primary">Duplicate the delivery</button>')}
    </div>`,
  )}
</div>`,
            "Orders",
          ),
        },
      ],
    },
    {
      id: "ce-reorder",
      title: "Putting a list in order by hand",
      why: "Products, plan entries and storefront sections all have an order the reader sets. <b>The customer reads the order the reader left</b>, so the control must work for a mouse, a keyboard and a finger.",
      verdict:
        "Drag handles in the list are the pick: direct, visible, and the order saves as it changes. Move up and Move down in the row menu are the required companion, because drag alone leaves keyboard and screen-reader users behind. Never ship typed position numbers alone; two rows both numbered 3 are a question the page cannot answer. The storefront preview earns its place for sections, where the order is the design.",
      variants: [
        {
          name: "Drag handles in the list",
          pick: true,
          rationale:
            "The way Notion reorders blocks: a grip on every row, the dragged row lifted, and a line where it will land. The order saves on drop, so there is nothing to forget.",
          tradeoff:
            "A grip cannot be used from a keyboard or announced by a screen reader, and on a phone it conflicts with scrolling. The menu move is not an alternative; it is the other half of this option.",
          reference: "Notion",
          html: shell(
            "Products",
            `<div class="page ce-page">
  ${phead("Products", "3 products. Customers read them in this order.", "", { crumb: trail("Home", "Products", "Desk lamps") })}
  ${notice("info", "Drag a row to move it. The order saves on drop and the storefront follows within a minute.")}
  ${section(
    "",
    `<div class="rlist">
      ${ceOrderRow({ title: PRODUCT.name, sub: `${MONEY.lamp} · 412 sold`, pos: "1", actions: '<button class="btn sm icon" aria-label="More actions">⋯</button>' })}
      <div class="ce-drop"></div>
      ${ceOrderRow({ title: "Spring offer", sub: "EUR 40.00 · 88 sold · ends 1 Feb", pos: "2", drag: true, actions: '<button class="btn sm icon" aria-label="More actions">⋯</button>' })}
      ${ceOrderRow({ title: "Pine bookshelf", sub: "EUR 120.00 · 0 sold", pos: "3", actions: '<button class="btn sm icon" aria-label="More actions">⋯</button>' })}
    </div>`,
    { desc: "The first product is the one customers see first." },
  )}
</div>`,
            "Products",
          ),
        },
        {
          name: "Move up and Move down in the row menu",
          rationale:
            "The way Linear moves an issue with the keyboard: the same move drag performs, as a named command. A screen reader announces Moved to position 2, and nothing about it needs a pointer.",
          tradeoff:
            "Moving one row past twenty others is twenty menu opens. It is the accessible half of drag, not a replacement for it on long lists.",
          reference: "Linear",
          html: shell(
            "Delivery plan",
            `<div class="page ce-page">
  ${phead(DELIVERY.name, "Delivery plan · 6 entries, sorted by start time.", "", { crumb: trail("Home", "Orders", ORDER.number, "Delivery", "Plan") })}
  ${section(
    "",
    `<div class="rlist">
      ${recordRow({ title: "Stock check", sub: "Set 8 Oct, 14:22", fig: "06:30", actions: '<button class="btn sm icon" aria-label="More actions">⋯</button>' })}
      <div class="rrow is-sel"><span class="txt"><b>Labels printed</b><small>Set 2 Oct · position 2 of 6</small></span><span class="fig">07:00</span><span class="acts"><button class="btn sm icon" aria-label="More actions">⋯</button></span></div>
      ${recordRow({ title: "Loading bay booked", sub: "Set 1 Oct", fig: "08:00", actions: '<button class="btn sm icon" aria-label="More actions">⋯</button>' })}
    </div>`,
    { desc: "Every move announces its new position. The order saves with each move." },
  )}
  <div style="max-width:230px">${menu([{ label: "Move up" }, { label: "Move down" }, "-", { label: "Move to top" }, { label: "Move to bottom" }], { width: "230px" })}</div>
</div>`,
            "Orders",
          ),
        },
        {
          name: "A position number typed on each row",
          rationale:
            "The way WordPress orders menu items: a number on each row, one save for the whole list. Jumping a row from 14 to 1 is one keystroke where dragging would cross the whole list.",
          tradeoff:
            "Two rows numbered 3 are a question the page cannot answer, and renumbering fourteen rows by hand is slower than dragging one. Numbers suit a jump across a long list and nothing else.",
          reference: "WordPress",
          html: shell(
            "Products",
            `<div class="page ce-page ce-mid">
  ${phead("Products", "3 products. Numbers set the customer order.", "", { crumb: trail("Home", "Products", "Desk lamps") })}
  ${section(
    "",
    `<div class="stack sm">
      <div class="rlist">
        <div class="rrow"><span class="txt"><b>${PRODUCT.name}</b><small>${MONEY.lamp} · 412 sold</small></span><span class="acts"><input class="inp num" value="1" aria-label="Position of ${PRODUCT.name}" style="width:56px"></span></div>
        <div class="rrow"><span class="txt"><b>Spring offer</b><small>EUR 40.00 · 88 sold</small></span><span class="acts"><input class="inp num" value="2" aria-label="Position of Spring offer" style="width:56px"></span></div>
        <div class="rrow"><span class="txt"><b>Pine bookshelf</b><small>EUR 120.00 · 0 sold</small></span><span class="acts"><input class="inp num" value="3" aria-label="Position of Pine bookshelf" style="width:56px"></span></div>
      </div>
      ${ceFoot('<button class="btn ghost">Reset</button>', '<button class="btn primary">Save the order</button>')}
    </div>`,
    { desc: "Two rows with the same number are refused. The list keeps its old order until the numbers are unique." },
  )}
</div>`,
            "Products",
          ),
        },
        {
          name: "Automatic order, with pinned rows on top",
          rationale:
            "The way Shopify sorts products: the list follows a rule such as price or date, and pinned rows stay above it. Ninety-three deliveries need no hand ordering; the two that matter stay first by hand.",
          tradeoff:
            "Two orders on one list is a rule every reader must learn: pinned first, then the rule. A reader who sorts by name and finds two rows out of place has to be told why.",
          reference: "Shopify",
          html: shell(
            "Deliveries",
            `<div class="page ce-page">
  ${phead("Deliveries", "93 scheduled. Sorted by date, 2 pinned.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Search deliveries", filters: ["Sort: date"], views: ["Scheduled 93", "Past 148", "All 241"], active: 0 })}
  ${section(
    "",
    `<div class="rlist">
      ${recordRow({ title: DELIVERY.name, sub: `${DELIVERY.date} · pinned by ${PEOPLE.manager.name}`, state: { label: "Pinned", tone: "info" }, fig: "412 units", actions: '<button class="btn sm">Unpin</button>' })}
      ${recordRow({ title: "Becker Bouw restock", sub: `9 Oct 2026 · pinned by ${PEOPLE.manager.name}`, state: { label: "Pinned", tone: "info" }, fig: "1 unit", actions: '<button class="btn sm">Unpin</button>' })}
      ${recordRow({ title: "Lindqvist Studio restock", sub: "16 Oct 2026", state: { label: "Scheduled", tone: "info" }, fig: "7 units", actions: '<button class="btn sm">Pin</button>' })}
      ${recordRow({ title: "Okafor Office restock", sub: "3 Nov 2026", state: { label: "Active", tone: "positive" }, fig: "0 units", actions: '<button class="btn sm">Pin</button>' })}
    </div>`,
    { desc: "Pinned rows stay first in every sort. Unpinning returns a row to the rule." },
  )}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Order the storefront sections on the preview",
          rationale:
            "The way Squarespace orders page sections: the list and the preview sit side by side, and moving a row moves the preview with it. The order is the design, so it is judged as one.",
          tradeoff:
            "Two panes need a wide screen; below 768 px the preview stacks under the list and the judgement breaks. It also fits sections, not products, which customers read as a list either way.",
          reference: "Squarespace",
          html: shell(
            "Storefront",
            `<div class="page ce-page">
  ${phead("Storefront", "shop.acme-supply.example · what customers read, in order.", "", { crumb: trail("Home", "Products", "Storefront") })}
  ${twoCol(
    section("Sections", `<div class="rlist">${ceOrderRow({ title: "Spring offers", sub: "On sale · 88 units left", pos: "1" })}${ceOrderRow({ title: PRODUCT.name, sub: "412 sold · on sale", pos: "2", drag: true })}${ceOrderRow({ title: `About ${COMPANY.name}`, sub: "Always last", pos: "3" })}</div>`, { desc: "Drag a section. The preview follows." }),
    `<div class="preview"><div class="pv-bar"><b>Customer preview</b><span class="toggle"><button class="btn xs">Desktop</button> <button class="btn xs ghost">Phone</button></span></div><div class="pv-body"><h4>Spring offers</h4><p>From EUR 40.00 · ends 1 Feb</p><h4>${PRODUCT.name}</h4><p>${MONEY.lamp} · 412 sold</p></div></div>`,
  )}
</div>`,
            "Products",
          ),
        },
        {
          name: "Move to top and Move to bottom for long lists",
          rationale:
            "The way Trello positions a card: a position menu with top and bottom jumps beside the step moves. On a plan of forty entries the jump is the only move anyone uses.",
          tradeoff:
            "Top and bottom move without aim: everything important ends up first and the top becomes its own unordered list. It needs the step moves beside it for the ordering that follows.",
          reference: "Trello",
          html: shell(
            "Delivery plan",
            `<div class="page ce-page">
  ${phead(DELIVERY.name, "Delivery plan · 6 entries.", "", { crumb: trail("Home", "Orders", ORDER.number, "Delivery", "Plan") })}
  ${section(
    "",
    `<div class="rlist">
      ${recordRow({ title: "Stock check", sub: "Set 8 Oct, 14:22", fig: "06:30", actions: '<button class="btn sm icon" aria-label="More actions">⋯</button>' })}
      <div class="rrow is-sel"><span class="txt"><b>Loading bay booked</b><small>Moved to top by ${PEOPLE.manager.name} · position 1 of 6</small></span><span class="fig">08:00</span><span class="acts"><button class="btn sm icon" aria-label="More actions">⋯</button></span></div>
      ${recordRow({ title: "Bay handover", sub: "Set 1 Oct", fig: "12:00", actions: '<button class="btn sm icon" aria-label="More actions">⋯</button>' })}
    </div>
    <div style="margin-top:8px;max-width:250px">${menu([{ label: "Move up" }, { label: "Move down" }, "-", { label: "Move to top" }, { label: "Move to bottom" }], { width: "250px" })}</div>`,
    { desc: "Jumps save at once, like every other move." },
  )}
</div>`,
            "Orders",
          ),
        },
      ],
    },
    {
      id: "ce-restore",
      title: "Restoring an archived record",
      why: "Archive is only honest if restore works. <b>A restore returns the record to where it was, with its history</b>, and says so when something changed while it was away.",
      verdict:
        "Restore from the archived view is the pick: the view is the way back, and the row says where the record returns to. The record-page banner is the runner-up for anyone arriving by link. Never ship a restore that silently un-archives parents or overwrites a newer name; both need their own dialog. The Undo toast earns its place in the seconds after archiving, not as the way back days later.",
      variants: [
        {
          name: "Restore from the archived view",
          pick: true,
          rationale:
            "The way Shopify restores an archived product: the Archived view lists what is hidden, and each row carries its own Restore. The record returns to the state it held, not to a draft.",
          tradeoff:
            "Nobody opens the Archived view unless they remember it exists. Anything restored from here must say where it went, or the record vanishes from this list into another nobody is reading.",
          reference: "Shopify",
          html: shell(
            "Deliveries",
            `<div class="page ce-page" style="position:relative;min-height:380px">
  ${phead("Deliveries", "93 scheduled, 4 archived.", '<button class="btn sm">New delivery</button>', { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Search deliveries", views: ["Scheduled 93", "Past 148", "Archived 4", "All 245"], active: 2 })}
  ${section(
    "",
    `<div class="rlist">
      ${[
        ["Okafor Office restock", "28 Feb 2026 · archived 2 Oct", "Scheduled"],
        ["Lindqvist Studio samples", "27 Oct 2026 · archived 1 Oct", "Active"],
        ["Becker Bouw trial", "13 Oct 2026 · archived 28 Sep", "Ended"],
      ]
        .map(
          ([nm, when, back]) => `<div class="rrow">
        <span class="txt"><b style="color:var(--muted-foreground)">${nm}</b><small>${when} · ${DELIVERY.place}</small></span>
        <span class="fig"><small>Returns as ${back}</small></span>
        <span class="acts"><button class="btn sm">Restore</button></span>
      </div>`,
        )
        .join("")}
    </div>`,
    { desc: "A restore returns the record to the state it held. Nothing goes back on sale by itself." },
  )}
  <div class="ce-toast-spot">${toast("positive", "Okafor Office restock is back under Scheduled.", {})}</div>
</div>`,
            "Orders",
          ),
        },
        {
          name: "Undo in the seconds after archiving",
          rationale:
            "The way Gmail keeps an Undo on every archive: the toast is the way back in the seconds after the click. Archiving the wrong delivery is fixed where it happened, without a visit to another view.",
          tradeoff:
            "Eight seconds and it is gone, so this is a correction for slips, not the way back. Anyone restoring a day later still needs the archived view.",
          reference: "Gmail",
          html: shell(
            "Deliveries",
            `<div class="page ce-page" style="position:relative;min-height:380px">
  ${phead("Deliveries", "93 scheduled, 4 archived.", '<button class="btn sm">New delivery</button>', { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Search deliveries", views: ["Scheduled 93", "Past 148", "Archived 4", "All 245"], active: 0 })}
  ${section("", `<div class="rlist">${recordRow({ title: "Garcia Interiors restock", sub: "9 Oct 2026 · Amsterdam warehouse", state: { label: "Scheduled", tone: "info" }, fig: "1 of 40 pallets" })}${recordRow({ title: DELIVERY.name, sub: `${DELIVERY.date} · ${DELIVERY.place}`, state: { label: "Draft", tone: "neutral" }, fig: "0 of 40 pallets" })}</div>`)}
  <div class="ce-toast-spot">${toast("info", "Okafor Office restock was archived.", { undo: true })}</div>
</div>`,
            "Orders",
          ),
        },
        {
          name: "Restore from the record page",
          rationale:
            "The way GitHub reopens a closed issue from the issue itself: the archived banner sits on the record, with Restore beside it. Anyone arriving by link or search restores without finding the archived view first.",
          tradeoff:
            "The page must work while archived: read-only where it matters, with every command saying it needs a restore first. A banner on a broken page is worse than no banner.",
          reference: "GitHub",
          html: shell(
            "Delivery",
            `<div class="page ce-page">
  ${phead("Okafor Office restock", "28 Feb 2026 · Rotterdam warehouse. Archived 2 Oct.", '<button class="btn sm">Open</button>', { crumb: trail("Home", "Orders", "Okafor Office restock") })}
  ${alert("caution", "This delivery is archived", `Archived 2 Oct 2026 by ${PEOPLE.manager.name}. Customers cannot see it and nothing about it is scheduled.`)}
  ${section(
    "Restore it",
    `<div class="stack sm">
      <div class="hint">It returns as Scheduled, with its plan, its prices and its 0 committed units. Nothing goes back on sale by itself.</div>
      ${ceFoot("", '<button class="btn primary">Restore this delivery</button>')}
    </div>`,
  )}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Restore refused: the parent is still archived",
          rationale:
            "The way Jira refuses to reopen a subtask whose parent is closed: the restore names the blocker and offers the way out. A price tier cannot return while its delivery stays archived.",
          tradeoff:
            "Two dialogs for one restore, and the offer to restore both at once is a second command hiding inside the first. It must say both are restored, not just the row that was clicked.",
          reference: "Jira",
          html: shell(
            "Price tiers",
            `<div class="page ce-page" style="position:relative">
  ${phead("Price tiers", "Okafor Office restock · archived 2 Oct.", "", { crumb: trail("Home", "Orders", "Okafor Office restock", "Tiers") })}
  ${section("", `<div class="rlist">${recordRow({ title: "Standard", sub: `${MONEY.lamp} · 0 committed · archived`, actions: '<button class="btn sm">Restore</button>' })}</div>`)}
  <div class="scrim">
    ${dialog(
      "Restore Standard as well as its delivery?",
      `<div style="font-size:12.5px">Standard belongs to Okafor Office restock, which is still archived. A price tier cannot return while its delivery stays hidden.</div>
      <div class="callout" style="margin-top:11px">Restoring both returns the delivery as Scheduled and the tier with it. Neither goes back on sale by itself.</div>`,
      { footer: ceVFoot('<button class="btn primary">Restore both</button>', '<button class="btn">Restore the delivery first</button>', '<button class="btn ghost">Cancel</button>') },
    )}
  </div>
</div>`,
            "Orders",
          ),
        },
        {
          name: "Restore with a name taken since",
          rationale:
            "The way Notion renames a restored page when the title is taken: the restore keeps both records by renaming the restored record. Two tiers called Standard would disagree on the invoice, so only one keeps the name.",
          tradeoff:
            "The restored record comes back under a name nobody chose, and renaming it again is a second command. The dialog must show the name it will hold, not just the clash.",
          reference: "Notion",
          html: shell(
            "Price tiers",
            `<div class="page ce-page" style="position:relative">
  ${phead("Price tiers", "2 tiers on sale. 1 archived.", "", { crumb: trail("Home", "Products", PRODUCT.name, "Tiers") })}
  ${section("", `<div class="rlist">${recordRow({ title: "Standard", sub: `${MONEY.lamp} · 412 sold`, state: { label: "On sale", tone: "positive" } })}${recordRow({ title: "Standard", sub: `${MONEY.lamp} · 0 sold · archived 2 Oct`, actions: '<button class="btn sm">Restore</button>' })}</div>`)}
  <div class="scrim">
    ${dialog(
      "Standard is already taken",
      `<div class="stack">
        <div style="font-size:12.5px">Another tier took the name while this one was archived. The restored tier comes back renamed; nothing else about it changes.</div>
        ${field("Name on return", input("Standard (restored)"), { required: true })}
      </div>`,
      { footer: '<button class="btn">Cancel</button><button class="btn primary">Restore it renamed</button>' },
    )}
  </div>
</div>`,
            "Products",
          ),
        },
        {
          name: "Restore several at once",
          rationale:
            "The way Google Drive restores a selection: the count is the confirmation, and every record returns to where it was. Archiving a whole season by mistake is fixed in the same gesture it was made with.",
          tradeoff:
            "A bulk restore can return records to states the reader forgot, including one that clashes. The report afterwards must name each record and where it landed.",
          reference: "Google Drive",
          html: shell(
            "Deliveries",
            `<div class="page ce-page" style="position:relative">
  ${phead("Deliveries", "4 archived. 2 selected.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Search deliveries", views: ["Scheduled 93", "Past 148", "Archived 4", "All 245"], active: 2 })}
  <div class="section" style="margin-bottom:10px;border-color:var(--ring)">
    <div class="body"><div class="btnrow between">
      <span style="font-size:12.5px"><b>2 selected</b> <span class="muted">· both return as Scheduled</span></span>
      <span class="btnrow"><button class="btn sm ghost">Clear</button><button class="btn primary sm">Restore these 2</button></span>
    </div></div>
  </div>
  ${section("", `<div class="rlist">
      <div class="rrow is-sel"><span class="check"><input type="checkbox" checked aria-label="Select Okafor Office restock"></span><span class="txt"><b>Okafor Office restock</b><small>28 Feb 2026 · returns as Scheduled</small></span></div>
      <div class="rrow is-sel"><span class="check"><input type="checkbox" checked aria-label="Select Lindqvist Studio samples"></span><span class="txt"><b>Lindqvist Studio samples</b><small>27 Oct 2026 · returns as Scheduled</small></span></div>
      <div class="rrow"><span class="check"><input type="checkbox" aria-label="Select Becker Bouw trial"></span><span class="txt"><b>Becker Bouw trial</b><small>13 Oct 2026 · returns as Ended</small></span></div>
    </div>`)}
  <div class="scrim">
    ${dialog("Restore 2 deliveries?", `<div style="font-size:12.5px">Both return as Scheduled, with their plans and prices. Neither goes back on sale by itself.</div>`, { footer: '<button class="btn">Cancel</button><button class="btn primary">Restore both</button>' })}
  </div>
</div>`,
            "Orders",
          ),
        },
      ],
    },
    {
      id: "ce-invite",
      title: "Inviting a team member",
      why: "Warehouse crew join per delivery and staff join per company. <b>An invitation names the person, the role and the scope before it is sent</b>, because access granted by accident must be found and removed later.",
      verdict:
        "Invite by email with the role chosen first is the pick: the person, the role and the scope are all named on one dialog. The pending list with resend and revoke is the runner-up and the required companion, because an invitation waits far longer than it takes to send. Never ship an open invite link for staff roles; it earns its place only for warehouse crew on one delivery. A request to join is refused: the company invites, nobody applies.",
      variants: [
        {
          name: "Invite by email, with the role chosen first",
          pick: true,
          rationale:
            "The way Slack invites: one dialog, the email, then the role with what it can do beside it. The scope line says whether Noa joins the company or one delivery, before the invitation exists.",
          tradeoff:
            "One invitation per person, typed by hand. Assigning forty pickers for a season needs the link option beside it.",
          reference: "Slack",
          html: shell(
            "Team",
            `<div class="page ce-page" style="position:relative">
  ${phead("Team", "6 people. 1 invitation waiting.", '<button class="btn sm">Invite someone</button>', { crumb: trail("Home", "Settings", "Team") })}
  ${section("", `<div class="rlist">${recordRow({ title: PEOPLE.owner.name, sub: `${PEOPLE.owner.role} · ${COMPANY.name}`, actions: '<button class="btn sm icon" aria-label="More actions">⋯</button>' })}${recordRow({ title: PEOPLE.manager.name, sub: `${PEOPLE.manager.role} · ${COMPANY.name}`, actions: '<button class="btn sm icon" aria-label="More actions">⋯</button>' })}${recordRow({ title: PEOPLE.warehouse.name, sub: `${PEOPLE.warehouse.role} · ${DELIVERY.name}`, actions: '<button class="btn sm icon" aria-label="More actions">⋯</button>' })}</div>`)}
  <div class="scrim">
    ${dialog(
      "Invite someone",
      `<div class="stack">
        ${field("Email", input("noa.vermeer@example.com"), { help: "The invitation lands here and expires in 7 days.", required: true })}
        ${field("Role", select("Warehouse lead", ["Owner", "Operations manager", "Finance", "Warehouse lead", "Picker", "Support"]), { help: "Warehouse staff pick, pack and dispatch. Only Finance issues a refund.", required: true })}
        ${field("Scope", select(DELIVERY.name, [COMPANY.name, DELIVERY.name, "Becker Bouw restock"]), { help: "One delivery keeps the access where the work is.", required: true })}
      </div>`,
      { footer: '<button class="btn">Cancel</button><button class="btn primary">Send the invitation</button>' },
    )}
  </div>
</div>`,
            "Settings",
          ),
        },
        {
          name: "An invite link anyone with it can use",
          rationale:
            "The way Discord invites: a link with an expiry and a use count, for the forty pickers nobody wants to type by hand. The link joins one delivery in one role, and nothing else.",
          tradeoff:
            "Anyone with the link joins, including anyone it was forwarded to. It fits warehouse crew on one delivery and is refused for owner, finance and manager roles.",
          reference: "Discord",
          html: shell(
            "Team",
            `<div class="page ce-page ce-narrow">
  ${phead("Invite the warehouse crew", `${DELIVERY.name} · ${DELIVERY.date}. The link joins as Picker and expires with the delivery.`, "", { crumb: trail("Home", "Settings", "Team", "Invite link") })}
  ${section(
    "The link",
    `<div class="stack sm">
      ${copyValue("invite link", "acme-supply.example/join/7K4Q-2M9X")}
      ${facts([["Role", "Picker"], ["Scope", DELIVERY.name], ["Uses", "12 of 60"], ["Expires", "15 Mar 2026, 18:00"]], { stacked: true })}
      <div class="callout caution">Anyone with this link joins as Picker for ${DELIVERY.name}. It never grants finance, manager or owner access.</div>
      ${ceFoot('<button class="btn subtle-danger">Revoke the link</button>', '<button class="btn">Copy it again</button>')}
    </div>`,
  )}
</div>`,
            "Settings",
          ),
        },
        {
          name: "Invite to one delivery, not the company",
          rationale:
            "The way Linear invites to one team rather than the workspace: the scope is chosen up front and printed on the invitation. Noa works the loading bay on 14 Mar and sees nothing else afterwards.",
          tradeoff:
            "Scopes multiply: sixty deliveries a year is sixty small grants to read later. The team page must group by person as well as by delivery, or nobody can answer what Noa can do.",
          reference: "Linear",
          html: shell(
            "Invite",
            `<div class="page ce-page ce-narrow">
  ${phead("Invite Noa Vermeer", "Loading bay · Sat 14 Mar 2026. Picker for one delivery.", "", { crumb: trail("Home", "Settings", "Team", "Invite") })}
  ${section(
    "",
    `<div class="stack sm">
      ${cePerson("Noa Vermeer", "noa.vermeer@example.com", "NV")}
      ${field("Role on the delivery", select("Picker", ["Warehouse lead", "Picker"]), { help: "Pickers pick, pack and label. They cannot refund, void or see money.", required: true })}
      ${field("Delivery", select(DELIVERY.name, [DELIVERY.name, "Becker Bouw restock"]), { required: true })}
      <div class="hint">After 15 Mar 2026, 18:00 this grant ends by itself. Nothing about Noa stays except the audit trail.</div>
      ${ceFoot("", '<button class="btn">Cancel</button><button class="btn primary">Send the invitation</button>')}
    </div>`,
  )}
</div>`,
            "Settings",
          ),
        },
        {
          name: "Pending invitations, with resend and revoke",
          rationale:
            "The way GitHub lists organization invitations: every waiting invitation shows its age, its expiry and its way out. An invitation is read far more often than it is sent, so the list is the pattern.",
          tradeoff:
            "A list of the waiting is a list of the neglected: half of it expired quietly. Expired rows must say they expired and offer reissue, or the list fills with rows that can no longer be used.",
          reference: "GitHub",
          html: shell(
            "Team",
            `<div class="page ce-page">
  ${phead("Team", "6 people. 2 invitations waiting.", '<button class="btn sm">Invite someone</button>', { crumb: trail("Home", "Settings", "Team") })}
  ${tabs(["People 6", "Invitations 2", "Roles 6"], 1)}
  ${section(
    "",
    `<div class="rlist">
      <div class="rrow"><span class="txt"><b>noa.vermeer@example.com</b><small>Picker · ${DELIVERY.name} · sent 6 Oct, expires 13 Oct</small></span>${badgeRaw("Waiting", "caution")}<span class="acts"><button class="btn sm">Resend</button><button class="btn sm subtle-danger">Revoke</button></span></div>
      <div class="rrow"><span class="txt"><b>lena.bakker@example.com</b><small>Support · ${COMPANY.name} · sent 1 Oct, expired 8 Oct</small></span>${badgeRaw("Expired", "neutral")}<span class="acts"><button class="btn sm">Reissue</button></span></div>
    </div>`,
    { desc: "An invitation expires 7 days after it is sent. Revoking ends it at once." },
  )}
</div>`,
            "Settings",
          ),
        },
        {
          name: "An expired invitation, reissued",
          rationale:
            "The way Google Workspace reissues an expired invite: the old link stays dead and a new one goes out with a fresh expiry. Reissuing is a new invitation with the old role, not the old link made live again.",
          tradeoff:
            "Two emails for one join, and the first still reads as live to anyone who kept it. The expired link must land on a page that says it expired, not on a bare refusal.",
          reference: "Google Workspace",
          html: shell(
            "Team",
            `<div class="page ce-page" style="position:relative">
  ${phead("Team", "6 people. 2 invitations waiting.", '<button class="btn sm">Invite someone</button>', { crumb: trail("Home", "Settings", "Team") })}
  ${tabs(["People 6", "Invitations 2", "Roles 6"], 1)}
  ${section("", `<div class="rlist"><div class="rrow"><span class="txt"><b>lena.bakker@example.com</b><small>Support · ${COMPANY.name} · sent 1 Oct, expired 8 Oct</small></span>${badgeRaw("Expired", "neutral")}<span class="acts"><button class="btn sm">Reissue</button></span></div></div>`)}
  <div class="scrim">
    ${dialog(
      "Reissue the invitation?",
      `<div class="stack">
        <div style="font-size:12.5px">The link from 1 Oct stays dead. A new invitation goes to <b>lena.bakker@example.com</b> as Support for ${COMPANY.name}, expiring 15 Oct.</div>
        ${field("Note with it", input("The first one expired before you opened it."), { optional: true })}
      </div>`,
      { footer: '<button class="btn">Cancel</button><button class="btn primary">Reissue it</button>' },
    )}
  </div>
</div>`,
            "Settings",
          ),
        },
        {
          name: "A request to join, approved by an owner",
          rationale:
            "The way Slack handles join requests: the asker waits in a queue and an owner approves with the role. It is drawn here to be refused, because the back office has no join request and adding one would invite strangers to ask.",
          tradeoff:
            "A queue nobody asked for, and every request is a stranger asking for access to money. The company invites its team; nobody applies. This option stays in the library as the refused shape.",
          reference: "Slack",
          html: shell(
            "Team",
            `<div class="page ce-page">
  ${phead("Team", "6 people. 1 request waiting.", "", { crumb: trail("Home", "Settings", "Team") })}
  ${tabs(["People 6", "Invitations 2", "Requests 1"], 2)}
  ${callout("caution", "This back office has no join request. This queue would let strangers ask for access to money, so it is drawn only to be refused.")}
  ${section(
    "",
    `<div class="rlist">
      <div class="rrow"><span class="txt"><b>unknown@example.com</b><small>Asked 8 Oct 2026 · wants Picker for ${DELIVERY.name}</small></span>${badgeRaw("Waiting", "caution")}<span class="acts"><button class="btn sm">Approve</button><button class="btn sm subtle-danger">Refuse</button></span></div>
    </div>`,
    { desc: "The refused shape: invite the team instead." },
  )}
</div>`,
            "Settings",
          ),
        },
      ],
    },
    {
      id: "ce-publish",
      title: "Publishing and unpublishing a listing",
      why: "A draft is private until customers can see it. <b>Publishing says what customers will find, and unpublishing says what happens to what they found</b>, because placed orders outlive either command.",
      verdict:
        "Publish with the readiness check beside it is the pick: the reader reads what customers will find before they find it. Per-channel publish is the runner-up for companies that sell in more than one place. Never ship a silent unpublish; placed orders stay valid and the page must say so. Pause earns its place where the listing stays visible but nothing may sell.",
      variants: [
        {
          name: "Publish with the readiness check beside it",
          pick: true,
          rationale:
            "The way Webflow publishes: the dialog lists what is ready and the button commits only when all of it is. Publishing is the one create the reader cannot undo quietly, so the check is the dialog.",
          tradeoff:
            "A check that reads five systems can disagree with the page behind it by the time the button lands. The publish command must recheck and refuse with the missing piece named.",
          reference: "Webflow",
          html: shell(
            "Publish",
            `<div class="page ce-page" style="position:relative">
  ${phead(`${PRODUCT.name} ${badge(STATES.draft)}`, `${MONEY.lamp} · 500 units.`, '<button class="btn primary">Publish</button>', { crumb: trail("Home", "Products", PRODUCT.name) })}
  ${section("Price tiers", `<div class="rlist">${recordRow({ title: "Standard", sub: `${MONEY.lamp} · 500 units`, state: { label: "Priced", tone: "positive" } })}</div>`)}
  <div class="scrim">
    ${dialog(
      `Publish ${PRODUCT.name}?`,
      `<div class="stack sm" style="font-size:12.5px">
        <div><b>Customers will find this.</b> The storefront lists it within a minute of publishing.</div>
        <div class="alist">
          <div class="arow"><span class="why" aria-hidden="true">✓</span><span class="txt"><b>A name and a description</b><small>${PRODUCT.name} · solid oak, linen shade</small></span></div>
          <div class="arow"><span class="why" aria-hidden="true">✓</span><span class="txt"><b>A price</b><small>Standard at ${MONEY.lamp}, 500 units</small></span></div>
          <div class="arow"><span class="why" aria-hidden="true">✓</span><span class="txt"><b>A channel on sale</b><small>Storefront, published</small></span></div>
        </div>
      </div>`,
      { footer: '<button class="btn">Keep it a draft</button><button class="btn primary">Publish it</button>' },
    )}
  </div>
</div>`,
            "Products",
          ),
        },
        {
          name: "Unpublish with the customer consequences stated",
          rationale:
            "The way Shopify unpublishes a sales channel: the dialog says what stops and what stays, because placed orders are a commitment that outlives the listing. Unpublishing stops sales; it touches nothing sold.",
          tradeoff:
            "Two truths on one dialog, and the second is the one customers will ask about. The page behind it must keep answering for the sold units after the listing is gone.",
          reference: "Shopify",
          html: shell(
            "Unpublish",
            `<div class="page ce-page" style="position:relative">
  ${phead(`${PRODUCT.name} ${badgeRaw("On sale", "positive")}`, "412 sold. The storefront lists it now.", '<button class="btn subtle-danger">Unpublish</button>', { crumb: trail("Home", "Products", PRODUCT.name) })}
  ${section("Storefront", `<div class="rlist">${recordRow({ title: "shop.acme-supply.example", sub: "Listed since 12 Jan 2026", state: { label: "Live", tone: "positive" } })}</div>`)}
  <div class="scrim">
    ${dialog(
      `Unpublish ${PRODUCT.name}?`,
      `<div class="stack">
        <div style="font-size:12.5px"><b>Sales stop within a minute.</b> The storefront shows the product as unavailable and phone orders cannot take it.</div>
        <div class="callout positive">The 412 orders already placed stay valid and still ship. The 412 order lines keep their record.</div>
      </div>`,
      { footer: ceVFoot('<button class="btn danger">Unpublish it</button>', '<button class="btn">Keep it published</button>') },
    )}
  </div>
</div>`,
            "Products",
          ),
        },
        {
          name: "Publish on a date, set in advance",
          rationale:
            "The way WordPress schedules a post: the date is set on the draft and the publish happens without anyone present. A sale starting at 10:00 on a Tuesday should not need Sam Rivera at the desk at 10:00.",
          tradeoff:
            "A scheduled publish can land on a draft that changed since: the price moved, the stock moved. The scheduler must recheck at the hour and hold the publish with the reason named.",
          reference: "WordPress",
          html: shell(
            "Schedule",
            `<div class="page ce-page ce-narrow">
  ${phead(`${PRODUCT.name} ${badge(STATES.draft)}`, "Nothing about it is on sale yet.", "", { crumb: trail("Home", "Products", PRODUCT.name, "Publish") })}
  ${section(
    "Publish on a date",
    `<div class="stack sm">
      ${field("Date", input("13/01/2026"), { required: true })}
      ${field("Time", input("10:00"), { help: "Europe/Amsterdam. The storefront lists the product within a minute of the hour.", required: true })}
      <div class="callout">At 13 Jan 2026, 10:00 the product publishes itself: Standard at ${MONEY.lamp} on the storefront. Cancel the schedule any time before then.</div>
      ${ceFoot('<button class="btn ghost">Publish it now</button>', '<button class="btn">Cancel</button><button class="btn primary">Schedule it</button>')}
    </div>`,
  )}
</div>`,
            "Products",
          ),
        },
        {
          name: "Publish blocked, with the missing pieces listed",
          rationale:
            "The way Squarespace blocks publish on an unfinished site: the button stays, the missing pieces are listed with links, and each link lands on the field. A disabled button alone would read as broken.",
          tradeoff:
            "Every missing piece is a link away, and fixing one can reveal the next. The list must be complete on first read or the reader learns of them one publish attempt at a time.",
          reference: "Squarespace",
          html: shell(
            "Oak desk lamp",
            `<div class="page ce-page">
  ${phead(`${PRODUCT.name} ${badge(STATES.draft)}`, `${MONEY.lamp} · 500 units.`, '<button class="btn primary" disabled>Publish</button>', { crumb: trail("Home", "Products", PRODUCT.name) })}
  ${explained("Publish", "Two pieces are missing. Nothing about this product is on sale until both are set.")}
  ${section(
    "What is missing",
    `<div class="alist">
      <div class="arow"><span class="why" aria-hidden="true">◈</span><span class="txt"><b>A price</b><small>Nothing to order yet. The storefront cannot list a product with no price.</small></span><span class="go"><button class="btn sm primary">Add a price</button></span></div>
      <div class="arow"><span class="why" aria-hidden="true">▣</span><span class="txt"><b>A channel on sale</b><small>The storefront is published but lists nothing for this product.</small></span><span class="go"><button class="btn sm">List it</button></span></div>
    </div>`,
  )}
</div>`,
            "Products",
          ),
        },
        {
          name: "Pause sales without unpublishing",
          rationale:
            "The way Shopify pauses a store: the page stays up and says so, sales stop, and everything sold stays valid. A product that may restock needs the pause, not the unpublish.",
          tradeoff:
            "Paused reads as broken to a customer who does not read the message. The customer message must say when sales return, or customers stop trusting the pause.",
          reference: "Shopify",
          html: shell(
            "Storefront",
            `<div class="page ce-page">
  ${phead(`${PRODUCT.name} ${badge(STATES.paused)}`, `Paused 8 Oct 2026, 14:22 by ${PEOPLE.manager.name}. The page stays up.`, '<button class="btn primary">Resume sales</button>', { crumb: trail("Home", "Products", PRODUCT.name) })}
  ${alert("caution", "Nothing can be bought here", "The 412 orders already placed stay valid and still ship.")}
  ${section("What a customer sees", `<div class="preview"><div class="pv-body"><h4>${PRODUCT.name}</h4><p>Sales are paused at the moment. Orders already placed still ship.</p><span style="font-size:11.5px;color:var(--muted-foreground)">More units go on sale when returned stock arrives.</span></div></div>`)}
</div>`,
            "Products",
          ),
        },
        {
          name: "Publish per channel, one at a time",
          rationale:
            "The way Shopify publishes per sales channel: each channel holds its own state, so phone orders can sell while the storefront waits. One publish button per channel, each with its own check.",
          tradeoff:
            "Three channels in three states is a matrix the reader must hold in mind. The product page must show every channel at once, or one sells what another promised not to.",
          reference: "Shopify",
          html: shell(
            "Channels",
            `<div class="page ce-page">
  ${phead(PRODUCT.name, "One product, three channels, three states.", "", { crumb: trail("Home", "Products", PRODUCT.name, "Channels") })}
  ${section(
    "",
    `<div class="rlist">
      <div class="rrow"><span class="txt"><b>Storefront</b><small>shop.acme-supply.example · live since 12 Jan 2026</small></span>${badgeRaw("Live", "positive")}<span class="acts"><button class="btn sm subtle-danger">Unpublish</button></span></div>
      <div class="rrow"><span class="txt"><b>Phone orders</b><small>Canal Street 12 · ready, never published</small></span>${badgeRaw("Ready", "info")}<span class="acts"><button class="btn sm primary">Publish</button></span></div>
      <div class="rrow"><span class="txt"><b>Partner reseller</b><small>No stock allocated · nothing to sell</small></span>${badgeRaw("Not ready", "neutral")}<span class="acts"><button class="btn sm">Set it up</button></span></div>
    </div>`,
    { desc: "Each channel publishes on its own. Placed orders stay valid on every channel either way." },
  )}
</div>`,
            "Products",
          ),
        },
      ],
    },
    {
      id: "ce-schedule",
      title: "Scheduling a change for later",
      why: "Prices, fees and sale windows change on dates, not at clicks. <b>A scheduled change names the value, the date and the way to stop it</b>, and the record shows both values until the date arrives.",
      verdict:
        "A change with a date, listed with the record, is the pick: the current value and the coming one sit side by side with a cancel. The tier timeline is the runner-up where prices change on fixed dates. Never ship overlapping schedules on one record, and never a change without its customer preview where customers read the value. The sale window earns its place at creation, where open and close are set together.",
      variants: [
        {
          name: "A change with a date, listed with the record",
          pick: true,
          rationale:
            "The way WordPress lists a scheduled post beside its drafts: the coming change is a row with a date and a cancel, not a hidden timer. The fee page shows now and next together.",
          tradeoff:
            "Two values on one record is a rule every read must honour: orders placed before the date keep the old fee. Any page that prints the fee must print its date too.",
          reference: "WordPress",
          html: shell(
            "Delivery fee",
            `<div class="page ce-page ce-narrow">
  ${phead("Delivery fee", "What the customer pays on top of the order. You keep all of it.", "", { crumb: trail("Home", "Products", "Delivery fee") })}
  ${section(
    "",
    `<div class="stack sm">
      ${split(`Now · since 1 Oct 2026`, "EUR 5.00")}
      ${split("From 1 November 2026 · scheduled", "EUR 6.00")}
      <div class="callout">Orders placed before 1 Nov keep EUR 5.00. Orders after pay EUR 6.00.</div>
      ${field("Change the scheduled fee, in euros", ceEuro("6.00"), { help: "Takes effect on 1 November 2026.", required: true })}
      ${ceFoot('<button class="btn subtle-danger">Cancel the schedule</button>', '<button class="btn primary">Save the schedule</button>')}
    </div>`,
  )}
</div>`,
            "Products",
          ),
        },
        {
          name: "A tier ends on its date",
          rationale:
            "Each price holds its own dates, and the timeline shows what sells when. Standard at three prices is three rows, not one price edited twice.",
          tradeoff:
            "Three rows for one product is three records to read on every invoice and in every report. A customer who finds the old price can ask for the difference back, and the page must not hide that.",
          html: shell(
            "Prices",
            `<div class="page ce-page ce-mid">
  ${phead("Standard", "One product, three prices, each with its dates.", '<button class="btn sm">Add a tier</button>', { crumb: trail("Home", "Products", PRODUCT.name, "Standard", "Prices") })}
  ${section(
    "",
    `<div class="ce-sched">
      <div class="ce-sched-row"><span class="ce-date"><small>Until</small><b>1 Feb</b></span><span class="txt" style="flex:1;min-width:0"><b>Spring offer · EUR 40.00</b><small class="muted" style="display:block;font-size:11.5px">88 sold · ended</small></span>${badgeRaw("Ended", "neutral")}</div>
      <div class="ce-sched-row"><span class="ce-date"><small>Now</small><b>8 Oct</b></span><span class="txt" style="flex:1;min-width:0"><b>Standard · ${MONEY.lamp}</b><small class="muted" style="display:block;font-size:11.5px">412 sold · on sale until 1 Mar</small></span>${badgeRaw("On sale", "positive")}</div>
      <div class="ce-sched-row"><span class="ce-date"><small>From</small><b>1 Mar</b></span><span class="txt" style="flex:1;min-width:0"><b>Last units · EUR 55.00</b><small class="muted" style="display:block;font-size:11.5px">0 sold · scheduled</small></span><span class="acts" style="display:flex;gap:6px"><button class="btn sm">Change</button><button class="btn sm subtle-danger">Cancel</button></span></div>
    </div>`,
    { desc: "A unit bought keeps the price it was bought at. The timeline never rewrites a sale." },
  )}
</div>`,
            "Products",
          ),
        },
        {
          name: "A scheduled change cancelled before it runs",
          rationale:
            "The way Stripe voids a scheduled subscription change: cancelling is one dialog that says what stays. The EUR 6.00 fee never happens, and the record says it was cancelled rather than forgetting it.",
          tradeoff:
            "A cancelled schedule leaves a row that did nothing, and a year of those is noise. Cancelled rows must collapse into the history, not sit beside the value.",
          reference: "Stripe",
          html: shell(
            "Delivery fee",
            `<div class="page ce-page ce-narrow" style="position:relative">
  ${phead("Delivery fee", "What the customer pays on top of the order. You keep all of it.", "", { crumb: trail("Home", "Products", "Delivery fee") })}
  ${section("", `<div class="stack sm">${split(`Now · since 1 Oct 2026`, "EUR 5.00")}${split("From 1 November 2026 · scheduled", "EUR 6.00")}</div>`)}
  <div class="scrim">
    ${dialog(
      "Cancel the scheduled fee?",
      `<div class="stack">
        <div style="font-size:12.5px">The fee stays EUR 5.00. Nothing about any order changes, because the EUR 6.00 never took effect.</div>
        <div class="hint">The schedule stays in the history as cancelled, with who cancelled it and when.</div>
      </div>`,
      { footer: '<button class="btn">Keep the schedule</button><button class="btn danger">Cancel it</button>' },
    )}
  </div>
</div>`,
            "Products",
          ),
        },
        {
          name: "Two changes on one date, refused",
          rationale:
            "The way Google Calendar refuses a second booking in a locked room: the clash names both changes and offers the move. One record cannot become two fees on the same morning.",
          tradeoff:
            "The second change waits on the first being moved or cancelled, which means leaving and coming back. It must offer the move inline or the refusal sends the reader hunting.",
          reference: "Google Calendar",
          html: shell(
            "Delivery fee",
            `<div class="page ce-page ce-narrow">
  ${phead("Delivery fee", "What the customer pays on top of the order. You keep all of it.", "", { crumb: trail("Home", "Products", "Delivery fee") })}
  ${alert("destructive", "1 November already holds a change", `The fee becomes EUR 6.00 that morning, scheduled by ${PEOPLE.finance.name}. One record cannot become two fees on the same date.`)}
  ${section(
    "Move one of them",
    `<div class="stack sm">
      ${field("Move the EUR 6.00 change to", input("08/11/2026"), { help: "Its orders keep their date either way.", required: true })}
      ${ceFoot("", '<button class="btn">Cancel</button><button class="btn primary">Move it and schedule mine</button>')}
    </div>`,
    { desc: "Or cancel the EUR 6.00 change first, then schedule again." },
  )}
</div>`,
            "Products",
          ),
        },
        {
          name: "The sale window, set at creation",
          rationale:
            "Opens and closes are two dates on the record, and the state follows them. Standard sells from 12 Jan to 14 Mar without anyone present at either end.",
          tradeoff:
            "A window set at creation is rarely rechecked: it opens on an unfinished product or closes on a selling one. The product page must show the window beside the state, always.",
          html: shell(
            "Sale window",
            `<div class="page ce-page ce-narrow">
  ${phead(`Standard ${badgeRaw("On sale", "positive")}`, `${MONEY.lamp} · 412 of 500 sold.`, "", { crumb: trail("Home", "Products", PRODUCT.name, "Standard") })}
  ${section(
    "The sale window",
    `<div class="stack sm">
      <div class="ce-cols2">
        ${field("Opens", input("12/01/2026 10:00"), { required: true })}
        ${field("Closes", input("14/03/2026 22:00"), { required: true })}
      </div>
      <div class="hint">Before 12 Jan the product reads Coming soon. After 14 Mar 22:00 it reads Ended, and the order list is final.</div>
      ${ceFoot("", '<button class="btn primary">Save the window</button>')}
    </div>`,
  )}
</div>`,
            "Products",
          ),
        },
        {
          name: "What the customer sees, before and after",
          rationale:
            "The way Squarespace previews a scheduled site change: the reader reads the customer page twice, now and after. A fee change is judged by its customer line, not by its row on a settings page.",
          tradeoff:
            "A preview is a second rendering of the storefront and can drift from it. It must render from the same listing read the customer gets, or it shows a page the customer never sees.",
          reference: "Squarespace",
          html: shell(
            "Preview",
            `<div class="page ce-page ce-mid">
  ${phead("Fee change, 1 November", "What the customer reads on the order line, now and after.", "", { crumb: trail("Home", "Products", "Delivery fee", "Schedule") })}
  ${ceBeforeAfter(`<div><b>${PRODUCT.name} · ${MONEY.lamp}</b></div><div class="muted" style="font-size:11.5px">Plus EUR 5.00 delivery fee · total EUR 50.00</div>`, `<div><b>${PRODUCT.name} · ${MONEY.lamp}</b></div><div class="muted" style="font-size:11.5px">Plus EUR 6.00 delivery fee · total EUR 51.00</div>`)}
  ${callout("info", "The product stays the same. Only the fee line changes, on orders placed from 1 Nov.")}
  ${section("The schedule", `<div class="stack sm">${split("Takes effect", "1 November 2026, 00:00")}${split("Set by", `${PEOPLE.finance.name} · 8 Oct 2026`)}${ceFoot('<button class="btn subtle-danger">Cancel the schedule</button>', '<button class="btn primary">Keep it scheduled</button>')}</div>`)}
</div>`,
            "Products",
          ),
        },
      ],
    },
  ],
};
