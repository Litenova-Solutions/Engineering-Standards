# Backend Testing

## Intent

Backend tests prove domain behavior, use-case coordination, real persistence and HTTP integration, and structural architecture at separate boundaries. Tests prove Cases: each Case of a use case is proved by a test that calls the use case and asserts its result.

## Agent Summary {#agent-summary}

- The solution holds the test projects its size profile requires. (standards/rule/backend-testing.keep-the-test-projects-the-size-profile-requires)
- Domain tests run on explicit inputs alone. (standards/rule/backend-testing.test-domain-in-isolation)
- Application tests substitute ports and assert coordination. (standards/rule/backend-testing.test-application-coordination)
- HTTP integration runs through the real host. (standards/rule/backend-testing.test-http-integration-through-the-real-host)
- Integration cases reset state and never depend on order. (standards/rule/backend-testing.isolate-integration-state)
- Architecture tests assert every compiler-invisible boundary. (standards/rule/backend-testing.enforce-architecture-rules)
- Each Case is proved by a test that calls its use case. (standards/rule/backend-testing.prove-each-case-with-a-test-that-calls-its-use-case)
- Each Rule is proved at its enforcement point. (standards/rule/backend-testing.prove-each-rule-at-its-enforcement-point)
- Coverage informs review; it is not the sufficiency test. (standards/rule/backend-testing.use-evidence-rather-than-one-coverage-target)
- One shared harness owns the container, host factory, and reset. (standards/rule/backend-testing.use-one-production-faithful-integration-harness)

## Standards

### Keep the test projects the size profile requires (standards/rule/backend-testing.keep-the-test-projects-the-size-profile-requires)

**Requirement:** A backend solution MUST hold the test projects its size profile requires and no other baseline test project. A small solution requires Architecture and Integration projects, with Acceptance optional. A large solution requires Architecture, Integration, and Acceptance projects.

**Rationale:** Unit test projects are optional in both profiles. An Acceptance project without the executable BDD extension is an unnamed baseline project: select the extension, or name the project for what it actually is.

**Example:** A test suite can contain:

```text
{ProjectName}.Architecture.Tests/
{ProjectName}.Integration.Tests/
{ProjectName}.Acceptance.Tests/
```

A small solution holds the first two; Acceptance appears when the executable BDD extension activates.

### Test Domain in isolation (standards/rule/backend-testing.test-domain-in-isolation)

**Requirement:** A Domain test MUST use explicit inputs with no database, HTTP host, container, clock, or mock.

**Rationale:** Domain tests cover factories, every lifecycle state, allowed and rejected transitions, invariants, value equality, collections, money rules, exceptions, and raised events.

### Test Application coordination (standards/rule/backend-testing.test-application-coordination)

**Requirement:** An Application test MUST substitute repositories, clocks, actor accessors, and external ports, then assert the handler's coordination.

**Rationale:** The assertion covers which aggregate loaded, which domain behavior ran, what was staged, and what returned. Validator tests cover each structural rule separately.

### Test HTTP integration through the real host (standards/rule/backend-testing.test-http-integration-through-the-real-host)

**Requirement:** An HTTP integration test MUST run through `WebApplicationFactory` with the real configuration, covering Problem Details, authentication, and resource authorization.

**Rationale:** Persistence behavior against PostgreSQL is covered by `standards/rule/backend-persistence.test-persistence-against-postgresql`. Both run on the harness that `standards/rule/backend-testing.use-one-production-faithful-integration-harness` owns.

### Isolate integration state (standards/rule/backend-testing.isolate-integration-state)

**Requirement:** An integration test MUST reset database state between cases through one documented strategy and depend on no test order.

**Rationale:** Container and host fixtures may still be shared for cost, because only mutable business state must not leak.

The default strategy is one database per test class, cloned from a migrated template. The harness applies the schema once per run to a template database. Each test class then receives `CREATE DATABASE ... TEMPLATE` of it and drops that database when the class finishes. A clone takes milliseconds, so every class starts from an empty migrated schema without a second container. A project that resets tables between cases instead records that strategy in its testing documentation.

### Enforce architecture rules (standards/rule/backend-testing.enforce-architecture-rules)

**Requirement:** An architecture test MUST assert the structural boundaries that `standards/rule/backend-architecture.test-structural-boundaries` names, and MUST run in the Release test pass.

**Rationale:** These are the boundaries a compiler does not enforce, so a review miss otherwise lands in the main branch.

### Prove each Case with a test that calls its use case (standards/rule/backend-testing.prove-each-case-with-a-test-that-calls-its-use-case)

**Requirement:** Each Case of a use case MUST be proved by a test carrying one `/// <proves>case/<use-case>.<name></proves>` tag naming that Case. The test MUST call the use case and assert its result: for a refusal, the Result code.

**Rationale:** The tag is the claim; the model builder confirms it. An acceptance scenario is confirmed when its When step belongs to the use case steps class. An integration test is confirmed when its body names the use case message type. A Case no test proves is recorded as a Known gap with owner and end date.

A test carries no coverage tag; the proves tag is its only record citation. The latest test run marks each confirmed claim passing or failing.

**Example:** An acceptance scenario for borrowing a library book carries its Case tag on the scenario method.

```csharp
/// <proves>case/borrow-book.book-borrowed-within-limit</proves>
```

### Prove each Rule at its enforcement point (standards/rule/backend-testing.prove-each-rule-at-its-enforcement-point)

**Requirement:** Each Rule MUST be proved at the point its `enforcedBy` names. A validator or guard Rule is proved through the Cases of the use cases it governs. An aggregate or store Rule is proved by a test carrying a proves tag for that Rule.

