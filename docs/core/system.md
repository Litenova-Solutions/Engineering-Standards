# Agentic Engineering System

## Intent


The Agentic Engineering System coordinates software work with agents as active engineering participants. It combines specifications, architecture standards, agent protocols, implementation conventions, tests, operating controls, and release records.

In this name:

- `Agentic` means agents can inspect context, reason about bounded work, change authorized artifacts, and run verification within explicit decision boundaries.
- `Engineering` covers the design, implementation, verification, deployment, operation, and evolution of software. It is broader than writing code.
- `System` means the parts work together and constrain one another. It does not mean a runtime framework, product dependency, or application service.

### Company context

Litenova Solutions authors and uses these standards as its engineering system for developing software. The system is general enough for another technical team to adopt; Litenova's company context defines the current defaults and explains the decisions in this repository.

Litenova Solutions is currently operated by one technical founder. The standards assume technical contributors. One person may hold product, domain, architecture, implementation, testing, release, and operations responsibilities at the same time.

The system names responsibilities without assuming separate departments or job titles. `Decision owner`, `implementation owner`, and `operations owner` identify accountability. They may identify the same person.

AI agents perform a substantial part of engineering work. They can inspect repositories, propose designs, edit authorized artifacts, run tools, and collect evidence. They do not own unresolved product policy, legal judgment, financial decisions, or risk acceptance.

Agent-led execution increases the need for explicit technical concepts. Agents distinguish modules from aggregates and end-to-end flows from workflows. They also distinguish approved specifications from implementation claims.

### Why the system exists

Without a shared engineering system, two capable contributors or agents can implement the same request with different boundaries, names, transaction behavior, and verification. Each local result may compile while the workspace loses a coherent model.

The system addresses five recurring problems:

- Product intent can be lost between a request and its implementation.
- Agents can invent missing rules when a specification leaves a decision implicit.
- Standard technical concepts can be renamed until developers no longer recognize the established pattern.
- A use case can be implemented in one layer while persistence, public entry points, tests, or operating impact remain incomplete.
- Documentation can claim behavior that code and automated evidence do not support.

The system makes the specification durable and the agent replaceable. A different person, model, or tool should be able to continue from the same approved records and obtain the same required boundaries.

### Three connected layers

The system contains one delivery approach and one operating model:

| Layer | Meaning | Concrete example |
|:---|:---|:---|
| Agentic Engineering System | The complete system of standards, specifications, implementation, verification, operations, and release control. | The repository structure, provision IDs, templates, tests, runbooks, and release records. |
| Specification-Driven Delivery | Approved specifications select work and define completion. | `orders.cancel-order` defines behavior before its Command, endpoint, and tests are accepted. |
| Agent-Driven Engineering | Agents perform substantial engineering execution within approved scope and report decisions they cannot make. | An agent loads the cancellation specification, implements it, runs its checks, and reports an unknown refund policy. |

`Driven` means engineering work starts from an approved specification and completion is judged against it. A specification is more than a prompt because it remains in the workspace after one agent session ends.

`Agent-driven` describes who performs much of the execution. It does not transfer business decision authority to the agent.

## Agent Summary {#agent-summary}


- Agents stop and ask when a decision belongs to a person. (CORE.SYSTEM.AUTHORITY.001)
- Approved specifications define the work, and each one situates its subject. (CORE.SYSTEM.SPECIFICATION.001, CORE.SYSTEM.SCENARIO.001)
- Flows link their use cases rather than restate them. (CORE.SYSTEM.FLOW.001)
- One module name is used across every layer. (CORE.SYSTEM.MODULE.001)
- Module specifications map aggregates to state, invariants, and commands. (CORE.SYSTEM.AGGREGATE.001)
- One use case is one Command or Query, with a status and one specification. (CORE.SYSTEM.USECASE.001, CORE.SYSTEM.USECASE.002, CORE.SYSTEM.COVERAGE.001)
- Workflow specifications name state, triggers, recovery, and owner. (CORE.SYSTEM.WORKFLOW.001)
- Every event reaction declares its delivery classification. (CORE.SYSTEM.REACTION.001)
- Domain rule IDs encode their enforcement classification. (CORE.SYSTEM.RULES.001)
- Specifications map each business state to a state record. (CORE.SYSTEM.STATE.001)

