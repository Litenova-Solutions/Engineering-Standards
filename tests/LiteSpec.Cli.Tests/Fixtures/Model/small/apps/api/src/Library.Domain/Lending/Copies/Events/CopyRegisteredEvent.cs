namespace Library.Domain.Lending.Copies.Events;

public sealed record CopyRegisteredEvent(Guid CopyId, string Shelf);
