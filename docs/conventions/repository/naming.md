# Naming and Code Style

## Intent

Names should expose business intent and architectural role without requiring a reader to open the file. Fixed suffixes and file conventions reduce variation across agent sessions.

## Agent Summary {#agent-summary}

- Use one primary top-level type per C# file, match the file name exactly, and never bundle types by kind in a `*Enums.cs` or `*ValueObjects.cs` file.
- Use explicit command or query suffixes for Application messages, results, result items, handlers, and validators.
- Use explicit `RequestModel`, `ResponseModel`, and `ApiMappings` suffixes at the HTTP boundary.
- Use the required architectural suffix for endpoints and persistence classes.
- Suffix every asynchronous method with `Async` and name its final token `cancellationToken`.
- Use business module and use-case names across documentation and code.
- Give each rejected rule its own exception type that owns its code and message; do not pass code or message strings into a shared exception.
- Use `sealed` implementation classes, file-scoped namespaces, braces, and explicit access modifiers.
- Prefer current language features: collection expressions, `init`/`required` members, `readonly`, primary constructors for dependency-only classes, and `switch` expressions over unions.
- Avoid generic `Manager`, `Helper`, `Processor`, `Service`, and `Bus` names.

## Standards

### Match C# files and primary types (NAME.FILE.001)

Each C# file contains one primary top-level type and uses that type's exact name. Only a small `private` or `file`-scoped nested type may remain with its owner. Two or more public or internal top-level types in one file are prohibited, including a set of related records, value objects, union cases, or exceptions.

`CreatePostCommandHandler.cs` contains `CreatePostCommandHandler`. Do not use `PostHandlers.cs` for multiple unrelated types.

Grouping-suffix files that collect several types by kind rather than by name are prohibited: `RefundEnums.cs`, `PaymentEnums.cs`, `CancellationValueObjects.cs`, and `OrderStates.cs` each place two or more public types in one file. Split each type into its own file named for the type, and let the module folder provide the grouping. A discriminated union places its abstract base and each sealed case in separate files, exactly as a state hierarchy does.

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
| Event handler | `{Action}On{Event}Handler` | `NotifySubscribersOnPostPublishedHandler` |
| Workflow | `{BusinessPurpose}Workflow` | `OrderFulfillmentWorkflow` |
| Workflow state | `{BusinessPurpose}WorkflowState` | `OrderFulfillmentWorkflowState` |
| Workflow Orchestrator | `{BusinessPurpose}WorkflowOrchestrator` | `OrderFulfillmentWorkflowOrchestrator` |
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

Each distinct rule has its own exception type, and that type owns its stable failure code and message. An exception constructor accepts only the domain values of the specific failure, never a `code` or `message` string supplied by the throwing type. A shared `{DomainType}RuleException(code, message)` constructed with hard-coded strings at the call site is prohibited. See `DOMAIN.ERROR.001`.

`Exception` is reserved for the type that rejects a rule. Do not use it as a domain business term for an anomaly, a discrepancy, or a case that needs manual handling, because it collides with `System.Exception` and the project `DomainException`, and a name such as `CancellationExceptionRaisedEvent` then reads as a thrown exception rather than a business fact. Name the business concept with a domain word, such as `CancellationDiscrepancy`, `PaidCapacityShortfall`, or `RefundHold`, and reserve the `Exception` suffix for `{DomainType}{Reason}Exception` failure types.

### Use intent-revealing boolean names (NAME.BOOLEAN.001)

Boolean properties and methods use `Is`, `Has`, `Can`, or a precise verb when those words fit. Use `HasLines` and `CanPublish`, not `LinesPresent` or `CheckPublish`.

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

### Use current language features (NAME.CSHARP.002)

Production code targets the pinned language version and prefers the current, more precise construct over an older equivalent:

- Collection expressions `[]` and `[.. source]` for array, list, and span creation and copying, instead of `new List<T>()`, `Array.Empty<T>()`, or `.ToList()` initializers.
- `init` accessors and `required` members for values that are set once at construction and never mutated, instead of a public setter or a setter left mutable by habit.
- `readonly` on every field and struct that is not reassigned after construction.
- Primary constructors for dependency-only classes such as handlers and services, instead of a constructor that only assigns fields.
- Target-typed `new` where the type is already stated on the left.
- `switch` expressions and type patterns over a discriminated union, instead of an `enum` switch or an `if` ladder on a discriminator. A closed-union `switch` includes a `_` arm that throws the union's unsupported-case exception.
- `is null` and `is not null` for reference checks.

Do not adopt a feature that reduces clarity. A collection expression that hides an intended defensive copy, or a primary constructor on a type with real construction logic, is not an improvement. The rule prefers the modern construct where it is at least as clear, not in every position.

### Use predictable frontend names (NAME.FRONTEND.001)

Frontend module and use-case folders use lowercase kebab-case. React component files and exported component names use PascalCase. Hooks use `use-{name}.ts` or `use-{name}.tsx`. Non-component files use lowercase kebab-case unless a framework requires another name.

Next.js special files retain framework names such as `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`, and `route.ts`.

## Conventions

### Align business names across layers

The Posts module maps to `Domain/Posts`, `Application/Posts`, `Endpoints/Posts`, `features/posts`, and `docs/domain/modules/posts`. A single-aggregate module keeps its aggregate flat in the module folder; a module with more than one aggregate gives each aggregate its own folder, per `ARCH.MODULES.001`. Use-case names retain the same verb and module across layers.

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

- Compare file names with primary types and confirm no file declares more than one public or internal top-level type.
- Confirm no `*Enums.cs` or `*ValueObjects.cs` grouping file remains.
- Confirm each rejected rule has its own exception type that owns its code and message, with no caller-supplied strings.
- Confirm no domain type, event, or business concept uses `Exception` as a business term, and that the `Exception` suffix names only failure types.
- Confirm command and query results, query result items, handlers, and validators retain their full role suffixes.
- Confirm every passive HTTP DTO names its concrete boundary role and ends in `Model`; confirm operation mappings end in `ApiMappings`.
- Search for forbidden generic suffixes and unexplained base classes.
- Confirm async methods pass the full cancellation token.
- Confirm namespaces and business names align with folders.
- Run compiler and style checks with warnings treated as errors.
