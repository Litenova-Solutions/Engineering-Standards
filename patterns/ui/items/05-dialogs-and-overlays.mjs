/**
 * Dialogs and overlays: three answers to one question, and the rule about nesting.
 *
 * Atlassian's routing is the spine: full attention needed means a modal, a
 * complex multi-step flow or dense data means a full page, and anything else is
 * a panel. Its own hard rule is that a dialog must never trigger another dialog.
 */

import {
  COMPANY,
  DELIVERY,
  MONEY,
  ORDER,
  PEOPLE,
  PRODUCT,
  badgeRaw,
  dialog,
  drawer,
  dropZone,
  facts,
  field,
  input,
  menu,
  pager,
  phead,
  progress,
  recordRow,
  section,
  select,
  shell,
  split,
  tabs,
  timelineEntry,
  tip,
  toast,
  toolbar,
  trail,
} from "../parts.mjs";

/** Dialogs-and-overlays CSS. Every class starts with do-. */
const DO_CSS = /* css */ `
.do-page { position: relative; min-height: 560px; }
.do-scroll { overflow-x: auto; border: 1px solid var(--border); border-radius: var(--radius); background: var(--card); }
.do-scroll .dt { min-width: 600px; }
.do-scroll .dt th { background: transparent; }
.do-menu-a { position: absolute; right: 24px; bottom: 64px; z-index: 5; }
.do-menu-b { position: absolute; right: 24px; bottom: 96px; z-index: 5; }
.do-menu-c { position: absolute; right: 24px; top: 132px; z-index: 5; }
.do-sub-wrap { position: absolute; right: 24px; bottom: 64px; display: flex; gap: 6px; align-items: flex-start; z-index: 5; }
.do-sub-wrap .lab { font-size: 11px; color: var(--muted-foreground); }
.do-pop-a { position: absolute; left: 300px; top: 250px; z-index: 5; }
.do-toast-pos { position: absolute; right: 14px; bottom: 14px; z-index: 5; }
.do-toast-stack { position: absolute; right: 14px; bottom: 14px; display: flex; flex-direction: column; gap: 7px; width: 280px; z-index: 5; }
.do-ctx-pos { position: absolute; left: 24px; top: 150px; z-index: 5; }
.do-ctx-pos.tr { left: auto; right: 24px; }
.do-coach { position: absolute; right: 24px; top: 132px; z-index: 5; max-width: 264px; }
.do-coach .tip { max-width: none; }
.do-savebar { position: sticky; top: 0; z-index: 4; display: flex; align-items: center; gap: 10px; flex-wrap: wrap; background: var(--foreground); color: var(--background); border-radius: var(--radius-sm); padding: 8px 8px 8px 12px; font-size: 12.5px; margin-bottom: 12px; }
.do-savebar .btnrow { margin-left: auto; }
.do-savebar .btn { background: transparent; color: var(--background); border-color: transparent; }
.do-savebar .btn:hover { background: transparent; opacity: 0.8; }
.do-savebar .btn.primary { background: var(--background); color: var(--foreground); border-color: var(--background); }
.do-bs-wrap { position: absolute; inset: 0; display: flex; align-items: flex-end; justify-content: center; background: var(--scroll-shade); z-index: 5; }
.do-bs { background: var(--popover); color: var(--popover-foreground); border: 1px solid var(--border); border-bottom: 0; border-radius: 14px 14px 0 0; width: 100%; max-height: 92%; display: flex; flex-direction: column; box-shadow: 0 -8px 32px var(--scroll-shade); }
.do-bs .grab { padding: 9px 0 3px; display: grid; place-items: center; }
.do-bs .grab i { width: 36px; height: 4px; border-radius: 999px; background: var(--input); font-style: normal; }
.do-bs > header { padding: 6px 16px 0; }
.do-bs > header h3 { font-size: 14px; }
.do-bs > header p { font-size: 12px; color: var(--muted-foreground); margin-top: 2px; }
.do-bs .dbody { padding: 12px 16px; overflow-y: auto; }
.do-bs footer { padding: 11px 16px; border-top: 1px solid var(--border); display: flex; gap: 8px; }
.do-bs footer .btn { flex: 1; }
.do-bs footer.stack { flex-direction: column; align-items: stretch; }
.do-bs.full { height: 94%; }
.do-bs .act { display: flex; width: 100%; align-items: center; gap: 10px; border: 0; background: transparent; cursor: pointer; padding: 10px 4px; font-size: 13px; border-bottom: 1px solid var(--border); text-align: left; }
.do-bs .act:last-child { border-bottom: 0; }
.do-bs .act.danger { color: var(--destructive-surface-foreground); }
.do-bs .act .go { margin-left: auto; color: var(--muted-foreground); }
.do-long { max-height: 300px; overflow-y: auto; }
.do-pin { position: sticky; bottom: 0; background: var(--popover); border-top: 1px solid var(--border); padding: 9px 0 2px; }
.do-kbd { font-family: var(--font-mono); font-size: 10.5px; border: 1px solid var(--border); border-bottom-width: 2px; border-radius: 4px; padding: 1px 5px; background: var(--muted); white-space: nowrap; }
.do-keys { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 20px; }
.do-key { display: flex; align-items: center; gap: 8px; padding: 5px 0; font-size: 12.5px; }
.do-key .ks { margin-left: auto; display: flex; gap: 4px; }
.do-cheat { columns: 2; column-gap: 24px; }
.do-cheat > div { break-inside: avoid; margin-bottom: 14px; }
.do-pal { display: flex; flex-direction: column; gap: 0; }
.do-pal .prow { display: flex; align-items: center; gap: 9px; padding: 7px 8px; border-radius: 6px; font-size: 12.5px; }
.do-pal .prow.on { background: var(--muted); }
.do-pal .prow .hint { margin-left: auto; font-size: 11px; color: var(--muted-foreground); }
@media (max-width: 640px) {
  .do-page .scrim { place-items: end center; padding: 0; }
  .do-page .scrim .scrim { display: contents; }
  .do-page .dialog { max-width: 100%; width: 100%; border-radius: 14px 14px 0 0; border-left: 0; border-right: 0; border-bottom: 0; max-height: 94%; }
  .do-page .dialog > .dbody { overflow-y: auto; }
  .do-page .dialog > footer { flex-direction: column-reverse; align-items: stretch; }
  .do-page .dialog > footer .btn { width: 100%; }
  .do-page .dialog > footer .left { margin-right: 0; }
  .do-page .drawer { max-width: 100%; border: 0; border-radius: 0; }
  .do-menu-a, .do-menu-b { right: 12px; left: 12px; bottom: 12px; top: auto; }
  .do-menu-a .menu, .do-menu-b .menu, .do-menu-c .menu { width: 100% !important; }
  .do-menu-c { right: 12px; left: 12px; top: auto; bottom: 12px; }
  .do-sub-wrap { right: 12px; left: 12px; bottom: 12px; flex-direction: column; align-items: stretch; }
  .do-sub-wrap .menu { width: 100% !important; }
  .do-pop-a { left: 12px; right: 12px; top: auto; bottom: 12px; }
  .do-pop-a .pop { width: 100% !important; }
  .do-toast-pos { left: 12px; right: 12px; }
  .do-toast-pos .toast { min-width: 0; width: 100%; }
  .do-toast-stack { left: 12px; right: 12px; width: auto; }
  .do-ctx-pos { left: 12px; right: 12px; top: auto; bottom: 12px; }
  .do-ctx-pos .menu { width: 100% !important; }
  .do-coach { right: 12px; left: 12px; top: auto; bottom: 12px; max-width: none; }
  .do-keys { grid-template-columns: 1fr; }
  .do-cheat { columns: 1; }
}
`;

