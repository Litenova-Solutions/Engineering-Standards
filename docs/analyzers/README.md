# Overview

## Intent

The Analyzers section explains the LiteSpec.Analyzers package, which checks .NET server code against the LiteSpec standard while the compiler runs and reports each break as an error in the editor and the build. The package checks project boundaries, modeling in Domain, the project that holds the business rules, and naming across the 5 application projects, with one assertion rule in test projects, reporting 25 errors, one per rule, with a link from each error to the standard it enforces. A backend developer uses these pages to install the package once and to clear each finding by fixing the code it names.

## How the pages fit together

Start with [Check .NET Code with the Analyzers](check-dotnet-code-with-the-analyzers.md) to install the package once for every project, confirm each project layer, read the first findings, and record a deviation for a deliberate departure. When a build reports a diagnostic, open its rule page from the [Analyzer rules overview](rules/README.md): the page states the provision the rule enforces, where the diagnostic sits, what the rule ignores, and how to fix the code, with a failing example beside a passing one. Every diagnostic also carries a help link that opens the provision it enforces, so an error in the editor leads straight to the rule it broke.

## How a rule decides to run

Three facts predict whether a rule runs in a project.

First, the analyzers work out the project layer from the `LiteSpecLayer` MSBuild property when it is set, and from the assembly name suffix otherwise. The `LiteSpecLayer` property wins when both exist.

| Assembly name suffix | Layer |
|:---|:---|
| `Shop.Domain` | Domain |
| `Shop.Application.Abstractions` | ApplicationAbstractions |
| `Shop.Application` | Application |
| `Shop.Infrastructure` | Infrastructure |
| `Shop.WebApi` | WebApi |
| `Shop.Domain.Tests` | Test |

Any other assembly name opts the project out, and so does an explicit `LiteSpecLayer` value of `None`. No rule runs in an opted-out project.

Second, a rule registers only in the layers its provision covers. Domain rules run in Domain. `LS2001` runs in Application, Infrastructure, and WebApi. `LS2002`, `LS2004`, `LS2005`, and `LS2007` run in Application and Infrastructure. `LS2003` and `LS2006` run in WebApi. Style rules run in the five production projects. `LS4001` runs in test projects. The analyzers skip generated code.

Third, most rules decide as the compiler reads each declaration. Rules `LS1003`, `LS1004`, and `LS3004` decide at the end of compilation, after every type is known.

Each diagnostic carries a help link of the form `https://litespec.dev/2.0.0/<page>/#<slug>`, which opens the provision the rule enforces.

## Severity and compiler support

Every rule reports an error and is enabled by default, so a finding fails the build. A project lowers the severity per rule in `.editorconfig`:

```ini
[*.cs]
dotnet_diagnostic.LS1011.severity = warning
dotnet_diagnostic.LS3004.severity = none
```

When a project departs from the enforced Standard, it records a deviation that cites the provision, rather than suppressing the diagnostic silently.

The package targets `netstandard2.0` and needs the .NET 9.0.300 SDK, Visual Studio 17.14, or later. Older compilers cannot load the analyzers.

## Detection limits

Several rules match names rather than project references, because Domain owns no reference to the outer-layer packages. Judge these findings against the lists below.

`LS1001` reports a use whose namespace starts with one of these prefixes, followed by a dot or the end of the name:

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

Other name-based checks work the same way:

- An aggregate is any class that derives from a class named `AggregateRoot` with one type argument, in any namespace.
- A child entity is any class that derives from a class named `Entity` with one type argument, in any namespace.
- A Domain exception is any exception that derives from a class named `DomainException`, which itself derives from `System.Exception`.
- A domain event is any type that implements an interface named `IDomainEvent`. `LS1013` additionally requires its file to sit under a folder named `Events`.
- A command handler is any class whose name ends in `CommandHandler` or that implements an interface named `ICommandHandler`. A mediator call is any call whose target or receiver type is named `ICommandMediator`.
- A query handler is any class that implements an interface named `IQueryHandler`.
- An endpoint is any class that implements an interface named `IEndpoint`.
- A reaction is any class that implements an interface named `IEventHandler` or `IDomainEventReaction`. A job is any class that derives from a class named `BackgroundService` or implements an interface named `IHostedService`.
- A session is any type named `IDocumentSession`, any type named `DbContext`, or any subclass of a type named `DbContext`.
- A test is any method carrying an attribute named `Fact`, `Theory`, `Test`, `TestCase`, `TestCaseSource`, `TestMethod`, or `DataTestMethod`. An assertion is any call to a member of a type named `Assert`, or to a method whose name starts with `Assert`.

The analyzer does not check that a `Guid` inside an identifier is a version 7 value. Create the value with `Guid.CreateVersion7` and pass it in, which also satisfies `LS1009`.

## Pages in this section

- [Check .NET Code with the Analyzers](check-dotnet-code-with-the-analyzers.md): install the package once, read the first findings, and raise enforced rules to build errors.
- [Analyzer rules overview](rules/README.md): find the reference page for each of the 25 rules, grouped by layer.
