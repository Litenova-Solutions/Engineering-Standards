# Testing

This document defines the testing philosophy, test project structure, and patterns used across all projects following these standards.

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
│   └── Posts/
│       ├── PostTests.cs
│       └── PostTitleTests.cs
├── {ProjectName}.Application.Tests/
│   └── Posts/
│       ├── CreatePostCommandHandlerTests.cs
│       ├── GetPostByIdQueryHandlerTests.cs
│       └── PublishPostCommandValidatorTests.cs
└── {ProjectName}.Integration.Tests/
    ├── Posts/
    │   ├── CreatePostEndpointTests.cs
    │   └── GetPostByIdEndpointTests.cs
    └── Fixtures/
        ├── IntegrationTestWebAppFactory.cs
        └── DatabaseSeeder.cs
```

`Application.Tests` covers handlers and validators from all five application projects (`Application.Write`, `Application.Read`, and `Application.Reactions`). There is no separate test project per application project unless the project is very large.

### `{ProjectName}.Domain.Tests`

Unit tests for aggregates, value objects, and domain services. No mocking frameworks are needed. Domain objects are pure in-memory objects with no external dependencies.

### `{ProjectName}.Application.Tests`

Unit tests for command handlers, query handlers, validators, and event handlers. Mock the read store and repository interfaces using NSubstitute. Do not mock domain types; construct them directly.

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

---

## Application Handler Test Pattern

Handler tests use NSubstitute to mock repository and read store interfaces.

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

---

## Integration Test Pattern

Integration tests use `WebApplicationFactory<T>` from `Microsoft.AspNetCore.Mvc.Testing` and `Testcontainers.PostgreSql` for a real database.

### Shared Fixture

```csharp
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
    public void QueryHandlers_ShouldNotDependOn_RepositoryInterfaces()
    {
        var result = Types
            .InAssembly(typeof(GetPostByIdQueryHandler).Assembly)
            .That()
            .ImplementInterface(typeof(IQueryHandler<,>))
            .ShouldNot()
            .HaveDependencyOn("IRepository")
            .GetResult();

        result.IsSuccessful.Should().BeTrue(
            because: "query handlers must inject IReadStore interfaces, not repositories. " +
                     "See docs/conventions/backend/07-query-read-strategy.md");
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
            .InAssembly(typeof(UpdateReadModelOnPostPublishedEventHandler).Assembly)
            .ShouldNot()
            .HaveDependencyOn("Microsoft.EntityFrameworkCore")
            .GetResult();

        result.IsSuccessful.Should().BeTrue(
            because: "Application.Reactions must not reference Infrastructure libraries directly. " +
                     "See docs/adr/0008-reactions-project-depends-only-on-abstractions.md");
    }
}
```

---

## What Not to Test

- **Do not test EF Core mappings directly.** If the entity maps correctly to and from the database, the integration tests will surface that.
- **Do not assert that a mock was called with specific arguments as the primary assertion.** Test the observable outcome. Use received-call assertions only when the outcome is not otherwise observable.
- **Do not duplicate domain tests in handler tests.** If `Post.Publish()` throws when the post is already published, that is tested in the Domain tests.

---

## Project-Specific Test Configuration

> **Note:** This section is filled in per project.

When filling in this section, include:

- **Shared test fixtures** and what they set up
- **Seeding helpers** for common test data scenarios
- **Authentication setup** for integration tests that require authenticated requests
- **Coverage threshold** requirements if enforced in CI