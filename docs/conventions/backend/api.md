# HTTP API

## Intent


WebApi is a thin transport adapter. It maps HTTP input to Application messages, dispatches through the specific mediator, and maps results to stable HTTP contracts. Business rules, persistence access, and provider behavior remain outside endpoints.

## Agent Summary {#agent-summary}


- Use one endpoint per operation. (API.ENDPOINTS.001)
- Keep endpoint dependencies transport-focused. (API.BOUNDARY.001)
- Derive authenticated identity from claims. (API.ACTOR.001)
- Authorize the target resource. (API.AUTHZ.001)
- Return stable Problem Details. (API.ERRORS.001)
- Use consistent status codes. (API.STATUS.001)
- Keep routes resource-oriented. (API.ROUTES.001)
- Bound collection queries. (API.PAGING.001)
- Treat OpenAPI as a generated contract. (API.OPENAPI.001)
- Reflect enforced authentication in the contract. (API.OPENAPI.002)

## Standards


### Use one endpoint per operation (API.ENDPOINTS.001)

**Requirement:** Web APIs MUST use one endpoint per operation.

**Rationale:** Each endpoint implements `IEndpoint`, maps one route operation, converts transport input to an Application message, dispatches through `ICommandMediator` or `IQueryMediator`, and maps the result.

The implementation names its passive HTTP DTOs `{UseCase}RequestModel` and `{UseCase}ResponseModel`. The implementation names an operation-specific mapping class `{UseCase}ApiMappings`.

MVC controllers and `ControllerBase` are outside this profile.

**Example:** The WebApi project owns this contract:

```csharp
internal interface IEndpoint
{
    void MapEndpoint(IEndpointRouteBuilder endpoints);
}
```

At startup, WebApi discovers non-abstract `IEndpoint` implementations in its assembly. It registers each implementation once as an `IEndpoint` singleton. It calls `MapEndpoint` in deterministic type-name order. The discovery code uses framework reflection and dependency injection. It does not require another scanning package. An integration test reads mapped endpoint data and fails for duplicate HTTP method and route combinations.

### Keep endpoint dependencies transport-focused (API.BOUNDARY.001)

**Requirement:** Web APIs MUST keep endpoint dependencies transport-focused.

**Rationale:** Endpoint route-handler parameters may receive mediators and HTTP-boundary services such as an actor accessor. Endpoint classes have no scoped constructor dependency because routes are mapped from the root application at startup. They cannot receive aggregate repositories, Marten sessions, DbContext, provider SDKs, or broad application services.

Endpoints do not catch known application exceptions. Global exception handling owns error mapping.

### Derive authenticated identity from claims (API.ACTOR.001)

**Requirement:** Web APIs MUST derive authenticated identity from claims.

**Rationale:** When the authenticated user is the actor, derive the actor ID from verified claims. The implementation does not accept it from the body, form, route, query, or client-controlled header.

An administrator acting on another resource uses a separate target ID and authorization policy. The administrator identity still comes from claims.

### Authorize the target resource (API.AUTHZ.001)

**Requirement:** Web APIs MUST authorize the target resource.

**Rationale:** Authentication alone does not authorize an operation. The implementation verifies role, ownership, tenant, state, or policy against the target resource before returning protected data or changing state.

The implementation uses a stable forbidden or not-found policy when revealing resource existence would leak information.

### Return stable Problem Details (API.ERRORS.001)

**Requirement:** Web APIs MUST return stable Problem Details.

**Rationale:** Error responses use RFC Problem Details plus:

- `code`: stable application error code.
- `traceId`: current distributed trace identifier.
- `errors`: validation entries with field, code, and safe message.

The implementation does not expose exception messages, stack traces, SQL, provider bodies, or secrets.

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

The example uses ASP.NET Core `AddProblemDetails` and one `IExceptionHandler`. The example maps validation exceptions to 400. The example maps missing targets through the operation's 404 policy. The example maps forbidden failures to 403 or the declared 404 disclosure policy.

The example maps conflicts and state rejections to 409. The example maps unexpected exceptions to 500 with code `internal_error`. The example does not report cancellation from a disconnected request as an application error. The example maps known Domain exception types individually.

### Use consistent status codes (API.STATUS.001)

**Requirement:** Web APIs MUST use consistent status codes.

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

The example does not return 200 for a documented error.

