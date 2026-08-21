# Backend Testing

## Intent


Backend tests prove domain behavior, use-case coordination, real persistence and HTTP integration, and structural architecture at separate boundaries. Acceptance IDs connect observable product behavior to automated evidence without maintaining a second test inventory.

## Agent Summary {#agent-summary}


- Four test projects match the four boundaries. (BTEST.PROJECTS.001)
- Domain tests run on explicit inputs alone. (BTEST.DOMAIN.001)
- Application tests substitute ports and assert coordination. (BTEST.APPLICATION.001)
- Integration tests use real PostgreSQL and the real host. (BTEST.INTEGRATION.001)
- Integration cases reset state and never depend on order. (BTEST.ISOLATION.001)
- Architecture tests assert every compiler-invisible boundary. (BTEST.ARCHITECTURE.001)
- Every acceptance criterion is cited by an automated test. (BTEST.TRACE.001)
- Coverage informs review; it is not the sufficiency test. (BTEST.COVERAGE.001)
- Verification regenerates contracts and fails on drift. (BTEST.GENERATED.001)
- One shared harness owns the container, host factory, and reset. (BTEST.HARNESS.001)

## Standards


### Use four baseline test projects (BTEST.PROJECTS.001)

**Requirement:** A backend solution MUST contain Domain, Application, Integration, and Architecture test projects and no other baseline test project.

**Example:** A test suite can contain:

```text
apps/api/tests/{ProjectName}.Domain.Tests/
apps/api/tests/{ProjectName}.Application.Tests/
apps/api/tests/{ProjectName}.Integration.Tests/
apps/api/tests/{ProjectName}.Architecture.Tests/
```

Acceptance.Tests appears only when the executable BDD extension activates.

### Test Domain in isolation (BTEST.DOMAIN.001)

**Requirement:** A Domain test MUST use explicit inputs with no database, HTTP host, container, clock, or mock.

**Rationale:** Domain tests cover factories, every lifecycle state, allowed and rejected transitions, invariants, value equality, collections, money rules, exceptions, and raised events.

### Test Application coordination (BTEST.APPLICATION.001)

**Requirement:** An Application test MUST substitute repositories, clocks, actor accessors, and external ports, then assert the handler's coordination.

**Rationale:** The assertion covers which aggregate loaded, which domain behavior ran, what was staged, and what returned. Validator tests cover each structural rule separately.

### Test persistence and HTTP with PostgreSQL (BTEST.INTEGRATION.001)

**Requirement:** An integration test MUST run against Testcontainers PostgreSQL, the real Marten configuration, and `WebApplicationFactory`.

**Rationale:** Coverage includes mappings, repository load and store, projections, commit behavior, Problem Details, authentication, and resource authorization.

### Isolate integration state (BTEST.ISOLATION.001)

**Requirement:** An integration test MUST reset database state between cases through one documented strategy and depend on no test order.

**Rationale:** Container and host fixtures may still be shared for cost, because only mutable business state must not leak.

### Enforce architecture rules (BTEST.ARCHITECTURE.001)

**Requirement:** An architecture test MUST assert reference direction, package restrictions, type visibility, module folders, and aggregate inheritance.

**Rationale:** These are the boundaries a compiler does not enforce, so a review miss otherwise lands in the main branch.

### Trace acceptance criteria (BTEST.TRACE.001)

**Requirement:** Every acceptance criterion of a verified use case MUST appear in at least one recognized automated test reference.

**Rationale:** The citation connects executable evidence to approved behavior, so a verified claim is checkable rather than asserted.

**Example:**

```csharp
[Trait("AcceptanceCriterion", "AC-POSTS-CREATE-DRAFT-01")]
```

```gherkin
@AC-POSTS-CREATE-DRAFT-01
```

The trace is one-way. Internal implementation tests do not need an acceptance ID.

### Use evidence rather than one coverage target (BTEST.COVERAGE.001)

**Requirement:** A repository MUST NOT treat one coverage percentage as the definition of sufficient testing.

