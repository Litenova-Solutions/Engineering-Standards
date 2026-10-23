# Project Model

## Intent

A LiteSpec project describes itself with records, written statements of fixed types joined by fixed links. People write or approve the records above the review line, agents fulfill everything below it, and the model builder reads code, screens, tests, and test runs to compute how the two connect. This page states the record types, their identifiers and homes, the common fields, the links, the authority order, the authoring order, the review line, the statuses, and the builder.

## Concepts

### Record Types

Each type answers one question. Small projects keep the rows marked small. Large projects also keep the rows marked large. Optional rows switch on for each project.

| Type | Kept | Question |
|:---|:---|:---|
| `product` | small | What is built, for whom, and what is excluded? |
| `goal` | large | Which measurable outcome does the product serve? |
| `problem` | large | Which pain does someone have today? |
| `feature` | large | What is offered against a problem? |
| `constraint` | optional, answered always | Which outside rules hold? |
| `research` | optional | Which outside facts inform a choice? |
| `decision` | small | Which choice holds, and what changes it? |
| `requirement` | small | What does the product do or guarantee? |
| `journey` | large | Which ordered steps reach one goal? |
| `module` | small | Which business areas exist? |
| `aggregate` | small | Which things stay consistent? |
| `rule` | small | What holds? |
| `use-case` | small | Which use cases does the product offer? |
| `result` | small | How does a use case end? |
| `scenario` | large | Which example proves the result? |
| `event` | small | What happened? |
| `actor` | small | Who or what touches the product? |
| `role` | small | Which permission sets exist? |
| `permission` | small | Which single actions are allowed? |
| `entry-point` | small | How do people reach the product? |
| `external-system` | optional | Which outside system exchanges what? |
| `limit` | optional, required from first production | Which bounds hold in production? |
| `runbook` | optional, required from first production | How is it run or recovered? |
| `deviation` | small | Where does it depart, and until when? |
| `known-gap` | small | What is missing, who owns it, and until when? |
| `term` | small | Which word means what? |

The [product page](product.md) states the product records, the [domain page](domain.md) states the domain records, and the [access page](access.md) states the access records.

The record tree runs from product intent down to the scenario.

![The record tree from product intent to scenario: product branches into constraint, goal, problem, research, decision, and requirement; problem branches into feature; requirement branches into journey, rule, and use case; use case branches into result, and result into scenario, the review line. Across the tree sit module and aggregate, actor, role, and permission, entry point and external system, the glossary, limit and runbook, deviation and known gap, and the computed implemented, verified, reachable, and effective status.](../assets/diagrams/core-model-records.svg)

### Pages and Entries

A page record is a Markdown file whose opening block names a record type. An entry record is an object in the `records` array of that block. Terms are the exception: each term is an entry in the glossary. Each type has one home.

| Type | Stored as | Home |
|:---|:---|:---|
| `product` | page, exactly one | `docs/product/brief.md` |
| `goal` | page | `docs/product/goals/<name>.md` |
| `problem` | page | `docs/product/problems/<name>.md` |
| `feature` | page | `docs/product/features/<name>.md` |
| `constraint` | page | `docs/product/constraints/<name>.md` |
| `research` | page | `docs/research/<name>.md` |
| `decision` | page | `docs/product/decisions/<number>-<name>.md` |
| `requirement` | entry | `docs/product/<area>/<topic>.md` |
| `journey` | page | `docs/product/journeys/<name>.md` |
| `module` | page | `docs/domain/modules/<module>/README.md` |
| `aggregate` | page | `docs/domain/modules/<module>/<aggregate>/README.md` |
| `rule` | entry | On its aggregate page; a cross-aggregate rule on a rule page under `docs/domain/rules/` |
| `use-case` | page | Beside its aggregate: `docs/domain/modules/<module>/<aggregate>/<use-case>.md` |
| `result` | entry | In its use case page |
| `scenario` | entry | In its use case page |
| `event` | entry | On its aggregate page |
| `actor` | page | `docs/domain/actors/<name>.md` |
| `role` | page | `docs/domain/roles/<name>.md` |
| `permission` | entry | `docs/domain/permissions.md` |
| `entry-point` | entry | `docs/domain/entry-points.md` |
| `external-system` | page | `docs/domain/systems/<name>.md` |
| `limit` | entry | `docs/operations/limits.md` |
| `runbook` | page | `docs/runbooks/<name>.md` |
| `deviation` | page | `docs/deviations/<name>.md` |
| `known-gap` | page | `docs/known-gaps/<name>.md` |
| `term` | entry in the glossary | `docs/glossary.json` |

