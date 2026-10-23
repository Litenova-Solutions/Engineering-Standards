using System.Xml.Linq;

namespace LiteSpec.Model.Readers.Coverage;

/// <summary>What the coverage read found: unreached lines and whether any file was read.</summary>
/// <param name="Gaps">One entry per line no scenario test reaches.</param>
/// <param name="Read">Whether at least one coverage file was read.</param>
sealed record CoverageRead(IReadOnlyList<CoverageGap> Gaps, bool Read);

/// <summary>
///     Reads scenario-only coverage: Coverlet Cobertura files and Vitest lcov files
///     beside the test results. Every line they mark unreached is listed for triage.
///     The collection stays scenario-only because the CI job runs only the scenario
///     tests under coverage; the reader reports whatever the files hold.
/// </summary>
static class CoverageReader
{
    /// <summary>Reads every coverage file under the test results folder.</summary>
    public static CoverageRead Read(ConsumerConfig config)
    {
        var gaps = new List<CoverageGap>();
        var seen = new HashSet<string>(StringComparer.Ordinal);
        var read = false;

        foreach (var file in SourceTree.Files(config.TestResultsDir, ".cobertura.xml", ".lcov", "lcov.info"))
        {
            List<CoverageGap>? found = null;

            try
            {
                found = IsLcov(file) ? ReadLcov(config, file) : ReadCobertura(config, file);
            }
            catch (Exception exception) when (exception is System.Xml.XmlException or IOException or UnauthorizedAccessException or ArgumentException or NotSupportedException)
            {
                continue;
            }

            if (found is null)
            {
                continue;
            }

            read = true;

            foreach (var gap in found)
            {
                if (seen.Add($"{gap.File}\n{gap.Line}"))
                {
                    gaps.Add(gap);
                }
            }
        }

        gaps.Sort((left, right) =>
        {
            var file = string.Compare(left.File, right.File, StringComparison.Ordinal);

            if (file != 0)
            {
                return file;
            }

            var line = left.Line.CompareTo(right.Line);

            return line != 0 ? line : string.Compare(left.Member, right.Member, StringComparison.Ordinal);
        });

        return new CoverageRead(gaps, read);
    }

    private static bool IsLcov(string file) =>
        file.EndsWith("lcov.info", StringComparison.OrdinalIgnoreCase)
        || file.EndsWith(".lcov", StringComparison.OrdinalIgnoreCase);

    /// <summary>Reads one Cobertura file, or null when it holds no coverage.</summary>
    private static List<CoverageGap>? ReadCobertura(ConsumerConfig config, string file)
    {
        var document = XDocument.Load(file);

        if (document.Root is null || document.Root.Name.LocalName != "coverage")
        {
            return null;
        }

        var gaps = new List<CoverageGap>();

        foreach (var webClass in document.Descendants().Where(element => element.Name.LocalName == "class"))
        {
            var filename = webClass.Attribute("filename")?.Value ?? "";

            if (filename.Length == 0)
            {
                continue;
            }

            var resolved = Resolve(config, filename);

            foreach (var line in webClass.Descendants().Where(element => element.Name.LocalName == "line"))
            {
                if (line.Attribute("number")?.Value is not { } numberText
                    || !int.TryParse(numberText, out var number)
                    || line.Attribute("hits")?.Value is not { } hitsText
                    || !int.TryParse(hitsText, out var hits)
                    || hits != 0)
                {
                    continue;
                }

                var member = line.Ancestors().FirstOrDefault(element => element.Name.LocalName == "method")?.Attribute("name")?.Value ?? "";

                gaps.Add(new CoverageGap(resolved, number, member));
            }
        }

        return gaps;
    }

    /// <summary>Reads one lcov file, or null when it holds no record with a file.</summary>
    private static List<CoverageGap>? ReadLcov(ConsumerConfig config, string file)
    {
        var gaps = new List<CoverageGap>();
        var found = false;
        string current = "";
        var functions = new List<(int Line, string Name)>();

        void Close()
        {
            current = "";
            functions.Clear();
        }

        foreach (var raw in File.ReadAllLines(file))
        {
            var entry = raw.Trim();

            if (entry.StartsWith("SF:", StringComparison.Ordinal))
            {
                current = entry["SF:".Length..].Trim();
                functions.Clear();

                if (current.Length > 0)
                {
                    found = true;
                }
            }
            else if (entry.StartsWith("FN:", StringComparison.Ordinal) && current.Length > 0)
            {
                var body = entry["FN:".Length..];
                var comma = body.IndexOf(',');

                if (comma > 0
                    && int.TryParse(body[..comma], out var start)
                    && body[(comma + 1)..] is { Length: > 0 } name)
                {
                    functions.Add((start, name));
                }
            }
            else if (entry.StartsWith("DA:", StringComparison.Ordinal) && current.Length > 0)
            {
                var body = entry["DA:".Length..].Split(',');

                if (body.Length >= 2
                    && int.TryParse(body[0], out var number)
                    && int.TryParse(body[1], out var hits)
                    && hits == 0)
                {
                    gaps.Add(new CoverageGap(Resolve(config, current), number, Enclosing(functions, number)));
                }
            }
            else if (entry.StartsWith("end_of_record", StringComparison.Ordinal))
            {
                Close();
            }
        }

        return found ? gaps : null;
    }

    /// <summary>The function starting nearest above the line, or empty when none does.</summary>
    private static string Enclosing(List<(int Line, string Name)> functions, int number)
    {
        var member = "";
        var start = -1;

        foreach (var (line, name) in functions)
        {
            if (line <= number && line > start)
            {
                start = line;
                member = name;
            }
        }

        return member;
    }

    private static string Resolve(ConsumerConfig config, string path)
    {
        var normalized = path.Replace('/', Path.DirectorySeparatorChar);

        return Path.IsPathRooted(normalized)
            ? Path.GetFullPath(normalized)
            : Path.GetFullPath(Path.Combine(config.Root, normalized));
    }
}
