# Domain Layer

## Intent

Domain holds the business model and protects aggregate invariants. It references no persistence, HTTP, messaging, logging, configuration, injection, serialization, or provider concept. Its names match the Terms its records use.

Every aggregate exposes its lifecycle as state types from its first implementation. A one-state hierarchy gives later states and state-specific facts a defined home. It avoids later replacement of an enumeration, status string, or flag-based lifecycle.

## Agent Summary {#agent-summary}

- Domain stays free of outer layers and uses one shared language. (litespec/rule/backend-domain.keep-domain-independent-of-outer-layers, litespec/rule/backend-domain.use-one-ubiquitous-language)
- Aggregates guard their invariants, hide children, and link peers by identity. (litespec/rule/backend-domain.treat-aggregates-as-consistency-boundaries, litespec/rule/backend-domain.keep-child-entities-inside-the-aggregate-boundary, litespec/rule/backend-domain.reference-other-aggregates-by-id)
- Roots use the shared contract, factories create valid aggregates, and methods express transitions. (litespec/rule/backend-domain.take-identity-and-events-from-the-project-root-contract, litespec/rule/backend-domain.create-valid-aggregates-through-named-factories, litespec/rule/backend-domain.express-transitions-through-business-methods)
- Lifecycles use state types and closed sets use hierarchies with stable codes. (litespec/rule/backend-domain.model-every-aggregate-lifecycle-with-state-types, litespec/rule/backend-domain.model-every-closed-set-of-domain-values-as-a-closed-type-hierarchy)
- Identities are typed version 7 values, nondeterminism arrives as arguments, and representations align. (litespec/rule/backend-domain.identify-aggregates-with-strongly-typed-version-7-values, litespec/rule/backend-domain.pass-nondeterministic-values-into-domain, litespec/rule/backend-domain.align-id-representations-at-every-boundary)
- Values stay immutable with explicit collection, money, and floating-point rules. (litespec/rule/backend-domain.use-immutable-value-objects-for-domain-concepts, litespec/rule/backend-domain.define-collection-value-semantics-explicitly, litespec/rule/backend-domain.model-money-with-exact-decimal-values, litespec/rule/backend-domain.keep-binary-floating-point-out-of-exact-quantities)
- Services stay stateless and repositories serve one aggregate with narrow interfaces. (litespec/rule/backend-domain.use-stateless-domain-services-for-ownerless-rules, litespec/rule/backend-domain.expose-repositories-for-one-aggregate-only)
- Events carry immutable facts and rejections use dedicated error types. (litespec/rule/backend-domain.raise-immutable-facts-as-domain-events, litespec/rule/backend-domain.reject-business-violations-with-dedicated-errors)
- Public contracts carry business documentation and modules follow naming and layout rules. (litespec/rule/backend-domain.describe-every-public-domain-contract-in-documentation, litespec/rule/backend-domain.organize-a-module-by-aggregate-and-concept, litespec/rule/backend-domain.use-these-domain-names)
- Shared contracts are declared once and reused across modules. (litespec/rule/backend-domain.reuse-the-shared-domain-contracts-across-modules)

## Standards

### Keep Domain independent of outer layers (litespec/rule/backend-domain.keep-domain-independent-of-outer-layers)

**Requirement:** The Domain code MUST reference only the language standard library and project-owned Domain types.

**Rationale:** No persistence, web, mediator, logging, configuration, injection, serialization, or provider package enters Domain. Infrastructure registers a persisted discriminator rather than Domain carrying a serialization attribute.

### Use one ubiquitous language (litespec/rule/backend-domain.use-one-ubiquitous-language)

**Requirement:** A Domain type, property, method, exception, or event name MUST match a Term record in the project language record.

**Rationale:** A business action named `Publish` in the language record is not `SetStatus` in code. The language record holds each Term meaning, labels per language, rejected words, and broader and narrower links. Records cite the Terms they use, and the glossary is generated from the language record.

