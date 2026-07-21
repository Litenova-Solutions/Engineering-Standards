# Domain Layer

## Intent

Domain contains the business model and protects aggregate invariants without persistence, HTTP, mediator, dependency injection, or provider concepts. Its types use the language from the product glossary, module specifications, and use-case specifications.

The profile gives every Aggregate an explicit state record hierarchy from its first implementation. A one-state hierarchy gives later states and state-specific facts a defined home and avoids replacing an enum, status string, or flag-based lifecycle model as the application grows.

## Agent Summary {#agent-summary}

- Organize Domain by module and use the documented domain language.
- Model each transactional consistency boundary as an aggregate.
- Derive every aggregate root from the project-owned `AggregateRoot<TId>` base.
- Give every Aggregate a sealed state record hierarchy. Do not use lifecycle enums, status strings, or boolean status flags.
- Create aggregates through named factories and mutate them through business methods.
- Use immutable value objects and typed IDs backed by `Guid.CreateVersion7()`.
- Keep repository interfaces in Domain and implementations in Infrastructure.
- Raise package-free `IDomainEvent` records in past tense.
- Keep domain services stateless and use them only for business rules with no natural aggregate owner.
- Reject violated business rules with specific Domain exceptions.

## Standards

### Keep Domain free of outer-layer concerns (DOMAIN.PURITY.001)

Domain references only the .NET base class library and project-owned Domain types. It references no persistence, web, mediator, logging, configuration, dependency injection, serialization, or provider package.

Do not add ORM attributes, JSON attributes, HTTP models, Application messages, or service-registration code to Domain. For example, `PostState` has no `JsonDerivedType` attribute; Infrastructure registers its persisted discriminator.

### Use one ubiquitous language (DOMAIN.LANGUAGE.001)

Type, property, method, exception, and event names match the terms in `docs/domain/glossary.md`, the module specification, and the approved use-case specification.

If the business action is "publish a post," name the method `Publish`. Do not use `SetStatus`, `UpdateEntity`, or another technical synonym. Record rejected synonyms in the module specification when agents or contributors could plausibly reintroduce them.

### Treat aggregates as consistency boundaries (DOMAIN.AGGREGATE.001)

An aggregate protects every invariant that must hold in one command transaction. The aggregate root is the only public mutation entry point. External code does not set properties, mutate collections, or call mutation methods on child entities.

A command normally changes one aggregate. A use-case specification or decision must name the invariant and transaction behavior before one command changes multiple aggregates.

Do not place an entity inside an aggregate only to make navigation convenient. For example, an `Order` may own its bounded `OrderLine` collection, but it references a `Customer` aggregate by `CustomerId`.

### Use the project aggregate root contract (DOMAIN.BASE.001)

Every aggregate root derives from the project-owned `AggregateRoot<TId>` type and implements its identity and domain-event mechanics through that base. Do not duplicate event lists in concrete aggregates or add a second aggregate base.

A module may contain no aggregate, one aggregate, or multiple related aggregates. Module organizes documentation and code across layers. Aggregate root defines one Domain consistency and mutation boundary. Do not create `IModule`, `ModuleRoot<TId>`, or another runtime module contract.

The base owns only:

- The strongly typed identity.
- The pending `IDomainEvent` collection.
- Protected event recording.
- Event clearing for Infrastructure after the selected delivery path has accepted the events.

The base does not own timestamps, auditing, tenant identity, lifecycle transitions, persistence hooks, validation services, or dependency resolution.

### Model every Aggregate lifecycle with state records (DOMAIN.STATE.001)

Every Aggregate defines an abstract `{Aggregate}State` record and one or more sealed state records. The Aggregate exposes one `State` property whose runtime type represents its complete lifecycle state.

Do not model Aggregate lifecycle with:

- An enum such as `PostStatus`.
- A string discriminator such as `StateType`.
- Boolean flags such as `IsPublished` or `IsArchived`.
- Parallel nullable lifecycle fields such as `PublishedAt` and `ArchivedAt` on the Aggregate.
- A computed state inferred from timestamps or flags.

