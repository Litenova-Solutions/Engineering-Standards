# HTTP API

## Intent

WebApi is a thin transport adapter. It maps HTTP input to Application messages, dispatches through the specific mediator, and maps results to stable HTTP contracts. Business rules, persistence access, and provider behavior remain outside endpoints.

## Agent Summary

- One endpoint class per operation dispatches through its mediator. (standards/rule/backend-api.use-one-endpoint-per-operation, standards/rule/backend-api.exclude-mvc-controllers-from-the-profile, standards/rule/backend-api.use-this-endpoint-layout)
- Endpoints take transport dependencies and map no errors. (standards/rule/backend-api.keep-endpoint-dependencies-transport-focused, standards/rule/backend-api.defer-error-mapping-to-the-global-handler)
- Endpoints enforce coarse policies while the guard decides targets. (standards/rule/backend-api.apply-only-coarse-policies-at-the-endpoint)
- Errors return Problem Details with Result codes and consistent statuses. (standards/rule/backend-api.return-stable-problem-details, standards/rule/backend-api.use-consistent-status-codes)
- Routes stay resource-oriented with custom methods, PATCH, and PUT. (standards/rule/backend-api.keep-routes-resource-oriented, standards/rule/backend-api.state-an-unexpressible-transition-as-a-custom-method, standards/rule/backend-api.apply-patch-to-a-partial-update, standards/rule/backend-api.use-put-for-a-whole-replacement, standards/rule/backend-api.name-routes-from-resources)
- Collections page with bounds, cursors, and declared maxima. (standards/rule/backend-api.bound-collection-queries, standards/rule/backend-api.use-opaque-cursors-for-collection-paging, standards/rule/backend-api.version-cursors-with-stable-sort-values, standards/rule/backend-api.declare-a-smaller-collection-maximum, standards/rule/backend-api.use-offsets-for-proven-bounded-datasets)
- The contract generates on Release, commits, and declares metadata. (standards/rule/backend-api.treat-openapi-as-a-generated-contract, standards/rule/backend-api.commit-the-generated-contract-its-consumers-read, standards/rule/backend-api.reflect-enforced-authentication-in-the-contract, standards/rule/backend-api.publish-precise-complete-schemas, standards/rule/backend-api.declare-operation-metadata-in-the-contract, standards/rule/backend-api.expose-development-tooling-in-development-only, standards/rule/backend-api.generate-the-contract-without-hosted-dependencies)
- Transport models mirror closed sets with discriminators and Money objects. (standards/rule/backend-api.mirror-a-domain-closed-set-as-a-transport-model-of-the-same-shape, standards/rule/backend-api.reject-a-collapsed-or-borrowed-wire-contract, standards/rule/backend-api.publish-label-only-sets-as-string-enums, standards/rule/backend-api.mark-polymorphic-transport-models-with-discriminators, standards/rule/backend-api.model-a-monetary-value-as-one-object)
- Field, boolean, time, failure, path, and numeric names follow one vocabulary. (standards/rule/backend-api.name-transport-types-by-their-boundary-role, standards/rule/backend-api.name-boolean-fields-as-conditions, standards/rule/backend-api.name-time-fields-with-at, standards/rule/backend-api.use-standard-field-vocabulary, standards/rule/backend-api.name-failure-pairs-code-and-reason, standards/rule/backend-api.name-path-parameters-per-resource, standards/rule/backend-api.avoid-noise-words-in-field-names, standards/rule/backend-api.keep-numeric-transport-types-precise)
- Cookie-authenticated writes carry the marker header while Program.cs holds composition. (standards/rule/backend-api.require-the-marker-header-on-cookie-authenticated-writes, standards/rule/backend-api.keep-programcs-as-composition)

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

### Keep endpoint dependencies transport-focused (standards/rule/backend-api.keep-endpoint-dependencies-transport-focused)

**Requirement:** An endpoint MUST NOT take an aggregate repository, a document session, a `DbContext`, a provider client, or an application service.

