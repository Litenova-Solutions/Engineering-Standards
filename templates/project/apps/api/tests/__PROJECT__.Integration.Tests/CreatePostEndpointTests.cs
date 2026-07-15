using System.Net;
using System.Net.Http.Json;
using __PROJECT__.Application.Posts.GetPost;

namespace __PROJECT__.Integration.Tests;

public sealed class CreatePostEndpointTests(ApiFactory factory) : IClassFixture<ApiFactory>
{
    [Fact]
    [Trait("AcceptanceCriterion", "AC-POSTS-CREATE-01")]
    public async Task Authenticated_author_can_create_and_read_a_post()
    {
        using var client = factory.CreateClient();

        var createResponse = await client.PostAsJsonAsync("/api/posts", new { title = "First post" });

        createResponse.StatusCode.Should().Be(HttpStatusCode.Created);
        var created = await createResponse.Content.ReadFromJsonAsync<CreatePostResponse>();
        created.Should().NotBeNull();

        var post = await client.GetFromJsonAsync<PostResult>($"/api/posts/{created!.PostId}");
        post.Should().NotBeNull();
        post!.Title.Should().Be("First post");
        post.AuthorId.Should().Be(Guid.Parse("11111111-1111-1111-1111-111111111111"));
    }

    private sealed record CreatePostResponse(Guid PostId, string Title);
}

