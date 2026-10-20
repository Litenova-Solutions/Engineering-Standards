# Web Data and State

## Intent

This page holds how the TypeScript web frontends realize the Frontend data rules ([Frontend data](../data.md)). It states the generated client, the query cache behavior, and the tooling the React and Svelte stacks share. A provision here cites the neutral rule it realizes.

## Concepts

### The problem type

Every failure, whatever produced it, becomes one project-owned problem carrying the same fields.

```ts
type Problem = {
  status: number;
  code: string;
  detail: string;
  traceId?: string;
  fields: { field: string; code: string; message: string }[];
};
```

The code is the discriminator. The client invents codes for what the API cannot answer. `failure/client.unreachable` names a request that received no response, and `failure/client.unauthenticated` names a refused authentication. `failure/client.http_<status>` names a response status the client maps to no problem, with the status in place of `<status>`. A code this build has never heard of is still handled. The page branches on the code's presence rather than on a list of known codes.

The problem carries the `traceId` the API returns for the request. Every error the user sees shows that `traceId` in a copyable form in its detail, never as the headline. When the problem carries none, the client reads the `X-Trace-Id` response header instead.

## React

- The frame root is `src/app`.
- The client generator adds the `@tanstack/react-query` plugin.
- The component's own state is local component state.
- The dictionary library meets the locale-dictionary contract the rule below states.
- The shared package's form entry point is its form hook.

## Svelte

- The frame root is `src/lib/app`.
- The client generator adds the `@tanstack/svelte-query` plugin.
- The component's own state is a rune.
- The dictionary library is `svelte-i18n`, or machinery meeting the same contract.
- The shared package's form entry point is its form creator.

## Standards

### Generate the client from the published contract

**Requirement:** A workspace MUST generate its client, types, schemas, query options, and mutation options from the API's published OpenAPI document.

**Rationale:** A handwritten copy of a request, a response, or a schema drifts from the contract silently. A generated one turns a contract change into a compile error in every application at once. This realizes litespec/frontend/data#generate-the-client-from-the-published-contract.

**Example:** The generator emits the operation functions, the TanStack Query options, and the zod schemas, and the package exports each as its own entry point.

```json
{
  "plugins": ["@hey-api/client-fetch", "@hey-api/typescript", "@hey-api/sdk", "zod"]
}
```

Each stack adds the TanStack Query plugin its section names.

### Map every failure to one problem type

**Requirement:** A frontend MUST convert every failure into one problem type, deciding from its code and showing the `traceId` in copyable form in each error's detail.

**Rationale:** Displaying a raw response body leaks whatever the API included and gives the reader no consistent recovery path. A code is a published identifier, so a page's decision survives a reworded message. The `traceId` lets support find the request the reader saw fail. The `traceId` never serves as the headline. This realizes litespec/frontend/data#map-every-failure-to-one-problem-type.

### Place a refusal beside what was refused

**Requirement:** A refusal MUST render beside the record or control that was refused, in the sentence the application holds for that code.

**Rationale:** A refusal at the top of a page says that something failed and nothing about what. The application's own sentence says what was asked, and the code in the markup lets a test provoke it by name. This realizes litespec/frontend/data#place-a-refusal-beside-what-was-refused.

**Example:** The refusal alert carries the code so a browser test can address it.

```tsx
<ProblemAlert error={mutation.error} describe={describe} />
```

```svelte
<ProblemAlert error={mutation.error} describe={describe} />
```

### Validate a form with the generated schema

**Requirement:** A form MUST validate against the generated schema for its request body, extended with the application's own rules rather than replaced by them.

**Rationale:** The generated schema is the contract, so it holds even where the browser accepts more. An extension adds the required message and any rule the contract cannot express. This realizes litespec/frontend/data#validate-a-form-with-the-generated-schema.

**Example:** The generated schema gains one field rule in the application's words.

```ts
zRedeliverOrderRequestModel.extend({ reason: zRedeliverOrderRequestModel.shape.reason.trim().min(1, words.ui.required) })
```

### Update the cache a command changed

**Requirement:** A successful command MUST invalidate every query whose answer it changed, and no other query.

**Rationale:** The query cache owns freshness, so a command that changes a record and leaves its cache entry shows the old record until something else refetches. An unrelated invalidation costs a request per affected page. This realizes litespec/frontend/data#update-the-cache-a-command-changed.

**Example:** A mutation invalidates the TanStack Query entries its command changed, and no others.

### Assign state to the narrowest owner

**Requirement:** A value MUST live with the narrowest owner that can hold it: server data, then the address, then form state, then the component's own state.

**Rationale:** A store placed above that order makes unrelated components re-render and hides where a value changes. The component's own state is local component state in React and a rune in Svelte. This realizes litespec/frontend/data#assign-state-to-the-narrowest-owner.

### Localize copy through locale dictionaries

**Requirement:** Copy MUST resolve through locale dictionaries with fill and plural support, one chunk per language, and typed keys with a declared fallback.

**Rationale:** A second copy of one sentence in two components drifts at the first rewording. A dictionary per language keeps one sentence in one place, and a key the catalog lacks fails where the fallback says it fails. This realizes litespec/frontend/data#localize-copy-through-locale-dictionaries.

**Example:** Each stack names its dictionary library in its section above. A workspace may carry its own dictionary machinery when it meets the same contract.

## Conventions

### Keep the client boundary in the frame

**Default:** Place the client configuration, problem mapping, and download helpers in the frame root, keeping them out of every use-case folder.

**Replacement:** A project departs from this default through an Exception record.

**Rationale:** One place configures the client, so a change to the base address or to the headers is one edit rather than one per application. The frame root is `src/app` in React and `src/lib/app` in Svelte. This realizes litespec/frontend/data#keep-the-client-boundary-in-the-frame.

### Regenerate the client rather than editing it

**Default:** Regenerate the client from the document with the workspace's `api:types` command, and edit nothing under the generated directory.

**Replacement:** A project departs from this default through an Exception record.

**Rationale:** A hand edit is overwritten by the next generation, so the change appears to work until it disappears. The named command is what a reviewer runs to prove the committed output matches the document. This realizes litespec/frontend/data#regenerate-the-client-rather-than-editing-it.

### Build a form on the shared form library

**Default:** Build a form on the shared package's form entry point and its registered field components.

**Replacement:** A project departs from this default through an Exception record.

**Rationale:** A form library reached for directly in every use-case folder gives each folder its own idea of what a field is. None of them knows how to show a refusal. The shared package's form entry point is its form hook in React and its form creator in Svelte. This realizes litespec/frontend/data#build-a-form-on-the-shared-form-library.

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
