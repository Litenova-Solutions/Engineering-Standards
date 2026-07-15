using __PROJECT__.Domain.Posts;
using Marten;

namespace __PROJECT__.Application.Posts.GetPost;

internal sealed class GetPostHandler(IQuerySession session)
    : IQueryHandler<GetPostQuery, PostResult?>
{
    public Task<PostResult?> HandleAsync(
        GetPostQuery query,
        CancellationToken cancellationToken) =>
        session.Query<Post>()
            .Where(post => post.Id == query.PostId)
            .Select(post => new PostResult(post.Id, post.AuthorId, post.Title, post.CreatedAt))
            .SingleOrDefaultAsync(cancellationToken);
}

