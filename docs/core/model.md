# Project Model

## Intent

A LiteSpec project describes itself with records, written statements of fixed types joined by fixed links. This page states the four layers, the record types with their identifiers and homes, the common fields, the links, the authority order, the authoring order, the statuses, the approval data, the risk tiers, the questions, the transcription mode, the model builder, the check tiers, and the book and the diffs. People write and approve Intent, agents write Behavior from it, and the model builder computes how code and tests connect to the records.

## Concepts

### The Four Layers

Each layer answers one question, is written from the layer above it, and owns its records. Nothing above Implementation is computed from code.

| Layer | Question | Writes | Reviews | Records |
|:--|:--|:--|:--|:--|
| Intent | Why build it, and what do we promise? | agents draft, the founder decides | the founder and product people | product, goal, problem, feature, requirement, constraint, decision, research, journey, actor, term (`layer: intent`) |
| Behavior | How does the system behave to keep the promises? | agents | developers; the security reviewer for access, outside calls and personal-data flows | module, aggregate, rule, event, integration-event, use-case, result, scenario, reaction, job, notification, setting, role, permission, entry-point, external-system, runbook, term (`layer: behavior`) |
| Implementation | How is it built? | agents | S-tier checks; developers sample | code only |
| Proof | How do we know it holds? | the builder | G-tier and S-tier checks | tests, check results, computed statuses, the rendered book |

Governance records attach to any layer: `deviation` and `known-gap`.

Three translation rules join the layers. Specify moves Intent to Behavior: it adds states, invariants, refusals, consistency, data classes with their erasure positions, freshness, and access with tenant scope, and it leaves open any price, fee, rate, term, market, payer, retention period for personal data, observable freshness, or default or figure that differs by tenant, market, or date, each as a draft question. Implement moves Behavior to Implementation: it adds the code shapes the stack pages fix, and adds no observable outcome no result declares, no edge no record declares, no write outside `changes`, and no access wider than the grant. Verify moves Implementation to Proof: one test proves each scenario through the public boundary, and a proof goes stale when its scenario semantic hash changes.

### Record Types and Page Styles

Each type answers one question.

| Type | Layer | Question |
|:--|:--|:--|
| `product` | intent | What is built, for whom, and what is excluded? |
| `goal` | intent | Which measurable outcome does the product serve? |
| `problem` | intent | Which pain does someone have today? |
| `feature` | intent | What is offered against a problem? |
| `constraint` | intent | Which outside rules hold? |
| `research` | intent | Which outside facts inform a choice? |
| `decision` | intent | Which choice holds, and what changes it? |
| `requirement` | intent | What does the product do or guarantee? |
| `journey` | intent | Which ordered steps reach one goal? |
| `actor` | intent | Who or what touches the product? |
| `module` | behavior | Which business areas exist? |
| `aggregate` | behavior | Which things stay consistent? |
| `rule` | behavior | What holds? |
| `use-case` | behavior | Which use cases does the product offer? |
| `result` | behavior | How does a use case end? |
| `scenario` | behavior | Which example proves the result? |
| `event` | behavior | What happened? |
| `integration-event` | behavior | Which facts cross the boundary? |
| `reaction` | behavior | When something happens, what follows? |
| `job` | behavior | Which work runs on a schedule or by hand? |
| `notification` | behavior | Which person-facing messages go out? |
| `setting` | behavior | Which adjustable values hold, and who sets them? |
| `role` | behavior | Which permission sets exist? |
| `permission` | behavior | Which single actions are allowed? |
| `entry-point` | behavior | How do people reach the product? |
| `external-system` | behavior | Which outside system exchanges what? |
| `runbook` | behavior | How is it run or recovered? |
| `deviation` | any | Where does it depart, and until when? |
| `known-gap` | any | What is missing, who owns it, and until when? |
| `term` | intent, behavior | Which word means what? |

The [intent page](intent.md) states the Intent records, the [behavior page](behavior.md) states the Behavior records, and the [access page](access.md) states the access records.

