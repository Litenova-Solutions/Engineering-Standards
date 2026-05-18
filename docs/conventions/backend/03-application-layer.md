# Application Layer

This document is the authoritative guide for all design decisions in the Application layer of a Litenova Solutions project. Read it in full before writing or modifying any application code.

---

## Guiding Philosophy

The Application layer orchestrates use cases. It knows _what_ needs to happen (the business operation) but delegates the _how_ to interfaces it defines. It contains no business rules. If you find yourself writing an `if` statement that enforces a domain constraint in a handler, that logic belongs in the Domain layer.

---

## Core Principles

1. **One handler per use case.** A `CreatePostCommandHandler` handles exactly one thing: creating a post. Do not consolidate unrelated operations into a single handler.

2. **Handlers are thin.** A command handler's job is: validate → load → call → save. A query handler's job is: validate → fetch → return. Any logic beyond this belongs elsewhere.

3. **Read stores for queries, not repositories.** Query handlers MUST inject `IXxxReadStore` interfaces, not domain repository interfaces. Never call `IPostRepository.GetByIdAsync(...)` inside a query handler. See `docs/conventions/backend/07-query-read-strategy.md` for the full explanation.

4. **Validators are mandatory.** Every command or query that has validatable inputs MUST have a corresponding validator that runs before the handler. A query that takes a single typed ID still requires a validator that calls `Guard.Against.Default` on that ID.

5. **Validators throw application exceptions.** Validators MUST throw `ApplicationValidationException` subclasses (defined in `docs/conventions/backend/06-exception-hierarchy.md`). Never throw `ArgumentException`, `ArgumentNullException`, or `FluentValidation.ValidationException` directly.

6. **Application models are application-owned.** Result types returned by query handlers are records defined in the Application layer. The WebApi layer maps these to its own response types using `ApiMappings` classes. Never return domain types from a handler.

---

## Folder Structure

```
src/{ProjectName}.Application/
├── GlobalUsings.cs
├── Shared/
│   └── Exceptions/
│       └── ApplicationValidationException.cs
├── Posts/
│   ├── Create/
│   │   ├── CreatePostCommand.cs
│   │   ├── CreatePostCommandHandler.cs
│   │   └── CreatePostCommandValidator.cs
│   ├── Publish/
│   │   ├── PublishPostCommand.cs
│   │   ├── PublishPostCommandHandler.cs
│   │   └── PublishPostCommandValidator.cs
│   ├── GetById/
│   │   ├── GetPostByIdQuery.cs
│   │   ├── GetPostByIdQueryHandler.cs
│   │   ├── GetPostByIdQueryValidator.cs
│   │   └── PostResult.cs
│   └── Shared/
│       └── IPostReadStore.cs
├── Orders/
│   ├── Place/
│   │   ├── PlaceOrderCommand.cs
│   │   ├── PlaceOrderCommandHandler.cs
│   │   └── PlaceOrderCommandValidator.cs
│   └── Shared/
│       └── IOrderReadStore.cs
└── Customers/
    └── Register/
        ├── RegisterCustomerCommand.cs
        ├── RegisterCustomerCommandHandler.cs
        └── RegisterCustomerCommandValidator.cs
```

Feature folders are named after the aggregate (e.g., `Posts/`). Use case folders inside are named after the operation in imperative form (e.g., `Create/`, `Publish/`, `GetById/`). Read store interfaces live in the feature's `Shared/` folder.

---

## Command Pattern

### Command

A command is a record that carries the input for a single operation. All properties use `required` with `init` setters.

```csharp
sealed record CreatePostCommand : ICommand<PostId>
{
    public required PostId Id { get; init; }
    public required string Title { get; init; }
    public required string Content { get; init; }
    public required AuthorId AuthorId { get; init; }
}
```

### Command Handler

A command handler loads an aggregate, calls the operation, and saves. Nothing else.

```csharp
sealed class CreatePostCommandHandler(IPostRepository postRepository) : ICommandHandler<CreatePostCommand, PostId>
{
    public async Task<PostId> HandleAsync(CreatePostCommand command, CancellationToken cancellationToken)
    {
        var post = Post.Create(
            command.Id,
            new PostTitle(command.Title),
            new PostContent(command.Content),
            command.AuthorId);

        await postRepository.AddAsync(post, cancellationToken);

        return post.Id;
    }
}
```

### Command Validator

Validators run before the handler. They check structural validity (non-null, non-empty, within range). They do NOT check business rules (e.g., do not query whether a post already exists in a validator).

