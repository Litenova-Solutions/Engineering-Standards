/**
 * Administration screens: Team and roles, API keys and webhooks, data imports, the connected payment account, billing, and discount codes: screens most business applications need in some form.
 */

import {
  COMPANY,
  ORDER,
  PEOPLE,
  STATES,
  alert,
  badge,
  badgeRaw,
  brandMark,
  dialog,
  dropZone,
  emptyState,
  explained,
  facts,
  field,
  formSection,
  input,
  notice,
  pager,
  phead,
  recordRow,
  section,
  select,
  shell,
  statement,
  tabs,
  tile,
  tiles,
  toolbar,
  trail,
  twoCol,
} from "../parts.mjs";

/** An avatar with the person's initials, the way the member rows draw one. */
const asAvatar = (person) => `<span class="as-avatar" aria-hidden="true">${person.initials}</span>`;

/** A person with a name line and a role line, for table cells and rows. */
const asPerson = (person, sub) =>
  `<span class="as-row-person">${asAvatar(person)}<span class="tx"><b>${person.name}</b><small>${sub ?? person.role}</small></span></span>`;

/** One step in a short setup list: number, title, line, done or current. */
const asStep = (n, title, sub, state = "") =>
  `<div class="as-step ${state}"><span class="n" aria-hidden="true">${state === "done" ? "✓" : n}</span><span class="tx"><b>${title}</b><small>${sub}</small></span></div>`;

/** A secret that is shown once, with copy and a warning to store it. */
const asSecret = (value) =>
  `<div class="as-secret"><span class="grow"><span class="as-key">${value}</span></span><button class="btn sm">Copy</button></div>`;

/** A permission matrix: rows of capabilities, columns of roles. */
const asMatrix = (roles, rows) =>
  `<table class="dt as-matrix"><thead><tr><th scope="col">Capability</th>${roles.map((r) => `<th scope="col" class="c">${r}</th>`).join("")}</tr></thead><tbody>${rows
    .map(
      ([cap, ...cells]) =>
        `<tr><td>${cap}</td>${cells
          .map((c) => `<td class="c">${c === true ? '<span class="as-check" aria-label="Granted">✓</span>' : c === false ? '<span class="as-check no" aria-label="Not granted">—</span>' : c}</td>`)
          .join("")}</tr>`,
    )
    .join("")}</tbody></table>`;

/** Category CSS. Every class starts with as-. Tokens only, no colour literals. */
const AS_CSS = /* css */ `
.as-page { display: flex; flex-direction: column; gap: 14px; min-width: 0; }
.as-page > .phead { margin-bottom: 0; }
.as-page > .toolbar { margin-bottom: 0; }
.as-key { font-family: var(--font-mono); font-size: 12px; overflow-wrap: anywhere; }
.as-secret { display: flex; align-items: center; gap: 10px; border: 1px dashed var(--input); border-radius: var(--radius-sm); padding: 10px 12px; background: var(--muted); }
.as-secret .grow { min-width: 0; }
.as-matrix td.c, .as-matrix th.c { text-align: center; }
.as-check { font-weight: 700; }
.as-check.no { color: var(--muted-foreground); font-weight: 400; }
.as-invoice { border: 1px solid var(--border); border-radius: var(--radius); background: var(--card); padding: 18px; display: flex; flex-direction: column; gap: 12px; }
.as-invoice .head { display: flex; gap: 12px; align-items: flex-start; flex-wrap: wrap; }
.as-map { display: grid; grid-template-columns: minmax(0, 1fr) 34px minmax(0, 1fr); gap: 8px; align-items: center; }
.as-step { display: flex; gap: 10px; align-items: flex-start; padding: 9px 0; border-bottom: 1px solid var(--border); }
.as-step:last-child { border-bottom: 0; }
.as-step .n { width: 22px; height: 22px; border-radius: 50%; border: 1px solid var(--input); display: grid; place-items: center; font-size: 11px; font-weight: 600; flex: none; }
.as-step.done .n { background: var(--foreground); color: var(--background); border-color: var(--foreground); }
.as-step .tx b { display: block; font-weight: 500; }
.as-step .tx small { display: block; color: var(--muted-foreground); font-size: 11.5px; }
.as-avatar { width: 26px; height: 26px; border-radius: 50%; background: var(--muted); display: inline-grid; place-items: center; font-size: 10px; font-weight: 600; flex: none; }
.as-row-person { display: flex; gap: 9px; align-items: center; min-width: 0; }
.as-row-person .tx b { display: block; font-weight: 500; }
.as-row-person .tx small { display: block; color: var(--muted-foreground); font-size: 11.5px; }
@media (max-width: 640px) {
  .as-map { grid-template-columns: minmax(0, 1fr); gap: 2px; }
}
`;

