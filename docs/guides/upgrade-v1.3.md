# Upgrade to standards v1.3

Standards v1.3 adds typed domain documentation, journey and evidence artifacts, explicit process-coordinator boundaries, planned versus active traceability, and cross-file metadata validation.

## Required consumer work

### Classify domain directories

Keep subject specifications at `docs/domain/subjects/{subject}/README.md`. Put shared artifacts under `docs/domain/cross-cutting/` and give both buckets a README that states its type, owner, and allowed artifacts. Use `subjects-index.md` and `cross-cutting-index.md` for those bucket READMEs. The domain tree has two buckets:

- `subjects/` for subject READMEs and their use-case specifications.
- `cross-cutting/` for behavior shared across subjects, including journeys, evidence, security, retention, provider, operating, and delivery contracts.

The domain index links each subject and the cross-cutting bucket. Do not place a shared artifact in a subject directory.

### Add the shared planning records

Create a critical journey when one customer outcome spans more than one use case. Create an evidence register when a decision depends on facts with different evidence classes. Create a cross-cutting contract when one rule applies across subjects. Create an operating-limits record when a pilot or release has a defined support envelope, stop condition, or recovery target.

Use the v1.3 templates and link their acceptance IDs, decisions, operating checks, and release gates. Keep each record short enough for the task load plan.

### Mark status and acceptance evidence

Keep routing status and document status accurate. Planned acceptance IDs describe intended behavior and may have no test reference. Active acceptance IDs require automated evidence, and active invariants and transitions require active acceptance coverage. The acceptance prefix must match the owning use-case ID and end with a two-digit suffix.

### Declare extension activation

Treat the extension list in `standards.project.json` as the repository allow-list. Each use-case `extensions` array must be a subset of that list and of the manifest extension IDs. Update the consumer configuration and use-case metadata together when a new extension is needed.

### Model process coordinators

Document a workflow that crosses subjects as a process coordinator. Keep a stateless coordinator in Application, a reaction, or a Worker process. Model it as a subject only when it owns independent business state, lifecycle, retry or idempotency rules, or operator actions. The coordinator calls public subject commands or ports and does not mutate another subject's aggregate directly.

## Validation

Validate the manifest, consumer project file, and routing schema. Run the read-only domain check from the consumer repository root:

```powershell
powershell -File standards/scripts/validate-domain-docs.ps1
```

The check reports path and ID mismatches, unknown risk flags, extension inheritance errors, acceptance prefix errors, and missing code references for active acceptance IDs.

## Review records

Use a decision record for an unresolved policy, provider, or external choice. Link the decision from the affected journey, contract, evidence register, or use-case specification. Mark replacements and review dates in the decision record.

## Version pin

During draft review, pin the consumer submodule to the exact reviewed commit. After publication, update it to the `v1.3.0` tag. Read the v1.3 changelog entry and run the complete application gate set after applying the required documentation changes.
