using LiteSpec.Model;
using LiteSpec.Tests.Support;

namespace LiteSpec.Tests.Model.Checks;

/// <summary>Proves the unified edge grammar, the idempotency grammar and the structured failure policy.</summary>
public sealed class RecordShapeCheckTests
{
    [Fact]
    public void Reaction_Effects_Issues_Edge_Feeds_Effect_Loop()
    {
        using var temp = Cli.Temp("checks");
        var model = TestModel.Model(
            TestModel.Config(temp.Path),
            TestModel.Record("use-case", "use-case/lending.return-copy", Path.Combine(temp.Path, "return.md"), """{"status": "reviewed", "kind": "command", "raises": ["event/loan.loan-returned"]}"""),
            TestModel.Record("event", "event/loan.loan-returned", Path.Combine(temp.Path, "loan.md"), """{"status": "reviewed", "meaning": "A copy was returned.", "carries": []}"""),
            TestModel.Record("reaction", "reaction/lending.return-again", Path.Combine(temp.Path, "again.md"), """{"status": "reviewed", "on": ["event/loan.loan-returned"], "effects": [{"issues": "use-case/lending.return-copy", "timing": "async"}]}"""));

        Assert.Contains("effect-loop", TestModel.Codes(model));
    }

    [Fact]
    public void Reaction_Effects_Sends_Edge_Satisfies_Notification_Sender()
    {
        using var temp = Cli.Temp("checks");
        var model = TestModel.Model(
            TestModel.Config(temp.Path),
            TestModel.Record("reaction", "reaction/lending.send-loan-due-notice", Path.Combine(temp.Path, "notice.md"), """{"status": "reviewed", "on": ["event/loan.loan-borrowed"], "effects": [{"sends": "notification/lending.loan-due"}]}"""),
            TestModel.Record("notification", "notification/lending.loan-due", Path.Combine(temp.Path, "due.md"), """{"status": "reviewed"}"""));

        Assert.DoesNotContain("notification-without-sender", TestModel.Codes(model));
    }

    [Fact]
    public void Job_Effects_Sends_Edge_Satisfies_Notification_Sender()
    {
        using var temp = Cli.Temp("checks");
        var model = TestModel.Model(
            TestModel.Config(temp.Path),
            TestModel.Record("job", "job/lending.nightly-due-scan", Path.Combine(temp.Path, "scan.md"), """{"status": "reviewed", "kind": "scheduled", "effects": [{"sends": "notification/lending.loan-due", "timing": "async"}]}"""),
            TestModel.Record("notification", "notification/lending.loan-due", Path.Combine(temp.Path, "due.md"), """{"status": "reviewed"}"""));

        Assert.DoesNotContain("notification-without-sender", TestModel.Codes(model));
    }

    [Fact]
    public void Reaction_With_Top_Level_Issues_Reports_Record_Shape()
    {
        using var temp = Cli.Temp("checks");
        var model = TestModel.Model(
            TestModel.Config(temp.Path),
            TestModel.Record("reaction", "reaction/lending.remind-overdue", Path.Combine(temp.Path, "remind.md"), """{"status": "reviewed", "on": ["event/loan.loan-borrowed"], "issues": "use-case/lending.notify-overdue"}"""));

        Assert.True(Reports(model, "record-shape", "top-level issues"));
    }

    [Fact]
    public void Reaction_With_Top_Level_Sends_Reports_Record_Shape()
    {
        using var temp = Cli.Temp("checks");
        var model = TestModel.Model(
            TestModel.Config(temp.Path),
            TestModel.Record("reaction", "reaction/lending.send-loan-due-notice", Path.Combine(temp.Path, "notice.md"), """{"status": "reviewed", "on": ["event/loan.loan-borrowed"], "sends": "notification/lending.loan-due"}"""));

        Assert.True(Reports(model, "record-shape", "top-level sends"));
    }

