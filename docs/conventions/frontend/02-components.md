# Component Conventions

This file will contain the React component design conventions for all frontend projects once the frontend stack is standardized. It covers how to design, organize, and compose React components using Next.js 15, TypeScript, and shadcn/ui.

This file is intentionally incomplete. Frontend conventions will be added in a future release. Pin to a version tag that includes these files before relying on them in a project.

## Sections That Will Be Present When Complete

- **Component Taxonomy:** The distinction between page components, feature components, shared UI components, and layout components. Rules for where each type lives in the file system.
- **Naming Conventions:** File naming (`PascalCase.tsx`), component function naming, and prop type naming (e.g., `ComponentNameProps`).
- **Props Design:** Rules for prop types (always a named `type` or `interface`, never inline), required vs. optional props, and when to use `children`.
- **Server vs. Client Component Boundary:** Rules for where the server/client boundary should be drawn within a feature. How to pass Server Component data down to Client Components without prop-drilling.
- **Composition Patterns:** Slot patterns, compound components, and when to use `React.forwardRef`. When composition is preferred over configuration props.
- **shadcn/ui Extension Pattern:** How to extend shadcn/ui components with additional variants using `cva`, where extended components live, and how to avoid overriding installed components.
- **Accessibility Requirements:** ARIA roles, keyboard navigation requirements, and focus management rules for interactive components.
- **Error Boundaries:** When to add `error.tsx` boundaries and how to design useful error UI.
