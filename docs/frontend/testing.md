# Frontend Testing

## Intent

Frontend tests prove behavior at the cheapest level that represents the risk: unit tests for pure logic, browser suites against a running deployment for navigation and integration, and one route check for every address. This page states which kind proves what, how a test proves a use case by calling it and asserting the result each scenario names, and where mocks may stand. Frontend developers and agents apply it whenever they add or change a test, so each risk is proved once at the right level instead of slowly everywhere or nowhere at all.

## Concepts

### Test Kinds

Each kind runs against a frontend and answers one question. A scenario is one worked example leading from a situation to one named result, written in `given`, `when`, `then`. Both are record types the [model page](../core/model.md) defines.

| Kind | Where it runs | What it proves |
|:---|:---|:---|
| Logic | Unit runner beside the module | A mapping, a computed window, a state decision |
| Structure | Unit runner beside the suite | The module tree mirrors the backend |
| Route contract | Browser suite against a running stack | Every route renders one floorplan and passes the browser checks |
| Evidence | Browser suite against a running stack | A use case's scenarios, with each declared refusal provoked by name |

### Suites Bring No Deployment

A browser suite needs a deployment, and nothing in the suite starts one, so the same suite runs unchanged against a developer's stack and against a review deployment.

### Related Rules

Three related rules live on other pages:

- `litespec/core/release#run-frontend-release-checks` owns the gates a changed frontend runs.
- `litespec/frontend/structure#place-tests-at-their-ownership-boundary` owns the test layout.
- `litespec/frontend/ui#prove-ui-behavior-and-appearance` owns the evidence a UI change runs.

## Standards

### Match Test Level to Risk

**Statement:** A frontend MUST use a logic test for pure logic, a browser specification for navigation and integration, and the route contract for every address.

**Rationale:** A browser run costs seconds and a deployment; a unit test costs milliseconds and nothing else. Proving pure logic through the browser makes the suite slow without making it stronger, while proving navigation with unit tests proves nothing about the running page. Logic tests take pure logic, browser specifications take navigation and integration, and the route contract covers every address, so each risk is proved at the cheapest boundary that represents it.

### Prove a Scenario by Calling Its Use Case

**Statement:** A test MUST prove a scenario by calling its use case and asserting its result, submitting a money-moving use case rather than only reading it.

**Rationale:** A test proves a scenario when its steps call the use case and assert its result: the model builder computes proof from the test body, so proof follows exercised behavior rather than a claim. A title tag claims proof without exercising anything. A money-moving use case that a test only reads leaves completion unshown, so the test submits it.

**Example:** An evidence specification for placing an order submits the order and asserts the confirmation the success result promises.

### Assert Each Declared Refusal by Its Code

**Statement:** An evidence specification for a use case declaring a refusal MUST reach that refusal and assert it by its result's code.

**Rationale:** A refusal the test leaves unreached renders where no reader looks: it appears in a log, or nowhere at all. Reaching it and asserting it by its result's code proves two things at once: the page renders the refusal, and the code the page shows is the code the result declares. The scenario records the situation that reaches it, so the test documents how the refusal is provoked.

**Example:** The refusal alert carries the code, so the assertion names it.

### Test Observable States

**Statement:** A frontend test MUST assert observable behavior in each state applicable to what the test covers: loading, empty, error, forbidden, not-found, pending, validation, and success.

**Rationale:** An assertion on internal state passes while the rendered page stays broken, because nothing ties the variable to what the reader sees. Asserting observable behavior in each state the test's situation reaches, from loading and empty through error, forbidden, not-found, pending, validation, and success, ties the test to the reader's view. The scenario states which states its situation reaches, so a logic test asserts only states its level reaches. The project records each state as a term with labels per language.

### Keep Mocks at Owned Boundaries

**Statement:** A frontend test MUST NOT mock the generated contract types or an implementation-private function, nor a library its stack names.

**Rationale:** A mock is a claim about code the test no longer exercises. Mocking the generated contract types, an implementation-private function, or a library the stack names replaces the project's own contract or someone else's internals with the test author's guess of how they behave. The generated client boundary stays replaceable because it is an owned contract: the project wrote it, so the project can stand in for it.

### Use Network Mocks for Component Tests

**Statement:** A component or logic test that needs HTTP MUST serve its answers through network mocks generated from the published contract.

**Rationale:** A mocked client replaces the generated code with a guess of what it returns, so the test proves the mock rather than the component. A network mock generated from the published contract answers the same HTTP request the browser would send, so the generated client stays in the path it takes in production and the component is tested through the client the page actually uses.

**Example:** The workspace keeps one mock-generation command that regenerates them.

### Isolate Browser Tests

**Statement:** A browser test MUST create or identify its own data, its own authentication context, and its own expected state.

