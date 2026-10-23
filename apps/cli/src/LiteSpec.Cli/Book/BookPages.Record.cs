using System.Text.Json.Nodes;

namespace LiteSpec.Book;

/// <summary>The book generator's record page: authority strip, links, implementation and review notes.</summary>
static partial class BookPages
{
    static readonly IReadOnlyDictionary<string, string> ImplementKindLabels =
        new Dictionary<string, string>(StringComparer.Ordinal)
        {
            ["handler"] = "Handler",
            ["reaction"] = "Reaction",
            ["job"] = "Job",
            ["event"] = "Domain event",
            ["result"] = "Refusal thrown",
        };

    /// <summary>Renders one record's page.</summary>
    public static string RenderRecord(BookIndex index, string rel, JsonObject record, ReviewBundle review)
    {
        var type = BookRender.StrProp(record, "type") ?? "";
        var facts = new List<(string Term, string Value)>();
        if (type == "use-case")
        {
            var kids = BookModel.UseCaseChildren(index, BookRender.StrProp(record, "id") ?? "");
            facts.Add(("Results", $"<b>{kids.Results.Count}</b>"));
            facts.Add(("Scenarios", $"<b>{kids.Scenarios.Count}</b>"));
        }

        var parts = new List<string>();
        parts.Add(BookRender.PageHeader(BookModel.TypeLabel(type), BookModel.SortTitle(record), "", facts));
        parts.Add(AuthorityStrip(index, record));
        if (type == "journey")
        {
            var journeyAbout = RenderAbout(index, rel, record);
            if (journeyAbout != "")
            {
                parts.Add(journeyAbout);
            }

            parts.Add(RenderJourneyChapter(index, rel, record));
            parts.Add(RenderDeveloper(record));
            var journeyReview = RenderRecordReview(index, rel, record, review);
            if (journeyReview != "")
            {
                parts.Add(journeyReview);
            }

            return string.Join("\n", parts);
        }

        var why = RenderWhy(index, rel, record);
        if (why != "")
        {
            parts.Add(why);
        }

        var about = RenderAbout(index, rel, record);
        if (about != "")
        {
            parts.Add(about);
        }

        var fieldsHtml = RenderFields(index, rel, record);
        if (fieldsHtml != "")
        {
            parts.Add(fieldsHtml);
        }

        if (type == "aggregate")
        {
            var lifecycle = RenderLifecycle(index, rel, record);
            if (lifecycle != "")
            {
                parts.Add(lifecycle);
            }
        }

        if (type == "requirement")
        {
            parts.Add(RenderRequirementProof(index, record));
        }

        if (type == "rule")
        {
            var meaning = RenderRuleDetail(index, rel, record);
            if (meaning != "")
            {
                parts.Add(meaning);
            }
        }

        if (type == "use-case")
        {
            var resultsHtml = RenderUseCaseResults(index, rel, record);
            if (resultsHtml != "")
            {
                parts.Add(resultsHtml);
            }
        }

        if (type == "reaction")
        {
            var reactionScenarios = RenderReactionScenarios(index, rel, record);
            if (reactionScenarios != "")
            {
                parts.Add(reactionScenarios);
            }
        }

        if (type == "scenario")
        {
            parts.Add(RenderScenarioDetail(index, rel, record));
            parts.Add(RenderScenarioProof(index, rel, record));
        }

        var outgoing = RenderOutgoingLinks(index, rel, record);
        if (outgoing != "")
        {
            parts.Add(outgoing);
        }

        var incoming = RenderIncomingLinks(index, rel, record);
        if (incoming != "")
        {
            parts.Add(incoming);
        }

        var computed = RenderComputed(index, rel, record);
        if (computed != "")
        {
            parts.Add($"<div class=\"dev-only\">\n{computed}\n</div>");
        }

        parts.Add(RenderDeveloper(record));

        var reviewHtml = RenderRecordReview(index, rel, record, review);
        if (reviewHtml != "")
        {
            parts.Add(reviewHtml);
        }

        return string.Join("\n", parts);
    }

