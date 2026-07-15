using __PROJECT__.Domain.Posts;

namespace __PROJECT__.Application.Posts.CreatePost;

internal sealed class CreatePostHandler(
    IPostRepository repository,
    TimeProvider timeProvider) : ICommandHandler<CreatePostCommand, CreatePostResult>
{
    public async Task<CreatePostResult> HandleAsync(
        CreatePostCommand command,
        CancellationToken cancellationToken)
    {
        var post = Post.Create(command.PostId, command.ActorId, command.Title, timeProvider.GetUtcNow());
        await repository.AddAsync(post, cancellationToken);
        return new CreatePostResult(post.Id, post.Title);
    }
}