## Concepts

The system uses related concepts rather than one hierarchy:

```text
Product
  defines scope, outcomes, and operating constraints

Domain
  contains the business language, rules, state, and behavior

Module
  groups related language, use cases, aggregates, and code

End-to-End Flow
  connects use cases to one observable product outcome
  can appear in a release record

Use Case
  defines one independently testable Command or Query goal

Workflow
  coordinates system-controlled work across transactions or time

Workflow Orchestrator
  stores workflow progress and selects the next Command

Aggregate
  protects invariants and state changed in one transaction

Event
  records a completed fact

Event Reaction
  defines behavior caused by an Event

Acceptance Criterion
  defines one observable Use Case result

Acceptance Test
  proves one or more Acceptance Criteria

End-to-End Test
  proves one complete End-to-End Flow through public boundaries
```

The central relationships are:

```text
Product outcome
  End-to-End Flow
    Use Cases
      Acceptance Criteria
      Acceptance Tests
    End-to-End Tests

Domain
  Modules
    Use Cases
    Aggregates
      Aggregate States
      Aggregate Invariants
  Domain Policies
  Workflows

Workflow
  Workflow Orchestrator
    receives Events
    issues Commands

Command
  normally changes one Aggregate

Query
  reads a Read Model
```

The [glossary](../reference/glossary.md) defines each term below. This section records the relationships and distinctions that a one-sentence definition cannot carry.

### Product and end-to-end flow

A product specification names users, problems, outcomes, exclusions, commercial constraints, and operating context. It is not a synonym for the frontend application.

An end-to-end flow begins at an accepted starting condition, crosses every required system boundary, and ends at one observable product outcome. It does not mean every possible product feature. The record may include actor decisions, branches, waiting periods, failures, and recovery.

A flow links existing use-case specifications instead of repeating their inputs and rules. For an event platform, `event-sales` can connect ticket reservation, guest order creation, payment confirmation, and ticket issue. Event cancellation and payment reconciliation are separate flows.

### Domain and module

Orders, refunds, ticket admission, money, and cancellation policy are domain concepts. HTTP, JSON serialization, database sessions, and queue clients are technical mechanisms.

The capitalized `Domain` project is the code layer that implements domain types and behavior. The business domain exists independently of that project. A domain policy may be enforced by Domain or Application code when its facts cross aggregate or module boundaries.

`Orders module` is natural in product discussion and maps to `Domain/Orders`, `Application/Orders`, endpoint groups, frontend features, and tests. A module is not automatically:

- An assembly or deployment unit.
- A transaction boundary.
- One aggregate.
- A runtime base type or interface.

A module may contain no aggregate, one aggregate, or multiple related aggregates. Independent language, responsibility, or change reasons indicate separate modules.

### Use case, Command, and Query

A use case owns its trigger, input, authorization, result, rules, failures, acceptance criteria, entry points, implementation impact, and operating impact.

One top-level Command owns one command pipeline and one transaction commit. A Query reads a Read Model without changing business state.

`orders.cancel-order` is a use case. `CancelOrderCommand` is its Application message. `Order.Cancel` is its aggregate action. These names stay aligned without treating the use case, Command, and aggregate as one boundary.

### Workflow and workflow orchestrator

A workflow exists when the system remembers progress, awaits an event or time, retries work, handles duplicate delivery, compensates, or exposes operator recovery.

`Orchestrator` means the component selects and schedules the next action. It does not perform every action itself. It receives facts, updates workflow state, issues the next Command, records retries and timeouts, and exposes failures needing an operator.

Process Manager and orchestration-based Saga are industry mappings for this pattern. The system uses `Workflow Orchestrator` because the name identifies both the business record and its technical responsibility.

### Aggregate, root, state, and invariant

