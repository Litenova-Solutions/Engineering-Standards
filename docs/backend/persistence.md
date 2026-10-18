# Persistence

## Intent

This page states how the backend stores and reads aggregates. Commands load and stage aggregates through Domain-owned repositories. Queries read through the session directly in Application, because the selected profile treats document queries as an explicit read-side dependency.

One scoped session and one command post-handler own the transaction boundary. Marten is the baseline provider, and the `efcore` extension replaces the provider-specific rules named below.

## Agent Summary {#agent-summary}

- Commands write through repositories, never the session directly. (standards/rule/backend-persistence.stage-aggregate-writes-through-repositories)
- Queries project through the read session with scope and limits applied. (standards/rule/backend-persistence.query-through-iquerysession)
- One post-handler commits each command; nothing else calls save. (standards/rule/backend-persistence.commit-once-in-the-command-pipeline)
- Repositories buffer events for the post-handler to drain. (standards/rule/backend-persistence.collect-events-without-a-public-unit-of-work)
- Document aliases and identifier mappings are declared explicitly. (standards/rule/backend-persistence.keep-mappings-and-aliases-explicit)
- Infrastructure owns the stored JSON contract, not Domain. (standards/rule/backend-persistence.keep-serialization-behavior-out-of-domain)
- Stored contract changes carry a reviewed transformation. (standards/rule/backend-persistence.evolve-stored-document-contracts-explicitly)
- Aggregate documents carry no unbounded collection. (standards/rule/backend-persistence.bound-aggregate-document-growth)
- Database identifiers use snake case. (standards/rule/backend-persistence.use-database-naming-conventions)
- Persistence behavior is proved against PostgreSQL. (standards/rule/backend-persistence.test-persistence-against-postgresql)

## Concepts

### Provider-neutral and provider-specific rules

The provisions on this page divide into two groups. A reader replacing the provider needs to know which group moves.

| Group | What it fixes | Provisions |
|:---|:---|:---|
| Provider-neutral | The boundary, the transaction shape, and the obligations on stored data. | `standards/rule/backend-persistence.stage-aggregate-writes-through-repositories`, `standards/rule/backend-persistence.commit-once-in-the-command-pipeline`, `standards/rule/backend-persistence.collect-events-without-a-public-unit-of-work`, `standards/rule/backend-persistence.evolve-stored-document-contracts-explicitly`, `standards/rule/backend-persistence.bound-aggregate-document-growth`, `standards/rule/backend-persistence.use-database-naming-conventions`, `standards/rule/backend-persistence.control-production-schema-changes`, `standards/rule/backend-persistence.test-persistence-against-postgresql`, `standards/rule/backend-persistence.review-query-plans-for-new-indexes`, `standards/rule/backend-persistence.add-read-documents-for-query-shaped-data` |
| Provider-specific | The member names and configuration surface the pinned provider supplies. | `standards/rule/backend-persistence.query-through-iquerysession`, `standards/rule/backend-persistence.keep-mappings-and-aliases-explicit`, `standards/rule/backend-persistence.keep-serialization-behavior-out-of-domain`, `standards/rule/backend-persistence.register-one-scoped-session`, `standards/rule/backend-persistence.use-this-infrastructure-layout`, `standards/rule/backend-persistence.persist-one-explicit-state-object` |

The provider-neutral group states one obligation each, and the member named in its text is the baseline binding rather than the obligation. `standards/rule/backend-persistence.commit-once-in-the-command-pipeline` requires exactly one commit for a command pipeline; `SaveChangesAsync` is the call that performs it under the baseline provider.

The EF Core extension states in its own Baseline relationship section which provisions it replaces for the aggregates it owns. No consumer runs both providers over one aggregate.

The manifest pins both providers' packages, because the extension is part of this release. A pinned package is an available choice rather than an active one, and `standards.project.json` records which choices a consumer made.

## Standards

### Stage aggregate writes through repositories (standards/rule/backend-persistence.stage-aggregate-writes-through-repositories)

**Requirement:** A command handler MUST reach persistence only through a Domain repository, never through `IDocumentSession`.

**Rationale:** Infrastructure implements each repository with the scoped session. A repository loads one aggregate type and exposes no session, generic query, or save operation.

### Query through IQuerySession (standards/rule/backend-persistence.query-through-iquerysession)

**Requirement:** A query handler MUST project through `IQuerySession`, applying filter, scope, ordering, and limit before materialization.

**Rationale:** A read-store interface per aggregate, a generic read repository, or a callback wrapper adds a layer that the session already provides. Ordering and paging follow `standards/rule/backend-api.bound-collection-queries`.

| Provider | Query surface |
|:---|:---|
| Marten baseline | `IQuerySession` |
| EF Core extension | The context type the extension declares |

The table names the binding per provider; the obligation to project with filter, scope, ordering, and limit holds under each.

### Commit once in the command pipeline (standards/rule/backend-persistence.commit-once-in-the-command-pipeline)

