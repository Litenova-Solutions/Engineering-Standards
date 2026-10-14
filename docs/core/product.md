# Product Intent

## Intent

This page governs where a consumer states its business intent and in what shape. Business intent is what the product commits to as a business. It covers what the product sells, to whom, at what price, and in which markets. It also covers how the company runs and what comes next.

Business intent is not behavior. A domain specification states what the software does today and matches the code. A product page states what the business has decided and why, and it can describe a position the code does not carry yet. The two connect in one direction: a domain specification cites a product rule, and a product page never describes behavior.

Business intent has three parts that age differently. The present is the position a reader acts on. The future is the next planned change. The past is the decision that set each choice. This page keeps all three in one home, `docs/product/`, without letting a page narrate its own history.

## Agent Summary {#agent-summary}

- Business intent lives in topic pages under `product/`, beside the brief. (standards/rule/core-product.keep-business-intent-under-product, standards/rule/core-product.state-each-topic-in-one-page-shape)
- Each topic reads as a chapter for people first, with its commitments after. (standards/rule/core-product.place-the-story-before-the-commitments)
- Each topic states numbered product rules that specifications and code cite, and no behavior. (standards/rule/core-product.identify-every-product-rule, standards/rule/core-product.cite-product-rules-from-domain-specifications, standards/rule/core-product.keep-behavior-out-of-product-pages)
- Each choice and refusal links the decision record that set it. (standards/rule/core-product.trace-every-choice-to-a-decision, standards/rule/core-product.record-each-product-choice-as-a-decision)
- A person approves a product decision; an agent drafts one. (standards/rule/core-product.name-the-person-who-approved-a-decision)
- A changed choice is a new decision that replaces the old record. (standards/rule/core-product.replace-a-decision-with-a-new-record)
- The History section is written by a command from the decisions. (standards/rule/core-product.derive-history-from-decisions)
- Generated research is source material until a person approves a decision drawn from it. (standards/rule/core-product.treat-generated-research-as-source-material)
- Each topic carries a review date, and commercial work loads the product pages first. (standards/rule/core-product.review-a-topic-by-its-date, standards/rule/core-product.load-product-intent-before-commercial-work)
- One command reports which product rules a specification cites. (standards/rule/core-product.report-which-product-rules-are-carried)

## Concepts

| Term | Meaning |
|:---|:---|
| Product brief | The one page stating what the product is, for whom, and its boundary. It routes to every topic. |
| Product topic | One page of business intent, such as pricing or one market: a chapter for people, then the commitments. |
| Product rule | One testable commitment on a topic page, identified as `product/<topic>.<rule>`. |
| Product decision | A decision record whose `affects` field names the product pages it sets. |
| Source material | Research, books, and digests produced outside `docs/`, often by agents, which carry no authority. |

The order of authority runs from the decision to the code:

```text
product decision  ->  product topic rule  ->  domain specification  ->  code
(why, dated)          (what we commit to)     (how it behaves)          (what runs)
```

A product decision sets the position. A topic page states it as rules. A domain specification cites the rule it implements. The code is the record of what happens today. When a specification or the code contradicts a product rule, either the code carries a defect or the business changed. A changed business is a new decision, approved by a person, before any page or code moves.

## Standards

### Keep business intent under product (standards/rule/core-product.keep-business-intent-under-product)

**Requirement:** A consumer MUST state its business intent in the product brief and in `product-topic` pages under `docs/product/`, and nowhere else.

**Rationale:** Intent split across a brief, research notes, an archive, and generated books has no single answer to the question an agent asks before building. One home gives every reader one place to look.

### State each topic in one page shape (standards/rule/core-product.state-each-topic-in-one-page-shape)

**Requirement:** A `product-topic` page MUST carry the chapter sections and the commitment sections of the product topic template, and the metadata field `reviewBy`.

**Rationale:** The fixed shape puts the present, the future, and the past of one topic on one page. The chapter sections are Summary, The situation, What we do, Why it is better, A worked example, Costs and risks, and How sure we are. The commitment sections are Rules, Position, Refusals, Open questions, Next, History, and Evidence. A reader learns where each answer sits once and finds it on every topic.

### Place the story before the commitments (standards/rule/core-product.place-the-story-before-the-commitments)

**Requirement:** A `product-topic` page MUST place its chapter for people before its commitments, with each claim in the chapter citing its source.

**Rationale:** A rule list states what was decided and convinces nobody of why. The chapter carries the situation, the voices, the numbers, the comparison, and one worked example, so a person understands the choice before reading its rules. Sources keep the story checkable rather than a pitch.

