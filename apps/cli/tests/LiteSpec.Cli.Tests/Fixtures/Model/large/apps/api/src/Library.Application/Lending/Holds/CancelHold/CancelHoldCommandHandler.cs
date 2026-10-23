using Library.Domain.Lending.Holds.Exceptions;

namespace Library.Application.Lending.Holds.CancelHold;

public sealed class CancelHoldCommandHandler
{
    public Task Handle(CancelHoldCommand command)
    {
        if (command.HoldId == Guid.Empty)
            throw new HoldNotWaitingException();
        return Task.CompletedTask;
    }
}
