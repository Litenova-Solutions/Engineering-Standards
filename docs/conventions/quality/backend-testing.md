# Backend Testing

## Intent


Backend tests prove domain behavior, use-case coordination, real persistence and HTTP integration, and structural architecture at separate boundaries. Acceptance IDs connect observable product behavior to automated evidence without maintaining a second test inventory.

## Agent Summary {#agent-summary}


- Use four baseline test projects. (BTEST.PROJECTS.001)
- Test Domain in isolation. (BTEST.DOMAIN.001)
- Test Application coordination. (BTEST.APPLICATION.001)
- Test persistence and HTTP with PostgreSQL. (BTEST.INTEGRATION.001)
- Isolate integration state. (BTEST.ISOLATION.001)
- Enforce architecture rules. (BTEST.ARCHITECTURE.001)
- Trace acceptance criteria. (BTEST.TRACE.001)
- Use evidence rather than one coverage target. (BTEST.COVERAGE.001)
- Verify generated contracts. (BTEST.GENERATED.001)
- Use one production-faithful integration harness. (BTEST.HARNESS.001)

## Standards


### Use four baseline test projects (BTEST.PROJECTS.001)

**Requirement:** Backend tests MUST use four baseline test projects.

**Example:** A test suite can contain:

```text
apps/api/tests/{ProjectName}.Domain.Tests/
apps/api/tests/{ProjectName}.Application.Tests/
apps/api/tests/{ProjectName}.Integration.Tests/
apps/api/tests/{ProjectName}.Architecture.Tests/
```

Acceptance.Tests appears only when the executable BDD extension activates.

### Test Domain in isolation (BTEST.DOMAIN.001)

**Requirement:** Backend tests MUST test Domain in isolation.

**Rationale:** Domain tests cover factories, every supported lifecycle state, allowed and rejected transitions, aggregate invariants, value equality, collection behavior, money rules, exceptions, and raised events. They use explicit inputs and no database, HTTP host, dependency injection container, clock, or mocks.

Each module invariant maps through its use-case specification to at least one cited acceptance ID. Domain tests may add narrower cases without an acceptance ID.

### Test Application coordination (BTEST.APPLICATION.001)

**Requirement:** Backend tests MUST test Application coordination.

**Rationale:** Application tests use substitutes for aggregate repositories, clocks, actor accessors, and external ports. They confirm that the handler loads the correct aggregate, calls intended domain behavior, stages the result, and returns the correct result.

Validator tests cover every structural error and stable error code. The implementation does not mock Marten query internals.

### Test persistence and HTTP with PostgreSQL (BTEST.INTEGRATION.001)

**Requirement:** Backend tests MUST test persistence and HTTP with PostgreSQL.

**Rationale:** Integration.Tests use Testcontainers PostgreSQL, the real Marten configuration, and `WebApplicationFactory` for API behavior.

Integration tests cover document mappings, repository loading and storage, query projections, commit behavior, Problem Details, authentication, resource authorization, OpenAPI, and extension-specific infrastructure.

CI executes this suite against the container on every change. A suite that cannot execute fails the build. Missing containers, broken hosts, and authentication failures also fail the build. The suite never reports success through skipped cases or cases that never reach the host. A silent suite hides regressions until the boundary has drifted.

### Isolate integration state (BTEST.ISOLATION.001)

**Requirement:** Backend tests MUST isolate integration state.

**Rationale:** Reset database state between cases using one documented strategy. Tests do not depend on order or share mutable business state.

Container and application host fixtures may be shared for cost. Test data does not leak between test cases.

### Enforce architecture rules (BTEST.ARCHITECTURE.001)

**Requirement:** Backend tests MUST enforce architecture rules.

**Rationale:** Architecture.Tests verify:

- The implementation projects reference direction.
- Domain package restrictions.
- Application and Infrastructure dependency restrictions.
- Internal sealed handlers, validators, endpoints, and persistence implementations.
- Public visibility of ports implemented across project boundaries.
- Endpoint isolation from repositories and sessions.
- Module folder and naming conventions that static analysis can prove.
- Full `Command` and `Query` role suffixes on Application results, query result items, handlers, and validators.
- Concrete boundary-role names ending in `Model` for passive WebApi DTOs and `ApiMappings` for operation mappings.
- Aggregate inheritance from `AggregateRoot<TId>` and the absence of lifecycle enums.
- Absence of `IModule`, `ModuleRoot`, or another runtime module abstraction.
- Extension-specific replacements.

### Trace acceptance criteria (BTEST.TRACE.001)

**Requirement:** Backend tests MUST trace acceptance criteria.

**Rationale:** Every acceptance criterion from a verified Use case appears in at least one recognized test reference:

**Example:**

```csharp
[Trait("AcceptanceCriterion", "AC-POSTS-CREATE-DRAFT-01")]
```

```gherkin
@AC-POSTS-CREATE-DRAFT-01
```

The trace is one-way. Internal implementation tests do not need an acceptance ID.

### Use evidence rather than one coverage target (BTEST.COVERAGE.001)

**Requirement:** Backend tests MUST use evidence rather than one coverage target.

**Rationale:** The implementation collects line and branch coverage for review. The implementation does not use one repository-wide percentage as the definition of sufficient testing.

Verified acceptance trace, Domain negative cases, integration boundaries, security behavior, and architecture rules remain required regardless of the percentage.

### Verify generated contracts (BTEST.GENERATED.001)

**Requirement:** Backend tests MUST verify generated contracts.

**Rationale:** The implementation generates OpenAPI and downstream API types during the verification flow. Verification fails when committed generated output differs.

### Use one production-faithful integration harness (BTEST.HARNESS.001)

