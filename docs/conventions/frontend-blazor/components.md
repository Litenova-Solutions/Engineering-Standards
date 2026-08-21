# Client Components

## Intent

A client component renders what it is given and reports what the user did. Business rules stay in Domain and Application, browser access stays behind an interface, and each file holds one component.

## Agent Summary {#agent-summary}

- A component renders from parameters and raises events. (BLAZOR.COMPONENTS.PRESENTATION.001)
- Every parameter carries a concrete feature-owned type. (BLAZOR.COMPONENTS.PARAMETERS.001)
- A child reports upward through a callback. (BLAZOR.COMPONENTS.EVENTS.001)
- A view model exposes no Domain or Application type. (BLAZOR.COMPONENTS.VIEWMODELS.001)
- Browser access runs through an Application interface. (BLAZOR.COMPONENTS.INTEROP.001)
- One component per file, named for what it renders. (BLAZOR.COMPONENTS.FILES.001)

## Standards

### Keep components presentational (BLAZOR.COMPONENTS.PRESENTATION.001)

**Requirement:** A component MUST NOT call a browser API, read persisted state directly, or contain a business rule.

**Rationale:** A rule deciding whether an action is allowed belongs in Domain or Application, where a test can reach it without rendering.

### Declare every parameter type (BLAZOR.COMPONENTS.PARAMETERS.001)

**Requirement:** A component parameter MUST declare a concrete type owned by its feature.

**Rationale:** A loosely typed bag of values hides the contract, and a Domain aggregate crossing into a component couples rendering to the core model.

### Raise events rather than mutating (BLAZOR.COMPONENTS.EVENTS.001)

**Requirement:** A child component MUST report upward through `EventCallback` rather than mutate a parent-owned object.

**Rationale:** Writing to a shared store to signal a parent hides the relationship that the callback makes visible.

### Own the layer contract (BLAZOR.COMPONENTS.VIEWMODELS.001)

**Requirement:** A feature view model MUST expose no Domain aggregate, Domain closed set, or Application result record.

**Rationale:** Each layer mirrors the shape it needs, as the baseline layer ownership rule requires. Shared-kernel typed identifiers and value objects are the one sanctioned crossing.

### Resolve browser behavior through an interface (BLAZOR.COMPONENTS.INTEROP.001)

**Requirement:** A component MUST resolve browser behavior through an Application-owned interface rather than inject the interop runtime.

**Rationale:** The component then renders in a test with no JavaScript host.

### Place one component per file (BLAZOR.COMPONENTS.FILES.001)

**Requirement:** A `.razor` file MUST declare one routable or reusable component named for what it renders.

**Rationale:** Bundling components by kind hides each one. A component with more than trivial logic uses a code-behind partial class rather than a large inline block.

## Conventions

### Name for the boundary role (BLAZOR.COMPONENTS.CONVENTION.001)

**Default:** Give a feature component a role suffix such as `{UseCase}Form`, `{UseCase}Summary`, `{Concept}List`, or `{Concept}Card`.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A shared primitive is named for the primitive rather than the feature that first needed it.

### Apply one styling system (BLAZOR.COMPONENTS.CONVENTION.002)

**Default:** Use one styling system with tokens defined once.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A hard-coded color, spacing value, or font size duplicates a token that already exists.

### Keep accessibility in the component (BLAZOR.COMPONENTS.CONVENTION.003)

**Default:** Place focus management, keyboard interaction, labelling, and live-region announcements in the component that owns the interaction.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A page that composes the component cannot know which element should receive focus.

## Verification

| ID | Method | Evidence |
|:---|:---|:---|
| BLAZOR.COMPONENTS.PRESENTATION.001 | test | `ClientArchitectureTests` asserts no component resolves storage, interop, or a Domain service. |
| BLAZOR.COMPONENTS.PARAMETERS.001 | test | `ComponentContractTests` asserts each parameter declares a feature-owned concrete type. |
| BLAZOR.COMPONENTS.EVENTS.001 | test | `ComponentContractTests` asserts each child reports upward through a callback parameter. |
| BLAZOR.COMPONENTS.VIEWMODELS.001 | test | `ClientArchitectureTests` asserts no view model exposes a Domain or Application type. |
| BLAZOR.COMPONENTS.INTEROP.001 | test | `ClientArchitectureTests` asserts no component injects the interop runtime directly. |
| BLAZOR.COMPONENTS.FILES.001 | test | `ComponentContractTests` asserts each component file declares one primary component. |
| BLAZOR.COMPONENTS.CONVENTION.001 | inspection | Naming review compares each feature component against its rendered role. |
| BLAZOR.COMPONENTS.CONVENTION.002 | inspection | Style review locates each color, spacing, and font value in the token set. |
| BLAZOR.COMPONENTS.CONVENTION.003 | test | `ComponentAccessibilityTests` covers keyboard paths and announcements for each interactive component. |
