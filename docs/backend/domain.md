# Domain Layer

## Intent

Domain holds the business model and protects aggregate invariants. It references no persistence, HTTP, messaging, logging, configuration, injection, serialization, or provider concept. Its names match the Terms its records use.

Every aggregate exposes its lifecycle as state records from its first implementation. A one-state hierarchy gives later states and state-specific facts a defined home. It avoids later replacement of an enum, status string, or flag-based lifecycle.

## Agent Summary {#agent-summary}

- Domain references only the base class library and its own types. (standards/rule/backend-domain.keep-domain-free-of-outer-layer-concerns)
- Domain names match the Terms the records use. (standards/rule/backend-domain.use-one-ubiquitous-language)
- The aggregate root is the only public mutation entry point. (standards/rule/backend-domain.treat-aggregates-as-consistency-boundaries)
- Every aggregate root derives from the one project base. (standards/rule/backend-domain.use-the-project-aggregate-root-contract)
- Lifecycle uses an abstract state base with sealed case records. (standards/rule/backend-domain.model-every-aggregate-lifecycle-with-state-records)
- Closed sets are record hierarchies with stable codes, never enums. (standards/rule/backend-domain.model-every-closed-set-of-domain-values-without-enums)
- Aggregates are created through named static factories only. (standards/rule/backend-domain.create-valid-aggregates-through-named-factories)
- Mutations check state; transitions also replace state and record events. (standards/rule/backend-domain.express-transitions-through-business-methods)
- Children change only through their root, and collections are read-only. (standards/rule/backend-domain.keep-child-entities-inside-the-aggregate-boundary)
- Identifiers are typed record structs over version 7 GUIDs. (standards/rule/backend-domain.use-strongly-typed-version-7-identifiers)
- Money is one value object with decimal amount and currency code. (standards/rule/backend-domain.make-money-and-decimal-rules-explicit)
- Time, randomness, and identifiers arrive as arguments; Domain reads no clock. (standards/rule/backend-domain.pass-nondeterministic-values-into-domain)
- Each rejected rule throws its own exception type with a stable code. (standards/rule/backend-domain.reject-business-violations-with-domain-exceptions)
- Domain events carry business data only; envelope identity lives outside. (standards/rule/backend-domain.raise-immutable-domain-facts)

## Standards

### Keep Domain free of outer-layer concerns (standards/rule/backend-domain.keep-domain-free-of-outer-layer-concerns)

**Requirement:** The Domain project MUST reference only the .NET base class library and project-owned Domain types.

**Rationale:** No persistence, web, mediator, logging, configuration, injection, serialization, or provider package enters Domain. Infrastructure registers a persisted discriminator rather than Domain carrying a serialization attribute.

### Use one ubiquitous language (standards/rule/backend-domain.use-one-ubiquitous-language)

**Requirement:** A Domain type, property, method, exception, or event name MUST match a Term record in the project language record.

**Rationale:** A business action named `Publish` in the language record is not `SetStatus` in code. The language record holds each Term meaning, labels per language, rejected words, and broader and narrower links. Records cite the Terms they use, and the glossary is generated from the language record.

### Treat aggregates as consistency boundaries (standards/rule/backend-domain.treat-aggregates-as-consistency-boundaries)

**Requirement:** An aggregate root MUST be the only public mutation entry point for every invariant its transaction protects.

**Rationale:** External code sets no property and calls no child mutation method. A command normally changes one aggregate. The use-case record names any immediate invariant before one command changes several.

### Use the project aggregate root contract (standards/rule/backend-domain.use-the-project-aggregate-root-contract)

**Requirement:** An aggregate root MUST derive from the project-owned `AggregateRoot<TId>` and take identity and event mechanics from that base.

**Rationale:** The base owns the typed identity, the pending event collection, protected recording, and clearing. It owns no timestamp, audit, tenant, lifecycle, or persistence behavior.

### Model every Aggregate lifecycle with state records (standards/rule/backend-domain.model-every-aggregate-lifecycle-with-state-records)

