using System.Text;
using System.Text.RegularExpressions;

namespace LiteSpec.Book;

/// <summary>
///     A small Markdown renderer for record bodies: headings, paragraphs, lists,
///     tables, code blocks, quotes and inline spans. It escapes everything it does
///     not generate, so a body can never inject markup.
/// </summary>
static class BookMarkdown
{
    static readonly Regex CodeSpan = new("`([^`\n]+)`", RegexOptions.Compiled);
    static readonly Regex MdLink = new(@"\[([^\]\n]+)\]\(([^)\s]+)\)", RegexOptions.Compiled);
    static readonly Regex RawUrl = new(@"(?<![""'=])\bhttps?://[^\s<]+", RegexOptions.Compiled);
    static readonly Regex Bold = new(@"\*\*([^*\n]+)\*\*", RegexOptions.Compiled);
    static readonly Regex Italic = new(@"\*([^*\n]+)\*", RegexOptions.Compiled);
    static readonly Regex RecordId = new(
        @"\b((?:product|goal|problem|feature|constraint|research|decision|requirement|journey|term|module|aggregate|rule|event|integration-event|reaction|job|notification|setting|use-case|result|scenario|actor|role|permission|entry-point|external-system|runbook|deviation|known-gap)/[A-Za-z0-9][A-Za-z0-9._-]*(?:#[A-Za-z0-9_-]+)?)",
        RegexOptions.Compiled);
    static readonly Regex Heading = new(@"^(#{1,6})\s+(.*)$", RegexOptions.Compiled);
    static readonly Regex Rule = new(@"^\s*(?:---|\*\*\*|___)\s*$", RegexOptions.Compiled);
    static readonly Regex ListItem = new(@"^(\s*)(?:[-*+]|\d+[.)])\s+(.*)$", RegexOptions.Compiled);
    static readonly Regex TableDelimiter = new(@"^\s*\|?\s*:?-{1,}:?\s*(\|\s*:?-{1,}:?\s*)*\|?\s*$", RegexOptions.Compiled);

    /// <summary>Renders Markdown to HTML fragments. Record ids link through <paramref name="linkRecord"/>.</summary>
    public static string Render(string markdown, Func<string, (string Href, string Title)?>? linkRecord = null)
    {
        var lines = markdown.Replace("\r\n", "\n").Replace('\r', '\n').Split('\n');
        var html = new StringBuilder();
        var paragraph = new List<string>();
        var index = 0;

        void Flush()
        {
            if (paragraph.Count == 0)
            {
                return;
            }

            html.Append("<p>");
            html.Append(Inline(string.Join(" ", paragraph), linkRecord));
            html.AppendLine("</p>");
            paragraph.Clear();
        }

        while (index < lines.Length)
        {
            var line = lines[index];
            if (line.Trim().Length == 0)
            {
                Flush();
                index += 1;
                continue;
            }

            if (line.TrimStart().StartsWith("```", StringComparison.Ordinal))
            {
                Flush();
                var code = new List<string>();
                index += 1;
                while (index < lines.Length && !lines[index].TrimStart().StartsWith("```", StringComparison.Ordinal))
                {
                    code.Add(lines[index]);
                    index += 1;
                }

                index += 1;
                html.Append("<pre class=\"codeblock\"><code>");
                html.Append(BookRender.Esc(string.Join("\n", code)));
                html.AppendLine("</code></pre>");
                continue;
            }

            var heading = Heading.Match(line);
            if (heading.Success)
            {
                Flush();
                var level = heading.Groups[1].Value.Length switch
                {
                    <= 2 => 3,
                    3 => 4,
                    4 => 5,
                    _ => 6,
                };
                var text = heading.Groups[2].Value.Trim();
                var slug = Slug(text);
                html.Append($"<h{level} id=\"body-{(slug.Length > 0 ? slug : "section")}\">");
                html.Append(Inline(text, linkRecord));
                html.AppendLine($"</h{level}>");
                index += 1;
                continue;
            }

            if (Rule.IsMatch(line))
            {
                Flush();
                html.AppendLine("<hr>");
                index += 1;
                continue;
            }

            if (line.TrimStart().StartsWith(">"))
            {
                Flush();
                var quote = new List<string>();
                while (index < lines.Length && lines[index].TrimStart().StartsWith(">"))
                {
                    quote.Add(lines[index].TrimStart()[1..].TrimStart());
                    index += 1;
                }

                html.Append("<blockquote><p>");
                html.Append(Inline(string.Join(" ", quote.Where(part => part.Length > 0)), linkRecord));
                html.AppendLine("</p></blockquote>");
                continue;
            }

            if (line.Contains('|') && index + 1 < lines.Length && TableDelimiter.IsMatch(lines[index + 1]))
            {
                Flush();
                html.Append(RenderTable(lines, ref index, linkRecord));
                continue;
            }

            if (ListItem.IsMatch(line))
            {
                Flush();
                html.Append(RenderList(lines, ref index, linkRecord));
                continue;
            }

            paragraph.Add(line.Trim());
            index += 1;
        }

        Flush();
        return html.ToString().TrimEnd();
    }

