using __PROJECT__.Domain.Posts;

namespace __PROJECT__.Domain.Tests;

public sealed class PostTests
{
    [Fact]
    public void Create_records_normalized_state_and_domain_event()
    {
        var postId = Guid.NewGuid();
        var authorId = Guid.NewGuid();
        var createdAt = DateTimeOffset.Parse("2026-01-02T03:04:05Z");

        var post = Post.Create(postId, authorId, "  First post  ", createdAt);

        post.Id.Should().Be(postId);
        post.AuthorId.Should().Be(authorId);
        post.Title.Should().Be("First post");
        post.CreatedAt.Should().Be(createdAt);
        post.DomainEvents.Should().ContainSingle().Which.Should().Be(new PostCreated(postId, authorId));
    }

    [Fact]
    public void Create_rejects_an_empty_title()
    {
        var action = () => Post.Create(Guid.NewGuid(), Guid.NewGuid(), " ", DateTimeOffset.UtcNow);

        action.Should().Throw<ArgumentException>().WithParameterName("title");
    }
}

