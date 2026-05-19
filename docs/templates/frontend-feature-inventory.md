# Frontend Feature Inventory

This file is filled in per project and kept current as features are added or removed. It gives agents a complete map of all frontend features, use cases, and routes before they generate new components or pages. Consulting this file before creating a new page prevents duplicate routes, naming conflicts, and misaligned use case boundaries.

This file mirrors the backend feature inventory at `docs/domain/feature-inventory.md`. Every frontend use case should correspond to a backend use case. If they do not align, that is a design problem to resolve before writing code.

---

## Feature and Route Inventory

| Feature | Use Case | Route | Page Component | Type | Status |
|:---|:---|:---|:---|:---|:---|
| Posts | List published posts | `/posts` | `features/posts/list/PostListPage.tsx` | Server | Implemented |
| Posts | View post detail | `/posts/[id]` | `features/posts/detail/PostDetailPage.tsx` | Server | Implemented |
| Posts | Create post | `/posts/new` | `features/posts/create/CreatePostPage.tsx` | Client | Planned |
| Authors | List authors | `/authors` | `features/authors/list/AuthorListPage.tsx` | Server | Implemented |
| Authors | View author profile | `/authors/[id]` | `features/authors/detail/AuthorDetailPage.tsx` | Server | Planned |

**Type column values:**
- **Server**: The page component is a server component. Data is fetched on the server.
- **Client**: The page component is a client component, or the feature component it delegates to is primarily client-side.

**Status column values:**
- **Implemented**: The route and its components exist and are tested.
- **Planned**: The route is identified but not yet built.

---

## Shared Components

Components used by more than one feature are listed here. A component is promoted to `features/{feature}/shared/` when it appears in two use cases within the same feature, or to `components/ui/` when it crosses feature boundaries.

| Component | Used By |
|:---|:---|
| `features/posts/shared/PostStatusBadge.tsx` | Posts: list, detail |
| `components/ui/button.tsx` | Posts: create; Authors: list |

---

## Maintenance Notes

Update this table in the same pull request that adds or removes a page or feature. Do not merge a new `page.tsx` file without a corresponding row in this table.

Reference the backend feature inventory at `docs/domain/feature-inventory.md` to ensure frontend and backend use cases are aligned. A frontend route with no corresponding backend use case, or a backend use case with no frontend route, should be explicitly documented and explained.
