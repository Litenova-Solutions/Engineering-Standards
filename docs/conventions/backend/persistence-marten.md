# Marten Persistence

## Intent

Marten is the baseline persistence model. Commands load and stage aggregates through Domain-owned repositories. Queries use Marten directly in Application because the selected profile treats document queries as an explicit read-side dependency.

One scoped document session and one LiteBus command post-handler own the transaction boundary.

## Agent Summary {#agent-summary}

- Implement Domain repositories with scoped `IDocumentSession`.
- Inject `IQuerySession` directly into Application query handlers.
- Stage writes in handlers and repositories without committing.
- Commit once in the global command post-handler.
- Collect touched-aggregate events before commit and publish best-effort events after commit.
- Use PostgreSQL `snake_case`, stable document aliases, and explicit indexes.
- Apply schema changes outside production request startup.

## Standards

### Stage aggregate writes through repositories (PERSIST.WRITE.001)

Infrastructure implements each Domain repository with the scoped `IDocumentSession`. A repository loads and stores one aggregate type and any owned document records required by that aggregate boundary.

Repositories do not expose sessions, generic query methods, or `SaveChangesAsync`. Command handlers do not inject `IDocumentSession`.

### Query through IQuerySession (PERSIST.READ.001)

Application query handlers inject `IQuerySession` and project directly to result records. Apply filters, authorization scope, ordering, and limits before materialization.

Do not add `IDatabaseContext`, `IReadDatabase`, callback wrappers, generic read repositories, or one read-store interface per aggregate.

### Commit once in the command pipeline (PERSIST.COMMIT.001)

A global LiteBus command post-handler calls `IDocumentSession.SaveChangesAsync` once after the command handler succeeds. A failed command leaves the scoped session uncommitted.

Handlers, repositories, validators, reactions, and endpoints do not call `SaveChangesAsync`.

### Collect events without a public unit of work (PERSIST.EVENTS.001)

Infrastructure repositories register touched aggregates with an internal scoped event buffer. The command post-handler collects their pending events before committing.

For best-effort in-process delivery:

1. Stage aggregate changes.
2. Collect pending domain events.
3. Commit the Marten session.
4. Publish collected events through LiteBus.
5. Clear events after successful publication or according to the documented retry behavior.

A publication failure occurs after the business commit. Activate `outbox-worker` when that loss is unacceptable.

### Keep mappings and aliases explicit (PERSIST.MAPPING.001)

Infrastructure owns Marten store configuration. Each stored aggregate declares a stable document alias, typed-ID mapping, indexes required by accepted queries, and serialization behavior for private state.

Do not rely on a CLR rename to preserve a document type or collection name.

### Use database naming conventions (PERSIST.NAMING.001)

PostgreSQL schemas, tables, columns, indexes, constraints, document aliases, and custom SQL identifiers use `snake_case`. .NET types retain normal C# naming.

### Control production schema changes (PERSIST.SCHEMA.001)

Development and disposable integration databases may use automatic schema application. Hosted environments use a reviewed schema application step before traffic shifts.

WebApi replicas do not compete to alter the schema during startup.

### Test persistence against PostgreSQL (PERSIST.TEST.001)

Repository behavior, query projections, mappings, indexes required for correctness, commit behavior, and schema application run against the pinned PostgreSQL version through Testcontainers.

In-memory substitutes cannot prove persistence behavior.

## Conventions

### Use this Infrastructure layout

```text
{ProjectName}.Infrastructure/
  Persistence/
    Marten/
      MartenServiceRegistration.cs
      MartenStoreConfiguration.cs
      Commands/
        SaveChangesCommandPostHandler.cs
      Events/
        DomainEventBuffer.cs
      Posts/
        PostRepository.cs
        PostMartenConfiguration.cs
```

Keep configuration beside the aggregate when it is aggregate-specific. Keep session and commit plumbing under the Marten root.

### Register one scoped session

Use the WebApi request or Worker operation scope as the session lifetime. Repositories and the commit handler in one command resolve the same scoped `IDocumentSession`.

### Make ordering explicit

Every query returning more than one item specifies deterministic ordering and a maximum result size. Pagination includes a stable tie-breaker.

### Review query plans for new indexes

Add an index from an accepted query or measured operating need. Record representative data and inspect the PostgreSQL plan for complex or high-volume queries.

## Examples

```csharp
internal sealed class PostRepository(
    IDocumentSession session,
    DomainEventBuffer eventBuffer) : IPostRepository
{
    public Task<Post?> GetByIdAsync(
        PostId id,
        CancellationToken cancellationToken) =>
        session.LoadAsync<Post>(id.Value, cancellationToken);

    public void Store(Post post)
    {
        session.Store(post);
        eventBuffer.Track(post);
    }
}
```

## Verification

- Search handlers and repositories for `SaveChangesAsync`.
- Confirm repositories use the scoped session and track changed aggregates.
- Confirm queries project results and have deterministic limits and ordering.
- Confirm aliases and indexes are explicit.
- Run PostgreSQL integration tests for mappings, queries, commit behavior, and schema application.
