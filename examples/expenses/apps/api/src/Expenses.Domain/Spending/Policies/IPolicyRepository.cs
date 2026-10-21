namespace Expenses.Domain.Spending.Policies;

/// <summary>Loads and stages the company spending policy.</summary>
public interface IPolicyRepository
{
    /// <summary>Loads the active policy.</summary>
    Task<Policy> GetActiveAsync(CancellationToken cancellationToken);

    /// <summary>Stages a changed policy for the pipeline's one commit.</summary>
    void Store(Policy policy);
}