**Requirement:** Exactly one global command post-handler MUST call `SaveChangesAsync` for a command pipeline.

**Rationale:** A failed command then leaves the scoped session uncommitted. Handlers, repositories, validators, reactions, and endpoints never commit.

The obligation is one commit for one pipeline, not one named method. Under the baseline provider that commit is `IDocumentSession.SaveChangesAsync`. Under the `efcore` extension it is `DbContext.SaveChangesAsync`, wrapped in an explicit transaction when the pipeline writes through more than one context.

### Collect events without a public unit of work (standards/rule/backend-persistence.collect-events-without-a-public-unit-of-work)

**Requirement:** A repository MUST register each touched aggregate with the internal scoped event buffer that the post-handler drains.

**Rationale:** The post-handler collects pending events before committing, so no public unit-of-work type is needed. Best-effort delivery publishes after the commit succeeds.

### Keep mappings and aliases explicit (standards/rule/backend-persistence.keep-mappings-and-aliases-explicit)

**Requirement:** Each stored aggregate MUST declare a stable document alias, typed-identifier mapping, and the indexes its accepted queries need.

**Rationale:** A CLR rename then cannot change a document type or collection name. Infrastructure owns the store configuration.

### Keep serialization behavior out of Domain (standards/rule/backend-persistence.keep-serialization-behavior-out-of-domain)

**Requirement:** Infrastructure MUST own the JSON contract for stored documents, including member names, constructors, converters, and polymorphic registration.

**Rationale:** Domain stays free of serialization attributes. Every concrete type behind a base or interface is registered, because an unregistered subtype fails at read time.

Registration covers the types this store actually persists. A union referenced from another aggregate is registered by the store that writes it, once, rather than by every store that names the referencing type. A type reachable only through an identifier is not persisted here and needs no registration.

### Evolve stored document contracts explicitly (standards/rule/backend-persistence.evolve-stored-document-contracts-explicitly)

**Requirement:** A rename, removal, type change, member move, or discriminator change MUST have a reviewed data transformation or an expand-and-contract rollout.

**Rationale:** JSON member names, required values, and discriminator values are database schema. An additive member still defines its behavior for documents written earlier.

An additive change is the only kind that needs no transformation, and it is additive only when every earlier document stays valid. A new member with a defined absent-value behavior qualifies. A new required member, a narrowed type, and a new discriminator value that an earlier reader rejects do not.

### Bound aggregate document growth (standards/rule/backend-persistence.bound-aggregate-document-growth)

**Requirement:** An aggregate document MUST NOT embed a collection that has no accepted business bound.

**Rationale:** Unbounded growth belongs in another aggregate, an owned document record, or a separate query-shaped document, depending on the consistency boundary it needs.

### Use database naming conventions (standards/rule/backend-persistence.use-database-naming-conventions)

**Requirement:** A PostgreSQL schema, table, column, index, constraint, document alias, or SQL identifier MUST use `snake_case`.

**Rationale:** .NET types keep normal C# naming, so the mapping layer performs the conversion once. Under the baseline provider the store configuration sets the casing. Under the `efcore` extension the pinned `EFCore.NamingConventions` package applies it, so no configuration repeats the rule per entity.

### Control production schema changes (standards/rule/backend-persistence.control-production-schema-changes)

**Requirement:** A hosted environment MUST apply schema changes through a reviewed step before traffic shifts, not from a starting replica.

**Rationale:** Development and disposable integration databases may still apply schema automatically. Replicas competing to alter a schema during startup produce nondeterministic results.

A reviewed step is one that produces an artifact a person approved before it ran. Under the baseline provider that is a generated patch from `martendb` schema migration, applied by a deployment step. Under the `efcore` extension it is a generated migration, applied by `dotnet ef database update` or an idempotent script. A tool that alters the schema from application startup is not a reviewed step whichever provider runs it.

### Test persistence against PostgreSQL (standards/rule/backend-persistence.test-persistence-against-postgresql)

**Requirement:** Repository behavior, projections, mappings, correctness indexes, commit behavior, and schema application MUST run against the pinned PostgreSQL through Testcontainers.

**Rationale:** An in-memory substitute cannot prove persistence behavior, because it does not run the query planner or the constraints. HTTP integration through the real host is covered by `standards/rule/backend-testing.test-http-integration-through-the-real-host`.

## Conventions

### Use this Infrastructure layout (standards/rule/backend-persistence.use-this-infrastructure-layout)

**Default:** Place Marten configuration, repositories, commit behavior, and serialization under one Infrastructure persistence folder.

**Replacement:** A consumer records a departure as an Exception record naming this provision, with reason and review date.

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
      Customers/                    two aggregates: one folder per aggregate
        CustomerAccounts/
          CustomerAccountRepository.cs
          CustomerAccountMartenConfiguration.cs
        Consents/
          ConsentRepository.cs
          ConsentMartenConfiguration.cs
