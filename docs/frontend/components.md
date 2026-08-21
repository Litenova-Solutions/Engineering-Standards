# Frontend Components

## Intent


Components should have one clear ownership level and expose accessible behavior without leaking application state across boundaries. Each frontend owns its component source so shadcn/ui updates and product-specific composition remain local.

The governance boundary limits agent-generated UI drift by making the approved primitive inventory,
theme tokens, public imports, and automated checks the default choices. No library is assumed to prevent
drift without these project-owned constraints.

## Agent Summary {#agent-summary}


- Components sit at the ownership level their reuse justifies. (FRONTEND.COMPONENTS.OWNERSHIP.001)
- Props carry values and callbacks, not services or stores. (FRONTEND.COMPONENTS.PROPS.001)
- Interactive UI supports keyboard, focus, labels, and announcements. (FRONTEND.COMPONENTS.ACCESSIBILITY.001)
- Variants use theme tokens through the variant helper. (FRONTEND.COMPONENTS.VARIANTS.001)
- Data-aware components render every applicable state. (FRONTEND.COMPONENTS.STATE.001)
- Untrusted content never reaches raw HTML rendering. (FRONTEND.COMPONENTS.CONTENT.001)
- Content images use the framework image component. (FRONTEND.COMPONENTS.IMAGE.001)

## Standards


### Use the component ownership levels (FRONTEND.COMPONENTS.OWNERSHIP.001)

**Requirement:** A component MUST sit at the ownership level its reuse justifies: primitive, shared, module feature, or route composition.

**Example:**

| Level | Location | Responsibility |
|:---|:---|:---|
| Route composition | `app/` | Select shell, data, metadata, and feature composition. |
| Use-case component | `features/{module}/{use-case}/` | Present and coordinate one documented use case. |
| Shared product component | `components/` | Present UI used by at least two modules. |
| UI primitive | `components/ui/` | Own shadcn/ui or project primitive source without business behavior. |

The example does not place business operations inside `components/ui/`.

### Keep props narrow (FRONTEND.COMPONENTS.PROPS.001)

**Requirement:** A component MUST receive the values and callbacks it needs, not a service, API client, mutable store, or aggregate-shaped object.

**Rationale:** Props crossing a Server to Client boundary must also serialize, so a broad object fails at that boundary.

### Meet accessibility requirements (FRONTEND.COMPONENTS.ACCESSIBILITY.001)

**Requirement:** Interactive UI MUST support keyboard operation, visible focus, semantic elements, programmatic labels, and asynchronous status announcements.

**Rationale:** A clickable `div` loses all five at once, so a native element is the starting point.

### Use declared visual variants (FRONTEND.COMPONENTS.VARIANTS.001)

**Requirement:** A repeated component variant MUST use Tailwind theme tokens through `class-variance-authority` rather than repeated literal values.

**Rationale:** Repeated pixel values, colors, or long conditional class strings drift apart once more than one feature edits them.

### Render complete states (FRONTEND.COMPONENTS.STATE.001)

**Requirement:** A data or permission-aware component MUST render its loading, empty, error, forbidden, disabled, pending, and ready states.

**Rationale:** A mutation control also prevents duplicate submission and keeps an error recovery path usable.

### Protect rich content boundaries (FRONTEND.COMPONENTS.CONTENT.001)

**Requirement:** A component MUST NOT pass untrusted content to `dangerouslySetInnerHTML`.

**Rationale:** Stored rich content requires a project decision naming the sanitizer, allowed elements and attributes, link policy, and test cases.

### Use the framework image component for content images (FRONTEND.COMPONENTS.IMAGE.001)

**Requirement:** A content image MUST render through the Next.js image component when sizing, responsive delivery, or remote policy applies.

**Rationale:** An informative image carries meaningful alternative text and a decorative image carries empty alternative text.

## Conventions


### Name components for their role (FRONTEND.COMPONENTS.CONVENTION.001)

**Default:** Name a component for the role it plays, such as `CreateDraftForm` or `PostStatusBadge`.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A name such as `PostComponent` or `GenericModal` describes its file type rather than its job.

### Give card and section titles heading semantics (FRONTEND.COMPONENTS.CONVENTION.002)

**Default:** Render a visible card, panel, or section title as a heading element at its correct level.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Some primitive sources default a title to a non-heading element, which removes it from the document outline.

### Keep domain values typed until display (FRONTEND.COMPONENTS.CONVENTION.003)

**Default:** Keep branded and generated identifier types until the presentation boundary converts them.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Dates, money, and status convert to display strings there with explicit locale behavior.

### Use `cn` for class composition (FRONTEND.COMPONENTS.CONVENTION.004)

**Default:** Compose class names through one `cn` function per frontend that combines `clsx` and `tailwind-merge`.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A second merging helper produces different conflict resolution for the same class pair.

### Keep error boundaries scoped (FRONTEND.COMPONENTS.CONVENTION.005)

**Default:** Use a route error boundary for route failure, and a feature boundary only where recovery keeps the page usable.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A feature boundary that cannot recover hides the failure while leaving the page broken.

## Reference example

This informative example demonstrates `FRONTEND.COMPONENTS.OWNERSHIP.001` and `FRONTEND.COMPONENTS.PROPS.001`.

`CreateDraftForm` owns form interaction for one use case. It composes `Button`, `Input`, and `FieldError` primitives, accepts a server action or narrow submission callback, and renders pending and validation states. The primitive `Button` does not know about posts.

## Verification


| ID | Method | Evidence |
|:---|:---|:---|
| FRONTEND.COMPONENTS.OWNERSHIP.001 | inspection | `ComponentPlacementTests` asserts each component path matches the ownership level its imports imply. |
| FRONTEND.COMPONENTS.PROPS.001 | inspection | `ComponentPropsTests` asserts no component prop type resolves a client, store, or service instance. |
| FRONTEND.COMPONENTS.ACCESSIBILITY.001 | inspection | `AccessibilityTests` asserts keyboard operation, focus visibility, labels, and status announcements for each interactive component. |
| FRONTEND.COMPONENTS.VARIANTS.001 | inspection | `node standards/tools/validate-ui.mjs` rejects a literal value where a theme token exists. |
| FRONTEND.COMPONENTS.STATE.001 | inspection | `ComponentStateTests` asserts each applicable state renders for a data-aware component. |
| FRONTEND.COMPONENTS.CONTENT.001 | inspection | `node standards/tools/validate-ui.mjs` reports each `dangerouslySetInnerHTML` use for review against its decision. |
| FRONTEND.COMPONENTS.IMAGE.001 | inspection | `ImageTests` asserts content images use the framework component and carry the correct alternative text. |
| FRONTEND.COMPONENTS.CONVENTION.001 | inspection | Naming review compares each new component name against its rendered role. |
| FRONTEND.COMPONENTS.CONVENTION.002 | inspection | `AccessibilityTests` asserts each visible section title renders a heading element. |
| FRONTEND.COMPONENTS.CONVENTION.003 | inspection | `ViewMappingTests` asserts conversion to display strings happens at the presentation boundary. |
| FRONTEND.COMPONENTS.CONVENTION.004 | inspection | `node standards/tools/validate-ui.mjs` asserts one class-merge helper exists per frontend. |
| FRONTEND.COMPONENTS.CONVENTION.005 | inspection | Error boundary review confirms each boundary has a recovery path that keeps its surroundings usable. |