State-specific data belongs on the corresponding state record. State records are immutable data. Aggregate methods own transition rules and replace the current state; state records do not receive injected services or own transition methods.

```csharp
public abstract record PostState;

public sealed record DraftPostState : PostState;

public sealed record PublishedPostState(
    DateTimeOffset PublishedAt) : PostState;
```

Even an Aggregate with one current state defines its hierarchy:

```csharp
public abstract record ProfileState;

public sealed record ActiveProfileState : ProfileState;
```

### Create valid aggregates through named factories (DOMAIN.FACTORY.001)

Aggregate roots have no public constructors. Each creation path uses a static factory named for the business action, such as `Post.CreateDraft` or `Order.Place`.

A factory:

- Accepts typed IDs and validated domain values.
- Rejects empty identities and violated creation rules.
- Selects the initial state record.
- Records creation events required by the domain.
- Returns a complete valid aggregate.

Persistence-only construction behavior stays private and is configured by Infrastructure. If a provider cannot materialize the aggregate without weakening Domain encapsulation, Infrastructure stores a provider-owned persistence type and maps it to the aggregate.

### Express transitions through business methods (DOMAIN.BEHAVIOR.001)

Every public aggregate mutation method represents a business action from the ubiquitous language. The method checks the current state, protects invariants, replaces state or owned data, and records domain events.

Command handlers coordinate the use case. They do not reproduce state checks or set aggregate properties. For example, a handler calls `post.Publish(utcNow)` and does not test whether `post.State` is draft before calling it.

Queries and convenience methods may expose domain facts without mutation. Avoid public `Set`, `Update`, `Process`, and `Handle` methods when a domain verb names the operation.

### Keep child entities inside the aggregate boundary (DOMAIN.ENTITY.001)

A child entity has identity and continuity inside one aggregate. Its mutable state is inaccessible outside the aggregate root. The root creates, finds, and changes children through business methods.

Child entities use typed identity when their identity participates in domain behavior. Their equality is identity-based. If a child has lifecycle states, model them with the same sealed state record pattern and no enum.

Expose child collections as read-only views. For example, `Order.Lines` may return `IReadOnlyList<OrderLine>`, while `Order.AddLine` remains the only public addition path.

### Use strongly typed version 7 identifiers (DOMAIN.ID.001)

Every aggregate identity is a public `readonly record struct` named `{Aggregate}Id`. It wraps one `Guid`, implements the project `IStronglyTypedId` marker and `IParsable<TId>`, and creates new values with `Guid.CreateVersion7()`.

Typed IDs reject `Guid.Empty` at creation and parsing boundaries. Because every struct still has a default value, each aggregate factory also rejects a default ID.

Do not pass raw `Guid`, `long`, or `string` values across Domain and Application when the business identity is known. Do not add implicit conversions that silently erase the ID type.

Transport, OpenAPI, frontend, and persistence boundaries represent the ID as a UUID string or native UUID column through boundary-owned converters. Domain carries no converter attributes.

### Use immutable value objects for domain concepts (DOMAIN.VALUE.001)

Represent a named domain concept with a value object when the value has validation, normalization, equality, units, formatting, or likely rule growth. Examples include `PostTitle`, `Slug`, `EmailAddress`, `Money`, `Currency`, and `DateRange`.

Value objects are immutable and compare by their complete value. They use static creation methods when construction can fail. They do not expose setters or implicit primitive conversions that bypass the domain type.

Application validators represent caller-correctable structural input failures as validation errors before the handler runs. A value object repeats its own invariant and throws a specific Domain exception when another caller bypasses that boundary. Domain never references an Application validation type.

Raw primitives remain acceptable for local calculations and mechanical values with no domain meaning. A method parameter named `title` uses `PostTitle`; a loop index remains `int`.

### Define collection value semantics explicitly (DOMAIN.COLLECTION.001)

Aggregate and value-object constructors copy incoming mutable collections. Public members return read-only views. Domain methods own additions, removals, and replacements.

Default record equality does not compare `List<T>` or `IReadOnlyList<T>` contents. A value object containing a collection implements content equality and a matching order-sensitive or order-insensitive hash according to the domain rule.

