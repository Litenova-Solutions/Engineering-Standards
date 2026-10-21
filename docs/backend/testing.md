# Backend Testing

## Intent

Backend tests prove Domain behavior, use-case coordination, real persistence and HTTP integration, and structural architecture at separate boundaries. A test that calls the use case and asserts its result proves each Case of a use case.

## Standards

### Keep the test suites the size requires

**Requirement:** A backend codebase MUST hold exactly the test suites its size requires: architecture and integration for small, adding acceptance for large.

**Rationale:** Unit test suites are optional in both sizes. Acceptance stays optional for small. An acceptance suite without the executable BDD extension is an unnamed baseline suite: select the extension, or name the suite for what it actually is.

**Example:** A backend codebase can contain:

```text
architecture-tests/
integration-tests/
acceptance-tests/
```

A small codebase holds the first two. Acceptance appears when the executable BDD extension activates.

### Test Domain in isolation

**Requirement:** A Domain test MUST use explicit inputs with no database, HTTP host, container, clock, or mock.

**Rationale:** Domain tests cover factories, every lifecycle state, allowed and rejected transitions, invariants, value equality, collections, money rules, exceptions, and raised events.

### Test Application coordination

**Requirement:** An Application test MUST substitute repositories, clocks, actor accessors, and external ports, then assert the handler's coordination.

**Rationale:** The assertion covers which aggregate was loaded, which Domain behavior ran, what was staged, and what was returned. Validator tests cover each structural rule separately.

**Example:** For example, in the .NET stack a borrow-copy handler test substitutes the repositories with the clock, and asserts the coordination:

```csharp
var handler = new BorrowCopyCommandHandler(loans, copies, clock);

var result = await handler.HandleAsync(
    new BorrowCopyCommand(copyId, readerId), CancellationToken.None);

Assert.NotEqual(Guid.Empty, result.LoanId);
```

The test asserts which aggregate was loaded, what was staged, and what was returned. A second test names an unavailable copy and asserts the `failure/lending.copy_not_available` refusal. Neither test opens a database connection, because the repositories are substitutes.

### Test HTTP integration through the real application host

**Requirement:** An HTTP integration test MUST run through the real application host with the real configuration, covering Problem Details, authentication, and resource authorization.

**Rationale:** `litespec/backend/persistence#test-persistence-against-postgresql` covers persistence behavior against PostgreSQL. Both run on the harness that `litespec/backend/testing#share-one-production-faithful-integration-harness` owns.

### Isolate integration state

**Requirement:** An integration test MUST reset database state between cases through one documented strategy and depend on no test order.

**Rationale:** Container and host fixtures may still be shared for cost, because only mutable business state must not leak.

The default strategy is one database per test class, cloned from a migrated template. The harness applies the schema once per run to a template database. Each test class then receives its database with `CREATE DATABASE ... TEMPLATE` and drops that database when the class finishes. A clone takes milliseconds, so every class starts from an empty migrated schema without a second container. A project that resets tables between cases instead records that strategy in its testing documentation.

### Assert architecture boundaries with tests

**Requirement:** An architecture test MUST assert the structural boundaries that `litespec/backend/architecture#test-structural-boundaries` names.

**Rationale:** These are the boundaries a compiler does not enforce, so a review miss otherwise lands in the main branch.

### Tag the test that proves each Case

**Requirement:** Each Case MUST be proved by a test carrying its proves tag and calling its use case.

**Rationale:** The tag is the claim; the model builder confirms it. The model builder confirms an acceptance scenario when its `When` step belongs to the use case steps class. It confirms an integration test when its body names the use case message type. You record a Case no test proves as a Known gap with owner and end date. The test asserts the result, and it asserts the Result code for a refusal.

A test carries no coverage tag. The `proves` tag is its only record citation. The latest test run marks each confirmed claim passing or failing.

**Example:** An acceptance scenario for borrowing a library book carries its Case tag on the scenario method. In the library circulation product, `BorrowCopyScenarios.Borrowing_an_available_copy_succeeds` in `apps/api/tests/Library.Acceptance.Tests/Lending/Loans/BorrowCopy/BorrowCopyScenarios.cs` carries the tag for `case/borrow-copy.borrowing-an-available-copy-succeeds`, and its `When` step belongs to the `BorrowCopySteps` use case steps class:

```csharp
/// <proves>case/borrow-copy.borrowing-an-available-copy-succeeds</proves>
public Task Borrowing_an_available_copy_succeeds() => Runner.RunScenarioAsync(
    given => new RegisterCopySteps().RegisterACopy("copy-1"),
    when => new BorrowCopySteps().BorrowACopy("reader-1", "copy-1"),
    then => new BorrowCopySteps().TheLoanIsActive());
```

The tag names the Case, the steps call the borrow-copy use case, and the model builder confirms the claim because the `When` step belongs to the use case steps class.

