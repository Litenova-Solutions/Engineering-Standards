# HTTP API

## Intent

WebApi is a thin transport adapter. It maps HTTP input to Application messages, dispatches through the specific mediator, and maps results to stable HTTP contracts. Business rules, persistence access, and provider behavior remain outside endpoints.

## Agent Summary {#agent-summary}

- Use one Minimal API `IEndpoint` class per operation.
- Group endpoints by module, then aggregate, then use case, matching `ARCH.MODULES.001`.
- Keep request models, response models, and API mapping types beside the endpoint.
- Derive the authenticated actor from trusted claims.
- Return stable Problem Details codes and documented status codes.
- Keep endpoints free of repositories, sessions, provider clients, and business rules.
- Generate OpenAPI and update typed consumers with contract changes.
- Reflect enforced authentication in the generated OpenAPI security metadata.
- Publish precise schemas: enums for closed-set fields, parameter constraints, and required control headers.

## Standards

### Use one endpoint per operation (API.ENDPOINTS.001)

Each endpoint implements `IEndpoint`, maps one route operation, converts transport input to an Application message, dispatches through `ICommandMediator` or `IQueryMediator`, and maps the result.

Name its passive HTTP DTOs `{UseCase}RequestModel` and `{UseCase}ResponseModel`. Name an operation-specific mapping class `{UseCase}ApiMappings`.

MVC controllers and `ControllerBase` are outside this profile.

The WebApi project owns this contract:

```csharp
internal interface IEndpoint
{
    void MapEndpoint(IEndpointRouteBuilder endpoints);
}
```

At startup, WebApi discovers each non-abstract `IEndpoint` implementation in its own assembly, registers it once as an `IEndpoint` singleton, and calls `MapEndpoint` in deterministic type-name order. The discovery code uses framework reflection and dependency injection; it does not require another scanning package. An integration test reads the mapped endpoint data and fails for duplicate HTTP method and route combinations.

### Keep endpoint dependencies transport-focused (API.BOUNDARY.001)

Endpoint route-handler parameters may receive mediators and HTTP-boundary services such as an actor accessor. Endpoint classes have no scoped constructor dependency because routes are mapped from the root application at startup. They cannot receive aggregate repositories, Marten sessions, DbContext, provider SDKs, or broad application services.

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

The serialized contract is:

```json
{
  "type": "https://example.test/problems/validation",
  "title": "Request validation failed",
  "status": 400,
  "detail": "One or more values are invalid.",
  "instance": "/api/posts",
  "code": "validation_failed",
  "traceId": "4bf92f3577b34da6a3ce929d0e0e4736",
  "errors": [
    {
      "field": "title",
      "code": "required",
      "message": "Title is required."
    }
  ]
}
```

`type` is a stable absolute URI owned by the consumer. `errors` appears only when field or message validation entries exist. WebApi maps Application member names to their public JSON field names. `traceId` uses the current W3C trace identifier, with the request identifier as fallback. The same shape applies to authentication and authorization failures.

Use ASP.NET Core `AddProblemDetails` and one `IExceptionHandler`. Map validation exceptions to 400, missing targets to the operation's 404 policy, forbidden failures to 403 or the declared 404 disclosure policy, conflicts and mapped state rejections to 409, and unexpected exceptions to 500 with code `internal_error`. Cancellation caused by the disconnected request is not reported as an application error. Map known Domain exception types individually.

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

Every collection endpoint has deterministic ordering, a default limit of 20, and a maximum limit of 100 unless an accepted use case declares a smaller bound. The baseline request uses `after` as an opaque cursor and `limit` as a positive integer. Fetch one more record than the requested limit to determine whether another page exists.

The response uses one shape:

```json
{
  "items": [],
  "page": {
    "limit": 20,
    "nextCursor": null,
    "hasMore": false
  }
}
```

