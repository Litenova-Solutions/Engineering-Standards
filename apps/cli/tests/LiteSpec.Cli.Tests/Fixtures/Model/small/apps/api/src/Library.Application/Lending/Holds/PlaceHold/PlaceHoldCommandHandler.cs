namespace Library.Application.Lending.Holds.PlaceHold;

public sealed class PlaceHoldCommandHandler
{
    public Task Handle(PlaceHoldCommand command)
    {
        if (command.CopyId == Guid.Empty)
            throw new InvalidOperationException("lending.hold-already-waiting");
        return Task.CompletedTask;
    }
}
