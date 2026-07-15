using __PROJECT__.Application.Posts.CreatePost;
using __PROJECT__.Domain.Posts;

namespace __PROJECT__.Application.Tests;

public sealed class CreatePostHandlerTests
{
    [Fact]
    public async Task HandleAsync_stages_the_created_aggregate()
    {
        var repository = Substitute.For<IPostRepository>();
        var timeProvider = new StubTimeProvider(DateTimeOffset.Parse("2026-01-02T03:04:05Z"));
        var handler = new CreatePostHandler(repository, timeProvider);
        var command = new CreatePostCommand(Guid.NewGuid(), Guid.NewGuid(), "First post");

        var result = await handler.HandleAsync(command, CancellationToken.None);

        result.PostId.Should().Be(command.PostId);
        result.Title.Should().Be("First post");
        await repository.Received(1).AddAsync(
            Arg.Is<Post>(post => post.Id == command.PostId && post.AuthorId == command.ActorId),
            CancellationToken.None);
    }

    private sealed class StubTimeProvider(DateTimeOffset value) : TimeProvider
    {
        public override DateTimeOffset GetUtcNow() => value;
    }
}

