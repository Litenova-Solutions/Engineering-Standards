# Application Layer

## Intent


Application coordinates use cases. It translates a command or query into domain and persistence work, applies structural input validation, and returns a transport-neutral result. It does not contain HTTP behavior or provider implementations.

## Agent Summary {#agent-summary}


- Organize Application by operation. (APP.STRUCTURE.001)
- Use specific LiteBus entry points. (APP.MEDIATOR.001)
- Co-locate contracts and implementations. (APP.CONTRACTS.001)
- Separate input validation from invariants. (APP.VALIDATION.001)
- Model expected use-case failures explicitly. (APP.FAILURES.001)
- Enforce target authorization in the use case. (APP.AUTHORIZATION.001)
- Keep command handlers narrow. (APP.COMMAND.001)
- Project queries directly. (APP.QUERY.001)
- Mirror a Domain closed set in the result. (APP.CLOSEDSET.001)
- Define narrow external ports. (APP.PORTS.001)

## Standards


### Organize Application by operation (APP.STRUCTURE.001)

**Requirement:** Application code MUST organize Application by operation.

**Rationale:** Each command or query owns one operation folder under its module. The implementation keeps its message, result, validator, handler, and operation-specific mapping together.

The implementation uses the same use-case prefix across each operation. Command types end in `Command`, `CommandResult`, `CommandValidator`, and `CommandHandler`. Query types end in `Query`, `QueryResult`, `QueryResultItem`, `QueryValidator`, and `QueryHandler`.

The implementation does not group all handlers or messages by technical type.

### Use specific LiteBus entry points (APP.MEDIATOR.001)

**Requirement:** Application code MUST use specific LiteBus entry points.

**Rationale:** Commands implement the pinned LiteBus command contract and dispatch through `ICommandMediator.SendAsync`. Queries implement the query contract and dispatch through `IQueryMediator.QueryAsync`.

Domain events remain package-free. Application event reaction handlers may implement LiteBus event handler contracts at the adapter boundary.

The implementation does not introduce a unified message bus abstraction.

### Co-locate contracts and implementations (APP.CONTRACTS.001)

**Requirement:** Application code MUST co-locate contracts and implementations.

**Rationale:** Messages and results are public when WebApi, Worker, or another host uses them. Handlers and validators remain internal sealed.

The implementation does not omit the `Command` or `Query` role from result, handler, or validator names.

A collection query names each query-specific row `{UseCase}QueryResultItem`. The implementation does not use a generic or Domain-wide `Summary` type as its default result item.

The implementation uses one Application-owned `ValidationError` model for command and query input errors.

### Separate input validation from invariants (APP.VALIDATION.001)

**Requirement:** Application code MUST separate input validation from invariants.

**Rationale:** LiteBus validators implement `ICommandValidator<TCommand>` or `IQueryValidator<TQuery>` and validate structural input through `ValidateAsync`. They throw the project command or query validation exception containing stable `ValidationError` values.

Validators may reject an empty title, malformed identifier, invalid page size, or missing required field. Domain owns whether the current aggregate state permits the requested behavior.

`ValidationError` has exactly `Field`, `Code`, and `Message`. `Field` names the Application input member and is empty for a message-wide error. `Code` is a stable lower snake-case identifier. `Message` is safe for a caller. Validation exceptions expose a non-empty read-only collection and no HTTP status.

### Model expected use-case failures explicitly (APP.FAILURES.001)

**Requirement:** Application code MUST model expected use-case failures explicitly.

**Rationale:** Application defines transport-neutral exceptions for a missing target, forbidden operation, and use-case conflict when the failure is not a Domain invariant. Each exception carries a stable code and a safe message. It does not carry an HTTP result, Problem Details value, provider exception, or stack detail.

WebApi maps each Application and Domain exception type explicitly. The implementation does not derive a public code from a CLR type name or map every `DomainException` to one status without reviewing its meaning.

The implementation uses one public abstract `UseCaseException` with a non-empty `Code` and safe exception message, then public sealed `ResourceNotFoundException`, `UseCaseForbiddenException`, and `UseCaseConflictException` subclasses. Public visibility exists only because hosts map the contract. The implementation does not catch these exceptions inside handlers or return them as successful results.

