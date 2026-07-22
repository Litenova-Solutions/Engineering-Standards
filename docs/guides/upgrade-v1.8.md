# Upgrade to Standards v1.8

Standards v1.8 reorganizes Domain by aggregate, anchors every aggregate-owned type name on its aggregate root, reserves exceptions for rule failures, and loads aggregates through a not-found-throwing repository method. It renames no vocabulary across specifications, changes no Specification Metadata schema, and moves no documentation directories. Consumers pass v1.8 after regrouping modules into folders, renaming types to lead with their aggregate, removing `Exception` from events and business terms, and switching required loads to `GetByIdAsync`.

## Organize each layer top-down: module, then aggregate, then detail

The module-first folder convention is replaced by a top-down hierarchy that is the same in every layer (`ARCH.MODULES.001` and `domain.md`): module, then aggregate, then the layer's own detail.

- Per-aggregate folders. A module with one aggregate keeps that aggregate and its members flat in the module folder. A module with more than one aggregate inserts an aggregate folder under the module in every layer, and each aggregate folder owns its own `Events/`, `States/`, and `Exceptions/`. Split a shared `States/` or `Events/` folder that mixes two aggregates into one folder per aggregate.
- Concept folders. A discriminated union places its base and every sealed case in one folder named for the concept, such as `ScanResults/`. The aggregate state hierarchy keeps its `States/` folder. A concept folder holds one concept's related types; kind-bucket folders (`Entities/`, `ValueObjects/`, `Services/`) and empty folders remain prohibited.

```text
Audience/                       before: one folder, two aggregates mixed
  BuyerAccount.cs
  Consent.cs
  States/
    BuyerAccountState.cs
    ConsentState.cs

Domain/Audience/BuyerAccount/   after: module, aggregate, detail (every layer)
Domain/Audience/Consent/
Application/Audience/BuyerAccount/RestrictAccount/
Application/Audience/Consent/GrantConsent/
Infrastructure/Audience/BuyerAccount/
WebApi/Endpoints/Audience/BuyerAccount/RestrictAccount/
```

Namespaces follow the new folders (`NAME.CSHARP.001`), so update namespace declarations and `using` directives when files move. Persistence discriminators and stored data do not change; only source layout and namespaces move.

## Anchor every aggregate-owned type on its aggregate root (`NAME.AGGREGATE.001`)

Every event, state case, union base and case, aggregate value object, child entity, and exception leads with its aggregate root's full name, in first position, so its owner is derivable from the name. The full aggregate name is used, never an abbreviation, and the prefix chains to the aggregate root. Only Shared kernel types (`Money`, `EmailAddress`) stay unprefixed.

```text
MemberAccessChangedEvent   ->  OrganizationMemberAccessChangedEvent
DraftPostState             ->  PostDraftState
PublishedPostState         ->  PostPublishedState
RefundSucceeded            ->  RefundSucceededOutcome
ScannerRole                ->  OrganizationScannerRole
SellerConfiguration        ->  OrganizationSellerConfiguration
```

Domain events now carry the `Event` suffix, `{Aggregate}{PastFact}Event`, such as `PostPublishedEvent`. An event-reaction handler and its operation folder keep the readable `On{PastFact}` form without the suffix (`OnPostPublished`, `NotifySubscribersOnPostPublishedHandler`), because `On` already marks the reaction and a folder name carries no technical suffix.

Rename the type, its files, and any persisted discriminator together, and migrate stored discriminator values where an event, state, or union case was persisted. Exception and value-object renames are pure source changes.

## Load required aggregates through `GetByIdAsync` (`DOMAIN.REPOSITORY.001`)

A required load uses `GetByIdAsync`, which returns the aggregate and throws the aggregate's own `{Aggregate}NotFoundException` from the Infrastructure implementation. The `{Aggregate}NotFoundException` is a `DomainException` that owns its stable code and message, and the host maps that code to `404`. A command handler receives a loaded aggregate and no longer repeats a null check or constructs a not-found failure with a hard-coded code and message at the call site.

```csharp
// Domain: one per aggregate, owns its code.
public sealed class PostNotFoundException() : DomainException("The post does not exist.")
{
    public override string Code => "POSTS.POST_NOT_FOUND";
}

// Infrastructure: the repository throws it.
public async Task<Post> GetByIdAsync(PostId id, CancellationToken cancellationToken)
{
    var post = await session.LoadAsync<Post>(id, cancellationToken);
    return post ?? throw new PostNotFoundException();
}

// Application: the handler just loads.
var post = await posts.GetByIdAsync(command.PostId, cancellationToken);
```

Register the new `{MODULE}.{AGGREGATE}_NOT_FOUND` code as `404` in the host error map. Reserve a nullable `FindBy...Async` for a genuinely optional lookup, such as a deduplication-key or provider-reference probe.

## Reserve exceptions for rule failures

`Exception` is reserved for the type that rejects a rule. Two changes follow.

- Events carry no exception. Tightened `DOMAIN.EVENT.001` prohibits an event field typed as `Exception`, `DomainException`, or another error object, and prohibits naming an event after the language error type. When a failure is the recorded fact, model it as immutable domain data (a value object or a discriminated-union case under `DOMAIN.CLOSEDSET.001`) and carry that data on the event.
- Business terms avoid `Exception`. Extended `NAME.EXCEPTION.001` prohibits `Exception` as a domain business term for an anomaly, a discrepancy, or a manual-handling case, because it reads as a thrown exception. Rename such a concept to a domain word.

```text
CancellationExceptionRaisedEvent   ->  CancellationDiscrepancyRaisedEvent
RefundExceptionResolvedEvent       ->  RefundHoldResolvedEvent
```

## Verify

Run the reference consumer validator and the backend checks from the consumer root. Confirm each layer nests module then aggregate then detail, no module mixes two aggregates in a shared folder, no closed set is loose in a module folder, every aggregate-owned type name leads with its aggregate root, required loads use `GetByIdAsync` with a per-aggregate not-found exception, no event carries or is named for an exception, and no domain business term uses `Exception`.
