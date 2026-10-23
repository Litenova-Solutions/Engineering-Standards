using Library.Domain.Lending.Holds.Exceptions;

namespace Library.Application.Lending.Holds.PlaceHold;

public sealed class PlaceHoldCommandHandler
{
    public Task Handle(PlaceHoldCommand command)
    {
        if (command.CopyId == Guid.Empty)
            throw new HoldAlreadyWaitingException();
        return Task.CompletedTask;
    }
}
