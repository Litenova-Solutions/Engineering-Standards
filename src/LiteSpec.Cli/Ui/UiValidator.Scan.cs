using System.Text.RegularExpressions;

namespace LiteSpec.Ui;

static partial class UiValidator
{
    static readonly Regex SourceFile = new(@"\.(?:ts|tsx|js|jsx|svelte)$", RegexOptions.Compiled);

    static readonly Regex TestDir = new(@"(?:^|[\\/])(?:tests?|__tests__)(?:[\\/])", RegexOptions.Compiled);

    static readonly Regex TestFile = new(@"\.(?:test|spec)\.[^.]+$", RegexOptions.Compiled);

    static readonly Regex VisualFile = new(@"\.visual\.(?:tsx?|svelte)$", RegexOptions.Compiled);

    static readonly Regex ImportStatement = new(@"(?:^|\n)\s*(?:import|export)[^;\n]*['""][^'""]+['""]", RegexOptions.Compiled);

    static readonly Regex SvelteInlineStyle = new(@"\sstyle(?::|=|\{)", RegexOptions.Compiled);

    static readonly Regex ReactInlineStyle = new(@"style=\{\{", RegexOptions.Compiled);

    // An application composes the shared package's exported entry points. It reaches
    // no primitive library and no internal package path.
    static readonly ImportBoundary[] ReactImportBoundaries =
    [
        new(new Regex(@"['""](@base-ui/react|radix-ui|@radix-ui/)", RegexOptions.Compiled), "imports the primitive library directly; import the shared package's component"),
        new(new Regex(@"['""]@(?:[a-z0-9-]+/)?ui/(?:lib|hooks)/", RegexOptions.Compiled), "imports an internal shared package path; import a documented entry point"),
        new(new Regex(@"['""]@tanstack/react-table['""]", RegexOptions.Compiled), "imports the table library directly; import the shared package's data table"),
    ];

    static readonly ImportBoundary[] SvelteImportBoundaries =
    [
        new(new Regex(@"['""](bits-ui|@melt-ui/svelte)['""]", RegexOptions.Compiled), "imports the primitive library directly; import the shared package's component"),
        new(new Regex(@"['""]@(?:[a-z0-9-]+/)?ui/(?:lib|hooks)/", RegexOptions.Compiled), "imports an internal shared package path; import a documented entry point"),
        new(new Regex(@"['""]@tanstack/svelte-table['""]", RegexOptions.Compiled), "imports the table library directly; import the shared package's data table"),
    ];

    static readonly string[] VisualPackages =
    [
        "@chakra-ui/react",
        "@fluentui/react",
        "@blueprintjs/core",
        "@mantine/core",
        "@mui/material",
        "@radix-ui/themes",
        "@skeletonlabs/skeleton",
        "antd",
        "bootstrap",
        "daisyui",
        "flowbite-svelte",
        "material-ui",
        "react-bootstrap",
    ];

    /// <summary>One import the application boundary refuses, with its finding text.</summary>
    sealed record ImportBoundary(Regex Pattern, string Message);

    private sealed partial class Session
    {
        // One pass over the shared package. The Tailwind utility rules apply to every
        // authored file outside the copied primitive boundary and the tests. The shared
        // package owns the primitive library, so its composites import it deliberately;
        // an application does not, and `ValidateApplicationImports` refuses it there.
        // (litespec/rule/frontend-ui.restrict-css-decisions)
        public void ValidateSourceScan(string target, string? primitives, string platform)
        {
            _ = platform;
            const string ui = "frontend-ui";
            foreach (var source in Walk(target, file => SourceFile.IsMatch(file)))
            {
                var relative = RelativeToRoot(source);
                var text = File.ReadAllText(source);
                var inPrimitives = primitives is not null && Within(primitives, source);
                var inTests = TestDir.IsMatch(source) || TestFile.IsMatch(source);
                if (inPrimitives || inTests)
                {
                    continue;
                }

                var reported = new HashSet<string>(StringComparer.Ordinal);
                foreach (var value in ClassStrings(text))
                {
                    InspectClassString(value, (kind, token) =>
                    {
                        if (!reported.Add(kind + ":" + token))
                        {
                            return;
                        }

                        Errors.Add($"[litespec/rule/{ui}.restrict-css-decisions] {relative}: {UtilityMessages[kind]} '{token}'");
                    }, variants: false);
                }

            }
        }

