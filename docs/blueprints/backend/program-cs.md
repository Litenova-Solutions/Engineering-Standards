# Blueprint: Program.cs

This is the canonical `Program.cs` for the `{ProjectName}.WebApi` project. It is the complete composition root. Copy it, replace `{ProjectName}` and adjust the options sections for the project's specific requirements.

---

## Complete Program.cs

```csharp
using System.Text;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.IdentityModel.Tokens;
using {ProjectName}.Infrastructure.DependencyInjection;
using {ProjectName}.WebApi.Auth;
using {ProjectName}.WebApi.Extensions;
using {ProjectName}.WebApi.Middleware;
using {ProjectName}.WebApi.Options;

var builder = WebApplication.CreateBuilder(args);

// ─── Aspire service defaults ─────────────────────────────────────────────────
builder.AddServiceDefaults();

// ─── Options with startup validation ────────────────────────────────────────
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

// ─── Logging ─────────────────────────────────────────────────────────────────
builder.Logging.ClearProviders();
builder.Logging.AddConsole();

// ─── Authentication ───────────────────────────────────────────────────────────
var jwtSettings = builder.Configuration
    .GetSection(JwtSettings.SectionName)
    .Get<JwtSettings>()!;

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtSettings.Secret)),
            ValidateIssuer = true,
            ValidIssuer = jwtSettings.Issuer,
            ValidateAudience = true,
            ValidAudience = jwtSettings.Audience,
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromSeconds(30)
        };
    });

// ─── Authorization ────────────────────────────────────────────────────────────
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy(AuthorizationPolicies.RequireAuthenticatedUser, policy =>
        policy.RequireAuthenticatedUser());

    options.AddPolicy(AuthorizationPolicies.RequireAdminRole, policy =>
        policy.RequireRole("Admin"));

    options.DefaultPolicy = options.GetPolicy(
        AuthorizationPolicies.RequireAuthenticatedUser)!;
});

// ─── CORS ─────────────────────────────────────────────────────────────────────
var corsOptions = builder.Configuration
    .GetSection(CorsOptions.SectionName)
    .Get<CorsOptions>()!;

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
        policy
            .WithOrigins(corsOptions.AllowedOrigins)
            .WithMethods("GET", "POST", "PUT", "PATCH", "DELETE")
            .WithHeaders("Content-Type", "Authorization", "Idempotency-Key")
            .AllowCredentials());
});

// ─── Rate limiting ────────────────────────────────────────────────────────────
var rateLimitOptions = builder.Configuration
    .GetSection(RateLimitOptions.SectionName)
    .Get<RateLimitOptions>()!;

builder.Services.AddRateLimiter(options =>
{
    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(context =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: context.User.Identity?.Name ?? context.Request.Headers.Host.ToString(),
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = rateLimitOptions.PermitLimit,
                Window = TimeSpan.FromSeconds(rateLimitOptions.WindowSeconds)
            }));

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

// ─── Health checks ────────────────────────────────────────────────────────────
builder.Services
    .AddHealthChecks()
    .AddDbContextCheck<{ProjectName}DbContext>("database");

// ─── Exception handler and ProblemDetails ─────────────────────────────────────
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();

// ─── OpenAPI ─────────────────────────────────────────────────────────────────
builder.Services.AddOpenApi(options =>
{
    options.AddDocumentTransformer((document, _, _) =>
    {
        document.Info = new()
        {
            Title = "{ProjectName} API",
            Version = "v1",
            Description = "API for {ProjectName}."
        };

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

    options.AddOperationTransformer((operation, context, _) =>
    {
        var hasAuthorize = context.Description.ActionDescriptor.EndpointMetadata
            .OfType<IAuthorizeData>()
            .Any();

        if (hasAuthorize)
        {
            operation.Security ??= [];
            operation.Security.Add(new OpenApiSecurityRequirement
            {
                [new OpenApiSecurityScheme
                {
                    Reference = new OpenApiReference
                    {
                        Type = ReferenceType.SecurityScheme,
                        Id = "Bearer"
                    }
                }] = Array.Empty<string>()
            });
        }

        return Task.CompletedTask;
    });
});

// ─── Infrastructure registration ─────────────────────────────────────────────
builder.Services.AddInfrastructure(builder.Configuration);

// ─── Endpoint discovery ───────────────────────────────────────────────────────
builder.Services.AddEndpoints(typeof(Program).Assembly);

// ─── HttpContext accessor (for claims extraction in endpoints) ────────────────
builder.Services.AddHttpContextAccessor();

// ═════════════════════════════════════════════════════════════════════════════
var app = builder.Build();
// ═════════════════════════════════════════════════════════════════════════════

// ─── Middleware order is CRITICAL ─────────────────────────────────────────────
// Reference: https://learn.microsoft.com/en-us/aspnet/core/fundamentals/middleware/

app.UseExceptionHandler();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseRouting();
app.UseCors();
app.UseAuthentication();
app.UseAuthorization();

// Rate limiter after CORS so 429 responses include CORS headers for browser clients.
app.UseRateLimiter();

// ─── Health check endpoints ───────────────────────────────────────────────────
app.MapHealthChecks("/health", new HealthCheckOptions
{
    ResponseWriter = HealthCheckResponseWriter.WriteDetailedJson
});

app.MapHealthChecks("/health/ready", new HealthCheckOptions
{
    Predicate = check => check.Tags.Contains("ready")
});

app.MapHealthChecks("/health/live", new HealthCheckOptions
{
    Predicate = _ => false   // liveness: always 200 if process is running
});

// ─── Endpoints ────────────────────────────────────────────────────────────────
app.MapEndpoints();

app.Run();

// Required for integration test WebApplicationFactory
public partial class Program { }
```

---

## Supporting Files

### `WebApi/Options/CorsOptions.cs`

```csharp
public sealed class CorsOptions
{
    public const string SectionName = "Cors";

    [Required]
    public required string[] AllowedOrigins { get; init; } = [];
}
```

### `WebApi/Options/RateLimitOptions.cs`

```csharp
public sealed class RateLimitOptions
{
    public const string SectionName = "RateLimit";

    [Range(1, 10000)]
    public int PermitLimit { get; init; } = 100;

    [Range(1, 3600)]
    public int WindowSeconds { get; init; } = 60;
}
```

### `WebApi/Middleware/GlobalExceptionHandler.cs`

Copy the full implementation from `docs/conventions/backend/06-exception-hierarchy.md` (section **The GlobalExceptionHandler**). Do not maintain a separate copy in the blueprint.

---

## Notes

- The middleware order (`UseRouting` → `UseCors` → `UseAuthentication` → `UseAuthorization` → `UseRateLimiter`) is enforced by the ASP.NET Core middleware pipeline contract. Do not reorder.
- `public partial class Program { }` at the end enables `WebApplicationFactory<Program>` in integration tests.
- The `GlobalExceptionHandler` MUST NOT expose stack traces or internal exception messages in 500 responses.
- Health check endpoints are mapped outside the rate limiter because they are called by orchestrators on a fixed schedule.
