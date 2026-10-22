# .NET Testing

## Intent

.NET backends prove their behavior through the test projects their size (small or large) requires, using xUnit, `WebApplicationFactory` (the ASP.NET test host), and one shared production-faithful harness (a container fixture, a host factory, and a database isolation helper). A Case is one behavior the product must show, and this page states the .NET form of those suites: which projects exist, how HTTP integration and architecture tests run, how each Case earns its proof tag, and what the shared harness owns. Every Case then traces to a test that carries its `proves` tag and calls its use case, the command or query the Case belongs to. The shared testing rules live on [Backend Testing](../testing.md); this page holds only their .NET form.

## Concepts

### Test suites by size

A small backend holds Architecture and Integration test projects; a large one adds Acceptance. Unit test projects stay optional in both sizes. Each suite runs at its own boundary: architecture tests assert structure, integration tests run the real host against PostgreSQL, and acceptance scenarios prove critical examples through a public boundary.

### Proof tags and the shared harness

Each Case is proved by a test that carries a `proves` tag naming the Case and calls its use case; the model builder confirms the claim from the latest run. Integration tests share one harness: a PostgreSQL container fixture, one `ApiFactory`, and one database isolation helper, so every test sees the same production-faithful configuration.

## Standards

### Keep the test projects the size requires

**Statement:** A backend solution MUST hold exactly the test projects its size requires: Architecture and Integration for small, adding Acceptance for large.

**Rationale:** The required suites match the size: Architecture and Integration for small, adding Acceptance for large. Unit test projects stay optional in both sizes, and Acceptance stays optional for small. An Acceptance project without the executable BDD extension is an unnamed baseline project: select the extension, or name the project for what it actually is. This provision states the .NET form of `litespec/backend/testing#keep-the-test-suites-the-size-requires`.

**Example:** A test suite can contain:

```text
{ProjectName}.Architecture.Tests/
{ProjectName}.Integration.Tests/
{ProjectName}.Acceptance.Tests/
```

A small solution holds the first two; Acceptance appears when the executable BDD extension activates.

### Test HTTP integration through the real host

**Statement:** An HTTP integration test MUST run through `WebApplicationFactory` with the real configuration, covering Problem Details, authentication, and resource authorization.

**Rationale:** A test host with substituted configuration proves the substitutes, not the product. Running through `WebApplicationFactory` with the real configuration, and covering Problem Details, authentication, and resource authorization, exercises the boundary clients actually call. Persistence behavior against PostgreSQL is covered by `litespec/backend/persistence#test-persistence-against-postgresql`; both run on the harness that `litespec/backend/dotnet/testing#use-one-production-faithful-integration-harness` owns. This provision states the .NET form of `litespec/backend/testing#test-http-integration-through-the-real-application-host`.

### Enforce architecture rules

**Statement:** An architecture test MUST assert the structural boundaries that `litespec/backend/architecture#test-structural-boundaries` names, running in the Release test pass.

**Rationale:** Layer references, visibility, and folder placement are boundaries the compiler does not enforce, so a review miss lands in the main branch and every later change copies it. Architecture tests assert the boundaries that `litespec/backend/architecture#test-structural-boundaries` names, and run in the Release test pass. This provision states the .NET form of `litespec/backend/testing#assert-architecture-boundaries-with-tests`.

### Prove each Case with a test that calls its use case

**Statement:** Each Case MUST be proved by a test carrying one `/// <proves>case/<use-case>.<name></proves>` tag and calling its use case.

**Rationale:** The `proves` tag is the claim that ties a test to its Case, and the model builder confirms it: an acceptance scenario is confirmed when its When step belongs to the use case steps class, and an integration test when its body names the use case message type. The test calls the use case and asserts its result, and for a refusal the Result code. A Case no test proves is recorded as a Known gap with owner and end date.

A test carries no coverage tag; the `proves` tag is its only record citation. The latest test run marks each confirmed claim passing or failing. This provision states the .NET form of `litespec/backend/testing#tag-the-test-that-proves-each-case`.

**Example:** An acceptance scenario for submitting an expense carries its Case tag on the scenario method.

```csharp
/// <proves>case/submit-expense.submitting-with-a-receipt-succeeds</proves>
```

### Use one production-faithful integration harness

**Statement:** The integration project MUST own one PostgreSQL container fixture, one `ApiFactory`, and one database isolation helper, either a `DatabaseReset` or a template database clone.

**Rationale:** The fixture starts the pinned PostgreSQL once per test run as an xUnit v3 assembly fixture, and supplies each class its connection string before the host builds, so every test sees the same configuration. A container per test class multiplies run time by the class count while adding no isolation a cloned database lacks. "One harness" binds the integration project: an activated BDD extension brings its own host for the acceptance project, because the two projects run different lifetimes, and that host reuses this fixture's container and reset helper rather than starting another database. This provision states the .NET form of `litespec/backend/testing#share-one-production-faithful-integration-harness`.

## Conventions

None.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/backend/dotnet/testing#keep-the-test-projects-the-size-requires | guidance | Does the solution hold the test projects its size requires and no other baseline project? |
| litespec/backend/dotnet/testing#test-http-integration-through-the-real-host | guidance | Does each HTTP integration test run through `WebApplicationFactory`, covering Problem Details, authentication, and authorization? |
| litespec/backend/dotnet/testing#enforce-architecture-rules | guidance | Do architecture tests assert the named structural boundaries and run in the Release pass? |
| litespec/backend/dotnet/testing#prove-each-case-with-a-test-that-calls-its-use-case | guidance | Is each Case proved by a test carrying its XML doc `proves` tag and calling its use case? |
| litespec/backend/dotnet/testing#use-one-production-faithful-integration-harness | guidance | Does the integration project own one container fixture, `ApiFactory`, and isolation helper? |
