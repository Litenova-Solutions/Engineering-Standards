# Frontend Data and State

## Intent

A LiteSpec frontend owns no API contract: it calls the API through one generated client, reads answers through the client's cache, and sends each write as a command, one message that changes business state. This page states how the client is built and configured, where each piece of state lives, and how every failure reaches the reader as one problem, a project-owned failure shape carrying a stable code. Frontend developers and agents apply it for every read, write, and form, so a contract change breaks the build instead of the running page and every failure renders a sentence the team wrote for it.

## Concepts

### The generated client

The API publishes one OpenAPI document. Generation turns it into the client the frontend calls: typed operations, request and response types, validation schemas, and the operation options each read and write needs. Because the output is generated, a contract change becomes a compile error in every application at once instead of a wrong request at runtime. The workspace configures the client once per application, with its base address, credentials, headers, and failure mapping, and every read and write passes through it.

The frame is the part of a frontend that holds everything cross-cutting, such as the client configuration and shared helpers ([Frontend Structure](structure.md)).

### Where state lives

Every value the frontend holds has one owner, from the widest to the narrowest: server data in the query cache, shareable values in the address, input in form state, and the rest in the component's own state. A value kept above its narrowest owner forces unrelated components to re-render and hides where the value changes.

### Outcomes of a command

Every command ends in one outcome. A page handles each outcome as the table states.

| Outcome | What the page does |
|:---|:---|
| Success | Invalidates the queries the command changes, then says so where nothing else on screen shows it |
| Refusal | Renders the refusal beside what was refused, in the sentence the application holds for that code |
| Field refusal | Places each problem on the field it belongs to, leaving the form open |

Success needs a visible answer wherever nothing else on screen shows it; a silent success tells the reader nothing happened. Field problems belong on their fields; a list above a long form forces the reader to match each sentence to a label.

### The problem type

Whatever produces a failure, whether a refused command, a failed read, or a network error, the frontend converts it into one project-owned problem carrying the same fields.

The problem carries a status, a code, a detail, an optional trace identifier, and field problems. Each field problem names its field and carries its own code and message.

The code is the stable identifier the page branches on, so a reworded message never breaks the page's decision. A code this build does not recognize is still handled: the page renders the problem by the code's presence rather than by matching a list of known codes.

The problem carries the trace identifier the API returns for the request, so support can find the failed request. Every visible error shows that identifier in copyable form in its detail, never as the headline.

## Standards

### Generate the client from the published contract

**Requirement:** A frontend MUST generate its client, types, schemas, and operation options from the API's published OpenAPI document.

**Rationale:** A handwritten copy of a request, a response, or a schema drifts from the contract silently: the API changes, the copy still compiles, and the page sends a request the API no longer accepts. A generated client turns the same contract change into a compile error in every application at once, at the call sites that must change.

### Use one configured client per application

**Requirement:** A frontend MUST configure the generated client once, and route every read and write through it.

**Rationale:** The configured client owns the base address, the credentials, the headers, and the mapping from a failure to a problem. A call that builds its own request opts out of all four at once: it can point at the wrong host, miss the session cookie, skip the write marker, and surface a raw failure the page cannot render. Routing every read and write through the one client keeps those four decisions in one place.

### Keep the session in an API owned cookie

**Requirement:** The API MUST hold the browser session in an HTTP-only cookie, with frontend code holding no token.

**Rationale:** Every value a script can read is a value any script on the page can read, including a script an attacker injected. Tokens kept in frontend code or browser storage are therefore readable by the same attack the session is meant to resist. The API runs the authorization code flow and keeps the tokens encrypted in an HTTP-only cookie the browser sends on its own, so frontend code never holds a token. A refused sign-in lands on a signed-out page rather than on an error, because the reader is simply not signed in.

### Set the write marker on every request

**Requirement:** A client MUST send its marker header on every write, with the API accepting a cookie-authenticated write only when it carries that header.

**Rationale:** A browser attaches its cookies to a cross-site request on its own, so the cookie alone cannot tell the page's own write from a forged post submitted from another site. The marker header separates the two: the page's client adds it to every write, and a page on another site cannot add a custom header without a preflight the API never grants. The API therefore accepts a cookie-authenticated write only when the header is present. The header name varies by project, so configuration owns it rather than code; it has the form `X-<Project>-Request` with the value `1`.

