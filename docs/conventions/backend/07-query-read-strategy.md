# Query Read Strategy

This document defines the read-side strategy for all query handlers. The read store pattern is the standard. Alternatives are documented in ADR 0007 as rejected options with rationale.

---

## 1. Why Read Stores

Loading a full domain aggregate to answer a read query creates two problems that compound over time.

The first problem is performance. Aggregates accumulate collections, computed properties, and complex state as a system grows. A `Post` aggregate that was small at the start now loads its tags, its history entries, and its state machine. A query that asks "what is the title of this post?" must load 20 related objects to answer it. Read performance becomes coupled to write complexity. The aggregate's repository loading behavior is designed for write operations; it is a poor fit for reads.

The second problem is behavioral contamination. Aggregates enforce invariants and apply domain logic when methods are called. A read operation should not trigger any of that. Loading an aggregate for a read creates an opportunity for a future developer to accidentally call a method on the aggregate they just loaded for reading, triggering state changes that were never intended.

The read store pattern eliminates both problems. A read store is a query interface that returns projected types, not aggregates. Infrastructure implements it using database projections that fetch only the columns needed by the query. Query handlers inject the read store, not the repository.

---

## 2. The Read Store Interface

The `IXxxReadStore` interface lives in `Application.Read.Contracts`. This placement is critical: both the query handlers (in `Application.Read`) and the Infrastructure implementation reference `Application.Read.Contracts`, avoiding any circular dependency.

```csharp
// Application.Read.Contracts/Posts/IPostReadStore.cs
interface IPostReadStore
{
    Task<PostResult?> GetByIdAsync(PostId postId, CancellationToken cancellationToken);
    Task<IReadOnlyList<PostSummary>> GetAllByAuthorAsync(AuthorId authorId, CancellationToken cancellationToken);
}
```

---

## 3. The Read Store Implementation

Infrastructure implements `IPostReadStore` using EF Core `Select` projections. The full aggregate is never loaded.

```csharp
// Infrastructure/Persistence/ReadStores/PostReadStore.cs
internal sealed class PostReadStore : IPostReadStore
{
    private readonly AppDbContext _dbContext;

    public PostReadStore(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<PostResult?> GetByIdAsync(PostId postId, CancellationToken cancellationToken)
    {
        return await _dbContext.Posts
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
        return await _dbContext.Posts
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
```

`AsNoTracking()` is not needed. When EF Core evaluates a `Select` projection, the result type is not an entity and is never tracked. Adding `AsNoTracking()` is redundant.

---

## 4. The Query Handler

The query handler in `Application.Read` injects `IPostReadStore` and throws a `PostNotFoundException` subclass if the result is null.

```csharp
// Application.Read/Posts/GetById/GetPostByIdQueryHandler.cs
internal sealed class GetPostByIdQueryHandler : IQueryHandler<GetPostByIdQuery, PostResult>
{
    private readonly IPostReadStore _postReadStore;

    public GetPostByIdQueryHandler(IPostReadStore postReadStore)
    {
        _postReadStore = postReadStore;
    }

    public async Task<PostResult> HandleAsync(GetPostByIdQuery query, CancellationToken cancellationToken)
    {
        var result = await _postReadStore.GetByIdAsync(query.PostId, cancellationToken);

        if (result is null)
        {
            throw new PostNotFoundException(query.PostId);
        }

        return result;
    }
}
```

---

## 5. Multi-Aggregate Projections

Read stores can join across multiple aggregate tables in a single EF Core query. This is a natural EF Core projection and does not require any changes to the handler.

```csharp
public async Task<IReadOnlyList<PostWithAuthorSummary>> GetPublishedWithAuthorAsync(
    CancellationToken cancellationToken)
{
    return await _dbContext.Posts
        .Where(p => p.State is PublishedPostState)
        .Join(
            _dbContext.Authors,
            p => p.AuthorId,
            a => a.Id,
            (p, a) => new PostWithAuthorSummary
            {
                PostId = p.Id,
                PostTitle = p.Title.Value,
                AuthorId = a.Id,
                AuthorName = a.DisplayName,
                PublishedAt = ((PublishedPostState)p.State).PublishedAt
            })
        .OrderByDescending(r => r.PublishedAt)
        .ToListAsync(cancellationToken);
}
```

---

## 6. Escalation Path

When EF Core `Select` is insufficient (complex reporting queries, window functions, cross-schema joins), use Dapper raw SQL in a new implementation of the same `IReadStore` interface. The handler does not change. Only the Infrastructure implementation changes. This preserves the query handler's testability and the interface contract while allowing the flexibility of raw SQL where needed.

---

## 7. Project-Specific Read Store Inventory

> **Note:** This section is filled in per project.

| Read Store Interface | Implementation Class | Aggregate(s) Queried |
|:---|:---|:---|
| _(example) `IPostReadStore`_ | _(example) `PostReadStore`_ | `Post`, `Author` |
| _(example) `IOrderReadStore`_ | _(example) `OrderReadStore`_ | `Order`, `Customer` |

