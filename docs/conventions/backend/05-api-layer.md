# API Layer

This document is the authoritative guide for all design decisions in the WebApi layer. Read it in full before writing or modifying any endpoint code.

---

## Guiding Philosophy

The API layer is a thin adapter. Its only job is to translate HTTP into application commands and queries, and translate results back into HTTP responses. Any logic beyond this translation does not belong here.

An endpoint that makes a domain decision is wrong. An endpoint that queries a database is wrong. An endpoint that contains a `try-catch` block is wrong. The API layer trusts the application layer and trusts the `GlobalExceptionHandler` to handle failures.

---

## Core Principles

1. **Thin endpoints.** No business logic. No domain decisions. Translate, dispatch, return.
2. **Screaming architecture.** Folder structure reveals intent. The `Endpoints/Posts/Create/` folder communicates everything.
3. **Dedicated mapping classes.** HTTP request to application command translation lives in `ApiMappings` classes, not in the endpoint handler method.
4. **Mediator only.** Endpoints inject `ICommandMediator` or `IQueryMediator` depending on their role. They do not inject repositories, read-side abstractions, domain services, `DbContext`, or a unified message bus. Using the specific mediator interface documents the endpoint's intent.
5. **Centralized error handling.** No `try-catch` in endpoints. All exception handling goes through `GlobalExceptionHandler`.
6. **Rich OpenAPI documentation.** Every endpoint MUST call `.WithName()`, `.WithTags()`, `.WithSummary()`, and the appropriate `.Produces<T>()` and `.ProducesProblem()` calls.

---

## The IEndpoint Pattern

Every HTTP endpoint is implemented as a class that implements `IEndpoint`. There are no MVC controllers anywhere in the solution.

### The IEndpoint Interface

```csharp
interface IEndpoint
{
    void MapEndpoint(IEndpointRouteBuilder app);
}
```

### Registration Extension

All endpoints are discovered and registered via a single extension method using assembly scanning:

```csharp
internal static class EndpointExtensions
{
    internal static IServiceCollection AddEndpoints(
        this IServiceCollection services,
        Assembly assembly)
    {
        var endpointTypes = assembly
            .GetTypes()
            .Where(t => t is { IsAbstract: false, IsInterface: false }
                && t.IsAssignableTo(typeof(IEndpoint)));

        foreach (var type in endpointTypes)
        {
            services.AddTransient(typeof(IEndpoint), type);
        }

        return services;
    }

    internal static IApplicationBuilder MapEndpoints(this WebApplication app)
    {
        var endpoints = app.Services.GetRequiredService<IEnumerable<IEndpoint>>();

        foreach (var endpoint in endpoints)
        {
            endpoint.MapEndpoint(app);
        }

        return app;
    }
}
```

### Program.cs Registration

```csharp
builder.Services.AddEndpoints(typeof(Program).Assembly);

// ...

app.MapEndpoints();
```

---

## Folder Structure

```
apps/api/src/{ProjectName}.WebApi/
├── GlobalUsings.cs
├── Endpoints/
│   └── Posts/
│       ├── Create/
│       │   ├── CreatePostEndpoint.cs
│       │   ├── CreatePostRequest.cs
│       │   ├── CreatePostResponse.cs
│       │   └── CreatePostApiMappings.cs
│       ├── Publish/
│       │   ├── PublishPostEndpoint.cs
│       │   └── PublishPostApiMappings.cs
│       └── GetById/
│           ├── GetPostByIdEndpoint.cs
│           ├── GetPostByIdResponse.cs
│           └── GetPostByIdApiMappings.cs
├── Extensions/
│   └── EndpointExtensions.cs
├── Middleware/
│   └── GlobalExceptionHandler.cs
└── Program.cs
```

---

## Complete Write Endpoint Example

### Request Model

```csharp
sealed record CreatePostRequest
{
    public required string Title { get; init; }
    public required string Content { get; init; }
}
```

### Response Model

```csharp
sealed record CreatePostResponse
{
    public required Guid Id { get; init; }
}
```

### API Mappings

The mapping between the HTTP request and the application command lives in a dedicated static class. The endpoint method calls these mappings; it does not construct commands inline.

```csharp
internal static class CreatePostApiMappings
{
    internal static CreatePostCommand ToCommand(this CreatePostRequest request, AuthorId authorId)
    {
        return new CreatePostCommand
        {
            Id = PostId.New(),
            Title = request.Title,
            Content = request.Content,
            AuthorId = authorId
        };
    }

    internal static CreatePostResponse ToResponse(this PostId id)
    {
        return new CreatePostResponse { Id = id.Value };
    }
}
```

