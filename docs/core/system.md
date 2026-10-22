# LiteSpec

## Intent

LiteSpec is a system for building software from approved written records: the records state the required behavior, and people and agents build, verify, and operate against them. This page states what that system covers, how its records and concepts fit together, and which rules keep them consistent. A team starting a project reads it first, so every later choice lands in one shared model joining intent to code.

## Concepts

### Company context

Litenova Solutions authors LiteSpec and uses it as the engineering system for its own software. Another technical team can adopt the same system: the pages state the rules, and this context explains the defaults behind them.

One technical founder currently operates Litenova Solutions, so LiteSpec assumes technical contributors rather than separate departments. One person can hold product, domain, architecture, implementation, testing, release, and operations responsibilities at the same time. The system names each responsibility instead: a decision owner, an implementation owner, and an operations owner identify who answers for what, and one person can hold all three.

Agents perform a substantial part of the engineering work. An agent can inspect repositories, propose designs, edit authorized artifacts, run tools, and collect evidence. An agent never owns unresolved product policy, legal judgment, financial decisions, or risk acceptance; those stay with accountable people.

Because agents do so much execution, the system defines its technical concepts exactly. An agent tells a module from a business record, a journey from an event reaction, and an approved record from a claim the implementation makes about itself.

### Why the system exists

Two capable contributors can answer one request with different boundaries, names, transaction behavior, and verification. Each result can compile while the workspace loses a coherent model. The same happens with two agents, or with one agent on two different days.

The system addresses five recurring problems:

- Product intent is lost between a request and its implementation.
- An agent invents a missing rule when a record leaves a decision implicit.
- Standard technical concepts are renamed until developers no longer recognize the established pattern.
- A use case ships in one layer while persistence, public entry points, tests, or operating impact stay incomplete.
- Documentation claims behavior that code and automated evidence do not support.

The system makes the record durable and the agent replaceable: a different person, model, or tool continues from the same approved records and reaches the same required boundaries.

### Connected layers

The name has two parts. `Lite` means a consumer adopts one bounded context, one size, and its selected stacks, and nothing more. `Spec` means approved written records and provisions define the work, and agents and people build and verify against them.

The system holds one delivery approach and one operating model:

| Layer | Meaning | Concrete example |
|:---|:---|:---|
| LiteSpec | The complete system of standards, records, implementation, verification, operations, and release control. | The repository structure, provision IDs, templates, tests, runbooks, and release records. |
| Record-driven delivery | Approved records select work and define completion. | `use-case/orders.cancel-order` defines behavior before its Command, endpoint, and tests are accepted. |
| Agent-driven engineering | Agents perform substantial engineering execution within approved scope and report decisions they cannot make. | An agent loads the cancellation record, implements it, runs its checks, and reports an unknown refund policy. |

`Driven` means engineering work starts from an approved record, and completion is judged against that record. A record outlives one agent session in the workspace, which is what makes it more than a prompt.

`Agent-driven` describes who performs much of the execution. It never transfers business decision authority to the agent.

The rest of this section defines the concepts the provisions use. They form related groups rather than one hierarchy. The [glossary](../reference/glossary.md) defines each term in one sentence; the subsections below record the relationships and distinctions that a one-sentence definition cannot carry.

The first diagram names the parts of the model. The second shows how they relate:

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

### Product and journey

The product record, called the brief, names the users, the problems, the outcomes, the exclusions, the commercial constraints, and the operating context. It describes the business the software serves; it is not another name for the frontend application. [Product intent](product.md) states where each part of that intent lives.

A journey is the ordered path by which an actor reaches one observable product outcome. It begins at an accepted starting condition, crosses every required system boundary, and ends when the outcome is visible. The record lists its steps in order with what must exist before each step, and it can include actor decisions, branches, waiting periods, failures, and recovery. A journey covers one outcome, not every feature the product offers.

A journey links its use-case records instead of repeating their inputs and rules. In an online shop, `journey/checkout` connects stock reservation, order creation, payment start, and shipment dispatch. Order cancellation and payment reconciliation are separate journeys because they end at different outcomes.

