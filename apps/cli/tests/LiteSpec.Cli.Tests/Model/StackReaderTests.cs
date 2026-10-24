using System.Text.Json;
using System.Text.Json.Nodes;
using LiteSpec.Tests.Support;

namespace LiteSpec.Tests.Model;

/// <summary>Proves the stack readers keep the build identical and read JUnit results.</summary>
public sealed class StackReaderTests
{
    /// <summary><c>model build</c> on the fixture prints the counts its contents hold.</summary>
    [Theory]
    [InlineData("small", 69, 7, 0, 0)]
    [InlineData("large", 89, 7, 1, 9)]
    public void Build_Prints_Fixture_Counts(string fixture, int records, int handlers, int screens, int scenarios)
    {
        using var temp = ModelFixture.Prepare(fixture);
        var result = Cli.Run("model", "build", "--root", temp.Path);
        Assert.Equal(0, result.Status);
        Assert.Contains(
            $"{records} records, {handlers} handlers, {screens} screens, {scenarios} scenarios.",
            result.Stdout);
    }

    /// <summary>A project naming neither dotnet nor blazor reads no .NET backend or scenarios.</summary>
    [Fact]
    public void Build_Without_Dotnet_Or_Blazor_Reads_No_Backend()
    {
        using var temp = ModelFixture.Prepare("small");

        var projectFile = Path.Combine(temp.Path, "litespec.project.json");
        var project = JsonNode.Parse(File.ReadAllText(projectFile))!.AsObject();
        project["stacks"] = new JsonArray(JsonValue.Create("react"));
        File.WriteAllText(projectFile, project.ToJsonString());

        var result = Cli.Run("model", "build", "--root", temp.Path);
        Assert.Equal(0, result.Status);
        Assert.Contains("0 handlers", result.Stdout);
        Assert.Contains("0 scenarios", result.Stdout);
    }

    /// <summary>Clean fixtures write no test run: neither holds a result file.</summary>
    [Theory]
    [InlineData("small")]
    [InlineData("large")]
    public void Build_Writes_Null_Test_Run_Without_Result_Files(string fixture)
    {
        using var temp = ModelFixture.Prepare(fixture);
        var output = Path.Combine(temp.Path, ".model", "model.json");
        var result = Cli.Run("model", "build", "--root", temp.Path, "--out", output);
        Assert.Equal(0, result.Status);

        using var document = JsonDocument.Parse(File.ReadAllText(output));

        Assert.Equal(JsonValueKind.Null, document.RootElement.GetProperty("testRun").ValueKind);
    }

    /// <summary>A JUnit file verifies the passing scenario's use case and leaves the failing one unverified.</summary>
    [Fact]
    public void JUnit_Results_Verify_The_Passing_Scenario_Only()
    {
        using var temp = ModelFixture.Prepare("small");

        File.WriteAllText(
            Path.Combine(temp.Path, "docs", "behavior", "modules", "lending", "loans", "borrow-copy-junit-scenario.md"),
            BorrowScenarioPage);
        File.WriteAllText(
            Path.Combine(temp.Path, "docs", "behavior", "modules", "lending", "loans", "return-copy-junit-scenario.md"),
            ReturnScenarioPage);

        var scenariosFolder = Path.Combine(
            temp.Path, "apps", "api", "tests", "Library.Acceptance.Tests", "JUnit");
        Directory.CreateDirectory(scenariosFolder);
        File.WriteAllText(Path.Combine(scenariosFolder, "JUnitScenarios.cs"), ScenariosFile);

        var resultsFolder = Path.Combine(temp.Path, "TestResults");
        Directory.CreateDirectory(resultsFolder);
        File.Copy(Cli.Fixture("Model/junit/results.xml"), Path.Combine(resultsFolder, "results.xml"));

        var output = Path.Combine(temp.Path, ".model", "model.json");
        var built = Cli.Run("model", "build", "--root", temp.Path, "--out", output);
        Assert.Equal(0, built.Status);

        using var document = JsonDocument.Parse(File.ReadAllText(output));
        var root = document.RootElement;
        var run = root.GetProperty("testRun");

        Assert.Equal(2, run.GetProperty("total").GetInt32());
        Assert.Equal(1, run.GetProperty("passed").GetInt32());
        Assert.Equal(1, run.GetProperty("failed").GetInt32());

        var status = root.GetProperty("status");

        Assert.True(status.GetProperty("use-case/lending.borrow-copy").GetProperty("verified").GetBoolean());
        Assert.False(status.GetProperty("use-case/lending.return-copy").GetProperty("verified").GetBoolean());
    }

