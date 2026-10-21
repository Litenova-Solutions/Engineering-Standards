# LiteSpec

## Intent

LiteSpec coordinates software work with agents as active engineering participants. It combines records, architecture standards, agent protocols, implementation conventions, tests, operating controls, and release records.

The name has two parts:

- `Lite` means a consumer adopts one bounded context, one size, and its selected stacks, and nothing more.
- `Spec` means approved written records and provisions define the work. Agents and people build and verify against them.

### Company context

Litenova Solutions authors LiteSpec and uses it as its engineering system for developing software. The system is general enough for another technical team to adopt. Litenova's company context defines the current defaults and explains the decisions in this repository.

One technical founder currently operates Litenova Solutions. LiteSpec assumes technical contributors. One person may hold product, domain, architecture, implementation, testing, release, and operations responsibilities at the same time.

The system names responsibilities without assuming separate departments or job titles. `Decision owner`, `implementation owner`, and `operations owner` identify accountability. They may identify the same person.

AI agents perform a substantial part of engineering work. They can inspect repositories, propose designs, edit authorized artifacts, run tools, and collect evidence. They do not own unresolved product policy, legal judgment, financial decisions, or risk acceptance.

Agent-led execution increases the need for explicit technical concepts. Agents distinguish modules from business records and journeys from event reactions. They also distinguish approved records from implementation claims.

### Why the system exists

Without a shared engineering system, two capable contributors or agents can implement the same request with different boundaries, names, transaction behavior, and verification. Each local result may compile while the workspace loses a coherent model.

The system addresses recurring problems:

- Product intent can be lost between a request and its implementation.
- Agents can invent missing rules when a record leaves a decision implicit.
- Standard technical concepts can be renamed until developers no longer recognize the established pattern.
- A use case can be implemented in one layer while persistence, public entry points, tests, or operating impact remain incomplete.
- Documentation can claim behavior that code and automated evidence do not support.

The system makes the record durable and the agent replaceable. A different person, model, or tool should continue from the same approved records and obtain the same required boundaries.

### Connected layers

The system contains one delivery approach and one operating model:

| Layer | Meaning | Concrete example |
|:---|:---|:---|
| LiteSpec | The complete system of standards, records, implementation, verification, operations, and release control. | The repository structure, provision IDs, templates, tests, runbooks, and release records. |
| Record-driven delivery | Approved records select work and define completion. | `use-case/orders.cancel-order` defines behavior before its Command, endpoint, and tests are accepted. |
| Agent-driven engineering | Agents perform substantial engineering execution within approved scope and report decisions they cannot make. | An agent loads the cancellation record, implements it, runs its checks, and reports an unknown refund policy. |

Driven means engineering work starts from an approved record and completion is judged against it. A record is more than a prompt because it remains in the workspace after one agent session ends.

Agent-driven describes who performs much of the execution. It does not transfer business decision authority to the agent.

## Concepts

The system uses related concepts rather than one hierarchy:

```text
Product
  defines scope, outcomes, and operating constraints

Domain
  contains the business language, rules, state, and behavior

Module
  groups related language, use cases, business records, and code

Journey
  connects use cases to one observable product outcome
  can appear in a release record

Use Case
  defines one independently testable Command or Query goal

Business Record
  protects facts and rules changed in one step

Event
  records a completed fact

Event Reaction
  defines behavior caused by an Event

Result
  defines one way a Use Case ends

Case
  defines one working example of a Use Case

Acceptance Test
  proves one or more Cases

Journey Test
  proves one complete Journey through public boundaries
```

The central relationships are:

```text
Product outcome
  Journey
    Use Cases
      Results
      Cases
      Acceptance Tests
    Journey Tests

Domain
  Modules
    Use Cases
    Business Records
      Business States
      Rules
  Rules

Command
  normally changes one Business Record

Query
  reads a Read Model
```

The [glossary](../reference/glossary.md) defines each term below. This section records the relationships and distinctions that a one-sentence definition cannot carry.

### Product and journey

The product record (the brief) names users, problems, outcomes, exclusions, commercial constraints, and operating context. It is not a synonym for the frontend application.

A journey begins at an accepted starting condition, crosses every required system boundary, and ends at one observable product outcome. It does not mean every possible product feature. The record lists ordered steps with what must exist first. It may include actor decisions, branches, waiting periods, failures, and recovery.

A journey links existing use-case records instead of repeating their inputs and rules. For an online shop, `journey/checkout` can connect stock reservation, order creation, payment start, and shipment dispatch. Order cancellation and payment reconciliation are separate journeys.

