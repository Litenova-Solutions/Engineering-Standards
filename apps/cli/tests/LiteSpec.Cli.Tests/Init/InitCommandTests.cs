using System.Text.Json.Nodes;
using LiteSpec.Tests.Support;

namespace LiteSpec.Tests.Init;

/// <summary>Tests for <c>litespec init</c>.</summary>
public sealed class InitCommandTests
{
    const string FixtureVersion = "9.9.9-test";

    [Theory(DisplayName = "init keeps the shared UI package only for a controlled web frontend")]
    [InlineData("dotnet-react", true)]
    [InlineData("dotnet-svelte", true)]
    [InlineData("blazor-client", false)]
    public void InitKeepsTheUiPackageOnlyForControlledFrontends(string preset, bool expected)
    {
        using var consumer = Cli.Temp("init-ui");

        var result = Cli.Run("init", "--preset", preset, "--size", "small", "--root", consumer.Path);

        Assert.Equal(0, result.Status);
        var paths = JsonNode.Parse(File.ReadAllText(Path.Combine(consumer.Path, "litespec.project.json")))!["paths"]!.AsObject();
        Assert.Equal(expected, paths.ContainsKey("uiPackage"));
        Assert.Equal(expected, paths.ContainsKey("uiPatterns"));
    }

    [Fact(DisplayName = "init fills the project name and lists the placeholders left to fill")]
    public void InitFillsTheProjectNameAndListsPlaceholders()
    {
        using var consumer = Cli.Temp("init-placeholders");

        var result = Cli.Run("init", "--preset", "dotnet-react", "--size", "small", "--root", consumer.Path, "--name", "shop");

        Assert.Equal(0, result.Status);
        Assert.Contains("Fill these placeholders before validating: __OWNER__.", result.Stdout, StringComparison.Ordinal);
        var text = File.ReadAllText(Path.Combine(consumer.Path, "litespec.project.json"));
        Assert.Contains("\"apps/api/shop.slnx\"", text, StringComparison.Ordinal);
        Assert.Contains("\"@shop/ui\"", text, StringComparison.Ordinal);
        Assert.DoesNotContain("__PROJECT__", text, StringComparison.Ordinal);
        Assert.DoesNotContain("fixture", text, StringComparison.Ordinal);
    }

    [Fact(DisplayName = "init writes a capitalized project name as a lowercase package scope")]
    public void InitLowercasesThePackageScope()
    {
        using var consumer = Cli.Temp("init-scope");

        var result = Cli.Run("init", "--preset", "dotnet-svelte", "--size", "small", "--root", consumer.Path, "--name", "Team Expenses");

        Assert.Equal(0, result.Status);
        var text = File.ReadAllText(Path.Combine(consumer.Path, "litespec.project.json"));
        Assert.Contains("\"@team-expenses/ui\"", text, StringComparison.Ordinal);
        Assert.Contains("\"apps/api/Team Expenses.slnx\"", text, StringComparison.Ordinal);
    }

    [Fact(DisplayName = "init copies the agent context, glossary, and example cast beside the project file")]
    public void CopiesScaffoldFilesBesideTheProjectFile()
    {
        using var consumer = Cli.Temp("init-scaffold");

        var result = Cli.Run("init", "--preset", "dotnet-react", "--size", "small", "--root", consumer.Path);

        Assert.Equal(0, result.Status);
        var agents = Path.Combine(consumer.Path, "AGENTS.md");
        var glossary = Path.Combine(consumer.Path, "docs", "glossary.json");
        var cast = Path.Combine(consumer.Path, "docs", "domain", "example-cast.md");
        Assert.Contains("litespec.project.json", File.ReadAllText(agents), StringComparison.Ordinal);
        Assert.Contains("glossary.schema.json", File.ReadAllText(glossary), StringComparison.Ordinal);
        Assert.Contains("\"example-cast\"", File.ReadAllText(cast), StringComparison.Ordinal);
        Assert.Contains($"Wrote {agents}.", result.Stdout, StringComparison.Ordinal);
        Assert.Contains($"Wrote {glossary}.", result.Stdout, StringComparison.Ordinal);
        Assert.Contains($"Wrote {cast}.", result.Stdout, StringComparison.Ordinal);
        Assert.Contains("Fill every <placeholder> in the copied files before validating.", result.Stdout, StringComparison.Ordinal);
    }

