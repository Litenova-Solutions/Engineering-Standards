# External Integrations

## Intent

External systems are unreliable and outside application change control. This extension keeps provider details in Infrastructure, maps failures to project-owned outcomes, and tests network boundaries.

## Activation

Activation scope: `local`.

Applicable specification kinds: `use-case`, `rule`, `journey`.

The consumer enables `integrations` for each use case that calls or publishes to an external service, receives a webhook, or uses a provider SDK.

## Replaces

This extension replaces no baseline provision.

## Switches on

This extension switches on no optional record type.

## Agent Summary {#agent-summary}

- Define business-action ports in Application. (standards/rule/ext-integrations.define-business-action-ports)
- Keep provider implementation in Infrastructure. (standards/rule/ext-integrations.isolate-provider-implementations)
- Configure and validate typed clients. (standards/rule/ext-integrations.bind-client-configuration)
- Retry only bounded and idempotent provider calls. (standards/rule/ext-integrations.bound-transient-retries, standards/rule/ext-integrations.protect-non-idempotent-calls)
- Translate provider failures without leaks. (standards/rule/ext-integrations.translate-provider-failure-outcomes, standards/rule/ext-integrations.exclude-provider-internals)
- Verify inbound provider messages before processing. (standards/rule/ext-integrations.verify-inbound-provider-messages)
- Reject formula-leading import values. (standards/rule/ext-integrations.reject-formula-leading-import-values)
- Test failure modes at the network boundary. (standards/rule/ext-integrations.simulate-integration-boundaries)

## Standards

### Define business-action ports (standards/rule/ext-integrations.define-business-action-ports)

**Requirement:** Application MUST own a public external-service interface named for its business action.

**Rationale:** A business port states the behavior that a use case needs without naming its provider.

**Example:** `IPaymentAuthorizer` describes the business action without exposing a payment-provider client.

### Isolate provider implementations (standards/rule/ext-integrations.isolate-provider-implementations)

**Requirement:** Infrastructure MUST own provider clients, SDKs, authentication, and transport models.

**Rationale:** Provider-specific names and contracts remain outside Application's business boundary.

**Example:** `IStripeClient` is provider infrastructure rather than an Application port.

### Bind client configuration (standards/rule/ext-integrations.bind-client-configuration)

**Requirement:** An external client MUST bind its base address, credentials, timeout, and policy through validated options.

**Rationale:** Validated options make provider configuration explicit at startup.

### Use managed HTTP clients (standards/rule/ext-integrations.use-managed-http-clients)

**Requirement:** An HTTP integration MUST use `HttpClientFactory` and applicable service discovery.

**Rationale:** Managed client construction centralizes handler lifetime and service resolution.

### Reject per-request HTTP clients (standards/rule/ext-integrations.reject-per-request-http-clients)

**Requirement:** An HTTP integration MUST NOT construct a new HTTP client for each request.

**Rationale:** Per-request clients lose central handler configuration and can exhaust network resources.

### Bound transient retries (standards/rule/ext-integrations.bound-transient-retries)

**Requirement:** An external client MUST retry transient failures with bounded attempts and jitter.

**Rationale:** Bounded jittered retries reduce synchronized retry load on an unavailable provider.

### Protect non-idempotent calls (standards/rule/ext-integrations.protect-non-idempotent-calls)

**Requirement:** An external client MUST NOT retry a non-idempotent provider call without provider idempotency and documented replay behavior.

**Rationale:** Repeated provider calls can duplicate irreversible external effects.

### Translate provider failure outcomes (standards/rule/ext-integrations.translate-provider-failure-outcomes)

**Requirement:** An integration MUST map provider errors to project-owned outcomes and stable diagnostics.

**Rationale:** Project-owned outcomes remain stable when provider responses or SDK types change.

