using Record = LiteSpec.Model.Record;
using LiteSpec.Model;
using LiteSpec.Tests.Support;

namespace LiteSpec.Tests.Model.Checks;

/// <summary>Proves the behavior-unrecorded check against hand-built models.</summary>
public sealed class BehaviorUnrecordedTests
{
    [Fact]
    public void Handler_Without_A_Record_Reports_Behavior_Unrecorded()
    {
        using var temp = Cli.Temp("checks");
        var model = TestModel.Model(TestModel.Config(temp.Path));
        model.Code.Handlers.Add(new HandlerInfo(
            "use-case/lending.ghost", "lending", "ghost", "Ghost", "command",
            Path.Combine(temp.Path, "GhostHandler.cs")));

        Assert.Contains("behavior-unrecorded", TestModel.Codes(model));
    }

    [Fact]
    public void Handler_With_A_Record_Passes()
    {
        using var temp = Cli.Temp("checks");
        var model = TestModel.Model(
            TestModel.Config(temp.Path),
            TestModel.Record("use-case", "use-case/lending.ghost", Path.Combine(temp.Path, "ghost.md"), """{"kind": "command"}"""));
        model.Code.Handlers.Add(new HandlerInfo(
            "use-case/lending.ghost", "lending", "ghost", "Ghost", "command",
            Path.Combine(temp.Path, "GhostHandler.cs")));

        Assert.DoesNotContain("behavior-unrecorded", TestModel.Codes(model));
    }

    [Fact]
    public void Endpoint_Without_A_Record_Reports_Behavior_Unrecorded()
    {
        using var temp = Cli.Temp("checks");
        var model = TestModel.Model(TestModel.Config(temp.Path));
        model.Code.Endpoints.Add(new EndpointOperation(
            "Ghost", "use-case/lending.ghost", "POST", "/api/lending/ghost",
            Path.Combine(temp.Path, "GhostEndpoint.cs")));

        Assert.Contains("behavior-unrecorded", TestModel.Codes(model));
    }

    [Fact]
    public void Reaction_Without_A_Tag_Reports_Behavior_Unrecorded()
    {
        using var temp = Cli.Temp("checks");
        var model = TestModel.Model(TestModel.Config(temp.Path));
        model.Code.Reactions.Add(new ReactionInfo(
            "GhostReaction", Path.Combine(temp.Path, "GhostReaction.cs"), 3, "reaction", null));

        Assert.Contains("behavior-unrecorded", TestModel.Codes(model));
    }

    [Fact]
    public void Reaction_With_A_Dangling_Tag_Reports_Behavior_Unrecorded()
    {
        using var temp = Cli.Temp("checks");
        var model = TestModel.Model(TestModel.Config(temp.Path));
        model.Code.Reactions.Add(new ReactionInfo(
            "GhostReaction", Path.Combine(temp.Path, "GhostReaction.cs"), 3, "reaction", "use-case/lending.nope"));

        Assert.Contains("behavior-unrecorded", TestModel.Codes(model));
    }

    [Fact]
    public void Job_Without_A_Tag_Names_The_Job()
    {
        using var temp = Cli.Temp("checks");
        var model = TestModel.Model(TestModel.Config(temp.Path));
        model.Code.Reactions.Add(new ReactionInfo(
            "NightlyJob", Path.Combine(temp.Path, "NightlyJob.cs"), 5, "job", null));

        var message = Checker.Check(model).Findings.Single(finding => finding.Code == "behavior-unrecorded").Message;
        Assert.Contains("Job 'NightlyJob'", message);
    }

    [Fact]
    public void Reaction_With_A_Matching_Tag_Passes()
    {
        using var temp = Cli.Temp("checks");
        var model = TestModel.Model(
            TestModel.Config(temp.Path),
            TestModel.Record("use-case", "use-case/lending.ghost", Path.Combine(temp.Path, "ghost.md"), """{"kind": "command"}"""));
        model.Code.Reactions.Add(new ReactionInfo(
            "GhostReaction", Path.Combine(temp.Path, "GhostReaction.cs"), 3, "reaction", "use-case/lending.ghost"));

        Assert.DoesNotContain("behavior-unrecorded", TestModel.Codes(model));
    }

    [Fact]
    public void Event_Without_A_Record_Reports_Behavior_Unrecorded()
    {
        using var temp = Cli.Temp("checks");
        var model = TestModel.Model(TestModel.Config(temp.Path));
        model.Code.Events.Add(new DomainEventInfo(
            "GhostEvent", Path.Combine(temp.Path, "GhostEvent.cs"), 3, null));

        Assert.Contains("behavior-unrecorded", TestModel.Codes(model));
    }

    [Fact]
    public void Event_With_A_Record_Passes()
    {
        using var temp = Cli.Temp("checks");
        var model = TestModel.Model(
            TestModel.Config(temp.Path),
            TestModel.Record("event", "event/ghost.raised", Path.Combine(temp.Path, "ghost.md"), """{"meaning": "A ghost was raised.", "carries": []}"""));
        model.Code.Events.Add(new DomainEventInfo(
            "GhostRaisedEvent", Path.Combine(temp.Path, "GhostRaisedEvent.cs"), 3, "event/ghost.raised"));

        Assert.DoesNotContain("behavior-unrecorded", TestModel.Codes(model));
    }

