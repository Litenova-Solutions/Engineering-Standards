using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.RegularExpressions;
using LiteSpec.Tests.Support;

namespace LiteSpec.Tests.Ui;

/// <summary>
/// A throwaway UI consumer built from the tracked templates. Each test creates its own instance
/// in its own temporary folder because tests run in parallel.
/// </summary>
sealed class UiFixture : IDisposable
{
    /// <summary>The token stylesheet the pinned CLI generates, as shipped.</summary>
    public const string CleanCss =
"""
@import "tailwindcss";
@import "tw-animate-css";
@import "shadcn/tailwind.css";

@custom-variant dark (&:is(.dark *));

@theme inline {
    --font-sans: var(--font-sans);
    --color-background: var(--background);
    --color-foreground: var(--foreground);
    --radius-lg: var(--radius);
}

:root {
    --background: oklch(1 0 0);
    --foreground: oklch(0.145 0 0);
    --radius: 0.625rem;
}

.dark {
    --background: oklch(0.145 0 0);
    --foreground: oklch(0.985 0 0);
}

@layer base {
  * {
    @apply border-border outline-ring/50;
    }
  body {
    @apply bg-background text-foreground;
    }
  html {
    @apply font-sans;
    }
}
""" + "\n";

    /// <summary>An application stylesheet imports the shared package tokens and nothing else.</summary>
    public const string CleanAppStyles = "@import \"@fixture/ui/tokens.css\";\n";

    /// <summary>The default application route case file.</summary>
    public const string DefaultAppCase = "export function Case() {\n  return <main>Orders</main>;\n}\n";

    /// <summary>The copied primitive sources the lock seals.</summary>
    public const string ButtonSource = "export function Button() {\n  return null;\n}\n";

    /// <summary>The copied primitive sources the lock seals.</summary>
    public const string SkeletonSource = "export function Skeleton() {\n  return null;\n}\n";

    /// <summary>The shipped floorplan the catalog points at.</summary>
    public const string ListPageSource = "export function ListPage() {\n  return <main className=\"grid gap-6\" />;\n}\n";

    /// <summary>A stub for a catalog component the templates do not ship.</summary>
    public const string StubSource = "export function Stub() {\n  return null;\n}\n";

    static readonly JsonSerializerOptions Indented = new() { WriteIndented = true };

    readonly TempFolder temp;

    UiFixture(TempFolder temp)
    {
        this.temp = temp;
    }

    /// <summary>The consumer root.</summary>
    public string Root => temp.Path;

    /// <summary>The shared package root.</summary>
    public string PackageRoot => Join("packages/ui");

    /// <summary>The shared composite case file.</summary>
    public string CaseFile => Join("packages/ui/src/floorplans/fixture-case.tsx");

    /// <summary>The copied button source the digest case appends to.</summary>
    public string ButtonFile => Join("packages/ui/src/components/button.tsx");

    /// <summary>The application route case file.</summary>
    public string AppCase => Join("apps/web/src/routes/case.tsx");

    /// <summary>The token stylesheet.</summary>
    public string TokensCss => Join("packages/ui/src/styles/tokens.css");

    /// <summary>The application stylesheet.</summary>
    public string AppStyles => Join("apps/web/src/styles.css");

    /// <summary>The consumer project file.</summary>
    public string ProjectFile => Join("litespec.project.json");

    /// <summary>The source lock.</summary>
    public string LockFile => Join("packages/ui/ui-source-lock.json");

    /// <summary>The design contract.</summary>
    public string DesignFile => Join("packages/ui/DESIGN.md");

    /// <summary>The pattern catalog.</summary>
    public string CatalogFile => Join("docs/ui/pattern-catalog.json");

    /// <summary>The baseline configuration file.</summary>
    public string ComponentsFile => Join("packages/ui/components.json");

    /// <summary>The vendored LiteSpec checkout the fixture-local run resolves.</summary>
    public string LiteSpecDir => Join("litespec");

