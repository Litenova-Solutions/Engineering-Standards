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

Without a shared engineering system, two capable contributors or agents can implement the same request with different boundaries, names, transaction behavior, and verification. Each local result may compile while the repository loses a coherent model.

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
| Agentic Engineering System | The complete system of standards, specifications, implementation, verification, operations, and release control. | The repository structure, rule IDs, templates, tests, runbooks, and release records. |
| Specification-Driven Delivery | Approved specifications select work and define completion. | `orders.cancel-order` defines behavior before its Command, endpoint, and tests are accepted. |
| Agent-Driven Engineering | Agents perform substantial engineering execution within approved scope and report decisions they cannot make. | An agent loads the cancellation specification, implements it, runs its checks, and reports an unknown refund policy. |

`Specification` means an approved, versioned statement of required behavior or constraint. `Driven` means engineering work starts from that statement and completion is judged against it. A specification is more than a prompt because it remains in the repository after one agent session ends.

`Agent` means a software system that can inspect context, reason about a bounded task, change repository artifacts, and run verification under delegated authority. `Agent-driven` describes who performs much of the execution. It does not transfer business decision authority to the agent.

## Agent Summary {#agent-summary}


- Keep decision authority with accountable people. (AGENTIC.AUTHORITY.001)
- Drive work from approved specifications. (AGENTIC.SPECIFICATION.001)
- Connect one product outcome through an end-to-end flow. (AGENTIC.FLOW.001)
- Group language and use cases by module. (AGENTIC.MODULE.001)
- Make aggregate ownership explicit. (AGENTIC.AGGREGATE.001)
- Deliver one complete use case. (AGENTIC.USECASE.001)
- Specify autonomous progress as a workflow. (AGENTIC.WORKFLOW.001)
- Record events and event reactions separately. (AGENTIC.REACTION.001)
- Classify rules by enforcement boundary. (AGENTIC.RULES.001)
- Model every aggregate lifecycle with state records. (AGENTIC.STATE.001)

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

### Product and end-to-end flow

`Product` means the software capability offered to users together with its supported operating boundary. A product specification names users, problems, outcomes, exclusions, commercial constraints, and operating context. It is not a synonym for the frontend application.

`End-to-end flow` connects use cases from a starting condition to an observable product outcome. A flow can contain ordered steps, branches, waiting, failure, and recovery.

For an event platform, `event-sales` can be an end-to-end flow. Event cancellation and payment reconciliation can be separate flows.

### Domain and module

`Domain` means the area of real-world knowledge and rules that the software models. Orders, refunds, ticket admission, money, and cancellation policy are domain concepts. HTTP, JSON serialization, database sessions, and queue clients are technical mechanisms.

The capitalized `Domain` project is the code layer that implements domain types and behavior. The business domain exists independently of that project. A domain policy may be enforced by Domain or Application code when its facts cross aggregate or module boundaries.

`Module` means a cohesive area of the domain used to organize language, specifications, code, and ownership. `Orders module` is natural in product discussion and maps to `Domain/Orders`, `Application/Orders`, endpoint groups, frontend features, and tests.

A module is not automatically:

- An assembly or deployment unit.
- A transaction boundary.
- One aggregate.
- A runtime base type or interface.

A module may contain no aggregate, one aggregate, or multiple related aggregates. Independent language, responsibility, or change reasons indicate separate modules.

### End-to-end flow

`End-to-end` means the path begins at an accepted starting condition, crosses every required system boundary, and ends at an observable product outcome. It does not mean every possible product feature.

`Flow` means the record may include actor decisions, system steps, branches, waiting periods, failures, and recovery. An end-to-end flow connects existing use-case specifications instead of repeating their inputs and rules.

For example, `event-sales` can connect ticket reservation, guest order creation, payment confirmation, ticket issue, and delivery. Its end-to-end test calls the deployed public boundary and observes the completed sale.

### Use case, Command, and Query

`Use case` means one independently testable goal for an actor or system. It owns its trigger, input, authorization, result, rules, failures, acceptance criteria, entry points, implementation impact, and operating impact.

A `Command` is an Application message that may change business state. One top-level Command owns one command pipeline and one transaction commit. A `Query` reads a Read Model without changing business state.

`orders.cancel-order` is a use case. `CancelOrderCommand` is its Application message. `Order.Cancel` is its aggregate action. These names remain aligned without treating the use case, Command, and aggregate as the same boundary.

