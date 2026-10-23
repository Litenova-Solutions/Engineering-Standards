using System.Text.Json;
using LiteSpec.Tests.Support;

namespace LiteSpec.Tests.Model.Tables;

/// <summary>Proves scenario examples tables land in fields on pages and entries.</summary>
public sealed class ExampleTableTests
{
    /// <summary>A scenario page table writes examples rows under its headers.</summary>
    [Fact]
    public void Scenario_Page_Table_Writes_Examples()
    {
        using var temp = ModelFixture.Prepare("small");
        WritePage(temp.Path, "borrow-copy-examples-scenario.md", ScenarioPage);

        using var document = Build(temp.Path);
        var examples = Record(document, "scenario/borrow-copy.borrowing-an-available-copy-succeeds")
            .GetProperty("fields").GetProperty("examples").EnumerateArray().ToList();

        Assert.Equal(2, examples.Count);
        Assert.Equal("copy-1", examples[0].GetProperty("copy").GetString());
        Assert.Equal("reader-1", examples[0].GetProperty("member").GetString());
        Assert.Equal("2026-02-01", examples[0].GetProperty("due").GetString());
        Assert.Equal("copy-2", examples[1].GetProperty("copy").GetString());
        Assert.Equal("reader-2", examples[1].GetProperty("member").GetString());
        Assert.Equal("2026-02-02", examples[1].GetProperty("due").GetString());
    }

    /// <summary>A scenario page table covers the calculation its use case governs.</summary>
    [Fact]
    public void Scenario_Page_Table_Covers_A_Calculation()
    {
        using var temp = ModelFixture.Prepare("large", "calculation-without-table");
        WritePage(temp.Path, "late-fee-scenario.md", CalculationPage);

        var check = Cli.Run("model", "check", "--root", temp.Path, "--format", "json");
        Assert.DoesNotContain("calculation-without-table", check.Output);
    }

    /// <summary>Front-matter examples win over the table.</summary>
    [Fact]
    public void Front_Matter_Examples_Win_Over_The_Table()
    {
        using var temp = ModelFixture.Prepare("small");
        WritePage(temp.Path, "borrow-copy-examples-scenario.md", FrontMatterPage);

        using var document = Build(temp.Path);
        var examples = Record(document, "scenario/borrow-copy.borrowing-an-available-copy-succeeds")
            .GetProperty("fields").GetProperty("examples").EnumerateArray().ToList();

        Assert.Single(examples);
        Assert.Equal("front-matter-copy", examples[0].GetProperty("copy").GetString());
    }

    /// <summary>On a use-case page with one scenario, the first plain table is its examples.</summary>
    [Fact]
    public void Use_Case_Page_Table_Covers_Its_Single_Scenario_Entry()
    {
        using var temp = ModelFixture.Prepare("small");
        AddEntries(temp.Path, AvailableEntry);
        AppendBody(temp.Path, AvailableTable);

        using var document = Build(temp.Path);
        var examples = Record(document, "scenario/borrow-copy.borrowing-an-available-copy-succeeds")
            .GetProperty("fields").GetProperty("examples").EnumerateArray().ToList();

        Assert.Single(examples);
        Assert.Equal("copy-1", examples[0].GetProperty("copy").GetString());
        Assert.Equal("reader-1", examples[0].GetProperty("member").GetString());
    }

    /// <summary>With several scenarios, each table belongs to the scenario its heading names.</summary>
    [Fact]
    public void Headings_Match_Tables_To_Scenarios()
    {
        using var temp = ModelFixture.Prepare("small");
        AddEntries(temp.Path, AvailableEntry + ",\n" + RefusedEntry);
        AppendBody(temp.Path, AvailableTable + RefusedTable);

        using var document = Build(temp.Path);
        var available = Record(document, "scenario/borrow-copy.borrowing-an-available-copy-succeeds")
            .GetProperty("fields").GetProperty("examples").EnumerateArray().ToList();
        var refused = Record(document, "scenario/borrow-copy.borrowing-a-loaned-copy-is-refused")
            .GetProperty("fields").GetProperty("examples").EnumerateArray().ToList();

        Assert.Single(available);
        Assert.Equal("copy-1", available[0].GetProperty("copy").GetString());
        Assert.Single(refused);
        Assert.Equal("copy-9", refused[0].GetProperty("copy").GetString());
    }

