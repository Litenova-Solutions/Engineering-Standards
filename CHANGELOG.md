# Changelog

## v1.11.1

- Repaired every baseline provision whose Requirement or Default only restated its own heading. The v1.11.0 conversion had moved each real obligation into `Rationale`, which the authoring standard declares informative, leaving the baseline formally non-normative. All 289 provisions across the 19 conventions, the platform profile, and the engineering system foundation now state their obligation in the normative block.
- Rewrote every templated evidence row. A verification row now names the command, path, test, or assertion that produces the result instead of repeating its provision heading.
- Rewrote every Agent Summary bullet that repeated its provision verbatim, so Tier 1 compresses Tier 2 again rather than duplicating it.
- Split compound provisions that carried two normative modals into separate identified assertions, including `API.ENDPOINTS.002`, `API.BOUNDARY.002`, `API.ACTOR.002`, `API.ERRORS.002`, `API.STATUS.002`, `API.OPENAPI.004`, `API.MODELS.002`, and `AGENTIC.EXTENSIONS.002`.
- Gave each page one Standards identifier prefix. `MARTEN.CONVENTION.*` became `PERSIST.CONVENTION.*`, component provisions became `COMPONENT.*`, rendering provisions became `RENDER.*`, `STATE.*` and `FORM.*` merged into `DATA.*`, and idempotency provisions moved under `EXT.CONCURRENCY.*`.
- Replaced the expiring ESLint note in the platform profile with `CONFIG.ESLINT.001`, which requires a concrete `settings.react.version` in the flat config.
- Reduced the extension index to a selection table and cited pointers. Its numbered activation procedure and uncited prohibitions duplicated `SCOPE.EXTENSIONS.001`, `CORE.COMPLEXITY.002`, and `AGENTIC.EXTENSIONS.001`.
- Linked every step of `docs/guides/getting-started.md` to the standard that governs it and grouped the steps into pin, configure, structure, specify, implement, and operate stages.
- Replaced the duplicated consumer gate commands in `AGENTS.md` with a citation to `CI.GATES.001`, which owns them.
- Added the `Standard` and `Workspace` glossary terms and renamed the `Repository` entry to `Repository (Domain port)`, so the Git sense and the Domain port sense no longer share one term.
- Promoted every authoring rule to an error. `WARNING_DIAGNOSTIC_CODES` is now empty, so a provision that restates its heading, an evidence row that names no artifact, a summary that repeats its provision, or a page with two identifier prefixes fails the build.

## v1.11.0

- Added `docs/foundations/authoring-standard.md` as the canonical contract for controlled technical prose, page structure, provisions, summaries, examples, and evidence mappings.
- Adopted an STE-inspired repository profile with 20-word procedure sentences, 25-word descriptive sentences, six-sentence paragraphs, ASCII prose, active voice, and controlled terminology. The profile does not claim ASD-STE100 conformance or reproduce its dictionary.
- Limited normative vocabulary to uppercase `MUST`, `MUST NOT`, `SHOULD`, `SHOULD NOT`, and `MAY` under the RFC 2119 and RFC 8174 interpretation.
- Rewrote every active foundation, profile, convention, and extension page with explicit Requirement, Default, Replacement, Agent Summary, and Verification structures.
- Added canonical IDs to actionable conventions while retaining distinct replacement authority from Standards overrides.
- Replaced duplicated policy prose in `AGENTS.md` and `CONTRIBUTING.md` with concise projections that cite canonical provisions.
- Added `tools/validate-standards.mjs`, its dependency-free fixture suite, a pull request checklist, and a pinned GitHub Actions validation workflow.
- Added authoring templates for normative topics, extensions, and guides under `templates/standards/`.
- Removed the repository writing convention after moving its authority into the authoring foundation.
- Made the standards release model normative. `WRITING.SNAPSHOT.003` requires each release to state its complete contract without depending on an earlier release. `WRITING.SNAPSHOT.004` prohibits a compatibility guarantee, migration path, deprecation period, replacement map, or identifier alias between standards releases. `WRITING.SNAPSHOT.005` records that a consumer keeps a pinned release for as long as that consumer chooses.
- Scoped that release model to the standards repository. Consumer product API compatibility, schema migration, deprecation, and rollback provisions are unchanged, including the `api-compatibility` and `persistence-ef-core` extensions.
- Moved the release model and version-number meaning from `CONTRIBUTING.md` into the authoring standard as the canonical `Release model` concept. `CONTRIBUTING.md` now projects that model with citations instead of restating it.
- Added the `Standards release` glossary term.
- Corrected `CORE.DOCUMENTS.003`, which named only `planned` and `verified` while the metadata schema, `AGENTIC.METADATA.001`, and `tools/validate-consumer.mjs` all accept `implemented`. The provision now requires an implementation status and cites the schema as the owner of the permitted values.
- Stated the Specification Metadata carrier in `WRITING.METADATA.002`. The block opens and closes with a line containing only `---`. The extension index example now shows that form instead of a bare JSON object.
- Added `templates/docs/aggregate.md` for the `aggregate` specification kind, which the metadata schema, `tools/validate-consumer.mjs`, and `AGENTIC.CONVENTION.002` already required, and listed it in the template index.
- Removed an empty `Vocabulary` heading from the engineering system foundation.
- Added `tools/validate-consumer.cases.mjs` and made it a required CI step. The reference consumer validator previously shipped with no fixture suite and never ran in this repository.
- Built the consumer fixture from the tracked templates, so every shipped Markdown metadata block is now validated as part of the baseline case.
- Made `tools/validate-consumer.mjs` report a metadata block that is not delimited by `---` instead of skipping the file. A silently skipped specification is an unvalidated specification.
- Added seven authoring rules that detect provisions and evidence carrying no information: `PROVISION_RESTATES_HEADING`, `VERIFY_TEMPLATED_EVIDENCE`, `VERIFY_NO_ARTIFACT`, `SUMMARY_RESTATES_REQUIREMENT`, `ID_PREFIX_OWNERSHIP`, `HEADING_EMPTY_BODY`, and `INDEX_CONTAINS_PROCEDURE`.
- Added a warning tier to `tools/validate-standards.mjs`. A code in `WARNING_DIAGNOSTIC_CODES` reports a defect under active repair and does not fail the build. `--warnings` lists every occurrence.
- Removed every version-specific upgrade guide and the requirement to publish future migration instructions. Consumers remain on pinned releases until they select another complete contract.
- Replaced the version-specific adoption guide with `docs/guides/getting-started.md` and removed the duplicate v1 release-scope guide.
- Replaced application-v1 readiness labels with version-neutral release evidence and release-record guidance.
- Removed primary-flow metadata requirements from consumer specifications and the reference consumer validator.
- Removed history-specific authoring checks. The validator evaluates the current standards snapshot.
- Removed archived decision pages and their active navigation. Changelog and Git history retain release context.
- Set the standards manifest version to 1.11.0 without changing schema version 3.

