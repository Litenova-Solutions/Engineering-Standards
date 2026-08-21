# HTTP API

## Intent

WebApi is a thin transport adapter. It maps HTTP input to Application messages, dispatches through the specific mediator, and maps results to stable HTTP contracts. Business rules, persistence access, and provider behavior remain outside endpoints.

## Agent Summary {#agent-summary}

- One class per operation implements `IEndpoint` and dispatches through its mediator. (API.ENDPOINTS.001)
- Endpoints receive mediators and HTTP-boundary services only. (API.BOUNDARY.001)
- Actor identity comes from verified claims, never from the request. (API.ACTOR.001, API.ACTOR.002)
- Authorization checks the target resource, not only authentication. (API.AUTHZ.001)
- Errors return Problem Details with a stable code and trace identifier. (API.ERRORS.001)
- Error responses carry no exception, stack, SQL, provider, or secret text. (API.ERRORS.002)
- Collection reads carry deterministic ordering and a bounded limit. (API.PAGING.001)
- OpenAPI is generated during the Release build and committed when consumed. (API.OPENAPI.001)
- The contract declares the authentication that endpoints enforce. (API.OPENAPI.002)
- Transport models mirror the shape of the Domain closed set they carry. (API.MODELS.001, API.MODELS.002)

## Standards

### Use one endpoint per operation (API.ENDPOINTS.001)

**Requirement:** A WebApi endpoint MUST implement `IEndpoint`, map one route operation, convert input to an Application message, dispatch through its mediator, and map the result.

**Rationale:** One class per operation gives each route a single owner and keeps the transport boundary reviewable.

**Example:** The WebApi project owns this contract:

```csharp
internal interface IEndpoint
{
    void MapEndpoint(IEndpointRouteBuilder endpoints);
}
```

At startup, WebApi discovers non-abstract `IEndpoint` implementations in its assembly. It registers each implementation once as an `IEndpoint` singleton. It calls `MapEndpoint` in deterministic type-name order. The discovery code uses framework reflection and dependency injection. It does not require another scanning package.

### Exclude MVC controllers from the profile (API.ENDPOINTS.002)

**Requirement:** A WebApi project MUST NOT route requests through MVC controllers or `ControllerBase`.

**Rationale:** A second transport pattern splits routing, filters, and error mapping across two models that behave differently.

### Keep endpoint dependencies transport-focused (API.BOUNDARY.001)

**Requirement:** An endpoint route handler MUST NOT receive an aggregate repository, a Marten session, a `DbContext`, a provider SDK, or a broad application service.

**Rationale:** Endpoint classes are mapped from the root application at startup, so they hold no scoped dependency. Route-handler parameters may still receive mediators and HTTP-boundary services such as an actor accessor.

### Defer error mapping to the global handler (API.BOUNDARY.002)

**Requirement:** An endpoint MUST NOT catch a known application exception.

**Rationale:** One global handler produces every error response, so a caught exception at the endpoint creates a second, divergent mapping.

### Derive authenticated identity from claims (API.ACTOR.001)

**Requirement:** A WebApi endpoint MUST read the authenticated actor identifier from verified claims.

**Rationale:** Verified claims are the only part of a request that the caller cannot choose.

**Example:** An administrator acting on another resource passes a separate target identifier and satisfies its authorization policy. The administrator identity still comes from claims.

### Reject a client-supplied actor identifier (API.ACTOR.002)

**Requirement:** A WebApi endpoint MUST NOT read the authenticated actor identifier from the body, form, route, query, or a client-controlled header.

**Rationale:** Any request-controlled source lets a caller act as another actor.

### Authorize the target resource (API.AUTHZ.001)

**Requirement:** A WebApi endpoint MUST verify role, ownership, tenant, state, or policy against the target resource before it returns protected data or changes state.

**Rationale:** Authentication establishes who is calling. It does not establish that the caller may act on this specific resource.

**Example:** An operation applies a stable forbidden or not-found policy when revealing that a resource exists would leak information.

### Return stable Problem Details (API.ERRORS.001)

**Requirement:** An error response MUST use RFC Problem Details carrying a stable application `code`, the current `traceId`, and an `errors` entry for each field failure.

**Rationale:** A stable machine-readable code lets a client branch on the failure, and the trace identifier connects the response to its diagnostics.

**Example:** The serialized contract is:

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

