# Blueprint: InfrastructureServiceRegistration

Copy to `apps/api/src/{ProjectName}.Infrastructure/DependencyInjection/InfrastructureServiceRegistration.cs`. Adjust DbContext and repository registrations for your aggregates.

```csharp
public static class InfrastructureServiceRegistration
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddSingleton<IClock, SystemClock>();
        services.AddSingleton(TimeProvider.System);

        services.AddDbContext<AppDbContext>(options =>
            options
                .UseNpgsql(configuration.GetConnectionString("database"))
                .UseSnakeCaseNamingConventions());

        services.AddScoped<IDatabaseContext>(sp => sp.GetRequiredService<AppDbContext>());

        services.AddScoped<IPostRepository, PostRepository>();

        services.AddScoped<PostgreSqlHealthCheck>();

        return services;
    }
}
```

Register outbox, idempotency, and background services from `docs/blueprints/backend/outbox.md` and `docs/blueprints/backend/idempotency.md` when the project requires them.

```csharp
// GOOD: register hosted services in Infrastructure extension
services.AddHostedService<OutboxDispatcherHostedService>();
```

```csharp
// BAD: register hosted services in WebApi Program.cs
builder.Services.AddHostedService<OutboxDispatcherHostedService>();
```
