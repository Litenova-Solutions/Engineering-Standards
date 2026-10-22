using System.Text.Json.Nodes;

namespace LiteSpec.Tests.Ui;

/// <summary>
/// The source boundary, shared package, additional registry and source lock cases.
/// </summary>
public sealed partial class UiValidatorTests
{
    // Source boundary (litespec/frontend/ui#select-one-visual-authority).

    [Fact]
    public void Second_Visual_System_In_The_Workspace_Root()
    {
        using var fixture = UiFixture.Create();
        fixture.WriteManifest("dependencies", new JsonObject { ["@mui/material"] = "7.0.0" });
        UiFixture.AssertProblem(
            fixture.Run(),
            "second general-purpose visual dependency '@mui/material' requires a deviation");
    }

    [Fact]
    public void Second_Visual_System_In_OptionalDependencies()
    {
        using var fixture = UiFixture.Create();
        fixture.WriteManifest("optionalDependencies", new JsonObject { ["bootstrap"] = "5.3.3" });
        UiFixture.AssertProblem(
            fixture.Run(),
            "second general-purpose visual dependency 'bootstrap' requires a deviation");
    }

    [Fact]
    public void Second_Visual_System_Pinned_Through_Pnpm_Overrides()
    {
        using var fixture = UiFixture.Create();
        fixture.WriteManifest("pnpm", new JsonObject
        {
            ["overrides"] = new JsonObject { ["@mantine/core"] = "8.0.0" },
        });
        UiFixture.AssertProblem(
            fixture.Run(),
            "second general-purpose visual dependency '@mantine/core' requires a deviation");
    }

    [Fact]
    public void Second_Visual_System_Pinned_Through_Resolutions()
    {
        using var fixture = UiFixture.Create();
        fixture.WriteManifest("resolutions", new JsonObject { ["antd"] = "5.0.0" });
        UiFixture.AssertProblem(
            fixture.Run(),
            "second general-purpose visual dependency 'antd' requires a deviation");
    }

    [Fact]
    public void UI_Deviation_With_An_Expired_Review_Date()
    {
        using var fixture = UiFixture.Create();
        fixture.WriteDeviation("ui-authority", "litespec/frontend/ui#select-one-visual-authority", "2020-01-01");
        UiFixture.AssertProblem(
            fixture.Run(),
            "[litespec/frontend/ui#select-one-visual-authority] docs/deviations/ui-authority.md: review date 2020-01-01 has passed; renew the decision");
    }

    [Fact]
    public void UI_Deviation_With_A_Live_Review_Date()
    {
        using var fixture = UiFixture.Create();
        fixture.WriteDeviation("ui-authority", "litespec/frontend/ui#select-one-visual-authority", "2099-01-01");
        UiFixture.AssertClean(fixture.Run());
    }

    [Fact]
    public void Deviation_Against_Another_Area_Stays_Unread_By_The_UI_Validator()
    {
        using var fixture = UiFixture.Create();
        fixture.WriteDeviation("other-area", "litespec/core/agent#select-task-context", "2020-01-01");
        UiFixture.AssertClean(fixture.Run());
    }

    [Fact]
    public void Deviations_Folder_Set_Through_Paths_Records_Deviation()
    {
        using var fixture = UiFixture.Create();
        fixture.MutateProject(project =>
        {
            ((JsonObject)project["paths"]!)["records"] = new JsonObject { ["deviation"] = "docs/departures" };
        });
        fixture.WriteDeviationFile(
            "docs/departures/moved.md",
            UiFixture.DeviationMeta("deviation/moved", "Moved deviation", "litespec/frontend/ui#select-one-visual-authority", "2020-01-01"),
            "Moved deviation");
        UiFixture.AssertProblem(
            fixture.Run(),
            "[litespec/frontend/ui#select-one-visual-authority] docs/departures/moved.md: review date 2020-01-01 has passed; renew the decision");
    }

    // Shared package (litespec/frontend/web/ui#pin-the-baseline-in-the-shared-package).

    [Fact]
    public void A_Controlled_Frontend_With_No_Shared_Package()
    {
        using var fixture = UiFixture.Create();
        fixture.MutateProject(project => ((JsonObject)project["paths"]!).Remove("uiPackage"));
        UiFixture.AssertProblem(fixture.Run(), "and no paths.uiPackage");
    }

    [Fact]
    public void A_Shared_Package_With_No_Public_Export()
    {
        using var fixture = UiFixture.Create();
        fixture.MutateProject(project =>
        {
            ((JsonObject)((JsonObject)project["paths"]!)["uiPackage"]!)["publicExports"] = new JsonArray();
        });
        UiFixture.AssertProblem(fixture.Run(), "publicExports must contain at least one entry point");
    }

