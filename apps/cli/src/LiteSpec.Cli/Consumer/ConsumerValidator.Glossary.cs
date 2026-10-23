using System.Text.Json.Nodes;
using System.Text.RegularExpressions;
using LiteSpec.Authoring;
using LiteSpec.Model;
using LiteSpec.Schemas;
using LiteSpec.Ui;

namespace LiteSpec.Consumer;

/// <summary>
///     The glossary checks of the consumer validator.
/// </summary>
static partial class ConsumerValidator
{
    /// <summary>
    ///     Checks the glossary, scans the pages and the extra language surfaces for
    ///     rejected synonyms and mannered terms, and summarizes the outcome.
    /// </summary>
    static void CheckGlossaryAndProse(RunState run)
    {
        var pagesWatch = System.Diagnostics.Stopwatch.StartNew();
        var paths = (run.Project as JsonObject)?["paths"] as JsonObject;
        var glossaryPath = PropString(paths, "glossary");
        var glossaryFile = glossaryPath is not null ? Path.Join(run.Root, glossaryPath) : Path.Join(run.DocsRoot, "glossary.json");
        var glossaryRelative = run.Relative(glossaryFile);
        CompiledLanguage? compiled = null;

        if (File.Exists(glossaryFile))
        {
            JsonNode? record = null;

            try
            {
                record = run.ReadJson(glossaryFile);
            }
            catch (Exception cause)
            {
                run.Err($"{glossaryRelative}: not valid JSON ({cause.Message})");
            }

            if (!IsFalsy(record))
            {
                var shape = JsonSchema.Problems(run.GlossarySchemaFile, record, glossaryRelative, run.ReadSchema);

                foreach (var problem in shape)
                {
                    run.Err(problem);
                }

                // A scope that does not compile silently rejects nothing, which is the
                // fail-open shape this validator exists to refuse. The record is not
                // compiled afterwards, because compiling it would throw the same error
                // as an unhandled crash and print no diagnostic at all.
                var scopesOk = true;
                var terms = (record as JsonObject)?["terms"] is JsonArray array ? array.ToList() : new List<JsonNode?>();

                foreach (var entry in terms)
                {
                    if (entry is not JsonObject term)
                    {
                        continue;
                    }

                    var rejected = term["rejected"] is JsonArray synonyms ? synonyms.ToList() : new List<JsonNode?>();
                    var scopes = new List<string?> { PropString(term, "scope") };

                    foreach (var synonym in rejected)
                    {
                        scopes.Add(PropString(synonym as JsonObject, "scope"));
                    }

                    foreach (var scope in scopes)
                    {
                        if (string.IsNullOrEmpty(scope))
                        {
                            continue;
                        }

                        try
                        {
                            _ = new Regex(scope);
                        }
                        catch (ArgumentException)
                        {
                            run.Err($"{glossaryRelative}: term '{PropText(term, "term")}' has a scope that is not a regular expression: '{scope}'");
                            scopesOk = false;
                        }
                    }
                }

                if (shape.Count == 0 && scopesOk)
                {
                    compiled = Prose.CompileLanguage(record);
                }
            }
        }
        else if (glossaryPath is not null)
        {
            run.Err($"litespec.project.json: paths.glossary '{glossaryPath}' does not exist; the vocabulary and mannered-term checks resolve nothing");
        }

        // AGENTS.md is scanned for language even though it carries no record and
        // sits outside the documentation root. It is the first file an agent reads,
        // so its register is the register that gets copied into every page written
        // afterwards, and a rule the exemplar breaks is a rule that does not hold.
        var agentsFile = Path.Join(run.Root, "AGENTS.md");
        var languageFiles = File.Exists(agentsFile) && !run.Files.Contains(agentsFile, StringComparer.OrdinalIgnoreCase) ? run.Files.Append(agentsFile).ToList() : run.Files.ToList();

        var languageFindings = new List<string>();

        foreach (var file in languageFiles)
        {
            var relative = run.Relative(file);
            var raw = run.ReadText(file);

            // A scope is written against the documentation root. AGENTS.md sits above
            // it, so it matches no scoped rule and is checked by the mannered list.
            var scopeRelative = file == agentsFile ? relative : Relative(run.DocsRoot, file);

            Prose.CheckLanguage(scopeRelative, raw, compiled, (_, line, code, message) =>
            {
                languageFindings.Add($"{relative}:{line}: {code} {message}");
            });
        }

        pagesWatch.Stop();
        Timing.Report($"[time] consumer-glossary-pages {pagesWatch.Elapsed.TotalSeconds:0.0}s");

        // The documentation tree is one of the surfaces a word reaches, and usually
        // the smallest. A project's source, its interface copy, its API contract and
        // its tests carry the same vocabulary to a developer, a customer and a
        // reviewer, and a check that reads only Markdown holds the vocabulary where
        // nobody reads it. `paths.glossaryScan` names those surfaces.
        //
        // A scope in the glossary is written against the documentation root
        // for a page under it, and against the repository root for one of these
        // files, because there is no other root the two have in common.
        var surfacesWatch = System.Diagnostics.Stopwatch.StartNew();
        var scannedSurfaces = 0;
        var glossaryScan = paths?["glossaryScan"] is JsonArray patterns ? patterns.ToList() : new List<JsonNode?>();

        foreach (var entry in glossaryScan)
        {
            var pattern = AsString(entry);

            if (pattern is null)
            {
                run.Err($"litespec.project.json: paths.glossaryScan '{JsText(entry)}' could not be read (pattern is not a string)");
                continue;
            }

            List<string> matched;

            try
            {
                matched = GlobFiles(run.Root, pattern);
            }
            catch (Exception cause)
            {
                run.Err($"litespec.project.json: paths.glossaryScan '{pattern}' could not be read ({cause.Message})");
                continue;
            }

            // A pattern that matches nothing switches a surface off in silence, which
            // is the shape this validator refuses everywhere else.
            if (matched.Count == 0)
            {
                run.Err($"litespec.project.json: paths.glossaryScan '{pattern}' matches no file; the vocabulary check over that surface did not run");
                continue;
            }

            foreach (var relativePath in matched)
            {
                var relative = relativePath.Replace('\\', '/');
                scannedSurfaces += 1;

                Prose.CheckLanguageInSource(relative, run.ReadText(Path.Join(run.Root, relativePath)), compiled, (_, line, code, message) =>
                {
                    languageFindings.Add($"{relative}:{line}: {code} {message}");
                });
            }
        }

        surfacesWatch.Stop();
        Timing.Report($"[time] consumer-glossary-surfaces {surfacesWatch.Elapsed.TotalSeconds:0.0}s");

        // Every language finding is an error. The vocabulary is the project's own,
        // so a term it rejects or a mannered term it names is a term it chose to act on.
        foreach (var finding in languageFindings)
        {
            run.Err(finding);
        }

        var manneredCount = languageFindings.Count(finding => finding.Contains("GLOSSARY_MANNERED_TERM", StringComparison.Ordinal));
        var rejectedCount = languageFindings.Count - manneredCount;
        var surfaceNote = scannedSurfaces > 0
            ? $", {scannedSurfaces} non-Markdown surface(s) scanned"
            : ", documentation only";

        run.GlossarySummary = compiled is not null
            ? $"Glossary: {manneredCount} mannered term(s), {rejectedCount} rejected synonym(s){surfaceNote}"
            : "Glossary: no glossary found; the vocabulary and mannered-term checks did not run";
    }

    /// <summary>
    ///     Carries the controlled UI validator's findings into this run's own list, so a caller
    ///     reading the structured output has no separate block to look at.
    /// </summary>
    static void CheckControlledUi(RunState run)
    {
        // A controlled-web consumer opts into the deterministic UI validator through its
        // frontend platform declaration or UI block.
        if (run.ControlledFrontends.Count == 0 && IsFalsy(run.UiPackage))
        {
            return;
        }

        var report = UiValidator.Validate(run.Root);

        foreach (var problem in report.Problems)
        {
            run.Err($"controlled UI: {problem}");
        }

        if (report.ExitCode != 0 && report.Problems.Count == 0)
        {
            run.Err($"controlled UI validation failed with exit code {report.ExitCode}");
        }
    }
}
