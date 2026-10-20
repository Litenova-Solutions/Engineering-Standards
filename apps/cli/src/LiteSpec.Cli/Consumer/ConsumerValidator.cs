using System.Globalization;
using System.Text.Json.Nodes;

namespace LiteSpec.Consumer;

/// <summary>
///     The <c>litespec consumer</c> command: holds a consumer repository to the release it pinned.
///     It checks the project record, the manifest version and the named stacks and extensions,
///     every page's frontmatter and required sections, the language record with the prose
///     measures and the rejected words, and the controlled UI through the UI validator.
/// </summary>
static partial class ConsumerValidator
{
    /// <summary>
    ///     The help text printed by <c>--help</c> and by every usage error.
    /// </summary>
    public const string Usage = """
        Usage: litespec consumer [--root <path>] [--prose] [--format json] [--help]

        Validates the consumer repository at --root, which defaults to the
        current directory. The consumer must contain litespec.project.json.

          --root <path>   The consumer repository. Defaults to the current directory.
          --prose         List every controlled-prose measure behind the reported counts.
          --format json   Write one JSON object on stdout instead of human-readable lines.
          --help          Print this text and exit.

        Exit codes: 0 no problem, 1 at least one problem, 2 usage error.
        """;

    /// <summary>
    ///     Validates the consumer repository and returns the exit code.
    /// </summary>
    public static int Run(string[] args)
    {
        var parsed = CliArgs.Parse(args, ["--prose"], ["--root", "--format"]);

        if (parsed.Help)
        {
            Console.WriteLine(Usage);
            return 0;
        }

        var error = parsed.Error ?? parsed.FormatError;

        if (error is not null)
        {
            Console.Error.WriteLine(error);
            Console.Error.WriteLine(Usage);
            return 2;
        }

        var rootOption = parsed.Value("--root");
        RunState run;

        try
        {
            run = new RunState(
                Path.GetFullPath(string.IsNullOrEmpty(rootOption) ? Directory.GetCurrentDirectory() : rootOption),
                parsed.Json,
                parsed.Has("--prose"));
        }
        catch (Exception exception) when (exception is ArgumentException or NotSupportedException or PathTooLongException)
        {
            Console.Error.WriteLine($"Invalid root '{rootOption}': {exception.Message}");
            return 2;
        }

        try
        {
            run.Execute();
            return run.Report();
        }
        catch (FailFast fail)
        {
            return fail.Code;
        }
        catch (InvalidOperationException missing) when (LiteSpecHome.Root is null)
        {
            Console.Error.WriteLine(missing.Message);
            return 2;
        }
    }

    /// <summary>
    ///     Carries an exit code out of a check that ends the run immediately, such as
    ///     a malformed project file. Thrown after the message is already printed.
    /// </summary>
    sealed class FailFast : Exception
    {
        public FailFast(int code)
        {
            Code = code;
        }

        public int Code { get; }
    }

    /// <summary>
    ///     The mutable state of one run: the roots, the findings, and the one text cache
    ///     every read passes through so a file the checks revisit is read once and reused.
    /// </summary>
    sealed class RunState
    {
        public RunState(string root, bool json, bool prose)
        {
            Root = root;
            Json = json;
            Prose = prose;
        }

        public string Root { get; }

        public bool Json { get; }

        public bool Prose { get; }

        public List<string> Errors { get; } = [];

        public List<string> Advisories { get; } = [];

        /// <summary>Every prose measure behind the counts, when --prose asked for them.</summary>
        public List<string>? ProseDetail { get; set; }

        public Dictionary<string, string> TextCache { get; } = new(StringComparer.Ordinal);

        public string StandardsRoot { get; set; } = "";

        public string ProjectSchemaFile { get; set; } = "";

        public string RecordSchemaFile { get; set; } = "";

        public string LanguageSchemaFile { get; set; } = "";

        public JsonNode? Project { get; set; }

        public string DocsPath { get; set; } = "docs";

        public string DocsRoot { get; set; } = "";

        public List<string> Files { get; } = [];

        public int Pages { get; set; }

        public List<Selection> Selections { get; } = [];

        public List<string> KnownStacks { get; } = [];

        public List<JsonNode?> ControlledFrontends { get; } = [];

        public JsonNode? UiPackage { get; set; }

