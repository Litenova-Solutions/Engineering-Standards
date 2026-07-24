# Changelog

## v1.9.0

- Extended the Domain module-folder convention so a single-aggregate module whose own name equals its aggregate pluralizes the module folder (a `Catalog` aggregate lives in a `Catalogs` folder, namespace `Entro.Domain.Catalogs`) rather than padding the type name to dodge CA1724. Pluralizing the folder is the fix; renaming the type (for example `SalesCatalog`) is not.
- Added a module-identity rule to `NAME.AGGREGATE.001`: a module's identity is one token across the folder and namespace, the `{MODULE}` in failure codes, the `INV-{MODULE}-NN` invariant-id prefix, and the `{module}.{use-case}` id prefix, and the four move as a unit. Renaming only an aggregate leaves them unchanged (`inventory` keeps its token when `CapacityPool` becomes `Capacity`); re-scoping a prefix during a deliberate module rename (`INV-CATALOG-01` to `INV-CATALOGS-01`) preserves the number and is not forbidden renumbering.
- Tightened `DOMAIN.VALUE.001` to a full ban on implicit conversion operators in either direction, for Shared kernel value objects as much as aggregate-owned ones. An implicit primitive-to-value conversion hides the validating factory and lets a cast throw (prohibited by the .NET conversion guidelines); an implicit value-to-primitive conversion erases the domain type. Construct through a named factory and read the value through a named member; an `explicit` operator is permitted only where a boundary needs a cast.
- Added the trailing-doubling case to `NAME.AGGREGATE.001`: when the reason trails with the aggregate noun, drop the repeat (`CapacityInsufficientException`, not `CapacityInsufficientCapacityException`).
- Added a boundary-name convention: route path segments and JSON field names derive from the current ubiquitous term and are renamed with the concept, verified by regenerating the OpenAPI document and typed clients and failing on any diff. Added matching Verification search hints for the implicit-conversion ban, the `Exception`-as-business-term rule, and boundary-name drift.
- Required a boundary string enum to carry the string-enum conversion on the type itself (`[JsonConverter(typeof(JsonStringEnumConverter<T>))]`) in `API.OPENAPI.003`, not only a host-registered converter, so every serializer, including a consumer or test client using default options, honors the contract.
- Extended `DOMAIN.CLOSEDSET.001`: each union exposes a stable code or label whose `FromCode` round-trips for every case, boundaries project the union through that code and never the record's default `ToString()`, and a per-case round-trip test is required. Added the matching Verification check.
- Extended the boundary-name convention: transport field names are the concise business field (`FeeKind`, not `CatalogFeeKind`) matching the use-case specification, and a closed-set code or discriminator string literal is a contract value that an identifier rename must not sweep (the round-trip test catches an altered literal). Added the matching Verification check.
- Added to `BTEST.INTEGRATION.001` that CI executes the integration suite against the container and that a suite which cannot execute fails the build rather than reporting success, so a silently non-running suite cannot hide boundary drift. Added the matching Verification check.
- Added `API.MODELS.001`, which requires a Domain closed set to be mirrored at the transport boundary by a WebApi-owned model of the same shape: a string `enum` for a label-only set and a polymorphic `oneOf` model with a discriminator for a set whose cases carry data. The polymorphic model uses an abstract base record and one sealed record per case, `[JsonPolymorphic]` and `[JsonDerivedType]` carried on the type, string discriminators equal to the Domain union's stable case codes, a concept-named discriminator property rather than the `$type` default, and a document or schema transformer to complete the discriminator when the generator omits it or its required marker. The rule sets consistency over premature narrowing: each layer mirrors the set and no layer serializes a Domain or Application type as the wire contract, and splitting request from response models or reducing a union to an `enum` is a deliberate decision, not the default. Reframed the `API.OPENAPI.003` closed-set bullet so the `enum` is the label-only case and a data-bearing set publishes a `oneOf` per `API.MODELS.001`, and added the matching Verification check.
- Added `APP.CLOSEDSET.001`, which requires a command or query result that carries a Domain closed set to model it with the same shape: a mirrored discriminated union for a data-bearing set (the Domain union directly when it crosses safely, or an Application-owned union) and the stable code for a label-only set, never a Domain-free `enum` reintroduced in Application or a data-bearing union flattened to nullable fields. Added the matching Verification check.
- Extended `DOMAIN.CLOSEDSET.001` so the boundary guidance states the outer layers mirror the union (`APP.CLOSEDSET.001`, `API.MODELS.001`) and an `enum` or string at a boundary is the narrowed representation of a label-only set, not the default for a data-bearing set.
- Added polymorphic transport model naming to `NAME.SUFFIX.001` (`{Concept}Model` base and `{Case}{Concept}Model` cases, dropping the aggregate prefix while the discriminator literal keeps the Domain case code) and a matching Verification check, and added a mirroring boundary to `AGENTS.md`.
- Added `ARCH.CONTRACTS.001`, the contract-level complement to `ARCH.DEPENDENCIES.001`: a layer owns its own messages, results, and transport models and does not expose an inner layer's model outward. An Application message or result exposes no Domain aggregate, closed set, or result record; a WebApi transport model reuses no Application or Domain type. Each layer mirrors the shape it needs, and the duplication is accepted rather than removed with a shared cross-layer DTO or contracts assembly. Shared-kernel typed IDs and value objects (`PostId`, `Money`, `EmailAddress`) are the one sanctioned crossing, an aggregate-owned value object is represented at the Application boundary by its primitive, and the wire contract reduces even the Shared-kernel types to primitives. Tightened `APP.CLOSEDSET.001` so an Application result mirrors a data-bearing set with its own union rather than the Domain union type, refined the Application immutable-messages convention to the same scope, cross-referenced it from `API.MODELS.001`, and added matching Verification checks to `architecture.md`.
- Bumped the manifest version to 1.9.0.

