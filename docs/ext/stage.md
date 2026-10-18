# Release Stage

## Intent

A consumer passes through two release stages. Before the first deployment holds customer data, several provisions assume a service that does not exist yet. This extension declares the stage, bounds what the early stage defers, and records the promotion that ends it.

## Activation

Activation scope: `project`.

Applicable specification kinds: None.

The consumer selects `stage` before its first deployment holds customer data, or to record a promotion it already passed.

## Baseline relationship

This extension suspends no baseline provision by itself. A `pre-production` consumer defers only the provisions its promotion plan names, and the compat extension still governs versioning once selected.

## Agent Summary {#agent-summary}

- Declare the release stage in the project record. (standards/rule/ext-stage.declare-the-release-stage)
- Defer only the provisions the promotion plan names. (standards/rule/ext-stage.defer-named-provisions-until-promotion)
- Record the promotion before the first customer data. (standards/rule/ext-stage.promote-through-a-recorded-decision)

## Standards

### Declare the release stage (standards/rule/ext-stage.declare-the-release-stage)

**Requirement:** A consumer MUST declare `pre-production` or `production` as its release stage in `standards.project.json`.

**Rationale:** A life stage is not an override. A temporary position recorded as an expiring override reads as a defect with a date, while a declared stage states what the project is. The project record holds `releaseStage` with one of the two values above.

**Example:** A consumer with no customer data in any deployment declares the early stage.

```json
{"releaseStage": "pre-production", "deferredProvisions": [], "promotionPlan": "docs/decisions/promote-to-production.md"}
```

### Defer named provisions until promotion (standards/rule/ext-stage.defer-named-provisions-until-promotion)

**Requirement:** A `pre-production` consumer MAY defer the compatibility, migration, and test provisions its promotion plan names.

**Rationale:** The deferred provisions assume a running service with users. Naming them in the promotion plan keeps the deferral bounded, so it ends at promotion instead of drifting. `deferredProvisions` is an array of provision IDs deferred until production.

### Promote through a recorded decision (standards/rule/ext-stage.promote-through-a-recorded-decision)

**Requirement:** A consumer MUST record its promotion to `production` as a decision before its first deployment holds customer data.

**Rationale:** The promotion gate is what ends every deferral. Without a recorded moment, the relaxed rules last until somebody notices they never ended. `promotionPlan` is a repository-relative path to the decision that promotes the stage.

## Conventions

None.

## Dependencies

This extension adds no required package.

## Verification

| ID | Method | Evidence |
|:---|:---|:---|
| standards/rule/ext-stage.declare-the-release-stage | inspection | Project review reads `releaseStage` from `standards.project.json`. |
| standards/rule/ext-stage.defer-named-provisions-until-promotion | inspection | Promotion-plan review names each deferred provision with its promotion end. |
| standards/rule/ext-stage.promote-through-a-recorded-decision | inspection | Decision review finds the promotion record dated before the first customer data. |
