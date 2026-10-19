namespace Library.Acceptance.Tests.Lending.Holds.PlaceHold;

public sealed class PlaceHoldScenarios
{
    public Task Placing_a_hold_succeeds() => Runner.RunScenarioAsync(
        given => new RegisterCopySteps().RegisterACopy("copy-1"),
        when => new PlaceHoldSteps().PlaceAHold("reader-1", "copy-1"),
        then => new PlaceHoldSteps().TheHoldIsPlaced());
}
