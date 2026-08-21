# Application Layer

## Intent


Application coordinates use cases. It translates a command or query into domain and persistence work, applies structural input validation, and returns a transport-neutral result. It does not contain HTTP behavior or provider implementations.

## Agent Summary {#agent-summary}


- One folder per operation holds its message, result, validator, and handler. (BACKEND.APPLICATION.STRUCTURE.001)
- Commands and queries dispatch through their own mediator. (BACKEND.APPLICATION.MEDIATOR.001)
- Messages are public when hosts need them; handlers stay internal. (BACKEND.APPLICATION.CONTRACTS.001)
- Validators check input shape; Domain decides state permission. (BACKEND.APPLICATION.VALIDATION.001)
- Expected failures throw typed Application exceptions with stable codes. (BACKEND.APPLICATION.FAILURE.001)
- Handlers authorize against the target data they load. (BACKEND.APPLICATION.AUTHORIZATION.001)
- Command handlers load, call Domain, stage, and return. (BACKEND.APPLICATION.COMMAND.001)
- Queries project through the read session, never through aggregates. (BACKEND.APPLICATION.QUERY.001)
- Results mirror the Domain closed set rather than flattening it. (BACKEND.APPLICATION.CLOSEDSET.001)
- Ports name the business action and own their request and result types. (BACKEND.APPLICATION.PORT.001)

## Standards


### Organize Application by operation (BACKEND.APPLICATION.STRUCTURE.001)

**Requirement:** Each command or query MUST own one operation folder under its module holding its message, result, validator, handler, and mapping.

**Rationale:** Grouping by technical type scatters one operation across the project. Type names share the use-case prefix and end in the `Command` or `Query` role.

### Use specific LiteBus entry points (BACKEND.APPLICATION.MEDIATOR.001)

**Requirement:** A command MUST dispatch through `ICommandMediator.SendAsync` and a query through `IQueryMediator.QueryAsync`.

**Rationale:** Two specific entry points keep write and read paths distinguishable. A unified message bus abstraction hides that difference.

### Co-locate contracts and implementations (BACKEND.APPLICATION.CONTRACTS.001)

**Requirement:** A handler or validator MUST be `internal sealed`, and a message or result becomes public only when a host uses it.

**Rationale:** A collection query names each row `{UseCase}QueryResultItem` rather than a repository-wide summary type. One Application-owned `ValidationError` model serves command and query input errors.

### Separate input validation from invariants (BACKEND.APPLICATION.VALIDATION.001)

**Requirement:** A validator MUST limit its checks to structural input, leaving aggregate state decisions to Domain.

**Rationale:** Domain owns state permission. A validator rejects an empty title, malformed identifier, or invalid page size. `ValidationError` carries exactly `Field`, `Code`, and `Message`, and validation exceptions expose no HTTP status.

### Model expected use-case failures explicitly (BACKEND.APPLICATION.FAILURE.001)

**Requirement:** An expected use-case failure MUST throw a transport-neutral Application exception carrying a stable code and a safe message.

**Rationale:** One public abstract `UseCaseException` has sealed `ResourceNotFoundException`, `UseCaseForbiddenException`, and `UseCaseConflictException` subclasses. They carry no HTTP result, provider exception, or stack detail, and handlers do not catch them.

### Enforce target authorization in the use case (BACKEND.APPLICATION.AUTHORIZATION.001)

**Requirement:** A protected handler MUST verify ownership, tenant, role, state, or delegated access against the target data it loads.

**Rationale:** WebApi may enforce coarse authenticated, role, or scope policies first. It cannot replace an authorization decision that depends on business data. A collection query carries its authorized scope in the database predicate.

### Keep command handlers narrow (BACKEND.APPLICATION.COMMAND.001)

**Requirement:** A command handler MUST load aggregates, call domain behavior, stage changes, and return a result without committing or mapping transport.

**Rationale:** The commit post-handler owns the transaction, and WebApi owns error mapping. A handler that does either duplicates a boundary that already exists.

### Project queries directly (BACKEND.APPLICATION.QUERY.001)

**Requirement:** A query handler MUST project directly to its result record through `IQuerySession` without loading an aggregate.

**Rationale:** Loading an aggregate for presentation pulls invariant enforcement into a read path that cannot use it.

### Mirror a Domain closed set in the result (BACKEND.APPLICATION.CLOSEDSET.001)

**Requirement:** An Application result carrying a Domain closed set MUST model that set with the same shape as its own union or code value.

**Rationale:** The set's information then survives to the caller and the layers stay aligned. Application exposes no Domain union type and never flattens case data into an enum with nullable fields. Narrowing requires a decision and an updated specification.

### Define narrow external ports (BACKEND.APPLICATION.PORT.001)

**Requirement:** Application MUST declare a public port interface named for its business action, with a narrow surface and project-owned types.

**Rationale:** Provider names and transport models stay in Infrastructure, so a provider change does not reach Application.

### Keep event reaction implementations explicit (BACKEND.APPLICATION.REACTION.001)

**Requirement:** An event reaction implementation MUST declare whether its delivery is atomic, durable, rebuildable, or best-effort-optional.

