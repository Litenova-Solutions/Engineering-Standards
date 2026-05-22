# Blueprint: Outbox

This is the complete implementation blueprint for the Transactional Outbox pattern. Copy these files into `{ProjectName}.Infrastructure/Reliability/Outbox/` and adjust to the project's event and serialization requirements.

For the conceptual decision, see `docs/decisions/outbox-pattern-as-reliability-escalation.md` and `docs/conventions/backend/10-reliability.md`.

---

## 1. `OutboxMessage` Entity

```csharp
// Infrastructure/Reliability/Outbox/OutboxMessage.cs
namespace {ProjectName}.Infrastructure.Reliability.Outbox;

public sealed class OutboxMessage
{
    private OutboxMessage() { }   // EF Core materialisation constructor

    public OutboxMessageId Id { get; private set; } = default!;

    /// <summary>
    /// Stable event type name. Use the fully-qualified type name or a project-defined alias.
    /// Must not change after events are written — changes break deserialization.
    /// </summary>
    public required string EventType { get; init; }

    /// <summary>JSON-serialized event payload.</summary>
    public required string Payload { get; init; }

    public required DateTimeOffset CreatedAtUtc { get; init; }

    public DateTimeOffset? ProcessedAtUtc { get; private set; }

    public DateTimeOffset? NextAttemptAtUtc { get; private set; }

    public OutboxMessageStatus Status { get; private set; } = OutboxMessageStatus.Pending;

    public int AttemptCount { get; private set; }

    public string? LastError { get; private set; }

    public static OutboxMessage Create(
        string eventType,
        string payload,
        DateTimeOffset utcNow)
    {
        return new OutboxMessage
        {
            Id = OutboxMessageId.New(),
            EventType = eventType,
            Payload = payload,
            CreatedAtUtc = utcNow,
            NextAttemptAtUtc = utcNow
        };
    }

    public void MarkProcessed(DateTimeOffset utcNow)
    {
        Status = OutboxMessageStatus.Processed;
        ProcessedAtUtc = utcNow;
        NextAttemptAtUtc = null;
        AttemptCount++;
    }

    public void MarkFailed(string error, DateTimeOffset utcNow, int maxAttempts = 10)
    {
        AttemptCount++;
        LastError = error.Length > 2000 ? error[..2000] : error;

        if (AttemptCount >= maxAttempts)
        {
            Status = OutboxMessageStatus.DeadLettered;
            NextAttemptAtUtc = null;
            return;
        }

        Status = OutboxMessageStatus.Pending;

        // Exponential backoff: 5s, 10s, 20s, 40s, ..., capped at 15 minutes
        var delaySeconds = Math.Min(5 * Math.Pow(2, AttemptCount - 1), 900);
        NextAttemptAtUtc = utcNow.AddSeconds(delaySeconds);
    }
}
```

```csharp
// Infrastructure/Reliability/Outbox/OutboxMessageId.cs
namespace {ProjectName}.Infrastructure.Reliability.Outbox;

public readonly record struct OutboxMessageId(Guid Value)
{
    public static OutboxMessageId New() => new(Guid.CreateVersion7());
}
```

```csharp
// Infrastructure/Reliability/Outbox/OutboxMessageStatus.cs
namespace {ProjectName}.Infrastructure.Reliability.Outbox;

public enum OutboxMessageStatus
{
    Pending = 0,
    Processed = 1,
    DeadLettered = 2
}
```

---

## 2. EF Core Configuration

