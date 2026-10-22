# Backend Testing

## Intent

Backend tests prove behavior at four separate boundaries: domain logic with no dependencies, use-case coordination with test stand-ins, real persistence and HTTP behavior through the production host, and structural rules with architecture tests. This page states which suites each project size keeps, what each suite runs with, and how tests prove the scenarios and rules the specification records. Separate boundaries keep fast tests fast and point each failure at the layer that broke.

## Concepts

### Test Boundaries

Each suite proves one boundary and runs with one set of tools. A test belongs to the suite whose boundary it proves.

| Suite | Proves | Runs With |
|:---|:---|:---|
| Domain | Factories, lifecycles, invariants, and value behavior | Explicit inputs only, with no database, host, container, clock, or mock |
| Application | Handler coordination: what was loaded, called, staged, and returned | Substituted repositories, clocks, actor accessors, and ports |
| Integration | Real persistence and HTTP behavior through the production host | The pinned PostgreSQL and the real application host |
| Architecture | Project references, visibility, folders, and inheritance | Static checks over the compiled code |
| Acceptance | End-to-end behavior for large projects | The executable BDD extension and its host |

### Scenario Proof

A scenario states one behavior the product shows, written in `given`, `when`, `then`: the situation, the action, and the expected ending. A result names one way a use case ends: success, or a refusal carrying a stable code. A test proves a scenario by carrying a proves tag naming it, calling its use case through the public boundary, and asserting the result the scenario names. A rule claim confirms only through a scenario the same test proves. A frontend test proves a scenario the same way: it carries the proves tag, drives the scenario through the boundary it calls, and asserts the result the scenario names. Test runs match results to tests by fully qualified name, so a renamed test matches nothing. The model builder confirms each claim from the test body, and the latest test run marks it passing or failing.

## Standards

### Keep the Test Suites the Size Requires

**Statement:** A backend codebase MUST hold exactly the test suites its size requires: architecture and integration for small, adding acceptance for large.

**Rationale:** Each suite owns one boundary and one harness, so a project that keeps exactly its suites knows where each new test belongs. A missing suite pushes its tests into another suite's harness, where they run with the wrong fixtures, and an extra unnamed suite collects the tests nobody placed. Unit suites stay optional in both sizes, and acceptance stays optional for small. An acceptance suite without the executable BDD extension is an unnamed baseline suite: select the extension, or name the suite for what it actually is.

**Example:** A backend codebase holds these suite folders:

```text
architecture-tests/
integration-tests/
acceptance-tests/
```

A small codebase holds the first two. Acceptance appears when the executable BDD extension activates.

### Test Domain in Isolation

**Statement:** A Domain test MUST use explicit inputs with no database, HTTP host, container, clock, or mock.

**Rationale:** Domain behavior is deterministic: explicit inputs in, new state or a refusal out. A database, host, container, clock, or mock in a Domain test hides nondeterminism behind the call, so the same test passes and fails without a code change. The suite covers factories, every lifecycle state, allowed and rejected transitions, invariants, value equality, collections, money rules, exceptions, and raised events.

### Test Application Coordination

**Statement:** An Application test MUST substitute repositories, clocks, actor accessors, and external ports, then assert the handler's coordination.

**Rationale:** A handler's job is coordination: load the right aggregates, call Domain behavior, stage the result. Substitutes for repositories, clocks, actor accessors, and ports isolate that coordination, so a failure names the handler rather than the database or the provider. The assertion covers which aggregate was loaded, which Domain behavior ran, what was staged, and what was returned, and validator tests cover each structural rule separately.

**Example:** A handler test for submitting an expense substitutes the expense and policy repositories, sends a command carrying an expense identifier, an employee identifier, an amount, and a receipt, and asserts the returned expense identifier alongside what was loaded and staged. A second test sends an expense above the threshold with no receipt and asserts the `spending.receipt-missing` refusal. Both tests run with no database connection, because the repositories are substitutes.

### Test HTTP Integration Through the Real Application Host

**Statement:** An HTTP integration test MUST run through the real application host with the real configuration, covering Problem Details, authentication, and resource authorization.

