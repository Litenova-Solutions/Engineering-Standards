using Library.Domain.Lending.Loans.Exceptions;

namespace Library.Application.Lending.Loans.BorrowCopy;

public sealed class BorrowCopyCommandHandler(ICommandMediator mediator)
{
    // A dotted literal outside a Code member declares no refusal code.
    private const string AuditAction = "lending.borrow-copy";

    public async Task Handle(BorrowCopyCommand command)
    {
        if (command.CopyId == Guid.Empty)
            throw new CopyNotAvailableException();
        await mediator.SendAsync(new PurgeLoansCommand());
    }
}
