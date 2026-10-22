using System.Globalization;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.RegularExpressions;

namespace LiteSpec.Ui;

/// <summary>
///     The controlled web UI validator: the <c>litespec ui</c> command and the
///     in-process <see cref="Validate"/> the consumer validator calls.
/// </summary>
static partial class UiValidator
{
    /// <summary>The <c>litespec ui</c> usage text.</summary>
    public const string Usage = """
        Usage: litespec ui [--root <path>] [--format json] [--help]

        Validates the controlled web UI contract for the consumer at root,
        which defaults to the current directory.

        Checks the shared package configuration, source lock, design contract,
        token stylesheet, shared stylesheets, class strings, application imports,
        the dependency boundary, and the pattern catalog. Nothing else: no route,
        environment, naming, secret, storage, or HTML sink scan.

          --root <path>   The consumer root. Defaults to the current directory.
          --format json   Write one JSON object on stdout instead of human-readable lines.
          --help          Print this text and exit.

        Exit codes: 0 no problem, 1 at least one problem, 2 usage error.
        """;

    /// <summary>Runs the <c>litespec ui</c> command; returns the exit code.</summary>
    public static int Run(string[] args)
    {
        var parsed = CliArgs.Parse(args, Array.Empty<string>(), new[] { "--root", "--format" });
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

        if (parsed.FormatError is not null)
        {
            Console.Error.WriteLine(parsed.FormatError);
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

        if (LiteSpecHome.Root is null)
        {
            Console.Error.WriteLine($"No LiteSpec checkout was found above '{AppContext.BaseDirectory}'. Set LITESPEC_HOME to the folder that holds {LiteSpecHome.ManifestFile}.");
            return 2;
        }

        if (!File.Exists(Path.Combine(root, "litespec.project.json")))
        {
            Console.Error.WriteLine($"No litespec.project.json at {root}");
            return 2;
        }

        var report = Validate(root);
        if (parsed.Json)
        {
            CliJson.Write(report.ToJson());
            return report.ExitCode;
        }

        Console.WriteLine($"Consumer: {report.Consumer}");
        Console.WriteLine(report.SharedPackage is null
            ? "Shared UI package: none declared"
            : $"Shared UI package: {Show(report.SharedPackage.NameFound, report.SharedPackage.Name)} at {Show(report.SharedPackage.PathFound, report.SharedPackage.Path)}");
        Console.WriteLine($"Controlled frontends: {report.ControlledFrontends}");
        if (report.SkippedFrontends.Count > 0)
        {
            Console.WriteLine($"Skipped frontends: {string.Join(", ", report.SkippedFrontends.Select(SkippedText))}");
        }

        if (report.Problems.Count > 0)
        {
            Console.WriteLine($"\nFAIL ({report.Problems.Count} problem(s)):");
            foreach (var item in report.Problems)
            {
                Console.WriteLine($"  - {item}");
            }

            return report.ExitCode;
        }

        if (!report.HasPackage)
        {
            // A silent skip reads as conformance. Naming the frontends and the platform
            // each one declared makes the skipped scope visible in the output that a
            // reviewer reads. (litespec/frontend/ui#record-a-frontend-outside-the-controlled-contract)
            Console.WriteLine("PASS: no controlled web frontend is present.");
            if (report.Frontends.Count > 0)
            {
                Console.WriteLine($"Skipped frontends: {string.Join(", ", report.Frontends.Select(DeclaredText))}");
            }
            else
            {
                Console.WriteLine("Skipped frontends: none; the project declares no frontend.");
            }

            return report.ExitCode;
        }

        Console.WriteLine("\nPASS: the shared package, its source lock, its design contract, its stylesheets, and each frontend boundary are valid.");
        return report.ExitCode;
    }

    /// <summary>
    ///     Validates the consumer at <paramref name="consumerRoot"/> in-process.
    ///     Never writes to the console and never exits the process.
    /// </summary>
    public static UiReport Validate(string consumerRoot) => new Session(consumerRoot).Execute();

    static string SkippedText(UiFrontend frontend) =>
        $"{Show(frontend.NameFound, frontend.Name)} (platform: {Show(frontend.PlatformFound, frontend.Platform)})";

    static string DeclaredText(UiFrontend frontend) =>
        $"{Show(frontend.NameFound, frontend.Name)} (platform: {(frontend.Platform is null ? "undeclared" : ShowNode(frontend.Platform))})";

    static string? PlatformOf(JsonNode? frontend) =>
        Child(frontend, "platform") is { Node: JsonValue value } && value.TryGetValue<string>(out var platform)
            ? platform
            : null;

    static readonly HashSet<string> UiDeviationPages = new(StringComparer.Ordinal)
    {
        "frontend/ui", "frontend/components", "frontend/patterns",
        "frontend/web/ui", "frontend/web/components", "frontend/web/patterns",
    };

    static readonly Regex ReviewDate = new("^[0-9]{4}-[0-9]{2}-[0-9]{2}$", RegexOptions.Compiled);

    /// <summary>One deviation record the UI gates read their own departures from.</summary>
    sealed record UiDeviation(string File, string Provision, JsonNode? ReviewBy);
}

/// <summary>One declared frontend, with the raw values the outputs print.</summary>
sealed record UiFrontend(bool NameFound, JsonNode? Name, bool PlatformFound, JsonNode? Platform);

/// <summary>The shared package summary the human and JSON outputs print.</summary>
sealed record UiSharedPackage(bool NameFound, JsonNode? Name, bool PathFound, JsonNode? Path, IReadOnlyList<JsonNode?> Exports);

/// <summary>The collected result of one <see cref="UiValidator.Validate"/> run.</summary>
/// <param name="ExitCode">What <c>litespec ui</c> returns: 0 pass, 1 problems, 2 unusable root.</param>
/// <param name="Problems">The same strings the JSON output's problems array holds.</param>
/// <param name="Consumer">The consumer root the run checked.</param>
/// <param name="SharedPackage">The declared shared package, or null when none resolved.</param>
/// <param name="ControlledFrontends">How many controlled frontends were checked.</param>
/// <param name="SkippedFrontends">The declared frontends outside the controlled contract.</param>
/// <param name="HasPackage">Whether a shared UI package is declared.</param>
/// <param name="Frontends">Every declared frontend, for the skipped scope line.</param>
sealed record UiReport(
    int ExitCode,
    IReadOnlyList<string> Problems,
    string Consumer,
    UiSharedPackage? SharedPackage,
    int ControlledFrontends,
    IReadOnlyList<UiFrontend> SkippedFrontends,
    bool HasPackage,
    IReadOnlyList<UiFrontend> Frontends)
{
    /// <summary>Builds the JSON object <c>--format json</c> writes.</summary>
    public JsonObject ToJson()
    {
        JsonNode? shared = null;
        if (SharedPackage is not null)
        {
            var package = new JsonObject();
            if (SharedPackage.NameFound)
            {
                package["name"] = SharedPackage.Name?.DeepClone();
            }

            if (SharedPackage.PathFound)
            {
                package["path"] = SharedPackage.Path?.DeepClone();
            }

            var exports = new JsonArray();
            foreach (var entry in SharedPackage.Exports)
            {
                exports.Add(entry?.DeepClone());
            }

            package["exports"] = exports;
            shared = package;
        }

        var skipped = new JsonArray();
        foreach (var frontend in SkippedFrontends)
        {
            var entry = new JsonObject();
            if (frontend.NameFound)
            {
                entry["name"] = frontend.Name?.DeepClone();
            }

            entry["platform"] = frontend.Platform?.DeepClone();
            skipped.Add(entry);
        }

        var problems = new JsonArray();
        foreach (var problem in Problems)
        {
            problems.Add(problem);
        }

        return new JsonObject
        {
            ["tool"] = "ui",
            ["consumer"] = Consumer,
            ["ok"] = Problems.Count == 0,
            ["sharedPackage"] = shared,
            ["controlledFrontends"] = ControlledFrontends,
            ["skippedFrontends"] = skipped,
            ["problems"] = problems,
        };
    }
}

static partial class UiValidator
{
    /// <summary>One in-process validation run: the errors, digests, and manifest it collects.</summary>
    private sealed partial class Session
    {
        public Session(string root)
        {
            Root = Path.GetFullPath(root);
        }

