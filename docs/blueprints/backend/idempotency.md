# Blueprint: Idempotency

This is the complete implementation blueprint for idempotency key enforcement. Copy these files into `{ProjectName}.Infrastructure/Reliability/Idempotency/` and adjust to the project's requirements.

For the conceptual rules, see `docs/conventions/backend/10-reliability.md`.

---

## Key Rules

- `Idempotency-Key` MUST be 16 to 128 characters.
- It MUST contain only ASCII letters, digits, underscore, hyphen, colon, or period.
- Keys are scoped per authenticated user. Two users may use the same key for different operations.
- A key reused with a different request hash (different body) MUST return HTTP 409.
- Records expire after 24 hours by default; a cleanup job hard-deletes expired records.
- **Single transaction rule:** The idempotency record (`Started` and `Completed`), the aggregate change, and domain events MUST commit in one `SaveChangesAsync` call inside `SaveChangesCommandPostHandler`. MUST NOT call `SaveChangesAsync` in the endpoint or in `IdempotencyService`.

---

## 1. `IdempotencyRecord` Entity

```csharp
// Infrastructure/Reliability/Idempotency/IdempotencyRecord.cs
namespace {ProjectName}.Infrastructure.Reliability.Idempotency;

public sealed class IdempotencyRecord
{
    private IdempotencyRecord() { }   // EF Core

    public IdempotencyRecordId Id { get; private set; } = default!;

    /// <summary>Authenticated user ID — scopes the key.</summary>
    public required Guid UserId { get; init; }

    /// <summary>
    /// The client-provided idempotency key.
    /// 16–128 characters: ASCII letters, digits, _, -, :, or .
    /// </summary>
    public required string Key { get; init; }

    /// <summary>
    /// SHA-256 of the normalized request: method + path + sorted body JSON.
    /// A different hash for the same key returns 409.
    /// </summary>
    public required string RequestHash { get; init; }

    public required IdempotencyStatus Status { get; private set; }

    public int? ResponseStatusCode { get; private set; }

    /// <summary>JSON-serialized response body for replay.</summary>
    public string? ResponseBody { get; private set; }

    public required DateTimeOffset CreatedAtUtc { get; init; }

    public required DateTimeOffset ExpiresAtUtc { get; init; }

    public static IdempotencyRecord StartProcessing(
        Guid userId,
        string key,
        string requestHash,
        DateTimeOffset utcNow,
        TimeSpan ttl)
    {
        return new IdempotencyRecord
        {
            Id = IdempotencyRecordId.New(),
            UserId = userId,
            Key = key,
            RequestHash = requestHash,
            Status = IdempotencyStatus.Started,
            CreatedAtUtc = utcNow,
            ExpiresAtUtc = utcNow.Add(ttl)
        };
    }

    public void Complete(int statusCode, string? responseBody)
    {
        Status = IdempotencyStatus.Completed;
        ResponseStatusCode = statusCode;
        ResponseBody = responseBody;
    }

    public void Fail()
    {
        Status = IdempotencyStatus.Failed;
    }
}
```

```csharp
// Infrastructure/Reliability/Idempotency/IdempotencyRecordId.cs
public readonly record struct IdempotencyRecordId(Guid Value)
{
    public static IdempotencyRecordId New() => new(Guid.CreateVersion7());
}
```

```csharp
// Infrastructure/Reliability/Idempotency/IdempotencyStatus.cs
public enum IdempotencyStatus
{
    Started   = 0,
    Completed = 1,
    Failed    = 2
}
```

---

## 2. EF Core Configuration

