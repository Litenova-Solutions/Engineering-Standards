using System.Net;
using Claimwick.Acceptance.Tests.Support;

namespace Claimwick.Acceptance.Tests.Spending.Expenses.RejectExpense;

public sealed class RejectExpenseSteps
{
    public async Task RejectAnExpenseAsync(string expense)
    {
        ExpensesWorld.SignInAs("manager-1");
        await ExpensesWorld.PostAsync($"/api/expenses/{ExpensesWorld.IdOf(expense)}:reject", new
        {
            approverId = ExpensesWorld.IdOf("manager-1"),
            reason = "Personal purchase.",
        });
    }

    public Task TheExpenseIsRejectedAsync()
    {
        Assert.Equal(HttpStatusCode.OK, ExpensesWorld.LastResponse!.StatusCode);
        return Task.CompletedTask;
    }
}
