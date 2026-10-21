namespace Expenses.Acceptance.Tests.Spending.Policies.SetReceiptThreshold;

public sealed class SetReceiptThresholdScenarios
{
    /// <proves>case/set-receipt-threshold.setting-the-threshold-succeeds</proves>
    public Task Setting_the_threshold_succeedsAsync() => Runner.RunScenarioAsync(
        when => new SetReceiptThresholdSteps().SetTheThresholdAsync(25m),
        then => new SetReceiptThresholdSteps().TheThresholdIsSetAsync());
}
