# Marten Persistence

## Intent


Marten is the baseline persistence model. Commands load and stage aggregates through Domain-owned repositories. Queries use Marten directly in Application because the selected profile treats document queries as an explicit read-side dependency.

One scoped document session and one LiteBus command post-handler own the transaction boundary.

## Agent Summary {#agent-summary}


- Commands write through repositories, never the session directly. (PERSIST.WRITE.001)
- Queries project through the read session with scope and limits applied. (PERSIST.READ.001)
- One post-handler commits each command; nothing else calls save. (PERSIST.COMMIT.001)
- Repositories buffer events for the post-handler to drain. (PERSIST.EVENTS.001)
- Workflow progress and outgoing work commit in one transaction. (PERSIST.WORKFLOW.001)
- Document aliases and identifier mappings are declared explicitly. (PERSIST.MAPPING.001)
- Infrastructure owns the stored JSON contract, not Domain. (PERSIST.SERIALIZATION.001)
- Stored contract changes carry a reviewed transformation. (PERSIST.EVOLUTION.001)
- Aggregate documents carry no unbounded collection. (PERSIST.DOCUMENT.001)
- Database identifiers use snake case. (PERSIST.NAMING.001)

## Standards


### Stage aggregate writes through repositories (PERSIST.WRITE.001)

**Requirement:** A command handler MUST reach persistence only through a Domain repository, never through `IDocumentSession`.

**Rationale:** Infrastructure implements each repository with the scoped session. A repository loads one aggregate type and exposes no session, generic query, or save operation.

### Query through IQuerySession (PERSIST.READ.001)

**Requirement:** A query handler MUST project through `IQuerySession`, applying filter, scope, ordering, and limit before materialization.

**Rationale:** A read-store interface per aggregate, a generic read repository, or a callback wrapper adds a layer that the session already provides.

### Commit once in the command pipeline (PERSIST.COMMIT.001)

**Requirement:** Exactly one global command post-handler MUST call `SaveChangesAsync` for a command pipeline.

**Rationale:** A failed command then leaves the scoped session uncommitted. Handlers, repositories, validators, reactions, orchestrators, and endpoints never commit.

### Collect events without a public unit of work (PERSIST.EVENTS.001)

**Requirement:** A repository MUST register each touched aggregate with the internal scoped event buffer that the post-handler drains.

**Rationale:** The post-handler collects pending events before committing, so no public unit-of-work type is needed. Best-effort delivery publishes after the commit succeeds.

### Stage Workflow progress with outgoing work (PERSIST.WORKFLOW.001)

**Requirement:** A durable workflow advancement MUST stage its workflow state and outgoing command envelope in the same scoped session.

**Rationale:** The post-handler commits both once and the Worker dispatches only after that commit. A failure before commit advances neither progress nor outgoing work.

### Keep mappings and aliases explicit (PERSIST.MAPPING.001)

**Requirement:** Each stored aggregate MUST declare a stable document alias, typed-identifier mapping, and the indexes its accepted queries need.

**Rationale:** A CLR rename then cannot change a document type or collection name. Infrastructure owns the store configuration.

### Keep serialization behavior out of Domain (PERSIST.SERIALIZATION.001)

**Requirement:** Infrastructure MUST own the JSON contract for stored documents, including member names, constructors, converters, and polymorphic registration.

**Rationale:** Domain stays free of serialization attributes. Every concrete type behind a base or interface is registered, because an unregistered subtype fails at read time.

### Evolve stored document contracts explicitly (PERSIST.EVOLUTION.001)

**Requirement:** A rename, removal, type change, member move, or discriminator change MUST have a reviewed data transformation or an expand-and-contract rollout.

**Rationale:** JSON member names, required values, and discriminator values are database schema. An additive member still defines its behavior for documents written earlier.

### Bound aggregate document growth (PERSIST.DOCUMENT.001)

**Requirement:** An aggregate document MUST NOT embed a collection that has no accepted business bound.

**Rationale:** Unbounded growth belongs in another aggregate, an owned document record, or a separate query-shaped document, depending on the consistency boundary it needs.

### Use database naming conventions (PERSIST.NAMING.001)

**Requirement:** A PostgreSQL schema, table, column, index, constraint, document alias, or SQL identifier MUST use `snake_case`.

**Rationale:** .NET types keep normal C# naming, so the mapping layer performs the conversion once.

### Control production schema changes (PERSIST.SCHEMA.001)

**Requirement:** A hosted environment MUST apply schema changes through a reviewed step before traffic shifts, not from a starting replica.

