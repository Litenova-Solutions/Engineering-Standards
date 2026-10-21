# Dependencies

## Intent

Dependencies are the packages a codebase takes on, and each one adds updates, advisories, and migration work. This page states which dependencies each layer, from Domain to the API host, may take, where each package version is pinned, and what a new package needs before it lands. It applies to anyone who adds a package, references another layer, or connects 2 frontends. Fixed ownership keeps each layer's boundary visible in review and every package traceable to the requirement that admitted it.

## Concepts

### Layers and their packages

The backend holds five architecture layers: Domain, Application.Abstractions, Application, Infrastructure, and WebApi. Each layer takes only the packages its provisions allow:

- Domain takes none.
- Application takes messaging and read abstractions, plus the one declared read boundary.
- Infrastructure takes providers and adapters.
- Delivery, the layer that hosts the API, takes host, authentication, and documentation packages.
- Test projects take test-only packages.

### Pins and the manifest

Every version resolves in one owned place: `litespec.manifest.json` pins the baseline stack the standards name, the consumer's own central file or lockfile pins the product's own packages, and no version sits inline in a module file. A central entry still does not authorize every layer to reference the package: the ownership table in the conventions below decides who takes what.

### Approving a new package

A package outside the manifest lands only with a written decision: the use case it serves, the alternatives weighed, the layer that owns it, what it costs to operate, and the condition that removes it. Writing the removal condition while the alternatives are still fresh keeps each package traceable to the requirement that admitted it.

## Standards

### Follow the declared dependency graph

**Requirement:** A dependency between layers or modules MUST follow the declared graph and add no other edge.

**Rationale:** The declared graph is the list of crossings review checks. An undeclared edge lets a layer reach past its boundary, and review cannot refuse what no graph forbids. Each new edge then needs an explicit decision instead of arriving silently with an import.

### Keep Domain dependency-free

**Requirement:** The Domain layer MUST depend on no external package or framework.

**Rationale:** Domain holds business rules, and business rules outlive frameworks. Depending on no external package or framework keeps the rules testable and portable on their own. Persistence, messaging, web, injection, serialization, and logging libraries all stay outside.

### Keep Application free of provider packages

**Requirement:** Application MUST depend only on messaging abstractions, required read abstractions, and the one declared read boundary.

**Rationale:** Application coordinates use cases through abstractions; Infrastructure hides the technology behind them. A provider package in Application makes the coordination layer depend on the technology Infrastructure was meant to hide, so a provider change reaches two layers. Only messaging abstractions, required read abstractions, and the one declared read boundary stay.

### Keep providers in Infrastructure

**Requirement:** A database provider, external SDK, resilience, discovery, or serialization adapter MUST live in Infrastructure.

**Rationale:** A database provider, an external SDK, and resilience, discovery, and serialization adapters all change with their technology. Keeping them in Infrastructure keeps each provider change inside one layer, apart from the read boundary the ownership table assigns to Application.

### Pin every dependency version centrally

**Requirement:** Every dependency version MUST resolve through central management or the committed lockfile, at the pin `litespec.manifest.json` states where it states one.

**Rationale:** An inline version in one module file is invisible to the manifest that is supposed to own it, so two modules drift to two versions of the same package. Central management or the committed lockfile resolves every version in one owned place: the manifest pins the baseline stack the standards name, and the consumer's own central file or lockfile pins the product's own packages. A consumer cannot add its packages to a manifest it does not own, so its pins live beside its code, and `litespec/workspace/dependencies#approve-new-packages-explicitly` is what admits them.

**Example:** A consumer generating invoices pins its PDF library in its central version file with a decision record. The manifest never names it, and the pin is still central.

### Approve new packages explicitly

**Requirement:** A package absent from the manifest MUST have a decision naming its use case, alternatives, owning layer, operating cost, and removal condition.

