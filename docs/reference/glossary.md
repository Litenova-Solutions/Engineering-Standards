# Glossary

## Actor

One person, company, provider, system, or guest that touches the product.

Term `term/actor`.

## Agent

Software that inspects context, reasons about bounded work, changes authorized files, and runs verification.

Term `term/agent`.

## Agent summary

The short task context for agents, while the full page stays canonical.

Term `term/agent-summary`.

## Agent-driven engineering

The operating model where agents do engineering work and people keep decision authority.

Term `term/agent-driven-engineering`.

## Aggregate root

The single type through which outside code changes a business record.

Term `term/aggregate-root`.

## Alert inventory

The list of fired alerts and the runbook each one names.

Term `term/alert-inventory`.

## AppHost

The local orchestrator that starts every application and dependency together.

Term `term/apphost`.

## Architecture layer

One project boundary in the backend: Domain, Application, Infrastructure, or WebApi.

Term `term/architecture-layer`.

## Audit record

One entry stating actor, action, target, outcome, time, origin, and reason.

Term `term/audit-record`.

## Audit trail

The append-only store holding audit records, apart from logs and domain events.

Term `term/audit-trail`.

## Authorization policy

One rule deciding whether an actor may perform an operation on a target.

Term `term/authorization-policy`.

## Business record

One thing kept consistent and changed in one step.

Term `term/business-record`. Rejected: entity.

## Case

One worked example leading from a situation to one named result.

Term `term/case`. Rejected: acceptance criterion.

## Central package management

One central file pinning every dependency version in the workspace.

Term `term/central-package-management`.

## Command

One message that changes business state through the command pipeline.

Term `term/command`.

## Command page

One page documenting a shipped command: arguments, options, exit codes, and underneath.

Term `term/command-page`.

## Component inventory

The list of shipped components published with each release artifact.

Term `term/component-inventory`. Rejected: SBOM.

## Configuration page

One page holding every setting a reader can change.

Term `term/configuration-page`.

## Constraint

One outside rule the product obeys, such as a law or provider terms.

Term `term/constraint`.

## Controlled technical prose

The fixed profile for structures, bounded prose, exact terms, and testable provisions.

Term `term/controlled-technical-prose`.

## Convention

One replaceable default for a name, location, file shape, or pattern.

Term `term/convention`.

## CORS

The browser rule deciding which origins may call the API.

Term `term/cors`.

## Current standards material

The pinned release without transition or history material.

Term `term/current-standards-material`.

## Decision

One dated choice with options weighed, evidence cited, and a decider named.

Term `term/decision`. Rejected: product decision.

## Derived artifact

One committed file produced from an authored source, such as generated types.

Term `term/derived-artifact`.

## Domain

The real-world knowledge, language, rules, state, and behavior the software models.

Term `term/domain`.

## Domain event

One immutable record describing a completed fact inside the boundary.

Term `term/domain-event`.

## Domain repository

One port that loads and stages complete business records.

Term `term/domain-repository`. Rejected: repository used alone.

## Engineering system

One connected set of decisions, specifications, standards, verification, and release practices.

Term `term/engineering-system`.

## Entry point

One way people or systems reach the product.

Term `term/entry-point`.

## Event

One immutable statement that a relevant fact completed.

Term `term/event`.

## Event reaction

Behavior caused by an event, without prescribing its implementation.

Term `term/event-reaction`.

## Exception

One recorded departure from a standard, with reason and review date.

Term `term/exception`. Rejected: override, standards override.

## Extension

One conditional standards bundle a project selects when its criterion holds.

Term `term/extension`.

## Feature

One offer against a problem: planned, shipped, later, or refused.

Term `term/feature`.

## How-to page

One page solving a stated problem for a reader with a working result.

Term `term/how-to-page`.

## Input validation

Checks on a command or query shape before business behavior runs.

Term `term/input-validation`.

## Integration event

One versioned message contract delivered outside the boundary.

Term `term/integration-event`.

## Journey

The ordered steps by which an actor reaches one goal.

Term `term/journey`.

## Known gap

One known missing piece with an owner and an end date.

