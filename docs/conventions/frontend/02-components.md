# Component Conventions

## 1. Guiding Philosophy

Components are the unit of UI composition, not the unit of architecture. The feature folder is the unit of architecture. A component answers one question: given this data, what should the UI look like? Business logic, data fetching, and state management are not component concerns. The component receives data via props or reads it from a server component parent. It renders. It dispatches events upward. Nothing else.

This separation is enforced structurally: server components fetch, client components interact, and neither category does the other's job. A component that fetches data AND handles button clicks is a design problem, not a convenience. Split it: server component fetches and passes data down, client component handles interaction and fires callbacks up.

---

## 2. Component Taxonomy

Four categories of components exist, each with a defined location and purpose:

### Page Components

**Location:** `features/{feature}/{usecase}/{FeatureName}Page.tsx`

Server components that receive data from the `app/` page shell and orchestrate feature rendering. They own the layout of a use case. MUST be server components unless the entire page requires client-side interactivity with no static data.

### Feature Components

**Location:** `features/{feature}/{usecase}/{ComponentName}.tsx`

Components specific to a single use case within a feature. Can be server or client. One component per file. Named after what they represent, not where they appear (`PostCard`, not `ListItem`).

### Shared Feature Components

**Location:** `features/{feature}/shared/{ComponentName}.tsx`

Components shared within a feature but not across features. Promoted here after appearing in two use cases within the same feature (the Strike 2 rule). Do not promote early.

### UI Components

**Location:** `components/ui/{component-name}.tsx`

shadcn/ui components. Owned in this codebase. Never imported from `@shadcn/ui` (which is not an importable package). Modified here, not in `node_modules`. See Section 4.

```typescript
// GOOD: PostCard is a feature component inside the posts/list use case
// features/posts/list/PostCard.tsx
type PostCardProps = {
  id: string
  title: string
  publishedAt: Date | null
}

export function PostCard({ id, title, publishedAt }: PostCardProps) {
  return (
    <article>
      <h2>{title}</h2>
      {publishedAt && <time>{publishedAt.toLocaleDateString()}</time>}
    </article>
  )
}
```

```typescript
// BAD: generic component placed directly in app/ without a feature folder
// app/components/Card.tsx   <- BAD: no feature ownership, no use case context
export function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded border p-4">{children}</div>
}
```

---

## 3. Props Design

Rules:

- Props MUST be typed as a named `type`. Never use inline prop types. The type name follows the `{ComponentName}Props` convention.
- Required props have no default value. Optional props use `?` and are handled with conditional rendering or a default value.
- Callback props are named `on{Event}` (`onPublish`, `onDelete`, `onSelect`).
- Never pass entire objects when only a few fields are needed. Destructure at the call site and pass only what the component needs.
- Never use `any` in prop types.

```typescript
// GOOD: named props type, specific fields, callback naming
type PostCardProps = {
  id: string
  title: string
  publishedAt: Date | null
  onPublish: (id: string) => void
}

function PostCard({ id, title, publishedAt, onPublish }: PostCardProps) {
  // ...
}
```

```typescript
// BAD: inline props type, entire object passed, ambiguous callback name
function PostCard({ post, publish }: { post: Post; publish: Function }) {
  // BAD: inline type, entire Post object, "publish" is not an event name
}
```

---

## 4. The shadcn/ui Ownership Model

Components from shadcn/ui are copied into `components/ui/` via the CLI and owned in this codebase. The CLI adds a component as a file in `components/ui/`; it is not installed as a package.

Rules:

- Never import from `@shadcn/ui` or `shadcn/ui` directly. Components live in `components/ui/`. If an import from those specifiers appears, it is a bug.
- `forwardRef` has been removed from shadcn/ui. Do not add it to new components or to customized copies of shadcn/ui components.
- All shadcn/ui components include `data-slot` attributes on their root element. Use `data-slot` selectors for styling targets rather than fragile class name overrides.
- The `toast` component is deprecated in shadcn/ui. Use `sonner` for all toast notifications.
- To add a component: `npx shadcn@latest add <component-name>`. This copies the component into `components/ui/`.

```typescript
// GOOD: import from local components/ui/
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog } from "@/components/ui/dialog"
```

```typescript
// BAD: import from package (not how shadcn/ui works)
import { Button } from "shadcn/ui"      // BAD: not an importable package
import { Button } from "@shadcn/ui"     // BAD: not an importable package
```

---

## 4.1. No Shared Workspace UI Package

Shared workspace UI packages (`@workspace/ui`, `@litenova/ui`, `@org/ui`, or any workspace package that exports React components) are forbidden. Each application owns its `components/ui/` directory populated via the shadcn/ui CLI.

