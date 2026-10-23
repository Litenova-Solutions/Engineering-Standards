# Check .NET Code with the Analyzers

## Purpose

The LiteSpec Roslyn analyzers report breaks in LiteSpec .NET rules as compiler errors on every build, so a team sees each break in the editor instead of finding it in review. This guide installs the analyzer package once for the 5 backend projects and their tests, shows how to read and fix the first errors, and records a deviation for a deliberate departure. Each step names the standard it satisfies, and the guide adds no rule of its own.

## Prerequisites

Start with:

- The .NET 9.0.300 SDK, or Visual Studio 17.14 or later, whose compiler the analyzer package targets.
- A solution with the five application projects that [the .NET architecture page](../backend/dotnet/architecture.md#use-five-application-projects) requires: Domain, Application.Abstractions, Application, Infrastructure, and WebApi.
- One shared build file that all five projects import, such as `apps/api/Directory.Build.props`, with central package management enabled as [the .NET configuration page](../backend/dotnet/config.md#centralize-nuget-versions) describes.

## Procedure

### 1. Add the Package Once for Every Project

Add one `PackageReference` in `apps/api/Directory.Build.props` so every project inherits it:

```xml
<ItemGroup>
  <PackageReference Include="LiteSpec.Analyzers" Version="3.0.0" PrivateAssets="all" />
</ItemGroup>
```

`PrivateAssets="all"` keeps the analyzer out of any package you publish. Keep the version in one central place to satisfy `litespec/backend/dotnet/packages#pin-every-dependency-centrally`: with central package management, put the version in `apps/api/Directory.Packages.props` instead:

```xml
<PackageVersion Include="LiteSpec.Analyzers" Version="3.0.0" />
```

and omit `Version` from the `PackageReference`. Never add a second copy in a project file.

### 2. Confirm Each Project Layer

Each rule runs only in the layers its provision covers, and the analyzers read the layer from the assembly name suffix. `Shop.Domain` resolves as Domain, `Shop.Application.Abstractions` as Application.Abstractions, and the same suffix rule maps Application, Infrastructure, and WebApi. Test projects resolve as Test: `Shop.Domain.Tests` and any assembly ending in `.Tests` or `.Test`. An assembly whose name carries no layer suffix is not analyzed. The resolver checks the two-part `Application.Abstractions` suffix before `Application`, so `Shop.Application.Abstractions` never resolves as Application.

When a project name does not end in a layer name, set the layer in its project file:

```xml
<PropertyGroup>
  <LiteSpecLayer>Domain</LiteSpecLayer>
</PropertyGroup>
```

The values are `Domain`, `Application.Abstractions`, `Application`, `Infrastructure`, `WebApi`, `Test`, and `None`. Set `None` to opt a project out, for example a Worker. The package ships a props file that exposes `LiteSpecLayer` to the compiler, so no extra wiring is needed. This step implements `litespec/backend/dotnet/architecture#use-five-application-projects`.

### 3. Build and Read the First Diagnostics

Build the solution:

```sh
dotnet build apps/api/Shop.slnx
```

Each finding is an error by default, fails the build, and names the provision it enforces. A typical first line reads:

```text
error LS1002: Enum 'OrderStatus' models a closed set; use an abstract record with sealed cases and a stable Code (https://litespec.dev/3.0.0/backend/dotnet/domain/#model-every-closed-set-of-domain-values-without-enums)
```

The trailing address is the help link: it opens the provision the rule enforces, here `litespec/backend/dotnet/domain#model-every-closed-set-of-domain-values-without-enums`. In Visual Studio the same error appears in the Error List with its ID, file, and line, and the tooltip carries the help link. In the terminal, `dotnet build` prints the line above.

### 4. Fix a Finding

Work through one finding at a time, starting with the Domain layer. The two examples below cover the most common first errors. For any other error, open its rule page from the [Analyzer rules overview](rules/README.md), which states what the rule reports and how to fix the code.

#### Replace an Enum with a Closed Record Hierarchy

LS1002 reports any enum in Domain. Before:

```csharp
public enum OrderStatus
{
    Pending,
    Succeeded,
    Failed,
}
```

After the rewrite, following the shape on [the .NET domain page](../backend/dotnet/domain.md#model-every-closed-set-of-domain-values-without-enums):

```csharp
public abstract record OrderStatus
{
    public abstract string Code { get; }

    public static OrderStatus FromCode(string code) => code switch
    {
        "pending" => new OrderPendingStatus(),
        "succeeded" => new OrderSucceededStatus(),
        "failed" => new OrderFailedStatus(),
        _ => throw new OrderUnsupportedStatusException(code),
    };
}

public sealed record OrderPendingStatus : OrderStatus
{
    public override string Code => "pending";
}

public sealed record OrderSucceededStatus : OrderStatus
{
    public override string Code => "succeeded";
}

public sealed record OrderFailedStatus : OrderStatus
{
    public override string Code => "failed";
}
```

Boundary code converts a label through `FromCode`, and an unrecognized label fails validation instead of falling into a default case. Callers branch on the case type with a `switch` expression. Define `OrderUnsupportedStatusException` as a sealed `DomainException` subclass with a stable code, as `litespec/backend/dotnet/domain#reject-business-violations-with-domain-exceptions` requires.

#### Pass Time in as an Argument

LS1009 reports any read of a clock, randomness, or new identifier in Domain, such as `DateTimeOffset.UtcNow`, `Guid.NewGuid`, or `Random.Shared`. Before:

```csharp
public void Publish()
{
    State = new PostPublishedState(DateTimeOffset.UtcNow);
}
```

After:

```csharp
public void Publish(DateTimeOffset publishedAt)
{
    State = new PostPublishedState(publishedAt);
}
```

The caller in Application supplies `publishedAt` from its own clock, and tests pass an explicit value, so Domain stays deterministic. This matches the `Publish` shape on [the .NET domain page](../backend/dotnet/domain.md#model-every-aggregate-lifecycle-with-state-records) and satisfies `litespec/backend/domain#pass-nondeterministic-values-into-domain`.

### 5. Let the Build Fail on Findings in CI

Every rule is an error by default, so `dotnet build` already fails on a finding and no extra step is needed. The `build` job compiles the solution with `dotnet build <solution>`, so a finding fails the pull request under `litespec/quality/ci#run-applicable-gates-on-every-pull-request`. See [the continuous integration page](../quality/ci.md#run-applicable-gates-on-every-pull-request) for the jobs each change selects. Lower a severity only where a deviation allows it, as the next step describes.

### 6. Record a Deliberate Departure

When a finding is wrong for the project, record a deviation that cites the provision, with its reason and review date, as [the model page](../core/model.md) describes. Keep the record at `docs/deviations/<name>.md`, then suppress narrowly next to the code:

```csharp
#pragma warning disable LS1011 // deviation: docs/deviations/domain-docs-deferred.md
public string LegacyLabel { get; }
#pragma warning restore LS1011
```

Or scope an `.editorconfig` entry to the one file:

```ini
[Shop.Domain/Legacy/LegacyLabels.cs]
dotnet_diagnostic.LS1011.severity = suggestion
```

The example above quiets `litespec/backend/dotnet/domain#document-every-public-domain-contract` for one legacy file only. Never set a project-wide `none` without the record: the record carries the departure, and the suppression only quiets the compiler where the record allows.

## Check

Confirm the setup with these checks:

- `dotnet build apps/api/Shop.slnx` lists no `LS` errors, or lists only ones a deviation covers.
- Add a temporary enum to the Domain project and rebuild: the build reports `LS1002` naming the enum.
- Remove the enum and rebuild: the error is gone.
