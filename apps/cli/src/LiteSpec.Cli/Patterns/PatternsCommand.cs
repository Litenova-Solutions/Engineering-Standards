using System.Net;
using System.Text;

namespace LiteSpec.Patterns;

/// <summary>
///     The <c>litespec patterns</c> command: draws the wireframes of the pattern pages
///     for a person to choose from. Agents read the wireframe text; the pictures are
///     for people.
/// </summary>
static class PatternsCommand
{
    /// <summary>The command's usage text.</summary>
    public const string Usage = """
        Usage: litespec patterns <preview|svg|check> [arguments] [options]

          preview <target> [--out <file>]
              Writes one offline HTML page showing every option of the target side by
              side, each at desktop and phone width, with the default marked. The target
              is a group such as record-detail, a pattern ID such as
              litespec/frontend/patterns/record-detail#record-header, or a pattern page path.
              Writes to the system temp folder unless --out names a file.

          svg <pattern-id> <option-id> [--phone]
              Prints one option's wireframe as SVG on standard output.

          check [<target>]
              Parses every pattern page, or the target's page, and reports each problem.

        Exit codes: 0 success, 1 a page or wireframe has problems, 2 usage error or unknown target.
        """;

    /// <summary>Runs the command and returns its exit code.</summary>
    public static int Run(string[] args)
    {
        var parsed = CliArgs.Parse(args, ["--phone"], ["--out"], maxPositionals: 3);

        if (parsed.Help)
        {
            Console.WriteLine(Usage);
            return 0;
        }

        if (parsed.Error is not null || parsed.Positionals.Count == 0)
        {
            Console.Error.WriteLine(parsed.Error ?? "Name a subcommand: preview, svg or check.");
            Console.Error.WriteLine(Usage);
            return 2;
        }

        var positionals = parsed.Positionals;

        return positionals[0] switch
        {
            "preview" when positionals.Count == 2 => Preview(positionals[1], parsed.Value("--out")),
            "svg" when positionals.Count == 3 => Svg(positionals[1], positionals[2], parsed.Has("--phone")),
            "check" when positionals.Count <= 2 => Check(positionals.ElementAtOrDefault(1)),
            _ => UsageError(positionals[0]),
        };
    }

    static int UsageError(string subcommand)
    {
        Console.Error.WriteLine(subcommand is "preview" or "svg" or "check"
            ? $"Wrong arguments for 'patterns {subcommand}'."
            : $"Unknown subcommand '{subcommand}'.");
        Console.Error.WriteLine(Usage);
        return 2;
    }

    static int Preview(string target, string? output)
    {
        if (Resolve(target) is not var (page, pattern) || page is null)
        {
            return 2;
        }

        var patterns = pattern is null ? page.Patterns : [pattern];
        var html = PreviewHtml(page, patterns);
        var file = output ?? Path.Combine(Path.GetTempPath(), "litespec", "patterns", $"{page.Group}{(pattern is null ? "" : "-" + pattern.Slug)}.html");
        Directory.CreateDirectory(Path.GetDirectoryName(Path.GetFullPath(file))!);
        File.WriteAllText(file, html, new UTF8Encoding(false));
        Console.WriteLine($"Wrote {Path.GetFullPath(file)}: {patterns.Count} {(patterns.Count == 1 ? "pattern" : "patterns")}, {patterns.Sum(item => item.Options.Count)} options.");
        var problems = page.Check();

        foreach (var (line, message) in problems)
        {
            Console.Error.WriteLine($"{PagePath(page.Group)}:{line}: {message}");
        }

        return problems.Count == 0 ? 0 : 1;
    }

