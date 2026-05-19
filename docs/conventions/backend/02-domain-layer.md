# Domain Layer

This document is the authoritative guide for all design decisions in the Domain layer. Read it in full before writing or modifying any domain code.

---

## Guiding Philosophy

The Domain layer models the business. It knows nothing about databases, HTTP, or the application that hosts it. Every class in this layer must be understandable by a domain expert who has never seen a line of C#.

The Domain layer is the most important layer. It is the only layer that never changes because of a technology decision. If a team switches from EF Core to Dapper, or from REST to gRPC, the Domain layer does not change. That is its defining characteristic.

---

## Core Principles

### Purity and Isolation

The Domain layer has no NuGet dependencies on any infrastructure or framework package. The only acceptable dependencies are:
- `Ardalis.GuardClauses` for enforcing invariants
- The .NET BCL

Any class that imports `Microsoft.EntityFrameworkCore`, `Microsoft.AspNetCore.*`, or any third-party library not in the above list does not belong in the Domain layer.

### Aggregate as Consistency Boundary

Each aggregate is a cluster of objects (the aggregate root and its child entities) that must be kept consistent together. A single transaction modifies a single aggregate. The aggregate root is the only entry point; nothing outside the aggregate calls methods on child entities directly.

### Reference by ID

Aggregates do not hold references to other aggregate roots. They hold the ID of the other aggregate. If an `Order` aggregate needs to associate with a `Customer`, it stores a `CustomerId`, not a `Customer` instance.

```csharp
// GOOD:
sealed class Order : AggregateRoot<OrderId>
{
    public CustomerId CustomerId { get; private set; }
}

// BAD:
sealed class Order : AggregateRoot<OrderId>
{
    public Customer Customer { get; private set; }
}
```

### Why Repository Interfaces Live in the Domain Layer

Repository interfaces such as `IPostRepository` are defined in the Domain layer, not the Application layer. The reason is that the interface's signature is expressed entirely in Domain types: it accepts a `PostId` and returns a `Post`. Both types are Domain types. The Domain layer owns its own persistence contract. Infrastructure satisfies that contract. This keeps the Domain layer self-contained: it defines what it needs without knowing how the need is satisfied.

```csharp
// GOOD: repository interface in Domain/Posts/IPostRepository.cs
// The signature uses only Domain types (PostId, Post)
interface IPostRepository
{
    Task<Post> GetByIdAsync(PostId id, CancellationToken cancellationToken);
    Task AddAsync(Post post, CancellationToken cancellationToken);
    Task UpdateAsync(Post post, CancellationToken cancellationToken);
}

// BAD: repository interface in Application layer
// Application layer now owns a contract expressed in Domain types,
// creating a conceptual mismatch
```

### Ubiquitous Language

Every type, property, and method name in the Domain layer reflects the language used by domain experts and stakeholders. If the business calls it "publishing a post", the method is `Publish()`, not `SetStatus(PostStatus.Published)`. If the business calls it an "order line", the type is `OrderLine`, not `OrderItem` or `LineItem`.

---

## Naming Conventions

| Concept | Naming Pattern | Example |
|:---|:---|:---|
| Aggregate root | `{AggregateName}` | `Post`, `Order`, `Customer` |
| Child entity | `{EntityName}` | `OrderLine`, `PostTag` |
| Value object | `{ConceptName}` | `Money`, `EmailAddress`, `PostTitle` |
| Strongly-typed ID | `{AggregateName}Id` | `PostId`, `OrderId`, `CustomerId` |
| Repository interface | `I{AggregateName}Repository` | `IPostRepository`, `IOrderRepository` |
| Domain event | `{AggregateName}{PastTenseVerb}` | `PostPublished`, `OrderPlaced` |
| Domain exception | `{AggregateName}{Reason}Exception` | `PostAlreadyPublishedException` |
| Not-found exception | `{AggregateName}NotFoundException` | `PostNotFoundException` |
| State discriminated union base | `{AggregateName}State` | `PostState` |
| State case | `{StateName}{AggregateName}State` | `DraftPostState`, `PublishedPostState` |

