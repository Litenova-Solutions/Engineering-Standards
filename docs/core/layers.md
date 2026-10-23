# Record Layers

## Intent

LiteSpec records form four layers: Intent states the promises, Behavior states how the system keeps them, Implementation builds that behavior in code, and Proof shows that it holds. This page states the translation rules between the layers: Specify, Implement, and Verify. Agents apply it at every layer boundary, and reviewers use it to judge whether each layer says only what belongs to it.

## Concepts

### The Four Layers

LiteSpec work moves through four layers. Each layer answers one question, and each has its own writers and reviewers.

| Layer | Question | Writes | Reviews |
|:--|:--|:--|:--|
| Intent | Why build it, and what do we promise? | Agents draft, the founder decides | The founder and product people |
| Behavior | How does the system behave to keep the promises? | Agents | Developers; the security reviewer for access, outside calls, and personal-data flows |
| Implementation | How is it built? | Agents | S-tier checks; developers sample |
| Proof | How do we know it holds? | The builder | G-tier and S-tier checks |

The [intent page](intent.md) states the Intent records, and the [behavior page](behavior.md) states the Behavior records. Implementation holds code only, and Proof holds tests, check results, computed statuses, and the rendered book. Governance records, `deviation` and `known-gap`, attach to any layer.

### Translation Rules

Three rules join the layers. Specify translates Intent into Behavior: it adds the behavior detail the promises leave unstated. Implement translates Behavior into Implementation: it adds the code shapes the stack pages fix. Verify translates Implementation into Proof: one test proves each scenario through the public boundary.

### Questions and World Facts

A need a lower layer meets that the upper layer leaves unstated travels up as a draft question. The question carries the question itself, a decider, a decide-by date, a recommendation, a ballot group, and a tier. A fact learned from the world enters Intent as research or a constraint that cites its source and date. A change at the top marks every record whose parent changed, agents update those records, and review and proof follow.

## Standards

### Write Each Layer from the Layer Above It

**Statement:** Each record below Intent MUST be written from a record in the layer above it.

**Rationale:** Each layer rests on the one above it: Behavior fulfils Intent, Implementation builds Behavior, and Proof proves Implementation. Derivation between records is part of that direction, so generic refusals derive from `access` and `input` without new records. Code with no parent record stays evidence for a question instead of becoming a record by silent transcription, so the spec wins where Intent has spoken.

**Example:** A guard in code with no parent record raises a question; the agent drafts the requirement or rule and keeps the code.

### Add Behavior Detail When Specifying Intent

**Statement:** Behavior that fulfils an Intent record MUST add the states, invariants, refusals, consistency, data classes with erasure positions, freshness, and tenant-scoped access the Intent record leaves unstated.

**Rationale:** Intent promises outcomes in product words, and Behavior turns each promise into the states, invariants, refusals, consistency, data classes with erasure positions, freshness, and tenant-scoped access that keep it. Without that detail each implementer guesses the states and the access scope, and two guesses diverge. The checks `requirement-unfulfilled`, `record-orphaned`, `step-unserved`, `erasure-undeclared`, and `setting-default-without-requirement` report the gaps.

**Example:** A return promise gains a process with Listed and Settled states, a refusal for a ticket that already admitted someone, and atomic consistency over one aggregate.

### Raise Commercial and Observable Figures as Questions

**Statement:** An agent that meets a price, fee, rate, term, market, payer, personal-data retention period, person-observable freshness, or tenant-varying, market-varying, or date-varying default or figure MUST raise it as a draft question instead of deciding it.

**Rationale:** Prices, fees, rates, terms, markets, payers, retention periods, observable freshness, and tenant-varying, market-varying, or date-varying defaults and figures are business choices, and only an accountable person makes them. An agent that decided one would bury a commitment in a Behavior record nobody approved. Each open figure becomes a draft question with a decider and a decide-by date.

**Example:** A return-queue cap of 4 goes to the ballot as a draft question with a recommendation instead of entering the setting silently.

### Implement Only Declared Behavior

**Statement:** Implementation MUST add only the code shapes its stack pages fix and no observable outcome, edge, write, or access grant its Behavior records leave undeclared.

**Rationale:** The stack pages fix the code shapes, so the handler, the repository call, and the published event each have one prescribed form. An observable outcome, edge, write, or access grant outside the records splits the project into approved fiction and unreviewed fact. The checks `behavior-unrecorded`, `write-undeclared`, `result-undeclared`, `effect-undeclared`, `use-case-access`, and `refusal-not-thrown` report the excess.

**Example:** A handler that returns a code no result declares fails `result-undeclared`; the fix declares the result or removes the code.

### Prove Each Scenario Through the Public Boundary

**Statement:** Each scenario MUST be proved by one test through the public boundary.

**Rationale:** A scenario is the leaf of the record tree, so one test through the public boundary ties each leaf to running behavior. The checks `use-case-without-scenario` and `proves-unconfirmed` report the missing proof. A proof goes stale when its scenario's semantic hash changes, while rewording prose leaves the proof green.

### Raise Open Needs as Draft Questions

**Statement:** A need a lower layer meets that the upper layer leaves unstated MUST travel up as a draft question carrying a decider and a decide-by date.

**Rationale:** The lower layer does not decide what the upper layer left unstated, so the need travels up with its context instead of turning into a guess. The question carries a recommendation, a ballot group, and a tier. Tier 1 needs explicit approval or review, while a tier-3 draft carrying a recommendation auto-approves after its decide-by date plus the veto window, recorded as approved by the veto window. A draft past its decide-by date without auto-approval is reported as a known gap with its owner, and it blocks nothing silently.

