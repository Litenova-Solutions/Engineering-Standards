using Record = LiteSpec.Model.Record;
using LiteSpec.Model;
using LiteSpec.Tests.Support;

namespace LiteSpec.Tests.Model.Checks;

/// <summary>Proves the requirement-unmeasured check against hand-built models.</summary>
public sealed class MeasuredCheckTests
{
    [Fact]
    public void Measured_Without_A_Check_Reports()
    {
        using var temp = Cli.Temp("checks");
        var model = TestModel.Model(
            TestModel.Config(temp.Path),
            TestModel.Record(
                "requirement",
                "requirement/borrowing.list-loans-latency",
                Path.Combine(temp.Path, "borrowing.md"),
                """{"kind": "quality", "statement": "Listing loans answers within 300 milliseconds at p95.", "measure": "p95 latency of listing loans", "by": "2027-01-01"}"""));

        Assert.Contains("requirement-unmeasured", TestModel.Codes(model));
    }

    [Fact]
    public void Unmeasured_Requirement_Passes()
    {
        using var temp = Cli.Temp("checks");
        var model = TestModel.Model(
            TestModel.Config(temp.Path),
            TestModel.Record(
                "requirement",
                "requirement/borrowing.max-active-loans",
                Path.Combine(temp.Path, "borrowing.md"),
                """{"kind": "functional", "statement": "A reader holds at most five active loans."}"""));

        Assert.DoesNotContain("requirement-unmeasured", TestModel.Codes(model));
    }

    [Fact]
    public void Measured_With_A_Check_But_No_Run_Reports()
    {
        using var temp = Cli.Temp("checks");
        var model = TestModel.Model(TestModel.Config(temp.Path), Measured(temp.Path));

        Assert.Contains("requirement-unmeasured", TestModel.Codes(model));
    }

    [Fact]
    public void Failing_Run_Reports()
    {
        using var temp = Cli.Temp("checks");
        var model = TestModel.Model(TestModel.Config(temp.Path), Measured(temp.Path));
        model.Measures.Add(new MeasureResult("k6", "p95<200", false, "240", "TestResults/k6.json"));

        Assert.Contains("requirement-unmeasured", TestModel.Codes(model));
    }

    [Fact]
    public void Passing_Run_Passes()
    {
        using var temp = Cli.Temp("checks");
        var model = TestModel.Model(TestModel.Config(temp.Path), Measured(temp.Path, "p95<200"));
        model.Measures.Add(new MeasureResult("k6", "p95<200", true, "180", "TestResults/k6.json"));

        Assert.DoesNotContain("requirement-unmeasured", TestModel.Codes(model));
    }

    [Fact]
    public void Passing_Run_Matches_Tool_And_Check_Form()
    {
        using var temp = Cli.Temp("checks");
        var model = TestModel.Model(TestModel.Config(temp.Path), Measured(temp.Path, "k6 p95<200"));
        model.Measures.Add(new MeasureResult("k6", "p95<200", true, "180", "TestResults/k6.json"));

        Assert.DoesNotContain("requirement-unmeasured", TestModel.Codes(model));
    }

    static Record Measured(string root, string check = "p95<200") =>
        TestModel.Record(
            "requirement",
            "requirement/borrowing.list-loans-latency",
            Path.Combine(root, "borrowing.md"),
            "{\"kind\": \"quality\", \"statement\": \"Listing loans answers within 300 milliseconds at p95.\", \"measure\": \"p95 latency of listing loans\", \"by\": \"2027-01-01\", \"check\": \"" + check + "\"}");
}
