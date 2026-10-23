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
                var filter = term.Contains(' ') ? FirstWord(term) : term;
                mannered.Add(new CompiledLanguage.ManneredTerm(term, LanguageText(entry["instead"]), TermPattern(term), filter, IsAscii(filter), IsAscii(term)));
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
                    var filter = word.Contains(' ') ? FirstWord(word) : word;
                    rejected.Add(new CompiledLanguage.RejectedSynonym(
                        LanguageText(entry["term"]),
                        word,
                        ScopePattern(LanguageString(synonym["scope"]) ?? termScope),
                        LanguageReason(synonym["reason"]),
                        except,
                        TermPattern(word),
                        filter,
                        IsAscii(filter),
                        IsAscii(word)));
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
        // once per file instead of once per line. Distinct scope patterns run once
        // per file; the terms stay in record order so findings keep their order.
        var scopeHits = new Dictionary<string, bool>(StringComparer.Ordinal);
        var inScope = new List<CompiledLanguage.RejectedSynonym>(compiled.RejectedTerms.Count);

        foreach (var entry in compiled.RejectedTerms)
        {
            if (entry.Scope is null)
            {
                inScope.Add(entry);
                continue;
            }

            var pattern = entry.Scope.ToString();

            if (!scopeHits.TryGetValue(pattern, out var hit))
            {
                hit = entry.Scope.IsMatch(relative);
                scopeHits[pattern] = hit;
            }

            if (hit)
            {
                inScope.Add(entry);
            }
        }

        // A file holding none of the words holds no finding: every match contains
        // its term, and an opened match contains the term's first word in the raw
        // text.
        if (compiled.CanGate && (compiled.FileGate is null || !compiled.FileGate.IsMatch(raw)))
        {
            return;
        }

        // A file without a term's filter holds no match for that term: the filter
        // is the term itself for a single word and the first word for a phrase,
        // which an opened match still carries in the raw text. The per-term loops
        // below then run only for the terms this file can report.
        var manneredCandidates = new List<CompiledLanguage.ManneredTerm>(compiled.ManneredTerms.Count);

        foreach (var entry in compiled.ManneredTerms)
        {
            if (!entry.FileFilterIsAscii || raw.IndexOf(entry.FileFilter, StringComparison.OrdinalIgnoreCase) >= 0)
            {
                manneredCandidates.Add(entry);
            }
        }

        var rejectedCandidates = new List<CompiledLanguage.RejectedSynonym>(inScope.Count);

        foreach (var entry in inScope)
        {
            if (!entry.FileFilterIsAscii || raw.IndexOf(entry.FileFilter, StringComparison.OrdinalIgnoreCase) >= 0)
            {
                rejectedCandidates.Add(entry);
            }
        }

        if (manneredCandidates.Count == 0 && rejectedCandidates.Count == 0)
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
                foreach (var entry in manneredCandidates)
                {
                    if (entry.TermIsAscii && text.IndexOf(entry.Term, StringComparison.OrdinalIgnoreCase) < 0)
                    {
                        continue;
                    }

                    foreach (Match match in entry.Pattern.Matches(text))
                    {
                        if (!seen.Add("m:" + match.Value.ToLowerInvariant())) continue;
                        add(relative, index + 1, "GLOSSARY_MANNERED_TERM",
                            $"'{match.Value}' is mannered prose; state it literally, such as '{entry.Instead}'");
                    }
                }

                foreach (var entry in rejectedCandidates)
                {
                    if (entry.TermIsAscii && text.IndexOf(entry.Synonym, StringComparison.OrdinalIgnoreCase) < 0)
                    {
                        continue;
                    }

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

    // Whether a prefilter may use an ordinal case-insensitive search for the text:
    // ASCII folds the same under every comparison, while other scripts stay on the
    // regex so no finding is lost to a folding difference.
    static bool IsAscii(string text)
    {
        foreach (var character in text)
        {
            if (character > 127)
            {
                return false;
            }
        }

        return true;
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
    // halves of a hyphenated phrase the first pass needs intact. The three passes
    // below match the three expressions they replace character for character, but
    // scan once each without the expression engine: this runs on every kept line
    // of every scanned source file.
    static string OpenIdentifiers(string line)
    {
        var hasUpperOrSeparator = false;

        for (var scan = 0; scan < line.Length; scan++)
        {
            var character = line[scan];

            if ((character >= 'A' && character <= 'Z') || character == '_' || character == '.' || character == '/')
            {
                hasUpperOrSeparator = true;
                break;
            }
        }

        if (!hasUpperOrSeparator)
        {
            return line;
        }

        var camel = OpenCamelBoundary(line);
        var acronym = OpenAcronymBoundary(camel);

        var hasSeparator = false;

        for (var scan = 0; scan < acronym.Length; scan++)
        {
            var character = acronym[scan];

            if (character == '_' || character == '.' || character == '/')
            {
                hasSeparator = true;
                break;
            }
        }

        if (!hasSeparator)
        {
            return acronym;
        }

        var chars = acronym.ToCharArray();

        for (var index = 0; index < chars.Length; index++)
        {
            if (chars[index] == '_' || chars[index] == '.' || chars[index] == '/')
            {
                chars[index] = ' ';
            }
        }

        return new string(chars);
    }

    // Inserts a space between a lower-case letter or digit and an upper-case
    // letter, exactly as `([a-z0-9])([A-Z])` replaced with `$1 $2`.
    static string OpenCamelBoundary(string text)
    {
        var boundary = -1;

        for (var index = 1; index < text.Length; index++)
        {
            var previous = text[index - 1];
            var current = text[index];

            if ((previous >= 'a' && previous <= 'z' || previous >= '0' && previous <= '9')
                && current >= 'A' && current <= 'Z')
            {
                boundary = index;
                break;
            }
        }

        if (boundary < 0)
        {
            return text;
        }

        var grown = new StringBuilder(text.Length + 8);

        for (var index = 0; index < boundary; index++)
        {
            grown.Append(text[index]);
        }

        for (var index = boundary; index < text.Length; index++)
        {
            var previous = text[index - 1];
            var current = text[index];

            if ((previous >= 'a' && previous <= 'z' || previous >= '0' && previous <= '9')
                && current >= 'A' && current <= 'Z')
            {
                grown.Append(' ');
            }

            grown.Append(current);
        }

        return grown.ToString();
    }

    // Inserts a space before the last upper-case letter of a run of two or more
    // that a lower-case letter follows, exactly as `([A-Z]+)([A-Z][a-z])`
    // replaced with `$1 $2`: `HTMLParser` opens to `HTML Parser`.
    static string OpenAcronymBoundary(string text)
    {
        var split = -1;

        for (var index = 0; index < text.Length; index++)
        {
            if (text[index] < 'A' || text[index] > 'Z')
            {
                continue;
            }

            var runEnd = index;

            while (runEnd + 1 < text.Length && text[runEnd + 1] >= 'A' && text[runEnd + 1] <= 'Z')
            {
                runEnd++;
            }

            if (runEnd - index + 1 >= 2
                && runEnd + 1 < text.Length
                && text[runEnd + 1] >= 'a' && text[runEnd + 1] <= 'z')
            {
                split = runEnd;
                break;
            }

            index = runEnd;
        }

        if (split < 0)
        {
            return text;
        }

        var grown = new StringBuilder(text.Length + 8);
        var cursor = 0;

        while (cursor < text.Length)
        {
            if (text[cursor] < 'A' || text[cursor] > 'Z')
            {
                grown.Append(text[cursor]);
                cursor++;
                continue;
            }

            var runEnd = cursor;

            while (runEnd + 1 < text.Length && text[runEnd + 1] >= 'A' && text[runEnd + 1] <= 'Z')
            {
                runEnd++;
            }

            var breaks = runEnd - cursor + 1 >= 2
                && runEnd + 1 < text.Length
                && text[runEnd + 1] >= 'a' && text[runEnd + 1] <= 'z';

            for (var index = cursor; index <= runEnd; index++)
            {
                if (breaks && index == runEnd)
                {
                    grown.Append(' ');
                }

                grown.Append(text[index]);
            }

            cursor = runEnd + 1;
        }

        return grown.ToString();
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
    /// <param name="FileFilter">The term, or its first word when it holds a space: a file without it holds no match.</param>
    /// <param name="FileFilterIsAscii">Whether the file filter holds ASCII only, so an ordinal search prefilters it.</param>
    /// <param name="TermIsAscii">Whether the term holds ASCII only, so an ordinal search prefilters it.</param>
    internal sealed record ManneredTerm(string Term, string Instead, Regex Pattern, string FileFilter, bool FileFilterIsAscii, bool TermIsAscii);

    /// <summary>
    ///     A rejected synonym with its scope, reason, compound exemptions and matcher.
    /// </summary>
    /// <param name="Term">The one word the project uses for the concept.</param>
    /// <param name="Synonym">The rejected word.</param>
    /// <param name="Scope">The path scope, or null for every page.</param>
    /// <param name="Reason">Why the synonym is rejected, or null for no suffix.</param>
    /// <param name="Except">The compounds in which the word names a different concept.</param>
    /// <param name="Pattern">The whole-word matcher.</param>
    /// <param name="FileFilter">The synonym, or its first word when it holds a space: a file without it holds no match.</param>
    /// <param name="FileFilterIsAscii">Whether the file filter holds ASCII only, so an ordinal search prefilters it.</param>
    /// <param name="TermIsAscii">Whether the synonym holds ASCII only, so an ordinal search prefilters it.</param>
    internal sealed record RejectedSynonym(string Term, string Synonym, Regex? Scope, string? Reason, IReadOnlyList<Regex> Except, Regex Pattern, string FileFilter, bool FileFilterIsAscii, bool TermIsAscii);

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
