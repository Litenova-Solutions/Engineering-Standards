# Agent-Driven Domain Delivery

## Intent

Agent-Driven Domain Delivery (ADDD) is a delivery method in which human-approved product and domain records give AI agents the durable context required to implement one complete use case at a time.

ADDD defines its own delivery rules and maps selected domain-driven design, behavior-driven development, CQRS, vertical-slice, and messaging patterns where they clarify implementation. It does not inherit any source method wholesale.

## Agent Summary {#agent-summary}

- Humans own product intent, business language, and unresolved business decisions.
- Agents implement current specifications, identify missing facts, and do not invent business rules.
- A Subject groups related language and use cases. It is not a transaction boundary.
- A Business Flow connects use cases to one product outcome and may cross Subjects.
- A Workflow advances system-controlled work across transaction or time boundaries.
- A Use case is one independently verifiable Command or Query goal and remains the delivery unit.
- An Aggregate protects rules that must hold in one transaction.
- Every Aggregate uses an abstract state base and at least one sealed state record from its first implementation.
- Acceptance criteria verify one Use case. Flow checks verify one Business Flow.
- Specification Metadata states document kind, authority, ownership, and applicable delivery data.
- Selected extensions permit project structure and dependencies. Local applicability activates behavior for a specification.

## Concept model

ADDD uses related concepts rather than one planning hierarchy:

```text
Product
  names outcomes and operating boundaries

Business Flow
  connects Use cases to one product outcome
  may cross Subjects

Subject
  groups related business language and Use cases

Use case
  defines one actor or system goal
  maps to one Command or Query operation

Workflow
  advances system-controlled work across transactions or time

Workflow Orchestrator
  persists and advances a durable Workflow

Aggregate
  protects state and rules changed in one transaction

Acceptance criterion
  defines observable behavior for one Use case

Flow check
  verifies a complete Business Flow
```

The central relationships are:

```text
Product outcome
  Business Flow
    Use cases
      Acceptance criteria
    Flow checks

Subject
  groups Use cases and language

Workflow
  advances Business Flow steps
  issues Commands and awaits Events

Command
  normally changes one Aggregate

Query
  reads a Read Model
```

## Standards

### Keep business authority with humans (ADDD.AUTHORITY.001)

Humans approve product outcomes, business terms, policies, acceptance criteria, and unresolved decisions. Agents MAY propose missing language, examples, and implementation mappings, but MUST mark them as proposals until a human accepts them.

When an unknown fact changes observable behavior, authorization, money movement, data handling, or recovery, record the question and stop the affected work. Do not infer the answer from code structure or a neighboring use case.

### Connect one product outcome through a Business Flow (ADDD.BUSINESSFLOW.001)

A Business Flow connects use cases from a starting condition to one observable product outcome. It MAY include actor choices, system work, branches, waiting periods, failures, and recovery. It MAY cross Subjects.

The product brief MUST name exactly one `primary` Business Flow for application v1. Another flow uses the `supporting` release role. A Business Flow links its use-case specifications and does not copy their inputs, rules, failures, or acceptance criteria.

A Flow check uses `FC-{BUSINESS-FLOW}-{NN}`. For `event-sales`, valid IDs begin with `FC-EVENT-SALES-`. A verified Business Flow has at least one automated Flow check through a public system boundary.

### Group language and use cases by Subject (ADDD.SUBJECT.001)

A Subject is a stable business topic that owns related language and use cases. Use the same Subject name in documentation, Domain and Application folders, API groups, frontend features, tests, and acceptance IDs.

A Subject is a navigation boundary. It does not define a transaction boundary and does not require a runtime `Subject`, `ISubject`, or `SubjectRoot` type.

A Subject MAY contain no Aggregate, one Aggregate, or multiple related Aggregates. Split a Subject when its language, business responsibility, or reasons for change are independent. Do not split it only because another Aggregate exists.

### Make Aggregate ownership explicit (ADDD.AGGREGATE.001)

An Aggregate is a cluster of Domain objects governed as one consistency boundary. Its Aggregate root is the only external mutation entry point. A Command normally changes one Aggregate.

A Command MAY change multiple Aggregates in one transaction only when its current use-case specification or an accepted decision names the rule that requires atomic consistency. If the same Aggregates frequently change together, review their boundaries.

The Subject specification maps each Aggregate to the state it owns, its Aggregate Rules, and its Commands:

| Aggregate | Owns | Aggregate Rules | Commands |
|:---|:---|:---|:---|
| `Order` | Lines, totals, and lifecycle | `INV-ORDERS-01` | `orders.create-order`, `orders.cancel-order` |
| `OrderClaim` | Guest claim lifecycle | `INV-ORDERS-04` | `orders.claim-guest-order` |