        public string Root { get; }

        public List<string> Errors { get; } = [];

        public Dictionary<string, string> Digests { get; } = new(StringComparer.Ordinal);

        public JsonNode? Manifest { get; private set; }

        public UiReport Execute()
        {
            var projectFile = Path.Combine(Root, "litespec.project.json");
            if (!File.Exists(projectFile))
            {
                return new UiReport(2, new[] { $"No litespec.project.json at {Root}" }, Root, null, 0, Array.Empty<UiFrontend>(), false, Array.Empty<UiFrontend>());
            }

            var project = ReadJson(projectFile, "litespec.project.json");
            // The consumer's pinned release first, then a checkout one folder up, then
            // the checkout this tool runs from, the way every other command finds it.
            var manifestFile = new[]
                {
                    Path.Combine(Root, "litespec", "litespec.manifest.json"),
                    Path.Combine(Root, "..", "litespec.manifest.json"),
                }
                .FirstOrDefault(File.Exists)
                ?? (LiteSpecHome.Root is { } home ? Path.Combine(home, LiteSpecHome.ManifestFile) : Path.Combine(Root, "..", "litespec.manifest.json"));
            Manifest = File.Exists(manifestFile) ? ReadJson(manifestFile, RelativeToRoot(manifestFile)) : null;

            var frontends = Chain(project, "paths", "frontends").Node is JsonArray array
                ? array.ToList()
                : new List<JsonNode?>();
            var controlled = frontends.Where(frontend => PlatformOf(frontend) is "react" or "svelte").ToList();
            var skipped = frontends.Where(frontend => Truthy(Child(frontend, "platform")) && PlatformOf(frontend) is not ("react" or "svelte")).ToList();
            var checkedCount = 0;

            var packagePlatform = LockPlatform(project);
            var baselineKey = packagePlatform == "svelte" ? "uiBaselineSvelte" : "uiBaseline";
            var baseline = Child(Manifest, baselineKey);
            var baselineNode = baseline.Found ? baseline.Node : null;
            var hasBaseline = baselineNode is not null && TruthyNode(baselineNode);

            var uiDeviations = ReadUiDeviations(project);

            // A deviation carries a review date and stops being valid once that date
            // passes. This check is time dependent by design; every other check in this
            // validator depends only on repository files. Only deviations against the UI
            // pages are read here; the rest belong to the checks that enforce them.
            var today = DateTime.UtcNow.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture);
            foreach (var deviation in uiDeviations)
            {
                // A provision ID is litespec/<page>#<slug>; the page decides whether the UI checks own it.
                var page = deviation.Provision.StartsWith("litespec/", StringComparison.Ordinal)
                    ? deviation.Provision["litespec/".Length..].Split('#')[0]
                    : "";
                if (!UiDeviationPages.Contains(page))
                {
                    continue;
                }

                if (deviation.ReviewBy is not JsonValue reviewValue || !reviewValue.TryGetValue<string>(out var reviewBy) || !ReviewDate.IsMatch(reviewBy))
                {
                    continue;
                }

                if (string.CompareOrdinal(reviewBy, today) < 0)
                {
                    Errors.Add($"[{deviation.Provision}] {deviation.File}: review date {reviewBy} has passed; renew the decision");
                }
            }

