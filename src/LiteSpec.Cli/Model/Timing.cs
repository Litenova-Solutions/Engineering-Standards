namespace LiteSpec.Model;

/// <summary>
///     Phase timings for profiling the builder on a large consumer. They print to
///     standard error only when <c>LITESPEC_TIMING</c> is set, so a normal run
///     writes nothing beside its findings.
/// </summary>
static class Timing
{
    static readonly bool enabled = !string.IsNullOrEmpty(Environment.GetEnvironmentVariable("LITESPEC_TIMING"));

    /// <summary>Writes one timing line when timing is on.</summary>
    public static void Report(string line)
    {
        if (enabled)
        {
            Console.Error.WriteLine(line);
        }
    }
}
