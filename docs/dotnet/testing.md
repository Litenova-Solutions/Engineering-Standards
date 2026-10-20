# .NET Testing

## Intent

Tests in a .NET backend run in the test projects the size profile requires, through xUnit, WebApplicationFactory, and one shared harness. The shared provisions live on the stack-neutral page ([Backend testing](../backend/testing.md)); this page holds what the dotnet stack alone requires.

## Agent Summary {#agent-summary}

- The solution holds the test projects its size profile requires. (litespec/rule/dotnet-testing.keep-the-test-projects-the-size-profile-requires)
- HTTP integration runs through WebApplicationFactory. (litespec/rule/dotnet-testing.test-http-integration-through-the-real-host)
- Architecture tests run in the Release test pass. (litespec/rule/dotnet-testing.enforce-architecture-rules)
- Each Case carries its XML doc proves tag. (litespec/rule/dotnet-testing.prove-each-case-with-a-test-that-calls-its-use-case)
- One harness owns the container fixture, ApiFactory, and reset helper. (litespec/rule/dotnet-testing.use-one-production-faithful-integration-harness)

## Standards

### Keep the test projects the size profile requires (litespec/rule/dotnet-testing.keep-the-test-projects-the-size-profile-requires)

**Requirement:** A backend solution MUST hold exactly the test projects its size profile requires: Architecture and Integration for small, adding Acceptance for large.

**Rationale:** Unit test projects are optional in both profiles. Acceptance stays optional for small. An Acceptance project without the executable BDD extension is an unnamed baseline project: select the extension, or name the project for what it actually is. This provision realizes `litespec/rule/backend-testing.keep-the-test-suites-the-size-profile-requires`.

**Example:** A test suite can contain:

```text
{ProjectName}.Architecture.Tests/
{ProjectName}.Integration.Tests/
{ProjectName}.Acceptance.Tests/
```

A small solution holds the first two; Acceptance appears when the executable BDD extension activates.

### Test HTTP integration through the real host (litespec/rule/dotnet-testing.test-http-integration-through-the-real-host)

**Requirement:** An HTTP integration test MUST run through `WebApplicationFactory` with the real configuration, covering Problem Details, authentication, and resource authorization.

**Rationale:** Persistence behavior against PostgreSQL is covered by `litespec/rule/backend-persistence.test-persistence-against-postgresql`. Both run on the harness that `litespec/rule/dotnet-testing.use-one-production-faithful-integration-harness` owns. This provision realizes `litespec/rule/backend-testing.test-http-integration-through-the-real-application-host`.

### Enforce architecture rules (litespec/rule/dotnet-testing.enforce-architecture-rules)

**Requirement:** An architecture test MUST assert the structural boundaries that `litespec/rule/backend-architecture.test-structural-boundaries` names, running in the Release test pass.

**Rationale:** These are the boundaries a compiler does not enforce, so a review miss otherwise lands in the main branch. This provision realizes `litespec/rule/backend-testing.assert-architecture-boundaries-with-tests`.

### Prove each Case with a test that calls its use case (litespec/rule/dotnet-testing.prove-each-case-with-a-test-that-calls-its-use-case)

**Requirement:** Each Case MUST be proved by a test carrying one `/// <proves>case/<use-case>.<name></proves>` tag and calling its use case.

**Rationale:** The tag is the claim; the model builder confirms it. An acceptance scenario is confirmed when its When step belongs to the use case steps class. An integration test is confirmed when its body names the use case message type. A Case no test proves is recorded as a Known gap with owner and end date. The test asserts the result, and for a refusal the Result code.

A test carries no coverage tag; the proves tag is its only record citation. The latest test run marks each confirmed claim passing or failing. This provision realizes `litespec/rule/backend-testing.tag-the-test-that-proves-each-case`.

**Example:** An acceptance scenario for borrowing a library book carries its Case tag on the scenario method.

```csharp
/// <proves>case/borrow-book.book-borrowed-within-limit</proves>
```

### Use one production-faithful integration harness (litespec/rule/dotnet-testing.use-one-production-faithful-integration-harness)

**Requirement:** The integration project MUST own one PostgreSQL container fixture, one `ApiFactory`, and one database isolation helper, either a `DatabaseReset` or a template database clone.

**Rationale:** The fixture starts the pinned PostgreSQL once per test run, as an xUnit v3 assembly fixture. It supplies each class its connection string before the host builds, so every test sees the same configuration. A container per test class multiplies the run time by the class count. It buys no isolation that a cloned database lacks.

"One harness" binds the integration project. An activated BDD extension brings its own host for the acceptance project, because the two projects run different lifetimes. That second host reuses this fixture's container and reset helper rather than starting another database. This provision realizes `litespec/rule/backend-testing.share-one-production-faithful-integration-harness`.

## Conventions

None.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/rule/dotnet-testing.keep-the-test-projects-the-size-profile-requires | guidance | Does the solution hold the test projects its size profile requires and no other baseline project? |
| litespec/rule/dotnet-testing.test-http-integration-through-the-real-host | guidance | Does each HTTP integration test run through WebApplicationFactory covering Problem Details, authentication, and authorization? |
| litespec/rule/dotnet-testing.enforce-architecture-rules | guidance | Do architecture tests assert the named structural boundaries and run in the Release pass? |
| litespec/rule/dotnet-testing.prove-each-case-with-a-test-that-calls-its-use-case | guidance | Is each Case proved by a test carrying its XML doc proves tag and calling its use case? |
| litespec/rule/dotnet-testing.use-one-production-faithful-integration-harness | guidance | Does the integration project own one container fixture, ApiFactory, and isolation helper? |
