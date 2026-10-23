# Product Intent

## Intent

Product intent is what a business commits to: what it sells, to whom, at what price, and in which markets. It is written before specification and code, apart from what the software does today, so that every rule and use case answers to a commitment somebody approved. This page states where that intent lives, what shape each part takes, and how behavior records trace back to it.

## Concepts

### Product Intent and Its Parts

Business intent is what the product commits to as a business: what it sells, to whom, at what price, and in which markets, plus how the company runs and what comes next.

Business intent is not behavior. A rule, use case, or journey states what the software does today and matches the code. A requirement page states what the business decided and why, and it can describe a position the code does not carry yet. The two connect in one direction: behavior records name the requirements they fulfill, and a product page never describes behavior.

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
| Requirement | One commitment: what the product does, how well it does it, or what the business holds. |
| Requirement page | One page of business intent holding requirement entries. |
| Journey | Ordered steps walking one actor toward one goal. |
| Source material | Generated records outside `docs/` carrying no authority until cited. |

Business intent has three parts that age differently: the present is the position a reader acts on, the future is the next planned change, and the past is the decision that set each choice. A requirement page keeps the present and the future in its chapter and its commitments, while the book lists the requirement entries and the decisions behind them.

### How Intent Reaches Code

The [model page](model.md) states the authority order that settles conflicts between records. Decisions explain choices, and research and prose inform without deciding.

A decision sets the position, and a requirement page states it as requirements. Behavior records name the requirements they fulfill, and the code records what happens today. When behavior contradicts a requirement, either the code carries a defect or the business changed. A changed business means a new decision, approved by a person, before any page or code moves.

## Standards

### Keep Product Intent in Its Homes

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

**Rationale:** An unanswered constraint is an outside rule the product can break unknowingly: a law, a regulation, or provider terms the team never examined. Recording each rule with its source and applicability proves the team asked. A project with no outside rules records that answer too, so a later reader can tell examined from ignored. The `category` is technical, organizational, or convention. Summary states the rule in the source's own words, and What It Requires states what the product does to obey it.

### Record Research with Read Sources

**Statement:** A research record MUST state its `question`, list each source with its read date, and carry Answer.

**Rationale:** A fact without its source cannot be rechecked when a decision depends on it. The read date shows when the outside fact was true, so a later reader knows whether to trust or refresh it. Research without sources and dates asks every later choice to rest on memory. Answer states what the sources say and how sure the answer is, and Notes on Sources holds what a later reader needs about each source.

### Record Each Choice as a Decision

**Statement:** A decision MUST name the records it settles in `decides`, weigh each option with its `for` and `against`, and carry Context, Decision, and Consequences.

**Rationale:** A business choice argued from options and evidence can be revisited on its merits; one argued from authority cannot. Each option carries its name with what speaks for and against it, so the review content sits in the entries instead of a prose section. Context states the choice, Decision states the chosen option in `chosen`, and Consequences states what follows. The `changeWhen` condition names what would reopen the choice, so a decision reopened by a condition rather than a date stays stable until the world actually changes. The `basedOn` link names the constraints and research behind it, and Evidence with Confidence holds the supporting material with its confidence.

### Name the Person Who Approved a Decision

**Statement:** Only the named decider approves a decision, and an approved decision MUST carry `decided`.

**Rationale:** Product, commercial, and legal choices belong to an accountable person. Naming the decider while the decision is a draft shows who approves before release. Building can start on a draft while approval gates the release, so agent work never stalls on one person's queue. The `decided` date proves the approval happened.

### Replace a Decision with a New Record

**Statement:** A changed choice MUST be a new decision naming the old one in `replaces`, with the old one retired in the same change.

**Rationale:** A decision edited in place loses the reason it once held, and every requirement page that cited it silently changes meaning. A new decision naming the old one in `replaces`, with the old one retired in the same change, keeps the reasoning chain intact. The replaced record stays readable as the past, so a later reader can follow why the position moved.

### Shape Each Requirement Page

**Statement:** A `requirement-page` MUST carry its nine chapter and commitment sections with the frontmatter field `reviewBy`.