### Workflow and workflow orchestrator

`Workflow` means system-controlled progress that crosses a transaction or time boundary. It exists when the system remembers progress, awaits an event or time, retries work, handles duplicate delivery, compensates, or exposes operator recovery.

`Workflow Orchestrator` names the component that owns durable workflow progress. `Orchestrator` means it selects and schedules the next action. It does not perform every action itself. It receives facts, updates workflow state, issues the next Command, records retries and timeouts, and exposes failures that require an operator.

Process Manager and orchestration-based Saga are industry mappings for this pattern. The system uses `Workflow Orchestrator` because the name identifies both the business record and its technical responsibility.

### Aggregate, root, state, and invariant

`Aggregate` means a cluster of domain objects changed as one transactional consistency boundary. `Aggregate` does not mean every entity in a module.

`Aggregate root` means the only object through which external code may change the aggregate. `Root` identifies the mutation entry point, not an inheritance hierarchy for every domain object.

`Aggregate state` means the complete lifecycle condition of the aggregate. Every aggregate uses one abstract `{Aggregate}State` record and one or more sealed state records, including an aggregate with one current state.

`Aggregate invariant` means a rule remaining true after every transaction that changes the aggregate. `Invariant` means the rule cannot be temporarily false after commit. `INV-INVENTORY-01`, for example, limits confirmed and reserved quantities to capacity.

### Domain policy and other rule types

`Policy` means an approved rule that selects, permits, limits, or requires behavior from known facts. `Domain Policy` means the policy belongs to the business domain but is not owned by one aggregate invariant. It may apply within one module or across modules.

For example, a refund limit based on provider-confirmed captured money may require facts from Orders, Payments, and Refunds. The policy names its owner, consistency requirement, enforcement point, failure behavior, and verification.

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

`Event` means an immutable statement that a relevant fact completed. Event names use past-tense forms such as `OrderConfirmed` and `TicketIssued`.

`Event Reaction` means behavior caused by an event. `Reaction` states the causal relationship without prescribing the implementation. A reaction may map to an event handler, workflow orchestrator, projection, or scheduled job.

For example, `OrderConfirmed` may cause the reaction `Issue tickets`. The implementation may be a durable workflow rather than a class named `IssueTicketsReaction`.

### Acceptance and end-to-end verification

`Acceptance Criterion` means one observable condition required for a use case to be accepted. Criteria use stable `AC-{MODULE}-{USE-CASE}-{NN}` IDs.

`Acceptance Test` means automated executable evidence for one or more acceptance criteria. A test cites the exact criterion ID. The test name remains free to describe its specific case.

`End-to-End Test` means an automated test that verifies a complete end-to-end flow through deployed public boundaries and real required infrastructure. End-to-end test IDs use `E2E-{FLOW}-{NN}`.

Acceptance tests prove use-case behavior. End-to-end tests prove that connected use cases produce the release outcome.

## Standards


### Keep decision authority with accountable people (AGENTIC.AUTHORITY.001)

**Requirement:** Consumer specifications MUST keep decision authority with accountable people.

**Rationale:** Decision owners approve product outcomes, Domain terms, policies, acceptance criteria, external commitments, and risk acceptance. Agents can propose missing language, examples, and mappings. Those contributions remain proposals until the accountable person accepts them.

When an unknown fact changes observable behavior, authorization, money movement, data handling, or recovery, record the question and stop the affected work. The implementation does not infer the answer from code structure or a neighboring use case.

### Drive work from approved specifications (AGENTIC.SPECIFICATION.001)

**Requirement:** Consumer specifications MUST drive work from approved specifications.

**Rationale:** An approved specification is the authoritative source for its scope. An agent starts behavior work from the active product context, end-to-end flow, module language, use-case specification, decisions, selected profile, and applicable extensions.

Prompts, tickets, chat messages, and code comments can initiate work. The owning specification records approved behavior. Code does not silently replace an approved specification.

### Connect one product outcome through an end-to-end flow (AGENTIC.FLOW.001)

**Requirement:** Consumer specifications MUST connect one product outcome through an end-to-end flow.

**Rationale:** An end-to-end flow connects use cases from a starting condition to one observable product outcome. It can include actor choices, system work, branches, waiting, failures, and recovery. It can cross modules.

An end-to-end flow links its use-case specifications without copying inputs, rules, failures, or acceptance criteria.

