# Frontend Testing

## Intent

Frontend tests should prove use-case behavior at the cheapest boundary that represents the risk. Utilities and interactive modules receive fast focused tests. Browser end-to-end flows receive end-to-end test evidence.

## Agent Summary {#agent-summary}

- Use Vitest for utilities, mappings, schemas, hooks, and interactive components.
- Use Playwright for browser end-to-end flows and cross-route behavior.
- Keep acceptance IDs in tests that prove documented criteria.
- Test loading, empty, error, forbidden, pending, and ready states that apply.
- Mock the network boundary, not framework internals, in component tests.
- Prove component keyboard, focus, labeling, responsive, and visual states for UI changes.
- Test direct-navigation scroll and focus when a page or shell changes.
- Declare the Playwright worker and fixture model; do not hide flaky isolation failures with retries.
- Run tests for every changed frontend application.

## Standards

### Match test level to risk (FTEST.LEVEL.001)

Use unit tests for pure formatting, mapping, validation, and state transitions. Use component tests for user interaction inside one component boundary. Use Playwright for navigation, authentication, browser integration, and end-to-end tests.

Do not add a browser test for every static route or a snapshot in place of behavior assertions.

### Trace acceptance behavior (FTEST.TRACE.001)

When a frontend test proves an acceptance criterion from a verified Use case, include its exact ID in the test title or metadata.

```typescript
test('[AC-POSTS-CREATE-DRAFT-01] creates a draft', async ({ page }) => {
  // Browser behavior.
})
```

### Test observable states (FTEST.STATES.001)

Test applicable loading, empty, error, forbidden, not-found, pending mutation, validation, and success behavior. Assert what a user can observe and operate.

### Keep mocks at owned boundaries (FTEST.MOCKS.001)

Component tests may replace the typed API operation or server action boundary. Do not mock React, Next.js rendering internals, generated types, or implementation-private functions.

### Isolate browser tests (FTEST.ISOLATION.001)

Each browser test creates or identifies its own data, authentication context, and expected state. Tests do
not depend on execution order or mutable data left by another case. The project records whether a test
uses one isolated worker, one fixture per test, a seeded read-only fixture, or a disposable browser
context. A test that needs shared state names the owner, reset operation, and reason.

The default is one independent browser context per test and a deterministic worker count in CI. A failed
test is rerun only to diagnose the failure. Do not increase retries, serialize the suite, or share a
mutable fixture as a way to make an unexplained failure pass.

### Run the changed application gates (FTEST.GATES.001)

For each changed frontend run frozen installation, lint, type checking, Vitest, and production build. Run Playwright when a browser end-to-end flow, route, authentication, or browser integration changes.

### Prove controlled UI changes (FTEST.UI.001)

For a primitive, pattern, token, preset, source-lock, or page-contract change, select the affected
states from the frontend UI vocabulary and run the narrowest evidence that represents the risk:

- component tests for interaction, validation, pending, disabled, and error states;
- keyboard and focus checks for every interactive path, including dialog or menu return focus;
- accessible-name, label, role, status-announcement, and automated accessibility checks;
- compact and wide browser checks for every responsive mode in the page contract;
- direct-navigation checks for the declared initial scroll and active element;
- visual comparisons in a declared browser, viewport, font-loading, and OS environment;
- manual screen-reader, zoom, contrast, and reduced-motion checks for regulated or high-risk flows.

Cover the minimum browser evidence set for the frontend's product profile, defined in
[controlled UI governance](ui-governance.md), before its first release and again when its shell or preset
changes.

Do not update a visual baseline automatically after a failure. Review the rendered change, its source
diff, and the affected vocabulary or page contract before accepting a new baseline.

## Conventions

### Keep focused tests beside source

Use `*.test.ts` or `*.test.tsx` beside the tested module. Keep Playwright cases under one application-owned `tests/e2e/` root with page objects or fixtures under `tests/support/` only when reused.

### Query by accessible behavior

Prefer roles, labels, names, and visible text. Use test IDs only when no stable user-facing selector represents the element.

### Keep test support narrow

Create render helpers for required providers and request mocks. Do not create a second application framework inside test support.

## Examples

`CreateDraftForm.test.tsx` proves field errors, pending state, and successful submission through a mocked action. `create-draft.spec.ts` proves authenticated navigation, API integration, and the acceptance criterion through the browser.

## Verification

- Confirm each test runs at the narrowest sufficient level.
- Confirm critical acceptance criteria have browser evidence where browser behavior matters.
- Search for implementation-only selectors and broad snapshots.
- Run the complete gate set for every changed frontend.
- Confirm browser tests are independent and repeatable.
- Confirm each UI source digest, vocabulary item, and page sidecar is validated when the frontend UI
  configuration is present.
- Confirm the worker and fixture model is declared and failures are not masked by retries or ordering.
- Confirm changed UI states have component, keyboard, accessibility, responsive, visual, or manual
  evidence required by `UI.EVIDENCE.001`.
