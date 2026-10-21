using Expenses.Domain;
using Expenses.Domain.Spending.Policies;
using LiteBus.Commands.Abstractions;

namespace Expenses.Application.Spending.Policies.SetReceiptThreshold;

internal sealed class SetReceiptThresholdCommandHandler(
    IPolicyRepository policies) : ICommandHandler<SetReceiptThresholdCommand, SetReceiptThresholdCommandResult>
{
    public async Task<SetReceiptThresholdCommandResult> HandleAsync(
        SetReceiptThresholdCommand command,
        CancellationToken cancellationToken)
    {
        var policy = await policies.GetActiveAsync(cancellationToken);
        policy.SetThreshold(Money.Create(command.Threshold, command.Currency));
        policies.Store(policy);
        return new SetReceiptThresholdCommandResult(command.Threshold, command.Currency);
    }
}