**Rationale:** A test that depends on execution order or on leftover data fails for reasons unrelated to the change under review, and passes only when the suite runs in one order. Creating its own data, its own authentication context, and its own expected state makes each test runnable alone and in any order. A test spends no seeded record; it creates the record it needs.

### Prove the Module Mirror in a Structure Test

**Statement:** A frontend calling the API MUST hold a test asserting that its module tree resolves to the backend use-case folders and names no refused folder.

**Rationale:** The module mirror is the claim that makes a specification findable from a folder path: translate three names, land on the code. Without a check, the backend adds or renames a use case and the frontend tree silently stops matching, so the translation lands nowhere. A test asserting the mirror on every build, and naming no refused folder, keeps the translation true.

**Example:** The structure check resolves each folder name against the backend's module tree.

### Run Browser Checks Through the Command Line

**Statement:** A browser suite MUST run through the command line, addressable per route and per file.

**Rationale:** The command line is the interface every runner shares: the developer, the drill, and the integration job all invoke the same command. A check that runs only inside an editor plugin or a proxy runner leaves the next investigator with no way to repeat it. Addressable per route and per file, the suite also runs just the check under review instead of the whole suite.

## Conventions

### Query by Accessible Behavior

**Default:** Query elements by role, label, name, or visible text before reaching for a test identifier.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A query by role, label, name, or visible text fails when the user-facing behavior breaks, which is exactly the behavior worth protecting. A test identifier survives an accessibility regression in silence, so it is the last resort rather than the first. A structural floorplan marker is not an identifier, so a query can use it to scope to one floorplan; slot content is addressed by its accessible role and name.

### Keep Test Support Narrow

**Default:** Limit test support to render helpers for required providers, to one API helper that every specification shares, and to the locator helpers.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Test support that grows into render frameworks, data builders, and custom runners becomes a second application with its own untested surface. Limiting it to render helpers for required providers, one shared API helper, and locator helpers keeps it small: a change to the actor header or the idempotency key reaches the fixtures rather than every specification.

### Read the Deployment for Its Identifiers

**Default:** Read a record identifier a browser test needs from the running deployment, and fall back to an absent identifier when the deployment holds none.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A hard-coded record identifier passes against the deployment it was copied from and fails against the next, where that record does not exist. Reading the identifier from the running deployment keeps the test true wherever it runs. Falling back to an absent identifier still visits the route as a not-found page, which is a state a reader can reach anyway.

## Reference Example

This informative example demonstrates `litespec/frontend/testing#match-test-level-to-risk`, `litespec/frontend/testing#assert-each-declared-refusal-by-its-code`, and `litespec/frontend/testing#isolate-browser-tests`.

A withdrawal window is a pure function, so it takes a logic test beside it. A reader reaches a redelivery dialog only through a record, so it takes an evidence specification. That specification creates the order it needs and asserts the refusal by its code.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/frontend/testing#match-test-level-to-risk | guidance | Pure logic takes logic tests, navigation and integration take browser specifications, and every address takes the route contract. Look in the test files beside the modules and under the tests roots. |
| litespec/frontend/testing#prove-a-scenario-by-calling-its-use-case | guidance | Test steps call the use case and assert its result, submitting money-moving use cases. Look in the evidence specifications. |
| litespec/frontend/testing#assert-each-declared-refusal-by-its-code | guidance | Evidence specifications reach each declared refusal and assert it by its result code. Look in the evidence specifications. |
| litespec/frontend/testing#test-observable-states | guidance | Tests assert observable behavior in the states their situation reaches. Look in the test assertions. |
| litespec/frontend/testing#keep-mocks-at-owned-boundaries | guidance | Mocks stand only at owned boundaries, with generated contract types, private functions, and stack-named libraries unmocked. Look in the test doubles. |
| litespec/frontend/testing#use-network-mocks-for-component-tests | guidance | Component and logic tests needing HTTP answer through contract-generated network mocks with the generated client in the path. Look in the component tests and the mock generation. |
| litespec/frontend/testing#isolate-browser-tests | guidance | Browser tests create their own data, authentication context, and expected state, runnable alone in any order. Look in the browser specifications. |
| litespec/frontend/testing#prove-the-module-mirror-in-a-structure-test | guidance | The structure test resolves the module tree to backend use-case folders and names no refused folder. Look in the structure test. |
| litespec/frontend/testing#run-browser-checks-through-the-command-line | guidance | Browser suites run through the command line per route and per file. Look in the suite runner and the CI invocation. |
| litespec/frontend/testing#query-by-accessible-behavior | guidance | Element queries use role, label, name, or visible text before test identifiers. Look in the test locators. |
| litespec/frontend/testing#keep-test-support-narrow | guidance | Test support holds render helpers, one shared API helper, and locator helpers only. Look in the test support files. |
| litespec/frontend/testing#read-the-deployment-for-its-identifiers | guidance | Record identifiers come from the running deployment, falling back to an absent identifier. Look in the browser specifications. |
