# Changelog

## v1.8.0

- Replaced the module-first Domain folder convention with per-aggregate and per-concept folders. A module with more than one aggregate gives each aggregate its own folder with its own `Events/`, `States/`, and `Exceptions/`, and a closed set groups its base and cases in a folder named for the concept (for example `ScanResults/`) while the aggregate state hierarchy keeps its `States/` folder. Kind-bucket folders (`Entities/`, `ValueObjects/`, `Services/`) and empty folders remain prohibited. Mirrored the per-aggregate rule across layers in `ARCH.MODULES.001` and aligned the `naming.md` cross-layer note.
- Tightened `DOMAIN.EVENT.001` so a domain event carries no `Exception`, `DomainException`, or other error object and is not named after the language error type. A failure that is itself the recorded fact is modeled as immutable domain data (a value object or discriminated-union case) and carried as event data.
- Extended `NAME.EXCEPTION.001` to reserve the `Exception` suffix for `{DomainType}{Reason}Exception` failure types and to prohibit `Exception` as a domain business term for an anomaly or manual-handling case (for example `CancellationExceptionRaisedEvent`), with domain-word alternatives.
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
