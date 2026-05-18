# API Layer

This document is the authoritative guide for all design decisions in the WebApi layer of a Litenova Solutions project. Read it in full before writing or modifying any endpoint code.

---

## Guiding Philosophy

The API layer is a thin adapter. Its only job is to translate HTTP into application commands and queries, and translate results back into HTTP responses. Any logic beyond this translation does not belong here.

An endpoint that makes a domain decision is wrong. An endpoint that runs a query against a database is wrong. An endpoint that contains a `try-catch` block is wrong. The API layer trusts the application layer to do the right thing and trusts the `GlobalExceptionHandler` to handle failures.

---

## Core Principles

1. **Thin endpoints.** No business logic. No domain decisions. Translate, dispatch, return.
2. **Screaming architecture.** Folder structure reveals intent. The `Endpoints/Posts/Create/` folder tells you everything.
3. **Dedicated mapping classes.** HTTP request → application command translation lives in `ApiMappings` classes, not in the endpoint handler method.
4. **Mediator only.** Endpoints inject `ILiteBus`. They do not inject repositories, read stores, domain services, or any other application type directly.
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
static class EndpointExtensions
{
    internal static IServiceCollection AddEndpoints(this IServiceCollection services, Assembly assembly)
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
src/{ProjectName}.WebApi/
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
│       ├── GetById/
│       │   ├── GetPostByIdEndpoint.cs
│       │   ├── GetPostByIdResponse.cs
│       │   └── GetPostByIdApiMappings.cs
│       └── Shared/
│           └── PostResponse.cs
├── Extensions/
│   └── EndpointExtensions.cs
├── Middleware/
│   └── GlobalExceptionHandler.cs
└── Program.cs
```

---

## Complete Write Endpoint Example

This example shows the full pattern for a command endpoint (POST).

### Request Model

```csharp
// CreatePostRequest.cs
sealed record CreatePostRequest
{
    public required string Title { get; init; }
    public required string Content { get; init; }
}
```

### Response Model

```csharp
// CreatePostResponse.cs
sealed record CreatePostResponse
{
    public required Guid Id { get; init; }
}
```

### API Mappings

The mapping between the HTTP request and the application command lives in a dedicated static class. The endpoint method itself calls these mappings; it does not construct commands inline.

```csharp
// CreatePostApiMappings.cs
static class CreatePostApiMappings
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

```csharp
// CreatePostEndpoint.cs
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
        ILiteBus liteBus,
        IHttpContextAccessor httpContextAccessor,
        CancellationToken cancellationToken)
    {
        var authorId = httpContextAccessor.HttpContext!.User.GetAuthorId();
        var command = request.ToCommand(authorId);
        var postId = await liteBus.SendAsync(command, cancellationToken);

        return Results.Created($"/posts/{postId.Value}", postId.ToResponse());
    }
}
```

---

## Complete Read Endpoint Example

This example shows the full pattern for a query endpoint (GET).

### Response Model

```csharp
// GetPostByIdResponse.cs
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
// GetPostByIdApiMappings.cs
static class GetPostByIdApiMappings
{
    internal static GetPostByIdQuery ToQuery(this Guid postId)
    {
        return new GetPostByIdQuery { PostId = new PostId(postId) };
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

### Endpoint Class

```csharp
// GetPostByIdEndpoint.cs
sealed class GetPostByIdEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("/posts/{id:guid}", HandleAsync)
            .WithName("GetPostById")
            .WithTags("Posts")
            .WithSummary("Returns a single post by its ID.")
            .Produces<GetPostByIdResponse>(StatusCodes.Status200OK)
            .ProducesProblem(StatusCodes.Status404NotFound)
            .RequireAuthorization();
    }

    private static async Task<IResult> HandleAsync(
        Guid id,
        ILiteBus liteBus,
        CancellationToken cancellationToken)
    {
        var query = id.ToQuery();
        var result = await liteBus.QueryAsync(query, cancellationToken);

        return Results.Ok(result.ToResponse());
    }
}
```

---

## RESTful Conventions

| Verb | Usage | Example URL |
|---|---|---|
| `GET` | Retrieve a resource or collection | `GET /posts/{id}` |
| `POST` | Create a new resource | `POST /posts` |
| `PUT` | Replace a resource entirely | `PUT /posts/{id}` |
| `PATCH` | Apply a partial update to a resource | `PATCH /posts/{id}/title` |
| `DELETE` | Remove a resource | `DELETE /posts/{id}` |

Use resource names in plural lowercase. Nest sub-resources where the relationship is clear: `GET /posts/{id}/tags`.

---

## HTTP Status Code Conventions

| Code | Meaning | When to Use |
|---|---|---|
| `200 OK` | Success with body | `GET`, `PUT`, `PATCH` results |
| `201 Created` | Resource created | `POST` that creates a resource; include `Location` header |
| `204 No Content` | Success without body | `DELETE`, `PUT`/`PATCH` with no return value |
| `400 Bad Request` | Validation failure | `ApplicationValidationException` (see `06-exception-hierarchy.md`) |
| `401 Unauthorized` | Not authenticated | Missing or invalid authentication token |
| `403 Forbidden` | Not authorized | Authenticated but lacks permission |
| `404 Not Found` | Resource not found | `AggregateNotFoundException` (see `06-exception-hierarchy.md`) |
| `409 Conflict` | Domain invariant violated | `DomainException` (see `06-exception-hierarchy.md`) |
| `500 Internal Server Error` | Unhandled error | Any exception not mapped to a specific code |

The `GlobalExceptionHandler` maps exception types to these codes automatically. Endpoints MUST NOT manually set status codes based on exception types.

---

## OpenAPI Documentation Rules

Every endpoint MUST include all of the following:

```csharp
app.MapPost("/posts", HandleAsync)
    .WithName("CreatePost")             // ← unique operation name (used as operationId in OpenAPI)
    .WithTags("Posts")                  // ← groups endpoints in Swagger UI
    .WithSummary("Creates a new draft post.")  // ← one-sentence description
    .WithDescription("...")             // ← (optional) extended description for complex endpoints
    .Produces<CreatePostResponse>(StatusCodes.Status201Created)   // ← success response
    .ProducesProblem(StatusCodes.Status400BadRequest)             // ← validation failure
    .ProducesProblem(StatusCodes.Status401Unauthorized)           // ← if auth required
    .RequireAuthorization();
```

Endpoints with no OpenAPI documentation MUST NOT be merged to `main`.

---

## Project-Specific Configuration

> **Note:** This section is filled in per-project. It covers the HTTP-level configuration specific to this project.

When filling in this section, include:

- **Authentication scheme** used (e.g., JWT Bearer, API Key, cookie-based)
- **Base route prefix** if any (e.g., `/api/v1`)
- **API versioning strategy** (e.g., URL path versioning, header versioning)
- **CORS policy names** and which origins are allowed in which environment
- **Authorization policy names** defined as constants and what they require
- **Rate limiting policies** if applicable
