# Blazor Stack

## Intent

This stack serves a product that has no server of its own. It combines a .NET client-side domain model, browser-local persistence, and a Blazor WebAssembly application compiled to static output. A product running wholly in the browser cannot satisfy the server conventions, so this stack names its excluded pages and their replacements. A consumer selecting only this stack has no backend, declared under `standards/rule/core-scope.declare-a-consumer-that-has-no-backend`. Exact framework and package versions live only in standards.manifest.json.

## Agent Summary {#agent-summary}

The shared stack rules on the [Stacks](stacks.md) page apply to every stack.

- Blazor stays outside the controlled UI contract. (standards/rule/profile-blazor.keep-blazor-outside-the-ui-contract)
- Each excluded page is named with its reason. (standards/rule/profile-blazor.list-excluded-baselines)
- The client publishes as static WebAssembly with no server render mode. (standards/rule/profile-blazor.publish-static-webassembly-output)

## Standards

### Keep Blazor outside the UI contract (standards/rule/profile-blazor.keep-blazor-outside-the-ui-contract)

**Requirement:** A consumer selecting this stack MUST NOT apply the controlled UI contract.

**Rationale:** The contract's route checks read TypeScript, so they cannot read a Blazor component. The Blazor pages state the styling, accessibility, and state rules that apply instead.

### List excluded baselines (standards/rule/profile-blazor.list-excluded-baselines)

**Requirement:** This stack MUST name each page another stack composes that this stack does not, with the reason.

**Rationale:** A consumer selecting only this stack inherits the exclusions and restates none of them. Silent omission remains a violation. A consumer that also selects the dotnet stack applies the union of both stacks' pages. Backend architecture, domain, and application stay composed, because a client application still has both layers.

Operations conventions apply in reduced form. Health endpoints, schema changes, backup, restore, and server-metric alerts have no target. Diagnostics, external-call bounds, and Operating Limits still apply.

Security conventions apply where the product has the surface they protect. Browser boundaries, input validation, personal data in browser storage, secure host headers, dependency pins, and supply-chain gates still apply. Cross-origin configuration, endpoint rate limits, deny-by-default endpoint policies, database rules, and server audit have no target.

CI conventions apply with the client jobs. Build, test, publish, dependency, inventory, and branch gates run on the client solution. Schema review and generated API contracts have no target.

**Example:** These pages do not apply to a client-only consumer, because each requires a server, a database, or an HTTP boundary.

| Excluded page | Reason |
|:---|:---|
| `backend/persistence.md` | No database. Replaced by browser persistence. |
| `backend/api.md` | No HTTP surface, actor claims, Problem Details, paging, or OpenAPI. |
| `backend/testing.md` | No API factory, container, or database reset. Replaced by Blazor testing. |
| `frontend/structure.md` | The TypeScript application tree and its backend module mirror. Replaced by Blazor structure. |
| `frontend/rendering.md` | File-based routes, loaders, and render modes. Replaced by Blazor rendering. |
| `frontend/components.md` | The shared TypeScript UI package and its composites. Replaced by Blazor components. |
| `frontend/ui.md` | The controlled UI contract, whose route checks read TypeScript. |
| `frontend/patterns.md` | Part of the controlled UI contract. Blazor patterns stay in the Blazor pages. |
| `frontend/data.md` | A generated client, a query cache, and API-owned sessions. Replaced by Blazor data and state. |
| `frontend/testing.md` | Vitest, the structure check, and Playwright. Replaced by Blazor testing. |
| `react/components.md` | React-only component rules. A Blazor product has no React frontend. |
| `svelte/components.md` | Svelte-only component rules. A Blazor product has no Svelte frontend. |

### Publish static WebAssembly output (standards/rule/profile-blazor.publish-static-webassembly-output)

**Requirement:** A consumer MUST publish a standalone Blazor WebAssembly application to static files.

**Rationale:** Blazor Server, interactive server rendering, and prerendering each remove offline operation and reintroduce a server, so all three are outside this stack.

## Composition

### Workspace

- [Workspace Structure](../workspace/structure.md)
- [Naming and Code Style](../workspace/naming.md)
- [Dependencies](../workspace/dependencies.md)
- [Configuration](../workspace/config.md)

### Core

- [Agent operating protocol](../core/agent.md)
- [Authoring Standard](../core/authoring.md)
- [Maintaining the Standards](../core/maintaining.md)
- [The Project Model](../core/model.md)
- [Engineering Principles](../core/principles.md)
- [Product Intent](../core/product.md)
- [Release Standard](../core/release.md)
- [Supported scope](../core/scope.md)
- [Agentic engineering system](../core/system.md)

### Stack

- [Blazor stack](blazor.md)

### Backend

- [Backend Architecture](../backend/architecture.md)
- [Domain Layer](../backend/domain.md)
- [Application Layer](../backend/application.md)
- [Record Identifiers](../backend/identifiers.md)

### Blazor

- [Blazor Structure](../blazor/structure.md)
- [Blazor Rendering and Routes](../blazor/rendering.md)
- [Blazor Components](../blazor/components.md)
- [Blazor Data and State](../blazor/data.md)
- [Browser Persistence](../blazor/browser.md)
- [Blazor Testing](../blazor/testing.md)

### Quality and operations

- [Security](../quality/security.md)
- [Operations](../quality/operations.md)
- [Continuous Integration](../quality/ci.md)

## Conventions

### Verify with the .NET toolchain (standards/rule/profile-blazor.verify-with-the-net-toolchain)

**Default:** Run client verification through `dotnet` rather than a Node package manager.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** The client application has no Node build step. A consumer holding a separate content or asset workspace keeps the manifest-pinned Node and pnpm toolchain for that workspace only.

**Example:**

```bash
dotnet build apps/web/{ProjectName}.slnx --configuration Release
dotnet test apps/web/{ProjectName}.slnx --configuration Release --no-build
```

### Record a first-load budget (standards/rule/profile-blazor.record-a-first-load-budget)

**Default:** Record the compressed transfer size of the framework payload as a Limit record in Operating Limits.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A WebAssembly client downloads a runtime before it renders anything. Directory size does not describe what a visitor waits for.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| standards/rule/profile-blazor.keep-blazor-outside-the-ui-contract | guidance | Does the consumer apply any UI contract page or route check? |
| standards/rule/profile-blazor.list-excluded-baselines | guidance | Does the table name every omitted page with its reason? |
| standards/rule/profile-blazor.publish-static-webassembly-output | guidance | Does the published output hold no server assembly or server render mode? |
| standards/rule/profile-blazor.verify-with-the-net-toolchain | guidance | Does the CI client job run `dotnet build` and `dotnet test`? |
| standards/rule/profile-blazor.record-a-first-load-budget | guidance | Does Operating Limits record the budget the publish job enforces? |
