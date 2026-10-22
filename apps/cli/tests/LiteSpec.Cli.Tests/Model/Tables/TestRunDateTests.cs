using System.Globalization;
using System.Text.Json;
using LiteSpec.Tests.Support;

namespace LiteSpec.Tests.Model.Tables;

/// <summary>Proves the test run writes its date, preferring result timestamps.</summary>
public sealed class TestRunDateTests
{
    /// <summary>A TRX run writes its finish day.</summary>
    [Fact]
    public void Trx_Run_Writes_Its_Finish_Day()
    {
        using var temp = ModelFixture.Prepare("small");
        CopyResults(temp.Path, "trx", "results.trx", "results.trx");

        using var document = Build(temp.Path);

        Assert.Equal("2026-01-01", Run(document).GetProperty("date").GetString());
    }

    /// <summary>A JUnit run writes its suite timestamp day.</summary>
    [Fact]
    public void JUnit_Run_Writes_Its_Suite_Timestamp_Day()
    {
        using var temp = ModelFixture.Prepare("small");
        var file = CopyResults(temp.Path, "junit", "results.xml", "results.xml");
        var text = File.ReadAllText(file);
        File.WriteAllText(file, text.Replace("<testsuite name=", "<testsuite timestamp=\"2026-10-20T12:00:00\" name="));

        using var document = Build(temp.Path);

        Assert.Equal("2026-10-20", Run(document).GetProperty("date").GetString());
    }

    /// <summary>A JUnit run without a timestamp writes its file day.</summary>
    [Fact]
    public void JUnit_Run_Without_A_Timestamp_Writes_The_File_Day()
    {
        using var temp = ModelFixture.Prepare("small");
        var file = CopyResults(temp.Path, "junit", "results.xml", "results.xml");

        using var document = Build(temp.Path);
        var expected = File.GetLastWriteTimeUtc(file).ToString("yyyy-MM-dd", CultureInfo.InvariantCulture);

        Assert.Equal(expected, Run(document).GetProperty("date").GetString());
    }

    /// <summary>A combined run writes the latest day across formats.</summary>
    [Fact]
    public void Combined_Run_Writes_The_Latest_Day()
    {
        using var temp = ModelFixture.Prepare("small");
        CopyResults(temp.Path, "trx", "results.trx", "results.trx");
        var junit = CopyResults(temp.Path, "junit", "results.xml", "results.xml");
        var text = File.ReadAllText(junit);
        File.WriteAllText(junit, text.Replace("<testsuite name=", "<testsuite timestamp=\"2026-10-20T12:00:00\" name="));

        using var document = Build(temp.Path);
        var run = Run(document);

        Assert.Equal(4, run.GetProperty("total").GetInt32());
        Assert.Equal("2026-10-20", run.GetProperty("date").GetString());
    }

    static string CopyResults(string root, string fixture, string name, string target)
    {
        var folder = Path.Combine(root, "TestResults");
        Directory.CreateDirectory(folder);
        var destination = Path.Combine(folder, target);
        File.Copy(Cli.Fixture($"Model/{fixture}/{name}"), destination);

        return destination;
    }

    static JsonDocument Build(string root)
    {
        var output = Path.Combine(root, ".model", "model.json");
        var result = Cli.Run("model", "build", "--root", root, "--out", output);
        Assert.Equal(0, result.Status);

        return JsonDocument.Parse(File.ReadAllText(output));
    }

    static JsonElement Run(JsonDocument document) =>
        document.RootElement.GetProperty("testRun");
}
