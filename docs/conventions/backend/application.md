# Application Layer

## Intent

Application coordinates use cases. It translates a command or query into domain and persistence work, applies structural input validation, and returns a transport-neutral result. It does not contain HTTP behavior or provider implementations.

## Agent Summary {#agent-summary}

- Organize Application by subject and use case.
- Co-locate each message with its role-explicit result, validator, and handler.
- Dispatch writes through `ICommandMediator` and reads through `IQueryMediator`.
- Keep handlers and validators internal sealed.
- Validate input structure before handlers and keep business invariants in Domain.
- Return stable, transport-neutral validation and use-case failures.
- Write through aggregate repositories and read through `IQuerySession` projections.
- Define narrow public external ports for Infrastructure implementations.
- Keep multi-subject process coordination explicit and separate from aggregate behavior.

## Standards

### Organize Application by operation (APP.STRUCTURE.001)

Each command or query owns one operation folder under its subject. Keep its message, result, validator, handler, and operation-specific mapping together.

Use the same use-case prefix across each operation. Command types end in `Command`, `CommandResult`, `CommandValidator`, and `CommandHandler`. Query types end in `Query`, `QueryResult`, `QueryResultItem`, `QueryValidator`, and `QueryHandler`.

Do not group all handlers or messages by technical type.

### Use specific LiteBus entry points (APP.MEDIATOR.001)

Commands implement the pinned LiteBus command contract and dispatch through `ICommandMediator.SendAsync`. Queries implement the query contract and dispatch through `IQueryMediator.QueryAsync`.

Domain events remain package-free. Application reactions may implement LiteBus event handler contracts at the adapter boundary.

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

### Keep reactions explicit (APP.REACTIONS.001)

Place a reaction under the subject and triggering event. Name the handler for its action and event. Best-effort reactions run after the database commit. Durable reactions activate the outbox extension.

### Keep process coordinators at the Application boundary (APP.COORDINATOR.001)

Place a coordinator under the use case or reaction that starts the workflow. It sends public subject commands or calls narrow Application ports. It does not load or mutate another subject's aggregate to bypass that subject's command boundary.

Give a coordinator its own operation folder and result when it has a business outcome, retry policy, idempotency key, durable state, or operator action. Keep a stateless sequence in the initiating handler or reaction. Document the sequence in the critical journey and state the subject that owns each invariant.

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
  Posts/
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
    OnPostPublished/
      NotifySubscribersOnPostPublishedHandler.cs
      IPostPublicationNotifier.cs
```

Create `Shared` children only for types used by multiple subjects.

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

## Verification

- Confirm every operation folder maps to a documented use case.
- Confirm every command and query result, query result item, validator, and handler includes its full role suffix.
- Confirm handlers and validators are internal sealed.
- Confirm validators implement the pinned `ValidateAsync` contract.
- Confirm command handlers do not commit and query handlers do not use repositories.
- Confirm public ports contain no provider type.
- Confirm protected messages carry trusted actor context and handlers authorize their targets.
- Confirm expected failures have stable codes and no HTTP or provider types.
- Run Application and architecture tests.
