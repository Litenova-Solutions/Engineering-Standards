# External Integrations

## Intent

External systems are unreliable and outside application change control. This extension keeps provider details in Infrastructure, maps failures to project-owned outcomes, and tests network boundaries.

## Activation

Activation scope: `local`.

Applicable specification kinds: `use-case`, `workflow`, `domain-policy`, `end-to-end-flow`.

The consumer enables `integrations` for each use case that calls or publishes to an external service, receives a webhook, or uses a provider SDK.

## Baseline relationship

This extension adds pinned HTTP resilience and network simulation packages. It replaces no baseline rule.

## Agent Summary {#agent-summary}

- Define business-action ports in Application. (standards/rule/ext-integrations.define-business-action-ports)
- Keep provider implementation in Infrastructure. (standards/rule/ext-integrations.isolate-provider-implementations)
- Configure and validate typed clients. (standards/rule/ext-integrations.bind-client-configuration)
- Retry only bounded and idempotent provider calls. (standards/rule/ext-integrations.bound-transient-retries, standards/rule/ext-integrations.protect-non-idempotent-calls)
- Translate provider failures without leaks. (standards/rule/ext-integrations.translate-provider-failure-outcomes, standards/rule/ext-integrations.exclude-provider-internals)
- Verify inbound provider messages before processing. (standards/rule/ext-integrations.verify-inbound-provider-messages)
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

**Example:** A failed signature returns its status with no body, because a message explaining which check failed tells an unauthenticated caller how to pass it.

### Process duplicate messages safely (standards/rule/ext-integrations.process-duplicate-messages-safely)

**Requirement:** An inbound provider handler MUST store or process duplicate events idempotently.

**Rationale:** Provider delivery can repeat one event after a timeout or acknowledgement failure.

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

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** One provider folder gives transport code a clear Infrastructure boundary.

### Keep provider components together (standards/rule/ext-integrations.keep-provider-components-together)

**Default:** Keep one options class, client, transport models, mappings, and registration module in each provider folder.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Related provider implementation details remain discoverable together.

### Keep ports near use cases (standards/rule/ext-integrations.keep-ports-near-use-cases)

**Default:** Keep business-action ports with their Application use cases.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** The use case states why it needs the external behavior.

## Dependencies

- `Microsoft.Extensions.Http.Resilience`
- `WireMock.Net` in integration tests

## Verification

| ID | Method | Evidence |
|:---|:---|:---|
| standards/rule/ext-integrations.define-business-action-ports | inspection | Application source review identifies business-action provider ports. |
| standards/rule/ext-integrations.isolate-provider-implementations | static | `ExternalPortTests` asserts application assembly references no provider SDK or transport-model type. |
| standards/rule/ext-integrations.bind-client-configuration | test | `ExternalClientTests` reject missing or invalid external client configuration. |
| standards/rule/ext-integrations.use-managed-http-clients | static | `ExternalClientTests` asserts hTTP integration registration uses the owned factory and declared discovery path. |
| standards/rule/ext-integrations.reject-per-request-http-clients | static | `ExternalClientTests` reports no per-request HTTP client construction. |
| standards/rule/ext-integrations.bound-transient-retries | test | `ExternalRetryTests` verify bounded jittered retry for transient failures. |
| standards/rule/ext-integrations.protect-non-idempotent-calls | test | `ExternalRetryTests` shows no retry without documented provider protection. |
| standards/rule/ext-integrations.translate-provider-failure-outcomes | test | `ExternalFailureTests` asserts provider failures map to project-owned outcomes and stable diagnostics. |
| standards/rule/ext-integrations.exclude-provider-internals | test | `ExternalFailureTests` expose no provider body, credential, header, type, or account identifier. |
| standards/rule/ext-integrations.verify-inbound-provider-messages | test | `ExternalInboundTests` reject invalid signatures, timestamps, content, size, schema, and identities. |
| standards/rule/ext-integrations.process-duplicate-messages-safely | test | `ExternalInboundTests` leave one accepted external effect. |
| standards/rule/ext-integrations.simulate-integration-boundaries | test | `ExternalTestTests` runs each provider contract against a controllable local endpoint. |
| standards/rule/ext-integrations.cover-provider-failure-modes | test | `ExternalTestTests` suite covers every declared failure mode. |
| standards/rule/ext-integrations.group-provider-code | inspection | Provider paths use the documented folder or record a local replacement. |
| standards/rule/ext-integrations.keep-provider-components-together | inspection | Provider folder review finds each documented component. |
| standards/rule/ext-integrations.keep-ports-near-use-cases | inspection | Business-action ports remain near their owning Application use cases. |
