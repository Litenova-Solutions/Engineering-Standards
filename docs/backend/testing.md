# Backend Testing

## Intent

Backend tests prove 4 things at 4 separate boundaries: Domain behavior with no dependencies, use-case coordination with test stand-ins for repositories, clocks, and external ports, real persistence and HTTP behavior through the production host, and structural rules with architecture tests. A use case is one command or query, and this page states which suites each project size (small or large) keeps, what each suite may use, and how tests prove the Cases and Rules the specification records. A Case states one behavior the product must show, and a Rule states one commitment that holds. Separate boundaries keep fast tests fast and make each failure point at the layer that broke.

## Concepts

### Test boundaries

Each suite proves one boundary and runs with one set of tools. A test belongs to the suite whose boundary it proves.

| Suite | Proves | Runs with |
|:---|:---|:---|
| Domain | Factories, lifecycles, invariants, and value behavior | Explicit inputs only, with no database, host, container, clock, or mock |
| Application | Handler coordination: what was loaded, called, staged, and returned | Substituted repositories, clocks, actor accessors, and ports |
| Integration | Real persistence and HTTP behavior through the production host | The pinned PostgreSQL in a container and the real application host |
| Architecture | Project references, visibility, folders, and inheritance | Static checks over the compiled code |
| Acceptance | End-to-end behavior for large projects | The executable BDD extension and its host |

### Proof tags

A [Case](../reference/glossary.md) states one behavior the product must show, and a [Rule](../reference/glossary.md) states one commitment that holds. A test proves a Case by carrying a `proves` tag naming it, calling its use case, and asserting its result. A Rule is proved at the point its `enforcedBy` names, so the test for a validator Rule provokes a refusal while the test for a store Rule runs against the database. The model builder confirms each claim from the test body, and the latest test run marks it passing or failing.

## Standards

### Keep the test suites the size requires

**Requirement:** A backend codebase MUST hold exactly the test suites its size requires: architecture and integration for small, adding acceptance for large.

**Rationale:** Each suite owns one boundary and one harness, so a project that keeps exactly its suites knows where each new test belongs. A missing suite pushes its tests into another suite's harness, where they run with the wrong fixtures, and an extra unnamed suite collects the tests nobody placed. Unit suites stay optional in both sizes, and acceptance stays optional for small. An acceptance suite without the executable BDD extension is an unnamed baseline suite: select the extension, or name the suite for what it actually is.

**Example:** A backend codebase can contain:

```text
architecture-tests/
integration-tests/
acceptance-tests/
```

A small codebase holds the first two. Acceptance appears when the executable BDD extension activates.

### Test Domain in isolation

**Requirement:** A Domain test MUST use explicit inputs with no database, HTTP host, container, clock, or mock.

**Rationale:** Domain behavior is deterministic: explicit inputs in, new state or a refusal out. A database, host, container, clock, or mock in a Domain test hides nondeterminism behind the call, so the same test can pass and fail without a code change. The suite covers factories, every lifecycle state, allowed and rejected transitions, invariants, value equality, collections, money rules, exceptions, and raised events.

### Test Application coordination

**Requirement:** An Application test MUST substitute repositories, clocks, actor accessors, and external ports, then assert the handler's coordination.

**Rationale:** A handler's job is coordination: load the right aggregates, call Domain behavior, stage the result. Substitutes for repositories, clocks, actor accessors, and ports isolate that coordination, so a failure names the handler rather than the database or the provider. The assertion covers which aggregate was loaded, which Domain behavior ran, what was staged, and what was returned, and validator tests cover each structural rule separately.

**Example:** For example, in the .NET stack a submit-expense handler test substitutes the expense and policy repositories, and asserts the coordination:

```csharp
var handler = new SubmitExpenseCommandHandler(expenses, policies);

var result = await handler.HandleAsync(
    new SubmitExpenseCommand(expenseId, employeeId, amount, currency, receiptId), CancellationToken.None);

Assert.NotEqual(Guid.Empty, result.ExpenseId);
```

The test asserts which aggregate was loaded, what was staged, and what was returned. A second test names an expense above the threshold with no receipt and asserts the `failure/spending.receipt_missing` refusal. Neither test opens a database connection, because the repositories are substitutes.

### Test HTTP integration through the real application host

**Requirement:** An HTTP integration test MUST run through the real application host with the real configuration, covering Problem Details, authentication, and resource authorization.

**Rationale:** Only the real host wires the real routing, serialization, authentication, and authorization. A test that bypasses the host proves the handler again and misses the boundary where status codes, Problem Details shapes, and policy denials are actually produced. Persistence behavior is covered against PostgreSQL under `litespec/backend/persistence#test-persistence-against-postgresql`, and both run on the harness that `litespec/backend/testing#share-one-production-faithful-integration-harness` owns.

### Isolate integration state

**Requirement:** An integration test MUST reset database state between cases through one documented strategy and depend on no test order.

**Rationale:** When two cases share mutable business state, each passes or fails depending on which ran first, and a failure cannot be reproduced alone. One documented reset strategy removes that coupling. Container and host fixtures may still be shared for cost, because only mutable business state must not leak.

The default strategy is one database per test class, cloned from a migrated template. The harness applies the schema once per run to a template database. Each test class then receives its database with `CREATE DATABASE ... TEMPLATE` and drops that database when the class finishes. A clone takes milliseconds, so every class starts from an empty migrated schema without a second container. A project that resets tables between cases instead records that strategy in its testing documentation.

### Assert architecture boundaries with tests

**Requirement:** An architecture test MUST assert the structural boundaries that `litespec/backend/architecture#test-structural-boundaries` names.

