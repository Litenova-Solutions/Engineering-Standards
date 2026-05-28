# Blueprint: Scenario State

Copy to `Support/ScenarioState.cs`.

```csharp
public sealed class ScenarioState
{
    public string? BearerToken { get; set; }
    public string? PostId { get; set; }
    public string? DraftTitle { get; set; }
    public HttpResponseMessage? LastResponse { get; set; }

    public void Reset()
    {
        BearerToken = null;
        PostId = null;
        DraftTitle = null;
        LastResponse?.Dispose();
        LastResponse = null;
    }
}
```

Register a fresh instance per scenario in hooks. Do not use static mutable fields for IDs, tokens, or responses.
