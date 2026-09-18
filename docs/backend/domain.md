# Domain Layer

## Intent


Domain contains the business model and protects aggregate invariants without persistence, HTTP, mediator, dependency injection, or provider concepts. Its types use the language from the product glossary, module specifications, and use-case specifications.

The profile gives every Aggregate an explicit state record hierarchy from its first implementation. A one-state hierarchy gives later states and state-specific facts a defined home. It avoids later replacement of an enum, status string, or flag-based lifecycle.

## Agent Summary {#agent-summary}


- Domain references only the base class library and its own types. (standards/rule/backend-domain.keep-domain-free-of-outer-layer-concerns)
- Domain names match the approved glossary term. (standards/rule/backend-domain.use-one-ubiquitous-language)
- The aggregate root is the only public mutation entry point. (standards/rule/backend-domain.treat-aggregates-as-consistency-boundaries)
- Every aggregate root derives from the one project base. (standards/rule/backend-domain.use-the-project-aggregate-root-contract)
- Lifecycle uses an abstract state base with sealed case records. (standards/rule/backend-domain.model-every-aggregate-lifecycle-with-state-records)
- Closed sets are record hierarchies, never enums. (standards/rule/backend-domain.model-every-closed-set-of-domain-values-without-enums)
- Aggregates are created through named static factories only. (standards/rule/backend-domain.create-valid-aggregates-through-named-factories)
- Mutation methods check state, protect invariants, and record events. (standards/rule/backend-domain.express-transitions-through-business-methods)
- Children change only through their root, and collections are read-only. (standards/rule/backend-domain.keep-child-entities-inside-the-aggregate-boundary)
- Identifiers are typed record structs over version 7 GUIDs. (standards/rule/backend-domain.use-strongly-typed-version-7-identifiers)

## Standards


### Keep Domain free of outer-layer concerns (standards/rule/backend-domain.keep-domain-free-of-outer-layer-concerns)

**Requirement:** The Domain project MUST reference only the .NET base class library and project-owned Domain types.

**Rationale:** No persistence, web, mediator, logging, configuration, injection, serialization, or provider package enters Domain. Infrastructure registers a persisted discriminator rather than Domain carrying a serialization attribute.

### Use one ubiquitous language (standards/rule/backend-domain.use-one-ubiquitous-language)

**Requirement:** A Domain type, property, method, exception, or event name MUST match the term its module glossary approves.

**Rationale:** A business action named `Publish` in the glossary is not `SetStatus` in code. The module specification records rejected synonyms that could plausibly return.

### Treat aggregates as consistency boundaries (standards/rule/backend-domain.treat-aggregates-as-consistency-boundaries)

**Requirement:** An aggregate root MUST be the only public mutation entry point for every invariant its transaction protects.

**Rationale:** External code sets no property and calls no child mutation method. A command normally changes one aggregate, and an approved record names the invariant before one command changes several.

### Use the project aggregate root contract (standards/rule/backend-domain.use-the-project-aggregate-root-contract)

**Requirement:** An aggregate root MUST derive from the project-owned `AggregateRoot<TId>` and take identity and event mechanics from that base.

**Rationale:** The base owns the typed identity, the pending event collection, protected recording, and clearing. It owns no timestamp, audit, tenant, lifecycle, or persistence behavior.

### Model every Aggregate lifecycle with state records (standards/rule/backend-domain.model-every-aggregate-lifecycle-with-state-records)

**Requirement:** An aggregate MUST expose one `State` property backed by an abstract `{Aggregate}State` record and sealed per-state records.

**Rationale:** An enum, string discriminator, boolean flag, parallel nullable field, or computed state cannot carry state-specific data or prove exhaustiveness. State records hold that data, and aggregate methods own the transitions.

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

### Model every closed set of domain values without enums (standards/rule/backend-domain.model-every-closed-set-of-domain-values-without-enums)

**Requirement:** The Domain project MUST model every closed set as an abstract record base with sealed cases rather than an `enum`.

