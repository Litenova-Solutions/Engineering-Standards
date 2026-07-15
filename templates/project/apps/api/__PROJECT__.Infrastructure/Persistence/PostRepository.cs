using __PROJECT__.Domain.Posts;
using Marten;

namespace __PROJECT__.Infrastructure.Persistence;

internal sealed class PostRepository(
    IDocumentSession session,
    DomainEventBuffer eventBuffer) : IPostRepository
{
    public Task AddAsync(Post post, CancellationToken cancellationToken)
    {
        session.Store(post);
        eventBuffer.Track(post);
        return Task.CompletedTask;
    }
}

