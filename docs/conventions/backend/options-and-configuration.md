# Options and Configuration

This document defines the standard for all backend configuration: options classes, validation, environment variables, secrets, and local development setup.

---

## Agent Quick Rules

- ALL configuration access MUST go through strongly typed options classes.
- MUST call `ValidateDataAnnotations()` and `ValidateOnStart()` on every options registration.
- MUST NOT use `configuration["Key"]!` or `configuration.GetValue<T>("Key")` outside options binding.
- Resolving validated options via `IOptions<T>` or `IOptionsSnapshot<T>` after `ValidateOnStart()` is required.
- Connection strings use `ConnectionStrings__Database` env var naming (double underscore as section separator).
- Secrets MUST use `dotnet user-secrets` locally; MUST NOT commit secrets to source control.
- MUST use exact environment variable names documented in this file across all environments.

---

## 1. Strongly Typed Options

Every configuration section MUST be represented by a strongly typed options class with data annotation validation attributes.

```csharp
// WebApi/Options/DatabaseOptions.cs
public sealed class DatabaseOptions
{
    public const string SectionName = "ConnectionStrings";

    [Required]
    public required string Database { get; init; }
}

// WebApi/Options/CorsOptions.cs
public sealed class CorsOptions
{
    public const string SectionName = "Cors";

    [Required]
    [MinLength(1, ErrorMessage = "At least one CORS origin is required.")]
    public required string[] AllowedOrigins { get; init; } = [];
}

// WebApi/Options/RateLimitOptions.cs
public sealed class RateLimitOptions
{
    public const string SectionName = "RateLimit";

    [Range(1, 10000)]
    public int PermitLimit { get; init; } = 100;

    [Range(1, 3600)]
    public int WindowSeconds { get; init; } = 60;
}
```

---

## 2. Registration Pattern

Register every options section in `Program.cs` or a dedicated extension method. Always chain `ValidateDataAnnotations()` and `ValidateOnStart()`.

```csharp
// GOOD: validated, fails fast on startup
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

// BAD: no validation — misconfiguration surfaces at runtime, not startup
builder.Services.Configure<JwtSettings>(
    builder.Configuration.GetSection(JwtSettings.SectionName));
```

```csharp
// BAD: direct configuration key access — bypasses validation and refactoring
var secret = builder.Configuration["JwtSettings:Secret"]!;
var conn = builder.Configuration.GetConnectionString("Database")!;
```

Accessing configuration directly is only acceptable when the options binding has not yet been set up (for example, reading a section during `ValidateOnStart()` bootstrapping). Any such exception MUST be documented with a comment.

---

## 3. Injecting Options

Inject `IOptions<T>`, `IOptionsSnapshot<T>`, or `IOptionsMonitor<T>` depending on the use case.

| Type | Lifetime | When to use |
|:---|:---|:---|
| `IOptions<T>` | Singleton | Values that do not change after startup (JWT settings, connection strings) |
| `IOptionsSnapshot<T>` | Scoped | Values that may change per request (feature flags per tenant) |
| `IOptionsMonitor<T>` | Singleton | Values that change at runtime and need change notifications |

```csharp
// GOOD: IOptions<T> for static settings
internal sealed class PostPublishedNotifier : IPostPublishedNotifier
{
    private readonly EmailOptions _emailOptions;

    public PostPublishedNotifier(IOptions<EmailOptions> options)
    {
        _emailOptions = options.Value;
    }
}
```

---

## 4. Environment Variable Naming

ASP.NET Core maps environment variables to configuration sections using `__` (double underscore) as the section separator on all platforms. This is the only separator that works on both Windows and Linux.

| appsettings.json key | Environment variable |
|:---|:---|
| `ConnectionStrings:Database` | `ConnectionStrings__Database` |
| `JwtSettings:Secret` | `JwtSettings__Secret` |
| `JwtSettings:Issuer` | `JwtSettings__Issuer` |
| `Cors:AllowedOrigins:0` | `Cors__AllowedOrigins__0` |

Array elements use the index as the third segment.

---

## 5. appsettings.json Structure

```json
// appsettings.json — committed to source control; NO secrets
{
  "ConnectionStrings": {
    "Database": ""
  },
  "JwtSettings": {
    "Issuer": "https://yourdomain.com",
    "Audience": "your-api",
    "AccessTokenExpirationMinutes": 60,
    "Secret": ""
  },
  "Cors": {
    "AllowedOrigins": []
  },
  "RateLimit": {
    "PermitLimit": 100,
    "WindowSeconds": 60
  },
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning",
      "Microsoft.EntityFrameworkCore": "Warning"
    }
  },
  "AllowedHosts": "*"
}
```

```json
// appsettings.Development.json — committed; dev defaults only; NO production values
{
  "ConnectionStrings": {
    "Database": "Host=localhost;Port=5432;Database=myproject_dev;Username=postgres;Password=postgres"
  },
  "JwtSettings": {
    "Secret": "dev-only-secret-at-least-32-chars-long"
  },
  "Cors": {
    "AllowedOrigins": ["http://localhost:3000"]
  },
  "Logging": {
    "LogLevel": {
      "Default": "Debug",
      "Microsoft.AspNetCore": "Information"
    }
  }
}
```

---

## 6. Local Development Secrets

Use `dotnet user-secrets` for values that should not be committed even in development (API keys, real OAuth credentials, database passwords for shared environments).

```bash
# Initialize user secrets for the WebApi project
dotnet user-secrets init --project apps/api/src/{ProjectName}.WebApi

# Set a secret
dotnet user-secrets set "JwtSettings:Secret" "my-local-secret" \
    --project apps/api/src/{ProjectName}.WebApi

# List all secrets
dotnet user-secrets list --project apps/api/src/{ProjectName}.WebApi
```

User secrets are stored in `%APPDATA%\Microsoft\UserSecrets\{guid}\secrets.json` on Windows and `~/.microsoft/usersecrets/{guid}/secrets.json` on Linux/macOS. They are never in the repository.

When using .NET Aspire, the AppHost project manages the database connection string automatically. Do not manually set `ConnectionStrings__Database` in user secrets for Aspire-managed resources.

---

## 7. CI/CD Secret Injection

In CI/CD pipelines, inject secrets as environment variables using the `__` separator.

```yaml
# GitHub Actions example
env:
  JwtSettings__Secret: ${{ secrets.JWT_SECRET }}
  ConnectionStrings__Database: ${{ secrets.DATABASE_CONNECTION_STRING }}
```

Secrets MUST be stored in GitHub Actions secrets (CI) and in the server environment file or encrypted secret store at runtime. MUST NOT appear in `appsettings.json`, workflow files, or Dockerfiles.

---

## 8. Required Packages

```xml
<!-- Included in Microsoft.Extensions.Options by default -->
<!-- Explicit validation with data annotations requires: -->
<PackageReference Include="Microsoft.Extensions.Options.DataAnnotations" />
```

---

## 9. Startup Validation Failure

When `ValidateOnStart()` is configured and a required value is missing, the application fails to start with a descriptive error:

```
Microsoft.Extensions.Options.OptionsValidationException:
DataAnnotation validation failed for 'JwtSettings' members: 'Secret'
with the error: 'The Secret field is required.'.
```

This is the intended behavior. An application that starts with invalid configuration is worse than one that refuses to start.