The read-side counterpart to `IXxxRepository` is `IXxxReadStore`, defined in `Application.Read.Contracts`. It is deliberately not called `IXxxReadRepository` because it does not load aggregates. It returns flat projections. The different name reflects the different contract. See `docs/conventions/backend/07-query-read-strategy.md`.

---

## Folder Structure

```mermaid
graph TD
    Domain["{ProjectName}.Domain/"]
    GlobalUsings["GlobalUsings.cs"]
    Shared["Shared/"]
    SharedExceptions["Exceptions/"]
    DE["DomainException.cs"]
    ANF["AggregateNotFoundException.cs"]
    Posts["Posts/"]
    PostAggregate["Post.cs"]
    PostId["PostId.cs"]
    PostTitle["PostTitle.cs"]
    PostContent["PostContent.cs"]
    PostState["PostState.cs"]
    IPostRepo["IPostRepository.cs"]
    PostEvents["Events/"]
    PostCreated["PostCreated.cs"]
    PostPublished["PostPublished.cs"]
    PostExceptions["Exceptions/"]
    PostNotFound["PostNotFoundException.cs"]
    PostAlreadyPub["PostAlreadyPublishedException.cs"]

    Domain --> GlobalUsings
    Domain --> Shared
    Shared --> SharedExceptions
    SharedExceptions --> DE
    SharedExceptions --> ANF
    Domain --> Posts
    Posts --> PostAggregate
    Posts --> PostId
    Posts --> PostTitle
    Posts --> PostContent
    Posts --> PostState
    Posts --> IPostRepo
    Posts --> PostEvents
    PostEvents --> PostCreated
    PostEvents --> PostPublished
    Posts --> PostExceptions
    PostExceptions --> PostNotFound
    PostExceptions --> PostAlreadyPub
```

One folder per aggregate. Repository interfaces live inside the aggregate's folder (`Posts/IPostRepository.cs`), not in a separate `Repositories/` folder.

---

## Aggregate Root Design

### The AggregateRoot Base Class

Every aggregate root extends `AggregateRoot<TId>` defined in `Domain/Shared/AggregateRoot.cs`. This base class is defined in each project, not provided by a NuGet package. See `docs/architecture/clean-architecture.md` for the canonical implementation.

```csharp
// GOOD: aggregate root extends the base class
sealed class Post : AggregateRoot<PostId>
{
    private Post() { }

    public static Post Create(PostId id, PostTitle title, PostContent content, AuthorId authorId)
    {
        var post = new Post
        {
            Id = id,
            Title = title,
            Content = content,
            AuthorId = authorId,
            State = new DraftPostState()
        };
        post.RaiseDomainEvent(new PostCreated(id, authorId));
        return post;
    }
}

// BAD: aggregate root defined without a base class, duplicating domain event infrastructure
sealed class Post
{
    private readonly List<IDomainEvent> _events = [];
    public IReadOnlyList<IDomainEvent> Events => _events.AsReadOnly();
    // ... duplicated boilerplate in every aggregate
}
```

### Static Factory Methods

Aggregate roots MUST NOT have public constructors. All creation paths go through static factory methods named after the business action.

```csharp
// GOOD:
sealed class Post : AggregateRoot<PostId>
{
    private Post() { }

    /// <summary>
    /// Creates a new draft post authored by the specified author.
    /// </summary>
    public static Post Create(PostId id, PostTitle title, PostContent content, AuthorId authorId)
    {
        Guard.Against.Default(id, nameof(id));
        Guard.Against.Default(authorId, nameof(authorId));

        var post = new Post
        {
            Id = id,
            Title = title,
            Content = content,
            AuthorId = authorId,
            State = new DraftPostState()
        };

        post.RaiseDomainEvent(new PostCreated(id, authorId));
        return post;
    }
}

// BAD:
sealed class Post : AggregateRoot<PostId>
{
    public Post(PostId id, PostTitle title, PostContent content, AuthorId authorId)
    {
        Id = id;
        Title = title;
        Content = content;
        AuthorId = authorId;
    }
}
```