### Domain and module

Orders, refunds, shipment delivery, money, and cancellation policy are domain concepts: the real-world knowledge the software models. HTTP, JSON serialization, database sessions, and queue clients are technical mechanisms that carry that knowledge. The [glossary](../reference/glossary.md) defines domain as the first group only.

The capitalized `Domain` project is the code layer that implements domain types and behavior. The business domain exists independently of that project. When the facts of a rule cross record or module boundaries, Domain or Application code can enforce it across business records.

In product discussion, a team says `Orders module`, and that name maps to `Domain/Orders`, `Application/Orders`, endpoint groups, frontend features, and tests. A module is still not any of the following:

- An assembly or deployment unit.
- A transaction boundary.
- One business record.
- A runtime base type or interface.

A module can hold no business record, one, or several related ones. Independent language, responsibility, or reasons to change point to separate modules. Each use case belongs to the business record whose folder holds its page.

### Use case, Command, and Query

A use case defines one independently testable goal: its trigger, input, permissions, result, rules, refusals, entry points, implementation impact, and operating impact. One top-level Command carries one command pipeline and one transaction commit. A Query reads a read model without changing business state.

The three names stay aligned without merging the three boundaries. In the orders module, `use-case/orders.cancel-order` is the use case, `CancelOrderCommand` is its Application message, and `OrderCancel` is the business-record action it runs.

Work that spans business records takes one of three shapes: a Command that reads several records and writes one, an event reaction, or a background job. A background job runs without an HTTP request, on a schedule or from a queue.

### Business record, root, state, and rule

A business record is one thing the product keeps consistent and changes in one step. It is not every type in a module: most domain types serve a record rather than being one. `Root` names the single type through which outside code changes the record, not an inheritance hierarchy for domain objects.

Developers who know domain-driven design can read `business record` as an aggregate. The record type is still named `business record` everywhere. Every business record models its lifecycle with one abstract `{Record}State` record and one or more sealed state records, even when the record has only one current state. In the running Expenses example, `business-record/spending.expense` carries the states `Submitted`, `Approved`, `Rejected`, and `Reimbursed`.

A rule states what holds for the record. An always-true rule cannot be false after a commit: `rule/order.capacity-limits-confirmation`, for example, limits confirmed and reserved quantities to capacity.

### Rules and permissions

Each rule states its kind: always true, checked before business behavior runs, or enforced across records. The kind decides how the rule is proved. Checked-before rules include message shape: required fields, lengths, and formats are checked before business behavior runs. A persistence constraint is an always-true rule the store enforces, such as a unique key. Each rule also states where it runs: validator, aggregate, store, guard, or reaction.

Access follows one chain: an actor holds a role at a scope, the role allows permissions, the use case needs permissions, and an entry point can offer fewer. Actor kinds are person, company, provider, system, and guest. A role scope is a kebab-case level the project names, such as `platform`, `tenant`, or `self`. Permissions come from one shared closed list.

### Event and event reaction

An event is an immutable statement that a business fact completed. Event names use past-tense forms such as `OrderConfirmed` and `ShipmentDispatched`. A reaction states the behavior an event causes without prescribing how the code runs it.

One reaction can map to an event handler, a projection, a Command that reads several records, or a background job. `OrderConfirmed` can cause the reaction `Dispatch shipment`, implemented as a background job rather than a class named `DispatchShipmentReaction`. The record names the causal relationship; the code chooses the mechanism.

Each reaction declares exactly one delivery classification:

- `atomic`: the reaction completes in the same transaction as the event.
- `durable`: the reaction is recorded beside the event and runs after the commit, retrying until it succeeds.
- `rebuildable`: a missed delivery is recovered by rebuilding the effect from its source records.
- `best-effort-optional`: the reaction can be skipped or lost without breaking a promise.

Use `atomic` for a required effect inside one consistency boundary, `durable` for one outside it, `rebuildable` for a derived view, and `best-effort-optional` only where no record needs the effect.