**Rationale:** The fixed shape puts the present and the future of one area on one page. The chapter sections carry the story for people: Summary, The Situation, What We Do, Why It Is Better, and Example. The commitment sections carry the testable commitments and the choices behind them: Costs and Risks, How Sure We Are, Position, and Refusals. Position holds choices with their decisions, including choices no system carries. A reader learns where each answer sits once and finds it on every page. The `reviewBy` field makes the reread due rather than optional. The book lists the requirement entries, so the page carries no entries section.

### Place the Story Before the Commitments

**Statement:** A `requirement-page` MUST place its chapter for people before its commitments.

**Rationale:** A rule list states what was decided and convinces nobody of why. The chapter carries the situation, the voices, the numbers, the comparison, and one worked example, so the reader understands the choice before meeting its rules. Sources keep the story checkable rather than a pitch, as `litespec/core/intent#cite-sources-for-chapter-claims` states. Commitments first would ask agreement before understanding.

### Cite Sources for Chapter Claims

**Statement:** Each claim in the chapter MUST cite its source.

**Rationale:** A number without its source cannot be rechecked when the market moves or a reader doubts it. The chapter convinces only when every claim traces to its source. Unsourced claims turn the story into a pitch that later plans cannot verify.

### Identify Every Requirement

**Statement:** Each requirement entry MUST carry one identifier `requirement/<topic>.<name>` naming its own page, with `kind` and `statement`.

**Rationale:** An identifier lets a behavior record name the commitment it fulfills and lets the model resolve the name. A commitment written only as prose cannot be traced from code back to intent. The `kind` is functional, quality, or business: what the product does, how well it does it, or what the business holds. A business requirement carries its `values` with effective dates. Any requirement names in `feature` the planned, later, or refused feature that carries it, and in `basedOn` the constraints and research behind it.

### Explain Each Requirement in One Line

**Statement:** Each requirement entry MUST explain its reason in a one-line `rationale`.

**Rationale:** A commitment without its reason cannot be rejudged when the world moves: the reader finds what holds but not why. One line forces the reason into the open without inviting an essay. The chapter carries the full story; the `rationale` carries the reason beside the commitment.

### State the Measure on a Counted Requirement

**Statement:** A requirement whose statement names a number MUST carry `measure` and `by`.

**Rationale:** A number without its measure cannot be checked: the team cannot tell what is counted or when the count holds. The `measure` names what is counted, and `by` names the date or milestone. The schema pairs the two, so a requirement carries both or neither.

### Cite Requirements from Records

**Statement:** A rule, use case, or journey that carries a requirement MUST name it in `fulfills`.

**Rationale:** The link runs from behavior to intent, so a product change shows exactly which rules, use cases, and journeys to revisit. Without the `fulfills` name, a price or policy change starts with a search instead of a list, and some records stay behind. The requirement page stays free of behavior while every behavior record points back to intent.

### Order Each Journey Toward One Goal

**Statement:** A journey MUST walk its actor toward one goal through ordered steps.

**Rationale:** A journey names its `actor`, its `goal` in words, and its ordered `steps`: each step names its use case, the actor walking it, what it requires, and what it gives. The order shows how the steps join toward the goal, so a step that fits nowhere is visible. Example shows the journey walked once, Between the Steps carries the failure branches and handoffs, and Before It Starts holds the state preconditions. The journey names in `fulfills` the requirements it carries.

### Keep Behavior Out of Product Pages

**Statement:** A product page MUST NOT describe states, results, codes, or code.

**Rationale:** A product page that names states, results, codes, or code becomes a second specification, and it drifts from the first with the next behavior change. Two specifications force every reader to ask which one the code follows. Behavior records own behavior and name the requirements they fulfill, so each fact has one home.

### Trace Every Choice to a Decision

**Statement:** Every Position and Refusals entry MUST link an unretired decision record, and an approved one whenever the page is approved.

**Rationale:** A position with no decision behind it is an opinion nobody approved. The link lets a reader check who chose it, when, and on what evidence. Requiring an unretired decision, approved whenever the page is approved, keeps live positions backed by live choices.

### Treat Generated Research as Source Material

**Statement:** An agent MUST treat records generated outside `docs/` as source material until a research record or an approved decision states the claim.

**Rationale:** Records generated outside `docs/` mix verified facts, inferences, and recommendations in one confident voice. Treating them as source material with no authority keeps a recommendation from being built as if someone decided it. A research record or an approved decision restates the claim before anything rests on it.

