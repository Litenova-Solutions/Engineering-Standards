namespace Claimwick.Acceptance.Tests.Spending.Receipts.AttachReceipt;

public sealed class AttachReceiptScenarios
{
    /// <proves>scenario/attach-receipt.attaching-a-receipt-succeeds</proves>
    public Task Attaching_a_receipt_succeedsAsync() => Runner.RunScenarioAsync(
        given => new SubmitExpenseSteps().SubmitAnExpenseAsync("employee-1"),
        when => new AttachReceiptSteps().AttachAReceiptAsync("expense-1"),
        then => new AttachReceiptSteps().TheReceiptIsAttachedAsync());
}
