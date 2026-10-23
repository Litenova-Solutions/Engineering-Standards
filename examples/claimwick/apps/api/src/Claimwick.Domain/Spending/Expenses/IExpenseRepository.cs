namespace Claimwick.Domain.Spending.Expenses;

/// <summary>Loads and stages expenses; queries read through the read session instead.</summary>
public interface IExpenseRepository
{
    /// <summary>Loads one expense by its identity.</summary>
    Task<Expense> GetAsync(Guid id, CancellationToken cancellationToken);

    /// <summary>Stages a new or changed expense for the pipeline's one commit.</summary>
    void Store(Expense expense);

    /// <summary>Deletes one expense with the personal data it holds.</summary>
    void Delete(Guid id);
}