**Rationale:** Line and branch coverage is collected for review. Acceptance trace, Domain negative cases, integration boundaries, security behavior, and architecture rules remain the evidence.

### Verify generated contracts (BTEST.GENERATED.001)

**Requirement:** The verification flow MUST regenerate OpenAPI and downstream API types and fail when committed output differs.

**Rationale:** A generated contract that drifts from its source silently gives consumers a false description.

### Use one production-faithful integration harness (BTEST.HARNESS.001)

**Requirement:** The integration project MUST own one PostgreSQL container fixture, one `ApiFactory`, and one `DatabaseReset` helper.

**Rationale:** The fixture starts the pinned PostgreSQL once per collection and supplies its connection string before the host builds, so every test sees the same configuration.

## Conventions


### Mirror production module names (BTEST.CONVENTION.001)

**Default:** Mirror the production module and aggregate folder names inside each test project.

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

**Default:** Name a test `{MethodOrOperation}_{Condition}_{ExpectedResult}` and its class after the production type it covers.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A name such as `Test1` or `HappyPath` describes the author's intent rather than the behavior that failed.

### Use builders for valid defaults (BTEST.CONVENTION.003)

**Default:** Create a test data builder that produces valid state by default and exposes business-named customization.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Bypassing domain methods to construct impossible state is reserved for a persistence compatibility test.

### Keep assertions focused (BTEST.CONVENTION.004)

**Default:** Assert only the state, event, call, response, or error that the test covers.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A broad object snapshot fails for an unrelated field addition, which trains readers to update it without reading it.

## Reference example

This informative example demonstrates `BTEST.DOMAIN.001`, `BTEST.APPLICATION.001`, and `BTEST.INTEGRATION.001`.

A `PostTests.Publish_WhenDraft_MarksPostPublishedAndRaisesEvent` test uses no mocks. `CreateDraftCommandHandlerTests.HandleAsync_WhenValid_StoresCreatedPost` substitutes `IPostRepository` and `IClock`. `CreateDraftEndpointTests` uses the real API host and PostgreSQL.

## Verification


| ID | Method | Evidence |
|:---|:---|:---|
| BTEST.PROJECTS.001 | test | `SolutionStructureTests` asserts the solution contains exactly the four baseline test projects. |
| BTEST.DOMAIN.001 | test | `ArchitectureTests` asserts the Domain test project references no database, host, container, or mocking package. |
| BTEST.APPLICATION.001 | test | `ApplicationHandlerTests` asserts the loaded aggregate, invoked behavior, staged change, and returned result for each handler. |
| BTEST.INTEGRATION.001 | test | `IntegrationTests` starts the manifest-pinned PostgreSQL container and the real WebApi host for each covered boundary. |
| BTEST.ISOLATION.001 | test | `DatabaseResetTests` asserts a randomized case order passes and no case observes another case's data. |
| BTEST.ARCHITECTURE.001 | test | `ArchitectureTests` covers each listed structural boundary and runs in the Release test pass. |
| BTEST.TRACE.001 | test | `node standards/tools/validate-consumer.mjs` resolves each acceptance identifier to a test source reference. |
| BTEST.COVERAGE.001 | operation | The CI test job publishes coverage as a review artifact and gates on no percentage threshold. |
| BTEST.GENERATED.001 | test | The CI contract job regenerates `apps/api/openapi/` and typed clients, then fails on any tree difference. |
| BTEST.HARNESS.001 | test | `IntegrationTests` resolves its container fixture, `ApiFactory`, and `DatabaseReset` from one shared harness. |
| BTEST.CONVENTION.001 | test | Folder review compares each test tree against its production module list, or records a named local replacement. |
| BTEST.CONVENTION.002 | test | `TestNamingTests` asserts each test class name matches a production type and each method carries the three-part form. |
| BTEST.CONVENTION.003 | test | Builder review confirms each builder produces a valid aggregate by default through its domain factory. |
| BTEST.CONVENTION.004 | test | Assertion review confirms each test asserts its named outcome rather than a whole-object snapshot. |
