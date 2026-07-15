using __PROJECT__.Application.Posts.GetPost;
using LiteBus.Queries.Abstractions;

namespace __PROJECT__.WebApi.Endpoints.Posts;

internal sealed class GetPostEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("/api/posts/{postId:guid}", HandleAsync)
            .WithName("GetPost")
            .WithTags("Posts")
            .Produces<PostResult>()
            .ProducesProblem(StatusCodes.Status404NotFound)
            .AllowAnonymous();
    }

    private static async Task<IResult> HandleAsync(
        Guid postId,
        IQueryMediator queryMediator,
        CancellationToken cancellationToken)
    {
        var result = await queryMediator.QueryAsync(new GetPostQuery(postId), cancellationToken);
        return result is null ? Results.NotFound() : Results.Ok(result);
    }
}

