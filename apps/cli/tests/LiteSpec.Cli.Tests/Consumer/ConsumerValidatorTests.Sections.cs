namespace LiteSpec.Tests.Consumer;

public sealed partial class ConsumerValidatorTests
{
    const string BriefPage = "docs/product/brief.md";
    const string RequirementPage = "docs/product/pricing.md";
    const string DecisionPage = "docs/product/decisions/0001-launch.md";
    const string ActorPage = "docs/behavior/actors/customer.md";
    const string TutorialPage = "docs/guide/first-run.md";
    const string HowToPage = "docs/guide/add-a-pack.md";
    const string CommandPage = "docs/tools/fixture-up.md";
    const string ReferencePage = "docs/reference/ports.md";
    const string ConfigurationPage = "docs/tools/configuration.md";
    const string UseCasePage = "docs/behavior/modules/orders/cancel-order.md";
    const string AggregatePage = "docs/behavior/modules/orders/order-claims/README.md";
    const string ModulePage = "docs/behavior/modules/orders/README.md";

    static string ReplaceFirst(string raw, string oldValue, string newValue)
    {
        var index = raw.IndexOf(oldValue, StringComparison.Ordinal);
        return raw.Substring(0, index) + newValue + raw.Substring(index + oldValue.Length);
    }

    static string WithoutSection(string raw, string name)
    {
        return ReplaceFirst(raw, $"## {name}", "## Notes");
    }

    [Fact(DisplayName = "product brief that omits its summary")]
    public void ProductBriefThatOmitsItsSummary()
    {
        using var folder = ConsumerFixture.Create();
        ConsumerFixture.MutateBody(folder.Path, BriefPage, raw => WithoutSection(raw, "Summary"));
        AssertProblem(RunConsumer(folder.Path), "requires an H2 'Summary'");
    }

    [Fact(DisplayName = "requirement page that omits its example")]
    public void RequirementPageThatOmitsItsExample()
    {
        using var folder = ConsumerFixture.Create();
        ConsumerFixture.MutateBody(folder.Path, RequirementPage, raw => WithoutSection(raw, "Example"));
        AssertProblem(RunConsumer(folder.Path), "requires an H2 'Example'");
    }

    [Fact(DisplayName = "requirement page that omits its position")]
    public void RequirementPageThatOmitsItsPosition()
    {
        using var folder = ConsumerFixture.Create();
        ConsumerFixture.MutateBody(folder.Path, RequirementPage, raw => WithoutSection(raw, "Position"));
        AssertProblem(RunConsumer(folder.Path), "requires an H2 'Position'");
    }

    [Fact(DisplayName = "decision that omits its decision")]
    public void DecisionThatOmitsItsDecision()
    {
        using var folder = ConsumerFixture.Create();
        ConsumerFixture.MutateBody(folder.Path, DecisionPage, raw => WithoutSection(raw, "Decision"));
        AssertProblem(RunConsumer(folder.Path), "requires an H2 'Decision'");
    }

    [Fact(DisplayName = "decision that omits its consequences")]
    public void DecisionThatOmitsItsConsequences()
    {
        using var folder = ConsumerFixture.Create();
        ConsumerFixture.MutateBody(folder.Path, DecisionPage, raw => WithoutSection(raw, "Consequences"));
        AssertProblem(RunConsumer(folder.Path), "requires an H2 'Consequences'");
    }

    [Fact(DisplayName = "decision without an options section")]
    public void DecisionWithoutAnOptionsSection()
    {
        using var folder = ConsumerFixture.Create();
        AssertAbsent(RunConsumer(folder.Path), "requires an H2 'Options'");
    }

    [Fact(DisplayName = "actor that omits its summary")]
    public void ActorThatOmitsItsSummary()
    {
        using var folder = ConsumerFixture.Create();
        ConsumerFixture.MutateBody(folder.Path, ActorPage, raw => WithoutSection(raw, "Summary"));
        AssertProblem(RunConsumer(folder.Path), "requires an H2 'Summary'");
    }

    [Fact(DisplayName = "aggregate that omits its transitions table")]
    public void AggregateThatOmitsItsTransitionsTable()
    {
        using var folder = ConsumerFixture.Create();
        ConsumerFixture.MutateBody(folder.Path, AggregatePage, raw => WithoutSection(raw, "Transitions"));
        AssertProblem(RunConsumer(folder.Path), "requires an H2 'Transitions'");
    }