Reasons:
- Component output from the CLI is per-app and versioned differently across apps.
- Shared workspace packages couple app release cycles and produce resolution ambiguity in Tailwind.
- The shadcn/ui CLI assumes ownership inside the app; it cannot update components in a shared package.

Rules:
- NEVER add a workspace dependency (`workspace:*`) that exports React components.
- NEVER create or reference a package named `ui` (or similar) under `packages/` in the monorepo.
- If two apps need the same component, each app generates its own copy via `npx shadcn@latest add <component>` and customizes independently.

```typescript
// GOOD: each app owns its copy
import { Button } from "@/components/ui/button"         // web app
import { Button } from "@/components/ui/button"         // admin app (separate copy)
```

```typescript
// BAD: importing from a shared workspace package
import { Button } from "@litenova/ui"      // FORBIDDEN
import { Button } from "@workspace/ui"     // FORBIDDEN
import { Button } from "@/../../packages/ui" // FORBIDDEN
```

---

## 5. Component Variants with `cva`

`cva` (class-variance-authority) is the tool for component variants. Use it inside `components/ui/` files when adding new variants to a shadcn/ui component.

```typescript
// components/ui/button.tsx (excerpt showing cva usage)
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Slot } from "radix-ui"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        // Custom variant added for this project
        publish: "bg-green-600 text-white hover:bg-green-700",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

type ButtonProps = React.ComponentPropsWithoutRef<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }

function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}
```

Note: import `Slot` from `"radix-ui"`, not from `"@radix-ui/react-slot"`. The unified `radix-ui` package was introduced in February 2026 and replaces all individual `@radix-ui/react-*` packages.

---

## 6. The `cn` Utility

The `cn` utility combines `clsx` and `tailwind-merge`. It is the only accepted way to apply conditional Tailwind classes. Direct string concatenation is never acceptable because it does not resolve class conflicts.

```typescript
// lib/utils.ts
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

```typescript
// GOOD: conditional classes via cn()
function StatusBadge({ isPublished }: { isPublished: boolean }) {
  return (
    <span className={cn(
      "rounded-full px-2 py-1 text-xs font-medium",
      isPublished ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
    )}>
      {isPublished ? "Published" : "Draft"}
    </span>
  )
}
```

```typescript
// BAD: string concatenation for conditional classes
function StatusBadge({ isPublished }: { isPublished: boolean }) {
  return (
    <span className={"rounded-full px-2 py-1 text-xs " + (isPublished ? "bg-green-100" : "bg-gray-100")}>
      {/* BAD: string concatenation, Tailwind class conflicts are not resolved */}
    </span>
  )
}
```

---

## 7. Accessibility Requirements

Projects MUST meet WCAG 2.2 AA for interactive UI unless a project ADR requires AAA.

Rules:

- All interactive elements MUST be keyboard-accessible. Use semantic HTML elements (`button`, `a`, `input`) rather than `div` or `span` with `onClick`.
- All images MUST have descriptive `alt` text. Decorative images use `alt=""`.
- Form inputs MUST have associated labels via `htmlFor`/`id` pairing or `aria-label` on the input itself.
- All modal dialogs MUST trap focus and return focus to the trigger element on close. shadcn/ui `Dialog` handles this automatically via Radix UI.
- Color alone MUST NOT convey information. Always pair color with text or an icon.

```typescript
// GOOD: semantic button element, keyboard accessible
function DeleteButton({ onDelete }: { onDelete: () => void }) {
  return (
    <button
      type="button"
      onClick={onDelete}
      aria-label="Delete post"
      className="text-destructive hover:text-destructive/80"
    >
      <TrashIcon aria-hidden="true" />
      <span>Delete</span>
    </button>
  )
}
```

```typescript
// BAD: div with onClick, not keyboard accessible
function DeleteButton({ onDelete }: { onDelete: () => void }) {
  return (
    <div onClick={onDelete} className="cursor-pointer text-red-500">
      {/* BAD: div is not focusable, cannot be activated with keyboard */}
      Delete
    </div>
  )
}
```

---

## 8. Branded Types for IDs

The frontend uses branded types for IDs received from the backend. This prevents passing a `PostId` where an `AuthorId` is expected at compile time.

```typescript
// lib/types/branded.ts
type Brand<T, TBrand extends string> = T & { readonly _brand: TBrand }

export type PostId = Brand<string, "PostId">
export type AuthorId = Brand<string, "AuthorId">
export type UserId = Brand<string, "UserId">

export function asPostId(value: string): PostId {
  return value as PostId
}

export function asAuthorId(value: string): AuthorId {
  return value as AuthorId
}

export function asUserId(value: string): UserId {
  return value as UserId
}
```

Branded types are applied at the API boundary when mapping raw API responses to feature types. The `asXxxId` cast functions are the only place where the cast is permitted. Inside feature code, the branded type is passed without casting.

```typescript
// Applying branded types at the API boundary
const post = {
  id: asPostId(rawPost.id),
  authorId: asAuthorId(rawPost.authorId),
  title: rawPost.title,
}