The example uses ASP.NET Core `AddProblemDetails` and one `IExceptionHandler`. It maps validation exceptions to 400, missing targets through the operation's 404 policy, and forbidden failures to 403 or the declared 404 disclosure policy. It maps conflicts and state rejections to 409, and unexpected exceptions to 500 with code `internal_error`. It maps known Domain exception types individually. It does not report cancellation from a disconnected request as an application error.

### Keep error responses free of internal detail (API.ERRORS.002)

**Requirement:** An error response MUST NOT contain an exception message, a stack trace, SQL, a provider response body, or a secret.

**Rationale:** Error paths are the most common accidental disclosure route, because internal text reaches them without passing a response model.

### Use consistent status codes (API.STATUS.001)

**Requirement:** A WebApi operation MUST return the status code that its outcome table assigns.

**Rationale:** A client branches on status before it reads a body, so an inconsistent code hides the outcome.

**Example:**

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

### Reject a success status for a failed outcome (API.STATUS.002)

**Requirement:** A WebApi operation MUST NOT return 200 for a documented error.

**Rationale:** A success status with an error body forces every client to parse the body before it knows the outcome.

### Keep routes resource-oriented (API.ROUTES.001)

**Requirement:** A route MUST use lowercase plural resource segments, kebab-case subresources, route parameters for identity, query parameters for filtering, and the body for command data.

**Rationale:** A predictable route shape lets a caller derive an unfamiliar operation from a familiar one.

**Example:** A route carries the authenticated actor identifier only when that actor is intentionally addressing another actor as a resource.

### Bound collection queries (API.PAGING.001)

**Requirement:** A collection endpoint MUST apply deterministic ordering, a default limit of 20, and a declared maximum limit of 100 or lower.

**Rationale:** An unbounded collection read turns one caller into a source of unbounded database and serialization work. An accepted use case may declare a smaller maximum.

**Example:** The baseline request uses `after` as an opaque cursor and `limit` as a positive integer. The implementation fetches one record beyond the requested limit to determine whether another page exists. The response uses one shape:

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

The cursor contains a version and the last stable sort values, including a unique tie-breaker. The example treats it as untrusted input and returns 400 with code `invalid_cursor` when it is malformed or unsupported. It places no sensitive value in a readable cursor. An implementation may use an offset for a proven bounded dataset. The public profile contract remains opaque unless a consumer convention replaces this rule across its API.

### Treat OpenAPI as a generated contract (API.OPENAPI.001)

**Requirement:** A WebApi project MUST generate its OpenAPI document during the Release build.

**Rationale:** A handwritten contract drifts from the code it describes.

**Example:** The API source artifact is `apps/api/openapi/{ProjectName}.json`. WebApi references `Microsoft.AspNetCore.OpenApi` and `Microsoft.Extensions.ApiDescription.Server`, enables `OpenApiGenerateDocuments`, sets `OpenApiDocumentsDirectory` to that directory, and passes `--file-name {ProjectName}` through `OpenApiGenerateDocumentsOptions`. Build-time generation starts the entry point without contacting hosted dependencies or running schema changes.

Every operation sets a stable name through `WithName`, which becomes `operationId`, and declares authorization, request, success, and Problem Details response metadata. The implementation uses typed results or `Produces` metadata so the generated document contains every documented status. It adds explicit summaries and descriptions, or enables XML documentation on named handler methods. Comments on route lambdas are not contract documentation.

When TypeScript consumes the API, the pinned `openapi-typescript` executable reads the source artifact. A single frontend writes generated types under `apps/{frontend}/lib/api/generated/`. Multiple consumers use `packages/api-types/src/`. Scalar may expose API documentation in Development, and hosted environments do not expose development tooling by default.

### Commit the generated contract its consumers read (API.OPENAPI.004)

**Requirement:** A WebApi project MUST commit its generated OpenAPI artifact when a frontend or external consumer reads it.

**Rationale:** A committed artifact makes every contract change visible in review and lets CI fail on an unregenerated document.

### Reflect enforced authentication in the contract (API.OPENAPI.002)

**Requirement:** A generated OpenAPI document MUST declare the security scheme and per-operation security requirement for every endpoint that enforces authentication.

**Rationale:** A consumer that learns an authentication requirement from a runtime 401 has already built the wrong client.

**Example:** The implementation registers a document transformer that reads registered authentication schemes through `IAuthenticationSchemeProvider` and adds the matching `securitySchemes` and `security` entries. Handwritten security metadata drifts from registered schemes. An intentionally anonymous operation declares no security requirement.

### Publish precise, complete schemas (API.OPENAPI.003)

