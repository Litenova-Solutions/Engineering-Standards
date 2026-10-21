using System.Net;
using Expenses.Acceptance.Tests.Support;

namespace Expenses.Acceptance.Tests.Spending.Receipts.AttachReceipt;

public sealed class AttachReceiptSteps
{
    public async Task AttachAReceiptAsync(string expense)
    {
        await ExpensesWorld.PostAsync($"/api/expenses/{ExpensesWorld.IdOf(expense)}/receipts", new { receiptId = ExpensesWorld.IdOf("receipt-2") });
    }

    public Task TheReceiptIsAttachedAsync()
    {
        Assert.Equal(HttpStatusCode.Created, ExpensesWorld.LastResponse!.StatusCode);
        return Task.CompletedTask;
    }
}
