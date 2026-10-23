namespace Claimwick.WebApi.Endpoints.Spending.Expenses.ListExpenses;

/// <summary>One expense row: its identity, amount, currency, state and submission time.</summary>
public sealed record ExpenseRowModel(Guid ExpenseId, decimal Amount, string Currency, string State, DateTimeOffset SubmittedAt);
