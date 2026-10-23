using System.Security.Claims;
using Expenses.Application.Spending.Expenses.ListExpenses;
using LiteBus.Queries.Abstractions;

namespace Expenses.WebApi.Endpoints.Spending.Expenses.ListExpenses;

internal sealed class ListExpensesEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder endpoints)
    {
        endpoints.MapGet("/api/expenses", HandleAsync)
            .WithName("ListExpenses")
            .WithSummary("List the signed-in employee's expenses, newest first.")
            .Produces<ListExpensesResponseModel>(StatusCodes.Status200OK);
    }

    private static async Task<Ok<ListExpensesResponseModel>> HandleAsync(
        ClaimsPrincipal user,
        IQueryMediator mediator,
        CancellationToken cancellationToken)
    {
        // The reader is the signed-in employee, read from verified claims, never from the query string.
        var employeeId = Guid.Parse(user.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var result = await mediator.QueryAsync(new ListExpensesQuery(employeeId), cancellationToken);

        return TypedResults.Ok(new ListExpensesResponseModel(
            result.Expenses
                .Select(expense => new ExpenseRowModel(
                    expense.ExpenseId,
                    expense.Amount,
                    expense.Currency,
                    expense.State,
                    expense.SubmittedAt))
                .ToList()));
    }
}
