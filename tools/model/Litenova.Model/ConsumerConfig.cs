using System.Text.Json;

namespace Litenova.Model;

/// <summary>
///     One browser frontend the consumer declares.
/// </summary>
/// <param name="Name">The declared name.</param>
/// <param name="Path">The absolute path.</param>
/// <param name="Platform">The declared platform.</param>
sealed record FrontendConfig(string Name, string Path, string Platform);

/// <summary>
///     What the model builder reads from the consumer's declaration.
/// </summary>
sealed class ConsumerConfig
{
    private ConsumerConfig(string root) => Root = root;

    /// <summary>The consumer root.</summary>
    public string Root { get; }

    /// <summary>Where written records live.</summary>
    public IReadOnlyList<string> RecordRoots { get; private set; } = [];

    /// <summary>The language record.</summary>
    public string LanguagePath { get; private set; } = "";

    /// <summary>The backend layers.</summary>
    public string ApplicationRoot { get; private set; } = "";

    /// <summary>The domain layer.</summary>
    public string DomainRoot { get; private set; } = "";

    /// <summary>The HTTP layer.</summary>
    public string WebApiRoot { get; private set; } = "";

    /// <summary>The adapters.</summary>
    public string InfrastructureRoot { get; private set; } = "";

    /// <summary>Where tests live.</summary>
    public IReadOnlyList<string> TestRoots { get; private set; } = [];

    /// <summary>The declared frontends.</summary>
    public IReadOnlyList<FrontendConfig> Frontends { get; private set; } = [];

    /// <summary>The generated client's sources.</summary>
    public string ApiClientSrc { get; private set; } = "";

    /// <summary>Where test result files live.</summary>
    public string TestResultsDir { get; private set; } = "";

    /// <summary>The size profile: small or large.</summary>
    public string Size { get; private set; } = "large";

    /// <summary>The closed owner list.</summary>
    public IReadOnlyList<string> Owners { get; private set; } = [];

    /// <summary>Whether the declaration names an owner list.</summary>
    public bool HasOwners { get; private set; }

    /// <summary>The optional types the project records.</summary>
    public IReadOnlyList<string> OptionalTypes { get; private set; } = [];

    /// <summary>The steps classes whose when steps run a job, such as one that moves a simulated clock.</summary>
    public IReadOnlyList<string> JobTriggerSteps { get; private set; } = [];

    /// <summary>The steps classes whose then steps state only that a request succeeded or was refused.</summary>
    public IReadOnlyList<string> OutcomeOnlySteps { get; private set; } = [];

    /// <summary>
    ///     Reads the declaration, falling back to the documented defaults.
    /// </summary>
    public static ConsumerConfig Load(string root)
    {
        var config = new ConsumerConfig(Path.GetFullPath(root));
        var file = Path.Combine(config.Root, "standards.project.json");

        using var document = File.Exists(file)
            ? JsonDocument.Parse(File.ReadAllBytes(file))
            : JsonDocument.Parse("{}");

        var paths = document.RootElement.TryGetProperty("paths", out var found)
            && found.ValueKind == JsonValueKind.Object
                ? found
                : (JsonElement?)null;

        config.RecordRoots = ReadRoots(config.Root, paths, "records", ["docs"]);
        config.LanguagePath = Combine(config.Root, ReadString(paths, "language", "docs/language.json"));
        config.ApplicationRoot = Resolve(config.Root, ReadString(paths, "application", "apps/api/src/*.Application"));
        config.DomainRoot = Resolve(config.Root, ReadString(paths, "domain", "apps/api/src/*.Domain"));
        config.WebApiRoot = Resolve(config.Root, ReadString(paths, "webapi", "apps/api/src/*.WebApi"));
        config.InfrastructureRoot = Resolve(config.Root, ReadString(paths, "infrastructure", "apps/api/src/*.Infrastructure"));
        config.TestRoots = ReadRoots(config.Root, paths, "testRoots", []);
        config.Frontends = ReadFrontends(config.Root, paths);
        config.ApiClientSrc = Path.Combine(
            Combine(config.Root, ReadString(paths, "apiClient", "packages/api")), "src");
        config.TestResultsDir = Combine(config.Root, ReadString(paths, "testResults", "TestResults"));

        if (document.RootElement.TryGetProperty("size", out var size)
            && size.ValueKind == JsonValueKind.String
            && size.GetString() is "small" or "large")
        {
            config.Size = size.GetString()!;
        }

        if (document.RootElement.TryGetProperty("owners", out var owners)
            && owners.ValueKind == JsonValueKind.Array)
        {
            config.HasOwners = true;
            config.Owners =
            [
                .. owners.EnumerateArray()
                           .Select(owner => owner.ValueKind == JsonValueKind.String
                                                ? owner.GetString()!
                                                : owner.TryGetProperty("name", out var name)
                                                    ? name.GetString() ?? ""
                                                    : "")
                           .Where(name => name.Length > 0),
            ];
        }

        if (document.RootElement.TryGetProperty("optionalTypes", out var optional)
            && optional.ValueKind == JsonValueKind.Array)
        {
            config.OptionalTypes =
            [
                .. optional.EnumerateArray()
                             .Where(entry => entry.ValueKind == JsonValueKind.String)
                             .Select(entry => entry.GetString()!),
            ];
        }

        if (document.RootElement.TryGetProperty("proof", out var proof)
            && proof.ValueKind == JsonValueKind.Object)
        {
            config.JobTriggerSteps = ReadNames(proof, "jobTriggerSteps");
            config.OutcomeOnlySteps = ReadNames(proof, "outcomeOnlySteps");
        }

        return config;
    }

