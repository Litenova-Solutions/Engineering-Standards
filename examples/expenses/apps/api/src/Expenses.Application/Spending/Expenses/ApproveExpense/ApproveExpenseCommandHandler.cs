using Expenses.Application.Abstractions;
using Expenses.Domain.Spending.Expenses;
using LiteBus.Commands.Abstractions;

namespace Expenses.Application.Spending.Expenses.ApproveExpense;

internal sealed class ApproveExpenseCommandHandler(
    IExpenseRepository expenses,
    IClock clock) : ICommandHandler<ApproveExpenseCommand, ApproveExpenseCommandResult>
{
    public async Task<ApproveExpenseCommandResult> HandleAsync(
        ApproveExpenseCommand command,
        CancellationToken cancellationToken)
    {
        var expense = await expenses.GetAsync(command.ExpenseId, cancellationToken);
        expense.Approve(command.ApproverId, clock.UtcNow);
        expenses.Store(expense);
        return new ApproveExpenseCommandResult(expense.Id);
    }
}