### Identify every product rule (standards/rule/core-product.identify-every-product-rule)

**Requirement:** Each Rules entry MUST open with one identifier `product/<topic>.<rule>` that names its own page `id` and appears on no other page.

**Rationale:** An identifier lets a specification, a test, or a code element cite a business commitment, and lets a validator resolve the citation. A rule written only as prose cannot be traced to anything that implements it.

### Cite product rules from domain specifications (standards/rule/core-product.cite-product-rules-from-domain-specifications)

**Requirement:** A domain specification that implements a product rule MUST cite the rule identifier.

**Rationale:** The citation runs from behavior to intent, so a product change shows which specifications to revisit.

### Keep behavior out of product pages (standards/rule/core-product.keep-behavior-out-of-product-pages)

**Requirement:** A product page MUST NOT describe states, entry points, failure codes, or handlers.

**Rationale:** A product page that describes behavior becomes a second specification, and it drifts from the first. The domain specification owns behavior and cites the product rule it implements.

### Trace every choice to a decision (standards/rule/core-product.trace-every-choice-to-a-decision)

**Requirement:** Every Position and Refusals entry MUST link an unretired decision record, and an approved one whenever the page is approved.

**Rationale:** A position with no decision behind it is an opinion that nobody approved. The link lets a reader check who chose it, when, and on what evidence.

### Record each product choice as a decision (standards/rule/core-product.record-each-product-choice-as-a-decision)

**Requirement:** A decision that sets product pages MUST name them in `affects` and carry the sections of the product decision template.

**Rationale:** A business choice is argued from options and evidence, and it is reopened by a condition rather than by a date. The template sections are Context, Options considered, Decision, Evidence, Consequences, and What would change it. The override sections of a standards decision do not fit a business choice.

### Name the person who approved a decision (standards/rule/core-product.name-the-person-who-approved-a-decision)

**Requirement:** An `approved` product decision MUST carry `decidedBy` and `decided`, set by the accountable person and never by an agent.

**Rationale:** Product, commercial, and legal choices belong to an accountable person, as `standards/rule/core-system.keep-decision-authority-with-accountable-people` states. The fields make that approval visible and checkable.

### Replace a decision with a new record (standards/rule/core-product.replace-a-decision-with-a-new-record)

**Requirement:** A changed product choice MUST be a new decision naming the old one in `supersedes`, with the old one retired in the same change.

**Rationale:** A decision edited in place loses the reason it once held, and the topic pages that cited it silently change meaning. A replaced record stays readable as the past.

### Derive history from decisions (standards/rule/core-product.derive-history-from-decisions)

**Requirement:** The History section of a `product-topic` page MUST list exactly the decisions whose `affects` names the page, as written by `node standards/tools/product-records.mjs --write`.

**Rationale:** A past typed by hand drifts from the records it claims to summarize. Deriving it keeps the page in the present tense and the past one link away.

### Treat generated research as source material (standards/rule/core-product.treat-generated-research-as-source-material)

**Requirement:** An agent MUST treat research outside `docs/` as source material until a research claim or an approved product decision states it.

**Rationale:** Generated research mixes verified facts, inferences, and recommendations in one voice. A recommendation from an agent that reads as a decision gets built without anyone having made it.

### Review a topic by its date (standards/rule/core-product.review-a-topic-by-its-date)

**Requirement:** The owner MUST reread a `product-topic` page against its decisions and evidence before its `reviewBy` date, then move the date.

**Rationale:** A stale strategy misdirects every plan built on it, and nothing in the code fails when a market or a price moves. A date makes the reread due rather than optional.

### Load product intent before commercial work (standards/rule/core-product.load-product-intent-before-commercial-work)

**Requirement:** An agent MUST read the product brief and the affected product topics before changing behavior that touches price, money, markets, buyers, or terms.

**Rationale:** Commercial behavior that contradicts the business position compiles and passes its tests. Only the product pages say it is wrong.

### Report which product rules are carried (standards/rule/core-product.report-which-product-rules-are-carried)

**Requirement:** A consumer MUST be able to list every product rule with the specifications that cite it, using `node standards/tools/product-records.mjs --coverage`.

**Rationale:** A rule that no specification cites is intent the system does not carry yet. The list separates planned work from forgotten work.

## Conventions

### Group product topics by area (standards/rule/core-product.group-product-topics-by-area)