            // A controlled frontend composes the shared package, so the workspace declares
            // it once. A frontend that composes no shared component carries no UI block.
            // (litespec/frontend/ui#select-one-visual-authority)
            // An additional registry passes both registry gates under a deviation against
            // the pinned baseline provision. The review date on that record is checked
            // above; the gates below check its presence.
            var baselineOverride = uiDeviations.Any(deviation => deviation.Provision == "litespec/frontend/web/ui#pin-the-baseline-in-the-shared-package");
            var pkgValue = Chain(project, "paths", "uiPackage");
            var pkg = pkgValue.Found ? pkgValue.Node : null;
            var hasPkg = pkg is not null && TruthyNode(pkg);
            if (controlled.Count == 0 && hasPkg)
            {
                Errors.Add("litespec.project.json: paths.uiPackage is declared but no frontend declares a controlled platform (react, svelte)");
            }

            if (controlled.Count > 0 && !hasPkg)
            {
                Errors.Add($"litespec/frontend/ui#select-one-visual-authority litespec.project.json: {controlled.Count} controlled frontend(s) and no paths.uiPackage");
            }

            UiSharedPackage? packageSummary = null;
            if (hasPkg)
            {
                var package = pkg!;
                var label = $"shared package '{ShowOr(Child(package, "name"), "(unnamed)")}'";
                if (!hasBaseline)
                {
                    Errors.Add($"{label}: the LiteSpec manifest has no {baselineKey}");
                }

                foreach (var key in new[] { "name", "path", "componentsJson", "primitives", "tokens", "sourceLock", "designContract" })
                {
                    Required(package, key, label);
                }

                var exports = ReadArray(package, "publicExports", label);
                if (exports.Count == 0)
                {
                    Errors.Add($"{label}: publicExports must contain at least one entry point");
                }

                Unique(exports.Select(entry => new JsValue(true, entry)), $"{label}.publicExports");

                var pathValue = Child(package, "path");
                var packageRoot = pathValue is { Node: JsonValue pathText } && pathText.TryGetValue<string>(out var pathRaw) && pathRaw.Length > 0
                    ? FilePath(pathRaw)
                    : null;
                if (packageRoot is not null && !Exists(packageRoot))
                {
                    Errors.Add($"{label}: path does not exist '{Show(pathValue)}'");
                }

                foreach (var key in new[] { "componentsJson", "sourceLock", "designContract" })
                {
                    var value = Child(package, key);
                    if (!Truthy(value))
                    {
                        continue;
                    }

                    if (value.Node is not JsonValue textValue || !textValue.TryGetValue<string>(out var relative))
                    {
                        continue;
                    }

                    var candidate = FilePath(relative);
                    if (packageRoot is not null && !Within(packageRoot, candidate))
                    {
                        Errors.Add($"{label}: {key} must live inside the shared package root '{Show(pathValue)}'");
                    }
                    else if (!Exists(candidate))
                    {
                        Errors.Add($"{label}: {key} path does not exist '{Show(value)}'");
                    }
                }

                if (packageRoot is not null)
                {
                    foreach (var key in new[] { "primitives", "tokens" })
                    {
                        var value = Child(package, key);
                        if (!Truthy(value))
                        {
                            continue;
                        }

                        if (value.Node is not JsonValue textValue || !textValue.TryGetValue<string>(out var relative))
                        {
                            continue;
                        }

                        var candidate = FilePath(relative);
                        if (!Within(packageRoot, candidate))
                        {
                            Errors.Add($"{label}: {key} must live inside the shared package root '{Show(pathValue)}'");
                        }
                        else if (!Exists(candidate))
                        {
                            Errors.Add($"{label}: {key} path does not exist '{Show(value)}'");
                        }
                    }

                    if (hasBaseline)
                    {
                        var componentsJson = Child(package, "componentsJson");
                        if (componentsJson.Node is JsonValue componentsValue && componentsValue.TryGetValue<string>(out var componentsRelative) && Exists(FilePath(componentsRelative)))
                        {
                            ValidateComponentsJson(FilePath(componentsRelative), baselineNode, baselineOverride, packagePlatform);
                        }

                        var sourceLock = Child(package, "sourceLock");
                        if (sourceLock.Node is JsonValue lockValue && lockValue.TryGetValue<string>(out var lockRelative) && Exists(FilePath(lockRelative)))
                        {
                            ValidateSourceLock(FilePath(lockRelative), baselineNode, packageRoot, Manifest, baselineOverride, packagePlatform);
                        }

                        if (Truthy(Child(package, "designContract")))
                        {
                            ValidateDesignContract(package, packagePlatform);
                        }

                        var tokens = Child(package, "tokens");
                        if (tokens.Node is JsonValue tokensValue && tokensValue.TryGetValue<string>(out var tokensRelative) && Exists(FilePath(tokensRelative)))
                        {
                            ValidateGlobalCss(FilePath(tokensRelative), packagePlatform);
                        }

                        if (tokens.Node is JsonValue sheetValue && sheetValue.TryGetValue<string>(out var sheetRelative) && sheetRelative.Length > 0)
                        {
                            ValidateSharedStylesheets(packageRoot, FilePath(sheetRelative), packagePlatform);
                        }

                        var primitives = Child(package, "primitives");
                        ValidateSourceScan(packageRoot, primitives.Node is JsonValue primitivesValue && primitivesValue.TryGetValue<string>(out var primitivesRelative) && primitivesRelative.Length > 0 ? Path.GetFullPath(FilePath(primitivesRelative)) : null, packagePlatform);
                    }

                    var name = Child(package, "name");
                    var path = Child(package, "path");
                    packageSummary = new UiSharedPackage(name.Found, name.Node, path.Found, path.Node, exports);
                }

                ValidateDependencyBoundary();
            }