### Deliver one complete Use case (ADDD.USECASE.001)

A Use case is one independently verifiable actor or system goal. It defines its trigger, input, result, rules, failures, acceptance criteria, entry points, implementation impact, and operating impact.

Each Use case maps to one top-level Command or Query operation. A Command may change state. A Query reads without changing business state. Multi-step product outcomes belong in a Business Flow; autonomous multi-transaction progress belongs in a Workflow.

Keep identifiers and implementation names aligned:

```text
Use case:       orders.cancel-order
Command:        CancelOrderCommand
Result:         CancelOrderCommandResult
Handler:        CancelOrderCommandHandler
Aggregate call:  Order.Cancel
Event reference: orders.order-cancelled
Event type:      OrderCancelled
Endpoint:        CancelOrderEndpoint
Acceptance ID:   AC-ORDERS-CANCEL-ORDER-01
```

Finish the Domain behavior, Application operation, persistence, entry points, automated evidence, and operating impact before setting `deliveryStatus` to `verified`. Placeholder work leaves the Use case `planned`.

### Specify autonomous progress as a Workflow (ADDD.WORKFLOW.001)

A Workflow advances system-controlled work without requiring an actor to invoke every step. Create a Workflow specification when progress crosses a transaction or time boundary and requires durable state, an awaited event, a scheduled time, retry, idempotency, compensation, or operator recovery.

Do not create a Workflow specification for branches inside one atomic Command or for a stateless synchronous sequence. Keep that coordination inside the top-level use-case handler.

A Workflow names its business owner, participating Subjects, starting fact, completion and failure conditions, durable state owner, Commands issued, Events awaited, retry horizon, idempotency behavior, timeouts, compensation, operator actions, and verification.

Use `{subject}.{past-tense-event}` as the stable documented Event reference, such as `orders.order-confirmed`. Map it to the code type `OrderConfirmed` in the owning Subject specification. Workflow records use the stable reference and link to that owner.

The Workflow Orchestrator is the technical mapping for a durable Workflow. Industry mappings include Process Manager and orchestration-based Saga. These mappings do not become ADDD naming conventions.

### Record Events and Follow-ups separately (ADDD.FOLLOWUP.001)

An Event records a completed fact. A Follow-up states business behavior expected after that Event. Technical implementation remains explicit as a Domain event handler, Integration event handler, Workflow Orchestrator, projection, or scheduled job.

Use one of these delivery classifications:

| Delivery | Meaning |
|:---|:---|
| `atomic` | The Follow-up is committed in the same transaction as the fact. |
| `durable` | At-least-once delivery is recorded with retry and duplicate handling. |
| `rebuildable` | Derived state may be rebuilt from an authoritative source after loss. |
| `best-effort-optional` | Loss is accepted and does not leave required state incorrect. |

Do not classify a required projection refresh as `best-effort-optional`. Domain Events are internal business facts. Integration Events are versioned contracts delivered outside the bounded context.

### Classify business rules by enforcement (ADDD.RULES.001)

Use these terms:

| ADDD term | Meaning | Technical mapping |
|:---|:---|:---|
| Input Rule | Validates message shape or format. | Command or Query validation |
| Authorization Rule | Controls actor access to a target. | Policy and target authorization |
| Aggregate Rule | Must hold after every transaction that changes one Aggregate. | Aggregate invariant |
| Business Policy | Is not owned by one Aggregate invariant and names its consistency and enforcement. | Domain or Application policy |
| Workflow Rule | Controls Workflow progression. | Workflow Orchestrator behavior |
| Storage Constraint | Protects persistence-level uniqueness or references. | Database constraint |

Use `INV-{SUBJECT}-{NN}` for Aggregate Rules. Use `POL-{SHARED-RULE}-{NN}` for Business Policies owned by a Shared Rule. Never reuse or renumber an accepted rule ID.

An acceptance criterion cites every `INV-*` and `POL-*` rule required for that behavior. A Business Policy that spans Subjects MUST state its owner, consistency requirement, enforcement point, failure behavior, and verification.

### Model every Aggregate lifecycle with state objects (ADDD.STATE.001)

Every Aggregate defines an abstract `{Aggregate}State` record and one or more sealed immutable state records from its first implementation. This includes an Aggregate with one current state. The Aggregate exposes one `State` property whose runtime type represents its complete lifecycle state.

Use business state names in business tables and map every business state to its state record. Do not model Aggregate lifecycle with an enum, status string, boolean flags, parallel nullable fields, or a computed discriminator. Starting with state objects gives later states and state-specific facts a stable home without replacing the Aggregate's lifecycle contract.

