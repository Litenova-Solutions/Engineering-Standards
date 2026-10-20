using System.Text.Json.Nodes;

namespace LiteSpec.Tests.Ui;

/// <summary>
/// The design contract, pattern catalog and pattern citation cases.
/// </summary>
public sealed partial class UiValidatorTests
{
    // Design contract (litespec/frontend/ui#publish-a-design-contract,
    // litespec/frontend/ui#declare-a-closed-floorplan-set).

    [Fact]
    public void Shared_Package_With_No_Design_Contract()
    {
        using var fixture = UiFixture.Create();
        File.Delete(fixture.DesignFile);
        UiFixture.AssertProblem(fixture.Run(), "no design contract at");
    }

    [Fact]
    public void Design_Contract_Missing_A_Required_Section()
    {
        using var fixture = UiFixture.Create();
        File.WriteAllText(fixture.DesignFile,
            File.ReadAllText(fixture.DesignFile).Replace("## Motion", "## Movement", StringComparison.Ordinal));
        UiFixture.AssertProblem(fixture.Run(), "missing required section 'Motion'");
    }

    [Fact]
    public void Design_Contract_Naming_Another_Package()
    {
        using var fixture = UiFixture.Create();
        File.WriteAllText(fixture.DesignFile,
            File.ReadAllText(fixture.DesignFile).Replace("\"package\": \"@fixture/ui\"", "\"package\": \"@other/ui\"", StringComparison.Ordinal));
        UiFixture.AssertProblem(fixture.Run(), "package must be '@fixture/ui'");
    }

    [Fact]
    public void Design_Contract_Naming_No_Floorplan()
    {
        using var fixture = UiFixture.Create();
        File.WriteAllText(fixture.DesignFile,
            File.ReadAllText(fixture.DesignFile).Replace("\"patterns\": [\"list-page\", \"entity-page\"]", "\"patterns\": []", StringComparison.Ordinal));
        UiFixture.AssertProblem(fixture.Run(), "array has fewer than 1 items");
    }

    [Fact]
    public void The_Shipped_Design_Contract_Is_Accepted()
    {
        using var fixture = UiFixture.Create();
        UiFixture.AssertClean(fixture.Run());
    }

    // Pattern catalog (litespec/frontend/patterns#keep-one-pattern-catalog,
    // litespec/frontend/patterns#record-every-option-considered,
    // litespec/frontend/patterns#declare-the-compact-behavior,
    // litespec/frontend/web/patterns#implement-a-chosen-pattern-once,
    // litespec/frontend/patterns#state-the-implementation-status).

    [Fact]
    public void The_Shipped_Pattern_Catalog_Is_Accepted()
    {
        using var fixture = UiFixture.Create();
        UiFixture.AssertClean(fixture.Run());
    }

    [Fact]
    public void A_Workspace_With_No_Pattern_Catalog()
    {
        using var fixture = UiFixture.Create();
        fixture.MutateProject(project => ((JsonObject)project["paths"]!).Remove("uiPatterns"));
        UiFixture.AssertClean(fixture.Run());
    }

    [Fact]
    public void A_Declared_Pattern_Catalog_That_Is_Missing()
    {
        using var fixture = UiFixture.Create();
        File.Delete(fixture.CatalogFile);
        UiFixture.AssertProblem(fixture.Run(), "no catalog at 'docs/ui/pattern-catalog.json'");
    }

    [Fact]
    public void A_Catalog_That_Breaks_The_Schema()
    {
        using var fixture = UiFixture.Create();
        fixture.MutateCatalog(catalog =>
        {
            var patterns = (JsonArray)catalog["patterns"]!;
            ((JsonArray)((JsonObject)patterns[0]!)["options"]!).RemoveAt(1);
        });
        UiFixture.AssertProblem(fixture.Run(), "array has fewer than 2 items");
    }

    [Fact]
    public void A_Decision_Naming_No_Recorded_Option()
    {
        using var fixture = UiFixture.Create();
        fixture.MutateCatalog(catalog =>
        {
            var patterns = (JsonArray)catalog["patterns"]!;
            ((JsonObject)((JsonObject)patterns[0]!)["decision"]!)["option"] = "no-such-option";
        });
        UiFixture.AssertProblem(
            fixture.Run(),
            "pattern 'orders-list-page': decision.option 'no-such-option' is not one of its options");
    }

