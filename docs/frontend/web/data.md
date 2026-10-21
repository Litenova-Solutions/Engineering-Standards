# Web Data and State

## Intent

The frontend never holds its own copy of the API contract: it generates its client, types, schemas, and query options from the published OpenAPI document. This page states how the [React Stack](react/stack.md) and [Svelte Stack](svelte/stack.md) follow the data rules in [Frontend Data and State](../data.md): the generated client, failure mapping, refusals, form validation, cache updates, state ownership, and localized copy. A team that applies it while writing data code keeps every application consistent with the contract and every failure recoverable by the reader.

## Concepts

### The problem type

A failure from any source becomes one project-owned problem with the same fields. The page then decides what to show from one shape instead of handling each source separately.

```ts
type Problem = {
  status: number;
  code: string;
  detail: string;
  traceId?: string;
  fields: { field: string; code: string; message: string }[];
};
```

The `code` field is the discriminator: the page branches on which code arrived, not on a message that rewording can change. A code this build has never seen is still handled: the page branches on the code's presence rather than on a list of known codes. The client invents codes for what the API cannot answer. `failure/client.unreachable` names a request that received no response. `failure/client.unauthenticated` names a refused authentication. `failure/client.http_<status>` names a response status the client maps to no problem, with the status in place of `<status>`.

The problem carries the `traceId` the API returns for the request, or the `X-Trace-Id` response header when the body carries none. Every error the user sees shows that identifier in copyable form inside its detail, never as the headline, so the user can paste it to support without reading it as the message.

## React

Names and libraries that differ per stack. The React stack uses these values:

- The frame root, holding client configuration and cross-route values, is `src/app`.
- The client generator adds the `@tanstack/react-query` plugin.
- The component's own state is local component state.
- The dictionary library meets the locale-dictionary contract the localization rule states.
- The shared package's form entry point is its form hook.

## Svelte

The Svelte stack uses these values:

- The frame root, holding client configuration and cross-route values, is `src/lib/app`.
- The client generator adds the `@tanstack/svelte-query` plugin.
- The component's own state is a rune.
- The dictionary library is `svelte-i18n`, or machinery meeting the same contract.
- The shared package's form entry point is its form creator.

## Standards

### Generate the client from the published contract

**Requirement:** A workspace MUST generate its client, types, schemas, query options, and mutation options from the API's published OpenAPI document.

**Rationale:** A handwritten copy of a request, a response, or a schema drifts from the contract silently: the API changes and the copy still compiles. A generated client turns a contract change into a compile error in every application at once, so every affected call is fixed before anything ships. This realizes litespec/frontend/data#generate-the-client-from-the-published-contract.

**Example:** The generator emits the operation functions, the TanStack Query options, and the zod schemas, and the package exports each as its own entry point.

```json
{
  "plugins": ["@hey-api/client-fetch", "@hey-api/typescript", "@hey-api/sdk", "zod"]
}
```

Each stack adds the TanStack Query plugin its section names.

### Map every failure to one problem type

**Requirement:** A frontend MUST convert every failure into one problem type, deciding from its code and showing the `traceId` in copyable form in each error's detail.

**Rationale:** A raw response body shown to the user leaks whatever the API included and offers no consistent recovery path. Deciding from the code keeps each page's behavior stable across reworded messages, because a code is a published identifier. Showing the `traceId` in copyable form in the detail lets support find the exact request the user saw fail, without making an identifier the headline. This realizes litespec/frontend/data#map-every-failure-to-one-problem-type.

### Place a refusal beside what was refused

**Requirement:** A refusal MUST render beside the record or control that was refused, in the sentence the application holds for that code.

**Rationale:** A refusal at the top of a page says that something failed but not what. Rendered beside the record or control that was refused, in the application's own sentence for that code, it tells the user what was asked and denied. The code in the markup lets a browser test provoke that exact refusal by name. This realizes litespec/frontend/data#place-a-refusal-beside-what-was-refused.

**Example:** The refusal alert carries the code so a browser test can address it.

```tsx
<ProblemAlert error={mutation.error} describe={describe} />
```

```svelte
<ProblemAlert error={mutation.error} describe={describe} />
```

### Validate a form with the generated schema

**Requirement:** A form MUST validate against the generated schema for its request body, extended with the application's own rules rather than replaced by them.

**Rationale:** The generated schema is the contract, so validating against it holds the form to what the API accepts even where the browser accepts more. The application extends the schema with its required messages and any rule the contract cannot express, rather than replacing it with a restatement that drifts. A form validated only by hand restates the contract and breaks silently when the contract changes. This realizes litespec/frontend/data#validate-a-form-with-the-generated-schema.

**Example:** The generated schema gains one field rule in the application's words.

```ts
zRedeliverOrderRequestModel.extend({ reason: zRedeliverOrderRequestModel.shape.reason.trim().min(1, words.ui.required) })
```

