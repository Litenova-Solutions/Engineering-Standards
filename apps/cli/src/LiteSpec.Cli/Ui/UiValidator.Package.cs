using System.Text.Json.Nodes;
using System.Text.RegularExpressions;

namespace LiteSpec.Ui;

static partial class UiValidator
{
    static readonly Regex PinnedVersion = new("^[0-9]+\\.[0-9]+\\.[0-9]+$", RegexOptions.Compiled);

    static readonly string[] DesignSections =
    [
        "Brand", "Tokens", "Vocabulary", "Patterns", "Do", "Do not", "Motion", "Voice",
    ];

    private sealed partial class Session
    {
        // The registry configuration the pinned CLI wrote. It is read against the
        // manifest baseline, so a package describing a preset the release does not pin
        // reports rather than passing unread.
        public void ValidateComponentsJson(string file, JsonNode? baseline, bool baselineOverride, string platform)
        {
            var label = RelativeToRoot(file);
            var config = ReadJson(file, label);
            if (config is null)
            {
                return;
            }

            // Findings cite the stack-neutral provisions whatever the platform, because
            // the UI rules live on one page per concern with small per-stack sections.
            if (platform == "svelte")
            {
                // shadcn-svelte writes tailwind.baseColor with no cssVariables field, and
                // its icon, menu, and registry fields are optional. An omitted field takes
                // the CLI default the baseline records, so only a present field is
                // compared. The style field is deprecated under Tailwind v4 and unread.
                if (!StrictEqual(Dot(Child(config, "tailwind"), "baseColor"), Child(baseline, "baseColor")))
                {
                    Errors.Add($"[litespec/frontend/web/ui#pin-the-baseline-in-the-shared-package] {label}: tailwind.baseColor must be '{Show(Child(baseline, "baseColor"))}'");
                }

                foreach (var (key, baselineKey) in new[] { ("iconLibrary", "icons"), ("menuColor", "menuColor"), ("menuAccent", "menuAccent") })
                {
                    var want = Child(baseline, baselineKey);
                    var got = Child(config, key);
                    if (got.Found && !StrictEqual(got, want))
                    {
                        Errors.Add($"[litespec/frontend/web/ui#pin-the-baseline-in-the-shared-package] {label}: {key} must be {StringifyOrUndefined(want)}");
                    }
                }

                var registry = Child(config, "registry");
                if (Truthy(registry) && !StrictEqual(registry, Dot(Child(baseline, "registry"), "url")) && !baselineOverride)
                {
                    Errors.Add($"[litespec/frontend/web/ui#pin-the-baseline-in-the-shared-package] {label}: registry '{Show(registry)}' is not the built-in shadcn-svelte registry; an additional registry requires an exception");
                }

                return;
            }

            foreach (var (key, want) in new (string, JsValue)[]
                     {
                         ("style", Child(baseline, "componentsStyle")),
                         ("iconLibrary", Child(baseline, "icons")),
                         ("menuColor", Child(baseline, "menuColor")),
                         ("menuAccent", Child(baseline, "menuAccent")),
                         ("rtl", new JsValue(true, JsonValue.Create(false))),
                     })
            {
                if (!StrictEqual(Child(config, key), want))
                {
                    Errors.Add($"[litespec/frontend/web/ui#pin-the-baseline-in-the-shared-package] {label}: {key} must be {StringifyOrUndefined(want)}");
                }
            }

            var tailwind = Child(config, "tailwind");
            if (!StrictEqual(Dot(tailwind, "baseColor"), Child(baseline, "baseColor")))
            {
                Errors.Add($"[litespec/frontend/web/ui#pin-the-baseline-in-the-shared-package] {label}: tailwind.baseColor must be '{Show(Child(baseline, "baseColor"))}'");
            }

            var cssVariables = Child(baseline, "cssVariables");
            if (!StrictEqual(Dot(tailwind, "cssVariables"), cssVariables))
            {
                Errors.Add($"[litespec/frontend/web/ui#pin-the-baseline-in-the-shared-package] {label}: tailwind.cssVariables must be {Show(cssVariables)}");
            }

            var registries = Child(config, "registries");
            if (registries is { Found: true, Node: not null } && RegistriesNonEmpty(registries.Node) && !baselineOverride)
            {
                Errors.Add($"[litespec/frontend/web/ui#pin-the-baseline-in-the-shared-package] {label}: an additional registry requires an exception");
            }
        }