### Endpoint Class

WebApi references `Application.Write.Contracts` for `CreatePostCommand` and `PostId`. It references `LiteBus.Commands.Abstractions` for `ICommandMediator`. It does not reference `Application.Write` at all.

```csharp
sealed class CreatePostEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("/posts", HandleAsync)
            .WithName("CreatePost")
            .WithTags("Posts")
            .WithSummary("Creates a new draft post.")
            .Produces<CreatePostResponse>(StatusCodes.Status201Created)
            .ProducesProblem(StatusCodes.Status400BadRequest)
            .RequireAuthorization();
    }

    private static async Task<IResult> HandleAsync(
        CreatePostRequest request,
        ICommandMediator commandMediator,
        IHttpContextAccessor httpContextAccessor,
        CancellationToken cancellationToken)
    {
        var authorId = httpContextAccessor.HttpContext!.User.GetAuthorId();
        var command = request.ToCommand(authorId);
        var postId = await commandMediator.SendAsync(command, cancellationToken);

        return Results.Created($"/posts/{postId.Value}", postId.ToResponse());
    }
}
```

---

## Complete Read Endpoint Example

### Response Model

```csharp
sealed record GetPostByIdResponse
{
    public required Guid Id { get; init; }
    public required string Title { get; init; }
    public required string Content { get; init; }
    public required string AuthorName { get; init; }
    public required DateTime? PublishedAt { get; init; }
}
```

### API Mappings

```csharp
internal static class GetPostByIdApiMappings
{
    internal static GetPostByIdQuery ToQuery(this PostId postId)
    {
        return new GetPostByIdQuery { PostId = postId };
    }

    internal static GetPostByIdResponse ToResponse(this PostResult result)
    {
        return new GetPostByIdResponse
        {
            Id = result.Id.Value,
            Title = result.Title,
            Content = result.Content,
            AuthorName = result.AuthorName,
            PublishedAt = result.PublishedAt
        };
    }
}
```

> **Route parameter type rule.** Route parameters MUST use strongly typed IDs (`PostId`, `OrderId`, etc.) that implement `IParsable<T>`. ASP.NET Core binds them from the route segment. Register `StronglyTypedIdSchemaTransformer` so OpenAPI documents them as `string` (`format: uuid`). See `docs/conventions/backend/02-domain-layer.md` (Strongly-Typed ID Reference).

### Endpoint Class

```csharp
sealed class GetPostByIdEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("/posts/{id}", HandleAsync)
            .WithName("GetPostById")
            .WithTags("Posts")
            .WithSummary("Returns a single post by its ID.")
            .Produces<GetPostByIdResponse>(StatusCodes.Status200OK)
            .ProducesProblem(StatusCodes.Status404NotFound)
            .RequireAuthorization();
    }

    private static async Task<IResult> HandleAsync(
        PostId id,
        IQueryMediator queryMediator,
        CancellationToken cancellationToken)
    {
        var query = id.ToQuery();
        var result = await queryMediator.QueryAsync(query, cancellationToken);

        return Results.Ok(result.ToResponse());
    }
}
```

---

## Route Grouping

When multiple endpoints share a route prefix, use `MapGroup` to avoid repeating the prefix on each endpoint. The group is created in a feature-level registration extension method, not in `Program.cs`.

```csharp
// GOOD: feature-level route group
internal static class PostEndpointGroup
{
    internal static IEndpointRouteBuilder MapPostEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/posts")
            .WithTags("Posts")
            .RequireAuthorization();

        group.MapPost("/", CreatePostEndpoint.Handle)
            .WithName("CreatePost")
            .WithSummary("Creates a new draft post.")
            .Produces<CreatePostResponse>(StatusCodes.Status201Created)
            .ProducesProblem(StatusCodes.Status400BadRequest);

        group.MapGet("/{id}", GetPostByIdEndpoint.Handle)
            .WithName("GetPostById")
            .WithSummary("Returns a single post by its ID.")
            .Produces<GetPostByIdResponse>(StatusCodes.Status200OK)
            .ProducesProblem(StatusCodes.Status404NotFound);

        return app;
    }
}
```

---

## RESTful Conventions

| Verb | Usage | Example URL |
|:---|:---|:---|
| `GET` | Retrieve a resource or collection | `GET /posts/{id}` |
| `POST` | Create a new resource | `POST /posts` |
| `PUT` | Replace a resource entirely | `PUT /posts/{id}` |
| `PATCH` | Apply a partial update to a resource | `PATCH /posts/{id}/title` |
| `DELETE` | Remove a resource | `DELETE /posts/{id}` |

