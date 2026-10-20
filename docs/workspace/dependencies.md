# Dependencies

## Intent

Layer dependencies and package ownership make the application boundary visible to review. Each layer accepts only the dependencies its owning provisions allow, and each project rejects packages introduced without a current requirement.

## Agent Summary {#agent-summary}

- Dependencies follow the declared graph with no added edge. (litespec/workspace/dependencies#follow-the-declared-dependency-graph)
- Domain depends on no external package or framework. (litespec/workspace/dependencies#keep-domain-dependency-free)
- Application depends only on abstractions and the declared read boundary. (litespec/workspace/dependencies#keep-application-free-of-provider-packages)
- Provider adapters live only in Infrastructure. (litespec/workspace/dependencies#keep-providers-in-infrastructure)
- Every version resolves through central management or the lockfile. (litespec/workspace/dependencies#pin-every-dependency-version-centrally)
- A package outside the manifest carries a decision with its use, cost, and removal condition. (litespec/workspace/dependencies#approve-new-packages-explicitly)
- Frontends stay isolated and take UI packages from the manifest baseline. (litespec/workspace/dependencies#keep-frontend-applications-isolated, litespec/workspace/dependencies#keep-the-approved-web-ui-dependency-boundary)
- Generated types stay dependency-free with a thin client. (litespec/workspace/dependencies#keep-generated-packages-dependency-light)
- Test packages stay inside test projects. (litespec/workspace/dependencies#keep-test-dependencies-in-test-projects)
- Each baseline package sits in its owning layer. (litespec/workspace/dependencies#assign-each-baseline-package-to-its-owning-layer)

## Standards

### Follow the declared dependency graph

**Requirement:** A dependency between layers or modules MUST follow the declared graph and add no other edge.

**Rationale:** An undeclared edge lets a layer reach past its boundary, and review cannot refuse what no graph forbids.

### Keep Domain dependency-free

**Requirement:** The Domain layer MUST depend on no external package or framework.

**Rationale:** Persistence, messaging, web, injection, serialization, and logging libraries all stay outside.

### Keep Application free of provider packages

**Requirement:** Application MUST depend only on messaging abstractions, required read abstractions, and the one declared read boundary.

**Rationale:** A provider package in Application makes the coordination layer depend on the technology Infrastructure was meant to hide. The Requirement names the one read boundary this allows.

### Keep providers in Infrastructure

**Requirement:** A database provider, external SDK, resilience, discovery, or serialization adapter MUST live in Infrastructure.

**Rationale:** Infrastructure is the only layer that a provider change may reach, except the read boundary the ownership table assigns to Application.

### Pin every dependency version centrally

**Requirement:** Every dependency version MUST resolve through central management or the committed lockfile, at the pin `litespec.manifest.json` states where it states one.

**Rationale:** An inline version in one module file is invisible to the manifest that is supposed to own it. The manifest pins the baseline stack, which is the set these standards name. A consumer also carries packages for its own product, and it cannot add those to a manifest it does not own. Those versions live in the consumer's own central file or its lockfile, and `litespec/workspace/dependencies#approve-new-packages-explicitly` is what admits them.

**Example:** A consumer generating invoices pins its PDF library in its central version file with a decision record. The manifest never names it, and the pin is still central.

### Approve new packages explicitly

**Requirement:** A package absent from the manifest MUST have a decision naming its use case, alternatives, owning layer, operating cost, and removal condition.

**Rationale:** A package arrives with a cost nobody revisits, so the decision names the removal condition while the alternatives are still fresh. A baseline package lands in the manifest in the same change as its decision. A consumer-owned package lands in the consumer's central file instead, because the manifest belongs to the LiteSpec release rather than to the consumer.

### Keep frontend applications isolated

**Requirement:** A frontend MUST NOT import another application's source or another module's internal feature files.

**Rationale:** A shared package exposes a documented public entry point and depends on no application.

### Keep the approved web UI dependency boundary

**Requirement:** A React web frontend MUST take its UI packages from the `uiBaseline` in `litespec.manifest.json`, and a Svelte web frontend from `uiBaselineSvelte`.

**Rationale:** Each baseline pins its design system, styling, base components, icons, and the utility packages the installed source imports directly.

## Conventions

### Keep generated packages dependency-light

**Default:** Keep generated API types free of dependencies and limit the shared client to the pinned generator's runtime, its query plugin, and those types.

**Replacement:** A consumer departs from this default only through an Exception record naming this provision, with a reason and a review date.

**Rationale:** A generated package that owns state, UI behavior, or authentication policy stops being regenerable.

### Keep test dependencies in test projects

**Default:** Keep assertion, substitution, host, container, and architecture-test packages inside test projects.

**Replacement:** A consumer departs from this default only through an Exception record naming this provision, with a reason and a review date.

**Rationale:** A test package referenced by a production project ships to production.

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

The example adds a package to the narrowest owning layer. A central version entry does not authorize every layer to reference that package. A consumer references conditional packages only after their extension activates.

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
| litespec/workspace/dependencies#keep-the-approved-web-ui-dependency-boundary | guidance | Does each React frontend take UI packages from uiBaseline and each Svelte one from uiBaselineSvelte? |
| litespec/workspace/dependencies#keep-generated-packages-dependency-light | guidance | Does the generated types package stay dependency-free with a thin client? |
| litespec/workspace/dependencies#keep-test-dependencies-in-test-projects | guidance | Do production projects reference no test package? |
| litespec/workspace/dependencies#assign-each-baseline-package-to-its-owning-layer | guidance | Does each baseline package sit in the layer the ownership table assigns? |
