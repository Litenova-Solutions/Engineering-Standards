# Frontend Data and State

## Intent

The frontend holds no contract of its own. It calls the API through one generated client, reads every answer through its cache, and sends each write as a command.

Every failure arrives as one problem type with a stable code. The page branches on the code, and the words a person reads come from the application's own dictionary rather than from the response body.

## Agent Summary {#agent-summary}

- The client is generated from the published contract and configured once per application. (litespec/frontend/data#generate-the-client-from-the-published-contract, litespec/frontend/data#use-one-configured-client-per-application)
- The session is an HTTP-only cookie the API holds, and every write carries a marker header. (litespec/frontend/data#keep-the-session-in-an-api-owned-cookie, litespec/frontend/data#set-the-write-marker-on-every-request)
- Every failure becomes one problem type branched on its code, with refusals placed beside what was refused. (litespec/frontend/data#map-every-failure-to-one-problem-type, litespec/frontend/data#place-a-refusal-beside-what-was-refused, litespec/frontend/data#place-a-field-refusal-on-its-field)
- A form validates with the generated schema, and a success updates the cache it changed. (litespec/frontend/data#validate-a-form-with-the-generated-schema, litespec/frontend/data#update-the-cache-a-command-changed)
- State lives with its narrowest owner, personal values travel in headers, and commands follow session permissions. (litespec/frontend/data#assign-state-to-the-narrowest-owner, litespec/frontend/data#route-a-personal-value-in-a-header, litespec/frontend/data#read-a-permission-from-the-session)
- Timestamps name their zone and secrets stay out of browser storage. (litespec/frontend/data#name-the-zone-for-every-timestamp, litespec/frontend/data#keep-secrets-out-of-browser-storage)
- An optimistic update declares recovery and announces a differing outcome. (litespec/frontend/data#make-optimistic-behavior-recoverable, litespec/frontend/data#announce-the-outcome-of-an-optimistic-update)
- Copy resolves through locale dictionaries with fill and plural support. (litespec/frontend/data#localize-copy-through-locale-dictionaries)
- The client boundary sits in the frame, the client regenerates from the document, and schemas stay operation specific. (litespec/frontend/data#keep-the-client-boundary-in-the-frame, litespec/frontend/data#regenerate-the-client-rather-than-editing-it, litespec/frontend/data#keep-schemas-operation-specific)
- A form builds on the shared form library. (litespec/frontend/data#build-a-form-on-the-shared-form-library)

## Concepts

### Outcomes of a command

Every command ends in one outcome. A page handles each outcome as the table states.

| Outcome | What the page does |
|:---|:---|
| Success | Invalidates the queries the command changed, then says so where nothing else on screen shows it |
| Refusal | Renders the refusal beside what was refused, in the sentence the application holds for that code |
| Field refusal | Places each problem on the field it belongs to, leaving the form open |

A command that returns success and shows nothing has told nobody anything. A command that lists field problems above a long form makes the reader match each sentence to a field.

### The problem type

Every failure, whatever produced it, becomes one project-owned problem carrying the same fields.

The problem carries a status, a code, a detail, an optional trace identifier, and field problems. Each field problem names its field and carries its own code and message.

The code is the discriminator. A code this build has never heard of is still handled. The page branches on the code's presence rather than on a list of known codes.

The problem carries the trace identifier the API returns for the request. Every error the user sees shows that identifier in a copyable form in its detail, never as the headline.

## Standards

### Generate the client from the published contract

**Requirement:** A frontend MUST generate its client, types, schemas, and operation options from the API's published OpenAPI document.

**Rationale:** A handwritten copy of a request, a response, or a schema drifts from the contract silently. A generated one turns a contract change into a compile error in every application at once.

### Use one configured client per application

**Requirement:** A frontend MUST configure the generated client once, and route every read and write through it.

**Rationale:** The client owns the base address, the credentials, the headers, and the mapping from a failure to a problem. A call that builds its own request opts out of all four.

### Keep the session in an API owned cookie

**Requirement:** The API MUST hold the browser session in an HTTP-only cookie, with frontend code holding no token.

**Rationale:** Every value a script can read is a value any script on the page can read. The API runs the authorization code flow and keeps the tokens encrypted in the cookie. A refused sign-in lands on a signed-out page rather than on an error.

### Set the write marker on every request

**Requirement:** A client MUST send its marker header on every write, with the API accepting a cookie-authenticated write only when it carries that header.

**Rationale:** A browser sends its cookie on a cross-site request on its own, so the header separates a page's write from a forged post. A page on another site cannot add a custom header without a preflight the API never grants. The name varies by project, so configuration owns it rather than code. The header has the form `X-<Project>-Request` with the value `1`.

### Map every failure to one problem type

**Requirement:** A frontend MUST convert every failure into one problem type, deciding from its code and showing its trace identifier in copyable form.

**Rationale:** Displaying a raw response body leaks whatever the API included and gives the reader no consistent recovery path. A code is a published identifier, so a page's decision survives a reworded message. The trace identifier lets support find the request the reader saw fail. It never serves as the headline.

### Place a refusal beside what was refused

**Requirement:** A refusal MUST render beside the record or control that was refused, in the sentence the application holds for that code.

**Rationale:** A refusal at the top of a page says that something failed and nothing about what. The application's own sentence says what was asked, and the code in the markup lets a test provoke it by name.

### Place a field refusal on its field

**Requirement:** A field problem MUST reach the field it names through the frame's one helper, with the form staying open until resolved or abandoned.

**Rationale:** A list of problems above a long form makes the reader read each sentence and each label to pair them.

### Validate a form with the generated schema

**Requirement:** A form MUST validate against the generated schema for its request body, extended with the application's own rules rather than replaced by them.

**Rationale:** The generated schema is the contract, so it holds even where the browser accepts more. An extension adds the required message and any rule the contract cannot express.

### Update the cache a command changed

**Requirement:** A successful command MUST invalidate every query whose answer it changed, and no other query.

**Rationale:** The query cache owns freshness, so a command that changes a record and leaves its cache entry shows the old record until something else refetches. An unrelated invalidation costs a request per affected page.

### Assign state to the narrowest owner

**Requirement:** A value MUST live with the narrowest owner that can hold it: server data, then the address, then form state, then the component's own state.

**Rationale:** A store placed above that order makes unrelated components re-render and hides where a value changes.

### Route a personal value in a header

**Requirement:** A value naming a person MUST travel in a request header rather than the query string, with the contract declaring the header each operation reads.

**Rationale:** A query string is written into a proxy log, the browser history, and the referrer of whatever the reader opens next. The address keeps its own copy, so a filtered list stays a link somebody can share.

### Read a permission from the session

**Requirement:** A page MUST offer a command from the session Actor's Permissions at the record's scope, with the API deciding every command.

**Rationale:** Permissions are the project's Permission records: an Actor holds a Role at a scope, a Role allows Permissions, and a use case needs Permissions. The page reads the Actor's permission codes from the session the API returns for the signed-in Actor. The page avoids offering what would be refused, and the API refuses what is offered in error. A page hiding a control nobody may use makes the surface look thinner than the product is.

### Name the zone for every timestamp

**Requirement:** A formatter rendering a timestamp MUST receive an explicit IANA time zone, resolved by the caller from the record the screen shows.

**Rationale:** An instant read out of the API carries no zone, so an implicit one would show a dispatch cut-off time in the reader's own city. A record with its own zone states it. Otherwise the account's zone applies, and an account that chose none falls back to UTC.

### Keep secrets out of browser storage

**Requirement:** A frontend MUST NOT store a refresh token, a provider secret, or a privileged credential in browser storage or a browser-visible variable.

**Rationale:** Local storage, session storage, IndexedDB, and a build-time public variable are each readable by any script on the page. A preference a reader chose is not a secret and may be stored under a named key in the frame.

### Make optimistic behavior recoverable

**Requirement:** An optimistic update MUST declare its stable client identity, its conflict behavior, its failure rollback, and its reconciliation path.

**Rationale:** Money, irreversible actions, and uncertain authorization wait for the server result instead.

### Announce the outcome of an optimistic update

**Requirement:** An optimistic update MUST announce its reconciled outcome through a live region when the server result differs from the value shown.

**Rationale:** A rollback is a silent visual change. A reader using a screen reader heard the optimistic value announced, and nothing tells them it was withdrawn. [The ARIA live-region technique](https://www.w3.org/WAI/WCAG21/Techniques/aria/ARIA19) is the mechanism, and a test of the route asserts the announcement.

### Localize copy through locale dictionaries

**Requirement:** Copy MUST resolve through locale dictionaries with fill and plural support, one chunk per language, and typed keys with a declared fallback.

**Rationale:** A second copy of one sentence in two components drifts at the first rewording. A dictionary per language keeps one sentence in one place, and a key the catalog lacks fails where the fallback says it fails.

**Example:** A workspace may carry its own dictionary machinery when it meets the same contract.

## Conventions

### Keep the client boundary in the frame

**Default:** Place the client configuration, problem mapping, and download helpers in the frame root, keeping them out of every use-case folder.

**Replacement:** A project departs from this default through an Exception record.

**Rationale:** One place configures the client, so a change to the base address or to the headers is one edit rather than one per application.

### Regenerate the client rather than editing it

**Default:** Regenerate the client from the document, and edit nothing under the generated directory.

**Replacement:** A project departs from this default through an Exception record.

**Rationale:** A hand edit is overwritten by the next generation, so the change appears to work until it disappears. A reviewer regenerates the client to prove the committed output matches the document.

### Keep schemas operation specific

**Default:** Keep a form schema or a view model in its owning use-case folder until a second use case needs it.

**Replacement:** A project departs from this default through an Exception record.

**Rationale:** Moving a schema early creates a shared contract before its second consumer defines what it must satisfy.

### Build a form on the shared form library

**Default:** Build a form on the shared package's form entry point and its registered field components.

**Replacement:** A project departs from this default through an Exception record.

**Rationale:** A form library reached for directly in every use-case folder gives each folder its own idea of what a field is. None of them knows how to show a refusal.

## Reference example

This informative example demonstrates `litespec/frontend/data#place-a-field-refusal-on-its-field`, `litespec/frontend/data#update-the-cache-a-command-changed`, and `litespec/frontend/data#validate-a-form-with-the-generated-schema`.

A redelivery dialog holds one field. Submitting validates against the generated schema and applies any field problem back to that field. Success invalidates the order it changed and closes the dialog.

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
