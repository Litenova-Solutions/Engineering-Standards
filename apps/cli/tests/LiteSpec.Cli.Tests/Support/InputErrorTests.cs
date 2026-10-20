using System.Text.Json.Nodes;

namespace LiteSpec.Tests.Support;

/// <summary>
///     Proves that ordinary user error reaches a message and a documented exit
///     code, never an unhandled exception.
/// </summary>
public sealed class InputErrorTests
{
    [Fact]
    public void A_Malformed_Percent_Escape_In_A_Link_Is_A_Broken_Link()
    {
        using var folder = Cli.Temp("escape");
        Directory.CreateDirectory(Path.Combine(folder.Path, "docs"));
        File.WriteAllText(Path.Combine(folder.Path, "docs", "page.md"), "# Page\n\nSee [the guide](guide%zz.md).\n");

        var result = Cli.Run("validate", "--root", folder.Path);

        Assert.Equal(1, result.Status);
        Assert.Contains("[LINK_BROKEN] link target 'guide%zz.md' holds a malformed percent escape", result.Output, StringComparison.Ordinal);
        Assert.DoesNotContain("Unhandled exception", result.Output, StringComparison.Ordinal);
    }

    [Fact]
    public void Provisions_Refuses_A_Root_Without_Docs()
    {
        using var folder = Cli.Temp("provisions");

        var result = Cli.Run("provisions", "--root", Path.Combine(folder.Path, "missing"));

        Assert.Equal(2, result.Status);
        Assert.Contains("holds no docs folder", result.Stderr, StringComparison.Ordinal);
        Assert.False(Directory.Exists(Path.Combine(folder.Path, "missing")));
    }

    [Fact]
    public void Model_Reports_A_Malformed_Project_File_As_A_Usage_Error()
    {
        using var folder = Cli.Temp("model-json");
        File.WriteAllText(Path.Combine(folder.Path, "litespec.project.json"), "{ not json");

        var result = Cli.Run("model", "check", "--root", folder.Path);

        Assert.Equal(2, result.Status);
        Assert.Contains("litespec.project.json is not valid JSON", result.Stderr, StringComparison.Ordinal);
    }

    [Fact]
    public void Model_Refuses_A_Root_Without_A_Project_File()
    {
        using var folder = Cli.Temp("model-empty");

        var result = Cli.Run("model", "check", "--root", folder.Path);

        Assert.Equal(2, result.Status);
        Assert.Contains("holds no litespec.project.json", result.Stderr, StringComparison.Ordinal);
    }

    [Fact]
    public void Book_Accepts_An_Option_Written_With_An_Equals_Sign()
    {
        using var folder = Cli.Temp("book");

        var result = Cli.Run("book", $"--model={Cli.Fixture("Book/model.json")}", $"--out={folder.Path}");

        Assert.Equal(0, result.Status);
        Assert.True(File.Exists(Path.Combine(folder.Path, "index.html")));
    }
}
