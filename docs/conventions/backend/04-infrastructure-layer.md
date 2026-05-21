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

To prevent PostgreSQL from requiring double-quoted identifiers (e.g., `"Posts"`, `"Id"`) in SQL queries, **all database objects — table names, column names, primary keys, foreign keys, and indexes — MUST be mapped in `snake_case`**.

#### Option A — `EFCore.NamingConventions` package (preferred when compatible)

The community package `EFCore.NamingConventions` applies snake_case globally. Install it and configure the context:

```csharp
services.AddDbContext<AppDbContext>(options =>
    options
        .UseNpgsql(configuration.GetConnectionString("Database"))
        .UseSnakeCaseNamingConventions());
```

Verify the package version is compatible with your EF Core version before using it. Community packages do not always ship simultaneously with major EF Core releases. Check the package's NuGet page or GitHub releases before adding it.

#### Option B — Manual mapping in `OnModelCreating` (fallback)

When the package is unavailable or incompatible, apply snake_case in `OnModelCreating` after all configurations are applied. **Skip owned entity types** — they share the owner's table and columns and have their own explicit column names set inside `OwnsOne` blocks. Applying a blanket rename to shadow FK properties of owned types causes key conflicts.

```csharp
protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);

    foreach (var entity in modelBuilder.Model.GetEntityTypes())
    {
        // Skip owned entities — columns are configured explicitly inside OwnsOne blocks.
        if (entity.IsOwned())
        {
            continue;
        }

        var tableName = entity.GetTableName();
        if (!string.IsNullOrEmpty(tableName))
        {
            entity.SetTableName(ToSnakeCase(tableName));
        }

        foreach (var property in entity.GetProperties())
        {
            var columnName = property.GetColumnName();
            if (!string.IsNullOrEmpty(columnName))
            {
                property.SetColumnName(ToSnakeCase(columnName));
            }
        }
    }
}

private static string ToSnakeCase(string name)
{
    var result = System.Text.RegularExpressions.Regex.Replace(
        System.Text.RegularExpressions.Regex.Replace(name, @"([A-Z]+)([A-Z][a-z])", "$1_$2"),
        @"([a-z\d])([A-Z])", "$1_$2");
    return result.ToLowerInvariant();
}
```

Regardless of which option is used, explicitly set `HasColumnName`, `HasDatabaseName`, and `ToTable` inside every `IEntityTypeConfiguration<T>` class. Explicit beats convention — any name declared in configuration wins over the automatic transformation.

#### Naming Conventions for Database Objects

| Object | Convention | Example |
|:---|:---|:---|
| Table | plural snake_case | `posts`, `order_lines` |
| Column | snake_case | `author_id`, `published_at` |
| Primary key | `pk_{table}` | `pk_posts` |
| Foreign key | `fk_{child}_{parent}_{col}` | `fk_post_tags_posts_post_id` |
| Single-column index | `ix_{table}_{col}` | `ix_posts_author_id` |
| Composite index | `ix_{table}_{col1}_{col2}` | `ix_order_lines_order_id_sku` |
| Unique constraint | `uq_{table}_{col}` | `uq_posts_slug` |

Always declare unique indexes explicitly with a `HasDatabaseName` call:

```csharp
// DO: explicit name, discoverable at a glance
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

Aggregate roots expose collections via a public read-only property backed by a private `List<T>` field:

```csharp
// Domain/Orders/Order.cs
public sealed class Order : AggregateRoot<OrderId>
{
    private readonly List<OrderLine> _lines = [];

    public IReadOnlyList<OrderLine> Lines => _lines.AsReadOnly();
}
```

EF Core discovers **both** the backing field and the public property. Using the string-based `HasMany<OrderLine>("_lines")` API when a public property also exists causes a conflict at startup:
> "The member 'Order._lines' cannot use field '_lines' because it is already used by 'Order.Lines'."

The correct configuration uses the lambda overload, then overrides the field via `HasField`:

```csharp
// DO: reference the public property; tell EF Core to use the backing field for access
internal sealed class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        builder.ToTable("orders");
        builder.HasKey(o => o.Id);

        builder.Property(o => o.Id)
            .HasConversion(id => id.Value, value => new OrderId(value));

        builder.HasMany(o => o.Lines)
            .WithOne()
            .HasForeignKey(l => l.OrderId)
            .IsRequired();

        builder.Navigation(o => o.Lines)
            .HasField("_lines")
            .UsePropertyAccessMode(PropertyAccessMode.Field);
    }
}
```

```csharp
// DON'T: string-based HasMany on a field that is also exposed as a public property
builder.HasMany<OrderLine>("_lines").WithOne(); // throws at startup
builder.Navigation("_lines").UsePropertyAccessMode(PropertyAccessMode.Field);
```

### Composite Keys

`HasKey` always takes CLR property names or lambda expressions, never column names. Passing the configured column name (e.g., `"order_id"`) instead of the property name (e.g., `"OrderId"`) causes EF Core to attempt creating a new shadow property and fail.

```csharp
// DO: CLR property names or lambda
builder.HasKey(pt => new { pt.OrderId, pt.LineId });
// or
builder.HasKey("OrderId", "LineId");

