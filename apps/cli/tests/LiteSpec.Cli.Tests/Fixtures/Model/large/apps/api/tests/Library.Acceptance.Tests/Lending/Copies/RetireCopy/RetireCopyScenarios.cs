namespace Library.Acceptance.Tests.Lending.Copies.RetireCopy;

public sealed class RetireCopyScenarios
{
    /// <proves>case/retire-copy.retiring-an-available-copy-succeeds</proves>
    public Task Retiring_an_available_copy_succeeds() => Runner.RunScenarioAsync(
        given => new RegisterCopySteps().RegisterACopy("copy-1"),
        when => new RetireCopySteps().RetireACopy("copy-1"),
        then => new RetireCopySteps().TheCopyIsRetired());
}
