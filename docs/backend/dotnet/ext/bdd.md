# Executable BDD Acceptance Tests

## Intent

This extension adds executable BDD scenarios for cross-layer examples that need review in business language and execution through a public boundary such as the HTTP API. Test authors write them as Reqnroll Gherkin features or as LightBDD feature classes, and use them for the critical examples its rules select, so product, domain, engineering, and testing discussions share one executable example. Each BDD scenario proves one scenario record from the written specification, which stays the behavior source.

## Activation

Activation scope: `local`.

Applicable specification kinds: `use-case`, `journey`.

The consumer enables `bdd` when a critical example needs both business-language review and execution through a public system boundary; routine unit behavior stays in narrower tests.

The consumer selects one runner for the whole suite; every provision below applies to either runner.

| Runner | A scenario is | It proves a scenario with | Its business-readable text is |
|:---|:---|:---|:---|
| Reqnroll | A Gherkin scenario in a `.feature` file, bound to step definitions | A `proves:` line under the scenario title | The feature file |
| LightBDD | A C# method on a feature class, whose steps are calls to step methods | A `/// <proves>` tag on the scenario method | The scenario method, the step method names, and the generated report |

LightBDD binds steps at compile time instead of matching text at run time. A step that no longer exists, or whose parameters changed, fails the build rather than the run. A consumer that generates its API client from the published contract extends the same property to every request a step sends.

## Baseline Relationship

This extension replaces no baseline provision: it adds an acceptance test project and the manifest-pinned packages of the selected runner.

It switches on `scenario`, so its BDD scenarios prove scenario records.

## Standards

### Select Shared Critical Examples

**Statement:** A test author MUST create a BDD scenario only when business-language form improves shared understanding of cross-layer behavior.

**Rationale:** A scenario costs maintenance on every behavior change, so the suite earns its keep only where business-language form improves shared understanding of cross-layer behavior. Each selected scenario gives product, domain, engineering, and testing discussions one executable example instead of four retellings.

### Avoid Routine Scenario Duplication

**Statement:** A test author MUST NOT duplicate every unit or validation test as a BDD scenario.

**Rationale:** A unit test fails at the exact rule and runs in milliseconds; the same test duplicated as a BDD scenario fails at a public boundary after a full setup. Duplication slows the suite and moves the failure away from its cause, so routine behavior stays in its narrower tests.

### Prove a Scenario from Every BDD Scenario

**Statement:** Every BDD scenario MUST carry one `proves` claim naming the scenario it proves.

**Rationale:** A scenario pairs one `given` situation and `when` action with the `then` result they lead to, and the proves claim is what ties the BDD scenario to that record. The claim names it, the steps call the proved use case, and the assertion checks its result; without the claim, the model builder cannot tell which scenario the BDD scenario proves. A LightBDD scenario carries the claim as a `/// <proves>` tag on the scenario method, and a Reqnroll scenario as a `proves:` line under its title.

**Example:** `/// <proves>scenario/cancel-order.canceling-twice-is-refused</proves>` traces a cancellation BDD scenario to its scenario record.

### Drive Public Behavior

**Statement:** A BDD step MUST call the HTTP API or another declared public system boundary.

**Rationale:** A step that calls the HTTP API or another declared public boundary proves what a caller can observe. A step that reaches past the boundary depends on implementation details, so a refactoring breaks the scenario without breaking the behavior.

### Assert Observable Outcomes

**Statement:** A BDD scenario MUST assert a response, later read, durable event, audit record, or other observable outcome.

**Rationale:** A scenario that runs requests without asserting proves only that nothing threw. Asserting a response, a later read, a durable event, an audit record, or another observable outcome shows the public boundary achieved the expected behavior.

### Limit Database Assertions

**Statement:** A BDD scenario MUST use direct database assertions only for a documented durable boundary.

**Rationale:** The database is an implementation detail, so asserting its rows couples the scenario to storage shapes. A direct assertion is allowed only for a documented durable boundary, such as an outbox record, where the stored row is itself the promised evidence.

### Own Scenario Data

**Statement:** Each BDD scenario MUST own its identifiers, actor context, requests, responses, and expected state.

**Rationale:** A scenario that borrows identifiers or state prepared elsewhere breaks when that other setup changes. Owning its identifiers, actor context, requests, responses, and expected state keeps each scenario self-contained and runnable alone.

### Isolate Scenario Execution

**Statement:** The acceptance suite MUST reset database state between scenarios and avoid scenario-order dependencies.

**Rationale:** State left by one scenario becomes a hidden precondition of the next, and the suite passes only in one order. Resetting database state between scenarios removes that coupling, so any scenario runs alone or in any order.

### Translate Business Phrases

**Statement:** A BDD step definition MUST translate a business phrase into a typed test-driver call.

**Rationale:** HTTP calls, JSON shapes, and assertion mechanics in a step definition hide the business phrase the scenario promises. Translating each phrase into a typed test-driver call keeps the scenario readable while the driver owns the boundary mechanics.

### Exclude Production Internals

**Statement:** A BDD step definition MUST NOT resolve repositories, handlers, sessions, or the production service provider.

