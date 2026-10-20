# Naming and Code Style

## Intent

Names should expose business intent and architectural role without requiring a reader to open the file. Fixed suffixes and file conventions reduce variation across agent sessions.

## Agent Summary {#agent-summary}

- One primary type per C# file, named for the file. (litespec/rule/workspace-naming.match-c-files-and-primary-types)
- Aggregate-owned types lead with their aggregate root name. (litespec/rule/workspace-naming.anchor-aggregate-owned-types-on-the-aggregate-root)
- Architectural roles carry their declared suffix. (litespec/rule/workspace-naming.use-architectural-suffixes)
- Async methods end in Async and take the token last. (litespec/rule/workspace-naming.name-asynchronous-methods-completely)
- Exception names state the failed rule and its owner. (litespec/rule/workspace-naming.name-exceptions-by-failed-rule)
- Boolean names read as conditions. (litespec/rule/workspace-naming.use-intent-revealing-boolean-names)
- Production C# follows the declared style rules. (litespec/rule/workspace-naming.keep-implementation-style-consistent)
- Code uses the pinned language version's current constructs. (litespec/rule/workspace-naming.use-current-language-features)
- Frontend names follow one predictable case mapping. (litespec/rule/workspace-naming.use-predictable-frontend-names)

## Standards

### Match C# files and primary types (litespec/rule/workspace-naming.match-c-files-and-primary-types)

**Requirement:** A C# file MUST contain one primary top-level type and take that type's exact name.

**Rationale:** Only a small private or file-scoped nested type stays with its owner. Two public or internal top-level types belong in two files.

### Anchor aggregate-owned types on the aggregate root (litespec/rule/workspace-naming.anchor-aggregate-owned-types-on-the-aggregate-root)

**Requirement:** An aggregate-owned type's qualified name MUST start with its aggregate root's full name.

**Rationale:** The name then reveals its owner without folder context. This covers events, states, child entities, values, and discriminated unions. A type nested inside a declaring type inherits that type's prefix through its qualified name. `PostState.Published` therefore satisfies this rule, and `PostStatePublishedState` repeats the anchor twice.

**Example:** `PostPublishedEvent` and `PostState.Published` both lead with `Post`. `PublishedState` declared at namespace level does not.

### Use architectural suffixes (litespec/rule/workspace-naming.use-architectural-suffixes)

**Requirement:** An architectural type MUST carry the suffix its role assigns in the table in this section.

**Example:**

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
| Aggregate state base | `{Aggregate}State` | `PostState` |
| Aggregate state case, flat | `{Aggregate}{State}State` | `PostPublishedState` |
| Aggregate state case, nested | `{Aggregate}State.{State}` | `PostState.Published` |
| Domain event | `{Aggregate}{PastFact}Event` | `PostPublishedEvent` |
| Event handler | `{Action}On{PastFact}Handler` | `NotifySubscribersOnPostPublishedHandler` |
| Repository interface | `I{Aggregate}Repository` | `IPostRepository` |
| Repository implementation | `{Aggregate}Repository` | `PostRepository` |
| Endpoint | `{UseCase}Endpoint` | `CreateDraftEndpoint` |
| HTTP request model | `{UseCase}RequestModel` | `CreateDraftRequestModel` |
| HTTP response model | `{UseCase}ResponseModel` | `CreateDraftResponseModel` |
| HTTP response item model | `{UseCase}ResponseItemModel` | `ListPostsResponseItemModel` |
| HTTP pagination model | `PaginationModel` | `PaginationModel` |
| Polymorphic transport model base | `{Concept}Model` | `FulfillmentOutcomeModel` |
| Polymorphic transport model case | `{Case}{Concept}Model` | `ShippedFulfillmentOutcomeModel` |
| API mapping class | `{UseCase}ApiMappings` | `CreateDraftApiMappings` |
| Options class | `{ConfigurationPurpose}Options` | `EmailOptions` |
| Persistence configuration | `{PersistedType}Configuration` | `PostConfiguration` |
| Registration class | `{Layer}ServiceRegistration` | `InfrastructureServiceRegistration` |
| Assembly marker | `{Layer}AssemblyMarker` | `ApplicationAssemblyMarker` |