An end-to-end test uses `E2E-{FLOW}-{NN}`. For `event-sales`, valid IDs begin with `E2E-EVENT-SALES-`. An end-to-end flow with `implementationStatus: verified` has at least one passing automated end-to-end test through a deployed public boundary.

### Group language and use cases by module (AGENTIC.MODULE.001)

**Requirement:** Consumer specifications MUST group language and use cases by module.

**Rationale:** A module is a stable domain area that owns related language and use cases. The implementation uses the same module name in documentation, Domain and Application folders, API groups, frontend features, tests, and acceptance IDs.

A module is a navigation and ownership boundary. It does not define a transaction boundary and does not require a runtime `Module`, `IModule`, or `ModuleRoot` type.

A module can contain no aggregate, one aggregate, or multiple related aggregates. Independent language, responsibility, or change reasons create a module boundary. Another aggregate alone does not create that boundary.

### Make aggregate ownership explicit (AGENTIC.AGGREGATE.001)

**Requirement:** Consumer specifications MUST make aggregate ownership explicit.

**Rationale:** An aggregate protects every invariant holding in one transaction. Its aggregate root is the only external mutation entry point. A Command normally changes one aggregate.

A Command can change multiple aggregates atomically only when an approved use case or decision names the required invariant. That record can instead name a Domain Policy requiring atomic consistency. Frequent joint changes trigger an aggregate-boundary review.

The module specification maps each aggregate to the state it owns, its aggregate invariants, and its Commands:

| Aggregate | Owns | Aggregate Invariants | Commands |
|:---|:---|:---|:---|
| `Order` | Lines, totals, and lifecycle | `INV-ORDERS-01` | `orders.create-order`, `orders.cancel-order` |
| `OrderClaim` | Guest claim lifecycle | `INV-ORDERS-04` | `orders.claim-guest-order` |

### Deliver one complete use case (AGENTIC.USECASE.001)

**Requirement:** Consumer specifications MUST deliver one complete use case.

**Rationale:** A use case is one independently testable actor or system goal. It defines its trigger, input, result, rules, failures, acceptance criteria, entry points, implementation impact, and operating impact.

Each use case maps to one top-level Command or Query operation. A Command may change state. A Query reads without changing business state. Multi-step product outcomes belong in an end-to-end flow. Autonomous multi-transaction progress belongs in a workflow.

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

### Specify autonomous progress as a workflow (AGENTIC.WORKFLOW.001)

**Requirement:** Consumer specifications MUST specify autonomous progress as a workflow.

**Rationale:** The implementation creates a workflow specification when system-controlled progress crosses a transaction or time boundary. Such progress can require durable state, awaited events, schedules, retries, idempotency, compensation, or operator recovery.

The implementation does not create a workflow specification for branches inside one atomic Command or for a stateless synchronous sequence. The implementation keeps that coordination inside the top-level use-case handler.

A workflow names its owner, participating modules, starting fact, and completion and failure conditions. It also names durable state, Commands, awaited events, retries, idempotency, timeouts, compensation, operator actions, and verification.

The implementation uses `{module}.{past-tense-event}` as the stable documented event reference, such as `orders.order-confirmed`. The implementation maps it to the code type `OrderConfirmedEvent` in the owning module specification. Workflow records use the stable reference and link to that owner.

Each Command issued by a workflow owns its own transaction. The workflow orchestrator updates workflow progress and stages outgoing work. It does not mutate participating aggregates directly.

### Record events and event reactions separately (AGENTIC.REACTION.001)

**Requirement:** Consumer specifications MUST record events and event reactions separately.

**Rationale:** An event records a completed fact. An event reaction states behavior caused by that event. Technical implementation remains explicit as a Domain event handler, Integration event handler, workflow orchestrator, projection, or scheduled job.

The implementation uses one delivery classification:

| Delivery | Meaning |
|:---|:---|
| `atomic` | The reaction is committed in the same transaction as the fact. |
| `durable` | At-least-once delivery is recorded with retry and duplicate handling. |
| `rebuildable` | Derived state may be rebuilt from an authoritative source after loss. |
| `best-effort-optional` | Loss is accepted and does not leave required state incorrect. |

The implementation does not classify a required projection refresh as `best-effort-optional`. Domain events are internal business facts. Integration events are versioned contracts delivered outside the bounded context.

### Classify rules by enforcement boundary (AGENTIC.RULES.001)

