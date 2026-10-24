using LiteSpec;
using LiteSpec.Authoring;
using LiteSpec.Tests.Model;
using LiteSpec.Tests.Support;

namespace LiteSpec.Tests.Authoring;

/// <summary>Tests for <c>litespec new result</c> and <c>litespec new scenario</c>.</summary>
public sealed class NewAppendTests
{
    const string UseCase = "use-case/lending.borrow-copy";

    const string OrderedPage = """
        ---
        {
          "type": "use-case",
          "id": "use-case/lending.borrow-copy",
          "title": "Borrow copy",
          "records": [
            {
              "type": "result",
              "id": "result/borrow-copy.borrowed",
              "title": "Borrowed",
              "outcome": "success",
              "meaning": "The copy is lent."
            },
            {
              "type": "result",
              "id": "result/borrow-copy.copy-unavailable",
              "title": "Copy unavailable",
              "outcome": "refusal",
              "code": "lending.copy-not-available",
              "meaning": "The copy is unavailable."
            },
            {
              "type": "scenario",
              "id": "scenario/borrow-copy.borrowing-an-available-copy-succeeds",
              "title": "Borrowing an available copy succeeds",
              "given": "A copy sits available.",
              "when": "The reader borrows the copy.",
              "then": "The loan is active.",
              "result": "result/borrow-copy.borrowed"
            }
          ]
        }
        ---
        # Borrow copy
        """;

    [Fact(DisplayName = "new result appends a refusal after the existing refusals")]
    public void AppendsRefusalAfterExistingRefusals()
    {
        using var fixture = ModelFixture.Prepare("large");
        var page = UseCasePage(fixture.Path);
        var before = File.ReadAllText(page);

        var result = Cli.Run(
            "new", "result", UseCase, "copy-on-loan",
            "--outcome", "refusal", "--code", "lending.copy-on-loan",
            "--root", fixture.Path);

        Assert.Equal(0, result.Status);
        Assert.Contains("Appended result/borrow-copy.copy-on-loan to ", result.Stdout);

        var after = File.ReadAllText(page);
        var inserted = AssertSingleInsertion(before, after, "\"id\": \"result/borrow-copy.copy-on-loan\"");
        Assert.Contains("\"outcome\": \"refusal\"", inserted);
        Assert.Contains("\"code\": \"lending.copy-on-loan\"", inserted);

        var success = after.IndexOf("result/borrow-copy.borrowed", StringComparison.Ordinal);
        var oldRefusal = after.IndexOf("result/borrow-copy.copy-unavailable", StringComparison.Ordinal);
        var added = after.IndexOf("result/borrow-copy.copy-on-loan", StringComparison.Ordinal);
        var scenario = after.IndexOf(
            "scenario/borrow-copy.borrowing-an-available-copy-succeeds", StringComparison.Ordinal);
        Assert.True(0 <= success && success < oldRefusal && oldRefusal < added && added < scenario);
    }

    [Fact(DisplayName = "new result appends a success before the refusals")]
    public void AppendsSuccessBeforeRefusals()
    {
        using var fixture = ModelFixture.Prepare("small");
        var page = UseCasePage(fixture.Path);
        var before = File.ReadAllText(page);

        var result = Cli.Run(
            "new", "result", UseCase, "renewed", "--outcome", "success", "--root", fixture.Path);

        Assert.Equal(0, result.Status);

        var after = File.ReadAllText(page);
        var inserted = AssertSingleInsertion(before, after, "\"id\": \"result/borrow-copy.renewed\"");
        Assert.Contains("\"outcome\": \"success\"", inserted);
        Assert.DoesNotContain("\"code\":", inserted);
        Assert.DoesNotContain("\"codes\":", inserted);

        var success = after.IndexOf("result/borrow-copy.borrowed", StringComparison.Ordinal);
        var added = after.IndexOf("result/borrow-copy.renewed", StringComparison.Ordinal);
        var refusal = after.IndexOf("result/borrow-copy.copy-unavailable", StringComparison.Ordinal);
        Assert.True(0 <= success && success < added && added < refusal);
    }

