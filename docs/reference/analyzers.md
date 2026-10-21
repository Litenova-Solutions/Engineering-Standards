# Analyzer Rules

## Intent

When you get an `LS` diagnostic from the `LiteSpec.Analyzers` package, this page tells you exactly what the rule checks, why the standard requires it, and how you fix the code. When you review a finding, this page tells you what the rule ignores, so you can decide whether the finding is a false positive.

Each rule section names the provision the rule enforces, the layers where the rule runs, where the diagnostic appears in your code, what the rule does not report, and a breach example beside a compliant example. Both examples come from the analyzer tests. The summary table lists all 20 rules with their IDs, layers, categories, and provisions.

## Reference

### How a rule decides to run

Every rule inherits the same gating from `LayerAnalyzer`. You can predict whether a rule runs in your project from three facts.

The analyzers read your project layer from the `LiteSpecLayer` MSBuild property when you set it, and from the assembly name suffix otherwise. The suffixes are `Shop.Domain` for Domain, `Shop.Application.Abstractions` for ApplicationAbstractions, `Shop.Application` for Application, `Shop.Infrastructure` for Infrastructure, and `Shop.WebApi` for WebApi. Any other assembly name, and an explicit `LiteSpecLayer` value of `None`, opts the project out, and no rule runs there. The `LiteSpecLayer` property wins over the assembly name when both exist.

A rule registers only in the layers its provision covers. Domain rules run in Domain, layer rules run in Application, Infrastructure, or WebApi as stated, and style rules run in all five projects. The analyzers skip generated code. Rules LS1003, LS1004, and LS3004 decide at the end of compilation, after every type is known; every other rule decides as the compiler reads each declaration.

Each diagnostic carries a help link of the form `https://litespec.dev/2.0.0/<page>/#<slug>`, which opens the provision the rule enforces.

### Rule summary

| ID | Layer | Category | What it reports | Provision |
|:---|:---|:---|:---|:---|
| LS1001 | Domain | `LiteSpec.Domain` | An outer-layer namespace use | `litespec/backend/dotnet/domain#keep-domain-free-of-outer-layer-concerns` |
| LS1002 | Domain | `LiteSpec.Domain` | An enum declaration | `litespec/backend/dotnet/domain#model-every-closed-set-of-domain-values-without-enums` |
| LS1003 | Domain | `LiteSpec.Domain` | An aggregate with no `State` record | `litespec/backend/dotnet/domain#model-every-aggregate-lifecycle-with-state-records` |
| LS1004 | Domain | `LiteSpec.Domain` | A state case that is not sealed | `litespec/backend/dotnet/domain#model-every-aggregate-lifecycle-with-state-records` |
| LS1005 | Domain | `LiteSpec.Domain` | A throw of a non-`DomainException` type | `litespec/backend/dotnet/domain#reject-business-violations-with-domain-exceptions` |
| LS1006 | Domain | `LiteSpec.Domain` | A `DomainException` subclass that is misnamed or open | `litespec/backend/dotnet/domain#reject-business-violations-with-domain-exceptions` |
| LS1007 | Domain | `LiteSpec.Domain` | A domain event that is not an immutable record | `litespec/backend/dotnet/domain#raise-immutable-domain-facts` |
| LS1008 | Domain | `LiteSpec.Domain` | A `double` or `float` use | `litespec/backend/domain#keep-binary-floating-point-out-of-exact-quantities` |
| LS1009 | Domain | `LiteSpec.Domain` | A read of the clock, randomness, or a new identifier | `litespec/backend/domain#pass-nondeterministic-values-into-domain` |
| LS1010 | Domain | `LiteSpec.Domain` | A repository that exposes a query surface | `litespec/backend/dotnet/domain#keep-repository-interfaces-in-domain` |
| LS1011 | Domain | `LiteSpec.Domain` | A public contract without XML documentation | `litespec/backend/dotnet/domain#document-every-public-domain-contract` |
| LS1012 | Domain | `LiteSpec.Domain` | An identifier that is not a strongly typed value | `litespec/backend/dotnet/domain#use-strongly-typed-version-7-identifiers` |
| LS2001 | Application, Infrastructure, WebApi | `LiteSpec.Layers` | An implementation type that is not `internal sealed` | `litespec/backend/dotnet/architecture#keep-implementation-types-internal` |
| LS2002 | Application, Infrastructure | `LiteSpec.Layers` | A command handler that dispatches another command | `litespec/backend/dotnet/application#keep-one-state-changing-use-case-in-one-command-pipeline` |
| LS2003 | WebApi | `LiteSpec.Layers` | An MVC controller | `litespec/backend/dotnet/api#exclude-mvc-controllers-from-the-stack` |
| LS2004 | Application, Infrastructure | `LiteSpec.Layers` | A command handler that writes through a session | `litespec/backend/dotnet/persistence#stage-aggregate-writes-through-repositories` |
| LS3001 | All five projects | `LiteSpec.Style` | An async method name without `Async` | `litespec/backend/dotnet/naming#name-asynchronous-methods-completely` |
| LS3002 | All five projects | `LiteSpec.Style` | A `CancellationToken` that is misplaced or misnamed | `litespec/backend/dotnet/naming#name-asynchronous-methods-completely` |
| LS3003 | All five projects | `LiteSpec.Style` | A file that does not match its primary type | `litespec/backend/dotnet/naming#match-c-files-and-primary-types` |
| LS3004 | All five projects | `LiteSpec.Style` | A concrete leaf class that is not sealed | `litespec/backend/dotnet/naming#keep-implementation-style-consistent` |