```

The module folders follow `standards/rule/backend-architecture.organize-every-layer-by-module-and-use-case`. A single-aggregate module stays flat when its aggregate root's plural name equals the module name. For example, `Post` stays flat under `Posts`. Otherwise, each aggregate takes its own folder.

This also applies to modules with multiple aggregates. The example keeps aggregate-specific configuration beside the aggregate. The example keeps session and commit plumbing under the Marten root.

### Register one scoped session (standards/rule/backend-persistence.register-one-scoped-session)

**Default:** Register `IDocumentSession` with the WebApi request or Worker operation scope.

**Replacement:** A consumer records a departure as an Exception record naming this provision, with reason and review date.

**Rationale:** Repositories and the commit handler in one command then resolve the same session instance.

### Review query plans for new indexes (standards/rule/backend-persistence.review-query-plans-for-new-indexes)

**Default:** Add an index only from an accepted query or a measured operating need, and inspect its plan on representative data.

**Replacement:** A consumer records a departure as an Exception record naming this provision, with reason and review date.

**Rationale:** An index added without a plan reading costs write throughput for a read that may never run.

### Add read documents for query-shaped data (standards/rule/backend-persistence.add-read-documents-for-query-shaped-data)

**Default:** Add a module-owned read document for repeated cross-aggregate composition, deep traversal, or a distorting index shape.

**Replacement:** A consumer records a departure as an Exception record naming this provision, with reason and review date.

**Rationale:** Stored aggregate documents already serve accepted simple reads. The use case defines the read document's consistency and rebuild behavior.

### Persist one explicit state object (standards/rule/backend-persistence.persist-one-explicit-state-object)

**Default:** Persist the aggregate state record itself rather than a flattened projection of its fields. Round-trip every state record through the configured serializer in integration tests.

**Replacement:** A consumer records a departure as an Exception record naming this provision, with reason and review date.

**Example:** A stable discriminator property can use `$state` with `draft`, `published`, and `archived` values. The persisted state value contains its state-specific data:

```json
{
  "state": {
    "$state": "published",
    "publishedAt": "2026-07-16T10:30:00Z"
  }
}
```

The example registers every concrete Aggregate state record in Infrastructure.

Adding a state discriminator can break an older application version during a mixed-version deployment. The release plan either prevents the older version from reading the new state or introduces a compatible reader before commands can persist that state.

## Reference example

This informative example demonstrates `standards/rule/backend-persistence.keep-serialization-behavior-out-of-domain` and `standards/rule/backend-persistence.use-this-infrastructure-layout`.

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

| ID | Mark | Evidence |
|:---|:---|:---|
| standards/rule/backend-persistence.stage-aggregate-writes-through-repositories | guidance | Does each command handler reach persistence only through a Domain repository? |
| standards/rule/backend-persistence.query-through-iquerysession | guidance | Does each query handler project through the session named for its provider, with filter, scope, ordering, and limit applied first? |
| standards/rule/backend-persistence.commit-once-in-the-command-pipeline | guidance | Does exactly one command post-handler commit each pipeline, with no other caller committing? |
| standards/rule/backend-persistence.collect-events-without-a-public-unit-of-work | guidance | Does each repository register touched aggregates with the internal buffer the post-handler drains? |
| standards/rule/backend-persistence.keep-mappings-and-aliases-explicit | guidance | Does each stored aggregate declare a stable alias, identifier mapping, and the indexes its queries need? |
| standards/rule/backend-persistence.keep-serialization-behavior-out-of-domain | guidance | Does Infrastructure own the stored JSON contract with every persisted subtype registered? |
| standards/rule/backend-persistence.evolve-stored-document-contracts-explicitly | guidance | Does each stored-contract change carry a reviewed transformation or an expand-and-contract rollout? |
| standards/rule/backend-persistence.bound-aggregate-document-growth | guidance | Does each embedded collection in an aggregate document have an accepted business bound? |
| standards/rule/backend-persistence.use-database-naming-conventions | guidance | Is each generated database identifier snake case? |
| standards/rule/backend-persistence.control-production-schema-changes | guidance | Does each hosted schema change run as a reviewed step before traffic shifts? |
| standards/rule/backend-persistence.test-persistence-against-postgresql | guidance | Does each persistence behavior run against the pinned PostgreSQL through Testcontainers? |
| standards/rule/backend-persistence.use-this-infrastructure-layout | guidance | Do store configuration, repositories, and commit behavior sit under the one persistence folder? |
| standards/rule/backend-persistence.register-one-scoped-session | guidance | Do the repositories and the commit handler in one command resolve one session? |
| standards/rule/backend-persistence.review-query-plans-for-new-indexes | guidance | Does each new index record its accepted query and the plan that justified it? |
| standards/rule/backend-persistence.add-read-documents-for-query-shaped-data | guidance | Does each read document record its consistency and rebuild behavior beside its owning use case? |
| standards/rule/backend-persistence.persist-one-explicit-state-object | guidance | Does each aggregate persist its state record with every state round-tripping through the serializer? |
