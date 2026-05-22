# Backend Testing

This document defines backend testing philosophy, test project structure, and patterns. Frontend testing rules live in `docs/conventions/frontend/06-testing.md`.

## Agent Quick Rules

- Assertions MUST use AwesomeAssertions; MUST NOT use xUnit `Assert.*` in new tests.
- Domain tests: no mocks; Application command tests: mock repositories only.
- Query handler tests: PostgreSQL via Testcontainers (same provider as production); Integration: Testcontainers PostgreSQL.
- `{ProjectName}.Architecture.Tests` with NetArchTest is REQUIRED (`docs/decisions/architecture-tests-as-enforcement.md`).
- Mutation testing REQUIRED for high-risk validators; OPTIONAL elsewhere.

---

## Testing Philosophy

Test behavior, not implementation. A test that breaks when you rename a private method is not a useful test. A test that breaks when the behavior of the system changes is.

**What this means in practice:**

- Domain tests verify that aggregate methods produce the correct state changes and raise the correct events. They do not care which private helper method was called internally.
- Application handler tests verify that a handler produces the correct outcome (calls the right repository method, throws the right exception). They do not verify the exact sequence of internal calls.
- Integration tests verify that the full HTTP pipeline from request to response behaves correctly, including the database. They test the system as a user would experience it.

---

## Strict Code Coverage and Mocking Constraints

To ensure maximum system reliability and guard against regression, all active projects **MUST** adhere to strict test coverage thresholds and mocking boundaries.

### 1. Code Coverage Budgets
Test coverage is enforced in CI/CD pipeline gates via `coverlet.collector`. Any pull request that reduces coverage below these limits **SHALL** fail build verification:

| Project / Layer | Minimum Coverage Threshold | Metric Scope |
|:---|:---:|:---|
| `{ProjectName}.Domain` | **90%** | Line & Branch coverage |
| `{ProjectName}.Application.Write` | **85%** | Line & Branch coverage |
| `{ProjectName}.Application.Read` | **80%** | Line & Branch coverage |
| `{ProjectName}.Application.Reactions` | **80%** | Line coverage |

CI verification pipeline commands **MUST** enforce this standard:
```bash
dotnet test apps/api/{ProjectName}.slnx /p:CollectCoverage=true /p:Threshold=80 /p:ThresholdType=branch
```

Use per-project thresholds to enforce the table above:

```bash
dotnet test apps/api/tests/{ProjectName}.Domain.Tests \
    /p:CollectCoverage=true \
    /p:Threshold=90 \
    /p:ThresholdType=branch \
    /p:CoverletOutputFormat=opencover

dotnet test apps/api/tests/{ProjectName}.Application.Tests \
    /p:CollectCoverage=true \
    /p:Threshold=85 \
    /p:ThresholdType=branch \
    /p:CoverletOutputFormat=opencover
```

Add `coverlet.collector` to each test project's `.csproj`:

```xml
<!-- apps/api/tests/{ProjectName}.Domain.Tests/{ProjectName}.Domain.Tests.csproj -->
<Project Sdk="Microsoft.NET.Sdk">
  <ItemGroup>
    <PackageReference Include="coverlet.collector" />
  </ItemGroup>
</Project>
```

### 2. Strict Mocking Guidelines
Mocking is a powerful tool, but over-mocking creates fragile tests that lock implementation details rather than behavior.

*   **Forbid Mocking `IDatabaseContext`:** You **MUST NOT** use NSubstitute or any mocking library to mock `IDatabaseContext` or `IQueryable<T>`. Query handler tests **MUST** use a real PostgreSQL database via Testcontainers so LINQ translations match production (including PostgreSQL-specific functions in `docs/conventions/backend/19-raw-sql-and-reporting.md`).
*   **No Mock Verification on Queries:** Since queries are side-effect-free, you **MUST NOT** verify that a mock was called during a query handler test. Query assertions **MUST** rely exclusively on asserting the correctness of the returned result.
*   **Limit Mock Depth (No Transitive Mocking):** NSubstitute mocks **MUST** only mock direct dependencies of the unit under test (e.g., `IPostRepository`). Mocking nested dependencies (e.g., mocking a dependency returned by another mocked object) is strictly forbidden. If a dependency requires complex setup, use a real lightweight test implementation or a Test Builder instead.

