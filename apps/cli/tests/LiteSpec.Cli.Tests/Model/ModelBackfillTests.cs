using LiteSpec.Tests.Support;

namespace LiteSpec.Tests.Model;

/// <summary>Proves <c>litespec model backfill</c> drafts missing fields from code and nothing else.</summary>
public sealed class ModelBackfillTests
{
    static string Page(string root, params string[] parts) => Path.Combine([root, .. parts]);

    static string BorrowCopy(string root) => Page(
        root, "docs", "behavior", "modules", "lending", "loans", "borrow-copy.md");

    static string BorrowCopyHandler(string root) => Page(
        root, "apps", "api", "src", "Library.Application", "Lending", "Loans",
        "BorrowCopy", "BorrowCopyCommandHandler.cs");

    /// <summary>Backfill drafts the missing changes and marks the record transcribed.</summary>
    [Fact]
    public void Backfill_Adds_Missing_Changes_And_Marks_Transcribed()
    {
        using var fixture = ModelFixture.Prepare("large", "write-undeclared");
        var result = Cli.Run("model", "backfill", "--root", fixture.Path);

        Assert.Equal(0, result.Status);
        Assert.Contains("+changes aggregate/lending.hold", result.Output);
        Assert.Contains("lending", result.Output);
        Assert.Contains("Changes", result.Output);
        Assert.Contains("Reads", result.Output);
        Assert.Contains("Effects", result.Output);
        Assert.Contains("Results", result.Output);

        var text = File.ReadAllText(BorrowCopy(fixture.Path));

        Assert.Contains("aggregate/lending.hold", text);
        Assert.Contains("\"source\": \"transcribed\"", text);
        Assert.Contains("result/borrow-copy.copy-unavailable", text);
    }

    /// <summary>A dry run prints the planned writes and leaves every file alone.</summary>
    [Fact]
    public void Backfill_Dry_Run_Writes_Nothing()
    {
        using var fixture = ModelFixture.Prepare("large", "write-undeclared");
        var before = File.ReadAllText(BorrowCopy(fixture.Path));
        var result = Cli.Run("model", "backfill", "--root", fixture.Path, "--dry-run");

        Assert.Equal(0, result.Status);
        Assert.Contains("(dry run)", result.Output);
        Assert.Contains("+changes aggregate/lending.hold", result.Output);
        Assert.Equal(before, File.ReadAllText(BorrowCopy(fixture.Path)));
    }

    /// <summary>Backfill drafts a refusal result for a code no result declares.</summary>
    [Fact]
    public void Backfill_Adds_Missing_Refusal_Results()
    {
        using var fixture = ModelFixture.Prepare("large", "result-undeclared");
        var result = Cli.Run("model", "backfill", "--root", fixture.Path);

        Assert.Equal(0, result.Status);
        Assert.Contains("+results lending.ghost-refusal", result.Output);

        var text = File.ReadAllText(BorrowCopy(fixture.Path));

        Assert.Contains("result/borrow-copy.ghost-refusal", text);
        Assert.Contains("lending.ghost-refusal", text);
        Assert.Contains("result/borrow-copy.copy-unavailable", text);
        Assert.Contains("\"source\": \"transcribed\"", text);
    }

    /// <summary>Human entries keep their place and are never duplicated or rewritten.</summary>
    [Fact]
    public void Backfill_Preserves_Human_Entries()
    {
        using var fixture = ModelFixture.Prepare("large", "write-undeclared");

        var path = BorrowCopy(fixture.Path);
        var drafted = File.ReadAllText(path).Replace(
            "\"kind\": \"command\",",
            "\"kind\": \"command\",\n  \"changes\": [\n    \"aggregate/lending.loan\"\n  ],",
            StringComparison.Ordinal);

        File.WriteAllText(path, drafted);

        var result = Cli.Run("model", "backfill", "--root", fixture.Path);

        Assert.Equal(0, result.Status);

        var text = File.ReadAllText(path);

        Assert.True(text.IndexOf("aggregate/lending.loan", StringComparison.Ordinal)
            < text.IndexOf("aggregate/lending.hold", StringComparison.Ordinal));
        Assert.Equal(2, text.Split("aggregate/lending").Length - 1);
    }

    /// <summary>Backfill drafts an effects entry for a dispatch that resolves to a use case.</summary>
    [Fact]
    public void Backfill_Adds_Effects_From_Dispatch()
    {
        using var fixture = ModelFixture.Prepare("large");

        File.WriteAllText(BorrowCopyHandler(fixture.Path), """
            using Library.Domain.Lending.Loans.Exceptions;

            namespace Library.Application.Lending.Loans.BorrowCopy;

            public sealed class BorrowCopyCommandHandler(ICommandMediator mediator)
            {
                public async Task Handle(BorrowCopyCommand command)
                {
                    if (command.CopyId == Guid.Empty)
                        throw new CopyNotAvailableException();
                    await mediator.SendAsync(new ExtendLoanCommand());
                }
            }
            """);

        var result = Cli.Run("model", "backfill", "--root", fixture.Path);

        Assert.Equal(0, result.Status);
        Assert.Contains("+effects issues:use-case/lending.extend-loan", result.Output);

        var text = File.ReadAllText(BorrowCopy(fixture.Path));

        Assert.Contains("use-case/lending.extend-loan", text);
        Assert.Contains("\"timing\": \"after-commit\"", text);
    }

