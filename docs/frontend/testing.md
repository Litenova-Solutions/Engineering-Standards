# Frontend Testing

## Intent


Frontend tests prove behavior at the cheapest boundary that represents the risk. Four kinds run against a frontend, and each one answers one question.

| Kind | Where it runs | What it proves |
|:---|:---|:---|
| Logic | Vitest beside the module | A mapping, a computed window, a state decision |
| Structure | Vitest beside the suite | The module tree mirrors the backend |
| Route contract | Playwright against a running stack | Every route renders one floorplan and passes the browser checks |
| Evidence | Playwright against a running stack | A use case's paths, with each declared refusal provoked by name |

A browser suite needs a deployment. Nothing in it starts one, so the same suite runs against a developer's stack and against a review deployment.

## Agent Summary {#agent-summary}


- The test level matches the risk it covers. (standards/rule/frontend-testing.match-test-level-to-risk)
- A proving test title opens with the criterion or path it proves. (standards/rule/frontend-testing.start-a-proving-test-title-with-its-criterion, standards/rule/frontend-testing.name-a-browser-test-with-the-path-it-proves)
- Each declared refusal is reached by its code. (standards/rule/frontend-testing.assert-each-declared-refusal-by-its-code)
- Tests assert observable behavior in every applicable state. (standards/rule/frontend-testing.test-observable-states)
- Mocks stay at owned contract boundaries. (standards/rule/frontend-testing.keep-mocks-at-owned-boundaries)
- The structure test proves the module mirror. (standards/rule/frontend-testing.prove-the-module-mirror-in-a-structure-test)
- A changed frontend runs its five gate commands. (standards/rule/frontend-testing.run-the-changed-application-gates)

## Standards


### Match test level to risk (standards/rule/frontend-testing.match-test-level-to-risk)

**Requirement:** A frontend MUST use a logic test for pure logic, a browser specification for navigation and integration, and the route contract for every address.

**Rationale:** Matching level to risk keeps the fast tests fast and reserves browser runs for behavior only a browser proves.

### Start a proving test title with its criterion (standards/rule/frontend-testing.start-a-proving-test-title-with-its-criterion)

**Requirement:** A frontend test proving an acceptance criterion MUST open its title with that identifier in square brackets.

**Rationale:** A runner reports the title, so a reader watching a failure sees the criterion without opening the file. A scan reads one position rather than every string.

**Example:** A browser test opens its title with the criterion it proves.

```typescript
test('[AC-POSTS-CREATE-DRAFT-01] creates a draft', async ({ page }) => {
  // Browser behavior.
})
```

### Name a browser test with the path it proves (standards/rule/frontend-testing.name-a-browser-test-with-the-path-it-proves)

**Requirement:** A browser test proving one outcome of one use case MUST open its title with `[path/<module>.<use-case>.<outcome>]`.

**Rationale:** The path coverage check derives the reachable paths from the route code and reads the titles to find the proof. A title that names anything else contributes nothing to that check and cannot be traced to a specification page.

**Example:** One specification names its paths in the order a reader reaches them.

```typescript
test('[path/orders.read-order.not-found] says the order is not there', async ({ page }) => {
  // Browser behavior.
})
```

### Assert each declared refusal by its code (standards/rule/frontend-testing.assert-each-declared-refusal-by-its-code)

**Requirement:** An evidence specification for a use case declaring a refusal MUST reach that refusal and assert it by its published code.

**Rationale:** A refusal that only appears in a log has never been seen rendered. Addressing it by code also proves the code the specification declares is the code the page shows.

**Example:** The refusal alert carries the code, so the assertion names it.

```typescript
await expect(refusalFor(page, "failure/refunds.exceeds_refundable")).toBeVisible({ timeout: AFTER_ACTION });
```

### Test observable states (standards/rule/frontend-testing.test-observable-states)

**Requirement:** A frontend test MUST assert observable behavior across loading, empty, error, forbidden, not-found, pending, validation, and success states.

**Rationale:** An assertion on internal state passes while the rendered page stays broken.

### Keep mocks at owned boundaries (standards/rule/frontend-testing.keep-mocks-at-owned-boundaries)

**Requirement:** A frontend test MUST NOT mock the rendering library, the router, the query library, the generated types, or an implementation-private function.

**Rationale:** A test may still replace the generated operation boundary, because that is an owned contract. Everything else it replaces becomes a claim about code the test no longer exercises.

### Isolate browser tests (standards/rule/frontend-testing.isolate-browser-tests)

**Requirement:** A browser test MUST create or identify its own data, its own authentication context, and its own expected state.

**Rationale:** A test depending on execution order or on leftover data fails for reasons unrelated to the change under review. A command that spends a seeded record leaves the next run a deployment with nothing to read. So a suite exercises a command as far as its own form refuses, unless the record is the test's own.

### Prove the module mirror in a structure test (standards/rule/frontend-testing.prove-the-module-mirror-in-a-structure-test)

**Requirement:** A frontend calling the API MUST hold a test asserting that its module tree resolves to the backend use-case folders and names no refused folder.

**Rationale:** The mirror is the claim that makes a specification findable from a folder path. A check that runs on every build is what keeps it true after a backend use case is added or renamed.

**Example:** The structure check resolves each folder name against the backend's Application tree.

