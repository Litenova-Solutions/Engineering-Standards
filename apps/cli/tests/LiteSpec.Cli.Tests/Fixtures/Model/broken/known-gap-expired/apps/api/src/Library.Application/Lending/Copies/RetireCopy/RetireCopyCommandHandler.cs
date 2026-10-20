namespace Library.Application.Lending.Copies.RetireCopy;

public sealed class RetireCopyCommandHandler
{
    public Task Handle(RetireCopyCommand command)
    {
        if (command.CopyId == Guid.Empty)
            throw new InvalidOperationException("failure/lending.copy_on_loan");
        return Task.CompletedTask;
    }
}
