# Blazor Stack

## Intent

The Blazor stack is the technology binding for a product that has no server of its own: a .NET domain model, browser-local persistence, and a Blazor WebAssembly application compiled to static files. A team chooses it when the product runs entirely on the user's device, under the `client-only` shape, the deployment boundary with no server, declared in [Supported Scope](../../core/scope.md). This page states what the stack itself requires; exact framework and package versions live only in `litespec.manifest.json`.

## Standards

### Keep Blazor outside the UI contract

**Requirement:** A consumer selecting this stack MUST NOT apply the controlled UI contract.

**Rationale:** The controlled UI contract's route checks read TypeScript sources, so they cannot read a `.razor` component. Applying them to this stack would fail every check for lack of readable input. The Blazor pages state the styling, accessibility, and state rules that apply instead, so nothing is left ungoverned.

### Publish static WebAssembly output

**Requirement:** A consumer MUST publish a standalone Blazor WebAssembly application to static files.

**Rationale:** Standalone WebAssembly compiles to static files, which is what lets the product run with no server and offline. Blazor Server, interactive server rendering, and prerendering each reintroduce a server dependency, which removes offline operation and contradicts the `client-only` shape.


## Conventions

### Verify with the .NET toolchain

**Default:** Run client verification through `dotnet` rather than a Node package manager.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** The client has no Node build step, so `dotnet` builds and tests the whole application. A Node toolchain would add downloads and configuration for a step that does not exist. A consumer holding a separate content or asset workspace keeps the manifest-pinned Node and pnpm toolchain for that workspace only.

**Example:**

```bash
dotnet build apps/web/{ProjectName}.slnx --configuration Release
dotnet test apps/web/{ProjectName}.slnx --configuration Release --no-build
```

### Record a first-load budget

**Default:** Record the compressed transfer size of the framework payload as a Limit record in Operating Limits.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A WebAssembly client downloads a runtime before it renders anything, so first load is the slowest moment of the product. A recorded budget on compressed transfer size makes that wait a reviewed number instead of a surprise. Directory size does not describe the wait, because the visitor downloads compressed bytes over the network.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/frontend/blazor/stack#keep-blazor-outside-the-ui-contract | guidance | Does the consumer apply any UI contract page or route check? |
| litespec/frontend/blazor/stack#publish-static-webassembly-output | guidance | Does the published output hold no server assembly or server render mode? |
| litespec/frontend/blazor/stack#verify-with-the-net-toolchain | guidance | Does the CI client job run `dotnet build` and `dotnet test`? |
| litespec/frontend/blazor/stack#record-a-first-load-budget | guidance | Does Operating Limits record the budget the publish job enforces? |