An event-reaction folder names the business fact after an `On` prefix. It omits the `Event` suffix. For example, `OnPostPublished` contains `NotifySubscribersOnPostPublishedHandler` for `PostPublishedEvent`. The `On` prefix already marks the reaction. Folder names carry no technical suffix, so `OnPostPublishedEvent` is wrong. The event type keeps its `Event` suffix (`litespec/rule/workspace-naming.anchor-aggregate-owned-types-on-the-aggregate-root`).

The example does not shorten an Application type to `{UseCase}Result`, `{UseCase}Handler`, or `{UseCase}Validator`. The example does not use an unowned name such as `PostSummary` for a query-specific result item. The full role suffix distinguishes command coordination from query projection without opening the file.

The example does not shorten an HTTP transport type to `{UseCase}Request` or `{UseCase}Response`. `Model` marks the type as passive boundary data rather than an operation or rich business object. Other project-owned, passive HTTP DTOs also name their concrete role and end in `Model`, such as `ListPostsResponseItemModel` or `PaginationModel`. The example uses `ApiMappings` instead of the context-dependent `Mappings` suffix.

A polymorphic transport model mirrors a Domain discriminated union (`litespec/rule/backend-api.mirror-a-domain-closed-set-as-a-transport-model-of-the-same-shape`). Its abstract base names the concept. Each sealed case names its case. Both end in `Model`, such as `FulfillmentOutcomeModel` and `ShippedFulfillmentOutcomeModel`.

The transport name drops the Domain union's aggregate prefix, such as `OrderFulfillmentOutcome`. Its discriminator string keeps the Domain union's stable case code unchanged.

### Name asynchronous methods completely (litespec/rule/workspace-naming.name-asynchronous-methods-completely)

**Requirement:** A method returning `Task` or `ValueTask` MUST end in `Async` and take `CancellationToken cancellationToken` last when cancellable.

**Rationale:** A caller then sees both the asynchrony and the cancellation contract from the signature. A method is cancellable when it performs I/O or awaits.

### Name exceptions by failed rule (litespec/rule/workspace-naming.name-exceptions-by-failed-rule)

**Requirement:** An exception name MUST state the rule that failed, using `{DomainType}{Reason}Exception` for a Domain rejection.

**Rationale:** `DomainType` is the aggregate root or an anchored owned type, so the name always starts with the aggregate root.

### Use intent-revealing boolean names (litespec/rule/workspace-naming.use-intent-revealing-boolean-names)

**Requirement:** A boolean property or method MUST use `Is`, `Has`, `Can`, or a precise verb.

**Rationale:** `HasLines` and `CanPublish` state a condition. `LinesPresent` and `CheckPublish` state neither a question nor an answer.

### Keep implementation style consistent (litespec/rule/workspace-naming.keep-implementation-style-consistent)

**Requirement:** Production C# MUST use file-scoped namespaces, braces on every body, explicit access modifiers, and sealed concrete classes.

**Rationale:** These are the style decisions that change diff readability rather than behavior, so one setting removes the debate.

### Use current language features (litespec/rule/workspace-naming.use-current-language-features)

**Requirement:** Production code MUST target the pinned language version and use its current construct over an older equivalent.

**Rationale:** Collection expressions, pattern matching, and primary constructors express the same intent with less incidental code.

### Use predictable frontend names (litespec/rule/workspace-naming.use-predictable-frontend-names)

**Requirement:** A frontend folder MUST use kebab-case, a component file and its export PascalCase, and a React hook file `use-{name}`.

**Rationale:** One predictable mapping lets a reader move between the documentation tree and the source tree without translation.

## Conventions

### Align business names across layers (litespec/rule/workspace-naming.align-business-names-across-layers)