### Domain and module

Orders, refunds, shipment delivery, money, and cancellation policy are domain concepts. HTTP, JSON serialization, database sessions, and queue clients are technical mechanisms.

The capitalized `Domain` project is the code layer that implements domain types and behavior. The business domain exists independently of that project. Domain or Application code may enforce a rule across business records when its facts cross record or module boundaries.

`Orders module` is natural in product discussion and maps to `Domain/Orders`, `Application/Orders`, endpoint groups, frontend features, and tests. A module is not automatically:

- An assembly or deployment unit.
- A transaction boundary.
- One business record.
- A runtime base type or interface.

A module may contain no business record, one business record, or multiple related business records. Independent language, responsibility, or change reasons indicate separate modules. A use case belongs to the business record whose folder holds its page.

### Use case, Command, and Query

A use case owns its trigger, input, permissions, result, rules, refusals, entry points, implementation impact, and operating impact.

One top-level Command owns one command pipeline and one transaction commit. A Query reads a Read model without changing business state.

`use-case/orders.cancel-order` is a use case. `CancelOrderCommand` is its Application message. `OrderCancel` is its business-record action. These names stay aligned without treating the use case, Command, and business record as one boundary.

Work that spans business records is a Command that reads several records and writes one, an event reaction, or a background job. A background job is work that runs without an HTTP request, on a schedule or from a queue.

### Business record, root, state, and rule

A business record is not every entity in a module. `Root` identifies the mutation entry point, not an inheritance hierarchy for every domain object.

Developers may call it an aggregate. The record type is business record. Every business record uses one abstract `{Record}State` record and one or more sealed state records, including a record with one current state.

A rule that is always true cannot be false after commit. `rule/order.capacity-limits-confirmation`, for example, limits confirmed and reserved quantities to capacity.

### Rules and permissions

Each rule states its kind: always true, checked before, or across records. The kind decides how the rule is proved.

Checked-before rules include message shape: required fields, lengths, and formats are checked before business behavior runs. A persistence constraint is an always-true rule enforced by the store, such as a unique key. Each rule also states where it is enforced: validator, aggregate, store, guard, or reaction.

An actor holds a role at a scope. A role allows permissions. A use case needs permissions. An entry point may offer fewer. Actor kinds are person, company, provider, system, and guest. A role scope is a kebab-case level the project names, such as `platform`, `tenant`, or `self`. Permissions come from one shared closed list.

### Event and event reaction

Event names use past-tense forms such as `OrderConfirmed` and `ShipmentDispatched`. `Reaction` states the causal relationship without prescribing the implementation.

A reaction may map to an event handler, a projection, a Command that reads several records, or a background job. `OrderConfirmed` may cause the reaction `Dispatch shipment`, implemented as a background job rather than a class named `DispatchShipmentReaction`.

Each reaction declares one delivery classification:

- `atomic`: the reaction completes in the same transaction as the event.
- `durable`: the reaction is recorded beside the event and runs after the commit, retrying until it succeeds.
- `rebuildable`: a missed delivery is recovered by rebuilding the effect from its source records.
- `best-effort-optional`: the reaction may be skipped or lost without breaking a promise.

Select `atomic` for a required effect inside one consistency boundary. Select `durable` for one outside it. Select `rebuildable` for a derived view. Select `best-effort-optional` only where no record needs the effect.

### Result, Case, and verification

A result names one way a use case ends: success, or a named refusal with its failure code. A case pairs one situation with the result it leads to.

An acceptance test proves a case only when its steps call the use case and assert the result. Acceptance tests prove use-case behavior. Journey tests prove that connected use cases produce the release outcome.

### Authority and links

What should happen follows constraint, product, requirement, rule, then use case. A decision explains a choice. It is replaced, never edited. Research, examples, and prose carry no authority.

What is true today comes from code, screens, and test runs. A mismatch between the two is a defect, assigned to the owner of the higher record. A failing test does not settle intent.

When two records at one level disagree, the one whose decision was approved later wins. Otherwise, their shared owner decides.

Written links live on the record named first: a decision decides a requirement, a rule fulfills one, a use case raises an event. The model builder computes implements, calls, and proves from code, routes, and test runs.