For example, `PostTags` may treat tag order as irrelevant, while `RouteStops` treats order as part of the value. The module terms state which rule applies.

### Make money and decimal rules explicit (DOMAIN.MONEY.001)

Monetary amounts use `decimal` and a `Money` value object that includes currency. Domain code does not use `double` or `float` for money.

The module specification or glossary defines:

- Supported currency codes.
- Amount scale and rounding mode.
- Whether negative and zero values are valid.
- Rules for arithmetic across currencies.

Infrastructure maps the documented precision explicitly. For example, a product that defines two fractional digits may map an amount as `decimal(18,2)` rather than accepting a provider default.

### Use stateless domain services for ownerless rules (DOMAIN.SERVICE.001)

Use a domain service only when a business calculation or decision spans domain concepts and has no natural aggregate or value-object owner. Name it for the business concept, such as `OrderPricingDomainService`.

A domain service:

- Is stateless.
- Accepts Domain values and returns Domain values or decisions.
- Performs no persistence, messaging, logging, clock access, authorization, or provider calls.
- Does not load aggregates or commit a transaction.

Application loads any required aggregates, calls the domain service, passes its result into aggregate behavior, and stages the changed aggregate. A domain service does not become a general location for application orchestration or helper methods.

### Keep repository interfaces in Domain (DOMAIN.REPOSITORY.001)

Domain owns one repository interface per aggregate that must be loaded for commands. Infrastructure implements it. The interface uses only aggregate and Domain types and exposes the minimum load and store operations required by accepted commands.

Repositories do not expose `IQueryable`, sessions, tracking controls, provider options, query projections, generic CRUD methods, or `SaveChangesAsync`. Query handlers use the selected read boundary instead of aggregate repositories.

Do not introduce `IRepository<T>` as a substitute for aggregate-specific contracts.

### Raise immutable domain facts (DOMAIN.EVENT.001)

Every domain event is a public immutable record implementing the project-owned public `IDomainEvent` marker. Event names use past-tense business language, such as `PostPublished` or `OrderPlaced`.

An event contains enough immutable business data for its intended reactions to understand the fact. "Minimal" does not mean "identity only" when a reaction needs values from the moment of the transition. Do not include aggregate, entity, repository, session, service, or mutable collection references.

`IDomainEvent` has no LiteBus or provider base interface. Domain events are internal business facts, not integration events or public API contracts. An Application or Infrastructure event reaction implementation may translate a domain event into an integration event when an external contract requires one.

Record the event inside the aggregate method that completes the transition. Pass occurrence time into the method when time is part of the fact.

### Reject business violations with Domain exceptions (DOMAIN.ERROR.001)

Domain defines a project `DomainException` base and specific subclasses named `{DomainType}{Reason}Exception`. `DomainType` names the concrete aggregate, entity, value object, or domain service that rejects the rule. A rejected transition throws the exception that names the failed rule, such as `PostAlreadyPublishedException`.

Do not throw `InvalidOperationException`, `ArgumentException`, Application validation exceptions, HTTP exceptions, or provider exceptions for a business rejection. Domain exceptions contain safe business context and no transport status code.

Application validators handle malformed caller input through validation errors. Aggregate and value-object exceptions remain the last defense when direct Domain use violates a rule. Command handlers do not catch expected Domain exceptions; the host maps them through the documented error boundary.

### Reference other aggregates by ID (DOMAIN.REFERENCE.001)

An aggregate stores another aggregate's typed ID rather than an object reference. An `Order` stores `CustomerId`; it does not store `Customer`.

When a command coordinates multiple aggregates, Application loads each aggregate through its repository. The active use-case specification names any immediate cross-aggregate invariant and transaction requirement.

### Pass nondeterministic values into Domain (DOMAIN.TIME.001)

Domain does not read system time, generate random business values, or call an external source from inside behavior. Application obtains such values through an owned port and passes them into the factory or method.

For example, a handler obtains `clock.UtcNow` and calls `post.Publish(clock.UtcNow)`. Domain tests pass an explicit `DateTimeOffset`.