The stable codes come from the project's own error catalog, which is the same register `standards/rule/backend-api.return-stable-problem-details` returns a code from. An integration that invents a code per provider produces one code space per provider. A client branching on failure then has to learn all of them. [A provider's own error taxonomy](https://stripe.com/docs/api/errors) is the input to the mapping rather than its output.

**Example:** A declined card and a declined direct debit both map to the project's payment-refused code, and the provider's own code travels in diagnostics.

### Exclude provider internals (standards/rule/ext-integrations.exclude-provider-internals)

**Requirement:** An API MUST NOT expose provider bodies, credentials, headers, exception types, or internal account identifiers.

**Rationale:** Provider internals can disclose secrets, implementation details, or another account's data.

### Verify inbound provider messages (standards/rule/ext-integrations.verify-inbound-provider-messages)

**Requirement:** An inbound provider handler MUST verify signature, timestamp tolerance, replay protection, content type, size, schema, and event identity before processing.

**Rationale:** Each check protects a different part of the trust boundary for a provider message.

The order is not free. The signature is verified first, over the raw body, before the body is parsed or any other check reads it. A parser that runs first is attacker-reachable code behind no authentication, and a body already deserialized is no longer the bytes the signature covered. [Stripe's signature guidance](https://stripe.com/docs/webhooks/signatures) states the same requirement.

**Example:** A failed signature returns 401 with no body, because a message explaining which check failed tells an unauthenticated caller how to pass it.

### Process duplicate messages safely (standards/rule/ext-integrations.process-duplicate-messages-safely)

**Requirement:** An inbound provider handler MUST store or process duplicate events idempotently.

**Rationale:** Provider delivery can repeat one event after a timeout or acknowledgement failure.

### Reject formula-leading import values (standards/rule/ext-integrations.reject-formula-leading-import-values)

**Requirement:** A CSV or spreadsheet import MUST reject or neutralize a value that begins with a formula-leading character.

**Rationale:** The formula-leading characters are the equals sign, the plus sign, the minus sign, the at sign, the tab, and the carriage return. Escaping on the way out protects the reader of this export. It does not protect the reader of the next one. An imported value stored unchanged is re-exported by a different report that may not escape it. [CSV injection](https://owasp.org/www-community/attacks/CSV_Injection) travels through the store, so the boundary that admits the value is where it stops.

**Example:** An import that rejects the value reports the row and the field. An import that neutralizes it records what it changed, because a silently altered value is a data defect the owner cannot see.

### Simulate integration boundaries (standards/rule/ext-integrations.simulate-integration-boundaries)

**Requirement:** An integration test MUST use WireMock.Net or a protocol-specific local endpoint.

**Rationale:** A controllable endpoint exercises the network contract without a live provider account.

### Cover provider failure modes (standards/rule/ext-integrations.cover-provider-failure-modes)

**Requirement:** An integration test MUST cover timeout, connection failure, transient response, permanent response, malformed payload, rate limit, duplicate delivery, and unexpected response shape.

**Rationale:** Each failure mode can affect retry, mapping, or idempotency behavior.

An unexpected response shape is the mode a provider produces without failing. A well-formed response can carry a field that moved, a type that changed, or a value nobody planned for. It parses and then behaves wrongly. Every other listed mode would have caught that as an error. [A provider that versions its API](https://stripe.com/docs/api/versioning) changes shape on a schedule, and a pinned version still changes on the day it is raised.

## Conventions

### Group provider code (standards/rule/ext-integrations.group-provider-code)

**Default:** Place provider code under `Infrastructure/Integrations/{Provider}/`.

**Replacement:** A consumer records a departure from this default as an Exception record with reason, review date and removal condition.

**Rationale:** One provider folder gives transport code a clear Infrastructure boundary.

### Keep provider components together (standards/rule/ext-integrations.keep-provider-components-together)

**Default:** Keep one options class, client, transport models, mappings, and registration module in each provider folder.

**Replacement:** A consumer records a departure from this default as an Exception record with reason, review date and removal condition.

**Rationale:** Related provider implementation details remain discoverable together.

### Keep ports near use cases (standards/rule/ext-integrations.keep-ports-near-use-cases)

**Default:** Keep business-action ports with their Application use cases.

**Replacement:** A consumer records a departure from this default as an Exception record with reason, review date and removal condition.

**Rationale:** The use case states why it needs the external behavior.

## Dependencies

- `Microsoft.Extensions.Http.Resilience`
- `WireMock.Net` in integration tests

## Verification

| ID | Mark | Evidence |
|:---|:---|:---|
| standards/rule/ext-integrations.define-business-action-ports | guidance | Does each Application port name a business action without naming its provider? |
| standards/rule/ext-integrations.isolate-provider-implementations | checkable | `ExternalPortTests` assert the Application assembly references no provider SDK or transport type. |
| standards/rule/ext-integrations.bind-client-configuration | checkable | `ExternalClientTests` reject missing or invalid external client configuration. |
| standards/rule/ext-integrations.use-managed-http-clients | checkable | `ExternalClientTests` assert HTTP registration uses the owned factory and declared discovery path. |
| standards/rule/ext-integrations.reject-per-request-http-clients | checkable | `ExternalClientTests` report no per-request HTTP client construction. |
| standards/rule/ext-integrations.bound-transient-retries | checkable | `ExternalRetryTests` verify bounded jittered retry for transient failures. |
| standards/rule/ext-integrations.protect-non-idempotent-calls | checkable | `ExternalRetryTests` show no retry without documented provider protection. |
| standards/rule/ext-integrations.translate-provider-failure-outcomes | checkable | `ExternalFailureTests` assert provider failures map to project-owned outcomes and stable diagnostics. |
| standards/rule/ext-integrations.exclude-provider-internals | checkable | `ExternalFailureTests` expose no provider body, credential, header, type, or account identifier. |
| standards/rule/ext-integrations.verify-inbound-provider-messages | checkable | `ExternalInboundTests` reject invalid signatures, timestamps, content, size, schema, and identities. |
| standards/rule/ext-integrations.process-duplicate-messages-safely | checkable | `ExternalInboundTests` leave one accepted external effect. |
| standards/rule/ext-integrations.reject-formula-leading-import-values | checkable | `ExternalInboundTests` reject or neutralize formula-leading import values. |
| standards/rule/ext-integrations.simulate-integration-boundaries | checkable | `ExternalTestTests` run each provider contract against a controllable local endpoint. |
| standards/rule/ext-integrations.cover-provider-failure-modes | checkable | `ExternalTestTests` suite covers every declared failure mode. |
| standards/rule/ext-integrations.group-provider-code | guidance | Does each provider folder hold its code or record an Exception? |
| standards/rule/ext-integrations.keep-provider-components-together | guidance | Does each provider folder hold its options, client, models, mappings and registration? |
| standards/rule/ext-integrations.keep-ports-near-use-cases | guidance | Does each business-action port stay with its owning Application use case? |