            foreach (var frontend in controlled)
            {
                var label = $"frontend '{Show(Child(frontend, "name"))}'";
                var uiBlock = Child(frontend, "ui");
                if (!Truthy(uiBlock))
                {
                    Errors.Add($"{label}: a controlled frontend requires a 'ui' block declaring its density profile");
                    continue;
                }

                Required(uiBlock.Node, "profile", label);
                var profile = uiBlock.Node is JsonObject ? Child(uiBlock.Node, "profile") : new JsValue(false, null);
                if (profile.Node is not JsonValue profileValue || !profileValue.TryGetValue<string>(out var profileText) || (profileText != "public-light" && profileText != "application-balanced" && profileText != "admin-dense"))
                {
                    Errors.Add($"{label}: profile must be one of public-light, application-balanced, admin-dense");
                }

                var frontendPath = Child(frontend, "path");
                var frontendRoot = frontendPath is { Node: JsonValue rootValue } && rootValue.TryGetValue<string>(out var rootText) && rootText.Length > 0
                    ? FilePath(rootText)
                    : null;
                if (frontendRoot is not null && !Exists(frontendRoot))
                {
                    Errors.Add($"{label}: frontend path does not exist '{Show(frontendPath)}'");
                    continue;
                }

                checkedCount++;
                var globalCss = uiBlock.Node is JsonObject ? Child(uiBlock.Node, "globalCss") : new JsValue(false, null);
                if (Truthy(globalCss) && globalCss.Node is JsonValue cssValue && cssValue.TryGetValue<string>(out var cssRelative))
                {
                    var stylesheet = FilePath(cssRelative);
                    if (!Exists(stylesheet))
                    {
                        Errors.Add($"{label}: globalCss path does not exist '{Show(globalCss)}'");
                    }
                    else if (hasPkg)
                    {
                        var packagePath = Child(pkg, "path");
                        ValidateFrontendStylesheet(stylesheet, packagePath.Node is JsonValue packageValue && packageValue.TryGetValue<string>(out var packageRelative) && packageRelative.Length > 0 ? FilePath(packageRelative) : null, pkg, PlatformOf(frontend)!);
                    }
                }

                if (frontendRoot is not null)
                {
                    var platform = PlatformOf(frontend)!;
                    ValidateApplicationImports(frontendRoot, pkg is null ? "(undeclared)" : Show(Child(pkg, "name")), platform);
                    var sources = Walk(frontendRoot, file => SourceFile.IsMatch(file));
                    foreach (var source in sources)
                    {
                        var relative = RelativeToRoot(source);
                        if (TestFile.IsMatch(source))
                        {
                            continue;
                        }

                        if (TestDir.IsMatch(source))
                        {
                            continue;
                        }

                        if (!VisualFile.IsMatch(source))
                        {
                            continue;
                        }

                        // A visual file lays itself out, and it is the one place in an application
                        // where class names belong. The utility rule still applies, so the drawing
                        // stays on semantic tokens and on no raw palette value.
                        var text = File.ReadAllText(source);
                        var seen = new HashSet<string>(StringComparer.Ordinal);
                        foreach (var value in ClassStrings(text))
                        {
                            InspectClassString(value, (kind, token) =>
                            {
                                if (!seen.Add(kind + ":" + token))
                                {
                                    return;
                                }

                                Errors.Add($"[litespec/frontend/web/ui#restrict-css-decisions] {relative}: {UtilityMessages[kind]} '{token}'");
                            });
                        }
                    }

                    foreach (var source in sources)
                    {
                        var relative = RelativeToRoot(source);
                        if (TestFile.IsMatch(source))
                        {
                            continue;
                        }

                        if (TestDir.IsMatch(source))
                        {
                            continue;
                        }

                        // A visual file lays itself out. Its class names are read above.
                        if (VisualFile.IsMatch(source))
                        {
                            continue;
                        }

                        // React writes an inline style as an object, Svelte as an attribute, an
                        // expression, or a style directive. A `<style>` block opening tag carries
                        // none of those after its name, so element styles never match this test.
                        var inline = source.EndsWith(".svelte", StringComparison.Ordinal) ? SvelteInlineStyle : ReactInlineStyle;
                        if (inline.IsMatch(File.ReadAllText(source)))
                        {
                            Errors.Add($"[litespec/frontend/web/ui#restrict-css-decisions] {relative}: an inline style belongs in a shared component");
                        }
                    }
                }
            }

