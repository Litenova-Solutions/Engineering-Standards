using LiteSpec.Tests.Support;

namespace LiteSpec.Tests.Model.Diff;

/// <summary>
///     Copies the diff base fixture to fresh temporary folders for the base and the head.
/// </summary>
static class DiffFixture
{
    /// <summary>Copies <c>Fixtures/Diff/base</c> to two fresh temp folders, then applies the overlay to the head.</summary>
    /// <param name="overlayName">The changed overlay to apply to the head, or <c>null</c> for no change.</param>
    /// <returns>The base and head folders; the caller deletes them.</returns>
    public static (TempFolder Base, TempFolder Head) Prepare(string? overlayName = null)
    {
        var baseFolder = Cli.Temp("diff-base");
        try
        {
            var headFolder = Cli.Temp("diff-head");
            try
            {
                CopyContents(Cli.Fixture("Diff/base"), baseFolder.Path);
                CopyContents(Cli.Fixture("Diff/base"), headFolder.Path);

                if (overlayName is not null)
                {
                    ApplyOverlay(overlayName, headFolder.Path);
                }

                return (baseFolder, headFolder);
            }
            catch
            {
                headFolder.Dispose();
                throw;
            }
        }
        catch
        {
            baseFolder.Dispose();
            throw;
        }
    }

    /// <summary>Copies the overlay files over the target, then deletes the paths DELETES.txt lists.</summary>
    public static void ApplyOverlay(string overlayName, string target)
    {
        var overlay = Cli.Fixture($"Diff/changed/{overlayName}");

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
}