| Field | Written on | Points at |
|:---|:---|:---|
| decides | decision | Requirements, features, rules, constraints, and the permissions, roles, actors, exceptions, standards, entry points, limits, or decisions an engineering choice settles |
| basedOn | decision, requirement, rule | Constraints, research |
| affects | problem | Actors |
| solves | feature | Problems |
| fulfills | rule, use case, journey | Requirements |
| governs | rule | Business records, use cases |
| results | use case | Its result entries |
| cases | use case | Its use case entries; each names its result |
| raises | use case | Events |
| reactsTo | use case | Events it reacts to |
| holds | actor | Roles at a scope |
| allows | role | Permissions |
| needs | use case | Permissions |
| reachedThrough | use case | Entry points |
| steps | journey | Ordered use cases with actors |
| terms | any record | Terms |
| replaces | decision | The replaced decision |
| dependsOn | module | Modules |
| implements (computed) | code | use case, rule, event |
| calls (computed) | screen | use case |
| proves (computed) | test | case |

### Record catalog

Every record has an owner and a status: draft, approved, or retired. A draft has a decider and a decide-by date.

| Record | Home |
|:---|:---|
| product | `docs/product/brief.md` |
| constraint | `docs/product/constraints/` |
| research | `docs/research/` |
| decision | `docs/product/decisions/` |
| requirement | product topic pages |
| problem | `docs/product/problems/` |
| feature | `docs/product/features/` |
| actor | `docs/domain/actors/` |
| role | `docs/domain/roles/` |
| permission | `docs/domain/permissions.md` |
| journey | `docs/product/journeys/` |
| module | `docs/domain/modules/<module>/README.md` |
| business record | module page folders |
| rule | its home page |
| use case | business-record folders |
| result, case, event | entries in their pages |
| entry point | `docs/domain/entry-points.md` |
| limit | `docs/operations/limits.md` |
| runbook | `docs/runbooks/` |
| exception | `docs/exceptions/` |
| known gap | `docs/known-gaps/` |
| term | `docs/language.json` |

### Entry points

People and systems reach the product through entry points. An entry point is a web app, a public API, a CLI, an MCP server, a site, a reaction, or a job.

The model builder computes which screens call which use case from routes and generated clients.

### Scenario and reference cast

A scenario is one concrete occasion for the subject of a record: who acts, what surrounds them, and what they would do instead. It answers when the behavior happens, which no rule, state, or mapping table states.

A reference cast is the one record every scenario draws its people, place, dates, and amounts from. Independent scenarios invent a merchant and a customer for each page, so nothing carries between two pages read in sequence.

Both are informative. A scenario illustrates its page and never governs it. A scenario that disagrees with the page it sits on is the part that is wrong.

## Standards

### Keep decision authority with accountable people

**Requirement:** An agent MUST stop affected work and record the question in a draft decision when an unknown fact changes behavior, money, data, access, or recovery.

**Rationale:** Decision owners approve outcomes, terms, policies, criteria, commitments, and risk. An agent contribution stays a proposal until an accountable person accepts it.

### Drive work from approved records

**Requirement:** An agent MUST start behavior work from the approved use-case and module records, plus the product and journey records when they exist for the behavior.

**Rationale:** A prompt, ticket, chat message, or code comment can initiate work. The owning record holds the approved behavior. Code does not silently replace it.

### Resolve authority by ladder

**Requirement:** Authority MUST follow constraint, then product, requirement, rule, and use case in that order, with every record carrying an owner.

**Rationale:** The ladder settles ties without a meeting. The owner answers for each record.

### Write each record in its catalog shape

**Requirement:** Every written record MUST use its catalog type, identifier form, home, owner, and status.

**Rationale:** One shape per type lets the model builder read every record the same way.

### Declare each link on its source

**Requirement:** Every written link MUST live on the record the link table names first, with every citation resolving to a written record.

**Rationale:** Links on the source keep each record readable alone. Resolving citations keeps the graph whole.

### Connect one product outcome through a journey

**Requirement:** A journey MUST link its use-case records without repeating their content, and every public use case sits in a journey or names its background caller.

**Rationale:** A journey can cross modules and include branches, waiting, failure, and recovery. Its tests prove the connected outcome through public boundaries. Repeated content means inputs, rules, refusals, and results.

**Example:** The running library example connects borrowing and returning through `journey/borrow-and-return`, which links its use cases without repeating their inputs or rules:

```json
{
  "type": "journey",
  "id": "journey/borrow-and-return",
  "title": "Borrow and return",
  "owner": "lending-team",
  "status": "approved",
  "actor": "actor/reader",
  "goal": "Borrow and return a copy.",
  "steps": [
    { "useCase": "use-case/lending.register-copy", "actor": "actor/reader", "requires": [] },
    { "useCase": "use-case/lending.borrow-copy", "actor": "actor/reader", "requires": [] },
    { "useCase": "use-case/lending.extend-loan", "actor": "actor/reader", "requires": [] }
  ]
}
```

