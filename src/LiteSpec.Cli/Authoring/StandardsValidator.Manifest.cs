using System.Text.Json.Nodes;
using System.Text.RegularExpressions;
using LiteSpec.Schemas;

namespace LiteSpec.Authoring;

/// <summary>
///     The manifest contract: references, stack composition, extensions, and schema consumers.
/// </summary>
static partial class StandardsValidator
{
    static string? JsonString(JsonNode? node) => node is JsonValue value && value.TryGetValue<string>(out var text) ? text : null;

    static List<string> JsonStrings(JsonNode? node) => node is JsonArray array
        ? array.Select(JsonString).Where(text => text is not null).Select(text => text!).ToList()
        : [];

    static string RenderJsonScalar(JsonNode? node) => node switch
    {
        null => "null",
        JsonObject => "[object Object]",
        _ => JsonString(node) ?? node.ToJsonString(),
    };

    static ManifestRegistryInfo ReadManifestRegistry(string root)
    {
        var file = Path.Combine(root, "litespec.manifest.json");
        if (!File.Exists(file))
        {
            return new ManifestRegistryInfo(false, []);
        }

        try
        {
            var manifest = JsonNode.Parse(TrimBom(ReadText(file))) as JsonObject;
            var areas = new HashSet<string>(JsonStrings((manifest?["provisionRegistry"] as JsonObject)?["areas"]), StringComparer.Ordinal);
            return new ManifestRegistryInfo(true, areas);
        }
        catch
        {
            return new ManifestRegistryInfo(false, []);
        }
    }

    static void CheckManifest(string root, Action<string, int, string, string> add, HashSet<string> activeIds, Dictionary<string, List<VerificationRow>> rowsByPage)
    {
        var manifestFile = Path.Combine(root, "litespec.manifest.json");
        if (!File.Exists(manifestFile))
        {
            return;
        }

        JsonNode? manifest;
        try
        {
            manifest = JsonNode.Parse(TrimBom(ReadText(manifestFile)));
        }
        catch (Exception exception)
        {
            add("litespec.manifest.json", 1, "MANIFEST_JSON", exception.Message);
            return;
        }

        var obj = manifest as JsonObject;
        var references = new List<string>();
        var agentsEntry = JsonString(obj?["agentsEntry"]);
        if (agentsEntry is not null)
        {
            references.Add(agentsEntry);
        }

        var stacks = obj?["stacks"] as JsonObject;
        if (stacks is not null)
        {
            foreach (var (_, stackNode) in stacks)
            {
                var stack = stackNode as JsonObject;
                var entry = JsonString(stack?["entry"]);
                var pagesNode = stack?["pages"] as JsonArray;
                var pages = JsonStrings(pagesNode);
                if (pagesNode is not null && pagesNode.All(node => JsonString(node) is not null)
                    && new HashSet<string>(pages, StringComparer.Ordinal).Count != pagesNode.Count)
                {
                    add("litespec.manifest.json", 1, "MANIFEST_DUPLICATE_PATH", $"stack '{entry ?? "undefined"}' contains a duplicate page path");
                }

                if (entry is { Length: > 0 })
                {
                    references.Add(entry);
                }

                references.AddRange(pages);
            }
        }

        var specification = obj?["specification"] as JsonObject;
        if (specification is not null)
        {
            if (JsonString(specification["entry"]) is { Length: > 0 } specificationEntry)
            {
                references.Add(specificationEntry);
            }

            references.AddRange(JsonStrings(specification["pages"] as JsonArray));
        }

        var extensions = obj?["extensions"] as JsonObject;
        if (extensions is not null)
        {
            foreach (var (_, extensionNode) in extensions)
            {
                var path = JsonString((extensionNode as JsonObject)?["path"]);
                if (path is not null)
                {
                    references.Add(path);
                }
            }
        }

        foreach (var reference in references)
        {
            if (reference.Length == 0)
            {
                continue;
            }

            var parts = reference.Split('#');
            var relative = parts[0];
            var anchor = parts.Length > 1 ? parts[1] : "";
            var target = JoinRoot(root, relative);
            if (!File.Exists(target) && !Directory.Exists(target))
            {
                add("litespec.manifest.json", 1, "MANIFEST_PATH", $"path '{relative}' does not exist");
                continue;
            }

            if (anchor.Length > 0 && File.Exists(target) && !AnchorsFor(ReadText(target)).Contains(anchor))
            {
                add("litespec.manifest.json", 1, "MANIFEST_ANCHOR", $"anchor '#{anchor}' does not exist in '{relative}'");
            }
        }

        CheckStackComposition(root, stacks, add);
        if (specification is not null)
        {
            CheckStackComposition(root, new JsonObject { ["specification"] = specification.DeepClone() }, add);
            CheckLayers(root, specification, stacks, extensions, add);
        }

        CheckManifestExtensions(root, extensions, activeIds, rowsByPage, add);
    }

