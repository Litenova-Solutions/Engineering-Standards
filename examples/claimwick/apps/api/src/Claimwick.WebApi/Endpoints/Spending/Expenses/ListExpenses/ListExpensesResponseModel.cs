namespace Claimwick.WebApi.Endpoints.Spending.Expenses.ListExpenses;

/// <summary>The answer to a list request: one row per expense, newest first.</summary>
public sealed record ListExpensesResponseModel(IReadOnlyList<ExpenseRowModel> Expenses);
