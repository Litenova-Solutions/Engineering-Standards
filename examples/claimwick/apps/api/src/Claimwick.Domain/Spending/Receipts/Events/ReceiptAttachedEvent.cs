namespace Claimwick.Domain.Spending.Receipts.Events;

/// <summary>A receipt was attached.</summary>
public sealed record ReceiptAttachedEvent(Guid ReceiptId, Guid ExpenseId) : IDomainEvent;
