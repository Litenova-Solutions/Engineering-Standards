using Library.Domain.Lending.Copies.Exceptions;

namespace Library.Application.Lending.Copies.RetireCopy;

public sealed class RetireCopyCommandHandler
{
    public Task Handle(RetireCopyCommand command)
    {
        if (command.CopyId == Guid.Empty)
            throw new CopyOnLoanException();
        return Task.CompletedTask;
    }
}
