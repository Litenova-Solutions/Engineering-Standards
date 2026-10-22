using System.Text.Json.Nodes;

namespace LiteSpec.Tests.Ui;

/// <summary>
/// The Svelte source and Svelte baseline cases.
/// </summary>
public sealed partial class UiValidatorTests
{
    // Svelte sources (litespec/frontend/web/ui#restrict-css-decisions).

    [Fact]
    public void A_Svelte_File_Is_Scanned_For_Utility_Violations()
    {
        using var fixture = UiFixture.Create();
        UiFixture.AssertProblem(
            fixture.PathCase(
                "packages/ui/src/floorplans/card.svelte",
                "<div class=\"text-red-500\">Overdue</div>\n"),
            "raw Tailwind palette value requires a semantic token 'text-red-500'");
    }

    [Fact]
    public void A_Svelte_Visual_File_Keeps_Its_Own_Layout()
    {
        using var fixture = UiFixture.Create();
        UiFixture.AssertClean(fixture.PathCase(
            "apps/web/src/modules/seat-map/seat-map.visual.svelte",
            "<div class=\"grid\">Map</div>\n"));
    }

    [Fact]
    public void A_Svelte_Visual_File_Is_Still_Held_To_The_Token_Rule()
    {
        using var fixture = UiFixture.Create();
        UiFixture.AssertProblem(
            fixture.PathCase(
                "apps/web/src/modules/seat-map/other.visual.svelte",
                "<div class=\"bg-red-500\">Map</div>\n"),
            "raw Tailwind palette value requires a semantic token 'bg-red-500'");
    }

    [Fact]
    public void A_Svelte_Class_Directive_Is_Read_As_One_Token()
    {
        using var fixture = UiFixture.Create();
        UiFixture.AssertClean(fixture.PathCase(
            "apps/web/src/modules/orders/toggle.svelte",
            "<button class:hidden={closed}>Hide</button>\n"));
    }

    [Fact]
    public void A_Svelte_Style_Attribute_Is_An_Inline_Style()
    {
        using var fixture = UiFixture.Create();
        UiFixture.AssertProblem(
            fixture.PathCase(
                "apps/web/src/modules/orders/styled.svelte",
                "<div style=\"color: red\">Overdue</div>\n"),
            "an inline style belongs in a shared component");
    }

    [Fact]
    public void A_Svelte_Style_Directive_Is_An_Inline_Style()
    {
        using var fixture = UiFixture.Create();
        UiFixture.AssertProblem(
            fixture.PathCase(
                "apps/web/src/modules/orders/styled-directive.svelte",
                "<div style:color={ink}>Overdue</div>\n"),
            "an inline style belongs in a shared component");
    }

    [Fact]
    public void A_Svelte_Style_Block_Is_Not_An_Inline_Style()
    {
        using var fixture = UiFixture.Create();
        UiFixture.AssertClean(fixture.PathCase(
            "apps/web/src/modules/orders/scoped.svelte",
            "<style>\n  .scoped {\n    color: red;\n  }\n</style>\n<div class=\"scoped\">Overdue</div>\n"));
    }

    [Fact]
    public void Second_Svelte_Visual_System_In_The_Workspace_Root()
    {
        using var fixture = UiFixture.Create();
        fixture.WriteManifest("dependencies", new JsonObject { ["flowbite-svelte"] = "1.33.1" });
        UiFixture.AssertProblem(
            fixture.Run(),
            "second general-purpose visual dependency 'flowbite-svelte' requires a deviation");
    }

    // Svelte baseline (litespec/frontend/web/ui#pin-the-baseline-in-the-shared-package,
    // litespec/frontend/web/ui#track-source-changes,
    // litespec/frontend/ui#select-one-visual-authority,
    // litespec/frontend/components#compose-composites-in-page-code).

    [Fact]
    public void A_Svelte_Package_Validates_Against_The_Svelte_Baseline()
    {
        using var fixture = UiFixture.Create();
        fixture.AsSvelte();
        UiFixture.AssertClean(fixture.Run());
    }

    [Fact]
    public void A_Svelte_Application_Importing_The_Primitive_Library()
    {
        using var fixture = UiFixture.Create();
        fixture.AsSvelte();
        UiFixture.AssertProblem(
            fixture.PathCase(
                "apps/web/src/routes/bits.svelte",
                "<script>\nimport { Dialog } from \"bits-ui\";\n</script>\n<Dialog />\n"),
            "[litespec/frontend/components#compose-composites-in-page-code] apps/web/src/routes/bits.svelte: imports the primitive library directly");
    }

    [Fact]
    public void A_Svelte_Application_Importing_The_React_Primitive_Library_Is_Outside_Its_Boundary()
    {
        using var fixture = UiFixture.Create();
        fixture.AsSvelte();
        UiFixture.AssertClean(fixture.PathCase(
            "apps/web/src/routes/shim.svelte",
            "<script>\nimport { Dialog } from \"@base-ui/react/dialog\";\n</script>\n"));
    }

