# External Integrations

## Intent

External systems are unreliable and outside application change control. This extension keeps provider details in Infrastructure, maps failures to project-owned outcomes, and tests network boundaries.

## Activation

Activation scope: `local`.

Applicable specification kinds: `use-case`, `workflow`.

The consumer enables `external-integrations` for each use case that calls or publishes to an external service, receives a webhook, or uses a provider SDK.

## Baseline relationship

This extension adds pinned HTTP resilience and network simulation packages. It replaces no baseline rule.

## Agent Summary {#agent-summary}

- Define business-action ports in Application. (EXT.INTEGRATIONS.PORT.001)
- Keep provider implementation in Infrastructure. (EXT.INTEGRATIONS.PORT.002)
- Configure and validate typed clients. (EXT.INTEGRATIONS.CLIENT.001)
- Retry only bounded and idempotent provider calls. (EXT.INTEGRATIONS.RETRY.001, EXT.INTEGRATIONS.RETRY.002)
- Translate provider failures without leaks. (EXT.INTEGRATIONS.FAILURE.001, EXT.INTEGRATIONS.FAILURE.002)
- Verify inbound provider messages before processing. (EXT.INTEGRATIONS.INBOUND.001)
- Test failure modes at the network boundary. (EXT.INTEGRATIONS.TEST.001)

## Standards

### Define business-action ports (EXT.INTEGRATIONS.PORT.001)

**Requirement:** Application MUST own a public external-service interface named for its business action.

**Rationale:** A business port states the behavior that a use case needs without naming its provider.

**Example:** `IPaymentAuthorizer` describes the business action without exposing a payment-provider client.

### Isolate provider implementations (EXT.INTEGRATIONS.PORT.002)

**Requirement:** Infrastructure MUST own provider clients, SDKs, authentication, and transport models.

**Rationale:** Provider-specific names and contracts remain outside Application's business boundary.

**Example:** `IStripeClient` is provider infrastructure rather than an Application port.

### Bind client configuration (EXT.INTEGRATIONS.CLIENT.001)

**Requirement:** An external client MUST bind its base address, credentials, timeout, and policy through validated options.

**Rationale:** Validated options make provider configuration explicit at startup.

### Use managed HTTP clients (EXT.INTEGRATIONS.CLIENT.002)

**Requirement:** An HTTP integration MUST use `HttpClientFactory` and applicable service discovery.

**Rationale:** Managed client construction centralizes handler lifetime and service resolution.

### Reject per-request HTTP clients (EXT.INTEGRATIONS.CLIENT.003)

**Requirement:** An HTTP integration MUST NOT construct a new HTTP client for each request.

**Rationale:** Per-request clients lose central handler configuration and can exhaust network resources.

### Bound transient retries (EXT.INTEGRATIONS.RETRY.001)

**Requirement:** An external client MUST retry transient failures with bounded attempts and jitter.

**Rationale:** Bounded jittered retries reduce synchronized retry load on an unavailable provider.

### Protect non-idempotent calls (EXT.INTEGRATIONS.RETRY.002)

**Requirement:** An external client MUST NOT retry a non-idempotent provider call without provider idempotency and documented replay behavior.

**Rationale:** Repeated provider calls can duplicate irreversible external effects.

### Translate provider failure outcomes (EXT.INTEGRATIONS.FAILURE.001)

**Requirement:** An integration MUST map provider errors to project-owned outcomes and stable diagnostics.

**Rationale:** Project-owned outcomes remain stable when provider responses or SDK types change.

### Exclude provider internals (EXT.INTEGRATIONS.FAILURE.002)

**Requirement:** An API MUST NOT expose provider bodies, credentials, headers, exception types, or internal account identifiers.

**Rationale:** Provider internals can disclose secrets, implementation details, or another account's data.

### Verify inbound provider messages (EXT.INTEGRATIONS.INBOUND.001)

**Requirement:** An inbound provider handler MUST verify signature, timestamp tolerance, replay protection, content type, size, schema, and event identity before processing.

