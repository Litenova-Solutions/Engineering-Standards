# Blueprint: Program.cs

This is the **only** authoritative `Program.cs` for `{ProjectName}.WebApi`. Copy it, replace `{ProjectName}`, and copy supporting files from the sections below. Other convention files MUST reference this blueprint instead of duplicating registration blocks.

---

## Complete Program.cs

```csharp
using System.Threading.RateLimiting;
using LiteBus.Commands;
using LiteBus.Events;
using LiteBus.Extensions.Microsoft.DependencyInjection;
using LiteBus.Queries;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.Extensions.Options;
using Serilog;
using Serilog.Formatting.Json;
using {ProjectName}.Application.Read;
using {ProjectName}.Application.Reactions;
using {ProjectName}.Application.Write;
using {ProjectName}.Infrastructure;
using {ProjectName}.Infrastructure.DependencyInjection;
using {ProjectName}.Infrastructure.HealthChecks;
using {ProjectName}.WebApi.Auth;
using {ProjectName}.WebApi.Extensions;
using {ProjectName}.WebApi.Middleware;
using {ProjectName}.WebApi.Options;

var builder = WebApplication.CreateBuilder(args);

builder.AddServiceDefaults();

builder.Host.UseSerilog((context, services, configuration) =>
    configuration
        .ReadFrom.Configuration(context.Configuration)
        .ReadFrom.Services(services)
        .Enrich.FromLogContext()
        .Enrich.WithMachineName()
        .Enrich.WithEnvironmentName()
        .WriteTo.Console(new JsonFormatter()));

builder.Services
    .AddOptions<JwtSettings>()
    .BindConfiguration(JwtSettings.SectionName)
    .ValidateDataAnnotations()
    .ValidateOnStart();

builder.Services
    .AddOptions<CorsOptions>()
    .BindConfiguration(CorsOptions.SectionName)
    .ValidateDataAnnotations()
    .ValidateOnStart();

builder.Services
    .AddOptions<RateLimitOptions>()
    .BindConfiguration(RateLimitOptions.SectionName)
    .ValidateDataAnnotations()
    .ValidateOnStart();

builder.Services.ConfigureOptions<JwtBearerOptionsSetup>();

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer();

builder.Services.AddAuthorization(options =>
{
    options.AddPolicy(AuthorizationPolicies.RequireAuthenticatedUser, policy =>
        policy.RequireAuthenticatedUser());

    options.AddPolicy(AuthorizationPolicies.RequireAdminRole, policy =>
        policy.RequireRole("Admin"));

    options.DefaultPolicy = options.GetPolicy(
        AuthorizationPolicies.RequireAuthenticatedUser)!;
});

builder.Services.AddCors();

builder.Services.AddRateLimiter(options =>
{
    options.AddFixedWindowLimiter(RateLimitPolicies.AuthenticatedApi, limiter =>
    {
        limiter.PermitLimit = 120;
        limiter.Window = TimeSpan.FromMinutes(1);
        limiter.QueueLimit = 0;
    });

    options.OnRejected = async (context, cancellationToken) =>
    {
        context.HttpContext.Response.StatusCode = StatusCodes.Status429TooManyRequests;
        context.HttpContext.Response.ContentType = "application/problem+json";
        await context.HttpContext.Response.WriteAsJsonAsync(new
        {
            type = "https://tools.ietf.org/html/rfc6585#section-4",
            title = "Too Many Requests",
            status = 429,
            detail = "Rate limit exceeded. Retry after the window resets."
        }, cancellationToken);
    };
});

builder.Services.AddInfrastructure(builder.Configuration);

builder.Services.AddLiteBus(liteBus =>
{
    liteBus.AddCommandModule(module =>
    {
        module.RegisterFromAssembly(typeof(ApplicationWriteAssemblyMarker).Assembly);
        module.RegisterFromAssembly(typeof(InfrastructureAssemblyMarker).Assembly);
    });

    liteBus.AddQueryModule(module =>
    {
        module.RegisterFromAssembly(typeof(ApplicationReadAssemblyMarker).Assembly);
    });

    liteBus.AddEventModule(module =>
    {
        module.RegisterFromAssembly(typeof(ApplicationReactionsAssemblyMarker).Assembly);
    });
});

builder.Services.AddEndpoints(typeof(Program).Assembly);
builder.Services.AddHttpContextAccessor();
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();

builder.Services.AddOpenApi(options =>
{
    options.AddSchemaTransformer<StronglyTypedIdSchemaTransformer>();
    options.AddDocumentTransformer((document, _, _) =>
    {
        document.Components ??= new();
        document.Components.SecuritySchemes ??= new Dictionary<string, OpenApiSecurityScheme>();
        document.Components.SecuritySchemes["Bearer"] = new OpenApiSecurityScheme
        {
            Type = SecuritySchemeType.Http,
            Scheme = "bearer",
            BearerFormat = "JWT",
            Description = "Enter your JWT access token."
        };
        return Task.CompletedTask;
    });
});

builder.Services.AddHealthChecks()
    .AddCheck<PostgreSqlHealthCheck>("postgresql", tags: ["ready"]);

var app = builder.Build();

app.UseExceptionHandler();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseSerilogRequestLogging();

var corsOptions = app.Services.GetRequiredService<IOptions<CorsOptions>>().Value;

app.UseRouting();
app.UseCors(policy => policy
    .WithOrigins(corsOptions.AllowedOrigins)
    .WithMethods("GET", "POST", "PUT", "PATCH", "DELETE")
    .WithHeaders("Content-Type", "Authorization", "Idempotency-Key")
    .AllowCredentials());
app.UseAuthentication();
app.UseAuthorization();
app.UseRateLimiter();

app.MapHealthChecks("/health", new HealthCheckOptions
{
    ResponseWriter = HealthCheckResponseWriter.WriteDetailedJson
});

app.MapHealthChecks("/health/ready", new HealthCheckOptions
{
    Predicate = check => check.Tags.Contains("ready"),
    ResponseWriter = HealthCheckResponseWriter.WriteDetailedJson
});

app.MapHealthChecks("/health/live", new HealthCheckOptions
{
    Predicate = _ => false
});

app.MapEndpoints();

app.Run();

public partial class Program { }
```