Each record page uses the page style the [Authoring Standard](authoring.md) names for its type. A setting-set page holds many settings, and the retention-schedule page holds the retention rows at `docs/behavior/retention-schedule.md`. The retention schedule is a page style, not a record type.

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
| `actor` | page | `docs/product/actors/<name>.md` |
| `module` | page | `docs/behavior/modules/<module>/README.md` |
| `aggregate` | page | `docs/behavior/modules/<module>/<aggregate>/README.md` |
| `rule` | entry | On its aggregate page; a cross-aggregate rule on a rule page under `docs/behavior/rules/` |
| `use-case` | page | Beside its aggregate: `docs/behavior/modules/<module>/<aggregate>/<use-case>.md`; a query describing no one aggregate under `reads/` beside its module |
| `result` | entry | In its use case page |
| `scenario` | entry | In its use case page, or in its reaction page |
| `event` | entry | On its aggregate page |
| `integration-event` | entry | In the published set: `docs/behavior/integration-events.md` |
| `reaction` | page | `docs/behavior/modules/<module>/reactions/<reaction>.md` |
| `job` | page | `docs/behavior/modules/<module>/jobs/<job>.md` |
| `notification` | page | `docs/behavior/modules/<module>/notifications/<name>.md` |
| `setting` | entry | On its module page, or on a setting-set page under `docs/behavior/modules/<module>/` |
| `role` | page | `docs/behavior/roles/<name>.md` |
| `permission` | entry | `docs/behavior/permissions.md` |
| `entry-point` | entry | `docs/behavior/entry-points.md` |
| `external-system` | page | `docs/behavior/systems/<name>.md` |
| `runbook` | page | `docs/runbooks/<name>.md` |
| `deviation` | page | `docs/deviations/<name>.md` |
| `known-gap` | page | `docs/known-gaps/<name>.md` |
| `term` | entry in the glossary | `docs/glossary.json` |

### Identifiers

An identifier names its record type first, then the record name, with the owning home in between when the type has one. The name carries one to six lowercase hyphenated words, chosen by a person; a decision counts its number as a word.

| Type | Form | Example |
|:---|:---|:---|
| `product` | `product/<name>` | `product/claimwick` |
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
| `event` | `event/<aggregate-name>.<past-tense>` | `event/expense.submitted` |
| `integration-event` | `integration-event/<name>` | `integration-event/expense-submitted` |
| `reaction` | `reaction/<module>.<name>` | `reaction/spending.remind-approver` |
| `job` | `job/<module>.<name>` | `job/spending.clear-stuck-reimbursements` |
| `notification` | `notification/<module>.<name>` | `notification/spending.approval-reminder` |
| `setting` | `setting/<module>.<name>` | `setting/spending.max-open-expenses` |
| `actor` | `actor/<name>` | `actor/employee` |
| `role` | `role/<name>` | `role/approver` |
| `permission` | `permission/<name>` | `permission/approve-expense` |
| `entry-point` | `entry-point/<name>` | `entry-point/claimwick-app` |
| `external-system` | `external-system/<name>` | `external-system/payout-bank` |
| `runbook` | `runbook/<name>` | `runbook/clear-stuck-reimbursements` |
| `deviation` | `deviation/<name>` | `deviation/export-review-bypass` |
| `known-gap` | `known-gap/<name>` | `known-gap/export-expenses-unimplemented` |
| `term` | `term/<name>` | `term/expense` |

A rule home is an aggregate name or a module name. A use case name is unique across the project, so a result cites only that name. An aggregate name is unique across the project, so a rule cites only that name. A reaction, job, notification, or setting is filed with its module, and an integration event belongs to the published set. A rule name keeps the negation its statement makes. Every identifier citation resolves to a written record.

A journey step id is `journey/<name>#<step-id>`, with step ids `s1`, `s2`, and so on. A derived generic result is `result/<module>.<use-case>.forbidden` or `result/<module>.<use-case>.invalid-input`. Scenarios can point at derived results. Derived results are never written as records.

### Common Fields

Every written record carries the shared fields in this table. Entries inherit `owner` and `status` from their page unless they set their own.

| Field | Written | Meaning |
|:---|:---|:---|
| `type` | always | The record type in kebab case |
| `id` | always | The identifier |
| `title` | always | The display title, free to change |
| `owner` | pages; entries inherit | One name from the closed owner list |
| `status` | pages; entries inherit | Draft, approved or reviewed, or retired, in the layer vocabulary |
| `decider` | on drafts | The owner deciding by the date |
| `decideBy` | on drafts | The decision date in ISO form |
| `replaces` | decision, when replacing | The decision this decision replaces |
| `terms` | when used | The term identifiers the record uses |
| `questions` | when open | Open questions, each with `question`, `decider`, `decideBy`, `recommended`, `ballot`, and `tier`; an open question blocks approval |
| `approvedBy` | on approved and reviewed | The approver: a person owner name, or `auto (veto window)` |
| `approvedOn` | on approved and reviewed | The approval date in ISO form |
| `approvedHash` | on approved and reviewed | The builder hash over the semantic fields |
| `risk` | on requirements and Behavior records, when present | Any of `money`, `door`, `personal-data`, `access` |
| `source` | during adoption, when transcribed | `transcribed` for a Behavior record written from code |