**Rationale:** Only the real host wires the real routing, serialization, authentication, and authorization. A test that bypasses the host proves the handler again and misses the boundary where status codes, Problem Details shapes, and policy denials are actually produced. Persistence behavior is covered against PostgreSQL under `litespec/backend/persistence#test-persistence-against-postgresql`, and both run on the harness that `litespec/backend/testing#share-one-production-faithful-integration-harness` owns.

### Isolate Integration State

**Statement:** An integration test MUST reset database state between tests through one documented strategy and depend on no test order.

**Rationale:** When two tests share mutable business state, each passes or fails depending on which ran first, and the failure disappears when one test runs alone. One documented reset strategy removes that coupling. Container and host fixtures stay shared for cost, because only mutable business state leaks between tests.

The default strategy is one database per test class, cloned from a migrated template. The harness applies the schema once per run to a template database. Each test class then receives its own database cloned from that template and drops that database when the class finishes. A clone takes milliseconds, so every class starts from an empty migrated schema without a second container. A project that resets tables between tests instead records that strategy in its testing documentation.

### Assert Architecture Boundaries with Tests

**Statement:** An architecture test MUST assert the structural boundaries that `litespec/backend/architecture#test-structural-boundaries` names.

**Rationale:** The compiler does not enforce project references, visibility, or folder placement, so a review miss on any of them lands in the main branch silently. An architecture test turns each structural boundary into a failure the suite reports on the change that broke it.

### Tag the Test That Proves Each Scenario

**Statement:** Each scenario MUST be proved by a test carrying its proves tag, calling its use case through the public boundary, and asserting the result the scenario names.

**Rationale:** A scenario states one behavior the product shows, and the proves tag is the test's claim that it shows it. A test that drives the use case through its steps, its message, or its endpoint exercises the public boundary; a test that constructs a handler, an aggregate, or a repository reaches past it and proves nothing. The assertion names the result: the success fields for a success, the refusal code inside an assertion for a refusal. A scenario no test proves is recorded as a known gap with owner and end date. The latest test run marks each confirmed claim passing or failing.

**Example:** An acceptance scenario for submitting an expense carries the tag for `scenario/submit-expense.submitting-with-a-receipt-succeeds`, drives the submit-expense steps, and asserts the submitted expense. An integration test for the same scenario constructs the submit-expense message, sends it through the host, and asserts the same result. The tag names the scenario, the call crosses the public boundary, and the model builder confirms the claim from the test body.

### Prove Each Rule Through Its Scenarios

**Statement:** A rule claim MUST confirm only through a scenario the same test proves.

**Rationale:** Each rule holds where its kind says: an invariant inside the aggregate, a precondition at the guard, a calculation in its pure evaluation, a cross-aggregate rule at the store or the reacting use case. A scenario that walks through that point exercises the rule, so the rule claim rides on the scenario proof instead of carrying its own enforcement-point tag. A calculation rule earns its proof from a scenario carrying the examples table that `litespec/core/domain#tabulate-every-calculation-with-examples` requires.

**Example:** A test proving the scenario for an expense above the threshold with no receipt claims the receipt rule alongside the scenario. The scenario sends the command and asserts the `spending.receipt-missing` refusal, and the rule claim confirms because the same test proves the scenario. No separate tag names the validator or the store.

### Match Tests by Fully Qualified Name

**Statement:** A test run MUST match results to tests by fully qualified name.

**Rationale:** A result file names each test with its namespace, its containing types joined with dots, and its method, without data-row arguments. A renamed test then matches nothing instead of matching another test's same-named method, so the rename fails loudly instead of lingering as an awaited run. Short-name matching hides the rename behind a passing name it no longer owns.

**Example:** Renaming a submit-expense test leaves the old qualified name with no matching result, and the scenario shows unproven until the new name runs and passes.

### Derive Expected Values from the Scenario

**Statement:** A test MUST take its expected values only from the Then of the scenario it proves.

**Rationale:** Expected values read from the code under test restate what the code does, so the test passes with the code whatever the specification says. The scenario's Then holds the expected ending, and the test asserts exactly that ending. The agent obligation behind this rule lives in `litespec/core/agent#take-expected-values-from-the-scenario`, with held-back example rows checked after implementation under `litespec/core/agent#verify-refusals-and-calculations-against-held-back-examples`.

