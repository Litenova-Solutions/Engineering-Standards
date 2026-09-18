# Blazor Components

## Intent

A client component renders what it is given and reports what the user did. Business rules stay in Domain and Application, browser access stays behind an interface, and each file holds one component.

## Agent Summary {#agent-summary}

- A component renders from parameters and raises events. (standards/rule/blazor-components.keep-components-presentational)
- Every parameter carries a concrete feature-owned type. (standards/rule/blazor-components.declare-every-parameter-type)
- A child reports upward through a callback. (standards/rule/blazor-components.raise-events-rather-than-mutating)
- A view model exposes no Domain or Application type. (standards/rule/blazor-components.own-the-layer-contract)
- Browser access runs through an Application interface. (standards/rule/blazor-components.resolve-browser-behavior-through-an-interface)
- One component per file, named for what it renders. (standards/rule/blazor-components.place-one-component-per-file)

## Standards

### Keep components presentational (standards/rule/blazor-components.keep-components-presentational)

**Requirement:** A component MUST NOT call a browser API, read persisted state directly, or contain a business rule.

**Rationale:** A rule deciding whether an action is allowed belongs in Domain or Application, where a test can reach it without rendering.

### Declare every parameter type (standards/rule/blazor-components.declare-every-parameter-type)

**Requirement:** A component parameter MUST declare a concrete type owned by its feature.

**Rationale:** A loosely typed bag of values hides the contract, and a Domain aggregate crossing into a component couples rendering to the core model.

### Raise events rather than mutating (standards/rule/blazor-components.raise-events-rather-than-mutating)

**Requirement:** A child component MUST report upward through `EventCallback` rather than mutate a parent-owned object.

**Rationale:** Writing to a shared store to signal a parent hides the relationship that the callback makes visible.

### Own the layer contract (standards/rule/blazor-components.own-the-layer-contract)

**Requirement:** A feature view model MUST expose no Domain aggregate, Domain closed set, or Application result record.

**Rationale:** Each layer mirrors the shape it needs, as the baseline layer ownership rule requires. Shared-kernel typed identifiers and value objects are the one sanctioned crossing.

This rule and `standards/rule/blazor-structure.keep-domain-free-of-browser-concerns` guard the same boundary from opposite sides. That rule keeps browser types out of Domain. This rule keeps Domain types out of the view. Neither implies the other, because a view model can name an aggregate without Domain naming a component.

### Resolve browser behavior through an interface (standards/rule/blazor-components.resolve-browser-behavior-through-an-interface)

**Requirement:** A component MUST resolve browser behavior through an Application-owned interface rather than inject the interop runtime.

**Rationale:** The component then renders in a test with no JavaScript host.

### Place one component per file (standards/rule/blazor-components.place-one-component-per-file)

**Requirement:** A `.razor` file MUST declare one routable or reusable component named for what it renders.

**Rationale:** Bundling components by kind hides each one. A component with more than trivial logic uses a code-behind partial class rather than a large inline block.

## Conventions

### Name for the boundary role (standards/rule/blazor-components.name-for-the-boundary-role)

**Default:** Give a feature component a role suffix such as `{UseCase}Form`, `{UseCase}Summary`, `{Concept}List`, or `{Concept}Card`.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A shared primitive is named for the primitive rather than the feature that first needed it.

### Apply one styling system (standards/rule/blazor-components.apply-one-styling-system)

**Default:** Use one styling system with tokens defined once.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A hard-coded color, spacing value, or font size duplicates a token that already exists.

### Keep accessibility in the component (standards/rule/blazor-components.keep-accessibility-in-the-component)

**Default:** Place focus management, keyboard interaction, labelling, and live-region announcements in the component that owns the interaction.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A page that composes the component cannot know which element should receive focus.

## Verification

| ID | Method | Evidence |
|:---|:---|:---|
| standards/rule/blazor-components.keep-components-presentational | test | `ClientArchitectureTests` asserts no component resolves storage, interop, or a Domain service. |
| standards/rule/blazor-components.declare-every-parameter-type | test | `ComponentContractTests` asserts each parameter declares a feature-owned concrete type. |
| standards/rule/blazor-components.raise-events-rather-than-mutating | test | `ComponentContractTests` asserts each child reports upward through a callback parameter. |
| standards/rule/blazor-components.own-the-layer-contract | test | `ClientArchitectureTests` asserts no view model exposes a Domain or Application type. |
| standards/rule/blazor-components.resolve-browser-behavior-through-an-interface | test | `ClientArchitectureTests` asserts no component injects the interop runtime directly. |
| standards/rule/blazor-components.place-one-component-per-file | test | `ComponentContractTests` asserts each component file declares one primary component. |
| standards/rule/blazor-components.name-for-the-boundary-role | inspection | Naming review compares each feature component against its rendered role. |
| standards/rule/blazor-components.apply-one-styling-system | inspection | Style review locates each color, spacing, and font value in the token set. |
| standards/rule/blazor-components.keep-accessibility-in-the-component | test | `ComponentAccessibilityTests` covers keyboard paths and announcements for each interactive component. |
