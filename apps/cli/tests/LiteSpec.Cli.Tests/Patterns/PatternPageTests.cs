using LiteSpec.Patterns;
using LiteSpec.Tests.Support;

namespace LiteSpec.Tests.Patterns;

/// <summary>Pattern pages: the page reader, its checks, and <c>litespec patterns</c>.</summary>
public sealed class PatternPageTests
{
    const string Sample = """
        # Sample Patterns

        ## Intent

        Two sample patterns.

        ## Patterns

        ### Record header

        **Question:** How does the top of a record read?

        **Default:** `one-primary`

        **Compact:** Actions move under the title.

        **Rationale:** One primary action answers what comes next.

        The runner-up is two equal actions.

        #### `one-primary`: One primary action

        ```wireframe
        page
          header
            heading "SO-1042"
            action primary "Mark as shipped"
        ```

        **Rationale:** The next step is obvious.

        **Cost:** Other commands wait in a menu.

        #### `two-equal`: Two equal actions

        ```wireframe
        page
          header
            heading "SO-1042"
            action "Mark as shipped"
            action "Refund"
        ```

        ```wireframe compact
        page
          heading "SO-1042"
          footer sticky
            action "Mark as shipped"
            action "Refund"
        ```

        **Rationale:** Both commands are one click away.

        **Cost:** The reader compares labels before acting.

        **Reference:** A design system.

        ## Verification

        None.
        """;

    [Fact(DisplayName = "a pattern page reads patterns options fields and wireframes")]
    public void ReadsPatternsOptionsAndWireframes()
    {
        var page = PatternPage.Parse("sample", Sample);

        Assert.Equal("Sample Patterns", page.Title);
        Assert.Equal("Two sample patterns.", page.Intent);
        var pattern = Assert.Single(page.Patterns);
        Assert.Equal("record-header", pattern.Slug);
        Assert.Equal("one-primary", pattern.Default);
        Assert.Equal("How does the top of a record read?", pattern.Fields["Question"]);
        Assert.Equal("One primary action answers what comes next. The runner-up is two equal actions.", pattern.Fields["Rationale"]);
        Assert.Equal(["one-primary", "two-equal"], pattern.Options.Select(option => option.Id));
        Assert.Null(pattern.Options[0].Compact);
        Assert.NotNull(pattern.Options[1].Compact?.Parsed.Page);
        Assert.Equal("A design system.", pattern.Options[1].Fields["Reference"]);
        Assert.Empty(page.Check());
    }

    [Theory(DisplayName = "a pattern page check reports the broken contract with page lines")]
    [InlineData("**Default:** `one-primary`", "**Default:** `missing`", "is not one of its options")]
    [InlineData("#### `two-equal`: Two equal actions", "#### Two equal actions", "an option heading is")]
    [InlineData("**Cost:** Other commands wait in a menu.", "", "has no **Cost:**")]
    [InlineData("    action primary \"Mark as shipped\"", "    action primary \"Mark as shipped\"\n    action primary \"Refund\"", "at most one primary action")]
    [InlineData("**Compact:** Actions move under the title.", "**Layout:** Wide.", "is not a pattern field")]
    public void ReportsTheBrokenContract(string from, string to, string expected)
    {
        var page = PatternPage.Parse("sample", Sample.Replace(from, to, StringComparison.Ordinal));

        Assert.Contains(page.Check(), problem => problem.Message.Contains(expected, StringComparison.Ordinal) && problem.Line > 0);
    }

    [Fact(DisplayName = "a wireframe error points at its line on the page")]
    public void AWireframeErrorPointsAtItsPageLine()
    {
        var text = Sample.Replace("    heading \"SO-1042\"\n    action primary", "    widget \"SO-1042\"\n    action primary", StringComparison.Ordinal);
        var page = PatternPage.Parse("sample", text);

        var problem = Assert.Single(page.Check());
        Assert.Equal("    widget \"SO-1042\"", text.Split('\n')[problem.Line - 1]);
    }

    [Fact(DisplayName = "patterns preview writes one offline page with every option drawn twice")]
    public void PreviewWritesOneOfflinePage()
    {
        using var temp = Cli.Temp("patterns-preview");
        var source = Path.Combine(temp.Path, "sample.md");
        var output = Path.Combine(temp.Path, "out", "sample.html");
        File.WriteAllText(source, Sample);

        var result = Cli.Run("patterns", "preview", source, "--out", output);

        Assert.Equal(0, result.Status);
        Assert.Contains("1 pattern, 2 options", result.Stdout, StringComparison.Ordinal);
        var html = File.ReadAllText(output);
        Assert.Contains("<title>Sample Patterns</title>", html, StringComparison.Ordinal);
        Assert.Contains("litespec/frontend/patterns/sample#record-header", html, StringComparison.Ordinal);
        Assert.Contains("<span class=\"badge\">Default</span>", html, StringComparison.Ordinal);
        Assert.Contains("its own layout", html, StringComparison.Ordinal);
        Assert.Equal(8, html.Split("<svg ").Length - 1);
        Assert.DoesNotContain("http://", html.Replace("http://www.w3.org/2000/svg", "", StringComparison.Ordinal), StringComparison.Ordinal);
    }

    [Fact(DisplayName = "patterns check and svg cover the shipped pattern pages")]
    public void CheckAndSvgCoverTheShippedPages()
    {
        var check = Cli.Run("patterns", "check");
        var svg = Cli.Run("patterns", "svg", "litespec/frontend/patterns/record-detail#record-header", "title-state-breadcrumb-one-primary-action", "--phone");
        var unknown = Cli.Run("patterns", "svg", "litespec/frontend/patterns/record-detail#record-header", "no-such-option");

        Assert.Equal(0, check.Status);
        Assert.Contains("0 problems", check.Stdout, StringComparison.Ordinal);
        Assert.Equal(0, svg.Status);
        Assert.StartsWith("<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"390\"", svg.Stdout, StringComparison.Ordinal);
        Assert.Equal(2, unknown.Status);
        Assert.Contains("has no option 'no-such-option'", unknown.Stderr, StringComparison.Ordinal);
    }
}
