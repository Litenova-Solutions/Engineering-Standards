# Blueprint: Test API Client

Copy to `Support/TestApiClient.cs`.

```csharp
public sealed class TestApiClient
{
    private readonly HttpClient _client;

    public TestApiClient(HttpClient client)
    {
        _client = client;
    }

    public async Task<HttpResponseMessage> PublishPostAsync(string postId, string? bearerToken)
    {
        var request = new HttpRequestMessage(HttpMethod.Post, $"/api/posts/{postId}/publish");
        if (bearerToken is not null)
        {
            request.Headers.Authorization =
                new AuthenticationHeaderValue("Bearer", bearerToken);
        }

        return await _client.SendAsync(request);
    }

    public async Task<HttpResponseMessage> GetPublishedPostsAsync()
    {
        return await _client.GetAsync("/api/posts");
    }
}
```

Keep transport details in support classes, not in Gherkin.