**Rationale:** The compiler does not enforce project references, visibility, or folder placement, so a review miss on any of them lands in the main branch silently. An architecture test turns each structural boundary into a failure the suite reports on the change that broke it.

### Tag the test that proves each Case

**Requirement:** Each Case MUST be proved by a test carrying its proves tag and calling its use case.

**Rationale:** A Case states one behavior the product must show, and the `proves` tag is the test's claim that it shows it. Without that claim, a deleted behavior leaves passing tests and no failing record. The model builder confirms an acceptance scenario when its `When` step belongs to the use case steps class, and an integration test when its body names the use case message type. A Case no test proves is recorded as a Known gap with owner and end date. The test asserts the result, and the Result code for a refusal.

A test carries no coverage tag. The `proves` tag is its only record citation. The latest test run marks each confirmed claim passing or failing.

**Example:** An acceptance scenario for submitting an expense carries its Case tag on the scenario method. In the Expenses product, `SubmitExpenseScenarios.Submitting_with_a_receipt_succeedsAsync` in `apps/api/tests/Expenses.Acceptance.Tests/Spending/Expenses/SubmitExpense/SubmitExpenseScenarios.cs` carries the tag for `case/submit-expense.submitting-with-a-receipt-succeeds`, and its `When` step belongs to the `SubmitExpenseSteps` use case steps class:

```csharp
/// <proves>case/submit-expense.submitting-with-a-receipt-succeeds</proves>
public Task Submitting_with_a_receipt_succeedsAsync() => Runner.RunScenarioAsync(
    when => new SubmitExpenseSteps().SubmitAnExpenseAsync("employee-1"),
    then => new SubmitExpenseSteps().TheExpenseIsSubmittedAsync());
```

The tag names the Case, the steps call the submit-expense use case, and the model builder confirms the claim because the `When` step belongs to the use case steps class.

### Prove each Rule at its enforcement point

**Requirement:** Each Rule MUST be proved at the point its `enforcedBy` names: governed Cases for validator and guard Rules, a proves tag otherwise.

**Rationale:** Each Rule holds at exactly one enforcement point: the validator, the store, the guard, or the aggregate. A test that proves it anywhere else passes while the enforcement point drifts. A refused request proves a validator Rule, an integration test that provokes the refusal proves a store Rule, and the Cases of its reacting use case prove a reaction Rule. The builder confirms an aggregate or store claim when the test body names the governed business record code type.

The validator enforces input shape as a checked-before Rule. The store enforces a persistence constraint as an always-true Rule.

### Use evidence rather than one coverage target

**Requirement:** A repository MUST NOT treat one coverage percentage as the definition of sufficient testing.

**Rationale:** A single coverage percentage rewards tests that execute lines without asserting behavior: a suite can reach the target while proving no Case. Coverage stays useful as review input, so the project collects line and branch numbers without treating any value as sufficient. The evidence is Case proof, Domain negative cases, integration boundaries, security behavior, and architecture rules.

### Share one production-faithful integration harness

**Requirement:** The integration suite MUST own one database container fixture, one application host factory, and one database isolation helper.

**Rationale:** One fixture, one host factory, and one reset helper give every integration test the same database and configuration. A container per test group multiplies the run time by the group count, and it buys no isolation that a cloned database lacks. The fixture starts the pinned PostgreSQL once per test run, and it supplies each test group its connection string before the host builds.

"One harness" binds the integration suite. An activated BDD extension brings its own host for the acceptance suite, because the two suites run different lifetimes. That second host reuses this fixture's container and reset helper rather than starting another database.

## Conventions

### Mirror production module names

**Default:** Mirror the production module and aggregate folder names inside each test project.

**Replacement:** A consumer records a departure as an Exception record naming this provision, with reason and review date.

**Rationale:** Mirrored folders let a reader find the tests for a module without searching. Test projects stay exempt for harness and flat files: a `Support` folder and flat Architecture test files need no production counterpart.

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

**Rationale:** A failing test name is often the first thing read in a broken build. A name that states operation, condition, and expected result identifies the broken behavior without opening the file, while `Test1` or `HappyPath` describes the author's intent rather than the behavior that failed.

### Use builders for valid defaults

**Default:** Create a test data builder that produces valid state by default and exposes business-named customization.

**Replacement:** A consumer records a departure as an Exception record naming this provision, with reason and review date.

**Rationale:** Builders that start from valid state keep each test focused on the one value it changes. Constructing state by bypassing Domain methods is reserved for a persistence compatibility test, because only that test needs state the Domain would refuse.

### Keep assertions focused

**Default:** Assert only the state, event, call, response, or error that the test covers.

**Replacement:** A consumer records a departure as an Exception record naming this provision, with reason and review date.

**Rationale:** A focused assertion fails only when the behavior it covers breaks. A broad object snapshot fails for an unrelated field addition, which trains readers to update it without reading it.

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
| litespec/backend/testing#use-evidence-rather-than-one-coverage-target | guidance | Is coverage collected for review with no percentage treated as sufficient? |
| litespec/backend/testing#share-one-production-faithful-integration-harness | guidance | Does the integration suite own one container fixture, host factory, and isolation helper? |
| litespec/backend/testing#mirror-production-module-names | guidance | Does each test project tree list the same module folders as production, apart from the exempt harness files? |
| litespec/backend/testing#name-tests-by-observable-behavior | guidance | Does each test name state operation, condition, and expected result on its production type class? |
| litespec/backend/testing#use-builders-for-valid-defaults | guidance | Does each test data builder produce valid state by default through its Domain factory? |
| litespec/backend/testing#keep-assertions-focused | guidance | Does each test assert only its named outcome rather than a whole-object snapshot? |