### Keep routes resource-oriented (API.ROUTES.001)

**Requirement:** Web APIs MUST keep routes resource-oriented.

**Rationale:** The implementation uses lowercase plural resource segments and kebab-case subresources. The implementation uses route parameters for resource identity, query parameters for filtering and pagination, and request bodies for command data.

The implementation does not place the authenticated actor ID in the route unless the actor is intentionally addressing another actor as a resource.

### Bound collection queries (API.PAGING.001)

**Requirement:** Web APIs MUST bound collection queries.

**Rationale:** Every collection endpoint has deterministic ordering, a default limit of 20. A maximum limit of 100 unless an accepted use case declares a smaller bound. The baseline request uses `after` as an opaque cursor and `limit` as a positive integer. Fetch one more record than the requested limit to determine whether another page exists.

**Example:** The response uses one shape:

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

The cursor contains a version and the last stable sort values, including a unique tie-breaker. The example treats it as untrusted input and return 400 with code `invalid_cursor` when it is malformed or unsupported. The example does not place sensitive values in a readable cursor. An implementation may use an offset for a proven bounded dataset. The public profile contract remains opaque unless a consumer convention replaces this rule across its API.

### Treat OpenAPI as a generated contract (API.OPENAPI.001)

**Requirement:** Web APIs MUST treat OpenAPI as a generated contract.

**Rationale:** The implementation generates OpenAPI during the Release build. The implementation commits the artifact when a frontend or external consumer uses it. Generated TypeScript types change with the artifact. CI fails when committed output differs.

Scalar may expose API documentation in Development. Hosted environments do not expose development tooling by default.

The API source artifact is `apps/api/openapi/{ProjectName}.json`. WebApi references `Microsoft.AspNetCore.OpenApi` and `Microsoft.Extensions.ApiDescription.Server`, enables `OpenApiGenerateDocuments`, sets `OpenApiDocumentsDirectory` to that directory, and passes `--file-name {ProjectName}` through `OpenApiGenerateDocumentsOptions`. Build-time generation starts the entry point without contacting hosted dependencies or running schema changes.

Every operation sets a stable name through `WithName`, which becomes `operationId`, and declares authorization, request, success, and Problem Details response metadata. The implementation uses typed results or `Produces` metadata so the generated document contains every documented status. The implementation adds explicit summaries and descriptions or enables XML documentation on named handler methods. Comments on route lambdas are not contract documentation.

When TypeScript consumes the API, the pinned `openapi-typescript` executable reads the source artifact. A single frontend writes generated types under `apps/{frontend}/lib/api/generated/`. Multiple consumers use `packages/api-types/src/`. The implementation runs generation from a clean Release build and fails when a second generation changes committed files.

### Reflect enforced authentication in the contract (API.OPENAPI.002)

**Requirement:** Web APIs MUST reflect enforced authentication in the contract.

**Rationale:** When endpoints enforce authentication, generated OpenAPI declares the corresponding security scheme and per-operation security requirement. Claims-derived actors and missing-claim responses follow `API.ACTOR.001`. Consumers learn an operation's authentication requirement from the contract, not from a runtime 401.

The implementation registers an OpenAPI document transformer that reads registered authentication schemes, such as through `IAuthenticationSchemeProvider`. The transformer adds matching `securitySchemes` and `security` entries. Handwritten security metadata can drift from registered schemes. An intentionally anonymous operation declares no security requirement. Runtime authorization without a declared scheme is a defect. The contract and enforced behavior agree.

### Publish precise, complete schemas (API.OPENAPI.003)

**Requirement:** Web APIs MUST publish precise, complete schemas.

**Rationale:** The generated contract expresses the real shape and constraints of each operation, not only its base types. A consumer learns an operation's rules from the document rather than by receiving a runtime rejection.

- The implementation publishes a typed shape for any field or parameter with a closed value set.
- A label-only set publishes its values as an OpenAPI `enum`.
- Data-bearing cases publish polymorphic `oneOf` models with discriminators (`API.MODELS.001`). The implementation does not flatten their data into an `enum`.
- Domain models either set without an enum (`DOMAIN.CLOSEDSET.001`).
- Boundary types or schema transformers produce the transport shape.
- A named boundary enum carries `[JsonConverter(typeof(JsonStringEnumConverter<T>))]` on its type.
- Every serializer honors the contract, including test clients using default options.
- Host-only conversion breaks readers that do not share host configuration.
- A parameter declares bounds, format, allowed values, and descriptions for business limits whose meaning is not explicit. A caller learns each limit before receiving a 400.
- An operation that requires a control header declares it as a required parameter, for example `Idempotency-Key` or `If-Match`. The requirement is discoverable and consistent across the operations that share it.