    [Fact]
    public void A_Compact_Variant_Naming_No_Recorded_Option()
    {
        using var fixture = UiFixture.Create();
        fixture.MutateCatalog(catalog =>
        {
            var patterns = (JsonArray)catalog["patterns"]!;
            ((JsonObject)((JsonObject)patterns[1]!)["compact"]!)["option"] = "no-such-option";
        });
        UiFixture.AssertProblem(
            fixture.Run(),
            "pattern 'table-sorting': compact.option 'no-such-option' is not one of its options");
    }

    [Fact]
    public void An_Extension_Naming_No_Recorded_Option()
    {
        using var fixture = UiFixture.Create();
        fixture.MutateCatalog(catalog =>
        {
            var patterns = (JsonArray)catalog["patterns"]!;
            ((JsonObject)((JsonArray)((JsonObject)patterns[0]!)["extensions"]!)[0]!)["option"] = "no-such-option";
        });
        UiFixture.AssertProblem(
            fixture.Run(),
            "pattern 'orders-list-page': extensions[0].option 'no-such-option' is not one of its options");
    }

    [Fact]
    public void A_Compact_Variant_Naming_No_Breakpoint()
    {
        using var fixture = UiFixture.Create();
        fixture.MutateCatalog(catalog =>
        {
            var patterns = (JsonArray)catalog["patterns"]!;
            ((JsonObject)((JsonObject)patterns[0]!)["compact"]!)["breakpoint"] = "no-such-breakpoint";
        });
        UiFixture.AssertProblem(
            fixture.Run(),
            "pattern 'orders-list-page': compact.breakpoint 'no-such-breakpoint' is not a key of breakpoints");
    }

    [Fact]
    public void A_Pattern_Naming_No_Catalog_Group()
    {
        using var fixture = UiFixture.Create();
        fixture.MutateCatalog(catalog =>
        {
            var patterns = (JsonArray)catalog["patterns"]!;
            ((JsonObject)patterns[0]!)["group"] = "no-such-group";
        });
        UiFixture.AssertProblem(
            fixture.Run(),
            "pattern 'orders-list-page': group 'no-such-group' is not one of the catalog groups");
    }

    [Fact]
    public void A_Component_Path_That_Does_Not_Exist()
    {
        using var fixture = UiFixture.Create();
        fixture.MutateCatalog(catalog =>
        {
            var patterns = (JsonArray)catalog["patterns"]!;
            var implementations = (JsonObject)((JsonObject)patterns[0]!)["implementations"]!;
            ((JsonObject)implementations["react"]!)["components"] =
                new JsonArray("packages/ui/src/floorplans/no-such.tsx");
        });
        UiFixture.AssertProblem(
            fixture.Run(),
            "pattern 'orders-list-page': implementations.react.components[0] does not exist 'packages/ui/src/floorplans/no-such.tsx'");
    }

    [Fact]
    public void An_Adopted_Status_With_No_Components()
    {
        using var fixture = UiFixture.Create();
        fixture.MutateCatalog(catalog =>
        {
            var patterns = (JsonArray)catalog["patterns"]!;
            var implementations = (JsonObject)((JsonObject)patterns[0]!)["implementations"]!;
            ((JsonObject)implementations["react"]!).Remove("components");
        });
        UiFixture.AssertProblem(
            fixture.Run(),
            "pattern 'orders-list-page': implementations.react has status 'adopted' with no components");
    }

    [Fact]
    public void A_Partial_Status_With_No_Gap()
    {
        using var fixture = UiFixture.Create();
        fixture.MutateCatalog(catalog =>
        {
            var patterns = (JsonArray)catalog["patterns"]!;
            ((JsonObject)((JsonObject)patterns[0]!)["implementations"]!)["react"] =
                new JsonObject { ["status"] = "partial" };
        });
        UiFixture.AssertProblem(
            fixture.Run(),
            "pattern 'orders-list-page': implementations.react has status 'partial' with no gap");
    }