**Rationale:** An enum is a named integer. It carries no case data, admits undefined values through a cast, and forces parallel fields when a case later gains data. A closed hierarchy lets the compiler check exhaustiveness.

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

The example uses a typed value object for a closed set represented by one scalar (`standards/rule/backend-domain.use-immutable-value-objects-for-domain-concepts`). It can own validation, normalization, or formatting without per-case data or behavior. The example does not use an enum as its backing field.

The example does not represent a Domain closed set with an enum, scalar discriminator, or boolean flags.

This rule binds the Domain project. A C# `enum` declaration in Domain is invalid under every reading of it. The same set appears at three other layers, and each layer has exactly one permitted form:

| Layer | Form of a closed set | Owning provision |
|:---|:---|:---|
| Domain | Abstract record base with sealed cases. | `standards/rule/backend-domain.model-every-closed-set-of-domain-values-without-enums` |
| Application | The same union shape, mirrored. | `standards/rule/backend-application.mirror-a-domain-closed-set-in-the-result` |
| Transport | Polymorphic `oneOf` model, or string `enum` for a label-only set. | `standards/rule/backend-api.mirror-a-domain-closed-set-as-a-transport-model-of-the-same-shape` |
| Persistence | One stable string discriminator for each case. | `standards/rule/backend-persistence.keep-serialization-behavior-out-of-domain` |

A transport `enum` is permitted in one situation: every case of the set carries no data, and the labels are the complete contract. A set where any case carries data crosses the boundary as a polymorphic model instead.

A transport enum never re-enters Domain. The Application layer converts the label to its record case before it calls a Domain method. An unrecognized label is a validation failure rather than a default case. Without that conversion rule, the boundary exception readmits the integer the Domain rule removed.

Each union exposes one stable code or label. Its `FromCode` factory round-trips every case. A boundary projects through that member, never the record's default `ToString()`. The default can leak a concrete type name instead of `owner`.

Round-trip tests cover every case, which catches a renamed code and a missing label:

```csharp
[Theory]
[MemberData(nameof(AllCases))]
public void FromCode_round_trips_every_case(RefundOutcome outcome)
{
    RefundOutcome.FromCode(outcome.Code).Should().Be(outcome);
}
```

### Create valid aggregates through named factories (standards/rule/backend-domain.create-valid-aggregates-through-named-factories)

**Requirement:** An aggregate root MUST create instances only through a static factory named for its business action.

**Rationale:** The factory accepts typed identifiers, rejects empty identity and violated creation rules, selects the initial state, records required events, and returns a complete aggregate.

A root created with its children composes them inside the same factory call. The children are built from typed values the caller supplies. A caller never hands in an already constructed child, because a caller holding that reference can mutate it after the invariant was checked.

**Example:**

```csharp
public sealed class Order : AggregateRoot<OrderId>
{
    public static Order Place(OrderId id, BuyerId buyer, IReadOnlyList<OrderLineDraft> lines, DateTimeOffset placedAt)
    {
        if (lines.Count == 0) throw new OrderEmptyException();

        var order = new Order(id, buyer, OrderState.AwaitingPayment.Instance);
        foreach (var line in lines) order.AddLine(OrderLine.Create(id, line.Ticket, line.Quantity, line.Price));
        order.Record(new OrderPlacedEvent(id, buyer, placedAt));
        return order;
    }
}
```

### Express transitions through business methods (standards/rule/backend-domain.express-transitions-through-business-methods)

**Requirement:** A public aggregate mutation method MUST check current state, protect its invariants, replace state, and record its domain events.

**Rationale:** A handler then calls `post.Publish(utcNow)` without testing the state first. A generic `Set`, `Update`, `Process`, or `Handle` name hides which business action ran.

The four steps run in that order. A method that replaces state before checking an invariant leaves a rejected aggregate holding the new state. A method that records an event before replacing state can record a fact the next check refuses. A method that throws after recording an event loses the whole call, because the aggregate is never persisted.

### Keep child entities inside the aggregate boundary (standards/rule/backend-domain.keep-child-entities-inside-the-aggregate-boundary)

