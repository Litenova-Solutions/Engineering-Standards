# Background Jobs

This document defines job **implementation** patterns: interfaces, loops, scheduling, and durable job tables. It does not define **where jobs are hosted**. Hosting rules live in `docs/conventions/backend/14-worker-projects.md`.

> This convention depends on `docs/conventions/backend/10-reliability.md` for retry and idempotency rules.

---

## 1. Implementation vs. Host

| Concern | Location | Hosted in |
|:---|:---|:---|
| Job interface | `Application.Write.Contracts` or `Application.Reactions` | N/A |
| Job implementation and `BackgroundService` loop classes | `Infrastructure/BackgroundJobs/` | `{ProjectName}.Worker` for durable loops |
| DI registration for job services | `Infrastructure/DependencyInjection/` | Worker registers hosted services; WebApi registers only allow-listed request-adjacent services |
| Endpoint that enqueues work | `WebApi`, using `ICommandMediator` | WebApi |

**WebApi MUST NOT host durable background loops** (outbox dispatch, scheduled reconciliation, queue consumers). Those loops run in `{ProjectName}.Worker`.

WebApi MAY host only non-durable, request-adjacent hosted services when a project ADR documents the exception (for example, warming a local cache on startup). Default: no `BackgroundService` in WebApi.

---

## 2. Default Choice

Use ASP.NET Core `BackgroundService` for background work. A hosted service is enough for:

- Periodic reconciliation.
- Outbox dispatch.
- Cleanup of expired idempotency records.
- Polling an external provider for status changes.
- Small queues backed by PostgreSQL.

Do not add Hangfire, Quartz, MassTransit, Azure Service Bus, RabbitMQ, or another scheduler or broker without a project ADR.

---

## 3. Where Code Lives

| Concern | Location |
|:---|:---|
| Job interface used by application code | `Application.Write.Contracts` or `Application.Reactions` when needed |
| Job implementation | `Infrastructure/BackgroundJobs/` |
| Hosted service loop | `Infrastructure/BackgroundJobs/` |
| Job service registration | `Infrastructure/DependencyInjection/InfrastructureServiceRegistration.cs` |
| Hosted service registration | `{ProjectName}.Worker/Program.cs` (not WebApi for durable loops) |
| Endpoint that enqueues work | `WebApi`, using `ICommandMediator` |

Background job implementations may depend on Infrastructure services and `AppDbContext`. They MUST NOT contain domain rules. Domain rules stay in aggregates and commands.

---

## 4. Hosted Service Pattern

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

        // WaitForNextTickAsync throws OperationCanceledException on shutdown.
        // Catching it here prevents a spurious error log entry on graceful shutdown.
        while (true)
        {
            try
            {
                await timer.WaitForNextTickAsync(cancellationToken);
            }
            catch (OperationCanceledException)
            {
                // Application is shutting down. Exit cleanly.
                break;
            }

            using var scope = _scopeFactory.CreateScope();
            var dispatcher = scope.ServiceProvider
                .GetRequiredService<IOutboxDispatcher>();

            try
            {
                await dispatcher.DispatchPendingAsync(cancellationToken);
            }
            catch (Exception ex) when (ex is not OperationCanceledException)
            {
                _logger.LogError(ex, "Outbox dispatch failed. Will retry on next tick.");
                // Do not rethrow. The hosted service continues running.
            }
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

Register job services in Infrastructure. Register the hosted service in **Worker**, not WebApi:

```csharp
// Infrastructure/DependencyInjection/InfrastructureServiceRegistration.cs
services.AddScoped<IOutboxDispatcher, OutboxDispatcher>();

// Worker/Program.cs
services.AddHostedService<OutboxDispatcherHostedService>();
```

### 4.1 EF Core Change Tracker and Memory Management

Hosted services process data iteratively over long runtimes. If a background job queries and processes database records inside an iteration, EF Core's active change tracker tracks every retrieved aggregate in memory. Over hours, this causes silent memory accumulation, slowing query speeds and leading to eventual `OutOfMemoryException` crashes. Furthermore, tracked entities can trigger unintended dirty updates if properties are modified in memory and a save operation is called subsequently.

To prevent this, background jobs MUST follow these database tracking rules:

1. **Use `AsNoTracking()` for read-only checks:** Any query executed by a background service that is not modifying state MUST explicitly utilize `.AsNoTracking()` to keep the change tracker empty.
2. **Clear the Change Tracker explicitly:** For write operations that load aggregates, mutate them, and save them, engineers MUST call `dbContext.ChangeTracker.Clear()` at the end of every loop iteration to purge resolved entities from memory.
3. **Control Scope Lifespans:** Never resolve a database context or repository outside the active iteration loop. The `using` block of the resolved scope ensures that DbContext instances are garbage-collected frequently.

```csharp
// GOOD: clearing the EF Core change tracker inside the processing loop
protected override async Task ExecuteAsync(CancellationToken cancellationToken)
{
    using var timer = new PeriodicTimer(TimeSpan.FromSeconds(10));

    while (await timer.WaitForNextTickAsync(cancellationToken))
    {
        using var scope = _scopeFactory.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        // Query read-only data without tracking to save memory
        var pendingJobs = await dbContext.BackgroundJobs
            .AsNoTracking()
            .Where(j => j.Status == JobStatus.Pending)
            .Take(20)
            .ToListAsync(cancellationToken);

        foreach (var job in pendingJobs)
        {
            await ProcessJobAsync(job, dbContext, cancellationToken);
        }

        // REQUIRED: Purge the tracker to release tracked entities from memory
        dbContext.ChangeTracker.Clear();
    }
}
```

---

## 5. Scheduling Rules

Use `PeriodicTimer` for simple recurring jobs. Do not use `System.Threading.Timer` for async work.

Every job MUST:

- Accept and propagate `CancellationToken cancellationToken`.
- Finish promptly when cancellation is requested.
- Log start, completion, failure, and duration.
- Be idempotent.
- Use bounded retries only for transient failures.
- Expose health and metrics when user-visible work depends on it.

---

## 6. Durable Job Table

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

## 7. What Not To Put In Background Jobs

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

