# Marten Persistence

## Intent


Marten is the baseline persistence model. Commands load and stage aggregates through Domain-owned repositories. Queries use Marten directly in Application because the selected profile treats document queries as an explicit read-side dependency.

One scoped document session and one LiteBus command post-handler own the transaction boundary.

## Agent Summary {#agent-summary}


- Stage aggregate writes through repositories. (PERSIST.WRITE.001)
- Query through IQuerySession. (PERSIST.READ.001)
- Commit once in the command pipeline. (PERSIST.COMMIT.001)
- Collect events without a public unit of work. (PERSIST.EVENTS.001)
- Stage Workflow progress with outgoing work. (PERSIST.WORKFLOW.001)
- Keep mappings and aliases explicit. (PERSIST.MAPPING.001)
- Keep serialization behavior out of Domain. (PERSIST.SERIALIZATION.001)
- Evolve stored document contracts explicitly. (PERSIST.EVOLUTION.001)
- Bound aggregate document growth. (PERSIST.DOCUMENT.001)
- Use database naming conventions. (PERSIST.NAMING.001)

## Standards


### Stage aggregate writes through repositories (PERSIST.WRITE.001)

**Requirement:** Consumers MUST stage aggregate writes through repositories.

**Rationale:** Infrastructure implements each Domain repository with the scoped `IDocumentSession`. A repository loads and stores one aggregate type and any owned document records required by that aggregate boundary.

Repositories do not expose sessions, generic query methods, or `SaveChangesAsync`. Command handlers do not inject `IDocumentSession`.

### Query through IQuerySession (PERSIST.READ.001)

**Requirement:** Consumers MUST query through IQuerySession.

**Rationale:** Application query handlers inject `IQuerySession` and project directly to result records. The implementation applies filters, authorization scope, ordering, and limits before materialization.

The implementation does not add `IDatabaseContext`, `IReadDatabase`, callback wrappers, generic read repositories, or one read-store interface per aggregate.

### Commit once in the command pipeline (PERSIST.COMMIT.001)

**Requirement:** Consumers MUST commit once in the command pipeline.

**Rationale:** A global LiteBus command post-handler calls `IDocumentSession.SaveChangesAsync` once after the command handler succeeds. A failed command leaves the scoped session uncommitted.

Handlers, repositories, validators, event reaction implementations, workflow orchestrators, and endpoints do not call `SaveChangesAsync`.

### Collect events without a public unit of work (PERSIST.EVENTS.001)

**Requirement:** Consumers MUST collect events without a public unit of work.

**Rationale:** Infrastructure repositories register touched aggregates with an internal scoped event buffer. The command post-handler collects their pending events before committing.

For `best-effort-optional` in-process delivery:

1. The implementation stages aggregate changes.
2. The implementation collects pending domain events.
3. The implementation commits the Marten session.
4. The implementation publishes collected events through LiteBus.
5. Clear events after successful publication or according to the documented retry behavior.

A publication failure occurs after the business commit. The implementation uses this path only when loss is explicitly accepted. The `outbox-worker` extension supplies required durable delivery. The implementation uses an atomic or rebuildable projection path for required Read Models.

### Stage Workflow progress with outgoing work (PERSIST.WORKFLOW.001)

**Requirement:** Consumers MUST stage Workflow progress with outgoing work.

**Rationale:** A durable Workflow advancement stages its Workflow state and outgoing Command envelope in the same scoped `IDocumentSession`. The command post-handler commits both once. The Worker dispatches the outgoing Command only after that commit.

The Workflow Orchestrator, its handler, and its stores do not call `SaveChangesAsync`. A failure before commit advances neither progress nor outgoing work. At-least-once dispatch requires the issued Command to handle duplicate delivery safely.

### Keep mappings and aliases explicit (PERSIST.MAPPING.001)

**Requirement:** Consumers MUST keep mappings and aliases explicit.

**Rationale:** Infrastructure owns Marten store configuration. Each stored aggregate declares a stable document alias, typed-ID mapping, and indexes required by accepted queries.

The implementation does not rely on a CLR rename to preserve a document type or collection name.

### Keep serialization behavior out of Domain (PERSIST.SERIALIZATION.001)

**Requirement:** Consumers MUST keep serialization behavior out of Domain.

**Rationale:** Infrastructure owns the JSON contract for stored documents. The implementation configures private-state access, member names, constructors, converters, and polymorphic hierarchies through its selected JSON contract.

The selected contract uses `System.Text.Json` or an approved serializer adapter dependency.

The implementation registers every concrete type that may appear behind a base class or interface property, collection element, or nested value. The implementation uses stable string discriminators that do not depend on CLR type names, namespaces, or assembly-qualified names. The implementation rejects unknown discriminators instead of materializing incomplete state. The implementation sets `AllowOutOfOrderMetadataProperties` for `System.Text.Json` polymorphic documents because PostgreSQL `jsonb` does not preserve property order.