// TypeScript now prevents passing post.authorId where PostId is expected
```

---

## 9. Error Boundaries

`error.tsx` files catch errors thrown during rendering within their segment. They MUST be client components (add `"use client"` as the first line).

Add an `error.tsx` at the feature level, not at the root `app/` level unless the failure is truly global. Root-level error boundaries are too coarse: an error in one feature MUST NOT crash the entire app shell.

```typescript
// app/(main)/posts/error.tsx
"use client"
// Error boundaries must be client components - required by Next.js.

import { useEffect } from "react"

type Props = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function PostsError({ error, reset }: Props) {
  useEffect(() => {
    // Log to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div role="alert" className="flex flex-col items-center gap-4 p-8">
      <h2 className="text-lg font-semibold">Something went wrong loading posts.</h2>
      <button type="button" onClick={reset} className="text-sm underline">
        Try again
      </button>
    </div>
  )
}
```

---

## 10. Loading, Empty, and Permission States

Feature pages MUST render stable states for loading, empty results, forbidden actions, and errors. Do not leave blank space while data loads.

Skeletons live next to the component they represent. They use the same layout dimensions as the loaded component to prevent layout shift.

```typescript
// GOOD: skeleton preserves card shape
export function PostCardSkeleton() {
  return (
    <article className="rounded-md border p-4" aria-hidden="true">
      <div className="h-5 w-2/3 rounded bg-muted" />
      <div className="mt-3 h-4 w-full rounded bg-muted" />
    </article>
  )
}
```

```typescript
// BAD: loading text changes layout and gives no structure
export function PostCardSkeleton() {
  return <p>Loading...</p>
}
```

Permission-gated UI may hide or disable controls, but it is never the authorization boundary. Server Actions and backend endpoints must enforce authorization.

---

## 11. Project-Specific Component Conventions

Document design tokens in the project Tailwind `@theme` block and list shared components in `docs/domain/frontend-feature-inventory.md`.

---

## 12. `dangerouslySetInnerHTML` Safety

`dangerouslySetInnerHTML` bypasses React's XSS protection. Use it only for HTML content that was sanitized at write time, not at render time.

Rules:
- Sanitize on write (server or API layer), not on read (component render). When the API stores sanitized HTML, the frontend can render it without a client-side sanitization step.
- NEVER render raw user-submitted HTML without verifying the backend sanitizes it before storage. If the API stores whatever the user typed, the frontend must sanitize before rendering.
- NEVER use `dangerouslySetInnerHTML` for content sourced from URL parameters, search inputs, or any other user-controlled value without sanitization.
- Server-authored content (e.g. a blog post written by an admin with a rich text editor) is an acceptable risk when the backend strips disallowed tags before storing.
- When a client-side sanitization pass is needed, use `DOMPurify` with a strict allowlist.

```typescript
// GOOD: rendering server-sanitized HTML (e.g. blog post content stored by the API)
export function PostBody({ html }: { html: string }) {
  return <div dangerouslySetInnerHTML={{ __html: html }} />
  // Acceptable: the API sanitizes post content at write time.
}
```

```typescript
// BAD: rendering unsanitized user input directly
export function CommentBody({ comment }: { comment: string }) {
  return <div dangerouslySetInnerHTML={{ __html: comment }} />
  // FORBIDDEN: comment comes from user input with no sanitization guarantee.
}
```

```typescript
// BAD: sanitizing on the wrong side
export function PostBody({ rawHtml }: { rawHtml: string }) {
  // Sanitize in the API before storage, not here at render time.
  const clean = naiveSanitize(rawHtml)
  return <div dangerouslySetInnerHTML={{ __html: clean }} />
}
```

---

## 13. Image Components

Use `next/image` for all images that are part of content or layout. Raw `<img>` tags bypass Next.js image optimization (no lazy loading, no WebP conversion, no size constraints).

```typescript
// GOOD: use next/image for content and layout images
import Image from "next/image"

export function PostCoverImage({ src, alt }: { src: string; alt: string }) {
  return (
    <Image
      src={src}
      alt={alt}
      width={800}
      height={400}
      className="rounded-md"
    />
  )
}
```

```typescript
// BAD: raw img tag bypasses Next.js image optimisation
export function PostCoverImage({ src, alt }: { src: string; alt: string }) {
  return <img src={src} alt={alt} />  // BAD: no lazy loading, no WebP, no size optimisation
}
```

Use `<img>` only for images served from untrusted or dynamic domains where the Next.js Image Optimization API cannot be configured. Document any `<img>` usage with a comment explaining why `next/image` is not appropriate.
