using __PROJECT__.Application.Posts.CreatePost;
using __PROJECT__.Application.Shared;

namespace __PROJECT__.Application.Tests;

public sealed class CreatePostValidatorTests
{
    [Fact]
    public async Task ValidateAsync_reports_missing_actor_and_title()
    {
        var validator = new CreatePostValidator();
        var command = new CreatePostCommand(Guid.NewGuid(), Guid.Empty, " ");

        var action = () => validator.ValidateAsync(command, CancellationToken.None);

        var exception = await action.Should().ThrowAsync<CommandValidationException>();
        exception.Which.Errors.Select(error => error.Code)
            .Should().BeEquivalentTo("actor_required", "title_required");
    }
}