### Treat aggregates as consistency boundaries (litespec/rule/backend-domain.treat-aggregates-as-consistency-boundaries)

**Requirement:** An aggregate root MUST be the only public mutation entry point for every invariant its transaction protects.

**Rationale:** External code sets no property and calls no child mutation method. A command normally changes one aggregate. The use-case record names any immediate invariant before one command changes several.

### Take identity and events from the project root contract (litespec/rule/backend-domain.take-identity-and-events-from-the-project-root-contract)

**Requirement:** An aggregate root MUST take its identity and event mechanics from the project-owned root contract.

**Rationale:** The contract owns typed identity, pending events, recording, and clearing. It owns no timestamp, audit, tenant, lifecycle, or persistence behavior.

### Model every aggregate lifecycle with state types (litespec/rule/backend-domain.model-every-aggregate-lifecycle-with-state-types)

**Requirement:** An aggregate MUST expose its lifecycle only through one state property backed by one closed hierarchy of per-state types.

**Rationale:** An enumeration, string discriminator, boolean flag, parallel nullable field, or computed state cannot carry state-specific data or prove exhaustiveness. State types hold that data, and aggregate methods own the transitions.

**Example:** A post defines one abstract post state with draft and published cases, where the published case carries its publication time. Even an aggregate with one current state defines its hierarchy.

### Model every closed set of domain values as a closed type hierarchy (litespec/rule/backend-domain.model-every-closed-set-of-domain-values-as-a-closed-type-hierarchy)

**Requirement:** Domain code MUST model a closed set as one type hierarchy whose cases the type system can enumerate.

**Rationale:** An enumeration carries no case data, admits undefined values, and forces parallel fields when a case gains data. A closed hierarchy lets the type system check exhaustiveness. A boundary converts a label to its case through a named lookup, never through a string conversion. An unrecognized label is a validation failure rather than a default case.

**Example:** A refund outcome defines pending, succeeded, failed, and reversed cases, where each case carries its own data.

This rule binds Domain code. The same set appears at three other layers, and each layer has exactly one permitted form:

| Layer | Form of a closed set | Owning provision |
|:---|:---|:---|
| Domain | Closed type hierarchy. | `litespec/rule/backend-domain.model-every-closed-set-of-domain-values-as-a-closed-type-hierarchy` |
| Application | The same union shape, mirrored. | `litespec/rule/backend-application.mirror-a-domain-closed-set-in-the-result` |
| Transport | Polymorphic `oneOf` model, or string `enum` for a label-only set. | `litespec/rule/backend-api.mirror-a-domain-closed-set-as-a-transport-model-of-the-same-shape` |
| Persistence | One stable string discriminator for each case. | `litespec/rule/backend-persistence.keep-serialization-behavior-out-of-domain` |

A transport `enum` is permitted in one situation: every case of the set carries no data, and the labels are the complete contract. A set where any case carries data crosses the boundary as a polymorphic model instead.

A transport enum never re-enters Domain. The Application layer converts the label to its type case before it calls a Domain method.

Round-trip tests cover every data-less case, which catches a renamed code and a missing label.

### Create valid aggregates through named factories (litespec/rule/backend-domain.create-valid-aggregates-through-named-factories)

**Requirement:** An aggregate root MUST create instances only through a static factory named for its business action.

**Rationale:** The factory accepts typed identifiers, rejects empty identity and violated creation rules, selects the initial state, records required events, and returns a complete aggregate.

A root created with its children composes them inside the same factory call. The children are built from typed values the caller supplies. A caller never hands in an already constructed child, because a caller holding that reference can mutate it after the invariant was checked.

**Example:** In the dotnet stack, the factory reads as follows:

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

### Express transitions through business methods (litespec/rule/backend-domain.express-transitions-through-business-methods)

**Requirement:** A public aggregate mutation method MUST check current state and protect its invariants, replacing state and recording its transition event when it moves the lifecycle.

