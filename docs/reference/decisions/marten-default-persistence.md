---
{
  "id": "reference.decision.marten-default-persistence",
  "kind": "reference",
  "normative": false,
  "appliesTo": ["backend.application", "backend.infrastructure"],
  "recipes": []
}
---
# Marten Default Persistence

Status: Accepted for v1.

## Context

LitePress already uses Marten documents on PostgreSQL. The preliminary standard described both EF Core and Marten boundaries, which made the default unclear and kept wrappers from the EF-oriented design.

## Decision

Use Marten for the default profile. Commands write through aggregate repositories backed by `IDocumentSession`. Queries inject `IQuerySession` directly. The LiteBus command pipeline commits once.

## Consequence

The profile removes project-owned read contexts, callback wrappers, and a public unit-of-work interface. Application references Marten for query abstractions. EF Core remains available as an explicitly enabled replacement recipe with its own fixture.

