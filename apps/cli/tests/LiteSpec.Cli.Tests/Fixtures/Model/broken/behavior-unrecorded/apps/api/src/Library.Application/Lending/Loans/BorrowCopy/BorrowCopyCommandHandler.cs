namespace Library.Application.Lending.Loans.BorrowCopy;

public sealed class BorrowCopyCommandHandler
{
    public Task Handle(BorrowCopyCommand command)
    {
        if (command.CopyId == Guid.Empty)
            throw new InvalidOperationException("lending.copy-not-available");
        if (command.ReaderId == Guid.Empty)
            throw new InvalidOperationException("lending.ghost-refusal");
        return Task.CompletedTask;
    }
}