```csharp
// Infrastructure/Persistence/Configurations/IdempotencyRecordConfiguration.cs
internal sealed class IdempotencyRecordConfiguration : IEntityTypeConfiguration<IdempotencyRecord>
{
    public void Configure(EntityTypeBuilder<IdempotencyRecord> builder)
    {
        builder.ToTable("idempotency_records");

        builder.HasKey(r => r.Id)
            .HasName("pk_idempotency_records");

        builder.Property(r => r.Id)
            .HasColumnName("id")
            .HasConversion(id => id.Value, value => new IdempotencyRecordId(value));

        builder.Property(r => r.UserId)
            .HasColumnName("user_id")
            .IsRequired();

        builder.Property(r => r.Key)
            .HasColumnName("key")
            .HasMaxLength(128)
            .IsRequired();

        builder.Property(r => r.RequestHash)
            .HasColumnName("request_hash")
            .HasMaxLength(64)     // SHA-256 hex = 64 chars
            .IsRequired();

        builder.Property(r => r.Status)
            .HasColumnName("status")
            .HasConversion<int>()
            .IsRequired();

        builder.Property(r => r.ResponseStatusCode)
            .HasColumnName("response_status_code");

        builder.Property(r => r.ResponseBody)
            .HasColumnName("response_body");

        builder.Property(r => r.CreatedAtUtc)
            .HasColumnName("created_at_utc")
            .IsRequired();

        builder.Property(r => r.ExpiresAtUtc)
            .HasColumnName("expires_at_utc")
            .IsRequired();

        // Uniqueness: one key per user (not per key string globally).
        // Partial index excludes expired records so the same key can be reused after TTL.
        builder.HasIndex(r => new { r.UserId, r.Key })
            .IsUnique()
            .HasFilter("expires_at_utc > now()")
            .HasDatabaseName("uq_idempotency_records_user_id_key_active");

        // For the cleanup job
        builder.HasIndex(r => r.ExpiresAtUtc)
            .HasDatabaseName("ix_idempotency_records_expires_at_utc");
    }
}
```

---

## 3. Key Validation

```csharp
// Infrastructure/Reliability/Idempotency/IdempotencyKeyValidator.cs
internal static class IdempotencyKeyValidator
{
    // ASCII letters, digits, _, -, :, .
    private static readonly Regex AllowedPattern =
        new(@"^[A-Za-z0-9_\-:.]{16,128}$", RegexOptions.Compiled);

    public static bool IsValid(string key) => AllowedPattern.IsMatch(key);
}
```

---

## 4. Request Hash Calculation

The request hash ties the idempotency key to a specific request body. A retry of the same operation sends the same hash. A different operation sent with the same key returns 409.

```csharp
// Infrastructure/Reliability/Idempotency/IdempotencyRequestHasher.cs
internal static class IdempotencyRequestHasher
{
    public static string Compute(string httpMethod, string path, string? bodyJson)
    {
        var normalized = $"{httpMethod.ToUpperInvariant()}:{path}:{bodyJson ?? ""}";
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(normalized));
        return Convert.ToHexString(bytes).ToLowerInvariant();
    }
}
```

---

## 5. Idempotency Service

The service stages records on the EF Core `ChangeTracker` only. It MUST NOT call `SaveChangesAsync`. Persistence happens in `SaveChangesCommandPostHandler` in the same transaction as the aggregate change.