**Requirement:** Consumer specifications MUST classify rules by enforcement boundary.

**Rationale:** The implementation uses the rule classifications defined in the Vocabulary section. The implementation does not rename an aggregate invariant to a validation rule because both reject input. Their enforcement times and owners differ.

Every rule uses the identifier prefix for its classification. The scope segment is the module for module-owned rules, the owning use case for request-time rules, the policy for a domain policy. The workflow for a workflow rule. The numeric suffix starts at `01` and uses two digits. Never reuse or renumber an approved rule ID.

| Classification | Identifier form | Scope of the ID |
|:---|:---|:---|
| Aggregate Invariant | `INV-{MODULE}-{NN}` | The owning module. |
| Domain Policy | `POL-{POLICY}-{NN}` | The owning domain-policy specification. |
| Validation Rule | `VAL-{MODULE}-{USE-CASE}-{NN}` | The owning use case. |
| Authorization Policy | `AUTZ-{MODULE}-{USE-CASE}-{NN}` | The owning use case. |
| Persistence Constraint | `PERS-{MODULE}-{NN}` | The owning module. |
| Workflow Rule | `WFR-{WORKFLOW}-{NN}` | The owning workflow. |

A caller-visible failure code uses `{MODULE}.{REASON}` with an uppercase module segment and an uppercase reason, such as `ORDERS.RESERVATION_INVALID`. A failure code is not a rule ID. A use case lists the failure codes its rules produce.

A `POL-*` ID belongs only to a Domain Policy specification. A use-case rule can enforce a constraint established by a decision record. Examples include approved provider and retention choices. The implementation keeps that rule under its enforcement classification, such as Validation Rule, Authorization Policy, or Aggregate Invariant. The specification cites the decision in the rule behavior. The implementation does not create a `POL-*` ID without a Domain Policy specification.

An acceptance criterion cites every applicable `INV-*` and `POL-*` rule. A Domain Policy states its owner, modules, consistency, enforcement point, failure behavior, and verification.

### Model every aggregate lifecycle with state records (AGENTIC.STATE.001)

**Requirement:** Consumer specifications MUST model every aggregate lifecycle with state records.

**Rationale:** Every aggregate defines an abstract `{Aggregate}State` record and one or more sealed immutable state records from its first implementation. This includes an aggregate with one current state. The aggregate exposes one `State` property whose runtime type represents its complete lifecycle state.

The implementation uses business state names in specification tables and maps every state to its state record. The implementation does not model aggregate lifecycle with an enum, status string, boolean flags, parallel nullable fields, or a computed discriminator. Starting with state records gives later states and state-specific facts a stable home without replacing the aggregate lifecycle contract.

State-specific facts belong on the corresponding state record. Aggregate methods own transition rules and replace the current state. A Value Object may protect one fact within a state. It does not replace the aggregate state hierarchy.

### Declare Specification Metadata (AGENTIC.METADATA.001)

**Requirement:** Consumer specifications MUST declare Specification Metadata.

**Rationale:** Every structured specification starts with one JSON metadata block and an explicit `kind`. Common fields are `kind`, `id`, `specStatus`, `owner`, and `lastReviewed`.

`specStatus` states whether the specification has decision authority:

- `draft` is under review and is not authoritative.
- `approved` is authoritative for its documented scope.
- `retired` preserves history after its contract no longer applies.

Behavior specifications also use `implementationStatus`:

- `planned` describes approved target behavior without an implementation claim.
- `implemented` means implementation exists while acceptance evidence remains incomplete. Some acceptance criteria lack passing automated test references. The status records shipped behavior without claiming proof. It does not qualify for release.
- `verified` means implementation exists, every acceptance criterion has an automated test reference, and applicable checks have passed.

The implementation does not use `implementationStatus` on indexes, decisions, Decision Evidence, Operating Limits, Domain Policies, or other records that do not claim implemented behavior. The Specification Metadata schema defines fields permitted for each `kind`.

### Select extensions before applying them (AGENTIC.EXTENSIONS.001)

**Requirement:** Consumer specifications MUST select extensions before applying them.

**Rationale:** `selectedExtensions` in `standards.project.json` is the project allow-list. Selection permits dependencies and repository structure.

An extension with `activationScope: project` applies whenever selected. An extension with `activationScope: local` applies only when selected and listed in `applicableExtensions` on a specification kind allowed by its manifest `applicableKinds`.

