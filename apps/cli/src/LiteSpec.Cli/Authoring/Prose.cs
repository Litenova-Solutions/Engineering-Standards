using System.Text.RegularExpressions;

namespace LiteSpec.Authoring;

/// <summary>
///     The controlled technical prose measures both validators run.
/// </summary>
static partial class Prose
{
    /// <summary>
    ///     The prose limits from the authoring standard: sentence, list-sentence, table-cell and paragraph lengths.
    /// </summary>
    public const int SentenceLimit = 25, ListSentenceLimit = 20, TableCellLimit = 20, ParagraphSentenceLimit = 6;

    /// <summary>
    ///     Every diagnostic code the prose measures report.
    /// </summary>
    public static readonly IReadOnlyList<string> DiagnosticCodes =
    [
        "PROSE_AND_OR",
        "PROSE_CONTRACTION",
        "PROSE_LIST_LENGTH",
        "PROSE_PARAGRAPH_LENGTH",
        "PROSE_SENTENCE_LENGTH",
        "PROSE_TABLE_CELL_LENGTH",
        "PROSE_VAGUE_TERM",
    ];

    /// <summary>
    ///     Every diagnostic code the language checks report.
    /// </summary>
    public static readonly IReadOnlyList<string> LanguageDiagnosticCodes =
    [
        "LANGUAGE_MANNERED_TERM",
        "LANGUAGE_REJECTED_SYNONYM",
    ];

    /// <summary>
    ///     The vague terms no page may use, in check order.
    /// </summary>
    public static readonly IReadOnlyList<string> VagueTerms =
    [
        "etc.",
        "and so on",
        "as appropriate",
        "as needed",
        "simply",
        "just",
        "basically",
        "obvious",
        "clearly",
        "very",
        "really",
    ];

    /// <summary>
    ///     The contractions no page may use, in the order the reference lists them.
    /// </summary>
    public static readonly IReadOnlyList<string> Contractions =
    [
        "ain't", "aren't", "can't", "couldn't", "didn't", "doesn't", "don't", "hadn't", "hasn't", "haven't",
        "he'd", "he'll", "he's", "how'd", "how'll", "how's", "i'd", "i'll", "i'm", "i've",
        "isn't", "it'd", "it'll", "it's", "let's", "mightn't", "mustn't", "shan't", "she'd", "she'll",
        "she's", "shouldn't", "that's", "there'd", "there'll", "there's", "they'd", "they'll", "they're", "they've",
        "wasn't", "we'd", "we'll", "we're", "we've", "weren't", "what'd", "what'll", "what're", "what's",
        "what've", "where'd", "where'll", "where's", "who'd", "who'll", "who's", "won't", "wouldn't", "you'd",
        "you'll", "you're", "you've",
    ];

    /// <summary>
    ///     The matcher for the vague "and/or" relationship.
    /// </summary>
    public static readonly Regex AndOr = new(
        @"(?<![A-Za-z0-9_])and/or(?![A-Za-z0-9_])",
        RegexOptions.IgnoreCase | RegexOptions.CultureInvariant);

    // .NET \b reaches Unicode letters, so every word boundary is written out as
    // an explicit ASCII class. Case-insensitive matches are culture-invariant,
    // so the same text reports the same diagnostics on every machine.
    const RegexOptions WordOptions = RegexOptions.IgnoreCase | RegexOptions.CultureInvariant;

