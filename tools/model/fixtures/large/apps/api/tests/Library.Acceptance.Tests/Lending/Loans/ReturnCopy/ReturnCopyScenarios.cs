namespace Library.Acceptance.Tests.Lending.Loans.ReturnCopy;

public sealed class ReturnCopyScenarios
{
    /// <proves>case/return-copy.returning-a-borrowed-copy-succeeds</proves>
    public Task Returning_a_borrowed_copy_succeeds() => Runner.RunScenarioAsync(
        given => new BorrowCopySteps().BorrowACopy("reader-1", "copy-1"),
        when => new ReturnCopySteps().ReturnACopy("loan-1"),
        then => new ReturnCopySteps().TheLoanIsReturned());
}