**Default:** Keep the brief at `docs/product/brief.md`, topic pages in one folder per area, and product decisions at `docs/product/decisions/`.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** An area folder keeps related topics together, and one decision folder keeps one numbering sequence.

**Example:**

```text
docs/product/
  README.md
  brief.md
  capabilities.md
  business/
    model.md
    pricing.md
  markets/
    expansion.md
    netherlands.md
  company/
    legal-and-tax.md
  roadmap/
    milestones.md
    later.md
    refused.md
  decisions/
    0001-sell-the-whole-event-cycle.md
```

### Name product decisions in one numbered sequence (standards/rule/core-product.name-product-decisions-in-one-numbered-sequence)

**Default:** Name each product decision `<four-digit number>-<short-title>.md` and use the file name as its `id`.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** One sequence orders the record by when a choice was proposed, and the title makes a link readable without opening it.

## Reference example

This informative example demonstrates `standards/rule/core-product.trace-every-choice-to-a-decision`, `standards/rule/core-product.identify-every-product-rule`, and `standards/rule/core-product.cite-product-rules-from-domain-specifications`.

A subscription business keeps `docs/product/business/pricing.md` with id `pricing`. Its Rules section states `product/pricing.monthly-plan-fee`, and its Position row for the monthly plan links `0003-monthly-plan`. The billing specification for the invoice use case cites `product/pricing.monthly-plan-fee`. When the price changes, decision `0011-raise-the-monthly-plan` supersedes `0003-monthly-plan`. The pricing row then links the new record, and the History section lists both.

## Verification

| ID | Method | Evidence |
|:---|:---|:---|
| standards/rule/core-product.keep-business-intent-under-product | static | `node standards/tools/validate-consumer.mjs` fails a `product-topic` page outside `docs/product/`. |
| standards/rule/core-product.state-each-topic-in-one-page-shape | static | `node standards/tools/validate-consumer.mjs` fails a `product-topic` page missing a required section or `reviewBy`. |
| standards/rule/core-product.place-the-story-before-the-commitments | static | `node standards/tools/validate-consumer.mjs` fails a topic whose sections are out of order or that adds a section among the commitments. |
| standards/rule/core-product.identify-every-product-rule | static | `node standards/tools/validate-consumer.mjs` fails a Rules entry without an identifier, a foreign topic segment, a duplicate, or an unresolved citation. |
| standards/rule/core-product.cite-product-rules-from-domain-specifications | inspection | Specification review confirms that each use case cites the product rules it implements. |
| standards/rule/core-product.keep-behavior-out-of-product-pages | inspection | Documentation review confirms that no product page names a state, entry point, failure code, or handler. |
| standards/rule/core-product.trace-every-choice-to-a-decision | static | `node standards/tools/validate-consumer.mjs` fails an entry with no decision link, a retired link, or a draft link on an approved page. |
| standards/rule/core-product.record-each-product-choice-as-a-decision | static | `node standards/tools/validate-consumer.mjs` fails a decision whose `affects` names no product page or that misses a required section. |
| standards/rule/core-product.name-the-person-who-approved-a-decision | static | `node standards/tools/validate-consumer.mjs` fails an approved product decision without `decidedBy` or `decided`. |
| standards/rule/core-product.replace-a-decision-with-a-new-record | static | `node standards/tools/validate-consumer.mjs` fails a `supersededBy` on a record that is not retired, and a pair that does not name each other. |
| standards/rule/core-product.derive-history-from-decisions | static | `node standards/tools/product-records.mjs` exits 1 when a History section differs from the decisions that name its page. |
| standards/rule/core-product.treat-generated-research-as-source-material | inspection | Change review confirms each product position cites an approved decision or a research claim, never a generated record. |
| standards/rule/core-product.review-a-topic-by-its-date | static | `node standards/tools/validate-consumer.mjs` fails a `product-topic` page whose `reviewBy` date has passed. |
| standards/rule/core-product.load-product-intent-before-commercial-work | inspection | The change report for commercial behavior lists the product pages read before the change. |
| standards/rule/core-product.report-which-product-rules-are-carried | static | `node standards/tools/product-records.mjs --coverage` lists each product rule with its citing pages. |
| standards/rule/core-product.group-product-topics-by-area | inspection | Documentation review compares `docs/product/` against the example layout or a named local replacement. |
| standards/rule/core-product.name-product-decisions-in-one-numbered-sequence | inspection | Documentation review confirms each product decision file name matches its `id` and carries a four-digit number. |
