# Backend Testing

## Intent

Backend tests prove domain behavior, use-case coordination, real persistence and HTTP integration, and structural architecture at separate boundaries. Acceptance IDs connect observable product behavior to automated evidence without maintaining a second test inventory.

## Agent Summary {#agent-summary}

- Use Domain.Tests, Application.Tests, Integration.Tests, and Architecture.Tests.
- Test Domain without infrastructure or mocks.
- Test command coordination with narrow substitutes.
- Test Marten queries, repositories, HTTP, authentication, and authorization against PostgreSQL.
- Enforce project references, visibility, dependencies, and endpoint isolation in Architecture.Tests.
- Cite each acceptance ID from a verified Use case in at least one automated test.
- Collect coverage for review without one repository-wide percentage gate.

## Standards

### Use four baseline test projects (BTEST.PROJECTS.001)

Create:

```text
apps/api/tests/{ProjectName}.Domain.Tests/
apps/api/tests/{ProjectName}.Application.Tests/
apps/api/tests/{ProjectName}.Integration.Tests/
apps/api/tests/{ProjectName}.Architecture.Tests/
```

Acceptance.Tests appears only when the executable BDD extension activates.

### Test Domain in isolation (BTEST.DOMAIN.001)

Domain tests cover factories, every supported lifecycle state, allowed and rejected transitions, aggregate invariants, value equality, collection behavior, money rules, exceptions, and raised events. They use explicit inputs and no database, HTTP host, dependency injection container, clock, or mocks.

Each module invariant maps through its use-case specification to at least one cited acceptance ID. Domain tests may add narrower cases without an acceptance ID.

### Test Application coordination (BTEST.APPLICATION.001)

Application tests use substitutes for aggregate repositories, clocks, actor accessors, and external ports. Confirm the handler loads the correct aggregate, calls the intended domain behavior, stages the result, and returns the correct result.

Test validators for every structural error and stable error code. Do not mock Marten query internals.

### Test persistence and HTTP with PostgreSQL (BTEST.INTEGRATION.001)

Integration.Tests use Testcontainers PostgreSQL, the real Marten configuration, and `WebApplicationFactory` for API behavior.

Cover document mappings, repository loading and storage, query projections, commit behavior, Problem Details, authentication, resource authorization, OpenAPI, and extension-specific infrastructure.

CI executes this suite against the container on every change. A suite that cannot execute, a missing container, a broken host, or an authentication misconfiguration that rejects every request, fails the build. It never reports success by skipping or by passing only the cases that never reach the host, because a suite that silently stops running hides regressions until the boundary has already drifted.

### Isolate integration state (BTEST.ISOLATION.001)

Reset database state between cases using one documented strategy. Tests do not depend on order or share mutable business state.

Container and application host fixtures may be shared for cost. Test data may not leak between test cases.

### Enforce architecture rules (BTEST.ARCHITECTURE.001)

Architecture.Tests verify:

- Project reference direction.
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

Every acceptance criterion from a verified Use case appears in at least one recognized test reference:

```csharp
[Trait("AcceptanceCriterion", "AC-POSTS-CREATE-DRAFT-01")]
```

```gherkin
@AC-POSTS-CREATE-DRAFT-01
```

The trace is one-way. Internal implementation tests do not need an acceptance ID.

### Use evidence rather than one coverage target (BTEST.COVERAGE.001)

Collect line and branch coverage for review. Do not use one repository-wide percentage as the definition of sufficient testing.

Verified acceptance trace, Domain negative cases, integration boundaries, security behavior, and architecture rules remain required regardless of the percentage.

### Verify generated contracts (BTEST.GENERATED.001)

Generate OpenAPI and downstream API types during the verification flow. Fail when committed generated output differs.

### Use one production-faithful integration harness (BTEST.HARNESS.001)

`Integration.Tests` owns a PostgreSQL container fixture, `ApiFactory`, and `DatabaseReset`. The fixture starts the manifest-pinned PostgreSQL major once for a test collection or assembly and supplies its connection string before the WebApi host builds. `ApiFactory` targets the real `public partial Program`, replaces only external boundaries declared by the test, and retains production Marten, LiteBus, exception, authentication, authorization, and endpoint registration.

Reset every application schema object that can affect behavior, including Marten documents, sequences, outbox records, idempotency records, and scheduled work. Serialize tests that share one database, or give parallel tests isolated databases or schemas. Never depend on test order.

Security integration tests use locally issued JWTs that exercise the configured bearer validation, including issuer, audience, signature, lifetime, subject, scope, and role claims. A test authentication handler may simplify unrelated endpoint cases, but it is not evidence for authentication behavior.

## Conventions

### Mirror production module names

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

### Name tests by observable behavior

Use `{MethodOrOperation}_{Condition}_{ExpectedResult}` when it remains readable. A test class matches the production type it tests, such as `CreateDraftCommandHandlerTests` or `GetPostQueryHandlerTests`.

Avoid names such as `Test1`, `HappyPath`, or `Works`.

### Use builders for valid defaults

Create a test data builder when many tests need a valid aggregate with small variations. The builder produces valid state by default and exposes business-named customization.

Do not bypass domain methods to create impossible state unless a persistence compatibility test requires it.

### Keep assertions focused

Assert the state, event, call, response, or error relevant to the test. Avoid broad object snapshots that fail for unrelated field additions.

## Examples

A `PostTests.Publish_WhenDraft_MarksPostPublishedAndRaisesEvent` test uses no mocks. `CreateDraftCommandHandlerTests.HandleAsync_WhenValid_StoresCreatedPost` substitutes `IPostRepository` and `IClock`. `CreateDraftEndpointTests` uses the real API host and PostgreSQL.

## Verification

- Confirm test projects and folders match the canonical layout.
- Confirm Domain tests have no infrastructure dependency.
- Confirm integration tests use the real database and API host.
- Confirm CI executes the integration suite against the container, and that a suite which cannot execute fails the build rather than reporting success.
- Confirm the integration fixture uses the pinned PostgreSQL major and disposes its container and host.
- Confirm shared-database tests cannot run in parallel across reset boundaries.
- Confirm handler and validator test classes match the complete production type name.
- Search acceptance IDs from verified Use cases in test source.
- Run Release build, all tests, generated-contract comparison, and coverage collection.