    /// <summary>
    ///     A path written with forward slashes, relative to the root.
    /// </summary>
    public string Relative(string absolute) =>
        Path.GetRelativePath(Root, absolute).Replace(Path.DirectorySeparatorChar, '/');

    private static IReadOnlyList<string> ReadNames(JsonElement owner, string field) =>
        owner.TryGetProperty(field, out var names) && names.ValueKind == JsonValueKind.Array
            ? [.. names.EnumerateArray().Where(entry => entry.ValueKind == JsonValueKind.String).Select(entry => entry.GetString()!)]
            : [];

    private static string ReadString(JsonElement? paths, string field, string fallback) =>
        paths is not null
        && paths.Value.TryGetProperty(field, out var value)
        && value.ValueKind == JsonValueKind.String
        && value.GetString() is { Length: > 0 } text
            ? text
            : fallback;

    private static IReadOnlyList<string> ReadRoots(
        string root, JsonElement? paths, string field, string[] fallback)
    {
        if (paths is not null && paths.Value.TryGetProperty(field, out var value))
        {
            if (value.ValueKind == JsonValueKind.String && value.GetString() is { Length: > 0 } single)
            {
                return [Combine(root, single)];
            }

            if (value.ValueKind == JsonValueKind.Array)
            {
                return
                [
                    .. value.EnumerateArray()
                              .Where(entry => entry.ValueKind == JsonValueKind.String)
                              .Select(entry => Combine(root, entry.GetString()!)),
                ];
            }
        }

        return [.. fallback.Select(suffix => Combine(root, suffix))];
    }

    private static IReadOnlyList<FrontendConfig> ReadFrontends(string root, JsonElement? paths)
    {
        if (paths is null
            || !paths.Value.TryGetProperty("frontends", out var frontends)
            || frontends.ValueKind != JsonValueKind.Array)
        {
            return [];
        }

        var found = new List<FrontendConfig>();

        foreach (var frontend in frontends.EnumerateArray())
        {
            if (frontend.TryGetProperty("name", out var name)
                && frontend.TryGetProperty("path", out var path)
                && name.GetString() is { } named
                && path.GetString() is { } located)
            {
                var platform = frontend.TryGetProperty("platform", out var declared)
                    ? declared.GetString() ?? ""
                    : "";

                found.Add(new FrontendConfig(named, Combine(root, located), platform));
            }
        }

        return found;
    }

    private static string Combine(string root, string relative) =>
        Path.GetFullPath(Path.Combine(root, relative.Replace('/', Path.DirectorySeparatorChar)));

    /// <summary>
    ///     Resolves one path, expanding a single segment wildcard to the first match.
    /// </summary>
    private static string Resolve(string root, string pattern)
    {
        if (!pattern.Contains('*'))
        {
            return Combine(root, pattern);
        }

        var parts = pattern.Replace('/', Path.DirectorySeparatorChar)
                           .Split(Path.DirectorySeparatorChar);
        var current = root;

        foreach (var part in parts)
        {
            if (!part.Contains('*'))
            {
                current = Path.Combine(current, part);
                continue;
            }

            if (!Directory.Exists(current))
            {
                return Path.Combine(current, part.Replace("*", ""));
            }

            var match = Directory.EnumerateDirectories(current, part)
                                 .Order(StringComparer.Ordinal)
                                 .FirstOrDefault();

            if (match is null)
            {
                return Path.Combine(current, part.Replace("*", ""));
            }

            current = match;
        }

        return current;
    }
}
