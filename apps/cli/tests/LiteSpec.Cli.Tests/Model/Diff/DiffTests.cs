using System.Diagnostics;
using System.Text.Json;
using LiteSpec.Tests.Support;

namespace LiteSpec.Tests.Model.Diff;

/// <summary>Proves <c>litespec model diff</c> against the diff fixtures.</summary>
public sealed class DiffTests
{
    /// <summary>Identical models print empty sections and exit 0.</summary>
    [Fact]
    public void Identical_Models_Print_Empty_Sections()
    {
        using var folders = Prepare();
        var result = Cli.Run("model", "diff", folders.Base.Path, "--root", folders.Head.Path);

        Assert.Equal(0, result.Status);
        Assert.Contains("(0 breaking, 0 removed, 0 modified, 0 added)", result.Output);
        Assert.Contains("REMOVED (none)", result.Output);
        Assert.Contains("MODIFIED (none)", result.Output);
        Assert.Contains("ADDED (none)", result.Output);
    }

    /// <summary>The breaking overlay prints every section in review order with breaking markers.</summary>
    [Fact]
    public void Breaking_Overlay_Prints_Sections_In_Review_Order()
    {
        using var folders = Prepare("breaking");
        var result = Cli.Run("model", "diff", folders.Base.Path, "--root", folders.Head.Path);

        Assert.Equal(0, result.Status);
        Assert.Contains("(14 breaking, 7 removed, 6 modified, 3 added)", result.Output);
        Assert.True(
            result.Output.IndexOf("REMOVED", StringComparison.Ordinal)
            < result.Output.IndexOf("MODIFIED", StringComparison.Ordinal)
            && result.Output.IndexOf("MODIFIED", StringComparison.Ordinal)
            < result.Output.IndexOf("ADDED", StringComparison.Ordinal),
            "Sections print REMOVED, then MODIFIED, then ADDED.");
        Assert.Contains("Goals and requirements", result.Output);
        Assert.Contains("[BREAKING] Requirement \"Max active loans\" (functional)", result.Output);
        Assert.Contains("Why it breaks (requirement-narrowed)", result.Output);
        Assert.Contains("Why it breaks (quality-measure-changed)", result.Output);
        Assert.Contains("Why it breaks (refusal-added)", result.Output);
        Assert.Contains("Why it breaks (precondition-added)", result.Output);
        Assert.Contains("Why it breaks (result-removed)", result.Output);
        Assert.Contains("Why it breaks (scenario-removed)", result.Output);
        Assert.Contains("Why it breaks (state-removed)", result.Output);
        Assert.Contains("Why it breaks (transition-removed)", result.Output);
        Assert.Contains("Why it breaks (rule-weakened)", result.Output);
        Assert.Contains("Why it breaks (refusal-meaning-changed)", result.Output);
        Assert.Contains("Why it breaks (requirement-removed)", result.Output);
        Assert.Contains("Why it breaks (refusal-path-added)", result.Output);
        Assert.Contains("New refusal: Account blocked (lending.account-blocked) on use case \"Borrow copy\".", result.Output);
        Assert.Contains("State removed: Overdue.", result.Output);
        Assert.Contains("Transition removed: Active -> Overdue.", result.Output);
    }

    /// <summary>The breaking overlay exits 1 with --fail-on breaking.</summary>
    [Fact]
    public void Breaking_Overlay_Fails_On_Breaking()
    {
        using var folders = Prepare("breaking");
        var result = Cli.Run("model", "diff", folders.Base.Path, "--root", folders.Head.Path, "--fail-on", "breaking");

        Assert.Equal(1, result.Status);
        Assert.Contains("[BREAKING]", result.Output);
    }

