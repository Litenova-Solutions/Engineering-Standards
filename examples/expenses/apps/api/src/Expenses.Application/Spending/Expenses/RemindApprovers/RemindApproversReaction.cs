using Expenses.Application.Abstractions;

namespace Expenses.Application.Spending.Expenses.RemindApprovers;

/// <implements>use-case/spending.remind-approvers</implements>
/// <summary>Reminds the approver of each submitted expense that waited past the reminder deadline.</summary>
internal sealed class RemindApproversReaction(IClock clock)
{
    /// <summary>Whether a reminder is due for an expense submitted at the given time.</summary>
    public bool IsDue(DateTimeOffset submittedAt) =>
        clock.UtcNow - submittedAt >= TimeSpan.FromDays(3);
}
