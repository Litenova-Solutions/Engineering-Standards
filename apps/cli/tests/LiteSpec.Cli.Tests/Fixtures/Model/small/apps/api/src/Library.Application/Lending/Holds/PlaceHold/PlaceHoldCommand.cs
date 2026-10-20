namespace Library.Application.Lending.Holds.PlaceHold;

public sealed record PlaceHoldCommand(Guid CopyId, Guid ReaderId);
