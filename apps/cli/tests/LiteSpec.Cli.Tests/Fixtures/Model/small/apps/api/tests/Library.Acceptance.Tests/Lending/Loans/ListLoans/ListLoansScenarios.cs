namespace Library.Acceptance.Tests.Lending.Loans.ListLoans;

public sealed class ListLoansScenarios
{
    public Task Listing_own_loans_succeeds() => Runner.RunScenarioAsync(
        given => new BorrowCopySteps().BorrowACopy("reader-1", "copy-1"),
        when => new ListLoansSteps().ListOwnLoans("reader-1"),
        then => new ListLoansSteps().TheLoansAreListed());
}
