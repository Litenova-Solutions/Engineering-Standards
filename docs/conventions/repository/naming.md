# Naming and Code Style

## Intent

Names should expose business intent and architectural role without requiring a reader to open the file. Fixed suffixes and file conventions reduce variation across agent sessions.

## Agent Summary {#agent-summary}

- Use one primary type per C# file and match the file name exactly.
- Use explicit command or query suffixes for Application messages, results, result items, handlers, and validators.
- Use explicit `RequestModel`, `ResponseModel`, and `ApiMappings` suffixes at the HTTP boundary.
- Use the required architectural suffix for endpoints and persistence classes.
- Suffix every asynchronous method with `Async` and name its final token `cancellationToken`.
- Use business subject and use-case names across documentation and code.
- Use `sealed` implementation classes, file-scoped namespaces, braces, and explicit access modifiers.
- Avoid generic `Manager`, `Helper`, `Processor`, `Service`, and `Bus` names.

## Standards

### Match C# files and primary types (NAME.FILE.001)

Each C# file contains one primary type and uses that type's exact name. Small private nested types may remain with their owner.

`CreatePostCommandHandler.cs` contains `CreatePostCommandHandler`. Do not use `PostHandlers.cs` for multiple unrelated types.

### Use architectural suffixes (NAME.SUFFIX.001)

| Role | Pattern | Example |
|:---|:---|:---|
| Command message | `{UseCase}Command` | `CreateDraftCommand` |
| Command result | `{UseCase}CommandResult` | `CreateDraftCommandResult` |
| Command handler | `{UseCase}CommandHandler` | `CreateDraftCommandHandler` |
| Command validator | `{UseCase}CommandValidator` | `CreateDraftCommandValidator` |
| Query message | `{UseCase}Query` | `GetPostQuery` |
| Query result | `{UseCase}QueryResult` | `GetPostQueryResult` |
| Query result item | `{UseCase}QueryResultItem` | `ListPostsQueryResultItem` |
| Query handler | `{UseCase}QueryHandler` | `GetPostQueryHandler` |
| Query validator | `{UseCase}QueryValidator` | `GetPostQueryValidator` |
| Domain event | `{BusinessFact}` | `PostPublished` |
| Event reaction | `{Action}On{Event}Handler` | `NotifySubscribersOnPostPublishedHandler` |
| Repository interface | `I{Aggregate}Repository` | `IPostRepository` |
| Repository implementation | `{Aggregate}Repository` | `PostRepository` |
| Endpoint | `{UseCase}Endpoint` | `CreateDraftEndpoint` |
| HTTP request model | `{UseCase}RequestModel` | `CreateDraftRequestModel` |
| HTTP response model | `{UseCase}ResponseModel` | `CreateDraftResponseModel` |
| HTTP response item model | `{UseCase}ResponseItemModel` | `ListPostsResponseItemModel` |
| HTTP pagination model | `PaginationModel` | `PaginationModel` |
| API mapping class | `{UseCase}ApiMappings` | `CreateDraftApiMappings` |
| Options class | `{ConfigurationPurpose}Options` | `EmailOptions` |
| Persistence configuration | `{PersistedType}Configuration` | `PostConfiguration` |
| Registration class | `{Layer}ServiceRegistration` | `InfrastructureServiceRegistration` |
| Assembly marker | `{Layer}AssemblyMarker` | `ApplicationAssemblyMarker` |

Do not shorten an Application type to `{UseCase}Result`, `{UseCase}Handler`, or `{UseCase}Validator`. Do not use an unowned name such as `PostSummary` for a query-specific result item. The full role suffix distinguishes command coordination from query projection without opening the file.

Do not shorten an HTTP transport type to `{UseCase}Request` or `{UseCase}Response`. `Model` marks the type as passive boundary data rather than an operation or rich business object. Other project-owned, passive HTTP DTOs also name their concrete role and end in `Model`, such as `ListPostsResponseItemModel` or `PaginationModel`. Use `ApiMappings` instead of the context-dependent `Mappings` suffix.

### Name asynchronous methods completely (NAME.ASYNC.001)

Every method returning `Task`, `Task<T>`, `ValueTask`, or `ValueTask<T>` uses the `Async` suffix. A cancellable method accepts `CancellationToken cancellationToken` as its final parameter and passes it to every cancellable dependency.

Do not shorten the parameter to `ct` in public or internal application code.

### Name exceptions by failed rule (NAME.EXCEPTION.001)

Domain exceptions use `{DomainType}{Reason}Exception`, such as `PostAlreadyPublishedException`. `DomainType` is the concrete aggregate, entity, value object, or domain service that rejects the rule. Missing aggregates use `{Aggregate}NotFoundException`. Input validation errors use stable field and reason codes; create a custom exception type only when the exception hierarchy requires it.

### Use intent-revealing boolean names (NAME.BOOLEAN.001)

Boolean properties and methods use `Is`, `Has`, `Can`, or a precise verb when those words fit. Use `IsPublished` and `CanPublish`, not `Published` or `CheckPublish`.

### Keep implementation style consistent (NAME.CSHARP.001)

C# production code uses:

- File-scoped namespaces.
- Braces for every conditional and loop body.
- Explicit access modifiers.
- `sealed` concrete classes unless inheritance is part of the design.
- `readonly` fields where mutation is unnecessary.
- Nullable reference types.
- PascalCase public members and types.
- `_camelCase` private fields.
- camelCase parameters and local variables.

### Use predictable frontend names (NAME.FRONTEND.001)

Frontend subject and use-case folders use lowercase kebab-case. React component files and exported component names use PascalCase. Hooks use `use-{name}.ts` or `use-{name}.tsx`. Non-component modules use lowercase kebab-case unless a framework requires another name.

Next.js special files retain framework names such as `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`, and `route.ts`.

## Conventions

### Align business names across layers

The `Posts` subject maps to `Domain/Posts`, `Application/Posts`, `Endpoints/Posts`, `features/posts`, and `docs/domain/subjects/posts`. Its primary Domain aggregate root is `Post`. Use-case names retain the same verb and subject across layers.

### Keep namespaces aligned with folders

Namespaces start with the project name and follow folders beneath the project root. Do not include `src` or `apps` in a namespace.

### Avoid generic type names

Do not introduce `Manager`, `Helper`, `Processor`, `Common`, `Utility`, `BaseService`, `DataService`, or `MessageBus` when the type has a narrower responsibility.

`IPostPublicationNotifier` is preferred over `INotificationService`. `Slug.Create` is preferred over `StringHelper.ToSlug`.

## Examples

```csharp
namespace Example.Application.Posts.CreateDraft;

internal sealed class CreateDraftCommandHandler(
    IPostRepository postRepository,
    IClock clock)
{
    public async Task<CreateDraftCommandResult> HandleAsync(
        CreateDraftCommand command,
        CancellationToken cancellationToken)
    {
        // Operation code.
    }
}
```

## Verification

- Compare file names with primary types.
- Confirm command and query results, query result items, handlers, and validators retain their full role suffixes.
- Confirm every passive HTTP DTO names its concrete boundary role and ends in `Model`; confirm operation mappings end in `ApiMappings`.
- Search for forbidden generic suffixes and unexplained base classes.
- Confirm async methods pass the full cancellation token.
- Confirm namespaces and business names align with folders.
- Run compiler and style checks with warnings treated as errors.
