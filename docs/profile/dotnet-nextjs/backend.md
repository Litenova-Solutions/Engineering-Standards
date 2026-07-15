---
{
  "id": "profile.dotnet-nextjs.backend",
  "kind": "profile",
  "normative": true,
  "appliesTo": ["backend.application", "backend.infrastructure", "backend.api"],
  "recipes": []
}
---
# Backend

## Agent Quick Rules {#agent-quick-rules}

- Dispatch writes through `ICommandMediator` and reads through `IQueryMediator`.
- Write through aggregate repositories backed by scoped `IDocumentSession`.
- Read through direct `IQuerySession` projections.
- Commit once in the global LiteBus command pipeline.
- Use Minimal API `IEndpoint` classes and stable Problem Details codes.
- Generate and commit OpenAPI when a frontend consumes the API.

## APP.MEDIATOR.001 - Use specific LiteBus entrypoints

Endpoints and reactions dispatch through `ICommandMediator`, `IQueryMediator`, or `IEventPublisher`. Do not introduce a unified message bus abstraction.

Commands implement the LiteBus command contract. Queries implement the query contract. Domain events remain plain Domain records without a LiteBus marker.

## APP.CONTRACTS.001 - Co-locate public messages and internal handlers

Place each command or query beside its validator, handler, and result. The message and result are public when WebApi or another host uses them. The handler and validator remain internal.

Use one Application `ValidationError` record for command and query validation. Do not duplicate it by read and write side.

## APP.VALIDATION.001 - Separate input validation from invariants

LiteBus validators check structural input before the handler runs. They return or throw the profile's command or query validation exception with structured errors.

Aggregates enforce business invariants. A validator can reject an empty title. The aggregate owns whether the current post state permits changing that title.

## PERSIST.WRITE.001 - Stage aggregate writes through repositories

Domain owns aggregate repository interfaces. Infrastructure implements them with a scoped Marten `IDocumentSession`.

Repositories load and store aggregates. They do not commit. Command handlers do not inject `IDocumentSession` directly.

## PERSIST.READ.001 - Query through IQuerySession

Application query handlers inject Marten `IQuerySession` directly and project to result records.

Do not add `IDatabaseContext`, `IReadDatabase`, callback wrappers, per-aggregate read stores, or repositories for query projections.

Example:

```csharp
internal sealed class GetPostHandler(IQuerySession session)
    : IQueryHandler<GetPostQuery, PostResult?>
{
    public Task<PostResult?> HandleAsync(
        GetPostQuery query,
        CancellationToken cancellationToken) =>
        session.Query<Post>()
            .Where(post => post.Id == query.PostId)
            .Select(post => new PostResult(post.Id, post.Title))
            .SingleOrDefaultAsync(cancellationToken);
}
```

## PERSIST.COMMIT.001 - Commit once in the command pipeline

A global LiteBus command post-handler calls `IDocumentSession.SaveChangesAsync` after the command handler succeeds. A failed command leaves the scoped session uncommitted and disposal discards pending work.

Do not add a transaction pre-handler for Marten's normal single-session write. Marten creates the database transaction during `SaveChangesAsync`.

## PERSIST.EVENTS.001 - Collect events without a public unit of work

Infrastructure repositories register touched aggregates with an internal scoped `DomainEventBuffer`. The commit handler collects their domain events.

For best-effort in-process handling:

1. Stage aggregate changes.
2. Collect domain events.
3. Commit the Marten session.
4. Publish events through LiteBus.

A failure in step 4 occurs after the database commit and may require manual retry. Use the outbox-worker recipe when loss is unacceptable.

## API.ENDPOINTS.001 - Use one Minimal API endpoint per operation

Each endpoint implements `IEndpoint`, maps one route, converts transport input to an Application message, and dispatches through the specific mediator.

Endpoints cannot contain business rules, access repositories, or catch application exceptions. Global exception handling maps known failures.

## API.ACTOR.001 - Derive the actor from claims

When the authenticated user is the actor, read the actor ID from trusted claims. Do not accept it from a body, form, route, or query parameter.

An administrator acting on another account uses a distinct target ID and an authorization policy. The authenticated administrator ID still comes from claims.

## API.ERRORS.001 - Return stable Problem Details

Return RFC Problem Details fields plus these extensions:

- `code`: stable application error code.
- `traceId`: current distributed trace identifier.
- `errors`: structured validation errors with field, code, and message.

Map validation to 400, unauthenticated access to 401, forbidden access to 403, missing resources to 404, and state or concurrency conflicts to 409. Do not expose exception messages or stack traces.

## API.OPENAPI.001 - Treat OpenAPI as a generated contract

Generate OpenAPI during the Release build. Commit the artifact when a frontend or external consumer uses it. Regenerate TypeScript types in the same change and fail CI when committed output differs.

Scalar may expose the document in Development. Do not expose development API tooling by default in deployed environments.

## CONFIG.OPTIONS.001 - Bind and validate options

Bind configuration sections to options classes and validate them during startup. Do not read required values through `configuration["Key"]!`.

## DB.NAMING.001 - Use PostgreSQL snake_case

Store table, column, index, and constraint names in `snake_case`. Keep .NET names in normal PascalCase or camelCase. Marten document aliases and custom indexes follow the database rule.