    [Fact(DisplayName = "aggregate that omits its data table")]
    public void AggregateThatOmitsItsDataTable()
    {
        using var folder = ConsumerFixture.Create();
        ConsumerFixture.MutateBody(folder.Path, AggregatePage, raw => WithoutSection(raw, "Data"));
        AssertProblem(RunConsumer(folder.Path), "requires an H2 'Data'");
    }

    [Fact(DisplayName = "use case that omits its goal")]
    public void UseCaseThatOmitsItsGoal()
    {
        using var folder = ConsumerFixture.Create();
        ConsumerFixture.MutateBody(folder.Path, UseCasePage, raw => WithoutSection(raw, "Goal"));
        AssertProblem(RunConsumer(folder.Path), "requires an H2 'Goal'");
    }

    [Fact(DisplayName = "command that omits what happens")]
    public void CommandThatOmitsWhatHappens()
    {
        using var folder = ConsumerFixture.Create();
        ConsumerFixture.MutateBody(folder.Path, UseCasePage, raw => WithoutSection(raw, "What Happens"));
        AssertProblem(RunConsumer(folder.Path), "requires an H2 'What Happens'");
    }

    [Fact(DisplayName = "query without what happens")]
    public void QueryWithoutWhatHappens()
    {
        using var folder = ConsumerFixture.Create();
        ConsumerFixture.MutateMeta(
            folder.Path,
            UseCasePage,
            meta =>
            {
                meta["kind"] = "query";
                meta["output"] = ConsumerFixture.Meta("""{"include":{"rows":{"fields":[{"name":"claims","meaning":"One row per order claim."}],"classification":"internal","source":["aggregate/orders.order-claim"],"freshness":"immediate"}}}""");
            });
        ConsumerFixture.MutateBody(folder.Path, UseCasePage, raw => WithoutSection(raw, "What Happens"));
        AssertClean(RunConsumer(folder.Path));
    }

    [Fact(DisplayName = "goal that omits why it matters")]
    public void GoalThatOmitsWhyItMatters()
    {
        using var folder = ConsumerFixture.Create();
        ConsumerFixture.WriteFile(
            folder.Path,
            "docs/product/goals/faster-delivery.md",
            ConsumerFixture.Page(
                ConsumerFixture.Meta("""{"type":"goal","id":"goal/faster-delivery","title":"Faster Delivery","owner":"fixture","status":"approved","statement":"Orders arrive in two days.","measure":"Median days to arrival.","target":"Two days.","by":"2026-12-31","approvedBy":"fixture","approvedOn":"2026-10-01","approvedHash":"00000000"}"""),
                "# Faster Delivery\n"));
        AssertProblem(RunConsumer(folder.Path), "requires an H2 'Why It Matters'");
    }

    [Fact(DisplayName = "problem that omits its evidence")]
    public void ProblemThatOmitsItsEvidence()
    {
        using var folder = ConsumerFixture.Create();
        ConsumerFixture.WriteFile(
            folder.Path,
            "docs/product/problems/slow-delivery.md",
            ConsumerFixture.Page(
                ConsumerFixture.Meta("""{"type":"problem","id":"problem/slow-delivery","title":"Slow Delivery","owner":"fixture","status":"approved","statement":"Orders take weeks to arrive.","approvedBy":"fixture","approvedOn":"2026-10-01","approvedHash":"00000000"}"""),
                "# Slow Delivery\n\n## Situation\n\nOrders take weeks to arrive.\n"));
        AssertProblem(RunConsumer(folder.Path), "requires an H2 'Evidence'");
    }

    [Fact(DisplayName = "feature that omits its offering")]
    public void FeatureThatOmitsItsOffering()
    {
        using var folder = ConsumerFixture.Create();
        ConsumerFixture.WriteFile(
            folder.Path,
            "docs/product/features/approval-reminders.md",
            ConsumerFixture.Page(
                ConsumerFixture.Meta("""{"type":"feature","id":"feature/approval-reminders","title":"Approval Reminders","owner":"fixture","status":"approved","state":"shipped","approvedBy":"fixture","approvedOn":"2026-10-01","approvedHash":"00000000"}"""),
                "# Approval Reminders\n"));
        AssertProblem(RunConsumer(folder.Path), "requires an H2 'Offering'");
    }