---

## Supporting Files

### `WebApi/Auth/JwtBearerOptionsSetup.cs`

Binds JWT validation from validated `IOptions<JwtSettings>`.

```csharp
internal sealed class JwtBearerOptionsSetup : IConfigureNamedOptions<JwtBearerOptions>
{
    private readonly IOptions<JwtSettings> _jwtSettings;

    public JwtBearerOptionsSetup(IOptions<JwtSettings> jwtSettings)
    {
        _jwtSettings = jwtSettings;
    }

    public void Configure(JwtBearerOptions options)
    {
        Configure(JwtBearerDefaults.AuthenticationScheme, options);
    }

    public void Configure(string? name, JwtBearerOptions options)
    {
        if (name != JwtBearerDefaults.AuthenticationScheme)
        {
            return;
        }

        var settings = _jwtSettings.Value;

        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(settings.Secret)),
            ValidateIssuer = true,
            ValidIssuer = settings.Issuer,
            ValidateAudience = true,
            ValidAudience = settings.Audience,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromSeconds(30)
        };
    }
}
```

### `WebApi/Auth/RateLimitPolicies.cs`

```csharp
internal static class RateLimitPolicies
{
    public const string AuthenticatedApi = "authenticated-api";
}
```

### `WebApi/HealthChecks/HealthCheckResponseWriter.cs`

```csharp
internal static class HealthCheckResponseWriter
{
    internal static Task WriteDetailedJson(HttpContext context, HealthReport report)
    {
        context.Response.ContentType = "application/json";

        var payload = new
        {
            status = report.Status.ToString(),
            totalDuration = report.TotalDuration.TotalMilliseconds,
            entries = report.Entries.ToDictionary(
                entry => entry.Key,
                entry => new
                {
                    status = entry.Value.Status.ToString(),
                    duration = entry.Value.Duration.TotalMilliseconds,
                    description = entry.Value.Description
                })
        };

        return context.Response.WriteAsJsonAsync(payload);
    }
}
```

### `WebApi/Options/CorsOptions.cs`

```csharp
public sealed class CorsOptions
{
    public const string SectionName = "Cors";

    [Required]
    [MinLength(1, ErrorMessage = "At least one CORS origin is required.")]
    public required string[] AllowedOrigins { get; init; } = [];
}
```

### `WebApi/Options/RateLimitOptions.cs`

```csharp
public sealed class RateLimitOptions
{
    public const string SectionName = "RateLimit";

    [Range(1, 10000)]
    public int PermitLimit { get; init; } = 120;

    [Range(1, 3600)]
    public int WindowSeconds { get; init; } = 60;
}
```

### `WebApi/Middleware/GlobalExceptionHandler.cs`

Copy the full implementation from `docs/conventions/backend/06-exception-hierarchy.md` (section **The GlobalExceptionHandler**).

### `WebApi/Extensions/EndpointExtensions.cs`

Copy from `docs/blueprints/backend/endpoint-extensions.md`.

### `Infrastructure/HealthChecks/PostgreSqlHealthCheck.cs`

Copy from `docs/conventions/backend/09-observability.md` section 4.

---

## Notes

- Middleware order (`UseRouting` → `UseCors` → `UseAuthentication` → `UseAuthorization` → `UseRateLimiter`) is required. Do not reorder.
- Apply `.RequireRateLimiting(RateLimitPolicies.AuthenticatedApi)` on route groups per `docs/conventions/backend/05-api-layer.md`.
- `public partial class Program { }` enables `WebApplicationFactory<Program>` in integration tests.
- Health check endpoints are not rate limited.