    // Areas whose pages belong to no layer: guides, commands, references, and the
    // extensions, which the manifest lists on their own.
    static readonly string[] LayerFreeAreas = ["docs/ext/", "docs/guide/", "docs/reference/", "docs/tools/", "docs/tutorial/"];

    // Every page belongs to the specification, which every consumer applies, or to at
    // least one stack binding, never both. An unlisted page applies to nobody, and a page
    // in both layers would bind a stack-neutral rule to one stack.
    // (litespec/rule/profile-stacks.apply-the-complete-stack)
    static void CheckLayers(string root, JsonObject specification, JsonObject? stacks, JsonObject? extensions, Action<string, int, string, string> add)
    {
        var specificationPages = JsonStrings(specification["pages"] as JsonArray).ToHashSet(StringComparer.Ordinal);
        var stackPages = new HashSet<string>(StringComparer.Ordinal);
        foreach (var (_, stackNode) in stacks ?? [])
        {
            stackPages.UnionWith(JsonStrings((stackNode as JsonObject)?["pages"] as JsonArray));
        }

        var docs = Path.Combine(root, "docs");
        if (Directory.Exists(docs))
        {
            foreach (var file in Directory.GetFiles(docs, "*.md", SearchOption.AllDirectories).OrderBy(name => name, StringComparer.Ordinal))
            {
                var relative = Slash(Path.GetRelativePath(root, file));
                if (Path.GetFileName(relative) == "README.md" || LayerFreeAreas.Any(area => relative.StartsWith(area, StringComparison.Ordinal)))
                {
                    continue;
                }

                if (!specificationPages.Contains(relative) && !stackPages.Contains(relative))
                {
                    add(relative, 1, "LAYER_UNLISTED", "page is listed in neither the specification nor any stack in litespec.manifest.json");
                }
            }
        }

        foreach (var page in specificationPages.Where(stackPages.Contains).OrderBy(page => page, StringComparer.Ordinal))
        {
            add("litespec.manifest.json", 1, "LAYER_OVERLAP", $"page '{page}' is listed in the specification and in a stack");
        }

        foreach (var (id, extensionNode) in extensions ?? [])
        {
            foreach (var stack in JsonStrings((extensionNode as JsonObject)?["stacks"] as JsonArray))
            {
                if (stacks is null || !stacks.ContainsKey(stack))
                {
                    add("litespec.manifest.json", 1, "EXTENSION_STACK_UNKNOWN", $"extension '{id}' names stack '{stack}', which the manifest does not ship");
                }
            }
        }
    }

