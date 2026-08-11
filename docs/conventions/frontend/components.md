# Components and UI

## Intent

Components should have one clear ownership level and expose accessible behavior without leaking application state across boundaries. Each frontend owns its component source so shadcn/ui updates and product-specific composition remain local.

The governance boundary limits agent-generated UI drift by making the approved primitive inventory,
theme tokens, public imports, and automated checks the default choices. No library is assumed to prevent
drift without these project-owned constraints.

## Agent Summary {#agent-summary}

- Keep route composition in pages, use-case behavior in features, shared product UI in components, and primitives in `components/ui`.
- Keep component props narrow and serializable across server-client boundaries.
- Select and document one primary UI system per frontend surface, then reuse its approved public primitives before adding custom UI.
- Keep vendor imports behind the owning UI package or primitive boundary so agents and features use a fixed, reviewable component inventory.
- Treat shadcn/ui components as owned source.
- Use theme tokens and declared variants instead of repeated arbitrary values.
- Implement keyboard, focus, label, error, and semantic requirements with every interaction.
- Render explicit loading, empty, error, forbidden, and ready states.

## Standards

### Use the component ownership levels (UI.OWNERSHIP.001)

| Level | Location | Responsibility |
|:---|:---|:---|
| Route composition | `app/` | Select shell, data, metadata, and feature composition. |
| Use-case component | `features/{module}/{use-case}/` | Present and coordinate one documented use case. |
| Shared product component | `components/` | Present UI used by at least two modules. |
| UI primitive | `components/ui/` | Own shadcn/ui or project primitive source without business behavior. |

Do not place business operations inside `components/ui/`.

### Keep props narrow (UI.PROPS.001)

Pass the values and callbacks a component needs rather than a broad service, complete API client, mutable store, or unrelated aggregate-shaped object.

Props crossing a Server Component to Client Component boundary must be serializable.

### Apply controlled UI governance

The primary UI system, shadcn/ui baseline, source ownership, vocabulary, page grammar, Tailwind
restrictions, source-lock lifecycle, companion policy, and evidence requirements are defined in the
[controlled UI governance convention](ui-governance.md). Load it before creating or changing a
frontend control. This document retains the ownership, props, accessibility, variant, state, content,
and image rules that apply to every component regardless of the selected platform.

### Meet accessibility requirements (UI.ACCESSIBILITY.001)

Interactive UI supports keyboard operation, visible focus, semantic elements, programmatic labels, associated validation messages, and appropriate announcements for asynchronous status.

Do not use a clickable `div` when a button or link provides the required semantics.

### Use declared visual variants (UI.VARIANTS.001)

Use Tailwind theme tokens and `class-variance-authority` for repeated component variants. Do not repeat unexplained pixel values, colors, or long conditional class strings across features.

### Render complete states (UI.STATES.001)

Data and permission-aware components render every applicable state: loading, empty, error, forbidden, disabled, pending mutation, and ready.

Mutation controls prevent accidental duplicate submission and preserve a usable error recovery path.

### Protect rich content boundaries (UI.CONTENT.001)

Do not use `dangerouslySetInnerHTML` for untrusted content. A product requirement for stored rich content names the sanitizer, allowed elements and attributes, link policy, and test cases in a project decision.

### Use the framework image component for content images (UI.IMAGE.001)

Use the Next.js image component when sizing, responsive delivery, or remote image policy applies. Supply meaningful alternative text for informative images and empty alternative text for decorative images.

## Conventions

### Name components for their role

Use `CreateDraftForm`, `PostStatusBadge`, and `PostListEmptyState`. Avoid `PostComponent`, `GenericModal`, or `CommonForm`.

### Give card and section titles heading semantics

A visible card, panel, or section title carries a heading element at the correct level, not a styled `div`. Some primitive sources (for example a shadcn `CardTitle`) default to a non-heading element; give the title heading semantics so assistive technology and accessible-name queries can reach it (`UI.ACCESSIBILITY.001`). Prefer a heading role over a test id when asserting a title in a test.

### Keep domain values typed until display

Transport and view mappings may retain branded or generated ID types. Convert dates, money, and status to display strings at the presentation boundary with explicit locale behavior.

### Use `cn` for class composition

Each frontend owns one `lib/utils.ts` `cn` function combining `clsx` and `tailwind-merge`. Do not create multiple class-merging helpers.

### Keep error boundaries scoped

Use a route error boundary for route failure and a feature error boundary only when the feature can recover without discarding the surrounding page.

## Examples

`CreateDraftForm` owns form interaction for one use case. It composes `Button`, `Input`, and `FieldError` primitives, accepts a server action or narrow submission callback, and renders pending and validation states. The primitive `Button` does not know about posts.

## Verification

- Confirm every component has one ownership level.
- Inspect client-boundary props for serializability.
- Confirm each frontend surface has a decision naming one primary UI system, its approved public
  exports, its token contract, and its vendor-import boundary.
- Inspect new UI for direct vendor imports outside the owning boundary, package-internal imports, local
  primitives that duplicate an approved component, and unexplained raw colors, spacing, radii, or font
  values. Use an AST or lint check where the repository can enforce these boundaries.
- Require component or browser evidence for every new primitive, including keyboard, focus, labeling,
  state, and responsive behavior.
- Run keyboard and accessibility checks for interactive components.
- Search for repeated arbitrary values and unsafe HTML.
- Test all applicable component states.
- Confirm each frontend owns its shadcn/ui source and `cn` helper.