    /// <summary>The fixture pattern page the fixture-local run reads.</summary>
    public string FixturePatternPage => Join("litespec/docs/frontend/patterns/page-frames.md");

    /// <summary>Builds a fresh fixture from the tracked templates.</summary>
    public static UiFixture Create()
    {
        var fixture = new UiFixture(Cli.Temp("ui"));
        fixture.Build();
        return fixture;
    }

    /// <summary>Reads a JSON file.</summary>
    public static JsonNode? ReadJson(string file) => JsonNode.Parse(File.ReadAllText(file));

    /// <summary>Writes a JSON file two-space indented with a trailing newline.</summary>
    public static void WriteJson(string file, JsonNode? value)
    {
        Directory.CreateDirectory(Path.GetDirectoryName(file)!);
        File.WriteAllText(file, value!.ToJsonString(Indented) + "\n");
    }

    /// <summary>Runs <c>litespec ui</c> against the fixture.</summary>
    public CliResult Run() => Cli.Run("ui", "--root", Root);

    /// <summary>
    /// Runs <c>litespec ui</c> against the fixture with the LiteSpec home pointed at the
    /// fixture's own vendored copy, so the pattern pages it reads are the fixture pages.
    /// </summary>
    public CliResult RunWithFixtureHome() => Cli.Run(
        new[] { "ui", "--root", Root },
        null,
        new Dictionary<string, string> { ["LITESPEC_HOME"] = LiteSpecDir });

    /// <summary>Every problem line the run printed, without the leading marker.</summary>
    public static List<string> Problems(CliResult result) => result.Output
        .Split('\n')
        .Where(line => line.StartsWith("  - ", StringComparison.Ordinal))
        .Select(line => line.Substring(4).TrimEnd('\r'))
        .ToList();

    /// <summary>Asserts the run printed no problem, showing the full output when it did.</summary>
    public static void AssertClean(CliResult result)
    {
        var problems = Problems(result);
        Assert.True(problems.Count == 0,
            $"Expected no problems but the validator reported:\n  - {string.Join("\n  - ", problems)}\nFull output:\n{result.Output}");
    }

    /// <summary>Asserts one problem contains the expectation, showing the full output when none does.</summary>
    public static void AssertProblem(CliResult result, string expectation)
    {
        var problems = Problems(result);
        Assert.True(problems.Any(problem => problem.Contains(expectation, StringComparison.Ordinal)),
            $"Expected a problem containing:\n{expectation}\nActual problems:\n  - {string.Join("\n  - ", problems)}\nFull output:\n{result.Output}");
    }

    /// <summary>Writes one shared-package composite file and runs the validator.</summary>
    public CliResult CompositeCase(string code)
    {
        File.WriteAllText(CaseFile, code + "\n");
        return Run();
    }

    /// <summary>Writes one application route file and runs the validator.</summary>
    public CliResult AppCaseWith(string code)
    {
        File.WriteAllText(AppCase, code + "\n");
        return Run();
    }

    /// <summary>Writes the token stylesheet and runs the validator.</summary>
    public CliResult CssCase(string css)
    {
        File.WriteAllText(TokensCss, css);
        return Run();
    }

    /// <summary>Writes the application stylesheet and runs the validator.</summary>
    public CliResult AppStylesCase(string css)
    {
        File.WriteAllText(AppStyles, css);
        return Run();
    }

    /// <summary>Writes one consumer-relative file and runs the validator.</summary>
    public CliResult PathCase(string relative, string contents)
    {
        var file = Join(relative);
        Directory.CreateDirectory(Path.GetDirectoryName(file)!);
        File.WriteAllText(file, contents);
        return Run();
    }

    /// <summary>Writes one Exception record under the default exceptions folder.</summary>
    public string WriteException(string name, string standard, string reviewBy) =>
        WriteExceptionFile($"docs/exceptions/{name}.md",
            ExceptionMeta($"exception/{name}", $"Fixture exception {name}", standard, reviewBy),
            $"Fixture exception {name}");

