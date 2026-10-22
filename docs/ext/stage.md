# Release Stage

## Intent

The release stage tells whether any deployment holds customer data yet, because several rules assume a running service that the first builds do not have. This page states how a project declares its stage, which rules the early stage defers and until when, and how a recorded Decision ends the deferral. A project selects it while no deployment holds customer data, or afterwards to record a past move to production, so relaxed early rules expire on a date instead of lingering by accident.

## Activation

Activation scope: `project`.

Applicable specification kinds: None.

The project selects `stage` before its first deployment holds customer data, or afterwards to put a past promotion on record. The selection declares the current stage and bounds what the early stage defers.

## Baseline relationship

This extension replaces no baseline provision. A `pre-production` consumer defers named provisions through this extension, while the compat extension still governs versioning once selected.

It switches on no record type: the promotion Decision is a core record every project requires.

## Standards

### Declare the release stage

**Statement:** A consumer MUST declare `pre-production` or `production` as its release stage in `litespec.project.json`.

**Rationale:** The release stage is a project fact, not a departure from any rule, so it lives as data in the `stage` selection: `releaseStage` holds `pre-production` or `production`, beside the deferrals the early stage allows. Without the declared stage, tools and reviewers cannot tell which provisions the project owes today.

**Example:** A consumer with no customer data in any deployment declares the early stage.

```json
{"id": "stage", "criterion": "no deployment holds customer data", "reviewBy": "2026-12-01", "releaseStage": "pre-production"}
```

### Defer named provisions until promotion

**Statement:** A `pre-production` consumer MUST name each deferred provision with its end date in the stage extension selection, with a `production` consumer carrying no deferred provisions.

**Rationale:** An early-stage deferral without a named end becomes permanent by neglect. Each entry names the deferred provision with the date its deferral ends, and the promotion Decision names the same provisions, so promotion closes every deferral at once.

**Example:** The stage selection carries each deferral with its end.

```json
{"id": "stage", "criterion": "no deployment holds customer data", "reviewBy": "2026-12-01", "releaseStage": "pre-production", "deferredProvisions": [{"provision": "litespec/ext/compat#classify-breaking-contract-changes", "until": "2026-12-01"}]}
```

### Promote through a recorded decision

**Statement:** A consumer MUST approve its promotion to `production` as a Decision before its first deployment holds customer data, ending every deferred provision.

**Rationale:** Promotion is the moment relaxed rules end, and an unrecorded moment never arrives: the relaxed rules last until somebody notices they never ended. The Decision carries its owner, status, decider, and decide-by date like any Decision, and approving it before the first deployment holds customer data keeps the data under full rules from day one.

## Conventions

None.

## Dependencies

This extension adds no required package.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/ext/stage#declare-the-release-stage | checkable | `litespec consumer` refuses a `stage` selection with a missing or unknown `releaseStage`. |
| litespec/ext/stage#defer-named-provisions-until-promotion | checkable | `litespec consumer` refuses a deferral naming an unknown provision or past its `until` date, and any deferral in `production`. |
| litespec/ext/stage#promote-through-a-recorded-decision | guidance | Does an approved promotion Decision predate the first deployment holding customer data? |
