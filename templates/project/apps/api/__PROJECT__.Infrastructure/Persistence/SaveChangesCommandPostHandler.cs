using LiteBus.Commands.Abstractions;
using LiteBus.Events.Abstractions;
using Marten;

namespace __PROJECT__.Infrastructure.Persistence;

internal sealed class SaveChangesCommandPostHandler(
    IDocumentSession session,
    DomainEventBuffer eventBuffer,
    IEventMediator eventMediator) : ICommandPostHandler<ICommand>
{
    public async Task PostHandleAsync(
        ICommand command,
        object? result,
        CancellationToken cancellationToken)
    {
        if (!eventBuffer.HasTrackedAggregates)
        {
            return;
        }

        var events = eventBuffer.CollectAndClear();
        await session.SaveChangesAsync(cancellationToken);

        foreach (var domainEvent in events)
        {
            await eventMediator.PublishAsync(domainEvent, cancellationToken: cancellationToken);
        }
    }
}