Term `term/known-gap`.

## Layer

One of the depths a documentation page answers at.

Term `term/layer`.

## Limit

One bound the product runs within.

Term `term/limit`. Rejected: operating limit.

## LiteSpec

The standards contract for specifying, building, verifying, releasing, and operating software with agents.

Term `term/litespec`.

## LiteSpec release

One published, pinned, complete standards contract.

Term `term/litespec-release`.

## Lockfile

The committed file recording the exact resolved dependency versions.

Term `term/lockfile`.

## Module

One business area organizing language, records, use cases, and ownership.

Term `term/module`.

## Normative

Required for a conforming consumer through an identified provision.

Term `term/normative`.

## Page

One authored Markdown file under the documentation root.

Term `term/page`.

## Page segment

The part of a provision ID naming its owning page.

Term `term/page-segment`.

## Page style

One page template for prose or record lists.

Term `term/page-style`. Rejected: page class.

## Permission

One allowed action from the shared closed list.

Term `term/permission`.

## Persistence constraint

One rule enforced by durable storage, such as uniqueness.

Term `term/persistence-constraint`.

## Problem

One pain or job someone has today.

Term `term/problem`.

## Product

The software capability offered to users, with its boundary and exclusions.

Term `term/product`.

## Product topic

One business-intent page carrying requirement entries.

Term `term/product-topic`.

## Projection

One read model derived from authoritative facts.

Term `term/projection`.

## Provision

One identified standard or convention block with one assertion.

Term `term/provision`.

## Provision ID

The identifier of one provision, naming kind, page, and heading.

Term `term/provision-id`.

## Query

One message reading a read model without changing business state.

Term `term/query`.

## Rate limit

One bound on request frequency at an exposed endpoint.

Term `term/rate-limit`.

## Read model

Data shaped for a query, without business record loading.

Term `term/read-model`.

## Recovery objectives

The accepted time and data loss bounds for a restore.

Term `term/recovery-objectives`.

## Reference cast

The people, place, dates, and amounts every scenario draws on.

Term `term/reference-cast`.

## Reference page

One page of exact values a reader looks up.

Term `term/reference-page`.

## Requirement

One thing the product does or guarantees.

Term `term/requirement`. Rejected: product rule.

## Research

One outside fact informing a choice.

Term `term/research`. Rejected: decision evidence.

## Result

One way a use case ends: success or a named refusal.

Term `term/result`.

## Role

One named set of permissions an actor may hold at a scope.

Term `term/role`.

## Roll-forward

Recovery by deploying a newer version rather than restoring the old one.

Term `term/roll-forward`.

## Runbook

The steps to run or recover the product.

Term `term/runbook`.

## Scenario

One concrete occasion for a specification subject, stating who acts.

Term `term/scenario`.

## Secret inventory

The list of production secrets with owner, location, and rotation date.

Term `term/secret-inventory`.

## Source material

Research kept outside the documentation, carrying no authority alone.

Term `term/source-material`.

## Specification

One approved statement of required behavior or constraint.

Term `term/specification`.

## Specification metadata

The opening block stating a page type, owner, status, and records.

Term `term/specification-metadata`. Rejected: frontmatter.

## Specification-driven delivery

Delivery where approved specifications select work and define completion.

Term `term/specification-driven-delivery`.

## Standard

One identified provision stating a required boundary for consumers.

Term `term/standard`.

## Sub-processor

One provider processing personal data for the product.

Term `term/sub-processor`.

## Term

One word with a meaning, labels per language, and rejected words.

Term `term/term`.

## Trace context

The trace and span identifiers carried across logs and calls.

Term `term/trace-context`.

## Tutorial

One page taking a reader to a first working result.

Term `term/tutorial`.

## Underneath

The command page section stating what the command runs.

Term `term/underneath`.

## Use case

One command or query with its permissions, results, and cases.

Term `term/use-case`.

## Value object

One immutable type defined by its values rather than identity.

Term `term/value-object`.

## Workspace

The repository holding a consumer application or the standards.

Term `term/workspace`. Rejected: repo.