### Map every failure to one problem type

**Requirement:** A frontend MUST convert every failure into one problem type, deciding from its code and showing its trace identifier in copyable form.

**Rationale:** A raw response body carries whatever the API included: field names, internals, sometimes data the reader should never see. Rendering it leaks that content and gives the reader no consistent recovery path, because each failure looks different. One problem type gives every failure the same shape: the page branches on the published code, so its decision survives a reworded message, and the trace identifier in the detail lets support find the request the reader saw fail. The identifier stays out of the headline, which says what happened in words the team wrote.

### Place a refusal beside what was refused

**Requirement:** A refusal MUST render beside the record or control that was refused, in the sentence the application holds for that code.

**Rationale:** A refusal at the top of a page says that something failed but not what, so the reader scans the page to find the control that caused it. Rendered beside the refused record or control, the refusal answers both questions at once. The sentence comes from the application's own dictionary for that code rather than from the response body, so the words stay consistent and translatable; the code in the markup lets a test provoke the refusal by name.

**Example:** For example, submitting an expense above the receipt threshold with no receipt refuses with `failure/spending.receipt_missing` under `result/submit-expense.receipt-missing`. The page renders the application's sentence for that code beside the Submit control, with the code in the markup so a test can provoke it by name.

```svelte
{#if refusal?.code === 'failure/spending.receipt_missing'}
  <RefusalNotice code="failure/spending.receipt_missing">
    An expense above 25 EUR needs a receipt.
  </RefusalNotice>
{/if}
```

The sentence comes from the application's dictionary rather than the response body, and the trace identifier stays in the detail in copyable form.

### Place a field refusal on its field

**Requirement:** A field problem MUST reach the field it names through the frame's one helper, with the form staying open until resolved or abandoned.

**Rationale:** A list of problems above a long form forces the reader to read each sentence and each label to pair them, and a problem below the fold is missed entirely. The frame's one helper puts each problem on the field it names, so the reader sees what to fix where they fix it. The form stays open until each problem is resolved or the reader abandons the form, so no input is lost to a closed dialog.

### Validate a form with the generated schema

**Requirement:** A form MUST validate against the generated schema for its request body, extended with the application's own rules rather than replaced by them.

**Rationale:** The generated schema is the contract's statement of what the API accepts, so it holds even where the browser accepts more. Validating the form against it refuses bad input before the request leaves the page. The application extends the schema with the message shown for each rule and any rule the contract cannot express, rather than replacing it, so the form can never accept what the API refuses.

### Update the cache a command changed

**Requirement:** A successful command MUST invalidate every query whose answer it changed, and no other query.

**Rationale:** The query cache owns freshness: a page renders the cached answer, not a new request. A command that changes a record but leaves its cache entry therefore shows the old record until something else happens to refetch, so the reader's own write appears to have no effect. Invalidating exactly the queries the command changed refreshes what changed; invalidating more costs a needless request per affected page.

**Example:** The generated client in `packages/api/src/generated/sdk.gen.ts` holds both sides of one write. The expenses route calls `submitExpense({ amount: '42.50' })`, and the list reads through `listExpenses`.

```ts
export const submitExpense = (options) => (options.client ?? client).post({
    url: '/api/spending/submit-expense',
});

export const listExpenses = (options) => (options.client ?? client).get({
    url: '/api/spending/list-expenses',
});
```

After `submitExpense` succeeds, the page invalidates the `listExpenses` query and no other query, so the list shows the new expense without refetching unrelated pages.

### Assign state to the narrowest owner

**Requirement:** A value MUST live with the narrowest owner that can hold it: server data, then the address, then form state, then the component's own state.

**Rationale:** Server data belongs in the query cache, shareable values in the address, input in form state, and the rest in the component's own state. A value kept above its narrowest owner, typically in a shared store, makes unrelated components re-render when it changes and hides where the change came from. The order gives each value the smallest audience that can use it.

### Route a personal value in a header

**Requirement:** A value naming a person MUST travel in a request header rather than the query string, with the contract declaring the header each operation reads.

**Rationale:** A query string leaks: proxies log it, the browser keeps it in history, and the next page the reader opens receives it as the referrer. A value naming a person therefore travels in a request header the contract declares per operation, where it reaches the API without landing in those three places. The address keeps its own copy for filters and paging, so a filtered list stays a link somebody can share.

