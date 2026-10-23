namespace Claimwick.Acceptance.Tests.Spending.Expenses.RejectExpense;

public sealed class RejectExpenseScenarios
{
    /// <proves>scenario/reject-expense.rejecting-a-submitted-expense-succeeds</proves>
    public Task Rejecting_a_submitted_expense_succeedsAsync() => Runner.RunScenarioAsync(
        given => new SubmitExpenseSteps().SubmitAnExpenseAsync("employee-1"),
        when => new RejectExpenseSteps().RejectAnExpenseAsync("expense-1"),
        then => new RejectExpenseSteps().TheExpenseIsRejectedAsync());
}