// DON'T: column names are not property names
builder.HasKey("order_id", "line_id"); // fails — no such CLR properties
```

### Indexes on Owned Entity Properties

When an owned entity's column needs a unique index, declare it **inside** the `OwnsOne` configuration block. Calling `HasIndex("Name_Value")` on the owning entity after the fact fails because EF Core does not expose shadow navigation properties on the owner.

```csharp
// DO: index inside the OwnsOne block
builder.OwnsOne(t => t.Name, b =>
{
    b.Property(n => n.Value).HasColumnName("name").HasMaxLength(50).IsRequired();
    b.HasIndex(n => n.Value).IsUnique().HasDatabaseName("uq_tags_name");
});

// DON'T: index on a shadow property name outside OwnsOne
builder.HasIndex("Name_Value").IsUnique(); // fails — property not found on the owner
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

## `IDatabaseContext` Implementation and Domain Event Dispatch

`AppDbContext` implements `IDatabaseContext` from `Application.Read.Contracts` and dispatches domain events from `SaveChangesAsync`. Add one `IQueryable<T>` property per aggregate.

When the context needs to dispatch domain events, inject `IEventPublisher` (the preferred alias for `IEventMediator`) and publish each event after saving. Because LiteBus publishes any `notnull` object as an event, no cast or interface constraint is needed beyond what your collection type provides:

```csharp
// Infrastructure/Persistence/AppDbContext.cs
internal sealed class AppDbContext : DbContext, IDatabaseContext
{
    private readonly IEventPublisher _eventPublisher;

    public AppDbContext(DbContextOptions<AppDbContext> options, IEventPublisher eventPublisher)
        : base(options)
    {
        _eventPublisher = eventPublisher;
    }

    // DbSet properties satisfy both EF Core tracking and IDatabaseContext
    public DbSet<Post> Posts => Set<Post>();
    public DbSet<Author> Authors => Set<Author>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }

    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        // Collect events before saving so they reflect the pre-save state.
        var domainEvents = ChangeTracker.Entries<IAggregateRoot>()
            .SelectMany(e => e.Entity.GetDomainEvents())
            .ToList();

        // Clear before saving to avoid re-dispatching on retry.
        foreach (var entry in ChangeTracker.Entries<IAggregateRoot>())
        {
            entry.Entity.ClearDomainEvents();
        }

        var result = await base.SaveChangesAsync(cancellationToken);

        foreach (var domainEvent in domainEvents)
        {
            // LiteBus publishes any notnull object. No cast needed.
            await _eventPublisher.PublishAsync(
                domainEvent,
                cancellationToken: cancellationToken);
        }

        return result;
    }
}
```

> **When there is no event dispatch.** If the project has no domain events yet, omit the `IEventPublisher` constructor parameter and the dispatch loop. Add it only when the first domain event handler is wired up.

> **No handler registered.** By default LiteBus silently ignores events with no registered handlers. No exception is thrown and no configuration is required to suppress it. If you want to detect unhandled events (for example, to log them), register an open-generic event handler: `IEventHandler<IDomainEvent>` will catch every domain event that no specific handler claimed. See the LiteBus docs for the current event-settings API.

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
        object? commandResult,
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

In `Program.cs`, call `AddInfrastructure` and register LiteBus. Each module type (`AddCommandModule`, `AddQueryModule`, `AddEventModule`) is called **once** per `AddLiteBus` invocation. All assemblies for a given module type are registered inside that single call.

### Assembly Marker Classes

LiteBus registers handlers by scanning assemblies. Handler classes are `internal sealed`, so they cannot be referenced by name from `WebApi`. Each implementation project must expose a public marker class so `WebApi` can reference the assembly without depending on internal types:

