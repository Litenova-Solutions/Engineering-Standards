# Infrastructure Layer

This document is the authoritative guide for all design decisions in the Infrastructure layer. Read it in full before writing or modifying any infrastructure code.

---

## Guiding Philosophy

The Infrastructure layer adapts external systems (databases, file storage, email providers, payment gateways) to the interfaces defined by the Domain and Application layers. It contains no business logic. If you find yourself writing a business rule here, it belongs in the Domain layer. If you find yourself writing a use-case orchestration, it belongs in the Application layer.

---

## Folder Structure

```
src/{ProjectName}.Infrastructure/
├── GlobalUsings.cs
├── Behaviors/
│   ├── TransactionCommandPreHandler.cs
│   ├── SaveChangesCommandPostHandler.cs
│   └── RollbackCommandErrorHandler.cs
├── Persistence/
│   ├── {ProjectName}DbContext.cs
│   ├── Configurations/
│   │   ├── PostConfiguration.cs
│   │   └── OrderConfiguration.cs
│   ├── Repositories/
│   │   ├── PostRepository.cs
│   │   └── OrderRepository.cs
│   └── Migrations/
│       └── (EF Core generated files - never edit manually)
├── BackgroundJobs/
│   ├── OutboxDispatcherHostedService.cs
│   └── CleanupIdempotencyRecordsHostedService.cs
├── Reliability/
│   ├── Outbox/
│   └── Idempotency/
├── ExternalServices/
│   └── {ServiceName}/
│       └── {ServiceName}Client.cs
├── Notifications/
│   └── PostPublishedNotifier.cs
└── DependencyInjection/
    └── InfrastructureServiceRegistration.cs
```

---

## EF Core Conventions

### PostgreSQL snake_case Mapping Rules

To prevent PostgreSQL from requiring double-quotes (e.g., `"Posts"`, `"Id"`) in SQL queries, **all database objects (table names, columns, primary keys, foreign keys, and indexes) MUST be mapped in `snake_case`**.

You **MUST** install the NuGet package `EFCore.NamingConventions` and configure `AppDbContext` to use snake_case in `InfrastructureServiceRegistration.cs`:

```csharp
services.AddDbContext<AppDbContext>(options =>
    options
        .UseNpgsql(configuration.GetConnectionString("Database"))
        .UseSnakeCaseNamingConventions()); // Enforces snake_case across all tables and columns
```

#### Naming Conventions for Database Objects:
*   **Table Names:** Singular, snake_case (e.g., `post`, `order_line`), or standard pluralized snake_case if preferred by project team (e.g., `posts`, `order_lines`), but **MUST** be consistent across the entire database.
*   **Primary Keys:** `pk_{table_name}` (automatically handled by `.UseSnakeCaseNamingConventions()`).
*   **Foreign Keys:** `fk_{child_table}_{parent_table}_{parent_column}` (automatically handled).
*   **Single-Column Indexes:** `ix_{table_name}_{column_name}`
*   **Composite Indexes:** `ix_{table_name}_{column1}_{column2}`
*   **Unique Constraints:** `uq_{table_name}_{column_name}`

```csharp
// DO: Manually declare unique indexes with strict snake_case names
builder.HasIndex(u => u.Email)
    .IsUnique()
    .HasDatabaseName("uq_users_email");
```

### Configuration Classes

Every aggregate MUST have a dedicated `IEntityTypeConfiguration<T>` class. Never put fluent API calls inline in `OnModelCreating`.

```csharp
// GOOD:
internal sealed class PostConfiguration : IEntityTypeConfiguration<Post>
{
    public void Configure(EntityTypeBuilder<Post> builder)
    {
        builder.ToTable("Posts");
        builder.HasKey(p => p.Id);
    }
}

// BAD:
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<Post>(builder =>
    {
        builder.ToTable("Posts");
        builder.HasKey(p => p.Id);
    });
}
```

Configuration classes MUST be `internal sealed`. They are an implementation detail of the Infrastructure project.

