# Changelog

## Unreleased

Target release: `v1.3.0`.

- Renamed ADDD to Agent-Driven Domain Delivery and defined it as a delivery method with explicit industry mappings.
- Replaced the planning hierarchy with relationships among Product, Business Flow, Subject, Use case, Workflow, Aggregate, acceptance criterion, and Flow check.
- Defined Subject as a language and navigation boundary that may contain zero, one, or multiple Aggregates.
- Added Business Flow, Workflow, Workflow Orchestrator, Follow-up, Shared Rule, and Claims and Evidence records.
- Replaced mandatory Aggregate state-record hierarchies with business-state documentation and representation choices.
- Added kind-specific Specification Metadata with separate record and delivery status.
- Replaced consumer `extensions` with `selectedExtensions`, added project or local extension activation scopes, and advanced the manifest schema to version 2.
- Replaced the ADDD routing schema with a kind-discriminated Specification Metadata schema.
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
