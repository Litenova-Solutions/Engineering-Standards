namespace Library.Acceptance.Tests.Lending.Copies.RegisterCopy;

public sealed class RegisterCopyScenarios
{
    /// <proves>case/register-copy.registering-a-new-copy-succeeds</proves>
    public Task Registering_a_new_copy_succeeds() => Runner.RunScenarioAsync(
        when => new RegisterCopySteps().RegisterACopy("copy-1"),
        then => new RegisterCopySteps().TheCopyIsRegistered());
}