The page shows three of the eight steps; each step names its use case and actor only, and the use-case pages keep the inputs, rules, and results, which satisfies this provision.

### Group language and use cases by module

**Requirement:** A module name MUST be identical across documentation, Domain and Application folders, endpoint groups, frontend features, tests, and record identifiers.

**Rationale:** A module is a navigation and ownership boundary. It defines no transaction boundary. It needs no runtime `Module` or `IModule` type.

### Make business-record ownership explicit

**Requirement:** A module page MUST map each business record to its state, rules, and commands, with one record per command unless an approved record demands more.

**Rationale:** One record per command keeps each transaction boundary visible.

### Deliver one complete use case

**Requirement:** A use case MUST map to one Command or Query, complete only with Domain behavior, Application coordination, persistence, entry points, evidence, and operating impact.

**Rationale:** Multi-step product outcomes belong to a journey. Placeholder work leaves the use case unimplemented. The Command or Query is top level. The evidence is automated.

**Example:** A use case whose handler throws `NotImplementedException` is not implemented.

### Compute use-case status from evidence

**Requirement:** Use-case status MUST come from code, screens, and test runs: implemented when code implements it, verified when every Case passes its proof.

**Rationale:** Computed status cannot drift from what the repository proves.

**Example:** Aligned identifiers and implementation names have this shape:

```text
Use case: use-case/orders.cancel-order
Command:  CancelOrderCommand
Result:   result/cancel-order.order-canceled
Case:     case/cancel-order.canceling-twice-is-refused
Event:    event/order.canceled
Endpoint: CancelOrderEndpoint
```

### Keep use cases and handlers in one-to-one correspondence

**Requirement:** Every handler MUST resolve to one use case by the folder rule or one `implements` anchor, with every use case resolving back to its handler.

**Rationale:** Neither direction is visible without the check. Code with no use case reads as a reviewed feature. It is not one. A use case with no code states a plan in the present tense.

**Example:** `litespec model query use-case/orders.cancel-order` shows the handler the folder rule resolves.

### Name what calls a use case

**Requirement:** A use case MUST declare the entry points it is reached through, or name its background caller with the reason no entry point reaches it.

**Rationale:** A route calls use cases from its code. The edge runs one way. Nothing answers the question asked before a change: who breaks if this operation moves. A use case reached only by a schedule or a reaction has a real answer. Writing it down separates it from one nobody wired up.

**Example:** A use case reached only by a reaction names that reaction as its caller.

```text
"reachedThrough": ["entry-point/webshop"]
```

### Declare event reaction delivery

**Requirement:** An event reaction MUST declare exactly one delivery classification and deliver with it, never `best-effort-optional` when a record needs its effect.

**Rationale:** The classification tells the reader what a failure costs: rollback, retry, rebuild, or loss.

### State each rule with its kind

**Requirement:** Each rule MUST state its kind, governed target, and enforcement point, keeping a negation word in its name when its statement says one.

**Rationale:** The kind decides the proof. The name lets a reviewer read the rule as a true sentence. Negation words are not, no, never, and cannot.

**Example:** `rule/order.cancel-only-before-shipment` is a checked-before rule enforced by the validator.

### Grant access through roles and permissions

**Requirement:** Access MUST flow from actor through role and permission to use case, with each link declared: holds, allows, needs, and offers.

**Rationale:** The chain gives every access decision one path to audit: actor, role, permission, and use case. The hold names its scope.

### Model every business-record lifecycle with state records

**Requirement:** A business-record page MUST map every business state to a sealed state record under one abstract state base.

**Rationale:** This holds from the first implementation, including a record with one current state. An enum, status string, boolean flag, or computed discriminator cannot carry state-specific facts.

### State one occasion for every behavior record

**Requirement:** A module, business-record, use-case, or journey page MUST carry a `Scenario` section stating one concrete occasion for its subject.

**Rationale:** Every other section states a rule, a state, or a mapping. None of them says when the behavior happens. None of them says who is under pressure while it does. A reader who cannot place an operation in the world reads its rules as arbitrary constraints. An agent writing against it cannot tell an ordinary case from an exceptional one.

**Example:** A warehouse scan page states the hour, the parcel queue, and the handheld that lost signal before it states its failure codes.

### Keep a scenario informative

**Requirement:** A `Scenario` section MUST NOT contain a record identifier.

