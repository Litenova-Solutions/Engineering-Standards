# Frontend Feature Boundaries

Enforces feature isolation in `apps/{app}/features/`. Complements `01-nextjs-app-router.md` §11.

Presentation code lives under `features/{feature}/`. Business rules and invariants live in `docs/domain/` and the backend. Do not confuse the two.

## Agent Quick Rules {#agent-quick-rules}

- MUST NOT import `features/{a}/` from `features/{b}/`.
- Promote shared code to `@/shared/` or `components/ui/` per Strike 2 rule in `principles.md`.
- App Router shells MUST import feature entry components from `features/{feature}/` only.
- MUST enable `eslint-plugin-boundaries` with feature isolation zones.
- UI strings MUST come from API fields, i18n keys, or page composition docs; do not invent copy.

**Full convention:** `docs/conventions/frontend/feature-boundaries.md`  
**When generating new files:** Load and copy from `docs/blueprints/frontend/feature-use-case.md`.

---

## 1. Import Rules

- Code under `features/{feature}/` MUST NOT import from `features/{otherFeature}/`.
- Cross-feature reuse MUST follow the promotion rule in `docs/conventions/principles.md`: promote to `shared/` (`@/shared/...`) or generic UI to `components/ui/`.
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
| `features` | `features/*/**` | Same feature area, `shared`, `components/ui`, `lib` |
| `shared` | `shared/**` | `lib`, other `shared` |
| `app` | `app/**` | `features/*` entry points only, `lib`, `components` |

Example dependency rule (copy full file from `docs/templates/config/eslint.config.ts`):

```json
{
  "settings": {
    "boundaries/elements": [
      { "type": "features", "pattern": "features/*", "mode": "folder" },
      { "type": "shared", "pattern": "shared/**" },
      { "type": "app", "pattern": "app/**" }
    ]
  }
}
```

CI MUST fail when a cross-feature import is introduced.

---

## 3. Public Feature API

Each feature folder MAY expose a barrel `features/{feature}/index.ts` exporting only public entry components and hooks. Other features MUST NOT import deep paths from sibling features even if ESLint is misconfigured.

---

## 4. Architecture Tests

There is no .NET-style architecture test for TypeScript. ESLint boundaries plus code review are REQUIRED. Playwright tests MUST live under `apps/{app}/e2e/` and MUST NOT import feature internals across feature boundaries.
