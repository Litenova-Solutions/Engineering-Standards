---
{
  "kind": "domain-index",
  "id": "__PROJECT_ID__",
  "recordStatus": "current",
  "owner": "__OWNER__",
  "lastReviewed": "YYYY-MM-DD"
}
---
# __PROJECT__ Domain

## Bounded context

Name the single business boundary and the responsibilities inside it.

## Domain language

Use [glossary.md](glossary.md) as the shared term list. Subject-specific terms remain in Subject specifications.

## Subjects

| Subject | Purpose | Specification |
|:---|:---|:---|
| `__SUBJECT__` | State the related language and use cases. | Link `subjects/__SUBJECT__/README.md`. |

## Workflows

| Workflow | Business purpose | Participating Subjects |
|:---|:---|:---|
| `__WORKFLOW__` | State the system-controlled outcome. | List Subject IDs. |

Remove this section when no Workflow specification exists.

## Shared Rules

| Shared Rule | Type | Applies to |
|:---|:---|:---|
| `__SHARED_RULE__` | `business-policy` | List Subject IDs. |

Remove this section when no Shared Rule exists.

## Folder organization

```text
docs/domain/
  README.md
  glossary.md
  subjects/
  workflows/       create with the first Workflow
  shared-rules/    create with the first Shared Rule
```

Business Flow order belongs under `docs/product/flows/`, not in this index.
