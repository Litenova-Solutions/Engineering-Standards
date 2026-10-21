namespace Expenses.Domain.Spending.Expenses.Exceptions;

/// <summary>An expense above the receipt threshold carries no receipt.</summary>
public sealed class ExpenseReceiptMissingException()
    : DomainException("An expense above the receipt threshold carries no receipt.")
{
    /// <summary>The stable failure code.</summary>
    public override string Code => "failure/spending.receipt_missing";
}
