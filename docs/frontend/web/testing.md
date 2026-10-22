# Web Testing

## Intent

Web frontends prove pure logic in Vitest beside the module it covers and navigation and integration in Playwright against the running system. This page states the runners, libraries, and commands one web frontend requires, following the testing principles in [Frontend Testing](../testing.md). A team that applies it while writing tests keeps fast tests fast and proves every address and every declared refusal, each named way a use case, one user task, says no, in a browser.

## Concepts

### Test Kinds

Each kind of test runs in one place on the web stacks:

| Kind | Where it runs |
|:---|:---|
| Logic | Vitest beside the module |
| Structure | Vitest beside the suite |
| Route contract | Playwright against a running stack |
| Evidence | Playwright against a running stack |

What each kind proves is stated on [Frontend Testing](../testing.md).

## Standards

### Match Test Level to Risk

**Statement:** A web frontend MUST use Vitest for pure logic, Playwright for navigation and integration, and the route contract for every address.

**Rationale:** Vitest runs beside the module with no browser, so pure logic stays fast and precise. Playwright runs against a running stack, so navigation and integration prove real browser behavior. The route contract visits every address, so no route ships unproved. Each level proves what only it can, and fast tests never pay for a browser. This realizes litespec/frontend/testing#match-test-level-to-risk.

### Assert Each Declared Refusal by Its Code

**Statement:** A web evidence specification for a use case declaring a refusal MUST reach that refusal and assert it by its Result's code.

**Rationale:** The refusal alert carries the Result's code in the rendered page, so the test names the exact refusal it provokes. Asserting by code ties the test to the specification's named outcome instead of to wording that rewording can change. A declared refusal no test reaches is a refusal nobody has seen render. This realizes litespec/frontend/testing#assert-each-declared-refusal-by-its-code.

**Example:** The refusal alert carries the code, so the assertion names it.

```typescript
await expect(refusalFor(page, "orders.not-found")).toBeVisible({ timeout: AFTER_ACTION });
```

### Keep Mocks at Owned Boundaries

**Statement:** A web test MUST NOT replace a library its stack page names.

**Rationale:** A mock replaces what the test owns: its own boundary's answers. Replacing a framework or library instead proves the mock's behavior rather than the product's, and hides the integration the test was meant to cover. Each stack page names the libraries its tests keep. This realizes litespec/frontend/testing#keep-mocks-at-owned-boundaries.

### Use Network Mocks for Component Tests

**Statement:** A web component or logic test that needs HTTP MUST serve its answers through network mocks generated from the published contract.

**Rationale:** A component or logic test that needs HTTP serves its answers through network mocks generated from the published contract, so the generated client stays in its production path and the test proves the real call shape. A mocked client would prove the mock: the component passes against answers the API never sends. This realizes litespec/frontend/testing#use-network-mocks-for-component-tests.

**Example:** The handlers are `msw` handlers derived from the OpenAPI document and run in the browser worker and the Node server alike. The workspace keeps one mock-generation command that regenerates them.

### Prove the Module Mirror in a Structure Test

**Statement:** A web frontend calling the API MUST hold a Vitest test resolving modules to backend use cases and naming no refused folder.

**Rationale:** The module tree mirrors the backend's use cases by path, and a backend rename silently breaks that mirror. A Vitest structure test resolves each folder against the backend's Application tree and names any refused folder, so drift fails the build instead of stranding a specification. This realizes litespec/frontend/testing#prove-the-module-mirror-in-a-structure-test.

**Example:** The structure check resolves each folder name against the backend's Application tree.

```typescript
test("every module folder names a backend use case, and no folder is named for nothing", () => {
  expect(checkModuleStructure(appRoot, applicationRoot)).toEqual([]);
});
```

### Run Browser Checks Through the Playwright CLI

**Statement:** A browser suite MUST run through the Playwright CLI, addressable per route and per file.

**Rationale:** The developer, the drill, and the integration job all share the command line, so a suite runnable per route and per file through the Playwright CLI is repeatable by the next investigator. A check that runs only inside an editor plugin or a proxy runner cannot be repeated anywhere else. This realizes litespec/frontend/testing#run-browser-checks-through-the-command-line.

**Example:** One route contract runs on its own line, against the stack already running.

```text
pnpm --filter @shop/webshop exec playwright test --project=routes --grep "cart keeps the route contract"
```

## Conventions

### Query by Accessible Behavior

**Default:** Scope a query to one floorplan through its `data-floorplan` attribute and address slot content by accessible role and name.

**Replacement:** A consumer can replace this default by naming its query-scoping convention in its test documentation.

**Rationale:** Scoping a query to one floorplan through its `data-floorplan` attribute keeps the test on the page it meant when several render at once. Addressing slot content by accessible role and name proves what a user can actually find and operate. The attribute is structural rather than an identifier, so it scopes without breaking the accessible query. This realizes litespec/frontend/testing#query-by-accessible-behavior.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/frontend/web/testing#match-test-level-to-risk | guidance | Each test uses Vitest beside its module for pure logic and Playwright against a running stack for navigation and integration, with the route contract visiting every address. |
| litespec/frontend/web/testing#assert-each-declared-refusal-by-its-code | guidance | Each evidence specification for a use case declaring a refusal reaches that refusal and asserts its result code in the page. |
| litespec/frontend/web/testing#keep-mocks-at-owned-boundaries | guidance | No test replaces a library its stack page names. |
| litespec/frontend/web/testing#use-network-mocks-for-component-tests | guidance | Each component or logic test needing HTTP serves answers through `msw` handlers generated from the published contract. |
| litespec/frontend/web/testing#prove-the-module-mirror-in-a-structure-test | guidance | The Vitest structure test resolves each module folder to a backend use case and names no refused folder. |
| litespec/frontend/web/testing#run-browser-checks-through-the-playwright-cli | guidance | Each browser suite runs through the Playwright CLI, addressable per route and per file. |
| litespec/frontend/web/testing#query-by-accessible-behavior | guidance | Each browser query scopes to one floorplan through `data-floorplan` and addresses slot content by accessible role and name. |
