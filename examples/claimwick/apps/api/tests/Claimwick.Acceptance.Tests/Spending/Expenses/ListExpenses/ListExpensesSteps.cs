using System.Net;
using Claimwick.Acceptance.Tests.Support;

namespace Claimwick.Acceptance.Tests.Spending.Expenses.ListExpenses;

public sealed class ListExpensesSteps
{
    public async Task ListOwnExpensesAsync(string employee)
    {
        await ExpensesWorld.GetAsync($"/api/expenses?employeeId={ExpensesWorld.IdOf(employee)}");
    }

    public Task TheExpensesAreListedAsync()
    {
        Assert.Equal(HttpStatusCode.OK, ExpensesWorld.LastResponse!.StatusCode);
        return Task.CompletedTask;
    }
}
