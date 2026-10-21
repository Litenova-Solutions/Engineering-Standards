# Naming and Code Style

## Intent

Names are the first documentation a reader meets: a name states the business intent and architectural role without opening the file. In a LiteSpec codebase every architectural role carries a fixed suffix, every type owned by an aggregate, a business object changed through one root type, starts with that root's name, and every frontend file follows one casing map. This page states those suffixes, anchors, and casings, with the exception, boolean, async, and language-version rules beside them. It applies to anyone who names code, and especially to agents working across sessions.

## Concepts

### Anchored names

An aggregate root is the single type through which outside code changes a business record. Every type the aggregate owns starts its qualified name with the root's full name, so the name reveals its owner without folder context. `PostPublishedEvent` and `PostState.Published` both lead with `Post`; a namespace-level `PublishedState` does not.

### Role suffixes

Each architectural role carries a fixed suffix: a command handler ends in `CommandHandler`, a query result item in `QueryResultItem`, an endpoint in `Endpoint`. The suffix table in the standards below lists every role with its pattern and one example. Full suffixes keep coordination apart from projection and boundary data apart from business objects.

## Standards

### Anchor aggregate-owned types on the aggregate root

**Requirement:** An aggregate-owned type's qualified name MUST start with its aggregate root's full name.

**Rationale:** Leading with the root name reveals the owner without folder context. The rule covers events, states, child business records, values, and discriminated unions. A type nested inside a declaring type inherits that type's prefix through its qualified name, so `PostState.Published` satisfies the rule while a flat `PostStatePublishedState` repeats the anchor twice.

**Example:** `PostPublishedEvent` and `PostState.Published` both lead with `Post`. `PublishedState` declared at namespace level does not.

### Use architectural suffixes

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

In the dotnet stack, the repository interface carries the `I` prefix, options classes carry the `Options` suffix, and each scanned project carries an assembly marker.

An event-reaction folder starts with `On` and names the business fact without the `Event` suffix: `OnPostPublished` holds `NotifySubscribersOnPostPublishedHandler` for `PostPublishedEvent`. The `On` prefix already marks the reaction, and folder names carry no technical suffix, so `OnPostPublishedEvent` is wrong. The event type keeps its `Event` suffix (`litespec/workspace/naming#anchor-aggregate-owned-types-on-the-aggregate-root`).

Application types keep their full suffix: `{UseCase}Result`, `{UseCase}Handler`, and `{UseCase}Validator` shorten away the command-or-query distinction the full name carries. A query-specific result item carries its full role suffix, as in `ListPostsQueryResultItem`, never a bare summary name like `PostSummary`. The full role suffix distinguishes command coordination from query projection without opening the file.

HTTP transport types keep their full suffix too: `{UseCase}Request` and `{UseCase}Response` shorten away the boundary marking. `Model` marks the type as passive boundary data rather than an operation or rich business object. Other project-owned, passive HTTP DTOs also name their concrete role and end in `Model`, such as `ListPostsResponseItemModel` or `PaginationModel`. Mapping classes use `ApiMappings` instead of the context-dependent `Mappings` suffix.

A polymorphic transport model mirrors a Domain discriminated union (`litespec/backend/api#mirror-a-domain-closed-set-as-a-transport-model-of-the-same-shape`). Its abstract base names the concept and each sealed case names its case, with both ending in `Model`: `FulfillmentOutcomeModel` and `ShippedFulfillmentOutcomeModel`.

The transport name drops the Domain union's aggregate prefix, such as `OrderFulfillmentOutcome`, while its discriminator string keeps the Domain union's stable case code unchanged.

### Name asynchronous operations completely

**Requirement:** An asynchronous operation MUST reveal its asynchrony in its name and accept cancellation explicitly when the operation is cancelable.

**Rationale:** A caller decides from the signature whether to await and what to cancel. Naming the asynchrony and accepting cancellation explicitly put both answers in the signature. An operation is cancelable when it performs I/O or awaits; anything else has nothing to cancel.

### Name exceptions by failed rule

**Requirement:** An exception name MUST state the rule that failed, using `{DomainType}{Reason}Exception` for a Domain rejection.

**Rationale:** An exception name is the first diagnosis: it states which rule failed on which type. `{DomainType}{Reason}Exception` puts both in the name. `DomainType` is the aggregate root or an anchored owned type, so the name always starts with the aggregate root.

### Use intent-revealing boolean names

**Requirement:** A boolean property or method MUST use `Is`, `Has`, `Can`, or a precise verb.

