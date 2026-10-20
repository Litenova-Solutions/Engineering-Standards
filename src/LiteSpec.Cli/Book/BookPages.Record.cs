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
        var kind = $"{BookModel.TypeLabel(BookRender.StrProp(record, "type"))} · {BookRender.PropText(record, "id")}";
        var facts = new List<(string Term, string Value)>
        {
            ("File", $"<span class=\"mono\">{BookRender.EscOr(record["file"], "")}{(BookRender.IsTruthy(record["line"]) ? $":{BookRender.Str(record["line"])}" : "")}</span>"),
        };
        if (BookRender.StrProp(record, "type") == "use-case")
        {
            var kids = BookModel.UseCaseChildren(index, BookRender.StrProp(record, "id") ?? "");
            facts.Add(("Results", $"<b>{kids.Results.Count}</b>"));
            facts.Add(("Cases", $"<b>{kids.Cases.Count}</b>"));
        }

        var parts = new List<string>();
        parts.Add(BookRender.PageHeader(kind, BookModel.SortTitle(record), "", facts));
        parts.Add(AuthorityStrip(index, record));
        var fieldsHtml = RenderFields(index, rel, record);
        if (fieldsHtml != "")
        {
            parts.Add(fieldsHtml);
        }

        if (BookRender.StrProp(record, "type") == "use-case")
        {
            var resultsHtml = RenderUseCaseResults(index, rel, record);
            if (resultsHtml != "")
            {
                parts.Add(resultsHtml);
            }
        }

        if (BookRender.StrProp(record, "type") == "case")
        {
            parts.Add(RenderCaseProof(index, rel, record));
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
            parts.Add(computed);
        }

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
        cells.Add(("Owner", BookRender.EscOr(record["owner"], "no owner"), false));
        var fields = BookRender.Fields(record);
        cells.Add(("Decider", BookRender.EscOr(fields?["decider"], "none"), false));
        cells.Add(("Decide by", BookRender.EscOr(fields?["decideBy"], "none"), false));
        if (BookRender.StrProp(record, "type") == "use-case")
        {
            var state = BookModel.UseCaseStatus(index, BookRender.StrProp(record, "id"));
            cells.Add(("Implemented", state.Implemented
                ? "<span class=\"chip ok\">Yes</span> <span>code implements it</span>"
                : "<span class=\"chip warn\">No</span> <span>no code implements it</span>", false));
            cells.Add(("Verified", state.Verified
                ? "<span class=\"chip ok\">Yes</span> <span>every case proved by a passing test</span>"
                : "<span class=\"chip warn\">No</span> <span>a case is unproved or failing</span>", false));
        }

        return $"<div class=\"strip\" role=\"region\" aria-label=\"Authority\">{string.Concat(cells.Select(cell =>
            $"<div class=\"cell{(cell.Wide ? " wide" : "")}\"><div class=\"k\">{BookRender.Esc(cell.Term)}</div><div class=\"v\">{cell.Value}</div></div>"))}</div>";
    }

    static string RenderOutgoingLinks(BookIndex index, string rel, JsonObject record)
    {
        var links = BookRender.Links(record) ?? new JsonObject();
        var groups = new List<string>();
        foreach (var (field, label) in BookModel.LinkLabels)
        {
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
            var label = BookModel.LinkInverseLabels.TryGetValue(pair.Key, out var found) ? found : $"Linked through {pair.Key}";
            var items = string.Concat(pair.Value.OrderBy(from => from, StringComparer.Ordinal).Select(from => $"<li>{BookRender.RecordLink(index, rel, from)}</li>"));
            groups.Add($"<h3>{BookRender.Esc(label)}</h3>\n<ul class=\"links\">{items}</ul>");
        }

        if (groups.Count == 0)
        {
            return "";
        }

        return $"<h2 id=\"linked-from\">Linked from</h2>\n{string.Join("\n", groups)}";
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
            parts.Add($"<h3>Implemented by</h3>\n<ul class=\"links\">{items}</ul>");
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
            parts.Add($"<h3>Called from</h3>\n<ul class=\"links\">{items}</ul>");
        }

        var provesLinks = index.ProvesByCase.TryGetValue(id, out var proved) ? proved : [];
        if (provesLinks.Count > 0)
        {
            var items = string.Concat(provesLinks.Select(link =>
            {
                var test = BookRender.StrProp(link, "scenario") is { } scenario ? index.TestsByName.GetValueOrDefault(scenario) : null;
                var where = test is not null ? $" <span class=\"mono dim\">{BookRender.Esc(test["file"])}:{BookRender.PropText(test, "line")}</span>" : "";
                var confirmed = BookRender.IsTrue(link["confirmed"]) ? "confirmed" : "unconfirmed";
                return $"<li><code>{BookRender.Esc(link["scenario"])}</code> <span class=\"dim\">{confirmed}, {PassingText(link["passing"])}</span>{where}</li>";
            }));
            parts.Add($"<h3>Proved by</h3>\n<ul class=\"links\">{items}</ul>");
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
        var (results, cases) = BookModel.UseCaseChildren(index, BookRender.StrProp(record, "id") ?? "");
        var parts = new List<string>();
        if (results.Count > 0)
        {
            var items = string.Concat(results.Select(result =>
            {
                var fields = BookRender.Fields(result) ?? new JsonObject();
                var code = BookRender.IsTruthy(fields["code"]) ? $" <code>{BookRender.Esc(fields["code"])}</code>" : "";
                var status = fields["httpStatus"] is JsonValue number && number.GetValueKind() == System.Text.Json.JsonValueKind.Number
                    ? $" <span class=\"dim\">HTTP {BookRender.Str(fields["httpStatus"])}</span>"
                    : "";
                return $"<li>{BookRender.RecordLink(index, rel, BookRender.StrProp(result, "id") ?? "")} <span class=\"dim\">{BookRender.EscOr(fields["outcome"], "")}</span>{code}{status}</li>";
            }));
            parts.Add($"<h2 id=\"results\">Results</h2>\n<ul class=\"links\">{items}</ul>");
        }

        if (cases.Count > 0)
        {
            var items = string.Concat(cases.Select(kase =>
            {
                var state = BookModel.CaseProof(index, BookRender.StrProp(kase, "id") ?? "").State;
                var fields = BookRender.Fields(kase) ?? new JsonObject();
                var detail = string.Join(" &#8594; ", new[] { fields["situation"], fields["action"], fields["expect"] }
                    .Where(BookRender.IsTruthy)
                    .Select(BookRender.Esc));
                return $"<li>{BookRender.RecordLink(index, rel, BookRender.StrProp(kase, "id") ?? "")} {ProofChip(state)}"
                    + (detail.Length > 0 ? $"<div class=\"dim\">{detail}</div>" : "") + "</li>";
            }));
            parts.Add($"<h2 id=\"cases\">Cases</h2>\n<ul class=\"links\">{items}</ul>");
        }

        return string.Join("\n", parts);
    }

    static string RenderCaseProof(BookIndex index, string rel, JsonObject record)
    {
        var proof = BookModel.CaseProof(index, BookRender.StrProp(record, "id") ?? "");
        var parts = new List<string>
        {
            $"<h2 id=\"proof\">Proof</h2>\n<p>{ProofChip(proof.State)}"
            + (proof.Claimed ? " A test claims this case, but the claim does not hold: no proving step calls the use case, or a refusal asserts no code." : "")
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
            parts.Add($"<ul class=\"links\">{items}</ul>");
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

        foreach (var finding in review.Findings)
        {
            if (BookRender.StrProp(finding, "subject") != id)
            {
                continue;
            }

            items.Add($"<li><span class=\"chip risk\">Finding</span> <code>{BookRender.Esc(finding?["code"])}</code> {BookRender.Esc(finding?["message"])}</li>");
        }

        if (items.Count == 0)
        {
            return "";
        }

        return $"<section class=\"review-only\" aria-label=\"Review notes\"><h2>Review</h2>\n<ul class=\"links\">{string.Concat(items)}</ul></section>";
    }
}