    /// <summary>Writes one Exception record at a consumer-relative path.</summary>
    public string WriteExceptionFile(string relative, JsonObject meta, string heading)
    {
        var file = Join(relative);
        Directory.CreateDirectory(Path.GetDirectoryName(file)!);
        File.WriteAllText(file, "---\n" + meta.ToJsonString(Indented) + $"\n---\n# {heading}\n");
        return file;
    }

    /// <summary>The frontmatter of a fixture Exception record.</summary>
    public static JsonObject ExceptionMeta(string id, string title, string standard, string reviewBy) => new()
    {
        ["type"] = "exception",
        ["id"] = id,
        ["title"] = title,
        ["owner"] = "fixture",
        ["status"] = "approved",
        ["standard"] = standard,
        ["reason"] = "The fixture needs this departure.",
        ["reviewBy"] = reviewBy,
        ["removeWhen"] = "The fixture no longer needs it.",
    };

    /// <summary>Mutates the source lock in place.</summary>
    public void MutateLock(Action<JsonObject> mutate)
    {
        var sourceLock = (JsonObject)ReadJson(LockFile)!;
        mutate(sourceLock);
        WriteJson(LockFile, sourceLock);
    }

    /// <summary>Mutates the pattern catalog in place.</summary>
    public void MutateCatalog(Action<JsonObject> mutate)
    {
        var catalog = (JsonObject)ReadJson(CatalogFile)!;
        mutate(catalog);
        WriteJson(CatalogFile, catalog);
    }

    /// <summary>Mutates the consumer project file in place.</summary>
    public void MutateProject(Action<JsonObject> mutate)
    {
        var project = (JsonObject)ReadJson(ProjectFile)!;
        mutate(project);
        WriteJson(ProjectFile, project);
    }

    /// <summary>Writes a workspace <c>package.json</c> carrying one extra top-level section.</summary>
    public void WriteManifest(string key, JsonNode value)
    {
        var manifest = new JsonObject { ["name"] = "fixture", [key] = value };
        WriteJson(Join("package.json"), manifest);
    }

    /// <summary>Declares one additional registry in both the configuration and the source lock.</summary>
    public void AddAdditionalRegistry()
    {
        var components = (JsonObject)ReadJson(ComponentsFile)!;
        components["registries"] = new JsonObject { ["@fixture/blocks"] = "https://blocks.fixture.test/r" };
        WriteJson(ComponentsFile, components);
        MutateLock(sourceLock =>
        {
            sourceLock["registry"] = new JsonObject { ["name"] = "fixture", ["url"] = "https://blocks.fixture.test" };
        });
    }

    /// <summary>Converts the fixture to the Svelte baseline with its generator, registry, and configuration.</summary>
    public void AsSvelte()
    {
        MutateProject(project =>
        {
            ((JsonObject)project["paths"]!)["frontends"] = new JsonArray(new JsonObject
            {
                ["name"] = "web",
                ["path"] = "apps/web",
                ["platform"] = "svelte",
                ["ui"] = new JsonObject { ["profile"] = "application-balanced", ["globalCss"] = "apps/web/src/styles.css" },
            });
        });
        MutateLock(sourceLock =>
        {
            sourceLock["generator"] = "shadcn-svelte";
            sourceLock["cli"] = "1.7.0";
            ((JsonObject)sourceLock["preset"]!)["base"] = "bits-ui";
            sourceLock["registry"] = new JsonObject { ["name"] = "shadcn-svelte", ["url"] = "https://shadcn-svelte.com/registry" };
            ((JsonObject)((JsonArray)sourceLock["components"]!)[0]!)["dependencies"] =
                new JsonArray("bits-ui", "class-variance-authority", "cn");
        });
        WriteJson(ComponentsFile, new JsonObject
        {
            ["$schema"] = "https://shadcn-svelte.com/schema.json",
            ["tailwind"] = new JsonObject { ["css"] = "src/styles/tokens.css", ["baseColor"] = "neutral" },
            ["aliases"] = new JsonObject
            {
                ["components"] = "$lib/components",
                ["utils"] = "$lib/utils",
                ["ui"] = "$lib/components/ui",
                ["lib"] = "$lib",
                ["hooks"] = "$lib/hooks",
            },
            ["typescript"] = true,
            ["iconLibrary"] = "lucide",
            ["menuColor"] = "default",
            ["menuAccent"] = "subtle",
        });
    }

