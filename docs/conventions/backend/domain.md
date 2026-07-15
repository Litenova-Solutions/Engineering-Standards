# Domain Layer

## Intent

Domain contains the business model and protects invariants without persistence, HTTP, mediator, dependency injection, or provider concepts. Its types should read in the language used by product and use-case documents.

## Agent Summary {#agent-summary}

- Organize Domain by business capability.
- Model each transactional consistency boundary as an aggregate.
- Create aggregates through named factories and mutate them through business methods.
- Use immutable value objects and strongly typed IDs.
- Keep repository interfaces in Domain and implementations in Infrastructure.
- Raise package-free domain event records in past tense.
- Use domain-specific exceptions for rejected business behavior.

## Standards

### Keep Domain free of outer-layer concerns (DOMAIN.PURITY.001)

Domain references no persistence, web, mediator, logging, configuration, dependency injection, or provider package. Do not add ORM attributes, HTTP models, or serialization behavior to domain types.

### Treat aggregates as consistency boundaries (DOMAIN.AGGREGATE.001)

An aggregate protects invariants that must hold in one command transaction. External code changes aggregate state only through aggregate methods.

Do not expose public property setters or mutable collections. Do not place unrelated entities in one aggregate to make navigation easier.

### Create valid aggregates through named factories (DOMAIN.FACTORY.001)

Use a static factory such as `Post.CreateDraft` when construction has business rules, generates an ID, initializes state, or raises an event. Keep persistence-only construction private or internal according to the selected mapper.

The factory returns a valid aggregate or throws a domain exception. It does not return a partially initialized instance.

### Express behavior through business methods (DOMAIN.BEHAVIOR.001)

Use methods such as `Publish`, `ChangeTitle`, and `Archive`. The aggregate validates current state and inputs that depend on business rules before changing fields.

Command handlers do not set aggregate properties or reproduce state checks.

### Use strongly typed identifiers (DOMAIN.ID.001)

Represent each aggregate identity with a readonly record struct or another immutable project-owned value type. Do not pass raw `Guid`, `long`, or `string` values across Domain and Application when the business identity is known.

Strongly typed IDs provide equality, an empty-value guard, and explicit conversion only at transport and persistence boundaries.

### Use immutable value objects (DOMAIN.VALUE.001)

Value objects validate their own construction and compare by value. Use them for concepts such as `Slug`, `Money`, `EmailAddress`, or a date range when the concept has rules beyond its primitive representation.

Do not wrap a primitive without a rule, meaning, or boundary benefit.

### Keep repository interfaces in Domain (DOMAIN.REPOSITORY.001)

Domain owns one repository interface per aggregate that must be loaded for commands. The interface exposes aggregate operations, not query projections, database sessions, or generic CRUD.

Queries do not use aggregate repositories.

### Raise plain domain events (DOMAIN.EVENT.001)

Domain events are immutable records named as past-tense business facts, such as `PostPublished`. They have no LiteBus marker or Infrastructure type.

Include only stable business data required by reactions. Pass occurrence time or other nondeterministic input into the domain behavior rather than reading system time inside Domain.

### Reject business violations with domain exceptions (DOMAIN.ERROR.001)

Use a specific exception derived from the project Domain exception base when a requested business transition is invalid. The exception name identifies the subject and failed rule.

Do not throw `InvalidOperationException`, `ArgumentException`, or transport exceptions for expected domain rejection.

### Reference other aggregates by ID (DOMAIN.REFERENCE.001)

Store another aggregate's typed ID rather than an object reference. A command that coordinates more than one aggregate loads each through its repository and documents the transaction requirement.

## Conventions

### Use one capability folder

```text
{ProjectName}.Domain/
  Posts/
    Post.cs
    PostId.cs
    Slug.cs
    Events/
      PostPublished.cs
    Exceptions/
      PostAlreadyPublishedException.cs
    IPostRepository.cs
```

Use subfolders only when the capability contains enough types to improve navigation. Do not create empty `Entities`, `ValueObjects`, or `Services` folders.

### Keep aggregate state private

Expose immutable values or read-only collection views. Copy incoming collections before storing them. Domain methods own collection additions and removals.

### Pass time into behavior

Application obtains time through an `IClock` port and passes `DateTimeOffset` or a domain value to the aggregate. Domain tests use explicit values.

### Keep a shared base minimal

An optional `AggregateRoot` base may own domain-event collection and identity-neutral mechanics. It cannot own business fields, persistence behavior, service location, or a generic state machine.

## Examples

```csharp
public sealed class Post
{
    private readonly List<object> _domainEvents = [];

    private Post(PostId id, string title, Slug slug)
    {
        Id = id;
        Title = title;
        Slug = slug;
    }

    public PostId Id { get; }
    public string Title { get; private set; }
    public Slug Slug { get; }
    public bool IsPublished { get; private set; }
    public IReadOnlyCollection<object> DomainEvents => _domainEvents.AsReadOnly();

    public static Post CreateDraft(PostId id, string title, Slug slug) =>
        new(id, title, slug);

    public void Publish(DateTimeOffset publishedAt)
    {
        if (IsPublished)
        {
            throw new PostAlreadyPublishedException(Id);
        }

        IsPublished = true;
        _domainEvents.Add(new PostPublished(Id, publishedAt));
    }
}
```

## Verification

- Inspect Domain package and project references.
- Confirm public mutation occurs only through business methods.
- Confirm repositories expose aggregate operations rather than generic CRUD.
- Confirm domain events carry no mediator or provider marker.
- Confirm tests cover factories, state transitions, invariants, value equality, and raised events.
