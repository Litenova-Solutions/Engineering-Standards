using Litenova.Standards.Services;

namespace Litenova.Standards.Tests;

public sealed class ProjectScaffolderTests : IDisposable
{
    private readonly string _root = Path.Combine(Path.GetTempPath(), $"standards-{Guid.NewGuid():N}");

    [Fact]
    public void Scaffold_replaces_paths_content_and_gitignore_name()
    {
        TestRepositoryBuilder.Create(_root);
        var templateRoot = Path.Combine(_root, "templates", "project");
        Directory.CreateDirectory(Path.Combine(templateRoot, "apps", "api", "__PROJECT__.Domain"));
        File.WriteAllText(Path.Combine(templateRoot, "gitignore.template"), "**/bin/");
        File.WriteAllText(
            Path.Combine(templateRoot, "apps", "api", "__PROJECT__.Domain", "__PROJECT__.Domain.csproj"),
            "<Project Name=\"__PROJECT__\" Schema=\"__PROJECT_SNAKE__\" />");
        var standards = StandardsRepository.Load(_root);
        var output = Path.Combine(_root, "output");

        ProjectScaffolder.Scaffold(standards, "SampleApp", output, withWeb: false);

        Assert.True(File.Exists(Path.Combine(output, ".gitignore")));
        var projectPath = Path.Combine(output, "apps", "api", "SampleApp.Domain", "SampleApp.Domain.csproj");
        var projectContent = File.ReadAllText(projectPath);
        Assert.Contains("SampleApp", projectContent, StringComparison.Ordinal);
        Assert.Contains("sample_app", projectContent, StringComparison.Ordinal);
        Assert.All(
            Directory.EnumerateFiles(output, "*", SearchOption.AllDirectories).Select(File.ReadAllText),
            content => Assert.DoesNotContain("__PROJECT__", content, StringComparison.Ordinal));
    }

    public void Dispose()
    {
        if (Directory.Exists(_root))
        {
            Directory.Delete(_root, recursive: true);
        }
    }
}