---

## Test Project Structure

```
tests/
├── {ProjectName}.Domain.Tests/
│   └── Posts/
│       ├── PostTests.cs
│       └── PostTitleTests.cs
├── {ProjectName}.Application.Tests/
│   └── Posts/
│       ├── CreatePostCommandHandlerTests.cs
│       ├── GetPostByIdQueryHandlerTests.cs
│       └── PublishPostCommandValidatorTests.cs
│   └── TestData/
│       └── PostBuilder.cs
├── {ProjectName}.Integration.Tests/
│   ├── Posts/
│   │   ├── CreatePostEndpointTests.cs
│   │   └── GetPostByIdEndpointTests.cs
│   └── Fixtures/
│       ├── IntegrationTestWebAppFactory.cs
│       └── DatabaseSeeder.cs
└── {ProjectName}.Architecture.Tests/
    └── ApplicationLayerTests.cs
```

`Application.Tests` covers handlers and validators from all five application projects (`Application.Write`, `Application.Read`, and `Application.Reactions`). There is no separate test project per application project unless the project is very large.

`{ProjectName}.Architecture.Tests` contains architecture tests using NetArchTest that enforce structural rules. These tests run as part of `dotnet test` and fail the build if a structural rule is violated.

### `{ProjectName}.Domain.Tests`

Unit tests for aggregates, value objects, and domain services. No mocking frameworks are needed. Domain objects are pure in-memory objects with no external dependencies.

### `{ProjectName}.Application.Tests`

Unit tests for command handlers, validators, and event handlers use NSubstitute to mock repository interfaces. Query handler tests use PostgreSQL via Testcontainers with a shared fixture per test class. This exercises the same SQL dialect as production, including raw SQL and full-text search.

### `{ProjectName}.Integration.Tests`

Tests that spin up the full application against a real PostgreSQL database using Testcontainers. Test the full HTTP pipeline from an HTTP request to an HTTP response. Seed test data with a `DatabaseSeeder` helper.

---

## Naming Convention

Every test method follows the pattern: `{MethodUnderTest}_When{Condition}_Should{ExpectedOutcome}`

```csharp
Publish_WhenPostIsAlreadyPublished_ShouldThrowPostAlreadyPublishedException()
HandleAsync_WhenPostDoesNotExist_ShouldThrowPostNotFoundException()
POST_WithValidRequest_ShouldReturn201AndPostId()
```

---

## Domain Test Pattern

Domain tests require xUnit only. No mocking. No infrastructure.

```csharp
public sealed class PostTests
{
    [Fact]
    public void Publish_WhenPostIsDraft_ShouldTransitionToPublishedState()
    {
        var post = Post.Create(
            PostId.New(),
            new PostTitle("My First Post"),
            new PostContent("Hello world."),
            new AuthorId(Guid.NewGuid()));

        post.Publish();

        post.State.Should().BeOfType<PublishedPostState>();
    }

    [Fact]
    public void Publish_WhenPostIsDraft_ShouldRaisePostPublishedEvent()
    {
        var post = Post.Create(
            PostId.New(),
            new PostTitle("My First Post"),
            new PostContent("Hello world."),
            new AuthorId(Guid.NewGuid()));

        post.Publish();

        post.DomainEvents.Should().ContainSingle(e => e is PostPublished);
    }

    [Fact]
    public void Publish_WhenPostIsAlreadyPublished_ShouldThrowPostAlreadyPublishedException()
    {
        var post = Post.Create(
            PostId.New(),
            new PostTitle("My First Post"),
            new PostContent("Hello world."),
            new AuthorId(Guid.NewGuid()));

        post.Publish();

        var act = () => post.Publish();

        act.Should().Throw<PostAlreadyPublishedException>();
    }
}
```

## Test Data Builders

Use test data builders for aggregates or request bodies that appear in more than two tests. Builders live in the test project that uses them. Do not put test builders in production projects.

```csharp
// GOOD: builder gives tests stable defaults
internal sealed class PostBuilder
{
    private PostId _id = PostId.New();
    private string _title = "My First Post";
    private string _content = "Hello world.";
    private AuthorId _authorId = new(Guid.CreateVersion7());

    public PostBuilder WithTitle(string title)
    {
        _title = title;
        return this;
    }

    public Post Build()
    {
        return Post.Create(
            _id,
            new PostTitle(_title),
            new PostContent(_content),
            _authorId);
    }
}
```