    public void Dispose() => temp.Dispose();

    string Join(string relative) => Path.Join(Root, relative.Replace('/', Path.DirectorySeparatorChar));

    void Build()
    {
        foreach (var directory in new[]
        {
            "packages/ui/src/components",
            "packages/ui/src/floorplans",
            "packages/ui/src/styles",
            "apps/web/src/routes",
            "apps/web/src/modules",
            "docs/exceptions",
            "litespec/schemas",
            "litespec/docs/frontend/patterns",
        })
        {
            Directory.CreateDirectory(Join(directory));
        }

        File.Copy(Path.Join(Cli.Repository, "litespec.manifest.json"), Path.Join(LiteSpecDir, "litespec.manifest.json"));
        foreach (var schema in Directory.GetFiles(Path.Join(Cli.Repository, "schemas")))
        {
            File.Copy(schema, Path.Join(LiteSpecDir, "schemas", Path.GetFileName(schema)));
        }

        // The citation cases run with the fixture as the LiteSpec home, so the pattern
        // page they read is this fixture rather than the release's own pages.
        File.WriteAllText(FixturePatternPage, FixturePatternPageText);

        var project = (JsonObject)ReadJson(Path.Join(Cli.Repository, "templates/consumer/litespec.project.json"))!;
        ResolvePlaceholders(project);
        var uiPackage = (JsonObject)project["paths"]!["uiPackage"]!;
        uiPackage["name"] = "@fixture/ui";
        uiPackage["publicExports"] = new JsonArray("@fixture/ui/floorplans");
        WriteJson(ProjectFile, project);

        var sourceLock = (JsonObject)ReadJson(Path.Join(Cli.Repository, "templates/consumer/ui-source-lock.json"))!;
        sourceLock["$schema"] = "./litespec/schemas/ui-source-lock.schema.json";
        WriteJson(LockFile, sourceLock);

        File.WriteAllText(Join("packages/ui/src/components/button.tsx"), ButtonSource);
        File.WriteAllText(Join("packages/ui/src/components/skeleton.tsx"), SkeletonSource);
        File.WriteAllText(Join("packages/ui/src/floorplans/list-page.tsx"), ListPageSource);
        File.WriteAllText(TokensCss, CleanCss);
        File.WriteAllText(AppStyles, CleanAppStyles);
        File.WriteAllText(AppCase, DefaultAppCase);

        WriteJson(ComponentsFile, ComponentsJson());

        var contract = File.ReadAllText(Path.Join(Cli.Repository, "templates/consumer/design-contract.md"));
        File.WriteAllText(DesignFile, contract.Replace("__PROJECT__", "fixture", StringComparison.Ordinal));

        // The catalog travels with the consumer: the fixture copies the shipped template
        // to the path the project file names, then creates every source path the catalog
        // names, so the baseline proves the template as shipped.
        var catalog = ReadJson(Path.Join(Cli.Repository, "templates/consumer/ui-pattern-catalog.json"))!;
        WriteJson(CatalogFile, catalog);
        foreach (var pattern in (JsonArray)catalog["patterns"]!)
        {
            var implementations = (JsonObject?)pattern!["implementations"];
            if (implementations is null)
            {
                continue;
            }

            foreach (var entry in implementations)
            {
                var components = (JsonArray?)entry.Value?["components"];
                if (components is null)
                {
                    continue;
                }

                foreach (var component in components)
                {
                    var target = Join(component!.GetValue<string>());
                    Directory.CreateDirectory(Path.GetDirectoryName(target)!);
                    if (!File.Exists(target))
                    {
                        File.WriteAllText(target, StubSource);
                    }
                }
            }
        }

        Seal();
    }

