# Naming and Code Style

## Intent


Names should expose business intent and architectural role without requiring a reader to open the file. Fixed suffixes and file conventions reduce variation across agent sessions.

## Agent Summary {#agent-summary}


- One primary type per C# file, named for the file. (WORKSPACE.NAMING.FILE.001)
- Aggregate-owned types lead with their aggregate root name. (WORKSPACE.NAMING.AGGREGATE.001)
- Architectural roles carry their declared suffix. (WORKSPACE.NAMING.SUFFIX.001)
- Async methods end in Async and take the token last. (WORKSPACE.NAMING.ASYNC.001)
- Exception names state the failed rule and its owner. (WORKSPACE.NAMING.EXCEPTION.001)
- Boolean names read as conditions. (WORKSPACE.NAMING.BOOLEAN.001)
- Production C# follows the declared style rules. (WORKSPACE.NAMING.CSHARP.001)
- Code uses the pinned language version's current constructs. (WORKSPACE.NAMING.CSHARP.002)
- Frontend names follow one predictable case mapping. (WORKSPACE.NAMING.FRONTEND.001)

## Standards


### Match C# files and primary types (WORKSPACE.NAMING.FILE.001)

**Requirement:** A C# file MUST contain one primary top-level type and take that type's exact name.

**Rationale:** Only a small private or file-scoped nested type stays with its owner. Two public or internal top-level types belong in two files.

### Anchor aggregate-owned types on the aggregate root (WORKSPACE.NAMING.AGGREGATE.001)

**Requirement:** An aggregate-owned type MUST start with its aggregate root's full name.

**Rationale:** The name then reveals its owner without folder context. This covers events, states, child entities, values, and discriminated unions.

### Use architectural suffixes (WORKSPACE.NAMING.SUFFIX.001)

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
| Domain event | `{Aggregate}{PastFact}Event` | `PostPublishedEvent` |
| Event handler | `{Action}On{PastFact}Handler` | `NotifySubscribersOnPostPublishedHandler` |
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
| Polymorphic transport model base | `{Concept}Model` | `RefundOutcomeModel` |
| Polymorphic transport model case | `{Case}{Concept}Model` | `RefundSucceededOutcomeModel` |
| API mapping class | `{UseCase}ApiMappings` | `CreateDraftApiMappings` |
| Options class | `{ConfigurationPurpose}Options` | `EmailOptions` |
| Persistence configuration | `{PersistedType}Configuration` | `PostConfiguration` |
| Registration class | `{Layer}ServiceRegistration` | `InfrastructureServiceRegistration` |
| Assembly marker | `{Layer}AssemblyMarker` | `ApplicationAssemblyMarker` |

An event-reaction folder names the business fact after an `On` prefix. It omits the `Event` suffix. For example, `OnPostPublished` contains `NotifySubscribersOnPostPublishedHandler` for `PostPublishedEvent`. The `On` prefix already marks the reaction. Folder names carry no technical suffix, so `OnPostPublishedEvent` is wrong. The event type keeps its `Event` suffix (`WORKSPACE.NAMING.AGGREGATE.001`).

The example does not shorten an Application type to `{UseCase}Result`, `{UseCase}Handler`, or `{UseCase}Validator`. The example does not use an unowned name such as `PostSummary` for a query-specific result item. The full role suffix distinguishes command coordination from query projection without opening the file.

The example does not shorten an HTTP transport type to `{UseCase}Request` or `{UseCase}Response`. `Model` marks the type as passive boundary data rather than an operation or rich business object. Other project-owned, passive HTTP DTOs also name their concrete role and end in `Model`, such as `ListPostsResponseItemModel` or `PaginationModel`. The example uses `ApiMappings` instead of the context-dependent `Mappings` suffix.

A polymorphic transport model mirrors a Domain discriminated union (`BACKEND.API.MODELS.001`). Its abstract base names the concept. Each sealed case names its case. Both end in `Model`, such as `RefundOutcomeModel` and `RefundSucceededOutcomeModel`.

The transport name drops the Domain union's aggregate prefix, such as `PaymentRefundOutcome`. Its discriminator string keeps the Domain union's stable case code unchanged.

### Name asynchronous methods completely (WORKSPACE.NAMING.ASYNC.001)

**Requirement:** A method returning `Task` or `ValueTask` MUST end in `Async` and take `CancellationToken cancellationToken` last when cancellable.

**Rationale:** A caller then sees both the asynchrony and the cancellation contract from the signature.

### Name exceptions by failed rule (WORKSPACE.NAMING.EXCEPTION.001)

**Requirement:** An exception name MUST state the rule that failed, using `{DomainType}{Reason}Exception` for a Domain rejection.

