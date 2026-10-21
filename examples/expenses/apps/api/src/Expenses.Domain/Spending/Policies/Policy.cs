using Expenses.Domain.Spending.Policies.Exceptions;

namespace Expenses.Domain.Spending.Policies;

/// <summary>The company spending policy and its receipt threshold.</summary>
public sealed class Policy
{
    private Policy(Money threshold)
    {
        State = new PolicyActiveState(threshold);
    }

    /// <summary>The current lifecycle state.</summary>
    public PolicyState State { get; private set; }

    /// <summary>The receipt threshold of the active policy.</summary>
    public Money ReceiptThreshold => ((PolicyActiveState)State).Threshold;

    /// <summary>Activates one policy with its threshold.</summary>
    public static Policy Activate(Money threshold)
    {
        if (threshold.Amount < 0)
        {
            throw new PolicyNegativeThresholdException();
        }

        return new Policy(threshold);
    }

    /// <summary>Sets the receipt threshold.</summary>
    public void SetThreshold(Money threshold)
    {
        if (threshold.Amount < 0)
        {
            throw new PolicyNegativeThresholdException();
        }

        State = new PolicyActiveState(threshold);
    }

    /// <summary>Retires the policy.</summary>
    public void Retire(DateTimeOffset retiredAt)
    {
        State = new PolicyRetiredState(retiredAt);
    }
}
