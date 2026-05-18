# Query Read Strategy

This document explains the read-side strategy used in Litenova Solutions projects and defines the recommended approach for returning data from query handlers.

---

## The Problem

When a system is young and aggregates are small, loading a full domain aggregate to answer a query seems harmless. The aggregate has five properties, the query needs four of them, and loading the aggregate works fine.

As the system grows, this approach breaks down. Aggregates accumulate collections, computed properties, and complex state. A `Post` aggregate that was once small now loads its `Tags`, its `PostHistory`, and its state machine. A query that asks "what is the title of this post?" must now load 20 related objects from the database to answer it. Worse, the aggregate's `GetByIdAsync` triggers EF Core navigation loading behavior that was designed for write operations, not reads. The read performance of the system becomes coupled to the write complexity of the domain model.

There is also a behavioral problem: aggregates enforce invariants and apply domain logic when methods are called. A read operation should not trigger any of that. It should fetch data and return it, nothing more. Loading an aggregate for a read operation invites accidental side effects when a future developer calls a method on the aggregate they just "fetched for reading."

---

## The Three Options

### Option A: Dedicated Read Methods on the Repository Interface

Add projection-returning methods directly to the domain's `IXxxRepository` interface.

**Structure:**

```csharp
// Domain/Posts/PostSummary.cs
sealed record PostSummary
{
    public required PostId Id { get; init; }
    public required string Title { get; init; }
    public required DateTime? PublishedAt { get; init; }
}

// Domain/Posts/IPostRepository.cs
interface IPostRepository
{
    Task<Post> GetByIdAsync(PostId id, CancellationToken cancellationToken);
    Task AddAsync(Post post, CancellationToken cancellationToken);
    Task UpdateAsync(Post post, CancellationToken cancellationToken);

    // Read method added to the repository interface
    Task<PostSummary?> GetSummaryByIdAsync(PostId id, CancellationToken cancellationToken);
}

// Infrastructure/Persistence/Repositories/PostRepository.cs
sealed class PostRepository(AppDbContext dbContext) : IPostRepository
{
    // ... write methods ...

    public async Task<PostSummary?> GetSummaryByIdAsync(PostId id, CancellationToken cancellationToken)
    {
        return await dbContext.Posts
            .Where(p => p.Id == id)
            .Select(p => new PostSummary
            {
                Id = p.Id,
                Title = p.Title.Value,
                PublishedAt = p.State is PublishedPostState s ? s.PublishedAt : null
            })
            .FirstOrDefaultAsync(cancellationToken);
    }
}
```

**Trade-offs:**

| Pros | Cons |
|---|---|
| No new interface or file to create | Pollutes the repository interface with read concerns |
| Domain layer owns the projection shape | Domain layer now has read DTOs next to domain types |
| Simple for small projections | Read methods grow on the repository over time |

**Recommendation:** Acceptable when the projection is simple and the Domain layer already owns the shape. Use sparingly.

---

### Option B: Separate Read Store Interface

Define a dedicated `IXxxReadStore` interface in the Application layer. Implement it in Infrastructure using EF Core projections.

**This is the recommended default for all Litenova Solutions projects.**

**Structure:**

```csharp
// Application/Posts/Shared/IPostReadStore.cs
interface IPostReadStore
{
    Task<PostResult?> GetByIdAsync(PostId postId, CancellationToken cancellationToken);
    Task<IReadOnlyList<PostSummary>> GetAllByAuthorAsync(AuthorId authorId, CancellationToken cancellationToken);
}

// Application/Posts/GetById/PostResult.cs
sealed record PostResult
{
    public required PostId Id { get; init; }
    public required string Title { get; init; }
    public required string Content { get; init; }
    public required string AuthorName { get; init; }
    public required DateTime? PublishedAt { get; init; }
}

// Infrastructure/Persistence/ReadStores/PostReadStore.cs
sealed class PostReadStore(AppDbContext dbContext) : IPostReadStore
{
    public async Task<PostResult?> GetByIdAsync(PostId postId, CancellationToken cancellationToken)
    {
        return await dbContext.Posts
            .Where(p => p.Id == postId)
            .Select(p => new PostResult
            {
                Id = p.Id,
                Title = p.Title.Value,
                Content = p.Content.Value,
                AuthorName = p.Author.DisplayName,
                PublishedAt = p.State is PublishedPostState s ? s.PublishedAt : null
            })
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<PostSummary>> GetAllByAuthorAsync(
        AuthorId authorId,
        CancellationToken cancellationToken)
    {
        return await dbContext.Posts
            .Where(p => p.AuthorId == authorId)
            .Select(p => new PostSummary
            {
                Id = p.Id,
                Title = p.Title.Value,
                PublishedAt = p.State is PublishedPostState s ? s.PublishedAt : null
            })
            .ToListAsync(cancellationToken);
    }
}

// Application/Posts/GetById/GetPostByIdQueryHandler.cs
sealed class GetPostByIdQueryHandler(IPostReadStore postReadStore) : IQueryHandler<GetPostByIdQuery, PostResult>
{
    public async Task<PostResult> HandleAsync(GetPostByIdQuery query, CancellationToken cancellationToken)
    {
        var result = await postReadStore.GetByIdAsync(query.PostId, cancellationToken);

        if (result is null)
        {
            throw new PostNotFoundException(query.PostId);
        }

        return result;
    }
}
```