The implementation prefers typed results, typed boundary enums, and parameter metadata. These sources keep generated documents precise without handwritten schemas that drift from code.

### Mirror a Domain closed set as a transport model of the same shape (API.MODELS.001)

**Requirement:** Web APIs MUST mirror a Domain closed set as a transport model of the same shape.

**Rationale:** A Domain closed set can be a state hierarchy or discriminated union (`DOMAIN.CLOSEDSET.001`). A WebApi-owned transport model preserves that set's shape. It does not discard information carried by Domain.

The transport shape matches whether the cases carry data:

- A label-only set (each case is a name with no per-case data) maps to a string `enum` per `API.OPENAPI.003`.
- A data-bearing set maps to a polymorphic transport model. Its abstract base has one sealed derived model per case. OpenAPI publishes it as `oneOf` with a discriminator.

Consistency over premature narrowing. WebApi owns its transport model instead of serializing a Domain union or Application result directly (`ARCH.CONTRACTS.001`). Application owns its result shape (`APP.CLOSEDSET.001`). Each layer mirrors the same set.

The implementation does not collapse a data-bearing union into an `enum`. The implementation does not reuse another layer's type as the wire contract. Narrowing requires a decision and an updated specification. Narrow only for a proven stable shape or a confirmed label-only union.

The polymorphic transport type uses `System.Text.Json` polymorphism so the serializer and generated contract agree:

- Declare an abstract base record and one sealed record per case. An abstract base is required for the generated document to carry the discriminator. A concrete base cannot mark the discriminator property as required. The contract omits it.
- The implementation puts `[JsonPolymorphic]` on the base type.
- The implementation puts one `[JsonDerivedType(typeof(CaseModel), "case-code")]` per case on the base type.
- Carry this metadata on the type, not only in host options (`API.OPENAPI.003`).
- The implementation uses string discriminators equal to the Domain union's stable case codes (`DOMAIN.CLOSEDSET.001`).
- Never use integer discriminators or mix discriminator forms.
- The implementation treats discriminator strings as contract values that identifier renames cannot change (`naming.md`).
- The implementation names the discriminator for its concept through `[JsonPolymorphic(TypeDiscriminatorPropertyName = "...")]`.
- The implementation uses a name such as `type` or `outcome`. The implementation does not publish the serializer default `$type`.
- Opt derived types in explicitly. An unregistered runtime subtype fails serialization. That failure is correct, because it means the contract and the model disagreed.

The generated OpenAPI model uses `oneOf` with a `discriminator`. The discriminator declares `propertyName`, maps each case code, and is required on every case.

The generator can omit the discriminator or required marker. A document or schema transformer completes missing metadata. The implementation does not handwrite the complete schema. The source change regenerates the document and typed consumers (`API.OPENAPI.001`).

## Conventions


### Use this endpoint layout (API.CONVENTION.001)

**Default:** Use this endpoint layout.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Example:**