**Requirement:** An aggregate MUST expose one `State` property backed by an abstract `{Aggregate}State` record and sealed per-state records. Callers read lifecycle only through that property.

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

**Requirement:** The Domain project MUST model every closed set as an abstract record base with sealed cases rather than an `enum`. Every case MUST expose one stable `Code`. A set whose cases carry no data MUST expose a `FromCode` factory that rebuilds every case from its label. A boundary converts a label to its case through `FromCode`, never through `ToString`. An unrecognized label is a validation failure rather than a default case.

**Rationale:** An enum is a named integer. It carries no case data, admits undefined values through a cast, and forces parallel fields when a case later gains data. A closed hierarchy lets the compiler check exhaustiveness.

**Example:**

```csharp
public abstract record RefundOutcome
{
    public abstract string Code { get; }
}

public sealed record RefundPendingOutcome(string Reason) : RefundOutcome
{
    public override string Code => "pending";
}

public sealed record RefundSucceededOutcome(DateTimeOffset ProviderTime) : RefundOutcome
{
    public override string Code => "succeeded";
}

public sealed record RefundFailedOutcome(string Classification) : RefundOutcome
{
    public override string Code => "failed";
}

public sealed record RefundReversedOutcome(DateTimeOffset ProviderTime) : RefundOutcome
{
    public override string Code => "reversed";
}
```

A case that owns no data is still a sealed record, so the set can grow case data later without a breaking change:

