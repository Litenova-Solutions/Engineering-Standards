# Next.js App Router Conventions

This file will contain the Next.js 15 App Router conventions for all frontend projects once the frontend stack is standardized. The frontend stack uses Next.js 15 (App Router), TypeScript, Tailwind CSS v4, and shadcn/ui.

This file is intentionally incomplete. Frontend conventions will be added in a future release. Pin to a version tag that includes these files before relying on them in a project.

## Sections That Will Be Present When Complete

- **Project Structure:** The standard App Router directory layout, including `app/`, `components/`, `lib/`, `hooks/`, and `types/` folders and how feature folders are organized within `app/`.
- **Route Conventions:** File naming rules for `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, and `not-found.tsx`. When to use route groups `(group)/` and parallel routes.
- **Server vs. Client Components:** Rules for deciding when a component must be a Server Component and when it must be a Client Component. The default is Server Component; `"use client"` is an explicit opt-in that must be justified.
- **Metadata API:** How to define static and dynamic metadata using the `Metadata` type and `generateMetadata`. Rules for page titles, descriptions, and Open Graph tags.
- **TypeScript Configuration:** `tsconfig.json` settings, path aliases, and strict mode requirements.
- **Environment Variables:** Naming conventions for `NEXT_PUBLIC_*` vs. server-only variables, where they are defined, and how they are validated at startup.
- **Tailwind CSS v4 Integration:** Configuration conventions, design token usage, and rules for when to use utility classes vs. extracting component classes.
- **shadcn/ui Component Usage:** How shadcn/ui components are added, extended, and where custom variants are defined.