### Identifiers

An identifier names its record type first, then the record name, with the owning home in between when the type has one. The name carries one to six lowercase hyphenated words, chosen by a person; a decision counts its number as a word.

| Type | Form | Example |
|:---|:---|:---|
| `product` | `product/<name>` | `product/expenses` |
| `goal` | `goal/<name>` | `goal/faster-reimbursement` |
| `problem` | `problem/<name>` | `problem/expenses-wait-weeks` |
| `feature` | `feature/<name>` | `feature/approval-reminders` |
| `constraint` | `constraint/<name>` | `constraint/tax-receipt-retention` |
| `research` | `research/<name>` | `research/approval-time-benchmarks` |
| `decision` | `decision/<number>-<name>` | `decision/0001-receipt-threshold` |
| `requirement` | `requirement/<topic>.<name>` | `requirement/approval.receipt-over-threshold` |
| `journey` | `journey/<name>` | `journey/submit-and-reimburse` |
| `module` | `module/<name>` | `module/spending` |
| `aggregate` | `aggregate/<module>.<name>` | `aggregate/spending.expense` |
| `rule` | `rule/<home>.<name>` | `rule/expense.approver-is-not-submitter` |
| `use-case` | `use-case/<module>.<name>` | `use-case/spending.submit-expense` |
| `result` | `result/<use-case-name>.<name>` | `result/submit-expense.receipt-missing` |
| `scenario` | `scenario/<use-case-name>.<name>` | `scenario/submit-expense.submitting-with-a-receipt-succeeds` |
| `event` | `event/<aggregate-name>.<past-tense>` | `event/expense.expense-submitted` |
| `actor` | `actor/<name>` | `actor/employee` |
| `role` | `role/<name>` | `role/approver` |
| `permission` | `permission/<name>` | `permission/approve-expense` |
| `entry-point` | `entry-point/<name>` | `entry-point/claimwick-app` |
| `external-system` | `external-system/<name>` | `external-system/payout-bank` |
| `limit` | `limit/<name>` | `limit/open-expenses-per-employee` |
| `runbook` | `runbook/<name>` | `runbook/clear-stuck-reimbursements` |
| `deviation` | `deviation/<name>` | `deviation/export-review-bypass` |
| `known-gap` | `known-gap/<name>` | `known-gap/export-expenses-unimplemented` |
| `term` | `term/<name>` | `term/expense` |

A rule home is an aggregate name or a module name. A use case name is unique across the project, so a result cites only that name. An aggregate name is unique across the project, so a rule cites only that name. A rule name keeps the negation its statement makes. Every identifier citation resolves to a written record.

### Common Fields

Every written record carries the shared fields in this table. Entries inherit `owner` and `status` from their page unless they set their own.

| Field | Written | Meaning |
|:---|:---|:---|
| `type` | always | The record type in kebab case |
| `id` | always | The identifier |
| `title` | always | The display title, free to change |
| `owner` | pages; entries inherit | One name from the closed owner list |
| `status` | pages; entries inherit | Draft, approved, or retired |
| `decider` | on drafts | The owner deciding by the date |
| `decideBy` | on drafts | The decision date in ISO form |
| `replaces` | decision, when replacing | The decision this decision replaces |
| `terms` | when used | The term identifiers the record uses |
| `questions` | when open | Open questions, each with `question`, `decider`, and `decideBy`; an open question blocks approval |

### Links

Each written link lives as a field on the record it starts from: a decision carries `decides`, a rule carries `fulfills`, and so on. The table names every written link field, the record that carries it, and what it points at.

