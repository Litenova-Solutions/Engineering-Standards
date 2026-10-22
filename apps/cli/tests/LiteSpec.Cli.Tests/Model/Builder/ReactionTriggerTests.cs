using System.Text.Json;
using LiteSpec.Tests.Model;
using LiteSpec.Tests.Support;

namespace LiteSpec.Tests.Model.Builder;

/// <summary>Proves a reaction or job without a tag implements the use case its trigger or name answers.</summary>
public sealed class ReactionTriggerTests
{
    /// <summary>A reaction naming a triggered event implements that trigger's use case.</summary>
    [Fact]
    public void Reaction_Without_A_Tag_Implements_The_Use_Case_Its_Trigger_Names()
    {
        using var temp = ModelFixture.Prepare("small");
        Write(temp.Path, "docs/domain/modules/lending/loans/notify-overdue.md", UseCasePage);
        Write(temp.Path, "apps/api/src/Library.Application/Lending/Loans/NotifyOverdue/LoanBorrowedReaction.cs", ReactionFile);

        using var document = Build(temp.Path);
        var root = document.RootElement;

        Assert.Contains(
            root.GetProperty("links").GetProperty("implements").EnumerateArray(),
            link => link.GetProperty("path").GetString() == "apps/api/src/Library.Application/Lending/Loans/NotifyOverdue/LoanBorrowedReaction.cs"
                && link.GetProperty("to").GetString() == "use-case/lending.notify-overdue"
                && link.GetProperty("kind").GetString() == "reaction");
        Assert.True(root.GetProperty("status").GetProperty("use-case/lending.notify-overdue").GetProperty("implemented").GetBoolean());
    }

    /// <summary>A job naming a use case implements that use case.</summary>
    [Fact]
    public void Job_Without_A_Tag_Implements_The_Use_Case_Its_Name_Names()
    {
        using var temp = ModelFixture.Prepare("small");
        Write(temp.Path, "apps/api/src/Library.Application/Lending/Loans/ListLoans/ListLoansJob.cs", JobFile);

        using var document = Build(temp.Path);

        Assert.Contains(
            document.RootElement.GetProperty("links").GetProperty("implements").EnumerateArray(),
            link => link.GetProperty("path").GetString() == "apps/api/src/Library.Application/Lending/Loans/ListLoans/ListLoansJob.cs"
                && link.GetProperty("to").GetString() == "use-case/lending.list-loans"
                && link.GetProperty("kind").GetString() == "job");
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

    const string UseCasePage = """
        ---
        {
          "type": "use-case",
          "id": "use-case/lending.notify-overdue",
          "title": "Notify overdue",
          "owner": "lending-team",
          "status": "approved",
          "kind": "reaction",
          "reachedThrough": [
            "entry-point/overdue-job"
          ],
          "trigger": {
            "events": [
              "event/loan.loan-borrowed"
            ]
          },
          "records": [
            {
              "type": "result",
              "id": "result/notify-overdue.notified",
              "title": "Notified",
              "owner": "lending-team",
              "outcome": "success",
              "meaning": "The reader is told."
            }
          ]
        }
        ---

        # Notify overdue

        A reader learns a loan passed its due date.
        """;

    const string ReactionFile = """
        namespace Library.Application.Lending.Loans.NotifyOverdue;

        /// <summary>Notifies the reader when a loan is borrowed.</summary>
        public sealed class LoanBorrowedReaction : IEventHandler<LoanBorrowedEvent>
        {
            public Task HandleAsync(LoanBorrowedEvent raised) => Task.CompletedTask;
        }
        """;

    const string JobFile = """
        namespace Library.Application.Lending.Loans.ListLoans;

        /// <summary>Warms the loan list on a schedule.</summary>
        public sealed class ListLoansJob : BackgroundService
        {
            protected override Task ExecuteAsync(CancellationToken stopping) => Task.CompletedTask;
        }
        """;
}
