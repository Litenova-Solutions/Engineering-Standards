# Naming and Code Style

## Intent


Names should expose business intent and architectural role without requiring a reader to open the file. Fixed suffixes and file conventions reduce variation across agent sessions.

## Agent Summary {#agent-summary}


- Match C# files and primary types. (NAME.FILE.001)
- Anchor aggregate-owned types on the aggregate root. (NAME.AGGREGATE.001)
- Use architectural suffixes. (NAME.SUFFIX.001)
- Name asynchronous methods completely. (NAME.ASYNC.001)
- Name exceptions by failed rule. (NAME.EXCEPTION.001)
- Use intent-revealing boolean names. (NAME.BOOLEAN.001)
- Keep implementation style consistent. (NAME.CSHARP.001)
- Use current language features. (NAME.CSHARP.002)
- Use predictable frontend names. (NAME.FRONTEND.001)

## Standards


### Match C# files and primary types (NAME.FILE.001)

**Requirement:** Repositories MUST match C# files and primary types.

**Rationale:** Each C# file contains one primary top-level type and uses that type's exact name. Only a small `private` or `file`-scoped nested type may remain with its owner. Two or more public or internal top-level types in one file are prohibited, including a set of related records, value objects, union cases, or exceptions.

`CreatePostCommandHandler.cs` contains `CreatePostCommandHandler`. The implementation does not use `PostHandlers.cs` for multiple unrelated types.

Grouping-suffix files that collect types by kind are prohibited. Examples include `RefundEnums.cs`, `PaymentEnums.cs`, `CancellationValueObjects.cs`, and `OrderStates.cs`. Each type has a same-named file. The module folder provides grouping. A discriminated union places its base and each sealed case in separate files, like a state hierarchy.

### Anchor aggregate-owned types on the aggregate root (NAME.AGGREGATE.001)

**Requirement:** Repositories MUST anchor aggregate-owned types on the aggregate root.

**Rationale:** Every aggregate-owned type starts with that aggregate root's full name. Its name reveals its owner without folder context. This rule covers events, states, child entities, aggregate values, discriminated unions, and exceptions.

The name is `{Aggregate}{Specific}{RoleSuffix}`:

- `{Aggregate}` is the aggregate root's full type name, never an abbreviation or partial form. An aggregate named `SalesCatalog` anchors `SalesCatalogPublishedEvent`, not `SalesPublishedEvent` or `CatalogPublishedEvent`.
- `{Specific}` is the fact, state, rule, or case in domain language. When it would repeat the aggregate name it is not doubled: a `SalesCatalog` publication is `SalesCatalogPublishedEvent`, not `SalesCatalogSalesCatalogPublishedEvent`.
- `{RoleSuffix}` is the fixed suffix for the kind: `Event`, `State`, or `Exception`. Child entities and value objects carry no suffix. A union case ends with its concept.

The prefix chains to the aggregate root, not to an intermediate owner. A value object `FinanceAssurance` owned by the `Event` aggregate is `EventFinanceAssurance`, and its rejection is `EventFinanceAssuranceMislabeledException`, so both resolve to `Event`.

A child entity with a first-class Domain name is an anchor. A child entity normally uses `{Aggregate}{Part}`, such as `OrderLine`. It keeps a standalone term when that term is first-class, such as a `CapacityPool` child named `Reservation`. The child entity then anchors its states and unions. `Reservation` names `ReservationHeldState` and `ReservationConfirmOutcome`, never `CapacityPoolReservationHeldState`. Chaining stops at the nearest entity carrying identity.

When the concept already embeds the aggregate name, reorder the case so the aggregate leads exactly once rather than doubling it. A `Suppression` basis is `SuppressionLegalBasis`, not `LegalSuppressionBasis` (owner not derivable) nor `SuppressionLegalSuppressionBasis` (doubled). A `Role` scope is `RoleEventScope`, not `EventRoleScope`. When the reason trails with the aggregate noun, drop the repeat there too: an insufficient-capacity failure on the `Capacity` aggregate is `CapacityInsufficientException`, not `CapacityInsufficientCapacityException`.