```csharp
public abstract record MerchantRole
{
    public abstract string Code { get; }

    public static MerchantRole FromCode(string code) => code switch
    {
        "owner" => new MerchantOwnerRole(),
        "warehouse-staff" => new MerchantWarehouseStaffRole(),
        _ => throw new MerchantUnsupportedRoleException(code),
    };
}

public sealed record MerchantOwnerRole : MerchantRole
{
    public override string Code => "owner";
}

public sealed record MerchantWarehouseStaffRole : MerchantRole
{
    public override string Code => "warehouse-staff";
}
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

A closed set represented by one scalar uses a typed value object, never an enum backing field.

This rule binds the Domain project. The same set appears at three other layers, and each layer has exactly one permitted form:

| Layer | Form of a closed set | Owning provision |
|:---|:---|:---|
| Domain | Abstract record base with sealed cases. | `standards/rule/backend-domain.model-every-closed-set-of-domain-values-without-enums` |
| Application | The same union shape, mirrored. | `standards/rule/backend-application.mirror-a-domain-closed-set-in-the-result` |
| Transport | Polymorphic `oneOf` model, or string `enum` for a label-only set. | `standards/rule/backend-api.mirror-a-domain-closed-set-as-a-transport-model-of-the-same-shape` |
| Persistence | One stable string discriminator for each case. | `standards/rule/backend-persistence.keep-serialization-behavior-out-of-domain` |

A transport `enum` is permitted in one situation: every case of the set carries no data, and the labels are the complete contract. A set where any case carries data crosses the boundary as a polymorphic model instead.

A transport enum never re-enters Domain. The Application layer converts the label to its record case before it calls a Domain method.

Round-trip tests cover every data-less case, which catches a renamed code and a missing label:

```csharp
[Theory]
[MemberData(nameof(AllRoles))]
public void FromCode_round_trips_every_case(MerchantRole role)
{
    MerchantRole.FromCode(role.Code).Should().Be(role);
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
    public static Order Place(OrderId id, CustomerId customer, IReadOnlyList<OrderLineDraft> lines, DateTimeOffset placedAt)
    {
        if (lines.Count == 0) throw new OrderEmptyException();

        var order = new Order(id, customer, new OrderAwaitingPaymentState());
        foreach (var line in lines) order.AddLine(OrderLine.Create(id, line.Product, line.Quantity, line.Price));
        order.RaiseDomainEvent(new OrderPlacedEvent(id, customer, placedAt));
        return order;
    }
}
```

### Express transitions through business methods (standards/rule/backend-domain.express-transitions-through-business-methods)

**Requirement:** A public aggregate mutation method MUST check current state and protect its invariants. A method that moves the lifecycle MUST also replace state and record its transition event.

**Rationale:** A handler then calls `post.Publish(utcNow)` without testing the state first. A generic `Set`, `Update`, `Process`, or `Handle` name hides which business action ran. A mutation that changes no lifecycle state, such as `ChangeTitle` on a draft, checks state and assigns without recording a transition.

Checks run before replacement, and replacement runs before recording. A method that replaces state before checking an invariant leaves a rejected aggregate holding the new state.

### Keep child entities inside the aggregate boundary (standards/rule/backend-domain.keep-child-entities-inside-the-aggregate-boundary)

**Requirement:** A child entity MUST expose no mutable state outside its aggregate root, surfacing its collection as a read-only view.

**Rationale:** The root creates, finds, and changes children through business methods. A child with lifecycle states uses the same sealed state records and no enum.

### Use strongly typed version 7 identifiers (standards/rule/backend-domain.use-strongly-typed-version-7-identifiers)

**Requirement:** An aggregate identity MUST be a `readonly record struct` wrapping one `Guid` in version 7 form. It MUST declare no implicit conversion, no primitive alias, and no public parameterless creation path.

**Rationale:** It implements the project `IStronglyTypedId` marker and `IParsable<TId>`, rejects `Guid.Empty`, and each factory also rejects the struct default. New values arrive from the caller: a factory takes its identifier as an argument. A method that needs several identifiers takes a generator as an argument. Domain reads no clock and calls no static source of time or randomness.

Version 7 values come from the caller-supplied generator, so Domain observes no business time and decides nothing about clocks. Persistence rejects a duplicate key and the operation fails, which is the same path as any other write conflict.

**Example:**

```csharp
public readonly record struct PostId : IStronglyTypedId, IParsable<PostId>
{
    private PostId(Guid value)
    {
        Value = value;
    }

    public Guid Value { get; }

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

### Use immutable value objects for domain concepts (standards/rule/backend-domain.use-immutable-value-objects-for-domain-concepts)

**Requirement:** A value object MUST be immutable, compare by its complete value, and expose creation through a static method rather than a constructor.

**Rationale:** It exposes no setter and no implicit conversion, because a primitive conversion hides validation and a value conversion erases the domain type. Reading uses `Value` or `ToString`. Creation through a named static method keeps every construction path under the validation the type declares.

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

### Define collection value semantics explicitly (standards/rule/backend-domain.define-collection-value-semantics-explicitly)

**Requirement:** A value object containing a collection MUST implement content equality and a matching hash for its declared ordering rule.

**Rationale:** Default record equality compares collection references, not contents. Constructors copy incoming mutable collections and members return read-only views. The module terms state whether order is part of the value.

**Example:**

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

### Make money and decimal rules explicit (standards/rule/backend-domain.make-money-and-decimal-rules-explicit)

**Requirement:** A monetary amount MUST use `decimal` inside one shared `Money` value object that carries an ISO 4217 currency code. `Money` MUST serialize as `{ "amount": "12.50", "currency": "EUR" }`.

**Rationale:** The owning module record defines supported currencies, scale, rounding, sign rules, and cross-currency arithmetic. Infrastructure maps that precision explicitly. A use case fixed to one currency accepts an amount alone and states that currency in its record.

**Example:**

```csharp
public sealed record Money
{
    private Money(decimal amount, string currency)
    {
        Amount = amount;
        Currency = currency;
    }

    public decimal Amount { get; }

    public string Currency { get; }

    public static Money Create(decimal amount, string currency) => new(amount, currency);

    public override string ToString() => $"{Amount} {Currency}";
}
```

```json
{ "amount": "12.50", "currency": "EUR" }
```

The amount serializes as a string, so no reader parses it as binary floating point.

### Keep binary floating point out of exact quantities (standards/rule/backend-domain.keep-binary-floating-point-out-of-exact-quantities)

**Requirement:** A Domain type MUST NOT use `double` or `float` for a monetary amount, a rate applied to one, or a quantity compared for exact equality.

**Rationale:** Binary floating point cannot represent most decimal fractions, so two amounts that a person reads as equal compare as different.

**Example:** A tax rate multiplied into a `Money` amount is a `decimal`. A measured latency in a diagnostic record is not a domain quantity and is outside this rule.

### Use stateless domain services for ownerless rules (standards/rule/backend-domain.use-stateless-domain-services-for-ownerless-rules)

**Requirement:** A domain service MUST be stateless, accept and return Domain values, and perform no persistence, messaging, logging, clock, authorization, or provider call.

**Rationale:** It exists only when a calculation spans concepts with no natural aggregate owner. Application loads the aggregates, calls the service, and passes its result into aggregate behavior.

A domain service is stateless and takes no port, so its tests are Domain tests. They sit beside the aggregate tests in the Domain test project, with no harness, no substitute, and no fixture.

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

### Keep repository interfaces in Domain (standards/rule/backend-domain.keep-repository-interfaces-in-domain)

**Requirement:** A repository interface MUST expose only aggregate and Domain types, without `IQueryable`, a session, or a generic CRUD surface. Each repository MUST serve exactly one aggregate root.

**Rationale:** A required load uses `GetByIdAsync` and throws `{Aggregate}NotFoundException`, so a handler repeats no null check. A nullable `FindBy...Async` is reserved for lookups where absence is normal.

This interface is the write side only. Reading for a Query uses a Read Model owned by Application and shaped by Infrastructure, and that path declares no Domain interface. A repository that gained a projection method would put query shapes in Domain, which is the coupling this layer exists to prevent.

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

### Raise immutable domain facts (standards/rule/backend-domain.raise-immutable-domain-facts)

**Requirement:** A domain event MUST be a public immutable record named `{Aggregate}{PastFact}Event` implementing `IDomainEvent`. It MUST carry business data only: typed identifiers and the values its reactions need.

**Rationale:** The name states which aggregate raised the fact without opening the file. The event carries no aggregate, session, service, mutable collection, or exception. Envelope identity, such as message identity and causation identity, lives on the published integration event that carries the fact outside the process.

### Reject business violations with Domain exceptions (standards/rule/backend-domain.reject-business-violations-with-domain-exceptions)

**Requirement:** A rejected business rule MUST throw a `DomainException` subclass named `{DomainType}{Reason}Exception` carrying a stable code.

**Rationale:** The name always leads with the aggregate root. Domain throws no `InvalidOperationException`, `ArgumentException`, validation, HTTP, or provider exception for a business rejection, and carries no transport status. Exception names follow `standards/rule/workspace-naming.name-exceptions-by-failed-rule`; this provision owns the one-type-per-rule shape and the code each type carries.

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

**Rationale:** Application loads each aggregate through its repository when a command coordinates several. The use-case record names any immediate cross-aggregate invariant.

### Pass nondeterministic values into Domain (standards/rule/backend-domain.pass-nondeterministic-values-into-domain)

**Requirement:** Domain behavior MUST receive time, randomness, and new identifiers as arguments rather than read them. Domain MUST NOT read a clock.

**Rationale:** Application obtains each value through an owned port and passes it in, so a Domain test supplies an explicit value and stays deterministic. A method that needs more than one value receives a clock or a generator through its arguments. Version 7 identifiers come from the caller-supplied generator.

### Document every public Domain contract (standards/rule/backend-domain.document-every-public-domain-contract)

**Requirement:** Every public Domain type and member MUST carry XML documentation stating the business constraint, result, or failure it represents.

**Rationale:** A summary that restates the member name adds nothing. A mutation method names its source states, resulting state, protected invariant, and recorded event.

## Conventions

*Read each code block in the Conventions section as the named design rule only, without its namespace and unrelated declarations.*

### Organize a module by aggregate and concept (standards/rule/backend-domain.organize-a-module-by-aggregate-and-concept)

**Default:** Give each aggregate a folder named with its plural root name, holding its own states, events, exceptions, and concepts.

**Replacement:** A consumer records a departure as an Exception record naming this provision, with reason and review date.

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
  Shipping/                       one aggregate whose name differs from the module, with a domain union in a concept folder
    Shipments/
      Shipment.cs
      ShipmentId.cs
      IShipmentRepository.cs
      Outcomes/
        ShipmentOutcome.cs
        ShipmentDeliveredOutcome.cs
        ShipmentReturnedOutcome.cs
        ShipmentLostOutcome.cs
      States/
        ShipmentState.cs
        ShipmentPendingState.cs
        ShipmentDispatchedState.cs
        ShipmentDeliveredState.cs
      Events/
        ShipmentOutcomeRecordedEvent.cs
  Customers/                      more than one aggregate: one plural folder per aggregate
    CustomerAccounts/               namespace Shop.Domain.Customers.CustomerAccounts
      CustomerAccount.cs
      CustomerAccountId.cs
      ICustomerAccountRepository.cs
      States/
        CustomerAccountState.cs
        CustomerAccountClaimedState.cs
      Events/
        CustomerAccountRestrictedEvent.cs
    Consents/                       namespace Shop.Domain.Customers.Consents
      Consent.cs
      ConsentId.cs
      IConsentRepository.cs
      States/
        ConsentState.cs
        ConsentGrantedState.cs
      Events/
        ConsentGrantedEvent.cs
```

Each aggregate-specific repository interface stays with the aggregate it loads. Application, Infrastructure, and WebApi use the same module and per-aggregate folder names, per `standards/rule/backend-architecture.organize-every-layer-by-module-and-use-case`.

### Use these Domain names (standards/rule/backend-domain.use-these-domain-names)

**Default:** Name each Domain type from the aggregate root it belongs to, following the workspace naming provisions cited below.

**Replacement:** A consumer records a departure as an Exception record naming this provision, with reason and review date.

**Rationale:** Aggregate-owned names follow `standards/rule/workspace-naming.anchor-aggregate-owned-types-on-the-aggregate-root`. Architectural suffixes follow `standards/rule/workspace-naming.use-architectural-suffixes`. Exception names follow `standards/rule/workspace-naming.name-exceptions-by-failed-rule`. A state case takes the flat or the nested form, and a project keeps the form it picks.

**Example:**

The flat form declares each case as a top-level record carrying the aggregate prefix. The nested form declares each case inside its `{Aggregate}State` base, which already carries that prefix. `PostState.Published` therefore reads as its full name at every call site. A nested case never repeats the prefix its parent supplies.

The nested form keeps the cases and the base in one file. The flat form keeps one type per file.

### Define the shared Domain contracts once (standards/rule/backend-domain.define-the-shared-domain-contracts-once)

**Default:** Declare the shared Domain contracts once in the Domain project and reuse them across every module.

**Replacement:** A consumer records a departure as an Exception record naming this provision, with reason and review date.

**Example:**

```csharp
public interface IDomainEvent;

public abstract class DomainException(string message) : Exception(message)
{
    public abstract string Code { get; }
}

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

`ClearDomainEvents` is Event-delivery mechanics, not a business mutation entry point. Infrastructure calls it only after the selected delivery path has accepted the pending events.

Concrete aggregates validate that `id.Value` is not `Guid.Empty` before calling or while calling the base constructor. The base remains free of aggregate-specific exceptions.

### Keep ID representations aligned at every boundary (standards/rule/backend-domain.keep-id-representations-aligned-at-every-boundary)

**Default:** Represent an identifier the same way in Domain, persistence, transport, and generated clients.

**Replacement:** A consumer records a departure as an Exception record naming this provision, with reason and review date.

**Example:**

| Boundary | Representation | Owner |
|:---|:---|:---|
| Creation | Caller-supplied value or generator through arguments. | Caller |
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

| ID | Mark | Evidence |
|:---|:---|:---|
| standards/rule/backend-domain.keep-domain-free-of-outer-layer-concerns | guidance | Does the Domain assembly reference only the base class library and project-owned Domain types? |
| standards/rule/backend-domain.use-one-ubiquitous-language | guidance | Does each Domain name match a Term record in the project language record? |
| standards/rule/backend-domain.treat-aggregates-as-consistency-boundaries | guidance | Is each aggregate root the only public mutation path for the invariants its transaction protects? |
| standards/rule/backend-domain.use-the-project-aggregate-root-contract | guidance | Does every aggregate root derive from the one project base and use its identity and event mechanics? |
| standards/rule/backend-domain.model-every-aggregate-lifecycle-with-state-records | guidance | Does each aggregate expose one State property over an abstract base with sealed cases, read only through that property? |
| standards/rule/backend-domain.model-every-closed-set-of-domain-values-without-enums | guidance | Is each closed set a record hierarchy with stable codes and FromCode for data-less sets, with no enum in Domain? |
| standards/rule/backend-domain.create-valid-aggregates-through-named-factories | guidance | Does each aggregate root create instances only through a named static factory that checks identity and records events? |
| standards/rule/backend-domain.express-transitions-through-business-methods | guidance | Does each mutation check state, and does each lifecycle move also replace state and record its event? |
| standards/rule/backend-domain.keep-child-entities-inside-the-aggregate-boundary | guidance | Do children expose no mutable state outside their root, with collections surfaced as read-only views? |
| standards/rule/backend-domain.use-strongly-typed-version-7-identifiers | guidance | Is each identity a readonly record struct over a version 7 Guid with no conversion, alias, or parameterless creation? |
| standards/rule/backend-domain.use-immutable-value-objects-for-domain-concepts | guidance | Is each value object immutable, compared by complete value, and created through a static method? |
| standards/rule/backend-domain.define-collection-value-semantics-explicitly | guidance | Does each collection value implement content equality and a matching hash under its ordering rule? |
| standards/rule/backend-domain.make-money-and-decimal-rules-explicit | guidance | Is each monetary amount a decimal in the shared Money object with the stated JSON shape? |
| standards/rule/backend-domain.keep-binary-floating-point-out-of-exact-quantities | guidance | Does no Domain member use double or float for money, a rate applied to money, or an exactly compared quantity? |
| standards/rule/backend-domain.use-stateless-domain-services-for-ownerless-rules | guidance | Is each domain service stateless, confined to Domain values, and free of the banned calls? |
| standards/rule/backend-domain.keep-repository-interfaces-in-domain | guidance | Does each repository serve one aggregate with Domain-only types and no queryable, session, or generic surface? |
| standards/rule/backend-domain.raise-immutable-domain-facts | guidance | Is each domain event an immutable record named for its aggregate and fact, carrying business data only? |
| standards/rule/backend-domain.reject-business-violations-with-domain-exceptions | guidance | Does each rejected rule throw its own DomainException type with a stable code and no transport status? |
| standards/rule/backend-domain.reference-other-aggregates-by-id | guidance | Does each aggregate store other aggregates as typed identifiers rather than object references? |
| standards/rule/backend-domain.pass-nondeterministic-values-into-domain | guidance | Does Domain receive time, randomness, and identifiers as arguments and read no clock? |
| standards/rule/backend-domain.document-every-public-domain-contract | guidance | Does every public Domain type and member document its constraint, result, or failure? |
| standards/rule/backend-domain.organize-a-module-by-aggregate-and-concept | guidance | Does each Domain module give each aggregate its plural folder with its own states, events, and concepts? |
| standards/rule/backend-domain.use-these-domain-names | guidance | Does each Domain name follow the cited workspace naming provisions and the chosen state-case form? |
| standards/rule/backend-domain.define-the-shared-domain-contracts-once | guidance | Is each shared Domain contract declared once, with DomainException declaring its abstract Code? |
| standards/rule/backend-domain.keep-id-representations-aligned-at-every-boundary | guidance | Is each identifier represented the same way at every boundary in the table? |
