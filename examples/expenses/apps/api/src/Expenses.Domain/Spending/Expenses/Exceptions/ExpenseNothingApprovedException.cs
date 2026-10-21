namespace Expenses.Domain.Spending.Expenses.Exceptions;

/// <summary>No approved expense awaits export.</summary>
public sealed class ExpenseNothingApprovedException()
    : DomainException("No approved expense awaits export.")
{
    /// <summary>The stable failure code.</summary>
    public override string Code => "failure/spending.nothing_approved";
}