The anchor is the aggregate root, not the module. A type starts with its aggregate when module and aggregate names differ. For example, `Inventory` uses `ReservationNotFoundException`, not `InventoryReservationNotFoundException`. `Catalogs` uses `CatalogNotReadyException`, not `CatalogsNotReadyException`.

The folder path already carries the module. Failure codes remain module-scoped as `{MODULE}.{REASON}`, such as `INVENTORY.RESERVATION_NOT_FOUND`. The module lives in the code, and the aggregate lives in the type name.

A module identity appears in four places. It owns the folder and namespace, failure-code prefix, invariant-ID prefix, and use-case ID prefix. Rename all four together.

Renaming only an aggregate leaves the module identity unchanged. The `inventory` token remains when `CapacityPool` becomes `Capacity`. A module rename preserves each numeric suffix.

| Kind | Pattern | Example |
|:---|:---|:---|
| Event | `{Aggregate}{PastFact}Event` | `OrganizationMemberAccessChangedEvent` |
| State base | `{Aggregate}State` | `OrderState` |
| State case | `{Aggregate}{State}State` | `OrderCompletedState` |
| Child entity | `{Aggregate}{Part}` | `OrderLine` |
| Aggregate value object | `{Aggregate}{Term}` | `OrganizationLegalProfile` |
| Union base | `{Aggregate}{Concept}` | `RefundOutcome` |
| Union case | `{Aggregate}{Case}{Concept}` | `RefundSucceededOutcome` |
| Exception | `{DomainType}{Reason}Exception` | `OrderNotFulfillableException` |

Shared kernel types are the only exception. A type in `Shared/` used by more than one aggregate keeps its bare domain name: `Money`, `EmailAddress`, `Currency`, `Address`, `DateRange`. Location is the signal. A type in an aggregate's folder is anchored and a type in `Shared/` is not.

Aggregate-first ordering clusters one aggregate's types in sorted folder and symbol lists. It also gives agents one deterministic token for generation and search.

### Use architectural suffixes (NAME.SUFFIX.001)

**Requirement:** Repositories MUST use architectural suffixes.

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

An event-reaction folder names the business fact after an `On` prefix. It omits the `Event` suffix. For example, `OnPostPublished` contains `NotifySubscribersOnPostPublishedHandler` for `PostPublishedEvent`. The `On` prefix already marks the reaction. Folder names carry no technical suffix, so `OnPostPublishedEvent` is wrong. The event type keeps its `Event` suffix (`NAME.AGGREGATE.001`).

The example does not shorten an Application type to `{UseCase}Result`, `{UseCase}Handler`, or `{UseCase}Validator`. The example does not use an unowned name such as `PostSummary` for a query-specific result item. The full role suffix distinguishes command coordination from query projection without opening the file.

The example does not shorten an HTTP transport type to `{UseCase}Request` or `{UseCase}Response`. `Model` marks the type as passive boundary data rather than an operation or rich business object. Other project-owned, passive HTTP DTOs also name their concrete role and end in `Model`, such as `ListPostsResponseItemModel` or `PaginationModel`. The example uses `ApiMappings` instead of the context-dependent `Mappings` suffix.

A polymorphic transport model mirrors a Domain discriminated union (`API.MODELS.001`). Its abstract base names the concept. Each sealed case names its case. Both end in `Model`, such as `RefundOutcomeModel` and `RefundSucceededOutcomeModel`.

The transport name drops the Domain union's aggregate prefix, such as `PaymentRefundOutcome`. Its discriminator string keeps the Domain union's stable case code unchanged.

### Name asynchronous methods completely (NAME.ASYNC.001)

**Requirement:** Repositories MUST name asynchronous methods completely.