**Rationale:** A handler then calls `post.Publish(utcNow)` without testing the state first. A generic `Set`, `Update`, `Process`, or `Handle` name hides which business action ran. A mutation that changes no lifecycle state, such as `ChangeTitle` on a draft, checks state and assigns without recording a transition.

Checks run before replacement, and replacement runs before recording. A method that replaces state before checking an invariant leaves a rejected aggregate holding the new state.

### Keep child entities inside the aggregate boundary (litespec/rule/backend-domain.keep-child-entities-inside-the-aggregate-boundary)

**Requirement:** A child entity MUST expose no mutable state outside its aggregate root, surfacing its collection as a read-only view.

**Rationale:** The root creates, finds, and changes children through business methods. A child with lifecycle states uses the same state types and no enumeration.

### Identify aggregates with strongly typed version 7 values (litespec/rule/backend-domain.identify-aggregates-with-strongly-typed-version-7-values)

**Requirement:** An aggregate identity MUST be a dedicated type wrapping one version 7 UUID, with no implicit conversion, primitive alias, or public parameterless creation path.

**Rationale:** It rejects the empty value, and each factory also rejects its default. New values arrive from the caller: a factory takes its identifier as an argument. A method that needs several identifiers takes a generator as an argument. Domain reads no clock and calls no static source of time or randomness.

Version 7 values come from the caller-supplied generator, so Domain observes no business time and decides nothing about clocks. Persistence rejects a duplicate key and the operation fails, which is the same path as any other write conflict.

**Example:** A post identifier wraps one version 7 UUID, rejects the empty value, and parses from text through a named method.

### Use immutable value objects for domain concepts (litespec/rule/backend-domain.use-immutable-value-objects-for-domain-concepts)

**Requirement:** A value object MUST be immutable, compare by its complete value, and expose creation through a static method rather than a constructor.

**Rationale:** It exposes no setter and no implicit conversion, because a primitive conversion hides validation and a value conversion erases the domain type. Reading uses `Value` or a string conversion. Creation through a named static method keeps every construction path under the validation the type declares.

**Example:** In the dotnet stack, the value object reads as follows:

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

### Define collection value semantics explicitly (litespec/rule/backend-domain.define-collection-value-semantics-explicitly)

**Requirement:** A value object containing a collection MUST implement content equality and a matching hash for its declared ordering rule.

**Rationale:** Default structural equality compares collection references, not contents. Constructors copy incoming mutable collections and members return read-only views. The module terms state whether order is part of the value.

**Example:** In the dotnet stack, the collection value reads as follows:

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

### Model money with exact decimal values (litespec/rule/backend-domain.model-money-with-exact-decimal-values)

**Requirement:** A monetary amount MUST use an exact decimal type inside one shared `Money` value object carrying an ISO 4217 currency code and serializing as `{ "amount": "12.50", "currency": "EUR" }`.

**Rationale:** The owning module record defines supported currencies, scale, rounding, sign rules, and cross-currency arithmetic. Infrastructure maps that precision explicitly. A use case fixed to one currency accepts an amount alone and states that currency in its record.

**Example:**

```json
{ "amount": "12.50", "currency": "EUR" }
```

The amount serializes as a string, so no reader parses it as binary floating point.

### Keep binary floating point out of exact quantities (litespec/rule/backend-domain.keep-binary-floating-point-out-of-exact-quantities)

**Requirement:** A Domain type MUST NOT use `double` or `float` for a monetary amount, a rate applied to one, or a quantity compared for exact equality.

**Rationale:** Binary floating point cannot represent most decimal fractions, so two amounts that a person reads as equal compare as different.

**Example:** A tax rate multiplied into a `Money` amount uses an exact decimal type. A measured latency in a diagnostic record is not a domain quantity and is outside this rule.

### Use stateless domain services for ownerless rules (litespec/rule/backend-domain.use-stateless-domain-services-for-ownerless-rules)

