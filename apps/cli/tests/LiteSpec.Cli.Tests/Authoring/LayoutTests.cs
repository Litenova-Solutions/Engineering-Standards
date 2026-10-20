using System.Text.Json.Nodes;
using LiteSpec.Authoring;
using LiteSpec.Tests.Support;

namespace LiteSpec.Tests.Authoring;

/// <summary>Folder-based layout cases: shipped stacks and the pages a selection applies.</summary>
public sealed class LayoutTests
{
    static JsonObject Manifest(string json) => (JsonObject)JsonNode.Parse(json)!;

    static void Page(string root, string relative) => StandardsFixture.Write(root, relative, "# Sample\n");

    static readonly string TreesManifest = """
        {
          "stacks": {
            "sample": { "folder": "docs/backend/sample" },
            "react": { "folder": "docs/frontend/web/react" },
            "svelte": { "folder": "docs/frontend/web/svelte" },
            "native": { "folder": "docs/frontend/web/react/native" }
          },
          "shapes": {
            "server": { "backendStacks": 1 },
            "client-only": { "backendStacks": 0, "backendPages": ["docs/backend/architecture.md", "docs/backend/domain.md"] }
          },
          "extensions": {
            "outbox": { "path": "docs/ext/outbox.md" },
            "efcore": { "path": "docs/backend/sample/ext/efcore.md" }
          }
        }
        """;

    static void Trees(string root)
    {
        Page(root, "docs/core/system.md");
        Page(root, "docs/workspace/structure.md");
        Page(root, "docs/quality/security.md");
        Page(root, "docs/README.md");
        Page(root, "docs/backend/architecture.md");
        Page(root, "docs/backend/domain.md");
        Page(root, "docs/backend/sample/stack.md");
        Page(root, "docs/backend/sample/domain.md");
        Page(root, "docs/backend/sample/ext/efcore.md");
        Page(root, "docs/frontend/principles.md");
        Page(root, "docs/frontend/web/shared.md");
        Page(root, "docs/frontend/web/react/stack.md");
        Page(root, "docs/frontend/web/react/components.md");
        Page(root, "docs/frontend/web/react/native/stack.md");
        Page(root, "docs/frontend/web/svelte/stack.md");
        Page(root, "docs/frontend/web/svelte/components.md");
        Page(root, "docs/ext/outbox.md");
        StandardsFixture.Write(root, "docs/frontend/web/notes.txt", "not a page\n");
    }

    [Fact(DisplayName = "stacks read folders kinds and pairing rules")]
    public void StacksReadFoldersKindsAndPairingRules()
    {
        var stacks = Layout.Stacks(Manifest("""
            {
              "stacks": {
                "dotnet": { "folder": "docs/backend/dotnet" },
                "react": { "folder": "docs/frontend/web/react", "requires": ["dotnet"], "pairsWith": ["dotnet"] },
                "stray": { "folder": "docs/core" }
              }
            }
            """));

        Assert.Equal(3, stacks.Count);
        Assert.Equal("dotnet", stacks[0].Id);
        Assert.Equal("docs/backend/dotnet", stacks[0].Folder);
        Assert.Equal("backend", stacks[0].Kind);
        Assert.Empty(stacks[0].Requires);
        Assert.Empty(stacks[0].PairsWith);
        Assert.Equal("react", stacks[1].Id);
        Assert.Equal("docs/frontend/web/react", stacks[1].Folder);
        Assert.Equal("frontend", stacks[1].Kind);
        Assert.Equal(new[] { "dotnet" }, stacks[1].Requires);
        Assert.Equal(new[] { "dotnet" }, stacks[1].PairsWith);
        Assert.Equal("stray", stacks[2].Id);
        Assert.Equal("", stacks[2].Kind);
        Assert.Empty(Layout.Stacks(Manifest("{}")));
    }

