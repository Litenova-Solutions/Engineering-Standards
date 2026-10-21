# Persistence

## Intent

This page states how the backend stores and reads aggregates. Commands load and stage aggregates through Domain-owned repositories. Queries read through the session directly in Application, because the selected stack treats document queries as an explicit read-side dependency.

One scoped session and one command post-handler own the transaction boundary. The [.NET persistence binding](dotnet/persistence.md) names the baseline provider, and the `efcore` extension replaces the provider-specific rules named below.

## Concepts

### Provider-neutral and provider-specific rules

The persistence provisions divide into two groups. If you replace the provider, you need to know which group moves.

| Group | What it fixes | Provisions |
|:---|:---|:---|
| Provider-neutral | The boundary, the transaction shape, and the obligations on stored data. | `litespec/backend/persistence#stage-aggregate-writes-through-domain-repositories`, `litespec/backend/persistence#query-through-the-read-session`, `litespec/backend/persistence#commit-each-command-pipeline-once`, `litespec/backend/persistence#collect-events-without-a-public-unit-of-work`, `litespec/backend/persistence#evolve-stored-document-contracts-explicitly`, `litespec/backend/persistence#bound-aggregate-document-growth`, `litespec/backend/persistence#use-database-naming-conventions`, `litespec/backend/persistence#control-production-schema-changes`, `litespec/backend/persistence#test-persistence-against-postgresql`, `litespec/backend/persistence#review-query-plans-for-new-indexes`, `litespec/backend/persistence#add-read-documents-for-query-shaped-data`, `litespec/backend/persistence#use-one-persistence-folder`, `litespec/backend/persistence#use-one-session-per-command` |
| Provider-specific | The member names and configuration surface the pinned provider supplies. | `litespec/backend/persistence#keep-mappings-and-aliases-explicit`, `litespec/backend/persistence#keep-serialization-behavior-out-of-domain`, `litespec/backend/persistence#persist-one-explicit-state-object`, `litespec/backend/dotnet/persistence#query-through-iquerysession`, `litespec/backend/dotnet/persistence#register-one-scoped-session`, `litespec/backend/dotnet/persistence#use-this-infrastructure-layout` |

Each provider-neutral provision states one obligation. `litespec/backend/persistence#commit-each-command-pipeline-once` requires exactly one commit for a command pipeline, and the dotnet binding names the call that performs it.

The EF Core extension states in its own Baseline relationship section which provisions it replaces for the aggregates it owns. No consumer runs both providers over one aggregate.

The manifest pins both providers' packages, because the extension is part of this release. A pinned package is an available choice rather than an active one, and `litespec.project.json` records which choices a consumer made.

## Standards

### Stage aggregate writes through domain repositories

**Requirement:** A command handler MUST reach persistence only through a Domain repository, never through the session directly.

**Rationale:** Infrastructure implements each repository with the scoped session. A repository loads one aggregate type and exposes no session, generic query, or save operation.

### Query through the read session

**Requirement:** A query handler MUST project through the read session, applying filter, scope, ordering, and limit before materialization.

**Rationale:** A read-store interface per aggregate, a generic read repository, or a callback wrapper adds a layer that the session already provides. Ordering and paging follow `litespec/backend/api#bound-collection-queries`.

### Commit each command pipeline once

**Requirement:** Exactly one global command post-handler MUST commit the session for a command pipeline.

**Rationale:** A failed command then leaves the scoped session uncommitted. Handlers, repositories, validators, reactions, and endpoints never commit.

**Example:** In the library circulation product, `use-case/lending.borrow-copy` stages the loan and the copy through their Domain repositories, and one post-handler commits once after the handler returns:

```text
handler stages the loan through its repository
handler stages the copy through its repository
post-handler collects the pending events
post-handler commits the session once
```

A failed borrow leaves the session uncommitted, so no partial loan is stored. Handlers, repositories, validators, reactions, and endpoints never commit.

### Collect events without a public unit of work

**Requirement:** A repository MUST register each touched aggregate with the internal scoped event buffer that the post-handler drains.

**Rationale:** The post-handler collects pending events before committing, so you need no public unit-of-work type. Best-effort delivery publishes after the commit succeeds.

### Keep mappings and aliases explicit

**Requirement:** Each stored aggregate MUST declare a stable document alias, typed-identifier mapping, and the indexes its accepted queries need.

