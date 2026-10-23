namespace Claimwick.Application.Spending.Receipts.AttachReceipt;

public sealed record AttachReceiptCommandResult(Guid ExpenseId, Guid ReceiptId);