Use resource names in plural lowercase. Nest sub-resources where the relationship is clear: `GET /posts/{id}/tags`.

---

## HTTP Status Code Conventions

| Code | Meaning | When to Use |
|:---|:---|:---|
| `200 OK` | Success with body | `GET`, `PUT`, `PATCH` results |
| `201 Created` | Resource created | `POST` that creates a resource; include `Location` header |
| `204 No Content` | Success without body | `DELETE`, `PUT`/`PATCH` with no return value |
| `400 Bad Request` | Validation failure | `CommandValidationException` or `QueryValidationException` |
| `401 Unauthorized` | Not authenticated | Missing or invalid authentication token |
| `403 Forbidden` | Not authorized | Authenticated but lacks permission |
| `404 Not Found` | Resource not found | `AggregateNotFoundException` |
| `409 Conflict` | Domain invariant violated | `DomainException` |
| `500 Internal Server Error` | Unhandled error | Any exception not mapped to a specific code |

The `GlobalExceptionHandler` maps exception types to these codes automatically. Endpoints MUST NOT manually set status codes based on exception types.

### Standardized Validation Error Schema (RFC 7807)

When an endpoint returns a `400 Bad Request` due to a command or query validation failure (`CommandValidationException` or `QueryValidationException`), the response body **MUST** conform strictly to the **RFC 7807 (Problem Details)** standard with the Content-Type header set to `application/problem+json`.

The response **MUST** include a highly structured `extensions` dictionary containing a flat key-value dictionary of invalid fields and their corresponding error messages. This schema is the contract that the Next.js frontend relies on to display form-level validation errors automatically.

#### Validation Error JSON Schema Example

```json
{
  "type": "https://tools.ietf.org/html/rfc7231#section-6.5.1",
  "title": "Command validation failure",
  "status": 400,
  "detail": "One or more validation errors occurred.",
  "instance": "/posts",
  "extensions": {
    "invalidParams": {
      "title": ["A post title is required and cannot be empty."],
      "authorId": ["A valid Author ID is required."]
    }
  }
}
```

In the backend `GlobalExceptionHandler`, this is achieved by enriching `ProblemDetails` when handling validation exception types:

```csharp
// Middleware/GlobalExceptionHandler.cs
internal sealed class GlobalExceptionHandler : IExceptionHandler
{
    private readonly IProblemDetailsService _problemDetailsService;

    public GlobalExceptionHandler(IProblemDetailsService problemDetailsService)
    {
        _problemDetailsService = problemDetailsService;
    }

    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        var (statusCode, title) = exception switch
        {
            CommandValidationException or QueryValidationException
                => (StatusCodes.Status400BadRequest, "Validation failure"),
            AggregateNotFoundException
                => (StatusCodes.Status404NotFound, "Not found"),
            DomainException
                => (StatusCodes.Status409Conflict, "Domain rule violated"),
            DbUpdateConcurrencyException
                => (StatusCodes.Status409Conflict, "Concurrency conflict"),
            _
                => (StatusCodes.Status500InternalServerError, "An error occurred")
        };

        httpContext.Response.StatusCode = statusCode;

        var problemDetails = new ProblemDetails
        {
            Status = statusCode,
            Title = title,
            // MUST NOT expose exception.Message for 500 responses (OWASP A05 information disclosure).
            Detail = statusCode == StatusCodes.Status500InternalServerError
                ? "An unexpected error occurred. Please contact support."
                : exception.Message
        };

        // Attach field-level validation errors so the frontend can display
        // them next to the relevant form fields.
        if (exception is CommandValidationException commandValidation)
        {
            problemDetails.Extensions["invalidParams"] = commandValidation.ValidationErrors
                .ToDictionary(
                    e => e.PropertyName,
                    e => new[] { e.ErrorMessage });
        }
        else if (exception is QueryValidationException queryValidation)
        {
            problemDetails.Extensions["invalidParams"] = queryValidation.ValidationErrors
                .ToDictionary(
                    e => e.PropertyName,
                    e => new[] { e.ErrorMessage });
        }

        return await _problemDetailsService.TryWriteAsync(
            new ProblemDetailsContext
            {
                HttpContext = httpContext,
                ProblemDetails = problemDetails,
                Exception = exception
            });
    }
}
```

Register the handler in `Program.cs`:

