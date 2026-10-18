# Product Intent

## Intent

This page governs where a consumer states its business intent and in what shape. Business intent is what the product commits to as a business. It covers what the product sells, to whom, at what price, and in which markets. It also covers how the company runs and what comes next.

Business intent is not behavior. A rule, use case, or journey states what the software does today and matches the code. A product page states what the business has decided and why, and it can describe a position the code does not carry yet. The two connect in one direction: behavior records name the requirements they fulfil, and a product page never describes behavior.

Business intent has three parts that age differently. The present is the position a reader acts on. The future is the next planned change. The past is the decision that set each choice. This page keeps all three in one home, `docs/product/`, without letting a page narrate its own history.

## Agent Summary {#agent-summary}

- Why-layer records live in their homes under docs/product/ and docs/research/. (standards/rule/core-product.keep-business-intent-under-product, standards/rule/core-product.group-product-topics-by-area)
- The brief states one product; each topic holds Requirement entries, never behavior. (standards/rule/core-product.state-one-product, standards/rule/core-product.state-each-topic-in-one-page-shape, standards/rule/core-product.identify-every-requirement, standards/rule/core-product.keep-behavior-out-of-product-pages)
- Chapters tell the story with sources before the commitments. (standards/rule/core-product.place-the-story-before-the-commitments, standards/rule/core-product.cite-sources-for-chapter-claims)
- Constraints are answered, research cites read sources, problems pair with features. (standards/rule/core-product.answer-every-constraint, standards/rule/core-product.record-research-with-read-sources, standards/rule/core-product.state-each-problem-and-feature)
- Each choice links its decision; history and coverage derive from the model. (standards/rule/core-product.trace-every-choice-to-a-decision, standards/rule/core-product.record-each-product-choice-as-a-decision, standards/rule/core-product.derive-history-from-decisions, standards/rule/core-product.derive-requirement-coverage-from-the-model)
- An agent drafts, a person approves, and a new record replaces an old choice. (standards/rule/core-product.name-the-person-who-approved-a-decision, standards/rule/core-product.replace-a-decision-with-a-new-record, standards/rule/core-product.build-on-a-draft-decision-before-approval)
- Records cite requirements in fulfils; checks fail an unfulfilled one. (standards/rule/core-product.cite-requirements-from-records, standards/rule/core-product.reject-an-unfulfilled-requirement)
- Work lands intent, research, decision, requirement, records, code, and tests. (standards/rule/core-product.build-intent-before-specification-before-code)
- Generated records are source material until a decision states the claim. (standards/rule/core-product.treat-generated-research-as-source-material)
- Each topic carries a review date; commercial work loads intent first. (standards/rule/core-product.review-a-topic-by-its-date, standards/rule/core-product.load-product-intent-before-commercial-work)
- Decisions share one numbered sequence. (standards/rule/core-product.name-product-decisions-in-one-numbered-sequence)

## Concepts

The record types and links are defined in [docs/core/model.md](model.md).

| Term | Meaning |
|:---|:---|
| Product | The one record stating what the product is, for whom, and its boundary. |
| Constraint | An outside rule the product must obey, with its source and whether it applies. |
| Research | An outside fact behind a choice, with the sources read and the question asked. |
| Decision | A dated choice with options, decider, evidence, and what would change it. |
| Requirement | One testable commitment: a promise, a behaviour, or a quality. |
| Problem | A pain or job someone has today, with who it affects. |
| Feature | What the product offers against a problem: planned, shipped, later, or refused. |
| Product topic | One page of business intent holding Requirement entries. |
| Source material | Generated records outside docs/ carrying no authority until cited. |

Authority runs constraint, product, requirement, rule, then use case. Decisions explain choices. Research and prose carry none.

```text
constraint  ->  product  ->  requirement  ->  rule, use case  ->  code
(outside rule)   (what we are)  (what we commit)  (how it behaves)  (what runs)
```

A decision sets the position. A topic page states it as requirements. Behavior records name the requirements they fulfil. The code is the record of what happens today. When behavior contradicts a requirement, either the code carries a defect or the business changed. A changed business is a new decision, approved by a person, before any page or code moves.

## Standards

### Keep business intent under product (standards/rule/core-product.keep-business-intent-under-product)

**Requirement:** A consumer MUST keep its brief, product topic pages, decisions, constraints, problems, and features under `docs/product/`, and its research under `docs/research/`.

