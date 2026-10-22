# Persistence

## Intent

Commands change aggregates and queries read them, but neither touches the database directly: a command is a message that changes business state, a query is a message that reads without changing it, and an aggregate is one business record that changes in one step. Repositories (Domain interfaces loading one aggregate type each) stage writes, the read session serves queries by projecting results without loading aggregates, and one post-handler (a stage running after the handler) commits the session for each command. This page states that boundary, the transaction shape, and the obligations on stored data, for the baseline document provider. One explicit boundary keeps storage decisions reviewable in Infrastructure instead of scattered through handlers.

## Concepts

### The storage boundary

A command handler never touches the database. It loads aggregates through their Domain repositories, calls Domain behavior, and stages the changed aggregates back through those repositories. Exactly one command post-handler then commits the scoped session. A query handler never loads an aggregate: it projects its result through the read session, with filtering, scope, ordering, and limit applied before materialization.

In the Expenses product, `use-case/spending.submit-expense` stages the new expense through its repository, and one post-handler commits once after the handler returns. A failed submission leaves the session uncommitted, so no partial expense is stored.

### Provider-neutral and provider-specific rules

The persistence provisions divide into two groups, so a project that replaces the provider knows which obligations move with it.

Provider-neutral provisions state the boundary, the transaction shape, and the obligations on stored data: writes go through Domain repositories, queries project through the read session, and exactly one post-handler commits each command. Each one states an obligation the provider does not change.

Provider-specific provisions name the member names and configuration surface the pinned provider supplies, such as the document alias, the JSON contract ownership, and the session registration. The [.NET persistence binding](dotnet/persistence.md) names the baseline provider and the calls that perform each obligation.

The EF Core extension states in its own Baseline relationship section which provisions it replaces for the aggregates it owns. No consumer runs both providers over one aggregate.

The manifest pins both providers' packages, because the extension is part of this release. A pinned package is an available choice rather than an active one, and `litespec.project.json` records which choices a consumer made.

## Standards

### Stage aggregate writes through domain repositories

**Statement:** A command handler MUST reach persistence only through a Domain repository, never through the session directly.

**Rationale:** The repository is the only path from a handler to the store, so every write passes a reviewable boundary that loads one aggregate type. Infrastructure implements each repository with the scoped session, and the repository exposes no session, generic query, or save operation. A handler that reached the session directly could bypass aggregate loading and scatter store calls through Application.

### Query through the read session

**Statement:** A query handler MUST project through the read session, applying filter, scope, ordering, and limit before materialization.

**Rationale:** The session already projects, filters, and pages, so a read-store interface per aggregate, a generic read repository, or a callback wrapper adds a layer that only repeats it. Applying filter, scope, ordering, and limit before materialization keeps that work in the database; materializing first loads rows the caller never sees. Ordering and paging follow `litespec/backend/api#bound-collection-queries`.

### Commit each command pipeline once

**Statement:** Exactly one global command post-handler MUST commit the session for a command pipeline.

**Rationale:** One commit point makes the transaction boundary visible: everything the handler staged succeeds or fails together, and a failed command leaves the session uncommitted. If handlers or repositories committed, a later failure in the same pipeline would leave a partial write behind. Handlers, repositories, validators, reactions, and endpoints never commit.

**Example:** In the Expenses product, `use-case/spending.submit-expense` stages the expense through its Domain repository, and one post-handler commits once after the handler returns:

```text
handler stages the expense through its repository
post-handler collects the pending events
post-handler commits the session once
```

A failed submission leaves the session uncommitted, so no partial expense is stored. Handlers, repositories, validators, reactions, and endpoints never commit.

### Collect events without a public unit of work

**Statement:** A repository MUST register each touched aggregate with the internal scoped event buffer that the post-handler drains.

**Rationale:** Pending events must leave the process exactly when their write commits, so the post-handler drains the buffer and commits in one place. A public unit-of-work type would expose that mechanics to every handler; the internal buffer keeps it inside the pipeline. Best-effort delivery publishes after the commit succeeds.

### Keep mappings and aliases explicit

**Statement:** Each stored aggregate MUST declare a stable document alias, typed-identifier mapping, and the indexes its accepted queries need.

**Rationale:** Document types and collection names are storage identity: if they followed code names, renaming a class would orphan every stored document. An explicit alias, identifier mapping, and index list keeps storage identity independent of code names, with the store configuration owned in Infrastructure.

### Keep serialization behavior out of Domain

**Statement:** Infrastructure MUST own the JSON contract for stored documents, including member names, constructors, converters, and polymorphic registration.

