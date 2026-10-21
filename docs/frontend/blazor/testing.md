# Blazor Testing

## Intent

The Blazor client proves its behavior in 4 test projects, one per boundary: core tests without a browser, component tests with substituted browser calls, and a small browser suite for what only a real browser shows. This page states how it follows the testing principles in [Frontend Testing](../testing.md) and where each kind of test lives. A team that applies it while writing tests keeps fast tests fast and still proves storage loss, offline startup, and export with import.

## Concepts

### Cases, results, and known gaps

A use-case specification states its Cases: worked examples leading from a situation to one named Result. A test proves a Case when its steps call the use case and assert the Result. A Case no test proves is recorded as a Known gap with an owner and an end date, so the missing proof stays visible instead of silently absent.

## Standards

### Use the four client test projects

**Requirement:** A client solution MUST contain Domain, Application, Web, and end-to-end test projects and no other baseline test project.

**Rationale:** Each project matches one boundary of the client, so a failing test names the layer that broke. There is no API factory, no PostgreSQL container, and no database reset, because there is no server or database. A backend test project added here would pull server fixtures into a client that has nothing to run them against.

**Example:**

```text
tests/
  {ProjectName}.Domain.Tests/          invariants, closed sets, state transitions
  {ProjectName}.Application.Tests/     handlers, validators, result unions
  {ProjectName}.Web.Tests/             component rendering and interaction
  {ProjectName}.EndToEnd.Tests/        real browser flows
```

### Prove each case with a test

**Requirement:** Each Case of a use case MUST be proved by an automated test whose steps call the use case and assert the Result.

**Rationale:** A test that calls the use case and asserts the Result proves the specification still holds after every change. The link between Case and test is computed from the test, so it cannot claim coverage it lacks. A Case no test proves becomes a Known gap with an owner and an end date, which keeps the gap visible and assigned instead of forgotten. This realizes litespec/frontend/testing#prove-a-case-by-calling-its-use-case.

### Test the core without a browser

**Requirement:** A Domain or Application test MUST run with no browser, JavaScript host, or storage.

**Rationale:** Domain and Application hold no browser types, so their tests need no browser, JavaScript host, or storage. A core test that needs an interop substitute proves the layering already broke: the production code reaches past its boundary. The fix belongs in the layering, not in the test setup. This realizes litespec/frontend/testing#match-test-level-to-risk.

### Replace interop in component tests

**Requirement:** A component test MUST inject a test double for every Application interface, including interop.

**Rationale:** A component test substitutes every Application interface, including interop, so the component renders with no browser and the test asserts on user-visible output rather than markup structure. Coverage includes keyboard interaction and each declared route state, because those are the behaviors a component owns. Starting a real browser here would make the suite slow without proving more. This realizes litespec/frontend/testing#keep-mocks-at-owned-boundaries and litespec/frontend/testing#test-observable-states.

### Verify real browser behavior end to end

**Requirement:** A browser suite MUST cover the primary release flow, startup with storage unavailable, offline startup, and export followed by import.

**Rationale:** The primary release flow, startup with storage unavailable, offline startup, and export followed by import are the paths where a product with no server loses user work. None of them can run without a real browser: storage denial, offline caches, and file download are browser behaviors. A suite that skips them leaves the riskiest paths unproved. This realizes litespec/frontend/testing#match-test-level-to-risk.

### Enforce the first-load budget

**Requirement:** CI MUST measure the compressed transfer size of the published framework payload and fail above the recorded budget.

**Rationale:** The framework payload is what the visitor waits for, and only compressed transfer size measures that wait; directory size does not. The measurement names the tool that produced it and the compression it applied, because two tools reporting different numbers for one payload make a budget unreviewable. A published size-limit tool holding the budget in its configuration is the baseline. A project-owned script recording the same two facts is equally valid.

## Conventions

### Keep browser-capability tests honest

**Default:** Test both the supported and unsupported paths of any feature depending on a browser capability.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A feature that depends on a browser capability meets browsers that lack it. Testing both paths proves the supported behavior and the guidance the unsupported browser shows. The unsupported path asserts user-facing guidance, because a silent absence of behavior reads as a broken page.

### Keep end-to-end tests few

**Default:** Limit the browser suite to the required flows and specification-named interactions.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Browser tests are slow and share one deployment, so each one costs the whole suite's runtime. The required flows and specification-named interactions earn that cost; everything else runs faster and more precisely as a component or core test. This realizes litespec/frontend/testing#match-test-level-to-risk.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/frontend/blazor/testing#use-the-four-client-test-projects | guidance | Do the four test projects exist and run in CI? |
| litespec/frontend/blazor/testing#prove-each-case-with-a-test | guidance | Does each Case have a test whose steps call the use case and assert the Result? |
| litespec/frontend/blazor/testing#test-the-core-without-a-browser | guidance | Does any core test project reference a browser or interop type? |
| litespec/frontend/blazor/testing#replace-interop-in-component-tests | guidance | Does each render substitute every Application interface? |
| litespec/frontend/blazor/testing#verify-real-browser-behavior-end-to-end | guidance | Does the browser suite cover the primary flow, storage loss, offline startup, and portability? |
| litespec/frontend/blazor/testing#enforce-the-first-load-budget | guidance | Does the CI publish job fail when transfer size exceeds the recorded budget? |
| litespec/frontend/blazor/testing#keep-browser-capability-tests-honest | guidance | Does each capability-dependent feature test both its paths? |
| litespec/frontend/blazor/testing#keep-end-to-end-tests-few | guidance | Does each browser case map to a required flow or named interaction? |
