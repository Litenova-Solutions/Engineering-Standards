# Object-Level Authorization

Every endpoint that accepts an object ID, tenant scope, user scope, or ownership semantics MUST enforce object-level authorization (BOLA prevention) and include negative integration tests.

Route-level authentication (`RequireAuthorization()`) is necessary but not sufficient. An authenticated user MUST NOT access another actor's resource by changing an ID in the URL or request body.

---

## Agent Quick Rules

- Every `/{id}` route (and equivalent) MUST have positive and negative authorization integration tests.
- Negative tests MUST return **403 Forbidden** when an authenticated user accesses another actor's resource.
- Tenant-scoped endpoints MUST include cross-tenant negative tests.
- Object-level checks run after authentication; use `Results.Forbid()` for failed ownership or tenant checks.
- Queries for ownership facts MUST use `IQueryMediator`, not `ICommandMediator`.

---

## 1. When This Applies

| Endpoint pattern | Required check |
|:---|:---|
| `GET/PUT/PATCH/DELETE /resources/{id}` | Actor may access this specific resource |
| Commands scoped to `{tenantId}` | Actor belongs to tenant |
| Lists filtered by implicit user scope | Actor sees only own data unless role allows broader access |
| Admin endpoints acting on user resources | Admin role plus optional audit |

If the endpoint accepts an ID that maps to persisted data owned by or scoped to an actor, this standard applies.

---

## 2. Implementation Patterns

### Endpoint ownership check

See `docs/conventions/backend/15-authentication-and-authorization.md` for the endpoint pattern using `IQueryMediator`.

### Authorization handler (repeated rules)

When three or more endpoints share the same rule, add an `IAuthorizationHandler` or project-owned `IResourceAuthorizationService` in `WebApi/Auth/`:

```csharp
public sealed class PostAuthorAuthorizationHandler
    : AuthorizationHandler<PostAuthorRequirement, PostId>
{
    private readonly IQueryMediator _queryMediator;

    protected override async Task HandleRequirementAsync(
        AuthorizationHandlerContext context,
        PostAuthorRequirement requirement,
        PostId resource)
    {
        var actorId = context.User.GetUserId();
        var owner = await _queryMediator.QueryAsync(
            new GetPostOwnerQuery { PostId = resource }, CancellationToken.None);

        if (owner.AuthorId == actorId.Value)
        {
            context.Succeed(requirement);
        }
    }
}
```

Domain aggregates MAY expose facts needed for authorization (for example `AuthorId`, `TenantId`). Domain MUST NOT read JWT claims or HTTP context.

---

## 3. Mandatory Test Matrix

For each protected endpoint with object or tenant scope, add integration tests in `{ProjectName}.Integration.Tests`:

| Test | Actor | Expected |
|:---|:---|:---|
| Happy path | Owner or authorized role | 200/201/204 as specified |
| Wrong owner | Authenticated non-owner | **403** |
| Missing auth | Anonymous | **401** |
| Cross-tenant (when applicable) | Authenticated user in tenant A accessing tenant B resource | **403** or **404** per project policy (document in use-case doc) |

```csharp
[Fact]
public async Task UpdatePost_WhenCallerIsNotAuthor_Returns403()
{
    var client = _factory.CreateClientAsUser(TestUsers.OtherUserId);
    var response = await client.PutAsJsonAsync(
        $"/posts/{TestPosts.OwnedByDefaultUser}",
        new { title = "Hijacked" });

    response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
}
```

Name tests `{Endpoint}_{Scenario}_{ExpectedStatus}`.

---

## 4. Use-Case Documentation

Every use-case doc at `docs/domain/{feature}/{use-case}.md` MUST include:

- Actor and authorization rules
- Whether the operation is idempotent
- Domain events emitted
- External side effects
- Error contract (including 403 cases)
- Acceptance tests (link to integration test class)
- Data classification impact when PII is involved

---

## 5. Enforcement

- Code review checklist item for new `{id}` routes
- Integration test coverage in CI
- Optional: architecture test or analyzer flagging endpoints with route IDs lacking test metadata (project-specific)

See `docs/conventions/shared/security-controls.md` for OWASP API Top 10 mapping.
