# Product Intent

## Intent

This page governs where a consumer states its business intent and in what form. Business intent is what the product commits to as a business. It covers what the product sells, to whom, at what price, and in which markets. It also covers how the company runs and what comes next.

Business intent is not behavior. A rule, use case, or journey states what the software does today and matches the code. A product page states what the business has decided and why, and it can describe a position the code does not carry yet. The two connect in one direction: behavior records name the requirements they fulfill, and a product page never describes behavior.

Business intent has three parts that age differently. The present is the position a reader acts on. The future is the next planned change. The past is the decision that set each choice. This page keeps all three in one home, `docs/product/`, without letting a page narrate its own history.

## Concepts

The [model page](model.md) defines the record types and links.

| Term | Meaning |
|:---|:---|
| Product | The one record stating what the product is, for whom, and its boundary. |
| Constraint | An outside rule the product must obey, with its source and whether it applies. |
| Research | An outside fact behind a choice, with the sources read and the question asked. |
| Decision | A dated choice with options, decider, evidence, and what would change it. |
| Requirement | One commitment: a promise, behavior, or quality the code keeps, or a target or practice kept elsewhere. |
| Problem | A pain or job someone has today, with the people it affects. |
| Feature | What the product offers against a problem: planned, shipped, later, or refused. |
| Product topic | One page of business intent holding Requirement entries. |
| Source material | Generated records outside `docs/` carrying no authority until cited. |

Authority runs through constraint, product, requirement, rule, and use case. Decisions explain choices. Research and prose carry no authority.

```text
constraint  ->  product  ->  requirement  ->  rule, use case  ->  code
(outside rule)   (what we are)  (what we commit)  (how it behaves)  (what runs)
```

A decision sets the position. A product topic page states it as requirements. Behavior records name the requirements they fulfill. The code is the record of what happens today. When behavior contradicts a requirement, either the code carries a defect or the business changed. A changed business is a new decision, approved by a person, before any page or code moves.

## Standards

### Keep business intent under product

**Requirement:** A consumer MUST keep its brief, product topic pages, decisions, constraints, problems, and features under `docs/product/`, and its research under `docs/research/`.

**Rationale:** Intent split across notes and books has no single answer to the question an agent asks before building. One home per kind gives every reader one place to look.

### State one product

**Requirement:** A consumer MUST state exactly one Product record in its brief, with boundary, never list, and audience.

**Rationale:** One product gives every reader one answer to what the business is. The never list refuses what the product does not become.

### Answer every constraint

**Requirement:** A consumer MUST record each outside rule as a Constraint with source and applicability, and mark constraints answered.

**Rationale:** An unanswered constraint is a law the product may break unknowingly. A project with no outside rules records that answer too.

### State each topic in one page shape

**Requirement:** A `product-topic` page MUST carry the chapter sections and the commitment sections of the product topic template, and the frontmatter field `reviewBy`.

**Rationale:** The fixed shape puts the present, the future, and the past of one topic on one page. The chapter sections are Summary, The situation, What we do, Why it is better, A worked example, Costs and risks, and How sure we are. The commitment sections are Rules, Position, Refusals, Open questions, Next, History, and Evidence. Rules holds every testable commitment as a Requirement entry. Position holds choices with their decisions, including choices no system carries. A reader learns where each answer sits once and finds it on every topic.

### Place the story before the commitments

**Requirement:** A `product-topic` page MUST place its chapter for people before its commitments.

**Rationale:** A rule list states what was decided and convinces nobody of why. The chapter carries the situation, the voices, the numbers, the comparison, and one worked example, so you understand the choice before reading its rules. Sources keep the story checkable rather than a pitch, as `litespec/core/product#cite-sources-for-chapter-claims` states.

### Cite sources for chapter claims

**Requirement:** Each claim in the chapter MUST cite its source.

**Rationale:** A number without its source cannot be rechecked. The chapter convinces only when its claims are checkable.

### Identify every requirement

**Requirement:** Each Requirement entry MUST carry one identifier `requirement/<topic>.<name>` naming its own page, with kind, statement, and for a promise its values with effective dates.

**Rationale:** An identifier lets a record name the commitment it fulfills, and lets the model resolve the name. A commitment written only as prose cannot be traced. Kinds are promise, behavior, quality, target, and practice. A target names what is counted in `measure` and the date or milestone in `by`. A practice is a commitment kept in how the company works. Any requirement may name in `deliveredBy` the planned, later, or refused feature that carries it.

### Cite requirements from records

**Requirement:** A rule, use case, or journey that carries a requirement MUST name it in `fulfills`.

**Rationale:** The link runs from behavior to intent, so a product change shows which records to revisit.

### Keep behavior out of product pages

**Requirement:** A product page MUST NOT describe states, entry points, failure codes, or handlers.

**Rationale:** A product page that describes behavior becomes a second specification, and it drifts from the first. Behavior records own behavior and name the requirements they fulfill.

