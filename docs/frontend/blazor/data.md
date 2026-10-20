# Blazor Data and State

## Intent

This page holds how the blazor stack realizes the Frontend data rules ([Frontend data](../data.md)). Every use case runs through Application. State carries a declared classification, loads once at startup, and reports failure explicitly rather than through an absent value.

## Standards

### Route use cases through Application

**Requirement:** A component MUST invoke an Application handler carrying a `Command` or `Query` role suffix rather than compose Domain calls or write storage.

**Rationale:** The handler is the one place a use case exists, so a component composing its own sequence creates a second definition.

### Classify state

**Requirement:** A specification introducing state MUST classify it as durable, device-local, or derived.

**Rationale:** Durable state is persisted, versioned, and exported. Device-local state is persisted but excluded from export. Derived state is computed from durable state and never persisted.

### Load persisted state once

**Requirement:** Persisted state MUST load once during startup into a typed store that components read from.

**Rationale:** A component reading storage on render turns every frame into an input-output call. A route renders its loading state until the store finishes loading.

### Keep derived values single-sourced

**Requirement:** A derived value MUST be computed in one place in Domain or Application and consumed everywhere else.

**Rationale:** Recomputing the same value in a component is a defect even when the result currently matches.

### Validate at the boundary

**Requirement:** Input validation MUST run in an Application validator returning a typed result.

**Rationale:** A form renders those results rather than restating the rules. A browser-side convenience check improves feedback but cannot be the only enforcement. This realizes litespec/frontend/data#validate-a-form-with-the-generated-schema.

### Make failure explicit

**Requirement:** An Application handler MUST return a typed result union covering success and each named failure.

**Rationale:** Signaling failure through null, an empty collection, or a bare boolean forces every caller to guess which failure occurred. This realizes litespec/frontend/data#map-every-failure-to-one-problem-type.

## Conventions

### Keep forms typed

**Default:** Bind a form to a typed model owned by its feature and map that model to an Application command on submission.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Binding to a Domain type or a dictionary loses the contract the form is meant to express. This realizes litespec/frontend/data#keep-schemas-operation-specific.

### Prefer explicit refresh

**Default:** Update the store from a command result rather than re-querying after success.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A component that polls spends work discovering something the result already told it. This realizes litespec/frontend/data#update-the-cache-a-command-changed.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/frontend/blazor/data#route-use-cases-through-application | guidance | Does any component resolve a Domain service or storage adapter? |
| litespec/frontend/blazor/data#classify-state | guidance | Does each specification introducing state name one classification? |
| litespec/frontend/blazor/data#load-persisted-state-once | guidance | Does persisted state load before the first render? |
| litespec/frontend/blazor/data#keep-derived-values-single-sourced | guidance | Does each derived value have one computation site? |
| litespec/frontend/blazor/data#validate-at-the-boundary | guidance | Does each form failure originate from its Application validator? |
| litespec/frontend/blazor/data#make-failure-explicit | guidance | Does each handler union cover success and every named failure? |
| litespec/frontend/blazor/data#keep-forms-typed | guidance | Does each form bind a feature-owned model and map to a command? |
| litespec/frontend/blazor/data#prefer-explicit-refresh | guidance | Does the store update from each result without a follow-up query? |
