# .NET Persistence

## Intent

Marten is the baseline provider for persistence. The shared provisions live on the stack-neutral page ([Backend persistence](../persistence.md)); this page holds what the dotnet stack alone requires.

The `efcore` extension replaces the provider-specific provisions it names for the aggregates it owns.

## Agent Summary {#agent-summary}

- Commands write through repositories, never `IDocumentSession` directly. (litespec/backend/dotnet/persistence#stage-aggregate-writes-through-repositories)
- Queries project through `IQuerySession` with scope and limits applied. (litespec/backend/dotnet/persistence#query-through-iquerysession)
- One post-handler calls `SaveChangesAsync` for each command. (litespec/backend/dotnet/persistence#commit-once-in-the-command-pipeline)
- Marten plumbing sits under one Infrastructure persistence folder. (litespec/backend/dotnet/persistence#use-this-infrastructure-layout)
- One registration puts `IDocumentSession` in the request or operation scope. (litespec/backend/dotnet/persistence#register-one-scoped-session)

## Standards

### Stage aggregate writes through repositories

**Requirement:** A command handler MUST reach persistence only through a Domain repository, never through `IDocumentSession`.

**Rationale:** Infrastructure implements each repository with the scoped session. A repository loads one aggregate type and exposes no session, generic query, or save operation. This provision realizes `litespec/backend/persistence#stage-aggregate-writes-through-domain-repositories`.

### Query through IQuerySession

**Requirement:** A query handler MUST project through `IQuerySession`, applying filter, scope, ordering, and limit before materialization.

**Rationale:** A read-store interface per aggregate, a generic read repository, or a callback wrapper adds a layer that the session already provides. Ordering and paging follow `litespec/backend/api#bound-collection-queries`. This provision realizes `litespec/backend/persistence#query-through-the-read-session`.

| Provider | Query surface |
|:---|:---|
| Marten baseline | `IQuerySession` |
| EF Core extension | The context type the extension declares |

The table names the binding per provider; the obligation to project with filter, scope, ordering, and limit holds under each.

### Commit once in the command pipeline

**Requirement:** Exactly one global command post-handler MUST call `SaveChangesAsync` for a command pipeline.

**Rationale:** A failed command then leaves the scoped session uncommitted. Handlers, repositories, validators, reactions, and endpoints never commit. This provision realizes `litespec/backend/persistence#commit-each-command-pipeline-once`.

The obligation is one commit for one pipeline, not one named method. Under the baseline provider that commit is `IDocumentSession.SaveChangesAsync`. Under the `efcore` extension it is `DbContext.SaveChangesAsync`, wrapped in an explicit transaction when the pipeline writes through more than one context.

## Conventions

### Use this Infrastructure layout

**Default:** Place Marten configuration, repositories, commit behavior, and serialization under one Infrastructure persistence folder.

**Replacement:** A consumer records a departure as an Exception record naming this provision, with reason and review date.

**Rationale:** This provision realizes `litespec/backend/persistence#use-one-persistence-folder`.

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

This also applies to modules with multiple aggregates. The example keeps aggregate-specific configuration beside the aggregate. The example keeps session and commit plumbing under the Marten root.

### Register one scoped session

**Default:** Register `IDocumentSession` with the WebApi request or Worker operation scope.

**Replacement:** A consumer records a departure as an Exception record naming this provision, with reason and review date.

**Rationale:** Repositories and the commit handler in one command then resolve the same session instance. This provision realizes `litespec/backend/persistence#use-one-session-per-command`.

## Reference example

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
| litespec/backend/dotnet/persistence#stage-aggregate-writes-through-repositories | guidance | Does each command handler reach persistence only through a Domain repository, never through `IDocumentSession`? |
| litespec/backend/dotnet/persistence#query-through-iquerysession | guidance | Does each query handler project through `IQuerySession`, with filter, scope, ordering, and limit applied first? |
| litespec/backend/dotnet/persistence#commit-once-in-the-command-pipeline | guidance | Does exactly one command post-handler call `SaveChangesAsync` for each pipeline, with no other caller committing? |
| litespec/backend/dotnet/persistence#use-this-infrastructure-layout | guidance | Do Marten configuration, repositories, and commit behavior sit under the one persistence folder? |
| litespec/backend/dotnet/persistence#register-one-scoped-session | guidance | Do the repositories and the commit handler in one command resolve one `IDocumentSession`? |
