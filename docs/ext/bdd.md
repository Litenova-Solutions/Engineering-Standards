# Executable BDD Acceptance Tests

## Intent

This extension adds executable scenarios for critical cross-layer examples. A consumer writes them as Reqnroll Gherkin features with C# step definitions or as LightBDD feature classes. The use-case specification remains the authored behavior source.

## Activation

Activation scope: `local`.

Applicable specification kinds: `use-case`, `journey`.

The consumer enables `bdd` when a critical example needs business-language review and execution through a public system boundary. Routine unit behavior does not activate it.

A consumer selects one runner for the whole suite and keeps the provisions below with either.

| Runner | A scenario is | It proves a Case with | Its business-readable text is |
|:---|:---|:---|:---|
| Reqnroll | A Gherkin scenario in a `.feature` file, bound to step definitions | A `proves:` line under the scenario title | The feature file |
| LightBDD | A C# method on a feature class, whose steps are calls to step methods | A `/// <proves>` tag on the scenario method | The scenario method, the step method names, and the generated report |

LightBDD moves the binding from text matching to the compiler. A step that no longer exists, or whose parameters changed, fails the build rather than the run. A consumer that generates its API client from the published contract extends the same property to every request a step sends.

## Baseline relationship

This extension replaces no baseline provision. It adds an acceptance test project and the manifest-pinned packages of one runner.

This extension switches on `case`. Its scenarios prove Case records.

## Agent Summary {#agent-summary}

- Select BDD scenarios for shared cross-layer examples. (litespec/rule/ext-bdd.select-shared-critical-examples)
- Prove one Case from each scenario. (litespec/rule/ext-bdd.prove-a-case-from-every-scenario)
- Drive scenarios through public behavior. (litespec/rule/ext-bdd.drive-public-behavior)
- Keep direct database checks at durable boundaries. (litespec/rule/ext-bdd.limit-database-assertions)
- Isolate scenario data and execution order. (litespec/rule/ext-bdd.own-scenario-data, litespec/rule/ext-bdd.isolate-scenario-execution)
- Keep step definitions outside production internals. (litespec/rule/ext-bdd.exclude-production-internals)

## Standards

### Select shared critical examples (litespec/rule/ext-bdd.select-shared-critical-examples)

**Requirement:** A test author MUST create a BDD scenario only when business-language form improves shared understanding of cross-layer behavior.

**Rationale:** A selected scenario gives product, domain, engineering, and testing discussions one executable example.

### Avoid routine scenario duplication (litespec/rule/ext-bdd.avoid-routine-scenario-duplication)

**Requirement:** A test author MUST NOT duplicate every unit or validation case as a scenario.

**Rationale:** Unit and validation tests retain their narrower feedback and failure location.

### Prove a Case from every scenario (litespec/rule/ext-bdd.prove-a-case-from-every-scenario)

**Requirement:** Every BDD scenario MUST carry one `proves` claim naming its Case, with steps calling the proved use case and asserting its Result.

**Rationale:** A Case pairs one situation with the Result it leads to. The claim, the steps, and the assertion together prove it. A LightBDD scenario carries the claim as a `/// <proves>` tag on the scenario method. A Reqnroll scenario carries it as a `proves:` line under its title.

**Example:** `/// <proves>case/cancel-order.cancelling-twice-is-refused</proves>` traces a cancellation scenario to its Case.

### Drive public behavior (litespec/rule/ext-bdd.drive-public-behavior)

**Requirement:** A BDD step MUST call the HTTP API or another declared public system boundary.

**Rationale:** Public execution proves behavior without depending on implementation details.

### Assert observable outcomes (litespec/rule/ext-bdd.assert-observable-outcomes)

**Requirement:** A BDD scenario MUST assert a response, later read, durable event, audit record, or other observable outcome.

**Rationale:** Observable results show whether the public boundary achieved the expected behavior.

### Limit database assertions (litespec/rule/ext-bdd.limit-database-assertions)

**Requirement:** A BDD scenario MUST use direct database assertions only for a documented durable boundary.

**Rationale:** An outbox record is one documented durable boundary with meaningful storage evidence.

### Own scenario data (litespec/rule/ext-bdd.own-scenario-data)

**Requirement:** Each BDD scenario MUST own its identifiers, actor context, requests, responses, and expected state.

**Rationale:** Local scenario data prevents accidental dependence on data prepared elsewhere.

### Isolate scenario execution (litespec/rule/ext-bdd.isolate-scenario-execution)

**Requirement:** The acceptance suite MUST reset database state between scenarios and avoid scenario-order dependencies.

**Rationale:** Any scenario can then run alone or in a different order.

### Translate business phrases (litespec/rule/ext-bdd.translate-business-phrases)

