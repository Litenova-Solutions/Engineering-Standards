# Components and UI

## Intent


Components should have one clear ownership level and expose accessible behavior without leaking application state across boundaries. Each frontend owns its component source so shadcn/ui updates and product-specific composition remain local.

The governance boundary limits agent-generated UI drift by making the approved primitive inventory,
theme tokens, public imports, and automated checks the default choices. No library is assumed to prevent
drift without these project-owned constraints.

## Agent Summary {#agent-summary}


- Use the component ownership levels. (UI.OWNERSHIP.001)
- Keep props narrow. (UI.PROPS.001)
- Meet accessibility requirements. (UI.ACCESSIBILITY.001)
- Use declared visual variants. (UI.VARIANTS.001)
- Render complete states. (UI.STATES.001)
- Protect rich content boundaries. (UI.CONTENT.001)
- Use the framework image component for content images. (UI.IMAGE.001)

## Standards


### Use the component ownership levels (UI.OWNERSHIP.001)

**Requirement:** Frontends MUST use the component ownership levels.

**Example:**

| Level | Location | Responsibility |
|:---|:---|:---|
| Route composition | `app/` | Select shell, data, metadata, and feature composition. |
| Use-case component | `features/{module}/{use-case}/` | Present and coordinate one documented use case. |
| Shared product component | `components/` | Present UI used by at least two modules. |
| UI primitive | `components/ui/` | Own shadcn/ui or project primitive source without business behavior. |

The example does not place business operations inside `components/ui/`.

### Keep props narrow (UI.PROPS.001)

**Requirement:** Frontends MUST keep props narrow.

**Rationale:** The implementation passes the values and callbacks a component needs rather than a broad service, complete API client, mutable store, or unrelated aggregate-shaped object.

Props crossing a Server Component to Client Component boundary are serializable.

### Meet accessibility requirements (UI.ACCESSIBILITY.001)

**Requirement:** Frontends MUST meet accessibility requirements.

**Rationale:** Interactive UI supports keyboard operation, visible focus, semantic elements, programmatic labels, associated validation messages, and appropriate announcements for asynchronous status.

The implementation does not use a clickable `div` when a button or link provides the required semantics.

### Use declared visual variants (UI.VARIANTS.001)

**Requirement:** Frontends MUST use declared visual variants.

**Rationale:** The implementation uses Tailwind theme tokens and `class-variance-authority` for repeated component variants. The implementation does not repeat unexplained pixel values, colors, or long conditional class strings across features.

### Render complete states (UI.STATES.001)

**Requirement:** Frontends MUST render complete states.

**Rationale:** Data and permission-aware components render every applicable state: loading, empty, error, forbidden, disabled, pending mutation, and ready.

Mutation controls prevent accidental duplicate submission and preserve a usable error recovery path.

### Protect rich content boundaries (UI.CONTENT.001)

**Requirement:** Frontends MUST protect rich content boundaries.

**Rationale:** The implementation does not use `dangerouslySetInnerHTML` for untrusted content. A product requirement for stored rich content names the sanitizer, allowed elements and attributes, link policy, and test cases in a project decision.

### Use the framework image component for content images (UI.IMAGE.001)

**Requirement:** Frontends MUST use the framework image component for content images.

**Rationale:** The implementation uses the Next.js image component when sizing, responsive delivery, or remote image policy applies. Informative images have meaningful alternative text, while decorative images have empty alternative text.

## Conventions


### Name components for their role (UI.COMPONENT.CONVENTION.001)

**Default:** Name components for their role.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** The implementation uses `CreateDraftForm`, `PostStatusBadge`, and `PostListEmptyState`. The implementation avoids `PostComponent`, `GenericModal`, or `CommonForm`.

### Give card and section titles heading semantics (UI.COMPONENT.CONVENTION.002)

**Default:** Give card and section titles heading semantics.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A visible card, panel, or section title carries a heading element at the correct level, not a styled `div`. Some primitive sources (for example a shadcn `CardTitle`) default to a non-heading element. Heading semantics let assistive technology and accessible-name queries reach the title (`UI.ACCESSIBILITY.001`). The implementation prefers a heading role over a test id when asserting a title in a test.

### Keep domain values typed until display (UI.COMPONENT.CONVENTION.003)

**Default:** Keep domain values typed until display.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Transport and view mappings may retain branded or generated ID types. Convert dates, money, and status to display strings at the presentation boundary with explicit locale behavior.

### Use `cn` for class composition (UI.COMPONENT.CONVENTION.004)

**Default:** Use `cn` for class composition.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Each frontend owns one `lib/utils.ts` `cn` function combining `clsx` and `tailwind-merge`. The implementation does not create multiple class-merging helpers.

### Keep error boundaries scoped (UI.COMPONENT.CONVENTION.005)

**Default:** Keep error boundaries scoped.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** The implementation uses a route error boundary for route failure. A feature uses an error boundary only when it can recover without discarding the surrounding page.

## Reference example

This informative example demonstrates `UI.OWNERSHIP.001` and `UI.PROPS.001`.

`CreateDraftForm` owns form interaction for one use case. It composes `Button`, `Input`, and `FieldError` primitives, accepts a server action or narrow submission callback, and renders pending and validation states. The primitive `Button` does not know about posts.

## Verification


| ID | Method | Evidence |
|:---|:---|:---|
| UI.OWNERSHIP.001 | inspection | Pull request review asserts `use the component ownership levels` in the owning specification and source paths. |
| UI.PROPS.001 | inspection | Pull request review asserts `keep props narrow` in the owning specification and source paths. |
| UI.ACCESSIBILITY.001 | inspection | Pull request review asserts `meet accessibility requirements` in the owning specification and source paths. |
| UI.VARIANTS.001 | inspection | Pull request review asserts `use declared visual variants` in the owning specification and source paths. |
| UI.STATES.001 | inspection | Pull request review asserts `render complete states` in the owning specification and source paths. |
| UI.CONTENT.001 | inspection | Pull request review asserts `protect rich content boundaries` in the owning specification and source paths. |
| UI.IMAGE.001 | inspection | Pull request review asserts `use the framework image component for content images` in the owning specification and source paths. |
| UI.COMPONENT.CONVENTION.001 | static | Repository static check asserts `name components for their role` for the owning paths. |
| UI.COMPONENT.CONVENTION.002 | inspection | Pull request review asserts `give card and section titles heading semantics` in the owning specification and source paths. |
| UI.COMPONENT.CONVENTION.003 | inspection | Pull request review asserts `keep domain values typed until display` in the owning specification and source paths. |
| UI.COMPONENT.CONVENTION.004 | inspection | Pull request review asserts `use `cn` for class composition` in the owning specification and source paths. |
| UI.COMPONENT.CONVENTION.005 | inspection | Pull request review asserts `keep error boundaries scoped` in the owning specification and source paths. |
