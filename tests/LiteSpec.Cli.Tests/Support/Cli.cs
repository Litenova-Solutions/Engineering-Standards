using System.Diagnostics;

namespace LiteSpec.Tests.Support;

/// <summary>The exit code and the two output streams of one CLI run.</summary>
/// <param name="Status">The exit code.</param>
/// <param name="Stdout">Everything written to standard output.</param>
/// <param name="Stderr">Everything written to standard error.</param>
sealed record CliResult(int Status, string Stdout, string Stderr)
{
    /// <summary>Both streams, standard output first.</summary>
    public string Output => Stdout + Stderr;
}

/// <summary>
///     Runs the built <c>litespec</c> CLI as its own process, the way a consumer
///     runs it, so a case proves the exit code and the printed text together.
/// </summary>
static class Cli
{
    /// <summary>The LiteSpec repository root, found above the test binary.</summary>
    public static string Repository { get; } = FindRepository();

    /// <summary>A folder under the test fixtures, from forward-slash segments.</summary>
    public static string Fixture(string relative) =>
        Path.Combine(Repository, "tests", "LiteSpec.Cli.Tests", "Fixtures", relative.Replace('/', Path.DirectorySeparatorChar));

    /// <summary>Runs <c>litespec</c> with the arguments, in the working directory when one is given.</summary>
    public static CliResult Run(IEnumerable<string> args, string? workingDirectory = null, IDictionary<string, string>? environment = null)
    {
        var start = new ProcessStartInfo("dotnet")
        {
            RedirectStandardOutput = true,
            RedirectStandardError = true,
            UseShellExecute = false,
            WorkingDirectory = workingDirectory ?? Repository,
        };

        start.ArgumentList.Add(Path.Combine(AppContext.BaseDirectory, "litespec.dll"));

        foreach (var arg in args)
        {
            start.ArgumentList.Add(arg);
        }

        start.Environment["LITESPEC_HOME"] = Repository;

        foreach (var (key, value) in environment ?? new Dictionary<string, string>())
        {
            start.Environment[key] = value;
        }

        using var process = Process.Start(start)!;
        var stdout = process.StandardOutput.ReadToEndAsync();
        var stderr = process.StandardError.ReadToEndAsync();

        if (!process.WaitForExit(TimeSpan.FromMinutes(3)))
        {
            process.Kill(entireProcessTree: true);
            throw new TimeoutException($"litespec {string.Join(' ', args)} did not finish in three minutes.");
        }

        return new CliResult(process.ExitCode, stdout.Result, stderr.Result);
    }

    /// <summary>Runs <c>litespec</c> with the arguments.</summary>
    public static CliResult Run(params string[] args) => Run((IEnumerable<string>)args);

    /// <summary>A fresh, empty temporary folder that the caller deletes.</summary>
    public static TempFolder Temp(string prefix) => new(prefix);

    static string FindRepository()
    {
        for (var folder = new DirectoryInfo(AppContext.BaseDirectory); folder is not null; folder = folder.Parent)
        {
            if (File.Exists(Path.Combine(folder.FullName, "litespec.manifest.json")))
            {
                return folder.FullName;
            }
        }

        throw new InvalidOperationException("The test binary sits outside a LiteSpec checkout.");
    }
}

/// <summary>A temporary folder deleted on dispose, unless KEEP_FIXTURE is set.</summary>
sealed class TempFolder : IDisposable
{
    public TempFolder(string prefix)
    {
        Path = Directory.CreateTempSubdirectory($"litespec-{prefix}-").FullName;
    }

    /// <summary>The folder's full path.</summary>
    public string Path { get; }

    public void Dispose()
    {
        if (Environment.GetEnvironmentVariable("KEEP_FIXTURE") is null)
        {
            try
            {
                Directory.Delete(Path, recursive: true);
            }
            catch (IOException)
            {
            }
            catch (UnauthorizedAccessException)
            {
            }
        }
    }
}