### Read a permission from the session

**Requirement:** A page MUST offer a command from the session Actor's Permissions at the record's scope, with the API deciding every command.

**Rationale:** Permissions are the project's Permission records: an actor holds a role at a scope, a role allows permissions, and a use case needs permissions. The page reads the signed-in actor's permission codes from the session the API returns, and offers only the commands those permissions allow at the record's scope, so the reader is never offered an action that ends in a refusal. The API still decides every command, so an offered action that should have been hidden is refused rather than executed.

### Name the zone for every timestamp

**Requirement:** A formatter rendering a timestamp MUST receive an explicit IANA time zone, resolved by the caller from the record the screen shows.

**Rationale:** An instant from the API carries no zone, so a formatter left to pick one shows the reader's own zone: a dispatch cut-off reads as midnight in the reader's city instead of the warehouse's. The caller resolves the zone from the record the screen shows: a record with its own zone states it, otherwise the account's zone applies, and an account that chooses none falls back to UTC. Passing the zone explicitly makes each timestamp name whose day it belongs to.

### Keep secrets out of browser storage

**Requirement:** A frontend MUST NOT store a refresh token, a provider secret, or a privileged credential in browser storage or a browser-visible variable.

**Rationale:** Local storage, session storage, IndexedDB, and a build-time public variable are all readable by any script on the page, so a secret kept there is available to the same injected script the secret is meant to resist. Refresh tokens, provider secrets, and privileged credentials therefore stay out of the browser entirely. A preference the reader chooses, such as a theme or a locale, is not a secret and can be stored under a named key in the frame.

### Make optimistic behavior recoverable

**Requirement:** An optimistic update MUST declare its stable client identity, its conflict behavior, its failure rollback, and its reconciliation path.

**Rationale:** An optimistic update shows a value the server has not confirmed. Without a stable client identity the retry after a failure creates a duplicate; without declared conflict behavior two writers overwrite each other silently; without a rollback path a failed update leaves the shown value wrong. Declaring identity, conflict behavior, rollback, and reconciliation up front makes each of those cases designed instead of improvised. Money, irreversible actions, and uncertain authorization skip optimism entirely and wait for the server result.

### Announce the outcome of an optimistic update

**Requirement:** An optimistic update MUST announce its reconciled outcome through a live region when the server result differs from the value shown.

