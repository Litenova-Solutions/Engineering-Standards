using Library.Domain.Lending.Copies.Exceptions;

namespace Library.Application.Lending.Copies.RegisterCopy;

public sealed class RegisterCopyCommandHandler
{
    public Task Handle(RegisterCopyCommand command)
    {
        if (string.IsNullOrWhiteSpace(command.CopyId))
            throw new CopyAlreadyRegisteredException();
        return Task.CompletedTask;
    }
}