An aggregate is not every entity in a module. `Root` identifies the mutation entry point, not an inheritance hierarchy for every domain object.

Every aggregate uses one abstract `{Aggregate}State` record and one or more sealed state records, including an aggregate with one current state.

An invariant cannot be temporarily false after commit. `INV-INVENTORY-01`, for example, limits confirmed and reserved quantities to capacity.

### Domain policy and other rule types

A domain policy belongs to the business domain but is not owned by one aggregate invariant. It may apply within one module or across modules.

A refund limit based on provider-confirmed captured money may require facts from Orders, Payments, and Refunds. The policy names its owner, consistency requirement, enforcement point, failure behavior, and verification.

The system classifies rules by where they are enforced:

| Term | Word-level meaning | Technical ownership |
|:---|:---|:---|
| Validation Rule | `Validation` checks message shape or format before business behavior runs. | Command or Query validator |
| Authorization Policy | `Authorization` decides whether an identified actor may act on a target. | Application policy and target authorization |
| Aggregate Invariant | `Invariant` holds after every aggregate transaction. | Aggregate root and owned objects |
| Domain Policy | `Domain` places the policy in business behavior; `Policy` selects or limits behavior from facts. | Domain or Application policy component |
| Workflow Rule | Controls when a workflow advances, waits, retries, compensates, fails, or needs an operator. | Workflow Orchestrator |
| Persistence Constraint | `Persistence` means stored data; `Constraint` means the store rejects an invalid value or relationship. | Database or document-store configuration |

### Event and event reaction

Event names use past-tense forms such as `OrderConfirmed` and `TicketIssued`. `Reaction` states the causal relationship without prescribing the implementation.

A reaction may map to an event handler, workflow orchestrator, projection, or scheduled job. `OrderConfirmed` may cause the reaction `Issue tickets`, implemented as a durable workflow rather than a class named `IssueTicketsReaction`.

### Acceptance and end-to-end verification

An acceptance test cites the exact criterion identifier. The test name remains free to describe its specific case.

Acceptance tests prove use-case behavior. End-to-end tests prove that connected use cases produce the release outcome.

### Scenario and reference cast

A scenario is one concrete occasion for the subject of a specification: who acts, what surrounds them, and what they would do instead. It answers when the behavior happens, which no rule, state, or mapping table states.

A reference cast is the one record every scenario draws its people, place, dates, and amounts from. Independent scenarios invent an organization and a buyer for each page, so nothing carries between two pages read in sequence.

Both are informative. A scenario illustrates its page and never governs it. A scenario that disagrees with the page it sits on is the part that is wrong.

## Standards


### Keep decision authority with accountable people (CORE.SYSTEM.AUTHORITY.001)

**Requirement:** An agent MUST stop affected work and record the question when an unknown fact changes behavior, authorization, money movement, data handling, or recovery.

**Rationale:** Decision owners approve outcomes, terms, policies, criteria, commitments, and risk. An agent contribution stays a proposal until an accountable person accepts it.

### Drive work from approved specifications (CORE.SYSTEM.SPECIFICATION.001)

**Requirement:** An agent MUST start behavior work from the approved product, flow, module, and use-case specifications rather than from a prompt alone.

**Rationale:** A prompt, ticket, chat message, or code comment can initiate work. The owning specification records the approved behavior, and code does not silently replace it.

### Connect one product outcome through an end-to-end flow (CORE.SYSTEM.FLOW.001)

**Requirement:** An end-to-end flow MUST link its use-case specifications without repeating their inputs, rules, failures, or acceptance criteria.

**Rationale:** A flow can cross modules and include branches, waiting, failure, and recovery. Its tests use `E2E-{FLOW}-{NN}`, and a verified flow has at least one passing deployed test.

### Group language and use cases by module (CORE.SYSTEM.MODULE.001)

**Requirement:** A module name MUST be identical across documentation, Domain and Application folders, endpoint groups, frontend features, tests, and acceptance identifiers.

**Rationale:** A module is a navigation and ownership boundary. It defines no transaction boundary and needs no runtime `Module` or `IModule` type.