### Links

Each written link lives as a field on the record it starts from: a decision carries `decides`, a rule carries `fulfills`, and so on. The table names every written link field, the record that carries it, and what it points at.

| Field | Written on | Points at |
|:---|:---|:---|
| `decides` | decision | Requirements, features, rules, constraints, and the permissions, roles, actors, deviations, entry points, settings, or decisions an engineering choice settles |
| `basedOn` | decision, requirement, rule | Constraints, research |
| `replaces` | decision | The replaced decision |
| `audience` | product | Actors |
| `affects` | problem | Actors |
| `solves` | feature | Problems |
| `serves` | feature | Goals |
| `serves` | use case, reaction, job | Journey steps or goals |
| `feature` | requirement | The planned, later, or refused feature that carries it |
| `fulfills` | rule, use case, reaction, job, notification, setting, journey | Requirements |
| `governs` | rule | Aggregates, use cases |
| `refusal` | rule | The refusal result carrying its code |
| `raises` | use case | Events |
| `access.grant` | use case | A permission, a self scope, anonymous, or system |
| `reachedThrough` | use case | Entry points |
| `changes` | use case | Aggregates |
| `reads` | use case, reaction, job | Aggregates |
| `effects` | use case, reaction | Use cases, notifications, integration events, external system operations |
| `on` | reaction | Domain events or integration events |
| `issues` | reaction, job | Use cases |
| `sends` | reaction | Notifications |
| `holds` | actor | Roles at a scope |
| `allows` | role | Permissions |
| `actor` | journey, external system | The actor walking the journey; the actor the system acts as |
| `translates` | integration event | Domain events |
| `dependsOn` | module | Modules |
| `runbook` | job | The runbook answering the job |
| `provision` | deviation | The LiteSpec provision it departs from |
| `subject` | known gap | The records the gap covers |
| `terms` | any record | Terms |

Behavior records point up: `serves` points to a goal or a journey step, and `fulfills` points to a requirement. Records never point down: a journey names no use case, and a requirement names no rule.

Containment needs no link field: it follows the identifier. An aggregate belongs to the module its identifier names, a reaction, job, notification, or setting belongs to the module its identifier names, and a result or a scenario belongs to the use case its identifier names. An integration event belongs to the published set. The builder computes the remaining links from code, routes, and tests: `implements` from code to a use case, rule, or event; `calls` from a screen to a use case; and `proves` from a test to a scenario. Code and tests point up to the record they serve, through their folder or one anchor tag.

### Authority

Intent outranks Behavior. When two records disagree, the higher one wins: constraint over product, product over requirement, requirement over rule, rule over use case, use case over result, and result over scenario. Inside one record, a must beats a should. Between peers, the later approved decision wins, and its `replaces` link shows what it overturned. Every other link is trace: it explains why a record exists and never decides a conflict.

A decision explains a choice and is replaced, never edited. Research, examples, and prose carry no authority, so they never override an approved record. A deviation outranks the LiteSpec provision it names for the project that records it, until its review date.

When code and the specification disagree, the specification wins where Intent has spoken. Where Intent is silent, working code is evidence for a question, never a defect to delete and never a source to transcribe silently.

A record stays unapproved while a decision behind it stays draft. An accepted gap becomes a known gap, and its check reports without failing until the end date. Module order states dependencies and grants no authority.

### Authoring Order

Records are authored top-down, one slice at a time:

1. Product intent: brief, goals, problems, features, constraints, decisions, requirements.
2. Then Behavior: modules, aggregates with states, transitions and data, rules, use cases, results, scenarios, reactions, jobs, notifications, settings.
3. Actors, roles, permissions and the glossary grow beside both.
4. One slice at a time: one feature from problem to scenario, then the next.
5. A question found while modeling goes up as a draft question with a decider and a date; the Behavior record stays draft until it is answered.

### Statuses

