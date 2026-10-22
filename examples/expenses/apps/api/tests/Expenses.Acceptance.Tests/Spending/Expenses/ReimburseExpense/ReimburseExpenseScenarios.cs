namespace Expenses.Acceptance.Tests.Spending.Expenses.ReimburseExpense;

public sealed class ReimburseExpenseScenarios
{
    /// <proves>scenario/reimburse-expense.reimbursing-an-approved-expense-succeeds</proves>
    public Task Reimbursing_an_approved_expense_succeedsAsync() => Runner.RunScenarioAsync(
        given => new ApproveExpenseSteps().ApproveAnExpenseAsync("expense-1"),
        when => new ReimburseExpenseSteps().ReimburseAnExpenseAsync("expense-1"),
        then => new ReimburseExpenseSteps().TheExpenseIsReimbursedAsync());
}