### Make aggregate ownership explicit (CORE.SYSTEM.AGGREGATE.001)

**Requirement:** A module specification MUST map each aggregate to the state it owns, its invariants, and the commands that change it.

**Rationale:** A command normally changes one aggregate. Changing several atomically requires an approved record naming the invariant or domain policy that demands it.

### Deliver one complete use case (CORE.SYSTEM.USECASE.001)

**Requirement:** A use case MUST map to one top-level Command or Query and reach `verified` only when every layer and its evidence are complete.

**Rationale:** Multi-step product outcomes belong to an end-to-end flow, and autonomous multi-transaction progress belongs to a workflow. Placeholder work leaves the use case `planned`.

**Example:** A use case whose handler throws `NotImplementedException` stays `planned`.

### State implemented before acceptance evidence exists (CORE.SYSTEM.USECASE.002)

**Requirement:** A use case whose Domain behavior, coordination, persistence, and entry point all exist without proving acceptance criteria MUST carry `implemented`.

**Rationale:** `planned` and `verified` describe the two ends. Working code with unproven acceptance criteria is the ordinary middle state, and leaving it undefined makes the value a matter of taste.

**Example:** Aligned identifiers and implementation names have this shape:

```text
Use case:       orders.cancel-order
Command:        CancelOrderCommand
Result:         CancelOrderCommandResult
Handler:        CancelOrderCommandHandler
Aggregate call: Order.Cancel
Event reference: orders.order-cancelled
Event type:     OrderCancelled
Endpoint:       CancelOrderEndpoint
Acceptance ID:  AC-ORDERS-CANCEL-ORDER-01
```

A use case reaches `verified` only after Domain behavior, coordination, persistence, entry points, evidence, and operating impact are complete. Placeholder work leaves the use case `planned`.

### Keep specifications and use cases in one-to-one correspondence (CORE.SYSTEM.COVERAGE.001)

**Requirement:** Every implemented use case MUST resolve to exactly one use-case specification that resolves back to it.

**Rationale:** Neither direction is visible without the check. Code with no specification reads as a reviewed feature and is not one. A specification with no code states a plan in the present tense.

**Example:** `node standards/tools/validate-parity.mjs` reports both directions.

```text
FAIL (2 problem(s)):
  - handler with no specification: Application/Sales/Vouchers/RedeemVoucher -> sales.redeem-voucher
  - specification with no handler: docs/domain/modules/sales/vouchers/void-voucher.md
```

### Specify autonomous progress as a workflow (CORE.SYSTEM.WORKFLOW.001)

**Requirement:** A workflow specification MUST name its owner, participating modules, starting fact, completion and failure conditions, durable state, commands, awaited events, retries, and operator actions.

**Rationale:** System-controlled progress crossing a transaction or time boundary needs each of these. Branches inside one atomic command stay in the use-case handler.

### Record events and event reactions separately (CORE.SYSTEM.REACTION.001)

**Requirement:** An event reaction MUST declare one delivery classification of `atomic`, `durable`, `rebuildable`, or `best-effort-optional`.

**Rationale:** A required projection refresh is never `best-effort-optional`. Domain events are internal facts, and integration events are versioned contracts leaving the context.

### Classify domain rules by enforcement boundary (CORE.SYSTEM.RULES.001)

**Requirement:** A domain rule ID MUST carry the prefix of its enforcement classification, keeping that number for the life of the rule.

**Rationale:** The classifications are aggregate invariant, domain policy, validation rule, authorization policy, persistence constraint, and workflow rule. A failure code is not a domain rule ID.

### Model every aggregate lifecycle with state records (CORE.SYSTEM.STATE.001)

**Requirement:** An aggregate specification MUST map every business state to a sealed state record under one abstract `{Aggregate}State` base.

**Rationale:** This holds from the first implementation, including an aggregate with one current state. An enum, status string, boolean flag, or computed discriminator cannot carry state-specific facts.

### State one occasion for every behavior specification (CORE.SYSTEM.SCENARIO.001)

