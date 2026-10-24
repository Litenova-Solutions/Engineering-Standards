using System.Globalization;
using System.Text;
using System.Text.Encodings.Web;
using System.Text.Json;
using System.Text.Json.Nodes;

namespace LiteSpec.Book;

/// <summary>
///     Shared HTML for the book generator: escaping, the page shell and navigation,
///     plus the value semantics (truthiness, string coercion, locale comparison) the pages need.
/// </summary>
static class BookRender
{
    /// <summary>
    ///     The English collation the generator sorts with, backed by the "en" culture.
    /// </summary>
    public static readonly CompareInfo Locale = CultureInfo.GetCultureInfo("en").CompareInfo;

    static readonly JsonSerializerOptions CompactJson = new() { Encoder = JavaScriptEncoder.UnsafeRelaxedJsonEscaping };

    /// <summary>Compares two strings with English collation.</summary>
    public static int LocaleCompare(string left, string right) => Locale.Compare(left, right, CompareOptions.None);

    /// <summary>An <see cref="IComparer{T}"/> that compares strings with <see cref="LocaleCompare"/>.</summary>
    public static IComparer<string> LocaleComparer { get; } = Comparer<string>.Create(LocaleCompare);

    /// <summary>
    ///     Coerces a value to its display string: missing values become the empty string,
    ///     arrays join with commas, objects become <c>[object Object]</c>.
    /// </summary>
    public static string Str(JsonNode? value)
    {
        return value switch
        {
            null => "",
            JsonValue scalar when scalar.TryGetValue<string>(out var text) => text ?? "",
            JsonValue scalar => scalar.ToJsonString(),
            JsonArray items => string.Join(",", items.Select(Str)),
            JsonObject => "[object Object]",
            _ => "",
        };
    }

    /// <summary>
    ///     A property read for display: a missing property is
    ///     <c>undefined</c>, a JSON null is <c>null</c>, anything else coerces.
    /// </summary>
    public static string PropText(JsonObject? obj, string name)
    {
        if (obj is null || !obj.TryGetPropertyValue(name, out var value))
        {
            return "undefined";
        }

        return value is null ? "null" : Str(value);
    }

    /// <summary>Tests presence: missing, empty-string, zero, false and NaN values are falsy, everything else is truthy.</summary>
    public static bool IsTruthy(JsonNode? value)
    {
        return value switch
        {
            null => false,
            JsonValue scalar when scalar.TryGetValue<bool>(out var flag) => flag,
            JsonValue scalar when scalar.TryGetValue<string>(out var text) => (text?.Length ?? 0) > 0,
            JsonValue scalar when scalar.TryGetValue<double>(out var number) => number != 0 && !double.IsNaN(number),
            JsonValue => true,
            JsonArray => true,
            JsonObject => true,
            _ => false,
        };
    }

    /// <summary>Whether the value holds the boolean <c>true</c>.</summary>
    public static bool IsTrue(JsonNode? value) =>
        value is JsonValue scalar && scalar.TryGetValue<bool>(out var flag) && flag;

    /// <summary>Coerces a value to a string, or returns the fallback when it is falsy.</summary>
    public static string OrStr(JsonNode? value, string fallback) => IsTruthy(value) ? Str(value) : fallback;

    /// <summary>Escapes the five HTML metacharacters.</summary>
    public static string Esc(string? value)
    {
        if (string.IsNullOrEmpty(value))
        {
            return "";
        }

        var built = new StringBuilder(value.Length);
        foreach (var ch in value)
        {
            switch (ch)
            {
                case '&': built.Append("&amp;"); break;
                case '<': built.Append("&lt;"); break;
                case '>': built.Append("&gt;"); break;
                case '"': built.Append("&quot;"); break;
                case '\'': built.Append("&#39;"); break;
                default: built.Append(ch); break;
            }
        }

        return built.ToString();
    }

    /// <summary>Coerces a JSON value with <see cref="Str"/> and escapes it.</summary>
    public static string Esc(JsonNode? value) => Esc(Str(value));

    /// <summary>Coerces a value with a fallback and escapes it for HTML.</summary>
    public static string EscOr(JsonNode? value, string fallback) => Esc(OrStr(value, fallback));

    /// <summary>Serializes a value as compact JSON.</summary>
    public static string JsonCompact(JsonNode? value) => JsonSerializer.Serialize(value, CompactJson);

    /// <summary>Serializes a value as indented JSON.</summary>
    public static string JsonIndented(JsonNode? value) => JsonSerializer.Serialize(value, CliJson.Options);

    /// <summary>Reads a string property, or null when it is missing or not a string.</summary>
    public static string? StrProp(JsonObject? obj, string name) =>
        obj?[name] is JsonValue scalar && scalar.TryGetValue<string>(out var text) ? text : null;

    /// <summary>Reads a record's <c>fields</c> object, or null when it is missing or not an object.</summary>
    public static JsonObject? Fields(JsonObject? record) => record?["fields"] as JsonObject;

    /// <summary>Reads a record's <c>links</c> object, or null when it is missing or not an object.</summary>
    public static JsonObject? Links(JsonObject? record) => record?["links"] as JsonObject;

