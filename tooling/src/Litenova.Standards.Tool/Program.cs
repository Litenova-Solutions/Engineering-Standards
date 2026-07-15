using System.Text.Json;
using Litenova.Standards.Models;
using Litenova.Standards.Services;

return await ToolProgram.RunAsync(args);

internal static class ToolProgram
{
    public static Task<int> RunAsync(string[] args)
    {
        if (args.Length == 0 || args[0] is "help" or "--help" or "-h")
        {
            WriteHelp();
            return Task.FromResult(0);
        }

        try
        {
            var options = CliOptions.Parse(args[1..]);
            var root = options.Get("root") is { } rootOption
                ? Path.GetFullPath(rootOption)
                : StandardsRepository.FindRoot(Directory.GetCurrentDirectory());
            var repository = StandardsRepository.Load(root);

            return Task.FromResult(args[0] switch
            {
                "validate" => Validate(repository, options),
                "generate" => Generate(repository),
                "check" => Check(repository, options),
                "context" => Context(repository, options),
                _ => UnknownCommand(args[0]),
            });
        }
        catch (Exception exception) when (exception is IOException or InvalidDataException or InvalidOperationException or JsonException)
        {
            Console.Error.WriteLine(exception.Message);
            return Task.FromResult(2);
        }
    }

    private static int Validate(StandardsRepository repository, CliOptions options)
    {
        var report = StandardsValidator.Validate(repository, options.Get("project"));
        WriteReport(report, options.Has("json"));
        return report.IsValid ? 0 : 1;
    }

    private static int Generate(StandardsRepository repository)
    {
        var report = StandardsValidator.Validate(repository);
        if (!report.IsValid)
        {
            WriteReport(report, asJson: false);
            return 1;
        }

        StandardsGenerator.Write(repository);
        Console.WriteLine($"Generated {StandardsGenerator.Render(repository).Count} files.");
        return 0;
    }

    private static int Check(StandardsRepository repository, CliOptions options)
    {
        var validation = StandardsValidator.Validate(repository, options.Get("project"));
        var generated = StandardsGenerator.Check(repository);
        var combined = new ValidationReport();
        foreach (var issue in validation.Errors.Concat(generated.Errors))
        {
            combined.Error(issue.Code, issue.Message, issue.Path);
        }

        foreach (var issue in validation.Warnings.Concat(generated.Warnings))
        {
            combined.Warning(issue.Code, issue.Message, issue.Path);
        }

        WriteReport(combined, options.Has("json"));
        return combined.IsValid ? 0 : 1;
    }

    private static int Context(StandardsRepository repository, CliOptions options)
    {
        var task = options.Require("task");
        var result = ContextResolver.Resolve(repository, task, options.Get("project"), options.Get("use-case"));
        Console.Write(JsonSupport.Serialize(result));
        return 0;
    }

    private static void WriteReport(ValidationReport report, bool asJson)
    {
        if (asJson)
        {
            Console.Write(JsonSupport.Serialize(new
            {
                valid = report.IsValid,
                errors = report.Errors,
                warnings = report.Warnings,
            }));
            return;
        }

        foreach (var issue in report.Errors)
        {
            Console.Error.WriteLine($"error {issue.Code}: {issue.Message}{FormatPath(issue.Path)}");
        }

        foreach (var issue in report.Warnings)
        {
            Console.WriteLine($"warning {issue.Code}: {issue.Message}{FormatPath(issue.Path)}");
        }

        Console.WriteLine(report.IsValid
            ? $"Validation passed with {report.Warnings.Count} warning(s)."
            : $"Validation failed with {report.Errors.Count} error(s).");
    }

    private static string FormatPath(string? path) => path is null ? string.Empty : $" [{path}]";

    private static int UnknownCommand(string command)
    {
        Console.Error.WriteLine($"Unknown command: {command}.");
        WriteHelp();
        return 2;
    }

    private static void WriteHelp()
    {
        Console.WriteLine("Litenova Engineering Standards Tool");
        Console.WriteLine();
        Console.WriteLine("Commands:");
        Console.WriteLine("  validate [--root PATH] [--project PATH] [--json]");
        Console.WriteLine("  generate [--root PATH]");
        Console.WriteLine("  check [--root PATH] [--project PATH] [--json]");
        Console.WriteLine("  context --task NAME [--project PATH] [--use-case ID] [--root PATH]");
    }
}

internal sealed class CliOptions
{
    private readonly IReadOnlyDictionary<string, string?> _values;

    private CliOptions(IReadOnlyDictionary<string, string?> values) => _values = values;

    public static CliOptions Parse(string[] args)
    {
        var values = new Dictionary<string, string?>(StringComparer.Ordinal);
        for (var index = 0; index < args.Length; index++)
        {
            var argument = args[index];
            if (!argument.StartsWith("--", StringComparison.Ordinal))
            {
                throw new InvalidOperationException($"Unexpected argument: {argument}.");
            }

            var name = argument[2..];
            if (index + 1 < args.Length && !args[index + 1].StartsWith("--", StringComparison.Ordinal))
            {
                values[name] = args[++index];
            }
            else
            {
                values[name] = null;
            }
        }

        return new CliOptions(values);
    }

    public bool Has(string name) => _values.ContainsKey(name);

    public string? Get(string name) => _values.TryGetValue(name, out var value) ? value : null;

    public string Require(string name) => Get(name)
        ?? throw new InvalidOperationException($"Missing required option --{name}.");
}