**Rationale:** A package arrives with a cost nobody revisits: updates, advisories, license review, and migration work. The decision names the use case, the alternatives, the owning layer, the operating cost, and the removal condition while the alternatives are still fresh. A baseline package lands in the manifest in the same change as its decision. A consumer-owned package lands in the consumer's central file instead, because the manifest belongs to the LiteSpec release rather than to the consumer.

### Keep frontend applications isolated

**Requirement:** A frontend MUST NOT import another application's source or another module's internal feature files.

**Rationale:** When one frontend imports another's source, neither can change its internals without checking the other, so the two release as one. A frontend also stays out of another module's internal feature files for the same reason. Sharing goes through a shared package with a documented public entry point that depends on no application.

### Keep the approved web UI dependency boundary

**Requirement:** A React web frontend MUST take its UI packages from the `uiBaseline` in `litespec.manifest.json`, and a Svelte web frontend from `uiBaselineSvelte`.

**Rationale:** A fixed UI baseline keeps every screen drawing from the same design system, styling, base components, icons, and utilities. Taking UI packages only from `uiBaseline` for React and `uiBaselineSvelte` for Svelte keeps that set reviewed and versioned in one place. Each baseline pins the design system, styling, base components, icons, and the utility packages the installed source imports directly.

## Conventions

### Keep generated packages dependency-light

**Default:** Keep generated API types free of dependencies and limit the shared client to the pinned generator's runtime, its query plugin, and those types.

**Replacement:** A consumer departs from this default only through an Exception record naming this provision, with a reason and a review date.

**Rationale:** Generated types mirror the API contract, and the shared client only carries them to queries. Keeping the types free of dependencies and the client limited to the generator's runtime, its query plugin, and those types keeps regeneration a pure function of the contract. A generated package that owns state, UI behavior, or authentication policy stops being regenerable.

### Keep test dependencies in test projects

**Default:** Keep assertion, substitution, host, container, and architecture-test packages inside test projects.

**Replacement:** A consumer departs from this default only through an Exception record naming this provision, with a reason and a review date.

**Rationale:** Assertion, substitution, host, container, and architecture-test packages exist to verify code, not to run it. Referenced by a production project, a test package ships to production with its own dependencies and advisories. Keeping them inside test projects keeps the shipped graph free of verification weight.

### Assign each baseline package to its owning layer

**Default:** Assign each baseline package to the owning layer named in the table in this section.

**Replacement:** A consumer departs from this default only through an Exception record naming this provision, with a reason and a review date.

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
| litespec/workspace/dependencies#follow-the-declared-dependency-graph | guidance | Does each layer or module dependency follow the declared graph with no added edge? |
| litespec/workspace/dependencies#keep-domain-dependency-free | guidance | Does Domain depend on no external package or framework? |
| litespec/workspace/dependencies#keep-application-free-of-provider-packages | guidance | Does Application depend only on abstractions and the declared read boundary? |
| litespec/workspace/dependencies#keep-providers-in-infrastructure | guidance | Does each provider adapter live in Infrastructure apart from the read boundary? |
| litespec/workspace/dependencies#pin-every-dependency-version-centrally | guidance | Does every version resolve through central management or the lockfile at the manifest or consumer pin? |
| litespec/workspace/dependencies#approve-new-packages-explicitly | guidance | Does each package outside the manifest carry a decision with use case, alternatives, layer, cost, and removal condition? |
| litespec/workspace/dependencies#keep-frontend-applications-isolated | guidance | Is each frontend free of imports from another application's source or internal feature files? |
| litespec/workspace/dependencies#keep-the-approved-web-ui-dependency-boundary | guidance | Does each React frontend take UI packages from `uiBaseline` and each Svelte one from `uiBaselineSvelte`? |
| litespec/workspace/dependencies#keep-generated-packages-dependency-light | guidance | Does the generated types package stay dependency-free with a thin client? |
| litespec/workspace/dependencies#keep-test-dependencies-in-test-projects | guidance | Do production projects reference no test package? |
| litespec/workspace/dependencies#assign-each-baseline-package-to-its-owning-layer | guidance | Does each baseline package sit in the layer the ownership table assigns? |
