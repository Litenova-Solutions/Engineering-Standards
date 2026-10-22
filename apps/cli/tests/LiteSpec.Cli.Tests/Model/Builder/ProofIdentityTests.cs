using System.Text.Json;
using LiteSpec.Tests.Model;
using LiteSpec.Tests.Support;

namespace LiteSpec.Tests.Model.Builder;

/// <summary>Proves tests match runs by fully qualified name, never by bare method name.</summary>
public sealed class ProofIdentityTests
{
    /// <summary>A passing run for another class's same-named method leaves the scenario awaiting its run.</summary>
    [Fact]
    public void Same_Method_Name_In_Another_Class_Does_Not_Verify()
    {
        using var temp = ModelFixture.Prepare("small");
        WriteScenario(temp.Path);
        WriteProof(temp.Path);
        WriteTrx(temp.Path, "Library.Acceptance.Tests.Shadow.ShadowScenarios.Borrowing_an_available_copy_succeeds");

        using var document = Build(temp.Path);
        var root = document.RootElement;

        Assert.False(root.GetProperty("status").GetProperty("use-case/lending.borrow-copy").GetProperty("verified").GetBoolean());

        var link = ProvesLink(root, "scenario/borrow-copy.borrowing-an-available-copy-succeeds");

        Assert.True(link.GetProperty("confirmed").GetBoolean());
        Assert.Equal(JsonValueKind.Null, link.GetProperty("passing").ValueKind);
    }

    /// <summary>A data-row suffix on the run's test name still matches the scenario's test.</summary>
    [Fact]
    public void Data_Row_Arguments_Are_Ignored_In_Proof_Identity()
    {
        using var temp = ModelFixture.Prepare("small");
        WriteScenario(temp.Path);
        WriteProof(temp.Path);
        WriteTrx(temp.Path, "Library.Acceptance.Tests.Proof.ProofScenarios.Borrowing_an_available_copy_succeeds (Data Row 0)");

        using var document = Build(temp.Path);
        var root = document.RootElement;

        Assert.True(root.GetProperty("status").GetProperty("use-case/lending.borrow-copy").GetProperty("verified").GetBoolean());

        var link = ProvesLink(root, "scenario/borrow-copy.borrowing-an-available-copy-succeeds");

        Assert.True(link.GetProperty("confirmed").GetBoolean());
        Assert.True(link.GetProperty("passing").GetBoolean());
    }

    static void WriteScenario(string root) =>
        Write(root, "docs/domain/modules/lending/loans/borrow-copy-proof-scenario.md", ScenarioPage);

    static void WriteProof(string root) =>
        Write(root, "apps/api/tests/Library.Acceptance.Tests/Proof/ProofScenarios.cs", ProofFile);

    static void WriteTrx(string root, string testName)
    {
        var folder = Path.Combine(root, "TestResults");
        Directory.CreateDirectory(folder);
        File.WriteAllText(Path.Combine(folder, "results.trx"), TrxFile(testName));
    }

    static JsonElement ProvesLink(JsonElement root, string claim)
    {
        foreach (var link in root.GetProperty("links").GetProperty("proves").EnumerateArray())
        {
            if (link.GetProperty("claim").GetString() == claim)
            {
                return link;
            }
        }

        throw new InvalidOperationException($"No proves link claims '{claim}'.");
    }

    static JsonDocument Build(string root)
    {
        var output = Path.Combine(root, ".model", "model.json");
        var result = Cli.Run("model", "build", "--root", root, "--out", output);
        Assert.Equal(0, result.Status);

        return JsonDocument.Parse(File.ReadAllText(output));
    }

    static void Write(string root, string relative, string text)
    {
        var path = Path.Combine(root, relative.Replace('/', Path.DirectorySeparatorChar));
        Directory.CreateDirectory(Path.GetDirectoryName(path)!);
        File.WriteAllText(path, text);
    }

    static string TrxFile(string testName) =>
        "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n"
        + "<TestRun name=\"Fixture TRX run\" xmlns=\"http://microsoft.com/schemas/VisualStudio/TeamTest/2010\">\n"
        + "  <Results>\n"
        + $"    <UnitTestResult testName=\"{testName}\" outcome=\"Passed\" />\n"
        + "  </Results>\n"
        + "</TestRun>\n";

    const string ScenarioPage = """
        ---
        {
          "type": "scenario",
          "id": "scenario/borrow-copy.borrowing-an-available-copy-succeeds",
          "title": "Borrowing an available copy succeeds",
          "owner": "lending-team",
          "status": "approved",
          "given": "A copy sits available on its shelf.",
          "when": "The reader borrows the copy.",
          "result": "result/borrow-copy.borrowed",
          "then": "The loan is active."
        }
        ---

        # Borrowing an available copy succeeds

        A reader borrows an available copy.
        """;

    const string ProofFile = """
        namespace Library.Acceptance.Tests.Proof;

        public sealed class ProofScenarios
        {
            /// <proves>scenario/borrow-copy.borrowing-an-available-copy-succeeds</proves>
            public Task Borrowing_an_available_copy_succeeds() => Runner.RunScenarioAsync(
                given => new RegisterCopySteps().RegisterACopy("copy-1"),
                when => new BorrowCopySteps().BorrowACopy("reader-1", "copy-1"),
                then => new BorrowCopySteps().TheLoanIsActive());
        }
        """;
}
