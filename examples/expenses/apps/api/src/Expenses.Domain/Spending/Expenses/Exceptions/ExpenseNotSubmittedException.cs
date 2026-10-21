namespace Expenses.Domain.Spending.Expenses.Exceptions;

/// <summary>The expense is already decided.</summary>
public sealed class ExpenseNotSubmittedException()
    : DomainException("The expense is already decided.")
{
    /// <summary>The stable failure code.</summary>
    public override string Code => "failure/spending.not_submitted";
}
