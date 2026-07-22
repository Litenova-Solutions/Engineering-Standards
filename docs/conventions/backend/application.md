# Application Layer

## Intent

Application coordinates use cases. It translates a command or query into domain and persistence work, applies structural input validation, and returns a transport-neutral result. It does not contain HTTP behavior or provider implementations.

## Agent Summary {#agent-summary}

- Organize Application by module and use case.
- Co-locate each message with its role-explicit result, validator, and handler.
- Dispatch writes through `ICommandMediator` and reads through `IQueryMediator`.
- Keep handlers and validators internal sealed.
- Validate input structure before handlers and keep business invariants in Domain.
- Return stable, transport-neutral validation and use-case failures.
- Write through aggregate repositories and read through `IQuerySession` projections.
- Define narrow public external ports for Infrastructure implementations.
- Keep atomic orchestration and durable Workflow orchestration explicit and separate from Aggregate behavior.

## Standards

### Organize Application by operation (APP.STRUCTURE.001)

Each command or query owns one operation folder under its module. Keep its message, result, validator, handler, and operation-specific mapping together.

Use the same use-case prefix across each operation. Command types end in `Command`, `CommandResult`, `CommandValidator`, and `CommandHandler`. Query types end in `Query`, `QueryResult`, `QueryResultItem`, `QueryValidator`, and `QueryHandler`.

Do not group all handlers or messages by technical type.

### Use specific LiteBus entry points (APP.MEDIATOR.001)

Commands implement the pinned LiteBus command contract and dispatch through `ICommandMediator.SendAsync`. Queries implement the query contract and dispatch through `IQueryMediator.QueryAsync`.

Domain events remain package-free. Application event reaction handlers may implement LiteBus event handler contracts at the adapter boundary.

Do not introduce a unified message bus abstraction.

### Co-locate contracts and implementations (APP.CONTRACTS.001)

Messages and results are public when WebApi, Worker, or another host uses them. Handlers and validators remain internal sealed.

Do not omit the `Command` or `Query` role from result, handler, or validator names.

A collection query names each query-specific row `{UseCase}QueryResultItem`. Do not use a generic or Domain-wide `Summary` type as its default result item.

Use one Application-owned `ValidationError` model for command and query input errors.

### Separate input validation from invariants (APP.VALIDATION.001)

LiteBus validators implement `ICommandValidator<TCommand>` or `IQueryValidator<TQuery>` and validate structural input through `ValidateAsync`. They throw the project command or query validation exception containing stable `ValidationError` values.

Validators may reject an empty title, malformed identifier, invalid page size, or missing required field. Domain owns whether the current aggregate state permits the requested behavior.

`ValidationError` has exactly `Field`, `Code`, and `Message`. `Field` names the Application input member and is empty for a message-wide error. `Code` is a stable lower snake-case identifier. `Message` is safe for a caller. Validation exceptions expose a non-empty read-only collection and no HTTP status.

### Model expected use-case failures explicitly (APP.FAILURES.001)

Application defines transport-neutral exceptions for a missing target, forbidden operation, and use-case conflict when the failure is not a Domain invariant. Each exception carries a stable code and a safe message. It does not carry an HTTP result, Problem Details value, provider exception, or stack detail.

WebApi maps each Application and Domain exception type explicitly. Do not derive a public code from a CLR type name or map every `DomainException` to one status without reviewing its meaning.

Use one public abstract `UseCaseException` with a non-empty `Code` and safe exception message, then public sealed `ResourceNotFoundException`, `UseCaseForbiddenException`, and `UseCaseConflictException` subclasses. Public visibility exists only because hosts map the contract. Do not catch these exceptions inside handlers or return them as successful results.

### Enforce target authorization in the use case (APP.AUTHORIZATION.001)

A protected command or query receives the typed actor identity and relevant declared grants from the trusted host boundary. The handler verifies ownership, tenant, role, state, or delegated access using the target data it already loads. Collection queries include the authorized scope in the database predicate.

WebApi may enforce coarse authenticated, role, or scope policies before dispatch. It does not replace target authorization that depends on business data.

### Keep command handlers narrow (APP.COMMAND.001)

A command handler:

1. Loads required aggregates through repositories.
2. Resolves Application-owned services such as time or the authenticated actor when not supplied by the host contract.
3. Calls domain behavior.
4. Stages changed aggregates.
5. Returns the operation result.

It does not commit, catch expected domain exceptions, map HTTP responses, or call provider SDKs.

### Project queries directly (APP.QUERY.001)

Query handlers inject `IQuerySession`, filter by authorized scope, project directly to result records, and pass the cancellation token.

Do not load aggregates, inject repositories, or introduce per-aggregate read-store interfaces for normal request queries.

### Define narrow external ports (APP.PORTS.001)

Application owns a public interface when Infrastructure must provide external behavior. Name the interface for the business action, keep its method surface narrow, and use project-owned request and result types.

Provider names and transport models remain in Infrastructure.

### Keep event reaction implementations explicit (APP.REACTION.001)