## v1.8.0

- Replaced the module-first Domain folder convention with a top-down `module` then `aggregate` then detail hierarchy, replicated in every layer (`ARCH.MODULES.001` and its mirrored-folders convention). A module with more than one aggregate gives each aggregate its own folder with its own `Events/`, `States/`, and `Exceptions/`, and a closed set groups its base and cases in a folder named for the concept (for example `ScanResults/`) while the aggregate state hierarchy keeps its `States/` folder. A single-aggregate module keeps its aggregate flat. Kind-bucket folders (`Entities/`, `ValueObjects/`, `Services/`) and empty folders remain prohibited. The Application, WebApi, and Infrastructure layer conventions show the same module-then-aggregate nesting.
- Added `NAME.AGGREGATE.001`, which anchors every aggregate-owned type on its aggregate root's full name in first position: events (`OrganizationMemberAccessChangedEvent`), state cases (`PostPublishedState`, aggregate-first), union bases and cases (`RefundOutcome`, `RefundSucceededOutcome`), aggregate value objects (`OrganizationLegalProfile`), child entities, and exceptions. The full aggregate name is used, never an abbreviation, and the prefix chains to the aggregate root. Only Shared kernel types (`Money`, `EmailAddress`) are unprefixed, signaled by their location. The anchor is the aggregate root, not the module (`ReservationNotFoundException`, not `InventoryReservationNotFoundException`), while failure codes stay module-scoped; child-entity identities follow `{Aggregate}{Part}Id`. Domain events now carry the `Event` suffix (`{Aggregate}{PastFact}Event`); an event-reaction handler and its folder keep the `On{PastFact}` form without the suffix. Updated `DOMAIN.STATE.001`, `DOMAIN.CLOSEDSET.001`, `DOMAIN.EVENT.001`, the Domain names table, `NAME.SUFFIX.001`, and the affected examples across the profile and guides.
- Tightened `DOMAIN.EVENT.001` so a domain event carries no `Exception`, `DomainException`, or other error object and is not named after the language error type. A failure that is itself the recorded fact is modeled as immutable domain data (a value object or discriminated-union case) and carried as event data.
- Extended `NAME.EXCEPTION.001` to reserve the `Exception` suffix for `{DomainType}{Reason}Exception` failure types and to prohibit `Exception` as a domain business term for an anomaly or manual-handling case (for example `CancellationExceptionRaisedEvent`), with domain-word alternatives. The exception name anchors on the aggregate root, so an `Event` finance-assurance rule is `EventFinanceAssuranceMislabeledException`.
- Refined `NAME.AGGREGATE.001` from migration experience: a child entity with a first-class domain name (`Reservation`, a child of `CapacityPool`) is itself the anchor for its own states and unions (`ReservationHeldState`, not `CapacityPoolReservationHeldState`); a union case whose concept already embeds the aggregate reorders rather than doubles it (`SuppressionLegalBasis`, `RoleEventScope`); and a per-aggregate folder is named with the plural of the aggregate root so it adds a proper namespace segment (`Entro.Domain.Audience.BuyerAccounts`) that does not collide with the singular aggregate type (which a singular folder would, tripping CA1724).
- Tightened `DOMAIN.REPOSITORY.001` so a required load uses `GetByIdAsync`, which returns the aggregate and throws the aggregate's own `{Aggregate}NotFoundException` (a `DomainException` owning its code, mapped to `404`) from the Infrastructure implementation. A command handler no longer repeats a null check or builds a not-found failure with a hard-coded code and message at the call site. A nullable `FindBy...Async` is reserved for a genuinely optional lookup.
- Bumped the manifest version to 1.8.0 and added the v1.8 consumer upgrade guide.

