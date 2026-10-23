using Claimwick.Domain.Spending.Expenses;
using LiteBus.Commands.Abstractions;

namespace Claimwick.Application.Spending.Receipts.AttachReceipt;

internal sealed class AttachReceiptCommandHandler(
    IExpenseRepository expenses) : ICommandHandler<AttachReceiptCommand, AttachReceiptCommandResult>
{
    public async Task<AttachReceiptCommandResult> HandleAsync(
        AttachReceiptCommand command,
        CancellationToken cancellationToken)
    {
        var expense = await expenses.GetAsync(command.ExpenseId, cancellationToken);
        expense.AttachReceipt(command.ReceiptId);
        expenses.Store(expense);
        return new AttachReceiptCommandResult(expense.Id, command.ReceiptId);
    }
}
