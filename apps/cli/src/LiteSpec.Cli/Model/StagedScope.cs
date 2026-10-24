using System.Diagnostics;

namespace LiteSpec.Model;

/// <summary>
///     The staged scope for <c>model check --staged</c>: the records on pages changed in
///     the git index, plus their direct links in both directions and the records staged
///     code implements. A finding is in scope when its path is staged or its subject is.
/// </summary>
static class StagedScope
{
    /// <summary>One computed scope: its record ids, its staged paths and its file count.</summary>
    /// <param name="RecordIds">The changed records plus their direct links, by id.</param>
    /// <param name="Files">The staged absolute paths.</param>
    /// <param name="StagedFiles">How many files the index holds changed.</param>
    public sealed record Scope(
        IReadOnlySet<string> RecordIds,
        IReadOnlySet<string> Files,
        int StagedFiles);

    /// <summary>
    ///     Computes the scope from the git index, or null with an error when git is
    ///     unavailable or the root sits outside a git repository.
    /// </summary>
    public static (Scope? Scope, string Error) For(ProjectModel model)
    {
        var top = RunGit(model.Config.Root, "rev-parse", "--show-toplevel");

        if (top.Status != 0)
        {
            return (null, $"Cannot read the git index: {Detail(top, "the root sits outside a git repository")}.");
        }

        var diff = RunGit(model.Config.Root, "diff", "--cached", "--name-only", "-z");

        if (diff.Status != 0)
        {
            return (null, $"Cannot read the git index: {Detail(diff, "git diff failed")}.");
        }

        var toplevel = top.Stdout.Trim();
        var staged = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        foreach (var entry in diff.Stdout.Split('\0', StringSplitOptions.RemoveEmptyEntries))
        {
            try
            {
                staged.Add(Path.GetFullPath(Path.Combine(toplevel, entry)));
            }
            catch (Exception exception) when (exception is ArgumentException or NotSupportedException or PathTooLongException)
            {
                continue;
            }
        }

        var changed = model.Records
            .Where(record => record.Id.Length > 0 && staged.Contains(record.File))
            .Select(record => record.Id)
            .ToHashSet(StringComparer.Ordinal);

        var scope = new HashSet<string>(changed, StringComparer.Ordinal);
        var links = new Dictionary<string, HashSet<string>>(StringComparer.Ordinal);

        foreach (var record in model.Records)
        {
            if (record.Id.Length == 0)
            {
                continue;
            }

            var targets = ModelBuilder.ResolvedLinks(model, record).Values
                .SelectMany(target => target)
                .Select(Identifiers.BaseId)
                .ToHashSet(StringComparer.Ordinal);

            links[record.Id] = targets;
        }

        foreach (var id in changed)
        {
            if (links.TryGetValue(id, out var targets))
            {
                scope.UnionWith(targets);
            }
        }

        foreach (var (id, targets) in links)
        {
            if (targets.Overlaps(changed))
            {
                scope.Add(id);
            }
        }

        var relative = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        foreach (var path in staged)
        {
            try
            {
                relative.Add(model.Config.Relative(path));
            }
            catch (Exception exception) when (exception is ArgumentException or NotSupportedException or PathTooLongException)
            {
                continue;
            }
        }

        // Staged code pulls its records into scope through the implements links.
        foreach (var link in model.Implements)
        {
            if (relative.Contains(link.Path))
            {
                scope.Add(link.To);
            }
        }

        return (new Scope(scope, staged, staged.Count), "");
    }

    /// <summary>Whether the finding touches the scope: a staged path or a scoped subject.</summary>
    public static bool InScope(Scope scope, Finding finding) =>
        scope.Files.Contains(finding.Path)
        || (finding.Subject is not null && scope.RecordIds.Contains(Identifiers.BaseId(finding.Subject)));

    static string Detail((int Status, string Stdout, string Error) run, string fallback) =>
        run.Error.Trim().Length > 0 ? run.Error.Trim() : fallback;

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
}
