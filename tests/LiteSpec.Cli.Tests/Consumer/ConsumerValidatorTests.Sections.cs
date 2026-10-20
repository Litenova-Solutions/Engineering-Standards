namespace LiteSpec.Tests.Consumer;

public sealed partial class ConsumerValidatorTests
{
    const string DecisionPage = "docs/product/decisions/0001-launch.md";
    const string TutorialPage = "docs/guide/first-run.md";
    const string HowToPage = "docs/guide/add-a-pack.md";
    const string CommandPage = "docs/tools/fixture-up.md";
    const string ReferencePage = "docs/reference/ports.md";
    const string ConfigurationPage = "docs/tools/configuration.md";
    const string UseCasePage = "docs/domain/modules/orders/cancel-order.md";
    const string ModulePage = "docs/domain/modules/orders/README.md";

    static string ReplaceFirst(string raw, string oldValue, string newValue)
    {
        var index = raw.IndexOf(oldValue, StringComparison.Ordinal);
        return raw.Substring(0, index) + newValue + raw.Substring(index + oldValue.Length);
    }

    [Fact(DisplayName = "decision that omits its evidence")]
    public void DecisionThatOmitsItsEvidence()
    {
        using var folder = ConsumerFixture.Create();
        ConsumerFixture.MutateBody(folder.Path, DecisionPage, raw => ReplaceFirst(raw, "## Evidence", "## Notes"));
        AssertProblem(RunConsumer(folder.Path), "requires an H2 'Evidence'");
    }

    [Fact(DisplayName = "decision that omits its options")]
    public void DecisionThatOmitsItsOptions()
    {
        using var folder = ConsumerFixture.Create();
        ConsumerFixture.MutateBody(folder.Path, DecisionPage, raw => ReplaceFirst(raw, "## Options", "## Notes"));
        AssertProblem(RunConsumer(folder.Path), "requires an H2 'Options'");
    }

    [Fact(DisplayName = "tutorial that omits what the reader built")]
    public void TutorialThatOmitsWhatTheReaderBuilt()
    {
        using var folder = ConsumerFixture.Create();
        ConsumerFixture.MutateBody(folder.Path, TutorialPage, raw => ReplaceFirst(raw, "## What you built", "## Verification"));
        AssertProblem(RunConsumer(folder.Path), "requires an H2 'What you built'");
    }

    [Fact(DisplayName = "how-to with no verification")]
    public void HowToWithNoVerification()
    {
        using var folder = ConsumerFixture.Create();
        ConsumerFixture.MutateBody(folder.Path, HowToPage, raw => ReplaceFirst(raw, "## Verification", "## Notes"));
        AssertProblem(RunConsumer(folder.Path), "requires an H2 'Verification'");
    }

    [Fact(DisplayName = "command page hiding its mechanism")]
    public void CommandPageHidingItsMechanism()
    {
        using var folder = ConsumerFixture.Create();
        ConsumerFixture.MutateBody(
            folder.Path,
            CommandPage,
            raw => raw.Substring(0, raw.IndexOf("## Underneath", StringComparison.Ordinal)));
        AssertProblem(RunConsumer(folder.Path), "requires an H2 'Underneath'");
    }

    [Fact(DisplayName = "reference page with no reference section")]
    public void ReferencePageWithNoReferenceSection()
    {
        using var folder = ConsumerFixture.Create();
        ConsumerFixture.MutateBody(folder.Path, ReferencePage, raw => ReplaceFirst(raw, "## Reference", "## Procedure"));
        AssertProblem(RunConsumer(folder.Path), "requires an H2 'Reference'");
    }

    [Fact(DisplayName = "configuration page with no precedence")]
    public void ConfigurationPageWithNoPrecedence()
    {
        using var folder = ConsumerFixture.Create();
        ConsumerFixture.MutateBody(folder.Path, ConfigurationPage, raw => ReplaceFirst(raw, "## Precedence", "## Notes"));
        AssertProblem(RunConsumer(folder.Path), "requires an H2 'Precedence'");
    }

    [Fact(DisplayName = "use-case page keeps free body prose")]
    public void UseCasePageKeepsFreeBodyProse()
    {
        using var folder = ConsumerFixture.Create();
        ConsumerFixture.MutateBody(folder.Path, UseCasePage, raw => $"{raw}\nA note with no heading.\n");
        AssertClean(RunConsumer(folder.Path));
    }

    [Fact(DisplayName = "module page keeps free body prose")]
    public void ModulePageKeepsFreeBodyProse()
    {
        using var folder = ConsumerFixture.Create();
        ConsumerFixture.MutateBody(folder.Path, ModulePage, raw => $"{raw}\nA note with no heading.\n");
        AssertClean(RunConsumer(folder.Path));
    }
}
