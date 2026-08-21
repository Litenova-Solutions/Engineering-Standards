# Domain Layer

## Intent


Domain contains the business model and protects aggregate invariants without persistence, HTTP, mediator, dependency injection, or provider concepts. Its types use the language from the product glossary, module specifications, and use-case specifications.

The profile gives every Aggregate an explicit state record hierarchy from its first implementation. A one-state hierarchy gives later states and state-specific facts a defined home. It avoids later replacement of an enum, status string, or flag-based lifecycle.

## Agent Summary {#agent-summary}


- Keep Domain free of outer-layer concerns. (DOMAIN.PURITY.001)
- Use one ubiquitous language. (DOMAIN.LANGUAGE.001)
- Treat aggregates as consistency boundaries. (DOMAIN.AGGREGATE.001)
- Use the project aggregate root contract. (DOMAIN.BASE.001)
- Model every Aggregate lifecycle with state records. (DOMAIN.STATE.001)
- Model every closed set of domain values without enums. (DOMAIN.CLOSEDSET.001)
- Create valid aggregates through named factories. (DOMAIN.FACTORY.001)
- Express transitions through business methods. (DOMAIN.BEHAVIOR.001)
- Keep child entities inside the aggregate boundary. (DOMAIN.ENTITY.001)
- Use strongly typed version 7 identifiers. (DOMAIN.ID.001)

## Standards


### Keep Domain free of outer-layer concerns (DOMAIN.PURITY.001)

**Requirement:** Domain models MUST keep Domain free of outer-layer concerns.

**Rationale:** Domain references only the .NET base class library and project-owned Domain types. It references no persistence, web, mediator, logging, configuration, dependency injection, serialization, or provider package.

The implementation does not add ORM attributes, JSON attributes, HTTP models, Application messages, or service-registration code to Domain. For example, `PostState` has no `JsonDerivedType` attribute; Infrastructure registers its persisted discriminator.

### Use one ubiquitous language (DOMAIN.LANGUAGE.001)

**Requirement:** Domain models MUST use one ubiquitous language.

**Rationale:** Type, property, method, exception, and event names match the terms in `docs/domain/glossary.md`, the module specification. The approved use-case specification.

If the business action is "publish a post," name the method `Publish`. The implementation does not use `SetStatus`, `UpdateEntity`, or another technical synonym. The implementation records rejected synonyms in the module specification when agents or contributors could plausibly reintroduce them.

### Treat aggregates as consistency boundaries (DOMAIN.AGGREGATE.001)

**Requirement:** Domain models MUST treat aggregates as consistency boundaries.

**Rationale:** An aggregate protects every invariant holding in one command transaction. The aggregate root is the only public mutation entry point. External code does not set properties, mutate collections, or call mutation methods on child entities.

A command normally changes one aggregate. A use-case specification or decision names the invariant and transaction behavior before one command changes multiple aggregates.

The implementation does not place an entity inside an aggregate only to make navigation convenient. For example, an `Order` may own its bounded `OrderLine` collection. It references a `Customer` aggregate by `CustomerId`.

### Use the project aggregate root contract (DOMAIN.BASE.001)

**Requirement:** Domain models MUST use the project aggregate root contract.

**Rationale:** Every aggregate root derives from the project-owned `AggregateRoot<TId>` type and implements its identity and domain-event mechanics through that base. The implementation does not duplicate event lists in concrete aggregates or add a second aggregate base.

A module may contain no aggregate, one aggregate, or multiple related aggregates. Module organizes documentation and code across layers. Aggregate root defines one Domain consistency and mutation boundary. The implementation does not create `IModule`, `ModuleRoot<TId>`, or another runtime module contract.

The base owns only:

- The strongly typed identity.
- The pending `IDomainEvent` collection.
- Protected event recording.
- Event clearing for Infrastructure after the selected delivery path has accepted the events.

The base does not own timestamps, auditing, tenant identity, lifecycle transitions, persistence hooks, validation services, or dependency resolution.

### Model every Aggregate lifecycle with state records (DOMAIN.STATE.001)

**Requirement:** Domain models MUST model every Aggregate lifecycle with state records.

**Rationale:** Every Aggregate defines an abstract `{Aggregate}State` record and one or more sealed state records. The Aggregate exposes one `State` property whose runtime type represents its complete lifecycle state.

The implementation does not model Aggregate lifecycle with:

- An enum such as `PostStatus`.
- A string discriminator such as `StateType`.
- Boolean flags such as `IsPublished` or `IsArchived`.
- Parallel nullable lifecycle fields such as `PublishedAt` and `ArchivedAt` on the Aggregate.
- A computed state inferred from timestamps or flags.

