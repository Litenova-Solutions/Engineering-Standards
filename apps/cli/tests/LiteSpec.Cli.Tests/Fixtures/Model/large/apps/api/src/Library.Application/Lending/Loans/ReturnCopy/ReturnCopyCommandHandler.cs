namespace Library.Application.Lending.Loans.ReturnCopy;

public sealed class ReturnCopyCommandHandler
{
    public Task Handle(ReturnCopyCommand command)
    {
        if (command.LoanId == Guid.Empty)
            throw new InvalidOperationException("failure/lending.loan_not_active");
        return Task.CompletedTask;
    }
}
