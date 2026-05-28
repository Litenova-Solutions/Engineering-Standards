# Raw SQL and Reporting Queries

This document defines when and how to use raw SQL inside query handlers. Read it before writing any query that involves more than three joined tables, aggregates, full-text search, or reporting projections.

---

## Agent Quick Rules

- Raw SQL in query handlers is ALLOWED when LINQ produces an inefficient or unreadable query.
- MUST use `FromSqlInterpolated` or `Database.SqlQueryRaw` with parameterized values only.
- MUST NOT concatenate SQL strings or use string interpolation that injects user input.
- Complex reports MUST use keyless entity types or database views, not anonymous projections from raw SQL.
- Full-text search MUST use `to_tsvector` / `to_tsquery` via `EF.Functions` or raw SQL; MUST NOT use `LIKE '%term%'` on large tables.
- Raw SQL that runs in production MUST be reviewed for index use before merge.

---

## 1. When Raw SQL Is Allowed

Use raw SQL in query handlers when:

- The required query involves a window function (`ROW_NUMBER`, `RANK`, `LAG`, `LEAD`).
- The required query uses a CTE (`WITH ... AS`).
- The query involves three or more joins and the generated SQL is inefficient or unreadable.
- The query requires full-text search (`to_tsvector`, `to_tsquery`).
- The query is a reporting projection over a materialized view or reporting-specific table.
- LINQ translation fails and `EF.Functions` does not cover the required function.

Raw SQL is not a shortcut for avoiding LINQ. Use it only when LINQ cannot produce the correct SQL or produces obviously poor SQL (for example, N+1 loads or client-side evaluation warnings).

---

## 2. Safe Parameterization With `FromSqlInterpolated`

```csharp
// GOOD: parameterized via string interpolation — EF Core generates a SQL parameter
var results = await _context.Posts
    .FromSqlInterpolated($"""
        SELECT id, title, content, author_id, published_at_utc
        FROM posts
        WHERE author_id = {query.AuthorId.Value}
          AND published_at_utc >= {query.FromUtc}
        ORDER BY published_at_utc DESC
        LIMIT {query.PageSize} OFFSET {(query.Page - 1) * query.PageSize}
        """)
    .AsNoTracking()
    .ToListAsync(cancellationToken);

// BAD: string concatenation — SQL injection risk
var sql = $"SELECT * FROM posts WHERE author_id = '{query.AuthorId.Value}'";
var results = await _context.Posts.FromSqlRaw(sql).ToListAsync(cancellationToken);
```

`FromSqlInterpolated` converts the interpolated values into `DbParameter` instances. It is safe for user-supplied values. `FromSqlRaw` accepts a plain string and requires manual parameterization via `@p0` placeholders — use it only with constant SQL strings.

---

## 3. Keyless Entity Types

Keyless entity types map query results to classes without requiring a primary key. Use them for reporting projections, view-based queries, and stored procedure results.

```csharp
// Application.Read.Contracts/Reporting/PostSummaryReport.cs
public sealed class PostSummaryReport
{
    public required Guid AuthorId { get; init; }
    public required string AuthorName { get; init; }
    public required int TotalPosts { get; init; }
    public required int PublishedPosts { get; init; }
    public required DateTimeOffset? LastPublishedAtUtc { get; init; }
}
```

```csharp
// Infrastructure/Persistence/AppDbContext.cs
// Add a DbSet for the keyless entity
public DbSet<PostSummaryReport> PostSummaryReports => Set<PostSummaryReport>();
```

```csharp
// Infrastructure/Persistence/Configurations/PostSummaryReportConfiguration.cs
internal sealed class PostSummaryReportConfiguration
    : IEntityTypeConfiguration<PostSummaryReport>
{
    public void Configure(EntityTypeBuilder<PostSummaryReport> builder)
    {
        builder.HasNoKey();
        builder.ToView(null); // no backing table; result comes from SQL only
    }
}
```

```csharp
// Application.Read/Reporting/GetPostSummaryReport/GetPostSummaryReportQueryHandler.cs
internal sealed class GetPostSummaryReportQueryHandler
    : IQueryHandler<GetPostSummaryReportQuery, IReadOnlyList<PostSummaryReport>>
{
    private readonly IDatabaseContext _context;

    public GetPostSummaryReportQueryHandler(IDatabaseContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<PostSummaryReport>> HandleAsync(
        GetPostSummaryReportQuery query,
        CancellationToken cancellationToken)
    {
        return await _context.PostSummaryReports
            .FromSqlInterpolated($"""
                SELECT
                    u.id          AS author_id,
                    u.name        AS author_name,
                    COUNT(p.id)   AS total_posts,
                    COUNT(p.id) FILTER (WHERE p.published_at_utc IS NOT NULL)
                                  AS published_posts,
                    MAX(p.published_at_utc) AS last_published_at_utc
                FROM users u
                LEFT JOIN posts p ON p.author_id = u.id
                WHERE u.tenant_id = {query.TenantId}
                GROUP BY u.id, u.name
                ORDER BY published_posts DESC
                """)
            .AsNoTracking()
            .ToListAsync(cancellationToken);
    }
}
```