```text
{ProjectName}.WebApi/
  Endpoints/
    Posts/                          single aggregate whose name matches the module: operations directly under the module
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

Endpoint folders follow `ARCH.MODULES.001`: module, then aggregate, then use case. A single-aggregate module nests use-case folders directly under the module only when the aggregate root's plural name equals the module name. Otherwise, and for any module with more than one aggregate, use-case folders nest under the aggregate.

### Keep transport models independent (API.CONVENTION.002)

**Default:** Keep transport models independent.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Request and response models use JSON and OpenAPI concerns. Their names end in `RequestModel` and `ResponseModel`. A response collection item uses `{UseCase}ResponseItemModel`. Pagination metadata uses `PaginationModel`.

Other passive HTTP DTOs name their boundary role and end in `Model`. Application messages and results remain transport-neutral. Explicit mapping can use an internal `ApiMappings` class.

### Name routes from resources (API.CONVENTION.003)

**Default:** Name routes from resources.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Example:**

```text
POST   /api/posts
GET    /api/posts/{postId}
POST   /api/posts/{postId}/publication
GET    /api/posts?after={cursor}&limit=20
```

The example uses action segments only when the operation does not map cleanly to a resource or subresource.

### Keep numeric transport types precise (API.CONVENTION.004)

**Default:** Keep numeric transport types precise.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A numeric request or response field emits an OpenAPI schema matching its real type. An `int32` or `double` field emits a plain numeric type, not a string union. Reserve string-or-number unions for `int64` and values exceeding JavaScript's safe integer range. Their string form is a deliberate wire representation. An over-broad union forces consumers to coerce values that were never strings. The implementation keeps the source schema precise instead of pushing coercion downstream.

### Keep Program.cs as composition (API.CONVENTION.005)

**Default:** Keep Program.cs as composition.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** `Program.cs` registers approved modules, middleware order, endpoint discovery, health endpoints, OpenAPI, and host startup. The implementation moves coherent registration into layer-owned extension methods without hiding order-sensitive middleware.

The implementation keeps this visible order: trusted forwarded headers, exception handling, transport security, authentication, authorization, endpoints, then health. The implementation includes forwarded headers only when the deployment boundary requires trusted proxies. The implementation maps OpenAPI and Scalar only in Development. End `Program.cs` with an empty `public partial class Program` so the integration test host can target the real entry point.

## Reference example

This informative example demonstrates `API.BOUNDARY.001` and `API.MODELS.001`.

A create endpoint reads the author from claims. It maps `CreateDraftRequestModel` to `CreateDraftCommand` through `CreateDraftApiMappings`. It sends the command through `ICommandMediator`. It maps `CreateDraftCommandResult` to `CreateDraftResponseModel` with the new post location. A read endpoint maps `GetPostQueryResult` through `GetPostApiMappings`. Neither endpoint calls `Post.CreateDraft` or `IPostRepository`.

### Mirror a data-bearing closed set from Domain to the wire

A refund outcome is a closed set whose cases carry different data. It is modeled once in Domain and mirrored, not reused, in each outer layer per `API.MODELS.001`, `APP.CLOSEDSET.001`, and `ARCH.CONTRACTS.001`.

Domain owns the union, aggregate-anchored per `NAME.AGGREGATE.001`, with a stable code that round-trips (`DOMAIN.CLOSEDSET.001`). The code blocks omit namespaces and documentation for focus.

```csharp
public abstract record PaymentRefundOutcome
{
    public abstract string Code { get; }
}

public sealed record PaymentRefundSucceededOutcome(Money Amount, DateOnly SettledOn)
    : PaymentRefundOutcome
{
    public override string Code => "Succeeded";
}

public sealed record PaymentRefundFailedOutcome(string ReasonCode) : PaymentRefundOutcome
{
    public override string Code => "Failed";
}
```

Application returns its own union in the result. The Domain union type never appears on the message; `Money` is a Shared-kernel value object and may cross (`ARCH.CONTRACTS.001`). The handler projects the Domain union to the Application union.

```csharp
public abstract record RefundOutcome;

public sealed record RefundSucceeded(Money Amount, DateOnly SettledOn) : RefundOutcome;

public sealed record RefundFailed(string ReasonCode) : RefundOutcome;

public sealed record IssueRefundCommandResult(RefundOutcome Outcome);

// In the handler, after domain behavior returns a PaymentRefundOutcome:
RefundOutcome outcome = domainOutcome switch
{
    PaymentRefundSucceededOutcome s => new RefundSucceeded(s.Amount, s.SettledOn),
    PaymentRefundFailedOutcome f => new RefundFailed(f.ReasonCode),
    _ => throw new UnreachableException(),
};
```

WebApi owns the transport model. The polymorphism sits on the type, the discriminator values equal the Domain stable codes. The wire reduces even the Shared-kernel `Money` to primitives. The response model reuses no Application or Domain type.

```csharp
[JsonPolymorphic(TypeDiscriminatorPropertyName = "outcome")]
[JsonDerivedType(typeof(RefundSucceededOutcomeModel), "Succeeded")]
[JsonDerivedType(typeof(RefundFailedOutcomeModel), "Failed")]
public abstract record RefundOutcomeModel;

public sealed record RefundSucceededOutcomeModel(
    decimal Amount,
    string Currency,
    DateOnly SettledOn) : RefundOutcomeModel;

public sealed record RefundFailedOutcomeModel(string ReasonCode) : RefundOutcomeModel;

