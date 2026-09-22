// Collects what every aggregate root owns, references, is referenced by, raises,
// and reacts to into one cross-reference map, so a reader can answer what moving
// or removing a root breaks without opening 63 pages.
//
// Reads: every `kind: aggregate` page and every `kind: module` page under
// `docs/domain/modules/`, and the module enumeration in
// `docs/domain/modules/README.md`.
//
// Writes: `docs/domain/aggregate-map.md`.
//
//   node standards/tools/audit-aggregates.mjs [consumerRoot]           reports the counts
//   node standards/tools/audit-aggregates.mjs [consumerRoot] --check   refuses a stale page
//   node standards/tools/audit-aggregates.mjs [consumerRoot] --fix     writes the page
//
// `Owns` and `References by ID` come from each aggregate page's Ownership table.
// `Referenced by` inverts that column across every root: a token naming another
// root's identity is matched to the root its name begins with, so
// `EventCapacityHoldId` names `EventCapacity`. `Events raised` comes from the
// page's Events table. `Reacts to` comes from the module page's
// `Events and event reactions` table, and a module-level reaction is carried by
// every root the module owns.
//
// A cell that would run past the controlled-prose bound keeps a short traceable
// phrase and the row's link to the source page. The prose measures are imported
// from the sibling `prose.mjs` so the map proves its own output.

import fs from 'node:fs';
import path from 'node:path';
import { words } from './prose.mjs';

const DOCS = 'docs/domain';
const MODULES = `${DOCS}/modules`;
const PAGE = `${DOCS}/aggregate-map.md`;
const CELL_LIMIT = 20;
const REFERENCE_DISPLAY_LIMIT = 17;

const USAGE = `Usage: node standards/tools/audit-aggregates.mjs [consumerRoot] [--check|--fix]

Collects the aggregate cross-reference map into docs/domain/aggregate-map.md.

  (no mode)  Report the counts and whether the page is current.
  --check    Exit non-zero when the page is stale.
  --fix      Write the page.

consumerRoot defaults to the current working directory.`;

const flags = process.argv.slice(2).filter((argument) => argument.startsWith('-'));
const unknown = flags.filter((flag) => flag !== '--check' && flag !== '--fix');
if (unknown.length) {
  console.error(`Unknown option ${unknown.join(', ')}`);
  console.error(USAGE);
  process.exit(2);
}
if (flags.includes('--check') && flags.includes('--fix')) {
  console.error('Pass one of --check and --fix, not both.');
  console.error(USAGE);
  process.exit(2);
}
const root = path.resolve(process.argv.slice(2).find((argument) => !argument.startsWith('-')) ?? '.');
const fix = flags.includes('--fix');
const check = flags.includes('--check');

function read(relative) {
  return fs.readFileSync(path.join(root, relative), 'utf8');
}
function filesUnder(directory) {
  const found = [];
  const walk = (current) => {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith('.md')) found.push(full);
    }
  };
  walk(path.join(root, directory));
  return found.sort();
}
const relative = (full) => path.relative(root, full).replace(/\\/g, '/');

function metadata(raw) {
  if (!raw.startsWith('---')) return null;
  const end = raw.indexOf('\n---', 3);
  if (end < 0) return null;
  try {
    return JSON.parse(raw.slice(3, end).trim());
  } catch {
    return null;
  }
}
function section(raw, name) {
  const lines = raw.split(/\r?\n/);
  const start = lines.findIndex((line) => line.trim() === `## ${name}`);
  if (start < 0) return null;
  const body = [];
  for (let index = start + 1; index < lines.length; index += 1) {
    if (/^##\s/.test(lines[index])) break;
    body.push(lines[index]);
  }
  return body.join('\n');
}
function tableRows(text) {
  const rows = [];
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('|')) continue;
    if (/^\|\s*:?-/.test(trimmed)) continue;
    rows.push(trimmed.replace(/^\|/, '').replace(/\|$/, '').split('|').map((cell) => cell.trim()));
  }
  return rows;
}

