# Blueprint: Integration Test Factory

Copy to `apps/api/tests/{ProjectName}.Integration.Tests/Fixtures/IntegrationTestWebAppFactory.cs`.

```csharp
public sealed class IntegrationTestWebAppFactory : WebApplicationFactory<Program>, IAsyncLifetime
{
    private readonly PostgreSqlContainer _dbContainer = new PostgreSqlBuilder()
        .WithImage("postgres:17-alpine")
        .Build();

    public async Task InitializeAsync()
    {
        await _dbContainer.StartAsync();
    }

    public new async Task DisposeAsync()
    {
        await _dbContainer.DisposeAsync();
        await base.DisposeAsync();
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");

        builder.ConfigureTestServices(services =>
        {
            services.AddAuthentication(TestAuthHandler.SchemeName)
                .AddScheme<AuthenticationSchemeOptions, TestAuthHandler>(
                    TestAuthHandler.SchemeName,
                    _ => { });

            services.PostConfigureAll<JwtBearerOptions>(options =>
            {
                options.TokenValidationParameters.ValidateIssuer = false;
            });
        });

        builder.ConfigureAppConfiguration((_, config) =>
        {
            config.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["ConnectionStrings:database"] = _dbContainer.GetConnectionString(),
                ["JwtSettings:Secret"] = "integration-test-secret-at-least-32-characters-long",
                ["JwtSettings:Issuer"] = "https://test.local",
                ["JwtSettings:Audience"] = "test-api",
                ["Cors:AllowedOrigins:0"] = "http://localhost:3000"
            });
        });
    }
}
```

### `Fixtures/TestAuthHandler.cs`

Copy from `docs/conventions/backend/15-authentication-and-authorization.md` section 8 (Integration Test Authentication).
