# Frontend Data and State

## Intent

A LiteSpec frontend owns no API contract: it calls the API through one generated client, reads answers through the client's cache, and sends each write as a command, one message that changes business state. This page states how the client is built and configured, where each piece of state lives, and how every failure reaches the reader as one problem, a project-owned failure shape carrying a stable code. Frontend developers and agents apply it for every read, write, and form, so a contract change breaks the build instead of the running page and every failure renders a sentence the team wrote for it.

## Concepts

### The Generated Client

The API publishes one OpenAPI document. Generation turns it into the client the frontend calls: typed operations, request and response types, validation schemas, and the operation options each read and write needs. Because the output is generated, a contract change becomes a compile error in every application at once instead of a wrong request at runtime. The workspace configures the client once per application, with its base address, credentials, headers, and failure mapping, and every read and write passes through it.

The frame is the part of a frontend that holds everything cross-cutting, such as the client configuration and shared helpers ([Frontend Structure](structure.md)).

### Where State Lives

Every value the frontend holds has one owner, from the widest to the narrowest: server data in the query cache, shareable values in the address, input in form state, and the rest in the component's own state. A value kept above its narrowest owner forces unrelated components to re-render and hides where the value changes.

### Outcomes of a Command

Every command ends in one outcome. A page handles each outcome as the table states.

| Outcome | What the page does |
|:---|:---|
| Success | Invalidates the queries the command changes, then says so where nothing else on screen shows it |
| Refusal | Renders the refusal beside what was refused, in the sentence the application holds for that code |
| Field refusal | Places each problem on the field it belongs to, leaving the form open |

Success carries a visible answer wherever nothing else on screen shows it; a silent success tells the reader nothing happened. Field problems belong on their fields; a list above a long form forces the reader to match each sentence to a label.

### The Problem Type

Whatever produces a failure, whether a refused command, a failed read, or a network error, the frontend converts it into one project-owned problem carrying the same fields.

The problem carries a status, a code, a detail, an optional trace identifier, and field problems. Each field problem names its field and carries its own code and message.

The code is the stable identifier the page branches on, so a reworded message leaves the page's decision unchanged. A code this build does not recognize is still handled: the page renders the problem by the code's presence rather than by matching a list of known codes.

The problem carries the trace identifier the API returns for the request, so support can find the failed request. Every visible error shows that identifier in copyable form in its detail; the headline carries what happened in words.

## Standards

### Generate the Client from the Published Contract

**Statement:** A frontend MUST generate its client, types, schemas, and operation options from the API's published OpenAPI document.

**Rationale:** A handwritten copy of a request, a response, or a schema drifts from the contract silently: the API changes, the copy still compiles, and the page sends a request the API no longer accepts. A generated client turns the same contract change into a compile error in every application at once, at every call site the change affects.

### Use One Configured Client per Application

**Statement:** A frontend MUST configure the generated client once, and route every read and write through it.

**Rationale:** The configured client owns the base address, the credentials, the headers, and the mapping from a failure to a problem. A call that builds its own request opts out of all four at once: it can point at the wrong host, miss the session cookie, skip the write marker, and surface a raw failure outside the page's problem shape. Routing every read and write through the one client keeps those four decisions in one place.

### Keep the Session in an API Owned Cookie

**Statement:** The API MUST hold the browser session in an HTTP-only cookie, with frontend code holding no token.

**Rationale:** Every value a script can read is a value any script on the page can read, including a script an attacker injected. Tokens kept in frontend code or browser storage are therefore readable by the same attack the session is meant to resist. The API runs the authorization code flow and keeps the tokens encrypted in an HTTP-only cookie the browser sends on its own, so frontend code holds no token. A refused sign-in lands on a signed-out page rather than on an error, because the reader is simply not signed in.

### Set the Write Marker on Every Request

**Statement:** A client MUST send its marker header on every write, with the API accepting a cookie-authenticated write only when it carries that header.

**Rationale:** A browser attaches its cookies to a cross-site request on its own, so the cookie alone fails to distinguish the page's own write from a forged post submitted from another site. The marker header separates the two: the page's client adds it to every write, and a page on another site adds no custom header without a preflight, which the API grants to no foreign origin. The API therefore accepts a cookie-authenticated write only when the header is present. The header name varies by project, so configuration owns it rather than code; it has the form `X-<Project>-Request` with the value `1`.

