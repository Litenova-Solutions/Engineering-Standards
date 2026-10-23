namespace Claimwick.Acceptance.Tests.Spending.Expenses.ListExpenses;

public sealed class ListExpensesScenarios
{
    /// <proves>scenario/list-expenses.listing-own-expenses-succeeds</proves>
    public Task Listing_own_expenses_succeedsAsync() => Runner.RunScenarioAsync(
        given => new SubmitExpenseSteps().SubmitAnExpenseAsync("employee-1"),
        when => new ListExpensesSteps().ListOwnExpensesAsync("employee-1"),
        then => new ListExpensesSteps().TheExpensesAreListedAsync());
}