### Review a Requirement Page by Its Date

**Statement:** The owner MUST reread a `requirement-page` against its decisions and evidence before its `reviewBy` date, then move the date.

**Rationale:** A stale strategy misdirects every plan built on it, and nothing in the code fails when a market or a price moves. The owner rereading the page against its decisions and evidence before the `reviewBy` date catches the drift while the area still guides work. Moving the date after the reread schedules the next one.

### Load Product Intent Before Commercial Work

**Statement:** An agent MUST read the product brief and the affected requirement pages before changing behavior that touches price, money, markets, customers, or terms.

**Rationale:** Commercial behavior that contradicts the business position still compiles and passes its tests: no check compares a price or term against the brief. Only the product pages say it is wrong. Reading the brief and the affected pages before changing price, money, markets, customers, or terms keeps the code inside the position the business approved.

### Derive Requirement Coverage from the Model

**Statement:** A consumer MUST derive its requirement coverage from the model, never by hand.

**Rationale:** Coverage kept by hand goes stale with the next record change and then reports intent the system no longer carries, or hides intent it now does. The model lists each requirement with the records that fulfill it, computed from the current graph. A requirement no record fulfills is intent the system does not carry yet, visible as a gap rather than a guess.

### Build Intent Before Specification Before Code

**Statement:** A behavior change MUST land intent, research, decision, requirement, specification, code, and tests in that order; a decision written after its code is a defect.

**Rationale:** The order makes each layer checkable before the next builds on it: intent first, then research, decision, and requirement, then specification records, then code and tests. A specification written before its decision argues from code instead of from intent. A decision written after its code justifies what already shipped. Approval follows the draft gate on the [model page](model.md): nothing is approved behind a draft.

**Example:** A price change lands its research note, then decision `decision/0011-raise-the-monthly-plan` and requirement `requirement/pricing.monthly-plan-fee`, then the billing `fulfills` link, then the code.

The running Claimwick example lands its receipt threshold in the same order: research `research/approval-time-benchmarks` asks how fast small companies decide expenses, decision `decision/0001-receipt-threshold` chooses 25 EUR and names `requirement/approval.receipt-over-threshold` in `decides`, use case `use-case/spending.submit-expense` names that requirement in `fulfills`, and only then does the submit-expense handler carry it. A decision written after that code would be a defect.

The order of work: intent, then the choice and its commitment, then specification records, then code and tests.

![The order of work in four steps: product brief and requirement pages state what the business commits; research, decision, and requirement hold the evidence, the choice, and the commitment; specification records carry the rules, use cases, and journeys; code and tests are what the product does today.](../assets/diagrams/core-product-order.svg)

### Reject an Unfulfilled Requirement

**Statement:** A consumer MUST fail its checks on a functional, quality, or business requirement that nothing fulfills or delivers, outside a known gap.

**Rationale:** Failing the checks on an unfulfilled functional, quality, or business requirement keeps intent and system aligned: the team either connects the requirement or admits the gap. A rule, use case, or journey fulfills a requirement, and a planned, later, or refused feature delivers it through the `feature` link. A retired requirement is past intent and needs no fulfillment. Planned work belongs to its feature, so a known gap marks only what nobody owns.

### Build on a Draft Decision Before Approval

**Statement:** An agent MAY build on a `draft` decision while approval gates the release, not the code.

**Rationale:** Approval before every edit stalls agent work on a queue of one person. Building on a draft keeps work moving while the decider reviews. The release still needs the approval, so nothing ships on a draft alone.

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

This informative example demonstrates `litespec/core/intent#trace-every-choice-to-a-decision`, `litespec/core/intent#identify-every-requirement`, and `litespec/core/intent#cite-requirements-from-records`.

