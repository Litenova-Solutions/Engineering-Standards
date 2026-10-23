using Claimwick.Domain.Spending.Expenses;
using LiteBus.Commands.Abstractions;

namespace Claimwick.Application.Spending.Expenses.ErasePersonalData;

internal sealed class ErasePersonalDataCommandHandler(
    IExpenseRepository expenses) : ICommandHandler<ErasePersonalDataCommand, ErasePersonalDataCommandResult>
{
    public async Task<ErasePersonalDataCommandResult> HandleAsync(
        ErasePersonalDataCommand command,
        CancellationToken cancellationToken)
    {
        var expense = await expenses.GetAsync(command.ExpenseId, cancellationToken);
        expenses.Delete(expense.Id);
        return new ErasePersonalDataCommandResult(expense.Id);
    }
}
