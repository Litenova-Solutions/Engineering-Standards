# Intent Layer

## Intent

Intent is why the product exists and what it promises: the product, its goals, problems, features, requirements, constraints, decisions, research, and journeys. Agents draft these records and the founder decides them, before Behavior states how the system keeps the promises. This page states where Intent lives, what shape each record takes, and what Intent never holds.

## Concepts

### Product Intent and Its Parts

Product intent is what the business commits to: what it sells, to whom, at what price, and in which markets, plus how the company runs and what comes next.

Intent is not Behavior. A rule or use case states what the system does today and matches the code. A requirement states what the business decided and why, and it can describe a position the code does not carry yet. The two connect in one direction: Behavior records name the requirements they fulfill and the steps they serve, and an Intent record never describes Behavior.

The [model page](model.md) defines the record types and links. The table names the terms this page uses most.

| Term | Meaning |
|:---|:---|
| Product | The one record stating what the product is, for whom, and its boundary. |
| Goal | A measurable outcome the product serves, carrying no authority of its own. |
| Problem | A pain or job someone has today, with the people it affects. |
| Feature | What the product offers against a problem: planned, shipped, later, or refused. |
| Constraint | An outside rule binding the product, with its source and whether it applies. |
| Research | An outside fact behind a choice, with the question asked and the sources read. |
| Decision | A dated choice with options, decider, evidence, and what would change it. |
| Requirement | One commitment: what the product does, how well it does it, or what the business holds, with its exception and fallback where one applies. |
| Requirement page | One page of business intent holding requirement entries. |
| Journey | Ordered product sentences walking one actor toward one goal. |
| Actor | A person, group, or system that touches the product. |
| Business term | A word of the business with its meaning, kept in the glossary with `layer: intent`. |
| Source material | Generated records outside `docs/` carrying no authority until cited. |

A requirement page keeps the present and the future in its chapter and its commitments, while the book lists the requirement entries and the decisions behind them.

### How Intent Reaches Behavior

The [model page](model.md) states the authority order that settles conflicts between records. Decisions explain choices, and research and prose inform without deciding.

A decision sets the position, and a requirement page states it as requirements. Behavior records name the requirements they fulfill and the journey steps they serve, and the code carries what happens today. When Behavior contradicts a requirement, either the code carries a defect or the business changed. A changed business means a new decision, approved by a person, before any page or code moves.

What a lower layer needs and the upper layer does not say travels up as a draft question with a decider and a date. A fact learned from the world enters Intent as research or a constraint, cited and dated. Nothing travels up from code: where Intent is silent, working code is evidence for a question, not a defect to delete and not a source to transcribe silently.

### Requirements with Except and Fallback

A requirement carries `kind` (functional, quality, or business), `statement`, `rationale`, and `measure` with `by` where its statement names a number. `setBy` names who sets its value: `founder` or `tenant`. `risk` names what makes it tier 1: `money`, `door`, `personal-data`, or `access`; a requirement with no risk is tier 3.

An `except` entry states in product words when the commitment does not hold, and `fallback` names the requirement that covers what happens then. The fallback carries no `except` of its own: exceptions stay one deep, so every exception ends in a promise.

Approved requirements carry `approvedBy`, `approvedOn`, and the builder-written `approvedHash`. Tier 1 needs explicit approval; a tier-3 draft with a recommended answer auto-approves after its `decideBy` plus the veto window.

### Journeys as Product Sentences

A journey carries `actor`, `goal`, `finishedWhen`, ordered `steps`, and `fulfills`. `finishedWhen` states the observable end in one sentence. Each step carries its `id` (`s1`, `s2`, and so on), its product sentence in `says`, the actor walking it, and what the person experiences when it fails in `ifItGoesWrong`. A step id reads `journey/<name>#s1`.

Steps name no use case. Use cases point up with `serves`, naming the steps they serve. The book renders each journey as one chapter: the goal, `finishedWhen`, the steps as sentences with `ifItGoesWrong`, the requirements it fulfills with their statements and their `except` and fallback inline, the serving use case goals, the Then clauses of their scenarios as context, a consequences box as context, and the open questions. Field names never render literally in Intent chapters.

### Staff and System Journeys