    [Fact(DisplayName = "new scenario appends last")]
    public void AppendsScenarioLast()
    {
        using var fixture = ModelFixture.Prepare("large");
        var page = UseCasePage(fixture.Path);
        var before = File.ReadAllText(page);

        var result = Cli.Run(
            "new", "scenario", UseCase, "borrowing-a-loaned-copy-is-refused",
            "--result", "result/borrow-copy.copy-unavailable",
            "--root", fixture.Path);

        Assert.Equal(0, result.Status);
        Assert.Contains("Appended scenario/borrow-copy.borrowing-a-loaned-copy-is-refused to ", result.Stdout);

        var after = File.ReadAllText(page);
        var inserted = AssertSingleInsertion(
            before, after, "\"id\": \"scenario/borrow-copy.borrowing-a-loaned-copy-is-refused\"");
        Assert.Contains("\"result\": \"result/borrow-copy.copy-unavailable\"", inserted);

        var oldScenario = after.IndexOf(
            "scenario/borrow-copy.borrowing-an-available-copy-succeeds", StringComparison.Ordinal);
        var added = after.IndexOf(
            "scenario/borrow-copy.borrowing-a-loaned-copy-is-refused", StringComparison.Ordinal);
        Assert.True(0 <= oldScenario && oldScenario < added);
    }

    [Fact(DisplayName = "new result refuses a duplicate id and leaves the page alone")]
    public void RefusesDuplicateId()
    {
        using var fixture = ModelFixture.Prepare("small");
        var page = UseCasePage(fixture.Path);
        var before = File.ReadAllText(page);

        var result = Cli.Run(
            "new", "result", UseCase, "borrowed", "--outcome", "success", "--root", fixture.Path);

        Assert.Equal(2, result.Status);
        Assert.Contains("already taken", result.Output);
        Assert.Equal(before, File.ReadAllText(page));
    }

    [Fact(DisplayName = "new scenario refuses an unknown use case")]
    public void RefusesUnknownUseCase()
    {
        using var fixture = ModelFixture.Prepare("small");

        var result = Cli.Run(
            "new", "scenario", "use-case/lending.no-such-case", "something-happens",
            "--result", "result/borrow-copy.borrowed",
            "--root", fixture.Path);

        Assert.Equal(2, result.Status);
        Assert.Contains("No use case holds 'use-case/lending.no-such-case'", result.Output);
    }

    [Fact(DisplayName = "new help documents the append forms")]
    public void HelpDocumentsAppendForms()
    {
        var result = Cli.Run("new", "--help");

        Assert.Equal(0, result.Status);
        Assert.Contains("new result <use-case-id> <name>", result.Stdout);
        Assert.Contains("new scenario <use-case-id> <name>", result.Stdout);
    }

    [Fact(DisplayName = "new on a page type refuses the append options")]
    public void ScaffoldRefusesAppendOptions()
    {
        var result = Cli.Run("new", "use-case", "lending.borrow-copy", "--code", "lending.x");

        Assert.Equal(2, result.Status);
        Assert.Contains("Option --code applies only to new result and new scenario", result.Output);
    }

    [Theory(DisplayName = "titles derive from kebab names")]
    [InlineData("borrowed", "Borrowed")]
    [InlineData("copy-unavailable", "Copy unavailable")]
    [InlineData("borrowing-an-available-copy-succeeds", "Borrowing an available copy succeeds")]
    public void TitlesDeriveFromNames(string name, string title) =>
        Assert.Equal(title, AppendEntry.TitleFrom(name));

    [Fact(DisplayName = "insert places a refusal after the existing refusals")]
    public void InsertPlacesRefusalAfterRefusals()
    {
        var updated = AppendEntry.Insert(
            OrderedPage,
            AppendEntry.Placement.Refusal,
            [
                "\"type\": \"result\"",
                "\"id\": \"result/borrow-copy.copy-on-loan\"",
                "\"title\": \"Copy on loan\"",
                "\"outcome\": \"refusal\"",
                "\"code\": \"lending.copy-on-loan\"",
                "\"meaning\": \"<The observable result in one sentence>\"",
            ],
            out var error);

        AssertInserts(
            OrderedPage,
            updated,
            error,
            string.Join("\n",
            [
                "    {",
                "      \"type\": \"result\",",
                "      \"id\": \"result/borrow-copy.copy-on-loan\",",
                "      \"title\": \"Copy on loan\",",
                "      \"outcome\": \"refusal\",",
                "      \"code\": \"lending.copy-on-loan\",",
                "      \"meaning\": \"<The observable result in one sentence>\"",
                "    },",
            ]) + "\n");
    }

    [Fact(DisplayName = "insert places a success before the refusals")]
    public void InsertPlacesSuccessBeforeRefusals()
    {
        var updated = AppendEntry.Insert(
            OrderedPage,
            AppendEntry.Placement.Success,
            [
                "\"type\": \"result\"",
                "\"id\": \"result/borrow-copy.renewed\"",
                "\"title\": \"Renewed\"",
                "\"outcome\": \"success\"",
                "\"meaning\": \"<The observable result in one sentence>\"",
            ],
            out var error);

        AssertInserts(
            OrderedPage,
            updated,
            error,
            string.Join("\n",
            [
                "    {",
                "      \"type\": \"result\",",
                "      \"id\": \"result/borrow-copy.renewed\",",
                "      \"title\": \"Renewed\",",
                "      \"outcome\": \"success\",",
                "      \"meaning\": \"<The observable result in one sentence>\"",
                "    },",
            ]) + "\n");
    }

