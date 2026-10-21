using System.Text.Json.Nodes;
using LiteSpec.Tests.Support;

namespace LiteSpec.Tests.Consumer;

/// <summary>
/// Proves <c>litespec consumer</c> against the fixture consumer, asserting the expected
/// diagnostics. Each test owns its own folder because tests run in parallel.
/// </summary>
public sealed partial class ConsumerValidatorTests
{
    /// <summary>The output lines that start with <c>  - </c>, without the prefix.</summary>
    static List<string> Problems(CliResult result) => result.Output
        .Split('\n')
        .Where(line => line.StartsWith("  - ", StringComparison.Ordinal))
        .Select(line => line[4..])
        .ToList();

    /// <summary>Asserts a clean run: no problems and exit 0.</summary>
    static void AssertClean(CliResult result)
    {
        var problems = Problems(result);
        Assert.Equal(0, result.Status);
        Assert.Empty(problems);
    }

    /// <summary>Asserts a failing run: exit 1 with some problem carrying the expectation.</summary>
    static void AssertProblem(CliResult result, string expected)
    {
        var problems = Problems(result);
        Assert.Equal(1, result.Status);
        Assert.Contains(problems, problem => problem.Contains(expected, StringComparison.Ordinal));
    }

    /// <summary>
    /// Asserts no problem names the diagnostic. The exit code follows the problems
    /// actually printed: 1 when any problem remains, 0 otherwise.
    /// </summary>
    static void AssertAbsent(CliResult result, string absent)
    {
        var problems = Problems(result);
        Assert.Equal(problems.Count > 0 ? 1 : 0, result.Status);
        Assert.All(problems, problem => Assert.DoesNotContain(absent, problem));
    }

    static CliResult RunConsumer(string root, params string[] extra)
    {
        string[] args = ["consumer", "--root", root, ..extra];
        return Cli.Run(args);
    }

    static JsonObject PathsOf(JsonObject project) => (JsonObject)project["paths"]!;

    [Fact(DisplayName = "fixture validates as written")]
    public void FixtureValidatesAsWritten()
    {
        using var folder = ConsumerFixture.Create();
        AssertClean(RunConsumer(folder.Path));
    }

    [Fact(DisplayName = "a template placeholder left in the project file")]
    public void TemplatePlaceholderLeftInTheProjectFile()
    {
        using var folder = ConsumerFixture.Create();
        ConsumerFixture.MutateProject(folder.Path, project => project["owners"] = new JsonArray("__OWNER__"));
        AssertProblem(RunConsumer(folder.Path), "template placeholder '__OWNER__' is not filled");
    }

    [Fact(DisplayName = "size outside the allowed sizes")]
    public void SizeOutsideTheAllowedSizes()
    {
        using var folder = ConsumerFixture.Create();
        ConsumerFixture.MutateProject(folder.Path, project => project["size"] = "colossal");
        AssertProblem(RunConsumer(folder.Path), "/size");
    }

    [Fact(DisplayName = "reviewed version outside its form")]
    public void ReviewedVersionOutsideItsForm()
    {
        using var folder = ConsumerFixture.Create();
        ConsumerFixture.MutateProject(folder.Path, project => project["reviewedLiteSpecVersion"] = "v2");
        AssertProblem(RunConsumer(folder.Path), "/reviewedLiteSpecVersion");
    }

    [Fact(DisplayName = "selected extensions outside its array form")]
    public void SelectedExtensionsOutsideItsArrayForm()
    {
        using var folder = ConsumerFixture.Create();
        ConsumerFixture.MutateProject(folder.Path, project => project["selectedExtensions"] = "outbox");
        AssertProblem(RunConsumer(folder.Path), "/selectedExtensions");
    }

    [Fact(DisplayName = "frontend platform outside the stacks")]
    public void FrontendPlatformOutsideTheStacks()
    {
        using var folder = ConsumerFixture.Create();
        ConsumerFixture.MutateProject(folder.Path, project =>
        {
            PathsOf(project)["frontends"] = new JsonArray(
                new JsonObject { ["name"] = "web", ["path"] = "apps/web", ["platform"] = "winforms" });
        });
        AssertProblem(RunConsumer(folder.Path), "/paths/frontends/0/platform");
    }

    [Fact(DisplayName = "reviewed version behind the pinned release")]
    public void ReviewedVersionBehindThePinnedRelease()
    {
        using var folder = ConsumerFixture.Create();
        ConsumerFixture.MutateProject(folder.Path, project => project["reviewedLiteSpecVersion"] = "0.0.0");
        AssertProblem(RunConsumer(folder.Path), "does not match the pinned LiteSpec release");
    }

    [Fact(DisplayName = "extension the manifest does not ship")]
    public void ExtensionTheManifestDoesNotShip()
    {
        using var folder = ConsumerFixture.Create();
        ConsumerFixture.MutateProject(folder.Path, project =>
        {
            project["selectedExtensions"] = new JsonArray(
                new JsonObject
                {
                    ["id"] = "no-such-extension",
                    ["criterion"] = "Nothing needs it.",
                    ["reviewBy"] = "2999-01-01",
                });
        });
        AssertProblem(RunConsumer(folder.Path), "is not an extension in the pinned LiteSpec release");
    }

    [Fact(DisplayName = "extension whose review date passed")]
    public void ExtensionWhoseReviewDatePassed()
    {
        using var folder = ConsumerFixture.Create();
        ConsumerFixture.MutateProject(folder.Path, project =>
        {
            project["selectedExtensions"] = new JsonArray(
                new JsonObject
                {
                    ["id"] = ConsumerFixture.KnownExtension,
                    ["criterion"] = "The suite needs one.",
                    ["reviewBy"] = "2020-01-01",
                });
        });
        AssertProblem(RunConsumer(folder.Path), "was due for review on 2020-01-01");
    }

    [Fact(DisplayName = "known extension with a live review date")]
    public void KnownExtensionWithALiveReviewDate()
    {
        using var folder = ConsumerFixture.Create();
        ConsumerFixture.MutateProject(folder.Path, project =>
        {
            project["selectedExtensions"] = new JsonArray(
                new JsonObject
                {
                    ["id"] = ConsumerFixture.KnownExtension,
                    ["criterion"] = "The suite needs one.",
                    ["reviewBy"] = "2999-01-01",
                });
        });
        AssertClean(RunConsumer(folder.Path));
    }
}
