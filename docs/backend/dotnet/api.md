# .NET HTTP API

## Intent

Each HTTP operation in a .NET backend runs through one endpoint class in the WebApi project, and the OpenAPI contract is generated from those classes at build time. This page states the endpoint contract, the metadata each operation declares, how transport models express closed sets, and how the global handler derives HTTP statuses from refusal codes. The shared transport rules live on [HTTP API](../api.md); this page holds only their .NET form.

## Concepts

### Endpoint Classes

A WebApi endpoint is a small class that owns one route operation: it converts HTTP input to an Application command or query, sends it through the mediator, and maps the result back to HTTP. Each endpoint implements the project-owned `IEndpoint` contract, so startup code finds every endpoint by scanning the WebApi assembly and maps each one exactly once, in type-name order.

One global handler maps each thrown failure to its HTTP status and Problem Details body, so endpoints carry no error mapping.

### Operation Metadata

The OpenAPI generator builds the published contract from metadata declared on each operation: a stable name, authorization, request and success shapes, failure statuses, and a summary. Comments on route lambdas never reach the contract, so the metadata is declared explicitly with typed results or `Produces` entries.

## Standards

### Use One Endpoint per Operation

**Statement:** A WebApi endpoint MUST implement `IEndpoint`, map one route operation, convert input to an Application message, dispatch through its mediator, and map the result.

**Rationale:** When one class owns one route, a reviewer finds the input mapping, the dispatch, and the result mapping for that route in one place, and no route drifts into a second pattern unnoticed. Without that rule, operations share classes or helpers, and a change to one route silently affects another. This provision states the .NET form of `litespec/backend/api#map-one-operation-per-endpoint`.

**Example:** The WebApi project owns this contract:

```csharp
internal interface IEndpoint
{
    void MapEndpoint(IEndpointRouteBuilder endpoints);
}
```

At startup, WebApi scans its own assembly for non-abstract `IEndpoint` implementations, registers each one once as a singleton, and calls `MapEndpoint` in type-name order. The scan uses framework reflection and dependency injection, so it needs no extra scanning package.

### Exclude MVC Controllers from the Stack

**Statement:** A WebApi project MUST NOT route requests through MVC controllers or `ControllerBase`.

**Rationale:** Controllers and endpoint classes route, filter, and map errors through different models. When both exist, a reviewer checks two mappings for every behavior, and error responses drift apart. One model means one place defines how requests reach handlers and how failures reach clients.

### Declare Operation Metadata in the Contract

**Statement:** An operation MUST declare a stable `operationId`, its authorization, request, success, and Problem Details metadata, and typed results or `Produces` metadata, and a summary.

**Rationale:** Generated clients name their calls from `operationId`, so an unnamed or unstable operation breaks every client regeneration. Authorization and Problem Details metadata tell a client which policies apply and which failures to handle; without them the client guesses. Route-lambda comments never reach the contract, so the summary and description are declared explicitly. This provision states the .NET form of `litespec/backend/api#declare-stable-operation-metadata-in-the-contract`.

### Derive HTTP Statuses from Refusal Codes

**Statement:** WebApi MUST map each refusal code to its HTTP status in one global handler.

**Rationale:** The specification records each refusal with its stable `code` and no transport status, so the stack derives the status its transport needs. The handler uses ASP.NET Core `AddProblemDetails` with one `IExceptionHandler`: validation failures answer 400, missing targets answer through the operation's 404 policy, forbidden failures answer 403 or the declared 404 disclosure policy, conflicts and state rejections answer 409, and unexpected failures answer 500 with code `internal_error`. The derived `invalid-input` refusal answers 400 under the project's `refusals.invalidInput` code, and the derived `forbidden` refusal answers 403 or the declared 404 under the project's `refusals.forbidden` code. Known Domain exception types map individually, and a cancellation from a disconnected request is not reported as an application error. The outcome-to-status assignment lives in `litespec/backend/api#use-consistent-status-codes`; this provision states its .NET form.

**Example:** The handler registers through the framework's Problem Details services:

```csharp
builder.Services.AddProblemDetails();
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
```

The handler maps each known exception type to its status and code, and answers 500 with code `internal_error` for the rest.

### Mark Polymorphic Transport Models with Discriminators

**Statement:** A data-bearing set MUST map to an abstract base record with one sealed record per case, published as `oneOf` with a string discriminator.

**Rationale:** A concrete base record cannot mark the discriminator as required, so a client could send a payload that names no case. String discriminators carry the Domain union's stable case codes, so the wire value survives renames of code identifiers. Without the discriminator, deserialization picks a case by shape, and two cases with similar fields become ambiguous. This provision states the .NET form of `litespec/backend/api#mark-polymorphic-models-with-discriminators`.

**Example:**

- Declare an abstract base record carrying `JsonPolymorphic` and one `JsonDerivedType` per case.
- Carry the metadata on the type, not only in host options.
- Name the discriminator through `TypeDiscriminatorPropertyName`, using a name such as `type` or `outcome`.
- Opt derived types in explicitly, so an unregistered runtime subtype fails serialization.
- Complete discriminator metadata that the generator omits with a document or schema transformer.

## Conventions

### Use the Endpoint Folder Layout

**Default:** Place each endpoint in a folder named for its use case under its module and aggregate, with the files this provision names.

**Replacement:** A project names its endpoint layout in its WebApi documentation.

**Rationale:** The folder path matches the specification path, so a reader locates an operation from its use-case identifier without searching. Transport types take the names their boundary roles assign under `litespec/backend/api#name-transport-types-by-their-boundary-role`, and transport mapping lives in WebApi under `litespec/backend/application#keep-mappings-at-the-owning-boundary`. Response models carry the query's declared `include` groups. Module nesting, including the single-aggregate flat form, follows `litespec/backend/architecture#organize-every-layer-by-module-and-use-case`.

**Example:** The endpoint layout is:

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

### Keep Program.cs as Composition

**Default:** `Program.cs` holds module registration, middleware order, endpoint discovery, health endpoints, OpenAPI, and host startup, ending with an empty partial `Program` class.

**Replacement:** A project names its startup layout in its WebApi documentation.

**Rationale:** Middleware runs in registration order, so authentication registered after endpoints never runs. When one file shows the whole sequence, a reviewer sees the order at a glance; when registration scatters across files, a misplaced call hides. This file is the WebApi form of `litespec/backend/architecture#compose-each-process-explicitly`.

**Example:** The visible order is trusted forwarded headers, exception handling, transport security, authentication, authorization, endpoints, and then health. Forwarded headers appear only when the deployment boundary requires trusted proxies. OpenAPI and Scalar map only in Development.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/backend/dotnet/api#use-one-endpoint-per-operation | guidance | Each mapped route: one `IEndpoint` type converting input, dispatching through its mediator, and mapping the result. |
| litespec/backend/dotnet/api#exclude-mvc-controllers-from-the-stack | checkable | `dotnet build` of the WebApi project reports no LiteSpec.Analyzers LS2003 diagnostic. |
| litespec/backend/dotnet/api#declare-operation-metadata-in-the-contract | guidance | Each operation: a stable `operationId`, authorization, request, success, and Problem Details metadata, typed results or `Produces` entries, and a summary. |
| litespec/backend/dotnet/api#derive-http-statuses-from-refusal-codes | guidance | The WebApi global handler: one `IExceptionHandler` mapping each refusal code to its outcome-table status. |
| litespec/backend/dotnet/api#mark-polymorphic-transport-models-with-discriminators | guidance | Each data-bearing set: an abstract base record with one sealed record per case, published as `oneOf` with a string discriminator. |
| litespec/backend/dotnet/api#use-the-endpoint-folder-layout | guidance | Each endpoint folder under its module and aggregate: the endpoint, request and response models, and mappings named for the use case. |
| litespec/backend/dotnet/api#keep-programcs-as-composition | guidance | `Program.cs`: module registration, middleware order, endpoint discovery, health endpoints, OpenAPI, and host startup in the recorded order. |
