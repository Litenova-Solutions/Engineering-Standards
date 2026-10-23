using System.Text;
using System.Text.Json.Nodes;
using System.Text.RegularExpressions;

namespace LiteSpec.Authoring;

/// <summary>
///     The project glossary: the mannered terms and rejected synonyms both validators check.
/// </summary>
static partial class Prose
{
    static readonly Regex FenceBlock = new(@"```[\s\S]*?```", RegexOptions.Compiled);
    static readonly Regex InlineCodeSpan = new(@"`[^`\n]*`", RegexOptions.Compiled);
    static readonly Regex LinkDestination = new(@"\]\([^)\n]*\)", RegexOptions.Compiled);
    static readonly Regex RejectionTableSeparator = new(@"^\s*\|?[\s:|-]+$", RegexOptions.Compiled);
    static readonly Regex CamelBoundary = new(@"([a-z0-9])([A-Z])", RegexOptions.Compiled);
    static readonly Regex AcronymBoundary = new(@"([A-Z]+)([A-Z][a-z])", RegexOptions.Compiled);
    static readonly Regex IdentifierSeparator = new(@"[_./]", RegexOptions.Compiled);

    // The term and gate patterns run once per term on every file of a large
    // consumer, so each one compiles once. Compilation changes only the speed,
    // never what matches.
    const RegexOptions LanguageOptions = RegexOptions.IgnoreCase | RegexOptions.CultureInvariant | RegexOptions.Compiled;
    const string RegexMetacharacters = ".*+?^${}()|[]\\";

    /// <summary>
    ///     Compiles a glossary once so a scan over many files does not rebuild every pattern per file.
    /// </summary>
    /// <param name="language">The glossary.</param>
    /// <returns>The compiled record, or null when there is none.</returns>
    public static CompiledLanguage? CompileLanguage(JsonNode? language)
    {
        if (language is null) return null;
        var root = language as JsonObject;

        var mannered = new List<CompiledLanguage.ManneredTerm>();

        if (root?["mannered"] is JsonArray manneredNodes)
        {
            foreach (var node in manneredNodes)
            {
                if (node is not JsonObject entry) continue;
                if (LanguageString(entry["term"]) is not string term) continue;
                mannered.Add(new CompiledLanguage.ManneredTerm(term, LanguageText(entry["instead"]), TermPattern(term)));
            }
        }

        // Each rejected entry carries its own word, reason, scope and compounds,
        // and falls back to the scope and compounds its term declares when it
        // names none of its own.
        var rejected = new List<CompiledLanguage.RejectedSynonym>();

        if (root?["terms"] is JsonArray terms)
        {
            foreach (var node in terms)
            {
                if (node is not JsonObject entry) continue;
                var termScope = LanguageString(entry["scope"]);
                var termExcept = ExceptPatterns(entry["except"]);

                if (entry["rejected"] is not JsonArray synonyms) continue;

                foreach (var synonymNode in synonyms)
                {
                    if (synonymNode is not JsonObject synonym) continue;
                    if (LanguageString(synonym["word"]) is not string word) continue;
                    var except = synonym["except"] is JsonArray ? ExceptPatterns(synonym["except"]) : termExcept;
                    rejected.Add(new CompiledLanguage.RejectedSynonym(
                        LanguageText(entry["term"]),
                        word,
                        ScopePattern(LanguageString(synonym["scope"]) ?? termScope),
                        LanguageReason(synonym["reason"]),
                        except,
                        TermPattern(word)));
                }
            }
        }

        // One scan that proves a file or line holds no term at all, so the per-term
        // loops below run only where they can report. Every finding contains its
        // word: a raw match contains the whole term, and an opened match contains
        // the term's first word in the raw text, because opening only inserts
        // spaces and turns separators into spaces. A term with no word to hold
        // disables the gates, and the loops run as before.
        var words = mannered.Select(entry => entry.Term).Concat(rejected.Select(entry => entry.Synonym)).ToList();
        var canGate = words.All(HasWord);
        Regex? fileGate = null;
        Regex? lineGate = null;
        Regex? firstWordGate = null;

        if (canGate && words.Count > 0)
        {
            lineGate = GatePattern(words);
            var firsts = words.Where(word => word.Contains(' ')).Select(FirstWord).ToList();
            fileGate = GatePattern(words.Where(word => !word.Contains(' ')).Concat(firsts));
            if (firsts.Count > 0)
            {
                firstWordGate = GatePattern(firsts);
            }
        }

        return new CompiledLanguage(mannered, rejected, canGate, fileGate, lineGate, firstWordGate);
    }

