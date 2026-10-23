using System.Text.RegularExpressions;

namespace LiteSpec.Authoring;

/// <summary>
///     The visible-text helpers both validators share.
/// </summary>
static partial class Prose
{
    /// <summary>
    ///     Every diagnostic code the language checks report.
    /// </summary>
    public static readonly IReadOnlyList<string> LanguageDiagnosticCodes =
    [
        "GLOSSARY_MANNERED_TERM",
        "GLOSSARY_REJECTED_SYNONYM",
    ];

    // .NET \b reaches Unicode letters, so every word boundary is written out as
    // an explicit ASCII class. Case-insensitive matches are culture-invariant,
    // so the same text reports the same diagnostics on every machine. Every
    // pattern below runs on each page of a large consumer, so each one compiles
    // once instead of interpreting on every match. Compilation changes only the
    // speed, never what matches.
    const RegexOptions WordOptions = RegexOptions.IgnoreCase | RegexOptions.CultureInvariant | RegexOptions.Compiled;

    const RegexOptions PlainOptions = RegexOptions.Compiled;

    // The page's metadata block: three dashes, one JSON object, three dashes, with
    // an optional leading byte-order mark (U+FEFF). The mark is built from its
    // code point so this file stays plain ASCII.
    static readonly Regex MetadataBlock = new(
        "\\A(?:" + char.ConvertFromUtf32(0xFEFF) + ")?---\\r?\\n\\{[\\s\\S]*?\\r?\\n\\}\\r?\\n---\\r?\\n", PlainOptions);

    // A generated region holds text the model builder wrote, so the measures do not
    // reach inside one. An opener with no closer is left alone: an unclosed region
    // is a builder defect rather than prose a page author can fix.
    static readonly Regex GeneratedRegion = new(@"<!--\s*generated:[^>]*-->[\s\S]*?<!--\s*/generated:[^>]*-->", PlainOptions);

    static readonly Regex LabelPrefix = new(@"^\s*\*\*(?:Statement|Deviation|Rationale|Example|Default|Replacement):\*\*\s*", WordOptions);
    static readonly Regex InlineCode = new(@"`[^`]*`", PlainOptions);
    static readonly Regex Image = new(@"!\[([^\]]*)\]\([^)]+\)", PlainOptions);
    static readonly Regex Link = new(@"\[([^\]]+)\]\([^)]+\)", PlainOptions);
    static readonly Regex Autolink = new(@"<https?:[^>]+>", PlainOptions);
    static readonly Regex BareUrl = new(@"https?://\S+", PlainOptions);
    static readonly Regex HtmlTag = new(@"<[^>]+>", PlainOptions);
    static readonly Regex Emphasis = new(@"[*_~]", PlainOptions);
    static readonly Regex HeadingAnchor = new(@"\{#[^}]+\}", PlainOptions);
    static readonly Regex Whitespace = new(@"\s+", PlainOptions);
    static readonly Regex WordPattern = new(@"[A-Za-z0-9][A-Za-z0-9@#%+&'./:-]*", PlainOptions);
    static readonly Regex TitleAbbreviation = new(@"(?<![A-Za-z0-9_])(?:Mr|Mrs|Ms|Dr|vs)\.", PlainOptions);
    static readonly Regex InitialLetter = new(@"(?<![A-Za-z0-9_])[A-Z]\.", PlainOptions);
    static readonly Regex DotBeforeAlnum = new(@"\.(?=[A-Za-z0-9])", PlainOptions);
    static readonly Regex DotInsideAlnum = new(@"(?<=[A-Za-z0-9])\.(?=[A-Za-z0-9])", PlainOptions);
    static readonly Regex SentencePattern = new(@"[^.!?]+[.!?]+|[^.!?]+$", PlainOptions);

    static readonly Regex TableRow = new(@"^\s*\|", PlainOptions);

    // A column that exists to list rejected words has to be able to contain them.
    // A glossary states `Avoid` beside each term and a module states
    // `Rejected synonyms`, so those cells are the rule rather than a breach of it.
    static readonly Regex RejectionColumn = new(@"^\s*(?:avoid|rejected|rejected names?|rejected synonyms?|mannered|mannered terms?)\s*$", WordOptions);

    // The column that explains a rejection has to be able to name the word it
    // explains, for the same reason. It is exempt only inside a table that already
    // carries a rejection column, so an ordinary `Reason` column elsewhere stays in
    // scope. Its length is exempt too: a reason states the collision that produced
    // the rejection, and that is longer than a table cell otherwise gets.
    static readonly Regex RejectionReasonColumn = new(@"^\s*(?:reason|reasons|why|rationale)\s*$", WordOptions);

    /// <summary>
    ///     Blanks the metadata block rather than dropping it, keeping every reported line number equal to the file's.
    /// </summary>
    /// <param name="raw">The page text.</param>
    /// <returns>The text with the metadata block replaced by spaces.</returns>
    public static string BlankMetadata(string raw)
    {
        return MetadataBlock.Replace(raw, BlankKeepingLines);
    }

    /// <summary>
    ///     Blanks every generated region rather than dropping it, keeping every reported line number equal to the file's.
    /// </summary>
    /// <param name="raw">The page text.</param>
    /// <returns>The text with generated regions replaced by spaces.</returns>
    public static string BlankGeneratedRegions(string raw)
    {
        return GeneratedRegion.Replace(raw, BlankKeepingLines);
    }

    /// <summary>
    ///     Reduces a value to the words a reader sees: inline code, link destinations and URLs each count as one word.
    /// </summary>
    /// <param name="value">The Markdown fragment.</param>
    /// <returns>The visible text.</returns>
    public static string VisibleText(string value)
    {
        value = LabelPrefix.Replace(value, "");
        value = InlineCode.Replace(value, " TOKEN ");
        value = Image.Replace(value, "$1");
        value = Link.Replace(value, "$1");
        value = Autolink.Replace(value, " URL ");
        value = BareUrl.Replace(value, " URL ");
        value = HtmlTag.Replace(value, " ");
        value = Emphasis.Replace(value, "");
        value = HeadingAnchor.Replace(value, "");
        return Whitespace.Replace(value, " ").Trim();
    }

    /// <summary>
    ///     Splits visible text into words.
    /// </summary>
    /// <param name="value">The Markdown fragment.</param>
    /// <returns>The words in order.</returns>
    public static IReadOnlyList<string> Words(string value)
    {
        return WordPattern.Matches(VisibleText(value)).Select(match => match.Value).ToList();
    }

    /// <summary>
    ///     Splits visible text into sentences, ignoring title abbreviations, initials and dots inside words.
    /// </summary>
    /// <param name="value">The Markdown fragment.</param>
    /// <returns>The sentences in order.</returns>
    public static IReadOnlyList<string> Sentences(string value)
    {
        var text = VisibleText(value);
        text = TitleAbbreviation.Replace(text, match => match.Value.Replace(".", ""));
        text = InitialLetter.Replace(text, match => match.Value.Replace(".", ""));
        text = DotBeforeAlnum.Replace(text, "");
        text = DotInsideAlnum.Replace(text, "");
        text = text.Trim();

        if (text.Length == 0) return [];

        return SentencePattern.Matches(text).Select(match => match.Value.Trim()).Where(sentence => sentence.Length > 0).ToList();
    }

    // Blanks a match while keeping its line breaks, so reported line numbers still
    // map to the file.
    static string BlankKeepingLines(Match match)
    {
        var chars = match.Value.ToCharArray();

        for (var index = 0; index < chars.Length; index++)
        {
            if (chars[index] != '\n') chars[index] = ' ';
        }

        return new string(chars);
    }
}
