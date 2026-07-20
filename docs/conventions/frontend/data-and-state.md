# Data, Forms, and State

## Intent

Frontend data flow should preserve the API contract, keep secrets on the server, and assign each state value to its narrowest durable owner. The baseline uses framework capabilities before introducing a client cache or shared state library.

## Agent Summary {#agent-summary}

- Generate API types from committed OpenAPI and call the API through one typed client.
- Use Server Components for initial reads and server-owned credentials.
- Keep form validation aligned with API and use-case rules without duplicating domain invariants.
- Use URL state for shareable navigation state and component state for local interaction.
- Add client caches or shared stores only from a documented requirement and approved dependency.
- Parse Problem Details into one frontend error model.
- Keep refresh tokens and privileged credentials out of browser storage.

## Standards

### Generate transport types (DATA.TYPES.001)

Generate TypeScript API types from the committed OpenAPI contract with the pinned generator. Do not handwrite copies of API request, response, enum, or Problem Details types.

A presentation view model may transform a generated transport type when the UI needs a different shape.

### Use one typed API client (DATA.CLIENT.001)

Create one `openapi-fetch` client per API boundary. It owns the base URL, standard headers, authentication integration, request correlation, and Problem Details parsing.

Feature modules call the client through operation-specific functions. They do not create ad hoc fetch wrappers.

### Read initial data on the server (DATA.READS.001)

Use Server Components or server-owned feature functions for initial route data. Keep server credentials and actor-specific token handling outside browser bundles.

Use client-side reads only when the use case requires browser-driven refresh, polling, or interaction that cannot remain server-owned.

### Keep mutations at a declared boundary (DATA.MUTATIONS.001)

Use Server Actions for forms and mutations naturally owned by a Next.js server boundary. Use a typed browser request for client-only interactions that require immediate browser coordination.

Both paths use the generated API contract, return stable errors, and refresh or reconcile affected reads explicitly.

### Parse errors consistently (DATA.ERRORS.001)

Map API Problem Details into one frontend error shape containing status, stable code, trace ID, field errors, and a safe fallback message.

Do not display raw response bodies, exception details, or unknown provider messages.

Normalize the generated API error at the client boundary into this project-owned shape:

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

Unknown or malformed responses become a safe `unexpected_error` value. Preserve the trace ID for support, but do not use the safe message as a programmatic discriminator.

### Assign state to the narrowest owner (STATE.OWNER.001)

Choose state in this order:

1. Server data owned by the API and rendered on the server.
2. URL state for shareable filters, sorting, selection, and pagination.
3. Form state for submitted input and validation.
4. Component state for local interaction.
5. Client server-state cache after repeated browser reads require it.
6. Shared client state after unrelated branches must coordinate non-server state.

Do not copy server data into a shared client store as the default.

### Keep forms aligned with use cases (FORM.CONTRACT.001)

Form fields and structural validation match the use-case input and OpenAPI contract. Domain invariants remain enforced by the API and Domain even when the browser provides earlier feedback.

The form maps stable field errors to their controls and preserves user input after recoverable failure.

Server Actions return one serializable discriminated result rather than a `Response`, thrown provider value, or generated client object:

```ts
type ActionResult<T> =
  | { status: 'succeeded'; data: T }
  | { status: 'failed'; error: ApiError }
```

Validate and map `FormData` on the server, then call the operation-specific typed API function. Disable repeat submission while pending. Refresh a route or cache tag only after success. Use `updateTag` inside a Server Action when the next read in that action requires read-your-writes, `revalidatePath` for a route refresh, and `revalidateTag` with the documented cache-life profile for stale-while-revalidate behavior. Client Components do not call these server APIs.

### Keep secrets out of browser storage (DATA.SECRETS.001)

Do not store refresh tokens, provider secrets, or privileged service credentials in local storage, session storage, IndexedDB, or browser-visible environment variables.

Use the frontend authentication extension when Next.js owns interactive login and session cookies.

### Make optimistic behavior recoverable (STATE.OPTIMISTIC.001)

Use optimistic updates only when the operation has a stable client identity, conflict behavior, failure rollback, and reconciliation path. Money, irreversible actions, and uncertain authorization require server confirmation before presenting success.

## Conventions

### Use this API layout for one frontend

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

Move the generated types and client to workspace packages only when more than one frontend consumes them.

### Keep schemas operation-specific

Place a form or view schema in the owning use-case folder. Move it to subject shared code only after another use case uses the same contract.

### Use native and framework form support first

Use native form semantics, React action state, and small project-owned validation before adding a form package. A complex repeated form requirement may justify an approved dependency and local convention.

### Keep cache invalidation close to mutations

The mutation function names the route, tag, or query data it invalidates. Do not scatter invalidation across unrelated components.

## Examples

A posts list reads on the server from the typed API client. Its search and cursor live in the URL. `CreateDraftForm` submits through a Server Action, maps Problem Details field errors, and refreshes the posts route after success.

## Verification

- Compare generated types with OpenAPI output.
- Search for handwritten API transport types and direct ad hoc fetch clients.
- Search for direct `process.env` and browser token storage.
- Inspect each shared store or client cache for a documented requirement.
- Test form success, field errors, global errors, duplicate submission, and recovery.
- Test malformed non-Problem-Details responses and trace-ID presentation for support.
- Test optimistic rollback and reconciliation when optimistic behavior exists.
