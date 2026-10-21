using System.Net;
using Expenses.Acceptance.Tests.Support;

namespace Expenses.Acceptance.Tests.Spending.Expenses.ExportExpenses;

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
