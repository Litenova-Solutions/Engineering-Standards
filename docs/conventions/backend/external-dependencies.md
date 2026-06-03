# External Dependencies in Tests

Conventions for simulating outbound HTTP services and resetting databases between integration and acceptance tests. Package versions live in `standards.manifest.json` → `conditionalNuGetPackages`.

---

## Agent Quick Rules {#agent-quick-rules}

- Use **WireMock.Net** only in test projects for outbound HTTP boundaries; MUST NOT ship WireMock in production hosts.
- Use **Respawn** (or equivalent documented reset) for PostgreSQL isolation between integration or acceptance scenarios; MUST NOT rely on test execution order.
- Reset database state per scenario or test class; shared mutable static state in tests is forbidden.
- External API behavior MUST be stubbed in Playwright E2E (`page.route`); live third-party APIs in CI are forbidden unless a project ADR documents a sandbox contract.


**Full convention:** `docs/conventions/backend/external-dependencies.md`

---

## Overview

Integration and acceptance tests run the real application host with Testcontainers for the database. Outbound calls to payment gateways, email providers, webhooks, and other HTTP APIs MUST be replaced with deterministic stubs so failures reflect application logic, not external uptime.

---

## WireMock.Net

**When:** Application code calls external HTTP APIs from Infrastructure. Tests in `{ProjectName}.Integration.Tests` or `{ProjectName}.AcceptanceTests` stub those endpoints.

**Package:** `WireMock.Net` from `conditionalNuGetPackages.externalDependencySimulation`. Check manifest version before adding.

```csharp
// GOOD: stub external API in test fixture
using WireMock.RequestBuilders;
using WireMock.ResponseBuilders;
using WireMock.Server;

public sealed class PaymentApiFixture : IAsyncLifetime
{
    private WireMockServer? _server;

    public string BaseUrl => _server!.Urls[0];

    public Task InitializeAsync()
    {
        _server = WireMockServer.Start();
        _server
            .Given(Request.Create().WithPath("/v1/charges").UsingPost())
            .RespondWith(Response.Create().WithStatusCode(201).WithBody("""{"id":"ch_test"}"""));
        return Task.CompletedTask;
    }

    public Task DisposeAsync()
    {
        _server?.Stop();
        _server?.Dispose();
        return Task.CompletedTask;
    }
}
```

```csharp
// BAD: hit real payment API in CI
await httpClient.PostAsync("https://api.stripe.com/v1/charges", content);
```

Register the stub base URL through test configuration (`WebApplicationFactory` overrides `IOptions<PaymentApiOptions>`).

---

## Respawn (database reset)

**When:** Multiple tests share one Testcontainers PostgreSQL instance per collection. Reset data between tests to prevent order-dependent failures.

**Package:** `Respawn` from `conditionalNuGetPackages.databaseReset`.

```csharp
// GOOD: reset between tests in a collection
using Respawn;

public sealed class DatabaseResetFixture : IAsyncLifetime
{
    private RespawnCheckpoint? _checkpoint;

    public async Task InitializeAsync()
    {
        await using var connection = new NpgsqlConnection(_connectionString);
        await connection.OpenAsync();
        _checkpoint = await RespawnCheckpoint.CreateAsync(connection, new RespawnOptions
        {
            DbAdapter = DbAdapter.Postgres,
            SchemasToInclude = ["public"],
        });
    }

    public async Task ResetAsync()
    {
        await using var connection = new NpgsqlConnection(_connectionString);
        await connection.OpenAsync();
        await _checkpoint!.ResetAsync(connection);
    }
}
```

```csharp
// BAD: assume previous test left database empty without reset
// Test B passes only when Test A ran first
```

Use Respawn in acceptance tests when scenarios create overlapping aggregate rows. Prefer builders and APIs for Given steps when reset cost is high; still reset when scenarios mutate shared reference data.

---

## Anti-patterns

| Anti-pattern | Why it fails |
|:---|:---|
| Shared static `HttpClient` pointing at production | Flaky CI, data corruption, secret leakage |
| Truncating tables by ad-hoc SQL without Respawn | Misses join tables, breaks FK order |
| One database snapshot for entire test run | Cannot parallelize; hides isolation bugs |

---

## Related documents

| Document | Topic |
|:---|:---|
| `testing.md` | Test categories, Testcontainers |
| `api-acceptance-tests.md` | Acceptance host and scenario isolation |
| `infrastructure-layer.md` | Anti-corruption for external APIs |
| `docs/blueprints/backend/integration-test-factory.md` | Factory setup |
