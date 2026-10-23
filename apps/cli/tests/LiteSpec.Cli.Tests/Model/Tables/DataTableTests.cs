using System.Text.Json;
using LiteSpec.Tests.Support;

namespace LiteSpec.Tests.Model.Tables;

/// <summary>Proves aggregate data tables land in fields and drive the erasure check.</summary>
public sealed class DataTableTests
{
    /// <summary>A data table writes fields, lowercasing classifications.</summary>
    [Fact]
    public void Data_Table_Writes_Fields()
    {
        using var temp = ModelFixture.Prepare("small");
        AppendTable(temp.Path, DataTable);

        using var document = Build(temp.Path);
        var data = Record(document, "aggregate/lending.hold")
            .GetProperty("fields").GetProperty("data").EnumerateArray().ToList();

        Assert.Equal(2, data.Count);
        Assert.Equal("shelf", data[0].GetProperty("name").GetString());
        Assert.Equal("The home shelf.", data[0].GetProperty("meaning").GetString());
        Assert.Equal("public", data[0].GetProperty("classification").GetString());
        Assert.Equal("borrower-email", data[1].GetProperty("name").GetString());
        Assert.Equal("The address notices go to.", data[1].GetProperty("meaning").GetString());
        Assert.Equal("personal", data[1].GetProperty("classification").GetString());
    }

    /// <summary>A personal row from the table reports erasure-undeclared.</summary>
    [Fact]
    public void Personal_Data_Table_Reports_Erasure_Undeclared()
    {
        using var temp = ModelFixture.Prepare("small");
        AppendTable(temp.Path, DataTable);

        var check = Cli.Run("model", "check", "--root", temp.Path, "--format", "json");
        Assert.Equal(1, check.Status);
        Assert.Contains("erasure-undeclared", check.Output);
    }

    /// <summary>Front-matter data wins over the table.</summary>
    [Fact]
    public void Front_Matter_Data_Wins_Over_The_Table()
    {
        using var temp = ModelFixture.Prepare("small");
        AddFrontMatterData(temp.Path);
        AppendTable(temp.Path, DataTable);

        using var document = Build(temp.Path);
        var data = Record(document, "aggregate/lending.hold")
            .GetProperty("fields").GetProperty("data").EnumerateArray().ToList();

        Assert.Single(data);
        Assert.Equal("shelf", data[0].GetProperty("name").GetString());
        Assert.Equal("public", data[0].GetProperty("classification").GetString());
    }

    static void AppendTable(string root, string table)
    {
        var page = Path.Combine(root, "docs", "behavior", "modules", "lending", "holds", "README.md");
        File.AppendAllText(page, table);
    }

    static void AddFrontMatterData(string root)
    {
        var page = Path.Combine(root, "docs", "behavior", "modules", "lending", "holds", "README.md");
        var text = File.ReadAllText(page);

        File.WriteAllText(page, text.Replace(
            "  \"records\": [",
            "  \"data\": [{ \"name\": \"shelf\", \"meaning\": \"The home shelf.\", \"classification\": \"public\" }],\n  \"records\": ["));
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

    const string DataTable = """

        ## Data

        | Name | Meaning | Classification |
        | ---- | ------- | -------------- |
        | shelf | The home shelf. | public |
        | borrower-email | The address notices go to. | Personal |
        """;
}
