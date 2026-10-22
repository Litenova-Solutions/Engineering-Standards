namespace Library.Application.Lending.Loans.BorrowCopy;

public sealed class BorrowCopyCommandHandler
{
    public Task Handle(BorrowCopyCommand command)
    {
        if (command.CopyId == Guid.Empty)
            throw new InvalidOperationException("lending.copy-not-available");
        return Task.CompletedTask;
    }
}