The implementation does not list a project-scoped extension in `applicableExtensions`. The implementation does not list a local extension on a specification kind excluded by `applicableKinds`.

### Give acceptance criteria stable ownership (AGENTIC.ACCEPTANCE.001)

**Requirement:** Consumer specifications MUST give acceptance criteria stable ownership.

**Rationale:** The implementation uses `AC-{MODULE}-{USE-CASE}-{NN}`. Its module and use-case segments match the uppercase owning use-case ID after dots become hyphens. The numeric suffix starts at `01` and uses two digits.

**Example:** One owning use-case specification can define a criterion:

```text
[AC-ORDERS-CANCEL-ORDER-01] An authorized buyer can cancel an unpaid order.
```

Acceptance tests reference the ID without redefining its text. A static documentation check proves that the reference exists. A passing test provides execution evidence.

### Update specifications with behavior (AGENTIC.SYNC.001)

**Requirement:** Consumer specifications MUST update specifications with behavior.

**Rationale:** Change the approved use-case specification, implementation, tests, OpenAPI, generated client, affected end-to-end flow, affected workflow, and operating records together when observable behavior changes.

Approved metadata maps to current names and paths. Planned implementation mappings can be absent. Retired specifications never remain public entry points.

## Conventions


### Use this consumer documentation layout (AGENTIC.CONVENTION.001)

**Default:** Use this consumer documentation layout.

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

### Group module use-case files by aggregate root (AGENTIC.CONVENTION.002)

**Default:** Group module use-case files by aggregate root.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A module directory holds one `README.md` module specification. Its use-case specifications are grouped to mirror the module's aggregate roots, the same way the domain code layer groups aggregates under a module.

- The implementation keeps use-case files directly in a module only for one aggregate whose plural kebab-case name matches the directory. For example, `catalogs/` holds use cases for its single `Catalog` aggregate.
- Otherwise, place single-aggregate use cases in a plural kebab-case aggregate subdirectory. For example, `finance` places `ReconciliationCase` use cases under `reconciliation-cases/`.
- For multiple aggregates, give each aggregate a plural kebab-case subdirectory. Namesake aggregates receive no flat exception. For example, `audience` uses `buyer-accounts/` and `consents/`.

Every aggregate-root subdirectory contains one `README.md` aggregate specification with kind `aggregate`. It describes ownership, business states, technical mapping, transitions, invariants, events, and indexed use cases. It references module-scoped invariant and event IDs.

The module `README.md` describes module purpose, actors, terms, aggregate roster, rule coverage, and dependencies. It links each aggregate subdirectory. It also defines module aggregate invariants and events.

Invariant and event IDs remain module-scoped as `INV-<MODULE>-NN` and `<module>.<event>`. A rule can span aggregates. The module README defines each rule once, and aggregate README files reference it. A flat single-aggregate module combines both concerns in one `README.md`.

A use-case id stays `{module}.{name}` and its filename stays `{name}.md`. Only the directory changes. The aggregate subdirectory records the owning aggregate root and adds no segment to the id. The domain code layer groups aggregate files under the same rule. The documentation tree and the code tree match module for module and aggregate for aggregate.

### Keep operational and security references under operations (AGENTIC.CONVENTION.003)

**Default:** Keep operational and security references under operations.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** `docs/operations/` holds operating and security reference documents. `limits.md` is the only structured kind there (`operating-limits`). Cross-cutting security posture, trust boundaries, threat surfaces, and privacy references have no structured kind. The implementation records them as prose reference documents under `docs/operations/`, for example `security-and-privacy.md`. Enforceable security and privacy rules still belong to their owning use-case authorization sections and to domain policies such as data retention. The implementation does not reintroduce a general cross-cutting bucket for these records.

### Use established technical terms (AGENTIC.CONVENTION.004)

**Default:** Use established technical terms.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** The implementation prefers an established term when it identifies a precise engineering pattern. The implementation uses aggregate, invariant, Command, Query, repository, projection, outbox, idempotency, transaction, and orchestrator with their accepted technical meanings.

The implementation does not replace a precise term with a softer local synonym solely to make it sound less technical. Explain the term and give a concrete example instead.

### Use ordinary capitalization in prose (AGENTIC.CONVENTION.005)

**Default:** Use ordinary capitalization in prose.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** The implementation writes module, use case, workflow, aggregate, invariant, event, and policy as ordinary nouns. Terms have capitalization at sentence starts and titles. Exact schema kinds and code types retain their declared capitalization.