    static int Svg(string patternId, string optionId, bool phone)
    {
        var resolved = Resolve(patternId);

        if (resolved is null)
        {
            return 2;
        }

        if (resolved.Value.Pattern is not { } pattern)
        {
            Console.Error.WriteLine($"'{patternId}' names a page, not a pattern; add #<pattern-slug>.");
            return 2;
        }

        var option = pattern.Options.FirstOrDefault(item => item.Id == optionId);

        if (option is null)
        {
            Console.Error.WriteLine($"Pattern '{pattern.Name}' has no option '{optionId}'. Options: {string.Join(", ", pattern.Options.Select(item => item.Id))}.");
            return 2;
        }

        var block = phone && option.Compact is not null ? option.Compact : option.Wireframe;

        if (block?.Parsed.Page is not { } root)
        {
            Console.Error.WriteLine($"Option '{optionId}' has no valid wireframe.");
            return 1;
        }

        Console.WriteLine(WireframeRenderer.Render(root, phone));
        return 0;
    }

    static int Check(string? target)
    {
        var pages = new List<PatternPage>();

        if (target is null)
        {
            var folder = LiteSpecHome.PathTo(PatternPage.Folder);

            foreach (var file in Directory.Exists(folder) ? Directory.GetFiles(folder, "*.md").Order(StringComparer.Ordinal).ToArray() : [])
            {
                var group = Path.GetFileNameWithoutExtension(file);

                if (group != "README")
                {
                    pages.Add(PatternPage.Parse(group, File.ReadAllText(file)));
                }
            }
        }
        else if (Resolve(target) is var (page, _) && page is not null)
        {
            pages.Add(page);
        }
        else
        {
            return 2;
        }

        var count = 0;

        foreach (var page in pages)
        {
            foreach (var (line, message) in page.Check())
            {
                Console.Error.WriteLine($"{PagePath(page.Group)}:{line}: {message}");
                count++;
            }
        }

        var options = pages.Sum(page => page.Patterns.Sum(pattern => pattern.Options.Count));
        Console.WriteLine($"Checked {pages.Count} pattern {(pages.Count == 1 ? "page" : "pages")}, {pages.Sum(page => page.Patterns.Count)} patterns, {options} options: {count} {(count == 1 ? "problem" : "problems")}.");
        return count == 0 ? 0 : 1;
    }

    static string PagePath(string group) => $"{PatternPage.Folder}/{group}.md";

    // A target is a pattern page path, a group name, or a pattern ID.
    static (PatternPage? Page, Pattern? Pattern)? Resolve(string target)
    {
        string file;
        string group;
        string? slug = null;

        if (target.EndsWith(".md", StringComparison.Ordinal) && File.Exists(target))
        {
            file = target;
            group = Path.GetFileNameWithoutExtension(target);
        }
        else
        {
            var prefix = "litespec/" + PatternPage.Folder["docs/".Length..] + "/";
            var name = target.StartsWith(prefix, StringComparison.Ordinal) ? target[prefix.Length..] : target;
            var hash = name.IndexOf('#');

            if (hash >= 0)
            {
                slug = name[(hash + 1)..];
                name = name[..hash];
            }

            group = name;
            file = LiteSpecHome.PathTo($"{PatternPage.Folder}/{name}.md");
        }

        if (!File.Exists(file))
        {
            Console.Error.WriteLine($"No pattern page for '{target}'. Pattern pages live in {PatternPage.Folder}/.");
            return null;
        }

        var page = PatternPage.Parse(group, File.ReadAllText(file));

        if (slug is null)
        {
            return (page, null);
        }

        var pattern = page.Patterns.FirstOrDefault(item => item.Slug == slug);

        if (pattern is null)
        {
            Console.Error.WriteLine($"{PagePath(group)} has no pattern '{slug}'. Patterns: {string.Join(", ", page.Patterns.Select(item => item.Slug))}.");
            return null;
        }

        return (page, pattern);
    }

