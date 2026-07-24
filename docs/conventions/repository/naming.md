# Naming and Code Style

## Intent

Names should expose business intent and architectural role without requiring a reader to open the file. Fixed suffixes and file conventions reduce variation across agent sessions.

## Agent Summary {#agent-summary}

- Use one primary top-level type per C# file, match the file name exactly, and never bundle types by kind in a `*Enums.cs` or `*ValueObjects.cs` file.
- Anchor every aggregate-owned type on its aggregate root's full name in first position (events, states, unions, aggregate value objects, child entities, exceptions); leave only Shared kernel types unprefixed.
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

### Anchor aggregate-owned types on the aggregate root (NAME.AGGREGATE.001)

Every type owned by an aggregate leads with that aggregate root's full name, in first position, so its owner is derivable from the name alone without folder context. This covers the aggregate's events, state base and cases, child entities, aggregate-specific value objects, discriminated union bases and cases, and exceptions.

The name is `{Aggregate}{Specific}{RoleSuffix}`:

- `{Aggregate}` is the aggregate root's full type name, never an abbreviation or partial form. An aggregate named `SalesCatalog` anchors `SalesCatalogPublishedEvent`, not `SalesPublishedEvent` or `CatalogPublishedEvent`.
- `{Specific}` is the fact, state, rule, or case in domain language. When it would repeat the aggregate name it is not doubled: a `SalesCatalog` publication is `SalesCatalogPublishedEvent`, not `SalesCatalogSalesCatalogPublishedEvent`.
- `{RoleSuffix}` is the fixed suffix for the kind: `Event`, `State`, or `Exception`. Child entities and value objects carry no suffix; a union case ends with its concept.

The prefix chains to the aggregate root, not to an intermediate owner. A value object `FinanceAssurance` owned by the `Event` aggregate is `EventFinanceAssurance`, and its rejection is `EventFinanceAssuranceMislabeledException`, so both resolve to `Event`.

A child entity with a first-class domain name is itself an anchor. A child entity is normally `{Aggregate}{Part}` (`OrderLine`), but keeps a standalone domain term when that term is first-class in the language (`Reservation`, a child of `CapacityPool`). Either way the child entity, not the aggregate root, anchors its own states and unions: a `Reservation` names `ReservationHeldState` and `ReservationConfirmOutcome`, never `CapacityPoolReservationHeldState`. Chaining stops at the nearest entity that carries identity.

When the concept already embeds the aggregate name, reorder the case so the aggregate leads exactly once rather than doubling it. A `Suppression` basis is `SuppressionLegalBasis`, not `LegalSuppressionBasis` (owner not derivable) nor `SuppressionLegalSuppressionBasis` (doubled); a `Role` scope is `RoleEventScope`, not `EventRoleScope`. When the reason trails with the aggregate noun, drop the repeat there too: an insufficient-capacity failure on the `Capacity` aggregate is `CapacityInsufficientException`, not `CapacityInsufficientCapacityException`.

The anchor is the aggregate root, not the module. When a module name differs from its aggregate, the type leads with the aggregate and never with the module: a `Reservation` aggregate in the `Inventory` module names `ReservationNotFoundException`, not `InventoryReservationNotFoundException`; a `Catalog` aggregate in a `Catalogs` module names `CatalogNotReadyException`, not `CatalogsNotReadyException`. The folder path already carries the module. Failure codes stay module-scoped as `{MODULE}.{REASON}` (`INVENTORY.RESERVATION_NOT_FOUND`), so the module lives in the code and the aggregate lives in the type name.

A module's identity is one token that appears in four places: the folder and namespace segment, the `{MODULE}` in `{MODULE}.{REASON}` failure codes, the `INV-{MODULE}-NN` invariant-id prefix, and the `{module}.{use-case}` id prefix. They move as a unit. Renaming a module changes all four in one step; renaming only an aggregate leaves them unchanged, so the `inventory` module keeps its token when `CapacityPool` becomes `Capacity`. Re-scoping an invariant-id prefix during a deliberate module rename, such as `INV-CATALOG-01` to `INV-CATALOGS-01`, preserves the number and is not the renumbering that the module specifications forbid.

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

Shared kernel types are the only exception. A type in `Shared/` used by more than one aggregate keeps its bare domain name: `Money`, `EmailAddress`, `Currency`, `Address`, `DateRange`. Location is the signal, so a type in an aggregate's folder is anchored and a type in `Shared/` is not.

Aggregate-first ordering also clusters every type of an aggregate together when a folder or symbol list is sorted, and gives an agent a single deterministic leading token to generate and to search by.

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

An event-reaction handler and its operation folder name the event by its business fact after the `On` prefix, without the `Event` suffix: the folder is `OnPostPublished` and the handler is `NotifySubscribersOnPostPublishedHandler`, reacting to the `PostPublishedEvent` type. The `On` prefix already marks the reaction, and a folder name carries no technical suffix, so `OnPostPublishedEvent` is wrong. The `Event` suffix stays on the event type itself per `NAME.AGGREGATE.001`.

Do not shorten an Application type to `{UseCase}Result`, `{UseCase}Handler`, or `{UseCase}Validator`. Do not use an unowned name such as `PostSummary` for a query-specific result item. The full role suffix distinguishes command coordination from query projection without opening the file.

