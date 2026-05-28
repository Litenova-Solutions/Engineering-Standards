# Blueprint: Response Steps

Copy to `Steps/ResponseSteps.cs`. Use for generic HTTP outcome assertions shared across features.

```csharp
[Binding]
public sealed class ResponseSteps
{
    private readonly ScenarioContext _scenarioContext;

    public ResponseSteps(ScenarioContext scenarioContext)
    {
        _scenarioContext = scenarioContext;
    }

    private ScenarioState State => _scenarioContext.Get<ScenarioState>();
    private TestApiClient Api => _scenarioContext.Get<TestApiClient>();

    [Then("the response is successful")]
    public void ThenTheResponseIsSuccessful()
    {
        State.LastResponse.Should().NotBeNull();
        State.LastResponse!.IsSuccessStatusCode.Should().BeTrue();
    }

    [Then("the response is unauthorized")]
    public void ThenTheResponseIsUnauthorized()
    {
        State.LastResponse!.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Then("the response is a conflict problem")]
    public async Task ThenTheResponseIsAConflictProblem()
    {
        State.LastResponse!.StatusCode.Should().Be(HttpStatusCode.Conflict);
        State.LastResponse.Content.Headers.ContentType?.MediaType.Should().Be("application/problem+json");
    }

    [Then("the post is visible in the published posts feed")]
    public async Task ThenThePostIsVisibleInThePublishedPostsFeed()
    {
        var response = await Api.GetPublishedPostsAsync();
        response.IsSuccessStatusCode.Should().BeTrue();
        var body = await response.Content.ReadAsStringAsync();
        body.Should().Contain(State.DraftTitle);
    }
}
```

Avoid a large `CommonSteps` file with vague reusable steps. Keep `ResponseSteps` limited to observable HTTP outcomes.
