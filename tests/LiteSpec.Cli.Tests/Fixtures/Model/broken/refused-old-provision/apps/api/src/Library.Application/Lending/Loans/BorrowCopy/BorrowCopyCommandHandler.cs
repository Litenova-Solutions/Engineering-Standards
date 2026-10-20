namespace Library.Application.Lending.Loans.BorrowCopy;

public sealed class BorrowCopyCommandHandler
{
    private const string Legacy = "litespec/rule/core-system.retired-example-rule";

    public Task Handle(BorrowCopyCommand command)
    {
        if (command.CopyId == Guid.Empty)
            throw new InvalidOperationException("failure/lending.copy_not_available");
        return Task.CompletedTask;
    }
}
