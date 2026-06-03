# Example Use Case: Create Post

Approved example for agents. Copy structure from `docs/templates/domain-use-case.md`, not this file directly.

| Field | Value |
|:---|:---|
| Feature | `posts` |
| Status | Active |
| Risk Level | Medium |
| Last updated | |

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

See [`docs/ui/{app}/pages/{page}.md`](../../ui/{app}/pages/{page}.md).

Operation notes: redirect to post detail after successful create; validation errors inline on the form.

---

## Out of Scope

Publishing, editing, and deleting posts are separate use cases.

---

## Test Specification

See [{use-case}.tests.md]({use-case}.tests.md).