In `OnModelCreating`, apply all configurations with:

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.ApplyConfigurationsFromAssembly(typeof({ProjectName}DbContext).Assembly);
}
```

### Strongly-Typed ID Value Converters

Strongly-typed IDs require value converters so EF Core can map them to and from `Guid` columns.

```csharp
internal sealed class PostConfiguration : IEntityTypeConfiguration<Post>
{
    public void Configure(EntityTypeBuilder<Post> builder)
    {
        builder.ToTable("Posts");
        builder.HasKey(p => p.Id);

        builder.Property(p => p.Id)
            .HasConversion(id => id.Value, value => new PostId(value));

        builder.Property(p => p.AuthorId)
            .HasConversion(id => id.Value, value => new AuthorId(value));
    }
}
```

### EF Core Owned Entities for Value Objects

Value objects that are stored as columns in the owning aggregate's table (not in a separate table) are configured using `OwnsOne`. Value objects with multiple properties require explicit column mapping.

```csharp
// GOOD: PostTitle stored as a single column in the Posts table
internal sealed class PostConfiguration : IEntityTypeConfiguration<Post>
{
    public void Configure(EntityTypeBuilder<Post> builder)
    {
        builder.ToTable("Posts");

        builder.OwnsOne(p => p.Title, titleBuilder =>
        {
            titleBuilder.Property(t => t.Value)
                .HasColumnName("Title")
                .HasMaxLength(200)
                .IsRequired();
        });

        builder.OwnsOne(p => p.Content, contentBuilder =>
        {
            contentBuilder.Property(c => c.Value)
                .HasColumnName("Content")
                .IsRequired();
        });
    }
}

// GOOD: Money value object with two properties stored in the same table
internal sealed class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        builder.OwnsOne(o => o.TotalAmount, moneyBuilder =>
        {
            moneyBuilder.Property(m => m.Amount)
                .HasColumnName("TotalAmount")
                .HasPrecision(18, 2)
                .IsRequired();

            moneyBuilder.Property(m => m.Currency)
                .HasColumnName("TotalCurrency")
                .HasMaxLength(3)
                .IsRequired();
        });
    }
}

// BAD: storing a value object by mapping its properties individually
// without OwnsOne, which breaks the value object encapsulation
builder.Property("Title_Value").HasColumnName("Title");
```

### Private Backing Fields for Collections

Aggregate collections use private `List<T>` backing fields. EF Core must be configured to use those fields.

```csharp
internal sealed class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        builder.ToTable("Orders");
        builder.HasKey(o => o.Id);

        builder.Property(o => o.Id)
            .HasConversion(id => id.Value, value => new OrderId(value));

        builder.HasMany<OrderLine>("_lines")
            .WithOne()
            .HasForeignKey("OrderId")
            .IsRequired();

        builder.Navigation("_lines").UsePropertyAccessMode(PropertyAccessMode.Field);
    }
}
```

---

## Repository Implementation Pattern

Repository implementations resolve the domain interface defined in the Domain layer.

```csharp
internal sealed class PostRepository : IPostRepository
{
    private readonly AppDbContext _dbContext;

    public PostRepository(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    /// <summary>
    /// Retrieves a post by its ID.
    /// </summary>
    /// <exception cref="PostNotFoundException">Thrown when no post exists with the given ID.</exception>
    public async Task<Post> GetByIdAsync(PostId id, CancellationToken cancellationToken)
    {
        var post = await _dbContext.Posts
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);

        if (post is null)
        {
            throw new PostNotFoundException(id);
        }

        return post;
    }

    public async Task AddAsync(Post post, CancellationToken cancellationToken)
    {
        // Stage the insert. The pipeline post-handler calls SaveChangesAsync.
        await _dbContext.Posts.AddAsync(post, cancellationToken);
    }