State-specific data belongs on the corresponding state record. State records are immutable data. Aggregate methods own transition rules and replace the current state. State records do not receive injected services or own transition methods.

State case names lead with the aggregate root per `NAME.AGGREGATE.001`: the case is `PostDraftState`, not `DraftPostState`.

**Example:**

```csharp
public abstract record PostState;

public sealed record PostDraftState : PostState;

public sealed record PostPublishedState(
    DateTimeOffset PublishedAt) : PostState;
```

Even an Aggregate with one current state defines its hierarchy:

```csharp
public abstract record ProfileState;

public sealed record ProfileActiveState : ProfileState;
```

### Model every closed set of domain values without enums (DOMAIN.CLOSEDSET.001)

**Requirement:** Domain models MUST model every closed set of domain values without enums.

**Rationale:** Domain declares no `enum`. `DOMAIN.STATE.001` already removes enums from Aggregate lifecycles. This rule applies the same reasoning to every closed set of Domain values. Examples include incident statuses, refund outcomes, line statuses, permission roles, categories, and severities.

A C# `enum` is a named integer. It carries no case data or exhaustiveness guarantee. A cast can admit undefined values. New case-specific data requires parallel fields.

Later case data or case-specific rules force enum removal and stored-value transformation. A closed type hierarchy avoids that change. It also lets the compiler and `switch` expressions check exhaustiveness.

A discriminated union models a closed set. The implementation uses one abstract record base named for the aggregate and concept. The implementation uses one sealed record per case. Base and cases lead with the aggregate root (`NAME.AGGREGATE.001`).

Each case ends with its concept. For example, `RefundOutcome` has a `RefundSucceededOutcome` case. This shape matches a state hierarchy but represents a value outside the Aggregate lifecycle.

**Example:**

```csharp
public abstract record RefundOutcome;

public sealed record RefundPendingOutcome(string Reason) : RefundOutcome;

public sealed record RefundSucceededOutcome(DateTimeOffset ProviderTime) : RefundOutcome;

public sealed record RefundFailedOutcome(string Classification) : RefundOutcome;

public sealed record RefundReversedOutcome(DateTimeOffset ProviderTime) : RefundOutcome;
```

A case that owns no data is still a sealed record. The set can grow case data later without a breaking change:

```csharp
public abstract record OrganizationRole;

public sealed record OrganizationOwnerRole : OrganizationRole;

public sealed record OrganizationScannerRole : OrganizationRole;
```

Callers branch with a `switch` expression on the case type. A `switch` that omits a case surfaces at review as a missing arm rather than a silent default. A case that carries data exposes it directly instead of through a separate nullable field:

```csharp
var next = outcome switch
{
    RefundSucceededOutcome succeeded => Settle(succeeded.ProviderTime),
    RefundPendingOutcome pending => HoldFor(pending.Reason),
    RefundFailedOutcome failed => Reclassify(failed.Classification),
    RefundReversedOutcome reversed => Reverse(reversed.ProviderTime),
    _ => throw new RefundUnsupportedOutcomeException(),
};
```

The example uses a typed value object for a closed set represented by one scalar (`DOMAIN.VALUE.001`). It can own validation, normalization, or formatting without per-case data or behavior. The example does not use an enum as its backing field.

The example does not represent a Domain closed set with an enum, scalar discriminator, or boolean flags. This rule is scoped to Domain. Application mirrors the union shape (`APP.CLOSEDSET.001`). Transport also mirrors it (`API.MODELS.001`).

A data-bearing transport set uses a polymorphic `oneOf` model. Only label-only sets or decision-backed narrowing use a string enum. A boundary enum or string is not the default for data-bearing cases. Infrastructure persists each union with stable discriminators, like a state hierarchy. It never stores a raw enum value absent from Domain.

Each union exposes one stable code or label. Its `FromCode` factory round-trips every case. A boundary projects through that member, never the record's default `ToString()`. The default can leak a concrete type name instead of `owner`. Round-trip tests cover every case. The tests catch renamed codes and missing labels.

### Create valid aggregates through named factories (DOMAIN.FACTORY.001)

**Requirement:** Domain models MUST create valid aggregates through named factories.

**Rationale:** Aggregate roots have no public constructors. Each creation path uses a static factory named for the business action, such as `Post.CreateDraft` or `Order.Place`.

A factory:

- Accepts typed IDs and validated domain values.
- Rejects empty identities and violated creation rules.
- Selects the initial state record.
- Records creation events required by the domain.
- Returns a complete valid aggregate.

Persistence-only construction behavior stays private and is configured by Infrastructure. If a provider cannot materialize the aggregate without weakening Domain encapsulation, Infrastructure stores a provider-owned persistence type and maps it to the aggregate.

