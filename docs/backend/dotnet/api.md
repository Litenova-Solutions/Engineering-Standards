# .NET HTTP API

## Intent

Each HTTP operation in a .NET backend runs through one endpoint class in the WebApi project, and the OpenAPI contract, the machine-readable description of the API, is generated from those classes at build time. This page states the endpoint contract, the metadata each operation declares, and how transport models (the data shapes WebApi defines for the wire) express closed sets of values (fixed menus such as refund outcomes). One class per route keeps every route reviewable in one place, and generated metadata keeps the published contract complete. The shared transport rules live on [HTTP API](../api.md); this page holds only their .NET form.

## Concepts

### Endpoint classes

A WebApi endpoint is a small class that owns one route operation: it converts HTTP input to an Application command or query, sends it through the mediator, and maps the result back to HTTP. Each endpoint implements the project-owned `IEndpoint` contract, so startup code finds every endpoint by scanning the WebApi assembly and maps each one exactly once, in type-name order.

### Operation metadata

The OpenAPI generator builds the published contract from metadata declared on each operation: a stable name, authorization, request and success shapes, failure statuses, and a summary. Comments on route lambdas never reach the contract, so the metadata is declared explicitly with typed results or `Produces` entries.

## Standards

### Use one endpoint per operation

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

### Exclude MVC controllers from the stack

**Statement:** A WebApi project MUST NOT route requests through MVC controllers or `ControllerBase`.

**Rationale:** Controllers and endpoint classes route, filter, and map errors through different models. When both exist, a reviewer checks two mappings for every behavior, and error responses drift apart. One model means one place defines how requests reach handlers and how failures reach clients.

### Declare operation metadata in the contract

**Statement:** An operation MUST declare a stable `operationId`, its authorization, request, success, and Problem Details metadata, and typed results or `Produces` metadata, and a summary.

**Rationale:** Generated clients name their calls from `operationId`, so an unnamed or unstable operation breaks every client regeneration. Authorization and Problem Details metadata tell a client which policies apply and which failures to handle; without them the client guesses. Route-lambda comments never reach the contract, so the summary and description are declared explicitly. This provision states the .NET form of `litespec/backend/api#declare-stable-operation-metadata-in-the-contract`.

### Mark polymorphic transport models with discriminators

**Statement:** A data-bearing set MUST map to an abstract base record with one sealed record per case, published as `oneOf` with a string discriminator.

**Rationale:** A concrete base record cannot mark the discriminator as required, so a client could send a payload that names no case. String discriminators carry the Domain union's stable case codes, so the wire value survives renames of code identifiers. Without the discriminator, deserialization picks a case by shape, and two cases with similar fields become ambiguous. This provision states the .NET form of `litespec/backend/api#mark-polymorphic-models-with-discriminators`.

**Example:**

- Declare an abstract base record carrying `JsonPolymorphic` and one `JsonDerivedType` per case.
- Carry the metadata on the type, not only in host options.
- Name the discriminator through `TypeDiscriminatorPropertyName`, using a name such as `type` or `outcome`.
- Opt derived types in explicitly, so an unregistered runtime subtype fails serialization.
- Complete discriminator metadata that the generator omits with a document or schema transformer.

## Conventions

### Keep Program.cs as composition

**Default:** `Program.cs` holds module registration, middleware order, endpoint discovery, health endpoints, OpenAPI, and host startup, ending with an empty partial `Program` class.

**Replacement:** A consumer replaces this default by recording an Exception for this provision, with reason and review date.

**Rationale:** Middleware runs in registration order, so authentication registered after endpoints never runs. When one file shows the whole sequence, a reviewer sees the order at a glance; when registration scatters across files, a misplaced call hides. This file is the WebApi form of `litespec/backend/architecture#compose-each-process-explicitly`.

**Example:** The visible order is trusted forwarded headers, exception handling, transport security, authentication, authorization, endpoints, and then health. Forwarded headers appear only when the deployment boundary requires trusted proxies. OpenAPI and Scalar map only in Development.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/backend/dotnet/api#use-one-endpoint-per-operation | guidance | Does each mapped route resolve to one `IEndpoint` type and one mediator dispatch? |
| litespec/backend/dotnet/api#exclude-mvc-controllers-from-the-stack | checkable | `dotnet build` of the WebApi project reports no LiteSpec.Analyzers LS2003 diagnostic. |
| litespec/backend/dotnet/api#declare-operation-metadata-in-the-contract | guidance | Does each operation declare its `operationId`, metadata, typed results, and summary? |
| litespec/backend/dotnet/api#mark-polymorphic-transport-models-with-discriminators | guidance | Does each data-bearing set map to sealed records published as `oneOf` with a string discriminator? |
| litespec/backend/dotnet/api#keep-programcs-as-composition | guidance | Does `Program.cs` hold only composition in the recorded order? |
