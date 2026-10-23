using System.Text.Json;

namespace LiteSpec.Model;

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

    /// <summary>The glossary.</summary>
    public string GlossaryPath { get; private set; } = "";

    /// <summary>Where behavior records live.</summary>
    public string BehaviorDocs { get; private set; } = "";

    /// <summary>Days before a tier-3 draft question auto-approves.</summary>
    public int VetoWindowDays { get; private set; } = 7;

    /// <summary>The owner reviewing access, outside calls and personal-data flows.</summary>
    public string? SecurityReviewer { get; private set; }

    /// <summary>The decision whose approval ends transcription mode.</summary>
    public string? TranscriptionEndsWith { get; private set; }

    /// <summary>The refusal code the derived forbidden result carries.</summary>
    public string ForbiddenCode { get; private set; } = "authorization.forbidden";

    /// <summary>The refusal code the derived invalid-input result carries.</summary>
    public string InvalidInputCode { get; private set; } = "request.validation-failed";

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

    /// <summary>The project size: small or large.</summary>
    public string Size { get; private set; } = "large";

    /// <summary>The project shape: server or client-only.</summary>
    public string Shape { get; private set; } = "server";

    /// <summary>The stacks the project names in <c>litespec.project.json</c>.</summary>
    public IReadOnlyList<string> Stacks { get; private set; } = [];

    /// <summary>The closed owner list.</summary>
    public IReadOnlyList<string> Owners { get; private set; } = [];

    /// <summary>The CODEOWNERS handles each owner name maps to, by owner name.</summary>
    public IReadOnlyDictionary<string, IReadOnlyList<string>> OwnerCodeowners { get; private set; } =
        new Dictionary<string, IReadOnlyList<string>>(StringComparer.Ordinal);

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
        var file = Path.Combine(config.Root, "litespec.project.json");

        using var document = File.Exists(file)
            ? JsonDocument.Parse(File.ReadAllBytes(file))
            : JsonDocument.Parse("{}");

        var paths = document.RootElement.TryGetProperty("paths", out var found)
            && found.ValueKind == JsonValueKind.Object
                ? found
                : (JsonElement?)null;

        var dotnet = document.RootElement.TryGetProperty("stackConfig", out var stacksConfig)
            && stacksConfig.ValueKind == JsonValueKind.Object
            && stacksConfig.TryGetProperty("dotnet", out var dotnetConfig)
            && dotnetConfig.ValueKind == JsonValueKind.Object
                ? dotnetConfig
                : (JsonElement?)null;

        // Records live under the documentation roots that paths.docs names.
        config.RecordRoots = ReadRoots(config.Root, paths, "docs", ["docs"]);
        config.GlossaryPath = Combine(config.Root, ReadString(paths, "glossary", "docs/glossary.json"));
        config.BehaviorDocs = Combine(config.Root, ReadString(paths, "behaviorDocs", "docs/behavior"));
        config.ApplicationRoot = Resolve(config.Root, ReadString(dotnet, "application", "apps/api/src/*.Application"));
        config.DomainRoot = Resolve(config.Root, ReadString(dotnet, "domain", "apps/api/src/*.Domain"));
        config.WebApiRoot = Resolve(config.Root, ReadString(dotnet, "webapi", "apps/api/src/*.WebApi"));
        config.InfrastructureRoot = Resolve(config.Root, ReadString(dotnet, "infrastructure", "apps/api/src/*.Infrastructure"));
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

        if (document.RootElement.TryGetProperty("shape", out var shape)
            && shape.ValueKind == JsonValueKind.String
            && shape.GetString() is { Length: > 0 } shapeName)
        {
            config.Shape = shapeName;
        }

        if (document.RootElement.TryGetProperty("stacks", out var stacks)
            && stacks.ValueKind == JsonValueKind.Array)
        {
            config.Stacks =
            [
                .. stacks.EnumerateArray()
                             .Where(entry => entry.ValueKind == JsonValueKind.String)
                             .Select(entry => entry.GetString()!),
            ];
        }

        if (document.RootElement.TryGetProperty("owners", out var owners)
            && owners.ValueKind == JsonValueKind.Array)
        {
            config.HasOwners = true;

            // An entry is a plain name or an object mapping a readable name to its
            // CODEOWNERS handles. The first entry wins when two entries share a name.
            var names = new List<string>();
            var mapped = new Dictionary<string, IReadOnlyList<string>>(StringComparer.Ordinal);

            foreach (var entry in owners.EnumerateArray())
            {
                var name = entry.ValueKind switch
                {
                    JsonValueKind.String => entry.GetString(),
                    JsonValueKind.Object when entry.TryGetProperty("name", out var named)
                        && named.ValueKind == JsonValueKind.String => named.GetString(),
                    _ => null,
                };

                if (name is not { Length: > 0 } || !mapped.TryAdd(name, ReadHandles(entry)))
                {
                    continue;
                }

                names.Add(name);
            }

            config.Owners = names;
            config.OwnerCodeowners = mapped;
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

        if (document.RootElement.TryGetProperty("review", out var review)
            && review.ValueKind == JsonValueKind.Object)
        {
            if (review.TryGetProperty("vetoWindowDays", out var window)
                && window.ValueKind == JsonValueKind.Number
                && window.TryGetInt32(out var days)
                && days > 0)
            {
                config.VetoWindowDays = days;
            }

            if (review.TryGetProperty("securityReviewer", out var reviewer)
                && reviewer.ValueKind == JsonValueKind.String
                && reviewer.GetString() is { Length: > 0 } name)
            {
                config.SecurityReviewer = name;
            }
        }

        if (document.RootElement.TryGetProperty("refusals", out var refusals)
            && refusals.ValueKind == JsonValueKind.Object)
        {
            if (refusals.TryGetProperty("forbidden", out var forbidden)
                && forbidden.ValueKind == JsonValueKind.String
                && forbidden.GetString() is { Length: > 0 } forbiddenCode)
            {
                config.ForbiddenCode = forbiddenCode;
            }

            if (refusals.TryGetProperty("invalidInput", out var invalid)
                && invalid.ValueKind == JsonValueKind.String
                && invalid.GetString() is { Length: > 0 } invalidCode)
            {
                config.InvalidInputCode = invalidCode;
            }
        }

        if (document.RootElement.TryGetProperty("adoption", out var adoption)
            && adoption.ValueKind == JsonValueKind.Object
            && adoption.TryGetProperty("transcriptionEndsWith", out var ends)
            && ends.ValueKind == JsonValueKind.String
            && ends.GetString() is { Length: > 0 } decision)
        {
            config.TranscriptionEndsWith = decision;
        }

        return config;
    }

    /// <summary>
    ///     A path written with forward slashes, relative to the root.
    /// </summary>
    public string Relative(string absolute) =>
        Path.GetRelativePath(Root, absolute).Replace(Path.DirectorySeparatorChar, '/');

    /// <summary>
    ///     The owner itself plus the CODEOWNERS handles its project owners entry lists.
    /// </summary>
    public IReadOnlyList<string> CandidatesFor(string owner) =>
        OwnerCodeowners.TryGetValue(owner, out var handles)
            ? [owner, .. handles]
            : [owner];

    private static IReadOnlyList<string> ReadNames(JsonElement owner, string field) =>
        owner.TryGetProperty(field, out var names) && names.ValueKind == JsonValueKind.Array
            ? [.. names.EnumerateArray().Where(entry => entry.ValueKind == JsonValueKind.String).Select(entry => entry.GetString()!)]
            : [];

    private static IReadOnlyList<string> ReadHandles(JsonElement entry) =>
        entry.ValueKind == JsonValueKind.Object
        && entry.TryGetProperty("codeowners", out var handles)
        && handles.ValueKind == JsonValueKind.Array
            ? [.. handles.EnumerateArray()
                .Where(handle => handle.ValueKind == JsonValueKind.String)
                .Select(handle => handle.GetString()!)
                .Where(handle => handle.Length > 0)
                .Distinct(StringComparer.Ordinal)]
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