    [Fact(DisplayName = "applied pages for a server project")]
    public void AppliedPagesForAServerProject()
    {
        using var temp = Cli.Temp("layers");
        Trees(temp.Path);

        var pages = Layout.AppliedPages(temp.Path, Manifest(TreesManifest), "server", ["sample", "react"], []);

        string[] expected =
        [
            "docs/backend/architecture.md",
            "docs/backend/domain.md",
            "docs/backend/sample/domain.md",
            "docs/backend/sample/stack.md",
            "docs/core/system.md",
            "docs/frontend/principles.md",
            "docs/frontend/web/react/components.md",
            "docs/frontend/web/react/stack.md",
            "docs/frontend/web/shared.md",
            "docs/quality/security.md",
            "docs/workspace/structure.md",
        ];
        Assert.Equal(expected, pages);
    }

    [Fact(DisplayName = "applied pages for a client-only project")]
    public void AppliedPagesForAClientOnlyProject()
    {
        using var temp = Cli.Temp("layers");
        Trees(temp.Path);

        var pages = Layout.AppliedPages(temp.Path, Manifest(TreesManifest), "client-only", ["react"], []);

        string[] expected =
        [
            "docs/backend/architecture.md",
            "docs/backend/domain.md",
            "docs/core/system.md",
            "docs/frontend/principles.md",
            "docs/frontend/web/react/components.md",
            "docs/frontend/web/react/stack.md",
            "docs/frontend/web/shared.md",
            "docs/quality/security.md",
            "docs/workspace/structure.md",
        ];
        Assert.Equal(expected, pages);
    }

    [Fact(DisplayName = "applied pages include a selected stack extension")]
    public void AppliedPagesIncludeASelectedStackExtension()
    {
        using var temp = Cli.Temp("layers");
        Trees(temp.Path);

        var pages = Layout.AppliedPages(temp.Path, Manifest(TreesManifest), "server", ["sample"], ["efcore"]);

        string[] expected =
        [
            "docs/backend/architecture.md",
            "docs/backend/domain.md",
            "docs/backend/sample/domain.md",
            "docs/backend/sample/ext/efcore.md",
            "docs/backend/sample/stack.md",
            "docs/core/system.md",
            "docs/quality/security.md",
            "docs/workspace/structure.md",
        ];
        Assert.Equal(expected, pages);
    }

    [Fact(DisplayName = "applied pages ignore unknown stacks extensions and shapes")]
    public void AppliedPagesIgnoreUnknownSelections()
    {
        using var temp = Cli.Temp("layers");
        Trees(temp.Path);

        var pages = Layout.AppliedPages(temp.Path, Manifest(TreesManifest), "unknown", ["cobol"], ["nope"]);

        string[] expected =
        [
            "docs/core/system.md",
            "docs/quality/security.md",
            "docs/workspace/structure.md",
        ];
        Assert.Equal(expected, pages);
    }

    [Fact(DisplayName = "a folder holding no stack applies with its parent")]
    public void AFolderHoldingNoStackAppliesWithItsParent()
    {
        using var temp = Cli.Temp("layers");
        Trees(temp.Path);
        Page(temp.Path, "docs/frontend/patterns/record-detail.md");
        Page(temp.Path, "docs/frontend/patterns/forms/inline.md");
        Page(temp.Path, "docs/backend/sample/guides/errors.md");

        var react = Layout.AppliedPages(temp.Path, Manifest(TreesManifest), "client-only", ["react"], []);
        var sample = Layout.AppliedPages(temp.Path, Manifest(TreesManifest), "server", ["sample"], []);

        Assert.Contains("docs/frontend/patterns/record-detail.md", react);
        Assert.Contains("docs/frontend/patterns/forms/inline.md", react);
        Assert.DoesNotContain("docs/frontend/web/react/native/stack.md", react);
        Assert.DoesNotContain("docs/backend/sample/guides/errors.md", react);
        Assert.Contains("docs/backend/sample/guides/errors.md", sample);
        Assert.DoesNotContain("docs/frontend/patterns/record-detail.md", sample);
        Assert.Equal(
            new[] { "docs/frontend/patterns", "docs/frontend/patterns/forms" },
            Layout.CompanionFolders(temp.Path, "docs/frontend"));
    }
}