    static void WritePage(string root, string name, string page)
    {
        var folder = Path.Combine(root, "docs", "behavior", "modules", "lending", "loans");
        File.WriteAllText(Path.Combine(folder, name), page);
    }

    static void AddEntries(string root, string entries)
    {
        var page = Path.Combine(root, "docs", "behavior", "modules", "lending", "loans", "borrow-copy.md");
        var text = File.ReadAllText(page);

        File.WriteAllText(page, text.Replace("  \"records\": [", "  \"records\": [\n" + entries + ","));
    }

    static void AppendBody(string root, string body)
    {
        var page = Path.Combine(root, "docs", "behavior", "modules", "lending", "loans", "borrow-copy.md");
        File.AppendAllText(page, body);
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

    const string ScenarioPage = """
        ---
        {
          "type": "scenario",
          "id": "scenario/borrow-copy.borrowing-an-available-copy-succeeds",
          "title": "Borrowing an available copy succeeds",
          "owner": "lending-team",
          "status": "reviewed",
          "given": "A copy sits available on its shelf.",
          "when": "The reader borrows the copy.",
          "result": "result/borrow-copy.borrowed",
          "then": "The loan is active."
        }
        ---

        # Borrowing an available copy succeeds

        A reader borrows an available copy.

        ## Examples

        | copy | member | due |
        | ---- | ------ | --- |
        | copy-1 | reader-1 | 2026-02-01 |
        | copy-2 | reader-2 | 2026-02-02 |
        """;

    const string CalculationPage = """
        ---
        {
          "type": "scenario",
          "id": "scenario/borrow-copy.late-fee-examples-hold",
          "title": "Late fee examples hold",
          "owner": "lending-team",
          "status": "reviewed",
          "given": "A loan stands overdue.",
          "when": "The fee is totaled.",
          "result": "result/borrow-copy.borrowed",
          "then": "The fee matches the table."
        }
        ---

        # Late fee examples hold

        The fee follows the table.

        ## Examples

        | days | fee |
        | ---- | --- |
        | 3 | 1.5 |
        """;

    const string FrontMatterPage = """
        ---
        {
          "type": "scenario",
          "id": "scenario/borrow-copy.borrowing-an-available-copy-succeeds",
          "title": "Borrowing an available copy succeeds",
          "owner": "lending-team",
          "status": "reviewed",
          "given": "A copy sits available on its shelf.",
          "when": "The reader borrows the copy.",
          "result": "result/borrow-copy.borrowed",
          "then": "The loan is active.",
          "examples": [{ "copy": "front-matter-copy" }]
        }
        ---

        # Borrowing an available copy succeeds

        A reader borrows an available copy.

        ## Examples

        | copy | member |
        | ---- | ------ |
        | copy-1 | reader-1 |
        """;

    const string AvailableEntry = """
        {
          "type": "scenario",
          "id": "scenario/borrow-copy.borrowing-an-available-copy-succeeds",
          "title": "Borrowing an available copy succeeds",
          "owner": "lending-team",
          "given": "A copy sits available.",
          "when": "The reader borrows it.",
          "result": "result/borrow-copy.borrowed",
          "then": "The loan is active."
        }
        """;

    const string RefusedEntry = """
        {
          "type": "scenario",
          "id": "scenario/borrow-copy.borrowing-a-loaned-copy-is-refused",
          "title": "Borrowing a loaned copy is refused",
          "owner": "lending-team",
          "given": "A loan holds the copy.",
          "when": "The reader borrows it.",
          "result": "result/borrow-copy.copy-unavailable",
          "then": "The copy stays loaned."
        }
        """;

    const string AvailableTable = """

        ## Borrowing an available copy succeeds

        | copy | member |
        | ---- | ------ |
        | copy-1 | reader-1 |
        """;

    const string RefusedTable = """

        ## Borrowing a loaned copy is refused

        | copy | member |
        | ---- | ------ |
        | copy-9 | reader-9 |
        """;
}