**Requirement:** A BDD step definition MUST translate a business phrase into a typed test-driver call.

**Rationale:** The scenario stays business-readable while the driver owns boundary mechanics.

### Exclude production internals (litespec/rule/ext-bdd.exclude-production-internals)

**Requirement:** A BDD step definition MUST NOT resolve repositories, handlers, sessions, or the production service provider.

**Rationale:** Internal resolution bypasses the public behavior that the scenario claims to verify.

### Preserve scenario failures (litespec/rule/ext-bdd.preserve-scenario-failures)

**Requirement:** A BDD hook MUST await asynchronous setup and cleanup without replacing the original scenario failure.

**Rationale:** Scenario reset and actor setup need complete execution and useful failure evidence.

## Conventions

### Group feature files by module (litespec/rule/ext-bdd.group-feature-files-by-module)

**Default:** Group feature files or feature classes under module folders in `Acceptance.Tests`.

**Replacement:** A consumer records a departure from this default as an Exception record with reason and review date.

**Rationale:** Module folders align scenarios with the business vocabulary they exercise.

### Keep steps vocabulary-scoped (litespec/rule/ext-bdd.keep-steps-vocabulary-scoped)

**Default:** Keep step definitions narrow and reusable only within one business vocabulary.

**Replacement:** A consumer records a departure from this default as an Exception record with reason and review date.

**Rationale:** Broad generic steps hide business meaning and create unrelated coupling.

### Limit scenario context (litespec/rule/ext-bdd.limit-scenario-context)

**Default:** Store values for one scenario in a scenario context object.

**Replacement:** A consumer records a departure from this default as an Exception record with reason and review date.

**Rationale:** The context is scenario state rather than a service locator.

### Mark pull-request scenarios (litespec/rule/ext-bdd.mark-pull-request-scenarios)

**Default:** Mark the small pull-request subset separately from the proves claim: a Reqnroll scenario with the `@critical` tag, a LightBDD scenario with a critical test trait.

**Replacement:** A consumer records a departure from this default as an Exception record with reason and review date.

**Rationale:** The marking selects fast feedback without altering Case proof. `@critical` names the scenarios whose failure stops a release, and the project records which ones those are. A marking that every scenario carries selects nothing, so the subset has a stated size bound and an owner who keeps it there.

## Dependencies

- `Reqnroll` and `Reqnroll.xunit.v3`, for Gherkin features
- `LightBDD.XUnit3` with `xunit.v3.mtp-v2`, for C# feature classes

LightBDD 3.12 is built against xUnit v3 3.2. Its test project therefore runs the 3.2 line, and other test projects run the current one.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/rule/ext-bdd.select-shared-critical-examples | guidance | Does the scenario give shared discussions one executable cross-layer example? |
| litespec/rule/ext-bdd.avoid-routine-scenario-duplication | guidance | Does the suite leave unit and validation cases to their narrower tests? |
| litespec/rule/ext-bdd.prove-a-case-from-every-scenario | guidance | Does every scenario carry one proves claim for a Case its steps prove? |
| litespec/rule/ext-bdd.drive-public-behavior | guidance | Do all steps call the HTTP API or another declared public boundary? |
| litespec/rule/ext-bdd.assert-observable-outcomes | guidance | Does each scenario assert a response, read, event, record, or other observable outcome? |
| litespec/rule/ext-bdd.limit-database-assertions | guidance | Does each direct database assertion name its documented durable boundary? |
| litespec/rule/ext-bdd.own-scenario-data | guidance | Does each scenario own its identifiers, actor context, requests, responses, and expected state? |
| litespec/rule/ext-bdd.isolate-scenario-execution | guidance | Does the suite reset state between scenarios and avoid order dependence? |
| litespec/rule/ext-bdd.translate-business-phrases | guidance | Do step definitions delegate business phrases to typed driver calls? |
| litespec/rule/ext-bdd.exclude-production-internals | guidance | Is the suite free of repository, handler, session, and provider resolution? |
| litespec/rule/ext-bdd.preserve-scenario-failures | guidance | Do hooks await setup and cleanup without replacing the scenario failure? |
| litespec/rule/ext-bdd.group-feature-files-by-module | guidance | Do feature files follow the module folders or a recorded Exception? |
| litespec/rule/ext-bdd.keep-steps-vocabulary-scoped | guidance | Does each reusable step set serve one business vocabulary or a recorded Exception? |
| litespec/rule/ext-bdd.limit-scenario-context | guidance | Does the scenario context hold state only, or is there a recorded Exception? |
| litespec/rule/ext-bdd.mark-pull-request-scenarios | guidance | Does the pull-request subset stay small, owned, and separate from Case proof? |
