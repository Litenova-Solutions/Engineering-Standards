# Blueprint: Post Publishing Steps

Copy to `Steps/PostPublishingSteps.cs`.

```csharp
[Binding]
public sealed class PostPublishingSteps
{
    private readonly ScenarioContext _scenarioContext;

    public PostPublishingSteps(ScenarioContext scenarioContext)
    {
        _scenarioContext = scenarioContext;
    }

    private ScenarioState State => _scenarioContext.Get<ScenarioState>();
    private AcceptanceTestWebAppFactory Factory => _scenarioContext.Get<AcceptanceTestWebAppFactory>();
    private TestApiClient Api => _scenarioContext.Get<TestApiClient>();

    [Given("the author has a draft post titled {string}")]
    public async Task GivenTheAuthorHasADraftPost(string title)
    {
        State.DraftTitle = title;
        var createResponse = await Api.CreateDraftPostAsync(title, State.BearerToken!);
        createResponse.IsSuccessStatusCode.Should().BeTrue();
        State.PostId = await Api.ReadPostIdAsync(createResponse);
    }

    [When("the author publishes the post")]
    public async Task WhenTheAuthorPublishesThePost()
    {
        State.LastResponse = await Api.PublishPostAsync(State.PostId!, State.BearerToken);
    }

    [When("an unauthenticated caller publishes the post")]
    public async Task WhenAnUnauthenticatedCallerPublishesThePost()
    {
        State.LastResponse = await Api.PublishPostAsync(State.PostId!, bearerToken: null);
    }
}
```

When steps MUST call HTTP only. Given steps MAY use builders or setup APIs.