    [Fact]
    public void A_Svelte_Application_Importing_A_Table_Library()
    {
        using var fixture = UiFixture.Create();
        fixture.AsSvelte();
        UiFixture.AssertProblem(
            fixture.PathCase(
                "apps/web/src/routes/table.svelte",
                "<script>\nimport { flexRender } from \"@tanstack/svelte-table\";\n</script>\n"),
            "imports the table library directly");
    }

    [Fact]
    public void A_Svelte_Utility_Violation_Cites_The_Svelte_Provision()
    {
        using var fixture = UiFixture.Create();
        fixture.AsSvelte();
        UiFixture.AssertProblem(
            fixture.PathCase(
                "packages/ui/src/floorplans/card.svelte",
                "<div class=\"text-red-500\">Overdue</div>\n"),
            "[litespec/frontend/web/ui#restrict-css-decisions] packages/ui/src/floorplans/card.svelte: raw Tailwind palette value requires a semantic token 'text-red-500'");
    }

    [Fact]
    public void A_Svelte_Source_Lock_Describing_A_Preset_The_Manifest_Does_Not_Pin()
    {
        using var fixture = UiFixture.Create();
        fixture.AsSvelte();
        fixture.MutateLock(sourceLock => ((JsonObject)sourceLock["preset"]!)["baseColor"] = "slate");
        UiFixture.AssertProblem(
            fixture.Run(),
            "[litespec/frontend/web/ui#pin-the-baseline-in-the-shared-package] packages/ui/ui-source-lock.json: preset.baseColor does not match the manifest baseline");
    }

    [Fact]
    public void A_Svelte_Source_Lock_Naming_The_React_CLI_Pin()
    {
        using var fixture = UiFixture.Create();
        fixture.AsSvelte();
        fixture.MutateLock(sourceLock => sourceLock["cli"] = "4.21.5");
        UiFixture.AssertProblem(
            fixture.Run(),
            "cli must match manifest shadcn-svelte pin '1.7.0'");
    }

    [Fact]
    public void A_Svelte_Source_Lock_Naming_Another_Registry()
    {
        using var fixture = UiFixture.Create();
        fixture.AsSvelte();
        fixture.MutateLock(sourceLock =>
        {
            sourceLock["registry"] = new JsonObject { ["name"] = "fixture", ["url"] = "https://blocks.fixture.test" };
        });
        UiFixture.AssertProblem(
            fixture.Run(),
            "registry 'fixture' is not the built-in shadcn-svelte registry");
    }

    [Fact]
    public void Svelte_Components_Json_Naming_A_Base_Colour_The_Baseline_Does_Not_Pin()
    {
        using var fixture = UiFixture.Create();
        fixture.AsSvelte();
        var components = (JsonObject)UiFixture.ReadJson(fixture.ComponentsFile)!;
        ((JsonObject)components["tailwind"]!)["baseColor"] = "slate";
        UiFixture.WriteJson(fixture.ComponentsFile, components);
        UiFixture.AssertProblem(
            fixture.Run(),
            "[litespec/frontend/web/ui#pin-the-baseline-in-the-shared-package] packages/ui/components.json: tailwind.baseColor must be 'neutral'");
    }

    [Fact]
    public void Svelte_Components_Json_Naming_Another_Registry()
    {
        using var fixture = UiFixture.Create();
        fixture.AsSvelte();
        var components = (JsonObject)UiFixture.ReadJson(fixture.ComponentsFile)!;
        components["registry"] = "https://blocks.fixture.test";
        UiFixture.WriteJson(fixture.ComponentsFile, components);
        UiFixture.AssertProblem(
            fixture.Run(),
            "registry 'https://blocks.fixture.test' is not the built-in shadcn-svelte registry");
    }

    [Fact]
    public void A_Svelte_Registry_Deviation_Carries_The_Frontend_Provision()
    {
        using var fixture = UiFixture.Create();
        fixture.AsSvelte();
        var components = (JsonObject)UiFixture.ReadJson(fixture.ComponentsFile)!;
        components["registry"] = "https://blocks.fixture.test";
        UiFixture.WriteJson(fixture.ComponentsFile, components);
        fixture.WriteDeviation("extra-registry", "litespec/frontend/web/ui#pin-the-baseline-in-the-shared-package", "2099-01-01");
        UiFixture.AssertClean(fixture.Run());
    }

    [Fact]
    public void A_Svelte_UI_Deviation_With_An_Expired_Review_Date()
    {
        using var fixture = UiFixture.Create();
        fixture.AsSvelte();
        fixture.WriteDeviation("ui-authority", "litespec/frontend/ui#select-one-visual-authority", "2020-01-01");
        UiFixture.AssertProblem(
            fixture.Run(),
            "[litespec/frontend/ui#select-one-visual-authority] docs/deviations/ui-authority.md: review date 2020-01-01 has passed; renew the decision");
    }

    [Fact]
    public void The_Fixture_Is_React_Again_After_The_Svelte_Block()
    {
        using var fixture = UiFixture.Create();
        UiFixture.AssertClean(fixture.Run());
    }
}
