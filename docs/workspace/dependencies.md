# Dependencies

## Intent

Dependencies are the packages a codebase takes on, and each one adds updates, advisories, and migration work. This page states which dependencies each layer, from Domain to the API host, may take, where each package version is pinned, and what a new package needs before it lands. It applies to anyone who adds a package, references another layer, or connects two frontends.

## Concepts

### Layers and Their Packages

The backend holds five architecture layers: Domain, Application.Abstractions, Application, Infrastructure, and WebApi. Each layer takes only the packages its provisions allow:

- Domain takes none.
- Application takes messaging and read abstractions, plus the one declared read boundary.
- Infrastructure takes providers and adapters.
- Delivery, the layer that hosts the API, takes host, authentication, and documentation packages.
- Test projects take test-only packages.

### Pins and the Manifest

Every version resolves in one owned place: `litespec.manifest.json` pins the baseline stack the standards name, the consumer's own central file or lockfile pins the product's own packages, and no version sits inline in a module file. A central entry still does not authorize every layer to reference the package: the ownership table in the conventions below decides who takes what.

### Approving a New Package

A package outside the manifest lands only with a written decision: the use case it serves, the alternatives weighed, the layer that owns it, what it costs to operate, and the condition that removes it. Writing the removal condition while the alternatives are still fresh keeps each package traceable to the requirement that admitted it.

## Standards

### Follow the Declared Dependency Graph

**Statement:** A dependency between layers or modules MUST follow the declared graph and add no other edge.

**Rationale:** The declared graph is the list of crossings review checks. An undeclared edge lets a layer reach past its boundary, and review finds no graph that forbids it. Each new edge then needs an explicit decision instead of arriving silently with an import.

### Keep Domain Dependency-Free

**Statement:** The Domain layer MUST depend on no external package or framework.

**Rationale:** Domain holds business rules, and business rules outlive frameworks. Depending on no external package or framework keeps the rules testable and portable on their own. Persistence, messaging, web, injection, serialization, and logging libraries all stay outside.

### Keep Application Free of Provider Packages

**Statement:** Application MUST depend only on messaging abstractions, required read abstractions, and the one declared read boundary.

**Rationale:** Application coordinates use cases through abstractions; Infrastructure hides the technology behind them. A provider package in Application makes the coordination layer depend on the technology Infrastructure was meant to hide, so a provider change reaches two layers. Only messaging abstractions, required read abstractions, and the one declared read boundary stay.

### Keep Providers in Infrastructure

**Statement:** A database provider, external SDK, resilience, discovery, or serialization adapter MUST live in Infrastructure.

**Rationale:** A database provider, an external SDK, and resilience, discovery, and serialization adapters all change with their technology. Keeping them in Infrastructure keeps each provider change inside one layer, apart from the read boundary the ownership table assigns to Application.

### Pin Every Dependency Version Centrally

**Statement:** Every dependency version MUST resolve through central management or the committed lockfile, at the pin `litespec.manifest.json` states where it states one.

**Rationale:** An inline version in one module file is invisible to the manifest that is supposed to own it, so two modules drift to two versions of the same package. Central management or the committed lockfile resolves every version in one owned place: the manifest pins the baseline stack the standards name, and the consumer's own central file or lockfile pins the product's own packages. The manifest belongs to the LiteSpec release rather than to the consumer, so a consumer's pins live beside its code, admitted by `litespec/workspace/dependencies#approve-new-packages-explicitly`.

**Example:** A consumer generating invoices pins its PDF library in its central version file with a decision record. The manifest names only the baseline stack, and the pin is still central.

### Approve New Packages Explicitly

**Statement:** A package absent from the manifest MUST have a decision naming its use case, alternatives, owning layer, operating cost, and removal condition.

**Rationale:** A package arrives with a cost nobody revisits: updates, advisories, license review, and migration work. The decision names the use case, the alternatives, the owning layer, the operating cost, and the removal condition while the alternatives are still fresh. A baseline package lands in the manifest in the same change as its decision. A consumer-owned package lands in the consumer's central file instead, because the manifest belongs to the LiteSpec release rather than to the consumer.

### Keep Frontend Applications Isolated

**Statement:** A frontend MUST NOT import another application's source or another module's internal feature files.

**Rationale:** When one frontend imports another's source, neither can change its internals without checking the other, so the two release as one. A frontend also stays out of another module's internal feature files for the same reason. Sharing goes through a shared package with a documented public entry point that depends on no application.

