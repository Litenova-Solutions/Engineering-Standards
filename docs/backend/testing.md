# Backend Testing

## Intent


Backend tests prove domain behavior, use-case coordination, real persistence and HTTP integration, and structural architecture at separate boundaries. Acceptance IDs connect observable product behavior to automated evidence without maintaining a second test inventory.

## Agent Summary {#agent-summary}


- Four test projects match the four boundaries. (standards/rule/backend-testing.use-four-baseline-test-projects)
- Domain tests run on explicit inputs alone. (standards/rule/backend-testing.test-domain-in-isolation)
- Application tests substitute ports and assert coordination. (standards/rule/backend-testing.test-application-coordination)
- Integration tests use real PostgreSQL and the real host. (standards/rule/backend-testing.test-persistence-and-http-with-postgresql)
- Integration cases reset state and never depend on order. (standards/rule/backend-testing.isolate-integration-state)
- Architecture tests assert every compiler-invisible boundary. (standards/rule/backend-testing.enforce-architecture-rules)
- Every acceptance criterion is cited by an automated test, in one exact form. (standards/rule/backend-testing.cite-an-acceptance-criterion-in-one-exact-form)
- Coverage informs review; it is not the sufficiency test. (standards/rule/backend-testing.use-evidence-rather-than-one-coverage-target)
- Verification regenerates contracts and fails on drift. (standards/rule/backend-testing.verify-generated-contracts)
- One shared harness owns the container, host factory, and reset. (standards/rule/backend-testing.use-one-production-faithful-integration-harness)

## Standards


### Use four baseline test projects (standards/rule/backend-testing.use-four-baseline-test-projects)

**Requirement:** A backend solution MUST contain Domain, Application, Integration, and Architecture test projects and no other baseline test project.

**Example:** A test suite can contain:

```text
apps/api/tests/{ProjectName}.Domain.Tests/
apps/api/tests/{ProjectName}.Application.Tests/
apps/api/tests/{ProjectName}.Integration.Tests/
apps/api/tests/{ProjectName}.Architecture.Tests/
```

Acceptance.Tests appears only when the executable BDD extension activates. A solution that ships a project of that name without selecting `bdd` has an unnamed fifth baseline project, which this rule refuses. Select the extension, or name the project for what it actually is.

### Test Domain in isolation (standards/rule/backend-testing.test-domain-in-isolation)

**Requirement:** A Domain test MUST use explicit inputs with no database, HTTP host, container, clock, or mock.

**Rationale:** Domain tests cover factories, every lifecycle state, allowed and rejected transitions, invariants, value equality, collections, money rules, exceptions, and raised events.

### Test Application coordination (standards/rule/backend-testing.test-application-coordination)

**Requirement:** An Application test MUST substitute repositories, clocks, actor accessors, and external ports, then assert the handler's coordination.

**Rationale:** The assertion covers which aggregate loaded, which domain behavior ran, what was staged, and what returned. Validator tests cover each structural rule separately.

### Test persistence and HTTP with PostgreSQL (standards/rule/backend-testing.test-persistence-and-http-with-postgresql)

**Requirement:** An integration test MUST run against Testcontainers PostgreSQL, the real Marten configuration, and `WebApplicationFactory`.

**Rationale:** Coverage includes mappings, repository load and store, projections, commit behavior, Problem Details, authentication, and resource authorization.

### Isolate integration state (standards/rule/backend-testing.isolate-integration-state)

**Requirement:** An integration test MUST reset database state between cases through one documented strategy and depend on no test order.

**Rationale:** Container and host fixtures may still be shared for cost, because only mutable business state must not leak.

### Enforce architecture rules (standards/rule/backend-testing.enforce-architecture-rules)

**Requirement:** An architecture test MUST assert reference direction, package restrictions, type visibility, module folders, and aggregate inheritance.

**Rationale:** These are the boundaries a compiler does not enforce, so a review miss otherwise lands in the main branch.

### Cite an acceptance criterion in one exact form (standards/rule/backend-testing.cite-an-acceptance-criterion-in-one-exact-form)

**Requirement:** Every acceptance criterion of a verified use case MUST be cited by a C# test carrying `[Trait("AcceptanceCriterion", "<identifier>")]` or by a scenario tag.

**Rationale:** The earlier rule asked for a recognized reference and named no form. A scan then had to guess which string in a test file was a citation. A comment, a variable name, and a skipped test all carried the identifier and none of them proved anything. One trait key and one value make the scan exact, and the identifier is the same one a feature file carries as a tag.

**Example:** A C# test states the criterion it proves as a trait.

```csharp
[Fact]
[Trait("AcceptanceCriterion", "AC-POSTS-CREATE-DRAFT-01")]
public void Draft_is_created_with_no_title() { }
```

```gherkin
@AC-POSTS-CREATE-DRAFT-01
```

The trace is one-way. Internal implementation tests carry no acceptance identifier.

### Use evidence rather than one coverage target (standards/rule/backend-testing.use-evidence-rather-than-one-coverage-target)