**Rationale:** An identifier inside a scenario reads as a second definition of the record it names. Two definitions drift. The section illustrates the page. A scenario that contradicts the page's own tables is the part that is wrong.

**Example:** A scenario says Alex is refused because the last unit went to somebody else. The rules table carries the rule.

### Derive every scenario from one reference cast

**Requirement:** A consumer MUST record one `scenario-cast` page and draw the people, place, dates, and amounts of every `Scenario` section from it.

**Rationale:** One cast makes a sequence of pages describe one occasion rather than many unrelated illustrations. The reader carries context from each page to the next. The cast costs nothing to maintain because it names no code. Its figures come from the records.

**Example:** Alex, the customer who places the order in one record, is the person who receives the shipment in another.

### Update records with behavior

**Requirement:** An observable behavior change MUST update its use-case page, implementation, tests, generated contracts, product citation, decision, journey, and operating records together.

**Rationale:** Approved records then map to current names and paths.

## Conventions

### Use this consumer documentation layout

**Default:** Use the consumer documentation layout in this section, creating a directory only when its first real artifact exists.

**Replacement:** A consumer can replace this default with an approved exception record.

**Example:**

```text
docs/
  product/
    README.md
    brief.md
    business/
      pricing.md
    markets/
      expansion.md
    roadmap/
      milestones.md
    decisions/
      0047-guest-checkout.md
    problems/
      abandoned-carts-lose-sales.md
    features/
      guest-checkout.md
    journeys/
      check-out-as-a-guest.md
    constraints/
      payment-card-rules.md
  domain/
    README.md


    actors/
      buyer.md
    roles/
      shop-manager.md
    permissions.md
    entry-points.md
    rules/
      pricing-rules.md
    modules/
      README.md
      orders/
        README.md
        orders/
          README.md
          cancel-order.md
  research/
    address-lookup-providers.md
  operations/
    limits.md
    secrets.json
    log/
  runbooks/
    restore-a-backup.md
  exceptions/
    temporary-direct-database-read.md
  known-gaps/
    checkout-cases-unproved.md
  ui/
    README.md

  language.json


```

`product/` holds the brief, the journeys, and the business intent: one topic page per area with its requirements, and the product decisions behind them. `domain/` holds the actors, roles, permissions, entry points, rules, and modules.

`operations/` holds the limits, the secret inventory, and the operations log. `runbooks/`, `exceptions/`, and `known-gaps/` hold their records. `ui/` holds the first UI decision or guide. `language.json` holds the term records.

The example creates an optional directory only when its first real artifact is added. The example does not create empty directories or placeholder records during inception.

### Group module use-case files by business record

**Default:** Group module use-case files under a plural kebab-case business-record subdirectory, each holding that record's page, including a module with one business record.

**Replacement:** A consumer can replace this default with an approved exception record.

**Rationale:** A module page cannot carry the business-record page that `litespec/core/system#model-every-business-record-lifecycle-with-state-records` requires. The subdirectory costs one repeated path segment where the names coincide, as in `modules/products/products/`. The use-case identifier stays `use-case/<module>.<name>`. Only the directory changes.

### Keep operational and security references under operations

**Default:** Keep operating and security reference prose under `docs/operations/`.

**Replacement:** A consumer can replace this default with an approved exception record.

**Rationale:** Enforceable security and privacy rules still belong to their owning use-case sections and rules.

### Use established technical terms

**Default:** Use business record, aggregate, Command, Query, repository, projection, outbox, idempotency, and transaction with their accepted technical meanings.

**Replacement:** A consumer can replace this default with an approved exception record.

**Rationale:** Replacing a precise term with a softer synonym hides the established pattern. Explain the term. Give an example instead.

### Use ordinary capitalization in prose

**Default:** Write module, use case, journey, business record, rule, event, and decision as ordinary nouns in prose.

**Replacement:** A consumer can replace this default with an approved exception record.

**Rationale:** Exact record types and code types keep their declared capitalization. The distinction stays meaningful.

### Keep records readable without tooling

**Default:** Use JSON only for the frontmatter block, and write rules, results, cases, and examples in Markdown.

**Replacement:** A consumer can replace this default with an approved exception record.

**Rationale:** A record that needs tooling to read stops being reviewable by the person who owns its decisions.

### Bound a scenario to 120 words

**Default:** Keep a `Scenario` section within 120 words.

**Replacement:** A consumer can raise or lower the bound in `scenarioWordLimit` within `litespec.project.json`.