**Rationale:** Endpoint classes are mapped from the root application at startup, so they hold no scoped dependency. Route-handler parameters take mediators and HTTP-boundary services such as an actor accessor.

### Defer error mapping to the global handler (standards/rule/backend-api.defer-error-mapping-to-the-global-handler)

**Requirement:** An endpoint MUST NOT catch a `UseCaseException`, a `DomainException`, or a validation failure.

**Rationale:** One global handler produces every error response, so a caught exception at the endpoint creates a second, divergent mapping.

### Apply only coarse policies at the endpoint (standards/rule/backend-api.apply-only-coarse-policies-at-the-endpoint)

**Requirement:** A WebApi endpoint MUST enforce only coarse authenticated, role, or scope policies, leaving target decisions to the application guard.

**Rationale:** Authentication establishes who is calling. It does not establish that the caller may act on this specific resource. Target authorization lives in `standards/rule/backend-application.enforce-target-authorization-in-the-pipeline`, which decides from the permissions the use case needs.

An operation applies a stable forbidden or not-found policy when revealing that a resource exists would leak information.

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

`type` is a stable absolute URI owned by the consumer. `errors` appears only when `ValidationFailure` entries exist, carrying their member, code, and message. `code` carries the refusal Result's failure code, and `detail` carries the free-form prose explanation. A request body names the same pair `code` and `reason` under `standards/rule/backend-api.name-failure-pairs-code-and-reason`.

