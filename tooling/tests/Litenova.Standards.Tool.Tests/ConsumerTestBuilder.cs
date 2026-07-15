namespace Litenova.Standards.Tests;

internal static class ConsumerTestBuilder
{
    public static string Create(
        string standardsRoot,
        bool includeTestReference,
        bool includeUseCase = true)
    {
        var root = Path.Combine(standardsRoot, "consumer");
        Directory.CreateDirectory(Path.Combine(root, "docs", "domain", "posts"));
        Directory.CreateDirectory(Path.Combine(root, "docs", "ui", "web"));
        Directory.CreateDirectory(Path.Combine(root, "apps", "api"));
        Directory.CreateDirectory(Path.Combine(root, "apps", "api", "tests", "Sample.Integration.Tests"));
        File.WriteAllText(Path.Combine(root, "apps", "api", "Sample.slnx"), "<Solution />");
        File.WriteAllText(
            Path.Combine(root, "standards.project.json"),
            """
            {
              "project": { "name": "Sample" },
              "profile": "test",
              "paths": {
                "apiSolution": "apps/api/Sample.slnx",
                "domainDocs": "docs/domain",
                "uiDocs": "docs/ui",
                "frontends": []
              },
              "recipes": [],
              "overrides": []
            }
            """);
        File.WriteAllText(
            Path.Combine(root, "docs", "domain", "posts", "README.md"),
            """
            ---
            { "id": "posts", "kind": "feature", "status": "active" }
            ---
            # Posts
            """);

        if (includeUseCase)
        {
            File.WriteAllText(
                Path.Combine(root, "docs", "domain", "posts", "create.md"),
                """
                ---
                {
                  "id": "posts.create",
                  "kind": "command",
                  "status": "active",
                  "actors": ["author"],
                  "surfaces": ["api"],
                  "criticality": [],
                  "recipes": []
                }
                ---
                # Create post

                ## Acceptance criteria

                - [AC-POSTS-CREATE-01] An author can create a post.
                """);
            File.WriteAllText(
                Path.Combine(root, "docs", "ui", "web", "create-post.md"),
                """
                ---
                {
                  "id": "web.create-post",
                  "kind": "page",
                  "app": "web",
                  "route": "/posts/new",
                  "useCases": ["posts.create"]
                }
                ---
                # Create post page
                """);
        }

        if (includeTestReference)
        {
            File.WriteAllText(
                Path.Combine(root, "apps", "api", "tests", "Sample.Integration.Tests", "CreatePostTests.cs"),
                """
                public sealed class CreatePostTests
                {
                    [Trait("AcceptanceCriterion", "AC-POSTS-CREATE-01")]
                    public void Creates_a_post() { }
                }
                """);
        }

        return Path.Combine(root, "standards.project.json");
    }

    public static void CreateTemplates(string standardsRoot)
    {
        var directory = Path.Combine(standardsRoot, "templates", "docs");
        Directory.CreateDirectory(directory);
        File.WriteAllText(
            Path.Combine(directory, "feature.md"),
            """
            ---
            { "id": "__FEATURE__", "kind": "feature", "status": "planned" }
            ---
            # __TITLE__
            """);
        File.WriteAllText(
            Path.Combine(directory, "use-case.md"),
            """
            ---
            {
              "id": "__FEATURE__.__USE_CASE__",
              "kind": "__KIND__",
              "status": "planned",
              "actors": ["__ACTOR__"],
              "surfaces": [],
              "criticality": [],
              "recipes": []
            }
            ---
            # __TITLE__

            - [AC-__FEATURE_ID__-__USE_CASE_ID__-01] Replace this criterion.
            """);
    }
}
