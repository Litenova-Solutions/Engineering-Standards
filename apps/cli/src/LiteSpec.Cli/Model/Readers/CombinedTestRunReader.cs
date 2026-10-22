namespace LiteSpec.Model.Readers;

/// <summary>
///     Reads one run across several result formats. Absent when no reader finds a result file.
/// </summary>
sealed class CombinedTestRunReader(params ITestRunReader[] readers) : ITestRunReader
{
    /// <summary>Reads and merges every reader's run, in order.</summary>
    public TestRun? Read(ConsumerConfig config)
    {
        TestRun? merged = null;

        foreach (var reader in readers)
        {
            var run = reader.Read(config);

            if (run is null)
            {
                continue;
            }

            merged ??= new TestRun();
            merged.Files.AddRange(run.Files);

            foreach (var (name, outcome) in run.OutcomeByTest)
            {
                merged.OutcomeByTest[name] = outcome;
            }

            foreach (var (method, outcome) in run.OutcomeByMethod)
            {
                if (!merged.OutcomeByMethod.TryGetValue(method, out var kept) || kept != "Failed")
                {
                    merged.OutcomeByMethod[method] = outcome;
                }
            }

            merged.Total += run.Total;
            merged.Passed += run.Passed;
            merged.Failed += run.Failed;

            if (run.Date is not null
                && (merged.Date is null || string.CompareOrdinal(run.Date, merged.Date) > 0))
            {
                merged.Date = run.Date;
            }
        }

        return merged;
    }
}
