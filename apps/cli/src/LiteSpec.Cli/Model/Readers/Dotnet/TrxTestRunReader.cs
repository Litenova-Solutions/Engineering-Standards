using System.Globalization;
using System.Xml.Linq;

namespace LiteSpec.Model.Readers.Dotnet;

/// <summary>
///     Reads test outcomes from TRX files. Absent when the folder holds none.
/// </summary>
sealed class TrxTestRunReader : ITestRunReader
{
    /// <summary>Reads the run, or null when no result file exists.</summary>
    public TestRun? Read(ConsumerConfig config)
    {
        var files = SourceTree.Files(config.TestResultsDir, ".trx");

        if (files.Count == 0)
        {
            return null;
        }

        var run = new TestRun();
        var counts = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);

        foreach (var file in files)
        {
            XDocument document;

            try
            {
                document = XDocument.Load(file);
            }
            catch (Exception exception) when (exception is System.Xml.XmlException or IOException)
            {
                continue;
            }

            run.Files.Add(config.Relative(file));

            if (RunDateOf(document, file) is { } day
                && (run.Date is null || string.CompareOrdinal(day, run.Date) > 0))
            {
                run.Date = day;
            }

            var results = document.Descendants().Where(element => element.Name.LocalName == "UnitTestResult");

            foreach (var result in results)
            {
                var name = result.Attribute("testName")?.Value ?? "";
                var outcome = result.Attribute("outcome")?.Value ?? "";

                if (name.Length == 0 || outcome.Length == 0)
                {
                    continue;
                }

                run.OutcomeByTest[name] = outcome;
                counts[outcome] = counts.TryGetValue(outcome, out var seen) ? seen + 1 : 1;

                foreach (var method in NamesOf(name))
                {
                    if (!run.OutcomeByMethod.TryGetValue(method, out var kept) || kept != "Failed")
                    {
                        run.OutcomeByMethod[method] = outcome;
                    }
                }
            }

            var summary = document.Descendants().FirstOrDefault(element => element.Name.LocalName == "Counters");

            if (summary is not null)
            {
                run.Total += IntOf(summary, "total");
                run.Passed += IntOf(summary, "passed");
                run.Failed += IntOf(summary, "failed");
            }
        }

        if (run.Total == 0)
        {
            run.Total = run.OutcomeByTest.Count;
            run.Passed = counts.TryGetValue("Passed", out var passed) ? passed : 0;
            run.Failed = counts.TryGetValue("Failed", out var failed) ? failed : 0;
        }

        return run;
    }

    /// <summary>
    ///     The fully qualified names a result answers to: its test name without any
    ///     data-row arguments, plus the dotted form when nested types join with a plus.
    /// </summary>
    private static IReadOnlyList<string> NamesOf(string testName)
    {
        var bare = testName;

        var paren = bare.IndexOf('(');

        if (paren >= 0)
        {
            bare = bare[..paren].Trim();
        }

        if (bare.Length == 0)
        {
            return [];
        }

        var dotted = bare.Replace('+', '.');

        return dotted == bare ? [bare] : [bare, dotted];
    }

    private static int IntOf(XElement element, string attribute) =>
        element.Attribute(attribute) is { } value && int.TryParse(value.Value, out var parsed) ? parsed : 0;

    /// <summary>The file's run date, yyyy-MM-dd: the Times finish, else the latest result end, else the file date.</summary>
    private static string? RunDateOf(XDocument document, string file)
    {
        var times = document.Descendants().FirstOrDefault(element => element.Name.LocalName == "Times");
        var stamp = times?.Attribute("finish")?.Value ?? times?.Attribute("start")?.Value;

        if (DateOf(stamp) is { } finished)
        {
            return finished;
        }

        string? latest = null;

        foreach (var result in document.Descendants().Where(element => element.Name.LocalName == "UnitTestResult"))
        {
            foreach (var name in new[] { "endTime", "startTime" })
            {
                if (DateOf(result.Attribute(name)?.Value) is { } day
                    && (latest is null || string.CompareOrdinal(day, latest) > 0))
                {
                    latest = day;
                }
            }
        }

        return latest ?? FileDate(file);
    }

    /// <summary>The yyyy-MM-dd day the timestamp starts with, or null when it names none.</summary>
    private static string? DateOf(string? stamp)
    {
        if (stamp is not { Length: >= 10 })
        {
            return null;
        }

        var day = stamp[..10];

        return DateOnly.TryParseExact(day, "yyyy-MM-dd", CultureInfo.InvariantCulture, DateTimeStyles.None, out _)
            ? day
            : null;
    }

    private static string FileDate(string file) =>
        File.GetLastWriteTimeUtc(file).ToString("yyyy-MM-dd", CultureInfo.InvariantCulture);
}