    [Fact(DisplayName = "init writes the tool manifest pinning the tool at the release")]
    public void WritesToolManifestAtTheRelease()
    {
        using var home = Cli.Temp("init-home");
        using var consumer = Cli.Temp("init-consumer");
        FixtureHome(home.Path);

        var result = Cli.Run(
            ["init", "--preset", "dotnet-react", "--size", "small", "--root", consumer.Path],
            environment: new Dictionary<string, string> { ["LITESPEC_HOME"] = home.Path });

        Assert.Equal(0, result.Status);
        var tools = Path.Combine(consumer.Path, ".config", "dotnet-tools.json");
        Assert.Contains($"Wrote {tools}.", result.Stdout, StringComparison.Ordinal);
        var manifest = JsonNode.Parse(File.ReadAllText(tools))!;
        Assert.Equal(FixtureVersion, manifest["tools"]!["LiteSpec.Cli"]!["version"]!.GetValue<string>());
        Assert.Equal("litespec", manifest["tools"]!["LiteSpec.Cli"]!["commands"]![0]!.GetValue<string>());
    }

    [Fact(DisplayName = "init leaves an existing tool manifest alone and still exits zero")]
    public void LeavesExistingToolManifestAlone()
    {
        using var home = Cli.Temp("init-home");
        using var consumer = Cli.Temp("init-consumer");
        FixtureHome(home.Path);

        var tools = Path.Combine(consumer.Path, ".config", "dotnet-tools.json");
        Directory.CreateDirectory(Path.GetDirectoryName(tools)!);
        File.WriteAllText(tools, "{\"sentinel\": true}\n");

        var result = Cli.Run(
            ["init", "--preset", "dotnet-react", "--size", "small", "--root", consumer.Path],
            environment: new Dictionary<string, string> { ["LITESPEC_HOME"] = home.Path });

        Assert.Equal(0, result.Status);
        Assert.Equal("{\"sentinel\": true}\n", File.ReadAllText(tools));
        Assert.Contains($"'{tools}' already exists; left alone.", result.Stdout, StringComparison.Ordinal);
    }

    [Fact(DisplayName = "init fills the LiteSpec block of a fresh agent context")]
    public void FillsTheLiteSpecBlock()
    {
        using var home = Cli.Temp("init-home");
        using var consumer = Cli.Temp("init-consumer");
        FixtureHome(home.Path);

        var result = Cli.Run(
            ["init", "--preset", "dotnet-react", "--size", "small", "--root", consumer.Path],
            environment: new Dictionary<string, string> { ["LITESPEC_HOME"] = home.Path });

        Assert.Equal(0, result.Status);
        var agents = File.ReadAllText(Path.Combine(consumer.Path, "AGENTS.md"));
        Assert.Contains("## LiteSpec", agents, StringComparison.Ordinal);
        Assert.Contains(
            $"This project follows LiteSpec {FixtureVersion}: size small, shape server, stacks dotnet and react, extensions none.",
            agents,
            StringComparison.Ordinal);
        Assert.Contains(
            $"https://litespec.dev/{FixtureVersion}/select/server.dotnet.react/llms.txt",
            agents,
            StringComparison.Ordinal);
        Assert.DoesNotContain("__LITESPEC_VERSION__", agents, StringComparison.Ordinal);
        Assert.DoesNotContain("__SELECTION_KEY__", agents, StringComparison.Ordinal);
    }

    [Fact(DisplayName = "init leaves existing scaffold files alone and still exits zero")]
    public void LeavesExistingScaffoldFilesAlone()
    {
        using var home = Cli.Temp("init-home");
        using var consumer = Cli.Temp("init-consumer");
        FixtureHome(home.Path);

        var agents = Path.Combine(consumer.Path, "AGENTS.md");
        File.WriteAllText(agents, "# Ours\n");

        var result = Cli.Run(
            ["init", "--preset", "dotnet-react", "--size", "small", "--root", consumer.Path],
            environment: new Dictionary<string, string> { ["LITESPEC_HOME"] = home.Path });

        Assert.Equal(0, result.Status);
        Assert.Equal("# Ours\n", File.ReadAllText(agents));
        Assert.Contains($"'{agents}' already exists; left alone.", result.Stdout, StringComparison.Ordinal);
        Assert.True(File.Exists(Path.Combine(consumer.Path, "docs", "glossary.json")));
    }