## v1.7.0

- Added `API.OPENAPI.003`, which requires the generated contract to publish precise, complete schemas: a closed-set field or parameter declares its values as an `enum` (a response field projected from a Domain state hierarchy or discriminated union publishes its allowed values as a typed union rather than an open `string`, with the `enum` living only at the transport boundary per `DOMAIN.CLOSEDSET.001`); a parameter declares its real bounds, format, allowed values, and a description for a non-obvious business limit; and an operation that requires a control header declares it as a required parameter.
- Extended `EXT.IDEMPOTENCY.OUTCOME.001` guidance so the `Idempotency-Key` header is declared as a required parameter on every operation that requires it, matching `API.OPENAPI.003`, instead of surfacing on only some operations.
- Added `EXT.OUTBOX.READINESS.001`, which separates a dependency outage from a message failure: a Worker that cannot reach its store or finds no schema (cold start or pre-migration) backs off and rate-limits its logging rather than emitting a per-iteration exception storm, and gates its dispatch loop on readiness where the host exposes it. Added a matching cross-reference to `EXT.JOBS.RETRY.001`.
- Bumped the manifest version to 1.7.0 and added the v1.7 consumer upgrade guide.

## v1.6.1

- Fixed the reference consumer validator (`tools/validate-consumer.mjs`) to accept the `implemented` `implementationStatus` value added to the schema in v1.6.0. The schema and the bundled validator now agree, so a specification marked `implemented` passes validation.
- Bumped the manifest version to 1.6.1.

## v1.6.0