### Map Every Failure to One Problem Type

**Statement:** A frontend MUST convert every failure into one problem type, deciding from its code and showing its trace identifier in copyable form.

**Rationale:** A raw response body carries whatever the API included: field names, internals, sometimes data kept from the reader. Rendering it leaks that content and gives the reader no consistent recovery path, because each failure looks different. One problem type gives every failure the same shape: the page branches on the published code, so its decision survives a reworded message, and the trace identifier in the detail lets support find the request the reader saw fail. The identifier stays out of the headline, which says what happened in words the team wrote.

### Place a Refusal Beside What Was Refused

**Statement:** A refusal MUST render beside the record or control that was refused, in the sentence the application holds for that code.

**Rationale:** A refusal at the top of a page says that something failed but not what, so the reader scans the page to find the control that caused it. Rendered beside the refused record or control, the refusal answers both questions at once. The sentence comes from the application's own dictionary for that code rather than from the response body, so the words stay consistent and translatable; the code in the markup lets a test provoke the refusal by name.

**Example:** Submitting an expense above the receipt threshold with no receipt refuses with `spending.receipt-missing` under `result/submit-expense.receipt-missing`. The page renders the application's sentence for that code beside the Submit control, carries the code in the markup so a test provokes it by name, and keeps the trace identifier in the detail in copyable form.

### Place a Field Refusal on Its Field

**Statement:** A field problem MUST reach the field it names through the frame's one helper, with the form staying open until resolved or abandoned.

**Rationale:** A list of problems above a long form forces the reader to read each sentence and each label to pair them, and a problem below the fold is missed entirely. The frame's one helper puts each problem on the field it names, so the reader sees what to fix where they fix it. The form stays open until each problem is resolved or the reader abandons the form, so no input is lost to a closed dialog.

### Validate a Form with the Generated Schema

**Statement:** A form MUST validate against the generated schema for its request body, extended with the application's own rules rather than replaced by them.

**Rationale:** The generated schema is the contract's statement of what the API accepts, so it holds even where the browser accepts more. Validating the form against it refuses bad input before the request leaves the page. The application extends the schema with the message shown for each rule and any rule beyond the contract's reach, rather than replacing it, so the form refuses everything the API refuses.

### Update the Cache a Command Changed

**Statement:** A successful command MUST invalidate every query whose answer it changed, and no other query.

**Rationale:** The query cache owns freshness: a page renders the cached answer, not a new request. A command that changes a record but leaves its cache entry therefore shows the old record until something else happens to refetch, so the reader's own write appears to have no effect. Invalidating exactly the queries the command changed refreshes what changed; invalidating more costs a needless request per affected page.

**Example:** The generated client holds both sides of one write: the expenses route calls the submit operation with the expense values, and the list reads through the list operation. After the submit succeeds, the page invalidates the list query and no other query, so the list shows the new expense without refetching unrelated pages.

### Assign State to the Narrowest Owner

**Statement:** A value MUST live with the narrowest owner that can hold it: server data, then the address, then form state, then the component's own state.

**Rationale:** Server data belongs in the query cache, shareable values in the address, input in form state, and the rest in the component's own state. A value kept above its narrowest owner, typically in a shared store, makes unrelated components re-render when it changes and hides where the change came from. The order gives each value the smallest audience that can use it.

### Route a Personal Value in a Header

**Statement:** A value naming a person MUST travel in a request header rather than the query string, with the contract declaring the header each operation reads.

**Rationale:** A query string leaks: proxies log it, the browser keeps it in history, and the next page the reader opens receives it as the referrer. A value naming a person therefore travels in a request header the contract declares per operation, where it reaches the API without landing in those three places. The address keeps its own copy for filters and paging, so a filtered list stays a link somebody can share.

### Read a Permission from the Session

**Statement:** A page MUST offer a command only when the session actor holds its permissions at the record's scope, with the API deciding every command.

**Rationale:** Permissions are the project's permission records: an actor holds a role at a scope, a role allows permissions, and a use case needs permissions. The page reads the permissions the signed-in actor holds from the session the API returns, and offers only the commands those permissions allow at the record's scope, so the reader meets no offer that ends in a refusal. The API still decides every command, so an action offered in error is refused rather than executed.

### Name the Zone for Every Timestamp

**Statement:** A formatter rendering a timestamp MUST receive an explicit IANA time zone, resolved by the caller from the record the screen shows.

