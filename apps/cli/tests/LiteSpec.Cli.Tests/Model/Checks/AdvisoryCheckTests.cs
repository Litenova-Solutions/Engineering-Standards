using LiteSpec.Model;
using LiteSpec.Tests.Support;

namespace LiteSpec.Tests.Model.Checks;

/// <summary>Proves the advisory checks and the open-questions shape rule against hand-built models.</summary>
public sealed class AdvisoryCheckTests
{
    [Fact]
    public void Significant_Use_Case_Without_Goal_Reports()
    {
        using var temp = Cli.Temp("checks");
        var model = TestModel.Model(
            TestModel.Config(temp.Path),
            TestModel.Record("use-case", "use-case/lending.borrow-copy", Path.Combine(temp.Path, "borrow.md"), """{"status": "reviewed", "kind": "command", "changes": ["aggregate/lending.loan", "aggregate/lending.copy"]}"""));

        Assert.Contains("prose-missing", TestModel.Codes(model));
    }

    [Fact]
    public void Trivial_Use_Case_Passes()
    {
        using var temp = Cli.Temp("checks");
        var model = TestModel.Model(
            TestModel.Config(temp.Path),
            TestModel.Record("use-case", "use-case/lending.borrow-copy", Path.Combine(temp.Path, "borrow.md"), """{"status": "reviewed", "kind": "command"}"""));

        Assert.DoesNotContain("prose-missing", TestModel.Codes(model));
    }

    [Fact]
    public void Atomic_With_Two_Because_Rules_Reports()
    {
        using var temp = Cli.Temp("checks");
        var model = TestModel.Model(
            TestModel.Config(temp.Path),
            TestModel.Record("use-case", "use-case/lending.borrow-copy", Path.Combine(temp.Path, "borrow.md"), """{"status": "reviewed", "kind": "command", "consistency": {"mode": "atomic", "because": ["rule/loan.one-open-loan", "rule/copy.one-home-shelf"]}}"""));

        Assert.Contains("many-aggregates", TestModel.Codes(model));
    }

    [Fact]
    public void Atomic_With_One_Because_Rule_Passes()
    {
        using var temp = Cli.Temp("checks");
        var model = TestModel.Model(
            TestModel.Config(temp.Path),
            TestModel.Record("use-case", "use-case/lending.borrow-copy", Path.Combine(temp.Path, "borrow.md"), """{"status": "reviewed", "kind": "command", "consistency": {"mode": "atomic", "because": ["rule/loan.one-open-loan"]}}"""));

        Assert.DoesNotContain("many-aggregates", TestModel.Codes(model));
    }

    [Fact]
    public void Tier3_Question_Without_Recommendation_Past_DecideBy_Reports()
    {
        using var temp = Cli.Temp("checks");
        var model = TestModel.Model(
            TestModel.Config(temp.Path),
            TestModel.Record("actor", "actor/reader", Path.Combine(temp.Path, "reader.md"), """{"status": "approved", "kind": "person", "questions": [{"question": "May a junior reader place holds?", "decider": "lending-team", "decideBy": "2020-01-01"}]}"""));

        Assert.Contains("question-aged", TestModel.Codes(model));
    }

    [Fact]
    public void Tier3_Question_With_Recommendation_Passes()
    {
        using var temp = Cli.Temp("checks");
        var model = TestModel.Model(
            TestModel.Config(temp.Path),
            TestModel.Record("actor", "actor/reader", Path.Combine(temp.Path, "reader.md"), """{"status": "approved", "kind": "person", "questions": [{"question": "May a junior reader place holds?", "decider": "lending-team", "decideBy": "2020-01-01", "recommended": "Yes, with a guardian."}]}"""));

        Assert.DoesNotContain("question-aged", TestModel.Codes(model));
    }

    [Fact]
    public void Tier1_Question_Blocks_Instead_Of_Aging()
    {
        using var temp = Cli.Temp("checks");
        var model = TestModel.Model(
            TestModel.Config(temp.Path),
            TestModel.Record("actor", "actor/reader", Path.Combine(temp.Path, "reader.md"), """{"status": "approved", "kind": "person", "questions": [{"question": "May a junior reader place holds?", "decider": "lending-team", "decideBy": "2020-01-01", "tier": 1}]}"""));

        Assert.DoesNotContain("question-aged", TestModel.Codes(model));
    }

    [Fact]
    public void Approved_With_Open_Questions_Reports_Record_Shape()
    {
        using var temp = Cli.Temp("checks");
        var model = TestModel.Model(
            TestModel.Config(temp.Path),
            TestModel.Record("actor", "actor/reader", Path.Combine(temp.Path, "reader.md"), """{"status": "approved", "kind": "person", "questions": [{"question": "May a junior reader place holds?", "decider": "lending-team", "decideBy": "2035-02-01"}]}"""));

        Assert.Contains(
            Checker.Check(model).Findings,
            finding => finding.Code == "record-shape" && finding.Message.Contains("open questions", StringComparison.Ordinal));
    }

    [Fact]
    public void Approved_With_Auto_Approved_Questions_Passes()
    {
        using var temp = Cli.Temp("checks");
        var model = TestModel.Model(
            TestModel.Config(temp.Path),
            TestModel.Record("actor", "actor/reader", Path.Combine(temp.Path, "reader.md"), """{"status": "approved", "kind": "person", "questions": [{"question": "May a junior reader place holds?", "decider": "lending-team", "decideBy": "2020-01-01", "recommended": "Yes, with a guardian."}]}"""));

        Assert.DoesNotContain(
            Checker.Check(model).Findings,
            finding => finding.Code == "record-shape" && finding.Message.Contains("open questions", StringComparison.Ordinal));
    }
}