### Result, Case, and verification

A result names one way a use case ends: success, or a named refusal with its failure code. A case pairs one situation with the result it leads to.

An acceptance test proves a case only when its steps call the use case and assert the result. Acceptance tests prove use-case behavior; journey tests prove that connected use cases produce the release outcome through public boundaries.

### Authority and links

When records disagree about what should happen, the authority ladder decides: constraint first, then product, requirement, rule, and use case. A decision explains a choice behind a record; it is replaced, never edited. Research, examples, and prose carry no authority.

What is true today comes from code, screens, and test runs. When intent and reality disagree, the mismatch is a defect assigned to the owner of the higher record. A failing test reports the mismatch; it never settles what the record intended.

When two records at one level disagree, the record whose decision was approved later wins. Otherwise their shared owner decides.

Written links live on the record the link table names first: a decision decides a requirement, a rule fulfills one, a use case raises an event. The model builder computes the implementation links from code, routes, and test runs: which code implements which record, which screen calls which use case, and which test proves which case.

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

Every record has an owner and a status: draft, approved, or retired. A draft names its decider and a decide-by date. The table names each record type and where it lives.

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

People and systems reach the product through entry points: a web app, a public API, a CLI, an MCP server, a site, a reaction, or a job. Each use case declares the entry points that reach it, or names its background caller instead.

The model builder computes which screens call which use case from routes and generated clients, so no page maintains that mapping by hand.

### Scenario and reference cast

A scenario states one concrete occasion for the subject of a record: who acts, what surrounds them, and what they would do instead. It answers when the behavior happens, which no rule, state, or mapping table states.

A reference cast is the one record every scenario draws its people, place, dates, and amounts from. Without it, each page invents its own merchant and customer, and nothing carries between two pages read in sequence.

Both stay informative. A scenario illustrates its page and never governs it. When a scenario disagrees with the tables on its own page, the scenario is the part that is wrong.

## Standards

### Keep decision authority with accountable people

**Statement:** An agent MUST stop affected work and record the question in a draft decision when an unknown fact changes behavior, money, data, access, or recovery.

**Rationale:** Agents meet open questions in the middle of a task: an unknown refund policy, an unclear access rule, a missing recovery target. When the answer changes behavior, money, data, access, or recovery, only an accountable person can give it. Stopping and recording the question in a draft decision keeps the choice visible and owned, instead of buried in code nobody approved. Decision owners approve outcomes, terms, policies, criteria, commitments, and risk, and an agent contribution stays a proposal until one of them accepts it.

### Drive work from approved records

**Statement:** An agent MUST start behavior work from the approved use-case and module records, plus the product and journey records when they exist for the behavior.

**Rationale:** A prompt, ticket, chat message, or code comment can start work, but none of them holds the approved behavior. Starting from the owning records keeps the agent building what reviewers approved, and keeps the records as the lasting statement of what the code should do. Without this rule, each task reinterprets intent from its starting message, and the records drift from the code until nobody trusts either.

### Resolve authority by ladder

**Statement:** Authority MUST follow constraint, then product, requirement, rule, and use case in that order, with every record carrying an owner.

**Rationale:** Two records can each look right while saying different things. The ladder settles the tie without a meeting: the higher record wins, and its owner answers for the outcome. Without it, every conflict becomes a negotiation, and agents resolve ties by guessing.

### Write each record in its catalog shape

**Statement:** Every written record MUST use its catalog type, identifier form, home, owner, and status.

**Rationale:** One shape per type lets the model builder read every record the same way and lets a reader know where each fact lives. A record in the wrong home or with a free-form identifier drops out of computed links and checks. The failure is silent: the record looks written while the tools no longer see it.

### Declare each link on its source

**Statement:** Every written link MUST live on the record the link table names first, with every citation resolving to a written record.

**Rationale:** Links on the source keep each record readable alone: one page shows what it decides, fulfills, raises, and needs. Resolving citations keep the graph whole, so impact analysis and coverage stay trustworthy. A link kept on both ends drifts into two stories, and a citation to nothing breaks every query that follows it.