A subscription business keeps `docs/product/business/pricing.md` with `id` `pricing`. Its entries state `requirement/pricing.monthly-plan-fee`, and its Position row for the monthly plan links `decision/0003-monthly-plan`. The billing use case names that requirement in `fulfills`. When the price changes, decision `decision/0011-raise-the-monthly-plan` replaces `decision/0003-monthly-plan`: the pricing row links the new record, and the book lists both.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/core/intent#keep-product-intent-in-its-homes | guidance | Each brief, requirement page, goal, problem, feature, constraint, decision, and journey under `docs/product/`, and each research record under `docs/research/`. |
| litespec/core/intent#state-one-product | checkable | `litespec model check` reports no `product-not-singleton` finding, and `litespec consumer` validates the brief fields against the record schema. |
| litespec/core/intent#state-each-goal-with-its-measure | checkable | `litespec consumer` fails a goal page missing a required field or its Why It Matters section. |
| litespec/core/intent#state-each-problem-with-its-evidence | checkable | `litespec consumer` fails a problem page missing its statement, Situation, or Evidence. |
| litespec/core/intent#state-each-feature-with-its-state | checkable | `litespec consumer` fails a feature page missing its state, Offering, refused reason, or planned date. |
| litespec/core/intent#answer-every-constraint | checkable | `litespec consumer` fails a constraint page missing a required field, Summary, or What It Requires. |
| litespec/core/intent#record-research-with-read-sources | checkable | `litespec consumer` fails a research record without `question`, `sources`, or Answer. |
| litespec/core/intent#record-each-choice-as-a-decision | checkable | `litespec consumer` fails a decision missing a required field or section; `litespec model check` reports `decision-decides-nothing` when it settles no record. |
| litespec/core/intent#name-the-person-who-approved-a-decision | guidance | The `decided` date on the decision beside the approval from its named decider. |
| litespec/core/intent#replace-a-decision-with-a-new-record | guidance | The `replaces` name on the new decision and the retired status on the old one, in the same change. |
| litespec/core/intent#shape-each-requirement-page | checkable | `litespec consumer` fails a requirement page missing a required section; the `reviewBy` date sits in its frontmatter. |
| litespec/core/intent#place-the-story-before-the-commitments | guidance | The chapter sections ahead of the commitment sections on each requirement page. |
| litespec/core/intent#cite-sources-for-chapter-claims | guidance | A source beside each number and claim in the chapter. |
| litespec/core/intent#identify-every-requirement | checkable | `litespec consumer` fails a requirement entry without identifier, `kind`, or `statement`, or a business requirement without dated values. |
| litespec/core/intent#explain-each-requirement-in-one-line | guidance | The one-line `rationale` on each requirement entry. |
| litespec/core/intent#state-the-measure-on-a-counted-requirement | guidance | The `measure` and `by` fields on each requirement whose statement names a number. |
| litespec/core/intent#cite-requirements-from-records | guidance | The `fulfills` names on each rule, use case, and journey beside the requirements they carry. |
| litespec/core/intent#order-each-journey-toward-one-goal | checkable | `litespec consumer` fails a journey page missing its actor, goal, steps, Example, or Between the Steps. |
| litespec/core/intent#keep-behavior-out-of-product-pages | guidance | Product pages under `docs/product/` and `docs/research/` free of state, result, code, and code names. |
| litespec/core/intent#trace-every-choice-to-a-decision | guidance | The decision link behind each Position and Refusals entry, with its status beside the page status. |
| litespec/core/intent#treat-generated-research-as-source-material | guidance | A research record or an approved decision behind each position built from generated records. |
| litespec/core/intent#review-a-requirement-page-by-its-date | guidance | A future `reviewBy` date in the frontmatter of each requirement page. |
| litespec/core/intent#load-product-intent-before-commercial-work | guidance | The brief and the affected requirement pages named in the change report for the behavior change. |
| litespec/core/intent#derive-requirement-coverage-from-the-model | guidance | The requirement coverage rendered from the model, with no hand-kept list beside it. |
| litespec/core/intent#build-intent-before-specification-before-code | guidance | The research, decision, requirement, records, code, and tests for the change, landed in that order. |
| litespec/core/intent#reject-an-unfulfilled-requirement | checkable | `litespec model check` reports no `requirement-unfulfilled` finding outside an open known gap. |
| litespec/core/intent#build-on-a-draft-decision-before-approval | guidance | The approval on every decision behind the released records. |
| litespec/core/intent#group-product-records-by-area | guidance | The `docs/product/` layout beside the project's recorded layout. |
| litespec/core/intent#name-product-decisions-in-one-numbered-sequence | guidance | Each decision file named `<number>-<name>.md` beside its matching identifier. |
