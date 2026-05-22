# Authentication and Authorization

This document defines the backend authentication and authorization model. Read it before configuring authentication, adding protected endpoints, or writing authorization logic.

---

## Agent Quick Rules

- JWT bearer configuration MUST use `JwtSettings` bound from options, not raw `configuration["Key"]!`.
- Actor identity MUST come from validated claims only. MUST NOT accept actor IDs from request bodies when the actor is the authenticated user.
- `ClaimsPrincipalExtensions` MUST provide typed accessors; MUST NOT call `User.FindFirst(...)` inline.
- Authorization policies MUST be defined in `AuthorizationPolicies` constants; MUST NOT use magic strings.
- Integration tests MUST use `TestAuthHandler`; MUST NOT use real JWT tokens.
- 401 responses come from the authentication middleware; 403 responses come from the authorization middleware. Endpoints MUST NOT throw manual auth exceptions for normal auth failures.

---

## 1. JWT Bearer Setup

### Package

```xml
<!-- {ProjectName}.WebApi.csproj -->
<PackageReference Include="Microsoft.AspNetCore.Authentication.JwtBearer" />
```

### Options Class

```csharp
// WebApi/Auth/JwtSettings.cs
public sealed class JwtSettings
{
    public const string SectionName = "JwtSettings";

    [Required]
    public required string Secret { get; init; }

    [Required]
    public required string Issuer { get; init; }

    [Required]
    public required string Audience { get; init; }

    [Range(1, 1440)]
    public int AccessTokenExpirationMinutes { get; init; } = 60;
}
```

### Registration

```csharp
builder.Services
    .AddOptions<JwtSettings>()
    .BindConfiguration(JwtSettings.SectionName)
    .ValidateDataAnnotations()
    .ValidateOnStart();

builder.Services.ConfigureOptions<JwtBearerOptionsSetup>();

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer();
```

`JwtBearerOptionsSetup` reads `IOptions<JwtSettings>` and configures validation parameters. Copy the implementation from `docs/blueprints/backend/program-cs.md` (Supporting Files section).

All five parameters — signature, issuer, audience, expiration, and required claims — MUST be validated. Disabling any validation requires a comment with a justification.

---

## 2. Configuration

```json
// appsettings.json (values without defaults)
{
  "JwtSettings": {
    "Issuer": "https://yourdomain.com",
    "Audience": "your-api",
    "AccessTokenExpirationMinutes": 60
  }
}
```

```json
// appsettings.Development.json (non-production secret via user-secrets in real dev)
{
  "JwtSettings": {
    "Secret": "dev-only-secret-replace-before-any-deploy"
  }
}
```

In production, inject `JwtSettings__Secret` as an environment variable or secret store reference. See `docs/conventions/backend/16-options-and-configuration.md`.

---

## 3. Middleware Order

Authentication and authorization MUST appear in this exact sequence inside `Program.cs`:

```csharp
app.UseRouting();
app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
```

Placing `UseAuthentication` after `UseAuthorization` causes 500 errors for protected endpoints. Placing `UseCors` after `UseAuthorization` causes incorrect CORS rejections on unauthenticated preflight requests.

---

## 4. Claims and Domain Identity

### Required Claims

Every access token issued to an authenticated user MUST carry at least:

| Claim | Value |
|:---|:---|
| `sub` | Stable user identifier (UUID) |
| `jti` | Unique token ID (for revocation/audit) |
| `iss` | Token issuer |
| `aud` | Token audience |
| `exp` | Expiration timestamp |

Application-specific claims such as tenant ID or role are added on top of this baseline.

### ClaimsPrincipalExtensions

```csharp
// WebApi/Auth/ClaimsPrincipalExtensions.cs
public static class ClaimsPrincipalExtensions
{
    public static UserId GetUserId(this ClaimsPrincipal principal)
    {
        var value = principal.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? throw new InvalidOperationException(
                "UserId claim is missing from the authenticated principal.");
        return new UserId(Guid.Parse(value));
    }

    public static string GetRequiredClaim(this ClaimsPrincipal principal, string claimType)
    {
        return principal.FindFirstValue(claimType)
            ?? throw new InvalidOperationException(
                $"Required claim '{claimType}' is missing from the authenticated principal.");
    }
}
```

### Usage in Endpoints

```csharp
// GOOD: actor identity from claims only
private static async Task<IResult> HandleAsync(
    CreatePostRequest request,
    HttpContext httpContext,
    ICommandMediator commandMediator,
    CancellationToken cancellationToken)
{
    var authorId = new AuthorId(httpContext.User.GetUserId().Value);
    var command = request.ToCommand(authorId);
    var result = await commandMediator.SendAsync(command, cancellationToken);
    return Results.Created($"/posts/{result.Value}", result.ToResponse());
}

// BAD: actor ID from request body — allows impersonation
private static async Task<IResult> HandleAsync(
    CreatePostRequest request,   // request.AuthorId is attacker-controlled
    ICommandMediator commandMediator,
    CancellationToken cancellationToken)
{
    var command = request.ToCommand(); // maps request.AuthorId directly
    ...
}
```

**Endpoints MUST NOT accept actor IDs from request bodies when the actor is the authenticated user.** Actor identity comes from validated JWT claims only.

---

## 5. Authorization Policies

### Policy Constants

