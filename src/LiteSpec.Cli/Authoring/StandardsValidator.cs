using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;

namespace LiteSpec.Authoring;

/// <summary>
///     One authoring finding: the repository-relative file, the 1-based line, the stable code, and the message.
/// </summary>
sealed record StandardsDiagnostic(string Relative, int Line, string Code, string Message);

/// <summary>
///     The repository-wide result: the sorted diagnostics, or a usage error when the root cannot be read.
/// </summary>
sealed record StandardsResult(IReadOnlyList<StandardsDiagnostic> Diagnostics, string? UsageError);

/// <summary>
///     The <c>litespec validate</c> command: the authoring checks over the LiteSpec repository.
/// </summary>
static partial class StandardsValidator
{
    /// <summary>The command's usage text.</summary>
    public const string Usage = """
        Usage: litespec validate [--root <path>] [--warnings] [--format json]

        Validates the authoring contract over the LiteSpec repository at --root,
        which defaults to the LiteSpec checkout this tool ships in.

          --root <path>   The repository root. Defaults to the LiteSpec checkout.
          --warnings      List every warning occurrence instead of a count per code.
          --format json   Write one JSON object on stdout instead of human-readable lines.
          --help          Print this text and exit.

        Exit codes: 0 no error, 1 at least one error, 2 usage error.
        """;

    /// <summary>Every diagnostic code the validator can emit, in declaration order.</summary>
    public static readonly IReadOnlyList<string> StableDiagnosticCodes =
    [
        "AGENT_PROJECTION_ID",
        "ANCHOR_BROKEN",
        "CONVENTION_DEFAULT_SENTENCE",
        "CONVENTION_MISSING_DEFAULT",
        "CONVENTION_MISSING_REPLACEMENT",
        "CONVENTION_NORMATIVE",
        "CONVENTION_REPLACEMENT_SENTENCE",
        "EXTENSION_ACTIVATION",
        "EXTENSION_BASELINE",
        "EXTENSION_DEPENDENCIES",
        "EXTENSION_KIND",
        "EXTENSION_REPLACES_ENFORCED",
        "EXTENSION_REPLACES_UNKNOWN",
        "EXTENSION_SCOPE",
        "GLOSSARY_DEFINITION",
        "GLOSSARY_ORDER",
        "HEADING_ACTION",
        "HEADING_EMPTY_BODY",
        "ID_AREA_UNKNOWN",
        "ID_DUPLICATE",
        "ID_LOCATION",
        "ID_MISSING",
        "ID_PAGE_FILENAME",
        "ID_SCOPE_MISMATCH",
        "ID_SLUG_MISMATCH",
        "ID_UNKNOWN_REFERENCE",
        "INDEX_CONTAINS_PROCEDURE",
        "INDEX_INTENT",
        "LINK_BROKEN",
        "MANIFEST_ANCHOR",
        "MANIFEST_DUPLICATE_PATH",
        "MANIFEST_JSON",
        "MANIFEST_PATH",
        "PAGE_EMPTY_SECTION",
        "PAGE_MISSING_SECTION",
        "PAGE_SECTION_ORDER",
        "PAGE_TITLE_CASE",
        "PAGE_TITLE_COUNT",
        "PAGE_UNKNOWN_SECTION",
        "PROSE_AND_OR",
        "PROSE_CONTRACTION",
        "PROSE_LIST_LENGTH",
        "PROSE_NON_ASCII",
        "PROSE_NORMATIVE_LOCATION",
        "PROSE_PARAGRAPH_LENGTH",
        "PROSE_SENTENCE_LENGTH",
        "PROSE_TABLE_CELL_LENGTH",
        "PROSE_VAGUE_TERM",
        "PROVISIONS_STALE",
        "PROVISION_RESTATES_HEADING",
        "REFERENCE_EXAMPLE_DECLARATION",
        "REMOVED_IDENTIFIER",
        "SCHEMA_ID",
        "SCHEMA_INVALID",
        "SCHEMA_JSON",
        "SCHEMA_UNSUPPORTED_KEYWORD",
        "STACK_COMPOSITION_EXTRA",
        "STACK_COMPOSITION_MISSING",
        "STANDARD_DEVIATION_SENTENCE",
        "STANDARD_EXAMPLE_LABEL",
        "STANDARD_INFORMATIVE_NORMATIVE",
        "STANDARD_LABEL_DUPLICATE",
        "STANDARD_LABEL_INVALID",
        "STANDARD_LABEL_ORDER",
        "STANDARD_MISSING_DEVIATION",
        "STANDARD_MISSING_REQUIREMENT",
        "STANDARD_MODAL_COUNT",
        "STANDARD_MODAL_VOCABULARY",
        "STANDARD_REQUIREMENT_COUNT",
        "STANDARD_SENTENCE_COUNT",
        "STANDARD_UNEXPECTED_DEVIATION",
        "STANDARD_UNLABELED_CONTENT",
        "SUMMARY_COUNT",
        "SUMMARY_ID_POSITION",
        "SUMMARY_MISSING_ID",
        "SUMMARY_NORMATIVE",
        "SUMMARY_RESTATES_REQUIREMENT",
        "SUMMARY_UNKNOWN_ID",
        "VERIFY_COMMAND",
        "VERIFY_DUPLICATE_ID",
        "VERIFY_GENERIC_EVIDENCE",
        "VERIFY_HEADER",
        "VERIFY_MARK",
        "VERIFY_MISSING_ID",
        "VERIFY_TEMPLATED_EVIDENCE",
        "VERIFY_UNKNOWN_ID",
        "WORKFLOW_KIND",

        "TEMPLATE_INDEX_PATH",

        "INDEX_MISSING_ROUTING",
    ];

