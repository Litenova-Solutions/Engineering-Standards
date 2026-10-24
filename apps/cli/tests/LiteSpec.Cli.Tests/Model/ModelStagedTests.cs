using System.Diagnostics;
using LiteSpec.Tests.Support;

namespace LiteSpec.Tests.Model;

/// <summary>Proves <c>litespec model check --staged</c> checks the git index scope only.</summary>
public sealed class ModelStagedTests
{
    /// <summary>Copies a broken overlay over the prepared fixture, like the shared fixture does.</summary>
    static void ApplyOverlay(string target, string overlayName)
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
    }

    /// <summary>Runs git in the folder, throwing when it fails.</summary>
    static void RunGit(string workdir, params string[] args)
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
        _ = process.StandardOutput.ReadToEndAsync();
        var stderr = process.StandardError.ReadToEndAsync();

        if (!process.WaitForExit(TimeSpan.FromMinutes(2)))
        {
            process.Kill(entireProcessTree: true);
            throw new TimeoutException($"git {string.Join(' ', args)} did not finish in two minutes.");
        }

        if (process.ExitCode != 0)
        {
            throw new InvalidOperationException($"git {string.Join(' ', args)} failed: {stderr.Result}");
        }
    }

    /// <summary>Commits the whole fixture so the index starts clean.</summary>
    static void CommitAll(string path)
    {
        RunGit(path, "-c", "init.defaultBranch=main", "init");
        RunGit(path, "add", "-A");
        RunGit(
            path, "-c", "user.name=Test", "-c", "user.email=test@example.com",
            "-c", "commit.gpgsign=false", "commit", "-m", "init");
    }

    /// <summary>A staged check outside git explains itself and exits 2.</summary>
    [Fact]
    public void Check_Staged_Outside_Git_Exits_2()
    {
        using var fixture = ModelFixture.Prepare("large");
        var result = Cli.Run("model", "check", "--root", fixture.Path, "--staged");

        Assert.Equal(2, result.Status);
        Assert.Contains("git index", result.Output);
    }

    /// <summary>A staged check reports the staged record and skips the unstaged break.</summary>
    [Fact]
    public void Check_Staged_Reports_Only_Staged_Records()
    {
        using var fixture = ModelFixture.Prepare("large");

        CommitAll(fixture.Path);
        ApplyOverlay(fixture.Path, "paging-undeclared");
        ApplyOverlay(fixture.Path, "write-undeclared");
        RunGit(fixture.Path, "add", "docs/behavior/modules/lending/loans/list-loans.md");

        var staged = Cli.Run("model", "check", "--root", fixture.Path, "--staged");

        Assert.Equal(1, staged.Status);
        Assert.Contains("Staged scope:", staged.Output);
        Assert.Contains("paging-undeclared", staged.Output);
        Assert.DoesNotContain("write-undeclared", staged.Output);

        var json = Cli.Run("model", "check", "--root", fixture.Path, "--staged", "--format", "json");

        Assert.Equal(1, json.Status);
        Assert.Contains("scope", json.Output);
        Assert.Contains("staged", json.Output);
        Assert.Contains("paging-undeclared", json.Output);
        Assert.DoesNotContain("write-undeclared", json.Output);

        var full = Cli.Run("model", "check", "--root", fixture.Path, "--format", "json");

        Assert.Equal(1, full.Status);
        Assert.Contains("paging-undeclared", full.Output);
        Assert.Contains("write-undeclared", full.Output);
    }

    /// <summary>A staged check with nothing staged reports nothing and exits 0.</summary>
    [Fact]
    public void Check_Staged_With_Nothing_Staged_Exits_0()
    {
        using var fixture = ModelFixture.Prepare("large", "write-undeclared");

        CommitAll(fixture.Path);

        var staged = Cli.Run("model", "check", "--root", fixture.Path, "--staged");

        Assert.Equal(0, staged.Status);
        Assert.Contains("Staged scope: 0 files, 0 records.", staged.Output);
        Assert.Contains("0 findings, 0 known.", staged.Output);

        var full = Cli.Run("model", "check", "--root", fixture.Path, "--format", "json");

        Assert.Equal(1, full.Status);
        Assert.Contains("write-undeclared", full.Output);
    }
}
