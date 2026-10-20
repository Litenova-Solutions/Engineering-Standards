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
    ///     release ships, a minimal consumer template, and the repository's presets.
    /// </summary>
    static void FixtureHome(string home)
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
