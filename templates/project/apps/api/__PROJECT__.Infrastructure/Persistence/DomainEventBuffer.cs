using __PROJECT__.Domain.Shared;

namespace __PROJECT__.Infrastructure.Persistence;

internal sealed class DomainEventBuffer
{
    private readonly HashSet<IAggregateRoot> _aggregates = [];

    public bool HasTrackedAggregates => _aggregates.Count > 0;

    public void Track(IAggregateRoot aggregate) => _aggregates.Add(aggregate);

    public IReadOnlyList<IDomainEvent> CollectAndClear()
    {
        var events = _aggregates.SelectMany(aggregate => aggregate.DomainEvents).ToArray();
        foreach (var aggregate in _aggregates)
        {
            aggregate.ClearDomainEvents();
        }

        _aggregates.Clear();
        return events;
    }
}