    [Fact]
    public void Job_With_Top_Level_Issues_Reports_Record_Shape()
    {
        using var temp = Cli.Temp("checks");
        var model = TestModel.Model(
            TestModel.Config(temp.Path),
            TestModel.Record("job", "job/lending.nightly-due-scan", Path.Combine(temp.Path, "scan.md"), """{"status": "reviewed", "kind": "scheduled", "issues": ["use-case/lending.mark-due"]}"""));

        Assert.True(Reports(model, "record-shape", "top-level issues"));
    }

    [Fact]
    public void Reaction_Without_Effects_Reports_Record_Shape()
    {
        using var temp = Cli.Temp("checks");
        var model = TestModel.Model(
            TestModel.Config(temp.Path),
            TestModel.Record("reaction", "reaction/lending.remind-overdue", Path.Combine(temp.Path, "remind.md"), """{"status": "reviewed", "on": ["event/loan.loan-borrowed"]}"""));

        Assert.True(Reports(model, "record-shape", "has no effects"));
    }

    [Fact]
    public void Reaction_Effects_Without_Timing_Pass_Shape()
    {
        using var temp = Cli.Temp("checks");
        var model = TestModel.Model(
            TestModel.Config(temp.Path),
            TestModel.Record("reaction", "reaction/lending.send-loan-due-notice", Path.Combine(temp.Path, "notice.md"), """{"status": "draft", "decider": "lending-team", "decideBy": "2035-06-01", "on": ["event/loan.loan-borrowed"], "effects": [{"sends": "notification/lending.loan-due"}]}"""),
            TestModel.Record("notification", "notification/lending.loan-due", Path.Combine(temp.Path, "due.md"), """{"status": "draft", "decider": "lending-team", "decideBy": "2035-06-01"}"""));

        Assert.DoesNotContain("record-shape", TestModel.Codes(model));
    }

    [Fact]
    public void Key_Placeholder_Naming_No_Input_Field_Reports()
    {
        using var temp = Cli.Temp("checks");
        var model = TestModel.Model(
            TestModel.Config(temp.Path),
            TestModel.Record("use-case", "use-case/lending.borrow-copy", Path.Combine(temp.Path, "borrow.md"), """{"status": "draft", "decider": "lending-team", "decideBy": "2035-06-01", "kind": "command", "reachedThrough": ["entry-point/library-app"], "input": [{"name": "copyId", "meaning": "The copy."}], "idempotency": {"mode": "key", "key": "loan:{copy}", "scope": "tenant"}}"""));

        Assert.True(Reports(model, "record-shape", "placeholder 'copy' names no input field"));
        Assert.True(Reports(model, "record-shape", "input fields in scope: copyId"));
    }

    [Fact]
    public void Key_Without_Placeholder_Reports()
    {
        using var temp = Cli.Temp("checks");
        var model = TestModel.Model(
            TestModel.Config(temp.Path),
            TestModel.Record("use-case", "use-case/lending.borrow-copy", Path.Combine(temp.Path, "borrow.md"), """{"status": "draft", "decider": "lending-team", "decideBy": "2035-06-01", "kind": "command", "reachedThrough": ["entry-point/library-app"], "input": [{"name": "copyId", "meaning": "The copy."}], "idempotency": {"mode": "key", "key": "notice per loan", "scope": "tenant"}}"""));

        Assert.True(Reports(model, "record-shape", "with no {field} placeholder"));
        Assert.True(Reports(model, "record-shape", "input fields in scope: copyId"));
    }

    [Fact]
    public void Unknown_Scope_Reports()
    {
        using var temp = Cli.Temp("checks");
        var model = TestModel.Model(
            TestModel.Config(temp.Path),
            TestModel.Record("use-case", "use-case/lending.borrow-copy", Path.Combine(temp.Path, "borrow.md"), """{"status": "draft", "decider": "lending-team", "decideBy": "2035-06-01", "kind": "command", "reachedThrough": ["entry-point/library-app"], "idempotency": {"mode": "key", "key": "loan:{copyId}", "scope": "branch"}}"""));

        Assert.True(Reports(model, "record-shape", "tenant, account, login, global"));
    }

