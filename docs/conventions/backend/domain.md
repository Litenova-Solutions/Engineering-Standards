# Domain Layer

## Intent

Domain contains the business model and protects aggregate invariants without persistence, HTTP, mediator, dependency injection, or provider concepts. Its types use the language from the product glossary, module specifications, and use-case specifications.

The profile gives every Aggregate an explicit state record hierarchy from its first implementation. A one-state hierarchy gives later states and state-specific facts a defined home and avoids replacing an enum, status string, or flag-based lifecycle model as the application grows.

## Agent Summary {#agent-summary}

- Organize Domain by module and use the documented domain language.
- Give each aggregate its own folder when a module holds more than one, and group each closed set's base and cases in a folder named for the concept.
- Name every aggregate-owned type with the aggregate root's full name first: events, state cases, union bases and cases, aggregate value objects, child entities, and exceptions. Leave only Shared kernel types unprefixed.
- Model each transactional consistency boundary as an aggregate.
- Derive every aggregate root from the project-owned `AggregateRoot<TId>` base.
- Give every Aggregate a sealed state record hierarchy. Do not use lifecycle enums, status strings, or boolean status flags.
- Model every closed set of domain values with a discriminated union of records or a typed value object. Declare no `enum` anywhere in Domain.
- Create aggregates through named factories and mutate them through business methods.
- Use immutable value objects and typed IDs backed by `Guid.CreateVersion7()`.
- Keep repository interfaces in Domain and implementations in Infrastructure.
- Raise package-free `IDomainEvent` records named `{Aggregate}{PastFact}Event` in past tense.
- Keep domain services stateless and use them only for business rules with no natural aggregate owner.
- Reject each violated business rule with its own specific Domain exception that owns its stable failure code and message; do not pass code or message strings into a shared exception.
- Document every public Domain type and member with XML comments that state its business constraint, result, or failure.

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

State case names lead with the aggregate root per `NAME.AGGREGATE.001`: the case is `PostDraftState`, not `DraftPostState`.

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

Domain declares no `enum`. `DOMAIN.STATE.001` already removes the enum from Aggregate lifecycle; this rule extends the same reasoning to every other closed set of domain values: an incident status, a refund outcome, a per-line status, a permission role, a category, or a severity.

A C# `enum` is a named integer. It carries no data, admits no exhaustiveness guarantee, silently accepts undefined values through a cast, and forces every new case that needs its own data into a parallel field elsewhere. When the set later grows a case that owns data, or a rule that applies to only some cases, the enum must be removed and every persisted value migrated. Modeling the set as a closed type hierarchy from the first case avoids that migration and lets the compiler and `switch` expression check exhaustiveness.

Model a closed set as a discriminated union: one abstract record base named for the aggregate and concept, and one sealed record per case. Base and cases lead with the aggregate root per `NAME.AGGREGATE.001`, and each case ends with the concept: the base is `RefundOutcome` and a case is `RefundSucceededOutcome`. This is the same shape as a state hierarchy, applied to a value that is not an Aggregate lifecycle.

```csharp
public abstract record RefundOutcome;

public sealed record RefundPendingOutcome(string Reason) : RefundOutcome;

public sealed record RefundSucceededOutcome(DateTimeOffset ProviderTime) : RefundOutcome;

public sealed record RefundFailedOutcome(string Classification) : RefundOutcome;

public sealed record RefundReversedOutcome(DateTimeOffset ProviderTime) : RefundOutcome;
```

A case that owns no data is still a sealed record, so the set can grow case data later without a breaking change:

```csharp
public abstract record OrganizationRole;

public sealed record OrganizationOwnerRole : OrganizationRole;

public sealed record OrganizationScannerRole : OrganizationRole;
```

Callers branch with a `switch` expression on the case type. A `switch` that omits a case surfaces at review as a missing arm rather than a silent default, and a case that carries data exposes it directly instead of through a separate nullable field:

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

When the closed set is a single scalar with validation, normalization, or formatting and no per-case data or behavior, a typed value object under `DOMAIN.VALUE.001` is the correct model instead of a union. Do not reintroduce the enum as the value object's backing field.

