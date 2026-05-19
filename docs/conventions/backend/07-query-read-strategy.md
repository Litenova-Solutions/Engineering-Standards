# Query Read Strategy

This document defines the read-side strategy for all query handlers. The `IDatabaseContext` pattern is the standard. The per-aggregate read store pattern was superseded by this approach (see ADR 0015).

> This convention implements ADR 0015 (supersedes ADR 0007). Read ADR 0015 for the full decision rationale and trade-offs.

---

## 1. Why IDatabaseContext

The previous read-side convention defined a separate `IXxxReadStore` interface per aggregate. For each aggregate, this produced three files: the interface, the Infrastructure implementation, and the handler. None of those extra files contain business logic. They contain only EF Core projection code wrapped in an interface that exists solely to satisfy a dependency rule. The ceremony grows with every new query without adding any value.

The alternative of injecting `AppDbContext` directly into query handlers would violate the dependency rule: `Application.Read` would reference Infrastructure. That is not acceptable.

`IDatabaseContext` is the middle path. It is a single interface defined in `Application.Read.Contracts/Shared/`. It exposes one `IQueryable<T>` property per aggregate. `AppDbContext` in Infrastructure implements it. Query handlers inject `IDatabaseContext` and write LINQ projections directly, with no per-aggregate indirection. `Application.Read` still does not reference Infrastructure. The dependency boundary is preserved.

`IDatabaseContext` is not called `IReadRepository` or `IReadStore`. It is not a repository. It does not load aggregates. It exposes queryable collections for EF Core projections. The name reflects its role: it is the read-side view of the database context.

---

## 2. The IDatabaseContext Interface

`IDatabaseContext` lives in `Application.Read.Contracts/Shared/IDatabaseContext.cs`. Add one property when a new aggregate needs query handlers.

```csharp
// GOOD: query handler injects IDatabaseContext
internal sealed class GetPostByIdQueryHandler
    : IQueryHandler<GetPostByIdQuery, PostResult>
{
    private readonly IDatabaseContext _db;

    public GetPostByIdQueryHandler(IDatabaseContext db)
    {
        _db = db;
    }

    public async Task<PostResult> HandleAsync(
        GetPostByIdQuery query,
        CancellationToken cancellationToken)
    {
        // Write projections directly
        var result = await _db.Posts
            .Where(p => p.Id == query.PostId)
            .Select(p => new PostResult { Id = p.Id, Title = p.Title.Value })
            .FirstOrDefaultAsync(cancellationToken);

        if (result is null)
        {
            throw new PostNotFoundException(query.PostId);
        }

        return result;
    }
}

// BAD: query handler injects IPostRepository
internal sealed class GetPostByIdQueryHandler
    : IQueryHandler<GetPostByIdQuery, PostResult>
{
    private readonly IPostRepository _postRepository; // BAD: repository in query handler
}

// BAD: query handler injects AppDbContext directly
internal sealed class GetPostByIdQueryHandler
    : IQueryHandler<GetPostByIdQuery, PostResult>
{
    private readonly AppDbContext _dbContext; // BAD: references Infrastructure project
}
```

---

## 3. Writing Projections

### Simple Single-Aggregate Projection

```csharp
public async Task<PostResult> HandleAsync(
    GetPostByIdQuery query,
    CancellationToken cancellationToken)
{
    var result = await _db.Posts
        .Where(p => p.Id == query.PostId)
        .Select(p => new PostResult
        {
            Id = p.Id,
            Title = p.Title.Value,
            Content = p.Content.Value,
            AuthorName = p.Author.DisplayName,
            PublishedAt = p.State is PublishedPostState s ? s.PublishedAt : null
        })
        .FirstOrDefaultAsync(cancellationToken);

    if (result is null)
    {
        throw new PostNotFoundException(query.PostId);
    }

    return result;
}
```

### Paginated Projection

```csharp
public async Task<PagedResult<PostSummary>> HandleAsync(
    GetAllPostsQuery query,
    CancellationToken cancellationToken)
{
    var pageSize = Math.Min(
        query.Pagination.PageSize,
        PaginationParameters.MaxPageSize);

    var baseQuery = _db.Posts
        .Where(p => p.State is PublishedPostState);

    var totalCount = query.Pagination.SkipTotalCount
        ? 0
        : await baseQuery.CountAsync(cancellationToken);

    var items = await baseQuery
        .OrderByDescending(p => ((PublishedPostState)p.State).PublishedAt)
        .Skip((query.Pagination.PageNumber - 1) * pageSize)
        .Take(pageSize)
        .Select(p => new PostSummary
        {
            Id = p.Id,
            Title = p.Title.Value,
            PublishedAt = ((PublishedPostState)p.State).PublishedAt
        })
        .ToListAsync(cancellationToken);

    return new PagedResult<PostSummary>
    {
        Items = items,
        TotalCount = totalCount,
        PageNumber = query.Pagination.PageNumber,
        PageSize = pageSize
    };
}
```

