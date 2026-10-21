using System.Net;
using System.Net.Http.Json;
using Expenses.Acceptance.Tests.Support;

namespace Expenses.Acceptance.Tests.Spending.Expenses.SubmitExpense;

public sealed class SubmitExpenseSteps
{
    public async Task SubmitAnExpenseAsync(string employee)
    {
        ExpensesWorld.SignInAs(employee);
        await ExpensesWorld.PostAsync("/api/expenses", new
        {
            amount = 48.90m,
            currency = "EUR",
            receiptId = ExpensesWorld.IdOf("receipt-1"),
        });

        var created = await ExpensesWorld.LastResponse!.Content.ReadFromJsonAsync<SubmittedExpense>();
        ExpensesWorld.Name("expense-1", created!.ExpenseId);
    }

    public Task TheExpenseIsSubmittedAsync()
    {
        Assert.Equal(HttpStatusCode.Created, ExpensesWorld.LastResponse!.StatusCode);
        return Task.CompletedTask;
    }

    private sealed record SubmittedExpense(Guid ExpenseId);
}
