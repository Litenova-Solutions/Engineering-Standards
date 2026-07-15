using __PROJECT__.Domain.Shared;

namespace __PROJECT__.Domain.Posts;

public sealed record PostCreated(Guid PostId, Guid AuthorId) : IDomainEvent;