**Rationale:** Resolving a repository, handler, session, or the production service provider runs the behavior without the boundary the scenario claims to verify. The scenario then passes while the public path stays untested, so step definitions resolve none of them.

### Preserve Scenario Failures

**Statement:** A BDD hook MUST await asynchronous setup and cleanup without replacing the original scenario failure.

**Rationale:** Setup and cleanup are asynchronous, and an unawaited hook leaves the next scenario running against a half-reset database. A hook that throws during cleanup can also replace the scenario's own failure, hiding the real cause. Awaiting both without replacing the original failure keeps the evidence trustworthy.

## Conventions

### Group Feature Files by Module

**Default:** Group feature files or feature classes under module folders in `Acceptance.Tests`.

**Replacement:** A project names its own feature grouping in its documentation.

**Rationale:** A scenario filed by business module sits beside the vocabulary it exercises, so a reader finds every example of one module in one folder. A flat or technically grouped suite scatters them.

### Keep Steps Vocabulary-Scoped

**Default:** Keep step definitions narrow and reusable only within one business vocabulary.

**Replacement:** A project names its own step-sharing scope in its documentation.

**Rationale:** A step reused across vocabularies, such as a generic success step, means something subtly different in each place and couples unrelated modules to one definition. Steps narrow to one business vocabulary keep their meaning exact.

### Limit Scenario Context

**Default:** Store values for one scenario in a scenario context object.

**Replacement:** A project names its own scenario-context use in its documentation.

**Rationale:** One context object holding the scenario's own values keeps shared state visible and small. Resolving services from it turns it into a service locator that hides what the scenario depends on.

### Mark Pull-Request Scenarios

**Default:** Mark the small pull-request subset separately from the proves claim: a Reqnroll scenario with the `@critical` tag, a LightBDD scenario with a critical test trait.

**Replacement:** A project names its own release-gating mark in its documentation.

**Rationale:** The `@critical` tag, or the LightBDD critical trait, selects the small subset whose failure stops a release, for fast pull-request feedback. The marking stays separate from the proves claim, which records scenario proof rather than release gating. A marking that every scenario carries selects nothing, so the subset keeps a stated size bound and an owner who keeps it there.

## Dependencies

Packages: `Reqnroll` and `Reqnroll.xunit.v3` for Gherkin features, or `LightBDD.XUnit3` with `xunit.v3.mtp-v2` for C# feature classes, each pinned in the manifest. LightBDD 3.12 builds against xUnit v3 3.2. Its test project therefore runs the 3.2 line, and other test projects run the current one.

Related extensions: None.

Guides: None.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/backend/dotnet/ext/bdd#select-shared-critical-examples | guidance | Every BDD scenario in the acceptance suite traces to a cross-layer example the team discusses in business language. |
| litespec/backend/dotnet/ext/bdd#avoid-routine-scenario-duplication | guidance | Unit and validation tests in the narrower suites have no duplicate BDD scenario in the acceptance suite. |
| litespec/backend/dotnet/ext/bdd#prove-a-scenario-from-every-bdd-scenario | guidance | Every BDD scenario in the acceptance suite carries one `proves` claim naming a scenario record. |
| litespec/backend/dotnet/ext/bdd#drive-public-behavior | guidance | Every step definition in the acceptance suite calls the HTTP API or another declared public boundary. |
| litespec/backend/dotnet/ext/bdd#assert-observable-outcomes | guidance | Every BDD scenario in the acceptance suite asserts a response, read, event, record, or other observable outcome. |
| litespec/backend/dotnet/ext/bdd#limit-database-assertions | guidance | Every direct database assertion in the acceptance suite names its documented durable boundary. |
| litespec/backend/dotnet/ext/bdd#own-scenario-data | guidance | Every BDD scenario in the acceptance suite declares its own identifiers, actor context, requests, responses, and expected state. |
| litespec/backend/dotnet/ext/bdd#isolate-scenario-execution | guidance | The acceptance suite resets database state between scenarios, and every scenario passes alone and in any order. |
| litespec/backend/dotnet/ext/bdd#translate-business-phrases | guidance | Every step definition in the acceptance suite delegates to a typed test-driver call. |
| litespec/backend/dotnet/ext/bdd#exclude-production-internals | guidance | No step definition in the acceptance suite resolves a repository, handler, session, or the production service provider. |
| litespec/backend/dotnet/ext/bdd#preserve-scenario-failures | guidance | Every hook in the acceptance suite awaits setup and cleanup and keeps the original scenario failure. |
| litespec/backend/dotnet/ext/bdd#group-feature-files-by-module | guidance | Feature files or feature classes in `Acceptance.Tests` sit under module folders, or the project documentation names another grouping. |
| litespec/backend/dotnet/ext/bdd#keep-steps-vocabulary-scoped | guidance | Every reusable step set in the acceptance suite serves one business vocabulary, or the project documentation names another scope. |
| litespec/backend/dotnet/ext/bdd#limit-scenario-context | guidance | The scenario context object in the acceptance suite holds scenario state only, or the project documentation names another use. |
| litespec/backend/dotnet/ext/bdd#mark-pull-request-scenarios | guidance | The pull-request subset in the acceptance suite stays small and owned, marked separately from proves claims. |