### Express transitions through business methods (DOMAIN.BEHAVIOR.001)

**Requirement:** Domain models MUST express transitions through business methods.

**Rationale:** Every public aggregate mutation method represents a business action from the ubiquitous language. The method checks the current state, protects invariants, replaces state or owned data, and records domain events.

Command handlers coordinate the use case. They do not reproduce state checks or set aggregate properties. For example, a handler calls `post.Publish(utcNow)` and does not test whether `post.State` is draft before calling it.

Queries and convenience methods may expose domain facts without mutation. The implementation avoids public `Set`, `Update`, `Process`, and `Handle` methods when a domain verb names the operation.

### Keep child entities inside the aggregate boundary (DOMAIN.ENTITY.001)

**Requirement:** Domain models MUST keep child entities inside the aggregate boundary.

**Rationale:** A child entity has identity and continuity inside one aggregate. Its mutable state is inaccessible outside the aggregate root. The root creates, finds, and changes children through business methods.

Child entities use typed identity when their identity participates in domain behavior. Their equality is identity-based. If a child has lifecycle states, model them with the same sealed state record pattern and no enum.

The implementation exposes child collections as read-only views. For example, `Order.Lines` may return `IReadOnlyList<OrderLine>`, while `Order.AddLine` remains the only public addition path.

### Use strongly typed version 7 identifiers (DOMAIN.ID.001)

**Requirement:** Domain models MUST use strongly typed version 7 identifiers.

**Rationale:** Every aggregate identity is a public `readonly record struct` named `{Aggregate}Id`. It wraps one `Guid`, implements the project `IStronglyTypedId` marker and `IParsable<TId>`, and creates new values with `Guid.CreateVersion7()`.

A child entity that carries typed identity uses the same mechanics with a `{Aggregate}{Part}Id` name anchored on its aggregate per `NAME.AGGREGATE.001`, such as `OrderLineId`. It rejects `Guid.Empty` and creates values with `Guid.CreateVersion7()` exactly as an aggregate identity does.

Typed IDs reject `Guid.Empty` at creation and parsing boundaries. Because every struct still has a default value, each aggregate factory also rejects a default ID.

The implementation does not pass raw `Guid`, `long`, or `string` values across Domain and Application when the business identity is known. The implementation does not add implicit conversions that silently erase the ID type.

Transport, OpenAPI, frontend, and persistence boundaries represent the ID as a UUID string or native UUID column through boundary-owned converters. Domain carries no converter attributes.

### Use immutable value objects for domain concepts (DOMAIN.VALUE.001)

**Requirement:** Domain models MUST use immutable value objects for domain concepts.

**Rationale:** A value object represents a named domain concept when the value has validation, normalization, equality, units, formatting, or likely rule growth. Examples include `PostTitle`, `Slug`, `EmailAddress`, `Money`, `Currency`, and `DateRange`.

Value objects are immutable and compare by their complete value. The implementation uses static creation methods when construction can fail. The implementation exposes no setters or implicit conversions.

A primitive-to-value conversion hides validation and can throw during a cast. A value-to-primitive conversion erases the domain type. Construct through `Create` or `From`. The implementation reads through `Value` or `ToString`. The implementation uses an explicit operator only for a named boundary need.

Application validators represent caller-correctable structural input failures as validation errors before the handler runs. A value object repeats its own invariant and throws a specific Domain exception when another caller bypasses that boundary. Domain never references an Application validation type.

Raw primitives remain acceptable for local calculations and mechanical values with no domain meaning. A method parameter named `title` uses `PostTitle`. A loop index remains `int`.

### Define collection value semantics explicitly (DOMAIN.COLLECTION.001)

**Requirement:** Domain models MUST define collection value semantics explicitly.

**Rationale:** Aggregate and value-object constructors copy incoming mutable collections. Public members return read-only views. Domain methods own additions, removals, and replacements.

Default record equality does not compare `List<T>` or `IReadOnlyList<T>` contents. A value object containing a collection implements content equality and a matching order-sensitive or order-insensitive hash according to the domain rule.

For example, `PostTags` may treat tag order as irrelevant, while `RouteStops` treats order as part of the value. The module terms state which rule applies.

### Make money and decimal rules explicit (DOMAIN.MONEY.001)

**Requirement:** Domain models MUST make money and decimal rules explicit.

**Rationale:** Monetary amounts use `decimal` and a `Money` value object that includes currency. Domain code does not use `double` or `float` for money.

The module specification or glossary defines:

- Supported currency codes.
- Amount scale and rounding mode.
- Whether negative and zero values are valid.
- Rules for arithmetic across currencies.

Infrastructure maps the documented precision explicitly. For example, a product that defines two fractional digits may map an amount as `decimal(18,2)` rather than accepting a provider default.