### Connect one product outcome through a journey

**Statement:** A journey MUST link its use-case records without repeating their content, and every public use case sits in a journey or names its background caller.

**Rationale:** A journey proves that connected use cases produce one observable outcome through public boundaries. It can cross modules and pass through branches, waiting, failure, and recovery. Linking instead of repeating keeps inputs, rules, refusals, and results in one home each: a repeated copy goes stale with the next edit. Naming a background caller for use cases no journey reaches separates scheduled and reactive work from operations nobody wired up.

**Example:** The running Expenses example connects submitting and reimbursing through `journey/submit-and-reimburse`, which links its use cases without repeating their inputs or rules:

```json
{
  "type": "journey",
  "id": "journey/submit-and-reimburse",
  "title": "Submit and reimburse",
  "owner": "expenses-team",
  "status": "approved",
  "actor": "actor/employee",
  "goal": "Submit an expense and receive reimbursement.",
  "steps": [
    { "useCase": "use-case/spending.submit-expense", "actor": "actor/employee", "requires": [] },
    { "useCase": "use-case/spending.attach-receipt", "actor": "actor/employee", "requires": [] },
    { "useCase": "use-case/spending.approve-expense", "actor": "actor/manager", "requires": [] }
  ]
}
```

The page shows three of the eight steps; each step names its use case and actor only, and the use-case pages keep the inputs, rules, and results, which satisfies this provision.

### Group language and use cases by module

**Statement:** A module name MUST be identical across documentation, Domain and Application folders, endpoint groups, frontend features, tests, and record identifiers.

**Rationale:** One name across every surface lets a reader and an agent move from a record to its code, endpoints, screens, and tests without a translation table. A module renamed in code but not in records splits the project into two vocabularies. The module stays a navigation and ownership boundary: it defines no transaction boundary and needs no runtime `Module` or `IModule` type.

### Make business-record ownership explicit

**Statement:** A module page MUST map each business record to its state, rules, and commands, with one record per command unless an approved record demands more.

**Rationale:** The mapping shows every transaction boundary in the module on one page: which commands change which record under which rules. One record per command keeps each commit small and each failure attributable. A command that quietly writes two records couples their lifecycles and hides the second write from reviewers.

### Deliver one complete use case

**Statement:** A use case MUST map to one Command or Query, complete only with Domain behavior, Application coordination, persistence, entry points, evidence, and operating impact.

**Rationale:** A use case is done only when a caller can run it and operations can support it: behavior, coordination, storage, entry points, automated evidence, and operating impact together, with a top-level Command or Query. Accepting a thinner slice leaves the missing layers for later, and later rarely itemizes what shipped half-built. Placeholder work, such as a handler that throws `NotImplementedException`, leaves the use case unimplemented. Multi-step product outcomes belong to a journey rather than stretching one use case across several goals.

**Example:** A use case whose handler throws `NotImplementedException` is not implemented.

### Compute use-case status from evidence

**Statement:** Use-case status MUST come from code, screens, and test runs: implemented when code implements it, verified when every Case passes its proof.

**Rationale:** A status a person writes by hand goes stale with the next commit and then misleads every plan built on it. Computed status cannot drift: the repository proves implemented through code and verified through passing proofs. Reviewers read the same status the tools computed, so the conversation starts from facts.

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

**Statement:** Every handler MUST resolve to one use case by the folder rule or one `implements` anchor, with every use case resolving back to its handler.

**Rationale:** The check exposes both failure directions. Code with no use case reads as a reviewed feature while no record approved it. A use case with no code states a plan in the present tense while nothing runs. Checking only one direction hides the other failure, so the rule requires both.

**Example:** `litespec model query use-case/orders.cancel-order` shows the handler the folder rule resolves.

### Name what calls a use case

**Statement:** A use case MUST declare the entry points it is reached through, or name its background caller with the reason no entry point reaches it.