Journeys are not only buyer walks. A staff journey walks a staff actor, such as box office recording a replacement sale, through the same shape of goal, `finishedWhen`, and steps. A system journey walks `actor/recurring-job` through scheduled work the product promises, such as expiring lapsed returns. Staff and system steps read as product sentences too, so the founder approves them the same way.

### Questions and Ballots

A question carries `question`, `decider`, `decideBy`, `recommended`, `ballot`, and `tier`. Questions ask in product words and carry recommended answers, so the founder approves or answers without opening a Behavior page. The `ballot` groups questions in the inbox by a decision id or a short topic slug.

Tier-1 questions need explicit approval. A tier-3 draft carrying `recommended` auto-approves after its `decideBy` plus the project's veto window (`review.vetoWindowDays` in `litespec.project.json`, default 7), recorded as `approvedBy: auto (veto window)`. A draft past its `decideBy` that cannot auto-approve is reported as a known gap with its owner. It never silently blocks. The ballots page lists questions grouped by `ballot`, tier 1 first, with each question's recommendation and auto-approval date.

### The Consequences Summary

Intent is enough to approve. Each ballot and book chapter carries a consequences summary rendered from Behavior: new refusals in product words, data kept and for how long, and money effects. The summary is marked as context and stays outside the approval hash, which covers semantic fields such as statements, results, output names, rules, and steps, never prose bodies.

### What Intent Never Contains

Intent never contains Behavior field names, code identifiers, or mechanism: no states, results, codes, transactions, edges, or consistency modes. Computed facts such as implemented, verified, stale, reachable, and effective status appear in the book and model output only. Behavior owns its records and points up; Intent states the promises those records keep.

## Standards

### Keep Intent in Its Homes

**Statement:** A consumer MUST keep its brief, requirement pages, goals, problems, features, constraints, decisions, and journeys under `docs/product/`, and its research under `docs/research/`.

**Rationale:** Intent split across notes and books gives no single answer to the question an agent asks before building. One home per kind, with the brief, requirement pages, goals, problems, features, constraints, decisions, and journeys under `docs/product/` and research under `docs/research/`, gives every reader one place to look. A second home for any kind starts a second truth about the business.

### State One Product

**Statement:** A consumer MUST state exactly one product record in its brief, with `boundary`, `neverDoes`, `audience`, and a Summary section.

**Rationale:** One product record gives every reader one answer to what the business is, who it serves, and where it stops. The `boundary` and `audience` focus every later choice; `neverDoes` refuses what the product does not become, so tempting expansions meet a written refusal. Two product statements let each plan cite the one it prefers. Summary states what the product is in one place beside the fields.

### State Each Goal with Its Measure

**Statement:** A goal MUST state its `statement`, `measure`, `target`, and `by` in fields and its reason in Why It Matters.

**Rationale:** A goal without a measure is a wish no check can confirm: the team cannot tell whether the product serves it. The `statement` names the outcome, `measure` and `target` name what is counted and the number aimed for, and `by` names the date. Why It Matters explains why the outcome matters, so a later reader can judge whether a cheaper goal serves as well. A goal carries no authority: it explains why features exist and never decides a conflict.

### State Each Problem with Its Evidence

**Statement:** A problem MUST state its `statement` in fields and its case in Situation and Evidence.

**Rationale:** A problem that names what its people face points to the pain its solution lifts. Situation describes the pain in the people's own terms, and Evidence shows it is real. Problems without owners attract solutions nobody needs. The `affects` link names the actors who face it, so each pain traces to the people a solution must serve.

### State Each Feature with Its State

**Statement:** A feature MUST state its `state` in fields and its offer in Offering.

**Rationale:** A feature names the problems it solves in `solves` and the goals it serves in `serves`, so each offer traces to a pain and an outcome. Its `state` is planned, shipped, later, or refused. A refused feature keeps its reason in `refusedBecause`, so the team never relitigates the refusal, and a planned feature names its date in `by`. Offering states what is in and what is out, so the scope of the offer is written where the state is.

### Answer Every Constraint

**Statement:** A constraint MUST state its `source`, `category`, `applies`, and `appliesBecause` in fields and its demand in Summary and What It Requires.

