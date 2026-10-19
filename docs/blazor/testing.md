# Blazor Testing

## Intent

The client has four test projects matching its four boundaries. Core tests run without a browser, component tests substitute interop, and a small browser suite proves the behavior only a real browser can show.

## Agent Summary {#agent-summary}

- Four test projects match the four client boundaries. (standards/rule/blazor-testing.use-the-four-client-test-projects)
- Each Case is proved by a test calling the use case and asserting the Result. (standards/rule/blazor-testing.prove-each-case-with-a-test)
- Domain and Application tests run with no browser or storage. (standards/rule/blazor-testing.test-the-core-without-a-browser)
- Component tests substitute every Application interface. (standards/rule/blazor-testing.replace-interop-in-component-tests)
- A browser suite covers the primary flow, storage loss, offline, and portability. (standards/rule/blazor-testing.verify-real-browser-behavior-end-to-end)
- CI fails when the first-load payload exceeds its budget. (standards/rule/blazor-testing.enforce-the-first-load-budget)

## Standards

### Use the four client test projects (standards/rule/blazor-testing.use-the-four-client-test-projects)

**Requirement:** A client solution MUST contain Domain, Application, Web, and end-to-end test projects and no other baseline test project.

**Rationale:** This replaces the backend testing project set, because there is no API factory, PostgreSQL container, or database reset.

**Example:**

```text
tests/
  {ProjectName}.Domain.Tests/          invariants, closed sets, state transitions
  {ProjectName}.Application.Tests/     handlers, validators, result unions
  {ProjectName}.Web.Tests/             component rendering and interaction
  {ProjectName}.EndToEnd.Tests/        real browser flows
```

### Prove each case with a test (standards/rule/blazor-testing.prove-each-case-with-a-test)

**Requirement:** Each Case of a use case MUST be proved by an automated test whose steps call the use case and assert the Result.

**Rationale:** A test proves a Case only when its steps call the use case and assert the Result. The link is then computed from the test rather than claimed in prose. A Case no test proves is recorded as a Known gap with an owner and an end date.

### Test the core without a browser (standards/rule/blazor-testing.test-the-core-without-a-browser)

**Requirement:** A Domain or Application test MUST run with no browser, JavaScript host, or storage.

**Rationale:** A core test needing an interop substitute indicates a layering defect, so the fix belongs in the layering rather than the test.

### Replace interop in component tests (standards/rule/blazor-testing.replace-interop-in-component-tests)

**Requirement:** A component test MUST inject a test double for every Application interface, including interop.

**Rationale:** Coverage includes keyboard interaction and the states each route declares. A component test starts no browser and asserts on user-visible output rather than markup structure.

### Verify real browser behavior end to end (standards/rule/blazor-testing.verify-real-browser-behavior-end-to-end)

**Requirement:** A browser suite MUST cover the primary release flow, startup with storage unavailable, offline startup, and export followed by import.

**Rationale:** These four are the paths where a client-only product loses user work, and none of them can be proved without a real browser.

### Enforce the first-load budget (standards/rule/blazor-testing.enforce-the-first-load-budget)

**Requirement:** CI MUST measure the compressed transfer size of the published framework payload and fail above the recorded budget.

**Rationale:** Directory size does not describe what a visitor waits for, so the measurement uses transfer size.

The measurement names the tool that produced it and the compression it applied. Two tools reporting different numbers for one payload make a budget unreviewable. A published size-limit tool holding the budget in its configuration is the baseline. A project-owned script recording the same two facts is equally valid.

## Conventions

### Keep browser-capability tests honest (standards/rule/blazor-testing.keep-browser-capability-tests-honest)

**Default:** Test both the supported and unsupported path of any feature depending on a browser capability.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** The unsupported path asserts the user-facing guidance rather than a silent absence of behavior.

### Keep end-to-end tests few (standards/rule/blazor-testing.keep-end-to-end-tests-few)

**Default:** Limit the browser suite to the required flows and specification-named interactions.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Browser tests are slow and shared, so everything else belongs in component or core tests.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| standards/rule/blazor-testing.use-the-four-client-test-projects | guidance | Do the four test projects exist and run in CI? |
| standards/rule/blazor-testing.prove-each-case-with-a-test | guidance | Does each Case have a test whose steps call the use case and assert the Result? |
| standards/rule/blazor-testing.test-the-core-without-a-browser | guidance | Does any core test project reference a browser or interop type? |
| standards/rule/blazor-testing.replace-interop-in-component-tests | guidance | Does each render substitute every Application interface? |
| standards/rule/blazor-testing.verify-real-browser-behavior-end-to-end | guidance | Does the browser suite cover the primary flow, storage loss, offline startup, and portability? |
| standards/rule/blazor-testing.enforce-the-first-load-budget | guidance | Does the CI publish job fail when transfer size exceeds the recorded budget? |
| standards/rule/blazor-testing.keep-browser-capability-tests-honest | guidance | Does each capability-dependent feature test both its paths? |
| standards/rule/blazor-testing.keep-end-to-end-tests-few | guidance | Does each browser case map to a required flow or named interaction? |
