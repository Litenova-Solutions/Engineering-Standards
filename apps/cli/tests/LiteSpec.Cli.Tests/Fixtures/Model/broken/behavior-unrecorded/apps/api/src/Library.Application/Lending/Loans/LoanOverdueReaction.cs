namespace Library.Application.Lending.Loans;

/// <summary>Watches for overdue loans.</summary>
public sealed class LoanOverdueReaction : IEventHandler<LoanOverdueEvent>
{
    public Task Handle(LoanOverdueEvent domainEvent) => Task.CompletedTask;
}
