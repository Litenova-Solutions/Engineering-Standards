# `docs/decisions/animation-tailwind-first-framer-motion-escalation.md`: Animation - Tailwind First, Framer Motion Escalation

**Status:** Accepted
**Date:** 2026-01-01

---

## Context

UI animations improve perceived performance and user experience. They also add bundle size and rendering complexity. The question is not whether to animate, but what tool to use and when to escalate to a heavier one.

Four options were evaluated:

**Tailwind CSS transition utilities:** `transition`, `duration-*`, `ease-*`, `animate-*`, `motion-reduce:*`. These are CSS-only utilities that compile to standard CSS transitions and keyframe animations. Zero JavaScript added to the bundle. Available in every component without import. Tailwind CSS v4 expands the animation utilities via the `@theme` block.

**CSS `@keyframes` in the global stylesheet:** Custom keyframe animations defined in `app/globals.css` and applied as Tailwind `animate-*` utilities via `@theme`. This is an extension of the Tailwind approach for animations that require custom timing or multi-step sequences. Still zero JavaScript.

**Framer Motion:** A full-featured React animation library (~45KB gzipped). Provides gesture-based animations (`drag`, `whileHover`, `whileTap`), layout animations (`layout` prop, `layoutId` for shared element transitions), `AnimatePresence` for exit animations, and complex sequenced animations via `variants`. These use cases cannot be achieved with CSS alone.

**React Spring:** Physics-based animation library. Comparable bundle size to Framer Motion. Framer Motion has broader adoption in the Next.js ecosystem and better React 19 compatibility.

The majority of animation needs in standard business applications are: hover state color changes, focus ring transitions, modal fade-in/slide-up, accordion expand/collapse, loading spinners. All of these are covered by Tailwind CSS utilities.

This escalation pattern mirrors the outbox pattern on the backend (`docs/decisions/outbox-pattern-as-reliability-escalation.md`): start with the simplest solution, escalate only when the simpler solution is genuinely insufficient.

---

## Decision

Tailwind CSS transition utilities are the default for all animations. `@keyframes` in `app/globals.css` exposed as Tailwind utilities via `@theme` are the second tier for animations Tailwind utilities cannot express.

Framer Motion is added only when a specific animation requirement cannot be met with Tailwind utilities or CSS keyframes. The decision to add Framer Motion MUST be documented in a project-level ADR that identifies the specific animation use case, confirms Tailwind utilities are insufficient, and records the bundle size impact.

Common animation patterns and their correct implementation tier:

| Animation | Tier | Implementation |
|:---|:---|:---|
| Button hover color | Tailwind | `hover:bg-primary/90 transition-colors duration-200` |
| Modal fade-in | Tailwind | `animate-in fade-in duration-200` |
| Accordion open/close | Tailwind + Radix | Radix handles state, Tailwind handles transition |
| Loading spinner | Tailwind | `animate-spin` |
| Page enter animation | Tailwind | `animate-in slide-in-from-bottom-4 duration-300` |
| Shared element transition | Framer Motion | `layoutId` prop with `AnimatePresence` |
| Gesture-based drag | Framer Motion | `drag` prop with `dragConstraints` |
| Exit animation | Framer Motion | `AnimatePresence` with `exit` variants |

When Framer Motion is added to a project, it is scoped to the specific component that requires it. It is not a global provider unless `AnimatePresence` is needed at the layout level for page transitions.

---

## Consequences

**Positive:**

- Zero animation JavaScript in the default setup. Tailwind animations are CSS-only.
- Consistent with the "start simple, escalate when needed" philosophy established in `docs/decisions/outbox-pattern-as-reliability-escalation.md`.
- The bundle size impact of Framer Motion is deferred until a specific requirement justifies it.
- The `motion-reduce:` Tailwind prefix provides accessible animation reduction for free.

**Negative:**

- Tailwind CSS utilities cannot produce all animation effects. Some features will require Framer Motion sooner than expected (e.g., any feature with shared element transitions or exit animations).
- The project-level ADR requirement for Framer Motion adds a small process overhead when the escalation is obviously justified.

**Risks:**

- Adding Framer Motion mid-project requires a bundle size audit to ensure it does not negatively affect Core Web Vitals, particularly Largest Contentful Paint and Time to Interactive.
- Framer Motion requires React 18+. Projects targeting older React versions cannot use it, though this is not a concern given the React 19.2 baseline.