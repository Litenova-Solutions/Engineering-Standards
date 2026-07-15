namespace __PROJECT__.Application.Posts.GetPost;

public sealed record GetPostQuery(Guid PostId) : IQuery<PostResult?>;