    static void CheckStackComposition(string root, JsonObject? stacks, Action<string, int, string, string> add)
    {
        if (stacks is null)
        {
            return;
        }

        foreach (var (id, stackNode) in stacks)
        {
            var stack = stackNode as JsonObject;
            var entry = JsonString(stack?["entry"]);
            if (entry is null || entry.Length == 0)
            {
                continue;
            }

            var entryFile = JoinRoot(root, entry);
            if (!File.Exists(entryFile) && !Directory.Exists(entryFile))
            {
                continue;
            }

            if (!File.Exists(entryFile))
            {
                continue;
            }

            // The Composition section is the stack's list, so only that section is
            // compared with the manifest. A link in Intent or Conventions is prose
            // pointing at a page, not a claim that the stack composes it.
            var composition = SectionBody(SplitLines(ReadText(entryFile)), "Composition");
            var actual = new List<string>();
            foreach (Match match in CompositionLinkPattern().Matches(composition))
            {
                var resolved = Slash(Path.GetRelativePath(root, Path.GetFullPath(Path.Combine(Path.GetDirectoryName(entryFile)!, TryDecodeURIComponent(match.Groups[1].Value, out var decoded) ? decoded : match.Groups[1].Value))));
                if (!actual.Contains(resolved))
                {
                    actual.Add(resolved);
                }
            }

            var expected = new List<string>();
            foreach (var page in JsonStrings(stack?["pages"]))
            {
                if (!expected.Contains(page))
                {
                    expected.Add(page);
                }
            }

            foreach (var page in expected)
            {
                if (!actual.Contains(page))
                {
                    add(entry, 1, "STACK_COMPOSITION_MISSING", $"stack '{id}' Composition omits '{page}'");
                }
            }

            foreach (var page in actual)
            {
                if (!expected.Contains(page))
                {
                    add(entry, 1, "STACK_COMPOSITION_EXTRA", $"stack '{id}' Composition adds '{page}' outside the manifest");
                }
            }
        }
    }

    static void CheckManifestExtensions(string root, JsonObject? extensions, HashSet<string> activeIds, Dictionary<string, List<VerificationRow>> rowsByPage, Action<string, int, string, string> add)
    {
        if (extensions is null)
        {
            return;
        }

        foreach (var (id, extensionNode) in extensions)
        {
            var ext = extensionNode as JsonObject;
            var extensionPath = JsonString(ext?["path"]);
            if (extensionPath is null)
            {
                continue;
            }

            var file = JoinRoot(root, extensionPath);
            if (!File.Exists(file))
            {
                continue;
            }

            var raw = ReadText(file);
            var lines = SplitLines(raw);
            var activation = SectionBody(lines, "Activation");
            var baseline = SectionBody(lines, "Baseline relationship");
            var dependencies = SectionBody(lines, "Dependencies");
            var scope = JsonString(ext?["activationScope"]) ?? "undefined";
            if (!activation.Contains($"Activation scope: `{scope}`.", StringComparison.Ordinal))
            {
                add(extensionPath, 1, "EXTENSION_SCOPE", $"extension '{id}' does not state activation scope '{scope}'");
            }

            var kindLine = SplitLines(activation).FirstOrDefault(line => line.StartsWith("Applicable specification kinds:", StringComparison.Ordinal)) ?? "";
            var actualKinds = InlineCodePattern().Matches(kindLine).Cast<Match>().Select(match => match.Groups[1].Value).ToList();
            var expectedKinds = JsonStrings(ext?["applicableKinds"]);
            if (actualKinds.Count != expectedKinds.Count || actualKinds.Any(kind => !expectedKinds.Contains(kind)))
            {
                add(extensionPath, 1, "EXTENSION_KIND", $"extension '{id}' applicable kinds do not match the manifest");
            }

            var activationDetail = SplitLines(activation).Where(line => line.Trim().Length > 0 && !ActivationPrefixPattern().IsMatch(line.Trim())).ToList();
            if (activationDetail.Count == 0)
            {
                add(extensionPath, 1, "EXTENSION_ACTIVATION", $"extension '{id}' has no activation criterion");
            }

            if (baseline.Length == 0)
            {
                add(extensionPath, 1, "EXTENSION_BASELINE", $"extension '{id}' has an empty Baseline relationship");
            }

            if (dependencies.Length == 0)
            {
                add(extensionPath, 1, "EXTENSION_DEPENDENCIES", $"extension '{id}' has an empty Dependencies section");
            }

            // A replacement is machine-readable: every replaced ID resolves to an
            // active provision, and the replacing extension enforces its own
            // provisions instead, so the replaced one has no row in its table.
            var replaces = ext?["replaces"] is JsonArray replacesNode
                ? replacesNode.Select(RenderJsonScalar).ToList()
                : new List<string>();
            var ownRows = rowsByPage.TryGetValue(extensionPath, out var rows) ? rows : new List<VerificationRow>();
            foreach (var replaced in replaces)
            {
                if (!activeIds.Contains(replaced))
                {
                    add("litespec.manifest.json", 1, "EXTENSION_REPLACES_UNKNOWN", $"extension '{id}' replaces unknown provision '{replaced}'");
                }

                var row = ownRows.FirstOrDefault(item => item.Id == replaced);
                if (row is not null)
                {
                    add(extensionPath, row.Line, "EXTENSION_REPLACES_ENFORCED", $"extension '{id}' replaces '{replaced}' and still enforces it in its own Verification table");
                }
            }
        }
    }