**Example:** A missing refund policy becomes a ballot item due 2026-11-01 with the founder as decider.

### Enter World Facts as Cited Research or Constraints

**Statement:** A fact learned from the world MUST enter Intent as research or a constraint that cites its source and date.

**Rationale:** Commitments flow down, and facts from the world flow up: a provider's behavior, a regulation, or an incident enters Intent where people can weigh it. The citation and date show where the fact came from and when it held, so a later change rechecks the source instead of the memory. Nothing travels up from code.

**Example:** An observed 120-day refund window enters as research, then as a constraint draft citing that research.

### Flag Records When a Parent Record Changes

**Statement:** Each record whose parent record changes MUST be flagged for update, and its review and proof stay stale until an agent updates it.

**Rationale:** A change at the top reaches every record that fulfils or serves the changed parent, so the builder flags each one as parent-changed. Agents update the flagged records, and review and proof follow the update. Without the flag a Behavior record keeps proving a promise nobody makes anymore.

### Close Incident Deviations Within Seven Days

**Statement:** A production incident fix that ships before its question is answered MUST carry a time-boxed incident deviation that becomes a draft question within seven days.

**Rationale:** A production incident ships its fix before any question is answered, at 02:00 if that is when the page fires. The time-boxed incident deviation records what shipped and why, and turning it into a draft question within seven days returns the choice to an accountable person. The release gate counts aged incident deviations, so a forgotten deviation stays visible.

### Record Changed Provider Behavior as Observed Research

**Statement:** A changed provider behavior MUST enter as research recording the observed behavior, then as a constraint draft citing that research.

**Rationale:** The provider's behavior is a fact from the world, and research is where such facts enter. The constraint draft that follows cites the research, so the ballot item carries its evidence. Code is not the source: a failed refund in production points at the world, and the world is cited.

### Build Ahead of a Regulation Only Under Its Constraint

**Statement:** Behavior that anticipates a regulation with a deadline MUST follow that regulation's constraint while its requirement stays a draft, blocking the release only after the statutory date.

**Rationale:** A regulation with a deadline needs working behavior before its requirement passes review, so the constraint carries the rule in the meantime. The release stays shippable until the statutory date, and only then does the missing approval block it. Without this path teams either ship late or build the rule where no record owns it.

## Conventions

None.

## Reference Example

This informative example demonstrates `litespec/core/layers#flag-records-when-a-parent-record-changes`, `litespec/core/layers#raise-open-needs-as-draft-questions`, `litespec/core/layers#enter-world-facts-as-cited-research-or-constraints`, and `litespec/core/layers#record-changed-provider-behavior-as-observed-research`.

Top-down: the founder answers the ballot with 6 instead of 4 for the return-queue cap. The requirement's statement changes, the builder marks the listing setting and the cap rule as parent-changed, and an agent updates the setting default and the scenario where a seventh return is refused. The developer reviews one two-line Behavior diff, the test changes, Proof goes green, and the book chapter shows the new promise.

Bottom-up: a failed refund in production shows the payment rail's window is now 120 days instead of 180. An agent records the observed behavior as research, then drafts a change to the refund-window constraint citing it. The founder sees one tier-1 ballot item, and on approval the per-order deadline rule and its scenarios follow.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/core/layers#write-each-layer-from-the-layer-above-it | checkable | `litespec model check` emits no `behavior-unrecorded` finding for code that names no parent record. |
| litespec/core/layers#add-behavior-detail-when-specifying-intent | checkable | `litespec model check` emits no `requirement-unfulfilled`, `record-orphaned`, `step-unserved`, `erasure-undeclared`, or `setting-default-without-requirement` finding across Behavior records. |
| litespec/core/layers#raise-commercial-and-observable-figures-as-questions | guidance | Which prices, fees, rates, terms, markets, payers, retention periods, or observable figures did Behavior decide without a draft question? Look at the settings and rules the change adds, beside the question list. |
| litespec/core/layers#implement-only-declared-behavior | checkable | `litespec model check` emits no `behavior-unrecorded`, `write-undeclared`, `result-undeclared`, `effect-undeclared`, `use-case-access`, or `refusal-not-thrown` finding across the implementation. |
| litespec/core/layers#prove-each-scenario-through-the-public-boundary | checkable | `litespec model check` emits no `use-case-without-scenario` or `proves-unconfirmed` finding across scenarios and tests. |
| litespec/core/layers#raise-open-needs-as-draft-questions | guidance | Which unstated needs lack a draft question with a decider and a decide-by date? Look at the lower-layer records the change adds, beside the ballot inbox. |
| litespec/core/layers#enter-world-facts-as-cited-research-or-constraints | guidance | Which world facts entered without a cited and dated research or constraint record? Look at the provider, regulation, and incident facts the change relies on. |
| litespec/core/layers#flag-records-when-a-parent-record-changes | guidance | Which records with a changed parent still show a passing review and proof? Look at the flagged records beside their updated parents. |
| litespec/core/layers#close-incident-deviations-within-seven-days | guidance | Which incident fixes lack a deviation, or carry one older than seven days without a draft question? Look in the deviations records beside the release gate. |
| litespec/core/layers#record-changed-provider-behavior-as-observed-research | guidance | Which provider changes lack observed research and a citing constraint draft? Look at the provider facts the change relies on, beside the research records. |
| litespec/core/layers#build-ahead-of-a-regulation-only-under-its-constraint | guidance | Which anticipatory behavior lacks a citing constraint, or blocks a release before the statutory date? Look at the regulation-driven Behavior records beside the constraint and its date. |
