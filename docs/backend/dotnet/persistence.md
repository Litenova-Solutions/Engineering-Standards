# .NET Persistence

## Intent

A .NET backend persists aggregates through Marten, the baseline document store: command handlers stage writes through Domain repositories, queries project through the read session, and one post-handler commits each command pipeline. This page states those .NET bindings with the Infrastructure layout and session lifetime they assume, so every command keeps one transaction. The shared persistence rules live on [Persistence](../persistence.md); the `efcore` extension replaces the provider-specific rules it names for the aggregates it owns.

## Concepts

### Sessions, Repositories, and the One Commit

One scoped session serves a whole command: the Domain repositories stage aggregate writes through it, and exactly one command post-handler commits it. Query handlers read through the read session instead, projecting shaped records without loading aggregates. Only that post-handler commits, so a failed command leaves nothing stored.

### The Baseline Provider and Its Replacement

Marten is the baseline provider, supplying the session, the read session, and document storage. The `efcore` extension replaces the provider-specific provisions it names for the aggregates it owns; every other provision on this page binds those paths unchanged.

## Standards

### Stage Aggregate Writes Through Repositories

**Statement:** A command handler MUST reach persistence only through a Domain repository, never through `IDocumentSession`.

**Rationale:** Infrastructure implements each Domain repository with the scoped session, so the handler stages work without naming a provider type. A repository that exposed the session, a generic query, or a save operation would hand the handler the provider surface the layer exists to hide. This provision states the .NET form of `litespec/backend/persistence#stage-aggregate-writes-through-domain-repositories`.

### Query Through IQuerySession

**Statement:** A query handler MUST project through `IQuerySession`, applying filter, scope, ordering, and limit before materialization.

**Rationale:** The read session already filters, orders, pages, and projects; a read-store interface per aggregate, a generic read repository, or a callback wrapper adds a layer that repeats it. Ordering and paging follow `litespec/backend/api#bound-collection-queries`. This provision states the .NET form of `litespec/backend/persistence#query-through-the-read-session`.

| Provider | Query surface |
|:---|:---|
| Marten baseline | `IQuerySession` |
| EF Core extension | The context type the extension declares |

The table names the binding per provider. The obligation to project with filter, scope, ordering, and limit holds under each.

### Commit Once in the Command Pipeline

**Statement:** Exactly one global command post-handler MUST call `SaveChangesAsync` for a command pipeline.

**Rationale:** Exactly one post-handler commits, so a failed command leaves the scoped session uncommitted and no partial work persists. A second committer, in a handler, repository, validator, reaction, or endpoint, would store work the pipeline later refuses. This provision states the .NET form of `litespec/backend/persistence#commit-each-command-pipeline-once`.

The obligation is one commit for one pipeline, not one named method. Under the baseline provider that commit is `IDocumentSession.SaveChangesAsync`. Under the `efcore` extension it is `DbContext.SaveChangesAsync`. The pipeline wraps the call in an explicit transaction when it writes through more than one context.

## Conventions

### Use This Infrastructure Layout

**Default:** Place Marten configuration, repositories, commit behavior, and serialization under one Infrastructure persistence folder.

**Replacement:** A project names the folder holding its persistence types in its project documentation.

**Rationale:** One persistence folder holds Marten configuration, repositories, commit behavior, and serialization, so every persistence type has one discoverable home. Scattered configuration hides the provider setup across the project. This provision states the .NET form of `litespec/backend/persistence#use-one-persistence-folder`.

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

The module folders follow `litespec/backend/architecture#organize-every-layer-by-module-and-use-case`. A single-aggregate module stays flat when its aggregate root's plural name equals the module name. For example, `Post` stays flat under `Posts`. Otherwise, each aggregate takes its own folder.

Aggregate-specific configuration stays beside its aggregate, while session and commit plumbing stay under the Marten root.

### Register One Scoped Session

**Default:** Register `IDocumentSession` with the WebApi request or Worker operation scope.

**Replacement:** A project names the session scope each request or operation uses in its project documentation.

**Rationale:** One session per WebApi request or Worker operation means the repositories and the commit handler in one command resolve the same instance. Two sessions would stage and commit separately, splitting one command across two units of work. This provision states the .NET form of `litespec/backend/persistence#use-one-session-per-command`.

## Reference Example

This informative example demonstrates `litespec/backend/dotnet/persistence#stage-aggregate-writes-through-repositories`.

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
| litespec/backend/dotnet/persistence#stage-aggregate-writes-through-repositories | guidance | Command handler files under `apps/api/src/` name only Domain repository interfaces in their persistence calls; no handler file names `IDocumentSession`. |
| litespec/backend/dotnet/persistence#query-through-iquerysession | guidance | Query handler files project through `IQuerySession` with filter, scope, ordering, and limit applied before materialization. |
| litespec/backend/dotnet/persistence#commit-once-in-the-command-pipeline | guidance | One command post-handler file calls `SaveChangesAsync`; no handler, repository, validator, reaction, or endpoint file calls it. |
| litespec/backend/dotnet/persistence#use-this-infrastructure-layout | guidance | Marten configuration, repository, commit, and serialization files sit under the one Infrastructure persistence folder. |
| litespec/backend/dotnet/persistence#register-one-scoped-session | guidance | The service registration wires `IDocumentSession` once per WebApi request or Worker operation scope. |
