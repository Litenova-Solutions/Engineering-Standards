# .NET Testing

## Intent

.NET backends prove their behavior through the test projects their size requires, using xUnit, `WebApplicationFactory`, and one shared production-faithful harness. A scenario is one behavior the product must show, and this page states the .NET form of those suites: which projects exist, how HTTP integration and architecture tests run, how each scenario earns its proof tag, and what the shared harness owns. The shared testing rules live on [Backend Testing](../testing.md); this page holds only their .NET form.

## Concepts

### Test Suites by Size

A small backend holds Architecture and Integration test projects; a large one adds Acceptance. Unit test projects stay optional in both sizes. Each suite runs at its own boundary: architecture tests assert structure, integration tests run the real host against PostgreSQL, and acceptance scenarios prove critical examples through a public boundary.

### Proof Tags and the Shared Harness

Each scenario is proved by a test that carries a `proves` tag naming the scenario and calls its use case; the model builder confirms the claim from the latest run. Integration tests share one harness: a PostgreSQL container fixture, one `ApiFactory`, and one database isolation helper, so every test sees the same production-faithful configuration.

## Standards

### Keep the Test Projects the Size Requires

**Statement:** A backend solution MUST hold exactly the test projects its size requires: Architecture and Integration for small, adding Acceptance for large.

**Rationale:** The required suites match the size: Architecture and Integration for small, adding Acceptance for large. Unit test projects stay optional in both sizes, and Acceptance stays optional for small. An Acceptance project without the executable BDD extension is an unnamed baseline project: select the extension, or name the project for what it actually is. This provision states the .NET form of `litespec/backend/testing#keep-the-test-suites-the-size-requires`.

**Example:** A test suite can contain:

```text
{ProjectName}.Architecture.Tests/
{ProjectName}.Integration.Tests/
{ProjectName}.Acceptance.Tests/
```

A small solution holds the first two; Acceptance appears when the executable BDD extension activates.

### Test HTTP Integration Through the Real Host

**Statement:** An HTTP integration test MUST run through `WebApplicationFactory` with the real configuration, covering Problem Details, authentication, and resource authorization.

**Rationale:** A test host with substituted configuration proves the substitutes, not the product. Running through `WebApplicationFactory` with the real configuration, and covering Problem Details, authentication, and resource authorization, exercises the boundary clients actually call. Persistence behavior against PostgreSQL is covered by `litespec/backend/persistence#test-persistence-against-postgresql`; both run on the harness that `litespec/backend/dotnet/testing#use-one-production-faithful-integration-harness` owns. This provision states the .NET form of `litespec/backend/testing#test-http-integration-through-the-real-application-host`.

### Enforce Architecture Rules

**Statement:** An architecture test MUST assert the structural boundaries that `litespec/backend/architecture#test-structural-boundaries` names, running in the Release test pass.

**Rationale:** Layer references, visibility, and folder placement are boundaries the compiler does not enforce, so a review miss lands in the main branch and every later change copies it. Architecture tests assert the boundaries that `litespec/backend/architecture#test-structural-boundaries` names, and run in the Release test pass. This provision states the .NET form of `litespec/backend/testing#assert-architecture-boundaries-with-tests`.

### Prove Each Scenario with a Test That Calls Its Use Case

**Statement:** Each scenario MUST be proved by a test carrying one `/// <proves>scenario/<use-case>.<name></proves>` tag, calling its use case, and asserting the result the scenario names.

**Rationale:** The `proves` tag is the claim that ties a test to its scenario, and the model builder confirms it: an acceptance scenario is confirmed when its When step belongs to the use case steps class, and an integration test when its body names the use case message type. The test calls the use case and asserts its result: the success fields for a success, or the refusal code inside an assertion for a refusal. The model builder matches the proving test by its fully qualified name, so a renamed test fails loudly instead of becoming "awaiting run". A test that asserts nothing is reported by LS4001, the assertion rule on test projects. A scenario no test proves is recorded as a known gap with owner and end date.

A test carries no coverage tag; the `proves` tag is its only record citation. A reaction scenario is proved by a test that fires the trigger and asserts the issued use case's result. The latest test run marks each confirmed claim passing or failing. This provision states the .NET form of `litespec/backend/testing#tag-the-test-that-proves-each-scenario`.