**Rationale:** Intent split across notes and books has no single answer to the question an agent asks before building. One home per kind gives every reader one place to look.

### State one product (standards/rule/core-product.state-one-product)

**Requirement:** A consumer MUST state exactly one Product record in its brief, with boundary, never list, and audience.

**Rationale:** One product gives every reader one answer to what the business is. The never list refuses what the product will not become.

### Answer every constraint (standards/rule/core-product.answer-every-constraint)

**Requirement:** A consumer MUST record each outside rule as a Constraint with source and applicability, and mark constraints answered.

**Rationale:** An unanswered constraint is a law the product may break unknowingly. A project with no outside rules records that answer too.

### State each topic in one page shape (standards/rule/core-product.state-each-topic-in-one-page-shape)

**Requirement:** A `product-topic` page MUST carry the chapter sections and the commitment sections of the product topic template, and the frontmatter field `reviewBy`.

**Rationale:** The fixed shape puts the present, the future, and the past of one topic on one page. The chapter sections are Summary, The situation, What we do, Why it is better, A worked example, Costs and risks, and How sure we are. The commitment sections are Rules, Position, Refusals, Open questions, Next, History, and Evidence. Rules holds every testable commitment as a Requirement entry. Position holds choices with their decisions, including choices no system carries. A reader learns where each answer sits once and finds it on every topic.

### Place the story before the commitments (standards/rule/core-product.place-the-story-before-the-commitments)

**Requirement:** A `product-topic` page MUST place its chapter for people before its commitments.

**Rationale:** A rule list states what was decided and convinces nobody of why. The chapter carries the situation, the voices, the numbers, the comparison, and one worked example, so a person understands the choice before reading its rules. Sources keep the story checkable rather than a pitch, as `standards/rule/core-product.cite-sources-for-chapter-claims` requires.

### Cite sources for chapter claims (standards/rule/core-product.cite-sources-for-chapter-claims)

**Requirement:** Each claim in the chapter MUST cite its source.

**Rationale:** A number without its source cannot be rechecked. The chapter convinces only when its claims are checkable.

### Identify every requirement (standards/rule/core-product.identify-every-requirement)

**Requirement:** Each Requirement entry MUST carry one identifier `requirement/<topic>.<name>` naming its own page, with kind and statement. A promise MUST carry its values with effective dates.

**Rationale:** An identifier lets a record name the commitment it fulfils, and lets the model resolve the name. A commitment written only as prose cannot be traced. Kinds are promise, behaviour, and quality, as [docs/core/model.md](model.md) defines.

### Cite requirements from records (standards/rule/core-product.cite-requirements-from-records)

**Requirement:** A rule, use case, or journey that carries a requirement MUST name it in `fulfils`.

**Rationale:** The link runs from behavior to intent, so a product change shows which records to revisit.

### Keep behavior out of product pages (standards/rule/core-product.keep-behavior-out-of-product-pages)

**Requirement:** A product page MUST NOT describe states, entry points, failure codes, or handlers.

**Rationale:** A product page that describes behavior becomes a second specification, and it drifts from the first. Behavior records own behavior and name the requirements they fulfil.

### Record research with read sources (standards/rule/core-product.record-research-with-read-sources)

**Requirement:** A Research record MUST state its question and list each source with its read date. It lives under `docs/research/`.

**Rationale:** A fact without its source cannot be rechecked. The read date shows when the outside fact was true.

### State each problem and feature (standards/rule/core-product.state-each-problem-and-feature)

**Requirement:** A Problem MUST state who it affects and what they face. A Feature MUST name the problems it solves and its state.

**Rationale:** Problems without owners attract solutions nobody needs. A refused feature keeps its reason so the refusal is not relitigated.

### Trace every choice to a decision (standards/rule/core-product.trace-every-choice-to-a-decision)

**Requirement:** Every Position and Refusals entry MUST link an unretired decision record, and an approved one whenever the page is approved.

**Rationale:** A position with no decision behind it is an opinion that nobody approved. The link lets a reader check who chose it, when, and on what evidence.

### Record each product choice as a decision (standards/rule/core-product.record-each-product-choice-as-a-decision)

**Requirement:** A decision that sets product records MUST name them in `decides` and carry the sections of the decision template.

**Rationale:** A business choice is argued from options and evidence, and it is reopened by a condition rather than by a date. The sections are Context, Options, Decision, Consequences, and Evidence.