**Rationale:** `DomainType` is the aggregate root or an anchored owned type, so the name always starts with the aggregate root.

### Use intent-revealing boolean names (WORKSPACE.NAMING.BOOLEAN.001)

**Requirement:** A boolean property or method MUST use `Is`, `Has`, `Can`, or a precise verb.

**Rationale:** `HasLines` and `CanPublish` state a condition. `LinesPresent` and `CheckPublish` state neither a question nor an answer.

### Keep implementation style consistent (WORKSPACE.NAMING.CSHARP.001)

**Requirement:** Production C# MUST use file-scoped namespaces, braces on every body, explicit access modifiers, and sealed concrete classes.

**Rationale:** These are the style decisions that change diff readability rather than behavior, so one setting removes the debate.

### Use current language features (WORKSPACE.NAMING.CSHARP.002)

**Requirement:** Production code MUST target the pinned language version and use its current construct over an older equivalent.

**Rationale:** Collection expressions, pattern matching, and primary constructors express the same intent with less incidental code.

### Use predictable frontend names (WORKSPACE.NAMING.FRONTEND.001)

**Requirement:** A frontend folder MUST use kebab-case, a component file and export PascalCase, and a hook file `use-{name}`.

**Rationale:** One predictable mapping lets a reader move between the documentation tree and the source tree without translation.

## Conventions


### Align business names across layers (WORKSPACE.NAMING.CONVENTION.001)

**Default:** Use one business name for a module across Domain, Application, endpoints, features, and documentation.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** The Posts module maps to `Domain/Posts`, `features/posts`, and `docs/domain/modules/posts` without translation.

### Keep namespaces aligned with folders (WORKSPACE.NAMING.CONVENTION.002)

**Default:** Start a namespace with the project name and follow the folders beneath the project root.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Including `src` or `apps` in a namespace couples the type name to a workspace layout decision.

### Avoid generic type names (WORKSPACE.NAMING.CONVENTION.003)

**Default:** Avoid `Manager`, `Helper`, `Processor`, `Common`, `Utility`, `BaseService`, `DataService`, and `MessageBus` when a narrower name exists.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A generic name invites unrelated responsibility, because nothing in it excludes the next addition.

### Derive boundary names from the ubiquitous term (WORKSPACE.NAMING.CONVENTION.004)

**Default:** Derive route segments and JSON field names from the current aggregate or ubiquitous term.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Renaming a Domain concept then renames its boundary names, so the contract and the language stay aligned.

## Reference example

This informative example demonstrates `WORKSPACE.NAMING.FILE.001`, `WORKSPACE.NAMING.SUFFIX.001`, and `WORKSPACE.NAMING.CONVENTION.002`.

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


| ID | Method | Evidence |
|:---|:---|:---|
| WORKSPACE.NAMING.FILE.001 | inspection | `NamingTests` asserts each C# file declares one primary top-level type matching its file name. |
| WORKSPACE.NAMING.AGGREGATE.001 | inspection | `NamingTests` asserts each aggregate-owned type name begins with its aggregate root name. |
| WORKSPACE.NAMING.SUFFIX.001 | inspection | `NamingTests` asserts each architectural type carries the suffix its role requires. |
| WORKSPACE.NAMING.ASYNC.001 | static | `NamingTests` asserts each task-returning method ends in `Async` with the cancellation token last. |
| WORKSPACE.NAMING.EXCEPTION.001 | static | `NamingTests` asserts each Domain exception name leads with its aggregate root and names its reason. |
| WORKSPACE.NAMING.BOOLEAN.001 | inspection | `NamingTests` asserts each boolean member uses an intent-revealing prefix or verb. |
| WORKSPACE.NAMING.CSHARP.001 | inspection | The Release build enforces the style rules through analyzer warnings promoted to errors. |
| WORKSPACE.NAMING.CSHARP.002 | inspection | The Release build enforces the language version and modern-construct analyzers as errors. |
| WORKSPACE.NAMING.FRONTEND.001 | inspection | `node standards/tools/validate-ui.mjs` reports a frontend path or export that breaks the naming form. |
| WORKSPACE.NAMING.CONVENTION.001 | inspection | Module review compares each layer folder name against the module identifier. |
| WORKSPACE.NAMING.CONVENTION.002 | inspection | `NamingTests` asserts each namespace matches its folder path beneath the project root. |
| WORKSPACE.NAMING.CONVENTION.003 | inspection | `NamingTests` reports each generic boundary name for review against a narrower alternative. |
| WORKSPACE.NAMING.CONVENTION.004 | inspection | Boundary review compares each route segment and field name against its current ubiquitous term. |
