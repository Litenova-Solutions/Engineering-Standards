---
{
  "id": "reference.migration.pre-v1-to-v1",
  "kind": "reference",
  "normative": false,
  "appliesTo": ["delivery"],
  "recipes": []
}
---
# Preliminary Baseline to v1

When released, the rebuilt v1 replaces the unused preliminary `v1.0.0` tag and the later pre-release main branch.

## Consumer work

1. Pin the final v1 commit and remove `branch = main` from `.gitmodules`.
2. Add `standards.project.json` using the published schema.
3. Replace copied standards rules in the consumer `AGENTS.md` with the short shim.
4. Merge split Application projects into one feature-first Application project.
5. Replace Marten read wrappers with direct `IQuerySession` injection.
6. Remove the public Marten unit-of-work wrapper and commit through the LiteBus pipeline.
7. Merge each operation and test-spec pair into one use-case specification.
8. Add acceptance IDs to tests and verify that every active ID appears in automated tests.
9. Enable recipes for every retained advanced pattern.
10. Run the complete application gate set and review the standards integration manually.

## Removed preliminary concepts

- Split Write.Contracts, Write, Read.Contracts, Read, and Reactions projects.
- Duplicate read-side and write-side `ValidationError` types.
- `IDatabaseContext` and project-owned Marten read wrappers.
- A test coverage table with class and method names.
- Mandatory page documentation for every route.
- Default EF Core persistence.
- Branch-tracking standards submodules.
