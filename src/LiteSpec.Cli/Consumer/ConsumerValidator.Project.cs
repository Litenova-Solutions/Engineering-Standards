using System.Text.Json.Nodes;
using System.Text.RegularExpressions;
using LiteSpec.Schemas;

namespace LiteSpec.Consumer;

/// <summary>
///     The project record, manifest, extension, stage and frontend checks of the consumer validator.
/// </summary>
static partial class ConsumerValidator
{
    static readonly string[] DefaultStacks = ["blazor", "react", "svelte"];

    static readonly string[] ControlledPlatforms = ["react", "svelte"];

    // Whether a manifest path sits under a folder, compared by text.
    static bool IsUnder(string path, string folder) =>
        path == folder || path.StartsWith(folder + "/", StringComparison.Ordinal);

    static readonly Regex ProvisionRow = new(@"^\| (litespec/[^\s|]*#[^\s|]*) \|", RegexOptions.Multiline);

    /// <summary>
    ///     Validates the project record against the project schema, resolves the documentation
    ///     root, and normalizes the extension selections.
    /// </summary>
    static void CheckProjectRecord(RunState run)
    {
        // The project record is validated through the shared schema module, so the
        // schema is the one statement of its shape. A hand table beside it would need
        // the same edit twice and drift on the third.
        foreach (var problem in JsonSchema.Problems(run.ProjectSchemaFile, run.Project, "litespec.project.json", run.ReadSchema))
        {
            run.Err(problem);
        }

        var paths = (run.Project as JsonObject)?["paths"] as JsonObject;

        // The documentation root is configuration, not a constant. A hard-coded docs/
        // scans nothing in a consumer that keeps its pages elsewhere, and a scan of
        // nothing reports PASS. 'docs' stays the default because that is the layout the
        // standards describe.
        run.DocsPath = PropString(paths, "docs") ?? "docs";
        run.DocsRoot = Path.Join(run.Root, run.DocsPath);

        // A configured path that does not resolve disables the checks that read it and
        // leaves the run reporting PASS, so each message names the check that goes quiet.
        var configuredPaths = new[]
        {
            ("paths.docs", "docs", "the page scan finds no record to check"),
            ("paths.language", "language", "the vocabulary and mannered-term checks resolve nothing"),
        };

        foreach (var (field, key, consequence) in configuredPaths)
        {
            if (paths is null || !paths.TryGetPropertyValue(key, out var value))
            {
                continue;
            }

            var text = AsString(value);

            if (text is null || text.Trim().Length == 0)
            {
                run.Err($"litespec.project.json: {field} '{JsText(value)}' is not a path");
                continue;
            }

            if (!File.Exists(Path.Join(run.Root, text)) && !Directory.Exists(Path.Join(run.Root, text)))
            {
                run.Err($"litespec.project.json: {field} '{text}' does not exist; {consequence}");
            }
        }

        // A selection records the criterion that was met and the date it is next
        // reviewed, so a selection that costs nothing to keep still expires.
        var declared = (run.Project as JsonObject)?["selectedExtensions"] is JsonArray array ? array.ToList() : new List<JsonNode?>();

        foreach (var entry in declared)
        {
            run.Selections.Add(NormalizeSelection(entry));
        }
    }

    static Selection NormalizeSelection(JsonNode? entry)
    {
        if (entry is JsonValue && AsString(entry) is string id)
        {
            return new Selection(id, id, null, null, []);
        }

        if (entry is JsonObject container)
        {
            var selectedId = PropString(container, "id");
            var deferred = container["deferredProvisions"] is JsonArray provisions ? provisions.ToList() : new List<JsonNode?>();

            return new Selection(selectedId, PropText(container, "id"), PropString(container, "reviewBy"), PropString(container, "releaseStage"), deferred);
        }

        return new Selection(null, "undefined", null, null, []);
    }