## v1.10.0

- Made `shadcn/ui` with Tailwind CSS v4 the default React web UI system for all product profiles:
  `public-light`, `application-balanced`, and `admin-dense`.
- Selected Base UI, Vega (`bIkf1RQ`), CSS variables, neutral semantic tokens, Geist, Lucide, the preset
  radius, and the built-in shadcn registry as the pinned baseline. Added `@base-ui/react`,
  `next-themes`, and `tw-animate-css`, and refreshed the shadcn, Lucide, Radix compatibility, and slot
  package pins.
- Amended `UI.GOVERNANCE.001` and `UI.SHADCN.001` and added `UI.TAILWIND.001`, `UI.FORKS.001`,
  `UI.VOCABULARY.001`, `UI.PAGE.SPEC.001`, `UI.COMPANION.001`, `UI.EVIDENCE.001`,
  `UI.AGENT.PROTOCOL.001`, and `FTEST.UI.001`.
- Added UI vocabulary, page-contract, and shadcn source-lock schemas and templates. Source locks record
  generated source digests and require a visible fork classification when source changes.
- Added the controlled React web UI baseline decision and a focused UI override decision template for alternate systems or specialist controls.
- Added the deterministic `tools/validate-ui.mjs` reference validator and made
  `tools/validate-consumer.mjs` invoke it when a consumer declares a React web platform, a UI
  configuration, or a `UI.*` override. The validator reads Tailwind rules from extracted class strings
  rather than whole files, allows Tailwind variant brackets while rejecting arbitrary utility values,
  classifies top-level global CSS statements, and scans the workspace root and shared packages for a
  second visual system.
- Added `tools/validate-ui.cases.mjs` with reference passing and failing cases for every UI rule. Its
  global CSS fixture is the entry the pinned CLI actually generates.
- Required `reviewBy` on every `UI.*` entry in a consumer's `overrides`, and made an override fail once
  its review date passes so a temporary visual system cannot become permanent by omission.
- Added a vocabulary `runtimeStyles` record as the only route to an inline style for measured geometry, a
  declared CSS custom property, or a rendering target with no class support such as a generated social
  image.
- Verified the baseline against the pinned CLI rather than a transcript: `shadcn@4.16.2 preset decode
  bIkf1RQ` returns the ten recorded values, and a real `init` writes `base-vega`, `rtl: false`, the five
  recorded aliases, an empty registry map, and exactly the recorded direct dependencies. Two rules were
  wrong before that check and are now correct: the generated entry imports `tw-animate-css` and
  `shadcn/tailwind.css` alongside `tailwindcss`, and it expresses its documented browser base rules with
  `@apply` inside `@layer base`, so `@apply` is prohibited only outside that generated block.
- Pinned `prettier` and `prettier-plugin-tailwindcss`. The source lock normalizes with the project
  formatter before hashing, so an unpinned formatter would let two consumers compute different digests
  for identical source.
- Documented that vocabulary and source-lock paths are frontend-relative while `standards.project.json`
  paths are consumer-root-relative.
- Kept React Native outside the official web baseline and documented separate native platform decisions.
- Consumer action: add frontend UI configuration, vocabulary, source locks, page sidecars, Tailwind
  restrictions, and the evidence matrix. Existing Radix, Bootstrap, MUI, and other React consumers must
  record an override and migration plan before moving to the default.

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
- Extended `EXT.CONCURRENCY.IDEMPOTENTOUT.001` guidance so the `Idempotency-Key` header is declared as a required parameter on every operation that requires it, matching `API.OPENAPI.003`, instead of surfacing on only some operations.
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
