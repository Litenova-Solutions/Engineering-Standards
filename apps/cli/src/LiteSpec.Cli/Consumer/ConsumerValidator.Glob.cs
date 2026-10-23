using System.Text;
using System.Text.RegularExpressions;

namespace LiteSpec.Consumer;

/// <summary>
///     The glob walker of the consumer validator: resolves the <c>paths.glossaryScan</c>
///     patterns to repository-relative files.
/// </summary>
static partial class ConsumerValidator
{
    // One compiled matcher per glob segment, shared by every directory the walk visits.
    static readonly System.Collections.Concurrent.ConcurrentDictionary<string, Regex> SegmentMatchers = new(StringComparer.Ordinal);

    static readonly HashSet<string> GlobIgnored = new(
        ["node_modules", ".git", "bin", "obj", ".next", "dist", "build", "out", "coverage"],
        StringComparer.Ordinal);

    /// <summary>
    ///     Returns the files under <paramref name="from"/> matching <paramref name="pattern"/>,
    ///     as forward-slash relative paths in ordinal order. A <c>**</c> segment matches zero
    ///     or more directories; <c>*</c> and <c>?</c> match within one name.
    /// </summary>
    static List<string> GlobFiles(string from, string pattern)
    {
        var segments = pattern.Split('/').Where(segment => segment.Length > 0 && segment != ".").ToList();
        var results = new SortedSet<string>(StringComparer.Ordinal);

        Visit(from, 0, "");
        return results.ToList();

        void Visit(string directory, int index, string prefix)
        {
            if (index >= segments.Count)
            {
                return;
            }

            string[] entries;

            try
            {
                entries = Directory.GetFileSystemEntries(directory);
            }
            catch
            {
                return;
            }

            var segment = segments[index];
            var last = index == segments.Count - 1;

            // '**' matches zero or more directories. The rest of the pattern is tried
            // at this level first, then inside every subdirectory.
            if (segment == "**")
            {
                Visit(directory, index + 1, prefix);

                foreach (var entry in entries)
                {
                    var name = Path.GetFileName(entry) ?? "";

                    if (!Directory.Exists(entry) || GlobIgnored.Contains(name))
                    {
                        continue;
                    }

                    Visit(entry, index, prefix.Length > 0 ? $"{prefix}/{name}" : name);
                }

                return;
            }

            // Each matcher compiles once and stays shared: it runs on every name the
            // walk visits. Compilation changes only the speed, never what matches.
            var matcher = SegmentMatchers.GetOrAdd(segment, key => new Regex(GlobSegment(key), RegexOptions.Compiled));

            foreach (var entry in entries)
            {
                var name = Path.GetFileName(entry) ?? "";

                if (!matcher.IsMatch(name))
                {
                    continue;
                }

                var relative = prefix.Length > 0 ? $"{prefix}/{name}" : name;

                if (last && File.Exists(entry))
                {
                    results.Add(relative);
                }
                else if (!last && Directory.Exists(entry) && !GlobIgnored.Contains(name))
                {
                    Visit(entry, index + 1, relative);
                }
            }
        }
    }

    static string GlobSegment(string segment)
    {
        var expression = new StringBuilder("^");

        foreach (var character in segment)
        {
            if (character == '*')
            {
                expression.Append("[^/]*");
            }
            else if (character == '?')
            {
                expression.Append("[^/]");
            }
            else
            {
                if (".+^${}()|[]\\".Contains(character))
                {
                    expression.Append('\\');
                }

                expression.Append(character);
            }
        }

        expression.Append('$');
        return expression.ToString();
    }
}
