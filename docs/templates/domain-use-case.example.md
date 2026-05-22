# Example Use Case: Create Post

Approved example for agents. Copy structure from `docs/templates/domain-use-case.md`, not this file directly.

---

## Summary

Authenticated authors create draft posts with a title and body. The post appears in the author's draft list immediately after creation.

---

## Command or Query

| Type | Name | Input | Output | Idempotency |
|:---|:---|:---|:---|:---:|
| Command | `CreatePostCommand` | `PostId`, `Title`, `Content`, `AuthorId` | `PostId` | Yes |

### Structural validation

- Title: required, max 200 characters
- Content: required, max 50_000 characters

---

## Domain Behavior

- Creates `Post` aggregate in draft state via factory
- Raises `PostCreated` domain event (no outbox required for v1)

See the feature README in the same folder for aggregate invariants.

---

## Exceptions

| Exception | When | HTTP status |
|:---|:---:|---:|
| `CommandValidationException` | Invalid title or content | 422 |

---

## HTTP Endpoint

| Method | Path | Auth | Rate limit | Idempotency-Key |
|:---|:---|:---|:---|:---:|
| POST | `/posts` | RequireAuthenticatedUser | authenticated-api | Yes |

Returns 201 with Location header.

---

## Persistence (if schema changes)

| Change | Migration strategy |
|:---|:---|
| Table `posts` | Expand (InitialCreate) |

---

## UI

### Route and entry

- Route: `app/(main)/posts/new/page.tsx`
- Domain entry: `domain/posts/create/CreatePostPage.tsx`

### States

| State | Behavior |
|:---|:---|
| Loading | Submit button disabled, spinner on form |
| Empty | Blank form ready for input |
| Error | Inline validation errors or toast for API failure |
| Loaded | Redirect to post detail after successful create |

### Mutations

Server Action with Zod validation in `domain/posts/create/actions.ts`.

---

## Acceptance Criteria

1. Given an authenticated author, when they submit a valid title and body, then a draft post is created and they see the post detail page. (Playwright)
2. Given an empty title, when they submit, then the Server Action returns a validation error. (Vitest on Zod schema)
3. Given duplicate Idempotency-Key retries, when the same POST is sent twice, then the API returns the same post id without duplicate rows. (Integration)

---

## Out of Scope

Publishing, editing, and deleting posts are separate use cases.
