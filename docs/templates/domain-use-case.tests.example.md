# Create Post — Test Specification

Approved example for agents. Copy structure from `docs/templates/domain-use-case.tests.md`, not this file directly.

| Field | Value |
|:---|:---|
| Operation | [{use-case}.md]({use-case}.md) |
| Risk Level | Medium |
| Last updated | |

---

## Acceptance test classification

| Classification | Justification |
|:---|:---|
| Plain API acceptance | Stakeholder-readable E2E via Playwright; Gherkin adds no value for create flow |

---

## Test Coverage

| # | Scenario | Given | When | Then | Layer | Class | Method | Variations |
|:--|:---------|:------|:-----|:-----|:------|:------|:-------|:-----------|
| 1 | Happy path creation | Authenticated author | Submits valid title and body | Draft post created, redirected to detail | E2E | `create-post.spec.ts` | `user can create a draft post` | Minimum-length title; maximum-length title |
| 2 | Domain: already-published guard | Post is already published | `Publish()` called again | `PostAlreadyPublishedException` raised | Domain Unit | `PostTests` | `Publish_WhenPostIsAlreadyPublished_ShouldThrowPostAlreadyPublishedException` | N/A |
| 3 | Validation: empty title | Authenticated author | Submits empty title | Server Action returns validation error, 422 | Frontend Unit | `createPost.schema.test.ts` | `rejects empty title` | Whitespace-only title; null title |
| 4 | Idempotency | Same POST with same Idempotency-Key | Request sent twice | Second call returns same post ID, no duplicate row | Integration | `CreatePostEndpointTests` | `POST_WithDuplicateIdempotencyKey_ShouldReturn200AndSameId` | Different key same body (should create new) |
| 5 | Authorization | Unauthenticated request | POST to `/posts` | 401 Unauthorized | Integration | `CreatePostEndpointTests` | `POST_WithoutAuthentication_ShouldReturn401` | Expired token; malformed token |
| 6 | Command handler: repository interaction | Valid command | `HandleAsync` called | `AddAsync` called once with correct aggregate | Application Unit | `CreatePostCommandHandlerTests` | `HandleAsync_WithValidCommand_ShouldCallAddAsync` | N/A |

---

## Explicitly Not Tested

| Scenario | Reason |
|:---------|:-------|
| Concurrent creates with different keys | Out of scope for v1; covered by integration test suite policy in project README |

---

## Test Data Notes

- `PostBuilder` default: draft state, random title under 200 chars.
- Integration tests: `TestUsers.Author` via auth test scheme.

---

## Related E2E Specs

| App | Page doc | Playwright file |
|:----|:---------|:----------------|
| `apps/{app}` | [{page}.md](../../ui/{app}/pages/{page}.md) | `apps/{app}/e2e/{spec}.spec.ts` |