    /// <summary>The nonbreaking overlay exits 0 with --fail-on breaking and names no breaking change.</summary>
    [Fact]
    public void Nonbreaking_Overlay_Passes_Fail_On_Breaking()
    {
        using var folders = Prepare("nonbreaking");
        var result = Cli.Run("model", "diff", folders.Base.Path, "--root", folders.Head.Path, "--fail-on", "breaking");

        Assert.Equal(0, result.Status);
        Assert.Contains("(0 breaking, 0 removed, 5 modified, 2 added)", result.Output);
        Assert.DoesNotContain("BREAKING", result.Output);
        Assert.Contains("REMOVED (none)", result.Output);
        Assert.Contains("Status changed from draft to approved.", result.Output);
        Assert.DoesNotContain("Maximum active loans", result.Output);
    }

    /// <summary>Markdown renders the comment surfaces: a title, sections and families.</summary>
    [Fact]
    public void Markdown_Renders_Comment_Surfaces()
    {
        using var folders = Prepare("breaking");
        var result = Cli.Run("model", "diff", folders.Base.Path, "--root", folders.Head.Path, "--format", "markdown");

        Assert.Equal(0, result.Status);
        Assert.Contains("# Intent diff:", result.Output);
        Assert.Contains("## REMOVED (7)", result.Output);
        Assert.Contains("## MODIFIED (6)", result.Output);
        Assert.Contains("## ADDED (3)", result.Output);
        Assert.Contains("### Goals and requirements", result.Output);
        Assert.Contains("**[BREAKING]**", result.Output);
    }

    /// <summary>JSON carries the summary, the ordered changes and stable fingerprints.</summary>
    [Fact]
    public void Json_Carries_Summary_Ordered_Changes_And_Fingerprints()
    {
        using var folders = Prepare("breaking");
        var first = Cli.Run("model", "diff", folders.Base.Path, "--root", folders.Head.Path, "--format", "json");
        var second = Cli.Run("model", "diff", folders.Base.Path, "--root", folders.Head.Path, "--format", "json");

        Assert.Equal(0, first.Status);
        Assert.Equal(0, second.Status);

        using var document = JsonDocument.Parse(first.Stdout);
        var root = document.RootElement;

        Assert.Equal(14, root.GetProperty("summary").GetProperty("breaking").GetInt32());
        Assert.Equal(7, root.GetProperty("summary").GetProperty("removed").GetInt32());
        Assert.Equal(6, root.GetProperty("summary").GetProperty("modified").GetInt32());
        Assert.Equal(3, root.GetProperty("summary").GetProperty("added").GetInt32());

        var changes = root.GetProperty("changes").EnumerateArray().ToList();

        Assert.Equal(16, changes.Count);
        Assert.All(changes, change =>
        {
            Assert.Equal(16, change.GetProperty("fingerprint").GetString()!.Length);
            Assert.NotEmpty(change.GetProperty("title").GetString()!);
        });
        Assert.Equal("removed", changes[0].GetProperty("change").GetString());
        Assert.Equal("added", changes[^1].GetProperty("change").GetString());

        var sequence = string.Join(",", changes.Select(change => change.GetProperty("change").GetString()).Distinct());

        Assert.Equal("removed,modified,added", sequence);
        Assert.Equal(JsonFingerprints(first.Stdout), JsonFingerprints(second.Stdout));
    }

    /// <summary>--breaking-only keeps the full counts and shows breaking entries alone.</summary>
    [Fact]
    public void Breaking_Only_Shows_Breaking_Entries_Alone()
    {
        using var folders = Prepare("breaking");
        var result = Cli.Run("model", "diff", folders.Base.Path, "--root", folders.Head.Path, "--breaking-only");

        Assert.Equal(0, result.Status);
        Assert.Contains("(14 breaking, 7 removed, 6 modified, 3 added) (breaking only)", result.Output);
        Assert.Contains("Max active loans", result.Output);
        Assert.DoesNotContain("Quiet hours", result.Output);
        Assert.DoesNotContain("List loans\" (query)", result.Output);
    }

    /// <summary>A base that is neither a folder nor a revision exits 2.</summary>
    [Fact]
    public void Unknown_Base_Exits_2()
    {
        using var folders = Prepare();
        var result = Cli.Run("model", "diff", "missing-base-ref-xyz", "--root", folders.Head.Path);

        Assert.Equal(2, result.Status);
        Assert.Contains("neither a consumer folder nor a git revision", result.Output);
    }