    void Seal()
    {
        // The lock stores the digest the validator recomputes, so the fixture seals it
        // the same way rather than shipping a placeholder.
        var sourceLock = (JsonObject)ReadJson(LockFile)!;
        foreach (var component in (JsonArray)sourceLock["components"]!)
        {
            var relative = ((JsonArray)component!["paths"]!)[0]!.GetValue<string>();
            var source = File.ReadAllText(Path.Join(PackageRoot, relative));
            var normalized = Regex.Replace(
                source.Replace("\r\n", "\n", StringComparison.Ordinal).Replace("\r", "\n", StringComparison.Ordinal),
                @"[ \t]+$",
                string.Empty,
                RegexOptions.Multiline).TrimEnd() + "\n";
            using var sha = SHA256.Create();
            var digest = Convert.ToHexString(sha.ComputeHash(Encoding.UTF8.GetBytes(normalized))).ToLowerInvariant();
            component["digest"] = $"sha256:{digest}";
        }

        WriteJson(LockFile, sourceLock);
    }

    static void ResolvePlaceholders(JsonNode? node)
    {
        if (node is JsonObject jsonObject)
        {
            foreach (var key in jsonObject.Select(entry => entry.Key).ToList())
            {
                var child = jsonObject[key];
                if (child is JsonValue value && value.TryGetValue<string>(out var text)
                    && text.StartsWith("__", StringComparison.Ordinal))
                {
                    var lowered = text.Substring(2).ToLowerInvariant();
                    jsonObject[key] = lowered.Length == 0 ? "fixture" : lowered;
                }
                else
                {
                    ResolvePlaceholders(child);
                }
            }
        }
        else if (node is JsonArray jsonArray)
        {
            for (var index = 0; index < jsonArray.Count; index++)
            {
                var child = jsonArray[index];
                if (child is JsonValue value && value.TryGetValue<string>(out var text)
                    && text.StartsWith("__", StringComparison.Ordinal))
                {
                    var lowered = text.Substring(2).ToLowerInvariant();
                    jsonArray[index] = lowered.Length == 0 ? "fixture" : lowered;
                }
                else
                {
                    ResolvePlaceholders(child);
                }
            }
        }
    }

    static JsonObject ComponentsJson() => new()
    {
        ["style"] = "base-nova",
        ["rsc"] = false,
        ["tsx"] = true,
        ["rtl"] = false,
        ["iconLibrary"] = "lucide",
        ["menuColor"] = "default",
        ["menuAccent"] = "subtle",
        ["tailwind"] = new JsonObject
        {
            ["config"] = string.Empty,
            ["css"] = "src/styles/tokens.css",
            ["baseColor"] = "neutral",
            ["cssVariables"] = true,
            ["prefix"] = string.Empty,
        },
        ["aliases"] = new JsonObject
        {
            ["components"] = "@fixture/ui/components",
            ["utils"] = "@fixture/ui/lib/utils",
            ["ui"] = "@fixture/ui/components",
            ["lib"] = "@fixture/ui/lib",
            ["hooks"] = "@fixture/ui/hooks",
        },
        ["registries"] = new JsonObject(),
    };

    const string FixturePatternPageText = """
        # Page Frame Patterns

        ## Intent

        One fixture pattern.

        ## Patterns

        ### Record list

        **Question:** How does a reader find one record among many?

        **Default:** `filter-table`

        **Rationale:** Rows scan fast.

        #### `filter-table`: Filterable table

        ```wireframe
        page
          table 3 "Order" "Customer"
        ```

        **Rationale:** Rows scan fast and filters narrow the set.

        **Cost:** Needs a table composite with filters.

        #### `search-cards`: Searchable cards

        ```wireframe
        page
          grid 3
            card "SO-1042"
        ```

        **Rationale:** Cards show each record with room for detail.

        **Cost:** Slow to scan past a few dozen records.
        """;
}