**Rationale:** The declaration selects the mechanism. Required delivery activates the outbox extension, and required derived state uses an atomic, durable, or rebuildable projection path.

### Keep one state-changing Use case in one Command pipeline (BACKEND.APPLICATION.ORCHESTRATION.001)

**Requirement:** A command handler MUST NOT dispatch another command through `ICommandMediator`.

**Rationale:** Nested dispatch can run the commit post-handler before the top-level use case finishes. A top-level handler may still coordinate several aggregates when an approved record names the invariant requiring one transaction.

### Advance durable Workflows through separate Commands (BACKEND.APPLICATION.WORKFLOW.001)

**Requirement:** A workflow orchestrator MUST stage the next command for durable delivery rather than mutate a participating aggregate.

**Rationale:** Each issued command then enters its own pipeline and owns one transaction. Workflow state and the outgoing message commit together, so duplicate triggers stay safe.

## Conventions


### Use this operation layout (BACKEND.APPLICATION.CONVENTION.001)

**Default:** Place each operation in a folder named for its use case under its module and aggregate.

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

The folder hierarchy follows `BACKEND.ARCHITECTURE.MODULE.001`: module, then aggregate, then operation. A single-aggregate module places its operation folders directly under the module only when the aggregate root's plural name equals the module name. Otherwise, and for any module with more than one aggregate, operation folders nest under the aggregate the use case targets. The example creates `Shared` children only for types used by multiple modules.

### Keep messages immutable (BACKEND.APPLICATION.CONVENTION.002)

**Default:** Declare commands, queries, results, and validation errors as records.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Typed identifiers and Shared-kernel value objects may cross the boundary. An aggregate-owned value object does not, so the message carries a primitive and the handler reconstructs it.

### Return use-case results (BACKEND.APPLICATION.CONVENTION.003)

**Default:** Return only the values the caller needs from an Application result.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** An aggregate, session, provider response, or HTTP result leaving Application makes an inner concern part of the outward contract.

### Keep mappings at the owning boundary (BACKEND.APPLICATION.CONVENTION.004)

**Default:** Own domain-to-result projection in Application, transport mapping in WebApi, and view models in the frontend.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Each mapping then changes with the boundary that defines its shape.

## Reference example

This informative example demonstrates `BACKEND.APPLICATION.CONTRACTS.001` and `BACKEND.APPLICATION.COMMAND.001`.

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
| BACKEND.APPLICATION.STRUCTURE.001 | static | `ArchitectureTests` asserts each operation folder holds one message and its matching result, validator, and handler. |
| BACKEND.APPLICATION.MEDIATOR.001 | inspection | `ArchitectureTests` asserts no dispatch path resolves a shared bus abstraction over the two pinned mediators. |
| BACKEND.APPLICATION.CONTRACTS.001 | inspection | `ArchitectureTests` asserts handler and validator types are internal and sealed while messages and results carry their role suffix. |
| BACKEND.APPLICATION.VALIDATION.001 | inspection | `ValidationTests` asserts each validator rejects structural input and defers state decisions to the aggregate. |
| BACKEND.APPLICATION.FAILURE.001 | inspection | `UseCaseFailureTests` asserts each expected failure surfaces its stable code with no transport or provider detail attached. |
| BACKEND.APPLICATION.AUTHORIZATION.001 | inspection | `TargetAuthorizationTests` asserts each protected handler rejects a caller lacking the target grant it loads. |
| BACKEND.APPLICATION.COMMAND.001 | inspection | `ArchitectureTests` asserts no command handler commits a session, catches a domain exception, or references an HTTP type. |
| BACKEND.APPLICATION.QUERY.001 | inspection | `ArchitectureTests` asserts no query handler resolves a repository or returns an aggregate type. |
| BACKEND.APPLICATION.CLOSEDSET.001 | inspection | `ResultContractTests` asserts each result union carries one record per Domain case and exposes no Domain type. |
| BACKEND.APPLICATION.PORT.001 | inspection | `ArchitectureTests` asserts no Application port signature names a provider type or transport model. |
| BACKEND.APPLICATION.REACTION.001 | inspection | `ReactionTests` asserts each reaction runs under the delivery classification its specification declares. |
| BACKEND.APPLICATION.ORCHESTRATION.001 | inspection | `ArchitectureTests` asserts no command handler resolves or calls the command mediator. |
| BACKEND.APPLICATION.WORKFLOW.001 | inspection | `WorkflowOrchestrationTests` asserts the orchestrator stages progress and its outgoing command in one transaction. |
| BACKEND.APPLICATION.CONVENTION.001 | operation | Folder review compares each operation path against its use-case identifier, or records a named local replacement. |
| BACKEND.APPLICATION.CONVENTION.002 | inspection | `ArchitectureTests` asserts each message and result is a record exposing no aggregate or Domain union type. |
| BACKEND.APPLICATION.CONVENTION.003 | inspection | `ArchitectureTests` asserts no Application result exposes an aggregate, session, provider, or HTTP type. |
| BACKEND.APPLICATION.CONVENTION.004 | inspection | Mapping review locates each conversion in the layer that owns its output shape. |