    /// <summary>The font links every page carries in its head.</summary>
    public static string FontsLink()
    {
        return "<link rel=\"preconnect\" href=\"https://fonts.gstatic.com\" crossorigin>\n"
            + "<link href=\"https://fonts.googleapis.com/css2?family=Geist:wght@300..800&family=Geist+Mono:wght@400;500&family=Source+Serif+4:ital,opsz,wght@0,8..60,400..700;1,8..60,400&display=swap\" rel=\"stylesheet\">";
    }

    /// <summary>Wraps a page's navigation and main content in the site shell.</summary>
    public static string Shell(string rel, string title, string nav, string main, bool wide = false, string bodyClass = "", string searchQuery = "", bool withMermaid = false)
    {
        return "<!doctype html>\n"
            + "<html lang=\"en\" data-theme=\"light\">\n"
            + "<head>\n"
            + "<meta charset=\"utf-8\">\n"
            + "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n"
            + $"<title>{Esc(title)}</title>\n"
            + $"{FontsLink()}\n"
            + $"<link rel=\"stylesheet\" href=\"{rel}assets/book.css\">\n"
            + "</head>\n"
            + $"<body class=\"{bodyClass}\">\n"
            + "<a class=\"skip\" href=\"#main\">Skip to content</a>\n"
            + "<header class=\"top\">\n"
            + "<button class=\"iconbtn navtoggle\" id=\"navToggle\" aria-label=\"Open navigation\" aria-expanded=\"false\">&#9776;</button>\n"
            + $"<a class=\"brand\" href=\"{rel}index.html\"><span class=\"logo\">B</span> Project book</a>\n"
            + $"<form class=\"search\" action=\"{rel}search.html\" method=\"get\" role=\"search\">\n"
            + "<label class=\"visually-hidden\" for=\"q\">Search records</label>\n"
            + $"<input id=\"q\" name=\"q\" type=\"search\" placeholder=\"Search the specification\" value=\"{Esc(searchQuery)}\" autocomplete=\"off\">\n"
            + "</form>\n"
            + "<div class=\"topbtns\">\n"
            + "<button class=\"segbtn\" id=\"devToggle\" aria-pressed=\"false\" title=\"Show identifiers, codes, file paths and check names\">Developer</button>\n"
            + "<button class=\"segbtn\" id=\"reviewToggle\" aria-pressed=\"false\" title=\"Show review notes on every page\">Review</button>\n"
            + "<button class=\"iconbtn\" id=\"themeToggle\" title=\"Light or dark\" aria-label=\"Toggle light or dark\">&#9681;</button>\n"
            + "</div>\n"
            + "</header>\n"
            + "<div class=\"layout\">\n"
            + $"<nav class=\"nav\" id=\"nav\" aria-label=\"Book\">{nav}</nav>\n"
            + $"<main class=\"main\" id=\"main\"><div class=\"page{(wide ? " wide" : "")}\">{main}</div></main>\n"
            + "</div>\n"
            + (withMermaid ? $"<script src=\"{rel}assets/mermaid.min.js\" defer></script>\n" : "")
            + $"<script src=\"{rel}assets/book.js\" defer></script>\n"
            + "</body>\n"
            + "</html>\n";
    }

    /// <summary>Renders the site navigation, marking <paramref name="active"/> as current.</summary>
    public static string RenderNav(BookIndex index, ReviewBundle review, string active, string rel)
    {
        var parts = new List<string>();
        var reviewCount = review.Gaps.Count + review.WithDecider.Count + review.WithoutDecider.Count + review.Questions.Count + review.Findings.Count;
        parts.Add("<h2>Book</h2>");
        parts.Add($"<a class=\"navitem{(active == "home" ? " on" : "")}\" href=\"{rel}index.html\">Home</a>");
        parts.Add($"<a class=\"navitem{(active == "search" ? " on" : "")}\" href=\"{rel}search.html\">Search</a>");
        parts.Add($"<a class=\"navitem{(active == "ballots" ? " on" : "")}\" href=\"{rel}{BookModel.BallotsUrl()}\">Ballots <span class=\"count{(review.Questions.Count != 0 ? " hot" : "")}\">{review.Questions.Count}</span></a>");
        parts.Add($"<a class=\"navitem{(active == "review" ? " on" : "")}\" href=\"{rel}review/index.html\">Review <span class=\"count{(reviewCount != 0 ? " hot" : "")}\">{reviewCount}</span></a>");
        parts.Add($"<a class=\"navitem{(active == "glossary" ? " on" : "")}\" href=\"{rel}glossary.html\">Glossary</a>");
        var actors = index.ByType.TryGetValue("actor", out var found) ? found : [];
        parts.Add("<h2>Lenses</h2>");
        parts.Add($"<a class=\"navitem{(active == "lens-index" ? " on" : "")}\" href=\"{rel}lens/index.html\">All lenses</a>");
        foreach (var actor in actors)
        {
            var url = $"{rel}{BookModel.LensUrl(StrProp(actor, "id") ?? "")}";
            parts.Add($"<a class=\"navitem{(active == StrProp(actor, "id") ? " on" : "")}\" href=\"{url}\">{Esc(actor["title"])}</a>");
        }

        var goals = index.ByType.TryGetValue("goal", out var goalList) ? goalList : [];
        if (goals.Count > 0)
        {
            parts.Add("<h2>Goals</h2>");
            parts.Add($"<a class=\"navitem{(active == "goal-index" ? " on" : "")}\" href=\"{rel}goals/index.html\">All goals</a>");
            foreach (var goal in goals)
            {
                var url = $"{rel}{BookModel.GoalUrl(StrProp(goal, "id") ?? "")}";
                parts.Add($"<a class=\"navitem{(active == StrProp(goal, "id") ? " on" : "")}\" href=\"{url}\">{Esc(goal["title"])}</a>");
            }
        }

        foreach (var layer in BookModel.Layers)
        {
            var present = layer.Types.Where(type => index.ByType.TryGetValue(type, out var list) && list.Count > 0).ToList();
            if (present.Count == 0)
            {
                continue;
            }

            parts.Add($"<h2>{Esc(layer.Name)}</h2>");
            foreach (var type in present)
            {
                var count = index.ByType[type].Count;
                var url = $"{rel}{BookModel.TypeIndexUrl(type)}";
                var on = active == $"type:{type}" ? " on" : "";
                parts.Add($"<a class=\"navitem{on}\" href=\"{url}\">{Esc(BookModel.TypeLabel(type, true))} <span class=\"count\">{count}</span></a>");
            }
        }

        return string.Join("\n", parts);
    }