    [Fact(DisplayName = "constraint that omits what it requires")]
    public void ConstraintThatOmitsWhatItRequires()
    {
        using var folder = ConsumerFixture.Create();
        ConsumerFixture.WriteFile(
            folder.Path,
            "docs/product/constraints/tax-retention.md",
            ConsumerFixture.Page(
                ConsumerFixture.Meta("""{"type":"constraint","id":"constraint/tax-retention","title":"Tax Retention","owner":"fixture","status":"approved","source":"Tax office guidance.","category":"technical","applies":true,"appliesBecause":"The shop keeps receipts.","approvedBy":"fixture","approvedOn":"2026-10-01","approvedHash":"00000000"}"""),
                "# Tax Retention\n\n## Summary\n\nThe guidance states the retention duty.\n"));
        AssertProblem(RunConsumer(folder.Path), "requires an H2 'What It Requires'");
    }

    [Fact(DisplayName = "research that omits its answer")]
    public void ResearchThatOmitsItsAnswer()
    {
        using var folder = ConsumerFixture.Create();
        ConsumerFixture.WriteFile(
            folder.Path,
            "docs/research/delivery-benchmarks.md",
            ConsumerFixture.Page(
                ConsumerFixture.Meta("""{"type":"research","id":"research/delivery-benchmarks","title":"Delivery Benchmarks","owner":"fixture","status":"approved","question":"How fast do rivals deliver?","sources":[{"url":"https://example.com/benchmarks","read":"2026-01-01"}],"approvedBy":"fixture","approvedOn":"2026-10-01","approvedHash":"00000000"}"""),
                "# Delivery Benchmarks\n"));
        AssertProblem(RunConsumer(folder.Path), "requires an H2 'Answer'");
    }

    [Fact(DisplayName = "journey that omits its example")]
    public void JourneyThatOmitsItsExample()
    {
        using var folder = ConsumerFixture.Create();
        ConsumerFixture.WriteFile(
            folder.Path,
            "docs/product/journeys/submit-and-reimburse.md",
            ConsumerFixture.Page(
                ConsumerFixture.Meta("""{"type":"journey","id":"journey/submit-and-reimburse","title":"Submit and Reimburse","owner":"fixture","status":"approved","actor":"actor/customer","goal":"The customer is reimbursed.","finishedWhen":"The customer holds the reimbursement.","steps":[{"id":"s1","says":"The customer submits the order.","actor":"actor/customer"}],"fulfills":["requirement/pricing.flat-fee"],"approvedBy":"fixture","approvedOn":"2026-10-01","approvedHash":"00000000"}"""),
                "# Submit and Reimburse\n\n## Between the Steps\n\nThe shop hands the claim to payment.\n"));
        AssertProblem(RunConsumer(folder.Path), "requires an H2 'Example'");
    }

    [Fact(DisplayName = "journey that omits between the steps")]
    public void JourneyThatOmitsBetweenTheSteps()
    {
        using var folder = ConsumerFixture.Create();
        ConsumerFixture.WriteFile(
            folder.Path,
            "docs/product/journeys/submit-and-reimburse.md",
            ConsumerFixture.Page(
                ConsumerFixture.Meta("""{"type":"journey","id":"journey/submit-and-reimburse","title":"Submit and Reimburse","owner":"fixture","status":"approved","actor":"actor/customer","goal":"The customer is reimbursed.","finishedWhen":"The customer holds the reimbursement.","steps":[{"id":"s1","says":"The customer submits the order.","actor":"actor/customer"}],"fulfills":["requirement/pricing.flat-fee"],"approvedBy":"fixture","approvedOn":"2026-10-01","approvedHash":"00000000"}"""),
                "# Submit and Reimburse\n\n## Example\n\nAlex submits a claim on Monday and is reimbursed by Friday.\n"));
        AssertProblem(RunConsumer(folder.Path), "requires an H2 'Between the Steps'");
    }

    [Fact(DisplayName = "rule set that omits its summary")]
    public void RuleSetThatOmitsItsSummary()
    {
        using var folder = ConsumerFixture.Create();
        ConsumerFixture.WriteFile(
            folder.Path,
            "docs/behavior/rules/spending-standards.md",
            ConsumerFixture.Page(
                ConsumerFixture.Meta("""{"type":"rule-set","id":"spending-standards","title":"Spending Standards","owner":"fixture","status":"approved"}"""),
                "# Spending Standards\n"));
        AssertProblem(RunConsumer(folder.Path), "requires an H2 'Summary'");
    }

