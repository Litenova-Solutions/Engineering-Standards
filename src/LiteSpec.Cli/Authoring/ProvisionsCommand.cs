namespace LiteSpec.Authoring;

/// <summary>
///     The <c>litespec provisions</c> command: writes <c>docs/reference/provisions.md</c>
///     from the active standards, with each provision's Verification mark and evidence.
/// </summary>
static class ProvisionsCommand
{
    /// <summary>The command's usage text.</summary>
    public const string Usage = """
        Usage: litespec provisions [--root <path>] [--check] [--help]

        Writes docs/reference/provisions.md from the active standards in root, which defaults
        to the LiteSpec checkout this tool belongs to.

          --root    The repository root. Defaults to the LiteSpec checkout.
          --check   Compare the tracked index with the generated one and write nothing.
          --help    Print this text and exit.

        Exit codes: 0 written or current, 1 stale under --check, 2 usage error.
        """;

    /// <summary>Runs the command and returns its exit code.</summary>
    public static int Run(string[] args)
    {
        var parsed = CliArgs.Parse(args, ["--check"], ["--root"]);

        if (parsed.Help)
        {
            Console.WriteLine(Usage);
            return 0;
        }

        if (parsed.Error is not null)
        {
            Console.Error.WriteLine(parsed.Error);
            Console.Error.WriteLine(Usage);
            return 2;
        }

        string root;
        var configured = parsed.Value("--root");

        if (configured is not null)
        {
            try
            {
                root = Path.GetFullPath(configured);
            }
            catch (Exception exception) when (exception is ArgumentException or NotSupportedException)
            {
                Console.Error.WriteLine($"Invalid root '{configured}'.");
                Console.Error.WriteLine(Usage);
                return 2;
            }
        }
        else
        {
            try
            {
                root = LiteSpecHome.RequireRoot();
            }
            catch (InvalidOperationException exception)
            {
                Console.Error.WriteLine(exception.Message);
                Console.Error.WriteLine(Usage);
                return 2;
            }
        }

        var target = Path.Combine(root, Provisions.IndexPath.Replace('/', Path.DirectorySeparatorChar));
        var expected = Provisions.BuildIndex(root) + "\n";
        var actual = File.Exists(target) ? File.ReadAllText(target).Replace("\r\n", "\n", StringComparison.Ordinal) : null;

        if (parsed.Has("--check"))
        {
            if (actual == expected)
            {
                Console.WriteLine($"{Provisions.IndexPath} is current.");
                return 0;
            }

            Console.Error.WriteLine($"{Provisions.IndexPath} is stale. Run: litespec provisions");
            return 1;
        }

        Directory.CreateDirectory(Path.GetDirectoryName(target)!);
        File.WriteAllText(target, expected);
        Console.WriteLine($"Wrote {Provisions.IndexPath}.");
        return 0;
    }
}