### Enforce target authorization in the use case (APP.AUTHORIZATION.001)

**Requirement:** Application code MUST enforce target authorization in the use case.

**Rationale:** A protected command or query receives the typed actor identity and relevant declared grants from the trusted host boundary. The handler verifies ownership, tenant, role, state, or delegated access using the target data it already loads. Collection queries include the authorized scope in the database predicate.

WebApi may enforce coarse authenticated, role, or scope policies before dispatch. It does not replace target authorization that depends on business data.

### Keep command handlers narrow (APP.COMMAND.001)

**Requirement:** Application code MUST keep command handlers narrow.

**Rationale:** A command handler:

1. Loads required aggregates through repositories.
2. Resolves Application-owned services such as time or the authenticated actor when not supplied by the host contract.
3. Calls domain behavior.
4. Stages changed aggregates.
5. Returns the operation result.

It does not commit, catch expected domain exceptions, map HTTP responses, or call provider SDKs.

### Project queries directly (APP.QUERY.001)

**Requirement:** Application code MUST project queries directly.

**Rationale:** Query handlers inject `IQuerySession`, filter by authorized scope, project directly to result records, and pass the cancellation token.

The implementation does not load aggregates, inject repositories, or introduce per-aggregate read-store interfaces for normal request queries.

### Mirror a Domain closed set in the result (APP.CLOSEDSET.001)

**Requirement:** Application code MUST mirror a Domain closed set in the result.

**Rationale:** When a result carries a Domain closed set, it models the set with the same shape (`DOMAIN.CLOSEDSET.001`). The set's information survives to the caller, and the layers stay aligned.

- Application represents data-bearing cases with its own discriminated union of records. This union mirrors the Domain union. It exposes no Domain union type (`ARCH.CONTRACTS.001`). It never flattens case data into an `enum` and nullable fields.
- Application represents a label-only set with its stable `FromCode` value (`DOMAIN.CLOSEDSET.001`). The result owns the string. Application introduces no equivalent enum and returns no Domain type.

The implementation prefers a faithful mirror while a use case is developing. Domain, Application, and transport models then carry the same set (`API.MODELS.001`). This alignment prevents contract drift.

Narrowing a result union to a scalar or enum requires a decision and updated specification. It is not a shortcut for moving one field. Application owns the projection from the Domain type to its result type. It does not return the aggregate.

### Define narrow external ports (APP.PORTS.001)

**Requirement:** Application code MUST define narrow external ports.

**Rationale:** Application owns a public interface when Infrastructure provides external behavior. The implementation names the interface for the business action, keeps its method surface narrow, and uses project-owned request and result types.

Provider names and transport models remain in Infrastructure.

### Keep event reaction implementations explicit (APP.REACTION.001)

**Requirement:** Application code MUST keep event reaction implementations explicit.

**Rationale:** The implementation places an event reaction implementation under the module and triggering event when one module owns it. The implementation names the handler for its action and event. The implementation documents whether delivery is `atomic`, `durable`, `rebuildable`, or `best-effort-optional`.

An optional post-commit handler may run in process. Required delivery activates the outbox extension. Required derived state uses an atomic, durable, or rebuildable projection path.

### Keep one state-changing Use case in one Command pipeline (APP.ORCHESTRATION.001)

**Requirement:** Application code MUST keep one state-changing Use case in one Command pipeline.

**Rationale:** A Command handler does not dispatch another Command through `ICommandMediator`. Nested dispatch can invoke the commit post-handler before the top-level Use case completes.

The top-level handler can coordinate multiple aggregates when one transaction is required. An approved use case or decision names the invariant or Domain Policy requiring atomic consistency. Domain objects continue to enforce their own aggregate invariants.

### Advance durable Workflows through separate Commands (APP.WORKFLOW.001)

**Requirement:** Application code MUST advance durable Workflows through separate Commands.

**Rationale:** A workflow orchestrator advances one durable workflow step from an event or scheduled trigger. It records workflow progress and stages the next Command for durable delivery. It does not mutate participating module aggregates directly.

