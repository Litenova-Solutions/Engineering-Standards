# Glossary

## Acceptance criterion

One observable condition owned by a use-case specification and identified as `AC-{MODULE}-{USE-CASE}-{NN}`.

## Acceptance test

Automated executable evidence that cites and proves one or more acceptance criteria.

## Agent

A software system that can inspect context, reason about bounded work, change authorized artifacts, and run verification within delegated authority.

## Agent Summary

The anchored Tier 1 projection that gives agents short task context while the full document remains canonical.

## Agent-Driven Engineering

The operating model in which agents perform substantial engineering execution while people retain decision authority and review responsibility.

## Agentic Engineering System

A system for specifying, building, verifying, releasing, and operating software with agents as active engineering participants.

## Aggregate

A cluster of Domain objects changed as one transaction and protected through one external mutation entry point.

## Aggregate invariant

A rule that remains true after every transaction changing its owning aggregate and uses an `INV-{MODULE}-{NN}` identifier.

## Aggregate root

The only external mutation entry point for an aggregate.

## Aggregate state

The complete lifecycle condition represented by one abstract `{Aggregate}State` record and one or more sealed state records.

## Authorization policy

A policy deciding whether an identified actor can perform an operation on a specific target.

## Command

An Application message that can change business state through one top-level command pipeline and transaction commit.

## Controlled technical prose

The repository-owned English profile defining fixed structures, bounded prose, exact terms, and testable provisions.

## Convention

A replaceable default for a name, location, file shape, or implementation pattern.

## Convention ID

A canonical uppercase dotted identifier containing `CONVENTION`, such as `API.CONVENTION.001`.

## Current standards material

Published standards pages, templates, instructions, and validators that define the pinned release without transition or release-history material.

## Decision Evidence

An optional research record for external facts that need an owner and lifecycle beyond their owning decision.

## Derived artifact

A committed application file produced deterministically from an authored source, such as OpenAPI or generated TypeScript types.

## Domain

The real-world knowledge, language, rules, state, and behavior modeled by the software.

## Domain event

An immutable, package-free Domain record describing a completed fact inside the bounded context.

## Domain policy

An accepted business rule outside one aggregate invariant and identified as `POL-{POLICY}-{NN}`.

## End-to-end flow

A connection of use cases from an accepted starting condition to one observable product outcome across required system boundaries.

## End-to-end test

An automated test identified as `E2E-{FLOW}-{NN}` that verifies one complete flow through deployed public boundaries and required infrastructure.

## Engineering system

A connected set of decisions, specifications, standards, implementation conventions, verification, operating controls, and release practices.

## Entry point

A path through which an actor or system invokes or observes a use case.

## Event

An immutable statement that a relevant fact completed, named in past tense.

## Event reaction

Behavior caused by an event without prescribing a handler, orchestrator, projection, or scheduled-job implementation.

## Extension

A conditional standards bundle selected by a project or an allowed local specification.

## Integration event

A versioned message contract delivered outside the bounded context.

## Module

A cohesive Domain area organizing language, use cases, aggregates, code, and ownership without implying a deployment or transaction boundary.

## Normative

Required for a conforming consumer through an identified Standards provision.

## Operating limit

An enforced, tested, supported, or alerting boundary for system operation.

## Persistence constraint

A rule enforced by durable storage, such as uniqueness, a required relationship, or a bounded value.

## Platform profile

A supported composition of architecture, frameworks, project layout, and baseline conventions.

## Product

The software capability offered to users with its supported outcomes, operating boundary, exclusions, and external commitments.

## Projection

A process deriving a Read Model from authoritative facts with the delivery guarantee required by its owning behavior.

## Provision

One identified Standard or Convention block with one Requirement or replaceable Default and one evidence mapping.

## Query

An Application message that reads a Read Model without changing business state.

## Read Model

Data shaped for a Query without aggregate loading or mutation.

## Release Record

The immutable evidence record for one release artifact, including build, tests, deployment, recovery, diagnostics, operating limits, and runbooks.

## Repository (Domain port)

A Domain-owned port that loads and stages complete aggregates without exposing general queries or committing transactions.

## Risk

A use-case metadata value that activates additional specification and verification for a named area of potential harm or failure.

## Rule ID

A canonical uppercase dotted identifier, such as `APP.COMMAND.001`, that identifies one Standard and can appear in a consumer override.

## Specification

An approved, versioned statement of required behavior or constraint that persists beyond one task or agent session.

## Specification Metadata

The opening JSON block identifying a structured document's kind, ID, authority, owner, review date, and implementation data.

## Specification-Driven Delivery

The delivery approach in which approved specifications select work, record behavior, and define completion.

## Standard

One identified Standards provision stating a required boundary for a conforming consumer.

## Standards override

A consumer replacement for one Standard, identified by its rule ID and an accepted project decision.

## Standards release

One published, pinned, complete standards contract that depends on no earlier release and carries no compatibility guarantee.

## Use case

One independently testable actor or system goal implemented as one top-level Command or Query operation.

## Validation rule

A rule checking a Command or Query's shape, format, or bounded value before business behavior runs.

## Value Object

An immutable Domain type defined by its values and rules instead of an independent identity.

## Workflow

System-controlled progress across a transaction or time boundary with durable coordination and recovery behavior.

## Workflow orchestrator

The component that persists workflow progress and selects its next action.

## Workflow rule

A rule controlling when a workflow advances, waits, retries, compensates, fails, completes, or requires operator action.

## Workspace

The Git repository that holds a consumer application or these standards, as distinct from a Domain repository port.