### Public Methods as Business Use Cases

Every public method on an aggregate root represents a business use case. The method name is a verb from the ubiquitous language. The method enforces invariants, updates state, and raises domain events.

```csharp
sealed class Post : AggregateRoot<PostId>
{
    /// <summary>
    /// Publishes the post, making it visible to readers.
    /// </summary>
    public void Publish()
    {
        if (State is PublishedPostState)
        {
            throw new PostAlreadyPublishedException(Id);
        }

        State = new PublishedPostState(publishedAt: DateTime.UtcNow);
        RaiseDomainEvent(new PostPublished(Id));
    }

    /// <summary>
    /// Updates the title. Only permitted while the post is in draft state.
    /// </summary>
    public void UpdateTitle(PostTitle newTitle)
    {
        if (State is not DraftPostState)
        {
            throw new PostCannotBeEditedException(Id);
        }

        Title = newTitle;
    }
}
```

### Enforcing Invariants

Invariants are enforced inside the aggregate method, not in the command handler. Command handlers MUST NOT contain `if` statements that check business rules.

```csharp
// GOOD: invariant enforced in the aggregate
public void Publish()
{
    if (State is PublishedPostState)
    {
        throw new PostAlreadyPublishedException(Id);
    }
}

// BAD: invariant checked in the handler
sealed class PublishPostCommandHandler : ICommandHandler<PublishPostCommand>
{
    public async Task HandleAsync(PublishPostCommand command, CancellationToken cancellationToken)
    {
        var post = await _repository.GetByIdAsync(command.PostId, cancellationToken);

        if (post.IsPublished) // BAD: business rule in handler
        {
            throw new InvalidOperationException("Post is already published.");
        }

        post.Publish();
    }
}
```

---

## Entity and Value Object Design

### Encapsulation

All aggregate and entity properties use `private set` or `init`. State is never mutated from outside the aggregate.

```csharp
sealed class Post : AggregateRoot<PostId>
{
    public PostTitle Title { get; private set; }
    public PostContent Content { get; private set; }
    public PostState State { get; private set; }
    public AuthorId AuthorId { get; private init; }
}
```

### Immutability

Value objects are immutable records. They are compared by value, not by reference.

```csharp
// GOOD:
sealed record PostTitle
{
    public string Value { get; }

    public PostTitle(string value)
    {
        Guard.Against.NullOrWhiteSpace(value, nameof(value));
        Guard.Against.OutOfRange(value.Length, nameof(value), 1, 200);
        Value = value;
    }

    public static implicit operator string(PostTitle title) => title.Value;
}

// BAD:
class PostTitle
{
    public string Value { get; set; } // mutable, not a value object
}
```

### Managing Collections

Aggregate root collections are exposed as read-only. Mutation only happens through named methods on the aggregate.

```csharp
sealed class Order : AggregateRoot<OrderId>
{
    private readonly List<OrderLine> _lines = [];

    /// <summary>
    /// The lines that make up this order.
    /// </summary>
    public IReadOnlyList<OrderLine> Lines => _lines.AsReadOnly();

    /// <summary>
    /// Adds a product to this order at the given quantity and price.
    /// </summary>
    public void AddLine(ProductId productId, int quantity, Money unitPrice)
    {
        Guard.Against.Default(productId, nameof(productId));
        Guard.Against.NegativeOrZero(quantity, nameof(quantity));

        _lines.Add(new OrderLine(productId, quantity, unitPrice));
    }
}
```

### Strongly-Typed IDs

Every aggregate uses a strongly-typed ID struct. This prevents accidental assignment of a `CustomerId` where a `PostId` is expected.