Domain types do not use `JsonInclude`, `JsonDerivedType`, `JsonPolymorphic`, Marten attributes, provider base classes, or other serialization behavior. If Infrastructure configuration cannot round-trip an aggregate without weakening its encapsulation, persist an Infrastructure-owned document type and map it to the Domain aggregate.

Every Aggregate `State` property is one persisted polymorphic value. Infrastructure registers the abstract `{Aggregate}State` base and every sealed state record with stable string discriminators. It does not persist a second enum, status string, boolean flag, or nullable timestamp on the Domain Aggregate.

### Evolve stored document contracts explicitly (PERSIST.EVOLUTION.001)

**Requirement:** Consumers MUST evolve stored document contracts explicitly.

**Rationale:** The implementation treats JSON member names, required values, discriminator property names, and discriminator values as database schema. An additive member defines behavior for documents written before that member existed.

A rename, removal, type change, member move, collection-shape change, or discriminator change requires a reviewed data transformation. Alternatively, use an expand-and-contract rollout that reads every stored shape during deployment and rollback. The implementation names the transformation order, mixed-version behavior, rollback condition, and representative production volume. The implementation does not assume a Marten schema patch transforms existing document payloads.

Old contract readers remain until no stored document or supported rollback artifact can produce or require the old shape.

### Bound aggregate document growth (PERSIST.DOCUMENT.001)

**Requirement:** Consumers MUST bound aggregate document growth.

**Rationale:** The implementation stores state required by the aggregate's transactional invariants in its document. The implementation does not embed a collection with no accepted business bound. The implementation uses one of these patterns when growth does not belong inside the aggregate boundary:

- Another aggregate for an independent consistency boundary.
- An owned document record committed in the same Marten transaction.
- A read-side projection for query-shaped history or detail.

For aggregates with nested collections or large values, record representative serialized size and test load and write behavior at that size. When accepted writes can overlap, activate `concurrency-idempotency` and test conflicts with representative document sizes.

### Use database naming conventions (PERSIST.NAMING.001)

**Requirement:** Consumers MUST use database naming conventions.

**Rationale:** PostgreSQL schemas, tables, columns, indexes, constraints, document aliases, and custom SQL identifiers use `snake_case`. .NET types retain normal C# naming.

### Control production schema changes (PERSIST.SCHEMA.001)

**Requirement:** Consumers MUST control production schema changes.

**Rationale:** Development and disposable integration databases may use automatic schema application. Hosted environments use a reviewed schema application step before traffic shifts.

WebApi replicas do not compete to alter the schema during startup.

### Test persistence against PostgreSQL (PERSIST.TEST.001)

**Requirement:** Consumers MUST test persistence against PostgreSQL.

**Rationale:** Repository behavior, query projections, mappings, indexes required for correctness, commit behavior, and schema application run against the pinned PostgreSQL version through Testcontainers.

In-memory substitutes cannot prove persistence behavior.

## Conventions


### Use this Infrastructure layout (MARTEN.CONVENTION.001)

**Default:** Use this Infrastructure layout.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Example:**

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
      Posts/                        single aggregate whose name matches the module: files directly under the module
        PostRepository.cs
        PostMartenConfiguration.cs
      Audience/                     two aggregates: one folder per aggregate
        BuyerAccounts/
          BuyerAccountRepository.cs
          BuyerAccountMartenConfiguration.cs
        Consents/
          ConsentRepository.cs
          ConsentMartenConfiguration.cs
      Workflows/
        OrderFulfillmentWorkflowStore.cs
        WorkflowCommandOutbox.cs