            // A workspace that records pattern decisions keeps one catalog beside its
            // design contract. A workspace without one reports nothing here.
            // (litespec/frontend/patterns#keep-one-pattern-catalog)
            var uiPatterns = Chain(project, "paths", "uiPatterns");
            if (Truthy(uiPatterns))
            {
                ValidatePatternCatalog(Show(uiPatterns));
            }

            UiFrontend Describe(JsonNode? frontend)
            {
                var name = Child(frontend, "name");
                var platform = Child(frontend, "platform");
                return new UiFrontend(name.Found, name.Node, platform.Found, platform.Node);
            }

            return new UiReport(
                Errors.Count > 0 ? 1 : 0,
                Errors,
                Root,
                packageSummary,
                checkedCount,
                skipped.Select(Describe).ToList(),
                hasPkg,
                frontends.Select(Describe).ToList());
        }

        // The source lock declares which CLI installed the package, so the flavor is
        // read from the lock rather than inferred from the frontends. A workspace
        // mid-migration holds frontends on both platforms beside one lock, and the
        // package is validated against the baseline its own lock names. An unreadable
        // lock reports in its own gate; this read stays silent and assumes React.
        string LockPlatform(JsonNode? project)
        {
            var sourceLock = Chain(project, "paths", "uiPackage", "sourceLock");
            if (!Truthy(sourceLock))
            {
                return "react";
            }

            try
            {
                if (sourceLock.Node is not JsonValue value || !value.TryGetValue<string>(out var relative))
                {
                    return "react";
                }

                var lockNode = JsonNode.Parse(File.ReadAllText(FilePath(relative)));
                return Child(lockNode, "generator") is { Node: JsonValue generator } && generator.TryGetValue<string>(out var name) && name == "shadcn-svelte"
                    ? "svelte"
                    : "react";
            }
            catch
            {
                return "react";
            }
        }