### Use stateless domain services for ownerless rules (DOMAIN.SERVICE.001)

**Requirement:** Domain models MUST use stateless domain services for ownerless rules.

**Rationale:** The implementation uses a domain service only when a business calculation or decision spans domain concepts and has no natural aggregate or value-object owner. The implementation names it for the business concept, such as `OrderPricingDomainService`.

A domain service:

- Is stateless.
- Accepts Domain values and returns Domain values or decisions.
- Performs no persistence, messaging, logging, clock access, authorization, or provider calls.
- Does not load aggregates or commit a transaction.

Application loads any required aggregates, calls the domain service, passes its result into aggregate behavior, and stages the changed aggregate. A domain service does not become a general location for application orchestration or helper methods.

### Keep repository interfaces in Domain (DOMAIN.REPOSITORY.001)

**Requirement:** Domain models MUST keep repository interfaces in Domain.

**Rationale:** Domain owns one repository interface per aggregate loaded for commands. Infrastructure implements it. The interface uses only aggregate and Domain types and exposes minimum load and store operations for accepted commands.

A required load uses `GetByIdAsync`. It returns the aggregate or throws its own `{Aggregate}NotFoundException`. Infrastructure throws this exception when no aggregate has that identity. A command handler receives a loaded aggregate. It does not repeat null checks or build hard-coded not-found failures.

The exception owns its stable code and message (`DOMAIN.ERROR.001`). The host maps that code to `404`. Reserve nullable `FindBy...Async` methods for optional lookups. Examples include deduplication-key and provider-reference probes where absence is normal.

Repositories do not expose `IQueryable`, sessions, tracking controls, provider options, query projections, generic CRUD methods, or `SaveChangesAsync`. Query handlers use the selected read boundary instead of aggregate repositories.

The implementation does not introduce `IRepository<T>` as a substitute for aggregate-specific contracts.

### Raise immutable domain facts (DOMAIN.EVENT.001)

**Requirement:** Domain models MUST raise immutable domain facts.

**Rationale:** Every domain event is a public immutable record implementing the project-owned public `IDomainEvent` marker. Event names are `{Aggregate}{PastFact}Event`, leading with the aggregate root per `NAME.AGGREGATE.001` and ending with the `Event` suffix, such as `PostPublishedEvent` or `OrderPlacedEvent`. The name states which aggregate raised the fact without opening the file: an event named `MemberAccessChangedEvent` hides its owner, while `OrganizationMemberAccessChangedEvent` names it.

An event contains enough immutable business data for its intended reactions to understand the fact. "Minimal" does not mean "identity only" when a reaction needs values from the moment of the transition. The implementation does not include aggregate, entity, repository, session, service, or mutable collection references.

An event carries no exception. The implementation does not add an error object as event data or name an event after the language error type. An event records a completed fact. An exception rejects an attempted transition.

A recorded failure uses immutable domain data under `DOMAIN.CLOSEDSET.001`. The event carries that data. The implementation uses a domain term for manual handling or anomalies. See `NAME.EXCEPTION.001`.

`IDomainEvent` has no LiteBus or provider base interface. Domain events are internal business facts, not integration events or public API contracts. An Application or Infrastructure event reaction implementation may translate a domain event into an integration event when an external contract requires one.

The implementation records the event inside the aggregate method that completes the transition. The implementation passes occurrence time into the method when time is part of the fact.

### Reject business violations with Domain exceptions (DOMAIN.ERROR.001)

**Requirement:** Domain models MUST reject business violations with Domain exceptions.

**Rationale:** Domain defines a project `DomainException` base and specific subclasses named `{DomainType}{Reason}Exception`. `DomainType` is the aggregate root, or an aggregate-anchored type it owns whose own name already leads with the aggregate per `NAME.AGGREGATE.001`. The exception name always leads with the aggregate root. A rejected transition throws the exception that names the failed rule, such as `PostAlreadyPublishedException`. A rule with no owning value object anchors directly on the aggregate: an `Event` finance-assurance rule is `EventFinanceAssuranceMislabeledException`, not `FinanceAssuranceMislabeledException`.

The implementation does not throw `InvalidOperationException`, `ArgumentException`, Application validation exceptions, HTTP exceptions, or provider exceptions for a business rejection. Domain exceptions contain safe business context and no transport status code.

Each distinct violated rule has its own exception type. That type owns its stable failure code and message. Its constructor accepts only Domain values describing the failure. It does not accept code or message strings from the throwing aggregate. A shared exception with call-site code and message strings is prohibited. Such strings move rule identity from the type system into duplicated aggregate behavior.

**Example:**

