<!-- Copy to docs/domain/README.md in the project repository -->
# Domain Documentation Index

Living map of the system. Update this file when a feature or use case is added, renamed, or retired.

---

## Features

| Feature | Aggregate(s) | Use cases | Doc status |
|:---|:---|:---|:---|
| `posts` | `Post` | `create-post`, `publish-post`, `list-posts` | Complete |
| `authors` | `Author` | `register-author` | Tests doc missing |

**Doc status vocabulary:**

| Status | Meaning |
|:---|:---|
| Complete | Operation doc and test spec exist and match current behavior |
| Tests doc missing | Operation doc exists; `{use-case}.tests.md` not yet written |
| Draft | Docs exist; use case not fully implemented |
| Deprecated | Use case retired; docs kept for history |

---

## Cross-Domain Notes

Document shared concepts that span domain features here (for example authentication model, tenancy, pagination defaults). Prefer defining terms in the feature README that owns the concept and linking from here.

---

## Conventions

- Feature README: `docs/domain/{feature}/README.md`
- Operation doc: `docs/domain/{feature}/{use-case}.md` (kebab-case)
- Test spec: `docs/domain/{feature}/{use-case}.tests.md`
- Update domain docs in the same PR as the code they describe

See `standards/docs/guides/agentic-domain-driven-design.md` and `standards/docs/guides/write-use-case-doc.md`.
