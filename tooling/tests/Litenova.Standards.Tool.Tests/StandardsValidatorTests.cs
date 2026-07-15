using Litenova.Standards.Services;
using System.Text.Json.Nodes;

namespace Litenova.Standards.Tests;

public sealed class StandardsValidatorTests : IDisposable
{
    private readonly string _root = Path.Combine(Path.GetTempPath(), $"standards-{Guid.NewGuid():N}");

    [Fact]
    public void Validate_accepts_a_consistent_repository()
    {
        TestRepositoryBuilder.Create(_root);
        var repository = StandardsRepository.Load(_root);

        var report = StandardsValidator.Validate(repository);

        Assert.True(report.IsValid, string.Join(Environment.NewLine, report.Errors.Select(error => error.Message)));
    }

    [Fact]
    public void Validate_rejects_duplicate_rule_ids()
    {
        TestRepositoryBuilder.Create(_root);
        var path = Path.Combine(_root, "docs", "core", "second.md");
        File.WriteAllText(path, TestRepositoryBuilder.Document(
            "core.second",
            "## CORE.SCOPE.001 - Duplicate rule\n\nDuplicate."));
        var repository = StandardsRepository.Load(_root);

        var report = StandardsValidator.Validate(repository);

        Assert.Contains(report.Errors, issue => issue.Code == "RULE_ID");
    }

    [Fact]
    public void Validate_rejects_missing_load_plan_anchor()
    {
        TestRepositoryBuilder.Create(_root);
        var path = Path.Combine(_root, "docs", "core", "principles.md");
        File.WriteAllText(
            path,
            File.ReadAllText(path).Replace(
                "Agent Quick Rules {#agent-quick-rules}",
                "Renamed Rules {#renamed-rules}",
                StringComparison.Ordinal));
        var repository = StandardsRepository.Load(_root);

        var report = StandardsValidator.Validate(repository);

        Assert.Contains(report.Errors, issue => issue.Code == "LOAD_ANCHOR");
    }

    [Fact]
    public void Validate_rejects_unpinned_recipe_packages_and_unknown_replacements()
    {
        TestRepositoryBuilder.Create(_root);
        var recipeDirectory = Path.Combine(_root, "docs", "recipes", "sample");
        Directory.CreateDirectory(recipeDirectory);
        File.WriteAllText(
            Path.Combine(recipeDirectory, "README.md"),
            """
            ---
            {
              "id": "recipe.sample",
              "kind": "recipe",
              "normative": true,
              "appliesTo": ["all"],
              "recipes": ["sample"]
            }
            ---
            # Sample

            ## RECIPE.SAMPLE.ADOPT.001 - Adopt the sample

            Use the sample.
            """);
        File.WriteAllText(
            Path.Combine(recipeDirectory, "recipe.json"),
            """
            {
              "id": "sample",
              "version": "1.0.0",
              "entry": "docs/recipes/sample/README.md",
              "triggers": ["A test needs it."],
              "replaces": ["UNKNOWN.RULE.001"],
              "packages": { "nuget": ["Unknown.Package"], "npm": [] },
              "projects": [],
              "compatibleWith": [],
              "incompatibleWith": [],
              "gates": []
            }
            """);
        var manifestPath = Path.Combine(_root, "standards.manifest.json");
        var manifest = JsonNode.Parse(File.ReadAllText(manifestPath))!.AsObject();
        manifest["recipes"]!["sample"] = "docs/recipes/sample/recipe.json";
        File.WriteAllText(manifestPath, manifest.ToJsonString(JsonSupport.WriteOptions));
        var repository = StandardsRepository.Load(_root);

        var report = StandardsValidator.Validate(repository);

        Assert.Contains(report.Errors, issue => issue.Code == "RECIPE_PACKAGE");
        Assert.Contains(report.Errors, issue => issue.Code == "RECIPE_REPLACEMENT");
    }

    public void Dispose()
    {
        if (Directory.Exists(_root))
        {
            Directory.Delete(_root, recursive: true);
        }
    }
}