Intent and governance records use draft, approved, and retired. Behavior records use draft, reviewed, and retired. Draft means the record awaits its decider, approved or reviewed means it holds, and retired means a replacement holds. A draft names its `decider` and its `decideBy` date. A decision is replaced, never edited: the retired decision stands beside its replacement so the reasoning stays readable.

Implemented, verified, stale, and reachable are computed, never handwritten. The builder derives them from code, screens, tests, and test runs on every run:

| State | Of | When |
|:--|:--|:--|
| implemented | use case, rule, event, aggregate state | the stack builder finds code for it |
| verified | use case | every scenario has a passing test through the public boundary |
| verified | requirement | everything fulfilling it is verified, and a measured requirement measure has a passing check |
| stale | scenario proof | the scenario semantic hash changed after its test last passed |
| reachable | aggregate state | a transition leads into it |

The builder also writes each record effective status: draft when the record, a decision deciding it, or a requirement it fulfills is a draft. A result or a scenario takes its use case effective status.

### Approval as Data

An approved or reviewed record carries its approval as data: `approvedBy` names a person owner or `auto (veto window)`, `approvedOn` names the date, and `approvedHash` is the builder hash over the semantic fields. The semantic fields are the statements, results, output names, rules, and steps. Prose bodies sit outside the hash, so rewording prose reopens no approval. `approval-reopened` fires when the semantic hash differs from `approvedHash`.

### Risk Tiers

`risk` is optional on requirements and Behavior records, and holds any of `money`, `door`, `personal-data`, and `access`. Any value makes the record tier 1. A record with no risk is tier 3. Tier 1 needs explicit approval or review by a named person. A tier-3 draft question carrying `recommended` auto-approves after its `decideBy` plus the project veto window (`review.vetoWindowDays` in `litespec.project.json`, default 7), recorded as `approvedBy: auto (veto window)`.

### Questions and Ballots

`questions` carries `question`, `decider`, `decideBy`, `recommended`, `ballot`, and `tier`. `ballot` groups questions in the inbox, by a decision id or a short topic slug. An open question blocks approval. A draft past its `decideBy` that is not auto-approvable is reported as a known gap with its owner, and never silently blocks. Each ballot carries a consequences summary rendered from Behavior, marked as context and outside the approval hash, so Intent stays enough to approve. `litespec book` writes a ballots page, listing questions grouped by `ballot`, ordered tier 1 first, with each question recommendation and auto-approval date. The [release page](release.md) states the review flow.

### Transcription Mode

During adoption, a Behavior record written from code carries `source: transcribed`. Such a record can stand as draft, but never as reviewed, until its `fulfills` or `serves` parent is approved. `litespec.project.json` `adoption.transcriptionEndsWith` names the decision that ends the mode. After that decision is approved, `transcribed-after-adoption` fails on any remaining transcribed record.

### Size and Stacks

Each project declares its size, its stacks, and its optional types in `litespec.project.json`. Each frontend declares one stack, and the backend declares its own. Every project answers whether constraints apply, possibly with none. Owners form a closed list, and extensions name their replacements and switched-on types. The [scope page](scope.md) states how a project selects its size, shape, and stacks.

### The Model Builder

The model builder reads records, code, routes, tests, and test runs into one model. It writes the model file, runs the model checks, and renders generated regions. The [model command page](../tools/model.md) lists the subcommands and finding codes.

Generated regions sit inside fences that only the builder writes and prose checks skip. Each project runs the builder in its own gate, so handwritten prose and computed views stay in one page without mixing.

A finding that an open known gap covers is reported as known and exits zero. The gap covers the finding when its `check` equals the finding code and its `subject` lists the finding identifier. An expired known gap fails the check.

`litespec model diff <base>` prints the records a change adds, changes and removes, in the book words, for review.

### Check Tiers

Every check has a tier.

| Tier | Meaning |
|:--|:--|
| G | Reads records only. Always blocks. |
| S | Reads code through a stack reader. Blocks where the stack reader is qualified (.NET today), and reports otherwise. |
| A | Advisory. Reports and never blocks. |

`litespec model check` prints the tier beside each finding.