**Trade-offs:**

| Pros | Cons |
|---|---|
| Clean separation of read and write paths | One additional interface and class per aggregate |
| Application layer owns projection shapes | Slightly more files to create upfront |
| Domain layer stays free of read DTOs | — |
| Enables caching, read replicas, alternative projections | — |
| Query handlers are trivially testable by mocking `IXxxReadStore` | — |

**Recommendation:** The default for all Litenova Solutions projects.

---

### Option C: Load Aggregate, Then Map

Load the full aggregate via the repository and map it to a result type in the handler.

```csharp
// Only acceptable during initial scaffolding
sealed class GetPostByIdQueryHandler(IPostRepository postRepository) : IQueryHandler<GetPostByIdQuery, PostResult>
{
    public async Task<PostResult> HandleAsync(GetPostByIdQuery query, CancellationToken cancellationToken)
    {
        var post = await postRepository.GetByIdAsync(query.PostId, cancellationToken);

        return new PostResult
        {
            Id = post.Id,
            Title = post.Title.Value,
            Content = post.Content.Value,
            AuthorName = "Unknown", // ← cannot include without loading Author aggregate
            PublishedAt = post.State is PublishedPostState s ? s.PublishedAt : null
        };
    }
}
```

**Trade-offs:**

| Pros | Cons |
|---|---|
| Fast to write | Loads full aggregate including all collections |
| No additional interfaces | Couples read performance to aggregate complexity |
| — | Cannot include data from related aggregates without multiple repository calls |
| — | Aggregate behavioral overhead for a read-only operation |

**Recommendation:** Acceptable as a starting-point pattern during initial feature scaffolding only. MUST be replaced with Option B before a feature is considered production-ready.

---

## Recommendation Summary

| Situation | Use |
|---|---|
| Default for all production features | Option B (Separate Read Store Interface) |
| Simple projection the Domain already owns | Option A (Read Methods on Repository) |
| Initial scaffolding / proof of concept | Option C (Load Aggregate), with a `// TODO: replace with read store` comment |

---

## Null Handling in Query Handlers

When a read store method returns `null` (the resource was not found), the query handler MUST throw the appropriate `AggregateNotFoundException` subclass. It MUST NOT return `null` to the caller.

```csharp
// GOOD:
var result = await postReadStore.GetByIdAsync(query.PostId, cancellationToken);

if (result is null)
{
    throw new PostNotFoundException(query.PostId);
}

return result;

// BAD:
var result = await postReadStore.GetByIdAsync(query.PostId, cancellationToken);
return result; // ← null propagates to the endpoint, which does not know how to handle it
```

---

## Multi-Aggregate Projections

One of the key advantages of the read store pattern (Option B) is that projections can span multiple aggregates. A `PostResult` that needs the author's display name does not require a separate query to the `Author` read store — it can join across tables in a single EF Core projection.

```csharp
// PostReadStore.cs — multi-aggregate projection
public async Task<PostResult?> GetByIdAsync(PostId postId, CancellationToken cancellationToken)
{
    return await dbContext.Posts
        .Where(p => p.Id == postId)
        .Select(p => new PostResult
        {
            Id = p.Id,
            Title = p.Title.Value,
            Content = p.Content.Value,
            // Join to the Authors table directly in the projection
            AuthorName = dbContext.Authors
                .Where(a => a.Id == p.AuthorId)
                .Select(a => a.DisplayName)
                .FirstOrDefault() ?? string.Empty,
            TagNames = p.Tags.Select(t => t.Name).ToList(),
            PublishedAt = p.State is PublishedPostState s ? s.PublishedAt : null
        })
        .FirstOrDefaultAsync(cancellationToken);
}
```

This pattern keeps the query handler simple and keeps the projection logic where it belongs: in the Infrastructure layer, alongside the database schema knowledge.

---

## Project-Specific: Read Store Inventory

> **Note:** This section is filled in per-project. It lists all read store interfaces and their projection types so that engineers and AI agents can find them quickly.

When filling in this section, list every `IXxxReadStore` interface with its location, its implementation, and the result types it returns.

| Interface | Location | Implementation | Result Types |
|---|---|---|---|
| _(example) `IPostReadStore`_ | `Application/Posts/Shared/` | `Infrastructure/Persistence/ReadStores/PostReadStore.cs` | `PostResult`, `PostSummary` |
