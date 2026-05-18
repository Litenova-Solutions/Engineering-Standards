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

## 5. Dependency Scanning

Run `dotnet list package --vulnerable` as part of the CI pipeline on every pull request. Any PR that introduces a vulnerable package MUST either:
- Update to a patched version, or
- Include a documented exception in the PR description explaining why the vulnerability is not exploitable in this context and when it will be resolved.

Do not merge PRs with known vulnerable dependencies without an explicit decision.

---

## 6. OWASP Top 10

All engineers working on projects following these standards should be familiar with the [OWASP Top 10](https://owasp.org/www-project-top-ten/). The rules in this document address the most common of these risks, but they are not exhaustive.

When designing a feature that handles sensitive data, authentication, or authorization, consult the OWASP guidelines for the relevant risk category before starting implementation.
