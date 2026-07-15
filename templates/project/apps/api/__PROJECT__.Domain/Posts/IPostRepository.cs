namespace __PROJECT__.Domain.Posts;

public interface IPostRepository
{
    Task AddAsync(Post post, CancellationToken cancellationToken);
}

