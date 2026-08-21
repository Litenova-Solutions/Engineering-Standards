# Data, Forms, and State

## Intent


Frontend data flow should preserve the API contract, keep secrets on the server, and assign each state value to its narrowest durable owner. The baseline uses framework capabilities before introducing a client cache or shared state library.

## Agent Summary {#agent-summary}


- Generate transport types. (DATA.TYPES.001)
- Use one typed API client. (DATA.CLIENT.001)
- Read initial data on the server. (DATA.READS.001)
- Keep mutations at a declared boundary. (DATA.MUTATIONS.001)
- Parse errors consistently. (DATA.ERRORS.001)
- Assign state to the narrowest owner. (STATE.OWNER.001)
- Keep forms aligned with use cases. (FORM.CONTRACT.001)
- Keep secrets out of browser storage. (DATA.SECRETS.001)
- Make optimistic behavior recoverable. (STATE.OPTIMISTIC.001)

## Standards


### Generate transport types (DATA.TYPES.001)

**Requirement:** Frontends MUST generate transport types.

**Rationale:** The implementation generates TypeScript API types from the committed OpenAPI contract with the pinned generator. The implementation does not handwrite copies of API request, response, enum, or Problem Details types.

A presentation view model may transform a generated transport type when the UI needs a different shape.

Coerce a generated field typed as a `number | string` union at the read or view-model boundary before arithmetic or formatting. This union correctly represents values that can exceed a JavaScript consumer's safe integer range, such as `int64`. The coercion belongs on the consumer side. For a small integer or decimal, fix an unnecessary string union at the source (`API.OPENAPI.002`).

### Use one typed API client (DATA.CLIENT.001)

**Requirement:** Frontends MUST use one typed API client.

**Rationale:** The implementation creates one `openapi-fetch` client per API boundary. It owns the base URL, standard headers, authentication integration, request correlation, and Problem Details parsing.

Feature modules call the client through operation-specific functions. They do not create ad hoc fetch wrappers.

### Read initial data on the server (DATA.READS.001)

**Requirement:** Frontends MUST read initial data on the server.

**Rationale:** The implementation uses Server Components or server-owned feature functions for initial route data. The implementation keeps server credentials and actor-specific token handling outside browser bundles.

The implementation uses client-side reads only when the use case requires browser-driven refresh, polling, or interaction that cannot remain server-owned.

### Keep mutations at a declared boundary (DATA.MUTATIONS.001)

**Requirement:** Frontends MUST keep mutations at a declared boundary.

**Rationale:** The implementation uses Server Actions for forms and mutations naturally owned by a Next.js server boundary. The implementation uses a typed browser request for client-only interactions that require immediate browser coordination.

Both paths use the generated API contract, return stable errors, and refresh or reconcile affected reads explicitly.

### Parse errors consistently (DATA.ERRORS.001)

**Requirement:** Frontends MUST parse errors consistently.

**Rationale:** The implementation maps API Problem Details into one frontend error shape containing status, stable code, trace ID, field errors. A safe fallback message.

The implementation does not display raw response bodies, exception details, or unknown provider messages.

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

### Assign state to the narrowest owner (STATE.OWNER.001)

**Requirement:** Frontends MUST assign state to the narrowest owner.

**Rationale:** State ownership follows this order:

1. Server data owned by the API and rendered on the server.
2. URL state for shareable filters, sorting, selection, and pagination.
3. Form state for submitted input and validation.
4. Component state for local interaction.
5. Client server-state cache after repeated browser reads require it.
6. Shared client state after unrelated branches coordinates non-server state.

The implementation does not copy server data into a shared client store as the default.

### Keep forms aligned with use cases (FORM.CONTRACT.001)

**Requirement:** Frontends MUST keep forms aligned with use cases.

**Rationale:** Form fields and structural validation match the use-case input and OpenAPI contract. Domain invariants remain enforced by the API and Domain even when the browser provides earlier feedback.

The form maps stable field errors to their controls and preserves user input after recoverable failure.

**Example:** Server Actions return one serializable discriminated result rather than a `Response`, thrown provider value, or generated client object:

```ts
type ActionResult<T> =
  | { status: 'succeeded'; data: T }
  | { status: 'failed'; error: ApiError }
```

The example validates and map `FormData` on the server, then call the operation-specific typed API function. Disable repeat submission while pending. Refresh a route or cache tag only after success.

The example uses `updateTag` when a Server Action needs read-your-writes. The example uses `revalidatePath` for a route refresh. The example uses `revalidateTag` with the documented cache-life profile for stale-while-revalidate behavior. Client Components do not call these server APIs.

### Keep secrets out of browser storage (DATA.SECRETS.001)

**Requirement:** Frontends MUST keep secrets out of browser storage.

**Rationale:** The implementation does not store refresh tokens, provider secrets, or privileged service credentials in local storage, session storage, IndexedDB, or browser-visible environment variables.

The implementation uses the frontend authentication extension when Next.js owns interactive login and session cookies.

### Make optimistic behavior recoverable (STATE.OPTIMISTIC.001)

**Requirement:** Frontends MUST make optimistic behavior recoverable.

**Rationale:** The implementation uses optimistic updates only when the operation has a stable client identity, conflict behavior, failure rollback, and reconciliation path. Money, irreversible actions, and uncertain authorization require server confirmation before presenting success.

## Conventions


### Use this API layout for one frontend (DATA.CONVENTION.001)

**Default:** Use this API layout for one frontend.

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

### Keep schemas operation-specific (DATA.CONVENTION.002)

**Default:** Keep schemas operation-specific.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** The implementation places a form or view schema in the owning use-case folder. The implementation moves it to module shared code only after another use case uses the same contract.

### Use native and framework form support first (DATA.CONVENTION.003)

**Default:** Use native and framework form support first.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** The implementation uses native form semantics, React action state, and small project-owned validation before adding a form package. A complex repeated form requirement may justify an approved dependency and local convention.

### Keep cache invalidation close to mutations (DATA.CONVENTION.004)

**Default:** Keep cache invalidation close to mutations.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** The mutation function names the route, tag, or query data it invalidates. The implementation does not scatter invalidation across unrelated components.

## Reference example

This informative example demonstrates `DATA.READS.001`, `STATE.OWNER.001`, and `DATA.MUTATIONS.001`.

A posts list reads on the server from the typed API client. Its search and cursor live in the URL. `CreateDraftForm` submits through a Server Action, maps Problem Details field errors, and refreshes the posts route after success.

## Verification


| ID | Method | Evidence |
|:---|:---|:---|
| DATA.TYPES.001 | static | Repository static check asserts `generate transport types` for the owning paths. |
| DATA.CLIENT.001 | inspection | Pull request review asserts `use one typed API client` in the owning specification and source paths. |
| DATA.READS.001 | inspection | Pull request review asserts `read initial data on the server` in the owning specification and source paths. |
| DATA.MUTATIONS.001 | inspection | Pull request review asserts `keep mutations at a declared boundary` in the owning specification and source paths. |
| DATA.ERRORS.001 | inspection | Pull request review asserts `parse errors consistently` in the owning specification and source paths. |
| STATE.OWNER.001 | inspection | Pull request review asserts `assign state to the narrowest owner` in the owning specification and source paths. |
| FORM.CONTRACT.001 | inspection | Pull request review asserts `keep forms aligned with use cases` in the owning specification and source paths. |
| DATA.SECRETS.001 | inspection | Pull request review asserts `keep secrets out of browser storage` in the owning specification and source paths. |
| STATE.OPTIMISTIC.001 | inspection | Pull request review asserts `make optimistic behavior recoverable` in the owning specification and source paths. |
| DATA.CONVENTION.001 | inspection | Pull request review asserts `use this API layout for one frontend` in the owning specification and source paths. |
| DATA.CONVENTION.002 | operation | The release record captures the observed `keep schemas operation-specific` result and owning operation. |
| DATA.CONVENTION.003 | inspection | Pull request review asserts `use native and framework form support first` in the owning specification and source paths. |
| DATA.CONVENTION.004 | inspection | Pull request review asserts `keep cache invalidation close to mutations` in the owning specification and source paths. |