    [Fact(DisplayName = "init with a missing scaffold template names the checkout file and writes nothing")]
    public void MissingScaffoldTemplateNamesTheCheckoutFile()
    {
        using var home = Cli.Temp("init-home");
        using var consumer = Cli.Temp("init-consumer");
        FixtureHome(home.Path, scaffold: false);

        var result = Cli.Run(
            ["init", "--preset", "dotnet-react", "--size", "small", "--root", consumer.Path],
            environment: new Dictionary<string, string> { ["LITESPEC_HOME"] = home.Path });

        Assert.Equal(1, result.Status);
        Assert.Contains("holds no readable templates/consumer/project-agents.md", result.Stderr, StringComparison.Ordinal);
        Assert.False(File.Exists(Path.Combine(consumer.Path, "litespec.project.json")));
    }

    [Theory(DisplayName = "init writes a project file from each preset")]
    [InlineData("dotnet-react", "small", "server", "dotnet,react", "web", "apps/web", "react")]
    [InlineData("dotnet-react", "large", "server", "dotnet,react", "web", "apps/web", "react")]
    [InlineData("dotnet-svelte", "small", "server", "dotnet,svelte", "web", "apps/web", "svelte")]
    [InlineData("dotnet-svelte", "large", "server", "dotnet,svelte", "web", "apps/web", "svelte")]
    [InlineData("blazor-client", "small", "client-only", "blazor", "app", "apps/app", "blazor")]
    [InlineData("blazor-client", "large", "client-only", "blazor", "app", "apps/app", "blazor")]
    public void WritesProjectFileFromPreset(
        string preset, string size, string shape, string stacks, string frontend, string path, string platform)
    {
        using var home = Cli.Temp("init-home");
        using var consumer = Cli.Temp("init-consumer");
        FixtureHome(home.Path);

        var result = Cli.Run(
            ["init", "--preset", preset, "--size", size, "--root", consumer.Path, "--name", "testshop"],
            environment: new Dictionary<string, string> { ["LITESPEC_HOME"] = home.Path });

        Assert.Equal(0, result.Status);
        var target = Path.Combine(consumer.Path, "litespec.project.json");
        Assert.Contains(target, result.Stdout);
        Assert.Contains("litespec consumer", result.Stdout);

        var project = JsonNode.Parse(File.ReadAllText(target))!.AsObject();
        Assert.Equal(shape, project["shape"]!.GetValue<string>());
        Assert.Equal(stacks.Split(','), project["stacks"]!.AsArray().Select(node => node!.GetValue<string>()));
        Assert.Equal(size, project["size"]!.GetValue<string>());
        Assert.Equal("testshop", project["project"]!["name"]!.GetValue<string>());
        Assert.Equal(FixtureVersion, project["reviewedLiteSpecVersion"]!.GetValue<string>());

        var frontends = project["paths"]!["frontends"]!.AsArray();
        var only = Assert.Single(frontends);
        Assert.Equal(frontend, only!["name"]!.GetValue<string>());
        Assert.Equal(path, only["path"]!.GetValue<string>());
        Assert.Equal(platform, only["platform"]!.GetValue<string>());

        // Fields the template owns and the preset does not name survive the overlay.
        Assert.Equal("docs", project["paths"]!["docs"]!.GetValue<string>());
    }

    [Fact(DisplayName = "init defaults the project name to the root folder's name")]
    public void DefaultsNameToRootFolder()
    {
        using var home = Cli.Temp("init-home");
        using var consumer = Cli.Temp("init-consumer");
        FixtureHome(home.Path);

        var result = Cli.Run(
            ["init", "--preset", "dotnet-react", "--size", "small", "--root", consumer.Path],
            environment: new Dictionary<string, string> { ["LITESPEC_HOME"] = home.Path });

        Assert.Equal(0, result.Status);
        var project = JsonNode.Parse(File.ReadAllText(Path.Combine(consumer.Path, "litespec.project.json")))!.AsObject();
        Assert.Equal(new DirectoryInfo(consumer.Path).Name, project["project"]!["name"]!.GetValue<string>());
    }

    [Fact(DisplayName = "init never overwrites an existing project file")]
    public void NeverOverwritesExistingFile()
    {
        using var home = Cli.Temp("init-home");
        using var consumer = Cli.Temp("init-consumer");
        FixtureHome(home.Path);

        var target = Path.Combine(consumer.Path, "litespec.project.json");
        File.WriteAllText(target, "{\"sentinel\": true}\n");

        var result = Cli.Run(
            ["init", "--preset", "dotnet-react", "--size", "small", "--root", consumer.Path],
            environment: new Dictionary<string, string> { ["LITESPEC_HOME"] = home.Path });

        Assert.Equal(2, result.Status);
        Assert.Contains("already exists", result.Stderr);
        Assert.Equal("{\"sentinel\": true}\n", File.ReadAllText(target));
        Assert.False(File.Exists(Path.Combine(consumer.Path, "AGENTS.md")));
    }

