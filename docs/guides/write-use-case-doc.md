# Write Use Case Documentation

Authoring workflow for operation contracts and test specifications. Use this guide when creating or revising domain docs before implementation. For the implementation checklist after docs exist, see `docs/guides/add-new-use-case.md`.

---

## 1. When to Write Docs

Write or update docs when:

- Adding a new use case (command, query, or user journey).
- Changing observable behavior, HTTP contract, or acceptance scenarios.
- Retiring a use case (set Status to Deprecated; keep docs for history).

Skip formal docs only for typo or copy fixes, dependency patches with no contract change, or pure refactors with no observable behavior change (`docs/guides/agentic-domain-driven-design.md` § 9).

---

## 2. Files to Create

For each use case `{use-case}` under feature `{feature}`:

| File | Template | Purpose |
|:---|:---|:---|
| `docs/domain/{feature}/{use-case}.md` | `docs/templates/docs/domain-use-case.md` | Operation contract |
| `docs/domain/{feature}/{use-case}.tests.md` | `docs/templates/docs/domain-use-case.tests.md` | Test specification |

Copy `domain-use-case.example.md` and `domain-use-case.tests.example.md` for shape only; do not copy example content into production docs.

Update `docs/domain/{feature}/README.md` (feature template) when language, invariants, or the use case list changes. Update `docs/domain/README.md` when adding or retiring use cases (system index template).

---

## 3. Operation Contract (`{use-case}.md`)

Fill in order:

1. **Header:** Feature, Status, **Risk Level**, Last updated.
2. **Summary:** One paragraph, business outcome.
3. **Command or Query:** Contract table and structural validation rules.
4. **Domain Behavior:** Aggregate methods and invariants (link feature README).
5. **Exceptions:** HTTP mapping table.
6. **HTTP Endpoint:** Method, path, auth, rate limit, idempotency.
7. **Persistence:** Only when schema changes.
8. **UI:** Link to `docs/ui/{app}/pages/{page}.md`; operation-level notes only.
9. **Out of Scope:** Explicit exclusions.
10. **Test Specification:** Pointer to `{use-case}.tests.md` (already in template).

### Risk level

| Level | Typical use cases | Minimum test layers |
|:---|:---|:---|
| Low | Read-only lists, simple lookups | Integration |
| Medium | Standard writes, forms with validation | Domain Unit (if invariants) + Integration + one UI path |
| High | Payments, permissions, idempotency-sensitive writes | All applicable layers + mutation testing for validators (production-tier) |

### Placeholder convention

- `(none)` — field intentionally empty; do not fill.
- `(deferred — {reason})` — must be resolved before Status is Active.

---

## 4. Test Specification (`{use-case}.tests.md`)

The test spec is normative for **what** is verified. Code and test files implement it.

1. **Header:** Link to operation doc; same Risk Level as operation contract.
2. **Acceptance test classification:** BDD vs plain API vs none (see `add-new-use-case.md` § Classify Acceptance Testing).
3. **Test Coverage table:** One row per scenario before any test is written.
4. **Explicitly Not Tested:** Scenarios deliberately uncovered and why.
5. **Test Data Notes:** Builders, fixtures, seed dependencies.
6. **Related E2E Specs:** Playwright paths and page doc links.

### Test Coverage table rules

- **Given / When / Then:** Same meaning as BDD; keep cells short.
- **Layer:** Use controlled vocabulary from the template only.
- **Class / Method:** Test file or type name and test method name (or Playwright test title).
- **Variations:** List boundary and error variants; `N/A` when none apply.
- Row `N` is criterion ID `AC-00N` for Reqnroll and API acceptance tags.

Agents MUST NOT add tests without a matching row. Humans reviewing coverage scan this table without opening the test runner.

---

## 5. Feature README Updates

When the use case touches aggregate lifecycle:

- Update the Mermaid state diagram with test annotations on transitions, for example `Draft --> Published : Publish (PostTests.Publish_*)`.
- Add or update **Invariants Under Test** rows when a domain invariant gains or loses coverage.

See `docs/templates/docs/domain-feature.md`.

---

## 6. UI Projection Docs

When a frontend route exists:

- Copy `docs/templates/docs/ui-page.md` to `docs/ui/{app}/pages/{page}.md`.
- Link use cases to operation docs; link Tests section to `{use-case}.tests.md`.
- Do not duplicate test tables in the page doc.

---

## 7. Completion Check

Before handing off to implementation:

- [ ] Operation doc and test spec both exist for the use case.
- [ ] Risk Level set on both files and consistent.
- [ ] Every planned scenario has a Test Coverage row (tests may be `(deferred — implement in PR)` in Method column only until implementation; prefer filling Method when known).
- [ ] Explicitly Not Tested lists anything intentionally skipped.
- [ ] Feature README and system index updated if scope changed.

Implementation follows `docs/conventions/shared/agentic-guardrails.md` (Step 0: docs before code).

---

## Related Documents

| Document | Purpose |
|:---|:---|
| `docs/guides/agentic-domain-driven-design.md` | Documentation tree and agent workflow |
| `docs/guides/add-new-use-case.md` | Implementation checklist |
| `docs/guides/definition-of-done.md` | PR completion gates |
| `docs/conventions/backend/api-acceptance-tests.md` | BDD and API acceptance traceability |
