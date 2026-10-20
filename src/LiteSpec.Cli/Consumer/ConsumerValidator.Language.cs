using System.Text.Json.Nodes;
using System.Text.RegularExpressions;
using LiteSpec.Authoring;
using LiteSpec.Schemas;
using LiteSpec.Ui;

namespace LiteSpec.Consumer;

/// <summary>
///     The language and controlled prose checks of the consumer validator.
/// </summary>
static partial class ConsumerValidator
{
    /// <summary>
    ///     Checks the language record, scans the pages and the extra language surfaces for
    ///     rejected synonyms and mannered terms, counts the controlled-prose measures, and
    ///     summarizes the outcome. Prints the per-measure detail when <c>--prose</c> is passed.
    /// </summary>
    static void CheckLanguageAndProse(RunState run)
    {
        var paths = (run.Project as JsonObject)?["paths"] as JsonObject;
        var languagePath = PropString(paths, "language");
        var languageFile = languagePath is not null ? Path.Join(run.Root, languagePath) : Path.Join(run.DocsRoot, "language.json");
        var languageRelative = run.Relative(languageFile);
        CompiledLanguage? compiled = null;

        if (File.Exists(languageFile))
        {
            JsonNode? record = null;

            try
            {
                record = run.ReadJson(languageFile);
            }
            catch (Exception cause)
            {
                run.Err($"{languageRelative}: not valid JSON ({cause.Message})");
            }

            if (!IsFalsy(record))
            {
                var shape = JsonSchema.Problems(run.LanguageSchemaFile, record, languageRelative, run.ReadSchema);

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
                            run.Err($"{languageRelative}: term '{PropText(term, "term")}' has a scope that is not a regular expression: '{scope}'");
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
        else if (languagePath is not null)
        {
            run.Err($"litespec.project.json: paths.language '{languagePath}' does not exist; the vocabulary and mannered-term checks resolve nothing");
        }

        // AGENTS.md is scanned for language even though it carries no record and
        // sits outside the documentation root. It is the first file an agent reads,
        // so its register is the register that gets copied into every page written
        // afterwards, and a rule the exemplar breaks is a rule that does not hold.
        var agentsFile = Path.Join(run.Root, "AGENTS.md");
        var languageFiles = File.Exists(agentsFile) ? run.Files.Append(agentsFile).ToList() : run.Files.ToList();

        var languageFindings = new List<string>();
        var proseCounts = new Dictionary<string, int>(StringComparer.Ordinal);
        var proseCodes = new Dictionary<string, Dictionary<string, int>>(StringComparer.Ordinal);

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

            if (file == agentsFile)
            {
                continue;
            }

            var count = 0;
            var codes = new Dictionary<string, int>(StringComparer.Ordinal);

            Prose.CheckProseMeasures(relative, raw, (_, _, code, _) =>
            {
                count += 1;
                codes[code] = codes.TryGetValue(code, out var seen) ? seen + 1 : 1;
            });

            if (count > 0)
            {
                proseCounts[relative] = count;
                proseCodes[relative] = codes;
            }
        }

        // The documentation tree is one of the surfaces a word reaches, and usually
        // the smallest. A project's source, its interface copy, its API contract and
        // its tests carry the same vocabulary to a developer, a customer and a
        // reviewer, and a check that reads only Markdown holds the vocabulary where
        // nobody reads it. `paths.languageScan` names those surfaces.
        //
        // A scope in the language record is written against the documentation root
        // for a page under it, and against the repository root for one of these
        // files, because there is no other root the two have in common.
        var scannedSurfaces = 0;
        var languageScan = paths?["languageScan"] is JsonArray patterns ? patterns.ToList() : new List<JsonNode?>();

        foreach (var entry in languageScan)
        {
            var pattern = AsString(entry);

            if (pattern is null)
            {
                run.Err($"litespec.project.json: paths.languageScan '{JsText(entry)}' could not be read (pattern is not a string)");
                continue;
            }

            List<string> matched;

            try
            {
                matched = GlobFiles(run.Root, pattern);
            }
            catch (Exception cause)
            {
                run.Err($"litespec.project.json: paths.languageScan '{pattern}' could not be read ({cause.Message})");
                continue;
            }

            // A pattern that matches nothing switches a surface off in silence, which
            // is the shape this validator refuses everywhere else.
            if (matched.Count == 0)
            {
                run.Err($"litespec.project.json: paths.languageScan '{pattern}' matches no file; the vocabulary check over that surface did not run");
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

        // A rejected synonym is always an error. The vocabulary is the project's own,
        // so a term it rejects is a term it chose to reject. A consumer that sets
        // `prose.enforcement` to `report` gets the prose measures and the mannered
        // terms as advisories instead: they are counted and printed, and they do not
        // fail the run.
        var proseReportOnly = PropString((run.Project as JsonObject)?["prose"] as JsonObject, "enforcement") == "report";
        Action<string> proseErr = proseReportOnly ? run.Advise : run.Err;

        foreach (var finding in languageFindings)
        {
            if (finding.Contains("LANGUAGE_MANNERED_TERM", StringComparison.Ordinal))
            {
                proseErr(finding);
            }
            else
            {
                run.Err(finding);
            }
        }

        foreach (var (relative, count) in proseCounts)
        {
            proseErr($"{relative}: {count} controlled-prose problem(s); run 'litespec consumer --prose' to list them");
        }

        var manneredCount = languageFindings.Count(finding => finding.Contains("LANGUAGE_MANNERED_TERM", StringComparison.Ordinal));
        var rejectedCount = languageFindings.Count - manneredCount;
        var surfaceNote = scannedSurfaces > 0
            ? $", {scannedSurfaces} non-Markdown surface(s) scanned"
            : ", documentation only";

        // The default output names the worst files and their dominant measure, so a
        // reader can act without a second flag. --prose still lists every measure.
        var hotspot = string.Join("; ", proseCounts
            .OrderByDescending(pair => pair.Value)
            .Take(3)
            .Select(pair =>
            {
                var codes = proseCodes.TryGetValue(pair.Key, out var seen) ? seen : new Dictionary<string, int>();
                var top = codes.OrderByDescending(code => code.Value).Select(code => code.Key).FirstOrDefault() ?? "PROSE_SENTENCE_LENGTH";
                return $"{pair.Key} ({pair.Value}, mostly {top})";
            }));
        var hotspotNote = hotspot.Length > 0 ? $"; worst prose: {hotspot}; run with --prose to list every measure" : "";

        run.LanguageSummary = compiled is not null
            ? $"Language: {manneredCount} mannered term(s), {rejectedCount} rejected synonym(s){surfaceNote}{hotspotNote}"
            : "Language: no language record found; the vocabulary and mannered-term checks did not run";

        // --prose lists the measures behind the counts, which is what a person needs
        // to burn a page down. The check itself stays on by default.
        if (run.Prose)
        {
            var detail = new List<string>();

            foreach (var file in run.Files)
            {
                var relative = run.Relative(file);

                Prose.CheckProseMeasures(relative, run.ReadText(file), (found, line, code, message) =>
                {
                    detail.Add($"{found}:{line}: {code} {message}");
                });
            }

            Console.WriteLine();
            Console.WriteLine($"Controlled prose ({detail.Count}):");

            foreach (var line in detail)
            {
                Console.WriteLine($"  - {line}");
            }
        }
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