**Requirement:** A module, aggregate, use-case, domain-policy, or end-to-end-flow specification MUST carry a `Scenario` section stating one concrete occasion for its subject.

**Rationale:** Every other section states a rule, a state, or a mapping. None of them says when the behavior happens, or who is under pressure while it does. A reader who cannot place an operation in the world reads its rules as arbitrary constraints. An agent writing against it cannot tell an ordinary case from an exceptional one.

**Example:** A door specification states the hour, the queue, and the scanner that lost signal before it states its failure codes.

### Keep a scenario informative (CORE.SYSTEM.SCENARIO.002)

**Requirement:** A `Scenario` section MUST NOT contain a domain rule, acceptance, or end-to-end identifier.

**Rationale:** An identifier inside a scenario reads as a second definition of the rule it names, and two definitions drift. The section illustrates the page, so a scenario that contradicts the page's own tables is the part that is wrong.

**Example:** A scenario says the buyer is refused because the last place went to somebody else, and the rules table says `INV-INVENTORY-01`.

### Derive every scenario from one reference cast (CORE.SYSTEM.SCENARIO.003)

**Requirement:** A consumer MUST record one `scenario-cast` specification and draw the people, place, dates, and amounts of every `Scenario` section from it.

**Rationale:** One cast makes a sequence of pages describe one occasion rather than many unrelated illustrations. The reader carries context from each page to the next. The cast costs nothing to maintain because it names no code, and its figures come from the specifications.

**Example:** The buyer who places the order in one specification is the person at the gate in another.

### Declare Specification Metadata (CORE.SYSTEM.METADATA.001)

**Requirement:** A structured specification MUST open with one JSON metadata block declaring at least `kind`, `id`, `specStatus`, `owner`, and `lastReviewed`.

**Rationale:** A behavior specification also declares `implementationStatus`. An index, decision, evidence, limits, or policy record declares none, because it claims no implemented behavior.

### Select extensions before applying them (CORE.SYSTEM.EXTENSIONS.001)

**Requirement:** A local extension MUST appear in `applicableExtensions` only on a specification kind that its manifest entry allows.

**Rationale:** `selectedExtensions` in `standards.project.json` is the project allow-list, and selection alone permits dependencies and structure.

### Exclude a project-scoped extension from local metadata (CORE.SYSTEM.EXTENSIONS.002)

**Requirement:** A project-scoped extension MUST NOT appear in the `applicableExtensions` list of any specification.

**Rationale:** Selection in `standards.project.json` already applies it everywhere, so a local listing implies a scope it does not have.

### Give acceptance criteria stable ownership (CORE.SYSTEM.ACCEPTANCE.001)

**Requirement:** An acceptance criterion identifier MUST use `AC-{MODULE}-{USE-CASE}-{NN}` with segments matching its owning use-case identifier.

**Rationale:** The numeric suffix starts at `01` and uses two digits. An acceptance test cites the identifier without redefining its text.

**Example:** One owning use-case specification can define a criterion:

```text
[AC-ORDERS-CANCEL-ORDER-01] An authorized buyer can cancel an unpaid order.
```

Acceptance tests reference the ID without redefining its text. A static documentation check proves that the reference exists. A passing test provides execution evidence.

### Update specifications with behavior (CORE.SYSTEM.SYNC.001)

**Requirement:** An observable behavior change MUST update its use-case specification, implementation, tests, generated contracts, affected flow, workflow, and operating records together.

**Rationale:** Approved metadata then maps to current names and paths. A retired specification never remains a public entry point.

## Conventions


### Use this consumer documentation layout (CORE.SYSTEM.CONVENTION.001)

**Default:** Use the consumer documentation layout in this section, creating a directory only when its first real artifact exists.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Example:**

```text
docs/
  product/
    brief.md
    flows/
      event-sales.md
  domain/
    README.md
    glossary.md
    scenarios.md
    modules/
      README.md
      orders/
        README.md
        cancel-order.md
      audience/
        README.md
        buyer-accounts/
          claim-guest-order.md
        consents/
          grant-consent.md
    workflows/
      order-fulfillment.md
    policies/
      refund-limit.md
  decisions/
  operations/
    limits.md
    security-and-privacy.md
  runbooks/
  releases/
  research/
```