        static bool RegistriesNonEmpty(JsonNode registries) => registries switch
        {
            JsonObject found => found.Count > 0,
            JsonArray array => array.Count > 0,
            JsonValue value when value.TryGetValue<string>(out var text) => text.Length > 0,
            _ => false,
        };

        // The source lock describes one copy of the registry source. Its paths resolve
        // against the package root rather than an application root, so a second
        // application cannot hold a copy the lock does not see.
        public void ValidateSourceLock(string file, JsonNode? baseline, string packageRoot, JsonNode? manifest, bool baselineOverride, string platform)
        {
            var label = RelativeToRoot(file);
            var lockNode = ReadJson(file, label);
            if (lockNode is null)
            {
                return;
            }

            foreach (var key in new[] { "schemaVersion", "generator", "cli", "preset", "registry", "formatter", "components" })
            {
                Required(lockNode, key, label);
            }

            SchemaCheck("ui-source-lock.schema.json", lockNode, label, "litespec/frontend/web/ui#track-source-changes");
            var cliPackage = platform == "svelte" ? "shadcn-svelte" : "shadcn";
            var expectedCli = Chain(manifest, "packages", "npm", cliPackage);
            var cli = Child(lockNode, "cli");
            var cliText = cli is { Node: JsonValue cliValue } && cliValue.TryGetValue<string>(out var cliRaw) ? cliRaw : "";

            // The pinned-version test already rejects `latest` and every other range, so
            // no separate branch for the word is reachable.
            if (!PinnedVersion.IsMatch(cliText))
            {
                Errors.Add($"{label}: cli must be a pinned semantic version");
            }
            else if (Truthy(expectedCli) && !StrictEqual(cli, expectedCli))
            {
                Errors.Add($"{label}: cli must match manifest {cliPackage} pin '{Show(expectedCli)}'");
            }

            var lockRegistry = Child(lockNode, "registry");
            var baselineRegistry = Child(baseline, "registry");
            if ((!StrictEqual(Dot(lockRegistry, "name"), Dot(baselineRegistry, "name")) || !StrictEqual(Dot(lockRegistry, "url"), Dot(baselineRegistry, "url"))) && !baselineOverride)
            {
                Errors.Add($"[litespec/frontend/web/ui#pin-the-baseline-in-the-shared-package] {label}: registry '{ShowOr(Dot(lockRegistry, "name"), "(unnamed)")}' is not the built-in {ShowOr(Dot(baselineRegistry, "name"), "registry")} registry; an additional registry requires an exception");
            }

            foreach (var key in new[] { "style", "base", "cssVariables", "baseColor", "theme", "chartColor", "font", "fontHeading", "icons", "radius", "menuAccent", "menuColor", "componentsStyle" })
            {
                var want = Child(baseline, key);
                if (want.Found && !StrictEqual(Dot(Child(lockNode, "preset"), key), want))
                {
                    Errors.Add($"[litespec/frontend/web/ui#pin-the-baseline-in-the-shared-package] {label}: preset.{key} does not match the manifest baseline");
                }
            }

            var pinnedPackages = NpmKeys(manifest);
            var items = ReadArray(lockNode, "components", label);
            Unique(items.Select(item => Child(item, "name")), $"{label}.components");
            foreach (var item in items)
            {
                var itemLabel = $"{label}.{ShowOr(Child(item, "name"), "component")}";
                foreach (var key in new[] { "name", "address", "status", "paths", "digest", "dependencies" })
                {
                    Required(item, key, itemLabel);
                }

                foreach (var dependency in ReadArray(item, "dependencies", itemLabel))
                {
                    var name = dependency is JsonValue dependencyValue && dependencyValue.TryGetValue<string>(out var dependencyName) ? dependencyName : null;
                    if (name is null || !pinnedPackages.Contains(name))
                    {
                        Errors.Add($"[litespec/frontend/web/ui#track-source-changes] {itemLabel}: dependency '{ShowNode(dependency)}' is not pinned in the LiteSpec manifest");
                    }
                }

                foreach (var path in ReadArray(item, "paths", itemLabel))
                {
                    if (path is not JsonValue pathValue || !pathValue.TryGetValue<string>(out var relative))
                    {
                        continue;
                    }

                    var candidate = Path.GetFullPath(Path.Combine(packageRoot, relative));
                    if (!Within(packageRoot, candidate))
                    {
                        Errors.Add($"{itemLabel}: path escapes the shared package root '{relative}'");
                        continue;
                    }

                    if (!Exists(candidate))
                    {
                        Errors.Add($"{itemLabel}: source path does not exist '{relative}'");
                        continue;
                    }

                    var actual = Digest(candidate);
                    if (actual is null)
                    {
                        Errors.Add($"{itemLabel}: cannot read source path '{relative}'");
                        continue;
                    }

                    var recorded = Child(item, "digest");
                    var matches = recorded is { Node: JsonValue recordedValue } && recordedValue.TryGetValue<string>(out var recordedText) && recordedText == actual;
                    var status = Child(item, "status");
                    var isBaseline = status is { Node: JsonValue statusValue } && statusValue.TryGetValue<string>(out var statusText) && statusText == "baseline";
                    if (!matches && isBaseline)
                    {
                        Errors.Add($"[litespec/frontend/web/ui#track-source-changes] {itemLabel}: '{relative}' no longer matches the recorded digest; record it as extended or forked");
                    }
                }
            }
        }

