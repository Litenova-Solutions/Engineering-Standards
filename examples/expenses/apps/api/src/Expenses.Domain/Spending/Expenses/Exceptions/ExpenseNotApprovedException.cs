namespace Expenses.Domain.Spending.Expenses.Exceptions;

/// <summary>The expense is not approved.</summary>
public sealed class ExpenseNotApprovedException()
    : DomainException("The expense is not approved.")
{
    /// <summary>The stable failure code.</summary>
    public override string Code => "spending.not-approved";
}