    /// <summary>A TRX file verifies the passing scenario's use case and leaves the failing one unverified.</summary>
    [Fact]
    public void Trx_Results_Verify_The_Passing_Scenario_Only()
    {
        using var temp = ModelFixture.Prepare("small");

        File.WriteAllText(
            Path.Combine(temp.Path, "docs", "behavior", "modules", "lending", "loans", "borrow-copy-trx-scenario.md"),
            BorrowScenarioPage);
        File.WriteAllText(
            Path.Combine(temp.Path, "docs", "behavior", "modules", "lending", "loans", "return-copy-trx-scenario.md"),
            ReturnScenarioPage);

        var scenariosFolder = Path.Combine(
            temp.Path, "apps", "api", "tests", "Library.Acceptance.Tests", "Trx");
        Directory.CreateDirectory(scenariosFolder);
        File.WriteAllText(Path.Combine(scenariosFolder, "TrxScenarios.cs"), TrxScenariosFile);

        var resultsFolder = Path.Combine(temp.Path, "TestResults");
        Directory.CreateDirectory(resultsFolder);
        File.Copy(Cli.Fixture("Model/trx/results.trx"), Path.Combine(resultsFolder, "results.trx"));

        var output = Path.Combine(temp.Path, ".model", "model.json");
        var built = Cli.Run("model", "build", "--root", temp.Path, "--out", output);
        Assert.Equal(0, built.Status);

        using var document = JsonDocument.Parse(File.ReadAllText(output));
        var root = document.RootElement;
        var run = root.GetProperty("testRun");

        Assert.Equal(2, run.GetProperty("total").GetInt32());
        Assert.Equal(1, run.GetProperty("passed").GetInt32());
        Assert.Equal(1, run.GetProperty("failed").GetInt32());

        var status = root.GetProperty("status");

        Assert.True(status.GetProperty("use-case/lending.borrow-copy").GetProperty("verified").GetBoolean());
        Assert.False(status.GetProperty("use-case/lending.return-copy").GetProperty("verified").GetBoolean());
    }

    const string BorrowScenarioPage = """
        ---
        {
          "type": "scenario",
          "id": "scenario/borrow-copy.borrowing-an-available-copy-succeeds",
          "title": "Borrowing an available copy succeeds",
          "owner": "lending-team",
          "status": "reviewed",
          "given": "A copy sits available on its shelf.",
          "when": "The reader borrows the copy.",
          "result": "result/borrow-copy.borrowed",
          "then": "The loan is active."
        }
        ---

        # Borrowing an available copy succeeds

        A reader borrows an available copy.
        """;

    const string ReturnScenarioPage = """
        ---
        {
          "type": "scenario",
          "id": "scenario/return-copy.returning-a-borrowed-copy-succeeds",
          "title": "Returning a borrowed copy succeeds",
          "owner": "lending-team",
          "status": "reviewed",
          "given": "A loan stands active on a copy.",
          "when": "The reader returns the copy.",
          "result": "result/return-copy.returned",
          "then": "The loan is returned."
        }
        ---

        # Returning a borrowed copy succeeds

        A reader returns a borrowed copy.
        """;

    const string TrxScenariosFile = """
        namespace Library.Acceptance.Tests.Trx;

        public sealed class TrxScenarios
        {
            /// <proves>scenario/borrow-copy.borrowing-an-available-copy-succeeds</proves>
            public Task Borrowing_an_available_copy_succeeds() => Runner.RunScenarioAsync(
                given => new RegisterCopySteps().RegisterACopy("copy-1"),
                when => new BorrowCopySteps().BorrowACopy("reader-1", "copy-1"),
                then => new BorrowCopySteps().TheLoanIsActive());

            /// <proves>scenario/return-copy.returning-a-borrowed-copy-succeeds</proves>
            public Task Returning_a_borrowed_copy_succeeds() => Runner.RunScenarioAsync(
                given => new BorrowCopySteps().BorrowACopy("reader-1", "copy-1"),
                when => new ReturnCopySteps().ReturnACopy("loan-1"),
                then => new ReturnCopySteps().TheLoanIsReturned());
        }
        """;

    const string ScenariosFile = """
        namespace Library.Acceptance.Tests.JUnit;

        public sealed class JUnitScenarios
        {
            /// <proves>scenario/borrow-copy.borrowing-an-available-copy-succeeds</proves>
            public Task Borrowing_an_available_copy_succeeds() => Runner.RunScenarioAsync(
                given => new RegisterCopySteps().RegisterACopy("copy-1"),
                when => new BorrowCopySteps().BorrowACopy("reader-1", "copy-1"),
                then => new BorrowCopySteps().TheLoanIsActive());

            /// <proves>scenario/return-copy.returning-a-borrowed-copy-succeeds</proves>
            public Task Returning_a_borrowed_copy_succeeds() => Runner.RunScenarioAsync(
                given => new BorrowCopySteps().BorrowACopy("reader-1", "copy-1"),
                when => new ReturnCopySteps().ReturnACopy("loan-1"),
                then => new ReturnCopySteps().TheLoanIsReturned());
        }
        """;
}
