# Data, Forms, and State

## Intent


Frontend data flow should preserve the API contract, keep secrets on the server, and assign each state value to its narrowest durable owner. The baseline uses framework capabilities before introducing a client cache or shared state library.

## Agent Summary {#agent-summary}


- API types are generated from the committed contract. (FRONTEND.DATA.TYPES.001)
- One typed client per API boundary owns cross-cutting behavior. (FRONTEND.DATA.CLIENT.001)
- Initial data loads on the server. (FRONTEND.DATA.READS.001)
- Mutations run through a declared server or browser boundary. (FRONTEND.DATA.MUTATIONS.001)
- Problem Details map to one frontend error shape. (FRONTEND.DATA.ERRORS.001)
- State sits with its narrowest owner. (FRONTEND.DATA.OWNER.001)
- Forms match their use-case input and map field errors. (FRONTEND.DATA.FORM.001)
- Secrets never reach browser storage. (FRONTEND.DATA.SECRETS.001)
- Optimistic updates declare rollback and reconciliation. (FRONTEND.DATA.OPTIMISTIC.001)

## Standards


### Generate transport types (FRONTEND.DATA.TYPES.001)

**Requirement:** A frontend MUST generate its TypeScript API types from the committed OpenAPI contract with the pinned generator.

**Rationale:** A handwritten copy of a request, response, enum, or Problem Details type drifts from the contract silently.

### Use one typed API client (FRONTEND.DATA.CLIENT.001)

**Requirement:** A frontend MUST create one `openapi-fetch` client per API boundary owning base URL, headers, authentication, correlation, and error parsing.

**Rationale:** Feature modules call that client instead of constructing their own requests, so the cross-cutting behavior applies once.

### Read initial data on the server (FRONTEND.DATA.READS.001)

**Requirement:** Initial route data MUST load through a Server Component or a server-owned feature function.

**Rationale:** Server credentials and actor-specific token handling then stay outside browser bundles.

### Keep mutations at a declared boundary (FRONTEND.DATA.MUTATIONS.001)

**Requirement:** A mutation MUST run through a Server Action or a typed browser request declared by its feature.

**Rationale:** Server Actions suit forms owned by a Next.js boundary. A typed browser request suits interactions needing immediate browser context.

### Parse errors consistently (FRONTEND.DATA.ERRORS.001)

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

### Assign state to the narrowest owner (FRONTEND.DATA.OWNER.001)

**Requirement:** State MUST sit with its narrowest owner, preferring server data, then URL state, then form state, then local component state.

**Rationale:** A global store placed above that order makes unrelated components re-render and hides where a value changes.

### Keep forms aligned with use cases (FRONTEND.DATA.FORM.001)

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

### Keep secrets out of browser storage (FRONTEND.DATA.SECRETS.001)

**Requirement:** A frontend MUST NOT store a refresh token, provider secret, or privileged credential in browser storage or a browser-visible variable.

**Rationale:** Local storage, session storage, IndexedDB, and public environment variables are all readable by any script on the page.

### Make optimistic behavior recoverable (FRONTEND.DATA.OPTIMISTIC.001)

**Requirement:** An optimistic update MUST declare its stable client identity, conflict behavior, failure rollback, and reconciliation path.

**Rationale:** Money, irreversible actions, and uncertain authorization wait for the server result instead.

## Conventions


### Use this API layout for one frontend (FRONTEND.DATA.CONVENTION.001)

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

### Keep schemas operation-specific (FRONTEND.DATA.CONVENTION.002)

**Default:** Keep a form or view schema in its owning use-case folder until a second use case needs it.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Moving a schema early creates a shared contract before its second consumer defines what it must satisfy.

### Use native and framework form support first (FRONTEND.DATA.CONVENTION.003)

**Default:** Use native form semantics, React action state, and small project-owned validation before adding a form package.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A complex repeated requirement may still justify an approved dependency and a local convention.

### Keep cache invalidation close to mutations (FRONTEND.DATA.CONVENTION.004)

**Default:** Name the route, tag, or query data that a mutation invalidates inside the mutation function.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Invalidation scattered across components leaves no single place to read what a mutation affects.

## Reference example

This informative example demonstrates `FRONTEND.DATA.READS.001`, `FRONTEND.DATA.OWNER.001`, and `FRONTEND.DATA.MUTATIONS.001`.

A posts list reads on the server from the typed API client. Its search and cursor live in the URL. `CreateDraftForm` submits through a Server Action, maps Problem Details field errors, and refreshes the posts route after success.

## Verification


| ID | Method | Evidence |
|:---|:---|:---|
| FRONTEND.DATA.TYPES.001 | static | The CI contract job reruns `openapi-typescript` and fails when the committed output differs. |
| FRONTEND.DATA.CLIENT.001 | inspection | `ApiClientTests` asserts every API call routes through the single typed client per boundary. |
| FRONTEND.DATA.READS.001 | inspection | `DataBoundaryTests` asserts no initial route read runs in a client component. |
| FRONTEND.DATA.MUTATIONS.001 | inspection | `MutationBoundaryTests` asserts each mutation routes through its declared boundary. |
| FRONTEND.DATA.ERRORS.001 | inspection | `ErrorMappingTests` asserts each API failure produces the single frontend error shape. |
| FRONTEND.DATA.OWNER.001 | inspection | State review compares each stored value against the ownership order in this section. |
| FRONTEND.DATA.FORM.001 | inspection | `FormContractTests` asserts each form field matches its contract and each field error maps to its input. |
| FRONTEND.DATA.SECRETS.001 | inspection | `node standards/tools/validate-ui.mjs` reports a secret written to browser storage or a public variable. |
| FRONTEND.DATA.OPTIMISTIC.001 | inspection | `OptimisticUpdateTests` asserts each optimistic path rolls back and reconciles on failure. |
| FRONTEND.DATA.CONVENTION.001 | inspection | Folder review compares each frontend API folder against the layout in this section. |
| FRONTEND.DATA.CONVENTION.002 | operation | Schema review confirms each shared schema has two real consumers. |
| FRONTEND.DATA.CONVENTION.003 | inspection | Dependency review records the repeated requirement behind any added form package. |
| FRONTEND.DATA.CONVENTION.004 | inspection | Mutation review confirms each function names the cache entries it invalidates. |