Do not shorten an HTTP transport type to `{UseCase}Request` or `{UseCase}Response`. `Model` marks the type as passive boundary data rather than an operation or rich business object. Other project-owned, passive HTTP DTOs also name their concrete role and end in `Model`, such as `ListPostsResponseItemModel` or `PaginationModel`. Use `ApiMappings` instead of the context-dependent `Mappings` suffix.

A polymorphic transport model that mirrors a Domain discriminated union (`API.MODELS.001`) names its abstract base for the concept and each sealed case for the case, both ending in `Model`: `RefundOutcomeModel` with `RefundSucceededOutcomeModel` and `RefundFailedOutcomeModel`. The type name drops the aggregate prefix that anchors the Domain union (`PaymentRefundOutcome`) per the boundary-name convention, while the discriminator string literal keeps the Domain union's stable case code unchanged.

### Name asynchronous methods completely (NAME.ASYNC.001)

Every method returning `Task`, `Task<T>`, `ValueTask`, or `ValueTask<T>` uses the `Async` suffix. A cancellable method accepts `CancellationToken cancellationToken` as its final parameter and passes it to every cancellable dependency.

Do not shorten the parameter to `ct` in public or internal application code.

### Name exceptions by failed rule (NAME.EXCEPTION.001)

Domain exceptions use `{DomainType}{Reason}Exception`, such as `PostAlreadyPublishedException`. `DomainType` is the aggregate root, or an aggregate-anchored type it owns whose name already leads with the aggregate per `NAME.AGGREGATE.001`, so the exception name always leads with the aggregate root. A rule with no owning value object anchors directly on the aggregate: an `Event` finance-assurance rule is `EventFinanceAssuranceMislabeledException`, not `FinanceAssuranceMislabeledException`. Missing aggregates use `{Aggregate}NotFoundException`. Input validation errors use stable field and reason codes; create a custom exception type only when the exception hierarchy requires it.

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

The Posts module maps to `Domain/Posts`, `Application/Posts`, `Endpoints/Posts`, `features/posts`, and `docs/domain/modules/posts`. A single-aggregate module keeps its aggregate flat in the module folder only when the aggregate root's plural name equals the module name (as `Post` does for `Posts`); when the single aggregate's name differs from the module, or a module has more than one aggregate, each aggregate takes its own folder, per `ARCH.MODULES.001`. Use-case names retain the same verb and module across layers.

### Keep namespaces aligned with folders

Namespaces start with the project name and follow folders beneath the project root. Do not include `src` or `apps` in a namespace.

### Avoid generic type names

Do not introduce `Manager`, `Helper`, `Processor`, `Common`, `Utility`, `BaseService`, `DataService`, or `MessageBus` when the type has a narrower responsibility.

`IPostPublicationNotifier` is preferred over `INotificationService`. `Slug.Create` is preferred over `StringHelper.ToSlug`.

### Derive boundary names from the ubiquitous term

A route path segment and a JSON field name derive from the current aggregate or ubiquitous term, so renaming a domain concept renames its route segments and transport field names in the same change. `/api/offers/{offerId}` follows the `Offer` term; while the concept was `Release` the segment was `/api/releases/{releaseId}`. A route segment or transport field that still names a retired concept is a defect, caught by regenerating the OpenAPI document and the typed clients and failing the build on any diff.

A transport field name is the concise business field, not the domain type or aggregate name: a fee-kind field is `FeeKind`, not `CatalogFeeKind`, and it matches the field name in the use-case specification and its siblings (`FeeKind` beside `FeeAmount` and `FeeLabel`). The aggregate-anchoring rule (`NAME.AGGREGATE.001`) governs Domain types, not transport field names; a transport DTO that inherits the aggregate prefix has drifted from the documented input.

A closed-set code or discriminator string literal is a contract value, not an identifier. An identifier rename must not sweep it: renaming a union case type `VenueContactPurpose` to `EventVenueContactPurpose` leaves its code literal `"Venue"` unchanged. The closed-set round-trip test (`DOMAIN.CLOSEDSET.001`) catches a literal that a rename altered.

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
- Confirm no domain type, event, or business concept uses `Exception` as a business term, and that the `Exception` suffix names only failure types. Search names for `Exception` outside `{DomainType}{Reason}Exception` (for example `*ExceptionRaised*`, `*ExceptionsPending*`) to catch a business fact or state misusing the word.
- Confirm route path segments and transport field names match the current ubiquitous term, with no segment or field naming a retired concept; regenerate the OpenAPI document and typed clients and confirm no diff remains.
- Confirm transport field names are the concise business field, carry no domain-type or aggregate prefix, and match the use-case specification field names.
- Confirm every aggregate-owned type name leads with its aggregate root's full name, and only Shared kernel types are unprefixed.
- Confirm command and query results, query result items, handlers, and validators retain their full role suffixes.
- Confirm every passive HTTP DTO names its concrete boundary role and ends in `Model`; confirm operation mappings end in `ApiMappings`.
- Confirm a polymorphic transport model names its abstract base for the concept and each sealed case for the case, both ending in `Model`, and that the discriminator literal keeps the Domain union's stable case code.
- Search for forbidden generic suffixes and unexplained base classes.
- Confirm async methods pass the full cancellation token.
- Confirm namespaces and business names align with folders.
- Run compiler and style checks with warnings treated as errors.
