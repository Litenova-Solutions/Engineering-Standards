# External Integrations

## Intent

External systems are unreliable and outside the application's change control. This extension keeps provider details in Infrastructure, translates failures into project-owned outcomes, and tests the actual network boundary.

## Activation

Enable `external-integrations` for each use case that calls an external API, publishes to an external service, consumes an external webhook, or depends on a provider SDK.

The extension adds the pinned HTTP resilience and network simulation packages. It replaces no baseline rule.

## Agent Summary {#agent-summary}

- Define a narrow Application port.
- Keep provider clients and transport models in Infrastructure.
- Bind base address, credentials, timeout, and policy through validated options.
- Retry only safe operations with bounded attempts.
- Translate provider failures and redact provider content.
- Test timeout, connection, transient, permanent, invalid, and duplicate behavior.

## Standards

### Define an Application port (EXT.EXTERNAL.PORT.001)

Application owns a public interface named for the business action. Infrastructure owns provider clients, SDKs, authentication, and transport models.

`IPaymentAuthorizer` is an Application port. `IStripeClient` is a provider client and does not belong in Application.

### Use configured typed clients (EXT.EXTERNAL.CLIENT.001)

Bind base address, credentials, timeout, and policy through validated options. Use `HttpClientFactory` and service discovery when applicable. Do not construct a new HTTP client per request.

### Retry only safe operations (EXT.EXTERNAL.RETRY.001)

Retry transient failures with bounded attempts and jitter. Do not retry a non-idempotent provider call unless the provider accepts a stable idempotency key and the use case documents replay behavior.

### Translate provider failures (EXT.EXTERNAL.FAILURE.001)

Map provider errors to project-owned outcomes and stable diagnostics. Do not leak provider bodies, credentials, headers, exception types, or internal account identifiers through the API.

### Validate inbound messages (EXT.EXTERNAL.INBOUND.001)

Verify webhook signatures, timestamp tolerance, replay protection, content type, size, schema, and provider event identity before processing. Store or process duplicate events idempotently.

### Simulate the network boundary (EXT.EXTERNAL.TEST.001)

Use WireMock.Net or a protocol-specific local endpoint. Cover timeout, connection failure, transient response, permanent response, malformed payload, rate limit, and duplicate delivery.

## Conventions

Place provider code under `Infrastructure/Integrations/{Provider}/`. Keep one options class, client, transport models, mappings, and registration module under the provider folder. Keep business-action ports with their Application use cases.

## Dependencies

- `Microsoft.Extensions.Http.Resilience`
- `WireMock.Net` in integration tests

## Verification

- Test outbound timeout, retry safety, cancellation, and error translation.
- Test inbound signature, replay, schema, and duplicate handling.
- Inspect logs and public errors for provider secrets or bodies.
- Confirm provider types do not cross into Application or Domain.