**Default:** Use one business name for a module across Domain, Application, endpoints, features, and documentation.

**Replacement:** A consumer departs from this default only through an Exception record naming this provision, with a reason and a review date.

**Rationale:** The Posts module maps to `Domain/Posts`, `features/posts`, and `docs/domain/modules/posts` without translation.

### Keep namespaces aligned with folders (litespec/rule/workspace-naming.keep-namespaces-aligned-with-folders)

**Default:** Start a namespace with the project name and follow the folders beneath the project root.

**Replacement:** A consumer departs from this default only through an Exception record naming this provision, with a reason and a review date.

**Rationale:** Including `src` or `apps` in a namespace couples the type name to a workspace layout decision. The project root is the directory holding the project file, so every folder above it is outside the namespace.

### Avoid generic type names (litespec/rule/workspace-naming.avoid-generic-type-names)

**Default:** Avoid `Manager`, `Helper`, `Processor`, `Common`, `Utility`, `BaseService`, `DataService`, `MessageBus`, `Engine`, `Facade`, `Wrapper`, and `Factory` when a narrower name exists.

**Replacement:** A consumer departs from this default only through an Exception record naming this provision, with a reason and a review date.

**Rationale:** A generic name invites unrelated responsibility, because nothing in it excludes the next addition. `Factory` is generic on a class and exact on a named static aggregate factory method, so the default names the class and not the method.

### Derive boundary names from the ubiquitous term (litespec/rule/workspace-naming.derive-boundary-names-from-the-ubiquitous-term)

**Default:** Derive route segments and JSON field names from the current aggregate or ubiquitous term.

**Replacement:** A consumer departs from this default only through an Exception record naming this provision, with a reason and a review date.

**Rationale:** Renaming a Domain concept then renames its boundary names, so the contract and the language stay aligned.

## Reference example

This informative example demonstrates `litespec/rule/workspace-naming.match-c-files-and-primary-types`, `litespec/rule/workspace-naming.use-architectural-suffixes`, and `litespec/rule/workspace-naming.keep-namespaces-aligned-with-folders`.

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

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/rule/workspace-naming.match-c-files-and-primary-types | guidance | Does each C# file declare one primary type matching its file name? |
| litespec/rule/workspace-naming.anchor-aggregate-owned-types-on-the-aggregate-root | guidance | Does each aggregate-owned type name begin with its aggregate root name? |
| litespec/rule/workspace-naming.use-architectural-suffixes | guidance | Does each architectural type carry the suffix its role requires? |
| litespec/rule/workspace-naming.name-asynchronous-methods-completely | guidance | Does each task-returning method end in Async with the token last when cancellable? |
| litespec/rule/workspace-naming.name-exceptions-by-failed-rule | guidance | Does each Domain exception name lead with its root and name its reason? |
| litespec/rule/workspace-naming.use-intent-revealing-boolean-names | guidance | Does each boolean member use an intent-revealing prefix or verb? |
| litespec/rule/workspace-naming.keep-implementation-style-consistent | guidance | Does production C# use file-scoped namespaces, braces, explicit modifiers, and sealed classes? |
| litespec/rule/workspace-naming.use-current-language-features | guidance | Does production code target the pinned language version with current constructs? |
| litespec/rule/workspace-naming.use-predictable-frontend-names | guidance | Does each frontend follow the folder, component, and hook naming form? |
| litespec/rule/workspace-naming.align-business-names-across-layers | guidance | Does one business name span each module across layers and documentation? |
| litespec/rule/workspace-naming.keep-namespaces-aligned-with-folders | guidance | Does each namespace match its folder path beneath the project root? |
| litespec/rule/workspace-naming.avoid-generic-type-names | guidance | Does each type name avoid the generic names this rule lists when a narrower name exists? |
| litespec/rule/workspace-naming.derive-boundary-names-from-the-ubiquitous-term | guidance | Does each route segment and field name derive from its current ubiquitous term? |
