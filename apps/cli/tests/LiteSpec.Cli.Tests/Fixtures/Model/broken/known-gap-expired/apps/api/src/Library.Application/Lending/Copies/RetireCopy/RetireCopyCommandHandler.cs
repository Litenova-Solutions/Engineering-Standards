namespace Library.Application.Lending.Copies.RetireCopy;

public sealed class RetireCopyCommandHandler
{
    public Task Handle(RetireCopyCommand command)
    {
        if (command.CopyId == Guid.Empty)
            throw new InvalidOperationException("lending.copy-on-loan");
        return Task.CompletedTask;
    }
}