- Added `API.OPENAPI.002`, which requires the generated OpenAPI document to reflect enforced authentication: when endpoints enforce authentication (per `API.ACTOR.001`), a document transformer that reads the registered authentication schemes declares the matching `securitySchemes` and per-operation `security`, so a consumer or generated client learns auth is required from the contract rather than from a runtime 401. Intentionally anonymous operations declare no requirement.
- Added the `implemented` value to `implementationStatus` (`planned`, `implemented`, `verified`) in the Specification Metadata schema and defined it in the engineering system: `implemented` records shipped behavior whose acceptance evidence is incomplete, without overstating it as `verified`. It is not sufficient for release; the release standard still requires `verified`. Existing `planned` and `verified` values are unchanged.
- Clarified `UI.SHADCN.001`: the manifest pins the primitive and icon dependencies shadcn/ui source imports (the unified `radix-ui` package and `lucide-react`); adding a component whose source imports an unpinned package requires pinning it first (`DEP.APPROVAL.001`). Either the CLI or hand-authored canonical source may create the owned primitive. Pinned `radix-ui` and `lucide-react` in the manifest.
- Added a frontend rendering note that a `notFound()` thrown in a layout is handled by the parent segment's boundary, not the layout's own segment, with a caveat for route groups and multiple root layouts.
- Added an `API.OPENAPI` convention and a `DATA.TYPES.001` note on numeric transport precision: `int32` and `double` emit plain numeric schemas at the source; the `number | string` union is reserved for `int64`-scale values and is coerced at the consumer read boundary when it legitimately appears.
- Clarified `server-only` guidance: the server-owned module boundary is the baseline; the `server-only` package is an optional import-time guard used only when pinned.
- Added a components convention that card and section titles carry heading semantics rather than a styled `div`.
- Added a profile note on the ESLint 10 and `eslint-plugin-react` interaction and the `settings.react.version` workaround.
- Fixed the page template folder mapping to drop the `src/` segment so it matches `FRONTEND.STRUCTURE.001`.
- Bumped the manifest version to 1.6.0 and added the v1.6 consumer upgrade guide.

## v1.5.0

- Added `DOMAIN.CLOSEDSET.001`, which extends the state-record reasoning of `DOMAIN.STATE.001` to every closed set of Domain values and prohibits declaring any `enum` in Domain. A closed set is modeled as a discriminated union of records (one abstract base, one sealed case per value) or, for a validated scalar with no per-case data, as a typed value object. The rule is scoped to Domain; Application results, transport DTOs, and persistence records at a boundary may still use an `enum` or string and map it to the Domain union.
- Tightened `DOMAIN.ERROR.001` and `NAME.EXCEPTION.001` so each rejected rule has its own exception type that owns its stable failure code and message. A shared exception constructed with a hard-coded `code` and `message` at the call site (for example `RefundRuleException("REFUNDS.ALLOCATION_INVALID", "...")`) is now prohibited; exception constructors accept only the domain values of the specific failure.
- Tightened `DOMAIN.DOCUMENTATION.001` from selected public contracts to every public Domain type and member, with per-member expectations for factories, mutation methods, state and union cases, events, and exceptions.
- Tightened `NAME.FILE.001` to prohibit any file with more than one public or internal top-level type, and named `*Enums.cs` and `*ValueObjects.cs` grouping files as the anti-pattern to split.
- Added `NAME.CSHARP.002`, which requires current language features (collection expressions, `init`/`required` members, `readonly`, primary constructors for dependency-only classes, target-typed `new`, and `switch` expressions over unions) where they are at least as clear as the older construct.
- Added matching baseline boundaries to `AGENTS.md` and Verification steps to the domain and naming conventions, and added the v1.5 consumer upgrade guide.
- Bumped the manifest version to 1.5.0.

## v1.4.1

- Fixed the reference consumer validator (`tools/validate-consumer.mjs`) so it validates structured specifications under `docs/research/`, such as decision-evidence records, instead of skipping the entire directory. Research prose without a metadata block is still skipped, so a decision-evidence record is now checked while Codex or Fable notes are not link-gated.

## v1.4.0

