using __PROJECT__.Application.Shared;

namespace __PROJECT__.Application.Posts.CreatePost;

internal sealed class CreatePostValidator : ICommandValidator<CreatePostCommand>
{
    public Task ValidateAsync(CreatePostCommand command, CancellationToken cancellationToken)
    {
        var errors = new List<ValidationError>();
        if (command.ActorId == Guid.Empty)
        {
            errors.Add(new ValidationError("actorId", "actor_required", "An authenticated actor is required."));
        }

        if (string.IsNullOrWhiteSpace(command.Title))
        {
            errors.Add(new ValidationError("title", "title_required", "Title is required."));
        }
        else if (command.Title.Trim().Length > 200)
        {
            errors.Add(new ValidationError("title", "title_too_long", "Title cannot exceed 200 characters."));
        }

        if (errors.Count > 0)
        {
            throw new CommandValidationException(errors);
        }

        return Task.CompletedTask;
    }
}