    /// <summary>
    ///     Holds the recorded review version, the stack names and the extension selections
    ///     against the pinned manifest, and expires review dates and stage deferrals.
    /// </summary>
    static void CheckManifest(RunState run)
    {
        JsonNode? manifest = null;

        foreach (var relative in new[] { "litespec/litespec.manifest.json", "../litespec.manifest.json" })
        {
            var candidate = Path.Join(run.Root, relative);

            if (!File.Exists(candidate))
            {
                continue;
            }

            try
            {
                manifest = run.ReadJson(candidate);
            }
            catch (Exception cause)
            {
                run.FailInput($"{relative}: not valid JSON ({cause.Message})");
            }

            break;
        }

        // Adopting a release means accepting its complete contract, so the project
        // records the release it reviewed. A mismatch means the pinned LiteSpec release moved
        // without anyone re-reading the contract that now applies.
        if (IsTruthy((manifest as JsonObject)?["version"]))
        {
            var version = (manifest as JsonObject)!["version"];
            var reviewed = (run.Project as JsonObject)?["reviewedLiteSpecVersion"];

            if (IsFalsy(reviewed))
            {
                run.Err($"litespec.project.json: missing 'reviewedLiteSpecVersion'; the pinned LiteSpec release is {JsText(version)}");
            }
            else if (!StrictEqual(reviewed, version))
            {
                run.Err($"litespec.project.json: reviewedLiteSpecVersion '{JsText(reviewed)}' does not match the pinned LiteSpec release {JsText(version)}; re-review the contract and record the new version");
            }
        }

        // A stack the pinned release does not ship selects no page, so every
        // stack-scoped provision would pass by applying to nothing.
        var project = run.Project as JsonObject;
        var manifestObj = manifest as JsonObject;
        var shape = PropString(project, "shape") ?? "server";
        var named = project?["stacks"] is JsonArray declaredStacks
            ? declaredStacks.Select(AsString).OfType<string>().ToList()
            : new List<string>();

        if (manifestObj is not null)
        {
            var stacks = LiteSpec.Authoring.Layout.Stacks(manifestObj);
            var byId = stacks.ToDictionary(stack => stack.Id, stack => stack, StringComparer.Ordinal);
            var backendIds = stacks.Where(stack => stack.Kind == "backend").Select(stack => stack.Id).OrderBy(id => id, StringComparer.Ordinal).ToList();
            var frontendIds = stacks.Where(stack => stack.Kind == "frontend").Select(stack => stack.Id).OrderBy(id => id, StringComparer.Ordinal).ToList();

            run.KnownStacks.AddRange(frontendIds);

            foreach (var stack in named.Where(stack => !byId.ContainsKey(stack)))
            {
                run.Err($"litespec.project.json: stack '{stack}' is not a stack the pinned LiteSpec release ships [litespec/core/scope#select-a-size-profile-and-stacks]");
            }

            var backends = named.Where(byId.ContainsKey).Where(stack => byId[stack].Kind == "backend").ToList();

            // A server project names exactly one backend stack; a client-only
            // project names none, and reads the backend pages its shape lists.
            if (shape == "client-only")
            {
                foreach (var backend in backends)
                {
                    run.Err($"litespec.project.json: shape 'client-only' names backend stack '{backend}'; a client-only project names no backend stack [litespec/core/scope#select-a-size-profile-and-stacks]");
                }
            }
            else if (backends.Count != 1)
            {
                run.Err($"litespec.project.json: stacks name {backends.Count} backend stacks; name exactly one of {string.Join(", ", backendIds)} [litespec/core/scope#select-a-size-profile-and-stacks]");
            }

            // A stack whose requires is not also named misses the pages its own
            // stack builds on, so the selection applies half a stack.
            foreach (var stack in named.Where(byId.ContainsKey))
            {
                foreach (var required in byId[stack].Requires)
                {
                    if (!named.Contains(required))
                    {
                        run.Err($"litespec.project.json: stack '{stack}' requires '{required}', which the project does not name in stacks [litespec/core/scope#select-a-size-profile-and-stacks]");
                    }
                }
            }

            // A frontend stack whose pairsWith excludes the project's backend stack
            // works beside another backend only; absent pairsWith means any backend.
            foreach (var stack in named.Where(byId.ContainsKey).Where(stack => byId[stack].Kind == "frontend"))
            {
                var pairs = byId[stack].PairsWith;

                if (pairs.Count == 0)
                {
                    continue;
                }

                foreach (var backend in backends.Where(backend => !pairs.Contains(backend)))
                {
                    run.Err($"litespec.project.json: frontend stack '{stack}' pairs only with {string.Join(", ", pairs)}, not with backend stack '{backend}' [litespec/core/scope#select-a-size-profile-and-stacks]");
                }
            }

            if (manifestObj["extensions"] is JsonObject extensions)
            {
                // A selection is checked against the manifest, not only against itself, so a
                // release that renamed an extension fails the stale selection rather than
                // passing a contract nobody selected.
                var known = extensions.Select(pair => pair.Key).OrderBy(key => key, StringComparer.Ordinal).ToList();
                var reported = new HashSet<string>(StringComparer.Ordinal);

                foreach (var selection in run.Selections)
                {
                    if (!reported.Add(selection.IdText))
                    {
                        continue;
                    }

                    if (selection.Id is null || !extensions.TryGetPropertyValue(selection.Id, out var shipped) || IsFalsy(shipped))
                    {
                        run.Err($"litespec.project.json: extensions '{selection.IdText}' is not an extension in the pinned LiteSpec release; known ids are {string.Join(", ", known)}");
                    }
                    else
                    {
                        // An extension under a stack folder supports that stack only;
                        // under docs/ext/ it supports every stack. Selecting it without
                        // its stack applies nothing it states.
                        var path = AsString((shipped as JsonObject)?["path"]);

                        if (path is not null && !IsUnder(path, "docs/ext"))
                        {
                            var supported = stacks.Where(stack => IsUnder(path, stack.Folder)).Select(stack => stack.Id).OrderBy(id => id, StringComparer.Ordinal).ToList();

                            if (supported.Count > 0 && !named.Any(supported.Contains))
                            {
                                run.Err($"litespec.project.json: extensions '{selection.IdText}' supports only the {string.Join(", ", supported)} stack, which the project does not name in stacks [litespec/core/scope#select-a-size-profile-and-stacks]");
                            }
                        }
                    }
                }
            }
        }
        else
        {
            run.KnownStacks.AddRange(DefaultStacks);
        }

        // An extension selected without a surface costs nothing to keep, so nobody
        // removes it. A recorded review date makes the selection expire rather than
        // accumulate.
        foreach (var selection in run.Selections)
        {
            if (selection.ReviewBy is null)
            {
                continue;
            }

            if (string.CompareOrdinal(selection.ReviewBy, run.Today) < 0)
            {
                run.Err($"litespec.project.json: extensions '{selection.IdText}' was due for review on {selection.ReviewBy}; confirm the criterion still applies or remove the selection");
            }
        }

        // The schema refuses a stage selection without a release stage. A deferral
        // naming no provision defers nothing, one past its date has drifted, and a
        // production project defers nothing at all.
        var stage = run.Selections.FirstOrDefault(selection => selection.Id == "stage");
        var deferrals = stage?.DeferredProvisions ?? [];

        if (stage?.ReleaseStage == "production" && deferrals.Count > 0)
        {
            run.Err($"litespec.project.json: extensions 'stage' declares production and still defers {deferrals.Count} provision(s); the promotion decision ends every deferral");
        }

        if (deferrals.Count > 0)
        {
            var indexFile = Path.Combine(run.StandardsRoot, "docs", "reference", "provisions.md");
            var knownProvisions = new HashSet<string>(StringComparer.Ordinal);

            if (File.Exists(indexFile))
            {
                foreach (Match match in ProvisionRow.Matches(run.ReadText(indexFile)))
                {
                    knownProvisions.Add(match.Groups[1].Value);
                }
            }

            foreach (var deferral in deferrals)
            {
                var detail = deferral as JsonObject;
                var provision = detail is not null
                    && detail.TryGetPropertyValue("provision", out var provisionValue)
                    && IsTruthy(provisionValue)
                    ? JsText(provisionValue)
                    : null;

                if (provision is null)
                {
                    continue;
                }

                // The old litespec/rule/ form names no provision in this release; a
                // deferral names its provision as litespec/<page>#<slug>.
                if (provision.StartsWith("litespec/rule/", StringComparison.Ordinal)
                    || provision.StartsWith("litespec/convention/", StringComparison.Ordinal))
                {
                    run.Err($"litespec.project.json: extensions 'stage' defers '{provision}', which uses the retired litespec/rule/ form; name the provision as litespec/<page>#<slug>");
                    continue;
                }

                if (!knownProvisions.Contains(provision))
                {
                    run.Err($"litespec.project.json: extensions 'stage' defers '{provision}', which is not a provision in the pinned LiteSpec release");
                }

                var until = PropString(detail, "until");

                if (!string.IsNullOrEmpty(until) && string.CompareOrdinal(until, run.Today) < 0)
                {
                    run.Err($"litespec.project.json: extensions 'stage' deferral of '{provision}' ended on {until}; apply the provision or record a new deferral");
                }
            }
        }
    }