Use `Guid.CreateVersion7()` instead of `Guid.NewGuid()`. Version 7 GUIDs are time-ordered, which improves database index performance when used as primary keys.

```csharp
// GOOD: version 7 GUIDs are time-ordered, which improves database index performance
readonly record struct PostId(Guid Value)
{
    public static PostId New() => new(Guid.CreateVersion7());
    public static PostId Empty => new(Guid.Empty);
    public override string ToString() => Value.ToString();
}

// BAD: Guid.NewGuid() produces random GUIDs that fragment clustered indexes
readonly record struct PostId(Guid Value)
{
    public static PostId New() => new(Guid.NewGuid());
}
```

EF Core value converters for strongly-typed IDs are configured in the Infrastructure layer, never in the Domain layer.

---

## State Management

When an aggregate has distinct states that determine which operations are allowed, model those states as a sealed record hierarchy. This makes state transitions explicit and eliminates boolean flags.

```csharp
abstract record PostState;
sealed record DraftPostState : PostState;
sealed record PublishedPostState(DateTime PublishedAt) : PostState;
sealed record ArchivedPostState(DateTime ArchivedAt) : PostState;
```

Aggregate methods switch on state using pattern matching:

```csharp
public void Publish()
{
    switch (State)
    {
        case PublishedPostState:
            throw new PostAlreadyPublishedException(Id);
        case ArchivedPostState:
            throw new PostArchivedException(Id);
        case DraftPostState:
            State = new PublishedPostState(DateTime.UtcNow);
            RaiseDomainEvent(new PostPublished(Id));
            break;
    }
}
```

EF Core stores the discriminator and state-specific properties. The configuration is in the Infrastructure layer.

---

## Communication via Domain Events

### Structure

Domain events are immutable records with the minimum data needed for downstream handlers to act.

```csharp
// GOOD:
sealed record PostPublished(PostId PostId) : IDomainEvent;

// BAD:
sealed record PostPublished : IDomainEvent
{
    public Post Post { get; init; } // BAD: never pass the aggregate in an event
}
```

### Naming

Domain event names are past tense: `PostCreated`, `OrderPlaced`, `CustomerRegistered`. They describe what happened, not what should happen.

### Raising Events

Aggregates call `RaiseDomainEvent(...)` inside their mutation methods.

```csharp
public void Place()
{
    Guard.Against.Empty(_lines, nameof(_lines));

    State = new PlacedOrderState(placedAt: DateTime.UtcNow);
    RaiseDomainEvent(new OrderPlaced(Id, CustomerId));
}
```

---

## Code Style and Final Checks

### Sealed by Default

Every class in the Domain layer MUST be `sealed` unless it is explicitly designed as a base class. `AggregateRoot<TId>`, `DomainException`, and `AggregateNotFoundException` are base classes. Everything else is sealed.

### Brackets for All Conditionals

Always use braces for `if`, `else`, `foreach`, `while`, and `switch` bodies, even for single-line bodies.

```csharp
// GOOD:
if (State is PublishedPostState)
{
    throw new PostAlreadyPublishedException(Id);
}

// BAD:
if (State is PublishedPostState)
    throw new PostAlreadyPublishedException(Id);
```

### XML Comments

All `public` members in the Domain layer MUST have XML documentation comments. Comments describe the business purpose, not the implementation.

```csharp
// GOOD:
/// <summary>
/// Publishes the post, making it visible to all readers. Raises <see cref="PostPublished"/>.
/// </summary>
/// <exception cref="PostAlreadyPublishedException">Thrown when the post is already in a published state.</exception>
public void Publish() { ... }

// BAD:
/// <summary>
/// Publishes the post.
/// </summary>
public void Publish() { ... }
```

---

The ubiquitous language glossary for a specific project lives in the project repository. Copy `docs/templates/ubiquitous-language.md` from the standards repository into `docs/domain/ubiquitous-language.md` in the project repository and fill it in.