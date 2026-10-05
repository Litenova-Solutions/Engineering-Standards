# Executable BDD Acceptance Tests

## Intent

This extension adds Reqnroll scenarios for critical cross-layer examples. The use-case specification remains the authored behavior source.

## Activation

Activation scope: `local`.

Applicable specification kinds: `use-case`, `end-to-end-flow`.

The consumer enables `bdd` when a critical example needs business-language review and execution through a public system boundary. Routine unit behavior does not activate it.

## Baseline relationship

This extension adds `apps/api/tests/{ProjectName}.Acceptance.Tests/` and manifest-pinned Reqnroll packages. It replaces no baseline rule.

## Agent Summary {#agent-summary}

- Select BDD scenarios for shared cross-layer examples. (standards/rule/ext-bdd.select-shared-critical-examples)
- Trace each scenario to acceptance criteria. (standards/rule/ext-bdd.tag-scenarios-with-acceptance-criteria)
- Drive scenarios through public behavior. (standards/rule/ext-bdd.drive-public-behavior)
- Keep direct database checks at durable boundaries. (standards/rule/ext-bdd.limit-database-assertions)
- Isolate scenario data and execution order. (standards/rule/ext-bdd.own-scenario-data, standards/rule/ext-bdd.isolate-scenario-execution)
- Keep step definitions outside production internals. (standards/rule/ext-bdd.exclude-production-internals)

## Standards

### Select shared critical examples (standards/rule/ext-bdd.select-shared-critical-examples)

**Requirement:** A test author MUST create a BDD scenario only when business-language form improves shared understanding of cross-layer behavior.

**Rationale:** A selected scenario gives product, domain, engineering, and testing discussions one executable example.

### Avoid routine Gherkin duplication (standards/rule/ext-bdd.avoid-routine-gherkin-duplication)

**Requirement:** A test author MUST NOT duplicate every unit or validation case in Gherkin.

**Rationale:** Unit and validation tests retain their narrower feedback and failure location.

### Tag scenarios with acceptance criteria (standards/rule/ext-bdd.tag-scenarios-with-acceptance-criteria)

**Requirement:** Every BDD scenario MUST include one or more `@AC-MODULE-USE-CASE-NN` tags.

**Rationale:** The owning use-case specification contains the acceptance criterion text and examples. The tag is the criterion identifier with one `@` in front, which is the same identifier `standards/rule/frontend-testing.start-a-proving-test-title-with-its-criterion` and `standards/rule/backend-testing.cite-an-acceptance-criterion-in-one-exact-form` cite from their own test attributes. One identifier reaches a feature file as a tag, a C# test as a trait, and a browser test as the opening of its title. The three forms differ only in what their tool requires.

**Example:** `@AC-ORDERS-CANCEL-ORDER-01` traces a cancellation scenario to its accepted criterion.

### Drive public behavior (standards/rule/ext-bdd.drive-public-behavior)

**Requirement:** A BDD step MUST call the HTTP API or another declared public system boundary.

**Rationale:** Public execution proves behavior without depending on implementation details.

### Assert observable outcomes (standards/rule/ext-bdd.assert-observable-outcomes)

**Requirement:** A BDD scenario MUST assert a response, later read, durable event, audit record, or other observable outcome.

**Rationale:** Observable results show whether the public boundary achieved the expected behavior.

### Limit database assertions (standards/rule/ext-bdd.limit-database-assertions)

**Requirement:** A BDD scenario MUST use direct database assertions only for a documented durable boundary.

**Rationale:** An outbox record is one documented durable boundary with meaningful storage evidence.

### Own scenario data (standards/rule/ext-bdd.own-scenario-data)

**Requirement:** Each BDD scenario MUST own its identifiers, actor context, requests, responses, and expected state.

**Rationale:** Local scenario data prevents accidental dependence on data prepared elsewhere.

### Isolate scenario execution (standards/rule/ext-bdd.isolate-scenario-execution)

**Requirement:** The acceptance suite MUST reset database state between scenarios and avoid scenario-order dependencies.

**Rationale:** Any scenario can then run alone or in a different order.