**Requirement:** Backend tests MUST use one production-faithful integration harness.

**Rationale:** `Integration.Tests` owns a PostgreSQL container fixture, `ApiFactory`, and `DatabaseReset`. The fixture starts the manifest-pinned PostgreSQL major once for a test collection or assembly and supplies its connection string before the WebApi host builds. `ApiFactory` targets the real `public partial Program`, replaces only external boundaries declared by the test, and retains production Marten, LiteBus, exception, authentication, authorization, and endpoint registration.

The test strategy resets every application schema object that affects behavior, including Marten documents, sequences, outbox records, idempotency records, and scheduled work. Tests sharing one database run serially, while parallel tests use isolated databases or schemas. Tests do not depend on execution order.

Security integration tests use locally issued JWTs that exercise the configured bearer validation, including issuer, audience, signature, lifetime, subject, scope, and role claims. A test authentication handler may simplify unrelated endpoint cases. It is not evidence for authentication behavior.

## Conventions


### Mirror production module names (BTEST.CONVENTION.001)

**Default:** Mirror production module names.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Example:**

```text
{ProjectName}.Domain.Tests/
  Posts/
    PostTests.cs
    SlugTests.cs
{ProjectName}.Application.Tests/
  Posts/
    CreateDraft/
      CreateDraftCommandHandlerTests.cs
      CreateDraftCommandValidatorTests.cs
    GetPost/
      GetPostQueryHandlerTests.cs
      GetPostQueryValidatorTests.cs
{ProjectName}.Integration.Tests/
  Posts/
    CreateDraftEndpointTests.cs
    GetPostQueryTests.cs
  Support/
    PostgreSqlContainerFixture.cs
    ApiFactory.cs
    DatabaseReset.cs
{ProjectName}.Architecture.Tests/
  ProjectReferenceTests.cs
  TypeVisibilityTests.cs
  EndpointBoundaryTests.cs
```

### Name tests by observable behavior (BTEST.CONVENTION.002)

**Default:** Name tests by observable behavior.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** The implementation uses `{MethodOrOperation}_{Condition}_{ExpectedResult}` when it remains readable. A test class matches the production type it tests, such as `CreateDraftCommandHandlerTests` or `GetPostQueryHandlerTests`.

The implementation avoids names such as `Test1`, `HappyPath`, or `Works`.

### Use builders for valid defaults (BTEST.CONVENTION.003)

**Default:** Use builders for valid defaults.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** The implementation creates a test data builder when many tests need a valid aggregate with small variations. The builder produces valid state by default and exposes business-named customization.

The implementation does not bypass domain methods to create impossible state unless a persistence compatibility test requires it.

### Keep assertions focused (BTEST.CONVENTION.004)

**Default:** Keep assertions focused.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Focused assertions cover the state, event, call, response, or error relevant to the test. The implementation avoids broad object snapshots that fail for unrelated field additions.

## Reference example

This informative example demonstrates `BTEST.DOMAIN.001`, `BTEST.APPLICATION.001`, and `BTEST.INTEGRATION.001`.

A `PostTests.Publish_WhenDraft_MarksPostPublishedAndRaisesEvent` test uses no mocks. `CreateDraftCommandHandlerTests.HandleAsync_WhenValid_StoresCreatedPost` substitutes `IPostRepository` and `IClock`. `CreateDraftEndpointTests` uses the real API host and PostgreSQL.

## Verification


| ID | Method | Evidence |
|:---|:---|:---|
| BTEST.PROJECTS.001 | test | An automated test citing `BTEST.PROJECTS.001` asserts `use four baseline test projects` at the affected boundary. |
| BTEST.DOMAIN.001 | test | An automated test citing `BTEST.DOMAIN.001` asserts `test Domain in isolation` at the affected boundary. |
| BTEST.APPLICATION.001 | test | An automated test citing `BTEST.APPLICATION.001` asserts `test Application coordination` at the affected boundary. |
| BTEST.INTEGRATION.001 | test | An automated test citing `BTEST.INTEGRATION.001` asserts `test persistence and HTTP with PostgreSQL` at the affected boundary. |
| BTEST.ISOLATION.001 | test | An automated test citing `BTEST.ISOLATION.001` asserts `isolate integration state` at the affected boundary. |
| BTEST.ARCHITECTURE.001 | test | An automated test citing `BTEST.ARCHITECTURE.001` asserts `enforce architecture rules` at the affected boundary. |
| BTEST.TRACE.001 | test | An automated test citing `BTEST.TRACE.001` asserts `trace acceptance criteria` at the affected boundary. |
| BTEST.COVERAGE.001 | test | An automated test citing `BTEST.COVERAGE.001` asserts `use evidence rather than one coverage target` at the affected boundary. |
| BTEST.GENERATED.001 | test | An automated test citing `BTEST.GENERATED.001` asserts `verify generated contracts` at the affected boundary. |
| BTEST.HARNESS.001 | test | An automated test citing `BTEST.HARNESS.001` asserts `use one production-faithful integration harness` at the affected boundary. |
| BTEST.CONVENTION.001 | test | An automated test citing `BTEST.CONVENTION.001` asserts `mirror production module names` at the affected boundary. |
| BTEST.CONVENTION.002 | test | An automated test citing `BTEST.CONVENTION.002` asserts `name tests by observable behavior` at the affected boundary. |
| BTEST.CONVENTION.003 | test | An automated test citing `BTEST.CONVENTION.003` asserts `use builders for valid defaults` at the affected boundary. |
| BTEST.CONVENTION.004 | test | An automated test citing `BTEST.CONVENTION.004` asserts `keep assertions focused` at the affected boundary. |