**Requirement:** A generated schema MUST declare the closed value set, bounds, format, and required control headers of each field and parameter it describes.

**Rationale:** A caller learns an operation's limits from the document instead of discovering them through a runtime rejection.

**Example:** A label-only set publishes its values as an OpenAPI `enum`. A data-bearing set publishes a polymorphic `oneOf` model with a discriminator per `API.MODELS.001`. A named boundary enum carries `[JsonConverter(typeof(JsonStringEnumConverter<T>))]` on its type, so every serializer honors the contract, including a test client using default options. Host-only conversion breaks readers that do not share host configuration.

An operation requiring a control header declares it as a required parameter, for example `Idempotency-Key` or `If-Match`. The implementation prefers typed results, typed boundary enums, and parameter metadata over handwritten schemas that drift from code.

### Mirror a Domain closed set as a transport model of the same shape (API.MODELS.001)

**Requirement:** A WebApi transport model for a Domain closed set MUST preserve the shape of that set.

**Rationale:** A transport shape that differs from its Domain set discards information the Domain carries.

**Example:** A label-only set maps to a string `enum`. A data-bearing set maps to an abstract base record with one sealed record per case, published as `oneOf` with a discriminator. The polymorphic type uses `System.Text.Json` polymorphism so the serializer and generated contract agree:

- Declare an abstract base record, because a concrete base cannot mark the discriminator property as required.
- Put `[JsonPolymorphic]` and one `[JsonDerivedType(typeof(CaseModel), "case-code")]` per case on the base type.
- Carry this metadata on the type, not only in host options.
- Use string discriminators equal to the Domain union's stable case codes.
- Name the discriminator through `[JsonPolymorphic(TypeDiscriminatorPropertyName = "...")]`, using a name such as `type` or `outcome`.
- Opt derived types in explicitly, so an unregistered runtime subtype fails serialization.

Discriminator strings are contract values that an identifier rename cannot change. Never use integer discriminators or mix discriminator forms. Narrowing a set requires a decision and an updated specification. A document or schema transformer completes discriminator metadata that the generator omits, and the source change regenerates the document and typed consumers per `API.OPENAPI.001`.

### Reject a collapsed or borrowed wire contract (API.MODELS.002)

**Requirement:** A WebApi transport model MUST NOT collapse a data-bearing set into an `enum` or reuse a Domain or Application type as the wire contract.

**Rationale:** Each layer owns its own contract type per `ARCH.CONTRACTS.001`. Narrowing a set requires a decision and an updated specification.

## Conventions

### Use this endpoint layout (API.CONVENTION.001)

**Default:** Group endpoint folders by module, then aggregate, then use case, following `ARCH.MODULES.001`.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** The folder path matches the specification path, so a reader locates an operation from its use-case identifier.

**Example:**

