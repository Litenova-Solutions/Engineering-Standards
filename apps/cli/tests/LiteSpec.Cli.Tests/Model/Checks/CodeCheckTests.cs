using LiteSpec.Model;
using LiteSpec.Tests.Support;

namespace LiteSpec.Tests.Model.Checks;

/// <summary>Proves the write-undeclared, result-undeclared and effect-undeclared checks against hand-built models.</summary>
public sealed class CodeCheckTests
{
    [Fact]
    public void Handler_Taking_An_Undeclared_Repository_Reports()
    {
        using var temp = Cli.Temp("checks");
        var file = Path.Combine(temp.Path, "BorrowCopyCommandHandler.cs");
        var model = TestModel.Model(
            TestModel.Config(temp.Path),
            TestModel.Record("use-case", "use-case/lending.borrow-copy", Path.Combine(temp.Path, "borrow.md"), """{"status": "reviewed", "kind": "command"}"""));
        model.Code.Handlers.Add(new HandlerInfo(
            "use-case/lending.borrow-copy", "lending", "borrow-copy", "BorrowCopy", "command", file,
            Repositories: [new CodeRepository("IHoldRepository", file, 5)]));

        Assert.Contains("write-undeclared", TestModel.Codes(model));
    }

    [Fact]
    public void Handler_Taking_A_Declared_Repository_Passes()
    {
        using var temp = Cli.Temp("checks");
        var file = Path.Combine(temp.Path, "BorrowCopyCommandHandler.cs");
        var model = TestModel.Model(
            TestModel.Config(temp.Path),
            TestModel.Record("use-case", "use-case/lending.borrow-copy", Path.Combine(temp.Path, "borrow.md"), """{"status": "reviewed", "kind": "command", "reads": ["aggregate/lending.hold"]}"""),
            TestModel.Record("aggregate", "aggregate/lending.hold", Path.Combine(temp.Path, "hold.md"), """{"status": "reviewed", "states": [{"name": "Waiting", "meaning": "The hold waits."}]}"""));
        model.Code.Handlers.Add(new HandlerInfo(
            "use-case/lending.borrow-copy", "lending", "borrow-copy", "BorrowCopy", "command", file,
            Repositories: [new CodeRepository("IHoldRepository", file, 5)]));

        Assert.DoesNotContain("write-undeclared", TestModel.Codes(model));
    }

    [Fact]
    public void Handler_Producing_An_Undeclared_Literal_Reports()
    {
        using var temp = Cli.Temp("checks");
        var file = Path.Combine(temp.Path, "BorrowCopyCommandHandler.cs");
        var model = TestModel.Model(
            TestModel.Config(temp.Path),
            TestModel.Record("use-case", "use-case/lending.borrow-copy", Path.Combine(temp.Path, "borrow.md"), """{"status": "reviewed", "kind": "command"}"""));
        model.Code.Handlers.Add(new HandlerInfo(
            "use-case/lending.borrow-copy", "lending", "borrow-copy", "BorrowCopy", "command", file,
            Refusals: [new CodeRefusal("lending.ghost-refusal", file, 9)]));

        Assert.Contains("result-undeclared", TestModel.Codes(model));
    }

    [Fact]
    public void Handler_Throwing_An_Undeclared_Type_Reports()
    {
        using var temp = Cli.Temp("checks");
        var handlerFile = Path.Combine(temp.Path, "BorrowCopyCommandHandler.cs");
        var model = TestModel.Model(
            TestModel.Config(temp.Path),
            TestModel.Record("use-case", "use-case/lending.borrow-copy", Path.Combine(temp.Path, "borrow.md"), """{"status": "reviewed", "kind": "command"}"""));
        model.Code.Literals.Add(new CodeLiteral(
            "lending.ghost-refusal", Path.Combine(temp.Path, "LoanGhostRefusalException.cs"), 8, "LoanGhostRefusalException"));
        model.Code.Handlers.Add(new HandlerInfo(
            "use-case/lending.borrow-copy", "lending", "borrow-copy", "BorrowCopy", "command", handlerFile,
            Thrown: [new CodeThrown("LoanGhostRefusalException", handlerFile, 11)]));

        Assert.Contains("result-undeclared", TestModel.Codes(model));
    }

