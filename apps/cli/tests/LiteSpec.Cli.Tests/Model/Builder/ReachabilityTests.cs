using System.Text.Json;
using LiteSpec.Tests.Model;
using LiteSpec.Tests.Support;

namespace LiteSpec.Tests.Model.Builder;

/// <summary>Proves transitions mark the states they enter, and the states that start a lifecycle.</summary>
public sealed class ReachabilityTests
{
    /// <summary>Entered states reach, and so does the state the lifecycle starts from.</summary>
    [Fact]
    public void Transitions_Mark_Entered_And_Starting_States_Reachable()
    {
        using var temp = ModelFixture.Prepare("small");
        AddTransitions(temp.Path);

        using var document = Build(temp.Path);
        var states = document.RootElement.GetProperty("reachableStates").GetProperty("aggregate/lending.loan");

        Assert.Equal(
            ["Active", "Overdue", "Returned"],
            states.EnumerateArray().Select(state => state.GetString()).ToList());
    }

    /// <summary>An aggregate without transitions reaches no state.</summary>
    [Fact]
    public void Aggregate_Without_Transitions_Reaches_No_State()
    {
        using var temp = ModelFixture.Prepare("small");

        using var document = Build(temp.Path);
        var states = document.RootElement.GetProperty("reachableStates").GetProperty("aggregate/lending.loan");

        Assert.Empty(states.EnumerateArray());
    }

    static void AddTransitions(string root)
    {
        var page = Path.Combine(root, "docs", "domain", "modules", "lending", "loans", "README.md");
        var text = File.ReadAllText(page);

        File.WriteAllText(page, text.Replace("  \"records\": [", Transitions + "\n  \"records\": ["));
    }

    static JsonDocument Build(string root)
    {
        var output = Path.Combine(root, ".model", "model.json");
        var result = Cli.Run("model", "build", "--root", root, "--out", output);
        Assert.Equal(0, result.Status);

        return JsonDocument.Parse(File.ReadAllText(output));
    }

    const string Transitions = """
          "transitions": [
            {
              "from": "Active",
              "to": "Overdue",
              "by": "use-case/lending.extend-loan"
            },
            {
              "from": "Overdue",
              "to": "Returned",
              "by": "use-case/lending.return-copy"
            },
            {
              "from": "Active",
              "to": "Returned",
              "by": "use-case/lending.return-copy"
            }
          ],
        """;
}
