namespace Expenses.Integration.Tests.Spending.Expenses.SubmitExpense;

public sealed class SubmitExpenseTests(ExpensesApiFixture api) : IClassFixture<ExpensesApiFixture>
{
    /// <proves>case/submit-expense.submitting-with-a-receipt-succeeds</proves>
    [Fact]
    public async Task An_expense_is_submitted_through_a_helper_of_the_worldAsync()
    {
        var world = new ExpenseWorld(api);

        var submitted = await world.SubmitAsync(18.40m, "EUR");

        Assert.NotEqual(Guid.Empty, submitted.ExpenseId);
    }

    private sealed class ExpenseWorld(ExpensesApiFixture api)
    {
        public Task<SubmitExpenseCommandResult> SubmitAsync(decimal amount, string currency)
        {
            return api.Commands.SendAsync(
                new SubmitExpenseCommand(Guid.CreateVersion7(), Guid.CreateVersion7(), amount, currency, ReceiptId: null));
        }
    }
}
