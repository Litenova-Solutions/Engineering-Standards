using System.Text.Json.Nodes;

namespace LiteSpec.Book;

/// <summary>The book generator's index pages: type indexes, lenses, review, glossary and search.</summary>
static partial class BookPages
{
    /// <summary>Renders one record type's index page.</summary>
    public static string RenderTypeIndex(BookIndex index, string rel, string type)
    {
        var list = index.ByType.TryGetValue(type, out var found) ? found : [];
        var parts = new List<string>();
        parts.Add(BookRender.PageHeader("Index", BookModel.TypeLabel(type, true), $"{list.Count} records."));
        var rows = string.Concat(list.Select(record =>
        {
            var status = BookRender.OrStr(record["status"], "");
            var extra = BookRender.StrProp(record, "type") == "use-case"
                ? StatusCells(BookModel.UseCaseStatus(index, BookRender.StrProp(record, "id")))
                : "";
            return $"<tr><td><a href=\"{rel}{BookModel.RecordUrl(BookRender.StrProp(record, "id") ?? "")}\">{BookRender.Esc(record["title"])}</a>"
                + $"<div class=\"mono dim\">{BookRender.Esc(record["id"])}</div></td>"
                + $"<td data-value=\"{BookRender.Esc(status)}\">{BookRender.StatusChip(status)}</td>"
                + $"<td>{BookRender.EscOr(record["owner"], "")}</td>{extra}</tr>";
        }));
        var extraHead = type == "use-case" ? "<th>Implemented</th><th>Verified</th>" : "";
        parts.Add("<div class=\"tablewrap\"><table class=\"tbl sortable\">"
            + "<thead><tr><th><button type=\"button\" data-sort=\"0\">Title</button></th>"
            + "<th><button type=\"button\" data-sort=\"1\">Status</button></th>"
            + $"<th><button type=\"button\" data-sort=\"2\">Owner</button></th>{extraHead}</tr></thead>"
            + $"<tbody>{rows}</tbody></table></div>");
        return string.Join("\n", parts);
    }

    static string StatusCells(UseCaseState state) =>
        $"<td>{(state.Implemented ? "Yes" : "No")}</td><td>{(state.Verified ? "Yes" : "No")}</td>";

    /// <summary>Renders the lens index: one entry per actor.</summary>
    public static string RenderLensIndex(BookIndex index, string rel)
    {
        var actors = index.ByType.TryGetValue("actor", out var found) ? found : [];
        var parts = new List<string>();
        parts.Add(BookRender.PageHeader("Lenses", "Lenses", "One lens per actor: what each actor does, holds and may reach."));
        var items = string.Concat(actors.Select(actor =>
        {
            var lens = BookModel.ActorLens(index, BookRender.StrProp(actor, "id") ?? "");
            return $"<li><a href=\"{rel}{BookModel.LensUrl(BookRender.StrProp(actor, "id") ?? "")}\">{BookRender.Esc(actor["title"])}</a> "
                + $"<span class=\"dim\">{lens.Journeys.Count} journeys, {lens.Roles.Count} roles, "
                + $"{lens.Permissions.Count} permissions, {lens.UseCases.Count} use cases</span></li>";
        }));
        parts.Add($"<ul class=\"links\">{items}</ul>");
        return string.Join("\n", parts);
    }

