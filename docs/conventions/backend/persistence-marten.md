# Marten Persistence

## Intent

Marten is the baseline persistence model. Commands load and stage aggregates through Domain-owned repositories. Queries use Marten directly in Application because the selected profile treats document queries as an explicit read-side dependency.

One scoped document session and one LiteBus command post-handler own the transaction boundary.

## Agent Summary {#agent-summary}

- Implement Domain repositories with scoped `IDocumentSession`.
- Inject `IQuerySession` directly into Application query handlers.
- Stage writes in handlers and repositories without committing.
- Commit once in the global command post-handler.
- Collect touched-Aggregate Events before commit and apply their documented delivery classification.
- Configure JSON contracts and polymorphism in Infrastructure without Domain attributes.
- Treat stored JSON shapes, aliases, and discriminators as database contracts.
- Bound aggregate documents and use explicit indexes for accepted queries.
- Use PostgreSQL `snake_case` for database identifiers.
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

Handlers, repositories, validators, Follow-up implementations, Workflow Orchestrators, and endpoints do not call `SaveChangesAsync`.

### Collect events without a public unit of work (PERSIST.EVENTS.001)

Infrastructure repositories register touched aggregates with an internal scoped event buffer. The command post-handler collects their pending events before committing.

For `best-effort-optional` in-process delivery:

1. Stage aggregate changes.
2. Collect pending domain events.
3. Commit the Marten session.
4. Publish collected events through LiteBus.
5. Clear events after successful publication or according to the documented retry behavior.

A publication failure occurs after the business commit. Use this path only when loss is explicitly accepted. Activate `outbox-worker` for required durable delivery. Use an atomic or rebuildable projection path for required Read Models.

### Stage Workflow progress with outgoing work (PERSIST.WORKFLOW.001)

A durable Workflow advancement stages its Workflow state and outgoing Command envelope in the same scoped `IDocumentSession`. The command post-handler commits both once. The Worker dispatches the outgoing Command only after that commit.

The Workflow Orchestrator, its handler, and its stores do not call `SaveChangesAsync`. A failure before commit advances neither progress nor outgoing work. At-least-once dispatch requires the issued Command to handle duplicate delivery safely.

### Keep mappings and aliases explicit (PERSIST.MAPPING.001)

Infrastructure owns Marten store configuration. Each stored aggregate declares a stable document alias, typed-ID mapping, and indexes required by accepted queries.

Do not rely on a CLR rename to preserve a document type or collection name.

### Keep serialization behavior out of Domain (PERSIST.SERIALIZATION.001)

Infrastructure owns the JSON contract for stored documents. Configure private-state access, JSON member names, constructors, converters, and polymorphic hierarchies through the `System.Text.Json` contract model or another serializer adapter approved as a dependency.

Register every concrete type that may appear behind a base class or interface property, collection element, or nested value. Use stable string discriminators that do not depend on CLR type names, namespaces, or assembly-qualified names. Reject unknown discriminators instead of materializing incomplete state. Set `AllowOutOfOrderMetadataProperties` for `System.Text.Json` polymorphic documents because PostgreSQL `jsonb` does not preserve property order.

Domain types do not use `JsonInclude`, `JsonDerivedType`, `JsonPolymorphic`, Marten attributes, provider base classes, or other serialization behavior. If Infrastructure configuration cannot round-trip an aggregate without weakening its encapsulation, persist an Infrastructure-owned document type and map it to the Domain aggregate.

Persist the lifecycle representation selected by `DOMAIN.STATE.001` as an explicit storage contract. A typed state hierarchy registers every concrete state with stable string discriminators. An enum defines its stored representation and treats member renames or numeric changes as schema changes. An Aggregate with no lifecycle representation persists no synthetic state field.

### Evolve stored document contracts explicitly (PERSIST.EVOLUTION.001)

Treat JSON member names, required values, enum representation, discriminator property names, and discriminator values as database schema. An additive member defines behavior for documents written before that member existed.

