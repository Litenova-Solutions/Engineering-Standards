using System.Net;
using Expenses.Acceptance.Tests.Support;

namespace Expenses.Acceptance.Tests.Spending.Expenses.ReimburseExpense;

public sealed class ReimburseExpenseSteps
{
    public async Task ReimburseAnExpenseAsync(string expense)
    {
        await ExpensesWorld.PostAsync($"/api/expenses/{ExpensesWorld.IdOf(expense)}:reimburse");
    }

    public Task TheExpenseIsReimbursedAsync()
    {
        Assert.Equal(HttpStatusCode.OK, ExpensesWorld.LastResponse!.StatusCode);
        return Task.CompletedTask;
    }
}
