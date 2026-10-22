namespace Expenses.Domain.Spending.Receipts.Exceptions;

/// <summary>The expense is already decided.</summary>
public sealed class ReceiptExpenseDecidedException()
    : DomainException("The expense is already decided.")
{
    /// <summary>The stable failure code.</summary>
    public override string Code => "spending.expense-decided";
}