    /// <summary>
    ///     Codes reported as warnings, which never fail the build. Empty unless a new rule
    ///     lands against existing content and burns its count down.
    /// </summary>
    public static readonly IReadOnlyList<string> WarningDiagnosticCodes = [];

    /// <summary>
    ///     Validates the repository at <paramref name="root"/> and returns its sorted diagnostics.
    /// </summary>
    public static StandardsResult Validate(string root)
    {
        var resolved = Path.GetFullPath(root.Length == 0 ? "." : root);
        var diagnostics = new List<StandardsDiagnostic>();
        var stable = new HashSet<string>(StableDiagnosticCodes, StringComparer.Ordinal);
        void Add(string relative, int line, string code, string message)
        {
            if (!stable.Contains(code))
            {
                throw new InvalidOperationException($"Validator emitted undeclared diagnostic code '{code}'");
            }

            diagnostics.Add(new StandardsDiagnostic(Slash(relative), line, code, message));
        }

        if (!Directory.Exists(resolved))
        {
            return new StandardsResult(diagnostics, $"Repository root is not a directory: {resolved}");
        }

        try
        {
            _ = Directory.GetFileSystemEntries(resolved);
        }
        catch (Exception exception)
        {
            return new StandardsResult(diagnostics, $"Repository root is unreadable: {resolved}: {exception.Message}");
        }

        List<string> markdown;
        try
        {
            markdown = Walk(resolved, file => file.EndsWith(".md", StringComparison.OrdinalIgnoreCase));
        }
        catch (Exception exception)
        {
            return new StandardsResult(diagnostics, $"Repository input is unreadable: {exception.Message}");
        }

        var current = markdown.Where(file => IsCurrentStandardsMaterial(Slash(Path.GetRelativePath(resolved, file)))).ToList();
        var globalIds = new Dictionary<string, string>(StringComparer.Ordinal);
        var parsedPages = new List<ParsedPage>();
        foreach (var file in current)
        {
            var relative = Slash(Path.GetRelativePath(resolved, file));
            if (relative.StartsWith("templates/standard/", StringComparison.Ordinal))
            {
                continue;
            }

            if (ReservedTemplateStems.Contains(relative))
            {
                Add(relative, 1, "ID_PAGE_FILENAME", $"'{relative}' is the virtual path an authoring template parses as; rename the page so its scope is its own");
                continue;
            }

            var raw = ReadText(file);
            var prose = string.Join('\n', StripFences(SplitLines(raw)).Select(item => item.Line));
            var nonAscii = NonAsciiOffset(prose);
            if (nonAscii >= 0)
            {
                Add(relative, LineNumber(prose, nonAscii), "PROSE_NON_ASCII", NonAsciiMessage(prose[nonAscii], "non-ASCII character "));
            }

            parsedPages.Add(new ParsedPage(relative, raw, ParsePage(relative, raw, Add, globalIds, resolved)));
            if (relative == "AGENTS.md" || relative.EndsWith("/project-agents.md", StringComparison.Ordinal))
            {
                CheckAgentProjection(relative, raw, Add);
            }
        }

        var registry = ReadManifestRegistry(resolved);
        CheckPageIdentity(parsedPages, registry, Add);

        var activeIds = new HashSet<string>(globalIds.Keys, StringComparer.Ordinal);
        CheckCitations(parsedPages, activeIds, Add);

        CheckAuthoringTemplates(resolved, globalIds, Add);
        CheckLinks(resolved, current, Add);
        var rowsByPage = parsedPages.ToDictionary(page => page.Relative, page => page.Parsed.VerificationRows, StringComparer.Ordinal);
        CheckManifest(resolved, Add, activeIds, rowsByPage);
        CheckRemovedForms(resolved, Add);

        // The provision index is derived. A stale page would send a reader to the wrong
        // heading, so the gate compares it with the active standards.
        // (litespec/rule/core-authoring.regenerate-the-provision-index)
        var indexFile = JoinRoot(resolved, Provisions.IndexPath);
        if (File.Exists(indexFile))
        {
            var expected = Provisions.BuildIndex(resolved) + "\n";
            var actual = ReadText(indexFile).Replace("\r\n", "\n", StringComparison.Ordinal);
            if (actual != expected)
            {
                Add(Provisions.IndexPath, 1, "PROVISIONS_STALE", "generated provision index differs from the active standards; run litespec provisions");
            }
        }
        else if (Directory.Exists(Path.Combine(resolved, "docs", "reference")))
        {
            Add(Provisions.IndexPath, 1, "PROVISIONS_STALE", "generated provision index is missing; run litespec provisions");
        }

        ValidateSchemaConsumer(resolved, "schemas/litespec-manifest.schema.json", "litespec.manifest.json", Add);
        CheckSchemaIds(resolved, Add);
        // Every shipped consumer template meets the schema it teaches. A template
        // the schema never reads drifts from it in silence.
        ValidateSchemaConsumer(resolved, "schemas/litespec-project.schema.json", "templates/consumer/litespec.project.json", Add);

        // The template index is the only map from a template file to the consumer path
        // it targets. A renamed template leaves a row pointing at nothing, and that row
        // reads exactly like a correct one. (litespec/rule/core-principles.keep-one-authored-source)
        CheckTemplateIndex(resolved, Add);

        // A reader who cannot tell a tutorial from a reference opens both and trusts
        // neither, so the documentation root names each class before it links to one.
        // (litespec/rule/core-authoring.route-the-reader-before-listing-pages)
        CheckRootIndexRouting(resolved, Add);

        // A stable sort: diagnostics that share a file, line, and code keep the order
        // the checks emitted them in, as the reference implementation's sort does.
        var sorted = diagnostics
            .OrderBy(diagnostic => diagnostic.Relative, SortOrder)
            .ThenBy(diagnostic => diagnostic.Line)
            .ThenBy(diagnostic => diagnostic.Code, SortOrder)
            .ToList();
        return new StandardsResult(sorted, null);
    }