| Code | Tier | What Fails |
|:--|:--|:--|
| `record-shape` | G | a record outside its home or missing a common field |
| `invalid-field` | G | a field the record type does not declare, or a value outside its vocabulary |
| `identifier-*` | G | an identifier outside the declared grammar |
| `reference-unresolved` | G | a link whose target no record carries |
| `link-unresolved` | G | a page link naming no file |
| `owner-unknown` | G | a page naming an owner outside the closed list |
| `draft-without-decider` | G | a draft missing its decider or date |
| `draft-gate` | G | an approved record behind a draft decision |
| `product-not-singleton` | G | a product count other than one |
| `size-type-missing` | G | a project missing its declaration or a required type |
| `requirement-unfulfilled` | G | a requirement nothing fulfills |
| `requirement-unmeasured` | G | a measured requirement with no check of its measure |
| `decision-decides-nothing` | G | a decision with an empty decides field |
| `journey-reach` | G | a use case that no journey reaches and no caller names |
| `state-unreachable` | G | a state no transition reaches |
| `transition-unresolved` | G | a transition naming a missing state or use case |
| `use-case-without-success` | G | a use case with no success result |
| `scenario-result-unresolved` | G | a scenario naming a missing result |
| `calculation-without-table` | G | a calculation rule with no scenario examples table |
| `rule-name-negation` | G | a rule name missing the negation its statement makes |
| `known-gap-expired` | G | an expired known gap |
| `gap-unknown-check` | G | a known gap naming an unknown check |
| `aggregate-name-clash` | G | two aggregates sharing one name |
| `use-case-name-clash` | G | two use cases sharing one name |
| `reaction-trigger-unresolved` | G | a reaction whose trigger resolves to nothing |
| `erasure-undeclared` | G | a personal or sensitive field with no erasure position |
| `record-orphaned` | G | a use case with neither serves nor fulfills |
| `step-unserved` | G | a journey step no use case serves |
| `effect-loop` | G | an effect cycle outside a domain event with a stated end |
| `consistency-unexplained` | G | an atomic change over several aggregates with no because rule |
| `query-output-missing` | G | a query with no declared output |
| `paging-undeclared` | G | a collection query with no paging |
| `widening-unjustified` | G | output visible beyond its sources with no wideningBecause |
| `retention-without-enforcement` | G | a retention row nothing enforces |
| `risk-without-acceptance` | G | a retained or exempt personal class with no acceptedBy in Intent |
| `exemption-expired` | G | an erasure exemption past its review date |
| `setting-default-without-requirement` | G | a commercial, legal, or varying default with no requirement |
| `reservation-without-release` | G | a reservation with no releasedBy |
| `notification-without-sender` | G | a notification no reaction or use case sends |
| `except-without-fallback` | G | an except with no fallback requirement, or a fallback carrying except |
| `approval-reopened` | G | semantic fields changed after approval |
| `transcribed-reviewed` | G | a transcribed record standing reviewed |
| `transcribed-after-adoption` | G | a transcribed record after adoption ends |
| `operator-job-without-guard` | G | an operator job with no guard |
| `schedule-unstructured` | G | a schedule outside every or cron |
| `behavior-unrecorded` | S | code with no parent record: delete the code, or write its parent record from a requirement, drafting the requirement if none exists |
| `use-case-unimplemented` | S | a use case with no handler |
| `use-case-access` | S | access wider than the grant |
| `refusal-not-thrown` | S | a declared refusal code missing from the handler |
| `proves-unconfirmed` | S | a proves link with no passing test behind it |
| `use-case-without-scenario` | S | a use case with no scenario |
| `write-undeclared` | S | a write outside changes |
| `result-undeclared` | S | an outcome no result declares |
| `effect-undeclared` | S | an edge no record declares |
| `prose-missing` | A | a use case needing Goal and What Happens without them |
| `many-aggregates` | A | more than one atomic write group |
| `question-aged` | A | a question past its date still open |

### The Book and the Diffs

The book and the diffs live in the Proof layer. The book renders each journey as one chapter: the goal, `finishedWhen`, the steps as sentences, `ifItGoesWrong`; the requirements it fulfills, with their statements and their `except` and fallback inline; for each step, the serving use case goal in one line; the Then clauses of its scenarios, as context; a consequences box, as context, naming new refusals in product words, data kept and for how long, and money effects; and the open questions.

Field tables render as tables. Scenarios group under their result. Field names never render literally in Intent chapters.

`litespec model diff <base> --intent` shows Intent changes in product words. `--behavior` shows Behavior changes and the security queue. Without a flag, it shows both. The security queue lists tenant scope `cross` access, new `calls` effects, and new personal or sensitive data classes for the security reviewer named in `review.securityReviewer`.

## Standards

### Write Every Record in Its Home

**Statement:** A project MUST keep every record in the home its type names.

