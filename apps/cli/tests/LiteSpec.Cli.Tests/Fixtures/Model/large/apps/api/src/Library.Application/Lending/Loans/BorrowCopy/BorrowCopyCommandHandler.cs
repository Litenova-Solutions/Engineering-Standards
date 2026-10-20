namespace Library.Application.Lending.Loans.BorrowCopy;

public sealed class BorrowCopyCommandHandler
{
    public Task Handle(BorrowCopyCommand command)
    {
        if (command.CopyId == Guid.Empty)
            throw new InvalidOperationException("failure/lending.copy_not_available");
        return Task.CompletedTask;
    }
}