    [Fact]
    public void Handler_Producing_A_Declared_Code_Passes()
    {
        using var temp = Cli.Temp("checks");
        var handlerFile = Path.Combine(temp.Path, "BorrowCopyCommandHandler.cs");
        var model = TestModel.Model(
            TestModel.Config(temp.Path),
            TestModel.Record("use-case", "use-case/lending.borrow-copy", Path.Combine(temp.Path, "borrow.md"), """{"status": "reviewed", "kind": "command"}"""),
            TestModel.Record(
                "result",
                "result/borrow-copy.copy-unavailable",
                Path.Combine(temp.Path, "borrow.md"),
                """{"status": "reviewed", "outcome": "refusal", "code": "lending.copy-not-available", "meaning": "The copy is unavailable."}"""));
        model.Code.Literals.Add(new CodeLiteral(
            "lending.copy-not-available", Path.Combine(temp.Path, "CopyNotAvailableException.cs"), 8, "CopyNotAvailableException"));
        model.Code.Handlers.Add(new HandlerInfo(
            "use-case/lending.borrow-copy", "lending", "borrow-copy", "BorrowCopy", "command", handlerFile,
            Thrown: [new CodeThrown("CopyNotAvailableException", handlerFile, 11)]));

        Assert.DoesNotContain("result-undeclared", TestModel.Codes(model));
    }

    [Fact]
    public void Permission_Grant_Allows_The_Forbidden_Code()
    {
        using var temp = Cli.Temp("checks");
        var file = Path.Combine(temp.Path, "BorrowCopyCommandHandler.cs");
        var model = TestModel.Model(
            TestModel.Config(temp.Path),
            TestModel.Record("use-case", "use-case/lending.borrow-copy", Path.Combine(temp.Path, "borrow.md"), """{"status": "reviewed", "kind": "command", "access": {"auth": ["session"], "grant": "permission/borrow-copy", "tenant": "own"}}"""));
        model.Code.Handlers.Add(new HandlerInfo(
            "use-case/lending.borrow-copy", "lending", "borrow-copy", "BorrowCopy", "command", file,
            Refusals: [new CodeRefusal("authorization.forbidden", file, 9)]));

        Assert.DoesNotContain("result-undeclared", TestModel.Codes(model));
    }

    [Fact]
    public void Custom_Refusals_Codes_Are_Allowed()
    {
        using var temp = Cli.Temp("checks");
        File.WriteAllText(
            Path.Combine(temp.Path, "litespec.project.json"),
            """{"refusals": {"forbidden": "library.forbidden", "invalidInput": "library.invalid"}}""");
        var file = Path.Combine(temp.Path, "BorrowCopyCommandHandler.cs");
        var model = TestModel.Model(
            TestModel.Config(temp.Path),
            TestModel.Record("use-case", "use-case/lending.borrow-copy", Path.Combine(temp.Path, "borrow.md"), """{"status": "reviewed", "kind": "command", "access": {"auth": ["session"], "grant": "permission/borrow-copy", "tenant": "own"}}"""));
        model.Code.Handlers.Add(new HandlerInfo(
            "use-case/lending.borrow-copy", "lending", "borrow-copy", "BorrowCopy", "command", file,
            Refusals: [new CodeRefusal("library.forbidden", file, 9)]));

        Assert.DoesNotContain("result-undeclared", TestModel.Codes(model));
    }

    [Fact]
    public void Handler_Dispatching_An_Undeclared_Command_Reports()
    {
        using var temp = Cli.Temp("checks");
        var file = Path.Combine(temp.Path, "BorrowCopyCommandHandler.cs");
        var model = TestModel.Model(
            TestModel.Config(temp.Path),
            TestModel.Record("use-case", "use-case/lending.borrow-copy", Path.Combine(temp.Path, "borrow.md"), """{"status": "reviewed", "kind": "command"}"""));
        model.Code.Handlers.Add(new HandlerInfo(
            "use-case/lending.borrow-copy", "lending", "borrow-copy", "BorrowCopy", "command", file,
            Dispatches: [new CodeDispatch("issues", "PurgeLoansCommand", "", file, 13)]));

        Assert.Contains("effect-undeclared", TestModel.Codes(model));
    }