**Requirement:** A domain service MUST be stateless, accept and return Domain values, and perform no persistence, messaging, logging, clock, authorization, or provider call.

**Rationale:** It exists only when a calculation spans concepts with no natural aggregate owner. Application loads the aggregates, calls the service, and passes its result into aggregate behavior.

A domain service is stateless and takes no port, so its tests are Domain tests. They sit beside the aggregate tests in the Domain test project, with no harness, no substitute, and no fixture.

**Example:** In the dotnet stack, the service reads as follows:

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

### Expose repositories for one aggregate only (litespec/rule/backend-domain.expose-repositories-for-one-aggregate-only)

**Requirement:** A repository interface MUST expose only aggregate and Domain types for exactly one aggregate root, without a queryable, a session, or a generic CRUD surface.

**Rationale:** A required load uses a get-by-identity operation and fails with `{Aggregate}NotFound`, so a handler repeats no null check. A nullable find operation is reserved for lookups where absence is normal.

This interface is the write side only. Reading for a Query uses a Read Model owned by Application and shaped by Infrastructure, and that path declares no Domain interface. A repository that gained a projection method would put query shapes in Domain, which is the coupling this layer exists to prevent.

**Example:** A post repository exposes a get-by-identity load that returns a post and fails with its not-found error, plus a store operation that stages the aggregate.

The load returns a post and fails with its not-found error when the identity has no aggregate. The Infrastructure implementation owns that failure. The command pipeline owns the commit. The store operation stages the aggregate through the selected provider.

### Raise immutable facts as domain events (litespec/rule/backend-domain.raise-immutable-facts-as-domain-events)

**Requirement:** A domain event MUST be an immutable event named `{Aggregate}{PastFact}Event` and carrying business data only.

**Rationale:** The name states which aggregate raised the fact without opening the file. The event carries no aggregate, session, service, mutable collection, or exception. Envelope identity, such as message identity and causation identity, lives on the published integration event that carries the fact outside the process. Business data means typed identifiers and the values its reactions need.

### Reject business violations with dedicated errors (litespec/rule/backend-domain.reject-business-violations-with-dedicated-errors)

**Requirement:** A rejected business rule MUST fail with a dedicated error type named `{DomainType}{Reason}` carrying a stable code.

**Rationale:** The name always leads with the aggregate root. Domain raises no standard library, validation, HTTP, or provider error for a business rejection, and carries no transport status. Error names follow `litespec/rule/workspace-naming.name-exceptions-by-failed-rule`; this provision owns the one-type-per-rule shape and the code each type carries.

**Example:** A refund allocation rule fails with its own error type, rather than one shared error with a code passed at the call site.

Two rules that share a caller-visible failure code because a boundary maps them to one response still get two error types. The shared code lives in the two types, not in a string passed by the aggregate. Reuse a single error type only when one rule can fail from more than one input and the differing values are carried as creation parameters.

Application validators handle malformed caller input through validation errors. Aggregate and value-object errors remain the last defense when direct Domain use violates a rule. Command handlers do not catch expected Domain errors. The host maps them through the documented error boundary.

### Reference other aggregates by ID (litespec/rule/backend-domain.reference-other-aggregates-by-id)

**Requirement:** An aggregate MUST store another aggregate's typed identifier rather than an object reference.

**Rationale:** Application loads each aggregate through its repository when a command coordinates several. The use-case record names any immediate cross-aggregate invariant.

### Pass nondeterministic values into Domain (litespec/rule/backend-domain.pass-nondeterministic-values-into-domain)

**Requirement:** Domain behavior MUST receive time, randomness, and new identifiers as arguments rather than read them, and read no clock.

**Rationale:** Application obtains each value through an owned port and passes it in, so a Domain test supplies an explicit value and stays deterministic. A method that needs more than one value receives a clock or a generator through its arguments. Version 7 identifiers come from the caller-supplied generator.