**Rationale:** A scenario that grows past a paragraph becomes the page a reader reads instead of the tables. It acquires detail that nothing verifies.

## Reference example

This informative example demonstrates `litespec/core/system#connect-one-product-outcome-through-a-journey`, `litespec/core/system#declare-event-reaction-delivery`, and `litespec/core/system#make-business-record-ownership-explicit`.

The `journey/checkout` journey links `use-case/catalog.reserve-stock`, `use-case/orders.create-order`, `use-case/payments.start-payment`, and `use-case/shipping.dispatch-shipment`. Order cancellation and payment reconciliation are separate journeys.

The orders module contains `Order` and `OrderClaim`. `use-case/orders.cancel-order` changes `Order`. It cites `rule/order.cancel-only-before-shipment`. `use-case/orders.claim-guest-order` changes `OrderClaim`. Their shared module name does not merge their transaction boundaries.

`OrderConfirmed` records a completed fact. `Dispatch shipment` is its event reaction, declared `durable`. The page does not name the class that runs it.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/core/system#keep-decision-authority-with-accountable-people | guidance | Which draft decision records each question that stopped the work? |
| litespec/core/system#drive-work-from-approved-records | guidance | Which approved records authorized each behavior change? |
| litespec/core/system#resolve-authority-by-ladder | guidance | Which ladder settles the conflict, and which record lacks an owner? |
| litespec/core/system#write-each-record-in-its-catalog-shape | guidance | Which record breaks its catalog type, home, owner, or status? |
| litespec/core/system#declare-each-link-on-its-source | guidance | Which link sits off its source, and which citation resolves nowhere? |
| litespec/core/system#connect-one-product-outcome-through-a-journey | guidance | Which journey links the use case, or which background caller replaces it? |
| litespec/core/system#group-language-and-use-cases-by-module | checkable | `litespec consumer` resolves each module reference to one declared module directory. |
| litespec/core/system#make-business-record-ownership-explicit | guidance | Which business record lacks its state, rules, or commands on the module page? |
| litespec/core/system#deliver-one-complete-use-case | guidance | Which layer or evidence does the incomplete use case still lack? |
| litespec/core/system#compute-use-case-status-from-evidence | guidance | Which use-case status did a person write by hand instead of the evidence? |
| litespec/core/system#keep-use-cases-and-handlers-in-one-to-one-correspondence | guidance | Which handler lacks its use case, or which use case lacks its handler? |
| litespec/core/system#name-what-calls-a-use-case | guidance | Which entry points reach the use case, or which background caller does? |
| litespec/core/system#declare-event-reaction-delivery | guidance | Which reaction lacks exactly one classification that the implementation honors? |
| litespec/core/system#state-each-rule-with-its-kind | guidance | Which rule lacks its kind, governor, enforcement, or kept negation? |
| litespec/core/system#grant-access-through-roles-and-permissions | guidance | Which access lacks its actor, role, permission, and use-case path? |
| litespec/core/system#model-every-business-record-lifecycle-with-state-records | guidance | Which business state lacks its sealed state record in page and code? |
| litespec/core/system#state-one-occasion-for-every-behavior-record | guidance | Which behavior page lacks a `Scenario` section stating its concrete occasion? |
| litespec/core/system#keep-a-scenario-informative | guidance | Does any `Scenario` section contain a record identifier? |
| litespec/core/system#derive-every-scenario-from-one-reference-cast | guidance | Does one `scenario-cast` page exist, and does each scenario draw from it? |
| litespec/core/system#update-records-with-behavior | guidance | Which affected record did the behavior change leave behind? |
| litespec/core/system#use-this-consumer-documentation-layout | guidance | Which directory breaks the layout without a declared exception? |
| litespec/core/system#group-module-use-case-files-by-business-record | guidance | Does each use case sit under its module or one business-record subdirectory? |
| litespec/core/system#keep-operational-and-security-references-under-operations | guidance | Which operating or security prose sits outside `docs/operations/`? |
| litespec/core/system#use-established-technical-terms | guidance | Which term replaces an established technical meaning with a softer synonym? |
| litespec/core/system#use-ordinary-capitalization-in-prose | guidance | Which ordinary noun carries capitalization outside names and identifiers? |
| litespec/core/system#keep-records-readable-without-tooling | guidance | Which JSON sits outside the frontmatter block? |
| litespec/core/system#bound-a-scenario-to-120-words | checkable | `litespec consumer` fails a `Scenario` section longer than `scenarioWordLimit`, defaulting to 120 words. |