    /// <summary>The offline preview page for the patterns of one page.</summary>
    public static string PreviewHtml(PatternPage page, List<Pattern> patterns)
    {
        var html = new StringBuilder();
        html.Append($$"""
            <!doctype html>
            <html lang="en">
            <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>{{E(page.Title)}}</title>
            <style>
            :root { --ink: #101828; --muted: #475467; --line: #d0d5dd; --wash: #f2f4f7; --accent: #175cd3; color-scheme: light; }
            * { box-sizing: border-box; }
            body { margin: 0; background: var(--wash); color: var(--ink); font: 15px/1.5 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; }
            header.top { padding: 28px 32px 8px; max-width: 1640px; margin: 0 auto; }
            header.top h1 { margin: 0 0 6px; font-size: 26px; }
            header.top p { margin: 0; color: var(--muted); max-width: 900px; }
            nav.toc { display: flex; flex-wrap: wrap; gap: 6px 14px; margin-top: 14px; font-size: 14px; }
            nav.toc a { color: var(--accent); }
            section.pattern { max-width: 1640px; margin: 0 auto; padding: 28px 32px; border-top: 1px solid var(--line); }
            section.pattern h2 { margin: 0 0 4px; font-size: 21px; }
            .id { font: 12px/1.4 ui-monospace, Consolas, monospace; color: var(--muted); }
            .question { max-width: 980px; margin: 10px 0 6px; }
            .meta { max-width: 980px; color: var(--muted); font-size: 14px; margin: 4px 0; }
            .options { display: grid; gap: 20px; margin-top: 18px; }
            article.option { background: #fff; border: 1px solid var(--line); border-radius: 12px; padding: 16px; }
            article.option.default { border: 2px solid var(--accent); padding: 15px; }
            article.option h3 { margin: 0; font-size: 16px; display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
            .badge { font-size: 11px; font-weight: 700; letter-spacing: .04em; text-transform: uppercase; background: var(--accent); color: #fff; border-radius: 999px; padding: 2px 8px; }
            .shots { display: grid; grid-template-columns: minmax(0, 900px) minmax(0, 300px) minmax(240px, 1fr); gap: 20px; align-items: start; margin: 12px 0 0; }
            .shots a { display: block; }
            .shots svg { width: 100%; height: auto; display: block; }
            .shots figcaption { font-size: 12px; color: var(--muted); margin-top: 4px; }
            figure { margin: 0; }
            dl { margin: 0; font-size: 14px; }
            dt { font-weight: 600; margin-top: 8px; } dt:first-child { margin-top: 0; }
            dd { margin: 2px 0 0; color: var(--muted); }
            details { margin-top: 10px; font-size: 13px; }
            pre { background: var(--wash); border-radius: 8px; padding: 10px 12px; overflow-x: auto; font: 12px/1.5 ui-monospace, Consolas, monospace; }
            .full { display: none; position: fixed; inset: 0; background: rgba(16,24,40,.6); overflow: auto; padding: 32px; z-index: 10; }
            .full:target { display: block; }
            .full > div { margin: 0 auto; width: fit-content; max-width: 100%; }
            .full svg { max-width: 100%; height: auto; display: block; box-shadow: 0 10px 40px rgba(0,0,0,.35); border-radius: 10px; }
            .full .close { display: block; color: #fff; text-align: right; margin-bottom: 8px; }
            .problems { color: #b42318; font-size: 13px; }
            @media (max-width: 1280px) { .shots { grid-template-columns: minmax(0, 3fr) minmax(0, 1fr); } .shots dl { grid-column: 1 / -1; } }
            @media (max-width: 760px) { .shots { grid-template-columns: 1fr; } header.top, section.pattern { padding-left: 16px; padding-right: 16px; } }
            </style>
            </head>
            <body>
            <header class="top">
            <h1>{{E(page.Title)}}</h1>
            <p>{{E(page.Intent)}}</p>
            <p>Each option is drawn at desktop width and at phone width. The outlined option is the default. Select a picture to see it at full size.</p>
            <nav class="toc">
            """);

        foreach (var pattern in patterns)
        {
            html.Append($"<a href=\"#{pattern.Slug}\">{E(pattern.Name)}</a>");
        }

        html.Append("</nav></header>\n");

        foreach (var pattern in patterns)
        {
            var id = $"litespec/{PatternPage.Folder["docs/".Length..]}/{page.Group}#{pattern.Slug}";
            html.Append($"<section class=\"pattern\" id=\"{pattern.Slug}\"><h2>{E(pattern.Name)}</h2><div class=\"id\">{E(id)}</div>");
            html.Append($"<p class=\"question\">{Inline(pattern.Fields.GetValueOrDefault("Question", ""))}</p>");

            if (pattern.Fields.TryGetValue("Compact", out var compact))
            {
                html.Append($"<p class=\"meta\"><strong>Compact:</strong> {Inline(compact)}</p>");
            }

            if (pattern.Fields.TryGetValue("Rationale", out var rationale))
            {
                html.Append($"<p class=\"meta\"><strong>Why the default:</strong> {Inline(rationale)}</p>");
            }

            html.Append("<div class=\"options\">");

            foreach (var option in pattern.Options)
            {
                var isDefault = option.Id == pattern.Default;
                var anchor = $"{pattern.Slug}--{option.Id}";
                html.Append($"<article class=\"option{(isDefault ? " default" : "")}\" id=\"{anchor}\"><h3>{E(option.Name)}{(isDefault ? "<span class=\"badge\">Default</span>" : "")}</h3><div class=\"id\">{E(option.Id)}</div>");

                var desktop = option.Wireframe?.Parsed.Page;
                var phoneRoot = (option.Compact ?? option.Wireframe)?.Parsed.Page;

                if (desktop is not null && phoneRoot is not null)
                {
                    var wide = WireframeRenderer.Render(desktop, phone: false);
                    var narrow = WireframeRenderer.Render(phoneRoot, phone: true);
                    html.Append("<div class=\"shots\">");
                    html.Append($"<figure><a href=\"#{anchor}--desktop\">{wide}</a><figcaption>Desktop, {WireframeRenderer.DesktopWidth} px</figcaption></figure>");
                    html.Append($"<figure><a href=\"#{anchor}--phone\">{narrow}</a><figcaption>Phone, {WireframeRenderer.PhoneWidth} px{(option.Compact is null ? "" : ", its own layout")}</figcaption></figure>");
                    AppendFields(html, option);
                    html.Append("</div>");
                    html.Append($"<div class=\"full\" id=\"{anchor}--desktop\"><div><a class=\"close\" href=\"#{anchor}\">Close</a>{wide}</div></div>");
                    html.Append($"<div class=\"full\" id=\"{anchor}--phone\"><div><a class=\"close\" href=\"#{anchor}\">Close</a>{narrow}</div></div>");
                }
                else
                {
                    var errors = new[] { option.Wireframe, option.Compact }.OfType<WireframeBlock>().SelectMany(block => block.Parsed.Errors.Select(error => $"line {block.Line + error.Line}: {error.Message}"));
                    html.Append($"<p class=\"problems\">This option cannot be drawn. {E(string.Join("; ", errors.DefaultIfEmpty("It has no wireframe block.")))}</p>");
                    AppendFields(html, option);
                }


                if (option.Wireframe is not null)
                {
                    html.Append($"<details><summary>Wireframe text</summary><pre>{E(option.Wireframe.Text)}</pre>");

                    if (option.Compact is not null)
                    {
                        html.Append($"<pre>{E(option.Compact.Text)}</pre>");
                    }

                    html.Append("</details>");
                }

                html.Append("</article>");
            }

            html.Append("</div></section>\n");
        }

        html.Append("</body>\n</html>\n");
        return html.ToString();
    }

    static void AppendFields(StringBuilder html, PatternOption option)
    {
        html.Append("<dl>");

        foreach (var field in PatternPage.OptionFields.Where(option.Fields.ContainsKey))
        {
            html.Append($"<dt>{E(field)}</dt><dd>{Inline(option.Fields[field])}</dd>");
        }

        html.Append("</dl>");
    }

    static string E(string value) => WebUtility.HtmlEncode(value);

    // Backticked spans become code; everything else is escaped text.
    static string Inline(string value)
    {
        var parts = value.Split('`');
        var output = new StringBuilder();

        for (var index = 0; index < parts.Length; index++)
        {
            output.Append(index % 2 == 1 ? $"<code>{E(parts[index])}</code>" : E(parts[index]));
        }

        return output.ToString();
    }
}