    /// <summary>
    ///     Runs the <c>validate</c> command over the remaining arguments. Returns the exit code.
    /// </summary>
    public static int Run(string[] args)
    {
        var parsed = CliArgs.Parse(args, ["--warnings"], ["--root", "--format"]);
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

        string root;
        try
        {
            root = parsed.Value("--root") is string given ? Path.GetFullPath(given) : LiteSpecHome.RequireRoot();
        }
        catch (Exception exception)
        {
            Console.Error.WriteLine(exception.Message);
            Console.Error.WriteLine(Usage);
            return 2;
        }

        var result = Validate(root);
        if (result.UsageError is not null)
        {
            Console.Error.WriteLine(result.UsageError);
            return 2;
        }

        var warningCodes = new HashSet<string>(WarningDiagnosticCodes, StringComparer.Ordinal);
        var errors = result.Diagnostics.Where(diagnostic => !warningCodes.Contains(diagnostic.Code)).ToList();
        var warnings = result.Diagnostics.Where(diagnostic => warningCodes.Contains(diagnostic.Code)).ToList();

        // A machine reader needs the file, the line, and the stable code as fields. A
        // reader that has to parse the human lines back apart breaks the first time a
        // message is reworded, so the tool emits the structure it already holds.
        if (parsed.Json)
        {
            CliJson.Write(new
            {
                tool = "validate",
                root,
                ok = errors.Count == 0,
                errors = errors.Select(diagnostic => new { file = diagnostic.Relative, line = diagnostic.Line, code = diagnostic.Code, message = diagnostic.Message }).ToList(),
                warnings = warnings.Select(diagnostic => new { file = diagnostic.Relative, line = diagnostic.Line, code = diagnostic.Code, message = diagnostic.Message }).ToList(),
            });
            return errors.Count == 0 ? 0 : 1;
        }

        foreach (var diagnostic in errors)
        {
            Console.Error.WriteLine($"{diagnostic.Relative}:{diagnostic.Line} [{diagnostic.Code}] {diagnostic.Message}");
        }

        if (warnings.Count > 0)
        {
            var counts = new Dictionary<string, int>(StringComparer.Ordinal);
            foreach (var diagnostic in warnings)
            {
                counts[diagnostic.Code] = counts.GetValueOrDefault(diagnostic.Code) + 1;
            }

            Console.Error.WriteLine();
            Console.Error.WriteLine($"LiteSpec authoring warnings ({warnings.Count}). These do not fail the build:");
            foreach (var code in counts.Keys.OrderBy(code => code, StringComparer.Ordinal))
            {
                Console.Error.WriteLine($"  {counts[code],4}  {code}");
            }

            Console.Error.WriteLine("  Run with --warnings to list every occurrence.");
            if (parsed.Has("--warnings"))
            {
                foreach (var diagnostic in warnings)
                {
                    Console.Error.WriteLine($"  {diagnostic.Relative}:{diagnostic.Line} [{diagnostic.Code}] {diagnostic.Message}");
                }
            }
        }

        if (errors.Count > 0)
        {
            Console.Error.WriteLine($"LiteSpec authoring checks failed with {errors.Count} error(s).");
            return 1;
        }

        Console.WriteLine("LiteSpec authoring checks passed.");
        return 0;
    }

