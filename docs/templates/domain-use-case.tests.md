<!-- Copy to docs/domain/{feature}/{use-case}.tests.md in the project repository -->
# {Use Case Name} — Test Specification

| Field | Value |
|:---|:---|
| Operation | [{use-case}.md]({use-case}.md) |
| Risk Level | Low / Medium / High |
| Last updated | |

Risk level determines mandatory test layers (align with `docs/conventions/backend/08-testing.md`):

- **Low:** Integration required; other layers optional unless the operation has domain invariants.
- **Medium:** Domain Unit + Integration + one E2E or frontend unit path required when UI exists.
- **High:** All applicable layers required; mutation testing required for validators when production-tier.

---

## Acceptance test classification

Record before writing API acceptance or BDD tests. See `docs/guides/add-new-use-case.md` § Classify Acceptance Testing.

| Classification | Justification |
|:---|:---|
| No BDD / Plain API acceptance / BDD acceptance | |

---

## Test Coverage

Each row is one verifiable scenario. Row number `N` maps to acceptance criterion ID `AC-00N` in Reqnroll tags and API acceptance tests.

| # | Scenario | Given | When | Then | Layer | Class | Method | Variations |
|:--|:---------|:------|:-----|:-----|:------|:------|:-------|:-----------|
| 1 | | | | | | | | |

**Layer vocabulary (use exactly):** `Domain Unit` · `Application Unit` · `Integration` · `Frontend Unit` · `E2E`

**Variations column:**

- Happy paths: data boundaries (min length, max length, boundary values).
- Error paths: distinct triggers (empty, null, whitespace, too long, wrong type).
- Integration / E2E: environment cases (unauthenticated, expired token, duplicate idempotency key).
- Write `N/A` only when no meaningful variation exists (for example a pure state-machine guard).

Agents MUST add or update a row before writing or changing a test for that scenario. MUST NOT write a test for a scenario with no row; add the row first.

---

## Explicitly Not Tested

| Scenario | Reason |
|:---------|:-------|
| | Covered by / Out of scope because / Deferred until |

---

## Test Data Notes

Builder defaults, seed data, shared fixtures, or constraints. Reference `TestData/` builder class names when applicable.

---

## Related E2E Specs

| App | Page doc | Playwright file |
|:----|:---------|:----------------|
| `apps/{app}` | [page.md](../../ui/{app}/pages/{page}.md) | `apps/{app}/e2e/{spec}.spec.ts` |
