# Workflow Engine

## Intent

Some processes run on a workflow engine instead of reactions and jobs, with steps, timers, and retries the engine owns. This page states how each engine step maps onto exactly one use case with its compensation. A project selects it for each process aggregate an engine carries.

## Activation

Activation scope: `local`.

Applicable specification kinds: `aggregate`.

A project selects `workflow-engine` for a process aggregate when a workflow engine carries it. A process driven by reactions, jobs, and operators does not select it.

## Baseline Relationship

This extension replaces no baseline provision. It switches on no record type: it adds the `carriedBy` marker to process aggregates.

A carried process sets `carriedBy: workflow`, maps each engine step to exactly one use case, and states each step's compensation. The engine's retry and timeout configuration stays in Implementation, outside the records.

## Standards

### Declare the Engine Carrier

**Statement:** A process carried by a workflow engine MUST set `carriedBy: workflow`.

**Rationale:** A reader meeting a process asks first what moves it: reactions, a job, an operator, or an engine. The carrier marker answers that question on the aggregate itself, so nobody hunts the engine console for a process reactions drive.

**Example:** The resale aggregate sets `carriedBy: workflow` while the refund aggregate stays reaction-driven.

### Map Each Engine Step to One Use Case

**Statement:** Each engine step MUST map to exactly one use case.

**Rationale:** An engine step with no use case is behavior no record describes, and a step mapped to two use cases is two behaviors wearing one name. One step and one use case keep the engine definition and the records in lockstep: the map reads both ways.

**Example:** The engine step `suspend-code` maps to `use-case/admission.suspend-code` and to nothing else.

### State Each Step Compensation

**Statement:** Each mapped engine step MUST name its compensation or `none` with the reason.

**Rationale:** Engines fail mid-process: a step times out, a worker crashes, a saga aborts. The compensation is the step's undo, and a step with no undo says so with the reason, so recovery follows the record instead of improvising.

**Example:** The step `void-code` names `use-case/admission.restore-code` as its compensation, while `settle` names `none` because money has moved.

### Reject Unmapped Engine Steps

**Statement:** An engine step with no mapped use case MUST fail `behavior-unrecorded`.

**Rationale:** The map is the whole contract of this extension: every step answers to a use case. A step outside the map is unrecorded behavior by definition, so it fails the same check as code with no record.

**Example:** A new engine step added in the console with no use case behind it fails `behavior-unrecorded` at the next check.

### Keep Engine Retry Configuration in Implementation

**Statement:** Engine retry and timeout configuration MUST live in code outside the records.

**Rationale:** Retry counts, backoff curves, and step timeouts tune operations, not behavior: they change with load and incidents, not with product decisions. Records state what each step does and undoes, while code holds the knobs operators turn.

**Example:** The engine's five-attempt retry with exponential backoff lives in the worker configuration, while the records name only the step and its compensation.

## Conventions

### Name Engine Steps After Use Cases

**Default:** Each engine step carries the id of its mapped use case.

**Replacement:** A project records its engine step naming convention in its workflow documentation.

**Rationale:** A step named after its use case needs no map to read: the name is the map. Any other naming works when the map stays beside the process.

## Dependencies

Packages: None.

Related extensions: `jobs` for the workers that poll the engine and drive its timers.

Guides: None.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/ext/workflow-engine#declare-the-engine-carrier | guidance | The engine-carried aggregates set carriedBy workflow on their aggregate records. |
| litespec/ext/workflow-engine#map-each-engine-step-to-one-use-case | guidance | The engine definition lists one use case beside each step with no step sharing or missing. |
| litespec/ext/workflow-engine#state-each-step-compensation | guidance | Each mapped step names its compensation or none with the reason beside the map. |
| litespec/ext/workflow-engine#reject-unmapped-engine-steps | checkable | `litespec model check` reports `behavior-unrecorded` for an engine step that maps to no use case. |
| litespec/ext/workflow-engine#keep-engine-retry-configuration-in-implementation | guidance | Retry counts, backoff curves, and step timeouts live in worker code with none in the records. |
| litespec/ext/workflow-engine#name-engine-steps-after-use-cases | guidance | Engine steps carry their use-case ids, or the workflow documentation records the naming convention. |