| Field | Written on | Points at |
|:---|:---|:---|
| `decides` | decision | Requirements, features, rules, constraints, and the permissions, roles, actors, deviations, entry points, limits, or decisions an engineering choice settles |
| `basedOn` | decision, requirement, rule | Constraints, research |
| `replaces` | decision | The replaced decision |
| `audience` | product | Actors |
| `affects` | problem | Actors |
| `solves` | feature | Problems |
| `serves` | feature | Goals |
| `feature` | requirement | The planned, later, or refused feature that carries it |
| `fulfills` | rule, use case, journey | Requirements |
| `governs` | rule | Aggregates, use cases |
| `refusal` | rule | The refusal result carrying its code |
| `raises` | use case | Events |
| `needs` | use case | Permissions |
| `reachedThrough` | use case | Entry points |
| `holds` | actor | Roles at a scope |
| `allows` | role | Permissions |
| `steps` | journey | Ordered use cases with actors |
| `actor` | journey, external system | The actor walking the journey; the actor the system acts as |
| `dependsOn` | module | Modules |
| `runbook` | limit | The runbook answering the bound |
| `provision` | deviation | The LiteSpec provision it departs from |
| `subject` | known gap | The records the gap covers |
| `terms` | any record | Terms |

Containment needs no link field: it follows the identifier. An aggregate belongs to the module its identifier names, and a result or a scenario belongs to the use case its identifier names. The builder computes the remaining links from code, routes, and tests: `implements` from code to a use case, rule, or event; `calls` from a screen to a use case; and `proves` from a test to a scenario.

### Authority

Intent flows down one order: constraint, product, requirement, rule, use case, result, and scenario. When two records disagree, the higher one wins. Inside one record, a must beats a should. Between peers, the later approved decision wins, and its `replaces` link shows what it overturned. Every other link is trace: it explains why a record exists and never decides a conflict.

A decision explains a choice and is replaced, never edited. Research, examples, and prose carry no authority, so they never override an approved record. A deviation outranks the LiteSpec provision it names for the project that records it, until its review date.

Truth about today comes from code, screens, and test runs. When intent and truth mismatch, the owner of the higher record owns the defect: a failing test does not settle what the product should do.

A record stays unapproved while a decision behind it stays draft. An accepted gap becomes a known gap, and its check reports without failing until the end date. Module order states dependencies and grants no authority.

### Authoring Order

Records are authored top-down, one slice at a time:

1. Product intent: brief, goals, problems, features, constraints, decisions, requirements.
2. Then the domain: modules, aggregates with states, transitions and data, rules, use cases, results, scenarios.
3. Actors, roles, permissions and the glossary grow beside both.
4. One slice at a time: one feature from problem to scenario, then the next.
5. A question found while modeling goes up as a draft decision or requirement with a decider and a date; the domain record stays draft until it is answered, or is covered by the release stage extension before first production.

### The Review Line

The end goal is a specification so clear and structured that a person who is not a developer can review it, and that review is enough. People write or approve every record down to the scenario; agents fulfill everything below that line, and tools check it. Scenarios are the leaf: the last records a person reads, and the first a test proves.

| Above the line: people write or approve | Below the line: agents fulfill, tools check |
|:--|:--|
| Product, goals, problems, features | Code in every layer |
| Constraints, research, decisions | Tests and their tags |
| Requirements and journeys | Identifiers, codes and field shapes |
| Rules, stated as sentences | How each rule is enforced |
| Aggregates as states, transitions and classified data | Classes, records, repositories, persistence |
| Use cases with their results, and scenarios in Given, When, Then | Handlers, endpoints, generated clients |
| Actors, roles, permissions, external systems | Authorization code and policies |
| Deviations and known gaps | Applying every stack provision |

Review of the specification is enough only when all six conditions hold: the specification is complete, so no behavior exists in code that no record names; it is proven, so every scenario has a passing test through the public boundary; it is determined below the line, so stack pages leave no implementation choice that a person must review; it is readable, so people review a rendered specification and never raw record data; it is reviewable as change, so a change shows what intent it adds, changes or removes; and it is measured, so every quality requirement carries a measure that a check confirms.

### Statuses