### Document public Domain contracts (DOMAIN.DOCUMENTATION.001)

Public Aggregate methods, state types with data, Value Object factories, Events, repositories, and exceptions have XML documentation that states a business constraint, result, or failure. Do not restate the member name.

For example, `Publish` documentation identifies allowed source states, the resulting state, and `PostPublished`. The text `Publishes the post` alone is insufficient.

## Conventions

The code blocks in this section focus on the named design rule and omit namespaces and unrelated XML declarations. Consumer files still apply `DOMAIN.DOCUMENTATION.001` to their complete public contracts.

### Use module-first folders

```text
{ProjectName}.Domain/
  Shared/
    AggregateRoot.cs
    IAggregateRoot.cs
    IDomainEvent.cs
    StronglyTypedIds/
      IStronglyTypedId.cs
    Exceptions/
      DomainException.cs
  Posts/
    Post.cs
    PostId.cs
    PostTitle.cs
    PostState.cs
    DraftPostState.cs
    PublishedPostState.cs
    ArchivedPostState.cs
    IPostRepository.cs
    Events/
      PostCreated.cs
      PostPublished.cs
    Exceptions/
      PostIdentityRequiredException.cs
      PostAlreadyPublishedException.cs
```

Create subfolders when the module contains enough types to improve navigation. Do not create empty `Entities`, `ValueObjects`, `States`, or `Services` folders. Each aggregate-specific repository interface remains with the module that contains that aggregate.

### Use these Domain names

| Domain role | Pattern | Example |
|:---|:---|:---|
| Aggregate root | `{Aggregate}` | `Post` |
| Child entity | `{Entity}` | `OrderLine` |
| Value object | `{BusinessTerm}` | `PostTitle` |
| Strongly typed ID | `{Aggregate}Id` | `PostId` |
| Typed state base | `{Aggregate}State` | `PostState` |
| Typed state case | `{State}{Aggregate}State` | `PublishedPostState` |
| Repository | `I{Aggregate}Repository` | `IPostRepository` |
| Domain service | `{BusinessRule}DomainService` | `OrderPricingDomainService` |
| Domain event | `{PastTenseBusinessFact}` | `PostPublished` |
| Domain exception | `{DomainType}{Reason}Exception` | `PostAlreadyPublishedException` |

`BusinessTerm` is the exact glossary term represented by the value object. `BusinessRule` names the calculation or policy owned by the domain service. `DomainType` is the concrete Domain type that rejects the rule.

### Define the shared Domain contracts once

```csharp
public interface IDomainEvent;

public abstract class DomainException(string message) : Exception(message);

public interface IStronglyTypedId
{
    Guid Value { get; }
}

public interface IAggregateRoot
{
    IReadOnlyList<IDomainEvent> DomainEvents { get; }

    void ClearDomainEvents();
}

public abstract class AggregateRoot<TId> : IAggregateRoot
    where TId : struct, IStronglyTypedId
{
    private readonly List<IDomainEvent> _domainEvents = [];

    protected AggregateRoot(TId id)
    {
        Id = id;
    }

    public TId Id { get; }

    public IReadOnlyList<IDomainEvent> DomainEvents =>
        _domainEvents.AsReadOnly();

    protected void RaiseDomainEvent(IDomainEvent domainEvent)
    {
        _domainEvents.Add(domainEvent);
    }

    public void ClearDomainEvents()
    {
        _domainEvents.Clear();
    }
}
```

`ClearDomainEvents` is Event-delivery mechanics, not a business mutation entry point. Infrastructure calls it only after the selected atomic, durable, rebuildable, or optional path has accepted the pending Events.

Concrete aggregates validate that `id.Value` is not `Guid.Empty` before calling or while calling the base constructor. The base remains free of aggregate-specific exceptions.

### Define typed IDs without primitive escape hatches