    [Fact]
    public void Valid_Key_And_Scope_Pass_Shape()
    {
        using var temp = Cli.Temp("checks");
        var model = TestModel.Model(
            TestModel.Config(temp.Path),
            TestModel.Record("use-case", "use-case/lending.borrow-copy", Path.Combine(temp.Path, "borrow.md"), """{"status": "draft", "decider": "lending-team", "decideBy": "2035-06-01", "kind": "command", "reachedThrough": ["entry-point/library-app"], "input": [{"name": "copyId", "meaning": "The copy."}], "idempotency": {"mode": "key", "key": "loan:{copyId}", "scope": "login"}}"""));

        Assert.DoesNotContain("record-shape", TestModel.Codes(model));
    }

    [Fact]
    public void Reaction_Key_Names_Event_Fields_Unchecked()
    {
        using var temp = Cli.Temp("checks");
        var model = TestModel.Model(
            TestModel.Config(temp.Path),
            TestModel.Record("reaction", "reaction/lending.send-loan-due-notice", Path.Combine(temp.Path, "notice.md"), """{"status": "draft", "decider": "lending-team", "decideBy": "2035-06-01", "on": ["event/loan.loan-borrowed"], "effects": [{"sends": "notification/lending.loan-due"}], "idempotency": {"mode": "key", "key": "notice:{loan}", "scope": "global"}}"""));

        Assert.False(Reports(model, "record-shape", "idempotency key"));
    }

    [Fact]
    public void Reaction_Prose_OnFailure_Reports()
    {
        using var temp = Cli.Temp("checks");
        var model = TestModel.Model(
            TestModel.Config(temp.Path),
            TestModel.Record("reaction", "reaction/lending.send-loan-due-notice", Path.Combine(temp.Path, "notice.md"), """{"status": "draft", "decider": "lending-team", "decideBy": "2035-06-01", "on": ["event/loan.loan-borrowed"], "effects": [{"sends": "notification/lending.loan-due"}], "onFailure": "Retry a few times, then give up."}"""));

        Assert.True(Reports(model, "record-shape", "as prose"));
    }

    [Fact]
    public void Job_Prose_OnFailure_Reports()
    {
        using var temp = Cli.Temp("checks");
        var model = TestModel.Model(
            TestModel.Config(temp.Path),
            TestModel.Record("job", "job/lending.nightly-due-scan", Path.Combine(temp.Path, "scan.md"), """{"status": "draft", "decider": "lending-team", "decideBy": "2035-06-01", "kind": "scheduled", "onFailure": "Retry a few times, then give up."}"""));

        Assert.True(Reports(model, "record-shape", "as prose"));
    }

    [Fact]
    public void Malformed_Retry_Delay_Reports()
    {
        using var temp = Cli.Temp("checks");
        var model = TestModel.Model(
            TestModel.Config(temp.Path),
            TestModel.Record("job", "job/lending.nightly-due-scan", Path.Combine(temp.Path, "scan.md"), """{"status": "draft", "decider": "lending-team", "decideBy": "2035-06-01", "kind": "scheduled", "onFailure": {"retry": {"maxAttempts": 10, "initialDelay": "5 seconds", "maxDelay": "PT10M", "backoff": "exponential"}}}"""));

        Assert.True(Reports(model, "record-shape", "initialDelay '5 seconds', which is not an ISO 8601 duration"));
    }

    [Fact]
    public void Malformed_DeadLetter_After_Reports()
    {
        using var temp = Cli.Temp("checks");
        var model = TestModel.Model(
            TestModel.Config(temp.Path),
            TestModel.Record("job", "job/lending.nightly-due-scan", Path.Combine(temp.Path, "scan.md"), """{"status": "draft", "decider": "lending-team", "decideBy": "2035-06-01", "kind": "scheduled", "onFailure": {"retry": "none", "deadLetter": {"after": "7 days", "action": "Replay by hand."}}}"""));

        Assert.True(Reports(model, "record-shape", "after '7 days', which is not an ISO 8601 duration"));
    }