The example creates an optional directory only when its first real artifact is added. The example does not create empty directories or placeholder records during inception.

### Group module use-case files by aggregate root (CORE.SYSTEM.CONVENTION.002)

**Default:** Group module use-case files under a plural kebab-case aggregate subdirectory, each holding one `kind: aggregate` README, including a module with one aggregate root.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A module README carries `kind: module`, and one file cannot carry two kinds. A flat module therefore has nowhere to put the aggregate specification that `CORE.SYSTEM.STATE.001` requires. The subdirectory costs one repeated path segment where the names coincide, as in `modules/products/products/`. The use-case identifier stays `{module}.{name}`, so only the directory changes.

### Keep operational and security references under operations (CORE.SYSTEM.CONVENTION.003)

**Default:** Keep operating and security reference prose under `docs/operations/`, with `limits.md` as its only structured record.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Enforceable security and privacy rules still belong to their owning use-case authorization sections and domain policies.

### Use established technical terms (CORE.SYSTEM.CONVENTION.004)

**Default:** Use aggregate, invariant, Command, Query, repository, projection, outbox, idempotency, transaction, and orchestrator with their accepted technical meanings.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Replacing a precise term with a softer synonym hides the established pattern. Explain the term and give an example instead.

### Use ordinary capitalization in prose (CORE.SYSTEM.CONVENTION.005)

**Default:** Write module, use case, workflow, aggregate, invariant, event, and policy as ordinary nouns in prose.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Exact schema kinds and code types keep their declared capitalization, so the distinction stays meaningful.

### Keep specifications readable without tooling (CORE.SYSTEM.CONVENTION.006)

**Default:** Use JSON only for the metadata block, and write outcomes, rules, failures, examples, and mappings in Markdown.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A specification that needs tooling to read stops being reviewable by the person who owns its decisions.

### Bound a scenario to one paragraph (CORE.SYSTEM.CONVENTION.007)

**Default:** Keep a `Scenario` section within 120 words.

**Replacement:** A consumer can raise or lower the bound in `scenarioWordLimit` within `standards.project.json`.

**Rationale:** A scenario that grows past a paragraph becomes the page a reader reads instead of the tables, and it acquires detail that nothing verifies.

## Reference example

This informative example demonstrates `CORE.SYSTEM.FLOW.001`, `CORE.SYSTEM.WORKFLOW.001`, and `CORE.SYSTEM.REACTION.001`.

The `event-sales` end-to-end flow links `inventory.reserve-tickets`, `orders.create-guest-order`, `payments.start-payment`, and `tickets.issue-ticket`. The `payment-fulfillment` workflow begins with provider confirmation, issues one inventory confirmation Command, awaits its event, and then issues the ticket Command. Each Command owns one transaction. `E2E-EVENT-SALES-01` verifies the connected outcome through the deployed API.

The Orders module contains `Order` and `OrderClaim`. `orders.cancel-order` changes `Order` and cites `INV-ORDERS-01`. `orders.claim-guest-order` changes `OrderClaim` and cites `INV-ORDERS-04`. Their shared module name does not merge their transaction boundaries.

`OrderConfirmed` records a completed fact. `Issue tickets` is its event reaction. A durable `OrderFulfillmentWorkflowOrchestrator` may implement that reaction by issuing `IssueTicketCommand`. The specification does not require a class named `IssueTicketsReaction`.

## Verification


