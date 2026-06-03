# API Acceptance Tests (ADDD Executable Acceptance)

This document defines **ADDD executable acceptance tests**: HTTP-level tests that validate documented use cases against Test Coverage rows in `docs/domain/{feature}/{use-case}.tests.md`. They are not a parallel specification layer. The test spec remains normative for verification; acceptance tests are executable evidence.

For the five-category backend testing taxonomy, see `testing.md`. For Reqnroll setup patterns, see `docs/blueprints/backend/api-acceptance-tests/`.

---

## Agent Quick Rules

- Every API acceptance test MUST trace to a Test Coverage row in `docs/domain/{feature}/{use-case}.tests.md`.
- Reqnroll is the preferred BDD library when Gherkin adds stakeholder value. Plain xUnit API acceptance tests are the default otherwise.
- Agents MUST NOT add Reqnroll unless the project already has an acceptance test project, the use-case doc marks BDD coverage as required, or the human task explicitly requests BDD.
- When a scenario conflicts with the test spec, the test spec wins. Stop and report the conflict; do not "fix" the test spec from the test without human review.
- When steps execute the action under test, they MUST go through HTTP. MUST NOT call handlers, repositories, `DbContext`, or domain methods for the action under test.

---

## 1. What API Acceptance Tests Are

API acceptance tests validate documented use cases through the public HTTP API surface. They are not:

- Domain unit tests
- Application handler tests
- Repository or EF mapping tests
- UI or Playwright tests

They execute the application the way an API client would.

**API acceptance tests** differ from **API integration tests** (`testing.md`):

| Category | Purpose |
|:---|:---|
| API integration tests | Endpoint wiring, serialization, validation plumbing, smoke coverage |
| API acceptance tests | Business use-case behavior mapped to documented acceptance criteria |

Both use `WebApplicationFactory<Program>` and real databases via Testcontainers. Acceptance tests add traceability to use-case docs and domain language.

---

## 2. When to Use BDD (Reqnroll)

| Policy | Use cases |
|:---|:---|
| **SHOULD** add BDD-style acceptance tests | Business-critical, externally consumed, security-sensitive, authorization-sensitive, idempotent, event-producing, multi-step, or frequently misunderstood |
| **MAY** add BDD-style acceptance tests | Acceptance criteria that product, QA, domain experts, support, or stakeholders can read and validate |
| **SHOULD NOT** add BDD | Simple CRUD permutations, validation matrices, repository behavior, EF mapping, raw SQL, domain invariants, internal handler orchestration |
| **MUST NOT** use BDD as substitute for | Domain tests, Application tests, API integration tests, architecture tests, or contract tests |

SpecFlow is allowed only in legacy projects already using it. New projects use Reqnroll.

---

## 3. Package Governance

Check `standards.manifest.json` before adding packages.

| Category | Packages |
|:---|:---|
| Required backend test packages | xUnit, AwesomeAssertions, Microsoft.AspNetCore.Mvc.Testing, Testcontainers.PostgreSql, NetArchTest |
| Conditional acceptance test packages | Reqnroll, Reqnroll.xUnit, Reqnroll.Microsoft.Extensions.DependencyInjection |
| Conditional external dependency simulation | WireMock.Net |
| Conditional database reset | Respawn |

Use `Reqnroll.xUnit` with xUnit 2.x. Use `Reqnroll.xunit.v3` only when the test project uses xUnit 3.

Agents MUST NOT add Reqnroll packages unless one of the agent quick rule conditions applies.

---

## 4. Project Structure

When Reqnroll is used, use a **separate acceptance test project**:

```text
tests/{ProjectName}.AcceptanceTests/
├── Features/{Feature}/{UseCase}.feature
├── Steps/{Feature}Steps.cs
├── Support/
│   ├── AcceptanceTestWebAppFactory.cs
│   ├── ScenarioState.cs
│   ├── TestUsers.cs
│   └── TestApiClient.cs
├── TestData/*Builder.cs
├── Hooks/AcceptanceTestHooks.cs
└── reqnroll.json
```

Feature files follow domain docs, not HTTP grouping. If the use-case doc is `docs/domain/posts/publish-post.md`, the feature file is `Features/Posts/PublishPost.feature`.

