# Frontend Data and State

## Intent


Frontend data flow should preserve the API contract, keep secrets on the server, and assign each state value to its narrowest durable owner. The baseline uses framework capabilities before introducing a client cache or shared state library.

## Agent Summary {#agent-summary}


- API types are generated from the committed contract. (standards/rule/frontend-data.generate-transport-types)
- One typed client per API boundary owns cross-cutting behavior. (standards/rule/frontend-data.use-one-typed-api-client)
- Initial data loads on the server. (standards/rule/frontend-data.read-initial-data-on-the-server)
- Mutations run through a declared server or browser boundary. (standards/rule/frontend-data.keep-mutations-at-a-declared-boundary)
- Problem Details map to one frontend error shape. (standards/rule/frontend-data.parse-errors-consistently)
- State sits with its narrowest owner. (standards/rule/frontend-data.assign-state-to-the-narrowest-owner)
- Forms match their use-case input and map field errors. (standards/rule/frontend-data.keep-forms-aligned-with-use-cases)
- Secrets never reach browser storage. (standards/rule/frontend-data.keep-secrets-out-of-browser-storage)
- Optimistic updates declare rollback and reconciliation. (standards/rule/frontend-data.make-optimistic-behavior-recoverable)

## Standards


### Generate transport types (standards/rule/frontend-data.generate-transport-types)

**Requirement:** A frontend MUST generate its TypeScript API types from the committed OpenAPI contract with the pinned generator.

**Rationale:** A handwritten copy of a request, response, enum, or Problem Details type drifts from the contract silently.

### Use one typed API client (standards/rule/frontend-data.use-one-typed-api-client)

**Requirement:** A frontend MUST create one `openapi-fetch` client per API boundary owning base URL, headers, authentication, correlation, and error parsing.

**Rationale:** Feature modules call that client instead of constructing their own requests, so the cross-cutting behavior applies once.

### Read initial data on the server (standards/rule/frontend-data.read-initial-data-on-the-server)

**Requirement:** Initial route data MUST load through a Server Component or a server-owned feature function.

**Rationale:** Server credentials and actor-specific token handling then stay outside browser bundles.

### Keep mutations at a declared boundary (standards/rule/frontend-data.keep-mutations-at-a-declared-boundary)

**Requirement:** A mutation MUST run through a Server Action or a typed browser request declared by its feature.

**Rationale:** Server Actions suit forms owned by a Next.js boundary. A typed browser request suits interactions needing immediate browser context.

### Parse errors consistently (standards/rule/frontend-data.parse-errors-consistently)

**Requirement:** A frontend MUST map API Problem Details into one error shape carrying status, stable code, trace identifier, field errors, and a safe fallback message.

**Rationale:** Displaying a raw response body leaks whatever the API included and gives the reader no consistent recovery path.

**Example:** Normalize the generated API error at the client boundary into this project-owned shape:

```ts
type ApiFieldError = {
  field: string
  code: string
  message: string
}

type ApiError = {
  status: number
  code: string
  message: string
  traceId?: string
  fieldErrors: ApiFieldError[]
}
```

Unknown or malformed responses become a safe `unexpected_error` value. The frontend preserves the trace ID for support but does not use the safe message as a discriminator.

### Assign state to the narrowest owner (standards/rule/frontend-data.assign-state-to-the-narrowest-owner)

**Requirement:** State MUST sit with its narrowest owner, preferring server data, then URL state, then form state, then local component state.

**Rationale:** A global store placed above that order makes unrelated components re-render and hides where a value changes.

### Keep forms aligned with use cases (standards/rule/frontend-data.keep-forms-aligned-with-use-cases)

**Requirement:** A form MUST match the use-case input and OpenAPI contract and map stable field error codes back to their fields.

**Rationale:** Domain invariants stay enforced by the API even when the browser gives earlier feedback.

**Example:** Server Actions return one serializable discriminated result rather than a `Response`, thrown provider value, or generated client object:

```ts
type ActionResult<T> =
  | { status: 'succeeded'; data: T }
  | { status: 'failed'; error: ApiError }
```

The example validates and map `FormData` on the server, then call the operation-specific typed API function. Disable repeat submission while pending. Refresh a route or cache tag only after success.

The example uses `updateTag` when a Server Action needs read-your-writes. The example uses `revalidatePath` for a route refresh. The example uses `revalidateTag` with the documented cache-life profile for stale-while-revalidate behavior. Client Components do not call these server APIs.

### Keep secrets out of browser storage (standards/rule/frontend-data.keep-secrets-out-of-browser-storage)

**Requirement:** A frontend MUST NOT store a refresh token, provider secret, or privileged credential in browser storage or a browser-visible variable.

**Rationale:** Local storage, session storage, IndexedDB, and public environment variables are all readable by any script on the page.

A variable is browser-visible when the framework inlines it into the client bundle, which the `NEXT_PUBLIC_` prefix does. Edge middleware and proxy code run on the server, so a server variable read there stays out of the bundle. A value that middleware passes to a client component leaves the server boundary. A header, a cookie, and a prop all cross it, so this rule applies to the value again.

### Make optimistic behavior recoverable (standards/rule/frontend-data.make-optimistic-behavior-recoverable)

**Requirement:** An optimistic update MUST declare its stable client identity, conflict behavior, failure rollback, and reconciliation path.

**Rationale:** Money, irreversible actions, and uncertain authorization wait for the server result instead.