```csharp
public readonly record struct PostId : IStronglyTypedId, IParsable<PostId>
{
    private PostId(Guid value)
    {
        Value = value;
    }

    public Guid Value { get; }

    public static PostId New() => new(Guid.CreateVersion7());

    public static PostId From(Guid value)
    {
        if (value == Guid.Empty)
        {
            throw new PostIdentityRequiredException();
        }

        return new PostId(value);
    }

    public static PostId Parse(string value, IFormatProvider? provider) =>
        From(Guid.Parse(value));

    public static bool TryParse(
        string? value,
        IFormatProvider? provider,
        out PostId result)
    {
        if (Guid.TryParse(value, out var parsed) && parsed != Guid.Empty)
        {
            result = new PostId(parsed);
            return true;
        }

        result = default;
        return false;
    }

    public override string ToString() => Value.ToString();
}
```

The `IParsable<TId>` implementation supports Minimal API route and query binding. `Parse` follows the .NET parsing contract for malformed text; `From` applies the domain empty-identity rule.

### Keep ID representations aligned at every boundary

| Boundary | Representation | Owner |
|:---|:---|:---|
| Domain and Application | `PostId` | Domain |
| Minimal API route and query | UUID text parsed through `IParsable<PostId>` | WebApi |
| JSON | UUID string | WebApi converter |
| OpenAPI | `type: string`, `format: uuid` | WebApi schema transformer |
| Marten | Native UUID identity plus explicit typed-ID mapping | Infrastructure |
| EF Core extension | Explicit value converter to UUID | Infrastructure |
| Generated TypeScript | `string` from OpenAPI | Generated client |

For multiple IDs, WebApi uses one converter factory restricted to `IStronglyTypedId` implementations. The OpenAPI transformer applies the same restriction. It must not convert every `IParsable<T>` type into a UUID schema.

```csharp
if (typeof(IStronglyTypedId).IsAssignableFrom(context.JsonTypeInfo.Type))
{
    schema.Type = JsonSchemaType.String;
    schema.Format = "uuid";
    schema.Properties?.Clear();
}
```

### Keep state records as the only Aggregate lifecycle representation

```csharp
public abstract record PostState;

public sealed record DraftPostState : PostState;

public sealed record PublishedPostState(
    DateTimeOffset PublishedAt) : PostState;

public sealed record ArchivedPostState(
    DateTimeOffset ArchivedAt,
    string Reason) : PostState;
```

`PublishedAt` exists only on `PublishedPostState`, and archive facts exist only on `ArchivedPostState`. The Aggregate cannot combine facts from mutually exclusive states.

A one-state Aggregate uses the same shape from its first implementation:

```csharp
public abstract record ProfileState;

public sealed record ActiveProfileState : ProfileState;
```

Infrastructure persists each state hierarchy with stable discriminators. It does not add a lifecycle enum or shadow state fields back into Domain or infer a different state after loading.

### Keep value creation and equality explicit

```csharp
public sealed record PostTitle
{
    private PostTitle(string value)
    {
        Value = value;
    }

    public string Value { get; }

    public static PostTitle Create(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            throw new PostTitleRequiredException();
        }

        if (value.Length > 200)
        {
            throw new PostTitleExceedsMaximumLengthException(value.Length);
        }

        return new PostTitle(value);
    }

    public override string ToString() => Value;
}
```

A collection value object defines content equality rather than relying on the collection reference:

```csharp
public sealed record PostTags
{
    private readonly IReadOnlyList<string> _values;

    private PostTags(IEnumerable<string> values)
    {
        _values = values.ToList().AsReadOnly();
    }

    public IReadOnlyList<string> Values => _values;

    public static PostTags Create(IEnumerable<string> values) => new(values);

    public bool Equals(PostTags? other) =>
        other is not null && _values.SequenceEqual(other._values);

    public override int GetHashCode()
    {
        var hash = new HashCode();

        foreach (var value in _values)
        {
            hash.Add(value, StringComparer.Ordinal);
        }

        return hash.ToHashCode();
    }
}
```

The example treats tag order as meaningful. If order is irrelevant, creation normalizes to the documented comparison order before storing values.

### Keep domain services pure

```csharp
public sealed class OrderPricingDomainService
{
    public Money CalculateTotal(
        IReadOnlyList<OrderLine> lines,
        Currency currency)
    {
        return lines.Aggregate(
            Money.Zero(currency),
            (total, line) => total.Add(line.Subtotal));
    }
}
```

