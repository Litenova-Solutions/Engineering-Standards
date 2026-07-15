namespace __PROJECT__.Application.Shared;

public sealed class CommandValidationException(IReadOnlyList<ValidationError> errors)
    : Exception("Command validation failed.")
{
    public IReadOnlyList<ValidationError> Errors { get; } = errors;
}

