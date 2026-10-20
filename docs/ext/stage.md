# Release Stage

## Intent

A consumer passes through two release stages. Before the first deployment holds customer data, several provisions assume a service that does not exist yet. This extension declares the stage, bounds what the early stage defers, and records the promotion that ends it.

## Activation

Activation scope: `project`.

Applicable specification kinds: None.

The consumer selects `stage` before its first deployment holds customer data, or to record a promotion it already passed.

## Baseline relationship

None. A `pre-production` consumer defers provisions through this extension; the compat extension still governs versioning once selected.

None. The promotion Decision is a core record every profile requires.

## Agent Summary {#agent-summary}

- Declare the release stage in the project record. (litespec/rule/ext-stage.declare-the-release-stage)
- Name each deferred provision with its end date. (litespec/rule/ext-stage.defer-named-provisions-until-promotion)
- Record the promotion before the first customer data. (litespec/rule/ext-stage.promote-through-a-recorded-decision)

## Standards

### Declare the release stage (litespec/rule/ext-stage.declare-the-release-stage)

**Requirement:** A consumer MUST declare `pre-production` or `production` as its release stage in `litespec.project.json`.

**Rationale:** A life stage is not a departure from a standard. The `stage` selection in `selectedExtensions` holds `releaseStage` with one of the two values above, beside the deferrals that stage allows.

**Example:** A consumer with no customer data in any deployment declares the early stage.

```json
{"id": "stage", "criterion": "no deployment holds customer data", "reviewBy": "2026-12-01", "releaseStage": "pre-production"}
```

### Defer named provisions until promotion (litespec/rule/ext-stage.defer-named-provisions-until-promotion)

**Requirement:** A `pre-production` consumer MUST name each deferred provision with its end date in the stage extension selection, with a `production` consumer carrying no deferred provisions.

**Rationale:** A deferral ends at promotion instead of drifting. Each entry names the provision and the date its deferral ends. The promotion Decision names the same provisions.

**Example:** The stage selection carries each deferral with its end.

```json
{"id": "stage", "criterion": "no deployment holds customer data", "reviewBy": "2026-12-01", "releaseStage": "pre-production", "deferredProvisions": [{"provision": "litespec/rule/ext-compat.classify-breaking-contract-changes", "until": "2026-12-01"}]}
```

### Promote through a recorded decision (litespec/rule/ext-stage.promote-through-a-recorded-decision)

**Requirement:** A consumer MUST approve its promotion to `production` as a Decision before its first deployment holds customer data, ending every deferred provision.

**Rationale:** Without a recorded moment, the relaxed rules last until somebody notices they never ended. The Decision carries its owner, status, decider, and decide-by date like any Decision.

## Conventions

None.

## Dependencies

This extension adds no required package.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/rule/ext-stage.declare-the-release-stage | checkable | `litespec consumer` refuses a `stage` selection with a missing or unknown `releaseStage`. |
| litespec/rule/ext-stage.defer-named-provisions-until-promotion | checkable | `litespec consumer` refuses a deferral naming an unknown provision or past its `until` date, and any deferral in `production`. |
| litespec/rule/ext-stage.promote-through-a-recorded-decision | guidance | Does an approved promotion Decision predate the first customer data? |
