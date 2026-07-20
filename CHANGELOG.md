# Changelog

All notable changes to Litenova Engineering Standards are recorded here.

## Unreleased

### Added

- Document ownership, authority, freshness, and implementation-evidence rules for consumer documentation.
- Code and documentation consistency checks for business names, capability and use-case paths, acceptance IDs, generated API contracts, duplicate contracts, and removed entry points.
- Product and operating context fields for commercial, legal, provider, money, risk, audit, and support constraints.
- Human-first documentation index, mental model, terminology, and worked ADDD example.
- Task-sized repository, backend, frontend, testing, security, and operations conventions.
- Exact monorepo, solution, folder, naming, dependency, configuration, API, and test layouts.
- Compact single-Application architecture profile with Marten and PostgreSQL persistence.
- Single ADDD use-case specifications with risk flags and acceptance-criterion traceability.
- Conditional extension standards and small consumer document templates.
- Exact endpoint discovery, Problem Details, pagination, OpenAPI generation, authentication, authorization, integration harness, frontend action, observability, alert, and CI job contracts.
- V1 release-scope guide, release-evidence template, and evidence-gated v2 roadmap.

### Changed

- Refreshed the v1 platform and dependency pins from official release metadata, including .NET servicing, PostgreSQL, Marten, LiteBus, Node.js LTS, pnpm, and the selected frontend toolchain.
- Replaced the Auth.js prerelease pin with the latest compatible stable release.
- Added locked NuGet restore, JavaScript toolchain pins, and a package-to-project ownership matrix.
- Expanded durable delivery, concurrency, scheduled jobs, Auth.js, EF Core, BDD, container, and API compatibility safety rules.
- Rebuilt the unused preliminary v1 baseline before its first GitHub Release.
- Made the repository documentation-first by removing the standards CLI, generated catalogs, automation scripts, and full application scaffold.
- Renamed recipes to extensions and merged activation metadata into readable Markdown.
- Reduced JSON schemas to the manifest and consumer configuration contracts that have direct schema consumers.
- Replaced broad profile documents with fine-grained task navigation and agent summaries.
- Clarified Marten JSON contracts, document evolution, bounded aggregate documents, and query-shaped read documents.
- Clarified EF Core provider selection, provider-specific commits, and atomic outbox storage.
- Removed the preliminary pre-v1 upgrade guide because v1 is the starting standards release.
- Added baseline CI and repository writing conventions.
- Added API compatibility, scheduled jobs, and data lifecycle extensions.
- Added runbook and standards-decision metadata templates plus a greenfield v1 adoption guide.
- Added security controls for abuse limits, CORS, audit events, secret rotation, and CI supply-chain gates.
- Restored the detailed tactical DDD model with mandatory state records, aggregate roots, typed IDs, value semantics, domain services, event contracts, and ADDD model traceability.
