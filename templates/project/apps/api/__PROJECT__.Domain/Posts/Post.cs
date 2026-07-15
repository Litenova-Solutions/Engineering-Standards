using __PROJECT__.Domain.Shared;

namespace __PROJECT__.Domain.Posts;

public sealed class Post : AggregateRoot
{
    private Post()
    {
    }

    private Post(Guid id, Guid authorId, string title, DateTimeOffset createdAt)
    {
        Id = id;
        AuthorId = authorId;
        Title = title;
        CreatedAt = createdAt;
        RaiseDomainEvent(new PostCreated(id, authorId));
    }

    public Guid Id { get; private set; }

    public Guid AuthorId { get; private set; }

    public string Title { get; private set; } = string.Empty;

    public DateTimeOffset CreatedAt { get; private set; }

    public static Post Create(Guid id, Guid authorId, string title, DateTimeOffset createdAt)
    {
        if (id == Guid.Empty)
        {
            throw new ArgumentException("Post ID is required.", nameof(id));
        }

        if (authorId == Guid.Empty)
        {
            throw new ArgumentException("Author ID is required.", nameof(authorId));
        }

        if (string.IsNullOrWhiteSpace(title))
        {
            throw new ArgumentException("Post title is required.", nameof(title));
        }

        var normalizedTitle = title.Trim();
        if (normalizedTitle.Length > 200)
        {
            throw new ArgumentOutOfRangeException(nameof(title), "Post title cannot exceed 200 characters.");
        }

        return new Post(id, authorId, normalizedTitle, createdAt);
    }
}

