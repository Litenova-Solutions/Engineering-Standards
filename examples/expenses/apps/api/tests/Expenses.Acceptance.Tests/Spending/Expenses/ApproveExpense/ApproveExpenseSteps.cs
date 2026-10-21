using System.Net;
using Expenses.Acceptance.Tests.Support;

namespace Expenses.Acceptance.Tests.Spending.Expenses.ApproveExpense;

public sealed class ApproveExpenseSteps
{
    public async Task ApproveAnExpenseAsync(string expense)
    {
        ExpensesWorld.SignInAs("manager-1");
        await ExpensesWorld.PostAsync($"/api/expenses/{ExpensesWorld.IdOf(expense)}:approve", new { approverId = ExpensesWorld.IdOf("manager-1") });
    }

    public Task TheExpenseIsApprovedAsync()
    {
        Assert.Equal(HttpStatusCode.OK, ExpensesWorld.LastResponse!.StatusCode);
        return Task.CompletedTask;
    }
}
