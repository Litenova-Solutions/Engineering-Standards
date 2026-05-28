# ADR 0022: ADDD Executable Acceptance Tests (Reqnroll)

| Status | Accepted |
|:---|:---|
| Date | 2026-05-28 |

## Context

Domain docs are the human-readable source of truth. Use-case docs hold acceptance criteria. The repository already forbids parallel behavior specs that duplicate glossaries, exception catalogs, or API maps. Teams need executable evidence that use-case docs are implemented correctly without letting BDD become a competing specification layer.

## Decision

1. Adopt **ADDD executable acceptance tests** as a distinct backend test category (see `08-testing.md` and `20-api-acceptance-tests.md`).
2. Adopt **Reqnroll** as the standard optional BDD framework for new .NET API acceptance tests when Gherkin adds stakeholder value.
3. Keep **plain xUnit API integration and acceptance tests** as the default request-to-response style.
4. Require traceability from Reqnroll scenarios to use-case docs via `@usecase:` and `@ac:` tags.
5. List Reqnroll packages as **conditional** entries in `standards.manifest.json`; agents must not add them without an acceptance test project, use-case BDD requirement, or explicit task request.

SpecFlow remains allowed only in legacy projects until a dedicated migration task.

## Consequences

**Positive**

- Stronger traceability from domain docs to executable behavior.
- Stakeholder-readable examples for critical, security-sensitive, and complex use cases.
- Better support for AI agents implementing against use-case docs.

**Negative**

- Additional framework, feature files, bindings, and maintenance cost.
- Risk of generic step drift if agents ignore `20-api-acceptance-tests.md`.
- Slower CI when BDD is overused; mitigated by `@critical` tag filtering.

## Related

- `docs/conventions/backend/08-testing.md`
- `docs/conventions/backend/20-api-acceptance-tests.md`
- `docs/guides/agentic-domain-driven-design.md` § Executable Acceptance Criteria
- `docs/blueprints/backend/api-acceptance-tests/`