**Example:** An acceptance scenario for submitting an expense carries its scenario tag on the scenario method.

```csharp
/// <proves>scenario/submit-expense.submitting-with-a-receipt-succeeds</proves>
```

### Use One Production-Faithful Integration Harness

**Statement:** The integration project MUST own one PostgreSQL container fixture, one `ApiFactory`, and one database isolation helper, either a `DatabaseReset` or a template database clone.

**Rationale:** The fixture starts the pinned PostgreSQL once per test run as an xUnit v3 assembly fixture, and supplies each class its connection string before the host builds, so every test sees the same configuration. A container per test class multiplies run time by the class count while adding no isolation a cloned database lacks. "One harness" binds the integration project: an activated BDD extension brings its own host for the acceptance project, because the two projects run different lifetimes, and that host reuses this fixture's container and reset helper rather than starting another database. This provision states the .NET form of `litespec/backend/testing#share-one-production-faithful-integration-harness`.

### Gate Changed Lines with Mutation Testing

**Statement:** Each pull request MUST show zero surviving mutants on its changed lines from a Stryker.NET run scoped with `--since`.

**Rationale:** Mutation testing judges test strength where the change is: a project-wide score is confounded by suite size, so a large suite hides weak new tests behind a high percentage. Scoping the run to the pull request's changed lines with `--since` keeps the gate to minutes per pull request. A full nightly run stays a trend rather than a gate. Stryker.NET 5.0.0 is free and maintained under Apache-2.0. The tool manifest pins the runner.

**Example:** A pull request changing the submit-expense handler shows a Stryker.NET report with zero surviving mutants on its changed lines; a surviving mutant fails the pull request.

### Seed Property Tests from Example Tables

**Statement:** Property tests for each calculation rule MUST run on FsCheck with cases seeded from the rule's scenario examples table.

**Rationale:** A calculation rule carries an examples table on its scenarios, and those rows seed the property cases: the properties hold for the agreed examples before they are checked against generated inputs. FsCheck is the .NET property library, free and maintained. The Domain test project owns the FsCheck reference under `litespec/backend/dotnet/packages#use-this-baseline-package-ownership`.

### Generate Model Tests from Declared Transitions

**Statement:** Each aggregate MUST carry a model-based test generated from its declared transitions and run with FsCheck.

**Rationale:** The aggregate's declared transitions are the model: the test walks them and checks that each succeeds from its stated state while undeclared moves are refused. Generating the test from the record keeps it aligned with the declared lifecycle. FsCheck runs the generated model.

## Conventions

None.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/backend/dotnet/testing#keep-the-test-projects-the-size-requires | guidance | The solution tree under `apps/api/tests/` holds Architecture and Integration test projects, with Acceptance added when size is large. |
| litespec/backend/dotnet/testing#test-http-integration-through-the-real-host | guidance | HTTP integration test files run through `WebApplicationFactory` with the real configuration and cover Problem Details, authentication, and resource authorization. |
| litespec/backend/dotnet/testing#enforce-architecture-rules | guidance | Architecture test files assert the named structural boundaries, and the Release test pass runs them. |
| litespec/backend/dotnet/testing#prove-each-scenario-with-a-test-that-calls-its-use-case | guidance | Each scenario's proving test file carries the `scenario/` `proves` tag, names the use case message type, asserts the named result, and passes in the latest run. |
| litespec/backend/dotnet/testing#use-one-production-faithful-integration-harness | guidance | The integration test project holds one container fixture, one `ApiFactory`, and one isolation helper. |
| litespec/backend/dotnet/testing#gate-changed-lines-with-mutation-testing | guidance | Each pull request shows a Stryker.NET `--since` report with zero surviving mutants on its changed lines. |
| litespec/backend/dotnet/testing#seed-property-tests-from-example-tables | guidance | Each calculation rule's property tests run on FsCheck with cases drawn from the rule's scenario examples table. |
| litespec/backend/dotnet/testing#generate-model-tests-from-declared-transitions | guidance | Each aggregate's model-based test runs on FsCheck against the aggregate's declared transitions. |
