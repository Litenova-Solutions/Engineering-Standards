# Backend Testing

## Intent

Backend tests prove domain behavior, use-case coordination, real persistence and HTTP integration, and structural architecture at separate boundaries. Tests prove Cases: each Case of a use case is proved by a test that calls the use case and asserts its result.

## Agent Summary {#agent-summary}

- The codebase holds the test suites its size profile requires. (litespec/rule/backend-testing.keep-the-test-suites-the-size-profile-requires)
- Domain tests run on explicit inputs alone. (litespec/rule/backend-testing.test-domain-in-isolation)
- Application tests substitute ports and assert coordination. (litespec/rule/backend-testing.test-application-coordination)
- HTTP integration runs through the real application host. (litespec/rule/backend-testing.test-http-integration-through-the-real-application-host)
- Integration cases reset state and never depend on order. (litespec/rule/backend-testing.isolate-integration-state)
- Architecture tests assert every compiler-invisible boundary. (litespec/rule/backend-testing.assert-architecture-boundaries-with-tests)
- Each Case is proved by its calling test, and each Rule at its enforcement point. (litespec/rule/backend-testing.tag-the-test-that-proves-each-case, litespec/rule/backend-testing.prove-each-rule-at-its-enforcement-point)
- Coverage informs review; it is not the sufficiency test. (litespec/rule/backend-testing.use-evidence-rather-than-one-coverage-target)
- One shared harness owns the container, host factory, and reset. (litespec/rule/backend-testing.share-one-production-faithful-integration-harness)
- Test code mirrors production modules, names behavior, uses builders, and keeps assertions focused. (litespec/rule/backend-testing.mirror-production-module-names, litespec/rule/backend-testing.name-tests-by-observable-behavior, litespec/rule/backend-testing.use-builders-for-valid-defaults, litespec/rule/backend-testing.keep-assertions-focused)

## Standards

### Keep the test suites the size profile requires (litespec/rule/backend-testing.keep-the-test-suites-the-size-profile-requires)

**Requirement:** A backend codebase MUST hold exactly the test suites its size profile requires: architecture and integration for small, adding acceptance for large.

**Rationale:** Unit test suites are optional in both profiles. Acceptance stays optional for small. An acceptance suite without the executable BDD extension is an unnamed baseline suite: select the extension, or name the suite for what it actually is.

**Example:** A backend codebase can contain:

```text
architecture-tests/
integration-tests/
acceptance-tests/
```

A small codebase holds the first two; acceptance appears when the executable BDD extension activates.

### Test Domain in isolation (litespec/rule/backend-testing.test-domain-in-isolation)

**Requirement:** A Domain test MUST use explicit inputs with no database, HTTP host, container, clock, or mock.

**Rationale:** Domain tests cover factories, every lifecycle state, allowed and rejected transitions, invariants, value equality, collections, money rules, exceptions, and raised events.

### Test Application coordination (litespec/rule/backend-testing.test-application-coordination)

**Requirement:** An Application test MUST substitute repositories, clocks, actor accessors, and external ports, then assert the handler's coordination.

**Rationale:** The assertion covers which aggregate loaded, which domain behavior ran, what was staged, and what returned. Validator tests cover each structural rule separately.

### Test HTTP integration through the real application host (litespec/rule/backend-testing.test-http-integration-through-the-real-application-host)

**Requirement:** An HTTP integration test MUST run through the real application host with the real configuration, covering Problem Details, authentication, and resource authorization.

**Rationale:** Persistence behavior against PostgreSQL is covered by `litespec/rule/backend-persistence.test-persistence-against-postgresql`. Both run on the harness that `litespec/rule/backend-testing.share-one-production-faithful-integration-harness` owns.

### Isolate integration state (litespec/rule/backend-testing.isolate-integration-state)

**Requirement:** An integration test MUST reset database state between cases through one documented strategy and depend on no test order.

**Rationale:** Container and host fixtures may still be shared for cost, because only mutable business state must not leak.

The default strategy is one database per test class, cloned from a migrated template. The harness applies the schema once per run to a template database. Each test class then receives `CREATE DATABASE ... TEMPLATE` of it and drops that database when the class finishes. A clone takes milliseconds, so every class starts from an empty migrated schema without a second container. A project that resets tables between cases instead records that strategy in its testing documentation.

### Assert architecture boundaries with tests (litespec/rule/backend-testing.assert-architecture-boundaries-with-tests)

**Requirement:** An architecture test MUST assert the structural boundaries that `litespec/rule/backend-architecture.test-structural-boundaries` names.

**Rationale:** These are the boundaries a compiler does not enforce, so a review miss otherwise lands in the main branch.

### Tag the test that proves each Case (litespec/rule/backend-testing.tag-the-test-that-proves-each-case)

**Requirement:** Each Case MUST be proved by a test carrying its proves tag and calling its use case.

**Rationale:** The tag is the claim; the model builder confirms it. An acceptance scenario is confirmed when its When step belongs to the use case steps class. An integration test is confirmed when its body names the use case message type. A Case no test proves is recorded as a Known gap with owner and end date. The test asserts the result, and for a refusal the Result code.

A test carries no coverage tag; the proves tag is its only record citation. The latest test run marks each confirmed claim passing or failing.

**Example:** An acceptance scenario for borrowing a library book carries its Case tag on the scenario method.

### Prove each Rule at its enforcement point (litespec/rule/backend-testing.prove-each-rule-at-its-enforcement-point)

**Requirement:** Each Rule MUST be proved at the point its `enforcedBy` names: governed Cases for validator and guard Rules, a proves tag otherwise.