    [Fact]
    public void Surplus_Literal_Reports_Behavior_Unrecorded()
    {
        using var temp = Cli.Temp("checks");
        var model = TestModel.Model(TestModel.Config(temp.Path));
        model.Code.Literals.Add(new CodeLiteral(
            "lending.ghost-refusal", Path.Combine(temp.Path, "GhostHandler.cs"), 8, "GhostHandler"));

        Assert.Contains("behavior-unrecorded", TestModel.Codes(model));
    }

    [Fact]
    public void Rule_Refusal_Code_Declares_A_Guard()
    {
        using var temp = Cli.Temp("checks");
        var model = TestModel.Model(
            TestModel.Config(temp.Path),
            TestModel.Record(
                "rule",
                "rule/loan.due-date-required",
                Path.Combine(temp.Path, "loan.md"),
                """{"kind": "invariant", "statement": "A loan has a due date.", "refusal": "lending.due-date-required"}"""));
        model.Code.Literals.Add(new CodeLiteral(
            "lending.due-date-required", Path.Combine(temp.Path, "Loan.cs"), 8, "Loan"));

        Assert.DoesNotContain("behavior-unrecorded", TestModel.Codes(model));
    }

    [Fact]
    public void Declared_Literal_Passes()
    {
        using var temp = Cli.Temp("checks");
        var model = TestModel.Model(
            TestModel.Config(temp.Path),
            TestModel.Record(
                "result",
                "result/ghost.refused",
                Path.Combine(temp.Path, "ghost.md"),
                """{"outcome": "refusal", "code": "lending.ghost-refusal", "meaning": "The ghost refused."}"""));
        model.Code.Literals.Add(new CodeLiteral(
            "lending.ghost-refusal", Path.Combine(temp.Path, "GhostHandler.cs"), 8, "GhostHandler"));

        Assert.DoesNotContain("behavior-unrecorded", TestModel.Codes(model));
    }

    [Fact]
    public void Screen_Call_Without_An_Endpoint_Reports_Behavior_Unrecorded()
    {
        using var temp = Cli.Temp("checks");
        var model = TestModel.Model(TestModel.Config(temp.Path));
        model.Screens.Add(new ScreenInfo(
            "catalog",
            "/ghost",
            "apps/catalog/src/routes/ghost/+page.svelte",
            [new GeneratedOperation("ghostOp", "POST", "/api/lending/ghost-op")],
            []));

        Assert.Contains("behavior-unrecorded", TestModel.Codes(model));
    }

    [Fact]
    public void Screen_Call_Matching_A_Route_Passes()
    {
        using var temp = Cli.Temp("checks");
        var model = TestModel.Model(TestModel.Config(temp.Path));
        model.Records.Add(TestModel.Record("use-case", "use-case/lending.ghost", Path.Combine(temp.Path, "ghost.md"), "{}"));
        model.Code.Endpoints.Add(new EndpointOperation(
            "", "use-case/lending.ghost", "POST", "/api/lending/ghost-op",
            Path.Combine(temp.Path, "GhostEndpoint.cs")));
        model.Screens.Add(new ScreenInfo(
            "catalog",
            "/ghost",
            "apps/catalog/src/routes/ghost/+page.svelte",
            [new GeneratedOperation("ghostOp", "POST", "/api/lending/ghost-op")],
            []));

        Assert.DoesNotContain("behavior-unrecorded", TestModel.Codes(model));
    }

    [Fact]
    public void Screen_Call_Matching_An_Operation_Name_Passes()
    {
        using var temp = Cli.Temp("checks");
        var model = TestModel.Model(TestModel.Config(temp.Path));
        model.Records.Add(TestModel.Record("use-case", "use-case/lending.ghost", Path.Combine(temp.Path, "ghost.md"), "{}"));
        model.Code.Endpoints.Add(new EndpointOperation(
            "GhostOp", "use-case/lending.ghost", "", "",
            Path.Combine(temp.Path, "GhostEndpoint.cs")));
        model.Screens.Add(new ScreenInfo(
            "catalog",
            "/ghost",
            "apps/catalog/src/routes/ghost/+page.svelte",
            [new GeneratedOperation("ghostOp", "POST", "/elsewhere")],
            []));

        Assert.DoesNotContain("behavior-unrecorded", TestModel.Codes(model));
    }

    [Fact]
    public void Screen_Calls_Are_Skipped_For_Client_Only_Shape()
    {
        using var temp = Cli.Temp("checks");
        File.WriteAllText(Path.Combine(temp.Path, "litespec.project.json"), """{"shape": "client-only"}""");
        var model = TestModel.Model(TestModel.Config(temp.Path));
        model.Screens.Add(new ScreenInfo(
            "catalog",
            "/ghost",
            "apps/catalog/src/routes/ghost/+page.svelte",
            [new GeneratedOperation("ghostOp", "POST", "/api/lending/ghost-op")],
            []));

        Assert.DoesNotContain("behavior-unrecorded", TestModel.Codes(model));
    }
}