```csharp
// Prohibited: the aggregate carries the code and message, and one type covers unrelated rules.
if (allocation.Count == 0)
{
    throw new RefundRuleException("REFUNDS.ALLOCATION_INVALID", "A refund requires at least one allocation line.");
}

if (allocation.Any(line => line.Quantity <= 0))
{
    throw new RefundRuleException("REFUNDS.ALLOCATION_INVALID", "Each allocation quantity must be positive.");
}

// Required: one type per rule; the type owns the code and message; the call site passes only domain values.
if (allocation.Count == 0)
{
    throw new RefundAllocationRequiredException();
}

if (allocation.Any(line => line.Quantity <= 0))
{
    throw new RefundAllocationQuantityInvalidException();
}
```

```csharp
public sealed class RefundAllocationRequiredException()
    : DomainException("A refund requires at least one allocation line.")
{
    public override string Code => "REFUNDS.ALLOCATION_REQUIRED";
}
```

Two rules that share a caller-visible failure code because a boundary maps them to one response still get two exception types. The shared code lives in the two types, not in a string passed by the aggregate. Reuse a single exception type only when one rule can fail from more than one input and the differing values are carried as constructor parameters.

Application validators handle malformed caller input through validation errors. Aggregate and value-object exceptions remain the last defense when direct Domain use violates a rule. Command handlers do not catch expected Domain exceptions. The host maps them through the documented error boundary.

### Reference other aggregates by ID (DOMAIN.REFERENCE.001)

**Requirement:** Domain models MUST reference other aggregates by ID.

**Rationale:** An aggregate stores another aggregate's typed ID rather than an object reference. An `Order` stores `CustomerId`. It does not store `Customer`.

When a command coordinates multiple aggregates, Application loads each aggregate through its repository. The active use-case specification names any immediate cross-aggregate invariant and transaction requirement.

### Pass nondeterministic values into Domain (DOMAIN.TIME.001)

**Requirement:** Domain models MUST pass nondeterministic values into Domain.

**Rationale:** Domain does not read system time, generate random business values, or call an external source from inside behavior. Application obtains such values through an owned port and passes them into the factory or method.

For example, a handler obtains `clock.UtcNow` and calls `post.Publish(clock.UtcNow)`. Domain tests pass an explicit `DateTimeOffset`.

### Document every public Domain contract (DOMAIN.DOCUMENTATION.001)

**Requirement:** Domain models MUST document every public Domain contract.

**Rationale:** Every public Domain type and member has XML documentation. This includes Aggregates, children, states, unions, values, IDs, services, repositories, Events, and exceptions. The `<summary>` states the represented or enforced business constraint, result, or failure. It does not restate the member name.

- A mutation method identifies source states, resulting state, protected invariant, and recorded Event. `Publish` names `PostPublishedState` and `PostPublishedEvent`. `Publishes the post` is insufficient.
- A factory states the creation rules it enforces and the initial state it selects.
- A property that carries a business fact states what the fact means and when it is set, using `<summary>`. A property whose meaning is fully evident from a well-named type (for example `PostId Id`) needs no restatement.
- A state or union case describes its meaning. Each data member describes its value. The implementation uses `<param>` for positional record members.
- An Event states the transition it records. An exception states the exact rule that was violated and its stable failure code.

Prose repeats constraints from approved specifications. It does not invent a new rule. The implementation applies the authoring standard, including `WRITING.ASCII.001` and `WRITING.PROSE.001`.

## Conventions


### Apply the documented defaults (DOMAIN.CONVENTION.001)

**Default:** Apply the documented defaults.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** The code blocks in this section focus on the named design rule and omit namespaces and unrelated XML declarations. Consumer files still apply `DOMAIN.DOCUMENTATION.001` to their complete public contracts.

### Organize a module by aggregate and concept (DOMAIN.CONVENTION.002)

**Default:** Organize a module by aggregate and concept.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A module folder holds one or more aggregates and the closed sets, value objects, events, and exceptions that belong to them. Two folder rules keep a growing module navigable.

Aggregate folders decide the top level. A single aggregate stays flat when its plural root name equals the module name. Otherwise, that aggregate takes its own plural folder. A module with multiple aggregates gives each aggregate a plural folder.

Each aggregate folder owns its `Events/`, `States/`, `Exceptions/`, and concept folders. Separate aggregates never share lifecycle, event, or rejection folders.

The implementation names each aggregate folder with the aggregate root's plural form. The folder creates a namespace segment that cannot collide with the singular type (`NAME.CSHARP.001`). `Audience/BuyerAccounts/BuyerAccount.cs` uses namespace `Entro.Domain.Audience.BuyerAccounts`. Its `States/BuyerAccountClaimedState.cs` uses `Entro.Domain.Audience.BuyerAccounts.States`.

