using Litenova.Standards.Services;

namespace Litenova.Standards.Tests;

public sealed class ConsumerGeneratorTests : IDisposable
{
    private readonly string _root = Path.Combine(Path.GetTempPath(), $"standards-{Guid.NewGuid():N}");

    [Fact]
    public void Validate_accepts_active_criteria_with_test_references()
    {
        TestRepositoryBuilder.Create(_root);
        var projectPath = ConsumerTestBuilder.Create(_root, includeTestReference: true);
        var standards = StandardsRepository.Load(_root);
        var consumer = ConsumerRepository.Load(projectPath);

        var report = ConsumerGenerator.Validate(standards, consumer);
        var output = ConsumerGenerator.Render(consumer);

        Assert.True(report.IsValid, string.Join(Environment.NewLine, report.Errors.Select(error => error.Message)));
        Assert.Equal(5, output.Count);
        Assert.Contains("posts.create", output["docs/domain/agent-index.json"], StringComparison.Ordinal);
        Assert.Contains("apps/api/tests/Sample.Integration.Tests/CreatePostTests.cs", output["docs/domain/traceability.md"], StringComparison.Ordinal);
    }

    [Fact]
    public void Validate_rejects_active_criteria_without_test_references()
    {
        TestRepositoryBuilder.Create(_root);
        var projectPath = ConsumerTestBuilder.Create(_root, includeTestReference: false);
        var standards = StandardsRepository.Load(_root);
        var consumer = ConsumerRepository.Load(projectPath);

        var report = ConsumerGenerator.Validate(standards, consumer);

        Assert.Contains(report.Errors, issue => issue.Code == "TRACE_MISSING");
    }

    [Fact]
    public void Write_and_check_produce_stable_consumer_files()
    {
        TestRepositoryBuilder.Create(_root);
        var projectPath = ConsumerTestBuilder.Create(_root, includeTestReference: true);
        var standards = StandardsRepository.Load(_root);
        var consumer = ConsumerRepository.Load(projectPath);

        ConsumerGenerator.Write(consumer);
        var report = ConsumerGenerator.Check(standards, consumer);

        Assert.True(report.IsValid, string.Join(Environment.NewLine, report.Errors.Select(error => error.Message)));
    }

    public void Dispose()
    {
        if (Directory.Exists(_root))
        {
            Directory.Delete(_root, recursive: true);
        }
    }
}