**Rationale:** Routes point from code to use cases, which answers what a screen calls but not who breaks when an operation moves. The declared callers answer the question asked before every change: which entry points, schedules, or reactions depend on this operation. Writing down a real background caller separates wired-up reactive work from operations nobody reaches.

**Example:** A use case reached only by a reaction names that reaction as its caller.

```text
"reachedThrough": ["entry-point/webshop"]
```

### Declare event reaction delivery

**Statement:** An event reaction MUST declare exactly one delivery classification and deliver with it, never `best-effort-optional` when a record needs its effect.

**Rationale:** The classification states what a failure costs before it happens: rollback, retry, rebuild, or loss. Declaring exactly one forces the author to choose, and the implementation must honor the choice. A `best-effort-optional` label on an effect a record needs silently drops required behavior the first time delivery fails.

### State each rule with its kind

**Statement:** Each rule MUST state its kind, governed target, and enforcement point, keeping a negation word in its name when its statement says one.

**Rationale:** The kind decides how the rule is proved, the governed target names what it constrains, and the enforcement point names where it runs. Together they let a reviewer check the rule without opening every layer. Keeping a negation word in the name lets the name read as a true sentence: a rule whose statement says never but whose name drops the word reads as its own opposite.

**Example:** `rule/order.cancel-only-before-shipment` is a checked-before rule enforced by the validator.

### Grant access through roles and permissions

**Statement:** Access MUST flow from actor through role and permission to use case, with each link declared: holds, allows, needs, and offers.

**Rationale:** The chain gives every access decision one auditable path: which actor held which role at which scope, which permission the role allowed, and which use case needed it. A missing link breaks the audit: access granted outside the chain cannot be traced back to an owner. The hold names its scope so the same role grants different reach in different places.

### Model every business-record lifecycle with state records

**Statement:** A business-record page MUST map every business state to a sealed state record under one abstract state base.

**Rationale:** State-specific facts need a type that carries them: a rejected expense holds a reason that a reimbursed expense never needs. An enum, status string, boolean flag, or computed discriminator cannot carry those facts, so they pile onto the record as nullable fields valid in some states and meaningless in others. The rule holds from the first implementation, including a record with one current state, so the second state extends the hierarchy instead of replacing a flag.

### State one occasion for every behavior record

**Statement:** A module, business-record, use-case, or journey page MUST carry a `Scenario` section stating one concrete occasion for its subject.

**Rationale:** Every other section states a rule, a state, or a mapping; none says when the behavior happens or who is under pressure while it does. A reader who cannot place an operation in the world reads its rules as arbitrary constraints. An agent writing against it cannot tell an ordinary case from an exceptional one, and guesses where the pressure lies.

**Example:** A warehouse scan page states the hour, the parcel queue, and the handheld that lost signal before it states its failure codes.

### Keep a scenario informative

**Statement:** A `Scenario` section MUST NOT contain a record identifier.

**Rationale:** An identifier inside a scenario reads as a second definition of the record it names, and two definitions drift with the next edit. The section illustrates the page while the tables govern it. When the two disagree, the scenario is the part that is wrong, so nothing under it can carry authority.

**Example:** A scenario says Alex is refused because the last unit went to somebody else. The rules table carries the rule.

### Derive every scenario from one reference cast

**Statement:** A consumer MUST record one `scenario-cast` page and draw the people, place, dates, and amounts of every `Scenario` section from it.

**Rationale:** One cast makes a sequence of pages describe one occasion rather than many unrelated illustrations. The reader carries context from each page to the next instead of meeting a new cast on every page. The cast costs nothing to maintain because it names no code, and its figures come from the records.

**Example:** Alex, the customer who places the order in one record, is the person who receives the shipment in another.

### Update records with behavior

**Statement:** An observable behavior change MUST update its use-case page, implementation, tests, generated contracts, product citation, decision, journey, and operating records together.

**Rationale:** Approved records map to current names and paths only when each behavior change carries them along. A change that moves code but leaves the use-case page, contracts, or journey behind splits the project into approved fiction and unreviewed fact. Updating the records in the same change keeps the review of behavior and the review of its description in one place.

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