        // The design contract travels with the shared package, so it is read once for the
        // workspace rather than once per application. A floorplan it names outside the
        // closed set is a design decision, not a route-level choice.
        // (litespec/frontend/ui#publish-a-design-contract,
        // litespec/frontend/ui#declare-a-closed-floorplan-set)
        public void ValidateDesignContract(JsonNode? package, string platform)
        {
            _ = platform;
            var contract = Child(package, "designContract");
            if (contract.Node is not JsonValue contractValue || !contractValue.TryGetValue<string>(out var relative))
            {
                Errors.Add($"[litespec/frontend/ui#publish-a-design-contract] shared package '{Show(Child(package, "name"))}': no design contract at '{Show(contract)}'");
                return;
            }

            var file = FilePath(relative);
            var label = RelativeToRoot(file);
            if (!Exists(file))
            {
                Errors.Add($"[litespec/frontend/ui#publish-a-design-contract] shared package '{Show(Child(package, "name"))}': no design contract at '{relative}'");
                return;
            }

            var metadata = ParseMetadata(file);
            if (metadata is null)
            {
                Errors.Add($"[litespec/frontend/ui#publish-a-design-contract] {label}: design contract has no metadata block");
                return;
            }

            SchemaCheck("design-contract.schema.json", metadata, label, "litespec/frontend/ui#publish-a-design-contract");
            var name = Child(package, "name");
            if (Truthy(name) && !StrictEqual(Child(metadata, "package"), name))
            {
                Errors.Add($"[litespec/frontend/ui#publish-a-design-contract] {label}: package must be '{Show(name)}'");
            }

            var present = SectionNames(File.ReadAllText(file)).ToHashSet(StringComparer.Ordinal);
            foreach (var section in DesignSections)
            {
                if (!present.Contains(section))
                {
                    Errors.Add($"[litespec/frontend/ui#publish-a-design-contract] {label}: missing required section '{section}'");
                }
            }
        }
    }
}
