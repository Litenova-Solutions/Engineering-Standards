# Example Feature Spec: Create Post

Approved example for agents. Copy structure from `docs/templates/feature-spec.md`, not this file directly.

---

## Summary

Authenticated authors create draft posts with a title and body. The post appears in the author's draft list immediately after creation.

---

## Aggregates Affected

| Aggregate | Change type | Notes |
|:---|:---|:---|
| `Post` | New | Draft-only on create |

---

## Domain Model

### New or changed types

- `Post` aggregate with `DraftPostState` only on create
- Value objects: `PostTitle`, `PostContent`

### Domain events

| Event | Raised when | Payload | Outbox required |
|:---|:---|:---|:---:|
| `PostCreated` | Post aggregate created | `PostId`, `AuthorId` | No |

---

## Commands

| Command | Input | Output | Idempotency required |
|:---|:---|:---|:---:|
| `CreatePostCommand` | `PostId`, `Title`, `Content`, `AuthorId` | `PostId` | Yes |

### Validation rules (structural)

- Title: required, max 200 characters
- Content: required, max 50_000 characters

---

## Queries

| Query | Filters / pagination | Result shape |
|:---|:---|:---|
| `GetPostByIdQuery` | `PostId` | `PostResult` |

---

## HTTP Endpoints

| Method | Path | Auth | Rate limit | Idempotency-Key | Notes |
|:---|:---|:---|:---|:---|:---|
| POST | `/posts` | RequireAuthenticatedUser | authenticated-api | Yes | Returns 201 + Location |

---

## Persistence and Migrations

| Change | Migration strategy | Rollback notes |
|:---|:---|:---|
| Table `posts` | Expand (InitialCreate) | Drop in down migration |

---

## UI Flows

### Create post form

- Route: `app/(main)/posts/new/page.tsx`
- Feature entry: `features/posts/create/CreatePostPage.tsx`
- States: loading (submit), empty (form), error (validation + API), loaded (redirect to detail)
- Mutations: Server Action with Zod validation

---

## Acceptance Criteria

1. Given an authenticated author, when they submit a valid title and body, then a draft post is created and they see the post detail page. (Playwright)
2. Given an empty title, when they submit, then the Server Action returns a validation error. (Vitest on Zod schema)
3. Given duplicate Idempotency-Key retries, when the same POST is sent twice, then the API returns the same post id without duplicate rows. (Integration)

---

## Inventories to Update

All items in the feature spec template checklist apply for the first Post feature in a greenfield project.
