namespace Claimwick.WebApi.Endpoints.Spending.Expenses.SubmitExpense;

/// <summary>The answer to a submit request: the new expense's identity.</summary>
public sealed record SubmitExpenseResponseModel(Guid ExpenseId);