A singular `BuyerAccount/` folder creates a type-name-as-namespace warning (CA1724). The plural form avoids that warning. Every aggregate in a multi-aggregate module gets a plural folder. For example, `Inventory` uses `Capacities/` and `VariantStocks/`.

A single-aggregate module whose own name equals its aggregate hits the same collision. The implementation names the module folder with the aggregate's plural form. A `Catalog` aggregate lives in `Catalogs`, under `Entro.Domain.Catalogs`.

The type never sits in a namespace segment of its own name. A `Catalog` concept stays `Catalog` in a `Catalogs` folder. Pluralizing the folder resolves the warning without renaming the type.

Concept folders group a closed set. The implementation puts a union base and every sealed case in one plural concept folder. Aggregate state records use `States/`. A concept folder holds one concept's related types.

The implementation does not create `Entities/`, `ValueObjects/`, or `Services/` kind folders. The implementation does not leave empty folders. The implementation keeps one loose value object in its module or aggregate folder.

**Example:**

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
  Posts/                          one aggregate whose name matches the module: kept flat in the module folder
    Post.cs
    PostId.cs
    PostTitle.cs
    IPostRepository.cs
    States/
      PostState.cs
      PostDraftState.cs
      PostPublishedState.cs
      PostArchivedState.cs
    Events/
      PostCreatedEvent.cs
      PostPublishedEvent.cs
    Exceptions/
      PostIdentityRequiredException.cs
      PostAlreadyPublishedException.cs
  Admission/                      one aggregate with a domain union in a concept folder
    TicketAdmission.cs
    TicketAdmissionId.cs
    ITicketAdmissionRepository.cs
    ScanResults/
      TicketAdmissionScanResult.cs
      TicketAdmissionAcceptedScanResult.cs
      TicketAdmissionInvalidScanResult.cs
      TicketAdmissionVoidScanResult.cs
    States/
      TicketAdmissionState.cs
      TicketAdmissionPendingState.cs
      TicketAdmissionAdmittedState.cs
    Events/
      TicketAdmissionScanRecordedEvent.cs
  Audience/                       more than one aggregate: one plural folder per aggregate
    BuyerAccounts/                  namespace Entro.Domain.Audience.BuyerAccounts
      BuyerAccount.cs
      BuyerAccountId.cs
      IBuyerAccountRepository.cs
      States/
        BuyerAccountState.cs
        BuyerAccountClaimedState.cs
      Events/
        BuyerAccountRestrictedEvent.cs
    Consents/                       namespace Entro.Domain.Audience.Consents
      Consent.cs
      ConsentId.cs
      IConsentRepository.cs
      States/
        ConsentState.cs
        ConsentGrantedState.cs
      Events/
        ConsentGrantedEvent.cs
```

Each aggregate-specific repository interface stays with the aggregate it loads. The other layers mirror this organization: Application, Infrastructure. WebApi use the same module and per-aggregate folder names, per `ARCH.MODULES.001`.

### Use these Domain names (DOMAIN.CONVENTION.003)

**Default:** Use these Domain names.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Example:**

| Domain role | Pattern | Example |
|:---|:---|:---|
| Aggregate root | `{Aggregate}` | `Post` |
| Child entity | `{Aggregate}{Part}` | `OrderLine` |
| Aggregate value object | `{Aggregate}{Term}` | `OrganizationLegalProfile` |
| Shared kernel value object | `{Term}` | `Money`, `EmailAddress` |
| Strongly typed ID | `{Aggregate}Id` | `PostId` |
| Typed state base | `{Aggregate}State` | `PostState` |
| Typed state case | `{Aggregate}{State}State` | `PostPublishedState` |
| Domain union base | `{Aggregate}{Concept}` | `RefundOutcome` |
| Domain union case | `{Aggregate}{Case}{Concept}` | `RefundSucceededOutcome`, `OrganizationScannerRole` |
| Repository | `I{Aggregate}Repository` | `IPostRepository` |
| Domain service | `{BusinessRule}DomainService` | `OrderPricingDomainService` |
| Domain event | `{Aggregate}{PastFact}Event` | `PostPublishedEvent` |
| Domain exception | `{DomainType}{Reason}Exception` | `PostAlreadyPublishedException` |

Every aggregate-owned type starts with the aggregate root's full name (`NAME.AGGREGATE.001`). `SalesCatalog` anchors `SalesCatalogPublishedEvent`. The example does not abbreviate the anchor. `Term` is the glossary term represented by a value object.

An aggregate value object uses its aggregate prefix. A Shared kernel value object keeps its bare name. `BusinessRule` names a domain service policy. `DomainType` names the aggregate-owned type. Union bases and cases end with their concept. The example stores each type in its own file.

### Define the shared Domain contracts once (DOMAIN.CONVENTION.004)

**Default:** Define the shared Domain contracts once.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Example:**

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

### Define typed IDs without primitive escape hatches (DOMAIN.CONVENTION.005)

**Default:** Define typed IDs without primitive escape hatches.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Example:**

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

### Keep ID representations aligned at every boundary (DOMAIN.CONVENTION.006)

**Default:** Keep ID representations aligned at every boundary.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Example:**

| Boundary | Representation | Owner |
|:---|:---|:---|
| Domain and Application | `PostId` | Domain |
| Minimal API route and query | UUID text parsed through `IParsable<PostId>` | WebApi |
| JSON | UUID string | WebApi converter |
| OpenAPI | `type: string`, `format: uuid` | WebApi schema transformer |
| Marten | Native UUID identity plus explicit typed-ID mapping | Infrastructure |
| EF Core extension | Explicit value converter to UUID | Infrastructure |
| Generated TypeScript | `string` from OpenAPI | Generated client |

For multiple IDs, WebApi uses one converter factory restricted to `IStronglyTypedId` implementations. The OpenAPI transformer applies the same restriction. The factory does not convert every `IParsable<T>` type into a UUID schema.

```csharp
if (typeof(IStronglyTypedId).IsAssignableFrom(context.JsonTypeInfo.Type))
{
    schema.Type = JsonSchemaType.String;
    schema.Format = "uuid";
    schema.Properties?.Clear();
}
```

### Keep state records as the only Aggregate lifecycle representation (DOMAIN.CONVENTION.007)

**Default:** Keep state records as the only Aggregate lifecycle representation.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Example:**

```csharp
public abstract record PostState;

