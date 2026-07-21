# Glossary

## ADDD

Agent-Driven Domain Delivery. A delivery method in which human-approved product and domain records give agents durable context to implement one complete use case at a time.

## Acceptance criterion

One observable behavior owned by a Use-case specification and identified by `AC-{SUBJECT}-{USE-CASE}-{NN}`.

## Agent Summary

The anchored short section agents load as Tier 1 context for a task. The full document remains the source when a summary is insufficient.

## Aggregate

A cluster of Domain objects governed as one transactional consistency boundary.

## Aggregate root

The only external mutation entry point for an Aggregate. It protects the Aggregate Rules that must hold after a transaction.

## Aggregate Rule

A business rule that must remain true after every transaction that changes one Aggregate. Aggregate Rule IDs use `INV-{SUBJECT}-{NN}`.

## Business Flow

A connection between use cases from one starting condition to an observable product outcome. A Business Flow may cross Subjects and include actor choices, system work, waiting, failures, and recovery.

## Business Policy

A business rule not owned by one Aggregate invariant. It states its owner, consistency requirement, enforcement point, failure behavior, and verification. Shared Business Policy IDs use `POL-{SHARED-RULE}-{NN}`.

## Claims and Evidence

An optional record that separates observed, calculated, inferred, and hypothetical claims from the decisions or release conditions that depend on them.

## Command

An Application message that may change business state. One top-level Command owns one command pipeline and one transaction commit.

## Convention

A default name, location, file shape, or implementation pattern. A consumer may replace a convention through one explicit local convention.

## Derived artifact

A committed application file produced deterministically from an authored source. OpenAPI and generated TypeScript API types are derived artifacts.

## Domain Event

An immutable, package-free Domain record describing a completed business fact inside the bounded context.

## Entry Point

A path through which an actor or system invokes or observes a Use case, such as an HTTP API, web application, webhook, Worker trigger, or administrative interface.

## Extension

A conditional standards bundle selected in `standards.project.json`. Project-scoped extensions apply when selected. Local extensions apply only to allowed specification kinds that list them.

## Flow check

An automated check through a public system boundary that verifies one complete Business Flow. Flow-check IDs use `FC-{BUSINESS-FLOW}-{NN}`.

## Follow-up

Business behavior expected after an Event. A Follow-up maps to a precise implementation such as an event handler, Workflow Orchestrator, projection, or scheduled job.

## Integration Event

A versioned message contract delivered outside the bounded context.

## Normative

Required for a conforming consumer. Content under a `Standards` section is normative.

## Operating limit

An enforced, tested, or supported operating boundary, or an alert threshold that requires operator action.

## Platform profile

A supported combination of architecture, frameworks, project layout, and baseline conventions. Version 1 contains the `dotnet-nextjs` profile.

## Projection

A process that derives a Read Model from authoritative facts. Its delivery is atomic, durable, or rebuildable when the Read Model is required behavior.

## Query

An Application message that reads a Read Model without changing business state.

## Read Model

Data shaped for a Query without requiring Aggregate loading or mutation.

## Repository

A Domain-owned port that loads and stages complete Aggregates. It does not expose general queries or commit a transaction.

## Risk

A use-case metadata value that adds specification and verification for authorization, money, sensitive data, irreversible behavior, concurrency, durable delivery, or availability.

## Rule ID

A canonical uppercase dotted identifier such as `APP.COMMAND.001` used by standards overrides, extensions, decisions, conflict reports, and review within one standards release.

## Shared Rule

A documented rule that applies to more than one Subject and identifies its owner, consistency, enforcement, failure behavior, and verification.

## Specification Metadata

The JSON block at the start of a structured specification. It identifies the document kind, ID, authority, owner, review date, and kind-specific delivery data.

## Standards override

A consumer replacement for a normative rule. It names the rule ID and an accepted project decision in `standards.project.json`.

## Subject

A stable business topic that groups related language and use cases across documentation, backend folders, endpoint groups, frontend features, and tests. A Subject is a navigation boundary, not a transaction boundary or runtime type.

## Use case

One independently verifiable actor or system goal implemented as one top-level Command or Query operation.

## Value Object

An immutable Domain type defined by its values and rules rather than an independent identity.

## Workflow

System-controlled progress across a transaction or time boundary. A Workflow records durable state, awaited Events, issued Commands, retry or idempotency behavior, and recovery when those concerns apply.

## Workflow Orchestrator

The component that persists and advances a durable Workflow. Its industry mappings include Process Manager and orchestration-based Saga. ADDD uses `Workflow Orchestrator` in specifications and code examples.
