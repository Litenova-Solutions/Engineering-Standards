# State Management and Forms

This file will contain the state management and form handling conventions for all Litenova Solutions frontend projects once the frontend stack is standardized. It covers local component state, URL-based state, and form patterns using React and Next.js 15.

This file is intentionally incomplete. Frontend conventions will be added in a future release. Pin to a version tag that includes these files before relying on them in a project.

## Sections That Will Be Present When Complete

- **State Placement Rules:** Decision tree for where state lives — component-local state (`useState`), URL state (search params), server state (Server Component re-render), or global client state. Rules for avoiding premature global state.
- **URL as State:** When and how to use search parameters for UI state (filters, pagination, selected items). How to read and update search params without full page navigation.
- **Server Actions:** When to use Server Actions vs. API Route Handlers for mutations. How Server Actions integrate with `useFormState` and `useFormStatus`. Error handling in Server Actions.
- **Form Design Pattern:** The approved pattern for forms: controlled vs. uncontrolled, schema validation library (e.g., Zod), field error display, and submission state management.
- **Optimistic Updates:** When to use optimistic updates, how to implement them with `useOptimistic`, and how to handle rollback on server error.
- **React Context:** When React Context is acceptable for global UI state (theme, locale, current user). Rules for avoiding Context for frequently-changing state.
- **Form Validation:** Client-side validation rules, schema sharing between frontend and backend, and when to rely on server-side validation responses vs. client-side validation only.
- **Multi-Step Forms:** Pattern for multi-step form flows, state persistence across steps, and validation per step vs. at submission.
