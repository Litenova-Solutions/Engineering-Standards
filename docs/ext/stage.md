# Release Stage

## Intent

The release stage tells whether any deployment holds customer data yet, because several provisions assume a running service that the first builds do not have. This page states how a project declares its stage, which provisions the early stage defers and until when, which draft intent approved domain records may rest on, and how a recorded decision ends the deferral. A project selects it while no deployment holds customer data, or afterwards to record a past move to production, so relaxed early provisions expire on a date instead of lingering by accident.

## Activation

Activation scope: `project`.

Applicable specification kinds: None.

The project selects `stage` before its first deployment holds customer data, or afterwards to put a past promotion on record. The selection declares the current stage and bounds what the early stage defers.

## Baseline Relationship

This extension replaces no baseline provision. A `pre-production` consumer defers named provisions through this extension, while the compat extension still governs versioning once selected.

It switches on no record type: the promotion decision is a core record every project requires. An approved domain record that rests on draft intent is covered here instead of by a known gap, as the [model page](../core/model.md) states in its authoring order.

## Standards

### Declare the Release Stage

**Statement:** A consumer MUST declare `pre-production` or `production` as its release stage in `litespec.project.json`.

**Rationale:** The release stage is a project fact, not a departure from any rule, so it lives as data in the `stage` selection: `releaseStage` holds `pre-production` or `production`, beside the deferrals the early stage allows. Without the declared stage, tools and reviewers cannot tell which provisions the project owes today.

**Example:** A consumer with no customer data in any deployment declares the early stage.

```json
{"id": "stage", "criterion": "no deployment holds customer data", "reviewBy": "2026-12-01", "releaseStage": "pre-production"}
```

### Defer Named Provisions Until Promotion

**Statement:** A `pre-production` consumer MUST name each deferred provision with its end date in the stage extension selection, with a `production` consumer carrying no deferred provisions.

**Rationale:** An early-stage deferral without a named end becomes permanent by neglect. Each entry names the deferred provision with the date its deferral ends, and the promotion decision names the same provisions, so promotion closes every deferral at once.

**Example:** The stage selection carries each deferral with its end.

```json
{"id": "stage", "criterion": "no deployment holds customer data", "reviewBy": "2026-12-01", "releaseStage": "pre-production", "deferredProvisions": [{"provision": "litespec/ext/compat#classify-breaking-contract-changes", "until": "2026-12-01"}]}
```

### Promote Through a Recorded Decision

**Statement:** A consumer MUST approve its promotion to `production` as a decision before its first deployment holds customer data, ending every deferred provision.

**Rationale:** Promotion is the moment relaxed provisions end, and an unrecorded moment never arrives: the relaxed provisions last until somebody notices they never ended. The decision carries its owner, status, decider, and decide-by date like any decision, and approving it before the first deployment holds customer data keeps the data under full rules from day one. The decision also covers the migration and cutover work that moves customer data into production.

### Record Rested-On Draft Intent

**Statement:** A `pre-production` consumer MUST name, in its promotion decision, each draft decision and requirement that an approved domain record rests on.

**Rationale:** An approved domain record resting on a draft nobody named looks settled while its foundation can still move. Naming each rested-on draft decision and requirement in the promotion decision keeps the open intent visible beside the records built on it, so promotion settles exactly the intent the domain assumed.

### Resolve Rested-On Draft Intent at Promotion

**Statement:** A consumer MUST approve or retire each named draft intent before its first deployment holds customer data.

**Rationale:** Draft intent covered by the early stage expires at promotion: the promotion decision approves or retires each named draft, so no domain record enters production resting on a guess. A draft still open at promotion keeps the promotion unapproved with it.

## Conventions

None.

## Dependencies

Packages: None.

Related extensions: None.

Guides: None.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/ext/stage#declare-the-release-stage | checkable | `litespec consumer` refuses a `stage` selection with a missing or unknown `releaseStage`. |
| litespec/ext/stage#defer-named-provisions-until-promotion | checkable | `litespec consumer` refuses a deferral naming an unknown provision or past its `until` date, and any deferral in `production`. |
| litespec/ext/stage#promote-through-a-recorded-decision | guidance | The promotion decision under `docs/product/decisions/` carries approval before the first deployment holds customer data and ends every deferred provision. |
| litespec/ext/stage#record-rested-on-draft-intent | guidance | The promotion decision names each draft decision and requirement that an approved domain record rests on. |
| litespec/ext/stage#resolve-rested-on-draft-intent-at-promotion | guidance | Each named draft intent carries approval or retirement before the first deployment holds customer data. |
