using Library.Domain.Lending.Loans.Exceptions;

namespace Library.Application.Lending.Loans.ReturnCopy;

public sealed class ReturnCopyCommandHandler
{
    public Task Handle(ReturnCopyCommand command)
    {
        if (command.LoanId == Guid.Empty)
            throw new LoanNotActiveException();
        return Task.CompletedTask;
    }
}
