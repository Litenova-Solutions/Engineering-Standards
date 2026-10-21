# External Integrations

## Intent

External integrations connect the product to providers it does not control, which can fail, change their responses, or deliver one message twice. This page states how a use case (one operation the product offers) names the outside behavior it needs, where provider details live, how failures map to project-owned outcomes, and how tests simulate the network boundary. A team applies it for each use case that calls a provider, receives a webhook, or imports provider-shaped data, so a provider change touches one folder instead of the whole codebase.

## Activation

Activation scope: `local`.

Applicable specification kinds: `use-case`, `rule`, `journey`.

The consumer enables `integrations` for each use case that calls or publishes to an external service, receives a webhook, or uses a provider SDK.

## Baseline relationship

This extension replaces no baseline provision.

This extension switches on no optional record type.

## Standards

### Define business-action ports

**Requirement:** Application MUST own a public external-service interface named for its business action.

**Rationale:** The use case needs a behavior, such as authorizing a payment, not a provider. A public interface named for that business action states the need with no provider in sight. Application then depends on the behavior while providers come and go behind it.

**Example:** `IPaymentAuthorizer` describes the business action without exposing a payment-provider client.

### Isolate provider implementations

**Requirement:** Infrastructure MUST own provider clients, SDKs, authentication, and transport models.

**Rationale:** Provider clients, SDKs, authentication, and transport models name provider things in provider terms. Infrastructure owns all of them, outside Application's business boundary. A provider SDK upgrade then touches Infrastructure instead of the use case.

**Example:** `IStripeClient` is provider infrastructure rather than an Application port.

### Bind client configuration

**Requirement:** An external client MUST bind its base address, credentials, timeout, and policy through validated options.

**Rationale:** Base address, credentials, timeout, and policy decide where the client calls and how it behaves. Binding them through validated options checks each value at startup. A missing or invalid value fails fast instead of misdirecting the first live call.

### Use managed HTTP clients

**Requirement:** An HTTP integration MUST use `HttpClientFactory` and applicable service discovery.

**Rationale:** `HttpClientFactory` centralizes handler lifetime, and service discovery resolves provider addresses in one place. Both keep HTTP construction out of the use case. A hand-built client in each call site would scatter both concerns.

### Reject per-request HTTP clients

**Requirement:** An HTTP integration MUST NOT construct a new HTTP client for each request.

**Rationale:** A new HTTP client per request skips the central handler configuration and opens sockets the process never reuses. Under load, the exhausted sockets fail calls that the provider would have served. Managed clients reuse what per-request construction throws away.

### Bound transient retries

**Requirement:** An external client MUST retry transient failures with bounded attempts and jitter.

**Rationale:** A provider outage tempts every caller to retry at once, and the synchronized wave hits the provider the moment it recovers. Bounded attempts cap the load and jitter spreads it over time. An unbounded retry turns each caller into a second outage.

### Protect non-idempotent calls

**Requirement:** An external client MUST NOT retry a non-idempotent provider call without provider idempotency and documented replay behavior.

**Rationale:** Retrying a charge, a shipment, or any irreversible provider call can perform it twice. The retry is safe only with provider idempotency behind it and documented replay behavior stating what a repeat does. Without both, the project trades one failed call for two completed effects.

### Translate provider failure outcomes

**Requirement:** An integration MUST map provider errors to project-owned outcomes and stable diagnostics.

**Rationale:** Each provider reports failure in its own codes and shapes. Mapping them to project-owned outcomes with stable diagnostics keeps the project's failure contract steady while providers change theirs.