- Added a reference consumer validator at `tools/validate-consumer.mjs` that checks Specification Metadata, internal links, and the cross-file relationships in the foundation Verification lists; wired it into the writing checks, release gates, and consumer verification, and updated the repository stance that previously shipped no bundled validator.
- Extended `AGENTIC.RULES.001` with identifier forms for every rule classification (`VAL-`, `AUTZ-`, `PERS-`, `WFR-` in addition to `INV-` and `POL-`), a `{MODULE}.{REASON}` failure-code convention, and guidance that a decision-derived constraint keeps its enforcement classification and cites the decision rather than minting a `POL-*` ID.
- Defined `docs/operations/` as the home for operating and security reference documents, with cross-cutting security posture, trust boundaries, and threat surfaces recorded as prose (for example `security-and-privacy.md`) rather than in a reintroduced cross-cutting bucket.
- Added a repository configuration convention that negates the `docs/releases/` directory against the case-insensitive `[Rr]eleases/` build-output ignore pattern, with the exact `.gitignore` snippet.
- Stated each extension's activation scope and applicable specification kinds in its own document, in addition to the selection table and manifest.
- Clarified that `WRITING.METADATA.001` forbids any separate Markdown document-metadata section, and that the operating-limits record keeps the fixed `id` `operating-limits` at `docs/operations/limits.md`.
- Bumped the manifest version to 1.4.0 and added the v1.4 consumer upgrade guide.

## v1.3.0

- Defined the Agentic Engineering System as a general specification, engineering, verification, and release model used by Litenova Solutions, with Agent-Driven Engineering as its operating model and Specification-Driven Delivery as its delivery approach.
- Replaced Subject with Module, Business Flow with End-to-End Flow, Primary Business Flow with Primary Release Flow, and Flow Check with End-to-End Test.
- Replaced Follow-up with Event Reaction, Aggregate Rule with Aggregate Invariant, and the Shared Rule umbrella with Domain Policy.
- Replaced Claims and Evidence with Decision Evidence and Release Evidence with Release Record.
- Retained mandatory aggregate state-record hierarchies and prohibited lifecycle enums, status strings, boolean flags, and computed discriminators as replacements.
- Added kind-specific Specification Metadata with `specStatus` and `implementationStatus`.
- Renamed structured kinds, fields, template paths, documentation directories, and `FC-*` identifiers; moved foundation rule IDs to `AGENTIC.*` without compatibility aliases.
- Replaced consumer `extensions` with `selectedExtensions`, added project or local extension activation scopes, and advanced the manifest schema to version 2.
- Replaced the routing schema with a kind-discriminated Specification Metadata schema.
- Simplified the root README, linked the hosted documentation, added project badges and a standards icon, and defined repository writing tone in `AGENTS.md`.
- Added the v1.3 consumer upgrade guide.

## v1.2.0

- Replaced structural capability terminology with subject terminology across ADDD, architecture, templates, and layer conventions.
- Defined a subject as the cross-layer business and navigation boundary that groups one or more related use cases, with one primary aggregate root for state-changing behavior and none for read-only behavior.
- Kept `AggregateRoot<TId>` as the runtime consistency and mutation boundary, and prohibited `Subject`, `ISubject`, and `SubjectRoot` runtime abstractions.
- Replaced the capability specification template with the subject specification template, documented subject and page routing metadata, and added the v1.2 consumer migration guide.
- Replaced `ADDD.CAPABILITY.001` with `ADDD.SUBJECT.001` and `ARCH.CAPABILITIES.001` with `ARCH.SUBJECTS.001`.
- Required command and query results, handlers, and validators to include their architectural role in the type and file name.
- Replaced ambiguous `{Concept}` and `Summary` patterns with `{DomainType}`, `{BusinessTerm}`, `{BusinessRule}`, and `{UseCase}QueryResultItem` patterns.
- Required HTTP transport DTOs and mapping classes to use the explicit `RequestModel`, `ResponseModel`, and `ApiMappings` suffixes.

## v1.1.0

- Added code and documentation consistency checks for business names, capability and use-case paths, acceptance IDs, generated API contracts, duplicate contracts, and removed entry points.
- Added document ownership, authority, freshness, canonical-source, and implementation-evidence requirements for consumer documentation.
- Added product and operating context fields to the product brief for commercial, legal, provider, money, risk, audit, and support constraints.