        // A rule override is a Deviation record: docs/deviations/<name>.md carrying the
        // provision it departs from, the reason, the review date, and the removal
        // condition. The consumer validator owns the record shape; this validator reads
        // the departure its own gates need and enforces the review date. The folder
        // moves with paths.records.deviation when the consumer sets it.
        List<UiDeviation> ReadUiDeviations(JsonNode? project)
        {
            var folder = Chain(project, "paths", "records", "deviation");
            var folderName = folder is { Node: JsonValue value } && value.TryGetValue<string>(out var name) ? name : "docs/deviations";
            var directory = FilePath(folderName);
            if (!Directory.Exists(directory))
            {
                return [];
            }

            var found = new List<UiDeviation>();
            foreach (var entry in new DirectoryInfo(directory).EnumerateFileSystemInfos().OrderBy(candidate => candidate.Name, StringComparer.Ordinal))
            {
                if ((entry.Attributes & (FileAttributes.Directory | FileAttributes.ReparsePoint)) != 0)
                {
                    continue;
                }

                if (!entry.Name.EndsWith(".md", StringComparison.Ordinal))
                {
                    continue;
                }

                var raw = File.ReadAllText(entry.FullName);
                if (!raw.StartsWith("---", StringComparison.Ordinal))
                {
                    continue;
                }

                var end = raw.IndexOf("\n---", 3, StringComparison.Ordinal);
                if (end < 0)
                {
                    continue;
                }

                JsonNode? meta;
                try
                {
                    meta = JsonNode.Parse(raw.Substring(3, end - 3).Trim());
                }
                catch (JsonException)
                {
                    continue;
                }

                if (meta is not JsonObject)
                {
                    continue;
                }

                if (Child(meta, "type").Node is not JsonValue typeValue || !typeValue.TryGetValue<string>(out var type) || type != "deviation")
                {
                    continue;
                }

                if (Child(meta, "provision").Node is not JsonValue provisionValue || !provisionValue.TryGetValue<string>(out var provision))
                {
                    continue;
                }

                found.Add(new UiDeviation(RelativeToRoot(entry.FullName), provision, Child(meta, "reviewBy").Node));
            }

            return found;
        }
    }
}
