# Frontend Domain Boundaries

Enforces domain isolation in `apps/web/domain/`. Complements `01-nextjs-app-router.md` §11.

---

## 1. Import Rules

- Code under `domain/{feature}/` MUST NOT import from `domain/{otherFeature}/`.
- Cross-domain reuse MUST follow the promotion rule in `docs/conventions/00-principles.md`: promote to `shared/` (`@/shared/...`) or generic UI to `components/ui/`.
- `app/` route shells MUST import domain entry components from `domain/{feature}/` only.

```typescript
// GOOD
import { PostCard } from "@/domain/posts/list/PostCard"

// BAD
import { AuthorAvatar } from "@/domain/authors/shared/AuthorAvatar"
```

---

## 2. ESLint Enforcement

Project repositories MUST enable `eslint-plugin-boundaries` (or equivalent) with zones:

| Zone | Pattern | Allowed imports |
|:---|:---|:---|
| `domain` | `domain/*/**` | Same domain area, `shared`, `components/ui`, `lib` |
| `shared` | `shared/**` | `lib`, other `shared` |
| `app` | `app/**` | `domain/*` entry points only, `lib`, `components` |

Example dependency rule (copy full file from `docs/templates/eslint.config.ts`):

```json
{
  "settings": {
    "boundaries/elements": [
      { "type": "domain", "pattern": "domain/*", "mode": "folder" },
      { "type": "shared", "pattern": "shared/**" },
      { "type": "app", "pattern": "app/**" }
    ]
  }
}
```

CI MUST fail when a cross-domain import is introduced.

---

## 3. Public Domain API

Each domain folder MAY expose a barrel `domain/{feature}/index.ts` exporting only public entry components and hooks. Other domains MUST NOT import deep paths from sibling domains even if ESLint is misconfigured.

---

## 4. Architecture Tests

There is no .NET-style architecture test for TypeScript. ESLint boundaries plus code review are REQUIRED. Playwright tests MUST live under `apps/web/e2e/` and MUST NOT import domain internals across domain boundaries.
