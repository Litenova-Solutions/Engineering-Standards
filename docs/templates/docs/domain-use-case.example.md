---
_example-note: "Example only. Copy shape, not content. See domain-use-case.md for the blank template."
doc-type: use-case
feature: posts
aggregate: Post
operation: CreatePost
layer-context: ["backend.application", "backend.api", "frontend.app"]
conventions: ["backend.domainLayer", "backend.applicationLayer", "backend.apiLayer"]
test-spec: create-post.tests.md
risk-level: medium
status: active
---
# Create Post

| Field | Value |
|:---|:---|
| Feature | `posts` |
| Status | Active |
| Risk Level | Medium |
| Last updated | 2026-06-01 |

---

## Summary

Authenticated authors create draft posts with a title and body. The post appears in the author's draft list immediately after creation.

---

## Command or Query

| Type | Name | Input | Output | Idempotency |
|:---|:---|:---|:---|:---:|
| Command | `CreatePostCommand` | `Title`, `Content`, `AuthorId` (from auth) | `CreatePostResult` with `PostId` | No |

### Structural validation

- `Title`: required, 1–200 characters.
- `Content`: required, 1–50_000 characters.
- `AuthorId`: MUST come from authenticated user context, not the request body.

---

## Domain Behavior

Invokes `Post.Create(title, content, authorId, clock.UtcNow)` on the `Post` aggregate. Post starts in `Draft` state. Raises `PostCreated` domain event.

---

## Exceptions

| Exception | When | HTTP status |
|:---|:---:|---:|
| `AuthorNotFoundException` | Author aggregate missing | 404 |
| `CommandValidationException` | Structural validation failure | 400 |

---

## HTTP Endpoint

| Method | Path | Auth | Rate limit | Idempotency-Key |
|:---|:---|:---|:---|:---:|
| POST | `/api/v1/posts` | RequireAuthenticatedUser | authenticated-api | No |

---

## Persistence

| Change | Migration strategy |
|:---|:---|
| Insert into `posts` table | Expand |

---

## UI

See [`docs/ui/web/pages/create-post.md`](../../ui/web/pages/create-post.md).

Server Action `createPostAction` submits the form. Empty title shows inline field error from RFC 7807 `invalidParams`.

---

## Out of Scope

- Publishing the post (see `publish-post.md`).
- Rich text or attachment upload.

---

## Test Specification

See [`create-post.tests.md`](create-post.tests.md).