### Prove each Rule at its enforcement point

**Requirement:** Each Rule MUST be proved at the point its `enforcedBy` names: governed Cases for validator and guard Rules, a proves tag otherwise.

**Rationale:** A refused request proves a validator Rule. An integration test that provokes the refusal proves a store Rule. The Cases of its reacting use case prove a reaction Rule. The builder confirms an aggregate or store claim when the test body names the governed business record code type.

The validator enforces input shape as a checked-before Rule. The store enforces a persistence constraint as an always-true Rule.

### Use evidence rather than one coverage target

**Requirement:** A repository MUST NOT treat one coverage percentage as the definition of sufficient testing.

**Rationale:** You collect line and branch coverage for review. Case proof, Domain negative cases, integration boundaries, security behavior, and architecture rules remain the evidence.

### Share one production-faithful integration harness

**Requirement:** The integration suite MUST own one database container fixture, one application host factory, and one database isolation helper.

**Rationale:** The fixture starts the pinned PostgreSQL once per test run. It supplies each test group its connection string before the host builds, so every test sees the same configuration. A container per test group multiplies the run time by the group count. It buys no isolation that a cloned database lacks.

"One harness" binds the integration suite. An activated BDD extension brings its own host for the acceptance suite, because the two suites run different lifetimes. That second host reuses this fixture's container and reset helper rather than starting another database.

## Conventions

### Mirror production module names

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

### Name tests by observable behavior

**Default:** Name a test `{MethodOrOperation}_{Condition}_{ExpectedResult}` and its class after the production type it covers.

**Replacement:** A consumer records a departure as an Exception record naming this provision, with reason and review date.

**Rationale:** A name such as `Test1` or `HappyPath` describes the author's intent rather than the behavior that failed.

### Use builders for valid defaults

**Default:** Create a test data builder that produces valid state by default and exposes business-named customization.

**Replacement:** A consumer records a departure as an Exception record naming this provision, with reason and review date.

**Rationale:** You reserve bypassing Domain methods to construct impossible state for a persistence compatibility test.

### Keep assertions focused

**Default:** Assert only the state, event, call, response, or error that the test covers.

**Replacement:** A consumer records a departure as an Exception record naming this provision, with reason and review date.

**Rationale:** A broad object snapshot fails for an unrelated field addition, which trains readers to update it without reading it.

## Reference example

This informative example demonstrates `litespec/backend/testing#test-domain-in-isolation`, `litespec/backend/testing#test-application-coordination`, and `litespec/backend/testing#test-http-integration-through-the-real-application-host`.

A `PostTests.Publish_WhenDraft_MarksPostPublishedAndRaisesEvent` test uses no mocks. `CreateDraftCommandHandlerTests.HandleAsync_WhenValid_StoresCreatedPost` substitutes `IPostRepository` and `IClock`. `CreateDraftEndpointTests` uses the real API host with PostgreSQL.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/backend/testing#keep-the-test-suites-the-size-requires | guidance | Does the codebase hold the test suites its size requires and no other baseline suite? |
| litespec/backend/testing#test-domain-in-isolation | guidance | Does each Domain test use explicit inputs with no database, host, container, clock, or mock? |
| litespec/backend/testing#test-application-coordination | guidance | Does each Application test substitute its ports and assert the handler coordination? |
| litespec/backend/testing#test-http-integration-through-the-real-application-host | guidance | Does each HTTP integration test run through the real host covering Problem Details, authentication, and authorization? |
| litespec/backend/testing#isolate-integration-state | guidance | Does each integration test reset state through the documented strategy with no order dependence? |
| litespec/backend/testing#assert-architecture-boundaries-with-tests | guidance | Do architecture tests assert the named structural boundaries? |
| litespec/backend/testing#tag-the-test-that-proves-each-case | guidance | Does a test carrying its `proves` tag, calling the use case and asserting its result, prove each Case? |
| litespec/backend/testing#prove-each-rule-at-its-enforcement-point | guidance | Does a test at the enforcement point prove each Rule, with store refusals provoked through integration? |
| litespec/backend/testing#use-evidence-rather-than-one-coverage-target | guidance | Do you collect coverage for review with no percentage treated as sufficient testing? |
| litespec/backend/testing#share-one-production-faithful-integration-harness | guidance | Does the integration suite own one container fixture, host factory, and isolation helper? |
| litespec/backend/testing#mirror-production-module-names | guidance | Does each test project tree list the same module folders as production, apart from the exempt harness files? |
| litespec/backend/testing#name-tests-by-observable-behavior | guidance | Does each test name state operation, condition, and expected result on its production type class? |
| litespec/backend/testing#use-builders-for-valid-defaults | guidance | Does each test data builder produce valid state by default through its Domain factory? |
| litespec/backend/testing#keep-assertions-focused | guidance | Does each test assert only its named outcome rather than a whole-object snapshot? |
