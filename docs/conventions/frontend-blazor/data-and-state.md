# Client Data and State

## Intent

Every use case runs through Application. State carries a declared classification, loads once at startup, and reports failure explicitly rather than through an absent value.

## Agent Summary {#agent-summary}

- A component invokes an Application handler, never Domain directly. (CLIENTDATA.USECASE.001)
- Every piece of state is durable, device-local, or derived. (CLIENTDATA.CLASSIFICATION.001)
- Persisted state loads once into a typed store at startup. (CLIENTDATA.LOAD.001)
- A derived value is computed in one place. (CLIENTDATA.DERIVED.001)
- Validation runs in an Application validator. (CLIENTDATA.VALIDATION.001)
- A handler returns a typed result covering each named failure. (CLIENTDATA.RESULTS.001)

## Standards

### Route use cases through Application (CLIENTDATA.USECASE.001)

**Requirement:** A component MUST invoke an Application handler carrying a `Command` or `Query` role suffix rather than compose Domain calls or write storage.

**Rationale:** The handler is the one place a use case exists, so a component composing its own sequence creates a second definition.

### Classify state (CLIENTDATA.CLASSIFICATION.001)

**Requirement:** A specification introducing state MUST classify it as durable, device-local, or derived.

**Rationale:** Durable state is persisted, versioned, and exported. Device-local state is persisted but excluded from export. Derived state is computed from durable state and never persisted.

### Load persisted state once (CLIENTDATA.LOAD.001)

**Requirement:** Persisted state MUST load once during startup into a typed store that components read from.

**Rationale:** A component reading storage on render turns every frame into an input-output call. A route renders its loading state until the store reports ready.

### Keep derived values single-sourced (CLIENTDATA.DERIVED.001)

**Requirement:** A derived value MUST be computed in one place in Domain or Application and consumed everywhere else.

**Rationale:** Recomputing the same value in a component is a defect even when the result currently matches.

### Validate at the boundary (CLIENTDATA.VALIDATION.001)

**Requirement:** Input validation MUST run in an Application validator returning a typed result.

**Rationale:** A form renders those results rather than restating the rules. A browser-side convenience check improves feedback but cannot be the only enforcement.

### Make failure explicit (CLIENTDATA.RESULTS.001)

**Requirement:** An Application handler MUST return a typed result union covering success and each named failure.

**Rationale:** Signalling failure through null, an empty collection, or a bare boolean forces every caller to guess which failure occurred.

## Conventions

### Keep forms typed (CLIENTDATA.CONVENTION.001)

**Default:** Bind a form to a typed model owned by its feature and map that model to an Application command on submission.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Binding to a Domain type or a dictionary loses the contract the form is meant to express.

### Prefer explicit refresh (CLIENTDATA.CONVENTION.002)

**Default:** Update the store from a command result rather than re-querying after success.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A component that polls spends work discovering something the result already told it.

## Verification

| ID | Method | Evidence |
|:---|:---|:---|
| CLIENTDATA.USECASE.001 | test | `ClientArchitectureTests` asserts no component resolves a Domain service or storage adapter. |
| CLIENTDATA.CLASSIFICATION.001 | inspection | Each specification introducing state names one of the three classifications. |
| CLIENTDATA.LOAD.001 | test | `StartupStateTests` asserts persisted state loads before the first content render. |
| CLIENTDATA.DERIVED.001 | inspection | Derived-value review locates one computation site for each value. |
| CLIENTDATA.VALIDATION.001 | test | `ValidationTests` asserts each form failure originates from its Application validator. |
| CLIENTDATA.RESULTS.001 | test | `HandlerResultTests` covers success and each named failure of every handler union. |
| CLIENTDATA.CONVENTION.001 | test | `FormContractTests` asserts each form binds a feature-owned model and maps to a command. |
| CLIENTDATA.CONVENTION.002 | inspection | Mutation review confirms the store updates from the result rather than a follow-up query. |
