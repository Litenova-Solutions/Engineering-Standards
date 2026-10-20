using LiteSpec.Tests.Support;

namespace LiteSpec.Tests.Model;

/// <summary>Proves shared provision citations resolve against the pinned LiteSpec docs.</summary>
public sealed class SharedCitationTests
{
    /// <summary>A new-form citation that the pinned docs hold exits 0.</summary>
    [Fact]
    public void Shared_Citation_That_Resolves_Passes()
    {
        using var temp = ModelFixture.Prepare("small");
        WritePinnedProvision(temp.Path);
        AppendCitation(temp.Path, "litespec/core/principles#retire-records-with-replaces");
        var result = Cli.Run("model", "check", "--root", temp.Path, "--format", "json");
        Assert.Equal(0, result.Status);
    }

    /// <summary>A new-form citation that the pinned docs lack exits 1 with reference-unresolved.</summary>
    [Fact]
    public void Shared_Citation_Without_A_Provision_Reports_Reference_Unresolved()
    {
        using var temp = ModelFixture.Prepare("small");
        WritePinnedProvision(temp.Path);
        AppendCitation(temp.Path, "litespec/core/principles#no-such-provision");
        var result = Cli.Run("model", "check", "--root", temp.Path, "--format", "json");
        Assert.Equal(1, result.Status);
        Assert.Contains("reference-unresolved", result.Output);
    }

    static void WritePinnedProvision(string root)
    {
        var folder = Path.Combine(root, "litespec", "docs", "core");
        Directory.CreateDirectory(folder);
        File.WriteAllText(Path.Combine(folder, "principles.md"), PinnedPage);
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
}
