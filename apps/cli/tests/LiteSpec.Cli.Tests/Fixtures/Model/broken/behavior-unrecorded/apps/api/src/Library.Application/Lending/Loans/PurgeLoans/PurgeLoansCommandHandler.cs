namespace Library.Application.Lending.Loans.PurgeLoans;

public sealed class PurgeLoansCommandHandler
{
    public Task Handle(PurgeLoansCommand command) => Task.CompletedTask;
}