    /// <summary>
    ///     Reports every mannered term and every rejected synonym inside its scope.
    /// </summary>
    /// <param name="relative">The documentation-root-relative path, with forward slashes; scopes match against it.</param>
    /// <param name="raw">The page text.</param>
    /// <param name="compiled">The compiled glossary, or null to skip the check.</param>
    /// <param name="add">Receives each finding as (relative, line, code, message).</param>
    public static void CheckLanguage(string relative, string raw, CompiledLanguage? compiled, Action<string, int, string, string> add)
    {
        if (compiled is null) return;
        var prose = ScannableProse(raw);

        // A page holding none of the words holds no finding: every match contains
        // its whole term.
        if (compiled.CanGate && (compiled.LineGate is null || !compiled.LineGate.IsMatch(prose)))
        {
            return;
        }

        int[]? lineStarts = null;
        int Line(int index) => LineNumber(lineStarts ??= LineStarts(prose), index);

        foreach (var entry in compiled.ManneredTerms)
        {
            foreach (Match match in entry.Pattern.Matches(prose))
            {
                add(relative, Line(match.Index), "GLOSSARY_MANNERED_TERM",
                    $"'{match.Value}' is mannered prose; state it literally, such as '{entry.Instead}'");
            }
        }

        foreach (var entry in compiled.RejectedTerms)
        {
            if (entry.Scope is not null && !entry.Scope.IsMatch(relative)) continue;
            var matches = entry.Pattern.Matches(prose);

            if (matches.Count == 0)
            {
                continue;
            }

            var exempt = entry.Except.Count > 0 ? ExemptSpans(prose, entry.Except) : null;

            foreach (Match match in matches)
            {
                if (exempt is not null && InsideExempt(exempt, match.Index, match.Index + match.Length)) continue;
                var because = entry.Reason is null ? "" : $"; {entry.Reason}";
                add(relative, Line(match.Index), "GLOSSARY_REJECTED_SYNONYM",
                    $"'{match.Value}' is a rejected synonym here; the term is '{entry.Term}'{because}");
            }
        }
    }