Place an event reaction implementation under the module and triggering event when one module owns it. Name the handler for its action and event. Document whether delivery is `atomic`, `durable`, `rebuildable`, or `best-effort-optional`.

An optional post-commit handler may run in process. Required delivery activates the outbox extension. Required derived state uses an atomic, durable, or rebuildable projection path.

### Keep one state-changing Use case in one Command pipeline (APP.ORCHESTRATION.001)

A Command handler MUST NOT dispatch another Command through `ICommandMediator`. Nested command dispatch can invoke the commit post-handler before the top-level Use case completes.

The top-level handler MAY coordinate multiple aggregates through their repositories when one transaction is required. The approved use-case specification or an accepted decision MUST name the aggregate invariant or domain policy that requires atomic consistency. Domain objects continue to enforce their own aggregate invariants.

### Advance durable Workflows through separate Commands (APP.WORKFLOW.001)

A workflow orchestrator advances one durable workflow step from an event or scheduled trigger. It records workflow progress and stages the next Command for durable delivery. It does not mutate participating module aggregates directly.

Each issued Command enters its own command pipeline and owns one transaction. Workflow state and the outgoing durable message are staged in one transaction. Duplicate triggers and Commands are safe. The Workflow specification names retries, timeouts, compensation, and operator actions.

## Conventions

### Use this operation layout

```text
{ProjectName}.Application/
  Shared/
    Clock/
      IClock.cs
    Validation/
      ValidationError.cs
      CommandValidationException.cs
      QueryValidationException.cs
    Failures/
      ResourceNotFoundException.cs
      UseCaseForbiddenException.cs
      UseCaseConflictException.cs
  Posts/                            single aggregate: operations sit directly under the module
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
    FollowUps/
      OnPostPublished/
        NotifySubscribersOnPostPublishedHandler.cs
        IPostPublicationNotifier.cs
  Audience/                         two aggregates: operations nest under each aggregate
    BuyerAccount/
      RestrictAccount/
        RestrictAccountCommand.cs
        RestrictAccountCommandHandler.cs
    Consent/
      GrantConsent/
        GrantConsentCommand.cs
        GrantConsentCommandHandler.cs
  Workflows/
    PublicationDelivery/
      PublicationDeliveryWorkflow.cs
      PublicationDeliveryWorkflowState.cs
      PublicationDeliveryWorkflowOrchestrator.cs
      AdvancePublicationDeliveryWorkflowCommand.cs
      AdvancePublicationDeliveryWorkflowCommandHandler.cs
```

The folder hierarchy follows `ARCH.MODULES.001`: module, then aggregate, then operation. A single-aggregate module places its operation folders directly under the module; a module with more than one aggregate nests operation folders under the aggregate the use case targets. Create `Shared` children only for types used by multiple modules.

### Keep messages immutable

Use records for commands, queries, results, and validation errors. Use typed IDs and domain value types where those types cross the Application boundary safely.

### Return use-case results

Return only values needed by the caller. Do not return an aggregate, Marten document session, provider response, or HTTP result from Application.

### Keep mappings at the owning boundary

Application owns domain-to-result projection used by Application. WebApi owns request and response transport mapping. Frontends own presentation view models.

## Examples

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

Use the exact method signatures exposed by the pinned LiteBus package when they differ from an illustrative example.

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

### Advance a durable workflow without mutating module aggregates

```csharp
internal sealed class AdvanceOrderFulfillmentWorkflowCommandHandler(
    IOrderFulfillmentWorkflowStore workflows,
    IWorkflowCommandOutbox outbox)
    : ICommandHandler<AdvanceOrderFulfillmentWorkflowCommand>
{
    public async Task HandleAsync(
        AdvanceOrderFulfillmentWorkflowCommand command,
        CancellationToken cancellationToken)
    {
        var workflow = await workflows.GetAsync(
            command.WorkflowId,
            cancellationToken);

        var nextCommand = workflow.RecordPaymentConfirmed(
            command.PaymentId,
            command.OccurredAt);

        workflows.Store(workflow);
        outbox.Enqueue(nextCommand, workflow.Id);
    }
}
```

Infrastructure stages Workflow state and the outgoing Command in the same session. The Worker later dispatches the outgoing Command through a new command pipeline.

## Verification

- Confirm every operation folder maps to a documented use case.
- Confirm every command and query result, query result item, validator, and handler includes its full role suffix.
- Confirm handlers and validators are internal sealed.
- Confirm validators implement the pinned `ValidateAsync` contract.
- Confirm command handlers do not commit and query handlers do not use repositories.
- Confirm a Command handler never dispatches another Command through `ICommandMediator`.
- Confirm a multi-Aggregate Command names the rule and transaction requirement in its use-case specification.
- Confirm a workflow orchestrator stages progress and outgoing work without mutating participating module aggregates.
- Confirm public ports contain no provider type.
- Confirm protected messages carry trusted actor context and handlers authorize their targets.
- Confirm expected failures have stable codes and no HTTP or provider types.
- Run Application and architecture tests.