### Keep specifications readable without tooling (AGENTIC.CONVENTION.006)

**Default:** Keep specifications readable without tooling.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** The implementation uses JSON only for the metadata block. The implementation writes outcomes, rules, failures, examples, mappings, and verification in Markdown prose, tables, code, and directory examples.

## Reference example

This informative example demonstrates `AGENTIC.FLOW.001`, `AGENTIC.WORKFLOW.001`, and `AGENTIC.REACTION.001`.

The `event-sales` end-to-end flow links `inventory.reserve-tickets`, `orders.create-guest-order`, `payments.start-payment`, and `tickets.issue-ticket`. The `payment-fulfillment` workflow begins with provider confirmation, issues one inventory confirmation Command, awaits its event, and then issues the ticket Command. Each Command owns one transaction. `E2E-EVENT-SALES-01` verifies the connected outcome through the deployed API.

The Orders module contains `Order` and `OrderClaim`. `orders.cancel-order` changes `Order` and cites `INV-ORDERS-01`. `orders.claim-guest-order` changes `OrderClaim` and cites `INV-ORDERS-04`. Their shared module name does not merge their transaction boundaries.

`OrderConfirmed` records a completed fact. `Issue tickets` is its event reaction. A durable `OrderFulfillmentWorkflowOrchestrator` may implement that reaction by issuing `IssueTicketCommand`. The specification does not require a class named `IssueTicketsReaction`.

## Verification


| ID | Method | Evidence |
|:---|:---|:---|
| AGENTIC.AUTHORITY.001 | inspection | Pull request review asserts `keep decision authority with accountable people` in the owning specification and source paths. |
| AGENTIC.SPECIFICATION.001 | inspection | Pull request review asserts `drive work from approved specifications` in the owning specification and source paths. |
| AGENTIC.FLOW.001 | inspection | Pull request review asserts `connect one product outcome through an end-to-end flow` in the owning specification and source paths. |
| AGENTIC.MODULE.001 | inspection | Pull request review asserts `group language and use cases by module` in the owning specification and source paths. |
| AGENTIC.AGGREGATE.001 | inspection | Pull request review asserts `make aggregate ownership explicit` in the owning specification and source paths. |
| AGENTIC.USECASE.001 | inspection | Pull request review asserts `deliver one complete use case` in the owning specification and source paths. |
| AGENTIC.WORKFLOW.001 | inspection | Pull request review asserts `specify autonomous progress as a workflow` in the owning specification and source paths. |
| AGENTIC.REACTION.001 | inspection | Pull request review asserts `record events and event reactions separately` in the owning specification and source paths. |
| AGENTIC.RULES.001 | inspection | Pull request review asserts `classify rules by enforcement boundary` in the owning specification and source paths. |
| AGENTIC.STATE.001 | inspection | Pull request review asserts `model every aggregate lifecycle with state records` in the owning specification and source paths. |
| AGENTIC.METADATA.001 | inspection | Pull request review asserts `declare Specification Metadata` in the owning specification and source paths. |
| AGENTIC.EXTENSIONS.001 | inspection | Pull request review asserts `select extensions before applying them` in the owning specification and source paths. |
| AGENTIC.ACCEPTANCE.001 | inspection | Pull request review asserts `give acceptance criteria stable ownership` in the owning specification and source paths. |
| AGENTIC.SYNC.001 | inspection | Pull request review asserts `update specifications with behavior` in the owning specification and source paths. |
| AGENTIC.CONVENTION.001 | inspection | Pull request review asserts `use this consumer documentation layout` in the owning specification and source paths. |
| AGENTIC.CONVENTION.002 | inspection | Pull request review asserts `group module use-case files by aggregate root` in the owning specification and source paths. |
| AGENTIC.CONVENTION.003 | inspection | Pull request review asserts `keep operational and security references under operations` in the owning specification and source paths. |
| AGENTIC.CONVENTION.004 | inspection | Pull request review asserts `use established technical terms` in the owning specification and source paths. |
| AGENTIC.CONVENTION.005 | inspection | Pull request review asserts `use ordinary capitalization in prose` in the owning specification and source paths. |
| AGENTIC.CONVENTION.006 | inspection | Pull request review asserts `keep specifications readable without tooling` in the owning specification and source paths. |
