# HTTP API

## Intent

WebApi is a thin transport adapter. It maps HTTP input to Application messages, dispatches through the specific mediator, and maps results to stable HTTP contracts. Business rules, persistence access, and provider behavior remain outside endpoints.

## Agent Summary {#agent-summary}

- One class per operation implements `IEndpoint` and dispatches through its mediator. (standards/rule/backend-api.use-one-endpoint-per-operation)
- Endpoints receive mediators and HTTP-boundary services only. (standards/rule/backend-api.keep-endpoint-dependencies-transport-focused)
- Actor identity comes from verified claims, never from the request. (standards/rule/backend-api.derive-authenticated-identity-from-claims, standards/rule/backend-api.reject-a-client-supplied-actor-identifier)
- Authorization checks the target resource, not only authentication. (standards/rule/backend-api.authorize-the-target-resource)
- Errors return Problem Details with a stable code and trace identifier. (standards/rule/backend-api.return-stable-problem-details)
- Error responses carry no exception, stack, SQL, provider, or secret text. (standards/rule/backend-api.keep-error-responses-free-of-internal-detail)
- Collection reads carry deterministic ordering and a bounded limit. (standards/rule/backend-api.bound-collection-queries)
- Custom methods carry transitions, and naming rules bind money and fields. (standards/rule/backend-api.state-an-unexpressible-transition-as-a-custom-method, standards/rule/backend-api.apply-patch-to-a-partial-update, standards/rule/backend-api.model-a-monetary-value-as-one-object, standards/rule/backend-api.name-transport-fields-by-one-rule-set)
- The contract is generated, committed, and declares authentication. (standards/rule/backend-api.treat-openapi-as-a-generated-contract, standards/rule/backend-api.reflect-enforced-authentication-in-the-contract)
- Transport models mirror the shape of the Domain closed set they carry. (standards/rule/backend-api.mirror-a-domain-closed-set-as-a-transport-model-of-the-same-shape, standards/rule/backend-api.reject-a-collapsed-or-borrowed-wire-contract)

## Standards

### Use one endpoint per operation (standards/rule/backend-api.use-one-endpoint-per-operation)

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

### Exclude MVC controllers from the profile (standards/rule/backend-api.exclude-mvc-controllers-from-the-profile)

**Requirement:** A WebApi project MUST NOT route requests through MVC controllers or `ControllerBase`.

**Rationale:** A second transport pattern splits routing, filters, and error mapping across two models that behave differently.

An application arriving with controllers converts them rather than keeping both. Each action becomes one endpoint under `standards/rule/backend-api.use-this-endpoint-layout`. An action filter becomes an endpoint filter or a pipeline stage. Model-state validation becomes the Application validator that `standards/rule/backend-application.separate-input-validation-from-invariants` already requires. A conversion that cannot finish in one change records a decision naming this provision and the date the last controller leaves.

### Keep endpoint dependencies transport-focused (standards/rule/backend-api.keep-endpoint-dependencies-transport-focused)

**Requirement:** An endpoint route handler MUST NOT receive an aggregate repository, a Marten session, a `DbContext`, a provider SDK, or a broad application service.

**Rationale:** Endpoint classes are mapped from the root application at startup, so they hold no scoped dependency. Route-handler parameters may still receive mediators and HTTP-boundary services such as an actor accessor.

### Defer error mapping to the global handler (standards/rule/backend-api.defer-error-mapping-to-the-global-handler)

**Requirement:** An endpoint MUST NOT catch a known application exception.

**Rationale:** One global handler produces every error response, so a caught exception at the endpoint creates a second, divergent mapping.

### Derive authenticated identity from claims (standards/rule/backend-api.derive-authenticated-identity-from-claims)

**Requirement:** A WebApi endpoint MUST read the authenticated actor identifier from verified claims.

**Rationale:** Verified claims are the only part of a request that the caller cannot choose.

**Example:** An administrator acting on another resource passes a separate target identifier and satisfies its authorization policy. The administrator identity still comes from claims.

### Reject a client-supplied actor identifier (standards/rule/backend-api.reject-a-client-supplied-actor-identifier)

**Requirement:** A WebApi endpoint MUST NOT read the authenticated actor identifier from the body, form, route, query, or a client-controlled header.