public sealed record PostDraftState : PostState;

public sealed record PostPublishedState(
    DateTimeOffset PublishedAt) : PostState;

public sealed record PostArchivedState(
    DateTimeOffset ArchivedAt,
    string Reason) : PostState;
```

`PublishedAt` exists only on `PostPublishedState`, and archive facts exist only on `PostArchivedState`. The Aggregate cannot combine facts from mutually exclusive states.

A one-state Aggregate uses the same shape from its first implementation:

```csharp
public abstract record ProfileState;

public sealed record ProfileActiveState : ProfileState;
```

Infrastructure persists each state hierarchy with stable discriminators. It does not add a lifecycle enum or shadow state fields back into Domain or infer a different state after loading.

### Keep value creation and equality explicit (DOMAIN.CONVENTION.008)

**Default:** Keep value creation and equality explicit.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Example:**

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

### Keep domain services pure (DOMAIN.CONVENTION.009)

**Default:** Keep domain services pure.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Example:**

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

### Keep repository contracts aggregate-specific (DOMAIN.CONVENTION.010)

**Default:** Keep repository contracts aggregate-specific.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Example:**

```csharp
public interface IPostRepository
{
    Task<Post> GetByIdAsync(
        PostId id,
        CancellationToken cancellationToken);

    void Store(Post post);
}
```

`GetByIdAsync` returns a loaded `Post` and throws `PostNotFoundException` when the identity has no aggregate. The Infrastructure implementation owns that throw. The command pipeline owns the commit. `Store` stages the aggregate through the selected provider implementation.

```csharp
// Infrastructure implementation throws the aggregate's own not-found exception.
public async Task<Post> GetByIdAsync(PostId id, CancellationToken cancellationToken)
{
    var post = await session.LoadAsync<Post>(id, cancellationToken);
    return post ?? throw new PostNotFoundException();
}
```

## Reference example

This informative example demonstrates `DOMAIN.BASE.001`, `DOMAIN.STATE.001`, and `DOMAIN.FACTORY.001`.

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
            new PostDraftState());

        post.RaiseDomainEvent(
            new PostCreatedEvent(id, authorId, title, createdAt));

        return post;
    }

    public void ChangeTitle(PostTitle title)
    {
        if (State is not PostDraftState)
        {
            throw new PostCannotBeEditedException(Id, State);
        }

        Title = title;
    }

    public void Publish(DateTimeOffset publishedAt)
    {
        switch (State)
        {
            case PostDraftState:
                State = new PostPublishedState(publishedAt);
                RaiseDomainEvent(
                    new PostPublishedEvent(Id, AuthorId, Title, publishedAt));
                break;

            case PostPublishedState:
                throw new PostAlreadyPublishedException(Id);

            case PostArchivedState:
                throw new PostCannotPublishArchivedException(Id);

            default:
                throw new PostUnsupportedStateException(Id, State);
        }
    }
}

public sealed record PostCreatedEvent(
    PostId PostId,
    AuthorId AuthorId,
    PostTitle Title,
    DateTimeOffset CreatedAt) : IDomainEvent;

public sealed record PostPublishedEvent(
    PostId PostId,
    AuthorId AuthorId,
    PostTitle Title,
    DateTimeOffset PublishedAt) : IDomainEvent;
```

