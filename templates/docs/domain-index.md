---
{
  "kind": "domain-index",
  "id": "__PROJECT_ID__",
  "specStatus": "approved",
  "owner": "__OWNER__",
  "lastReviewed": "YYYY-MM-DD"
}
---
# __PROJECT__ Domain

## Bounded context

Name the single business boundary and the responsibilities inside it.

## Domain language

Use [glossary.md](glossary.md) as the shared term list. Module-specific terms remain in module specifications.

## Modules

| Module | Purpose | Specification |
|:---|:---|:---|
| `__MODULE__` | State the related language and use cases. | Link `modules/__MODULE__/README.md`. |

## Workflows

| Workflow | Business purpose | Participating modules |
|:---|:---|:---|
| `__WORKFLOW__` | State the system-controlled outcome. | List module IDs. |

Remove this section when no Workflow specification exists.

## Domain policies

| Domain policy | Purpose | Applies to modules |
|:---|:---|:---|
| `__POLICY__` | State the accepted policy. | List module IDs. |

Remove this section when no domain policy specification exists.

## Folder organization

```text
docs/domain/
  README.md
  glossary.md
  modules/
  workflows/       create with the first workflow
  policies/        create with the first domain policy
```

End-to-end flow order belongs under `docs/product/flows/`, not in this index.
