using Expenses.Application.Abstractions;
using Expenses.Domain.Spending.Expenses;
using LiteBus.Commands.Abstractions;

namespace Expenses.Application.Spending.Expenses.RejectExpense;

internal sealed class RejectExpenseCommandHandler(
    IExpenseRepository expenses,
    IClock clock) : ICommandHandler<RejectExpenseCommand, RejectExpenseCommandResult>
{
    public async Task<RejectExpenseCommandResult> HandleAsync(
        RejectExpenseCommand command,
        CancellationToken cancellationToken)
    {
        var expense = await expenses.GetAsync(command.ExpenseId, cancellationToken);
        expense.Reject(command.ApproverId, command.Reason, clock.UtcNow);
        expenses.Store(expense);
        return new RejectExpenseCommandResult(expense.Id);
    }
}
