# Glossary

## Actor

One person, company, provider, system, or guest that acts in the product.

Term `term/actor`.

## Agent

Software that reads task context, plans bounded work, changes the files it is allowed to change, and runs verification.

Term `term/agent`.

## Agent-driven engineering

The operating model where agents do engineering work and people keep decision authority.

Term `term/agent-driven-engineering`.

## Aggregate root

The single type through which outside code changes a business record.

Term `term/aggregate-root`.

## Alert inventory

The list of alerts a product can fire, with the runbook each alert names.

Term `term/alert-inventory`.

## AppHost

The local orchestrator that starts every application and its dependencies together for development.

Term `term/apphost`.

## Architecture layer

One project boundary in the backend: Domain, Application, Application.Abstractions, Infrastructure, or WebApi.

Term `term/architecture-layer`.

## Audit record

One entry stating actor, action, target, outcome, time, origin, and reason.

Term `term/audit-record`.

## Audit trail

The append-only store that holds audit records, kept separate from logs and domain events.

Term `term/audit-trail`.

## Authorization policy

One rule deciding whether an actor may perform an operation on a target.

Term `term/authorization-policy`.

## Business record

One unit of business state that stays consistent and changes in one step.

Term `term/business-record`. Rejected: entity.

## Case

One worked example leading from a situation to one named result.

Term `term/case`. Rejected: acceptance criterion.

## Central package management

One central file pinning every dependency version in the workspace.

Term `term/central-package-management`.

## Command

One message that changes business state by running through the command pipeline.

Term `term/command`.

## Command page

One page that documents one shipped command: its arguments, options, exit codes, and what it runs underneath.

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

The fixed writing profile that sets the allowed structures, prose bounds, exact terms, and testable provisions.

Term `term/controlled-technical-prose`.

## Convention

One replaceable default for a name, location, file shape, or pattern.

Term `term/convention`.

## CORS

The browser rule that decides which origins can call the API.

Term `term/cors`.

## Current standards material

The pinned release taken on its own, without transition or history material.

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

One immutable record that describes a fact completed inside the bounded context.

Term `term/domain-event`.

## Domain repository

One boundary interface that loads and stages complete business records.

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

Behavior that an event causes, stated without prescribing how it runs.

Term `term/event-reaction`.

## Exception

One recorded departure from a standard, with reason and review date.

Term `term/exception`. Rejected: override, standards override.

## Extension

One conditional standards bundle a project selects when its criterion holds.

Term `term/extension`.

## Feature

One planned answer to a problem, tracked as planned, shipped, later, or refused.

Term `term/feature`.

## How-to page

One page that solves one stated problem for a reader who already has a working result.

Term `term/how-to-page`.

## Input validation

Checks on the shape of a command or query, run before business behavior runs.

Term `term/input-validation`.

## Integration event

One versioned message contract delivered outside the bounded context.

Term `term/integration-event`.

## Journey

The ordered steps by which an actor reaches one goal.

Term `term/journey`.

## Known gap

One known missing piece with an owner and an end date.

Term `term/known-gap`.

## Layer

One depth of documentation, from a first working result down to the mechanism a command runs.

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

Required of a conforming consumer through an identified provision.

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

## Preset

One ready-made selection of shape, stacks, and frontends for a new project.

Term `term/preset`.

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

The identifier of one provision, naming its owning page and heading.

Term `term/provision-id`.

## Query

One message that reads a read model without changing business state.

Term `term/query`.

## Rate limit

One bound on request frequency at an exposed endpoint.

Term `term/rate-limit`.

## Read model

Data shaped for a query, served without loading a business record.

Term `term/read-model`.

## Record-driven delivery

Delivery where approved records select work and define completion.

Term `term/record-driven-delivery`.

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

One behavior the product shows or one guarantee it keeps.

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

## Rule

One testable commitment stating what holds.

Term `term/rule`.

## Runbook

The steps to run or recover the product.

Term `term/runbook`.

## Scenario

One concrete occasion for a specification subject, stating who acts.

Term `term/scenario`.

## Secret inventory

The list of production secrets, each with its owner, location, and rotation date.

Term `term/secret-inventory`.

## Shape

One deployment boundary of a project: server or client-only.

Term `term/shape`.

## Size

One of the required-record sets of a project: small or large.

Term `term/size`.

## Source material

Research kept outside the documentation, which carries no authority on its own.

Term `term/source-material`.

## Specification

One approved statement of required behavior or constraint.

Term `term/specification`.

## Specification metadata

The opening block stating a page type, owner, status, and records.

Term `term/specification-metadata`. Rejected: frontmatter.

## Stack

One technology binding of the specification, held in one folder.

Term `term/stack`.

## Standard

One identified provision stating a required boundary for consumers.

Term `term/standard`.

## Sub-processor

One provider processing personal data for the product.

Term `term/sub-processor`.

## Term

One word with one meaning, labels in each language, and rejected synonyms.

Term `term/term`.

## Trace context

The trace and span identifiers carried across logs and calls.

Term `term/trace-context`.

## Tutorial

One page that takes a reader to a first working result.

Term `term/tutorial`.

## Underneath

The command page section stating what the command runs.

Term `term/underneath`.

## Use case

One command or query with its permissions, results, and cases.

Term `term/use-case`.

## Value object

One immutable type defined by its values rather than by identity.

Term `term/value-object`.

## Workspace

The repository that holds a consumer application or the standards.

Term `term/workspace`. Rejected: repo.
