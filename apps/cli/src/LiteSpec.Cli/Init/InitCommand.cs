using System.Text.Json.Nodes;

namespace LiteSpec.Init;

/// <summary>
///     The <c>litespec init</c> command: writes a consumer's <c>litespec.project.json</c>
///     from one of the ready-made presets in <c>templates/presets/</c>.
/// </summary>
static class InitCommand
{
    /// <summary>The preset names <c>litespec init</c> accepts, in list order.</summary>
    static readonly string[] Presets = ["blazor-client", "dotnet-react", "dotnet-svelte"];

    /// <summary>The command's usage text.</summary>
    public const string Usage = """
        Usage: litespec init --preset <name> --size <small|large> [--root <path>] [--name <project>] [--help]

        Writes litespec.project.json into root from the named preset, stamped with the
        LiteSpec release this tool belongs to. The preset selects the shape, the stacks
        and the frontends; --size and --name complete the project record. The command
        never overwrites an existing project file.

          --preset   One of: blazor-client, dotnet-react, dotnet-svelte.
          --size     The project size: small or large.
          --root     The consumer repository to write into. Defaults to the working directory.
          --name     The project name. Defaults to the root folder's name.
          --help     Print this text and exit.

        Exit codes: 0 written, 1 the checkout's template or preset is unreadable, 2 the file exists or an option is invalid.
        """;

    /// <summary>Runs the command and returns its exit code.</summary>
    public static int Run(string[] args)
    {
        var parsed = CliArgs.Parse(args, [], ["--preset", "--size", "--root", "--name"]);

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

        var size = parsed.Value("--size");

        if (size is not ("small" or "large"))
        {
            Console.Error.WriteLine(size is null
                ? "Missing --size; use small or large."
                : $"Unknown size '{size}'; use small or large.");
            Console.Error.WriteLine(Usage);
            return 2;
        }

        var preset = parsed.Value("--preset");

        if (preset is null || !Presets.Contains(preset))
        {
            Console.Error.WriteLine(preset is null
                ? $"Missing --preset. Known presets: {string.Join(", ", Presets)}."
                : $"Unknown preset '{preset}'. Known presets: {string.Join(", ", Presets)}.");
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
            Console.Error.WriteLine(Usage);
            return 2;
        }

        var target = Path.Combine(root, "litespec.project.json");

        if (File.Exists(target))
        {
            Console.Error.WriteLine($"'{target}' already exists; litespec init never overwrites it.");
            return 2;
        }

        string home;

        try
        {
            home = LiteSpecHome.RequireRoot();
        }
        catch (InvalidOperationException exception)
        {
            Console.Error.WriteLine(exception.Message);
            Console.Error.WriteLine(Usage);
            return 2;
        }

        var version = LiteSpecHome.Version;

        if (version is null)
        {
            Console.Error.WriteLine("The LiteSpec checkout holds no readable version.");
            return 1;
        }

        JsonObject project;
        JsonObject overlay;

        try
        {
            if (CliJson.TryRead(Path.Combine(home, "templates", "consumer", "litespec.project.json")) is not JsonObject template)
            {
                Console.Error.WriteLine("The LiteSpec checkout holds no readable templates/consumer/litespec.project.json.");
                return 1;
            }

            if (CliJson.TryRead(Path.Combine(home, "templates", "presets", $"{preset}.json")) is not JsonObject presetJson
                || presetJson["shape"] is null
                || presetJson["stacks"] is null)
            {
                Console.Error.WriteLine($"The LiteSpec checkout holds no readable templates/presets/{preset}.json.");
                return 1;
            }

            project = template;
            overlay = presetJson;
        }
        catch (Exception exception) when (exception is IOException or UnauthorizedAccessException)
        {
            Console.Error.WriteLine($"Failed to read the LiteSpec checkout: {exception.Message}");
            return 1;
        }

        project["shape"] = overlay["shape"]!.DeepClone();
        project["stacks"] = overlay["stacks"]!.DeepClone();
        project["size"] = size;

        var paths = project["paths"] as JsonObject;

        if (paths is null)
        {
            paths = [];
            project["paths"] = paths;
        }

        if ((overlay["paths"] as JsonObject)?["frontends"] is not null)
        {
            paths["frontends"] = overlay["paths"]!["frontends"]!.DeepClone();
        }

        // The shared UI package and its pattern catalog belong to the controlled web
        // frontends; a preset without one would declare a package no frontend uses.
        var controlled = (paths["frontends"] as JsonArray)?
            .Any(frontend => (string?)frontend?["platform"] is "react" or "svelte") ?? false;

        if (!controlled)
        {
            paths.Remove("uiPackage");
            paths.Remove("uiPatterns");
        }

        var record = project["project"] as JsonObject;

        if (record is null)
        {
            record = [];
            project["project"] = record;
        }

        var name = parsed.Value("--name") ?? new DirectoryInfo(root).Name;
        record["name"] = name;
        project["reviewedLiteSpecVersion"] = version;

        // The template names the project as __PROJECT__ in paths and package names; the
        // name fills those, and every other placeholder is left for the owner to fill.
        Fill(project, "__PROJECT__", name);
        var unfilled = Placeholders(project).Distinct(StringComparer.Ordinal).Order(StringComparer.Ordinal).ToList();

        try
        {
            Directory.CreateDirectory(root);
            File.WriteAllText(target, CliJson.Serialize(project) + "\n");
        }
        catch (Exception exception) when (exception is IOException or UnauthorizedAccessException)
        {
            Console.Error.WriteLine($"Failed to write '{target}': {exception.Message}");
            return 1;
        }

        Console.WriteLine($"Wrote {target}.");

        if (unfilled.Count > 0)
        {
            Console.WriteLine($"Fill these placeholders before validating: {string.Join(", ", unfilled)}.");
        }

        Console.WriteLine("Next step: litespec consumer");
        return 0;
    }

    /// <summary>Replaces a placeholder inside every string value of the document.</summary>
    static void Fill(JsonNode? node, string placeholder, string value)
    {
        switch (node)
        {
            case JsonObject jsonObject:
                foreach (var key in jsonObject.Select(entry => entry.Key).ToList())
                {
                    if (jsonObject[key] is JsonValue text && text.TryGetValue<string>(out var current))
                    {
                        jsonObject[key] = current.Replace(placeholder, value, StringComparison.Ordinal);
                    }
                    else
                    {
                        Fill(jsonObject[key], placeholder, value);
                    }
                }

                break;
            case JsonArray array:
                for (var index = 0; index < array.Count; index++)
                {
                    if (array[index] is JsonValue text && text.TryGetValue<string>(out var current))
                    {
                        array[index] = current.Replace(placeholder, value, StringComparison.Ordinal);
                    }
                    else
                    {
                        Fill(array[index], placeholder, value);
                    }
                }

                break;
        }
    }

    /// <summary>Every template placeholder, such as <c>__OWNER__</c>, still in the document.</summary>
    public static IEnumerable<string> Placeholders(JsonNode? node) => node switch
    {
        JsonObject jsonObject => jsonObject.SelectMany(entry => Placeholders(entry.Value)),
        JsonArray array => array.SelectMany(Placeholders),
        JsonValue value when value.TryGetValue<string>(out var text) => PlaceholderPattern.Matches(text).Select(match => match.Value),
        _ => [],
    };

    static readonly System.Text.RegularExpressions.Regex PlaceholderPattern = new(@"__[A-Z][A-Z0-9_]*?__");
}
