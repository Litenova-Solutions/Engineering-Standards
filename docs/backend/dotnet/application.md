# .NET Application Layer

## Intent

Application code in a .NET backend sends commands and queries through mediators from LiteBus, the pinned messaging library: commands change business state, queries read without changing it, and validators report structural input problems as LiteBus validity values. This page states the .NET form of that dispatch: the validity shape, the entry point for each declared effect, the operation layout, and the pinned mediator methods. The shared coordination rules live on [Application Layer](../application.md); this page holds only their .NET form.

## Concepts

### Commands, Queries, and Mediators

A command is a message that changes business state; a query reads a read model without changing state. The handler never calls the next stage directly. It sends the message through a LiteBus mediator, and the command pipeline around the handler runs validation, authorization, the handler itself, and then one commit. Commands travel through `ICommandMediator` and queries through `IQueryMediator`, so the write path and the read path stay visibly separate at every call site.

A reaction answers a domain event or an integration event in one class carrying one anchor tag naming its reaction record. A job issues its declared commands once per item in its scope.

### Validity Findings

A validator checks structural input, such as an empty title or a malformed identifier, before Domain runs. Each finding names the input member, a stable reason code, and a caller-safe message. The pipeline runs every validator for the message and merges the findings, so the caller learns about all input problems in one answer instead of fixing them one round trip at a time.

## Standards

### Report Input Problems as Validity

**Statement:** A validator MUST report its findings as Validity, with each ValidationFailure carrying a member, a code, and a message, and no HTTP status.

**Rationale:** Every validator for the message runs, and the pipeline merges the findings before it refuses the request, so the caller fixes the whole form at once. The member tells the caller which input failed, the stable code lets a client branch on the reason, and the message explains the problem in words safe to show. Validity values come from the pinned mediator's abstractions, named in `litespec/backend/dotnet/application#use-the-pinned-mediator-entry-points`, so every project reports the same shape. This provision states the .NET form of `litespec/backend/application#report-input-problems-as-validity-findings`.

### Dispatch Declared Effects Through Their Entry Points

**Statement:** A command handler MUST dispatch a declared `issues` effect through `ICommandMediator`, a declared `sends` effect through the messenger port, a declared `publishes` effect through the outbox after commit, and a declared `calls` effect through its external-system port.

**Rationale:** Each effect verb has one entry point, so a reader tells the edge kind from the call. An `inline` `issues` entry states whether it shares the caller's transaction: a shared transaction commits with the caller, and any other timing commits in its own pipeline. An undeclared dispatch fails `effect-undeclared`, whatever its entry point. A top-level handler coordinates several aggregates directly when the record's `changes` names them under `consistency: atomic`. This provision states the .NET form of `litespec/backend/application#dispatch-only-declared-effect-edges`.

**Example:**

```csharp
// Declared as { "issues": "use-case/admission.void-ticket-code", "timing": "inline", "sharesTransaction": true }.
await commandMediator.SendAsync(
    new VoidTicketCodeCommand(codeId),
    cancellationToken);
```

### Run Reactions in Dedicated Handlers

**Statement:** A reaction MUST run in one class carrying one anchor tag naming its reaction record.

**Rationale:** One class per reaction answers the trigger the record names in `on` and dispatches only through its `effects` entries. The class carries `/// <implements>reaction/<module>.<name></implements>`, so the stack reader links it without guessing. It lives in the folder named for the reaction under `litespec/backend/dotnet/application#use-the-operation-folder-layout`. It never writes an aggregate directly: a reaction that needs a write issues a command. It honors the record's `reads`, its idempotency, and its `onFailure`. This provision states the .NET form of `litespec/backend/application#keep-event-reaction-implementations-explicit`.

**Example:**

```csharp
/// <implements>reaction/admission.void-code-on-resale</implements>
internal sealed class VoidCodeOnResaleReaction(...)
{
    // Answers event/ticket-resale.resold by issuing use-case/admission.void-ticket-code.
}
```

### Run Jobs as Hosted Operations

**Statement:** A job MUST run as one hosted operation carrying one anchor tag naming its job record.

**Rationale:** The job class lives in Infrastructure with the scheduling concerns and registers on the declared execution host. It honors its record's scope, batch size, lease, and cursor, issues its commands once per item, and records its evidence where the record states. An `operator` job states its `runsWhere` and its guard and touches no aggregate. This provision states the .NET form of `litespec/backend/application#run-each-job-within-its-declared-scope`.

**Example:**

```csharp
/// <implements>job/sales.expire-lapsed-returns</implements>
internal sealed class ExpireLapsedReturnsJob(...)
{
    // Issues one expire command per due listing, resuming from its cursor.
}
```

## Conventions

### Use the Operation Folder Layout

**Default:** Place each operation in a folder named for its use case under its module and aggregate, with the files this provision names.

**Replacement:** A project names its operation layout in its Application documentation.

**Rationale:** The folder path matches the specification path, so a reader locates an operation from its use-case identifier without searching. Type names derive from the use-case identifier with the architectural suffix, so `use-case/spending.submit-expense` owns `SubmitExpenseCommand` under `litespec/workspace/naming#use-architectural-suffixes`. Only a use case or a reaction gets a folder: any other type sits flat in the folder that owns it under `litespec/backend/architecture#place-a-type-at-the-lowest-folder-that-holds-its-consumers`, and a reaction folder takes the reaction name with its anchored class. Each result type carries one case per result, and each refusal carries the refusal `code` from its result record. A query result type carries one member per declared `include` group.

**Example:** The operation layout is:

```text
{ProjectName}.Application.Abstractions/     contracts more than one module names
  Clock/
    IClock.cs
  Failures/
    ResourceNotFoundException.cs
    UseCaseForbiddenException.cs
    UseCaseConflictException.cs
  Validation/
    ValidationErrors.cs
{ProjectName}.Application/
  Pipeline/                         the pipeline's own stages, and nothing else
    ApplicationPipeline.cs
    AuthorizationGuard.cs
  Posts/                            single aggregate whose name matches the module: operations sit directly under the module
    IPostArchive.cs                 a port several Posts use cases name
    CreateDraft/
      CreateDraftCommand.cs
      CreateDraftCommandResult.cs
      CreateDraftCommandValidator.cs
      CreateDraftCommandHandler.cs
    GetPost/
      GetPostQuery.cs
      GetPostQueryResult.cs
      GetPostQueryValidator.cs
      GetPostQueryHandler.cs
    ListPosts/
      ListPostsQuery.cs
      ListPostsQueryResult.cs
      ListPostsQueryResultItem.cs
      ListPostsQueryValidator.cs
      ListPostsQueryHandler.cs
    NotifySubscribersOnPostPublished/   a reaction: one anchored class in the folder named for the reaction
      NotifySubscribersOnPostPublishedReaction.cs
      IPostPublicationNotifier.cs   a port one reaction names
  Customers/                        two aggregates: operations nest under each aggregate
    CustomerAccounts/
      CustomerAccountScopeLookup.cs aggregate-owned, so it sits with the aggregate
      RestrictAccount/
        RestrictAccountCommand.cs
        RestrictAccountCommandHandler.cs
    Consents/
      GrantConsent/
        GrantConsentCommand.cs
        GrantConsentCommandHandler.cs
```

Module and aggregate order, including the single-aggregate flat form, follow `litespec/backend/architecture#organize-every-layer-by-module-and-use-case`.

### Use the Pinned Mediator Entry Points

**Default:** Dispatch a command through `ICommandMediator.SendAsync` and a query through `IQueryMediator.QueryAsync`, from the LiteBus version the manifest pins.

**Replacement:** A project names its dispatch entry points in its Application documentation.

**Rationale:** One pinned library means every dispatch site in every project reads the same way, and an agent finds all callers of a message with one search. A project that replaces the default still keeps commands and queries on separate entry points, because that separation is required by `litespec/backend/application#dispatch-commands-and-queries-through-separate-entry-points` and no replacement removes it.

## Reference Example

This informative example demonstrates `litespec/backend/dotnet/architecture#keep-implementation-types-internal` and `litespec/backend/application#keep-command-handlers-narrow`.

```csharp
public sealed record CreateDraftCommand(
    PostId PostId,
    AuthorId AuthorId,
    string Title) : ICommand<CreateDraftCommandResult>;

public sealed record CreateDraftCommandResult(PostId PostId);

internal sealed class CreateDraftCommandHandler(
    IPostRepository postRepository,
    IClock clock) : ICommandHandler<CreateDraftCommand, CreateDraftCommandResult>
{
    public async Task<CreateDraftCommandResult> HandleAsync(
        CreateDraftCommand command,
        CancellationToken cancellationToken)
    {
        var post = Post.CreateDraft(
            command.PostId,
            command.AuthorId,
            PostTitle.Create(command.Title),
            clock.UtcNow);

        postRepository.Store(post);

        return new CreateDraftCommandResult(post.Id);
    }
}
```

The pinned LiteBus package signatures take precedence over illustrative example signatures.

### Coordinate Multiple Aggregates in One Transaction

```csharp
internal sealed class ConfirmOrderCommandHandler(
    IOrderRepository orders,
    IReservationRepository reservations)
    : ICommandHandler<ConfirmOrderCommand, ConfirmOrderCommandResult>
{
    public async Task<ConfirmOrderCommandResult> HandleAsync(
        ConfirmOrderCommand command,
        CancellationToken cancellationToken)
    {
        var order = await orders.GetByIdAsync(command.OrderId, cancellationToken);
        var reservation = await reservations.GetByIdAsync(
            command.ReservationId,
            cancellationToken);

        reservation.ConfirmFor(order.Id);
        order.Confirm(reservation.Id);

        reservations.Store(reservation);
        orders.Store(order);

        return new ConfirmOrderCommandResult(order.Id);
    }
}
```

The handler stages both aggregates because the record's `changes` names both under `consistency: atomic` citing its rule. It commits nothing: declared `issues` effects travel through `ICommandMediator`, and the post-handler commits once.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/backend/dotnet/application#report-input-problems-as-validity | guidance | Each validator: findings as `Validity`, with each `ValidationFailure` carrying member, code, and message, and no HTTP status. |
| litespec/backend/dotnet/application#dispatch-declared-effects-through-their-entry-points | checkable | `litespec model check` reports `effect-undeclared` for a dispatch no record declares. |
| litespec/backend/dotnet/application#run-reactions-in-dedicated-handlers | guidance | Each reaction in Application: one class carrying its record's anchor tag, in the folder named for the reaction. |
| litespec/backend/dotnet/application#run-jobs-as-hosted-operations | guidance | Each job: one hosted operation carrying its record's anchor tag, honoring scope, batch size, lease, and cursor. |
| litespec/backend/dotnet/application#use-the-operation-folder-layout | guidance | Each operation folder under its module and aggregate: the message, result, validator, and handler files named for the use case. |
| litespec/backend/dotnet/application#use-the-pinned-mediator-entry-points | guidance | Each dispatch site: commands through `ICommandMediator.SendAsync` and queries through `IQueryMediator.QueryAsync`, from the pinned LiteBus version. |