### Describe every public Domain contract in documentation (litespec/rule/backend-domain.describe-every-public-domain-contract-in-documentation)

**Requirement:** Every public Domain type and member MUST carry documentation stating the business constraint, result, or failure it represents.

**Rationale:** A summary that restates the member name adds nothing. A mutation method names its source states, resulting state, protected invariant, and recorded event.

## Conventions

*Read each code block in the Conventions section as the named design rule only, without its namespace and unrelated declarations.*

### Organize a module by aggregate and concept (litespec/rule/backend-domain.organize-a-module-by-aggregate-and-concept)

**Default:** Give each aggregate a folder named with its plural root name, holding its own states, events, exceptions, and concepts.

**Replacement:** A consumer records a departure as an Exception record naming this provision, with reason and review date.

**Rationale:** A single aggregate stays flat only when its plural root name equals the module name. Separate aggregates never share lifecycle, event, or rejection folders.

**Example:** In the dotnet stack, the module reads as follows:

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

Each aggregate-specific repository interface stays with the aggregate it loads. Application, Infrastructure, and WebApi use the same module and per-aggregate folder names, per `litespec/rule/backend-architecture.organize-every-layer-by-module-and-use-case`.

### Use these Domain names (litespec/rule/backend-domain.use-these-domain-names)

**Default:** Name each Domain type from the aggregate root it belongs to, following the workspace naming provisions cited below.

**Replacement:** A consumer records a departure as an Exception record naming this provision, with reason and review date.

**Rationale:** Aggregate-owned names follow `litespec/rule/workspace-naming.anchor-aggregate-owned-types-on-the-aggregate-root`. Architectural suffixes follow `litespec/rule/workspace-naming.use-architectural-suffixes`. Exception names follow `litespec/rule/workspace-naming.name-exceptions-by-failed-rule`. A state case takes the flat or the nested form, and a project keeps the form it picks.

**Example:**

The flat form declares each case as a top-level record carrying the aggregate prefix. The nested form declares each case inside its `{Aggregate}State` base, which already carries that prefix. `PostState.Published` therefore reads as its full name at every call site. A nested case never repeats the prefix its parent supplies.

The nested form keeps the cases and the base in one file. The flat form keeps one type per file.

### Reuse the shared Domain contracts across modules (litespec/rule/backend-domain.reuse-the-shared-domain-contracts-across-modules)

**Default:** Declare the shared Domain contracts once in Domain code and reuse them across every module.

**Replacement:** A consumer records a departure as an Exception record naming this provision, with reason and review date.

**Example:** The shared contracts are the aggregate root, the domain event, the strongly typed identity, and the domain error.

Event clearing is delivery mechanics, not a business mutation. Infrastructure calls it only after delivery accepts the pending events.

### Align ID representations at every boundary (litespec/rule/backend-domain.align-id-representations-at-every-boundary)

**Default:** Represent an identifier the same way in Domain, persistence, transport, and generated clients.

**Replacement:** A consumer records a departure as an Exception record naming this provision, with reason and review date.

**Example:**

| Boundary | Representation | Owner |
|:---|:---|:---|
| Creation | Caller-supplied value or generator through arguments. | Caller |
| Domain and Application | Typed identifier. | Domain |
| API route and query | Text parsed through the identifier parser. | API |
| JSON | UUID string. | API converter |
| OpenAPI | `type: string`, `format: uuid`. | API schema |
| Persistence | Native UUID identity plus explicit typed mapping. | Infrastructure |
| Generated client | `string` from OpenAPI. | Generated client |

