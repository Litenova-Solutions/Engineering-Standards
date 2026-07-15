# Marten Default Persistence

Status: Accepted for v1.

## Context

The preliminary standard described both EF Core and Marten boundaries. That left agents without one default and retained wrappers designed for a different persistence model.

## Decision

Use Marten for the default profile. Commands write through aggregate repositories backed by `IDocumentSession`. Queries inject `IQuerySession` directly. The LiteBus command pipeline commits once.

## Consequences

The profile removes project-owned read contexts, callback wrappers, and a public unit-of-work interface. Application references Marten for query abstractions. EF Core remains available through the explicitly enabled `persistence-ef-core` extension.