    [Fact(DisplayName = "external system that omits its summary")]
    public void ExternalSystemThatOmitsItsSummary()
    {
        using var folder = ConsumerFixture.Create();
        ConsumerFixture.WriteFile(
            folder.Path,
            "docs/behavior/systems/payout-bank.md",
            ConsumerFixture.Page(
                ConsumerFixture.Meta("""{"type":"external-system","id":"external-system/payout-bank","title":"Payout Bank","owner":"fixture","status":"reviewed","actor":"actor/customer","approvedBy":"fixture","approvedOn":"2026-10-01","approvedHash":"00000000"}"""),
                "# Payout Bank\n"));
        AssertProblem(RunConsumer(folder.Path), "requires an H2 'Summary'");
    }

    [Fact(DisplayName = "runbook that omits its escalation")]
    public void RunbookThatOmitsItsEscalation()
    {
        using var folder = ConsumerFixture.Create();
        ConsumerFixture.WriteFile(
            folder.Path,
            "docs/runbooks/clear-stuck-reimbursements.md",
            ConsumerFixture.Page(
                ConsumerFixture.Meta("""{"type":"runbook","id":"runbook/clear-stuck-reimbursements","title":"Clear Stuck Reimbursements","owner":"fixture","status":"reviewed","trigger":"A reimbursement sits past its date.","approvedBy":"fixture","approvedOn":"2026-10-01","approvedHash":"00000000"}"""),
                "# Clear Stuck Reimbursements\n\n## Impact\n\nStuck claims block payment.\n\n## Prerequisites\n\nThe reader holds the payments role.\n\n## Procedure\n\nClear the stuck claim and rerun payment.\n\n## Verification\n\nThe claim leaves the stuck list.\n\n## Rollback or Recovery\n\nRestore the claim from its snapshot.\n"));
        AssertProblem(RunConsumer(folder.Path), "requires an H2 'Escalation'");
    }

    [Fact(DisplayName = "deviation that omits its consequences")]
    public void DeviationThatOmitsItsConsequences()
    {
        using var folder = ConsumerFixture.Create();
        ConsumerFixture.WriteFile(
            folder.Path,
            "docs/deviations/export-review-bypass.md",
            ConsumerFixture.Page(
                ConsumerFixture.Meta("""{"type":"deviation","id":"deviation/export-review-bypass","title":"Export Review Bypass","owner":"fixture","status":"approved","provision":"litespec/core/scope#select-a-size-a-shape-and-stacks","reason":"The export runs once.","reviewBy":"2027-01-01","removeWhen":"The export is removed.","approvedBy":"fixture","approvedOn":"2026-10-01","approvedHash":"00000000"}"""),
                "# Export Review Bypass\n"));
        AssertProblem(RunConsumer(folder.Path), "requires an H2 'Consequences'");
    }

    [Fact(DisplayName = "known gap that omits its exit")]
    public void KnownGapThatOmitsItsExit()
    {
        using var folder = ConsumerFixture.Create();
        ConsumerFixture.WriteFile(
            folder.Path,
            "docs/known-gaps/export-unimplemented.md",
            ConsumerFixture.Page(
                ConsumerFixture.Meta("""{"type":"known-gap","id":"known-gap/export-unimplemented","title":"Export Unimplemented","owner":"fixture","status":"approved","check":"behavior-unrecorded","subject":["use-case/orders.cancel-order"],"endsBy":"2027-01-01","reason":"The export ships later.","approvedBy":"fixture","approvedOn":"2026-10-01","approvedHash":"00000000"}"""),
                "# Export Unimplemented\n"));
        AssertProblem(RunConsumer(folder.Path), "requires an H2 'Exit'");
    }

    [Fact(DisplayName = "example cast that omits its people")]
    public void ExampleCastThatOmitsItsPeople()
    {
        using var folder = ConsumerFixture.Create();
        ConsumerFixture.WriteFile(
            folder.Path,
            "docs/example-cast.md",
            ConsumerFixture.Page(
                ConsumerFixture.Meta("""{"type":"example-cast","id":"example-cast","title":"Example Cast","owner":"fixture","status":"approved"}"""),
                "# Example Cast\n\n## The Organization\n\nThe shop sells printed books.\n\n## The Occasion\n\nAlex orders on Monday morning.\n\n## The Amounts\n\nEvery order carries one fee.\n\n## Recurring Situations\n\nShipments leave each weekday.\n"));
        AssertProblem(RunConsumer(folder.Path), "requires an H2 'The People'");
    }