### Translate business phrases (standards/rule/ext-bdd.translate-business-phrases)

**Requirement:** A BDD step definition MUST translate a business phrase into a typed test-driver call.

**Rationale:** The feature file stays business-readable while the driver owns boundary mechanics.

### Exclude production internals (standards/rule/ext-bdd.exclude-production-internals)

**Requirement:** A BDD step definition MUST NOT resolve repositories, handlers, sessions, or the production service provider.

**Rationale:** Internal resolution bypasses the public behavior that the scenario claims to verify.

### Preserve scenario failures (standards/rule/ext-bdd.preserve-scenario-failures)

**Requirement:** A BDD hook MUST await asynchronous setup and cleanup without replacing the original scenario failure.

**Rationale:** Scenario reset and actor setup need complete execution and useful failure evidence.

## Conventions

### Group feature files by module (standards/rule/ext-bdd.group-feature-files-by-module)

**Default:** Group feature files under module folders in `Acceptance.Tests`.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Module folders align scenarios with the business vocabulary they exercise.

### Keep steps vocabulary-scoped (standards/rule/ext-bdd.keep-steps-vocabulary-scoped)

**Default:** Keep step definitions narrow and reusable only within one business vocabulary.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Broad generic steps hide business meaning and create unrelated coupling.

### Limit scenario context (standards/rule/ext-bdd.limit-scenario-context)

**Default:** Store values for one scenario in a scenario context object.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** The context is scenario state rather than a service locator.

### Mark pull-request scenarios (standards/rule/ext-bdd.mark-pull-request-scenarios)

**Default:** Mark the small pull-request subset with `@critical` separately from acceptance-ID tags.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** The tag selects fast feedback without altering acceptance-criterion traceability. `@critical` names the scenarios whose failure stops a release, and the project records which ones those are. A tag that every scenario carries selects nothing, so the subset has a stated size bound and an owner who keeps it there.

## Dependencies

- `Reqnroll`
- `Reqnroll.xUnit`

## Verification

| ID | Method | Evidence |
|:---|:---|:---|
| standards/rule/ext-bdd.select-shared-critical-examples | inspection | Selected scenarios explain their shared cross-layer business example in the owning specification. |
| standards/rule/ext-bdd.avoid-routine-gherkin-duplication | inspection | Scenario review distinguishes selected behavior from unit and validation coverage. |
| standards/rule/ext-bdd.tag-scenarios-with-acceptance-criteria | static | `node standards/tools/validate-consumer.mjs` resolves every `@AC-...` scenario tag to a declared acceptance criterion. |
| standards/rule/ext-bdd.drive-public-behavior | test | `BddBoundaryTests` call the declared HTTP or other public boundary. |
| standards/rule/ext-bdd.assert-observable-outcomes | test | `BddBoundaryTests` cover a declared observable result. |
| standards/rule/ext-bdd.limit-database-assertions | inspection | Any direct database assertion names its documented durable boundary. |
| standards/rule/ext-bdd.own-scenario-data | test | `BddStateTests` use scenario-owned identifiers and actor state. |
| standards/rule/ext-bdd.isolate-scenario-execution | test | `BddStateTests` asserts randomized scenario order passes after database reset. |
| standards/rule/ext-bdd.translate-business-phrases | inspection | Step definitions delegate business phrases to typed test-driver calls. |
| standards/rule/ext-bdd.exclude-production-internals | static | `BddStepsTests` projects contain no repository, handler, session, or service-provider resolution. |
| standards/rule/ext-bdd.preserve-scenario-failures | test | `BddStepsTests` retain the original failure after hook cleanup. |
| standards/rule/ext-bdd.group-feature-files-by-module | inspection | Feature file locations follow the module convention or record a local replacement. |
| standards/rule/ext-bdd.keep-steps-vocabulary-scoped | inspection | Step review identifies one business vocabulary for each reusable step set. |
| standards/rule/ext-bdd.limit-scenario-context | inspection | Scenario context review confirms no service registration or resolution behavior. |
| standards/rule/ext-bdd.mark-pull-request-scenarios | test | Pull-request workflow selects `@critical` independently from acceptance-ID tags. |