### Keep the Approved Web UI Dependency Boundary

**Statement:** A React web frontend MUST take its UI packages from the `uiBaseline` in `litespec.manifest.json`, and a Svelte web frontend from `uiBaselineSvelte`.

**Rationale:** A fixed UI baseline keeps every screen drawing from the same design system, styling, base components, icons, and utilities. Taking UI packages only from `uiBaseline` for React and `uiBaselineSvelte` for Svelte keeps that set reviewed and versioned in one place. Each baseline pins the design system, styling, base components, icons, and the utility packages the installed source imports directly.

## Conventions

### Keep Generated Packages Dependency-Light

**Default:** Keep generated API types free of dependencies and limit the shared client to the pinned generator's runtime, its query plugin, and those types.

**Replacement:** A project whose client needs more records its own client dependency set in the client package manifest.

**Rationale:** Generated types mirror the API contract, and the shared client only carries them to queries. Keeping the types free of dependencies and the client limited to the generator's runtime, its query plugin, and those types keeps regeneration a pure function of the contract. A generated package that owns state, UI behavior, or authentication policy stops being regenerable.

### Keep Test Dependencies in Test Projects

**Default:** Keep assertion, substitution, host, container, and architecture-test packages inside test projects.

**Replacement:** A project that ships a test helper records the helper and its reason in its project documentation.

**Rationale:** Assertion, substitution, host, container, and architecture-test packages exist to verify code, not to run it. Referenced by a production project, a test package ships to production with its own dependencies and advisories. Keeping them inside test projects keeps the shipped graph free of verification weight.

### Assign Each Baseline Package to Its Owning Layer

**Default:** Assign each baseline package to the owning layer named in the table in this section.

**Replacement:** A project that moves a baseline package records its own owning layer in the decision that admits the move.

**Example:**

| Layer | Direct package groups |
|:---|:---|
| Domain | None |
| Application | Required abstractions only, plus the declared read boundary |
| Infrastructure | Providers and adapters required by implemented ports |
| Delivery | Host, authentication, and documentation packages |
| Test code | Test-only packages |

A new package joins the narrowest layer that needs it. A central version entry does not authorize every layer to reference that package: the table decides who takes what. A consumer references conditional packages only after their extension activates.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/workspace/dependencies#follow-the-declared-dependency-graph | guidance | Each layer and module dependency follows the declared graph; read the project references under `apps/api/src` and the imports in `apps/`. |
| litespec/workspace/dependencies#keep-domain-dependency-free | guidance | The Domain project manifest references no external package or framework. |
| litespec/workspace/dependencies#keep-application-free-of-provider-packages | guidance | The Application project manifest references only messaging abstractions, read abstractions, and the declared read boundary. |
| litespec/workspace/dependencies#keep-providers-in-infrastructure | guidance | Database providers, external SDKs, and resilience, discovery, and serialization adapters appear only in the Infrastructure project manifest. |
| litespec/workspace/dependencies#pin-every-dependency-version-centrally | guidance | Every version resolves through central management or the committed lockfile at the manifest pin where one exists; no version sits inline in a module file. |
| litespec/workspace/dependencies#approve-new-packages-explicitly | guidance | Each package outside the manifest traces to a decision under `docs/intent/decisions/` naming its use case, alternatives, owning layer, operating cost, and removal condition. |
| litespec/workspace/dependencies#keep-frontend-applications-isolated | guidance | No import in one frontend names another application's source or another module's internal feature files. |
| litespec/workspace/dependencies#keep-the-approved-web-ui-dependency-boundary | guidance | Each React frontend manifest takes UI packages only from `uiBaseline`, and each Svelte one only from `uiBaselineSvelte`, in `litespec.manifest.json`. |
| litespec/workspace/dependencies#keep-generated-packages-dependency-light | guidance | The generated API types package carries no dependencies, and the shared client carries only the generator runtime, its query plugin, and those types; where replaced, the client package manifest names the project's own client dependency set. |
| litespec/workspace/dependencies#keep-test-dependencies-in-test-projects | guidance | No production project manifest references an assertion, substitution, host, container, or architecture-test package; where replaced, the project documentation names the shipped helper and its reason. |
| litespec/workspace/dependencies#assign-each-baseline-package-to-its-owning-layer | guidance | Each baseline package sits in the owning layer the table in this section assigns; where replaced, the admitting decision names the project's own owning layer. |