Draft means the record awaits its decider, approved means it holds, and retired means a replacement holds. A draft names its `decider` and its `decideBy` date. A decision is replaced, never edited: the retired decision stands beside its replacement so the reasoning stays readable.

Implemented, verified, and reachable are computed, never handwritten. The builder derives them from code, screens, tests, and test runs on every run:

| State | Of | When |
|:--|:--|:--|
| implemented | use case, rule, event, aggregate state | the stack builder finds code for it |
| verified | use case | every scenario has a passing test through the public boundary |
| verified | requirement | everything fulfilling it is verified, and a measured requirement's measure has a passing check |
| reachable | aggregate state | a transition leads into it |

The builder also writes each record's effective status: draft when the record, a decision deciding it, or a requirement it fulfills is a draft. A result or a scenario takes its use case's effective status.

The written statuses run from draft to retired, and the builder computes the rest.

![Record statuses draft, approved, and retired in order; the builder computes implemented when code exists, verified when every scenario is proven, reachable when a transition leads into the state, and effective status, draft while anything behind the record is draft.](../assets/diagrams/core-record-status.svg)

### Size and Stacks

Small projects keep the small rows from the record table, while large projects also keep the large rows. Optional types switch on for each project; limits and runbooks join at first production.

Each frontend declares one stack, and the backend declares its own. Every project answers whether constraints apply, possibly with none. Owners form a closed list, and extensions name their replacements and switched-on types. The [scope page](scope.md) states how a project selects its size, shape, and stacks.

### The Model Builder

The model builder reads records, code, routes, tests, and test runs into one model. It writes the model file, runs the model checks, and renders generated regions. The [model command page](../tools/model.md) lists the subcommands and finding codes.

Generated regions sit inside fences that only the builder writes and prose checks skip. Each project runs the builder in its own gate, so handwritten prose and computed views stay in one page without mixing.

The checks that guard the model include the shape, reference, draft gate, and coverage checks the command page lists, and these model checks: `behavior-unrecorded`, for a handler, endpoint, reaction or domain event in code that no record names; `state-unreachable` and `transition-unresolved`, for a state no transition reaches and a transition naming a missing state or use case; `personal-data-uncovered`, for a personal or sensitive field no erasure and export use case covers; `calculation-without-table`, for a calculation rule with no scenario examples table; `reaction-without-trigger`, for a reaction with no trigger; and `requirement-unmeasured`, for a measured requirement with no check of its measure.

A finding that an open known gap covers is reported as known and exits zero. The gap covers the finding when its `check` equals the finding code and its `subject` lists the finding identifier. An expired known gap fails the check.

`litespec model diff <base>` prints the records a change adds, changes and removes, in the book's words, for review.

## Standards

### Write Every Record in Its Home

**Statement:** A project MUST keep every record in the home its type names.

**Rationale:** One home per type tells a reader where to open a record and tells the builder where to read it. A record kept anywhere else is invisible to the checks that scan its home, so it looks sound while nothing validates it.

**Example:** A decision lives at `docs/product/decisions/0001-receipt-threshold.md`.

### State the Common Fields on Every Record

**Statement:** Every written record MUST carry its type, identifier, title, owner, and status.

**Rationale:** Type, identifier, title, owner, and status are the fields every join needs. Without them on every record, the builder cannot connect decisions to requirements, scenarios to results, or records to owners, and the model falls apart into loose pages.

### Hold Approval Behind Open Questions

**Statement:** A record MUST NOT stand approved while it carries an open question.

**Rationale:** An open question names a fact the record still needs, with the decider and the date that will settle it. Approving the record first would claim settled intent while the missing fact can still move it. Answering the question or retiring the record clears the gate.

### Write Links on the Record That Points

**Statement:** A link MUST live as fields on the record it starts from.

**Rationale:** One writing site keeps a link and its source in one edit: changing the source updates the link in the same change. Links written on the target instead would scatter each relationship across every page it touches.

### Follow the Authority Order

**Statement:** A conflict MUST resolve toward the higher authority.