export const CATEGORY_ADMIN_SCREENS = {
  css: AS_CSS,
  items: [
    {
      id: "as-team-roles",
      title: "The team and what each person may do",
      why: "The team is who works for the company, and a role is what each of them may do. The owner invites people, grants roles, limits some to one warehouse, and suspends or removes them, while everyone else sees the team by name and role and nothing more.",
      verdict:
        "The members table with the invitations below is the best option: it shows who is in, who is invited, and what each may do on one page. The permission matrix is the runner-up, and prefer it on the role page where capabilities are compared. Never ship the matrix as the team page, because the back office manages people, not capabilities.",
      variants: [
        {
          name: "Members with the invitations below",
          pick: true,
          reference: "Linear",
          rationale:
            "Linear lists members with their role and state in line and pending invitations below, because joining and belonging are one list with two states. The owner acts on a row without opening it.",
          tradeoff:
            "Row commands for suspend, remove, change role and limit access cannot all fit, so most move into a menu per row.",
          html: shell(
            "Team",
            `<div class="page as-page">
  ${phead("Team", `${COMPANY.name} · 5 members · 2 invitations outstanding`, '<button class="btn primary">Invite member</button>', { crumb: trail("Settings", "Team") })}
  ${section(
    "",
    `<table class="dt">
  <thead><tr><th scope="col">Member</th><th scope="col">Role</th><th scope="col">Access</th><th scope="col">State</th><th scope="col"></th></tr></thead>
  <tbody>
    <tr><td>${asPerson(PEOPLE.owner)}</td><td>Owner</td><td>Everything</td><td>${badgeRaw("Active", "positive")}</td><td class="num"><button class="btn sm">Manage</button></td></tr>
    <tr><td>${asPerson(PEOPLE.manager)}</td><td>Operations manager</td><td>Everything</td><td>${badgeRaw("Active", "positive")}</td><td class="num"><button class="btn sm">Manage</button></td></tr>
    <tr><td>${asPerson(PEOPLE.finance)}</td><td>Finance</td><td>Everything</td><td>${badgeRaw("Active", "positive")}</td><td class="num"><button class="btn sm">Manage</button></td></tr>
    <tr><td>${asPerson(PEOPLE.warehouse)}</td><td>Warehouse lead</td><td>Amsterdam warehouse only</td><td>${badgeRaw("Active", "positive")}</td><td class="num"><button class="btn sm">Manage</button></td></tr>
    <tr><td>${asPerson(PEOPLE.support)}</td><td>Support</td><td>Everything</td><td>${badgeRaw("Suspended", "caution")}</td><td class="num"><button class="btn sm">Manage</button></td></tr>
  </tbody>
</table>`,
    { flush: true },
  )}
  ${section("Invitations · 2", `<div class="rlist">${recordRow({ title: "lina.meyer@example.org", sub: "Invited as Picker by Alex Morgan · 6 Oct · expires 13 Oct", state: { label: "Sent", tone: "info" }, actions: '<button class="btn sm">Resend</button><button class="btn sm">Cancel</button>' })}${recordRow({ title: "yusuf.kaya@example.org", sub: "Invited as Picker by Alex Morgan · 6 Oct · expires 13 Oct", state: { label: "Sent", tone: "info" }, actions: '<button class="btn sm">Resend</button><button class="btn sm">Cancel</button>' })}</div>`)}
</div>`,
            "Settings",
          ),
        },
        {
          name: "Permission matrix per role",
          reference: "GitHub",
          rationale:
            "GitHub compares team roles in a capability matrix, which answers what a role may do without opening each one. The matrix is the honest shape for custom roles.",
          tradeoff:
            "Capabilities multiply past twenty, so the matrix needs grouping by area and is a reference rather than a page.",
          html: shell(
            "Roles",
            `<div class="page as-page">
  ${phead("Roles", `${COMPANY.name} · 4 custom roles beside the owner`, '<button class="btn primary">New role</button>', { crumb: trail("Settings", "Team", "Roles") })}
  ${section("What each role may do", asMatrix(["Manager", "Finance", "Warehouse lead", "Support"], [["Read orders and customers", true, true, true, true], ["Refund an order", false, true, false, false], ["Dispatch from the warehouse", false, false, true, false], ["Change prices", true, false, false, false], ["Invite members", true, false, false, false], ["Read invoices", true, true, false, false]]), { flush: true })}
  ${notice("info", "Warehouse staff dispatch goods and record it. Only Finance refunds. The owner holds every capability and cannot be removed.")}
</div>`,
            "Settings",
          ),
        },
        {
          name: "Inviting one member in a dialog",
          reference: "Clerk",
          rationale:
            "Clerk invites with address, role and scope in one dialog, because an invitation is one decision with three fields. The scope line limits warehouse staff to one building at the point of inviting.",
          tradeoff:
            "Inviting a whole seasonal crew means repeating the dialog per person, so bulk inviting needs a different shape.",
          html: shell(
            "Team",
            `<div class="page as-page">
  ${phead("Team", `${COMPANY.name} · 5 members · 2 invitations outstanding`, "", { crumb: trail("Settings", "Team") })}
  ${section("", `<div class="rlist">${recordRow({ title: "Sam Rivera", sub: "Owner · everything", state: { label: "Active", tone: "positive" } })}${recordRow({ title: "Alex Morgan", sub: "Operations manager · everything", state: { label: "Active", tone: "positive" } })}</div>`)}
  ${dialog("Invite member", `<div class="stack">${field("Email address", input("", { placeholder: "lina.meyer@example.org" }))}${field("Role", select("Picker", ["Operations manager", "Finance", "Warehouse lead", "Picker", "Support"]))}${field("Access", select("Amsterdam warehouse only", ["Everything", "Amsterdam warehouse only"]), { help: "Warehouse staff are limited to the building they work in." })}<p class="note tight">The invitation expires in 7 days. The member signs in and the role applies at once.</p></div>`, { footer: '<button class="btn">Cancel</button><button class="btn primary">Send invitation</button>' })}
</div>`,
            "Settings",
          ),
        },
        {
          name: "Warehouse-scoped staff cards",
          reference: "Vercel",
          rationale:
            "Vercel scopes team access per project, which fits seasonal staff who work one warehouse and nothing else. The card names the building, the role and the end of the access.",
          tradeoff:
            "Staff cards separate from the member list split the team into two places, and the owner checks both.",
          html: shell(
            "Team",
            `<div class="page as-page">
  ${phead("Team", `${COMPANY.name} · seasonal staff work one warehouse`, '<button class="btn primary">Invite staff</button>', { crumb: trail("Settings", "Team") })}
  ${section("Amsterdam warehouse", `<div class="rlist">${recordRow({ title: "Chris Novak", sub: "Warehouse lead · access ends 31 Mar", state: { label: "Active", tone: "positive" }, actions: '<button class="btn sm">Remove</button>' })}${recordRow({ title: "lina.meyer@example.org", sub: "Invited as Picker · expires 13 Oct", state: { label: "Invited", tone: "info" }, actions: '<button class="btn sm">Resend</button>' })}${recordRow({ title: "yusuf.kaya@example.org", sub: "Invited as Picker · expires 13 Oct", state: { label: "Invited", tone: "info" }, actions: '<button class="btn sm">Resend</button>' })}</div>`)}
  ${notice("info", "Seasonal access ends on the date on the card. Nothing is removed by hand.")}
</div>`,
            "Settings",
          ),
        },
        {
          name: "Suspending a member with the reason",
          reference: "GitHub",
          rationale:
            "GitHub suspends with the reason recorded, because a suspension is reviewed later and the reason is the review. The dialog states what the member keeps and what stops.",
          tradeoff:
            "A dialog per member action means suspend, remove, reinstate and transfer ownership each carry their own copy to maintain.",
          html: shell(
            "Team",
            `<div class="page as-page" style="position:relative;min-height:520px">
  ${phead("Team", `${COMPANY.name} · 5 members`, "", { crumb: trail("Settings", "Team") })}
  ${section("", `<div class="rlist">${recordRow({ title: "Jordan Lee", sub: "Support · everything", state: { label: "Active", tone: "positive" }, actions: '<button class="btn sm">Suspend</button>' })}</div>`)}
  ${dialog("Suspend Jordan Lee", `<div class="stack"><p>Sign-in stops at once. Open work stays assigned until it is moved.</p>${field("Reason", input("", { placeholder: "Why is this account suspended?" }), { help: "Recorded in the audit trail. Required." })}${facts([["Assigned refunds", "2 open · move them first"], ["History", "Kept · nothing is deleted"]], { stacked: true })}</div>`, { footer: '<button class="btn">Cancel</button><button class="btn danger">Suspend member</button>' })}
</div>`,
            "Settings",
          ),
        },
        {
          name: "The team as a member without controls sees it",
          reference: "Linear",
          rationale:
            "Linear shows the member list without controls to members who cannot manage, because the names and roles are shared and the commands are not. The page is the same shape with the commands gone.",
          tradeoff:
            "A read-only page that looks like the managing page invites clicking where nothing happens, so the missing commands need no visible husk.",
          html: shell(
            "Team",
            `<div class="page as-page">
  ${phead("Team", `${COMPANY.name} · 5 members`, "", { crumb: trail("Settings", "Team") })}
  ${section("", `<div class="rlist">${recordRow({ title: "Sam Rivera", sub: "Owner", state: null })}${recordRow({ title: "Alex Morgan", sub: "Operations manager", state: null })}${recordRow({ title: "Priya Shah", sub: "Finance", state: null })}${recordRow({ title: "Chris Novak", sub: "Warehouse lead · Amsterdam warehouse only", state: null })}${recordRow({ title: "Jordan Lee", sub: "Support", state: null })}</div>`)}
  ${notice("info", "Only the owner manages the team. Membership states and invitations are not shown here.")}
</div>`,
            "Settings",
          ),
        },
      ],
    },
    {
      id: "as-api-keys",
      title: "API keys and webhooks",
      why: "The company's own systems read the product through API keys and learn about orders through webhooks. A key's secret is shown once and never again, and each webhook delivery names whether it arrived, because a missed order update is money unaccounted for.",
      verdict:
        "The keys table with the shown-once dialog is the best option: the list states the grants and the dialog protects the secret. The endpoint with its delivery log is the runner-up, and prefer it on the webhooks tab where deliveries are the work. Never show the secret anywhere except the creation dialog, because a secret that can be read again is not a secret.",
      variants: [
        {
          name: "Keys table with the grants in line",
          pick: true,
          reference: "Stripe",
          rationale:
            "The Stripe Dashboard lists API keys with their grants, creation and last use, because the back office asks what a key may do and whether it is still used. Revoke and rotate sit on the row.",
          tradeoff:
            "Grants in line fit only as short labels, so the full grant list lives on the key page one click down.",
          html: shell(
            "Developers",
            `<div class="page as-page">
  ${phead("Developers", "API keys, webhooks and embedding origins.", '<button class="btn primary">Create key</button>', { crumb: trail("Settings", "Developers") })}
  ${tabs(["API keys", "Webhooks", "Origins"], 0)}
  ${section(
    "",
    `<table class="dt">
  <thead><tr><th scope="col">Key</th><th scope="col">Grants</th><th scope="col">Last used</th><th scope="col">State</th><th scope="col"></th></tr></thead>
  <tbody>
    <tr><td><b>Counter sync</b><br><small class="muted mono">acme_live_…8H2K · created 12 Jan by Sam Rivera</small></td><td>Read orders, read products</td><td class="nowrap">8 Oct, 09:31</td><td>${badgeRaw("Live", "positive")}</td><td class="num"><button class="btn sm">Rotate</button></td></tr>
    <tr><td><b>Accounting export</b><br><small class="muted mono">acme_live_…4M9Q · created 3 Feb by Priya Shah</small></td><td>Read invoices</td><td class="nowrap">1 Oct, 07:00</td><td>${badgeRaw("Live", "positive")}</td><td class="num"><button class="btn sm">Rotate</button></td></tr>
    <tr><td><b>Old storefront</b><br><small class="muted mono">acme_live_…1B7T · created 10 Jan by Sam Rivera</small></td><td>Read orders</td><td class="nowrap">Never used</td><td>${badgeRaw("Revoked", "neutral")}</td><td class="num"><button class="btn sm">Open</button></td></tr>
  </tbody>
</table>`,
    { flush: true },
  )}
</div>`,
            "Settings",
          ),
        },
        {
          name: "The secret, shown once",
          reference: "GitHub",
          rationale:
            "GitHub shows a new token once with copy front and centre, because the secret cannot be read again. The dialog states the grants so the back office stores the right secret against the right system.",
          tradeoff:
            "A secret shown once is lost when the owner closes the dialog too soon, and the only repair is revoking and creating again.",
          html: shell(
            "Developers",
            `<div class="page as-page">
  ${phead("Developers", "API keys, webhooks and embedding origins.", "", { crumb: trail("Settings", "Developers") })}
  ${tabs(["API keys", "Webhooks", "Origins"], 0)}
  ${section("", `<div class="rlist">${recordRow({ title: "Counter sync", sub: "acme_live_…8H2K · read orders, read products", state: { label: "Live", tone: "positive" } })}${recordRow({ title: "Warehouse display", sub: "acme_live_…9P4R · created just now", state: { label: "Live", tone: "positive" } })}</div>`)}
  ${dialog("Copy the secret now", `<div class="stack"><p>Grants: read dispatch state. Created by Alex Morgan just now.</p>${asSecret("acme_live_9P4R2M7Q8H2K5T1BX6DW")}<p class="note tight">This secret is shown once. It cannot be read again after this dialog closes. Store it in the warehouse display, not in mail.</p></div>`, { footer: '<button class="btn primary">Secret stored, close</button>' })}
</div>`,
            "Settings",
          ),
        },
        {
          name: "Webhook endpoints with their deliveries",
          reference: "Svix",
          rationale:
            "Svix draws each endpoint with its recent deliveries and their states, because the back office asks whether an update arrived. A failed delivery carries its next retry and a replay command.",
          tradeoff:
            "Deliveries multiply into the thousands on a busy day, so the list needs the endpoint as a filter and aggressive paging.",
          html: shell(
            "Developers",
            `<div class="page as-page">
  ${phead("Webhooks", "The addresses order updates are posted to.", '<button class="btn primary">Register endpoint</button>', { crumb: trail("Settings", "Developers", "Webhooks") })}
  ${section(`<span class="as-key">https://counter.acme-supply.example/hooks</span> ${badgeRaw("Live", "positive")}`, `<div class="rlist">${recordRow({ title: "order.paid · " + ORDER.number, sub: "8 Oct, 09:32 · answered 200 in 180 ms", state: { label: "Delivered", tone: "positive" } })}${recordRow({ title: "delivery.collected · SO-1039", sub: "7 Oct, 17:40 · answered 200 in 140 ms", state: { label: "Delivered", tone: "positive" } })}${recordRow({ title: "order.paid · SO-1041", sub: "8 Oct, 09:30 · no answer · retries 3 of 5", state: { label: "Retrying", tone: "caution" }, actions: '<button class="btn sm">Replay</button>' })}</div>`)}
  ${section(`<span class="as-key">https://accounts.acme-supply.example/hooks</span> ${badgeRaw("Paused", "caution")}`, `<p class="note">Paused by Priya Shah on 1 Oct. Deliveries queue until it is resumed. <button class="btn sm">Resume</button></p>`)}
</div>`,
            "Settings",
          ),
        },
        {
          name: "Grant picker on a new key",
          reference: "GitHub",
          rationale:
            "GitHub scopes a new token with grouped checkboxes, because a key should hold the least it needs. The groups name the areas so the owner grants by area rather than by capability.",
          tradeoff:
            "Grouped grants hide the exact capabilities, so a careful owner opens each group and the dialog grows long.",
          html: shell(
            "Developers",
            `<div class="page as-page">
  ${phead("Developers", "API keys, webhooks and embedding origins.", "", { crumb: trail("Settings", "Developers") })}
  ${tabs(["API keys", "Webhooks", "Origins"], 0)}
  ${section("", `<div class="rlist">${recordRow({ title: "Counter sync", sub: "acme_live_…8H2K · read orders, read products", state: { label: "Live", tone: "positive" } })}</div>`)}
  ${dialog("Create API key", `<div class="stack">${field("Name", input("", { placeholder: "Warehouse display" }), { help: "The system that holds the secret." })}<div class="stack sm"><label class="check"><input type="checkbox" checked><span>Read orders and products<span class="cd">What the counter sync holds.</span></span></label><label class="check"><input type="checkbox"><span>Read dispatch state<span class="cd">For the warehouse display.</span></span></label><label class="check"><input type="checkbox"><span>Read invoices<span class="cd">For the accounting export.</span></span></label><label class="check"><input type="checkbox" disabled><span>Refund an order<span class="cd">No key holds this. Only people refund.</span></span></label></div></div>`, { footer: '<button class="btn">Cancel</button><button class="btn primary">Create key</button>' })}
</div>`,
            "Settings",
          ),
        },
        {
          name: "Rotating a key that may have leaked",
          reference: "Vercel",
          rationale:
            "Vercel rotates with the old secret kept briefly, because the systems holding it need time to move. The dialog states the overlap and what happens to in-flight calls.",
          tradeoff:
            "An overlap keeps a leaked secret valid for its window, so the length of the overlap is a second decision with its own risk.",
          html: shell(
            "Developers",
            `<div class="page as-page">
  ${phead("Developers", "API keys, webhooks and embedding origins.", "", { crumb: trail("Settings", "Developers") })}
  ${tabs(["API keys", "Webhooks", "Origins"], 0)}
  ${section("", `<div class="rlist">${recordRow({ title: "Counter sync", sub: "acme_live_…8H2K · may be in a shared mailbox", state: { label: "Live", tone: "positive" }, actions: '<button class="btn sm">Rotate</button>' })}</div>`)}
  ${dialog("Rotate Counter sync", `<div class="stack"><p>A new secret is issued at once. The old secret works for 24 hours so the counter can move over.</p>${facts([["New secret", "Shown once, on the next screen"], ["Old secret", "Works until 9 Oct, 09:32"], ["Grants", "Unchanged · read orders, read products"]], { stacked: true })}</div>`, { footer: '<button class="btn">Cancel</button><button class="btn primary">Rotate key</button>' })}
</div>`,
            "Settings",
          ),
        },
        {
          name: "Embedding origins beside the keys",
          reference: "Clerk",
          rationale:
            "Clerk lists allowed origins beside the keys, because the checkout runs on the company's pages and nowhere else. Each origin names where it is used.",
          tradeoff:
            "Origins are a third concern on a developers page, and keys, webhooks and origins together crowd one set of tabs.",
          html: shell(
            "Developers",
            `<div class="page as-page">
  ${phead("Developers", "API keys, webhooks and embedding origins.", '<button class="btn primary">Add origin</button>', { crumb: trail("Settings", "Developers") })}
  ${tabs(["API keys", "Webhooks", "Origins"], 2)}
  ${section("", `<div class="rlist">${recordRow({ title: '<span class="as-key">https://shop.acme-supply.example</span>', sub: "The storefront checkout", state: { label: "Allowed", tone: "positive" }, actions: '<button class="btn sm">Remove</button>' })}${recordRow({ title: '<span class="as-key">https://www.acme-supply.example</span>', sub: "Embedded product pages", state: { label: "Allowed", tone: "positive" }, actions: '<button class="btn sm">Remove</button>' })}${recordRow({ title: '<span class="as-key">https://preview.acme-supply.example</span>', sub: "Added by Alex Morgan for testing · 6 Oct", state: { label: "Allowed", tone: "positive" }, actions: '<button class="btn sm">Remove</button>' })}</div>`)}
  ${notice("info", "The checkout refuses any page not listed here. Changes apply at once.")}
</div>`,
            "Settings",
          ),
        },
      ],
    },
    {
      id: "as-data-imports",
      title: "Bringing data from spreadsheets",
      why: "Contacts, budget lines and newsletter consents arrive from the spreadsheets the company used before this product. Each import names what was brought in, what was refused and why, and the back office fixes the refused rows without importing the file twice.",
      verdict:
        "The imports table with the refused rows below is the best option: the history and the repairs sit on one page. The column mapping is the runner-up, and prefer it at import time where the match is decided. Never ship the dropzone alone, because an import without its refused rows hides the work it creates.",
      variants: [
        {
          name: "Imports with the refused rows below",
          pick: true,
          reference: "Shopify",
          rationale:
            "Shopify shows an import with its failed rows and the reason per row, because the file is never clean. The back office repairs the rows without touching what already imported.",
          tradeoff:
            "Refused rows from several imports pile up, so each import needs its refused rows grouped under it rather than in one list.",
          html: shell(
            "Data imports",
            `<div class="page as-page">
  ${phead("Data imports", "What was brought in from spreadsheets, and what came of it.", '<button class="btn primary">Register import</button>', { crumb: trail("Settings", "Data imports") })}
  ${section(
    "",
    `<table class="dt">
  <thead><tr><th scope="col">File</th><th scope="col">Brought in</th><th scope="col" class="num">Accepted</th><th scope="col" class="num">Refused</th><th scope="col">State</th></tr></thead>
  <tbody>
    <tr><td><b>contacts-2026-01.csv</b><br><small class="muted">12 Jan · by Alex Morgan</small></td><td>Contacts</td><td class="num">1,204</td><td class="num">18</td><td>${badgeRaw("Done with refusals", "caution")}</td></tr>
    <tr><td><b>budget-q1.csv</b><br><small class="muted">15 Jan · by Priya Shah</small></td><td>Budget lines</td><td class="num">46</td><td class="num">0</td><td>${badgeRaw("Done", "positive")}</td></tr>
    <tr><td><b>newsletter-consents.csv</b><br><small class="muted">20 Jan · by Alex Morgan</small></td><td>Consents</td><td class="num">0</td><td class="num">312</td><td>${badgeRaw("Refused", "destructive")}</td></tr>
  </tbody>
</table>`,
    { flush: true },
  )}
  ${section("Refused rows · contacts-2026-01.csv", `<div class="rlist">${recordRow({ title: "Row 44 · no address", sub: "Name present, email address missing. Nothing to write to.", actions: '<button class="btn sm">Drop row</button>' })}${recordRow({ title: "Row 207 · address already held", sub: "maria@garcia-interiors.example is already a contact. Update it instead.", actions: '<button class="btn sm">Update contact</button>' })}${recordRow({ title: "Row 309 · consent missing", sub: "No consent column value. Consent cannot be assumed.", actions: '<button class="btn sm">Drop row</button>' })}</div>`)}
</div>`,
            "Settings",
          ),
        },
        {
          name: "Matching columns to fields",
          reference: "Mailchimp",
          rationale:
            "Mailchimp matches spreadsheet columns to fields before importing, because the file's names never equal the system's. Each row pairs one column with one field and the back office corrects the guesses.",
          tradeoff:
            "A wide file means twenty mapping rows, so the page needs the unmatched columns first and the matched ones collapsed.",
          html: shell(
            "Data imports",
            `<div class="page as-page">
  ${phead("Register import", "contacts-2026-01.csv · 1,222 rows · match the columns.", '<button class="btn primary">Import 1,222 rows</button>', { crumb: trail("Settings", "Data imports", "Register") })}
  ${section(
    "Column mapping",
    `<div class="stack">
      <div class="as-map"><span><b>Voornaam</b><br><small class="muted">Maria, Tom, Ade…</small></span><span class="muted" aria-hidden="true">→</span><span>${select("First name", ["First name", "Last name", "Email address", "Phone", "Ignore"])}</span></div>
      <div class="as-map"><span><b>Achternaam</b><br><small class="muted">Garcia, Becker, Okafor…</small></span><span class="muted" aria-hidden="true">→</span><span>${select("Last name", ["First name", "Last name", "Email address", "Phone", "Ignore"])}</span></div>
      <div class="as-map"><span><b>E-mail</b><br><small class="muted">maria@garcia-interiors.example…</small></span><span class="muted" aria-hidden="true">→</span><span>${select("Email address", ["First name", "Last name", "Email address", "Phone", "Ignore"])}</span></div>
      <div class="as-map"><span><b>Opmerkingen</b><br><small class="muted">Free text, mixed</small></span><span class="muted" aria-hidden="true">→</span><span>${select("Ignore", ["First name", "Last name", "Email address", "Phone", "Ignore"])}</span></div>
    </div>`,
  )}
</div>`,
            "Settings",
          ),
        },
        {
          name: "Dropzone with the template beside it",
          reference: "Intercom",
          rationale:
            "Intercom pairs the upload with the template download, because the file imports cleanly only when it starts from the template. The back office downloads, fills and drops in one loop.",
          tradeoff:
            "The template covers one kind of import, so contacts, budget lines and consents each need their own and the page lists three.",
          html: shell(
            "Data imports",
            `<div class="page as-page">
  ${phead("Register import", "Bring contacts, budget lines or consents from a spreadsheet.", "", { crumb: trail("Settings", "Data imports", "Register") })}
  ${twoCol(
    section("Upload the file", `${dropZone("Drop the spreadsheet here", "CSV or Excel · at most 5,000 rows · first row holds the column names.")}<div class="btnrow" style="margin-top:12px"><button class="btn sm">Choose file</button></div>`),
    section("Start from the template", `<div class="rlist">${recordRow({ title: "Contacts template", sub: "First name, last name, email, phone, consent", actions: '<button class="btn sm">Download</button>' })}${recordRow({ title: "Budget lines template", sub: "Label, amount, month", actions: '<button class="btn sm">Download</button>' })}${recordRow({ title: "Consents template", sub: "Email, consent, date", actions: '<button class="btn sm">Download</button>' })}</div>`),
  )}
</div>`,
            "Settings",
          ),
        },
        {
          name: "Dry run before the import",
          reference: "Stripe",
          rationale:
            "Stripe shows a dry run before a bulk change lands, because the back office should read the damage before it is done. The preview counts accepts, refusals and updates without writing anything.",
          tradeoff:
            "A dry run doubles the reads on a large file, so files over 5,000 rows are refused before the preview rather than during it.",
          html: shell(
            "Data imports",
            `<div class="page as-page">
  ${phead("Register import", "contacts-2026-01.csv · dry run · nothing written yet.", '<button class="btn primary">Import 1,204 rows</button>', { crumb: trail("Settings", "Data imports", "Register") })}
  ${tiles(tile("Accepted", "1,204", "new contacts"), tile("Refused", "18", "see the rows below"), tile("Repairable", "4", "by updating the contact"))}
  ${section("Why 18 rows are refused", `<div class="rlist">${recordRow({ title: "12 rows · address missing", sub: "Rows 44, 61, 88 and 9 more. Nothing to write to.", actions: '<button class="btn sm">Drop rows</button>' })}${recordRow({ title: "4 rows · address already held", sub: "Rows 207, 402, 511, 690. Repaired by updating the contact.", actions: '<button class="btn sm">Update all 4</button>' })}${recordRow({ title: "2 rows · consent missing", sub: "Rows 309, 700. Consent cannot be assumed.", actions: '<button class="btn sm">Drop rows</button>' })}</div>`)}
</div>`,
            "Settings",
          ),
        },
        {
          name: "Repairing one refused row",
          reference: "Shopify",
          rationale:
            "Shopify repairs a failed row where it lists it, because the fix is one field and the context is the row. The dialog shows the refusal reason above the fields.",
          tradeoff:
            "One dialog per row is slow when eighteen rows share one cause, so the common causes need bulk commands too.",
          html: shell(
            "Data imports",
            `<div class="page as-page">
  ${phead("Data imports", "What was brought in from spreadsheets, and what came of it.", "", { crumb: trail("Settings", "Data imports") })}
  ${section("Refused rows · contacts-2026-01.csv", `<div class="rlist">${recordRow({ title: "Row 207 · address already held", sub: "maria@garcia-interiors.example is already a contact.", actions: '<button class="btn sm primary">Repair</button>' })}</div>`)}
  ${dialog("Repair row 207", `<div class="stack"><p>maria@garcia-interiors.example is already a contact, imported 12 Jan. Importing again would create a duplicate.</p>${field("First name", input("Maria"))}${field("Phone", input("", { placeholder: "+31 6 1234 5678" }), { help: "The contact holds no phone number. This fills it." })}<div class="btnrow"><button class="btn sm">Update contact</button><button class="btn sm">Drop row</button></div></div>`, { footer: '<button class="btn">Close</button>' })}
</div>`,
            "Settings",
          ),
        },
        {
          name: "Consent import refused outright",
          reference: "Customer.io",
          rationale:
            "Customer.io refuses a consent file without proof, because consent cannot be assumed and the fine lands on the company. The page states the rule and the repair rather than a partial import.",
          tradeoff:
            "Refusing the whole file for some bad rows discards the good ones too, so the back office fixes and re-imports rather than continuing.",
          html: shell(
            "Data imports",
            `<div class="page as-page">
  ${phead("Data imports", "What was brought in from spreadsheets, and what came of it.", '<button class="btn primary">Register import</button>', { crumb: trail("Settings", "Data imports") })}
  ${alert("destructive", "newsletter-consents.csv was refused", "312 rows carry no consent date. Consent without a date cannot be proven, so nothing was imported.", "")}
  ${section("Repair the file", `<div class="stack"><p class="note">Add the date each address consented, then import again. Rows with a date import; rows without one stay out.</p><div class="btnrow"><button class="btn sm">Download the template</button><button class="btn sm primary">Import again</button></div></div>`)}
</div>`,
            "Settings",
          ),
        },
      ],
    },
    {
      id: "as-payment-account",
      title: "Connecting the payment account",
      why: "Every amount that reaches a customer comes from the company's connected payment account, as a reversal of a charge that customer made. The company connects that account once, chooses which methods customers may use, and reads what each method costs.",
      verdict:
        "The connected account card with the methods list is the best option: the connection state and the methods each have their place and the costs sit in line. The capability checklist is the runner-up, and prefer it while the connection is new and methods still need approval. Never show the methods without the account card, because a method means nothing while the account is disconnected.",
      variants: [
        {
          name: "Connected account with the methods below",
          pick: true,
          reference: "Stripe",
          rationale:
            "Stripe draws the connected account above the enabled methods, because methods depend on the connection. The card states the account, the payout bank, and when the capabilities were last refreshed.",
          tradeoff:
            "The account and the methods each want the top of the page, so on a phone the methods start below the fold.",
          html: shell(
            "Payments",
            `<div class="page as-page">
  ${phead("Payments", "The account customers pay into, and what it costs.", '<button class="btn">Refresh capabilities</button>', { crumb: trail("Settings", "Payments") })}
  ${section(`Stripe · ${badgeRaw("Connected", "positive")}`, `${facts([["Account", `${COMPANY.name} · acct_1H8K2M`], ["Payouts go to", "NL20 INGB 0001 2345 67 · Acme Supply"], ["Capabilities checked", "8 Oct 2026, 09:32 · all methods live"], ["Refunds", "Against each customer's own charge"]], { stacked: true })}<div class="btnrow" style="margin-top:12px"><button class="btn sm">Replace account</button><button class="btn sm subtle-danger">Disconnect</button></div>`)}
  ${section(
    "Payment methods",
    `<table class="dt">
  <thead><tr><th scope="col">Method</th><th scope="col">Cost</th><th scope="col">State</th><th scope="col"></th></tr></thead>
  <tbody>
    <tr><td><b>Bank payments</b><br><small class="muted">Refunds within 180 days of the payment</small></td><td>EUR 0.29 per payment</td><td>${badgeRaw("Live", "positive")}</td><td class="num"><button class="btn sm">Disable</button></td></tr>
    <tr><td><b>Cards</b><br><small class="muted">Visa, Mastercard, Amex</small></td><td>1.8% + EUR 0.25</td><td>${badgeRaw("Live", "positive")}</td><td class="num"><button class="btn sm">Disable</button></td></tr>
    <tr><td><b>Direct debit</b><br><small class="muted">For the subscription, not for orders</small></td><td>EUR 0.25 per payment</td><td>${badgeRaw("Live", "positive")}</td><td class="num"><button class="btn sm">Disable</button></td></tr>
    <tr><td><b>PayPal</b><br><small class="muted">Waiting on approval</small></td><td>2.9% + EUR 0.35</td><td>${badgeRaw("Pending", "caution")}</td><td class="num"><button class="btn sm">Check</button></td></tr>
  </tbody>
</table>`,
    { flush: true },
  )}
</div>`,
            "Settings",
          ),
        },
        {
          name: "Connecting a new account in steps",
          reference: "Stripe",
          rationale:
            "Stripe Connect onboards in named steps, because connecting means signing in at the provider, approving methods, and setting the payout bank. The steps name what is done and what is left.",
          tradeoff:
            "Steps imply an order the provider does not enforce, so a step can read as blocked when it is merely unordered.",
          html: shell(
            "Payments",
            `<div class="page as-page">
  ${phead("Payments", "Connect the account customers pay into.", "", { crumb: trail("Settings", "Payments") })}
  ${section(
    "Connect Stripe",
    `<div class="stack">${asStep(1, "Sign in at Stripe", `${COMPANY.name} authorized the connection on 8 Oct. Read-only plus refunds.`, "done")}${asStep(2, "Choose the methods customers may use", "Bank payments, cards and direct debit.", "")}${asStep(3, "Confirm the payout bank account", "NL20 INGB 0001 2345 67 · Acme Supply.", "")}<div class="btnrow"><button class="btn primary">Continue with Stripe</button></div></div>`,
  )}
  ${notice("info", "The product never holds funds. The processor holds them and the product records the reference.")}
</div>`,
            "Settings",
          ),
        },
        {
          name: "Method capabilities as a checklist",
          reference: "Adyen",
          rationale:
            "Adyen shows each method with its capabilities and approval state, because a method can be connected but not yet live. The checklist names what works and what is still pending.",
          tradeoff:
            "Capabilities change at the provider without warning, so the checklist is a cached reading with a timestamp rather than the truth.",
          html: shell(
            "Payments",
            `<div class="page as-page">
  ${phead("Payments", "What the connected account can do · checked 8 Oct 2026, 09:32", '<button class="btn">Refresh capabilities</button>', { crumb: trail("Settings", "Payments") })}
  ${section("", `<div class="rlist">${recordRow({ title: "Accept bank payments", sub: "Live · refunds within 180 days", state: { label: "Live", tone: "positive" } })}${recordRow({ title: "Accept cards", sub: "Live · Visa, Mastercard, Amex", state: { label: "Live", tone: "positive" } })}${recordRow({ title: "Refund a charge", sub: "Live · against the customer's own charge", state: { label: "Live", tone: "positive" } })}${recordRow({ title: "Accept PayPal", sub: "Waiting on approval since 6 Oct", state: { label: "Pending", tone: "caution" } })}${recordRow({ title: "Direct debit for orders", sub: "Refused · allowed for the subscription only", state: { label: "Refused", tone: "destructive" } })}</div>`)}
</div>`,
            "Settings",
          ),
        },
        {
          name: "Method costs side by side",
          reference: "Mollie",
          rationale:
            "Mollie quotes each method with its fee in line, because the back office compares costs when choosing methods. The estimate grounds the percentages in last month's orders.",
          tradeoff:
            "An estimate from last month misleads when the next month sells differently, so the figures need their basis in the open.",
          html: shell(
            "Payments",
            `<div class="page as-page">
  ${phead("Payments", "What each method costs on last month's orders.", '<button class="btn primary">Change methods</button>', { crumb: trail("Settings", "Payments") })}
  ${section(
    "September · 3,412 payments · EUR 168,204.00 taken",
    `<table class="dt">
  <thead><tr><th scope="col">Method</th><th scope="col" class="num">Share</th><th scope="col">Fee</th><th scope="col" class="num">Cost</th></tr></thead>
  <tbody>
    <tr><td><b>Bank payments</b></td><td class="num">71%</td><td>EUR 0.29 per payment</td><td class="num">EUR 702.47</td></tr>
    <tr><td><b>Cards</b></td><td class="num">27%</td><td>1.8% + EUR 0.25</td><td class="num">EUR 1,048.04</td></tr>
    <tr><td><b>PayPal</b></td><td class="num">2%</td><td>2.9% + EUR 0.35</td><td class="num">EUR 121.52</td></tr>
    <tr><td><b>Total</b></td><td class="num"><b>100%</b></td><td></td><td class="num"><b>EUR 1,872.03</b></td></tr>
  </tbody>
</table>`,
    { flush: true },
  )}
</div>`,
            "Settings",
          ),
        },
        {
          name: "Disconnecting with the consequences stated",
          reference: "GitHub",
          rationale:
            "GitHub states the blast radius before a destructive command, which disconnecting is: new orders stop at once. The dialog names what stops, what continues, and what happens to money already taken.",
          tradeoff:
            "A heavy dialog for a rare command is weight carried always and used once, but the cost of an accidental disconnect justifies it.",
          html: shell(
            "Payments",
            `<div class="page as-page">
  ${phead("Payments", "The account customers pay into, and what it costs.", "", { crumb: trail("Settings", "Payments") })}
  ${section(`Stripe · ${badgeRaw("Connected", "positive")}`, `<p class="note">Acme Supply · payouts to NL20 INGB 0001 2345 67.</p><div class="btnrow" style="margin-top:10px"><button class="btn sm subtle-danger">Disconnect</button></div>`)}
  ${dialog("Disconnect Stripe", `<div class="stack"><p>New orders stop at once. Orders already paid stay paid and still ship.</p>${facts([["Money taken", "Stays with the provider · payouts continue"], ["Refunds", "Paused until an account is connected"], ["Refund window", "Keeps running while disconnected"]], { stacked: true })}</div>`, { footer: '<button class="btn">Keep it connected</button><button class="btn danger">Disconnect</button>' })}
</div>`,
            "Settings",
          ),
        },
        {
          name: "No account connected yet",
          reference: "Stripe",
          rationale:
            "Stripe shows an empty payments state with the single command that fixes it, because nothing can be sold until the account exists. The state names the step, not the product.",
          tradeoff:
            "The empty state cannot show methods or costs, so the back office connects without knowing what each method costs.",
          html: shell(
            "Payments",
            `<div class="page as-page">
  ${phead("Payments", "The account customers pay into, and what it costs.", "", { crumb: trail("Settings", "Payments") })}
  ${section("", emptyState("No payment account connected", "Customers cannot pay until Acme Supply connects its payment account. Connecting takes about five minutes with the provider.", '<button class="btn sm primary">Connect account</button>', "◍"))}
  ${explained("Open the store for orders", "Disabled until a payment account is connected.")}
</div>`,
            "Settings",
          ),
        },
      ],
    },
    {
      id: "as-supplier-invoice",
      title: "The supplier invoice",
      why: "The supplier invoices the company: the subscription for the plan, the fee per order handled, and the text-message cost. The company reads what each line charges, downloads the invoice for the books, and pays by direct debit under their mandate.",
      verdict:
        "The invoice sheet with its lines is the best option: it reads as the document the books need, with the mandate and the download beside it. The plan page with the mandate is the runner-up, and prefer it for changing the plan rather than reading a month. Never show the usage lines without their rates, because a metered figure without its rate cannot be checked.",
      variants: [
        {
          name: "Invoice sheet with its lines",
          pick: true,
          reference: "Stripe Billing",
          rationale:
            "Stripe Billing draws the invoice as the document itself, because the company files it and pays it. The lines carry quantities and rates, and the totals add up top to bottom.",
          tradeoff:
            "A document-shaped page is read, not worked, so changing the plan or the mandate means leaving it.",
          html: shell(
            "Invoices",
            `<div class="page as-page">
  ${phead("Invoice INV-2026-09", `${COMPANY.name} · September 2026 · paid 3 Oct by direct debit`, '<button class="btn">Download PDF</button>', { crumb: trail("Settings", "Billing", "Invoices", "INV-2026-09") })}
  <div class="as-invoice">
    <div class="head"><span>${brandMark(30)}</span><span><b>Meridian Software</b><br><small class="muted">Amsterdam</small></span><span style="margin-left:auto;text-align:right"><b>INV-2026-09</b><br><small class="muted">Issued 1 Oct 2026 · due 15 Oct</small></span></div>
    ${statement(
      [
        { label: "Subscription", lines: [{ what: "Business plan · September", amount: "EUR 49.00" }], totalLabel: "Subscription total", total: "EUR 49.00" },
        { label: "Order fees", lines: [{ what: "3,412 orders · EUR 0.35 each", amount: "EUR 1,194.20" }], totalLabel: "Order fee total", total: "EUR 1,194.20" },
        { label: "Messages", lines: [{ what: "812 text messages · EUR 0.08 each", amount: "EUR 64.96" }], totalLabel: "Message total", total: "EUR 64.96" },
      ],
      { label: "Total · paid 3 Oct", amount: "EUR 1,308.16" },
    )}
    <p class="note tight">Paid by direct debit under mandate MND-8841. Customer payments never appear here: those settle between the customer and Acme Supply at the payment provider.</p>
  </div>
</div>`,
            "Settings",
          ),
        },
        {
          name: "Invoices newest first",
          reference: "Chargebee",
          rationale:
            "Chargebee lists invoices with state and total in line, because the company asks which month is paid and which is open. The overdue row carries the retry date.",
          tradeoff:
            "The list shows totals without lines, so checking one figure means opening the invoice.",
          html: shell(
            "Invoices",
            `<div class="page as-page">
  ${phead("Invoices", "What Meridian charged Acme Supply.", '<button class="btn primary">Change plan</button>', { crumb: trail("Settings", "Billing", "Invoices") })}
  ${section("", `<div class="rlist">${recordRow({ title: "INV-2026-09 · September", sub: "Business plan · 3,412 orders · 812 messages", fig: "EUR 1,308.16", figSub: "paid 3 Oct", state: { label: "Paid", tone: "positive" }, actions: '<button class="btn sm">Open</button>' })}${recordRow({ title: "INV-2026-08 · August", sub: "Business plan · 1,204 orders · 301 messages", fig: "EUR 494.48", figSub: "paid 3 Sep", state: { label: "Paid", tone: "positive" }, actions: '<button class="btn sm">Open</button>' })}${recordRow({ title: "INV-2026-10 · October so far", sub: "Business plan · 412 orders · 96 messages", fig: "EUR 56.68", figSub: "draft · issued 1 Nov", state: { label: "Draft", tone: "neutral" }, actions: '<button class="btn sm">Open</button>' })}</div>`)}
</div>`,
            "Settings",
          ),
        },
        {
          name: "Plan with the mandate beside it",
          reference: "Stripe Billing",
          rationale:
            "Stripe Billing shows the plan, the mandate and the next invoice together, because changing one affects the others. The company reads what they pay and how before changing either.",
          tradeoff:
            "Plan, mandate and next invoice each deserve the top, so the page orders three equals and one of them loses.",
          html: shell(
            "Billing",
            `<div class="page as-page">
  ${phead("Billing", "The plan, the mandate, and the next invoice.", '<button class="btn primary">Change plan</button>', { crumb: trail("Settings", "Billing") })}
  ${twoCol(
    section("Business plan · EUR 49.00 a month", `${facts([["Orders included", "1,000 a month · then EUR 0.35 each"], ["Text messages", "EUR 0.08 each"], ["Storefront domains", "3 hostnames"], ["Team", "Unlimited members"]], { stacked: true })}<div class="btnrow" style="margin-top:12px"><button class="btn sm">Change plan</button><button class="btn sm subtle-danger">Cancel subscription</button></div>`),
    section("How it is paid", `${facts([["Method", "Direct debit"], ["Mandate", "MND-8841 · signed 10 Jan"], ["Bank account", "NL20 INGB 0001 2345 67"], ["Next invoice", "1 Nov · about EUR 210.00"]], { stacked: true })}<div class="btnrow" style="margin-top:12px"><button class="btn sm">Replace mandate</button></div>`),
  )}
</div>`,
            "Settings",
          ),
        },
        {
          name: "Usage lines with their rates",
          reference: "Vercel",
          rationale:
            "Vercel draws metered usage with the rate beside the meter, because a usage line without its rate is a figure the company cannot check. Each line names the plan allowance it counts against.",
          tradeoff:
            "Rates differ per plan and over time, so the page must state which rate version priced each line.",
          html: shell(
            "Invoices",
            `<div class="page as-page">
  ${phead("INV-2026-10 · October so far", "Draft · 412 orders · issued 1 Nov", '<button class="btn">Download draft</button>', { crumb: trail("Settings", "Billing", "Invoices", "October") })}
  ${section(
    "",
    `<table class="dt">
  <thead><tr><th scope="col">Line</th><th scope="col" class="num">Used</th><th scope="col">Rate</th><th scope="col" class="num">Amount</th></tr></thead>
  <tbody>
    <tr><td><b>Business plan</b><br><small class="muted">October</small></td><td class="num">1 month</td><td>EUR 49.00 a month</td><td class="num">EUR 49.00</td></tr>
    <tr><td><b>Orders</b><br><small class="muted">1,000 included · 412 used, inside the allowance</small></td><td class="num">412</td><td>EUR 0.35 each over 1,000</td><td class="num">EUR 0.00</td></tr>
    <tr><td><b>Text messages</b><br><small class="muted">Delivery codes and reminders</small></td><td class="num">96</td><td>EUR 0.08 each</td><td class="num">EUR 7.68</td></tr>
    <tr><td><b>Total so far</b></td><td class="num"></td><td></td><td class="num"><b>EUR 56.68</b></td></tr>
  </tbody>
</table>`,
    { flush: true },
  )}
</div>`,
            "Settings",
          ),
        },
        {
          name: "Overdue with the retry stated",
          reference: "Chargebee",
          rationale:
            "Chargebee states the failed charge, the reason and the next retry, because an overdue invoice is a problem with a date. The company fixes the mandate rather than the invoice.",
          tradeoff:
            "Dunning copy on the invoice page alarms a reader who opened it to file, not to pay.",
          html: shell(
            "Invoices",
            `<div class="page as-page">
  ${phead("Invoice INV-2026-09", "Acme Supply · September 2026", '<button class="btn">Download PDF</button>', { crumb: trail("Settings", "Billing", "Invoices", "INV-2026-09") })}
  ${alert("destructive", "The direct debit for EUR 1,308.16 failed", "The bank refused mandate MND-8841 on 3 Oct: the account holds too little. The next attempt is 10 Oct.", "")}
  ${section("Fix the payment", `${facts([["Owed", "EUR 1,308.16 · due 15 Oct"], ["Mandate", "MND-8841 · NL20 INGB 0001 2345 67"], ["Next attempt", "10 Oct, automatically"]], { stacked: true })}<div class="btnrow" style="margin-top:12px"><button class="btn sm primary">Pay now</button><button class="btn sm">Replace mandate</button></div>`)}
</div>`,
            "Settings",
          ),
        },
        {
          name: "Text-message cost for the month",
          reference: "Resend",
          rationale:
            "Resend breaks message cost down by kind, because delivery codes and reminders fail at different rates. The company reads what each kind cost before the invoice arrives.",
          tradeoff:
            "A cost page per channel multiplies: mail is free and text is metered, and the two need one page or two honest ones.",
          html: shell(
            "Billing",
            `<div class="page as-page">
  ${phead("Message costs", "September · 812 text messages · EUR 64.96", "", { crumb: trail("Settings", "Billing", "Costs") })}
  ${section(
    "",
    `<table class="dt">
  <thead><tr><th scope="col">Kind</th><th scope="col" class="num">Sent</th><th scope="col" class="num">Failed</th><th scope="col" class="num">Cost</th></tr></thead>
  <tbody>
    <tr><td><b>Delivery codes</b><br><small class="muted">On the day of delivery</small></td><td class="num">604</td><td class="num">3</td><td class="num">EUR 48.32</td></tr>
    <tr><td><b>Reminders</b><br><small class="muted">Two days before</small></td><td class="num">208</td><td class="num">1</td><td class="num">EUR 16.64</td></tr>
    <tr><td><b>Total</b></td><td class="num"><b>812</b></td><td class="num"><b>4</b></td><td class="num"><b>EUR 64.96</b></td></tr>
  </tbody>
</table>`,
    { flush: true },
  )}
  ${notice("info", "Mail is free and unlimited. Failed messages are not charged.")}
</div>`,
            "Settings",
          ),
        },
      ],
    },
    {
      id: "as-discount-codes",
      title: "Discount and promotion codes",
      why: "A code takes money off an order, and each one has its own value, use limit and dates. The company watches what each code costs them, retires what leaks, and issues new ones for partners and campaigns.",
      verdict:
        "The code table with usage and state is the best option: it shows value, use and dates in one scan, and retiring a leaked code is one command on the row. The editor is the runner-up, and prefer it for creating a code with several conditions. Never ship the redemption-only list, because redemptions explain the past and the company manages the codes.",
      variants: [
        {
          name: "Code table with use and state",
          pick: true,
          reference: "Shopify",
          rationale:
            "Shopify lists discount codes with uses and limits in line, because the back office asks what each code costs and whether it leaked. The state badge names what the code does now.",
          tradeoff:
            "The conditions behind a code, such as which products it applies to, fit only as a second line and need the code page for the full rule.",
          html: shell(
            "Discounts",
            `<div class="page as-page">
  ${phead("Discounts", "Discount codes, automatic discounts and vouchers across the company.", '<button class="btn primary">Issue code</button>', { crumb: trail("Products", "Discounts") })}
  ${tabs(["Discount codes", "Automatic", "Vouchers"], 0)}
  ${section(
    "",
    `<table class="dt">
  <thead><tr><th scope="col">Code</th><th scope="col">Value</th><th scope="col">Used</th><th scope="col">Valid</th><th scope="col">State</th><th scope="col"></th></tr></thead>
  <tbody>
    <tr><td><span class="code">DESK10</span><br><small class="muted">All products</small></td><td>10% off</td><td class="num">412 of 500</td><td class="nowrap">1 Feb – 14 Mar</td><td>${badge(STATES.active)}</td><td class="num"><button class="btn sm">Open</button></td></tr>
    <tr><td><span class="code">STAFF25</span><br><small class="muted">Staff only</small></td><td>EUR 25.00 off</td><td class="num">34 of 60</td><td class="nowrap">13 Jan – 14 Mar</td><td>${badge(STATES.active)}</td><td class="num"><button class="btn sm">Open</button></td></tr>
    <tr><td><span class="code">SPRING</span><br><small class="muted">5% off, ended</small></td><td>5% off</td><td class="num">1,204 of 2,000</td><td class="nowrap">10 Jan – 13 Jan</td><td>${badgeRaw("Ended", "neutral")}</td><td class="num"><button class="btn sm">Open</button></td></tr>
    <tr><td><span class="code">LEAKED20</span><br><small class="muted">Posted on social media</small></td><td>20% off</td><td class="num">1,890 of 200</td><td class="nowrap">Retired 9 Feb</td><td>${badgeRaw("Retired", "neutral")}</td><td class="num"><button class="btn sm">Open</button></td></tr>
  </tbody>
</table>`,
    { flush: true },
  )}
</div>`,
            "Products",
          ),
        },
        {
          name: "Code editor with its conditions",
          reference: "Shopify",
          rationale:
            "Shopify edits a discount as named condition blocks, which fits a code that applies to some products, some channels and some dates. Each block reads as one sentence of the rule.",
          tradeoff:
            "The blocks take a long page, so the back office cannot check one code and move to the next without scrolling past every condition.",
          html: shell(
            "Discounts",
            `<div class="page as-page">
  ${phead("DESK10", "Discount code · 412 of 500 used", '<button class="btn subtle-danger">Retire</button><button class="btn primary">Save changes</button>', { crumb: trail("Products", "Discounts", "DESK10") })}
  ${twoCol(
    `<div class="stack">${formSection("Value", "What the customer gets.", `<div class="stack">${field("Type", select("Percentage off", ["Percentage off", "Fixed amount off", "Free shipping"]))}${field("Percentage", '<input class="inp num" value="10">')}</div>`, {})}${formSection("Limits", "When the code stops working.", `<div class="stack">${field("Maximum uses", '<input class="inp num" value="500">')}${field("Valid until", '<input class="inp" value="14 Mar 2026">')}</div>`, {})}</div>`,
    section("Summary", `${facts([["Takes off", "10% of the order total"], ["Used", "412 of 500"], ["Cost so far", "EUR 1,854.00"], ["State", "Active"]], { stacked: true })}`),
  )}
</div>`,
            "Products",
          ),
        },
        {
          name: "Vouchers with their balances",
          reference: "Shopify",
          rationale:
            "Shopify draws gift cards as balances that spend down, because a voucher is money held for a later order. The balance, not the code, is the figure the company watches.",
          tradeoff:
            "Vouchers and discount codes share little beyond the word code, so one list for both reads as two lists stapled together.",
          html: shell(
            "Discounts",
            `<div class="page as-page">
  ${phead("Discounts", "Discount codes, automatic discounts and vouchers across the company.", '<button class="btn primary">Issue voucher</button>', { crumb: trail("Products", "Discounts") })}
  ${tabs(["Discount codes", "Automatic", "Vouchers"], 2)}
  ${section("", `<div class="rlist">${recordRow({ title: "Voucher AC-2026-0117", sub: "Issued to Maria Garcia · 6 Oct · apology for the late delivery", fig: "EUR 25.00", figSub: "of EUR 25.00 left", state: { label: "Unused", tone: "info" }, actions: '<button class="btn sm">Open</button>' })}${recordRow({ title: "Voucher AC-2026-0093", sub: "Issued to Tom Becker · 28 Sep · refund window fallback", fig: "EUR 0.00", figSub: "of EUR 45.00 left", state: { label: "Spent", tone: "neutral" }, actions: '<button class="btn sm">Open</button>' })}${recordRow({ title: "Voucher AC-2026-0041", sub: "Partner batch · 40 of 50 claimed", fig: "EUR 310.00", figSub: "left across the batch", state: { label: "In use", tone: "positive" }, actions: '<button class="btn sm">Open</button>' })}</div>`)}
</div>`,
            "Products",
          ),
        },
        {
          name: "Redemptions, newest first",
          reference: "Shopify",
          rationale:
            "Shopify lists discount redemptions per order, which answers where a leaked code went. Each line ties one use to the order that used it.",
          tradeoff:
            "Redemptions multiply into the hundreds, so the list needs the code as a filter and is a report rather than the page.",
          html: shell(
            "Discounts",
            `<div class="page as-page">
  ${phead("DESK10 redemptions", "412 uses · EUR 1,854.00 taken off · newest first", '<button class="btn">Export</button>', { crumb: trail("Products", "Discounts", "DESK10") })}
  ${section(
    "",
    `<table class="dt">
  <thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col">Used</th><th scope="col" class="num">Taken off</th></tr></thead>
  <tbody>
    <tr><td><span class="code">${ORDER.number}</span></td><td>${ORDER.customer}</td><td class="nowrap">8 Oct 2026, 09:32</td><td class="num">EUR 9.00</td></tr>
    <tr><td><span class="code">SO-1041</span></td><td>Tom Becker</td><td class="nowrap">8 Oct 2026, 09:30</td><td class="num">EUR 4.05</td></tr>
    <tr><td><span class="code">SO-1039</span></td><td>${ORDER.customer}</td><td class="nowrap">8 Oct 2026, 09:27</td><td class="num">EUR 4.50</td></tr>
  </tbody>
</table>`,
    { flush: true },
  )}
  ${pager(1, 17, 1, 25, 412)}
</div>`,
            "Products",
          ),
        },
        {
          name: "Issuing one code in a dialog",
          reference: "Shopify",
          rationale:
            "Shopify issues a discount code from a short dialog, because a code for a partner is five fields and no conditions. The dialog keeps the list behind it for the names already taken.",
          tradeoff:
            "Conditions beyond value, limit and dates do not fit, so a code with channel or product rules needs the full editor anyway.",
          html: shell(
            "Discounts",
            `<div class="page as-page">
  ${phead("Discounts", "Discount codes, automatic discounts and vouchers across the company.", "", { crumb: trail("Products", "Discounts") })}
  ${toolbar({ search: "", placeholder: "Search codes" })}
  ${section("", `<div class="rlist">${recordRow({ title: "DESK10", sub: "10% off · 412 of 500 used", state: { label: "Active", tone: "positive" } })}${recordRow({ title: "STAFF25", sub: "EUR 25.00 off · 34 of 60 used", state: { label: "Active", tone: "positive" } })}</div>`)}
  ${dialog("Issue discount code", `<div class="stack">${field("Code", input("PARTNER-"), { help: "Letters, numbers and dashes. Customers type it at checkout." })}${field("Value", select("10% off", ["10% off", "EUR 5.00 off", "EUR 25.00 off", "Free shipping"]))}${field("Maximum uses", '<input class="inp num" value="100">')}</div>`, { footer: '<button class="btn">Cancel</button><button class="btn primary">Issue code</button>' })}
</div>`,
            "Products",
          ),
        },
        {
          name: "Retiring a leaked code",
          reference: "GitHub",
          rationale:
            "GitHub retires a leaked secret with the blast radius stated, which is what a leaked code needs. The dialog states the uses, the cost, and what happens to orders already placed.",
          tradeoff:
            "A confirm dialog for every retirement slows the back office who retires several codes after one leak.",
          html: shell(
            "Discounts",
            `<div class="page as-page">
  ${phead("Discounts", "Discount codes, automatic discounts and vouchers across the company.", "", { crumb: trail("Products", "Discounts") })}
  ${section("", `<div class="rlist">${recordRow({ title: "LEAKED20", sub: "20% off · 1,890 of 200 used · posted on social media", state: { label: "Active", tone: "positive" }, actions: '<button class="btn sm subtle-danger">Retire</button>' })}</div>`)}
  ${dialog("Retire LEAKED20", `<div class="stack"><p>1,890 orders used this code, 1,690 over its limit of 200. Retiring stops new uses at once.</p>${facts([["Cost so far", "EUR 17,010.00"], ["Orders placed", "Keep their discount"], ["New checkouts", "The code is refused"]], { stacked: true })}</div>`, { footer: '<button class="btn">Keep it on sale</button><button class="btn danger">Retire code</button>' })}
</div>`,
            "Products",
          ),
        },
      ],
    },
  ],
};
