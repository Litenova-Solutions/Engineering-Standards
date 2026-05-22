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

```csharp
// Infrastructure/Reliability/Idempotency/IdempotencyService.cs
internal sealed class IdempotencyService
{
    private static readonly TimeSpan DefaultTtl = TimeSpan.FromHours(24);

    private readonly AppDbContext _context;
    private readonly TimeProvider _timeProvider;
    private readonly ILogger<IdempotencyService> _logger;

    public IdempotencyService(
        AppDbContext context,
        TimeProvider timeProvider,
        ILogger<IdempotencyService> logger)
    {
        _context = context;
        _timeProvider = timeProvider;
        _logger = logger;
    }

    public sealed record IdempotencyCheckResult(
        bool IsNew,
        IdempotencyRecord Record);

    /// <summary>
    /// Finds an existing record or creates a new Started record.
    /// Returns (IsNew: false, record) if a completed record exists — caller should replay.
    /// Returns (IsNew: false, record) if a conflicting hash exists — caller should return 409.
    /// Returns (IsNew: true, record) if this is the first time this key is seen.
    /// </summary>
    public async Task<IdempotencyCheckResult> GetOrCreateAsync(
        Guid userId,
        string key,
        string requestHash,
        CancellationToken cancellationToken)
    {
        var existing = await _context.IdempotencyRecords
            .FirstOrDefaultAsync(
                r => r.UserId == userId && r.Key == key,
                cancellationToken);

        if (existing is not null)
        {
            return new IdempotencyCheckResult(IsNew: false, existing);
        }

        var record = IdempotencyRecord.StartProcessing(
            userId, key, requestHash, _timeProvider.GetUtcNow(), DefaultTtl);

        _context.IdempotencyRecords.Add(record);

        try
        {
            await _context.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException ex) when (IsUniqueConstraintViolation(ex))
        {
            // Race condition: another request inserted the record first. Load it.
            var raceRecord = await _context.IdempotencyRecords
                .FirstAsync(r => r.UserId == userId && r.Key == key, cancellationToken);
            return new IdempotencyCheckResult(IsNew: false, raceRecord);
        }

        return new IdempotencyCheckResult(IsNew: true, record);
    }

    private static bool IsUniqueConstraintViolation(DbUpdateException ex)
        => ex.InnerException?.Message.Contains("uq_idempotency_records") == true;
}
```

---

## 6. Endpoint Integration

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

    var check = await idempotencyService.GetOrCreateAsync(
        userId, idempotencyKey, requestHash, cancellationToken);

    if (!check.IsNew)
    {
        if (check.Record.RequestHash != requestHash)
        {
            return Results.Problem(
                detail: "The Idempotency-Key was already used with a different request body.",
                statusCode: StatusCodes.Status409Conflict);
        }

        if (check.Record.Status == IdempotencyStatus.Completed)
        {
            // Replay the original response
            httpContext.Response.StatusCode = check.Record.ResponseStatusCode!.Value;
            return Results.Text(
                check.Record.ResponseBody ?? "", "application/json",
                statusCode: check.Record.ResponseStatusCode!.Value);
        }

        if (check.Record.Status == IdempotencyStatus.Started)
        {
            // In-flight concurrent request — return 409
            return Results.Problem(
                detail: "A request with this Idempotency-Key is currently being processed.",
                statusCode: StatusCodes.Status409Conflict);
        }
    }

    var command = request.ToCommand(new UserId(userId));
    var result = await commandMediator.SendAsync(command, cancellationToken);

    var response = result.ToResponse();
    var responseJson = JsonSerializer.Serialize(response);

    check.Record.Complete(StatusCodes.Status201Created, responseJson);
    await idempotencyService.SaveAsync(cancellationToken);

    return Results.Created($"/orders/{result.OrderId.Value}", response);
}
```

---

## 7. Cleanup Job

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

## 8. Registration

```csharp
// Infrastructure/DependencyInjection/InfrastructureServiceRegistration.cs
services.AddScoped<IdempotencyService>();
services.AddHostedService<CleanupIdempotencyRecordsHostedService>();
```
