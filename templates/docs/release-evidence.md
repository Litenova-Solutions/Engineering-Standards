# Release Evidence __VERSION__

Release owner: __OWNER__.

Release date: __DATE__.

Source commit: __COMMIT__.

Immutable artifact: __ARTIFACT_REFERENCE__.

## Scope

- Primary journey: __PRIMARY_JOURNEY__.
- Included use cases: __USE_CASE_IDS__.
- Enabled extensions: __EXTENSIONS__.
- Known limitations: __LIMITATIONS__.

## Automated gates

| Gate | Command or workflow | Result | Evidence |
|:---|:---|:---|:---|
| Backend | __COMMAND__ | __RESULT__ | __LINK_OR_ARTIFACT__ |
| Frontend | __COMMAND__ | __RESULT__ | __LINK_OR_ARTIFACT__ |
| Contracts | __COMMAND__ | __RESULT__ | __LINK_OR_ARTIFACT__ |
| Browser | __COMMAND__ | __RESULT__ | __LINK_OR_ARTIFACT__ |
| Security and supply chain | __COMMAND__ | __RESULT__ | __LINK_OR_ARTIFACT__ |

## Data and schema

- Schema plan or migration: __EVIDENCE__.
- Compatibility and rollback result: __RESULT__.
- Backup reference: __REFERENCE__.
- Restore exercise and primary-journey check: __RESULT__.

## Deployment and recovery

- Environment and deployed artifact: __RESULT__.
- Readiness result: __RESULT__.
- Primary-journey smoke test: __RESULT__.
- Rollback exercise and retained artifact: __RESULT__.
- Alert routing exercise: __RESULT__.

## Skipped checks

List each skipped check, the exact reason it did not apply, and the approving owner. Write `None` when every applicable check ran.

## Approval

Record the maintainer's release decision and links to unresolved accepted risks.
