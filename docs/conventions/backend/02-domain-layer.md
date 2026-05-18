# Domain Layer

This document is the authoritative guide for all design decisions in the Domain layer of a Litenova Solutions project. Read it in full before writing or modifying any domain code.

---

## Guiding Philosophy

The Domain layer models the business. It knows nothing about databases, HTTP, or the application that hosts it. Every class in this layer must be understandable by a domain expert who has never seen a line of C#.

The Domain layer is the most important layer. It is the only layer that never changes because of a technology decision. If a team switches from EF Core to Dapper, or from REST to gRPC, the Domain layer does not change. That is its defining characteristic.

---

## Core Principles

### Purity and Isolation

The Domain layer has no NuGet dependencies on any infrastructure or framework package. The only acceptable dependencies are:
- `Ardalis.GuardClauses` — for enforcing invariants
- The .NET BCL

Any class that imports `Microsoft.EntityFrameworkCore`, `Microsoft.AspNetCore.*`, or any third-party library that is not in the above list does not belong in the Domain layer.

### Aggregate as Consistency Boundary

Each aggregate is a cluster of objects (the aggregate root and its child entities) that must be kept consistent together. A single transaction modifies a single aggregate. The aggregate root is the only entry point — nothing outside the aggregate calls methods on child entities directly.

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

### Ubiquitous Language

Every type, property, and method name in the Domain layer reflects the language used by domain experts and stakeholders. If the business calls it "publishing a post", the method is `Publish()`, not `SetStatus(PostStatus.Published)`. If the business calls it an "order line", the type is `OrderLine`, not `OrderItem` or `LineItem`.

---

## Naming Conventions

| Concept | Naming Pattern | Example |
|---|---|---|
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

---

## Folder Structure

```
src/{ProjectName}.Domain/
├── GlobalUsings.cs
├── Shared/
│   └── Exceptions/
│       ├── DomainException.cs
│       └── AggregateNotFoundException.cs
├── Posts/
│   ├── Post.cs
│   ├── PostId.cs
│   ├── PostTitle.cs
│   ├── PostContent.cs
│   ├── PostState.cs
│   ├── PostTag.cs
│   ├── Events/
│   │   ├── PostCreated.cs
│   │   └── PostPublished.cs
│   └── Exceptions/
│       ├── PostNotFoundException.cs
│       └── PostAlreadyPublishedException.cs
├── Orders/
│   ├── Order.cs
│   ├── OrderId.cs
│   ├── OrderLine.cs
│   ├── Money.cs
│   └── Exceptions/
│       └── OrderNotFoundException.cs
└── Customers/
    ├── Customer.cs
    ├── CustomerId.cs
    └── EmailAddress.cs
```

One folder per aggregate. Repository interfaces live inside the aggregate's folder (e.g., `Posts/IPostRepository.cs`), not in a separate `Repositories/` folder.

---

## Aggregate Root Design

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
    // ...

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
    /// Updates the title of the post. Only allowed while the post is in draft state.
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

Invariants are enforced inside the aggregate method, not in the command handler. Command handlers MUST NOT contain `if` statements that check business rules. If a rule lives in a handler, it belongs in the aggregate.

```csharp
// GOOD: invariant enforced in the aggregate
public void Publish()
{
    if (State is PublishedPostState)
    {
        throw new PostAlreadyPublishedException(Id);
    }
    // ...
}

// BAD: invariant checked in the handler
sealed class PublishPostCommandHandler : ICommandHandler<PublishPostCommand>
{
    public async Task HandleAsync(PublishPostCommand command, CancellationToken cancellationToken)
    {
        var post = await _repository.GetByIdAsync(command.PostId, cancellationToken);

        if (post.IsPublished) // ← business rule in handler
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

### Rich Value Objects

Value objects encapsulate validation and business rules. A `PostTitle` is not a `string`. It is a type that guarantees a valid post title at construction time. A `Money` type is not a `decimal`. It enforces currency consistency.

```csharp
sealed record Money
{
    public decimal Amount { get; }
    public string Currency { get; }

    public Money(decimal amount, string currency)
    {
        Guard.Against.Negative(amount, nameof(amount));
        Guard.Against.NullOrWhiteSpace(currency, nameof(currency));
        Amount = amount;
        Currency = currency.ToUpperInvariant();
    }

    public Money Add(Money other)
    {
        if (Currency != other.Currency)
        {
            throw new CurrencyMismatchException(Currency, other.Currency);
        }

        return new Money(Amount + other.Amount, Currency);
    }
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
    /// Adds a product to this order.
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

```csharp
readonly record struct PostId(Guid Value)
{
    public static PostId New() => new(Guid.NewGuid());
    public static PostId Empty => new(Guid.Empty);

    public override string ToString() => Value.ToString();
}
```

EF Core value converters for strongly-typed IDs are configured in the Infrastructure layer — never in the Domain layer.

---

## State Management

When an aggregate has distinct states that determine which operations are allowed, model those states as a sealed record hierarchy. This makes state transitions explicit and eliminates boolean flags.

```csharp
// PostState.cs
abstract record PostState;

// DraftPostState.cs
sealed record DraftPostState : PostState;

// PublishedPostState.cs
sealed record PublishedPostState(DateTime PublishedAt) : PostState;

// ArchivedPostState.cs
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

Domain events are immutable records with the minimum data needed for downstream handlers to act. They carry what changed, not why.

```csharp
// GOOD:
sealed record PostPublished(PostId PostId) : IDomainEvent;

// BAD:
sealed record PostPublished : IDomainEvent
{
    public Post Post { get; init; } // ← never pass the aggregate in an event
    public string Reason { get; init; } // ← no business logic or reasons in events
}
```

### Naming

Domain event names are past tense: `PostCreated`, `OrderPlaced`, `CustomerRegistered`. They describe what happened, not what should happen.

### Raising Events

Aggregates call `RaiseDomainEvent(...)` inside their mutation methods. The infrastructure dispatches these events after the transaction commits.

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

All `public` members in the Domain layer MUST have XML documentation comments. Comments describe the **business purpose**, not the implementation.

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

### Shared Code Strategy

Follow the Promotion Rule (`docs/conventions/00-principles.md`, section 6). Do not create a `Shared/` folder in the Domain layer until a type is needed by at least three aggregates from different feature folders. Start with the code local to the aggregate that first needs it.

---

## Project-Specific: Ubiquitous Language Glossary

> **Note:** This section is filled in per-project. It defines the bounded context's key terms so that all developers and AI agents use consistent language when working on this codebase. Without this glossary, the same concept gets different names in different files, which erodes the ubiquitous language over time.

When filling in this section, define every term that a new engineer might confuse, misname, or use inconsistently. Include terms from stakeholder conversations, not just technical terms.

| Term | Definition | Aggregate / Concept |
|---|---|---|
| _(example) Post_ | _(example) A piece of content created by an author, which can be in draft, published, or archived state._ | `Post` aggregate |
| _(example) Author_ | _(example) A registered user who has been granted the ability to create posts._ | `Author` aggregate |
| _(example) Tag_ | _(example) A keyword associated with a post for categorization. A post may have up to 10 tags._ | `PostTag` value object on `Post` |
