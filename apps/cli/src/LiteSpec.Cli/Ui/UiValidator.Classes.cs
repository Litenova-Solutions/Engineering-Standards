using System.Text;
using System.Text.RegularExpressions;

namespace LiteSpec.Ui;

static partial class UiValidator
{
    // Tailwind class strings are extracted from class attributes and class-merge
    // helper calls before any utility rule runs. Scanning a whole file with a
    // utility pattern reports ordinary code (`= !loading`) and prose in
    // comments, so the utility rules only see strings that reach a class attribute.
    static readonly HashSet<string> ClassHelpers = new(StringComparer.Ordinal)
    {
        "cn", "clsx", "cva", "tv", "twMerge", "twJoin",
    };

    // The patterns below use RegexOptions.ECMAScript, so word boundaries and
    // word characters stay ASCII-only and match class attributes the same way on every runtime.
    static readonly Regex ClassAttribute = new(@"\b(?:className|class)\s*=\s*", RegexOptions.Compiled | RegexOptions.ECMAScript);

    static readonly Regex ClassDirective = new(@"\bclass:([^\s=/>]+)", RegexOptions.Compiled | RegexOptions.ECMAScript);

    static readonly Regex HelperCall = new(@"\b([A-Za-z_$][\w$]*)\s*\(", RegexOptions.Compiled | RegexOptions.ECMAScript);

    static readonly Regex ClassTokenSplit = new(@"\s+", RegexOptions.Compiled);

    // A bracket in a variant segment is Tailwind variant syntax, which the
    // convention allows. A bracket in the final utility segment is an arbitrary
    // value, which it does not.
    //
    // The names below are the functional variants of the Tailwind release that
    // `litespec.manifest.json` pins under `packages.npm.tailwindcss`. They compose,
    // so `group-data-[open]` and `not-has-[a]` are one variant each. A Tailwind
    // release that adds a functional variant needs this list and a fixture case;
    // until it has both, the new variant reports as an arbitrary selector rather
    // than passing unread.
    const string BracketVariant = "(?:aria|data|group|has|in|max|min|not|nth|nth-last|nth-of-type|nth-last-of-type|peer|supports)";

    static readonly Regex AllowedBracketVariant = new("^" + BracketVariant + "(?:-" + BracketVariant + ")*-\\[", RegexOptions.Compiled);

    const string Palette = "(?:red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|slate|gray|zinc|neutral|stone)";

    static readonly Regex RawPalette = new("^-?(?:text|bg|border|ring|ring-offset|outline|fill|stroke|from|via|to|divide|decoration|accent|caret|shadow|placeholder)-" + Palette + "-[0-9]{2,3}(?:/[0-9]{1,3})?$", RegexOptions.Compiled);

    static readonly Dictionary<string, string> UtilityMessages = new(StringComparer.Ordinal)
    {
        ["arbitrary"] = "arbitrary Tailwind value requires a semantic token or declared variant",
        ["important"] = "important modifier requires a declared variant",
        ["palette"] = "raw Tailwind palette value requires a semantic token",
        ["selector"] = "arbitrary selector variant requires a declared variant",
    };

    static string? Balanced(string text, int start, char open, char close)
    {
        var depth = 0;
        for (var index = start; index < text.Length; index++)
        {
            if (text[index] == open)
            {
                depth++;
            }
            else if (text[index] == close)
            {
                depth--;
                if (depth == 0)
                {
                    return text.Substring(start + 1, index - start - 1);
                }
            }
        }

        return null;
    }

