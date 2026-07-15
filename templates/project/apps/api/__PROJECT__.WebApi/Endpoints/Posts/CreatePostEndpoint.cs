using System.Security.Claims;
using __PROJECT__.Application.Posts.CreatePost;
using LiteBus.Commands.Abstractions;

namespace __PROJECT__.WebApi.Endpoints.Posts;

internal sealed record CreatePostRequest(string Title);

internal sealed record CreatePostResponse(Guid PostId, string Title);

internal sealed class CreatePostEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("/api/posts", HandleAsync)
            .WithName("CreatePost")
            .WithTags("Posts")
            .Produces<CreatePostResponse>(StatusCodes.Status201Created)
            .ProducesProblem(StatusCodes.Status400BadRequest)
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .RequireAuthorization();
    }

    private static async Task<IResult> HandleAsync(
        CreatePostRequest request,
        ClaimsPrincipal principal,
        ICommandMediator commandMediator,
        CancellationToken cancellationToken)
    {
        if (!Guid.TryParse(principal.FindFirstValue("sub"), out var actorId))
        {
            return Results.Unauthorized();
        }

        var command = new CreatePostCommand(Guid.NewGuid(), actorId, request.Title);
        var result = await commandMediator.SendAsync(command, cancellationToken);
        var response = new CreatePostResponse(result.PostId, result.Title);
        return Results.Created($"/api/posts/{result.PostId}", response);
    }
}