    /// <summary>Renders a record-status chip.</summary>
    public static string StatusChip(string? status)
    {
        if (status == "approved")
        {
            return "<span class=\"chip ok\">Approved</span>";
        }

        if (status == "reviewed")
        {
            return "<span class=\"chip ok\">Reviewed</span>";
        }

        if (status == "retired")
        {
            return "<span class=\"chip\">Retired</span>";
        }

        if (status == "draft")
        {
            return "<span class=\"chip warn\">Draft</span>";
        }

        return "<span class=\"chip\">No status</span>";
    }

    /// <summary>
    ///     Renders a link to a record: its title for every reader, its id for developers only.
    ///     An id that resolves to nothing shows words to reviewers and the id to developers.
    ///     A step or operation id links its carrying record, keeping the fragment in the link target.
    /// </summary>
    public static string RecordLink(BookIndex index, string rel, string id)
    {
        if (index.ById.TryGetValue(id, out var record))
        {
            return $"<a href=\"{rel}{BookModel.RecordUrl(id)}\">{Esc(record["title"])}</a> <span class=\"mono dim dev-only\">{Esc(id)}</span>";
        }

        var hash = id.IndexOf('#');
        if (hash > 0 && index.ById.TryGetValue(id[..hash], out var carrier))
        {
            return $"<a href=\"{rel}{BookModel.RecordUrl(id)}\">{Esc(carrier["title"])}</a> <span class=\"mono dim dev-only\">{Esc(id)}</span>";
        }

        return $"<span class=\"dev-only\"><code>{Esc(id)}</code></span><span class=\"reviewer-only\">a missing record</span>";
    }

    /// <summary>Renders a link to a record id held in a JSON value.</summary>
    public static string RecordLink(BookIndex index, string rel, JsonNode? id) =>
        id is JsonValue scalar && scalar.TryGetValue<string>(out var text) && text is not null
            ? RecordLink(index, rel, text)
            : $"<code>{Esc(id)}</code>";

    /// <summary>
    ///     Renders a value that may name a record or state words: a link when it resolves
    ///     to a record, words as written otherwise.
    /// </summary>
    public static string MaybeRecordLink(BookIndex index, string rel, string text)
    {
        if (text.Contains('/') || index.ById.ContainsKey(text))
        {
            return RecordLink(index, rel, text);
        }

        return Esc(text);
    }

    /// <summary>Renders a page header: kind line, title, optional lede, chips and facts.</summary>
    public static string PageHeader(string kind, string title, string lede = "", IReadOnlyList<(string Term, string Value)>? facts = null, IReadOnlyList<string>? chips = null)
    {
        chips ??= [];
        facts ??= [];
        var chipsHtml = chips.Count > 0 ? $"<div class=\"chips\">{string.Concat(chips)}</div>" : "";
        var factsHtml = facts.Count > 0
            ? $"<dl class=\"facts\">{string.Concat(facts.Select(fact => $"<div><dt>{Esc(fact.Term)}</dt><dd>{fact.Value}</dd></div>"))}</dl>"
            : "";
        return $"<div class=\"kind\">{Esc(kind)}</div>\n<h1 class=\"title\">{Esc(title)}</h1>\n"
            + (lede.Length > 0 ? $"<p class=\"lede\">{Esc(lede)}</p>\n" : "") + chipsHtml + factsHtml;
    }

    /// <summary>Renders a section heading with an anchor id.</summary>
    public static string SectionHeading(int level, string id, string text) =>
        $"<h{level} id=\"{Esc(id)}\">{Esc(text)}</h{level}>";
}
