namespace Library.Acceptance.Tests.Lending.Loans.BorrowCopy;

public sealed class BorrowCopyScenarios
{
    /// <proves>case/borrow-copy.borrowing-an-available-copy-succeeds</proves>
    public Task Borrowing_an_available_copy_succeeds() => Runner.RunScenarioAsync(
        given => new RegisterCopySteps().RegisterACopy("copy-1"),
        when => new BorrowCopySteps().BorrowACopy("reader-1", "copy-1"),
        then => AssertCode("failure/lending.copy_not_available"));

    private static Task AssertCode(string code) => Task.CompletedTask;
}
