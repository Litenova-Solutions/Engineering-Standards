# Executable BDD Acceptance Tests

## Intent

This extension adds Reqnroll scenarios for critical cross-layer examples. The use-case specification remains the authored behavior source.

## Activation

Activation scope: `local`.

Applicable specification kinds: `use-case`, `end-to-end-flow`.

The consumer enables `acceptance-bdd` when a critical example needs business-language review and execution through a public system boundary. Routine unit behavior does not activate it.

## Baseline relationship

This extension adds `apps/api/tests/{ProjectName}.Acceptance.Tests/` and manifest-pinned Reqnroll packages. It replaces no baseline rule.

## Agent Summary {#agent-summary}

- Select BDD scenarios for shared cross-layer examples. (EXT.BDD.ADOPT.001)
- Trace each scenario to acceptance criteria. (EXT.BDD.TRACE.001)
- Drive scenarios through public behavior. (EXT.BDD.BOUNDARY.001)
- Keep direct database checks at durable boundaries. (EXT.BDD.BOUNDARY.003)
- Isolate scenario data and execution order. (EXT.BDD.STATE.001, EXT.BDD.STATE.002)
- Keep step definitions outside production internals. (EXT.BDD.STEPS.002)

## Standards

### Select shared critical examples (EXT.BDD.ADOPT.001)

**Requirement:** A test author MUST create a BDD scenario only when business-language form improves shared understanding of cross-layer behavior.

**Rationale:** A selected scenario gives product, domain, engineering, and testing discussions one executable example.

### Avoid routine Gherkin duplication (EXT.BDD.ADOPT.002)

**Requirement:** A test author MUST NOT duplicate every unit or validation case in Gherkin.

**Rationale:** Unit and validation tests retain their narrower feedback and failure location.

### Tag scenarios with acceptance criteria (EXT.BDD.TRACE.001)

**Requirement:** Every BDD scenario MUST include one or more `@AC-MODULE-USE-CASE-NN` tags.

**Rationale:** The owning use-case specification contains the acceptance criterion text and examples.

**Example:** `@AC-ORDERS-CANCEL-ORDER-01` traces a cancellation scenario to its accepted criterion.

### Drive public behavior (EXT.BDD.BOUNDARY.001)

**Requirement:** A BDD step MUST call the HTTP API or another declared public system boundary.

**Rationale:** Public execution proves behavior without depending on implementation details.

### Assert observable outcomes (EXT.BDD.BOUNDARY.002)

**Requirement:** A BDD scenario MUST assert a response, later read, durable event, audit record, or other observable outcome.

**Rationale:** Observable results show whether the public boundary achieved the expected behavior.

### Limit database assertions (EXT.BDD.BOUNDARY.003)

**Requirement:** A BDD scenario MUST use direct database assertions only for a documented durable boundary.

**Rationale:** An outbox record is one documented durable boundary with meaningful storage evidence.

### Own scenario data (EXT.BDD.STATE.001)

**Requirement:** Each BDD scenario MUST own its identifiers, actor context, requests, responses, and expected state.

**Rationale:** Local scenario data prevents accidental dependence on data prepared elsewhere.

### Isolate scenario execution (EXT.BDD.STATE.002)

**Requirement:** The acceptance suite MUST reset database state between scenarios and avoid scenario-order dependencies.

**Rationale:** Any scenario can then run alone or in a different order.

### Translate business phrases (EXT.BDD.STEPS.001)

**Requirement:** A BDD step definition MUST translate a business phrase into a typed test-driver call.

**Rationale:** The feature file stays business-readable while the driver owns boundary mechanics.

### Exclude production internals (EXT.BDD.STEPS.002)

**Requirement:** A BDD step definition MUST NOT resolve repositories, handlers, sessions, or the production service provider.

**Rationale:** Internal resolution bypasses the public behavior that the scenario claims to verify.

### Preserve scenario failures (EXT.BDD.STEPS.003)

**Requirement:** A BDD hook MUST await asynchronous setup and cleanup without replacing the original scenario failure.

**Rationale:** Scenario reset and actor setup need complete execution and useful failure evidence.

## Conventions

### Group feature files by module (EXT.BDD.CONVENTION.001)

**Default:** Group feature files under module folders in `Acceptance.Tests`.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Module folders align scenarios with the business vocabulary they exercise.

### Keep steps vocabulary-scoped (EXT.BDD.CONVENTION.002)

**Default:** Keep step definitions narrow and reusable only within one business vocabulary.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Broad generic steps hide business meaning and create unrelated coupling.

### Limit scenario context (EXT.BDD.CONVENTION.003)

**Default:** Store values for one scenario in a scenario context object.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** The context is scenario state rather than a service locator.

### Mark pull-request scenarios (EXT.BDD.CONVENTION.004)

**Default:** Mark the small pull-request subset with `@critical` separately from acceptance-ID tags.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** The tag selects fast feedback without altering acceptance-criterion traceability.

## Dependencies

- `Reqnroll`
- `Reqnroll.xUnit`

## Verification

| ID | Method | Evidence |
|:---|:---|:---|
| EXT.BDD.ADOPT.001 | inspection | Selected scenarios explain their shared cross-layer business example in the owning specification. |
| EXT.BDD.ADOPT.002 | inspection | Scenario review distinguishes selected behavior from unit and validation coverage. |
| EXT.BDD.TRACE.001 | static | Scenario tag scan resolves every `@AC-...` tag to a declared acceptance criterion. |
| EXT.BDD.BOUNDARY.001 | test | `BddBoundaryTests` call the declared HTTP or other public boundary. |
| EXT.BDD.BOUNDARY.002 | test | `BddBoundaryTests` cover a declared observable result. |
| EXT.BDD.BOUNDARY.003 | inspection | Any direct database assertion names its documented durable boundary. |
| EXT.BDD.STATE.001 | test | `BddStateTests` use scenario-owned identifiers and actor state. |
| EXT.BDD.STATE.002 | test | `BddStateTests` asserts randomized scenario order passes after database reset. |
| EXT.BDD.STEPS.001 | inspection | Step definitions delegate business phrases to typed test-driver calls. |
| EXT.BDD.STEPS.002 | static | `BddStepsTests` projects contain no repository, handler, session, or service-provider resolution. |
| EXT.BDD.STEPS.003 | test | `BddStepsTests` retain the original failure after hook cleanup. |
| EXT.BDD.CONVENTION.001 | inspection | Feature file locations follow the module convention or record a local replacement. |
| EXT.BDD.CONVENTION.002 | inspection | Step review identifies one business vocabulary for each reusable step set. |
| EXT.BDD.CONVENTION.003 | inspection | Scenario context review confirms no service registration or resolution behavior. |
| EXT.BDD.CONVENTION.004 | test | Pull-request workflow selects `@critical` independently from acceptance-ID tags. |
