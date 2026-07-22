# Upgrade to Standards v1.8

Standards v1.8 changes Domain folder organization and reserves exceptions for rule failures. It renames no vocabulary across specifications, changes no Specification Metadata schema, and moves no documentation directories. Consumers pass v1.8 after regrouping multi-aggregate modules and closed sets into folders and after removing `Exception` from domain events and business terms.

## Organize a module by aggregate and concept

The module-first folder convention is replaced by two rules in `domain.md` and mirrored in `ARCH.MODULES.001`.

- Per-aggregate folders. A module with one aggregate keeps that aggregate and its members flat in the module folder. A module with more than one aggregate gives each aggregate its own folder, and each aggregate folder owns its own `Events/`, `States/`, and `Exceptions/`. Split a shared `States/` or `Events/` folder that mixes two aggregates into one folder per aggregate.
- Concept folders. A discriminated union places its base and every sealed case in one folder named for the concept, such as `ScanResults/` for `ScanResult` and its cases. The aggregate state hierarchy keeps its `States/` folder. A concept folder holds one concept's related types; kind-bucket folders (`Entities/`, `ValueObjects/`, `Services/`) and empty folders remain prohibited.

```text
Audience/                       before: one folder, two aggregates mixed
  BuyerAccount.cs
  Consent.cs
  States/
    BuyerAccountState.cs
    ConsentState.cs

Audience/                       after: one folder per aggregate
  BuyerAccount/
    BuyerAccount.cs
    States/
      BuyerAccountState.cs
  Consent/
    Consent.cs
    States/
      ConsentState.cs
```

The other layers mirror the same module and per-aggregate folder names. Namespaces follow the new folders (`NAME.CSHARP.001`), so update namespace declarations and `using` directives when files move. Persistence discriminators and stored data do not change; only source layout and namespaces move.

## Reserve exceptions for rule failures

`Exception` is reserved for the type that rejects a rule (`{DomainType}{Reason}Exception`). Two changes follow.

- Events carry no exception. Tightened `DOMAIN.EVENT.001` prohibits an event field typed as `Exception`, `DomainException`, or another error object, and prohibits naming an event after the language error type. When a failure is the recorded fact, model it as immutable domain data (a value object or a discriminated-union case under `DOMAIN.CLOSEDSET.001`) and carry that data on the event.
- Business terms avoid `Exception`. Extended `NAME.EXCEPTION.001` prohibits `Exception` as a domain business term for an anomaly, a discrepancy, or a manual-handling case, because it reads as a thrown exception. Rename such a concept to a domain word.

```text
CancellationExceptionRaisedEvent   ->  CancellationDiscrepancyRaised
PaidCapacityExceptionRecordedEvent ->  PaidCapacityShortfallRecorded
RefundExceptionResolvedEvent       ->  RefundHoldResolved
```

Rename the concept type, its events, its states, and any persisted discriminator together, and migrate stored discriminator values where the renamed concept was persisted.

## Verify

Run the reference consumer validator and the backend checks from the consumer root. Confirm no module mixes two aggregates in a shared folder, no closed set is loose in a module folder, no event carries or is named for an exception, and no domain business term uses `Exception`.
