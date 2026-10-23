using System.Text.Json.Nodes;

namespace LiteSpec.Tests.Consumer;

public sealed partial class ConsumerValidatorTests
{
    [Fact(DisplayName = "documentation root that is on disk")]
    public void DocumentationRootThatIsOnDisk()
    {
        using var folder = ConsumerFixture.Create();
        ConsumerFixture.MutateProject(folder.Path, project => PathsOf(project)["docs"] = "docs");
        AssertClean(RunConsumer(folder.Path));
    }

    [Fact(DisplayName = "documentation root that is not on disk")]
    public void DocumentationRootThatIsNotOnDisk()
    {
        using var folder = ConsumerFixture.Create();
        ConsumerFixture.MutateProject(folder.Path, project => PathsOf(project)["docs"] = "documentation");
        AssertProblem(RunConsumer(folder.Path), "paths.docs 'documentation' does not exist");
    }

    [Fact(DisplayName = "documentation root that holds no Markdown")]
    public void DocumentationRootThatHoldsNoMarkdown()
    {
        using var folder = ConsumerFixture.Create();
        Directory.CreateDirectory(Path.Combine(folder.Path, "empty-docs"));
        ConsumerFixture.MutateProject(folder.Path, project => PathsOf(project)["docs"] = "empty-docs");
        AssertProblem(RunConsumer(folder.Path), "Scanned no Markdown files");
    }

    [Fact(DisplayName = "project naming no backend stack")]
    public void ProjectNamingNoBackendStack()
    {
        using var folder = ConsumerFixture.Create();
        ConsumerFixture.MutateProject(folder.Path, project => project["stacks"] = new JsonArray("react"));
        AssertProblem(RunConsumer(folder.Path), "stacks name 0 backend stacks; name exactly one of dotnet");
    }

    [Fact(DisplayName = "project naming a stack the release does not ship")]
    public void ProjectNamingUnknownStack()
    {
        using var folder = ConsumerFixture.Create();
        ConsumerFixture.MutateProject(folder.Path, project => project["stacks"] = new JsonArray("dotnet", "cobol"));
        AssertProblem(RunConsumer(folder.Path), "stack 'cobol' is not a stack the pinned LiteSpec release ships");
    }

    [Fact(DisplayName = "stack-scoped extension without its stack")]
    public void StackScopedExtensionWithoutItsStack()
    {
        using var folder = ConsumerFixture.Create();
        ConsumerFixture.MutateProject(folder.Path, project =>
        {
            project["stacks"] = new JsonArray("svelte");
            project["selectedExtensions"] = new JsonArray(new JsonObject { ["id"] = "efcore", ["criterion"] = "orders need relational reporting", ["reviewBy"] = "2999-01-01" });
        });
        AssertProblem(RunConsumer(folder.Path), "extensions 'efcore' supports only the dotnet stack, which the project does not name in stacks");
    }

    [Fact(DisplayName = "stack-scoped extension with its stack")]
    public void StackScopedExtensionWithItsStack()
    {
        using var folder = ConsumerFixture.Create();
        ConsumerFixture.MutateProject(folder.Path, project =>
            project["selectedExtensions"] = new JsonArray(new JsonObject { ["id"] = "efcore", ["criterion"] = "orders need relational reporting", ["reviewBy"] = "2999-01-01" }));
        AssertAbsent(RunConsumer(folder.Path), "supports only the dotnet stack");
    }

    [Fact(DisplayName = "frontend declaring the backend stack as its platform")]
    public void FrontendDeclaringBackendStackAsPlatform()
    {
        using var folder = ConsumerFixture.Create();
        ConsumerFixture.MutateProject(folder.Path, project => ((JsonArray)PathsOf(project)["frontends"]!).Add(new JsonObject { ["name"] = "web", ["path"] = "apps/web", ["platform"] = "dotnet" }));
        AssertProblem(RunConsumer(folder.Path), "frontend 'web' has unknown platform 'dotnet'");
    }

    [Fact(DisplayName = "glossary path that is not on disk")]
    public void GlossaryPathThatIsNotOnDisk()
    {
        using var folder = ConsumerFixture.Create();
        ConsumerFixture.MutateProject(folder.Path, project => PathsOf(project)["glossary"] = "docs/missing.json");
        AssertProblem(RunConsumer(folder.Path), "paths.glossary 'docs/missing.json' does not exist");
    }

