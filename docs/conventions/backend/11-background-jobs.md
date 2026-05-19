# Background Jobs

This document defines the standard for scheduled work, queued work, and long-running background processing.

> This convention depends on `docs/conventions/backend/10-reliability.md` for retry and idempotency rules.

---

## 1. Default Choice

Use ASP.NET Core hosted services for background jobs. A hosted service is enough for:

- Periodic reconciliation.
- Outbox dispatch.
- Cleanup of expired idempotency records.
- Polling an external provider for status changes.
- Small queues backed by PostgreSQL.

Do not add Hangfire, Quartz, MassTransit, Azure Service Bus, RabbitMQ, or another scheduler or broker without a project ADR.

---

## 2. Where Code Lives

| Concern | Location |
|:---|:---|
| Job interface used by application code | `Application.Write.Contracts` or `Application.Reactions` when needed |
| Job implementation | `Infrastructure/BackgroundJobs/` |
| Hosted service loop | `Infrastructure/BackgroundJobs/` |
| Job registration | `Infrastructure/DependencyInjection/InfrastructureServiceRegistration.cs` |
| Endpoint that enqueues work | `WebApi`, using `ICommandMediator` |

Background job implementations may depend on Infrastructure services and `AppDbContext`. They MUST NOT contain domain rules. Domain rules stay in aggregates and commands.

---

## 3. Hosted Service Pattern

Hosted services are singletons. They MUST create a scope before resolving scoped services such as `AppDbContext`, repositories, or application services.

```csharp
// GOOD: hosted service creates a scope per iteration
internal sealed class OutboxDispatcherHostedService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<OutboxDispatcherHostedService> _logger;

    public OutboxDispatcherHostedService(
        IServiceScopeFactory scopeFactory,
        ILogger<OutboxDispatcherHostedService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken cancellationToken)
    {
        using var timer = new PeriodicTimer(TimeSpan.FromSeconds(5));

        while (await timer.WaitForNextTickAsync(cancellationToken))
        {
            using var scope = _scopeFactory.CreateScope();
            var dispatcher = scope.ServiceProvider
                .GetRequiredService<IOutboxDispatcher>();

            await dispatcher.DispatchPendingAsync(cancellationToken);
        }
    }
}
```

```csharp
// BAD: hosted service injects scoped AppDbContext directly
internal sealed class OutboxDispatcherHostedService : BackgroundService
{
    private readonly AppDbContext _dbContext;

    public OutboxDispatcherHostedService(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }
}
```

Register the hosted service in Infrastructure:

```csharp
services.AddScoped<IOutboxDispatcher, OutboxDispatcher>();
services.AddHostedService<OutboxDispatcherHostedService>();
```

---

## 4. Scheduling Rules

Use `PeriodicTimer` for simple recurring jobs. Do not use `System.Threading.Timer` for async work.

Every job MUST:

- Accept and propagate `CancellationToken cancellationToken`.
- Finish promptly when cancellation is requested.
- Log start, completion, failure, and duration.
- Be idempotent.
- Use bounded retries only for transient failures.
- Expose health and metrics when user-visible work depends on it.

---

## 5. Durable Job Table

When queued work must survive process restarts, store it in PostgreSQL. Do not rely on an in-memory queue for durable business work.

| Column | Purpose |
|:---|:---|
| `Id` | Unique job ID |
| `Type` | Stable job type |
| `Payload` | Serialized job payload |
| `Status` | `Pending`, `Processing`, `Completed`, `Failed`, or `DeadLettered` |
| `Attempts` | Number of processing attempts |
| `NextAttemptAtUtc` | Backoff scheduling |
| `LockedBy` | Instance that owns the lease |
| `LockedUntilUtc` | Lease expiration |
| `CreatedAtUtc` | Audit and age metrics |
| `CompletedAtUtc` | Completion timestamp |

Workers MUST claim jobs with a database-level lease so multiple app instances do not process the same job concurrently.

---

## 6. What Not To Put In Background Jobs

Background jobs MUST NOT bypass the application layer for business use cases.

```csharp
// GOOD: job dispatches a command for a business operation
await _commandMediator.SendAsync(
    new CloseExpiredTicketCommand { TicketId = ticketId },
    cancellationToken);
```

```csharp
// BAD: job changes aggregate state directly without the command path
var ticket = await _dbContext.Tickets.FindAsync(ticketId);
ticket.Close();
await _dbContext.SaveChangesAsync(cancellationToken);
```

Direct `AppDbContext` access is acceptable for job bookkeeping tables, outbox rows, idempotency records, cleanup tasks, and read-only reconciliation queries. It is not acceptable for bypassing aggregate commands.