**Rationale:** An unanswered constraint is an outside rule the product can break unknowingly: a law, a regulation, or provider terms the team never examined. Recording each rule with its source and applicability proves the team asked. A project with no outside rules records that answer too, so a later reader can tell examined from ignored. The `category` is technical, organizational, or convention. Summary states the rule in the source's own words, and What It Requires states what the product does to obey it. A fact learned from the world, such as a provider shortening its refund window, first lands as research with its source and date, then as a constraint draft.

### Record Research with Read Sources

**Statement:** A research record MUST state its `question`, list each source with its read date, and carry Answer.

**Rationale:** A fact without its source cannot be rechecked when a decision depends on it. The read date shows when the outside fact was true, so a later reader knows whether to trust or refresh it. Research without sources and dates asks every later choice to rest on memory. Answer states what the sources say and how sure the answer is, and Notes on Sources holds what a later reader needs about each source. Observed provider behavior lands here too, cited and dated, before any constraint or requirement rests on it.

### Record Each Choice as a Decision

**Statement:** A decision MUST name the records it settles in `decides`, weigh each option with its `for` and `against`, and carry Context, Decision, and Consequences.

**Rationale:** A business choice argued from options and evidence can be revisited on its merits; one argued from authority cannot. Each option carries its name with what speaks for and against it, so the review content sits in the entries instead of a prose section. Context states the choice, Decision states the chosen option in `chosen`, and Consequences states what follows. The `changeWhen` condition names what would reopen the choice, so a decision reopened by a condition rather than a date stays stable until the world actually changes. The `basedOn` link names the constraints and research behind it, and Evidence with Confidence holds the supporting material with its confidence.

### Name the Person Who Approved a Decision

**Statement:** An approved decision MUST carry `approvedBy` with its decider and `approvedOn` with its date.

**Rationale:** Product, commercial, and legal choices belong to an accountable person. Naming the decider while the decision is a draft shows who approves before release. Building can start on a draft while approval gates the release, so agent work never stalls on one person's queue. The `approvedBy` name and `approvedOn` date prove the approval happened, and the builder writes `approvedHash` over the semantic fields so a later change reopens the approval. The [model page](model.md) states what the hash covers.

### Replace a Decision with a New Record

**Statement:** A changed choice MUST be a new decision naming the old one in `replaces`, with the old one retired in the same change.

**Rationale:** A decision edited in place loses the reason it once held, and every requirement page that cited it silently changes meaning. A new decision naming the old one in `replaces`, with the old one retired in the same change, keeps the reasoning chain intact. The replaced record stays readable as the past, so a later reader can follow why the position moved.

### Shape Each Requirement Page

**Statement:** A `requirement-page` MUST carry its nine chapter and commitment sections with the frontmatter field `reviewBy`.

**Rationale:** The fixed shape puts the present and the future of one area on one page. The chapter sections carry the story for people: Summary, The Situation, What We Do, Why It Is Better, and Example. The commitment sections carry the testable commitments and the choices behind them: Costs and Risks, How Sure We Are, Position, and Refusals. Position holds choices with their decisions, including choices no system carries. A reader learns where each answer sits once and finds it on every page. The `reviewBy` field dates the next reread against decisions and evidence. The book lists the requirement entries with their statements and their `except` and fallback inline, so the page carries no entries section.

### Identify Every Requirement

**Statement:** Each requirement entry MUST carry one identifier `requirement/<topic>.<name>` naming its own page, with `kind` and `statement`.

**Rationale:** An identifier lets a Behavior record name the commitment it fulfills and lets the model resolve the name. A commitment written only as prose cannot be traced from Intent to code. The `kind` is functional, quality, or business: what the product does, how well it does it, or what the business holds. A business requirement carries its `values` with effective dates. Any requirement names in `feature` the planned, later, or refused feature that carries it, in `basedOn` the constraints and research behind it, in `setBy` who sets its value, and in `risk` what makes it tier 1.

### Explain Each Requirement in One Line

**Statement:** Each requirement entry MUST explain its reason in a one-line `rationale`.

**Rationale:** A commitment without its reason cannot be rejudged when the world moves: the reader finds what holds but not why. One line forces the reason into the open without inviting an essay. The chapter carries the full story; the `rationale` carries the reason beside the commitment.

### State the Measure on a Counted Requirement

**Statement:** A requirement whose statement names a number MUST carry `measure` and `by`.