**Rationale:** A code rename then cannot change a document type or collection name. Infrastructure owns the store configuration.

### Keep serialization behavior out of Domain

**Requirement:** Infrastructure MUST own the JSON contract for stored documents, including member names, constructors, converters, and polymorphic registration.

**Rationale:** Domain stays free of serialization metadata. You register every concrete type behind a base or interface, because an unregistered subtype fails at read time.

Registration covers the types this store actually persists. The store that writes a union referenced from another aggregate registers it once, rather than every store that names the referencing type. The store does not persist a type reachable only through an identifier here, and it needs no registration.

### Evolve stored document contracts explicitly

**Requirement:** A rename, removal, type change, member move, or discriminator change MUST have a reviewed data transformation or an expand-and-contract rollout.

**Rationale:** JSON member names, required values, and discriminator values are database schema. An additive member still defines its behavior for documents written earlier.

An additive change is the only kind that needs no transformation, and it is additive only when every earlier document stays valid. A new member with a defined absent-value behavior qualifies. A new required member, a narrowed type, and a new discriminator value that an earlier reader rejects do not.

### Bound aggregate document growth

**Requirement:** An aggregate document MUST NOT embed a collection that has no accepted business bound.

**Rationale:** Unbounded growth belongs in another aggregate, an owned document record, or a separate query-shaped document, depending on the consistency boundary it needs.

### Use database naming conventions

**Requirement:** A PostgreSQL schema, table, column, index, constraint, document alias, or SQL identifier MUST use `snake_case`.

**Rationale:** Code types keep normal language naming, so the mapping layer performs the conversion once. Under the baseline provider the store configuration sets the casing. Under the `efcore` extension a naming plugin applies it, so no configuration repeats the rule per entity.

### Control production schema changes

**Requirement:** A hosted environment MUST apply schema changes through a reviewed step before traffic shifts, not from a starting replica.

**Rationale:** Development and disposable integration databases may still apply schema automatically. Replicas competing to alter a schema during startup produce nondeterministic results.

A reviewed step is one that produces an artifact you approve before it runs. A deployment step applies that generated schema migration. A tool that alters the schema from application startup is not a reviewed step whichever provider runs it.

### Test persistence against PostgreSQL

**Requirement:** Repository behavior, projections, mappings, correctness indexes, commit behavior, and schema application MUST run against the pinned PostgreSQL through Testcontainers.

**Rationale:** An in-memory substitute cannot prove persistence behavior, because it does not run the query planner or the constraints. `litespec/backend/testing#test-http-integration-through-the-real-application-host` covers HTTP integration through the real host.

## Conventions

### Use one persistence folder

**Default:** Place store configuration, repositories, commit behavior, and serialization under one Infrastructure persistence folder.

**Replacement:** A consumer records a departure as an Exception record naming this provision, with reason and review date.

**Example:**

```text
{ProjectName}.Infrastructure/
  Persistence/
    Store/
      StoreServiceRegistration
      StoreConfiguration
      Commands/
        CommitCommandPostHandler
      Events/
        DomainEventBuffer
      Posts/                        single aggregate whose name matches the module: files directly under the module
        PostRepository
        PostStoreConfiguration
      Customers/                    two aggregates: one folder per aggregate
        CustomerAccounts/
          CustomerAccountRepository
          CustomerAccountStoreConfiguration
        Consents/
          ConsentRepository
          ConsentStoreConfiguration
```

The module folders follow `litespec/backend/architecture#organize-every-layer-by-module-and-use-case`. A single-aggregate module stays flat when its aggregate root's plural name equals the module name. For example, `Post` stays flat under `Posts`. Otherwise, each aggregate takes its own folder.

The same rule applies to modules with multiple aggregates. The example keeps aggregate-specific configuration beside the aggregate. The example keeps session and commit plumbing under the store root.

### Use one session per command

**Default:** Resolve one session for the repositories and the commit handler in one command.

**Replacement:** A consumer records a departure as an Exception record naming this provision, with reason and review date.

**Rationale:** Repositories and the commit handler in one command then resolve the same session instance.

### Review query plans for new indexes

**Default:** Add an index only from an accepted query or a measured operating need, and inspect its plan on representative data.

**Replacement:** A consumer records a departure as an Exception record naming this provision, with reason and review date.

**Rationale:** An index added without a plan reading costs write throughput for a read that may never run.

### Add read documents for query-shaped data

