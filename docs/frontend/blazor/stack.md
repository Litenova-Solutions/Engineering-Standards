# Blazor Stack

## Intent

The Blazor stack is the technology binding for a product that has no server of its own: a .NET domain model, browser-local persistence, and a Blazor WebAssembly application compiled to static files. A team chooses it when the product runs entirely on the user's device, under the `client-only` shape, the deployment boundary with no server, declared in [Supported Scope](../../core/scope.md). This page states what the stack itself requires; exact framework and package versions live only in `litespec.manifest.json`.

## Standards

### Keep Blazor Outside the UI Contract

**Statement:** A consumer selecting this stack MUST NOT apply the controlled UI contract.

**Rationale:** The controlled UI contract's route checks read TypeScript sources, so they cannot read a `.razor` component. Applying them to this stack would fail every check for lack of readable input. The Blazor pages state the styling, accessibility, and state rules that apply instead, so nothing is left ungoverned.

### Publish Static WebAssembly Output

**Statement:** A consumer MUST publish a standalone Blazor WebAssembly application to static files.

**Rationale:** Standalone WebAssembly compiles to static files, which is what lets the product run with no server and offline. Blazor Server, interactive server rendering, and prerendering each reintroduce a server dependency, which stops the product working offline and contradicts the `client-only` shape.


## Conventions

### Verify with the .NET Toolchain

**Default:** Run client verification through `dotnet` rather than a Node package manager.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** The client has no Node build step, so `dotnet` builds and tests the whole application. A Node toolchain would add downloads and configuration for a step that does not exist. A consumer holding a separate content or asset workspace keeps the manifest-pinned Node and pnpm toolchain for that workspace only.

**Example:**

```bash
dotnet build apps/web/{ProjectName}.slnx --configuration Release
dotnet test apps/web/{ProjectName}.slnx --configuration Release --no-build
```

### Record a First-Load Budget

**Default:** Record the compressed transfer size of the framework payload as a limit entry in `docs/operations/limits.md`.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A WebAssembly client downloads a runtime before it renders anything, so first load is the slowest moment of the product. A recorded budget on compressed transfer size makes that wait a reviewed number instead of a surprise. Directory size does not describe the wait, because the visitor downloads compressed bytes over the network.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/frontend/blazor/stack#keep-blazor-outside-the-ui-contract | guidance | The consumer's stack selection and CI jobs apply no UI contract page or route check. |
| litespec/frontend/blazor/stack#publish-static-webassembly-output | guidance | The published output holds static files with no server assembly or server render mode. |
| litespec/frontend/blazor/stack#verify-with-the-net-toolchain | guidance | The CI client job runs `dotnet build` and `dotnet test`. |
| litespec/frontend/blazor/stack#record-a-first-load-budget | guidance | A limit entry in `docs/operations/limits.md` records the compressed transfer size budget the publish job enforces. |