**Rationale:** One home per type tells a reader where to open a record and tells the builder where to read it. A record kept anywhere else is invisible to the checks that scan its home, so it looks sound while nothing validates it.

**Example:** A decision lives at `docs/product/decisions/0001-receipt-threshold.md`.

### State the Common Fields on Every Record

**Statement:** Every written record MUST carry its type, identifier, title, owner, and status.

**Rationale:** Type, identifier, title, owner, and status are the fields every join needs. Without them on every record, the builder cannot connect decisions to requirements, scenarios to results, or records to owners, and the model falls apart into loose pages.

### Use the Layer Status Vocabulary

**Statement:** Every written record MUST carry the status vocabulary of its layer.

**Rationale:** Intent and governance records use draft, approved, and retired, while Behavior records use draft, reviewed, and retired. One vocabulary per layer tells a reader whether a person approved the promise or reviewed the behavior. A Behavior record marked approved claims a founder decision nobody made.

### Hold Approval Behind Open Questions

**Statement:** A record MUST NOT stand approved or reviewed while it carries an open question.

**Rationale:** An open question names a fact the record still needs, with the decider and the date that will settle it. Approving the record first would claim settled intent while the missing fact can still move it. Answering the question or retiring the record clears the gate. A question that auto-approves after the veto window is closed, not open, so the gate still holds.

### Record Approval as Data

**Statement:** An approved or reviewed record MUST carry approvedBy, approvedOn, and approvedHash over its semantic fields.

**Rationale:** Approval as data tells every reader who decided, when, and over which content. The hash covers statements, results, output names, rules, and steps, and never prose bodies, so a typo fix reopens no approval while a moved promise does. `approval-reopened` fires when the semantic hash differs from the stored hash.

**Example:** An approved requirement carries its approver, its date, and its hash.

```json
{
  "status": "approved",
  "approvedBy": "ava-reyes",
  "approvedOn": "2026-10-01",
  "approvedHash": "9f2c41ab"
}
```

### Approve Tier 1 Records by a Person

**Statement:** A tier 1 record MUST carry explicit approval or review by a named person.

**Rationale:** A record carrying money, door, personal-data, or access risk decides what money moves, who passes, whose data is kept, or who may act. Only a named person weighs those consequences; the veto window auto-approval never decides them. Tier 3 records carry no risk, so their draft questions can auto-approve after the window.

### Write Links on the Record That Points

**Statement:** A link MUST live as fields on the record it starts from.

**Rationale:** One writing site keeps a link and its source in one edit: changing the source updates the link in the same change. Links written on the target instead would scatter each relationship across every page it touches.

### Connect Every Use Case to Intent

**Statement:** A use case MUST carry serves, fulfills, or both.

**Rationale:** A use case with no served journey step or goal and no fulfilled requirement answers to nothing above it: no promise explains why it exists. Pointing up with serves or fulfills ties every behavior to the Intent that asks for it. `record-orphaned` fails a use case carrying neither.

### Serve Every Journey Step

**Statement:** Every journey step MUST have a serving use case.

**Rationale:** A step no use case serves promises a moment the product never builds. Use cases point up with serves, so each step id collects the behaviors that carry the walker through it. `step-unserved` fails a step with no serving use case.

### Follow the Authority Order

**Statement:** A conflict MUST resolve toward the higher authority.

**Rationale:** Intent records outrank Behavior records: constraint over product, product over requirement, requirement over rule, rule over use case, use case over result, and result over scenario. The order settles a conflict without a meeting: a use case asking for behavior its rule forbids loses to the rule. Where Intent has spoken, the specification wins over code; where Intent is silent, working code is evidence for a question. Decisions explain choices and research informs them, but neither outranks the ladder, so prose never silently overrides an approved record.

### Resolve Ties by the Later Decision

**Statement:** A tie MUST resolve toward the later approved decision.

**Rationale:** Two records at one level can disagree with no higher record to settle them. The later approved decision wins because it decided with knowledge of the earlier one. When no later decision separates them, their shared owner decides, so every tie still has exactly one judge.

### Hold Approval Behind Draft Decisions

**Statement:** A record MUST NOT stand approved or reviewed behind a draft decision.

**Rationale:** Approval means the reasoning behind the record already holds. A record approved behind a draft decision claims settled intent while its foundation can still move. The builder also writes each record effective status: draft when the record, a decision deciding it, or a requirement it fulfills is a draft. A result or a scenario takes its use case effective status.

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