export const CATEGORY_DIALOGS = {
  css: DO_CSS,
  items: [
    {
      id: "overlay-confirm",
      title: "Confirming a command that cannot be taken back",
      why: "The evidence is unusually blunt. NN/g: a confirmation is worth its cost only when the action is <b>rare, consequential and irreversible</b>, and used routinely it becomes a reflex click. GOV.UK does not require typing; Cloudscape and GitHub do, for one object each.",
      verdict: "Ship A: it names the object, states the consequence in figures, and offers the alternative in the same surface. E is the runner-up wherever money moves, because the figure is read at the click. Never ship C: an undo on an irreversible cancellation is a second command rather than a reversal, and on money it trains the reflex the confirmation exists to break.",
      variants: [
        {
          name: "Name the object, state the consequence, offer the alternative",
          pick: true,
          reference: "MOJ",
          rationale:
            "The MOJ pattern: title asks, body states what it is and what happens, and the safe way out is in the same dialog. The commit button repeats the verb, as Carbon asks.",
          tradeoff:
            "Three pieces of copy per destructive command, in two languages, all of which have to stay true as the domain changes. The words are a second copy of the domain rules.",
          html: shell(
            "Cancel launch",
            `<div class="page do-page" style="position:relative">
  ${phead("Spring lighting launch", "Sat 14 Mar 2026 · Amsterdam warehouse. 1,204 pre-orders.", '<button class="btn subtle-danger">Cancel the launch</button>', { crumb: trail("Home", "Products", "Spring lighting launch") })}
  <div class="scrim">
    ${dialog(
      "Cancel the spring lighting launch?",
      `<div class="stack sm" style="font-size:12.5px">
        <div><b>1,204 customers</b> pre-ordered and will be told the launch is off.</div>
        <div><b>${MONEY.monthRevenue}</b> will be refunded to the customers, on the payment they used.</div>
        <div>Two people are on the warehouse plan and will be told to stand down.</div>
      </div>
      <div class="callout destructive" style="margin-top:11px">This cannot be undone. A launch that has been cancelled cannot be scheduled again.</div>
      <div style="margin-top:11px;font-size:12.5px">To keep the date and move it instead, <a href="#" style="text-decoration:underline">move the launch</a>.</div>`,
      { footer: '<button class="btn">Keep the launch</button><button class="btn danger">Cancel the launch</button>' },
    )}
  </div>
</div>`,
            "Products",
          ),
        },
        {
          name: "Type the launch name to confirm",
          reference: "Cloudscape",
          rationale:
            "Cloudscape's pattern, restricted to the most dangerous object: type the name, with the expected string selectable on screen, and the commit button disabled until it matches.",
          tradeoff:
            "NN/g's objection is exact: a product that asks people to type names all day trains them to copy and paste without reading, which is the reflex the pattern existed to break. One object per deployment is the ceiling, not one per record type.",
          html: shell(
            "Cancel launch",
            `<div class="page do-page" style="position:relative">
  ${phead("Spring lighting launch", "Sat 14 Mar 2026 · Amsterdam warehouse. 1,204 pre-orders.", '<button class="btn subtle-danger">Cancel the launch</button>', { crumb: trail("Home", "Products", "Spring lighting launch") })}
  <div class="scrim">
    ${dialog(
      "Cancel this launch for good?",
      `<div style="font-size:12.5px">1,204 customers will be refunded ${MONEY.monthRevenue} and told the launch is off. This cannot be undone.</div>
      <div class="field" style="margin-top:12px">
        <label>Type the launch name to confirm</label>
        <input class="inp mono" value="Spring lighting launch" aria-describedby="cn-h">
        <span class="help" id="cn-h">It must be exactly <span class="mono">Spring lighting launch</span>.</span>
      </div>`,
      { footer: '<button class="btn">Keep the launch</button><button class="btn danger" disabled>Cancel the launch</button>' },
    )}
  </div>
</div>`,
            "Products",
          ),
        },
        {
          name: "No dialog at all: act, then offer an undo",
          reference: "Carbon",
          rationale:
            "The command runs and a toast names what happened with an Undo that stays until it is dismissed. Carbon keeps an action-bearing toast on screen for exactly that reason.",
          tradeoff:
            "On money this trains the reflex the confirmation exists to prevent, and an Undo on a refund is a second refund command rather than a reversal of the first.",
          html: shell(
            "Cancel launch",
            `<div class="page">
  ${phead("Spring lighting launch", "Cancelled, 1,204 customers refunded.", '<button class="btn">Undo the cancellation</button>', { crumb: trail("Home", "Products", "Spring lighting launch") })}
  ${`<div class="alert destructive" style="margin-bottom:14px"><span class="ico" aria-hidden="true">✕</span><span class="txt"><b>Cancelled at 14:22.</b><small>1,204 customers have been told. ${MONEY.monthRevenue} is going back on the payment each customer used.</small></span><span class="tail"><button class="btn sm">Undo</button></span></div>`}
  ${section("The launch", facts([["State", "Cancelled"], ["Was", "Scheduled"], ["Pre-orders", "1,204, all refunded"], ["Refunds", `${MONEY.monthRevenue}, sent`]]))}
</div>`,
            "Products",
          ),
        },
        {
          name: "An interruption page, not a dialog",
          reference: "GOV.UK",
          rationale:
            "GOV.UK's own answer for the most serious, irreversible action: leave the page entirely for one that says what will be lost and offers the way back as a link.",
          tradeoff:
            "A full page for one command means leaving the record and coming back, and it loses the page context that makes the consequence understandable.",
          html: shell(
            "Cancel launch",
            `<div class="page" style="max-width:600px">
  ${trail("Home", "Products", "Spring lighting launch", "Cancel")}
  <div class="phead"><div><h1>Cancel the spring lighting launch?</h1><p class="desc">Sat 14 Mar 2026 · Amsterdam warehouse.</p></div></div>
  ${section(
    "What happens if you do",
    `<div class="stack sm" style="font-size:12.5px">
      <div><b>1,204 customers</b> are refunded ${MONEY.monthRevenue} on the payment each one used.</div>
      <div>Every customer gets a message saying the launch is off and that their money is coming back.</div>
      <div>Two people on the warehouse plan are told to stand down.</div>
      <div>The launch keeps its record. It can be read in June and it says what happened.</div>
    </div>`,
    { desc: "This cannot be undone. There is no way to schedule a launch again once it is cancelled." },
  )}
  <div class="btnrow end" style="margin-top:16px"><button class="btn">Go back and keep it</button><button class="btn danger">Yes, cancel the launch</button></div>
</div>`,
            "Products",
          ),
        },
        {
          name: "A dialog with the consequence as numbers",
          rationale:
            "Where a command changes money, the dialog shows the money. This is the strongest form of the pattern: the reader reads the figure before committing to it.",
          tradeoff:
            "The figure has to be read at the moment of the click, which means a read between the button and the command. On a slow connection the dialog waits.",
          html: shell(
            "Refund",
            `<div class="page do-page" style="position:relative">
  ${trail("Home", "Orders", ORDER.number)}
  <div class="phead"><div><h1>${ORDER.number} ${badgeRaw("Paid", "positive")}</h1><p class="desc">${ORDER.customer} · ${ORDER.company}</p></div><div class="acts"><button class="btn subtle-danger">Refund</button></div></div>
  ${section("What was bought", `<div class="stmt"><div class="line"><span>${PRODUCT.name}, 2 lamps</span><span class="fig">${MONEY.lineTotal}</span></div><div class="line"><span>Shipping</span><span class="fig">${MONEY.shipping}</span></div><div class="line"><span>Gift wrap</span><span class="fig">EUR 30.00</span></div><div class="grand"><span>Paid by the customer</span><span class="fig">${MONEY.order}</span></div></div>`)}
  <div class="scrim">
    ${dialog(
      `Refund ${ORDER.number} in full?`,
      `<div class="stmt">
        ${`<div class="line"><span>Lamps and extras<span class="sub">2 lamps and gift wrap</span></span><span class="fig">${MONEY.order}</span></div>`}
        <div class="sub-total"><span>Goes back to ${ORDER.customer}</span><span class="fig">${MONEY.order}</span></div>
      </div>
      <div class="callout" style="margin-top:11px">The two lamps go back to stock and sell again. The gift wrap was made for this order and is not refunded.</div>`,
      { footer: '<button class="btn left">Refund part of it</button><button class="btn">Cancel</button><button class="btn danger">Refund in full</button>' },
    )}
  </div>
</div>`,
            "Orders",
          ),
        },
        {
          name: "A dialog that says it cannot act yet",
          reference: "Cloudscape",
          rationale:
            "The command is forbidden by a dependency, so the dialog names the dependency and the command that clears it, and the commit button is disabled with the reason on it.",
          tradeoff:
            "A dialog that cannot be completed is a dead end. Cloudscape handles this by disabling the commit control, which is honest but leaves the reader needing another surface.",
          html: shell(
            "Cancel launch",
            `<div class="page do-page" style="position:relative">
  ${phead("Spring lighting launch", "Sat 14 Mar 2026.", '<button class="btn subtle-danger">Cancel the launch</button>', { crumb: trail("Home", "Products", "Spring lighting launch") })}
  <div class="scrim">
    ${dialog(
      "This launch cannot be cancelled yet",
      `<div style="font-size:12.5px">Two packing lines are still running on the warehouse plan, and 1,204 customers have goods that have not been picked. Closing the lines first is what makes this possible.</div>
      <div class="alist" style="margin-top:11px">
        <div class="arow"><span class="why" aria-hidden="true">◷</span><span class="txt"><b>2 packing lines running</b><small>Line 1 and line 2, started at 08:00.</small></span><span class="go"><button class="btn sm">Close the lines</button></span></div>
        <div class="arow"><span class="why" aria-hidden="true">◔</span><span class="txt"><b>184 parcels picked</b><small>Picked at the warehouse this morning.</small></span></div>
      </div>`,
      { footer: '<button class="btn primary">Close the lines first</button>' },
    )}
  </div>
</div>`,
            "Products",
          ),
        },
        {
          name: "Confirm by ticking each consequence",
          rationale:
            "Safer destructive action. The commit button stays disabled until the reader ticks every consequence line. Unlike typing one name, ticking forces the eye across each line, so the refund route and the record-keeping are each acknowledged.",
          tradeoff:
            "Three checkboxes for one command is the heaviest confirmation in this set. Past one object per deployment it becomes the reflex click the pattern exists to break.",
          html: shell(
            "Cancel launch",
            `<div class="page do-page" style="position:relative">
  ${phead("Spring lighting launch", DELIVERY.date + ", " + DELIVERY.window + " at " + DELIVERY.place + ".", '<button class="btn subtle-danger">Cancel the launch</button>', { crumb: trail("Home", "Products", "Spring lighting launch") })}
  <div class="scrim">
    ${dialog(
      "Cancel the spring lighting launch?",
      '<div class="stack">' +
        '<label class="check"><input type="checkbox"><span>Every customer is told the launch is off<span class="cd">The message names the spring lighting launch and its date.</span></span></label>' +
        '<label class="check"><input type="checkbox"><span>Each customer gets back what they paid<span class="cd">Up to ' + MONEY.lamp + ' a unit, on the payment they used.</span></span></label>' +
        '<label class="check"><input type="checkbox"><span>The record stays and says what happened<span class="cd">Nothing is deleted.</span></span></label>' +
        '<div class="callout destructive">This cannot be undone.</div>' +
        "</div>",
      {
        desc: "Tick every line to show each consequence was read.",
        footer: '<button class="btn">Keep the launch</button><button class="btn danger" disabled>Cancel the launch</button>',
      },
    )}
  </div>
</div>`,
            "Products",
          ),
        },
        {
          name: "An alert dialog with the safe action first",
          reference: "GitHub Primer",
          rationale:
            "The way GitHub Primer draws an AlertDialog: one consequence in plain words, a danger icon, and focus on the safe action so Enter keeps the launch. Less copy than the first option, the same protection.",
          tradeoff:
            "One consequence means the other two move to the page or disappear. Where the money figure matters, the dialog with the consequence as numbers still wins because the reader never sees the amount here.",
          html: shell(
            "Cancel launch",
            `<div class="page do-page" style="position:relative">
  ${phead("Spring lighting launch", "Sat 14 Mar 2026 · Amsterdam warehouse. 1,204 pre-orders.", '<button class="btn subtle-danger">Cancel the launch</button>', { crumb: trail("Home", "Products", "Spring lighting launch") })}
  ${section("The launch", facts([["State", "Scheduled"], ["Pre-orders", "1,204"], ["Refunds if cancelled", MONEY.monthRevenue]]))}
  <div class="scrim">
    ${dialog(
      "Cancel the spring lighting launch?",
      `<div style="display:flex;gap:10px;align-items:flex-start"><span class="alert destructive" style="padding:6px 9px" aria-hidden="true">!</span><div style="font-size:12.5px">1,204 customers get their money back on the payment each one used, and a message saying the launch is off. This cannot be undone.</div></div>`,
      { footer: '<button class="btn" autofocus>Keep the launch</button><button class="btn danger">Cancel the launch</button>', scrim: false },
    )}
  </div>
</div>`,
            "Products",
          ),
        },
      ],
    },
    {
      id: "overlay-task",
      title: "A short task in a dialog",
      why: "The composition rules are explicit: <b>one to four inputs, nothing to consult and infrequent is a form dialog</b>; more than four inputs, sections, steps or a need for a linkable result is a full page. The check is input count, and it is checked.",
      verdict: "Ship A for any command with one to four inputs: title, fields, one verb, no navigation. E is the runner-up for commands that repeat all day, where leaving the page costs more than the dialog saves. Never ship D: a dialog over a dialog is the nesting the project forbids, and a helper supporting it does not make it readable.",
      variants: [
        {
          name: "Two or three inputs, one dialog",
          pick: true,
          rationale:
            "One dialog shape for short commands: title, two fields, Cancel and the commit verb. This is where most short commands belong.",
          tradeoff:
            "A dialog is a separate surface from the page, so a refusal has to be worded in the dialog rather than on the page it came from.",
          html: shell(
            "Add a note",
            `<div class="page do-page" style="position:relative">
  ${phead(ORDER.number, "3 lines · " + ORDER.company + ".", '<button class="btn sm">Add a note</button>', { crumb: trail("Home", "Orders", ORDER.number) })}
  ${section("Notes", `<div class="rlist">${`<div class="rrow"><span class="txt"><b>Garcia Interiors confirmed the Friday window</b><small>${PEOPLE.manager.name}, 2 Oct 2026</small></span></div>`}</div>`, { desc: `Only ${COMPANY.name} sees these.` })}
  <div class="scrim">
    ${dialog(
      "Add a note",
      `<div class="stack">
        ${field("Note", '<textarea class="ta" placeholder="What happened, and what was decided."></textarea>', { required: true })}
        ${field("About", '<select class="sel"><option selected>The customer</option><option>The warehouse</option><option>The money</option><option>The delivery</option></select>', { help: "Notes about the customer are never shown on the packing slip." })}
      </div>`,
      { footer: '<button class="btn">Cancel</button><button class="btn primary">Add the note</button>' },
    )}
  </div>
</div>`,
            "Orders",
          ),
        },
        {
          name: "Five inputs, so it becomes a page",
          rationale:
            "The same command once it carries five inputs. The composition rule sends it to a full page, with a linkable result that can be returned to later.",
          tradeoff:
            "Losing the page the reader was on, and a linkable result that can be returned to later. Worth it when the command has that many parts.",
          html: shell(
            "Record an incident",
            `<div class="page" style="max-width:560px">
  ${trail("Home", "Orders", ORDER.number, "Warehouse", "Incidents", "New")}
  <div class="phead"><div><h1>Record an incident</h1><p class="desc">What happened at the warehouse, in your words.</p></div></div>
  ${section(
    "",
    `<div class="form">
      ${field("What happened", `<textarea class="ta" placeholder="At 22:41 a driver presented a delivery note for another company's goods."></textarea>`, { help: "Who, when, and what was decided. The warehouse lead reads this in June.", required: true })}
      ${field("When", input("14/03/2026 22:41", { cls: "nowrap" }), { required: true })}
      ${field("Where", '<select class="sel"><option selected>Loading bay 1</option><option>Loading bay 2</option><option>Pickup counter</option></select>', { required: true })}
      ${field("Who was involved", '<select class="sel"><option selected>A driver, named below</option><option>More than one</option><option>Nobody, it was a device</option></select>', { required: true })}
      ${field("Who decided", input(""), { optional: true })}
      <div class="btnrow end" style="border-top:1px solid var(--border);padding-top:12px"><button class="btn">Cancel</button><button class="btn primary">Record it</button></div>
    </div>`,
  )}
</div>`,
            "Orders",
          ),
        },
        {
          name: "Four inputs with a list to choose from",
          reference: "Carbon",
          rationale:
            "The large dialog size. Carbon's rule is that a modal is for a short non-frequent task and not for anything repeated; four inputs with a list is still on the right side of that line if it is rare.",
          tradeoff:
            "A 560-pixel dialog holding a table is close to a page with worse navigation, and the size has to be argued case by case rather than by a rule.",
          html: shell(
            "Invite people to the count",
            `<div class="page do-page" style="position:relative">
  ${phead("Stock count", "Sat 14 Mar 2026 · Amsterdam warehouse.", '<button class="btn sm">Invite people to the count</button>', { crumb: trail("Home", "Products", "Stock count") })}
  ${section("Counters", `<div class="rlist"><div class="rrow"><span class="txt"><b>Chris Novak</b><small>Warehouse lead · has an invitation</small></span></div></div>`)}
  <div class="scrim">
    ${dialog(
      "Invite people to the count",
      `<div class="stack">
        <div class="field">
          <label>Who</label>
          <div class="pop" style="box-shadow:none;border:0;padding:0">
            ${[
              ["Chris Novak", "Warehouse lead"],
              ["Alex Morgan", "Operations manager"],
              ["Jordan Lee", "Support"],
            ]
              .map(([who, role], i) => `<label class="check" style="padding:5px 6px;border-radius:5px;${i === 0 ? "background:var(--muted)" : ""}"><input type="checkbox" ${i < 2 ? "checked" : ""}><span>${who}<span class="cd">${role}</span></span></label>`)
              .join("")}
          </div>
        </div>
        ${field("What they will do", '<textarea class="ta" style="min-height:60px">Count the lighting stock from 21:00.</textarea>', { required: true })}
        ${field("When they are needed", input("14/03/2026 21:00", { cls: "nowrap" }), { required: true })}
        <div class="hint">Invitations go by email and run out on 22 Mar. Nothing is charged.</div>
      </div>`,
      { footer: '<button class="btn">Cancel</button><button class="btn primary">Send 2 invitations</button>', size: "lg" },
    )}
  </div>
</div>`,
            "Products",
          ),
        },
        {
          name: "A dialog whose second step is another dialog",
          reference: "Base UI",
          rationale:
            "Refusing a file needs its own question, and the second dialog opens over the first. Base UI supports it and suppresses the child backdrop.",
          tradeoff:
            "Atlassian states it plainly: do not use dialogs to trigger other dialogs, as it is inaccessible and confusing, and do not place a modal over a panel. This is the pattern the project forbids.",
          html: shell(
            "Upload a logo",
            `<div class="page do-page" style="position:relative">
  ${phead("Storefront", "The logo customers see.", "", { crumb: trail("Home", "Settings", "Storefront") })}
  ${section("", dropZone("Drop a logo here or choose a file", "A square image of at most 2 MB."))}
  <div class="scrim">
    ${dialog(
      "That file is not an image",
      `<div style="font-size:12.5px">acme-supply-logo.psd is a design file. The storefront takes JPEG, PNG or WebP.</div>`,
      { footer: '<button class="btn left">Try another file</button><button class="btn">Cancel</button>' },
    )}
  </div>
</div>`,
            "Settings",
          ),
        },
        {
          name: "The task on the page, not in a dialog",
          reference: "Carbon",
          rationale:
            "Where the command repeats, Carbon says make it completable on the main page rather than in a modal. An inline row becomes an editing row, which is where a repeatable task belongs.",
          tradeoff:
            "Inline editing works only on a narrow table, and NN/g warns the row must look visibly different or people edit it by accident.",
          html: shell(
            "Refunds queue",
            `<div class="page">
  ${phead("Refunds", "31 orders to decide.", "", { crumb: trail("Home", "Orders", "Refunds") })}
  ${toolbar({ search: "", placeholder: "Search refunds", filters: ["Any window"] })}
  ${section(
    "",
    `<table class="dt">
      <thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col">State</th><th scope="col" class="num">Amount</th><th scope="col" style="width:1%"></th></tr></thead>
      <tbody>
        <tr class="is-sel" style="background:var(--muted)">
          <td colspan="5" style="padding:0">
            <div style="padding:12px 14px;background:var(--card);box-shadow:inset 3px 0 0 var(--ring)">
              <div class="form" style="display:grid;grid-template-columns:1fr 150px auto;gap:12px;align-items:end">
                <div class="field"><label>Refund amount for order SO-1035</label><span class="inp-wrap has-suffix" style="position:relative;display:flex;align-items:center"><input class="inp money" value="45.00" inputmode="decimal"><span class="suffix" style="position:absolute;right:9px;font-size:11.5px;color:var(--muted-foreground)">EUR</span></span><span class="help">Ade Okafor paid ${MONEY.lamp}. It is 181 days old, so this payment method will refuse it.</span></div>
                <div class="field"><label>Route</label><select class="sel"><option>Refund to the original payment</option><option selected>Credit for a future order</option></select></div>
                <div class="btnrow"><button class="btn sm">Cancel</button><button class="btn primary sm">Offer credit</button></div>
              </div>
            </div>
          </td>
        </tr>
        ${[
          ["SO-1037", "Elin Lindqvist", "No route", "destructive", MONEY.lamp],
          ["SO-1038", "Tom Becker", "Closing", "caution", MONEY.lamp],
          ["SO-1036", "Ade Okafor", "Open", "neutral", MONEY.lamp],
          ["SO-1042", "Maria Garcia", "Open", "neutral", MONEY.lineTotal],
        ]
          .map(
            ([no, who, st, tone, amt]) => `<tr><td><span class="code">${no}</span></td><td>${who}</td><td>${badgeRaw(st, tone, "outline")}</td><td class="num">${amt}</td><td class="num"><button class="btn xs">Deal with it</button></td></tr>`,
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
          name: "A dialog whose command needs a second thing done first",
          reference: "Carbon",
          rationale:
            "The task cannot proceed until a dependency is cleared, so the dialog shows the dependency as a step of its own rather than opening a second dialog over itself.",
          tradeoff:
            "Now the dialog is two surfaces, which Carbon says should be a page. The line between a two-step dialog and a wizard is a matter of degree.",
          html: shell(
            "Void a pickup code",
            `<div class="page do-page" style="position:relative">
  ${phead(ORDER.number, "Two parcels, neither collected.", "", { crumb: trail("Home", "Orders", ORDER.number, "Parcels") })}
  ${section("Parcels", `<div class="rlist"><div class="rrow"><span class="txt"><b>PU-0C893968A2</b><small>Oak desk lamp, 2 units · pickup counter</small></span>${badgeRaw("Not collected", "neutral", "outline")}<button class="btn sm subtle-danger">Void it</button></div></div>`)}
  <div class="scrim">
    ${dialog(
      "Void this pickup code",
      `<div class="stack">
        <div class="alert caution"><span class="ico" aria-hidden="true">!</span><span class="txt"><b>Voiding replaces the code.</b><small>${ORDER.customer} has to be sent a new one, and the code PU-0C893968A2 stops working at the pickup counter.</small></span></div>
        <label class="check"><input type="checkbox"><span>Send ${ORDER.customer} the replacement now<span class="cd">Otherwise they hold a code that no longer works and nobody has told them.</span></span></label>
        <label class="check"><input type="checkbox" checked><span>Keep the reason on the record<span class="cd">The warehouse lead reads this in June. It is not shown to the customer.</span></span></label>
      </div>`,
      { footer: '<button class="btn">Cancel</button><button class="btn danger">Void and replace</button>' },
    )}
  </div>
</div>`,
            "Orders",
          ),
        },
        {
          name: "Stay open for the next note",
          reference: "Linear",
          rationale:
            "The way Linear draws Create another: a checkbox in the dialog keeps it open for repeat entry, so five notes cost five dialogs and zero navigation. Suited to warehouse logging, where notes arrive in bursts.",
          tradeoff:
            "A dialog that stays open hides the list it appends to, so the reader cannot see the note land. Past three repeats in a row, the task on the page is still the honest surface.",
          html: shell(
            "Add a note",
            `<div class="page do-page" style="position:relative">
  ${phead(ORDER.number, "3 lines · " + ORDER.company + ".", '<button class="btn sm">Add a note</button>', { crumb: trail("Home", "Orders", ORDER.number) })}
  ${section("Notes", `<div class="rlist"><div class="rrow"><span class="txt"><b>Garcia Interiors confirmed the Friday window</b><small>${PEOPLE.manager.name}, 2 Oct 2026</small></span></div><div class="rrow"><span class="txt"><b>Loading bay 2 opens at 07:30, not 07:00</b><small>${PEOPLE.warehouse.name}, 3 Oct 2026</small></span></div></div>`, { desc: `Only ${COMPANY.name} sees these.` })}
  <div class="scrim">
    ${dialog(
      "Add a note",
      `<div class="stack">
        ${field("Note", '<textarea class="ta" placeholder="What happened, and what was decided."></textarea>', { required: true })}
        ${field("About", '<select class="sel"><option selected>The customer</option><option>The warehouse</option><option>The money</option><option>The delivery</option></select>')}
        <label class="check"><input type="checkbox" checked><span>Add another after this<span class="cd">The dialog stays open with a blank note.</span></span></label>
      </div>`,
      { footer: '<button class="btn">Cancel</button><button class="btn primary">Add the note</button>', scrim: false },
    )}
  </div>
</div>`,
            "Orders",
          ),
        },
        {
          name: "Run the task from the command palette",
          reference: "Raycast",
          rationale:
            "The way Raycast runs a scoped command: one input, results grouped by record, Enter runs without leaving the page. Staff who know the palette reuse a surface they already have.",
          tradeoff:
            "Invisible until opened: a reader who never presses the shortcut never learns the task exists. It suits frequent staff and fails new ones, who still need the button on the page.",
          html: shell(
            "Add a note",
            `<div class="page do-page" style="position:relative">
  ${phead(ORDER.number, "3 lines · " + ORDER.company + ".", '<button class="btn sm">Add a note</button>', { crumb: trail("Home", "Orders", ORDER.number) })}
  ${section("Notes", `<div class="rlist"><div class="rrow"><span class="txt"><b>Garcia Interiors confirmed the Friday window</b><small>${PEOPLE.manager.name}, 2 Oct 2026</small></span></div></div>`, { desc: `Only ${COMPANY.name} sees these.` })}
  <div class="scrim" style="place-items:start center;padding-top:12vh">
    ${dialog(
      "Add a note to " + ORDER.number,
      `<input class="inp" value="note: bay 2 opens at" aria-label="Note text" style="margin-bottom:8px">
      <div class="do-pal">
        <div class="prow on"><span>Save as a note on ${ORDER.number}</span><span class="hint">Enter to run</span></div>
        <div class="prow"><span>Save and add another</span><span class="hint">Shift plus Enter</span></div>
        <div class="prow"><span>Open the full notes page</span><span class="hint">Tab</span></div>
      </div>`,
      { desc: ORDER.number + " · Esc closes without saving.", scrim: false },
    )}
  </div>
</div>`,
            "Orders",
          ),
        },
      ],
    },
    {
      id: "overlay-drawer",
      title: "A drawer beside the list",
      why: "A drawer opens from a list action so a reader can see a record without leaving the list. Atlassian's panel rules say the panel is for <b>contextual information that complements the workflow</b>, default 365 wide, and it becomes an overlay at 1024 and below.",
      verdict: "Ship A: the list keeps its scroll and its filters while the record reads beside it, and nothing in the drawer is editable. F is the required shape below 768 px, where beside becomes a full screen with a Back. Never ship D: filters belong in the toolbar, and a drawer over the results hides the list the filters describe.",
      compact: {
        option: "The drawer at phone width, as a page with a Back",
        behaviour: "At phone width there is no beside: the drawer takes the screen and Back returns to the list at the same scroll position, with its filters intact.",
      },
      variants: [
        {
          name: "Read-only record beside the list",
          pick: true,
          reference: "Atlassian",
          rationale:
            "The recommended shape. The list is untouched and narrowed, the record holds facts, and the way out is back to the full record. Nothing in the drawer is editable, so it cannot become a task.",
          tradeoff:
            "A 420-pixel drawer against a 1440 screen leaves the list about 900 wide, which is five columns and not eight. Two nested navigations on one screen.",
          html: shell(
            "Orders",
            `<div class="page">
  ${phead("Orders", "268 orders. Select a row to read it here.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order number, name or email", filters: ["Any state"] })}
  <div style="display:grid;grid-template-columns:minmax(0,1fr) 215px;gap:12px;align-items:start">
    <div>
      <table class="dt dense">
        <thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col">State</th><th scope="col" class="num">Paid</th></tr></thead>
        <tbody>
          <tr class="is-sel"><td><span class="code">SO-1042</span><br><small class="muted">Garcia Interiors</small></td><td>${ORDER.customer}<br><small class="muted">${ORDER.email}</small></td><td>${badgeRaw("Paid", "positive", "outline")}</td><td class="num">${MONEY.order}</td></tr>
          <tr><td><span class="code">SO-1041</span><br><small class="muted">Becker Bouw</small></td><td>Tom Becker<br><small class="muted">tom@becker-bouw.example</small></td><td>${badgeRaw("Paid", "positive", "outline")}</td><td class="num">EUR 40.45</td></tr>
          <tr><td><span class="code">SO-1040</span><br><small class="muted">Goods only</small></td><td>Elin Lindqvist<br><small class="muted">elin@lindqvist.example</small></td><td>${badgeRaw("Completed", "neutral", "outline")}</td><td class="num">${MONEY.lamp}</td></tr>
          <tr><td><span class="code">SO-1039</span><br><small class="muted">Garcia Interiors</small></td><td>Maria Garcia<br><small class="muted">maria@garcia-interiors.example</small></td><td>${badgeRaw("Paid", "positive", "outline")}</td><td class="num">${MONEY.lamp}</td></tr>
          <tr><td><span class="code">SO-1038</span><br><small class="muted">Lindqvist Studio</small></td><td>Elin Lindqvist<br><small class="muted">elin@lindqvist.example</small></td><td>${badgeRaw("Paid", "positive", "outline")}</td><td class="num">${MONEY.lamp}</td></td></tr>
        </tbody>
      </table>
    </div>
    <aside class="section" style="position:sticky;top:12px">
      <h3>${ORDER.number} ${badgeRaw("Paid", "positive", "sq")}</h3>
      <div class="body">
        ${facts([["Customer", `${ORDER.customer}<br><span class="muted">${ORDER.email}</span>`], ["Placed", ORDER.placed], ["Paid", MONEY.order], ["Lines", "3, none shipped"]], { stacked: true })}
        <hr class="hr" style="margin:10px 0">
        <div class="btnrow" style="gap:6px"><button class="btn xs">Resend</button><button class="btn xs">Refund</button></div>
        <div style="margin-top:8px"><a href="#" style="font-size:11.5px">Open the full record</a></div>
      </div>
    </aside>
  </div>
  ${pager(1, 11)}
</div>`,
            "Orders",
          ),
        },
        {
          name: "The drawer over the list, with a scrim",
          reference: "Atlassian",
          rationale:
            "The drawer slides over the table rather than beside it, so it can be wider and holds more without squeezing the table to five columns.",
          tradeoff:
            "The row the reader is comparing against is hidden. Atlassian puts the panel beside the main area and only over it at 1024 and below, so this breaks the source rule at 1440.",
          html: shell(
            "Orders",
            `<div class="page do-page" style="position:relative">
  ${phead("Orders", "268 orders. Select a row to read it.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order number, name or email" })}
  <table class="dt dense">
    <thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col">Placed</th><th scope="col" class="num">Paid</th></tr></thead>
    <tbody>
      <tr><td><span class="code">SO-1042</span></td><td>${ORDER.customer}</td><td class="nowrap">8 Oct 09:32</td><td class="num">${MONEY.order}</td></tr>
      <tr><td><span class="code">SO-1041</span></td><td>Tom Becker</td><td class="nowrap">8 Oct 09:30</td><td class="num">EUR 40.45</td></tr>
      <tr><td><span class="code">SO-1040</span></td><td>Elin Lindqvist</td><td class="nowrap">8 Oct 09:27</td><td class="num">${MONEY.lamp}</td></tr>
      <tr><td><span class="code">SO-1039</span></td><td>Maria Garcia</td><td class="nowrap">8 Oct 06:23</td><td class="num">${MONEY.lamp}</td></tr>
    </tbody>
  </table>
  ${drawer(
    `<header><div class="btnrow between"><b>${ORDER.number}</b>${badgeRaw("Paid", "positive", "sq")}</div><p class="muted" style="font-size:11.5px">${ORDER.customer} · ${ORDER.company}</p></header>
     <div class="dbody">
       ${facts([["Placed", ORDER.placed], ["Method", "Card"], ["Paid", MONEY.order], ["Lines", "3, none shipped"], ["Refunds", "None"]], { stacked: true })}
     </div>`,
    { footer: '<button class="btn sm">Resend</button><button class="btn primary sm">Open the record</button>' },
  )}
</div>`,
            "Orders",
          ),
        },
        {
          name: "The drawer holding a small edit, list behind",
          reference: "Carbon",
          rationale:
            "A record and a two-field edit together, which is the one case where a drawer beats a dialog: the reader can see the row and the record at the same time.",
          tradeoff:
            "Two nested sets of controls and one narrow column. Carbon says a modal is not for repeatable work, and this is repeatable work.",
          html: shell(
            "Orders",
            `<div class="page do-page" style="position:relative">
  ${phead("Orders", "268 orders.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order number, name or email" })}
  <table class="dt dense">
    <thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col">State</th></tr></thead>
    <tbody>
      <tr class="is-sel"><td><span class="code">SO-1042</span></td><td>${ORDER.customer}</td><td>${badgeRaw("Paid", "positive", "outline")}</td></tr>
      <tr><td><span class="code">SO-1041</span></td><td>Tom Becker</td><td>${badgeRaw("Paid", "positive", "outline")}</td></tr>
      <tr><td><span class="code">SO-1040</span></td><td>Elin Lindqvist</td><td>${badgeRaw("Completed", "neutral", "outline")}</td></tr>
      <tr><td><span class="code">SO-1039</span></td><td>Maria Garcia</td><td>${badgeRaw("Paid", "positive", "outline")}</td></tr>
    </tbody>
  </table>
  ${drawer(
    `<header><b>${ORDER.number}</b><p class="muted" style="font-size:11.5px">Change one thing. The customer order is not affected.</p></header>
     <div class="dbody"><div class="form">
       ${field("Internal state", '<select class="sel"><option>No answer needed</option><option selected>Calling back</option><option>Waiting on the customer</option></select>')}
       ${field("Note", '<textarea class="ta" style="min-height:70px"></textarea>', { optional: true, help: `Only ${COMPANY.name} sees this.` })}
     </div></div>`,
    { footer: '<button class="btn sm">Cancel</button><button class="btn primary sm">Save</button>' },
  )}
</div>`,
            "Orders",
          ),
        },
        {
          name: "The drawer as a filter, list results behind",
          reference: "Carbon",
          rationale:
            "A drawer that holds the filters rather than a record. The list updates behind it as each control changes, so the reader never leaves the results.",
          tradeoff:
            "Carbon asks that several filter categories never live inside a menu; a drawer is not a menu, but it is the same discovery problem. And it covers the toolbar the reader would use to search.",
          html: shell(
            "Orders",
            `<div class="page do-page" style="position:relative">
  ${phead("Orders", "12 orders match.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Search orders", right: '<button class="btn sm">Filters</button>' })}
  <table class="dt dense">
    <thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col">Placed</th><th scope="col" class="num">Paid</th></tr></thead>
    <tbody>
      ${[
        ["SO-1042", ORDER.customer, "8 Oct 09:32", MONEY.order],
        ["SO-1041", "Tom Becker", "8 Oct 09:30", "EUR 40.45"],
        ["SO-1040", "Elin Lindqvist", "8 Oct 09:27", MONEY.lamp],
        ["SO-1039", "Maria Garcia", "8 Oct 06:23", MONEY.lamp],
      ]
        .map(([no, who, when, amt]) => `<tr><td><span class="code">${no}</span></td><td>${who}</td><td class="nowrap">${when}</td><td class="num">${amt}</td></tr>`)
        .join("")}
    </tbody>
  </table>
  ${pager(1, 1, 1, 4, 12)}
  ${drawer(
    `<header><b>Filters</b><p class="muted" style="font-size:11.5px">2 applied. 12 orders match.</p></header>
     <div class="dbody"><div class="form">
       ${field("Search", input("", { placeholder: "Orders" }))}
       ${field("Product", '<select class="sel"><option selected>Oak desk lamp</option><option>Any product</option></select>')}
       ${field("State", '<select class="sel"><option>Any state</option><option selected>Paid</option></select>')}
       ${field("Date", input("01/10/2026", { cls: "nowrap" }), { help: "From 1 October 2026." })}
       <button class="btn sm ghost">Clear both</button>
     </div></div>`,
    { footer: '<button class="btn primary sm">Show the results</button>' },
  )}
</div>`,
            "Orders",
          ),
        },
        {
          name: "The drawer as a preview, opening over a row",
          reference: "PatternFly",
          rationale:
            "The row's second line opens in a drawer rather than navigating. Cheap for a reader comparing two orders, and it keeps the scroll position and the filters.",
          tradeoff:
            "PatternFly's own guidance reserves primary-detail for comparing a short list of the same type, and requires a selected state and a close control. On 268 orders the comparison is rarer than the navigation.",
          html: shell(
            "Orders",
            `<div class="page" style="position:relative">
  ${phead("Orders", "268 orders. Open a row to read it beside the list.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order number, name or email" })}
  <div style="display:grid;grid-template-columns:minmax(0,1fr) 200px;gap:12px;align-items:start">
    <div>
      <table class="dt dense">
        <thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col">State</th><th scope="col" class="num">Paid</th></tr></thead>
        <tbody>
          <tr class="is-sel"><td><span class="code">SO-1042</span><br><small class="muted">Garcia Interiors</small></td><td>${ORDER.customer}<br><small class="muted">${ORDER.email}</small></td><td>${badgeRaw("Paid", "positive", "outline")}</td><td class="num">${MONEY.order}</td></tr>
          <tr><td><span class="code">SO-1041</span><br><small class="muted">Becker Bouw</small></td><td>Tom Becker<br><small class="muted">tom@becker-bouw.example</small></td><td>${badgeRaw("Paid", "positive", "outline")}</td><td class="num">EUR 40.45</td></tr>
          <tr><td><span class="code">SO-1040</span><br><small class="muted">Goods only</small></td><td>Elin Lindqvist<br><small class="muted">elin@lindqvist.example</small></td><td>${badgeRaw("Completed", "neutral", "outline")}</td><td class="num">${MONEY.lamp}</td></tr>
          <tr><td><span class="code">SO-1039</span><br><small class="muted">Garcia Interiors</small></td><td>Maria Garcia<br><small class="muted">maria@garcia-interiors.example</small></td><td>${badgeRaw("Paid", "positive", "outline")}</td><td class="num">${MONEY.lamp}</td></tr>
        </tbody>
      </table>
    </div>
    <aside class="stack" style="position:sticky;top:12px">
      ${section("Lines", `<div class="stack sm">${split("Oak desk lamp, 2 units<span class='sub'>LMP-OAK-01</span>", MONEY.lineTotal)}${split("Shipping<span class='sub'>tracked parcel</span>", MONEY.shipping)}${split("Gift wrap<span class='sub'>made for this order</span>", "EUR 30.00")}</div>`)}
      ${section("History", `<div class="tl">${timelineEntry("Paid by card", "8 Oct, 09:34", "", "positive")}${timelineEntry("Confirmation sent", "8 Oct, 09:34", "")}${timelineEntry("Order placed", "8 Oct, 09:32", "")}</div>`)}
    </aside>
  </div>
</div>`,
            "Orders",
          ),
        },
        {
          name: "The drawer at phone width, as a page with a Back",
          width: "phone",
          rationale:
            "At 390 pixels there is no beside, so the drawer takes the screen and Back returns to the list at the same scroll position. The behaviour is honest about having no room.",
          tradeoff:
            "Keeping the list alive behind a full-screen view is a navigation model rather than a layout, and it has to hold filters and scroll in memory or the return is a different list.",
          html: shell(
            "Order SO-1042",
            `<div class="page">
  <div class="btnrow between" style="margin-bottom:11px"><button class="btn sm ghost">‹ All orders</button>${badgeRaw("Paid", "positive", "sq")}</div>
  <div class="stack">
    ${section("The customer", facts([["Name", ORDER.customer], ["Email", ORDER.email]], { stacked: true }))}
    ${section("What was bought", `<div class="stmt"><div class="line"><span>${PRODUCT.name}<span class="sub">2 lamps</span></span><span class="fig">${MONEY.lineTotal}</span></div><div class="line"><span>Shipping</span><span class="fig">${MONEY.shipping}</span></div><div class="line"><span>Gift wrap</span><span class="fig">EUR 30.00</span></div><div class="grand"><span>Paid</span><span class="fig">${MONEY.order}</span></div></div>`)}
    ${section("Lines", `<div class="rlist">${recordRow({ title: "Oak desk lamp", sub: "LMP-OAK-01 · 2 units", state: { label: "Not shipped", tone: "neutral" } })}${recordRow({ title: "Gift wrap", sub: "made for this order", state: { label: "Not shipped", tone: "neutral" } })}</div>`)}
  </div>
  <div class="btnrow" style="margin-top:12px"><button class="btn primary w-full">Message the customer</button></div>
</div>`,
            "Orders",
          ),
        },
        {
          name: "A tabbed drawer: the record, its history, its messages",
          reference: "Linear",
          rationale:
            "The way Linear layers its peek view: the row stays selected behind while tabs divide facts from history. Three views in one drawer beat three navigations when support compares refunds.",
          tradeoff:
            "Tabs inside a drawer are two navigations deep on one screen. Readers lose track of which tab held the fact they half-read, and the Back control has two jobs.",
          html: shell(
            "Orders",
            `<div class="page do-page" style="position:relative">
  ${phead("Orders", "268 orders. Select a row to read it.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order number, name or email" })}
  <table class="dt dense">
    <thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col">State</th><th scope="col" class="num">Paid</th></tr></thead>
    <tbody>
      <tr class="is-sel"><td><span class="code">SO-1042</span></td><td>${ORDER.customer}</td><td>${badgeRaw("Paid", "positive", "outline")}</td><td class="num">${MONEY.order}</td></tr>
      <tr><td><span class="code">SO-1041</span></td><td>Tom Becker</td><td>${badgeRaw("Paid", "positive", "outline")}</td><td class="num">EUR 40.45</td></tr>
      <tr><td><span class="code">SO-1040</span></td><td>Elin Lindqvist</td><td>${badgeRaw("Completed", "neutral", "outline")}</td><td class="num">${MONEY.lamp}</td></tr>
      <tr><td><span class="code">SO-1039</span></td><td>Maria Garcia</td><td>${badgeRaw("Paid", "positive", "outline")}</td><td class="num">${MONEY.lamp}</td></tr>
    </tbody>
  </table>
  ${drawer(
    `<header><div class="btnrow between"><b>${ORDER.number}</b>${badgeRaw("Paid", "positive", "sq")}</div><p class="muted" style="font-size:11.5px">${ORDER.customer} · ${ORDER.company}</p></header>
     <div class="dbody">
       ${tabs(["Record", "History", "Messages"], 1)}
       <div class="tl">${timelineEntry("Confirmation resent", "8 Oct, 11:02", PEOPLE.support.name, "neutral")}${timelineEntry("Paid by card", "8 Oct, 09:34", "", "positive")}${timelineEntry("Order placed", "8 Oct, 09:32", "", "neutral", true)}</div>
     </div>`,
    { footer: '<button class="btn sm">Resend</button><button class="btn primary sm">Open the record</button>' },
  )}
</div>`,
            "Orders",
          ),
        },
        {
          name: "A drawer with a drag edge",
          reference: "VS Code",
          rationale:
            "The way VS Code sizes its side bar: a drag edge lets the reader trade list width for record width per task. A wide lines table gets room without a navigation, and a narrow read keeps the list.",
          tradeoff:
            "A width the reader sets is a width the layout must remember and repair. Every stored pixel is state that follows the reader to a narrower screen, where it has to be clamped.",
          html: shell(
            "Orders",
            `<div class="page do-page" style="position:relative">
  ${phead("Orders", "268 orders. Select a row to read it.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order number, name or email" })}
  <table class="dt dense">
    <thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col">State</th><th scope="col" class="num">Paid</th></tr></thead>
    <tbody>
      <tr class="is-sel"><td><span class="code">SO-1042</span></td><td>${ORDER.customer}</td><td>${badgeRaw("Paid", "positive", "outline")}</td><td class="num">${MONEY.order}</td></tr>
      <tr><td><span class="code">SO-1041</span></td><td>Tom Becker</td><td>${badgeRaw("Paid", "positive", "outline")}</td><td class="num">EUR 40.45</td></tr>
      <tr><td><span class="code">SO-1040</span></td><td>Elin Lindqvist</td><td>${badgeRaw("Completed", "neutral", "outline")}</td><td class="num">${MONEY.lamp}</td></tr>
    </tbody>
  </table>
  ${drawer(
    `<header><div class="btnrow between"><b>${ORDER.number}</b>${badgeRaw("Paid", "positive", "sq")}</div><p class="muted" style="font-size:11.5px">${ORDER.customer} · ${ORDER.company}</p></header>
     <div class="dbody">
       ${facts([["Placed", ORDER.placed], ["Method", "Card"], ["Paid", MONEY.order], ["Lines", "3, none shipped"]], { stacked: true })}
       <hr class="hr" style="margin:10px 0">
       <div class="stack sm">${split("Oak desk lamp, 2 units<span class='sub'>LMP-OAK-01</span>", MONEY.lineTotal)}${split("Shipping<span class='sub'>tracked parcel</span>", MONEY.shipping)}${split("Gift wrap<span class='sub'>made for this order</span>", "EUR 30.00")}</div>
       <p class="muted" style="font-size:11px;margin-top:10px">Drag the left edge to widen. The width is kept for this browser.</p>
     </div>`,
    { footer: '<button class="btn sm">Resend</button><button class="btn primary sm">Open the record</button>' },
  )}
</div>`,
            "Orders",
          ),
        },
      ],
    },
    {
      id: "overlay-toast",
      title: "A toast at the edge of the screen",
      why: "A short message after a command. The constraints are firm: <b>Material allows one action per snackbar and neither may be Dismiss</b>, Carbon keeps an action-bearing toast until dismissed, and nothing critical may go in something that disappears on a timer.",
      verdict: "Ship A for success and B where an undo exists, with the undo toast staying until dismissed. The toast that links to the result is the runner-up for commands whose result lives elsewhere, because the link going away costs nothing. Never ship D or E: two actions turn a transient message into a panel with a timer, and a toast must never be the only route to a result.",
      variants: [
        {
          name: "A confirmation that closes by itself",
          pick: true,
          reference: "Base UI",
          rationale:
            "No action on it, so it can leave on its own. Base UI's default timeout is 5,000 milliseconds, and nothing is lost by it going.",
          tradeoff:
            "NN/g's own example: a reader missed an error that faded after five seconds and waited five minutes. Fine for a success, wrong for anything else.",
          html: shell(
            "Resend confirmations",
            `<div class="page">
  ${phead("Orders", "268 orders. 3 selected.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order number, name or email" })}
  <div style="display:grid;grid-template-columns:minmax(0,1fr) 215px;gap:12px;align-items:start">
    <div>
      <table class="dt dense">
        <thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col">State</th><th scope="col" class="num">Paid</th></tr></thead>
        <tbody>
          ${[
            ["SO-1042", ORDER.customer, "Paid", "positive", MONEY.order],
            ["SO-1041", "Tom Becker", "Paid", "positive", "EUR 40.45"],
            ["SO-1040", "Elin Lindqvist", "Completed", "neutral", MONEY.lamp],
            ["SO-1039", "Maria Garcia", "Paid", "positive", MONEY.lamp],
          ]
            .map(
              ([no, who, st, tone, amt], i) => `<tr${i < 2 ? ' class="sel"' : ""}><td><span class="code">${no}</span></td><td>${who}</td><td>${badgeRaw(st, tone, "outline")}</td><td class="num">${amt}</td></tr>`,
            )
            .join("")}
        </tbody>
      </table>
    </div>
    <aside class="section"><h3>${ORDER.number}</h3><div class="body">${facts([["Customer", ORDER.customer], ["Paid", MONEY.order]], { stacked: true })}</div></aside>
  </div>
  <div style="position:absolute;right:14px;bottom:14px">${toast("positive", "Confirmations resent to 3 customers.")}</div>
</div>`,
            "Orders",
          ),
        },
        {
          name: "A confirmation carrying an undo, which stays",
          reference: "Carbon",
          rationale:
            "The toast carries one action and persists until it is dismissed, which is Carbon's rule for an actionable notification. Undo is the action, and nothing else competes for it.",
          tradeoff:
            "A toast that stays is on screen until the reader deals with it, so a page where the reader moves on accumulates one. Android's own guidance warns a snackbar's timer can take the action away.",
          html: shell(
            "Resend confirmations",
            `<div class="page">
  ${phead("Orders", "268 orders. 3 selected.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order number, name or email" })}
  <table class="dt dense">
    <thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col">State</th><th scope="col" class="num">Paid</th></tr></thead>
    <tbody>
      ${[
        ["SO-1042", ORDER.customer, "Paid", "positive", MONEY.order],
        ["SO-1041", "Tom Becker", "Paid", "positive", "EUR 40.45"],
        ["SO-1040", "Elin Lindqvist", "Completed", "neutral", MONEY.lamp],
        ["SO-1039", "Maria Garcia", "Paid", "positive", MONEY.lamp],
      ]
        .map(
          ([no, who, st, tone, amt], i) => `<tr${i < 2 ? ' class="sel"' : ""}><td><span class="code">${no}</span></td><td>${who}</td><td>${badgeRaw(st, tone, "outline")}</td><td class="num">${amt}</td></tr>`,
        )
        .join("")}
    </tbody>
  </table>
  <div style="position:absolute;right:14px;bottom:14px">${toast("positive", "Confirmations resent to 3 customers.", { undo: true })}</div>
</div>`,
            "Orders",
          ),
        },
        {
          name: "A refusal, which is not a toast",
          reference: "Carbon",
          rationale:
            "The same slot filled with a refusal, to show why a failure must not be transient. An alert sits on the page and stays until the command succeeds.",
          tradeoff:
            "The visual difference between a success toast and an error alert has to be learned, and Carbon's guidance is that a tone never paints a full-width band on a page about other work.",
          html: shell(
            "Resend confirmations",
            `<div class="page">
  ${phead("Orders", "268 orders. 3 selected.", "", { crumb: trail("Home", "Orders") })}
  <div class="alert destructive" style="margin-bottom:12px" role="alert" data-slot="problem-alert" data-code="comms/message.not-deliverable">
    <span class="ico" aria-hidden="true">✕</span>
    <span class="txt"><b>2 of the 3 confirmations could not be resent</b><small>Elin Lindqvist and Ade Okafor asked for no messages. Nothing was sent to them.</small></span>
    <span class="tail"><span class="linkish" style="font-size:11.5px">Why?</span></span>
  </div>
  ${toolbar({ search: "", placeholder: "Order number, name or email" })}
  <table class="dt dense">
    <thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col">State</th><th scope="col" class="num">Paid</th></tr></thead>
    <tbody>
      ${[
        ["SO-1042", ORDER.customer, "Paid", "positive", MONEY.order],
        ["SO-1037", "Elin Lindqvist", "Refunded", "neutral", MONEY.lamp],
        ["SO-1040", "Elin Lindqvist", "Completed", "neutral", MONEY.lamp],
        ["SO-1039", "Maria Garcia", "Paid", "positive", MONEY.lamp],
      ]
        .map(
          ([no, who, st, tone, amt], i) => `<tr${i < 2 ? ' class="sel"' : ""}><td><span class="code">${no}</span></td><td>${who}</td><td>${badgeRaw(st, tone, "outline")}</td><td class="num">${amt}</td></tr>`,
        )
        .join("")}
    </tbody>
  </table>
</div>`,
            "Orders",
          ),
        },
        {
          name: "A toast carrying two actions",
          reference: "Material Design",
          rationale:
            "The toast offering Undo and Dismiss together, which is the shape most people reach for first.",
          tradeoff:
            "Material forbids it: one action per snackbar, and it may not be Dismiss. Two buttons turn a transient message into a small panel with a timer.",
          html: shell(
            "Close price tier",
            `<div class="page">
  ${phead("Standard tier", "9,412 units sold and all shipped.", "", { crumb: trail("Home", "Products", "Standard tier") })}
  ${section("The tier", facts([["Sold", "9,412 of 10,000"], ["Shipped", "9,380"], ["Unshipped", "32"]]))}
  <div style="position:absolute;right:14px;bottom:14px">
    <div class="toast" style="min-width:300px">
      <span aria-hidden="true" style="color:var(--caution-surface-foreground)">!</span>
      <span><b>The price tier was closed.</b><br><span class="muted" style="font-size:11.5px">32 units are unshipped and can still ship.</span></span>
      <span class="tail" style="gap:10px"><span class="undo">Undo</span><span class="muted">Dismiss</span></span>
    </div>
  </div>
</div>`,
            "Products",
          ),
        },
        {
          name: "A toast that is the only route to the result",
          reference: "Carbon",
          rationale:
            "The toast says the export finished and offers Download, which is the only way to get the file. A message that vanishes takes the result with it.",
          tradeoff:
            "Carbon states it directly: because toasts can dismiss automatically, users must be able to access the result elsewhere. This violates that on purpose, to show what it costs.",
          html: shell(
            "Export orders",
            `<div class="page">
  ${phead("Orders", "268 orders.", '<button class="btn sm">Export</button>', { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order number, name or email" })}
  ${section("", `<table class="dt dense"><thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col" class="num">Paid</th></tr></thead><tbody><tr><td><span class="code">SO-1042</span></td><td>${ORDER.customer}</td><td class="num">${MONEY.order}</td></tr></tbody></table>`, { flush: true })}
  <div style="position:absolute;right:14px;bottom:14px">
    <div class="toast" style="min-width:300px">
      <span aria-hidden="true" style="color:var(--positive-surface-foreground)">✓</span>
      <span><b>Your export is ready.</b><br><span class="muted" style="font-size:11.5px">orders-2026-10-08.csv, 268 rows</span></span>
      <span class="tail"><span class="undo">Download</span></span>
    </div>
  </div>
</div>`,
            "Orders",
          ),
        },
        {
          name: "A stacked notification area",
          reference: "Base UI",
          rationale:
            "Three toasts stacked at the bottom edge, so several commands in quick succession each say what they did. Base UI caps the viewport at three.",
          tradeoff:
            "A stack on a page the reader is working through covers the bottom-right of the table, which is where the pagination and the bulk bar live.",
          html: shell(
            "Bulk action",
            `<div class="page">
  ${phead("Refunds", "31 orders. 25 selected.", "", { crumb: trail("Home", "Orders", "Refunds") })}
  ${toolbar({ search: "", placeholder: "Search refunds" })}
  <table class="dt dense">
    <thead><tr><th class="check"><input type="checkbox" checked aria-label="Select all"></th><th scope="col">Order</th><th scope="col">Customer</th><th scope="col">State</th><th scope="col" class="num">Amount</th></tr></thead>
    <tbody>
      ${[
        ["SO-1042", ORDER.customer, "Open", "neutral", MONEY.lineTotal],
        ["SO-1041", "Tom Becker", "Open", "neutral", MONEY.lamp],
        ["SO-1036", "Ade Okafor", "Open", "neutral", MONEY.lamp],
        ["SO-1039", "Maria Garcia", "Open", "neutral", MONEY.lamp],
      ]
        .map(([no, who, st, tone, amt]) => `<tr class="is-sel"><td class="check"><input type="checkbox" checked aria-label="Select ${no}"></td><td><span class="code">${no}</span></td><td>${who}</td><td>${badgeRaw(st, tone, "outline")}</td><td class="num">${amt}</td></tr>`)
        .join("")}
    </tbody>
  </table>
  <div style="position:absolute;right:14px;bottom:14px;display:flex;flex-direction:column;gap:7px;width:280px">
    ${toast("positive", "12 refunds offered as credit.")}
    ${toast("positive", "3 customers emailed.")}
    ${toast("caution", "1 refund was refused by the bank.")}
  </div>
</div>`,
            "Orders",
          ),
        },
        {
          name: "A toast that links to the result",
          reference: "Vercel",
          rationale:
            "The way Vercel ends a deployment toast: the message links to the result, and the result also waits on the page. The toast going away costs nothing because the file does not go with it.",
          tradeoff:
            "Two routes to one result need the same name in both places. Where the names drift, the reader stops trusting the link and opens the page instead.",
          html: shell(
            "Export orders",
            `<div class="page do-page">
  ${phead("Orders", "268 orders.", '<button class="btn sm">Export</button>', { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order number, name or email" })}
  ${section("Latest exports", `<div class="rlist">${recordRow({ title: "orders-2026-10-08.csv", sub: "268 rows · ready just now", actions: '<button class="btn xs">Download</button>' })}${recordRow({ title: "orders-2026-10-01.csv", sub: "241 rows", actions: '<button class="btn xs">Download</button>' })}</div>`)}
  <div class="do-toast-pos">
    <div class="toast" style="min-width:300px">
      <span aria-hidden="true" style="color:var(--positive-surface-foreground)">✓</span>
      <span><b>Your export is ready.</b><br><span class="muted" style="font-size:11.5px">orders-2026-10-08.csv, 268 rows</span></span>
      <span class="tail"><span class="undo">Open the file</span></span>
    </div>
  </div>
</div>`,
            "Orders",
          ),
        },
        {
          name: "A progress toast while a slow command runs",
          reference: "Shopify",
          rationale:
            "The way Shopify reports a bulk export: a persistent notice with a bar and a count, dismissible only by cancelling. The reader keeps working while the count climbs.",
          tradeoff:
            "A toast that cannot be dismissed is a band with a timer that never fires. Past five minutes it is clutter rather than feedback, and it still covers the pagination.",
          html: shell(
            "Export orders",
            `<div class="page do-page">
  ${phead("Orders", "268 orders.", '<button class="btn sm">Export</button>', { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order number, name or email" })}
  ${section("", `<table class="dt dense"><thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col" class="num">Paid</th></tr></thead><tbody><tr><td><span class="code">SO-1042</span></td><td>${ORDER.customer}</td><td class="num">${MONEY.order}</td></tr><tr><td><span class="code">SO-1041</span></td><td>Tom Becker</td><td class="num">EUR 40.45</td></tr></tbody></table>`, { flush: true })}
  <div class="do-toast-pos">
    <div class="toast" style="min-width:300px;flex-direction:column;align-items:stretch;gap:8px">
      <div style="display:flex;gap:9px;align-items:flex-start"><span aria-hidden="true" style="color:var(--info-surface-foreground)">i</span><span><b>Exporting 166 of 268 orders.</b><br><span class="muted" style="font-size:11.5px">About a minute left. The file appears under Latest exports.</span></span></div>
      ${progress(62, true)}
    </div>
  </div>
</div>`,
            "Orders",
          ),
        },
      ],
    },
    {
      id: "overlay-menu",
      title: "A menu of a row's commands",
      why: "The row's other commands sit behind an overflow. The first command draws inline and the rest sit behind a menu; the rule is that a row's other commands go in its row menu.",
      verdict: "Ship A: grouped items, the destructive one last after a separator, nothing disabled without a reason. B is the runner-up where a command is often disabled, because the reason in place beats a hover. Never ship C: a confirmation inside a menu is a dialog over a menu, the same nesting the project forbids for dialogs.",
      variants: [
        {
          name: "A menu with groups and a destructive item last",
          pick: true,
          rationale:
            "The recommended shape. The items are grouped under small headings and the destructive one sits at the end, after a separator, in the destructive tone. Nothing is disabled without a reason.",
          tradeoff:
            "A menu item that is disabled gives no reason in the menu itself, so the reader has to hover or press it to learn why. An explained action solves that on the page, not here.",
          html: shell(
            "Row menu",
            `<div class="page" style="position:relative">
  ${phead("Orders", "268 orders.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order number, name or email" })}
  <div class="do-scroll"><table class="dt dense">
    <thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col">State</th><th scope="col" class="num">Paid</th><th scope="col" style="width:1%"></th></tr></thead>
    <tbody>
      <tr><td><span class="code">SO-1042</span><br><small class="muted">Garcia Interiors</small></td><td>${ORDER.customer}<br><small class="muted">${ORDER.email}</small></td><td>${badgeRaw("Paid", "positive", "outline")}</td><td class="num">${MONEY.order}</td><td class="num"><button class="btn sm">Resend</button> <button class="btn sm icon" aria-label="More actions for SO-1042">⋯</button></td></tr>
      <tr><td><span class="code">SO-1041</span><br><small class="muted">Becker Bouw</small></td><td>Tom Becker<br><small class="muted">tom@becker-bouw.example</small></td><td>${badgeRaw("Paid", "positive", "outline")}</td><td class="num">EUR 40.45</td><td class="num"><button class="btn sm">Resend</button> <button class="btn sm icon" aria-label="More actions for SO-1041">⋯</button></td></tr>
      <tr><td><span class="code">SO-1034</span><br><small class="muted">Okafor Office</small></td><td>Ade Okafor<br><small class="muted">ade@okafor.example</small></td><td>${badgeRaw("Disputed", "destructive", "outline")}</td><td class="num">${MONEY.lamp}</td><td class="num"><button class="btn sm">Resend</button> <button class="btn sm icon" aria-label="More actions for SO-1034">⋯</button></td></tr>
    </tbody>
  </table></div>
  <div class="do-menu-a">${menu(
    [
      { label: "Open the record" },
      { label: "Resend the confirmation", icon: "✉" },
      { label: "Refund", icon: "↩" },
      { label: "Void the pickup code", icon: "✕", disabled: true },
      "-",
      { label: "Report a problem", icon: "⚑" },
      { label: "Copy the order number", icon: "⧉", shortcut: "⌘C" },
    ],
    { width: "200px" },
  )}</div>
</div>`,
            "Orders",
          ),
        },
        {
          name: "A menu that says why an item is disabled",
          rationale:
            "The disabled item carries its reason in place, so the reader learns it without pressing it. This is the fix for a menu whose commands are conditionally absent.",
          tradeoff:
            "A reason inside a menu is a paragraph among one-word items, so the menu becomes taller than the row that opened it.",
          html: shell(
            "Row menu",
            `<div class="page" style="position:relative">
  ${phead("Orders", "268 orders.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order number, name or email" })}
  <div class="do-scroll"><table class="dt dense">
    <thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col">State</th><th scope="col" class="num">Paid</th><th scope="col" style="width:1%"></th></tr></thead>
    <tbody>
      <tr><td><span class="code">SO-1042</span><br><small class="muted">Garcia Interiors</small></td><td>${ORDER.customer}<br><small class="muted">${ORDER.email}</small></td><td>${badgeRaw("Paid", "positive", "outline")}</td><td class="num">${MONEY.order}</td><td class="num"><button class="btn sm">Resend</button> <button class="btn sm icon" aria-label="More actions for SO-1042">⋯</button></td></tr>
    </tbody>
  </table></div>
  <div class="do-menu-b">
    <div class="menu" style="width:235px">
      <div class="mi">Open the record</div>
      <div class="mi">Resend the confirmation</div>
      <div class="mi">Refund</div>
      <div class="sep"></div>
      <div style="padding:7px 8px 8px">
        <div style="font-size:12px;opacity:.5">Void the pickup code</div>
        <div style="font-size:11px;color:var(--muted-foreground);margin-top:2px">Both parcels were collected at 22:41. A code that already collected goods cannot be voided.</div>
      </div>
    </div>
  </div>
</div>`,
            "Orders",
          ),
        },
        {
          name: "A menu with a confirmation inside it",
          reference: "Atlassian",
          rationale:
            "A destructive item opens its confirmation from inside the menu, so the menu stays and the question appears beside the row it applies to.",
          tradeoff:
            "That is a dialog opening over a menu, which is a menu opening a dialog. Atlassian forbids a dialog triggering another dialog; the same reasoning applies to a menu.",
          html: shell(
            "Row menu",
            `<div class="page" style="position:relative">
  ${phead("Orders", "268 orders.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order number, name or email" })}
  <table class="dt dense">
    <thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col">State</th><th scope="col" class="num">Paid</th><th scope="col" style="width:1%"></th></tr></thead>
    <tbody>
      <tr><td><span class="code">SO-1034</span><br><small class="muted">Okafor Office</small></td><td>Ade Okafor<br><small class="muted">ade@okafor.example</small></td><td>${badgeRaw("Disputed", "destructive", "outline")}</td><td class="num">${MONEY.lamp}</td><td class="num"><button class="btn sm icon" aria-label="More actions for SO-1034">⋯</button></td></tr>
    </tbody>
  </table>
  <div style="position:absolute;right:230px;bottom:120px;width:250px">
    <div class="pop" style="box-shadow:0 8px 22px var(--scroll-shade)">
      <div class="cap">Withdraw the dispute</div>
      <div style="padding:0 8px 8px;font-size:12px">The payment provider is told the company accepts the charge. This cannot be taken back.</div>
      <div class="btnrow" style="padding:0 8px 7px;gap:6px"><button class="btn xs">Keep it open</button><button class="btn xs danger">Withdraw</button></div>
    </div>
  </div>
</div>`,
            "Orders",
          ),
        },
        {
          name: "A menu as a split button: the first command and the rest",
          rationale:
            "One button carries the first command and its own half carries the menu, so both are reachable without the reader ever opening anything to find the first one.",
          tradeoff:
            "Two targets in one shape, and the second half is a chevron that a reader may read as 'open' rather than 'the rest'. It also breaks where a button would wrap.",
          html: shell(
            "Publish price list",
            `<div class="page">
  ${phead("Oak desk lamp", "LMP-OAK-01 · 412 in stock. 0 of 500 sold.", '<div class="btn-split primary"><button>Publish the price list</button><button aria-label="More ways to publish">▾</button></div>', { crumb: trail("Home", "Products", PRODUCT.name, "Pricing") })}
  ${section(
    "What would be published",
    `<table class="dt dense">
      <thead><tr><th scope="col">Product</th><th scope="col" class="num">Price</th><th scope="col" class="num">Stock</th><th scope="col">State</th></tr></thead>
      <tbody>
        <tr><td>Oak desk lamp</td><td class="num">${MONEY.lamp}</td><td class="num">412</td><td>${badgeRaw("Priced", "positive", "outline")}</td></tr>
        <tr><td>Oak desk lamp, small</td><td class="num">EUR 35.00</td><td class="num">400</td><td>${badgeRaw("Priced", "positive", "outline")}</td></tr>
      </tbody>
    </table>`,
    { flush: true, acts: '<span class="badge info">Scheduled for 13 Jan 2026, 10:00</span>' },
  )}
  <div style="position:absolute;right:24px;top:110px">
    ${menu([{ label: "Publish now, ignoring the date" }, { label: "Schedule it for another time" }, "-", { label: "Save as a template" }], { width: "230px" })}
  </div>
</div>`,
            "Products",
          ),
        },
        {
          name: "No menu: the row's commands are all on the row",
          reference: "NN/g",
          rationale:
            "One or two commands inline and nothing hidden, for a row whose whole set is small. NN/g's ceiling for inline placement is two.",
          tradeoff:
            "Two buttons plus a checkbox plus five columns is a wide row, and it stops fitting at 24-pixel density. And it breaks the moment a third command arrives.",
          html: shell(
            "Products",
            `<div class="page">
  ${phead("Products", "93 for sale.", "", { crumb: trail("Home", "Products") })}
  ${toolbar({ search: "", placeholder: "Search products", views: [{ label: "For sale 93", on: true }, { label: "Draft 148" }, { label: "All 241" }] })}
  ${section(
    "",
    `<table class="dt dense">
      <thead><tr><th scope="col">Product</th><th scope="col">Updated</th><th scope="col">State</th><th scope="col" class="num">Sold</th><th scope="col" style="width:1%"></th></tr></thead>
      <tbody>
        ${[
          ["Oak desk lamp", "9 Oct 2026", "Scheduled", "info", "1 of 500"],
          ["Oak floor lamp", "16 Oct 2026", "Scheduled", "info", "7 of 400"],
          ["Oak wall light", "14 Mar 2026", "Draft", "neutral", "0 of 1,000"],
        ]
          .map(
            ([nm, when, st, tone, sold]) => `<tr><td><b>${nm}</b></td><td class="nowrap">${when}</td><td>${badgeRaw(st, tone, "outline")}</td><td class="num">${sold}</td><td class="num" style="white-space:nowrap"><button class="btn xs">Open</button> <button class="btn xs">Publish</button></td></tr>`,
          )
          .join("")}
      </tbody>
    </table>`,
    { flush: true },
  )}
  ${pager(1, 10)}
</div>`,
            "Products",
          ),
        },
        {
          name: "A menu on the page rather than the row",
          rationale:
            "A page-level overflow holding every command for the record, rather than a menu per row. One menu instead of twenty-five.",
          tradeoff:
            "A command that applies to one record cannot live in a page-level menu, and the row-menu rule says a row's commands go in its row menu. This inverts that rule.",
          html: shell(
            "Record page",
            `<div class="page">
  ${trail("Home", "Orders", ORDER.number)}
  <div class="phead">
    <div><h1>${ORDER.number} ${badgeRaw("Paid", "positive")}</h1><p class="desc">${ORDER.customer} · ${ORDER.company}</p></div>
    <div class="acts"><button class="btn primary">Message customer</button>${menu([{ label: "Resend the confirmation" }, { label: "Refund" }, { label: "Refund part of it" }, "-", { label: "Void the pickup code", disabled: true }, { label: "Copy the order number", shortcut: "⌘C" }], { width: "200px" })}</div>
  </div>
  ${section("The customer", facts([["Name", ORDER.customer], ["Email", ORDER.email]]))}
  ${section("What was bought", `<div class="stmt"><div class="line"><span>${PRODUCT.name}, 2 lamps</span><span class="fig">${MONEY.lineTotal}</span></div><div class="line"><span>Shipping</span><span class="fig">${MONEY.shipping}</span></div><div class="grand"><span>Paid</span><span class="fig">${MONEY.order}</span></div></div>`)}
</div>`,
            "Orders",
          ),
        },
        {
          name: "A menu with a search field at the top",
          reference: "Linear",
          rationale:
            "The way Linear filters its command menu: typing narrows twenty commands to one without submenus. Suited to rows whose command set keeps growing past what a scan can hold.",
          tradeoff:
            "A search field in a menu needs focus on open, which steals the keys a reader uses to move. With six commands it is furniture around a list nobody filters.",
          html: shell(
            "Row menu",
            `<div class="page do-page" style="position:relative">
  ${phead("Orders", "268 orders.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order number, name or email" })}
  <div class="do-scroll"><table class="dt dense">
    <thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col">State</th><th scope="col" class="num">Paid</th><th scope="col" style="width:1%"></th></tr></thead>
    <tbody>
      <tr class="is-sel"><td><span class="code">SO-1042</span><br><small class="muted">Garcia Interiors</small></td><td>${ORDER.customer}<br><small class="muted">${ORDER.email}</small></td><td>${badgeRaw("Paid", "positive", "outline")}</td><td class="num">${MONEY.order}</td><td class="num"><button class="btn sm">Resend</button> <button class="btn sm icon" aria-label="More actions for SO-1042">⋯</button></td></tr>
      <tr><td><span class="code">SO-1041</span><br><small class="muted">Becker Bouw</small></td><td>Tom Becker<br><small class="muted">tom@becker-bouw.example</small></td><td>${badgeRaw("Paid", "positive", "outline")}</td><td class="num">EUR 40.45</td><td class="num"><button class="btn sm">Resend</button> <button class="btn sm icon" aria-label="More actions for SO-1041">⋯</button></td></tr>
    </tbody>
  </table></div>
  <div class="do-menu-a">
    <div class="menu" style="width:230px">
      <div style="padding:2px 2px 5px"><input class="inp" value="re" placeholder="Filter commands" aria-label="Filter commands"></div>
      <div class="mi">Open the record</div>
      <div class="mi">Resend the confirmation</div>
      <div class="mi">Refund</div>
      <div class="mi">Report a problem</div>
      <div class="sep"></div>
      <div style="padding:4px 8px;font-size:11px;color:var(--muted-foreground)">4 of 7 commands</div>
    </div>
  </div>
</div>`,
            "Orders",
          ),
        },
        {
          name: "Grouped commands behind submenus",
          reference: "Radix UI",
          rationale:
            "The way Radix UI nests submenus, which is what the shadcn menu is built on: Refund opens sideways into its three routes. Groups stay visible while the choice stays one hover away.",
          tradeoff:
            "Sideways menus punish every reader on touch, where hover does not exist. Three routes fit; a fourth means the submenu needs its own scroll, and then it is a panel.",
          html: shell(
            "Row menu",
            `<div class="page do-page" style="position:relative">
  ${phead("Orders", "268 orders.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order number, name or email" })}
  <div class="do-scroll"><table class="dt dense">
    <thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col">State</th><th scope="col" class="num">Paid</th><th scope="col" style="width:1%"></th></tr></thead>
    <tbody>
      <tr class="is-sel"><td><span class="code">SO-1042</span><br><small class="muted">Garcia Interiors</small></td><td>${ORDER.customer}<br><small class="muted">${ORDER.email}</small></td><td>${badgeRaw("Paid", "positive", "outline")}</td><td class="num">${MONEY.order}</td><td class="num"><button class="btn sm">Resend</button> <button class="btn sm icon" aria-label="More actions for SO-1042">⋯</button></td></tr>
      <tr><td><span class="code">SO-1041</span><br><small class="muted">Becker Bouw</small></td><td>Tom Becker<br><small class="muted">tom@becker-bouw.example</small></td><td>${badgeRaw("Paid", "positive", "outline")}</td><td class="num">EUR 40.45</td><td class="num"><button class="btn sm">Resend</button> <button class="btn sm icon" aria-label="More actions for SO-1041">⋯</button></td></tr>
    </tbody>
  </table></div>
  <div class="do-sub-wrap">
    <div class="menu" style="width:190px">
      <div class="mi">Open the record</div>
      <div class="mi">Resend the confirmation</div>
      <div class="mi">Refund<span class="sc">›</span></div>
      <div class="sep"></div>
      <div class="mi">Copy the order number<span class="sc">⌘C</span></div>
    </div>
    <div class="menu" style="width:200px">
      <div class="mi">Refund in full</div>
      <div class="mi">Refund part of it</div>
      <div class="mi">Offer credit for a future order</div>
    </div>
  </div>
</div>`,
            "Orders",
          ),
        },
      ],
    },
    {
      id: "overlay-popover",
      title: "A short panel that opens beside a control",
      why: "Not a dialog and not a toast: something anchored to a control, closing when the reader looks away. The question is what earns one, given the rule that <b>a reference to another record is chosen from a picker</b> and nothing else floats.",
      verdict: "Ship B: a defined term carries its glossary entry where it is read, and only for terms the application has defined. A is the runner-up for dense lists where a hover card saves a navigation, on focus as well as hover. Never ship F: a menu and a popover open together teach that floating layers stack, which the one-overlay rule refuses.",
      variants: [
        {
          name: "A row preview popover on hover and focus",
          rationale:
            "Hovering a parcel code shows the parcel's facts. It gives context without leaving the list and costs one read.",
          tradeoff:
            "A hover affordance is invisible on touch and undiscoverable at all. It needs focus as well as hover, and then it is two renders of every row.",
          html: shell(
            "Orders",
            `<div class="page">
  ${phead("Orders", "268 orders.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order number, name or email" })}
  ${section(
    "",
    `<table class="dt dense">
      <thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col">Parcel</th><th scope="col">State</th><th scope="col" class="num">Paid</th></tr></thead>
      <tbody>
        <tr><td><span class="code">SO-1042</span></td><td>${ORDER.customer}</td><td><span class="copyable"><span class="code">PCK-…68A2</span><button aria-label="Copy the parcel code">⧉</button></span></td><td>${badgeRaw("Paid", "positive", "outline")}</td><td class="num">${MONEY.order}</td></tr>
        <tr><td><span class="code">SO-1041</span></td><td>Tom Becker</td><td><span class="copyable"><span class="code">PCK-…68A3</span><button aria-label="Copy the parcel code">⧉</button></span></td><td>${badgeRaw("Paid", "positive", "outline")}</td><td class="num">EUR 40.45</td></tr>
        <tr><td><span class="code">SO-1040</span></td><td>Elin Lindqvist</td><td><span class="copyable"><span class="code">PCK-…9F14</span><button aria-label="Copy the parcel code">⧉</button></span></td><td>${badgeRaw("Completed", "neutral", "outline")}</td><td class="num">${MONEY.lamp}</td></tr>
        <tr><td><span class="code">SO-1039</span></td><td>Maria Garcia</td><td><span class="copyable"><span class="code">PCK-…71C4</span><button aria-label="Copy the parcel code">⧉</button></span></td><td>${badgeRaw("Paid", "positive", "outline")}</td><td class="num">${MONEY.lamp}</td></tr>
      </tbody>
    </table>`,
    { flush: true },
  )}
  <div class="do-pop-a">
    <div class="pop" style="width:230px;box-shadow:0 8px 22px var(--scroll-shade)">
      <div style="padding:7px 8px;border-bottom:1px solid var(--border)"><b style="font-size:12.5px">PCK-0C893968A2</b><div class="muted" style="font-size:11px">Oak desk lamp, 2 units · order SO-1042</div></div>
      <div style="padding:7px 8px;display:flex;flex-direction:column;gap:4px;font-size:12px">
        <div class="split"><span class="muted">Holds</span><span>2 lamps</span></div>
        <div class="split"><span class="muted">For</span><span>Maria Garcia</span></div>
        <div class="split"><span class="muted">Packed</span><span>8 Oct, 09:34</span></div>
        <div class="split"><span class="muted">Collected</span><span>${badgeRaw("Not collected", "neutral", "sq")}</span></div>
      </div>
    </div>
  </div>
</div>`,
            "Orders",
          ),
        },
        {
          name: "A popover that explains what a term means",
          pick: true,
          rationale:
            "A word somebody may not know carries its glossary entry beside it. It answers the question where it is asked.",
          tradeoff:
            "Only for a term the application has defined. A hint on every unfamiliar word becomes noise, and the glossary has to stay in step with the hint.",
          html: shell(
            "Plan costs",
            `<div class="page" style="max-width:560px">
  ${trail("Home", "Invoices", "Costs")}
  <div class="phead"><div><h1>What the plan costs</h1><p class="desc">Every charge on the account, and what it is for.</p></div></div>
  ${section(
    "",
    `<div class="stmt">
      <div class="line"><span>Business plan<span class="sub">${MONEY.subscription} a month</span></span><span class="fig">${MONEY.subscription}</span></div>
      <div class="line">
        <span style="display:inline-flex;align-items:center;gap:5px">Order fee<span class="tip" style="position:static">0.5% of every order total. It pays for payment handling.</span><button class="btn xs icon" aria-label="What is an order fee?">?</button></span>
        <span class="fig">EUR 270.90</span>
      </div>
      <div class="line"><span>Per-line fee<span class="sub">EUR 0.25 on each line, once</span></span><span class="fig">EUR 236.00</span></div>
      <div class="sub-total"><span>Total for September</span><span class="fig">EUR 555.90</span></div>
      <div class="grand"><span>Payable on 4 November</span><span class="fig">EUR 555.90</span></div>
    </div>`,
  )}
</div>`,
            "Invoices",
          ),
        },
        {
          name: "A popover carrying the whole picker",
          rationale:
            "The record picker's list opens in a popover rather than a dialog, anchored to the field, so the rest of the form stays visible behind it.",
          tradeoff:
            "This is what the picker in the forms category already is. It only works while the list is short enough to sit under the field without leaving the viewport.",
          html: shell(
            "New delivery",
            `<div class="page" style="max-width:520px;position:relative">
  ${trail("Home", "Orders", "New delivery")}
  <div class="phead"><div><h1>New delivery</h1></div></div>
  ${section(
    "",
    `<div class="form">
      ${field("Where", '<input class="inp" value="Amst" role="combobox" aria-expanded="true">', { required: true })}
      ${field("Reference", input(""), { required: true })}
      ${field("Arrives", input("14/03/2026", { cls: "nowrap" }), { required: true })}
    </div>`,
  )}
  <div class="pop" style="position:absolute;left:16px;top:168px;width:280px;box-shadow:0 8px 22px var(--scroll-shade)">
    ${[
      ["Amsterdam warehouse", "40 pallets", true],
      ["Amsterdam pickup counter", "no capacity set", false],
      ["Rotterdam warehouse", "120 pallets", false],
    ]
      .map(
        ([nm, sub, on]) => `<div class="item" aria-selected="${on}" style="${on ? "background:var(--muted)" : ""}">
        <span><b style="font-weight:500">${nm}</b><br><span class="muted" style="font-size:11px">${sub}</span></span>
        ${on ? '<span style="margin-left:auto">✓</span>' : ""}
      </div>`,
      )
      .join("")}
    <div class="sep"></div>
    <div class="item" style="color:var(--muted-foreground)">No warehouse yet? Add one.</div>
  </div>
</div>`,
            "Orders",
          ),
        },
        {
          name: "A popover for the calendar",
          reference: "APG",
          rationale:
            "The date field opens a month grid in a popover rather than a dialog, so the form and the calendar are both visible and Escape closes the calendar alone.",
          tradeoff:
            "APG's date-picker combobox example puts the grid in a dialog, not a popover, because a popover can be clipped by an overflow container and the calendar is essential rather than advisory.",
          html: shell(
            "New delivery",
            `<div class="page" style="max-width:520px;position:relative">
  ${trail("Home", "Orders", "New delivery")}
  <div class="phead"><div><h1>New delivery</h1></div></div>
  ${section(
    "",
    `<div class="form">
      ${field("Window opens", '<input class="inp" style="width:180px" value="14/03/2026" aria-expanded="true">', { help: "In the Europe/Amsterdam time zone.", required: true })}
      ${field("Window closes", input("15/03/2026"), { required: true })}
    </div>`,
  )}
  <div class="pop" style="position:absolute;left:16px;top:160px;width:222px;padding:8px">
    <div class="btnrow between" style="margin-bottom:6px"><button class="btn xs icon" aria-label="Previous month">‹</button><b style="font-size:12px">March 2026</b><button class="btn xs icon" aria-label="Next month">›</button></div>
    <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:1px;font-size:11px;text-align:center">
      ${["M", "T", "W", "T", "F", "S", "S"].map((d) => `<span style="color:var(--muted-foreground);padding:4px 0">${d}</span>`).join("")}
      ${Array.from({ length: 6 }, (_, i) => `<span style="color:var(--muted-foreground);padding:4px 0">${23 + i}</span>`).join("")}
      ${Array.from({ length: 31 }, (_, i) => `<span style="padding:4px 0;border-radius:50%${i === 13 ? ";background:var(--foreground);color:var(--background);font-weight:600" : ""}">${i + 1}</span>`).join("")}
    </div>
  </div>
</div>`,
            "Orders",
          ),
        },
        {
          name: "A popover on the copy button, saying what was copied",
          rationale:
            "Copying an identifier is a command with no visible result otherwise, so the control confirms in place rather than opening anything.",
          tradeoff:
            "A confirmation for a copy is easy to miss and the value is already on screen. It is politeness rather than information.",
          html: shell(
            "Order",
            `<div class="page" style="max-width:480px">
  ${trail("Home", "Orders", ORDER.number)}
  <div class="phead"><div><h1>${ORDER.number}</h1></div></div>
  ${section(
    "",
    `<div class="stack">
      <div class="split"><span>Order number<span class="sub">Quote it in a message to support</span></span><span class="fig"><span class="copyable"><span class="code">${ORDER.number}</span><button aria-label="Copy the order number">⧉</button></span></span></div>
      <div class="split"><span>Parcel codes<span class="sub">2 parcels, neither collected</span></span><span class="fig"><span class="copyable"><span class="code">PCK-0C893968A2</span><button aria-label="Copy both parcel codes">⧉</button></span></span></div>
      <div class="split"><span>Bank reference<span class="sub">For a support case</span></span><span class="fig"><span class="copyable"><span class="code">SH-88213</span><button aria-label="Copy the bank reference">⧉</button></span></span></div>
    </div>`,
  )}
  <div style="position:absolute;right:26px;bottom:70px"><div class="tip" role="status">Copied. The parcel codes are on the customer message.</div></div>
</div>`,
            "Orders",
          ),
        },
        {
          name: "A menu and a popover used for the same thing",
          rationale:
            "The row menu for commands and a popover for context, side by side, so a reviewer can see the two floating shapes in this item next to each other.",
          tradeoff:
            "A page with both on it has three floating layers counting the dialog, and a reader has to learn which is which. This is the reason the one-overlay rule wants one overlay at a time.",
          html: shell(
            "Row menu and hint",
            `<div class="page" style="position:relative">
  ${phead("Refunds", "31 orders. 12 outside the refund window.", "", { crumb: trail("Home", "Orders", "Refunds") })}
  ${toolbar({ search: "", placeholder: "Search refunds" })}
  ${section(
    "",
    `<table class="dt dense">
      <thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col">Asked</th><th scope="col" class="num">Amount</th><th scope="col" style="width:1%"></th></tr></thead>
      <tbody>
        <tr class="is-sel"><td><span class="code">SO-1037</span></td><td>Elin Lindqvist</td><td class="muted">214 days ago</td><td class="num">${MONEY.lamp}</td><td class="num"><button class="btn sm icon" aria-label="Actions for SO-1037">⋯</button></td></tr>
        <tr><td><span class="code">SO-1035</span></td><td>Ade Okafor</td><td class="muted">181 days ago</td><td class="num">${MONEY.lamp}</td><td class="num"><button class="btn sm icon" aria-label="Actions for SO-1035">⋯</button></td></tr>
        <tr><td><span class="code">SO-1038</span></td><td>Tom Becker</td><td class="muted">5 days ago</td><td class="num">${MONEY.lamp}</td><td class="num"><button class="btn sm icon" aria-label="Actions for SO-1038">⋯</button></td></tr>
      </tbody>
    </table>`,
    { flush: true },
  )}
  <div style="position:absolute;left:60px;top:262px"><div class="tip" role="tooltip">This payment method refunds only within 180 days <kbd>Esc</kbd></div></div>
  <div style="position:absolute;right:230px;bottom:96px">${menu([{ label: "Offer credit", checked: false }, { label: "Record a bank transfer" }, { label: "Ask the customer" }, "-", { label: "Leave it open", danger: true }], { width: "190px" })}</div>
</div>`,
            "Orders",
          ),
        },
        {
          name: "A customer hover card with recent orders",
          reference: "GitHub Primer",
          rationale:
            "The way GitHub Primer draws a Hovercard: identity, facts, and one link, on hover and on focus. Support reads the customer without leaving the refunds queue.",
          tradeoff:
            "A card that fetches on hover fires a read per row skimmed. Without focus support it is invisible on touch, where support increasingly works.",
          html: shell(
            "Orders",
            `<div class="page do-page" style="position:relative">
  ${phead("Orders", "268 orders.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order number, name or email" })}
  ${section(
    "",
    `<table class="dt dense">
      <thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col">State</th><th scope="col" class="num">Paid</th></tr></thead>
      <tbody>
        <tr class="is-sel"><td><span class="code">SO-1042</span></td><td>${ORDER.customer}</td><td>${badgeRaw("Paid", "positive", "outline")}</td><td class="num">${MONEY.order}</td></tr>
        <tr><td><span class="code">SO-1041</span></td><td>Tom Becker</td><td>${badgeRaw("Paid", "positive", "outline")}</td><td class="num">EUR 40.45</td></tr>
        <tr><td><span class="code">SO-1040</span></td><td>Elin Lindqvist</td><td>${badgeRaw("Completed", "neutral", "outline")}</td><td class="num">${MONEY.lamp}</td></tr>
      </tbody>
    </table>`,
    { flush: true },
  )}
  <div class="do-pop-a">
    <div class="pop" style="width:260px;box-shadow:0 8px 22px var(--scroll-shade)">
      <div style="padding:9px 10px;border-bottom:1px solid var(--border);display:flex;gap:9px;align-items:center">
        <span class="avatar" style="width:28px;height:28px;border-radius:50%;background:var(--muted);display:grid;place-items:center;font-size:11px">MG</span>
        <span><b style="font-size:12.5px">${ORDER.customer}</b><br><span class="muted" style="font-size:11px">${ORDER.email}</span></span>
      </div>
      <div style="padding:8px 10px;display:flex;flex-direction:column;gap:4px;font-size:12px">
        <div class="split"><span class="muted">Orders</span><span>3, all paid</span></div>
        <div class="split"><span class="muted">Paid in total</span><span>EUR 215.00</span></div>
        <div class="split"><span class="muted">Refunds</span><span>None</span></div>
      </div>
      <div style="padding:6px 10px 9px"><a href="#" style="font-size:12px">Open the customer</a></div>
    </div>
  </div>
</div>`,
            "Orders",
          ),
        },
        {
          name: "A coach mark pinned to the control",
          reference: "Atlassian",
          rationale:
            "The way Atlassian spotlights a new control: one anchored card, one fact, one dismissal. An application that already tours new staff extends a surface they know.",
          tradeoff:
            "A coach mark interrupts the task it annotates. Past the first week it is dismissed unread, and every new control cannot have one or none is read.",
          html: shell(
            "Orders",
            `<div class="page do-page" style="position:relative">
  ${phead("Orders", "268 orders.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order number, name or email", right: '<button class="btn sm">Export</button>' })}
  ${section(
    "",
    `<table class="dt dense">
      <thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col">State</th><th scope="col" class="num">Paid</th></tr></thead>
      <tbody>
        <tr><td><span class="code">SO-1042</span></td><td>${ORDER.customer}</td><td>${badgeRaw("Paid", "positive", "outline")}</td><td class="num">${MONEY.order}</td></tr>
        <tr><td><span class="code">SO-1041</span></td><td>Tom Becker</td><td>${badgeRaw("Paid", "positive", "outline")}</td><td class="num">EUR 40.45</td></tr>
        <tr><td><span class="code">SO-1040</span></td><td>Elin Lindqvist</td><td>${badgeRaw("Completed", "neutral", "outline")}</td><td class="num">${MONEY.lamp}</td></tr>
      </tbody>
    </table>`,
    { flush: true },
  )}
  <div class="do-coach">
    <div class="tip" role="dialog" aria-label="About Export" style="padding:9px 10px">
      <div style="font-weight:600;margin-bottom:3px">Export sends a file of these orders</div>
      <div style="opacity:.85">The current search and filters decide the rows. Press <kbd>E</kbd> anywhere in the list.</div>
      <div class="btnrow" style="margin-top:8px"><button class="btn xs">Got it</button><button class="btn xs ghost" style="color:inherit">Do not show again</button></div>
    </div>
  </div>
</div>`,
            "Orders",
          ),
        },
      ],
    },
    {
      id: "overlay-sticky",
      title: "A bar that stays while the reader works",
      why: "Not an overlay in the dialog sense: a band the page keeps. It has to be worded as a fact about the page, because <b>a tone may not paint a full-width band on a page about other work</b>.",
      verdict: "Ship A: a neutral band stating a fact about the deployment, the same on every page. E is the runner-up for facts true of one record only, drawn as a notice on that record. Never ship C: a full-width caution band paints the whole page in a tone about other work, which is the case the tone rule forbids.",
      variants: [
        {
          name: "A neutral band for what this page is",
          pick: true,
          rationale:
            "A band across the back office that holds on every page, such as which deployment this is. Neutral, never a tone, because it is about the page rather than about work.",
          tradeoff:
            "A band on every page is chrome the reader cannot remove, and it competes with the heading for the top of the screen. It has to earn its height.",
          html: shell(
            "Sandbox",
            `<div class="page">
  ${`<div class="alert info" style="margin:-16px -16px 16px;border-radius:0;border-left:0;border-right:0;border-top:0"><span class="txt"><b>This is a sandbox.</b><small>Nothing here is charged and nothing reaches a bank. Messages are caught and never sent.</small></span><span class="tail"><button class="btn sm">What is a sandbox</button></span></div>`}
  ${phead("Orders", "Every paid order, newest first.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order number, name or email" })}
  ${section(
    "",
    `<table class="dt dense">
      <thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col">State</th><th scope="col" class="num">Paid</th></tr></thead>
      <tbody>
        ${[
          ["SO-1042", ORDER.customer, "Paid", "positive", MONEY.order],
          ["SO-1041", "Tom Becker", "Paid", "positive", "EUR 40.45"],
          ["SO-1040", "Elin Lindqvist", "Completed", "neutral", MONEY.lamp],
        ]
          .map(([no, who, st, tone, amt]) => `<tr><td><span class="code">${no}</span></td><td>${who}</td><td>${badgeRaw(st, tone, "outline")}</td><td class="num">${amt}</td></tr>`)
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
          name: "A bar for unsaved work, pinned to the foot",
          rationale:
            "A bar across the bottom saying what is not saved and offering Save and Discard. It answers a question the editor currently leaves open.",
          tradeoff:
            "It covers the bottom of the page, which on a table is where the pagination lives. And a neutral band over a form is still a full-width band.",
          html: shell(
            "Storefront",
            `<div class="page" style="padding-bottom:52px">
  ${phead("Storefront", "The accent colour customers see.", "", { crumb: trail("Home", "Settings", "Storefront") })}
  ${section(
    "",
    `<div class="form" style="max-width:420px">
      ${field("Accent colour", `<span class="inline" style="gap:8px"><span style="width:30px;height:30px;border-radius:5px;background:var(--info);border:1px solid var(--border)"></span><input class="inp mono" style="width:110px" value="#2563EB"></span>`, { help: "A blue that white text reads against." })}
      ${field("Typeface", '<select class="sel"><option>System</option><option selected>Inter</option></select>')}
      <button class="btn primary">Save</button>
    </div>`,
  )}
  <div style="position:absolute;left:0;right:0;bottom:0;background:var(--background);border-top:1px solid var(--border);padding:9px 16px">
    <div class="btnrow between">
      <span style="font-size:12.5px"><b>Two changes not saved</b> <span class="muted">· accent colour, typeface</span></span>
      <span class="btnrow"><button class="btn sm ghost">Discard</button><button class="btn primary sm">Save</button></span>
    </div>
  </div>
</div>`,
            "Settings",
          ),
        },
        {
          name: "A bar naming a deadline that is closing",
          rationale:
            "A band on the disputes page naming the date the bank charges back, so the work on that page has a clock the page states.",
          tradeoff:
            "A full-width caution band on a page about disputes is exactly the case the tone rule forbids: the tone paints the whole page rather than the thing in that state.",
          html: shell(
            "Disputes",
            `<div class="page">
  ${`<div class="alert caution" style="margin:-16px -16px 16px;border-radius:0;border-left:0;border-right:0;border-top:0"><span class="txt"><b>Answering closes on 21 October.</b><small>5 disputes charge back on 21 Oct if nothing is sent. The bank does not wait.</small></span></div>`}
  ${phead("Disputes", "5 open. The nearest closes in 19 days.", "", { crumb: trail("Home", "Invoices", "Disputes") })}
  ${section(
    "",
    `<table class="dt">
      <thead><tr><th scope="col">Case</th><th scope="col">Order</th><th scope="col" class="num">Amount</th><th scope="col" class="sortable">Closes <span class="dir">▴</span></th><th scope="col" style="width:1%"></th></tr></thead>
      <tbody>
        ${[
          ["D-0182", "SO-1034", "Okafor Office", MONEY.lamp, "19 days", "caution"],
          ["D-0179", "SO-1035", "Garcia Interiors", MONEY.lamp, "12 days", "caution"],
          ["D-0171", "SO-1037", "Lindqvist Studio", MONEY.lamp, "31 days", "neutral"],
          ["D-0168", "SO-1038", "Becker Bouw", MONEY.lamp, "44 days", "neutral"],
        ]
          .map(
            ([c, o, co, amt, left, tone]) => `<tr>
          <td><span class="code">${c}</span></td>
          <td><span class="lines"><span class="code">${o}</span><small>${co}</small></span></td>
          <td class="num">${amt}</td><td>${badgeRaw(left, tone, "outline")}</td>
          <td class="num"><button class="btn sm">Answer</button></td>
        </tr>`,
          )
          .join("")}
      </tbody>
    </table>`,
    { flush: true },
  )}
  ${pager(1, 1, 1, 5, 5)}
</div>`,
            "Invoices",
          ),
        },
        {
          name: "A bar saying what is read-only and why",
          rationale:
            "Where a whole area is read-only for this role, one band names the reason and the grant, and the page below is drawn as it would be for a reader who could act.",
          tradeoff:
            "Every page of the area repeats the band, so the reader's eye skips it after the first and then misses the one place it changes.",
          html: shell(
            "Disputes",
            `<div class="page">
  ${`<div class="alert plain" style="margin:-16px -16px 16px;border-radius:0;border-left:0;border-right:0;border-top:0"><span class="txt"><b>This is read-only for your role.</b><small>You are ${PEOPLE.warehouse.name}, warehouse lead. Only <b>finance</b> can answer a dispute or issue a refund.</small></span></div>`}
  ${phead("Disputes", "5 open. The nearest closes in 19 days.", "", { crumb: trail("Home", "Invoices", "Disputes") })}
  ${section(
    "",
    `<table class="dt">
      <thead><tr><th scope="col">Case</th><th scope="col">Order</th><th scope="col" class="num">Amount</th><th scope="col">Closes</th><th scope="col" style="width:1%"></th></tr></thead>
      <tbody>
        ${[
          ["D-0182", "SO-1034", MONEY.lamp, "19 days"],
          ["D-0179", "SO-1035", MONEY.lamp, "12 days"],
          ["D-0171", "SO-1037", MONEY.lamp, "31 days"],
        ]
          .map(
            ([c, o, amt, left]) => `<tr><td><span class="code">${c}</span></td><td><span class="code">${o}</span></td><td class="num">${amt}</td><td>${left}</td><td class="num"><div class="explained" style="align-items:flex-end"><button class="btn sm" aria-disabled="true">Answer</button></div></td></tr>`,
          )
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
          name: "A bar on the record page, not the console",
          rationale:
            "The band is scoped to one record rather than the whole console, so it appears only where the fact is true and disappears everywhere else.",
          tradeoff:
            "The reader learns the band on one page and then has to learn that another page does not have one. A scoped band is not a deployment marker, it is a per-record notice.",
          html: shell(
            "Product",
            `<div class="page">
  ${trail("Home", "Products", PRODUCT.name)}
  <div class="alert caution" style="margin-bottom:14px">
    <span class="ico" aria-hidden="true">!</span>
    <span class="txt"><b>This product is not for sale.</b><small>The price list opens Tue 13 Jan 2026 at 10:00. Nothing can be sold, and no customer can find this page, before then.</small></span>
    <span class="tail"><button class="btn sm">Change the date</button></span>
  </div>
  <div class="phead">
    <div><h1>${PRODUCT.name} ${badgeRaw("Draft", "neutral")}</h1><p class="desc">${PRODUCT.sku} · 412 in stock</p></div>
    <div class="acts"><button class="btn primary">Publish the price list</button></div>
  </div>
  ${section("What is for sale", `<div class="stmt"><div class="line"><span>Oak desk lamp<span class="sub">412 in stock, none sold</span></span><span class="fig">${MONEY.lamp}</span></div></div>`)}
</div>`,
            "Products",
          ),
        },
        {
          name: "No bar: the fact goes in the heading instead",
          rationale:
            "The sandbox is named in the heading and the switcher, rather than in a band. Nothing is lost and one element is removed from every page.",
          tradeoff:
            "A reader who has seen four pages without the word 'sandbox' may not notice it. And the heading is already carrying the record or the page job.",
          html: shell(
            "Orders",
            `<div class="page">
  ${phead(`Orders <span class="badge info" style="vertical-align:middle">Sandbox</span>`, "Every paid order, newest first. Nothing here is charged.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order number, name or email" })}
  ${section(
    "",
    `<table class="dt dense">
      <thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col">State</th><th scope="col" class="num">Paid</th></tr></thead>
      <tbody>
        ${[
          ["SO-1042", ORDER.customer, "Paid", "positive", MONEY.order],
          ["SO-1041", "Tom Becker", "Paid", "positive", "EUR 40.45"],
          ["SO-1040", "Elin Lindqvist", "Completed", "neutral", MONEY.lamp],
        ]
          .map(([no, who, st, tone, amt]) => `<tr><td><span class="code">${no}</span></td><td>${who}</td><td>${badgeRaw(st, tone, "outline")}</td><td class="num">${amt}</td></tr>`)
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
          name: "A save bar pinned under the header",
          reference: "Shopify Polaris",
          rationale:
            "The way Shopify Polaris draws its ContextualSaveBar: a dark bar under the header with Discard and Save, appearing only while the form is dirty. The actions stay in view on a long form.",
          tradeoff:
            "A bar that appears and disappears moves the page it sits over. Readers learn to distrust the top of every form, dirty or not.",
          html: shell(
            "Storefront",
            `<div class="page do-page">
  ${phead("Storefront", "The accent colour customers see.", "", { crumb: trail("Home", "Settings", "Storefront") })}
  <div class="do-savebar"><span><b>Unsaved changes</b> <span style="opacity:.75">· accent colour, typeface</span></span><span class="btnrow"><button class="btn sm">Discard</button><button class="btn primary sm">Save</button></span></div>
  ${section(
    "",
    `<div class="form" style="max-width:420px">
      ${field("Accent colour", `<span class="inline" style="gap:8px"><span style="width:30px;height:30px;border-radius:5px;background:var(--info);border:1px solid var(--border)"></span><input class="inp mono" style="width:110px" value="#2563EB"></span>`)}
      ${field("Typeface", '<select class="sel"><option>System</option><option selected>Inter</option></select>')}
    </div>`,
  )}
</div>`,
            "Settings",
          ),
        },
        {
          name: "A band the reader dismisses for the session",
          reference: "GitHub Primer",
          rationale:
            "The way GitHub Primer draws a dismissible Banner: the fact shows once per session and the close is remembered. Suited to announcements, where the second reading has no value.",
          tradeoff:
            "A dismissed band cannot carry anything the reader must see. The first dismissal teaches that every band can go, including the next one that matters.",
          html: shell(
            "Orders",
            `<div class="page do-page">
  ${`<div class="alert info" style="margin:-16px -16px 16px;border-radius:0;border-left:0;border-right:0;border-top:0"><span class="txt"><b>A payout settles on Friday.</b><small>${MONEY.payout} for the March delivery run, held by the payment provider until then.</small></span><span class="tail"><button class="btn sm">Dismiss</button></span></div>`}
  ${phead("Orders", "Every paid order, newest first.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order number, name or email" })}
  ${section(
    "",
    `<table class="dt dense">
      <thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col">State</th><th scope="col" class="num">Paid</th></tr></thead>
      <tbody>
        ${[
          ["SO-1042", ORDER.customer, "Paid", "positive", MONEY.order],
          ["SO-1041", "Tom Becker", "Paid", "positive", "EUR 40.45"],
          ["SO-1040", "Elin Lindqvist", "Completed", "neutral", MONEY.lamp],
        ]
          .map(([no, who, st, tone, amt]) => `<tr><td><span class="code">${no}</span></td><td>${who}</td><td>${badgeRaw(st, tone, "outline")}</td><td class="num">${amt}</td></tr>`)
          .join("")}
      </tbody>
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
      id: "do-bottom-sheet",
      title: "A bottom sheet on a phone",
      why: "On a phone there is no beside and no centre: a dialog becomes a sheet from the bottom edge. <b>Material keeps a modal bottom sheet one swipe from dismissed</b>, with a handle, a title, and actions stacked full width.",
      verdict: "Ship A for commands and B for filters: both keep a handle, a title, and a full-width footer above the home indicator. C is the runner-up where the content is genuinely long, because detents let the reader choose half or full. Never ship F: a sheet with no dismissal traps the reader on the smallest screen, where every trap costs the most.",
      compact: {
        option: "Order actions in a bottom sheet",
        behaviour: "Every option in this item is the phone behaviour: a dialog becomes a sheet from the bottom edge with a handle, a title naming the record, and a full-width footer.",
      },
      variants: [
        {
          name: "Order actions in a bottom sheet",
          pick: true,
          width: "phone",
          reference: "Material Design",
          rationale:
            "The way Material Design draws a modal bottom sheet: a handle, a title naming the record, thumb-sized rows, one full-width dismissal. The sheet is one swipe from gone, so the list behind stays the surface.",
          tradeoff:
            "One record per sheet. Bulk commands need the list rather than this, and past five rows the sheet needs its own scroll.",
          html: shell(
            "Order SO-1042",
            `<div class="page do-page" style="position:relative">
  ${phead("Orders", "268 orders.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order number, name or email" })}
  ${section("", `<table class="dt dense"><thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col" class="num">Paid</th></tr></thead><tbody><tr class="is-sel"><td><span class="code">SO-1042</span></td><td>${ORDER.customer}</td><td class="num">${MONEY.order}</td></tr><tr><td><span class="code">SO-1041</span></td><td>Tom Becker</td><td class="num">EUR 40.45</td></tr></tbody></table>`, { flush: true })}
  <div class="do-bs-wrap">
    <div class="do-bs" role="dialog" aria-modal="true" aria-label="Order SO-1042">
      <span class="grab" aria-hidden="true"><i></i></span>
      <header><h3>Order SO-1042</h3><p>${ORDER.customer} · ${ORDER.company} · ${MONEY.order} paid</p></header>
      <div class="dbody">
        <button class="act"><span aria-hidden="true">✉</span>Resend the confirmation<span class="go">›</span></button>
        <button class="act"><span aria-hidden="true">↩</span>Refund<span class="go">›</span></button>
        <button class="act"><span aria-hidden="true">⧉</span>Copy the order number<span class="go">›</span></button>
      </div>
      <footer><button class="btn">Cancel</button></footer>
    </div>
  </div>
</div>`,
            "Orders",
          ),
        },
        {
          name: "Filters with a sticky apply bar",
          width: "phone",
          reference: "Shopify",
          rationale:
            "The way Shopify filters a mobile list: chips for what is set, controls for the rest, and an apply bar pinned to the foot with the match count. The reader never loses the results behind.",
          tradeoff:
            "Chips wrap tall. Past six filters the sheet needs its own scroll, and the match count has to be live or it lies.",
          html: shell(
            "Orders",
            `<div class="page do-page" style="position:relative">
  ${phead("Orders", "12 orders match.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Search orders" })}
  ${section("", `<table class="dt dense"><thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col" class="num">Paid</th></tr></thead><tbody><tr><td><span class="code">SO-1042</span></td><td>${ORDER.customer}</td><td class="num">${MONEY.order}</td></tr><tr><td><span class="code">SO-1041</span></td><td>Tom Becker</td><td class="num">EUR 40.45</td></tr></tbody></table>`, { flush: true })}
  <div class="do-bs-wrap">
    <div class="do-bs" role="dialog" aria-modal="true" aria-label="Filters">
      <span class="grab" aria-hidden="true"><i></i></span>
      <header><h3>Filters</h3><p>2 applied · 12 orders match</p></header>
      <div class="dbody"><div class="form">
        <div class="chips"><span class="chip">Paid <button class="x" aria-label="Remove Paid">✕</button></span><span class="chip">Oak desk lamp <button class="x" aria-label="Remove Oak desk lamp">✕</button></span></div>
        ${field("State", select("Paid", ["Any state", "Paid", "Refunded"]))}
        ${field("Product", select("Oak desk lamp", ["Any product", "Oak desk lamp", "Oak floor lamp"]))}
      </div></div>
      <footer><button class="btn ghost">Clear both</button><button class="btn primary">Show 12 results</button></footer>
    </div>
  </div>
</div>`,
            "Orders",
          ),
        },
        {
          name: "A sheet that opens half and expands full",
          width: "phone",
          reference: "Apple Maps",
          rationale:
            "The way Apple Maps stages detents: half height answers the glance, full height answers the read, and the handle invites the pull. The list behind stays visible at half.",
          tradeoff:
            "Two heights are two layouts to keep true. Content must read sensibly cut at half, which means the fact at the cut cannot be the one that matters.",
          html: shell(
            "Order SO-1042",
            `<div class="page do-page" style="position:relative">
  ${phead("Orders", "268 orders.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order number, name or email" })}
  ${section("", `<table class="dt dense"><thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col" class="num">Paid</th></tr></thead><tbody><tr class="is-sel"><td><span class="code">SO-1042</span></td><td>${ORDER.customer}</td><td class="num">${MONEY.order}</td></tr><tr><td><span class="code">SO-1041</span></td><td>Tom Becker</td><td class="num">EUR 40.45</td></tr></tbody></table>`, { flush: true })}
  <div class="do-bs-wrap" style="align-items:flex-end">
    <div class="do-bs" role="dialog" aria-modal="true" aria-label="Order SO-1042" style="max-height:46%">
      <span class="grab" aria-hidden="true"><i></i></span>
      <header><h3>Order SO-1042 ${badgeRaw("Paid", "positive", "sq")}</h3><p>${ORDER.customer} · ${MONEY.order} paid by card</p></header>
      <div class="dbody"><p class="muted" style="font-size:12px">Half height. Pull the handle for the lines and the history.</p></div>
      <footer><button class="btn">Expand</button></footer>
    </div>
  </div>
</div>`,
            "Orders",
          ),
        },
        {
          name: "A sheet with a destructive section",
          width: "phone",
          reference: "Apple",
          rationale:
            "The way an Apple action sheet seats the destructive row apart and last: the danger is separated, red, and below the fold of safe rows. The thumb meets safe actions first.",
          tradeoff:
            "Destructive at thumb reach still needs its confirm step, which this sheet cannot hold without nesting. The tap must open the full dialog, so the sheet is a detour rather than a shortcut.",
          html: shell(
            "Cancel launch",
            `<div class="page do-page" style="position:relative">
  ${phead("Spring lighting launch", "Sat 14 Mar 2026 · Amsterdam warehouse.", "", { crumb: trail("Home", "Products") })}
  ${section("The launch", facts([["State", "Scheduled"], ["Pre-orders", "1,204"]]))}
  <div class="do-bs-wrap">
    <div class="do-bs" role="dialog" aria-modal="true" aria-label="Cancel the launch">
      <span class="grab" aria-hidden="true"><i></i></span>
      <header><h3>Cancel the spring lighting launch?</h3><p>1,204 customers · ${MONEY.monthRevenue} goes back</p></header>
      <div class="dbody"><div class="callout destructive">This cannot be undone. A launch that has been cancelled cannot be scheduled again.</div></div>
      <footer class="stack"><button class="btn danger">Cancel the launch</button><button class="btn">Keep the launch</button></footer>
    </div>
  </div>
</div>`,
            "Products",
          ),
        },
        {
          name: "A full-screen sheet takeover",
          width: "phone",
          reference: "Material Design",
          rationale:
            "The way Material draws a full-screen dialog on a phone: the sheet takes the screen while keeping the scrim behind, so dismissal still reads as dismissal rather than navigation.",
          tradeoff:
            "A full screen with a handle is a page that cannot link. Deep tasks deserve the route with its Back, not this.",
          html: shell(
            "Add a note",
            `<div class="page do-page" style="position:relative">
  ${phead(ORDER.number, "3 lines · " + ORDER.company + ".", "", { crumb: trail("Home", "Orders", ORDER.number) })}
  ${section("Notes", `<div class="rlist"><div class="rrow"><span class="txt"><b>Garcia Interiors confirmed the Friday window</b><small>${PEOPLE.manager.name}, 2 Oct 2026</small></span></div></div>`)}
  <div class="do-bs-wrap">
    <div class="do-bs full" role="dialog" aria-modal="true" aria-label="Add a note">
      <span class="grab" aria-hidden="true"><i></i></span>
      <header><h3>Add a note</h3><p>Only ${COMPANY.name} sees these.</p></header>
      <div class="dbody"><div class="stack">
        ${field("Note", '<textarea class="ta" placeholder="What happened, and what was decided."></textarea>', { required: true })}
        ${field("About", '<select class="sel"><option selected>The customer</option><option>The warehouse</option><option>The money</option><option>The delivery</option></select>')}
      </div></div>
      <footer><button class="btn">Cancel</button><button class="btn primary">Add the note</button></footer>
    </div>
  </div>
</div>`,
            "Orders",
          ),
        },
        {
          name: "A sheet with no handle and no dismissal",
          width: "phone",
          rationale:
            "Some banking apps block the screen until a choice is made. This shows what that costs here: the reader is stuck until they pick a refund route.",
          tradeoff:
            "It traps the reader on the smallest screen, where every trap costs the most. Only a command that cannot wait earns this, and a refund route can always wait.",
          html: shell(
            "Refund SO-1035",
            `<div class="page do-page" style="position:relative">
  ${phead("Refunds", "31 orders to decide.", "", { crumb: trail("Home", "Orders", "Refunds") })}
  ${section("", `<table class="dt dense"><thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col" class="num">Amount</th></tr></thead><tbody><tr class="is-sel"><td><span class="code">SO-1035</span></td><td>Ade Okafor</td><td class="num">${MONEY.lamp}</td></tr></tbody></table>`, { flush: true })}
  <div class="do-bs-wrap">
    <div class="do-bs" role="alertdialog" aria-modal="true" aria-label="Choose a refund route">
      <header style="padding-top:14px"><h3>Choose a refund route</h3><p>Order SO-1035 · Ade Okafor · ${MONEY.lamp} · 181 days old</p></header>
      <div class="dbody"><div class="radio-list">
        <label><input type="radio" name="do-route"><span>Refund to the original payment<span class="cd" style="display:block">This payment method will refuse it: refunds only within 180 days.</span></span></label>
        <label><input type="radio" name="do-route" checked><span>Credit for a future order<span class="cd" style="display:block">Ade Okafor spends it on the next order.</span></span></label>
      </div></div>
      <footer><button class="btn primary">Offer credit</button></footer>
    </div>
  </div>
</div>`,
            "Orders",
          ),
        },
      ],
    },
    {
      id: "do-long-dialog",
      title: "A dialog with a long body and a sticky footer",
      why: "Some commands need more words than a dialog holds: terms, line items, per-audience consequences. <b>The footer must stay where the thumb is</b> while the body scrolls, or the reader agrees to what they cannot see.",
      verdict: "Ship A: one scrolling body, one pinned footer, nothing else. D is the runner-up wherever money moves, because the totals pinned above the footer are read at the click. Never ship F: buttons that scroll away ask the reader to agree first and find how after.",
      variants: [
        {
          name: "A scrolling body with a pinned footer",
          pick: true,
          reference: "Stripe",
          rationale:
            "The way the Stripe Dashboard pins actions on a long refund dialog: the body scrolls under a footer that never moves, so the commit stays in reach and the terms stay above it.",
          tradeoff:
            "A scrolling region inside a dialog is two scrolls on one screen. Keyboard readers must land in the body rather than behind it, or the terms are decoration.",
          html: shell(
            "Refund",
            `<div class="page do-page" style="position:relative">
  ${phead(`${ORDER.number}`, `${ORDER.customer} · ${ORDER.company} · ${MONEY.order} paid.`, "", { crumb: trail("Home", "Orders", ORDER.number) })}
  ${section("What was bought", `<div class="stmt"><div class="line"><span>${PRODUCT.name}, 2 lamps</span><span class="fig">${MONEY.lineTotal}</span></div><div class="line"><span>Gift wrap</span><span class="fig">EUR 30.00</span></div><div class="grand"><span>Paid by the customer</span><span class="fig">${MONEY.order}</span></div></div>`)}
  <div class="scrim">
    ${dialog(
      `Refund ${ORDER.number} in full?`,
      `<div class="do-long"><div class="stack">
        <div class="stmt"><div class="line"><span>Lamps and extras<span class="sub">2 lamps and gift wrap</span></span><span class="fig">${MONEY.order}</span></div><div class="sub-total"><span>Goes back to ${ORDER.customer}</span><span class="fig">${MONEY.order}</span></div></div>
        <div style="font-size:12.5px">The two lamps go back to stock and sell again. The gift wrap was made for this order and is not refunded.</div>
        <div style="font-size:12.5px">The refund goes back on the card payment the customer used. It arrives within five working days; the payment provider sends no message, so the customer hears it from ${COMPANY.name}.</div>
        <div style="font-size:12.5px">This payment method refunds only within 180 days of the payment. This payment is 31 days old, so the bank accepts it. Past the window the fallbacks are credit or an out-of-band payment the back office only records.</div>
        <div style="font-size:12.5px">The order keeps its record. It can be read in June and it says what happened, including who approved the refund.</div>
      </div></div>`,
      { footer: '<button class="btn">Cancel</button><button class="btn danger">Refund EUR 125.00</button>', scrim: false },
    )}
  </div>
</div>`,
            "Orders",
          ),
        },
        {
          name: "A pinned header and footer with a section read",
          reference: "Atlassian",
          rationale:
            "The way Atlassian pins modal headers on long content: the record and the amount stay named while the sections scroll. The reader never wonders which order the terms belong to.",
          tradeoff:
            "Pinned chrome eats a third of a phone dialog, and the body shows two lines at a time. On a short dialog the pinned header is furniture.",
          html: shell(
            "Refund",
            `<div class="page do-page" style="position:relative">
  ${phead(`${ORDER.number}`, `${ORDER.customer} · ${ORDER.company}.`, "", { crumb: trail("Home", "Orders", ORDER.number) })}
  ${section("What was bought", `<div class="stmt"><div class="line"><span>${PRODUCT.name}, 2 lamps</span><span class="fig">${MONEY.lineTotal}</span></div><div class="grand"><span>Paid</span><span class="fig">${MONEY.order}</span></div></div>`)}
  <div class="scrim">
    ${dialog(
      `Refund ${ORDER.number} in full?`,
      `<div class="do-long"><div class="stack">
        <div><b style="font-size:12.5px">The money</b><div style="font-size:12.5px">${MONEY.order} goes back to ${ORDER.customer} on the card payment they used. The gift wrap is not refunded.</div></div>
        <div><b style="font-size:12.5px">The goods</b><div style="font-size:12.5px">Both lamps go back to stock and sell again at the current price. Issued parcel codes stop working at the pickup counter.</div></div>
        <div><b style="font-size:12.5px">The window</b><div style="font-size:12.5px">This payment is 31 days old, inside the 180-day window. Past it the fallbacks are credit or an out-of-band payment.</div></div>
        <div><b style="font-size:12.5px">The record</b><div style="font-size:12.5px">Nothing is deleted. The order says it was refunded, when, and who approved it.</div></div>
      </div></div>`,
      { desc: `Refunding ${ORDER.number} · ${MONEY.order} · 2 lamps and gift wrap`, footer: '<button class="btn">Cancel</button><button class="btn danger">Refund EUR 125.00</button>', scrim: false },
    )}
  </div>
</div>`,
            "Orders",
          ),
        },
        {
          name: "Sections that collapse",
          reference: "Shopify",
          rationale:
            "The way Shopify collapses modal sections: one open at a time, the rest one tap away. Four sections read as four lines until the reader wants one.",
          tradeoff:
            "Collapsed sections hide the term the reader most needed. The dialog must open the section that matters for this order, which means it must know which one that is.",
          html: shell(
            "Refund",
            `<div class="page do-page" style="position:relative">
  ${phead(`${ORDER.number}`, `${ORDER.customer} · ${ORDER.company}.`, "", { crumb: trail("Home", "Orders", ORDER.number) })}
  ${section("What was bought", `<div class="stmt"><div class="line"><span>${PRODUCT.name}, 2 lamps</span><span class="fig">${MONEY.lineTotal}</span></div><div class="grand"><span>Paid</span><span class="fig">${MONEY.order}</span></div></div>`)}
  <div class="scrim">
    ${dialog(
      `Refund ${ORDER.number} in full?`,
      `<div class="stack sm">
        <div class="pop" style="box-shadow:none"><div class="cap">The money · open</div><div style="padding:2px 8px 6px;font-size:12.5px">${MONEY.order} goes back to ${ORDER.customer} on the card payment they used.</div></div>
        <div class="pop" style="box-shadow:none"><div class="cap">The goods · shut</div></div>
        <div class="pop" style="box-shadow:none"><div class="cap">The window · shut</div></div>
        <div class="pop" style="box-shadow:none"><div class="cap">The record · shut</div></div>
      </div>`,
      { footer: '<button class="btn">Cancel</button><button class="btn danger">Refund EUR 125.00</button>', scrim: false },
    )}
  </div>
</div>`,
            "Orders",
          ),
        },
        {
          name: "A summary pinned above the footer",
          reference: "Stripe",
          rationale:
            "The way Stripe pins the total above Pay: the figure the click commits to stays visible while the terms scroll. The reader signs the number, not the scroll position.",
          tradeoff:
            "The pinned summary duplicates the body. Where the two disagree the reader trusts the pin, and the body becomes decoration nobody checks.",
          html: shell(
            "Refund",
            `<div class="page do-page" style="position:relative">
  ${phead(`${ORDER.number}`, `${ORDER.customer} · ${ORDER.company}.`, "", { crumb: trail("Home", "Orders", ORDER.number) })}
  ${section("What was bought", `<div class="stmt"><div class="line"><span>${PRODUCT.name}, 2 lamps</span><span class="fig">${MONEY.lineTotal}</span></div><div class="grand"><span>Paid</span><span class="fig">${MONEY.order}</span></div></div>`)}
  <div class="scrim">
    ${dialog(
      `Refund ${ORDER.number} in full?`,
      `<div class="do-long"><div class="stack">
        <div style="font-size:12.5px">The two lamps go back to stock and sell again. The gift wrap was made for this order and is not refunded.</div>
        <div style="font-size:12.5px">The refund goes back on the card payment the customer used and arrives within five working days.</div>
        <div style="font-size:12.5px">This payment is 31 days old, inside the 180-day window. Past it the fallbacks are credit or an out-of-band payment.</div>
        <div class="do-pin"><div class="split"><span><b>To ${ORDER.customer}</b><span class="sub">On the original card payment</span></span><span class="fig"><b>${MONEY.order}</b></span></div></div>
      </div></div>`,
      { footer: '<button class="btn">Cancel</button><button class="btn danger">Refund EUR 125.00</button>', scrim: false },
    )}
  </div>
</div>`,
            "Orders",
          ),
        },
        {
          name: "A wide dialog for dense facts",
          reference: "Vercel",
          rationale:
            "The way Vercel widens a modal for dense settings: two columns of facts read side by side instead of stacked. Four sections fit without scrolling on a laptop.",
          tradeoff:
            "Wide on desktop is full-width on a phone, where the columns stack and the dialog doubles in height. The no-scroll promise holds at exactly one width.",
          html: shell(
            "Refund",
            `<div class="page do-page" style="position:relative">
  ${phead(`${ORDER.number}`, `${ORDER.customer} · ${ORDER.company}.`, "", { crumb: trail("Home", "Orders", ORDER.number) })}
  ${section("What was bought", `<div class="stmt"><div class="line"><span>${PRODUCT.name}, 2 lamps</span><span class="fig">${MONEY.lineTotal}</span></div><div class="grand"><span>Paid</span><span class="fig">${MONEY.order}</span></div></div>`)}
  <div class="scrim">
    ${dialog(
      `Refund ${ORDER.number} in full?`,
      `${facts([["To the customer", MONEY.order], ["Route", "Original card payment"], ["Goods", "2 lamps, back to stock"], ["Gift wrap", "Not refunded"], ["Window", "31 of 180 days used"], ["Record", "Kept, marked refunded"]])}`,
      { footer: '<button class="btn">Cancel</button><button class="btn danger">Refund EUR 125.00</button>', size: "lg", scrim: false },
    )}
  </div>
</div>`,
            "Orders",
          ),
        },
        {
          name: "No pinned footer: the buttons scroll away",
          rationale:
            "Included to refuse it: without a scroll cap the dialog grows past the viewport and the footer sits below the fold. The reader agrees first and finds how after.",
          tradeoff:
            "On a phone the footer is two screens down, past terms nobody scrolled to. This is the shape every other option in this item exists to replace.",
          html: shell(
            "Refund",
            `<div class="page do-page" style="position:relative">
  ${phead(`${ORDER.number}`, `${ORDER.customer} · ${ORDER.company}.`, "", { crumb: trail("Home", "Orders", ORDER.number) })}
  ${section("What was bought", `<div class="stmt"><div class="line"><span>${PRODUCT.name}, 2 lamps</span><span class="fig">${MONEY.lineTotal}</span></div><div class="grand"><span>Paid</span><span class="fig">${MONEY.order}</span></div></div>`)}
  <div class="scrim" style="place-items:start center">
    ${dialog(
      `Refund ${ORDER.number} in full?`,
      `<div class="stack">
        <div class="stmt"><div class="line"><span>Lamps and extras<span class="sub">2 lamps and gift wrap</span></span><span class="fig">${MONEY.order}</span></div><div class="sub-total"><span>Goes back to ${ORDER.customer}</span><span class="fig">${MONEY.order}</span></div></div>
        <div style="font-size:12.5px">The two lamps go back to stock and sell again. The gift wrap was made for this order and is not refunded.</div>
        <div style="font-size:12.5px">The refund goes back on the card payment the customer used. It arrives within five working days.</div>
        <div style="font-size:12.5px">This payment method refunds only within 180 days of the payment. This payment is 31 days old, so the bank accepts it.</div>
        <div style="font-size:12.5px">Past the window the fallbacks are credit or an out-of-band payment the back office only records.</div>
        <div style="font-size:12.5px">The order keeps its record. It can be read in June and it says what happened.</div>
        <div class="callout">The footer with Cancel and Refund sits below this body. Scroll to reach it.</div>
      </div>`,
      { footer: '<button class="btn">Cancel</button><button class="btn danger">Refund EUR 125.00</button>', scrim: false },
    )}
  </div>
</div>`,
            "Orders",
          ),
        },
      ],
    },
    {
      id: "do-shortcuts",
      title: "A keyboard shortcut help overlay",
      why: "Staff who live in lists learn keys faster than clicks. <b>Linear and GitHub both answer ? with an overlay</b>, grouped by where the keys work, closable with the same key.",
      verdict: "Ship A: three groups, one grid, every key the application honours, closed by the same key. D is the runner-up on dense pages, where a This page section answers the only keys that work there. Never ship F: tooltips alone hide the catalogue from the reader who would learn it fastest.",
      variants: [
        {
          name: "A grouped grid of shortcuts",
          pick: true,
          reference: "Linear",
          rationale:
            "The way Linear answers ?: groups by where the keys work, each key in its own cap, the same key closes. Staff learn the catalogue in one reading.",
          tradeoff:
            "A catalogue dialog lists keys the reader has no reason to press yet. Past twenty keys it is reference rather than learning, and reference belongs on a page.",
          html: shell(
            "Shortcuts",
            `<div class="page do-page" style="position:relative">
  ${phead("Orders", "268 orders.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order number, name or email" })}
  ${section("", `<table class="dt dense"><thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col" class="num">Paid</th></tr></thead><tbody><tr><td><span class="code">SO-1042</span></td><td>${ORDER.customer}</td><td class="num">${MONEY.order}</td></tr><tr><td><span class="code">SO-1041</span></td><td>Tom Becker</td><td class="num">EUR 40.45</td></tr></tbody></table>`, { flush: true })}
  <div class="scrim">
    ${dialog(
      "Keyboard shortcuts",
      `<div class="stack">
        <div><div class="pop" style="box-shadow:none;border:0;padding:0"><div class="cap">Everywhere</div></div><div class="do-keys">
          <div class="do-key"><span>Open this help</span><span class="ks"><span class="do-kbd">?</span></span></div>
          <div class="do-key"><span>Search and commands</span><span class="ks"><span class="do-kbd">⌘</span><span class="do-kbd">K</span></span></div>
          <div class="do-key"><span>Close the top layer</span><span class="ks"><span class="do-kbd">Esc</span></span></div>
        </div></div>
        <div><div class="pop" style="box-shadow:none;border:0;padding:0"><div class="cap">Orders list</div></div><div class="do-keys">
          <div class="do-key"><span>Search the list</span><span class="ks"><span class="do-kbd">/</span></span></div>
          <div class="do-key"><span>Export these orders</span><span class="ks"><span class="do-kbd">E</span></span></div>
          <div class="do-key"><span>Resend the selected confirmations</span><span class="ks"><span class="do-kbd">R</span></span></div>
        </div></div>
        <div><div class="pop" style="box-shadow:none;border:0;padding:0"><div class="cap">Record</div></div><div class="do-keys">
          <div class="do-key"><span>Message the customer</span><span class="ks"><span class="do-kbd">M</span></span></div>
          <div class="do-key"><span>Copy the order number</span><span class="ks"><span class="do-kbd">⌘</span><span class="do-kbd">C</span></span></div>
        </div></div>
      </div>`,
      { desc: "Press ? again to close.", footer: '<button class="btn">Close</button>', size: "lg", scrim: false },
    )}
  </div>
</div>`,
            "Orders",
          ),
        },
        {
          name: "A single-column list",
          reference: "Superhuman",
          rationale:
            "The way Superhuman lists every key in one column: no groups to learn, scanning top to bottom, each row one fact. Shorter to build and shorter to read.",
          tradeoff:
            "One column grows long. Groups would shorten the search for a key the reader half-remembers, and this list has none.",
          html: shell(
            "Shortcuts",
            `<div class="page do-page" style="position:relative">
  ${phead("Orders", "268 orders.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order number, name or email" })}
  ${section("", `<table class="dt dense"><thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col" class="num">Paid</th></tr></thead><tbody><tr><td><span class="code">SO-1042</span></td><td>${ORDER.customer}</td><td class="num">${MONEY.order}</td></tr></tbody></table>`, { flush: true })}
  <div class="scrim">
    ${dialog(
      "Keyboard shortcuts",
      `<div class="stack sm">
        <div class="do-key"><span>Open this help</span><span class="ks"><span class="do-kbd">?</span></span></div>
        <div class="do-key"><span>Search and commands</span><span class="ks"><span class="do-kbd">⌘</span><span class="do-kbd">K</span></span></div>
        <div class="do-key"><span>Close the top layer</span><span class="ks"><span class="do-kbd">Esc</span></span></div>
        <div class="do-key"><span>Search the list</span><span class="ks"><span class="do-kbd">/</span></span></div>
        <div class="do-key"><span>Export these orders</span><span class="ks"><span class="do-kbd">E</span></span></div>
        <div class="do-key"><span>Message the customer</span><span class="ks"><span class="do-kbd">M</span></span></div>
      </div>`,
      { desc: "Press ? again to close.", footer: '<button class="btn">Close</button>', scrim: false },
    )}
  </div>
</div>`,
            "Orders",
          ),
        },
        {
          name: "Shortcuts inside the command palette",
          reference: "Raycast",
          rationale:
            "The way Raycast teaches keys in its footer: the hints sit where the keys work, so every palette visit is a lesson. No separate catalogue to keep true.",
          tradeoff:
            "Hints teach three keys. The rest stay hidden until the full dialog opens, so this is a reminder rather than a catalogue.",
          html: shell(
            "Orders",
            `<div class="page do-page" style="position:relative">
  ${phead("Orders", "268 orders.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order number, name or email" })}
  ${section("", `<table class="dt dense"><thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col" class="num">Paid</th></tr></thead><tbody><tr><td><span class="code">SO-1042</span></td><td>${ORDER.customer}</td><td class="num">${MONEY.order}</td></tr></tbody></table>`, { flush: true })}
  <div class="scrim" style="place-items:start center;padding-top:12vh">
    ${dialog(
      "Search and commands",
      `<input class="inp" value="resend" aria-label="Search commands" style="margin-bottom:8px">
      <div class="do-pal">
        <div class="prow on"><span>Resend the confirmation for SO-1042</span><span class="hint">Enter to run</span></div>
        <div class="prow"><span>Resend for every selected order</span><span class="hint">Shift plus Enter</span></div>
      </div>
      <div class="btnrow" style="margin-top:10px;font-size:11.5px;color:var(--muted-foreground)"><span><span class="do-kbd">?</span> all shortcuts</span><span><span class="do-kbd">↑</span><span class="do-kbd">↓</span> move</span><span><span class="do-kbd">Esc</span> close</span></div>`,
      { scrim: false },
    )}
  </div>
</div>`,
            "Orders",
          ),
        },
        {
          name: "Shortcuts for this page only",
          reference: "Figma",
          rationale:
            "The way Figma scopes its shortcuts panel to the tool at hand: only the keys that work here, so the list stays short enough to learn. The global keys live one link away.",
          tradeoff:
            "Page-scoped lists repeat the global keys on every page or omit them. Either way the reader meets two lists where one catalogue would do.",
          html: shell(
            "Shortcuts",
            `<div class="page do-page" style="position:relative">
  ${phead("Orders", "268 orders.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order number, name or email" })}
  ${section("", `<table class="dt dense"><thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col" class="num">Paid</th></tr></thead><tbody><tr><td><span class="code">SO-1042</span></td><td>${ORDER.customer}</td><td class="num">${MONEY.order}</td></tr></tbody></table>`, { flush: true })}
  <div class="scrim">
    ${dialog(
      "Shortcuts on Orders",
      `<div class="stack sm">
        <div class="do-key"><span>Search the list</span><span class="ks"><span class="do-kbd">/</span></span></div>
        <div class="do-key"><span>Export these orders</span><span class="ks"><span class="do-kbd">E</span></span></div>
        <div class="do-key"><span>Resend the selected confirmations</span><span class="ks"><span class="do-kbd">R</span></span></div>
        <div style="font-size:12px"><a href="#" style="text-decoration:underline">All shortcuts</a></div>
      </div>`,
      { desc: "Keys that work nowhere else are not listed here.", footer: '<button class="btn">Close</button>', scrim: false },
    )}
  </div>
</div>`,
            "Orders",
          ),
        },
        {
          name: "A printable cheat sheet page",
          reference: "GitHub Docs",
          rationale:
            "The way GitHub Docs prints its cheat sheet: one page, two columns, made for paper pinned beside a screen. Counter staff learn from paper faster than from a dialog.",
          tradeoff:
            "A page for keys is a destination nobody bookmarks. The keys are needed where the work is, and this page is never there.",
          html: shell(
            "Keyboard shortcuts",
            `<div class="page do-page">
  ${phead("Keyboard shortcuts", "Every key the application honours.", '<button class="btn sm">Print</button>', { crumb: trail("Home", "Help", "Shortcuts") })}
  ${section(
    "",
    `<div class="do-cheat">
      <div><div class="pop" style="box-shadow:none;border:0;padding:0"><div class="cap">Everywhere</div></div>
        <div class="do-key"><span>Open shortcut help</span><span class="ks"><span class="do-kbd">?</span></span></div>
        <div class="do-key"><span>Search and commands</span><span class="ks"><span class="do-kbd">⌘</span><span class="do-kbd">K</span></span></div>
        <div class="do-key"><span>Close the top layer</span><span class="ks"><span class="do-kbd">Esc</span></span></div></div>
      <div><div class="pop" style="box-shadow:none;border:0;padding:0"><div class="cap">Orders list</div></div>
        <div class="do-key"><span>Search the list</span><span class="ks"><span class="do-kbd">/</span></span></div>
        <div class="do-key"><span>Export these orders</span><span class="ks"><span class="do-kbd">E</span></span></div>
        <div class="do-key"><span>Resend the selected confirmations</span><span class="ks"><span class="do-kbd">R</span></span></div></div>
      <div><div class="pop" style="box-shadow:none;border:0;padding:0"><div class="cap">Record</div></div>
        <div class="do-key"><span>Message the customer</span><span class="ks"><span class="do-kbd">M</span></span></div>
        <div class="do-key"><span>Copy the order number</span><span class="ks"><span class="do-kbd">⌘</span><span class="do-kbd">C</span></span></div></div>
    </div>`,
  )}
</div>`,
            "Home",
          ),
        },
        {
          name: "No overlay: hints only on tooltips",
          rationale:
            "Included to refuse it: the catalogue hides one hover at a time, and touch readers never meet it at all. A reader who would learn ten keys learns none.",
          tradeoff:
            "Each hint is accurate and each is undiscoverable. The tooltip teaches the key for a control already found, which is the one key that reader needed least.",
          html: shell(
            "Orders",
            `<div class="page do-page" style="position:relative">
  ${phead("Orders", "268 orders.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order number, name or email", right: '<button class="btn sm">Export</button>' })}
  ${section("", `<table class="dt dense"><thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col" class="num">Paid</th></tr></thead><tbody><tr><td><span class="code">SO-1042</span></td><td>${ORDER.customer}</td><td class="num">${MONEY.order}</td></tr><tr><td><span class="code">SO-1041</span></td><td>Tom Becker</td><td class="num">EUR 40.45</td></tr></tbody></table>`, { flush: true })}
  <div class="do-coach">${tip("Export these orders", ["E"])}</div>
</div>`,
            "Orders",
          ),
        },
      ],
    },
    {
      id: "do-context-menu",
      title: "A context menu where the pointer is",
      why: "A right click asks what this thing can do. <b>Linear and VS Code answer at the pointer</b>, with the same commands the row menu holds, so the menu is a shortcut rather than a second set.",
      verdict: "Ship A: the row's own commands at the pointer, nothing added, nothing missing, closed by the same click elsewhere. C is the runner-up for bulk work, where the menu rewrites itself for the selection count. Never ship F: silence hands the gesture to the browser, whose commands act on the page rather than the record.",
      compact: {
        option: "A long-press menu on touch",
        behaviour: "Touch has no right click: a long press opens the same menu, with the same commands and the same order, positioned above the row.",
      },
      variants: [
        {
          name: "A right-click menu on a row",
          pick: true,
          reference: "Linear",
          rationale:
            "The way Linear answers a right click: the row's own commands at the pointer, nothing added, nothing missing. The menu is a shortcut to the row menu rather than a second set.",
          tradeoff:
            "Right click is invisible. Staff who never try it keep the row menu, and both menus must hold the same commands or one of them lies.",
          html: shell(
            "Orders",
            `<div class="page do-page" style="position:relative">
  ${phead("Orders", "268 orders.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order number, name or email" })}
  ${section(
    "",
    `<table class="dt dense">
      <thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col">State</th><th scope="col" class="num">Paid</th></tr></thead>
      <tbody>
        <tr><td><span class="code">SO-1041</span></td><td>Tom Becker</td><td>${badgeRaw("Paid", "positive", "outline")}</td><td class="num">EUR 40.45</td></tr>
        <tr class="is-sel"><td><span class="code">SO-1042</span></td><td>${ORDER.customer}</td><td>${badgeRaw("Paid", "positive", "outline")}</td><td class="num">${MONEY.order}</td></tr>
        <tr><td><span class="code">SO-1040</span></td><td>Elin Lindqvist</td><td>${badgeRaw("Completed", "neutral", "outline")}</td><td class="num">${MONEY.lamp}</td></tr>
      </tbody>
    </table>`,
    { flush: true },
  )}
  <div class="do-ctx-pos">${menu(
    [
      { label: "Open the record" },
      { label: "Resend the confirmation" },
      { label: "Refund" },
      "-",
      { label: "Copy the order number", shortcut: "⌘C" },
    ],
    { width: "210px" },
  )}</div>
</div>`,
            "Orders",
          ),
        },
        {
          name: "A context menu with icons and shortcuts",
          reference: "VS Code",
          rationale:
            "The way VS Code pairs icons with keys in its context menus: the icon scans, the key teaches, and the pair stays the same everywhere the command appears.",
          tradeoff:
            "Icons for Refund and Report read as decoration. A wrong icon teaches faster than no icon, and every icon is a second name to keep true in two languages.",
          html: shell(
            "Orders",
            `<div class="page do-page" style="position:relative">
  ${phead("Orders", "268 orders.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order number, name or email" })}
  ${section(
    "",
    `<table class="dt dense">
      <thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col">State</th><th scope="col" class="num">Paid</th></tr></thead>
      <tbody>
        <tr class="is-sel"><td><span class="code">SO-1042</span></td><td>${ORDER.customer}</td><td>${badgeRaw("Paid", "positive", "outline")}</td><td class="num">${MONEY.order}</td></tr>
        <tr><td><span class="code">SO-1041</span></td><td>Tom Becker</td><td>${badgeRaw("Paid", "positive", "outline")}</td><td class="num">EUR 40.45</td></tr>
        <tr><td><span class="code">SO-1040</span></td><td>Elin Lindqvist</td><td>${badgeRaw("Completed", "neutral", "outline")}</td><td class="num">${MONEY.lamp}</td></tr>
      </tbody>
    </table>`,
    { flush: true },
  )}
  <div class="do-ctx-pos">${menu(
    [
      { label: "Open the record", icon: "↗", shortcut: "Enter" },
      { label: "Resend the confirmation", icon: "✉", shortcut: "R" },
      { label: "Refund", icon: "↩" },
      "-",
      { label: "Copy the order number", icon: "⧉", shortcut: "⌘C" },
    ],
    { width: "230px" },
  )}</div>
</div>`,
            "Orders",
          ),
        },
        {
          name: "A context menu for a bulk selection",
          reference: "Figma",
          rationale:
            "The way Figma rewrites its right-click menu for a multi-selection: the count in every label, single-record commands gone. The reader cannot ask three rows to open one record.",
          tradeoff:
            "The menu rewrites per count, so muscle memory for one row breaks at three. And the count must be exact at the click, not at the render.",
          html: shell(
            "Orders",
            `<div class="page do-page" style="position:relative">
  ${phead("Orders", "268 orders. 3 selected.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order number, name or email" })}
  ${section(
    "",
    `<table class="dt dense">
      <thead><tr><th class="check"><input type="checkbox" checked aria-label="Select all"></th><th scope="col">Order</th><th scope="col">Customer</th><th scope="col" class="num">Paid</th></tr></thead>
      <tbody>
        <tr class="is-sel"><td class="check"><input type="checkbox" checked aria-label="Select SO-1042"></td><td><span class="code">SO-1042</span></td><td>${ORDER.customer}</td><td class="num">${MONEY.order}</td></tr>
        <tr class="is-sel"><td class="check"><input type="checkbox" checked aria-label="Select SO-1041"></td><td><span class="code">SO-1041</span></td><td>Tom Becker</td><td class="num">EUR 40.45</td></tr>
        <tr class="is-sel"><td class="check"><input type="checkbox" checked aria-label="Select SO-1040"></td><td><span class="code">SO-1040</span></td><td>Elin Lindqvist</td><td class="num">${MONEY.lamp}</td></tr>
      </tbody>
    </table>`,
    { flush: true },
  )}
  <div class="do-ctx-pos">${menu(
    [
      { label: "Resend to 3 customers" },
      { label: "Export 3 orders" },
      { label: "Copy 3 order numbers", shortcut: "⌘C" },
    ],
    { width: "210px" },
  )}</div>
</div>`,
            "Orders",
          ),
        },
        {
          name: "A long-press menu on touch",
          width: "phone",
          reference: "iOS",
          rationale:
            "The way iOS answers a long press: the same menu, opened by time rather than button. Touch staff get the shortcut without a second design to learn.",
          tradeoff:
            "Long press has no hover state, so discovery is zero and the delay punishes every use. It is a courtesy for those who know, not a route for those who do not.",
          html: shell(
            "Orders",
            `<div class="page do-page" style="position:relative">
  ${phead("Orders", "268 orders.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order number, name or email" })}
  ${section("", `<table class="dt dense"><thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col" class="num">Paid</th></tr></thead><tbody><tr class="is-sel"><td><span class="code">SO-1042</span></td><td>${ORDER.customer}</td><td class="num">${MONEY.order}</td></tr><tr><td><span class="code">SO-1041</span></td><td>Tom Becker</td><td class="num">EUR 40.45</td></tr></tbody></table>`, { flush: true })}
  <div class="do-ctx-pos">${menu(
    [
      { label: "Open the record" },
      { label: "Resend the confirmation" },
      { label: "Refund" },
      "-",
      { label: "Copy the order number" },
    ],
    { width: "210px" },
  )}</div>
