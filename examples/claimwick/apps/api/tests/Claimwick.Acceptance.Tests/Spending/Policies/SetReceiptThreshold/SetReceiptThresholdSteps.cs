using System.Net;
using Claimwick.Acceptance.Tests.Support;

namespace Claimwick.Acceptance.Tests.Spending.Policies.SetReceiptThreshold;

public sealed class SetReceiptThresholdSteps
{
    public async Task SetTheThresholdAsync(decimal threshold)
    {
        await ExpensesWorld.PostAsync("/api/policy:set-receipt-threshold", new { threshold, currency = "EUR" });
    }

    public Task TheThresholdIsSetAsync()
    {
        Assert.Equal(HttpStatusCode.OK, ExpensesWorld.LastResponse!.StatusCode);
        return Task.CompletedTask;
    }
}
