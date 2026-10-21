# HTTP API

## Intent

WebApi is a thin transport adapter. It maps HTTP input to Application messages, dispatches through the specific mediator, and maps results to stable HTTP contracts. Business rules, persistence access, and provider behavior remain outside endpoints.

## Standards

### Map one operation per endpoint

**Requirement:** An endpoint MUST map one route operation, convert input to an Application message, dispatch through its mediator, and map the result.

**Rationale:** One class per operation gives each route a single owner and keeps the transport boundary reviewable.

**Example:** At startup, the application discovers endpoint implementations, registers each one once, and maps them in deterministic name order. Discovery uses the platform's own reflection and dependency injection. It needs no separate scanning package.

### Keep endpoint dependencies transport-focused

**Requirement:** An endpoint MUST NOT take an aggregate repository, a persistence session or context, a provider client, or an application service.

**Rationale:** The application registers endpoints at startup, so they hold no request-scoped dependency. Endpoint handlers take mediators and HTTP-boundary services such as an actor accessor.

### Defer error mapping to the global handler

**Requirement:** An endpoint MUST NOT catch a `UseCaseException`, a `DomainException`, or a validation failure.

**Rationale:** One global handler produces every error response, so a caught exception at the endpoint creates a second, divergent mapping.

### Apply only coarse policies at the endpoint

**Requirement:** A WebApi endpoint MUST enforce only coarse authenticated, role, or scope policies, leaving target decisions to the application guard.

**Rationale:** Authentication establishes who is calling. It does not establish that the caller may act on this specific resource. Target authorization lives in `litespec/backend/application#enforce-target-authorization-in-the-pipeline`, which decides from the permissions the use case needs.

An operation applies a stable forbidden or not-found policy when revealing that a resource exists would leak information.

### Return stable Problem Details

