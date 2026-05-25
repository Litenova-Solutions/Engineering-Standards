# {App Name} — shell

| Field | Value |
|:---|:---|
| App | `apps/{app}` |
| Layout | `{path to root layout}` |

Shared chrome wraps every route in this app. Page docs describe route-specific content inside the main region.

---

## Regions

| Region | Component | Role |
|:---|:---|:---|
| Header | `{component path}` | {role} |
| Main | `app/**/page.tsx` → domain components | Route content |
| Footer | `{component path}` | {role} |

---

## Layout contract

| Rule | Verification |
|:---|:---|
| {cross-page layout rule} | {Playwright spec or review} |

---

## Presentation defaults

| Concern | Source |
|:---|:---|
| Component library | shadcn/ui in `components/ui/` |
| Theme tokens | `@litepress/config-tailwind/theme.css` or project equivalent |

---

## Related

- Link to ADRs (auth, SEO, dual-app) when applicable
- Link to feature READMEs only for auth/session domain rules
