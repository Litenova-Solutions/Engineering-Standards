# Naming and Code Style

## Intent

Names should expose business intent and architectural role without requiring a reader to open the file. Fixed suffixes and file conventions reduce variation across agent sessions.

## Agent Summary {#agent-summary}

- Use one primary type per C# file and match the file name exactly.
- Use the required architectural suffix for commands, handlers, validators, endpoints, transport models, and persistence classes.
- Suffix every asynchronous method with `Async` and name its final token `cancellationToken`.
- Use business capability and use-case names across documentation and code.
- Use `sealed` implementation classes, file-scoped namespaces, braces, and explicit access modifiers.
- Avoid generic `Manager`, `Helper`, `Processor`, `Service`, and `Bus` names.

## Standards

### Match C# files and primary types (NAME.FILE.001)

Each C# file contains one primary type and uses that type's exact name. Small private nested types may remain with their owner.

`CreatePostHandler.cs` contains `CreatePostHandler`. Do not use `PostHandlers.cs` for multiple unrelated types.

### Use architectural suffixes (NAME.SUFFIX.001)

| Role | Pattern | Example |
|:---|:---|:---|
| Command message | `{Operation}Command` | `CreateDraftCommand` |
| Command result | `{Operation}Result` | `CreateDraftResult` |
| Query message | `{Operation}Query` | `GetPostQuery` |
| Query result | `{Subject}Result` | `PostResult` |
| List projection | `{Subject}Summary` | `PostSummary` |
| Handler | `{Operation}Handler` | `CreateDraftHandler` |
| Validator | `{Operation}Validator` | `CreateDraftValidator` |
| Domain event | `{BusinessFact}` | `PostPublished` |
| Event reaction | `{Action}On{Event}Handler` | `NotifySubscribersOnPostPublishedHandler` |
| Repository interface | `I{Aggregate}Repository` | `IPostRepository` |
| Repository implementation | `{Aggregate}Repository` | `PostRepository` |
| Endpoint | `{Operation}Endpoint` | `CreateDraftEndpoint` |
| Request model | `{Operation}Request` | `CreateDraftRequest` |
| Response model | `{Operation}Response` | `CreateDraftResponse` |
| API mapping class | `{Operation}Mappings` | `CreateDraftMappings` |
| Options class | `{Capability}Options` | `EmailOptions` |
| Persistence configuration | `{Type}Configuration` | `PostConfiguration` |
| Registration class | `{Layer}ServiceRegistration` | `InfrastructureServiceRegistration` |
| Assembly marker | `{Layer}AssemblyMarker` | `ApplicationAssemblyMarker` |

### Name asynchronous methods completely (NAME.ASYNC.001)

Every method returning `Task`, `Task<T>`, `ValueTask`, or `ValueTask<T>` uses the `Async` suffix. A cancellable method accepts `CancellationToken cancellationToken` as its final parameter and passes it to every cancellable dependency.

Do not shorten the parameter to `ct` in public or internal application code.

### Name exceptions by failed rule (NAME.EXCEPTION.001)

Domain exceptions use `{Subject}{Reason}Exception`, such as `PostAlreadyPublishedException`. Missing aggregates use `{Aggregate}NotFoundException`. Input validation errors use stable field and reason codes; create a custom exception type only when the exception hierarchy requires it.

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

Frontend capability and use-case folders use lowercase kebab-case. React component files and exported component names use PascalCase. Hooks use `use-{name}.ts` or `use-{name}.tsx`. Non-component modules use lowercase kebab-case unless a framework requires another name.

Next.js special files retain framework names such as `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`, and `route.ts`.

## Conventions

### Align business names across layers

The `Posts` capability maps to `Domain/Posts`, `Application/Posts`, `Endpoints/Posts`, `features/posts`, and `docs/domain/posts`. Use-case names retain the same verb and subject across layers.

### Keep namespaces aligned with folders

Namespaces start with the project name and follow folders beneath the project root. Do not include `src` or `apps` in a namespace.

### Avoid generic type names

Do not introduce `Manager`, `Helper`, `Processor`, `Common`, `Utility`, `BaseService`, `DataService`, or `MessageBus` when the type has a narrower responsibility.

`IPostPublicationNotifier` is preferred over `INotificationService`. `Slug.Create` is preferred over `StringHelper.ToSlug`.

## Examples

```csharp
namespace Example.Application.Posts.CreateDraft;

internal sealed class CreateDraftHandler(
    IPostRepository postRepository,
    IClock clock)
{
    public async Task<CreateDraftResult> HandleAsync(
        CreateDraftCommand command,
        CancellationToken cancellationToken)
    {
        // Operation code.
    }
}
```

## Verification

- Compare file names with primary types.
- Search for forbidden generic suffixes and unexplained base classes.
- Confirm async methods pass the full cancellation token.
- Confirm namespaces and business names align with folders.
- Run compiler and style checks with warnings treated as errors.