**Requirement:** An error response MUST use [RFC 9457](https://datatracker.ietf.org/doc/html/rfc9457) Problem Details carrying a stable application `code`, the current `traceId`, and an `errors` entry for each field failure.

**Rationale:** A stable machine-readable code lets a client branch on the failure, and the trace identifier connects the response to its diagnostics. RFC 9457 obsoletes RFC 7807 and defines the media type. The contract cites the document a client implementer reads.

**Example:** The serialized contract is:

```json
{
  "type": "https://example.test/problems/validation",
  "title": "Request validation failed",
  "httpStatus": 400,
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

`type` is a stable absolute URI owned by the consumer. `errors` appears only when `ValidationFailure` entries exist, carrying their member, code, and message. `code` carries the refusal Result's failure code, and `detail` carries the free-form prose explanation. A request body names the same pair `code` and `reason` under `litespec/backend/api#name-failure-pairs-code-and-reason`.

WebApi maps Application member names to their public JSON field names. `traceId` carries the trace identifier from the current [W3C Trace Context](https://www.w3.org/TR/trace-context/) `traceparent`, with the request identifier as fallback. The same shape applies to authentication and authorization failures.

In the dotnet stack, the example uses ASP.NET Core `AddProblemDetails` and one `IExceptionHandler`. It maps validation exceptions to 400, missing targets through the operation's 404 policy, and forbidden failures to 403 or the declared 404 disclosure policy. It maps conflicts and state rejections to 409, and unexpected exceptions to 500 with code `internal_error`. It maps known Domain exception types individually. It does not report cancellation from a disconnected request as an application error.

In the library circulation product, borrowing an unavailable copy ends with `result/borrow-copy.copy-unavailable`, which carries the code `failure/lending.copy_not_available` and the status 409. For example, the global handler answers:

```json
{
  "type": "https://example.test/problems/conflict",
  "title": "Copy unavailable",
  "httpStatus": 409,
  "detail": "The copy is unavailable.",
  "instance": "/api/loans",
  "code": "failure/lending.copy_not_available",
  "traceId": "4bf92f3577b34da6a3ce929d0e0e4736"
}
```

The endpoint never catches the failure. The diagram shows how a Domain exception or a validation failure reaches the global handler and becomes a status with a Problem Details body.

![A domain exception or a validation failure reaches the global handler, which no endpoint preempts. The handler selects the HTTP status and returns a Problem Details body carrying the stable code, the trace identifier, and one entry per field failure.](../assets/diagrams/backend-error-flow.svg)

### Record each result's HTTP status

**Requirement:** A result MUST carry `httpStatus` exactly when an HTTP entry point reaches its use case.

**Rationale:** The outcome table, the route, and the tests read one recorded status. A use case reached only by reactions or jobs has no HTTP answer to record.

### Use consistent status codes

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

### Require the marker header on cookie-authenticated writes

**Requirement:** The API MUST refuse a cookie-authenticated write without the project's marker header.

**Rationale:** A write is any request other than GET, HEAD, or OPTIONS. The header takes the form `X-<Project>-Request: 1`. You set the exact name in project configuration. A page on another site cannot add the header, so its absence exposes a cross-site forgery.

The refused request is unauthenticated, so it answers 401 under `litespec/backend/api#use-consistent-status-codes`. The frontend pages own sending the header. This rule owns the API refusal.

### Keep routes resource-oriented

**Requirement:** A route MUST use lowercase plural resource segments, kebab-case subresources, route parameters for identity, query parameters for filtering, and the body for command data.

**Rationale:** A predictable route shape lets a caller derive an unfamiliar operation from a familiar one.

**Example:** A route carries the authenticated actor identifier only when that actor is intentionally addressing another actor as a resource.

### State an unexpressible transition as a custom method

**Requirement:** A WebApi route MUST express a state transition the five HTTP verbs cannot carry as a POST custom method ending in a colon-suffixed verb.

**Rationale:** [AIP-136](https://google.aip.dev/136) defines the custom-method form for actions outside the five standard methods. A path segment names a resource. A state-noun segment such as `/closure` and a bare verb segment such as `/abandon` both encode the action, so neither predicts the other. The colon marks the final segment as a command rather than a nested resource.

**Example:**

```text
POST /api/shipments/{shipmentId}:cancel
POST /api/merchants/{merchantId}:close
POST /api/orders/{orderId}/refund-requests/{refundId}:decide
```

The `operationId` keeps its verb-noun form, so `CancelShipment` names the same transition the path states.

### Apply PATCH to a partial update

**Requirement:** A WebApi operation MUST apply a partial update with PATCH and the `application/merge-patch+json` media type.

**Rationale:** [RFC 5789](https://datatracker.ietf.org/doc/html/rfc5789) defines PATCH and [RFC 7386](https://datatracker.ietf.org/doc/html/rfc7386) defines the merge-patch media type. A PUT body for a partial change either repeats fields the caller does not change or invents merge semantics per field.

**Example:** A partial update sends only the changed members with `Content-Type: application/merge-patch+json`, and the endpoint reads the body as a sparse patch. A PUT keeps replacing the whole resource, and DELETE stays a hard-state transition.

### Use PUT for a whole replacement

**Requirement:** A PUT operation MUST replace the whole resource or sub-resource its path names.

**Rationale:** A PUT body that carries a subset forces the server to choose between dropping omitted members and inventing per-field merges. The partial path is PATCH under `litespec/backend/api#apply-patch-to-a-partial-update`.

**Example:** A whole replacement sends every editable member, and an omitted member removes its value rather than keeping the stored one.

### Bound collection queries

**Requirement:** A collection endpoint MUST apply deterministic ordering, a default limit of 20, and the use case's declared maximum limit of 100 or lower.

**Rationale:** An unbounded collection read turns one caller into a source of unbounded database and serialization work. Query-side ordering lives in `litespec/backend/api#bound-collection-queries`, which this rule's ordering follows. Cursor mechanics live in `litespec/backend/api#use-opaque-cursors-for-collection-paging` and `litespec/backend/api#version-cursors-with-stable-sort-values`.

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

### Use opaque cursors for collection paging

**Requirement:** A collection endpoint MUST page with an opaque cursor and refuse a malformed cursor with 400 and code `invalid_cursor`.

**Rationale:** The endpoint treats the cursor as untrusted input. An unsupported cursor version answers the same refusal.

### Version cursors with stable sort values

**Requirement:** A paging cursor MUST carry a version and the last stable sort values, including a unique tie-breaker, and no sensitive value in readable form.

**Rationale:** The version lets the sort evolve without breaking stored cursors. The tie-breaker matches the query's stable order under `litespec/backend/api#bound-collection-queries`.

### Treat OpenAPI as a generated contract

**Requirement:** A WebApi project MUST generate its OpenAPI document during the Release build.

**Rationale:** A handwritten contract drifts from the code it describes.

**Example:** The API source artifact is `apps/api/openapi/{ProjectName}.json`. In the dotnet stack, WebApi references `Microsoft.AspNetCore.OpenApi` and `Microsoft.Extensions.ApiDescription.Server`, enables `OpenApiGenerateDocuments`, sets `OpenApiDocumentsDirectory` to that directory, and passes `--file-name {ProjectName}` through `OpenApiGenerateDocumentsOptions`.

Build-time generation boots the host. In the dotnet stack, [Microsoft's own guidance](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/openapi/overview) boots the host the same way. A boot reaches every startup guard. A project whose composition refuses to start without a secret, a certificate, or a reachable dependency cannot generate its contract from a clean checkout. Two answers are valid, and the project records which one it uses under `litespec/backend/api#generate-the-contract-without-hosted-dependencies`.

| Answer | What the project does | What it costs |
|:---|:---|:---|
| Generation environment | Set an environment for the generation run whose composition wires no hosted dependency. | The generated document reflects that environment's endpoint set. |
| Deferred guard | Move each startup refusal from composition to first use. | A misconfiguration surfaces on the first request instead of at boot. |

Generation without hosted dependencies follows `litespec/backend/api#generate-the-contract-without-hosted-dependencies`.

When TypeScript consumes the API, the pinned generator reads the source artifact. The generated client, its model types, its request schemas, and its query options are one workspace package, because every frontend and every command reads them.

### Declare stable operation metadata in the contract

**Requirement:** An operation MUST declare a stable `operationId`, its authorization, request, success, and Problem Details metadata, and a summary.

**Rationale:** A stable name becomes `operationId`. Authorization metadata cites the enforced policies, and Problem Details metadata covers every documented failure status. Comments on handlers are not contract documentation, so operations carry explicit summaries and descriptions.

### Commit the generated contract its consumers read

**Requirement:** A WebApi project MUST commit its generated OpenAPI artifact when a frontend or external consumer reads it.

**Rationale:** A committed artifact makes every contract change visible in review and lets CI fail on an unregenerated document. Consumers read the artifact through the generated client, model, schema, and query-option packages.

### Reflect enforced authentication in the contract

**Requirement:** A generated OpenAPI document MUST declare the security scheme and per-operation security requirement for every endpoint that enforces authentication.

**Rationale:** A consumer that learns an authentication requirement from a runtime 401 has already built the wrong client.

**Example:** In the dotnet stack, the implementation registers a document transformer that reads registered authentication schemes through `IAuthenticationSchemeProvider` and adds the matching `securitySchemes` and `security` entries. Handwritten security metadata drifts from registered schemes. An intentionally anonymous operation declares no security requirement.

### Publish precise, complete schemas

**Requirement:** A generated schema MUST declare the closed value set, bounds, format, and required control headers of each field and parameter it describes.

**Rationale:** A caller learns an operation's limits from the document instead of discovering them through a runtime rejection.

**Example:** A label-only set publishes its values as an OpenAPI `enum`. A data-bearing set publishes a polymorphic `oneOf` model with a discriminator per `litespec/backend/api#mirror-a-domain-closed-set-as-a-transport-model-of-the-same-shape`. In the dotnet stack, a named boundary enum carries `[JsonConverter(typeof(JsonStringEnumConverter<T>))]` on its type. Every serializer then honors the contract, including a test client using default options. Host-only conversion breaks readers that do not share host configuration.

An operation requiring a control header declares it as a required parameter, for example `Idempotency-Key` or `If-Match`. The implementation prefers results, enums, and parameter metadata derived from code over handwritten schemas that drift from code. In the dotnet stack, the implementation uses typed results, typed boundary enums, and parameter metadata.

### Expose development tooling in Development only

**Requirement:** A WebApi project MUST expose Scalar and development tooling in Development only.

**Rationale:** Hosted environments do not expose development tooling by default.

### Mirror a Domain closed set as a transport model of the same shape

**Requirement:** A WebApi transport model for a Domain closed set MUST preserve the shape of that set.

**Rationale:** A transport shape that differs from its Domain set discards information the Domain carries. Label-only sets follow `litespec/backend/api#publish-label-only-sets-as-string-enums`, and data-bearing sets follow `litespec/backend/api#mark-polymorphic-models-with-discriminators`. Narrowing follows `litespec/backend/application#record-a-decision-for-closed-set-narrowing`.

**Example:** A label-only set maps to a string `enum`. A data-bearing set maps to a polymorphic model with one case per variant, published as `oneOf` with a discriminator. In the dotnet stack, that model is an abstract base record with one sealed record per case.

### Publish label-only sets as string enums

**Requirement:** A transport model for a label-only set MUST publish its values as an OpenAPI string `enum`.

**Rationale:** The permission to use a plain enum for a label-only set lives in `litespec/backend/domain#model-every-closed-set-of-domain-values-as-a-closed-type-hierarchy`.

### Mark polymorphic models with discriminators

**Requirement:** A data-bearing set MUST map to a polymorphic model with one case per variant, published as `oneOf` with a string discriminator.

**Rationale:** The discriminator property is required on every payload, so no payload validates without naming its case. String discriminators equal the Domain union's stable case codes. Discriminator strings stay stable across identifier renames.

**Example:**

- Declare one polymorphic base with one registered case per variant.
- Carry the metadata on the type, not only in host options.
- Name the discriminator property, using a name such as `type` or `outcome`.
- Opt cases in explicitly, so an unregistered subtype fails serialization.
- A document or schema transformer completes discriminator metadata that the generator omits.

### Reject a collapsed or borrowed wire contract

**Requirement:** A WebApi transport model MUST NOT collapse a data-bearing set into an `enum` or reuse a Domain or Application type as the wire contract.

**Rationale:** Each layer owns its own contract type per `litespec/backend/architecture#own-each-layers-contract-types`. Narrowing follows `litespec/backend/application#record-a-decision-for-closed-set-narrowing`.

## Conventions

### Use this endpoint layout

**Default:** Group endpoint folders by module, then aggregate, then use case, following `litespec/backend/architecture#organize-every-layer-by-module-and-use-case`.

**Replacement:** A consumer replaces this default by recording an Exception for this provision, with reason and review date.

**Rationale:** The folder path matches the specification path, so a reader locates an operation from its use-case identifier.

**Example:** In the dotnet stack, the endpoint layout is:

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

### Name transport types by their boundary role

**Default:** Transport types take the names the suffix table assigns their roles.

**Replacement:** A consumer replaces this default by recording an Exception for this provision, with reason and review date.

**Rationale:** The suffix table lives in `litespec/workspace/naming#use-architectural-suffixes`. A name that ends in its boundary role keeps transport concerns out of Application messages and results.

**Example:** A passive HTTP DTO names its boundary role and ends in `Model`.

### Name routes from resources

**Default:** Derive each route from its resource and subresource, and use an action segment only when the operation maps to neither.

**Replacement:** A consumer replaces this default by recording an Exception for this provision, with reason and review date.

**Example:**

```text
POST   /api/posts
GET    /api/posts/{postId}
GET    /api/posts/{postId}/publication
GET    /api/posts?after={cursor}&limit=20
```

### Keep numeric transport types precise

**Default:** Emit a plain numeric schema for an `int32` or `double` field, and reserve a string-or-number union for `int64` values beyond the JavaScript safe integer range.

**Replacement:** A consumer replaces this default by recording an Exception for this provision, with reason and review date.

**Rationale:** An over-broad union forces every consumer to coerce values that were never strings.

### Model a monetary value as one object

**Default:** Carry a monetary value as one `Money` object in a response model and in a request where the caller chooses the currency.

**Replacement:** A consumer replaces this default by recording an Exception for this provision, with reason and review date.

**Rationale:** Split sibling fields pair by a server invariant the schema cannot see, so a report reads the two independently. `litespec/backend/domain#model-money-with-exact-decimal-values` already carries the same shape in the Domain, and the transport model mirrors it. The object holds `amount` and an ISO 4217 `currency`. A caller who cannot choose the currency cannot set it honestly.

**Example:** `unitPrice` and `currencyCode` become `price` of type `Money`. A request that references an account with a fixed currency carries `amount` alone.

### Name boolean fields as conditions

**Default:** Boolean fields use the same condition names as code, in camel case.

**Replacement:** A consumer replaces this default by recording an Exception for this provision, with reason and review date.

**Rationale:** Boolean names live in `litespec/workspace/naming#use-intent-revealing-boolean-names`, and transport carries the camel-case form.

**Example:** `IsBuyable` in code becomes `isBuyable` on the wire.

### Name time fields with At

**Default:** Time fields end in `At`, following [AIP-142](https://google.aip.dev/142).

**Replacement:** A consumer replaces this default by recording an Exception for this provision, with reason and review date.

**Rationale:** A mixed suffix set hides which shape a field carries.

**Example:** `createdAt` names the creation time.

### Use standard field vocabulary

**Default:** Field names use `created` over `placed`, `languageTag` over `locale`, and `displayName` over `keyName`.

**Replacement:** A consumer replaces this default by recording an Exception for this provision, with reason and review date.

**Rationale:** `languageTag` follows [RFC 5646](https://datatracker.ietf.org/doc/html/rfc5646).

**Example:** `defaultLanguageTag` replaces `defaultLocaleTag`.

### Name failure pairs code and reason

**Default:** A request body names a failure with `code` for the class and `reason` for the explanation.

**Replacement:** A consumer replaces this default by recording an Exception for this provision, with reason and review date.

**Rationale:** The pair mirrors the Problem Details code and detail on the wire under `litespec/backend/api#return-stable-problem-details`.

### Name path parameters per resource

**Default:** Each path parameter names its own resource identity, and a `details` segment takes the aggregate name.

**Replacement:** A consumer replaces this default by recording an Exception for this provision, with reason and review date.

**Rationale:** A shared id hides which resource it identifies.

**Example:** `/api/posts/{postId}` names the post; `/details` takes the aggregate name.

### Avoid noise words in field names

**Default:** Field names carry no type prefix and no noise word.

**Replacement:** A consumer replaces this default by recording an Exception for this provision, with reason and review date.

**Rationale:** The noise words are `data`, `info`, `item`, `object`, `value`, and `thing`; the type prefixes are `str`, `int`, `bool`, `num`, `obj`, and `arr`. A type prefix repeats what the schema already declares, and a noise word names nothing an integrator can act on.

**Example:** `customerInfo` becomes `customer`.

### Declare a smaller collection maximum

**Default:** A use case with stricter needs declares its smaller maximum on its collection query message and states the reason on its use-case record.

**Replacement:** A consumer replaces this default by recording an Exception for this provision, with reason and review date.

**Rationale:** The endpoint enforces the declared maximum under `litespec/backend/api#bound-collection-queries`.

### Use offsets for proven bounded datasets

**Default:** A collection over a proven bounded dataset pages with an offset while the public contract stays cursor-shaped.

**Replacement:** A consumer replaces this default by recording an Exception for this provision, with reason and review date.

**Rationale:** The use-case record states the bound that makes the dataset safe for offsets.

### Generate the contract without hosted dependencies

**Default:** The generation run contacts no hosted dependency and runs no schema change, and the project records its chosen answer.

**Replacement:** A consumer replaces this default by recording an Exception for this provision, with reason and review date.

**Rationale:** A generation environment wires no hosted dependency for the generation run, and the document reflects that environment's endpoint set. A deferred guard moves each startup refusal from composition to first use, and a misconfiguration surfaces on the first request instead of at boot.

## Reference example

This informative example demonstrates `litespec/backend/api#keep-endpoint-dependencies-transport-focused` and `litespec/backend/api#mirror-a-domain-closed-set-as-a-transport-model-of-the-same-shape`.

A create endpoint reads the author from claims. It maps `CreateDraftRequestModel` to `CreateDraftCommand` through `CreateDraftApiMappings`. It sends the command through the command mediator. It maps `CreateDraftCommandResult` to `CreateDraftResponseModel` with the new post location. A read endpoint maps `GetPostQueryResult` through `GetPostApiMappings`. Neither endpoint calls the aggregate factory or the Domain repository.

A refund outcome is a closed set whose cases carry different data. Domain models it once. Application mirrors it per `litespec/backend/application#mirror-a-domain-closed-set-in-the-result`, and WebApi mirrors it again as a polymorphic transport model rather than serializing either inner type.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/backend/api#map-one-operation-per-endpoint | guidance | Does each mapped route resolve to one endpoint type and one mediator dispatch? |
| litespec/backend/api#keep-endpoint-dependencies-transport-focused | guidance | Does any endpoint take a Domain repository, session, context, provider, or service? |
| litespec/backend/api#defer-error-mapping-to-the-global-handler | guidance | Does any endpoint catch an Application or Domain exception? |
| litespec/backend/api#apply-only-coarse-policies-at-the-endpoint | guidance | Does any endpoint decide target authorization instead of enforcing coarse policies? |
| litespec/backend/api#return-stable-problem-details | guidance | Does each error response carry `code`, `traceId`, and field errors? |
| litespec/backend/api#record-each-results-http-status | checkable | `litespec model check` reports `result-status`. |
| litespec/backend/api#use-consistent-status-codes | guidance | Does each operation return its outcome-table status code? |
| litespec/backend/api#require-the-marker-header-on-cookie-authenticated-writes | guidance | Does a cookie-authenticated write without the marker header answer 401? |
| litespec/backend/api#keep-routes-resource-oriented | guidance | Do routes use plural segments, kebab subresources, and body command data? |
| litespec/backend/api#state-an-unexpressible-transition-as-a-custom-method | guidance | Does each unexpressible transition use POST with a colon-suffixed verb? |
| litespec/backend/api#apply-patch-to-a-partial-update | guidance | Does each partial update use PATCH with merge-patch media? |
| litespec/backend/api#use-put-for-a-whole-replacement | guidance | Does each PUT replace the whole resource its path names? |
| litespec/backend/api#bound-collection-queries | guidance | Do collection endpoints order deterministically within default and maximum limits? |
| litespec/backend/api#use-opaque-cursors-for-collection-paging | guidance | Does a malformed cursor answer 400 with code `invalid_cursor`? |
| litespec/backend/api#version-cursors-with-stable-sort-values | guidance | Does each cursor carry a version, stable sort values, and no readable secret? |
| litespec/backend/api#treat-openapi-as-a-generated-contract | guidance | Does the release build regenerate the OpenAPI artifact, with the gate failing on a changed tree? |
| litespec/backend/api#declare-stable-operation-metadata-in-the-contract | guidance | Does each operation declare its operationId, metadata, and summary? |
| litespec/backend/api#commit-the-generated-contract-its-consumers-read | guidance | Is the generated artifact committed and current for each consumer? |
| litespec/backend/api#reflect-enforced-authentication-in-the-contract | guidance | Does each authenticated operation declare its security scheme and requirement? |
| litespec/backend/api#publish-precise-complete-schemas | guidance | Does each schema declare its value set, bounds, format, and control headers? |
| litespec/backend/api#expose-development-tooling-in-development-only | guidance | Do Scalar and development tooling map in Development only? |
| litespec/backend/api#mirror-a-domain-closed-set-as-a-transport-model-of-the-same-shape | guidance | Does each transport model preserve its Domain set shape? |
| litespec/backend/api#publish-label-only-sets-as-string-enums | guidance | Does each label-only set publish a string enum? |
| litespec/backend/api#mark-polymorphic-models-with-discriminators | guidance | Does each data-bearing set publish oneOf with a string discriminator? |
| litespec/backend/api#reject-a-collapsed-or-borrowed-wire-contract | guidance | Does any transport model collapse a set or reuse an inner type? |
| litespec/backend/api#use-this-endpoint-layout | guidance | Does each endpoint folder match its module, aggregate, and use case? |
| litespec/backend/api#name-transport-types-by-their-boundary-role | guidance | Does each transport type carry the suffix its role assigns? |
| litespec/backend/api#name-routes-from-resources | guidance | Does each route derive from its resource with action segments justified? |
| litespec/backend/api#keep-numeric-transport-types-precise | guidance | Does each numeric field publish a plain schema except large int64 unions? |
| litespec/backend/api#model-a-monetary-value-as-one-object | guidance | Does each monetary value travel as one Money object? |
| litespec/backend/api#name-boolean-fields-as-conditions | guidance | Does each boolean field use the camel-case condition name? |
| litespec/backend/api#name-time-fields-with-at | guidance | Does each time field end in At? |
| litespec/backend/api#use-standard-field-vocabulary | guidance | Does each field use the standard vocabulary over its rejected synonym? |
| litespec/backend/api#name-failure-pairs-code-and-reason | guidance | Does each request failure name code for the class and reason? |
| litespec/backend/api#name-path-parameters-per-resource | guidance | Does each path parameter name its own resource identity? |
| litespec/backend/api#avoid-noise-words-in-field-names | guidance | Does any field name carry a type prefix or noise word? |
| litespec/backend/api#declare-a-smaller-collection-maximum | guidance | Does each lowered maximum name its value and reason? |
| litespec/backend/api#use-offsets-for-proven-bounded-datasets | guidance | Does each offset page cite the bound making it safe? |
| litespec/backend/api#generate-the-contract-without-hosted-dependencies | guidance | Does generation avoid hosted dependencies with its answer recorded? |