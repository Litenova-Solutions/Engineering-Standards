using System.Text.Json;
using Litenova.Standards.Services;

namespace Litenova.Standards.Tests;

public sealed class StandardsGeneratorTests : IDisposable
{
    private readonly string _root = Path.Combine(Path.GetTempPath(), $"standards-{Guid.NewGuid():N}");

    [Fact]
    public void Render_is_deterministic_and_sorted()
    {
        TestRepositoryBuilder.Create(_root);
        var repository = StandardsRepository.Load(_root);

        var first = StandardsGenerator.Render(repository);
        var second = StandardsGenerator.Render(repository);

        Assert.Equal(first["generated/rule-catalog.json"], second["generated/rule-catalog.json"]);
        using var json = JsonDocument.Parse(first["generated/rule-catalog.json"]);
        var rules = json.RootElement.GetProperty("data").EnumerateArray().ToArray();
        Assert.Equal("CORE.SCOPE.001", rules[0].GetProperty("id").GetString());
        Assert.Equal("CORE.SCOPE.002", rules[1].GetProperty("id").GetString());
    }

    [Fact]
    public void Check_reports_missing_generated_files()
    {
        TestRepositoryBuilder.Create(_root);
        var repository = StandardsRepository.Load(_root);

        var report = StandardsGenerator.Check(repository);

        Assert.False(report.IsValid);
        Assert.Equal(4, report.Errors.Count);
        Assert.All(report.Errors, issue => Assert.Equal("GENERATED_MISSING", issue.Code));
    }

    public void Dispose()
    {
        if (Directory.Exists(_root))
        {
            Directory.Delete(_root, recursive: true);
        }
    }
}

