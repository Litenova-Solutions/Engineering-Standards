namespace Library.Application.Lending.Holds.PlaceHold;

public sealed class PlaceHoldCommandHandler
{
    public Task Handle(PlaceHoldCommand command)
    {
        if (command.CopyId == Guid.Empty)
            throw new InvalidOperationException("failure/lending.hold_already_waiting");
        return Task.CompletedTask;
    }
}
