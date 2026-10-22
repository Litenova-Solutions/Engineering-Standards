namespace Library.Application.Lending.Holds.CancelHold;

public sealed class CancelHoldCommandHandler
{
    public Task Handle(CancelHoldCommand command)
    {
        if (command.HoldId == Guid.Empty)
            throw new InvalidOperationException("lending.hold-not-waiting");
        return Task.CompletedTask;
    }
}
