# Upgrade to Standards v1.5

Standards v1.5 tightens Domain modeling. It adds no vocabulary, does not change the Specification Metadata schema, and moves no documentation directories. It removes the `enum` from the Domain layer, requires each rejected rule to own its own exception type, raises the XML documentation bar to every public Domain contract, and hardens the one-type-per-file rule. Consumers pass v1.5 after converting Domain enums to unions, splitting shared exception types, and splitting grouping files.

## Replace every Domain enum with a union or value object

`DOMAIN.CLOSEDSET.001` prohibits declaring any `enum` in the Domain layer. Find them:

```bash
grep -rn "enum " apps/api/src/*.Domain/
```

For each enum, choose one model:

- A closed set whose cases carry, or may later carry, their own data, or that behavior branches on, becomes a discriminated union: one abstract record base named for the concept and one sealed record per case.
- A validated scalar with no per-case data or behavior (for example a currency code) becomes a typed value object under `DOMAIN.VALUE.001`.

```csharp
// Before
public enum RefundOutcome { Pending, Succeeded, Failed, Reversed }

// After
public abstract record RefundOutcome;
public sealed record RefundPending(string Reason) : RefundOutcome;
public sealed record RefundSucceeded(DateTimeOffset ProviderTime) : RefundOutcome;
public sealed record RefundFailed(string Classification) : RefundOutcome;
public sealed record RefundReversed(DateTimeOffset ProviderTime) : RefundOutcome;
```

Replace enum `switch` statements with `switch` expressions on the case type, including a `_` arm that throws the union's unsupported-case exception. The rule is Domain-scoped: an Application result, a transport DTO, or a persistence record may keep an `enum` or a string at its boundary and map it to the Domain union. Register each union's discriminators in Infrastructure exactly as you register a state hierarchy, and do not persist a raw enum value that Domain no longer defines. Add a data migration for any column or document field that stored the old integer or name.

## Give each rejected rule its own exception type

`DOMAIN.ERROR.001` and `NAME.EXCEPTION.001` now prohibit a shared Domain exception constructed with a hard-coded code and message at the call site. Find them:

```bash
grep -rnE "throw new [A-Za-z]+RuleException\(\"" apps/api/src/*.Domain/
```

Replace each call with a specific exception type that owns its code and message and accepts only the domain values of the failure:

```csharp
// Before
throw new RefundRuleException("REFUNDS.ALLOCATION_INVALID", "A refund requires at least one allocation line.");

// After
throw new RefundAllocationRequiredException();
```

```csharp
public sealed class RefundAllocationRequiredException()
    : DomainException("A refund requires at least one allocation line.")
{
    public override string Code => "REFUNDS.ALLOCATION_REQUIRED";
}
```

Two rules that a boundary maps to one caller-visible code still get two exception types; the code lives in the types. Reuse one type only when a single rule fails from more than one input and the differing values are constructor parameters. Update the host error boundary if a caller-visible failure code changed, and update tests that asserted on the old code.

## Split grouping files into one type per file

`NAME.FILE.001` now prohibits any file with more than one public or internal top-level type. Grouping files such as `RefundEnums.cs`, `PaymentEnums.cs`, and `CancellationValueObjects.cs` must be split so each type lives in a file named for the type. A union's abstract base and each sealed case are separate files. The module folder provides the grouping; the file name does not.

## Complete XML documentation on Domain contracts

`DOMAIN.DOCUMENTATION.001` now applies to every public Domain type and member, not a selected subset. Add `<summary>` text that states the business constraint, result, or failure for factories, mutation methods, state and union cases and their data, events, exceptions, repositories, and business-fact properties. A property whose meaning is fully evident from a well-named type needs no restatement. Keep the repository writing style.

## Adopt current language features

`NAME.CSHARP.002` prefers the current construct where it is at least as clear: collection expressions (`[]`, `[.. source]`), `init` and `required` members for set-once values, `readonly` fields, primary constructors for dependency-only classes, target-typed `new`, and `switch` expressions over unions. Apply it as you touch Domain files for the conversions above; a mechanical repo-wide rewrite is not required.

## Validate and pin

Build and test the consumer solution, and run the reference consumer validator from the consumer root:

```bash
dotnet build apps/api/{ProjectName}.slnx --configuration Release
dotnet test apps/api/{ProjectName}.slnx --configuration Release --no-build
node standards/tools/validate-consumer.mjs
```

During draft review, pin the consumer submodule to the exact reviewed commit. After publication, update it to the `v1.5.0` tag.
