namespace Claimwick.Application.Spending.Expenses.ListExpenses;

public sealed record ListExpensesQueryResult(IReadOnlyList<ExpenseSummary> Expenses);