    /// <summary>A fence-stripped line: its visible text, its 1-based number, and whether it sits inside a fence.</summary>
    private sealed record LineItem(string Line, int Number, bool Fenced);

    /// <summary>An H2 section: its anchor-stripped name and its 1-based line.</summary>
    private sealed record PageSection(string Name, int Line);

    /// <summary>One provision heading and its body lines. <see cref="Provision.Claim"/> is set once the labels parse.</summary>
    private sealed record Provision(string Id, string Title, string Section, int Line, List<LineItem> Body)
    {
        public string Claim { get; set; } = "";
    }

    /// <summary>One Agent Summary citation: the provision, the bullet's line, and the bullet's claim.</summary>
    private sealed record SummaryReference(string Id, int Line, string Claim);

    /// <summary>One Verification table row: the provision, its mark, its line, and its evidence cell.</summary>
    private sealed record VerificationRow(string Id, string Mark, int Line, string Evidence);

    /// <summary>Everything one page parse collects for the later cross-page checks.</summary>
    private sealed record ParsedBlocks(string? Kind, List<Provision> Provisions, List<SummaryReference> SummaryReferences, List<VerificationRow> VerificationRows);

    /// <summary>One parsed page: its relative path, its raw text, and its blocks.</summary>
    private sealed record ParsedPage(string Relative, string Raw, ParsedBlocks Parsed);

