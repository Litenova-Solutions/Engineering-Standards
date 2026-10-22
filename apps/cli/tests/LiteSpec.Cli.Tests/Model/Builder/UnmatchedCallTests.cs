using System.Text.Json;
using System.Text.Json.Nodes;
using LiteSpec.Tests.Model;
using LiteSpec.Tests.Support;

namespace LiteSpec.Tests.Model.Builder;

/// <summary>Proves a screen operation that matches no endpoint is reported, not dropped.</summary>
public sealed class UnmatchedCallTests
{
    /// <summary>An operation with no endpoint lands in unmatched calls with an empty use case list.</summary>
    [Fact]
    public void Screen_Operation_With_No_Endpoint_Is_Reported()
    {
        using var temp = ModelFixture.Prepare("small");
        Write(temp.Path, "packages/api/src/generated/sdk.gen.ts", ClientFile);
        Write(temp.Path, "apps/console/src/routes/loans/index.tsx", RouteFile);
        AddFrontend(temp.Path);

        using var document = Build(temp.Path);
        var root = document.RootElement;

        var unmatched = root.GetProperty("unmatchedCalls").EnumerateArray().ToList();

        Assert.Single(unmatched);
        Assert.Equal("console /loans", unmatched[0].GetProperty("screen").GetString());
        Assert.Equal("phantomOp", unmatched[0].GetProperty("operation").GetString());
        Assert.Equal("apps/console/src/routes/loans/index.tsx", unmatched[0].GetProperty("file").GetString());

        var screens = root.GetProperty("screens").EnumerateArray().ToList();

        Assert.Single(screens);
        Assert.Empty(screens[0].GetProperty("useCases").EnumerateArray());
    }

    static void AddFrontend(string root)
    {
        var projectFile = Path.Combine(root, "litespec.project.json");
        var project = JsonNode.Parse(File.ReadAllText(projectFile))!.AsObject();
        project["paths"]!["frontends"]!.AsArray().Add(new JsonObject { ["name"] = "console", ["path"] = "apps/console", ["platform"] = "react" });
        File.WriteAllText(projectFile, project.ToJsonString());
    }

    static JsonDocument Build(string root)
    {
        var output = Path.Combine(root, ".model", "model.json");
        var result = Cli.Run("model", "build", "--root", root, "--out", output);
        Assert.Equal(0, result.Status);

        return JsonDocument.Parse(File.ReadAllText(output));
    }

    static void Write(string root, string relative, string text)
    {
        var path = Path.Combine(root, relative.Replace('/', Path.DirectorySeparatorChar));
        Directory.CreateDirectory(Path.GetDirectoryName(path)!);
        File.WriteAllText(path, text);
    }

    const string ClientFile = """
        export const phantomOp = (options) => (options.client ?? client).post<{
            url: '/api/nowhere/phantom',
        }>({});
        """;

    const string RouteFile = """
        import { phantomOp } from '@fixture/api';
        export const Route = createFileRoute("/loans")({});
        phantomOp({});
        """;
}
