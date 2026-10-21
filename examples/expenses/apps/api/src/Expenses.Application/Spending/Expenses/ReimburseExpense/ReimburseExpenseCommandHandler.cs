using Expenses.Application.Abstractions;
using Expenses.Domain.Spending.Expenses;
using LiteBus.Commands.Abstractions;

namespace Expenses.Application.Spending.Expenses.ReimburseExpense;

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
