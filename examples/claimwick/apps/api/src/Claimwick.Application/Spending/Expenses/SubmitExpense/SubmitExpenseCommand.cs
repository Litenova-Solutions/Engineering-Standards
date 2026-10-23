namespace Claimwick.Application.Spending.Expenses.SubmitExpense;

public sealed record SubmitExpenseCommand(Guid ExpenseId, Guid EmployeeId, decimal Amount, string Currency, Guid? ReceiptId);
