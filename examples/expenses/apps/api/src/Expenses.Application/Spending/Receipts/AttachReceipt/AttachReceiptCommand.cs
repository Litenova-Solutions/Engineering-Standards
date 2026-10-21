namespace Expenses.Application.Spending.Receipts.AttachReceipt;

public sealed record AttachReceiptCommand(Guid ReceiptId, Guid ExpenseId);