    [Fact(DisplayName = "init with an unknown preset lists the known ones")]
    public void UnknownPresetListsKnownOnes()
    {
        using var home = Cli.Temp("init-home");
        using var consumer = Cli.Temp("init-consumer");
        FixtureHome(home.Path);

        var result = Cli.Run(
            ["init", "--preset", "nope", "--size", "small", "--root", consumer.Path],
            environment: new Dictionary<string, string> { ["LITESPEC_HOME"] = home.Path });

        Assert.Equal(2, result.Status);
        Assert.Contains("Unknown preset 'nope'", result.Stderr);
        Assert.Contains("blazor-client, dotnet-react, dotnet-svelte", result.Stderr);
        Assert.False(File.Exists(Path.Combine(consumer.Path, "litespec.project.json")));
    }

    [Fact(DisplayName = "init with a bad size names the accepted sizes")]
    public void BadSizeNamesAcceptedSizes()
    {
        using var home = Cli.Temp("init-home");
        using var consumer = Cli.Temp("init-consumer");
        FixtureHome(home.Path);

        var result = Cli.Run(
            ["init", "--preset", "dotnet-react", "--size", "medium", "--root", consumer.Path],
            environment: new Dictionary<string, string> { ["LITESPEC_HOME"] = home.Path });

        Assert.Equal(2, result.Status);
        Assert.Contains("Unknown size 'medium'; use small or large.", result.Stderr);
        Assert.False(File.Exists(Path.Combine(consumer.Path, "litespec.project.json")));
    }

    [Fact(DisplayName = "init without a size is a usage error")]
    public void MissingSizeIsUsageError()
    {
        using var home = Cli.Temp("init-home");
        using var consumer = Cli.Temp("init-consumer");
        FixtureHome(home.Path);

        var result = Cli.Run(
            ["init", "--preset", "dotnet-react", "--root", consumer.Path],
            environment: new Dictionary<string, string> { ["LITESPEC_HOME"] = home.Path });

        Assert.Equal(2, result.Status);
        Assert.Contains("Missing --size; use small or large.", result.Stderr);
    }

    [Fact(DisplayName = "init without a preset is a usage error")]
    public void MissingPresetIsUsageError()
    {
        using var home = Cli.Temp("init-home");
        using var consumer = Cli.Temp("init-consumer");
        FixtureHome(home.Path);

        var result = Cli.Run(
            ["init", "--size", "small", "--root", consumer.Path],
            environment: new Dictionary<string, string> { ["LITESPEC_HOME"] = home.Path });

        Assert.Equal(2, result.Status);
        Assert.Contains("Missing --preset.", result.Stderr);
    }

    [Fact(DisplayName = "init --help prints the usage")]
    public void HelpPrintsUsage()
    {
        var result = Cli.Run("init", "--help");
        Assert.Equal(0, result.Status);
        Assert.Contains("Usage: litespec init", result.Stdout);
    }

    /// <summary>
    ///     Builds a self-contained LiteSpec checkout: a manifest with a version no
    ///     release ships, a minimal consumer template, the repository's scaffold
    ///     templates, and the repository's presets.
    /// </summary>
    static void FixtureHome(string home, bool scaffold = true)
    {
        File.WriteAllText(Path.Combine(home, "litespec.manifest.json"), $$"""
            {
              "version": "{{FixtureVersion}}"
            }
            """);

        var templateDir = Path.Combine(home, "templates", "consumer");
        Directory.CreateDirectory(templateDir);
        File.WriteAllText(Path.Combine(templateDir, "litespec.project.json"), """
            {
              "project": {
                "name": "template-name"
              },
              "size": "small",
              "stacks": [],
              "reviewedLiteSpecVersion": "0.0.0-template",
              "paths": {
                "docs": "docs",
                "frontends": []
              },
              "selectedExtensions": []
            }
            """);

        if (scaffold)
        {
            foreach (var name in new[] { "project-agents.md", "glossary.json", "example-cast.md" })
            {
                File.Copy(
                    Path.Combine(Cli.Repository, "templates", "consumer", name),
                    Path.Combine(templateDir, name));
            }
        }

        var presetDir = Path.Combine(home, "templates", "presets");
        Directory.CreateDirectory(presetDir);
        foreach (var name in new[] { "dotnet-react", "dotnet-svelte", "blazor-client" })
        {
            File.Copy(
                Path.Combine(Cli.Repository, "templates", "presets", $"{name}.json"),
                Path.Combine(presetDir, $"{name}.json"));
        }
    }
}
