# Frontend Feature Boundaries

Enforces vertical slice isolation in `apps/web/features/`. Complements `01-nextjs-app-router.md` §11.

---

## 1. Import Rules

- Code under `features/{feature}/` MUST NOT import from `features/{otherFeature}/`.
- Cross-feature reuse MUST follow the promotion rule in `docs/conventions/00-principles.md`: promote to `shared/` (`@/shared/...`) or generic UI to `components/ui/`.
- `app/` route shells MUST import feature entry components from `features/{feature}/` only.

```typescript
// GOOD
import { PostCard } from "@/features/posts/list/PostCard"

// BAD
import { AuthorAvatar } from "@/features/authors/shared/AuthorAvatar"
```

---

## 2. ESLint Enforcement

Project repositories MUST enable `eslint-plugin-boundaries` (or equivalent) with zones:

| Zone | Pattern | Allowed imports |
|:---|:---|:---|
| `features` | `features/*/**` | Same feature, `shared`, `components/ui`, `lib` |
| `shared` | `shared/**` | `lib`, other `shared` |
| `app` | `app/**` | `features/*` entry points only, `lib`, `components` |

Example dependency rule (project `.eslintrc`):

```json
{
  "settings": {
    "boundaries/elements": [
      { "type": "feature", "pattern": "features/*", "mode": "folder" },
      { "type": "shared", "pattern": "shared/**" },
      { "type": "app", "pattern": "app/**" }
    ]
  }
}
```

CI MUST fail when a cross-feature import is introduced.

---

## 3. Public Feature API

Each feature MAY expose a barrel `features/{feature}/index.ts` exporting only public entry components and hooks. Other features MUST NOT import deep paths from sibling features even if ESLint is misconfigured.

---

## 4. Architecture Tests

There is no .NET-style architecture test for TypeScript. ESLint boundaries plus code review are REQUIRED. Playwright tests MUST live under `apps/web/e2e/` and MUST NOT import feature internals across features.
