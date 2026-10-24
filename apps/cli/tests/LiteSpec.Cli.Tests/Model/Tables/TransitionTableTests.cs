using System.Text.Json;
using LiteSpec.Model;
using LiteSpec.Tests.Support;

namespace LiteSpec.Tests.Model.Tables;

/// <summary>Proves aggregate transitions tables land in fields and drive reachability.</summary>
public sealed class TransitionTableTests
{
    /// <summary>A transitions table writes fields, marks entered states reachable, and checks clean.</summary>
    [Fact]
    public void Transitions_Table_Writes_Fields_And_Marks_States_Reachable()
    {
        using var temp = ModelFixture.Prepare("small");
        AppendTable(temp.Path, TransitionsTable);
        RestampAggregate(temp.Path, MergedTransitions);

        using var document = Build(temp.Path);
        var transitions = Record(document, "aggregate/lending.loan")
            .GetProperty("fields").GetProperty("transitions").EnumerateArray().ToList();

        Assert.Equal(3, transitions.Count);
        Assert.Equal("Active", transitions[0].GetProperty("from").GetString());
        Assert.Equal("Overdue", transitions[0].GetProperty("to").GetString());
        Assert.Equal("use-case/lending.extend-loan", transitions[0].GetProperty("by").GetString());
        Assert.Equal("Overdue", transitions[1].GetProperty("from").GetString());
        Assert.Equal("Returned", transitions[1].GetProperty("to").GetString());
        Assert.Equal("use-case/lending.return-copy", transitions[1].GetProperty("by").GetString());
        Assert.Equal("Active", transitions[2].GetProperty("from").GetString());
        Assert.Equal("Returned", transitions[2].GetProperty("to").GetString());
        Assert.Equal("use-case/lending.return-copy", transitions[2].GetProperty("by").GetString());

        var states = document.RootElement.GetProperty("reachableStates").GetProperty("aggregate/lending.loan");

        Assert.Equal(
            ["Active", "Overdue", "Returned"],
            states.EnumerateArray().Select(state => state.GetString()).ToList());

        var check = Cli.Run("model", "check", "--root", temp.Path, "--format", "json");
        Assert.Equal(0, check.Status);
    }

    /// <summary>A table row naming a missing use case reports transition-unresolved; By aliases Triggered By.</summary>
    [Fact]
    public void Transition_By_A_Missing_Use_Case_Reports_Transition_Unresolved()
    {
        using var temp = ModelFixture.Prepare("small");
        AppendTable(temp.Path, DanglingTable);
        RestampAggregate(temp.Path, MergedDangling);

        var check = Cli.Run("model", "check", "--root", temp.Path, "--format", "json");
        Assert.Equal(1, check.Status);
        Assert.Contains("transition-unresolved", check.Output);
    }

    /// <summary>Front-matter transitions win over the table.</summary>
    [Fact]
    public void Front_Matter_Transitions_Win_Over_The_Table()
    {
        using var temp = ModelFixture.Prepare("small");
        AddFrontMatterTransitions(temp.Path);
        AppendTable(temp.Path, TransitionsTable);

        using var document = Build(temp.Path);
        var transitions = Record(document, "aggregate/lending.loan")
            .GetProperty("fields").GetProperty("transitions").EnumerateArray().ToList();

        Assert.Single(transitions);
        Assert.Equal("Active", transitions[0].GetProperty("from").GetString());
        Assert.Equal("Returned", transitions[0].GetProperty("to").GetString());
        Assert.False(transitions[0].TryGetProperty("by", out _));
    }

    static void AppendTable(string root, string table)
    {
        var page = Path.Combine(root, "docs", "behavior", "modules", "lending", "loans", "README.md");
        File.AppendAllText(page, table);
    }

    /// <summary>
    ///     Re-stamps the loan aggregate's approval hash over its frontmatter plus the
    ///     transitions the appended table merges in, so the check reads only the table.
    /// </summary>
    static void RestampAggregate(string root, string transitions)
    {
        var page = Path.Combine(root, "docs", "behavior", "modules", "lending", "loans", "README.md");
        var text = File.ReadAllText(page);

        if (!Frontmatter.TryParse(text, out var parsed, out _))
        {
            throw new InvalidOperationException("The loans page lost its frontmatter.");
        }

        var merged = parsed.Root.GetRawText().Insert(1, $"\"transitions\": {transitions},");

        using var document = JsonDocument.Parse(merged);
        var record = new LiteSpec.Model.Record
        {
            Type = "aggregate",
            Id = "aggregate/lending.loan",
            Raw = document.RootElement.Clone(),
        };
        var hash = Checker.SemanticHash(record);

        // The page record's hash is the last approvedHash in the file.
        var marker = "\"approvedHash\": \"";
        var start = text.LastIndexOf(marker, StringComparison.Ordinal) + marker.Length;
        var end = text.IndexOf('"', start);
        File.WriteAllText(page, text[..start] + hash + text[end..]);
    }

    static void AddFrontMatterTransitions(string root)
    {
        var page = Path.Combine(root, "docs", "behavior", "modules", "lending", "loans", "README.md");
        var text = File.ReadAllText(page);

        File.WriteAllText(page, text.Replace(
            "  \"records\": [",
            "  \"transitions\": [{ \"from\": \"Active\", \"to\": \"Returned\" }],\n  \"records\": ["));
    }

    static JsonDocument Build(string root)
    {
        var output = Path.Combine(root, ".model", "model.json");
        var result = Cli.Run("model", "build", "--root", root, "--out", output);
        Assert.Equal(0, result.Status);

        return JsonDocument.Parse(File.ReadAllText(output));
    }

    static JsonElement Record(JsonDocument document, string id) =>
        document.RootElement.GetProperty("records").EnumerateArray()
            .First(record => record.GetProperty("id").GetString() == id);

    const string TransitionsTable = """

        ## Transitions

        | From | To | Triggered By |
        | ---- | -- | ------------ |
        | Active | Overdue | use-case/lending.extend-loan |
        | Overdue | Returned | use-case/lending.return-copy |
        | Active | Returned | use-case/lending.return-copy |
        """;

    const string DanglingTable = """

        ## Transitions

        | From | To | By |
        | ---- | -- | -- |
        | Active | Returned | use-case/lending.nope |
        """;

    /// <summary>The transitions TransitionsTable merges into the loan aggregate.</summary>
    const string MergedTransitions = """[{ "from": "Active", "to": "Overdue", "by": "use-case/lending.extend-loan" }, { "from": "Overdue", "to": "Returned", "by": "use-case/lending.return-copy" }, { "from": "Active", "to": "Returned", "by": "use-case/lending.return-copy" }]""";

    /// <summary>The transitions DanglingTable merges into the loan aggregate.</summary>
    const string MergedDangling = """[{ "from": "Active", "to": "Returned", "by": "use-case/lending.nope" }]""";
}