```csharp
// Infrastructure/Reliability/Idempotency/IdempotencyService.cs
internal sealed class IdempotencyService
{
    private static readonly TimeSpan DefaultTtl = TimeSpan.FromHours(24);

    private readonly AppDbContext _context;
    private readonly TimeProvider _timeProvider;

    public IdempotencyService(AppDbContext context, TimeProvider timeProvider)
    {
        _context = context;
        _timeProvider = timeProvider;
    }

    public sealed record IdempotencyCheckResult(
        IdempotencyCheckOutcome Outcome,
        IdempotencyRecord? Record);

    public enum IdempotencyCheckOutcome
    {
        New,
        Replay,
        InProgress,
        HashConflict
    }

    /// <summary>
    /// Read-only check for completed or conflicting records. Used by the endpoint
    /// before dispatching the command (no transaction opened yet).
    /// </summary>
    public async Task<IdempotencyCheckResult> CheckExistingAsync(
        Guid userId,
        string key,
        string requestHash,
        CancellationToken cancellationToken)
    {
        var existing = await _context.IdempotencyRecords
            .AsNoTracking()
            .FirstOrDefaultAsync(
                r => r.UserId == userId && r.Key == key,
                cancellationToken);

        if (existing is null)
        {
            return new IdempotencyCheckResult(IdempotencyCheckOutcome.New, null);
        }

        if (existing.RequestHash != requestHash)
        {
            return new IdempotencyCheckResult(IdempotencyCheckOutcome.HashConflict, existing);
        }

        if (existing.Status == IdempotencyStatus.Completed)
        {
            return new IdempotencyCheckResult(IdempotencyCheckOutcome.Replay, existing);
        }

        if (existing.Status == IdempotencyStatus.Started)
        {
            return new IdempotencyCheckResult(IdempotencyCheckOutcome.InProgress, existing);
        }

        return new IdempotencyCheckResult(IdempotencyCheckOutcome.New, null);
    }

    /// <summary>
    /// Stages a new Started record on the ChangeTracker. Does not save.
    /// Called from IdempotencyCommandPreHandler inside the open command transaction.
    /// </summary>
    public IdempotencyRecord StageNewRecord(
        Guid userId,
        string key,
        string requestHash)
    {
        var record = IdempotencyRecord.StartProcessing(
            userId,
            key,
            requestHash,
            _timeProvider.GetUtcNow(),
            DefaultTtl);

        _context.IdempotencyRecords.Add(record);
        return record;
    }

    /// <summary>
    /// Marks a tracked record Completed. Does not save.
    /// Called from SaveChangesCommandPostHandler after the handler returns.
    /// </summary>
    public void MarkCompleted(IdempotencyRecord record, int statusCode, string? responseBody)
    {
        record.Complete(statusCode, responseBody);
    }
}
```

---

## 6. Pipeline Behaviors

Idempotency integrates with the command pipeline so the Started record, domain mutation, and Completed record share one transaction.

```csharp
// Infrastructure/Behaviors/IdempotencyCommandPreHandler.cs
[HandlerPriority(8)]
internal sealed class IdempotencyCommandPreHandler
    : ICommandPreHandler<IIdempotentCommand>
{
    private readonly IdempotencyService _idempotencyService;

    public IdempotencyCommandPreHandler(IdempotencyService idempotencyService)
    {
        _idempotencyService = idempotencyService;
    }

    public Task PreHandleAsync(
        IIdempotentCommand command,
        CancellationToken cancellationToken)
    {
        _idempotencyService.StageNewRecord(
            command.UserId.Value,
            command.IdempotencyKey,
            command.RequestHash);

        return Task.CompletedTask;
    }
}
```

Commands that support idempotency implement `IIdempotentCommand` in `Application.Write.Contracts`:

```csharp
public interface IIdempotentCommand : ICommand
{
    UserId UserId { get; }
    string IdempotencyKey { get; }
    string RequestHash { get; }
}
```

`SaveChangesCommandPostHandler` marks the idempotency record `Completed` before calling `SaveChangesAsync`:

```csharp
// Inside SaveChangesCommandPostHandler.PostHandleAsync (excerpt)
if (command is IIdempotentCommand idempotent && result is not null)
{
    var record = _dbContext.IdempotencyRecords.Local
        .Single(r => r.Key == idempotent.IdempotencyKey && r.UserId == idempotent.UserId.Value);

    var responseJson = JsonSerializer.Serialize(result);
    _idempotencyService.MarkCompleted(record, StatusCodes.Status201Created, responseJson);
}

await _dbContext.SaveChangesAsync(cancellationToken);
await _dbContext.Database.CommitTransactionAsync(cancellationToken);
```

If the process crashes after commit, the record is `Completed` and replays correctly. If it crashes before commit, the transaction rolls back and no `Started` record persists.

---

## 7. Endpoint Integration

