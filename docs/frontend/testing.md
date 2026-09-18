# Frontend Testing

## Intent


Frontend tests should prove use-case behavior at the cheapest boundary that represents the risk. Utilities and interactive modules receive fast focused tests. Browser end-to-end flows receive end-to-end test evidence.

## Agent Summary {#agent-summary}


- Test level matches the risk it covers. (standards/rule/frontend-testing.match-test-level-to-risk)
- Tests proving acceptance criteria start their title with the identifier. (standards/rule/frontend-testing.start-a-proving-test-title-with-its-criterion)
- Tests assert observable behavior in every applicable state. (standards/rule/frontend-testing.test-observable-states)
- Mocks stay at owned contract boundaries. (standards/rule/frontend-testing.keep-mocks-at-owned-boundaries)
- Browser tests own their data and context. (standards/rule/frontend-testing.isolate-browser-tests)
- A changed frontend runs its five gate commands. (standards/rule/frontend-testing.run-the-changed-application-gates)
- UI changes run the evidence their vocabulary declares. (standards/rule/frontend-testing.prove-controlled-ui-changes)

## Standards


### Match test level to risk (standards/rule/frontend-testing.match-test-level-to-risk)

**Requirement:** A frontend MUST use unit tests for pure logic, component tests for single-component interaction, and Playwright for navigation and integration.

**Rationale:** Matching level to risk keeps the fast tests fast and reserves browser runs for behavior only a browser proves.

### Start a proving test title with its criterion (standards/rule/frontend-testing.start-a-proving-test-title-with-its-criterion)

**Requirement:** A frontend test proving an acceptance criterion MUST begin its title with that identifier in square brackets.

**Rationale:** The earlier rule accepted the identifier in a title or in metadata, which is two places and no stated form. A runner reports the title, so a reader watching a failure sees the criterion without opening the file. A scan reads one position rather than every string.

**Example:** A browser test opens its title with the criterion it proves.

```typescript
test('[AC-POSTS-CREATE-DRAFT-01] creates a draft', async ({ page }) => {
  // Browser behavior.
})
```

### Test observable states (standards/rule/frontend-testing.test-observable-states)

**Requirement:** A frontend test MUST assert observable behavior across loading, empty, error, forbidden, not-found, pending, validation, and success states.

**Rationale:** An assertion on internal state passes while the rendered page stays broken.

### Keep mocks at owned boundaries (standards/rule/frontend-testing.keep-mocks-at-owned-boundaries)

**Requirement:** A frontend test MUST NOT mock React, framework rendering internals, generated types, or implementation-private functions.

**Rationale:** A component test may still replace the typed API operation or server action boundary, because those are owned contracts.

### Isolate browser tests (standards/rule/frontend-testing.isolate-browser-tests)

**Requirement:** A browser test MUST create or identify its own data, authentication context, and expected state.

**Rationale:** A test depending on execution order or leftover data fails for reasons unrelated to the change under review.

### Run the changed application gates (standards/rule/frontend-testing.run-the-changed-application-gates)

**Requirement:** A changed frontend MUST run frozen installation, lint, type checking, Vitest, and a production build.

**Rationale:** Playwright runs additionally when a browser flow, route, authentication, or browser integration changes.

The dependency audit is not on this list because it belongs to a different trigger. A source change runs these five; a manifest or lockfile change runs the audit that `standards/rule/quality-security.pin-and-review-dependencies` requires, through the gate table in `standards/rule/quality-ci.run-applicable-gates-on-every-pull-request`. Running the audit on every source change reports the same advisories until somebody changes a dependency.

### Prove controlled UI changes (standards/rule/frontend-testing.prove-controlled-ui-changes)

**Requirement:** A primitive, pattern, token, preset, source-lock, or page-contract change MUST run the narrowest evidence its risk requires.

**Rationale:** The affected states come from the frontend UI vocabulary, so evidence follows the change rather than a fixed suite.

## Conventions


### Keep focused tests beside source (standards/rule/frontend-testing.keep-focused-tests-beside-source)

**Default:** Name focused tests `*.test.ts` or `*.test.tsx` beside their module, and keep Playwright cases under one `tests/e2e/` root.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Support fixtures and page objects then sit under one `tests/support/` folder rather than beside features.

### Query by accessible behavior (standards/rule/frontend-testing.query-by-accessible-behavior)

**Default:** Query elements by role, label, name, or visible text before reaching for a test identifier.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A query by accessible name fails when the accessible name breaks, which is the behavior worth protecting.

### Keep test support narrow (standards/rule/frontend-testing.keep-test-support-narrow)

**Default:** Limit test support to render helpers for required providers and request mocks.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Support code that grows into a second application framework becomes its own untested surface.

## Reference example

This informative example demonstrates `standards/rule/frontend-testing.test-observable-states`, `standards/rule/frontend-testing.keep-mocks-at-owned-boundaries`, and `standards/rule/frontend-testing.isolate-browser-tests`.

`CreateDraftForm.test.tsx` proves field errors, pending state, and successful submission through a mocked action. `create-draft.spec.ts` proves authenticated navigation, API integration. The acceptance criterion through the browser.

## Verification


| ID | Method | Evidence |
|:---|:---|:---|
| standards/rule/frontend-testing.match-test-level-to-risk | inspection | Test review compares each new test against the level its risk requires. |
| standards/rule/frontend-testing.start-a-proving-test-title-with-its-criterion | static | `node standards/tools/validate-consumer.mjs` resolves each bracketed title citation under the declared test roots to a declared criterion. |
| standards/rule/frontend-testing.test-observable-states | test | `ComponentStateTests` asserts each applicable state through user-observable output. |
| standards/rule/frontend-testing.keep-mocks-at-owned-boundaries | test | `TestBoundaryTests` asserts no test replaces a framework internal or private function. |
| standards/rule/frontend-testing.isolate-browser-tests | test | `node standards/tools/validate-ui.mjs` and a randomized Playwright order confirm no case depends on another. |
| standards/rule/frontend-testing.run-the-changed-application-gates | test | The CI frontend job runs `pnpm lint`, `type-check`, `test`, and `build`, failing on any non-zero exit. |
| standards/rule/frontend-testing.prove-controlled-ui-changes | test | `node standards/tools/validate-ui.mjs` resolves each changed surface to the evidence its vocabulary declares. |
| standards/rule/frontend-testing.keep-focused-tests-beside-source | inspection | Test layout review confirms the two roots and the beside-source naming. |
| standards/rule/frontend-testing.query-by-accessible-behavior | inspection | Test review confirms each test identifier query has no stable user-facing alternative. |
| standards/rule/frontend-testing.keep-test-support-narrow | inspection | Test support review confirms helpers stay limited to providers and request mocks. |
