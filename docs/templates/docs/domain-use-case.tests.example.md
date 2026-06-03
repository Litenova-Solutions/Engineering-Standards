# Create Post — Test Specification

> **Example only.** Copy shape from this file when authoring; do not copy content into production docs. See `domain-use-case.tests.md` for the blank template.

| Field | Value |
|:---|:---|
| Operation | [create-post.md](create-post.md) |
| Risk Level | Medium |
| Last updated | 2026-06-01 |

Risk level determines mandatory test layers (align with `docs/conventions/backend/testing.md`):

- **Low:** Integration required; other layers optional unless the operation has domain invariants.
- **Medium:** Domain Unit + Integration + one E2E or frontend unit path required when UI exists.
- **High:** All applicable layers required; mutation testing required for validators when production-tier.

---

## Acceptance test classification

Record before writing API acceptance or BDD tests. See `docs/guides/add-new-use-case.md` § Classify Acceptance Testing.

| Classification | Justification |
|:---|:---|
| Plain API acceptance test | Standard write with validation; Gherkin adds no stakeholder value beyond the test spec table |

---

## Test Coverage

Each row is one verifiable scenario. Row number `N` maps to acceptance criterion ID `AC-00N` in Reqnroll tags and API acceptance tests.

Use `(none)` for intentionally empty fields. Use `(deferred — {reason})` in the Method column when the scenario is planned but not yet implemented.

| # | Scenario | Given | When | Then | Layer | Class | Method | Variations |
|:--|:---------|:------|:-----|:-----|:------|:------|:-------|:-----------|
| 1 | Author creates draft post | Authenticated author | Valid title and content submitted | Post persisted in Draft state; 201 returned | Integration | `CreatePostEndpointTests` | `CreatePost_WithValidInput_ReturnsCreated` | Min title length (1 char); max title length (200 chars) |
| 2 | Empty title rejected | Authenticated author | Title is empty | 400 with `invalidParams` for title | Application Unit | `CreatePostCommandValidatorTests` | `Validate_WhenTitleEmpty_ShouldThrow` | Whitespace-only title |
| 3 | Author creates post via UI | Authenticated author on create page | Form submitted with valid data | Success message; redirect to draft list | E2E | `create-post.spec.ts` | `author creates a draft post` | N/A |

**Layer vocabulary (use exactly):** `Domain Unit` · `Application Unit` · `Integration` · `Frontend Unit` · `E2E`

Agents MUST add or update a row before writing or changing a test for that scenario.

---

## Explicitly Not Tested

| Scenario | Reason |
|:---------|:-------|
| Concurrent duplicate submissions | Out of scope; idempotency not required for this use case |

---

## Test Data Notes

- Use `PostBuilder.Default()` in Domain tests.
- Integration tests seed author via `TestDataSeeder.SeedAuthor()`.

---

## Related E2E Specs

| App | Page doc | Playwright file |
|:----|:---------|:----------------|
| `apps/web` | [create-post.md](../../ui/web/pages/create-post.md) | `apps/web/e2e/posts/create-post.spec.ts` |