A rename, removal, type change, member move, collection-shape change, or discriminator change requires a reviewed data transformation or an expand-and-contract rollout that reads every shape present during deployment and rollback. Name the transformation order, mixed-version behavior, rollback condition, and representative production volume. Do not assume a Marten schema patch transforms existing document payloads.

Retain old contract readers until no stored document or supported rollback artifact can produce or require the old shape.

### Bound aggregate document growth (PERSIST.DOCUMENT.001)

Store state required by the aggregate's transactional invariants in its document. Do not embed a collection with no accepted business bound. Use one of these patterns when growth does not belong inside the aggregate boundary:

- Another aggregate for an independent consistency boundary.
- An owned document record committed in the same Marten transaction.
- A read-side projection for query-shaped history or detail.

For aggregates with nested collections or large values, record representative serialized size and test load and write behavior at that size. When accepted writes can overlap, activate `concurrency-idempotency` and test conflicts with representative document sizes.

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
      Workflows/
        OrderFulfillmentWorkflowStore.cs
        WorkflowCommandOutbox.cs
```

Keep configuration beside the aggregate when it is aggregate-specific. Keep session and commit plumbing under the Marten root.

### Register one scoped session

Use the WebApi request or Worker operation scope as the session lifetime. Repositories and the commit handler in one command resolve the same scoped `IDocumentSession`.

### Make ordering explicit

Every query returning more than one item specifies deterministic ordering and a maximum result size. Pagination includes a stable tie-breaker.

### Review query plans for new indexes

Add an index from an accepted query or measured operating need. Record representative data and inspect the PostgreSQL plan for complex or high-volume queries.

### Add read documents for query-shaped data

Query stored aggregate documents directly while accepted reads remain simple. Add a subject-owned read document or projection when a real query needs repeated cross-aggregate composition, deep polymorphic traversal, or an index shape that would distort the aggregate. Define its consistency and rebuild behavior with the use case.

### Persist one explicit state object

Use a stable discriminator property such as `$state` with values such as `draft`, `published`, and `archived`. The persisted state value contains its state-specific data:

```json
{
  "state": {
    "$state": "published",
    "publishedAt": "2026-07-16T10:30:00Z"
  }
}
```

When typed states are selected, register every concrete state type in Infrastructure. Round-trip every supported lifecycle representation through the configured Marten serializer in integration tests.

Adding a state discriminator can break an older application version during a mixed-version deployment. The release plan either prevents the older version from reading the new state or introduces a compatible reader before commands can persist that state.

## Examples

An `Order` document may contain a `PaymentMethod` collection with `CardPayment` and `BankTransfer` values. Infrastructure registers stable `card` and `bank_transfer` discriminators through the JSON contract resolver. The Domain hierarchy carries no JSON attributes.

A `Post` document stores one `state` object. `PublishedPostState` uses the stable `published` discriminator and owns `publishedAt`. The document does not also store `isPublished` or an aggregate-level `publishedAt` value.

Renaming `shippingAddress.postalCode` to `shippingAddress.postcode` uses a mixed-version reader and a reviewed data transformation before the old reader is removed. A CLR property rename without that rollout is not compatible document evolution.

An accepted business rule may cap `Order.Lines` at 200 entries inside the aggregate document. An unbounded status history uses a separate read document or projection instead of growing the `Order` document indefinitely.

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
- Confirm aliases, JSON member contracts, discriminators, and indexes are explicit in Infrastructure.
- Round-trip private state, nested values, collections, every selected lifecycle representation, and every other registered runtime subtype without serialization behavior in Domain.
- Load stored fixtures from every supported document shape and test each required transformation and rollback reader.
- Test representative document size and query plans for aggregates with nested collections.
- When `concurrency-idempotency` is active, test conflicting writes with representative document sizes.
- Run PostgreSQL integration tests for mappings, queries, commit behavior, document evolution, and schema application.
