using Library.Domain.Lending.Loans.Exceptions;

namespace Library.Application.Lending.Loans.BorrowCopy;

public sealed class BorrowCopyCommandHandler
{
    // A dotted literal outside a Code member declares no refusal code.
    private const string AuditAction = "lending.borrow-copy";

    public Task Handle(BorrowCopyCommand command)
    {
        if (command.CopyId == Guid.Empty)
            throw new CopyNotAvailableException();
        if (command.ReaderId == Guid.Empty)
            throw new LoanGhostRefusalException();
        return Task.CompletedTask;
    }
}
