using System.Text.Json;
using LiteSpec.Tests.Model;
using LiteSpec.Tests.Support;

namespace LiteSpec.Tests.Model.Builder;

/// <summary>Proves a refusal confirms from its status or its client code through the project's refusal map.</summary>
public sealed class RefusalProofTests
{
    /// <summary>A refusal scenario asserting the mapped status alone confirms.</summary>
    [Fact]
    public void Refusal_Status_Alone_Confirms_When_The_Table_Maps_It()
    {
        using var temp = ModelFixture.Prepare("small");
        Write(temp.Path, "docs/behavior/modules/lending/loans/refusal-scenario.md", RefusalScenarioPage);
        Write(temp.Path, "apps/api/tests/Library.Acceptance.Tests/Strength/StatusRefusalScenarios.cs", StatusFile);
        WriteRefusals(temp.Path, """{"lending.copy-not-available": 409}""", "{}");

        using var document = Build(temp.Path);

        Assert.True(ProvesLink(document.RootElement, "scenario/borrow-copy.borrowing-an-unavailable-copy-refuses").GetProperty("confirmed").GetBoolean());
    }

    /// <summary>A refusal scenario asserting a client code the map translates confirms.</summary>
    [Fact]
    public void Refusal_Client_Code_Confirms_When_The_Map_Translates_It()
    {
        using var temp = ModelFixture.Prepare("small");
        Write(temp.Path, "docs/behavior/modules/lending/loans/refusal-scenario.md", RefusalScenarioPage);
        Write(temp.Path, "apps/api/tests/Library.Acceptance.Tests/Strength/AliasRefusalScenarios.cs", AliasFile);
        WriteRefusals(temp.Path, "{}", """{"COPY_UNAVAILABLE": "lending.copy-not-available"}""");

        using var document = Build(temp.Path);

        Assert.True(ProvesLink(document.RootElement, "scenario/borrow-copy.borrowing-an-unavailable-copy-refuses").GetProperty("confirmed").GetBoolean());
    }

    /// <summary>A refusal scenario asserting a status the table maps elsewhere does not confirm.</summary>
    [Fact]
    public void Refusal_Wrong_Status_Does_Not_Confirm()
    {
        using var temp = ModelFixture.Prepare("small");
        Write(temp.Path, "docs/behavior/modules/lending/loans/refusal-scenario.md", RefusalScenarioPage);
        Write(temp.Path, "apps/api/tests/Library.Acceptance.Tests/Strength/WrongStatusScenarios.cs", WrongStatusFile);
        WriteRefusals(temp.Path, """{"lending.copy-not-available": 409}""", "{}");

        using var document = Build(temp.Path);

        Assert.False(ProvesLink(document.RootElement, "scenario/borrow-copy.borrowing-an-unavailable-copy-refuses").GetProperty("confirmed").GetBoolean());
    }

    /// <summary>A refusal scenario asserting a client code the map does not translate does not confirm.</summary>
    [Fact]
    public void Refusal_Unmapped_Client_Code_Does_Not_Confirm()
    {
        using var temp = ModelFixture.Prepare("small");
        Write(temp.Path, "docs/behavior/modules/lending/loans/refusal-scenario.md", RefusalScenarioPage);
        Write(temp.Path, "apps/api/tests/Library.Acceptance.Tests/Strength/UnmappedCodeScenarios.cs", UnmappedFile);
        WriteRefusals(temp.Path, "{}", """{"COPY_UNAVAILABLE": "lending.copy-not-available"}""");

        using var document = Build(temp.Path);

        Assert.False(ProvesLink(document.RootElement, "scenario/borrow-copy.borrowing-an-unavailable-copy-refuses").GetProperty("confirmed").GetBoolean());
    }

