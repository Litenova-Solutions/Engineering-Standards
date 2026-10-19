using System.Text.Json;
using Litenova.Model;

if (args.Length == 0 || args is ["--help"] or ["-h"] or ["help"])
{
    Console.WriteLine("Usage:");
    Console.WriteLine("  Litenova.Model build --root <consumer> [--out model.json]");
    Console.WriteLine("  Litenova.Model check --root <consumer> [--format json]");
    Console.WriteLine("  Litenova.Model render --root <consumer>");
    Console.WriteLine("  Litenova.Model query --root <consumer> <id>");
    return 2;
}

var command = args[0];
var root = Option(args, "--root") ?? Directory.GetCurrentDirectory();

if (!Directory.Exists(root))
{
    Console.Error.WriteLine($"Root '{root}' does not exist.");
    return 2;
}

var config = ConsumerConfig.Load(root);

try
{
    switch (command)
    {
        case "build":
        {
            var model = ModelBuilder.Build(config);
            var output = Option(args, "--out") ?? Path.Combine(root, ".model", "model.json");

            Directory.CreateDirectory(Path.GetDirectoryName(Path.GetFullPath(output))!);
            File.WriteAllText(output, model.ToJson() + Environment.NewLine);

            Console.WriteLine($"{Relative(root, output)}: {model.Records.Count} records, {model.Code.Handlers.Count} handlers, {model.Screens.Count} screens, {model.Tests.Count} scenarios.");
            return 0;
        }

        case "check":
        {
            var model = ModelBuilder.Build(config);
            var (findings, known) = Checker.Check(model);
            var json = Option(args, "--format") == "json";

            if (json)
            {
                Console.WriteLine(JsonSerializer.Serialize(
                    new
                    {
                        findings = findings.Select(AsJson(config)).ToList(),
                        known = known.Select(AsJson(config)).ToList(),
                    },
                    new JsonSerializerOptions { WriteIndented = true }));
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
            var id = args.Last();

            if (id.StartsWith("--", StringComparison.Ordinal) || id == "query")
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

static string? Option(string[] args, string name)
{
    for (var index = 0; index + 1 < args.Length; index++)
    {
        if (args[index] == name)
        {
            return args[index + 1];
        }
    }

    return null;
}

static string Relative(string root, string path) =>
    Path.GetRelativePath(root, path).Replace(Path.DirectorySeparatorChar, '/');

static Func<Finding, object> AsJson(ConsumerConfig config) => finding => new
{
    code = finding.Code,
    message = finding.Message,
    path = config.Relative(finding.Path),
    line = finding.Line,
    subject = finding.Subject,
};