    /// <summary>The manifest's provision registry: whether one parsed, and its registered areas.</summary>
    private sealed record ManifestRegistryInfo(bool Present, HashSet<string> Areas);

    // Every provision identifier is litespec/<rule|convention>/<page>.<heading-slug>.
    // The grammar lives in Provisions, so the validator, the generator, and the
    // parsed heading cannot report three different formats.
    // (litespec/rule/core-authoring.identifier-must-follow-format)
    static string IdPattern => Provisions.IdSource.Replace("\\/", "/", StringComparison.Ordinal);

    static readonly Lazy<Regex> ProvisionHeadingLazy = new(() => new Regex($"^###\\s+(.+?)\\s+\\(({IdPattern})\\)\\s*$"));
    static readonly Lazy<Regex> CitationLazy = new(() => new Regex($"\\b(?:{IdPattern})\\b"));
    static readonly Lazy<Regex> SummaryPositionLazy = new(() => new Regex($"\\((?:{IdPattern})(?:,\\s*{IdPattern})*\\)\\s*$"));
    static readonly Lazy<Regex> VerificationRowLazy = new(() => new Regex($"^\\|\\s*({IdPattern})\\s*\\|\\s*([^|]*?)\\s*\\|\\s*([^|]*?)\\s*\\|\\s*$"));

    static Regex ProvisionHeadingPattern => ProvisionHeadingLazy.Value;
    static Regex CitationPattern => CitationLazy.Value;
    static Regex SummaryPositionPattern => SummaryPositionLazy.Value;
    static Regex VerificationRowPattern => VerificationRowLazy.Value;

    /// <summary>The action verbs a provision heading may start with.</summary>
    static readonly HashSet<string> ActionVerbs = new(
        ("Accept Activate Add Advance Align Anchor Announce Answer Apply Approve Ask Assert Assign Attach Audit " +
        "Authenticate Authorize Avoid Await Back Bind Bound Build Call Canonicalize Centralize Check Cite Classify " +
        "Co-locate Collect Commit Compare Complete Compose Compute Configure Confirm Connect Control Copy Cover Create " +
        "Declare Default Defer Define Delay Deliver Deploy Deprecate Derive Diff Discard Dispatch Distinguish Document " +
        "Drive Emit Enforce Escalate Escape Evolve Exclude Exercise Expose Express Finish Follow Format Gate Generate " +
        "Give Govern Grant Group Handle Hide Hold Identify Implement Inject Inspect Isolate Keep Lease Limit List Load " +
        "Localize Locate Make Map Mark Match Measure Meet Minimize Mirror Model Move Name Note Operate Organize Own " +
        "Parameterize Parse Pass Persist Pin Place Plan Point Prefer Preserve Prevent Process Project Promote Protect " +
        "Prove Provide Publish Purge Query Raise Reach Read Reconnect Record Recover Reference Reflect Refuse Regenerate " +
        "Register Reject Reload Release Remove Render Replay Replace Report Represent Require Renew Requeue Resolve " +
        "Restrict Retain Retire Retry Return Revalidate Review Rotate Route Run Scan Scope Select Separate Serialize Set " +
        "Show Signal Simulate Specify Split Stage Start State Stop Store Subscribe Supply Support Tag Test Tolerate Trace " +
        "Track Translate Treat Update Use Validate Verify Version Wait Write").Split(' '),
        StringComparer.Ordinal);

    // Naming the codepoint tells an author which character to hunt for. Naming the
    // ASCII form tells them what to type instead, which is the action the rule
    // actually asks for. These are the characters an editor substitution or a paste
    // from a word processor introduces; anything else reports its codepoint alone.
    // The keys are codepoints rather than characters, because this file is itself
    // under the ASCII rule.
    static readonly Dictionary<string, string> AsciiReplacements = new(StringComparer.Ordinal)
    {
        ["00A0"] = "a plain space",
        ["00B7"] = "a hyphen",
        ["00D7"] = "the letter x",
        ["2013"] = "a hyphen",
        ["2014"] = "a hyphen",
        ["2018"] = "a straight apostrophe",
        ["2019"] = "a straight apostrophe",
        ["201C"] = "a straight quotation mark",
        ["201D"] = "a straight quotation mark",
        ["2022"] = "a Markdown list marker",
        ["2026"] = "three full stops",
        ["2192"] = "the word to",
    };

