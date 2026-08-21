# Frontend Testing

## Intent


Frontend tests should prove use-case behavior at the cheapest boundary that represents the risk. Utilities and interactive modules receive fast focused tests. Browser end-to-end flows receive end-to-end test evidence.

## Agent Summary {#agent-summary}


- Match test level to risk. (FTEST.LEVEL.001)
- Trace acceptance behavior. (FTEST.TRACE.001)
- Test observable states. (FTEST.STATES.001)
- Keep mocks at owned boundaries. (FTEST.MOCKS.001)
- Isolate browser tests. (FTEST.ISOLATION.001)
- Run the changed application gates. (FTEST.GATES.001)
- Prove controlled UI changes. (FTEST.UI.001)

## Standards


### Match test level to risk (FTEST.LEVEL.001)

**Requirement:** Frontend tests MUST match test level to risk.

**Rationale:** The implementation uses unit tests for pure formatting, mapping, validation, and state transitions. The implementation uses component tests for user interaction inside one component boundary. The implementation uses Playwright for navigation, authentication, browser integration, and end-to-end tests.

The implementation does not add a browser test for every static route or a snapshot in place of behavior assertions.

### Trace acceptance behavior (FTEST.TRACE.001)

**Requirement:** Frontend tests MUST trace acceptance behavior.

**Rationale:** When a frontend test proves an acceptance criterion from a verified Use case, include its exact ID in the test title or metadata.

**Example:**

```typescript
test('[AC-POSTS-CREATE-DRAFT-01] creates a draft', async ({ page }) => {
  // Browser behavior.
})
```

### Test observable states (FTEST.STATES.001)

**Requirement:** Frontend tests MUST test observable states.

**Rationale:** Tests cover applicable loading, empty, error, forbidden, not-found, pending mutation, validation, and success behavior. Assertions use behavior that a user can observe and operate.

### Keep mocks at owned boundaries (FTEST.MOCKS.001)

**Requirement:** Frontend tests MUST keep mocks at owned boundaries.

**Rationale:** Component tests may replace the typed API operation or server action boundary. The implementation does not mock React, Next.js rendering internals, generated types, or implementation-private functions.

### Isolate browser tests (FTEST.ISOLATION.001)

**Requirement:** Frontend tests MUST isolate browser tests.

**Rationale:** Each browser test creates or identifies its own data, authentication context, and expected state. Tests do
not depend on execution order or mutable data left by another case. The project records whether a test
uses one isolated worker, one fixture per test, a seeded read-only fixture, or a disposable browser
context. A test that needs shared state names the owner, reset operation, and reason.

The default is one independent browser context per test and a deterministic worker count in CI. A failed
test is rerun only to diagnose the failure. The implementation does not increase retries, serialize the suite, or share a
mutable fixture as a way to make an unexplained failure pass.

### Run the changed application gates (FTEST.GATES.001)

**Requirement:** Frontend tests MUST run the changed application gates.

**Rationale:** Each changed frontend runs frozen installation, lint, type checking, Vitest, and production build. The implementation runs Playwright when a browser end-to-end flow, route, authentication, or browser integration changes.

### Prove controlled UI changes (FTEST.UI.001)

**Requirement:** Frontend tests MUST prove controlled UI changes.

**Rationale:** For a primitive, pattern, token, preset, source-lock, or page-contract change, select affected states from the frontend UI vocabulary. The implementation runs the narrowest evidence that represents the risk:

- component tests for interaction, validation, pending, disabled, and error states;
- keyboard and focus checks for every interactive path, including dialog or menu return focus;
- accessible-name, label, role, status-announcement, and automated accessibility checks;
- compact and wide browser checks for every responsive mode in the page contract;
- direct-navigation checks for the declared initial scroll and active element;
- visual comparisons in a declared browser, viewport, font-loading, and OS environment;
- manual screen-reader, zoom, contrast, and reduced-motion checks for regulated or high-risk flows.

Before first release, the product profile has the minimum browser evidence in [controlled UI governance](ui-governance.md). The implementation repeats it when the shell or preset changes.

The implementation does not update a visual baseline automatically after a failure. Baseline review covers the rendered change, source diff, and affected vocabulary or page contract.

## Conventions


### Keep focused tests beside source (FTEST.CONVENTION.001)

**Default:** Keep focused tests beside source.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** The implementation uses `*.test.ts` or `*.test.tsx` beside the tested module. The implementation keeps Playwright cases under one application-owned `tests/e2e/` root with page objects or fixtures under `tests/support/` only when reused.

### Query by accessible behavior (FTEST.CONVENTION.002)

**Default:** Query by accessible behavior.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** The implementation prefers roles, labels, names, and visible text. The implementation uses test IDs only when no stable user-facing selector represents the element.

### Keep test support narrow (FTEST.CONVENTION.003)

**Default:** Keep test support narrow.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** The implementation creates render helpers for required providers and request mocks. The implementation does not create a second application framework inside test support.

## Reference example

This informative example demonstrates `FTEST.STATES.001`, `FTEST.MOCKS.001`, and `FTEST.ISOLATION.001`.

`CreateDraftForm.test.tsx` proves field errors, pending state, and successful submission through a mocked action. `create-draft.spec.ts` proves authenticated navigation, API integration. The acceptance criterion through the browser.

## Verification


| ID | Method | Evidence |
|:---|:---|:---|
| FTEST.LEVEL.001 | test | An automated test citing `FTEST.LEVEL.001` asserts `match test level to risk` at the affected boundary. |
| FTEST.TRACE.001 | test | An automated test citing `FTEST.TRACE.001` asserts `trace acceptance behavior` at the affected boundary. |
| FTEST.STATES.001 | test | An automated test citing `FTEST.STATES.001` asserts `test observable states` at the affected boundary. |
| FTEST.MOCKS.001 | test | An automated test citing `FTEST.MOCKS.001` asserts `keep mocks at owned boundaries` at the affected boundary. |
| FTEST.ISOLATION.001 | test | An automated test citing `FTEST.ISOLATION.001` asserts `isolate browser tests` at the affected boundary. |
| FTEST.GATES.001 | test | An automated test citing `FTEST.GATES.001` asserts `run the changed application gates` at the affected boundary. |
| FTEST.UI.001 | test | An automated test citing `FTEST.UI.001` asserts `prove controlled UI changes` at the affected boundary. |
| FTEST.CONVENTION.001 | test | An automated test citing `FTEST.CONVENTION.001` asserts `keep focused tests beside source` at the affected boundary. |
| FTEST.CONVENTION.002 | test | An automated test citing `FTEST.CONVENTION.002` asserts `query by accessible behavior` at the affected boundary. |
| FTEST.CONVENTION.003 | test | An automated test citing `FTEST.CONVENTION.003` asserts `keep test support narrow` at the affected boundary. |