    /// <summary>
    ///     Reports the same two problems in a surface that is not Markdown: source, an interface dictionary, a feature file.
    /// </summary>
    /// <param name="relative">The repository-root-relative path, with forward slashes; scopes match against it.</param>
    /// <param name="raw">The file text, scanned whole: the Markdown exemptions do not apply.</param>
    /// <param name="compiled">The compiled glossary, or null to skip the check.</param>
    /// <param name="add">Receives each finding as (relative, line, code, message).</param>
    public static void CheckLanguageInSource(string relative, string raw, CompiledLanguage? compiled, Action<string, int, string, string> add)
    {
        if (compiled is null) return;

        // A scope is written against the path, so entries out of scope are dropped
        // once per file instead of once per line.
        var inScope = compiled.RejectedTerms.Where(entry => entry.Scope is null || entry.Scope.IsMatch(relative)).ToList();

        // A file holding none of the words holds no finding: every match contains
        // its term, and an opened match contains the term's first word in the raw
        // text.
        if (compiled.CanGate && (compiled.FileGate is null || !compiled.FileGate.IsMatch(raw)))
        {
            return;
        }

        var lines = raw.Split('\n');

        for (var index = 0; index < lines.Length; index++)
        {
            var line = lines[index];
            string? opened = null;

            if (compiled.CanGate)
            {
                if (compiled.LineGate is null || !compiled.LineGate.IsMatch(line))
                {
                    // A single-word hit in the opened line implies the word in the
                    // raw line, so only a multi-word term can still match there.
                    if (compiled.FirstWordGate is null || !compiled.FirstWordGate.IsMatch(line))
                    {
                        continue;
                    }

                    opened = OpenIdentifiers(line);

                    if (compiled.LineGate is null || !compiled.LineGate.IsMatch(opened))
                    {
                        continue;
                    }
                }
            }

            opened ??= OpenIdentifiers(line);
            var seen = new HashSet<string>(StringComparer.Ordinal);

            Scan(line);
            if (!string.Equals(opened, line, StringComparison.Ordinal)) Scan(opened);

            void Scan(string text)
            {
                foreach (var entry in compiled.ManneredTerms)
                {
                    foreach (Match match in entry.Pattern.Matches(text))
                    {
                        if (!seen.Add("m:" + match.Value.ToLowerInvariant())) continue;
                        add(relative, index + 1, "GLOSSARY_MANNERED_TERM",
                            $"'{match.Value}' is mannered prose; state it literally, such as '{entry.Instead}'");
                    }
                }

                foreach (var entry in inScope)
                {
                    var matches = entry.Pattern.Matches(text);

                    if (matches.Count == 0)
                    {
                        continue;
                    }

                    var exempt = entry.Except.Count > 0 ? ExemptSpans(text, entry.Except) : null;

                    foreach (Match match in matches)
                    {
                        if (exempt is not null && InsideExempt(exempt, match.Index, match.Index + match.Length)) continue;
                        if (!seen.Add("r:" + entry.Term + ":" + match.Value.ToLowerInvariant())) continue;
                        var because = entry.Reason is null ? "" : $"; {entry.Reason}";
                        add(relative, index + 1, "GLOSSARY_REJECTED_SYNONYM",
                            $"'{match.Value}' is a rejected synonym here; the term is '{entry.Term}'{because}");
                    }
                }
            }
        }
    }

    // A word is matched on its own, so `place` does not fire inside `placement` and
    // a rejection of `seat` leaves `seating-plan` alone. The boundary is built from
    // the term rather than taken from `\b`, because a term can carry a hyphen.
    static Regex TermPattern(string term)
    {
        var escaped = new StringBuilder(term.Length);

        foreach (var character in term)
        {
            if (RegexMetacharacters.Contains(character)) escaped.Append('\\');
            escaped.Append(character);
        }

        return new Regex($"(?<![A-Za-z0-9-]){escaped}(?:'s|s'|s|es)?(?![A-Za-z0-9-])", LanguageOptions);
    }

    static Regex? ScopePattern(string? scope)
    {
        if (string.IsNullOrEmpty(scope)) return null;

        try
        {
            return new Regex(scope, RegexOptions.Compiled);
        }
        catch (ArgumentException)
        {
            return null;
        }
    }

    // One alternation over literal words with the same matching options as the
    // term patterns, so a gate that misses proves no term occurs in the text.
    static Regex GatePattern(IEnumerable<string> words) =>
        new($"(?:{string.Join("|", words.Select(word => Regex.Escape(word)))})", LanguageOptions);

    // Whether a term carries a word a gate can hold: a non-empty run between
    // spaces. A term of spaces alone, or the empty term, disables every gate.
    static bool HasWord(string term)
    {
        foreach (var character in term)
        {
            if (character != ' ') return true;
        }

        return false;
    }

    // The first run of non-space characters. Called only for terms HasWord accepts.
    static string FirstWord(string term)
    {
        var start = 0;

        while (start < term.Length && term[start] == ' ') start++;

        var end = start;

        while (end < term.Length && term[end] != ' ') end++;

        return term[start..end];
    }

