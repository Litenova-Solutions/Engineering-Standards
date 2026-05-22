# Observability

This document defines the observability conventions for structured logging, correlation IDs, OpenTelemetry traces and metrics, and health checks. Every production project MUST implement these conventions before going live.

> This convention implements `docs/decisions/opentelemetry-observability.md`.

---

## 1. Structured Logging with Serilog

All projects use Serilog with structured output. Serilog is configured in `Program.cs` and registered as the .NET logging provider.

### Required NuGet Packages

- `Serilog.AspNetCore`
- `Serilog.Sinks.Console`
- `Serilog.Enrichers.Environment`
- `Serilog.Enrichers.Thread`
- `OpenTelemetry.Extensions.Hosting`
- `OpenTelemetry.Instrumentation.AspNetCore`
- `OpenTelemetry.Instrumentation.Http`
- `OpenTelemetry.Instrumentation.Runtime`
- `OpenTelemetry.Exporter.OpenTelemetryProtocol`

### Minimum Bootstrap Configuration

```csharp
// Program.cs
builder.Host.UseSerilog((context, services, configuration) =>
    configuration
        .ReadFrom.Configuration(context.Configuration)
        .ReadFrom.Services(services)
        .Enrich.FromLogContext()
        .Enrich.WithMachineName()
        .Enrich.WithEnvironmentName()
        .WriteTo.Console(new JsonFormatter()));
```

### Standard Log Properties

Every log entry MUST carry these properties. Use `LogContext.PushProperty` in middleware to add request-scoped properties automatically.

| Property | Type | Source |
|:---|:---|:---|
| `TraceId` | `string` | `Activity.Current?.TraceId` (W3C trace context) |
| `SpanId` | `string` | `Activity.Current?.SpanId` |
| `UserId` | `string` | Authenticated user claim, if present |
| `MachineName` | `string` | Added by `WithMachineName()` enricher |
| `Environment` | `string` | Added by `WithEnvironmentName()` enricher |
| `RequestPath` | `string` | Added by Serilog ASP.NET Core middleware |
| `StatusCode` | `int` | Added by Serilog ASP.NET Core middleware |
| `Elapsed` | `double` (ms) | Added by Serilog ASP.NET Core middleware |

### What to Log

| Situation | Level | Notes |
|:---|:---|:---|
| Handled exception (400, 404, 409) | `Warning` | Include exception type and message; no stack trace |
| Unhandled exception (500) | `Error` | Include full exception with stack trace |
| Command dispatched | `Debug` | Log command type; never log command payload (may contain PII) |
| Query executed | `Debug` | Log query type and elapsed time |
| Event handler started/completed | `Debug` | Log event type and handler type |
| External service call | `Information` | Log service name, endpoint, and elapsed time |

### What NOT to Log

- Passwords, tokens, or secrets
- PII (names, emails, phone numbers) unless the project has an explicit data classification decision documented in a project ADR
- Full request and response bodies by default (use a sampling strategy for debugging)

---

## 2. Distributed Tracing (W3C Trace Context)

Use OpenTelemetry and W3C `traceparent` headers as the primary correlation mechanism. MUST NOT introduce a parallel custom `X-Correlation-ID` header for distributed tracing; it fragments traces across service boundaries (for example, between the Next.js server and the .NET API).

Serilog log enrichment reads the active trace from `Activity.Current`:

```csharp
// WebApi/Logging/TraceEnricher.cs
sealed class TraceEnricher : ILogEventEnricher
{
    public void Enrich(LogEvent logEvent, ILogEventPropertyFactory propertyFactory)
    {
        var activity = Activity.Current;
        if (activity is null)
        {
            return;
        }

        logEvent.AddPropertyIfAbsent(propertyFactory.CreateProperty("TraceId", activity.TraceId.ToString()));
        logEvent.AddPropertyIfAbsent(propertyFactory.CreateProperty("SpanId", activity.SpanId.ToString()));
    }
}
```

Register in `Program.cs`:

```csharp
builder.Host.UseSerilog((context, services, configuration) =>
    configuration
        .ReadFrom.Configuration(context.Configuration)
        .ReadFrom.Services(services)
        .Enrich.FromLogContext()
        .Enrich.With<TraceEnricher>()
        .WriteTo.Console(new JsonFormatter()));
```

OpenTelemetry HTTP instrumentation propagates `traceparent` automatically on incoming and outgoing HTTP calls. Register in Infrastructure:

```csharp
services.AddOpenTelemetry()
    .WithTracing(tracing => tracing
        .AddAspNetCoreInstrumentation()
        .AddHttpClientInstrumentation()
        .AddEntityFrameworkCoreInstrumentation());
```

Support teams MAY expose `TraceId` in ProblemDetails extensions for user-facing error reports. Do not generate a separate correlation UUID.

Command and query execution logs SHOULD include `CommandName` or `QueryName`, `TraceId`, and `DurationMs` as structured properties alongside the OpenTelemetry metrics defined in section 4.

---

## 3. OpenTelemetry

