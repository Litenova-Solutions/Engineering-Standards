# Observability

This document defines the observability conventions for structured logging, correlation IDs, OpenTelemetry traces and metrics, and health checks. Every production project MUST implement these conventions before going live.

> This convention implements ADR 0018.

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
| `CorrelationId` | `string` (UUID) | Incoming `X-Correlation-ID` header or generated |
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

## 2. Correlation IDs

Every HTTP request MUST carry a correlation ID. The correlation ID is propagated to all outgoing calls, log entries, and async operations initiated by that request.

### Correlation ID Middleware

Add this middleware to the pipeline before `UseSerilogRequestLogging`:

```csharp
// WebApi/Middleware/CorrelationIdMiddleware.cs
sealed class CorrelationIdMiddleware(RequestDelegate next)
{
    private const string HeaderName = "X-Correlation-ID";

    public async Task InvokeAsync(HttpContext context)
    {
        var correlationId = context.Request.Headers[HeaderName].FirstOrDefault()
            ?? Guid.NewGuid().ToString();

        context.Response.Headers[HeaderName] = correlationId;

        using (LogContext.PushProperty("CorrelationId", correlationId))
        {
            await next(context);
        }
    }
}
```

Register in `Program.cs` before `app.UseSerilogRequestLogging()`:
```csharp
app.UseMiddleware<CorrelationIdMiddleware>();
app.UseSerilogRequestLogging();
```

### Response Header

The correlation ID is always echoed back in the `X-Correlation-ID` response header. Clients can include this value when reporting issues to support.

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

Health endpoints SHOULD be excluded from high-volume request metrics when they distort dashboards.

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