```csharp
builder.Services.AddProblemDetails();
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();

// ...

app.UseExceptionHandler();
```

> **ValidationErrors shape.** The exact type of `ValidationErrors` on `CommandValidationException` and `QueryValidationException` depends on the validation library in use. Adjust the projection to match the exception's actual property names. The `invalidParams` key in the extensions dictionary MUST be a `Dictionary<string, string[]>` where keys are camelCase property names.

---

## OpenAPI Documentation Rules

Every endpoint MUST include all of the following:

```csharp
app.MapPost("/posts", HandleAsync)
    .WithName("CreatePost")
    .WithTags("Posts")
    .WithSummary("Creates a new draft post.")
    .Produces<CreatePostResponse>(StatusCodes.Status201Created)
    .ProducesProblem(StatusCodes.Status400BadRequest)
    .ProducesProblem(StatusCodes.Status401Unauthorized)
    .RequireAuthorization();
```

Endpoints with no OpenAPI documentation MUST NOT be merged to `main`.

---

## API Versioning

Internal applications start with unversioned routes. Public APIs, mobile APIs, partner APIs, and APIs consumed by independently deployed services use URL path versioning from their first public release. See `docs/decisions/api-versioning-policy.md`. When a project has more than one active version, add `Asp.Versioning.Http` with a project ADR.

```csharp
// GOOD: versioned route group for public API
var versionSet = app.NewApiVersionSet()
    .HasApiVersion(new ApiVersion(1))
    .ReportApiVersions()
    .Build();

var group = app.MapGroup("/api/v{version:apiVersion}/posts")
    .WithApiVersionSet(versionSet)
    .MapToApiVersion(1);
```

```csharp
// BAD: public API route has no version boundary
app.MapPost("/posts", HandleAsync);
```

Breaking changes require a new API version. Additive fields, new endpoints, and new optional query parameters do not.

---

## Idempotent Commands

Re-triable `POST` and `PATCH` endpoints MUST support the `Idempotency-Key` header when duplicate execution would create duplicate state, send duplicate notifications, or repeat an external operation. See `docs/conventions/backend/10-reliability.md`.

```csharp
// GOOD: command endpoint accepts Idempotency-Key
private static async Task<IResult> HandleAsync(
    CreatePostRequest request,
    [FromHeader(Name = "Idempotency-Key")] string idempotencyKey,
    ICommandMediator commandMediator,
    CancellationToken cancellationToken)
{
    var command = request.ToCommand(idempotencyKey);
    var result = await commandMediator.SendAsync(command, cancellationToken);

    return Results.Created($"/posts/{result.PostId.Value}", result.ToResponse());
}
```

```csharp
// BAD: retriable command endpoint has no idempotency key
private static async Task<IResult> HandleAsync(
    CreatePostRequest request,
    ICommandMediator commandMediator,
    CancellationToken cancellationToken)
{
    var result = await commandMediator.SendAsync(request.ToCommand(), cancellationToken);
    return Results.Created($"/posts/{result.PostId.Value}", result.ToResponse());
}
```

---

## Rate Limiting

Public, authentication, search, file upload, and expensive command endpoints MUST have a rate limiting policy. Apply policies at the route group when every route in the group shares the same policy; otherwise apply per endpoint.

```csharp
// GOOD: route group applies named policy
var group = app.MapGroup("/posts")
    .RequireAuthorization()
    .RequireRateLimiting("authenticated-api");
```

```csharp
// BAD: expensive endpoint has no rate limit
app.MapPost("/imports", HandleAsync)
    .RequireAuthorization();
```

Rate limits must be load tested before production. Do not partition limits by untrusted arbitrary input because it can create unbounded limiter state.

---

## Canonical Program.cs Structure

The canonical `Program.cs` for all WebApi projects follows this structure. Middleware order is not arbitrary; changing it without understanding the consequences will break authentication, CORS, or rate limiting.

`IHttpContextAccessor` requires `builder.Services.AddHttpContextAccessor()` to be registered. This registration is included in the template below.

