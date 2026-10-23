using System.Net;
using Claimwick.Acceptance.Tests.Support;

namespace Claimwick.Acceptance.Tests.Spending.Expenses.ExportExpenses;

public sealed class ExportExpensesSteps
{
    public async Task ExportApprovedExpensesAsync()
    {
        await ExpensesWorld.PostAsync("/api/expense-exports");
    }

    public Task TheExpensesAreExportedAsync()
    {
        Assert.Equal(HttpStatusCode.OK, ExpensesWorld.LastResponse!.StatusCode);
        return Task.CompletedTask;
    }
}