OpenTelemetry is the standard for traces and metrics. Export through OTLP by default. Vendor-specific exporters require a project ADR.

### Minimum Registration

```csharp
builder.Services.AddOpenTelemetry()
    .WithTracing(tracing =>
    {
        tracing
            .AddAspNetCoreInstrumentation()
            .AddHttpClientInstrumentation()
            .AddSource("ProjectName.Application")
            .AddOtlpExporter();
    })
    .WithMetrics(metrics =>
    {
        metrics
            .AddAspNetCoreInstrumentation()
            .AddHttpClientInstrumentation()
            .AddRuntimeInstrumentation()
            .AddMeter("ProjectName.Application")
            .AddOtlpExporter();
    });
```

Use stable, low-cardinality tags only.

```csharp
// GOOD: bounded metric tags
activity?.SetTag("command.type", command.GetType().Name);
activity?.SetTag("tenant.plan", tenant.PlanName);
```

```csharp
// BAD: unbounded tags create high-cardinality telemetry
activity?.SetTag("user.email", user.Email);
activity?.SetTag("search.text", query.SearchText);
```

### ActivitySource Definition

Define a single `ActivitySource` per application layer. The name must match the source registered in `AddSource()` in `Program.cs`.

```csharp
// Application.Write/Shared/Telemetry.cs
internal static class Telemetry
{
    /// <summary>
    /// The ActivitySource for all Application.Write spans.
    /// Name must match the source registered in AddSource() in Program.cs.
    /// </summary>
    internal static readonly ActivitySource Source =
        new("ProjectName.Application");
}
```

Example usage in a command handler (optional, for performance-sensitive paths):

```csharp
public async Task<PostId> HandleAsync(
    CreatePostCommand command,
    CancellationToken cancellationToken)
{
    using var activity = Telemetry.Source.StartActivity("CreatePost");
    activity?.SetTag("command.type", nameof(CreatePostCommand));

    var post = Post.Create(/* ... */);
    await _postRepository.AddAsync(post, cancellationToken);
    return post.Id;
}
```

### Required Custom Metrics

| Metric | Type | Tags |
|:---|:---|:---|
| `app.command.duration` | Histogram | `command.type`, `outcome` |
| `app.query.duration` | Histogram | `query.type`, `outcome` |
| `app.outbox.pending` | Gauge | none |
| `app.outbox.oldest_age_seconds` | Gauge | none |
| `app.background_job.duration` | Histogram | `job.type`, `outcome` |
| `app.cache.hit_count` | Counter | `cache.name` |
| `app.cache.miss_count` | Counter | `cache.name` |

Metrics MUST NOT include user IDs, raw tenant IDs, email addresses, route IDs, or raw cache keys as tags.

---

## 4. Health Checks

Every project MUST expose health check endpoints. Use ASP.NET Core's built-in health check infrastructure.

### Database Check

Use a project-owned `IHealthCheck` implementation for PostgreSQL. Do not add a community health-check NuGet package unless a project ADR approves it.

```csharp
// Infrastructure/HealthChecks/PostgreSqlHealthCheck.cs
internal sealed class PostgreSqlHealthCheck : IHealthCheck
{
    private readonly AppDbContext _dbContext;

    public PostgreSqlHealthCheck(AppDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<HealthCheckResult> CheckHealthAsync(
        HealthCheckContext context,
        CancellationToken cancellationToken = default)
    {
        try
        {
            await _dbContext.Database.ExecuteSqlRawAsync("SELECT 1", cancellationToken);
            return HealthCheckResult.Healthy();
        }
        catch (Exception ex)
        {
            return HealthCheckResult.Unhealthy(
                "PostgreSQL connectivity check failed.",
                ex);
        }
    }
}
```

Register in `InfrastructureServiceRegistration`:

```csharp
services.AddScoped<PostgreSqlHealthCheck>();
```

### Registration

```csharp
builder.Services.AddHealthChecks()
    .AddCheck<PostgreSqlHealthCheck>(
        "postgresql",
        tags: ["ready"]);
```

### Endpoints

Map two endpoints. Do NOT require authorization on either.

```csharp
app.MapHealthChecks("/health/live", new HealthCheckOptions
{
    Predicate = _ => false  // Liveness: the process is running
});

app.MapHealthChecks("/health/ready", new HealthCheckOptions
{
    Predicate = check => check.Tags.Contains("ready")  // Readiness: dependencies are available
});
```

| Endpoint | Purpose | Checks |
|:---|:---|:---|
| `/health/live` | Is the process alive? | None (always 200 if running) |
| `/health/ready` | Can the process serve traffic? | PostgreSQL connectivity |

Health endpoints MUST be excluded from high-volume request metrics when they distort dashboards.

---

## 5. Alert Baseline

Every production project MUST define alerts for:

- HTTP 5xx rate above the project threshold.
- p95 HTTP request duration above the project threshold.
- Readiness health check failure.
- Outbox oldest message age above the project threshold.
- Background job dead-letter count above zero.
- Database connection failures.

Project-specific thresholds live in the project repository because they depend on product usage and hosting costs.
