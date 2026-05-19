# Security

This document defines the security baseline requirements for all projects following these standards. These rules are non-negotiable. Violations MUST be caught in code review before any PR is merged.

---

## 1. Never Commit Secrets

No API keys, connection strings, passwords, tokens, or credentials of any kind MUST appear in source code, committed configuration files, or version history.

**Acceptable approaches:**
- Environment variables injected at runtime
- A secrets manager (Azure Key Vault, AWS Secrets Manager, HashiCorp Vault)
- A `.env` file that is listed in `.gitignore` and never committed

**If a secret is accidentally committed:** Rotate the secret immediately. Do not rely on rewriting git history as the primary mitigation; assume the secret is compromised the moment it appears in any commit.

The `.gitignore` for every project MUST include `.env`, `*.pfx`, `*.p12`, `appsettings.Development.json` (if it contains real secrets), and any other file that could contain credentials.

---

## 2. Input Validation

All external input (HTTP request bodies, query parameters, route values, file uploads) MUST be validated at the application boundary before it reaches the Domain layer.

Validation in the Application layer (via `ICommandValidator` and `IQueryValidator`) is the primary line of defense. The API layer MUST NOT forward unvalidated input directly to the domain.

Never trust input because it comes from an internal frontend. Validate every HTTP request as if it could come from any source.

---

## 3. SQL Injection

Always use parameterized queries. EF Core LINQ queries are parameterized by default and are safe. Raw SQL queries using `FormattableString` (via `FromSqlInterpolated`) are also safe because EF Core parameterizes the interpolated values.

```csharp
// GOOD: EF Core LINQ - parameterized automatically
var post = await dbContext.Posts
    .Where(p => p.AuthorId == authorId)
    .FirstOrDefaultAsync(cancellationToken);

// GOOD: FormattableString raw SQL - EF Core parameterizes automatically
var post = await dbContext.Posts
    .FromSqlInterpolated($"SELECT * FROM \"Posts\" WHERE \"AuthorId\" = {authorId.Value}")
    .FirstOrDefaultAsync(cancellationToken);

// BAD: string concatenation - SQL injection vulnerability
var post = await dbContext.Posts
    .FromSqlRaw($"SELECT * FROM \"Posts\" WHERE \"AuthorId\" = '{authorId.Value}'")
    .FirstOrDefaultAsync(cancellationToken);
```

Never use `FromSqlRaw` with string interpolation. Only use `FromSqlRaw` with explicitly named parameters (`@param`) when `FromSqlInterpolated` is not an option.

---

## 4. Authentication and Authorization

Authentication is handled by ASP.NET Core middleware. Do not implement custom authentication logic inside endpoints.

- Every endpoint that handles protected data MUST call `.RequireAuthorization()`.
- Endpoints that are intentionally public MUST call `.AllowAnonymous()` explicitly to make the intent clear.
- Authorization policy names MUST be defined as `const string` fields in a central `AuthorizationPolicies` static class, not as inline magic strings.

```csharp
// GOOD:
internal static class AuthorizationPolicies
{
    public const string AuthenticatedUser = "AuthenticatedUser";
    public const string AdminOnly = "AdminOnly";
}

app.MapPost("/posts", HandleAsync)
    .RequireAuthorization(AuthorizationPolicies.AuthenticatedUser);

// BAD:
app.MapPost("/posts", HandleAsync)
    .RequireAuthorization("AuthenticatedUser"); // BAD: magic string, not refactoring-safe
```

---

## 5. Rate Limiting

Public endpoints, authentication endpoints, file uploads, search endpoints, expensive commands, and webhooks MUST have rate limiting. Use ASP.NET Core rate limiting middleware for the backend and a reverse proxy or platform-level limiter for the Next.js app when self-hosted.

```csharp
// GOOD: named policy applied to a route group
builder.Services.AddRateLimiter(options =>
{
    options.AddFixedWindowLimiter("authenticated-api", limiter =>
    {
        limiter.PermitLimit = 120;
        limiter.Window = TimeSpan.FromMinutes(1);
        limiter.QueueLimit = 0;
    });
});

app.UseRateLimiter();

app.MapGroup("/api")
    .RequireAuthorization()
    .RequireRateLimiting("authenticated-api");
```

```csharp
// BAD: public search endpoint has no limiter
app.MapGet("/search", HandleAsync);
```

Rate limiting policies MUST be load tested before production.

---

## 6. CORS

CORS is not an authorization mechanism. It relaxes browser same-origin rules and MUST be configured narrowly.

- Allow only known frontend origins per environment.
- Do not use `AllowAnyOrigin()` with credentials.
- Define policy names as constants.
- Apply CORS before authorization in the ASP.NET Core middleware order.

```csharp
// GOOD: explicit origins
builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        policy
            .WithOrigins("https://app.example.com")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});
```

```csharp
// BAD: any origin with credentials
policy.AllowAnyOrigin()
    .AllowCredentials();
```

---

## 7. Content Security Policy

Next.js projects MUST define a Content Security Policy before production. Use nonce-based CSP for applications that handle sensitive data or strict compliance requirements. Nonce-based CSP forces dynamic rendering and disables static optimization for affected routes, so document that trade-off in the project ADR.

At minimum, production CSP MUST include:

- `default-src 'self'`
- `object-src 'none'`
- `base-uri 'self'`
- `form-action 'self'`
- `frame-ancestors 'none'`

Third-party script, image, analytics, and monitoring domains must be explicitly listed.

---

## 8. Audit Logging

Security-sensitive business actions MUST emit audit events. Audit events are not normal logs and MUST be retained according to the project data policy.

Audit events include:

- Authentication and authorization changes.
- Role, permission, tenant, or team membership changes.
- Changes to externally visible business state.
- Data export.
- Administrative impersonation.
- Payment, billing, and compliance actions.

Audit records MUST include actor, action, target, timestamp, correlation ID, and tenant scope when applicable. Do not store secrets in audit records.

---

## 9. PII and Data Classification

Every production project MUST classify data before launch.

| Class | Examples | Rule |
|:---|:---|:---|
| Public | Published content, public metadata | May appear in logs when needed |
| Internal | Non-sensitive operational metadata | Limit to authenticated users |
| Confidential | Names, email addresses, phone numbers | Do not log by default |
| Restricted | Secrets, tokens, payment data, credentials | Never log or expose to client code |

Frontend server components and Server Actions MUST return minimal DTOs to client components. Do not pass full user, tenant, or permission objects to client components.

---

## 10. Secrets Rotation

Projects MUST document how each production secret is rotated. Rotation must include:

- Owner.
- Storage location.
- Rotation frequency.
- Rollback plan.
- How dependent services pick up the new value.

Secrets used for signing or encryption need key versioning so old data or sessions can be read during rotation.

---

## 11. Dependency Scanning

Run `dotnet list package --vulnerable` as part of the CI pipeline on every pull request. Any PR that introduces a vulnerable package MUST either:
- Update to a patched version, or
- Include a documented exception in the PR description explaining why the vulnerability is not exploitable in this context and when it will be resolved.

Do not merge PRs with known vulnerable dependencies without an explicit decision.

Frontend projects MUST also run `pnpm audit` in CI. For high-severity supply-chain advisories, pin the lockfile to a known safe version and document the advisory in the PR.

---

## 12. OWASP Top 10

All engineers working on projects following these standards should be familiar with the [OWASP Top 10](https://owasp.org/www-project-top-ten/). The rules in this document address the most common of these risks, but they are not exhaustive.

When designing a feature that handles sensitive data, authentication, or authorization, consult the OWASP guidelines for the relevant risk category before starting implementation.