### Name the person who approved a decision (standards/rule/core-product.name-the-person-who-approved-a-decision)

**Requirement:** An agent MAY draft a decision. Only the named decider approves it, and an approved decision MUST carry `decided`.

**Rationale:** Product, commercial, and legal choices belong to an accountable person, as `standards/rule/core-system.keep-decision-authority-with-accountable-people` states. The decider is named while the decision is a draft. Approval gates the release, while building may start on a draft.

### Replace a decision with a new record (standards/rule/core-product.replace-a-decision-with-a-new-record)

**Requirement:** A changed choice MUST be a new decision naming the old one in `replaces`, with the old one retired in the same change.

**Rationale:** A decision edited in place loses the reason it once held, and the topic pages that cited it silently change meaning. A replaced record stays readable as the past.

### Derive history from decisions (standards/rule/core-product.derive-history-from-decisions)

**Requirement:** The History section of a product topic page MUST list exactly the decisions that decide its entries, as a generated region.

**Rationale:** A past typed by hand drifts from the records it claims. Only the model builder writes the region. Regions are fenced as [docs/core/model.md](model.md) defines.

### Treat generated research as source material (standards/rule/core-product.treat-generated-research-as-source-material)

**Requirement:** An agent MUST treat records generated outside `docs/` as source material until a Research record or an approved decision states the claim.

**Rationale:** Generated research mixes verified facts, inferences, and recommendations in one voice. A recommendation from an agent that reads as a decision gets built without anyone having made it.

### Review a topic by its date (standards/rule/core-product.review-a-topic-by-its-date)

**Requirement:** The owner MUST reread a `product-topic` page against its decisions and evidence before its `reviewBy` date, then move the date.

**Rationale:** A stale strategy misdirects every plan built on it, and nothing in the code fails when a market or a price moves. A date makes the reread due rather than optional.

### Load product intent before commercial work (standards/rule/core-product.load-product-intent-before-commercial-work)

**Requirement:** An agent MUST read the product brief and the affected product topics before changing behavior that touches price, money, markets, buyers, or terms.

**Rationale:** Commercial behavior that contradicts the business position compiles and passes its tests. Only the product pages say it is wrong.

### Derive requirement coverage from the model (standards/rule/core-product.derive-requirement-coverage-from-the-model)

**Requirement:** A consumer MUST derive its requirement coverage from the model, never by hand.

**Rationale:** A requirement no record fulfils is intent the system does not carry yet. The model lists each requirement with the records that fulfil it.

### Build intent before specification before code (standards/rule/core-product.build-intent-before-specification-before-code)

**Requirement:** A behavior change MUST land intent, research, decision, requirement, specification records, code, and tests, in that order. A decision written after its code shipped is a defect.

**Rationale:** The order makes each layer checkable before the next builds on it. A specification written before its decision argues from code. Approval follows `standards/rule/core-principles.refuse-approval-behind-a-draft-decision`: nothing is approved behind a draft.

**Example:** A price change lands its research note, then decision `decision/0011-raise-the-monthly-plan` and requirement `requirement/pricing.monthly-plan-fee`, then the billing `fulfils` link, then the code.

### Reject an unfulfilled requirement (standards/rule/core-product.reject-an-unfulfilled-requirement)

**Requirement:** A consumer MUST fail its checks on a requirement no record fulfils, unless a Known gap names it with owner and end date.

**Rationale:** A list nobody clears separates planned work from nothing. The gap states whether the requirement is dated work or intent that never becomes code.

### Build on a draft decision before approval (standards/rule/core-product.build-on-a-draft-decision-before-approval)

**Requirement:** An agent MAY build on a `draft` decision while approval gates the release, not the code.

**Rationale:** Approval before every edit stalls agent work on a queue of one person. The release still needs the approval, so nothing ships on a draft alone.

## Conventions

### Group product topics by area (standards/rule/core-product.group-product-topics-by-area)

**Default:** Keep the brief at `docs/product/brief.md`, topic pages in one folder per area, and constraints, decisions, problems, features, and journeys each in their folder. Research lives under `docs/research/`.

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

### Name product decisions in one numbered sequence (standards/rule/core-product.name-product-decisions-in-one-numbered-sequence)

**Default:** Name each product decision `<four-digit number>-<name>.md` and use `decision/<four-digit number>-<name>` as its identifier.

**Replacement:** A consumer records an Exception naming this provision, with its reason and review date.