        public string LanguageSummary { get; set; } = "";

        public string Today { get; } = DateTime.UtcNow.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture);

        public void Execute()
        {
            StandardsRoot = LiteSpecHome.RequireRoot();
            ProjectSchemaFile = LiteSpecHome.PathTo("schemas/litespec-project.schema.json");
            RecordSchemaFile = LiteSpecHome.PathTo("schemas/record.schema.json");
            LanguageSchemaFile = LiteSpecHome.PathTo("schemas/language.schema.json");

            foreach (var schemaFile in new[] { ProjectSchemaFile, RecordSchemaFile, LanguageSchemaFile })
            {
                if (!File.Exists(schemaFile))
                {
                    FailInput($"Schema '{ConsumerValidator.Relative(StandardsRoot, schemaFile)}' is missing from the pinned LiteSpec release; the validator cannot run without it");
                }
            }

            // The consumer must contain its project record.
            var projectFile = Path.Join(Root, "litespec.project.json");

            if (!File.Exists(projectFile))
            {
                Console.Error.WriteLine($"No litespec.project.json at {Root}");
                throw new FailFast(2);
            }

            try
            {
                Project = ReadJson(projectFile);
            }
            catch (Exception cause)
            {
                FailInput($"litespec.project.json: not valid JSON ({cause.Message})");
            }

            CheckProjectRecord(this);
            CheckManifest(this);
            CheckFrontends(this);
            CollectFiles(this);

            // Every check below reads this list, so an empty list agrees with everything. A
            // consumer with no page does not exist; a root that resolves to nothing does.
            if (Files.Count == 0)
            {
                Err($"Scanned no Markdown files under '{DocsPath}'; check paths.docs, because a consumer with no page is a misconfigured scan");
            }

            CheckPages(this);
            CheckLanguageAndProse(this);
            CheckControlledUi(this);
        }

        /// <summary>
        ///     Writes the machine-readable or human-readable report and returns the exit code.
        /// </summary>
        public int Report()
        {
            // A machine reader gets the problems as an array and the counts as fields, so
            // nothing has to be recovered by parsing the human lines back apart.
            if (Json)
            {
                var payload = new JsonObject
                {
                    ["tool"] = "consumer",
                    ["consumer"] = Root,
                    ["ok"] = Errors.Count == 0,
                    ["scanned"] = new JsonObject { ["documentationRoot"] = DocsPath, ["files"] = Files.Count, ["pages"] = Pages },
                    ["problems"] = new JsonArray([.. Errors.Select(error => (JsonNode?)error)]),
                    ["advisories"] = new JsonArray([.. Advisories.Select(advisory => (JsonNode?)advisory)]),
                };

                if (ProseDetail is not null)
                {
                    payload["prose"] = new JsonArray([.. ProseDetail.Select(line => (JsonNode?)line)]);
                }

                CliJson.Write(payload);

                return Errors.Count > 0 ? 1 : 0;
            }

            Console.WriteLine($"Consumer: {Root}");
            Console.WriteLine($"Files scanned: {Files.Count} under {DocsPath}, frontmatter pages: {Pages}");
            Console.WriteLine(LanguageSummary);

            if (Advisories.Count > 0)
            {
                // The count and the worst pages are in the Language line; --prose lists every measure.
                var prose = (Project as JsonObject)?["prose"] as JsonObject;
                var note = AsString(prose?["enforcement"]) == "report" ? ", reported because prose.enforcement is 'report'" : "";

                Console.WriteLine();
                Console.WriteLine($"ADVISORY ({Advisories.Count} finding(s){note})");

                if (Prose)
                {
                    foreach (var advisory in Advisories)
                    {
                        Console.WriteLine($"  - {advisory}");
                    }
                }
            }

            if (Errors.Count > 0)
            {
                Console.WriteLine();
                Console.WriteLine($"FAIL ({Errors.Count} problem(s)):");

                foreach (var problem in Errors)
                {
                    Console.WriteLine($"  - {problem}");
                }

                return 1;
            }

            Console.WriteLine();
            Console.WriteLine("PASS: project configuration, page frontmatter, language and prose are valid.");
            return 0;
        }

        public void Err(string message) => Errors.Add(message);

        public void Advise(string message) => Advisories.Add(message);

