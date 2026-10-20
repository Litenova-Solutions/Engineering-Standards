using System.Text.Json.Nodes;
using LiteSpec.Authoring;
using LiteSpec.Patterns;

namespace LiteSpec.Ui;

static partial class UiValidator
{
    private sealed partial class Session
    {
        // The pattern catalog records one decision per recurring UI question: the
        // options considered, the option chosen, the compact behavior, and the
        // implementation per platform. The schema proves the shape; the checks below
        // prove the references the schema cannot see across properties, so every named
        // option, breakpoint, group, and component path resolves.
        public void ValidatePatternCatalog(string relative)
        {
            var file = FilePath(relative);
            var label = RelativeToRoot(file);
            if (!Exists(file))
            {
                Errors.Add($"[litespec/frontend/patterns#keep-one-pattern-catalog] pattern catalog: no catalog at '{relative}'");
                return;
            }

            var catalog = ReadJson(file, label);
            if (catalog is null)
            {
                return;
            }

            SchemaCheck("ui-pattern-catalog.schema.json", catalog, label, "litespec/frontend/patterns#keep-one-pattern-catalog");

            // A catalog that breaks the schema still reads below, so each access guards
            // its own shape rather than assuming the schema proved it.
            var breakpoints = Child(catalog, "breakpoints").Node is JsonObject breakpointMap
                ? breakpointMap.Select(property => property.Key).ToHashSet(StringComparer.Ordinal)
                : new HashSet<string>(StringComparer.Ordinal);
            var groupIds = (Child(catalog, "groups").Node is JsonArray groupArray ? groupArray.ToList() : new List<JsonNode?>())
                .Select(group => Child(group, "id")).ToList();
            var patterns = Child(catalog, "patterns").Node is JsonArray patternArray
                ? patternArray.ToList()
                : new List<JsonNode?>();

            // A pattern citing a LiteSpec pattern starts from its entry on a pattern page.
            // The pages ship with the LiteSpec release the validator runs from, so they
            // resolve beside this tool rather than under the consumer root.
            var pages = new Dictionary<string, PatternPage?>(StringComparer.Ordinal);
            Pattern? Cited(string id)
            {
                if (Provisions.Parse(id) is not { } parsed || !parsed.Page.StartsWith("frontend/patterns/", StringComparison.Ordinal))
                {
                    return null;
                }

                if (!pages.TryGetValue(parsed.Page, out var page))
                {
                    var path = LiteSpecHome.Root is null ? null : LiteSpecHome.PathTo($"docs/{parsed.Page}.md");
                    page = path is not null && File.Exists(path) ? PatternPage.Parse(Path.GetFileNameWithoutExtension(path), File.ReadAllText(path)) : null;
                    pages[parsed.Page] = page;
                }

                return page?.Patterns.FirstOrDefault(candidate => candidate.Slug == parsed.Slug);
            }

            var seenPatterns = new List<JsValue>();
            foreach (var pattern in patterns)
            {
                var id = Child(pattern, "id");
                if (id.Found)
                {
                    if (seenPatterns.Any(candidate => StrictEqual(candidate, id)))
                    {
                        Errors.Add($"[litespec/frontend/patterns#keep-one-pattern-catalog] {label}: duplicate pattern id '{Show(id)}'");
                    }

                    seenPatterns.Add(id);
                }

                var where = $"{label}: pattern '{ShowOr(id, "(unnamed)")}'";
                var options = Child(pattern, "options").Node is JsonArray optionArray
                    ? optionArray.ToList()
                    : new List<JsonNode?>();
                var optionIds = options.Select(option => Child(option, "id")).ToList();
                var seenOptions = new List<JsValue>();
                foreach (var option in options)
                {
                    var optionId = Child(option, "id");
                    if (!optionId.Found)
                    {
                        continue;
                    }

                    if (seenOptions.Any(candidate => StrictEqual(candidate, optionId)))
                    {
                        Errors.Add($"[litespec/frontend/patterns#keep-one-pattern-catalog] {where} has a duplicate option id '{Show(optionId)}'");
                    }

                    seenOptions.Add(optionId);
                }

                var group = Child(pattern, "group");
                if (group.Found && !groupIds.Any(candidate => StrictEqual(candidate, group)))
                {
                    Errors.Add($"[litespec/frontend/patterns#keep-one-pattern-catalog] {where}: group '{Show(group)}' is not one of the catalog groups");
                }

                var decisionOption = Dot(Child(pattern, "decision"), "option");
                if (decisionOption.Found && !optionIds.Any(candidate => StrictEqual(candidate, decisionOption)))
                {
                    Errors.Add($"[litespec/frontend/patterns#record-every-option-considered] {where}: decision.option '{Show(decisionOption)}' is not one of its options");
                }

                var compact = Child(pattern, "compact");
                var breakpoint = Dot(compact, "breakpoint");
                if (breakpoint.Found && !(breakpoint.Node is JsonValue breakpointValue && breakpointValue.TryGetValue<string>(out var breakpointName) && breakpoints.Contains(breakpointName)))
                {
                    Errors.Add($"[litespec/frontend/patterns#declare-the-compact-behavior] {where}: compact.breakpoint '{Show(breakpoint)}' is not a key of breakpoints");
                }

                var compactOption = Dot(compact, "option");
                if (compactOption.Found && !optionIds.Any(candidate => StrictEqual(candidate, compactOption)))
                {
                    Errors.Add($"[litespec/frontend/patterns#declare-the-compact-behavior] {where}: compact.option '{Show(compactOption)}' is not one of its options");
                }

                var extensions = Child(pattern, "extensions").Node is JsonArray extensionArray
                    ? extensionArray.ToList()
                    : new List<JsonNode?>();
                for (var index = 0; index < extensions.Count; index++)
                {
                    var extensionOption = Child(extensions[index], "option");
                    if (extensionOption.Found && !optionIds.Any(candidate => StrictEqual(candidate, extensionOption)))
                    {
                        Errors.Add($"[litespec/frontend/patterns#record-every-option-considered] {where}: extensions[{index}].option '{Show(extensionOption)}' is not one of its options");
                    }
                }

                // A citation names the LiteSpec pattern the entry starts from. An option id
                // the pattern does not have is the product's own option, which is allowed;
                // an option id the pattern has keeps its name, because a renamed copy reads
                // as the same option and is not.
                if (Child(pattern, "library") is { Node: JsonValue libraryValue } && libraryValue.TryGetValue<string>(out var libraryId) && libraryId.Length > 0)
                {
                    if (Cited(libraryId) is not { } cited)
                    {
                        Errors.Add($"[litespec/frontend/patterns#keep-one-pattern-catalog] {where}: library '{libraryId}' is not a pattern on a LiteSpec pattern page");
                    }
                    else
                    {
                        for (var index = 0; index < options.Count; index++)
                        {
                            var optionId = Child(options[index], "id");
                            var optionName = Child(options[index], "name");
                            if (optionId.Node is not JsonValue idValue || !idValue.TryGetValue<string>(out var optionKey)
                                || cited.Options.FirstOrDefault(candidate => candidate.Id == optionKey) is not { } expected)
                            {
                                continue;
                            }

                            if (optionName.Node is JsonValue nameValue && nameValue.TryGetValue<string>(out var name) && name != expected.Name)
                            {
                                Errors.Add($"[litespec/frontend/patterns#keep-one-pattern-catalog] {where}: options[{index}].name '{name}' does not match the LiteSpec pattern option '{optionKey}' name '{expected.Name}'");
                            }
                        }
                    }
                }

                var implementations = Child(pattern, "implementations") is { Node: JsonObject implementationMap }
                    ? implementationMap.ToList()
                    : new List<KeyValuePair<string, JsonNode?>>();
                foreach (var (implementationPlatform, implementation) in implementations)
                {
                    var target = $"{where}: implementations.{implementationPlatform}";
                    if (Child(implementation, "components").Node is JsonArray componentsArray)
                    {
                        for (var index = 0; index < componentsArray.Count; index++)
                        {
                            if (componentsArray[index] is not JsonValue componentValue || !componentValue.TryGetValue<string>(out var component) || component.Length == 0)
                            {
                                continue;
                            }

                            if (!Exists(FilePath(component)))
                            {
                                Errors.Add($"[litespec/frontend/web/patterns#implement-a-chosen-pattern-once] {target}.components[{index}] does not exist '{component}'");
                            }
                        }
                    }

                    var components = Child(implementation, "components");
                    var status = Child(implementation, "status");
                    if (status is { Node: JsonValue statusValue } && statusValue.TryGetValue<string>(out var statusText) && statusText == "adopted" && (!components.Found || (components.Node is JsonArray adopted && adopted.Count == 0)))
                    {
                        Errors.Add($"[litespec/frontend/web/patterns#implement-a-chosen-pattern-once] {target} has status 'adopted' with no components");
                    }

                    var gap = Child(implementation, "gap");
                    if (status is { Node: JsonValue gapStatusValue } && gapStatusValue.TryGetValue<string>(out var gapStatus) && (gapStatus == "partial" || gapStatus == "pending") && (gap.Node is null || (gap.Node is JsonValue gapValue && gapValue.TryGetValue<string>(out var gapText) && gapText.Length == 0)))
                    {
                        Errors.Add($"[litespec/frontend/patterns#state-the-implementation-status] {target} has status '{Show(status)}' with no gap");
                    }
                }
            }
        }
    }
}