    static string RenderTable(string[] lines, ref int index, Func<string, (string Href, string Title)?>? linkRecord)
    {
        var head = Cells(lines[index]);
        var aligns = Cells(lines[index + 1]).Select(cell =>
        {
            var trimmed = cell.Trim();
            return trimmed.StartsWith(':') && trimmed.EndsWith(':') ? "mid"
                : trimmed.EndsWith(':') ? "num"
                : "";
        }).ToList();
        index += 2;
        var rows = new List<IReadOnlyList<string>>();
        while (index < lines.Length && lines[index].Contains('|') && lines[index].Trim().Length > 0)
        {
            rows.Add(Cells(lines[index]));
            index += 1;
        }

        var html = new StringBuilder();
        html.Append("<div class=\"tablewrap\"><table class=\"tbl\"><thead><tr>");
        for (var column = 0; column < head.Count; column++)
        {
            var align = column < aligns.Count && aligns[column].Length > 0 ? $" class=\"{aligns[column]}\"" : "";
            html.Append($"<th{align}>{Inline(head[column], linkRecord)}</th>");
        }

        html.Append("</tr></thead><tbody>");
        foreach (var row in rows)
        {
            html.Append("<tr>");
            for (var column = 0; column < head.Count; column++)
            {
                var align = column < aligns.Count && aligns[column].Length > 0 ? $" class=\"{aligns[column]}\"" : "";
                var cell = column < row.Count ? row[column] : "";
                html.Append($"<td{align}>{Inline(cell, linkRecord)}</td>");
            }

            html.Append("</tr>");
        }

        html.AppendLine("</tbody></table></div>");
        return html.ToString();
    }

    static IReadOnlyList<string> Cells(string line)
    {
        var cells = line.Trim().Trim('|').Split('|').Select(cell => cell.Trim()).ToList();
        return cells.Count == 1 && cells[0].Length == 0 ? [] : cells;
    }

    static string RenderList(string[] lines, ref int index, Func<string, (string Href, string Title)?>? linkRecord)
    {
        var ordered = char.IsDigit(lines[index].TrimStart()[0]);
        var items = new List<string>();
        while (index < lines.Length)
        {
            var match = ListItem.Match(lines[index]);
            if (match.Success)
            {
                items.Add(match.Groups[2].Value.Trim());
                index += 1;
                continue;
            }

            if (lines[index].Trim().Length > 0 && lines[index].StartsWith(' ') && items.Count > 0)
            {
                items[^1] += " " + lines[index].Trim();
                index += 1;
                continue;
            }

            break;
        }

        var tag = ordered ? "ol" : "ul";
        var html = new StringBuilder();
        html.Append($"<{tag} class=\"plain\">");
        foreach (var item in items)
        {
            html.Append($"<li>{Inline(item, linkRecord)}</li>");
        }

        html.AppendLine($"</{tag}>");
        return html.ToString();
    }

    static string Inline(string text, Func<string, (string Href, string Title)?>? linkRecord)
    {
        var escaped = BookRender.Esc(text);
        var codes = new List<string>();
        escaped = CodeSpan.Replace(escaped, match =>
        {
            codes.Add($"<code>{match.Groups[1].Value}</code>");
            return $"\u0000C{codes.Count - 1}\u0000";
        });

        var links = new List<string>();
        escaped = MdLink.Replace(escaped, match =>
        {
            var label = Parts(match.Groups[1].Value);
            links.Add($"<a href=\"{match.Groups[2].Value}\">{label}</a>");
            return $"\u0000L{links.Count - 1}\u0000";
        });
        escaped = RawUrl.Replace(escaped, match =>
        {
            var url = match.Value.TrimEnd('.', ',', ';', ':', '!', '?', ')');
            var tail = match.Value[url.Length..];
            links.Add($"<a href=\"{url}\">{url}</a>{tail}");
            return $"\u0000L{links.Count - 1}\u0000";
        });

        escaped = Bold.Replace(escaped, "<strong>$1</strong>");
        escaped = Italic.Replace(escaped, "<em>$1</em>");

        if (linkRecord is not null)
        {
            escaped = RecordId.Replace(escaped, match =>
            {
                var target = linkRecord(match.Groups[1].Value);
                if (target is null)
                {
                    return match.Value;
                }

                return $"<a href=\"{target.Value.Href}\"><span class=\"reviewer-only\">{BookRender.Esc(target.Value.Title)}</span>"
                    + $"<span class=\"dev-only mono\">{match.Value}</span></a>";
            });
        }

        for (var position = 0; position < links.Count; position++)
        {
            escaped = escaped.Replace($"\u0000L{position}\u0000", links[position], StringComparison.Ordinal);
        }

        for (var position = 0; position < codes.Count; position++)
        {
            escaped = escaped.Replace($"\u0000C{position}\u0000", codes[position], StringComparison.Ordinal);
        }

        return escaped;
    }

    static string Parts(string text)
    {
        text = Bold.Replace(text, "<strong>$1</strong>");
        return Italic.Replace(text, "<em>$1</em>");
    }

    static string Slug(string text)
    {
        var built = new StringBuilder();
        foreach (var ch in text.ToLowerInvariant())
        {
            if (ch is >= 'a' and <= 'z' or >= '0' and <= '9')
            {
                built.Append(ch);
            }
            else if (ch is ' ' or '-' or '_')
            {
                built.Append('-');
            }
        }

        var slug = built.ToString();
        while (slug.Contains("--", StringComparison.Ordinal))
        {
            slug = slug.Replace("--", "-", StringComparison.Ordinal);
        }

        return slug.Trim('-');
    }
}