Do not use a C# `enum`, an `int` or `string` discriminator, or a set of boolean flags to represent a closed set of domain values. This rule is scoped to the Domain layer, and the outer layers mirror the union rather than flatten it: an Application result carries the same shape (`APP.CLOSEDSET.001`) and a transport model carries the same shape (`API.MODELS.001`), a `oneOf` polymorphic model for a data-bearing set and a string `enum` only for a label-only set or a deliberate narrowing. An `enum` or a string at a boundary is therefore the narrowed representation of a label-only set, not the default for a set whose cases carry data. Infrastructure persists each union with stable discriminators exactly as it persists a state hierarchy, and never stores a raw enum value that Domain no longer defines.

Each union exposes one stable code or label member, and its `FromCode` factory round-trips with it: `FromCode(case.Name)` returns the same case for every case. A boundary that projects the union to a transport value maps through that member, never the record's default `ToString()`, which leaks the concrete type name (`OrganizationOwnerRole { Name = owner }`) instead of the code (`owner`). Add a test that round-trips every case, so a code that a rename altered, or a label left off a new case, is caught rather than shipped.

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

A child entity that carries typed identity uses the same mechanics with a `{Aggregate}{Part}Id` name anchored on its aggregate per `NAME.AGGREGATE.001`, such as `OrderLineId`. It rejects `Guid.Empty` and creates values with `Guid.CreateVersion7()` exactly as an aggregate identity does.

Typed IDs reject `Guid.Empty` at creation and parsing boundaries. Because every struct still has a default value, each aggregate factory also rejects a default ID.

Do not pass raw `Guid`, `long`, or `string` values across Domain and Application when the business identity is known. Do not add implicit conversions that silently erase the ID type.

Transport, OpenAPI, frontend, and persistence boundaries represent the ID as a UUID string or native UUID column through boundary-owned converters. Domain carries no converter attributes.

### Use immutable value objects for domain concepts (DOMAIN.VALUE.001)

Represent a named domain concept with a value object when the value has validation, normalization, equality, units, formatting, or likely rule growth. Examples include `PostTitle`, `Slug`, `EmailAddress`, `Money`, `Currency`, and `DateRange`.

Value objects are immutable and compare by their complete value. They use static creation methods when construction can fail. They expose no setters and define no implicit conversion operators in either direction. An implicit primitive-to-value conversion hides the validating factory and lets a cast throw, which the .NET conversion guidelines prohibit; an implicit value-to-primitive conversion erases the domain type and invites overload ambiguity, the same way an implicit typed-id conversion would (`DOMAIN.ID.001`). Construct through the named factory (`Create`, `From`), and read the underlying value through a named member (`Value`, `ToString`). Define an `explicit` operator only when a specific boundary genuinely needs a cast; the default is a named member, not an operator. This applies to Shared kernel value objects as much as to aggregate-owned ones, because a globally used value object erases its type in more places, not fewer.

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

A required load uses `GetByIdAsync`, which returns the aggregate and throws the aggregate's own `{Aggregate}NotFoundException` when no aggregate has that identity. The Infrastructure implementation throws it, so a command handler receives a loaded aggregate and never repeats a null check or constructs a not-found failure with a hard-coded code and message at the call site. The `{Aggregate}NotFoundException` is a `DomainException` that owns its stable code and message per `DOMAIN.ERROR.001`, and the host maps that code to `404`. Reserve a nullable `FindBy...Async` for a genuinely optional lookup, such as a deduplication-key or provider-reference probe, where absence is a normal result rather than a failure.

Repositories do not expose `IQueryable`, sessions, tracking controls, provider options, query projections, generic CRUD methods, or `SaveChangesAsync`. Query handlers use the selected read boundary instead of aggregate repositories.

Do not introduce `IRepository<T>` as a substitute for aggregate-specific contracts.

### Raise immutable domain facts (DOMAIN.EVENT.001)