---

## 4. Database Views

When a reporting query is used frequently or shared across multiple endpoints, promote it to a database view. Map the view using EF Core's `ToView`.

```csharp
// Infrastructure/Persistence/Configurations/PostSummaryReportConfiguration.cs
internal sealed class PostSummaryReportConfiguration
    : IEntityTypeConfiguration<PostSummaryReport>
{
    public void Configure(EntityTypeBuilder<PostSummaryReport> builder)
    {
        builder.HasNoKey();
        builder.ToView("v_post_summary_report");
    }
}
```

Create the view in a migration using `migrationBuilder.Sql(...)`. The view definition MUST be idempotent (`CREATE OR REPLACE VIEW`).

```csharp
// Infrastructure/Persistence/Migrations/{timestamp}_AddPostSummaryReportView.cs
migrationBuilder.Sql("""
    CREATE OR REPLACE VIEW v_post_summary_report AS
    SELECT
        u.id          AS author_id,
        u.name        AS author_name,
        COUNT(p.id)   AS total_posts,
        ...
    FROM users u
    LEFT JOIN posts p ON p.author_id = u.id
    GROUP BY u.id, u.name;
    """);
```

---

## 5. Full-Text Search

MUST NOT use `LIKE '%term%'` for search on tables with more than a few thousand rows. Use PostgreSQL full-text search.

```csharp
// Application.Read/Posts/Search/SearchPostsQueryHandler.cs
return await _context.Posts
    .FromSqlInterpolated($"""
        SELECT id, title, content, author_id, published_at_utc
        FROM posts
        WHERE to_tsvector('english', title || ' ' || content)
              @@ plainto_tsquery('english', {query.SearchTerm})
          AND published_at_utc IS NOT NULL
        ORDER BY ts_rank(
            to_tsvector('english', title || ' ' || content),
            plainto_tsquery('english', {query.SearchTerm})) DESC
        LIMIT {query.PageSize} OFFSET {(query.Page - 1) * query.PageSize}
        """)
    .AsNoTracking()
    .ToListAsync(cancellationToken);
```

For high-volume search, add a generated column with the tsvector pre-computed and a GIN index on it:

```sql
ALTER TABLE posts
    ADD COLUMN search_vector tsvector
    GENERATED ALWAYS AS (
        to_tsvector('english', title || ' ' || coalesce(content, ''))
    ) STORED;

CREATE INDEX ix_posts_search_vector ON posts USING GIN (search_vector);
```

---

## 6. CTEs

Use CTEs for queries that require multiple logical steps or that reference the same intermediate result more than once.

```csharp
// Query with a CTE — readable and avoids repeating the subquery
return await _context.Database
    .SqlQueryRaw<TopAuthorResult>("""
        WITH ranked_authors AS (
            SELECT author_id, COUNT(*) AS post_count
            FROM posts
            WHERE published_at_utc >= @fromDate
            GROUP BY author_id
        )
        SELECT u.id, u.name, ra.post_count
        FROM ranked_authors ra
        JOIN users u ON u.id = ra.author_id
        ORDER BY ra.post_count DESC
        LIMIT 10
        """,
        new NpgsqlParameter("@fromDate", query.FromDate))
    .ToListAsync(cancellationToken);
```

When using `Database.SqlQueryRaw<T>` (EF Core 8+), manual parameterization with `NpgsqlParameter` is required. Prefer `FromSqlInterpolated` on `DbSet<T>` when the result maps to a registered entity type or keyless entity type.

---

## 7. Performance Review Requirements

Raw SQL merged to the main branch MUST include evidence that the query uses an appropriate index. The pull request description MUST include:

| Field | Requirement |
|:---|:---|
| `EXPLAIN (ANALYZE, BUFFERS)` output | From a **sanitized** plan (no production PII in literals or row samples) |
| Dataset size | Minimum representative row count (state table name and approximate rows) |
| Statement timeout | Expected `statement_timeout` for this query in production |
| Index evidence | Link to migration or index definition if not obvious from the plan |

Redact or parameterize literals that contain customer data before pasting plans into PRs.

This prevents hot-path queries from performing sequential scans in production.

---

## 8. Reporting Endpoints

Reporting queries that aggregate large datasets MUST:

- Not be exposed on endpoints with the same rate limit as standard CRUD endpoints.
- Include a maximum date range or result limit in the query logic.
- Return pagination or a streaming response for results larger than a few hundred rows.
- Log query duration via the observability middleware (see `docs/conventions/backend/09-observability.md`).
