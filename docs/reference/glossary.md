# Glossary

## Acceptance criterion

One observable condition owned by a use-case specification. Its stable ID uses `AC-{MODULE}-{USE-CASE}-{NN}`. A criterion describes required behavior; it is not the test implementation.

## Acceptance test

Automated executable evidence for one or more acceptance criteria. The test cites each exact acceptance ID it proves.

## Agent

A software system that can inspect repository context, reason about a bounded task, change authorized artifacts, and run verification. An agent executes within delegated authority and does not own unresolved product or risk decisions.

## Agent-Driven Engineering

The LES operating model in which agents perform substantial engineering execution from approved specifications. People retain decision authority and review responsibility.

## Agent Summary

The anchored short section agents load as Tier 1 context for a task. The full document remains the source when a summary is insufficient.

## Aggregate

A cluster of domain objects changed as one transactional consistency boundary. An aggregate protects every invariant that must hold when its transaction commits.

## Aggregate invariant

A rule that must remain true after every transaction that changes one aggregate. `Invariant` means the rule cannot remain temporarily false after commit. IDs use `INV-{MODULE}-{NN}`.

## Aggregate root

The only external mutation entry point for an aggregate. `Root` identifies the object through which the aggregate is changed; it does not mean every domain type inherits from it.

## Aggregate state

The complete lifecycle condition of an aggregate. LES represents it with one abstract `{Aggregate}State` record and one or more sealed state records.

## Authorization policy

A policy that decides whether an identified actor may perform an operation on a specific target. Authentication proves identity; authorization decides permitted behavior.

## Command

An Application message that may change business state. One top-level Command owns one command pipeline and one transaction commit.

## Convention

A default name, location, file shape, or implementation pattern. A consumer may replace a convention through one explicit local convention.

## Decision Evidence

An optional research record used when provider approval, legal review, security analysis, financial assumptions, or other external facts affect a decision. Normal evidence remains inside the decision record; create a separate record only when the investigation needs its own owner and lifecycle.

## Derived artifact

A committed application file produced deterministically from an authored source. OpenAPI and generated TypeScript API types are derived artifacts.

## Domain

The area of real-world knowledge, language, rules, state, and behavior modeled by the software. Orders and refund policy belong to the domain; HTTP routing and database sessions are technical mechanisms. The capitalized `Domain` project is the code layer that implements domain types.

## Domain event

An immutable, package-free Domain record describing a completed fact inside the bounded context.

## Domain policy

An accepted business rule that is not owned by one aggregate invariant. `Domain` places the policy in business behavior. `Policy` means the rule selects, permits, limits, or requires behavior from known facts. IDs use `POL-{POLICY}-{NN}`.

## End-to-end flow

A connection of use cases from an accepted starting condition to one observable product outcome across every required system boundary. It may include actor choices, system work, waiting, failures, and recovery.

## End-to-end test

An automated test that verifies one complete end-to-end flow through deployed public boundaries and required infrastructure. IDs use `E2E-{FLOW}-{NN}`.

## Engineering system

A connected set of decisions, specifications, standards, implementation conventions, verification, operating controls, and release practices. `System` describes how the parts constrain and support one another; it is not a runtime framework.

## Entry point

A path through which an actor or system invokes or observes a use case, such as an HTTP API, web application, webhook, Worker trigger, or administrative interface.

## Event

An immutable statement that a relevant fact completed. Event names use past tense, such as `OrderConfirmed`.

## Event reaction

Behavior caused by an event. A reaction may be implemented by an event handler, workflow orchestrator, projection, or scheduled job. The term describes causality without prescribing a class suffix.

## Extension

A conditional standards bundle selected in `standards.project.json`. Project-scoped extensions apply when selected. Local extensions apply only to allowed specification kinds that list them.

## Integration event

A versioned message contract delivered outside the bounded context.

## Litenova Engineering System

The complete company system for specifying, building, verifying, releasing, and operating Litenova software. It uses Specification-Driven Delivery and Agent-Driven Engineering.

## Module

A cohesive area of the domain used to organize language, use cases, aggregates, code, and ownership. A module is not automatically an assembly, deployment unit, transaction boundary, or aggregate.

## Normative

Required for a conforming consumer. Content under a `Standards` section is normative.

## Operating limit

An enforced, tested, or supported operating boundary, or an alert threshold that requires operator action.

## Persistence constraint

A rule enforced by stored-data infrastructure, such as uniqueness, a required relationship, or a bounded value. Persistence means durable storage; constraint means the store rejects an invalid representation.

## Platform profile

A supported combination of architecture, frameworks, project layout, and baseline conventions. Version 1 contains the `dotnet-nextjs` profile.

## Primary release flow

The end-to-end flow selected as the first deployed product outcome that gates application v1. `Primary` identifies priority. `Release` means the flow must work for the immutable artifact being evaluated.

## Product

The software capability offered to users together with its supported operating boundary, outcomes, exclusions, and external commitments. Product does not mean only the frontend application.

## Projection

A process that derives a Read Model from authoritative facts. Its delivery is atomic, durable, or rebuildable when the Read Model is required behavior.

## Query

An Application message that reads a Read Model without changing business state.

## Read Model

Data shaped for a Query without requiring aggregate loading or mutation.

## Release Record

The immutable record for one release artifact. It captures build, test, deployment, restore, rollback, diagnostics, smoke-test, operating-limit, and runbook evidence.

## Repository

A Domain-owned port that loads and stages complete aggregates. It does not expose general queries or commit a transaction.

## Risk

A use-case metadata value that adds specification and verification for authorization, money, sensitive data, irreversible behavior, concurrency, durable delivery, or availability.

## Rule ID

A canonical uppercase dotted identifier such as `APP.COMMAND.001` used by standards overrides, extensions, decisions, conflict reports, and review within one standards release.

## Specification

An approved, versioned statement of required behavior or constraint. A specification remains in the repository after one prompt, agent session, or implementation task ends.

## Specification-Driven Delivery

The LES delivery approach in which approved specifications select work and define completion. Prompts and tickets may initiate work, but the owning specification records approved behavior.

## Specification Metadata

The JSON block at the start of a structured specification. It identifies the document kind, ID, authority, owner, review date, and kind-specific implementation data.

## Standards override

A consumer replacement for a normative rule. It names the rule ID and an accepted project decision in `standards.project.json`.

## Use case

One independently testable actor or system goal implemented as one top-level Command or Query operation.

## Validation rule

A rule that checks the shape, format, or bounded value of a Command or Query before business behavior runs.

## Value Object

An immutable Domain type defined by its values and rules rather than an independent identity.

## Workflow

System-controlled progress across a transaction or time boundary. A workflow records durable state, awaited events, issued Commands, retry or idempotency behavior, and recovery when those concerns apply.

## Workflow orchestrator

The component that persists and advances a durable workflow. `Orchestrator` means it selects the next action rather than performing every action itself. Industry mappings include Process Manager and orchestration-based Saga.

## Workflow rule

A rule that controls when a workflow advances, waits, retries, compensates, fails, completes, or requires operator action.