```typescript
test("every module folder names a backend use case, and no folder is named for nothing", () => {
  expect(checkModuleStructure(appRoot, applicationRoot)).toEqual([]);
});
```

### Run the changed application gates (standards/rule/frontend-testing.run-the-changed-application-gates)

**Requirement:** A changed frontend MUST run a frozen installation, lint, type checking, the logic tests, and a production build.

**Rationale:** Browser runs additionally when a route, a command, a session path, or a browser integration changes. The route tree is regenerated inside the build and type-check scripts, so a route added without a regenerated tree fails rather than passing unreviewed.

The dependency audit is not on this list because it belongs to a different trigger. A source change runs these five; a manifest or lockfile change runs the audit that `standards/rule/quality-security.pin-and-review-dependencies` requires, through the gate table in `standards/rule/quality-ci.run-applicable-gates-on-every-pull-request`.

### Prove controlled UI changes (standards/rule/frontend-testing.prove-controlled-ui-changes)

**Requirement:** A primitive, composite, token, source, floorplan, or page-contract change MUST run the narrowest evidence its risk requires.

**Rationale:** The evidence matrix in `docs/frontend/ui.md` names it per change class, so evidence follows the change rather than a fixed suite.

## Conventions


### Keep focused tests beside source (standards/rule/frontend-testing.keep-focused-tests-beside-source)

**Default:** Name a logic test `*.test.ts` or `*.test.tsx` beside its module, and keep browser specifications under one `tests/e2e/` root per frontend.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Support fixtures and page objects then sit under one `tests/support/` folder rather than beside features.

### Query by accessible behavior (standards/rule/frontend-testing.query-by-accessible-behavior)

**Default:** Query elements by role, label, name, or visible text before reaching for a test identifier.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A query by accessible name fails when the accessible name breaks, which is the behavior worth protecting. Two attributes are load-bearing rather than identifiers: the floorplan's own attribute, and a component's slot.

### Keep test support narrow (standards/rule/frontend-testing.keep-test-support-narrow)

**Default:** Limit test support to render helpers for required providers, to one API helper that every specification shares, and to the locator helpers.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Support code that grows into a second application framework becomes its own untested surface. One API helper means a change to the actor header or the idempotency key reaches the fixtures and not every specification.

### Read the deployment for its identifiers (standards/rule/frontend-testing.read-the-deployment-for-its-identifiers)

**Default:** Read a record identifier a browser test needs from the running deployment, and fall back to an absent identifier when the deployment holds none.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A hard-coded identifier passes against one deployment and fails against the next. A fallback keeps the route visited as a not-found page, which is the state a reader can reach anyway.

## Reference example

This informative example demonstrates `standards/rule/frontend-testing.match-test-level-to-risk`, `standards/rule/frontend-testing.assert-each-declared-refusal-by-its-code`, and `standards/rule/frontend-testing.isolate-browser-tests`.

A withdrawal window is a pure function, so it takes a logic test beside it. A redelivery dialog is reached only through a record, so it takes an evidence specification. That specification creates the order it needs and asserts the refusal by its code.

## Verification

| ID | Method | Evidence |
|:---|:---|:---|
| standards/rule/frontend-testing.match-test-level-to-risk | inspection | Test review compares each new test against the level its risk requires. |
| standards/rule/frontend-testing.start-a-proving-test-title-with-its-criterion | static | `node standards/tools/validate-consumer.mjs` resolves each bracketed title citation under the declared test roots to a declared criterion. |
| standards/rule/frontend-testing.name-a-browser-test-with-the-path-it-proves | static | The same validator resolves each `[path/<id>]` title to a path its specification declares. |
| standards/rule/frontend-testing.assert-each-declared-refusal-by-its-code | test | An evidence specification asserts `[data-code="failure/..."]` is visible after the command. |
| standards/rule/frontend-testing.test-observable-states | test | `*.test.tsx` asserts each applicable state through user-observable output. |
| standards/rule/frontend-testing.keep-mocks-at-owned-boundaries | test | Review of `*.test.ts` confirms no test replaces a library internal or a private function. |
| standards/rule/frontend-testing.isolate-browser-tests | test | A randomized `playwright test` order confirms no case depends on another. |
| standards/rule/frontend-testing.prove-the-module-mirror-in-a-structure-test | test | `tests/unit/structure.test.ts` asserts `checkModuleStructure` returns an empty list. |
| standards/rule/frontend-testing.run-the-changed-application-gates | test | The CI frontend job runs `pnpm lint`, `type-check`, `test`, and `build`, failing on any non-zero exit. |
| standards/rule/frontend-testing.prove-controlled-ui-changes | test | Review confirms each changed surface has the evidence the matrix in `docs/frontend/ui.md` names. |
| standards/rule/frontend-testing.keep-focused-tests-beside-source | inspection | Test layout review confirms the two roots and the beside-source naming. |
| standards/rule/frontend-testing.query-by-accessible-behavior | inspection | Test review confirms each identifier query has no stable user-facing alternative. |
| standards/rule/frontend-testing.keep-test-support-narrow | inspection | Test support review confirms the helpers stay limited to providers, one API helper, and locators. |
| standards/rule/frontend-testing.read-the-deployment-for-its-identifiers | inspection | Support review confirms each record identifier is read from the deployment rather than written in a specification. |