    [Fact]
    public void Unknown_Backoff_Reports()
    {
        using var temp = Cli.Temp("checks");
        var model = TestModel.Model(
            TestModel.Config(temp.Path),
            TestModel.Record("job", "job/lending.nightly-due-scan", Path.Combine(temp.Path, "scan.md"), """{"status": "draft", "decider": "lending-team", "decideBy": "2035-06-01", "kind": "scheduled", "onFailure": {"retry": {"maxAttempts": 10, "initialDelay": "PT5S", "maxDelay": "PT10M", "backoff": "linear"}}}"""));

        Assert.True(Reports(model, "record-shape", "exponential, fixed"));
    }

    [Fact]
    public void Missing_MaxAttempts_Reports()
    {
        using var temp = Cli.Temp("checks");
        var model = TestModel.Model(
            TestModel.Config(temp.Path),
            TestModel.Record("job", "job/lending.nightly-due-scan", Path.Combine(temp.Path, "scan.md"), """{"status": "draft", "decider": "lending-team", "decideBy": "2035-06-01", "kind": "scheduled", "onFailure": {"retry": {"initialDelay": "PT5S", "maxDelay": "PT10M", "backoff": "exponential"}}}"""));

        Assert.True(Reports(model, "record-shape", "no positive maxAttempts"));
    }

    [Fact]
    public void Missing_Retry_Reports()
    {
        using var temp = Cli.Temp("checks");
        var model = TestModel.Model(
            TestModel.Config(temp.Path),
            TestModel.Record("reaction", "reaction/lending.send-loan-due-notice", Path.Combine(temp.Path, "notice.md"), """{"status": "draft", "decider": "lending-team", "decideBy": "2035-06-01", "on": ["event/loan.loan-borrowed"], "effects": [{"sends": "notification/lending.loan-due"}], "onFailure": {"deadLetter": {"after": "P7D", "action": "Replay by hand."}}}"""));

        Assert.True(Reports(model, "record-shape", "onFailure with no retry"));
    }

    [Fact]
    public void Structured_OnFailure_Passes_Shape()
    {
        using var temp = Cli.Temp("checks");
        var model = TestModel.Model(
            TestModel.Config(temp.Path),
            TestModel.Record("reaction", "reaction/lending.send-loan-due-notice", Path.Combine(temp.Path, "notice.md"), """{"status": "draft", "decider": "lending-team", "decideBy": "2035-06-01", "on": ["event/loan.loan-borrowed"], "effects": [{"sends": "notification/lending.loan-due"}], "onFailure": {"retry": {"maxAttempts": 10, "initialDelay": "PT5S", "maxDelay": "PT10M", "backoff": "exponential"}, "deadLetter": {"after": "P7D", "action": "Replay by hand."}}}"""),
            TestModel.Record("event", "event/loan.loan-borrowed", Path.Combine(temp.Path, "loan.md"), """{"status": "draft", "decider": "lending-team", "decideBy": "2035-06-01", "meaning": "A copy was lent.", "carries": []}"""),
            TestModel.Record("notification", "notification/lending.loan-due", Path.Combine(temp.Path, "due.md"), """{"status": "draft", "decider": "lending-team", "decideBy": "2035-06-01"}"""));

        Assert.DoesNotContain("record-shape", TestModel.Codes(model));
    }

    [Fact]
    public void Retry_None_Passes_Shape()
    {
        using var temp = Cli.Temp("checks");
        var model = TestModel.Model(
            TestModel.Config(temp.Path),
            TestModel.Record("job", "job/lending.nightly-due-scan", Path.Combine(temp.Path, "scan.md"), """{"status": "draft", "decider": "lending-team", "decideBy": "2035-06-01", "kind": "one-off", "onFailure": {"retry": "none"}}"""));

        Assert.DoesNotContain("record-shape", TestModel.Codes(model));
    }

    /// <summary>Whether the check reports the code with the text in its message.</summary>
    static bool Reports(ProjectModel model, string code, string text) =>
        Checker.Check(model).Findings.Any(finding =>
            finding.Code == code && finding.Message.Contains(text, StringComparison.Ordinal));
}
