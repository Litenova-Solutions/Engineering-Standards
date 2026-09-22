// Collects every defect an `Open modeling questions` or `Gaps` section records into
// one register, so a reader finds the known defects in one place instead of opening
// every module, aggregate, and use-case page.
//
// Reads: every Markdown page under `docs/domain/modules/`, and the module
// enumeration in `docs/domain/modules/README.md`.
//
// Writes: `docs/domain/defects.md`.
//
//   node standards/tools/audit-defects.mjs [consumerRoot]            reports the counts
//   node standards/tools/audit-defects.mjs [consumerRoot] --check   refuses a stale or invalid page
//   node standards/tools/audit-defects.mjs [consumerRoot] --fix     writes the page
//
// The source sections stay authoritative. An entry is copied, shortened at a
// sentence boundary where the source runs past the controlled-prose bound, and
// linked back to its page. Nothing is dropped and no severity is invented: no
// source section records one.
//
// The prose measures are imported from the sibling `prose.mjs` rather than
// restated, so the register proves its own output against the same rules the
// consumer validator applies.

import fs from 'node:fs';
import path from 'node:path';
import { sentences, words } from './prose.mjs';

const DOCS = 'docs/domain';
const MODULES = `${DOCS}/modules`;
const PAGE = `${DOCS}/defects.md`;
const PROSE_SENTENCE_LIMIT = 25;
const PROSE_PARAGRAPH_SENTENCE_LIMIT = 6;

const USAGE = `Usage: node standards/tools/audit-defects.mjs [consumerRoot] [--check|--fix]

Collects every Open modeling questions and Gaps entry under docs/domain/modules/
into docs/domain/defects.md.

  (no mode)  Report the counts and whether the page is current.
  --check    Exit non-zero when the page is stale or an entry cannot be rendered.
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

// A section opens on a line that is exactly `## Open modeling questions` or
// `## Gaps` and runs to the next H2 or the end of the file.
function defectSections(raw) {
  const lines = raw.split(/\r?\n/);
  const found = [];
  for (let index = 0; index < lines.length; index += 1) {
    const heading = lines[index].trim();
    if (heading !== '## Open modeling questions' && heading !== '## Gaps') continue;
    const body = [];
    for (let cursor = index + 1; cursor < lines.length; cursor += 1) {
      if (/^##\s/.test(lines[cursor])) break;
      body.push(lines[cursor]);
    }
    found.push({ heading: heading.slice(3), line: index + 1, body });
  }
  return found;
}

// An entry is a bullet or a paragraph line. A trailing `Sources:` line is
// attribution rather than a defect, and a table row is part of the page's own
// registers.
function defectEntries(body) {
  const found = [];
  for (const line of body) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith('Sources:')) continue;
    if (trimmed.startsWith('|')) continue;
    if (trimmed.startsWith('#')) continue;
    found.push(trimmed.startsWith('- ') ? { text: trimmed.slice(2).trim(), bullet: true } : { text: trimmed, bullet: false });
  }
  return found;
}

// The module list is the one enumeration of the modules, so the register reads
// its order from there rather than sorting the folders a second way. A README
// that does not link every module folder falls back to the folder names.
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

// A link written on a source page is relative to that page. The register sits at
// docs/domain/, so every relative target is resolved against the source page and
// rewritten against the register.
function rebaseLinks(text, fromDirectory) {
  return text.replace(/\]\(([^)]+)\)/g, (whole, target) => {
    const trimmed = target.trim();
    if (/^(?:https?:|mailto:|#|\/)/.test(trimmed)) return whole;
    const [filePart, anchor] = trimmed.split('#');
    if (!filePart || (!filePart.endsWith('.md') && !filePart.endsWith('/'))) return whole;
    const resolved = path.posix.normalize(path.posix.join(fromDirectory, filePart));
    const rebased = path.posix.relative(DOCS, resolved);
    return `](${rebased}${anchor ? `#${anchor}` : ''})`;
  });
}

// One sentence may run past the bound. It is split at a clause boundary that
// already carries punctuation, and the coordinating word moves into the new
// sentence. No word of the entry is dropped.
const BOUNDARIES = [
  { marker: '; ', lead: '' },
  { marker: ', and ', lead: 'And ' },
  { marker: ', so ', lead: 'So ' },
  { marker: ', but ', lead: 'But ' },
  { marker: ', or ', lead: 'Or ' },
  { marker: ', then ', lead: 'Then ' },
];