**Rationale:** One sequence orders the record by when a choice was proposed. The number counts as a word, so digits never stand alone.

## Reference example

This informative example demonstrates `standards/rule/core-product.trace-every-choice-to-a-decision`, `standards/rule/core-product.identify-every-requirement`, and `standards/rule/core-product.cite-requirements-from-records`.

A subscription business keeps `docs/product/business/pricing.md` with id `pricing`. Its Rules section states `requirement/pricing.monthly-plan-fee`, and its Position row for the monthly plan links `decision/0003-monthly-plan`. The billing use case names the requirement in `fulfils`. When the price changes, decision `decision/0011-raise-the-monthly-plan` replaces `decision/0003-monthly-plan`. The pricing row then links the new record, and History lists both.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| standards/rule/core-product.keep-business-intent-under-product | checkable | `node tools/validate-consumer.mjs` fails a why-layer record outside its home folder. |
| standards/rule/core-product.state-one-product | checkable | `node tools/validate-consumer.mjs` fails a brief without one product, boundary, and audience. |
| standards/rule/core-product.answer-every-constraint | checkable | `node tools/validate-consumer.mjs` fails a constraint without source and applicability, or a project with unanswered constraints. |
| standards/rule/core-product.state-each-topic-in-one-page-shape | checkable | `node tools/validate-consumer.mjs` fails a topic page missing a required section or `reviewBy`. |
| standards/rule/core-product.place-the-story-before-the-commitments | checkable | `node tools/validate-consumer.mjs` fails a topic whose chapter follows its commitments. |
| standards/rule/core-product.cite-sources-for-chapter-claims | guidance | Does each claim in the chapter cite its source? |
| standards/rule/core-product.identify-every-requirement | checkable | `node tools/validate-consumer.mjs` fails a Requirement entry without identifier, kind, or statement, or a promise without effective-dated values. |
| standards/rule/core-product.cite-requirements-from-records | guidance | Does every record that carries a requirement name it in `fulfils`? |
| standards/rule/core-product.keep-behavior-out-of-product-pages | guidance | Does any product page name a state, entry point, failure code, or handler? |
| standards/rule/core-product.record-research-with-read-sources | checkable | `node tools/validate-consumer.mjs` fails a Research record without question or source read date. |
| standards/rule/core-product.state-each-problem-and-feature | checkable | `node tools/validate-consumer.mjs` fails a problem or feature missing its required fields. |
| standards/rule/core-product.trace-every-choice-to-a-decision | guidance | Does every Position and Refusals entry link an unretired decision, approved when the page is approved? |
| standards/rule/core-product.record-each-product-choice-as-a-decision | checkable | `node tools/validate-consumer.mjs` fails a decision missing a required section or `decides` target. |
| standards/rule/core-product.name-the-person-who-approved-a-decision | guidance | Did the named decider approve the decision, and does the record carry the date? |
| standards/rule/core-product.replace-a-decision-with-a-new-record | guidance | Does the new decision name the old one in `replaces`, with the old one retired? |
| standards/rule/core-product.derive-history-from-decisions | guidance | Does History list exactly the decisions that decide the page, as generated? |
| standards/rule/core-product.treat-generated-research-as-source-material | guidance | Does every new position trace to a Research record or an approved decision? |
| standards/rule/core-product.review-a-topic-by-its-date | checkable | `node tools/validate-consumer.mjs` fails a topic page whose `reviewBy` date has passed. |
| standards/rule/core-product.load-product-intent-before-commercial-work | guidance | Does the change report list the product pages read before the change? |
| standards/rule/core-product.derive-requirement-coverage-from-the-model | guidance | Does the coverage list come from the model rather than hand-kept notes? |
| standards/rule/core-product.build-intent-before-specification-before-code | guidance | Did intent, research, decision, requirement, records, code, and tests land in order? |
| standards/rule/core-product.reject-an-unfulfilled-requirement | guidance | Does every requirement have a fulfilling record or a Known gap naming it? |
| standards/rule/core-product.build-on-a-draft-decision-before-approval | guidance | Does the release hold approval for every decision the code builds on? |
| standards/rule/core-product.group-product-topics-by-area | guidance | Does `docs/product/` follow the example layout, or does an Exception record the replacement? |
| standards/rule/core-product.name-product-decisions-in-one-numbered-sequence | checkable | `node tools/validate-consumer.mjs` fails a decision file whose name does not match its identifier. |