```csharp
// Infrastructure/Persistence/Configurations/OutboxMessageConfiguration.cs
internal sealed class OutboxMessageConfiguration : IEntityTypeConfiguration<OutboxMessage>
{
    public void Configure(EntityTypeBuilder<OutboxMessage> builder)
    {
        builder.ToTable("outbox_messages");

        builder.HasKey(m => m.Id)
            .HasName("pk_outbox_messages");

        builder.Property(m => m.Id)
            .HasColumnName("id")
            .HasConversion(id => id.Value, value => new OutboxMessageId(value));

        builder.Property(m => m.EventType)
            .HasColumnName("event_type")
            .HasMaxLength(500)
            .IsRequired();

        builder.Property(m => m.Payload)
            .HasColumnName("payload")
            .IsRequired();

        builder.Property(m => m.CreatedAtUtc)
            .HasColumnName("created_at_utc")
            .IsRequired();

        builder.Property(m => m.ProcessedAtUtc)
            .HasColumnName("processed_at_utc");

        builder.Property(m => m.NextAttemptAtUtc)
            .HasColumnName("next_attempt_at_utc");

        builder.Property(m => m.Status)
            .HasColumnName("status")
            .HasConversion<int>()
            .IsRequired();

        builder.Property(m => m.AttemptCount)
            .HasColumnName("attempt_count")
            .IsRequired();

        builder.Property(m => m.LastError)
            .HasColumnName("last_error")
            .HasMaxLength(2000);

        // Index for the dispatcher's lease query:
        // SELECT WHERE status = Pending AND next_attempt_at_utc <= now()
        builder.HasIndex(m => new { m.Status, m.NextAttemptAtUtc })
            .HasDatabaseName("ix_outbox_messages_status_next_attempt_at_utc");

        // Index for the cleanup job (processed rows older than retention)
        builder.HasIndex(m => m.ProcessedAtUtc)
            .HasDatabaseName("ix_outbox_messages_processed_at_utc");
    }
}
```

---

## 3. Writing to the Outbox

The Outbox is written in the same transaction as the aggregate change. The pipeline `SaveChangesCommandPostHandler` saves both in one commit.

```csharp
// Infrastructure/Reliability/Outbox/OutboxWriter.cs
internal sealed class OutboxWriter
{
    private readonly AppDbContext _context;
    private readonly TimeProvider _timeProvider;

    public OutboxWriter(AppDbContext context, TimeProvider timeProvider)
    {
        _context = context;
        _timeProvider = timeProvider;
    }

    public void Write<TEvent>(TEvent domainEvent) where TEvent : IDomainEvent
    {
        var eventType = domainEvent.GetType().FullName!;
        var payload = JsonSerializer.Serialize(domainEvent, domainEvent.GetType());
        var message = OutboxMessage.Create(eventType, payload, _timeProvider.GetUtcNow());
        _context.OutboxMessages.Add(message);
    }
}
```

The pipeline automatically calls `Write` for each domain event collected by the aggregate before `SaveChangesAsync` is invoked. See the `SaveChangesCommandPostHandler` in `Infrastructure/Behaviors/`.

---

## 4. Dispatcher

```csharp
// Infrastructure/Reliability/Outbox/OutboxDispatcher.cs
internal sealed class OutboxDispatcher
{
    private const int BatchSize = 20;

    private readonly AppDbContext _context;
    private readonly IEventMediator _eventMediator;
    private readonly TimeProvider _timeProvider;
    private readonly ILogger<OutboxDispatcher> _logger;

    public OutboxDispatcher(
        AppDbContext context,
        IEventMediator eventMediator,
        TimeProvider timeProvider,
        ILogger<OutboxDispatcher> logger)
    {
        _context = context;
        _eventMediator = eventMediator;
        _timeProvider = timeProvider;
        _logger = logger;
    }

    public async Task DispatchPendingAsync(CancellationToken cancellationToken)
    {
        var utcNow = _timeProvider.GetUtcNow();

        // Lease a batch of pending messages.
        // FOR UPDATE SKIP LOCKED prevents multiple instances from processing the same row.
        var messages = await _context.OutboxMessages
            .FromSqlInterpolated($"""
                SELECT *
                FROM outbox_messages
                WHERE status = 0
                  AND next_attempt_at_utc <= {utcNow}
                ORDER BY next_attempt_at_utc
                LIMIT {BatchSize}
                FOR UPDATE SKIP LOCKED
                """)
            .ToListAsync(cancellationToken);

        foreach (var message in messages)
        {
            try
            {
                var eventType = Type.GetType(message.EventType);
                if (eventType is null)
                {
                    _logger.LogError(
                        "Unknown event type {EventType} for OutboxMessage {Id}",
                        message.EventType,
                        message.Id);
                    message.MarkFailed($"Unknown event type: {message.EventType}", utcNow);
                    continue;
                }

                var domainEvent = JsonSerializer.Deserialize(message.Payload, eventType)
                    as IDomainEvent;

                if (domainEvent is null)
                {
                    message.MarkFailed("Deserialization returned null.", utcNow);
                    continue;
                }

                await _eventMediator.PublishAsync(domainEvent, cancellationToken);
                message.MarkProcessed(utcNow);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex,
                    "Failed to dispatch OutboxMessage {Id} (attempt {Attempt})",
                    message.Id,
                    message.AttemptCount + 1);
                message.MarkFailed(ex.Message, utcNow);
            }
        }

        await _context.SaveChangesAsync(cancellationToken);
    }
}
```

