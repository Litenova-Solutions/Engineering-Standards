# Frontend Testing

## Intent

Frontend tests prove behavior at the cheapest boundary that represents the risk. Each kind in the table below runs against a frontend, and each one answers one question.

| Kind | Where it runs | What it proves |
|:---|:---|:---|
| Logic | Unit runner beside the module | A mapping, a computed window, a state decision |
| Structure | Unit runner beside the suite | The module tree mirrors the backend |
| Route contract | Browser suite against a running stack | Every route renders one floorplan and passes the browser checks |
| Evidence | Browser suite against a running stack | A use case's Cases, with each declared refusal provoked by name |

A browser suite needs a deployment. Nothing in it starts one, so the same suite runs against a developer's stack and against a review deployment.

Related rules live on other pages. `litespec/core/release#run-frontend-release-checks` owns the gates a changed frontend runs. `litespec/frontend/structure#place-tests-at-their-ownership-boundary` owns test layout. `litespec/frontend/ui#prove-ui-behavior-and-appearance` owns the evidence a UI change runs.

## Agent Summary {#agent-summary}

- Test levels match risk, with logic, browser, and route coverage. (litespec/frontend/testing#match-test-level-to-risk)
- Each Case is proved by calling its use case, with refusals asserted by code. (litespec/frontend/testing#prove-a-case-by-calling-its-use-case, litespec/frontend/testing#assert-each-declared-refusal-by-its-code)
- Tests assert observable behavior in each applicable state. (litespec/frontend/testing#test-observable-states)
- Mocks stay at owned boundaries with network answers from the contract. (litespec/frontend/testing#keep-mocks-at-owned-boundaries, litespec/frontend/testing#use-network-mocks-for-component-tests)
- Browser tests isolate their data and run through the command line. (litespec/frontend/testing#isolate-browser-tests, litespec/frontend/testing#run-browser-checks-through-the-command-line)
- The module mirror is proved and every public use case is reached. (litespec/frontend/testing#prove-the-module-mirror-in-a-structure-test, litespec/frontend/testing#reach-every-public-use-case-from-a-journey)
- Queries use accessible behavior and support stays narrow. (litespec/frontend/testing#query-by-accessible-behavior, litespec/frontend/testing#keep-test-support-narrow)
- Identifiers come from the deployment under test. (litespec/frontend/testing#read-the-deployment-for-its-identifiers)

## Standards

### Match test level to risk

**Requirement:** A frontend MUST use a logic test for pure logic, a browser specification for navigation and integration, and the route contract for every address.

**Rationale:** Matching level to risk keeps the fast tests fast and reserves browser runs for behavior only a browser proves.

### Prove a case by calling its use case

**Requirement:** A test MUST prove a Case by calling its use case and asserting its Result, submitting a money-moving use case rather than only reading it.

**Rationale:** Steps that call the use case and assert the Result let the model builder compute proof from the test body. A title tag claims proof without exercising anything. A use case that moves money and is only read has never shown it can complete.

**Example:** An evidence specification for placing an order submits the order and asserts the confirmation the success Result promises.

### Assert each declared refusal by its code

**Requirement:** An evidence specification for a use case declaring a refusal MUST reach that refusal and assert it by its Result's code.

**Rationale:** A refusal that only appears in a log has never been seen rendered. Addressing it by code also proves the code the Result declares is the code the page shows. The Case records the situation that reaches it.

**Example:** The refusal alert carries the code, so the assertion names it.

### Test observable states

**Requirement:** A frontend test MUST assert observable behavior in each state applicable to what the test covers: loading, empty, error, forbidden, not-found, pending, validation, and success.

**Rationale:** An assertion on internal state passes while the rendered page stays broken. The Case states which of these its situation reaches, so a logic test asserts no route state it cannot reach. The project records each state as a Term with labels per language.

### Keep mocks at owned boundaries

**Requirement:** A frontend test MUST NOT mock the generated contract types or an implementation-private function, nor a library its stack names.

**Rationale:** A test may still replace the generated operation boundary, because that is an owned contract. Everything else it replaces becomes a claim about code the test no longer exercises.

### Use network mocks for component tests

**Requirement:** A component or logic test that needs HTTP MUST serve its answers through network mocks generated from the published contract.

**Rationale:** A mocked client proves the mock rather than the component. A network mock answers the same request the browser would send, so the generated client stays in the path it takes in production.

**Example:** The workspace keeps one mock-generation command that regenerates them.

### Isolate browser tests

**Requirement:** A browser test MUST create or identify its own data, its own authentication context, and its own expected state.

**Rationale:** A test depending on execution order or on leftover data fails for reasons unrelated to the change under review. A test spends no seeded record; it creates the record it needs.

### Prove the module mirror in a structure test

**Requirement:** A frontend calling the API MUST hold a test asserting that its module tree resolves to the backend use-case folders and names no refused folder.

**Rationale:** The mirror is the claim that makes a specification findable from a folder path. A check that runs on every build is what keeps it true after a backend use case is added or renamed.

**Example:** The structure check resolves each folder name against the backend's Application tree.

### Reach every public use case from a journey

**Requirement:** Every public use case MUST sit in a Journey or name its background caller.

**Rationale:** A public use case no Journey reaches and no background caller names has no stated path to it. The model builder reports each one, so the gap stays visible until a Journey or a caller claims it.

### Run browser checks through the command line

**Requirement:** A browser suite MUST run through the command line, addressable per route and per file.

**Rationale:** The command line is the interface every runner shares: the developer, the drill, and the integration job. A check that runs only inside an editor plugin or a proxy runner cannot be repeated by the next investigator.

## Conventions

### Query by accessible behavior

**Default:** Query elements by role, label, name, or visible text before reaching for a test identifier.

**Replacement:** A project departs from this default through an Exception record.

**Rationale:** A query by accessible name fails when the accessible name breaks, which is the behavior worth protecting. A structural floorplan marker is not an identifier, so a query may use it to scope to one floorplan. Slot content is addressed by its accessible role and name.

### Keep test support narrow

**Default:** Limit test support to render helpers for required providers, to one API helper that every specification shares, and to the locator helpers.

**Replacement:** A project departs from this default through an Exception record.

**Rationale:** Support code that grows into a second application framework becomes its own untested surface. One API helper means a change to the actor header or the idempotency key reaches the fixtures and not every specification.

### Read the deployment for its identifiers

**Default:** Read a record identifier a browser test needs from the running deployment, and fall back to an absent identifier when the deployment holds none.

**Replacement:** A project departs from this default through an Exception record.

**Rationale:** A hard-coded identifier passes against one deployment and fails against the next. A fallback keeps the route visited as a not-found page, which is the state a reader can reach anyway.

## Reference example

This informative example demonstrates `litespec/frontend/testing#match-test-level-to-risk`, `litespec/frontend/testing#assert-each-declared-refusal-by-its-code`, and `litespec/frontend/testing#isolate-browser-tests`.

A withdrawal window is a pure function, so it takes a logic test beside it. A redelivery dialog is reached only through a record, so it takes an evidence specification. That specification creates the order it needs and asserts the refusal by its code.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/frontend/testing#match-test-level-to-risk | guidance | Does each new test sit at the level its risk requires? |
| litespec/frontend/testing#prove-a-case-by-calling-its-use-case | guidance | Do the test's steps call the use case and assert the Result, submitting where money moves? |
| litespec/frontend/testing#assert-each-declared-refusal-by-its-code | guidance | Does the specification reach each declared refusal and assert it by its Result's code? |
| litespec/frontend/testing#test-observable-states | guidance | Does each test assert observable output in the states its situation reaches? |
| litespec/frontend/testing#keep-mocks-at-owned-boundaries | guidance | Is every mock at an owned boundary, replacing no library internal or private function? |
| litespec/frontend/testing#use-network-mocks-for-component-tests | guidance | Does each component test needing HTTP run through contract-generated network mocks? |
| litespec/frontend/testing#isolate-browser-tests | guidance | Does each browser test create its own data, context, and expected state? |
| litespec/frontend/testing#prove-the-module-mirror-in-a-structure-test | guidance | Does the structure test resolve every module folder to a backend use-case folder? |
| litespec/frontend/testing#reach-every-public-use-case-from-a-journey | guidance | Does every public use case sit in a Journey or name its background caller? |
| litespec/frontend/testing#run-browser-checks-through-the-command-line | guidance | Does each browser check run through the command line per route and per file? |
| litespec/frontend/testing#query-by-accessible-behavior | guidance | Does each identifier query lack a stable user-facing alternative? |
| litespec/frontend/testing#keep-test-support-narrow | guidance | Do the helpers stay limited to providers, one API helper, and locators? |
| litespec/frontend/testing#read-the-deployment-for-its-identifiers | guidance | Is each record identifier read from the deployment rather than written in a specification? |
