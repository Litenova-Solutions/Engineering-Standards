using System.Text.Json.Nodes;

namespace LiteSpec.Tests.Consumer;

public sealed partial class ConsumerValidatorTests
{
    static void RequireSvelteNeedsReact(string root)
    {
        ConsumerFixture.MutateJson(root, "litespec/litespec.manifest.json", manifest =>
        {
            var svelte = (JsonObject)((JsonObject)manifest["stacks"]!)["svelte"]!;
            svelte["requires"] = new JsonArray("react");
        });
    }

    static void PairSvelteWith(string root, params string[] backends)
    {
        ConsumerFixture.MutateJson(root, "litespec/litespec.manifest.json", manifest =>
        {
            var svelte = (JsonObject)((JsonObject)manifest["stacks"]!)["svelte"]!;
            var pairs = new JsonArray();
            foreach (var backend in backends)
            {
                pairs.Add(backend);
            }

            svelte["pairsWith"] = pairs;
        });
    }

    [Fact(DisplayName = "server project with a backend and a frontend")]
    public void ServerProjectWithABackendAndAFrontend()
    {
        using var folder = ConsumerFixture.Create();
        ConsumerFixture.MutateProject(folder.Path, project => project["stacks"] = new JsonArray("dotnet", "react"));
        AssertClean(RunConsumer(folder.Path));
    }

    [Fact(DisplayName = "client-only project with blazor and no backend")]
    public void ClientOnlyProjectWithBlazorAndNoBackend()
    {
        using var folder = ConsumerFixture.Create();
        ConsumerFixture.MutateProject(folder.Path, project =>
        {
            project["shape"] = "client-only";
            project["stacks"] = new JsonArray("blazor");
        });
        AssertClean(RunConsumer(folder.Path));
    }

    [Fact(DisplayName = "client-only project naming a backend")]
    public void ClientOnlyProjectNamingABackend()
    {
        using var folder = ConsumerFixture.Create();
        ConsumerFixture.MutateProject(folder.Path, project =>
        {
            project["shape"] = "client-only";
            project["stacks"] = new JsonArray("blazor", "dotnet");
        });
        AssertProblem(RunConsumer(folder.Path), "shape 'client-only' names backend stack 'dotnet'");
    }

    [Fact(DisplayName = "frontend platform the project does not name")]
    public void FrontendPlatformTheProjectDoesNotName()
    {
        using var folder = ConsumerFixture.Create();
        ConsumerFixture.MutateProject(folder.Path, project =>
        {
            PathsOf(project)["frontends"] = new JsonArray(
                new JsonObject { ["name"] = "web", ["path"] = "apps/web", ["platform"] = "react" });
        });
        AssertProblem(RunConsumer(folder.Path), "platform 'react' is not a stack the project names in stacks");
    }

    [Fact(DisplayName = "frontend platform the project names")]
    public void FrontendPlatformTheProjectNames()
    {
        using var folder = ConsumerFixture.Create();
        ConsumerFixture.MutateProject(folder.Path, project =>
        {
            project["stacks"] = new JsonArray("dotnet", "blazor");
            PathsOf(project)["frontends"] = new JsonArray(
                new JsonObject { ["name"] = "door", ["path"] = "apps/door", ["platform"] = "blazor" });
        });
        Directory.CreateDirectory(Path.Combine(folder.Path, "apps", "door"));
        AssertClean(RunConsumer(folder.Path));
    }

    [Fact(DisplayName = "stack whose requires the project does not name")]
    public void StackWhoseRequiresTheProjectDoesNotName()
    {
        using var folder = ConsumerFixture.Create();
        RequireSvelteNeedsReact(folder.Path);
        ConsumerFixture.MutateProject(folder.Path, project => project["stacks"] = new JsonArray("dotnet", "svelte"));
        AssertProblem(RunConsumer(folder.Path), "stack 'svelte' requires 'react'");
    }

    [Fact(DisplayName = "stack whose requires the project names")]
    public void StackWhoseRequiresTheProjectNames()
    {
        using var folder = ConsumerFixture.Create();
        RequireSvelteNeedsReact(folder.Path);
        ConsumerFixture.MutateProject(folder.Path, project => project["stacks"] = new JsonArray("dotnet", "svelte", "react"));
        AssertAbsent(RunConsumer(folder.Path), "requires 'react'");
    }

    [Fact(DisplayName = "frontend stack whose pairsWith excludes the backend")]
    public void FrontendStackWhosePairsWithExcludesTheBackend()
    {
        using var folder = ConsumerFixture.Create();
        PairSvelteWith(folder.Path, "cobol");
        ConsumerFixture.MutateProject(folder.Path, project => project["stacks"] = new JsonArray("dotnet", "svelte"));
        AssertProblem(RunConsumer(folder.Path), "pairs only with cobol, not with backend stack 'dotnet'");
    }

    [Fact(DisplayName = "frontend stack whose pairsWith includes the backend")]
    public void FrontendStackWhosePairsWithIncludesTheBackend()
    {
        using var folder = ConsumerFixture.Create();
        PairSvelteWith(folder.Path, "dotnet");
        ConsumerFixture.MutateProject(folder.Path, project => project["stacks"] = new JsonArray("dotnet", "svelte"));
        AssertAbsent(RunConsumer(folder.Path), "pairs only with");
    }

    [Fact(DisplayName = "deferral naming the retired rule form")]
    public void DeferralNamingTheRetiredRuleForm()
    {
        using var folder = ConsumerFixture.Create();
        ConsumerFixture.MutateProject(folder.Path, project =>
        {
            project["selectedExtensions"] = new JsonArray(
                new JsonObject
                {
                    ["id"] = "stage",
                    ["criterion"] = "No deployment holds customer data.",
                    ["reviewBy"] = "2999-01-01",
                    ["releaseStage"] = "pre-production",
                    ["deferredProvisions"] = new JsonArray(
                        new JsonObject
                        {
                            ["provision"] = "litespec/rule/core-scope.retired-example-rule",
                            ["until"] = "2999-01-01",
                        }),
                });
        });
        AssertProblem(RunConsumer(folder.Path), "uses the retired litespec/rule/ form");
    }
}
