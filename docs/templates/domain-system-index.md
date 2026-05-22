<!-- Copy to docs/domain/README.md in the project repository -->
# Domain Documentation Index

Living map of the system. Update this file when a feature or use case is added, renamed, or retired.

---

## Features

| Feature | Aggregate(s) | Use cases |
|:---|:---|:---|
| `posts` | `Post` | `create-post`, `publish-post`, `list-posts` |
| `authors` | `Author` | `register-author` |

---

## Cross-Domain Notes

Document shared concepts that span domain features here (for example authentication model, tenancy, pagination defaults). Prefer defining terms in the feature README that owns the concept and linking from here.

---

## Conventions

- Feature README: `docs/domain/{feature}/README.md`
- Use case doc: `docs/domain/{feature}/{use-case}.md` (kebab-case)
- Update domain docs in the same PR as the code they describe

See `standards/docs/guides/agentic-domain-driven-design.md`.