    public Task UpdateAsync(Post post, CancellationToken cancellationToken)
    {
        // EF Core change tracking detects the modification automatically.
        // No SaveChangesAsync call needed here.
        _dbContext.Posts.Update(post);
        return Task.CompletedTask;
    }
}
```

// BAD: repository calls SaveChangesAsync directly
```csharp
public async Task AddAsync(Post post, CancellationToken cancellationToken)
{
    await _dbContext.Posts.AddAsync(post, cancellationToken);
    await _dbContext.SaveChangesAsync(cancellationToken);
    // BAD: this commits before the pipeline post-handler runs,
    // breaking the transaction boundary
}
```

---

## `IDatabaseContext` Implementation

`AppDbContext` implements `IDatabaseContext` from `Application.Read.Contracts`. This is the only change required to `AppDbContext` to support the read-side query pattern. Add one `IQueryable<T>` property per aggregate.

```csharp
// Infrastructure/Persistence/AppDbContext.cs
internal sealed class AppDbContext : DbContext, IDatabaseContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options) { }

    // DbSet properties satisfy both EF Core tracking and IDatabaseContext
    public DbSet<Post> Posts => Set<Post>();
    public DbSet<Author> Authors => Set<Author>();
    public DbSet<Order> Orders => Set<Order>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(
            typeof(AppDbContext).Assembly);
    }
}
```

When a new aggregate is added to the domain, add its `DbSet<T>` property here and add the corresponding `IQueryable<T>` property to `IDatabaseContext` in `Application.Read.Contracts`.

> **Note on assembly visibility.** `AppDbContext` is `internal sealed` within the Infrastructure assembly. The DI container resolves it at runtime via the interface registration `services.AddScoped<IDatabaseContext>(sp => sp.GetRequiredService<AppDbContext>())`. This works because .NET's DI container uses runtime types, bypassing compile-time visibility. The `Application.Read` project references `IDatabaseContext` only; it never references `AppDbContext` or the Infrastructure assembly directly.

---

## Transaction Pipeline Behaviors

Transaction management is handled by three global LiteBus pipeline behaviors. Command handlers do not call `SaveChangesAsync`. Repositories do not call `SaveChangesAsync`.

```csharp
// Infrastructure/Behaviors/TransactionCommandPreHandler.cs
/// <summary>
/// Opens a database transaction before every command executes.
/// Runs at priority 10, after validators (priority 0), so no transaction
/// is opened for invalid input.
/// </summary>
[HandlerPriority(10)]
internal sealed class TransactionCommandPreHandler
    : ICommandPreHandler<ICommand>
{
    private readonly AppDbContext _dbContext;

    public TransactionCommandPreHandler(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task PreHandleAsync(
        ICommand command,
        CancellationToken cancellationToken)
    {
        await _dbContext.Database
            .BeginTransactionAsync(cancellationToken);
    }
}
```

```csharp
// Infrastructure/Behaviors/SaveChangesCommandPostHandler.cs
/// <summary>
/// Saves all pending changes and commits the transaction after every
/// command handler completes successfully.
/// </summary>
internal sealed class SaveChangesCommandPostHandler
    : ICommandPostHandler<ICommand>
{
    private readonly AppDbContext _dbContext;

    public SaveChangesCommandPostHandler(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task PostHandleAsync(
        ICommand command,
        object? result,
        CancellationToken cancellationToken)
    {
        await _dbContext.SaveChangesAsync(cancellationToken);
        await _dbContext.Database.CommitTransactionAsync(cancellationToken);
    }
}
```

```csharp
// Infrastructure/Behaviors/RollbackCommandErrorHandler.cs
/// <summary>
/// Rolls back the active transaction if any exception is thrown during
/// command execution, then re-throws the exception so the
/// GlobalExceptionHandler maps it to the correct HTTP response.
/// </summary>
internal sealed class RollbackCommandErrorHandler
    : ICommandErrorHandler<ICommand>
{
    private readonly AppDbContext _dbContext;

    public RollbackCommandErrorHandler(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task HandleErrorAsync(
        ICommand command,
        Exception exception,
        CancellationToken cancellationToken)
    {
        if (_dbContext.Database.CurrentTransaction is not null)
        {
            await _dbContext.Database
                .RollbackTransactionAsync(cancellationToken);
        }

        throw exception;
    }
}
```

---

## Implementing Narrow Reactions Interfaces

The Infrastructure layer implements the narrow interfaces defined in `Application.Reactions`. Infrastructure references the Reactions project to implement these interfaces.

```csharp
// Application.Reactions/Posts/OnPostPublished/IPostPublishedNotifier.cs
// (defined in Application.Reactions)
internal interface IPostPublishedNotifier
{
    Task NotifySubscribersAsync(PostId postId, string postTitle, CancellationToken cancellationToken);
}

// GOOD: Infrastructure implements the narrow interface using real external libraries
// Infrastructure/Notifications/PostPublishedNotifier.cs
internal sealed class PostPublishedNotifier : IPostPublishedNotifier
{
    private readonly IEmailClient _emailClient;

    public PostPublishedNotifier(IEmailClient emailClient)
    {
        _emailClient = emailClient;
    }

    public async Task NotifySubscribersAsync(
        PostId postId,
        string postTitle,
        CancellationToken cancellationToken)
    {
        // Implementation using real email client
        await _emailClient.SendAsync($"New post: {postTitle}", cancellationToken);
    }
}
```

---

## Dependency Injection Registration

All Infrastructure registrations live in a single extension method. `Program.cs` calls this method, keeping the WebApi project free of Infrastructure knowledge except in DI wiring.

```csharp
internal static class InfrastructureServiceRegistration
{
    internal static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddDbContext<AppDbContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("Database")));

        // IDatabaseContext is satisfied by AppDbContext via DI
        services.AddScoped<IDatabaseContext>(
            sp => sp.GetRequiredService<AppDbContext>());

        // Repositories (write side)
        services.AddScoped<IPostRepository, PostRepository>();
        services.AddScoped<IOrderRepository, OrderRepository>();

        // Reactions infrastructure implementations
        services.AddScoped<IPostPublishedNotifier, PostPublishedNotifier>();

        return services;
    }
}
```

In `Program.cs`, call `AddInfrastructure` and register LiteBus with incremental module registration:

```csharp
// WebApi/Program.cs (LiteBus registration excerpt)
builder.Services.AddInfrastructure(builder.Configuration);