    /// <summary>Renders one actor's lens page.</summary>
    public static string RenderLens(BookIndex index, string rel, JsonObject actor)
    {
        var lens = BookModel.ActorLens(index, BookRender.StrProp(actor, "id") ?? "");
        var kind = BookRender.Fields(actor)?["kind"];
        var kindFacts = new List<(string Term, string Value)>();
        if (BookRender.IsTruthy(kind))
        {
            kindFacts.Add(("Kind", BookRender.Esc(kind)));
        }

        var parts = new List<string>();
        parts.Add(BookRender.PageHeader($"Lens · {BookRender.PropText(actor, "id")}", BookRender.Str(actor["title"]), "", kindFacts));
        parts.Add("<h2 id=\"journeys\">Journeys</h2>");
        if (lens.Journeys.Count > 0)
        {
            parts.Add($"<ul class=\"links\">{string.Concat(lens.Journeys.Select(journey =>
                $"<li>{BookRender.RecordLink(index, rel, BookRender.StrProp(journey, "id") ?? "")}</li>"))}</ul>");
        }
        else
        {
            parts.Add("<p>This actor takes no journey.</p>");
        }

        parts.Add("<h2 id=\"roles\">Roles</h2>");
        if (lens.Roles.Count > 0)
        {
            var rows = string.Concat(lens.Roles.Select(hold =>
            {
                var name = hold.Role is not null
                    ? $"<a href=\"{rel}{BookModel.RecordUrl(BookRender.StrProp(hold.Role, "id") ?? "")}\">{BookRender.Esc(hold.Role["title"])}</a>"
                    : $"<code>{BookRender.Esc(hold.Hold["role"])}</code>";
                return $"<tr><td>{name}</td><td>{BookRender.EscOr(hold.Hold["scope"], "")}</td></tr>";
            }));
            parts.Add($"<div class=\"tablewrap\"><table class=\"tbl\"><thead><tr><th>Role</th><th>Scope</th></tr></thead><tbody>{rows}</tbody></table></div>");
        }
        else
        {
            parts.Add("<p>This actor holds no role.</p>");
        }

        parts.Add("<h2 id=\"permissions\">Permissions</h2>");
        if (lens.Permissions.Count > 0)
        {
            var items = string.Concat(lens.Permissions.Select(permission =>
            {
                var meaning = BookRender.Fields(permission)?["meaning"];
                return $"<li>{BookRender.RecordLink(index, rel, BookRender.StrProp(permission, "id") ?? "")}"
                    + (BookRender.IsTruthy(meaning) ? $" <span class=\"dim\">{BookRender.Esc(meaning)}</span>" : "") + "</li>";
            }));
            parts.Add($"<ul class=\"links\">{items}</ul>");
        }
        else
        {
            parts.Add("<p>Its roles allow no permission.</p>");
        }

        parts.Add("<h2 id=\"use-cases\">Use cases</h2>");
        if (lens.UseCases.Count > 0)
        {
            parts.Add($"<ul class=\"links\">{string.Concat(lens.UseCases.Select(useCase =>
                $"<li>{BookRender.RecordLink(index, rel, BookRender.StrProp(useCase, "id") ?? "")}</li>"))}</ul>");
        }
        else
        {
            parts.Add("<p>Its permissions open no use case.</p>");
        }

        return string.Join("\n", parts);
    }

    /// <summary>Renders the review page: known gaps, drafts, findings and covered findings.</summary>
    public static string RenderReview(BookIndex index, string rel, ReviewBundle review, string generatedDate)
    {
        var parts = new List<string>();
        parts.Add(BookRender.PageHeader(
            "Review",
            "Review",
            $"Known gaps, drafts awaiting a decision, and check findings, as of {(generatedDate.Length >= 10 ? generatedDate[..10] : generatedDate)}.",
            [
                ("Known gaps", $"<b>{review.Gaps.Count}</b>"),
                ("Drafts", $"<b>{review.WithDecider.Count + review.WithoutDecider.Count}</b>"),
                ("Findings", $"<b>{review.Findings.Count}</b>"),
            ]));
        parts.Add("<h2 id=\"gaps\">Known gaps</h2>");
        if (review.Gaps.Count > 0)
        {
            var items = string.Concat(review.Gaps.Select(gap =>
            {
                var fields = BookRender.Fields(gap.Record) ?? new JsonObject();
                var subjects = BookRender.Links(gap.Record)?["subject"] as JsonArray ?? [];
                var subjectLinks = string.Join(", ", subjects.Select(id => BookRender.RecordLink(index, rel, id)));
                return $"<div class=\"fitem\"><span class=\"sev{(gap.Expired ? " high" : "")}\"></span><div>"
                    + $"<div class=\"t\">{(gap.Expired ? "Expired: " : "")}<a href=\"{rel}{BookModel.RecordUrl(BookRender.StrProp(gap.Record, "id") ?? "")}\">{BookRender.Esc(gap.Record["title"])}</a></div>"
                    + $"<div class=\"m\"><span>Owner {BookRender.EscOr(gap.Record["owner"], "none")}</span>"
                    + $"<span>Ends {BookRender.EscOr(fields["endsBy"], "no date")}</span>"
                    + $"<span>Check <code>{BookRender.EscOr(fields["check"], "")}</code></span></div>"
                    + (BookRender.IsTruthy(fields["reason"]) ? $"<p class=\"d\">{BookRender.Esc(fields["reason"])}</p>" : "")
                    + (subjectLinks.Length > 0 ? $"<p class=\"d\">About {subjectLinks}</p>" : "")
                    + "</div></div>";
            }));
            parts.Add(items);
        }
        else
        {
            parts.Add("<p>No known gap is recorded.</p>");
        }

        parts.Add("<h2 id=\"drafts\">Drafts awaiting a decision</h2>");
        var drafts = review.WithDecider.Concat(review.WithoutDecider).ToList();
        if (drafts.Count > 0)
        {
            var rows = string.Concat(drafts.Select(record =>
            {
                var fields = BookRender.Fields(record);
                return $"<tr><td><a href=\"{rel}{BookModel.RecordUrl(BookRender.StrProp(record, "id") ?? "")}\">{BookRender.Esc(record["title"])}</a>"
                    + $"<div class=\"mono dim\">{BookRender.Esc(record["id"])}</div></td>"
                    + $"<td>{BookRender.Esc(BookModel.TypeLabel(BookRender.StrProp(record, "type")))}</td>"
                    + $"<td>{BookRender.EscOr(fields?["decider"], "no decider")}</td>"
                    + $"<td>{BookRender.EscOr(fields?["decideBy"], "no date")}</td></tr>";
            }));
            parts.Add($"<div class=\"tablewrap\"><table class=\"tbl\"><thead><tr><th>Record</th><th>Type</th><th>Decider</th><th>Decide by</th></tr></thead><tbody>{rows}</tbody></table></div>");
        }
        else
        {
            parts.Add("<p>No draft awaits a decision.</p>");
        }

        parts.Add("<h2 id=\"findings\">Findings</h2>");
        if (review.Findings.Count > 0)
        {
            var items = string.Concat(review.Findings.Select(finding =>
            {
                var subject = BookRender.IsTruthy(finding?["subject"])
                    && BookRender.StrProp(finding, "subject") is { } id && index.ById.ContainsKey(id)
                    ? $"<p class=\"d\">About {BookRender.RecordLink(index, rel, id)}</p>" : "";
                return "<div class=\"fitem\"><span class=\"sev high\"></span><div>"
                    + $"<div class=\"t\"><code>{BookRender.Esc(finding?["code"])}</code> {BookRender.Esc(finding?["message"])}</div>"
                    + $"<div class=\"m\"><span class=\"mono\">{BookRender.EscOr(finding?["path"], "")}{(BookRender.IsTruthy(finding?["line"]) ? $":{BookRender.Str(finding?["line"])}" : "")}</span></div>"
                    + subject + "</div></div>";
            }));
            parts.Add(items);
        }
        else
        {
            parts.Add("<p>No findings file was supplied. Run the generator with <code>--findings</code> "
                + "pointing at the JSON output of the model check to list them here.</p>");
        }

        if (review.Known.Count > 0)
        {
            parts.Add("<h2 id=\"known\">Findings covered by a known gap</h2>");
            var items = string.Concat(review.Known.Select(finding =>
                $"<li><code>{BookRender.Esc(finding?["code"])}</code> {BookRender.Esc(finding?["message"])} "
                + $"<span class=\"mono dim\">{BookRender.EscOr(finding?["path"], "")}{(BookRender.IsTruthy(finding?["line"]) ? $":{BookRender.Str(finding?["line"])}" : "")}</span></li>"));
            parts.Add($"<details><summary>{review.Known.Count} covered findings</summary><ul class=\"links\">{items}</ul></details>");
        }

        return string.Join("\n", parts);
    }

    /// <summary>Renders the glossary: one card per term.</summary>
    public static string RenderGlossary(BookIndex index, string rel)
    {
        var terms = index.ByType.TryGetValue("term", out var found) ? found : [];
        var parts = new List<string>();
        parts.Add(BookRender.PageHeader("Glossary", "Glossary", $"{terms.Count} terms."));
        foreach (var term in terms)
        {
            var fields = BookRender.Fields(term) ?? new JsonObject();
            var labels = fields["labels"] switch
            {
                JsonObject table => string.Join(", ", table.Select(pair => $"{pair.Key}: {Template(pair.Value)}")),
                JsonArray table => string.Join(", ", table.Select((value, position) => $"{position}: {Template(value)}")),
                _ => "",
            };
            var rejected = new List<string>();
            foreach (var entry in fields["rejected"] as JsonArray ?? [])
            {
                JsonNode? word = entry switch
                {
                    JsonObject obj => obj["word"],
                    JsonArray => null,
                    _ => entry,
                };
                if (BookRender.IsTruthy(word))
                {
                    rejected.Add(BookRender.Str(word));
                }
            }

            parts.Add($"<div class=\"card term\"><div class=\"h\"><b><a href=\"{rel}{BookModel.RecordUrl(BookRender.StrProp(term, "id") ?? "")}\">{BookRender.Esc(term["title"])}</a></b>"
                + (labels.Length > 0 ? $"<span>{BookRender.Esc(labels)}</span>" : "") + "</div>"
                + (BookRender.IsTruthy(fields["meaning"]) ? $"<p>{BookRender.Esc(fields["meaning"])}</p>" : "")
                + (rejected.Count > 0 ? $"<p class=\"dim\">Not: {BookRender.Esc(string.Join(", ", rejected))}.</p>" : "") + "</div>");
        }

        if (terms.Count == 0)
        {
            parts.Add("<p>No term is recorded.</p>");
        }

        return string.Join("\n", parts);
    }

    static string Template(JsonNode? value) => value is null ? "null" : BookRender.Str(value);

    /// <summary>Renders the search page with the index embedded, so search works when the site opens as files.</summary>
    public static string RenderSearch(string rel, JsonArray entries)
    {
        // The index is embedded in the page so search works when the site opens
        // as files, where fetch cannot load search.json. The container id is
        // unique to this page: no section heading on any page may reuse it.
        _ = rel;
        var embedded = BookRender.JsonCompact(entries).Replace("<", "\\u003c", StringComparison.Ordinal);
        return BookRender.PageHeader("Search", "Search", "Filter every record by its title or id.")
            + "\n<div id=\"search-results\" role=\"status\" aria-live=\"polite\"><p>Type above to search.</p></div>"
            + $"\n<script>window.bookSearchIndex = {embedded};</script>";
    }
}