**Rationale:** A validator Rule is proved by a refused request. A store Rule is proved by an integration test that provokes the refusal. A reaction Rule is proved through the Cases of its reacting use case. The builder confirms an aggregate or store claim when the test body names the governed business record code type.

Input shape is a checked-before Rule enforced by the validator. A persistence constraint is an always-true Rule enforced by the store.

### Use evidence rather than one coverage target (standards/rule/backend-testing.use-evidence-rather-than-one-coverage-target)

**Requirement:** A repository MUST NOT treat one coverage percentage as the definition of sufficient testing.

**Rationale:** Line and branch coverage is collected for review. Case proof, Domain negative cases, integration boundaries, security behavior, and architecture rules remain the evidence.

### Use one production-faithful integration harness (standards/rule/backend-testing.use-one-production-faithful-integration-harness)

**Requirement:** The integration project MUST own one PostgreSQL container fixture, one `ApiFactory`, and one database isolation helper, either a `DatabaseReset` or a template database clone.

**Rationale:** The fixture starts the pinned PostgreSQL once per test run, as an xUnit v3 assembly fixture. It supplies each class its connection string before the host builds, so every test sees the same configuration. A container per test class multiplies the run time by the class count. It buys no isolation that a cloned database lacks.

"One harness" binds the integration project. An activated BDD extension brings its own host for the acceptance project, because the two projects run different lifetimes. That second host reuses this fixture's container and reset helper rather than starting another database.

## Conventions

### Mirror production module names (standards/rule/backend-testing.mirror-production-module-names)

**Default:** Mirror the production module and aggregate folder names inside each test project.

**Replacement:** A consumer records a departure as an Exception record naming this provision, with reason and review date.

**Rationale:** Test projects are exempt from the production folder rule for harness and flat files. A `Support` folder and flat Architecture test files need no production counterpart.

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

### Name tests by observable behavior (standards/rule/backend-testing.name-tests-by-observable-behavior)

**Default:** Name a test `{MethodOrOperation}_{Condition}_{ExpectedResult}` and its class after the production type it covers.

**Replacement:** A consumer records a departure as an Exception record naming this provision, with reason and review date.

**Rationale:** A name such as `Test1` or `HappyPath` describes the author's intent rather than the behavior that failed.

### Use builders for valid defaults (standards/rule/backend-testing.use-builders-for-valid-defaults)

**Default:** Create a test data builder that produces valid state by default and exposes business-named customization.

**Replacement:** A consumer records a departure as an Exception record naming this provision, with reason and review date.

**Rationale:** Bypassing domain methods to construct impossible state is reserved for a persistence compatibility test.

### Keep assertions focused (standards/rule/backend-testing.keep-assertions-focused)

**Default:** Assert only the state, event, call, response, or error that the test covers.

**Replacement:** A consumer records a departure as an Exception record naming this provision, with reason and review date.

**Rationale:** A broad object snapshot fails for an unrelated field addition, which trains readers to update it without reading it.

## Reference example

This informative example demonstrates `standards/rule/backend-testing.test-domain-in-isolation`, `standards/rule/backend-testing.test-application-coordination`, and `standards/rule/backend-testing.test-http-integration-through-the-real-host`.

A `PostTests.Publish_WhenDraft_MarksPostPublishedAndRaisesEvent` test uses no mocks. `CreateDraftCommandHandlerTests.HandleAsync_WhenValid_StoresCreatedPost` substitutes `IPostRepository` and `IClock`. `CreateDraftEndpointTests` uses the real API host with PostgreSQL.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| standards/rule/backend-testing.keep-the-test-projects-the-size-profile-requires | guidance | Does the solution hold the test projects its size profile requires and no other baseline project? |
| standards/rule/backend-testing.test-domain-in-isolation | guidance | Does each Domain test use explicit inputs with no database, host, container, clock, or mock? |
| standards/rule/backend-testing.test-application-coordination | guidance | Does each Application test substitute its ports and assert the handler coordination? |
| standards/rule/backend-testing.test-http-integration-through-the-real-host | guidance | Does each HTTP integration test run through the real host covering Problem Details, authentication, and authorization? |
| standards/rule/backend-testing.isolate-integration-state | guidance | Does each integration test reset state through the documented strategy with no order dependence? |
| standards/rule/backend-testing.enforce-architecture-rules | guidance | Do architecture tests assert the named structural boundaries and run in the Release pass? |
| standards/rule/backend-testing.prove-each-case-with-a-test-that-calls-its-use-case | guidance | Is each Case proved by a test carrying its proves tag, calling the use case and asserting its result? |
| standards/rule/backend-testing.prove-each-rule-at-its-enforcement-point | guidance | Is each Rule proved at its enforcement point, with store refusals provoked through integration? |
| standards/rule/backend-testing.use-evidence-rather-than-one-coverage-target | guidance | Is coverage collected for review with no percentage treated as sufficient testing? |
| standards/rule/backend-testing.use-one-production-faithful-integration-harness | guidance | Does the integration project own one container fixture, ApiFactory, and isolation helper? |
| standards/rule/backend-testing.mirror-production-module-names | guidance | Does each test tree mirror production module names apart from the exempt harness files? |
| standards/rule/backend-testing.name-tests-by-observable-behavior | guidance | Does each test name state operation, condition, and expected result on its production type class? |
| standards/rule/backend-testing.use-builders-for-valid-defaults | guidance | Does each test data builder produce valid state by default through its domain factory? |
| standards/rule/backend-testing.keep-assertions-focused | guidance | Does each test assert only its named outcome rather than a whole-object snapshot? |
