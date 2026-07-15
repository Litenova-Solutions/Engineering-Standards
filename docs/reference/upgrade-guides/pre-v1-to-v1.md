# Preliminary Baseline to v1

When released, version 1 replaces the unused preliminary `v1.0.0` tag and the later pre-release main branch.

## Consumer work

1. Pin the final v1 commit and remove `branch = main` from `.gitmodules`.
2. Add `standards.project.json` from the current template.
3. Replace copied standards rules in consumer `AGENTS.md` with the short agent entry template.
4. Move the .NET solution to `apps/api/{ProjectName}.slnx`, production projects under `apps/api/src/`, and tests under `apps/api/tests/`.
5. Merge split Application projects into one capability-first Application project.
6. Replace Marten read wrappers with direct `IQuerySession` injection.
7. Remove the public Marten unit-of-work wrapper and commit through the LiteBus command pipeline.
8. Merge each operation and test-spec pair into one use-case specification.
9. Rename feature documentation to capability documentation and adopt the new metadata fields.
10. Add acceptance IDs to tests and verify every active ID appears in automated test source.
11. Rename enabled recipes to extensions and review each extension's activation criteria.
12. Adopt the task-specific load plans and `Agent Summary` sections.
13. Run the complete application and enabled-extension verification.

## Use-case metadata changes

Replace preliminary fields:

| Preliminary | v1 |
|:---|:---|
| `kind` | `operationType` |
| `surfaces` | `deliverySurfaces` |
| `criticality` | `riskFlags` |
| `recipes` | `extensions` |

## Removed preliminary concepts

- Split Write.Contracts, Write, Read.Contracts, Read, and Reactions projects.
- Duplicate read-side and write-side validation error types.
- `IDatabaseContext` and project-owned Marten read wrappers.
- A test coverage table containing class and method names.
- Mandatory page documentation for every route.
- Default EF Core persistence.
- Branch-tracking standards submodules.
- Recipe descriptor JSON files and unused Markdown metadata schemas.
- Full application scaffolds and a standards CLI.