public sealed record IssueRefundResponseModel(RefundOutcomeModel Outcome);

internal static class IssueRefundApiMappings
{
    public static RefundOutcomeModel ToModel(this RefundOutcome outcome) => outcome switch
    {
        RefundSucceeded s => new RefundSucceededOutcomeModel(
            s.Amount.Amount, s.Amount.Currency.Code, s.SettledOn),
        RefundFailed f => new RefundFailedOutcomeModel(f.ReasonCode),
        _ => throw new UnreachableException(),
    };
}
```

The generated document expresses the model as `oneOf` with a discriminator mapping the codes to the case schemas:

```json
{
  "oneOf": [
    { "$ref": "#/components/schemas/RefundSucceededOutcomeModel" },
    { "$ref": "#/components/schemas/RefundFailedOutcomeModel" }
  ],
  "discriminator": {
    "propertyName": "outcome",
    "mapping": {
      "Succeeded": "#/components/schemas/RefundSucceededOutcomeModel",
      "Failed": "#/components/schemas/RefundFailedOutcomeModel"
    }
  }
}
```

When the pinned generator omits a required discriminator marker, a schema transformer completes it. Do not handwrite the schema. The exact transformer surface follows the pinned `Microsoft.AspNetCore.OpenApi` version. This shape is illustrative.

```csharp
internal sealed class RequireDiscriminatorSchemaTransformer : IOpenApiSchemaTransformer
{
    public Task TransformAsync(
        OpenApiSchema schema,
        OpenApiSchemaTransformerContext context,
        CancellationToken cancellationToken)
    {
        if (schema.Discriminator?.PropertyName is { } name && !schema.Required.Contains(name))
        {
            schema.Required.Add(name);
        }

        return Task.CompletedTask;
    }
}

// Registered with the document:
builder.Services.AddOpenApi(options =>
    options.AddSchemaTransformer<RequireDiscriminatorSchemaTransformer>());
```

A TypeScript consumer generated from this document receives a discriminated union it narrows on `outcome`. The caller handles the succeeded and failed cases without reading an open string. Regenerating the document and typed clients is part of the change (`API.OPENAPI.001`).

## Verification


| ID | Method | Evidence |
|:---|:---|:---|
| API.ENDPOINTS.001 | operation | The release record captures the observed `use one endpoint per operation` result and owning operation. |
| API.BOUNDARY.001 | inspection | Pull request review asserts `keep endpoint dependencies transport-focused` in the owning specification and source paths. |
| API.ACTOR.001 | inspection | Pull request review asserts `derive authenticated identity from claims` in the owning specification and source paths. |
| API.AUTHZ.001 | inspection | Pull request review asserts `authorize the target resource` in the owning specification and source paths. |
| API.ERRORS.001 | inspection | Pull request review asserts `return stable Problem Details` in the owning specification and source paths. |
| API.STATUS.001 | inspection | Pull request review asserts `use consistent status codes` in the owning specification and source paths. |
| API.ROUTES.001 | inspection | Pull request review asserts `keep routes resource-oriented` in the owning specification and source paths. |
| API.PAGING.001 | inspection | Pull request review asserts `bound collection queries` in the owning specification and source paths. |
| API.OPENAPI.001 | inspection | Pull request review asserts `treat OpenAPI as a generated contract` in the owning specification and source paths. |
| API.OPENAPI.002 | inspection | Pull request review asserts `reflect enforced authentication in the contract` in the owning specification and source paths. |
| API.OPENAPI.003 | inspection | Pull request review asserts `publish precise, complete schemas` in the owning specification and source paths. |
| API.MODELS.001 | inspection | Pull request review asserts `mirror a Domain closed set as a transport model of the same shape` in the owning specification and source paths. |
| API.CONVENTION.001 | inspection | Pull request review asserts `use this endpoint layout` in the owning specification and source paths. |
| API.CONVENTION.002 | inspection | Pull request review asserts `keep transport models independent` in the owning specification and source paths. |
| API.CONVENTION.003 | static | Repository static check asserts `name routes from resources` for the owning paths. |
| API.CONVENTION.004 | inspection | Pull request review asserts `keep numeric transport types precise` in the owning specification and source paths. |
| API.CONVENTION.005 | inspection | Pull request review asserts `keep Program.cs as composition` in the owning specification and source paths. |