Every domain event is a public immutable record implementing the project-owned public `IDomainEvent` marker. Event names are `{Aggregate}{PastFact}Event`, leading with the aggregate root per `NAME.AGGREGATE.001` and ending with the `Event` suffix, such as `PostPublishedEvent` or `OrderPlacedEvent`. The name states which aggregate raised the fact without opening the file: an event named `MemberAccessChangedEvent` hides its owner, while `OrganizationMemberAccessChangedEvent` names it.

An event contains enough immutable business data for its intended reactions to understand the fact. "Minimal" does not mean "identity only" when a reaction needs values from the moment of the transition. Do not include aggregate, entity, repository, session, service, or mutable collection references.

An event carries no exception. Do not add an `Exception`, `DomainException`, or other error object as event data, and do not name the event after the language error type. An event records a business fact that happened, while an exception rejects an attempted transition; the two never travel together. When a failure is itself the recorded fact, such as a provider declining a charge or a batch line that could not be refunded, model that fact as immutable domain data, a value object or a discriminated-union case under `DOMAIN.CLOSEDSET.001`, and carry that data on the event. A domain business concept that means a manual-handling case or an anomaly uses a domain word for that concept, not `Exception`; see `NAME.EXCEPTION.001`.

`IDomainEvent` has no LiteBus or provider base interface. Domain events are internal business facts, not integration events or public API contracts. An Application or Infrastructure event reaction implementation may translate a domain event into an integration event when an external contract requires one.

Record the event inside the aggregate method that completes the transition. Pass occurrence time into the method when time is part of the fact.

### Reject business violations with Domain exceptions (DOMAIN.ERROR.001)

Domain defines a project `DomainException` base and specific subclasses named `{DomainType}{Reason}Exception`. `DomainType` is the aggregate root, or an aggregate-anchored type it owns whose own name already leads with the aggregate per `NAME.AGGREGATE.001`, so the exception name always leads with the aggregate root. A rejected transition throws the exception that names the failed rule, such as `PostAlreadyPublishedException`. A rule with no owning value object anchors directly on the aggregate: an `Event` finance-assurance rule is `EventFinanceAssuranceMislabeledException`, not `FinanceAssuranceMislabeledException`.

Do not throw `InvalidOperationException`, `ArgumentException`, Application validation exceptions, HTTP exceptions, or provider exceptions for a business rejection. Domain exceptions contain safe business context and no transport status code.

Each distinct violated rule has its own exception type, and that type owns its stable failure code and its message. The exception constructor accepts only the domain values that describe the specific failure. It does not accept a `code` or `message` string from the throwing aggregate. A shared exception that is constructed with a hard-coded failure code and message string at the call site is prohibited, because it moves the rule identity out of the type system and into duplicated string literals inside aggregate behavior.

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

Application validators handle malformed caller input through validation errors. Aggregate and value-object exceptions remain the last defense when direct Domain use violates a rule. Command handlers do not catch expected Domain exceptions; the host maps them through the documented error boundary.

### Reference other aggregates by ID (DOMAIN.REFERENCE.001)

An aggregate stores another aggregate's typed ID rather than an object reference. An `Order` stores `CustomerId`; it does not store `Customer`.

When a command coordinates multiple aggregates, Application loads each aggregate through its repository. The active use-case specification names any immediate cross-aggregate invariant and transaction requirement.

### Pass nondeterministic values into Domain (DOMAIN.TIME.001)

Domain does not read system time, generate random business values, or call an external source from inside behavior. Application obtains such values through an owned port and passes them into the factory or method.

For example, a handler obtains `clock.UtcNow` and calls `post.Publish(clock.UtcNow)`. Domain tests pass an explicit `DateTimeOffset`.

### Document every public Domain contract (DOMAIN.DOCUMENTATION.001)

Every public Domain type and every public member on it has XML documentation. This covers Aggregates and their mutation methods, child entities, state bases and cases, union bases and cases, Value Objects and their factories, typed IDs, domain services, repositories, Events, and exceptions. The `<summary>` states the business constraint, result, or failure that the member enforces or represents, not a restatement of its name.

