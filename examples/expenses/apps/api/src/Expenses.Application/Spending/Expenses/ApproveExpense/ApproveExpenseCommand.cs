namespace Expenses.Application.Spending.Expenses.ApproveExpense;

public sealed record ApproveExpenseCommand(Guid ExpenseId, Guid ApproverId);
