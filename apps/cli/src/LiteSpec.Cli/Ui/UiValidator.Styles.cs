using System.Text;
using System.Text.Json.Nodes;
using System.Text.RegularExpressions;

namespace LiteSpec.Ui;

static partial class UiValidator
{
    // The shared package's entry imports Tailwind, its own token layer, and the
    // approved animation layer. Anything else is a project styling decision.
    static readonly HashSet<string> AllowedGlobalImports = new(StringComparer.Ordinal)
    {
        "tailwindcss", "tw-animate-css", "shadcn/tailwind.css",
    };

    static readonly HashSet<string> AllowedGlobalAtRules = new(StringComparer.Ordinal)
    {
        "import", "theme", "layer", "variant", "custom-variant", "plugin", "utility", "source",
        "keyframes", "font-face", "media", "supports", "container", "property", "charset", "page",
    };

    static readonly Regex GlobalImport = new(@"@import\s+([""'])([^""']+)\1", RegexOptions.Compiled);

    static readonly Regex LayerBase = new(@"^@layer\s+base\b", RegexOptions.Compiled | RegexOptions.ECMAScript);

    static readonly Regex CssBlock = new(@"\{([^}]*)\}", RegexOptions.Compiled);

    static readonly Regex CssProperty = new(@"^-?[a-z][a-z0-9-]*$", RegexOptions.Compiled | RegexOptions.IgnoreCase);

    static readonly Regex LiteralColour = new(@"\b(?:oklch|rgba?|hsla?)\(|#[0-9a-fA-F]{8}\b|#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3,4}\b", RegexOptions.Compiled | RegexOptions.ECMAScript);

    static int ReadCssString(string text, int start)
    {
        var quote = text[start];
        for (var index = start + 1; index < text.Length; index++)
        {
            var character = text[index];
            if (character == '\\')
            {
                index++;
                continue;
            }

            if (character == quote)
            {
                return index;
            }

            if (character == '\n')
            {
                return -1;
            }
        }

        return -1;
    }

    // A CSS string can carry a brace, a semicolon, or a comment opener, so counting
    // those characters without tracking the string that holds them misreads
    // `[data-state="{"]` as a block and `[data-kind="a,b"]` as two selectors. The
    // scanner removes comments and empties every string body, which leaves the
    // structure the brace check and the statement classifier read while keeping each
    // selector's shape intact.
    static string CssStructure(string text, Action<string> report)
    {
        var output = new StringBuilder(text.Length);
        var index = 0;
        while (index < text.Length)
        {
            var character = text[index];
            if (character == '/' && index + 1 < text.Length && text[index + 1] == '*')
            {
                var end = text.IndexOf("*/", index + 2, StringComparison.Ordinal);
                if (end < 0)
                {
                    report("an unterminated comment");
                    return output.ToString();
                }

                index = end + 2;
                continue;
            }

            if (character == '"' || character == '\'')
            {
                var end = ReadCssString(text, index);
                if (end < 0)
                {
                    report("an unterminated string");
                    return output.ToString();
                }

                output.Append(character).Append(character);
                index = end + 1;
                continue;
            }

            output.Append(character);
            index++;
        }

        return output.ToString();
    }

