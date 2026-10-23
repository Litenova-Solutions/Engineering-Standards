namespace Claimwick.Domain.Spending.Expenses.Events;

/// <summary>An expense was submitted.</summary>
public sealed record ExpenseSubmittedEvent(Guid ExpenseId, decimal Amount, string Currency, Guid EmployeeId) : IDomainEvent;
