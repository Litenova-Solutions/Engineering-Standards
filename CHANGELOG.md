# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/2.0.0.html).

## [Unreleased]

### Added

- Added backend reliability, background job, caching, and deployment migration conventions.
- Added shared real-time update conventions using SignalR as the default.
- Added frontend internationalization guidance plus loading, authorization, form error, and file upload rules.
- Added ADRs for OpenTelemetry observability, API versioning, SignalR real-time updates, and multi-tenancy defaults.
- Added `docs/appendix-rationale.md` as a short human-facing rationale appendix.
- Replaced the read-store inventory template with a read-model inventory template.

### Changed

- Shortened `AGENTS.md` below the 150-line limit and updated its convention index.
- Standardized WebApi dispatch guidance on `ICommandMediator` and `IQueryMediator`.
- Clarified accepted EF Core coupling in Domain shape and `Application.Read`.
- Expanded testing guidance with test data builders, OpenAPI freshness checks, snapshots, load tests, and mutation testing.
- Expanded security guidance for rate limiting, CORS, CSP, audit logging, PII classification, secret rotation, and frontend audits.
- Expanded observability guidance with OpenTelemetry traces, metrics, health checks, and alert baselines.

### Fixed

- Removed stale default read-store references from active conventions and templates.
- Reconciled `LiteBus.Messaging.Abstractions` references with the specific mediator standard.
- Fixed query handler test guidance to use SQLite for fast handler tests and Testcontainers for PostgreSQL integration tests.

## [1.0.0] - 2026-05-19

[1.0.0]: https://github.com/Litenova-Solutions/engineering-standards/releases/tag/v1.0.0
