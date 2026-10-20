# Blazor Components

## Intent

A client component renders what it is given and reports what the user did. Business rules stay in Domain and Application, browser access stays behind an interface, and each file holds one component.

## Agent Summary {#agent-summary}

- A component renders from parameters and raises events. (litespec/rule/blazor-components.keep-components-presentational)
- Every parameter carries a concrete feature-owned type. (litespec/rule/blazor-components.declare-every-parameter-type)
- A child reports upward through a callback. (litespec/rule/blazor-components.raise-events-rather-than-mutating)
- A view model exposes no Domain or Application type. (litespec/rule/blazor-components.own-the-layer-contract)
- Browser access runs through an Application interface. (litespec/rule/blazor-components.resolve-browser-behavior-through-an-interface)
- One component per file, named for what it renders. (litespec/rule/blazor-components.place-one-component-per-file)
- Focus, keyboard, labelling, and announcements live in the owning component. (litespec/rule/blazor-components.keep-accessibility-in-the-component)

## Standards

### Keep components presentational (litespec/rule/blazor-components.keep-components-presentational)

**Requirement:** A component MUST NOT call a browser API, read persisted state directly, or contain a business rule.

**Rationale:** A rule deciding whether an action is allowed belongs in Domain or Application, where a test can reach it without rendering.

### Declare every parameter type (litespec/rule/blazor-components.declare-every-parameter-type)

**Requirement:** A component parameter MUST declare a concrete type owned by its feature.

**Rationale:** A loosely typed bag of values hides the contract, and a Domain aggregate crossing into a component couples rendering to the core model.

### Raise events rather than mutating (litespec/rule/blazor-components.raise-events-rather-than-mutating)

**Requirement:** A child component MUST report upward through `EventCallback` rather than mutate a parent-owned object.

**Rationale:** Writing to a shared store to signal a parent hides the relationship that the callback makes visible.

### Own the layer contract (litespec/rule/blazor-components.own-the-layer-contract)

**Requirement:** A feature view model MUST expose no Domain aggregate, Domain closed set, or Application result record.

**Rationale:** Each layer mirrors the shape it needs, as `litespec/rule/backend-architecture.own-each-layers-contract-types` requires. Shared-kernel typed identifiers and value objects are the one sanctioned crossing.

This rule and `litespec/rule/blazor-structure.keep-domain-free-of-browser-concerns` guard the same boundary from opposite sides. That rule keeps browser types out of Domain. This rule keeps Domain types out of the view. Neither implies the other, because a view model can name an aggregate without Domain naming a component.

### Resolve browser behavior through an interface (litespec/rule/blazor-components.resolve-browser-behavior-through-an-interface)

**Requirement:** A component MUST resolve browser behavior through an Application-owned interface rather than inject the interop runtime.

**Rationale:** The component then renders in a test with no JavaScript host.

### Place one component per file (litespec/rule/blazor-components.place-one-component-per-file)

**Requirement:** A `.razor` file MUST declare one routable or reusable component named for what it renders.

**Rationale:** Bundling components by kind hides each one. A component with more than trivial logic uses a code-behind partial class rather than a large inline block.

### Keep accessibility in the component (litespec/rule/blazor-components.keep-accessibility-in-the-component)

**Requirement:** A component MUST own focus management, keyboard interaction, labelling, and live-region announcements for its interaction.

**Rationale:** A page that composes the component cannot know which element should receive focus.

## Conventions

### Name for the boundary role (litespec/rule/blazor-components.name-for-the-boundary-role)

**Default:** Give a feature component a role suffix such as `{UseCase}Form`, `{UseCase}Summary`, `{Concept}List`, or `{Concept}Card`.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A shared primitive is named for the primitive rather than the feature that first needed it.

### Apply one styling system (litespec/rule/blazor-components.apply-one-styling-system)

**Default:** Use one styling system with tokens defined once.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A hard-coded color, spacing value, or font size duplicates a token that already exists.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/rule/blazor-components.keep-components-presentational | guidance | Does any component resolve storage, interop, or a Domain service? |
| litespec/rule/blazor-components.declare-every-parameter-type | guidance | Does each parameter declare a feature-owned concrete type? |
| litespec/rule/blazor-components.raise-events-rather-than-mutating | guidance | Does each child report upward through a callback parameter? |
| litespec/rule/blazor-components.own-the-layer-contract | guidance | Does any view model expose a Domain or Application type? |
| litespec/rule/blazor-components.resolve-browser-behavior-through-an-interface | guidance | Does any component inject the interop runtime directly? |
| litespec/rule/blazor-components.place-one-component-per-file | guidance | Does each component file declare one primary component? |
| litespec/rule/blazor-components.keep-accessibility-in-the-component | guidance | Do keyboard paths and announcements work in each interactive component? |
| litespec/rule/blazor-components.name-for-the-boundary-role | guidance | Does each feature component name match its rendered role? |
| litespec/rule/blazor-components.apply-one-styling-system | guidance | Is each color, spacing, and font value a defined token? |
