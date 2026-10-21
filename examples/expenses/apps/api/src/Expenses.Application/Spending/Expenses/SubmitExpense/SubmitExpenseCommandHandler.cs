using Expenses.Domain;
using Expenses.Domain.Spending.Expenses;
using Expenses.Domain.Spending.Policies;
using LiteBus.Commands.Abstractions;

namespace Expenses.Application.Spending.Expenses.SubmitExpense;

internal sealed class SubmitExpenseCommandHandler(
    IExpenseRepository expenses,
    IPolicyRepository policies) : ICommandHandler<SubmitExpenseCommand, SubmitExpenseCommandResult>
{
    public async Task<SubmitExpenseCommandResult> HandleAsync(
        SubmitExpenseCommand command,
        CancellationToken cancellationToken)
    {
        var policy = await policies.GetActiveAsync(cancellationToken);
        var expense = Expense.Submit(
            command.ExpenseId,
            command.EmployeeId,
            Money.Create(command.Amount, command.Currency),
            command.ReceiptId,
            policy.ReceiptThreshold);
        expenses.Store(expense);
        return new SubmitExpenseCommandResult(expense.Id);
    }
}