function splitSentence(text, limit) {
  if (words(text).length <= limit) return [text];
  const close = (piece) => {
    const trimmed = piece.replace(/[,;]$/, '').trim();
    return /[.!?]["'`)\]]*$/.test(trimmed) ? trimmed : `${trimmed}.`;
  };
  for (const boundary of BOUNDARIES) {
    const parts = text.split(boundary.marker);
    if (parts.length < 2) continue;
    const pieces = [parts[0]];
    for (let index = 1; index < parts.length; index += 1) pieces.push(boundary.lead + parts[index]);
    const grouped = [];
    let current = '';
    for (const piece of pieces) {
      const candidate = current ? `${current} ${piece}` : piece;
      if (current && words(candidate).length > limit) {
        grouped.push(close(current));
        current = piece;
      } else {
        current = candidate;
      }
    }
    if (current) grouped.push(close(current));
    if (grouped.every((piece) => words(piece).length <= limit)) return grouped;
  }
  return null;
}

// Punctuation comes out of a source sentence, so the first letter moves up.
function capitalize(text) {
  const match = text.match(/^([^\p{L}]*)(\p{L})/u);
  if (!match) return text;
  return `${match[1]}${match[2].toUpperCase()}${text.slice(match[1].length + 1)}`;
}

function rawSentences(text) {
  return text.split(/(?<=[.!?])\s+/).filter(Boolean);
}

function shorten(entryText, limit) {
  const output = [];
  for (const sentence of rawSentences(entryText)) {
    const trimmed = sentence.trim();
    if (words(trimmed).length <= limit) {
      output.push(trimmed);
      continue;
    }
    const split = splitSentence(trimmed, limit);
    if (!split) return null;
    output.push(...split.map((piece, index) => (index === 0 ? piece : capitalize(piece))));
  }
  return output.join(' ');
}

// An entry that the sentence split cannot bring inside the bound is rewritten by
// hand. The key is the entry exactly as the source page states it, so a source
// rewrite makes the override stop matching and the script reports the entry.
const OVERRIDES = new Map([
    // 0: Re-entry within a day is unaddressed. The events that allow re-entry mostly require an exit scan fir...
    ["Re-entry within a day is unaddressed. The events that allow re-entry mostly require an exit scan first, at two re-entries per day at Lollapalooza and Austin City Limits and unlimited at Sziget and inside Bonnaroo's Centeroo, and none of that is representable here.",
        "Re-entry within a day is unaddressed. The events that allow it mostly require an exit scan first. Lollapalooza and Austin City Limits allow two entries a day, Sziget and Bonnaroo's Centeroo allow unlimited, and none of that is representable here."],

    // 1: The delta never adds. A last-minute buyer at a door with no signal is refused until the device downl...
    ["The delta never adds. A last-minute buyer at a door with no signal is refused until the device downloads the set again, which is the case the digest format loses against a signed token and is recorded as such in decision 0013.",
        "The delta never adds. A last-minute buyer at a door with no signal is refused until the device downloads the set again. That is the case the digest format loses against a signed token, recorded in decision 0013."],

    // 2: A purchase spanning several occurrences or sessions is not expressible. Tessitura sells that as a Pa...
    ["A purchase spanning several occurrences or sessions is not expressible. Tessitura sells that as a Package, AudienceView as a subscription, and Spektrix as a Fixed Series; Entro has `BundleDefinition` in [sales](../sales/README.md) and nothing connects it to a series or a session, so a six-week course sold as one item has no model.",
        "A purchase spanning several occurrences or sessions is not expressible. Tessitura sells that as a Package, AudienceView as a subscription, and Spektrix as a Fixed Series. Entro has `BundleDefinition` in [sales](../sales/README.md) and nothing connects it to a series or a session. A six-week course sold as one item has no model."],

    // 3: A cancelled event keeps reminding its buyers. `Event.Cancel` leaves the schedule and the doors time ...
    ["A cancelled event keeps reminding its buyers. `Event.Cancel` leaves the schedule and the doors time intact, `use-case/events.send-due-reminders` checks only that doors have not passed, and cancellation settles orders one at a time afterwards, so a buyer whose order is still `Confirmed` receives \"doors open, your ticket reference is\" for an event that will not happen. An order with no refundable amount is never settled at all, so for a free ticket the window does not close.",
        "A cancelled event keeps reminding its buyers. `Event.Cancel` leaves the schedule and the doors time intact, and `use-case/events.send-due-reminders` checks only that doors have not passed. Cancellation settles orders one at a time afterwards. A buyer whose order is still `Confirmed` receives \"doors open, your ticket reference is\" for an event that will not happen. An order with no refundable amount is never settled, so for a free ticket the window does not close."],

    // 4: Nothing checks the event's state. A cancelled event whose doors have not passed keeps sending "doors...
    ["Nothing checks the event's state. A cancelled event whose doors have not passed keeps sending \"doors open, your ticket reference is\" to every buyer whose order has not yet been settled, and an order with nothing refundable is never settled.",
        "Nothing checks the event's state. A cancelled event whose doors have not passed keeps sending \"doors open, your ticket reference is\" to every buyer whose order is unsettled. An order with nothing refundable is never settled."],

    // 5: The counts the pass returns are not trustworthy where the order paging overlaps: a re-walked order i...
    ["The counts the pass returns are not trustworthy where the order paging overlaps: a re-walked order increments `RemindersSent` again even though the messenger refuses the duplicate.",
        "The counts the pass returns are not trustworthy where the order paging overlaps. A re-walked order increments `RemindersSent` again, even though the messenger refuses the duplicate."],

    // 6: The series has no schedule of its own. Commercial platforms split here: Ticketmaster's Discovery API...
    ["The series has no schedule of its own. Commercial platforms split here: Ticketmaster's Discovery API carries no recurrence rule at all and groups separate events under an attraction, while Eventbrite generates occurrences from an Event Schedule and Universe derives timeslots from a repeat rule bounded by a last-occurrence date. Entro's list is entered by hand, so nothing can tell that the third Thursday of the month is absent.",
        "The series has no schedule of its own. Commercial platforms split here. Ticketmaster's Discovery API carries no recurrence rule and groups separate events under an attraction. Eventbrite generates occurrences from an Event Schedule, and Universe derives timeslots from a repeat rule bounded by a last-occurrence date. Entro's list is entered by hand, so nothing can tell that the third Thursday of the month is absent."],

    // 7: The boundary against `Event` itself is right, and the reason is worth stating so it is not revisited...
    ["The boundary against `Event` itself is right, and the reason is worth stating so it is not revisited. Every platform surveyed keeps the container non-transactional and the occurrence the unit that sells: Spektrix puts the seating plan on the Instance, Vista binds each showtime to one seat layout, and Eventbrite treats event capacity as the total on one time slot. Entro's series sharing nothing is the same split. The one deliberate difference is that Eventbrite propagates a change to a series parent's name, description, currency, capacity, and password down to every occurrence; Entro propagates nothing, so an organizer renaming a run renames the grouping and not the dates.",
        "The boundary against `Event` itself is right, and the reason is worth stating so it is not revisited. Every platform surveyed keeps the container non-transactional and the occurrence the unit that sells. Spektrix puts the seating plan on the Instance, and Vista binds each showtime to one seat layout. Eventbrite treats event capacity as the total on one time slot. Entro's series sharing nothing is the same split. The one deliberate difference is that Eventbrite propagates a series parent's name, description, currency, capacity, and password to every occurrence. Entro propagates nothing, so an organizer renaming a run renames the grouping and not the dates."],

    // 8: Deleting a date from a run is treated differently here than by Eventbrite, which blocks removing an ...
    ["Deleting a date from a run is treated differently here than by Eventbrite, which blocks removing an occurrence that has sales until attendees are refunded or moved. [`use-case/events.detach-event-from-series`](detach-event-from-series.md) always succeeds, which is safe only because Entro's series holds nothing: the date carries on selling under its own event. Whether an organizer expects detaching to mean cancelling is a product question this page cannot settle.",
        "Deleting a date from a run is treated differently here than by Eventbrite. Eventbrite blocks removing an occurrence that has sales until attendees are refunded or moved. [`use-case/events.detach-event-from-series`](detach-event-from-series.md) always succeeds, which is safe only because Entro's series holds nothing. The date carries on selling under its own event. Whether an organizer expects detaching to mean cancelling is a product question this page cannot settle."],

    // 9: `EventCapacity` still does not name this aggregate, and that is now the biggest gap. `EventCapacityS...
    ["`EventCapacity` still does not name this aggregate, and that is now the biggest gap. `EventCapacityScope.Session` carries a `DisplayName` and its uniqueness discriminator is the lower-cased name, so a session capacity is bound to a string rather than to a session identity. The `event-session` reservation makes that string unambiguous within one event and does not connect the two sides: renaming a session through [`use-case/events.reschedule-event-session`](reschedule-event-session.md) leaves its capacity governing the old name, and the reason the old key is never released is precisely that the two are bound by name. Binding the capacity to `EventSessionId` is the fix, and it belongs to [inventory](../../inventory/README.md).",
        "`EventCapacity` still does not name this aggregate, and that is now the biggest gap. `EventCapacityScope.Session` carries a `DisplayName`. Its uniqueness discriminator is the lower-cased name, so a session capacity is bound to a string rather than to a session identity. The `event-session` reservation makes that string unambiguous within one event and does not connect the two sides. Renaming a session through [`use-case/events.reschedule-event-session`](reschedule-event-session.md) leaves its capacity governing the old name. The old key is never released precisely because the two are bound by name. Binding the capacity to `EventSessionId` is the fix, and it belongs to [inventory](../../inventory/README.md)."],

    // 10: The boundary against `Event` is right for the shapes the module claims, with one exception worth nam...
    ["The boundary against `Event` is right for the shapes the module claims, with one exception worth naming. Commercial platforms model a festival day's stages as separate events grouped by a container, not as sessions: Spektrix keeps each festival show as its own Event and Instance and layers a festival-wide capacity over them. So a festival day belongs to [`EventSeries`](../event-series/README.md) plus one event per stage, and `EventSession` is for the timed-entry slot and the workshop slot, which is where Eventbrite and Universe also put the slot as the unit a ticket admits to. Nothing in the model or the [module page](../README.md) says which of the two an organizer should pick.",
        "The boundary against `Event` is right for the shapes the module claims, with one exception worth naming. Commercial platforms model a festival day's stages as separate events grouped by a container, not as sessions. Spektrix keeps each festival show as its own Event and Instance and layers a festival-wide capacity over them. So a festival day belongs to [`EventSeries`](../event-series/README.md) plus one event per stage. `EventSession` is for the timed-entry slot and the workshop slot. That is where Eventbrite and Universe also put the slot as the unit a ticket admits to. Nothing in the model or the [module page](../README.md) says which of the two an organizer should pick."],

    // 11: A course or a run of workshops sold as one purchase has no home. Every platform surveyed sells that ...
    ["A course or a run of workshops sold as one purchase has no home. Every platform surveyed sells that as a bundle spanning performances rather than as a session or a series: Tessitura calls it a Package, AudienceView a subscription, and Spektrix a Fixed Series that books the same seats across Instances. Entro has `BundleDefinition` in [sales](../../sales/README.md) and nothing connects it to sessions, so \"buy all six workshops\" is not expressible.",
        "A course or a run of workshops sold as one purchase has no home. Every platform surveyed sells that as a bundle spanning performances rather than as a session or a series. Tessitura calls it a Package, AudienceView a subscription, and Spektrix a Fixed Series that books the same seats across Instances. Entro has `BundleDefinition` in [sales](../../sales/README.md) and nothing connects it to sessions. \"Buy all six workshops\" is not expressible."],

    // 12: The plan says nothing about the schedule. `EventTemplatePlan` has no schedule field of any kind, so ...
    ["The plan says nothing about the schedule. `EventTemplatePlan` has no schedule field of any kind, so a weekly template cannot express \"doors at 19:00, run 20:00 to 23:00\", which is the part of a recurring event that most wants a default. `EventTemplateRevision`'s own documentation used to claim the snapshot carried \"schedule offsets\"; the comment was corrected to describe the fields the plan actually holds, because the code was right and the comment was not.",
        "The plan says nothing about the schedule. `EventTemplatePlan` has no schedule field of any kind, so a weekly template cannot express \"doors at 19:00, run 20:00 to 23:00\". That window is the part of a recurring event that most wants a default. `EventTemplateRevision`'s own documentation used to claim the snapshot carried \"schedule offsets\". The comment now describes the fields the plan holds, because the code was right and the comment was not."],

    // 13: A collection-only location has no address, which is right for an event desk and means a buyer collec...
    ["A collection-only location has no address, which is right for an event desk and means a buyer collecting from it is told nothing about where to go.",
        "A collection-only location has no address, which is right for an event desk. A buyer collecting from it is told nothing about where to go."],

    // 14: There is no shipping service. A tracking reference is typed in by a human, and no carrier is asked t...
    ["There is no shipping service. A tracking reference is typed in by a human, and no carrier is asked to produce a label or report a delivery. A real carrier integration is the point at which the reaction-based dispatch here becomes a durable workflow, because a carrier call can fail after the stock has been recorded as gone.",
        "There is no shipping service. A tracking reference is typed in by a human, and no carrier is asked to produce a label or report a delivery. A real carrier integration is where the reaction-based dispatch here becomes a durable workflow. A carrier call can fail after the stock has been recorded as gone."],

    // 15: The organizer's payout currency is fixed at creation with no way to change it, which is correct for ...
    ["The organizer's payout currency is fixed at creation with no way to change it, which is correct for existing orders and wrong for an organizer that got it wrong on day one.",
        "The organizer's payout currency is fixed at creation with no way to change it. That is correct for existing orders and wrong for an organizer that got it wrong on day one."],

    // 16: The `organizer_api_keys` document is registered with `UseOptimisticConcurrency(true)`, and every aut...
    ["The `organizer_api_keys` document is registered with `UseOptimisticConcurrency(true)`, and every authenticated call writes it. Two calls presenting one key at the same moment contend on one document. Whether that surfaces as a refused request depends on how Marten tracks versions under the lightweight sessions this deployment uses, which the code does not settle and no test covers.",
        "The `organizer_api_keys` document is registered with `UseOptimisticConcurrency(true)`, and every authenticated call writes it. Two calls presenting one key at the same moment contend on one document. Whether that surfaces as a refused request depends on how Marten tracks versions under the lightweight sessions this deployment uses. The code does not settle that, and no test covers it."],

    // 17: Listing `ticket-delivery`, `ticket-transfer`, or `ticket-code-replaced` texts the door ticket code i...
    ["Listing `ticket-delivery`, `ticket-transfer`, or `ticket-code-replaced` texts the door ticket code in clear text. Those three text bodies carry `{{TicketCode}}`, which is the code a door accepts, over a channel with no transport guarantee and a message history that stays on the handset. Nothing warns the organizer, and no rule treats those three kinds differently from `order-confirmation`.",
        "Listing `ticket-delivery`, `ticket-transfer`, or `ticket-code-replaced` texts the door ticket code in clear text. Those three text bodies carry `{{TicketCode}}`, which is the code a door accepts, over a channel with no transport guarantee. The message history stays on the handset. Nothing warns the organizer, and no rule treats those three kinds differently from `order-confirmation`."],

    // 18: Whether this belongs in `organizers` is worth asking once. It is organizer configuration, scoped to ...
    ["Whether this belongs in `organizers` is worth asking once. It is organizer configuration, scoped to one organizer, and the module already owns the organizer's legal identity and its processor arrangement, so `organizers` is the right home for the record. What sits oddly is that the rule the record exists to serve lives in an infrastructure adapter, which is where the from address is chosen and where the invitation refusal is raised.",
        "Whether this belongs in `organizers` is worth asking once. It is organizer configuration, scoped to one organizer, and the module already owns the organizer's legal identity and its processor arrangement. `organizers` is the right home for the record. What sits oddly is that the rule the record serves lives in an infrastructure adapter. The from address is chosen there, and the invitation refusal is raised there."],

    // 19: Whether the same document needs versions in more than one locale at the same version number, which t...
    ["Whether the same document needs versions in more than one locale at the same version number, which the current model does not express: locale is a property of a version, so a Dutch and an English text are two versions rather than two renderings of one.",
        "Whether the same document needs versions in more than one locale at the same version number is open. The current model does not express it. Locale is a property of a version, so a Dutch and an English text are two versions rather than two renderings of one."],

    // 20: There is one channel kind, `Storefront`. Box office and partner API are reserved vocabulary and deli...
    ["There is one channel kind, `Storefront`. Box office and partner API are reserved vocabulary and deliberately have no code, because a kind with no behavior is a discriminator waiting to be misused.",
        "There is one channel kind, `Storefront`. Box office and partner API are reserved vocabulary and deliberately have no code. A kind with no behavior is a discriminator waiting to be misused."],

    // 21: The price bypasses the pricing calculation. `UnitPrice` is a raw `Money` on the aggregate. Every oth...
    ["The price bypasses the pricing calculation. `UnitPrice` is a raw `Money` on the aggregate. Every other price in this module goes through `SalesPricingDomainService` with `SalesRoundingPolicy` stamped on the result, which is what `policy/pricing-and-rounding.domain-calculation-produces-price-shown-price-recorded-order` requires so the buyer's total matches the charge. A bundle price carries no fee components, no tax basis, no rounding policy, and no quote, so a bundle sold today could not produce an order line in the shape `use-case/orders.place-order` builds.",
        "The price bypasses the pricing calculation. `UnitPrice` is a raw `Money` on the aggregate. Every other price in this module goes through `SalesPricingDomainService` with `SalesRoundingPolicy` stamped on the result. That is what `policy/pricing-and-rounding.domain-calculation-produces-price-shown-price-recorded-order` requires, so the buyer's total matches the charge. A bundle price carries no fee components, no tax basis, no rounding policy, and no quote. A bundle sold today could not produce an order line in the shape `use-case/orders.place-order` builds."],

    // 22: Removing a parent line does not remove the add-on. The documentation says an add-on is removed when ...
    ["Removing a parent line does not remove the add-on. The documentation says an add-on is removed when its parent line is, `RequireEligible` refuses an add-on whose parent is absent at the moment it is checked, and nothing re-checks. A buyer who removes the ticket and keeps the parking space would pass, because no code path checks at all.",
        "Removing a parent line does not remove the add-on. The documentation says an add-on is removed when its parent line is. `RequireEligible` refuses an add-on whose parent is absent at the moment it is checked, and nothing re-checks. A buyer who removes the ticket and keeps the parking space would pass, because no code path checks at all."],

    // 23: Nothing accounts for a liability, and it would be a different aggregate if it did. A sold gift card ...
    ["Nothing accounts for a liability, and it would be a different aggregate if it did. A sold gift card is cash received against a future obligation: a contract liability under IFRS 15 and ASC 606, with breakage recognised in proportion to the pattern of redemptions where the issuer expects to be entitled to it (IFRS 15 B44 to B47; ASC 606-10-55-46 to 55-49, constrained by 606-10-32-11 to 32-13), and recognised as a liability rather than revenue where unclaimed-property law obliges the issuer to remit it. A promotional code has none of that, because no cash was received. Nothing in [finance](../../finance/README.md) knows vouchers exist, `VoucherBatchIssuedEvent` reaches no ledger, and the batch does not record whether its vouchers were sold or given away, which is the fact that decides whether there is a liability at all.",
        "Nothing accounts for a liability, and it would be a different aggregate if it did. A sold gift card is cash received against a future obligation. It is a contract liability under IFRS 15 and ASC 606. Breakage is recognised in proportion to the pattern of redemptions where the issuer expects to be entitled to it. The references are IFRS 15 B44 to B47 and ASC 606-10-55-46 to 55-49, constrained by 606-10-32-11 to 32-13. It is recognised as a liability rather than revenue where unclaimed-property law obliges the issuer to remit it. A promotional code has none of that, because no cash was received. Nothing in [finance](../../finance/README.md) knows vouchers exist, and `VoucherBatchIssuedEvent` reaches no ledger. The batch does not record whether its vouchers were sold or given away. That fact decides whether there is a liability at all."],

    // 24: Expiry means two different things and this aggregate has only one of them. An expiry on a promotiona...
    ["Expiry means two different things and this aggregate has only one of them. An expiry on a promotional code is a marketing schedule the issuer sets freely. An expiry on stored value is a regulated floor on somebody else's money: US Regulation E at 12 CFR 1005.20(e) requires the underlying funds of a gift card to remain valid for at least five years from issue or last load, and Ireland's Consumer Protection (Gift Vouchers) Act 2019 sets a five-year minimum and prohibits requiring the voucher be spent in one transaction, which is a partial-redemption requirement in law. Regulation E excludes loyalty, award, and promotional cards at 1005.20(b)(3), and excludes cards redeemable solely for admission to events or venues at 1005.20(b)(6). A platform issuing real stored value would need the redeemability scope on the instrument, because that is what the legal classification turns on.",
        "Expiry means two different things and this aggregate has only one of them. An expiry on a promotional code is a marketing schedule the issuer sets freely. An expiry on stored value is a regulated floor on somebody else's money. US Regulation E at 12 CFR 1005.20(e) makes gift card funds valid for at least five years from issue or last load. Ireland's Consumer Protection (Gift Vouchers) Act 2019 sets a five-year minimum. It prohibits requiring the voucher be spent in one transaction, which is a partial-redemption requirement in law. Regulation E excludes loyalty, award, and promotional cards at 1005.20(b)(3). It also excludes cards redeemable solely for admission to events or venues at 1005.20(b)(6). A platform issuing real stored value would need the redeemability scope on the instrument, because that is what the legal classification turns on."],

    // 25: The prefix reservation is never released, so a retired batch keeps its prefix for good. That is deli...
    ["The prefix reservation is never released, so a retired batch keeps its prefix for good. That is deliberate: releasing it would let a new batch take the same prefix and mint a code whose full text matched one already redeemed from the retired batch, which is the one way a voucher could be spent twice. The cost is that an organizer cannot reuse a memorable prefix, and it is recorded in [cross-aggregate uniqueness](../../../domain-rules/cross-aggregate-uniqueness.md).",
        "The prefix reservation is never released, so a retired batch keeps its prefix for good. That is deliberate. Releasing it would let a new batch take the same prefix. That new batch would mint a code whose full text matched one already redeemed from the retired batch. That is the one way a voucher could be spent twice. The cost is that an organizer cannot reuse a memorable prefix, and it is recorded in [cross-aggregate uniqueness](../../../domain-rules/cross-aggregate-uniqueness.md)."],

    // 26: This module should not exist. One aggregate deciding who reaches checkout belongs in [sales](../sale...
    ["This module should not exist. One aggregate deciding who reaches checkout belongs in [sales](../sales/README.md) beside access codes, presale windows, and waitlists, which is where every other answer to \"may this buyer buy yet\" already lives. Moving `Domain/Waiting/Queues` to `Domain/Sales/Queues` and renaming the `WAITING.*` codes to `SALES.*` would remove the only module in the domain with one root and its own error prefix. This page mirrors the code as it stands, per `entro/rule/agents.one-shape-per-layer`, and the code is what should move. The move is a rename across four layers plus three failure codes, and it is deliberately not bundled with the work that made the aggregate reachable.",
        "This module should not exist. One aggregate deciding who reaches checkout belongs in [sales](../sales/README.md) beside access codes, presale windows, and waitlists. That is where every other answer to \"may this buyer buy yet\" already lives. Moving `Domain/Waiting/Queues` to `Domain/Sales/Queues` and renaming the `WAITING.*` codes to `SALES.*` would remove the only module in the domain with one root. It is also the only module with its own error prefix. This page mirrors the code as it stands, per `entro/rule/agents.one-shape-per-layer`, and the code is what should move. The move is a rename across four layers plus three failure codes. It is deliberately not bundled with the work that made the aggregate reachable."],

    // 27: There is no bot mitigation beyond the checkout rate-limit policy. Queue-it's published telemetry fro...
    ["There is no bot mitigation beyond the checkout rate-limit policy. Queue-it's published telemetry from one on-sale reports over 95 percent of traffic denied as untrusted, 3.32 million requests against 138,000 verified visitors, with one individual opening a presale link 31,325 times. Imperva's 2025 report puts bad bots at 37 percent of all internet traffic for 2024, so the on-sale minute is an order of magnitude worse than the average and nothing here treats it differently.",
        "There is no bot mitigation beyond the checkout rate-limit policy. Published telemetry from Queue-it reports, for one on-sale, over 95 percent of traffic denied as untrusted, 3.32 million requests against 138,000 verified visitors. One individual opened a presale link 31,325 times. Imperva's 2025 report puts bad bots at 37 percent of all internet traffic for 2024. The on-sale minute is an order of magnitude worse than that average, and nothing here treats it differently."],

    // 28: A buyer has no identity in the queue. `Join` takes a time and nothing else, so nothing stops one per...
    ["A buyer has no identity in the queue. `Join` takes a time and nothing else, so nothing stops one person taking a hundred places and nothing links a position to an account, a session, or a device, which leaves a per-buyer limit with nothing to hang on. The pass proves which position it was minted for and not who holds it.",
        "A buyer has no identity in the queue. `Join` takes a time and nothing else. Nothing stops one person taking a hundred places, and nothing links a position to an account, a session, or a device. A per-buyer limit has nothing to hang on. The pass proves which position it was minted for and not who holds it."],

    // 29: There is no bot mitigation of any kind, and the on-sale minute is the adversarial peak rather than t...
    ["There is no bot mitigation of any kind, and the on-sale minute is the adversarial peak rather than the average. Queue-it's published telemetry from one household-name on-sale reports 3.32 million requests denied as untrusted against 138,000 verified visitors, which is over 95 percent of traffic, blocked 40 percent by data-centre address, 24 percent by CAPTCHA failure, and 32 percent for holding no invitation; one individual opened a presale link 31,325 times. Imperva's 2025 Bad Bot Report puts bad bots at 37 percent of all internet traffic for 2024, so provisioning a defence against the annual average under-provisions the on-sale by more than an order of magnitude. Nothing here challenges, fingerprints, or rate-shapes beyond the checkout rate-limit policy on the two buyer endpoints.",
        "There is no bot mitigation of any kind, and the on-sale minute is the adversarial peak rather than the average. Published telemetry from Queue-it reports, for one household-name on-sale, 3.32 million requests denied as untrusted against 138,000 verified visitors. That is over 95 percent of traffic, blocked 40 percent by data-centre address, 24 percent by CAPTCHA failure, and 32 percent for holding no invitation. One individual opened a presale link 31,325 times. Imperva's 2025 Bad Bot Report puts bad bots at 37 percent of all internet traffic for 2024. Provisioning a defence against that annual average under-provisions the on-sale by more than an order of magnitude. Nothing here challenges, fingerprints, or rate-shapes beyond the checkout rate-limit policy on the two buyer endpoints."],

    // 30: The pass carries the position and is verified statelessly, which is the same shape Queue-it uses (HM...
    ["The pass carries the position and is verified statelessly, which is the same shape Queue-it uses (HMAC-SHA256 over a token body with a shared secret) and Shopify uses (a securely signed cookie carrying the buyer's first-attempt timestamp). One platform key signs every room's passes, and separation between on-sales comes from the stretch rather than from a per-room key. There is no key rotation and no key identifier on the pass, so rotating the platform key invalidates every live queue at once.",
        "The pass carries the position and is verified statelessly. Queue-it uses the same shape: HMAC-SHA256 over a token body with a shared secret. Shopify uses a securely signed cookie carrying the buyer's first-attempt timestamp. One platform key signs every room's passes, and separation between on-sales comes from the stretch rather than from a per-room key. There is no key rotation and no key identifier on the pass. Rotating the platform key invalidates every live queue at once."],

    // 31: The eligible listing list is not validated against the organizer at issue time, so a code can name a...
    ["The eligible listing list is not validated against the organizer at issue time, so a code can name a listing belonging to somebody else and will simply never match it. The dashboard says so by naming the listings a code reaches and reporting when none of them is on the event being looked at.",
        "The eligible listing list is not validated against the organizer at issue time. A code can name a listing belonging to somebody else and never match it. The dashboard says so by naming the listings a code reaches. It reports when none of them is on the event being looked at."],

    // 32: Nobody can read the queue. `liveEntryCount` is returned to whoever just joined, and there is no rea...
    ["Nobody can read the queue. `liveEntryCount` is returned to whoever just joined, and there is no read for the organizer, so the person deciding whether to release more quantity cannot see how many people are waiting for it.",
        "Nobody can read the queue. `liveEntryCount` is returned to whoever joined, and there is no read for the organizer. The person deciding whether to release more quantity cannot see how many people are waiting for it."],
]);

function renderEntry(entry, limit) {
  const override = OVERRIDES.get(entry.text);
  const text = override ?? entry.text;
  const shortened = shorten(text, limit);
  if (shortened === null) return null;
  return shortened;
}

// The validator counts a closing quote as its own sentence, so a paragraph is
// split by what it counts rather than by what the source punctuation suggests.
function splitParagraph(text) {
  const parts = rawSentences(text);
  const grouped = [];
  let current = '';
  for (const part of parts) {
    const candidate = current ? `${current} ${part}` : part;
    if (current && sentences(candidate).length > PROSE_PARAGRAPH_SENTENCE_LIMIT) {
      grouped.push(current);
      current = part;
    } else {
      current = candidate;
    }
  }
  if (current) grouped.push(current);
  return grouped;
}

const order = moduleOrder();
const moduleSet = new Set(order);
const collected = new Map();
const problems = [];

for (const file of filesUnder(MODULES)) {
  const rel = relative(file);
  const raw = fs.readFileSync(file, 'utf8');
  const sections = defectSections(raw);
  if (!sections.length) continue;
  const segments = rel.split('/');
  const module = segments[2] === 'modules' ? segments[3] : undefined;
  const group = module && moduleSet.has(module) ? module : 'Register';
  if (!collected.has(group)) collected.set(group, []);
  const fromDirectory = path.posix.dirname(rel);
  for (const section of sections) {
    for (const entry of defectEntries(section.body)) {
      const rendered = renderEntry(entry, PROSE_SENTENCE_LIMIT);
      if (rendered === null) {
        problems.push(`${rel}:${section.line}: cannot render inside the prose bound: ${entry.text}`);
        continue;
      }
      collected.get(group).push({
        page: rel,
        line: section.line,
        text: rendered,
      });
    }
  }
}

for (const entries of collected.values()) entries.sort((left, right) => (left.page === right.page ? left.line - right.line : left.page.localeCompare(right.page)));

const groups = [...order.filter((module) => collected.has(module)), ...(collected.has('Register') ? ['Register'] : [])];

const lead = [
  'Every entry in an `## Open modeling questions` or `## Gaps` section under `docs/domain/modules/`, from module, aggregate, use-case, and register pages.',
  '`entro check defects --fix` regenerates this page.',
  'The source sections stay authoritative.',
  'An entry here is a shortened copy, and the linked page is where the question is answered.',
].join(' ');

const body = [];
body.push('---');
body.push('{');
body.push('  "kind": "section-index",');
body.push('  "id": "defects",');
body.push('  "specStatus": "approved",');
body.push('  "owner": "Entro product and engineering",');
body.push('  "lastReviewed": "2026-09-21"');
body.push('}');
body.push('---');
body.push('# Known defects');
body.push('');
body.push(lead);
for (const group of groups) {
  body.push('');
  body.push(`## ${group === 'Register' ? 'Register' : group}`);
  for (const entry of collected.get(group)) {
    const link = `[${entry.page}](${path.posix.relative(DOCS, entry.page)})`;
    const paragraph = `${link}. ${rebaseLinks(entry.text, path.posix.dirname(entry.page))}`;
    for (const piece of splitParagraph(paragraph)) {
      body.push('');
      body.push(piece);
    }
  }
}
const page = `${body.join('\n')}\n`;

const total = [...collected.values()].reduce((count, entries) => count + entries.length, 0);

if (problems.length) {
  console.error(`audit-defects: ${problems.length} entry/entries have no rendering inside the prose bound:`);
  for (const problem of problems) console.error(`  - ${problem}`);
}
if (fix && problems.length) process.exit(1);

if (fix) {
  fs.writeFileSync(path.join(root, PAGE), page, 'utf8');
  console.log(`audit-defects: wrote ${PAGE}`);
} else {
  const existing = fs.existsSync(path.join(root, PAGE)) ? read(PAGE) : '';
  const current = existing === page;
  for (const group of groups) console.log(`  ${group}: ${collected.get(group).length}`);
  console.log(`audit-defects: ${total} entr(ies) across ${groups.length} group(s).`);
  if (!current) console.log(`audit-defects: ${PAGE} is stale; run --fix.`);
  else console.log(`audit-defects: ${PAGE} is current.`);
  if (check && !current) process.exit(1);
  if (check && problems.length) process.exit(1);
}