    [Fact(DisplayName = "frontend path that is not on disk")]
    public void FrontendPathThatIsNotOnDisk()
    {
        using var folder = ConsumerFixture.Create();
        ConsumerFixture.MutateProject(folder.Path, project =>
        {
            PathsOf(project)["frontends"] = new JsonArray(
                new JsonObject { ["name"] = "web", ["path"] = "apps/missing", ["platform"] = "react" });
        });
        AssertProblem(RunConsumer(folder.Path), "frontend 'web' path 'apps/missing' does not exist");
    }

    [Fact(DisplayName = "page under the documentation root is scanned")]
    public void PageUnderTheDocumentationRootIsScanned()
    {
        using var folder = ConsumerFixture.Create();
        ConsumerFixture.WriteFile(
            folder.Path,
            "docs/domain/modules/orders/unscanned.md",
            ConsumerFixture.Page(
                ConsumerFixture.Meta("""{"type":"workflow","id":"unscanned","title":"Unscanned","owner":"fixture","status":"approved"}"""),
                "# Unscanned\n"));
        AssertProblem(RunConsumer(folder.Path), "matches 0 of");
    }

    [Fact(DisplayName = "missing required title")]
    public void MissingRequiredTitle()
    {
        using var folder = ConsumerFixture.Create();
        ConsumerFixture.MutateMeta(
            folder.Path,
            "docs/domain/modules/orders/cancel-order.md",
            meta => meta.Remove("title"));
        AssertProblem(RunConsumer(folder.Path), "missing required property 'title'");
    }

    [Fact(DisplayName = "removed hand-written status field")]
    public void RemovedHandWrittenStatusField()
    {
        using var folder = ConsumerFixture.Create();
        ConsumerFixture.MutateMeta(
            folder.Path,
            "docs/domain/modules/orders/cancel-order.md",
            meta => meta["implementationStatus"] = "planned");
        AssertProblem(RunConsumer(folder.Path), "unknown property 'implementationStatus'");
    }

    [Fact(DisplayName = "status outside the lifecycle")]
    public void StatusOutsideTheLifecycle()
    {
        using var folder = ConsumerFixture.Create();
        ConsumerFixture.MutateMeta(
            folder.Path,
            "docs/product/brief.md",
            meta => meta["status"] = "final");
        AssertProblem(RunConsumer(folder.Path), "/status");
    }

    [Fact(DisplayName = "use-case kind outside command, query and reaction")]
    public void UseCaseKindOutsideCommandQueryAndReaction()
    {
        using var folder = ConsumerFixture.Create();
        ConsumerFixture.MutateMeta(
            folder.Path,
            "docs/domain/modules/orders/cancel-order.md",
            meta => meta["kind"] = "mutation");
        AssertProblem(RunConsumer(folder.Path), "/kind");
    }

    [Fact(DisplayName = "result entry without its outcome")]
    public void ResultEntryWithoutItsOutcome()
    {
        using var folder = ConsumerFixture.Create();
        ConsumerFixture.MutateMeta(
            folder.Path,
            "docs/domain/modules/orders/cancel-order.md",
            meta => ((JsonObject)((JsonArray)meta["records"]!)[0]!).Remove("outcome"));
        AssertProblem(RunConsumer(folder.Path), "/records/0");
    }

    [Fact(DisplayName = "retired page type from the old model")]
    public void RetiredPageTypeFromTheOldModel()
    {
        using var folder = ConsumerFixture.Create();
        ConsumerFixture.MutateMeta(
            folder.Path,
            "docs/domain/modules/orders/cancel-order.md",
            meta => meta["type"] = "business-record");
        AssertProblem(RunConsumer(folder.Path), "matches 0 of");
    }

    [Fact(DisplayName = "page with no frontmatter block")]
    public void PageWithNoFrontmatterBlock()
    {
        using var folder = ConsumerFixture.Create();
        ConsumerFixture.WriteFile(
            folder.Path,
            "docs/domain/modules/orders/plain.md",
            "# Plain\n\nA page with no record.\n");
        AssertProblem(RunConsumer(folder.Path), "no frontmatter block");
    }

    [Fact(DisplayName = "page with a broken frontmatter block")]
    public void PageWithABrokenFrontmatterBlock()
    {
        using var folder = ConsumerFixture.Create();
        ConsumerFixture.WriteFile(
            folder.Path,
            "docs/domain/modules/orders/broken.md",
            "---\n{bad json}\n---\n\n# Broken\n");
        AssertProblem(RunConsumer(folder.Path), "JSON parse error");
    }
}