WebApi maps Application member names to their public JSON field names. `traceId` carries the trace identifier from the current [W3C Trace Context](https://www.w3.org/TR/trace-context/) `traceparent`, with the request identifier as fallback. The same shape applies to authentication and authorization failures.

The example uses ASP.NET Core `AddProblemDetails` and one `IExceptionHandler`. It maps validation exceptions to 400, missing targets through the operation's 404 policy, and forbidden failures to 403 or the declared 404 disclosure policy. It maps conflicts and state rejections to 409, and unexpected exceptions to 500 with code `internal_error`. It maps known Domain exception types individually. It does not report cancellation from a disconnected request as an application error.

### Use consistent status codes (standards/rule/backend-api.use-consistent-status-codes)

**Requirement:** A WebApi operation MUST return the status code that its outcome table assigns.

**Rationale:** A client branches on status before it reads a body, so an inconsistent code hides the outcome.

**Example:**

| Outcome | Status |
|:---|:---:|
| Successful read | 200 |
| Successful creation of a readable resource | 201 with the resource location |
| Successful creation without a read route | 201 |
| Successful command without a response body | 204 |
| Structural validation failure | 400 |
| Missing or invalid authentication | 401 |
| Authenticated but forbidden | 403 |
| Resource unavailable under the disclosure policy | 404 |
| State, version, or idempotency conflict | 409 |
| Accepted background operation | 202 with status location |
| Unexpected failure | 500 |

### Require the marker header on cookie-authenticated writes (standards/rule/backend-api.require-the-marker-header-on-cookie-authenticated-writes)

**Requirement:** The API MUST refuse a cookie-authenticated write without the project's marker header.

**Rationale:** A write is any request other than GET, HEAD, or OPTIONS. The header takes the form `X-<Project>-Request: 1`, with the exact name set in project configuration. A page on another site cannot add the header, so its absence exposes a cross-site forgery.

The refused request is unauthenticated, so it answers 401 under `standards/rule/backend-api.use-consistent-status-codes`. The frontend pages own sending the header; this rule owns the API refusal.

### Keep routes resource-oriented (standards/rule/backend-api.keep-routes-resource-oriented)

**Requirement:** A route MUST use lowercase plural resource segments, kebab-case subresources, route parameters for identity, query parameters for filtering, and the body for command data.

**Rationale:** A predictable route shape lets a caller derive an unfamiliar operation from a familiar one.

**Example:** A route carries the authenticated actor identifier only when that actor is intentionally addressing another actor as a resource.

### State an unexpressible transition as a custom method (standards/rule/backend-api.state-an-unexpressible-transition-as-a-custom-method)

**Requirement:** A WebApi route MUST express a state transition the five HTTP verbs cannot carry as a POST custom method ending in a colon-suffixed verb.

**Rationale:** [AIP-136](https://google.aip.dev/136) defines the custom-method form for actions outside the five standard methods. A path segment names a resource. A state-noun segment such as `/closure` and a bare verb segment such as `/abandon` both encode the action, so neither predicts the other. The colon marks the final segment as a command rather than a nested resource.

**Example:**

```text
POST /api/shipments/{shipmentId}:cancel
POST /api/merchants/{merchantId}:close
POST /api/orders/{orderId}/refund-requests/{refundId}:decide
```

The `operationId` keeps its verb-noun form, so `CancelShipment` names the same transition the path states.

### Apply PATCH to a partial update (standards/rule/backend-api.apply-patch-to-a-partial-update)

**Requirement:** A WebApi operation MUST apply a partial update with PATCH and the `application/merge-patch+json` media type.

**Rationale:** [RFC 5789](https://datatracker.ietf.org/doc/html/rfc5789) defines PATCH and [RFC 7386](https://datatracker.ietf.org/doc/html/rfc7386) defines the merge-patch media type. A PUT body for a partial change either repeats fields the caller does not change or invents merge semantics per field.

**Example:** A partial update sends only the changed members with `Content-Type: application/merge-patch+json`, and the endpoint reads the body as a sparse patch. A PUT keeps replacing the whole resource, and DELETE stays a hard-state transition.

### Use PUT for a whole replacement (standards/rule/backend-api.use-put-for-a-whole-replacement)

**Requirement:** A PUT operation MUST replace the whole resource or sub-resource its path names.

**Rationale:** A PUT body that carries a subset forces the server to choose between dropping omitted members and inventing per-field merges. The partial path is PATCH under `standards/rule/backend-api.apply-patch-to-a-partial-update`.

**Example:** A whole replacement sends every editable member, and an omitted member removes its value rather than keeping the stored one.

### Bound collection queries (standards/rule/backend-api.bound-collection-queries)

**Requirement:** A collection endpoint MUST apply deterministic ordering, a default limit of 20, and the use case's declared maximum limit of 100 or lower.

**Rationale:** An unbounded collection read turns one caller into a source of unbounded database and serialization work. Query-side ordering lives in `standards/rule/backend-api.bound-collection-queries`, which this rule's ordering follows. Cursor mechanics live in `standards/rule/backend-api.use-opaque-cursors-for-collection-paging` and `standards/rule/backend-api.version-cursors-with-stable-sort-values`.

**Example:** A request uses `after` as an opaque cursor and `limit` as a positive integer. The implementation fetches one record beyond the requested limit to determine whether another page exists. The response uses one shape:

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

### Use opaque cursors for collection paging (standards/rule/backend-api.use-opaque-cursors-for-collection-paging)

**Requirement:** A collection endpoint MUST page with an opaque cursor and refuse a malformed cursor with 400 and code `invalid_cursor`.

**Rationale:** The endpoint treats the cursor as untrusted input. An unsupported cursor version answers the same refusal.

### Version cursors with stable sort values (standards/rule/backend-api.version-cursors-with-stable-sort-values)

**Requirement:** A paging cursor MUST carry a version and the last stable sort values, including a unique tie-breaker, and no sensitive value in readable form.

**Rationale:** The version lets the sort evolve without breaking stored cursors. The tie-breaker matches the query's stable order under `standards/rule/backend-api.bound-collection-queries`.

### Treat OpenAPI as a generated contract (standards/rule/backend-api.treat-openapi-as-a-generated-contract)

**Requirement:** A WebApi project MUST generate its OpenAPI document during the Release build.

**Rationale:** A handwritten contract drifts from the code it describes.

**Example:** The API source artifact is `apps/api/openapi/{ProjectName}.json`. WebApi references `Microsoft.AspNetCore.OpenApi` and `Microsoft.Extensions.ApiDescription.Server`, enables `OpenApiGenerateDocuments`, sets `OpenApiDocumentsDirectory` to that directory, and passes `--file-name {ProjectName}` through `OpenApiGenerateDocumentsOptions`.

Build-time generation boots the host, which is [what Microsoft's own guidance does](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/openapi/overview). A boot reaches every startup guard. A project whose composition refuses to start without a secret, a certificate, or a reachable dependency cannot generate its contract from a clean checkout. Two answers are valid, and the project records which one it uses under `standards/rule/backend-api.generate-the-contract-without-hosted-dependencies`.

| Answer | What the project does | What it costs |
|:---|:---|:---|
| Generation environment | Set an environment for the generation run whose composition wires no hosted dependency. | The generated document reflects that environment's endpoint set. |
| Deferred guard | Move each startup refusal from composition to first use. | A misconfiguration surfaces on the first request instead of at boot. |

Generation without hosted dependencies follows `standards/rule/backend-api.generate-the-contract-without-hosted-dependencies`.

When TypeScript consumes the API, the pinned generator reads the source artifact. The generated client, its model types, its request schemas, and its query options are one workspace package, because every frontend and every command reads them.

### Declare operation metadata in the contract (standards/rule/backend-api.declare-operation-metadata-in-the-contract)

**Requirement:** An operation MUST declare a stable `operationId`, its authorization, request, success, and Problem Details metadata, and typed results or `Produces` metadata, and a summary.

**Rationale:** A stable name through `WithName` becomes `operationId`. Authorization metadata cites the enforced policies, and Problem Details metadata covers every documented failure status. Comments on route lambdas are not contract documentation, so operations carry explicit summaries and descriptions.

### Commit the generated contract its consumers read (standards/rule/backend-api.commit-the-generated-contract-its-consumers-read)

**Requirement:** A WebApi project MUST commit its generated OpenAPI artifact when a frontend or external consumer reads it.

**Rationale:** A committed artifact makes every contract change visible in review and lets CI fail on an unregenerated document. Consumers read the artifact through the generated client, model, schema, and query-option packages.

### Reflect enforced authentication in the contract (standards/rule/backend-api.reflect-enforced-authentication-in-the-contract)

**Requirement:** A generated OpenAPI document MUST declare the security scheme and per-operation security requirement for every endpoint that enforces authentication.

**Rationale:** A consumer that learns an authentication requirement from a runtime 401 has already built the wrong client.

**Example:** The implementation registers a document transformer that reads registered authentication schemes through `IAuthenticationSchemeProvider` and adds the matching `securitySchemes` and `security` entries. Handwritten security metadata drifts from registered schemes. An intentionally anonymous operation declares no security requirement.

### Publish precise, complete schemas (standards/rule/backend-api.publish-precise-complete-schemas)

**Requirement:** A generated schema MUST declare the closed value set, bounds, format, and required control headers of each field and parameter it describes.

**Rationale:** A caller learns an operation's limits from the document instead of discovering them through a runtime rejection.

**Example:** A label-only set publishes its values as an OpenAPI `enum`. A data-bearing set publishes a polymorphic `oneOf` model with a discriminator per `standards/rule/backend-api.mirror-a-domain-closed-set-as-a-transport-model-of-the-same-shape`. A named boundary enum carries `[JsonConverter(typeof(JsonStringEnumConverter<T>))]` on its type, so every serializer honors the contract, including a test client using default options. Host-only conversion breaks readers that do not share host configuration.

An operation requiring a control header declares it as a required parameter, for example `Idempotency-Key` or `If-Match`. The implementation prefers typed results, typed boundary enums, and parameter metadata over handwritten schemas that drift from code.

### Expose development tooling in Development only (standards/rule/backend-api.expose-development-tooling-in-development-only)

**Requirement:** A WebApi project MUST expose Scalar and development tooling in Development only.

**Rationale:** Hosted environments do not expose development tooling by default.

### Mirror a Domain closed set as a transport model of the same shape (standards/rule/backend-api.mirror-a-domain-closed-set-as-a-transport-model-of-the-same-shape)

**Requirement:** A WebApi transport model for a Domain closed set MUST preserve the shape of that set.

**Rationale:** A transport shape that differs from its Domain set discards information the Domain carries. Label-only sets follow `standards/rule/backend-api.publish-label-only-sets-as-string-enums`, and data-bearing sets follow `standards/rule/backend-api.mark-polymorphic-transport-models-with-discriminators`. Narrowing follows `standards/rule/backend-application.record-a-decision-for-closed-set-narrowing`.

**Example:** A label-only set maps to a string `enum`. A data-bearing set maps to an abstract base record with one sealed record per case, published as `oneOf` with a discriminator.

### Publish label-only sets as string enums (standards/rule/backend-api.publish-label-only-sets-as-string-enums)

**Requirement:** A transport model for a label-only set MUST publish its values as an OpenAPI string `enum`.

**Rationale:** The permission to use a plain enum for a label-only set lives in `standards/rule/backend-domain.model-every-closed-set-of-domain-values-without-enums`.

### Mark polymorphic transport models with discriminators (standards/rule/backend-api.mark-polymorphic-transport-models-with-discriminators)

**Requirement:** A data-bearing set MUST map to an abstract base record with one sealed record per case, published as `oneOf` with a string discriminator.

**Rationale:** A concrete base cannot mark the discriminator property as required, so the base stays abstract. String discriminators equal the Domain union's stable case codes. Discriminator strings stay stable across identifier renames.

**Example:**

- Declare an abstract base record carrying `JsonPolymorphic` and one `JsonDerivedType` per case.
- Carry the metadata on the type, not only in host options.
- Name the discriminator through `TypeDiscriminatorPropertyName`, using a name such as `type` or `outcome`.
- Opt derived types in explicitly, so an unregistered runtime subtype fails serialization.
- A document or schema transformer completes discriminator metadata that the generator omits.

### Reject a collapsed or borrowed wire contract (standards/rule/backend-api.reject-a-collapsed-or-borrowed-wire-contract)

**Requirement:** A WebApi transport model MUST NOT collapse a data-bearing set into an `enum` or reuse a Domain or Application type as the wire contract.

**Rationale:** Each layer owns its own contract type per `standards/rule/backend-architecture.own-each-layers-contract-types`. Narrowing follows `standards/rule/backend-application.record-a-decision-for-closed-set-narrowing`.

## Conventions

### Use this endpoint layout (standards/rule/backend-api.use-this-endpoint-layout)

**Default:** Group endpoint folders by module, then aggregate, then use case, following `standards/rule/backend-architecture.organize-every-layer-by-module-and-use-case`.

**Replacement:** A consumer replaces this default by recording an Exception for this provision, with reason and review date.

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
    Customers/                      two aggregates: operations nest under each aggregate
      CustomerAccounts/
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

Module nesting, including the single-aggregate flat form, follows the cited folder rule.

### Name transport types by their boundary role (standards/rule/backend-api.name-transport-types-by-their-boundary-role)

**Default:** Transport types take the names the suffix table assigns their roles.

**Replacement:** A consumer replaces this default by recording an Exception for this provision, with reason and review date.

**Rationale:** The suffix table lives in `standards/rule/workspace-naming.use-architectural-suffixes`. A name that ends in its boundary role keeps transport concerns out of Application messages and results.

**Example:** Another passive HTTP DTO names its boundary role and ends in `Model`.

### Name routes from resources (standards/rule/backend-api.name-routes-from-resources)

**Default:** Derive each route from its resource and subresource, and use an action segment only when the operation maps to neither.

**Replacement:** A consumer replaces this default by recording an Exception for this provision, with reason and review date.

**Example:**

```text
POST   /api/posts
GET    /api/posts/{postId}
GET    /api/posts/{postId}/publication
GET    /api/posts?after={cursor}&limit=20
```

### Keep numeric transport types precise (standards/rule/backend-api.keep-numeric-transport-types-precise)

**Default:** Emit a plain numeric schema for an `int32` or `double` field, and reserve a string-or-number union for `int64` values beyond the JavaScript safe integer range.

**Replacement:** A consumer replaces this default by recording an Exception for this provision, with reason and review date.

**Rationale:** An over-broad union forces every consumer to coerce values that were never strings.

### Keep Program.cs as composition (standards/rule/backend-api.keep-programcs-as-composition)

**Default:** `Program.cs` holds module registration, middleware order, endpoint discovery, health endpoints, OpenAPI, and host startup, ending with an empty partial `Program` class.

**Replacement:** A consumer replaces this default by recording an Exception for this provision, with reason and review date.

**Rationale:** Order-sensitive middleware stays reviewable when one file shows the sequence. Process composition lives in `standards/rule/backend-architecture.compose-each-process-explicitly`, which this file implements for WebApi.

**Example:** The visible order is trusted forwarded headers, exception handling, transport security, authentication, authorization, endpoints, then health. Forwarded headers appear only when the deployment boundary requires trusted proxies. OpenAPI and Scalar map only in Development.

### Model a monetary value as one object (standards/rule/backend-api.model-a-monetary-value-as-one-object)

**Default:** Carry a monetary value as one `Money` object in a response model and in a request where the caller chooses the currency.

**Replacement:** A consumer replaces this default by recording an Exception for this provision, with reason and review date.

**Rationale:** Split sibling fields pair by a server invariant the schema cannot see, so a report reads the two independently. `standards/rule/backend-domain.make-money-and-decimal-rules-explicit` already carries the same shape in the Domain, and the transport model mirrors it. The object holds `amount` and an ISO 4217 `currency`. A caller who cannot choose the currency cannot set it honestly.

**Example:** `unitPrice` and `currencyCode` become `price` of type `Money`. A request that references an account with a fixed currency carries `amount` alone.

### Name boolean fields as conditions (standards/rule/backend-api.name-boolean-fields-as-conditions)

**Default:** Boolean fields use the same condition names as code, in camel case.

**Replacement:** A consumer replaces this default by recording an Exception for this provision, with reason and review date.

**Rationale:** Boolean names live in `standards/rule/workspace-naming.use-intent-revealing-boolean-names`, and transport carries the camel-case form.

**Example:** `IsBuyable` in code becomes `isBuyable` on the wire.

### Name time fields with At (standards/rule/backend-api.name-time-fields-with-at)

**Default:** Time fields end in At, following [AIP-142](https://google.aip.dev/142).

**Replacement:** A consumer replaces this default by recording an Exception for this provision, with reason and review date.

**Rationale:** A mixed suffix set hides which shape a field carries.

**Example:** `createdAt` names the creation time.

### Use standard field vocabulary (standards/rule/backend-api.use-standard-field-vocabulary)

**Default:** Field names use created over placed, languageTag over locale, and displayName over keyName.

**Replacement:** A consumer replaces this default by recording an Exception for this provision, with reason and review date.

**Rationale:** `languageTag` follows [RFC 5646](https://datatracker.ietf.org/doc/html/rfc5646).

**Example:** `defaultLanguageTag` replaces `defaultLocaleTag`.

### Name failure pairs code and reason (standards/rule/backend-api.name-failure-pairs-code-and-reason)

**Default:** A request body names a failure with code for the class and reason for the explanation.

**Replacement:** A consumer replaces this default by recording an Exception for this provision, with reason and review date.

**Rationale:** The pair mirrors the Problem Details code and detail on the wire under `standards/rule/backend-api.return-stable-problem-details`.

### Name path parameters per resource (standards/rule/backend-api.name-path-parameters-per-resource)

**Default:** Each path parameter names its own resource identity, and a details segment takes the aggregate name.

**Replacement:** A consumer replaces this default by recording an Exception for this provision, with reason and review date.

**Rationale:** A shared id hides which resource it identifies.

**Example:** `/api/posts/{postId}` names the post; `/details` takes the aggregate name.

### Avoid noise words in field names (standards/rule/backend-api.avoid-noise-words-in-field-names)

**Default:** Field names carry no type prefix and no noise word.

**Replacement:** A consumer replaces this default by recording an Exception for this provision, with reason and review date.

**Rationale:** The noise words are data, info, item, object, value, and thing; the type prefixes are str, int, bool, num, obj, and arr. A type prefix repeats what the schema already declares, and a noise word names nothing an integrator can act on.

**Example:** `customerInfo` becomes `customer`.

### Declare a smaller collection maximum (standards/rule/backend-api.declare-a-smaller-collection-maximum)

**Default:** A use case with stricter needs declares its smaller maximum on its collection query message and states the reason on its use-case record.

**Replacement:** A consumer replaces this default by recording an Exception for this provision, with reason and review date.

**Rationale:** The endpoint enforces the declared maximum under `standards/rule/backend-api.bound-collection-queries`.

### Use offsets for proven bounded datasets (standards/rule/backend-api.use-offsets-for-proven-bounded-datasets)

**Default:** A collection over a proven bounded dataset pages with an offset while the public contract stays cursor-shaped.

**Replacement:** A consumer replaces this default by recording an Exception for this provision, with reason and review date.

**Rationale:** The use-case record states the bound that makes the dataset safe for offsets.

### Generate the contract without hosted dependencies (standards/rule/backend-api.generate-the-contract-without-hosted-dependencies)

**Default:** The generation run contacts no hosted dependency and runs no schema change, and the project records its chosen answer.

**Replacement:** A consumer replaces this default by recording an Exception for this provision, with reason and review date.

**Rationale:** A generation environment wires no hosted dependency for the generation run, and the document reflects that environment's endpoint set. A deferred guard moves each startup refusal from composition to first use, and a misconfiguration surfaces on the first request instead of at boot.

## Reference example

This informative example demonstrates `standards/rule/backend-api.keep-endpoint-dependencies-transport-focused` and `standards/rule/backend-api.mirror-a-domain-closed-set-as-a-transport-model-of-the-same-shape`.

A create endpoint reads the author from claims. It maps `CreateDraftRequestModel` to `CreateDraftCommand` through `CreateDraftApiMappings`. It sends the command through `ICommandMediator`. It maps `CreateDraftCommandResult` to `CreateDraftResponseModel` with the new post location. A read endpoint maps `GetPostQueryResult` through `GetPostApiMappings`. Neither endpoint calls `Post.CreateDraft` or `IPostRepository`.

A refund outcome is a closed set whose cases carry different data. Domain models it once. Application mirrors it per `standards/rule/backend-application.mirror-a-domain-closed-set-in-the-result`, and WebApi mirrors it again as a polymorphic transport model rather than serializing either inner type.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| standards/rule/backend-api.use-one-endpoint-per-operation | guidance | Does each mapped route resolve to one endpoint type and one mediator dispatch? |
| standards/rule/backend-api.exclude-mvc-controllers-from-the-profile | guidance | Does any type derive from ControllerBase? |
| standards/rule/backend-api.keep-endpoint-dependencies-transport-focused | guidance | Does any endpoint take a repository, session, context, provider, or service? |
| standards/rule/backend-api.defer-error-mapping-to-the-global-handler | guidance | Does any endpoint catch an application or Domain exception? |
| standards/rule/backend-api.apply-only-coarse-policies-at-the-endpoint | guidance | Does any endpoint decide target authorization instead of enforcing coarse policies? |
| standards/rule/backend-api.return-stable-problem-details | guidance | Does each error response carry code, traceId, and field errors? |
| standards/rule/backend-api.use-consistent-status-codes | guidance | Does each operation return its outcome-table status code? |
| standards/rule/backend-api.require-the-marker-header-on-cookie-authenticated-writes | guidance | Does a cookie-authenticated write without the marker header answer 401? |
| standards/rule/backend-api.keep-routes-resource-oriented | guidance | Do routes use plural segments, kebab subresources, and body command data? |
| standards/rule/backend-api.state-an-unexpressible-transition-as-a-custom-method | guidance | Does each unexpressible transition use POST with a colon-suffixed verb? |
| standards/rule/backend-api.apply-patch-to-a-partial-update | guidance | Does each partial update use PATCH with merge-patch media? |
| standards/rule/backend-api.use-put-for-a-whole-replacement | guidance | Does each PUT replace the whole resource its path names? |
| standards/rule/backend-api.bound-collection-queries | guidance | Do collection endpoints order deterministically within default and maximum limits? |
| standards/rule/backend-api.use-opaque-cursors-for-collection-paging | guidance | Does a malformed cursor answer 400 with code invalid_cursor? |
| standards/rule/backend-api.version-cursors-with-stable-sort-values | guidance | Does each cursor carry a version, stable sort values, and no readable secret? |
| standards/rule/backend-api.treat-openapi-as-a-generated-contract | checkable | `dotnet build` regenerates the OpenAPI artifact, and the gate fails on a changed tree. |
| standards/rule/backend-api.declare-operation-metadata-in-the-contract | guidance | Does each operation declare its operationId, metadata, typed results, and summary? |
| standards/rule/backend-api.commit-the-generated-contract-its-consumers-read | guidance | Is the generated artifact committed and current for each consumer? |
| standards/rule/backend-api.reflect-enforced-authentication-in-the-contract | guidance | Does each authenticated operation declare its security scheme and requirement? |
| standards/rule/backend-api.publish-precise-complete-schemas | guidance | Does each schema declare its value set, bounds, format, and control headers? |
| standards/rule/backend-api.expose-development-tooling-in-development-only | guidance | Do Scalar and development tooling map in Development only? |
| standards/rule/backend-api.mirror-a-domain-closed-set-as-a-transport-model-of-the-same-shape | guidance | Does each transport model preserve its Domain set shape? |
| standards/rule/backend-api.publish-label-only-sets-as-string-enums | guidance | Does each label-only set publish a string enum? |
| standards/rule/backend-api.mark-polymorphic-transport-models-with-discriminators | guidance | Does each data-bearing set publish oneOf with a string discriminator? |
| standards/rule/backend-api.reject-a-collapsed-or-borrowed-wire-contract | guidance | Does any transport model collapse a set or reuse an inner type? |
| standards/rule/backend-api.use-this-endpoint-layout | guidance | Does each endpoint folder match its module, aggregate, and use case? |
| standards/rule/backend-api.name-transport-types-by-their-boundary-role | guidance | Does each transport type carry the suffix its role assigns? |
| standards/rule/backend-api.name-routes-from-resources | guidance | Does each route derive from its resource with action segments justified? |
| standards/rule/backend-api.keep-numeric-transport-types-precise | guidance | Does each numeric field publish a plain schema except large int64 unions? |
| standards/rule/backend-api.keep-programcs-as-composition | guidance | Does `Program.cs` hold only composition in the recorded order? |
| standards/rule/backend-api.model-a-monetary-value-as-one-object | guidance | Does each monetary value travel as one Money object? |
| standards/rule/backend-api.name-boolean-fields-as-conditions | guidance | Does each boolean field use the camel-case condition name? |
| standards/rule/backend-api.name-time-fields-with-at | guidance | Does each time field end in At? |
| standards/rule/backend-api.use-standard-field-vocabulary | guidance | Does each field use the standard vocabulary over its rejected synonym? |
| standards/rule/backend-api.name-failure-pairs-code-and-reason | guidance | Does each request failure name code for the class and reason? |
| standards/rule/backend-api.name-path-parameters-per-resource | guidance | Does each path parameter name its own resource identity? |
| standards/rule/backend-api.avoid-noise-words-in-field-names | guidance | Does any field name carry a type prefix or noise word? |
| standards/rule/backend-api.declare-a-smaller-collection-maximum | guidance | Does each lowered maximum name its value and reason? |
| standards/rule/backend-api.use-offsets-for-proven-bounded-datasets | guidance | Does each offset page cite the bound making it safe? |
| standards/rule/backend-api.generate-the-contract-without-hosted-dependencies | guidance | Does generation avoid hosted dependencies with its answer recorded? |