### Announce the outcome of an optimistic update (standards/rule/frontend-data.announce-the-outcome-of-an-optimistic-update)

**Requirement:** An optimistic update MUST announce its reconciled outcome through a live region when the server result differs from the value shown.

**Rationale:** A rollback is a silent visual change. A reader using a screen reader saw the optimistic value announced, and nothing tells them it was withdrawn. [The ARIA live-region technique](https://www.w3.org/WAI/WCAG21/Techniques/aria/ARIA19) is the mechanism, and a test of the route asserts the announcement.

**Example:** A row reordered optimistically and rejected by the server announces that the order was restored, and names the reason the server gave.

## Conventions


### Use this API layout for one frontend (standards/rule/frontend-data.use-this-api-layout-for-one-frontend)

**Default:** Place the generated types, typed client, and error mapping under one API folder per frontend.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Example:**

```text
lib/
  api/
    client.ts
    problem-details.ts
features/
  posts/
    create-draft/
      create-draft-action.ts
    list-posts/
      get-posts.ts
```

The example moves the generated types and client to workspace packages only when more than one frontend consumes them.

### Keep schemas operation-specific (standards/rule/frontend-data.keep-schemas-operation-specific)

**Default:** Keep a form or view schema in its owning use-case folder until a second use case needs it.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Moving a schema early creates a shared contract before its second consumer defines what it must satisfy.

### Use native and framework form support first (standards/rule/frontend-data.use-native-and-framework-form-support-first)

**Default:** Use native form semantics, React action state, and small project-owned validation before adding a form package.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A complex repeated requirement may still justify an approved dependency and a local convention.

### Keep cache invalidation close to mutations (standards/rule/frontend-data.keep-cache-invalidation-close-to-mutations)

**Default:** Name the route, tag, or query data that a mutation invalidates inside the mutation function.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Invalidation scattered across components leaves no single place to read what a mutation affects.

### Generate mutable response types (standards/rule/frontend-data.generate-mutable-response-types)

**Default:** Run the pinned `openapi-typescript` generator without `--immutable`, so a response array reaches feature code as a plain array.

**Replacement:** A consumer can generate immutable types and convert each response collection at the client boundary, recorded as an explicit local convention.

**Rationale:** The pinned `openapi-fetch` release wraps an immutable array in a `Readable` type that carries no array methods, so `.map` on a response collection stops compiling. [The defect is open upstream](https://github.com/openapi-ts/openapi-typescript/issues/2615). The generator flag is the setting that reaches it, so the default names the flag rather than leaving each frontend to discover the interaction.

**Example:** A consumer that wants immutable types converts once, inside the typed client, rather than writing `Array.from` at each call site.

## Reference example

This informative example demonstrates `standards/rule/frontend-data.read-initial-data-on-the-server`, `standards/rule/frontend-data.assign-state-to-the-narrowest-owner`, and `standards/rule/frontend-data.keep-mutations-at-a-declared-boundary`.

A posts list reads on the server from the typed API client. Its search and cursor live in the URL. `CreateDraftForm` submits through a Server Action, maps Problem Details field errors, and refreshes the posts route after success.

## Verification


| ID | Method | Evidence |
|:---|:---|:---|
| standards/rule/frontend-data.generate-transport-types | static | The CI contract job reruns `openapi-typescript` and fails when the committed output differs. |
| standards/rule/frontend-data.use-one-typed-api-client | inspection | `ApiClientTests` asserts every API call routes through the single typed client per boundary. |
| standards/rule/frontend-data.read-initial-data-on-the-server | inspection | `DataBoundaryTests` asserts no initial route read runs in a client component. |
| standards/rule/frontend-data.keep-mutations-at-a-declared-boundary | inspection | `MutationBoundaryTests` asserts each mutation routes through its declared boundary. |
| standards/rule/frontend-data.parse-errors-consistently | inspection | `ErrorMappingTests` asserts each API failure produces the single frontend error shape. |
| standards/rule/frontend-data.assign-state-to-the-narrowest-owner | inspection | State review compares each stored value against the ownership order in this section. |
| standards/rule/frontend-data.keep-forms-aligned-with-use-cases | inspection | `FormContractTests` asserts each form field matches its contract and each field error maps to its input. |
| standards/rule/frontend-data.keep-secrets-out-of-browser-storage | inspection | `node standards/tools/validate-ui.mjs` reports a secret written to browser storage or a public variable. |
| standards/rule/frontend-data.make-optimistic-behavior-recoverable | inspection | `OptimisticUpdateTests` asserts each optimistic path rolls back and reconciles on failure. |
| standards/rule/frontend-data.announce-the-outcome-of-an-optimistic-update | test | `OptimisticUpdateTests` asserts a rejected optimistic update writes its reconciled outcome to the live region. |
| standards/rule/frontend-data.use-this-api-layout-for-one-frontend | inspection | Folder review compares each frontend API folder against the layout in this section. |
| standards/rule/frontend-data.keep-schemas-operation-specific | operation | Schema review confirms each shared schema has two real consumers. |
| standards/rule/frontend-data.use-native-and-framework-form-support-first | inspection | Dependency review records the repeated requirement behind any added form package. |
| standards/rule/frontend-data.keep-cache-invalidation-close-to-mutations | inspection | Mutation review confirms each function names the cache entries it invalidates. |
| standards/rule/frontend-data.generate-mutable-response-types | static | `pnpm type-check` compiles a `.map` call over a generated response collection without a conversion. |
