namespace Litenova.Model;

/// <summary>
///     Every file under a directory, with build output and installed packages left out.
/// </summary>
static class SourceTree
{
    /// <summary>
    ///     The text of a file, read again after a short wait while another process holds it open.
    /// </summary>
    public static string Read(string file)
    {
        for (var attempt = 1; ; attempt++)
        {
            try
            {
                return File.ReadAllText(file);
            }
            catch (IOException) when (attempt < 10 && File.Exists(file))
            {
                Thread.Sleep(200 * attempt);
            }
        }
    }

    private static readonly HashSet<string> Skipped = new(StringComparer.OrdinalIgnoreCase)
    {
        "bin", "obj", "TestResults", "node_modules", ".git", ".model",
        ".svelte-kit", "build", "dist", "coverage",
    };

    /// <summary>
    ///     Every file under a directory, recursively, in a stable order.
    /// </summary>
    public static IReadOnlyList<string> Files(string directory)
    {
        if (!Directory.Exists(directory))
        {
            return [];
        }

        var found = new List<string>();

        Walk(directory, found);
        found.Sort(StringComparer.Ordinal);

        return found;
    }

    /// <summary>
    ///     Every file matching one of several extensions under a directory.
    /// </summary>
    public static IReadOnlyList<string> Files(string directory, params string[] extensions) =>
    [
        .. Files(directory)
           .Where(file => extensions.Any(extension =>
                                             file.EndsWith(extension, StringComparison.OrdinalIgnoreCase))),
    ];

    private static void Walk(string directory, List<string> found)
    {
        foreach (var file in Directory.EnumerateFiles(directory))
        {
            found.Add(file);
        }

        foreach (var child in Directory.EnumerateDirectories(directory))
        {
            if (Skipped.Contains(Path.GetFileName(child)))
            {
                continue;
            }

            Walk(child, found);
        }
    }
}