**Rationale:** A number without its measure cannot be checked: the team cannot tell what is counted or when the count holds. The `measure` names what is counted, and `by` names the date or milestone. The schema pairs the two, so a requirement carries both or neither.

### Order Each Journey Toward One Goal

**Statement:** A journey MUST walk its actor toward one goal through ordered steps.

**Rationale:** A journey names its `actor`, its `goal` in words, its `finishedWhen`, and its ordered `steps`: each step carries its `id`, its product sentence in `says`, the actor walking it, and what the person experiences when it fails in `ifItGoesWrong`. The order shows how the steps join toward the goal, so a step that fits nowhere is visible. The journey names in `fulfills` the requirements it carries, and the use cases that serve each step point up with `serves`.

### Keep Behavior Out of Intent

**Statement:** An Intent record MUST NOT describe states, results, codes, or code.

**Rationale:** An Intent record that names states, results, codes, or code becomes a second specification, and it drifts from the first with the next Behavior change. Two specifications force every reader to ask which one the code follows. Behavior records own behavior and point up to the requirements and steps they serve, so each fact has one home.

### Treat Generated Research as Source Material

**Statement:** An agent MUST treat records generated outside `docs/` as source material until a research record or an approved decision states the claim.

**Rationale:** Records generated outside `docs/` mix verified facts, inferences, and recommendations in one confident voice. Treating them as source material with no authority keeps a recommendation from being built as if someone decided it. A research record or an approved decision restates the claim before anything rests on it.

### State Each Exception with Its Fallback

**Statement:** A requirement that names an `except` condition MUST name its `fallback` requirement in the same entry.

**Rationale:** An exception without a fallback leaves the reader at the exact moment the promise breaks: the product refuses with no stated alternative. The `when` condition states in product words when the commitment does not hold, and `fallback` names the requirement that covers what happens then. The fallback carries no `except` of its own, so the chain stays one deep and every exception ends in a promise.

**Example:** A returned ticket is refunded on the buyer's own charge, never more than they paid. Except when the payment rail's refund window has closed for that order, with `fallback` naming the requirement that has the organizer repay the buyer by other means.

### Write Journey Steps as Sentences with Ids

**Statement:** Each journey step MUST carry its `id` and its product sentence in `says`, and name no use case.

**Rationale:** A step written as a product sentence reads in the book chapter with no Behavior knowledge: the founder approves what a person experiences, not which handler runs. The `id` (`s1`, `s2`, and so on) gives Behavior a stable target: use cases point up with `serves` to `journey/<name>#s1`. A step that names its use case drags Behavior into Intent and breaks the chapter every time Behavior renames.

**Example:** Step `s3` says `Someone else buys the freed place, and the old code stops admitting.` and names no use case; `use-case/sales.complete-ticket-resale` names `journey/hand-a-ticket-back#s3` in `serves`.

### State When Each Journey Finishes

**Statement:** A journey MUST state its observable end in `finishedWhen`.

**Rationale:** A journey without a stated end can stop anywhere: the reader cannot tell a finished walk from an abandoned one, and serving records cannot tell done from dropped. `finishedWhen` states the observable end in one sentence, in product words a founder can check.

**Example:** `finishedWhen`: the original buyer has their money on the card they paid with, or the organizer credit they chose, and the freed place is sold again or back with them.

### Group Questions into Ballots

**Statement:** Each draft question MUST name its `decider`, its `decideBy` date, and its `ballot`.

**Rationale:** A question without a decider and a date waits on nobody: work below it guesses while nobody is asked. The `ballot` groups questions in the inbox by a decision id or a short topic slug, so the founder answers one ballot at a time. Tier-1 questions need explicit approval; a tier-3 draft carrying `recommended` auto-approves after its `decideBy` plus the veto window, recorded as `auto (veto window)`. A draft past its date that cannot auto-approve is reported as a known gap with its owner, so it never silently blocks.

**Example:** Ballot `resale-terms`, due 2026-11-01: how many tickets one buyer may hold in the return queue at once, recommended 4 as an organizer listing setting; and whether the organizer may charge a handling fee on a return, recommended yes, organizer-set and shown before the buyer confirms.

### Leave Business Choices to the Founder

**Statement:** The founder MUST decide each draft question that sets a price, fee, rate, term, market, payer, retention period, observable freshness, or tenant-varying figure.

