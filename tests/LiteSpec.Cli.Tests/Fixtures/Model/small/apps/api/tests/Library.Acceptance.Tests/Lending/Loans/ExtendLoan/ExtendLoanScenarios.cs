namespace Library.Acceptance.Tests.Lending.Loans.ExtendLoan;

public sealed class ExtendLoanScenarios
{
    public Task Extending_an_active_loan_succeeds() => Runner.RunScenarioAsync(
        given => new BorrowCopySteps().BorrowACopy("reader-1", "copy-1"),
        when => new ExtendLoanSteps().ExtendALoan("loan-1", 7),
        then => new ExtendLoanSteps().TheLoanIsExtended());
}