builder.Services.AddLiteBus(liteBus =>
{
    // Application.Write assembly -- command handlers and validators
    liteBus.AddCommandModule(module =>
    {
        module.RegisterFromAssembly(
            typeof(CreatePostCommandHandler).Assembly);
    });

    // Infrastructure assembly -- global pipeline behaviors
    // Explicit registration makes pipeline behaviors visible
    // to engineers reading Program.cs
    liteBus.AddCommandModule(module =>
    {
        module.Register(typeof(TransactionCommandPreHandler));
        module.Register(typeof(SaveChangesCommandPostHandler));
        module.Register(typeof(RollbackCommandErrorHandler));
    });

    // Application.Read assembly -- query handlers and validators
    liteBus.AddQueryModule(module =>
    {
        module.RegisterFromAssembly(
            typeof(GetPostByIdQueryHandler).Assembly);
    });

    // Application.Reactions assembly -- event handlers
    liteBus.AddEventModule(module =>
    {
        module.RegisterFromAssembly(
            typeof(NotifySubscribersOnPostPublishedEventHandler).Assembly);
    });
});
```

---

## Migration Policy

Migrations are generated by running the EF Core tools against the Infrastructure project.

```bash
dotnet ef migrations add {MigrationName} \
  --project src/{ProjectName}.Infrastructure \
  --startup-project src/{ProjectName}.WebApi
```

**Naming convention:** `{YYYYMMdd}_{PascalCaseDescription}`

Examples:
- `20240315_CreatePostsTable`
- `20240401_AddPublishedAtToPost`

Never edit a migration file after it has been applied to any environment. If a migration has a mistake and has already been applied to staging or production, create a corrective migration. Do not modify the existing one.

Production migration safety is defined in `docs/conventions/backend/13-deployment-and-migrations.md`. In short:

- Generate and review SQL scripts or migration bundles for production.
- Do not call `Database.MigrateAsync()` from application startup in production.
- Use expand and contract for destructive schema changes.
- Backfills must be idempotent and restartable.

---

Project-specific infrastructure configuration is documented in the project repository.
