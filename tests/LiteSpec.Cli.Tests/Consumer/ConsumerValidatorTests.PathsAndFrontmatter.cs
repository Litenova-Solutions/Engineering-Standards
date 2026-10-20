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
        ConsumerFixture.MutateProject(folder.Path, project => PathsOf(project)["docs"] = "litespec");
        AssertProblem(RunConsumer(folder.Path), "Scanned no Markdown files");
    }

    [Fact(DisplayName = "language record path that is not on disk")]
    public void LanguageRecordPathThatIsNotOnDisk()
    {
        using var folder = ConsumerFixture.Create();
        ConsumerFixture.MutateProject(folder.Path, project => PathsOf(project)["language"] = "docs/missing.json");
        AssertProblem(RunConsumer(folder.Path), "paths.language 'docs/missing.json' does not exist");
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

    [Fact(DisplayName = "use-case operation outside command and query")]
    public void UseCaseOperationOutsideCommandAndQuery()
    {
        using var folder = ConsumerFixture.Create();
        ConsumerFixture.MutateMeta(
            folder.Path,
            "docs/domain/modules/orders/cancel-order.md",
            meta => meta["operation"] = "mutation");
        AssertProblem(RunConsumer(folder.Path), "/operation");
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
            meta => meta["type"] = "aggregate");
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
