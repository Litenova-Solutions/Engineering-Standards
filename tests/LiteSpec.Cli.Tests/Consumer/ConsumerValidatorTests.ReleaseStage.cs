using System.Text.Json.Nodes;

namespace LiteSpec.Tests.Consumer;

public sealed partial class ConsumerValidatorTests
{
    static JsonObject StageSelection(Action<JsonObject>? extend = null)
    {
        var selection = new JsonObject
        {
            ["id"] = "stage",
            ["criterion"] = "No deployment holds customer data.",
            ["reviewBy"] = "2999-01-01",
        };
        extend?.Invoke(selection);
        return selection;
    }

    static JsonObject LiveDeferral() => new()
    {
        ["provision"] = "litespec/rule/ext-stage.declare-the-release-stage",
        ["until"] = "2999-01-01",
    };

    [Fact(DisplayName = "stage selection with its release stage and a live deferral")]
    public void StageSelectionWithItsReleaseStageAndALiveDeferral()
    {
        using var folder = ConsumerFixture.Create();
        ConsumerFixture.MutateProject(folder.Path, project =>
        {
            project["selectedExtensions"] = new JsonArray(StageSelection(selection =>
            {
                selection["releaseStage"] = "pre-production";
                selection["deferredProvisions"] = new JsonArray(LiveDeferral());
            }));
        });
        AssertClean(RunConsumer(folder.Path));
    }

    [Fact(DisplayName = "stage selection without a release stage")]
    public void StageSelectionWithoutAReleaseStage()
    {
        using var folder = ConsumerFixture.Create();
        ConsumerFixture.MutateProject(folder.Path, project =>
        {
            project["selectedExtensions"] = new JsonArray(StageSelection());
        });
        AssertProblem(RunConsumer(folder.Path), "releaseStage");
    }

    [Fact(DisplayName = "stage selection with an unknown release stage")]
    public void StageSelectionWithAnUnknownReleaseStage()
    {
        using var folder = ConsumerFixture.Create();
        ConsumerFixture.MutateProject(folder.Path, project =>
        {
            project["selectedExtensions"] = new JsonArray(StageSelection(selection =>
            {
                selection["releaseStage"] = "beta";
            }));
        });
        AssertProblem(RunConsumer(folder.Path), "/releaseStage");
    }

    [Fact(DisplayName = "release stage on another extension")]
    public void ReleaseStageOnAnotherExtension()
    {
        using var folder = ConsumerFixture.Create();
        ConsumerFixture.MutateProject(folder.Path, project =>
        {
            project["selectedExtensions"] = new JsonArray(
                new JsonObject
                {
                    ["id"] = ConsumerFixture.KnownExtension,
                    ["criterion"] = "The suite needs one.",
                    ["reviewBy"] = "2999-01-01",
                    ["releaseStage"] = "production",
                });
        });
        AssertProblem(RunConsumer(folder.Path), "/id");
    }

    [Fact(DisplayName = "production stage that still defers")]
    public void ProductionStageThatStillDefers()
    {
        using var folder = ConsumerFixture.Create();
        ConsumerFixture.MutateProject(folder.Path, project =>
        {
            project["selectedExtensions"] = new JsonArray(StageSelection(selection =>
            {
                selection["releaseStage"] = "production";
                selection["deferredProvisions"] = new JsonArray(LiveDeferral());
            }));
        });
        AssertProblem(RunConsumer(folder.Path), "declares production and still defers");
    }

    [Fact(DisplayName = "deferral of a provision the standards do not hold")]
    public void DeferralOfAProvisionTheStandardsDoNotHold()
    {
        using var folder = ConsumerFixture.Create();
        ConsumerFixture.MutateProject(folder.Path, project =>
        {
            project["selectedExtensions"] = new JsonArray(StageSelection(selection =>
            {
                selection["releaseStage"] = "pre-production";
                selection["deferredProvisions"] = new JsonArray(
                    new JsonObject
                    {
                        ["provision"] = "litespec/rule/core-model.no-such-rule",
                        ["until"] = "2999-01-01",
                    });
            }));
        });
        AssertProblem(RunConsumer(folder.Path), "is not a provision in the pinned LiteSpec release");
    }

    [Fact(DisplayName = "deferral past its end date")]
    public void DeferralPastItsEndDate()
    {
        using var folder = ConsumerFixture.Create();
        ConsumerFixture.MutateProject(folder.Path, project =>
        {
            var deferral = LiveDeferral();
            deferral["until"] = "2020-01-01";
            project["selectedExtensions"] = new JsonArray(StageSelection(selection =>
            {
                selection["releaseStage"] = "pre-production";
                selection["deferredProvisions"] = new JsonArray(deferral);
            }));
        });
        AssertProblem(RunConsumer(folder.Path), "ended on 2020-01-01");
    }
}
