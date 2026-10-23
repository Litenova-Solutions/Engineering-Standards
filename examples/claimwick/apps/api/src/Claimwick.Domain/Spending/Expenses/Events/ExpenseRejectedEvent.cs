namespace Claimwick.Domain.Spending.Expenses.Events;

/// <summary>An expense was rejected.</summary>
public sealed record ExpenseRejectedEvent(Guid ExpenseId, Guid RejectedBy, DateTimeOffset DecidedAt) : IDomainEvent;