    // A character class cannot see an escaped delimiter, so `"px-2 \" px-3"` ends at
    // the middle quote and every later token in the file parses against the wrong
    // boundary. The scanner honors the backslash escape the language defines, and
    // treats an unterminated quote as no literal rather than as one that runs to the
    // end of the file. A single quote inside a comment is therefore skipped instead
    // of swallowing the next real class string.
    static bool TryReadLiteral(string text, int start, out string value, out int end)
    {
        value = "";
        end = -1;
        var quote = text[start];
        var built = new StringBuilder();
        for (var index = start + 1; index < text.Length; index++)
        {
            var character = text[index];
            if (character == '\\')
            {
                if (index + 1 < text.Length)
                {
                    built.Append(text[index + 1]);
                }

                index++;
                continue;
            }

            if (character == quote)
            {
                value = built.ToString();
                end = index;
                return true;
            }

            if (character == '\n' && quote != '`')
            {
                return false;
            }

            built.Append(character);
        }

        return false;
    }

    static List<string> Literals(string region)
    {
        var found = new List<string>();
        for (var index = 0; index < region.Length; index++)
        {
            var character = region[index];
            if (character != '"' && character != '\'' && character != '`')
            {
                continue;
            }

            if (!TryReadLiteral(region, index, out var value, out var end))
            {
                continue;
            }

            found.Add(value);
            index = end;
        }

        return found;
    }

    static List<string> ClassStrings(string text)
    {
        var found = new List<string>();
        foreach (Match match in ClassAttribute.Matches(text))
        {
            var start = match.Index + match.Length;
            if (start >= text.Length)
            {
                continue;
            }

            var opener = text[start];
            if (opener == '"' || opener == '\'' || opener == '`')
            {
                if (TryReadLiteral(text, start, out var literal, out _))
                {
                    found.Add(literal);
                }

                continue;
            }

            if (opener == '{')
            {
                var region = Balanced(text, start, '{', '}');
                if (region is not null)
                {
                    found.AddRange(Literals(region));
                }
            }
        }

        // A Svelte class directive toggles one class by name, so the name is read as
        // a single token. A name the compiler rejects never reaches this check,
        // because no committed file carries code that does not compile.
        foreach (Match match in ClassDirective.Matches(text))
        {
            found.Add(match.Groups[1].Value);
        }

        // Every call expression matches first and the helper set filters the rest. A
        // call the set does not name contributes no class string.
        foreach (Match match in HelperCall.Matches(text))
        {
            if (!ClassHelpers.Contains(match.Groups[1].Value))
            {
                continue;
            }

            var region = Balanced(text, match.Index + match.Length - 1, '(', ')');
            if (region is not null)
            {
                found.AddRange(Literals(region));
            }
        }

        return found;
    }

    static List<string> SplitVariants(string token)
    {
        var segments = new List<string>();
        var depth = 0;
        var current = new StringBuilder();
        foreach (var character in token)
        {
            if (character == '[')
            {
                depth++;
            }

            if (character == ']')
            {
                depth--;
            }

            if (character == ':' && depth == 0)
            {
                segments.Add(current.ToString());
                current.Clear();
                continue;
            }

            current.Append(character);
        }

        segments.Add(current.ToString());
        return segments;
    }

    static void InspectClassString(string value, Action<string, string> report, bool variants = true)
    {
        // An arbitrary variant declares context rather than a value, so it is a drift
        // in authored feature code and an ordinary declaration inside a shared
        // composite. Only the caller knows which it is reading.
        foreach (var token in ClassTokenSplit.Split(value))
        {
            if (token.Length == 0 || token.Contains("${", StringComparison.Ordinal))
            {
                continue;
            }

            if (token.StartsWith('!') || token.EndsWith('!'))
            {
                report("important", token);
            }

            var stripped = token.StartsWith('!') ? token[1..] : token;
            stripped = stripped.EndsWith('!') ? stripped[..^1] : stripped;
            var segments = SplitVariants(stripped);
            var utility = segments[^1];
            segments.RemoveAt(segments.Count - 1);
            if (variants)
            {
                foreach (var variant in segments)
                {
                    if (variant.Contains('[') && !AllowedBracketVariant.IsMatch(variant))
                    {
                        report("selector", token);
                    }
                }
            }

            if (utility.Contains('['))
            {
                report("arbitrary", token);
            }

            if (RawPalette.IsMatch(utility))
            {
                report("palette", token);
            }
        }
    }
}
