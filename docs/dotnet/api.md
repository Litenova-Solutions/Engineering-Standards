# .NET HTTP API

## Intent

The dotnet backend maps each HTTP operation through one endpoint class and generates its OpenAPI contract at build time. The shared provisions live on the stack-neutral page ([HTTP API](../backend/api.md)); this page holds what the dotnet stack alone requires.

## Agent Summary {#agent-summary}

- One endpoint class per operation dispatches through its mediator, with no MVC controllers. (litespec/rule/dotnet-api.use-one-endpoint-per-operation, litespec/rule/dotnet-api.exclude-mvc-controllers-from-the-profile)
- Operations declare metadata and data-bearing sets map to sealed records with discriminators. (litespec/rule/dotnet-api.declare-operation-metadata-in-the-contract, litespec/rule/dotnet-api.mark-polymorphic-transport-models-with-discriminators)
- `Program.cs` holds composition. (litespec/rule/dotnet-api.keep-programcs-as-composition)

## Standards

### Use one endpoint per operation (litespec/rule/dotnet-api.use-one-endpoint-per-operation)

**Requirement:** A WebApi endpoint MUST implement `IEndpoint`, map one route operation, convert input to an Application message, dispatch through its mediator, and map the result.

**Rationale:** One class per operation gives each route a single owner and keeps the transport boundary reviewable. This provision realizes litespec/rule/backend-api.map-one-operation-per-endpoint in the dotnet stack.

**Example:** The WebApi project owns this contract:

```csharp
internal interface IEndpoint
{
    void MapEndpoint(IEndpointRouteBuilder endpoints);
}
```

At startup, WebApi discovers non-abstract `IEndpoint` implementations in its assembly. It registers each implementation once as an `IEndpoint` singleton. It calls `MapEndpoint` in deterministic type-name order. The discovery code uses framework reflection and dependency injection. It does not require another scanning package.

### Exclude MVC controllers from the profile (litespec/rule/dotnet-api.exclude-mvc-controllers-from-the-profile)

**Requirement:** A WebApi project MUST NOT route requests through MVC controllers or `ControllerBase`.

**Rationale:** A second transport pattern splits routing, filters, and error mapping across two models that behave differently.

### Declare operation metadata in the contract (litespec/rule/dotnet-api.declare-operation-metadata-in-the-contract)

**Requirement:** An operation MUST declare a stable `operationId`, its authorization, request, success, and Problem Details metadata, and typed results or `Produces` metadata, and a summary.

**Rationale:** A stable name through `WithName` becomes `operationId`. Authorization metadata cites the enforced policies, and Problem Details metadata covers every documented failure status. Comments on route lambdas are not contract documentation, so operations carry explicit summaries and descriptions. This provision realizes litespec/rule/backend-api.declare-stable-operation-metadata-in-the-contract in the dotnet stack.

### Mark polymorphic transport models with discriminators (litespec/rule/dotnet-api.mark-polymorphic-transport-models-with-discriminators)

**Requirement:** A data-bearing set MUST map to an abstract base record with one sealed record per case, published as `oneOf` with a string discriminator.

**Rationale:** A concrete base cannot mark the discriminator property as required, so the base stays abstract. String discriminators equal the Domain union's stable case codes. Discriminator strings stay stable across identifier renames. This provision realizes litespec/rule/backend-api.mark-polymorphic-models-with-discriminators in the dotnet stack.

**Example:**

- Declare an abstract base record carrying `JsonPolymorphic` and one `JsonDerivedType` per case.
- Carry the metadata on the type, not only in host options.
- Name the discriminator through `TypeDiscriminatorPropertyName`, using a name such as `type` or `outcome`.
- Opt derived types in explicitly, so an unregistered runtime subtype fails serialization.
- A document or schema transformer completes discriminator metadata that the generator omits.

## Conventions

### Keep Program.cs as composition (litespec/rule/dotnet-api.keep-programcs-as-composition)

**Default:** `Program.cs` holds module registration, middleware order, endpoint discovery, health endpoints, OpenAPI, and host startup, ending with an empty partial `Program` class.

**Replacement:** A consumer replaces this default by recording an Exception for this provision, with reason and review date.

**Rationale:** Order-sensitive middleware stays reviewable when one file shows the sequence. Process composition lives in `litespec/rule/backend-architecture.compose-each-process-explicitly`, which this file implements for WebApi.

**Example:** The visible order is trusted forwarded headers, exception handling, transport security, authentication, authorization, endpoints, then health. Forwarded headers appear only when the deployment boundary requires trusted proxies. OpenAPI and Scalar map only in Development.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/rule/dotnet-api.use-one-endpoint-per-operation | guidance | Does each mapped route resolve to one `IEndpoint` type and one mediator dispatch? |
| litespec/rule/dotnet-api.exclude-mvc-controllers-from-the-profile | guidance | Does any type derive from ControllerBase? |
| litespec/rule/dotnet-api.declare-operation-metadata-in-the-contract | guidance | Does each operation declare its operationId, metadata, typed results, and summary? |
| litespec/rule/dotnet-api.mark-polymorphic-transport-models-with-discriminators | guidance | Does each data-bearing set map to sealed records published as oneOf with a string discriminator? |
| litespec/rule/dotnet-api.keep-programcs-as-composition | guidance | Does `Program.cs` hold only composition in the recorded order? |