Each issued Command enters its own command pipeline and owns one transaction. Workflow state and the outgoing durable message are staged in one transaction. Duplicate triggers and Commands are safe. The Workflow specification names retries, timeouts, compensation, and operator actions.

## Conventions


### Use this operation layout (APP.CONVENTION.001)

**Default:** Use this operation layout.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Example:**

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
  Posts/                            single aggregate whose name matches the module: operations sit directly under the module
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
    BuyerAccounts/
      RestrictAccount/
        RestrictAccountCommand.cs
        RestrictAccountCommandHandler.cs
    Consents/
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

The folder hierarchy follows `ARCH.MODULES.001`: module, then aggregate, then operation. A single-aggregate module places its operation folders directly under the module only when the aggregate root's plural name equals the module name. Otherwise, and for any module with more than one aggregate, operation folders nest under the aggregate the use case targets. The example creates `Shared` children only for types used by multiple modules.

### Keep messages immutable (APP.CONVENTION.002)

**Default:** Keep messages immutable.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** The implementation uses records for commands, queries, results, and validation errors. Typed IDs and Shared-kernel value objects can cross the Application boundary (`ARCH.CONTRACTS.001`). Examples include `PostId`, `Money`, and `EmailAddress`. An aggregate-owned value object does not cross.

The message carries a primitive and the handler reconstructs the Domain value. For example, `CreateDraftCommand` supplies a `string Title` to `PostTitle.Create`. A message or result contains no Domain aggregate, closed-set union, or Domain result record.

### Return use-case results (APP.CONVENTION.003)

**Default:** Return use-case results.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** The implementation returns only values needed by the caller. The implementation does not return an aggregate, Marten document session, provider response, or HTTP result from Application.

### Keep mappings at the owning boundary (APP.CONVENTION.004)

**Default:** Keep mappings at the owning boundary.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Application owns domain-to-result projection used by Application. WebApi owns request and response transport mapping. Frontends own presentation view models.

## Reference example

This informative example demonstrates `APP.CONTRACTS.001` and `APP.COMMAND.001`.

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


| ID | Method | Evidence |
|:---|:---|:---|
| APP.STRUCTURE.001 | static | Repository static check asserts `organize Application by operation` for the owning paths. |
| APP.MEDIATOR.001 | inspection | Pull request review asserts `use specific LiteBus entry points` in the owning specification and source paths. |
| APP.CONTRACTS.001 | inspection | Pull request review asserts `co-locate contracts and implementations` in the owning specification and source paths. |
| APP.VALIDATION.001 | inspection | Pull request review asserts `separate input validation from invariants` in the owning specification and source paths. |
| APP.FAILURES.001 | inspection | Pull request review asserts `model expected use-case failures explicitly` in the owning specification and source paths. |
| APP.AUTHORIZATION.001 | inspection | Pull request review asserts `enforce target authorization in the use case` in the owning specification and source paths. |
| APP.COMMAND.001 | inspection | Pull request review asserts `keep command handlers narrow` in the owning specification and source paths. |
| APP.QUERY.001 | inspection | Pull request review asserts `project queries directly` in the owning specification and source paths. |
| APP.CLOSEDSET.001 | inspection | Pull request review asserts `mirror a Domain closed set in the result` in the owning specification and source paths. |
| APP.PORTS.001 | inspection | Pull request review asserts `define narrow external ports` in the owning specification and source paths. |
| APP.REACTION.001 | inspection | Pull request review asserts `keep event reaction implementations explicit` in the owning specification and source paths. |
| APP.ORCHESTRATION.001 | inspection | Pull request review asserts `keep one state-changing Use case in one Command pipeline` in the owning specification and source paths. |
| APP.WORKFLOW.001 | inspection | Pull request review asserts `advance durable Workflows through separate Commands` in the owning specification and source paths. |
| APP.CONVENTION.001 | operation | The release record captures the observed `use this operation layout` result and owning operation. |
| APP.CONVENTION.002 | inspection | Pull request review asserts `keep messages immutable` in the owning specification and source paths. |
| APP.CONVENTION.003 | inspection | Pull request review asserts `return use-case results` in the owning specification and source paths. |
| APP.CONVENTION.004 | inspection | Pull request review asserts `keep mappings at the owning boundary` in the owning specification and source paths. |