</div>`,
            "Orders",
          ),
        },
        {
          name: "A context menu on empty space",
          reference: "VS Code",
          rationale:
            "The way VS Code menus its explorer background: page commands where the pointer is, so Refresh and Export do not need a trip to the toolbar.",
          tradeoff:
            "Page commands in a hidden menu compete with the toolbar that already holds them. Two homes for Export means two places to keep true.",
          html: shell(
            "Orders",
            `<div class="page do-page" style="position:relative">
  ${phead("Orders", "268 orders.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order number, name or email" })}
  ${section(
    "",
    `<table class="dt dense">
      <thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col">State</th><th scope="col" class="num">Paid</th></tr></thead>
      <tbody>
        <tr><td><span class="code">SO-1042</span></td><td>${ORDER.customer}</td><td>${badgeRaw("Paid", "positive", "outline")}</td><td class="num">${MONEY.order}</td></tr>
        <tr><td><span class="code">SO-1041</span></td><td>Tom Becker</td><td>${badgeRaw("Paid", "positive", "outline")}</td><td class="num">EUR 40.45</td></tr>
      </tbody>
    </table>`,
    { flush: true },
  )}
  ${pager(1, 11)}
  <div class="do-ctx-pos tr">${menu([{ label: "Refresh the list", shortcut: "R" }, { label: "Export these orders", shortcut: "E" }, "-", { label: "Copy the page link" }], { width: "200px" })}</div>
