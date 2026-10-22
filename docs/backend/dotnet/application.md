# .NET Application Layer

## Intent

Application code in a .NET backend sends commands and queries through mediators from LiteBus, the pinned messaging library: commands change business state, queries read without changing it, and validators report structural input problems as LiteBus validity values. This page states the .NET form of that dispatch: the validity shape, the rule against a handler dispatching another command, the operation layout, and the pinned mediator methods. The shared coordination rules live on [Application Layer](../application.md); this page holds only their .NET form.

## Concepts

### Commands, Queries, and Mediators

A command is a message that changes business state; a query reads a read model without changing state. The handler never calls the next stage directly. It sends the message through a LiteBus mediator, and the command pipeline around the handler runs validation, authorization, the handler itself, and then one commit. Commands travel through `ICommandMediator` and queries through `IQueryMediator`, so the write path and the read path stay visibly separate at every call site.

A reaction answers a domain event or a schedule through a dedicated handler, in the folder named for its use case.

### Validity Findings

A validator checks structural input, such as an empty title or a malformed identifier, before Domain runs. Each finding names the input member, a stable reason code, and a caller-safe message. The pipeline runs every validator for the message and merges the findings, so the caller learns about all input problems in one answer instead of fixing them one round trip at a time.

## Standards

### Report Input Problems as Validity

**Statement:** A validator MUST report its findings as Validity, with each ValidationFailure carrying a member, a code, and a message, and no HTTP status.

**Rationale:** Every validator for a message runs, and the pipeline merges the findings before it refuses the request, so the caller fixes the whole form at once. The member tells the caller which input failed, the stable code lets a client branch on the reason, and the message explains the problem in words safe to show. Validity values come from the pinned mediator's abstractions, named in `litespec/backend/dotnet/application#use-the-pinned-mediator-entry-points`, so every project reports the same shape. This provision states the .NET form of `litespec/backend/application#report-input-problems-as-validity-findings`.

### Keep One State-Changing Use Case in One Command Pipeline

**Statement:** A command handler MUST NOT dispatch another command through `ICommandMediator`.

**Rationale:** When a handler dispatches a second command through `ICommandMediator`, the inner pipeline can commit before the outer use case finishes, and a later failure in the outer use case then leaves committed work behind. A top-level handler coordinates several aggregates directly instead, when an approved record names the invariant that requires one transaction.

A follow-up command that must run separately is staged for durable delivery. That path is not an exemption from this rule. The staged command enters its own pipeline and owns its own transaction, so no nesting occurs.

This provision states the .NET form of `litespec/backend/application#keep-one-state-changing-use-case-in-one-pipeline`.

### Run Reactions in Dedicated Handlers

**Statement:** A reaction MUST run in an event handler or scheduled job named for its use case.

**Rationale:** An event reaction consumes its domain events through the event handler from the LiteBus version the manifest pins, and a scheduled reaction runs as a job through the pinned recurring commands. The handler lives in the folder named for the reaction's use case under `litespec/backend/dotnet/application#use-the-operation-folder-layout`, and its trigger comes from the use-case record: domain events, or a schedule or deadline stated in words. A reaction that must run after commit uses durable delivery with the classification its use case declares. This provision states the .NET form of `litespec/backend/application#keep-event-reaction-implementations-explicit`.

## Conventions

### Use the Operation Folder Layout

**Default:** Place each operation in a folder named for its use case under its module and aggregate, with the files this provision names.

**Replacement:** A project names its operation layout in its Application documentation.

**Rationale:** The folder path matches the specification path, so a reader locates an operation from its use-case identifier without searching. Type names derive from the use-case identifier with the architectural suffix, so `use-case/spending.submit-expense` owns `SubmitExpenseCommand` under `litespec/workspace/naming#use-architectural-suffixes`. Only a use case gets a folder: any other type sits flat in the folder that owns it under `litespec/backend/architecture#place-a-type-at-the-lowest-folder-that-holds-its-consumers`, and a reaction folder takes the reaction's use-case name. Each result type carries one case per result, and each refusal carries the refusal `code` from its result record.

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
    NotifySubscribersOnPostPublished/
      NotifySubscribersOnPostPublishedHandler.cs
      IPostPublicationNotifier.cs   a port one use case names
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

### Coordinate Multiple Aggregates Without Nested Dispatch

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

The handler stages both aggregates because the use-case specification names the rule that requires one transaction. It does not call `ICommandMediator` or commit.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/backend/dotnet/application#report-input-problems-as-validity | guidance | Each validator: findings as `Validity`, with each `ValidationFailure` carrying member, code, and message, and no HTTP status. |
| litespec/backend/dotnet/application#keep-one-state-changing-use-case-in-one-command-pipeline | checkable | `dotnet build` of the Application project reports no LiteSpec.Analyzers LS2002 diagnostic. |
| litespec/backend/dotnet/application#run-reactions-in-dedicated-handlers | guidance | Each reaction in Application: one event handler or scheduled job in the folder named for its use case. |
| litespec/backend/dotnet/application#use-the-operation-folder-layout | guidance | Each operation folder under its module and aggregate: the message, result, validator, and handler files named for the use case. |
| litespec/backend/dotnet/application#use-the-pinned-mediator-entry-points | guidance | Each dispatch site: commands through `ICommandMediator.SendAsync` and queries through `IQueryMediator.QueryAsync`, from the pinned LiteBus version. |
