# Soft Delete

This document defines when and how to implement soft delete. Read it before adding a delete operation to any aggregate.

---

## Agent Quick Rules

- Default to hard delete. Only use soft delete when the business requires retention, audit, or restore.
- If soft delete is used, prefer `deleted_at_utc` (nullable timestamp) over `is_deleted` (boolean).
- MUST use EF Core global query filters to exclude soft-deleted rows from all queries automatically.
- EF Core 10 named filters MUST be used when multiple filters coexist (for example, soft delete plus multi-tenancy).
- Unique constraints on soft-deleted rows MUST account for deleted state (partial index recommended).
- Restore MUST be an explicit aggregate operation, not a property setter.

---

## 1. When to Use Soft Delete

Hard delete is the default. Use soft delete only when:

- A regulation or audit requirement mandates record retention.
- The business requires a "trash" or "archive" feature with restore capability.
- The record is referenced by other records and removing it would orphan data that must remain queryable.

Do not use soft delete as a lazy alternative to hard delete. Soft delete accumulates stale rows, complicates unique constraints, and increases query complexity permanently.

---

## 2. The `deleted_at_utc` Pattern

Use a nullable `DateTimeOffset` column named `deleted_at_utc` instead of an `is_deleted` boolean. This approach provides:

- The exact time of deletion for audit purposes.
- A value that is immediately usable in retention policies.
- The same boolean semantics: `deleted_at_utc IS NULL` means not deleted.

```csharp
// Domain/Posts/Post.cs
public sealed class Post : AggregateRoot<PostId>
{
    // ... other members ...

    public DateTimeOffset? DeletedAtUtc { get; private set; }

    public bool IsDeleted => DeletedAtUtc.HasValue;

    public void Delete(DateTimeOffset utcNow)
    {
        if (IsDeleted)
        {
            throw new PostAlreadyDeletedException(Id);
        }

        DeletedAtUtc = utcNow;
        AddDomainEvent(new PostDeleted(Id));
    }

    public void Restore()
    {
        if (!IsDeleted)
        {
            throw new PostNotDeletedException(Id);
        }

        DeletedAtUtc = null;
        AddDomainEvent(new PostRestored(Id));
    }
}
```

The `Delete` and `Restore` methods come from the Application layer via a command. They accept `DateTimeOffset utcNow` passed in from the handler — aggregates do not call `DateTimeOffset.UtcNow` directly.

---

## 3. EF Core Global Query Filter

Apply a global query filter in the entity configuration so that soft-deleted rows are excluded from all queries automatically.

```csharp
// Infrastructure/Persistence/Configurations/PostConfiguration.cs
internal sealed class PostConfiguration : IEntityTypeConfiguration<Post>
{
    public void Configure(EntityTypeBuilder<Post> builder)
    {
        builder.ToTable("posts");

        // ... other mappings ...

        builder.Property(p => p.DeletedAtUtc)
            .HasColumnName("deleted_at_utc");

        // Soft-delete filter: all queries exclude deleted rows by default.
        builder.HasQueryFilter(p => p.DeletedAtUtc == null);
    }
}
```

With this filter in place, no query handler needs to manually add `.Where(p => p.DeletedAtUtc == null)`. The filter applies everywhere including navigation properties.

---

## 4. EF Core 10 Named Filters

When multiple global query filters must coexist (for example, a soft-delete filter and a multi-tenancy filter), use EF Core 10 named filters. Named filters can be individually disabled with `IgnoreQueryFilters(name)` without disabling all filters.

```csharp
// Infrastructure/Persistence/Configurations/PostConfiguration.cs
builder.HasQueryFilter("SoftDelete", p => p.DeletedAtUtc == null);
builder.HasQueryFilter("Tenant", p => p.TenantId == EF.Property<Guid>(this, "_currentTenantId"));
```

```csharp
// Query handler — disable only the soft-delete filter to include deleted rows in admin queries
var deletedPosts = await _context.Posts
    .IgnoreQueryFilters("SoftDelete")
    .Where(p => p.DeletedAtUtc != null)
    .ToListAsync(cancellationToken);
```

Before EF Core 10, use `IgnoreQueryFilters()` (no argument), which disables all filters. When doing so, manually add back any filters that should still apply.

---

## 5. Uniqueness With Soft-Deleted Rows

When a column that was unique on a hard-deleted row must become available again after soft delete, a standard unique index will block re-creation. Use a PostgreSQL partial index that excludes deleted rows.

```csharp
// Infrastructure/Persistence/Configurations/PostConfiguration.cs
builder.HasIndex(p => p.Slug)
    .IsUnique()
    .HasFilter("deleted_at_utc IS NULL")
    .HasDatabaseName("uq_posts_slug_active");
```

This allows a new row with the same slug to be created after the original is soft-deleted.

---

## 6. Querying Soft-Deleted Rows

Admin and audit queries that need to see deleted rows disable the filter explicitly.

```csharp
// Application.Read/Posts/GetDeletedPosts/GetDeletedPostsQueryHandler.cs
internal sealed class GetDeletedPostsQueryHandler
    : IQueryHandler<GetDeletedPostsQuery, IReadOnlyList<PostSummary>>
{
    private readonly IDatabaseContext _context;

    public GetDeletedPostsQueryHandler(IDatabaseContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<PostSummary>> HandleAsync(
        GetDeletedPostsQuery query,
        CancellationToken cancellationToken)
    {
        return await _context.Posts
            .IgnoreQueryFilters("SoftDelete") // EF Core 10 named filter
            .Where(p => p.DeletedAtUtc != null)
            .Select(p => new PostSummary { ... })
            .ToListAsync(cancellationToken);
    }
}
```

Mark all handlers that disable filters with a comment explaining why. Disabling filters without justification in a handler is a code review signal.

---

## 7. Audit Implications

Soft-deleted rows remain in the database and are visible to anyone with direct database access. This has audit and compliance implications:

- Soft-deleted rows MUST be included in data export requests (for example, GDPR subject access requests).
- Soft-deleted rows MUST be anonymized or permanently deleted after the retention period expires.
- Add a cleanup background job to hard-delete rows where `deleted_at_utc < utcNow - retentionPeriod`.

```csharp
// Infrastructure/BackgroundJobs/PurgeDeletedPostsJob.cs
// Runs daily; hard-deletes posts soft-deleted more than 90 days ago.
internal sealed class PurgeDeletedPostsJob : IHostedService
{
    // ... implementation using IServiceScopeFactory to get AppDbContext ...
}
```

---

## 8. Repository Behavior

Repositories on the write side load aggregates through EF Core tracking queries. The global query filter applies here too. A repository's `GetByIdAsync` MUST NOT return a soft-deleted aggregate unless the intent is explicit.

If a use case requires loading a soft-deleted aggregate (for example, a restore command), use a dedicated repository method that explicitly includes deleted records.

```csharp
// Domain/Posts/IPostRepository.cs
interface IPostRepository
{
    Task<Post> GetByIdAsync(PostId id, CancellationToken cancellationToken);

    // Used only by restore commands.
    Task<Post> GetByIdIncludingDeletedAsync(PostId id, CancellationToken cancellationToken);
}
```