The endpoint performs a read-only check before dispatching the command. It MUST NOT call `SaveChangesAsync`.

```csharp
// Endpoint using idempotency
private static async Task<IResult> HandleAsync(
    CreateOrderRequest request,
    [FromHeader(Name = "Idempotency-Key")] string? idempotencyKey,
    HttpContext httpContext,
    ICommandMediator commandMediator,
    IdempotencyService idempotencyService,
    CancellationToken cancellationToken)
{
    if (string.IsNullOrEmpty(idempotencyKey))
    {
        return Results.Problem(
            detail: "The Idempotency-Key header is required for this endpoint.",
            statusCode: StatusCodes.Status400BadRequest);
    }

    if (!IdempotencyKeyValidator.IsValid(idempotencyKey))
    {
        return Results.Problem(
            detail: "Idempotency-Key must be 16–128 characters containing only " +
                    "ASCII letters, digits, _, -, :, or .",
            statusCode: StatusCodes.Status400BadRequest);
    }

    var userId = httpContext.User.GetUserId().Value;
    var body = await new StreamReader(httpContext.Request.Body).ReadToEndAsync(cancellationToken);
    var requestHash = IdempotencyRequestHasher.Compute("POST", "/orders", body);

    var check = await idempotencyService.CheckExistingAsync(
        userId, idempotencyKey, requestHash, cancellationToken);

    switch (check.Outcome)
    {
        case IdempotencyService.IdempotencyCheckOutcome.HashConflict:
            return Results.Problem(
                detail: "The Idempotency-Key was already used with a different request body.",
                statusCode: StatusCodes.Status409Conflict);

        case IdempotencyService.IdempotencyCheckOutcome.Replay:
            return Results.Text(
                check.Record!.ResponseBody ?? "",
                "application/json",
                statusCode: check.Record.ResponseStatusCode!.Value);

        case IdempotencyService.IdempotencyCheckOutcome.InProgress:
            return Results.Problem(
                detail: "A request with this Idempotency-Key is currently being processed.",
                statusCode: StatusCodes.Status409Conflict);
    }

    var command = request.ToCommand(userId, idempotencyKey, requestHash);
    var result = await commandMediator.SendAsync(command, cancellationToken);

    return Results.Created($"/orders/{result.OrderId.Value}", result.ToResponse());
}
```

---

## 8. Cleanup Job

```csharp
// Infrastructure/Reliability/Idempotency/CleanupIdempotencyRecordsHostedService.cs
internal sealed class CleanupIdempotencyRecordsHostedService : BackgroundService
{
    private static readonly TimeSpan CleanupInterval = TimeSpan.FromHours(1);

    private readonly IServiceScopeFactory _scopeFactory;
    private readonly ILogger<CleanupIdempotencyRecordsHostedService> _logger;

    public CleanupIdempotencyRecordsHostedService(
        IServiceScopeFactory scopeFactory,
        ILogger<CleanupIdempotencyRecordsHostedService> logger)
    {
        _scopeFactory = scopeFactory;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            await Task.Delay(CleanupInterval, stoppingToken);

            try
            {
                await using var scope = _scopeFactory.CreateAsyncScope();
                var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                var timeProvider = scope.ServiceProvider.GetRequiredService<TimeProvider>();

                var deleted = await context.IdempotencyRecords
                    .Where(r => r.ExpiresAtUtc < timeProvider.GetUtcNow())
                    .ExecuteDeleteAsync(stoppingToken);

                if (deleted > 0)
                {
                    _logger.LogInformation(
                        "Cleaned up {Count} expired idempotency records.", deleted);
                }
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Idempotency cleanup job failed.");
            }
        }
    }
}
```

---

## 9. Registration

```csharp
// Infrastructure/DependencyInjection/InfrastructureServiceRegistration.cs
services.AddScoped<IdempotencyService>();
services.AddHostedService<CleanupIdempotencyRecordsHostedService>();
```
