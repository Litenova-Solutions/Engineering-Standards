<!-- Last updated: (fill in date when first created in a project) -->
<!-- Required sections: Consumed Endpoints -->
# Frontend API Endpoints

This file is filled in per project. It documents which OpenAPI endpoints the frontend actively consumes, what they map to in the feature folder structure, and any project-specific notes about authentication requirements or caching behavior. This file supplements the generated TypeScript types in `packages/api-types/src/api.d.ts`; the types tell you what endpoints exist, this file tells you which ones are used and how.

Run `npm run generate:api` to regenerate the TypeScript types whenever the backend API changes. The generated types are the source of truth for request and response shapes; this file is the source of truth for usage context.

---

## Consumed Endpoints

| Endpoint | Feature | Used In | Auth Required | Idempotency | Cache Strategy | Notes |
|:---|:---|:---|:---|:---|:---|:---|
| `GET /posts` | Posts / List | `features/posts/list/PostListPage.tsx` | No | No | `revalidateTag("posts", "hours")` | Returns paginated list. `page` and `pageSize` query params. |
| `GET /posts/{id}` | Posts / Detail | `features/posts/detail/PostDetailPage.tsx` | No | No | `revalidateTag("posts", "hours")` | Returns 404 if post not found; mapped to `notFound()`. |
| `POST /posts` | Posts / Create | `features/posts/create/createPost.action.ts` | Yes | `Idempotency-Key` | Calls `revalidateTag("posts", "minutes")` on success | Server Action. Validates with `createPostSchema` before calling. |
| `GET /authors` | Authors / List | `features/authors/list/AuthorListPage.tsx` | No | No | `revalidateTag("authors", "days")` | Returns all active authors. No pagination. |
| `GET /authors/{id}` | Authors / Detail | `features/authors/detail/AuthorDetailPage.tsx` | No | No | `revalidateTag("authors", "days")` | Returns 404 if author not found; mapped to `notFound()`. |

---

## Authentication Notes

Endpoints marked **Auth Required: Yes** require a valid session. The `getApiClient()` factory in `lib/api/client.ts` reads the session token from the httpOnly cookie and attaches it as a `Bearer` header automatically. Unauthenticated requests to auth-required endpoints return HTTP 401; the `handleApiError` function in `lib/api/errors.ts` maps this to a redirect to `/login`.

---

## Maintenance Notes

This file is generated partially from the OpenAPI spec but requires manual annotation for the **Cache Strategy** and **Used In** columns. Update this table in the same pull request that adds or removes a fetch call in the frontend codebase.

Run `npm run generate:api` to regenerate `packages/api-types/src/api.d.ts` whenever the backend OpenAPI spec changes. The spec is committed at `packages/api-types/openapi.json`.