```csharp
// BAD: every test repeats irrelevant aggregate construction details
var post = Post.Create(
    PostId.New(),
    new PostTitle("My First Post"),
    new PostContent("Hello world."),
    new AuthorId(Guid.CreateVersion7()));
```

---

## Application Handler Test Pattern

### Command Handler Test

Command handler tests use NSubstitute to mock repository interfaces. Command handlers no longer call `SaveChangesAsync`, so tests do not need to assert that `SaveChangesAsync` was called on a mock.

```csharp
public sealed class CreatePostCommandHandlerTests
{
    private readonly IPostRepository _postRepository = Substitute.For<IPostRepository>();
    private readonly CreatePostCommandHandler _handler;

    public CreatePostCommandHandlerTests()
    {
        _handler = new CreatePostCommandHandler(_postRepository);
    }

    [Fact]
    public async Task HandleAsync_WithValidCommand_ShouldCallAddAsync()
    {
        var command = new CreatePostCommand
        {
            Id = PostId.New(),
            Title = "Hello World",
            Content = "Some content.",
            AuthorId = new AuthorId(Guid.NewGuid())
        };

        await _handler.HandleAsync(command, CancellationToken.None);

        await _postRepository.Received(1).AddAsync(
            Arg.Is<Post>(p => p.Title.Value == command.Title),
            Arg.Any<CancellationToken>());
        // SaveChangesAsync is NOT called in the handler; do not assert it here
    }

    [Fact]
    public async Task HandleAsync_WithValidCommand_ShouldReturnNewPostId()
    {
        var command = new CreatePostCommand
        {
            Id = PostId.New(),
            Title = "Hello World",
            Content = "Some content.",
            AuthorId = new AuthorId(Guid.NewGuid())
        };

        var result = await _handler.HandleAsync(command, CancellationToken.None);

        result.Should().Be(command.Id);
    }
}
```

### Query Handler Test

Query handler tests use PostgreSQL via Testcontainers. The `IDatabaseContext` interface is satisfied by a real `AppDbContext` wired to the container, so EF Core query translation matches production. This is required for queries that use PostgreSQL-specific functions (`to_tsvector`, window functions, JSON operators).

Add Testcontainers to the Application.Tests project:

```xml
<PackageReference Include="Testcontainers.PostgreSql" />
<PackageReference Include="Microsoft.EntityFrameworkCore.Design" />
```

```csharp
// Application.Tests/Fixtures/PostgreSqlQueryFixture.cs
public sealed class PostgreSqlQueryFixture : IAsyncLifetime
{
    private readonly PostgreSqlContainer _container = new PostgreSqlBuilder()
        .WithImage("postgres:18-alpine")
        .Build();

    public AppDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseNpgsql(_container.GetConnectionString())
            .UseSnakeCaseNamingConventions()
            .Options;

        var context = new AppDbContext(options);
        context.Database.Migrate();
        return context;
    }

    public Task InitializeAsync() => _container.StartAsync();

    public Task DisposeAsync() => _container.DisposeAsync().AsTask();
}
```

```csharp
// Application.Tests/Posts/GetPostByIdQueryHandlerTests.cs
public sealed class GetPostByIdQueryHandlerTests : IClassFixture<PostgreSqlQueryFixture>, IDisposable
{
    private readonly AppDbContext _db;
    private readonly PostgreSqlQueryFixture _fixture;

    public GetPostByIdQueryHandlerTests(PostgreSqlQueryFixture fixture)
    {
        _fixture = fixture;
        _db = fixture.CreateContext();
    }

    public void Dispose() => _db.Dispose();

    [Fact]
    public async Task HandleAsync_WhenPostExists_ShouldReturnPostResult()
    {
        var post = Post.Create(
            PostId.New(),
            new PostTitle("Test Post"),
            new PostContent("Content"),
            new AuthorId(Guid.NewGuid()),
            DateTimeOffset.UtcNow);

        await _db.Posts.AddAsync(post);
        await _db.SaveChangesAsync();

        var handler = new GetPostByIdQueryHandler(_db);
        var query = new GetPostByIdQuery { PostId = post.Id };

        var result = await handler.HandleAsync(query, CancellationToken.None);

        result.Should().NotBeNull();
        result.Id.Should().Be(post.Id);
        result.Title.Should().Be("Test Post");
    }

    [Fact]
    public async Task HandleAsync_WhenPostDoesNotExist_ShouldThrowPostNotFoundException()
    {
        var handler = new GetPostByIdQueryHandler(_db);
        var query = new GetPostByIdQuery { PostId = PostId.New() };

        var act = () => handler.HandleAsync(query, CancellationToken.None);

        await act.Should().ThrowAsync<PostNotFoundException>();
    }
}
```

