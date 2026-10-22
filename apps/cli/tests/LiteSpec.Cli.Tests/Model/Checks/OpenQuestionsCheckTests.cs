using Record = LiteSpec.Model.Record;
using LiteSpec.Tests.Support;

namespace LiteSpec.Tests.Model.Checks;

/// <summary>Proves the open-questions check against hand-built models.</summary>
public sealed class OpenQuestionsCheckTests
{
    [Fact]
    public void Approved_With_Questions_Reports()
    {
        using var temp = Cli.Temp("checks");
        var model = TestModel.Model(
            TestModel.Config(temp.Path),
            TestModel.Record("actor", "actor/reader", Path.Combine(temp.Path, "reader.md"), WithQuestions("approved")));

        Assert.Contains("open-questions", TestModel.Codes(model));
    }

    [Fact]
    public void Draft_With_Questions_Passes()
    {
        using var temp = Cli.Temp("checks");
        var model = TestModel.Model(
            TestModel.Config(temp.Path),
            TestModel.Record("actor", "actor/reader", Path.Combine(temp.Path, "reader.md"), WithQuestions("draft")));

        Assert.DoesNotContain("open-questions", TestModel.Codes(model));
    }

    [Fact]
    public void Approved_Without_Questions_Passes()
    {
        using var temp = Cli.Temp("checks");
        var model = TestModel.Model(
            TestModel.Config(temp.Path),
            TestModel.Record("actor", "actor/reader", Path.Combine(temp.Path, "reader.md"), """{"kind": "person"}"""));

        Assert.DoesNotContain("open-questions", TestModel.Codes(model));
    }

    [Fact]
    public void Retired_With_Questions_Passes()
    {
        using var temp = Cli.Temp("checks");
        var model = TestModel.Model(
            TestModel.Config(temp.Path),
            TestModel.Record("actor", "actor/reader", Path.Combine(temp.Path, "reader.md"), WithQuestions("retired")));

        Assert.DoesNotContain("open-questions", TestModel.Codes(model));
    }

    static string WithQuestions(string status) =>
        "{\"kind\": \"person\", \"status\": \"" + status + "\", \"questions\": ["
        + "{\"question\": \"May a junior reader place holds without a guardian?\", \"decider\": \"lending-team\", \"decideBy\": \"2027-02-01\"}"
        + "]}";
}