**Rationale:** Development and disposable integration databases may still apply schema automatically. Replicas competing to alter a schema during startup produce nondeterministic results.

### Test persistence against PostgreSQL (PERSIST.TEST.001)

**Requirement:** Repository behavior, projections, mappings, correctness indexes, commit behavior, and schema application MUST run against the pinned PostgreSQL through Testcontainers.

**Rationale:** An in-memory substitute cannot prove persistence behavior, because it does not run the query planner or the constraints.

## Conventions


### Use this Infrastructure layout (PERSIST.CONVENTION.001)

**Default:** Place Marten configuration, repositories, commit behavior, and serialization under one Infrastructure persistence folder.

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

### Register one scoped session (PERSIST.CONVENTION.002)

**Default:** Register `IDocumentSession` with the WebApi request or Worker operation scope.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Repositories and the commit handler in one command then resolve the same session instance.

### Make ordering explicit (PERSIST.CONVENTION.003)

**Default:** Give every multi-item query deterministic ordering, a maximum result size, and a stable pagination tie-breaker.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Without a tie-breaker, two pages can repeat or skip a row when sort values collide.

### Review query plans for new indexes (PERSIST.CONVENTION.004)

**Default:** Add an index only from an accepted query or a measured operating need, and inspect its plan on representative data.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** An index added without a plan reading costs write throughput for a read that may never run.

### Add read documents for query-shaped data (PERSIST.CONVENTION.005)

**Default:** Add a module-owned read document for repeated cross-aggregate composition, deep traversal, or a distorting index shape.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Stored aggregate documents already serve accepted simple reads. The use case defines the read document's consistency and rebuild behavior.

### Persist one explicit state object (PERSIST.CONVENTION.006)

**Default:** Persist the aggregate state record itself rather than a flattened projection of its fields.

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

This informative example demonstrates `PERSIST.SERIALIZATION.001` and `PERSIST.CONVENTION.001`.

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
| PERSIST.WRITE.001 | inspection | `ArchitectureTests` asserts no command handler resolves `IDocumentSession` and no repository exposes it. |
| PERSIST.READ.001 | inspection | `ArchitectureTests` asserts each query handler resolves `IQuerySession` and no read-store abstraction exists. |
| PERSIST.COMMIT.001 | inspection | `ArchitectureTests` asserts `SaveChangesAsync` appears only in the command post-handler. |
| PERSIST.EVENTS.001 | inspection | `PersistenceCommitTests` asserts pending events are collected before commit and published only after it succeeds. |
| PERSIST.WORKFLOW.001 | inspection | `WorkflowPersistenceTests` asserts progress and the outgoing envelope commit together or not at all. |
| PERSIST.MAPPING.001 | inspection | `MartenMappingTests` asserts each stored aggregate declares an explicit alias and identifier mapping. |
| PERSIST.SERIALIZATION.001 | inspection | `SerializationTests` asserts every stored polymorphic subtype round-trips under the configured contract. |
| PERSIST.EVOLUTION.001 | inspection | `DocumentEvolutionTests` reads a document written in the previous shape and asserts the declared transformation result. |
| PERSIST.DOCUMENT.001 | inspection | `DocumentSizeTests` asserts each embedded collection has a declared maximum from its use case. |
| PERSIST.NAMING.001 | inspection | `SchemaNamingTests` asserts every generated database identifier is snake case. |
| PERSIST.SCHEMA.001 | inspection | Deployment review confirms the schema step runs before traffic shifts and startup applies no schema change. |
| PERSIST.TEST.001 | test | `PersistenceIntegrationTests` runs against the manifest-pinned PostgreSQL image through Testcontainers. |
| PERSIST.CONVENTION.001 | inspection | Folder review locates store configuration, repositories, and commit behavior under the persistence folder, or records a named local replacement. |
| PERSIST.CONVENTION.002 | inspection | `SessionLifetimeTests` asserts repositories and the commit handler resolve one session per operation. |
| PERSIST.CONVENTION.003 | inspection | `QueryOrderingTests` asserts each multi-item query declares ordering, a bound, and a tie-breaker. |
| PERSIST.CONVENTION.004 | inspection | Index review records the accepted query and the PostgreSQL plan that justified it. |
| PERSIST.CONVENTION.005 | inspection | Read-document review records its consistency and rebuild behavior alongside its owning use case. |
| PERSIST.CONVENTION.006 | inspection | `SerializationTests` asserts each persisted aggregate round-trips its state record type. |