**Rationale:** Every method returning `Task`, `Task<T>`, `ValueTask`, or `ValueTask<T>` uses the `Async` suffix. A cancellable method accepts `CancellationToken cancellationToken` as its final parameter and passes it to every cancellable dependency.

The implementation does not shorten the parameter to `ct` in public or internal application code.

### Name exceptions by failed rule (NAME.EXCEPTION.001)

**Requirement:** Repositories MUST name exceptions by failed rule.

**Rationale:** Domain exceptions use `{DomainType}{Reason}Exception`, such as `PostAlreadyPublishedException`. `DomainType` is the aggregate root or an anchored owned type. The exception name always starts with the aggregate root.

A rule without an owning value object anchors on the aggregate. Missing aggregates use `{Aggregate}NotFoundException`. Input validation errors use stable field and reason codes.

Each distinct rule has its own exception type. That type owns its stable failure code and message. An exception constructor accepts only the domain values of the specific failure, never a `code` or `message` string supplied by the throwing type. A shared `{DomainType}RuleException(code, message)` constructed with hard-coded strings at the call site is prohibited. See `DOMAIN.ERROR.001`.

`Exception` is reserved for a type that rejects a rule. The implementation does not use it as a Domain term for anomalies, discrepancies, or manual handling. That use collides with `System.Exception` and project `DomainException`.

`CancellationExceptionRaisedEvent` reads as a thrown exception instead of a business fact. The implementation uses `CancellationDiscrepancy`, `PaidCapacityShortfall`, or `RefundHold` for such Domain terms. Failure types retain the `{DomainType}{Reason}Exception` suffix.

### Use intent-revealing boolean names (NAME.BOOLEAN.001)

**Requirement:** Repositories MUST use intent-revealing boolean names.

**Rationale:** Boolean properties and methods use `Is`, `Has`, `Can`, or a precise verb when those words fit. The implementation uses `HasLines` and `CanPublish`, not `LinesPresent` or `CheckPublish`.

### Keep implementation style consistent (NAME.CSHARP.001)

**Requirement:** Repositories MUST keep implementation style consistent.

**Rationale:** C# production code uses:

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

**Requirement:** Repositories MUST use current language features.

**Rationale:** Production code targets the pinned language version and prefers the current, more precise construct over an older equivalent:

- Collection expressions `[]` and `[.. source]` for array, list, and span creation and copying, instead of `new List<T>()`, `Array.Empty<T>()`, or `.ToList()` initializers.
- The implementation uses `init` accessors and `required` members for construction-only values. The implementation does not leave their setters publicly mutable.
- `readonly` on every field and struct that is not reassigned after construction.
- Primary constructors for dependency-only classes such as handlers and services, instead of a constructor that only assigns fields.
- Target-typed `new` where the type is already stated on the left.
- The implementation uses `switch` expressions and type patterns over discriminated unions. The implementation avoids enum switches and discriminator ladders. The implementation includes a `_` arm that throws the unsupported-case exception.
- `is null` and `is not null` for reference checks.

The implementation does not adopt a feature that reduces clarity. A collection expression that hides an intended defensive copy, or a primary constructor on a type with real construction logic, is not an improvement. The rule prefers the modern construct where it is at least as clear, not in every position.

### Use predictable frontend names (NAME.FRONTEND.001)

**Requirement:** Repositories MUST use predictable frontend names.

**Rationale:** Frontend module and use-case folders use lowercase kebab-case. React component files and exported component names use PascalCase. Hooks use `use-{name}.ts` or `use-{name}.tsx`. Non-component files use lowercase kebab-case unless a framework requires another name.

Next.js special files retain framework names such as `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`, and `route.ts`.

## Conventions


### Align business names across layers (NAME.CONVENTION.001)

**Default:** Align business names across layers.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** The Posts module maps to `Domain/Posts`, `Application/Posts`, `Endpoints/Posts`, `features/posts`, and `docs/domain/modules/posts`. A single aggregate stays flat when its plural root name equals the module name. For example, `Post` stays flat in `Posts`. Otherwise, each aggregate takes its own folder (`ARCH.MODULES.001`). This also applies to modules with multiple aggregates. Use-case names retain the same verb and module across layers.

