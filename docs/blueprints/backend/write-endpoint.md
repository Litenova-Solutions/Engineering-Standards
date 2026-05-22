# Blueprint: Write Endpoint

Complete `IEndpoint` scaffold. Copy to `apps/api/src/{ProjectName}.WebApi/Endpoints/Posts/Create/`.

---

## `CreatePostRequest.cs`

```csharp
sealed record CreatePostRequest
{
    public required string Title { get; init; }
    public required string Content { get; init; }
}
```

---

## `CreatePostResponse.cs`

```csharp
sealed record CreatePostResponse
{
    public required Guid Id { get; init; }
}
```

---

## `CreatePostApiMappings.cs`

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

---

## `CreatePostEndpoint.cs`

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
            .RequireAuthorization()
            .RequireRateLimiting(RateLimitPolicies.AuthenticatedApi);
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

See `docs/conventions/backend/05-api-layer.md` for read endpoints and idempotency headers.