    /// <summary>An integration fact asserting the mapped status member confirms.</summary>
    [Fact]
    public void Refusal_Status_Member_Confirms_An_Integration_Fact()
    {
        using var temp = ModelFixture.Prepare("small");
        Write(temp.Path, "docs/behavior/modules/lending/loans/refusal-scenario.md", RefusalScenarioPage);
        Write(temp.Path, "apps/api/tests/Library.Integration.Tests/Strength/StatusMemberRefusalTests.cs", StatusMemberFile);
        WriteRefusals(temp.Path, """{"lending.copy-not-available": 409}""", "{}");

        using var document = Build(temp.Path);

        Assert.True(ProvesLink(document.RootElement, "scenario/borrow-copy.borrowing-an-unavailable-copy-refuses").GetProperty("confirmed").GetBoolean());
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

    static void WriteRefusals(string root, string statuses, string aliases)
    {
        var path = Path.Combine(root, "litespec.project.json");
        var text = File.ReadAllText(path);
        var refusals = "\"refusals\": {\"forbidden\": \"authorization.forbidden\", \"invalidInput\": \"request.validation-failed\", \"statuses\": " + statuses + ", \"aliases\": " + aliases + "}";
        var updated = text.Replace(@"""selectedExtensions"": []", $@"""selectedExtensions"": [], {refusals}");

        File.WriteAllText(path, updated);
    }

    const string RefusalScenarioPage = """
        ---
        {
          "type": "scenario",
          "id": "scenario/borrow-copy.borrowing-an-unavailable-copy-refuses",
          "title": "Borrowing an unavailable copy refuses",
          "owner": "lending-team",
          "status": "reviewed",
          "given": "A copy is lent out.",
          "when": "The reader borrows the copy.",
          "result": "result/borrow-copy.copy-unavailable",
          "then": "The copy stays shelved."
        }
        ---

        # Borrowing an unavailable copy refuses

        A reader borrows a copy that is lent out.
        """;

    const string StatusFile = """
        namespace Library.Acceptance.Tests.Strength;

        public sealed class StatusRefusalScenarios
        {
            /// <proves>scenario/borrow-copy.borrowing-an-unavailable-copy-refuses</proves>
            public Task Borrowing_an_unavailable_copy_refuses_with_status() => Runner.RunScenarioAsync(
                given => new RegisterCopySteps().RegisterACopy("copy-1"),
                when => new BorrowCopySteps().BorrowACopy("reader-1", "copy-1"),
                then => new AnswerSteps().the_request_is_refused_with_STATUS(409));
        }
        """;

    const string AliasFile = """
        namespace Library.Acceptance.Tests.Strength;

        public sealed class AliasRefusalScenarios
        {
            /// <proves>scenario/borrow-copy.borrowing-an-unavailable-copy-refuses</proves>
            public Task Borrowing_an_unavailable_copy_refuses_with_client_code() => Runner.RunScenarioAsync(
                given => new RegisterCopySteps().RegisterACopy("copy-1"),
                when => new BorrowCopySteps().BorrowACopy("reader-1", "copy-1"),
                then => new AnswerSteps().the_refusal_names_CODE("COPY_UNAVAILABLE"));
        }
        """;

    const string WrongStatusFile = """
        namespace Library.Acceptance.Tests.Strength;

        public sealed class WrongStatusScenarios
        {
            /// <proves>scenario/borrow-copy.borrowing-an-unavailable-copy-refuses</proves>
            public Task Borrowing_an_unavailable_copy_refuses_with_another_status() => Runner.RunScenarioAsync(
                given => new RegisterCopySteps().RegisterACopy("copy-1"),
                when => new BorrowCopySteps().BorrowACopy("reader-1", "copy-1"),
                then => new AnswerSteps().the_request_is_refused_with_STATUS(403));
        }
        """;

    const string UnmappedFile = """
        namespace Library.Acceptance.Tests.Strength;

        public sealed class UnmappedCodeScenarios
        {
            /// <proves>scenario/borrow-copy.borrowing-an-unavailable-copy-refuses</proves>
            public Task Borrowing_an_unavailable_copy_refuses_with_an_unknown_code() => Runner.RunScenarioAsync(
                given => new RegisterCopySteps().RegisterACopy("copy-1"),
                when => new BorrowCopySteps().BorrowACopy("reader-1", "copy-1"),
                then => new AnswerSteps().the_refusal_names_CODE("SOMETHING_ELSE"));
        }
        """;

    const string StatusMemberFile = """
        namespace Library.Integration.Tests.Strength;

        public sealed class StatusMemberRefusalTests
        {
            /// <proves>scenario/borrow-copy.borrowing-an-unavailable-copy-refuses</proves>
            [Fact]
            public async Task Borrowing_an_unavailable_copy_refuses_with_conflict()
            {
                var command = new BorrowCopyCommand { CopyId = "copy-1" };
                var outcome = await gateway.SendAsync(command);
                Assert.Equal(System.Net.HttpStatusCode.Conflict, outcome.Status);
            }
        }
        """;
}
