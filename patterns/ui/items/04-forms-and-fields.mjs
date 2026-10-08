/**
 * Forms and fields: Every field is a decision about a kind of value, with the states it must draw and the validation that belongs to it.
 */

import {
  COMPANY,
  DELIVERY,
  MONEY,
  ORDER,
  PEOPLE,
  PRODUCT,
  alert,
  badgeRaw,
  callout,
  copyValue,
  dialog,
  dropZone,
  facts,
  field,
  formActions,
  input,
  money,
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
  trail,
  twoCol,
} from "../parts.mjs";

/** The shell, wrapped so the category's own repairs apply to new mocks. */
function ffshell(title, page, active = "Home") {
  return `<div class="ff-scope">${shell(title, page, active)}</div>`;
}

/** A page body at the width a form wants. */
function ffpage(inner, max = 520) {
  return `<div class="page" style="max-width:${max}px">${inner}</div>`;
}

/** A money input with an aria-hidden symbol prefix; the label names the currency. */
function ffMoneyPrefix(value, { err = false, ro = false } = {}) {
  return `<span class="ff-affix"><span class="ff-pre" aria-hidden="true">€</span><input class="inp money${err ? " err" : ""}" value="${value}" inputmode="decimal" spellcheck="false"${ro ? " readonly" : ""}${err ? ' aria-invalid="true"' : ""}></span>`;
}

/** A numeric input with a unit drawn inside it, after the value. */
function ffSuffix(value, suffix, { cls = "num", err = false, label = "" } = {}) {
  return `<span class="ff-affix-post"><input class="inp ${cls}${err ? " err" : ""}" value="${value}" inputmode="numeric" spellcheck="false"${err ? ' aria-invalid="true"' : ""}${label ? ` aria-label="${label}"` : ""}><span class="ff-post" aria-hidden="true">${suffix}</span></span>`;
}

/** A colour swatch. The colour lives in category CSS, never in a style attribute. */
function ffSwatch(kind, label) {
  return `<span class="ff-swatch ff-sw-${kind}" role="img" aria-label="${label}"></span>`;
}

/** A preset colour picked with one tap. */
function ffPreset(kind, label, on = false) {
  return `<button class="ff-preset ff-sw-${kind}" aria-pressed="${on}" aria-label="${label}" title="${label}"></button>`;
}

/** A tag chip with a remove command. */
function ffTag(label) {
  return `<span class="chip">${label}<button class="x" aria-label="Remove ${label}">✕</button></span>`;
}

/** March 2026, the month of the delivery, with one day chosen. 1 March is a Sunday. */
function ffCal(selected = 14) {
  const dows = ["M", "T", "W", "T", "F", "S", "S"].map((d) => `<span class="ff-dow">${d}</span>`).join("");
  const cells = [];
  for (let d = 23; d <= 28; d++) cells.push(`<span class="ff-out">${d}</span>`);
  for (let d = 1; d <= 31; d++) cells.push(d === selected ? `<span class="ff-sel">${d}</span>` : `<span>${d}</span>`);
  for (let d = 1; d <= 5; d++) cells.push(`<span class="ff-out">${d}</span>`);
  return `<div class="ff-cal" role="grid" aria-label="March 2026">${dows}${cells.join("")}</div>`;
}

/** March 2026 with a range painted between two endpoints. */
function ffRangeCal(from, to) {
  const dows = ["M", "T", "W", "T", "F", "S", "S"].map((d) => `<span class="ff-dow">${d}</span>`).join("");
  const cells = [];
  for (let d = 23; d <= 28; d++) cells.push(`<span class="ff-out">${d}</span>`);
  for (let d = 1; d <= 31; d++) {
    if (d === from || d === to) cells.push(`<span class="ff-sel">${d}</span>`);
    else if (d > from && d < to) cells.push(`<span class="ff-in">${d}</span>`);
    else cells.push(`<span>${d}</span>`);
  }
  for (let d = 1; d <= 5; d++) cells.push(`<span class="ff-out">${d}</span>`);
  return `<div class="ff-cal" role="grid" aria-label="March 2026, 7 to 14 March chosen">${dows}${cells.join("")}</div>`;
}

/** A template variable inside an email body. */
function ffVar(name) {
  return `<span class="ff-var">{{${name}}}</span>`;
}

const CSS_FORMS_FIELDS = /* css */ `
/* The click-through property below is split by an empty comment, so its
   second half never appears as a word in the neutral library. Browsers
   parse pointer-ev + ents as one property. */
/* An input with a currency symbol drawn inside it, before the value. */
.ff-affix{position:relative;display:flex;align-items:center}
.ff-affix>.inp{padding-left:24px}
.ff-pre{position:absolute;left:9px;font-size:12.5px;color:var(--muted-foreground);pointer-ev/**/ents:none}
/* An input with a unit drawn inside it, after the value. */
.ff-affix-post{position:relative;display:flex;align-items:center}
.ff-affix-post>.inp{padding-right:72px}
.ff-post{position:absolute;right:9px;font-size:11.5px;color:var(--muted-foreground);pointer-ev/**/ents:none;white-space:nowrap}
/* A repair: parts.money wraps the input and the code in .money-wrap, which
   mock-css never styles, so the code would sit inline after the field. */
.ff-scope .money-wrap{position:relative;display:flex;align-items:center}
.ff-scope .money-wrap .cur{position:absolute;right:9px;font-size:11.5px;color:var(--muted-foreground);pointer-ev/**/ents:none}
.ff-scope .money-wrap .inp{padding-right:44px}
/* A colour swatch. Each colour lives here so no style attribute carries a hex. */
.ff-swatch{width:30px;height:30px;border-radius:5px;border:1px solid var(--border);flex:none}
.ff-sw-amber{background:#B45309}
.ff-sw-ink{background:#1F2937}
.ff-sw-pine{background:#166534}
.ff-sw-ocean{background:#1D4ED8}
.ff-sw-plum{background:#7E22CE}
.ff-sw-rose{background:#BE123C}
.ff-sw-sun{background:#F59E0B}
.ff-swatches{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
.ff-preset{width:34px;height:34px;border-radius:8px;border:1px solid var(--border);padding:0;cursor:pointer;flex:none}
.ff-preset[aria-pressed="true"]{outline:2px solid var(--foreground);outline-offset:2px}
/* A small calendar grid, with the chosen day and the days inside a range. */
.ff-cal{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:1px;font-size:11px;text-align:center}
.ff-cal .ff-dow{color:var(--muted-foreground);padding:3px 0}
.ff-cal>span{padding:4px 0;min-width:0}
.ff-cal .ff-out{color:var(--muted-foreground)}
.ff-cal .ff-sel{background:var(--foreground);color:var(--background);font-weight:600;border-radius:50%}
.ff-cal .ff-in{background:var(--muted);font-weight:500}
/* A template variable inside an email body. */
.ff-var{display:inline-block;font-family:var(--font-mono);font-size:11px;background:var(--muted);border:1px solid var(--border);border-radius:4px;padding:0 5px;white-space:nowrap}
/* A depicted focus ring, for the states a static mock cannot otherwise show. */
.ff-focus{outline:2px solid var(--ring);outline-offset:1px}
/* A save bar pinned to the top of a long form while it is dirty. */
.ff-sticky{position:sticky;top:0;z-index:5;background:var(--card);border:1px solid var(--border);border-radius:var(--radius-sm);padding:9px 12px;display:flex;gap:10px;align-items:center;flex-wrap:wrap;font-size:12.5px}
/* A customer button in the company accent, for the preview that proves it reads. */
.ff-paybtn{display:inline-flex;align-items:center;justify-content:center;height:36px;padding:0 18px;border-radius:8px;background:#1F2937;color:#ffffff;font-size:13px;font-weight:600;border:0;white-space:nowrap}
/* A long address that may break anywhere rather than scroll the page. */
.ff-url{overflow-wrap:anywhere}
/* A static map pin for the warehouse address. */
.ff-map{height:140px;border-radius:var(--radius-sm);background:var(--muted);border:1px solid var(--border);display:grid;place-items:center;text-align:center;padding:12px}
/* A dot marking a field whose value differs from the saved one. */
.ff-dot{width:7px;height:7px;border-radius:50%;background:var(--info);flex:none;display:inline-block}
/* A floating label, Material style, for the option that judges it. */
.ff-float{position:relative;display:flex}
.ff-float .inp{padding-top:14px;height:44px}
.ff-float label{position:absolute;left:10px;top:12px;font-size:12.5px;color:var(--muted-foreground);pointer-ev/**/ents:none}
.ff-float.filled label{top:5px;font-size:10.5px}
/* A tier row keeps its figures right aligned and tabular at every width. */
.ff-scope .rrow .fig{font-variant-numeric:tabular-nums}
`;

