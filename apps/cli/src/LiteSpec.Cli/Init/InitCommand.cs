using System.Text.Json.Nodes;

namespace LiteSpec.Init;

/// <summary>
///     The <c>litespec init</c> command: writes a consumer's <c>litespec.project.json</c>
///     from one of the ready-made presets in <c>templates/presets/</c>, and copies the
///     starting agent context, glossary, and example cast from <c>templates/consumer/</c>.
/// </summary>
static class InitCommand
{
    /// <summary>The preset names <c>litespec init</c> accepts, in list order.</summary>
    static readonly string[] Presets = ["blazor-client", "dotnet-react", "dotnet-svelte"];

    /// <summary>The setup templates copied beside the project file: the release file and its consumer path.</summary>
    static readonly (string Template, string Target)[] Scaffold =
    [
        ("project-agents.md", "AGENTS.md"),
        ("glossary.json", "docs/glossary.json"),
        ("example-cast.md", "docs/domain/example-cast.md"),
    ];

    /// <summary>The command's usage text.</summary>
    public const string Usage = """
        Usage: litespec init --preset <name> --size <small|large> [--root <path>] [--name <project>] [--help]

        Writes litespec.project.json into root from the named preset, stamped with the
        LiteSpec release this tool carries, and copies the starting agent context,
        glossary, and example cast beside it. A fresh AGENTS.md carries the LiteSpec
        block filled with the release, size, shape, stacks, and selection index of the
        new project. The command also writes .config/dotnet-tools.json pinning the
        LiteSpec.Cli tool at the release. The preset selects the shape, the stacks
        and the frontends; --size and --name complete the project record. The command
        never overwrites an existing file: it writes each missing file and leaves
        existing ones alone.

          --preset   One of: blazor-client, dotnet-react, dotnet-svelte.
          --size     The project size: small or large.
          --root     The consumer repository to write into. Defaults to the working directory.
          --name     The project name. Defaults to the root folder's name.
          --help     Print this text and exit.

        Exit codes: 0 written, 1 the release's template, preset, or scaffold file is unreadable, 2 the project file exists or an option is invalid.
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
            Console.Error.WriteLine("The LiteSpec release holds no readable version.");
            return 1;
        }

        JsonObject project;
        JsonObject overlay;
        Dictionary<string, string> scaffold;

        try
        {
            if (CliJson.TryRead(Path.Combine(home, "templates", "consumer", "litespec.project.json")) is not JsonObject template)
            {
                Console.Error.WriteLine("The LiteSpec release holds no readable templates/consumer/litespec.project.json.");
                return 1;
            }

            if (CliJson.TryRead(Path.Combine(home, "templates", "presets", $"{preset}.json")) is not JsonObject presetJson
                || presetJson["shape"] is null
                || presetJson["stacks"] is null)
            {
                Console.Error.WriteLine($"The LiteSpec release holds no readable templates/presets/{preset}.json.");
                return 1;
            }

            // The scaffold sources are read before anything is written, so a broken
            // release fails before the project file exists without its companions.
            scaffold = [];

            foreach (var (file, _) in Scaffold)
            {
                var source = Path.Combine(home, "templates", "consumer", file);

                if (!File.Exists(source))
                {
                    Console.Error.WriteLine($"The LiteSpec release holds no readable templates/consumer/{file}.");
                    return 1;
                }

                scaffold[file] = File.ReadAllText(source);
            }

            project = template;
            overlay = presetJson;
        }
        catch (Exception exception) when (exception is IOException or UnauthorizedAccessException)
        {
            Console.Error.WriteLine($"Failed to read the LiteSpec release: {exception.Message}");
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
        // An npm package scope must be lowercase, so a scope takes the name in lowercase
        // kebab case: Team Expenses becomes @team-expenses/ui.
        Fill(project, "@__PROJECT__/", $"@{PackageScope(name)}/");
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

        var copied = 0;
        var shapeText = (string?)project["shape"] ?? "server";
        var stackNames = (project["stacks"] as JsonArray)?
            .Select(entry => (string?)entry)
            .OfType<string>()
            .ToList() ?? [];

        foreach (var (file, relative) in Scaffold)
        {
            var destination = Path.GetFullPath(Path.Combine(root, relative.Replace('/', Path.DirectorySeparatorChar)));

            if (File.Exists(destination))
            {
                Console.WriteLine($"'{destination}' already exists; left alone.");
                continue;
            }

            var contents = file == "project-agents.md"
                ? FillAgents(scaffold[file], version, size, shapeText, stackNames)
                : scaffold[file];

            try
            {
                Directory.CreateDirectory(Path.GetDirectoryName(destination)!);
                File.WriteAllText(destination, contents);
            }
            catch (Exception exception) when (exception is IOException or UnauthorizedAccessException)
            {
                Console.Error.WriteLine($"Failed to write '{destination}': {exception.Message}");
                return 1;
            }

            Console.WriteLine($"Wrote {destination}.");
            copied += 1;
        }

        var toolManifest = Path.Combine(root, ".config", "dotnet-tools.json");

        if (File.Exists(toolManifest))
        {
            Console.WriteLine($"'{toolManifest}' already exists; left alone.");
        }
        else
        {
            try
            {
                Directory.CreateDirectory(Path.GetDirectoryName(toolManifest)!);
                File.WriteAllText(toolManifest, ToolManifest(version));
            }
            catch (Exception exception) when (exception is IOException or UnauthorizedAccessException)
            {
                Console.Error.WriteLine($"Failed to write '{toolManifest}': {exception.Message}");
                return 1;
            }

            Console.WriteLine($"Wrote {toolManifest}.");
        }

        if (unfilled.Count > 0)
        {
            Console.WriteLine($"Fill these placeholders before validating: {string.Join(", ", unfilled)}.");
        }

        if (copied > 0)
        {
            Console.WriteLine("Fill every <placeholder> in the copied files before validating.");
        }

        Console.WriteLine("Next step: dotnet litespec consumer");
        return 0;
    }

    /// <summary>Fills the LiteSpec block of a fresh agent context with the new project's selection.</summary>
    static string FillAgents(string text, string version, string size, string shape, IReadOnlyList<string> stacks) =>
        text.Replace("__LITESPEC_VERSION__", version, StringComparison.Ordinal)
            .Replace("__SIZE__", size, StringComparison.Ordinal)
            .Replace("__SHAPE__", shape, StringComparison.Ordinal)
            .Replace("__STACKS__", JoinList(stacks), StringComparison.Ordinal)
            .Replace("__SELECTION_KEY__", $"{shape}.{string.Join(".", stacks)}", StringComparison.Ordinal);

    /// <summary>The stacks as prose, the way the selection page joins them: none, one, or joined with commas and and.</summary>
    static string JoinList(IReadOnlyList<string> items) => items.Count switch
    {
        0 => "none",
        1 => items[0],
        2 => $"{items[0]} and {items[1]}",
        _ => $"{string.Join(", ", items.Take(items.Count - 1))} and {items[^1]}",
    };

    /// <summary>The local tool manifest pinning the LiteSpec.Cli tool at the release.</summary>
    static string ToolManifest(string version) => $$"""
        {
          "version": 1,
          "isRoot": true,
          "tools": {
            "LiteSpec.Cli": {
              "version": "{{version}}",
              "commands": ["litespec"]
            }
          }
        }
        """ + "\n";

    /// <summary>Replaces a placeholder inside every string value of the document.</summary>
    /// <summary>The project name as an npm package scope: lowercase, with runs of other characters as one hyphen.</summary>
    static string PackageScope(string name) =>
        System.Text.RegularExpressions.Regex.Replace(name.ToLowerInvariant(), "[^a-z0-9._-]+", "-").Trim('-');

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