State-specific facts belong on the corresponding state record. Aggregate methods own transition rules and replace the current state object. A Value Object may protect one fact within a state, but it does not replace the Aggregate state hierarchy.

### Declare Specification Metadata (ADDD.METADATA.001)

Every structured specification starts with one JSON metadata block and an explicit `kind`. Common fields are `kind`, `id`, `recordStatus`, `owner`, and `lastReviewed`.

`recordStatus` is `draft`, `current`, or `retired`:

- `draft` is under review and is not authoritative.
- `current` is authoritative for its documented scope.
- `retired` preserves history after its contract no longer applies.

Behavior specifications also use `deliveryStatus`:

- `planned` describes approved target behavior without an implementation claim.
- `verified` means implementation exists, every acceptance criterion has an automated test reference, and applicable checks have passed.

Do not use `deliveryStatus` on indexes, decisions, Claims and Evidence, Operating Limits, or other records that do not claim implemented behavior. The Specification Metadata schema defines the fields permitted for each `kind`.

### Select extensions before applying them (ADDD.EXTENSIONS.001)

`selectedExtensions` in `standards.project.json` is the project allow-list. Selection permits dependencies and repository structure.

An extension with `activationScope: project` applies whenever selected. An extension with `activationScope: local` applies only when selected and listed in `applicableExtensions` on a specification kind allowed by its manifest `applicableKinds`.

Do not list a project-scoped extension in `applicableExtensions`. Do not list a local extension on a specification kind excluded by `applicableKinds`.

### Give acceptance criteria stable ownership (ADDD.ACCEPTANCE.001)

Use `AC-{SUBJECT}-{USE-CASE}-{NN}`. The Subject and Use-case segments MUST match the owning Use-case ID after uppercase conversion and replacement of `.` with `-`. The numeric suffix starts at `01` and uses two digits.

Define a criterion once in its owning use-case specification:

```text
[AC-ORDERS-CANCEL-ORDER-01] An authorized buyer can cancel an unpaid order.
```

Other specifications and tests reference the ID without redefining its text. A static documentation check can prove the reference exists. A successful test run provides execution evidence.

### Update specifications with behavior (ADDD.SYNC.001)

Change the current use-case specification, implementation, tests, OpenAPI, generated client, affected Business Flow, affected Workflow, and operating records in the same pull request when observable behavior changes.

Current metadata MUST map to current names and paths. Planned implementation mappings MAY be absent. Retired specifications MUST NOT remain public entry points.

## Conventions

### Use this consumer documentation layout

```text
docs/
  product/
    brief.md
    flows/
      event-sales.md
  domain/
    README.md
    glossary.md
    subjects/
      README.md
      orders/
        README.md
        cancel-order.md
    workflows/
      order-fulfillment.md
    shared-rules/
      buyer-data-retention.md
  decisions/
  operations/
    limits.md
  runbooks/
  release/
  research/
```

Create an optional directory only when its first real artifact is added. Do not create empty directories or placeholder records during inception.

### Keep specifications readable without tooling

Use JSON only for the metadata block. Write outcomes, rules, failures, examples, mappings, and verification in Markdown prose, tables, code, and directory examples.

## Example

An event-sales Business Flow links `inventory.reserve-tickets`, `orders.create-guest-order`, `payments.start-payment`, and `tickets.issue-ticket`. The payment-fulfillment Workflow begins with provider confirmation, issues one inventory confirmation Command, awaits its Event, then issues the ticket Command. Each Command owns one transaction. `FC-EVENT-SALES-01` verifies the connected public outcome.

The `Orders` Subject may contain `Order` and `OrderClaim`. `orders.cancel-order` changes `Order` and cites `INV-ORDERS-01`. `orders.claim-guest-order` changes `OrderClaim` and cites `INV-ORDERS-04`. Their shared folder name does not merge their transaction boundaries.

## Verification

- Confirm the product brief references exactly one primary Business Flow.
- Confirm Business Flow use-case references resolve.
- Confirm every Subject directory has one Subject specification.
- Confirm Use-case IDs match Subject and filename.
- Confirm every Aggregate has one abstract state base and at least one sealed state record.
- Confirm each multi-Aggregate Command names the rule requiring one transaction.
- Confirm durable Workflow Commands and Events resolve to documented behavior.
- Confirm Shared Rule Subject references and `POL-*` IDs resolve.
- Confirm applicable extensions are selected and allowed for the specification kind.
- Confirm acceptance and Flow-check definitions use their owning prefixes and are unique.
- Confirm verified behavior has automated references and recorded passing checks.
- Confirm current names match documentation, code, generated contracts, and tests.
- Confirm optional directories contain real artifacts and no placeholder documents.