| ID | Method | Evidence |
|:---|:---|:---|
| CORE.SYSTEM.AUTHORITY.001 | inspection | The change report names the recorded question and the accountable person for each unresolved decision. |
| CORE.SYSTEM.SPECIFICATION.001 | inspection | The change report cites the approved specification that authorized each behavior change. |
| CORE.SYSTEM.FLOW.001 | inspection | `node standards/tools/validate-consumer.mjs` resolves each flow use case to its file and rejects a duplicate end-to-end identifier. |
| CORE.SYSTEM.MODULE.001 | inspection | `node standards/tools/validate-consumer.mjs` resolves each module reference to one declared module directory. |
| CORE.SYSTEM.AGGREGATE.001 | inspection | The module specification carries an aggregate table naming owned state, invariant identifiers, and commands. |
| CORE.SYSTEM.USECASE.001 | inspection | `node standards/tools/validate-consumer.mjs` resolves each use-case identifier to one operation type and its declared entry points. |
| CORE.SYSTEM.USECASE.002 | inspection | Each `implemented` use case resolves to existing Domain, Application, persistence, and entry-point code with no acceptance test. |
| CORE.SYSTEM.COVERAGE.001 | static | `node standards/tools/validate-parity.mjs` reports no handler without a specification and no specification without a handler. |
| CORE.SYSTEM.WORKFLOW.001 | inspection | `node standards/tools/validate-consumer.mjs` resolves each workflow module reference and the template requires the named sections. |
| CORE.SYSTEM.REACTION.001 | inspection | The owning specification records one delivery classification for each event reaction. |
| CORE.SYSTEM.RULES.001 | inspection | `node standards/tools/validate-consumer.mjs` rejects a domain rule ID whose prefix does not match its declared classification. |
| CORE.SYSTEM.STATE.001 | inspection | The aggregate specification carries a state mapping table, and `ArchitectureTests` asserts the code matches it. |
| CORE.SYSTEM.SCENARIO.001 | static | `node standards/tools/validate-consumer.mjs` fails a module, aggregate, use-case, domain-policy, or end-to-end-flow page carrying no `Scenario` section. |
| CORE.SYSTEM.SCENARIO.002 | static | `node standards/tools/validate-consumer.mjs` fails a `Scenario` section containing an `INV-`, `POL-`, `VAL-`, `AC-`, or `E2E-` identifier. |
| CORE.SYSTEM.SCENARIO.003 | static | `node standards/tools/validate-consumer.mjs` fails a documentation set holding no `scenario-cast` specification or more than one. |
| CORE.SYSTEM.METADATA.001 | inspection | `node standards/tools/validate-consumer.mjs` validates each metadata block against `schemas/specification-metadata.schema.json`. |
| CORE.SYSTEM.EXTENSIONS.001 | inspection | `node standards/tools/validate-consumer.mjs` rejects a project-scoped extension in local metadata and a local extension on an excluded kind. |
| CORE.SYSTEM.EXTENSIONS.002 | static | `node standards/tools/validate-consumer.mjs` rejects a project-scoped extension listed in local metadata. |
| CORE.SYSTEM.ACCEPTANCE.001 | inspection | `node standards/tools/validate-consumer.mjs` rejects a duplicate acceptance identifier and one whose segments miss its use case. |
| CORE.SYSTEM.SYNC.001 | inspection | The change report links each changed implementation surface to the records updated in the same change. |
| CORE.SYSTEM.CONVENTION.001 | inspection | Documentation tree review compares the consumer layout against this section, or records a named local replacement. |
| CORE.SYSTEM.CONVENTION.002 | inspection | `node standards/tools/validate-consumer.mjs` resolves each use case in its module or one aggregate subdirectory. |
| CORE.SYSTEM.CONVENTION.003 | inspection | Documentation review confirms operating and security prose resolves under `docs/operations/`. |
| CORE.SYSTEM.CONVENTION.004 | inspection | Terminology review compares each new term against the glossary and this list. |
| CORE.SYSTEM.CONVENTION.005 | inspection | Prose review confirms ordinary nouns outside sentence starts, titles, and exact identifiers. |
| CORE.SYSTEM.CONVENTION.006 | inspection | Specification review confirms JSON appears only in the opening metadata block. |
| CORE.SYSTEM.CONVENTION.007 | static | `node standards/tools/validate-consumer.mjs` fails a `Scenario` section longer than `scenarioWordLimit`, defaulting to 120 words. |