    [Fact]
    public void Handler_Dispatching_A_Declared_Command_Passes()
    {
        using var temp = Cli.Temp("checks");
        var file = Path.Combine(temp.Path, "BorrowCopyCommandHandler.cs");
        var model = TestModel.Model(
            TestModel.Config(temp.Path),
            TestModel.Record("use-case", "use-case/lending.borrow-copy", Path.Combine(temp.Path, "borrow.md"), """{"status": "reviewed", "kind": "command", "effects": [{"issues": "use-case/lending.purge-loans", "timing": "async"}]}"""),
            TestModel.Record("use-case", "use-case/lending.purge-loans", Path.Combine(temp.Path, "purge.md"), """{"status": "reviewed", "kind": "command"}"""));
        model.Code.Handlers.Add(new HandlerInfo(
            "use-case/lending.borrow-copy", "lending", "borrow-copy", "BorrowCopy", "command", file,
            Dispatches: [new CodeDispatch("issues", "PurgeLoansCommand", "", file, 13)]));

        Assert.DoesNotContain("effect-undeclared", TestModel.Codes(model));
    }

    [Fact]
    public void Reaction_Dispatching_Against_Issues_Passes()
    {
        using var temp = Cli.Temp("checks");
        var file = Path.Combine(temp.Path, "LoanBorrowedReaction.cs");
        var model = TestModel.Model(
            TestModel.Config(temp.Path),
            TestModel.Record("use-case", "use-case/lending.borrow-copy", Path.Combine(temp.Path, "borrow.md"), """{"status": "reviewed", "kind": "command"}"""),
            TestModel.Record("reaction", "reaction/lending.notify-on-borrow", Path.Combine(temp.Path, "notify.md"), """{"status": "reviewed", "on": ["event/loan.loan-borrowed"], "issues": ["use-case/lending.borrow-copy"]}"""));
        model.Code.Reactions.Add(new ReactionInfo(
            "LoanBorrowedReaction", file, 3, "reaction", null, "reaction/lending.notify-on-borrow",
            Dispatches: [new CodeDispatch("issues", "BorrowCopyCommand", "", file, 9)]));

        Assert.DoesNotContain("effect-undeclared", TestModel.Codes(model));
    }

    [Fact]
    public void Handler_Dispatching_Through_A_Helper_Names_The_Helper()
    {
        using var temp = Cli.Temp("checks");
        var file = Path.Combine(temp.Path, "BorrowCopyCommandHandler.cs");
        var model = TestModel.Model(
            TestModel.Config(temp.Path),
            TestModel.Record("use-case", "use-case/lending.borrow-copy", Path.Combine(temp.Path, "borrow.md"), """{"status": "reviewed", "kind": "command"}"""));
        model.Code.Handlers.Add(new HandlerInfo(
            "use-case/lending.borrow-copy", "lending", "borrow-copy", "BorrowCopy", "command", file,
            Dispatches: [new CodeDispatch("issues", "PurgeLoansCommand", "", file, 13, "LoanFanout.RetryAsync")]));

        var finding = Assert.Single(
            Checker.Check(model).Findings,
            found => found.Code == "effect-undeclared");

        Assert.Contains("via 'LoanFanout.RetryAsync'", finding.Message);
    }

    [Fact]
    public void Handler_Dispatching_Directly_Names_No_Helper()
    {
        using var temp = Cli.Temp("checks");
        var file = Path.Combine(temp.Path, "BorrowCopyCommandHandler.cs");
        var model = TestModel.Model(
            TestModel.Config(temp.Path),
            TestModel.Record("use-case", "use-case/lending.borrow-copy", Path.Combine(temp.Path, "borrow.md"), """{"status": "reviewed", "kind": "command"}"""));
        model.Code.Handlers.Add(new HandlerInfo(
            "use-case/lending.borrow-copy", "lending", "borrow-copy", "BorrowCopy", "command", file,
            Dispatches: [new CodeDispatch("issues", "PurgeLoansCommand", "", file, 13)]));

        var finding = Assert.Single(
            Checker.Check(model).Findings,
            found => found.Code == "effect-undeclared");

        Assert.DoesNotContain(" via '", finding.Message);
    }
}