### Multi-Aggregate Projection

`IDatabaseContext` exposes multiple aggregates. A single LINQ projection can join across them without multiple round trips:

```csharp
public async Task<PostWithAuthorResult> HandleAsync(
    GetPostWithAuthorQuery query,
    CancellationToken cancellationToken)
{
    return await _db.Posts
        .Where(p => p.State is PublishedPostState)
        .Select(p => new PostWithAuthorResult
        {
            PostId = p.Id,
            PostTitle = p.Title.Value,
            // EF Core resolves this as a JOIN, no separate Author query
            AuthorName = _db.Authors
                .Where(a => a.Id == p.AuthorId)
                .Select(a => a.DisplayName)
                .FirstOrDefault() ?? string.Empty,
            PublishedAt = ((PublishedPostState)p.State).PublishedAt
        })
        .OrderByDescending(r => r.PublishedAt)
        .ToListAsync(cancellationToken);
}
```

---

## 4. Null Handling

Query handlers MUST throw `AggregateNotFoundException` subclasses when a resource is not found. MUST NOT return null to the caller.

```csharp
// GOOD: throw when not found
var result = await _db.Posts
    .Where(p => p.Id == query.PostId)
    .Select(p => new PostResult { ... })
    .FirstOrDefaultAsync(cancellationToken);

if (result is null)
{
    throw new PostNotFoundException(query.PostId);
}

return result;

// BAD: returning null
var result = await _db.Posts
    .Where(p => p.Id == query.PostId)
    .Select(p => new PostResult { ... })
    .FirstOrDefaultAsync(cancellationToken);

return result; // BAD: caller must null-check; GlobalExceptionHandler cannot map null to 404
```

---

## 5. AsNoTracking Note

`AsNoTracking()` is not needed when using `Select` projections. EF Core does not track projected types because the result type is not a registered entity. Adding `AsNoTracking()` is redundant and adds noise.

```csharp
// GOOD: no AsNoTracking() needed
var result = await _db.Posts
    .Where(p => p.Id == query.PostId)
    .Select(p => new PostResult { Id = p.Id, Title = p.Title.Value })
    .FirstOrDefaultAsync(cancellationToken);

// BAD: redundant AsNoTracking() on a Select projection
var result = await _db.Posts
    .AsNoTracking() // BAD: redundant; EF Core does not track projected types
    .Where(p => p.Id == query.PostId)
    .Select(p => new PostResult { Id = p.Id, Title = p.Title.Value })
    .FirstOrDefaultAsync(cancellationToken);
```

---

## 6. IStreamQuery for Internal Processing

LiteBus supports `IStreamQuery<T>` and `IStreamQueryHandler<T>` for streaming scenarios. This is appropriate for background processing and data export where the consumer processes items incrementally. It is NOT appropriate for HTTP endpoints because the HTTP client buffers the entire response before processing it, eliminating the streaming benefit.

```csharp
// For background processing and data export only
public sealed record ExportAllPostsQuery : IStreamQuery<PostExportRow>;

internal sealed class ExportAllPostsQueryHandler
    : IStreamQueryHandler<ExportAllPostsQuery, PostExportRow>
{
    private readonly IDatabaseContext _db;

    public ExportAllPostsQueryHandler(IDatabaseContext db)
    {
        _db = db;
    }

    public async IAsyncEnumerable<PostExportRow> HandleAsync(
        ExportAllPostsQuery query,
        [EnumeratorCancellation] CancellationToken cancellationToken)
    {
        await foreach (var post in _db.Posts
            .Select(p => new PostExportRow
            {
                Id = p.Id,
                Title = p.Title.Value
            })
            .AsAsyncEnumerable()
            .WithCancellation(cancellationToken))
        {
            yield return post;
        }
    }
}
```

HTTP list endpoints use `PagedResult<T>` with `PaginationParameters`. See ADR 0017 for the full pagination rationale.

---

The read model inventory for a specific project lives in the project repository. Copy `docs/templates/read-model-inventory.md` into `docs/domain/read-model-inventory.md` and fill it in.


