namespace LiteSpec.Model;

/// <summary>The latest test run, read from result files.</summary>
sealed class TestRun
{
    /// <summary>The files read, relative to the root.</summary>
    public List<string> Files { get; } = [];

    /// <summary>Outcome by test name.</summary>
    public Dictionary<string, string> OutcomeByTest { get; } = new(StringComparer.Ordinal);

    /// <summary>Outcome by scenario method name.</summary>
    public Dictionary<string, string> OutcomeByMethod { get; } = new(StringComparer.Ordinal);

    public int Total { get; set; }
    public int Passed { get; set; }
    public int Failed { get; set; }
}