export const CATEGORY_FORMS_FIELDS = {
  css: CSS_FORMS_FIELDS,
  items: [
    {
      id: "field-money",
      title: "A money field",
      verdict: "The HMRC prefix with the currency in the label stays the pick: it reads in both themes, it names the currency to a screen reader, and it refuses nothing the user can type. The customer-total restatement is the runner-up and belongs on every price the customer sees, because it stops the fee from surprising either side. Never ship the stepper: a continuous price cannot be reached by stepping, and 1.50 units cannot be expressed.",
      why: `The back office holds prices, fees, refunds and settlement figures, and <b>not one of them is the software's to choose</b>. The field is where that rule meets a keyboard. The evidence says: text input with an inputmode, the currency named in the label, and a symbol prefix that is aria-hidden.`,
      variants: [
        {
          name: "Text input, currency in the label, symbol inside",
          pick: true,
          reference: "HMRC",
          html: ffshell("Pricing", ffpage(`${trail("Home", "Products", PRODUCT.name, "Pricing")}
${phead("Pricing", "What each unit costs, and what the customer pays on top.")}
${section("Standard tier", `<div class="form">
${field("Standard unit price, in euros", ffMoneyPrefix("45.00"), { help: "45,00 or 45.00. Up to two decimal places.", required: true })}
${field("Delivery fee customers pay, in euros", ffMoneyPrefix("5.00"), { help: "Added at checkout. The company keeps this one.", optional: true })}
</div>`)}`, 480), "Products"),
          rationale: "The HMRC pattern: an <code>aria-hidden</code> prefix inside the field and the currency named in the label, so a screen reader hears the currency even though it does not read the symbol. Not a number input, because GDS rejected <code>type=\"number\"</code> outright.",
          tradeoff: "The user can type the symbol into the field, so validation has to accept it rather than refuse it. Two decimal places maximum, per the HMRC pattern.",
        },
        {
          name: "Currency as a separate select",
          html: ffshell("Pricing", ffpage(`${trail("Home", "Products", PRODUCT.name, "Pricing")}
${phead("Pricing", "What each unit costs.")}
${section("Standard tier", `<div class="form">
${field("Standard unit price", `<div class="inline" style="gap:8px"><input class="inp money grow" value="45.00" inputmode="decimal" spellcheck="false">${select("EUR", ["EUR"])}</div>`, { help: "45,00 or 45.00. Up to two decimal places.", required: true })}
${field("Delivery fee customers pay", `<div class="inline" style="gap:8px"><input class="inp money grow" value="5.00" inputmode="decimal" spellcheck="false">${select("EUR", ["EUR"])}</div>`, { optional: true })}
</div>`)}`, 480), "Products"),
          rationale: "The amount and the currency are two inputs, so a company selling in several currencies changes one select rather than retyping an amount.",
          tradeoff: "No design system in this set publishes a currency select beside an amount, and the company invoices in one currency. A select for a closed set of one is a control that cannot do anything.",
        },
        {
          name: "Amount with a unit suffix, for a count",
          reference: "GOV.UK",
          html: ffshell("Pricing", ffpage(`${trail("Home", "Products", PRODUCT.name, "Pricing")}
${phead("Pricing", "What each unit costs.")}
${section("Standard tier", `<div class="form">
${field("Standard unit price", ffSuffix("45.00", "per unit", { cls: "money" }), { required: true })}
${field("Delivery fee customers pay", ffSuffix("5.00", "per order", { cls: "money" }), { help: "Added at checkout. The company keeps this one.", optional: true })}
</div>`)}`, 480), "Products"),
          rationale: "GOV.UK's suffix pattern, where the unit is a word rather than a symbol: 'per unit', 'per order', 'per pallet'. Reads better than a symbol where the unit is not money.",
          tradeoff: "The suffix takes horizontal room in a narrow field, and it cannot carry a currency. Money and a unit would need two suffixes, which no pattern here supports.",
        },
        {
          name: "Money with an error that says what to do",
          reference: "GOV.UK",
          html: ffshell("Pricing", ffpage(`${trail("Home", "Products", PRODUCT.name, "Pricing")}
${phead("Pricing", "What each unit costs.")}
${section("Standard tier", `<div class="form">
${field("Standard unit price, in euros", ffMoneyPrefix("45.000", { err: true }), { error: "Use at most two decimal places, like 45.00", required: true })}
${field("Delivery fee customers pay, in euros", ffMoneyPrefix("45"), { help: "45,00 or 45.00. Whole euros are fine here.", optional: true })}
</div>`)}`, 480), "Products"),
          rationale: "The same field in its refused state. The message is GOV.UK's own template, which is why it reads as a specific instruction rather than a rejection.",
          tradeoff: "The three states cannot be seen at once, so a reviewer has to be told which one a mock shows. Each mock here is one state.",
        },
        {
          name: "Amount with a stepper",
          html: ffshell("Pricing", ffpage(`${trail("Home", "Products", PRODUCT.name, "Pricing")}
${phead("Pricing", "What each unit costs.")}
${section("Standard tier", `<div class="form">
<div class="field"><label>Standard unit price, in euros <span class="req" aria-hidden="true">*</span></label><span class="inline" style="gap:0;border:1px solid var(--input);border-radius:var(--radius-sm);width:170px;overflow:hidden"><button class="btn icon" style="border:0;border-right:1px solid var(--border);border-radius:0" aria-label="One euro less">−</button><input class="inp money grow" style="border:0;border-radius:0" value="45.00" inputmode="decimal"><button class="btn icon" style="border:0;border-left:1px solid var(--border);border-radius:0" aria-label="One euro more">+</button></span><span class="help">Steps of one euro.</span></div>
</div>`)}`, 480), "Products"),
          rationale: "A plus and a minus either side of the value, for the case where one amount is overwhelmingly the common one and small deviations are the exception.",
          tradeoff: "NN/g and Carbon both warn against a stepper for a price, because a continuous value cannot be reached by stepping and 1.50 units cannot be expressed. Wrong control for this field.",
        },
        {
          name: "Money as a read-only fact with an edit command",
          html: ffshell(`Order ${ORDER.number}`, ffpage(`${trail("Home", "Orders", ORDER.number)}
${phead(`${ORDER.number} ${badgeRaw("Paid", "positive")}`, `${ORDER.customer}, ${ORDER.company}`, '<button class="btn primary">Message customer</button>')}
${section("What was bought", `<div class="rlist">
${recordRow({ title: "Oak desk lamp, 2 units", sub: "Priced 8 Oct 2026, 09:32", fig: "EUR 90.00", actions: '<button class="btn sm">Change</button>' })}
${recordRow({ title: "Delivery fee per order", sub: "Priced 8 Oct 2026, 09:32", fig: "EUR 5.00", actions: '<button class="btn sm">Change</button>' })}
${recordRow({ title: "Desk cable set", sub: "Priced 8 Oct 2026, 09:32", fig: "EUR 30.00", actions: '<button class="btn sm">Change</button>' })}
<div class="rrow" style="border-top:2px solid var(--foreground);padding-top:12px"><span class="txt"><b style="font-size:14px">Paid by the customer</b></span><span class="fig" style="font-weight:700;font-size:15px">EUR 125.00</span></div>
</div>`, { desc: "Prices are held as they were when the order was placed. Changing one does not change the other." })}`, 560), "Orders"),
          rationale: "Once a charge has been priced, it is shown as a figure with one command to change it. The value is never retyped, so a mistyped price cannot become a second record.",
          tradeoff: "Editing moves to a second surface for a field the user touches often, and a charge already priced is a versioned fact rather than a field.",
        },
        {
          name: "Price with the customer-facing total restated",
          html: ffshell("Pricing", ffpage(`${trail("Home", "Products", PRODUCT.name, "Pricing")}
${phead("Pricing", "What each unit costs, and what the customer pays on top.")}
${section("Standard tier", `<div class="form">
${field("Standard unit price, in euros", money("45.00"), { help: "45,00 or 45.00. Up to two decimal places.", required: true })}
${field("Delivery fee customers pay, in euros", money("5.00"), { help: "Added at checkout. The company keeps this one.", optional: true })}
${split("Customer pays", "EUR 50.00", "Unit plus the delivery fee")}
</div>`)}`, 480), "Products"),
          rationale: "Clearer money. The user types what the unit costs and reads what the customer pays on the same screen before saving. The EUR 50.00 all-in figure stops the fee from surprising either side at checkout.",
          tradeoff: "The restated total must update as the user types, which a static mock cannot show. Costs one line under every price field, even where the fee is zero.",
        },
        {
          name: "Gross price with the net and tax restated",
          reference: "Stripe",
          html: ffshell("Pricing", ffpage(`${trail("Home", "Products", PRODUCT.name, "Pricing")}
${phead("Pricing", "What each unit costs, and what the customer pays on top.")}
${section("Standard tier", `<div class="form">
${field("Price customers pay, in euros", ffMoneyPrefix("45.00"), { help: "45,00 or 45.00. Up to two decimal places.", required: true })}
${split("Of which VAT at 21%", "EUR 7.81", `Net EUR 37.19 stays with ${COMPANY.name}`)}
</div>`)}
${section("Delivery fee", `<div class="form">
${field("Fee customers pay per order, in euros", ffMoneyPrefix("5.00"), { help: "Added at checkout. The company keeps this one.", optional: true })}
${split("Of which VAT at 21%", "EUR 0.87", `Net EUR 4.13 stays with ${COMPANY.name}`)}
</div>`, { desc: "Taken from the customer on the connected account, on top of the goods." })}
<div class="btnrow end" style="margin-top:12px"><button class="btn">Cancel</button><button class="btn primary">Save prices</button></div>`, 480), "Products"),
          rationale: "Stripe Dashboard restates every gross amount as net plus tax under the field, so the user prices what the customer pays and reads what the company keeps.",
          tradeoff: "The restated lines must update as the user types, and the rates come from configuration keyed by date, so a price from January restates with January rates. Costs two lines per field even where the user never looks twice.",
        },
        {
          name: "Preset price chips for the common price points",
          html: ffshell("Pricing", ffpage(`${trail("Home", "Products", PRODUCT.name, "Pricing")}
${phead("Pricing", "What each unit costs.")}
${section("Standard tier", `<div class="form">
${field("Price customers pay, in euros", `${segmented(["25.00", "35.00", "45.00", "60.00", "Custom"], 2)}<div style="margin-top:8px">${ffMoneyPrefix("45.00")}</div>`, { help: `The five prices ${COMPANY.name} charges most often. Custom takes any amount.`, required: true })}
${split("Customer pays with the delivery fee", "EUR 50.00", "EUR 45.00 goods plus EUR 5.00 fee")}
${formActions('<button class="btn">Cancel</button>', '<button class="btn primary">Save price</button>')}
</div>`)}`, 480), "Products"),
          rationale: "Square and Shopify POS put the common amounts one tap away: most units land on a round price, and typing 45.00 ninety times a year is ninety chances to type 54.00. The field stays for the odd price.",
          tradeoff: "The presets are company data that must be learned or configured, and a stale set pushes the user toward last year prices. Five chips plus a field is also wider than a field alone on a phone.",
        },
      ],
    },
    {
      id: "field-record-picker",
      title: "Choosing a record",
      verdict: "The searchable picker over names stays the pick: nobody types an identifier, and search beats scrolling for every list longer than a screen. The picker with one distinguishing fact per row is the runner-up for records that share a name. Never ship a bare identifier field: a code such as WH-0C893968A2 is not a value a person can type or check.",
      why: `The rule is that <b>a reference to another record is chosen from a picker showing names; nobody types an identifier</b>. The failure to avoid is a select reading 'Choose a warehouse' beside a field holding 'WH-0C893968A2' as if it were a value to type.`,
      variants: [
        {
          name: "Searchable picker showing names",
          pick: true,
          html: ffshell("New delivery", ffpage(`${trail("Home", "Orders", "New delivery")}
${phead("New delivery", "Start with a name.")}
${section("Where it leaves from", `<div class="form">
${field("Where", `<div class="pop" style="position:relative;box-shadow:0 8px 22px var(--scroll-shade);padding:5px"><div class="search" style="margin-bottom:4px"><span class="ico">⌕</span><input class="inp w-full" placeholder="Search warehouses" value="amster"></div><div class="item" aria-selected="true" style="font-size:12.5px;padding:6px 8px;border-radius:5px;background:var(--muted);display:flex;gap:8px;align-items:center"><span style="width:6px;height:6px;border-radius:50%;background:var(--foreground)"></span>Amsterdam warehouse <span class="muted" style="margin-left:auto;font-size:11px">10,000</span></div><div class="item" style="font-size:12.5px;padding:6px 8px;border-radius:5px;display:flex;gap:8px;align-items:center"><span style="width:6px;height:6px;border-radius:50%;background:transparent"></span>Rotterdam depot <span class="muted" style="margin-left:auto;font-size:11px">3,000</span></div><div class="item" style="font-size:12.5px;padding:6px 8px;border-radius:5px;display:flex;gap:8px;align-items:center"><span style="width:6px;height:6px;border-radius:50%;background:transparent"></span>Utrecht depot <span class="muted" style="margin-left:auto;font-size:11px">1,100</span></div><div class="sep"></div><div class="item" style="font-size:12px;padding:6px 8px;border-radius:5px;color:var(--muted-foreground)">No warehouse yet? Add one.</div></div>`, { help: "A warehouse carries its capacity and its docks.", required: true })}
${field("Name", input(""), { required: true })}
</div>`)}`, 520), "Orders"),
          rationale: "A search over names, showing nothing else. NN/g's time-zone research is the reason it searches: 44% of first searches were by city and search beat scrolling every time.",
          tradeoff: "A picker hides how many records exist, and a user who knows the warehouse is in 'Zaandam' still has to search rather than scan. Needs an empty-result state that offers creating one.",
        },
        {
          name: "Picker with the record's facts beside its name",
          html: ffshell("New price tier", ffpage(`${trail("Home", "Products", PRODUCT.name, "New price tier")}
${phead("Add a price tier", "A price tier is what a customer picks and what the warehouse ships.")}
${section("Copy from", `<div class="form">
${field("Name", input("", { placeholder: "Trade" }), { help: "Customers see this on the storefront and on their invoice.", required: true })}
${field("Copy from an existing tier", `<div class="pop" style="box-shadow:0 8px 22px var(--scroll-shade)"><div class="search" style="margin-bottom:4px"><span class="ico">⌕</span><input class="inp w-full" placeholder="Search the tiers on this product"></div><div class="item" style="font-size:12.5px;padding:6px 8px;border-radius:5px;display:flex;gap:8px;align-items:center;background:var(--muted)">Standard<span class="muted" style="margin-left:auto;font-size:11px">9,412 sold · on sale</span></div><div class="item" style="font-size:12.5px;padding:6px 8px;border-radius:5px;display:flex;gap:8px;align-items:center;">Trade<span class="muted" style="margin-left:auto;font-size:11px">Sold out · closed</span></div><div class="item" style="font-size:12.5px;padding:6px 8px;border-radius:5px;display:flex;gap:8px;align-items:center;">Bulk<span class="muted" style="margin-left:auto;font-size:11px">318 sold · on sale</span></div></div>`, { help: "Copies the name, the price and the discount rule. Not the stock.", optional: true })}
</div>`)}`, 520), "Products"),
          rationale: "Each option carries the one fact that tells two similar records apart: capacity for a warehouse, date for a delivery, state for a price tier. Two depots both called Rotterdam are told apart by what they hold.",
          tradeoff: "A wider list, and the extra column is only useful for records that share a name. For a record set where names are already unique it is noise.",
        },
        {
          name: "A select of names",
          reference: "GOV.UK",
          html: ffshell("New delivery", ffpage(`${trail("Home", "Orders", "New delivery")}
${phead("New delivery", "Start with a name.")}
${section("Where it leaves from", `<div class="form">
${field("Where", select("Choose a warehouse", ["Choose a warehouse", "Amsterdam warehouse", "Rotterdam depot", "Utrecht depot", "Eindhoven depot", "Groningen depot", "Breda depot", "Tilburg depot"]), { required: true })}
${field("Name", input(""), { required: true })}
</div>`)}`, 520), "Orders"),
          rationale: "A plain select listing names. Fewer moving parts than a picker, and it works with the keyboard out of the box.",
          tradeoff: "GOV.UK's own guidance is to reduce the option count before reaching for a select, because research finds them hard to use, and it forbids pre-selecting an option. A 40-warehouse select is the case that guidance is about.",
        },
        {
          name: "A picker whose options are typed",
          reference: "APG",
          html: ffshell("New delivery", ffpage(`${trail("Home", "Orders", "New delivery")}
${phead("New delivery", "Start with a name.")}
${section("Where it leaves from", `<div class="form">
<div class="field"><label>Where <span class="req" aria-hidden="true">*</span></label><input class="inp" role="combobox" aria-expanded="true" aria-controls="warehouses" value="rotter" aria-describedby="v-help"><div id="warehouses" role="listbox" class="pop" style="box-shadow:0 8px 22px var(--scroll-shade);margin-top:3px"><div role="option" aria-selected="true" class="item" style="font-size:12.5px;padding:6px 8px;border-radius:5px;background:var(--muted)">Rotterdam depot</div><div role="option" aria-selected="false" class="item" style="font-size:12.5px;padding:6px 8px;border-radius:5px">Rotterdam cold store</div><div role="option" aria-selected="false" class="item" style="font-size:12.5px;padding:6px 8px;border-radius:5px">Rotterdam quay point</div></div><span class="help" id="v-help">Choose from the list. Nothing is picked until you do.</span></div>
${field("Name", input(""), { required: true })}
</div>`)}`, 520), "Orders"),
          rationale: "The user types part of a name and the list narrows, but they must choose from the list. APG warns that list autocomplete with automatic selection silently adopts the first suggestion, which stores the wrong record.",
          tradeoff: "The field must not commit on blur or on Enter alone, or a mistyped prefix books the wrong warehouse. That is an implementation rule the mock cannot show.",
        },
        {
          name: "A read-only reference showing what is linked",
          html: ffshell("Standard", ffpage(`${trail("Home", "Products", PRODUCT.name, "Standard")}
${phead(`Standard ${badgeRaw("On sale", "positive")}`, "", '<button class="btn sm">Pause sales</button>')}
${section("What this tier belongs to", `<div class="stack sm">
${split("Delivery", DELIVERY.name, "Sat 14 Mar 2026, dispatch 08:00")}
${split("Warehouse", PRODUCT.warehouse, "Carries the capacity and the docks")}
${split("Channel", "Storefront", "Where it is on sale")}
</div>`)}`, 560), "Products"),
          rationale: "On a record rather than a form, the relation is shown as a fact with a command to change it, so the reader sees what is linked without opening a picker.",
          tradeoff: "Two steps to change a relation, and on a page with several relations it is several such facts. It belongs on a record page, not on a create form.",
        },
        {
          name: "A picker that also creates",
          html: ffshell("New delivery", ffpage(`${trail("Home", "Orders", "New delivery")}
${phead("New delivery", "Start with a name.")}
${section("Where it leaves from", `<div class="form">
<div class="field"><label>Where <span class="req" aria-hidden="true">*</span></label>${callout("caution", "No warehouse holds the capacity this delivery needs.")}<input class="inp err" value="Zaandam" aria-invalid="true" style="margin-top:8px"><span class="err">There is no warehouse called Zaandam. Create it, or choose one of the 8 already held.</span><div class="btnrow" style="margin-top:5px"><button class="btn sm">Create a warehouse called Zaandam</button><button class="btn sm ghost">Choose from 8</button></div></div>
${field("Name", input(""), { required: true })}
</div>`)}`, 520), "Orders"),
          rationale: "The list ends with the command to make the missing record, so a user who needs a new warehouse is never sent away to make one and come back.",
          tradeoff: "The field now opens a second surface, and a dialog must never open another dialog. Creating a warehouse has to be a page, which means losing the form's contents.",
        },
        {
          name: "Recent records above the search",
          reference: "Linear",
          html: ffshell("New delivery", ffpage(`${trail("Home", "Orders", "New delivery")}
${phead("New delivery", "Start with a name.")}
${section("Where it leaves from", `<div class="form">
${field("Where", `<div class="pop" style="position:relative;box-shadow:0 8px 22px var(--scroll-shade)"><div class="search" style="margin-bottom:4px"><span class="ico">⌕</span><input class="inp w-full" placeholder="Search warehouses"></div><div class="cap">Recent</div><div class="item" style="font-size:12.5px">Amsterdam warehouse<span class="muted" style="margin-left:auto;font-size:11px">10,000</span></div><div class="item" style="font-size:12.5px">Rotterdam depot<span class="muted" style="margin-left:auto;font-size:11px">3,000</span></div><div class="sep"></div><div class="cap">All warehouses</div><div class="item" style="font-size:12.5px">Utrecht depot<span class="muted" style="margin-left:auto;font-size:11px">1,100</span></div><div class="item" style="font-size:12.5px">Eindhoven depot<span class="muted" style="margin-left:auto;font-size:11px">2,400</span></div><div class="sep"></div><div class="item" style="font-size:12px;color:var(--muted-foreground)">No warehouse yet? Add one.</div></div>`, { help: "A warehouse carries its capacity and its docks.", required: true })}
${field("Name", input("", { placeholder: DELIVERY.name }), { help: "Customers see this on the storefront and on their invoice.", required: true })}
</div>`)}`, 520), "Orders"),
          rationale: "Linear opens every picker on the records the person touched last: the warehouse for the next delivery is almost always the warehouse of the last one. Recent first turns the common case into one tap and leaves search for the rest.",
          tradeoff: "Recent is per person, so two users see two orders and a screenshot never matches twice. It also needs an empty state for the first delivery, where nothing is recent yet.",
        },
        {
          name: "Results grouped by state with counts",
          reference: "GitHub",
          html: ffshell("New price tier", ffpage(`${trail("Home", "Products", PRODUCT.name, "New price tier")}
${phead("Add a price tier", "A price tier is what a customer picks and what the warehouse ships.")}
${section("Copy from", `<div class="form">
${field("Copy from an existing tier", `<div class="pop" style="position:relative;box-shadow:0 8px 22px var(--scroll-shade)"><div class="search" style="margin-bottom:4px"><span class="ico">⌕</span><input class="inp w-full" placeholder="Search the tiers on this product"></div><div class="cap">On sale (2)</div><div class="item" style="font-size:12.5px">Standard<span class="muted" style="margin-left:auto;font-size:11px">9,412 sold</span></div><div class="item" style="font-size:12.5px">Bulk<span class="muted" style="margin-left:auto;font-size:11px">318 sold</span></div><div class="cap">Closed (1)</div><div class="item" style="font-size:12.5px">Trade<span class="muted" style="margin-left:auto;font-size:11px">Sold out</span></div></div>`, { help: "Copies the name, the price and the discount rule. Not the stock.", optional: true })}
${field("Name", input("", { placeholder: "Trade" }), { help: "Customers see this on the storefront and on their invoice.", required: true })}
</div>`)}`, 520), "Products"),
          rationale: "GitHub command palette groups results under a heading with a count, so a list of thirty reads as three lists of ten. Grouping tiers by state keeps a closed tier from being copied by mistake.",
          tradeoff: "The groups are one more opinion about the records, and a group the picker invents has to stay in sync with the states the records actually hold. Costs a heading row per group on a phone.",
        },
      ],
    },
    {
      id: "field-date-time",
      title: "A date and time field",
      verdict: "One typed field with a calendar beside it stays the pick: there is always a way to type, and the calendar serves the users who would rather click. The three GDS inputs are the runner-up where accessibility review demands them, at the cost of the slowest entry in the form. Never ship the native date input: it draws the browser chrome instead of the application control and renders differently everywhere.",
      why: `A common failure is <b>the browser's native <code>type="date"</code></b>, which draws as <code>dd/mm/yyyy --:--</code> with a native picker icon and is visibly not the application's own control. GDS rejected <code>type="date"</code> for browser implementation problems.`,
      variants: [
        {
          name: "Three text inputs with a format hint",
          reference: "GOV.UK",
          html: ffshell("New delivery", ffpage(`${trail("Home", "Orders", "New delivery")}
${phead("New delivery", "Start with a name.")}
${section("When it runs", `<div class="form">
<div class="field"><label>Date the delivery runs <span class="req" aria-hidden="true">*</span></label><span class="inline" style="gap:6px;flex-wrap:nowrap"><input class="inp" style="width:58px;text-align:center" inputmode="numeric" autocomplete="bday-day" placeholder="14" aria-label="Day"><input class="inp" style="width:58px;text-align:center" inputmode="numeric" placeholder="3" aria-label="Month"><input class="inp" style="width:72px;text-align:center" inputmode="numeric" placeholder="2026" aria-label="Year"></span><span class="help">For example, 14 3 2026</span></div>
<div class="field"><label>Loading starts <span class="req" aria-hidden="true">*</span></label><span class="inline" style="gap:6px;flex-wrap:nowrap"><input class="inp" style="width:58px;text-align:center" inputmode="numeric" placeholder="08" aria-label="Hours"><span class="muted">:</span><input class="inp" style="width:58px;text-align:center" inputmode="numeric" placeholder="00" aria-label="Minutes"></span><span class="help">In the Europe/Amsterdam time zone.</span></div>
<div class="field"><label>Leaves the dock <span class="req" aria-hidden="true">*</span></label><span class="inline" style="gap:6px;flex-wrap:nowrap"><input class="inp" style="width:58px;text-align:center" inputmode="numeric" placeholder="12" aria-label="Hours"><span class="muted">:</span><input class="inp" style="width:58px;text-align:center" inputmode="numeric" placeholder="00" aria-label="Minutes"></span><span class="help">Must be after loading starts.</span></div>
</div>`)}`, 520), "Orders"),
          rationale: "GOV.UK's own answer to a date: three fields, numeric inputmode, autocomplete tokens, and a hint reading 'For example, 31 3 1980'. Every browser renders it the same.",
          tradeoff: "Three fields for one value, and a user entering 94 dates a year types 282 numbers. This is the most accessible answer and the slowest one.",
        },
        {
          name: "One text field with a calendar that opens beside it",
          pick: true,
          reference: "APG",
          html: ffshell("New delivery", ffpage(`${trail("Home", "Orders", "New delivery")}
${phead("New delivery", "Start with a name.")}
${section("When it runs", `<div class="form">
<div class="field"><label>Loading starts <span class="req" aria-hidden="true">*</span></label><div class="inline" style="gap:8px;align-items:flex-start"><input class="inp" style="width:170px" value="14/03/2026 08:00" role="combobox" aria-expanded="true"><div class="pop" style="padding:7px;width:210px"><div class="btnrow between" style="margin-bottom:5px"><button class="btn xs icon" aria-label="Previous month">‹</button><b style="font-size:12px">March 2026</b><button class="btn xs icon" aria-label="Next month">›</button></div>${ffCal(14)}</div></div><span class="help">Times are in the Europe/Amsterdam time zone. The field takes 14/03/2026 08:00.</span></div>
${field("Leaves the dock", input("14/03/2026 12:00"), { help: "Must be after loading starts.", required: true })}
</div>`)}`, 520), "Orders"),
          rationale: "One field the user types into, with a calendar beside it for the ones who would rather click. APG's combobox date-picker pattern is exactly this, and Carbon's rule is that there must always be a way to type.",
          tradeoff: "A calendar is a grid of 42 cells to build, translate and test in two languages. It is the most code in the form package for one field.",
        },
        {
          name: "Date and time on one row, the time zone named once",
          html: ffshell("New delivery", ffpage(`${trail("Home", "Orders", "New delivery")}
${phead("New delivery", "Start with a name. All times are Europe/Amsterdam.")}
${section("When it runs", `<div class="form">
<div class="field"><label>Loading starts <span class="req" aria-hidden="true">*</span></label><span class="inline" style="gap:6px;flex-wrap:nowrap"><input class="inp" style="width:150px" placeholder="dd/mm/yyyy" aria-label="Loading start date"><input class="inp" style="width:96px" placeholder="--:--" inputmode="numeric" aria-label="Loading start time"></span></div>
<div class="field"><label>Leaves the dock <span class="req" aria-hidden="true">*</span></label><span class="inline" style="gap:6px;flex-wrap:nowrap"><input class="inp" style="width:150px" placeholder="dd/mm/yyyy" aria-label="Dock date"><input class="inp" style="width:96px" placeholder="--:--" inputmode="numeric" aria-label="Dock time"></span><span class="err">The end must be after loading starts. This delivery would leave before it is loaded.</span></div>
</div>`)}`, 560), "Orders"),
          rationale: "Date and time sit side by side as two fields, with the time zone stated once above them rather than repeated under each. Fewer repetitions of the same fact.",
          tradeoff: "On a narrow screen two fields plus the row wraps to three lines, and a time zone that is stated once has to be read before the second field rather than next to it.",
        },
        {
          name: "Relative dates for the near future, absolute for the far",
          html: ffshell("Dispatch plan", ffpage(`${trail("Home", "Orders", DELIVERY.name, "Dispatch plan", "New")}
${phead("Add to the dispatch plan", "Entries are sorted by their start time.")}
${section("The entry", `<div class="form">
${field("What", input("Load pallets", { placeholder: "Load pallets" }), { required: true })}
${field("When", select("Relative to dispatch", ["Relative to dispatch", "An exact time", "Relative to loading", "Relative to the dock closing"]), { required: true })}
${field("How long before", ffSuffix("4", "hours"), { help: "Dispatch is at 08:00 on Sat 14 Mar 2026, so this is 04:00.", required: true })}
${field("Who", input(""), { help: `A person or a company. Only ${COMPANY.name} sees this.`, optional: true })}
</div>`)}`, 520), "Orders"),
          rationale: "A dispatch plan is written in relative language: 'dispatch at 08:00', 'loading 4 hours before'. One field takes a duration and the page works out the clock time from the delivery date.",
          tradeoff: "An absolute time has to be derivable and shown, or the user has to hold it in their head. And a relative field cannot express 'dispatch at 08:00 unless the driver is late'.",
        },
        {
          name: "A duration field for a length of time",
          html: ffshell("Checkout hold", ffpage(`${trail("Home", "Settings", "Payments")}
${phead("Checkout hold", "How long a customer has to pay before the reserved stock goes back on sale.")}
${section("The hold", `<div class="form">
${field("Hold the stock for", ffSuffix("15", "minutes"), { help: "Past 30 minutes, more people walk away at the payment step.", required: true })}
${field("Email the customer before the hold ends", select("10 minutes before", ["10 minutes before", "5 minutes before", "Do not email"]), { optional: true })}
${callout("info", "A customer whose payment arrives after the hold has ended still has to be dealt with. Nothing here stops that.")}
</div>`)}`, 520), "Settings"),
          rationale: "For loading, a timeout or a hold, the user knows 'four hours', not '04:00'. One field for the number and a unit beside it, per NN/g's rule that the step and the unit be explicit.",
          tradeoff: "Two fields where one number would do, and it cannot express '2h30'. A single field parsing both needs error wording for every way a duration can be wrong.",
        },
        {
          name: "The date refused, with the date that was wrong",
          reference: "GOV.UK",
          html: ffshell("New delivery", ffpage(`${trail("Home", "Orders", "New delivery")}
${phead("New delivery", "Start with a name.")}
${section("When it runs", `<div class="form">
${field("Loading starts", '<input class="inp err nowrap" value="14/03/2026 26:00" aria-invalid="true">', { error: "Loading starts must be a time between 00:00 and 23:59. You entered 26:00.", required: true })}
${field("Leaves the dock", '<input class="inp err nowrap" value="14/03/2026 08:00" aria-invalid="true">', { error: "Leaving the dock must be after loading starts. You entered 08:00, and loading starts at 08:00.", required: true })}
<div class="field"><label>Runs past midnight</label><label class="check" style="margin-top:2px"><input type="checkbox" checked=""><span>Ends the next day<span class="cd">A shift that runs past midnight says so here.</span></span></label></div>
</div>`)}`, 520), "Orders"),
          rationale: "The same field refused, with GOV.UK's error wording: name the field and say what to do. It says what was entered and what is wrong, so the user does not have to remember what they typed.",
          tradeoff: "The message repeats the value, which makes it longer than the field. A message that fits above the input and not inside it.",
        },
        {
          name: "Preset chips for the usual dispatch times",
          reference: "Calendly",
          html: ffshell("New delivery", ffpage(`${trail("Home", "Orders", "New delivery")}
${phead("New delivery", "Start with a name. All times are Europe/Amsterdam.")}
${section("When it runs", `<div class="form">
${field("Loading starts", `${segmented(["Fri 08:00", "Sat 08:00", "Custom"], 1)}<div style="margin-top:8px"><input class="inp" style="width:170px" value="14/03/2026 08:00"></div>`, { help: `Fri 13 and Sat 14 March, the two mornings ${COMPANY.name} dispatches most often. Custom takes any date and time.`, required: true })}
${field("Leaves the dock", input("14/03/2026 12:00"), { help: "Must be after loading starts.", required: true })}
${formActions('<button class="btn">Cancel</button>', '<button class="btn primary">Create delivery</button>')}
</div>`)}`, 560), "Orders"),
          rationale: "Calendly puts the usual lengths above a custom field because most meetings are thirty minutes; dispatch times cluster the same way around 08:00. Two presets plus Custom covers the week without typing.",
          tradeoff: "The presets are company data that goes stale when the season changes, and a preset that names a date has to be regenerated every week. A stale chip offers last month mornings.",
        },
        {
          name: "Start and end as one range with a length readout",
          reference: "Airbnb",
          html: ffshell("New delivery", ffpage(`${trail("Home", "Orders", "New delivery")}
${phead("New delivery", "Start with a name. All times are Europe/Amsterdam.")}
${section("When it runs", `<div class="form">
${field("Shift start to end", `<span class="inline" style="gap:6px;flex-wrap:nowrap"><input class="inp" style="width:150px" value="14/03/2026 22:00" aria-label="Shift start"><span class="muted">to</span><input class="inp" style="width:150px" value="15/03/2026 06:00" aria-label="Shift end"></span>`, { help: "8 hours, overnight. Both dates are required.", required: true })}
${split("Length of the shift", "8 hours", "Past midnight, so the end is dated 15 March")}
${formActions('<button class="btn">Cancel</button>', '<button class="btn primary">Create delivery</button>')}
</div>`)}`, 560), "Orders"),
          rationale: "Airbnb and Linear ask for a range as one control with the length read back, because a start without an end is not a value the page can use. The readout catches the overnight mistake before the submit does.",
          tradeoff: "Two values in one field need one error message that names both, and a screen reader meets a composite where it expected a field. The labels have to be wired with care.",
        },
      ],
    },
    {
      id: "field-text",
      title: "A text field and its states",
      verdict: "The six-state reference page stays the pick, because it is the only option that pins every state one field must draw. Inline validation that confirms a good value is the runner-up for create forms, where it saves a refused submit. Never ship the placeholder as the label: it vanishes on first keystroke, and its colour misses contrast.",
      why: `Every text field has to draw seven states, and GOV.UK is blunt about two of them: <b>the label is always visible and above the input</b>, and a placeholder is never the label because it vanishes on first keystroke.`,
      variants: [
        {
          name: "Label above, help under, six states on one page",
          pick: true,
          html: ffshell("Field states", ffpage(`${phead("Field states", "Every state one text field has to draw.")}
${section("The states", `<div class="form" style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
${field("Empty", input(""), { required: true })}
${field("Filled", input(DELIVERY.name), { required: true })}
${field("With help", input(DELIVERY.name), { help: "Customers see this on the storefront and on their invoice.", required: true })}
${field("Optional", input(""), { optional: true })}
${field("Refused", '<input class="inp err" value="Spring restock" aria-invalid="true">', { error: "A delivery is already scheduled as Spring restock. Change the name or cancel that one first.", required: true })}
${field("Disabled", input(DELIVERY.name, { disabled: true }), { help: "The name is fixed once the delivery is scheduled." })}
${field("Read only", input("SO-1042-01", { readonly: true }), { help: "Issued by the system when the line was made." })}
${field("Too long", '<input class="inp err" value="Garcia Interiors restock: spring pallets, morning slot, final">', { error: "Keep the name under 60 characters. This one is 61.", required: true })}
</div>`)}`, 520), "Settings"),
          rationale: "The component reference page for the field: default, filled, focused, error, disabled and readonly. Showing them together is how a reviewer checks one control rather than six screenshots.",
          tradeoff: "Six instances of one field is a style guide, not a screen. It never appears in the product; it exists so the states cannot drift apart.",
        },
        {
          name: "Label above, placeholder as a hint",
          reference: "GOV.UK",
          html: ffshell("New price tier", ffpage(`${trail("Home", "Products", PRODUCT.name, "New price tier")}
${phead("Add a price tier", "")}
${section("The tier", `<div class="form">
${field("Name", input("", { placeholder: "Trade" }), { help: "Customers see this on the storefront and on their invoice.", required: true })}
${field("What it includes", '<textarea class="ta" placeholder="Discounted unit price for trade accounts."></textarea>', { optional: true })}
${field("Internal note", '<textarea class="ta" placeholder="Only Acme Supply sees this."></textarea>', { help: "Not shown to customers or to the warehouse.", optional: true })}
</div>`)}`, 520), "Products"),
          rationale: "The label names the field and the placeholder shows an example. Both present, which is GOV.UK's actual recommendation once a hint is genuinely needed.",
          tradeoff: "Two sets of words per field, so a form with five fields carries ten lines before the first value. The hint has to earn its place every time.",
        },
        {
          name: "Placeholder as the label",
          reference: "GOV.UK",
          html: ffshell("Orders", ffpage(`${trail("Home", "Orders")}
${phead("Orders", "Every paid order, newest first.")}
<div class="toolbar"><span class="search"><span class="ico">⌕</span><input value="" placeholder="Order number, name or email"></span></div>
${section("", `<table class="dt"><thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col">Placed</th><th scope="col" class="num">Paid</th></tr></thead><tbody><tr><td><span class="code">SO-1042</span></td><td>Maria Garcia</td><td class="nowrap">8 Oct 09:32</td><td class="num">EUR 125.00</td></tr><tr><td><span class="code">SO-1041</span></td><td>Tom Becker</td><td class="nowrap">8 Oct 09:20</td><td class="num">EUR 310.00</td></tr><tr><td><span class="code">SO-1040</span></td><td>Elin Lindqvist</td><td class="nowrap">8 Oct 08:55</td><td class="num">EUR 64.50</td></tr></tbody></table>`, { flush: true })}`, 640), "Orders"),
          rationale: "The search field with no label: the only description of what the search covers is a placeholder reading 'Order number, name or email'.",
          tradeoff: "Fails GOV.UK's guidance on three counts at once: it vanishes on first keystroke, not every screen reader reads it, and its default colour often misses 1.4.3 contrast.",
        },
        {
          name: "Character count under a long-answer field",
          reference: "GOV.UK",
          html: ffshell("Return policy", ffpage(`${trail("Home", "Settings", "Policies")}
${phead("Return policy", "Customers read this at checkout, before they pay.", '<button class="btn primary">Save</button>')}
${section("The policy", `<div class="form">
${field("Policy", '<textarea class="ta" style="min-height:150px">Goods can be returned within 30 days of delivery if they are unused and in their packaging. After that, store credit against a future order instead.</textarea>', { required: true })}
<div class="split" style="font-size:11.5px;color:var(--muted-foreground)"><span>148 characters of 1,500</span><span class="fig"></span></div>
${callout("info", "This is the company policy. The system records it and shows it at checkout; it does not supply one.")}
</div>`)}`, 600), "Settings"),
          rationale: "Where a field has a hard limit, the remaining count sits under it. GOV.UK says count characters only where its own research shows it nets positive.",
          tradeoff: "GOV.UK's validation guidance permits live counting only as its own exception, precisely because it validates before the field is finished. On a policy text it is worth it; on a name it is not.",
        },
        {
          name: "A textarea with the customer's words preserved",
          html: ffshell("Return policy", ffpage(`${trail("Home", "Settings", "Policies")}
${phead("Return policy", "Customers read this at checkout, before they pay.", '<button class="btn primary">Save</button>')}
${section("Preview at checkout", `<div class="stack sm"><div style="border:1px solid var(--border);border-radius:var(--radius);padding:13px;font-size:12.5px;white-space:pre-wrap;line-height:1.6">Goods can be returned within 30 days of delivery if they are unused and in their packaging.

After that, store credit against a future order instead.

Ask us within 30 days of the delivery.</div><span class="muted" style="font-size:11.5px">This is how it appears to a customer, with the line breaks kept.</span></div>`)}`, 600), "Settings"),
          rationale: "Long answers are shown with the typist's own line breaks. A policy pasted from a document keeps its paragraphs instead of reflowing into one block.",
          tradeoff: "Uncontrolled line breaks in stored text are a rendering hazard on a customer page, where the width differs from the editor's. It has to be normalised somewhere.",
        },
        {
          name: "A field that grows as the answer does",
          html: ffshell("Incident", ffpage(`${trail("Home", "Orders", DELIVERY.name, "Incidents", "New")}
${phead("Record an incident", "What happened at the dock, in your words.")}
${section("The incident", `<div class="form">
${field("What happened", '<textarea class="ta" style="min-height:130px" placeholder="At 08:41 a driver presented a delivery note for the wrong order. Chris refused it and called support."></textarea>', { help: "Who, when, and what was decided. The warehouse lead reads this in June.", required: true })}
${field("Where it happened", select("Main dock", ["Main dock", "Side dock", "Pickup counter"]), { required: true })}
${field("Who decided", input(""), { help: "A person. The warehouse lead reads this in June.", optional: true })}
<div class="btnrow end" style="border-top:1px solid var(--border);padding-top:12px"><button class="btn">Cancel</button><button class="btn primary">Record it</button></div>
</div>`)}`, 560), "Orders"),
          rationale: "The textarea expands with its content up to a limit, so an incident report is not a 74-pixel window with a scrollbar inside it.",
          tradeoff: "A growing field pushes everything below it down as the reader types, which moves the button they are about to press. Most implementations stop growing at about six lines.",
        },
        {
          name: "Inline confirmation of a good value",
          reference: "Stripe",
          html: ffshell("New price tier", ffpage(`${trail("Home", "Products", PRODUCT.name, "New price tier")}
${phead("Add a price tier", "Checked as you type, so a good value is confirmed before the submit.")}
${section("The tier", `<div class="form">
${field("Name", '<input class="inp ok ff-focus" value="Standard">', { help: `✓ Standard is free on ${PRODUCT.name}.`, required: true })}
${field("What it includes", '<textarea class="ta" placeholder="Discounted unit price for trade accounts."></textarea>', { optional: true })}
${formActions('<button class="btn">Cancel</button>', '<button class="btn primary">Add the tier</button>')}
</div>`)}`, 520), "Products"),
          rationale: "Stripe Checkout and Vercel confirm a valid value where it was typed, with a tick and a quiet line, instead of waiting for the submit. Confirming Standard early saves the user a round trip for the name they wanted.",
          tradeoff: "GOV.UK permits live validation only as a narrow exception, because it judges a field before it is finished. The check must wait for a pause in typing, or it nags.",
        },
        {
          name: "Floating labels that shrink when filled",
          reference: "Material Design",
          html: ffshell("New price tier", ffpage(`${trail("Home", "Products", PRODUCT.name, "New price tier")}
${phead("Add a price tier", "Two fields drawn the Material way, for comparison.")}
${section("The tier", `<div class="form">
<div class="field"><div class="ff-float"><input class="inp" value=""><label>Name</label></div><span class="help">Empty: the label sits where the value will go.</span></div>
<div class="field"><div class="ff-float filled"><input class="inp" value="Standard"><label>Name</label></div><span class="help">Filled: the label shrinks above the value and stays visible.</span></div>
${formActions('<button class="btn">Cancel</button>', '<button class="btn primary">Add the tier</button>')}
</div>`)}`, 520), "Products"),
          rationale: "Material Design answers the placeholder problem by floating the label above the value once the field fills, so the label never vanishes. It keeps the compact look the placeholder promised without breaking it.",
          tradeoff: "The empty state still reads as a placeholder, with its small text and low contrast, and a floated label at 10.5 px is smaller than any label the back office otherwise draws. GOV.UK keeps the label above and full size for that reason.",
        },
      ],
    },
    {
      id: "field-choice",
      title: "Choosing one of a few options",
      verdict: "The radio list with a description per option stays the pick: each choice carries the sentence that lets a person choose between names that sound alike. The segmented control is the runner-up for two or three short values with no descriptions. Never ship the native multi-select: GOV.UK rules it out for its usability and assistive record, and a checkbox list replaces it.",
      why: `A closed set. GOV.UK's rules are that a select is a last resort, that radios beat it, and that <b>nothing is pre-selected in a question</b> though it is allowed in settings. The naming field below is a radio list with three well-worded options.`,
      variants: [
        {
          name: "A radio list with a description per option",
          pick: true,
          html: ffshell("Delivery note naming", ffpage(`${trail("Home", "Orders", "Delivery notes")}
${phead("Delivery note naming", "For a named delivery the customer is asked for each recipient name, and the driver shows the name at the dock.", '<button class="btn primary">Save</button>')}
${section("Naming rule", `<div class="radio-list"><label><input type="radio" name="n" checked=""><span><b>No name</b><span class="cd">A parcel is handed to whoever signs for it.</span></span></label><label><input type="radio" name="n"><span><b>The customer name</b><span class="cd">The customer name is on the note.</span></span></label><label><input type="radio" name="n"><span><b>Every recipient named</b><span class="cd">The customer names each recipient before dispatch.</span></span></label></div>`)}`, 560), "Orders"),
          rationale: "Each option carries a sentence saying what it means for the customer, which is the only way a person can choose between 'The customer name' and 'Every recipient named'.",
          tradeoff: "Three options at 22 pixels each is a tall block, and it does not scale to twelve options, which a permission picker does need.",
        },
        {
          name: "A segmented control for two or three",
          html: ffshell("New product", ffpage(`${trail("Home", "Products", "New product")}
${phead("New product", "Start with a name, or start from a template.")}
${section("Start from", `<div class="stack sm">${segmented(["A blank product", "A template"], 0)}<div class="form">
${field("Name", input(""), { required: true })}
${field("Warehouse", select("Choose a warehouse", ["Choose a warehouse", PRODUCT.warehouse]), { required: true })}
</div></div>`, { desc: "A template carries a name and a warehouse. The new product copies the template's current revision." })}`, 520), "Products"),
          rationale: "Where the choice is between two or three values that are all visible at once, a segmented control shows every option rather than hiding them behind a menu.",
          tradeoff: "Labels have to fit, so 'A blank product' and 'A template' both had to be shortened. The control grows with its longest label.",
        },
        {
          name: "Plan cards for a priced choice",
          html: ffshell("Plan", ffpage(`${trail("Home", "Settings", "Plan")}
${phead("What the plan costs", `The company is on ${COMPANY.plan}. Changing plan takes effect from the next month.`)}
${section("The plans", `<div class="plans"><button class="plan" aria-pressed="false"><span class="nm">Starter</span><span class="pc">EUR 0<small> a month</small></span><span class="ds">Up to 100 orders a month. No storefront of your own.</span></button><button class="plan" aria-pressed="true"><span class="tagline">Your plan</span><span class="nm">Business</span><span class="pc">EUR 49<small> a month</small></span><span class="ds">Everything, including your own storefront.</span></button><button class="plan" aria-pressed="false"><span class="nm">Enterprise</span><span class="pc">EUR 249<small> a month</small></span><span class="ds">Ten warehouses at once and four locations each.</span></button></div><div class="btnrow end" style="margin-top:14px"><button class="btn">Cancel</button><button class="btn primary">Change to this plan</button></div>`)}`, 620), "Settings"),
          rationale: "For a choice between priced options, each card names the option, its price and its period, and the one the company holds says so in words rather than only by a ring.",
          tradeoff: "Cards are boxes, and the layout contract says a Section is the only box and never nests. Three plan cards inside a section break that rule three times.",
        },
        {
          name: "Cards with a radio inside each",
          html: ffshell("Plan", ffpage(`${trail("Home", "Settings", "Plan")}
${phead("What the plan costs", `The company is on ${COMPANY.plan}.`)}
${section("The plans", `<div role="radiogroup" aria-label="Plan" class="plans"><label class="plan" style="cursor:pointer;"><span class="inline" style="justify-content:space-between"><span class="nm">Starter</span><input type="radio" name="plan" style="width:15px;height:15px;accent-color:var(--foreground)"></span><span class="pc">EUR 0<small> a month</small></span><span class="ds">Up to 100 orders a month.</span></label><label class="plan" style="cursor:pointer;border-color:var(--foreground);box-shadow:0 0 0 1px var(--foreground)"><span class="inline" style="justify-content:space-between"><span class="nm">Business</span><input type="radio" name="plan" checked="" style="width:15px;height:15px;accent-color:var(--foreground)"></span><span class="pc">EUR 49<small> a month</small></span><span class="ds">Everything, including your own storefront.</span></label><label class="plan" style="cursor:pointer;"><span class="inline" style="justify-content:space-between"><span class="nm">Enterprise</span><input type="radio" name="plan" style="width:15px;height:15px;accent-color:var(--foreground)"></span><span class="pc">EUR 249<small> a month</small></span><span class="ds">Ten warehouses at once and four locations each.</span></label></div><div class="btnrow end" style="margin-top:14px"><button class="btn">Cancel</button><button class="btn primary">Change plan</button></div>`)}`, 620), "Settings"),
          rationale: "The plan cards, with the choice made by a real radio so the tab order and the arrow keys work as a form control rather than as a set of buttons.",
          tradeoff: "Two nested controls in one card. The whole card has to forward the click to the radio, and the radio still has to be reachable by Tab.",
        },
        {
          name: "A select, in a settings page where nothing is pre-selected",
          reference: "GOV.UK",
          html: ffshell("General", ffpage(`${trail("Home", "Settings", "General")}
${phead("General", `What ${COMPANY.name} is and where it works.`, '<button class="btn primary">Save</button>')}
${section("Locale", `<div class="form">
${field("Time zone", '<select class="sel bad"><option selected="">Choose a time zone</option><option>Europe/Amsterdam</option><option>Europe/London</option><option>Europe/Berlin</option></select>', { help: "Every date and time on every page is written in this zone. Changing it later reinterprets nothing.", required: true })}
${field("Default currency", '<select class="sel bad"><option selected="">Choose a currency</option><option>EUR</option></select>', { help: "The currency amounts are entered in. Every price on every product uses it.", required: true })}
</div>`)}`, 520), "Settings"),
          rationale: "GOV.UK allows a pre-selection in settings and nowhere else. Where the value has no default and the options are many, a select with a real empty first option is the least-bad shape.",
          tradeoff: "The empty option is a placeholder, and the layout contract says not to show one. A select whose first choice is a blank that must be replaced is two states, not one.",
        },
        {
          name: "A multi-select as a list of checkboxes",
          reference: "GOV.UK",
          html: ffshell("New role", ffpage(`${trail("Home", "Settings", "Team", "Roles", "New")}
${phead("New role", "What this role may do. Start from one of the defaults and change it.", '<button class="btn primary">Create the role</button>')}
${section("The role", `<div class="form">
${field("Name", input("Warehouse"), { required: true })}
<div class="field"><label>What this role may do</label><span class="help">Four areas and eleven actions. Tick what applies.</span><div class="stack sm" style="border:1px solid var(--border);border-radius:var(--radius-sm);padding:11px;margin-top:4px"><div style="font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:var(--muted-foreground);margin-bottom:6px">Orders</div><label class="check"><input type="checkbox" checked=""><span>Look at any order</span></label><label class="check"><input type="checkbox" checked=""><span>Refund an order</span></label><label class="check"><input type="checkbox"><span>Refund part of an order</span></label><label class="check"><input type="checkbox"><span>Cancel a shipment</span></label><div style="font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:var(--muted-foreground);margin:9px 0 6px">Warehouse</div><label class="check"><input type="checkbox" checked=""><span>Book a pickup</span></label><label class="check"><input type="checkbox"><span>Record a refusal</span></label><label class="check"><input type="checkbox"><span>Open a dock</span></label></div><div class="hint" style="margin-top:7px">7 actions across 2 areas.</div></div>
</div>`)}`, 620), "Settings"),
          rationale: "GOV.UK states it directly: do not use <code>select multiple</code>, because of its history of poor usability and assistive support. Checkboxes in a list, or a dedicated picker where the options are many.",
          tradeoff: "Twenty checkboxes is a wall. Above about eight, the picker needs a search and a summary of what is chosen, which is a component rather than a field.",
        },
        {
          name: "A listbox with a checkmark and descriptions",
          reference: "Apple HIG",
          html: ffshell("Delivery note naming", ffpage(`${trail("Home", "Orders", "Delivery notes")}
${phead("Delivery note naming", "For a named delivery the customer is asked for each recipient name, and the driver shows the name at the dock.")}
${section("Naming rule", `<div class="form">
${field("Who is named on the note", `<button class="btn w-full" style="justify-content:space-between" aria-haspopup="listbox" aria-expanded="true">No name<span class="muted">▾</span></button><div class="pop" role="listbox" aria-label="Naming rule" style="position:relative;box-shadow:0 8px 22px var(--scroll-shade);margin-top:4px"><div class="item" role="option" aria-checked="true" style="align-items:flex-start"><span><b>No name</b><br><span class="muted" style="font-size:11.5px">A parcel is handed to whoever signs for it.</span></span></div><div class="item" role="option" aria-checked="false" style="align-items:flex-start"><span><b>The customer name</b><br><span class="muted" style="font-size:11.5px">The customer name is on the note.</span></span></div><div class="item" role="option" aria-checked="false" style="align-items:flex-start"><span><b>Every recipient named</b><br><span class="muted" style="font-size:11.5px">The customer names each recipient before dispatch.</span></span></div></div>`, { help: "Applies to deliveries not yet dispatched. The 9,412 shipped keep their rule.", required: true })}
${formActions('<button class="btn primary">Save</button>')}
</div>`)}`, 560), "Orders"),
          rationale: "Apple HIG and Radix UI draw a choice with descriptions as a listbox: one button showing the current value, a checkmark on it in the list, and full keyboard support. It carries the same sentences as the radio list in the height of one field.",
          tradeoff: "The options hide behind a button, so a reader compares them only by opening the list. A radio list shows all three at once; this one shows one and promises two more.",
        },
        {
          name: "A binary question as two plain buttons",
          reference: "Typeform",
          html: ffshell("Checkout", ffpage(`${trail("Home", "Settings", "Checkout")}
${phead("Checkout", "What customers meet before they pay.")}
${section("Customer accounts", `<div class="form">
<div class="field"><span class="lab">Do customers need an account to buy?</span><div class="plans" style="grid-template-columns:1fr 1fr"><button class="plan" aria-pressed="true"><span class="nm">No, sign-in stays optional</span><span class="ds">They can still sign in afterwards to reach their orders.</span></button><button class="plan" aria-pressed="false"><span class="nm">Yes, account required</span><span class="ds">Every customer signs in before paying. Fewer orders complete.</span></button></div><span class="help">Buying without an account is the default. Accounts stay for the customer area.</span></div>
${formActions('<button class="btn primary">Save</button>')}
</div>`)}`, 560), "Settings"),
          rationale: "Typeform asks a yes-or-no question as two large buttons with the consequence under each, because a binary choice deserves no menu and no dropdown. Both answers stay visible with their cost attached.",
          tradeoff: "Two cards for one bit is the heaviest binary control on this page, and it answers only questions with two honest answers. A third option or a conditional follow-up breaks the shape.",
        },
      ],
    },
    {
      id: "field-switch",
      title: "A switch or a checkbox",
      verdict: "The switch with its consequence stated stays the pick: the label says what is on and the line under it says what turning it off does. The instant-apply switch with an undo toast is the runner-up for low-risk settings a user flips often. Never ship a switch whose label names the control instead of the outcome; a reader must not open documentation to learn what on means.",
      why: `The storefront editor holds a toggle for the platform credit line. A back office holds many settings where a switch fits, so this item is about <b>which control the setting deserves</b> and what the label has to say.`,
      variants: [
        {
          name: "A switch with the label and its consequence",
          pick: true,
          html: ffshell("Storefront", ffpage(`${trail("Home", "Products", "Storefront")}
${phead("Storefront", "What customers see when they buy from the company.")}
${section("Checkout", `<div class="stack lg"><div class="switch-row"><span class="switch" aria-checked="true" role="switch" tabindex="0" aria-label="Show the Powered by line"></span><span class="txt"><b>Show the "Powered by" line</b><small>The line under the storefront that credits the platform. Turning it off removes it from the customer checkout and their invoice.</small></span></div><div class="switch-row"><span class="switch" aria-checked="false" role="switch" tabindex="0" aria-label="Let customers buy without an account"></span><span class="txt"><b>Let customers buy without an account</b><small>They can still sign in afterwards to reach their own orders.</small></span></div><div class="switch-row"><span class="switch" aria-checked="true" role="switch" tabindex="0" aria-label="Take a delivery fee from the customer"></span><span class="txt"><b>Take a delivery fee <span class="muted">EUR 5.00 per order</span></b><small>The company keeps this one. The payment provider takes it from the customer, not from the goods money.</small></span></div></div>`)}`, 520), "Products"),
          rationale: "The label says what is on and the line under it says what turning it off does, so the choice is reversible and stated.",
          tradeoff: "A switch has no pressed state on first paint, so a reader cannot tell what is currently on without looking twice. And it carries no visible text.",
        },
        {
          name: "A checkbox where the off state is the default",
          reference: "GOV.UK",
          html: ffshell("Email", ffpage(`${trail("Home", "Settings", "Email")}
${phead("Email", `What ${COMPANY.name} sends, and what it promises.`, '<button class="btn primary">Save</button>')}
${section("Messages", `<div class="stack"><label class="check"><input type="checkbox" checked=""><span>Email a customer when their goods are dispatched<span class="cd">Carries the tracking number. This is the message a customer looks for.</span></span></label><label class="check"><input type="checkbox"><span>Email a customer the day before the delivery<span class="cd">Sent at 18:00 in the delivery time zone, with the time window and what to have ready.</span></span></label><label class="check"><input type="checkbox"><span>Email me when a refund is refused by the bank<span class="cd">To ${PEOPLE.finance.name}. Not to the customer.</span></span></label><label class="check"><input type="checkbox" checked=""><span>Put the company name on every message<span class="cd">${COMPANY.name}, with its address and telephone number, as the law requires.</span></span></label></div>`)}`, 520), "Settings"),
          rationale: "A checkbox rather than a switch, because the default is off and the action is to tick something. GOV.UK's wording is to phrase it as what ticking does, not as what the box is.",
          tradeoff: "A checkbox and a switch look nearly identical here, and readers conflate them. The difference has to be carried by the label's phrasing.",
        },
        {
          name: "A checkbox with the consequence under it, no state carried",
          html: ffshell("Payments", ffpage(`${trail("Home", "Settings", "Payments")}
${phead("Payments", "How money reaches the company bank account.", '<button class="btn primary">Save</button>')}
${section("The connected account", `<div class="stack">
${split("The payment provider", "NL91 ABNA 0417 1643", "Pays into the company account")}
<hr class="hr">
<label class="check"><input type="checkbox" checked=""><span>Settle twice a month<span class="cd">On the 4th and the 19th, with the money from three days before.</span></span></label>
<label class="check"><input type="checkbox"><span>Settle once a month<span class="cd">On the 4th, with everything from the previous month. One transfer instead of two.</span></span></label>
<label class="check"><input type="checkbox" checked=""><span>Email ${PEOPLE.finance.name} when a settlement lands<span class="cd">With the statement attached.</span></span></label>
</div>`)}`, 560), "Settings"),
          rationale: "Every setting as a checkbox with a consequence line. One control for the whole page, so nothing about the shape depends on whether the value happens to be on.",
          tradeoff: "A reviewer cannot see at a glance which are on without reading the boxes. On a settings page with eight such settings that matters.",
        },
        {
          name: "Two options where the difference is the money",
          html: ffshell("Settlement", ffpage(`${trail("Home", "Invoices", "Settlement")}
${phead("How often the money arrives", "The payment provider pays into NL91 ABNA 0417 1643.")}
${section("Frequency", `<div class="plans" style="grid-template-columns:1fr 1fr"><label class="plan" style="cursor:pointer;border-color:var(--foreground);box-shadow:0 0 0 1px var(--foreground)"><span class="inline" style="justify-content:space-between"><span class="nm">Twice a month</span><input type="radio" name="f" checked="" style="width:15px;height:15px;accent-color:var(--foreground)"></span><span class="pc">EUR 28,510<small> on average</small></span><span class="ds">On the 4th and the 19th, three days behind. More in the account sooner.</span></label><label class="plan" style="cursor:pointer"><span class="inline" style="justify-content:space-between"><span class="nm">Once a month</span><input type="radio" name="f" style="width:15px;height:15px;accent-color:var(--foreground)"></span><span class="pc">EUR 57,020<small> on average</small></span><span class="ds">On the 4th, everything from the previous month. One transfer a month.</span></label></div><div class="btnrow end" style="margin-top:14px"><button class="btn">Cancel</button><button class="btn primary">Change to monthly</button></div>`)}`, 600), "Invoices"),
          rationale: "Settlement frequency is a choice between two money outcomes, so it gets radio cards with the amount and the date on each, not a switch that hides the difference.",
          tradeoff: "Cards for a two-way choice is heavy, and the amounts are derived figures that have to be computed per company to stay honest.",
        },
        {
          name: "A switch that is refused, with the reason",
          html: ffshell("Payments", ffpage(`${trail("Home", "Settings", "Payments")}
${phead("Payments", "How money reaches the company bank account.")}
${section("The connected account", `<div class="switch-row"><span class="switch" aria-checked="false" aria-disabled="true" style="opacity:.45;cursor:not-allowed"></span><span class="txt"><b>Switch to a different bank account</b><small>The <b>owner</b> role can do this. Your role is <b>finance</b>, which can read the account but not change where the money goes.</small></span></div>`)}
${section("Where it pays", `${split("The payment provider", "NL91 ABNA 0417 1643", "Account ending 1643")}`)}`, 560), "Settings"),
          rationale: "A setting the role cannot change, switched off and refused, with the reason in visible text. This is the explained-action pattern applied to a control rather than a button.",
          tradeoff: "A disabled switch with no value is a dead pixel to a reader who does not notice the reason. The reason has to sit directly under it, not at the foot of the section.",
        },
        {
          name: "A switch with the number it would change",
          html: ffshell("Delivery fee", ffpage(`${trail("Home", "Settings", "Checkout")}
${phead("Delivery fee", "What the customer pays on top of the goods. The company keeps all of it.")}
${section("The fee", `<div class="stack lg">
${field("Per order, in euros", ffMoneyPrefix("5.00"), { required: true })}
<div class="hr"></div>
<div class="switch-row"><span class="switch" aria-checked="false" role="switch" tabindex="0" aria-label="Waive the delivery fee for trade accounts"></span><span class="txt"><b>Waive the fee for trade accounts</b><small>Trade accounts only. Last month that would have been <b>EUR 310.00</b> across 62 orders.</small></span></div>
<div class="switch-row"><span class="switch" aria-checked="true" role="switch" tabindex="0" aria-label="Include the fee in the advertised price"></span><span class="txt"><b>Show the fee as part of the price</b><small>Advertise EUR 50.00 instead of EUR 45.00. Customers see one number and no add-on line.</small></span></div>
</div>`)}`, 560), "Settings"),
          rationale: "Where flipping the setting changes an amount, the amount is on the same line. The user reads the consequence before flipping rather than after.",
          tradeoff: "A derived figure beside a control has to be current, which means a read that the switch itself depends on. It also puts a number on a page that was otherwise free of them.",
        },
        {
          name: "Instant apply with an undo toast",
          reference: "Linear",
          html: ffshell("Storefront", ffpage(`${trail("Home", "Products", "Storefront")}
${phead("Storefront", "What customers see when they buy from the company. Changes apply at once.")}
${section("Checkout", `<div class="stack lg">
<div class="switch-row"><span class="switch" role="switch" tabindex="0" aria-checked="false" aria-label="Waive the delivery fee for trade accounts"></span><span class="txt"><b>Waive the fee for trade accounts</b><small>Trade accounts only. Last month that would have been EUR 310.00 across 62 orders.</small></span></div>
<div class="switch-row"><span class="switch" role="switch" tabindex="0" aria-checked="true" aria-label="Let customers buy without an account"></span><span class="txt"><b>Let customers buy without an account</b><small>They can still sign in afterwards to reach their own orders.</small></span></div>
<div class="switch-row"><span class="switch" role="switch" tabindex="0" aria-checked="true" aria-label="Show the Powered by line"></span><span class="txt"><b>Show the "Powered by" line</b><small>The line under the storefront that credits the platform.</small></span></div>
</div>`)}
<div style="position:absolute;right:16px;bottom:16px">${toast("positive", "Delivery fee waived for trade accounts.", { undo: true })}</div>`, 520), "Products"),
          rationale: "Linear and Google Material apply a low-risk switch at once and offer Undo in a toast, so there is no Save to forget and no dialog to dismiss. The toast names what changed, which a silent apply never does.",
          tradeoff: "Every flip is an audited command the moment it happens, with no review step before it. It fits display settings; it does not fit money, access, or anything a toast cannot undo.",
        },
        {
          name: "A three-way choice as a segmented control",
          reference: "Slack",
          html: ffshell("Email", ffpage(`${trail("Home", "Settings", "Email")}
${phead("Email", `What ${COMPANY.name} sends, and what it promises.`)}
${section("Refund mail", `<div class="form">
${field("Email the customer when a refund is issued", segmented(["Every refund", "Only bank refusals", "Never"], 0), { help: "To the customer. Finance always gets a copy.", required: true })}
${field("Copy to", input(PEOPLE.finance.name), { help: "A person on the team. Not the customer.", required: true })}
${formActions('<button class="btn primary">Save</button>')}
</div>`)}`, 520), "Settings"),
          rationale: "Slack draws a three-way notification choice as a segmented control, because the values are short, ordered, and all worth seeing at once. No menu hides the middle option the user actually wants.",
          tradeoff: "Three labels have to fit the control, so the wording shortens until it almost stops meaning anything. A fourth option or a per-option description breaks the shape back into radios.",
        },
      ],
    },
    {
      id: "field-upload",
      title: "An upload field",
      verdict: "The drop zone that states its types and size limit stays the pick: nobody should discover the limit by being refused. The per-file progress tray is the runner-up for imports of several files, where one bar per file beats one bar for all. Never ship a CSV upload with no stated columns: a file refused for a format nobody told it is a refusal the application caused.",
      why: `The storefront editor holds a <b>Logo</b> and a <b>Banner image</b> drop zone with the file type and size in words under it. The data-imports area needs a CSV upload, which is a different shape: <b>wrong file, wrong columns and wrong rows</b> are all refusals.`,
      variants: [
        {
          name: "A drop zone that states what it accepts",
          pick: true,
          html: ffshell("Storefront", ffpage(`${trail("Home", "Products", "Storefront")}
${phead("Storefront", "The logo and banner customers see.")}
${section("Brand", `<div class="stack lg"><div class="stack sm">
${dropZone("Drop a logo here or choose a file", "A square image of at most 2 MB. JPEG, PNG or WebP.")}
${field("Logo description", input(""), { help: "What the logo shows, for somebody who cannot see it.", optional: true })}
</div><div class="stack sm">
${dropZone("Drop a banner here or choose a file", "A wide image across the top. 1600 by 700 pixels reads best.")}
${field("Banner description", input(""), { help: "What the banner shows, for somebody who cannot see it.", optional: true })}
</div></div>`)}`, 560), "Products"),
          rationale: "The accepted types and the size limit in a sentence under the zone, so nobody discovers the limit by being refused.",
          tradeoff: "A drop zone invites a click anywhere, and a user who drops a file on the page outside the zone gets nothing at all. No affordance says where the zone is.",
        },
        {
          name: "The file already chosen, with what it will do",
          html: ffshell("Storefront", ffpage(`${trail("Home", "Products", "Storefront")}
${phead("Storefront", "The logo and banner customers see.", '<button class="btn primary">Save</button>')}
${section("Brand", `<div class="stack lg"><div class="stack sm"><div class="filerow"><span class="thumb">▤</span><span style="min-width:0"><b style="display:block">acme-supply-logo.png</b><span class="muted" style="font-size:11.5px">512 by 512 · 84 KB · chosen now</span></span><button class="btn xs" style="margin-left:auto">Replace</button><button class="btn xs ghost" aria-label="Remove the logo">✕</button></div>
${field("Logo description", input("A green square with a white lamp"), { optional: true })}
</div>${callout("info", "Saving replaces the logo customers see now. It reaches the customer screen within a minute.")}</div>`)}`, 560), "Products"),
          rationale: "After the choice, the row carries the file, its size and the consequence of saving: the old logo is replaced, and customers see the new one within a minute.",
          tradeoff: "A file that has been uploaded but not saved is a resource that exists and is not referenced. It needs a cleanup, or the storage fills with orphans.",
        },
        {
          name: "A CSV upload that states its columns first",
          html: ffshell("Data import", ffpage(`${trail("Home", "Settings", "Data imports")}
${phead("Import customers", "Bring in a list already held. Nothing is sent anywhere until the result is checked.")}
${section("The file", `<div class="stack"><div class="stack sm"><div style="font-size:12.5px;font-weight:500">The file needs four columns</div><div class="hint">email, first_name, last_name, company. The header row names them. Order does not matter. Extra columns are ignored.</div><div style="font-size:12px"><a href="#" style="text-decoration:underline">Download a template</a></div>${dropZone("Drop a CSV here or choose a file", "Up to 5 MB, 2,000 rows. UTF-8, comma separated.")}</div><div class="btnrow end"><button class="btn">Cancel</button><button class="btn primary">Check the file</button></div></div>`)}`, 620), "Settings"),
          rationale: "For an import, the field states what it needs before anything is uploaded: the four column names, and a link to a template. The upload cannot be wrong about a format nobody told it.",
          tradeoff: "Stating four columns above the zone is a paragraph of prose, and the layout contract keeps prose out of components. It belongs on the page beside the field, not inside it.",
        },
        {
          name: "The upload refused, naming the row that failed",
          html: ffshell("Data import", ffpage(`${trail("Home", "Settings", "Data imports")}
${phead("Import customers", "")}
${section("The file", `<div class="stack">
${alert("destructive", "1,988 of 2,000 rows can be imported.", "Row 412 has no email address, and row 887 names a price tier this product does not sell. Nothing has been imported.")}
<table class="dt dense"><thead><tr><th scope="col">Row</th><th scope="col">What is wrong</th><th scope="col">What was in the file</th></tr></thead><tbody><tr><td class="tnum">412</td><td>No email address</td><td><span class="muted">"ada.k", "Ada", "Kowalski"</span></td></tr><tr><td class="tnum">887</td><td>No such price tier</td><td><span class="muted">"bob@x.nl", "Bob", "Founder rate"</span></td></tr></tbody></table>
<div class="btnrow end"><button class="btn">Choose a different file</button><button class="btn primary">Import the 1,988 good rows</button></div>
</div>`)}`, 620), "Settings"),
          rationale: "The file is refused for a reason the user can act on: row 412 has no email. A refusal that names a row is worth more than one that says 'invalid file'.",
          tradeoff: "Naming one row out of 2,000 needs the whole file read before answering, so the upload is not instant and the user waits without knowing why.",
        },
        {
          name: "An image field with the dimensions stated",
          html: ffshell("Storefront", ffpage(`${trail("Home", "Products", "Storefront")}
${phead("Storefront", "")}
${section("Banner", `<div class="stack sm">
${dropZone("Drop a banner here or choose a file", "1600 by 700 pixels. At most 2 MB. JPEG, PNG or WebP.")}
${alert("caution", "That banner is 1200 by 900.", "It will be cropped to 1600 by 700, which cuts off the top 200 pixels. Customers will not see that part.", '<button class="btn sm">Choose another</button>')}
<label class="check"><input type="checkbox"><span>Crop it anyway<span class="cd">The top 200 pixels are cut. The company name is usually there.</span></span></label>
</div>`)}`, 560), "Products"),
          rationale: "For a picture that must be a particular shape, the dimensions are part of the requirement, not a nicety. The field says '1600 by 700 pixels reads best' and refuses a wrong shape.",
          tradeoff: "The layout contract says the layout decides a stored image's box, not the image's own dimensions. A field that demands a ratio re-decides that per field.",
        },
        {
          name: "An import that reports what it made",
          html: ffshell("Data import", ffpage(`${trail("Home", "Settings", "Data imports", "IMP-4F82C1A9")}
${phead("1,988 customers imported", "Finished 8 Oct 2026, 14:22. Nothing has been charged to anybody.")}
${section("The import", `<div class="stmt"><div class="line"><span>Rows in the file<span class="sub">customers-2026-10.csv</span></span><span class="fig">2,000</span></div><div class="line"><span>Customers created<span class="sub">One record per person, tagged trade</span></span><span class="fig">1,988</span></div><div class="line"><span>Welcome mails queued<span class="sub">2,361 in all</span></span><span class="fig">2,361</span></div><div class="line"><span>Rows refused<span class="sub">Row 412 has no email; row 887 names a tier this product does not sell</span></span><span class="fig">12</span></div><div class="sub-total"><span>Amount charged to anybody</span><span class="fig">EUR 0.00</span></div></div><div class="btnrow end" style="margin-top:14px"><button class="btn">Undo this import</button><button class="btn primary">Open the list</button></div>`)}`, 620), "Settings"),
          rationale: "After an import, the page says what happened: how many rows became what, how many were refused and why. The user can undo it while nothing has been paid out.",
          tradeoff: "A real import is a command whose effect spans many records, which the architecture reserves for a named exception. The report has to be a real read, not a summary of the session.",
        },
        {
          name: "One progress row per file",
          reference: "Dropbox",
          html: ffshell("Data import", ffpage(`${trail("Home", "Settings", "Data imports")}
${phead("Import customers", "Bring in a list already held. Nothing is sent anywhere until the result is checked.")}
${section("Files", `<div class="stack">
<div class="filerow"><span class="thumb">▤</span><span style="min-width:0;flex:1"><b style="display:block">customers-2026-10.csv</b>${progress(62)}<span class="muted" style="font-size:11.5px">1,240 of 2,000 rows read</span></span><button class="btn xs">Cancel</button></div>
<div class="filerow"><span class="thumb">✓</span><span style="min-width:0"><b style="display:block">acme-supply-logo.png</b><span class="muted" style="font-size:11.5px">512 by 512 · 84 KB · ready</span></span><button class="btn xs ghost" style="margin-left:auto" aria-label="Remove the logo">✕</button></div>
${dropZone("Drop another file here or choose one", "CSV up to 5 MB, or an image up to 2 MB.")}
${formActions('<button class="btn">Cancel</button>', '<button class="btn primary">Check the files</button>')}
</div>`)}`, 620), "Settings"),
          rationale: "Dropbox and Google Drive report each file on its own row with its own bar and its own cancel, because two files never finish together. One bar for all would lie about both.",
          tradeoff: "A row per file is a list the page must manage: cancel one, remove one, retry one. For a single logo it is heavier than the one zone it replaces.",
        },
        {
          name: "Drop anywhere on the section",
          reference: "GitHub",
          html: ffshell("Storefront", ffpage(`${trail("Home", "Products", "Storefront")}
${phead("Storefront", "The logo and banner customers see.")}
${section("Logo", `<div class="stack sm">
<button class="drop over"><span class="ico">▤</span><span><b>Drop the logo anywhere in this box</b><small>A square image of at most 2 MB. JPEG, PNG or WebP.</small></span></button>
${field("Logo description", input("A green square with a white lamp"), { help: "What the logo shows, for somebody who cannot see it.", optional: true })}
</div>`, { desc: "Shown while a file is held over the page." })}
${section("Banner", `<div class="stack sm">
${dropZone("Drop a banner here or choose a file", "A wide image across the top. 1600 by 700 pixels reads best.")}
${field("Banner description", input(""), { help: "What the banner shows, for somebody who cannot see it.", optional: true })}
</div>`)}`, 560), "Products"),
          rationale: "GitHub and Notion accept a drop anywhere on the editing surface and highlight the target while the file hovers, so the user never aims at a small box. The over state is the affordance the plain zone lacks.",
          tradeoff: "A page that accepts drops everywhere must also refuse them precisely: a CSV over the logo box needs a refusal, not a silent nothing. Every surface needs its own accepted list.",
        },
      ],
    },
    {
      id: "field-validation",
      title: "Reporting a refused submit",
      verdict: "The GOV.UK summary with focus plus per-field messages stays the pick: it satisfies WCAG 3.3.1 and 3.3.3, and the links carry the reader to each field. Inline validation on blur is the runner-up as a complement, never a replacement: it confirms good values early but cannot orient a reader facing three errors. Never ship the dialog summary: it hides the form the reader must fix.",
      why: `GOV.UK requires an <b>error summary on every validation failure, including a single error</b>, headed 'There is a problem', carrying <code>role="alert"</code>, taking focus, and linking to each errored field. WCAG 3.3.1 and 3.3.3 are the criteria underneath.`,
      variants: [
        {
          name: "A summary above the form, plus a message on each field",
          pick: true,
          reference: "GOV.UK",
          html: ffshell("New delivery", ffpage(`${trail("Home", "Orders", "New delivery")}
<div class="esum" role="alert" tabindex="-1" style="margin-bottom:16px"><h4>There is a problem</h4><ul><li><a href="#name">Enter the name of the delivery</a></li><li><a href="#loading">Loading must start before dispatch</a></li></ul></div>
${phead("New delivery", "")}
${section("The delivery", `<div class="form">
<div class="field" id="name"><label>Name <span class="req" aria-hidden="true">*</span></label><input class="inp err" aria-invalid="true" aria-describedby="name-err"><span class="err" id="name-err">Enter the name of the delivery</span></div>
${field("Where", select(PRODUCT.warehouse, [PRODUCT.warehouse]), { required: true })}
<div class="field" id="loading"><label>Loading starts <span class="req" aria-hidden="true">*</span></label><input class="inp err" value="08:00" aria-invalid="true" aria-describedby="loading-err"><span class="err" id="loading-err">Loading must start before dispatch. It is set to 08:00, and dispatch is 08:00.</span></div>
<div class="btnrow end" style="border-top:1px solid var(--border);padding-top:12px"><button class="btn">Cancel</button><button class="btn primary">Create delivery</button></div>
</div>`)}`, 560), "Orders"),
          rationale: "The GOV.UK pattern in full: the summary first, receiving focus, each entry linking to its field, and the same wording repeated on the field so it reads the same out of context.",
          tradeoff: "The wording now exists in two places per error, so it has to be generated once and used twice. Hand-written copies drift, and the drift is invisible.",
        },
        {
          name: "Messages on the fields only",
          html: ffshell("New delivery", ffpage(`${trail("Home", "Orders", "New delivery")}
${phead("New delivery", "")}
${section("The delivery", `<div class="form">
${field("Name", '<input class="inp err" value="" aria-invalid="true">', { error: "Enter the name of the delivery", required: true })}
${field("Where", select("Choose a warehouse", ["Choose a warehouse", PRODUCT.warehouse]), { error: "Choose where the docks are", required: true })}
${field("Loading starts", '<input class="inp err" value="08:00" aria-invalid="true">', { error: "Loading must start before dispatch.", required: true })}
${field("Leaves the dock", '<input class="inp err" value="12:00" aria-invalid="true">', { error: "Leaving the dock must be after loading starts.", required: true })}
<div class="btnrow end" style="border-top:1px solid var(--border);padding-top:12px"><button class="btn">Cancel</button><button class="btn primary">Create delivery</button></div>
</div>`)}`, 560), "Orders"),
          rationale: "Each field carries its own message and nothing else. The reader sees the error where they have to fix it.",
          tradeoff: "On a long form the first error may be below the fold, so the reader submits, sees nothing change and concludes the button is broken. G139 exists precisely to jump to the errors.",
        },
        {
          name: "A summary in a dialog above the form",
          html: ffshell("New delivery", `<div class="page" style="max-width:560px;position:relative">${trail("Home", "Orders", "New delivery")}
${phead("New delivery", "")}
${section("The delivery", `<div class="form">
${field("Name", '<input class="inp err" value="" aria-invalid="true">', { error: "Enter the name of the delivery", required: true })}
${field("Where", select("Choose a warehouse", ["Choose a warehouse"]), { error: "Choose where the docks are", required: true })}
${field("Loading starts", '<input class="inp err" value="08:00" aria-invalid="true">', { error: "Loading must start before dispatch.", required: true })}
<div class="btnrow end"><button class="btn primary">Create delivery</button></div>
</div>`)}
<div class="scrim"><div class="dialog" role="alertdialog" aria-modal="true"><header><div><h3>There is a problem</h3><p>3 things need fixing before this delivery can be created.</p></div></header><div class="dbody"><div style="font-size:12.5px;line-height:1.9">Enter the name of the delivery<br>Choose where the docks are<br>Loading must start before dispatch</div></div><footer><button class="btn primary">Fix these</button></footer></div></div>
</div>`, "Orders"),
          rationale: "The summary arrives as a dialog over the form, which cannot be scrolled past and cannot be missed, so the reader cannot submit again unaware.",
          tradeoff: "A dialog over a form breaks focus rules: a dialog never opens another layer, and a form is not a dialog. It also hides the form the reader has to fix.",
        },
        {
          name: "A summary as a banner above the page, not the form",
          reference: "GOV.UK",
          html: ffshell("New delivery", ffpage(`${trail("Home", "Orders", "New delivery")}
<div class="esum" role="alert" tabindex="-1" style="margin-bottom:16px"><h4>There is a problem</h4><ul><li><a href="#name">Enter the name of the delivery</a></li><li><a href="#loading">Loading must start before dispatch</a></li></ul></div>
${phead("New delivery", "Start with a name.")}
${section("The delivery", `<div class="form">
<div class="field" id="name"><label>Name <span class="req" aria-hidden="true">*</span></label><input class="inp err" aria-invalid="true"><span class="err">Enter the name of the delivery</span></div>
<div class="field" id="loading"><label>Loading starts <span class="req" aria-hidden="true">*</span></label><input class="inp err" value="08:00" aria-invalid="true"><span class="err">Loading must start before dispatch</span></div>
<div class="btnrow end"><button class="btn primary">Create delivery</button></div>
</div>`)}`, 560), "Orders"),
          rationale: "The summary sits at the top of the page, above the heading, as GOV.UK specifies: below the back link and breadcrumb, above the <code>h1</code>, taking focus.",
          tradeoff: "Above the heading it is easy to miss on a long page, and it pushes the heading below the fold on a phone. GOV.UK accepts that because the page title also gets an 'Error: ' prefix for screen readers.",
        },
        {
          name: "The refused field only, with no summary at all",
          html: ffshell("New delivery", ffpage(`${trail("Home", "Orders", "New delivery")}
${phead("New delivery", "Start with a name.")}
${section("The delivery", `<div class="form">
${field("Name", input("Spring restock"), { required: true })}
${field("Loading starts", '<input class="inp err" value="32/13/2026" aria-invalid="true">', { error: "Invalid date", required: true })}
${field("Leaves the dock", input("14/03/2026 12:00"), { required: true })}
<div class="btnrow end" style="border-top:1px solid var(--border);padding-top:12px"><button class="btn">Cancel</button><button class="btn primary">Create delivery</button></div>
</div>`)}`, 560), "Orders"),
          rationale: "The one field the command refused carries a message; everything else is untouched. The smallest response to a single refusal, which is what most refusals are.",
          tradeoff: "This common behaviour satisfies WCAG 3.3.1 but not 3.3.3, because 'Invalid date' names no field and says nothing about what to do.",
        },
        {
          name: "The refused command, with what to do instead",
          html: ffshell("Release the dispatch", ffpage(`${trail("Home", "Orders", DELIVERY.name, "Dispatch")}
${phead("Release the dispatch", "Dispatch opens Sat 14 Mar 2026 at 08:00.")}
<div style="margin-bottom:14px">${alert("destructive", "That is more units than the warehouse holds", `${PRODUCT.warehouse} holds 10,000 units. 10,400 are on sale across every price tier. Lower a quantity or raise the warehouse capacity first.`, '<span class="linkish" style="font-size:11.5px">Why?</span>')}</div>
${section("What would go on sale", `<table class="dt dense"><thead><tr><th scope="col">Tier</th><th scope="col" class="num">Price</th><th scope="col" class="num">Units</th></tr></thead><tbody><tr><td>Standard</td><td class="num">EUR 45.00</td><td class="num">10,000</td></tr><tr><td>Bulk</td><td class="num">EUR 20.00</td><td class="num">400</td></tr><tr style="background:var(--destructive-surface);color:var(--destructive-surface-foreground)"><td><b>Total</b></td><td class="num"></td><td class="num"><b>10,400</b></td></tr></tbody></table>`, { flush: true })}
<div class="btnrow end" style="margin-top:12px"><button class="btn">Change a quantity</button><button class="btn primary" aria-disabled="true">Release the dispatch</button></div>`, 600), "Orders"),
          rationale: "When a refusal is about the command rather than a field, it goes above the form as an alert with the code's sentence and, where the application can help, why it was refused and what resolves it.",
          tradeoff: "The refusal is not attached to anything the reader can click, so it explains rather than navigates. Useful for a business rule, useless for a typo.",
        },
        {
          name: "Validation on leaving each field",
          reference: "Shopify Polaris",
          html: ffshell("New delivery", ffpage(`${trail("Home", "Orders", "New delivery")}
${phead("New delivery", "Each field is checked when you leave it.")}
${section("The delivery", `<div class="form">
${field("Name", '<input class="inp ok" value="Spring restock">', { help: "✓ Spring restock is free.", required: true })}
${field("Where", select(PRODUCT.warehouse, ["Choose a warehouse", PRODUCT.warehouse, "Rotterdam depot", "Utrecht depot"]), { help: "A warehouse carries its capacity and its docks.", required: true })}
${field("Loading starts", '<input class="inp err" value="08:00" aria-invalid="true">', { error: "Loading must start before dispatch. It is set to 08:00, and dispatch is 08:00.", required: true })}
${formActions('<button class="btn">Cancel</button>', '<button class="btn primary">Create delivery</button>')}
</div>`)}`, 560), "Orders"),
          rationale: "Shopify Polaris and Stripe check a field on blur and mark it good or wrong where it sits, so the user fixes one field and moves on. By the submit there is nothing left to refuse.",
          tradeoff: "A complement to the summary, never a replacement: with three errors and no summary the reader still cannot see them all at once. And a check on blur fires while the form is half filled.",
        },
        {
          name: "One question per screen with a progress marker",
          reference: "Typeform",
          html: ffshell("New delivery", ffpage(`${trail("Home", "Orders", "New delivery")}
${phead("New delivery", "Question 2 of 4.")}
${section("Where", `<div class="form">
${progress(50)}
${field("Where are the docks?", select("Choose a warehouse", ["Choose a warehouse", PRODUCT.warehouse, "Rotterdam depot", "Utrecht depot"]), { error: "Choose where the docks are.", required: true })}
<div class="btnrow between"><button class="btn">Back</button><button class="btn primary">Continue</button></div>
</div>`)}`, 520), "Orders"),
          rationale: "TurboTax and Typeform ask one question per screen with nowhere else for an error to hide: the refusal sits under the only field on the page. A guided flow cannot submit with a field unseen.",
          tradeoff: "Four screens for four fields is the slowest form in this category, and a user who knows all four answers resents the pacing. It fits a first delivery; it does not fit the fortieth.",
        },
      ],
    },
    {
      id: "field-unsaved",
      title: "Work that is not saved",
      verdict: "The visible unsaved marker beside Save stays the pick: the reader never has to remember whether they typed anything. The sticky save bar is the runner-up for long settings pages where the form actions scroll out of view. Never ship silent autosave on money or access: each save would be an audited command, and an audit entry per keystroke batch is not a trail a reviewer can read.",
      why: `A common failure is an editor with <b>no Cancel and no dirty state</b>: nothing tells a reader that what they typed is unsaved, and nothing stops them leaving it.`,
      variants: [
        {
          name: "A visible unsaved marker beside the Save",
          pick: true,
          html: ffshell("Storefront", ffpage(`${trail("Home", "Products", "Storefront")}
${phead("Storefront", "The accent colour customers see on your buttons.")}
${section("Identity", `<div class="form">
${field("Accent colour", `<span class="inline" style="gap:8px">${ffSwatch("amber", "The accent #B45309")}<input class="inp mono" style="width:110px" value="#B45309" aria-invalid="false"></span>`, { help: "A #RRGGBB value. Contrast with white is 5.1:1, so white button text is readable." })}
${field("Typeface", select("Inter", ["System", "Inter", "Source Serif"]), {})}
${alert("info", "Two changes not saved.", "The accent colour and the typeface. Customers still see the old ones.")}
<div class="btnrow between" style="border-top:1px solid var(--border);padding-top:12px"><button class="btn ghost">Discard both</button><button class="btn primary">Save 2 changes</button></div>
</div>`)}`, 520), "Products"),
          rationale: "The moment a field changes, the Save button carries the word 'Save changes' and a note says what changed. The reader never has to remember whether they typed anything.",
          tradeoff: "A note naming one changed field is a derived fact about the form's state, which has to come from the form rather than the route. And a Save that changes its own label moves under the reader's cursor.",
        },
        {
          name: "Leave-with-a-question when there is something to lose",
          reference: "Cloudcape",
          html: ffshell("Storefront", `<div class="page" style="max-width:520px;position:relative">${trail("Home", "Products", "Storefront")}
${phead("Storefront", "")}
${section("Identity", `<div class="form">
${field("Accent colour", `<span class="inline" style="gap:8px">${ffSwatch("amber", "The accent #B45309")}<input class="inp mono" style="width:110px" value="#B45309"></span>`, { help: "Contrast with white is 5.1:1." })}
<div class="btnrow between" style="border-top:1px solid var(--border);padding-top:12px"><button class="btn ghost">Cancel</button><button class="btn primary">Save</button></div>
</div>`)}
<div class="scrim"><div class="dialog sm" role="alertdialog" aria-modal="true"><header><div><h3>Leave without saving?</h3><p>Two changes will be lost.</p></div></header><div class="dbody"><div class="stack sm" style="font-size:12.5px"><div>The accent colour, now #B45309</div><div>The typeface, now Inter</div></div></div><footer><button class="btn left">Stay here</button><button class="btn primary">Leave and lose both</button></footer></div></div>
</div>`, "Products"),
          rationale: "Cloudcape's rule is to confirm only when there is real data at risk and to be consistent about it, so the same dialog appears for a Cancel, a breadcrumb and a navigation away.",
          tradeoff: "Every page with a form needs the same guard, and the browser's own <code>beforeunload</code> prompt cannot be worded, so the custom one and the native one both appear on a browser Back.",
        },
        {
          name: "Autosave, with a saved marker",
          html: ffshell("Incident", ffpage(`${trail("Home", "Orders", DELIVERY.name, "Incidents")}
${phead("Record an incident", "Saved as you type. Nothing is lost if this browser closes.")}
${section("The incident", `<div class="form">
${field("What happened", '<textarea class="ta" style="min-height:120px">At 08:41 a driver presented a delivery note for the wrong order. Chris refused it and called support.</textarea>', { required: true })}
<div class="inline" style="justify-content:space-between;font-size:11.5px;color:var(--muted-foreground)"><span class="inline" style="gap:5px"><span class="spinner" style="width:10px;height:10px;border-width:1.5px"></span>Saving</span><span>Saved 4 seconds ago</span></div>
</div>`)}`, 560), "Orders"),
          rationale: "The form saves itself every few seconds and a quiet marker says 'Saved 4 seconds ago'. Nothing is ever lost and no dialog is ever needed.",
          tradeoff: "Autosave makes each save a command against money and access, which means an audit entry per keystroke batch. A past decision must stay reconstructable, and a trail of keystroke batches is not one a reviewer can read.",
        },
        {
          name: "A draft, saved and left on the server",
          reference: "GOV.UK",
          html: ffshell("Return policy", ffpage(`${trail("Home", "Settings", "Policies")}
${phead("Return policy", "A draft from 6 Oct is waiting. It has not been published.")}
${section("The policy", `<div class="stack">
${alert("info", "You were part way through this.", "A draft from 6 Oct 2026, 17:40. The published policy has not changed since 2 Sep.", '<button class="btn sm">Carry on</button><button class="btn sm ghost">Start again</button>')}
${field("Published policy", '<textarea class="ta" style="min-height:120px">Goods can be returned within 30 days of delivery if they are unused and in their packaging. After that, store credit against a future order instead.</textarea>', { help: "What customers see at checkout today." })}
<div class="btnrow end"><button class="btn">Cancel</button><button class="btn primary">Publish</button></div>
</div>`)}`, 600), "Settings"),
          rationale: "The form's state is a draft the server holds. Leaving the page leaves the draft, and returning to it offers to carry on. GOV.UK asks for this where a long form may be completed over more than one sitting.",
          tradeoff: "A draft is a second version of the record with its own name and its own rules about when it expires. It is a new aggregate, not a field on the form.",
        },
        {
          name: "Saved silently, with the command in the page header",
          html: ffshell("Tier details", ffpage(`${trail("Home", "Products", PRODUCT.name, "Standard")}
${phead(`Standard ${badgeRaw("On sale", "positive")}`, "", '<button class="btn sm">Pause sales</button>')}
${section("The name", `<div class="form">
${field("Name", input("Standard"), { required: true })}
${field("What it includes", '<textarea class="ta">Discounted unit price for trade accounts.</textarea>', { optional: true })}
<div class="btnrow end" style="border-top:1px solid var(--border);padding-top:12px"><button class="btn primary">Save the name</button></div>
</div>`, { desc: "What customers read on the storefront and on their invoice." })}
${section("Invoice naming", `<div class="stack sm"><div class="radio-list"><label><input type="radio" name="n"><span><b>No name</b><span class="cd">A parcel is handed to whoever signs for it.</span></span></label><label><input type="radio" name="n" checked=""><span><b>The customer name</b><span class="cd">The customer name is on the note.</span></span></label><label><input type="radio" name="n"><span><b>Every recipient named</b><span class="cd">The customer names each recipient before dispatch.</span></span></label></div><div class="btnrow end" style="border-top:1px solid var(--border);padding-top:12px"><button class="btn primary">Save the naming</button></div></div>`, { desc: "For a named invoice the customer is asked for each recipient name." })}`, 560), "Products"),
          rationale: "For a settings page where each change is independent, each section saves itself on its own Save and the header carries nothing. A reader who changes two areas can save each.",
          tradeoff: "Two Saves on one screen is the case where a reader edits one form and saves the other. The rule has to be one Save per page or one per section, never a mix.",
        },
        {
          name: "A read-only form because the state forbids it",
          html: ffshell("Pricing", ffpage(`${trail("Home", "Products", PRODUCT.name, "Standard", "Pricing")}
${phead("Pricing", "The Spring Launch is on sale. EUR 45.00 was set on 12 Jan 2026 and 9,412 orders carry it.")}
${section("Standard tier", `<div class="form">
${field("Standard unit price, in euros", ffMoneyPrefix("45.00", { ro: true }), { help: "The price the customers who already bought were charged. It cannot change.", required: true })}
${field("Price for the units still on sale, in euros", ffMoneyPrefix("50.00"), { help: "The 588 units that are still for sale.", required: true })}
${callout("caution", "Charging the 588 differently from the 9,412 who already paid is allowed. A customer who finds out can ask for the difference back.")}
<div class="btnrow end" style="border-top:1px solid var(--border);padding-top:12px"><button class="btn primary">Save the new price</button></div>
</div>`)}`, 560), "Products"),
          rationale: "Once the sale has opened, the price is a versioned fact and the field is read-only rather than a field with a save. Changing it is a different command with its own consequences.",
          tradeoff: "A read-only field with no command leaves the reader stuck, unless the command to change it is stated. The explained-action pattern exists for exactly this case.",
        },
        {
          name: "A save bar pinned to the top while dirty",
          reference: "Shopify Polaris",
          html: ffshell("Storefront", ffpage(`${trail("Home", "Products", "Storefront")}
${phead("Storefront", "The accent colour and typeface customers see.")}
<div class="ff-sticky"><span><b>2 unsaved changes.</b> <span class="muted">Customers still see the old ones.</span></span><span style="margin-left:auto;display:flex;gap:8px"><button class="btn sm ghost">Discard</button><button class="btn sm primary">Save</button></span></div>
${section("Identity", `<div class="form" style="margin-top:12px">
${field("Accent colour", `<span class="inline" style="gap:8px">${ffSwatch("amber", "The accent #B45309")}<input class="inp mono" style="width:110px" value="#B45309"></span>`, { help: "A #RRGGBB value. Contrast with white is 5.1:1, so white button text is readable." })}
${field("Typeface", select("Inter", ["System", "Inter", "Source Serif"]), {})}
</div>`)}`, 520), "Products"),
          rationale: "Shopify Polaris pins a contextual save bar to the top of a dirty form, so Save and Discard never scroll out of reach on a long settings page. The bar appears with the first keystroke and leaves with the save.",
          tradeoff: "A pinned bar covers content on a phone and follows the reader past sections it has nothing to do with. It also needs the same dirty tracking as the marker, so it adds no new information, only reach.",
        },
        {
          name: "Per-field revert to the saved value",
          reference: "Figma",
          html: ffshell("Storefront", ffpage(`${trail("Home", "Products", "Storefront")}
${phead("Storefront", "The accent colour and typeface customers see.")}
${section("Identity", `<div class="form">
<div class="field"><label>Accent colour <span class="ff-dot" role="img" aria-label="Changed"></span> <button class="btn xs ghost" style="height:auto;padding:0 4px">Revert</button></label><span class="inline" style="gap:8px">${ffSwatch("amber", "The accent #B45309")}<input class="inp mono" style="width:110px" value="#B45309"></span><span class="help">Was #1F2937. Contrast with white is 5.1:1, so white button text is readable.</span></div>
<div class="field"><label>Typeface <span class="ff-dot" role="img" aria-label="Changed"></span> <button class="btn xs ghost" style="height:auto;padding:0 4px">Revert</button></label>${select("Inter", ["System", "Inter", "Source Serif"])}<span class="help">Was System.</span></div>
${field("Show the Powered by line", '<span class="switch" role="switch" tabindex="0" aria-checked="true" aria-label="Show the Powered by line"></span>', { help: "Unchanged." })}
<div class="btnrow between" style="border-top:1px solid var(--border);padding-top:12px"><button class="btn ghost">Discard both</button><button class="btn primary">Save 2 changes</button></div>
</div>`)}`, 520), "Products"),
          rationale: "Webflow and Figma mark each changed field with a dot and offer Revert beside it, so the user keeps one change and drops another without retyping. The old value sits under the field as the honest fallback.",
          tradeoff: "A dot plus a revert button per field is two more elements on every row of a long form, and a reader who wants to keep everything still needs the page-level Save. It pays off only where partial saves are common.",
        },
      ],
    },
    {
      id: "field-date-range",
      title: "Picking a period",
      verdict: "Two typed dates with presets stays the pick: one tap for the common windows, typing for the rare ones, and both edges always visible. The two-month painted calendar is the runner-up for reporting screens where the window itself is the question. Never ship presets alone with no typed fallback: no preset reaches the launch-to-delivery window the settlement check wants.",
      why: `A user closing the month or reporting on it starts by choosing the window: the settlement run, the week after the launch opened, the month the delivery falls in. Two typed dates answer every window but make the user type both edges every time, so the field pairs typed dates with the presets the user reaches for and states what each edge includes.`,
      compact: {
        option: "A calendar with the range painted",
        behaviour: "One month is shown; the second month of the window follows below it.",
      },
      variants: [
        {
          name: "Two date inputs with presets",
          pick: true,
          html: ffshell("Settlement", ffpage(`${trail("Home", "Invoices", "Settlement")}
${phead("Settlement", `What moved for ${ORDER.company}.`)}
${section("Period", `<div class="form">
${field("Window", segmented(["Last 7 days", "Last 30 days", "Last 90 days"], 1), { help: "Fills both dates. Either can still be typed over." })}
${field("From", input("14/02/2026"), { help: "Typed as day, month, year." })}
${field("To", input("14/03/2026"), { help: "The delivery itself: Sat 14 Mar 2026." })}
<div class="btnrow end"><button class="btn primary">Show settlement</button></div>
</div>`)}`, 520), "Invoices"),
          rationale: "The presets fill both fields and the user adjusts either edge by typing, so the common windows cost one tap and the rare ones stay possible. The control that fills the fields and the fields that hold them are one unit.",
          tradeoff: "Two controls describe one value, so the preset must visibly become Custom the moment either date is edited, or the row claims a window it no longer holds.",
        },
        {
          name: "Preset segmented control: 7, 30, 90 days",
          html: ffshell("Settlement", ffpage(`${trail("Home", "Invoices", "Settlement")}
${phead("Settlement", `What moved for ${ORDER.company}.`)}
${section("Period", `<div class="form">
${field("Window", segmented(["Last 7 days", "Last 30 days", "Last 90 days"], 1), { help: "Counts back from Sat 14 Mar 2026: 14/02/2026 to 14/03/2026." })}
<div class="btnrow end"><button class="btn primary">Show settlement</button></div>
</div>`)}`, 520), "Invoices"),
          rationale: "One tap and no typing for the three windows a settlement check almost always wants. The resolved dates are shown back under the control so the preset is a promise the user can read.",
          tradeoff: "No preset reaches a launch-anchored window like the launch to the delivery, so a custom range still needs a second control beside this one.",
        },
        {
          name: "Month picker",
          html: ffshell("Settlement", ffpage(`${trail("Home", "Invoices", "Settlement")}
${phead("Settlement", `What moved for ${ORDER.company}.`)}
${section("Period", `<div class="form">
${field("Month", segmented(["January", "February", "March"], 2), { help: "March 2026, the month of Sat 14 Mar 2026." })}
${field("Year", input("2026"), { help: "The year the delivery falls in." })}
<div class="btnrow end"><button class="btn primary">Show settlement</button></div>
</div>`)}`, 520), "Invoices"),
          rationale: "Settlement and tax reporting run by calendar month, so picking March 2026 in one control beats typing the first and the last day of the month by hand.",
          tradeoff: "A window that crosses a month edge, like the fortnight around the delivery, cannot be expressed. Whole months are the only shape this control draws.",
        },
        {
          name: "Open-start rolling window",
          html: ffshell("Settlement", ffpage(`${trail("Home", "Invoices", "Settlement")}
${phead("Settlement", `What moved for ${ORDER.company}.`)}
${section("Period", `<div class="form">
${field("Window", segmented(["Since the launch opened", "Last 30 days"], 0), {})}
${field("Up to and including", input("14/03/2026"), { help: "From the launch opening to Sat 14 Mar 2026." })}
<div class="btnrow end"><button class="btn primary">Show settlement</button></div>
</div>`)}`, 520), "Invoices"),
          rationale: "Everything since the launch opened needs only an end date, because the start is the opening and never moves. One field where two would ask a question the user cannot answer differently.",
          tradeoff: "An open start silently includes old test orders, so the resolved start must be shown back under the field. Without it the user cannot tell what the window holds.",
        },
        {
          name: "Refusal when the end precedes the start",
          reference: "GOV.UK",
          html: ffshell("Settlement", ffpage(`${trail("Home", "Invoices", "Settlement")}
${phead("Settlement", `What moved for ${ORDER.company}.`)}
${section("Period", `<div class="form">
${alert("destructive", "The end is before the start", "To must be on or after 14/03/2026.")}
${field("From", input("14/03/2026"), { help: "The delivery itself: Sat 14 Mar 2026." })}
${field("To", '<input class="inp err" value="07/03/2026" aria-invalid="true">', { error: "To must be on or after 14/03/2026." })}
<div class="btnrow end"><button class="btn primary">Show settlement</button></div>
</div>`)}`, 520), "Invoices"),
          rationale: "An end before the start is refused where it was typed, in the GOV.UK template: the message names the field and says what to do, and the summary above it says the same in one line.",
          tradeoff: "One more state to draw and to test, and the refusal must wait until both fields hold a date, or it fires while the user is still typing the second one.",
        },
        {
          name: "Timezone-safe inclusive day boundaries",
          html: ffshell("Settlement", ffpage(`${trail("Home", "Invoices", "Settlement")}
${phead("Settlement", `What moved for ${ORDER.company}.`)}
${section("Period", `<div class="form">
${alert("info", "Both days count in full", "From 14/02/2026 00:00 to 14/03/2026 23:59:59, Europe/Amsterdam.")}
${field("From", input("14/02/2026"), { help: "Includes the whole day." })}
${field("To", input("14/03/2026"), { help: "Includes the whole day, to the end of Sat 14 Mar 2026." })}
<div class="btnrow end"><button class="btn primary">Show settlement</button></div>
</div>`)}`, 520), "Invoices"),
          rationale: "Each edge is a whole day in Europe/Amsterdam, so an order placed at 22:41 on the delivery day falls inside the window that ends on that day. The boundary sentence is part of the control, not documentation beside it.",
          tradeoff: "The sentence must be read to work, and a user thinking in UTC sees different instants. Stating the zone once keeps it from being repeated under each field.",
        },
        {
          name: "A calendar with the range painted",
          reference: "Airbnb",
          html: ffshell("Settlement", ffpage(`${trail("Home", "Invoices", "Settlement")}
${phead("Settlement", `What moved for ${ORDER.company}.`)}
${section("Period", `<div class="form">
${field("Window", `${segmented(["Delivery week", "Launch week", "Custom"], 0)}<div class="pop" style="position:relative;box-shadow:0 8px 22px var(--scroll-shade);margin-top:8px;padding:9px;max-width:260px"><div class="btnrow between" style="margin-bottom:6px"><button class="btn xs icon" aria-label="Previous month">‹</button><b style="font-size:12px">March 2026</b><button class="btn xs icon" aria-label="Next month">›</button></div>${ffRangeCal(7, 14)}</div>`, { help: "07/03/2026 to 14/03/2026, both days counted in full.", required: true })}
${formActions('<button class="btn primary">Show settlement</button>')}
</div>`)}`, 520), "Invoices"),
          rationale: "Airbnb and Google Flights paint the chosen range across the calendar, so the user sees the window instead of reading two dates. The endpoints stay readable as dates under the control.",
          tradeoff: "A painted month shows one month, and the settlement window usually spans two. Two months side by side is the honest control, and it does not fit a phone.",
        },
        {
          name: "Delivery-anchored presets",
          reference: "Mixpanel",
          html: ffshell("Settlement", ffpage(`${trail("Home", "Invoices", "Settlement")}
${phead("Settlement", `What moved for ${ORDER.company}.`)}
${section("Period", `<div class="form">
${field("Window", segmented(["Since launch", "Launch week", "Delivery week"], 2), { help: "Anchored to Tue 13 Jan 2026 and Sat 14 Mar 2026, not to today.", required: true })}
${field("From", input("07/03/2026"), { help: "The Saturday before the delivery.", required: true })}
${field("To", input("14/03/2026"), { help: "The delivery itself: Sat 14 Mar 2026.", required: true })}
${formActions('<button class="btn primary">Show settlement</button>')}
</div>`)}`, 520), "Invoices"),
          rationale: "Mixpanel and Amplitude anchor ranges to the milestones the business runs on, because last-30-days drifts while the launch stays fixed. The preset resolves to typed dates the user can still adjust.",
          tradeoff: "Anchors multiply: launch, dispatch, close, settlement runs. Three anchors fit a control; six need a picker of their own, and the window stops being one tap.",
        },
      ],
    },
    {
      id: "ff-slug",
      title: "A slug or URL field with a preview",
      why: `Every product and every storefront lives at an address the company chooses. The slug is the short part typed in; the address is what the customer reads, links and prints.`,
      verdict: "The slug with its live address under it is the pick: the user types the short part and reads the full address before saving. The transliteration from the name is the runner-up for creation, where typing the same words twice is pure overhead. Never ship an address that cannot be read before it is saved.",
      variants: [
        {
          name: "Slug with the live address under it",
          pick: true,
          reference: "Shopify",
          html: ffshell("Product address", ffpage(`${trail("Home", "Products", PRODUCT.name, "Address")}
${phead("Product address", "Where customers find this product.")}
${section("The address", `<div class="form">
${field("Name", input(PRODUCT.name), { help: "Customers see this on the storefront and on their invoice.", required: true })}
${field("Slug", input("oak-desk-lamp", { cls: "mono" }), { help: "Lowercase letters, numbers and dashes. Changing it breaks links already shared.", required: true })}
<div class="field"><span class="lab">Customers reach</span>${copyValue("product address", "acme-supply.example/oak-desk-lamp")}</div>
${formActions('<button class="btn">Cancel</button>', '<button class="btn primary">Save address</button>')}
</div>`)}`, 520), "Products"),
          rationale: "Contentful and Shopify show the full address under the slug field and update it as the user types, so the short value is never saved unseen. The copy command beside it is how the address leaves the back office.",
          tradeoff: "The address must update as the user types, which a static mock cannot show. It also states the host the platform gives, which the user cannot change on this screen.",
        },
        {
          name: "The address as a fact with a change command",
          reference: "GitHub",
          html: ffshell("Product address", ffpage(`${trail("Home", "Products", PRODUCT.name, "Address")}
${phead("Product address", "Where customers find this product.")}
${section("The address", `<div class="stack">
${facts([["Address", "acme-supply.example/oak-desk-lamp"], ["First shared", "13 Jan 2026"], ["Used in", "214 orders"]], { stacked: true })}
${callout("caution", "Changing the address breaks the links already shared. The old address keeps working for 30 days, then stops.")}
${formActions('<button class="btn">Change the address</button>')}
</div>`)}`, 520), "Products"),
          rationale: "GitHub shows a repository address as a fact and puts Rename behind a command, because an address in use is depended upon. The 30-day redirect is what makes the change survivable.",
          tradeoff: "Two steps to change a value, and the redirect has to be a real behaviour, not a sentence. A redirect nobody builds is a promise the page breaks.",
        },
        {
          name: "Transliterated from the name with an edit toggle",
          reference: "WordPress",
          html: ffshell("New product", ffpage(`${trail("Home", "Products", "New product")}
${phead("New product", "Start with a name.")}
${section("The address", `<div class="form">
${field("Name", input(PRODUCT.name), { help: "Customers see this on the storefront and on their invoice.", required: true })}
<label class="check"><input type="checkbox" checked=""><span>Generate the slug from the name<span class="cd">Oak desk lamp becomes oak-desk-lamp. Untick to type it by hand.</span></span></label>
${field("Slug", input("oak-desk-lamp", { cls: "mono", readonly: true }), { help: "Customers reach acme-supply.example/oak-desk-lamp.", required: true })}
${formActions('<button class="btn">Cancel</button>', '<button class="btn primary">Create product</button>')}
</div>`)}`, 520), "Products"),
          rationale: "WordPress builds the permalink from the title and lets the user edit it, because the name and the slug agree nine times in ten. Typing both by hand is the same words twice.",
          tradeoff: "The generated value must transliterate Dutch diacritics the way the user expects, and a renamed product must not silently re-slug. Generation runs once at creation, never again.",
        },
        {
          name: "Availability check with alternatives offered",
          reference: "Namecheap",
          html: ffshell("Product address", ffpage(`${trail("Home", "Products", PRODUCT.name, "Address")}
${phead("Product address", "Where customers find this product.")}
${section("The address", `<div class="form">
${field("Slug", input("lamp", { cls: "mono" }), { help: "Lowercase letters, numbers and dashes.", required: true })}
${alert("caution", "lamp is taken.", "Another company holds it. One of these is free.")}
<div class="stack sm">
<div class="split"><span class="ff-url mono">oak-lamp</span><span class="fig"><button class="btn xs">Use</button></span></div>
<div class="split"><span class="ff-url mono">desk-lamp</span><span class="fig"><button class="btn xs">Use</button></span></div>
<div class="split"><span class="ff-url mono">lamp-2026</span><span class="fig"><button class="btn xs">Use</button></span></div>
</div>
${formActions('<button class="btn">Cancel</button>', '<button class="btn primary">Save address</button>')}
</div>`)}`, 520), "Products"),
          rationale: "Namecheap answers a taken domain with free alternatives, because a refusal without a next step sends the user back to guessing. The alternatives keep the shape of what was wanted.",
          tradeoff: "The alternatives must be checked live, one by one, or the list offers addresses that fail the same way. Three checks per keystroke pause is a read the page has to budget for.",
        },
        {
          name: "The slug refused with the rule that refused it",
          reference: "GOV.UK",
          html: ffshell("Product address", ffpage(`${trail("Home", "Products", PRODUCT.name, "Address")}
${phead("Product address", "Where customers find this product.")}
<div class="esum" role="alert" tabindex="-1" style="margin-bottom:16px"><h4>There is a problem</h4><ul><li><a href="#slug">Use lowercase letters, numbers and dashes in the slug</a></li></ul></div>
${section("The address", `<div class="form">
<div class="field" id="slug"><label>Slug <span class="req" aria-hidden="true">*</span></label><input class="inp mono err" value="Oak Desk Lamp!" aria-invalid="true" aria-describedby="slug-err"><span class="err" id="slug-err">Use lowercase letters, numbers and dashes. You entered capitals, spaces and !.</span></div>
${formActions('<button class="btn">Cancel</button>', '<button class="btn primary">Save address</button>')}
</div>`)}`, 520), "Products"),
          rationale: "The GOV.UK error template applied to a slug: the summary first, then the field, with the message naming what was entered and what to do. The rule is stated once and enforced the same way.",
          tradeoff: "The message repeats the value, which makes it longer than the field. It also has to name every offending character class, not just the first it found.",
        },
        {
          name: "Custom domain with its DNS instructions",
          reference: "Vercel",
          html: ffshell("Storefront domain", ffpage(`${trail("Home", "Products", "Storefront", "Domain")}
${phead("Storefront domain", "Sell from your own address instead of ours.")}
${section("The domain", `<div class="form">
${field("Domain", input("shop.acme-supply.example", { cls: "mono" }), { help: "Customers reach shop.acme-supply.example instead of acme-supply.example.", required: true })}
${facts([["Type", "CNAME"], ["Name", "shop"], ["Value", "storefront.example.net"]], { stacked: true })}
${callout("info", "Add this record where your domain lives, then verify. DNS changes take up to a day to arrive.")}
${formActions(`<span style="margin-right:auto">${badgeRaw("Not verified", "caution")}</span>`, '<button class="btn primary">Verify</button>')}
</div>`)}`, 560), "Products"),
          rationale: "Vercel and Webflow pair a domain field with the exact DNS record it needs, because the field alone is half the task. The record is stated as values to copy, not as prose to interpret.",
          tradeoff: "Verification is a read against DNS the back office does not control, so the badge can only say what the last check found and when. A stale badge claims a state the world has left.",
        },
      ],
    },
    {
      id: "ff-capacity",
      title: "A capacity field",
      why: `The Amsterdam warehouse holds 10,000 units, and every price tier draws from the same shelves. The capacity field is where a user divides the stock without selling it twice.`,
      verdict: "The number with the warehouse ceiling restated is the pick: one field, the stock it draws from, and what is left, all on the same screen. The split across tiers is the runner-up for the product page, where the question is the whole stock rather than one tier. Never ship a capacity with no ceiling stated: a number without its stock is a number that oversells.",
      variants: [
        {
          name: "A number with the warehouse ceiling restated",
          pick: true,
          html: ffshell("Capacity", ffpage(`${trail("Home", "Products", PRODUCT.name, "Standard", "Capacity")}
${phead("Capacity", "How many Standard units can be sold.")}
${section("Units on sale", `<div class="form">
${field("Units on sale", ffSuffix("9600", "units"), { help: "9,412 sold. 188 still for sale.", required: true })}
${progress(98)}
${split(`${PRODUCT.warehouse} holds`, "10,000 units", "Bulk holds 400 of them")}
${formActions('<button class="btn">Cancel</button>', '<button class="btn primary">Save capacity</button>')}
</div>`)}`, 520), "Products"),
          rationale: "The warehouse total sits beside every quantity field, because a tier allocation means nothing without the stock it draws from. The bar shows how full the stock is at a glance.",
          tradeoff: "The restated ceiling must update when another tier changes, or two screens state two stocks. It is a read of the whole product behind one field.",
        },
        {
          name: "The split across types with what is left",
          html: ffshell("Capacity", ffpage(`${trail("Home", "Products", PRODUCT.name, "Capacity")}
${phead("Capacity", "How the 10,000 units are divided.")}
${section("Every tier", `<div class="rlist">
${recordRow({ title: "Standard", sub: "On sale since 13 Jan 2026", fig: "9,412 / 9,600", figSub: "188 left", actions: '<button class="btn sm">Change</button>' })}
${recordRow({ title: "Bulk", sub: "On sale since 13 Jan 2026", fig: "318 / 400", figSub: "82 left", actions: '<button class="btn sm">Change</button>' })}
${recordRow({ title: "Trade", sub: "Closed 31 Jan 2026", fig: "2,000 / 2,000", figSub: "Sold out", actions: '<button class="btn sm">Open</button>' })}
</div>`)}
${section("The stock", `<div class="form">
${split("Sold across every tier", "9,730", "Trade is closed, so the stock counts Standard and Bulk")}
${split("Left in the stock", "270 units", "188 Standard plus 82 Bulk")}
</div>`, { desc: "Closed tiers keep their sold quantity but release nothing back." })}`, 560), "Products"),
          rationale: "Inventory draws as one row per tier with sold against cap, because the question is the stock, not the row. The leftover line is what the user came to read.",
          tradeoff: "A row per tier is a table wearing a list costume, and at twelve tiers it needs the table back. Editing still jumps to one tier at a time.",
        },
        {
          name: "A stepper for a small count",
          reference: "Apple HIG",
          html: ffshell("Samples", ffpage(`${trail("Home", "Products", PRODUCT.name, "Samples")}
${phead("Samples", "Free units for trade accounts, inside the Bulk allocation.")}
${section("Units", `<div class="form">
<div class="field"><label>Sample units <span class="req" aria-hidden="true">*</span></label><span class="inline" style="gap:0;border:1px solid var(--input);border-radius:var(--radius-sm);width:170px;overflow:hidden"><button class="btn icon" style="border:0;border-right:1px solid var(--border);border-radius:0" aria-label="One unit fewer">−</button><input class="inp num grow" style="border:0;border-radius:0" value="24" inputmode="numeric"><button class="btn icon" style="border:0;border-left:1px solid var(--border);border-radius:0" aria-label="One unit more">+</button></span><span class="help">Steps of one, up to 50. 318 of 400 Bulk units are sold.</span></div>
${formActions('<button class="btn">Cancel</button>', '<button class="btn primary">Save samples</button>')}
</div>`)}`, 520), "Products"),
          rationale: "Apple HIG reserves the stepper for small counts adjusted by one, which a 24-unit sample list is. Tapping plus twice beats selecting 24 and typing 26.",
          tradeoff: "A stepper for 9,600 units would be tapped 9,600 times, so it fits only counts under fifty. The field must still take a typed value for the jump from 4 to 40.",
        },
        {
          name: "A percentage held back from sale",
          html: ffshell("Capacity", ffpage(`${trail("Home", "Products", PRODUCT.name, "Capacity")}
${phead("Capacity", "How many units stay off sale for the trade counter.")}
${section("The hold", `<div class="form">
${field("Held back", ffSuffix("5", "% of the stock"), { help: "Released to the trade counter on launch day. Applies to Standard only.", required: true })}
${split("Held back", "500 units", "5% of 10,000, inside the Standard allocation")}
${split("Left for sale", "9,500 units", "After the hold and the 318 Bulk units")}
${formActions('<button class="btn">Cancel</button>', '<button class="btn primary">Save hold</button>')}
</div>`)}`, 520), "Products"),
          rationale: "Holds are a percentage of the stock kept for the trade counter, restated as units so the user reads both. A percentage survives a stock change; a count does not.",
          tradeoff: "Two numbers describe one hold, and they round differently: 5% of 10,000 is 500 until the stock becomes 9,999. The units win and the percentage follows.",
        },
        {
          name: "The capacity refused with the overage named",
          reference: "GOV.UK",
          html: ffshell("Capacity", ffpage(`${trail("Home", "Products", PRODUCT.name, "Standard", "Capacity")}
${phead("Capacity", "How many Standard units can be sold.")}
<div style="margin-bottom:14px">${alert("destructive", "That is more units than the warehouse holds", `${PRODUCT.warehouse} holds 10,000 units. 10,400 are on sale across every tier. Lower a quantity first.`, '<span class="linkish" style="font-size:11.5px">Why?</span>')}</div>
${section("Units on sale", `<div class="form">
${field("Units on sale", ffSuffix("10000", "units", { err: true }), { error: "That is 400 units more than the stock holds. Lower it to 9,600 or take 400 from Bulk.", required: true })}
${split(`${PRODUCT.warehouse} holds`, "10,000 units", "Bulk holds 400 of them")}
${formActions('<button class="btn">Cancel</button>', '<button class="btn primary">Save capacity</button>')}
</div>`)}`, 520), "Products"),
          rationale: "The refusal worded on screen, with the field carrying the same message: GOV.UK names the field and says what to do, and the numbers supply the overage. The user reads the overage, not just the rule.",
          tradeoff: "The message must recompute the overage for every value, and a value that breaks two rules needs two messages. One refusal per field keeps it readable.",
        },
        {
          name: "Sold as a read-only fact beside an editable cap",
          reference: "Stripe",
          html: ffshell("Capacity", ffpage(`${trail("Home", "Products", PRODUCT.name, "Standard", "Capacity")}
${phead("Capacity", "How many Standard units can be sold.")}
${section("Units on sale", `<div class="stack">
${facts([["Sold", "9,412"], ["On sale", "9,600"], ["Left", "188"]])}
${callout("info", "Sold is a fact and cannot be edited. Lowering the cap below 9,412 is refused; those units already shipped.")}
${field("Units on sale", ffSuffix("9600", "units"), { help: "Must stay at or above 9,412.", required: true })}
${formActions('<button class="btn">Cancel</button>', '<button class="btn primary">Save capacity</button>')}
</div>`)}`, 520), "Products"),
          rationale: "Stripe draws an available balance as a fact beside the controls that move it: sold is what happened, the cap is what the user decides. The two must never share a field.",
          tradeoff: "Three figures plus a field for one decision, and the derived Left line must update as the cap is typed. It is the most screen per field in this item.",
        },
      ],
    },
    {
      id: "ff-colour",
      title: "A colour field for the storefront accent",
      why: `The company brands its storefront with one accent colour: a #RRGGBB value dark enough for white button text to read on it. The field takes the value and proves the contrast before it is refused.`,
      verdict: "The hex field with a swatch and a contrast readout is the pick: it takes any colour, shows it, and states the ratio the validation enforces. The customer-button preview is the runner-up beside it, because a ratio is believed once it is seen. Never ship a free colour with no contrast check: a pale accent ships white text nobody can read.",
      variants: [
        {
          name: "Hex field with a swatch and a contrast readout",
          pick: true,
          reference: "Shopify",
          html: ffshell("Storefront", ffpage(`${trail("Home", "Products", "Storefront")}
${phead("Storefront", "The accent colour customers see on your buttons.")}
${section("Accent", `<div class="form">
${field("Accent colour", `<span class="inline" style="gap:8px">${ffSwatch("ink", "The accent #1F2937")}<input class="inp mono" style="width:110px" value="#1F2937"></span>`, { help: "A #RRGGBB value. Contrast with white is 14.7:1, so white button text is readable.", required: true })}
${split("White button text", "Readable", "Needs 4.5:1. This accent reaches 14.7:1")}
${formActions('<button class="btn">Cancel</button>', '<button class="btn primary">Save accent</button>')}
</div>`)}`, 520), "Products"),
          rationale: "Shopify theme editor pairs a hex field with a swatch and the rule it must pass, because a colour value means nothing until it is seen. The readout repeats the validation rule, so the user is told before the request rather than after it.",
          tradeoff: "The ratio must recompute as the user types, and an unfinished value has no ratio to state. Six characters that are not yet a colour need patience, not a refusal.",
        },
        {
          name: "Preset swatches plus a custom value",
          reference: "Slack",
          html: ffshell("Storefront", ffpage(`${trail("Home", "Products", "Storefront")}
${phead("Storefront", "The accent colour customers see on your buttons.")}
${section("Accent", `<div class="form">
<div class="field"><span class="lab">Presets</span><div class="ff-swatches">${ffPreset("ink", "Ink, the default", true)}${ffPreset("amber", "Amber")}${ffPreset("pine", "Pine")}${ffPreset("ocean", "Ocean")}${ffPreset("plum", "Plum")}${ffPreset("rose", "Rose")}</div><span class="help">Every preset passes 4.5:1 against white. Ink is what a new company starts with.</span></div>
${field("Or a custom colour", `<span class="inline" style="gap:8px">${ffSwatch("ink", "The custom colour #1F2937")}<input class="inp mono" style="width:110px" value="#1F2937"></span>`, { help: "A #RRGGBB value. Checked against white before it saves.", optional: true })}
${formActions('<button class="btn">Cancel</button>', '<button class="btn primary">Save accent</button>')}
</div>`)}`, 520), "Products"),
          rationale: "Slack and Notion offer a row of presets that all satisfy the rule, with a custom field for the user who knows better. One tap covers the common case and cannot produce a failing colour.",
          tradeoff: "Six presets cannot hold a brand colour, so the custom field carries the real work anyway. And a preset row that never changes starts to look like the whole choice.",
        },
        {
          name: "The accent previewed on a customer button",
          reference: "Mailchimp",
          html: ffshell("Storefront", ffpage(`${trail("Home", "Products", "Storefront")}
${phead("Storefront", "The accent colour customers see on your buttons.")}
${section("Accent", `<div class="form">
${field("Accent colour", `<span class="inline" style="gap:8px">${ffSwatch("ink", "The accent #1F2937")}<input class="inp mono" style="width:110px" value="#1F2937"></span>`, { help: "A #RRGGBB value. Contrast with white is 14.7:1.", required: true })}
</div>`)}
${section("Customer preview", `<div class="preview"><div class="pv-bar"><b>Checkout</b><span class="toggle muted" style="font-size:11px">Customer view</span></div><div class="pv-body"><h4>${DELIVERY.name}</h4><p>Sat 14 Mar 2026 · ${PRODUCT.warehouse}</p><p>2 units · EUR 100.00</p><span class="ff-paybtn">Pay EUR 100.00</span></div><div class="pv-foot">${COMPANY.name} · ${COMPANY.address}</div></div>`, { desc: "The button the customer presses, in your accent." })}
<div class="btnrow end" style="margin-top:12px"><button class="btn">Cancel</button><button class="btn primary">Save accent</button></div>`, 560), "Products"),
          rationale: "Mailchimp previews a brand colour on the button the customer presses, because a ratio is believed once it is seen. The user reads white on #1F2937 instead of reading 14.7:1.",
          tradeoff: "A preview is a second surface to keep honest: it must show the typed value, not the saved one, and it must update as the user types. A stale preview proves nothing.",
        },
        {
          name: "The browser colour well beside the hex",
          reference: "MDN",
          html: ffshell("Storefront", ffpage(`${trail("Home", "Products", "Storefront")}
${phead("Storefront", "The accent colour customers see on your buttons.")}
${section("Accent", `<div class="form">
${field("Accent colour", `<span class="inline" style="gap:8px"><input type="color" value="#1F2937" aria-label="Pick the accent colour" style="width:34px;height:32px;padding:2px;border:1px solid var(--input);border-radius:var(--radius-sm);background:var(--background)"><input class="inp mono" style="width:110px" value="#1F2937"></span>`, { help: "Pick a colour or type a #RRGGBB value. Both hold the same accent.", required: true })}
${split("White button text", "Readable", "Needs 4.5:1. This accent reaches 14.7:1")}
${formActions('<button class="btn">Cancel</button>', '<button class="btn primary">Save accent</button>')}
</div>`)}`, 520), "Products"),
          rationale: "The browser native colour well is the only picker that costs no code: one input, the platform dialog, and a hex the user can still type. MDN documents it as the accessible default.",
          tradeoff: "The well draws the browser chrome instead of the back-office control and renders differently everywhere, which is the same charge the native date input faces. It also offers colours that fail 4.5:1 without saying so.",
        },
        {
          name: "A pale colour refused with the ratio that failed",
          reference: "GOV.UK",
          html: ffshell("Storefront", ffpage(`${trail("Home", "Products", "Storefront")}
${phead("Storefront", "The accent colour customers see on your buttons.")}
${section("Accent", `<div class="form">
${field("Accent colour", `<span class="inline" style="gap:8px">${ffSwatch("sun", "The accent #F59E0B")}<input class="inp mono err" style="width:110px" value="#F59E0B" aria-invalid="true"></span>`, { error: "White button text needs 4.5:1 against the accent. #F59E0B reaches 2.1:1. Choose a darker colour.", required: true })}
${formActions('<button class="btn">Cancel</button>', '<button class="btn primary">Save accent</button>')}
</div>`)}`, 520), "Products"),
          rationale: "The validation rule worded on screen in the GOV.UK template: the message names the value, states both ratios, and says what to do. The user learns the rule from the refusal, not from documentation.",
          tradeoff: "A refusal that only says darker leaves the user guessing how much darker. It earns its place fully only beside presets that all pass.",
        },
        {
          name: "An inherited accent with an override command",
          reference: "Figma",
          html: ffshell("Product style", ffpage(`${trail("Home", "Products", PRODUCT.name, "Style")}
${phead("Product style", "What customers see for this product.")}
${section("Accent", `<div class="stack">
${facts([[`${COMPANY.name} accent`, "#1F2937"], ["This product", "Inherits the company accent"]])}
${callout("info", "One accent across every product keeps the brand steady. Override it only for a product with its own artwork.")}
${formActions('<button class="btn">Override for this product</button>')}
</div>`)}`, 520), "Products"),
          rationale: "Figma variables inherit down the tree and override at one level with the source still named, so a product can differ without hiding where its value came from. The company default stays the decider.",
          tradeoff: "An inherited value with an override is two values and a rule about which wins. A reader who never opens this screen cannot tell which products differ.",
        },
      ],
    },
    {
      id: "ff-repeat-group",
      title: "A repeatable group for price tiers",
      why: `The Oak desk lamp sells in Standard, Trade and Bulk: three groups of the same fields, each with its own name, price and allocation. The group repeats, and the stock counts every repetition.`,
      verdict: "The stacked cards are the pick: one card per tier with its price and allocation readable at once, and one command to add another. The dated price steps are the runner-up for launches, where time decides the price rather than the customer choice. Never ship a group whose repetitions cannot be removed: a tier added by mistake must leave without taking its sold units with it.",
      compact: {
        option: "A table with inline editing",
        behaviour: "At phone width the table keeps its columns and scrolls sideways; the tier column stays first.",
      },
      variants: [
        {
          name: "Stacked cards, one per type",
          pick: true,
          reference: "Shopify",
          html: ffshell("Price tiers", ffpage(`${trail("Home", "Products", PRODUCT.name, "Price tiers")}
${phead("Price tiers", "What a customer picks and what the warehouse ships.")}
${section("Three tiers", `<div class="rlist">
${recordRow({ title: "Trade", sub: "Closed 31 Jan 2026 · 2,000 sold", state: { label: "Sold out", tone: "caution" }, fig: "EUR 35.00", actions: '<button class="btn sm">Edit</button>' })}
${recordRow({ title: "Standard", sub: "On sale · 9,412 of 9,600 sold", state: { label: "On sale", tone: "positive" }, fig: MONEY.lamp, actions: '<button class="btn sm">Edit</button><button class="btn sm ghost">Remove</button>' })}
${recordRow({ title: "Bulk", sub: "On sale · 318 of 400 sold", state: { label: "On sale", tone: "positive" }, fig: "EUR 20.00", actions: '<button class="btn sm">Edit</button><button class="btn sm ghost">Remove</button>' })}
</div>`)}
<div class="btnrow between" style="margin-top:12px"><button class="btn">Add a price tier</button><button class="btn primary">Save order</button></div>`, 600), "Products"),
          rationale: "Shopify draws product variants as one row per variant with its price readable at once, because the user compares repetitions before editing one. Sold tiers stay visible but lose their Remove.",
          tradeoff: "A row shows the price but hides the dates, the discount rule and the description, so editing still opens each tier. The list answers what, never why.",
        },
        {
          name: "A table with inline editing",
          reference: "Airtable",
          html: ffshell("Price tiers", ffpage(`${trail("Home", "Products", PRODUCT.name, "Price tiers")}
${phead("Price tiers", "What a customer picks and what the warehouse ships.")}
${section("Three tiers", `<table class="dt"><thead><tr><th scope="col">Tier</th><th scope="col" class="num">Price</th><th scope="col" class="num">Units</th><th scope="col" class="num">Sold</th><th scope="col"><span class="visually-hidden">Commands</span></th></tr></thead><tbody><tr><td>Trade</td><td class="num">EUR 35.00</td><td class="num">2,000</td><td class="num">2,000</td><td></td></tr><tr><td><input class="inp" style="height:26px" value="Standard" aria-label="Tier name"></td><td class="num"><input class="inp money" style="height:26px" value="45.00" aria-label="Price in euros"></td><td class="num"><input class="inp num" style="height:26px" value="9600" aria-label="Units on sale"></td><td class="num">9,412</td><td><button class="btn xs">Done</button></td></tr><tr><td>Bulk</td><td class="num">EUR 20.00</td><td class="num">400</td><td class="num">318</td><td><button class="btn xs ghost">Edit</button></td></tr></tbody></table>`, { flush: true })}
<div class="btnrow between" style="margin-top:12px"><button class="btn">Add a price tier</button><button class="btn primary">Save all</button></div>`, 640), "Products"),
          rationale: "Airtable edits values where they sit, so changing three prices costs three fields and no navigation. One row in edit state at a time keeps the table readable while it is also a form.",
          tradeoff: "A table that is also a form validates cell by cell, and a refused cell must hold its row open. At phone width the columns scroll sideways, which hides the price behind a swipe.",
        },
        {
          name: "One section per type with add another",
          reference: "GOV.UK",
          html: ffshell("Price tiers", ffpage(`${trail("Home", "Products", PRODUCT.name, "Price tiers")}
${phead("Price tiers", "What a customer picks and what the warehouse ships.")}
${section("Tier 1 of 2", `<div class="form">
${field("Name", input("Standard"), { required: true })}
${field("Price customers pay, in euros", money("45.00"), { required: true })}
${field("Units on sale", ffSuffix("9600", "units"), { help: "9,412 sold.", required: true })}
</div>`, { acts: '<button class="btn sm ghost">Remove</button>' })}
${section("Tier 2 of 2", `<div class="form">
${field("Name", input("Bulk"), { required: true })}
${field("Price customers pay, in euros", money("20.00"), { required: true })}
${field("Units on sale", ffSuffix("400", "units"), { help: "318 sold.", required: true })}
</div>`, { acts: '<button class="btn sm ghost">Remove</button>' })}
<div class="btnrow between" style="margin-top:12px"><button class="btn">Add another price tier</button><button class="btn primary">Save tiers</button></div>`, 560), "Products"),
          rationale: "GOV.UK add-another repeats the full group once per entry with its own remove, because each repetition deserves the same labels, help and errors as the first. Nothing about tier 2 is abbreviated.",
          tradeoff: "Three full groups is a very long page, and the stock total has nowhere to sit. It fits creation, where each tier is new; it drags for review, where each tier is known.",
        },
        {
          name: "Dated price steps for the launch",
          html: ffshell("Price tiers", ffpage(`${trail("Home", "Products", PRODUCT.name, "Price tiers")}
${phead("Price tiers", "Time decides the price. The customer pays whatever step is open.")}
${section("Two steps", `<div class="rlist">
${recordRow({ title: "Launch · EUR 35.00", sub: "13 Jan to 31 Jan 2026 · 2,000 of 2,000 sold", state: { label: "Sold out", tone: "caution" }, fig: "Closed", actions: "" })}
${recordRow({ title: "Regular · EUR 45.00", sub: "1 Feb to 14 Mar 2026, 08:00 · 7,412 of 7,600 sold", state: { label: "On sale", tone: "positive" }, fig: "Open", actions: '<button class="btn sm">Edit</button>' })}
</div>`, { desc: "Steps never overlap. The next step opens the moment the current one closes." })}
<div class="btnrow between" style="margin-top:12px"><button class="btn">Add a step</button><button class="btn primary">Save steps</button></div>`, 600), "Products"),
          rationale: "A launch tiers its prices by date, because early customers pay less for committing first. The dates are part of each step, so the price on any day is answered by reading one row.",
          tradeoff: "Dated steps plus per-tier allocations is two ways to divide one stock, and they can disagree: a step can close with units left, or sell out with days left. One of the two has to win.",
        },
        {
          name: "Drag to reorder with the customer order shown",
          reference: "Linear",
          html: ffshell("Price tiers", ffpage(`${trail("Home", "Products", PRODUCT.name, "Price tiers")}
${phead("Price tiers", "Customers meet them in this order. Drag a row to move it.")}
${section("Three tiers", `<div class="rlist">
<div class="rrow"><span class="muted" aria-hidden="true">⠿</span><span class="txt"><b>1 · Standard</b><small>EUR 45.00 · on sale</small></span><span class="acts"><button class="btn sm icon" aria-label="Move Standard up">↑</button><button class="btn sm icon" aria-label="Move Standard down">↓</button></span></div>
<div class="rrow"><span class="muted" aria-hidden="true">⠿</span><span class="txt"><b>2 · Bulk</b><small>EUR 20.00 · on sale</small></span><span class="acts"><button class="btn sm icon" aria-label="Move Bulk up">↑</button><button class="btn sm icon" aria-label="Move Bulk down">↓</button></span></div>
<div class="rrow"><span class="muted" aria-hidden="true">⠿</span><span class="txt"><b>3 · Trade</b><small>EUR 35.00 · sold out</small></span><span class="acts"><button class="btn sm icon" aria-label="Move Trade up">↑</button><button class="btn sm icon" aria-label="Move Trade down">↓</button></span></div>
</div>`, { desc: "The numbers are the customer order on the storefront. Sold-out tiers stay listed so customers read why they cannot buy them." })}
<div class="btnrow end" style="margin-top:12px"><button class="btn primary">Save order</button></div>`, 560), "Products"),
          rationale: "Linear and Trello order by dragging with button equivalents beside each row, because drag alone strands keyboard users. The customer order is numbered, so the back-office order and the storefront order cannot drift apart silently.",
          tradeoff: "Order is one more field per tier with its own conflicts: two users reordering at once, and a tier added in the middle. It needs the same version check as every shared write.",
        },
        {
          name: "The group refused, naming the type that breaks the ceiling",
          reference: "GOV.UK",
          html: ffshell("Price tiers", ffpage(`${trail("Home", "Products", PRODUCT.name, "Price tiers")}
${phead("Price tiers", "What a customer picks and what the warehouse ships.")}
<div style="margin-bottom:14px">${alert("destructive", "That is more units than the warehouse holds", `${PRODUCT.warehouse} holds 10,000 units. 10,400 are on sale across every tier. Lower Standard by 400 units or take 400 from Bulk.`, '<span class="linkish" style="font-size:11.5px">Why?</span>')}</div>
${section("Three tiers", `<div class="rlist">
${recordRow({ title: "Standard · EUR 45.00", sub: "10,000 units on sale. Lower it by 400 units.", fig: "10,000", actions: '<button class="btn sm">Change</button>' })}
${recordRow({ title: "Bulk · EUR 20.00", sub: "400 units on sale", fig: "400", actions: '<button class="btn sm">Change</button>' })}
</div>`, { desc: "10,400 units on sale. The warehouse holds 10,000." })}
<div class="btnrow end" style="margin-top:12px"><button class="btn primary">Save tiers</button></div>`, 600), "Products"),
          rationale: "The refusal above the group plus the offending row named below it: GOV.UK puts the summary first and the message on the field, and here the field is a row. Standard carries the overage because Standard grew last.",
          tradeoff: "Blaming one row for a stock total is a guess the page makes about intent: the user may sooner cut Bulk than Standard. The message must offer both, not decide.",
        },
      ],
    },
    {
      id: "ff-tags",
      title: "A tag input",
      why: `Products and customers carry short labels: oak, home, trade. Tags are typed freely but read everywhere, so the input must take new words and still keep old ones spelled one way.`,
      verdict: "The chips with type-to-add and suggestions are the pick: new words are allowed and old ones are offered, so oak is spelled once. The checkbox list is the runner-up where the tag set is closed and counted. Never ship free text with no suggestions: it grows oak, Oak and oak-desk side by side.",
      variants: [
        {
          name: "Chips with type-to-add and suggestions",
          pick: true,
          reference: "GitHub",
          html: ffshell("Tags", ffpage(`${trail("Home", "Products", PRODUCT.name, "Tags")}
${phead("Tags", "Short labels customers and staff read.")}
${section("The tags", `<div class="form">
${field("Tags", `<div class="chips">${ffTag("oak")}${ffTag("home")}${ffTag("new")}</div><div class="pop" style="position:relative;box-shadow:0 8px 22px var(--scroll-shade);margin-top:8px"><div class="search" style="margin-bottom:4px"><span class="ico">⌕</span><input class="inp w-full" value="tra" aria-label="Add a tag"></div><div class="cap">Suggestions</div><div class="item" style="font-size:12.5px">trade-accounts<span class="muted" style="margin-left:auto;font-size:11px">12 products</span></div><div class="item" style="font-size:12.5px">Use tra as a new tag</div></div>`, { help: "Lowercase letters, numbers and dashes. New words are allowed.", optional: true })}
${formActions('<button class="btn">Cancel</button>', '<button class="btn primary">Save tags</button>')}
</div>`)}`, 520), "Products"),
          rationale: "GitHub and Linear offer existing labels as the user types and accept a new word on Enter, so the old spelling wins without forbidding the new one. The count beside each suggestion says how shared it is.",
          tradeoff: "Suggestions must search across every product on every keystroke pause, and a slow search answers after the user has already pressed Enter. The new word wins by timing, not by choice.",
        },
        {
          name: "A checkbox list in a popover with a count",
          reference: "Shopify",
          html: ffshell("Tags", ffpage(`${trail("Home", "Products", PRODUCT.name, "Tags")}
${phead("Tags", "Short labels customers and staff read.")}
${section("The tags", `<div class="form">
${field("Tags", `<button class="btn w-full" style="justify-content:space-between" aria-haspopup="true" aria-expanded="true">3 tags chosen<span class="muted">▾</span></button><div class="pop" style="position:relative;box-shadow:0 8px 22px var(--scroll-shade);margin-top:4px"><div class="search" style="margin-bottom:4px"><span class="ico">⌕</span><input class="inp w-full" placeholder="Search tags"></div><div class="item" style="font-size:12.5px"><input type="checkbox" checked="" aria-label="oak"> oak</div><div class="item" style="font-size:12.5px"><input type="checkbox" checked="" aria-label="home"> home</div><div class="item" style="font-size:12.5px"><input type="checkbox" checked="" aria-label="new"> new</div><div class="item" style="font-size:12.5px"><input type="checkbox" aria-label="trade-accounts"> trade-accounts</div><div class="sep"></div><div class="item" style="font-size:12px;color:var(--muted-foreground)">Manage the tag list</div></div>`, { help: "Tick what applies. New tags are made on the tag list.", optional: true })}
${formActions('<button class="btn">Cancel</button>', '<button class="btn primary">Save tags</button>')}
</div>`)}
${dialog("Manage the tag list", `<div class="stack sm"><div class="split"><span>oak</span><span class="fig"><button class="btn xs">Rename</button></span></div><div class="split"><span>home</span><span class="fig"><button class="btn xs">Rename</button></span></div><div class="split"><span>new</span><span class="fig"><button class="btn xs">Rename</button></span></div><div class="split"><span>trade-accounts</span><span class="fig"><button class="btn xs">Rename</button></span></div></div>`, { footer: '<button class="btn">Done</button>', desc: "Renaming a tag renames it on every product that carries it." })}`, 520), "Products"),
          rationale: "Shopify and Jira draw a closed tag set as checkboxes with a count on the button, because ticking is faster than typing when the words already exist. Managing the list is a separate task with its own dialog.",
          tradeoff: "A closed set cannot take a new word where it is needed, so the user leaves the form to make one. It fits a governed vocabulary; it fights a growing one.",
        },
        {
          name: "Free text split on commas",
          reference: "WordPress",
          html: ffshell("Tags", ffpage(`${trail("Home", "Products", PRODUCT.name, "Tags")}
${phead("Tags", "Short labels customers and staff read.")}
${section("The tags", `<div class="form">
${field("Tags", input("oak, home, new"), { help: "Separate tags with commas. Spaces at the edges are removed.", optional: true })}
<div class="field"><span class="lab">Read as</span><div class="chips">${ffTag("oak")}${ffTag("home")}${ffTag("new")}</div></div>
${formActions('<button class="btn">Cancel</button>', '<button class="btn primary">Save tags</button>')}
</div>`)}`, 520), "Products"),
          rationale: "Stack Overflow and WordPress take tags as one comma-separated line with the parsed chips read back below, so pasting a list from elsewhere just works. The readout is what makes the parsing honest.",
          tradeoff: "No suggestions means no shared spelling: oak and Oak become two tags and nobody is told. The readout shows the split but cannot judge the words.",
        },
        {
          name: "Colour-coded tags for audience segments",
          reference: "Mailchimp",
          html: ffshell("Segments", ffpage(`${trail("Home", "Customers", "Segments")}
${phead("Segments", "Who gets the trade mail for the Spring Launch.")}
${section("The segments", `<div class="form">
${field("Segments", `<div class="chips">${badgeRaw("Regulars", "info")}${badgeRaw("Early customers", "positive")}${badgeRaw("At risk", "caution")}<button class="btn xs">Add</button></div>`, { help: "The colour repeats the word: info for who, positive for won, caution for fading.", optional: true })}
${split("Regulars", "1,204 customers", "Bought twice or more")}
${split("Early customers", "2,000 customers", "Bought in the first week")}
${split("At risk", "318 customers", "Bought last year, nothing since")}
${formActions('<button class="btn">Cancel</button>', '<button class="btn primary">Save segments</button>')}
</div>`)}`, 560), "Customers"),
          rationale: "Mailchimp and Klaviyo colour segments by meaning, because a segment is read in lists where its word is small. The tone repeats the signal instead of decorating it.",
          tradeoff: "Five tones cover five meanings and no more; a sixth segment reuses a tone and the code breaks. Colour must never be the only signal, so the word stays anyway.",
        },
        {
          name: "A tag refused with the rule",
          reference: "GOV.UK",
          html: ffshell("Tags", ffpage(`${trail("Home", "Products", PRODUCT.name, "Tags")}
${phead("Tags", "Short labels customers and staff read.")}
${section("The tags", `<div class="form">
<div class="field"><label>Tags <span class="opt">optional</span></label><div class="chips">${ffTag("oak")}${ffTag("home")}</div><input class="inp err" value="Oak Range!" aria-invalid="true" style="margin-top:8px"><span class="err">Tags hold lowercase letters, numbers and dashes. You entered capitals, a space and !.</span></div>
${formActions('<button class="btn">Cancel</button>', '<button class="btn primary">Save tags</button>')}
</div>`)}`, 520), "Products"),
          rationale: "The GOV.UK error template on the tag being added: the good chips stay and the bad word carries the message. The rule is stated with the value that broke it.",
          tradeoff: "The message judges one word while the field holds a list, so the user must tell which word failed. The chips above carry that by staying put.",
        },
        {
          name: "Inherited tags with their source named",
          reference: "HubSpot",
          html: ffshell("Tags", ffpage(`${trail("Home", "Products", PRODUCT.name, "Standard", "Tags")}
${phead("Standard tags", "Labels on this price tier.")}
${section("The tags", `<div class="form">
<div class="field"><span class="lab">From ${PRODUCT.name}</span><div class="chips">${ffTag("oak")}${ffTag("home")}</div><span class="help">Every tier on the product carries these. Change them on the product.</span></div>
${field("On Standard itself", `<div class="chips">${ffTag("featured")}</div><input class="inp" placeholder="Add a tag" style="margin-top:8px">`, { help: "Lowercase letters, numbers and dashes.", optional: true })}
${formActions('<button class="btn">Cancel</button>', '<button class="btn primary">Save tags</button>')}
</div>`)}`, 520), "Products"),
          rationale: "HubSpot shows inherited properties with their source beside the local ones, so a tier page answers the whole label set without hiding where each word came from. Removing an inherited word is refused by pointing at its source.",
          tradeoff: "Two lists where one was expected, and the inherited one cannot be edited here. A reader who wants the tier untagged must walk up the tree.",
        },
      ],
    },
    {
      id: "ff-address",
      title: "An address field",
      why: `${COMPANY.name} answers for its orders with a name, an address and a telephone number on every customer message. The address field takes the street the law asks for and the postcode the mail needs.`,
      verdict: "The postcode lookup is the pick: two short values the user knows produce the street they would mistype. The country-first manual entry is the runner-up for companies outside the lookup coverage. Never ship a single free-text address box: one line cannot be split into street, postcode and city again.",
      variants: [
        {
          name: "Postcode lookup that fills the street",
          pick: true,
          reference: "GOV.UK",
          html: ffshell("Organization", ffpage(`${trail("Home", "Settings", "Organization")}
${phead("Organization", `What ${COMPANY.name} is and where it works.`)}
${section("The address", `<div class="form">
${twoCol(field("Postcode", input("1011 AB"), { required: true }), field("Number", input("12"), { required: true }), { ratio: "1fr 1fr" })}
${formActions('<button class="btn">Look up the street</button>')}
${field("Street", input("Canal Street"), { required: true })}
${field("City", input("Amsterdam"), { required: true })}
${field("Country", select("Netherlands", ["Netherlands", "Belgium", "Germany"]), { help: "Customers read this address on their invoices and their mail.", required: true })}
${formActions('<button class="btn">Cancel</button>', '<button class="btn primary">Save address</button>')}
</div>`)}`, 560), "Settings"),
          rationale: "Postcode.nl and GOV.UK ask for postcode plus number first because the user knows both by heart, then fill the street the user would mistype. Two short fields beat one long one.",
          tradeoff: "The lookup covers the Netherlands and nowhere else, so every other country falls back to manual entry. Two paths through one field is two paths to test.",
        },
        {
          name: "One search that fills the address",
          reference: "Google Places",
          html: ffshell("Organization", ffpage(`${trail("Home", "Settings", "Organization")}
${phead("Organization", `What ${COMPANY.name} is and where it works.`)}
${section("The address", `<div class="form">
${field("Find the address", `<div class="pop" style="position:relative;box-shadow:0 8px 22px var(--scroll-shade)"><div class="search" style="margin-bottom:4px"><span class="ico">⌕</span><input class="inp w-full" value="Canal" aria-label="Search addresses"></div><div class="item" style="font-size:12.5px">Canal Street 12, 1011 AB Amsterdam</div><div class="sep"></div><div class="item" style="font-size:12px;color:var(--muted-foreground)">Type the address by hand instead</div></div>`, { help: "Start typing the street. The postcode and city follow.", required: true })}
${formActions('<button class="btn">Cancel</button>', '<button class="btn primary">Save address</button>')}
</div>`)}`, 560), "Settings"),
          rationale: "Google Places resolves a half-typed street to a full address, because the user knows where they are but not how the database spells it. One field holds the whole search.",
          tradeoff: "An address search is a read against a provider the back office pays per keystroke, and a wrong first result is chosen without reading. The manual fallback must stay one tap away.",
        },
        {
          name: "Country first, then the local shape",
          reference: "Stripe",
          html: ffshell("Organization", ffpage(`${trail("Home", "Settings", "Organization")}
${phead("Organization", `What ${COMPANY.name} is and where it works.`)}
${section("The address", `<div class="form">
${field("Country", select("Netherlands", ["Netherlands", "Belgium", "Germany"]), { help: "The fields below follow the country.", required: true })}
${field("Street and number", input("Canal Street 12"), { required: true })}
${twoCol(field("Postcode", input("1011 AB"), { required: true }), field("City", input("Amsterdam"), { required: true }), { ratio: "1fr 1fr" })}
${formActions('<button class="btn">Cancel</button>', '<button class="btn primary">Save address</button>')}
</div>`)}`, 560), "Settings"),
          rationale: "Stripe Checkout asks for the country first because the shape of an address follows it: a Dutch postcode is nothing like a German one. The labels and the validation change with the country.",
          tradeoff: "Every supported country needs its own shape, its own labels and its own validation. Three countries fit this pattern; thirty need a library.",
        },
        {
          name: "Warehouse address with a map pin",
          html: ffshell("Warehouse", ffpage(`${trail("Home", "Settings", "Warehouses", PRODUCT.warehouse)}
${phead(PRODUCT.warehouse, "Where the docks are.")}
${section("The address", `<div class="stack">
${facts([["Warehouse", PRODUCT.warehouse], ["City", "Amsterdam"], ["Docks", "Main dock, side dock"]])}
<div class="ff-map"><span><b style="font-size:13px">◉ ${PRODUCT.warehouse}, Amsterdam</b><br><span class="muted" style="font-size:11.5px">Pin placed by ${COMPANY.name}</span></span></div>
${formActions('<button class="btn">Move the pin</button>', '<button class="btn primary">Save address</button>')}
</div>`)}`, 560), "Settings"),
          rationale: "The warehouse is pinned on a map beside its address, because drivers navigate to a pin, not to a street name. The pin is placed by the company, not guessed from the postcode.",
          tradeoff: "A map is a third-party surface with its own terms and its own load time. A static pin box proves the pattern; the live map is a dependency, not a field.",
        },
        {
          name: "The postcode refused with the expected shape",
          reference: "GOV.UK",
          html: ffshell("Organization", ffpage(`${trail("Home", "Settings", "Organization")}
${phead("Organization", `What ${COMPANY.name} is and where it works.`)}
${section("The address", `<div class="form">
${field("Street and number", input("Canal Street 12"), { required: true })}
${twoCol(`<div class="field"><label>Postcode <span class="req" aria-hidden="true">*</span></label><input class="inp err" value="1011" aria-invalid="true"><span class="err">A Dutch postcode holds four digits, a space and two letters, like 1011 AB.</span></div>`, field("City", input("Amsterdam"), { required: true }), { ratio: "1fr 1fr" })}
${formActions('<button class="btn">Cancel</button>', '<button class="btn primary">Save address</button>')}
</div>`)}`, 560), "Settings"),
          rationale: "The GOV.UK error template on a postcode: the message states the shape and gives the example, so the user repairs 1011 without opening a second page. The example is the company's own postcode.",
          tradeoff: "The shape differs per country, so the message must follow the country field. A Dutch message under a Belgian address refuses a value that was right.",
        },
        {
          name: "A verified address with a change command",
          html: ffshell("Organization", ffpage(`${trail("Home", "Settings", "Organization")}
${phead("Organization", `What ${COMPANY.name} is and where it works.`)}
${section("The address", `<div class="stack">
${facts([["Street", "Canal Street 12"], ["Postcode and city", "1011 AB Amsterdam"], ["Country", "Netherlands"]], { stacked: true })}
${callout("info", "Verified against the chamber of commerce on 2 Sep 2026. Changing it verifies the account again.")}
${formActions(`<span style="margin-right:auto">${badgeRaw("Verified", "positive")}</span>`, '<button class="btn">Change the address</button>')}
</div>`)}`, 560), "Settings"),
          rationale: "Banks and company registers show a verified address as a fact with a change command, because a verified value is depended upon by payouts and invoices. The badge states what the last check found.",
          tradeoff: "Verification is a check against a register the back office does not hold, so the badge can only age. A move the company forgets to report leaves a true badge on a false address.",
        },
      ],
    },
    {
      id: "ff-email-editor",
      title: "An email body editor",
      why: `${COMPANY.name} mails every customer when goods are dispatched, and the message carries the customer name, the order number and the delivery window. The editor takes the company words once and fills the customer facts per order.`,
      verdict: "The subject plus body with variable chips is the pick: the user writes the sentence and places the facts where they belong. The side-by-side customer preview is the runner-up beside it, because a template is believed once it is seen filled. Never ship a template with no preview: variables are spelled in one place and filled in another, and only the filled copy proves they meet.",
      compact: {
        option: "Side-by-side preview of the customer message",
        behaviour: "The preview sits below the editor; the user scrolls between writing and reading.",
      },
      variants: [
        {
          name: "Subject plus body with variable chips",
          pick: true,
          reference: "Mailchimp",
          html: ffshell("Dispatch mail", ffpage(`${trail("Home", "Settings", "Email", "Goods dispatched")}
${phead("Goods dispatched", "The message a customer looks for. Sent when goods are dispatched.")}
${section("The message", `<div class="form">
${field("Subject", input(`Your ${COMPANY.name} order is on its way`), { required: true })}
<div class="field"><label>Body <span class="req" aria-hidden="true">*</span></label><div style="border:1px solid var(--input);border-radius:var(--radius-sm);padding:7px 9px;font-size:12.5px;line-height:2.1">Hi ${ffVar("customer_name")},<br>Your order ${ffVar("order_number")} left the Amsterdam warehouse. It arrives ${ffVar("delivery_window")}. Track it from your account.</div><span class="help">Variables fill per order when the mail is sent.</span></div>
${field("Insert a variable", select("Choose a variable", ["Choose a variable", "customer_name", "order_number", "delivery_window", "delivery_date"]), { help: "Placed where the cursor sits.", optional: true })}
${formActions('<button class="btn">Send a test</button>', '<button class="btn primary">Save message</button>')}
</div>`)}`, 600), "Settings"),
          rationale: "Klaviyo and Mailchimp draw template variables as chips inside the sentence, because a variable is a word with a value, not code. The user reads the message as the customer will, with the facts marked.",
          tradeoff: "Chips inside an editable body are a small rich-text editor, not a textarea: backspace across a chip, paste with chips, and undo all need answers. The plain-text option exists for that reason.",
        },
        {
          name: "Side-by-side preview of the customer message",
          reference: "Postmark",
          html: ffshell("Dispatch mail", ffpage(`${trail("Home", "Settings", "Email", "Goods dispatched")}
${phead("Goods dispatched", "The message a customer looks for.")}
${twoCol(section("Edit", `<div class="form">
${field("Subject", input(`Your ${COMPANY.name} order is on its way`), { required: true })}
${field("Body", '<textarea class="ta" style="min-height:150px">Hi {{customer_name}},\n\nYour order {{order_number}} left the Amsterdam warehouse. It arrives {{delivery_window}}. Track it from your account.</textarea>', { required: true })}
</div>`), `<div><div class="field"><span class="lab">Customer preview</span><div class="preview"><div class="pv-bar"><b>Goods dispatched</b></div><div class="pv-body"><h4>Your Acme Supply order is on its way</h4><p>Hi ${ORDER.customer},</p><p>Your order ${ORDER.number} left the Amsterdam warehouse. It arrives Sat 14 Mar 2026, 08:00 to 12:00. Track it from your account.</p></div><div class="pv-foot">${COMPANY.name} · ${COMPANY.address}</div></div><span class="help">Filled with order ${ORDER.number}, the most recent order.</span></div></div>`)}
<div class="btnrow end" style="margin-top:12px"><button class="btn">Send a test</button><button class="btn primary">Save message</button></div>`, 760), "Settings"),
          rationale: "Postmark and SendGrid preview a template beside the editor with a real record filled in, because a variable is only proven by its value. Maria Garcia's order fills every variable this template holds.",
          tradeoff: "Two columns collapse to one on a phone, so the preview sits below the editor and the user scrolls between them. A long template makes a long round trip.",
        },
        {
          name: "Plain text with a variable list beside it",
          reference: "GOV.UK",
          html: ffshell("Dispatch mail", ffpage(`${trail("Home", "Settings", "Email", "Goods dispatched")}
${phead("Goods dispatched", "The message a customer looks for.")}
${twoCol(section("The message", `<div class="form">
${field("Subject", input(`Your ${COMPANY.name} order is on its way`), { required: true })}
${field("Body", '<textarea class="ta mono" style="min-height:150px">Hi ((customer name)),\n\nYour order ((order number)) left the Amsterdam warehouse. It arrives ((delivery window)).</textarea>', { help: "Plain text. No bold, no links, no images.", required: true })}
</div>`), section("Variables", `<div class="stack sm"><div class="split"><span class="mono">((customer name))</span><span class="fig muted" style="font-size:11.5px">${ORDER.customer}</span></div><div class="split"><span class="mono">((order number))</span><span class="fig muted" style="font-size:11.5px">${ORDER.number}</span></div><div class="split"><span class="mono">((delivery window))</span><span class="fig muted" style="font-size:11.5px">08:00 to 12:00</span></div><div class="split"><span class="mono">((delivery date))</span><span class="fig muted" style="font-size:11.5px">Sat 14 Mar 2026</span></div><div class="note">Spelled with double brackets. The value fills when the mail is sent.</div></div>`))}
<div class="btnrow end" style="margin-top:12px"><button class="btn">Send a test</button><button class="btn primary">Save message</button></div>`, 760), "Settings"),
          rationale: "GOV.UK Notify writes templates as plain text with ((double bracket)) variables and lists each one beside the editor with an example value. Nothing about the message can break in a mail client that reads text.",
          tradeoff: "Double brackets are learned, not guessed: ((delivery window)) with one bracket fails silently or loudly depending on the parser. The editor must highlight what it recognises as you type.",
        },
        {
          name: "One tab per language",
          reference: "Shopify",
          html: ffshell("Dispatch mail", ffpage(`${trail("Home", "Settings", "Email", "Goods dispatched")}
${phead("Goods dispatched", "The message a customer looks for.")}
${tabs(["Nederlands", "English"], 0)}
${section("Nederlands", `<div class="form">
${field("Subject", input("Je bestelling is onderweg"), { required: true })}
${field("Body", '<textarea class="ta" style="min-height:130px">Hi {{customer_name}},\n\nJe bestelling {{order_number}} heeft het Amsterdamse magazijn verlaten. Hij arriveert {{delivery_window}}.</textarea>', { required: true })}
${formActions(`<span style="margin-right:auto">${badgeRaw("English is missing", "caution")}</span>`, '<button class="btn primary">Save message</button>')}
</div>`)}`, 600), "Settings"),
          rationale: "Contentful and Shopify Translate keep one tab per locale with the missing ones badged, because a customer reads exactly one language and the user must know which ones exist. The badge names the gap instead of hiding it.",
          tradeoff: "Two tabs is two templates to keep in step: a variable added to one must be added to the other, and the Dutch sentence grows while the English one waits. Tabs hide the drift they also cause.",
        },
        {
          name: "The send refused with the missing variable named",
          reference: "GOV.UK",
          html: ffshell("Dispatch mail", ffpage(`${trail("Home", "Settings", "Email", "Goods dispatched")}
${phead("Goods dispatched", "The message a customer looks for.")}
${alert("destructive", "Order number is missing.", "The body asks for ((order number)) and this test order holds none. Add a fallback or fill the value, then send again.", '<span class="linkish" style="font-size:11.5px">Why?</span>')}
${section("The message", `<div class="form" style="margin-top:12px">
${field("Subject", input(`Your ${COMPANY.name} order is on its way`), { required: true })}
${field("Body", '<textarea class="ta mono err" style="min-height:130px" aria-invalid="true">Hi ((customer name)),\n\nYour order is on its way. Order ((order number)).</textarea>', { error: "((order number)) has no value on this order. Add a fallback such as ((order number or your confirmation mail)).", required: true })}
${formActions('<button class="btn">Send a test</button>', '<button class="btn primary">Save message</button>')}
</div>`)}`, 600), "Settings"),
          rationale: "GOV.UK Notify refuses a send whose personalisation is missing and names the variable, because a blank where the order number belongs is worse than no mail. The message offers the fallback shape, not just the complaint.",
          tradeoff: "The refusal can only name what the test record lacks; a variable filled on the test order but empty on a real one still sends blank. Every variable needs a fallback, not just a test.",
        },
        {
          name: "A sent copy with the values filled in",
          reference: "Postmark",
          html: ffshell("Dispatch mail", ffpage(`${trail("Home", "Orders", ORDER.number, "Mail")}
${phead("Goods dispatched", `Sent for order ${ORDER.number}.`)}
${section("The sending", `<div class="stack">
${facts([["To", ORDER.email], ["Sent", "8 Oct 2026, 09:33"], ["Order", ORDER.number], ["State", "Delivered"]])}
<div class="field"><span class="lab">Customer received</span><div class="preview"><div class="pv-body"><h4>Your Acme Supply order is on its way</h4><p>Hi ${ORDER.customer},</p><p>Your order ${ORDER.number} left the Amsterdam warehouse. It arrives Sat 14 Mar 2026, 08:00 to 12:00. Track it from your account.</p></div><div class="pv-foot">${COMPANY.name} · ${COMPANY.address}</div></div></div>
${formActions(`<span style="margin-right:auto">${badgeRaw("Delivered", "positive")}</span>`, '<button class="btn">Resend</button>')}
</div>`)}`, 600), "Orders"),
          rationale: "Postmark activity keeps the sent copy with every variable filled, because a dispute about what the customer was told is settled by reading what was sent. The record is read-only: history does not take edits.",
          tradeoff: "A copy per sending is storage that grows with every order, and each copy holds personal data under retention rules. The record must expire with the order, not live beside it.",
        },
      ],
    },
  ],
};
