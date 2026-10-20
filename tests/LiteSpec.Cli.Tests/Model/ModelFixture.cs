using LiteSpec.Tests.Support;

namespace LiteSpec.Tests.Model;

/// <summary>
///     Copies a model fixture to a fresh temporary folder and applies a broken overlay,
///     the way <c>prepare</c> in <c>tools/model.cases.mjs</c> does.
/// </summary>
static class ModelFixture
{
    /// <summary>Copies <c>Fixtures/Model/&lt;fixture&gt;</c> to a fresh temp folder, then overlays <c>broken/&lt;overlay&gt;</c> when one is named.</summary>
    /// <param name="fixtureName">The fixture to copy, <c>small</c> or <c>large</c>.</param>
    /// <param name="overlayName">The broken overlay to apply, or <c>null</c> for a clean fixture.</param>
    /// <returns>The temp folder holding the prepared fixture; the caller deletes it.</returns>
    public static TempFolder Prepare(string fixtureName, string? overlayName = null)
    {
        var temp = Cli.Temp("model-cases");
        try
        {
            CopyContents(Cli.Fixture($"Model/{fixtureName}"), temp.Path);
            if (overlayName is not null)
            {
                ApplyOverlay(overlayName, temp.Path);
            }

            return temp;
        }
        catch
        {
            temp.Dispose();
            throw;
        }
    }

    /// <summary>Writes the known-gap record the Node cases use to cover <c>use-case-unimplemented</c>.</summary>
    /// <param name="root">The prepared fixture folder.</param>
    /// <param name="endsBy">The gap's end date, <c>yyyy-MM-dd</c>.</param>
    public static void WriteKnownGap(string root, string endsBy)
    {
        var folder = Path.Combine(root, "docs", "known-gaps");
        Directory.CreateDirectory(folder);
        File.WriteAllText(Path.Combine(folder, "list-loans-unimplemented.md"), GapFile(endsBy));
    }

    static void CopyContents(string source, string target)
    {
        foreach (var directory in Directory.GetDirectories(source, "*", SearchOption.AllDirectories))
        {
            Directory.CreateDirectory(Path.Combine(target, Path.GetRelativePath(source, directory)));
        }

        foreach (var file in Directory.GetFiles(source, "*", SearchOption.AllDirectories))
        {
            var destination = Path.Combine(target, Path.GetRelativePath(source, file));
            Directory.CreateDirectory(Path.GetDirectoryName(destination)!);
            File.Copy(file, destination, overwrite: true);
        }
    }

    // Copies the overlay files over the fixture, skipping DELETES.txt itself,
    // then deletes the paths DELETES.txt lists, one per line.
    static void ApplyOverlay(string overlayName, string target)
    {
        var overlay = Cli.Fixture($"Model/broken/{overlayName}");
        foreach (var file in Directory.GetFiles(overlay, "*", SearchOption.AllDirectories))
        {
            var relative = Path.GetRelativePath(overlay, file);
            if (relative == "DELETES.txt")
            {
                continue;
            }

            var destination = Path.Combine(target, relative);
            Directory.CreateDirectory(Path.GetDirectoryName(destination)!);
            File.Copy(file, destination, overwrite: true);
        }

        var deletes = Path.Combine(overlay, "DELETES.txt");
        if (!File.Exists(deletes))
        {
            return;
        }

        foreach (var line in File.ReadAllLines(deletes))
        {
            var relative = line.Trim();
            if (relative.Length == 0)
            {
                continue;
            }

            File.Delete(Path.Combine(target, relative.Replace('/', Path.DirectorySeparatorChar)));
        }
    }

    // The same bytes the Node cases' gapFile writes: JSON frontmatter, a
    // heading, and one line of body, joined with line feeds.
    static string GapFile(string endsBy) =>
        "---\n"
        + "{\n"
        + "  \"type\": \"known-gap\",\n"
        + "  \"id\": \"known-gap/list-loans-unimplemented\",\n"
        + "  \"title\": \"List loans unimplemented\",\n"
        + "  \"owner\": \"lending-team\",\n"
        + "  \"status\": \"approved\",\n"
        + "  \"check\": \"use-case-unimplemented\",\n"
        + "  \"subject\": [\n"
        + "    \"use-case/lending.list-loans\"\n"
        + "  ],\n"
        + $"  \"endsBy\": \"{endsBy}\",\n"
        + "  \"reason\": \"Listing waits for the search index.\"\n"
        + "}\n"
        + "---\n"
        + "\n"
        + "# List loans unimplemented\n"
        + "\n"
        + "Listing loans has no handler yet.\n";
}