```csharp
// WebApi/Program.cs
var builder = WebApplication.CreateBuilder(args);

// Logging
builder.Host.UseSerilog((context, services, configuration) =>
    configuration
        .ReadFrom.Configuration(context.Configuration)
        .ReadFrom.Services(services)
        .Enrich.FromLogContext()
        .Enrich.WithMachineName()
        .Enrich.WithEnvironmentName()
        .WriteTo.Console(new JsonFormatter()));

// Infrastructure and application services
builder.Services.AddInfrastructure(builder.Configuration);

// LiteBus
builder.Services.AddLiteBus(liteBus =>
{
    liteBus.AddCommandModule(module =>
    {
        module.RegisterFromAssembly(typeof(ApplicationWriteAssemblyMarker).Assembly);
        module.RegisterFromAssembly(typeof(InfrastructureAssemblyMarker).Assembly);
    });
    liteBus.AddQueryModule(module =>
    {
        module.RegisterFromAssembly(typeof(ApplicationReadAssemblyMarker).Assembly);
    });
    liteBus.AddEventModule(module =>
    {
        module.RegisterFromAssembly(typeof(ApplicationReactionsAssemblyMarker).Assembly);
    });
});

// Endpoints
builder.Services.AddEndpoints(typeof(Program).Assembly);

// HTTP context accessor (required by endpoints that read claims)
builder.Services.AddHttpContextAccessor();

// Exception handling and problem details
builder.Services.AddProblemDetails();
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();

// OpenAPI
builder.Services.AddOpenApi(options =>
{
    options.AddSchemaTransformer<StronglyTypedIdSchemaTransformer>();
});

// Support build-time OpenAPI generation via Microsoft.Extensions.ApiDescription.Server.
// No custom --export-openapi flag is needed. The spec is written to the build output
// directory automatically during `dotnet build`. See the WebApi .csproj configuration below.

// CORS (policy applied after app.Build() so IOptions<CorsOptions> is available)
builder.Services.AddCors();

// Authentication and authorization
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(/* project-specific configuration */);
builder.Services.AddAuthorization();

// Health checks
builder.Services.AddHealthChecks()
    .AddCheck<PostgreSqlHealthCheck>("postgresql", tags: ["ready"]);

// Rate limiting
builder.Services.AddRateLimiter(/* project-specific policies */);

var app = builder.Build();

// Middleware order. See: https://learn.microsoft.com/en-us/aspnet/core/fundamentals/middleware/
app.UseExceptionHandler();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseSerilogRequestLogging();

var corsOptions = app.Services.GetRequiredService<IOptions<CorsOptions>>().Value;

app.UseRouting();
app.UseCors(policy => policy
    .WithOrigins(corsOptions.AllowedOrigins)
    .AllowAnyHeader()
    .AllowAnyMethod());
app.UseAuthentication();
app.UseAuthorization();

// Rate limiter MUST run after CORS so 429 responses include CORS headers for browser clients.
app.UseRateLimiter();

app.MapEndpoints();

app.MapHealthChecks("/health/live", new HealthCheckOptions
{
    Predicate = _ => false
});
app.MapHealthChecks("/health/ready", new HealthCheckOptions
{
    Predicate = check => check.Tags.Contains("ready")
});

app.Run();

// Required for WebApplicationFactory<Program> in integration tests.
public partial class Program { }
```

Build-time OpenAPI generation uses `Microsoft.Extensions.ApiDescription.Server`. Add this to the WebApi `.csproj`:

```xml
<!-- {ProjectName}.WebApi.csproj -->
<ItemGroup>
  <PackageReference Include="Microsoft.AspNetCore.OpenApi" />
  <PackageReference Include="Microsoft.Extensions.ApiDescription.Server">
    <PrivateAssets>all</PrivateAssets>
    <IncludeAssets>runtime; build; native; contentfiles; analyzers</IncludeAssets>
  </PackageReference>
</ItemGroup>

<PropertyGroup>
  <!-- Output the generated spec to the build output directory -->
  <OpenApiGenerateDocuments>true</OpenApiGenerateDocuments>
  <OpenApiDocumentsDirectory>$(OutputPath)</OpenApiDocumentsDirectory>
</PropertyGroup>
```

During `dotnet build`, the spec is written to the build output directory (for example `bin/Release/net10.0/openapi.json`). Copy it to `packages/api-types/openapi.json` in the CI pipeline for the freshness check. No custom `--export-openapi` flag or runtime generation is needed.

See `docs/conventions/shared/ci-cd.md` and `docs/conventions/shared/monorepo-structure.md` for the complete CI workflow.

For the complete `Program.cs`, see `docs/blueprints/backend/program-cs.md`. The blueprint includes:

- Authentication and authorization.
- CORS with validated options.
- Rate limiting.
- Health checks.
- Exception handler.
- OpenAPI with JWT security scheme.
- LiteBus registration.
- Middleware order.
- `public partial class Program { }` for integration tests.

Project-specific API configuration (authentication scheme, base route prefix, versioning strategy, CORS policies) is documented in a project ADR.
