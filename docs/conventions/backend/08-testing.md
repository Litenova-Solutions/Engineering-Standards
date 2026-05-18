# Testing

This document defines the testing philosophy, test project structure, and patterns used in all Litenova Solutions projects.

---

## Testing Philosophy

Test behavior, not implementation. A test that breaks when you rename a private method is not a useful test. A test that breaks when the behavior of the system changes is.

**What this means in practice:**

- Domain tests verify that aggregate methods produce the correct state changes and raise the correct events. They do not care which private helper method was called internally.
- Application handler tests verify that a handler produces the correct outcome (calls the right repository method, throws the right exception). They do not verify the exact sequence of internal calls.
- Integration tests verify that the full HTTP pipeline from request to response behaves correctly, including the database. They test the system as a user would experience it.

---

## Test Project Structure

```
tests/
├── {ProjectName}.Domain.Tests/
│   ├── Posts/
│   │   ├── PostTests.cs
│   │   └── PostTitleTests.cs
│   └── Orders/
│       └── OrderTests.cs
├── {ProjectName}.Application.Tests/
│   └── Posts/
│       ├── CreatePostCommandHandlerTests.cs
│       └── GetPostByIdQueryHandlerTests.cs
└── {ProjectName}.Integration.Tests/
    ├── Posts/
    │   ├── CreatePostEndpointTests.cs
    │   └── GetPostByIdEndpointTests.cs
    └── Fixtures/
        ├── IntegrationTestWebAppFactory.cs
        └── DatabaseSeeder.cs
```

### `{ProjectName}.Domain.Tests`

Unit tests for aggregates, value objects, and domain services. No mocking frameworks are needed. Domain objects are pure in-memory objects with no external dependencies. A test creates an aggregate, calls a method, and asserts on the resulting state or the raised exception.

### `{ProjectName}.Application.Tests`

Unit tests for command handlers, query handlers, and validators. Mock the read store and repository interfaces using NSubstitute. Do not mock domain types — construct them directly.

### `{ProjectName}.Integration.Tests`

Tests that spin up the full application against a real PostgreSQL database using Testcontainers. Test the full HTTP pipeline from an HTTP request to an HTTP response. Seed test data with a `DatabaseSeeder` helper. Assert on response status codes, response bodies, and (where relevant) database state after the request.

---

## Naming Convention

Every test method follows the pattern: `{MethodUnderTest}_When{Condition}_Should{ExpectedOutcome}`

**Examples:**

```csharp
// Domain test
Publish_WhenPostIsAlreadyPublished_ShouldThrowPostAlreadyPublishedException()

// Handler test
HandleAsync_WhenPostDoesNotExist_ShouldThrowPostNotFoundException()

// Integration test
POST_WithValidRequest_ShouldReturn201AndPostId()
```

---

## Domain Test Pattern

Domain tests require xUnit only. No mocking. No infrastructure.

```csharp
// PostTests.cs
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

        Assert.IsType<PublishedPostState>(post.State);
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

        Assert.Contains(post.DomainEvents, e => e is PostPublished);
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

        Assert.Throws<PostAlreadyPublishedException>(() => post.Publish());
    }
}
```

---

## Application Handler Test Pattern

Handler tests use NSubstitute to mock the repository and read store interfaces.

```csharp
// CreatePostCommandHandlerTests.cs
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

        Assert.Equal(command.Id, result);
    }
}
```

---

## Integration Test Pattern

Integration tests use `WebApplicationFactory<T>` from `Microsoft.AspNetCore.Mvc.Testing` and `Testcontainers.PostgreSql` for a real database.

### Shared Fixture

```csharp
// Fixtures/IntegrationTestWebAppFactory.cs
sealed class IntegrationTestWebAppFactory : WebApplicationFactory<Program>, IAsyncLifetime
{
    private readonly PostgreSqlContainer _dbContainer = new PostgreSqlBuilder()
        .WithImage("postgres:16-alpine")
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
            // Replace the real DbContext with one pointing at the test container
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
// Posts/CreatePostEndpointTests.cs
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

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        Assert.NotNull(response.Headers.Location);

        var body = await response.Content.ReadFromJsonAsync<CreatePostResponse>();
        Assert.NotEqual(Guid.Empty, body!.Id);
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

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task GET_WithNonExistentId_ShouldReturn404()
    {
        var response = await _client.GetAsync($"/posts/{Guid.NewGuid()}");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }
}
```

---

## What Not to Test

- **Do not test EF Core mappings directly.** If the entity maps correctly to and from the database, the integration tests will surface that. Unit-testing `IEntityTypeConfiguration<T>` classes adds noise without adding value.

- **Do not assert that a mock was called with specific arguments as the primary assertion.** Test the observable outcome. "The post was added to the repository" is a proxy for "the handler did something" — use it only when the outcome is not otherwise observable. Prefer asserting on the returned value or on the database state.

- **Do not duplicate domain tests in handler tests.** If `Post.Publish()` throws when the post is already published, that is tested in the Domain tests. The handler test does not need to test that scenario — it only needs to test that the handler propagates it correctly (which happens automatically since the handler does not swallow exceptions).

---

## Project-Specific Test Configuration

> **Note:** This section is filled in per-project. It covers any project-specific test helpers, shared fixtures, or seeding utilities.

When filling in this section, include:

- **Shared test fixtures** and what they set up (databases, external service mocks, auth token factories)
- **Seeding helpers** for common test data scenarios (e.g., "a published post with 3 tags")
- **Authentication setup** for integration tests that require authenticated requests
- **Environment-specific test configuration** (test container images, connection string overrides)
- **Coverage threshold** requirements if enforced in CI
