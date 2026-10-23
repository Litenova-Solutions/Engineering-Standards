using System.Text.Json;
using LiteSpec.Tests.Model;
using LiteSpec.Tests.Support;

namespace LiteSpec.Tests.Model.Builder;

/// <summary>Proves a requirement verifies when what fulfills it verifies, with its measure passing.</summary>
public sealed class RequirementStatusTests
{
    /// <summary>A measured requirement verifies on a verified fulfiller and a passing check.</summary>
    [Fact]
    public void Measured_Requirement_With_A_Passing_Check_Verifies()
    {
        using var temp = ModelFixture.Prepare("small");
        Write(temp.Path, "docs/behavior/modules/lending/loans/borrow-copy-proof-scenario.md", ScenarioPage);
        Write(temp.Path, "apps/api/tests/Library.Acceptance.Tests/JUnit/JUnitScenarios.cs", ScenariosFile);
        Write(temp.Path, "docs/product/lending/performance.md", RequirementPage);
        Write(temp.Path, "docs/product/journeys/borrow-and-return.md", JourneyPage);
        Fulfill(temp.Path, "requirement/borrowing.borrow-latency", "requirement/borrowing.borrow-errors");

        var results = Path.Combine(temp.Path, "TestResults");
        Directory.CreateDirectory(results);
        File.Copy(Cli.Fixture("Model/junit/results.xml"), Path.Combine(results, "results.xml"));
        File.Copy(Cli.Fixture("Builder/measures/k6-summary.json"), Path.Combine(results, "k6-summary.json"));

        using var document = Build(temp.Path);
        var root = document.RootElement;

        Assert.True(root.GetProperty("status").GetProperty("use-case/lending.borrow-copy").GetProperty("verified").GetBoolean());

        var latency = root.GetProperty("requirementStatus").GetProperty("requirement/borrowing.borrow-latency");
        Assert.True(latency.GetProperty("verified").GetBoolean());
        Assert.True(latency.GetProperty("measurePassed").GetBoolean());

        var errors = root.GetProperty("requirementStatus").GetProperty("requirement/borrowing.borrow-errors");
        Assert.False(errors.GetProperty("verified").GetBoolean());
        Assert.False(errors.GetProperty("measurePassed").GetBoolean());

        var loans = root.GetProperty("requirementStatus").GetProperty("requirement/borrowing.max-active-loans");
        Assert.False(loans.GetProperty("verified").GetBoolean());
        Assert.Equal(JsonValueKind.Null, loans.GetProperty("measurePassed").ValueKind);

        var journey = root.GetProperty("requirementStatus").GetProperty("requirement/borrowing.borrow-journey");
        Assert.True(journey.GetProperty("verified").GetBoolean());
        Assert.Equal(JsonValueKind.Null, journey.GetProperty("measurePassed").ValueKind);
    }

    static void Fulfill(string root, params string[] requirements)
    {
        var page = Path.Combine(root, "docs", "behavior", "modules", "lending", "loans", "borrow-copy.md");
        var text = File.ReadAllText(page);
        var joined = "\"requirement/borrowing.max-active-loans\",\n        \""
            + string.Join("\",\n        \"", requirements) + "\"";

        text = text.Replace("\"requirement/borrowing.max-active-loans\"", joined);
        text = text.Replace(
            "  \"fulfills\": [",
            "  \"serves\": [\n    \"journey/borrow-and-return#s1\"\n  ],\n  \"fulfills\": [");

        File.WriteAllText(page, text);
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

    const string ScenarioPage = """
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

    const string ScenariosFile = """
        namespace Library.Acceptance.Tests.JUnit;

        public sealed class JUnitScenarios
        {
            /// <proves>scenario/borrow-copy.borrowing-an-available-copy-succeeds</proves>
            public Task Borrowing_an_available_copy_succeeds() => Runner.RunScenarioAsync(
                given => new RegisterCopySteps().RegisterACopy("copy-1"),
                when => new BorrowCopySteps().BorrowACopy("reader-1", "copy-1"),
                then => new BorrowCopySteps().TheLoanIsActive());
        }
        """;

    const string RequirementPage = """
        ---
        {
          "type": "requirement-page",
          "title": "Borrowing performance",
          "owner": "lending-team",
          "status": "approved",
          "reviewBy": "2027-04-01",
          "records": [
            {
              "type": "requirement",
              "id": "requirement/borrowing.borrow-latency",
              "title": "Borrow latency",
              "owner": "lending-team",
              "status": "approved",
              "kind": "quality",
              "statement": "Borrowing answers fast.",
              "measure": "p95 latency of borrowing",
              "by": "2026-12-01",
              "check": "k6 http_req_duration p(95)<200"
            },
            {
              "type": "requirement",
              "id": "requirement/borrowing.borrow-errors",
              "title": "Borrow errors",
              "owner": "lending-team",
              "status": "approved",
              "kind": "quality",
              "statement": "Borrowing rarely fails.",
              "measure": "failed borrows",
              "by": "2026-12-01",
              "check": "k6 http_req_failed rate<0.05"
            },
            {
              "type": "requirement",
              "id": "requirement/borrowing.borrow-journey",
              "title": "Borrow journey",
              "owner": "lending-team",
              "status": "approved",
              "kind": "functional",
              "statement": "A reader borrows through the app.",
              "basedOn": []
            }
          ]
        }
        ---

        # Borrowing performance

        Borrowing stays fast and certain.
        """;

    const string JourneyPage = """
        ---
        {
          "type": "journey",
          "id": "journey/borrow-and-return",
          "title": "Borrow and return",
          "owner": "lending-team",
          "status": "approved",
          "actor": "actor/reader",
          "goal": "Borrow a copy.",
          "finishedWhen": "The reader holds the copy.",
          "steps": [
            {
              "id": "s1",
              "says": "The reader borrows the copy from the shelf.",
              "actor": "actor/reader"
            }
          ],
          "fulfills": [
            "requirement/borrowing.borrow-journey"
          ]
        }
        ---

        # Borrow and return

        A reader borrows a copy.
        """;
}
