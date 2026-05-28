# Blueprint: Acceptance Test Web App Factory

Copy to `Support/AcceptanceTestWebAppFactory.cs`. Adapt connection strings and test auth to the project ADR.

```csharp
public sealed class AcceptanceTestWebAppFactory : WebApplicationFactory<Program>, IAsyncLifetime
{
    private readonly PostgreSqlContainer _dbContainer = new PostgreSqlBuilder()
        .WithImage("postgres:17-alpine")
        .Build();

    public HttpClient CreateClientForScenario() => CreateClient();

    public async Task InitializeAsync() => await _dbContainer.StartAsync();

    public new async Task DisposeAsync()
    {
        await _dbContainer.DisposeAsync();
        await base.DisposeAsync();
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");

        builder.ConfigureAppConfiguration((_, config) =>
        {
            config.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["ConnectionStrings:database"] = _dbContainer.GetConnectionString(),
                ["JwtSettings:Secret"] = TestUsers.DevJwtSecret,
            });
        });
    }
}
```

LitePress projects replace PostgreSQL with SurrealDB Testcontainers per `docs/decisions/surrealdb-persistence.md`.

Reset strategy: truncate or recreate schema in `[BeforeScenario]` when scenarios require isolation. Respawn is optional (`standards.manifest.json` conditional packages).