For multiple identifiers, the API uses one converter factory restricted to strongly typed identities. The schema transformer applies the same restriction.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/rule/backend-domain.keep-domain-independent-of-outer-layers | guidance | Does Domain code reference only the standard library and project-owned Domain types? |
| litespec/rule/backend-domain.use-one-ubiquitous-language | guidance | Does each Domain name match a Term record in the project language record? |
| litespec/rule/backend-domain.treat-aggregates-as-consistency-boundaries | guidance | Is each aggregate root the only public mutation path for the invariants its transaction protects? |
| litespec/rule/backend-domain.take-identity-and-events-from-the-project-root-contract | guidance | Does each aggregate root inherit the one base type that supplies its identifier and its pending events? |
| litespec/rule/backend-domain.model-every-aggregate-lifecycle-with-state-types | guidance | Does each aggregate expose one state property over a closed hierarchy of state types? |
| litespec/rule/backend-domain.model-every-closed-set-of-domain-values-as-a-closed-type-hierarchy | guidance | Is each closed set a type hierarchy with stable codes and a named label lookup? |
| litespec/rule/backend-domain.create-valid-aggregates-through-named-factories | guidance | Does each aggregate root create instances only through a named static factory that checks identity and records events? |
| litespec/rule/backend-domain.express-transitions-through-business-methods | guidance | Does each mutation check state, and does each lifecycle move also replace state and record its event? |
| litespec/rule/backend-domain.keep-child-entities-inside-the-aggregate-boundary | guidance | Do children expose no mutable state outside their root, with collections surfaced as read-only views? |
| litespec/rule/backend-domain.identify-aggregates-with-strongly-typed-version-7-values | guidance | Is each identity a dedicated type over a version 7 UUID with no conversion, alias, or parameterless creation? |
| litespec/rule/backend-domain.use-immutable-value-objects-for-domain-concepts | guidance | Is each value object immutable, compared by complete value, and created through a static method? |
| litespec/rule/backend-domain.define-collection-value-semantics-explicitly | guidance | Does each collection value implement content equality and a matching hash under its ordering rule? |
| litespec/rule/backend-domain.model-money-with-exact-decimal-values | guidance | Is each monetary amount an exact decimal in the shared Money object with the stated JSON shape? |
| litespec/rule/backend-domain.keep-binary-floating-point-out-of-exact-quantities | guidance | Does no Domain member use double or float for money, a rate applied to money, or an exactly compared quantity? |
| litespec/rule/backend-domain.use-stateless-domain-services-for-ownerless-rules | guidance | Is each domain service stateless, confined to Domain values, and free of the banned calls? |
| litespec/rule/backend-domain.expose-repositories-for-one-aggregate-only | guidance | Does each repository serve one aggregate with Domain-only types and no queryable, session, or generic surface? |
| litespec/rule/backend-domain.raise-immutable-facts-as-domain-events | guidance | Is each domain event an immutable event named for its aggregate and fact, carrying business data only? |
| litespec/rule/backend-domain.reject-business-violations-with-dedicated-errors | guidance | Does each rejected rule fail with its own error type carrying a stable code and no transport status? |
| litespec/rule/backend-domain.reference-other-aggregates-by-id | guidance | Does each aggregate store other aggregates as typed identifiers rather than object references? |
| litespec/rule/backend-domain.pass-nondeterministic-values-into-domain | guidance | Does Domain receive time, randomness, and identifiers as arguments and read no clock? |
| litespec/rule/backend-domain.describe-every-public-domain-contract-in-documentation | guidance | Does every public Domain type and member document its constraint, result, or failure? |
| litespec/rule/backend-domain.organize-a-module-by-aggregate-and-concept | guidance | Does each Domain module give each aggregate its plural folder with its own states, events, and concepts? |
| litespec/rule/backend-domain.use-these-domain-names | guidance | Does each Domain name follow the cited workspace naming provisions and the chosen state-case form? |
| litespec/rule/backend-domain.reuse-the-shared-domain-contracts-across-modules | guidance | Is each shared Domain contract declared once and reused across modules? |
| litespec/rule/backend-domain.align-id-representations-at-every-boundary | guidance | Is each identifier represented the same way at every boundary in the table? |
