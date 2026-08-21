# Frontend Testing

## Intent


Frontend tests should prove use-case behavior at the cheapest boundary that represents the risk. Utilities and interactive modules receive fast focused tests. Browser end-to-end flows receive end-to-end test evidence.

## Agent Summary {#agent-summary}


- Test level matches the risk it covers. (FTEST.LEVEL.001)
- Tests proving acceptance criteria cite their identifier. (FTEST.TRACE.001)
- Tests assert observable behavior in every applicable state. (FTEST.STATES.001)
- Mocks stay at owned contract boundaries. (FTEST.MOCKS.001)
- Browser tests own their data and context. (FTEST.ISOLATION.001)
- A changed frontend runs its five gate commands. (FTEST.GATES.001)
- UI changes run the evidence their vocabulary declares. (FTEST.UI.001)

## Standards


### Match test level to risk (FTEST.LEVEL.001)

**Requirement:** A frontend MUST use unit tests for pure logic, component tests for single-component interaction, and Playwright for navigation and integration.

**Rationale:** Matching level to risk keeps the fast tests fast and reserves browser runs for behavior only a browser proves.

### Trace acceptance behavior (FTEST.TRACE.001)

**Requirement:** A frontend test proving an acceptance criterion MUST include that criterion identifier in its title or metadata.

**Rationale:** The identifier connects browser evidence to the approved behavior it proves.

**Example:**

```typescript
test('[AC-POSTS-CREATE-DRAFT-01] creates a draft', async ({ page }) => {
  // Browser behavior.
})
```

### Test observable states (FTEST.STATES.001)

**Requirement:** A frontend test MUST assert observable behavior across loading, empty, error, forbidden, not-found, pending, validation, and success states.

**Rationale:** An assertion on internal state passes while the rendered page stays broken.

### Keep mocks at owned boundaries (FTEST.MOCKS.001)

**Requirement:** A frontend test MUST NOT mock React, framework rendering internals, generated types, or implementation-private functions.

**Rationale:** A component test may still replace the typed API operation or server action boundary, because those are owned contracts.

### Isolate browser tests (FTEST.ISOLATION.001)

**Requirement:** A browser test MUST create or identify its own data, authentication context, and expected state.

**Rationale:** A test depending on execution order or leftover data fails for reasons unrelated to the change under review.

### Run the changed application gates (FTEST.GATES.001)

**Requirement:** A changed frontend MUST run frozen installation, lint, type checking, Vitest, and a production build.

**Rationale:** Playwright runs additionally when a browser flow, route, authentication, or browser integration changes.

### Prove controlled UI changes (FTEST.UI.001)

**Requirement:** A primitive, pattern, token, preset, source-lock, or page-contract change MUST run the narrowest evidence its risk requires.

**Rationale:** The affected states come from the frontend UI vocabulary, so evidence follows the change rather than a fixed suite.

## Conventions


### Keep focused tests beside source (FTEST.CONVENTION.001)

**Default:** Name focused tests `*.test.ts` or `*.test.tsx` beside their module, and keep Playwright cases under one `tests/e2e/` root.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Support fixtures and page objects then sit under one `tests/support/` folder rather than beside features.

### Query by accessible behavior (FTEST.CONVENTION.002)

**Default:** Query elements by role, label, name, or visible text before reaching for a test identifier.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A query by accessible name fails when the accessible name breaks, which is the behavior worth protecting.

### Keep test support narrow (FTEST.CONVENTION.003)

**Default:** Limit test support to render helpers for required providers and request mocks.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Support code that grows into a second application framework becomes its own untested surface.

## Reference example

This informative example demonstrates `FTEST.STATES.001`, `FTEST.MOCKS.001`, and `FTEST.ISOLATION.001`.

`CreateDraftForm.test.tsx` proves field errors, pending state, and successful submission through a mocked action. `create-draft.spec.ts` proves authenticated navigation, API integration. The acceptance criterion through the browser.

## Verification


| ID | Method | Evidence |
|:---|:---|:---|
| FTEST.LEVEL.001 | inspection | Test review compares each new test against the level its risk requires. |
| FTEST.TRACE.001 | test | `node standards/tools/validate-consumer.mjs` resolves each cited acceptance identifier to its use case. |
| FTEST.STATES.001 | test | `ComponentStateTests` asserts each applicable state through user-observable output. |
| FTEST.MOCKS.001 | test | `TestBoundaryTests` asserts no test replaces a framework internal or private function. |
| FTEST.ISOLATION.001 | test | `node standards/tools/validate-ui.mjs` and a randomized Playwright order confirm no case depends on another. |
| FTEST.GATES.001 | test | The CI frontend job runs `pnpm lint`, `type-check`, `test`, and `build`, failing on any non-zero exit. |
| FTEST.UI.001 | test | `node standards/tools/validate-ui.mjs` resolves each changed surface to the evidence its vocabulary declares. |
| FTEST.CONVENTION.001 | inspection | Test layout review confirms the two roots and the beside-source naming. |
| FTEST.CONVENTION.002 | inspection | Test review confirms each test identifier query has no stable user-facing alternative. |
| FTEST.CONVENTION.003 | inspection | Test support review confirms helpers stay limited to providers and request mocks. |