**Rationale:** Serialization metadata on Domain types couples the business model to one store's format, so changing the format would mean editing the rules. Infrastructure owns member names, constructors, converters, and polymorphic registration, and Domain stays free of serialization metadata. Every concrete type behind a base or interface is registered, because an unregistered subtype fails at read time.

Registration covers the types this store actually persists. The store that writes a union referenced from another aggregate registers it once, rather than every store that names the referencing type. The store does not persist a type reachable only through an identifier here, and it needs no registration.

### Evolve stored document contracts explicitly

**Statement:** A rename, removal, type change, member move, or discriminator change MUST have a reviewed data transformation or an expand-and-contract rollout.

**Rationale:** Stored JSON member names, required values, and discriminator values are database schema: old documents stay on disk after the code changes. Without a reviewed transformation or an expand-and-contract rollout, a rename or type change makes old documents unreadable. An additive member still defines its behavior for documents written earlier.

An additive change is the only kind that needs no transformation, and it is additive only when every earlier document stays valid. A new member with a defined absent-value behavior qualifies. A new required member, a narrowed type, and a new discriminator value that an earlier reader rejects do not.

### Bound aggregate document growth

**Statement:** An aggregate document MUST NOT embed a collection that has no accepted business bound.

**Rationale:** A document grows with every write to its collection, so an unbounded embedded collection eventually exceeds size limits and slows every load of its aggregate. Data without an accepted business bound belongs in another aggregate, an owned document record, or a separate query-shaped document, depending on the consistency boundary it needs.

### Use database naming conventions

**Statement:** A PostgreSQL schema, table, column, index, constraint, document alias, or SQL identifier MUST use `snake_case`.

**Rationale:** One casing rule lets anyone predict a table or column name from the code type without opening the mapping. Code types keep normal language naming while the mapping layer converts once: under the baseline provider the store configuration sets the casing, and under the `efcore` extension a naming plugin applies it, so no configuration repeats the rule per entity.

### Control production schema changes

**Statement:** A hosted environment MUST apply schema changes through a reviewed step before traffic shifts, not from a starting replica.

**Rationale:** A schema change that runs from a starting replica races every other starting replica, and the winner is nondeterministic. A reviewed step produces an artifact that is approved before it runs, and a deployment step applies that migration before traffic shifts. Development and disposable integration databases may still apply schema automatically.

A tool that alters the schema from application startup is not a reviewed step whichever provider runs it.

### Test persistence against PostgreSQL

**Statement:** Repository behavior, projections, mappings, correctness indexes, commit behavior, and schema application MUST run against the pinned PostgreSQL through Testcontainers.

**Rationale:** Only the pinned PostgreSQL runs the real query planner, constraints, and type behavior. An in-memory substitute proves the test's own model of the database, so a query that passes against it can fail in production. HTTP integration through the real host is covered under `litespec/backend/testing#test-http-integration-through-the-real-application-host`.

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

The module folders follow the same module rule as every layer. Aggregate-specific configuration sits beside its aggregate, while session and commit plumbing sit under the store root.

### Use one session per command

**Default:** Resolve one session for the repositories and the commit handler in one command.

**Replacement:** A consumer records a departure as an Exception record naming this provision, with reason and review date.

**Rationale:** One session per command means the repositories and the commit handler stage and commit the same unit of work. Two sessions in one command would commit separately, so a failure between them would leave a partial write behind.

### Review query plans for new indexes

**Default:** Add an index only from an accepted query or a measured operating need, and inspect its plan on representative data.

**Replacement:** A consumer records a departure as an Exception record naming this provision, with reason and review date.

**Rationale:** Every index costs write throughput on each change to its table. An index added without reading its plan on representative data pays that cost for a read that may never run, so each index starts from an accepted query or a measured operating need.

### Add read documents for query-shaped data

**Default:** Add a module-owned read document for repeated cross-aggregate composition, deep traversal, or a distorting index shape.

**Replacement:** A consumer records a departure as an Exception record naming this provision, with reason and review date.

**Rationale:** Aggregate documents serve simple reads, but repeated cross-aggregate composition or deep traversal through them loads whole aggregates to show a few fields. A module-owned read document carries that shape directly, and its owning use case defines its consistency and rebuild behavior.

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

For example, a reimbursed expense in the Expenses product stores its state the same way, with the `Reimbursed` case from `business-record/spending.expense`:

```json
{
  "state": {
    "$state": "reimbursed",
    "reimbursedAt": "2026-07-16T10:30:00Z"
  }
}
```

The document stores the state object itself, with no flattened `isReimbursed` flag beside it. The `Submitted`, `Approved`, and `Rejected` cases use the `submitted`, `approved`, and `rejected` discriminators with their own data.

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
