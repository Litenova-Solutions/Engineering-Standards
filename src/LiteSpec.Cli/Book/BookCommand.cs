using System.Globalization;
using System.Text;
using System.Text.Json.Nodes;

namespace LiteSpec.Book;

/// <summary>One page the generator writes: its URL, title, content and shell options.</summary>
/// <param name="Url">The page's path below the output folder.</param>
/// <param name="Title">The page title.</param>
/// <param name="Main">The page's main content.</param>
/// <param name="Active">The navigation item marked current.</param>
/// <param name="Wide">Whether the page uses the wide layout.</param>
/// <param name="BodyClass">The body element's class.</param>
sealed record BookPage(string Url, string Title, string Main, string Active, bool Wide, string BodyClass);

/// <summary>
///     The <c>litespec book</c> command: generate the project book, a static site
///     from a consumer's model.json. A port of <c>tools/book/book.mjs</c>.
/// </summary>
static class BookCommand
{
    /// <summary>The command's usage text.</summary>
    public const string Usage =
        "Usage: litespec book --model <model.json> --out <folder> [--findings <file>]\n"
        + "\n"
        + "Options:\n"
        + "  --model <file>     The model.json written by the model builder (required).\n"
        + "  --out <folder>     The folder to write the static site to (required).\n"
        + "  --findings <file>  The JSON output of the model check, for the review page.\n";

    static readonly Encoding Utf8NoBom = new UTF8Encoding(false);

    /// <summary>Runs the command with the arguments after <c>book</c>; returns the exit code.</summary>
    public static int Run(string[] args)
    {
        var parsed = ParseArgs(args);
        if (parsed.Help)
        {
            Console.Out.Write(Usage);
            return 0;
        }

        if (parsed.Error is not null)
        {
            Console.Error.Write($"{parsed.Error}\n{Usage}");
            return 2;
        }

        JsonNode? model;
        try
        {
            model = ReadJson(parsed.Model!);
        }
        catch (Exception exception)
        {
            Console.Error.Write($"Cannot read model '{parsed.Model}': {exception.Message}\n");
            return 1;
        }

        if (model is not JsonObject store || store["records"] is not JsonArray)
        {
            Console.Error.Write($"Model '{parsed.Model}' holds no records array.\n");
            return 1;
        }

        JsonNode? findingsFile = null;
        if (parsed.Findings is not null)
        {
            try
            {
                findingsFile = ReadJson(parsed.Findings);
            }
            catch (Exception exception)
            {
                Console.Error.Write($"Cannot read findings '{parsed.Findings}': {exception.Message}\n");
                return 1;
            }
        }
        else if (store["findings"] is { } embedded && BookRender.IsTruthy(embedded) && embedded is JsonObject or JsonArray)
        {
            findingsFile = embedded;
        }

        var index = BookModel.BuildIndex(store);
        var generatedDate = DateTimeOffset.UtcNow.ToString("yyyy-MM-dd'T'HH:mm:ss.fff'Z'", CultureInfo.InvariantCulture);
        var review = BookModel.ReviewData(index, findingsFile, generatedDate);

        var pages = new List<BookPage>();
        var searchEntries = BookPages.SearchIndexPayload(index);
        pages.Add(new BookPage("index.html", "Project book", BookPages.RenderHome(index, ""), "home", true, ""));
        pages.Add(new BookPage("search.html", "Search · Project book", BookPages.RenderSearch("", searchEntries), "search", false, ""));
        pages.Add(new BookPage("glossary.html", "Glossary · Project book", BookPages.RenderGlossary(index, ""), "glossary", false, ""));
        pages.Add(new BookPage("review/index.html", "Review · Project book",
            BookPages.RenderReview(index, "../", review, generatedDate), "review", true, "review-always"));
        pages.Add(new BookPage("lens/index.html", "Lenses · Project book", BookPages.RenderLensIndex(index, "../"), "lens-index", false, ""));

        foreach (var type in index.ByType.Keys.OrderBy(key => key, StringComparer.Ordinal))
        {
            var url = BookModel.TypeIndexUrl(type);
            pages.Add(new BookPage(url, $"{BookModel.TypeLabel(type, true)} · Project book",
                BookPages.RenderTypeIndex(index, BookModel.RelFor(url), type), $"type:{type}", true, ""));
        }

        foreach (var record in index.Records.OfType<JsonObject>())
        {
            if (BookRender.StrProp(record, "id") is not { } id || !id.Contains('/'))
            {
                continue;
            }

            var url = BookModel.RecordUrl(id);
            pages.Add(new BookPage(url, $"{BookModel.SortTitle(record)} · Project book",
                BookPages.RenderRecord(index, BookModel.RelFor(url), record, review), $"type:{BookRender.PropText(record, "type")}", false, ""));
        }

        var actors = index.ByType.TryGetValue("actor", out var found) ? found : [];
        foreach (var actor in actors)
        {
            if (BookRender.StrProp(actor, "id") is not { } actorId)
            {
                continue;
            }

            var url = BookModel.LensUrl(actorId);
            pages.Add(new BookPage(url, $"{BookRender.PropText(actor, "title")} · Lens · Project book",
                BookPages.RenderLens(index, BookModel.RelFor(url), actor), actorId, false, ""));
        }

        try
        {
            foreach (var page in pages)
            {
                var rel = BookModel.RelFor(page.Url);
                var nav = BookRender.RenderNav(index, review, page.Active, rel);
                var html = BookRender.Shell(rel, page.Title, nav, page.Main, page.Wide, page.BodyClass);
                var file = Path.Combine(parsed.Out!, page.Url.Replace('/', Path.DirectorySeparatorChar));
                Directory.CreateDirectory(Path.GetDirectoryName(file)!);
                File.WriteAllText(file, html + "\n", Utf8NoBom);
            }

            Directory.CreateDirectory(Path.Combine(parsed.Out!, "assets"));
            WriteAsset(parsed.Out!, "book.css");
            WriteAsset(parsed.Out!, "book.js");
            File.WriteAllText(Path.Combine(parsed.Out!, "search.json"), BookRender.JsonIndented(searchEntries) + "\n", Utf8NoBom);
        }
        catch (Exception exception)
        {
            Console.Error.Write($"Cannot write to '{parsed.Out}': {exception.Message}\n");
            return 1;
        }

        Console.Out.Write($"{parsed.Out}: {pages.Count} pages, {index.Records.Count} records.\n");
        return 0;
    }

