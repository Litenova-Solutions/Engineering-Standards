# Frontend Data and State

## Intent


The browser holds no contract of its own. It calls the API through one generated client, reads every answer through the query cache, and writes through a mutation.

Every failure arrives as one problem type with a stable code. The page branches on the code, and the words a person reads come from the application's own dictionary rather than from the response body.

## Agent Summary {#agent-summary}


- The client is generated from the published contract. (standards/rule/frontend-data.generate-the-client-from-the-published-contract)
- The session is an HTTP-only cookie the API holds. (standards/rule/frontend-data.keep-the-session-in-an-api-owned-cookie)
- Every write carries a marker header. (standards/rule/frontend-data.set-the-write-marker-on-every-request)
- Every failure becomes one problem type branched on its code. (standards/rule/frontend-data.map-every-failure-to-one-problem-type)
- A refusal appears beside what was refused. (standards/rule/frontend-data.place-a-refusal-beside-what-was-refused)
- A field refusal lands on its own field. (standards/rule/frontend-data.place-a-field-refusal-on-its-field)
- A form validates with the generated schema. (standards/rule/frontend-data.validate-a-form-with-the-generated-schema)
- A success invalidates what the command changed. (standards/rule/frontend-data.update-the-cache-a-command-changed)

## Concepts


### The three outcomes of a command

Every command ends in exactly one of three states, and a page handles all three.

| Outcome | What the page does |
|:---|:---|
| Success | Invalidates the queries the command changed, then says so where nothing else on screen shows it |
| Refusal | Renders the refusal beside what was refused, in the sentence the application holds for that code |
| Field refusal | Places each problem on the field it belongs to, leaving the form open |

A command that returns success and shows nothing has told nobody anything. A command that lists field problems above a long form makes the reader match each sentence to a field.

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

The code is the discriminator. Two codes invented by the client cover what the API cannot answer. One names a request that never left the browser. One names a response that was not a problem document. A code this build has never heard of is still handled, because the page branches on presence rather than on a list.

## Standards


### Generate the client from the published contract (standards/rule/frontend-data.generate-the-client-from-the-published-contract)

**Requirement:** A workspace MUST generate its client, types, schemas, query options, and mutation options from the API's published OpenAPI document.

**Rationale:** A handwritten copy of a request, a response, or a schema drifts from the contract silently. A generated one turns a contract change into a compile error in every application at once.

**Example:** The generator emits the operation functions, the TanStack Query options, and the zod schemas, and the package exports each as its own entry point.

```json
{
  "plugins": ["@hey-api/client-fetch", "@hey-api/typescript", "@hey-api/sdk", "zod", "@tanstack/react-query"]
}
```

### Use one configured client per application (standards/rule/frontend-data.use-one-configured-client-per-application)

**Requirement:** A frontend MUST configure the generated client once, and route every read and write through it.

**Rationale:** The client owns the base address, the credentials, the headers, and the mapping from a failure to a problem. A call that builds its own request opts out of all four.

### Keep the session in an API owned cookie (standards/rule/frontend-data.keep-the-session-in-an-api-owned-cookie)

**Requirement:** The API MUST hold the browser session in an HTTP-only cookie, and no frontend code may hold a token.

**Rationale:** Every value a script can read is a value any script on the page can read. The API runs the authorization code flow and keeps the tokens encrypted in the cookie. A refused sign-in lands on a signed-out page rather than on an error.

### Set the write marker on every request (standards/rule/frontend-data.set-the-write-marker-on-every-request)

**Requirement:** A client MUST send its marker header on every request, and the API accepts a cookie-authenticated write only when it is present.

**Rationale:** A browser sends its cookie on a cross-site request on its own, so the header separates a page's write from a forged post. A page on another site cannot add a custom header without a preflight the API never grants.

### Map every failure to one problem type (standards/rule/frontend-data.map-every-failure-to-one-problem-type)

**Requirement:** A frontend MUST convert every failure into one problem type, and decide what to show from its code.

**Rationale:** Displaying a raw response body leaks whatever the API included and gives the reader no consistent recovery path. A code is a published identifier, so a page's decision survives a reworded message.

### Place a refusal beside what was refused (standards/rule/frontend-data.place-a-refusal-beside-what-was-refused)

**Requirement:** A refusal MUST render beside the record or control that was refused, in the sentence the application holds for that code.

**Rationale:** A refusal at the top of a page says that something failed and nothing about what. The application's own sentence says what was asked, and the code in the markup lets a test provoke it by name.

