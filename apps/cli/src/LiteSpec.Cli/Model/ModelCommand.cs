using System.Text.Json;
using LiteSpec.Model.Diff;

namespace LiteSpec.Model;

/// <summary>
///     The <c>litespec model</c> command: build, check, render and query a consumer's project model.
/// </summary>
static class ModelCommand
{
    public const string Usage = """
        Usage:
          litespec model build --root <consumer> [--out model.json]
          litespec model check --root <consumer> [--format json]
          litespec model render --root <consumer>
          litespec model query --root <consumer> <id>
          litespec model diff <base> --root <consumer> [--format text|markdown|json] [--fail-on breaking] [--breaking-only]
          litespec model --help

        Exit codes: 0 no open finding, 1 an open finding, no record with the id, or a breaking intent change with --fail-on breaking, 2 usage error.
        """;

    public static int Run(string[] args)
    {
        if (args.Length == 0 || args is ["--help"] or ["-h"] or ["help"])
        {
            Console.WriteLine(Usage);
            return args.Length == 0 ? 2 : 0;
        }

        var command = args[0];
        var parsed = CliArgs.Parse(
            args[1..],
            command == "diff" ? ["--breaking-only"] : [],
            command == "diff" ? ["--root", "--out", "--format", "--fail-on"] : ["--root", "--out", "--format"],
            maxPositionals: command is "query" or "diff" ? 1 : 0);

        if (parsed.Help)
        {
            Console.WriteLine(Usage);
            return 0;
        }

        var formatError = command == "diff" ? DiffFormatError(parsed.Value("--format")) : parsed.FormatError;

        if ((parsed.Error ?? formatError) is { } error)
        {
            Console.Error.WriteLine(error);
            Console.Error.WriteLine(Usage);
            return 2;
        }

        string root;

        try
        {
            root = parsed.Root();
        }
        catch (Exception exception) when (exception is ArgumentException or NotSupportedException or PathTooLongException)
        {
            Console.Error.WriteLine($"Invalid root '{parsed.Value("--root")}': {exception.Message}");
            return 2;
        }

        if (!Directory.Exists(root))
        {
            Console.Error.WriteLine($"Root '{root}' does not exist.");
            return 2;
        }

        // Without a project file every path falls back to a default, and the
        // check would pass a folder that is not a consumer at all.
        if (!File.Exists(Path.Combine(root, "litespec.project.json")))
        {
            Console.Error.WriteLine($"Root '{root}' holds no litespec.project.json.");
            return 2;
        }

        ConsumerConfig config;

        try
        {
            config = ConsumerConfig.Load(root);
        }
        catch (JsonException exception)
        {
            Console.Error.WriteLine($"litespec.project.json is not valid JSON: {exception.Message}");
            return 2;
        }

        try
        {
            switch (command)
            {
                case "build":
                {
                    var model = ModelBuilder.Build(config);
                    var output = parsed.Value("--out") ?? Path.Combine(root, ".model", "model.json");

                    Directory.CreateDirectory(Path.GetDirectoryName(Path.GetFullPath(output))!);
                    File.WriteAllText(output, model.ToJson() + "\n");

                    Console.WriteLine($"{Relative(root, output)}: {model.Records.Count} records, {model.Code.Handlers.Count} handlers, {model.Screens.Count} screens, {model.Tests.Count} scenarios.");
                    return 0;
                }

                case "check":
                {
                    var model = ModelBuilder.Build(config);
                    var (findings, known) = Checker.Check(model);
                    var json = parsed.Json;

                    if (json)
                    {
                        Console.WriteLine(JsonSerializer.Serialize(
                            new
                            {
                                findings = findings.Select(AsJson(config)).ToList(),
                                known = known.Select(AsJson(config)).ToList(),
                            },
                            CliJson.Options));
                    }
                    else
                    {
                        foreach (var finding in findings)
                        {
                            Console.WriteLine($"{config.Relative(finding.Path)}:{finding.Line} [{finding.Code}] {finding.Message}");
                        }

                        foreach (var gap in known)
                        {
                            Console.WriteLine($"{config.Relative(gap.Path)}:{gap.Line} [known {gap.Code}] {gap.Message}");
                        }

                        Console.WriteLine($"{findings.Count} findings, {known.Count} known.");
                    }

                    return findings.Count == 0 ? 0 : 1;
                }

                case "render":
                {
                    var model = ModelBuilder.Build(config);
                    var changed = Renderer.Render(model);

                    foreach (var file in changed)
                    {
                        Console.WriteLine(file);
                    }

                    Console.WriteLine($"{changed.Count} files rewritten.");
                    return 0;
                }

                case "query":
                {
                    if (parsed.Positionals is not [var id])
                    {
                        Console.Error.WriteLine("Query needs an id.");
                        return 2;
                    }

                    var model = ModelBuilder.Build(config);
                    var answer = Querier.Query(model, id);

                    if (answer is null)
                    {
                        Console.Error.WriteLine($"No record holds '{id}'.");
                        return 1;
                    }

                    Console.WriteLine(answer);
                    return 0;
                }

                case "diff":
                {
                    if (parsed.Positionals is not [var baseArg])
                    {
                        Console.Error.WriteLine("Diff needs a base.");
                        return 2;
                    }

                    if (parsed.Value("--fail-on") is { } failOn && failOn != "breaking")
                    {
                        Console.Error.WriteLine($"Unknown fail-on '{failOn}'; use breaking.");
                        return 2;
                    }

                    var format = parsed.Value("--format") ?? "text";
                    var breakingOnly = parsed.Has("--breaking-only");
                    var headModel = ModelBuilder.Build(config);

                    DiffBase checkout;

                    try
                    {
                        checkout = DiffBase.Load(config, baseArg);
                    }
                    catch (InvalidOperationException exception)
                    {
                        Console.Error.WriteLine(exception.Message);
                        return 2;
                    }

                    using (checkout)
                    {
                        var diff = Differ.Diff(
                            checkout.Model, headModel, checkout.Label, DiffBase.HeadLabel(config));

                        Console.WriteLine(format switch
                        {
                            "markdown" => DiffFormatter.Markdown(diff, breakingOnly),
                            "json" => DiffFormatter.Json(diff, breakingOnly),
                            _ => DiffFormatter.Text(diff, breakingOnly),
                        });

                        return parsed.Value("--fail-on") == "breaking" && diff.BreakingCount > 0 ? 1 : 0;
                    }
                }

                default:
                    Console.Error.WriteLine($"Unknown command '{command}'.");
                    return 2;
            }
        }
        catch (Exception exception)
        {
            Console.Error.WriteLine($"Failed: {exception.Message}");
            return 1;
        }
    }

    static string Relative(string root, string path) =>
        Path.GetRelativePath(root, path).Replace(Path.DirectorySeparatorChar, '/');

    static string? DiffFormatError(string? format) =>
        format is null or "text" or "markdown" or "json"
            ? null
            : $"Unknown format '{format}'; use text, markdown or json.";

    static Func<Finding, object> AsJson(ConsumerConfig config) => finding => new
    {
        code = finding.Code,
        message = finding.Message,
        path = config.Relative(finding.Path),
        line = finding.Line,
        subject = finding.Subject,
    };
}
