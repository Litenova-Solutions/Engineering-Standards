using Litenova.Standards.Services;

namespace Litenova.Standards.Tests;

public sealed class UseCaseScaffolderTests : IDisposable
{
    private readonly string _root = Path.Combine(Path.GetTempPath(), $"standards-{Guid.NewGuid():N}");

    [Fact]
    public void Scaffold_creates_feature_and_use_case_without_overwriting()
    {
        TestRepositoryBuilder.Create(_root);
        ConsumerTestBuilder.CreateTemplates(_root);
        var projectPath = ConsumerTestBuilder.Create(_root, includeTestReference: false, includeUseCase: false);
        var standards = StandardsRepository.Load(_root);

        UseCaseScaffolder.Scaffold(
            standards,
            projectPath,
            "posts",
            "create-post",
            "command",
            "author",
            "Create post");

        var useCasePath = Path.Combine(Path.GetDirectoryName(projectPath)!, "docs", "domain", "posts", "create-post.md");
        var content = File.ReadAllText(useCasePath);
        Assert.Contains("\"id\": \"posts.create-post\"", content, StringComparison.Ordinal);
        Assert.Contains("AC-POSTS-CREATE-POST-01", content, StringComparison.Ordinal);
        Assert.Throws<InvalidOperationException>(() => UseCaseScaffolder.Scaffold(
            standards,
            projectPath,
            "posts",
            "create-post",
            "command",
            "author",
            null));
    }

    public void Dispose()
    {
        if (Directory.Exists(_root))
        {
            Directory.Delete(_root, recursive: true);
        }
    }
}

