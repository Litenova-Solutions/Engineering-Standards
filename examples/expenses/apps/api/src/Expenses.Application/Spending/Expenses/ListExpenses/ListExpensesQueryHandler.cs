using LiteBus.Queries.Abstractions;
using Marten;

namespace Expenses.Application.Spending.Expenses.ListExpenses;

internal sealed class ListExpensesQueryHandler(
    IQuerySession session) : IQueryHandler<ListExpensesQuery, ListExpensesQueryResult>
{
    public async Task<ListExpensesQueryResult> HandleAsync(
        ListExpensesQuery query,
        CancellationToken cancellationToken)
    {
        var expenses = await session.Query<ExpenseSummary>()
            .Where(summary => summary.EmployeeId == query.EmployeeId)
            .OrderByDescending(summary => summary.SubmittedAt)
            .Take(100)
            .ToListAsync(cancellationToken);
        return new ListExpensesQueryResult(expenses);
    }
}
