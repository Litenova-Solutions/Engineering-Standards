namespace Claimwick.Acceptance.Tests.Spending.Expenses.ApproveExpense;

public sealed class ApproveExpenseScenarios
{
    /// <proves>scenario/approve-expense.approving-a-submitted-expense-succeeds</proves>
    public Task Approving_a_submitted_expense_succeedsAsync() => Runner.RunScenarioAsync(
        given => new SubmitExpenseSteps().SubmitAnExpenseAsync("employee-1"),
        when => new ApproveExpenseSteps().ApproveAnExpenseAsync("expense-1"),
        then => new ApproveExpenseSteps().TheExpenseIsApprovedAsync());
}