**Example:** The refusal alert carries the code so a browser test can address it.

```tsx
<ProblemAlert error={mutation.error} describe={describe} />
```

### Place a field refusal on its field (standards/rule/frontend-data.place-a-field-refusal-on-its-field)

**Requirement:** A field problem MUST be applied to the field it names, and the form stays open until the problem is resolved or abandoned.

**Rationale:** A list of problems above a long form makes the reader read each sentence and each label to pair them.

### Validate a form with the generated schema (standards/rule/frontend-data.validate-a-form-with-the-generated-schema)

**Requirement:** A form MUST validate against the generated schema for its request body, extended with the application's own rules rather than replaced by them.

**Rationale:** The generated schema is the contract, so it holds even where the browser accepts more. An extension adds the required message and any rule the contract cannot express.

**Example:** The generated schema gains one field rule in the application's words.

```ts
zRedeliverOrderRequestModel.extend({ reason: zRedeliverOrderRequestModel.shape.reason.trim().min(1, words.ui.required) })
```

### Update the cache a command changed (standards/rule/frontend-data.update-the-cache-a-command-changed)

**Requirement:** A successful command MUST invalidate every query whose answer it changed, and no other query.

**Rationale:** The query cache owns freshness, so a command that changes a record and leaves its cache entry shows the old record until something else refetches. An unrelated invalidation costs a request per affected page.

### Assign state to the narrowest owner (standards/rule/frontend-data.assign-state-to-the-narrowest-owner)

**Requirement:** A value MUST live with the narrowest owner that can hold it, preferring server data, then the address, then form state, then local component state.

**Rationale:** A store placed above that order makes unrelated components re-render and hides where a value changes.

### Route a personal value in a header (standards/rule/frontend-data.route-a-personal-value-in-a-header)

**Requirement:** A value that names a person MUST travel in a request header rather than in the query string.

**Rationale:** A query string is written into a proxy log, the browser history, and the referrer of whatever the reader opens next. The address keeps its own copy, so a filtered list stays a link somebody can share.

### Read a permission from the session (standards/rule/frontend-data.read-a-permission-from-the-session)

**Requirement:** A page MUST decide whether to offer a command from the session's permission codes, and the API decides every command.

**Rationale:** The page avoids offering what would be refused, and the API refuses what is offered in error. A page hiding a control nobody may use makes the surface look thinner than the product is.

### Name the zone for every timestamp (standards/rule/frontend-data.name-the-zone-for-every-timestamp)

**Requirement:** A formatter rendering a timestamp MUST receive an explicit IANA time zone, resolved by the caller from the record the screen shows.

**Rationale:** An instant read out of the API carries no zone, so an implicit one would show a dispatch cut-off time in the reader's own city. A record with its own zone states it. Otherwise the account's zone applies, and an account that chose none falls back to UTC.

### Keep secrets out of browser storage (standards/rule/frontend-data.keep-secrets-out-of-browser-storage)

**Requirement:** A frontend MUST NOT store a refresh token, a provider secret, or a privileged credential in browser storage or a browser-visible variable.

**Rationale:** Local storage, session storage, IndexedDB, and a build-time public variable are each readable by any script on the page. A preference a reader chose is not a secret and may be stored under a named key in the frame.

### Make optimistic behavior recoverable (standards/rule/frontend-data.make-optimistic-behavior-recoverable)

**Requirement:** An optimistic update MUST declare its stable client identity, its conflict behavior, its failure rollback, and its reconciliation path.

**Rationale:** Money, irreversible actions, and uncertain authorization wait for the server result instead.

### Announce the outcome of an optimistic update (standards/rule/frontend-data.announce-the-outcome-of-an-optimistic-update)

**Requirement:** An optimistic update MUST announce its reconciled outcome through a live region when the server result differs from the value shown.