**Example:** A draft names its `decider` and `decideBy` date. The three statuses and what each allows: a draft awaits its decider, approved or reviewed holds, and retired means a replacement holds.

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

**Rationale:** Callers branch on named endings: success or a specific refusal with its code. Refusals stand in precedence order, so the first match wins. A refusal that stores its attempt carries recorded, and a success with recorded outcomes inside it carries codes. Generic refusals are derived, never written, so they need no entry. A use case with no named success leaves callers guessing what good looks like, and scenarios prove one ending each, so unnamed endings stay unproven.

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

### Derive Generic Refusals

**Statement:** Generic refusals MUST be derived from access and input, never written as records.

**Rationale:** Forbidden and invalid input follow from the access grant and the input rules on every use case, so writing them by hand repeats one decision hundreds of times and drifts. The builder derives `result/<module>.<use-case>.forbidden` and `result/<module>.<use-case>.invalid-input`, and scenarios point at those ids. A written record with a generic id claims a decision the access grant already made.

**Example:** A scenario for `use-case/spending.submit-expense` points at `result/spending.submit-expense.forbidden` with no result record of that id on the page.

### Author One Slice at a Time

**Statement:** Authoring MUST complete one feature from problem to scenario before starting the next.

**Rationale:** A feature worked from problem to scenario stays reviewable at every level: each record lands with the Intent above it already written. Parallel slices leave Behavior records resting on Intent nobody wrote yet, and reviewers cannot tell a settled choice from a guess.

### Raise Modeling Questions with a Decider and a Date

**Statement:** A question found while modeling MUST travel up as a draft question carrying its decider and its decision date.

**Rationale:** A Behavior record written around an open question bakes the guess into states, rules, and scenarios. Sending the question up with its decider, its date, its recommendation, its ballot group, and its tier keeps it owned and dated, while the Behavior record stays draft until the answer lands. A draft past its date that cannot auto-approve becomes a known gap with its owner, so it never silently blocks.

### Hold Transcribed Records in Draft

**Statement:** A record with source transcribed MUST NOT stand reviewed while its fulfills or serves parent is unapproved.

**Rationale:** Transcription copies working code into a record during adoption, so the record describes what exists rather than what Intent asked for. Draft holds it visibly unfinished until its fulfills or serves parent is approved. `transcribed-reviewed` fails a transcribed record standing reviewed.

### End Transcription at the Named Decision

**Statement:** Every transcribed record MUST clear before the adoption decision is approved.

**Rationale:** Transcription mode exists to adopt working code, not to write Behavior from code forever. `adoption.transcriptionEndsWith` names the decision that ends the mode, and approving it closes the door: `transcribed-after-adoption` fails on any record still carrying source transcribed. Clearing means the record earns its Intent parent and drops the transcribed mark, or retires with the code it copied.

### Compute Proof Statuses in the Builder

**Statement:** Implemented, verified, stale, reachable, and effective status MUST come from the builder, never from handwriting.

**Rationale:** Handwritten status drifts: a record marked implemented stays marked after its handler is deleted. Computed status cannot drift, because the builder re-derives it from handlers, routes, scenarios, and test runs on every run. A use case reads implemented when a handler, reaction, job, or endpoint carries it out, verified when every scenario passes its proof, and stale when a scenario changed after its proof, and a requirement reads verified when everything fulfilling it is verified. Nothing above Implementation is computed from code: derivation from code into a record is forbidden, and code-computed facts live in the book and the model output.

**Example:** A use case reads implemented when its handler exists.

### Mark Every Check with Its Tier

**Statement:** Every check MUST carry its tier and block or report as that tier states.

**Rationale:** The tier tells a reader what a finding means: G reads records only and always blocks, S reads code through a stack reader and blocks only where the reader is qualified, and A reports and never blocks. `litespec model check` prints the tier beside each finding, so a review tells a blocking defect from advice at a glance.

## Conventions

### Render Generated Regions from the Model

**Default:** A generated region renders only facts derived from records.

**Replacement:** Code-computed facts live in the book and the model output.

