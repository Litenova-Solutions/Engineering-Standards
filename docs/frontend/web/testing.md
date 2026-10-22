# Web Testing

## Intent

Web frontends prove pure logic in Vitest beside the module it covers and navigation and integration in Playwright against the running system. This page states the runners, libraries, and commands one web frontend requires, following the testing principles in [Frontend Testing](../testing.md). A team that applies it while writing tests keeps fast tests fast and proves every address and every declared refusal, each named way a use case, one user task, says no, in a browser.

## Concepts

### Test kinds

Each kind of test runs in one place and proves one thing:

| Kind | Where it runs | What it proves |
|:---|:---|:---|
| Logic | Vitest beside the module | A mapping, a computed window, a state decision |
| Structure | Vitest beside the suite | The module tree mirrors the backend |
| Route contract | Playwright against a running stack | Every route renders one floorplan and passes the browser checks |
| Evidence | Playwright against a running stack | A use case's Cases, with each declared refusal provoked by name |

## React

On the React stack, the mocks rule forbids replacing the rendering library, the router, and the query library.

## Svelte

On the Svelte stack, the mocks rule forbids replacing Svelte, SvelteKit, the query library, and the form library.

## Standards

### Match test level to risk

**Statement:** A web frontend MUST use Vitest for pure logic, Playwright for navigation and integration, and the route contract for every address.

**Rationale:** Vitest runs beside the module with no browser, so pure logic stays fast and precise. Playwright runs against a running stack, so navigation and integration prove real browser behavior. The route contract visits every address, so no route ships unproved. Each level proves what only it can, and fast tests never pay for a browser. This realizes litespec/frontend/testing#match-test-level-to-risk.

### Assert each declared refusal by its code

**Statement:** A web evidence specification for a use case declaring a refusal MUST reach that refusal and assert it by its Result's code.

**Rationale:** The refusal alert carries the Result's code in the rendered page, so the test names the exact refusal it provokes. Asserting by code ties the test to the specification's named outcome instead of to wording that rewording can change. A declared refusal no test reaches is a refusal nobody has seen render. This realizes litespec/frontend/testing#assert-each-declared-refusal-by-its-code.

**Example:** The refusal alert carries the code, so the assertion names it.

```typescript
await expect(refusalFor(page, "failure/orders.not_found")).toBeVisible({ timeout: AFTER_ACTION });
```

### Keep mocks at owned boundaries

**Statement:** A web test MUST NOT replace a library its stack section names.

**Rationale:** A mock replaces what the test owns: its own boundary's answers. Replacing a framework or library instead proves the mock's behavior rather than the product's, and hides the integration the test was meant to cover. The React section names the rendering library, the router, and the query library. The Svelte section names Svelte, SvelteKit, the query library, and the form library. This realizes litespec/frontend/testing#keep-mocks-at-owned-boundaries.

### Use network mocks for component tests

**Statement:** A web component or logic test that needs HTTP MUST serve its answers through network mocks generated from the published contract.

**Rationale:** A component or logic test that needs HTTP serves its answers through network mocks generated from the published contract, so the generated client stays in its production path and the test proves the real call shape. A mocked client would prove the mock: the component passes against answers the API never sends. This realizes litespec/frontend/testing#use-network-mocks-for-component-tests.

**Example:** The handlers are `msw` handlers derived from the OpenAPI document and run in the browser worker and the Node server alike. The workspace keeps one mock-generation command that regenerates them.

### Prove the module mirror in a structure test

**Statement:** A web frontend calling the API MUST hold a Vitest test resolving modules to backend use cases and naming no refused folder.

**Rationale:** The module tree mirrors the backend's use cases by path, and a backend rename silently breaks that mirror. A Vitest structure test resolves each folder against the backend's Application tree and names any refused folder, so drift fails the build instead of stranding a specification. This realizes litespec/frontend/testing#prove-the-module-mirror-in-a-structure-test.

**Example:** The structure check resolves each folder name against the backend's Application tree.

```typescript
test("every module folder names a backend use case, and no folder is named for nothing", () => {
  expect(checkModuleStructure(appRoot, applicationRoot)).toEqual([]);
});
```

### Run browser checks through the Playwright CLI

**Statement:** A browser suite MUST run through the Playwright CLI, addressable per route and per file.

**Rationale:** The developer, the drill, and the integration job all share the command line, so a suite runnable per route and per file through the Playwright CLI is repeatable by the next investigator. A check that runs only inside an editor plugin or a proxy runner cannot be repeated anywhere else. This realizes litespec/frontend/testing#run-browser-checks-through-the-command-line.

**Example:** One route contract runs on its own line, against the stack already running.

```text
pnpm --filter @shop/webshop exec playwright test --project=routes --grep "cart keeps the route contract"
```

## Conventions

### Query by accessible behavior

**Default:** Scope a query to one floorplan through its `data-floorplan` attribute and address slot content by accessible role and name.

**Replacement:** A project departs from this default through an Exception record.

**Rationale:** Scoping a query to one floorplan through its `data-floorplan` attribute keeps the test on the page it meant when several render at once. Addressing slot content by accessible role and name proves what a user can actually find and operate. The attribute is structural rather than an identifier, so it scopes without breaking the accessible query. This realizes litespec/frontend/testing#query-by-accessible-behavior.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/frontend/web/testing#match-test-level-to-risk | guidance | Does each web test use Vitest for logic and Playwright for browser behavior? |
| litespec/frontend/web/testing#assert-each-declared-refusal-by-its-code | guidance | Does each web refusal assertion name its Result code in the page? |
| litespec/frontend/web/testing#keep-mocks-at-owned-boundaries | guidance | Does each web mock avoid the libraries its stack section names? |
| litespec/frontend/web/testing#use-network-mocks-for-component-tests | guidance | Does each web HTTP test run through msw handlers from the contract? |
| litespec/frontend/web/testing#prove-the-module-mirror-in-a-structure-test | guidance | Does the Vitest structure test resolve modules and name no refused folder? |
| litespec/frontend/web/testing#run-browser-checks-through-the-playwright-cli | guidance | Does each browser check run through the Playwright CLI per route and per file? |
| litespec/frontend/web/testing#query-by-accessible-behavior | guidance | Does each web query scope by data-floorplan and accessible names? |
