namespace Claimwick.Domain.Spending.Receipts;

/// <summary>One lifecycle state of a receipt.</summary>
public abstract record ReceiptState;

/// <summary>The receipt is attached to an expense.</summary>
public sealed record ReceiptAttachedState(Guid ExpenseId, DateTimeOffset AttachedAt) : ReceiptState;

/// <summary>The receipt was removed.</summary>
public sealed record ReceiptRemovedState(DateTimeOffset RemovedAt) : ReceiptState;
