# HTTP API

## Intent

WebApi is a thin transport adapter. It maps HTTP input to Application messages, dispatches through the specific mediator, and maps results to stable HTTP contracts. Business rules, persistence access, and provider behavior remain outside endpoints.

## Agent Summary {#agent-summary}

- Use one Minimal API `IEndpoint` class per operation.
- Group endpoints by capability and use case.
- Keep request, response, and mapping types beside the endpoint.
- Derive the authenticated actor from trusted claims.
- Return stable Problem Details codes and documented status codes.
- Keep endpoints free of repositories, sessions, provider clients, and business rules.
- Generate OpenAPI and update typed consumers with contract changes.

## Standards

### Use one endpoint per operation (API.ENDPOINTS.001)

Each endpoint implements `IEndpoint`, maps one route operation, converts transport input to an Application message, dispatches through `ICommandMediator` or `IQueryMediator`, and maps the result.

MVC controllers and `ControllerBase` are outside this profile.

### Keep endpoint dependencies transport-focused (API.BOUNDARY.001)

Endpoint constructors may receive mediators and HTTP-boundary services such as an actor accessor. They cannot receive aggregate repositories, Marten sessions, DbContext, provider SDKs, or broad application services.

Endpoints do not catch known application exceptions. Global exception handling owns error mapping.

### Derive authenticated identity from claims (API.ACTOR.001)

When the authenticated user is the actor, derive the actor ID from verified claims. Do not accept it from the body, form, route, query, or client-controlled header.

An administrator acting on another resource uses a separate target ID and authorization policy. The administrator identity still comes from claims.

### Authorize the target resource (API.AUTHZ.001)

Authentication alone does not authorize an operation. Verify role, ownership, tenant, state, or policy against the target resource before returning protected data or changing state.

Use a stable forbidden or not-found policy when revealing resource existence would leak information.

### Return stable Problem Details (API.ERRORS.001)

Error responses use RFC Problem Details plus:

- `code`: stable application error code.
- `traceId`: current distributed trace identifier.
- `errors`: validation entries with field, code, and safe message.

Do not expose exception messages, stack traces, SQL, provider bodies, or secrets.

### Use consistent status codes (API.STATUS.001)

| Outcome | Status |
|:---|:---:|
| Successful read | 200 |
| Successful creation | 201 with a resource location when one exists |
| Successful command without a response body | 204 |
| Structural validation failure | 400 |
| Missing or invalid authentication | 401 |
| Authenticated but forbidden | 403 |
| Resource unavailable under the disclosure policy | 404 |
| State, version, or idempotency conflict | 409 |
| Accepted background operation | 202 with status location |

Do not return 200 for a documented error.

### Keep routes resource-oriented (API.ROUTES.001)

Use lowercase plural resource segments and kebab-case subresources. Use route parameters for resource identity, query parameters for filtering and pagination, and request bodies for command data.

Do not place the authenticated actor ID in the route unless the actor is intentionally addressing another actor as a resource.

### Bound collection queries (API.PAGING.001)

Every collection endpoint has a documented maximum size and deterministic ordering. Use cursor pagination when data changes frequently or offsets become costly. Use offset pagination only for bounded datasets where its consistency behavior is acceptable.

Return pagination metadata in one documented shape across the API.

### Treat OpenAPI as a generated contract (API.OPENAPI.001)

Generate OpenAPI during the Release build. Commit the artifact when a frontend or external consumer uses it. Regenerate TypeScript types in the same change and fail CI when committed output differs.

Scalar may expose API documentation in Development. Hosted environments do not expose development tooling by default.

## Conventions

### Use this endpoint layout

```text
{ProjectName}.WebApi/
  Endpoints/
    Posts/
      CreateDraft/
        CreateDraftEndpoint.cs
        CreateDraftRequest.cs
        CreateDraftResponse.cs
        CreateDraftMappings.cs
      GetPost/
        GetPostEndpoint.cs
        GetPostResponse.cs
        GetPostMappings.cs
  Errors/
    GlobalExceptionHandler.cs
    ProblemDetailsMappings.cs
  Security/
    CurrentActor.cs
  OpenApi/
  Program.cs
```

### Keep transport models independent

Request and response models use JSON and OpenAPI concerns. Application messages and results remain transport-neutral. Explicit mapping may be a small method or an internal static mappings class.

### Name routes from resources

Examples:

```text
POST   /api/posts
GET    /api/posts/{postId}
POST   /api/posts/{postId}/publication
GET    /api/posts?after={cursor}&limit=20
```

Use action segments only when the operation does not map cleanly to a resource or subresource.

### Keep Program.cs as composition

`Program.cs` registers approved modules, middleware order, endpoint discovery, health endpoints, OpenAPI, and host startup. Move coherent registration into layer-owned extension methods without hiding order-sensitive middleware.

## Examples

A create endpoint reads the author from claims, maps the title to `CreateDraftCommand`, sends it through `ICommandMediator`, and returns 201 with the new post location. The endpoint never calls `Post.CreateDraft` or `IPostRepository`.

## Verification

- Inspect endpoint constructors and bodies for forbidden dependencies and business logic.
- Compare routes and status codes with use-case specifications and OpenAPI.
- Test validation, authentication, authorization, missing resources, conflicts, and success through `WebApplicationFactory`.
- Regenerate OpenAPI and typed consumers.
- Run architecture tests for endpoint boundaries.
