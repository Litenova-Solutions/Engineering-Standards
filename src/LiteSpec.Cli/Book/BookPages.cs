using System.Text.Json.Nodes;

namespace LiteSpec.Book;

/// <summary>
///     Page renderers for the book generator. Every count is computed from model.json.
///     A port of <c>tools/book/lib/pages.mjs</c>; the record-field, record-page and
///     index renderers live in the sibling <c>BookPages.*.cs</c> files.
/// </summary>
static partial class BookPages
{
    /// <summary>Renders the home page: the product boundary, record counts and layers.</summary>
    public static string RenderHome(BookIndex index, string rel)
    {
        var products = index.ByType.TryGetValue("product", out var found) ? found : [];
        var product = products.Count > 0 ? products[0] : null;
        var fields = BookRender.Fields(product) ?? new JsonObject();

        var useCases = index.ByType.TryGetValue("use-case", out var cases) ? cases : [];
        var implemented = 0;
        var verified = 0;
        foreach (var useCase in useCases)
        {
            var state = BookModel.UseCaseStatus(index, BookRender.StrProp(useCase, "id"));
            if (state.Implemented)
            {
                implemented += 1;
            }

            if (state.Verified)
            {
                verified += 1;
            }
        }

        var parts = new List<string>();
        parts.Add(BookRender.PageHeader(
            product is not null ? $"Product · {BookRender.PropText(product, "id")}" : "Product",
            product is not null ? BookRender.Str(product["title"]) : "Project book",
            "Every record of the project model, generated from model.json.",
            [
                ("Records", $"<b>{index.Records.Count}</b>"),
                ("Use cases", $"<b>{useCases.Count}</b>"),
                ("Implemented", $"<b>{implemented}</b>"),
                ("Verified", $"<b>{verified}</b>"),
            ]));

        if (product is not null)
        {
            parts.Add(BookRender.SectionHeading(2, "boundary", "Boundary"));
            if (BookRender.IsTruthy(fields["boundary"]))
            {
                parts.Add($"<p>{BookRender.Esc(fields["boundary"])}</p>");
            }

            var neverDoes = fields["neverDoes"] as JsonArray ?? [];
            if (neverDoes.Count > 0)
            {
                parts.Add(BookRender.SectionHeading(2, "never-does", "Never does"));
                parts.Add($"<ul class=\"plain\">{string.Concat(neverDoes.Select(item => $"<li>{BookRender.Esc(item)}</li>"))}</ul>");
            }

            var audience = fields["audience"] as JsonArray ?? [];
            if (audience.Count > 0)
            {
                parts.Add(BookRender.SectionHeading(2, "audience", "Audience"));
                parts.Add($"<ul class=\"links\">{string.Concat(audience.Select(id => $"<li>{BookRender.RecordLink(index, rel, id)}</li>"))}</ul>");
            }
        }

        parts.Add(BookRender.SectionHeading(2, "counts", "Record counts"));
        var rows = new List<string>();
        foreach (var layer in BookModel.Layers)
        {
            foreach (var type in layer.Types)
            {
                var list = index.ByType.TryGetValue(type, out var typed) ? typed : [];
                if (list.Count == 0)
                {
                    continue;
                }

                var approved = list.Count(record => BookRender.StrProp(record, "status") == "approved");
                var draft = list.Count(record => BookRender.StrProp(record, "status") == "draft");
                var retired = list.Count(record => BookRender.StrProp(record, "status") == "retired");
                rows.Add($"<tr><td><a href=\"{rel}{BookModel.TypeIndexUrl(type)}\">{BookRender.Esc(BookModel.TypeLabel(type, true))}</a></td>"
                    + $"<td class=\"num\">{list.Count}</td><td class=\"num\">{approved}</td>"
                    + $"<td class=\"num\">{draft}</td><td class=\"num\">{retired}</td></tr>");
            }
        }

        parts.Add("<div class=\"tablewrap\"><table class=\"tbl\"><thead><tr><th>Type</th>"
            + "<th class=\"num\">Records</th><th class=\"num\">Approved</th><th class=\"num\">Draft</th>"
            + $"<th class=\"num\">Retired</th></tr></thead><tbody>{string.Concat(rows)}</tbody></table></div>");

        if (BookRender.IsTruthy(index.TestRun))
        {
            var run = index.TestRun as JsonObject;
            parts.Add(BookRender.SectionHeading(2, "test-run", "Latest test run"));
            parts.Add($"<p>{BookRender.Esc(run?["passed"])} of {BookRender.Esc(run?["total"])} tests passed, "
                + $"{BookRender.Esc(run?["failed"])} failed.</p>");
        }

        parts.Add(BookRender.SectionHeading(2, "layers", "Layers"));
        var cards = new List<string>();
        foreach (var layer in BookModel.Layers)
        {
            var present = layer.Types.Where(type => index.ByType.TryGetValue(type, out var list) && list.Count > 0).ToList();
            if (present.Count == 0)
            {
                continue;
            }

            var count = present.Sum(type => index.ByType[type].Count);
            var links = string.Join(" · ", present.Select(type => $"<a href=\"{rel}{BookModel.TypeIndexUrl(type)}\">{BookRender.Esc(BookModel.TypeLabel(type, true))}</a>"));
            cards.Add($"<div class=\"partcard\"><h3>{BookRender.Esc(layer.Name)}</h3><p>{links}</p>"
                + $"<div class=\"ft\"><span>{count} records</span></div></div>");
        }

        parts.Add($"<div class=\"partsgrid\">{string.Concat(cards)}</div>");
        return string.Join("\n", parts);
    }

    /// <summary>The search index payload: one entry per record, written to search.json and embedded in the search page.</summary>
    public static JsonArray SearchIndexPayload(BookIndex index)
    {
        var payload = new JsonArray();
        foreach (var record in index.Records)
        {
            var obj = record as JsonObject;
            var id = obj?["id"];
            var idText = id is JsonValue scalar && scalar.TryGetValue<string>(out var text) ? text ?? "" : "";
            var title = BookRender.IsTruthy(obj?["title"]) ? obj!["title"] : id;
            var entry = new JsonObject
            {
                ["id"] = id?.DeepClone(),
                ["title"] = title?.DeepClone(),
                ["type"] = obj?["type"]?.DeepClone(),
                ["url"] = BookModel.RecordUrl(idText),
            };
            payload.Add(entry);
        }

        return payload;
    }
}