**Rationale:** An instant from the API carries no zone, so a formatter left to pick one shows the reader's own zone: a dispatch cut-off reads as midnight in the reader's city instead of the warehouse's. The caller resolves the zone from the record the screen shows: a record with its own zone states it, otherwise the account's zone applies, and an account that chooses none falls back to UTC. Passing the zone explicitly makes each timestamp name whose day it belongs to.

### Keep Secrets Out of Browser Storage

**Statement:** A frontend MUST NOT store a refresh token, a provider secret, or a privileged credential in browser storage or a browser-visible variable.

**Rationale:** Local storage, session storage, IndexedDB, and a build-time public variable are all readable by any script on the page, so a secret kept there is available to the same injected script the secret is meant to resist. Refresh tokens, provider secrets, and privileged credentials therefore stay out of the browser entirely. A preference the reader chooses, such as a theme or a locale, is not a secret and can be stored under a named key in the frame.

### Make Optimistic Behavior Recoverable

**Statement:** An optimistic update MUST declare its stable client identity, its conflict behavior, its failure rollback, and its reconciliation path.

**Rationale:** An optimistic update shows a value the server has not confirmed. Without a stable client identity the retry after a failure creates a duplicate; without declared conflict behavior two writers overwrite each other silently; without a rollback path a failed update leaves the shown value wrong. Declaring identity, conflict behavior, rollback, and reconciliation up front makes each of those cases designed instead of improvised. Money, irreversible actions, and uncertain authorization skip optimism entirely and wait for the server result.

### Announce the Outcome of an Optimistic Update

**Statement:** An optimistic update MUST announce its reconciled outcome through a live region when the server result differs from the value shown.

