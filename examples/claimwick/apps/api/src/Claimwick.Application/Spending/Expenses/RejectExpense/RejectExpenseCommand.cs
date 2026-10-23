namespace Claimwick.Application.Spending.Expenses.RejectExpense;

public sealed record RejectExpenseCommand(Guid ExpenseId, Guid ApproverId, string Reason);