// The module list is the one enumeration of the modules, so the map reads its
// order from there rather than sorting the folders a second way. A README that
// does not link every module folder falls back to the folder names.
function moduleOrder() {
  const raw = read(`${MODULES}/README.md`).replace(/\r\n/g, '\n');
  const directories = fs.readdirSync(path.join(root, MODULES), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
  const listed = [];
  for (const match of raw.matchAll(/\[`([a-z0-9-]+)`\]\(([a-z0-9-]+)\/README\.md\)/g)) {
    if (match[1] !== match[2] || !directories.includes(match[1]) || listed.includes(match[1])) continue;
    listed.push(match[1]);
  }
  return directories.length > 0 && directories.every((name) => listed.includes(name)) ? listed : directories.sort();
}

const pascal = (kebab) => kebab.split('-').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join('');

const aggregates = [];
const modules = new Map();
for (const file of filesUnder(MODULES)) {
  const raw = fs.readFileSync(file, 'utf8');
  const meta = metadata(raw);
  if (!meta) continue;
  const rel = relative(file);
  if (meta.kind === 'aggregate') {
    const parts = rel.split('/');
    aggregates.push({
      id: String(meta.id).replace(/^aggregate\//, ''),
      module: parts[2] === 'modules' ? parts[3] : undefined,
      page: rel,
      raw,
    });
  } else if (meta.kind === 'module') {
    modules.set(String(meta.id), { page: rel, raw });
  }
}

const order = moduleOrder();
const orderIndex = new Map(order.map((name, index) => [name, index]));
aggregates.sort((left, right) => {
  const moduleDifference = (orderIndex.get(left.module) ?? Number.MAX_SAFE_INTEGER) - (orderIndex.get(right.module) ?? Number.MAX_SAFE_INTEGER);
  return moduleDifference !== 0 ? moduleDifference : left.page.localeCompare(right.page);
});

const rootNames = new Map(aggregates.map((aggregate) => [aggregate.id, pascal(aggregate.id)]));
const byPascal = [...rootNames.entries()].sort((left, right) => right[1].length - left[1].length);

function resolveToken(token) {
  const bare = token.endsWith('Id?') ? token.slice(0, -3) : token.endsWith('Id') ? token.slice(0, -2) : null;
  if (bare === null) return null;
  for (const [id, name] of byPascal) {
    if (bare === name || bare.startsWith(name)) return id;
  }
  return null;
}

const rows = [];
const referencedBy = new Map(aggregates.map((aggregate) => [aggregate.id, []]));
for (const aggregate of aggregates) {
  const ownership = section(aggregate.raw, 'Ownership');
  const ownershipRows = ownership ? tableRows(ownership).filter((cells) => cells[0] !== 'Owns') : [];
  const ownershipRow = ownershipRows[0] ?? ['None.', 'None.'];
  const references = [...(ownershipRow[1] ?? '').matchAll(/`([^`]+)`/g)].map((match) => match[1]);
  for (const token of references) {
    const target = resolveToken(token);
    if (target && target !== aggregate.id && !referencedBy.get(target).includes(aggregate.id)) {
      referencedBy.get(target).push(aggregate.id);
    }
  }
  const events = [];
  const eventsBody = section(aggregate.raw, 'Events');
  if (eventsBody) {
    for (const cells of tableRows(eventsBody)) {
      const match = (cells[0] ?? '').match(/^`(event\/[a-z0-9-]+\.[a-z0-9-]+)`$/);
      if (match) events.push(match[1]);
    }
  }
  const module = modules.get(aggregate.module);
  const reactions = [];
  if (module) {
    const reactionsBody = section(module.raw, 'Events and event reactions');
    if (reactionsBody) {
      for (const cells of tableRows(reactionsBody)) {
        const reference = (cells[0] ?? '').match(/^`(event\/[a-z0-9-]+\.[a-z0-9-]+)`$/);
        if (!reference) continue;
        if ((cells[3] ?? '').startsWith('None.')) continue;
        reactions.push(reference[1]);
      }
    }
  }
  rows.push({
    ...aggregate,
    owns: ownershipRow[0] ?? 'None.',
    references: ownershipRow[1] ?? 'None.',
    events,
    reactions,
  });
}

// A cell that the prose bound would refuse keeps a short traceable phrase. The
// key is the cell exactly as the source page states it, so a source rewrite
// makes the override stop matching and the script reports the cell.
const OVERRIDES = new Map([
    // admission-gate: The gate name, its venue area or free-text location, its operating window, the session...
    ["The gate name, its venue area or free-text location, its operating window, the session and zone a ticket must name to pass, and whether it is open.",
        "The gate name, its location, its operating window, the session and zone it admits, and whether it is open."],
    // multi-day-admission: The covered `AdmissionDay` children in calendar order, the local time at which one...
    ["The covered `AdmissionDay` children in calendar order, the local time at which one programme day gives way to the next, each day's admission time with the scan and device that used it, and when the admission was opened.",
        "The covered `AdmissionDay` children, the boundary between programme days, each day's scan and device, and when the admission was opened."],
    // ticket: The `TicketHolder`, the current `TicketCode` and its replacement count, the `TicketDeliveryEvi...
    ["The `TicketHolder`, the current `TicketCode` and its replacement count, the `TicketDeliveryEvidence` records, the `TicketCheckInState`, the last recorded exit, the placement it admits to, the bounded `TicketCheckInAttempt` history, and whether the right stands.",
        "Holder, current code and replacements, delivery evidence, check-in state, last exit, placement, and whether the right stands."],
    // event-change: The change kind, the summary buyers are shown, that a refund is offered, when it was dec...
    ["The change kind, the summary buyers are shown, that a refund is offered, when it was declared, and one `BuyerRemedyAnswer` per order.",
        "The change kind, the buyer summary, whether a refund is offered, when it was declared, and one `BuyerRemedyAnswer` per order."],
    // event-reminder-schedule: The offsets in hours before doors, one `SentReminder` per offset that went out...
    ["The offsets in hours before doors, one `SentReminder` per offset that went out, when it was configured, and whether it is finished.",
        "The offsets in hours before doors, one `SentReminder` per offset sent, when it was configured, and whether it is finished."],
    // event-session: The session name, the window it runs in, whether it admits only ticket holders of a tick...
    ["The session name, the window it runs in, whether it admits only ticket holders of a ticket naming it, whether it is retired, and when it was defined.",
        "The name, its window, whether it admits only named holders, whether it is retired, and when it was defined."],
    // merchandise-fulfillment: The fulfillment method, the delivery address when shipping, every `Merchandise...
    ["The fulfillment method, the delivery address when shipping, every `MerchandiseFulfillmentLine` with its purchased, completed, and cancelled quantities, every `MerchandiseShipment` with its contents and state, and the overall progress.",
        "The method, delivery address, each line's quantities, each shipment, and the overall progress."],
    // organizer-api-key: The organizer's label, the public prefix, the digest of the secret, whether the key...
    ["The organizer's label, the public prefix, the digest of the secret, whether the key is withdrawn and why, when it was issued and by whom, an optional expiry, and when it last authenticated a call.",
        "The label, public prefix, secret digest, withdrawal and why, when issued and by whom, optional expiry, and last authentication."],
    // organizer-sender-identity: The from address, the reply-to address, the domain authentication status wi...
    ["The from address, the reply-to address, the domain authentication status with its reason and time, the list of texted message kinds, and when it was registered.",
        "The from and reply-to addresses, domain authentication status, the texted message kinds, and when it was registered."],
    // product: The name, description, image reference, family definition, lifecycle state, and every `Product...
    ["The name, description, image reference, family definition, lifecycle state, and every `ProductVariant` with its name, SKU, barcode, display order, and state.",
        "The name, description, image, family, lifecycle, and every variant with its name, SKU, barcode, and state."],
    // access-code: The digest of the secret, the name staff find it by, the maximum uses, the redemption coun...
    ["The digest of the secret, the name staff find it by, the maximum uses, the redemption count, the expiry, the eligible listings, and whether it is retired.",
        "The secret digest, the staff name, maximum uses, redemption count, expiry, eligible listings, and whether it is retired."],
    // automatic-discount: The rule's name, its `AutomaticDiscountBenefit`, its currency, its window, its red...
    ["The rule's name, its `AutomaticDiscountBenefit`, its currency, its window, its redemption budget, its redemption count, the listings it reaches, and whether it is retired.",
        "The name, benefit, currency, window, redemption budget and count, the listings it reaches, and whether it is retired."],
    // bundle-definition: The bundle name buyers see, the unit price, the parent variant an add-on requires, w...
    ["The bundle name buyers see, the unit price, the parent variant an add-on requires, whether it is retired, and one `BundleComponent` per composed variant.",
        "The buyer-facing name, the unit price, the required parent variant, retirement, and one `BundleComponent` per composed variant."],
    // listing: The currency, the `ListingVariant` rows with their prices and inventory bindings, the `SalesFe...
    ["The currency, the `ListingVariant` rows with their prices and inventory bindings, the `SalesFee` list, the sales window, the `ListingVisibility`, the `SalesPresaleWindow` with its pre-registration digests, the `ListingPriceTier` rows, the `ListingResalePolicy`, the terms and cancellation policy references, the publication evidence, and the lifecycle.",
        "Currency, variants with prices and bindings, fees, sales and presale windows, visibility, price tiers, policy references, publication evidence, and lifecycle."],
    // membership: The holder's email address, the plan name, the entitlements, the current term's start and e...
    ["The holder's email address, the plan name, the entitlements, the current term's start and end, how many renewals have been recorded, whether it has lapsed, and when it was granted.",
        "The holder's address, plan name, entitlements, current term, renewals, whether it lapsed, and when it was granted."],
    // ticket-resale: What the original buyer paid for the unit, the mode and band and oversell rule it came b...
    ["What the original buyer paid for the unit, the mode and band and oversell rule it came back under, the settlement deadline, the held unit, where it stands, and how the original buyer was settled.",
        "What the original buyer paid, the mode it returned under, the settlement deadline, the held unit, and its state."],
    // voucher-batch: The batch name, its code prefix, the benefit every voucher in it grants, the currency a...
    ["The batch name, its code prefix, the benefit every voucher in it grants, the currency a fixed amount is denominated in, the shared expiry, whether the batch is retired, and one `VoucherCode` per issued secret with its redemption.",
        "The name, code prefix, benefit, currency, shared expiry, retirement, and one `VoucherCode` per issued secret with its redemption."],
    // on-sale-queue: Whether buyers queue, the rate in places per minute, when the current open stretch bega...
    ["Whether buyers queue, the rate in places per minute, when the current open stretch began, how many units have been taken in it, and who last configured it.",
        "Whether buyers queue, the rate, when the current stretch began, units taken, and who configured it."],
]);

const cell = (value) => OVERRIDES.get(value) ?? value;

function link(target, label) {
  return `[${label}](${path.posix.relative(DOCS, target)})`;
}

const lines = [];
lines.push('---');
lines.push('{');
lines.push('  "kind": "section-index",');
lines.push('  "id": "aggregate-map",');
lines.push('  "specStatus": "approved",');
lines.push('  "owner": "Entro product and engineering",');
lines.push('  "lastReviewed": "2026-09-21"');
lines.push('}');
lines.push('---');
lines.push('# Aggregate map');
lines.push('');
lines.push('One row per aggregate root. The columns name the owning module, what the root holds, the identities it references, and the roots that reference it. They also name the events the root raises and the events its module reacts to.');
lines.push('');
lines.push('`entro check aggregates --fix` regenerates this page. `Referenced by` inverts the `References by ID` column across every root. A module that records an event reaction carries it on every root the module owns, because the reaction table is module-level. Where a cell would run past the prose bound, the row keeps a short traceable phrase and links to the page it came from.');
lines.push('');
lines.push('| Aggregate | Module | Owns | References by ID | Referenced by | Events raised | Reacts to |');
lines.push('|:---|:---|:---|:---|:---|:---|:---|');
for (const row of rows) {
  const references = referencedBy.get(row.id);
  const shown = references.slice(0, REFERENCE_DISPLAY_LIMIT).map((id) => {
    const target = aggregates.find((aggregate) => aggregate.id === id);
    return link(target.page, id);
  });
  const referenceCell = shown.length === 0
    ? 'None.'
    : `${shown.join(', ')}${references.length > shown.length ? `, and ${references.length - shown.length} more` : ''}`;
  const modulePage = modules.get(row.module);
  lines.push(`| ${link(row.page, `aggregate/${row.id}`)} | ${modulePage ? link(modulePage.page, row.module) : row.module} | ${cell(row.owns)} | ${cell(row.references)} | ${referenceCell} | ${row.events.length ? row.events.map((event) => `\`${event}\``).join(', ') : 'None.'} | ${row.reactions.length ? row.reactions.map((event) => `\`${event}\``).join(', ') : 'None.'} |`);
}
const page = `${lines.join('\n')}\n`;

const tooLong = [];
for (const row of rows) {
  for (const [name, value] of [['owns', cell(row.owns)], ['references', cell(row.references)]]) {
    if (words(value).length > CELL_LIMIT) tooLong.push(`${row.id} ${name}: ${words(value).length} words`);
  }
}
if (tooLong.length) {
  console.error(`audit-aggregates: ${tooLong.length} cell(s) past the prose bound:`);
  for (const finding of tooLong) console.error(`  - ${finding}`);
}
if (fix && tooLong.length) process.exit(1);

if (fix) {
  fs.writeFileSync(path.join(root, PAGE), page, 'utf8');
  console.log(`audit-aggregates: wrote ${PAGE}`);
} else {
  const existing = fs.existsSync(path.join(root, PAGE)) ? read(PAGE) : '';
  const current = existing === page;
  console.log(`audit-aggregates: ${rows.length} aggregate root(s) across ${new Set(rows.map((row) => row.module)).size} module(s).`);
  if (!current) console.log(`audit-aggregates: ${PAGE} is stale; run --fix.`);
  else console.log(`audit-aggregates: ${PAGE} is current.`);
  if (check && (!current || tooLong.length)) process.exit(1);
}