</div>`,
            "Orders",
          ),
        },
        {
          name: "No menu: the browser default answers",
          rationale:
            "Included to refuse it: silence hands the gesture to the browser, whose commands act on the page rather than the record. Staff learn the gesture does nothing for them and stop trying.",
          tradeoff:
            "Inspect element beside Reload, on a row about money. The absence is not neutral; it teaches that right click is not part of the application.",
          html: shell(
            "Orders",
            `<div class="page do-page" style="position:relative">
  ${phead("Orders", "268 orders.", "", { crumb: trail("Home", "Orders") })}
  ${toolbar({ search: "", placeholder: "Order number, name or email" })}
  ${section(
    "",
    `<table class="dt dense">
      <thead><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col">State</th><th scope="col" class="num">Paid</th></tr></thead>
      <tbody>
        <tr class="is-sel"><td><span class="code">SO-1042</span></td><td>${ORDER.customer}</td><td>${badgeRaw("Paid", "positive", "outline")}</td><td class="num">${MONEY.order}</td></tr>
        <tr><td><span class="code">SO-1041</span></td><td>Tom Becker</td><td>${badgeRaw("Paid", "positive", "outline")}</td><td class="num">EUR 40.45</td></tr>
      </tbody>
    </table>`,
    { flush: true },
  )}
  <div class="do-ctx-pos">
    <div class="menu" style="width:200px">
      <div style="padding:4px 8px;font-size:11px;color:var(--muted-foreground)">The browser answers, because the back office does not.</div>
      <div class="sep"></div>
      <div class="mi">Back</div>
      <div class="mi">Reload</div>
      <div class="mi">Save as…</div>
      <div class="sep"></div>
      <div class="mi">Inspect element</div>
    </div>
  </div>
</div>`,
            "Orders",
          ),
        },
      ],
    },
  ],
};