Application supplies the lines and passes the returned `Money` to `Order.ConfirmPrice`. The service has no repository, clock, logger, or provider client.

### Keep repository contracts aggregate-specific

```csharp
public interface IPostRepository
{
    Task<Post?> FindByIdAsync(
        PostId id,
        CancellationToken cancellationToken);

    void Store(Post post);
}
```

The command pipeline owns the commit. `Store` stages the aggregate through the selected provider implementation.

## Complete Aggregate example using typed states

```csharp
public sealed class Post : AggregateRoot<PostId>
{
    private Post(
        PostId id,
        AuthorId authorId,
        PostTitle title,
        PostState state)
        : base(RequireIdentity(id))
    {
        if (authorId == default)
        {
            throw new AuthorIdentityRequiredException();
        }

        AuthorId = authorId;
        Title = title;
        State = state;
    }

    private static PostId RequireIdentity(PostId id)
    {
        if (id == default)
        {
            throw new PostIdentityRequiredException();
        }

        return id;
    }

    public AuthorId AuthorId { get; }

    public PostTitle Title { get; private set; }

    public PostState State { get; private set; }

    public static Post CreateDraft(
        PostId id,
        AuthorId authorId,
        PostTitle title,
        DateTimeOffset createdAt)
    {
        var post = new Post(
            id,
            authorId,
            title,
            new DraftPostState());

        post.RaiseDomainEvent(
            new PostCreated(id, authorId, title, createdAt));

        return post;
    }

    public void ChangeTitle(PostTitle title)
    {
        if (State is not DraftPostState)
        {
            throw new PostCannotBeEditedException(Id, State);
        }

        Title = title;
    }

    public void Publish(DateTimeOffset publishedAt)
    {
        switch (State)
        {
            case DraftPostState:
                State = new PublishedPostState(publishedAt);
                RaiseDomainEvent(
                    new PostPublished(Id, AuthorId, Title, publishedAt));
                break;

            case PublishedPostState:
                throw new PostAlreadyPublishedException(Id);

            case ArchivedPostState:
                throw new ArchivedPostCannotBePublishedException(Id);

            default:
                throw new UnsupportedPostStateException(Id, State);
        }
    }
}

public sealed record PostCreated(
    PostId PostId,
    AuthorId AuthorId,
    PostTitle Title,
    DateTimeOffset CreatedAt) : IDomainEvent;

public sealed record PostPublished(
    PostId PostId,
    AuthorId AuthorId,
    PostTitle Title,
    DateTimeOffset PublishedAt) : IDomainEvent;
```

The event payload captures the publication fact without carrying the mutable `Post`. An event reaction implementation can use values from the transition or load a current read model when it explicitly needs current data.

## Verification

- Inspect Domain package and project references for outer-layer dependencies.
- Compare Domain names with the glossary, module specification, and approved use-case specification.
- Confirm every documented aggregate derives from `AggregateRoot<TId>` and appears in its module ownership table.
- Confirm every documented Aggregate has exactly one abstract state base and at least one sealed state record.
- Confirm no runtime module interface or base class exists.
- Search Domain for lifecycle enums, state strings, status booleans, and duplicated nullable state fields.
- Confirm aggregate constructors are not public and every mutation uses a business method.
- Confirm handlers do not reproduce state checks or set aggregate properties.
- Confirm typed IDs use `Guid.CreateVersion7()`, reject empty values, and retain one UUID representation across boundaries.
- Test value-object validation, normalization, scalar equality, collection equality, money precision, and currency rules.
- Confirm repositories expose aggregate operations rather than generic CRUD or query behavior.
- Confirm domain services are stateless and contain no outer-layer dependency.
- Confirm events are past-tense `IDomainEvent` records with no aggregate or provider reference.
- Round-trip every concrete Aggregate state record through the persistence provider.
- Test every factory, allowed transition, rejected transition, aggregate invariant, state-specific value, and emitted event.
- Confirm aggregate invariant IDs and state transitions map to verified use cases and acceptance criteria.