    // Blanks the cells that sit under a rejection column, keeping every other
    // character in place so a reported offset still maps to its own line.
    static string BlankRejectionColumns(string text)
    {
        var lines = text.Split('\n');
        HashSet<int>? columns = null;

        for (var index = 0; index < lines.Length; index++)
        {
            var line = lines[index];
            if (!TableRow.IsMatch(line)) { columns = null; continue; }
            var cells = line.Split('|');
            if (RejectionTableSeparator.IsMatch(line)) continue;

            if (columns is null)
            {
                columns = [];
                var reasons = new HashSet<int>();

                for (var cell = 0; cell < cells.Length; cell++)
                {
                    if (RejectionColumn.IsMatch(cells[cell])) columns.Add(cell);
                    else if (RejectionReasonColumn.IsMatch(cells[cell])) reasons.Add(cell);
                }

                if (columns.Count > 0) foreach (var cell in reasons) columns.Add(cell);
                continue;
            }

            if (columns.Count == 0) continue;
            foreach (var cell in columns) if (cell < cells.Length) cells[cell] = new string(' ', cells[cell].Length);
            lines[index] = string.Join('|', cells);
        }

        return string.Join('\n', lines);
    }

    // A metadata block is machine content and an owner name is not prose, so the
    // scan starts after the block. A fenced block is code, a generated region is
    // builder output, and a link destination is a path rather than a sentence.
    static string ScannableProse(string raw)
    {
        var text = BlankGeneratedRegions(BlankMetadata(raw));
        text = FenceBlock.Replace(text, BlankKeepingLines);
        text = InlineCodeSpan.Replace(text, match => new string(' ', match.Length));
        text = LinkDestination.Replace(text, match => new string(' ', match.Length));
        return BlankRejectionColumns(text);
    }

    // The offset each line starts at: offset 0 and every offset after a newline.
    // Built once per page that reports, so each finding maps to its line with a
    // binary search instead of a scan from the start of the file.
    static int[] LineStarts(string text)
    {
        var starts = new List<int> { 0 };

        for (var offset = 0; offset < text.Length; offset++)
        {
            if (text[offset] == '\n') starts.Add(offset + 1);
        }

        return starts.ToArray();
    }

    // The 1-based line holding the offset: the count of starts at or before it.
    static int LineNumber(int[] starts, int index)
    {
        var found = Array.BinarySearch(starts, index);
        return found >= 0 ? found + 1 : ~found;
    }

    // Locates every compound in which a rejected word names a different concept.
    // `uniqueness reservation` is a row in a registry and a `reservation` is a
    // checkout hold, so the word inside the compound is not the word the rejection
    // is about. Returns the span each compound occupies, which is what the caller
    // tests a match against.
    static List<(int From, int To)> ExemptSpans(string text, IReadOnlyList<Regex> patterns)
    {
        var spans = new List<(int From, int To)>();

        foreach (var pattern in patterns)
        {
            foreach (Match match in pattern.Matches(text))
            {
                spans.Add((match.Index, match.Index + match.Length));
            }
        }

        return spans;
    }

    // True when a match sits wholly inside one exempt compound. Containment rather
    // than overlap, because a compound that merely touches the match is a different
    // phrase that happens to end where this one starts.
    static bool InsideExempt(List<(int From, int To)> spans, int start, int end)
    {
        return spans.Any(span => start >= span.From && end <= span.To);
    }

    // Turns `SellerOrderId`, `seller_order_id` and `seller-order-id` into separate
    // words so a whole-word pattern reaches the word inside a name. Run as the
    // second of two passes, never the only one, because it also separates the two
    // halves of a hyphenated phrase the first pass needs intact.
    static string OpenIdentifiers(string line)
    {
        line = CamelBoundary.Replace(line, "$1 $2");
        line = AcronymBoundary.Replace(line, "$1 $2");
        return IdentifierSeparator.Replace(line, " ");
    }