    [Fact(DisplayName = "insert appends a scenario last")]
    public void InsertAppendsScenarioLast()
    {
        var updated = AppendEntry.Insert(
            OrderedPage,
            AppendEntry.Placement.Scenario,
            [
                "\"type\": \"scenario\"",
                "\"id\": \"scenario/borrow-copy.borrowing-a-loaned-copy-is-refused\"",
                "\"title\": \"Borrowing a loaned copy is refused\"",
                "\"given\": \"<The starting state>\"",
                "\"when\": \"<What the actor does>\"",
                "\"then\": \"<The observable result>\"",
                "\"result\": \"result/borrow-copy.copy-unavailable\"",
            ],
            out var error);

        AssertInserts(
            OrderedPage,
            updated,
            error,
            ",\n" + string.Join("\n",
            [
                "    {",
                "      \"type\": \"scenario\",",
                "      \"id\": \"scenario/borrow-copy.borrowing-a-loaned-copy-is-refused\",",
                "      \"title\": \"Borrowing a loaned copy is refused\",",
                "      \"given\": \"<The starting state>\",",
                "      \"when\": \"<What the actor does>\",",
                "      \"then\": \"<The observable result>\",",
                "      \"result\": \"result/borrow-copy.copy-unavailable\"",
                "    }",
            ]));
    }

    [Fact(DisplayName = "insert keeps carriage returns")]
    public void InsertKeepsCarriageReturns()
    {
        var page = OrderedPage.Replace("\n", "\r\n", StringComparison.Ordinal);

        var updated = AppendEntry.Insert(
            page,
            AppendEntry.Placement.Refusal,
            [
                "\"type\": \"result\"",
                "\"id\": \"result/borrow-copy.copy-on-loan\"",
                "\"title\": \"Copy on loan\"",
                "\"outcome\": \"refusal\"",
                "\"code\": \"lending.copy-on-loan\"",
                "\"meaning\": \"<The observable result in one sentence>\"",
            ],
            out var error);

        AssertInserts(
            page,
            updated,
            error,
            string.Join("\r\n",
            [
                "    {",
                "      \"type\": \"result\",",
                "      \"id\": \"result/borrow-copy.copy-on-loan\",",
                "      \"title\": \"Copy on loan\",",
                "      \"outcome\": \"refusal\",",
                "      \"code\": \"lending.copy-on-loan\",",
                "      \"meaning\": \"<The observable result in one sentence>\"",
                "    },",
            ]) + "\r\n");

        Assert.DoesNotContain("\n", updated!.Replace("\r\n", "", StringComparison.Ordinal));
    }

    [Fact(DisplayName = "insert fills an empty records array")]
    public void InsertFillsEmptyRecords()
    {
        const string page = """
            ---
            {
              "type": "use-case",
              "id": "use-case/lending.borrow-copy",
              "title": "Borrow copy",
              "records": []
            }
            ---
            # Borrow copy
            """;

        var updated = AppendEntry.Insert(
            page,
            AppendEntry.Placement.Success,
            [
                "\"type\": \"result\"",
                "\"id\": \"result/borrow-copy.borrowed\"",
                "\"title\": \"Borrowed\"",
                "\"outcome\": \"success\"",
                "\"meaning\": \"<The observable result in one sentence>\"",
            ],
            out var error);

        AssertInserts(
            page,
            updated,
            error,
            "\n" + string.Join("\n",
            [
                "    {",
                "      \"type\": \"result\",",
                "      \"id\": \"result/borrow-copy.borrowed\",",
                "      \"title\": \"Borrowed\",",
                "      \"outcome\": \"success\",",
                "      \"meaning\": \"<The observable result in one sentence>\"",
                "    }",
            ]) + "\n  ");
    }

