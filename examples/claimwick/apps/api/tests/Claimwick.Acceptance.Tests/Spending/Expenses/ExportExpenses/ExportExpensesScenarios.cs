namespace Claimwick.Acceptance.Tests.Spending.Expenses.ExportExpenses;

public sealed class ExportExpensesScenarios
{
    /// <proves>scenario/export-expenses.exporting-approved-expenses-succeeds</proves>
    public Task Exporting_approved_expenses_succeedsAsync() => Runner.RunScenarioAsync(
        given => new ApproveExpenseSteps().ApproveAnExpenseAsync("expense-1"),
        when => new ExportExpensesSteps().ExportApprovedExpensesAsync(),
        then => new ExportExpensesSteps().TheExpensesAreExportedAsync());
}
