namespace Claimwick.Application.Spending.Policies.SetReceiptThreshold;

public sealed record SetReceiptThresholdCommand(decimal Threshold, string Currency);