The cursor contains a version and the last stable sort values, including a unique tie-breaker. Treat it as untrusted input and return 400 with code `invalid_cursor` when it is malformed or unsupported. Do not place sensitive values in a readable cursor. An implementation may use an offset for a proven bounded dataset, but the public profile contract remains opaque unless a consumer convention replaces this rule across its API.

### Treat OpenAPI as a generated contract (API.OPENAPI.001)

Generate OpenAPI during the Release build. Commit the artifact when a frontend or external consumer uses it. Regenerate TypeScript types in the same change and fail CI when committed output differs.

Scalar may expose API documentation in Development. Hosted environments do not expose development tooling by default.

The API source artifact is `apps/api/openapi/{ProjectName}.json`. WebApi references `Microsoft.AspNetCore.OpenApi` and `Microsoft.Extensions.ApiDescription.Server`, enables `OpenApiGenerateDocuments`, sets `OpenApiDocumentsDirectory` to that directory, and passes `--file-name {ProjectName}` through `OpenApiGenerateDocumentsOptions`. Build-time generation must start the entry point without contacting hosted dependencies or running schema changes.

Every operation sets a stable name through `WithName`, which becomes `operationId`, and declares authorization, request, success, and Problem Details response metadata. Use typed results or `Produces` metadata so the generated document contains every documented status. Add explicit summaries and descriptions or enable XML documentation on named handler methods; comments on route lambdas are not contract documentation.

When TypeScript consumes the API, run the pinned `openapi-typescript` executable against the source artifact. A single frontend writes generated types under `apps/{frontend}/lib/api/generated/`; multiple consumers use `packages/api-types/src/`. Run generation from a clean Release build and fail when a second generation changes committed files.

### Reflect enforced authentication in the contract (API.OPENAPI.002)

When endpoints enforce authentication (for example by deriving the actor from claims and returning 401 when absent, per `API.ACTOR.001`), the generated OpenAPI document declares the corresponding security scheme and per-operation security requirement. A consumer or a generated client must be able to learn from the contract that an operation requires authentication, rather than discovering it from a runtime 401.

Register this with an OpenAPI document transformer that reads the registered authentication schemes (for example through `IAuthenticationSchemeProvider`) and adds the matching `securitySchemes` and `security` entries, instead of hand-writing security metadata that can drift from the registered schemes. An operation that is intentionally anonymous declares no security requirement. Endpoints authorized only at runtime with no declared scheme are a defect: the contract and the enforced behavior must agree.

### Publish precise, complete schemas (API.OPENAPI.003)

The generated contract expresses the real shape and constraints of each operation, not only its base types. A consumer learns an operation's rules from the document rather than by receiving a runtime rejection.

- A field or parameter whose values form a closed set declares those values as an OpenAPI `enum`. A response field projected from a closed Domain set, such as a state hierarchy or discriminated union, publishes its allowed values so a consumer receives a typed union instead of an open `string`. Domain still models the set without an `enum` (`DOMAIN.CLOSEDSET.001`); the `enum` exists only at the transport boundary, produced by a boundary type or a schema transformer.
- A parameter declares its real constraints: bounds (`minimum`, `maximum`, length), format, and allowed values, plus a description for a non-obvious business limit such as a maximum date-range span. A caller must be able to learn a limit from the contract instead of by receiving a 400.
- An operation that requires a control header declares it as a required parameter, for example `Idempotency-Key` or `If-Match`, so the requirement is discoverable and consistent across the operations that share it.

Prefer expressing these through typed results, typed boundary enums, and parameter metadata so the generated document stays precise without hand-written schema that drifts from the code.

## Conventions

### Use this endpoint layout