    sealed record Parsed(bool Help, string? Error, string? Model, string? Out, string? Findings);

    static Parsed ParseArgs(string[] argv)
    {
        string? model = null;
        string? output = null;
        string? findings = null;
        for (var position = 0; position < argv.Length; position++)
        {
            var arg = argv[position];
            if (arg is "--help" or "-h")
            {
                return new Parsed(true, null, null, null, null);
            }

            if (arg is "--model" or "--out" or "--findings")
            {
                var value = position + 1 < argv.Length ? argv[position + 1] : null;
                if (value is null or { Length: 0 } || value.StartsWith("--", StringComparison.Ordinal))
                {
                    return new Parsed(false, $"Option {arg} needs a value.", null, null, null);
                }

                if (arg == "--model")
                {
                    model = value;
                }
                else if (arg == "--out")
                {
                    output = value;
                }
                else
                {
                    findings = value;
                }

                position += 1;
            }
            else
            {
                return new Parsed(false, $"Unknown argument '{arg}'.", null, null, null);
            }
        }

        if (model is null)
        {
            return new Parsed(false, "Missing --model <model.json>.", null, null, null);
        }

        if (output is null)
        {
            return new Parsed(false, "Missing --out <folder>.", null, null, null);
        }

        return new Parsed(false, null, model, output, findings);
    }

    static JsonNode? ReadJson(string path) => JsonNode.Parse(File.ReadAllText(path));

    static void WriteAsset(string outDir, string name)
    {
        using var stream = typeof(BookCommand).Assembly.GetManifestResourceStream($"LiteSpec.Book.Assets.{name}")
            ?? throw new InvalidOperationException($"Missing embedded asset '{name}'.");
        using var file = File.Create(Path.Combine(outDir, "assets", name));
        stream.CopyTo(file);
    }
}
