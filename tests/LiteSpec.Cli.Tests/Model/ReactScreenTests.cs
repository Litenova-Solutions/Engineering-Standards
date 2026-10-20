using System.Text.Json.Nodes;
using LiteSpec.Tests.Support;

namespace LiteSpec.Tests.Model;

/// <summary>
///     Proves the builder reads React routes: each file under <c>src/routes</c> that declares
///     its address with <c>createFileRoute</c> is a screen, at the address a reader of the page sees.
/// </summary>
public sealed class ReactScreenTests
{
    [Fact]
    public void React_Route_Files_Become_Screens_At_Their_Visible_Address()
    {
        using var temp = ModelFixture.Prepare("large");
        AddReactFrontend(temp.Path);

        var screens = BuildScreens(temp.Path).Where(screen => (string?)screen["frontend"] == "console").ToList();

        Assert.Equal(
            ["/loans", "/loans/$loanId"],
            screens.Select(screen => (string?)screen["route"]).OrderBy(route => route, StringComparer.Ordinal).ToList());
        Assert.Contains(screens, screen => (string?)screen["file"] == "apps/console/src/routes/_console/loans/index.tsx");
    }

    [Fact]
    public void Root_Lazy_And_Ignored_Route_Files_Declare_No_Screen_Of_Their_Own()
    {
        using var temp = ModelFixture.Prepare("large");
        AddReactFrontend(temp.Path);

        var files = BuildScreens(temp.Path)
            .Where(screen => (string?)screen["frontend"] == "console")
            .Select(screen => (string?)screen["file"])
            .ToList();

        Assert.DoesNotContain("apps/console/src/routes/__root.tsx", files);
        Assert.DoesNotContain("apps/console/src/routes/_console/loans/index.lazy.tsx", files);
        Assert.DoesNotContain("apps/console/src/routes/-components/LoanRow.tsx", files);
    }

    static void AddReactFrontend(string root)
    {
        var routes = Path.Combine(root, "apps", "console", "src", "routes");
        Write(routes, "__root.tsx", "export const Route = createRootRoute({});\n");
        Write(routes, "_console/loans/index.tsx", "export const Route = createFileRoute(\"/_console/loans/\")({});\n");
        Write(routes, "_console/loans/index.lazy.tsx", "export const Route = createLazyFileRoute(\"/_console/loans/\")({});\n");
        Write(routes, "_console/loans/$loanId.tsx", "export const Route = createFileRoute(\"/_console/loans/$loanId\")({});\n");
        Write(routes, "-components/LoanRow.tsx", "export function LoanRow() { return null; }\n");

        var projectFile = Path.Combine(root, "litespec.project.json");
        var project = JsonNode.Parse(File.ReadAllText(projectFile))!.AsObject();
        project["paths"]!["frontends"]!.AsArray().Add(new JsonObject { ["name"] = "console", ["path"] = "apps/console", ["platform"] = "react" });
        File.WriteAllText(projectFile, project.ToJsonString());
    }

    static List<JsonNode> BuildScreens(string root)
    {
        var output = Path.Combine(root, ".model", "model.json");
        var result = Cli.Run("model", "build", "--root", root, "--out", output);
        Assert.Equal(0, result.Status);

        return [.. JsonNode.Parse(File.ReadAllText(output))!["screens"]!.AsArray().OfType<JsonNode>()];
    }

    static void Write(string folder, string relative, string text)
    {
        var path = Path.Combine(folder, relative.Replace('/', Path.DirectorySeparatorChar));
        Directory.CreateDirectory(Path.GetDirectoryName(path)!);
        File.WriteAllText(path, text);
    }
}
