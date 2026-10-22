using System.Diagnostics;
using System.Formats.Tar;

namespace LiteSpec.Model.Diff;

/// <summary>
///     One loaded diff base: its model and its label. Disposing removes the
///     temporary folder of a git base; a folder base needs no cleanup.
/// </summary>
sealed class DiffBase : IDisposable
{
    DiffBase(ProjectModel model, string label, string? temp)
    {
        Model = model;
        Label = label;
        Temp = temp;
    }

    /// <summary>The base model.</summary>
    public ProjectModel Model { get; }

    /// <summary>The base name, as the caller passed it.</summary>
    public string Label { get; }

    /// <summary>The temporary folder holding a git base, or null for a folder base.</summary>
    string? Temp { get; }

    public void Dispose()
    {
        if (Temp is null)
        {
            return;
        }

        try
        {
            Directory.Delete(Temp, recursive: true);
        }
        catch (IOException)
        {
        }
        catch (UnauthorizedAccessException)
        {
        }
    }

    /// <summary>
    ///     Loads the base: a consumer folder holding <c>litespec.project.json</c>, or a
    ///     git revision of the consumer, read through an archive into a temporary folder.
    /// </summary>
    public static DiffBase Load(ConsumerConfig headConfig, string baseArg)
    {
        if (FolderOf(headConfig, baseArg) is { } folder)
        {
            var project = Path.Combine(folder, "litespec.project.json");

            if (!File.Exists(project))
            {
                throw new InvalidOperationException($"Base '{baseArg}' holds no litespec.project.json.");
            }

            return new DiffBase(
                ModelBuilder.Build(ConsumerConfig.Load(folder)), baseArg, null);
        }

        return LoadRevision(headConfig, baseArg);
    }

    /// <summary>The head name: the current branch, or the working tree outside git.</summary>
    public static string HeadLabel(ConsumerConfig headConfig)
    {
        var branch = RunGit(headConfig.Root, "branch", "--show-current");

        return branch.Status == 0 && branch.Stdout.Trim().Length > 0
            ? branch.Stdout.Trim()
            : "working tree";
    }

    static string? FolderOf(ConsumerConfig headConfig, string baseArg)
    {
        var direct = Path.IsPathRooted(baseArg)
            ? baseArg
            : Path.Combine(Directory.GetCurrentDirectory(), baseArg);

        if (Directory.Exists(direct))
        {
            return direct;
        }

        if (!Path.IsPathRooted(baseArg))
        {
            var beside = Path.Combine(headConfig.Root, baseArg);

            if (Directory.Exists(beside))
            {
                return beside;
            }
        }

        return null;
    }

    static DiffBase LoadRevision(ConsumerConfig headConfig, string baseArg)
    {
        string Neither() => $"Base '{baseArg}' is neither a consumer folder nor a git revision.";

        var top = RunGit(headConfig.Root, "rev-parse", "--show-toplevel");

        if (top.Status != 0)
        {
            throw new InvalidOperationException(Neither());
        }

        var toplevel = top.Stdout.Trim();
        var resolved = RunGit(toplevel, "rev-parse", "--verify", "--quiet", $"{baseArg}^{{commit}}");

        if (resolved.Status != 0 || resolved.Stdout.Trim().Length == 0)
        {
            throw new InvalidOperationException(Neither());
        }

        var archived = RunGitBytes(toplevel, "archive", "--format=tar", resolved.Stdout.Trim());

        if (archived.Status != 0)
        {
            throw new InvalidOperationException($"Base '{baseArg}' could not be read: {archived.Error.Trim()}.");
        }

        var temp = Directory.CreateTempSubdirectory("litespec-diff-").FullName;

        try
        {
            using var archive = new MemoryStream(archived.Bytes);

            TarFile.ExtractToDirectory(archive, temp, overwriteFiles: true);
        }
        catch (Exception exception) when (exception is IOException or UnauthorizedAccessException or InvalidDataException)
        {
            Directory.Delete(temp, recursive: true);
            throw new InvalidOperationException($"Base '{baseArg}' could not be read: {exception.Message}.");
        }

        var relative = Path.GetRelativePath(toplevel, headConfig.Root);
        var root = relative is "." or "" ? temp : Path.Combine(temp, relative);

        if (!File.Exists(Path.Combine(root, "litespec.project.json")))
        {
            Directory.Delete(temp, recursive: true);
            throw new InvalidOperationException($"Base '{baseArg}' holds no litespec.project.json.");
        }

        return new DiffBase(ModelBuilder.Build(ConsumerConfig.Load(root)), baseArg, temp);
    }

    static (int Status, string Stdout, string Error) RunGit(string workdir, params string[] args)
    {
        var start = new ProcessStartInfo("git")
        {
            RedirectStandardOutput = true,
            RedirectStandardError = true,
            UseShellExecute = false,
            WorkingDirectory = workdir,
        };

        foreach (var arg in args)
        {
            start.ArgumentList.Add(arg);
        }

        try
        {
            using var process = Process.Start(start)!;
            var stdout = process.StandardOutput.ReadToEndAsync();
            var stderr = process.StandardError.ReadToEndAsync();

            if (!process.WaitForExit(TimeSpan.FromMinutes(5)))
            {
                process.Kill(entireProcessTree: true);
                return (1, "", "git did not finish in five minutes.");
            }

            return (process.ExitCode, stdout.Result, stderr.Result);
        }
        catch (System.ComponentModel.Win32Exception)
        {
            return (1, "", "git is not available.");
        }
    }

    static (int Status, byte[] Bytes, string Error) RunGitBytes(string workdir, params string[] args)
    {
        var start = new ProcessStartInfo("git")
        {
            RedirectStandardOutput = true,
            RedirectStandardError = true,
            UseShellExecute = false,
            WorkingDirectory = workdir,
        };

        foreach (var arg in args)
        {
            start.ArgumentList.Add(arg);
        }

        try
        {
            using var process = Process.Start(start)!;
            using var bytes = new MemoryStream();
            var stdout = Task.Run(() => process.StandardOutput.BaseStream.CopyTo(bytes));
            var stderr = process.StandardError.ReadToEndAsync();

            if (!process.WaitForExit(TimeSpan.FromMinutes(5)) || !stdout.Wait(TimeSpan.FromMinutes(1)))
            {
                process.Kill(entireProcessTree: true);
                return (1, [], "git did not finish in five minutes.");
            }

            return (process.ExitCode, bytes.ToArray(), stderr.Result);
        }
        catch (System.ComponentModel.Win32Exception)
        {
            return (1, [], "git is not available.");
        }
    }
}