**Rationale:** A validator Rule is proved by a refused request. A store Rule is proved by an integration test that provokes the refusal. A reaction Rule is proved through the Cases of its reacting use case. The builder confirms an aggregate or store claim when the test body names the governed business record code type.

Input shape is a checked-before Rule enforced by the validator. A persistence constraint is an always-true Rule enforced by the store.

### Use evidence rather than one coverage target (litespec/rule/backend-testing.use-evidence-rather-than-one-coverage-target)

**Requirement:** A repository MUST NOT treat one coverage percentage as the definition of sufficient testing.

**Rationale:** Line and branch coverage is collected for review. Case proof, Domain negative cases, integration boundaries, security behavior, and architecture rules remain the evidence.

### Share one production-faithful integration harness (litespec/rule/backend-testing.share-one-production-faithful-integration-harness)

**Requirement:** The integration suite MUST own one database container fixture, one application host factory, and one database isolation helper.

**Rationale:** The fixture starts the pinned PostgreSQL once per test run. It supplies each test group its connection string before the host builds, so every test sees the same configuration. A container per test group multiplies the run time by the group count. It buys no isolation that a cloned database lacks.

"One harness" binds the integration suite. An activated BDD extension brings its own host for the acceptance suite, because the two suites run different lifetimes. That second host reuses this fixture's container and reset helper rather than starting another database.

## Conventions

### Mirror production module names (litespec/rule/backend-testing.mirror-production-module-names)

**Default:** Mirror the production module and aggregate folder names inside each test project.

**Replacement:** A consumer records a departure as an Exception record naming this provision, with reason and review date.

**Rationale:** Test projects are exempt from the production folder rule for harness and flat files. A `Support` folder and flat Architecture test files need no production counterpart.

**Example:** In the dotnet stack, the mirrored trees use test projects that carry the production module folders.

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

### Name tests by observable behavior (litespec/rule/backend-testing.name-tests-by-observable-behavior)

**Default:** Name a test `{MethodOrOperation}_{Condition}_{ExpectedResult}` and its class after the production type it covers.

**Replacement:** A consumer records a departure as an Exception record naming this provision, with reason and review date.

**Rationale:** A name such as `Test1` or `HappyPath` describes the author's intent rather than the behavior that failed.

### Use builders for valid defaults (litespec/rule/backend-testing.use-builders-for-valid-defaults)

**Default:** Create a test data builder that produces valid state by default and exposes business-named customization.

**Replacement:** A consumer records a departure as an Exception record naming this provision, with reason and review date.

**Rationale:** Bypassing domain methods to construct impossible state is reserved for a persistence compatibility test.

### Keep assertions focused (litespec/rule/backend-testing.keep-assertions-focused)

**Default:** Assert only the state, event, call, response, or error that the test covers.

**Replacement:** A consumer records a departure as an Exception record naming this provision, with reason and review date.

**Rationale:** A broad object snapshot fails for an unrelated field addition, which trains readers to update it without reading it.

## Reference example

This informative example demonstrates `litespec/rule/backend-testing.test-domain-in-isolation`, `litespec/rule/backend-testing.test-application-coordination`, and `litespec/rule/backend-testing.test-http-integration-through-the-real-application-host`.

A `PostTests.Publish_WhenDraft_MarksPostPublishedAndRaisesEvent` test uses no mocks. `CreateDraftCommandHandlerTests.HandleAsync_WhenValid_StoresCreatedPost` substitutes `IPostRepository` and `IClock`. `CreateDraftEndpointTests` uses the real API host with PostgreSQL.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/rule/backend-testing.keep-the-test-suites-the-size-profile-requires | guidance | Does the codebase hold the test suites its size profile requires and no other baseline suite? |
| litespec/rule/backend-testing.test-domain-in-isolation | guidance | Does each Domain test use explicit inputs with no database, host, container, clock, or mock? |
| litespec/rule/backend-testing.test-application-coordination | guidance | Does each Application test substitute its ports and assert the handler coordination? |
| litespec/rule/backend-testing.test-http-integration-through-the-real-application-host | guidance | Does each HTTP integration test run through the real host covering Problem Details, authentication, and authorization? |
| litespec/rule/backend-testing.isolate-integration-state | guidance | Does each integration test reset state through the documented strategy with no order dependence? |
| litespec/rule/backend-testing.assert-architecture-boundaries-with-tests | guidance | Do architecture tests assert the named structural boundaries? |
| litespec/rule/backend-testing.tag-the-test-that-proves-each-case | guidance | Is each Case proved by a test carrying its proves tag, calling the use case and asserting its result? |
| litespec/rule/backend-testing.prove-each-rule-at-its-enforcement-point | guidance | Is each Rule proved at its enforcement point, with store refusals provoked through integration? |
| litespec/rule/backend-testing.use-evidence-rather-than-one-coverage-target | guidance | Is coverage collected for review with no percentage treated as sufficient testing? |
| litespec/rule/backend-testing.share-one-production-faithful-integration-harness | guidance | Does the integration suite own one container fixture, host factory, and isolation helper? |
| litespec/rule/backend-testing.mirror-production-module-names | guidance | Does each test project tree list the same module folders as production, apart from the exempt harness files? |
| litespec/rule/backend-testing.name-tests-by-observable-behavior | guidance | Does each test name state operation, condition, and expected result on its production type class? |
| litespec/rule/backend-testing.use-builders-for-valid-defaults | guidance | Does each test data builder produce valid state by default through its domain factory? |
| litespec/rule/backend-testing.keep-assertions-focused | guidance | Does each test assert only its named outcome rather than a whole-object snapshot? |
