namespace __PROJECT__.Application.Posts.GetPost;

public sealed record PostResult(
    Guid PostId,
    Guid AuthorId,
    string Title,
    DateTimeOffset CreatedAt);

