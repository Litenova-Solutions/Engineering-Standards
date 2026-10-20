# Blazor Stack

## Intent

This stack serves a product that has no server of its own. It combines a .NET client-side domain model, browser-local persistence, and a Blazor WebAssembly application compiled to static output. Such a product declares the `client-only` shape under `litespec/core/scope#declare-a-consumer-that-has-no-backend`, which names the backend pages that still apply. This page adds what Blazor itself requires. Exact framework and package versions live only in litespec.manifest.json.

## Standards

### Keep Blazor outside the UI contract

**Requirement:** A consumer selecting this stack MUST NOT apply the controlled UI contract.

**Rationale:** The contract's route checks read TypeScript, so they cannot read a Blazor component. The Blazor pages state the styling, accessibility, and state rules that apply instead.

### Publish static WebAssembly output

**Requirement:** A consumer MUST publish a standalone Blazor WebAssembly application to static files.

**Rationale:** Blazor Server, interactive server rendering, and prerendering each remove offline operation and reintroduce a server, so all three are outside this stack.


## Conventions

### Verify with the .NET toolchain

**Default:** Run client verification through `dotnet` rather than a Node package manager.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** The client application has no Node build step. A consumer holding a separate content or asset workspace keeps the manifest-pinned Node and pnpm toolchain for that workspace only.

**Example:**

```bash
dotnet build apps/web/{ProjectName}.slnx --configuration Release
dotnet test apps/web/{ProjectName}.slnx --configuration Release --no-build
```

### Record a first-load budget

**Default:** Record the compressed transfer size of the framework payload as a Limit record in Operating Limits.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A WebAssembly client downloads a runtime before it renders anything. Directory size does not describe what a visitor waits for.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/frontend/blazor/stack#keep-blazor-outside-the-ui-contract | guidance | Does the consumer apply any UI contract page or route check? |
| litespec/frontend/blazor/stack#publish-static-webassembly-output | guidance | Does the published output hold no server assembly or server render mode? |
| litespec/frontend/blazor/stack#verify-with-the-net-toolchain | guidance | Does the CI client job run `dotnet build` and `dotnet test`? |
| litespec/frontend/blazor/stack#record-a-first-load-budget | guidance | Does Operating Limits record the budget the publish job enforces? |
