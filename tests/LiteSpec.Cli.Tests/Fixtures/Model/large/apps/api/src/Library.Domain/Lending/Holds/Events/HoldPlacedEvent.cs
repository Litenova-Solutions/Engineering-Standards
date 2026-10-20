namespace Library.Domain.Lending.Holds.Events;

public sealed record HoldPlacedEvent(Guid HoldId, Guid CopyId, Guid ReaderId);
