# Marten Default Persistence

Status: Accepted for v1.

## Context

The preliminary standard described both EF Core and Marten boundaries. That left agents without one default and retained wrappers designed for a different persistence model.

The baseline domain model permits aggregates with private state, nested value objects, owned collections, and polymorphic members. Mapping those graphs to relational tables through EF Core can require persistence-only identities, navigations, setters, or a separate persistence model. Mapping most of the same graph to JSON through EF Core retains its model configuration while using it as a document mapper.

SurrealDB was considered as a document and graph database. Adopting it would add a database engine, query language, client, deployment model, and recovery path without an accepted requirement for its graph or realtime capabilities. Marten keeps PostgreSQL as the operating platform and adds a document model designed for .NET.

## Decision

Use PostgreSQL with Marten document persistence for the default profile. Commands write through aggregate repositories backed by `IDocumentSession`. Queries inject `IQuerySession` directly. The LiteBus command pipeline commits once.

Treat each stored document shape as a database contract. Infrastructure owns aliases, JSON member contracts, polymorphic discriminators, indexes, and data transformations. Domain remains free of Marten and serialization behavior.

## Consequences

The profile reduces relational mapping pressure on aggregate design while retaining PostgreSQL transactions, SQL access, indexing, backup, and recovery. It does not make persistence concerns disappear. JSON names and discriminators require compatibility, incompatible shape changes require data evolution, nested queries require measured indexes, and growing documents require explicit bounds and concurrency tests.

The profile removes project-owned read contexts, callback wrappers, and a public unit-of-work interface. Application references Marten for query abstractions. EF Core remains available through the explicitly enabled `persistence-ef-core` extension when an accepted use case requires a relational write model.
