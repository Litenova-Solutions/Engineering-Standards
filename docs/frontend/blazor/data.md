# Blazor Data and State

## Intent

Data handling in a Blazor client routes every use case, one command or query carrying out a user task, through an Application handler, the one place where that use case is defined. Every piece of state carries a declared classification deciding whether it is persisted, exported, or recomputed. This page states how that handling follows the data rules in [Frontend Data and State](../data.md): routing through handlers, classifying state, loading persisted state once, single-sourcing derived values, validating at the boundary, and returning typed failures. A team that applies it while writing handlers and forms keeps one definition of each use case and one source of each value.

## Concepts

### The three state classifications

Durable state is what the user made: persisted, versioned, and exported. The shop cart is durable state, because the user built it and it must survive a restart and an export. Device-local state is persisted but stays on the device, excluded from export. Derived state is computed from durable state and never persisted: a cart total is derived from the cart lines each time it is read.

## Standards

### Route use cases through Application

**Statement:** A component MUST invoke an Application handler carrying a `Command` or `Query` role suffix rather than compose Domain calls or write storage.

**Rationale:** The handler is the one place a use case exists: its validation, its rules, and its result. A component that composes its own sequence of Domain calls and storage writes creates a second definition that no specification names and no test pins down. Routing every use case through a handler keeps the component a caller and the handler the definition.

### Classify state

**Statement:** A specification introducing state MUST classify it as durable, device-local, or derived.

**Rationale:** The classification decides what happens to the state: durable state is persisted, versioned, and exported, device-local state is persisted but excluded from export, and derived state is never persisted. Without a declared classification each reader guesses, and a value the user made can end up unpersisted while a computed value ends up stored and stale.

### Load persisted state once

**Statement:** Persisted state MUST load once during startup into a typed store that components read from.

**Rationale:** Storage reads are slow and fallible, so the product reads once at startup into a typed store that components read from. A component that reads storage on render pays an input-output call per frame and can render half-loaded state. A route renders its loading state until the store finishes loading, so it never shows an unloaded store as ready.

### Keep derived values single-sourced

**Statement:** A derived value MUST be computed in one place in Domain or Application and consumed everywhere else.

**Rationale:** A value computed in two places agrees only until one computation changes. The component copy then shows a different answer from the handler copy with no error anywhere. One computation in Domain or Application, consumed everywhere else, keeps every reader on the same answer.

### Validate at the boundary

**Statement:** Input validation MUST run in an Application validator returning a typed result.

**Rationale:** The Application validator is the one place the input rules live, and its typed results are what the form renders. A form that restates the rules drifts from them on the first change. A browser-side convenience check can improve feedback, but it cannot be the only enforcement, because anything that skips the form skips the check. This realizes litespec/frontend/data#validate-a-form-with-the-generated-schema.

### Make failure explicit

**Statement:** An Application handler MUST return a typed result union covering success and each named failure.

**Rationale:** Signaling failure through `null`, an empty collection, or a bare boolean tells the caller that something failed but not what. Every caller then guesses, and two callers guess differently. A typed result union names success and each failure, so each caller handles each named case. This realizes litespec/frontend/data#map-every-failure-to-one-problem-type.

## Conventions

### Keep forms typed

**Default:** Bind a form to a typed model owned by its feature and map that model to an Application command on submission.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A typed model states what the form collects, and the mapping to a command states what submitting it means. Binding to a Domain type couples the form to the core model, while binding to a dictionary hides the contract entirely. Either way the next author learns the shape by reading the markup instead of the type. This realizes litespec/frontend/data#keep-schemas-operation-specific.

### Prefer explicit refresh

**Default:** Update the store from a command result rather than re-querying after success.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** The command result already carries the new state, so the store can apply it directly. A component that re-queries after success spends a read discovering what the result already said, and the extra read can return a different answer if anything changed between the two. This realizes litespec/frontend/data#update-the-cache-a-command-changed.

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