The event payload captures the publication fact without carrying the mutable `Post`. An event reaction implementation can use values from the transition or load a current read model when it explicitly needs current data.

## Verification


| ID | Method | Evidence |
|:---|:---|:---|
| DOMAIN.PURITY.001 | inspection | Pull request review asserts `keep Domain free of outer-layer concerns` in the owning specification and source paths. |
| DOMAIN.LANGUAGE.001 | inspection | Pull request review asserts `use one ubiquitous language` in the owning specification and source paths. |
| DOMAIN.AGGREGATE.001 | inspection | Pull request review asserts `treat aggregates as consistency boundaries` in the owning specification and source paths. |
| DOMAIN.BASE.001 | inspection | Pull request review asserts `use the project aggregate root contract` in the owning specification and source paths. |
| DOMAIN.STATE.001 | inspection | Pull request review asserts `model every Aggregate lifecycle with state records` in the owning specification and source paths. |
| DOMAIN.CLOSEDSET.001 | inspection | Pull request review asserts `model every closed set of domain values without enums` in the owning specification and source paths. |
| DOMAIN.FACTORY.001 | inspection | Pull request review asserts `create valid aggregates through named factories` in the owning specification and source paths. |
| DOMAIN.BEHAVIOR.001 | inspection | Pull request review asserts `express transitions through business methods` in the owning specification and source paths. |
| DOMAIN.ENTITY.001 | inspection | Pull request review asserts `keep child entities inside the aggregate boundary` in the owning specification and source paths. |
| DOMAIN.ID.001 | inspection | Pull request review asserts `use strongly typed version 7 identifiers` in the owning specification and source paths. |
| DOMAIN.VALUE.001 | inspection | Pull request review asserts `use immutable value objects for domain concepts` in the owning specification and source paths. |
| DOMAIN.COLLECTION.001 | inspection | Pull request review asserts `define collection value semantics explicitly` in the owning specification and source paths. |
| DOMAIN.MONEY.001 | inspection | Pull request review asserts `make money and decimal rules explicit` in the owning specification and source paths. |
| DOMAIN.SERVICE.001 | inspection | Pull request review asserts `use stateless domain services for ownerless rules` in the owning specification and source paths. |
| DOMAIN.REPOSITORY.001 | inspection | Pull request review asserts `keep repository interfaces in Domain` in the owning specification and source paths. |
| DOMAIN.EVENT.001 | inspection | Pull request review asserts `raise immutable domain facts` in the owning specification and source paths. |
| DOMAIN.ERROR.001 | inspection | Pull request review asserts `reject business violations with Domain exceptions` in the owning specification and source paths. |
| DOMAIN.REFERENCE.001 | inspection | Pull request review asserts `reference other aggregates by ID` in the owning specification and source paths. |
| DOMAIN.TIME.001 | inspection | Pull request review asserts `pass nondeterministic values into Domain` in the owning specification and source paths. |
| DOMAIN.DOCUMENTATION.001 | inspection | Pull request review asserts `document every public Domain contract` in the owning specification and source paths. |
| DOMAIN.CONVENTION.001 | inspection | Pull request review asserts `apply the documented defaults` in the owning specification and source paths. |
| DOMAIN.CONVENTION.002 | static | Repository static check asserts `organize a module by aggregate and concept` for the owning paths. |
| DOMAIN.CONVENTION.003 | inspection | Pull request review asserts `use these Domain names` in the owning specification and source paths. |
| DOMAIN.CONVENTION.004 | inspection | Pull request review asserts `define the shared Domain contracts once` in the owning specification and source paths. |
| DOMAIN.CONVENTION.005 | inspection | Pull request review asserts `define typed IDs without primitive escape hatches` in the owning specification and source paths. |
| DOMAIN.CONVENTION.006 | inspection | Pull request review asserts `keep ID representations aligned at every boundary` in the owning specification and source paths. |
| DOMAIN.CONVENTION.007 | inspection | Pull request review asserts `keep state records as the only Aggregate lifecycle representation` in the owning specification and source paths. |
| DOMAIN.CONVENTION.008 | inspection | Pull request review asserts `keep value creation and equality explicit` in the owning specification and source paths. |
| DOMAIN.CONVENTION.009 | inspection | Pull request review asserts `keep domain services pure` in the owning specification and source paths. |
| DOMAIN.CONVENTION.010 | inspection | Pull request review asserts `keep repository contracts aggregate-specific` in the owning specification and source paths. |
