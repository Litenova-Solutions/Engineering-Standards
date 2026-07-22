# Components and UI

## Intent

Components should have one clear ownership level and expose accessible behavior without leaking application state across boundaries. Each frontend owns its component source so shadcn/ui updates and product-specific composition remain local.

## Agent Summary {#agent-summary}

- Keep route composition in pages, use-case behavior in features, shared product UI in components, and primitives in `components/ui`.
- Keep component props narrow and serializable across server-client boundaries.
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

### Own shadcn/ui source per application (UI.SHADCN.001)

Run shadcn/ui changes in the owning frontend. Review generated source as application code. Do not edit generated primitives indirectly through a shared package that hides their implementation.

The manifest pins the primitive and icon dependencies that shadcn/ui source imports: the unified `radix-ui` package (current shadcn styles import primitives from this single package rather than individual `@radix-ui/react-*` packages) and the `lucide-react` icon library. Adding a component whose source imports a package the manifest does not pin requires pinning that package first, in the same standards or consumer-override change (`DEP.APPROVAL.001`). Either the shadcn CLI or hand-authored canonical source may create the owned primitive once its dependencies are pinned; both are reviewed as application code. Prefer the unified `radix-ui` package over reintroducing individual `@radix-ui/react-*` dependencies.

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
- Run keyboard and accessibility checks for interactive components.
- Search for repeated arbitrary values and unsafe HTML.
- Test all applicable component states.
- Confirm each frontend owns its shadcn/ui source and `cn` helper.