**Example:** A scenario whose Then says the expense is submitted asserts the submitted state and the returned identifier from the scenario text. The test author reads no handler code to learn the expected values.

### Refuse Surviving Mutants on Changed Lines

**Statement:** A change MUST leave no surviving mutant on its changed lines.

**Rationale:** Mutation testing seeds small faults into changed lines and runs the suite: each killed mutant is a fault the tests catch, and each survivor is a fault they miss. The gate counts survivors on changed lines only, so every change arrives proven. A project-wide percentage confounds suite size with strength, and a full nightly run serves as a trend rather than a gate.

**Example:** A change touching the receipt check runs mutation over those lines with the scenario suite. Zero survivors lets the change land; one survivor sends the change back for a stronger assertion.

### Prove Every Calculation with Property Tests

**Statement:** Every calculation rule MUST be proved by property tests seeded from its scenario examples.

**Rationale:** An examples table holds the debated rows, and property tests range beyond them: each generated input checks the same stated property the rows illustrate. Seeding from the table ties the properties to reviewed values instead of invented ones. The table itself lives on a scenario proving the rule, as `litespec/core/domain#tabulate-every-calculation-with-examples` requires.

**Example:** A rounding rule with three reviewed rows seeds a property test asserting the rounded total against the stated bound for each generated input.

### Prove Every Aggregate with a Model-Based Test

**Statement:** Every aggregate MUST be proved by a model-based test generated from its declared transitions.

**Rationale:** The transitions table declares every allowed move between states, and a model-based test walks generated sequences through that model: each walk checks that allowed moves succeed and rejected moves refuse. Generating from the declared table keeps the model and the test in agreement by construction. The table lives on the aggregate page, as `litespec/core/domain#connect-every-state-through-transitions` requires.

**Example:** An expense test generates walks across submitted, approved, rejected, and reimbursed, checking each move against the declared transitions. A walk attempting reimbursement from submitted ends in the refusal the transitions table allows.

### Use Evidence Rather Than One Coverage Target

**Statement:** A repository MUST NOT treat one coverage percentage as the definition of sufficient testing.

**Rationale:** A single coverage percentage rewards tests that execute lines without asserting behavior: a suite reaches the target while proving no scenario. Coverage stays useful as review input, so the project collects line and branch numbers without treating any value as sufficient. The evidence is scenario proof, domain edge cases, integration boundaries, security behavior, and architecture rules, with mutation results on changed lines under `litespec/backend/testing#refuse-surviving-mutants-on-changed-lines`.

### Share One Production-Faithful Integration Harness

**Statement:** The integration suite MUST own one database container fixture, one application host factory, and one database isolation helper.

**Rationale:** One fixture, one host factory, and one reset helper give every integration test the same database and configuration. A container per test group multiplies the run time by the group count, and it buys no isolation that a cloned database lacks. The fixture starts the pinned PostgreSQL once per test run, and it supplies each test group its connection string before the host builds.

One harness binds the integration suite. An activated BDD extension brings its own host for the acceptance suite, because the two suites run different lifetimes. That second host reuses this fixture's container and reset helper rather than starting another database.

## Conventions

### Mirror Production Module Names

**Default:** Mirror the production module and aggregate folder names inside each test project.

**Replacement:** A project names its test tree shape in its testing documentation.

**Rationale:** Mirrored folders let a reader find the tests for a module without searching. Test projects stay exempt for harness and flat files: a `Support` folder and flat Architecture test files need no production counterpart.

**Example:** The test trees mirror the production module folders.

```text
Domain tests/
  Posts/
Application tests/
  Posts/
    CreateDraft/
    GetPost/
Integration tests/
  Posts/
  Support/
Architecture tests/
```

Production modules keep the same folder names in every test tree, apart from the exempt harness files.

### Name Tests by Observable Behavior

**Default:** Name a test `{MethodOrOperation}_{Condition}_{ExpectedResult}` and its class after the production type it covers.

**Replacement:** A project names its test naming shape in its testing documentation.