    // One pattern per vague term, in the same order as VagueTerms.
    static readonly Regex[] VagueTermPatterns =
    [
        new(@"(?<![A-Za-z0-9_])etc\.", WordOptions),
        new(@"(?<![A-Za-z0-9_])and so on(?![A-Za-z0-9_])", WordOptions),
        new(@"(?<![A-Za-z0-9_])as appropriate(?![A-Za-z0-9_])", WordOptions),
        new(@"(?<![A-Za-z0-9_])as needed(?![A-Za-z0-9_])", WordOptions),
        new(@"(?<![A-Za-z0-9_])simply(?![A-Za-z0-9_])", WordOptions),
        new(@"(?<![A-Za-z0-9_])just(?![A-Za-z0-9_])", WordOptions),
        new(@"(?<![A-Za-z0-9_])basically(?![A-Za-z0-9_])", WordOptions),
        new(@"(?<![A-Za-z0-9_])obvious(?:ly)?(?![A-Za-z0-9_])", WordOptions),
        new(@"(?<![A-Za-z0-9_])clearly(?![A-Za-z0-9_])", WordOptions),
        new(@"(?<![A-Za-z0-9_])very(?![A-Za-z0-9_])", WordOptions),
        new(@"(?<![A-Za-z0-9_])really(?![A-Za-z0-9_])", WordOptions),
    ];

    // Built from Contractions so the list and the matcher cannot drift apart.
    // Declared after Contractions: same-file field initializers run in order.
    static readonly Regex ContractionPattern = new(
        "(?<![A-Za-z0-9_])(?:" + string.Join("|", Contractions) + ")(?![A-Za-z0-9_])",
        WordOptions);

    // The page's metadata block: three dashes, one JSON object, three dashes, with
    // an optional leading byte-order mark (U+FEFF). The mark is built from its
    // code point so this file stays plain ASCII.
    static readonly Regex MetadataBlock = new(
        "\\A(?:" + char.ConvertFromUtf32(0xFEFF) + ")?---\\r?\\n\\{[\\s\\S]*?\\r?\\n\\}\\r?\\n---\\r?\\n");

    // A generated region holds text the model builder wrote, so the measures do not
    // reach inside one. An opener with no closer is left alone: an unclosed region
    // is a builder defect rather than prose a page author can fix.
    static readonly Regex GeneratedRegion = new(@"<!--\s*generated:[^>]*-->[\s\S]*?<!--\s*/generated:[^>]*-->");

    static readonly Regex Newline = new(@"\r?\n");
    static readonly Regex LabelPrefix = new(@"^\s*\*\*(?:Requirement|Deviation|Rationale|Example|Default|Replacement):\*\*\s*", WordOptions);
    static readonly Regex InlineCode = new(@"`[^`]*`");
    static readonly Regex Image = new(@"!\[([^\]]*)\]\([^)]+\)");
    static readonly Regex Link = new(@"\[([^\]]+)\]\([^)]+\)");
    static readonly Regex Autolink = new(@"<https?:[^>]+>");
    static readonly Regex BareUrl = new(@"https?://\S+");
    static readonly Regex HtmlTag = new(@"<[^>]+>");
    static readonly Regex Emphasis = new(@"[*_~]");
    static readonly Regex HeadingAnchor = new(@"\{#[^}]+\}");
    static readonly Regex Whitespace = new(@"\s+");
    static readonly Regex WordPattern = new(@"[A-Za-z0-9][A-Za-z0-9@#%+&'./:-]*");
    static readonly Regex TitleAbbreviation = new(@"(?<![A-Za-z0-9_])(?:Mr|Mrs|Ms|Dr|vs)\.");
    static readonly Regex InitialLetter = new(@"(?<![A-Za-z0-9_])[A-Z]\.");
    static readonly Regex DotBeforeAlnum = new(@"\.(?=[A-Za-z0-9])");
    static readonly Regex DotInsideAlnum = new(@"(?<=[A-Za-z0-9])\.(?=[A-Za-z0-9])");
    static readonly Regex SentencePattern = new(@"[^.!?]+[.!?]+|[^.!?]+$");

    static readonly Regex Blockquote = new(@"^\s*>");

    // A blockquote opens in somebody else's voice with a straight quotation mark
    // (U+0022), a left (U+201C) or low (U+201E) double quotation mark, or a left
    // guillemet (U+00AB). The non-ASCII marks are built from code points so this
    // file stays plain ASCII.
    static readonly Regex QuotedBlockquote = new(
        "^\\s*>\\s*[\"" + char.ConvertFromUtf32(0x201C) + char.ConvertFromUtf32(0x201E) + char.ConvertFromUtf32(0x00AB) + "]");