```

The module folders follow `ARCH.MODULES.001`. A single-aggregate module stays flat when its aggregate root's plural name equals the module name. For example, `Post` stays flat under `Posts`. Otherwise, each aggregate takes its own folder.

This also applies to modules with multiple aggregates. The example keeps aggregate-specific configuration beside the aggregate. The example keeps session and commit plumbing under the Marten root.

### Register one scoped session (MARTEN.CONVENTION.002)

**Default:** Register one scoped session.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** The implementation uses the WebApi request or Worker operation scope as the session lifetime. Repositories and the commit handler in one command resolve the same scoped `IDocumentSession`.

### Make ordering explicit (MARTEN.CONVENTION.003)

**Default:** Make ordering explicit.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Every query returning more than one item specifies deterministic ordering and a maximum result size. Pagination includes a stable tie-breaker.

### Review query plans for new indexes (MARTEN.CONVENTION.004)

**Default:** Review query plans for new indexes.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** The implementation adds an index from an accepted query or measured operating need. The implementation records representative data and inspect the PostgreSQL plan for complex or high-volume queries.

### Add read documents for query-shaped data (MARTEN.CONVENTION.005)

**Default:** Add read documents for query-shaped data.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Stored aggregate documents serve accepted simple reads directly. The implementation adds a module-owned read document or projection for repeated cross-aggregate composition. The same choice applies to deep polymorphic traversal or an index shape that would distort the aggregate. The implementation defines its consistency and rebuild behavior with the use case.

### Persist one explicit state object (MARTEN.CONVENTION.006)

**Default:** Persist one explicit state object.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Example:** A stable discriminator property can use `$state` with `draft`, `published`, and `archived` values. The persisted state value contains its state-specific data:

```json
{
  "state": {
    "$state": "published",
    "publishedAt": "2026-07-16T10:30:00Z"
  }
}
```

The example registers every concrete Aggregate state record in Infrastructure. Round-trip every state record through the configured Marten serializer in integration tests.

Adding a state discriminator can break an older application version during a mixed-version deployment. The release plan either prevents the older version from reading the new state or introduces a compatible reader before commands can persist that state.

## Reference example

This informative example demonstrates `PERSIST.SERIALIZATION.001` and `MARTEN.CONVENTION.001`.

An `Order` document may contain a `PaymentMethod` collection with `CardPayment` and `BankTransfer` values. Infrastructure registers stable `card` and `bank_transfer` discriminators through the JSON contract resolver. The Domain hierarchy carries no JSON attributes.

A `Post` document stores one `state` object. `PostPublishedState` uses the stable `published` discriminator and owns `publishedAt`. The document does not also store `isPublished` or an aggregate-level `publishedAt` value.

Renaming `shippingAddress.postalCode` to `shippingAddress.postcode` uses a mixed-version reader and a reviewed data transformation before the old reader is removed. A CLR property rename without that rollout is not compatible document evolution.

An accepted business rule may cap `Order.Lines` at 200 entries inside the aggregate document. An unbounded status history uses a separate read document or projection instead of growing the `Order` document indefinitely.

```csharp
internal sealed class PostRepository(
    IDocumentSession session,
    DomainEventBuffer eventBuffer) : IPostRepository
{
    public async Task<Post> GetByIdAsync(
        PostId id,
        CancellationToken cancellationToken)
    {
        var post = await session.LoadAsync<Post>(id, cancellationToken);
        return post ?? throw new PostNotFoundException();
    }

    public void Store(Post post)
    {
        session.Store(post);
        eventBuffer.Track(post);
    }
}
```

## Verification


| ID | Method | Evidence |
|:---|:---|:---|
| PERSIST.WRITE.001 | inspection | Pull request review asserts `stage aggregate writes through repositories` in the owning specification and source paths. |
| PERSIST.READ.001 | inspection | Pull request review asserts `query through IQuerySession` in the owning specification and source paths. |
| PERSIST.COMMIT.001 | inspection | Pull request review asserts `commit once in the command pipeline` in the owning specification and source paths. |
| PERSIST.EVENTS.001 | inspection | Pull request review asserts `collect events without a public unit of work` in the owning specification and source paths. |
| PERSIST.WORKFLOW.001 | inspection | Pull request review asserts `stage Workflow progress with outgoing work` in the owning specification and source paths. |
| PERSIST.MAPPING.001 | inspection | Pull request review asserts `keep mappings and aliases explicit` in the owning specification and source paths. |
| PERSIST.SERIALIZATION.001 | inspection | Pull request review asserts `keep serialization behavior out of Domain` in the owning specification and source paths. |
| PERSIST.EVOLUTION.001 | inspection | Pull request review asserts `evolve stored document contracts explicitly` in the owning specification and source paths. |
| PERSIST.DOCUMENT.001 | inspection | Pull request review asserts `bound aggregate document growth` in the owning specification and source paths. |
| PERSIST.NAMING.001 | inspection | Pull request review asserts `use database naming conventions` in the owning specification and source paths. |
| PERSIST.SCHEMA.001 | static | Repository static check asserts `control production schema changes` for the owning paths. |
| PERSIST.TEST.001 | test | An automated test citing `PERSIST.TEST.001` asserts `test persistence against PostgreSQL` at the affected boundary. |
| MARTEN.CONVENTION.001 | inspection | Pull request review asserts `use this Infrastructure layout` in the owning specification and source paths. |
| MARTEN.CONVENTION.002 | inspection | Pull request review asserts `register one scoped session` in the owning specification and source paths. |
| MARTEN.CONVENTION.003 | inspection | Pull request review asserts `make ordering explicit` in the owning specification and source paths. |
| MARTEN.CONVENTION.004 | inspection | Pull request review asserts `review query plans for new indexes` in the owning specification and source paths. |
| MARTEN.CONVENTION.005 | inspection | Pull request review asserts `add read documents for query-shaped data` in the owning specification and source paths. |
| MARTEN.CONVENTION.006 | inspection | Pull request review asserts `persist one explicit state object` in the owning specification and source paths. |