**Rationale:** A failing test name is often the first thing read in a broken build. A name that states operation, condition, and expected result identifies the broken behavior without opening the file, while `Test1` or `HappyPath` describes the author's intent rather than the behavior that failed.

### Use Builders for Valid Defaults

**Default:** Create a test data builder that produces valid state by default and exposes business-named customization.

**Replacement:** A project names its test data shape in its testing documentation.

**Rationale:** Builders that start from valid state keep each test focused on the one value it changes. Constructing state by bypassing Domain methods is reserved for a persistence compatibility test, because only that test needs state the Domain would refuse.

### Keep Assertions Focused

**Default:** Assert only the state, event, call, response, or error that the test covers.

**Replacement:** A project names its assertion scope in its testing documentation.

**Rationale:** A focused assertion fails only when the behavior it covers breaks. A broad object snapshot fails for an unrelated field addition, which trains readers to update it without reading it.

## Reference Example

This informative example demonstrates `litespec/backend/testing#test-domain-in-isolation`, `litespec/backend/testing#test-application-coordination`, and `litespec/backend/testing#test-http-integration-through-the-real-application-host`.

A Domain test for publishing a draft post uses explicit inputs with no substitutes. An Application test for creating a draft substitutes the post repository and the clock, then asserts what was loaded, staged, and returned. An integration test for the same use case runs through the real host against the pinned PostgreSQL.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/backend/testing#keep-the-test-suites-the-size-requires | guidance | The test folders hold architecture and integration suites, with acceptance added for large projects only. |
| litespec/backend/testing#test-domain-in-isolation | guidance | Domain test files take explicit inputs, with no database, host, container, clock, or mock in their bodies. |
| litespec/backend/testing#test-application-coordination | guidance | Application test files substitute repositories, clocks, actor accessors, and ports, and assert loaded, called, staged, and returned values. |
| litespec/backend/testing#test-http-integration-through-the-real-application-host | guidance | HTTP integration tests run through the real host factory with production configuration, covering Problem Details bodies, authentication, and authorization. |
| litespec/backend/testing#isolate-integration-state | guidance | The testing documentation names one reset strategy, and integration tests share no mutable business state across runs. |
| litespec/backend/testing#assert-architecture-boundaries-with-tests | guidance | Architecture test files assert project references, visibility, folders, and inheritance against the compiled code. |
| litespec/backend/testing#tag-the-test-that-proves-each-scenario | guidance | The book pairs each scenario with its proving test, the boundary call in its body, and its latest passing run. |
| litespec/backend/testing#prove-each-rule-through-its-scenarios | guidance | Rule claims sit on tests beside a proved scenario claim for the same use case. |
| litespec/backend/testing#match-tests-by-fully-qualified-name | guidance | Test result files record namespace, containing types, and method for each test, with no data-row arguments. |
| litespec/backend/testing#derive-expected-values-from-the-scenario | guidance | Test assertions repeat the expected endings written in the Then of their scenarios. |
| litespec/backend/testing#refuse-surviving-mutants-on-changed-lines | guidance | The mutation report for each change shows zero survivors on its changed lines. |
| litespec/backend/testing#prove-every-calculation-with-property-tests | guidance | Calculation rules pair with property test files seeded from their scenario example rows. |
| litespec/backend/testing#prove-every-aggregate-with-a-model-based-test | guidance | Aggregates pair with model-based test files walking their declared transition tables. |
| litespec/backend/testing#use-evidence-rather-than-one-coverage-target | guidance | No build gate names a coverage percentage, while line and branch numbers stay available for review. |
| litespec/backend/testing#share-one-production-faithful-integration-harness | guidance | The integration suite holds one container fixture, one host factory, and one isolation helper. |
| litespec/backend/testing#mirror-production-module-names | guidance | Test trees list the same module folders as production, apart from the exempt harness files. |
| litespec/backend/testing#name-tests-by-observable-behavior | guidance | Test names state operation, condition, and expected result on classes named for production types. |
| litespec/backend/testing#use-builders-for-valid-defaults | guidance | Test data builders produce valid state by default with business-named customization. |
| litespec/backend/testing#keep-assertions-focused | guidance | Test bodies assert their named outcome without whole-object snapshots. |