**Rationale:** A boolean answers a yes-or-no question, so its name asks one. `Is`, `Has`, `Can`, or a precise verb make the question explicit: `HasLines` and `CanPublish` state a condition. `LinesPresent` and `CheckPublish` state neither a question nor an answer, so the caller reads the body to learn the polarity.

### Use current language features

**Requirement:** Production code MUST target the pinned language version and use its current construct over an older equivalent.

**Rationale:** A pinned language version gives every writer the same constructs. Using the current construct over its older equivalent keeps one idiom across the codebase instead of one per author. In the dotnet stack, collection expressions, pattern matching, and primary constructors express the same intent with less incidental code.

### Use predictable frontend names

**Requirement:** A frontend folder MUST use kebab-case, a component file and its export PascalCase, and a React hook file `use-{name}`.

**Rationale:** Kebab-case folders, PascalCase components with matching exports, and `use-{name}` hooks give every file one predictable name. One mapping lets a reader move between the documentation tree and the source tree without translation, and lets an agent derive the file from the feature name.

## Conventions

### Align business names across layers

**Default:** Use one business name for a module across Domain, Application, endpoints, features, and documentation.

**Replacement:** A consumer departs from this default only through an Exception record naming this provision, with a reason and a review date.

**Rationale:** One business name per module keeps every layer pointing at the same word. The Posts module maps to `Domain/Posts`, `features/posts`, and `docs/domain/modules/posts` without translation. A second name in any layer reads as a second concept that does not exist.

### Keep namespaces aligned with folders

**Default:** Start a namespace with the project name and follow the folders beneath the project root.

**Replacement:** A consumer departs from this default only through an Exception record naming this provision, with a reason and a review date.

**Rationale:** Starting the namespace with the project name and following the folders beneath it puts each type exactly where its namespace says. Including `src` or `apps` couples the type name to a workspace layout decision. The project root is the directory holding the project file, so every folder above it stays outside the namespace.

### Avoid generic type names

**Default:** Avoid `Manager`, `Helper`, `Processor`, `Common`, `Utility`, `BaseService`, `DataService`, `MessageBus`, `Engine`, `Facade`, `Wrapper`, and `Factory` when a narrower name exists.

**Replacement:** A consumer departs from this default only through an Exception record naming this provision, with a reason and a review date.

**Rationale:** A generic name invites unrelated responsibility, because nothing in it excludes the next addition. A narrower name states what the type does and, by exclusion, what it does not. `Factory` is generic on a class and exact on a named static aggregate factory method, so the default names the class and not the method.

### Derive boundary names from the ubiquitous term

**Default:** Derive route segments and JSON field names from the current aggregate or ubiquitous term.

**Replacement:** A consumer departs from this default only through an Exception record naming this provision, with a reason and a review date.

**Rationale:** Route segments and JSON field names are the contract clients read. Deriving them from the current aggregate or ubiquitous term, the Domain's shared word for the concept, keeps the contract speaking the Domain language. Renaming a Domain concept then renames its boundary names, so the contract and the language stay aligned.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/workspace/naming#anchor-aggregate-owned-types-on-the-aggregate-root | guidance | Does each aggregate-owned type name begin with its aggregate root name? |
| litespec/workspace/naming#use-architectural-suffixes | guidance | Does each architectural type carry the suffix its role requires? |
| litespec/workspace/naming#name-asynchronous-operations-completely | guidance | Does each asynchronous operation reveal its asynchrony in its name and accept cancellation explicitly when cancelable? |
| litespec/workspace/naming#name-exceptions-by-failed-rule | guidance | Does each Domain exception name lead with its root and name its reason? |
| litespec/workspace/naming#use-intent-revealing-boolean-names | guidance | Does each boolean member use an intent-revealing prefix or verb? |
| litespec/workspace/naming#use-current-language-features | guidance | Does production code target the pinned language version with current constructs? |
| litespec/workspace/naming#use-predictable-frontend-names | guidance | Does each frontend follow the folder, component, and hook naming form? |
| litespec/workspace/naming#align-business-names-across-layers | guidance | Does one business name span each module across layers and documentation? |
| litespec/workspace/naming#keep-namespaces-aligned-with-folders | guidance | Does each namespace match its folder path beneath the project root? |
| litespec/workspace/naming#avoid-generic-type-names | guidance | Does each type name avoid the generic names this rule lists when a narrower name exists? |
| litespec/workspace/naming#derive-boundary-names-from-the-ubiquitous-term | guidance | Does each route segment and field name derive from its current ubiquitous term? |
