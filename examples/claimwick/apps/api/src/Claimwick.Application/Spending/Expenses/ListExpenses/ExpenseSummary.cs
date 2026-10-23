namespace Claimwick.Application.Spending.Expenses.ListExpenses;

/// <summary>One row of an employee's expense list, projected by the read session.</summary>
public sealed record ExpenseSummary(Guid ExpenseId, Guid EmployeeId, decimal Amount, string Currency, string State, DateTimeOffset SubmittedAt);