**Rationale:** Each check protects a different part of the trust boundary for a provider message.

### Process duplicate messages safely (EXT.INTEGRATIONS.INBOUND.002)

**Requirement:** An inbound provider handler MUST store or process duplicate events idempotently.

**Rationale:** Provider delivery can repeat one event after a timeout or acknowledgement failure.

### Simulate integration boundaries (EXT.INTEGRATIONS.TEST.001)

**Requirement:** An integration test MUST use WireMock.Net or a protocol-specific local endpoint.

**Rationale:** A controllable endpoint exercises the network contract without a live provider account.

### Cover provider failure modes (EXT.INTEGRATIONS.TEST.002)

**Requirement:** An integration test MUST cover timeout, connection failure, transient response, permanent response, malformed payload, rate limit, and duplicate delivery.

**Rationale:** Each failure mode can affect retry, mapping, or idempotency behavior.

## Conventions

### Group provider code (EXT.INTEGRATIONS.CONVENTION.001)

**Default:** Place provider code under `Infrastructure/Integrations/{Provider}/`.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** One provider folder gives transport code a clear Infrastructure boundary.

### Keep provider components together (EXT.INTEGRATIONS.CONVENTION.002)

**Default:** Keep one options class, client, transport models, mappings, and registration module in each provider folder.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** Related provider implementation details remain discoverable together.

### Keep ports near use cases (EXT.INTEGRATIONS.CONVENTION.003)

**Default:** Keep business-action ports with their Application use cases.

**Replacement:** A consumer can replace this default with an explicit local convention.

**Rationale:** The use case states why it needs the external behavior.

## Dependencies

- `Microsoft.Extensions.Http.Resilience`
- `WireMock.Net` in integration tests

## Verification

| ID | Method | Evidence |
|:---|:---|:---|
| EXT.INTEGRATIONS.PORT.001 | inspection | Application source review identifies business-action provider ports. |
| EXT.INTEGRATIONS.PORT.002 | static | `ExternalPortTests` asserts application assembly references no provider SDK or transport-model type. |
| EXT.INTEGRATIONS.CLIENT.001 | test | `ExternalClientTests` reject missing or invalid external client configuration. |
| EXT.INTEGRATIONS.CLIENT.002 | static | `ExternalClientTests` asserts hTTP integration registration uses the owned factory and declared discovery path. |
| EXT.INTEGRATIONS.CLIENT.003 | static | `ExternalClientTests` reports no per-request HTTP client construction. |
| EXT.INTEGRATIONS.RETRY.001 | test | `ExternalRetryTests` verify bounded jittered retry for transient failures. |
| EXT.INTEGRATIONS.RETRY.002 | test | `ExternalRetryTests` shows no retry without documented provider protection. |
| EXT.INTEGRATIONS.FAILURE.001 | test | `ExternalFailureTests` asserts provider failures map to project-owned outcomes and stable diagnostics. |
| EXT.INTEGRATIONS.FAILURE.002 | test | `ExternalFailureTests` expose no provider body, credential, header, type, or account identifier. |
| EXT.INTEGRATIONS.INBOUND.001 | test | `ExternalInboundTests` reject invalid signatures, timestamps, content, size, schema, and identities. |
| EXT.INTEGRATIONS.INBOUND.002 | test | `ExternalInboundTests` leave one accepted external effect. |
| EXT.INTEGRATIONS.TEST.001 | test | `ExternalTestTests` runs each provider contract against a controllable local endpoint. |
| EXT.INTEGRATIONS.TEST.002 | test | `ExternalTestTests` suite covers every declared failure mode. |
| EXT.INTEGRATIONS.CONVENTION.001 | inspection | Provider paths use the documented folder or record a local replacement. |
| EXT.INTEGRATIONS.CONVENTION.002 | inspection | Provider folder review finds each documented component. |
| EXT.INTEGRATIONS.CONVENTION.003 | inspection | Business-action ports remain near their owning Application use cases. |