    [Fact(DisplayName = "insert writes a missing records array")]
    public void InsertWritesMissingRecords()
    {
        const string page = """
            ---
            {
              "type": "use-case",
              "id": "use-case/lending.borrow-copy",
              "title": "Borrow copy"
            }
            ---
            # Borrow copy
            """;
        const string expected = """
            ---
            {
              "type": "use-case",
              "id": "use-case/lending.borrow-copy",
              "title": "Borrow copy",
              "records": [
                {
                  "type": "result",
                  "id": "result/borrow-copy.borrowed",
                  "title": "Borrowed",
                  "outcome": "success",
                  "meaning": "<The observable result in one sentence>"
                }
              ]
            }
            ---
            # Borrow copy
            """;

        var updated = AppendEntry.Insert(
            page,
            AppendEntry.Placement.Success,
            [
                "\"type\": \"result\"",
                "\"id\": \"result/borrow-copy.borrowed\"",
                "\"title\": \"Borrowed\"",
                "\"outcome\": \"success\"",
                "\"meaning\": \"<The observable result in one sentence>\"",
            ],
            out var error);

        Assert.True(error == "", error);
        Assert.Equal(expected, updated);
    }

    [Fact(DisplayName = "insert refuses a records field that is not an array")]
    public void InsertRefusesNonArrayRecords()
    {
        const string page = """
            ---
            {
              "type": "use-case",
              "id": "use-case/lending.borrow-copy",
              "title": "Borrow copy",
              "records": {}
            }
            ---
            # Borrow copy
            """;

        var updated = AppendEntry.Insert(page, AppendEntry.Placement.Success, [], out var error);

        Assert.Null(updated);
        Assert.Contains("not an array", error);
    }

    [Fact(DisplayName = "insert refuses a page without frontmatter")]
    public void InsertRefusesMissingFrontmatter()
    {
        var updated = AppendEntry.Insert("# Just prose\n", AppendEntry.Placement.Success, [], out var error);

        Assert.Null(updated);
        Assert.Contains("no frontmatter", error);
    }

    [Fact(DisplayName = "run writes a result through the model lookup")]
    public void RunWritesResult()
    {
        using var consumer = Consumer(OrderedPage);

        var status = Append(
            consumer,
            "result", UseCase, "copy-on-loan",
            "--outcome", "refusal", "--code", "lending.copy-on-loan");

        Assert.Equal(0, status);

        var after = File.ReadAllText(UseCasePage(consumer.Path));
        Assert.Contains("\"id\": \"result/borrow-copy.copy-on-loan\"", after);
        Assert.Contains("\"title\": \"Copy on loan\"", after);
    }

    [Fact(DisplayName = "run accepts the use case as home and name")]
    public void RunAcceptsBareUseCaseName()
    {
        using var consumer = Consumer(OrderedPage);

        var status = Append(consumer, "result", "lending.borrow-copy", "renewed", "--outcome", "success");

        Assert.Equal(0, status);
        Assert.Contains("\"id\": \"result/borrow-copy.renewed\"", File.ReadAllText(UseCasePage(consumer.Path)));
    }

    [Fact(DisplayName = "run accepts a derived result reference")]
    public void RunAcceptsDerivedResultRef()
    {
        using var consumer = Consumer(OrderedPage);

        var status = Append(
            consumer,
            "scenario", UseCase, "borrowing-without-a-grant-is-refused",
            "--result", "result/lending.borrow-copy.forbidden");

        Assert.Equal(0, status);
        Assert.Contains(
            "\"result\": \"result/lending.borrow-copy.forbidden\"",
            File.ReadAllText(UseCasePage(consumer.Path)));
    }

    [Fact(DisplayName = "run carries a success code as codes")]
    public void RunCarriesSuccessCodeAsCodes()
    {
        using var consumer = Consumer(OrderedPage);
        var before = File.ReadAllText(UseCasePage(consumer.Path));

        var status = Append(
            consumer, "result", UseCase, "renewed", "--outcome", "success", "--code", "lending.renewed");

        Assert.Equal(0, status);

        var after = File.ReadAllText(UseCasePage(consumer.Path));
        Assert.Contains("\"codes\": [\"lending.renewed\"]", after);
        Assert.Equal(CountOccurrences(before, "\"code\":"), CountOccurrences(after, "\"code\":"));
    }

