namespace Expenses.Domain.Spending.Expenses.Exceptions;

/// <summary>The expense is already reimbursed.</summary>
public sealed class ExpenseAlreadyReimbursedException()
    : DomainException("The expense is already reimbursed.")
{
    /// <summary>The stable failure code.</summary>
    public override string Code => "spending.already-reimbursed";
}
