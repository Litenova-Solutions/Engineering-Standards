namespace Claimwick.Domain.Spending.Expenses.Events;

/// <summary>An expense was reimbursed.</summary>
public sealed record ExpenseReimbursedEvent(Guid ExpenseId, decimal Amount, string Currency, DateTimeOffset ReimbursedAt) : IDomainEvent;
