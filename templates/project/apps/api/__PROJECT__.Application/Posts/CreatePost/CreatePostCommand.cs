namespace __PROJECT__.Application.Posts.CreatePost;

public sealed record CreatePostCommand(
    Guid PostId,
    Guid ActorId,
    string Title) : ICommand<CreatePostResult>;

