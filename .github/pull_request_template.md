## Reason

State the constraint, decision, or defect that requires the change.

## Verification

- [ ] `dotnet build LiteSpec.slnx`
- [ ] `dotnet test --solution LiteSpec.slnx`
- [ ] `dotnet run --project apps/cli/src/LiteSpec.Cli -- provisions`
- [ ] `dotnet run --project apps/cli/src/LiteSpec.Cli -- validate`
- [ ] `git diff --check`

## Authoring Review

- [ ] Each active ID identifies one current assertion.
- [ ] Each new ID uses the declared identifier grammar.
- [ ] The regenerated provision index is committed.
- [ ] Each provision contains one testable meaning.
- [ ] Terminology matches the glossary.
- [ ] Rationale and examples add useful information.
- [ ] Prose follows the Google developer documentation style guide.
- [ ] Verification rows carry the checkable or guidance mark with exact evidence.
- [ ] Active files contain no history-specific transition material.

## Skipped Checks

Write `None.` or name each skipped command and its exact reason.