    [Fact]
    public void A_Shared_Package_Declaring_The_Same_Export_Twice()
    {
        using var fixture = UiFixture.Create();
        fixture.MutateProject(project =>
        {
            ((JsonObject)((JsonObject)project["paths"]!)["uiPackage"]!)["publicExports"] =
                new JsonArray("@fixture/ui/floorplans", "@fixture/ui/floorplans");
        });
        UiFixture.AssertProblem(fixture.Run(), "duplicate '@fixture/ui/floorplans'");
    }

    [Fact]
    public void A_Source_Lock_Outside_The_Package_Root()
    {
        using var fixture = UiFixture.Create();
        fixture.MutateProject(project =>
        {
            ((JsonObject)((JsonObject)project["paths"]!)["uiPackage"]!)["sourceLock"] = "docs/ui-source-lock.json";
        });
        UiFixture.AssertProblem(fixture.Run(), "sourceLock must live inside the shared package root");
    }

    [Fact]
    public void Components_Json_Naming_An_Icon_Library_The_Baseline_Does_Not_Pin()
    {
        using var fixture = UiFixture.Create();
        var components = (JsonObject)UiFixture.ReadJson(fixture.ComponentsFile)!;
        components["iconLibrary"] = "heroicons";
        UiFixture.WriteJson(fixture.ComponentsFile, components);
        UiFixture.AssertProblem(fixture.Run(), "iconLibrary must be \"lucide\"");
    }

    [Fact]
    public void Source_Lock_Describing_A_Preset_The_Manifest_Does_Not_Pin()
    {
        using var fixture = UiFixture.Create();
        fixture.MutateLock(sourceLock => ((JsonObject)sourceLock["preset"]!)["style"] = "fixture-style");
        UiFixture.AssertProblem(fixture.Run(), "preset.style does not match the manifest baseline");
    }

    // Additional registries (litespec/frontend/web/ui#pin-the-baseline-in-the-shared-package).

    [Fact]
    public void An_Additional_Registry_With_The_Deviation_Passes_Both_Gates()
    {
        using var fixture = UiFixture.Create();
        fixture.AddAdditionalRegistry();
        fixture.WriteDeviation("extra-registry", "litespec/frontend/web/ui#pin-the-baseline-in-the-shared-package", "2099-01-01");
        UiFixture.AssertClean(fixture.Run());
    }

    [Fact]
    public void The_Configuration_Gate_Refuses_Without_The_Deviation()
    {
        using var fixture = UiFixture.Create();
        fixture.AddAdditionalRegistry();
        UiFixture.AssertProblem(
            fixture.Run(),
            "[litespec/frontend/web/ui#pin-the-baseline-in-the-shared-package] packages/ui/components.json: an additional registry requires a deviation");
    }

    [Fact]
    public void The_Source_Lock_Gate_Refuses_Without_The_Deviation()
    {
        using var fixture = UiFixture.Create();
        fixture.AddAdditionalRegistry();
        UiFixture.AssertProblem(
            fixture.Run(),
            "[litespec/frontend/web/ui#pin-the-baseline-in-the-shared-package] packages/ui/ui-source-lock.json: registry 'fixture' is not the built-in shadcn registry");
    }

    // Source lock (litespec/frontend/web/ui#track-source-changes).

    [Fact]
    public void Changed_Copied_Source_Without_A_Fork_Record()
    {
        using var fixture = UiFixture.Create();
        File.AppendAllText(fixture.ButtonFile, "// local change\n");
        UiFixture.AssertProblem(fixture.Run(), "no longer matches the recorded digest");
    }

    [Fact]
    public void A_Dependency_The_Manifest_Does_Not_Pin()
    {
        using var fixture = UiFixture.Create();
        fixture.MutateLock(sourceLock =>
        {
            ((JsonObject)((JsonArray)sourceLock["components"]!)[0]!)["dependencies"] =
                new JsonArray("not-a-pinned-package");
        });
        UiFixture.AssertProblem(
            fixture.Run(),
            "dependency 'not-a-pinned-package' is not pinned in the LiteSpec manifest");
    }

    [Fact]
    public void A_Path_Escaping_The_Package_Root()
    {
        using var fixture = UiFixture.Create();
        fixture.MutateLock(sourceLock =>
        {
            ((JsonObject)((JsonArray)sourceLock["components"]!)[0]!)["paths"] =
                new JsonArray("../../../outside/button.tsx");
        });
        UiFixture.AssertProblem(fixture.Run(), "path escapes the shared package root");
    }
}