    private sealed partial class Session
    {
        public void ValidateGlobalCss(string file, string platform)
        {
            _ = platform;
            var label = RelativeToRoot(file);
            var text = File.ReadAllText(file);
            var malformed = false;
            var structure = CssStructure(text, reason =>
            {
                malformed = true;
                Errors.Add($"[litespec/frontend/web/ui#restrict-css-decisions] {label}: global CSS has {reason}");
            });
            var depth = 0;
            foreach (var character in structure)
            {
                if (character == '{')
                {
                    depth++;
                }

                if (character == '}')
                {
                    depth--;
                    if (depth < 0)
                    {
                        Errors.Add($"[litespec/frontend/web/ui#restrict-css-decisions] {label}: closing brace has no matching opening brace");
                        malformed = true;
                        break;
                    }
                }
            }

            if (!malformed && depth != 0)
            {
                Errors.Add($"[litespec/frontend/web/ui#restrict-css-decisions] {label}: global CSS has an unclosed block");
            }

            // The packages the manifest already pins. A pinned font family is a token, so
            // importing one from the token sheet is the sheet doing its job rather than a
            // project reaching for a stylesheet the sheet cannot see.
            var pinned = NpmKeys(Manifest);
            foreach (Match match in GlobalImport.Matches(text))
            {
                // The token sheet may import the Tailwind layer, the approved animation
                // layer, and any package the manifest already pins.
                var specifier = match.Groups[2].Value;
                if (AllowedGlobalImports.Contains(specifier) || specifier.StartsWith("./", StringComparison.Ordinal))
                {
                    continue;
                }

                string packageName;
                if (specifier.StartsWith("@", StringComparison.Ordinal))
                {
                    var parts = specifier.Split('/');
                    packageName = parts.Length >= 2 ? parts[0] + "/" + parts[1] : specifier;
                }
                else
                {
                    packageName = specifier.Split('/')[0];
                }

                if (!pinned.Contains(packageName))
                {
                    Errors.Add($"[litespec/frontend/web/ui#restrict-css-decisions] {label}: import '{specifier}' is outside the approved global CSS surface");
                }
            }

            ClassifyGlobalCss(label, structure);
        }

        // A top-level classifier, not a CSS parser. It reports the statements the
        // convention names as ungoverned: a class or id selector declared in the global
        // entry. It deliberately makes no claim about declarations inside a block, and
        // the repository adds no parser dependency to make one.
        public void ClassifyGlobalCss(string label, string stripped)
        {
            var depth = 0;
            var statement = new StringBuilder();

            // The generated entry expresses its documented browser base rules with
            // '@apply' inside '@layer base'. That block is accepted generated source, the
            // same way upstream utility classes in installed components are. '@apply'
            // anywhere else hides an unreviewed utility group.
            var topLevelOpener = "";
            var applyOutsideBase = false;
            foreach (var character in stripped)
            {
                if (character == '{')
                {
                    if (depth == 0)
                    {
                        topLevelOpener = statement.ToString().Trim();
                        ReportGlobalStatement(label, statement.ToString());
                    }

                    depth++;
                    statement.Clear();
                    continue;
                }

                if (character == '}')
                {
                    depth = Math.Max(0, depth - 1);
                    if (depth == 0)
                    {
                        topLevelOpener = "";
                    }

                    statement.Clear();
                    continue;
                }

                if (character == ';' && depth == 0)
                {
                    ReportGlobalStatement(label, statement.ToString());
                    statement.Clear();
                    continue;
                }

                statement.Append(character);
                if (depth > 0 && statement.ToString().Contains("@apply", StringComparison.Ordinal) && !LayerBase.IsMatch(topLevelOpener))
                {
                    applyOutsideBase = true;
                    statement.Clear();
                }
            }

            if (applyOutsideBase)
            {
                Errors.Add($"[litespec/frontend/web/ui#restrict-css-decisions] {label}: '@apply' outside the generated '@layer base' block hides an unreviewed utility group");
            }
        }

        public void ReportGlobalStatement(string label, string statement)
        {
            var value = statement.Trim();
            if (value.Length == 0)
            {
                return;
            }

            if (value.StartsWith('@'))
            {
                var rest = value[1..];
                var end = rest.Length;
                for (var index = 0; index < rest.Length; index++)
                {
                    if (char.IsWhiteSpace(rest[index]) || rest[index] == '(' || rest[index] == ';')
                    {
                        end = index;
                        break;
                    }
                }

                var name = rest[..end];
                if (!AllowedGlobalAtRules.Contains(name))
                {
                    Errors.Add($"[litespec/frontend/web/ui#restrict-css-decisions] {label}: at-rule '@{name}' is outside the approved global CSS surface");
                }

                return;
            }

            // The generated theme entry declares the color-scheme class itself.
            foreach (var selector in value.Split(','))
            {
                var trimmed = selector.Trim();
                if (trimmed is ".dark" or ".light")
                {
                    continue;
                }

                if (trimmed.StartsWith('.') || trimmed.StartsWith('#'))
                {
                    Errors.Add($"[litespec/frontend/web/ui#restrict-css-decisions] {label}: selector '{trimmed}' is a feature style; use a component variant or semantic token");
                }
            }
        }