**Requirement:** A repository MUST NOT treat one coverage percentage as the definition of sufficient testing.

**Rationale:** Line and branch coverage is collected for review. Acceptance trace, Domain negative cases, integration boundaries, security behavior, and architecture rules remain the evidence.

### Verify generated contracts (standards/rule/backend-testing.verify-generated-contracts)

**Requirement:** The verification flow MUST regenerate OpenAPI and downstream API types and fail when committed output differs.

**Rationale:** A generated contract that drifts from its source silently gives consumers a false description.

### Use one production-faithful integration harness (standards/rule/backend-testing.use-one-production-faithful-integration-harness)

**Requirement:** The integration project MUST own one PostgreSQL container fixture, one `ApiFactory`, and one `DatabaseReset` helper.

**Rationale:** The fixture starts the pinned PostgreSQL once per collection and supplies its connection string before the host builds, so every test sees the same configuration.

"One harness" binds the integration project. An activated BDD extension brings its own host for the acceptance project, because the two projects run different lifetimes. That second host reuses this fixture's container and reset helper rather than starting another database.

## Conventions


### Mirror production module names (standards/rule/backend-testing.mirror-production-module-names)

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

### Name tests by observable behavior (standards/rule/backend-testing.name-tests-by-observable-behavior)

**Default:** Name a test `{MethodOrOperation}_{Condition}_{ExpectedResult}` and its class after the production type it covers.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A name such as `Test1` or `HappyPath` describes the author's intent rather than the behavior that failed.

### Use builders for valid defaults (standards/rule/backend-testing.use-builders-for-valid-defaults)

**Default:** Create a test data builder that produces valid state by default and exposes business-named customization.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Bypassing domain methods to construct impossible state is reserved for a persistence compatibility test.

### Keep assertions focused (standards/rule/backend-testing.keep-assertions-focused)

**Default:** Assert only the state, event, call, response, or error that the test covers.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A broad object snapshot fails for an unrelated field addition, which trains readers to update it without reading it.

## Reference example

This informative example demonstrates `standards/rule/backend-testing.test-domain-in-isolation`, `standards/rule/backend-testing.test-application-coordination`, and `standards/rule/backend-testing.test-persistence-and-http-with-postgresql`.

A `PostTests.Publish_WhenDraft_MarksPostPublishedAndRaisesEvent` test uses no mocks. `CreateDraftCommandHandlerTests.HandleAsync_WhenValid_StoresCreatedPost` substitutes `IPostRepository` and `IClock`. `CreateDraftEndpointTests` uses the real API host and PostgreSQL.

## Verification


| ID | Method | Evidence |
|:---|:---|:---|
| standards/rule/backend-testing.use-four-baseline-test-projects | test | `SolutionStructureTests` asserts the solution contains exactly the four baseline test projects. |
| standards/rule/backend-testing.test-domain-in-isolation | test | `ArchitectureTests` asserts the Domain test project references no database, host, container, or mocking package. |
| standards/rule/backend-testing.test-application-coordination | test | `ApplicationHandlerTests` asserts the loaded aggregate, invoked behavior, staged change, and returned result for each handler. |
| standards/rule/backend-testing.test-persistence-and-http-with-postgresql | test | `IntegrationTests` starts the manifest-pinned PostgreSQL container and the real WebApi host for each covered boundary. |
| standards/rule/backend-testing.isolate-integration-state | test | `DatabaseResetTests` asserts a randomized case order passes and no case observes another case's data. |
| standards/rule/backend-testing.enforce-architecture-rules | test | `ArchitectureTests` covers each listed structural boundary and runs in the Release test pass. |
| standards/rule/backend-testing.cite-an-acceptance-criterion-in-one-exact-form | static | `node standards/tools/validate-consumer.mjs` reads the declared test roots, and reports a citation naming no criterion. |
| standards/rule/backend-testing.use-evidence-rather-than-one-coverage-target | operation | The CI test job publishes coverage as a review artifact and gates on no percentage threshold. |
| standards/rule/backend-testing.verify-generated-contracts | test | The CI contract job regenerates `apps/api/openapi/` and typed clients, then fails on any tree difference. |
| standards/rule/backend-testing.use-one-production-faithful-integration-harness | test | `IntegrationTests` resolves its container fixture, `ApiFactory`, and `DatabaseReset` from one shared harness. |
| standards/rule/backend-testing.mirror-production-module-names | inspection | Folder review compares each test tree against its production module list, or records a named local replacement. |
| standards/rule/backend-testing.name-tests-by-observable-behavior | test | `TestNamingTests` asserts each test class name matches a production type and each method carries the three-part form. |
| standards/rule/backend-testing.use-builders-for-valid-defaults | inspection | Builder review confirms each builder produces a valid aggregate by default through its domain factory. |
| standards/rule/backend-testing.keep-assertions-focused | inspection | Assertion review confirms each test asserts its named outcome rather than a whole-object snapshot. |