    static string Slash(string value) => value.Replace('\\', '/');

    static string[] SplitLines(string text) => NewlinePattern().Split(text);

    static string ReadText(string file) => Encoding.UTF8.GetString(File.ReadAllBytes(file));

    static string TrimBom(string text) => text.StartsWith('\uFEFF') ? text[1..] : text;

    static string JoinRoot(string root, string relative) => Path.Combine([root, .. relative.Split('/')]);

    static List<string> Walk(string directory, Func<string, bool> predicate)
    {
        var result = new List<string>();
        if (!Directory.Exists(directory))
        {
            return result;
        }

        // Entries sort ordinally so the walk order is stable on every OS. Diagnostics
        // sort before they return, so only duplicate attribution can observe it.
        foreach (var entry in Directory.GetFileSystemEntries(directory).OrderBy(name => name, StringComparer.Ordinal))
        {
            var name = Path.GetFileName(entry);
            if (name is ".git" or ".opencode" or ".agents" or "node_modules" or "dist" or "build" or "bin" or "obj")
            {
                continue;
            }

            if (Directory.Exists(entry))
            {
                result.AddRange(Walk(entry, predicate));
            }
            else if (predicate(entry))
            {
                result.Add(entry);
            }
        }

        return result;
    }

    // Sorts with English collation so diagnostics order identically on every machine.
    static readonly StringComparer SortOrder = StringComparer.Create(CultureInfo.GetCultureInfo("en"), ignoreCase: false);

    static bool IsCurrentStandardsMaterial(string relative)
    {
        // The CLI owns src/ and tests/: its fixtures are consumer-shaped test
        // data that can never satisfy the authoring contract, and its own test
        // suite checks the tool. The changelog and its archives are release history.
        // The authoring checks read the standards material.
        return relative != "CHANGELOG.md"
            && relative != "changelog"
            && !relative.StartsWith("changelog/", StringComparison.Ordinal)
            && relative != "LICENSE.md"
            && !relative.StartsWith("src/", StringComparison.Ordinal)
            && !relative.StartsWith("tests/", StringComparison.Ordinal);
    }

    static int LineNumber(string text, int offset)
    {
        var line = 1;
        for (var index = 0; index < offset && index < text.Length; index++)
        {
            if (text[index] == '\n')
            {
                line++;
            }
        }

        return line;
    }

    static int NonAsciiOffset(string text)
    {
        for (var index = 0; index < text.Length; index++)
        {
            if (text[index] > 0x7F)
            {
                return index;
            }
        }

        return -1;
    }

    static string NonAsciiMessage(char character, string prefix)
    {
        var codepoint = ((int)character).ToString("X", CultureInfo.InvariantCulture).PadLeft(4, '0');
        return AsciiReplacements.TryGetValue(codepoint, out var replacement)
            ? $"{prefix}U+{codepoint}; write {replacement}"
            : $"{prefix}U+{codepoint}";
    }

    // A fenced block is literal content, so the measures do not reach inside one.
    // The line is replaced rather than dropped, which keeps every reported line
    // number equal to the line number in the file.
    static List<LineItem> StripFences(string[] lines)
    {
        var result = new List<LineItem>(lines.Length);
        var fence = false;
        for (var index = 0; index < lines.Length; index++)
        {
            var markers = FenceMarkerPattern().Matches(lines[index]).Count;
            if (markers > 0)
            {
                if (markers % 2 == 1)
                {
                    fence = !fence;
                }

                result.Add(new LineItem("", index + 1, true));
                continue;
            }

            result.Add(new LineItem(fence ? "" : lines[index], index + 1, fence));
        }

        return result;
    }

    [GeneratedRegex(@"\r?\n")]
    private static partial Regex NewlinePattern();

    [GeneratedRegex("```")]
    private static partial Regex FenceMarkerPattern();
}