---

## 5. Hosted Service

```csharp
// Infrastructure/Reliability/Outbox/OutboxDispatcherHostedService.cs
internal sealed class OutboxDispatcherHostedService : BackgroundService
{
    private static readonly TimeSpan PollingInterval = TimeSpan.FromSeconds(5);

    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<OutboxDispatcherHostedService> _logger;

    public OutboxDispatcherHostedService(
        IServiceScopeFactory scopeFactory,
        ILogger<OutboxDispatcherHostedService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        _logger.LogInformation("Outbox dispatcher started.");

        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                await using var scope = _scopeFactory.CreateAsyncScope();
                var dispatcher = scope.ServiceProvider.GetRequiredService<OutboxDispatcher>();
                await dispatcher.DispatchPendingAsync(stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Outbox dispatcher encountered an error.");
            }

            await Task.Delay(PollingInterval, stoppingToken);
        }

        _logger.LogInformation("Outbox dispatcher stopped.");
    }
}
```

---

## 6. Registration

```csharp
// Infrastructure/DependencyInjection/InfrastructureServiceRegistration.cs
services.AddScoped<OutboxWriter>();
services.AddScoped<OutboxDispatcher>();
services.AddHostedService<OutboxDispatcherHostedService>();
```

---

## 7. Dead-Letter Recovery

When a message reaches `DeadLettered` status, it will not be retried automatically. Recovery is a manual operation. See `docs/runbooks/recover-outbox-message.md`.

An admin API endpoint or a background admin tool can re-queue a dead-lettered message by resetting its status to `Pending` and its `NextAttemptAtUtc` to `now`, and its `AttemptCount` to `0`.

---

## 8. Metrics

Add these metrics to the dispatcher:

```csharp
private readonly Counter<long> _processedCounter;
private readonly Counter<long> _failedCounter;
private readonly Histogram<double> _dispatchDuration;

// In constructor:
_processedCounter = meter.CreateCounter<long>(
    "outbox.messages.processed",
    description: "Number of outbox messages successfully dispatched.");
_failedCounter = meter.CreateCounter<long>(
    "outbox.messages.failed",
    description: "Number of outbox messages that failed dispatch.");
_dispatchDuration = meter.CreateHistogram<double>(
    "outbox.dispatch.duration",
    unit: "ms",
    description: "Time to dispatch a batch of outbox messages.");
```

---

## 9. Health Check

```csharp
// Infrastructure/Persistence/HealthChecks/OutboxHealthCheck.cs
internal sealed class OutboxHealthCheck : IHealthCheck
{
    private static readonly TimeSpan StalenessThreshold = TimeSpan.FromMinutes(15);

    private readonly AppDbContext _context;
    private readonly TimeProvider _timeProvider;

    public OutboxHealthCheck(AppDbContext context, TimeProvider timeProvider)
    {
        _context = context;
        _timeProvider = timeProvider;
    }

    public async Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context,
        CancellationToken cancellationToken = default)
    {
        var staleThreshold = _timeProvider.GetUtcNow() - StalenessThreshold;

        var staleCount = await _context.OutboxMessages
            .CountAsync(m =>
                m.Status == OutboxMessageStatus.Pending &&
                m.NextAttemptAtUtc < staleThreshold,
                cancellationToken);

        return staleCount > 0
            ? HealthCheckResult.Degraded(
                $"{staleCount} outbox messages have not been processed in over {StalenessThreshold.TotalMinutes} minutes.")
            : HealthCheckResult.Healthy();
    }
}
```