    public static TheoryData<string[]> RejectedArgs() => new()
    {
        { ["result", UseCase, "copy-on-loan"] },
        { ["result", UseCase, "copy-on-loan", "--outcome", "maybe", "--code", "lending.x"] },
        { ["result", UseCase, "copy-on-loan", "--outcome", "refusal"] },
        { ["result", UseCase, "copy-on-loan", "--outcome", "refusal", "--code", "lending"] },
        { ["result", UseCase, "copy-on-loan", "--outcome", "refusal", "--code", "Lending.x"] },
        { ["result", UseCase, "copy-on-loan", "--outcome", "success", "--result", "result/borrow-copy.borrowed"] },
        { ["scenario", UseCase, "something-happens"] },
        { ["scenario", UseCase, "something-happens", "--result", "banana"] },
        { ["scenario", UseCase, "something-happens", "--result", "scenario/borrow-copy.x"] },
        { ["scenario", UseCase, "something-happens", "--result", "result/borrow-copy.borrowed", "--code", "lending.x"] },
        { ["scenario", UseCase, "something-happens", "--result", "result/borrow-copy.borrowed", "--outcome", "success"] },
        { ["result", UseCase, "Bad_Name", "--outcome", "success"] },
        { ["result", UseCase, "123", "--outcome", "success"] },
        { ["result", UseCase, "a-b-c-d-e-f-g", "--outcome", "success"] },
        { ["result", "lending", "copy-on-loan", "--outcome", "refusal", "--code", "lending.x"] },
        { ["result", "reaction/sales.notify", "copy-on-loan", "--outcome", "refusal", "--code", "lending.x"] },
        { ["result", "use-case/lending.no-such-case", "copy-on-loan", "--outcome", "refusal", "--code", "lending.x"] },
        { ["result", UseCase, "borrowed", "--outcome", "success"] },
        { ["result", UseCase] },
    };

    [Theory(DisplayName = "run refuses invalid appends and leaves the page alone")]
    [MemberData(nameof(RejectedArgs))]
    public void RunRefusesInvalidAppends(string[] args)
    {
        using var consumer = Consumer(OrderedPage);
        var before = File.ReadAllText(UseCasePage(consumer.Path));

        Assert.Equal(2, Append(consumer, args));
        Assert.Equal(before, File.ReadAllText(UseCasePage(consumer.Path)));
    }

    /// <summary>The use-case page of the fixture or consumer.</summary>
    static string UseCasePage(string root) =>
        Path.Combine(root, "docs", "behavior", "modules", "lending", "loans", "borrow-copy.md");

    /// <summary>A minimal consumer holding one use-case page.</summary>
    static TempFolder Consumer(string pageText)
    {
        var temp = Cli.Temp("new-append");
        File.WriteAllText(Path.Combine(temp.Path, "litespec.project.json"), "{}");
        var folder = Path.Combine(temp.Path, "docs", "behavior", "modules", "lending", "loans");
        Directory.CreateDirectory(folder);
        File.WriteAllText(Path.Combine(folder, "borrow-copy.md"), pageText);
        return temp;
    }

    /// <summary>Runs the append path in process against the consumer.</summary>
    static int Append(TempFolder consumer, params string[] args)
    {
        var parsed = CliArgs.Parse(
            [.. args, "--root", consumer.Path],
            [],
            ["--root", "--home", "--code", "--outcome", "--result"],
            maxPositionals: 3);
        Assert.Null(parsed.Error);
        return AppendEntry.Run(parsed);
    }

    /// <summary>Proves the page grew by one contiguous insertion holding the new entry.</summary>
    static string AssertSingleInsertion(string before, string after, string marker)
    {
        // Lines, not characters: a new entry shares its opening lines with its neighbour,
        // and a character scan would cut the insertion mid-line.
        var old = before.Split('\n');
        var grown = after.Split('\n');
        var prefix = 0;

        while (prefix < old.Length && prefix < grown.Length && old[prefix] == grown[prefix])
        {
            prefix++;
        }

        var suffix = 0;

        while (suffix < old.Length - prefix && suffix < grown.Length - prefix
            && old[old.Length - 1 - suffix] == grown[grown.Length - 1 - suffix])
        {
            suffix++;
        }

        Assert.Equal(old.Length, prefix + suffix);

        var inserted = string.Join('\n', grown[prefix..(grown.Length - suffix)]);
        Assert.Contains(marker, inserted);

        return inserted;
    }

    /// <summary>Proves the insertion is exactly the expected text and nothing else changed.</summary>
    static void AssertInserts(string before, string? updated, string error, string inserted)
    {
        Assert.True(error == "", error);
        Assert.NotNull(updated);
        Assert.Equal(
            updated!.IndexOf(inserted, StringComparison.Ordinal),
            updated!.LastIndexOf(inserted, StringComparison.Ordinal));
        Assert.Equal(before, updated!.Replace(inserted, "", StringComparison.Ordinal));
    }

    /// <summary>Counts the needle's occurrences in the text.</summary>
    static int CountOccurrences(string text, string needle)
    {
        var count = 0;
        var index = 0;

        while ((index = text.IndexOf(needle, index, StringComparison.Ordinal)) >= 0)
        {
            count++;
            index += needle.Length;
        }

        return count;
    }
}
