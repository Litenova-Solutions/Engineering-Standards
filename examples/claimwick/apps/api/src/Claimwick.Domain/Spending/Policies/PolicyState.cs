namespace Claimwick.Domain.Spending.Policies;

/// <summary>One lifecycle state of the spending policy.</summary>
public abstract record PolicyState;

/// <summary>The policy holds with its threshold.</summary>
public sealed record PolicyActiveState(Money Threshold) : PolicyState;

/// <summary>The policy was retired.</summary>
public sealed record PolicyRetiredState(DateTimeOffset RetiredAt) : PolicyState;