### LS1001: Domain references an outer-layer concern

Enforces [Keep Domain free of outer-layer concerns](../backend/dotnet/domain.md#keep-domain-free-of-outer-layer-concerns) (`litespec/backend/dotnet/domain#keep-domain-free-of-outer-layer-concerns`). Runs in `Domain`.

Reports every identifier or `using` name that resolves to one of the 19 outer-layer namespace prefixes listed under Notes. The diagnostic sits on the identifier in code, or on the name in a `using` directive, and its message names the type and the namespace it comes from.

Does not report project types or base class library types such as `System`, `System.Collections.Generic`, or `System.Linq`. Does not report `var`, documentation comments, or a namespace that only shares a prefix, such as `MartenStore`. In a member access such as `session.Store(session)`, the rule reports the member name rather than the qualifier. Does not run outside `Domain`.

Breach:

```csharp
using Microsoft.Extensions.Logging;

namespace Shop.Orders;

public sealed class Order
{
}
```

Compliant:

```csharp
using System;
using System.Collections.Generic;

namespace Shop.Orders;

public sealed class Order
{
    public List<string> Tags { get; } = new();

    public DateTime PlacedAt { get; init; }
}
```

To fix it, move the outer-layer use out of Domain: depend on a Domain type or a base class library type instead, and let Application or Infrastructure adapt the outer-layer service.

### LS1002: Domain declares an enum

Enforces [Model every closed set of domain values without enums](../backend/dotnet/domain.md#model-every-closed-set-of-domain-values-without-enums) (`litespec/backend/dotnet/domain#model-every-closed-set-of-domain-values-without-enums`). Runs in `Domain`.

Reports the name of any enum declared in Domain. The diagnostic sits on the enum name.

Does not report record hierarchies, and does not run outside `Domain`.

Breach:

```csharp
namespace Shop.Orders;

public enum OrderStatus { Draft, Placed }
```

Compliant:

```csharp
namespace Shop.Orders;

public abstract record OrderStatus(string Code);

public sealed record Draft() : OrderStatus("draft");
```

To fix it, replace the enum with an abstract record base and one sealed record per case, exposing a stable `Code` and converting labels through `FromCode`.

### LS1003: Aggregate has no State record

Enforces [Model every aggregate lifecycle with state records](../backend/dotnet/domain.md#model-every-aggregate-lifecycle-with-state-records) (`litespec/backend/dotnet/domain#model-every-aggregate-lifecycle-with-state-records`). Runs in `Domain`.

Reports an aggregate class, recognized by a base class named `AggregateRoot` with one type argument, that exposes no `State` property typed as an abstract record. The rule walks the inheritance chain until the `AggregateRoot` base, so an inherited `State` property counts. The diagnostic sits on the aggregate name.

Does not report classes that are not aggregates, aggregates whose `State` property is an abstract record, or anything outside `Domain`.

Breach:

```csharp
public sealed class Order : AggregateRoot<OrderId>
{
    public Order(OrderId id) : base(id) { }
}
```

Compliant:

```csharp
public sealed class Order : AggregateRoot<OrderId>
{
    public Order(OrderId id, OrderState state) : base(id) { State = state; }
    public OrderState State { get; }
}

public abstract record OrderState;

public sealed record OrderDraftState : OrderState;

public sealed record OrderPlacedState(DateTimeOffset PlacedAt) : OrderState;
```

To fix it, add a `State` property typed as an abstract `{Aggregate}State` record and derive one sealed record per lifecycle state from it.

### LS1004: State case is not sealed

Enforces [Model every aggregate lifecycle with state records](../backend/dotnet/domain.md#model-every-aggregate-lifecycle-with-state-records) (`litespec/backend/dotnet/domain#model-every-aggregate-lifecycle-with-state-records`). Runs in `Domain`.

Reports a non-abstract, non-sealed class that derives directly from a recognized state base, which is an abstract record whose name ends in `State` and either matches `{Aggregate}State` or is an aggregate `State` property type. The diagnostic sits on the case name.

Does not report sealed cases or abstract intermediate cases, and does not run outside `Domain`.

Breach:

```csharp
public abstract record OrderState;

public record OrderDraftState : OrderState;
```

Compliant:

```csharp
public abstract record OrderState;

public abstract record OrderOpenState : OrderState;

public sealed record OrderDraftState : OrderOpenState;
```

To fix it, mark the case `sealed`, or mark it `abstract` when it is a genuine intermediate with its own sealed cases.

### LS1005: Domain throws a non-Domain exception

Enforces [Reject business violations with Domain exceptions](../backend/dotnet/domain.md#reject-business-violations-with-domain-exceptions) (`litespec/backend/dotnet/domain#reject-business-violations-with-domain-exceptions`). Runs in `Domain`.

Reports a `throw` of any exception that is not a `DomainException` subclass. The diagnostic sits on the thrown expression, for example on `new InvalidOperationException()`, and its message names the thrown type.

Does not report a throw of a `DomainException` subclass, an argument guard that throws `ArgumentException` or one of its subclasses, a throw of `UnreachableException`, a bare `throw;`, or a throw of a caught variable. Does not run outside `Domain`.

Breach:

```csharp
public void Place()
{
    throw new InvalidOperationException();
}
```

Compliant:

```csharp
public void Place(bool placed)
{
    if (placed)
    {
        throw new OrderAlreadyPlacedException();
    }
}
```

To fix it, throw a `DomainException` subclass named `{DomainType}{Reason}Exception` for the rejected business rule, and keep `ArgumentException` for argument guards.

### LS1006: Domain exception is misnamed or open

Enforces [Reject business violations with Domain exceptions](../backend/dotnet/domain.md#reject-business-violations-with-domain-exceptions) (`litespec/backend/dotnet/domain#reject-business-violations-with-domain-exceptions`). Runs in `Domain`.

Reports a non-abstract `DomainException` subclass, direct or indirect, that is not sealed or whose name does not end in `Exception`. One type gets one diagnostic even when both checks fail. The diagnostic sits on the exception name.

Does not report abstract intermediate exception bases or sealed leaves named `{DomainType}{Reason}Exception`, and does not run outside `Domain`.

Breach:

```csharp
public class OrderRuleFailure : DomainException
{
    public OrderRuleFailure() : base("Broken.") { }
}
```

Compliant:

```csharp
public abstract class OrderException(string message) : DomainException(message);

public sealed class OrderAlreadyPlacedException() : OrderException("The order is already placed.");
```

To fix it, mark the leaf exception `sealed` and name it `{DomainType}{Reason}Exception`, keeping shared behavior in an abstract intermediate base.

### LS1007: Domain event is not an immutable record

Enforces [Raise immutable domain facts](../backend/dotnet/domain.md#raise-immutable-domain-facts) (`litespec/backend/dotnet/domain#raise-immutable-domain-facts`). Runs in `Domain`.

Reports any type that implements an interface named `IDomainEvent` unless it is a record class whose name ends in `Event`, with no settable properties and no mutable instance fields. The diagnostic sits on the type name, and one type gets one diagnostic even when several checks fail.

Does not report interfaces that merely extend `IDomainEvent`, event records with only `init` setters, `readonly` fields, `static` fields, or constants, and does not run outside `Domain`.

Breach:

```csharp
public sealed record OrderPlacedEvent : IDomainEvent
{
    public string Note { get; set; } = string.Empty;
}
```

Compliant:

```csharp
public sealed record OrderPlacedEvent(OrderId OrderId) : IDomainEvent;
```

To fix it, make the event a record class named `{Aggregate}{PastFact}Event` that implements `IDomainEvent`, carries business data only, and exposes its members through `init` setters or readonly fields.

### LS1008: Domain uses binary floating point

Enforces [Keep binary floating point out of exact quantities](../backend/domain.md#keep-binary-floating-point-out-of-exact-quantities) (`litespec/backend/domain#keep-binary-floating-point-out-of-exact-quantities`). Runs in `Domain`.

Reports each `double` or `float` type in a field, property, indexer, method return, local function return, delegate, operator, parameter, `foreach` variable, declaration expression, or declaration pattern, including nested uses such as `List<double>`, `double?`, tuples, and lambda parameters. The diagnostic sits on the floating point type, and its message names the member and the type text.

Does not report `decimal`, `var`, or any floating point use outside `Domain`.

Breach:

```csharp
public sealed class Pricer
{
    public double Total(double rate) => rate;
}
```

Compliant:

```csharp
public sealed class Pricer
{
    private decimal _total;

    public decimal Total(decimal rate) => rate;
}
```

To fix it, use `decimal` or a value object for monetary amounts, rates applied to them, and quantities compared for exact equality.

### LS1009: Domain reads a nondeterministic value

Enforces [Pass nondeterministic values into Domain](../backend/domain.md#pass-nondeterministic-values-into-domain) (`litespec/backend/domain#pass-nondeterministic-values-into-domain`). Runs in `Domain`.

Reports reads of `DateTime.Now`, `DateTime.UtcNow`, `DateTime.Today`, `DateTimeOffset.Now`, `DateTimeOffset.UtcNow`, `TimeProvider.System`, `Environment.TickCount`, `Environment.TickCount64`, `Random.Shared`, `Guid.NewGuid`, `Guid.CreateVersion7`, `Stopwatch.GetTimestamp`, `Stopwatch.StartNew`, any `RandomNumberGenerator` call, and `new Random()`. The diagnostic sits on the member name, on the invoked method name, or on the type in `new Random()`.

Does not report values passed in as arguments, deterministic members such as `DateTime.MinValue`, `Guid.Empty`, or `Guid.Parse`, instance calls on an injected clock such as `clock.GetUtcNow()`, or names inside `nameof`. Does not run outside `Domain`.

Breach:

```csharp
public DateTime Stamp()
{
    return DateTime.UtcNow;
}
```

Compliant:

```csharp
public DateTime Stamp(DateTime utcNow)
{
    return utcNow;
}
```

To fix it, pass time, randomness, and new identifiers in as arguments from the caller, and create version 7 identifiers with `Guid.CreateVersion7` outside Domain or in the calling layer.

### LS1010: Repository exposes a query surface

Enforces [Keep repository interfaces in Domain](../backend/dotnet/domain.md#keep-repository-interfaces-in-domain) (`litespec/backend/dotnet/domain#keep-repository-interfaces-in-domain`). Runs in `Domain`.

Reports an interface whose name ends in `Repository` when it is generic over a type parameter its members use, or when a member exposes `IQueryable`, a type derived from it, a member type whose name ends in `Session`, `DbContext`, or `DbSet`, or an `Expression<Func<...>>` parameter. The diagnostic sits on the interface name for a generic surface, and on the offending member type otherwise.

Does not report interfaces whose names do not end in `Repository`, members that return aggregates and Domain types such as `Task<Order?> FindAsync(OrderId id, CancellationToken cancellationToken)`, and does not run outside `Domain`.

Breach:

```csharp
public interface IOrderRepository
{
    IQueryable<Order> Query();
}
```

Compliant:

```csharp
public interface IOrderRepository
{
    Task<Order?> FindAsync(OrderId id, CancellationToken cancellationToken);
}
```

To fix it, return aggregates and Domain types only from the repository, and move query composition to a query handler that reads through `IQuerySession`.

### LS1011: Public Domain contract is undocumented

Enforces [Document every public Domain contract](../backend/dotnet/domain.md#document-every-public-domain-contract) (`litespec/backend/dotnet/domain#document-every-public-domain-contract`). Runs in `Domain`.

Reports a public type or member without XML documentation. The rule checks classes, structs, interfaces, records, enums, delegates, ordinary methods, constructors, properties, events, and fields, and it accepts a non-empty `<summary>` element or an `<inheritdoc/>` element, including `///` lines in a build without a documentation file. The diagnostic sits on the identifier.

Does not report internal, private, or nested non-public contracts, overrides, explicit interface implementations, or anything outside `Domain`. Protected members of public types do need documentation.

Breach:

```csharp
/// <summary>An order placed by a customer.</summary>
public sealed class Order
{
    public void Cancel()
    {
    }
}
```

Compliant:

```csharp
/// <summary>An order placed by a customer.</summary>
public sealed class Order
{
    /// <summary>Cancels the order before it ships.</summary>
    public void Cancel()
    {
    }
}
```

To fix it, add a `<summary>` line that states the business constraint, result, or failure the member represents, or an `<inheritdoc/>` line when the contract inherits its documentation.

### LS1012: Identifier is not a strongly typed value

Enforces [Use strongly typed version 7 identifiers](../backend/dotnet/domain.md#use-strongly-typed-version-7-identifiers) (`litespec/backend/dotnet/domain#use-strongly-typed-version-7-identifiers`). Runs in `Domain`.

Reports a struct whose name ends in `Id` unless it is a `readonly record struct` that wraps exactly one `Guid` field and declares no implicit conversion. The rule also reports `AggregateRoot<Guid>`, where the raw `Guid` is used directly as the identity, and a malformed identity type used as the `AggregateRoot` type argument. The diagnostic sits on the identifier, or on the base type in `AggregateRoot<Guid>`.

Does not report well-formed identifiers, explicit conversions, or anything outside `Domain`.

Breach:

```csharp
public record struct OrderId(Guid Value);
```

Compliant:

```csharp
public readonly record struct OrderId(Guid Value);
```

To fix it, declare the identifier as a `readonly record struct` that wraps one `Guid` with no implicit conversion, use it as the `AggregateRoot` type argument, and pass version 7 values in from the caller.

### LS2001: Implementation type is not internal sealed

Enforces [Keep implementation types internal](../backend/dotnet/architecture.md#keep-implementation-types-internal) (`litespec/backend/dotnet/architecture#keep-implementation-types-internal`). Runs in `Application`, `Infrastructure`, and `WebApi`.

Reports a class whose name ends in `Handler`, `PreHandler`, `PostHandler`, `Validator`, `Endpoint`, `Definition`, `Repository`, `Configuration`, or `Projection`, or that implements `IEndpoint`, `ICommandHandler`, `IQueryHandler`, `IEventHandler`, or `IValidator`, unless the class is both sealed and non-public. The diagnostic sits on the type name.

Does not report abstract classes, classes without an implementation name such as `OrderService`, or anything in `Domain` or `Application.Abstractions`.

Breach:

```csharp
namespace Shop.Orders;

public sealed class PlaceOrderCommandHandler { }
```

Compliant:

```csharp
namespace Shop.Orders;

internal sealed class PlaceOrderCommandHandler { }
```

To fix it, declare the implementation type `internal sealed`.

### LS2002: Command handler dispatches another command

Enforces [Keep one state-changing use case in one command pipeline](../backend/dotnet/application.md#keep-one-state-changing-use-case-in-one-command-pipeline) (`litespec/backend/dotnet/application#keep-one-state-changing-use-case-in-one-command-pipeline`). Runs in `Application` and `Infrastructure`.

Reports a call through `ICommandMediator` inside a command handler, which is a class whose name ends in `CommandHandler` or that implements `ICommandHandler`. The diagnostic sits on the invoked method name.

Does not report calls to repositories or other collaborators, handlers that never touch the mediator, or anything in `Domain`, `Application.Abstractions`, or `WebApi`.

Breach:

```csharp
internal sealed class PlaceOrderCommandHandler(ICommandMediator mediator)
{
    public Task HandleAsync(PlaceOrderCommand command, CancellationToken cancellationToken) =>
        mediator.SendAsync(command, cancellationToken);
}
```

Compliant:

```csharp
internal sealed class PlaceOrderCommandHandler(IOrderRepository orders)
{
    public void Handle(PlaceOrderCommand command) => orders.Store(command);
}
```

To fix it, keep the whole state change in the one handler: call the repository and domain behavior directly instead of dispatching a nested command.

### LS2003: WebApi uses an MVC controller

Enforces [Exclude MVC controllers from the stack](../backend/dotnet/api.md#exclude-mvc-controllers-from-the-stack) (`litespec/backend/dotnet/api#exclude-mvc-controllers-from-the-stack`). Runs in `WebApi`.

Reports a class that derives from `ControllerBase` or `Controller`, directly or through an intermediate base, or that carries the `ApiController` attribute. A class that does both gets one diagnostic. The diagnostic sits on the class name.

Does not report endpoint classes, and does not run outside `WebApi`.

Breach:

```csharp
public sealed class OrdersController : ControllerBase { }
```

Compliant:

```csharp
internal sealed class GetOrderEndpoint : IEndpoint
{
    public void Map() { }
}
```

To fix it, map one `IEndpoint` per operation instead of routing through a controller.

### LS2004: Command handler writes through a document session

Enforces [Stage aggregate writes through repositories](../backend/dotnet/persistence.md#stage-aggregate-writes-through-repositories) (`litespec/backend/dotnet/persistence#stage-aggregate-writes-through-repositories`). Runs in `Application` and `Infrastructure`.

Reports a command handler, recognized as for LS2002, that holds `IDocumentSession`, `DbContext`, or a `DbContext` subclass in a field, property, constructor parameter, or local, or that calls a member through such a receiver. The diagnostic sits on the type in a declaration, or on the invoked member name in a call.

Does not report handlers that reach persistence only through a Domain repository, query handlers, or anything in `Domain`, `Application.Abstractions`, or `WebApi`.

Breach:

```csharp
internal sealed class PlaceOrderCommandHandler
{
    private readonly IDocumentSession _session = null!;
}
```

Compliant:

```csharp
internal sealed class PlaceOrderCommandHandler(IOrderRepository orders)
{
    public void Handle(PlaceOrderCommand command) => orders.Store(command);
}
```

To fix it, reach persistence only through a Domain repository that the handler takes as a constructor parameter.

### LS3001: Asynchronous method name lacks Async

Enforces [Name asynchronous methods completely](../backend/dotnet/naming.md#name-asynchronous-methods-completely) (`litespec/backend/dotnet/naming#name-asynchronous-methods-completely`). Runs in all five projects.

Reports a method or local function that returns `Task` or `ValueTask`, including the generic forms, whose name does not end in `Async`. The diagnostic sits on the method name and its message names the return type.

Does not report overrides, explicit interface implementations, implementations of members from outside interfaces such as framework contracts, the static `Main` entry point, or lambdas. Does not run outside the five projects.

Breach:

```csharp
public Task Place() => Task.CompletedTask;
```

Compliant:

```csharp
public Task PlaceAsync(CancellationToken cancellationToken) => Task.CompletedTask;
```

To fix it, end the method name in `Async`.

### LS3002: CancellationToken is not the last parameter

Enforces [Name asynchronous methods completely](../backend/dotnet/naming.md#name-asynchronous-methods-completely) (`litespec/backend/dotnet/naming#name-asynchronous-methods-completely`). Runs in all five projects.

Reports a `CancellationToken` parameter that is not the last parameter, or that is not named exactly `cancellationToken`. The token may sit second to last when the last parameter is a `params` array. The diagnostic sits on the token parameter.

Does not report methods without a token, overrides, explicit interface implementations, or implementations of members from outside interfaces. Does not run outside the five projects.

Breach:

```csharp
public Task LoadAsync(CancellationToken cancellationToken, string name) => Task.CompletedTask;
```

Compliant:

```csharp
public Task SaveAsync(CancellationToken cancellationToken, params string[] names) => Task.CompletedTask;
```

To fix it, move the token to the last position, or before a trailing `params` array, and name it `cancellationToken`.

### LS3003: File does not match its primary type

Enforces [Match C# files and primary types](../backend/dotnet/naming.md#match-c-files-and-primary-types) (`litespec/backend/dotnet/naming#match-c-files-and-primary-types`). Runs in all five projects.

Reports a C# file whose single top-level type has a different name, and every type after the first when a file holds several top-level types. A dotted file name such as `Order.Validation.cs` matches the part before the first dot, generic arity is ignored, and partial declarations of the same type count once. Only types directly in the compilation unit or a namespace count; nested types never do. The diagnostic sits on the type name.

Does not report files with no top-level types, and does not run outside the five projects.

Breach (`Order.cs`):

```csharp
namespace Shop.Orders;

public sealed class Customer { }
```

Compliant (`Order.cs`):

```csharp
namespace Shop.Orders;

public sealed class Order { }
```

To fix it, give the file the name of its one primary top-level type, or split the file so each top-level type has its own file.

### LS3004: Concrete class is not sealed

Enforces [Keep implementation style consistent](../backend/dotnet/naming.md#keep-implementation-style-consistent) (`litespec/backend/dotnet/naming#keep-implementation-style-consistent`). Runs in all five projects.

Reports a concrete class declared in source that nothing derives from and that is not sealed. The rule decides at the end of compilation, after every derived type is known. The diagnostic sits on the class name.

Does not report records, static classes, abstract classes, sealed classes, a base that has a derived class, or a class designed for extension through a virtual member, an unsealed override, or a protected member. Does not run outside the five projects.

Breach:

```csharp
public class Order { }
```

Compliant:

```csharp
public sealed class Order { }
```

To fix it, mark the leaf class `sealed`, or add the virtual or protected member that shows the class is designed for extension.

## Notes

### Rule severity

Every rule reports a warning and is enabled by default. You change the severity per rule in `.editorconfig`:

```ini
[*.cs]
dotnet_diagnostic.LS1011.severity = error
dotnet_diagnostic.LS3004.severity = none
```

When your project departs from the enforced Standard, you record an Exception record that cites the provision, rather than suppressing the diagnostic silently.

### Minimum compiler version

The package targets `netstandard2.0` and needs the .NET 9.0.300 SDK, Visual Studio 17.14, or later. Older compilers cannot load the analyzers.

### Detection limits

Several rules match names rather than project references, because Domain owns no reference to the outer-layer packages. You judge these findings against the lists below.

LS1001 reports a use whose namespace starts with one of these prefixes, followed by a dot or the end of the name:

```text
Microsoft.EntityFrameworkCore
Marten
Npgsql
Dapper
Microsoft.Data
System.Data
Microsoft.AspNetCore
System.Net.Http
Microsoft.Extensions
MediatR
LiteBus
Wolverine
MassTransit
Serilog
NLog
Newtonsoft.Json
System.Text.Json
System.Runtime.Serialization
System.Xml.Serialization
```

A namespace that only shares a prefix, such as `MartenStore`, does not match. Base class library namespaces outside this list, such as `System`, `System.Collections.Generic`, and `System.Linq`, never match.

Other name-based checks work the same way. An aggregate is any class that derives from a class named `AggregateRoot` with one type argument, in any namespace. A Domain exception is any exception that derives from a class named `DomainException`, which itself derives from `System.Exception`. A domain event is any type that implements an interface named `IDomainEvent`. A command handler is any class whose name ends in `CommandHandler` or that implements an interface named `ICommandHandler`, and a mediator call is any call whose target or receiver type is named `ICommandMediator`. A session is any type named `IDocumentSession`, any type named `DbContext`, or any subclass of a type named `DbContext`. The analyzer does not check that a `Guid` inside an identifier is a version 7 value; you create the value with `Guid.CreateVersion7` and pass it in, which also satisfies LS1009.