    static string AuthorityStrip(BookIndex index, JsonObject record)
    {
        var level = -1;
        var type = BookRender.StrProp(record, "type");
        for (var position = 0; position < BookModel.Precedence.Count; position++)
        {
            if (type is not null && BookModel.Precedence[position] == type)
            {
                level = position;
            }
        }

        var cells = new List<(string Term, string Value, bool Wide)>();
        if (level >= 0)
        {
            var chain = string.Join(" <span class=\"sep\" aria-hidden=\"true\">&#8250;</span> ", BookModel.Precedence.Select((precedence, position) =>
            {
                var mark = position == level ? " <span class=\"here\" aria-current=\"true\">(this record)</span>" : "";
                return $"<span class=\"{(position == level ? "cur" : "")}\">{BookRender.Esc(BookModel.TypeLabel(precedence))}{mark}</span>";
            }));
            cells.Add(("Precedence", chain, true));
        }
        else
        {
            cells.Add(("Precedence", "Outside the precedence order", true));
        }

        cells.Add(("Status", $"{BookRender.StatusChip(BookRender.OrStr(record["status"], ""))} <span>{BookRender.EscOr(record["status"], "no status")}</span>", false));
        var effective = BookRender.StrProp(record, "effectiveStatus");
        var status = BookRender.StrProp(record, "status");
        if (effective is { Length: > 0 } && effective != status)
        {
            cells.Add(("Effective", $"{BookRender.StatusChip(effective)} <span>{BookRender.Esc(effective)}</span>", false));
        }

        cells.Add(("Owner", BookRender.EscOr(record["owner"], "no owner"), false));
        var fields = BookRender.Fields(record);
        cells.Add(("Decider", BookRender.EscOr(fields?["decider"], "none"), false));
        cells.Add(("Decide By", BookRender.EscOr(fields?["decideBy"], "none"), false));
        if (BookRender.IsTruthy(fields?["approvedBy"]))
        {
            cells.Add(("Approved By", BookRender.Esc(fields?["approvedBy"]), false));
        }

        if (BookRender.IsTruthy(fields?["approvedOn"]))
        {
            cells.Add(("Approved On", BookRender.Esc(fields?["approvedOn"]), false));
        }

        if (BookRender.StrProp(record, "type") == "use-case")
        {
            var state = BookModel.UseCaseStatus(index, BookRender.StrProp(record, "id"));
            cells.Add(("Implemented", state.Implemented
                ? "<span class=\"chip ok\">Yes</span> <span>code implements it</span>"
                : "<span class=\"chip warn\">No</span> <span>no code implements it</span>", false));
            cells.Add(("Verified", state.Verified
                ? "<span class=\"chip ok\">Yes</span> <span>every scenario proved by a passing test</span>"
                : "<span class=\"chip warn\">No</span> <span>a scenario is unproved or failing</span>", false));
            cells.Add(("Stale", state.Stale
                ? "<span class=\"chip risk\">Yes</span> <span>a proof went stale after its scenario changed</span>"
                : "<span class=\"chip ok\">No</span> <span>no proof went stale</span>", false));
        }
        else if (BookModel.IsStale(index, BookRender.StrProp(record, "id")))
        {
            cells.Add(("Stale", "<span class=\"chip risk\">Yes</span> <span>a proof went stale after its scenario changed</span>", false));
        }

        return $"<div class=\"strip\" role=\"region\" aria-label=\"Authority\">{string.Concat(cells.Select(cell =>
            $"<div class=\"cell{(cell.Wide ? " wide" : "")}\"><div class=\"k\">{BookRender.Esc(cell.Term)}</div><div class=\"v\">{cell.Value}</div></div>"))}</div>";
    }

    static string RenderWhy(BookIndex index, string rel, JsonObject record)
    {
        var chain = BookModel.WhyChain(index, record);
        if (chain.Count == 0)
        {
            return "";
        }

        var items = string.Concat(chain.Select(step =>
            $"<li><span class=\"dim\">{BookRender.Esc(step.Label)}:</span> {BookRender.RecordLink(index, rel, step.Id)}</li>"));
        return $"<h2 id=\"why\">Why</h2>\n<ol class=\"why\">{items}</ol>";
    }

    static string RenderAbout(BookIndex index, string rel, JsonObject record)
    {
        if (record["body"] is not JsonValue scalar || !scalar.TryGetValue<string>(out var body) || body is not { Length: > 0 })
        {
            return "";
        }

        (string Href, string Title)? Link(string id) => index.ById.TryGetValue(id, out var target)
            ? (rel + BookModel.RecordUrl(id), BookModel.SortTitle(target))
            : null;
        var html = BookMarkdown.Render(body, Link);
        return html.Length == 0 ? "" : $"<h2 id=\"about\">About</h2>\n{html}";
    }

    static string RenderLifecycle(BookIndex index, string rel, JsonObject record)
    {
        var fields = BookRender.Fields(record) ?? new JsonObject();
        var parts = new List<string>();
        var source = BookDiagrams.StateDiagramSource(record, index);
        if (source.Length > 0)
        {
            parts.Add($"<pre class=\"mermaid\" aria-label=\"Lifecycle diagram of {BookRender.Esc(record["title"])}\">{BookRender.Esc(source)}</pre>");
        }

        var transitions = fields["transitions"] as JsonArray ?? [];
        if (transitions.Count > 0)
        {
            var rows = string.Concat(transitions.Select(entry =>
            {
                var obj = entry as JsonObject;
                var by = BookRender.Str(obj?["by"]);
                var trigger = by.Length == 0 ? "" : BookRender.MaybeRecordLink(index, rel, by);
                return $"<tr><td>{BookRender.EscOr(obj?["from"], "")}</td><td>{BookRender.EscOr(obj?["to"], "")}</td><td>{trigger}</td></tr>";
            }));
            parts.Add("<h3>Transitions</h3>\n<div class=\"tablewrap\"><table class=\"tbl\">"
                + "<thead><tr><th>From</th><th>To</th><th>Triggered By</th></tr></thead>"
                + $"<tbody>{rows}</tbody></table></div>");
        }

        var states = fields["states"] as JsonArray ?? [];
        if (states.Count > 0)
        {
            var rows = string.Concat(states.Select((entry, position) =>
            {
                var obj = entry as JsonObject;
                var name = obj is null ? BookRender.Str(entry) : BookRender.Str(obj["name"]);
                var meaning = obj is null ? "" : BookRender.Str(obj["meaning"]);
                var initial = position == 0 ? " <span class=\"chip note\">Initial</span>" : "";
                return $"<tr><td>{BookRender.Esc(name)}{initial}</td><td>{BookRender.Esc(meaning)}</td></tr>";
            }));
            parts.Add("<h3>States</h3>\n<div class=\"tablewrap\"><table class=\"tbl\">"
                + $"<thead><tr><th>State</th><th>Meaning</th></tr></thead><tbody>{rows}</tbody></table></div>");
        }

        var data = fields["data"] as JsonArray ?? [];
        if (data.Count > 0)
        {
            parts.Add($"<h3>Data</h3>\n{DataTable(data)}");
        }

        var dataClasses = fields["dataClasses"] as JsonArray ?? [];
        if (dataClasses.Count > 0)
        {
            parts.Add($"<h3>Data Classes</h3>\n{RenderDataClasses(index, rel, dataClasses)}");
        }

        var steps = fields["steps"] as JsonArray ?? [];
        if (steps.Count > 0)
        {
            parts.Add($"<h3>Steps</h3>\n{RenderFieldValue(index, rel, "steps", steps)}");
        }

        var exits = fields["exits"] as JsonArray ?? [];
        if (exits.Count > 0)
        {
            parts.Add($"<h3>Exits</h3>\n{RenderFieldValue(index, rel, "exits", exits)}");
        }

        if (parts.Count == 0)
        {
            return "";
        }

        return $"<h2 id=\"lifecycle\">Lifecycle</h2>\n{string.Join("\n", parts)}";
    }

    static string RenderRequirementProof(BookIndex index, JsonObject record)
    {
        var state = BookModel.RequirementStateOf(index, BookRender.StrProp(record, "id"));
        var fields = BookRender.Fields(record) ?? new JsonObject();
        var parts = new List<string>();
        if (BookRender.IsTruthy(fields["measure"]) && BookRender.IsTruthy(fields["target"]))
        {
            parts.Add($"<p class=\"fit\">Measured as {BookRender.Esc(fields["measure"])}; the target is {BookRender.Esc(fields["target"])}.</p>");
        }

        var date = BookModel.TestRunDate(index);
        var run = date is { Length: > 0 } ? $" The last proof run was on {BookRender.Esc(date)}." : "";
        if (state.Stale)
        {
            parts.Add("<p class=\"proofline\"><span class=\"chip risk\">Stale</span> "
                + $"A proof beneath this requirement went stale after its scenario changed.{run}</p>");
        }
        else if (state.Verified)
        {
            var measure = state.MeasurePassed == false
                ? " Its measure has no passing check."
                : state.MeasurePassed == true ? " Its measure has a passing check." : "";
            parts.Add("<p class=\"proofline\"><span class=\"chip ok\">Verified</span> "
                + $"Everything fulfilling this requirement is verified.{measure}{run}</p>");
        }
        else
        {
            parts.Add("<p class=\"proofline\"><span class=\"chip warn\">Awaiting proof</span> "
                + $"Something fulfilling this requirement is not verified yet.{run}</p>");
        }

        return $"<h2 id=\"proof\">Proof</h2>\n{string.Join("\n", parts)}";
    }

    static string RenderRuleDetail(BookIndex index, string rel, JsonObject record)
    {
        var fields = BookRender.Fields(record) ?? new JsonObject();
        var parts = new List<string>();
        var kind = BookModel.RuleKindWords(BookRender.StrProp(fields, "kind"));
        if (kind.Length > 0)
        {
            parts.Add($"<p>This rule {kind}.</p>");
        }

        var refusal = (BookRender.Links(record)?["refusal"] as JsonArray ?? [])
            .Where(target => target is JsonValue scalar && scalar.TryGetValue<string>(out _))
            .Select(target => BookRender.Str(target))
            .FirstOrDefault(id => id.Length > 0);
        if (refusal is not null && index.ById.TryGetValue(refusal, out var result))
        {
            var meaning = BookRender.Str(BookRender.Fields(result)?["meaning"]);
            if (meaning.Length > 0)
            {
                parts.Add($"<p>When it breaks: {BookRender.Esc(meaning)} ({BookRender.RecordLink(index, rel, refusal)}).</p>");
            }
        }

        if (BookRender.StrProp(fields, "releasedBy") is { } released)
        {
            parts.Add($"<p>Released by {RenderMaybeId(index, rel, released)}.</p>");
        }

        if (BookRender.StrProp(fields, "kind") == "calculation" && BookModel.CalculationExample(index, record) is { } example)
        {
            parts.Add($"<h3>Worked Example</h3>\n<p>One row from {BookRender.RecordLink(index, rel, BookRender.StrProp(example.Scenario, "id") ?? "")}:</p>"
                + $"\n{RenderExamples(example.Examples, 1)}");
        }

        if (parts.Count == 0)
        {
            return "";
        }

        return $"<h2 id=\"meaning\">Meaning</h2>\n{string.Join("\n", parts)}";
    }

    static string RenderScenarioDetail(BookIndex index, string rel, JsonObject record)
    {
        var fields = BookRender.Fields(record) ?? new JsonObject();
        var result = (BookRender.Links(record)?["result"] as JsonArray ?? [])
            .Where(target => target is JsonValue scalar && scalar.TryGetValue<string>(out _))
            .Select(target => BookRender.Str(target))
            .FirstOrDefault(id => id.Length > 0 && index.ById.ContainsKey(id));
        var items = new List<string>();
        if (BookRender.IsTruthy(fields["given"]))
        {
            items.Add($"<li><b>Given</b> {BookRender.Esc(fields["given"])}</li>");
        }

        if (BookRender.IsTruthy(fields["when"]))
        {
            items.Add($"<li><b>When</b> {BookRender.Esc(fields["when"])}</li>");
        }

        if (BookRender.IsTruthy(fields["then"]))
        {
            var proves = result is not null ? $" ({BookRender.RecordLink(index, rel, result)})" : "";
            items.Add($"<li><b>Then</b> {BookRender.Esc(fields["then"])}{proves}</li>");
        }

        var parts = new List<string>();
        if (items.Count > 0)
        {
            parts.Add($"<ol class=\"sentences\">{string.Concat(items)}</ol>");
        }

        if (fields["examples"] is JsonArray examples && examples.Count > 0)
        {
            parts.Add($"<h3>Examples</h3>\n{RenderExamples(examples)}");
        }

        var provesLine = result is not null ? $" It proves {BookRender.RecordLink(index, rel, result)}." : "";
        parts.Add($"<p class=\"proofline\">{BookRender.Esc(BookModel.ScenarioProofSentence(index, BookRender.StrProp(record, "id") ?? ""))}{provesLine}</p>");
        return $"<h2 id=\"scenario\">Scenario</h2>\n{string.Join("\n", parts)}";
    }

    static string RenderDeveloper(JsonObject record)
    {
        var id = BookRender.StrProp(record, "id") ?? "";
        var file = $"<span class=\"mono\">{BookRender.EscOr(record["file"], "")}{(BookRender.IsTruthy(record["line"]) ? $":{BookRender.Str(record["line"])}" : "")}</span>";
        return "<div class=\"dev-only\">\n<h2 id=\"developer\">Developer</h2>\n<dl class=\"fields\">"
            + $"<div><dt>File</dt><dd>{file}</dd></div><div><dt>Identifier</dt><dd><code>{BookRender.Esc(id)}</code></dd></div></dl>\n</div>";
    }

    static string RenderOutgoingLinks(BookIndex index, string rel, JsonObject record)
    {
        var links = BookRender.Links(record) ?? new JsonObject();
        var groups = new List<string>();
        foreach (var (field, label) in BookModel.LinkLabels)
        {
            if (field == "result" && BookRender.StrProp(record, "type") == "scenario")
            {
                continue;
            }

            var targets = links[field] as JsonArray;
            if (targets is null || targets.Count == 0)
            {
                continue;
            }

            if (field == "terms" && BookRender.StrProp(record, "type") == "term")
            {
                continue;
            }

            var items = string.Concat(targets
                .Where(id => id is JsonValue scalar && scalar.TryGetValue<string>(out _))
                .Select(id => $"<li>{BookRender.RecordLink(index, rel, BookRender.Str(id))}</li>"));
            if (items.Length > 0)
            {
                groups.Add($"<h3>{BookRender.Esc(label)}</h3>\n<ul class=\"links\">{items}</ul>");
            }
        }

        if (groups.Count == 0)
        {
            return "";
        }

        return $"<h2 id=\"links\">Links</h2>\n{string.Join("\n", groups)}";
    }

    static string RenderIncomingLinks(BookIndex index, string rel, JsonObject record)
    {
        if (BookRender.StrProp(record, "id") is not { } id || !index.Backlinks.TryGetValue(id, out var incoming) || incoming.Count == 0)
        {
            return "";
        }

        var byField = new Dictionary<string, List<string>>(StringComparer.Ordinal);
        foreach (var (from, field) in incoming)
        {
            if (!index.ById.ContainsKey(from))
            {
                continue;
            }

            if (!byField.TryGetValue(field, out var list))
            {
                list = [];
                byField[field] = list;
            }

            list.Add(from);
        }

        var groups = new List<string>();
        foreach (var pair in byField.OrderBy(pair => pair.Key, BookRender.LocaleComparer))
        {
            var label = BookModel.LinkInverseLabels.TryGetValue(pair.Key, out var found) ? found : $"Linked Through {pair.Key}";
            var items = string.Concat(pair.Value.OrderBy(from => from, StringComparer.Ordinal).Select(from => $"<li>{BookRender.RecordLink(index, rel, from)}</li>"));
            groups.Add($"<h3>{BookRender.Esc(label)}</h3>\n<ul class=\"links\">{items}</ul>");
        }

        if (groups.Count == 0)
        {
            return "";
        }

        return $"<h2 id=\"linked-from\">Linked From</h2>\n{string.Join("\n", groups)}";
    }

    static string RenderComputed(BookIndex index, string rel, JsonObject record)
    {
        var parts = new List<string>();
        var id = BookRender.StrProp(record, "id") ?? "";
        var implementsLinks = index.ImplementsByTarget.TryGetValue(id, out var implemented) ? implemented : [];
        if (implementsLinks.Count > 0)
        {
            var items = string.Concat(implementsLinks.Select(link =>
            {
                var kind = BookRender.StrProp(link, "kind") is { } kindText && ImplementKindLabels.TryGetValue(kindText, out var label)
                    ? label
                    : BookRender.EscOr(link["kind"], "Code");
                return $"<li><span class=\"chip\">{kind}</span> <code>{BookRender.Esc(link["path"])}</code></li>";
            }));
            parts.Add($"<h3>Implemented By</h3>\n<ul class=\"links\">{items}</ul>");
        }

        var callsLinks = index.CallsByTarget.TryGetValue(id, out var called) ? called : [];
        if (callsLinks.Count > 0)
        {
            var items = string.Concat(callsLinks.Select(link =>
            {
                var screen = BookRender.StrProp(link, "screen") is { } name ? index.ScreensByKey.GetValueOrDefault(name) : null;
                var operations = screen?["operations"] as JsonArray ?? [];
                var routes = screen is not null
                    ? string.Join(", ", operations.Select(operation => $"{BookRender.PropText(operation as JsonObject, "method")} {BookRender.PropText(operation as JsonObject, "path")}"))
                    : "";
                var file = screen is not null ? $" <span class=\"mono dim\">{BookRender.Esc(screen["file"])}</span>" : "";
                return $"<li><b>{BookRender.Esc(link["screen"])}</b> calls <code>{BookRender.Esc(link["operation"])}</code>"
                    + (routes.Length > 0 ? $" <span class=\"mono dim\">{BookRender.Esc(routes)}</span>" : "") + file + "</li>";
            }));
            parts.Add($"<h3>Called From</h3>\n<ul class=\"links\">{items}</ul>");
        }

        var provesLinks = index.ProvesByClaim.TryGetValue(id, out var proved) ? proved : [];
        if (provesLinks.Count > 0)
        {
            var items = string.Concat(provesLinks.Select(link =>
            {
                var test = BookRender.StrProp(link, "scenario") is { } scenario ? index.TestsByName.GetValueOrDefault(scenario) : null;
                var where = test is not null ? $" <span class=\"mono dim\">{BookRender.Esc(test["file"])}:{BookRender.PropText(test, "line")}</span>" : "";
                var confirmed = BookRender.IsTrue(link["confirmed"]) ? "confirmed" : "unconfirmed";
                return $"<li><code>{BookRender.Esc(link["scenario"])}</code> <span class=\"dim\">{confirmed}, {PassingText(link["passing"])}</span>{where}</li>";
            }));
            parts.Add($"<h3>Proved By</h3>\n<ul class=\"links\">{items}</ul>");
        }

        if (parts.Count == 0)
        {
            return "";
        }

        return $"<h2 id=\"implementation\">Implementation</h2>\n{string.Join("\n", parts)}";
    }

    static string PassingText(JsonNode? passing) =>
        passing is JsonValue scalar && scalar.TryGetValue<bool>(out var outcome) ? (outcome ? "passing" : "failing") : "no test run";

    static string ProofChip(string state)
    {
        var tone = state == "proved-passing" ? "ok" : state == "unproved" ? "warn" : "note";
        var label = BookModel.ProofLabels.TryGetValue(state, out var found) ? found : state;
        return $"<span class=\"chip {tone}\">{BookRender.Esc(label)}</span>";
    }

    static string RenderUseCaseResults(BookIndex index, string rel, JsonObject record)
    {
        var (results, scenarios) = BookModel.UseCaseChildren(index, BookRender.StrProp(record, "id") ?? "");
        if (results.Count == 0 && scenarios.Count == 0)
        {
            return "";
        }

        var byResult = new Dictionary<string, List<JsonObject>>(StringComparer.Ordinal);
        var ungrouped = new List<JsonObject>();
        foreach (var scenario in scenarios)
        {
            var target = (BookRender.Links(scenario)?["result"] as JsonArray ?? [])
                .Where(link => link is JsonValue scalar && scalar.TryGetValue<string>(out _))
                .Select(link => BookRender.Str(link))
                .FirstOrDefault(id => id.Length > 0);
            if (target is not null && results.Any(result => BookRender.StrProp(result, "id") == target))
            {
                if (!byResult.TryGetValue(target, out var grouped))
                {
                    grouped = [];
                    byResult[target] = grouped;
                }

                grouped.Add(scenario);
            }
            else
            {
                ungrouped.Add(scenario);
            }
        }

        var parts = new List<string>();
        foreach (var result in results)
        {
            var resultId = BookRender.StrProp(result, "id") ?? "";
            var fields = BookRender.Fields(result) ?? new JsonObject();
            var outcome = BookRender.StrProp(fields, "outcome") == "refusal" ? "Refusal" : "Success";
            var code = BookRender.IsTruthy(fields["code"]) ? $" <span class=\"dev-only\"><code>{BookRender.Esc(fields["code"])}</code></span>" : "";
            var derived = BookRender.IsTrue(result["derived"]) ? " <span class=\"dim\">(derived)</span>" : "";
            var meaning = BookRender.IsTruthy(fields["meaning"]) ? $"<div class=\"dim\">{BookRender.Esc(fields["meaning"])}</div>" : "";
            var recorded = BookRender.IsTrue(fields["recorded"]) ? "<div class=\"dim\">The attempt is recorded with its reason.</div>" : "";
            parts.Add($"<h3>{BookRender.RecordLink(index, rel, resultId)} <span class=\"dim\">{outcome}</span>{code}{derived}</h3>\n{meaning}{recorded}");
            if (byResult.TryGetValue(resultId, out var grouped) && grouped.Count > 0)
            {
                parts.Add($"<ul class=\"links\">{string.Concat(grouped.Select(scenario => ScenarioItem(index, rel, scenario)))}</ul>");
            }
        }

        if (ungrouped.Count > 0)
        {
            parts.Add($"<h3>Other scenarios</h3>\n<ul class=\"links\">{string.Concat(ungrouped.Select(scenario => ScenarioItem(index, rel, scenario)))}</ul>");
        }

        return $"<h2 id=\"results\">Results</h2>\n{string.Join("\n", parts)}";
    }

    static string RenderReactionScenarios(BookIndex index, string rel, JsonObject record)
    {
        var name = BookModel.SplitId(BookRender.StrProp(record, "id") ?? "").Name;
        var scenarios = index.ScenariosOf.TryGetValue(name, out var found) ? found : [];
        if (scenarios.Count == 0)
        {
            return "";
        }

        return $"<h2 id=\"scenarios\">Scenarios</h2>\n<ul class=\"links\">{string.Concat(scenarios.Select(scenario => ScenarioItem(index, rel, scenario)))}</ul>";
    }

    static string ScenarioItem(BookIndex index, string rel, JsonObject scenario)
    {
        var state = BookModel.ScenarioProof(index, BookRender.StrProp(scenario, "id") ?? "").State;
        var fields = BookRender.Fields(scenario) ?? new JsonObject();
        var sentences = new List<string>();
        if (BookRender.IsTruthy(fields["given"]))
        {
            sentences.Add($"Given {BookRender.Str(fields["given"])}");
        }

        if (BookRender.IsTruthy(fields["when"]))
        {
            sentences.Add($"When {BookRender.Str(fields["when"])}");
        }

        if (BookRender.IsTruthy(fields["then"]))
        {
            sentences.Add($"Then {BookRender.Str(fields["then"])}");
        }

        var detail = sentences.Count > 0 ? $"<div class=\"dim\">{BookRender.Esc(string.Join(" ", sentences))}</div>" : "";
        var stale = BookModel.IsStale(index, BookRender.StrProp(scenario, "id")) ? " <span class=\"chip risk\">Stale</span>" : "";
        return $"<li>{BookRender.RecordLink(index, rel, BookRender.StrProp(scenario, "id") ?? "")} {ProofChip(state)}{stale}{detail}</li>";
    }

    static string RenderScenarioProof(BookIndex index, string rel, JsonObject record)
    {
        var proof = BookModel.ScenarioProof(index, BookRender.StrProp(record, "id") ?? "");
        var stale = BookModel.IsStale(index, BookRender.StrProp(record, "id")) ? " <span class=\"chip risk\">Stale</span>" : "";
        var parts = new List<string>
        {
            $"<h2 id=\"proof\">Proof</h2>\n<p>{ProofChip(proof.State)}{stale}"
            + (proof.Claimed ? " A test claims this scenario, but the claim does not hold: no proving step calls the use case, or a refusal asserts no code." : "")
            + "</p>",
        };
        if (proof.Links.Count > 0)
        {
            var items = string.Concat(proof.Links.Select(link =>
            {
                var where = link.Test is not null ? $" <span class=\"mono dim\">{BookRender.Esc(link.Test["file"])}:{BookRender.PropText(link.Test, "line")}</span>" : "";
                var confirmed = link.Confirmed ? "confirmed" : "unconfirmed";
                var outcome = link.Passing == true ? "passing" : link.Passing == false ? "failing" : "no test run";
                var indirect = link.Indirect ? ", indirect" : "";
                return $"<li><code>{BookRender.Esc(link.Scenario)}</code> <span class=\"dim\">{confirmed}{indirect}, {outcome}</span>{where}</li>";
            }));
            parts.Add($"<div class=\"dev-only\">\n<ul class=\"links\">{items}</ul>\n</div>");
        }

        return string.Join("\n", parts);
    }

    static string RenderRecordReview(BookIndex index, string rel, JsonObject record, ReviewBundle review)
    {
        var id = BookRender.StrProp(record, "id") ?? "";
        var items = new List<string>();
        if (BookRender.StrProp(record, "status") == "draft")
        {
            var fields = BookRender.Fields(record);
            var decider = fields?["decider"];
            var decideBy = fields?["decideBy"];
            items.Add("<li>This record is a draft"
                + (BookRender.IsTruthy(decider) ? $" awaiting {BookRender.Esc(decider)}" : " with no decider")
                + (BookRender.IsTruthy(decideBy) ? $" by {BookRender.Esc(decideBy)}" : " with no decide-by date") + ".</li>");
        }

        foreach (var gap in review.Gaps)
        {
            var subjects = BookRender.Links(gap.Record)?["subject"] as JsonArray ?? [];
            if (!subjects.Any(subject => subject is JsonValue scalar && scalar.TryGetValue<string>(out var target) && target == id))
            {
                continue;
            }

            items.Add($"<li>{(gap.Expired ? "<span class=\"chip risk\">Expired</span> " : "")}Known gap: {BookRender.RecordLink(index, rel, gap.Record["id"])}.</li>");
        }

        foreach (var question in review.Questions)
        {
            if (BookRender.StrProp(question.Record, "id") != id)
            {
                continue;
            }

            items.Add($"<li>Open question: {BookRender.Esc(question.Question)}"
                + (question.Decider is { Length: > 0 } ? $" awaiting {BookRender.Esc(question.Decider)}" : "")
                + (question.DecideBy is { Length: > 0 } ? $" by {BookRender.Esc(question.DecideBy)}" : "")
                + (question.Recommended is { Length: > 0 } ? $" Recommended: {BookRender.Esc(question.Recommended)}" : "")
                + (question.Ballot is { Length: > 0 } ? $" Ballot {BookRender.Esc(question.Ballot)}" : "")
                + $" Tier {question.Tier}.</li>");
        }

        foreach (var finding in review.Findings)
        {
            if (BookRender.StrProp(finding, "subject") != id)
            {
                continue;
            }

            items.Add($"<li><span class=\"chip risk\">Finding</span> <span class=\"dev-only\"><code>{BookRender.Esc(finding?["code"])}</code> </span>{BookRender.Esc(finding?["message"])}</li>");
        }

        if (items.Count == 0)
        {
            return "";
        }

        return $"<section class=\"review-only\" aria-label=\"Review notes\"><h2>Review</h2>\n<ul class=\"links\">{string.Concat(items)}</ul></section>";
    }

    /// <summary>Renders one journey as a chapter: goal, steps, promises, outcomes, consequences and questions.</summary>
    static string RenderJourneyChapter(BookIndex index, string rel, JsonObject journey)
    {
        var fields = BookRender.Fields(journey) ?? new JsonObject();
        var journeyId = BookRender.StrProp(journey, "id") ?? "";
        var parts = new List<string>();

        if (BookRender.IsTruthy(fields["goal"]))
        {
            parts.Add($"<p class=\"lede\">{BookRender.Esc(fields["goal"])}</p>");
        }

        if (BookRender.IsTruthy(fields["finishedWhen"]))
        {
            parts.Add($"<p>Finished when: {BookRender.Esc(fields["finishedWhen"])}</p>");
        }

        var steps = fields["steps"] as JsonArray ?? [];
        if (steps.Count > 0)
        {
            parts.Add("<h2 id=\"steps\">Steps</h2>");
            var items = string.Concat(steps.OfType<JsonObject>().Select((step, position) =>
            {
                var id = BookRender.StrProp(step, "id") ?? $"s{position + 1}";
                var says = BookRender.EscOr(step["says"], "");
                var actor = BookRender.StrProp(step, "actor") is { } actorId && index.ById.TryGetValue(actorId, out var actorRecord)
                    ? $" <span class=\"dim\">({BookRender.Esc(actorRecord["title"])})</span>"
                    : "";
                var wrong = BookRender.IsTruthy(step["ifItGoesWrong"])
                    ? $"<div class=\"dim\">If it goes wrong: {BookRender.Esc(step["ifItGoesWrong"])}</div>"
                    : "";
                return $"<li id=\"{BookRender.Esc(id)}\">{says}{actor}{wrong}</li>";
            }));
            parts.Add($"<ol class=\"plain\">{items}</ol>");
        }

        parts.Add("<h2 id=\"serving\">How Each Step Is Served</h2>");
        var served = new List<string>();
        foreach (var step in steps.OfType<JsonObject>())
        {
            var id = BookRender.StrProp(step, "id") ?? "";
            var says = BookRender.Str(step["says"]);
            var serving = BookModel.ServingUseCases(index, $"{journeyId}#{id}");
            if (serving.Count == 0)
            {
                served.Add($"<li>{BookRender.Esc(says)}: no use case serves this step yet.</li>");
                continue;
            }

            foreach (var useCase in serving)
            {
                var goal = BookRender.Str(BookRender.Fields(useCase)?["goal"]);
                var line = goal.Length > 0 ? goal : BookModel.SortTitle(useCase);
                served.Add($"<li>{BookRender.Esc(says)}: {BookRender.Esc(line)} ({BookRender.RecordLink(index, rel, BookRender.StrProp(useCase, "id") ?? "")}).</li>");
            }
        }

        parts.Add(served.Count > 0 ? $"<ul class=\"plain\">{string.Concat(served)}</ul>" : "<p>No step is recorded yet.</p>");

        var requirements = BookModel.JourneyRequirements(index, journey);
        parts.Add("<h2 id=\"promises\">Promises</h2>");
        if (requirements.Count == 0)
        {
            parts.Add("<p>This journey promises nothing yet.</p>");
        }
        else
        {
            var items = string.Concat(requirements.Select(requirement =>
            {
                var requireFields = BookRender.Fields(requirement) ?? new JsonObject();
                var statement = BookRender.EscOr(requireFields["statement"], "");
                var link = BookRender.RecordLink(index, rel, BookRender.StrProp(requirement, "id") ?? "");
                var excepts = string.Concat((requireFields["except"] as JsonArray ?? []).OfType<JsonObject>().Select(except =>
                {
                    var when = BookRender.EscOr(except["when"], "");
                    var fallbackId = BookRender.StrProp(except, "fallback");
                    var fallback = fallbackId is not null && index.ById.TryGetValue(fallbackId, out var target)
                        ? BookRender.Str(BookRender.Fields(target)?["statement"])
                        : "";
                    var fallbackLink = fallbackId is not null ? $" ({BookRender.RecordLink(index, rel, fallbackId)})" : "";
                    return $"<div class=\"dim\">Except when {when}. Then {BookRender.Esc(fallback)}{fallbackLink}.</div>";
                }));
                return $"<li>{statement} ({link}).{excepts}</li>";
            }));
            parts.Add($"<ul class=\"plain\">{items}</ul>");
        }

        var useCases = BookModel.JourneyUseCases(index, journey);
        var thens = new List<string>();
        foreach (var useCase in useCases)
        {
            var kids = BookModel.UseCaseChildren(index, BookRender.StrProp(useCase, "id") ?? "");
            foreach (var scenario in kids.Scenarios)
            {
                var then = BookRender.Str(BookRender.Fields(scenario)?["then"]);
                if (then.Length == 0)
                {
                    continue;
                }

                thens.Add($"<li>Then {BookRender.Esc(then)} <span class=\"dim\">({BookRender.RecordLink(index, rel, BookRender.StrProp(scenario, "id") ?? "")})</span></li>");
            }
        }

        parts.Add("<h2 id=\"outcomes\">Outcomes</h2>");
        parts.Add("<p class=\"dim\">Context: these lines come from Behavior and are not part of what you approve.</p>");
        parts.Add(thens.Count > 0 ? $"<ul class=\"plain\">{string.Concat(thens)}</ul>" : "<p>No outcome is recorded yet.</p>");

        parts.Add("<h2 id=\"consequences\">Consequences</h2>");
        parts.Add("<p class=\"dim\">Context: this box is rendered from Behavior and stays outside the approval.</p>");
        var consequences = JourneyConsequences(index, rel, journey, useCases, requirements);
        parts.Add(consequences.Count > 0 ? $"<ul class=\"plain\">{string.Concat(consequences)}</ul>" : "<p>No new refusal, kept data or money effect is recorded.</p>");

        var questions = JourneyQuestions(index, journey, useCases, requirements);
        parts.Add("<h2 id=\"questions\">Open Questions</h2>");
        if (questions.Count == 0)
        {
            parts.Add("<p>No open question is recorded.</p>");
        }
        else
        {
            var items = string.Concat(questions.Select((question, position) =>
            {
                var owner = BookRender.StrProp(question.Record, "id") ?? "";
                var recommended = question.Recommended is { Length: > 0 } ? $" Recommended: {BookRender.Esc(question.Recommended)}." : "";
                return $"<li>{position + 1}. {BookRender.Esc(question.Question)}{recommended} <span class=\"dim\">(on {BookRender.RecordLink(index, rel, owner)}, {BookRender.Esc(question.Decider ?? "no decider")} by {BookRender.Esc(question.DecideBy ?? "no date")})</span></li>";
            }));
            parts.Add($"<ol class=\"plain\">{items}</ol>");
        }

        return string.Join("\n", parts);
    }

    static List<string> JourneyConsequences(BookIndex index, string rel, JsonObject journey, IReadOnlyList<JsonObject> useCases, IReadOnlyList<JsonObject> requirements)
    {
        var items = new List<string>();
        foreach (var useCase in useCases)
        {
            var kids = BookModel.UseCaseChildren(index, BookRender.StrProp(useCase, "id") ?? "");
            foreach (var result in kids.Results)
            {
                if (BookRender.IsTrue(result["derived"]))
                {
                    continue;
                }

                if (BookRender.StrProp(BookRender.Fields(result), "outcome") != "refusal")
                {
                    continue;
                }

                var meaning = BookRender.Str(BookRender.Fields(result)?["meaning"]);
                if (meaning.Length > 0)
                {
                    items.Add($"<li>New refusal a reader can meet: &quot;{BookRender.Esc(meaning)}&quot;.</li>");
                }
            }
        }

        var aggregates = new Dictionary<string, JsonObject>(StringComparer.Ordinal);
        foreach (var useCase in useCases)
        {
            var fields = BookRender.Fields(useCase) ?? new JsonObject();
            foreach (var id in FieldIds(fields["changes"]).Concat(FieldIds(fields["reads"])))
            {
                if (index.ById.TryGetValue(id, out var aggregate) && aggregates.TryAdd(id, aggregate))
                {
                }
            }
        }

        foreach (var aggregate in aggregates.Values.OrderBy(record => BookModel.SortTitle(record), BookRender.LocaleComparer))
        {
            foreach (var dataClass in BookRender.Fields(aggregate)?["dataClasses"] as JsonArray ?? [])
            {
                if (dataClass is JsonObject entry && BookRender.IsTruthy(entry["name"]) && BookRender.IsTruthy(entry["period"]))
                {
                    items.Add($"<li>Kept data: {BookRender.Esc(entry["name"])} is kept for {BookRender.Esc(entry["period"])}.</li>");
                }
            }
        }

        foreach (var requirement in requirements.Where(record => BookModel.HasRiskValue(record, "money")))
        {
            var statement = BookRender.Str(BookRender.Fields(requirement)?["statement"]);
            items.Add($"<li>Money: {BookRender.Esc(statement.Length > 0 ? statement : BookModel.SortTitle(requirement))}.</li>");
        }

        foreach (var useCase in useCases.Where(record => BookModel.HasRiskValue(record, "money")))
        {
            items.Add($"<li>Money: {BookRender.RecordLink(index, rel, BookRender.StrProp(useCase, "id") ?? "")} touches money.</li>");
        }

        return items;
    }

    static IReadOnlyList<OpenQuestion> JourneyQuestions(BookIndex index, JsonObject journey, IReadOnlyList<JsonObject> useCases, IReadOnlyList<JsonObject> requirements)
    {
        var wanted = new HashSet<string>(StringComparer.Ordinal) { BookRender.StrProp(journey, "id") ?? "" };
        foreach (var record in useCases.Concat(requirements))
        {
            if (BookRender.StrProp(record, "id") is { } id)
            {
                wanted.Add(id);
            }
        }

        return BookModel.CollectQuestions(index)
            .Where(question => wanted.Contains(BookRender.StrProp(question.Record, "id") ?? ""))
            .OrderBy(question => question.Tier)
            .ThenBy(question => question.DecideBy ?? "", BookRender.LocaleComparer)
            .ToList();
    }

    static IReadOnlyList<string> FieldIds(JsonNode? value)
    {
        if (value is JsonValue scalar && scalar.TryGetValue<string>(out var single) && single is { Length: > 0 })
        {
            return [single];
        }

        if (value is JsonArray list)
        {
            return list
                .Where(entry => entry is JsonValue item && item.TryGetValue<string>(out _))
                .Select(entry => BookRender.Str(entry))
                .Where(id => id.Length > 0)
                .ToList();
        }

        return [];
    }
}