**Default:** Add a module-owned read document for repeated cross-aggregate composition, deep traversal, or a distorting index shape.

**Replacement:** A consumer records a departure as an Exception record naming this provision, with reason and review date.

**Rationale:** Stored aggregate documents already serve accepted simple reads. The use case defines the read document's consistency and rebuild behavior.

### Persist one explicit state object

**Default:** Persist the aggregate state object itself rather than a flattened projection, round-tripping every state object through the configured serializer in integration tests.

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

The example registers every concrete aggregate state object in Infrastructure.

For example, a returned loan in the library circulation product stores its state the same way, with the `Returned` case from `business-record/lending.loan`:

```json
{
  "state": {
    "$state": "returned",
    "returnedAt": "2026-07-16T10:30:00Z"
  }
}
```

The document stores the state object itself, with no flattened `isReturned` flag beside it. The `Active` and `Overdue` cases use the `active` and `overdue` discriminators with their due dates.

Adding a state discriminator can break an older application version during a mixed-version deployment. The release plan either prevents the older version from reading the new state or introduces a compatible reader before commands can persist that state.

## Reference example

This informative example demonstrates `litespec/backend/persistence#keep-serialization-behavior-out-of-domain`.

An `Order` document may contain a `PaymentMethod` collection with `CardPayment` and `BankTransfer` values. Infrastructure registers stable `card` and `bank_transfer` discriminators through the JSON contract resolver. The Domain hierarchy carries no serialization metadata.

A `Post` document stores one `state` object. `PostPublishedState` uses the stable `published` discriminator and owns `publishedAt`. The document does not also store `isPublished` or an aggregate-level `publishedAt` value.

Renaming `shippingAddress.postalCode` to `shippingAddress.postcode` uses a mixed-version reader and a reviewed data transformation before the old reader is removed. Renaming a property in code without that rollout is not compatible document evolution.

An accepted business rule may cap `Order.Lines` at 200 entries inside the aggregate document. An unbounded status history uses a separate read document or projection instead of growing the `Order` document indefinitely.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/backend/persistence#stage-aggregate-writes-through-domain-repositories | guidance | Does each command handler reach persistence only through a Domain repository? |
| litespec/backend/persistence#query-through-the-read-session | guidance | Does each query handler project through the read session, with filter, scope, ordering, and limit applied first? |
| litespec/backend/persistence#commit-each-command-pipeline-once | guidance | Does exactly one command post-handler commit each pipeline, with no other caller committing? |
| litespec/backend/persistence#collect-events-without-a-public-unit-of-work | guidance | Does each repository register touched aggregates with the internal buffer the post-handler drains? |
| litespec/backend/persistence#keep-mappings-and-aliases-explicit | guidance | Does each stored aggregate declare a stable alias, identifier mapping, and the indexes its queries need? |
| litespec/backend/persistence#keep-serialization-behavior-out-of-domain | guidance | Does Infrastructure own the stored JSON contract with every persisted subtype registered? |
| litespec/backend/persistence#evolve-stored-document-contracts-explicitly | guidance | Does each stored-contract change carry a reviewed transformation or an expand-and-contract rollout? |
| litespec/backend/persistence#bound-aggregate-document-growth | guidance | Does each embedded collection in an aggregate document have an accepted business bound? |
| litespec/backend/persistence#use-database-naming-conventions | guidance | Is each generated database identifier `snake_case`? |
| litespec/backend/persistence#control-production-schema-changes | guidance | Does each hosted schema change run as a reviewed step before traffic shifts? |
| litespec/backend/persistence#test-persistence-against-postgresql | guidance | Does each persistence behavior run against the pinned PostgreSQL through Testcontainers? |
| litespec/backend/persistence#use-one-persistence-folder | guidance | Do store configuration, repositories, and commit behavior sit under the one persistence folder? |
| litespec/backend/persistence#use-one-session-per-command | guidance | Do the repositories and the commit handler in one command resolve one session? |
| litespec/backend/persistence#review-query-plans-for-new-indexes | guidance | Does each new index record its accepted query and the plan that justified it? |
| litespec/backend/persistence#add-read-documents-for-query-shaped-data | guidance | Does each read document record its consistency and rebuild behavior beside its owning use case? |
| litespec/backend/persistence#persist-one-explicit-state-object | guidance | Does each aggregate persist its state object with every state round-tripping through the serializer? |