- A mutation method identifies its allowed source states, its resulting state, the invariant it protects, and the Event it records. `Publish` documentation names the allowed source states, the resulting `PostPublishedState`, and `PostPublishedEvent`. The text `Publishes the post` alone is insufficient.
- A factory states the creation rules it enforces and the initial state it selects.
- A property that carries a business fact states what the fact means and when it is set, using `<summary>`. A property whose meaning is fully evident from a well-named type (for example `PostId Id`) needs no restatement.
- A state or union case, and each of its data members, states what the case represents and what its data means. Use `<param>` on positional record members.
- An Event states the transition it records. An exception states the exact rule that was violated and its stable failure code.

Prose repeats a constraint that lives in an approved specification; it does not invent a new rule. Keep the text in the repository writing style: plain ASCII, lead with the constraint, no filler.

## Conventions

The code blocks in this section focus on the named design rule and omit namespaces and unrelated XML declarations. Consumer files still apply `DOMAIN.DOCUMENTATION.001` to their complete public contracts.

### Organize a module by aggregate and concept

A module folder holds one or more aggregates and the closed sets, value objects, events, and exceptions that belong to them. Two folder rules keep a growing module navigable.

Aggregate folders decide the top level. A module with one aggregate keeps that aggregate and its members directly in the module folder only when the aggregate root's plural name equals the module name; when the single aggregate's name differs from the module name, that aggregate takes its own plural folder. A module with more than one aggregate gives each aggregate its own plural folder, with no flat exception for a namesake aggregate, and each aggregate folder owns its own `Events/`, `States/`, `Exceptions/`, and concept folders. One aggregate's lifecycle, events, and rejections stay separate from another's rather than mixing in one shared `States/` or `Events/` folder.

Name each aggregate folder with the plural of the aggregate root, so the folder adds a proper namespace segment (`NAME.CSHARP.001`) that never collides with the singular aggregate type. `Audience/BuyerAccounts/BuyerAccount.cs` is `Entro.Domain.Audience.BuyerAccounts`, and `Audience/BuyerAccounts/States/BuyerAccountClaimedState.cs` is `Entro.Domain.Audience.BuyerAccounts.States`. A singular folder named exactly for the aggregate would put the `BuyerAccount` type in a namespace of the same name and trip the type-name-as-namespace warning (CA1724); the plural avoids that. When a module has more than one aggregate, every aggregate takes its own plural folder, with no flat exception for a namesake: an `Inventory` module with `Capacity` and `VariantStock` uses `Inventory/Capacities/` and `Inventory/VariantStocks/`.

A single-aggregate module whose own name equals its aggregate hits the same collision. Name the module folder with the plural of the aggregate (a `Catalog` aggregate lives in a `Catalogs` module folder, namespace `Entro.Domain.Catalogs`), so the type never sits in a namespace segment of its own name. Do not pad the type name to dodge the warning: a `Catalog` concept is the aggregate `Catalog` in a `Catalogs` folder, not an aggregate `SalesCatalog`. Pluralizing the folder is the fix; renaming the type is not.

Concept folders group a closed set. A discriminated union places its abstract base and every sealed case in one folder named for the concept, such as `ScanResults/` for `ScanResult` and its cases, and the aggregate state hierarchy uses a `States/` folder the same way. A concept folder holds exactly one concept's related types. It is not a grouping by technical kind: do not create an `Entities/`, `ValueObjects/`, or `Services/` folder that collects unrelated types, and do not leave an empty folder. Group a closed set into a concept folder once the set has its base and cases; a single loose value object stays in the module or aggregate folder until it grows a hierarchy.

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

Each aggregate-specific repository interface stays with the aggregate it loads. The other layers mirror this organization: Application, Infrastructure, and WebApi use the same module and per-aggregate folder names, per `ARCH.MODULES.001`.

### Use these Domain names

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

