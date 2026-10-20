namespace Library.Application.Lending.Loans.ExtendLoan;

public sealed class ExtendLoanCommandHandler
{
    public Task Handle(ExtendLoanCommand command)
    {
        if (command.Days <= 0)
            throw new InvalidOperationException("failure/lending.extension_refused");
        return Task.CompletedTask;
    }
}
