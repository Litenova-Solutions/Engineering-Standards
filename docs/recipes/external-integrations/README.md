---
{
  "id": "recipe.external-integrations",
  "kind": "recipe",
  "normative": true,
  "appliesTo": ["backend.application", "backend.infrastructure", "testing"],
  "recipes": ["external-integrations"]
}
---
# External Integrations

## RECIPE.EXTERNAL.PORT.001 - Define an Application capability port

Application owns a public interface named for the required capability. Infrastructure owns provider clients and transport models.

`IPaymentAuthorizer` is a capability. `IStripeClient` exposes a provider and does not belong in Application.

## RECIPE.EXTERNAL.CLIENT.001 - Use configured typed clients

Bind base address, credentials, and timeouts through validated options. Use `HttpClientFactory` and service discovery where available.

## RECIPE.EXTERNAL.RETRY.001 - Retry only safe operations

Retry transient failures with bounded attempts and jitter. Do not retry a non-idempotent provider call unless the provider supports an idempotency key.

## RECIPE.EXTERNAL.FAILURE.001 - Translate provider failures

Map provider errors to project-owned outcomes. Do not leak provider response bodies, credentials, or exception types through the API.

## RECIPE.EXTERNAL.TEST.001 - Simulate the network boundary

Use WireMock.Net or a protocol-specific local test endpoint. Cover timeout, connection failure, transient response, permanent response, invalid payload, and duplicate delivery.