Do not group feature files by HTTP verb, route, controller, database table, or handler name.

Plain xUnit API acceptance tests MAY live in `{ProjectName}.AcceptanceTests` without `.feature` files, or in `{ProjectName}.Integration.Tests` when they are thin smoke tests only. Reqnroll scenarios MUST NOT be mixed into Domain or Application test projects.

---

## 5. Traceability

Each use case MUST have a test spec at `docs/domain/{feature}/{use-case}.tests.md` (see `docs/templates/docs/domain-use-case.tests.md`) with a **Test Coverage** table. Row number `N` is criterion ID `AC-00N` (for example row 1 → `AC-001`).

Every Reqnroll scenario MUST map to at least one acceptance criterion via tags:

```gherkin
@acceptance @critical @usecase:posts/publish-post
Feature: Publish Post

  @ac:AC-001
  Scenario: Author publishes a draft post
    ...
```

Rules:

- Every critical Test Coverage row MUST be covered by a BDD scenario, a plain API acceptance test, or a lower-level test with explicit rationale in **Explicitly Not Tested** when not automated.
- Feature files MUST NOT redefine glossary, invariants, endpoint contracts, or exception catalogs. Reference the operation doc and test spec.
- If scenario and test spec disagree, update the test (or fix the code), not the normative test spec without human review.

---

## 6. Gherkin Style

Follow Cucumber declarative scenario guidance:

- Scenarios MUST be declarative, not imperative.
- Use domain language from the feature README.
- Prefer "When the author publishes the post" over "When I send POST `/api/posts/{id}/publish`."
- Prefer "Then the post is visible to readers" over "Then the `status` column is `Published`."
- Keep scenarios short: one When step and one to three Then steps in most cases.
- Avoid generic "I send a request" steps in business acceptance tests.
- Avoid scenario outlines for large validation matrices. Use parameterized xUnit tests instead.
- BDD examples are representative, not exhaustive.

Endpoint mechanics belong in `@api-contract` features only.

---

## 7. Step Definitions

Step definitions are thin HTTP adapters.

| Rule | Detail |
|:---|:---|
| When steps | MUST execute the use case through HTTP |
| Given steps | MAY seed via test data builders, setup APIs, or database seeding. MUST NOT duplicate domain logic |
| Then steps | MUST verify externally observable outcomes (API responses, follow-up queries, integration events, audit records). Avoid direct database assertions unless the use-case doc identifies a durable integration boundary (outbox, audit, idempotency record) |
| Forbidden in When | Command handlers, query handlers, repositories, `DbContext`, domain methods |
| Step names | MUST NOT be overloaded. Ambiguous text breaks Cucumber matching |
| Assertions | MUST use AwesomeAssertions in Then steps or helpers. MUST NOT use xUnit `Assert.*` |

Problem Details assertions verify status, type (if standardized), title, error code, and invalid params. Do not rely on exact human-readable detail text unless contractually stable.

---

## 8. Scenario State and Fixtures

- Scenario state MUST be per-scenario, not static mutable fields.
- Use a typed `ScenarioState` class instead of string-keyed dictionaries where practical.
- Store only execution state: authenticated actor, latest response, created IDs, captured errors.
- Do not store production container services in scenario state except test infrastructure.
- Use one `AcceptanceTestWebAppFactory` per test collection or run, with isolated database reset per scenario when required.
- Do not rely on test execution order.
- Do not share authenticated clients across scenarios unless auth state is immutable and isolated.

---

## 9. Test Host

Acceptance tests MUST use `WebApplicationFactory<Program>` unless the project ADR documents an approved alternative.

- Use the real application service graph where practical.
- Replace only external boundaries: database connection, clock, email, payment, broker, object storage, external HTTP.
- Do not replace mediator, handlers, validators, domain services, repositories, filters, exception middleware, auth middleware, authorization policies, or JSON serialization unless testing a degraded external path.
- Use Testcontainers for the production database provider (PostgreSQL by default; project ADR may override, for example SurrealDB in LitePress).

See `docs/blueprints/backend/api-acceptance-tests/acceptance-test-web-app-factory.md`.

---

## 10. Authorization Scenarios

Protected use cases SHOULD include acceptance scenarios for:

- Happy path as authorized actor
- Unauthenticated request returns 401
- Authenticated actor without permission returns 403
- Authenticated actor without access to the target object returns 403 or 404 per API disclosure policy
- Actor ID in request body is ignored or rejected when identity must come from claims

Tag authorization scenarios with `@authz`.

---

## 11. Idempotency and Outbox

For idempotent commands (`@idempotency`):

- First request succeeds
- Replay with same idempotency key returns same result without duplicate side effects
- Conflicting replay with same key and different payload returns documented conflict response

For integration-event-producing use cases (`@outbox`):

- Prefer business wording: "Then a PostPublished integration event is recorded for dispatch."
- Verify outbox or audit tables only when the use-case doc owns that integration contract.

---

## 12. CI Tags and Stages

Standard tags:

| Tag | Purpose |
|:---|:---|
| `@acceptance` | All acceptance tests |
| `@critical` | Run on every PR |
| `@authz` | Authorization scenarios |
| `@idempotency` | Idempotency scenarios |
| `@outbox` | Integration event / outbox scenarios |
| `@public-api` | Externally consumed contracts |
| `@tenant` | Multi-tenant scenarios |
| `@slow` | Nightly or release-candidate only |
| `@external-dependency` | WireMock or similar simulations |
| `@regression` | Regression guard |

CI policy:

- Every PR: unit, application, architecture, integration smoke, `@critical` acceptance tests
- PRs touching `docs/domain/**`, `Application/**`, `WebApi/**`, `Infrastructure/**`, migrations, or OpenAPI: run affected acceptance tests
- Release candidates and nightly: full acceptance suite, slow external simulations, full E2E where applicable

See `docs/conventions/shared/ci.md`.

---

## 13. Reqnroll Generated Code

In the acceptance test `.csproj`:

```xml
<PropertyGroup>
  <ReqnrollUseIntermediateOutputPathForCodeBehind>true</ReqnrollUseIntermediateOutputPathForCodeBehind>
</PropertyGroup>
```

- Do not commit generated `.feature.cs` files.
- Keep `reqnroll.json` minimal; use the Reqnroll JSON schema for IDE validation.
- Do not use shared external binding assemblies unless scenario volume justifies it.

---

## 14. Test Data and External Dependencies

**Test data:**

- Use builders with safe defaults.
- Scenario text MUST mention domain-relevant state ("draft post", not just "a post exists").
- Use generated unique values for names, emails, slugs, and keys.
- Reset database before each scenario, or use isolated schema/database when parallel execution is required.

**External dependencies:**

- Do not call real third-party systems.
- Simulate external HTTP with WireMock.Net or approved doubles.
- Replace email, SMS, payment, storage, and broker clients at the infrastructure boundary only.

---

## 15. Anti-Patterns

| Anti-pattern | Problem |
|:---|:---|
| Endpoint-as-feature | Feature files named after routes instead of use cases |
| Transport Gherkin | HTTP verbs, headers, JSON fields in business scenarios |
| Step dumping ground | One large `CommonSteps` with vague reusable steps |
| Hidden business logic in steps | Step code decides whether an operation should be allowed |
| Database-driven Then | Every outcome verified by table inspection |
| Scenario explosion | Every validation edge case becomes a scenario |
| Parallel specification drift | Use-case doc and feature file disagree |
| Over-shared Given steps | "Given a valid user exists" hides role, tenant, permission, ownership |
| UI leakage | Backend features refer to buttons, pages, or CSS |

---

## 16. Migration from SpecFlow or Integration Tests

- Do not migrate SpecFlow to Reqnroll in the same PR as behavior changes.
- Freeze behavior with the existing suite, swap packages, move code-behind out of source control, keep feature files stable, then refactor to ADDD style.
- Do not rewrite all integration tests to BDD. Add BDD for critical use cases only.

---

## 17. Enforcement (Optional Scripts)

Projects MAY add CI scripts that verify:

- Every `.feature` file contains a `@usecase:` tag
- Every scenario contains at least one `@ac:` tag
- No `.feature.cs` files are committed
- Feature files live under `Features/{Feature}/`
- Business features do not use banned transport phrases (except `@api-contract` features)

See `scripts/validate-feature-files.ps1` in this repository.
