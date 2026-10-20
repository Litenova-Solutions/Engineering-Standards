using System.Xml.Linq;

namespace LiteSpec.Model.Readers.JUnit;

/// <summary>
///     Reads test outcomes from JUnit XML files. Absent when the folder holds none.
/// </summary>
sealed class JUnitRunReader : ITestRunReader
{
    /// <summary>Reads the run, or null when no JUnit file exists.</summary>
    public TestRun? Read(ConsumerConfig config)
    {
        var files = SourceTree.Files(config.TestResultsDir, ".xml");

        TestRun? run = null;

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

            if (document.Root is null
                || (document.Root.Name.LocalName != "testsuites" && document.Root.Name.LocalName != "testsuite"))
            {
                continue;
            }

            run ??= new TestRun();
            run.Files.Add(config.Relative(file));

            var cases = document.Descendants().Where(element => element.Name.LocalName == "testcase");

            foreach (var testcase in cases)
            {
                var name = testcase.Attribute("name")?.Value ?? "";

                if (name.Length == 0)
                {
                    continue;
                }

                var classname = testcase.Attribute("classname")?.Value ?? "";
                var testName = classname.Length > 0 ? $"{classname}.{name}" : name;
                var outcome = testcase.Elements().Any(element => element.Name.LocalName is "failure" or "error")
                    ? "Failed"
                    : testcase.Elements().Any(element => element.Name.LocalName == "skipped")
                        ? "Skipped"
                        : "Passed";

                run.OutcomeByTest[testName] = outcome;

                var method = MethodOf(testName);

                if (method.Length > 0)
                {
                    if (!run.OutcomeByMethod.TryGetValue(method, out var kept) || kept != "Failed")
                    {
                        run.OutcomeByMethod[method] = outcome;
                    }
                }
            }
        }

        if (run is not null)
        {
            run.Total = run.OutcomeByTest.Count;
            run.Passed = run.OutcomeByTest.Values.Count(outcome => outcome == "Passed");
            run.Failed = run.OutcomeByTest.Values.Count(outcome => outcome == "Failed");
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
}