```csharp
sealed class CreatePostCommandValidator : ICommandValidator<CreatePostCommand>
{
    public Task ValidateAsync(CreatePostCommand command, CancellationToken cancellationToken)
    {
        Guard.Against.Default(command.Id, nameof(command.Id));
        Guard.Against.Default(command.AuthorId, nameof(command.AuthorId));
        Guard.Against.NullOrWhiteSpace(command.Title, nameof(command.Title));
        Guard.Against.OutOfRange(command.Title.Length, nameof(command.Title), 1, 200);
        Guard.Against.NullOrWhiteSpace(command.Content, nameof(command.Content));

        return Task.CompletedTask;
    }
}
```

If `Guard.Against` is not expressive enough for a specific validation, throw the correct custom exception directly:

```csharp
if (command.Title.StartsWith(" "))
{
    throw new PostTitleCannotStartWithSpaceException();
}
```

---

## Query Pattern

### Query

A query is a record that carries the input for a read operation.

```csharp
sealed record GetPostByIdQuery : IQuery<PostResult>
{
    public required PostId PostId { get; init; }
}
```

### Read Store Interface

The read store interface is defined in the feature's `Shared/` folder inside Application. It returns application-layer projection types.

```csharp
// Posts/Shared/IPostReadStore.cs
interface IPostReadStore
{
    Task<PostResult?> GetByIdAsync(PostId postId, CancellationToken cancellationToken);
    Task<IReadOnlyList<PostSummary>> GetAllByAuthorAsync(AuthorId authorId, CancellationToken cancellationToken);
}
```

### Query Handler

A query handler injects the read store interface, not the repository. Never call `IPostRepository` inside a query handler.

```csharp
// GOOD:
sealed class GetPostByIdQueryHandler(IPostReadStore postReadStore) : IQueryHandler<GetPostByIdQuery, PostResult>
{
    public async Task<PostResult> HandleAsync(GetPostByIdQuery query, CancellationToken cancellationToken)
    {
        var result = await postReadStore.GetByIdAsync(query.PostId, cancellationToken);

        if (result is null)
        {
            throw new PostNotFoundException(query.PostId);
        }

        return result;
    }
}

// BAD:
sealed class GetPostByIdQueryHandler(IPostRepository postRepository) : IQueryHandler<GetPostByIdQuery, PostResult>
{
    public async Task<PostResult> HandleAsync(GetPostByIdQuery query, CancellationToken cancellationToken)
    {
        var post = await postRepository.GetByIdAsync(query.PostId, cancellationToken);
        // ← Loading a full aggregate for a read operation violates the read store rule
        return new PostResult(post.Id, post.Title.Value, post.Content.Value);
    }
}
```

### Query Validator

Even a query with a single typed ID MUST have a validator.

```csharp
sealed class GetPostByIdQueryValidator : IQueryValidator<GetPostByIdQuery>
{
    public Task ValidateAsync(GetPostByIdQuery query, CancellationToken cancellationToken)
    {
        Guard.Against.Default(query.PostId, nameof(query.PostId));
        return Task.CompletedTask;
    }
}
```

### Query Result Type

Result records are defined next to the query that returns them.

```csharp
// GetById/PostResult.cs
sealed record PostResult
{
    public required PostId Id { get; init; }
    public required string Title { get; init; }
    public required string Content { get; init; }
    public required string AuthorName { get; init; }
    public required DateTime? PublishedAt { get; init; }
}
```

---

## Application Models and Mapping

The Application layer defines its own input and output types. It does not pass domain types out to callers.

When a command needs to pass data into domain factory methods or domain value objects, the handler constructs those types inline. There is no separate "mapper" class in the Application layer for domain construction — the handler is the translation site.

If the same mapping appears in multiple handlers, extract it to a feature-level `Shared/` extension method (applying the Promotion Rule from `docs/conventions/00-principles.md`).

---

## Project-Specific: Feature Inventory

> **Note:** This section is filled in per-project. It lists all features and their implemented use cases so that engineers and AI agents can understand the current state of the application at a glance.

When filling in this section, list every feature folder and every use case that exists or is planned. Update this table whenever a new handler is added.

| Feature | Use Case | Type | Status |
|---|---|---|---|
| _(example) Posts_ | _(example) Create Post_ | Command | Implemented |
| _(example) Posts_ | _(example) Publish Post_ | Command | Implemented |
| _(example) Posts_ | _(example) Get Post By Id_ | Query | Implemented |
| _(example) Posts_ | _(example) List Posts by Author_ | Query | Planned |
| _(example) Orders_ | _(example) Place Order_ | Command | Planned |
