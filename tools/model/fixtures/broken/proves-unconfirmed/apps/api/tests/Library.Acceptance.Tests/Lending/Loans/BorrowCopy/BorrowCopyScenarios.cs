namespace Library.Acceptance.Tests.Lending.Loans.BorrowCopy;

public sealed class BorrowCopyScenarios
{
    /// <proves>case/borrow-copy.borrowing-an-available-copy-succeeds</proves>
    public Task Borrowing_an_available_copy_succeeds() => Runner.RunScenarioAsync(
        given => new RegisterCopySteps().RegisterACopy("copy-1"),
        when => new ReturnCopySteps().ReturnACopy("loan-1"),
        then => new BorrowCopySteps().TheLoanIsActive());
}