Every aggregate-owned type leads with the aggregate root's full name, never an abbreviation, per `NAME.AGGREGATE.001`: an aggregate named `SalesCatalog` anchors `SalesCatalogPublishedEvent`, not `SalesPublishedEvent` or `CatalogPublishedEvent`. `Term` is the exact glossary term represented by the value object; a value object used by one aggregate leads with that aggregate (`OrganizationLegalProfile`), while a Shared kernel value object used across aggregates keeps its bare name (`Money`). `BusinessRule` names the calculation or policy owned by the domain service. `DomainType` is the aggregate root or an aggregate-anchored type it owns, so an exception name leads with the aggregate root. A union base ends with the concept (`RefundOutcome`, `OrganizationRole`) and each case leads with the aggregate and ends with the concept (`RefundSucceededOutcome`, `OrganizationScannerRole`). Each union base and each union case is one file named after the type, grouped in a folder named for the concept within its owning module or aggregate.

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
    Task<Post> GetByIdAsync(
        PostId id,
        CancellationToken cancellationToken);

    void Store(Post post);
}
```

`GetByIdAsync` returns a loaded `Post` and throws `PostNotFoundException` when the identity has no aggregate; the Infrastructure implementation owns that throw. The command pipeline owns the commit. `Store` stages the aggregate through the selected provider implementation.

```csharp
// Infrastructure implementation throws the aggregate's own not-found exception.
public async Task<Post> GetByIdAsync(PostId id, CancellationToken cancellationToken)
{
    var post = await session.LoadAsync<Post>(id, cancellationToken);
    return post ?? throw new PostNotFoundException();
}
```

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

- Inspect Domain package and project references for outer-layer dependencies.
- Compare Domain names with the glossary, module specification, and approved use-case specification.
- Confirm every documented aggregate derives from `AggregateRoot<TId>` and appears in its module ownership table.
- Confirm every documented Aggregate has exactly one abstract state base and at least one sealed state record.
- Confirm no runtime module interface or base class exists.
- Search Domain for any `enum` declaration, lifecycle or discriminator strings, status booleans, and duplicated nullable state fields; confirm every closed set is a state hierarchy, a domain union, or a typed value object.
- Confirm every closed-set union exposes a stable code or label whose `FromCode` round-trips for every case, and that no boundary projects a union through its default `ToString()`.
- Confirm each violated rule throws its own exception type that owns its code and message, and that no aggregate constructs a shared exception with a hard-coded code or message string.
- Confirm every public Domain type and member carries XML documentation that states a constraint, result, or failure rather than restating the name.
- Confirm a module with more than one aggregate gives each aggregate its own folder, and each closed set's base and cases sit in a concept folder rather than loose in the module or in a technical-kind bucket.
- Confirm every event, state case, union base and case, aggregate value object, child entity, and exception name leads with its aggregate root's full name, and that only Shared kernel types are unprefixed.
- Confirm every file under Domain declares one primary public type.
- Confirm aggregate constructors are not public and every mutation uses a business method.
- Confirm handlers do not reproduce state checks or set aggregate properties.
- Confirm typed IDs use `Guid.CreateVersion7()`, reject empty values, and retain one UUID representation across boundaries.
- Test value-object validation, normalization, scalar equality, collection equality, money precision, and currency rules.
- Confirm repositories expose aggregate operations rather than generic CRUD or query behavior.
- Confirm domain services are stateless and contain no outer-layer dependency.
- Confirm events are past-tense `IDomainEvent` records with no aggregate or provider reference, carry no exception or error object, and are not named after the language error type.
- Search value objects for `implicit operator` and confirm none remain in either direction; construction goes through a named factory and the primitive is read through a named member.
- Search for business types, events, and states whose names contain `Exception` (for example `*ExceptionRaisedEvent`, `*ExceptionsPendingState`) and confirm `Exception` names only `{DomainType}{Reason}Exception` failure types, never a business fact or state.
- Round-trip every concrete Aggregate state record through the persistence provider.
- Test every factory, allowed transition, rejected transition, aggregate invariant, state-specific value, and emitted event.
- Confirm aggregate invariant IDs and state transitions map to verified use cases and acceptance criteria.
