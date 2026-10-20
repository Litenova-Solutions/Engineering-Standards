# .NET Application Layer

## Intent

Application code in a .NET backend dispatches through LiteBus mediators and reports LiteBus validity. The shared provisions live on the stack-neutral page ([Application Layer](../application.md)); this page holds what .NET alone requires.

## Agent Summary {#agent-summary}

- Validators report LiteBus Validity with member, code, and message failures. (litespec/backend/dotnet/application#report-input-problems-as-validity)
- Command handlers never dispatch another command through the mediator. (litespec/backend/dotnet/application#keep-one-state-changing-use-case-in-one-command-pipeline)
- Dispatch uses the pinned LiteBus mediator entry points. (litespec/backend/dotnet/application#use-the-pinned-mediator-entry-points)

## Standards

### Report input problems as Validity

**Requirement:** A validator MUST report its findings as Validity, with each ValidationFailure carrying a member, a code, and a message, and no HTTP status.

**Rationale:** Every validator for a message runs, and the pipeline merges their findings before it refuses the request. The member names the input member, the code names the stable reason, and the message explains the problem in caller-safe language. Validity and ValidationFailure come from the pinned mediator's abstractions, named in `litespec/backend/dotnet/application#use-the-pinned-mediator-entry-points`. This realizes `litespec/backend/application#report-input-problems-as-validity-findings`.

### Keep one state-changing Use case in one Command pipeline

**Requirement:** A command handler MUST NOT dispatch another command through `ICommandMediator`.

**Rationale:** Nested dispatch can run the commit post-handler before the top-level use case finishes. A top-level handler may still coordinate several aggregates when an approved record names the invariant requiring one transaction.

A second command that has to run is staged for durable delivery instead. That path is not an exemption from this rule. The staged command enters its own pipeline and owns its own transaction, so no nesting occurs.

This realizes `litespec/backend/application#keep-one-state-changing-use-case-in-one-pipeline`.

## Conventions

### Use the pinned mediator entry points

**Default:** Dispatch a command through `ICommandMediator.SendAsync` and a query through `IQueryMediator.QueryAsync`, from the LiteBus version the manifest pins.

**Replacement:** A consumer replaces this default by recording an Exception for this provision, with reason and review date.

**Rationale:** The profile pins one library so every project reads the same call at every dispatch site. The obligation that the two paths stay separate belongs to `litespec/backend/application#dispatch-commands-and-queries-through-separate-entry-points` and survives the replacement.

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

### Coordinate multiple Aggregates without nested dispatch

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

The handler stages both Aggregates because the use-case specification names the rule that requires one transaction. It does not call `ICommandMediator` or commit.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/backend/dotnet/application#report-input-problems-as-validity | guidance | Does each validator report Validity with member, code, and message failures? |
| litespec/backend/dotnet/application#keep-one-state-changing-use-case-in-one-command-pipeline | guidance | Does any command handler dispatch another command through `ICommandMediator`? |
| litespec/backend/dotnet/application#use-the-pinned-mediator-entry-points | guidance | Does each dispatch site call the pinned mediator entry points? |
