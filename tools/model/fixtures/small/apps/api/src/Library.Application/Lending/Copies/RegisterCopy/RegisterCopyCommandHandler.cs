namespace Library.Application.Lending.Copies.RegisterCopy;

public sealed class RegisterCopyCommandHandler
{
    public Task Handle(RegisterCopyCommand command)
    {
        if (string.IsNullOrWhiteSpace(command.CopyId))
            throw new InvalidOperationException("failure/lending.copy_already_registered");
        return Task.CompletedTask;
    }
}