**Rationale:** Intent records disagree in real projects: a use case asks for behavior its rule forbids. The order settles the conflict without a meeting, with constraint over product, product over requirement, requirement over rule, rule over use case, use case over result, and result over scenario. Decisions explain choices and research informs them, but neither outranks the ladder, so prose never silently overrides an approved record.

### Resolve Ties by the Later Decision

**Statement:** A tie MUST resolve toward the later approved decision.

**Rationale:** Two records at one level can disagree with no higher record to settle them. The later approved decision wins because it decided with knowledge of the earlier one. When no later decision separates them, their shared owner decides, so every tie still has exactly one judge.

### Hold Approval Behind Draft Decisions

**Statement:** A record MUST NOT stand approved behind a draft decision.

**Rationale:** Approval means the reasoning behind the record already holds. A record approved behind a draft decision claims settled intent while its foundation can still move. The builder also writes each record's `effectiveStatus`: draft when the record, a decision deciding it, or a requirement it fulfills is a draft. A result or a scenario takes its use case's effective status.

### Record Accepted Gaps as Known Gaps

**Statement:** An accepted gap MUST live as a known gap with owner and end date.

**Rationale:** Missing work with no owner and no date is invisible: nobody answers for it and nothing reports it. A known gap with an owner and an end date turns the same missing work into a visible promise that the checks report until the date and fail after it.

**Example:** The running Claimwick example accepts that exporting expenses has no handler yet, so the gap lives as a known gap with an owner and an end date in `docs/known-gaps/export-expenses-unimplemented.md`.

```json
{
  "type": "known-gap",
  "id": "known-gap/export-expenses-unimplemented",
  "title": "Export expenses unimplemented",
  "owner": "claimwick-team",
  "status": "approved",
  "check": "use-case-unimplemented",
  "subject": ["use-case/spending.export-expenses"],
  "endsBy": "2027-06-01",
  "reason": "Export waits for the finance file format."
}
```

The `use-case-unimplemented` check reports without failing until 2027-06-01, and the expenses team answers for closing the gap, which satisfies this provision.

### Apply Guidance Precedence

**Statement:** A conflict MUST resolve toward the project deviation, the extension, the deeper page, or the shallower page, in that order.

**Rationale:** A project requirement can never quietly override a shared standard; without this order it would, one page at a time. The conflict becomes a deviation record instead: dated, reasoned, and reviewable. The order puts the project deviation first, then the extension, then the deeper page, then the shallower page, so the most local approved decision wins.

**Example:** The running Claimwick example runs its weekend export with no reviewer on shift, so it records a project deviation that outranks the shared standard in `docs/deviations/export-review-bypass.md`.

```json
{
  "type": "deviation",
  "id": "deviation/export-review-bypass",
  "title": "Export Review Bypass",
  "owner": "claimwick-team",
  "status": "approved",
  "provision": "litespec/backend/application#enforce-target-authorization-in-the-pipeline",
  "reason": "The weekend export runs with no reviewer on shift.",
  "reviewBy": "2027-01-01",
  "removeWhen": "A reviewer covers weekends."
}
```

The record names the provision it departs from, the reason, and the review date, so the departure stays visible and dated, which satisfies this provision.

### Keep One Owner and Status on Every Record

**Statement:** Every page MUST name one owner and one status.

**Rationale:** One owner means one person answers for the page. One status means the page either awaits decision, holds, or stands replaced. Entries inherit both from their page, so a page of entries stays consistent without repeating the fields on every object. The owner is the readable name the project owners list holds, and the project file maps that name to its CODEOWNERS handles.

**Example:** A draft names its `decider` and `decideBy` date. The three statuses and what each allows: a draft awaits its decider, approved holds, and retired means a replacement holds.

### Retire Records with Replaces

**Statement:** A replacing decision MUST name the decision it replaces, and no other record type carries `replaces`.

**Rationale:** Only decisions keep the past: the retired decision stands beside its replacement so the reasoning stays readable. Every other record changes in place, because retired copies of rules or use cases would fork the intent readers must follow. A rename rewrites every citation in the same change, so no dangling reference survives.

### Name What Every Decision Decides

**Statement:** Every decision that is not retired MUST name at least one record it settles in `decides`.

