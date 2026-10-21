namespace Expenses.Application.Spending.Policies.SetReceiptThreshold;

public sealed record SetReceiptThresholdCommandResult(decimal Threshold, string Currency);