    static readonly Regex ListItem = new(@"^\s*(?:[-*+] |\d+\.\s+)");
    static readonly Regex ListContinuation = new(@"^\s{2,}\S");
    static readonly Regex Heading = new(@"^#{1,6}\s");
    static readonly Regex HtmlLine = new(@"^\s*<");
    static readonly Regex ThematicBreak = new(@"^\s*---\s*$");
    static readonly Regex TableRow = new(@"^\s*\|");
    static readonly Regex TableSeparator = new(@"^\s*\|?\s*:?-+");

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
    ///     A page line with its 1-based number.
    /// </summary>
    sealed record NumberedLine(string Line, int Number);

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
    ///     Replaces every fenced line with an empty line, keeping the line count so reported numbers stay equal to the file's.
    /// </summary>
    /// <param name="lines">The page lines.</param>
    /// <returns>The visible lines: fence markers and fenced content blanked.</returns>
    public static string[] StripFences(string[] lines)
    {
        var result = new string[lines.Length];
        var fence = false;

        for (var index = 0; index < lines.Length; index++)
        {
            var markers = CountOccurrences(lines[index], "```");

            if (markers > 0)
            {
                if (markers % 2 == 1) fence = !fence;
                result[index] = "";
                continue;
            }

            result[index] = fence ? "" : lines[index];
        }

        return result;
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

    /// <summary>
    ///     Walks a Markdown page and reports every controlled-prose measure it breaks.
    /// </summary>
    /// <param name="relative">The repository-relative path, with forward slashes.</param>
    /// <param name="raw">The page text.</param>
    /// <param name="add">Receives each finding as (relative, line, code, message).</param>
    public static void CheckProseMeasures(string relative, string raw, Action<string, int, string, string> add)
    {
        var lines = StripFences(Newline.Split(BlankGeneratedRegions(BlankMetadata(raw))));
        var paragraph = new List<NumberedLine>();
        var list = new List<NumberedLine>();
        // The exempt columns are a property of one table, so the set resets when a
        // table ends.
        HashSet<int>? tableHeader = null;
        // A blockquote that opens with a quotation mark holds somebody else's words,
        // which a page reproduces rather than writes, so no measure reaches it. A
        // blockquote in the page's own voice is measured like any paragraph.
        var quoting = false;

        for (var index = 0; index < lines.Length; index++)
        {
            var line = lines[index];
            var number = index + 1;

            if (string.IsNullOrWhiteSpace(line))
            {
                FlushParagraph();
                FlushList();
                quoting = false;
                continue;
            }

            if (Blockquote.IsMatch(line) && (quoting || QuotedBlockquote.IsMatch(line)))
            {
                FlushParagraph();
                FlushList();
                quoting = true;
                continue;
            }

            quoting = false;

            if (ListItem.IsMatch(line))
            {
                FlushParagraph();
                FlushList();
                list.Add(new NumberedLine(line, number));
                continue;
            }

            if (list.Count > 0 && ListContinuation.IsMatch(line))
            {
                list.Add(new NumberedLine(line, number));
                continue;
            }

            FlushList();
            if (!TableRow.IsMatch(line)) tableHeader = null;

            if (Heading.IsMatch(line) || HtmlLine.IsMatch(line) || ThematicBreak.IsMatch(line))
            {
                FlushParagraph();
                continue;
            }

            if (TableRow.IsMatch(line))
            {
                FlushParagraph();

                if (!TableSeparator.IsMatch(line))
                {
                    var cells = line.Split('|')[1..^1];
                    // A table that lists refused words carries two columns the measure does
                    // not bound. The refused word itself is the row's subject, and the
                    // reason states the collision that produced it, which is longer than a
                    // cell otherwise gets. Both stay readable because the rest of the row
                    // is short. Every other table is measured as before.
                    if (tableHeader is null)
                    {
                        tableHeader = [];
                        var reasons = new HashSet<int>();

                        for (var cell = 0; cell < cells.Length; cell++)
                        {
                            if (RejectionColumn.IsMatch(cells[cell])) tableHeader.Add(cell);
                            else if (RejectionReasonColumn.IsMatch(cells[cell])) reasons.Add(cell);
                        }

                        if (tableHeader.Count > 0) foreach (var cell in reasons) tableHeader.Add(cell);
                    }

                    for (var cell = 0; cell < cells.Length; cell++)
                    {
                        if (tableHeader.Contains(cell)) continue;
                        var count = Words(cells[cell]).Count;

                        if (count > TableCellLimit)
                        {
                            add(relative, number, "PROSE_TABLE_CELL_LENGTH", $"table cell has {count} words; maximum is {TableCellLimit}: '{Excerpt(cells[cell])}'");
                        }

                        ScanTerms(cells[cell], number);
                    }
                }

                continue;
            }

            paragraph.Add(new NumberedLine(line, number));
        }

        FlushParagraph();
        FlushList();

        void ScanTerms(string value, int number)
        {
            var visible = VisibleText(value);

            for (var term = 0; term < VagueTerms.Count; term++)
            {
                if (VagueTermPatterns[term].IsMatch(visible))
                {
                    add(relative, number, "PROSE_VAGUE_TERM", $"replace vague term '{VagueTerms[term]}'");
                }
            }

            var contraction = ContractionPattern.Match(visible);

            if (contraction.Success)
            {
                add(relative, number, "PROSE_CONTRACTION", $"replace contraction '{contraction.Value}' with its full form");
            }

            if (AndOr.IsMatch(visible))
            {
                add(relative, number, "PROSE_AND_OR", "replace 'and/or' with an exact relationship");
            }
        }

        void FlushParagraph()
        {
            if (paragraph.Count == 0) return;
            var number = paragraph[0].Number;
            var value = string.Join(' ', paragraph.Select(item => item.Line));
            var found = Sentences(value);

            if (found.Count > ParagraphSentenceLimit)
            {
                add(relative, number, "PROSE_PARAGRAPH_LENGTH", $"paragraph has {found.Count} sentences; maximum is {ParagraphSentenceLimit}");
            }

            foreach (var sentence in found)
            {
                var count = Words(sentence).Count;

                if (count > SentenceLimit)
                {
                    add(relative, number, "PROSE_SENTENCE_LENGTH", $"sentence has {count} words; maximum is {SentenceLimit}: '{Excerpt(sentence)}'");
                }
            }

            ScanTerms(value, number);
            paragraph.Clear();
        }

        void FlushList()
        {
            if (list.Count == 0) return;
            var number = list[0].Number;
            var value = string.Join(' ', list.Select(item => item.Line));
            var content = ListItem.Replace(value, "");

            foreach (var sentence in Sentences(content))
            {
                var count = Words(sentence).Count;

                if (count > ListSentenceLimit)
                {
                    add(relative, number, "PROSE_LIST_LENGTH", $"list sentence has {count} words; maximum is {ListSentenceLimit}: '{Excerpt(sentence)}'");
                }
            }

            ScanTerms(value, number);
            list.Clear();
        }
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

    // Counts non-overlapping occurrences, advancing past each match.
    static int CountOccurrences(string line, string marker)
    {
        var count = 0;
        var start = 0;
        int found;

        while ((found = line.IndexOf(marker, start, StringComparison.Ordinal)) >= 0)
        {
            count++;
            start = found + marker.Length;
        }

        return count;
    }

    // The finding excerpt: the visible sentence quoted up to 120 characters.
    static string Excerpt(string sentence)
    {
        var visible = VisibleText(sentence);
        return visible.Length > 120 ? visible.Substring(0, 120) : visible;
    }
}
