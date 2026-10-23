namespace Claimwick.Domain.Spending.Expenses.Events;

/// <summary>An expense was approved.</summary>
public sealed record ExpenseApprovedEvent(Guid ExpenseId, Guid ApprovedBy, DateTimeOffset DecidedAt) : IDomainEvent;
