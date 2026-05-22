# Concurrency

This document defines how to detect and handle concurrent modification conflicts. Read it before implementing any endpoint where two actors could modify the same resource simultaneously.

---

## Agent Quick Rules

- Aggregates that are edited by multiple concurrent actors MUST use a concurrency token.
- MUST use `xmin` (PostgreSQL row version) or an explicit `row_version` column as the concurrency token.
- `DbUpdateConcurrencyException` MUST be caught in the `GlobalExceptionHandler` and mapped to HTTP 409.
- Clients receive the current server value in the 409 response body; they decide whether to retry or discard.
- MUST NOT silently overwrite concurrent changes (last-write-wins).

---

## 1. When to Use Concurrency Tokens

Not every aggregate needs a concurrency token. Apply it when:

- Multiple users or processes can edit the same resource concurrently (for example, a shared document, a shared configuration record, or a booking slot).
- The aggregate represents a resource with meaningful versions (for example, a published article with a draft editing workflow).
- The operation is not idempotent by nature and a conflicting concurrent write would corrupt state.

Do not add concurrency tokens to aggregates that are only ever edited by one actor (for example, a user's own profile settings when single-session editing is enforced at the UI layer).

---

## 2. PostgreSQL `xmin` Concurrency Token

The preferred approach uses PostgreSQL's built-in `xmin` system column. `xmin` is the transaction ID of the last transaction that modified the row. It changes automatically on every `UPDATE` without requiring an application-managed column.

### EF Core Configuration

```csharp
// Infrastructure/Persistence/Configurations/PostConfiguration.cs
internal sealed class PostConfiguration : IEntityTypeConfiguration<Post>
{
    public void Configure(EntityTypeBuilder<Post> builder)
    {
        builder.ToTable("posts");

        // ... other mappings ...

        // Use PostgreSQL's xmin system column as the concurrency token.
        // This requires the Npgsql EF Core provider.
        builder.UseXminAsConcurrencyToken();
    }
}
```

`UseXminAsConcurrencyToken()` is provided by `Npgsql.EntityFrameworkCore.PostgreSQL`. No additional column is needed in the domain model or the database schema.

---

## 3. Explicit `row_version` Column (Alternative)

When `xmin` is not suitable (for example, when replicating rows across databases where `xmin` values diverge), use an explicit `row_version` column managed by EF Core.

### Domain Model

```csharp
// Domain/Posts/Post.cs
public sealed class Post : AggregateRoot<PostId>
{
    // ... other members ...

    // EF Core manages this via the concurrency token; do not expose a setter.
    public uint RowVersion { get; private set; }
}
```

### EF Core Configuration

```csharp
// Infrastructure/Persistence/Configurations/PostConfiguration.cs
builder.Property(p => p.RowVersion)
    .HasColumnName("row_version")
    .IsRowVersion()
    .IsConcurrencyToken();
```

### Including in Responses

When using an explicit `row_version`, include it in read responses so clients can send it back in update requests.

```csharp
// Application.Read.Contracts/Posts/PostResult.cs
public sealed record PostResult
{
    public required Guid Id { get; init; }
    public required string Title { get; init; }
    // ...
    public required uint RowVersion { get; init; }
}
```

---

## 4. Sending the Concurrency Token from Clients

The client obtains the current `row_version` (or `xmin` value) from the GET response and sends it back in the update request.

```csharp
// Application.Write.Contracts/Posts/UpdatePostCommand.cs
public sealed record UpdatePostCommand : ICommand
{
    public required PostId PostId { get; init; }
    public required string Title { get; init; }
    public required string Content { get; init; }
    public required uint RowVersion { get; init; }
}
```

```csharp
// Application.Write/Posts/Update/UpdatePostCommandHandler.cs
internal sealed class UpdatePostCommandHandler : ICommandHandler<UpdatePostCommand>
{
    private readonly IPostRepository _postRepository;

    public UpdatePostCommandHandler(IPostRepository postRepository)
    {
        _postRepository = postRepository;
    }

    public async Task HandleAsync(UpdatePostCommand command, CancellationToken cancellationToken)
    {
        var post = await _postRepository.GetByIdAsync(command.PostId, cancellationToken);

        // Set the original row version before making changes so EF Core
        // includes it in the WHERE clause of the UPDATE statement.
        post.SetRowVersion(command.RowVersion);

        post.Update(new PostTitle(command.Title), new PostContent(command.Content));
        await _postRepository.UpdateAsync(post, cancellationToken);
        // SaveChangesAsync in the pipeline will throw DbUpdateConcurrencyException
        // if the row version does not match.
    }
}
```

---

## 5. Handling `DbUpdateConcurrencyException`

The `GlobalExceptionHandler` MUST catch `DbUpdateConcurrencyException` and map it to HTTP 409. The canonical handler in `docs/conventions/backend/06-exception-hierarchy.md` includes this case. The response body MUST NOT include the exception message, stack trace, or any database-level detail. The `Detail` field is a human-readable explanation for the client.

---

## 6. Frontend Conflict Handling

When a client receives a 409 response from a concurrency conflict:

1. Show the user a message indicating the resource was updated by someone else.
2. Offer a "Refresh and retry" action that refetches the latest version and pre-populates the form.
3. Do not silently discard the user's unsaved changes without confirmation.

```typescript
// domain/posts/edit/useUpdatePost.ts
const mutation = useMutation({
  mutationFn: updatePost,
  onError: (error) => {
    if (error.status === 409) {
      // Notify the user and offer a refresh path.
      toast.error("This post was updated by someone else. Refresh to see the latest version.")
      queryClient.invalidateQueries({ queryKey: ["posts", postId] })
    }
  }
})
```

---

## 7. Concurrency vs. Idempotency

These are different concerns and MUST NOT be confused.

| Concern | Mechanism | HTTP Code |
|:---|:---|:---|
| Preventing duplicate operations from the same client | Idempotency key (see `10-reliability.md`) | 200 replay |
| Preventing overwrite of concurrent changes from different actors | Concurrency token | 409 Conflict |

An idempotency key prevents a single client from accidentally performing an operation twice. A concurrency token prevents two different clients from overwriting each other's changes.