> **Why PostgreSQL and not SQLite?** SQLite cannot translate PostgreSQL full-text search, window functions, or many raw SQL patterns documented in `19-raw-sql-and-reporting.md`. Query tests that pass on SQLite and fail in staging are a common agent failure mode. Use Testcontainers for query handler tests; reserve SQLite only for Domain tests that never touch EF Core.

> **PostgreSQL version.** Use `postgres:18-alpine` for new projects. Pin the major version in project ADR if the deployment target requires an older major.

---

## Integration Test Pattern

Integration tests use `WebApplicationFactory<T>` from `Microsoft.AspNetCore.Mvc.Testing` and `Testcontainers.PostgreSql` for a real database.

With top-level statements in .NET, `Program` is an implicit internal class. Add the following at the very end of `WebApi/Program.cs` so `WebApplicationFactory<Program>` compiles:

```csharp
// WebApi/Program.cs — add at the very end of the file, after app.Run()
// Required for WebApplicationFactory<Program> in integration tests.
public partial class Program { }
```

This declaration is included in the canonical `Program.cs` template in `docs/conventions/backend/05-api-layer.md`.

### Shared Fixture

```csharp
sealed class IntegrationTestWebAppFactory : WebApplicationFactory<Program>, IAsyncLifetime
{
    private readonly PostgreSqlContainer _dbContainer = new PostgreSqlBuilder()
        .WithImage("postgres:18-alpine")
        .Build();

    public async Task InitializeAsync()
    {
        await _dbContainer.StartAsync();
    }

    public new async Task DisposeAsync()
    {
        await _dbContainer.StopAsync();
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureTestServices(services =>
        {
            var descriptor = services.SingleOrDefault(
                d => d.ServiceType == typeof(DbContextOptions<AppDbContext>));

            if (descriptor is not null)
            {
                services.Remove(descriptor);
            }

            services.AddDbContext<AppDbContext>(options =>
                options.UseNpgsql(_dbContainer.GetConnectionString()));
        });
    }
}
```

### Test Class

```csharp
public sealed class CreatePostEndpointTests(IntegrationTestWebAppFactory factory)
    : IClassFixture<IntegrationTestWebAppFactory>
{
    private readonly HttpClient _client = factory.CreateClient();

    [Fact]
    public async Task POST_WithValidRequest_ShouldReturn201AndPostId()
    {
        var request = new CreatePostRequest
        {
            Title = "Integration Test Post",
            Content = "This is a test."
        };

        var response = await _client.PostAsJsonAsync("/posts", request);

        response.StatusCode.Should().Be(HttpStatusCode.Created);
        response.Headers.Location.Should().NotBeNull();

        var body = await response.Content.ReadFromJsonAsync<CreatePostResponse>();
        body!.Id.Should().NotBe(Guid.Empty);
    }

    [Fact]
    public async Task POST_WithEmptyTitle_ShouldReturn400()
    {
        var request = new CreatePostRequest
        {
            Title = "",
            Content = "This is a test."
        };

        var response = await _client.PostAsJsonAsync("/posts", request);

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task GET_WithNonExistentId_ShouldReturn404()
    {
        var response = await _client.GetAsync($"/posts/{Guid.NewGuid()}");

        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }
}
```

---

## Architecture Tests

Architecture tests enforce structural rules that project references cannot enforce. They live in `{ProjectName}.Architecture.Tests` and run in CI on every PR.