**Requirement:** A child entity MUST expose no mutable state outside its aggregate root, surfacing its collection as a read-only view.

**Rationale:** The root creates, finds, and changes children through business methods. A child with lifecycle states uses the same sealed state records and no enum.

### Use strongly typed version 7 identifiers (standards/rule/backend-domain.use-strongly-typed-version-7-identifiers)

**Requirement:** An aggregate identity MUST be a `readonly record struct` wrapping one `Guid` created with `Guid.CreateVersion7()`.

**Rationale:** It implements the project `IStronglyTypedId` marker and `IParsable<TId>`, rejects `Guid.Empty`, and each factory also rejects the struct default. No implicit conversion erases the type.

Version 7 embeds a millisecond timestamp, so the identity factory reads a clock. That read is the one exception to `standards/rule/backend-domain.pass-nondeterministic-values-into-domain`. It observes no business time and decides nothing. A test that needs a fixed identity passes one in rather than freezing a clock.

**Example:** [RFC 9562](https://www.rfc-editor.org/info/rfc9562) defines version 7 as a timestamp followed by at least 74 random bits. The Domain writes no collision handling for that space. Persistence rejects a duplicate key and the operation fails, which is the same path as any other write conflict.

### Use immutable value objects for domain concepts (standards/rule/backend-domain.use-immutable-value-objects-for-domain-concepts)

**Requirement:** A value object MUST be immutable, compare by its complete value, and expose creation through a static method rather than a constructor.

**Rationale:** It exposes no setter and no implicit conversion, because a primitive conversion hides validation and a value conversion erases the domain type. Reading uses `Value` or `ToString`.

### Define collection value semantics explicitly (standards/rule/backend-domain.define-collection-value-semantics-explicitly)

**Requirement:** A value object containing a collection MUST implement content equality and a matching hash for its declared ordering rule.

**Rationale:** Default record equality compares collection references, not contents. Constructors copy incoming mutable collections and members return read-only views. The module terms state whether order is part of the value.

### Make money and decimal rules explicit (standards/rule/backend-domain.make-money-and-decimal-rules-explicit)

**Requirement:** A monetary amount MUST use `decimal` inside a `Money` value object that carries its currency.

**Rationale:** The module specification defines supported currencies, scale, rounding, sign rules, and cross-currency arithmetic, and Infrastructure maps that precision explicitly.

### Keep binary floating point out of exact quantities (standards/rule/backend-domain.keep-binary-floating-point-out-of-exact-quantities)

**Requirement:** A Domain type MUST NOT use `double` or `float` for a monetary amount, a rate applied to one, or a quantity compared for exact equality.

**Rationale:** Binary floating point cannot represent most decimal fractions, so two amounts that a person reads as equal compare as different. The prohibition belonged in a rationale, where it obliged nobody.

**Example:** A tax rate multiplied into a `Money` amount is a `decimal`. A measured latency in a diagnostic record is not a domain quantity and is outside this rule.

### Use stateless domain services for ownerless rules (standards/rule/backend-domain.use-stateless-domain-services-for-ownerless-rules)

**Requirement:** A domain service MUST be stateless, accept and return Domain values, and perform no persistence, messaging, clock, or provider call.

**Rationale:** It exists only when a calculation spans concepts with no natural aggregate owner. Application loads the aggregates, calls the service, and passes its result into aggregate behavior.

A domain service is stateless and takes no port, so its tests are Domain tests. They sit beside the aggregate tests in the Domain test project, with no harness, no substitute, and no fixture.

### Keep repository interfaces in Domain (standards/rule/backend-domain.keep-repository-interfaces-in-domain)

**Requirement:** A repository interface MUST expose only aggregate and Domain types, without `IQueryable`, a session, or a generic CRUD surface.

**Rationale:** A required load uses `GetByIdAsync` and throws `{Aggregate}NotFoundException`, so a handler repeats no null check. A nullable `FindBy...Async` is reserved for lookups where absence is normal.

This interface is the write side only. Reading for a Query uses a Read Model owned by Application and shaped by Infrastructure, and that path declares no Domain interface. A repository that gained a projection method would put query shapes in the Domain, which is the coupling this layer exists to prevent.

### Raise immutable domain facts (standards/rule/backend-domain.raise-immutable-domain-facts)

**Requirement:** A domain event MUST be a public immutable record named `{Aggregate}{PastFact}Event` implementing `IDomainEvent`.

**Rationale:** The name states which aggregate raised the fact without opening the file. The event carries the business data its reactions need, and no aggregate, session, service, mutable collection, or exception.

### Reject business violations with Domain exceptions (standards/rule/backend-domain.reject-business-violations-with-domain-exceptions)

**Requirement:** A rejected business rule MUST throw a `DomainException` subclass named `{DomainType}{Reason}Exception` carrying a stable code.

**Rationale:** The name always leads with the aggregate root. Domain throws no `InvalidOperationException`, `ArgumentException`, validation, HTTP, or provider exception for a business rejection, and carries no transport status.

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

### Reference other aggregates by ID (standards/rule/backend-domain.reference-other-aggregates-by-id)

**Requirement:** An aggregate MUST store another aggregate's typed identifier rather than an object reference.

**Rationale:** Application loads each aggregate through its repository when a command coordinates several. The use-case specification names any immediate cross-aggregate invariant.

### Pass nondeterministic values into Domain (standards/rule/backend-domain.pass-nondeterministic-values-into-domain)

**Requirement:** Domain behavior MUST receive time, randomness, and external values as parameters rather than read them.

**Rationale:** Application obtains the value through an owned port and passes it in, so a Domain test supplies an explicit value and stays deterministic.

### Document every public Domain contract (standards/rule/backend-domain.document-every-public-domain-contract)

**Requirement:** Every public Domain type and member MUST carry XML documentation stating the business constraint, result, or failure it represents.

**Rationale:** A summary that restates the member name adds nothing. A mutation method names its source states, resulting state, protected invariant, and recorded event.

## Conventions


### Apply the documented defaults (standards/rule/backend-domain.apply-the-documented-defaults)

**Default:** Read each code block in this section as the named design rule only, without its namespace and unrelated declarations.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Consumer files still apply `standards/rule/backend-domain.document-every-public-domain-contract` to their complete public contracts.

### Organize a module by aggregate and concept (standards/rule/backend-domain.organize-a-module-by-aggregate-and-concept)

**Default:** Give each aggregate a folder named with its plural root name, holding its own states, events, exceptions, and concepts.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A single aggregate stays flat only when its plural root name equals the module name. Separate aggregates never share lifecycle, event, or rejection folders.

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

Each aggregate-specific repository interface stays with the aggregate it loads. The other layers mirror this organization: Application, Infrastructure. WebApi use the same module and per-aggregate folder names, per `standards/rule/backend-architecture.organize-every-layer-by-module-and-use-case`.

### Use these Domain names (standards/rule/backend-domain.use-these-domain-names)

**Default:** Name each Domain type from the aggregate root it belongs to, following the tables in this section.

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
| Typed state case, flat | `{Aggregate}{State}State` | `PostPublishedState` |
| Typed state case, nested | `{Aggregate}State.{State}` | `PostState.Published` |
| Domain union base | `{Aggregate}{Concept}` | `RefundOutcome` |
| Domain union case | `{Aggregate}{Case}{Concept}` | `RefundSucceededOutcome`, `OrganizationScannerRole` |
| Repository | `I{Aggregate}Repository` | `IPostRepository` |
| Domain service | `{BusinessRule}DomainService` | `OrderPricingDomainService` |
| Domain event | `{Aggregate}{PastFact}Event` | `PostPublishedEvent` |
| Domain exception | `{DomainType}{Reason}Exception` | `PostAlreadyPublishedException` |

Every aggregate-owned type starts with the aggregate root's full name (`standards/rule/workspace-naming.anchor-aggregate-owned-types-on-the-aggregate-root`). `SalesCatalog` anchors `SalesCatalogPublishedEvent`. The example does not abbreviate the anchor. `Term` is the glossary term represented by a value object.

An aggregate value object uses its aggregate prefix. A Shared kernel value object keeps its bare name. `BusinessRule` names a domain service policy. `DomainType` names the aggregate-owned type. Union bases and cases end with their concept. The example stores each type in its own file.

A state case takes one of two forms, and a project picks one and keeps it. The flat form declares each case as a top-level record carrying the aggregate prefix. The nested form declares each case inside its `{Aggregate}State` base, which already carries that prefix. `PostState.Published` therefore reads as its full name at every call site. A nested case never repeats the prefix its parent supplies.

The nested form keeps the cases and the base in one file. The flat form keeps one type per file. Both satisfy `standards/rule/workspace-naming.anchor-aggregate-owned-types-on-the-aggregate-root`, because the qualified name still leads with the aggregate root.

### Define the shared Domain contracts once (standards/rule/backend-domain.define-the-shared-domain-contracts-once)

**Default:** Declare the shared Domain contracts once in the Domain project and reuse them across every module.

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

### Define typed IDs without primitive escape hatches (standards/rule/backend-domain.define-typed-ids-without-primitive-escape-hatches)

**Default:** Give a typed identifier no implicit conversion, no primitive property alias, and no parameterless public creation path.

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

### Keep ID representations aligned at every boundary (standards/rule/backend-domain.keep-id-representations-aligned-at-every-boundary)

**Default:** Represent an identifier the same way in Domain, persistence, transport, and generated clients.

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

### Keep state records as the only Aggregate lifecycle representation (standards/rule/backend-domain.keep-state-records-as-the-only-aggregate-lifecycle-representation)

**Default:** Read aggregate lifecycle only through the `State` property and its record type.

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

### Keep value creation and equality explicit (standards/rule/backend-domain.keep-value-creation-and-equality-explicit)

**Default:** Create every value object through a named static method and declare its equality explicitly.

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

### Keep domain services pure (standards/rule/backend-domain.keep-domain-services-pure)

**Default:** Keep a domain service free of persistence, messaging, logging, clock, authorization, and provider calls.

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

### Keep repository contracts aggregate-specific (standards/rule/backend-domain.keep-repository-contracts-aggregate-specific)

**Default:** Declare one repository interface per aggregate rather than a shared generic contract.

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

This informative example demonstrates `standards/rule/backend-domain.use-the-project-aggregate-root-contract`, `standards/rule/backend-domain.model-every-aggregate-lifecycle-with-state-records`, and `standards/rule/backend-domain.create-valid-aggregates-through-named-factories`.

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
| standards/rule/backend-domain.keep-domain-free-of-outer-layer-concerns | inspection | `ArchitectureTests` asserts the Domain assembly references no package outside the base class library. |
| standards/rule/backend-domain.use-one-ubiquitous-language | inspection | Terminology review compares each new Domain name against `docs/domain/glossary.md` and the module terms table. |
| standards/rule/backend-domain.treat-aggregates-as-consistency-boundaries | inspection | `ArchitectureTests` asserts no child entity exposes a public setter or mutation method outside its root. |
| standards/rule/backend-domain.use-the-project-aggregate-root-contract | inspection | `ArchitectureTests` asserts every aggregate root derives from the single project base and declares no second event list. |
| standards/rule/backend-domain.model-every-aggregate-lifecycle-with-state-records | inspection | `ArchitectureTests` asserts each aggregate exposes one abstract state base with sealed cases and no lifecycle flag or enum. |
| standards/rule/backend-domain.model-every-closed-set-of-domain-values-without-enums | inspection | `ArchitectureTests` asserts the Domain assembly declares no enum type and each closed set exposes sealed case records. |
| standards/rule/backend-domain.create-valid-aggregates-through-named-factories | inspection | `ArchitectureTests` asserts no aggregate root declares a public constructor and each creation path is a named static factory. |
| standards/rule/backend-domain.express-transitions-through-business-methods | inspection | `DomainBehaviorTests` asserts each mutation method rejects its disallowed source states and records its declared event. |
| standards/rule/backend-domain.keep-child-entities-inside-the-aggregate-boundary | inspection | `ArchitectureTests` asserts each child collection property returns a read-only interface and exposes no mutation path. |
| standards/rule/backend-domain.use-strongly-typed-version-7-identifiers | inspection | `TypedIdTests` asserts each identifier rejects an empty and default value and declares no implicit primitive conversion. |
| standards/rule/backend-domain.use-immutable-value-objects-for-domain-concepts | inspection | `ValueObjectTests` asserts each value type is immutable, compares by value, and rejects invalid input at creation. |
| standards/rule/backend-domain.define-collection-value-semantics-explicitly | inspection | `ValueObjectTests` asserts each collection value compares by contents under its declared ordering rule. |
| standards/rule/backend-domain.make-money-and-decimal-rules-explicit | inspection | `MoneyTests` asserts arithmetic honors the declared scale, rounding, and cross-currency rules. |
| standards/rule/backend-domain.keep-binary-floating-point-out-of-exact-quantities | test | `DomainArchitectureTests` asserts no Domain member declares a `double` or `float` parameter, property, or return type. |
| standards/rule/backend-domain.use-stateless-domain-services-for-ownerless-rules | inspection | `ArchitectureTests` asserts no domain service holds state or resolves a persistence, clock, or provider dependency. |
| standards/rule/backend-domain.keep-repository-interfaces-in-domain | inspection | `ArchitectureTests` asserts each repository signature names only Domain types and exposes no queryable or session. |
| standards/rule/backend-domain.raise-immutable-domain-facts | inspection | `DomainEventTests` asserts each event is an immutable record whose name leads with its aggregate root. |
| standards/rule/backend-domain.reject-business-violations-with-domain-exceptions | inspection | `DomainExceptionTests` asserts each rejection throws its own type with a stable code and no transport detail. |
| standards/rule/backend-domain.reference-other-aggregates-by-id | inspection | `ArchitectureTests` asserts no aggregate declares a field or property typed as another aggregate root. |
| standards/rule/backend-domain.pass-nondeterministic-values-into-domain | inspection | `ArchitectureTests` asserts no Domain type reads system time or generates a random business value. |
| standards/rule/backend-domain.document-every-public-domain-contract | static | The Release build fails on a missing XML comment through the `1591` documentation warning promoted to an error. |
| standards/rule/backend-domain.apply-the-documented-defaults | inspection | Review confirms each consumer file carries the full contract that its example omits. |
| standards/rule/backend-domain.organize-a-module-by-aggregate-and-concept | inspection | Folder review compares each Domain module tree against its aggregate roster, or records a named local replacement. |
| standards/rule/backend-domain.use-these-domain-names | inspection | Naming review compares each new Domain type against the tables in this section. |
| standards/rule/backend-domain.define-the-shared-domain-contracts-once | inspection | `ArchitectureTests` asserts one declaration exists for each shared Domain marker and base contract. |
| standards/rule/backend-domain.define-typed-ids-without-primitive-escape-hatches | inspection | `TypedIdTests` asserts no identifier declares an implicit conversion or public parameterless creation path. |
| standards/rule/backend-domain.keep-id-representations-aligned-at-every-boundary | inspection | `TypedIdTests` asserts the persisted and serialized forms match the Domain representation for each identifier. |
| standards/rule/backend-domain.keep-state-records-as-the-only-aggregate-lifecycle-representation | inspection | `ArchitectureTests` asserts no aggregate exposes a lifecycle flag, status string, or computed state alongside its state record. |
| standards/rule/backend-domain.keep-value-creation-and-equality-explicit | inspection | `ValueObjectTests` asserts each value type creates through a named method and declares its equality members. |
| standards/rule/backend-domain.keep-domain-services-pure | inspection | `ArchitectureTests` asserts no domain service resolves an outer-layer dependency. |
| standards/rule/backend-domain.keep-repository-contracts-aggregate-specific | inspection | `ArchitectureTests` asserts each repository interface names exactly one aggregate root. |
