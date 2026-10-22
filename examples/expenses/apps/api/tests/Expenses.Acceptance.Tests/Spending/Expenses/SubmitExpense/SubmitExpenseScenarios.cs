namespace Expenses.Acceptance.Tests.Spending.Expenses.SubmitExpense;

public sealed class SubmitExpenseScenarios
{
    /// <proves>scenario/submit-expense.submitting-with-a-receipt-succeeds</proves>
    public Task Submitting_with_a_receipt_succeedsAsync() => Runner.RunScenarioAsync(
        when => new SubmitExpenseSteps().SubmitAnExpenseAsync("employee-1"),
        then => new SubmitExpenseSteps().TheExpenseIsSubmittedAsync());
}