```csharp
public sealed class ApplicationLayerTests
{
    [Fact]
    public void QueryHandlers_ShouldNotDependOn_InfrastructureProject()
    {
        // Query handlers inject IDatabaseContext, not AppDbContext directly.
        // Application.Read must not reference the Infrastructure project.
        var result = Types
            .InAssembly(typeof(GetPostByIdQueryHandler).Assembly)
            .ShouldNot()
            .HaveDependencyOn("Infrastructure")
            .GetResult();

        result.IsSuccessful.Should().BeTrue(
            because: "query handlers must inject IDatabaseContext from " +
                     "Application.Read.Contracts, not AppDbContext from Infrastructure.");
    }

    [Fact]
    public void CommandAndQueryHandlers_ShouldBeInternalSealed()
    {
        var result = Types
            .InAssemblies([
                typeof(CreatePostCommandHandler).Assembly,
                typeof(GetPostByIdQueryHandler).Assembly
            ])
            .That()
            .ImplementInterface(typeof(ICommandHandler<>))
            .Or()
            .ImplementInterface(typeof(ICommandHandler<,>))
            .Or()
            .ImplementInterface(typeof(IQueryHandler<,>))
            .Should()
            .BeSealed()
            .And()
            .NotBePublic()
            .GetResult();

        result.IsSuccessful.Should().BeTrue(
            because: "all handlers must be internal sealed per §4 of the application layer guide.");
    }

    [Fact]
    public void ReactionsProject_ShouldNotDependOn_ExternalLibraries()
    {
        var result = Types
            .InAssembly(typeof(NotifySubscribersOnPostPublishedEventHandler).Assembly)
            .ShouldNot()
            .HaveDependencyOn("Microsoft.EntityFrameworkCore")
            .GetResult();

        result.IsSuccessful.Should().BeTrue(
            because: "Application.Reactions must not reference Infrastructure libraries directly. " +
                     "See docs/decisions/reactions-project-depends-only-on-abstractions.md");
    }
}
```

---

## What Not to Test

- **Do not test EF Core mappings directly.** If the entity maps correctly to and from the database, the integration tests will surface that.
- **Do not assert that a mock was called with specific arguments as the primary assertion.** Test the observable outcome. Use received-call assertions only when the outcome is not otherwise observable.
- **Do not duplicate domain tests in handler tests.** If `Post.Publish()` throws when the post is already published, that is tested in the Domain tests.

---

## Contract and OpenAPI Tests

Projects with a frontend MUST validate that the committed OpenAPI spec is fresh.

CI MUST:

1. Build the backend.
2. Generate or export the OpenAPI spec.
3. Compare it with `packages/api-types/openapi.json`.
4. Run `openapi-typescript`.
5. Fail if generated files differ from committed files.

Snapshot tests are allowed for stable API response bodies and OpenAPI documents. Do not use snapshots for highly volatile data such as timestamps, generated IDs, or localized text without normalizing those values first.

---

## Performance, Load, and Mutation Testing

Every production project defines a small performance baseline:

| Target | Default Budget |
|:---|:---|
| Authenticated command endpoint p95 | Project-defined |
| Authenticated query endpoint p95 | Project-defined |
| Public list endpoint p95 | Project-defined |
| Background job max lag | Project-defined |

Run load tests before enabling rate limiting, caching, or realtime features in production. Rate limiting policies must be validated under realistic concurrency.

Mutation testing is REQUIRED for high-risk application validators (auth, payments, permissions, idempotency). Mutation testing is OPTIONAL for domain logic and other validators. Scheduled CI jobs MUST run mutation testing for projects that declare validators as high-risk in their test configuration.

**Tooling:** Use Stryker.NET (`dotnet-stryker`). Add it to `.config/dotnet-tools.json` alongside `dotnet-ef`:

```json
// .config/dotnet-tools.json
{
  "tools": {
    "dotnet-stryker": {
      "version": "4.14.2",
      "commands": ["dotnet-stryker"]
    }
  }
}
```

Run against a specific test project:

```bash
dotnet tool restore   # installs from dotnet-tools.json

dotnet stryker \
    --project apps/api/src/{ProjectName}.Application.Write/{ProjectName}.Application.Write.csproj \
    --test-project apps/api/tests/{ProjectName}.Application.apps/api/tests/{ProjectName}.Application.Tests.csproj
```

---

Project-specific test configuration (shared fixtures, seeding helpers, authentication setup, coverage thresholds) is documented in the project repository.
