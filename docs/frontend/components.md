# Frontend Components

## Intent


Components should have one clear ownership level and expose accessible behavior without leaking application state across boundaries. Each frontend owns its component source so shadcn/ui updates and product-specific composition remain local.

The governance boundary limits agent-generated UI drift by making the approved primitive inventory, theme tokens, public imports, and automated checks the default choices. No library is assumed to prevent drift without these project-owned constraints.

## Agent Summary {#agent-summary}


- Components sit at the ownership level their reuse justifies. (standards/rule/frontend-components.use-the-component-ownership-levels)
- Props carry values and callbacks, not services or stores. (standards/rule/frontend-components.keep-props-narrow)
- Interactive UI supports keyboard, focus, labels, and announcements. (standards/rule/frontend-components.meet-accessibility-requirements)
- Variants use theme tokens through the variant helper. (standards/rule/frontend-components.use-declared-visual-variants)
- Data-aware components render every applicable state. (standards/rule/frontend-components.render-complete-states)
- Untrusted content never reaches raw HTML rendering. (standards/rule/frontend-components.protect-rich-content-boundaries)
- Content images use the framework image component. (standards/rule/frontend-components.use-the-framework-image-component-for-content-images)

## Standards


### Use the component ownership levels (standards/rule/frontend-components.use-the-component-ownership-levels)

**Requirement:** A component MUST sit at the ownership level its reuse justifies: primitive, shared, module feature, or route composition.

**Example:**

| Level | Location | Responsibility |
|:---|:---|:---|
| Route composition | `app/` | Select shell, data, metadata, and feature composition. |
| Use-case component | `features/{module}/{use-case}/` | Present and coordinate one documented use case. |
| Shared product component | `components/` | Present UI used by at least two modules. |
| UI primitive | `components/ui/` | Own shadcn/ui or project primitive source without business behavior. |

The example does not place business operations inside `components/ui/`.

### Keep props narrow (standards/rule/frontend-components.keep-props-narrow)

**Requirement:** A component MUST receive the values and callbacks it needs, not a service, API client, mutable store, or aggregate-shaped object.

**Rationale:** Props crossing a Server to Client boundary must also serialize, so a broad object fails at that boundary.

### Meet accessibility requirements (standards/rule/frontend-components.meet-accessibility-requirements)

**Requirement:** Interactive UI MUST support keyboard operation, visible focus, semantic elements, programmatic labels, and asynchronous status announcements.

**Rationale:** A clickable `div` loses all five at once, so a native element is the starting point.