**Rationale:** A rollback is a silent visual change: the shown value changes back with no event a screen reader announces. The reader heard the optimistic value confirmed and hears nothing when it is withdrawn, so they act on a value the server refused. Announcing the reconciled outcome through a live region tells them what actually holds. [The ARIA live-region technique](https://www.w3.org/WAI/WCAG21/Techniques/aria/ARIA19) is the mechanism, and a test of the route asserts the announcement.

### Localize copy through locale dictionaries

**Requirement:** Copy MUST resolve through locale dictionaries with fill and plural support, one chunk per language, and typed keys with a declared fallback.

**Rationale:** One sentence written in two components drifts at the first rewording, because the author finds one copy and misses the other. A dictionary per language keeps each sentence in one place, keyed by a typed key the compiler checks, with fill and plural support so variable content and counts render correctly in every language. One chunk per language keeps a reader's download to the language they read, and a key the catalog lacks fails where the declared fallback says it fails instead of rendering a raw key.

**Example:** A workspace may carry its own dictionary machinery when it meets the same contract.

## Conventions

### Keep the client boundary in the frame

**Default:** Place the client configuration, problem mapping, and download helpers in the frame root, keeping them out of every use-case folder.

**Replacement:** A project departs from this default through an Exception record.

**Rationale:** The client configuration, the problem mapping, and the download helpers serve every use case, so a copy in each use-case folder turns one change to the base address or the headers into an edit per folder, with the missed folder failing at runtime. The frame root holds them once, where every use case reaches them and no use case duplicates them.

### Regenerate the client rather than editing it

**Default:** Regenerate the client from the document, and edit nothing under the generated directory.

**Replacement:** A project departs from this default through an Exception record.

**Rationale:** A hand edit under the generated directory works until the next generation overwrites it, so the change appears sound and then silently disappears. Regenerating from the document keeps the committed output provably equal to the contract: a reviewer regenerates and compares, and any difference is either a contract change or an edit that must move out of the generated directory.

### Keep schemas operation specific

**Default:** Keep a form schema or a view model in its owning use-case folder until a second use case needs it.

**Replacement:** A project departs from this default through an Exception record.

**Rationale:** A schema shared before its second use case exists is a contract written for one reader. The second use case then either contorts itself to fit or breaks the first reader by changing the shared shape. Keeping a form schema or view model in its owning use-case folder until a second use case needs it lets the shared shape emerge from two real readers.

### Build a form on the shared form library

**Default:** Build a form on the shared package's form entry point and its registered field components.

**Replacement:** A project departs from this default through an Exception record.

**Rationale:** A form library used directly in every use-case folder gives each folder its own fields, its own validation wiring, and its own error display, and none of them knows how to show a refusal on its field. The shared package's form entry point and registered field components hold those decisions once, so every form validates, renders, and refuses the same way.

## Reference example

This informative example demonstrates `litespec/frontend/data#place-a-field-refusal-on-its-field`, `litespec/frontend/data#update-the-cache-a-command-changed`, and `litespec/frontend/data#validate-a-form-with-the-generated-schema`.

A redelivery dialog holds one field. Submitting validates against the generated schema and applies any field problem back to that field. Success invalidates the order it changes and closes the dialog.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/frontend/data#generate-the-client-from-the-published-contract | guidance | Is every client, type, schema, and operation option generated from the published contract? |
| litespec/frontend/data#use-one-configured-client-per-application | guidance | Does every read and write pass through the one configured client? |
| litespec/frontend/data#keep-the-session-in-an-api-owned-cookie | guidance | Does the API hold the session in an HTTP-only cookie with no token in frontend code? |
| litespec/frontend/data#set-the-write-marker-on-every-request | guidance | Does the client send the configured marker header on every write? |
| litespec/frontend/data#map-every-failure-to-one-problem-type | guidance | Does every failure become one problem, with the trace identifier shown in the error detail? |
| litespec/frontend/data#place-a-refusal-beside-what-was-refused | guidance | Does each refusal render beside what was refused, in the application's sentence for its code? |
| litespec/frontend/data#place-a-field-refusal-on-its-field | guidance | Does each field problem reach its field through the frame's helper, with the form left open? |
| litespec/frontend/data#validate-a-form-with-the-generated-schema | guidance | Does a spec submit contract-invalid input and assert a client-side refusal? |
| litespec/frontend/data#update-the-cache-a-command-changed | guidance | Does each successful command invalidate the queries it changed and no others? |
| litespec/frontend/data#assign-state-to-the-narrowest-owner | guidance | Does each value live with the narrowest owner the order allows? |
| litespec/frontend/data#route-a-personal-value-in-a-header | guidance | Does each person-naming value travel in its contract-declared header? |
| litespec/frontend/data#read-a-permission-from-the-session | guidance | Does each offered command follow the Actor's held Permissions, with the API deciding? |
| litespec/frontend/data#name-the-zone-for-every-timestamp | guidance | Does each timestamp formatter receive an explicit IANA zone from its caller? |
| litespec/frontend/data#keep-secrets-out-of-browser-storage | guidance | Is any secret or privileged credential kept out of browser storage and public variables? |
| litespec/frontend/data#make-optimistic-behavior-recoverable | guidance | Does each optimistic update declare identity, conflict behavior, rollback, and reconciliation? |
| litespec/frontend/data#announce-the-outcome-of-an-optimistic-update | guidance | Does a differing server result announce through a live region? |
| litespec/frontend/data#localize-copy-through-locale-dictionaries | guidance | Does all copy resolve through locale dictionaries with fill, plurals, and a declared fallback? |
| litespec/frontend/data#keep-the-client-boundary-in-the-frame | guidance | Do the client configuration, problem mapping, and download helpers sit only in the frame root? |
| litespec/frontend/data#regenerate-the-client-rather-than-editing-it | guidance | Is the committed client regenerated from the document with no hand edit under it? |
| litespec/frontend/data#keep-schemas-operation-specific | guidance | Does each shared schema serve two real readers? |
| litespec/frontend/data#build-a-form-on-the-shared-form-library | guidance | Is each form built on the shared package's form entry point and field components? |