```text
{ProjectName}.WebApi/
  Endpoints/
    Posts/                          single aggregate: operations directly under the module
      CreateDraft/
        CreateDraftEndpoint.cs
        CreateDraftRequestModel.cs
        CreateDraftResponseModel.cs
        CreateDraftApiMappings.cs
      GetPost/
        GetPostEndpoint.cs
        GetPostResponseModel.cs
        GetPostApiMappings.cs
    Audience/                       two aggregates: operations nest under each aggregate
      BuyerAccount/
        RestrictAccount/
          RestrictAccountEndpoint.cs
          RestrictAccountRequestModel.cs
          RestrictAccountApiMappings.cs
      Consent/
        GrantConsent/
          GrantConsentEndpoint.cs
          GrantConsentRequestModel.cs
          GrantConsentApiMappings.cs
  Errors/
    GlobalExceptionHandler.cs
    ProblemDetailsApiMappings.cs
  Security/
    CurrentActor.cs
  OpenApi/
  Program.cs
```

Endpoint folders follow `ARCH.MODULES.001`: module, then aggregate, then use case. A single-aggregate module nests use-case folders directly under the module; a module with more than one aggregate nests them under the aggregate.

### Keep transport models independent

Request and response models use JSON and OpenAPI concerns. Their names end in `RequestModel` and `ResponseModel` so they cannot be mistaken for behavior or rich business objects. A response collection item uses `{UseCase}ResponseItemModel`; pagination metadata uses `PaginationModel`. Other project-owned, passive HTTP DTOs name their concrete boundary role and end in `Model`. Application messages and results remain transport-neutral. Explicit mapping may be a small method or an internal static class ending in `ApiMappings`.

### Name routes from resources

Examples:

```text
POST   /api/posts
GET    /api/posts/{postId}
POST   /api/posts/{postId}/publication
GET    /api/posts?after={cursor}&limit=20
```

Use action segments only when the operation does not map cleanly to a resource or subresource.

### Keep numeric transport types precise

A numeric response or request field emits an OpenAPI schema that matches its real type. An `int32` or `double` field emits a plain numeric type, not a `number` or `string` union. Reserve the string-or-number union for `int64` and other values that can exceed the safe integer range of a JavaScript consumer, where the string form is the deliberate wire representation. An over-broad union (for example emitting `["integer","string"]` for a small integer) forces every consumer to coerce a value that was never a string, so keep the schema tight at the source rather than widening it and pushing coercion downstream.

### Keep Program.cs as composition

`Program.cs` registers approved modules, middleware order, endpoint discovery, health endpoints, OpenAPI, and host startup. Move coherent registration into layer-owned extension methods without hiding order-sensitive middleware.

Keep the visible middleware order: forwarded headers from explicitly trusted proxies when the deployment boundary requires them, exception handling, transport security, authentication, authorization, endpoint mapping, and health mapping. Map OpenAPI and Scalar only in Development. End `Program.cs` with an empty `public partial class Program` so the integration test host can target the real entry point.

## Examples

A create endpoint reads the author from claims, maps `CreateDraftRequestModel` to `CreateDraftCommand` through `CreateDraftApiMappings`, sends it through `ICommandMediator`, and maps `CreateDraftCommandResult` to `CreateDraftResponseModel` with the new post location. A read endpoint maps `GetPostQueryResult` to `GetPostResponseModel` through `GetPostApiMappings`. Neither endpoint calls `Post.CreateDraft` or `IPostRepository`.

## Verification

- Inspect endpoint constructors and bodies for forbidden dependencies and business logic.
- Confirm every passive HTTP DTO names its concrete boundary role and ends in `Model`; confirm operation mappings end in `ApiMappings`.
- Compare routes and status codes with use-case specifications and OpenAPI.
- Test validation, authentication, authorization, missing resources, conflicts, and success through `WebApplicationFactory`.
- Validate the exact Problem Details and pagination JSON shapes.
- Regenerate OpenAPI and typed consumers.
- Confirm the generated document declares a security scheme and requirement for every operation that enforces authentication, and none for intentionally anonymous operations.
- Confirm closed-set fields and parameters declare enums, parameters declare their bounds and formats, and every operation that requires a control header declares it.
- Generate OpenAPI twice and confirm the second run is clean.
- Run architecture tests for endpoint boundaries.