    /// <summary>An unknown --fail-on value exits 2.</summary>
    [Fact]
    public void Unknown_Fail_On_Exits_2()
    {
        using var folders = Prepare("breaking");
        var result = Cli.Run("model", "diff", folders.Base.Path, "--root", folders.Head.Path, "--fail-on", "everything");

        Assert.Equal(2, result.Status);
        Assert.Contains("Unknown fail-on", result.Output);
    }

    /// <summary>An unknown --format value exits 2.</summary>
    [Fact]
    public void Unknown_Format_Exits_2()
    {
        using var folders = Prepare("breaking");
        var result = Cli.Run("model", "diff", folders.Base.Path, "--root", folders.Head.Path, "--format", "yaml");

        Assert.Equal(2, result.Status);
        Assert.Contains("Unknown format", result.Output);
    }

    /// <summary>A missing base exits 2.</summary>
    [Fact]
    public void Missing_Base_Exits_2()
    {
        using var folders = Prepare();
        var result = Cli.Run("model", "diff", "--root", folders.Head.Path);

        Assert.Equal(2, result.Status);
        Assert.Contains("Diff needs a base.", result.Output);
    }

    /// <summary>A git revision base diffs the worktree against the revision.</summary>
    [Fact]
    public void Git_Revision_Base_Diffs_Against_The_Revision()
    {
        if (!GitAvailable())
        {
            Assert.Skip("git is not available.");
        }

        using var folder = Cli.Temp("diff-git");
        CopyBase(folder.Path);
        Git(folder.Path, "init", "-q");
        Git(folder.Path, "add", "-A");
        Git(folder.Path, "-c", "user.email=diff@test", "-c", "user.name=diff", "commit", "-qm", "base");
        DiffFixture.ApplyOverlay("breaking", folder.Path);

        var result = Cli.Run("model", "diff", "HEAD", "--root", folder.Path);

        Assert.Equal(0, result.Status);
        Assert.Contains("Intent diff: HEAD -> ", result.Output);
        Assert.Contains("(14 breaking, 7 removed, 6 modified, 3 added)", result.Output);
        Assert.Contains("[BREAKING]", result.Output);
    }

    static PairedFolders Prepare(string? overlay = null)
    {
        var (baseFolder, headFolder) = DiffFixture.Prepare(overlay);

        return new PairedFolders(baseFolder, headFolder);
    }

    static List<string> JsonFingerprints(string json)
    {
        using var document = JsonDocument.Parse(json);

        return document.RootElement.GetProperty("changes").EnumerateArray()
            .Select(change => change.GetProperty("fingerprint").GetString()!)
            .ToList();
    }

    static void CopyBase(string target)
    {
        var source = Cli.Fixture("Diff/base");

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

    static bool GitAvailable()
    {
        try
        {
            using var process = Process.Start(new ProcessStartInfo("git", "--version")
            {
                RedirectStandardOutput = true,
                RedirectStandardError = true,
                UseShellExecute = false,
            })!;

            return process.WaitForExit(TimeSpan.FromMinutes(1)) && process.ExitCode == 0;
        }
        catch (System.ComponentModel.Win32Exception)
        {
            return false;
        }
    }

    static void Git(string workdir, params string[] args)
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

        using var process = Process.Start(start)!;
        var stderr = process.StandardError.ReadToEndAsync();
        process.StandardOutput.ReadToEnd();

        if (!process.WaitForExit(TimeSpan.FromMinutes(2)) || process.ExitCode != 0)
        {
            throw new InvalidOperationException($"git {string.Join(' ', args)} failed: {stderr.Result}");
        }
    }

    /// <summary>Two temp folders disposed together.</summary>
    sealed class PairedFolders(TempFolder baseFolder, TempFolder headFolder) : IDisposable
    {
        public TempFolder Base { get; } = baseFolder;
        public TempFolder Head { get; } = headFolder;

        public void Dispose()
        {
            Base.Dispose();
            Head.Dispose();
        }
    }
}