```text
{ProjectName}.WebApi/
  Endpoints/
    Posts/                          single aggregate whose name matches the module
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
      BuyerAccounts/
        RestrictAccount/
          RestrictAccountEndpoint.cs
          RestrictAccountRequestModel.cs
          RestrictAccountApiMappings.cs
      Consents/
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

A single-aggregate module nests use-case folders directly under the module only when the aggregate root's plural name equals the module name. Otherwise, and for any module with more than one aggregate, use-case folders nest under the aggregate.

### Keep transport models independent (API.CONVENTION.002)

**Default:** Name request and response models `{UseCase}RequestModel` and `{UseCase}ResponseModel`, a collection item `{UseCase}ResponseItemModel`, pagination metadata `PaginationModel`, and an operation mapping class `{UseCase}ApiMappings`.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A name that ends in its boundary role keeps transport concerns out of Application messages and results.

**Example:** Another passive HTTP DTO names its boundary role and ends in `Model`.

### Name routes from resources (API.CONVENTION.003)

**Default:** Derive each route from its resource and subresource, and use an action segment only when the operation maps to neither.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Example:**

```text
POST   /api/posts
GET    /api/posts/{postId}
POST   /api/posts/{postId}/publication
GET    /api/posts?after={cursor}&limit=20
```

### Keep numeric transport types precise (API.CONVENTION.004)

**Default:** Emit a plain numeric schema for an `int32` or `double` field, and reserve a string-or-number union for `int64` values beyond the JavaScript safe integer range.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** An over-broad union forces every consumer to coerce values that were never strings.

### Keep Program.cs as composition (API.CONVENTION.005)

**Default:** Keep `Program.cs` to module registration, middleware order, endpoint discovery, health endpoints, OpenAPI, and host startup.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Order-sensitive middleware stays reviewable when one file shows the sequence.

**Example:** The visible order is trusted forwarded headers, exception handling, transport security, authentication, authorization, endpoints, then health. Forwarded headers appear only when the deployment boundary requires trusted proxies. OpenAPI and Scalar map only in Development. `Program.cs` ends with an empty `public partial class Program` so the integration test host can target the real entry point.

## Reference example

This informative example demonstrates `API.BOUNDARY.001` and `API.MODELS.001`.

A create endpoint reads the author from claims. It maps `CreateDraftRequestModel` to `CreateDraftCommand` through `CreateDraftApiMappings`. It sends the command through `ICommandMediator`. It maps `CreateDraftCommandResult` to `CreateDraftResponseModel` with the new post location. A read endpoint maps `GetPostQueryResult` through `GetPostApiMappings`. Neither endpoint calls `Post.CreateDraft` or `IPostRepository`.

A refund outcome is a closed set whose cases carry different data. Domain models it once. Application mirrors it per `APP.CLOSEDSET.001`, and WebApi mirrors it again as a polymorphic transport model rather than serializing either inner type.

## Verification

| ID | Method | Evidence |
|:---|:---|:---|
| API.ENDPOINTS.001 | test | `EndpointDiscoveryTests` asserts every mapped route resolves to one endpoint type and one mediator dispatch. |
| API.ENDPOINTS.002 | static | `WebApiArchitectureTests` asserts the assembly declares no type deriving from ControllerBase. |
| API.BOUNDARY.001 | test | `WebApiArchitectureTests` asserts no endpoint parameter resolves a repository, session, context, or provider client. |
| API.BOUNDARY.002 | static | `WebApiArchitectureTests` asserts no endpoint type catches an application or Domain exception. |
| API.ACTOR.001 | test | `ActorIdentityTests` asserts each protected operation resolves its actor from the request claims principal. |
| API.ACTOR.002 | test | `ActorIdentityTests` posts a body, query, and header actor identifier and asserts each one is ignored. |
| API.AUTHZ.001 | test | `TargetAuthorizationTests` calls each protected operation as a non-owner and asserts 403 or the declared 404. |
| API.ERRORS.001 | test | `ProblemDetailsContractTests` asserts code, traceId, and errors on a validation failure response. |
| API.ERRORS.002 | test | `ErrorDisclosureTests` asserts no error body contains an exception message, stack frame, SQL, or configured secret. |
| API.STATUS.001 | test | `StatusContractTests` asserts the outcome-table status code for each documented result. |
| API.STATUS.002 | test | `StatusContractTests` asserts every documented error path returns its declared non-success status. |
| API.ROUTES.001 | static | `RouteShapeTests` asserts lowercase plural segments, kebab-case subresources, and identity outside the body. |
| API.PAGING.001 | test | `CollectionPagingTests` asserts deterministic ordering, the default limit, and rejection above the maximum. |
| API.OPENAPI.001 | static | A Release build regenerates `apps/api/openapi/` and CI fails when regeneration changes the tree. |
| API.OPENAPI.004 | static | The committed `apps/api/openapi/` artifact exists for each consumer-read contract and CI fails on a difference. |
| API.OPENAPI.002 | test | `OpenApiSecurityTests` asserts every operation with an authorization policy declares a matching security entry. |
| API.OPENAPI.003 | test | `OpenApiSchemaTests` asserts closed-set fields publish an enum or oneOf and control headers are required. |
| API.MODELS.001 | test | `PolymorphicContractTests` round-trips every union case and asserts the discriminator equals its Domain case code. |
| API.MODELS.002 | test | `PolymorphicContractTests` asserts no data-bearing set serializes as an enum and no inner-layer type reaches the wire. |
| API.CONVENTION.001 | inspection | Endpoint folder review locates each operation under its module and aggregate, or records a named local replacement. |
| API.CONVENTION.002 | static | `TransportNamingTests` asserts each transport type ends in RequestModel, ResponseModel, Model, or ApiMappings. |
| API.CONVENTION.003 | static | `RouteShapeTests` reports each action segment for review against its resource alternatives. |
| API.CONVENTION.004 | test | `OpenApiSchemaTests` asserts each int32 and double field publishes a plain numeric schema. |
| API.CONVENTION.005 | inspection | `Program.cs` review confirms the recorded middleware order and locates registration in layer-owned extension methods. |
