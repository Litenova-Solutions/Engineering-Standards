namespace Library.Application.Lending.Loans.RemindOverdue;

/// <implements>use-case/lending.remind-overdue</implements>
public sealed class RemindOverdueReaction : IEventHandler<LoanOverdueEvent>
{
    public Task Handle(LoanOverdueEvent domainEvent) => Task.CompletedTask;
}
