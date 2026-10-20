namespace Library.Application.Lending.Loans.BorrowCopy;

public sealed class BorrowCopyCommandHandler
{
    private const string Legacy = "acceptance-criterion/lending.borrow-copy.old-form";

    public Task Handle(BorrowCopyCommand command)
    {
        if (command.CopyId == Guid.Empty)
            throw new InvalidOperationException("failure/lending.copy_not_available");
        return Task.CompletedTask;
    }
}