    /// <summary>A dispatch with no matching record is skipped rather than invented.</summary>
    [Fact]
    public void Backfill_Skips_Unresolvable_Effect_Targets()
    {
        using var fixture = ModelFixture.Prepare("large", "effect-undeclared");
        var result = Cli.Run("model", "backfill", "--root", fixture.Path);

        Assert.Equal(0, result.Status);
        Assert.Contains("0 records backfilled", result.Output);
        Assert.DoesNotContain("\"effects\"", File.ReadAllText(BorrowCopy(fixture.Path)));
    }

    /// <summary>Backfill drafts a reaction's reads from its constructor repositories.</summary>
    [Fact]
    public void Backfill_Backfills_Reaction_Reads()
    {
        using var fixture = ModelFixture.Prepare("large");

        File.WriteAllText(
            Path.Combine(
                fixture.Path, "apps", "api", "src", "Library.Application",
                "Lending", "Loans", "SendLoanDueNoticeReaction.cs"),
            """
            namespace Library.Application.Lending.Loans;

            /// <implements>reaction/lending.send-loan-due-notice</implements>
            public sealed class SendLoanDueNoticeReaction(IHoldRepository holds)
            {
                public Task Handle() => Task.CompletedTask;
            }
            """);

        var result = Cli.Run("model", "backfill", "--root", fixture.Path);

        Assert.Equal(0, result.Status);
        Assert.Contains("+reads aggregate/lending.hold", result.Output);

        var text = File.ReadAllText(Page(
            fixture.Path, "docs", "behavior", "modules", "lending",
            "reactions", "send-loan-due-notice.md"));

        Assert.Contains("aggregate/lending.hold", text);
        Assert.Contains("\"source\": \"transcribed\"", text);
    }

    /// <summary>Backfill drafts a job's issues from its dispatched commands.</summary>
    [Fact]
    public void Backfill_Backfills_Job_Issues()
    {
        using var fixture = ModelFixture.Prepare("large");

        File.WriteAllText(
            Path.Combine(
                fixture.Path, "apps", "api", "src", "Library.Application",
                "Lending", "Loans", "NightlyDueScanJob.cs"),
            """
            namespace Library.Application.Lending.Loans;

            /// <implements>job/lending.nightly-due-scan</implements>
            public sealed class NightlyDueScanJob(ICommandMediator mediator)
            {
                public async Task Run()
                {
                    await mediator.SendAsync(new ExtendLoanCommand());
                }
            }
            """);

        var result = Cli.Run("model", "backfill", "--root", fixture.Path);

        Assert.Equal(0, result.Status);
        Assert.Contains("+issues use-case/lending.extend-loan", result.Output);

        var text = File.ReadAllText(Page(
            fixture.Path, "docs", "behavior", "modules", "lending",
            "jobs", "nightly-due-scan.md"));

        Assert.Contains("use-case/lending.extend-loan", text);
        Assert.Contains("\"source\": \"transcribed\"", text);
    }

    /// <summary>Backfill on a clean fixture writes nothing and still prints the table.</summary>
    [Fact]
    public void Backfill_On_Clean_Fixture_Writes_Nothing()
    {
        using var fixture = ModelFixture.Prepare("large");
        var result = Cli.Run("model", "backfill", "--root", fixture.Path);

        Assert.Equal(0, result.Status);
        Assert.Contains("lending", result.Output);
        Assert.Contains("0 records backfilled", result.Output);
    }

    /// <summary>Backfill limits itself to the named module.</summary>
    [Fact]
    public void Backfill_Filters_By_Module()
    {
        using var fixture = ModelFixture.Prepare("large", "write-undeclared");
        var result = Cli.Run("model", "backfill", "--root", fixture.Path, "lending");

        Assert.Equal(0, result.Status);
        Assert.Contains("aggregate/lending.hold", File.ReadAllText(BorrowCopy(fixture.Path)));
    }

    /// <summary>Backfill names the module when it holds no backfillable records.</summary>
    [Fact]
    public void Backfill_Unknown_Module_Exits_1()
    {
        using var fixture = ModelFixture.Prepare("large", "write-undeclared");
        var result = Cli.Run("model", "backfill", "--root", fixture.Path, "billing");

        Assert.Equal(1, result.Status);
        Assert.Contains("billing", result.Output);
    }
}