    /// <summary>
    ///     Checks every declared frontend's directory and platform, routes the controlled
    ///     ones to the shared UI package, and checks the package's own paths.
    /// </summary>
    static void CheckFrontends(RunState run)
    {
        // Every frontend declares its stack. Without the field a frontend silently
        // skips every stack-scoped check, and the omission is indistinguishable from a
        // considered position.
        var paths = (run.Project as JsonObject)?["paths"] as JsonObject;
        var frontends = paths?["frontends"] is JsonArray array ? array.ToList() : new List<JsonNode?>();

        foreach (var frontend in frontends)
        {
            var declared = frontend as JsonObject;
            var name = declared is not null && declared.TryGetPropertyValue("name", out var nameValue) && nameValue is not null
                ? JsText(nameValue)
                : "(unnamed)";

            // A declared frontend whose directory is absent reads as a frontend with no
            // code, and every check for it passes by having nothing to read.
            if (declared is not null && declared.TryGetPropertyValue("path", out var frontendPath) && AsString(frontendPath) is string frontendDir)
            {
                if (!File.Exists(Path.Join(run.Root, frontendDir)) && !Directory.Exists(Path.Join(run.Root, frontendDir)))
                {
                    run.Err($"litespec.project.json: frontend '{name}' path '{frontendDir}' does not exist; the checks for that frontend read nothing");
                }
            }

            var platform = declared is not null && declared.TryGetPropertyValue("platform", out var platformValue) ? platformValue : null;
            var namedStacks = (run.Project as JsonObject)?["stacks"] is JsonArray namedArray
                ? namedArray.Select(AsString).OfType<string>().ToHashSet(StringComparer.Ordinal)
                : new HashSet<string>(StringComparer.Ordinal);

            // A frontend platform names a frontend stack the project names: a backend
            // stack declared as a platform would select the wrong pages.
            if (IsFalsy(platform))
            {
                run.Err($"litespec.project.json: frontend '{name}' declares no 'platform'; one of {string.Join(", ", run.KnownStacks)} is required [litespec/core/scope#select-a-size-profile-and-stacks]");
            }
            else if (AsString(platform) is not string stack || !run.KnownStacks.Contains(stack))
            {
                run.Err($"litespec.project.json: frontend '{name}' has unknown platform '{JsText(platform)}'; expected one of {string.Join(", ", run.KnownStacks)} [litespec/core/scope#select-a-size-profile-and-stacks]");
            }
            else if (!namedStacks.Contains(stack))
            {
                run.Err($"litespec.project.json: frontend '{name}' platform '{stack}' is not a stack the project names in stacks [litespec/core/scope#select-a-size-profile-and-stacks]");
            }
            else if (ControlledPlatforms.Contains(stack))
            {
                run.ControlledFrontends.Add(frontend);
            }
        }

        // A controlled frontend composes the shared UI package, so the workspace declares
        // it once. The package travels with the workspace rather than with an
        // application, so one missing field is one missing file for every frontend
        // rather than a row per application.
        var uiPackage = paths is not null && paths.TryGetPropertyValue("uiPackage", out var packageValue) ? packageValue : null;
        run.UiPackage = uiPackage;

        if (run.ControlledFrontends.Count > 0 && IsFalsy(uiPackage))
        {
            run.Err($"litespec.project.json: {run.ControlledFrontends.Count} controlled frontend(s) and no 'paths.uiPackage'; the shared UI package every controlled web frontend composes is undeclared");
        }
        else if (IsTruthy(uiPackage))
        {
            var package = uiPackage as JsonObject;
            var packageName = PropString(package, "name") ?? "(unnamed)";
            var label = $"litespec.project.json: paths.uiPackage '{packageName}'";

            foreach (var key in new[] { "path", "componentsJson", "primitives", "tokens", "sourceLock", "designContract" })
            {
                if (package is not null && package.TryGetPropertyValue(key, out var configured) && AsString(configured) is string configuredPath)
                {
                    if (!File.Exists(Path.Join(run.Root, configuredPath)) && !Directory.Exists(Path.Join(run.Root, configuredPath)))
                    {
                        run.Err($"{label}: {key} path does not exist '{configuredPath}'");
                    }
                }
            }

            foreach (var frontend in run.ControlledFrontends)
            {
                var declared = frontend as JsonObject;
                var ui = declared?["ui"] as JsonObject;

                if (ui is not null && ui.TryGetPropertyValue("globalCss", out var stylesheetValue) && AsString(stylesheetValue) is string stylesheet)
                {
                    if (!File.Exists(Path.Join(run.Root, stylesheet)) && !Directory.Exists(Path.Join(run.Root, stylesheet)))
                    {
                        run.Err($"litespec.project.json: frontend '{PropText(declared, "name")}' ui.globalCss path does not exist '{stylesheet}'");
                    }
                }
            }
        }
    }
}
