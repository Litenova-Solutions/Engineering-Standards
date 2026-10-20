namespace Library.Application.Lending.Holds.CancelHold;

public sealed class CancelHoldCommandHandler
{
    public Task Handle(CancelHoldCommand command)
    {
        if (command.HoldId == Guid.Empty)
            throw new InvalidOperationException("failure/lending.hold_not_waiting");
        return Task.CompletedTask;
    }
}
