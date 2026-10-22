# .NET Application Layer

## Intent

Application code in a .NET backend sends commands and queries through mediators from LiteBus, the pinned messaging library: commands change business state, queries read without changing it, and validators report structural input problems as LiteBus validity values. This page states the .NET form of that dispatch: the validity shape, the rule against a handler dispatching another command, and the pinned mediator methods, with examples of a narrow handler and of one handler coordinating several aggregates (business records that change in one step). Uniform mediator methods keep dispatch the same at every call site, and running each command in its own pipeline keeps one transaction per command. The shared coordination rules live on [Application Layer](../application.md); this page holds only their .NET form.

## Concepts

### Commands, queries, and mediators

A command is a message that changes business state; a query reads a read model without changing state. The handler never calls the next stage directly. It sends the message through a LiteBus mediator, and the command pipeline around the handler runs validation, authorization, the handler itself, and then one commit. Commands travel through `ICommandMediator` and queries through `IQueryMediator`, so the write path and the read path stay visibly separate at every call site.

### Validity findings

A validator checks structural input, such as an empty title or a malformed identifier, before Domain runs. Each finding names the input member, a stable reason code, and a caller-safe message. The pipeline runs every validator for the message and merges the findings, so the caller learns about all input problems in one answer instead of fixing them one round trip at a time.

## Standards

### Report input problems as Validity

**Statement:** A validator MUST report its findings as Validity, with each ValidationFailure carrying a member, a code, and a message, and no HTTP status.

**Rationale:** Every validator for a message runs, and the pipeline merges the findings before it refuses the request, so the caller fixes the whole form at once. The member tells the caller which input failed, the stable code lets a client branch on the reason, and the message explains the problem in words safe to show. Validity values come from the pinned mediator's abstractions, named in `litespec/backend/dotnet/application#use-the-pinned-mediator-entry-points`, so every project reports the same shape. This provision states the .NET form of `litespec/backend/application#report-input-problems-as-validity-findings`.

### Keep one state-changing Use case in one Command pipeline

**Statement:** A command handler MUST NOT dispatch another command through `ICommandMediator`.

**Rationale:** When a handler dispatches a second command through `ICommandMediator`, the inner pipeline can commit before the outer use case finishes, and a later failure in the outer use case then leaves committed work behind. A top-level handler coordinates several aggregates directly instead, when an approved record names the invariant that requires one transaction.

A follow-up command that must run separately is staged for durable delivery. That path is not an exemption from this rule. The staged command enters its own pipeline and owns its own transaction, so no nesting occurs.

This provision states the .NET form of `litespec/backend/application#keep-one-state-changing-use-case-in-one-pipeline`.

## Conventions

### Use the pinned mediator entry points

**Default:** Dispatch a command through `ICommandMediator.SendAsync` and a query through `IQueryMediator.QueryAsync`, from the LiteBus version the manifest pins.

**Replacement:** A consumer replaces this default by recording an Exception for this provision, with reason and review date.

**Rationale:** One pinned library means every dispatch site in every project reads the same way, and an agent finds all callers of a message with one search. A project that replaces the default still keeps commands and queries on separate entry points, because that separation is required by `litespec/backend/application#dispatch-commands-and-queries-through-separate-entry-points` and no replacement removes it.

## Reference example

This informative example demonstrates `litespec/backend/dotnet/architecture#keep-implementation-types-internal` and `litespec/backend/application#keep-command-handlers-narrow`.

```csharp
public sealed record CreateDraftCommand(
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
            PostId.New(),
            command.AuthorId,
            PostTitle.Create(command.Title),
            clock.UtcNow);

        postRepository.Store(post);

        return new CreateDraftCommandResult(post.Id);
    }
}
```

The pinned LiteBus package signatures take precedence over illustrative example signatures.

### Coordinate multiple aggregates without nested dispatch

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
        var order = await orders.GetAsync(command.OrderId, cancellationToken);
        var reservation = await reservations.GetAsync(
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
| litespec/backend/dotnet/application#report-input-problems-as-validity | guidance | Does each validator report `Validity` with `member`, `code`, and `message` failures? |
| litespec/backend/dotnet/application#keep-one-state-changing-use-case-in-one-command-pipeline | checkable | `dotnet build` of the Application project reports no LiteSpec.Analyzers LS2002 diagnostic. |
| litespec/backend/dotnet/application#use-the-pinned-mediator-entry-points | guidance | Does each dispatch site call the pinned mediator entry points? |
