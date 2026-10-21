namespace Expenses.Domain.Spending.Policies.Exceptions;

/// <summary>The threshold is negative.</summary>
public sealed class PolicyNegativeThresholdException()
    : DomainException("The threshold is negative.")
{
    /// <summary>The stable failure code.</summary>
    public override string Code => "failure/spending.negative_threshold";
}