    /// <summary>The published home every schema id names, followed by the release version.</summary>
    public const string SchemaHome = "https://litespec.dev/";

    // A schema id is the URL a consumer's editor fetches, so it names the release that
    // ships the schema: a pinned consumer keeps resolving the shape it reviewed.
    static void CheckSchemaIds(string root, Action<string, int, string, string> add)
    {
        var schemas = Path.Combine(root, "schemas");
        var manifest = Path.Combine(root, "litespec.manifest.json");
        if (!Directory.Exists(schemas) || !File.Exists(manifest))
        {
            return;
        }

        string? version;
        try
        {
            version = JsonNode.Parse(TrimBom(ReadText(manifest)))?["version"] is JsonValue value && value.TryGetValue<string>(out var text) ? text : null;
        }
        catch (Exception)
        {
            return;
        }

        if (version is null)
        {
            return;
        }

        foreach (var file in Directory.GetFiles(schemas, "*.json").OrderBy(name => name, StringComparer.Ordinal))
        {
            var name = Path.GetFileName(file);
            var relative = $"schemas/{name}";
            string? id;
            try
            {
                id = JsonNode.Parse(TrimBom(ReadText(file)))?["$id"] is JsonValue value && value.TryGetValue<string>(out var text) ? text : null;
            }
            catch (Exception)
            {
                continue;
            }

            var expected = $"{SchemaHome}{version}/schemas/{name}";
            if (id is not null && id != expected)
            {
                add(relative, 1, "SCHEMA_ID", $"schema $id '{id}' must be '{expected}'");
            }
        }
    }

    static void ValidateSchemaConsumer(string root, string schemaRelative, string valueRelative, Action<string, int, string, string> add)
    {
        var schemaFile = JoinRoot(root, schemaRelative);
        var valueFile = JoinRoot(root, valueRelative);
        if (!File.Exists(schemaFile) || !File.Exists(valueFile))
        {
            return;
        }

        JsonNode? schema;
        JsonNode? value;
        try
        {
            schema = JsonNode.Parse(TrimBom(ReadText(schemaFile)));
            value = JsonNode.Parse(TrimBom(ReadText(valueFile)));
        }
        catch (Exception exception)
        {
            add(valueRelative, 1, "SCHEMA_JSON", exception.Message);
            return;
        }

        JsonSchema.UnsupportedKeywords(schema, schemaRelative, "#", add);
        var errors = new List<string>();
        try
        {
            JsonSchema.Validate(value, schema, schema!, valueRelative, errors);
        }
        catch (Exception exception)
        {
            errors.Add(exception.Message);
        }

        foreach (var error in errors)
        {
            add(valueRelative, 1, "SCHEMA_INVALID", error);
        }
    }

    [GeneratedRegex(@"\[[^\]]+\]\(([^)#]+)(?:#[^)]+)?\)")]
    private static partial Regex CompositionLinkPattern();

    [GeneratedRegex(@"`([^`]+)`")]
    private static partial Regex InlineCodePattern();

    [GeneratedRegex(@"^(?:Activation scope|Applicable specification kinds):")]
    private static partial Regex ActivationPrefixPattern();
}