        /// <summary>
        ///     Reads a file once and reuses the text. Strips a leading byte-order mark,
        ///     which some editors still write: without the strip a page that carries
        ///     a frontmatter block reports none.
        /// </summary>
        public string ReadText(string file)
        {
            if (!TextCache.TryGetValue(file, out var text))
            {
                text = File.ReadAllText(file);

                if (text.Length > 0 && text[0] == '\uFEFF')
                {
                    text = text[1..];
                }

                TextCache[file] = text;
            }

            return text;
        }

        public JsonNode? ReadJson(string file) => JsonNode.Parse(ReadText(file));

        public JsonNode? ReadSchema(string file) => JsonNode.Parse(File.ReadAllText(file));

        public string Relative(string file) => ConsumerValidator.Relative(Root, file);

        /// <summary>
        ///     Ends the run as a usage error with the path and the parse message. A stack
        ///     trace would break the <c>--format json</c> contract a machine reader relies on.
        /// </summary>
        public void FailInput(string message)
        {
            if (Json)
            {
                CliJson.Write(new
                {
                    tool = "consumer",
                    consumer = Root,
                    ok = false,
                    scanned = new { documentationRoot = "docs", files = 0, pages = 0 },
                    problems = new[] { message },
                    advisories = Array.Empty<string>(),
                });
            }
            else
            {
                Console.Error.WriteLine(message);
            }

            throw new FailFast(2);
        }
    }

    /// <summary>
    ///     One extension selection: a bare id string normalizes to a selection carrying only the id.
    /// </summary>
    sealed record Selection(string? Id, string IdText, string? ReviewBy, string? ReleaseStage, List<JsonNode?> DeferredProvisions);

    static string Relative(string root, string file) =>
        Path.GetRelativePath(root, file).Replace(Path.DirectorySeparatorChar, '/');

    /// <summary>
    ///     The string value of a JSON value, or null for anything else.
    /// </summary>
    static string? AsString(JsonNode? node) =>
        node is JsonValue value && value.TryGetValue<string>(out var text) ? text : null;

    static string? PropString(JsonObject? container, string key) =>
        container is not null && container.TryGetPropertyValue(key, out var value) ? AsString(value) : null;

    /// <summary>
    ///     How a value reads inside a message:
    ///     a string reads as itself, JSON null as <c>null</c>, and other primitives as their JSON form.
    /// </summary>
    static string JsText(JsonNode? node) => node switch
    {
        null => "null",
        JsonValue value when value.TryGetValue<string>(out var text) => text,
        JsonValue value => value.ToJsonString(),
        _ => node.ToJsonString(),
    };

    /// <summary>
    ///     How a property reads inside a message: a missing property reads as <c>undefined</c>.
    /// </summary>
    static string PropText(JsonObject? container, string key) =>
        container is not null && container.TryGetPropertyValue(key, out var value)
            ? value is null ? "null" : JsText(value)
            : "undefined";

    /// <summary>
    ///     Whether a parsed JSON value counts as present: missing, null, false, zero and
    ///     the empty string are falsy, and every object and array is truthy.
    /// </summary>
    static bool IsTruthy(JsonNode? node)
    {
        if (node is null)
        {
            return false;
        }

        if (node is not JsonValue value)
        {
            return true;
        }

        if (value.TryGetValue<bool>(out var flag))
        {
            return flag;
        }

        if (value.TryGetValue<string>(out var text))
        {
            return text.Length > 0;
        }

        return !value.TryGetValue<double>(out var number) || number != 0;
    }

    static bool IsFalsy(JsonNode? node) => !IsTruthy(node);

    /// <summary>
    ///     Whether two parsed JSON values are strictly equal: primitives compare by type and value, objects and arrays by reference.
    /// </summary>
    static bool StrictEqual(JsonNode? left, JsonNode? right)
    {
        if (left is null || right is null)
        {
            return left is null && right is null;
        }

        if (left is JsonValue leftValue && right is JsonValue rightValue)
        {
            if (leftValue.TryGetValue<string>(out var leftText) || rightValue.TryGetValue<string>(out var rightText))
            {
                return leftValue.TryGetValue<string>(out leftText)
                    && rightValue.TryGetValue<string>(out rightText)
                    && leftText == rightText;
            }

            return JsonNode.DeepEquals(left, right);
        }

        return ReferenceEquals(left, right);
    }
}