    static string? LanguageString(JsonNode? node)
    {
        return node is JsonValue value && value.TryGetValue<string>(out var text) ? text : null;
    }

    // Renders a language field for a diagnostic: strings read as themselves, a missing field reads as undefined, and other values render in their JSON form.
    static string LanguageText(JsonNode? node)
    {
        return LanguageString(node) ?? (node is null ? "undefined" : node.ToString());
    }

    // An absent or empty reason adds no suffix to the diagnostic.
    static string? LanguageReason(JsonNode? node)
    {
        var reason = LanguageString(node);
        return string.IsNullOrEmpty(reason) ? null : reason;
    }

    static IReadOnlyList<Regex> ExceptPatterns(JsonNode? node)
    {
        if (node is not JsonArray array) return [];
        var patterns = new List<Regex>();

        foreach (var item in array)
        {
            if (LanguageString(item) is string compound) patterns.Add(TermPattern(compound));
        }

        return patterns;
    }
}

/// <summary>
///     A glossary compiled once so a scan over many files does not rebuild every pattern per file.
/// </summary>
sealed class CompiledLanguage
{
    /// <summary>
    ///     A mannered term with its literal replacement and its matcher.
    /// </summary>
    /// <param name="Term">The metaphor or stock phrase.</param>
    /// <param name="Instead">The literal replacement named in the diagnostic.</param>
    /// <param name="Pattern">The whole-word matcher.</param>
    internal sealed record ManneredTerm(string Term, string Instead, Regex Pattern);

    /// <summary>
    ///     A rejected synonym with its scope, reason, compound exemptions and matcher.
    /// </summary>
    /// <param name="Term">The one word the project uses for the concept.</param>
    /// <param name="Synonym">The rejected word.</param>
    /// <param name="Scope">The path scope, or null for every page.</param>
    /// <param name="Reason">Why the synonym is rejected, or null for no suffix.</param>
    /// <param name="Except">The compounds in which the word names a different concept.</param>
    /// <param name="Pattern">The whole-word matcher.</param>
    internal sealed record RejectedSynonym(string Term, string Synonym, Regex? Scope, string? Reason, IReadOnlyList<Regex> Except, Regex Pattern);

    /// <summary>
    ///     The mannered terms in record order.
    /// </summary>
    internal IReadOnlyList<ManneredTerm> ManneredTerms { get; }

    /// <summary>
    ///     The rejected synonyms in record order.
    /// </summary>
    internal IReadOnlyList<RejectedSynonym> RejectedTerms { get; }

    /// <summary>
    ///     Whether the gates below are sound for this glossary: every term carries a
    ///     word a gate can hold. Otherwise the scans run without them.
    /// </summary>
    internal bool CanGate { get; }

    /// <summary>
    ///     Matches raw text holding any single-word term or any multi-word term's
    ///     first word, or null when the glossary holds no word.
    /// </summary>
    internal Regex? FileGate { get; }

    /// <summary>
    ///     Matches text holding any whole term, or null when the glossary holds no word.
    /// </summary>
    internal Regex? LineGate { get; }

    /// <summary>
    ///     Matches text holding any multi-word term's first word, or null when no
    ///     term holds a space.
    /// </summary>
    internal Regex? FirstWordGate { get; }

    /// <summary>
    ///     Compiles the record from its entries and its gates.
    /// </summary>
    internal CompiledLanguage(
        IReadOnlyList<ManneredTerm> mannered,
        IReadOnlyList<RejectedSynonym> rejected,
        bool canGate,
        Regex? fileGate,
        Regex? lineGate,
        Regex? firstWordGate)
    {
        ManneredTerms = mannered;
        RejectedTerms = rejected;
        CanGate = canGate;
        FileGate = fileGate;
        LineGate = lineGate;
        FirstWordGate = firstWordGate;
    }
}
