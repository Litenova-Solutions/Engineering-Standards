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

                var method = MethodOf(name);

                if (method.Length > 0)
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

    private static string MethodOf(string testName)
    {
        var bare = testName;

        var paren = bare.IndexOf('(');

        if (paren >= 0)
        {
            bare = bare[..paren];
        }

        var dot = bare.LastIndexOf('.');

        return dot >= 0 ? bare[(dot + 1)..] : bare;
    }

    private static int IntOf(XElement element, string attribute) =>
        element.Attribute(attribute) is { } value && int.TryParse(value.Value, out var parsed) ? parsed : 0;
}