The project's own error catalog holds the stable codes. `litespec/backend/api#return-stable-problem-details` returns a code from that catalog. An integration that invents one code per provider creates one code space per provider. A client that branches on failure learns every code space. [A provider's own error taxonomy](https://stripe.com/docs/api/errors) is the input to the mapping, not its output.

**Example:** A declined card and a declined direct debit both map to the project's `payment-refused` code. The provider's own code travels in diagnostics.

### Exclude provider internals

**Requirement:** An API MUST NOT expose provider bodies, credentials, headers, exception types, or internal account identifiers.

**Rationale:** Provider bodies, headers, exception types, and account identifiers carry secrets, implementation details, and sometimes another account's data. An API that returns them leaks all three to its callers. The mapped project-owned outcome carries the meaning without the internals.

### Verify inbound provider messages

**Requirement:** An inbound provider handler MUST verify signature, timestamp tolerance, replay protection, content type, size, schema, and event identity before processing.

**Rationale:** An inbound message arrives from the network, where anyone can send bytes. Signature, timestamp tolerance, replay protection, content type, size, schema, and event identity each guard a different part of that trust boundary. Skipping any one leaves its attack open.

Order matters here. Verify the signature first, over the raw body, before parsing the body or running any other check. An unauthenticated caller can reach a parser that runs first. A deserialized body is no longer the bytes that the signature covered. [Stripe's signature guidance](https://stripe.com/docs/webhooks/signatures) states the same requirement.

**Example:** A failed signature returns `401` with no body. A message that names the failed check tells an unauthenticated caller how to pass it.

### Process duplicate messages safely

**Requirement:** An inbound provider handler MUST store or process duplicate events idempotently.

**Rationale:** A provider repeats delivery after a timeout or an acknowledgement failure, so the same event arrives twice. Storing or processing duplicates idempotently leaves one accepted effect. A handler without that protection charges, ships, or notifies twice.

### Reject formula-leading import values

**Requirement:** A CSV or spreadsheet import MUST reject or neutralize a value that begins with a formula-leading character.

**Rationale:** The formula-leading characters are the equals sign, the plus sign, the minus sign, the at sign, the tab, and the carriage return. Escaping when you export protects the reader of that export. It does not protect the reader of the next export. A different report can re-export an unchanged imported value without escaping it. [CSV injection](https://owasp.org/www-community/attacks/CSV_Injection) travels through the store, so the boundary that admits the value is where it stops.

**Example:** An import that rejects the value reports the row and the field. An import that neutralizes it records what it changed. A silently altered value is a data defect the owner cannot see.

### Simulate integration boundaries

**Requirement:** An integration test MUST use WireMock.Net or a protocol-specific local endpoint.

**Rationale:** A live provider account makes tests slow, flaky, and expensive, and some failure modes never occur on demand. WireMock.Net or a protocol-specific local endpoint simulates the network contract under test control. The suite then covers provider behavior without calling the provider.

### Cover provider failure modes

**Requirement:** An integration test MUST cover timeout, connection failure, transient response, permanent response, malformed payload, rate limit, duplicate delivery, and unexpected response shape.

**Rationale:** Timeout, connection failure, transient and permanent responses, malformed payloads, rate limits, duplicate delivery, and unexpected shapes each exercise a different path through retry, mapping, and idempotency. A mode without a test leaves its path unverified. The suite covers all eight so each path proves itself.

An unexpected response shape is the mode a provider produces without failing. A well-formed response can carry a field that moved, a type that changed, or a value no one planned for. The response parses. The behavior is still wrong. Every other listed mode reports that response as an error. [A provider that versions its API](https://stripe.com/docs/api/versioning) changes shape on a schedule. A pinned version still changes on the day the provider raises it.

## Conventions

### Group provider code

**Default:** Place provider code under `Infrastructure/Integrations/{Provider}/`.

**Replacement:** A consumer records a departure from this default as an Exception record with reason, review date, and removal condition.

**Rationale:** Each provider's transport code lives under `Infrastructure/Integrations/{Provider}/`. One folder per provider keeps provider code inside one Infrastructure boundary. A reader finds everything about a provider in one place.

### Keep provider components together

**Default:** Keep one options class, client, transport models, mappings, and registration module in each provider folder.

**Replacement:** A consumer records a departure from this default as an Exception record with reason, review date, and removal condition.

**Rationale:** Options, client, transport models, mappings, and the registration module change together when the provider changes. Keeping them in the provider folder keeps each change in one place. A registration module stored elsewhere is the file every provider change forgets.

### Keep ports near use cases

**Default:** Keep business-action ports with their Application use cases.

**Replacement:** A consumer records a departure from this default as an Exception record with reason, review date, and removal condition.

**Rationale:** A business-action port exists because its use case needs that behavior. Keeping the port with its Application use cases states the need next to the needer. A ports folder far from the use cases hides which behavior each port serves.

## Dependencies

- `Microsoft.Extensions.Http.Resilience`
- `WireMock.Net` in integration tests

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| litespec/ext/integrations#define-business-action-ports | guidance | Does each Application port name a business action without naming its provider? |
| litespec/ext/integrations#isolate-provider-implementations | checkable | `ExternalPortTests` assert the Application assembly references no provider SDK or transport type. |
| litespec/ext/integrations#bind-client-configuration | checkable | `ExternalClientTests` reject missing or invalid external client configuration. |
| litespec/ext/integrations#use-managed-http-clients | checkable | `ExternalClientTests` assert HTTP registration uses the owned factory and declared discovery path. |
| litespec/ext/integrations#reject-per-request-http-clients | checkable | `ExternalClientTests` report no per-request HTTP client construction. |
| litespec/ext/integrations#bound-transient-retries | checkable | `ExternalRetryTests` verify bounded jittered retry for transient failures. |
| litespec/ext/integrations#protect-non-idempotent-calls | checkable | `ExternalRetryTests` show no retry without documented provider protection. |
| litespec/ext/integrations#translate-provider-failure-outcomes | checkable | `ExternalFailureTests` assert provider failures map to project-owned outcomes and stable diagnostics. |
| litespec/ext/integrations#exclude-provider-internals | checkable | `ExternalFailureTests` expose no provider body, credential, header, type, or account identifier. |
| litespec/ext/integrations#verify-inbound-provider-messages | checkable | `ExternalInboundTests` reject invalid signatures, timestamps, content, size, schema, and identities. |
| litespec/ext/integrations#process-duplicate-messages-safely | checkable | `ExternalInboundTests` leave one accepted external effect. |
| litespec/ext/integrations#reject-formula-leading-import-values | checkable | `ExternalInboundTests` reject or neutralize formula-leading import values. |
| litespec/ext/integrations#simulate-integration-boundaries | checkable | `ExternalTestTests` run each provider contract against a controllable local endpoint. |
| litespec/ext/integrations#cover-provider-failure-modes | checkable | `ExternalTestTests` suite covers every declared failure mode. |
| litespec/ext/integrations#group-provider-code | guidance | Does each provider folder hold its code or record an Exception? |
| litespec/ext/integrations#keep-provider-components-together | guidance | Does each provider folder hold its options, client, models, mappings, and registration? |
| litespec/ext/integrations#keep-ports-near-use-cases | guidance | Does each business-action port stay with its owning Application use case? |