        public void ValidateApplicationImports(string frontendRoot, string packageName, string platform)
        {
            const string components = "frontend-components";
            var boundaries = platform == "svelte" ? SvelteImportBoundaries : ReactImportBoundaries;
            foreach (var source in Walk(frontendRoot, file => SourceFile.IsMatch(file)))
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

                var text = File.ReadAllText(source);
                foreach (var boundary in boundaries)
                {
                    if (!boundary.Pattern.IsMatch(text))
                    {
                        continue;
                    }

                    // The scanner is a reference check, not a linter. A file that composes the
                    // shared package's components may quote a library name in a doc comment, so
                    // only a real import statement counts.
                    var statements = ImportStatement.Matches(text).Cast<Match>().Select(match => match.Value).ToList();
                    if (!statements.Any(statement => boundary.Pattern.IsMatch(statement)))
                    {
                        continue;
                    }

                    Errors.Add($"[litespec/rule/{components}.compose-composites-in-page-code] {relative}: {boundary.Message} from shared package '{packageName}'");
                }
            }
        }

        // A workspace hoists dependencies, so a second visual system declared at the
        // repository root or in another shared package reaches every frontend without
        // appearing in any frontend manifest.
        public List<string> PackageManifests()
        {
            var files = new List<string>();
            var seen = new HashSet<string>(StringComparer.Ordinal);
            void Add(string file)
            {
                if (seen.Add(Path.GetFullPath(file)))
                {
                    files.Add(file);
                }
            }

            var rootManifest = Path.Combine(Root, "package.json");
            if (File.Exists(rootManifest))
            {
                Add(rootManifest);
            }

            foreach (var directory in new[] { "packages", "apps" })
            {
                foreach (var file in Walk(Path.Combine(Root, directory), candidate => Path.GetFileName(candidate) == "package.json"))
                {
                    Add(file);
                }
            }

            return files;
        }

        public void ValidateDependencyBoundary()
        {
            foreach (var file in PackageManifests())
            {
                var label = RelativeToRoot(file);
                var packageJson = ReadJson(file, label);
                if (packageJson is null)
                {
                    continue;
                }

                // An `optionalDependencies` entry installs when the platform allows it, and
                // an `overrides`, `pnpm.overrides`, or `resolutions` entry pins a version of
                // a package the tree resolves. Each one puts the named package in
                // `node_modules` where a component can import it, so each one is a declared
                // visual dependency for this boundary.
                var dependencies = new Dictionary<string, JsValue>(StringComparer.Ordinal);
                foreach (var key in new[] { "dependencies", "devDependencies", "peerDependencies", "optionalDependencies", "overrides", "resolutions" })
                {
                    Merge(Child(packageJson, key));
                }

                Merge(Dot(Child(packageJson, "pnpm"), "overrides"));
                foreach (var name in VisualPackages)
                {
                    if (dependencies.TryGetValue(name, out var dependency) && Truthy(dependency))
                    {
                        Errors.Add($"[litespec/rule/frontend-ui.select-one-visual-authority] {label}: second general-purpose visual dependency '{name}' requires an exception");
                    }
                }

                void Merge(JsValue section)
                {
                    if (section.Node is System.Text.Json.Nodes.JsonObject found)
                    {
                        foreach (var property in found)
                        {
                            dependencies[property.Key] = new JsValue(true, property.Value);
                        }
                    }
                }
            }
        }
    }
}
