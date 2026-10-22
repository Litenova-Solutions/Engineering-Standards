using System.Text.Json;
using LiteSpec.Tests.Support;

namespace LiteSpec.Tests.Model.Tables;

/// <summary>Proves page records carry their body text while entries carry none.</summary>
public sealed class BodyTests
{
    /// <summary>Pages write their body without the title; entries write no body.</summary>
    [Fact]
    public void Pages_Write_Bodies_And_Entries_Write_None()
    {
        using var temp = ModelFixture.Prepare("small");

        using var document = Build(temp.Path);

        Assert.Equal(
            "A loan lends one copy to one reader.",
            Record(document, "aggregate/lending.loan").GetProperty("body").GetString());
        Assert.Equal(
            "A reader borrows an available copy.",
            Record(document, "use-case/lending.borrow-copy").GetProperty("body").GetString());
        Assert.False(Record(document, "rule/loan.has-one-borrower").TryGetProperty("body", out _));
        Assert.False(Record(document, "result/borrow-copy.borrowed").TryGetProperty("body", out _));
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
}
