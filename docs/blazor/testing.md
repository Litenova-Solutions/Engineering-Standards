# Blazor Testing

## Intent

The client has four test projects matching its four boundaries. Core tests run without a browser, component tests substitute interop, and a small browser suite proves the behavior only a real browser can show.

## Agent Summary {#agent-summary}

- Four test projects match the four client boundaries. (BLAZOR.TESTING.PROJECTS.001)
- Every acceptance criterion of a verified use case is cited by a test. (BLAZOR.TESTING.ACCEPTANCE.001)
- Domain and Application tests run with no browser or storage. (BLAZOR.TESTING.CORE.001)
- Component tests substitute every Application interface. (BLAZOR.TESTING.COMPONENTS.001)
- A browser suite covers the primary flow, storage loss, offline, and portability. (BLAZOR.TESTING.E2E.001)
- CI fails when the first-load payload exceeds its budget. (BLAZOR.TESTING.BUDGET.001)

## Standards

### Use the four client test projects (BLAZOR.TESTING.PROJECTS.001)

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

### Cite acceptance criteria (BLAZOR.TESTING.ACCEPTANCE.001)

**Requirement:** Every acceptance criterion of a verified use case MUST appear in at least one automated test.

**Rationale:** A use case is not verified until its identifiers appear in tests, matching the baseline rule.

### Test the core without a browser (BLAZOR.TESTING.CORE.001)

**Requirement:** A Domain or Application test MUST run with no browser, JavaScript host, or storage.

**Rationale:** A core test needing an interop substitute indicates a layering defect, so the fix belongs in the layering rather than the test.

### Replace interop in component tests (BLAZOR.TESTING.COMPONENTS.001)

**Requirement:** A component test MUST inject a test double for every Application interface, including interop.

**Rationale:** Coverage includes keyboard interaction and the loading, empty, and error states each route declares. A component test starts no browser and asserts on user-visible output rather than markup structure.

### Verify real browser behavior end to end (BLAZOR.TESTING.E2E.001)

**Requirement:** A browser suite MUST cover the primary release flow, startup with storage unavailable, offline startup, and export followed by import.

**Rationale:** These four are the paths where a client-only product loses user work, and none of them can be proved without a real browser.

### Enforce the first-load budget (BLAZOR.TESTING.BUDGET.001)

**Requirement:** CI MUST measure the compressed transfer size of the published framework payload and fail above the recorded budget.

**Rationale:** Directory size does not describe what a visitor waits for, so the measurement uses transfer size.

## Conventions

### Keep browser-capability tests honest (BLAZOR.TESTING.CONVENTION.001)

**Default:** Test both the supported and unsupported path of any feature depending on a browser capability.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** The unsupported path asserts the user-facing guidance rather than a silent absence of behavior.

### Keep end-to-end tests few (BLAZOR.TESTING.CONVENTION.002)

**Default:** Limit the browser suite to the required flows and specification-named interactions.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Browser tests are slow and shared, so everything else belongs in component or core tests.

## Verification

| ID | Method | Evidence |
|:---|:---|:---|
| BLAZOR.TESTING.PROJECTS.001 | test | `ClientSolutionTests` asserts the four test projects exist and run in CI. |
| BLAZOR.TESTING.ACCEPTANCE.001 | static | `node standards/tools/validate-consumer.mjs` resolves each acceptance identifier to a test reference. |
| BLAZOR.TESTING.CORE.001 | test | `ClientArchitectureTests` asserts no core test project references a browser or interop type. |
| BLAZOR.TESTING.COMPONENTS.001 | test | `ComponentContractTests` asserts each render substitutes every Application interface. |
| BLAZOR.TESTING.E2E.001 | test | `EndToEndTests` covers the primary flow, storage loss, offline startup, and export with import. |
| BLAZOR.TESTING.BUDGET.001 | operation | The CI budget job compares published transfer size against the Operating Limits value. |
| BLAZOR.TESTING.CONVENTION.001 | test | `CapabilityTests` covers the supported and unsupported path of each capability-dependent feature. |
| BLAZOR.TESTING.CONVENTION.002 | inspection | Browser suite review confirms each case maps to a required flow or a named interaction. |
