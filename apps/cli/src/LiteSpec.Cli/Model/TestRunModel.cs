namespace LiteSpec.Model;

/// <summary>The latest test run, read from result files.</summary>
sealed class TestRun
{
    /// <summary>The files read, relative to the root.</summary>
    public List<string> Files { get; } = [];

    /// <summary>Outcome by test name, exactly as the result file writes it.</summary>
    public Dictionary<string, string> OutcomeByTest { get; } = new(StringComparer.Ordinal);

    /// <summary>
    ///     Outcome by fully qualified test name: the namespace, the containing types
    ///     joined with dots, and the method, without any data-row arguments. A renamed
    ///     test matches nothing instead of matching another test's same-named method.
    /// </summary>
    public Dictionary<string, string> OutcomeByMethod { get; } = new(StringComparer.Ordinal);

    public int Total { get; set; }
    public int Passed { get; set; }
    public int Failed { get; set; }

    /// <summary>The run date, yyyy-MM-dd, or null when no result file names one.</summary>
    public string? Date { get; set; }
}
