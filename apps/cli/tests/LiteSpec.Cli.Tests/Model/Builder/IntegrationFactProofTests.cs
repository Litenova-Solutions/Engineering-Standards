using System.Text.Json;
using LiteSpec.Tests.Model;
using LiteSpec.Tests.Support;

namespace LiteSpec.Tests.Model.Builder;

/// <summary>Proves an integration fact confirms a rule or a scenario from inside the host.</summary>
public sealed class IntegrationFactProofTests
{
    /// <summary>A fact resolving a service and sending a governed message confirms its rule claim.</summary>
    [Fact]
    public void Rule_Fact_Sending_A_Governed_Message_Confirms()
    {
        using var temp = ModelFixture.Prepare("small");
        Write(temp.Path, "apps/api/tests/Library.Integration.Tests/Strength/RuleMessageFactTests.cs", RuleMessageFile);

        using var document = Build(temp.Path);

        Assert.True(ProvesLink(document.RootElement, "rule/loan.has-one-borrower").GetProperty("confirmed").GetBoolean());
    }

    /// <summary>A fact working the governed aggregate's store confirms its rule claim.</summary>
    [Fact]
    public void Rule_Fact_Working_The_Governed_Store_Confirms()
    {
        using var temp = ModelFixture.Prepare("small");
        Write(temp.Path, "apps/api/tests/Library.Integration.Tests/Strength/RuleStoreFactTests.cs", RuleStoreFile);

        using var document = Build(temp.Path);

        Assert.True(ProvesLink(document.RootElement, "rule/lending.copy-barcode-unique").GetProperty("confirmed").GetBoolean());
    }

    /// <summary>A fact calling the governed aggregate confirms its rule claim.</summary>
    [Fact]
    public void Rule_Fact_Calling_The_Governed_Aggregate_Confirms()
    {
        using var temp = ModelFixture.Prepare("small");
        Write(temp.Path, "apps/api/tests/Library.Integration.Tests/Strength/RuleStaticFactTests.cs", RuleStaticFile);

        using var document = Build(temp.Path);

        Assert.True(ProvesLink(document.RootElement, "rule/lending.copy-barcode-unique").GetProperty("confirmed").GetBoolean());
    }

    /// <summary>A fact that acts without asserting confirms no rule claim.</summary>
    [Fact]
    public void Rule_Fact_Without_An_Assertion_Does_Not_Confirm()
    {
        using var temp = ModelFixture.Prepare("small");
        Write(temp.Path, "apps/api/tests/Library.Integration.Tests/Strength/RuleSilentFactTests.cs", RuleSilentFile);

        using var document = Build(temp.Path);

        Assert.False(ProvesLink(document.RootElement, "rule/loan.has-one-borrower").GetProperty("confirmed").GetBoolean());
    }

    /// <summary>A fact pinning the message type with typeof confirms its scenario claim.</summary>
    [Fact]
    public void Scenario_Fact_Pinning_The_Message_Type_Confirms()
    {
        using var temp = ModelFixture.Prepare("small");
        Write(temp.Path, "docs/behavior/modules/lending/loans/success-scenario.md", SuccessScenarioPage);
        Write(temp.Path, "apps/api/tests/Library.Integration.Tests/Strength/TypeofFactTests.cs", TypeofFile);

        using var document = Build(temp.Path);

        Assert.True(ProvesLink(document.RootElement, "scenario/borrow-copy.borrowing-an-available-copy-succeeds").GetProperty("confirmed").GetBoolean());
    }

    /// <summary>A nested value sharing an aggregate's name does not read as constructing it.</summary>
    [Fact]
    public void Scenario_Fact_Building_A_Nested_Value_Confirms()
    {
        using var temp = ModelFixture.Prepare("small");
        Write(temp.Path, "docs/behavior/modules/lending/loans/success-scenario.md", SuccessScenarioPage);
        Write(temp.Path, "apps/api/tests/Library.Integration.Tests/Strength/NestedValueFactTests.cs", NestedFile);

        using var document = Build(temp.Path);

        Assert.True(ProvesLink(document.RootElement, "scenario/borrow-copy.borrowing-an-available-copy-succeeds").GetProperty("confirmed").GetBoolean());
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

    const string SuccessScenarioPage = """
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

    const string RuleMessageFile = """
        namespace Library.Integration.Tests.Strength;

        public sealed class RuleMessageFactTests(TestApi api)
        {
            /// <proves>rule/loan.has-one-borrower</proves>
            [Fact]
            public async Task A_loan_keeps_its_single_borrower()
            {
                await using var scope = api.Services.CreateAsyncScope();
                var commands = scope.ServiceProvider.GetRequiredService<ICommandMediator>();
                var outcome = await commands.SendAsync(new BorrowCopyCommand { CopyId = "copy-1" });
                Assert.NotNull(outcome);
            }
        }
        """;

    const string RuleStoreFile = """
        namespace Library.Integration.Tests.Strength;

        public sealed class RuleStoreFactTests(TestApi api)
        {
            /// <proves>rule/lending.copy-barcode-unique</proves>
            [Fact]
            public async Task Barcodes_stay_unique()
            {
                await using var scope = api.Services.CreateAsyncScope();
                var copies = scope.ServiceProvider.GetRequiredService<ICopyRepository>();
                var found = await copies.FindByBarcodeAsync("barcode-1");
                Assert.NotNull(found);
            }
        }
        """;

    const string RuleStaticFile = """
        namespace Library.Integration.Tests.Strength;

        public sealed class RuleStaticFactTests(TestApi api)
        {
            /// <proves>rule/lending.copy-barcode-unique</proves>
            [Fact]
            public async Task Registering_a_copy_keeps_its_barcode()
            {
                await using var scope = api.Services.CreateAsyncScope();
                var commands = scope.ServiceProvider.GetRequiredService<ICommandMediator>();
                var copy = Copy.Register("barcode-1");
                Assert.NotNull(copy);
            }
        }
        """;

    const string RuleSilentFile = """
        namespace Library.Integration.Tests.Strength;

        public sealed class RuleSilentFactTests(TestApi api)
        {
            /// <proves>rule/loan.has-one-borrower</proves>
            [Fact]
            public async Task Acting_without_asserting()
            {
                await using var scope = api.Services.CreateAsyncScope();
                var commands = scope.ServiceProvider.GetRequiredService<ICommandMediator>();
                await commands.SendAsync(new BorrowCopyCommand { CopyId = "copy-1" });
            }
        }
        """;

    const string TypeofFile = """
        namespace Library.Integration.Tests.Strength;

        public sealed class TypeofFactTests(TestApi api)
        {
            /// <proves>scenario/borrow-copy.borrowing-an-available-copy-succeeds</proves>
            [Fact]
            public async Task Borrowing_through_the_host()
            {
                _ = typeof(BorrowCopyCommand);
                await using var scope = api.Services.CreateAsyncScope();
                var session = scope.ServiceProvider.GetRequiredService<ISession>();
                var outcome = await session.ApplyAsync();
                Assert.NotNull(outcome);
            }
        }
        """;

    const string NestedFile = """
        namespace Library.Integration.Tests.Strength;

        public sealed class NestedValueFactTests
        {
            /// <proves>scenario/borrow-copy.borrowing-an-available-copy-succeeds</proves>
            [Fact]
            public async Task Borrowing_beside_a_nested_value()
            {
                var command = new BorrowCopyCommand { CopyId = "copy-1" };
                var lookup = new LoanLookup.Loan("loan-1");
                var outcome = await gateway.SendAsync(command);
                Assert.NotNull(outcome);
            }
        }
        """;
}