**Rationale:** The draft gate and the computed effective status both follow `decides`. A decision that names nothing holds back nothing, so its approval state constrains no record and its draft gate checks nothing. Naming at least one settled record gives the decision something to govern.

### Resolve Every Page Link

**Statement:** Every Markdown link outside code on a page under the record roots MUST point at an existing file, by its relative path.

**Rationale:** A link that points at a moved file or a bare identifier reads as navigation and leads nowhere. Requiring every link to name an existing file by its relative path keeps the documentation clickable at every commit. Identifiers are cited in backticks instead, so the two never confuse.

### Declare Size Stacks and Optional Types

**Statement:** A project MUST declare its size, stacks, and optional types.

**Rationale:** Size decides which record types and test projects the checks require, while stacks decide which technology pages and checks apply. Without the declaration, the builder cannot tell a missing record from one the project never needed. Optional types switch on per project, so the declaration also names which ones this project carries.

**Example:** The running Claimwick example declares large with a server shape and two stacks.

### Give Every Use Case Its Results

**Statement:** A use case MUST end in a success result and name its refusals.

**Rationale:** Callers branch on named endings: success or a specific refusal with its code. A use case with no named success leaves callers guessing what good looks like, and scenarios prove one ending each, so unnamed endings stay unproven.

**Example:** A submit use case names `submitted` and `receipt-missing`.

The running Claimwick example carries this in `use-case/spending.submit-expense`, which names `result/submit-expense.submitted` and `result/submit-expense.receipt-missing` with `scenario/submit-expense.submitting-with-a-receipt-succeeds`:

```json
"records": [
  {
    "type": "result",
    "id": "result/submit-expense.submitted",
    "title": "Submitted",
    "owner": "claimwick-team",
    "outcome": "success",
    "meaning": "The expense is submitted."
  },
  {
    "type": "result",
    "id": "result/submit-expense.receipt-missing",
    "title": "Receipt missing",
    "owner": "claimwick-team",
    "outcome": "refusal",
    "code": "spending.receipt-missing",
    "meaning": "The expense is above the receipt threshold and carries no receipt."
  },
  {
    "type": "scenario",
    "id": "scenario/submit-expense.submitting-with-a-receipt-succeeds",
    "title": "Submitting with a receipt succeeds",
    "owner": "claimwick-team",
    "status": "approved",
    "given": "An employee paid for a train ticket and kept the receipt.",
    "when": "The employee submits the expense with the receipt.",
    "then": "The expense is submitted.",
    "result": "result/submit-expense.submitted"
  }
]
```

Success names the submitted ending, the refusal carries the code `spending.receipt-missing`, and the scenario pairs one given and when with the success result, which satisfies this provision.

### Cover Every Public Use Case from a Journey

**Statement:** A public use case MUST sit in a journey or name its background caller.

**Rationale:** A public use case that no journey reaches and no background caller names is either unreachable or wired up by accident. Reachability shows readers how each use case is found and gives every public use case a path from a user goal or a named caller.

### Author One Slice at a Time

**Statement:** Authoring MUST complete one feature from problem to scenario before starting the next.

**Rationale:** A feature worked from problem to scenario stays reviewable at every level: each record lands with the intent above it already written. Parallel slices leave domain records resting on intent nobody wrote yet, and reviewers cannot tell a settled choice from a guess.

### Raise Modeling Questions as Draft Intent

**Statement:** A question found while modeling MUST become a draft decision or requirement with a decider and a date.

**Rationale:** A domain record written around an open question bakes the guess into states, rules, and scenarios. Sending the question up as a draft decision or requirement keeps it owned and dated, while the domain record stays draft until the answer lands.

### Approve Intent Above the Review Line

**Statement:** Every record above the review line MUST carry approval by a person.

**Rationale:** Review of the specification is enough only when a person stands behind every record the review covers, down to the scenario. Below the line, agents fulfill the records and tools check them, so no per-screen or per-handler approval is needed. The six conditions in the review line section state when that review suffices.

### Read Truth from Code Screens and Test Runs

**Statement:** Implemented, verified, and reachable MUST come from the builder, never from handwriting.