**Rationale:** Any request-controlled source lets a caller act as another actor.

### Authorize the target resource (standards/rule/backend-api.authorize-the-target-resource)

**Requirement:** A WebApi endpoint MUST verify role, ownership, tenant, state, or policy against the target resource before it returns protected data or changes state.

**Rationale:** Authentication establishes who is calling. It does not establish that the caller may act on this specific resource.

**Example:** An operation applies a stable forbidden or not-found policy when revealing that a resource exists would leak information.

A collection endpoint has no single target resource. Its authorization is the database predicate that `standards/rule/quality-security.authorize-each-target-resource` requires. The predicate applies before paging, so no page is assembled from rows the caller may not read.

### Return stable Problem Details (standards/rule/backend-api.return-stable-problem-details)

**Requirement:** An error response MUST use [RFC 9457](https://datatracker.ietf.org/doc/html/rfc9457) Problem Details carrying a stable application `code`, the current `traceId`, and an `errors` entry for each field failure.

**Rationale:** A stable machine-readable code lets a client branch on the failure, and the trace identifier connects the response to its diagnostics. RFC 9457 obsoletes RFC 7807 and now defines the media type. The contract cites the document a client implementer reads today.

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

`type` is a stable absolute URI owned by the consumer. `errors` appears only when field or message validation entries exist. `code` carries the categorised failure class, and `detail` carries the free-form prose explanation; a request body names the same pair `code` and `reason` under `standards/rule/backend-api.name-transport-fields-by-one-rule-set`. WebApi maps Application member names to their public JSON field names. `traceId` carries the trace identifier from the current [W3C Trace Context](https://www.w3.org/TR/trace-context/) `traceparent`, with the request identifier as fallback. The same shape applies to authentication and authorization failures.

The example uses ASP.NET Core `AddProblemDetails` and one `IExceptionHandler`. It maps validation exceptions to 400, missing targets through the operation's 404 policy, and forbidden failures to 403 or the declared 404 disclosure policy. It maps conflicts and state rejections to 409, and unexpected exceptions to 500 with code `internal_error`. It maps known Domain exception types individually. It does not report cancellation from a disconnected request as an application error.

### Keep error responses free of internal detail (standards/rule/backend-api.keep-error-responses-free-of-internal-detail)

**Requirement:** An error response MUST NOT contain an exception message, a stack trace, SQL, a provider response body, or a secret.

**Rationale:** Error paths are the most common accidental disclosure route, because internal text reaches them without passing a response model.

### Use consistent status codes (standards/rule/backend-api.use-consistent-status-codes)

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

### Reject a success status for a failed outcome (standards/rule/backend-api.reject-a-success-status-for-a-failed-outcome)

**Requirement:** A WebApi operation MUST NOT return 200 for a documented error.

**Rationale:** A success status with an error body forces every client to parse the body before it knows the outcome.

### Keep routes resource-oriented (standards/rule/backend-api.keep-routes-resource-oriented)

**Requirement:** A route MUST use lowercase plural resource segments, kebab-case subresources, route parameters for identity, query parameters for filtering, and the body for command data.

**Rationale:** A predictable route shape lets a caller derive an unfamiliar operation from a familiar one.

**Example:** A route carries the authenticated actor identifier only when that actor is intentionally addressing another actor as a resource.

### State an unexpressible transition as a custom method (standards/rule/backend-api.state-an-unexpressible-transition-as-a-custom-method)

**Requirement:** A WebApi route MUST express a state transition the five HTTP verbs cannot carry as a POST custom method ending in a colon-suffixed verb.

**Rationale:** [AIP-136](https://google.aip.dev/136) defines the custom-method form for actions outside the five standard methods. A path segment names a resource. A state-noun segment such as `/closure` and a bare verb segment such as `/abandon` both encode the action, so neither predicts the other. The colon marks the final segment as a command rather than a nested resource.

**Example:**

```text
POST /api/events/{eventId}:cancel
POST /api/organizations/{organizerId}:close
POST /api/orders/{orderId}/refund-requests/{refundId}:decide
```

The operationId keeps its verb-noun form, so `CancelEvent` names the same transition the path states.

### Apply PATCH to a partial update (standards/rule/backend-api.apply-patch-to-a-partial-update)

**Requirement:** A WebApi operation MUST apply a partial update with PATCH and the `application/merge-patch+json` media type.

**Rationale:** [RFC 5789](https://datatracker.ietf.org/doc/html/rfc5789) defines PATCH and [RFC 7386](https://datatracker.ietf.org/doc/html/rfc7386) defines the merge-patch media type. A PUT body for a partial change either repeats fields the caller does not change or invents merge semantics per field.

**Example:** A partial update sends only the changed members with `Content-Type: application/merge-patch+json`, and the endpoint reads the body as a sparse patch. A PUT keeps replacing the whole resource, and DELETE stays a hard-state transition.

### Use PUT for a whole replacement (standards/rule/backend-api.use-put-for-a-whole-replacement)

**Requirement:** A PUT operation MUST replace the whole resource or sub-resource its path names.

**Rationale:** A PUT body that carries a subset forces the server to choose between dropping omitted members and inventing per-field merges. The partial path is PATCH under `standards/rule/backend-api.apply-patch-to-a-partial-update`.

**Example:** A whole replacement sends every editable member, and an omitted member removes its value rather than keeping the stored one.

### Bound collection queries (standards/rule/backend-api.bound-collection-queries)

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

### Treat OpenAPI as a generated contract (standards/rule/backend-api.treat-openapi-as-a-generated-contract)

**Requirement:** A WebApi project MUST generate its OpenAPI document during the Release build.

**Rationale:** A handwritten contract drifts from the code it describes.

**Example:** The API source artifact is `apps/api/openapi/{ProjectName}.json`. WebApi references `Microsoft.AspNetCore.OpenApi` and `Microsoft.Extensions.ApiDescription.Server`, enables `OpenApiGenerateDocuments`, sets `OpenApiDocumentsDirectory` to that directory, and passes `--file-name {ProjectName}` through `OpenApiGenerateDocumentsOptions`.

Build-time generation boots the host, which is [what Microsoft's own guidance does](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/openapi/overview). A boot reaches every startup guard. A project whose composition refuses to start without a secret, a certificate, or a reachable dependency cannot generate its contract from a clean checkout. Two answers are valid, and the project records which one it uses.

| Answer | What the project does | What it costs |
|:---|:---|:---|
| Generation environment | Set an environment for the generation run whose composition wires no hosted dependency. | The generated document reflects that environment's endpoint set. |
| Deferred guard | Move each startup refusal from composition to first use. | A misconfiguration surfaces on the first request instead of at boot. |

The generation run contacts no hosted dependency and runs no schema change under either answer.

Every operation sets a stable name through `WithName`, which becomes `operationId`, and declares authorization, request, success, and Problem Details response metadata. The implementation uses typed results or `Produces` metadata so the generated document contains every documented status. It adds explicit summaries and descriptions, or enables XML documentation on named handler methods. Comments on route lambdas are not contract documentation.

When TypeScript consumes the API, the pinned `openapi-typescript` executable reads the source artifact. A single frontend writes generated types under `apps/{frontend}/lib/api/generated/`. Multiple consumers use `packages/api-types/src/`. Scalar may expose API documentation in Development, and hosted environments do not expose development tooling by default.

### Commit the generated contract its consumers read (standards/rule/backend-api.commit-the-generated-contract-its-consumers-read)

**Requirement:** A WebApi project MUST commit its generated OpenAPI artifact when a frontend or external consumer reads it.

**Rationale:** A committed artifact makes every contract change visible in review and lets CI fail on an unregenerated document.

### Reflect enforced authentication in the contract (standards/rule/backend-api.reflect-enforced-authentication-in-the-contract)

**Requirement:** A generated OpenAPI document MUST declare the security scheme and per-operation security requirement for every endpoint that enforces authentication.

**Rationale:** A consumer that learns an authentication requirement from a runtime 401 has already built the wrong client.

**Example:** The implementation registers a document transformer that reads registered authentication schemes through `IAuthenticationSchemeProvider` and adds the matching `securitySchemes` and `security` entries. Handwritten security metadata drifts from registered schemes. An intentionally anonymous operation declares no security requirement.

### Publish precise, complete schemas (standards/rule/backend-api.publish-precise-complete-schemas)

**Requirement:** A generated schema MUST declare the closed value set, bounds, format, and required control headers of each field and parameter it describes.

**Rationale:** A caller learns an operation's limits from the document instead of discovering them through a runtime rejection.

**Example:** A label-only set publishes its values as an OpenAPI `enum`. A data-bearing set publishes a polymorphic `oneOf` model with a discriminator per `standards/rule/backend-api.mirror-a-domain-closed-set-as-a-transport-model-of-the-same-shape`. A named boundary enum carries `[JsonConverter(typeof(JsonStringEnumConverter<T>))]` on its type, so every serializer honors the contract, including a test client using default options. Host-only conversion breaks readers that do not share host configuration.

An operation requiring a control header declares it as a required parameter, for example `Idempotency-Key` or `If-Match`. The implementation prefers typed results, typed boundary enums, and parameter metadata over handwritten schemas that drift from code.

### Mirror a Domain closed set as a transport model of the same shape (standards/rule/backend-api.mirror-a-domain-closed-set-as-a-transport-model-of-the-same-shape)

**Requirement:** A WebApi transport model for a Domain closed set MUST preserve the shape of that set.

**Rationale:** A transport shape that differs from its Domain set discards information the Domain carries.

**Example:** A label-only set maps to a string `enum`. A data-bearing set maps to an abstract base record with one sealed record per case, published as `oneOf` with a discriminator. The polymorphic type uses `System.Text.Json` polymorphism so the serializer and generated contract agree:

- Declare an abstract base record, because a concrete base cannot mark the discriminator property as required.
- Put `[JsonPolymorphic]` and one `[JsonDerivedType(typeof(CaseModel), "case-code")]` per case on the base type.
- Carry this metadata on the type, not only in host options.
- Use string discriminators equal to the Domain union's stable case codes.
- Name the discriminator through `[JsonPolymorphic(TypeDiscriminatorPropertyName = "...")]`, using a name such as `type` or `outcome`.
- Opt derived types in explicitly, so an unregistered runtime subtype fails serialization.

Discriminator strings are contract values that an identifier rename cannot change. Never use integer discriminators or mix discriminator forms. Narrowing a set requires a decision and an updated specification. A document or schema transformer completes discriminator metadata that the generator omits, and the source change regenerates the document and typed consumers per `standards/rule/backend-api.treat-openapi-as-a-generated-contract`.

### Reject a collapsed or borrowed wire contract (standards/rule/backend-api.reject-a-collapsed-or-borrowed-wire-contract)

**Requirement:** A WebApi transport model MUST NOT collapse a data-bearing set into an `enum` or reuse a Domain or Application type as the wire contract.

**Rationale:** Each layer owns its own contract type per `standards/rule/backend-architecture.own-each-layers-contract-types`. Narrowing a set requires a decision and an updated specification.

## Conventions

### Use this endpoint layout (standards/rule/backend-api.use-this-endpoint-layout)

**Default:** Group endpoint folders by module, then aggregate, then use case, following `standards/rule/backend-architecture.organize-every-layer-by-module-and-use-case`.

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

### Keep transport models independent (standards/rule/backend-api.keep-transport-models-independent)

**Default:** Name request and response models `{UseCase}RequestModel` and `{UseCase}ResponseModel`, a collection item `{UseCase}ResponseItemModel`, pagination metadata `PaginationModel`, and an operation mapping class `{UseCase}ApiMappings`.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A name that ends in its boundary role keeps transport concerns out of Application messages and results.

**Example:** Another passive HTTP DTO names its boundary role and ends in `Model`.

### Name routes from resources (standards/rule/backend-api.name-routes-from-resources)

**Default:** Derive each route from its resource and subresource, and use an action segment only when the operation maps to neither.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Example:**

```text
POST   /api/posts
GET    /api/posts/{postId}
POST   /api/posts/{postId}/publication
GET    /api/posts?after={cursor}&limit=20
```

### Keep numeric transport types precise (standards/rule/backend-api.keep-numeric-transport-types-precise)

**Default:** Emit a plain numeric schema for an `int32` or `double` field, and reserve a string-or-number union for `int64` values beyond the JavaScript safe integer range.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** An over-broad union forces every consumer to coerce values that were never strings.

### Keep Program.cs as composition (standards/rule/backend-api.keep-programcs-as-composition)

**Default:** Keep `Program.cs` to module registration, middleware order, endpoint discovery, health endpoints, OpenAPI, and host startup.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Order-sensitive middleware stays reviewable when one file shows the sequence.

**Example:** The visible order is trusted forwarded headers, exception handling, transport security, authentication, authorization, endpoints, then health. Forwarded headers appear only when the deployment boundary requires trusted proxies. OpenAPI and Scalar map only in Development. `Program.cs` ends with an empty `public partial class Program` so the integration test host can target the real entry point.

### Model a monetary value as one object (standards/rule/backend-api.model-a-monetary-value-as-one-object)

**Default:** Carry every monetary value as one `Money` transport object holding `amount` and an ISO 4217 `currency`.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Split sibling fields pair by a server invariant the schema cannot see, so a report reads the two independently. `standards/rule/backend-domain.make-money-and-decimal-rules-explicit` already carries the same shape in the Domain, and the transport model mirrors it.

**Example:** `unitPrice` and `currencyCode` become `price` of type `Money`. An amount that mirrors an order's currency carries it explicitly rather than by adjacency.

### Name transport fields by one rule set (standards/rule/backend-api.name-transport-fields-by-one-rule-set)

**Default:** Name transport fields with positive booleans, one `At` time suffix, standard vocabulary names, `code` beside `reason`, per-resource path parameters, and no noise word.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A type prefix repeats what the schema already declares. A mixed suffix set hides which shape a field carries, and a noise word names nothing an integrator can act on.

**Example:** `isBuyable` becomes `buyable`, `placedAt` becomes `createdAt`, `defaultLocaleTag` becomes `defaultLanguageTag`, `keyName` becomes `displayName`, and `/details` takes the aggregate name.

The rule set names the standard behind each clause. The boolean and noise-word clauses trace to the Azure naming conventions and the Microsoft Style Guide. The `At` suffix traces to [AIP-142](https://google.aip.dev/142), the boolean form to [AIP-140](https://google.aip.dev/140), and `languageTag` to [RFC 5646](https://datatracker.ietf.org/doc/html/rfc5646).

## Reference example

This informative example demonstrates `standards/rule/backend-api.keep-endpoint-dependencies-transport-focused` and `standards/rule/backend-api.mirror-a-domain-closed-set-as-a-transport-model-of-the-same-shape`.

A create endpoint reads the author from claims. It maps `CreateDraftRequestModel` to `CreateDraftCommand` through `CreateDraftApiMappings`. It sends the command through `ICommandMediator`. It maps `CreateDraftCommandResult` to `CreateDraftResponseModel` with the new post location. A read endpoint maps `GetPostQueryResult` through `GetPostApiMappings`. Neither endpoint calls `Post.CreateDraft` or `IPostRepository`.

A refund outcome is a closed set whose cases carry different data. Domain models it once. Application mirrors it per `standards/rule/backend-application.mirror-a-domain-closed-set-in-the-result`, and WebApi mirrors it again as a polymorphic transport model rather than serializing either inner type.

## Verification

| ID | Method | Evidence |
|:---|:---|:---|
| standards/rule/backend-api.use-one-endpoint-per-operation | test | `EndpointDiscoveryTests` asserts every mapped route resolves to one endpoint type and one mediator dispatch. |
| standards/rule/backend-api.exclude-mvc-controllers-from-the-profile | static | `WebApiArchitectureTests` asserts the assembly declares no type deriving from ControllerBase. |
| standards/rule/backend-api.keep-endpoint-dependencies-transport-focused | test | `WebApiArchitectureTests` asserts no endpoint parameter resolves a repository, session, context, or provider client. |
| standards/rule/backend-api.defer-error-mapping-to-the-global-handler | static | `WebApiArchitectureTests` asserts no endpoint type catches an application or Domain exception. |
| standards/rule/backend-api.derive-authenticated-identity-from-claims | test | `ActorIdentityTests` asserts each protected operation resolves its actor from the request claims principal. |
| standards/rule/backend-api.reject-a-client-supplied-actor-identifier | test | `ActorIdentityTests` posts a body, query, and header actor identifier and asserts each one is ignored. |
| standards/rule/backend-api.authorize-the-target-resource | test | `TargetAuthorizationTests` calls each protected operation as a non-owner and asserts 403 or the declared 404. |
| standards/rule/backend-api.return-stable-problem-details | test | `ProblemDetailsContractTests` asserts code, traceId, and errors on a validation failure response. |
| standards/rule/backend-api.keep-error-responses-free-of-internal-detail | test | `ErrorDisclosureTests` asserts no error body contains an exception message, stack frame, SQL, or configured secret. |
| standards/rule/backend-api.use-consistent-status-codes | test | `StatusContractTests` asserts the outcome-table status code for each documented result. |
| standards/rule/backend-api.reject-a-success-status-for-a-failed-outcome | test | `StatusContractTests` asserts every documented error path returns its declared non-success status. |
| standards/rule/backend-api.keep-routes-resource-oriented | static | `RouteShapeTests` asserts lowercase plural segments, kebab-case subresources, and identity outside the body. |
| standards/rule/backend-api.state-an-unexpressible-transition-as-a-custom-method | static | `apps/api/openapi/Entro.json` states each unexpressible transition as POST with a colon-suffixed final path segment. |
| standards/rule/backend-api.apply-patch-to-a-partial-update | static | `apps/api/openapi/Entro.json` declares `application/merge-patch+json` on each partial update and PUT on no partial update. |
| standards/rule/backend-api.use-put-for-a-whole-replacement | static | `apps/api/openapi/Entro.json` declares PUT on whole-replacement operations only. |
| standards/rule/backend-api.bound-collection-queries | test | `CollectionPagingTests` asserts deterministic ordering, the default limit, and rejection above the maximum. |
| standards/rule/backend-api.treat-openapi-as-a-generated-contract | static | A Release build regenerates `apps/api/openapi/` and CI fails when regeneration changes the tree. |
| standards/rule/backend-api.commit-the-generated-contract-its-consumers-read | static | The committed `apps/api/openapi/` artifact exists for each consumer-read contract and CI fails on a difference. |
| standards/rule/backend-api.reflect-enforced-authentication-in-the-contract | test | `OpenApiSecurityTests` asserts every operation with an authorization policy declares a matching security entry. |
| standards/rule/backend-api.publish-precise-complete-schemas | test | `OpenApiSchemaTests` asserts closed-set fields publish an enum or oneOf and control headers are required. |
| standards/rule/backend-api.mirror-a-domain-closed-set-as-a-transport-model-of-the-same-shape | test | `PolymorphicContractTests` round-trips every union case and asserts the discriminator equals its Domain case code. |
| standards/rule/backend-api.model-a-monetary-value-as-one-object | static | `apps/api/openapi/Entro.json` carries a `Money` schema and every monetary field references it. |
| standards/rule/backend-api.name-transport-fields-by-one-rule-set | inspection | A schema review of `apps/api/openapi/Entro.json` finds no banned prefix, no banned noise word, and one suffix per time shape. |
| standards/rule/backend-api.reject-a-collapsed-or-borrowed-wire-contract | test | `PolymorphicContractTests` asserts no data-bearing set serializes as an enum and no inner-layer type reaches the wire. |
| standards/rule/backend-api.use-this-endpoint-layout | inspection | Endpoint folder review locates each operation under its module and aggregate, or records a named local replacement. |
| standards/rule/backend-api.keep-transport-models-independent | static | `TransportNamingTests` asserts each transport type ends in RequestModel, ResponseModel, Model, or ApiMappings. |
| standards/rule/backend-api.name-routes-from-resources | static | `RouteShapeTests` reports each action segment for review against its resource alternatives. |
| standards/rule/backend-api.keep-numeric-transport-types-precise | test | `OpenApiSchemaTests` asserts each int32 and double field publishes a plain numeric schema. |
| standards/rule/backend-api.keep-programcs-as-composition | inspection | `Program.cs` review confirms the recorded middleware order and locates registration in layer-owned extension methods. |
