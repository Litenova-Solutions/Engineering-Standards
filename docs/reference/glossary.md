---
{
  "id": "reference.glossary",
  "kind": "reference",
  "normative": false,
  "appliesTo": ["all"],
  "recipes": []
}
---
# Glossary

## ADDD

Agentic Domain-Driven Delivery. The project method that connects a thin product brief, domain language, one-file use-case specifications, implementation, automated evidence, and release operations.

## Aggregate

A consistency boundary that protects business invariants during a command.

## Application profile

A supported combination of architecture, frameworks, project layout, and gates. V1 contains the `dotnet-nextjs` profile.

## Capability

A business grouping used for feature folders. Capabilities remain inside the one bounded context supported by v1.

## Critical assurance

Extra specification and evidence required when a use case handles authorization, money, sensitive data, irreversible behavior, concurrency, durable delivery, or availability.

## Domain event

A package-free Domain record describing a business fact raised by an aggregate.

## Generated artifact

A committed file produced deterministically from authored sources. Examples include the rule catalog, use-case index, trace report, OpenAPI document, and TypeScript API types.

## Profile rule

A normative rule that applies when a consumer selects the profile.

## Recipe

An optional rule set enabled by a documented trigger in `standards.project.json`.

## Standard assurance

The default use-case depth when no criticality trigger applies.

## Use-case specification

The one authored operation file containing intent, contract, business rules, flows, failures, examples, and acceptance criteria.