### Update the cache a command changed

**Requirement:** A successful command MUST invalidate every query whose answer it changed, and no other query.

**Rationale:** The query cache owns freshness, so a command that changes a record must invalidate that record's queries: otherwise the page shows the old record until something else refetches. Invalidating no further matters too, because each unrelated invalidation costs a request on every affected page. Invalidating exactly the changed queries keeps reads fresh without wasted traffic. This realizes litespec/frontend/data#update-the-cache-a-command-changed.

**Example:** A mutation invalidates the TanStack Query entries its command changed, and no others.

### Assign state to the narrowest owner

**Requirement:** A value MUST live with the narrowest owner that can hold it: server data, then the address, then form state, then the component's own state.

**Rationale:** Each value has a narrowest owner that can hold it: server data in the cache, shared address state in the address, form input in form state, and anything else in the component's own state. A store above that order re-renders unrelated components on every change and hides where the value changes. The component's own state is local component state in React and a rune in Svelte. This realizes litespec/frontend/data#assign-state-to-the-narrowest-owner.

### Localize copy through locale dictionaries

**Requirement:** Copy MUST resolve through locale dictionaries with fill and plural support, one chunk per language, and typed keys with a declared fallback.

**Rationale:** One sentence copied into two components drifts at the first rewording. Locale dictionaries with fill and plural support keep one sentence in one place, one chunk per language keeps a reader's download to the language they read, and typed keys with a declared fallback fail a missing key where the fallback says instead of rendering nothing. This realizes litespec/frontend/data#localize-copy-through-locale-dictionaries.

**Example:** Each stack names its dictionary library in its section above. A workspace may carry its own dictionary machinery when it meets the same contract.

## Conventions

### Keep the client boundary in the frame

**Default:** Place the client configuration, problem mapping, and download helpers in the frame root, keeping them out of every use-case folder.

**Replacement:** A project departs from this default through an Exception record.

**Rationale:** Client configuration, problem mapping, and download helpers serve every use case, so they belong in the frame root rather than copied per folder. One place means a base-address or header change is one edit instead of one per application. The frame root is `src/app` in React and `src/lib/app` in Svelte. This realizes litespec/frontend/data#keep-the-client-boundary-in-the-frame.

### Regenerate the client rather than editing it

**Default:** Regenerate the client from the document with the workspace's `api:types` command, and edit nothing under the generated directory.

**Replacement:** A project departs from this default through an Exception record.

**Rationale:** The generated directory is output: a hand edit there works until the next generation overwrites it. Regenerating with the workspace's `api:types` command keeps the committed output provably equal to the document, and a reviewer reruns that command to check. This realizes litespec/frontend/data#regenerate-the-client-rather-than-editing-it.

### Build a form on the shared form library

**Default:** Build a form on the shared package's form entry point and its registered field components.

**Replacement:** A project departs from this default through an Exception record.

**Rationale:** A form library reached for directly in each use-case folder gives every folder its own idea of a field, and none of them knows how to show a refusal. Building on the shared package's form entry point and registered field components keeps every form's fields and refusal display identical. The entry point is the form hook in React and the form creator in Svelte. This realizes litespec/frontend/data#build-a-form-on-the-shared-form-library.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/frontend/web/data#generate-the-client-from-the-published-contract | checkable | `pnpm api:types` regenerates the client, and the contract check fails when the committed output differs. |
| litespec/frontend/web/data#map-every-failure-to-one-problem-type | guidance | Does every failure become one problem, with the `traceId` shown in the error detail? |
| litespec/frontend/web/data#place-a-refusal-beside-what-was-refused | guidance | Does each refusal render beside what was refused through the shared alert? |
| litespec/frontend/web/data#validate-a-form-with-the-generated-schema | guidance | Does a spec submit contract-invalid input and assert a client-side refusal? |
| litespec/frontend/web/data#update-the-cache-a-command-changed | guidance | Does each successful command invalidate the TanStack Query entries it changed and no others? |
| litespec/frontend/web/data#assign-state-to-the-narrowest-owner | guidance | Does each value live with the narrowest owner, using the stack's own component state? |
| litespec/frontend/web/data#localize-copy-through-locale-dictionaries | guidance | Does all copy resolve through the stack's dictionary library with fill, plurals, and a declared fallback? |
| litespec/frontend/web/data#keep-the-client-boundary-in-the-frame | guidance | Do the client configuration, problem mapping, and download helpers sit only in the frame root? |
| litespec/frontend/web/data#regenerate-the-client-rather-than-editing-it | checkable | `pnpm api:types` regenerates the client; committed output that differs from generated output fails the contract check. |
| litespec/frontend/web/data#build-a-form-on-the-shared-form-library | guidance | Is each form built on the shared package's form entry point and field components? |
