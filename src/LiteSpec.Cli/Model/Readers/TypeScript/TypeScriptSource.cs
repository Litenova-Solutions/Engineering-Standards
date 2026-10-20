using System.Text;
using System.Text.RegularExpressions;

namespace LiteSpec.Model.Readers.TypeScript;

/// <summary>
///     What a TypeScript file says in code, with what it says in comments left out.
/// </summary>
static partial class TypeScriptSource
{
    /// <summary>One comment span.</summary>
    /// <param name="Start">The offset where it starts.</param>
    /// <param name="End">The offset where it ends.</param>
    public sealed record CommentSpan(int Start, int End);

    /// <summary>
    ///     The text with every comment replaced by spaces, keeping line breaks.
    /// </summary>
    public static string WithoutComments(string text)
    {
        var built = new StringBuilder(text);

        Lex(text, (start, end) =>
        {
            for (var index = start; index < end; index++)
            {
                if (built[index] is not ('\n' or '\r'))
                {
                    built[index] = ' ';
                }
            }
        }, (_, _) => { });

        return built.ToString();
    }

    /// <summary>
    ///     Every comment's span, in order.
    /// </summary>
    public static IReadOnlyList<CommentSpan> Comments(string text)
    {
        var found = new List<CommentSpan>();

        Lex(text, (start, end) => found.Add(new CommentSpan(start, end)), (_, _) => { });

        return found;
    }

    /// <summary>
    ///     Every string literal the code holds, comments excluded.
    /// </summary>
    public static IReadOnlyList<string> StringLiterals(string text)
    {
        var found = new List<string>();

        Lex(text, (_, _) => { }, (start, end) => found.Add(text[start..end]));

        return found;
    }

    /// <summary>
    ///     Every module a file imports for a value, in the order written.
    /// </summary>
    public static IReadOnlyList<string> ValueImports(string text)
    {
        var code = WithoutComments(text);
        var found = new List<(int At, string Specifier)>();

        foreach (Match match in StaticImport().Matches(code))
        {
            if (!IsTypeOnly(match.Groups["type"].Success, match.Groups["clause"].Value))
            {
                found.Add((match.Index, match.Groups["specifier"].Value));
            }
        }

        foreach (Match match in ReExport().Matches(code))
        {
            if (!IsTypeOnly(match.Groups["type"].Success, match.Groups["clause"].Value))
            {
                found.Add((match.Index, match.Groups["specifier"].Value));
            }
        }

        foreach (Match match in DynamicImport().Matches(code))
        {
            found.Add((match.Index, match.Groups["specifier"].Value));
        }

        return [.. found.OrderBy(entry => entry.At).Select(entry => entry.Specifier)];
    }

    private static bool IsTypeOnly(bool markedType, string clause)
    {
        if (markedType)
        {
            return true;
        }

        var open = clause.IndexOf('{');
        var close = clause.IndexOf('}');

        if (open < 0 || close < open || clause[..open].Trim().TrimEnd(',').Length > 0)
        {
            return false;
        }

        var names = clause[(open + 1)..close]
                    .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

        return names.Length > 0 && names.All(name => name.StartsWith("type ", StringComparison.Ordinal));
    }

    private static void Lex(string text, Action<int, int> comment, Action<int, int> literal)
    {
        var nesting = new Stack<int>();
        var inTemplate = false;
        var templateStart = 0;
        var templatePlain = true;
        var depth = 0;
        var previous = '\0';
        var index = 0;

        while (index < text.Length)
        {
            var character = text[index];

            if (inTemplate)
            {
                if (character == '\\')
                {
                    index += 2;

                    continue;
                }

                if (character == '`')
                {
                    if (templatePlain)
                    {
                        literal(templateStart, index);
                    }

                    inTemplate = false;
                    depth = nesting.Count > 0 ? nesting.Pop() : 0;
                    previous = '`';
                    index += 1;

                    continue;
                }

                if (character == '$' && index + 1 < text.Length && text[index + 1] == '{')
                {
                    templatePlain = false;
                    inTemplate = false;
                    nesting.Push(-1);
                    depth = 0;
                    previous = '{';
                    index += 2;

                    continue;
                }

                index += 1;

                continue;
            }

            switch (character)
            {
                case '/' when index + 1 < text.Length && text[index + 1] == '/':
                    {
                        var end = text.IndexOf('\n', index);

                        end = end < 0 ? text.Length : end;
                        comment(index, end);
                        index = end;

                        continue;
                    }

                case '/' when index + 1 < text.Length && text[index + 1] == '*':
                    {
                        var end = text.IndexOf("*/", index + 2, StringComparison.Ordinal);

                        end = end < 0 ? text.Length : end + 2;
                        comment(index, end);
                        index = end;

                        continue;
                    }

                case '<' when index + 3 < text.Length && text[index + 1] == '!' && text[index + 2] == '-' && text[index + 3] == '-':
                    {
                        var end = text.IndexOf("-->", index + 4, StringComparison.Ordinal);

                        if (end >= 0)
                        {
                            comment(index, end + 3);
                            index = end + 3;

                            continue;
                        }

                        break;
                    }

                case '/' when StartsExpression(previous):
                    index = SkipRegularExpression(text, index);
                    previous = '/';

                    continue;

                case '"' or '\'':
                    {
                        var end = index + 1;

                        while (end < text.Length && text[end] != character && text[end] != '\n')
                        {
                            end += text[end] == '\\' ? 2 : 1;
                        }

                        end = Math.Min(end, text.Length);
                        literal(index + 1, end);
                        index = end + 1;
                        previous = character;

                        continue;
                    }

                case '`':
                    nesting.Push(depth);
                    inTemplate = true;
                    templateStart = index + 1;
                    templatePlain = true;
                    index += 1;

                    continue;

                case '{':
                    depth += 1;

                    break;

                case '}':
                    if (depth == 0 && nesting.Count > 0 && nesting.Peek() == -1)
                    {
                        nesting.Pop();
                        inTemplate = true;
                        index += 1;

                        continue;
                    }

                    depth -= 1;

                    break;
            }

            if (!char.IsWhiteSpace(character))
            {
                previous = character;
            }

            index += 1;
        }
    }

    private static bool StartsExpression(char previous) =>
        previous is '\0' or '(' or ',' or '=' or ':' or '[' or '!' or '&' or '|' or '?' or '{' or '}' or ';';

    private static int SkipRegularExpression(string text, int start)
    {
        var index = start + 1;
        var inClass = false;

        while (index < text.Length && text[index] != '\n')
        {
            var character = text[index];

            if (character == '\\')
            {
                index += 2;

                continue;
            }

            if (character == '[')
            {
                inClass = true;
            }
            else if (character == ']')
            {
                inClass = false;
            }
            else if (character == '/' && !inClass)
            {
                return index + 1;
            }

            index += 1;
        }

        return index;
    }

    [GeneratedRegex(@"(?<![\w$.])import\s+(?<type>type\s+)?(?:(?<clause>[\w$*{}\s,]+?)\s+from\s+)?[""'](?<specifier>[^""'\n]+)[""']")]
    private static partial Regex StaticImport();

    [GeneratedRegex(@"(?<![\w$.])export\s+(?<type>type\s+)?(?<clause>\*(?:\s+as\s+[\w$]+)?|\{[^}]*\})\s+from\s+[""'](?<specifier>[^""'\n]+)[""']")]
    private static partial Regex ReExport();

    [GeneratedRegex(@"(?<![\w$.])import\s*\(\s*[""'](?<specifier>[^""'\n]+)[""']\s*\)")]
    private static partial Regex DynamicImport();
}