    [Fact(DisplayName = "tutorial that omits what the reader built")]
    public void TutorialThatOmitsWhatTheReaderBuilt()
    {
        using var folder = ConsumerFixture.Create();
        ConsumerFixture.MutateBody(folder.Path, TutorialPage, raw => WithoutSection(raw, "What You Built"));
        AssertProblem(RunConsumer(folder.Path), "requires an H2 'What You Built'");
    }

    [Fact(DisplayName = "how-to with no check")]
    public void HowToWithNoCheck()
    {
        using var folder = ConsumerFixture.Create();
        ConsumerFixture.MutateBody(folder.Path, HowToPage, raw => WithoutSection(raw, "Check"));
        AssertProblem(RunConsumer(folder.Path), "requires an H2 'Check'");
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

    [Fact(DisplayName = "module page keeps free body prose")]
    public void ModulePageKeepsFreeBodyProse()
    {
        using var folder = ConsumerFixture.Create();
        ConsumerFixture.MutateBody(folder.Path, ModulePage, raw => $"{raw}\nA note with no heading.\n");
        AssertClean(RunConsumer(folder.Path));
    }

    [Fact(DisplayName = "page title outside Title Case")]
    public void PageTitleOutsideTitleCase()
    {
        using var folder = ConsumerFixture.Create();
        ConsumerFixture.MutateBody(folder.Path, ActorPage, raw => ReplaceFirst(raw, "# Customer", "# customer"));
        AssertProblem(RunConsumer(folder.Path), "H1 'customer' must use Title Case");
    }

    [Fact(DisplayName = "section heading outside Title Case")]
    public void SectionHeadingOutsideTitleCase()
    {
        using var folder = ConsumerFixture.Create();
        ConsumerFixture.MutateBody(folder.Path, ModulePage, raw => $"{raw}\n## known limits\n\nThe module stops at the shop edge.\n");
        AssertProblem(RunConsumer(folder.Path), "H2 'known limits' must use Title Case");
    }

    [Fact(DisplayName = "small word capitalized in the middle")]
    public void SmallWordCapitalizedInTheMiddle()
    {
        using var folder = ConsumerFixture.Create();
        ConsumerFixture.MutateBody(folder.Path, ActorPage, raw => ReplaceFirst(raw, "# Customer", "# Customer Of The Shop"));
        AssertProblem(RunConsumer(folder.Path), "must use Title Case");
    }

    [Fact(DisplayName = "example longer than the bound")]
    public void ExampleLongerThanTheBound()
    {
        using var folder = ConsumerFixture.Create();
        var longExample = string.Join(" ", Enumerable.Repeat("word", 121));
        ConsumerFixture.MutateBody(
            folder.Path,
            RequirementPage,
            raw => ReplaceFirst(raw, "Alex orders two books on Monday and pays one fee at checkout.", longExample));
        AssertProblem(RunConsumer(folder.Path), "over the 120 word bound");
    }

    [Fact(DisplayName = "example bound below forty")]
    public void ExampleBoundBelowForty()
    {
        using var folder = ConsumerFixture.Create();
        ConsumerFixture.MutateProject(folder.Path, project => project["exampleWordLimit"] = 20);
        AssertProblem(RunConsumer(folder.Path), "exampleWordLimit '20' is below 40");
    }

    [Fact(DisplayName = "example bound the project raises")]
    public void ExampleBoundTheProjectRaises()
    {
        using var folder = ConsumerFixture.Create();
        ConsumerFixture.MutateProject(folder.Path, project => project["exampleWordLimit"] = 50);
        var longExample = string.Join(" ", Enumerable.Repeat("word", 60));
        ConsumerFixture.MutateBody(
            folder.Path,
            RequirementPage,
            raw => ReplaceFirst(raw, "Alex orders two books on Monday and pays one fee at checkout.", longExample));
        AssertProblem(RunConsumer(folder.Path), "over the 50 word bound");
    }
}