```csharp
// WebApi/Auth/AuthorizationPolicies.cs
public static class AuthorizationPolicies
{
    public const string RequireAuthenticatedUser = "RequireAuthenticatedUser";
    public const string RequireAdminRole = "RequireAdminRole";
}
```

### Policy Registration

```csharp
// Program.cs
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy(AuthorizationPolicies.RequireAuthenticatedUser, policy =>
        policy.RequireAuthenticatedUser());

    options.AddPolicy(AuthorizationPolicies.RequireAdminRole, policy =>
        policy.RequireRole("Admin"));

    // Default policy — applies to .RequireAuthorization() with no argument
    options.DefaultPolicy = options.GetPolicy(
        AuthorizationPolicies.RequireAuthenticatedUser)!;
});
```

### Endpoint Usage

```csharp
// GOOD: named policy constant
app.MapPost("/posts", HandleAsync)
    .RequireAuthorization(AuthorizationPolicies.RequireAuthenticatedUser);

// GOOD: default policy
app.MapPost("/posts", HandleAsync)
    .RequireAuthorization();

// BAD: magic string
app.MapPost("/admin/posts", HandleAsync)
    .RequireAuthorization("Admin");
```

---

## 6. OpenAPI Security Scheme

Every OpenAPI document MUST declare the JWT bearer security scheme. This enables Swagger UI to send the Authorization header.

```csharp
// Program.cs
builder.Services.AddOpenApi(options =>
{
    options.AddDocumentTransformer((document, context, cancellationToken) =>
    {
        document.Components ??= new OpenApiComponents();
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

    options.AddOperationTransformer((operation, context, cancellationToken) =>
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
```

---

## 7. Test Authentication Handler

Integration tests MUST NOT use real JWT tokens. Use `TestAuthHandler` to inject controlled claims.

```csharp
// apps/api/tests/{ProjectName}.Integration.Tests/Auth/TestAuthHandler.cs
public sealed class TestAuthHandler : AuthenticationHandler<AuthenticationSchemeOptions>
{
    public const string SchemeName = "TestAuth";

    public TestAuthHandler(
        IOptionsMonitor<AuthenticationSchemeOptions> options,
        ILoggerFactory logger,
        UrlEncoder encoder)
        : base(options, logger, encoder) { }

    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, TestUsers.DefaultUserId.ToString()),
            new Claim(ClaimTypes.Name, "Test User"),
            new Claim(ClaimTypes.Role, "User")
        };

        var identity = new ClaimsIdentity(claims, SchemeName);
        var principal = new ClaimsPrincipal(identity);
        var ticket = new AuthenticationTicket(principal, SchemeName);

        return Task.FromResult(AuthenticateResult.Success(ticket));
    }
}
```

```csharp
// apps/api/tests/{ProjectName}.Integration.Tests/Auth/TestUsers.cs
public static class TestUsers
{
    public static readonly Guid DefaultUserId = Guid.Parse("00000000-0000-0000-0000-000000000001");
    public static readonly Guid AdminUserId   = Guid.Parse("00000000-0000-0000-0000-000000000002");
}
```

```csharp
// Registering in the integration test WebApplicationFactory
builder.ConfigureTestServices(services =>
{
    services.AddAuthentication(TestAuthHandler.SchemeName)
        .AddScheme<AuthenticationSchemeOptions, TestAuthHandler>(
            TestAuthHandler.SchemeName, options => { });

    services.AddAuthorization(options =>
    {
        options.DefaultPolicy = new AuthorizationPolicyBuilder(TestAuthHandler.SchemeName)
            .RequireAuthenticatedUser()
            .Build();
    });
});
```

---

## 8. 401 vs. 403

| Response | Meaning | Source |
|:---|:---|:---|
| 401 Unauthorized | No valid authentication token was provided, or the token is expired. | ASP.NET Core authentication middleware |
| 403 Forbidden | A valid token was provided, but the token holder does not have permission for this resource. | ASP.NET Core authorization middleware |

Endpoints MUST NOT return 401 or 403 by catching exceptions or calling `Results.Unauthorized()` / `Results.Forbid()` for normal auth failures. The authentication and authorization middleware handle these cases. `Results.Unauthorized()` and `Results.Forbid()` are reserved for programmatic authorization decisions inside endpoint logic (for example, resource-based authorization where the ownership check requires loading the resource).

---

## 9. Resource-Based Authorization

When authorization depends on domain data (for example, "only the author can edit their own post"), use resource-based checks inside the endpoint handler after loading the resource.

```csharp
private static async Task<IResult> HandleAsync(
    Guid id,
    UpdatePostRequest request,
    HttpContext httpContext,
    ICommandMediator commandMediator,
    CancellationToken cancellationToken)
{
    var postId = new PostId(id);
    var actorId = httpContext.User.GetUserId();

    // Load the post first to check ownership
    var post = await commandMediator.SendAsync(
        new GetPostOwnerQuery { PostId = postId }, cancellationToken);

    if (post.AuthorId != actorId.Value)
    {
        return Results.Forbid();
    }

    var command = request.ToCommand(postId, new AuthorId(actorId.Value));
    await commandMediator.SendAsync(command, cancellationToken);

    return Results.NoContent();
}
```

Resource-based authorization MUST NOT embed ownership logic in the Domain layer. It lives in the endpoint handler where the HTTP context is available.