Create an optional directory only when its first real artifact exists. Never create empty directories or placeholder records during inception.

### Group module use-case files by business record

**Default:** Group module use-case files under a plural kebab-case business-record subdirectory, each holding that record's page, including a module with one business record.

**Replacement:** A consumer can replace this default with an approved exception record.

**Rationale:** A module page cannot carry the business-record page that `litespec/core/system#model-every-business-record-lifecycle-with-state-records` requires, so each record needs its own directory. Grouping use-case files under a plural kebab-case business-record subdirectory gives every record one home, including a module with one business record. The subdirectory costs one repeated path segment where the names coincide, as in `modules/products/products/`. The use-case identifier stays `use-case/<module>.<name>`; only the directory changes.

### Keep operational and security references under operations

**Default:** Keep operating and security reference prose under `docs/operations/`.

**Replacement:** A consumer can replace this default with an approved exception record.

**Rationale:** One home for operating and security reference prose means an on-call reader looks in `docs/operations/` first and finds the runbooks, limits, and inventories there. Scattering that prose across product and domain pages buries it where an incident never looks. Enforceable security and privacy rules still belong to their owning use-case sections and rules, since those are what the code and tests prove.

### Use established technical terms

**Default:** Use business record, aggregate, Command, Query, repository, projection, outbox, idempotency, and transaction with their accepted technical meanings.

**Replacement:** A consumer can replace this default with an approved exception record.

**Rationale:** Names such as aggregate, Command, repository, projection, outbox, idempotency, and transaction carry established meanings that developers and agents already share. Replacing one with a softer synonym hides the pattern and forces every reader to guess what the new word covers. When a term is unfamiliar, explain it and give an example instead of renaming it.

### Use ordinary capitalization in prose

**Default:** Write module, use case, journey, business record, rule, event, and decision as ordinary nouns in prose.

**Replacement:** A consumer can replace this default with an approved exception record.

**Rationale:** Lowercase module, use case, journey, business record, rule, event, and decision read as ordinary nouns, while exact record types and code types keep their declared capitalization. The contrast tells a reader whether a word names the concept or the artifact. Capitalizing both blurs that distinction on every page.

### Keep records readable without tooling

**Default:** Use JSON only for the frontmatter block, and write rules, results, cases, and examples in Markdown.

**Replacement:** A consumer can replace this default with an approved exception record.

**Rationale:** The person who owns a record's decisions reviews it as plain Markdown, not through a tool. JSON outside the frontmatter block turns rules, results, cases, and examples into data only developers read. Markdown keeps every part of the record reviewable by its owner.

### Bound a scenario to 120 words

**Default:** Keep a `Scenario` section within 120 words.

**Replacement:** A consumer can raise or lower the bound in `scenarioWordLimit` within `litespec.project.json`.

**Rationale:** A scenario longer than a paragraph becomes the page the reader reads instead of the tables, and it gathers detail that nothing verifies. The bound keeps the section an illustration: the tables carry the behavior, and the scenario carries the occasion in a few sentences.

## Reference example

This informative example demonstrates `litespec/core/system#connect-one-product-outcome-through-a-journey`, `litespec/core/system#declare-event-reaction-delivery`, and `litespec/core/system#make-business-record-ownership-explicit`.

The `journey/checkout` journey links four use cases without repeating their content: `use-case/catalog.reserve-stock`, `use-case/orders.create-order`, `use-case/payments.start-payment`, and `use-case/shipping.dispatch-shipment`. Order cancellation and payment reconciliation are separate journeys with their own outcomes.

The orders module holds two business records, `Order` and `OrderClaim`, each with its own transaction boundary. `use-case/orders.cancel-order` changes `Order` under `rule/order.cancel-only-before-shipment`, while `use-case/orders.claim-guest-order` changes `OrderClaim`. Their shared module name does not merge the two boundaries.

`OrderConfirmed` records a completed fact, and `Dispatch shipment` is its event reaction, declared `durable` so it retries after the commit. The record names the causal relationship without naming the class that runs it.

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