**Rationale:** Agents draft Intent and the founder decides it: a price or term chosen in Behavior would bind the business without its decider. Each figure that differs by tenant, market, or date travels up as a draft question with the founder as decider, so Behavior never silently fixes what the business owns. Money and personal-data questions carry `risk` and need explicit approval.

**Example:** The return-queue cap moves from 4 to 6 when the founder answers the ballot; the listing setting and its scenarios follow the approved requirement.

### Treat Tenant-Set Values as Data

**Statement:** A consumer MUST treat a `setBy: tenant` value as tenant data outside founder approval.

**Rationale:** Tenants choose their own values within the ranges Intent sets: an organizer prices the freed place at face value by default and keeps any difference. The founder approves the requirement that sets the range and the default, and each tenant's choice inside it needs no ballot. Treating tenant values as approvals would ask the founder to approve choices that are never theirs.

**Example:** The organizer sets a resale price above face value; the requirement covering organizer pricing already holds the founder's approval, so the price itself is data.

## Conventions

### Group Product Records by Area

**Default:** Keep the brief at `docs/product/brief.md`, requirement pages in one folder per area, each other kind in its folder, and research under `docs/research/`.

**Replacement:** A project records its own product layout in its documentation index.

**Rationale:** An area folder keeps related pages together, so pricing and business model sit side by side. One folder per kind keeps each record findable: goals, problems, features, constraints, decisions, and journeys each have one home. A newcomer learns the layout once and predicts where the next record lives.

**Example:**

```text
docs/product/
  README.md
  brief.md
  business/
    model.md
    pricing.md
  markets/
    expansion.md
    <market>.md
  company/
    legal-and-tax.md
  roadmap/
    milestones.md
    later.md
  constraints/
    <name>.md
  decisions/
    0001-monthly-plan.md
  goals/
    <name>.md
  problems/
    <name>.md
  features/
    <name>.md
  journeys/
    <name>.md
```

### Name Product Decisions in One Numbered Sequence

**Default:** Name each product decision `<four-digit number>-<name>.md` and use `decision/<four-digit number>-<name>` as its identifier.

**Replacement:** A project records its own decision naming in its documentation index.

**Rationale:** One numbered sequence orders each decision by when the choice was proposed, giving every record a short stable name. The number counts as a word, so digits never stand alone in the identifier. Scattered names would force every citation to carry the full path.

## Reference Example

This informative example demonstrates `litespec/core/intent#order-each-journey-toward-one-goal`, `litespec/core/intent#write-journey-steps-as-sentences-with-ids`, `litespec/core/intent#state-when-each-journey-finishes`, `litespec/core/intent#identify-every-requirement`, `litespec/core/intent#state-each-exception-with-its-fallback`, `litespec/core/intent#group-questions-into-ballots`, `litespec/core/intent#leave-business-choices-to-the-founder`, and `litespec/core/intent#treat-tenant-set-values-as-data`.

The book renders journey `journey/hand-a-ticket-back` as one chapter. No field name, JSON, or Behavior page appears.

```text
Hand a ticket back

A buyer who cannot attend hands their ticket back and is refunded on their
own charge.

Finished when: the original buyer has their money on the card they paid with,
or the organizer credit they chose, and the freed place is sold again or back
with them.

1. The buyer sees what handing back means for their ticket: money or credit,
   and how long money takes.
2. The buyer hands the ticket back and chooses money or credit.
3. Someone else buys the freed place, and the old code stops admitting.
4. The original buyer is refunded once that sale has settled.
If it goes wrong: past the card window only credit is offered; a ticket that
already admitted someone cannot come back; if nobody buys the place before the
window shuts, the ticket is theirs again.

Promises
- A returned ticket is refunded on the buyer's own charge, never more than
  they paid.
    Except when the payment rail's refund window has closed for that order.
    Then the organizer repays the buyer by other means and NightHall records it.
- The organizer resells the freed place at their own price, face value by
  default, and keeps any difference.
- A handed-over ticket cannot be taken back once someone else holds it.

Consequences (context, not part of what you approve)
- New refusal a buyer can meet: "This ticket already admitted someone."
- Personal data kept: the original buyer's name on the refunded order line,
  for the statutory seven years.

Open questions (ballot "Resale terms", due 2026-11-01)
1. How many tickets may one buyer have in the return queue at once?
   Recommended: 4, held by the organizer as a listing setting.
2. Can the organizer charge a handling fee on a return?
   Recommended: yes, organizer-set, shown before the buyer confirms.
```