The five are the ones a component can get wrong on its own. [WCAG 2.2](https://www.w3.org/TR/WCAG22/) adds nine criteria that a component cannot satisfy by itself, because each one is a property of a flow or a page:

| Criterion | Level | What the UI has to do |
|:---|:---|:---|
| 2.4.11 Focus Not Obscured (Minimum) | AA | Keep a focused control at least partly visible under a sticky header, bar, or panel. |
| 2.4.12 Focus Not Obscured (Enhanced) | AAA | Keep a focused control fully visible. |
| 2.4.13 Focus Appearance | AAA | Give the focus indicator the stated minimum area and contrast. |
| 2.5.7 Dragging Movements | AA | Offer a single-pointer alternative to every drag action. |
| 2.5.8 Target Size (Minimum) | AA | Give a pointer target at least 24 by 24 pixels, or the stated spacing. |
| 3.2.6 Consistent Help | A | Put a help mechanism in the same relative order on every page that has one. |
| 3.3.7 Redundant Entry | A | Do not ask again for information already given in the same process. |
| 3.3.8 Accessible Authentication (Minimum) | AA | Offer a sign-in path with no cognitive function test. |
| 3.3.9 Accessible Authentication (Enhanced) | AAA | Offer that path with no object recognition or personal content test either. |

The AA criteria bind a project targeting AA. The three AAA rows are listed so a project selecting them knows what it selected. The route suite checks keyboard reach and visible focus on every route. The tests of a route assert target size and status announcements, which is where the flow-level criteria are checked.

### Use declared visual variants (standards/rule/frontend-components.use-declared-visual-variants)

**Requirement:** A repeated component variant MUST use Tailwind theme tokens through `class-variance-authority` rather than repeated literal values.

**Rationale:** Repeated pixel values, colors, or long conditional class strings drift apart once more than one feature edits them.

### Render complete states (standards/rule/frontend-components.render-complete-states)

**Requirement:** A data or permission-aware component MUST render its loading, empty, error, forbidden, disabled, pending, and ready states.

**Rationale:** A mutation control also prevents duplicate submission and keeps an error recovery path usable.

These seven are the states a component has. `disabled` and `pending` describe a control and have no route equivalent. A route adds `not-found` under `standards/rule/frontend-rendering.represent-route-states`, because a missing target resolves at the route rather than inside a component. The two lists differ by design, and the frontend vocabulary `states` list holds the complete set a frontend declares.

### Protect rich content boundaries (standards/rule/frontend-components.protect-rich-content-boundaries)

**Requirement:** A component MUST NOT pass untrusted content to `dangerouslySetInnerHTML`.

**Rationale:** Stored rich content requires a project decision naming the sanitizer, allowed elements and attributes, link policy, and test cases.

### Use the framework image component for content images (standards/rule/frontend-components.use-the-framework-image-component-for-content-images)

**Requirement:** A content image MUST render through the Next.js image component when sizing, responsive delivery, or remote policy applies.

**Rationale:** An informative image carries meaningful alternative text and a decorative image carries empty alternative text.

## Conventions


### Name components for their role (standards/rule/frontend-components.name-components-for-their-role)

**Default:** Name a component for the role it plays, such as `CreateDraftForm` or `PostStatusBadge`.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A name such as `PostComponent` or `GenericModal` describes its file type rather than its job.

### Give card and section titles heading semantics (standards/rule/frontend-components.give-card-and-section-titles-heading-semantics)

**Default:** Render a visible card, panel, or section title as a heading element at its correct level.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Some primitive sources default a title to a non-heading element, which removes it from the document outline.

### Keep domain values typed until display (standards/rule/frontend-components.keep-domain-values-typed-until-display)

**Default:** Keep branded and generated identifier types until the presentation boundary converts them.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Dates, money, and status convert to display strings there with explicit locale behavior.

### Use `cn` for class composition (standards/rule/frontend-components.use-cn-for-class-composition)

**Default:** Compose class names through one `cn` function per frontend that combines `clsx` and `tailwind-merge`.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A second merging helper produces different conflict resolution for the same class pair.

### Keep error boundaries scoped (standards/rule/frontend-components.keep-error-boundaries-scoped)

**Default:** Use a route error boundary for route failure, and a feature boundary only where recovery keeps the page usable.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A feature boundary that cannot recover hides the failure while leaving the page broken.

## Reference example

This informative example demonstrates `standards/rule/frontend-components.use-the-component-ownership-levels` and `standards/rule/frontend-components.keep-props-narrow`.

`CreateDraftForm` owns form interaction for one use case. It composes `Button`, `Input`, and `FieldError` primitives, accepts a server action or narrow submission callback, and renders pending and validation states. The primitive `Button` does not know about posts.

## Verification


| ID | Method | Evidence |
|:---|:---|:---|
| standards/rule/frontend-components.use-the-component-ownership-levels | inspection | `ComponentPlacementTests` asserts each component path matches the ownership level its imports imply. |
| standards/rule/frontend-components.keep-props-narrow | inspection | `ComponentPropsTests` asserts no component prop type resolves a client, store, or service instance. |
| standards/rule/frontend-components.meet-accessibility-requirements | inspection | `AccessibilityTests` asserts keyboard operation, focus visibility, labels, and status announcements for each interactive component. |
| standards/rule/frontend-components.use-declared-visual-variants | inspection | `node standards/tools/validate-ui.mjs` rejects a literal value where a theme token exists. |
| standards/rule/frontend-components.render-complete-states | inspection | `ComponentStateTests` asserts each applicable state renders for a data-aware component. |
| standards/rule/frontend-components.protect-rich-content-boundaries | inspection | `node standards/tools/validate-ui.mjs` reports each `dangerouslySetInnerHTML` use for review against its decision. |
| standards/rule/frontend-components.use-the-framework-image-component-for-content-images | inspection | `ImageTests` asserts content images use the framework component and carry the correct alternative text. |
| standards/rule/frontend-components.name-components-for-their-role | inspection | Naming review compares each new component name against its rendered role. |
| standards/rule/frontend-components.give-card-and-section-titles-heading-semantics | inspection | `AccessibilityTests` asserts each visible section title renders a heading element. |
| standards/rule/frontend-components.keep-domain-values-typed-until-display | inspection | `ViewMappingTests` asserts conversion to display strings happens at the presentation boundary. |
| standards/rule/frontend-components.use-cn-for-class-composition | inspection | `node standards/tools/validate-ui.mjs` asserts one class-merge helper exists per frontend. |
| standards/rule/frontend-components.keep-error-boundaries-scoped | inspection | Error boundary review confirms each boundary has a recovery path that keeps its surroundings usable. |