    [Fact]
    public void A_Pending_Status_With_No_Gap()
    {
        using var fixture = UiFixture.Create();
        fixture.MutateCatalog(catalog =>
        {
            var patterns = (JsonArray)catalog["patterns"]!;
            ((JsonObject)((JsonObject)patterns[0]!)["implementations"]!)["react"] =
                new JsonObject { ["status"] = "pending" };
        });
        UiFixture.AssertProblem(
            fixture.Run(),
            "pattern 'orders-list-page': implementations.react has status 'pending' with no gap");
    }

    [Fact]
    public void Two_Patterns_Sharing_One_Id()
    {
        using var fixture = UiFixture.Create();
        fixture.MutateCatalog(catalog =>
        {
            var patterns = (JsonArray)catalog["patterns"]!;
            ((JsonObject)patterns[1]!)["id"] = ((JsonObject)patterns[0]!)["id"]!.GetValue<string>();
        });
        UiFixture.AssertProblem(fixture.Run(), "duplicate pattern id 'orders-list-page'");
    }

    [Fact]
    public void Two_Options_Sharing_One_Id()
    {
        using var fixture = UiFixture.Create();
        fixture.MutateCatalog(catalog =>
        {
            var patterns = (JsonArray)catalog["patterns"]!;
            var options = (JsonArray)((JsonObject)patterns[0]!)["options"]!;
            ((JsonObject)options[1]!)["id"] = ((JsonObject)options[0]!)["id"]!.GetValue<string>();
        });
        UiFixture.AssertProblem(
            fixture.Run(),
            "pattern 'orders-list-page' has a duplicate option id 'filter-table'");
    }

    // Pattern library citations (litespec/frontend/patterns#keep-one-pattern-catalog).

    [Fact]
    public void The_Fixture_Validator_Accepts_The_Shipped_Catalog()
    {
        using var fixture = UiFixture.Create();
        UiFixture.AssertClean(fixture.RunWithFixtureHome());
    }

    [Fact]
    public void A_Pattern_Citing_The_LiteSpec_Pattern_It_Matches()
    {
        using var fixture = UiFixture.Create();
        fixture.MutateCatalog(catalog =>
        {
            var patterns = (JsonArray)catalog["patterns"]!;
            var pattern = (JsonObject)patterns[0]!;
            pattern["library"] = "litespec/frontend/patterns/page-frames#record-list";
            ((JsonArray)pattern["options"]!).Add(new JsonObject
            {
                ["id"] = "fixture-only",
                ["name"] = "Fixture only",
                ["rationale"] = "A product-owned option beside the library ones.",
                ["cost"] = "Maintained by the product.",
            });
        });
        UiFixture.AssertClean(fixture.RunWithFixtureHome());
    }

    [Fact]
    public void A_Pattern_Citing_A_Pattern_No_Page_Holds()
    {
        using var fixture = UiFixture.Create();
        fixture.MutateCatalog(catalog =>
        {
            var patterns = (JsonArray)catalog["patterns"]!;
            ((JsonObject)patterns[0]!)["library"] = "litespec/frontend/patterns/page-frames#no-such-pattern";
        });
        UiFixture.AssertProblem(
            fixture.RunWithFixtureHome(),
            "pattern 'orders-list-page': library 'litespec/frontend/patterns/page-frames#no-such-pattern' is not a pattern on a LiteSpec pattern page");
    }

    [Fact]
    public void A_Pattern_Renaming_A_LiteSpec_Option()
    {
        using var fixture = UiFixture.Create();
        fixture.MutateCatalog(catalog =>
        {
            var patterns = (JsonArray)catalog["patterns"]!;
            var pattern = (JsonObject)patterns[0]!;
            pattern["library"] = "litespec/frontend/patterns/page-frames#record-list";
            ((JsonObject)((JsonArray)pattern["options"]!)[0]!)["name"] = "Renamed table";
        });
        UiFixture.AssertProblem(
            fixture.RunWithFixtureHome(),
            "pattern 'orders-list-page': options[0].name 'Renamed table' does not match the LiteSpec pattern option 'filter-table' name 'Filterable table'");
    }
}