For step 3, the serving use case `use-case/sales.complete-ticket-resale` contributes its goal in one line, and its scenarios contribute their Then clauses as context. The founder approves the promises or answers the ballot from this chapter alone.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/core/intent#keep-intent-in-its-homes | guidance | Each brief, requirement page, goal, problem, feature, constraint, decision, and journey under `docs/product/`, and each research record under `docs/research/`. |
| litespec/core/intent#state-one-product | checkable | `litespec model check` reports no `product-not-singleton` finding, and `litespec consumer` validates the brief fields against the record schema. |
| litespec/core/intent#state-each-goal-with-its-measure | checkable | `litespec consumer` fails a goal page missing a required field or its Why It Matters section. |
| litespec/core/intent#state-each-problem-with-its-evidence | checkable | `litespec consumer` fails a problem page missing its statement, Situation, or Evidence. |
| litespec/core/intent#state-each-feature-with-its-state | checkable | `litespec consumer` fails a feature page missing its state, Offering, refused reason, or planned date. |
| litespec/core/intent#answer-every-constraint | checkable | `litespec consumer` fails a constraint page missing a required field, Summary, or What It Requires. |
| litespec/core/intent#record-research-with-read-sources | checkable | `litespec consumer` fails a research record without `question`, `sources`, or Answer. |
| litespec/core/intent#record-each-choice-as-a-decision | checkable | `litespec consumer` fails a decision missing a required field or section; `litespec model check` reports `decision-decides-nothing` when it settles no record. |
| litespec/core/intent#name-the-person-who-approved-a-decision | guidance | The `approvedBy` name and `approvedOn` date on the approved decision beside the approval from its named decider. |
| litespec/core/intent#replace-a-decision-with-a-new-record | guidance | The `replaces` name on the new decision and the retired status on the old one, in the same change. |
| litespec/core/intent#shape-each-requirement-page | checkable | `litespec consumer` fails a requirement page missing a required section; the `reviewBy` date sits in its frontmatter. |
| litespec/core/intent#identify-every-requirement | checkable | `litespec consumer` fails a requirement entry without identifier, `kind`, or `statement`, or a business requirement without dated values. |
| litespec/core/intent#explain-each-requirement-in-one-line | guidance | The one-line `rationale` on each requirement entry. |
| litespec/core/intent#state-the-measure-on-a-counted-requirement | checkable | `litespec model check` reports no `requirement-unmeasured` finding on requirements whose statements name numbers. |
| litespec/core/intent#order-each-journey-toward-one-goal | checkable | `litespec consumer` fails a journey missing its actor, goal, `finishedWhen`, or steps. |
| litespec/core/intent#keep-behavior-out-of-intent | guidance | Intent records under `docs/product/` and `docs/research/` free of states, results, codes, and code names. |
| litespec/core/intent#treat-generated-research-as-source-material | guidance | A research record or an approved decision behind each position built from generated records. |
| litespec/core/intent#state-each-exception-with-its-fallback | checkable | `litespec model check` reports no `except-without-fallback` finding. |
| litespec/core/intent#write-journey-steps-as-sentences-with-ids | checkable | `litespec consumer` fails a journey step missing `id` or `says`, or naming a use case. |
| litespec/core/intent#state-when-each-journey-finishes | checkable | `litespec consumer` fails a journey missing `finishedWhen`. |
| litespec/core/intent#group-questions-into-ballots | checkable | `litespec model check` reports no `draft-without-decider` finding on Intent questions. |
| litespec/core/intent#leave-business-choices-to-the-founder | guidance | The founder's answer on each business draft question beside its `approvedBy`. |
| litespec/core/intent#treat-tenant-set-values-as-data | guidance | Each `setBy: tenant` value stored as tenant data with no founder approval beside it. |
| litespec/core/intent#group-product-records-by-area | guidance | The `docs/product/` layout beside the project's recorded layout. |
| litespec/core/intent#name-product-decisions-in-one-numbered-sequence | guidance | Each decision file named `<number>-<name>.md` beside its matching identifier. |
