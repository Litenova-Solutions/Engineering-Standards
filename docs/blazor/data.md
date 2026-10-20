# Blazor Data and State

## Intent

Every use case runs through Application. State carries a declared classification, loads once at startup, and reports failure explicitly rather than through an absent value.

## Agent Summary {#agent-summary}

- A component invokes an Application handler, never Domain directly. (litespec/rule/blazor-data.route-use-cases-through-application)
- Every piece of state is durable, device-local, or derived. (litespec/rule/blazor-data.classify-state)
- Persisted state loads once into a typed store at startup. (litespec/rule/blazor-data.load-persisted-state-once)
- A derived value is computed in one place. (litespec/rule/blazor-data.keep-derived-values-single-sourced)
- Validation runs in an Application validator. (litespec/rule/blazor-data.validate-at-the-boundary)
- A handler returns a typed result covering each named failure. (litespec/rule/blazor-data.make-failure-explicit)

## Standards

### Route use cases through Application (litespec/rule/blazor-data.route-use-cases-through-application)

**Requirement:** A component MUST invoke an Application handler carrying a `Command` or `Query` role suffix rather than compose Domain calls or write storage.

**Rationale:** The handler is the one place a use case exists, so a component composing its own sequence creates a second definition.

### Classify state (litespec/rule/blazor-data.classify-state)

**Requirement:** A specification introducing state MUST classify it as durable, device-local, or derived.

**Rationale:** Durable state is persisted, versioned, and exported. Device-local state is persisted but excluded from export. Derived state is computed from durable state and never persisted.

### Load persisted state once (litespec/rule/blazor-data.load-persisted-state-once)

**Requirement:** Persisted state MUST load once during startup into a typed store that components read from.

**Rationale:** A component reading storage on render turns every frame into an input-output call. A route renders its loading state until the store finishes loading.

### Keep derived values single-sourced (litespec/rule/blazor-data.keep-derived-values-single-sourced)

**Requirement:** A derived value MUST be computed in one place in Domain or Application and consumed everywhere else.

**Rationale:** Recomputing the same value in a component is a defect even when the result currently matches.

### Validate at the boundary (litespec/rule/blazor-data.validate-at-the-boundary)

**Requirement:** Input validation MUST run in an Application validator returning a typed result.

**Rationale:** A form renders those results rather than restating the rules. A browser-side convenience check improves feedback but cannot be the only enforcement.

### Make failure explicit (litespec/rule/blazor-data.make-failure-explicit)

**Requirement:** An Application handler MUST return a typed result union covering success and each named failure.

**Rationale:** Signalling failure through null, an empty collection, or a bare boolean forces every caller to guess which failure occurred.

## Conventions

### Keep forms typed (litespec/rule/blazor-data.keep-forms-typed)

**Default:** Bind a form to a typed model owned by its feature and map that model to an Application command on submission.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Binding to a Domain type or a dictionary loses the contract the form is meant to express.

### Prefer explicit refresh (litespec/rule/blazor-data.prefer-explicit-refresh)

**Default:** Update the store from a command result rather than re-querying after success.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A component that polls spends work discovering something the result already told it.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/rule/blazor-data.route-use-cases-through-application | guidance | Does any component resolve a Domain service or storage adapter? |
| litespec/rule/blazor-data.classify-state | guidance | Does each specification introducing state name one classification? |
| litespec/rule/blazor-data.load-persisted-state-once | guidance | Does persisted state load before the first render? |
| litespec/rule/blazor-data.keep-derived-values-single-sourced | guidance | Does each derived value have one computation site? |
| litespec/rule/blazor-data.validate-at-the-boundary | guidance | Does each form failure originate from its Application validator? |
| litespec/rule/blazor-data.make-failure-explicit | guidance | Does each handler union cover success and every named failure? |
| litespec/rule/blazor-data.keep-forms-typed | guidance | Does each form bind a feature-owned model and map to a command? |
| litespec/rule/blazor-data.prefer-explicit-refresh | guidance | Does the store update from each result without a follow-up query? |
