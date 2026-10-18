## Reason

State the constraint, decision, or defect that requires the change.

## Verification

- [ ] `node tools/validate-standards.cases.mjs`
- [ ] `node tools/generate-provisions.mjs`
- [ ] `node tools/validate-standards.mjs`
- [ ] `node tools/validate-ui.cases.mjs`
- [ ] `node tools/validate-consumer.cases.mjs`
- [ ] `dotnet build tools/model/Litenova.Model`
- [ ] `node tools/model.cases.mjs`
- [ ] `node patterns/ui/library.mjs --check`
- [ ] `git diff --check`

## Authoring Review

- [ ] Each active ID identifies one current assertion.
- [ ] Each new ID uses the declared identifier grammar.
- [ ] The regenerated provision index is committed.
- [ ] Each provision uses active voice and names its actor.
- [ ] Each provision contains one testable meaning.
- [ ] Terminology matches the glossary.
- [ ] Rationale and examples add useful information.
- [ ] Prose satisfies simplicity, brevity, clarity, and humanity.
- [ ] Agent Summary bullets cite canonical provisions and add no obligations.
- [ ] Verification rows carry the checkable or guidance mark with exact evidence.
- [ ] Active files contain no history-specific transition material.

## Skipped Checks

Write `None.` or name each skipped command and its exact reason.