### Record research with read sources

**Requirement:** A Research record under `docs/research/` MUST state its question and list each source with its read date.

**Rationale:** A fact without its source cannot be rechecked. The read date shows when the outside fact was true.

### State each problem and feature

**Requirement:** A Problem MUST state who it affects and what they face, and a Feature the problems it solves and its state.

**Rationale:** Problems without owners attract solutions nobody needs. A refused feature keeps its reason so the refusal is not relitigated.

### Trace every choice to a decision

**Requirement:** Every Position and Refusals entry MUST link an unretired decision record, and an approved one whenever the page is approved.

**Rationale:** A position with no decision behind it is an opinion that nobody approved. The link lets a reader check who chose it, when, and on what evidence.

### Record each product choice as a decision

**Requirement:** A decision that sets product records MUST name them in `decides` and carry the sections of the decision template.

**Rationale:** A business choice is argued from options and evidence, and it is reopened by a condition rather than by a date. The sections are Context, Options, Decision, Consequences, and Evidence.

### Name the person who approved a decision

**Requirement:** Only the named decider approves a decision, and an approved decision MUST carry `decided`.

**Rationale:** Product, commercial, and legal choices belong to an accountable person, as `litespec/core/system#keep-decision-authority-with-accountable-people` states. The decider is named while the decision is a draft. Approval gates the release, while building may start on a draft. An agent drafts the decision for the decider.

### Replace a decision with a new record

**Requirement:** A changed choice MUST be a new decision naming the old one in `replaces`, with the old one retired in the same change.

**Rationale:** A decision edited in place loses the reason it once held, and the topic pages that cited it silently change meaning. A replaced record stays readable as the past.

### Derive history from decisions

**Requirement:** The History section of a product topic page MUST list exactly the decisions that decide its entries, as a generated region.

**Rationale:** A past typed by hand drifts from the records it claims. Only the model builder writes the region. Regions are fenced as the [model page](model.md) defines.

### Treat generated research as source material

**Requirement:** An agent MUST treat records generated outside `docs/` as source material until a Research record or an approved decision states the claim.

**Rationale:** Generated research mixes verified facts, inferences, and recommendations in one voice. A recommendation from an agent that reads as a decision gets built without anyone having made it.

### Review a topic by its date

**Requirement:** The owner MUST reread a `product-topic` page against its decisions and evidence before its `reviewBy` date, then move the date.

**Rationale:** A stale strategy misdirects every plan built on it, and nothing in the code fails when a market or a price moves. A date makes the reread due rather than optional.

### Load product intent before commercial work

**Requirement:** An agent MUST read the product brief and the affected product topics before changing behavior that touches price, money, markets, customers, or terms.

**Rationale:** Commercial behavior that contradicts the business position compiles and passes its tests. Only the product pages say it is wrong.

### Derive requirement coverage from the model

**Requirement:** A consumer MUST derive its requirement coverage from the model, never by hand.

**Rationale:** A requirement no record fulfills is intent the system does not carry yet. The model lists each requirement with the records that fulfill it.

### Build intent before specification before code

**Requirement:** A behavior change MUST land intent, research, decision, requirement, specification, code, and tests in that order; a decision written after its code is a defect.

**Rationale:** The order makes each layer checkable before the next builds on it. A specification written before its decision argues from code. Approval follows `litespec/core/principles#refuse-approval-behind-a-draft-decision`: nothing is approved behind a draft.

**Example:** A price change lands its research note, then decision `decision/0011-raise-the-monthly-plan` and requirement `requirement/pricing.monthly-plan-fee`, then the billing `fulfills` link, then the code.

The running library example lands its loan period in the same order: research `research/loan-period-benchmarks` asks how long city libraries lend, decision `decision/0001-loan-period` chooses 21 days and names `requirement/borrowing.loan-period-days` in `decides`, use case `use-case/lending.extend-loan` names that requirement in `fulfills`, and only then does the `ExtendLoanCommand` code carry it. A decision written after that code would be a defect.

The order of work: intent, then the choice and its commitment, then specification records, then code and tests.

![The order of work in four steps: product brief and topic pages state what the business commits; research, decision, and requirement hold the evidence, the choice, and the commitment; specification records carry the rules, use cases, and journeys; code and tests are what the product does today.](../assets/diagrams/core-product-order.svg)

### Reject an unfulfilled requirement

**Requirement:** A consumer MUST fail its checks on a promise, behavior, or quality requirement that nothing fulfills or delivers, outside a Known gap.

**Rationale:** A rule, use case, or journey fulfills a requirement, and a planned, later, or refused feature delivers it. A target or practice is measured or kept outside the code, so deleting one to clear the check loses intent. Planned work belongs to its feature, so a Known gap marks only what nobody owns.

### Build on a draft decision before approval

**Requirement:** An agent MAY build on a `draft` decision while approval gates the release, not the code.

