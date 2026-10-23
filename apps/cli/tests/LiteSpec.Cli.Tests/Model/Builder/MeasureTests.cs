using System.Text.Json;
using LiteSpec.Tests.Model;
using LiteSpec.Tests.Support;

namespace LiteSpec.Tests.Model.Builder;

/// <summary>Proves k6, Lighthouse, and ZAP result files feed the model.</summary>
public sealed class MeasureTests
{
    /// <summary>Each result file yields its checks with their pass and value.</summary>
    [Fact]
    public void Measure_Files_Feed_The_Model()
    {
        using var temp = ModelFixture.Prepare("small");
        CopyResults(temp.Path);

        using var document = Build(temp.Path);
        var root = document.RootElement;

        var duration = Measure(root, "k6", "http_req_duration p(95)<200");
        Assert.True(duration.GetProperty("passed").GetBoolean());
        Assert.Equal("187.3", duration.GetProperty("value").GetString());
        Assert.Equal("TestResults/k6-summary.json", duration.GetProperty("source").GetString());

        var failed = Measure(root, "k6", "http_req_failed rate<0.05");
        Assert.False(failed.GetProperty("passed").GetBoolean());
        Assert.Equal("0.07", failed.GetProperty("value").GetString());

        Assert.DoesNotContain(root.GetProperty("measures").EnumerateArray(),
            measure => measure.GetProperty("check").GetString() == "vus");

        var performance = Measure(root, "lighthouse", "categories:performance");
        Assert.True(performance.GetProperty("passed").GetBoolean());
        Assert.Equal("0.92", performance.GetProperty("value").GetString());

        var paint = Measure(root, "lighthouse", "audits:first-contentful-paint");
        Assert.Equal("1234 millisecond", paint.GetProperty("value").GetString());

        var summary = Measure(root, "zap", "alerts");
        Assert.False(summary.GetProperty("passed").GetBoolean());
        Assert.Equal("2 alerts (0 high, 1 medium, 1 low)", summary.GetProperty("value").GetString());

        Assert.True(Measure(root, "zap", "alert 10021 X-Content-Type-Options Header Missing").GetProperty("passed").GetBoolean());
        Assert.False(Measure(root, "zap", "alert 10096 Timestamp Disclosure").GetProperty("passed").GetBoolean());
    }

    /// <summary>Without a result file the model holds no measure.</summary>
    [Fact]
    public void Missing_Measure_Files_Write_Empty_Measures()
    {
        using var temp = ModelFixture.Prepare("small");

        using var document = Build(temp.Path);

        Assert.Empty(document.RootElement.GetProperty("measures").EnumerateArray());
    }

    static JsonElement Measure(JsonElement root, string tool, string check)
    {
        foreach (var measure in root.GetProperty("measures").EnumerateArray())
        {
            if (measure.GetProperty("tool").GetString() == tool
                && measure.GetProperty("check").GetString() == check)
            {
                return measure;
            }
        }

        throw new InvalidOperationException($"No measure holds '{tool} {check}'.");
    }

    static void CopyResults(string root)
    {
        var folder = Path.Combine(root, "TestResults");
        Directory.CreateDirectory(folder);
        File.Copy(Cli.Fixture("Builder/measures/k6-summary.json"), Path.Combine(folder, "k6-summary.json"));
        File.Copy(Cli.Fixture("Builder/measures/lighthouse.json"), Path.Combine(folder, "lighthouse.json"));
        File.Copy(Cli.Fixture("Builder/measures/zap.json"), Path.Combine(folder, "zap.json"));
    }

    static JsonDocument Build(string root)
    {
        var output = Path.Combine(root, ".model", "model.json");
        var result = Cli.Run("model", "build", "--root", root, "--out", output);
        Assert.Equal(0, result.Status);

        return JsonDocument.Parse(File.ReadAllText(output));
    }
}
