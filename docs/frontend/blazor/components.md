# Blazor Components

## Intent

A Blazor component renders the values its parent passes and reports what the user did through callbacks. This page states how components written for Blazor follow the component principles in [Frontend Components](../components.md): typed parameters, child-to-parent events, view models that mirror only the data they show, browser access behind interfaces, one component per file, and accessibility owned by the component. A team that applies it while writing components keeps business rules and browser calls out of rendering, where tests cannot reach them without a browser.

## Concepts

### Where a component sits

Each component belongs to one feature folder under `Features/{Module}/{UseCase}/`, and a page composes components from the features it shows. [Blazor structure](structure.md) states the folders and the import direction. This page states what a component itself may do: render values, report interaction, and own its accessibility.

## Standards

### Keep components presentational

**Statement:** A component MUST NOT call a browser API, read persisted state directly, or contain a business rule.

**Rationale:** A business rule inside a component runs only inside a rendered page, so no unit test reaches it and no second caller reuses it. A browser call inside a component ties every test of that component to a browser host. When components only show values and report interaction, rendering stays cheap and testable.

### Declare every parameter type

**Statement:** A component parameter MUST declare a concrete type owned by its feature.

**Rationale:** A typed parameter states the component's contract at its boundary, so a wrong call fails at compile time. A loosely typed bag of values hides that contract until the component runs. A Domain aggregate as a parameter couples rendering to the core model, so a domain change ripples into every view that names it. This realizes litespec/frontend/components#keep-component-inputs-narrow.

### Raise events rather than mutating

**Statement:** A child component MUST report upward through `EventCallback` rather than mutate a parent-owned object.

**Rationale:** A callback names the relationship between child and parent in the markup: the child reports, the parent decides. Mutating a parent-owned object or writing to a shared store hides that relationship, so a reader cannot tell which component changed the value or when.

### Own the layer contract

**Statement:** A feature view model MUST expose no Domain aggregate, Domain closed set, or Application result record.

**Rationale:** Each layer mirrors the shape it needs so a change in one layer does not ripple into the others, as `litespec/backend/architecture#own-each-layers-contract-types` requires. A view model that names a Domain aggregate or an Application result breaks that isolation: the view then compiles against the core model and breaks with it. Shared-kernel typed identifiers and value objects are the one sanctioned crossing.

This rule pairs with `litespec/frontend/blazor/structure#keep-domain-free-of-browser-concerns`: that rule stops Domain from naming browser types, and this rule stops the view from naming Domain types. Both are needed, because a view model can name an aggregate even when Domain names no component.

### Resolve browser behavior through an interface

**Statement:** A component MUST resolve browser behavior through an Application-owned interface rather than inject the interop runtime.

**Rationale:** A component that injects the interop runtime directly runs only where a JavaScript host exists, so its tests need a browser. Resolving browser behavior through an Application-owned interface lets a test substitute a double and assert what the component renders for each answer the browser could give.

### Place one component per file

**Statement:** A `.razor` file MUST declare one routable or reusable component named for what it renders.

**Rationale:** One component per file named for what it renders makes each component findable by name. A file holding several components hides all but the first from search and review. Logic beyond trivial rendering moves to a code-behind partial class, so the markup stays readable.

### Keep accessibility in the component

**Statement:** A component MUST own focus management, keyboard interaction, labeling, and live-region announcements for its interaction.

**Rationale:** Only the component knows which element should receive focus, which keys it answers, and what a screen reader should announce. A page composing the component cannot supply any of that. When the component owns focus, keyboard interaction, labeling, and announcements, every page that composes it is accessible without extra work. This realizes litespec/frontend/components#support-keyboard-focus-labels-and-announcements.

## Conventions

### Name for the boundary role

**Default:** Give a feature component a role suffix such as `{UseCase}Form`, `{UseCase}Summary`, `{Concept}List`, or `{Concept}Card`.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A role suffix tells a reader what the component renders before opening it: a form, a summary, a list, or a card. A shared primitive takes the primitive's name instead, because naming it for the first feature that needed it hides it from the second. This realizes litespec/frontend/components#name-components-for-their-role.

### Apply one styling system

**Default:** Use one styling system with tokens defined once.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** One styling system with tokens defined once makes a restyle a token edit rather than a search through components. A hard-coded color, spacing value, or font size duplicates a token, and the two drift apart on the next design change. This realizes litespec/frontend/components#use-declared-visual-variants.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/frontend/blazor/components#keep-components-presentational | guidance | Does any component resolve storage, interop, or a Domain service? |
| litespec/frontend/blazor/components#declare-every-parameter-type | guidance | Does each parameter declare a feature-owned concrete type? |
| litespec/frontend/blazor/components#raise-events-rather-than-mutating | guidance | Does each child report upward through a callback parameter? |
| litespec/frontend/blazor/components#own-the-layer-contract | guidance | Does any view model expose a Domain or Application type? |
| litespec/frontend/blazor/components#resolve-browser-behavior-through-an-interface | guidance | Does any component inject the interop runtime directly? |
| litespec/frontend/blazor/components#place-one-component-per-file | guidance | Does each component file declare one primary component? |
| litespec/frontend/blazor/components#keep-accessibility-in-the-component | guidance | Do keyboard paths and announcements work in each interactive component? |
| litespec/frontend/blazor/components#name-for-the-boundary-role | guidance | Does each feature component name match its rendered role? |
| litespec/frontend/blazor/components#apply-one-styling-system | guidance | Is each color, spacing, and font value a defined token? |
