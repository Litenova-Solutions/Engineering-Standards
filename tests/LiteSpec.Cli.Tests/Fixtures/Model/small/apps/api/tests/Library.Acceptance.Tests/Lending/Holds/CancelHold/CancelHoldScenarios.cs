namespace Library.Acceptance.Tests.Lending.Holds.CancelHold;

public sealed class CancelHoldScenarios
{
    public Task Cancelling_a_waiting_hold_succeeds() => Runner.RunScenarioAsync(
        given => new PlaceHoldSteps().PlaceAHold("reader-1", "copy-1"),
        when => new CancelHoldSteps().CancelAHold("hold-1"),
        then => new CancelHoldSteps().TheHoldIsCancelled());
}