**Rationale:** A rollback is a silent visual change: the shown value changes back with no event a screen reader announces. The reader heard the optimistic value confirmed and hears nothing when it is withdrawn, so they act on a value the server refused. Announcing the reconciled outcome through a live region tells them what actually holds. [The ARIA live-region technique](https://www.w3.org/WAI/WCAG21/Techniques/aria/ARIA19) is the mechanism, and a test of the route asserts the announcement.

### Localize Copy Through Locale Dictionaries

**Statement:** Copy MUST resolve through locale dictionaries with fill and plural support, one chunk per language, and typed keys with a declared fallback.

**Rationale:** One sentence written in two components drifts at the first rewording, because the author finds one copy and misses the other. A dictionary per language keeps each sentence in one place, keyed by a typed key the compiler checks, with fill and plural support so variable content and counts render correctly in every language. One chunk per language keeps a reader's download to the language they read, and a key the catalog lacks fails where the declared fallback says it fails instead of rendering a raw key.

**Example:** A workspace that carries its own dictionary machinery still meets the same contract.

## Conventions

### Keep the Client Boundary in the Frame

**Default:** Place the client configuration, problem mapping, and download helpers in the frame root, keeping them out of every use-case folder.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** The client configuration, the problem mapping, and the download helpers serve every use case, so a copy in each use-case folder turns one change to the base address or the headers into an edit per folder, with the missed folder failing at runtime. The frame root holds them once, where every use case reaches them and no use case duplicates them.

### Regenerate the Client Rather Than Editing It

**Default:** Regenerate the client from the document, and edit nothing under the generated directory.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A hand edit under the generated directory works until the next generation overwrites it, so the change appears sound and then silently disappears. Regenerating from the document keeps the committed output provably equal to the contract: a reviewer regenerates and compares, and any difference is either a contract change or an edit belonging outside the generated directory.

### Keep Schemas Use-Case Specific

**Default:** Keep a form schema or a view model in its owning use-case folder until a second use case needs it.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A schema shared before its second use case exists is a contract written for one reader. The second use case then either contorts itself to fit or breaks the first reader by changing the shared shape. Keeping a form schema or view model in its owning use-case folder until a second use case needs it lets the shared shape emerge from two real readers.

### Build a Form on the Shared Form Library

**Default:** Build a form on the shared package's form entry point and its registered field components.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** A form library used directly in every use-case folder gives each folder its own fields, its own validation wiring, and its own error display, and none of them knows how to show a refusal on its field. The shared package's form entry point and registered field components hold those decisions once, so every form validates, renders, and refuses the same way.

## Reference Example

This informative example demonstrates `litespec/frontend/data#place-a-field-refusal-on-its-field`, `litespec/frontend/data#update-the-cache-a-command-changed`, and `litespec/frontend/data#validate-a-form-with-the-generated-schema`.

A redelivery dialog holds one field. Submitting validates against the generated schema and applies any field problem back to that field. Success invalidates the order it changes and closes the dialog.

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/frontend/data#generate-the-client-from-the-published-contract | guidance | Client, types, schemas, and operation options are generated output from the published OpenAPI document. Look in the generated client directory and the contract it names. |
| litespec/frontend/data#use-one-configured-client-per-application | guidance | Reads and writes pass through the one configured client with its base address, credentials, headers, and failure mapping. Look in the frame client configuration and the call sites. |
| litespec/frontend/data#keep-the-session-in-an-api-owned-cookie | guidance | The browser session lives in an HTTP-only cookie, and frontend sources hold no token. Look in the API session handling and the frontend sources. |
| litespec/frontend/data#set-the-write-marker-on-every-request | guidance | Writes carry the configured marker header of the form `X-<Project>-Request`. Look in the client configuration and the API write acceptance. |
| litespec/frontend/data#map-every-failure-to-one-problem-type | guidance | Failures render as one problem type decided from the code, with the trace identifier copyable in the detail. Look in the frame problem mapping and the error surfaces. |
| litespec/frontend/data#place-a-refusal-beside-what-was-refused | guidance | Refusals render beside the refused record or control in the application's sentence for the code, with the code in the markup. Look in the page sources beside the refusing controls. |
| litespec/frontend/data#place-a-field-refusal-on-its-field | guidance | Field problems render on their fields through the frame helper with the form left open. Look in the forms and the frame helper. |
| litespec/frontend/data#validate-a-form-with-the-generated-schema | guidance | Forms validate against the generated request schema extended with application rules. Look in the form sources and the generated schemas. |
| litespec/frontend/data#update-the-cache-a-command-changed | guidance | Successful commands invalidate exactly the queries their answers changed. Look in the command call sites and the cache keys. |
| litespec/frontend/data#assign-state-to-the-narrowest-owner | guidance | Values live in the query cache, the address, form state, or component state, at the narrowest applicable owner. Look in the state declarations. |
| litespec/frontend/data#route-a-personal-value-in-a-header | guidance | Person-naming values travel in contract-declared headers, not the query string. Look in the contract headers and the call sites. |
| litespec/frontend/data#read-a-permission-from-the-session | guidance | Offered commands match the permissions the session actor holds at the record scope, with the API deciding each command. Look in the page command guards and the session shape. |
| litespec/frontend/data#name-the-zone-for-every-timestamp | guidance | Timestamp formatters receive an explicit IANA zone resolved from the shown record. Look in the formatter call sites. |
| litespec/frontend/data#keep-secrets-out-of-browser-storage | guidance | Browser storage and browser-visible variables hold no refresh token, provider secret, or privileged credential. Look in the storage writes and the public variables. |
| litespec/frontend/data#make-optimistic-behavior-recoverable | guidance | Optimistic updates declare client identity, conflict behavior, rollback, and reconciliation; money, irreversible actions, and uncertain authorization wait for the server. Look in the optimistic update definitions. |
| litespec/frontend/data#announce-the-outcome-of-an-optimistic-update | guidance | A reconciled outcome differing from the shown value announces through a live region. Look in the route tests asserting the announcement. |
| litespec/frontend/data#localize-copy-through-locale-dictionaries | guidance | Copy resolves through locale dictionaries with fill and plural support, one chunk per language, typed keys, and a declared fallback. Look in the locale dictionaries and the copy call sites. |
| litespec/frontend/data#keep-the-client-boundary-in-the-frame | guidance | Client configuration, problem mapping, and download helpers sit only in the frame root. Look in the frame root and the use-case folders. |
| litespec/frontend/data#regenerate-the-client-rather-than-editing-it | guidance | The committed client equals fresh generation output with no hand edits below the generated directory. Look in the generated directory and the generator command. |
| litespec/frontend/data#keep-schemas-use-case-specific | guidance | Form schemas and view models live in their owning use-case folder until a second use case needs them. Look in the use-case folders and the shared schema locations. |
| litespec/frontend/data#build-a-form-on-the-shared-form-library | guidance | Forms build on the shared package form entry point and registered field components. Look in the form sources and the shared package form entry point. |
