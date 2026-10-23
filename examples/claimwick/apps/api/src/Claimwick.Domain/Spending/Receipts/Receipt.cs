namespace Claimwick.Domain.Spending.Receipts;

/// <summary>Proof of payment attached to an expense.</summary>
public sealed class Receipt
{
    private Receipt(Guid id, Guid expenseId, DateTimeOffset attachedAt)
    {
        Id = id;
        State = new ReceiptAttachedState(expenseId, attachedAt);
    }

    /// <summary>The receipt identity.</summary>
    public Guid Id { get; }

    /// <summary>The current lifecycle state.</summary>
    public ReceiptState State { get; private set; }

    /// <summary>Attaches one receipt to an expense.</summary>
    public static Receipt Attach(Guid id, Guid expenseId, DateTimeOffset attachedAt) =>
        new(id, expenseId, attachedAt);

    /// <summary>Removes an attached receipt.</summary>
    public void Remove(DateTimeOffset removedAt)
    {
        State = new ReceiptRemovedState(removedAt);
    }
}