**Rationale:** Handwritten status drifts: a record marked implemented stays marked after its handler is deleted. Computed status cannot drift, because the builder re-derives it from handlers, routes, scenarios, and test runs on every run. A use case reads implemented when a handler, reaction, job, or endpoint carries it out, verified when every scenario passes its proof, and a requirement reads verified when everything fulfilling it is verified.

**Example:** A use case reads implemented when its handler exists.

## Conventions

### Render Generated Regions from the Model

**Default:** Generated regions on a page come from the model builder.

**Replacement:** A project with no builder run records its own generation step.

**Rationale:** Fenced regions keep handwritten prose and computed views in one page without mixing them: authors edit outside the fences and the builder writes inside. A project with no builder run records its own generation step, so the regions still have exactly one writer.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/core/model#write-every-record-in-its-home | checkable | `litespec model check` reports `record-shape` for a record outside its home. |
| litespec/core/model#state-the-common-fields-on-every-record | checkable | `litespec model check` reports `record-shape` for a record missing a common field. |
| litespec/core/model#hold-approval-behind-open-questions | checkable | `litespec model check` reports `record-shape` for an approved record carrying an open question. |
| litespec/core/model#write-links-on-the-record-that-points | checkable | `litespec model check` reports `reference-unresolved` for a link whose target no record carries. |
| litespec/core/model#follow-the-authority-order | guidance | Conflict decisions under `docs/product/decisions/` name the higher record that won, in the order this page states. |
| litespec/core/model#resolve-ties-by-the-later-decision | guidance | Each tie-breaking decision carries a later approval date than the peer records it settles. |
| litespec/core/model#hold-approval-behind-draft-decisions | checkable | `litespec model check` reports `draft-gate` for an approved record behind a draft decision. |
| litespec/core/model#record-accepted-gaps-as-known-gaps | checkable | `litespec model check` reports `record-shape` and `known-gap-expired` for a gap missing its owner, date, or renewal. |
| litespec/core/model#apply-guidance-precedence | guidance | Every departure from a shared provision resolves to a deviation record under `docs/deviations/` with reason and review date. |
| litespec/core/model#keep-one-owner-and-status-on-every-record | checkable | `litespec model check` reports `owner-unknown` and `draft-without-decider` for a page missing its owner or draft decider. |
| litespec/core/model#retire-records-with-replaces | checkable | `litespec model check` reports `invalid-field` for `replaces` outside a decision and `reference-unresolved` for an unknown target. |
| litespec/core/model#name-what-every-decision-decides | checkable | `litespec model check` reports `decision-decides-nothing` for a decision with an empty `decides` field. |
| litespec/core/model#resolve-every-page-link | checkable | `litespec model check` reports `link-unresolved` for a page link naming no file. |
| litespec/core/model#declare-size-stacks-and-optional-types | checkable | `litespec model check` reports `size-type-missing` and `record-shape` for a project missing its declaration or a required type. |
| litespec/core/model#give-every-use-case-its-results | checkable | `litespec model check` reports `use-case-without-success` and `case-result-unresolved` for a use case missing its success or naming no result. |
| litespec/core/model#cover-every-public-use-case-from-a-journey | checkable | `litespec model check` reports `journey-reach` for a public use case in no journey with no background caller. |
| litespec/core/model#author-one-slice-at-a-time | guidance | Approved domain records show approved intent above them through their `fulfills` and `decides` links. |
| litespec/core/model#raise-modeling-questions-as-draft-intent | guidance | Open modeling questions appear as draft decisions or requirements carrying a decider and a date. |
| litespec/core/model#approve-intent-above-the-review-line | guidance | Record statuses show approval by a person on every record down to the scenario. |
| litespec/core/model#read-truth-from-code-screens-and-test-runs | checkable | `litespec model check` reports `use-case-unimplemented`, `proves-unconfirmed`, and `refusal-not-thrown` for a use case whose handler, proof, or refusal code is missing. |
| litespec/core/model#render-generated-regions-from-the-model | guidance | Are generated regions current with the model, or is a replacement generation step recorded? |
