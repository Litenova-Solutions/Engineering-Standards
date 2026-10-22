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
        if (BookRender.StrProp(record, "type") == "use-case")
        {
            var state = BookModel.UseCaseStatus(index, BookRender.StrProp(record, "id"));
            cells.Add(("Implemented", state.Implemented
                ? "<span class=\"chip ok\">Yes</span> <span>code implements it</span>"
                : "<span class=\"chip warn\">No</span> <span>no code implements it</span>", false));
            cells.Add(("Verified", state.Verified
                ? "<span class=\"chip ok\">Yes</span> <span>every scenario proved by a passing test</span>"
                : "<span class=\"chip warn\">No</span> <span>a scenario is unproved or failing</span>", false));
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
        if (state.Verified)
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
        var parts = new List<string>();
        if (results.Count > 0)
        {
            var items = string.Concat(results.Select(result =>
            {
                var fields = BookRender.Fields(result) ?? new JsonObject();
                var outcome = BookRender.StrProp(fields, "outcome") == "refusal" ? "Refusal" : "Success";
                var code = BookRender.IsTruthy(fields["code"]) ? $" <span class=\"dev-only\"><code>{BookRender.Esc(fields["code"])}</code></span>" : "";
                var meaning = BookRender.IsTruthy(fields["meaning"]) ? $"<div class=\"dim\">{BookRender.Esc(fields["meaning"])}</div>" : "";
                return $"<li>{BookRender.RecordLink(index, rel, BookRender.StrProp(result, "id") ?? "")} <span class=\"dim\">{outcome}</span>{code}{meaning}</li>";
            }));
            parts.Add($"<h2 id=\"results\">Results</h2>\n<ul class=\"links\">{items}</ul>");
        }

        if (scenarios.Count > 0)
        {
            var items = string.Concat(scenarios.Select(scenario =>
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
                return $"<li>{BookRender.RecordLink(index, rel, BookRender.StrProp(scenario, "id") ?? "")} {ProofChip(state)}{detail}</li>";
            }));
            parts.Add($"<h2 id=\"scenarios\">Scenarios</h2>\n<ul class=\"links\">{items}</ul>");
        }

        return string.Join("\n", parts);
    }

    static string RenderScenarioProof(BookIndex index, string rel, JsonObject record)
    {
        var proof = BookModel.ScenarioProof(index, BookRender.StrProp(record, "id") ?? "");
        var parts = new List<string>
        {
            $"<h2 id=\"proof\">Proof</h2>\n<p>{ProofChip(proof.State)}"
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
                + (question.DecideBy is { Length: > 0 } ? $" by {BookRender.Esc(question.DecideBy)}" : "") + ".</li>");
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
}
