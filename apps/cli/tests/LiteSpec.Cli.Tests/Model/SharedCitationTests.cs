using LiteSpec.Tests.Support;

namespace LiteSpec.Tests.Model;

/// <summary>Proves shared provision citations resolve against the release the tool carries.</summary>
public sealed class SharedCitationTests
{
    /// <summary>A new-form citation that the carried release holds exits 0.</summary>
    [Fact]
    public void Shared_Citation_That_Resolves_Passes()
    {
        using var temp = ModelFixture.Prepare("small");
        using var home = WriteFixtureHome();
        AppendCitation(temp.Path, "litespec/core/principles#retire-records-with-replaces");
        var result = Cli.Run(
            ["model", "check", "--root", temp.Path, "--format", "json"],
            environment: new Dictionary<string, string> { ["LITESPEC_HOME"] = home.Path });
        Assert.Equal(0, result.Status);
    }

    /// <summary>A new-form citation that the carried release lacks exits 1 with reference-unresolved.</summary>
    [Fact]
    public void Shared_Citation_Without_A_Provision_Reports_Reference_Unresolved()
    {
        using var temp = ModelFixture.Prepare("small");
        using var home = WriteFixtureHome();
        AppendCitation(temp.Path, "litespec/core/principles#no-such-provision");
        var result = Cli.Run(
            ["model", "check", "--root", temp.Path, "--format", "json"],
            environment: new Dictionary<string, string> { ["LITESPEC_HOME"] = home.Path });
        Assert.Equal(1, result.Status);
        Assert.Contains("reference-unresolved", result.Output);
    }

    static TempFolder WriteFixtureHome()
    {
        var home = Cli.Temp("model-home");
        File.WriteAllText(Path.Combine(home.Path, "litespec.manifest.json"), "{\n  \"version\": \"9.9.9-test\"\n}\n");
        var folder = Path.Combine(home.Path, "docs", "core");
        Directory.CreateDirectory(folder);
        File.WriteAllText(Path.Combine(folder, "principles.md"), PinnedPage);
        var backend = Path.Combine(home.Path, "docs", "backend");
        Directory.CreateDirectory(backend);
        File.WriteAllText(Path.Combine(backend, "application.md"), PinnedDeviationTarget);
        return home;
    }

    static void AppendCitation(string root, string citation)
    {
        var page = Path.Combine(root, "docs", "product", "brief.md");
        File.AppendAllText(page, $"\nSee {citation}.\n");
    }

    const string PinnedPage = """
        # Principles

        ## Standards

        ### Retire records with replaces

        A retired record stays readable.
        """;

    /// <summary>The provision the fixture's deviation cites, so pinning stays complete.</summary>
    const string PinnedDeviationTarget = """
        # Application Layer

        ## Standards

        ### Enforce target authorization in the pipeline

        Authorization runs once per command.
        """;
}
