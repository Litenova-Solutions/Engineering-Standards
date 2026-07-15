namespace Litenova.Standards.Tests;

internal static class TestRepositoryBuilder
{
    public static void Create(string root)
    {
        Directory.CreateDirectory(Path.Combine(root, "docs", "core"));
        Directory.CreateDirectory(Path.Combine(root, "docs", "profile"));
        Directory.CreateDirectory(Path.Combine(root, "templates"));
        Directory.CreateDirectory(Path.Combine(root, "generated"));
        File.WriteAllText(Path.Combine(root, "AGENTS.md"), "Read the selected standards profile.");
        File.WriteAllText(
            Path.Combine(root, "docs", "core", "principles.md"),
            Document("core.principles", """
                ## CORE.SCOPE.002 - Keep one source for each rule

                Link to a rule instead of copying it.

                ## CORE.SCOPE.001 - Stay inside the supported profile

                Use the selected profile.
                """));
        File.WriteAllText(Path.Combine(root, "standards.manifest.json"), Manifest());
    }

    public static string Document(string id, string body) => $$"""
        ---
        {
          "id": "{{id}}",
          "kind": "core",
          "normative": true,
          "appliesTo": ["all"],
          "recipes": []
        }
        ---
        # Test document

        {{body}}
        """;

    private static string Manifest() => """
        {
          "schemaVersion": 1,
          "version": "1.0.0",
          "name": "test-standards",
          "agentsEntry": "AGENTS.md",
          "defaultProfile": "test",
          "paths": {
            "docs": "docs",
            "templates": "templates",
            "recipes": "docs/recipes",
            "generated": "generated"
          },
          "profiles": {
            "test": {
              "entry": "docs/core/principles.md",
              "documents": ["docs/core/principles.md"]
            }
          },
          "recipes": {},
          "stack": { "dotnet": "10.0.100" },
          "packages": { "nuget": {}, "npm": {} },
          "loadPlans": {
            "all": {
              "tier0": ["AGENTS.md"],
              "tier1": ["docs/core/principles.md"],
              "tier2": []
            }
          },
          "budgets": {
            "agentsMaxWords": 100,
            "tier1MaxWords": 100,
            "taskMaxDocuments": 5,
            "taskMaxWords": 200
          },
          "generatedFiles": [
            "generated/document-index.json",
            "generated/rule-catalog.json",
            "generated/recipe-index.json",
            "generated/load-plans.json"
          ]
        }
        """;
}