```csharp
// Application.Write/ApplicationWriteAssemblyMarker.cs
public static class ApplicationWriteAssemblyMarker { }

// Application.Read/ApplicationReadAssemblyMarker.cs
public static class ApplicationReadAssemblyMarker { }

// Application.Reactions/ApplicationReactionsAssemblyMarker.cs
public static class ApplicationReactionsAssemblyMarker { }

// Infrastructure/InfrastructureAssemblyMarker.cs
public static class InfrastructureAssemblyMarker { }
```

### LiteBus Registration

```csharp
// WebApi/Program.cs (LiteBus registration excerpt)
builder.Services.AddInfrastructure(builder.Configuration);

builder.Services.AddLiteBus(liteBus =>
{
    // All command-side assemblies in one AddCommandModule call.
    // Application.Write: handlers and validators.
    // Infrastructure: transaction pre/post/error pipeline behaviors.
    liteBus.AddCommandModule(module =>
    {
        module.RegisterFromAssembly(typeof(ApplicationWriteAssemblyMarker).Assembly);
        module.RegisterFromAssembly(typeof(InfrastructureAssemblyMarker).Assembly);
    });

    // Query handlers and validators.
    liteBus.AddQueryModule(module =>
    {
        module.RegisterFromAssembly(typeof(ApplicationReadAssemblyMarker).Assembly);
    });

    // Event handlers.
    liteBus.AddEventModule(module =>
    {
        module.RegisterFromAssembly(typeof(ApplicationReactionsAssemblyMarker).Assembly);
    });
});
```

`RegisterFromAssembly` discovers open generic handlers automatically — no separate `module.Register(typeof(MyHandler<>))` call is needed unless the handler lives in a different assembly from what is being scanned.

> **Note on required namespaces.** `AddCommandModule`, `AddQueryModule`, and `AddEventModule` are extension methods from separate packages. Each requires both its NuGet package and its `using` directive:
> - `using LiteBus.Commands;` — from `LiteBus.Commands.Extensions.Microsoft.DependencyInjection`
> - `using LiteBus.Queries;` — from `LiteBus.Queries.Extensions.Microsoft.DependencyInjection`
> - `using LiteBus.Events;` — from `LiteBus.Events.Extensions.Microsoft.DependencyInjection`

---

## Design-Time DbContext Factory

When `AppDbContext` has constructor parameters beyond `DbContextOptions<T>` (for example, `IEventPublisher` for domain event dispatch), the EF Core tooling cannot construct it automatically at design time. Without a factory, `dotnet ef migrations add` fails with a "no parameterless constructor" error.

Add an `IDesignTimeDbContextFactory<AppDbContext>` implementation in the Infrastructure project:

```csharp
// Infrastructure/Persistence/AppDbContextFactory.cs
internal sealed class AppDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
{
    public AppDbContext CreateDbContext(string[] args)
    {
        // Read connection string from environment variable or fall back to a local default.
        // Never hard-code production credentials here.
        var connectionString =
            Environment.GetEnvironmentVariable("ConnectionStrings__Database")
            ?? "Host=localhost;Port=5432;Database=myapp;Username=myapp;Password=myapp";

        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseNpgsql(connectionString)
            .Options;

        // Pass a no-op IEventPublisher so the factory can construct the context
        // without requiring a running DI container.
        return new AppDbContext(options, new NoOpEventPublisher());
    }
}
```

```csharp
// Infrastructure/Persistence/NoOpEventPublisher.cs
internal sealed class NoOpEventPublisher : IEventPublisher
{
    public Task PublishAsync(IEvent @event, EventMediationSettings? settings = null, CancellationToken cancellationToken = default)
        => Task.CompletedTask;

    Task IEventPublisher.PublishAsync<TEvent>(TEvent @event, EventMediationSettings? settings = null, CancellationToken cancellationToken = default)
        => Task.CompletedTask;
}
```

`IDesignTimeDbContextFactory<T>` is discovered automatically by `dotnet ef` tools when the class is in the same assembly as the DbContext. No DI registration is needed.

> **Note:** `IEventPublisher` is the preferred alias for `IEventMediator`. The `where TEvent : notnull` constraint on the generic overload requires an explicit interface implementation when the stub returns `Task.CompletedTask` without the type constraint. See LiteBus docs for the current interface definition.

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