### Keep namespaces aligned with folders (NAME.CONVENTION.002)

**Default:** Keep namespaces aligned with folders.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Namespaces start with the project name and follow folders beneath the project root. The implementation does not include `src` or `apps` in a namespace.

### Avoid generic type names (NAME.CONVENTION.003)

**Default:** Avoid generic type names.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** The implementation does not introduce `Manager`, `Helper`, `Processor`, `Common`, `Utility`, `BaseService`, `DataService`, or `MessageBus` when the type has a narrower responsibility.

`IPostPublicationNotifier` is preferred over `INotificationService`. `Slug.Create` is preferred over `StringHelper.ToSlug`.

### Derive boundary names from the ubiquitous term (NAME.CONVENTION.004)

**Default:** Derive boundary names from the ubiquitous term.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Route segments and JSON field names derive from the current aggregate or ubiquitous term. Renaming a Domain concept also renames those boundary names. `/api/offers/{offerId}` follows the `Offer` term. The earlier `Release` term used `/api/releases/{releaseId}`.

A boundary name retaining a retired concept is a defect. The source change regenerates OpenAPI and typed clients. The build fails when generated artifacts differ.

A transport field name is the concise business field, not the domain type or aggregate name: a fee-kind field is `FeeKind`, not `CatalogFeeKind`. It matches the field name in the use-case specification and its siblings (`FeeKind` beside `FeeAmount` and `FeeLabel`). The aggregate-anchoring rule (`NAME.AGGREGATE.001`) governs Domain types, not transport field names. A transport DTO that inherits the aggregate prefix has drifted from the documented input.

A closed-set code or discriminator string literal is a contract value, not an identifier. An identifier rename does not sweep it: renaming a union case type `VenueContactPurpose` to `EventVenueContactPurpose` leaves its code literal `"Venue"` unchanged. The closed-set round-trip test (`DOMAIN.CLOSEDSET.001`) catches a literal that a rename altered.

## Reference example

This informative example demonstrates `NAME.FILE.001`, `NAME.SUFFIX.001`, and `NAME.CONVENTION.002`.

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
| NAME.FILE.001 | inspection | Pull request review asserts `match C# files and primary types` in the owning specification and source paths. |
| NAME.AGGREGATE.001 | inspection | Pull request review asserts `anchor aggregate-owned types on the aggregate root` in the owning specification and source paths. |
| NAME.SUFFIX.001 | inspection | Pull request review asserts `use architectural suffixes` in the owning specification and source paths. |
| NAME.ASYNC.001 | static | Repository static check asserts `name asynchronous methods completely` for the owning paths. |
| NAME.EXCEPTION.001 | static | Repository static check asserts `name exceptions by failed rule` for the owning paths. |
| NAME.BOOLEAN.001 | inspection | Pull request review asserts `use intent-revealing boolean names` in the owning specification and source paths. |
| NAME.CSHARP.001 | inspection | Pull request review asserts `keep implementation style consistent` in the owning specification and source paths. |
| NAME.CSHARP.002 | inspection | Pull request review asserts `use current language features` in the owning specification and source paths. |
| NAME.FRONTEND.001 | inspection | Pull request review asserts `use predictable frontend names` in the owning specification and source paths. |
| NAME.CONVENTION.001 | inspection | Pull request review asserts `align business names across layers` in the owning specification and source paths. |
| NAME.CONVENTION.002 | inspection | Pull request review asserts `keep namespaces aligned with folders` in the owning specification and source paths. |
| NAME.CONVENTION.003 | inspection | Pull request review asserts `avoid generic type names` in the owning specification and source paths. |
| NAME.CONVENTION.004 | inspection | Pull request review asserts `derive boundary names from the ubiquitous term` in the owning specification and source paths. |
