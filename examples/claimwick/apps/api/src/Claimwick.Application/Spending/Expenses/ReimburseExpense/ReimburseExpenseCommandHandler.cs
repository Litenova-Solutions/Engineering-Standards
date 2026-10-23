using Claimwick.Application.Abstractions;
using Claimwick.Domain.Spending.Expenses;
using LiteBus.Commands.Abstractions;

namespace Claimwick.Application.Spending.Expenses.ReimburseExpense;

internal sealed class ReimburseExpenseCommandHandler(
    IExpenseRepository expenses,
    IClock clock) : ICommandHandler<ReimburseExpenseCommand, ReimburseExpenseCommandResult>
{
    public async Task<ReimburseExpenseCommandResult> HandleAsync(
        ReimburseExpenseCommand command,
        CancellationToken cancellationToken)
    {
        var expense = await expenses.GetAsync(command.ExpenseId, cancellationToken);
        expense.Reimburse(clock.UtcNow);
        expenses.Store(expense);
        return new ReimburseExpenseCommandResult(expense.Id);
    }
}