        // An application stylesheet imports the shared package's tokens and writes any
        // value from a token. A literal color or a literal size here is a second token
        // sheet beside the first, so every declaration is held to the custom-property
        // form. A frontend holding no shared composite still declares its focus ring and
        // its device rules here, from the same tokens.
        public void ValidateFrontendStylesheet(string file, string? packageRoot, JsonNode? package, string platform)
        {
            _ = platform;
            var label = RelativeToRoot(file);
            var text = File.ReadAllText(file);
            var structure = CssStructure(text, _ => { });
            var imports = GlobalImport.Matches(text).Cast<Match>().Select(match => match.Groups[2].Value).ToList();
            if (imports.Count == 0)
            {
                Errors.Add($"[litespec/frontend/web/ui#keep-tokens-in-one-stylesheet] {label}: imports no stylesheet; an application stylesheet imports the shared package's token stylesheet");
                return;
            }

            var packageName = Child(package, "name");
            var prefix = Show(packageName) + "/";
            foreach (var value in imports)
            {
                if (value.StartsWith("./", StringComparison.Ordinal) || value.StartsWith("../", StringComparison.Ordinal))
                {
                    continue;
                }

                if (!value.StartsWith(prefix, StringComparison.Ordinal))
                {
                    Errors.Add($"[litespec/frontend/web/ui#keep-tokens-in-one-stylesheet] {label}: import '{value}' is outside the shared package '{Show(packageName)}'");
                }
            }

            foreach (Match match in CssBlock.Matches(structure))
            {
                foreach (var declaration in match.Groups[1].Value.Split(';'))
                {
                    var property = declaration.Split(':')[0].Trim();

                    // A custom property is a token. An at-rule is `@apply`, `@media`, or a
                    // variant, none of which writes a value of its own here. Anything else
                    // that reads as a CSS property is a literal the token sheet owns.
                    if (property.Length == 0 || property.StartsWith("--", StringComparison.Ordinal) || property.StartsWith('@'))
                    {
                        continue;
                    }

                    if (!CssProperty.IsMatch(property))
                    {
                        continue;
                    }

                    Errors.Add($"[litespec/frontend/web/ui#keep-tokens-in-one-stylesheet] {label}: declares '{property}'; a value written in an application belongs in the shared package's tokens");
                }
            }

            if (packageRoot is not null && !Within(Path.GetFullPath(Root), packageRoot))
            {
                Errors.Add($"[litespec/frontend/web/ui#keep-tokens-in-one-stylesheet] {label}: the shared package root '{Show(Child(package, "path"))}' is outside the workspace");
            }
        }

        // A stylesheet the shared package ships beside the token sheet carries
        // utilities, device rules, and display helpers, written from tokens. A literal
        // color here is a second token sheet beside the first, so every stylesheet but
        // the token sheet is held to the same rule as an application stylesheet.
        // (litespec/frontend/web/ui#keep-tokens-in-one-stylesheet)
        public void ValidateSharedStylesheets(string packageRoot, string tokensFile, string platform)
        {
            _ = platform;
            var tokenPath = Path.GetFullPath(tokensFile);
            foreach (var file in Walk(packageRoot, candidate => candidate.EndsWith(".css", StringComparison.Ordinal)))
            {
                if (Path.GetFullPath(file) == tokenPath)
                {
                    continue;
                }

                if (TestDir.IsMatch(file))
                {
                    continue;
                }

                var label = RelativeToRoot(file);
                var structure = CssStructure(File.ReadAllText(file), _ => { });
                var reported = new HashSet<string>(StringComparer.Ordinal);
                foreach (Match match in LiteralColour.Matches(structure))
                {
                    if (!reported.Add(match.Value))
                    {
                        continue;
                    }

                    Errors.Add($"[litespec/frontend/web/ui#keep-tokens-in-one-stylesheet] {label}: literal color '{match.Value}' belongs in the token stylesheet");
                }
            }
        }
    }
}
