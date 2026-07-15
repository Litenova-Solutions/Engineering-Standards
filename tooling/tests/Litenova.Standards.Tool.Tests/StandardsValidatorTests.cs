using Litenova.Standards.Services;

namespace Litenova.Standards.Tests;

public sealed class StandardsValidatorTests : IDisposable
{
    private readonly string _root = Path.Combine(Path.GetTempPath(), $"standards-{Guid.NewGuid():N}");

    [Fact]
    public void Validate_accepts_a_consistent_repository()
    {
        TestRepositoryBuilder.Create(_root);
        var repository = StandardsRepository.Load(_root);

        var report = StandardsValidator.Validate(repository);

        Assert.True(report.IsValid, string.Join(Environment.NewLine, report.Errors.Select(error => error.Message)));
    }

    [Fact]
    public void Validate_rejects_duplicate_rule_ids()
    {
        TestRepositoryBuilder.Create(_root);
        var path = Path.Combine(_root, "docs", "core", "second.md");
        File.WriteAllText(path, TestRepositoryBuilder.Document(
            "core.second",
            "## CORE.SCOPE.001 - Duplicate rule\n\nDuplicate."));
        var repository = StandardsRepository.Load(_root);

        var report = StandardsValidator.Validate(repository);

        Assert.Contains(report.Errors, issue => issue.Code == "RULE_ID");
    }

    [Fact]
    public void Validate_rejects_missing_load_plan_anchor()
    {
        TestRepositoryBuilder.Create(_root);
        var path = Path.Combine(_root, "docs", "core", "principles.md");
        File.WriteAllText(
            path,
            File.ReadAllText(path).Replace(
                "Agent Quick Rules {#agent-quick-rules}",
                "Renamed Rules {#renamed-rules}",
                StringComparison.Ordinal));
        var repository = StandardsRepository.Load(_root);

        var report = StandardsValidator.Validate(repository);

        Assert.Contains(report.Errors, issue => issue.Code == "LOAD_ANCHOR");
    }

    public void Dispose()
    {
        if (Directory.Exists(_root))
        {
            Directory.Delete(_root, recursive: true);
        }
    }
}