**Rationale:** Approval before every edit stalls agent work on a queue of one person. The release still needs the approval, so nothing ships on a draft alone.

## Conventions

### Group product topics by area

**Default:** Keep the brief at `docs/product/brief.md`, topic pages in one folder per area, each other kind in its folder, and research under `docs/research/`.

**Replacement:** A consumer records an Exception naming this provision, with its reason and review date.

**Rationale:** An area folder keeps related topics together. One folder per kind keeps each record findable.

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
  problems/
    <name>.md
  features/
    <name>.md
  journeys/
    <name>.md
```

### Name product decisions in one numbered sequence

**Default:** Name each product decision `<four-digit number>-<name>.md` and use `decision/<four-digit number>-<name>` as its identifier.

**Replacement:** A consumer records an Exception naming this provision, with its reason and review date.

**Rationale:** One sequence orders the record by when a choice was proposed. The number counts as a word, so digits never stand alone.

## Reference example

This informative example demonstrates `litespec/core/product#trace-every-choice-to-a-decision`, `litespec/core/product#identify-every-requirement`, and `litespec/core/product#cite-requirements-from-records`.

A subscription business keeps `docs/product/business/pricing.md` with `id` `pricing`. Its Rules section states `requirement/pricing.monthly-plan-fee`, and its Position row for the monthly plan links `decision/0003-monthly-plan`. The billing use case names the requirement in `fulfills`. When the price changes, decision `decision/0011-raise-the-monthly-plan` replaces `decision/0003-monthly-plan`. The pricing row then links the new record, and History lists both.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/core/product#keep-business-intent-under-product | checkable | `litespec consumer` fails a why-layer record outside its home folder. |
| litespec/core/product#state-one-product | checkable | `litespec consumer` fails a brief without one product, boundary, and audience. |
| litespec/core/product#answer-every-constraint | checkable | `litespec consumer` fails a constraint without source and applicability, or a project with unanswered constraints. |
| litespec/core/product#state-each-topic-in-one-page-shape | checkable | `litespec consumer` fails a topic page missing a required section or `reviewBy`. |
| litespec/core/product#place-the-story-before-the-commitments | checkable | `litespec consumer` fails a topic whose chapter follows its commitments. |
| litespec/core/product#cite-sources-for-chapter-claims | guidance | Does each claim in the chapter cite its source? |
| litespec/core/product#identify-every-requirement | checkable | `litespec consumer` fails a Requirement entry without identifier, kind, or statement, or a promise without effective-dated values. |
| litespec/core/product#cite-requirements-from-records | guidance | Does every record that carries a requirement name it in `fulfills`? |
| litespec/core/product#keep-behavior-out-of-product-pages | guidance | Does any product page name a state, entry point, failure code, or handler? |
| litespec/core/product#record-research-with-read-sources | checkable | `litespec consumer` fails a Research record without question or source read date. |
| litespec/core/product#state-each-problem-and-feature | checkable | `litespec consumer` fails a problem or feature missing its required fields. |
| litespec/core/product#trace-every-choice-to-a-decision | guidance | Does every Position and Refusals entry link an unretired decision, approved when the page is approved? |
| litespec/core/product#record-each-product-choice-as-a-decision | checkable | `litespec consumer` fails a decision missing a required section or `decides` target. |
| litespec/core/product#name-the-person-who-approved-a-decision | guidance | Did the named decider approve the decision, and does the record carry the date? |
| litespec/core/product#replace-a-decision-with-a-new-record | guidance | Does the new decision name the old one in `replaces`, with the old one retired? |
| litespec/core/product#derive-history-from-decisions | guidance | Does History list exactly the decisions that decide the page, as generated? |
| litespec/core/product#treat-generated-research-as-source-material | guidance | Does every new position trace to a Research record or an approved decision? |
| litespec/core/product#review-a-topic-by-its-date | checkable | `litespec consumer` fails a topic page whose `reviewBy` date has passed. |
| litespec/core/product#load-product-intent-before-commercial-work | guidance | Does the change report list the product pages read before the change? |
| litespec/core/product#derive-requirement-coverage-from-the-model | guidance | Does the coverage list come from the model rather than hand-kept notes? |
| litespec/core/product#build-intent-before-specification-before-code | guidance | Did intent, research, decision, requirement, records, code, and tests land in order? |
| litespec/core/product#reject-an-unfulfilled-requirement | checkable | `litespec model check` reports no `requirement-unfulfilled` finding outside an open Known gap. |
| litespec/core/product#build-on-a-draft-decision-before-approval | guidance | Does the release hold approval for every decision the code builds on? |
| litespec/core/product#group-product-topics-by-area | guidance | Does `docs/product/` follow the example layout, or does an Exception record the replacement? |
| litespec/core/product#name-product-decisions-in-one-numbered-sequence | checkable | `litespec consumer` fails a decision file whose name does not match its identifier. |