**Rationale:** A rollback is a silent visual change. A reader using a screen reader heard the optimistic value announced, and nothing tells them it was withdrawn. [The ARIA live-region technique](https://www.w3.org/WAI/WCAG21/Techniques/aria/ARIA19) is the mechanism, and a test of the route asserts the announcement.

## Conventions


### Keep the client boundary in the frame (standards/rule/frontend-data.keep-the-client-boundary-in-the-frame)

**Default:** Place the client configuration, the problem mapping, and the file download helpers in `src/app`, and keep them out of every use-case folder.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** One place configures the client, so a change to the base address or to the headers is one edit rather than one per application.

### Regenerate the client rather than editing it (standards/rule/frontend-data.regenerate-the-client-rather-than-editing-it)

**Default:** Regenerate the client from the document with the published command, and edit nothing under the generated directory.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A hand edit is overwritten by the next generation, so the change appears to work until it disappears. The named command is what a reviewer runs to prove the committed output matches the document.

### Keep schemas operation specific (standards/rule/frontend-data.keep-schemas-operation-specific)

**Default:** Keep a form schema or a view model in its owning use-case folder until a second use case needs it.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Moving a schema early creates a shared contract before its second consumer defines what it must satisfy.

### Build a form on the shared form library (standards/rule/frontend-data.build-a-form-on-the-shared-form-library)

**Default:** Build a form on the shared package's form hook and its registered field components.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A form library reached for directly in every use-case folder gives each folder its own idea of what a field is. None of them knows how to show a refusal.

## Reference example

This informative example demonstrates `standards/rule/frontend-data.place-a-field-refusal-on-its-field`, `standards/rule/frontend-data.update-the-cache-a-command-changed`, and `standards/rule/frontend-data.validate-a-form-with-the-generated-schema`.

A redelivery dialog holds one field. Submitting validates against the generated schema and applies any field problem back to that field. Success invalidates the order it changed and closes the dialog.

## Verification

| ID | Method | Evidence |
|:---|:---|:---|
| standards/rule/frontend-data.generate-the-client-from-the-published-contract | static | `pnpm api:types` regenerates the client and CI fails when the committed output differs. |
| standards/rule/frontend-data.use-one-configured-client-per-application | static | `grep -rn createClient packages/*/src` finds one call in the frame. |
| standards/rule/frontend-data.keep-the-session-in-an-api-owned-cookie | inspection | API review confirms the cookie is HTTP-only and no frontend file reads a token. |
| standards/rule/frontend-data.set-the-write-marker-on-every-request | static | The client configuration sets the marker header, and the frontend lint refuses a `fetch` in page code. |
| standards/rule/frontend-data.map-every-failure-to-one-problem-type | test | `src/problem.test.ts` asserts an unrecognised code still produces a problem with a status and a code. |
| standards/rule/frontend-data.place-a-refusal-beside-what-was-refused | test | An evidence specification addresses `[data-code="failure/..."]` after provoking a refusal. |
| standards/rule/frontend-data.place-a-field-refusal-on-its-field | inspection | Form review confirms each problem is applied through the shared helper rather than listed. |
| standards/rule/frontend-data.validate-a-form-with-the-generated-schema | static | `pnpm type-check` fails when a request body gains a field the generated schema omits. |
| standards/rule/frontend-data.update-the-cache-a-command-changed | inspection | Mutation review confirms each success names the keys it invalidates and nothing else. |
| standards/rule/frontend-data.assign-state-to-the-narrowest-owner | inspection | State review compares each stored value against the ownership order in this section. |
| standards/rule/frontend-data.route-a-personal-value-in-a-header | static | `grep -rn X-Shop-Contact packages/*/src` finds the header set beside the generated call. |
| standards/rule/frontend-data.read-a-permission-from-the-session | inspection | Review confirms each offered command is gated by a permission code from the session read. |
| standards/rule/frontend-data.name-the-zone-for-every-timestamp | test | `src/app/format.test.ts` asserts the same instant renders differently in two zones. |
| standards/rule/frontend-data.keep-secrets-out-of-browser-storage | static | `node standards/tools/validate-ui.mjs` reports a secret written to browser storage or a public variable. |
| standards/rule/frontend-data.make-optimistic-behavior-recoverable | inspection | Optimistic update review confirms each path rolls back and reconciles on failure. |
| standards/rule/frontend-data.announce-the-outcome-of-an-optimistic-update | test | `tests/e2e/` asserts a rejected optimistic update writes its outcome to the live region. |
| standards/rule/frontend-data.keep-the-client-boundary-in-the-frame | inspection | Folder review confirms the client configuration sits in `src/app` and in no use-case folder. |
| standards/rule/frontend-data.regenerate-the-client-rather-than-editing-it | inspection | The generated directory carries a header naming the generator, and no file in it names an author. |
| standards/rule/frontend-data.keep-schemas-operation-specific | operation | Schema review confirms each shared schema has two real readers. |
| standards/rule/frontend-data.build-a-form-on-the-shared-form-library | static | The frontend lint refuses a `form` element and a direct form library import in page code. |