namespace Library.Application.Lending.Copies.RegisterCopy;

public sealed class RegisterCopyCommandHandler
{
    public Task Handle(RegisterCopyCommand command)
    {
        if (string.IsNullOrWhiteSpace(command.CopyId))
            throw new InvalidOperationException("lending.copy-already-registered");
        return Task.CompletedTask;
    }
}
