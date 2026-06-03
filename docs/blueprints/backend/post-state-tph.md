# Blueprint: Post state TPH persistence

Copy these files when an aggregate uses a discriminated union for lifecycle state. Replace `Post` / `PostState` with your aggregate names. See `docs/conventions/backend/infrastructure-layer.md` and `docs/conventions/backend/query-read-strategy.md`.

EF Core complex type inheritance is not available yet ([dotnet/efcore#31250](https://github.com/dotnet/efcore/issues/31250)). Use TPH columns on the aggregate table and an interceptor until that ships.

---

## 1. Shared column constants (`Application.Read.Contracts`)

```csharp
namespace {ProjectName}.Application.Read.Contracts.Posts;

public static class PostStateColumns
{
    public const string StateType = "StateType";
    public const string PublishedAt = "PublishedAt";
    public const string ArchivedAt = "ArchivedAt";

    public const string Draft = "Draft";
    public const string Published = "Published";
    public const string Archived = "Archived";
}
```

---

## 2. EF configuration (`Infrastructure/Persistence/Configurations/PostConfiguration.cs`)

```csharp
internal sealed class PostConfiguration : IEntityTypeConfiguration<Post>
{
    public void Configure(EntityTypeBuilder<Post> builder)
    {
        builder.ToTable("posts");
        builder.HasKey(p => p.Id);

        builder.Ignore(p => p.State);

        builder.Property<string>(PostStateColumns.StateType)
            .HasColumnName("state_type")
            .HasMaxLength(20)
            .IsRequired()
            .HasDefaultValue(PostStateColumns.Draft);

        builder.Property<DateTimeOffset?>(PostStateColumns.PublishedAt)
            .HasColumnName("published_at");

        builder.Property<DateTimeOffset?>(PostStateColumns.ArchivedAt)
            .HasColumnName("archived_at");

        builder.HasIndex(PostStateColumns.StateType).HasDatabaseName("ix_posts_state_type");
        builder.HasIndex(PostStateColumns.PublishedAt).HasDatabaseName("ix_posts_published_at");
    }
}
```

---

## 3. Interceptor (`Infrastructure/Persistence/PostStatePersistence.cs`)

Sync columns to `State` on materialization and `State` to columns before save. Use reflection to write the private `State` setter; do not add `RehydrateState` to Domain.

Register on `DbContext` options:

```csharp
services.AddDbContext<AppDbContext>(options =>
    options
        .UseNpgsql(connectionString)
        .UseSnakeCaseNamingConvention()
        .AddInterceptors(new PostStatePersistenceInterceptor()));
```

See the LitePress reference implementation at `apps/api/src/LitePress.Infrastructure/Persistence/PostStatePersistence.cs`.

---

## 4. Read-side query helpers (`Application.Read`)

```csharp
internal static class PostStateQuery
{
    internal static IQueryable<Post> WherePublished(IQueryable<Post> query) =>
        query.Where(p => EF.Property<string>(p, PostStateColumns.StateType) == PostStateColumns.Published);

    internal static PostState FromColumns(
        string stateType,
        DateTimeOffset? publishedAt,
        DateTimeOffset? archivedAt) =>
        stateType switch
        {
            PostStateColumns.Draft => new DraftPostState(),
            PostStateColumns.Published when publishedAt.HasValue => new PublishedPostState(publishedAt.Value),
            PostStateColumns.Archived when archivedAt.HasValue => new ArchivedPostState(archivedAt.Value),
            _ => throw new InvalidOperationException($"Unknown post state discriminator '{stateType}'.")
        };
}
```

---

## 5. Migration checkpoint

`dotnet ef migrations add` MUST produce:

- `state_type varchar NOT NULL`
- `published_at timestamptz NULL`
- `archived_at timestamptz NULL`
- indexes on `state_type` and `published_at`

MUST NOT produce a single `jsonb` `state` column unless a project ADR documents that deviation.
