# Infrastructure Layer

This document is the authoritative guide for all design decisions in the Infrastructure layer of a Litenova Solutions project. Read it in full before writing or modifying any infrastructure code.

---

## Guiding Philosophy

The Infrastructure layer adapts external systems — databases, file storage, email providers, payment gateways — to the interfaces defined by the Domain and Application layers. It contains no business logic. If you find yourself writing a business rule here, it belongs in the Domain layer. If you find yourself writing a use-case orchestration, it belongs in the Application layer.

The Infrastructure layer is allowed to be messy in the sense that it deals with the real world: impedance mismatches between the domain model and the relational schema, retry logic for network calls, and O/RM quirks. None of that messiness should leak into the layers it serves.

---

## Folder Structure

```
src/{ProjectName}.Infrastructure/
├── GlobalUsings.cs
├── Persistence/
│   ├── {ProjectName}DbContext.cs
│   ├── Configurations/
│   │   ├── PostConfiguration.cs
│   │   ├── OrderConfiguration.cs
│   │   └── CustomerConfiguration.cs
│   ├── Repositories/
│   │   ├── PostRepository.cs
│   │   ├── OrderRepository.cs
│   │   └── CustomerRepository.cs
│   ├── ReadStores/
│   │   ├── PostReadStore.cs
│   │   └── OrderReadStore.cs
│   └── Migrations/
│       └── (EF Core generated files — never edit manually)
├── ExternalServices/
│   └── {ServiceName}/
│       └── {ServiceName}Client.cs
└── DependencyInjection/
    └── InfrastructureServiceRegistration.cs
```

---

## EF Core Conventions

### Configuration Classes

Every aggregate MUST have a dedicated `IEntityTypeConfiguration<T>` class. Never put fluent API calls inline in `OnModelCreating`.

```csharp
// GOOD:
sealed class PostConfiguration : IEntityTypeConfiguration<Post>
{
    public void Configure(EntityTypeBuilder<Post> builder)
    {
        builder.ToTable("Posts");
        builder.HasKey(p => p.Id);
        // ...
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

Strongly-typed IDs (e.g., `PostId`, `OrderId`) require value converters so EF Core can map them to and from `Guid` columns.

```csharp
sealed class PostConfiguration : IEntityTypeConfiguration<Post>
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

### Private Backing Fields for Collections

Aggregate collections use private `List<T>` backing fields. EF Core must be configured to use those fields, not auto-generated shadow properties.

```csharp
sealed class OrderConfiguration : IEntityTypeConfiguration<Order>
{
    public void Configure(EntityTypeBuilder<Order> builder)
    {
        builder.ToTable("Orders");
        builder.HasKey(o => o.Id);

        builder.Property(o => o.Id)
            .HasConversion(id => id.Value, value => new OrderId(value));

        // Map the private backing field for the Lines collection
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

Repository implementations resolve the domain interface defined in the Domain layer. They use EF Core for persistence and throw `AggregateNotFoundException` subclasses when an aggregate cannot be found.

```csharp
sealed class PostRepository(AppDbContext dbContext) : IPostRepository
{
    /// <summary>
    /// Retrieves a post by its ID.
    /// </summary>
    /// <exception cref="PostNotFoundException">Thrown when no post exists with the given ID.</exception>
    public async Task<Post> GetByIdAsync(PostId id, CancellationToken cancellationToken)
    {
        var post = await dbContext.Posts
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);

        if (post is null)
        {
            throw new PostNotFoundException(id);
        }

        return post;
    }

    public async Task AddAsync(Post post, CancellationToken cancellationToken)
    {
        await dbContext.Posts.AddAsync(post, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task UpdateAsync(Post post, CancellationToken cancellationToken)
    {
        dbContext.Posts.Update(post);
        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
```

The repository does not contain business logic. It does not validate whether the operation is allowed. It persists what it is given.

---

## Read Store Implementation Pattern

Read store implementations resolve the read store interface defined in the Application layer. They use EF Core `Select` projections. They never load the full aggregate.

```csharp
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
```

**Why no `AsNoTracking()`?** When EF Core evaluates a `Select` projection, the result type is not an entity — it is a new record or anonymous object. EF Core does not track projected types. Adding `AsNoTracking()` is redundant and adds noise.

---

## Dependency Injection Registration

All Infrastructure registrations are in a single extension method. `Program.cs` calls this method, keeping the WebApi project free of Infrastructure knowledge.

```csharp
static class InfrastructureServiceRegistration
{
    internal static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddDbContext<AppDbContext>(options =>
            options.UseNpgsql(configuration.GetConnectionString("Database")));

        // Repositories
        services.AddScoped<IPostRepository, PostRepository>();
        services.AddScoped<IOrderRepository, OrderRepository>();
        services.AddScoped<ICustomerRepository, CustomerRepository>();

        // Read stores
        services.AddScoped<IPostReadStore, PostReadStore>();
        services.AddScoped<IOrderReadStore, OrderReadStore>();

        // External services
        services.AddHttpClient<IEmailClient, EmailClient>(client =>
        {
            client.BaseAddress = new Uri(configuration["Email:BaseUrl"]!);
        });

        return services;
    }
}
```

In `Program.cs`:

```csharp
builder.Services.AddInfrastructure(builder.Configuration);
```

---

## Migration Policy

Migrations are generated by running the EF Core tools against the Infrastructure project. The startup project is WebApi (because it contains the DI configuration).

```bash
dotnet ef migrations add {MigrationName} \
  --project src/{ProjectName}.Infrastructure \
  --startup-project src/{ProjectName}.WebApi
```

**Naming convention:** `{YYYYMMdd}_{PascalCaseDescription}`

Examples:
- `20240315_CreatePostsTable`
- `20240401_AddPublishedAtToPost`
- `20240520_CreateOrdersAndOrderLinesTable`

**Never edit a migration file after it has been applied to any environment.** If a migration has a mistake and has already been applied to staging or production, create a new corrective migration. Do not modify the existing one.

---

## Project-Specific Configuration

> **Note:** This section is filled in per-project. It covers the specific configuration keys, connection strings, and external service details for this project.

When filling in this section, include:

- **Connection string keys** as they appear in `appsettings.json` and their corresponding environment variable names
- **External service base URLs** and where their configuration lives
- **Any feature flags** specific to the infrastructure layer
- **Cloud resource names** (storage account names, queue names, etc.) used by external service clients
- **Secrets management approach** for this project (Azure Key Vault, AWS Secrets Manager, environment variables, etc.)