**Rationale:** A generated region sits inside a record page, so everything in it reads with record authority. Facts computed from code, such as implemented and verified counts, describe the world rather than the promise, and rendering them beside records would lend them authority they do not hold. The book and the model output carry code-computed facts where readers meet them as computed.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/core/model#write-every-record-in-its-home | checkable | `litespec model check` reports `record-shape` for a record outside its home. |
| litespec/core/model#state-the-common-fields-on-every-record | checkable | `litespec model check` reports `record-shape` for a record missing a common field. |
| litespec/core/model#use-the-layer-status-vocabulary | checkable | `litespec model check` reports `invalid-field` for a status outside the record layer vocabulary. |
| litespec/core/model#hold-approval-behind-open-questions | checkable | `litespec model check` reports `record-shape` for an approved or reviewed record carrying an open question. |
| litespec/core/model#record-approval-as-data | checkable | `litespec model check` reports `approval-reopened` for a record whose semantic fields changed after approval. |
| litespec/core/model#approve-tier-1-records-by-a-person | guidance | Which tier 1 records lack a named personal approver? Look at `approvedBy` on records carrying risk. |
| litespec/core/model#write-links-on-the-record-that-points | checkable | `litespec model check` reports `reference-unresolved` for a link whose target no record carries. |
| litespec/core/model#connect-every-use-case-to-intent | checkable | `litespec model check` reports `record-orphaned` for a use case with neither `serves` nor `fulfills`. |
| litespec/core/model#serve-every-journey-step | checkable | `litespec model check` reports `step-unserved` for a journey step with no serving use case. |
| litespec/core/model#follow-the-authority-order | guidance | Conflict decisions under `docs/product/decisions/` name the higher record that won, in the order this page states. |
| litespec/core/model#resolve-ties-by-the-later-decision | guidance | Each tie-breaking decision carries a later approval date than the peer records it settles. |
| litespec/core/model#hold-approval-behind-draft-decisions | checkable | `litespec model check` reports `draft-gate` for an approved or reviewed record behind a draft decision. |
| litespec/core/model#record-accepted-gaps-as-known-gaps | checkable | `litespec model check` reports `record-shape` and `known-gap-expired` for a gap missing its owner, date, or renewal. |
| litespec/core/model#apply-guidance-precedence | guidance | Every departure from a shared provision resolves to a deviation record under `docs/deviations/` with reason and review date. |
| litespec/core/model#keep-one-owner-and-status-on-every-record | checkable | `litespec model check` reports `owner-unknown` and `draft-without-decider` for a page missing its owner or draft decider. |
| litespec/core/model#retire-records-with-replaces | checkable | `litespec model check` reports `invalid-field` for `replaces` outside a decision and `reference-unresolved` for an unknown target. |
| litespec/core/model#name-what-every-decision-decides | checkable | `litespec model check` reports `decision-decides-nothing` for a decision with an empty `decides` field. |
| litespec/core/model#resolve-every-page-link | checkable | `litespec model check` reports `link-unresolved` for a page link naming no file. |
| litespec/core/model#declare-size-stacks-and-optional-types | checkable | `litespec model check` reports `size-type-missing` and `record-shape` for a project missing its declaration or a required type. |
| litespec/core/model#give-every-use-case-its-results | checkable | `litespec model check` reports `use-case-without-success` and `scenario-result-unresolved` for a use case missing its success or a scenario naming no result. |
| litespec/core/model#derive-generic-refusals | guidance | Which result records carry a generic refusal id? Look for ids ending in `.forbidden` or `.invalid-input` beside the use case pages. |
| litespec/core/model#author-one-slice-at-a-time | guidance | Approved Behavior records show approved Intent above them through their `fulfills` and `decides` links. |
| litespec/core/model#raise-modeling-questions-with-a-decider-and-a-date | guidance | Open modeling questions appear as draft questions carrying a decider and a date. |
| litespec/core/model#hold-transcribed-records-in-draft | checkable | `litespec model check` reports `transcribed-reviewed` for a transcribed record standing reviewed. |
| litespec/core/model#end-transcription-at-the-named-decision | checkable | `litespec model check` reports `transcribed-after-adoption` for a transcribed record after the adoption decision is approved. |
| litespec/core/model#compute-proof-statuses-in-the-builder | checkable | `litespec model check` reports `use-case-unimplemented`, `proves-unconfirmed`, and `refusal-not-thrown` for a use case whose handler, proof, or refusal code is missing. |
| litespec/core/model#mark-every-check-with-its-tier | guidance | Which findings lack a tier letter, or block outside their tier? Look at the output of `litespec model check`. |
| litespec/core/model#render-generated-regions-from-the-model | guidance | Which generated regions render code-computed facts? Look inside the generated fences beside the book and the model output. |
